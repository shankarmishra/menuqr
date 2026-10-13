import { test, expect } from '@playwright/test';
import path from 'path';

const VIEWPORTS = [
  { name: 'android_360x800', width: 360, height: 800 },
  { name: 'iphone_390x844', width: 390, height: 844 },
  { name: 'pixel_412x915', width: 412, height: 915 },
  { name: 'tablet_768x1024', width: 768, height: 1024 },
  { name: 'desktop_1366x768', width: 1366, height: 768 },
];

for (const vp of VIEWPORTS) {
  test(`Template gallery visual audit & geometric containment - ${vp.name}`, async ({ page, baseURL }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(`${baseURL}/`, { waitUntil: 'networkidle' });

    // Wait for initial loader to complete cleanly
    await page.waitForTimeout(2600);
    const loader = page.locator('div[role="status"][aria-label="Loading MenusQR"]');
    if (await loader.isVisible()) {
      await loader.waitFor({ state: 'detached', timeout: 6000 }).catch(() => {});
    }

    // Scroll to #templates section
    const templatesSection = page.locator('#templates');
    await expect(templatesSection).toBeVisible();
    await templatesSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    // Verify zero horizontal page overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // Find all cards
    const cards = page.locator('article.template-reveal-card');
    const count = await cards.count();
    expect(count).toBe(10);

    // Verify cards 3, 4, 5 (the exact cards involved in the reported bug)
    const testIndices = [3, 4, 5];

    for (const idx of testIndices) {
      const card = cards.nth(idx);
      const templateId = await card.getAttribute('data-template-id');

      await card.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // Deep geometric inspection of bounding boxes and computed styles
      const metrics = await card.evaluate((cardEl) => {
        // Distinguish the stage column (first child) from the editorial column (last child)
        const stage = cardEl.firstElementChild as HTMLElement;
        const editorial = cardEl.lastElementChild as HTMLElement;

        const phone = stage?.querySelector('[class*="aspect-[393/852]"]') as HTMLElement;
        const bezel = phone?.querySelector('.relative.w-full.h-full.bg-\\[\\#0A0D0C\\]') as HTMLElement;
        const viewport = phone?.querySelector('.rounded-\\[39px\\], .rounded-\\[42px\\]') as HTMLElement;
        const phoneWrapper = phone?.parentElement as HTMLElement;

        // Editorial elements inside the editorial column (NOT inside the phone preview)
        const title = editorial?.querySelector('h3') as HTMLElement;
        const desc = editorial?.querySelector('p.line-clamp-2, p.line-clamp-3, p.max-w-xl') as HTMLElement;
        const cta = editorial?.querySelector('a[href*="/templates#"]') as HTMLElement;

        const cardRect = cardEl.getBoundingClientRect();
        const stageRect = stage ? stage.getBoundingClientRect() : null;
        const phoneRect = phone ? phone.getBoundingClientRect() : null;
        const viewportRect = viewport ? viewport.getBoundingClientRect() : null;
        const titleRect = title ? title.getBoundingClientRect() : null;
        const descRect = desc ? desc.getBoundingClientRect() : null;
        const ctaRect = cta ? cta.getBoundingClientRect() : null;

        const phoneWrapperTransformStyle = phoneWrapper
          ? window.getComputedStyle(phoneWrapper).transformStyle
          : 'none';
        const bezelOverflow = bezel ? window.getComputedStyle(bezel).overflow : 'none';
        const viewportOverflow = viewport ? window.getComputedStyle(viewport).overflow : 'none';
        const ctaPointerEvents = cta ? window.getComputedStyle(cta).pointerEvents : 'none';

        return {
          cardRect: { x: cardRect.x, y: cardRect.y, width: cardRect.width, height: cardRect.height },
          stageRect: stageRect ? { x: stageRect.x, y: stageRect.y, width: stageRect.width, height: stageRect.height } : null,
          phoneRect: phoneRect ? { x: phoneRect.x, y: phoneRect.y, width: phoneRect.width, height: phoneRect.height } : null,
          viewportRect: viewportRect ? { x: viewportRect.x, y: viewportRect.y, width: viewportRect.width, height: viewportRect.height } : null,
          titleText: title ? title.textContent : null,
          titleRect: titleRect ? { x: titleRect.x, y: titleRect.y, width: titleRect.width, height: titleRect.height } : null,
          descRect: descRect ? { x: descRect.x, y: descRect.y, width: descRect.width, height: descRect.height } : null,
          ctaRect: ctaRect ? { x: ctaRect.x, y: ctaRect.y, width: ctaRect.width, height: ctaRect.height } : null,
          phoneWrapperTransformStyle,
          bezelOverflow,
          viewportOverflow,
          ctaPointerEvents,
        };
      });

      // 1. Assert: No 3D compositing context leak (must be 'flat', never 'preserve-3d')
      expect(metrics.phoneWrapperTransformStyle).not.toBe('preserve-3d');

      // 2. Assert: Bezel and Viewport strictly clip internal content
      expect(metrics.bezelOverflow).toBe('hidden');
      expect(metrics.viewportOverflow).toBe('hidden');

      // 3. Assert: Inner screen viewport does not protrude below the phone frame
      expect(metrics.phoneRect).not.toBeNull();
      expect(metrics.viewportRect).not.toBeNull();
      if (metrics.phoneRect && metrics.viewportRect) {
        // Viewport bottom must not exceed phone frame bottom (allow 2px for subpixel border)
        const viewportBottom = metrics.viewportRect.y + metrics.viewportRect.height;
        const phoneBottom = metrics.phoneRect.y + metrics.phoneRect.height;
        expect(viewportBottom).toBeLessThanOrEqual(phoneBottom + 2);

        // Viewport top must not be above phone frame top
        expect(metrics.viewportRect.y).toBeGreaterThanOrEqual(metrics.phoneRect.y - 2);
      }

      // 4. Assert: On mobile viewports, the phone does NOT protrude out of the stage into the editorial title
      expect(metrics.titleRect).not.toBeNull();
      if (vp.width < 768 && metrics.phoneRect && metrics.titleRect && metrics.stageRect) {
        const stageBottom = metrics.stageRect.y + metrics.stageRect.height;
        // The editorial title must start at or below the stage container
        expect(metrics.titleRect.y).toBeGreaterThanOrEqual(stageBottom - 2);

        // The phone visual bottom must remain strictly inside the stage and not intrude into the title text
        const phoneBottom = metrics.phoneRect.y + metrics.phoneRect.height;
        expect(phoneBottom).toBeLessThanOrEqual(metrics.titleRect.y + 10);
      }

      // 5. Assert: CTA button is interactive and within the card boundaries
      expect(metrics.ctaPointerEvents).not.toBe('none');
      if (metrics.ctaRect && metrics.cardRect) {
        const ctaBottom = metrics.ctaRect.y + metrics.ctaRect.height;
        const cardBottom = metrics.cardRect.y + metrics.cardRect.height;
        expect(ctaBottom).toBeLessThanOrEqual(cardBottom + 5);
      }

      // Capture screenshot after full settle
      const screenshotPath = path.resolve(
        `scratch/audit_${vp.name}_card_${idx}_${templateId}.png`
      );
      await page.screenshot({ path: screenshotPath });
    }
  });
}

test('Reduced motion audit - cards render completely without animation glitches', async ({ page, baseURL }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseURL}/`, { waitUntil: 'networkidle' });

  const templatesSection = page.locator('#templates');
  await expect(templatesSection).toBeVisible();
  await templatesSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  // Cards should be visible and fully laid out
  const cards = page.locator('article.template-reveal-card');
  const count = await cards.count();
  expect(count).toBe(10);

  // Verify first and fifth card
  for (const idx of [0, 4]) {
    const card = cards.nth(idx);
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    const title = card.locator('h3').first();
    await expect(title).toBeVisible();

    const cta = card.locator('a[href*="/templates#"]').first();
    await expect(cta).toBeVisible();
  }
});
