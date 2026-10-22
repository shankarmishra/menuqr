import { test, expect } from '@playwright/test';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const auditDir = resolve(__dirname, '../../visual-audit/ai-compositions');

if (!fs.existsSync(auditDir)) {
  fs.mkdirSync(auditDir, { recursive: true });
}

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1280, height: 800 },
];

for (const vp of VIEWPORTS) {
  test(`1. Editorial Fine Dining Composition renders on ${vp.name}`, async ({ page, baseURL }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(`${baseURL}/audit-preview/01?composition=editorial&hideNav=true`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Verify no horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // Verify editorial fine dining elements exist
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible();
    
    // Verify dishes and prices render
    const dishes = page.locator('article');
    const count = await dishes.count();
    expect(count).toBeGreaterThan(0);

    // Save proof screenshot
    await page.screenshot({
      path: `${auditDir}/editorial-${vp.name}.png`,
      fullPage: false,
    });
  });

  test(`2. Modern Image-Led Showcase renders on ${vp.name}`, async ({ page, baseURL }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(`${baseURL}/audit-preview/01?composition=image-showcase&hideNav=true`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    const articles = page.locator('article');
    const count = await articles.count();
    expect(count).toBeGreaterThan(0);

    await page.screenshot({
      path: `${auditDir}/image-showcase-${vp.name}.png`,
      fullPage: false,
    });
  });

  test(`3. Compact Typographic Bistro renders on ${vp.name}`, async ({ page, baseURL }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(`${baseURL}/audit-preview/01?composition=compact-bistro&hideNav=true`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    const articles = page.locator('article');
    const count = await articles.count();
    expect(count).toBeGreaterThan(0);

    await page.screenshot({
      path: `${auditDir}/compact-bistro-${vp.name}.png`,
      fullPage: false,
    });
  });

  test(`4. Edge Case: Long restaurant and dish names wrap cleanly on ${vp.name}`, async ({ page, baseURL }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(`${baseURL}/audit-preview/01?composition=editorial&edge=long-names&hideNav=true`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    const longHeading = page.getByRole('heading', { name: /The Royal Sovereign Imperial/i });
    await expect(longHeading).toBeVisible();

    await page.screenshot({
      path: `${auditDir}/edge-long-names-${vp.name}.png`,
      fullPage: false,
    });
  });

  test(`5. Edge Case: Missing fields and images fallback gracefully on ${vp.name}`, async ({ page, baseURL }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(`${baseURL}/audit-preview/01?composition=image-showcase&edge=missing-fields&hideNav=true`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    await expect(page.getByText('CAFE MINIMAL')).toBeVisible();

    await page.screenshot({
      path: `${auditDir}/edge-missing-fields-${vp.name}.png`,
      fullPage: false,
    });
  });

  test(`6. Legacy Fallback: Plain template ID renders classic template on ${vp.name}`, async ({ page, baseURL }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(`${baseURL}/audit-preview/royal-maharaja?hideNav=true`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    await page.screenshot({
      path: `${auditDir}/legacy-fallback-${vp.name}.png`,
      fullPage: false,
    });
  });

  test(`7. AI Design Studio Interactive Panel renders on ${vp.name}`, async ({ page, baseURL }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(`${baseURL}/audit-preview/01?studio=true&hideNav=true`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Verify studio controls render
    await expect(page.getByText('Design Engine:')).toBeVisible();
    await expect(page.getByText('Select Composition Strategy')).toBeVisible();
    await expect(page.getByText('Reference Photo & Interior Guidance')).toBeVisible();

    await page.screenshot({
      path: `${auditDir}/ai-studio-interactive-${vp.name}.png`,
      fullPage: false,
    });
  });

  test(`8. Edge Case: Hindi Devanagari typography renders cleanly on ${vp.name}`, async ({ page, baseURL }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(`${baseURL}/audit-preview/01?composition=editorial&edge=multilingual-hindi&hideNav=true`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // Verify Hindi restaurant name and dishes render
    await expect(page.getByText('राज महल पैलेस & हेरिटेज रेस्तरां')).toBeVisible();
    await expect(page.getByText(/शाही पनीर मखनी/i)).toBeVisible();

    await page.screenshot({
      path: `${auditDir}/edge-hindi-devanagari-${vp.name}.png`,
      fullPage: false,
    });
  });

  test(`9. Edge Case: Large 40-item menu renders responsively on ${vp.name}`, async ({ page, baseURL }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(`${baseURL}/audit-preview/01?composition=compact-bistro&edge=large-menu&hideNav=true`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    const articles = page.locator('article');
    const count = await articles.count();
    expect(count).toBeGreaterThanOrEqual(35);

    await page.screenshot({
      path: `${auditDir}/edge-large-menu-${vp.name}.png`,
      fullPage: false,
    });
  });
}
