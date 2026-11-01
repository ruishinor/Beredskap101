import { expect, test } from '@playwright/test';

for (const width of [320, 390]) {
  test(`primary journeys reflow at ${width}px in both languages`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/#knowledge');
    for (const language of ['en', 'no']) {
      await page.locator(`#btn-lang-${language}`).click();
      await expect(page.locator('#offline-local-search')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
      await page.goto('/#checklists');
      await expect(page.locator('[id^="checklist-row-"]').first()).toBeVisible();
      const layout = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        overflow: Array.from(document.querySelectorAll('body *')).filter((element) => element.getBoundingClientRect().right > innerWidth + 1)
          .slice(-10).map((element) => ({ tag: element.tagName, class: element.getAttribute('class'), text: element.textContent?.slice(0, 80) })),
      }));
      expect(layout.width, JSON.stringify(layout.overflow)).toBeLessThanOrEqual(width + 1);
      await page.goto('/#knowledge');
    }
  });
}
