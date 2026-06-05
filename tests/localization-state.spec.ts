import { expect, test, type Page } from '@playwright/test';

test.use({ locale: 'nb-NO' });

function trackPageErrors(page: Page, pageErrors: string[]) {
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });
}

async function expectLanguageState(page: Page, language: 'en' | 'no') {
  const activeSelector = language === 'en' ? '#btn-lang-en' : '#btn-lang-no';
  const inactiveSelector = language === 'en' ? '#btn-lang-no' : '#btn-lang-en';

  await expect(page.locator('#btn-lang-en')).toBeVisible();
  await expect(page.locator('#btn-lang-no')).toBeVisible();
  await expect(page.locator(activeSelector)).toHaveClass(/font-extrabold/);
  await expect(page.locator(inactiveSelector)).not.toHaveClass(/font-extrabold/);
  await expect.poll(async () => page.evaluate(() => document.documentElement.lang)).toBe(language === 'no' ? 'nb' : 'en');
  await expect.poll(async () => page.evaluate(() => window.localStorage.getItem('beredskap101_language_v1'))).toBe(language);
}

async function expectThemeState(page: Page, theme: 'dark' | 'light') {
  const activeSelector = theme === 'dark' ? '#btn-theme-dark' : '#btn-theme-light';
  const inactiveSelector = theme === 'dark' ? '#btn-theme-light' : '#btn-theme-dark';

  await expect(page.locator(activeSelector)).toHaveClass(/font-extrabold/);
  await expect(page.locator(inactiveSelector)).not.toHaveClass(/font-extrabold/);
  await expect(page.locator('.app')).toHaveClass(new RegExp(`theme-${theme}`));
  await expect.poll(async () => page.evaluate(() => window.localStorage.getItem('beredskap101_theme_v1'))).toBe(theme);
}

test.describe('localization and theme state', () => {
  test('uses browser Norwegian by default and preserves language through theme toggles, route changes, and reloads', async ({ page, baseURL }) => {
    const pageErrors: string[] = [];
    trackPageErrors(page, pageErrors);

    await page.goto(`${baseURL}/`, { waitUntil: 'load' });
    await expectLanguageState(page, 'no');
    await expect(page.getByRole('button', { name: 'Kunnskap' }).first()).toBeVisible();

    for (const theme of ['light', 'dark', 'light'] as const) {
      await page.locator(`#btn-theme-${theme}`).click();
      await expectThemeState(page, theme);
    }

    for (const route of ['#scenarios', '#recommended-reading', '#checklists']) {
      await page.goto(`${baseURL}/${route}`, { waitUntil: 'load' });
      await expectLanguageState(page, 'no');
    }

    await expect(page.getByText(/Scenarioer|Sjekklister/).first()).toBeVisible();
    await page.reload({ waitUntil: 'load' });
    await expectLanguageState(page, 'no');
    await expectThemeState(page, 'light');
    expect(pageErrors).toEqual([]);
  });

  test('saved language preference overrides browser preference and survives theme toggles and reloads', async ({ page, baseURL }) => {
    const pageErrors: string[] = [];
    trackPageErrors(page, pageErrors);

    await page.goto(`${baseURL}/`, { waitUntil: 'load' });
    await page.evaluate(() => {
      window.localStorage.setItem('beredskap101_language_v1', 'en');
      window.localStorage.setItem('beredskap101_theme_v1', 'dark');
    });
    await page.reload({ waitUntil: 'load' });
    await expectLanguageState(page, 'en');
    await expectThemeState(page, 'dark');
    await expect(page.getByRole('button', { name: 'Knowledge' }).first()).toBeVisible();

    await page.locator('#btn-theme-light').click();
    await expectThemeState(page, 'light');
    await page.reload({ waitUntil: 'load' });
    await expectLanguageState(page, 'en');
    await expectThemeState(page, 'light');
    expect(pageErrors).toEqual([]);
  });
});
