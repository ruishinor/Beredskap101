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

function decodeEncryptedPayload(encryptedData: string, passkey: string): unknown | null {
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
  const decoded = decodeEncryptedPayload(encryptedData, passkey);
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

export function exportSecureBackupBundle(bundle: SecureBackupBundle, passkey: string): string {
  return CryptoJS.AES.encrypt(JSON.stringify(bundle), passkey).toString();
}

export function decryptSecureBackupBundle(encryptedData: string, passkey: string): SecureBackupBundle | null {
  const decoded = decodeEncryptedPayload(encryptedData, passkey);
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
