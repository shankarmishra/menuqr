import { test, expect, type BrowserContext } from '@playwright/test';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const backendRequire = createRequire(resolve(repoRoot, 'backend/package.json'));
backendRequire('dotenv').config({ path: resolve(repoRoot, 'backend/.env') });
const { Pool } = backendRequire('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const { hashPassword, generateAuthCookie } = await import(pathToFileURL(resolve(repoRoot, 'backend/auth.js')).href);

type RestaurantFixture = { tenantId: string; userId: string; menuId?: string; itemId?: string; qrId?: string; cookie: string };
let premium: RestaurantFixture;
let adminCookie: string;

function cookieValue(header: string) {
  return header.split(';', 1)[0].split('=').slice(1).join('=');
}

async function createRestaurant(plan: 'BASIC' | 'PREMIUM', name: string, withMenu: boolean): Promise<RestaurantFixture> {
  const { randomUUID } = await import('node:crypto');
  const tenantId = randomUUID();
  const userId = randomUUID();
  const publicId = randomUUID().slice(0, 12);
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  await pool.query('INSERT INTO clients (id, public_id, business_name, menu_slug, status, phone, city, address) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', [tenantId, publicId, name, `e2e-${publicId}`, 'active', '+1 555 0100', 'Portland', '10 Test Avenue']);
  await pool.query('INSERT INTO users (id, email, password_hash, role, tenant_id, onboarding_state) VALUES ($1,$2,$3,$4,$5,$6)', [userId, `e2e-${tenantId}@example.invalid`, await hashPassword('browser-test-password'), 'RESTAURANT_OWNER', tenantId, withMenu ? 'COMPLETED' : 'COMPLETED']);
  await pool.query('INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at, content_period_start) VALUES ($1,$2,$3,$4,$5,$6,$7)', [randomUUID(), tenantId, plan, 'ACTIVE', now, expiresAt, now]);
  await pool.query('INSERT INTO appearance_settings (id, tenant_id, template_id, restaurant_display_name) VALUES ($1,$2,$3,$4)', [randomUUID(), tenantId, 'royal-maharaja', name]);

  const fixture: RestaurantFixture = { tenantId, userId, cookie: cookieValue(generateAuthCookie({ id: userId, role: 'RESTAURANT_OWNER', tenantId })) };
  if (withMenu) {
    const menuId = randomUUID();
    const categoryId = randomUUID();
    const itemId = randomUUID();
    const qrCodeId = randomUUID();
    const qrId = randomUUID();
    await pool.query('INSERT INTO menus (id, tenant_id, name) VALUES ($1,$2,$3)', [menuId, tenantId, 'Test Menu']);
    await pool.query('INSERT INTO menu_categories (id, menu_id, tenant_id, name, sort_order) VALUES ($1,$2,$3,$4,$5)', [categoryId, menuId, tenantId, 'Mains', 1]);
    await pool.query('INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, description, price, image_url, diet_type, is_available, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)', [itemId, menuId, tenantId, categoryId, 'Grilled Paneer', 'Fresh herbs', 175, null, 'veg', true, 1]);
    await pool.query('INSERT INTO qr_codes (id, tenant_id, public_id, qr_id, is_active) VALUES ($1,$2,$3,$4,true)', [qrCodeId, tenantId, publicId, qrId]);
    await pool.query('INSERT INTO tenant_qr_identity (tenant_id, qr_code_id) VALUES ($1,$2)', [tenantId, qrCodeId]);
    fixture.menuId = menuId;
    fixture.itemId = itemId;
    fixture.qrId = qrId;
  }
  return fixture;
}

async function addAuthCookie(context: BrowserContext, value: string, name: string = 'menusqr_auth', origin = 'http://127.0.0.1:5174') {
  await context.addCookies([{ name, value, url: origin, httpOnly: true, sameSite: 'Strict' }]);
}

async function cleanTenant(tenantId: string) {
  await pool.query('DELETE FROM notifications WHERE tenant_id = $1', [tenantId]);
  await pool.query('DELETE FROM sticker_request_events WHERE request_id IN (SELECT id FROM sticker_requests WHERE tenant_id = $1)', [tenantId]);
  await pool.query('DELETE FROM sticker_requests WHERE tenant_id = $1', [tenantId]);
  await pool.query('DELETE FROM customer_orders WHERE tenant_id = $1', [tenantId]);
  await pool.query('DELETE FROM subscription_content_usage WHERE tenant_id = $1', [tenantId]);
  await pool.query('DELETE FROM tenant_qr_identity WHERE tenant_id = $1', [tenantId]);
  await pool.query('DELETE FROM qr_codes WHERE tenant_id = $1', [tenantId]);
  await pool.query('DELETE FROM menu_items WHERE tenant_id = $1', [tenantId]);
  await pool.query('DELETE FROM menu_categories WHERE tenant_id = $1', [tenantId]);
  await pool.query('DELETE FROM menus WHERE tenant_id = $1', [tenantId]);
  await pool.query('DELETE FROM appearance_settings WHERE tenant_id = $1', [tenantId]);
  await pool.query('DELETE FROM subscriptions WHERE tenant_id = $1', [tenantId]);
  await pool.query('DELETE FROM users WHERE tenant_id = $1', [tenantId]);
  await pool.query('DELETE FROM clients WHERE id = $1', [tenantId]);
}

test.beforeAll(async () => {
  const { randomUUID, randomBytes, createHash } = await import('node:crypto');
  const runId = Date.now().toString(36);
  premium = await createRestaurant('PREMIUM', `E2E Premium ${runId}`, true);

  const adminEmail = 'xshankarmishra@gmail.com';
  const adminInsertResult = await pool.query("INSERT INTO admin_users (id, email, status) VALUES ($1, $2, 'active') ON CONFLICT (email) DO UPDATE SET status='active' RETURNING id", [randomUUID(), adminEmail]);
  const adminId = adminInsertResult.rows[0].id;

  const token = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const sessionExpiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
  const sessionId = randomBytes(16).toString('hex');
  await pool.query(
    'INSERT INTO admin_sessions (id, admin_id, token_hash, expires_at, ip_address) VALUES ($1, $2, $3, $4, $5)',
    [sessionId, adminId, tokenHash, sessionExpiresAt, '127.0.0.1']
  );
  adminCookie = token;
});

test.afterAll(async () => {
  if (premium?.tenantId) await cleanTenant(premium.tenantId);
});

test('Client Panel routes load without errors', async ({ browser, baseURL }) => {
  const context = await browser.newContext();
  await addAuthCookie(context, premium.cookie);
  const page = await context.newPage();
  
  const errors: Error[] = [];
  page.on('pageerror', err => errors.push(err));
  page.on('response', resp => {
    if (resp.status() >= 500) {
      errors.push(new Error(`API Error 5xx: ${resp.url()}`));
    }
  });

  // Dashboard
  await page.goto(`${baseURL}/app/dashboard`);
  await expect(page).toHaveURL(/.*\/app\/dashboard/);
  await expect(page.locator('body')).toContainText(/Welcome back|Business Overview|Dashboard/i);
  
  // Menu CRUD
  await page.goto(`${baseURL}/app/menu`);
  await expect(page).toHaveURL(/.*\/app\/menu/);
  await expect(page.locator('body')).toContainText(/Menu|Categories/i);
  
  // Appearance
  await page.goto(`${baseURL}/app/appearance`);
  await expect(page).toHaveURL(/.*\/app\/appearance/);
  await expect(page.locator('body')).toContainText(/Appearance|Theme/i);
  
  // QR Center
  await page.goto(`${baseURL}/app/qr`);
  await expect(page).toHaveURL(/.*\/app\/qr/);
  await expect(page.locator('body')).toContainText(/QR|Print|Sticker/i);
  
  // Subscription
  await page.goto(`${baseURL}/app/subscription`);
  await expect(page).toHaveURL(/.*\/app\/subscription/);
  await expect(page.locator('body')).toContainText(/Subscription|Plan/i);
  
  // Settings
  await page.goto(`${baseURL}/app/settings`);
  await expect(page).toHaveURL(/.*\/app\/settings/);
  await expect(page.locator('body')).toContainText(/Settings|Profile/i);
  
  expect(errors).toEqual([]);
  await context.close();
});

test('Admin Panel routes load without errors', async ({ browser, baseURL }) => {
  const context = await browser.newContext();
  const adminOrigin = new URL(baseURL!);
  adminOrigin.hostname = 'localhost';
  await addAuthCookie(context, adminCookie, 'menusqr_admin_session', adminOrigin.origin);
  const page = await context.newPage();
  
  const errors: Error[] = [];
  page.on('pageerror', err => errors.push(err));
  page.on('response', resp => {
    if (resp.status() >= 500) {
      errors.push(new Error(`API Error 5xx: ${resp.url()}`));
    }
  });

  // Dashboard
  await page.goto(`${adminOrigin.origin}/admin`);
  await expect(page).toHaveURL(/.*\/admin(\/dashboard)?/);
  await expect(page.locator('body')).toContainText(/Dashboard|Admin/i);
  
  // Restaurants
  await page.goto(`${adminOrigin.origin}/admin/restaurants`);
  await expect(page).toHaveURL(/.*\/admin\/restaurants/);
  await expect(page.locator('body')).toContainText(/Restaurants/i);
  
  // Orders
  await page.goto(`${adminOrigin.origin}/admin/orders`);
  await expect(page).toHaveURL(/.*\/admin\/orders/);
  await expect(page.locator('body')).toContainText(/Orders|Subscriptions/i);
  
  // Sticker Requests
  await page.goto(`${adminOrigin.origin}/admin/sticker-requests`);
  await expect(page).toHaveURL(/.*\/admin\/sticker-requests/);
  await expect(page.locator('body')).toContainText(/Sticker|Requests/i);
  
  // Payments
  await page.goto(`${adminOrigin.origin}/admin/payments`);
  await expect(page).toHaveURL(/.*\/admin\/payments/);
  await expect(page.locator('body')).toContainText(/Payments|Revenue/i);
  
  // Settings
  await page.goto(`${adminOrigin.origin}/admin/settings`);
  await expect(page).toHaveURL(/.*\/admin\/settings/);
  await expect(page.locator('body')).toContainText(/Settings/i);

  await page.getByRole('button', { name: 'Sign out' }).click();
  const adminSessionAfterLogout = await page.evaluate(async () => {
    const response = await fetch('/api/auth/session', { credentials: 'include' });
    return response.json();
  });
  expect(adminSessionAfterLogout.authenticated).toBe(false);
  await page.goto(`${adminOrigin.origin}/admin/dashboard`);
  await expect(page).toHaveURL(`${adminOrigin.origin}/login`);
  
  expect(errors).toEqual([]);
  await context.close();
});
