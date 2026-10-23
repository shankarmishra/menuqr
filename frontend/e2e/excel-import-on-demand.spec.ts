import { test, expect, type BrowserContext } from '@playwright/test';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const { generateAuthToken } = await import(pathToFileURL(resolve(repoRoot, 'backend/auth.js')).href);
const authToken = generateAuthToken({ id: 'user-1', role: 'RESTAURANT_OWNER', tenantId: 'client-1' });

async function addAuth(context: BrowserContext) {
  await context.addCookies([
    {
      name: 'menusqr_auth',
      value: authToken,
      domain: 'localhost',
      path: '/',
    },
  ]);
}

test.describe('Phase 2.1 — On-Demand Excel Import & Bundle Isolation', () => {
  test('1. Public marketing landing page does not fetch xlsx bundle chunk', async ({ page, baseURL }) => {
    const fetchedScripts: string[] = [];
    page.on('response', (res) => {
      const url = res.url();
      if (url.endsWith('.js') || url.includes('/assets/')) {
        fetchedScripts.push(url);
      }
    });

    await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Verify page content loads normally
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();

    // Verify xlsx chunk is NEVER fetched on marketing page
    const xlsxLoaded = fetchedScripts.some((url) => /xlsx[-.]/i.test(url));
    expect(xlsxLoaded).toBe(false);
  });

  test('2. Excel Import wizard opens and dynamically loads xlsx on template download', async ({ context, page, baseURL }) => {
    await addAuth(context, baseURL);

    const requestedUrls: string[] = [];
    page.on('request', (req) => {
      requestedUrls.push(req.url());
    });

    await page.goto(`${baseURL}/app/menu`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Open import wizard modal
    const importBtn = page.getByRole('button', { name: /Import Excel Menu/i });
    await expect(importBtn).toBeVisible({ timeout: 10000 });
    await importBtn.click();

    // Defaults to PDF wizard; switch to Excel
    const switchToExcelBtn = page.getByRole('button', { name: /Switch to Excel Import/i });
    await expect(switchToExcelBtn).toBeVisible();
    await switchToExcelBtn.click();

    // Excel modal is now visible
    const excelHeading = page.getByRole('heading', { name: /Smart Excel Menu Import/i });
    await expect(excelHeading).toBeVisible();

    // xlsx should not be loaded yet until an action is performed
    let xlsxLoaded = requestedUrls.some((url) => /xlsx[-.]/i.test(url));
    expect(xlsxLoaded).toBe(false);

    // Click Format A download and await the download event
    const downloadPromiseA = page.waitForEvent('download');
    const formatABtn = page.getByRole('button', { name: /Format A: Standard Single Price/i });
    await formatABtn.click();

    const downloadA = await downloadPromiseA;
    expect(downloadA.suggestedFilename()).toBe('MENUQR_Standard_Menu_Template.xlsx');

    // After triggering download, xlsx chunk MUST have been requested dynamically
    xlsxLoaded = requestedUrls.some((url) => /xlsx[-.]/i.test(url));
    expect(xlsxLoaded).toBe(true);

    // Format B download
    const downloadPromiseB = page.waitForEvent('download');
    const formatBBtn = page.getByRole('button', { name: /Format B: Multi-Size \/ Variants/i });
    await formatBBtn.click();

    const downloadB = await downloadPromiseB;
    expect(downloadB.suggestedFilename()).toBe('MENUQR_Variants_Menu_Template.xlsx');
  });

  test('3. Valid spreadsheet upload is parsed correctly by on-demand xlsx engine', async ({ context, page, baseURL }) => {
    await addAuth(context, baseURL);

    await page.goto(`${baseURL}/app/menu`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Open wizard and switch to Excel
    const importBtn = page.getByRole('button', { name: /Import Excel Menu/i });
    await expect(importBtn).toBeVisible({ timeout: 10000 });
    await importBtn.click();
    await page.getByRole('button', { name: /Switch to Excel Import/i }).click();

    // Create a temporary valid CSV menu
    const tmpDir = os.tmpdir();
    const validCsvPath = path.join(tmpDir, 'test_menu_valid.csv');
    const validContent = [
      'Category,Item Name,Price,Description,Diet Type,Available',
      'Starters,Crispy Corn,180,Pepper tossed sweet corn,veg,yes',
      'Main Course,Dal Tadka,160,Tempered yellow lentils,veg,yes',
      'Beverages,Masala Chai,40,Spiced Indian tea,veg,yes',
    ].join('\n');
    fs.writeFileSync(validCsvPath, validContent, 'utf-8');

    try {
      // Upload file
      const fileInput = page.locator('input[type="file"][accept*=".xlsx"]');
      await fileInput.setInputFiles(validCsvPath);

      // Should transition to Step 2: Map Columns
      await expect(page.getByText('Map Columns', { exact: true })).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('3 data rows detected')).toBeVisible();
    } finally {
      if (fs.existsSync(validCsvPath)) fs.unlinkSync(validCsvPath);
    }
  });

  test('4. Corrupted file produces a controlled error toast without crashing', async ({ context, page, baseURL }) => {
    await addAuth(context, baseURL);

    await page.goto(`${baseURL}/app/menu`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Open wizard and switch to Excel
    const importBtn = page.getByRole('button', { name: /Import Excel Menu/i });
    await expect(importBtn).toBeVisible({ timeout: 10000 });
    await importBtn.click();
    await page.getByRole('button', { name: /Switch to Excel Import/i }).click();

    // Create a temporary corrupted mock Excel file
    const tmpDir = os.tmpdir();
    const corruptedPath = path.join(tmpDir, 'corrupted_file.xlsx');
    fs.writeFileSync(corruptedPath, 'NOT_A_VALID_EXCEL_OR_ZIP_BINARY', 'utf-8');

    try {
      const fileInput = page.locator('input[type="file"][accept*=".xlsx"]');
      await fileInput.setInputFiles(corruptedPath);

      // Expect error toast
      const toast = page.locator('[role="alert"]').first();
      await expect(toast).toBeVisible({ timeout: 8000 });
      await expect(toast).toContainText(/empty|missing data|corrupted|failed to parse/i);
    } finally {
      if (fs.existsSync(corruptedPath)) fs.unlinkSync(corruptedPath);
    }
  });
});
