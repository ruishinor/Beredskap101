import { expect, test, type Page } from '@playwright/test';

function trackPageErrors(page: Page, pageErrors: string[]) {
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });
}

test.describe('ui regressions', () => {
  test('keeps library cards visible in light mode, normalizes the shelter map, and explains local-only storage/AI', async ({ page, baseURL }) => {
    const pageErrors: string[] = [];
    trackPageErrors(page, pageErrors);

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

    await page.goto(`${baseURL}/#shelters`, { waitUntil: 'load' });
    await expect(page.locator('#shelter-map-canvas')).toBeVisible();

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

    const offlinePackageButton = page.locator('button').filter({ hasText: /Offline package|Offline-pakke/ }).first();
    await expect(offlinePackageButton).toBeEnabled();
    await offlinePackageButton.click();
    await expect(page.locator('body')).toContainText(/offline package is not installed|Offline-pakken er ikke installert/);
    await expect(page.locator('#shelter-map-canvas')).not.toHaveClass(/pmtiles-shelter-basemap/);
    await page.locator('div[role="button"][tabindex="0"]').filter({ hasText: /Rom: #/ }).first().click();
    await expect(page.getByRole('link', { name: /Open in OpenStreetMap|Åpne i OpenStreetMap/ }).first()).toHaveAttribute('href', /openstreetmap\.org/);
    await expect(page.getByRole('link', { name: /Data source|Datakilde/ }).first()).toHaveAttribute('href', /objektkatalog\.geonorge\.no/);
    await expect(page.getByRole('link', { name: /DSB guidance|Råd fra DSB/ }).first()).toHaveAttribute('href', /dsb\.no/);

    const footerPrivacyButton = page.locator('footer button').filter({ hasText: /Privacy|Personvern/ }).first();
    const footerCopyButton = page.locator('footer button').filter({ hasText: /Copy email|Kopier e-post/ }).first();
    for (const control of [footerPrivacyButton, footerCopyButton]) {
      const box = await control.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }

    await page.goto(`${baseURL}/#checklists`, { waitUntil: 'load' });
    await page.getByRole('button', { name: 'Local AI Assist' }).click();
    await expect(page.locator('#local-ai-assistant')).toContainText('This app does not download model files.');
    await expect(page.locator('#local-ai-assistant')).toContainText('Data minimization:');
    await expect(page.locator('#local-ai-assistant')).toContainText('Recommended: qwen2.5:3b, llama3.2:3b, mistral:7b-instruct');

    await page.getByRole('button', { name: 'Local Document Vault' }).click();
    await expect(page.locator('#local-document-vault')).toContainText('IndexedDB with localStorage fallback');
    await expect(page.locator('#local-document-vault')).toContainText('Export/import is manual and local only');

    await page.goto(`${baseURL}/#faq`, { waitUntil: 'load' });
    await expect(page.locator('section')).toContainText('What is stored locally on this device?');
    await expect(page.locator('section')).toContainText('How do I start using a local AI model here? ELI5.');
    await expect(page.locator('section')).toContainText('manual and local only');
    await expect(page.locator('section')).toContainText('For most people: you do not need to do anything.');

    await page.goto(`${baseURL}/#privacy`, { waitUntil: 'load' });
    await expect(page.locator('section')).toContainText('No automatic cloud sync is used');
    await expect(page.locator('section')).toContainText('model files are not stored in the app');

    await page.goto(`${baseURL}/#about`, { waitUntil: 'load' });
    await expect(page.locator('section')).toContainText('Local storage, not cloud');
    await expect(page.locator('section')).toContainText('Optional local AI');

    expect(pageErrors).toEqual([]);
  });
});
