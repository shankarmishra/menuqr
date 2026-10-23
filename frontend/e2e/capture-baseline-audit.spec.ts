import { test } from '@playwright/test';

test('Capture Phase 1 baseline audit screenshots', async ({ page, baseURL }) => {
  // 1. Homepage Desktop 1440x900
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${baseURL}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000); // let hero settle into menu-open stage

  await page.screenshot({ path: 'e2e/screenshots/baseline_audit/01_homepage_hero_1440x900.png', fullPage: false });

  // Scroll to #templates
  const templatesSection = page.locator('#templates');
  await templatesSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'e2e/screenshots/baseline_audit/02_templates_gallery_1440x900.png', fullPage: false });

  // Scroll to Card 3
  const card3 = page.locator('article.template-reveal-card').nth(3);
  await card3.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'e2e/screenshots/baseline_audit/03_template_card3_1440x900.png', fullPage: false });

  // 2. Real Customer Menu Desktop 1440x900
  await page.goto(`${baseURL}/menu/mannat-tandoori-junction`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'e2e/screenshots/baseline_audit/04_customer_menu_mannat_1440x900.png', fullPage: false });

  // 3. Real Customer Menu Mobile iPhone 390x844
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseURL}/menu/mannat-tandoori-junction`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'e2e/screenshots/baseline_audit/05_customer_menu_mannat_390x844.png', fullPage: false });

  // Scroll down in customer menu
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'e2e/screenshots/baseline_audit/06_customer_menu_mannat_scrolled_390x844.png', fullPage: false });

  // 4. Homepage Mobile iPhone 390x844
  await page.goto(`${baseURL}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'e2e/screenshots/baseline_audit/07_homepage_hero_390x844.png', fullPage: false });

  const mobileTemplates = page.locator('#templates');
  await mobileTemplates.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'e2e/screenshots/baseline_audit/08_templates_mobile_390x844.png', fullPage: false });
});
