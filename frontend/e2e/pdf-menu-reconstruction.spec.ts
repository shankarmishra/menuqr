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

test.describe('PDF Menu Reconstruction Workflow', () => {
  test('1. Onboarding Wizard Displays High-Fidelity PDF Import Fast-Track Banner', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${baseURL}/onboarding`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Banner should be visible
    const banner = page.getByText('Have an existing printed menu?');
    await expect(banner).toBeVisible();

    const uploadPdfButton = page.getByRole('button', { name: /Upload Menu PDF/i });
    await expect(uploadPdfButton).toBeVisible();

    // Take screenshot of onboarding with PDF banner
    await page.screenshot({
      path: `${auditDir}/01-onboarding-pdf-banner.png`,
      fullPage: false,
    });

    // Clicking button should open PdfMenuImportWizard modal
    await uploadPdfButton.click();
    await page.waitForTimeout(500);

    // Modal should be open
    await expect(page.getByText('PDF-to-Digital-Menu Reconstruction Engine')).toBeVisible();
    await expect(page.getByText('Drop your restaurant menu PDF here')).toBeVisible();
    await expect(page.getByText(/Supports multi-page digital PDFs & scanned physical menus up to 15MB/i)).toBeVisible();

    // Take screenshot of PDF upload wizard modal
    await page.screenshot({
      path: `${auditDir}/02-pdf-upload-modal.png`,
      fullPage: false,
    });
  });
});
