/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  ListChecks,
  CheckSquare,
  ShieldCheck,
  BookOpen,
  BarChart3,
  ArrowLeft,
  Info,
  Calendar,
  AlertTriangle,
  Award,
  HelpCircle,
  HardDrive,
  Cpu,
  BookmarkCheck,
  CheckCircle2,
  Square,
  Printer,
  Download
} from 'lucide-react';
import { optimizeTitle } from '../utils/titleOptimizer';
import { localizeComplexity, localizeDistributionLabel } from '../utils/localizationHelper';

// Statically importing the 800KB processedAssets.json causes Vite chunk warnings.
// We pass the parsed asset from the parent component instead to allow dynamic lazy loading.

interface KeyElement {
  element: string;
  description: string;
}

interface ProcessedAsset {
  id: string;
  title: string;
  category: string;
  pillarId: string;
  metadata: {
    sourceFile: string;
    fileSizeKb: number;
  };
  keyElements: KeyElement[];
  sourceDerivedClaims?: string[];
  domainActions?: string[];
  validationNotes?: string[];
  humanReviewStatus?: string;
  article: {
    overview: string;
    centralKnowledge: string[];
    context: string;
    conclusion: string;
  };
  stats: {
    dataComplexity: string;
    readinessFactor: string;
    distribution: string[];
  };
  guide: {
    preparation: string[];
    execution: string[];
    evaluation: string[];
  };
  checklist: string[];
  protocol: {
    purpose: string;
    procedures: string[];
    requirements: string[];
  };
  courseModule: {
    moduleId: string;
    learningGoals: string[];
    theory: string;
    reflectionQuestions: string[];
  };
}

interface ExtendedAssetViewerProps {
  key?: string;
  assetId: string;
  asset?: ProcessedAsset;
  theme: 'dark' | 'light';
  onBack: () => void;
  currentLang: string;
  initialTab?: 'article' | 'guide' | 'checklist' | 'protocol' | 'module' | 'stats';
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default function ExtendedAssetViewer({
  assetId,
  asset,
  theme,
  onBack,
  currentLang,
  initialTab = 'article'
}: ExtendedAssetViewerProps) {
  const { t } = useTranslation();

  // Tab State
  const [activeTab, setActiveTab] = useState<'article' | 'guide' | 'checklist' | 'protocol' | 'module' | 'stats'>(initialTab);
  const [showModuleMetadata, setShowModuleMetadata] = useState<boolean>(false);

  useEffect(() => {
    setActiveTab(initialTab);
    setShowModuleMetadata(false);
  }, [assetId, initialTab]);

  const [checkedItems, setCheckedItems] = useState<string[]>(() => {
    try {
      const saved = window.localStorage.getItem(`beredskap_ext_check_${assetId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Ignore fallback
    }
    return [];
  });

  const [reflectionNotes, setReflectionNotes] = useState<Record<number, string>>(() => {
    try {
      const saved = window.localStorage.getItem(`beredskap_ext_notes_${assetId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Ignore fallback
    }
    return {};
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(`beredskap_ext_check_${assetId}`, JSON.stringify(checkedItems));
    } catch (e) {
      console.warn('Could not save checklist state', e);
    }
  }, [checkedItems, assetId]);

  useEffect(() => {
    try {
      window.localStorage.setItem(`beredskap_ext_notes_${assetId}`, JSON.stringify(reflectionNotes));
    } catch (e) {
      console.warn('Could not save reflection notes state', e);
    }
  }, [reflectionNotes, assetId]);

  if (!asset) {
    return (
      <div className="p-8 text-center bg-red-950/20 border border-red-500/20 rounded-xl">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2 animate-bounce" />
        <p className="font-mono text-sm">Asset not found: {assetId}</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-bold">
          {t('btn_back')}
        </button>
      </div>
    );
  }

  const evidenceCounts = {
    claims: asset.sourceDerivedClaims?.length || 0,
    actions: asset.domainActions?.length || 0,
    notes: asset.validationNotes?.length || 0,
  };
  const hasEvidenceFields = evidenceCounts.claims > 0 || evidenceCounts.actions > 0 || evidenceCounts.notes > 0 || Boolean(asset.humanReviewStatus);
  const reviewStatusLabel = asset.humanReviewStatus
    ? asset.humanReviewStatus.replace(/[-_]+/g, ' ')
    : currentLang === 'no'
      ? 'Ikke vurdert'
      : 'Not assessed';

  const toggleCheckItem = (itemIndex: number) => {
    const itemStr = itemIndex.toString();
    setCheckedItems(prev =>
      prev.includes(itemStr) ? prev.filter(i => i !== itemStr) : [...prev, itemStr]
    );
  };

  const handleNoteChange = (qIndex: number, text: string) => {
    setReflectionNotes(prev => ({
      ...prev,
      [qIndex]: text
    }));
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const titleOptimized = optimizeTitle(asset.title, currentLang);
    const safeTitle = escapeHtml(titleOptimized);
    const safePillarName = escapeHtml(getPillarName(asset.pillarId).toUpperCase());
    const safeSourceFile = escapeHtml(asset.metadata.sourceFile);
    const safeOverview = escapeHtml(asset.article.overview);
    const safeCentralKnowledge = asset.article.centralKnowledge.map((item) => escapeHtml(item));
    const safeChecklist = asset.checklist.map((item) => escapeHtml(item));
    const notesText = Object.entries(reflectionNotes)
      .map(([idx, note]) => `Refleksjon ${Number(idx) + 1}: ${asset.courseModule.reflectionQuestions[Number(idx)] || ''}\nSvar: ${note}`)
      .join('\n\n');
    const safeNotesText = escapeHtml(notesText || 'Ingen notater lagret.');

    const html = `
      <html>
        <head>
          <title>Beredskap101 - ${safeTitle}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; line-height: 1.6; color: #1e293b; max-width: 800px; margin: 0 auto; }
            h1 { color: #0f172a; border-bottom: 2px solid #cbd5e1; padding-bottom: 10px; font-size: 28px; }
            h2 { color: #334155; margin-top: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; font-size: 20px; }
            .meta { font-size: 13px; color: #64748b; margin-bottom: 20px; font-family: monospace; }
            .notes { background: #f8fafc; border-left: 4px solid #225c52; padding: 15px; white-space: pre-wrap; font-size: 14px; border-radius: 4px; }
            .checklist { list-style-type: none; padding-left: 0; }
            .checklist li { margin-bottom: 10px; font-size: 14px; display: flex; align-items: flex-start; gap: 10px; }
            .checkbox { width: 16px; height: 16px; border: 1px solid #94a3b8; display: inline-block; text-align: center; line-height: 14px; font-size: 12px; font-weight: bold; flex-shrink: 0; }
          </style>
        </head>
        <body>
          <h1>${safeTitle}</h1>
          <div class="meta">
            <strong>KATEGORI:</strong> ${safePillarName} <br/>
            <strong>KILDEFIL:</strong> ${safeSourceFile}
          </div>

          <h2>Oversikt</h2>
          <p>${safeOverview}</p>

          <h2>Sentral Kunnskap</h2>
          <ul>
            ${safeCentralKnowledge.map(k => `<li>${k}</li>`).join('')}
          </ul>

          <h2>Operasjonell Sjekkliste</h2>
          <ul class="checklist">
            ${safeChecklist.map((c, idx) => `
              <li>
                <span class="checkbox">${checkedItems.includes(idx.toString()) ? '?' : ' '}</span>
                <span>${c}</span>
              </li>
            `).join('')}
          </ul>

          <h2>Mine Notater & Refleksjon</h2>
          <div class="notes">${safeNotesText}</div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleExportNotes = () => {
    const titleOptimized = optimizeTitle(asset.title, currentLang);
    const notesText = Object.entries(reflectionNotes)
      .map(([idx, note]) => `Refleksjon ${Number(idx) + 1}: ${asset.courseModule.reflectionQuestions[Number(idx)] || ''}\nSvar: ${note}`)
      .join('\n\n');

    const content = `=========================================
BEREDSKAP101: ${titleOptimized.toUpperCase()}
=========================================
Kategori: ${getPillarName(asset.pillarId)}
Kilde: ${asset.metadata.sourceFile}
-----------------------------------------

OVERSIKT:
${asset.article.overview}

SENTRAL KUNNSKAP:
${asset.article.centralKnowledge.map(k => `- ${k}`).join('\n')}

OPERASJONELL SJEKKLISTE:
${asset.checklist.map((c, idx) => `[${checkedItems.includes(idx.toString()) ? 'X' : ' '}] ${c}`).join('\n')}

MINE REFLEKSJONSNOTATER:
${notesText || 'Ingen notater lagret.'}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `beredskap101_notater_${asset.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const completedChecklistCount = checkedItems.length;
  const totalChecklistCount = asset.checklist.length;
  const checklistProgressPercent = totalChecklistCount > 0 ? Math.round((completedChecklistCount / totalChecklistCount) * 100) : 0;

  // Visual Styling Mappings
  const styles = {
    cardBg: theme === 'dark' ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-slate-200',
    titleText: theme === 'dark' ? 'text-[var(--accent)] font-mono' : 'text-slate-900 font-display',
    bodyText: theme === 'dark' ? 'text-neutral-300 font-mono' : 'text-slate-600 font-sans',
    tabActive: theme === 'dark' ? 'bg-[var(--accent-solid)]/15 text-[var(--accent)] border-[var(--accent)] font-bold' : 'bg-teal-50 text-teal-900 border-teal-600 font-bold',
    tabInactive: theme === 'dark' ? 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100',
    badge: theme === 'dark' ? 'border-[var(--accent)]/20 bg-[var(--accent-solid)]/10 text-[var(--accent)]' : 'border-teal-500/20 bg-teal-500/5 text-teal-700',
    progressBar: theme === 'dark' ? 'bg-[var(--accent-solid)]' : 'bg-teal-600'
  };

  // Helper to map pillarId to friendly name
  const getPillarName = (pId: string) => {
    switch (pId) {
      case 'førstehjelp': return currentLang === 'no' ? 'Førstehjelp & Trauma' : 'First Aid & Trauma';
      case 'friluftsliv': return currentLang === 'no' ? 'Friluftsliv' : 'Wilderness Survival';
      case 'egensikkerhet': return currentLang === 'no' ? 'Egensikkerhet' : 'Personal Safety';
      case 'egenberedskap': return currentLang === 'no' ? 'Husholdning & Egenberedskap' : 'Household Preparedness';
      case 'personvern': return currentLang === 'no' ? 'Digitalt Personvern' : 'Digital Privacy';
      case 'reisesikkerhet': return currentLang === 'no' ? 'Reisesikkerhet' : 'Travel Security';
      default: return pId;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${styles.tabInactive}`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('btn_back')}</span>
          </button>
          <span className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border ${styles.badge}`}>
            {getPillarName(asset.pillarId)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            title={currentLang === 'no' ? 'Skriv ut oversikt og notater' : 'Print summary and notes'}
            className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${styles.tabInactive}`}
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">{currentLang === 'no' ? 'Skriv ut' : 'Print'}</span>
          </button>
          <button
            onClick={handleExportNotes}
            title={currentLang === 'no' ? 'Eksporter notater og sjekkliste' : 'Export notes and checklist'}
            className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${styles.tabInactive}`}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{currentLang === 'no' ? 'Lagre notater' : 'Save Notes'}</span>
          </button>
        </div>
      </div>

      {/* Asset Header Information */}
      <div className={`p-6 rounded-xl border ${styles.cardBg}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className={`text-2xl md:text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>
              {optimizeTitle(asset.title, currentLang)}
            </h2>
            <p className="text-[11px] font-mono text-[var(--muted)] mt-1.5 flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5" /> {t('lbl_source_file')}: {asset.metadata.sourceFile}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <span className={`px-3 py-1 rounded-md border ${theme === 'dark' ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-100 border-slate-200'}`}>
              Size: {asset.metadata.fileSizeKb.toFixed(2)} KB
            </span>
            <span className={`px-3 py-1 rounded-md border ${theme === 'dark' ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-100 border-slate-200'}`}>
              Assessment: {reviewStatusLabel}
            </span>
          </div>
        </div>
      </div>

      {/* 6 Section Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
        <button
          onClick={() => setActiveTab('article')}
          className={`px-4 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'article' ? styles.tabActive : styles.tabInactive
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t('tab_article')}</span>
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`px-4 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'guide' ? styles.tabActive : styles.tabInactive
          }`}
        >
          <ListChecks className="w-4 h-4" />
          <span>{t('tab_guide')}</span>
        </button>
        <button
          onClick={() => setActiveTab('checklist')}
          className={`px-4 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'checklist' ? styles.tabActive : styles.tabInactive
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>{t('tab_checklist')}</span>
        </button>
        <button
          onClick={() => setActiveTab('protocol')}
          className={`px-4 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'protocol' ? styles.tabActive : styles.tabInactive
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{t('tab_protocol')}</span>
        </button>
        <button
          onClick={() => setActiveTab('module')}
          className={`px-4 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'module' ? styles.tabActive : styles.tabInactive
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{t('tab_module')}</span>
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'stats' ? styles.tabActive : styles.tabInactive
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{t('tab_stats')}</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div key={activeTab} className={`p-6 rounded-xl border ${styles.cardBg} transition-colors duration-300 min-h-[300px] animate-fade-in`}>
        
        {/* TAB 1: KUNNSKAPSARTIKKEL */}
        {activeTab === 'article' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Overview</span>
              <p className={`text-sm md:text-base leading-relaxed ${theme === 'dark' ? 'text-neutral-200' : 'text-neutral-800'}`}>
                {asset.article.overview}
              </p>
            </div>

            {asset.article.centralKnowledge.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Central Knowledge</span>
                <ul className="space-y-2 text-xs md:text-sm">
                  {asset.article.centralKnowledge.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[var(--accent)] font-extrabold">&bull;</span>
                      <span className={theme === 'dark' ? 'text-neutral-300' : 'text-slate-800'}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {asset.keyElements.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">{t('lbl_key_elements')}</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {asset.keyElements.map((el, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-neutral-950/40 border-neutral-800/80' : 'bg-slate-50 border-slate-200'}`}>
                      <h4 className={`text-xs font-mono font-extrabold uppercase text-[var(--accent)] mb-1`}>{el.element}</h4>
                      <p className="text-xs leading-relaxed opacity-85">{el.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {asset.article.context && (
              <div className={`p-4 rounded-xl border-l-4 ${theme === 'dark' ? 'bg-neutral-950/20 border-[var(--accent)]/50' : 'bg-slate-50 border-teal-600/50'} text-xs leading-relaxed`}>
                <span className="font-bold block mb-1">Context & Background</span>
                <p className="opacity-80">{asset.article.context}</p>
              </div>
            )}

            {asset.article.conclusion && (
              <div className="border-t border-dashed border-[var(--border)] pt-4 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Conclusion</span>
                <p className="text-xs md:text-sm italic opacity-90">"{asset.article.conclusion}"</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INSTRUCTIONAL GUIDE */}
        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Preparation */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
                  <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${styles.badge}`}>
                    Prep Phase
                  </span>
                </div>
                {asset.guide.preparation.length === 0 ? (
                  <p className="text-xs text-[var(--muted)] font-mono italic">No steps recorded.</p>
                ) : (
                  <ol className="space-y-3 text-xs md:text-sm">
                    {asset.guide.preparation.map((step, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="font-mono font-bold text-[var(--accent)]">{idx + 1}.</span>
                        <span className="opacity-90">{step}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              {/* Execution */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
                  <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${styles.badge}`}>
                    Action Phase
                  </span>
                </div>
                {asset.guide.execution.length === 0 ? (
                  <p className="text-xs text-[var(--muted)] font-mono italic">No steps recorded.</p>
                ) : (
                  <ol className="space-y-3 text-xs md:text-sm">
                    {asset.guide.execution.map((step, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="font-mono font-bold text-[var(--accent)]">{idx + 1}.</span>
                        <span className="opacity-90">{step}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              {/* Evaluation */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
                  <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${styles.badge}`}>
                    Review Phase
                  </span>
                </div>
                {asset.guide.evaluation.length === 0 ? (
                  <p className="text-xs text-[var(--muted)] font-mono italic">No steps recorded.</p>
                ) : (
                  <ol className="space-y-3 text-xs md:text-sm">
                    {asset.guide.evaluation.map((step, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="font-mono font-bold text-[var(--accent)]">{idx + 1}.</span>
                        <span className="opacity-90">{step}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: OPERATIONAL CHECKLIST */}
        {activeTab === 'checklist' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Progress</span>
                <h4 className="text-sm font-extrabold">{completedChecklistCount} of {totalChecklistCount} checklist checkpoints completed</h4>
              </div>
              {totalChecklistCount > 0 && (
                <button
                  onClick={() => setCheckedItems([])}
                  className={`text-xs px-3 py-1.5 rounded border font-mono transition-all cursor-pointer ${styles.tabInactive}`}
                >
                  Reset Checklist
                </button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-2 rounded-full overflow-hidden bg-neutral-950 border border-neutral-800">
                <div
                  className={`h-full transition-all duration-300 ${styles.progressBar}`}
                  style={{ width: `${checklistProgressPercent}%` }}
                />
              </div>
              <div className="text-[10px] font-mono text-right opacity-65">{checklistProgressPercent}%</div>
            </div>

            {/* Checklist items */}
            {totalChecklistCount === 0 ? (
              <p className="text-center font-mono text-xs py-8 text-[var(--muted)]">No checkpoints defined for this module.</p>
            ) : (
              <div className="space-y-2">
                {asset.checklist.map((item, idx) => {
                  const isChecked = checkedItems.includes(idx.toString());
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleCheckItem(idx)}
                      className={`flex items-start gap-3.5 p-3.5 rounded-lg border cursor-pointer select-none transition-all duration-150 group ${
                        isChecked
                          ? theme === 'dark'
                            ? 'bg-[var(--accent-solid)]/10 border-[var(--accent)]/30'
                            : 'bg-teal-50/40 border-teal-500/30 text-slate-500 line-through opacity-85'
                          : theme === 'dark'
                          ? 'bg-neutral-950/20 hover:bg-neutral-950/40 border-neutral-800 hover:border-neutral-700'
                          : 'bg-slate-50/20 hover:bg-slate-50/80 border-slate-200'
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5 text-[var(--accent)] group-hover:scale-105 transition-transform">
                        {isChecked ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5 text-neutral-500" />
                        )}
                      </div>
                      <p className={`text-sm leading-snug font-medium transition-colors ${
                        isChecked ? 'opacity-80' : theme === 'dark' ? 'text-neutral-200 group-hover:text-white' : 'text-slate-800 group-hover:text-slate-950'
                      } ${theme !== 'dark' && !isChecked ? '!text-neutral-800' : ''}`}>
                        {item}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TESTING PROTOCOL */}
        {activeTab === 'protocol' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Test Purpose</span>
              <p className={`text-sm md:text-base leading-relaxed ${theme === 'dark' ? 'text-neutral-200' : 'text-neutral-800'}`}>
                {asset.protocol.purpose}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">{t('lbl_test_procedures')}</span>
                <ul className="space-y-3 text-xs md:text-sm">
                  {asset.protocol.procedures.map((proc, idx) => (
                    <li key={idx} className={`p-3 rounded-lg border flex items-start gap-2.5 ${
                      theme === 'dark' 
                        ? 'bg-neutral-950/30 border-neutral-800/60 text-neutral-300' 
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}>
                      <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-[var(--accent-on-solid)] font-mono text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="opacity-95">{proc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">{t('lbl_approval_reqs')}</span>
                <ul className="space-y-3 text-xs md:text-sm">
                  {asset.protocol.requirements.map((req, idx) => (
                    <li key={idx} className={`p-3 rounded-lg border flex items-start gap-2 ${
                      theme === 'dark' 
                        ? 'bg-neutral-950/30 border-neutral-800/60 text-neutral-300' 
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}>
                      <ShieldCheck className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="opacity-95">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: COURSE MODULE */}
        {activeTab === 'module' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Course Module</span>
                <h4 className="text-sm font-extrabold font-mono text-[var(--accent)]">Applied Learning Track</h4>
              </div>
              <span className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded ${styles.badge}`}>
                Microlearning Session
              </span>
            </div>

            {/* Learning Goals */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">{t('lbl_learning_goals')}</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {asset.courseModule.learningGoals.map((goal, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border flex items-start gap-2 ${
                    theme === 'dark' 
                      ? 'bg-neutral-950/40 border-neutral-800/80 text-white' 
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs opacity-90">{goal}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Theory */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">{t('lbl_theory')}</span>
              <div className={`p-5 rounded-xl border ${theme === 'dark' ? 'bg-neutral-950/50 border-neutral-800 text-neutral-200' : 'bg-slate-50 border-slate-200 text-slate-800'} text-xs md:text-sm leading-relaxed`}>
                {asset.courseModule.theory}
              </div>
            </div>

            {/* Reflection Questions with Notes Input */}
            {asset.courseModule.reflectionQuestions.length > 0 && (
              <div className="space-y-4 pt-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">{t('lbl_reflection')}</span>
                <div className="space-y-4">
                  {asset.courseModule.reflectionQuestions.map((q, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-start gap-2">
                        <HelpCircle className="w-4 h-4 text-[var(--accent)] mt-0.5 flex-shrink-0" />
                        <span className="text-xs md:text-sm font-semibold">{q}</span>
                      </div>
                      <textarea
                        value={reflectionNotes[idx] || ''}
                        onChange={(e) => handleNoteChange(idx, e.target.value)}
                        placeholder="Write your study notes/reflection here (automatically saved offline)..."
                        rows={3}
                        className={`w-full p-3 rounded-lg border text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/50 ${
                          theme === 'dark'
                            ? 'bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600'
                            : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={`mt-2 border-t border-dashed border-[var(--border)] pt-4`}>
              <button
                type="button"
                onClick={() => setShowModuleMetadata((prev) => !prev)}
                className={`px-3 py-1.5 rounded-lg border text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  showModuleMetadata ? styles.tabActive : styles.tabInactive
                }`}
              >
                {showModuleMetadata ? 'Hide Source Metadata' : 'Show Source Metadata'}
              </button>

              {showModuleMetadata && (
                <div className={`mt-3 p-3 rounded-lg border text-xs ${theme === 'dark' ? 'bg-neutral-950/40 border-neutral-800 text-neutral-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-1">Module Identifier</p>
                  <p className="font-mono break-all">{asset.courseModule.moduleId}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: STATS & PROFILE */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-dashed border-[var(--border)] px-4 py-3 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                  {currentLang === 'no' ? 'Metadata kun' : 'Metadata only'}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted)]">
                  {currentLang === 'no' ? 'Vurderingsstatus' : 'Review status'}: {reviewStatusLabel}
                </span>
              </div>
              <p className="text-xs md:text-sm leading-relaxed text-[var(--muted)]">
                {currentLang === 'no'
                  ? 'Verdiene under kommer fra kildematerialet og behandles som metadata, ikke som uavhengig vurdering.'
                  : 'The values below come from the source package and are treated as metadata, not as an independent assessment.'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                  {currentLang === 'no' ? 'Rapportert profil' : 'Reported profile'}
                </span>

                <div className="space-y-2 text-xs md:text-sm">
                  <div className="flex justify-between py-2 border-b border-dashed border-[var(--border)] gap-3">
                    <span className="opacity-75">{t('lbl_complexity')} ({currentLang === 'no' ? 'rapportert' : 'reported'})</span>
                    <span className="font-bold text-[var(--accent)] text-right">{localizeComplexity(asset.stats.dataComplexity, currentLang)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dashed border-[var(--border)] gap-3">
                    <span className="opacity-75">{t('lbl_readiness')} ({currentLang === 'no' ? 'rapportert' : 'reported'})</span>
                    <span className="font-bold text-green-400 text-right">{asset.stats.readinessFactor}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dashed border-[var(--border)] gap-3">
                    <span className="opacity-75">{t('lbl_source_file')}</span>
                    <span className="font-mono text-[11px] font-medium break-all text-right">{asset.metadata.sourceFile}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dashed border-[var(--border)] gap-3">
                    <span className="opacity-75">{t('lbl_file_size')}</span>
                    <span className="font-mono font-medium text-right">{asset.metadata.fileSizeKb.toFixed(2)} KB</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                  {currentLang === 'no' ? 'Kildebevis og gjennomgang' : 'Source evidence and review'}
                </span>
                {hasEvidenceFields ? (
                  <div className="space-y-3">
                    {asset.sourceDerivedClaims && asset.sourceDerivedClaims.length > 0 && (
                      <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--bg-alt)] p-4">
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
                          {currentLang === 'no' ? 'Kildederiverte påstander' : 'Source-derived claims'}
                        </h3>
                        <ul className="space-y-2 text-xs md:text-sm leading-relaxed">
                          {asset.sourceDerivedClaims.map((claim, idx) => (
                            <li key={idx} className="flex gap-2">
                              <span className="text-[var(--accent)] font-bold">?</span>
                              <span>{claim}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {asset.domainActions && asset.domainActions.length > 0 && (
                      <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--bg-alt)] p-4">
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
                          {currentLang === 'no' ? 'Domenehandlinger' : 'Domain actions'}
                        </h3>
                        <ul className="space-y-2 text-xs md:text-sm leading-relaxed">
                          {asset.domainActions.map((action, idx) => (
                            <li key={idx} className="flex gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {asset.validationNotes && asset.validationNotes.length > 0 && (
                      <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--bg-alt)] p-4">
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
                          {currentLang === 'no' ? 'Valideringsnotater' : 'Validation notes'}
                        </h3>
                        <ul className="space-y-2 text-xs md:text-sm leading-relaxed">
                          {asset.validationNotes.map((note, idx) => (
                            <li key={idx} className="flex gap-2">
                              <Info className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                              <span>{note}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-4 py-3 text-xs md:text-sm">
                      <span className="opacity-75">{currentLang === 'no' ? 'Menneskelig vurdering' : 'Human review'}</span>
                      <span className="font-bold">{reviewStatusLabel}</span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-alt)] p-4 text-xs md:text-sm leading-relaxed text-[var(--muted)]">
                    {currentLang === 'no'
                      ? 'Ingen kildebevisfelter er lagret for denne modulen ennå. Behandle rapporterte verdier som metadata kun.'
                      : 'No source evidence fields are stored for this module yet. Treat reported values as metadata only.'}
                  </div>
                )}
              </div>
            </div>

            {asset.stats.distribution.length > 0 && (
              <div className="space-y-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                  {currentLang === 'no' ? 'Rapportert fordeling' : 'Reported distribution'}
                </span>

                <div className="space-y-4">
                  {asset.stats.distribution.map((distItem, idx) => {
                    const parts = distItem.split(':');
                    const rawLabel = parts[0]?.replace(/\*/g, '')?.trim();
                    const label = localizeDistributionLabel(rawLabel, currentLang);
                    const valStr = parts[1]?.replace(/[^0-9]/g, '') || '0';
                    const val = parseInt(valStr);

                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="opacity-80">{label}</span>
                          <span className="font-bold">{val}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full overflow-hidden bg-neutral-950 border border-neutral-800">
                          <div
                            className="h-full bg-[var(--accent-solid)] rounded-full"
                            style={{ width: `${val}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
