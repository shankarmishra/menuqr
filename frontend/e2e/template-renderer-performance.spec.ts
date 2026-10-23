import { test, expect } from '@playwright/test';

test.describe('Phase 2.3 — Template Renderer Performance & Dynamic Splitting', () => {
  test('Initial homepage load does NOT download DynamicDesignEngine or individual template chunks', async ({ page }) => {
    const downloadedChunks: string[] = [];

    page.on('response', (res) => {
      const url = res.url();
      if (url.includes('/assets/')) {
        const filename = url.split('/').pop() || '';
        downloadedChunks.push(filename);
      }
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    // Confirm DynamicDesignEngine is not downloaded above the fold
    const hasDynamicDesignEngine = downloadedChunks.some((name) =>
      name.toLowerCase().includes('dynamicdesignengine')
    );
    expect(
      hasDynamicDesignEngine,
      'DynamicDesignEngine chunk should NOT be downloaded on initial marketing home page load'
    ).toBe(false);

    // Confirm that heavy template chunks are not all eagerly loaded before scrolling
    const templateChunks = downloadedChunks.filter(
      (name) =>
        name.includes('Template-') ||
        name.includes('HeritageArtboard') ||
        name.includes('ArchesAndEmblems')
    );

    // Initial above-the-fold viewport should not download the entire suite of 15 templates
    expect(
      templateChunks.length,
      'Templates should be split into dynamic chunks rather than eagerly bundled into entry'
    ).toBeLessThan(15);
  });

  test('Scrolling to Template Gallery loads signature templates dynamically with functional phone previews', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const templatesSection = page.locator('#templates');
    await expect(templatesSection).toBeAttached();

    // Scroll gallery into view
    await templatesSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    // Verify template cards are rendered
    const cards = page.locator('#templates article.template-reveal-card');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });

    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThanOrEqual(5);

    // Ensure no uncaught runtime or chunk-loading exceptions occurred
    expect(errors).toEqual([]);
  });

  test('Category filter switches templates and renders lazy components without layout crash', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const templatesSection = page.locator('#templates');
    await templatesSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Find category buttons in the template gallery
    const categoryButtons = page.locator('#templates button[role="tab"], #templates .gallery-pill-btn, #templates button').filter({
      hasText: /Fine Dining|Casual|Heritage|All/i,
    });

    if (await categoryButtons.count() > 1) {
      // Click a specific filter category
      const targetBtn = categoryButtons.nth(1);
      await targetBtn.click();
      await page.waitForTimeout(400);

      const activeCards = page.locator('#templates article.template-reveal-card');
      const count = await activeCards.count();
      expect(count).toBeGreaterThan(0);

      // Return to All
      const allBtn = categoryButtons.first();
      await allBtn.click();
      await page.waitForTimeout(400);
      expect(await activeCards.count()).toBeGreaterThan(0);
    }

    expect(errors).toEqual([]);
  });

  test('Templates page (/templates) loads cleanly without downloading DynamicDesignEngine', async ({ page }) => {
    const downloadedChunks: string[] = [];

    page.on('response', (res) => {
      const url = res.url();
      if (url.includes('/assets/')) {
        downloadedChunks.push(url.split('/').pop() || '');
      }
    });

    await page.goto('/templates', { waitUntil: 'networkidle' });

    const h1 = page.locator('h1');
    await expect(h1).toContainText(/Digital Menu Templates/i);

    const hasDynamicDesignEngine = downloadedChunks.some((name) =>
      name.toLowerCase().includes('dynamicdesignengine')
    );
    expect(hasDynamicDesignEngine).toBe(false);
  });
});
