import { test, expect } from '@playwright/test';

test.describe('ScrollStack Deep Regression & Correctness Audit', () => {
  const VIEWPORTS = [
    { name: 'android_360x800', width: 360, height: 800 },
    { name: 'iphone_390x844', width: 390, height: 844 },
    { name: 'pixel_412x915', width: 412, height: 915 },
    { name: 'tablet_768x1024', width: 768, height: 1024 },
    { name: 'desktop_1366x768', width: 1366, height: 768 },
    { name: 'desktop_1440x900', width: 1440, height: 900 },
  ];

  for (const vp of VIEWPORTS) {
    test(`CTA clickability and unclipped boundary across all target cards - ${vp.name}`, async ({
      page,
      baseURL,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded' });

      // Dismiss initial loader
      await page.waitForTimeout(2500);
      const loader = page.locator('div[role="status"][aria-label="Loading MenusQR"]');
      if (await loader.isVisible()) {
        await loader.waitFor({ state: 'detached', timeout: 6000 }).catch(() => {});
      }

      const galleryHeader = page.getByRole('heading', { name: /Menus with a/i });
      await expect(galleryHeader).toBeVisible();
      await galleryHeader.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);

      const cards = page.locator('article.template-reveal-card');
      const count = await cards.count();
      expect(count).toBe(10);

      // Verify Card 0 (first), Card 4 (middle), and Card 9 (last card most vulnerable to clipping)
      for (const cardIndex of [0, 4, 9]) {
        const card = cards.nth(cardIndex);
        await card.scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);

        const cta = card.locator('a[href*="/templates#"]');
        await expect(cta).toBeVisible();

        const ctaMetrics = await cta.evaluate((el) => {
          const rect = el.getBoundingClientRect();
          const winHeight = window.innerHeight;
          const winWidth = window.innerWidth;
          const style = window.getComputedStyle(el);
          return {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            bottom: rect.bottom,
            visibleInWindow: rect.top >= 0 && rect.bottom <= winHeight + 10,
            pointerEvents: style.pointerEvents,
          };
        });

        expect(ctaMetrics.pointerEvents).toBe('auto');
        expect(ctaMetrics.width).toBeGreaterThan(60);
        expect(ctaMetrics.height).toBeGreaterThan(20);
        expect(ctaMetrics.visibleInWindow).toBe(true);
      }
    });
  }

  test('Category switching near deep stack position restores view and updates cards cleanly', async ({
    page,
    baseURL,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);

    const templatesSection = page.locator('#templates');
    const galleryHeader = page.getByRole('heading', { name: /Menus with a/i });
    await expect(galleryHeader).toBeVisible();
    await galleryHeader.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    const cards = page.locator('article.template-reveal-card');
    expect(await cards.count()).toBe(10);

    // Scroll deep into the stack (Card 8)
    await cards.nth(8).scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Click a category pill that has fewer templates (e.g., 'Luxury' or 'Fine Dining')
    const luxuryBtn = page.locator('#templates button:has-text("Luxury")').first();
    await expect(luxuryBtn).toBeVisible();
    await luxuryBtn.click();
    await page.waitForTimeout(600);

    // Assert filtered card count is reduced but > 0
    const filteredCount = await cards.count();
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThan(10);

    // Assert viewport did not collapse into a void or strand the user outside #templates
    const sectionTopAfterFilter = await templatesSection.evaluate((el) => {
      return el.getBoundingClientRect().top;
    });
    // Header should be visible or nearby within the viewport
    expect(sectionTopAfterFilter).toBeLessThanOrEqual(200);
    expect(sectionTopAfterFilter).toBeGreaterThanOrEqual(-600);

    // Switch back to 'All'
    const allBtn = page.locator('#templates button:has-text("All")').first();
    await allBtn.click();
    await page.waitForTimeout(600);

    expect(await cards.count()).toBe(10);
  });

  test('Inert accessibility state correctly isolates occluded cards and restores on scroll-up', async ({
    page,
    baseURL,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);

    const templatesSection = page.locator('#templates');
    const galleryHeader = page.getByRole('heading', { name: /Menus with a/i });
    await expect(galleryHeader).toBeVisible();
    await galleryHeader.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    const slots = page.locator('[data-stack-slot]');
    expect(await slots.count()).toBe(10);

    // Initially at top of gallery, slot 0 is not covered
    const slot0InitialInert = await slots.nth(0).evaluate((el) => el.hasAttribute('inert') || (el as any).inert);
    expect(slot0InitialInert).toBeFalsy();

    // Scroll down until Card 2 or Card 3 is pinned, fully covering Card 0
    const card3 = page.locator('article.template-reveal-card').nth(3);
    await card3.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // When Card 3 is pinned, Card 0 must be occluded (depth >= 0.999) and marked inert
    const slot0OccludedInert = await slots.nth(0).evaluate((el) => el.hasAttribute('inert') || (el as any).inert);
    expect(slot0OccludedInert).toBe(true);

    // The currently active card (Card 3) must NOT be inert
    const slot3Inert = await slots.nth(3).evaluate((el) => el.hasAttribute('inert') || (el as any).inert);
    expect(slot3Inert).toBeFalsy();

    // Scroll back to top
    await galleryHeader.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Slot 0 should no longer be inert
    const slot0RestoredInert = await slots.nth(0).evaluate((el) => el.hasAttribute('inert') || (el as any).inert);
    expect(slot0RestoredInert).toBeFalsy();
  });

  test('Reduced motion mode bypasses 3D transforms, tilt, and dimming', async ({
    page,
    baseURL,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);

    const templatesSection = page.locator('#templates');
    await templatesSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    // Scroll down to stack cards
    const card2 = page.locator('article.template-reveal-card').nth(2);
    await card2.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Check computed styles on cards
    const cardStyles = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.scroll-stack-card'));
      return cards.map((c) => {
        const style = window.getComputedStyle(c);
        const transform = (c as HTMLElement).style.transform;
        const dim = (c as HTMLElement).style.getPropertyValue('--scroll-stack-dim');
        return { transform, dim };
      });
    });

    // In reduced motion mode, transform should be empty '' and dim should be '0'
    for (const cs of cardStyles) {
      expect(cs.transform).toBe('');
      expect(cs.dim === '' || cs.dim === '0').toBe(true);
    }
  });

  test('Rapid forward and reverse wheel scrolling does not throw or crash layout', async ({
    page,
    baseURL,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);

    const templatesSection = page.locator('#templates');
    await templatesSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // Capture console errors
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    // Rapid wheel thrashing
    for (let i = 0; i < 5; i++) {
      await page.mouse.wheel(0, 800);
      await page.waitForTimeout(50);
      await page.mouse.wheel(0, -600);
      await page.waitForTimeout(50);
      await page.mouse.wheel(0, 1200);
      await page.waitForTimeout(50);
      await page.mouse.wheel(0, -1000);
      await page.waitForTimeout(50);
    }

    expect(errors).toHaveLength(0);

    // Final settle check
    await page.waitForTimeout(300);
    const cards = page.locator('article.template-reveal-card');
    expect(await cards.count()).toBe(10);
  });

  test('Viewport resize during active scroll recalculates layout cleanly without error', async ({
    page,
    baseURL,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);

    const templatesSection = page.locator('#templates');
    await templatesSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // Scroll midway
    const card4 = page.locator('article.template-reveal-card').nth(4);
    await card4.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // Resize viewport while scrolled
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(300);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);

    await page.setViewportSize({ width: 1366, height: 768 });
    await page.waitForTimeout(300);

    // Verify all cards are valid and have non-NaN styles
    const stylesValid = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.scroll-stack-card'));
      return cards.every((c) => {
        const t = (c as HTMLElement).style.transform;
        return !t.includes('NaN');
      });
    });
    expect(stylesValid).toBe(true);
  });
});
