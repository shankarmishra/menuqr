import { test } from '@playwright/test';
import path from 'path';

const VIEWPORTS = [
  { name: '360x800_mobile_compact', width: 360, height: 800 },
  { name: '390x844_mobile_standard', width: 390, height: 844 },
  { name: '430x932_mobile_large', width: 430, height: 932 },
  { name: '768x1024_tablet', width: 768, height: 1024 },
  { name: '1280x800_laptop', width: 1280, height: 800 },
  { name: '1440x900_desktop', width: 1440, height: 900 },
];

test.describe('Site-Wide UI Repair & Premium Mockups Visual Capture', () => {
  for (const vp of VIEWPORTS) {
    test(`Capture Homepage & Sections at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

      // Wait 5.5s for hero scene sequence to reach menu-open stage
      await page.waitForTimeout(5500);

      const outDir = path.resolve('frontend/e2e/screenshots/site_ui_repair', vp.name);

      // 1. Hero Section (Menu Settled)
      const hero = page.locator('section').first();
      await hero.screenshot({ path: path.join(outDir, '01_hero_settled.png') });

      // 2. Scroll to Templates Section
      const templatesSection = page.locator('#templates');
      if (await templatesSection.count() > 0) {
        await templatesSection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1500);
        await templatesSection.screenshot({ path: path.join(outDir, '02_templates_section.png') });

        // Capture first 2 cards in template gallery
        const firstCard = page.locator('.template-reveal-card').first();
        if (await firstCard.count() > 0) {
          await firstCard.screenshot({ path: path.join(outDir, '03_template_card_1.png') });
        }
      }

      // 3. Customer Experience Section
      const dinerExp = page.locator('text=Diner Experience').first();
      if (await dinerExp.count() > 0) {
        await dinerExp.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1500);
        await dinerExp.locator('xpath=ancestor::section[1]').screenshot({ path: path.join(outDir, '04_diner_experience.png') });
      }

      // 4. Ordering System Section
      const orderingSystem = page.locator('text=A menu that can become an ordering system').first();
      if (await orderingSystem.count() > 0) {
        await orderingSystem.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1500);
        await orderingSystem.locator('xpath=ancestor::section[1]').screenshot({ path: path.join(outDir, '05_ordering_system.png') });
      }
    });
  }

  test('Capture Live Customer Menu for Mannat', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:5173/menu/mannat-tandoori-junction', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const outDir = path.resolve('frontend/e2e/screenshots/site_ui_repair/customer_menu');
    await page.screenshot({ path: path.join(outDir, '01_mannat_customer_top.png') });

    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, '02_mannat_customer_scrolled.png') });
  });
});
