import { test } from '@playwright/test';
import path from 'path';

test('Capture Final CTA section across viewports', async ({ page }) => {
  for (const width of [1440, 1024, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const ctaSection = page.locator('text=Print it once.').first().locator('xpath=ancestor::section[1]');
    await ctaSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);

    const outPath = path.resolve(`frontend/e2e/screenshots/final_cta_${width}.png`);
    await ctaSection.screenshot({ path: outPath });
  }
});
