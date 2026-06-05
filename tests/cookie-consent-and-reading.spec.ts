import { expect, test, type Page } from '@playwright/test';

function trackPageErrors(page: Page, pageErrors: string[]) {
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });
}

const BANNER_TEXT = 'We only use required functional settings stored locally in your browser. No analytics or advertising cookies.';

test.describe('cookie consent and reading list', () => {
  test('persists cookie consent and updates the cookies page when storage is available', async ({ page, baseURL }) => {
    const pageErrors: string[] = [];
    trackPageErrors(page, pageErrors);

    await page.addInitScript(() => {
      try {
        if (!sessionStorage.getItem('__beredskap101_cookie_test_cleared')) {
          localStorage.clear();
          sessionStorage.setItem('__beredskap101_cookie_test_cleared', '1');
        }
      } catch {
        // Ignore storage errors in the test bootstrap.
      }
    });

    await page.goto(`${baseURL}/`, { waitUntil: 'load' });
    await expect(page.getByText(BANNER_TEXT)).toBeVisible();

    await page.getByRole('button', { name: 'Accept optional features' }).click();
    await expect(page.getByText(BANNER_TEXT)).toHaveCount(0);

    await page.evaluate(() => {
      window.location.hash = '#cookies';
    });
    await expect(page.getByRole('heading', { name: 'Cookie Preferences' })).toBeVisible();
    await expect(page.getByText('Current setting: Optional functionality enabled.')).toBeVisible();
    await expect.poll(async () => page.evaluate(() => window.localStorage.getItem('beredskap101_cookie_prefs_v1'))).toContain('"optionalEnabled":true');

    await page.reload({ waitUntil: 'load' });
    await expect(page.getByRole('heading', { name: 'Cookie Preferences' })).toBeVisible();
    await expect(page.getByText('Current setting: Optional functionality enabled.')).toBeVisible();
    await expect(page.getByText(BANNER_TEXT)).toHaveCount(0);

    expect(pageErrors).toEqual([]);
  });

  test('falls back to in-memory cookie state when storage writes are blocked', async ({ page, baseURL }) => {
    const pageErrors: string[] = [];
    trackPageErrors(page, pageErrors);

    await page.addInitScript(() => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function setItem(key: string, value: string) {
        if (key === 'beredskap101_cookie_prefs_v1') {
          throw new Error('cookie storage blocked');
        }

        return originalSetItem.call(this, key, value);
      };
    });

    await page.goto(`${baseURL}/`, { waitUntil: 'load' });
    await expect(page.getByText(BANNER_TEXT)).toBeVisible();

    await page.getByRole('button', { name: 'Accept optional features' }).click();
    await expect(page.getByText(BANNER_TEXT)).toHaveCount(0);

    await page.evaluate(() => {
      window.location.hash = '#cookies';
    });
    await expect(page.getByRole('heading', { name: 'Cookie Preferences' })).toBeVisible();
    await expect(page.getByText('Current setting: Optional functionality enabled.')).toBeVisible();
    await expect.poll(async () => page.evaluate(() => window.localStorage.getItem('beredskap101_cookie_prefs_v1'))).toBeNull();

    expect(pageErrors).toEqual([]);
  });

  test('renders the grouped After trilogy and the new recommendations', async ({ page, baseURL }) => {
    const pageErrors: string[] = [];
    trackPageErrors(page, pageErrors);

    await page.goto(`${baseURL}/#recommended-reading`, { waitUntil: 'load' });
    await expect(page.getByRole('heading', { name: 'Recommended Reading' })).toBeVisible();

    const afterCard = page
      .locator('article')
      .filter({ has: page.getByRole('heading', { name: 'The After series' }) })
      .first();

    await expect(afterCard).toBeVisible();
    await expect(afterCard).toContainText('One Second After');
    await expect(afterCard).toContainText('One Year After');
    await expect(afterCard).toContainText('The Final Day');
    await expect(afterCard.getByRole('link')).toHaveCount(3);
    await expect(afterCard.getByRole('link', { name: 'One Second After' })).toHaveAttribute('href', /OL5947682W/);
    await expect(afterCard.getByRole('link', { name: 'One Year After' })).toHaveAttribute('href', /OL26605017M/);
    await expect(afterCard.getByRole('link', { name: 'The Final Day' })).toHaveAttribute('href', /OL27223563M/);

    for (const title of [
      'Lights Out',
      'Sandworm',
      'Once a Warrior',
      'Tribe',
      'Six Minute X-Ray',
      'Left of Bang',
      'What Every BODY Is Saying',
    ]) {
      await expect(page.getByText(title)).toBeVisible();
    }

    expect(pageErrors).toEqual([]);
  });
});
