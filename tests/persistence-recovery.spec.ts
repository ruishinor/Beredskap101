import { expect, test } from '@playwright/test';
import { build } from 'esbuild';
import type * as SaveSystem from '../src/utils/saveSystem';

declare global {
  interface Window { auditStorage: typeof SaveSystem }
}

let storageScript: string;
test.beforeAll(async () => {
  const bundled = await build({
    entryPoints: ['src/utils/saveSystem.ts'], bundle: true, write: false,
    platform: 'browser', format: 'iife', globalName: 'auditStorage',
  });
  storageScript = bundled.outputFiles[0].text;
});

test.beforeEach(async ({ page }) => {
  // Use an empty same-origin document so application effects cannot mask storage failures.
  await page.route('**/audit-storage', (route) => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Storage recovery</title>' }));
  await page.goto('/audit-storage');
  await page.addScriptTag({ content: storageScript });
});

test('loads the last successful fallback write after IndexedDB recovers', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const system = window.auditStorage;
    const oldProgress = { checkedIds: ['old'], notes: {}, lastSynced: 1 };
    // An intentionally restored older snapshot is still the latest write.
    const newProgress = { checkedIds: ['new'], notes: {}, lastSynced: 0 };
    const oldDocuments = [{ id: 'old', title: 'Old note', category: 'general-note' as const, note: 'old', createdAt: 1, updatedAt: 1,
      householdMember: '', source: '', reviewDate: '', sensitive: false, tags: [] }];
    const newDocuments = [{ ...oldDocuments[0], id: 'new', title: 'New note', note: 'new', updatedAt: 2 }];
    await system.saveProgressState(oldProgress);
    await system.saveVaultDocuments(oldDocuments);
    const originalTransaction = IDBDatabase.prototype.transaction;
    IDBDatabase.prototype.transaction = function (...args: Parameters<IDBDatabase['transaction']>) {
      if (args[1] === 'readwrite') throw new DOMException('Simulated storage quota', 'QuotaExceededError');
      return originalTransaction.apply(this, args);
    };
    let fallbackSaved: boolean[];
    try {
      fallbackSaved = [await system.saveProgressState(newProgress), await system.saveVaultDocuments(newDocuments)];
    } finally { IDBDatabase.prototype.transaction = originalTransaction; }
    const recoveredProgress = await system.loadProgressState();
    const recoveredDocuments = await system.loadVaultDocuments();
    // Once IndexedDB can write again, old fallback records must not shadow the new save.
    await system.saveProgressState({ ...newProgress, checkedIds: ['latest'] });
    await system.saveVaultDocuments([{ ...newDocuments[0], id: 'latest' }]);
    return {
      fallbackSaved, recoveredProgress, recoveredDocuments,
      latestProgress: await system.loadProgressState(), latestDocuments: await system.loadVaultDocuments(),
      progressFallback: localStorage.getItem('current-state'),
      documentFallback: localStorage.getItem('beredskap101_document_vault_v1'),
    };
  });
  expect(result.fallbackSaved).toEqual([true, true]);
  expect(result.recoveredProgress.checkedIds).toEqual(['new']);
  expect(result.recoveredDocuments.map((document) => document.id)).toEqual(['new']);
  expect(result.latestProgress.checkedIds).toEqual(['latest']);
  expect(result.latestDocuments.map((document) => document.id)).toEqual(['latest']);
  expect(result.progressFallback).toBeNull();
  expect(result.documentFallback).toBeNull();
});

test('aborts every IndexedDB write when restore fails while queuing its second store', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const system = window.auditStorage;
    const oldProgress = { checkedIds: ['old'], notes: {}, lastSynced: 1 };
    const oldDocuments = [{ id: 'old', title: 'Old note', category: 'general-note' as const, note: 'keep', createdAt: 1, updatedAt: 1,
      householdMember: '', source: '', reviewDate: '', sensitive: false, tags: [] }];
    await system.saveProgressState(oldProgress);
    await system.saveVaultDocuments(oldDocuments);
    localStorage.setItem('beredskap_checklists_checked_ids', '["old"]');
    const bundle = system.buildSecureBackupBundle({ checkedIds: ['new'], notes: {}, lastSynced: 2 }, [], null, {
      beredskap_checklists_checked_ids: '["new"]',
    });
    const originalPut = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (...args: Parameters<IDBObjectStore['put']>) {
      if (this.name === 'document-vault') throw new DOMException('Simulated clone failure', 'DataCloneError');
      return originalPut.apply(this, args);
    };
    let restored;
    try { restored = await system.restoreSecureBackupBundle(bundle, 'v3'); }
    finally { IDBObjectStore.prototype.put = originalPut; }
    return {
      restored, progress: await system.loadProgressState(), documents: await system.loadVaultDocuments(),
      checklist: localStorage.getItem('beredskap_checklists_checked_ids'),
    };
  });
  expect(result.restored).toMatchObject({ ok: false, rollbackComplete: true });
  expect(result.progress.checkedIds).toEqual(['old']);
  expect(result.documents.map((document) => document.id)).toEqual(['old']);
  expect(result.checklist).toBe('["old"]');
});

test('reports failure when both browser storage backends reject writes', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const originalTransaction = IDBDatabase.prototype.transaction;
    const originalSet = Storage.prototype.setItem;
    IDBDatabase.prototype.transaction = function () { throw new DOMException('Denied', 'SecurityError'); };
    Storage.prototype.setItem = function () { throw new DOMException('Denied', 'QuotaExceededError'); };
    try {
      return await window.auditStorage.saveProgressStateResult({ checkedIds: ['new'], notes: {}, lastSynced: 2 });
    } finally {
      IDBDatabase.prototype.transaction = originalTransaction;
      Storage.prototype.setItem = originalSet;
    }
  });
  expect(result).toMatchObject({ ok: false, backend: 'none' });
});

test('does not resurrect documents cleared while IndexedDB writes are unavailable', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const system = window.auditStorage;
    await system.saveVaultDocuments([{ id: 'old', title: 'Old note', category: 'general-note', note: 'old', createdAt: 1, updatedAt: 1,
      householdMember: '', source: '', reviewDate: '', sensitive: false, tags: [] }]);
    const originalTransaction = IDBDatabase.prototype.transaction;
    IDBDatabase.prototype.transaction = function (...args: Parameters<IDBDatabase['transaction']>) {
      if (args[1] === 'readwrite') throw new DOMException('Quota', 'QuotaExceededError');
      return originalTransaction.apply(this, args);
    };
    let cleared;
    try { cleared = await system.clearVaultDocuments(); }
    finally { IDBDatabase.prototype.transaction = originalTransaction; }
    return { cleared, documents: await system.loadVaultDocuments() };
  });
  expect(result.cleared).toBe(true);
  expect(result.documents).toEqual([]);
});

test('does not let a stale legacy progress fallback shadow a newer database record', async ({ page }) => {
  const progress = await page.evaluate(async () => {
    await window.auditStorage.saveProgressState({ checkedIds: ['database-new'], notes: {}, lastSynced: 2 });
    // Older application versions did not remove this fallback on recovery.
    localStorage.setItem('current-state', JSON.stringify({ checkedIds: ['legacy-old'], notes: {}, lastSynced: 1 }));
    return window.auditStorage.loadProgressState();
  });
  expect(progress.checkedIds).toEqual(['database-new']);
});
