import { expect, test, type Page } from '@playwright/test';

function trackPageErrors(page: Page, pageErrors: string[]) {
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });
}

const PROGRESS_KEY = 'beredskap101_map_progress_v2';

test.describe('knowledge map pillar progression (phase 1)', () => {
  test('shows honest 0/N progress per pillar with no lock gating or bypass toggle', async ({ page, baseURL }) => {
    const pageErrors: string[] = [];
    trackPageErrors(page, pageErrors);

    await page.addInitScript(() => {
      try {
        window.localStorage.clear();
      } catch {
        // Ignore storage errors in the test bootstrap.
      }
    });

    await page.goto(`${baseURL}/`, { waitUntil: 'load' });

    // All six pillars are accessible on load: no locked cards, no bypass toggle.
    await expect(page.getByText(/Bypass:/)).toHaveCount(0);
    await expect(page.getByText(/System Lock State|Systemlås/)).toHaveCount(0);
    await expect(page.getByText(/Complete previous step|Complete the previous layer|Fullfør forrige steg|Fullfør det forrige nivået/)).toHaveCount(0);

    // Empty completion store renders honest 0/N progress (never NaN).
    await expect(page.getByText('0/6 done').first()).toBeVisible();
    await expect(page.getByText(/NaN/)).toHaveCount(0);

    expect(pageErrors).toEqual([]);
  });

  test('reflects stored topic completion as per-pillar progress in both locales', async ({ page, baseURL }) => {
    const pageErrors: string[] = [];
    trackPageErrors(page, pageErrors);

    await page.addInitScript((storageKey) => {
      try {
        if (!sessionStorage.getItem('__beredskap101_progression_test_seeded')) {
          window.localStorage.clear();
          window.localStorage.setItem(storageKey, JSON.stringify(['severe-bleeding']));
          sessionStorage.setItem('__beredskap101_progression_test_seeded', '1');
        }
      } catch {
        // Ignore storage errors in the test bootstrap.
      }
    }, PROGRESS_KEY);

    await page.goto(`${baseURL}/`, { waitUntil: 'load' });

    // severe-bleeding belongs to the first-aid-trauma pillar (6 mapped topics).
    await expect(page.getByText('1/6 done').first()).toBeVisible();

    // Norwegian locale renders the same honest progress label.
    await page.locator('#btn-lang-no').click();
    await expect(page.getByText('1/6 fullført').first()).toBeVisible();

    // Progress survives a reload from the persisted checklist store.
    await page.reload({ waitUntil: 'load' });
    await expect(page.getByText('1/6 fullført').first()).toBeVisible();

    expect(pageErrors).toEqual([]);
  });

  test('every pillar card is clickable on load (no content gating)', async ({ page, baseURL }) => {
    const pageErrors: string[] = [];
    trackPageErrors(page, pageErrors);

    await page.goto(`${baseURL}/`, { waitUntil: 'load' });

    // The last pillar in progression order used to be locked behind the others.
    const wildernessCard = page
      .getByRole('button', { name: /Wilderness Survival/ })
      .first();
    await expect(wildernessCard).toBeVisible();
    await wildernessCard.click();

    // Selecting it opens the topic preview in the sidebar.
    await expect(page.getByText('SELECTED CORE')).toBeVisible();

    expect(pageErrors).toEqual([]);
  });
});
