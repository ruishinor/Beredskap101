import { expect, test, type Page } from '@playwright/test';

function trackPageErrors(page: Page, pageErrors: string[]) {
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });
}

test.describe('system status telemetry (phase 1)', () => {
  test('status panel reflects real signals and flips offline when the browser goes offline', async ({ page, context, baseURL }) => {
    const pageErrors: string[] = [];
    trackPageErrors(page, pageErrors);

    await page.goto(`${baseURL}/`, { waitUntil: 'load' });
    await page.getByRole('button', { name: 'Show details' }).click();

    const connection = page.locator('[data-testid="status-connection"]');
    const cache = page.locator('[data-testid="status-cache"]');
    const feed = page.locator('[data-testid="status-feed"]');
    const guides = page.locator('[data-testid="status-guides"]');

    // Real labels are present; the fabricated static literals are gone.
    await expect(connection).toBeVisible();
    await expect(cache).toBeVisible();
    await expect(feed).toBeVisible();
    await expect(guides).toBeVisible();
    await expect(page.getByText(/BATTERY SAVER/)).toHaveCount(0);

    // Online on load; offline cache flips to Ready once the SW readiness
    // handshake (serviceWorker.ready + active worker) completes.
    await expect(connection).toContainText(/Online|På nett/);
    await expect(cache).toContainText(/Ready|Klar/);

    // Feed status is honest: either a freshness stamp or "not fetched yet".
    await expect(feed).toContainText(/Not fetched yet|Ikke hentet ennå|\d{2}\.\d{2}\.\d{4}/);

    // Browser offline flips the connection status to the offline label in
    // both locales (offline is a designed mode, rendered with warn tokens).
    await context.setOffline(true);
    await expect(connection).toContainText('Offline');

    await page.locator('#btn-lang-no').click();
    await expect(connection).toContainText('Frakoblet');
    await expect(cache).toContainText('Klar');

    // Back online restores the online label.
    await context.setOffline(false);
    await expect(connection).toContainText(/På nett|Nedsatt/);

    expect(pageErrors).toEqual([]);
  });
});
