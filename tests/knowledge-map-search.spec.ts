import { expect, test, type Page } from '@playwright/test';

function trackPageErrors(page: Page, pageErrors: string[]) {
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });
}

test.describe('knowledge map search wiring (phase 1)', () => {
  test('types into the shared offline local-search pipeline in both locales', async ({ page, baseURL }) => {
    const pageErrors: string[] = [];
    trackPageErrors(page, pageErrors);

    await page.goto(`${baseURL}/`, { waitUntil: 'load' });

    // Expand the KnowledgeMap details panel to reach the search field.
    await page.getByRole('button', { name: 'Show details' }).click();

    // Differentiated placeholder: KnowledgeMap field searches all content, the
    // results-block field keeps its scoped label.
    const knowledgeMapSearch = page.getByPlaceholder('Search all content…');
    await expect(knowledgeMapSearch).toBeVisible();
    await expect(page.locator('#offline-local-search input[type="text"]')).toHaveAttribute(
      'placeholder',
      'Search: shelter, water, first aid, DAB, privacy...'
    );

    // Typing renders real results from the existing localSearchResults pipeline.
    await knowledgeMapSearch.fill('bleeding');
    await expect(page.locator('#offline-local-search')).toContainText(/Showing \d+ local matches/);
    await expect
      .poll(async () => page.locator('#offline-local-search article').count())
      .toBeGreaterThan(0);

    // The shared pipeline mirrors the query into the results-block input.
    await expect(page.locator('#offline-local-search input[type="text"]')).toHaveValue('bleeding');

    // Empty query must not navigate and restores the idle hint.
    await knowledgeMapSearch.fill('');
    await expect(page.locator('#offline-local-search')).toContainText(/Try searches like/);
    await expect.poll(() => page.evaluate(() => window.location.hash)).not.toBe('');

    // Norwegian locale: same field, Norwegian query, Norwegian results copy.
    await page.locator('#btn-lang-no').click();
    const knowledgeMapSearchNo = page.getByPlaceholder('Søk i alt innhold…');
    await expect(knowledgeMapSearchNo).toBeVisible();
    await knowledgeMapSearchNo.fill('blødning');
    await expect(page.locator('#offline-local-search')).toContainText(/Viser \d+ lokale treff/);
    await expect
      .poll(async () => page.locator('#offline-local-search article').count())
      .toBeGreaterThan(0);

    expect(pageErrors).toEqual([]);
  });
});
