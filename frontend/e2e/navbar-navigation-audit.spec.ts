import { test, expect } from '@playwright/test';

test.describe('Premium Navbar & Route Navigation Comprehensive Audit', () => {
  test('1. Desktop navbar links navigate, reset scroll to top, and show active route indicators', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    const desktopRoutes = [
      { label: 'Digital QR Menu', path: '/digital-qr-menu', h1Text: 'A Digital QR Menu Built for Restaurants' },
      { label: 'How It Works', path: '/how-it-works', h1Text: 'How MenusQR Works for Your Restaurant' },
      { label: 'Templates', path: '/templates', h1Text: 'Digital Menu Templates Designed for Food Businesses' },
      { label: 'Pricing Plans', path: '/plans', h1Text: 'Simple Digital Menu Plans for Restaurants' },
      { label: 'FAQ', path: '/faq', h1Text: 'Frequently Asked Questions About MenusQR' },
    ];

    for (const route of desktopRoutes) {
      // Scroll down before clicking to test scroll restoration from any scroll offset
      await page.evaluate(() => window.scrollTo(0, 800));
      await page.waitForTimeout(100);

      const navPill = page.getByRole('navigation', { name: 'Main Navigation' });
      const link = navPill.getByRole('link', { name: new RegExp(route.label, 'i') });
      await expect(link).toBeVisible();
      await link.click();

      await expect(page).toHaveURL(new RegExp(`${route.path}$`));
      await page.waitForTimeout(200);

      // Verify scroll position is reset to top (0px)
      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBe(0);

      // Verify H1 is in the visible viewport
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();
      await expect(h1).toContainText(route.h1Text);

      const isH1InViewport = await page.evaluate(() => {
        const el = document.querySelector('h1');
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top >= 0 && rect.top <= window.innerHeight;
      });
      expect(isH1InViewport).toBe(true);

      // Verify active state indicator
      const activeLink = navPill.locator(`a[href="${route.path}"]`);
      await expect(activeLink).toHaveAttribute('aria-current', 'page');
    }

    const criticalErrors = consoleErrors.filter(
      (e) => !e.toLowerCase().includes('favicon') && !e.toLowerCase().includes('failed to load resource')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('2. Logo navigation returns to homepage at top of page', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/templates', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);

    // Scroll down on templates page
    await page.evaluate(() => window.scrollTo(0, 600));

    // Click logo
    const logoLink = page.getByRole('link', { name: /MenusQR Homepage/i });
    await logoLink.click();
    await expect(page).toHaveURL(/\/$/);
    await page.waitForTimeout(300);

    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBe(0);

    const heroH1 = page.locator('h1').first();
    await expect(heroH1).toBeVisible();
  });

  test('3. Logo click on homepage smoothly scrolls to top when already on homepage', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    // Scroll far down to footer
    await page.evaluate(() => window.scrollTo(0, 3000));
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(2000);

    // Click logo while on homepage
    const logoLink = page.getByRole('link', { name: /MenusQR Homepage/i });
    await logoLink.click();
    await page.waitForTimeout(600);

    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThan(100);
  });

  test('4. Desktop Client Portal CTA navigates directly to login', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);

    const cta = page.getByRole('banner').getByRole('link', { name: /Client Portal/i });
    await expect(cta).toBeVisible();
    await cta.click();

    await expect(page).toHaveURL(/\/login$/);
    const loginHeading = page.locator('h1, h2').first();
    await expect(loginHeading).toBeVisible();
  });

  test('5. Navigation from deep page footer resets scroll position to top on destination page', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    // Scroll all the way to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    const deepScroll = await page.evaluate(() => window.scrollY);
    expect(deepScroll).toBeGreaterThan(3000);

    // Click footer link to 'How It Works'
    const footerLink = page.locator('footer').getByRole('link', { name: 'How It Works' }).first();
    await expect(footerLink).toBeVisible();
    await footerLink.click();

    await expect(page).toHaveURL(/\/how-it-works$/);
    await page.waitForTimeout(300);

    const scrollAfterFooterNav = await page.evaluate(() => window.scrollY);
    expect(scrollAfterFooterNav).toBe(0);

    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('How MenusQR Works');
  });

  test('6. Browser Back and Forward navigation preserves valid flow', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);

    const navPill = page.getByRole('navigation', { name: 'Main Navigation' });
    await navPill.getByRole('link', { name: 'Templates' }).click();
    await expect(page).toHaveURL(/\/templates$/);

    // Go back to homepage (SPA history pop)
    await page.goBack({ waitUntil: 'commit' });
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('h1').first()).toBeVisible();

    // Go forward to templates (SPA history push)
    await page.goForward({ waitUntil: 'commit' });
    await expect(page).toHaveURL(/\/templates$/);
    await expect(page.locator('h1').first()).toContainText('Templates');
  });

  test('7. Direct URL load and refresh on destination routes render complete content', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    const routes = ['/templates', '/how-it-works', '/plans', '/faq'];
    for (const r of routes) {
      await page.goto(r, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('h1').first()).toBeVisible();

      // Test reload
      await page.reload({ waitUntil: 'domcontentloaded' });
      await expect(page.locator('h1').first()).toBeVisible();
      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBe(0);
    }
  });

  test('8. Mobile navigation drawer toggle, links, escape key, and backdrop click', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    const menuButton = page.getByRole('button', { name: /navigation menu/i });
    await expect(menuButton).toBeVisible();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    // Open drawer
    await menuButton.click();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    const drawer = page.locator('#mobile-navigation-menu');
    await expect(drawer).toBeVisible();

    // Verify body scroll lock is active
    const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(bodyOverflow).toBe('hidden');

    // Test Escape key closes drawer
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');

    // Reopen drawer and test clicking outside on backdrop
    await menuButton.click();
    await page.waitForTimeout(200);
    await expect(drawer).toBeVisible();

    // Tap backdrop (outside the menu)
    await page.getByTestId('mobile-backdrop').click({ position: { x: 10, y: 700 } });
    await page.waitForTimeout(300);
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    // Reopen drawer and navigate to 'Templates'
    await menuButton.click();
    await page.waitForTimeout(200);
    const mobileTemplatesLink = drawer.getByRole('link', { name: 'Templates', exact: true });
    await mobileTemplatesLink.click();

    await expect(page).toHaveURL(/\/templates$/);
    await page.waitForTimeout(300);

    // Verify drawer closed upon navigation and scroll is 0
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBe(0);
    await expect(page.locator('h1').first()).toContainText('Templates');
  });

  test('9. Keyboard navigation and focus accessibility on desktop navbar', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);

    // Tab into navbar
    await page.keyboard.press('Tab');
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON']).toContain(focusedTag);
  });
});
