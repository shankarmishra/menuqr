import { test, expect } from '@playwright/test';

const seoRoutes = [
  { path: '/', expectedTitle: 'MenusQR | Digital QR Menu for Restaurants', expectedH1: 'Your menu' },
  { path: '/digital-qr-menu', expectedTitle: 'Digital QR Menu for Restaurants | MenusQR', expectedH1: 'A Digital QR Menu Built for Restaurants' },
  { path: '/restaurant-qr-menu', expectedTitle: 'Restaurant QR Menu | Permanent QR, Live Menu Updates | MenusQR', expectedH1: 'A Restaurant QR Menu That Never Needs Reprinting' },
  { path: '/digital-menu-for-restaurants', expectedTitle: 'Digital Menu for Restaurants | MenusQR', expectedH1: 'The Ultimate Digital Menu for Modern Restaurants' },
  { path: '/qr-menu-for-restaurants', expectedTitle: 'QR Menu for Restaurants | Fast Setup & Live Management | MenusQR', expectedH1: 'Smart QR Menu Solutions for Every Restaurant' },
  { path: '/restaurant-digital-menu', expectedTitle: 'Restaurant Digital Menu Software | MenusQR', expectedH1: 'Complete Restaurant Digital Menu Management' },
  { path: '/qr-ordering-for-restaurants', expectedTitle: 'QR Ordering for Restaurants | Table Ordering System | MenusQR', expectedH1: 'Direct Table QR Ordering for Restaurants' },
  { path: '/plans', expectedTitle: 'MenusQR Pricing | Digital Menu Plans for Restaurants', expectedH1: 'Simple Digital Menu Plans for Restaurants' },
  { path: '/how-it-works', expectedTitle: 'How MenusQR Works | Permanent QR Restaurant Menu', expectedH1: 'How MenusQR Works for Your Restaurant' },
  { path: '/templates', expectedTitle: 'Restaurant Menu Templates | MenusQR', expectedH1: 'Digital Menu Templates Designed for Food Businesses' },
  { path: '/about', expectedTitle: 'About MenusQR | Digital Menu Infrastructure for Restaurants', expectedH1: 'About MenusQR' },
  { path: '/contact', expectedTitle: 'Contact MenusQR | Customer Support & Sales', expectedH1: 'Contact MenusQR Support & Sales' },
  { path: '/faq', expectedTitle: 'MenusQR FAQ | Frequently Asked Questions', expectedH1: 'Frequently Asked Questions About MenusQR' },
  { path: '/privacy', expectedTitle: 'Privacy Policy | MenusQR', expectedH1: 'MenusQR Privacy Policy' },
  { path: '/terms', expectedTitle: 'Terms of Service | MenusQR', expectedH1: 'MenusQR Terms of Service' },
  { path: '/refund-cancellation', expectedTitle: 'Refund & Cancellation Policy | MenusQR', expectedH1: 'Refund & Cancellation Policy' },
];

for (const r of seoRoutes) {
  test(`SEO Route ${r.path} renders with valid title and H1`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto(r.path);
    await expect(page).toHaveTitle(r.expectedTitle);

    const h1Locator = page.locator('h1').first();
    await expect(h1Locator).toBeVisible({ timeout: 15000 });
    const h1Text = await h1Locator.textContent();
    expect(h1Text?.trim()).toContain(r.expectedH1);

    const criticalErrors = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('failed to load resource'));
    expect(criticalErrors).toHaveLength(0);
  });
}
