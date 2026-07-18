import { expect, test, type Page } from '@playwright/test';

const OSM_TILE_URL_PATTERN = '**/tile.openstreetmap.org/**';
const TRANSPARENT_PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

// Registers page-error tracking and returns the assertion to run at test end.
function assertNoPageErrors(page: Page) {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });
  return () => expect(pageErrors).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  await page.route(OSM_TILE_URL_PATTERN, (route) =>
    route.fulfill({ status: 200, contentType: 'image/png', body: TRANSPARENT_PIXEL_PNG })
  );
});

test.describe('ui regressions', () => {
  test('library: keeps feature cards visible with distinct card presentation', async ({ page, baseURL }) => {
    const checkPageErrors = assertNoPageErrors(page);

    await page.goto(`${baseURL}/#library`, { waitUntil: 'load' });
    await page.locator('#btn-lang-en').click();
    await page.getByRole('button', { name: 'Light', exact: true }).click();

    const firstFeatureCard = page.locator('article.feature-card').first();
    await expect(firstFeatureCard).toBeVisible();

    const featureCardPresentation = await firstFeatureCard.evaluate((node) => {
      const cardStyles = getComputedStyle(node as HTMLElement);
      const parentSection = node.closest('section');
      const parentStyles = parentSection ? getComputedStyle(parentSection as HTMLElement) : null;

      return {
        cardBackgroundImage: cardStyles.backgroundImage,
        cardBackgroundColor: cardStyles.backgroundColor,
        parentBackgroundImage: parentStyles?.backgroundImage ?? null,
        parentBackgroundColor: parentStyles?.backgroundColor ?? null,
        boxShadow: cardStyles.boxShadow,
      };
    });

    expect(featureCardPresentation.boxShadow).not.toBe('none');
    expect(
      `${featureCardPresentation.cardBackgroundImage}|${featureCardPresentation.cardBackgroundColor}`
    ).not.toBe(
      `${featureCardPresentation.parentBackgroundImage}|${featureCardPresentation.parentBackgroundColor}`
    );

    checkPageErrors();
  });

  test('support: exposes contact email and GDPR article guidance', async ({ page, baseURL }) => {
    const checkPageErrors = assertNoPageErrors(page);

    await page.goto(`${baseURL}/#support`, { waitUntil: 'load' });
    await expect(page.getByRole('heading', { name: 'Support', exact: true })).toBeVisible();
    await expect(page.locator('a[href="mailto:info@holf.services"]').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Copy email address|Kopier e-postadresse/ }).first()).toBeVisible();
    await expect(page.locator('section')).toContainText(/Article 17|Artikkel 17/);
    await expect(page.locator('section')).toContainText(/Article 20|Artikkel 20/);

    checkPageErrors();
  });

  test('contact: exposes the contact email link', async ({ page, baseURL }) => {
    const checkPageErrors = assertNoPageErrors(page);

    await page.goto(`${baseURL}/#contact`, { waitUntil: 'load' });
    await expect(page.locator('a[href="mailto:info@holf.services"]').first()).toBeVisible();

    checkPageErrors();
  });

  test('shelters: street mode loads tiles and shows the street-active label', async ({ page, baseURL }) => {
    const checkPageErrors = assertNoPageErrors(page);

    await page.goto(`${baseURL}/#shelters`, { waitUntil: 'load' });
    await expect(page.locator('#shelter-map-canvas')).toBeVisible();

    // 'topographic' is a legacy value coerced to 'street' on read
    // (ShelterMap.tsx readPersistedMapLayerMode); reloading lets the
    // component persist the coerced mode so the Street click below is real.
    await page.evaluate(() => {
      window.localStorage.setItem('beredskap101.shelterMap.layerMode.v1', 'topographic');
    });
    await page.reload({ waitUntil: 'load' });

    await expect(page.locator('#shelter-map-canvas')).toHaveClass(/leaflet-container|maplibregl-map/);
    await expect(page.locator('body')).toContainText(/Street is the default|Gatekart er standard/);
    await expect.poll(async () => page.evaluate(() => window.localStorage.getItem('beredskap101.shelterMap.layerMode.v1'))).toBe('street');
    await expect(page.locator('button').filter({ hasText: /Topo/ })).toHaveCount(0);

    const streetLayerButton = page.locator('button').filter({ hasText: /Street|Gatekart/ }).first();
    await expect(streetLayerButton).toBeVisible();
    await streetLayerButton.click();
    await expect(page.locator('body')).toContainText(/Street map active|Gatekart aktivt/);

    checkPageErrors();
  });

  test('shelters: bundled offline package copy and shelter popup links are honest', async ({ page, baseURL }) => {
    const checkPageErrors = assertNoPageErrors(page);

    await page.goto(`${baseURL}/#shelters`, { waitUntil: 'load' });
    await expect(page.locator('#shelter-map-canvas')).toBeVisible();

    const offlinePackageButton = page.locator('button').filter({ hasText: /Offline package|Offline-pakke/ }).first();
    await expect(offlinePackageButton).toBeEnabled();
    await offlinePackageButton.click();
    await expect(page.locator('body')).toContainText(/Offline package ready|Offline-pakke klar/);
    await expect(page.locator('body')).toContainText(/Bundled local file|Innebygd lokal fil/);
    await expect(page.locator('body')).toContainText(/Orientation only, not routing|Orientering, ikke ruting/);
    await expect(page.locator('body')).not.toContainText(/not installed in this copy|ikke tilgjengelig i denne kopien/);
    await expect(page.locator('#shelter-map-canvas')).toHaveClass(/pmtiles-shelter-basemap/);
    await page.locator('div[role="button"][tabindex="0"]').filter({ hasText: /Rom: #/ }).first().click();
    await expect(page.getByRole('link', { name: /Open in OpenStreetMap|Åpne i OpenStreetMap/ }).first()).toHaveAttribute('href', /openstreetmap\.org/);
    await expect(page.getByRole('link', { name: /Data source|Datakilde/ }).first()).toHaveAttribute('href', /objektkatalog\.geonorge\.no/);
    await expect(page.getByRole('link', { name: /DSB guidance|Råd fra DSB/ }).first()).toHaveAttribute('href', /dsb\.no/);

    checkPageErrors();
  });

  test('shelters: falls back to the offline map background when street tiles fail to load', async ({ page, baseURL }) => {
    const checkPageErrors = assertNoPageErrors(page);

    // Registered after the beforeEach stub, so this handler wins and every
    // tile request is aborted — pinning the tileerror -> offline-grid path.
    await page.route(OSM_TILE_URL_PATTERN, (route) => route.abort());

    await page.goto(`${baseURL}/#shelters`, { waitUntil: 'load' });
    await expect(page.locator('#shelter-map-canvas')).toBeVisible();
    await expect(page.locator('body')).toContainText(/Offline map background|Offline kartbakgrunn/);
    await expect(page.locator('body')).not.toContainText(/Street map active|Gatekart aktivt/);

    checkPageErrors();
  });

  test('checklists: local AI assist explains local-only, no-download behavior', async ({ page, baseURL }) => {
    const checkPageErrors = assertNoPageErrors(page);

    await page.goto(`${baseURL}/#checklists`, { waitUntil: 'load' });
    await page.getByRole('button', { name: 'Local AI Assist' }).click();
    await expect(page.locator('#local-ai-assistant')).toContainText('This app does not download model files.');
    await expect(page.locator('#local-ai-assistant')).toContainText('Data minimization:');
    await expect(page.locator('#local-ai-assistant')).toContainText('Recommended: qwen2.5:3b, llama3.2:3b, mistral:7b-instruct');

    checkPageErrors();
  });

  test('checklists: local document vault explains IndexedDB/local-only export', async ({ page, baseURL }) => {
    const checkPageErrors = assertNoPageErrors(page);

    await page.goto(`${baseURL}/#checklists`, { waitUntil: 'load' });
    await page.getByRole('button', { name: 'Local Document Vault' }).click();
    await expect(page.locator('#local-document-vault')).toContainText('IndexedDB with localStorage fallback');
    await expect(page.locator('#local-document-vault')).toContainText('Export/import is manual and local only');

    checkPageErrors();
  });

  test('faq: answers privacy, local AI, map package, and export questions', async ({ page, baseURL }) => {
    const checkPageErrors = assertNoPageErrors(page);

    await page.goto(`${baseURL}/#faq`, { waitUntil: 'load' });
    await expect(page.locator('section')).toContainText('Do you store personal data?');
    await expect(page.locator('section')).toContainText('How do I start using a local AI model here?');
    await expect(page.locator('section')).toContainText('There is no automatic cloud sync');
    await expect(page.locator('section')).toContainText('How does the map package work now?');
    await expect(page.locator('section')).toContainText('How do export and deletion work?');
    await expect(page.locator('section')).toContainText(/orientation backdrop|orienteringsbakgrunn/);

    checkPageErrors();
  });

  test('privacy: states no cloud sync and no server-bound data', async ({ page, baseURL }) => {
    const checkPageErrors = assertNoPageErrors(page);

    await page.goto(`${baseURL}/#privacy`, { waitUntil: 'load' });
    await expect(page.locator('section')).toContainText('No automatic cloud sync is used');
    await expect(page.locator('section')).toContainText('No data is sent to Beredskap101 servers.');

    checkPageErrors();
  });

  test('about: states local-first PWA positioning without telemetry', async ({ page, baseURL }) => {
    const checkPageErrors = assertNoPageErrors(page);

    await page.goto(`${baseURL}/#about`, { waitUntil: 'load' });
    await expect(page.locator('section')).toContainText('100% local-first Progressive Web App');
    await expect(page.locator('section')).toContainText('free from cloud sync or central telemetry');

    checkPageErrors();
  });
});
