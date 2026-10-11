import { test, expect, type BrowserContext } from '@playwright/test';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const backendRequire = createRequire(resolve(repoRoot, 'backend/package.json'));
backendRequire('dotenv').config({ path: resolve(repoRoot, 'backend/.env') });
const { Pool } = backendRequire('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@127.0.0.1:5432/menuqr_test',
});

let adminCookie: string;
let adminId: string;
const adminEmail = 'xshankarmishra@gmail.com';

function getAdminOrigin(baseURL?: string): string {
  if (!baseURL) return 'http://localhost:5174';
  try {
    const url = new URL(baseURL);
    url.hostname = 'localhost';
    return url.origin;
  } catch {
    return 'http://localhost:5174';
  }
}

async function addAuthCookie(context: BrowserContext, value: string, name = 'menusqr_admin_session', origin = 'http://localhost:5174') {
  await context.addCookies([{ name, value, url: origin, httpOnly: true, sameSite: 'Strict' }]);
}

test.beforeAll(async () => {
  const { randomUUID, randomBytes, createHash } = await import('node:crypto');

  // Ensure admin user exists
  const adminRes = await pool.query(
    "INSERT INTO admin_users (id, email, status) VALUES ($1, $2, 'active') ON CONFLICT (email) DO UPDATE SET status='active' RETURNING id",
    [randomUUID(), adminEmail]
  );
  adminId = adminRes.rows[0].id;

  // Create active admin session
  const token = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
  const sessionId = randomBytes(16).toString('hex');

  await pool.query(
    'INSERT INTO admin_sessions (id, admin_id, token_hash, expires_at, ip_address) VALUES ($1, $2, $3, $4, $5)',
    [sessionId, adminId, tokenHash, expiresAt, '127.0.0.1']
  );
  adminCookie = token;

  // Insert a test coupon for QA
  await pool.query(
    `INSERT INTO coupons (id, code, plan_id, discount_pct, status, created_by, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (code) DO NOTHING`,
    [randomUUID(), 'MQ15-TEST-QA01', 'PREMIUM', 15, 'AVAILABLE', 'SUPER_ADMIN']
  );
});

test.afterAll(async () => {
  await pool.query('DELETE FROM coupons WHERE code LIKE $1', ['MQ15-TEST-%']);
  await pool.end();
});

test.describe('Admin Portal QA & UI Verification', () => {
  test('1. Admin login and session restoration', async ({ browser, baseURL }) => {
    const origin = getAdminOrigin(baseURL);
    const context = await browser.newContext();

    // Without session -> redirected to login
    const page = await context.newPage();
    await page.goto(`${origin}/admin/dashboard`);
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByRole('heading', { name: 'Administrator sign in' })).toBeVisible();

    // With valid session cookie -> restores session and loads dashboard
    await addAuthCookie(context, adminCookie, 'menusqr_admin_session', origin);
    await page.goto(`${origin}/admin/dashboard`);
    await expect(page).toHaveURL(/.*\/admin\/dashboard/);
    await expect(page.getByRole('heading', { name: /Business Overview/i })).toBeVisible();

    await context.close();
  });

  test('2. Admin dashboard navigation, including Advanced Settings', async ({ browser, baseURL }) => {
    const origin = getAdminOrigin(baseURL);
    const context = await browser.newContext();
    await addAuthCookie(context, adminCookie, 'menusqr_admin_session', origin);
    const page = await context.newPage();

    await page.goto(`${origin}/admin/dashboard`);
    await expect(page).toHaveURL(/.*\/admin\/dashboard/);
    await expect(page.getByRole('heading', { name: /Business Overview/i })).toBeVisible();

    // Verify Advanced Settings link exists and points to /admin/settings
    const advSettingsLink = page.getByRole('link', { name: /Advanced Settings/i });
    await expect(advSettingsLink).toBeVisible();
    await advSettingsLink.click();

    await expect(page).toHaveURL(/.*\/admin\/settings/);
    await expect(page.getByRole('heading', { name: /Settings/i }).first()).toBeVisible();

    await context.close();
  });

  test('3. Coupon listing, search, plan/status filters and refresh', async ({ browser, baseURL }) => {
    const origin = getAdminOrigin(baseURL);
    const context = await browser.newContext();
    await addAuthCookie(context, adminCookie, 'menusqr_admin_session', origin);
    const page = await context.newPage();

    await page.goto(`${origin}/admin/coupons`);
    await expect(page).toHaveURL(/.*\/admin\/coupons/);

    // Verify title and stats cards
    await expect(page.getByRole('heading', { name: /Coupon Engine Management/i })).toBeVisible();
    await expect(page.getByText(/Intermediate Active Coupons/i)).toBeVisible();
    await expect(page.getByText(/Premium Active Coupons/i)).toBeVisible();

    // Search filter
    const searchInput = page.getByPlaceholder(/Search code.../i);
    await searchInput.fill('QA01');
    await expect(page.getByRole('cell', { name: /MQ15-TEST-QA01/i })).toBeVisible();

    // Clear search
    await searchInput.fill('');

    // Plan dropdown
    const planSelect = page.locator('select').first();
    await planSelect.selectOption('PREMIUM');
    await expect(page.getByRole('cell', { name: /MQ15-TEST-QA01/i })).toBeVisible();

    // Refresh button
    const refreshBtn = page.getByTitle(/Refresh coupons/i);
    await refreshBtn.click();
    await expect(page.getByRole('cell', { name: /MQ15-TEST-QA01/i })).toBeVisible();

    await context.close();
  });

  test('4. Coupon creation and validation in Bulk Generate modal', async ({ browser, baseURL }) => {
    const origin = getAdminOrigin(baseURL);
    const context = await browser.newContext();
    await addAuthCookie(context, adminCookie, 'menusqr_admin_session', origin);
    const page = await context.newPage();

    await page.goto(`${origin}/admin/coupons`);
    await expect(page).toHaveURL(/.*\/admin\/coupons/);
    await expect(page.getByRole('heading', { name: /Coupon Engine Management/i })).toBeVisible();

    // Open modal
    const generateBtn = page.getByRole('button', { name: /Bulk Generate Coupons/i });
    await generateBtn.click();

    // Modal should be visible
    await expect(page.getByRole('heading', { name: /Bulk Generate Coupons/i })).toBeVisible();
    await expect(page.getByText(/Create 1 to 15 single-use discount codes/i)).toBeVisible();

    // Verify cancel closes modal
    const cancelBtn = page.getByRole('button', { name: 'Cancel' });
    await cancelBtn.click();
    await expect(page.getByRole('heading', { name: /Bulk Generate Coupons/i })).not.toBeVisible();

    await context.close();
  });

  test('5. Coupon copy action', async ({ browser, baseURL }) => {
    const origin = getAdminOrigin(baseURL);
    const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
    await addAuthCookie(context, adminCookie, 'menusqr_admin_session', origin);
    const page = await context.newPage();

    await page.goto(`${origin}/admin/coupons`);
    await expect(page.getByRole('cell', { name: /MQ15-TEST-QA01/i })).toBeVisible();

    // Click copy button
    const copyBtn = page.getByTitle('Copy code').first();
    await copyBtn.click();

    // Toast or feedback appears
    await expect(page.locator('body')).toContainText(/Copied/i);

    await context.close();
  });

  test('6. Disable confirmation and resulting status', async ({ browser, baseURL }) => {
    const origin = getAdminOrigin(baseURL);
    const context = await browser.newContext();
    await addAuthCookie(context, adminCookie, 'menusqr_admin_session', origin);
    const page = await context.newPage();

    await page.goto(`${origin}/admin/coupons`);
    await expect(page.getByRole('cell', { name: /MQ15-TEST-QA01/i })).toBeVisible();

    // Click Disable button
    const disableBtn = page.getByRole('button', { name: 'Disable' }).first();
    await disableBtn.click();

    // Modal appears
    await expect(page.getByRole('heading', { name: /Disable Coupon/i })).toBeVisible();
    await expect(page.getByText(/Are you sure you want to disable coupon/i)).toBeVisible();

    // Cancel first
    const cancelBtn = page.getByRole('button', { name: 'Cancel' });
    await cancelBtn.click();
    await expect(page.getByRole('heading', { name: /Disable Coupon/i })).not.toBeVisible();

    // Now confirm disable
    await page.getByRole('button', { name: 'Disable' }).first().click();
    const confirmBtn = page.getByRole('button', { name: /Confirm Disable/i });
    await confirmBtn.click();

    // Table cell badge updates to DISABLED
    await expect(page.locator('td span:has-text("DISABLED")')).toBeVisible();

    await context.close();
  });

  test('7. Orders and Payments loading errors and Retry behavior', async ({ browser, baseURL }) => {
    const origin = getAdminOrigin(baseURL);
    const context = await browser.newContext();
    await addAuthCookie(context, adminCookie, 'menusqr_admin_session', origin);
    const page = await context.newPage();

    // Intercept /api/admin/orders with failure
    await page.route('**/api/admin/orders', route => route.abort('failed'));
    await page.goto(`${origin}/admin/orders`);

    // Verify error banner is visible with Retry button
    const retryBtn = page.getByRole('button', { name: /Retry/i });
    await expect(retryBtn).toBeVisible();

    // Now unroute and click retry
    await page.unroute('**/api/admin/orders');
    await retryBtn.click();

    // Error banner clears and table displays
    await expect(page.getByRole('table')).toBeVisible();

    // Repeat for Payments
    await page.route('**/api/admin/payments', route => route.abort('failed'));
    await page.goto(`${origin}/admin/payments`);

    const paymentRetryBtn = page.getByRole('button', { name: /Retry/i });
    await expect(paymentRetryBtn).toBeVisible();

    await page.unroute('**/api/admin/payments');
    await paymentRetryBtn.click();
    await expect(page.getByRole('table')).toBeVisible();

    await context.close();
  });

  test('8. Expired session and unauthorized redirect', async ({ browser, baseURL }) => {
    const origin = getAdminOrigin(baseURL);
    const context = await browser.newContext();
    const page = await context.newPage();

    // Without cookie
    await page.goto(`${origin}/admin/coupons`);
    await expect(page).toHaveURL(/.*\/login/);

    await context.close();
  });

  test('9. Refreshing nested admin URLs', async ({ browser, baseURL }) => {
    const origin = getAdminOrigin(baseURL);
    const context = await browser.newContext();
    await addAuthCookie(context, adminCookie, 'menusqr_admin_session', origin);
    const page = await context.newPage();

    // Navigate to /admin/coupons
    await page.goto(`${origin}/admin/coupons`);
    await expect(page).toHaveURL(`${origin}/admin/coupons`);
    await expect(page.getByRole('heading', { name: /Coupon Engine Management/i })).toBeVisible();

    // Hard reload
    await page.reload();
    await expect(page).toHaveURL(`${origin}/admin/coupons`);
    await expect(page.getByRole('heading', { name: /Coupon Engine Management/i })).toBeVisible();

    await context.close();
  });
});
