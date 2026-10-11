import { test, expect } from '@playwright/test';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const auditDir = resolve(__dirname, '../../visual-audit/phase2');

test.beforeAll(() => {
  if (!fs.existsSync(auditDir)) {
    fs.mkdirSync(auditDir, { recursive: true });
  }
});

const viewports = [
  { name: 'desktop', width: 1440, height: 900, isMobile: false, hasTouch: false },
  { name: 'tablet', width: 768, height: 1024, isMobile: true, hasTouch: true },
  { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true },
];

const dismissLoader = async (page: any) => {
  const loader = page.locator('div[role="status"][aria-label="Loading MenusQR"]');
  if (await loader.isVisible()) {
    await loader.waitFor({ state: 'detached', timeout: 6000 }).catch(() => {});
  }
};

for (const vp of viewports) {
  test.describe(`Visual Audit & Scroll Testing - ${vp.name} (${vp.width}x${vp.height})`, () => {
    test.use({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.hasTouch,
    });

    test(`Hero Phone & Menu Showcase on ${vp.name}`, async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded' });
      await dismissLoader(page);
      await page.waitForTimeout(4800); // Wait for hero phone scan animation sequence

      const heroPhone = page.locator('div[class*="PremiumIPhoneMockup"], div[class*="rounded-[48px]"], div[class*="rounded-[52px]"]').first();
      await expect(heroPhone).toBeVisible();

      // Verify no horizontal overflow in phone frame
      const hasOverflow = await heroPhone.evaluate((el: HTMLElement) => el.scrollWidth > el.clientWidth + 8);
      expect(hasOverflow).toBeFalsy();

      // Verify authentic rupee prices and dishes
      const restaurantHeading = page.getByText('Royal Haveli').first();
      await expect(restaurantHeading).toBeVisible();
      await expect(page.getByText(/₹385|₹495/).first()).toBeVisible();

      // Verify dish names are not truncated
      const paneerText = await page.getByText(/Paneer Tikka Angara/).first().textContent();
      expect(paneerText).not.toContain('...');
      expect(paneerText).not.toContain('…');

      await page.screenshot({
        path: `${auditDir}/${vp.name}-hero-menu.png`,
        clip: await heroPhone.boundingBox() || undefined,
      });
      await page.screenshot({ path: `${auditDir}/${vp.name}-hero-full.png` });
    });

    test(`Same Menu Different Personality on ${vp.name}`, async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded' });
      await dismissLoader(page);
      const sameMenuSection = page.getByRole('heading', { name: /Same menu/i });
      await sameMenuSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // Verify all 6 comparison template options
      const templates = [
        'Royal Maharaja',
        'Rajasthani Heritage',
        'Mughal Luxe',
        'Banarasi Gold',
        'Modern India',
        'Bombay Street',
      ];

      for (const tName of templates) {
        const btn = page.getByRole('button', { name: new RegExp(tName, 'i') });
        if (await btn.isVisible()) {
          await btn.scrollIntoViewIfNeeded();
          await btn.click();
          await page.waitForTimeout(300);

          // Assert active template badge shows selected template name
          const viewingBadge = page.locator('div').filter({ hasText: 'Viewing' }).last();
          await expect(viewingBadge.getByText(tName, { exact: true })).toBeVisible();

          // Assert dish name is not truncated with ellipsis
          const firstDish = page.locator('h3').first();
          if (await firstDish.isVisible()) {
            const dishName = await firstDish.textContent();
            expect(dishName).not.toContain('...');
            expect(dishName).not.toContain('…');
          }

          await page.screenshot({ path: `${auditDir}/${vp.name}-same-menu-${tName.toLowerCase().replace(/\s+/g, '-')}.png` });
        }
      }
    });

    test(`Template Gallery Scroll & Filtering on ${vp.name}`, async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded' });
      await dismissLoader(page);
      const galleryHeader = page.getByRole('heading', { name: /Menus with a/i });
      await galleryHeader.scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);

      await page.screenshot({ path: `${auditDir}/${vp.name}-gallery-start.png` });

      // Scroll smoothly down the gallery
      const cards = page.locator('article[data-template-id]');
      const initialCount = await cards.count();
      expect(initialCount).toBe(10);

      // Verify no card overlap: check bounding boxes of adjacent cards
      if (initialCount >= 2) {
        const b1 = await cards.nth(0).boundingBox();
        const b2 = await cards.nth(1).boundingBox();
        if (b1 && b2) {
          expect(b1.width).toBeGreaterThan(200);
          expect(b1.height).toBeGreaterThan(150);
          const isSideBySide = b2.x > b1.x + b1.width * 0.5;
          const isBelow = b2.y >= b1.y + b1.height * 0.5;
          expect(isSideBySide || isBelow).toBeTruthy();
        }
      }

      // Middle scroll
      await cards.nth(Math.floor(initialCount / 2)).scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${auditDir}/${vp.name}-gallery-middle.png` });

      // End of gallery scroll
      await cards.last().scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${auditDir}/${vp.name}-gallery-end.png` });

      // Rapid reverse scroll test
      await page.mouse.wheel(0, -1200);
      await page.waitForTimeout(300);
      await galleryHeader.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${auditDir}/${vp.name}-gallery-reverse-top.png` });

      // Filter testing: click Indian pill
      const indianFilter = page.locator('#templates').getByRole('button', { name: 'Indian', exact: true }).first();
      if (await indianFilter.isVisible()) {
        await indianFilter.click();
        await page.waitForTimeout(400);

        // Verify subset filtered count
        const filteredCount = await cards.count();
        expect(filteredCount).toBeGreaterThan(0);
        expect(filteredCount).toBeLessThan(10);

        await page.screenshot({ path: `${auditDir}/${vp.name}-gallery-filter-indian.png` });
      }

      // Switch back to All
      const allFilter = page.locator('#templates').getByRole('button', { name: 'All', exact: true }).first();
      if (await allFilter.isVisible()) {
        await allFilter.click();
        await page.waitForTimeout(400);
        const restoredCount = await cards.count();
        expect(restoredCount).toBe(10);
      }
    });
  });
}
