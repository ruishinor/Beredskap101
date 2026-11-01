import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { AlertTriangle, Download, FileText, FolderOpen, PlusCircle, Search, ShieldAlert, Trash2, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { VaultDocument, VaultDocumentAttachment, VaultDocumentCategory } from '../types/offline';
import { formatOsloDateTime } from '../utils/dateTime';
import type { ThemeType } from '../types';
import {
  buildFullLocalDataExportBundle,
  deleteVaultDocument,
  downloadFullLocalDataExport,
  eraseAllLocalAppData,
  loadVaultDocuments,
  saveVaultDocuments,
  validateVaultDocuments,
  upsertVaultDocument,
} from '../utils/saveSystem';

const MAX_ATTACHMENT_SIZE_BYTES = 6 * 1024 * 1024;
const MAX_VAULT_IMPORT_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_IMPORTED_DOCUMENTS = 300;

type DraftDocument = {
  title: string;
  category: VaultDocumentCategory;
  householdMember: string;
  source: string;
  reviewDate: string;
  sensitive: boolean;
  tags: string;
  note: string;
};

const DEFAULT_DRAFT: DraftDocument = {
  title: '',
  category: 'general-note',
  householdMember: '',
  source: '',
  reviewDate: '',
  sensitive: false,
  tags: '',
  note: '',
};

function formatDate(epochMs: number, locale: string): string {
  return formatOsloDateTime(epochMs, locale === 'nb-NO' ? 'nb-NO' : 'en-GB');
}

function parseTags(raw: string): string[] {
  return raw
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function uniqueById(documents: VaultDocument[]): VaultDocument[] {
  const map = new Map<string, VaultDocument>();
  for (const document of documents) {
    map.set(document.id, document);
  }
  return Array.from(map.values()).sort((a, b) => b.updatedAt - a.updatedAt);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function hasOversizedImportedAttachment(document: unknown): boolean {
  if (!isRecord(document) || !isRecord(document.attachment)) return false;
  const sizeBytes = Number(document.attachment.sizeBytes);
  if (Number.isFinite(sizeBytes) && sizeBytes > MAX_ATTACHMENT_SIZE_BYTES) return true;
  const dataUrl = document.attachment.dataUrl;
  return typeof dataUrl === 'string' && dataUrl.length > MAX_ATTACHMENT_SIZE_BYTES * 1.5;
}

function categoryLabel(category: VaultDocumentCategory, currentLang: 'en' | 'no'): string {
  const labels: Record<VaultDocumentCategory, { en: string; no: string }> = {
    'emergency-plan': { en: 'Emergency plan', no: 'Beredskapsplan' },
    'pdf-reference': { en: 'PDF reference', no: 'PDF-referanse' },
    'contact-plan': { en: 'Contact plan', no: 'Kontaktplan' },
    'medication-list': { en: 'Medication list', no: 'Medisinliste' },
    'evacuation-note': { en: 'Evacuation note', no: 'Evakueringsnotat' },
    'general-note': { en: 'General note', no: 'Generelt notat' },
  };
  return labels[category][currentLang];
}

export default function LocalDocumentVault({ theme }: { theme: ThemeType }) {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language || 'en') === 'no' ? 'no' : 'en';

  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [draft, setDraft] = useState<DraftDocument>(DEFAULT_DRAFT);
  const [attachment, setAttachment] = useState<VaultDocumentAttachment | undefined>(undefined);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | VaultDocumentCategory>('all');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const styles = {
    cardBg: theme !== 'light' ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-white border-slate-200 text-slate-800',
    titleText: theme !== 'light' ? 'text-[var(--accent)] font-mono' : 'text-slate-900 font-display',
    bodyText: theme !== 'light' ? 'text-neutral-300 font-mono' : 'text-slate-600 font-sans',
    btnPrimary: theme !== 'light' ? 'bg-[var(--accent-solid)] text-[var(--accent-on-solid)] hover:brightness-105' : 'bg-[var(--accent-solid)] text-[var(--accent-on-solid)] hover:brightness-105',
    btnSecondary: theme !== 'light' ? 'bg-neutral-950 text-neutral-300 border-neutral-700 hover:border-neutral-500' : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400',
    inputField: theme !== 'light' ? 'bg-black border-neutral-700 text-[var(--accent)] placeholder:text-neutral-500' : 'bg-slate-50 border-slate-300 text-slate-800 placeholder:text-slate-400',
    warningBox: theme !== 'light' ? 'bg-red-950/20 border-red-500/40 text-red-300' : 'bg-amber-50 border-amber-300 text-amber-900',
  };

  const refreshDocuments = async () => {
    const loaded = await loadVaultDocuments();
    setDocuments(uniqueById(loaded));
  };

  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        const loaded = await loadVaultDocuments();
        if (!canceled) {
          setDocuments(uniqueById(loaded));
        }
      } finally {
        if (!canceled) setLoading(false);
      }
    })();

    return () => {
      canceled = true;
    };
  }, []);

  const filteredDocuments = useMemo(() => {
    const q = query.trim().toLowerCase();
    return documents.filter((document) => {
      if (categoryFilter !== 'all' && document.category !== categoryFilter) return false;
      if (!q) return true;
      const haystack = [
        document.title,
        document.note,
        document.householdMember,
        document.source,
        document.tags.join(' '),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [categoryFilter, documents, query]);

  const sensitiveCount = useMemo(() => documents.filter((document) => document.sensitive).length, [documents]);

  const setDraftField = <K extends keyof DraftDocument>(field: K, value: DraftDocument[K]) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const showStatus = (type: 'success' | 'error' | 'info', text: string) => {
    setStatus({ type, text });
    window.setTimeout(() => setStatus(null), 5000);
  };

  const handleAttachmentSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
      showStatus(
        'error',
        currentLang === 'no'
          ? 'Vedlegg er for stort. Maksimal st\u00f8rrelse er 6 MB.'
          : 'Attachment is too large. Maximum size is 6 MB.'
      );
      return;
    }

    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        if (typeof reader.result === 'string') resolve(reader.result);
        else reject(new Error('Invalid file payload.'));
      };
      reader.onerror = () => reject(reader.error || new Error('Failed to read file.'));
      reader.readAsDataURL(file);
    }).catch(() => '');

    if (!dataUrl) {
      showStatus(
        'error',
        currentLang === 'no' ? 'Kunne ikke lese filen.' : 'Could not read the selected file.'
      );
      return;
    }

    setAttachment({
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      dataUrl,
    });
  };

  const resetDraft = () => {
    setDraft(DEFAULT_DRAFT);
    setAttachment(undefined);
  };

  const handleAddDocument = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!draft.title.trim()) {
      showStatus('error', currentLang === 'no' ? 'Tittel er påkrevd.' : 'Title is required.');
      return;
    }
    if (!draft.note.trim() && !attachment) {
      showStatus(
        'error',
        currentLang === 'no'
          ? 'Legg inn notattekst eller vedlegg f\u00f8r lagring.'
          : 'Add note text or an attachment before saving.'
      );
      return;
    }

    const now = Date.now();
    const nextDocument: VaultDocument = {
      id: `vault-${now}-${Math.random().toString(36).slice(2, 8)}`,
      title: draft.title.trim(),
      category: draft.category,
      householdMember: draft.householdMember.trim(),
      source: draft.source.trim(),
      reviewDate: draft.reviewDate,
      sensitive: draft.sensitive,
      tags: parseTags(draft.tags),
      note: draft.note.trim(),
      attachment,
      createdAt: now,
      updatedAt: now,
    };

    const saved = await upsertVaultDocument(nextDocument);
    if (!saved) {
      showStatus('error', currentLang === 'no' ? 'Lagring feilet.' : 'Saving failed.');
      return;
    }

    await refreshDocuments();
    resetDraft();
    showStatus('success', currentLang === 'no' ? 'Dokument lagret lokalt.' : 'Document saved locally.');
  };

  const handleDeleteDocument = async (documentId: string) => {
    const message =
      currentLang === 'no'
        ? 'Er du sikker på at du vil slette dette dokumentet lokalt?'
        : 'Are you sure you want to delete this local document?';
    if (!window.confirm(message)) return;
    await deleteVaultDocument(documentId);
    await refreshDocuments();
    showStatus('success', currentLang === 'no' ? 'Dokument slettet.' : 'Document deleted.');
  };

  const handleExportVault = () => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      documents,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `beredskap101-local-vault-${Date.now()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    showStatus('success', currentLang === 'no' ? 'Vault eksportert.' : 'Vault exported.');
  };

  const handleExportAllLocalData = async () => {
    const bundle = await buildFullLocalDataExportBundle();
    downloadFullLocalDataExport(bundle);
    showStatus(
      'success',
      currentLang === 'no'
        ? 'Full lokal dataeksport lastet ned (Artikkel 20).'
        : 'Full local data export downloaded (Article 20).'
    );
  };

  const handleImportVaultClick = () => {
    importInputRef.current?.click();
  };

  const handleImportVaultFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      if (file.size > MAX_VAULT_IMPORT_SIZE_BYTES) {
        throw new Error('Import file too large');
      }
      const text = await file.text();
      const parsed = JSON.parse(text) as { documents?: unknown[] };
      if (!Array.isArray(parsed.documents)) throw new Error('Invalid document payload');
      if (parsed.documents.length > MAX_IMPORTED_DOCUMENTS) throw new Error('Too many imported documents');
      if (parsed.documents.some((document) => hasOversizedImportedAttachment(document))) {
        throw new Error('Imported attachment too large');
      }
      const imported = validateVaultDocuments(parsed.documents);
      if (!imported) throw new Error('Invalid document fields');
      const merged = uniqueById([...documents, ...imported]);
      if (!(await saveVaultDocuments(merged))) throw new Error('Document storage failed');
      await refreshDocuments();
      showStatus(
        'success',
        currentLang === 'no'
          ? `Import fullf\u00f8rt (${parsed.documents.length} dokumenter).`
          : `Import complete (${parsed.documents.length} documents).`
      );
    } catch {
      showStatus(
        'error',
        currentLang === 'no' ? 'Ugyldig vault-fil. Import avbrutt.' : 'Invalid vault file. Import aborted.'
      );
    }
  };

  const handleClearVault = async () => {
    const message =
      currentLang === 'no'
        ? 'Slette alle lokale Beredskap101-data på denne enheten? Dette fjerner vault, sjekklister, notater, AI-innstillinger, cookievalg og app-cacher. Dette kan ikke angres.'
        : 'Delete all local Beredskap101 data on this device? This removes vault, checklists, notes, AI settings, cookie preferences, and app caches. This cannot be undone.';
    if (!window.confirm(message)) return;
    const result = await eraseAllLocalAppData();
    await refreshDocuments();
    const completelyErased = result.indexedDbCleared && result.localStorageKeysFailed.length === 0 && result.cacheNamesFailed.length === 0;
    showStatus(
      completelyErased ? 'success' : 'error',
      currentLang === 'no'
        ? `${completelyErased ? 'Lokal sletting fullført' : 'Delvis sletting; kontroller dataene før du går videre'}. Nøkler: ${result.localStorageKeysRemoved.length}, cacher: ${result.cacheNamesRemoved.length}.`
        : `${completelyErased ? 'Local erasure complete' : 'Partial erasure; review remaining data before continuing'}. Keys: ${result.localStorageKeysRemoved.length}, caches: ${result.cacheNamesRemoved.length}.`
    );
    if (completelyErased) window.setTimeout(() => window.location.reload(), 1200);
  };

  return (
    <div className="space-y-6" id="local-document-vault">
      <section className={`p-5 rounded-xl border-2 ${styles.warningBox}`}>
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-bold">
              {currentLang === 'no' ? 'Sensitivt innhold lagres kun lokalt' : 'Sensitive data stays local only'}
            </p>
            <p className="text-xs leading-relaxed">
              {currentLang === 'no'
                ? 'Denne enheten kan inneholde sensitive beredskapsnotater. Bruk passord på enheten, unngå delte profiler, og bruk manuell eksport/sletting ved behov.'
                : 'This device may contain sensitive preparedness notes. Use device lock-screen protection, avoid shared profiles, and use manual export/deletion when needed.'}
            </p>
            <p className="text-xs leading-relaxed">
              {currentLang === 'no'
                ? 'Dokumentene er ikke kryptert i nettleserens lokale lagring. JSON-eksporten er også ukryptert.'
                : 'Documents are not encrypted in browser storage. JSON exports are also unencrypted.'}
            </p>
            <p className="text-xs leading-relaxed">
              {currentLang === 'no'
                ? `Lokale dokumenter: ${documents.length}. Sensitivt merket: ${sensitiveCount}.`
                : `Local documents: ${documents.length}. Marked sensitive: ${sensitiveCount}.`}
            </p>
          </div>
        </div>
      </section>

      <section className={`p-6 rounded-xl border-2 shadow-sm ${styles.cardBg}`}>
        <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${styles.titleText}`}>
          <PlusCircle className="w-5 h-5" />
          {currentLang === 'no' ? 'Legg til lokalt dokument' : 'Add local document'}
        </h3>

        <form onSubmit={handleAddDocument} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-mono uppercase tracking-widest opacity-70">
              {currentLang === 'no' ? 'Tittel' : 'Title'}
            </label>
            <input
              value={draft.title}
              onChange={(event) => setDraftField('title', event.target.value)}
              placeholder={currentLang === 'no' ? 'Eks: Evakueringsplan for blokk A' : 'Example: Evacuation plan for Block A'}
              className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm ${styles.inputField}`}
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-widest opacity-70">
              {currentLang === 'no' ? 'Kategori' : 'Category'}
            </label>
            <select
              value={draft.category}
              onChange={(event) => setDraftField('category', event.target.value as VaultDocumentCategory)}
              className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm ${styles.inputField}`}
            >
              <option value="emergency-plan">{categoryLabel('emergency-plan', currentLang)}</option>
              <option value="pdf-reference">{categoryLabel('pdf-reference', currentLang)}</option>
              <option value="contact-plan">{categoryLabel('contact-plan', currentLang)}</option>
              <option value="medication-list">{categoryLabel('medication-list', currentLang)}</option>
              <option value="evacuation-note">{categoryLabel('evacuation-note', currentLang)}</option>
              <option value="general-note">{categoryLabel('general-note', currentLang)}</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-widest opacity-70">
              {currentLang === 'no' ? 'Husstandsmedlem' : 'Household member'}
            </label>
            <input
              value={draft.householdMember}
              onChange={(event) => setDraftField('householdMember', event.target.value)}
              placeholder={currentLang === 'no' ? 'Eks: Hovedkontakt / Barn 1' : 'Example: Primary contact / Child 1'}
              className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm ${styles.inputField}`}
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-widest opacity-70">
              {currentLang === 'no' ? 'Kilde' : 'Source'}
            </label>
            <input
              value={draft.source}
              onChange={(event) => setDraftField('source', event.target.value)}
              placeholder={currentLang === 'no' ? 'Eks: DSB / egen plan' : 'Example: Civil defence / personal plan'}
              className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm ${styles.inputField}`}
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-widest opacity-70">
              {currentLang === 'no' ? 'Revisjonsdato' : 'Review date'}
            </label>
            <input
              type="date"
              value={draft.reviewDate}
              onChange={(event) => setDraftField('reviewDate', event.target.value)}
              className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm ${styles.inputField}`}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-mono uppercase tracking-widest opacity-70">
              {currentLang === 'no' ? 'Tagger (kommaseparert)' : 'Tags (comma separated)'}
            </label>
            <input
              value={draft.tags}
              onChange={(event) => setDraftField('tags', event.target.value)}
              placeholder={currentLang === 'no' ? 'eks: vann, insulin, møtested' : 'example: water, insulin, meeting point'}
              className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm ${styles.inputField}`}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-mono uppercase tracking-widest opacity-70">
              {currentLang === 'no' ? 'Notat' : 'Note'}
            </label>
            <textarea
              rows={4}
              value={draft.note}
              onChange={(event) => setDraftField('note', event.target.value)}
              placeholder={
                currentLang === 'no'
                  ? 'Skriv inn lokale notater for plan, kontaktpunkter, medisiner eller evakuering.'
                  : 'Write local notes for plans, contact points, medication, or evacuation.'
              }
              className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm resize-y ${styles.inputField}`}
            />
          </div>

          <div className="md:col-span-2 flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={draft.sensitive}
                onChange={(event) => setDraftField('sensitive', event.target.checked)}
              />
              {currentLang === 'no' ? 'Merk som sensitivt innhold' : 'Mark as sensitive content'}
            </label>

            <label className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold cursor-pointer ${styles.btnSecondary}`}>
              <Upload className="w-4 h-4" />
              {currentLang === 'no' ? 'Legg ved fil/PDF' : 'Attach file/PDF'}
              <input
                type="file"
                accept=".pdf,.txt,.md,.json,.jpg,.jpeg,.png,.webp"
                onChange={handleAttachmentSelect}
                className="hidden"
              />
            </label>

            {attachment && (
              <span className="text-xs">
                {attachment.fileName} ({Math.round(attachment.sizeBytes / 1024)} KB)
              </span>
            )}
          </div>

          <div className="md:col-span-2 flex flex-wrap gap-2">
            <button type="submit" className={`px-4 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wide cursor-pointer ${styles.btnPrimary}`}>
              {currentLang === 'no' ? 'Lagre lokalt' : 'Save locally'}
            </button>
            <button
              type="button"
              onClick={resetDraft}
              className={`px-4 py-2 rounded-lg text-xs font-bold border cursor-pointer ${styles.btnSecondary}`}
            >
              {currentLang === 'no' ? 'T\u00f8m skjema' : 'Clear form'}
            </button>
          </div>
        </form>
      </section>

      <section className={`p-6 rounded-xl border-2 shadow-sm ${styles.cardBg}`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
          <h3 className={`text-xl font-bold flex items-center gap-2 ${styles.titleText}`}>
            <FolderOpen className="w-5 h-5" />
            {currentLang === 'no' ? 'Lokal dokumentoversikt' : 'Local document overview'}
          </h3>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleExportVault} className={`px-3 py-2 rounded-lg border text-xs font-bold cursor-pointer ${styles.btnSecondary}`}>
              <Download className="w-3.5 h-3.5 inline mr-1" />
              {currentLang === 'no' ? 'Eksporter notater (JSON)' : 'Export notes (JSON)'}
            </button>
            <button type="button" onClick={handleExportAllLocalData} className={`px-3 py-2 rounded-lg border text-xs font-bold cursor-pointer ${styles.btnSecondary}`}>
              <Download className="w-3.5 h-3.5 inline mr-1" />
              {currentLang === 'no' ? 'Eksporter alt (Art. 20)' : 'Export all (Art. 20)'}
            </button>
            <button type="button" onClick={handleImportVaultClick} className={`px-3 py-2 rounded-lg border text-xs font-bold cursor-pointer ${styles.btnSecondary}`}>
              <Upload className="w-3.5 h-3.5 inline mr-1" />
              {currentLang === 'no' ? 'Importer notater' : 'Import notes'}
            </button>
            <button type="button" onClick={handleClearVault} className="px-3 py-2 rounded-lg border border-red-500 text-red-500 text-xs font-bold cursor-pointer hover:bg-red-500/10">
              <Trash2 className="w-3.5 h-3.5 inline mr-1" />
              {currentLang === 'no' ? 'Slett alle appdata (Art. 17)' : 'Delete all app data (Art. 17)'}
            </button>
            <input ref={importInputRef} type="file" accept=".json" className="hidden" onChange={handleImportVaultFile} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 mb-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 opacity-60" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={currentLang === 'no' ? 'S\u00f8k i tittel, notat, tags eller kilde...' : 'Search title, note, tags, or source...'}
              className={`w-full border rounded-lg pl-9 pr-3 py-2 text-sm ${styles.inputField}`}
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value as 'all' | VaultDocumentCategory)}
            className={`border rounded-lg px-3 py-2 text-sm ${styles.inputField}`}
          >
            <option value="all">{currentLang === 'no' ? 'Alle kategorier' : 'All categories'}</option>
            <option value="emergency-plan">{categoryLabel('emergency-plan', currentLang)}</option>
            <option value="pdf-reference">{categoryLabel('pdf-reference', currentLang)}</option>
            <option value="contact-plan">{categoryLabel('contact-plan', currentLang)}</option>
            <option value="medication-list">{categoryLabel('medication-list', currentLang)}</option>
            <option value="evacuation-note">{categoryLabel('evacuation-note', currentLang)}</option>
            <option value="general-note">{categoryLabel('general-note', currentLang)}</option>
          </select>
        </div>

        <div className="mb-4 rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-alt)] p-3 text-xs leading-relaxed opacity-85">
          {currentLang === 'no'
            ? 'Dette er lagret i denne nettleseren på denne enheten (IndexedDB med localStorage som reserve). Eksporter alt for Artikkel 20-portabilitet, eller slett alle appdata for Artikkel 17 lokal sletting. Ingen automatisk skylagring brukes.'
            : 'This is stored in this browser on this device (IndexedDB with localStorage fallback). Use Export all for Article 20 portability, or Delete all app data for Article 17 local erasure. No automatic cloud sync is used.'}
        </div>

        {status && (
          <div
            role={status.type === 'error' ? 'alert' : 'status'}
            className={`mb-4 rounded-lg border px-3 py-2 text-xs ${
              status.type === 'success'
                ? 'border-green-500/40 text-green-500'
                : status.type === 'error'
                  ? 'border-red-500/40 text-red-500'
                  : 'border-blue-500/40 text-blue-500'
            }`}
          >
            {status.text}
          </div>
        )}

        {loading && (
          <div className="text-sm opacity-75">
            {currentLang === 'no' ? 'Laster lokal vault...' : 'Loading local vault...'}
          </div>
        )}

        {!loading && filteredDocuments.length === 0 && (
          <div className="rounded-lg border border-dashed border-[var(--border)] p-4 text-sm opacity-75">
            {currentLang === 'no'
              ? 'Ingen dokumenter matcher filtrene. Legg til ditt f\u00f8rste lokale beredskapsnotat.'
              : 'No documents match the filters. Add your first local preparedness note.'}
          </div>
        )}

        <div className="space-y-3">
          {filteredDocuments.map((document) => (
            <article key={document.id} className="rounded-lg border border-[var(--border)] p-4 bg-[var(--bg-alt)]">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className={`text-base font-bold ${styles.titleText}`}>{document.title}</h4>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded border border-[var(--border)]">
                      {categoryLabel(document.category, currentLang)}
                    </span>
                    {document.sensitive && (
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded border border-red-500 text-red-500">
                        {currentLang === 'no' ? 'Sensitivt' : 'Sensitive'}
                      </span>
                    )}
                  </div>

                  <div className={`text-xs leading-relaxed ${styles.bodyText}`}>
                    <p>
                      {currentLang === 'no' ? 'Husstand' : 'Household'}: {document.householdMember || '-'} |{' '}
                      {currentLang === 'no' ? 'Kilde' : 'Source'}: {document.source || '-'}
                    </p>
                    <p>
                      {currentLang === 'no' ? 'Revisjonsdato' : 'Review date'}: {document.reviewDate || '-'} |{' '}
                      {currentLang === 'no' ? 'Oppdatert' : 'Updated'}: {formatDate(document.updatedAt, currentLang === 'no' ? 'nb-NO' : 'en-US')}
                    </p>
                  </div>

                  {document.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {document.tags.map((tag) => (
                        <span key={`${document.id}-${tag}`} className="text-[10px] px-2 py-0.5 rounded-full border border-[var(--border)]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {document.note && (
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                      {document.note}
                    </p>
                  )}

                  {document.attachment && (
                    <div className="flex items-center gap-2 text-xs">
                      <FileText className="w-4 h-4" />
                      <span>
                        {document.attachment.fileName} ({Math.round(document.attachment.sizeBytes / 1024)} KB)
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {document.attachment && (
                    <a
                      href={document.attachment.dataUrl}
                      download={document.attachment.fileName}
                      className={`px-3 py-2 rounded-lg border text-xs font-bold cursor-pointer ${styles.btnSecondary}`}
                    >
                      <Download className="w-3.5 h-3.5 inline mr-1" />
                      {currentLang === 'no' ? 'Last ned' : 'Download'}
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteDocument(document.id)}
                    className="px-3 py-2 rounded-lg border border-red-500 text-red-500 text-xs font-bold cursor-pointer hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                    {currentLang === 'no' ? 'Slett' : 'Delete'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className={`mt-4 p-3 rounded-lg border text-xs flex items-start gap-2 ${styles.warningBox}`}>
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            {currentLang === 'no'
              ? 'Eksport/import er manuell og lokal. Ingen automatisk skylagring brukes.'
              : 'Export/import is manual and local only. No automatic cloud sync is used.'}
          </span>
        </div>
      </section>
    </div>
  );
}
