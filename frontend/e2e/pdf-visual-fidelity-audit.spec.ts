import { test, expect } from '@playwright/test';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const auditDir = resolve(__dirname, '../../visual-audit/pdf-reconstruction');

if (!fs.existsSync(auditDir)) {
  fs.mkdirSync(auditDir, { recursive: true });
}

test.describe('Visual Fidelity & Responsive Behavior Audit', () => {
  test('1. Reconstructed Public Menu Renders Responsively on Desktop and Mobile', async ({ page, baseURL }) => {
    // Audit Desktop Viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${baseURL}/audit-preview/01?composition=editorial&hideNav=true`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Verify no horizontal overflow
    const hasDesktopOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasDesktopOverflow).toBe(false);

    // Capture desktop audit screenshot
    await page.screenshot({
      path: `${auditDir}/03-reconstructed-menu-desktop.png`,
      fullPage: false,
    });

    // Audit Mobile Viewport (iPhone 14 standard: 390x844)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Verify no mobile horizontal overflow
    const hasMobileOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasMobileOverflow).toBe(false);

    // Capture mobile audit screenshot
    await page.screenshot({
      path: `${auditDir}/04-reconstructed-menu-mobile.png`,
      fullPage: false,
    });
  });

  test('2. Side-by-Side Review Studio Renders Both Original PDF and Live Preview Mockup', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 1280, height: 850 });
    await page.goto(`${baseURL}/onboarding`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Launch PDF Reconstruction Modal
    const uploadBtn = page.getByRole('button', { name: /Upload Menu PDF/i });
    await expect(uploadBtn).toBeVisible();
    await uploadBtn.click();
    await page.waitForTimeout(500);

    // Verify modal is open
    await expect(page.getByText('PDF-to-Digital-Menu Reconstruction Engine')).toBeVisible();

    // Capture side-by-side modal screenshot
    await page.screenshot({
      path: `${auditDir}/05-review-studio-modal.png`,
      fullPage: false,
    });
  });
});
