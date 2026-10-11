import { test, expect, type BrowserContext, type Page } from '@playwright/test';
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
let basic: RestaurantFixture;
let premium: RestaurantFixture;
let adminCookie: string;
let basicRestaurantName = '';
let premiumRestaurantName = '';
let managerContactName = '';

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
  basicRestaurantName = `E2E Basic Cafe ${runId}`;
  premiumRestaurantName = `E2E Premium Grill ${runId}`;
  managerContactName = `E2E Manager ${runId}`;
  basic = await createRestaurant('BASIC', basicRestaurantName, false);
  premium = await createRestaurant('PREMIUM', premiumRestaurantName, true);

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
  if (basic?.tenantId) await cleanTenant(basic.tenantId);
  if (premium?.tenantId) await cleanTenant(premium.tenantId);
});

test('Basic onboarding saves real data, creates one permanent QR, edits live menu, and requests/admin-reviews stickers', async ({ browser, baseURL }, testInfo) => {
  test.slow();
  const context = await browser.newContext({ acceptDownloads: true });
  await addAuthCookie(context, basic.cookie);
  const page = await context.newPage();

  await page.goto(`${baseURL}/onboarding`);
  await page.getByLabel('Restaurant name').fill(basicRestaurantName);
  await page.getByLabel('Restaurant phone').fill('+1 555 0188');
  await page.getByLabel('Restaurant city').fill('Portland');
  await page.getByLabel('Restaurant address').fill('22 River Street');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Add category' }).click();
  await page.getByLabel('Category name 1').fill('Lunch');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Add menu item' }).click();
  await page.getByLabel('Dish name 1').fill('Market Thali');
  await page.getByLabel('Dish description 1').fill('Seasonal vegetables');
  await page.getByLabel('Dish price 1').fill('240');
  await page.getByLabel('Category').selectOption({ label: 'Lunch' });
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Save menu and create permanent QR' }).click();
  await expect(page.getByText('Your permanent QR is ready')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: 'Go to Dashboard' }).click();

  const menu = await pool.query('SELECT m.id AS menu_id, i.id AS item_id FROM menus m JOIN menu_items i ON i.menu_id = m.id WHERE m.tenant_id = $1', [basic.tenantId]);
  expect(menu.rows).toHaveLength(1);
  const qr = await pool.query('SELECT q.id, q.qr_id FROM tenant_qr_identity map JOIN qr_codes q ON q.id = map.qr_code_id WHERE map.tenant_id = $1', [basic.tenantId]);
  expect(qr.rows).toHaveLength(1);
  const qrId = qr.rows[0].qr_id as string;
  const qrRecordId = qr.rows[0].id as string;
  await expect(pool.query('SELECT name FROM menu_items WHERE id = $1', [menu.rows[0].item_id])).resolves.toMatchObject({ rows: [{ name: 'Market Thali' }] });

  await page.goto(`${baseURL}/app/qr`);
  await expect(page.getByRole('heading', { name: 'QR Studio' })).toBeVisible();
  await page.getByRole('button', { name: 'Print Ready' }).click();
  await expect(page.getByText('Scan to view our menu')).toBeVisible();
  const sticker = page.locator('.qr-print-sticker');
  const stickerBounds = await sticker.boundingBox();
  expect(stickerBounds?.width).toBeGreaterThan(250);
  expect(stickerBounds?.height).toBeGreaterThan(360);
  await expect(sticker.locator('img[alt="Permanent restaurant menu QR code"]')).toHaveJSProperty('naturalWidth', 600);
  await testInfo.attach('sticker-screen-preview', { body: await sticker.screenshot(), contentType: 'image/png' });
  const encodedImage = await sticker.locator('img').getAttribute('src');
  expect(encodedImage).toMatch(/^data:image\/png;base64,/);
  await page.emulateMedia({ media: 'print' });
  await testInfo.attach('sticker-print-preview', { body: await page.screenshot(), contentType: 'image/png' });
  await page.emulateMedia({ media: 'screen' });
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'PNG' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain('MenusQR_E2E_Basic_Cafe');
  const svgPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'SVG' }).click();
  const svgDownload = await svgPromise;
  expect(svgDownload.suggestedFilename()).toContain('.svg');
  await page.getByRole('button', { name: 'Close' }).click();

  await page.goto(`${baseURL}/qr/${encodeURIComponent(qrId)}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: basicRestaurantName })).toBeVisible();
  await expect(page.getByText('Market Thali')).toBeVisible();

  await page.goto(`${baseURL}/app/menu`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Market Thali' }).hover();
  await page.getByRole('button', { name: 'Edit item' }).filter({ visible: true }).first().click();
  await page.getByLabel(/Dish Name/).clear();
  await page.getByLabel(/Dish Name/).fill('Market Thali Updated');
  await page.getByRole('button', { name: 'Save Item' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Menu item updated.' })).toBeVisible();
  await expect(page.getByText('19 left')).toBeVisible();
  const savedItem = await pool.query('SELECT name FROM menu_items WHERE id = $1', [menu.rows[0].item_id]);
  expect(savedItem.rows[0].name).toBe('Market Thali Updated');
  const liveScan = await page.request.get(`${baseURL}/api/public/qr/${encodeURIComponent(qrId)}`);
  expect(liveScan.ok()).toBeTruthy();
  const liveMenu = await liveScan.json();
  expect(liveMenu.items.find((item: { id: string }) => item.id === menu.rows[0].item_id).name).toBe('Market Thali Updated');
  const stableQr = await pool.query('SELECT qr_code_id FROM tenant_qr_identity WHERE tenant_id = $1', [basic.tenantId]);
  expect(stableQr.rows[0].qr_code_id).toBe(qrRecordId);

  await page.goto(`${baseURL}/app/qr`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Order New +' }).click();
  await page.getByLabel('Quantity').fill('50');
  await page.getByLabel('Contact name').fill(managerContactName);
  await page.getByLabel('Contact phone').fill('+1 555 0199');
  await page.getByLabel('Contact email').fill('manager@example.invalid');
  await page.getByLabel('Delivery address').fill('24 River Street');
  await page.getByLabel('City').fill('Portland');
  await page.getByRole('button', { name: 'Submit Request' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Sticker request submitted successfully.' })).toBeVisible();

  const adminContext = await browser.newContext();
  const adminOrigin = new URL(baseURL!);
  adminOrigin.hostname = 'localhost';
  await addAuthCookie(adminContext, adminCookie, 'menusqr_admin_session', adminOrigin.origin);
  const admin = await adminContext.newPage();
  await admin.goto(`${adminOrigin.origin}/admin/sticker-requests`, { waitUntil: 'domcontentloaded' });
  await expect(admin.getByRole('heading', { name: 'Sticker requests', level: 1 }).last()).toBeVisible();
  await expect(admin.getByText(basicRestaurantName)).toBeVisible();
  await expect(admin.getByText(managerContactName)).toBeVisible();
  await expect(admin.getByText('24 River Street')).toBeVisible();
  const requestCard = admin.locator('article').filter({ hasText: basicRestaurantName });
  await requestCard.getByRole('button', { name: 'REVIEWING' }).click();
  await expect(requestCard.getByText('REVIEWING', { exact: true })).toBeVisible();
  await adminContext.close();
  await context.close();
});

test('Premium scan places server-priced order and restaurant accepts it', async ({ browser, baseURL }) => {
  test.slow();
  const context = await browser.newContext();
  await addAuthCookie(context, premium.cookie);
  const page = await context.newPage();
  await page.goto(`${baseURL}/qr/${encodeURIComponent(premium.qrId!)}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: premiumRestaurantName })).toBeVisible();
  await page.getByRole('button', { name: '+ Add' }).first().click();
  await page.getByRole('button', { name: /Open order cart/ }).click();
  await page.getByRole('button', { name: 'Add one Grilled Paneer' }).click();
  await page.getByRole('button', { name: 'Add one Grilled Paneer' }).click();
  await expect(page.locator('.menu-cart-item-controls span')).toHaveText('3');
  await page.getByLabel('Table number').fill('17');
  const orderResponsePromise = page.waitForResponse((response) => response.url().includes('/api/public/qr/') && response.url().endsWith('/orders') && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Place Order' }).click();
  const orderResponse = await orderResponsePromise;
  expect(orderResponse.status()).toBe(201);
  expect((await orderResponse.json()).total).toBe(525);
  await expect(page.getByText('Order Placed Successfully!')).toBeVisible();

  await page.goto(`${baseURL}/app/orders`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Grilled Paneer')).toBeVisible();
  await page.getByRole('button', { name: /ACCEPT/ }).click();
  await expect(page.getByRole('button', { name: /COOKING/ })).toBeVisible();
  await context.close();
});