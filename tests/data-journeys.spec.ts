import { expect, test } from '@playwright/test';
import CryptoJS from 'crypto-js';

test('restores a legacy backup with its original short passphrase', async ({ page }) => {
  const backup = CryptoJS.AES.encrypt(JSON.stringify({ checkedIds: ['legacy-water'], notes: {}, lastSynced: 1 }), 'old-key').toString();
  await page.goto('/#checklists');
  await page.getByRole('button', { name: 'Backup & QR Sync' }).click();
  await page.locator('#importPasskey').fill('old-key');
  await page.locator('#importCode').fill(backup);
  await page.locator('#secure-save-manager').getByRole('button', { name: 'Restore data', exact: true }).click();
  await expect(page.locator('#secure-save-manager')).toContainText('Restored: legacy progress');
});

test('restores generated checklist completion after regeneration and reload', async ({ page }) => {
  await page.goto('/#checklists');
  await page.getByRole('button', { name: 'Custom List Generator' }).click();
  await page.getByRole('button', { name: 'GENERATE ADAPTIVE KIT LIST', exact: true }).click();
  const water = page.locator('#dyn-checklist-row-water-calc');
  await water.click();
  await expect(water).toHaveAttribute('aria-checked', 'true');
  await page.reload();
  await page.getByRole('button', { name: 'Custom List Generator' }).click();
  await page.getByRole('button', { name: 'GENERATE ADAPTIVE KIT LIST', exact: true }).click();
  await expect(water).toHaveAttribute('aria-checked', 'true');
  // Checkbox semantics make the same operation available without a pointer.
  await water.focus();
  await page.keyboard.press('Space');
  await expect(water).toHaveAttribute('aria-checked', 'false');
});

test('generated checklist reports storage denial and keeps the prior check state', async ({ page }) => {
  await page.goto('/#checklists');
  await page.getByRole('button', { name: 'Custom List Generator' }).click();
  await page.getByRole('button', { name: 'GENERATE ADAPTIVE KIT LIST', exact: true }).click();
  await page.evaluate(() => {
    IDBDatabase.prototype.transaction = function () { throw new DOMException('Denied', 'SecurityError'); };
    Storage.prototype.setItem = function () { throw new DOMException('Denied', 'QuotaExceededError'); };
  });
  const water = page.locator('#dyn-checklist-row-water-calc');
  await water.click();
  await expect(page.locator('#dynamic-gear-list-builder').getByRole('alert')).toContainText('Could not save');
  await expect(water).toHaveAttribute('aria-checked', 'false');
});

test('does not present missing content review evidence as a date in either language', async ({ page }) => {
  await page.goto('/#reference-library');
  await expect(page.locator('#offline-content-packs')).toContainText('Not documented');
  await expect(page.locator('#offline-content-packs')).not.toContainText('Last verified: 2026-06-01');
  await page.locator('#btn-lang-no').click();
  await expect(page.locator('#offline-content-packs')).toContainText('Ikke dokumentert');
});

test('standard checklists support the keyboard and announce temporary progress when storage fails', async ({ page }) => {
  await page.goto('/#checklists');
  const first = page.locator('[id^="checklist-row-"]').first();
  await first.focus();
  await page.keyboard.press('Space');
  await expect(first).toHaveAttribute('aria-checked', 'true');
  await page.reload();
  await expect(first).toHaveAttribute('aria-checked', 'true');
  await page.evaluate(() => {
    Storage.prototype.setItem = function () { throw new DOMException('Quota', 'QuotaExceededError'); };
  });
  await first.click();
  await expect(page.getByRole('alert')).toContainText('Could not save checklist progress');
  await page.locator('#btn-lang-no').click();
  await expect(page.getByRole('alert')).toContainText('Kunne ikke lagre sjekklistefremdriften');
});
