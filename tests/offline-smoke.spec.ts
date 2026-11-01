import { expect, test, type Page } from '@playwright/test';

function trackPageErrors(page: Page, pageErrors: string[]) {
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });
}

test.describe('offline PWA smoke verification', () => {
  test('serves bundled map HEAD and byte ranges offline', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ serviceWorkers: 'allow' });
    try {
      const page = await context.newPage();
      await page.goto(`${baseURL}/`, { waitUntil: 'load' });
      await page.evaluate(() => navigator.serviceWorker.ready);
      await page.reload();
      await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
      await context.setOffline(true);
      const result = await page.evaluate(async () => {
        const head = await fetch('/maps/norway.pmtiles', { method: 'HEAD' });
        const range = await fetch('/maps/norway.pmtiles', { headers: { Range: 'bytes=0-16383' } });
        const full = await (await fetch('/maps/norway.pmtiles')).arrayBuffer();
        const suffix = await fetch('/maps/norway.pmtiles', { headers: { Range: 'bytes=-16' } });
        const suffixBytes = new Uint8Array(await suffix.arrayBuffer());
        const fullBytes = new Uint8Array(full);
        const overlong = await fetch('/maps/norway.pmtiles', { headers: { Range: `bytes=${full.byteLength - 8}-${full.byteLength + 1024}` } });
        return {
          headStatus: head.status,
          size: Number(head.headers.get('content-length')),
          rangeStatus: range.status,
          contentRange: range.headers.get('content-range'),
          bytes: (await range.arrayBuffer()).byteLength,
          suffixStatus: suffix.status,
          suffixMatches: suffixBytes.every((byte, index) => byte === fullBytes[fullBytes.length - 16 + index]),
          overlongStatus: overlong.status,
          overlongBytes: (await overlong.arrayBuffer()).byteLength,
        };
      });
      expect(result.headStatus).toBe(200);
      expect(result.size).toBeGreaterThan(16384);
      expect(result.rangeStatus).toBe(206);
      expect(result.contentRange).toBe(`bytes 0-16383/${result.size}`);
      expect(result.bytes).toBe(16384);
      expect(result.suffixStatus).toBe(206);
      expect(result.suffixMatches).toBe(true);
      expect(result.overlongStatus).toBe(206);
      expect(result.overlongBytes).toBe(8);
    } finally { await context.close(); }
  });

  test('renders the bundled map and shelter markers after an offline reload', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ serviceWorkers: 'allow' });
    try {
      const page = await context.newPage();
      await page.goto(`${baseURL}/`);
      await page.evaluate(() => navigator.serviceWorker.ready);
      await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
      await page.evaluate(() => localStorage.setItem('beredskap101.shelterMap.layerMode.v1', 'offline-package'));
      await context.setOffline(true);
      await page.goto(`${baseURL}/#shelters`);
      await page.reload();
      await expect(page.locator('#shelter-map-canvas')).toHaveClass(/pmtiles-shelter-basemap/);
      await expect(page.locator('.maplibregl-canvas')).toBeVisible();
      await expect.poll(() => page.locator('.maplibre-shelter-marker').count()).toBeGreaterThan(0);
    } finally { await context.close(); }
  });

  test('refreshes core routes offline after service worker install and supports basic click-through', async ({ browser, baseURL }) => {
    test.slow();

    const context = await browser.newContext({
      locale: 'en-US',
      serviceWorkers: 'allow',
      viewport: { width: 1440, height: 1100 },
    });

    const pageErrors: string[] = [];
    const page = await context.newPage();
    trackPageErrors(page, pageErrors);

    await page.goto(`${baseURL}/`, { waitUntil: 'load' });
    await page.locator('#btn-lang-en').click();
    await expect(page.locator('#offline-local-search')).toBeVisible();
    await page.waitForLoadState('networkidle');

    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });

    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
    await expect(page.locator('#offline-local-search')).toBeVisible();

    await context.setOffline(true);

    const knowledgePage = await context.newPage();
    trackPageErrors(knowledgePage, pageErrors);
    await knowledgePage.goto(`${baseURL}/#knowledge`, { waitUntil: 'domcontentloaded' });
    await expect(knowledgePage.locator('#offline-local-search')).toBeVisible();
    const knowledgeStatus = knowledgePage.getByText(/System status|Systemstatus/).first();
    const [knowledgeStatusBox, searchBox] = await Promise.all([
      knowledgeStatus.boundingBox(),
      knowledgePage.locator('#offline-local-search').boundingBox(),
    ]);
    expect(knowledgeStatusBox).not.toBeNull();
    expect(searchBox).not.toBeNull();
    expect((searchBox?.y ?? 0)).toBeGreaterThan((knowledgeStatusBox?.y ?? 0));
    await knowledgePage.locator('#offline-local-search input[type="text"]').fill('vann');
    await expect(knowledgePage.locator('#offline-local-search')).toContainText(/Showing \d+ local matches|Viser \d+ lokale treff/);
    await expect
      .poll(async () => knowledgePage.locator('#offline-local-search article').count())
      .toBeGreaterThan(0);
    await expect(knowledgePage.locator('#official-sources-section')).toContainText(/Live feeds|Cached feeds|Static source list/);
    await expect(knowledgePage.locator('#norway-monitoring-section')).toContainText(/Live data|Cached data|Static source fallback/);
    await expect(knowledgePage.getByRole('button', { name: /Print|Skriv ut/ })).toHaveCount(2);
    const saveJsonButtons = knowledgePage.getByRole('button', { name: /Save JSON|Lagre JSON/ });
    await expect(saveJsonButtons).toHaveCount(2);
    const [download] = await Promise.all([
      knowledgePage.waitForEvent('download'),
      saveJsonButtons.first().click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/beredskap101/);

    const sheltersPage = await context.newPage();
    trackPageErrors(sheltersPage, pageErrors);
    await sheltersPage.goto(`${baseURL}/#shelters`, { waitUntil: 'domcontentloaded' });
    await expect(sheltersPage.getByRole('heading', { name: 'Norwegian Shelters' })).toBeVisible();
    const firstShelterCard = sheltersPage.locator('div[role="button"][tabindex="0"]').filter({ hasText: /Rom: #/ }).first();
    await firstShelterCard.click();
    await expect(firstShelterCard).toHaveAttribute('aria-pressed', 'true');
    await expect(sheltersPage.locator('#shelter-map-canvas')).toBeVisible();

    const libraryPage = await context.newPage();
    trackPageErrors(libraryPage, pageErrors);
    await libraryPage.goto(`${baseURL}/#library`, { waitUntil: 'domcontentloaded' });
    const referenceLibraryCta = libraryPage.getByRole('button', {
      name: /Explore the Extended Reference Library|Open Reference Library/,
    });
    await expect(referenceLibraryCta).toBeVisible();
    await referenceLibraryCta.click();
    await expect(libraryPage.locator('#offline-content-packs')).toBeVisible();
    const firstPackCard = libraryPage.locator('[data-pack-id]').first();
    await firstPackCard.click();
    await expect(firstPackCard).toHaveAttribute('aria-pressed', 'true');
    const mapsPackCard = libraryPage.locator('[data-pack-id="maps-and-shelter-data"]');
    await mapsPackCard.click();
    await expect(libraryPage.getByText(/Selected offline pack|Valgt offline-pakke/).first()).toBeVisible();
    await expect(libraryPage.getByRole('button', { name: /Open shelters|Åpne tilfluktsrom/ })).toBeVisible();
    const medicalPackCard = libraryPage.locator('[data-pack-id="medical-and-first-aid"]');
    await medicalPackCard.click();
    await expect
      .poll(async () => libraryPage.locator('#reference-library-grid article').count())
      .toBeGreaterThan(0);

    const checklistsPage = await context.newPage();
    trackPageErrors(checklistsPage, pageErrors);
    await checklistsPage.goto(`${baseURL}/#checklists`, { waitUntil: 'domcontentloaded' });
    await expect(checklistsPage.getByRole('heading', { name: 'Readiness Checklists' })).toBeVisible();
    const firstChecklistRow = checklistsPage.locator('[id^="checklist-row-"]').first();
    await firstChecklistRow.click();
    await expect
      .poll(async () =>
        checklistsPage.evaluate(() => {
          const raw = window.localStorage.getItem('beredskap_checklists_checked_ids');
          return Array.isArray(raw ? JSON.parse(raw) : null) ? JSON.parse(raw || '[]').length : 0;
        })
      )
      .toBeGreaterThan(0);
    await checklistsPage.reload({ waitUntil: 'domcontentloaded' });
    await expect(checklistsPage.locator('[id^="checklist-row-"]').first()).toBeVisible();
    await expect
      .poll(async () =>
        checklistsPage.evaluate(() => {
          const raw = window.localStorage.getItem('beredskap_checklists_checked_ids');
          return Array.isArray(raw ? JSON.parse(raw) : null) ? JSON.parse(raw || '[]').length : 0;
        })
      )
      .toBeGreaterThan(0);

    expect(pageErrors).toEqual([]);

    await Promise.all([
      knowledgePage.close(),
      sheltersPage.close(),
      libraryPage.close(),
      checklistsPage.close(),
      page.close(),
      context.close(),
    ]);
  });
});
