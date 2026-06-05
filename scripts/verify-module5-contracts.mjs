import fs from 'node:fs';
import path from 'node:path';
import {
  buildFullLocalDataExportBundle,
  buildSecureBackupBundle,
  clearVaultDocuments,
  decryptSecureBackupBundle,
  deleteVaultDocument,
  eraseAllLocalAppData,
  exportSecureBackup,
  exportSecureBackupBundle,
  loadProgressState,
  loadVaultDocuments,
  saveProgressState,
  saveVaultDocuments,
  upsertVaultDocument,
} from '../src/utils/saveSystem.ts';

const ROOT = process.cwd();

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function pass(message) {
  console.log(`[PASS] ${message}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
  pass(message);
}

function createMemoryStorage() {
  const store = new Map();
  return {
    get length() {
      return store.size;
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null;
    },
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

async function runVaultPersistenceScenarios() {
  const storage = createMemoryStorage();
  globalThis.localStorage = storage;
  globalThis.window = {
    localStorage: storage,
    indexedDB: undefined,
  };

  await clearVaultDocuments();
  const initial = await loadVaultDocuments();
  assert(Array.isArray(initial) && initial.length === 0, 'Vault starts empty after clear.');
  assert(storage.getItem('beredskap101_document_vault_v1') === null, 'Vault clear removes localStorage fallback payload.');

  const docA = {
    id: 'doc-a',
    title: 'Apartment Evacuation Plan',
    category: 'emergency-plan',
    householdMember: 'Primary contact',
    source: 'Civil defence template',
    reviewDate: '2026-12-01',
    sensitive: true,
    tags: ['evacuation', 'block-a'],
    note: 'Meet at north stairwell and carry trauma kit.',
    attachment: {
      fileName: 'plan.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 320000,
      dataUrl: 'data:application/pdf;base64,ZmFrZQ==',
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const docB = {
    id: 'doc-b',
    title: 'Medication Rotation',
    category: 'medication-list',
    householdMember: 'Child 1',
    source: 'GP notes',
    reviewDate: '2026-09-10',
    sensitive: true,
    tags: ['insulin', 'cold-chain'],
    note: 'Check expiry every first Monday.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const saved = await saveVaultDocuments([docA]);
  assert(saved, 'Vault documents can be saved locally.');

  const loadedAfterSave = await loadVaultDocuments();
  assert(loadedAfterSave.length === 1, 'Vault load returns saved records.');

  const upserted = await upsertVaultDocument(docB);
  assert(upserted, 'Vault supports upsert for new records.');
  const loadedAfterUpsert = await loadVaultDocuments();
  assert(loadedAfterUpsert.length === 2, 'Vault contains both records after upsert.');

  const deleted = await deleteVaultDocument('doc-a');
  assert(deleted, 'Vault supports deleting a single record.');
  const loadedAfterDelete = await loadVaultDocuments();
  assert(loadedAfterDelete.length === 1 && loadedAfterDelete[0].id === 'doc-b', 'Vault delete operation removes only target record.');

  const cleared = await clearVaultDocuments();
  assert(cleared, 'Vault supports clearing all documents.');
  assert(storage.getItem('beredskap101_document_vault_v1') === null, 'Empty vault save does not resurrect stale fallback data.');
}

async function runBackupBundleScenarios() {
  const progressState = {
    checkedIds: ['water-3d', 'firstaid-3d'],
    notes: { 'water-3d': 'Rotate weekly' },
    lastSynced: Date.now(),
  };
  const vaultDocuments = await loadVaultDocuments();
  const localAiSettings = {
    enabled: false,
    baseUrl: 'http://localhost:11434/v1',
    model: 'qwen2.5:3b',
    mode: 'disabled',
  };

  await saveProgressState(progressState);
  const loadedProgress = await loadProgressState();
  assert(loadedProgress.checkedIds.length === 2, 'Progress state persistence remains functional.');

  const bundle = buildSecureBackupBundle(progressState, vaultDocuments, localAiSettings);
  assert(bundle.version === 2, 'Secure backup bundle uses version 2 schema.');
  assert(bundle.vaultDocuments.length === vaultDocuments.length, 'Backup bundle includes vault documents.');
  assert(bundle.localAiSettings?.baseUrl === 'http://localhost:11434/v1', 'Backup bundle includes local AI settings.');

  const encrypted = exportSecureBackupBundle(bundle, 'module5-passkey');
  const decrypted = decryptSecureBackupBundle(encrypted, 'module5-passkey');
  assert(Boolean(decrypted), 'Encrypted bundle can be decrypted.');
  assert(decrypted?.vaultDocuments.length === vaultDocuments.length, 'Decrypted bundle preserves vault document count.');

  const legacyEncrypted = exportSecureBackup(progressState, 'module5-passkey');
  const legacyDecoded = decryptSecureBackupBundle(legacyEncrypted, 'module5-passkey');
  assert(Boolean(legacyDecoded), 'Legacy v1 backup payload can be decoded through v2 importer.');
  assert(legacyDecoded?.vaultDocuments.length === 0, 'Legacy v1 restore falls back to empty vault payload.');
}

function runStaticContractChecks() {
  const saveSystemTs = readText('src/utils/saveSystem.ts');
  assert(saveSystemTs.includes("const DB_VERSION = 2"), 'IndexedDB schema version is upgraded for vault support.');
  assert(saveSystemTs.includes("const DOCUMENT_STORE = 'document-vault'"), 'Dedicated document store is defined.');
  assert(saveSystemTs.includes('buildSecureBackupBundle'), 'Secure backup bundle builder exists.');
  assert(saveSystemTs.includes('decryptSecureBackupBundle'), 'Secure backup bundle decryptor exists.');

  const vaultTsx = readText('src/components/LocalDocumentVault.tsx');
  assert(vaultTsx.includes('householdMember') && vaultTsx.includes('source') && vaultTsx.includes('reviewDate') && vaultTsx.includes('sensitive'), 'Vault UI exposes required metadata fields.');
  assert(vaultTsx.includes('Delete all (Article 17)') || vaultTsx.includes('Artikkel 17'), 'Vault UI exposes Article 17 local erase action.');
  assert(vaultTsx.includes('Export notes (JSON)') || vaultTsx.includes('Eksporter notater'), 'Vault UI exposes manual export path.');
  assert(vaultTsx.includes('Import notes') || vaultTsx.includes('Importer notater'), 'Vault UI exposes manual import path.');
  assert(!vaultTsx.includes('fetch('), 'Vault UI performs no API network call for core vault actions.');

  const secureSaveTsx = readText('src/components/SecureSaveManager.tsx');
  assert(secureSaveTsx.includes('loadVaultDocuments'), 'Secure save manager exports vault content.');
  assert(secureSaveTsx.includes('saveVaultDocuments'), 'Secure save manager restores vault content.');
  assert(secureSaveTsx.includes('readLocalAiSettings'), 'Secure save manager includes local AI settings in backup flow.');

  assert(vaultTsx.includes('MAX_VAULT_IMPORT_SIZE_BYTES'), 'Vault import enforces maximum JSON file size.');
  assert(vaultTsx.includes('MAX_IMPORTED_DOCUMENTS'), 'Vault import enforces maximum document count.');
  assert(vaultTsx.includes('hasOversizedImportedAttachment'), 'Vault import rejects oversized embedded attachments.');
  assert(saveSystemTs.includes('buildFullLocalDataExportBundle'), 'Article 20 full local export helper exists.');
  assert(saveSystemTs.includes('eraseAllLocalAppData'), 'Article 17 local erasure helper exists.');
}

async function runArticle17And20Scenarios() {
  const storage = createMemoryStorage();
  const deletedCaches = [];
  let indexedDbDeleteRequested = false;
  globalThis.localStorage = storage;
  globalThis.caches = {
    keys: async () => ['beredskap101-runtime-v1', 'workbox-precache-v1', 'unrelated-cache'],
    delete: async (cacheName) => {
      deletedCaches.push(cacheName);
      return cacheName !== 'unrelated-cache';
    },
  };
  globalThis.window = {
    localStorage: storage,
    indexedDB: undefined,
  };

  storage.setItem('beredskap_checklists_checked_ids', '["water-3d"]');
  storage.setItem('beredskap101_cookie_prefs_v1', '{"necessary":true}');
  storage.setItem('outside_app_key', 'preserve');

  const bundle = await buildFullLocalDataExportBundle();
  assert(bundle.version === 1, 'Full local export uses Article 20 export schema version 1.');
  assert('beredskap_checklists_checked_ids' in bundle.localStorage, 'Full local export includes app localStorage keys.');
  assert(bundle.cacheNames.includes('beredskap101-runtime-v1'), 'Full local export lists available cache names.');

  globalThis.window.indexedDB = {
    deleteDatabase() {
      indexedDbDeleteRequested = true;
      const request = {};
      setTimeout(() => {
        request.onsuccess?.();
      }, 0);
      return request;
    },
  };

  const result = await eraseAllLocalAppData();
  assert(result.localStorageKeysRemoved.includes('beredskap_checklists_checked_ids'), 'Article 17 erasure removes app localStorage keys.');
  assert(storage.getItem('outside_app_key') === 'preserve', 'Article 17 erasure preserves unrelated localStorage keys.');
  assert(result.cacheNamesRemoved.includes('beredskap101-runtime-v1'), 'Article 17 erasure removes Beredskap101 caches.');
  assert(!result.cacheNamesRemoved.includes('unrelated-cache'), 'Article 17 erasure preserves unrelated caches.');
  assert(indexedDbDeleteRequested && result.indexedDbCleared, 'Article 17 erasure requests IndexedDB deletion.');
}

async function run() {
  await runVaultPersistenceScenarios();
  await runBackupBundleScenarios();
  await runArticle17And20Scenarios();
  runStaticContractChecks();
  console.log('\n[SUCCESS] Module 5 contract verification completed with no errors or flags.');
}

run().catch((error) => {
  console.error('[FAIL]', error.message || error);
  process.exit(1);
});
