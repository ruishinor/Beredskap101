import CryptoJS from 'crypto-js';
import type { LocalAiSettings, VaultDocument } from '../types/offline';

export interface ProgressState {
  checkedIds: string[];
  notes: Record<string, string>;
  lastSynced: number;
}

export interface SecureBackupBundle {
  version: 2;
  exportedAt: string;
  progressState: ProgressState;
  vaultDocuments: VaultDocument[];
  localAiSettings: LocalAiSettings | null;
  applicationStorage?: Record<string, string>;
}

export type PersistenceResult = { ok: true; backend: 'indexeddb' | 'localStorage' } | { ok: false; backend: 'none'; error: string };

export interface FullLocalDataExportBundle {
  version: 1;
  exportedAt: string;
  progressState: ProgressState;
  vaultDocuments: VaultDocument[];
  localStorage: Record<string, string>;
  cacheNames: string[];
}

export interface ErasureResult {
  localStorageKeysRemoved: string[];
  localStorageKeysFailed: string[];
  cacheNamesRemoved: string[];
  cacheNamesFailed: string[];
  indexedDbCleared: boolean;
}

const DB_NAME = 'beredskap101-db';
const DB_VERSION = 2;
const PROGRESS_STORE = 'progress';
const DOCUMENT_STORE = 'document-vault';
const STATE_KEY = 'current-state';
const DOCUMENTS_KEY = 'all-documents';
const DOCUMENTS_LOCAL_FALLBACK_KEY = 'beredskap101_document_vault_v1';
const BACKUP_STORAGE_KEYS = new Set(['beredskap_checklists_checked_ids', 'beredskap101_map_progress_v2']);
const BACKUP_STORAGE_PREFIXES = ['beredskap_ext_check_', 'beredskap_ext_notes_'];
const MAX_BACKUP_STORAGE_BYTES = 2 * 1024 * 1024;
const MAX_ATTACHMENT_BYTES = 6 * 1024 * 1024;
const VAULT_CATEGORIES = new Set(['emergency-plan', 'pdf-reference', 'contact-plan', 'medication-list', 'evacuation-note', 'general-note']);
const APP_LOCAL_STORAGE_EXACT_KEYS = [
  STATE_KEY,
  DOCUMENTS_LOCAL_FALLBACK_KEY,
  'beredskap_checklists_checked_ids',
  'beredskap101_map_progress_v2',
  'beredskap101_cookie_prefs_v1',
  'beredskap101_local_ai_settings_v1',
  'beredskap101.shelterMap.layerMode.v1',
  'beredskap101.pmtiles.mapPack.v1',
];
const APP_LOCAL_STORAGE_PREFIXES = [
  'beredskap101',
  'beredskap_',
  'beredskap_ext_check_',
  'beredskap_ext_notes_',
];

const DEFAULT_PROGRESS_STATE: ProgressState = {
  checkedIds: [],
  notes: {},
  lastSynced: Date.now(),
};

function normalizeProgressState(raw: unknown): ProgressState {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_PROGRESS_STATE };
  const value = raw as Partial<ProgressState>;
  return {
    checkedIds: Array.isArray(value.checkedIds) ? value.checkedIds.filter((id): id is string => typeof id === 'string') : [],
    notes: value.notes && typeof value.notes === 'object' ? (value.notes as Record<string, string>) : {},
    lastSynced: typeof value.lastSynced === 'number' && Number.isFinite(value.lastSynced) ? value.lastSynced : Date.now(),
  };
}

function normalizeVaultDocument(raw: unknown): VaultDocument | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const value = raw as Partial<VaultDocument>;
  if (typeof value.id !== 'string' || !value.id.trim() || value.id.length > 200 ||
      typeof value.title !== 'string' || !value.title.trim() || value.title.length > 300 ||
      typeof value.category !== 'string' || !VAULT_CATEGORIES.has(value.category) ||
      (value.tags !== undefined && (!Array.isArray(value.tags) || value.tags.some((tag) => typeof tag !== 'string'))) ||
      (value.note !== undefined && typeof value.note !== 'string')) return null;
  if (value.attachment !== undefined) {
    const attachment = value.attachment;
    if (!attachment || typeof attachment.fileName !== 'string' || typeof attachment.mimeType !== 'string' ||
        typeof attachment.dataUrl !== 'string' || !attachment.dataUrl.startsWith('data:') ||
        typeof attachment.sizeBytes !== 'number' || !Number.isFinite(attachment.sizeBytes) ||
        attachment.sizeBytes < 0 || attachment.sizeBytes > MAX_ATTACHMENT_BYTES ||
        attachment.dataUrl.length > MAX_ATTACHMENT_BYTES * 1.5) return null;
  }

  return {
    id: String(value.id),
    title: String(value.title),
    category: value.category,
    householdMember: typeof value.householdMember === 'string' ? value.householdMember : '',
    source: typeof value.source === 'string' ? value.source : '',
    reviewDate: typeof value.reviewDate === 'string' ? value.reviewDate : '',
    sensitive: Boolean(value.sensitive),
    tags: Array.isArray(value.tags) ? value.tags.filter((tag): tag is string => typeof tag === 'string') : [],
    note: typeof value.note === 'string' ? value.note : '',
    attachment:
      value.attachment &&
      typeof value.attachment === 'object' &&
      typeof value.attachment.fileName === 'string' &&
      typeof value.attachment.mimeType === 'string' &&
      typeof value.attachment.sizeBytes === 'number' &&
      typeof value.attachment.dataUrl === 'string'
        ? {
            fileName: value.attachment.fileName,
            mimeType: value.attachment.mimeType,
            sizeBytes: value.attachment.sizeBytes,
            dataUrl: value.attachment.dataUrl,
          }
        : undefined,
    createdAt: typeof value.createdAt === 'number' && Number.isFinite(value.createdAt) ? value.createdAt : Date.now(),
    updatedAt: typeof value.updatedAt === 'number' && Number.isFinite(value.updatedAt) ? value.updatedAt : Date.now(),
  };
}

function normalizeVaultDocuments(raw: unknown): VaultDocument[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => normalizeVaultDocument(item))
    .filter((item): item is VaultDocument => Boolean(item));
}

export function validateVaultDocuments(raw: unknown): VaultDocument[] | null {
  if (!Array.isArray(raw) || raw.length > 1000) return null;
  const documents = raw.map(normalizeVaultDocument);
  return documents.some((document) => !document) ? null : documents as VaultDocument[];
}

function isBackupStorageKey(key: string): boolean {
  return BACKUP_STORAGE_KEYS.has(key) || BACKUP_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix) && key.length > prefix.length);
}

function validateApplicationStorage(raw: unknown): Record<string, string> | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const entries = Object.entries(raw);
  if (entries.length > 500 || JSON.stringify(raw).length > MAX_BACKUP_STORAGE_BYTES) return null;
  const result: Record<string, string> = Object.create(null);
  for (const [key, value] of entries) {
    if (!isBackupStorageKey(key) || typeof value !== 'string' || value.length > MAX_BACKUP_STORAGE_BYTES) return null;
    try {
      const parsed: unknown = JSON.parse(value);
      if (key === 'beredskap_checklists_checked_ids' || key === 'beredskap101_map_progress_v2' || key.startsWith('beredskap_ext_check_')) {
        if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== 'string')) return null;
      } else if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || Object.values(parsed).some((item) => typeof item !== 'string')) return null;
    } catch { return null; }
    result[key] = value;
  }
  return result;
}

export function readBackupApplicationStorage(): Record<string, string> {
  const result: Record<string, string> = Object.create(null);
  if (typeof window === 'undefined') return result;
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key || !isBackupStorageKey(key)) continue;
    const value = window.localStorage.getItem(key);
    if (value !== null) result[key] = value;
  }
  const validated = validateApplicationStorage(result);
  if (!validated) throw new Error('Local progress data cannot be included in a safe backup');
  return validated;
}

function normalizeLocalAiSettings(raw: unknown): LocalAiSettings | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Partial<LocalAiSettings>;
  if (value.mode !== 'disabled' && value.mode !== 'local-openai-compatible') return null;
  if (typeof value.enabled !== 'boolean' || typeof value.baseUrl !== 'string' || typeof value.model !== 'string') return null;
  return {
    enabled: value.enabled,
    baseUrl: value.baseUrl,
    model: value.model,
    mode: value.mode,
  };
}

function isBackupBundle(raw: unknown): raw is SecureBackupBundle {
  if (!raw || typeof raw !== 'object') return false;
  const value = raw as Partial<SecureBackupBundle>;
  return value.version === 2 && 'progressState' in value;
}

function isValidProgressState(raw: unknown): raw is ProgressState {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false;
  const value = raw as Partial<ProgressState>;
  return Array.isArray(value.checkedIds) && value.checkedIds.every((id) => typeof id === 'string') &&
    Boolean(value.notes) && typeof value.notes === 'object' && !Array.isArray(value.notes) &&
    Object.values(value.notes).every((note) => typeof note === 'string') &&
    typeof value.lastSynced === 'number' && Number.isFinite(value.lastSynced);
}

// --- Backup cryptography ---------------------------------------------------
// v1: crypto-js passphrase mode, bare ProgressState payload (DECRYPT ONLY).
// v2: crypto-js passphrase mode, SecureBackupBundle payload (DECRYPT ONLY).
// v3: WebCrypto PBKDF2-SHA-256 + AES-GCM envelope (current export format).
// New exports always use v3 when WebCrypto is available; the crypto-js import
// is retained exclusively for reading legacy v1/v2 backups.

const V3_KDF = 'PBKDF2-SHA-256' as const;
// OWASP floor for PBKDF2-HMAC-SHA-256 is 310k; 600k is used when the device
// can afford it. The iteration count is stored in each envelope, so per-file
// cost is self-describing and future changes stay readable.
const V3_ITERATIONS = 600000;
const V3_MAX_ITERATIONS = 10_000_000;
const V3_SALT_BYTES = 16;
const V3_IV_BYTES = 12;

export interface BackupEnvelopeV3 {
  v: 3;
  kdf: typeof V3_KDF;
  iter: number;
  salt: string;
  iv: string;
  ct: string;
}

export class UnsupportedBackupVersionError extends Error {
  readonly code = 'UNSUPPORTED_BACKUP_VERSION';
  constructor(version: unknown) {
    super(`Unsupported backup version: ${String(version)}`);
    this.name = 'UnsupportedBackupVersionError';
  }
}

export class BackupDecryptionError extends Error {
  readonly code = 'BACKUP_DECRYPTION_FAILED';
  constructor(message = 'Backup decryption failed') {
    super(message);
    this.name = 'BackupDecryptionError';
  }
}

// crypto.subtle is unavailable on non-secure contexts (e.g. LAN http self-host).
// Callers must check this before offering authenticated encrypted export.
export function isWebCryptoBackupAvailable(): boolean {
  return (
    typeof crypto !== 'undefined' &&
    typeof crypto.subtle !== 'undefined' &&
    typeof crypto.getRandomValues === 'function' &&
    typeof TextEncoder !== 'undefined' &&
    typeof TextDecoder !== 'undefined'
  );
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function deriveKeyV3(passkey: string, salt: Uint8Array, iter: number): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(passkey), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iter },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypts an arbitrary plaintext string into a v3 envelope JSON string.
// Salt and IV are random per call — never derived, never reused — so two
// exports of identical plaintext always produce different envelopes.
export async function encryptV3Payload(plaintext: string, passkey: string): Promise<string> {
  if (!isWebCryptoBackupAvailable()) {
    throw new Error('WebCrypto is unavailable in this context');
  }
  const salt = crypto.getRandomValues(new Uint8Array(V3_SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(V3_IV_BYTES));
  const key = await deriveKeyV3(passkey, salt, V3_ITERATIONS);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext)
  );
  const envelope: BackupEnvelopeV3 = {
    v: 3,
    kdf: V3_KDF,
    iter: V3_ITERATIONS,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    ct: bytesToBase64(new Uint8Array(ciphertext)),
  };
  return JSON.stringify(envelope);
}

async function decryptV3Payload(envelope: BackupEnvelopeV3, passkey: string): Promise<string> {
  const key = await deriveKeyV3(passkey, base64ToBytes(envelope.salt), envelope.iter);
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToBytes(envelope.iv) },
    key,
    base64ToBytes(envelope.ct)
  );
  return new TextDecoder().decode(plaintext);
}

// Legacy crypto-js passphrase-mode decryptor (v1/v2 backups). Decrypt-only:
// no new export may use this path (kept verbatim from the pre-v3 code).
function decryptLegacy(encryptedData: string, passkey: string): unknown | null {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, passkey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) return null;
    return JSON.parse(decrypted);
  } catch {
    // Wrong legacy passphrases are expected input errors.
    return null;
  }
}

// Routes an encrypted payload string to its format. Legacy v1/v2 payloads are
// raw crypto-js OpenSSL base64 strings (no JSON envelope); v3 payloads are
// JSON envelopes. Unknown envelope versions raise a typed error.
export function detectBackupFormat(encryptedData: string): 'legacy' | 'v3' {
  const trimmed = encryptedData.trim();
  if (trimmed.startsWith('{')) {
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      parsed = null;
    }
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && 'v' in parsed) {
      const version = (parsed as { v?: unknown }).v;
      if (version === 3) return 'v3';
      if (version === 1 || version === 2) return 'legacy';
      throw new UnsupportedBackupVersionError(version);
    }
  }
  return 'legacy';
}

// Structural validation between decode and apply: a decrypted payload is only
// accepted if it matches a known backup shape, so corrupt semantics can never
// reach the state-apply step (transactional decode -> validate -> apply).
function buildValidatedBundle(decoded: unknown): SecureBackupBundle | null {
  if (!decoded || typeof decoded !== 'object' || Array.isArray(decoded)) return null;

  if (isBackupBundle(decoded)) {
    const value = decoded as SecureBackupBundle;
    if (!isValidProgressState(value.progressState)) return null;
    if ('vaultDocuments' in decoded && !Array.isArray(value.vaultDocuments)) return null;
    if ('localAiSettings' in decoded && value.localAiSettings !== null && typeof value.localAiSettings !== 'object') return null;
    const documents = value.vaultDocuments === undefined ? [] : validateVaultDocuments(value.vaultDocuments);
    if (!documents) return null;
    const applicationStorage = value.applicationStorage === undefined ? undefined : validateApplicationStorage(value.applicationStorage);
    if (value.applicationStorage !== undefined && !applicationStorage) return null;
    return {
      version: 2,
      exportedAt: typeof value.exportedAt === 'string' ? value.exportedAt : new Date().toISOString(),
      progressState: normalizeProgressState(value.progressState),
      vaultDocuments: documents,
      localAiSettings: normalizeLocalAiSettings(value.localAiSettings),
      ...(applicationStorage ? { applicationStorage } : {}),
    };
  }

  // Legacy v1 bare progress state must at least look like a progress state.
  const candidate = decoded as Partial<ProgressState>;
  if (!isValidProgressState(candidate)) return null;
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    progressState: normalizeProgressState(decoded),
    vaultDocuments: [],
    localAiSettings: null,
  };
}

export type BackupPayloadFormat = 'v1' | 'v2' | 'v3';

// Version-routed decryptor: v3 envelopes via WebCrypto AES-GCM, v1/v2 via the
// legacy crypto-js path. Throws UnsupportedBackupVersionError for unknown
// envelope versions and BackupDecryptionError for wrong passphrases, tampered
// ciphertext (GCM auth failure) and structurally corrupt payloads.
export async function decryptSecureBackupBundleAuto(
  encryptedData: string,
  passkey: string
): Promise<{ bundle: SecureBackupBundle; format: BackupPayloadFormat }> {
  const format = detectBackupFormat(encryptedData);

  if (format === 'v3') {
    if (!isWebCryptoBackupAvailable()) {
      // v3 backups cannot be decrypted on non-secure (non-HTTPS) contexts.
      throw new BackupDecryptionError('WebCrypto is unavailable for v3 backup decryption');
    }
    let envelope: BackupEnvelopeV3;
    try {
      envelope = JSON.parse(encryptedData.trim()) as BackupEnvelopeV3;
    } catch {
      throw new BackupDecryptionError('Malformed v3 backup envelope');
    }
    if (
      envelope.kdf !== V3_KDF ||
      typeof envelope.iter !== 'number' ||
      !Number.isInteger(envelope.iter) ||
      envelope.iter < 1 ||
      envelope.iter > V3_MAX_ITERATIONS ||
      typeof envelope.salt !== 'string' ||
      typeof envelope.iv !== 'string' ||
      typeof envelope.ct !== 'string'
    ) {
      throw new BackupDecryptionError('Malformed v3 backup envelope');
    }
    let decoded: unknown;
    try {
      decoded = JSON.parse(await decryptV3Payload(envelope, passkey));
    } catch {
      // AES-GCM auth failure: wrong passphrase or tampered ciphertext.
      throw new BackupDecryptionError();
    }
    const bundle = buildValidatedBundle(decoded);
    if (!bundle) throw new BackupDecryptionError('Backup payload failed validation');
    return { bundle, format: 'v3' };
  }

  const decoded = decryptLegacy(encryptedData, passkey);
  if (!decoded) throw new BackupDecryptionError();
  const bundle = buildValidatedBundle(decoded);
  if (!bundle) throw new BackupDecryptionError('Backup payload failed validation');
  return { bundle, format: isBackupBundle(decoded) ? 'v2' : 'v1' };
}

function readLocalVaultFallback(): VaultDocument[] {
  try {
    const raw = localStorage.getItem(DOCUMENTS_LOCAL_FALLBACK_KEY);
    if (!raw) return [];
    return normalizeVaultDocuments(JSON.parse(raw));
  } catch (error) {
    console.error('Failed to read local vault fallback', error);
    return [];
  }
}

function saveLocalVaultFallback(documents: VaultDocument[]) {
  try {
    // An empty array is a deletion record: removing it could resurrect an old
    // IndexedDB copy after a failed write or temporary database outage.
    localStorage.setItem(DOCUMENTS_LOCAL_FALLBACK_KEY, JSON.stringify(documents));
    return true;
  } catch (error) {
    console.error('Failed to write local vault fallback', error);
    return false;
  }
}

function removeLocalFallback(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function getIndexedDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (!window.indexedDB) {
      resolve(null);
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    let settled = false;
    const finish = (db: IDBDatabase | null) => {
      if (settled) { db?.close(); return; }
      settled = true;
      clearTimeout(timeout);
      resolve(db);
    };
    const timeout = setTimeout(() => finish(null), 5000);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(PROGRESS_STORE)) {
        db.createObjectStore(PROGRESS_STORE);
      }
      if (!db.objectStoreNames.contains(DOCUMENT_STORE)) {
        db.createObjectStore(DOCUMENT_STORE);
      }
    };
    request.onsuccess = (event) => {
      finish((event.target as IDBOpenDBRequest).result);
    };
    request.onerror = () => {
      finish(null);
    };
    request.onblocked = () => finish(null);
  });
}

function writeStores(db: IDBDatabase, writes: Array<{ store: string; key: string; value: unknown }>): Promise<boolean> {
  return new Promise((resolve) => {
    let transaction: IDBTransaction;
    try { transaction = db.transaction([...new Set(writes.map((write) => write.store))], 'readwrite'); }
    catch { resolve(false); return; }
    transaction.oncomplete = () => resolve(true);
    transaction.onabort = () => resolve(false);
    // Wait for onabort: a request error aborts the transaction by default.
    try {
      for (const write of writes) transaction.objectStore(write.store).put(write.value, write.key);
    } catch {
      // Synchronous exceptions do not automatically abort previously queued puts.
      try { transaction.abort(); }
      catch { resolve(false); }
    }
  });
}

function getFromStore<T>(db: IDBDatabase, storeName: string, key: string): Promise<T | undefined> {
  return new Promise((resolve) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => resolve(undefined);
    transaction.onabort = () => resolve(undefined);
  });
}

export async function saveProgressStateResult(state: ProgressState): Promise<PersistenceResult> {
  const normalized = normalizeProgressState(state);
  try {
    const db = await getIndexedDB();
    if (db) {
      try {
        const stored = await writeStores(db, [{ store: PROGRESS_STORE, key: STATE_KEY, value: normalized }]);
        if (stored && removeLocalFallback(STATE_KEY)) return { ok: true, backend: 'indexeddb' };
      } finally { db.close(); }
    }
  } catch (error) {
    console.error('Failed to save state to IndexedDB', error);
  }

  try {
    localStorage.setItem(STATE_KEY, JSON.stringify({ ...normalized, _storageFallback: true }));
    return { ok: true, backend: 'localStorage' };
  } catch (error) {
    console.error('Failed to save state to localStorage fallback', error);
    return { ok: false, backend: 'none', error: 'Unable to store progress in IndexedDB or localStorage' };
  }
}

export async function saveProgressState(state: ProgressState): Promise<boolean> {
  return (await saveProgressStateResult(state)).ok;
}

export async function loadProgressState(): Promise<ProgressState> {
  // A fallback record is the latest acknowledged write until a successful
  // database save removes it. A recovered database may still contain old data.
  let fallback: ProgressState | null = null;
  try {
    const local = localStorage.getItem(STATE_KEY);
    if (local) {
      const parsed: unknown = JSON.parse(local);
      if (isValidProgressState(parsed)) {
        fallback = normalizeProgressState(parsed);
        if ((parsed as ProgressState & { _storageFallback?: boolean })._storageFallback === true) return fallback;
      }
    }
  } catch {
    // Unavailable or malformed fallback must not prevent a database read.
  }
  try {
    const db = await getIndexedDB();
    if (db) {
      const value = await getFromStore<unknown>(db, PROGRESS_STORE, STATE_KEY);
      db.close();
      if (value) {
        const stored = normalizeProgressState(value);
        // Older releases left local fallback copies after successful database
        // saves. Use their timestamp, not the new explicit fallback precedence.
        return fallback && fallback.lastSynced > stored.lastSynced ? fallback : stored;
      }
    }
  } catch (error) {
    console.error('Failed to load state from IndexedDB', error);
  }

  if (fallback) return fallback;
  return { ...DEFAULT_PROGRESS_STATE };
}

export async function saveVaultDocumentsResult(documents: VaultDocument[]): Promise<PersistenceResult> {
  const normalized = validateVaultDocuments(documents);
  if (!normalized) return { ok: false, backend: 'none', error: 'Invalid document data' };
  try {
    const db = await getIndexedDB();
    if (db) {
      try {
        const stored = await writeStores(db, [{ store: DOCUMENT_STORE, key: DOCUMENTS_KEY, value: normalized }]);
        if (stored && removeLocalFallback(DOCUMENTS_LOCAL_FALLBACK_KEY)) {
          return { ok: true, backend: 'indexeddb' };
        }
      } finally { db.close(); }
    }
  } catch (error) {
    console.error('Failed to save vault documents to IndexedDB', error);
  }

  return saveLocalVaultFallback(normalized)
    ? { ok: true, backend: 'localStorage' }
    : { ok: false, backend: 'none', error: 'Unable to store documents in IndexedDB or localStorage' };
}

export async function saveVaultDocuments(documents: VaultDocument[]): Promise<boolean> {
  return (await saveVaultDocumentsResult(documents)).ok;
}

export async function loadVaultDocuments(): Promise<VaultDocument[]> {
  try {
    const fallback = localStorage.getItem(DOCUMENTS_LOCAL_FALLBACK_KEY);
    if (fallback !== null) {
      const documents = validateVaultDocuments(JSON.parse(fallback));
      if (documents) return documents;
    }
  } catch {
    // Try IndexedDB when fallback storage is unavailable or malformed.
  }
  try {
    const db = await getIndexedDB();
    if (db) {
      const value = await getFromStore<unknown>(db, DOCUMENT_STORE, DOCUMENTS_KEY);
      db.close();
      if (value !== undefined) {
        if (Array.isArray(value)) {
          return normalizeVaultDocuments(value);
        }
        const normalized = normalizeVaultDocuments(value);
        if (normalized.length > 0) {
          return normalized;
        }
      }
    }
  } catch (error) {
    console.error('Failed to load vault documents from IndexedDB', error);
  }

  return readLocalVaultFallback();
}

export async function clearVaultDocuments(): Promise<boolean> {
  return saveVaultDocuments([]);
}

export async function upsertVaultDocument(nextDocument: VaultDocument): Promise<boolean> {
  const normalizedDoc = normalizeVaultDocument(nextDocument);
  if (!normalizedDoc) return false;
  const existing = await loadVaultDocuments();
  const next = existing.filter((document) => document.id !== normalizedDoc.id);
  next.unshift(normalizedDoc);
  return saveVaultDocuments(next);
}

export async function deleteVaultDocument(documentId: string): Promise<boolean> {
  const existing = await loadVaultDocuments();
  const next = existing.filter((document) => document.id !== documentId);
  return saveVaultDocuments(next);
}

// Legacy v1 backup export for backward compatibility with older backups.
export function exportSecureBackup(state: ProgressState, passkey: string): string {
  const serialized = JSON.stringify(normalizeProgressState(state));
  return CryptoJS.AES.encrypt(serialized, passkey).toString();
}

// Legacy v1 backup decryptor with v2 bundle compatibility.
export function decryptBackup(encryptedData: string, passkey: string): ProgressState | null {
  const decoded = decryptLegacy(encryptedData, passkey);
  if (!decoded) return null;
  if (isBackupBundle(decoded)) {
    return normalizeProgressState(decoded.progressState);
  }
  return normalizeProgressState(decoded);
}

export function buildSecureBackupBundle(
  progressState: ProgressState,
  vaultDocuments: VaultDocument[],
  localAiSettings: LocalAiSettings | null,
  applicationStorage?: Record<string, string>
): SecureBackupBundle {
  const validatedApplicationStorage = applicationStorage === undefined ? undefined : validateApplicationStorage(applicationStorage);
  if (applicationStorage !== undefined && !validatedApplicationStorage) throw new Error('Invalid application progress data');
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    progressState: normalizeProgressState(progressState),
    vaultDocuments: normalizeVaultDocuments(vaultDocuments),
    localAiSettings: normalizeLocalAiSettings(localAiSettings),
    ...(validatedApplicationStorage ? { applicationStorage: validatedApplicationStorage } : {}),
  };
}

export interface RestorationResult {
  ok: boolean;
  rollbackComplete: boolean;
  error?: string;
}

/** Writes localStorage records first, then commits IndexedDB stores together.
 * Cross-store rollback is best effort; failures are always reported to callers. */
export async function restoreSecureBackupBundle(bundle: SecureBackupBundle, format: BackupPayloadFormat): Promise<RestorationResult> {
  const applicationStorage = bundle.applicationStorage === undefined ? {} : validateApplicationStorage(bundle.applicationStorage);
  const documents = validateVaultDocuments(bundle.vaultDocuments);
  if (!isValidProgressState(bundle.progressState) || !documents || !applicationStorage) {
    return { ok: false, rollbackComplete: true, error: 'Backup data failed validation' };
  }

  let db: IDBDatabase | null;
  try { db = await getIndexedDB(); }
  catch { db = null; }
  const changes = new Map<string, string | null>(Object.entries(applicationStorage));
  if (bundle.localAiSettings) changes.set('beredskap101_local_ai_settings_v1', JSON.stringify(bundle.localAiSettings));
  if (!db) {
    changes.set(STATE_KEY, JSON.stringify({ ...bundle.progressState, _storageFallback: true }));
    if (format !== 'v1') changes.set(DOCUMENTS_LOCAL_FALLBACK_KEY, JSON.stringify(documents));
  } else {
    changes.set(STATE_KEY, null);
    if (format !== 'v1') changes.set(DOCUMENTS_LOCAL_FALLBACK_KEY, null);
  }

  const previous = new Map<string, string | null>();
  try {
    for (const key of changes.keys()) previous.set(key, localStorage.getItem(key));
  } catch {
    db?.close();
    return { ok: false, rollbackComplete: true, error: 'Unable to read current local state' };
  }

  try {
    for (const [key, value] of changes) {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    }
    if (db) {
      const writes = [{ store: PROGRESS_STORE, key: STATE_KEY, value: bundle.progressState as unknown }];
      if (format !== 'v1') writes.push({ store: DOCUMENT_STORE, key: DOCUMENTS_KEY, value: documents });
      const committed = await writeStores(db, writes);
      if (!committed) throw new Error('IndexedDB restore transaction failed');
    }
    return { ok: true, rollbackComplete: true };
  } catch (error) {
    let rollbackComplete = true;
    for (const [key, value] of previous) {
      try {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      } catch { rollbackComplete = false; }
    }
    return { ok: false, rollbackComplete, error: error instanceof Error ? error.message : 'Restore failed' };
  } finally { db?.close(); }
}

// Legacy v2 export path (crypto-js). Retained for the non-HTTPS fallback where
// WebCrypto is unavailable; never used when crypto.subtle exists.
export function exportSecureBackupBundle(bundle: SecureBackupBundle, passkey: string): string {
  return CryptoJS.AES.encrypt(JSON.stringify(bundle), passkey).toString();
}

// Current v3 export path: PBKDF2-SHA-256 + AES-GCM envelope.
export async function exportSecureBackupBundleV3(bundle: SecureBackupBundle, passkey: string): Promise<string> {
  return encryptV3Payload(JSON.stringify(bundle), passkey);
}

export function decryptSecureBackupBundle(encryptedData: string, passkey: string): SecureBackupBundle | null {
  const decoded = decryptLegacy(encryptedData, passkey);
  if (!decoded) return null;

  if (isBackupBundle(decoded)) {
    return {
      version: 2,
      exportedAt: typeof decoded.exportedAt === 'string' ? decoded.exportedAt : new Date().toISOString(),
      progressState: normalizeProgressState(decoded.progressState),
      vaultDocuments: normalizeVaultDocuments(decoded.vaultDocuments),
      localAiSettings: normalizeLocalAiSettings(decoded.localAiSettings),
    };
  }

  const legacyProgressState = normalizeProgressState(decoded);
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    progressState: legacyProgressState,
    vaultDocuments: [],
    localAiSettings: null,
  };
}

function getAppLocalStorageKeys(): string[] {
  if (typeof window === 'undefined') return [];
  const keys = new Set<string>();
  try {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (!key) continue;
      if (APP_LOCAL_STORAGE_EXACT_KEYS.includes(key) || APP_LOCAL_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))) {
        keys.add(key);
      }
    }
  } catch {
    // Ignore storage enumeration failures.
  }
  return Array.from(keys).sort();
}

async function listAppCacheNames(): Promise<string[]> {
  if (typeof caches === 'undefined') return [];
  try {
    return await caches.keys();
  } catch {
    return [];
  }
}

function shouldDeleteCache(cacheName: string): boolean {
  return cacheName.startsWith('beredskap101') || cacheName.startsWith('workbox') || cacheName.includes('vite');
}

function readLocalStorageSnapshot(): Record<string, string> {
  const snapshot: Record<string, string> = {};
  if (typeof window === 'undefined') return snapshot;

  for (const key of getAppLocalStorageKeys()) {
    try {
      const value = window.localStorage.getItem(key);
      if (value !== null) snapshot[key] = value;
    } catch {
      // Skip unreadable keys.
    }
  }
  return snapshot;
}

async function deleteAppIndexedDb(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.indexedDB) return true;

  return new Promise((resolve) => {
    const request = window.indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve(true);
    request.onerror = () => resolve(false);
    request.onblocked = () => resolve(false);
  });
}

export async function buildFullLocalDataExportBundle(): Promise<FullLocalDataExportBundle> {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    progressState: await loadProgressState(),
    vaultDocuments: await loadVaultDocuments(),
    localStorage: readLocalStorageSnapshot(),
    cacheNames: await listAppCacheNames(),
  };
}

export function downloadFullLocalDataExport(bundle: FullLocalDataExportBundle) {
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `beredskap101-full-local-export-${Date.now()}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export async function eraseAllLocalAppData(): Promise<ErasureResult> {
  const localStorageKeysRemoved: string[] = [];
  const localStorageKeysFailed: string[] = [];
  if (typeof window !== 'undefined') {
    for (const key of getAppLocalStorageKeys()) {
      try {
        window.localStorage.removeItem(key);
        localStorageKeysRemoved.push(key);
      } catch {
        localStorageKeysFailed.push(key);
      }
    }
  }

  const cacheNamesRemoved: string[] = [];
  const cacheNamesFailed: string[] = [];
  if (typeof caches !== 'undefined') {
    for (const cacheName of await listAppCacheNames()) {
      if (!shouldDeleteCache(cacheName)) continue;
      try {
        if (await caches.delete(cacheName)) {
          cacheNamesRemoved.push(cacheName);
        }
      } catch {
        cacheNamesFailed.push(cacheName);
      }
    }
  }

  return {
    localStorageKeysRemoved,
    localStorageKeysFailed,
    cacheNamesRemoved,
    cacheNamesFailed,
    indexedDbCleared: await deleteAppIndexedDb(),
  };
}
