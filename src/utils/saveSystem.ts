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
}

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
  cacheNamesRemoved: string[];
  indexedDbCleared: boolean;
}

const DB_NAME = 'beredskap101-db';
const DB_VERSION = 2;
const PROGRESS_STORE = 'progress';
const DOCUMENT_STORE = 'document-vault';
const STATE_KEY = 'current-state';
const DOCUMENTS_KEY = 'all-documents';
const DOCUMENTS_LOCAL_FALLBACK_KEY = 'beredskap101_document_vault_v1';
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
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Partial<VaultDocument>;
  if (!value.id || !value.title || !value.category) return null;

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
// Callers must check this and fall back to the legacy path with a UI warning.
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
  } catch (error) {
    console.error('Failed to decrypt backup payload', error);
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
    if (!value.progressState || typeof value.progressState !== 'object' || Array.isArray(value.progressState)) return null;
    if ('vaultDocuments' in decoded && !Array.isArray(value.vaultDocuments)) return null;
    if ('localAiSettings' in decoded && value.localAiSettings !== null && typeof value.localAiSettings !== 'object') return null;
    return {
      version: 2,
      exportedAt: typeof value.exportedAt === 'string' ? value.exportedAt : new Date().toISOString(),
      progressState: normalizeProgressState(value.progressState),
      vaultDocuments: normalizeVaultDocuments(value.vaultDocuments),
      localAiSettings: normalizeLocalAiSettings(value.localAiSettings),
    };
  }

  // Legacy v1 bare progress state must at least look like a progress state.
  const candidate = decoded as Partial<ProgressState>;
  if (!('checkedIds' in candidate) && !('notes' in candidate) && !('lastSynced' in candidate)) return null;
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
    if (documents.length === 0) {
      localStorage.removeItem(DOCUMENTS_LOCAL_FALLBACK_KEY);
      return;
    }
    localStorage.setItem(DOCUMENTS_LOCAL_FALLBACK_KEY, JSON.stringify(documents));
  } catch (error) {
    console.error('Failed to write local vault fallback', error);
  }
}

function removeLocalVaultFallback() {
  try {
    localStorage.removeItem(DOCUMENTS_LOCAL_FALLBACK_KEY);
  } catch {
    // Ignore storage errors.
  }
}

function getIndexedDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (!window.indexedDB) {
      resolve(null);
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
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
      resolve((event.target as IDBOpenDBRequest).result);
    };
    request.onerror = () => {
      resolve(null);
    };
  });
}

function putInStore<T>(db: IDBDatabase, storeName: string, key: string, value: T): Promise<boolean> {
  return new Promise((resolve) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(value, key);
    request.onsuccess = () => resolve(true);
    request.onerror = () => resolve(false);
  });
}

function getFromStore<T>(db: IDBDatabase, storeName: string, key: string): Promise<T | undefined> {
  return new Promise((resolve) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => resolve(undefined);
  });
}

export async function saveProgressState(state: ProgressState): Promise<boolean> {
  const normalized = normalizeProgressState(state);
  try {
    const db = await getIndexedDB();
    if (db) {
      const stored = await putInStore(db, PROGRESS_STORE, STATE_KEY, normalized);
      if (stored) return true;
    }
  } catch (error) {
    console.error('Failed to save state to IndexedDB', error);
  }

  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(normalized));
    return true;
  } catch (error) {
    console.error('Failed to save state to localStorage fallback', error);
    return false;
  }
}

export async function loadProgressState(): Promise<ProgressState> {
  try {
    const db = await getIndexedDB();
    if (db) {
      const value = await getFromStore<unknown>(db, PROGRESS_STORE, STATE_KEY);
      if (value) return normalizeProgressState(value);
    }
  } catch (error) {
    console.error('Failed to load state from IndexedDB', error);
  }

  try {
    const local = localStorage.getItem(STATE_KEY);
    if (local) {
      return normalizeProgressState(JSON.parse(local));
    }
  } catch (error) {
    console.error('Failed to load state from localStorage fallback', error);
  }
  return { ...DEFAULT_PROGRESS_STATE };
}

export async function saveVaultDocuments(documents: VaultDocument[]): Promise<boolean> {
  const normalized = normalizeVaultDocuments(documents);
  try {
    const db = await getIndexedDB();
    if (db) {
      const stored = await putInStore(db, DOCUMENT_STORE, DOCUMENTS_KEY, normalized);
      if (stored) return true;
    }
  } catch (error) {
    console.error('Failed to save vault documents to IndexedDB', error);
  }

  saveLocalVaultFallback(normalized);
  return true;
}

export async function loadVaultDocuments(): Promise<VaultDocument[]> {
  try {
    const db = await getIndexedDB();
    if (db) {
      const value = await getFromStore<unknown>(db, DOCUMENT_STORE, DOCUMENTS_KEY);
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
  removeLocalVaultFallback();
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
  localAiSettings: LocalAiSettings | null
): SecureBackupBundle {
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    progressState: normalizeProgressState(progressState),
    vaultDocuments: normalizeVaultDocuments(vaultDocuments),
    localAiSettings: normalizeLocalAiSettings(localAiSettings),
  };
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
  if (typeof window !== 'undefined') {
    for (const key of getAppLocalStorageKeys()) {
      try {
        window.localStorage.removeItem(key);
        localStorageKeysRemoved.push(key);
      } catch {
        // Continue erasure best-effort across keys.
      }
    }
  }

  const cacheNamesRemoved: string[] = [];
  if (typeof caches !== 'undefined') {
    for (const cacheName of await listAppCacheNames()) {
      if (!shouldDeleteCache(cacheName)) continue;
      try {
        if (await caches.delete(cacheName)) {
          cacheNamesRemoved.push(cacheName);
        }
      } catch {
        // Continue erasure best-effort across caches.
      }
    }
  }

  return {
    localStorageKeysRemoved,
    cacheNamesRemoved,
    indexedDbCleared: await deleteAppIndexedDb(),
  };
}
