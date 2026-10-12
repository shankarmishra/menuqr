import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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

const ALL_15_TEMPLATES = [
  'royal-maharaja',
  'rajasthani-heritage',
  'mughal-luxe',
  'banarasi-gold',
  'south-indian-heritage',
  'indian-street-kitchen',
  'modern-india',
  'spice-house',
  'maison-noir',
  'ivory-dining',
  'grand-table',
  'coffee-house',
  'paper-cafe',
  'bombay-street',
  'minimal-editorial',
];

interface TestFixture {
  tenantId: string;
  slug: string;
  qrId: string;
  menuId: string;
  manchurianId: string;
  noodlesId: string;
  biryaniId: string;
}

let interFixture: TestFixture;
let premFixture: TestFixture;

async function setupRestaurant(plan: 'INTERMEDIATE' | 'PREMIUM', name: string): Promise<TestFixture> {
  const { randomUUID } = await import('node:crypto');
  const tenantId = `e2e-gate-${randomUUID().slice(0, 8)}`;
  const publicId = randomUUID().slice(0, 8);
  const slug = `slug-${tenantId}`;
  const qrId = `qr-${tenantId}`;
  const menuId = randomUUID();
  const catStartersId = randomUUID();
  const catMainsId = randomUUID();
  const manchurianId = randomUUID();
  const noodlesId = randomUUID();
  const biryaniId = randomUUID();
  const variantId = randomUUID();

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  // 1. Client & subscription
  await pool.query(
    'INSERT INTO clients (id, public_id, business_name, menu_slug, status, phone, city) VALUES ($1,$2,$3,$4,$5,$6,$7)',
    [tenantId, publicId, name, slug, 'active', '+91 9876543210', 'Mumbai']
  );
  await pool.query(
    'INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at) VALUES ($1,$2,$3,$4,$5,$6)',
    [randomUUID(), tenantId, plan, 'ACTIVE', now, expiresAt]
  );
  await pool.query(
    'INSERT INTO appearance_settings (id, tenant_id, template_id, restaurant_display_name) VALUES ($1,$2,$3,$4)',
    [randomUUID(), tenantId, 'royal-maharaja', name]
  );
  await pool.query(
    'INSERT INTO qr_codes (id, tenant_id, public_id, qr_id, is_active) VALUES ($1,$2,$3,$4,true)',
    [randomUUID(), tenantId, publicId, qrId]
  );

  // 2. Menu, categories, items
  await pool.query(
    'INSERT INTO menus (id, tenant_id, name, status) VALUES ($1,$2,$3,$4)',
    [menuId, tenantId, 'Main Menu', 'PUBLISHED']
  );
  await pool.query(
    'INSERT INTO menu_categories (id, menu_id, tenant_id, name, sort_order) VALUES ($1,$2,$3,$4,$5)',
    [catStartersId, menuId, tenantId, 'Starters', 1]
  );
  await pool.query(
    'INSERT INTO menu_categories (id, menu_id, tenant_id, name, sort_order) VALUES ($1,$2,$3,$4,$5)',
    [catMainsId, menuId, tenantId, 'Mains', 2]
  );

  // Half/Full Item
  await pool.query(
    `INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, description, price, half_price, full_price, pricing_type, is_available, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true,1)`,
    [manchurianId, menuId, tenantId, catStartersId, 'Dry Manchurian', 'Half: 6 balls\nFull: 10 balls', 120, 120, 200, 'half_full']
  );

  // Standard Item (no variants)
  await pool.query(
    `INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, description, price, pricing_type, is_available, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,2)`,
    [noodlesId, menuId, tenantId, catStartersId, 'Veg Hakka Noodles', 'Wok-tossed noodles with crunchy vegetables', 180, 'single']
  );

  // Custom Variant Item
  await pool.query(
    `INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, description, price, pricing_type, is_available, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,3)`,
    [biryaniId, menuId, tenantId, catMainsId, 'Special Biryani', 'Aromatic dum rice infused with royal saffron', 250, 'single']
  );
  await pool.query(
    `INSERT INTO menu_item_variants (id, menu_item_id, tenant_id, name, price, is_available)
     VALUES ($1,$2,$3,$4,$5,true)`,
    [variantId, biryaniId, tenantId, 'Family Pack (4 pax)', 500]
  );

  return {
    tenantId,
    slug,
    qrId,
    menuId,
    manchurianId,
    noodlesId,
    biryaniId,
  };
}

async function cleanupRestaurant(tenantId: string) {
  await pool.query('DELETE FROM customer_orders WHERE tenant_id = $1', [tenantId]);
  await pool.query('DELETE FROM menu_item_variants WHERE tenant_id = $1', [tenantId]);
  await pool.query('DELETE FROM menu_items WHERE tenant_id = $1', [tenantId]);
  await pool.query('DELETE FROM menu_categories WHERE tenant_id = $1', [tenantId]);
  await pool.query('DELETE FROM menus WHERE tenant_id = $1', [tenantId]);
  await pool.query('DELETE FROM appearance_settings WHERE tenant_id = $1', [tenantId]);
  await pool.query('DELETE FROM qr_codes WHERE tenant_id = $1', [tenantId]);
  await pool.query('DELETE FROM subscriptions WHERE tenant_id = $1', [tenantId]);
  await pool.query('DELETE FROM clients WHERE id = $1', [tenantId]);
}

test.beforeAll(async () => {
  interFixture = await setupRestaurant('INTERMEDIATE', 'Dhaba 1499');
  premFixture = await setupRestaurant('PREMIUM', 'Palace 2999');
});

test.afterAll(async () => {
  if (interFixture) await cleanupRestaurant(interFixture.tenantId);
  if (premFixture) await cleanupRestaurant(premFixture.tenantId);
  await pool.end();
});

test.describe('MENUQR Public Menu Verification Gate', () => {

  test('All 15 registered templates render search bar, correct Half/Full pricing & no ADD on Intermediate', async ({ page, baseURL }) => {
    test.slow();

    for (const templateId of ALL_15_TEMPLATES) {
      // 1. Set template in DB
      await pool.query(
        'UPDATE appearance_settings SET template_id = $1 WHERE tenant_id = $2',
        [templateId, interFixture.tenantId]
      );

      // Invalidate backend cache
      const { invalidatePublicMenuCache } = await import(
        new URL('../../backend/routes/public.js', import.meta.url).href
      );
      invalidatePublicMenuCache(interFixture.tenantId);

      // 2. Navigate to public menu
      await page.goto(`${baseURL}/menu/${interFixture.slug}`, { waitUntil: 'domcontentloaded' });

      // 3. Verify Universal Search Bar is visible near top
      const searchInput = page.getByRole('searchbox', { name: /search dishes/i });
      await expect(searchInput).toBeVisible({ timeout: 10_000 });

      // 4. Verify Half & Full prices display accurately
      await expect(page.getByText('Dry Manchurian').first()).toBeVisible();
      // Should show Half · 6 balls with ₹120 and Full · 10 balls with ₹200
      await expect(page.getByText(/Half.*6 balls/i).first()).toBeVisible();
      await expect(page.getByText('₹120').first()).toBeVisible();
      await expect(page.getByText(/Full.*10 balls/i).first()).toBeVisible();
      await expect(page.getByText('₹200').first()).toBeVisible();

      // 5. Verify plain item without variants displays correctly
      await expect(page.getByText('Veg Hakka Noodles').first()).toBeVisible();
      await expect(page.getByText('₹180').first()).toBeVisible();

      // 6. Verify custom variant displays correctly
      await expect(page.getByText('Special Biryani').first()).toBeVisible();
      await expect(page.getByText(/Family Pack/i).first()).toBeVisible();
      await expect(page.getByText('₹500').first()).toBeVisible();

      // 7. Verify Intermediate plan (₹1,499) completely hides ADD buttons & Cart
      const addButtons = page.getByRole('button', { name: /\+ add/i });
      await expect(addButtons).toHaveCount(0);

      const cartTrigger = page.locator('button[aria-label*="cart"], button[aria-label*="Cart"]');
      await expect(cartTrigger).toHaveCount(0);
    }
  });

  test('Universal Search: dish name filtering, description search, clear button, and empty state', async ({ page, baseURL }) => {
    // Invalidate cache and set template
    await pool.query(
      'UPDATE appearance_settings SET template_id = $1 WHERE tenant_id = $2',
      ['royal-maharaja', interFixture.tenantId]
    );
    const { invalidatePublicMenuCache } = await import(
      new URL('../../backend/routes/public.js', import.meta.url).href
    );
    invalidatePublicMenuCache(interFixture.tenantId);

    await page.goto(`${baseURL}/menu/${interFixture.slug}`, { waitUntil: 'domcontentloaded' });
    const searchInput = page.getByRole('searchbox', { name: /search dishes/i });
    await expect(searchInput).toBeVisible();

    // 1. Search by dish name
    await searchInput.fill('Manchurian');
    await expect(page.getByText('Dry Manchurian').first()).toBeVisible();
    await expect(page.getByText('Veg Hakka Noodles')).toHaveCount(0);
    await expect(page.getByText('Special Biryani')).toHaveCount(0);

    // 2. Clear search using clear button (X)
    const clearBtn = page.getByRole('button', { name: 'Clear search query' });
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await expect(searchInput).toHaveValue('');
    await expect(page.getByText('Dry Manchurian').first()).toBeVisible();
    await expect(page.getByText('Veg Hakka Noodles').first()).toBeVisible();
    await expect(page.getByText('Special Biryani').first()).toBeVisible();

    // 3. Search by description (case-insensitive)
    await searchInput.fill('wOk-ToSsEd');
    await expect(page.getByText('Veg Hakka Noodles').first()).toBeVisible();
    await expect(page.getByText('Dry Manchurian')).toHaveCount(0);

    // 4. Empty state for non-matching search
    await searchInput.fill('ZxyNotFoundDish999');
    await expect(page.getByText(/no dishes found matching/i)).toBeVisible();
    const emptyResetBtn = page.getByRole('button', { name: 'Clear Search', exact: true });
    await emptyResetBtn.click();
    await expect(page.getByText('Dry Manchurian').first()).toBeVisible();
    await expect(page.getByText('Veg Hakka Noodles').first()).toBeVisible();

    // 5. Search with category navigation
    const mainsTab = page.getByRole('button', { name: /Mains/i }).first();
    if (await mainsTab.isVisible()) {
      await mainsTab.click();
      await searchInput.fill('Biryani');
      await expect(page.getByText('Special Biryani').first()).toBeVisible();
      await searchInput.clear();
    }
  });

  test('Search and menu layout responsiveness at 390px and 360px without horizontal overflow', async ({ page, baseURL }) => {
    const viewports = [
      { name: 'Mobile', width: 390, height: 844 },
      { name: 'Narrow Mobile', width: 360, height: 740 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`${baseURL}/menu/${interFixture.slug}`, { waitUntil: 'domcontentloaded' });

      const searchInput = page.getByRole('searchbox', { name: /search dishes/i });
      await expect(searchInput).toBeVisible();

      // Check comfortable touch target size (>= 40px height)
      const box = await searchInput.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(40);

      // Verify no horizontal document overflow
      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth + 2;
      });
      expect(hasOverflow).toBeFalsy();
    }
  });

  test('Premium plan (₹2,999) displays ADD buttons, selects Half/Full variant prices, and orders correctly', async ({ page, baseURL }) => {
    // Invalidate cache
    const { invalidatePublicMenuCache } = await import(
      new URL('../../backend/routes/public.js', import.meta.url).href
    );
    invalidatePublicMenuCache(premFixture.tenantId);

    await page.goto(`${baseURL}/menu/${premFixture.slug}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Palace 2999' }).first()).toBeVisible();

    // 1. ADD buttons must be visible on Premium plan
    const addButtons = page.getByRole('button', { name: /\+ add/i });
    await expect(addButtons.first()).toBeVisible();

    // 2. Click + ADD on Half (₹120)
    const halfAddBtn = page.getByRole('button', { name: /\+ Add Dry Manchurian \(Half/i });
    await halfAddBtn.click();

    // 3. Click + ADD on Full (₹200)
    const fullAddBtn = page.getByRole('button', { name: /\+ Add Dry Manchurian \(Full/i });
    await fullAddBtn.click();

    // 4. Open order cart
    const cartBtn = page.getByRole('button', { name: /open order cart/i });
    await expect(cartBtn).toBeVisible();
    await cartBtn.click();

    // 5. Verify cart items and total (120 + 200 = 320)
    await expect(page.getByText('Half · 6 balls').first()).toBeVisible();
    await expect(page.getByText('Full · 10 balls').first()).toBeVisible();
    await expect(page.getByText('₹320').first()).toBeVisible();

    // 6. Enter table number and place order
    await page.getByLabel(/table number/i).fill('8');

    const orderPromise = page.waitForResponse(
      (resp) => resp.url().includes('/orders') && resp.request().method() === 'POST'
    );
    await page.getByRole('button', { name: /place order/i }).click();

    const orderResp = await orderPromise;
    expect(orderResp.status()).toBe(201);
    const orderData = await orderResp.json();
    expect(orderData.total).toBe(320);
    await expect(page.getByText(/order placed successfully/i)).toBeVisible();
  });

  test('Permanent QR URL (/qr/:qrId) resolves seamlessly with zero URL drift', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/qr/${premFixture.qrId}`, { waitUntil: 'domcontentloaded' });

    // Header and dishes must render
    await expect(page.getByRole('heading', { name: 'Palace 2999' }).first()).toBeVisible();
    await expect(page.getByText('Dry Manchurian').first()).toBeVisible();
    const searchInput = page.getByRole('searchbox', { name: /search dishes/i });
    await expect(searchInput).toBeVisible();
  });

  test('Intermediate plan rejects forged order submissions at API level', async ({ request, baseURL }) => {
    const res = await request.post(`${baseURL}/api/public/menus/${interFixture.slug}/orders`, {
      data: {
        tableNumber: '1',
        items: [{ id: interFixture.manchurianId, quantity: 1, variant: 'Half' }],
      },
    });

    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.error).toMatch(/Online ordering is not available on this plan/i);
  });
});
