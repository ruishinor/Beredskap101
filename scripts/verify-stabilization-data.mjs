import assert from 'node:assert/strict';
import {
  buildSecureBackupBundle,
  readBackupApplicationStorage,
  restoreSecureBackupBundle,
  saveVaultDocuments,
  validateVaultDocuments,
} from '../src/utils/saveSystem.ts';

function memoryStorage(initial = {}, failAt = Infinity) {
  const entries = new Map(Object.entries(initial));
  let writes = 0;
  return {
    entries,
    get length() { return entries.size; },
    key(index) { return [...entries.keys()][index] ?? null; },
    getItem(key) { return entries.get(key) ?? null; },
    setItem(key, value) {
      if (++writes === failAt) throw new Error('Simulated quota failure');
      entries.set(key, String(value));
    },
    removeItem(key) {
      if (++writes === failAt) throw new Error('Simulated denial');
      entries.delete(key);
    },
  };
}

const oldDocuments = [{ id: 'old', title: 'Old note', category: 'general-note', note: 'keep', createdAt: 1, updatedAt: 1 }];
const newDocuments = [{ id: 'new', title: 'New note', category: 'general-note', note: 'new', createdAt: 2, updatedAt: 2 }];
const oldProgress = { checkedIds: ['old'], notes: {}, lastSynced: 1 };
const newProgress = { checkedIds: ['new'], notes: {}, lastSynced: 2 };
const oldState = {
  'current-state': JSON.stringify(oldProgress),
  'beredskap101_document_vault_v1': JSON.stringify(oldDocuments),
  'beredskap_checklists_checked_ids': '["old"]',
  'beredskap101_map_progress_v2': '["old"]',
  'beredskap_ext_notes_article': '{"1":"old note"}',
};

let storage = memoryStorage({}, 1);
globalThis.localStorage = storage;
globalThis.window = { localStorage: storage, indexedDB: undefined };
assert.equal(await saveVaultDocuments(newDocuments), false, 'denied storage must report failure');
assert.equal(validateVaultDocuments([{ ...newDocuments[0], category: 'invalid' }]), null, 'invalid categories must be rejected');

storage = memoryStorage(oldState);
globalThis.localStorage = storage;
globalThis.window.localStorage = storage;
const captured = readBackupApplicationStorage();
assert.equal(captured['beredskap_ext_notes_article'], oldState['beredskap_ext_notes_article']);
assert.equal(captured['beredskap_checklists_checked_ids'], '["old"]');
const bundle = buildSecureBackupBundle(newProgress, newDocuments, null, {
  'beredskap_checklists_checked_ids': '["new"]',
  'beredskap101_map_progress_v2': '["new"]',
  'beredskap_ext_notes_article': '{"1":"new note"}',
});
assert.equal(bundle.applicationStorage['beredskap_ext_notes_article'], '{"1":"new note"}');

for (let failAt = 1; failAt <= 5; failAt += 1) {
  storage = memoryStorage(oldState, failAt);
  globalThis.localStorage = storage;
  globalThis.window.localStorage = storage;
  const failed = await restoreSecureBackupBundle(bundle, 'v3');
  assert.equal(failed.ok, false);
  assert.equal(failed.rollbackComplete, true);
  assert.deepEqual(Object.fromEntries(storage.entries), oldState, `restore failure at write ${failAt} must roll back prior local records`);
}

storage = memoryStorage(oldState);
const originalSetItem = storage.setItem.bind(storage);
let persistentDenialWrites = 0;
storage.setItem = (key, value) => {
  if (++persistentDenialWrites >= 2) throw new Error('Persistent storage denial');
  originalSetItem(key, value);
};
globalThis.localStorage = storage;
globalThis.window.localStorage = storage;
assert.deepEqual(await restoreSecureBackupBundle(bundle, 'v3'), {
  ok: false, rollbackComplete: false, error: 'Persistent storage denial',
}, 'irrecoverable rollback failure must be reported as partial, never successful');

storage = memoryStorage(oldState);
globalThis.localStorage = storage;
globalThis.window.localStorage = storage;
assert.equal((await restoreSecureBackupBundle(bundle, 'v3')).ok, true);
assert.equal(storage.getItem('beredskap_checklists_checked_ids'), '["new"]');
assert.equal(storage.getItem('beredskap_ext_notes_article'), '{"1":"new note"}');
assert.equal(JSON.parse(storage.getItem('beredskap101_document_vault_v1'))[0].id, 'new');

storage = memoryStorage(oldState);
globalThis.localStorage = storage;
globalThis.window.localStorage = storage;
const legacy = buildSecureBackupBundle(newProgress, [], null);
assert.equal((await restoreSecureBackupBundle(legacy, 'v1')).ok, true);
assert.equal(storage.getItem('beredskap101_document_vault_v1'), oldState['beredskap101_document_vault_v1'], 'legacy progress import must preserve documents');

console.log('Stabilization data checks passed.');
