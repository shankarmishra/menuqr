import { test, expect, type Page } from '@playwright/test';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const backendRequire = createRequire(resolve(repoRoot, 'backend/package.json'));
backendRequire('dotenv').config({ path: resolve(repoRoot, 'backend/.env') });
const { Pool } = backendRequire('pg');

let dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  try {
    const parsed = new URL(dbUrl);
    const dbName = decodeURIComponent(parsed.pathname).replace(/^\/+/, '');
    if (!/(?:^|[_-])test(?:$|[_-])/i.test(dbName)) {
      parsed.pathname = `/${dbName}_test`;
      dbUrl = parsed.toString();
    }
  } catch {}
}
const pool = new Pool({ connectionString: dbUrl });
const { hashPassword, generateAuthCookie } = await import(pathToFileURL(resolve(repoRoot, 'backend/auth.js')).href);

function cookieValue(header: string) {
  return header.split(';', 1)[0].split('=').slice(1).join('=');
}

type Fixture = {
  tenantId: string;
  userId: string;
  menuSlug: string;
  cookie: string;
  businessName: string;
};

let premiumFixture: Fixture;
let basicFixture: Fixture;

test.beforeAll(async () => {
  const { randomUUID } = await import('node:crypto');
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  // 1. Create Premium Restaurant
  const premTenantId = randomUUID();
  const premUserId = randomUUID();
  const premPublicId = randomUUID().slice(0, 10);
  const premSlug = `e2e-prem-${premPublicId}`;
  const premName = 'Spice Route Luxury';

  await pool.query(
    'INSERT INTO clients (id, public_id, business_name, menu_slug, status, phone, city, address) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
    [premTenantId, premPublicId, premName, premSlug, 'active', '+91 9876543210', 'Jaipur', 'Plot 42, Hawa Mahal Road']
  );
  await pool.query(
    'INSERT INTO users (id, email, password_hash, role, tenant_id, onboarding_state) VALUES ($1,$2,$3,$4,$5,$6)',
    [premUserId, `prem-${premTenantId}@example.test`, await hashPassword('password123'), 'RESTAURANT_OWNER', premTenantId, 'COMPLETED']
  );
  await pool.query(
    'INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at, content_period_start) VALUES ($1,$2,$3,$4,$5,$6,$7)',
    [randomUUID(), premTenantId, 'PREMIUM', 'ACTIVE', now, expiresAt, now]
  );
  await pool.query(
    'INSERT INTO appearance_settings (id, tenant_id, template_id, restaurant_display_name) VALUES ($1,$2,$3,$4)',
    [randomUUID(), premTenantId, 'royal-maharaja', premName]
  );

  const premMenuId = randomUUID();
  const premCatId = randomUUID();
  const premItemId = randomUUID();
  await pool.query('INSERT INTO menus (id, tenant_id, name) VALUES ($1,$2,$3)', [premMenuId, premTenantId, 'Main Menu']);
  await pool.query('INSERT INTO menu_categories (id, menu_id, tenant_id, name, sort_order) VALUES ($1,$2,$3,$4,$5)', [premCatId, premMenuId, premTenantId, 'Curries & Breads', 1]);
  await pool.query(
    'INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, description, price, half_price, full_price, pricing_type, diet_type, is_available, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)',
    [premItemId, premMenuId, premTenantId, premCatId, 'Paneer Tikka Masala', 'Smoky roasted paneer in spiced gravy', 280, 160, 280, 'half-full', 'veg', true, 1]
  );

  premiumFixture = {
    tenantId: premTenantId,
    userId: premUserId,
    menuSlug: premSlug,
    businessName: premName,
    cookie: cookieValue(generateAuthCookie({ id: premUserId, role: 'RESTAURANT_OWNER', tenantId: premTenantId }))
  };

  // 2. Create Basic Restaurant
  const basicTenantId = randomUUID();
  const basicUserId = randomUUID();
  const basicPublicId = randomUUID().slice(0, 10);
  const basicSlug = `e2e-basic-${basicPublicId}`;
  const basicName = 'Simple Dhaba';

  await pool.query(
    'INSERT INTO clients (id, public_id, business_name, menu_slug, status, phone, city, address) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
    [basicTenantId, basicPublicId, basicName, basicSlug, 'active', '+91 9999988888', 'Delhi', 'NH-8 Highway']
  );
  await pool.query(
    'INSERT INTO users (id, email, password_hash, role, tenant_id, onboarding_state) VALUES ($1,$2,$3,$4,$5,$6)',
    [basicUserId, `basic-${basicTenantId}@example.test`, await hashPassword('password123'), 'RESTAURANT_OWNER', basicTenantId, 'COMPLETED']
  );
  await pool.query(
    'INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at, content_period_start) VALUES ($1,$2,$3,$4,$5,$6,$7)',
    [randomUUID(), basicTenantId, 'BASIC', 'ACTIVE', now, expiresAt, now]
  );

  const basicMenuId = randomUUID();
  const basicCatId = randomUUID();
  const basicItemId = randomUUID();
  await pool.query('INSERT INTO menus (id, tenant_id, name) VALUES ($1,$2,$3)', [basicMenuId, basicTenantId, 'Main Menu']);
  await pool.query('INSERT INTO menu_categories (id, menu_id, tenant_id, name, sort_order) VALUES ($1,$2,$3,$4,$5)', [basicCatId, basicMenuId, basicTenantId, 'Starters', 1]);
  await pool.query(
    'INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, description, price, diet_type, is_available, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
    [basicItemId, basicMenuId, basicTenantId, basicCatId, 'Dal Tadka', 'Yellow lentils tempered with cumin', 120, 'veg', true, 1]
  );

  basicFixture = {
    tenantId: basicTenantId,
    userId: basicUserId,
    menuSlug: basicSlug,
    businessName: basicName,
    cookie: cookieValue(generateAuthCookie({ id: basicUserId, role: 'RESTAURANT_OWNER', tenantId: basicTenantId }))
  };
});

test.afterAll(async () => {
  if (premiumFixture?.tenantId) {
    await pool.query('DELETE FROM customer_orders WHERE tenant_id = $1', [premiumFixture.tenantId]);
    await pool.query('DELETE FROM menu_items WHERE tenant_id = $1', [premiumFixture.tenantId]);
    await pool.query('DELETE FROM menu_categories WHERE tenant_id = $1', [premiumFixture.tenantId]);
    await pool.query('DELETE FROM menus WHERE tenant_id = $1', [premiumFixture.tenantId]);
    await pool.query('DELETE FROM appearance_settings WHERE tenant_id = $1', [premiumFixture.tenantId]);
    await pool.query('DELETE FROM subscriptions WHERE tenant_id = $1', [premiumFixture.tenantId]);
    await pool.query('DELETE FROM users WHERE tenant_id = $1', [premiumFixture.tenantId]);
    await pool.query('DELETE FROM clients WHERE id = $1', [premiumFixture.tenantId]);
  }
  if (basicFixture?.tenantId) {
    await pool.query('DELETE FROM customer_orders WHERE tenant_id = $1', [basicFixture.tenantId]);
    await pool.query('DELETE FROM menu_items WHERE tenant_id = $1', [basicFixture.tenantId]);
    await pool.query('DELETE FROM menu_categories WHERE tenant_id = $1', [basicFixture.tenantId]);
    await pool.query('DELETE FROM menus WHERE tenant_id = $1', [basicFixture.tenantId]);
    await pool.query('DELETE FROM subscriptions WHERE tenant_id = $1', [basicFixture.tenantId]);
    await pool.query('DELETE FROM users WHERE tenant_id = $1', [basicFixture.tenantId]);
    await pool.query('DELETE FROM clients WHERE id = $1', [basicFixture.tenantId]);
  }
  await pool.end();
});

test.describe('End-to-End Customer QR Ordering & Reception Lifecycle', () => {

  test('1. Basic Plan Menu: Ordering and Add to Cart must be disabled', async ({ page }) => {
    await page.goto(`/menu/${basicFixture.menuSlug}`);
    await expect(page.locator('text=Simple Dhaba').first()).toBeVisible({ timeout: 10_000 });
    
    // Add to cart buttons and floating cart bar must NOT exist for Basic plan
    await expect(page.locator('.menu-floating-cart-bar')).not.toBeAttached();
    await expect(page.locator('button:has-text("Add")')).toHaveCount(0);
  });

  test('2. Complete Dine-In Order Lifecycle: Menu -> Cart -> Checkout -> Reception -> Status Updates', async ({ browser }) => {
    // Context 1: Customer on Mobile / Tablet browser
    const customerContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const customerPage = await customerContext.newPage();

    // Context 2: Restaurant Staff on Desktop Reception Dashboard
    const staffContext = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    });
    await staffContext.addCookies([
      {
        name: 'menusqr_auth',
        value: premiumFixture.cookie,
        domain: '127.0.0.1',
        path: '/',
        httpOnly: true,
        sameSite: 'Lax',
      }
    ]);
    const staffPage = await staffContext.newPage();

    // Step A: Customer scans QR with table parameter "?table=7"
    await customerPage.goto(`/menu/${premiumFixture.menuSlug}?table=7`);
    await expect(customerPage.locator(`text=${premiumFixture.businessName}`).first()).toBeVisible({ timeout: 10_000 });

    // Step B: Customer adds item to cart
    const addBtn = customerPage.locator('button:has-text("Add")').first();
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    // Verify floating bottom cart bar appears
    const cartBar = customerPage.locator('.menu-floating-cart-bar');
    await expect(cartBar).toBeVisible();
    await expect(cartBar).toContainText('1 item');

    // Capture screenshot: Customer Cart Bar
    await customerPage.screenshot({ path: 'qa-screenshots/order_flow_01_customer_menu_with_cart.png' });

    // Step C: Customer opens cart modal
    await cartBar.locator('button:has-text("View Cart")').click();
    await expect(customerPage.locator('.menu-cart-modal')).toBeVisible();
    await customerPage.waitForTimeout(400);

    // Verify Table 7 is auto-filled from query parameter
    const tableInput = customerPage.locator('input[placeholder*="Table"]');
    await expect(tableInput).toHaveValue('7');

    // Fill customer contact details
    await customerPage.locator('input[placeholder*="Rahul Sharma"]').fill('Vikram Malhotra');
    await customerPage.locator('input[placeholder*="10-digit mobile"]').fill('9876543210');
    await customerPage.locator('input[placeholder*="Less spicy"]').fill('Extra spicy and crisp onions');
    await customerPage.waitForTimeout(200);

    // Capture screenshot: Checkout Modal
    await customerPage.screenshot({ path: 'qa-screenshots/order_flow_02_customer_checkout_modal.png' });

    // Submit Order
    const placeOrderBtn = customerPage.locator('button:has-text("Confirm & Place Order")');
    await placeOrderBtn.scrollIntoViewIfNeeded();
    await placeOrderBtn.click();

    // Verify Live Order Tracking modal appears with Step 1 "Order Placed"
    await expect(customerPage.locator('.tracker-modal')).toBeVisible({ timeout: 10_000 });
    await expect(customerPage.locator('.order-tracker-badge')).toContainText('NEW');
    await expect(customerPage.locator('.order-tracker-title', { hasText: 'Order Placed' })).toBeVisible();

    // Ensure previous cart modal has completely transitioned out
    await expect(customerPage.locator('.checkout-modal')).not.toBeVisible();

    // Capture screenshot: Live Order Tracking - Step 1 Placed
    await customerPage.screenshot({ path: 'qa-screenshots/order_flow_03_customer_tracking_placed.png' });

    // Step D: Staff opens /app/orders reception dashboard
    await staffPage.goto('/app/orders');
    await expect(staffPage.locator('text=Live Order Reception')).toBeVisible({ timeout: 10_000 });

    // Wait for the full app splash loading screen to finish fading out
    await staffPage.waitForSelector('div[role="status"][aria-label*="Loading"]', { state: 'detached', timeout: 8_000 }).catch(() => {});
    await staffPage.waitForTimeout(600);

    // Find the new order card
    const orderCard = staffPage.locator('.bg-\\[\\#151c19\\]', { hasText: 'Vikram Malhotra' }).first();
    await expect(orderCard).toBeVisible();
    await expect(orderCard).toContainText('Table: 7');
    await expect(orderCard).toContainText('Extra spicy and crisp onions');

    // Capture screenshot: Restaurant Order Reception Panel (Desktop 1280px)
    await staffPage.screenshot({ path: 'qa-screenshots/order_flow_04_restaurant_panel_new_order.png' });

    // Capture screenshot: Tablet Viewport (768px)
    await staffPage.setViewportSize({ width: 768, height: 1024 });
    await staffPage.waitForTimeout(300);
    await staffPage.screenshot({ path: 'qa-screenshots/order_flow_04_restaurant_panel_tablet.png' });

    // Capture screenshot: Mobile Viewport (375px)
    await staffPage.setViewportSize({ width: 375, height: 812 });
    await staffPage.waitForTimeout(300);
    await staffPage.screenshot({ path: 'qa-screenshots/order_flow_04_restaurant_panel_mobile.png' });

    // Restore Desktop Viewport
    await staffPage.setViewportSize({ width: 1280, height: 720 });
    await staffPage.waitForTimeout(300);

    // Step E: Staff clicks "ACCEPT"
    const acceptBtn = orderCard.locator('button:has-text("ACCEPT")');
    await acceptBtn.click();

    // Verify order moves to ACCEPTED
    await expect(orderCard.locator('button:has-text("START COOKING")')).toBeVisible({ timeout: 8_000 });

    // Step F: Staff clicks "START COOKING"
    const startCookingBtn = orderCard.locator('button:has-text("START COOKING")');
    await startCookingBtn.click();
    await expect(orderCard.locator('button:has-text("READY TO SERVE")')).toBeVisible({ timeout: 8_000 });

    // Verify customer tracker auto-updates to "Cooking / Preparing" (polling every 4s)
    await expect(customerPage.locator('.order-tracker-badge')).toContainText('PREPARING', { timeout: 12_000 });
    await expect(customerPage.locator('text=Cooking • Freshly being prepared')).toBeVisible();

    // Capture screenshot: Customer Tracker in Preparing state
    await customerPage.screenshot({ path: 'qa-screenshots/order_flow_05_customer_tracking_cooking.png' });

    // Step G: Staff clicks "READY TO SERVE"
    const readyBtn = orderCard.locator('button:has-text("READY TO SERVE")');
    await readyBtn.click();
    await expect(orderCard.locator('button:has-text("TABLE SERVED")')).toBeVisible({ timeout: 8_000 });

    // Step H: Staff marks "TABLE SERVED"
    const servedBtn = orderCard.locator('button:has-text("TABLE SERVED")');
    await servedBtn.click();
    await expect(orderCard.locator('text=Done')).toBeVisible({ timeout: 8_000 });

    // Verify customer tracker auto-updates to "Served • Enjoy your meal!"
    await expect(customerPage.locator('.order-tracker-badge')).toContainText('COMPLETED', { timeout: 12_000 });
    await expect(customerPage.locator('text=Served • Enjoy your meal!')).toBeVisible();

    // Capture screenshot: Customer Tracker Completed
    await customerPage.screenshot({ path: 'qa-screenshots/order_flow_06_customer_tracking_served.png' });

    await customerContext.close();
    await staffContext.close();
  });

  test('3. Delivery Order and Decline/Rejection Flow', async ({ browser }) => {
    const customerContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const customerPage = await customerContext.newPage();

    const staffContext = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    });
    await staffContext.addCookies([
      {
        name: 'menusqr_auth',
        value: premiumFixture.cookie,
        domain: '127.0.0.1',
        path: '/',
        httpOnly: true,
        sameSite: 'Lax',
      }
    ]);
    const staffPage = await staffContext.newPage();

    // Step A: Customer opens menu in delivery mode
    await customerPage.goto(`/menu/${premiumFixture.menuSlug}`);
    await expect(customerPage.locator(`text=${premiumFixture.businessName}`).first()).toBeVisible({ timeout: 10_000 });

    const addBtn = customerPage.locator('button:has-text("Add")').first();
    await addBtn.click();
    await customerPage.locator('.menu-floating-cart-bar button:has-text("View Cart")').click();

    // Switch to Delivery tab
    await customerPage.locator('button:has-text("Delivery / Takeaway")').click();

    // Fill delivery form
    await customerPage.locator('input[placeholder*="Rahul Sharma"]').fill('Ananya Sen');
    await customerPage.locator('input[placeholder*="10-digit mobile"]').fill('9123456789');
    await customerPage.locator('textarea[placeholder*="Flat / House"]').fill('Tower 3, Apt 1102, Gardenia Residency');
    await customerPage.locator('input[placeholder*="Near Metro"]').fill('Opposite Central Mall');

    // Submit Delivery order
    const deliverySubmitBtn = customerPage.locator('button:has-text("Confirm & Place Order")');
    await deliverySubmitBtn.scrollIntoViewIfNeeded();
    await deliverySubmitBtn.click();
    await expect(customerPage.locator('.tracker-modal')).toBeVisible({ timeout: 10_000 });
    await expect(customerPage.locator('text=Home Delivery')).toBeVisible();

    // Step B: Staff reception panel receives delivery order
    await staffPage.goto('/app/orders');
    const orderCard = staffPage.locator('.bg-\\[\\#151c19\\]', { hasText: 'Ananya Sen' }).first();
    await expect(orderCard).toBeVisible({ timeout: 10_000 });
    await expect(orderCard).toContainText(/Delivery Order/i);
    await expect(orderCard).toContainText('Tower 3, Apt 1102');

    // Step C: Staff declines the order
    await orderCard.locator('button:has-text("Reject")').click();
    await expect(staffPage.locator('text=Decline Order')).toBeVisible();
    
    // Choose reason: Kitchen busy
    await staffPage.locator('button:has-text("Kitchen busy / High order volume")').click();
    await staffPage.locator('button:has-text("Confirm Decline")').click();

    // Step D: Verify customer tracking reflects Order Declined
    await expect(customerPage.locator('text=Order Declined')).toBeVisible({ timeout: 12_000 });
    await expect(customerPage.locator('text=Kitchen busy / High order volume')).toBeVisible();

    // Capture screenshot: Customer Declined Notice
    await customerPage.screenshot({ path: 'qa-screenshots/order_flow_07_customer_order_declined.png' });

    await customerContext.close();
    await staffContext.close();
  });
});
