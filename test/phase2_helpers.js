/**
 * MenuQR Phase 2 E2E Test Suite Helpers & Infrastructure Harness
 * Provides opaque-box HTTP clients, database helpers, ephemeral tenancy lifecycle,
 * full menu hierarchy seeding, SSE stream listeners, and calculation oracles.
 */

import http from 'node:http';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';

const requireBackend = createRequire(new URL('../backend/package.json', import.meta.url));
const pg = requireBackend('pg');
const jwt = requireBackend('jsonwebtoken');

// Configuration
const DB_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/menuqr';
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_12345';
let serverProcess = null;
let cachedPool = null;

/**
 * Returns database pool instance.
 */
export function getDbPool() {
  if (!cachedPool) {
    cachedPool = new pg.Pool({ connectionString: DB_URL });
    cachedPool.on('error', (err) => {
      console.warn('[phase2-helper] DB Pool error:', err.message);
    });
  }
  return cachedPool;
}

/**
 * Closes the database pool to allow clean process termination.
 */
export async function closeDbPool() {
  if (cachedPool) {
    try {
      await cachedPool.end();
    } catch {}
    cachedPool = null;
  }
}

/**
 * Executes a query using the cached pool.
 */
export async function dbQuery(text, params = []) {
  const pool = getDbPool();
  return pool.query(text, params);
}

/**
 * Checks if a table exists in public schema.
 */
export async function tableExists(tableName) {
  try {
    const res = await dbQuery(
      "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1",
      [tableName]
    );
    return res.rows.length > 0;
  } catch {
    return false;
  }
}

/**
 * Resolves the target backend base URL.
 */
export function getBaseUrl() {
  return process.env.TEST_API_URL || 'http://localhost:3001';
}

/**
 * Verifies if the backend server is reachable at /api/health.
 */
export async function isServerHealthy(baseUrl = getBaseUrl()) {
  try {
    const res = await fetch(`${baseUrl}/api/health`, { method: 'GET' });
    return res.ok || res.status === 200 || res.status === 503;
  } catch {
    return false;
  }
}

/**
 * Ensures backend server is running. If not, spawns backend/server.js.
 */
export async function ensureServer(port = 3001) {
  const baseUrl = `http://localhost:${port}`;
  const alive = await isServerHealthy(baseUrl);
  if (alive) {
    return baseUrl;
  }

  return new Promise((resolve, reject) => {
    const env = {
      ...process.env,
      PORT: String(port),
      API_PORT: String(port),
      NODE_ENV: 'development',
      DATABASE_URL: DB_URL,
      JWT_SECRET: JWT_SECRET,
    };
    delete env.NODE_TEST_CONTEXT;

    serverProcess = spawn('node', ['backend/server.js'], {
      cwd: process.cwd(),
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stderrOutput = '';
    serverProcess.stderr.on('data', (d) => {
      stderrOutput += d.toString();
    });

    const timeout = setTimeout(async () => {
      const isUp = await isServerHealthy(baseUrl);
      if (isUp) {
        try {
          serverProcess.unref();
          if (serverProcess.stderr) serverProcess.stderr.unref();
        } catch {}
        resolve(baseUrl);
      } else {
        reject(new Error(`Timed out waiting for server to start on port ${port}. Error: ${stderrOutput}`));
      }
    }, 7000);

    const checkInterval = setInterval(async () => {
      const isUp = await isServerHealthy(baseUrl);
      if (isUp) {
        clearInterval(checkInterval);
        clearTimeout(timeout);
        try {
          serverProcess.unref();
          if (serverProcess.stderr) serverProcess.stderr.unref();
        } catch {}
        resolve(baseUrl);
      }
    }, 400);

    serverProcess.on('error', (err) => {
      clearInterval(checkInterval);
      clearTimeout(timeout);
      reject(err);
    });

    process.on('exit', () => {
      if (serverProcess) {
        try { serverProcess.kill(); } catch {}
      }
    });
  });
}

/**
 * Gracefully terminates spawned server process (if started by tests).
 */
export async function stopServer() {
  if (serverProcess) {
    try {
      if (process.platform === 'win32') {
        const { execSync } = await import('node:child_process');
        execSync(`taskkill /F /PID ${serverProcess.pid} /T`, { stdio: 'ignore' });
      } else {
        serverProcess.kill('SIGKILL');
      }
    } catch {}
    serverProcess = null;
  }
}

/**
 * Creates an authenticated JWT auth token.
 */
export function generateTestAuthToken(user) {
  const payload = {
    id: user.id,
    role: user.role || 'RESTAURANT_OWNER',
    tenantId: user.tenantId || null,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Seeds a comprehensive test tenant with complete MenuQR Phase 2 infrastructure:
 * clients, users, subscriptions, menus, categories, items, variants, addon groups,
 * ordering_settings, and restaurant_tables.
 */
export async function createPhase2Tenant({
  planId = 'PREMIUM',
  expiresAt = new Date(Date.now() + 180 * 86400000),
  status = 'ACTIVE',
  state = 'Maharashtra',
  businessName = 'Royal Spice Bistro',
  googleReviewUrl = 'https://g.page/r/royal-spice-review',
  dineIn = true,
  takeaway = true,
  delivery = true,
  acceptingOrders = true,
  deliveryMinOrder = 0,
  deliveryFee = 0,
  deliveryAreaNote = 'Deliveries within 5km radius',
  deliveryPausedUntil = null,
  deliveryTimeSlots = [],
} = {}) {
  const pool = getDbPool();
  const runId = randomUUID().slice(0, 8);
  const tenantId = `tenant-p2-${runId}`;
  const userId = `user-p2-${runId}`;
  const menuSlug = `royal-spice-${runId}`;
  const subId = `sub-p2-${runId}`;

  // 1. Client
  await pool.query(
    `INSERT INTO clients (id, public_id, business_name, menu_slug, status, state, city, phone)
     VALUES ($1, $2, $3, $4, 'active', $5, 'Mumbai', '9876543210')
     ON CONFLICT (id) DO NOTHING`,
    [tenantId, `pub-${runId}`, `${businessName} ${runId}`, menuSlug, state]
  );

  try {
    await pool.query(
      `UPDATE clients SET google_review_url = $1 WHERE id = $2`,
      [googleReviewUrl, tenantId]
    );
  } catch {}

  // 2. User
  await pool.query(
    `INSERT INTO users (id, email, password_hash, role, tenant_id, onboarding_state)
     VALUES ($1, $2, 'dummyhash', 'RESTAURANT_OWNER', $3, 'COMPLETED')
     ON CONFLICT (id) DO NOTHING`,
    [userId, `owner-${runId}@example.com`, tenantId]
  );

  // 3. Subscription
  await pool.query(
    `INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at)
     VALUES ($1, $2, $3, $4, NOW() - INTERVAL '30 days', $5)
     ON CONFLICT (id) DO NOTHING`,
    [subId, tenantId, planId.toUpperCase(), status, expiresAt]
  );

  // 4. Menu & Categories
  const menuId = `menu-${runId}`;
  await pool.query(
    `INSERT INTO menus (id, tenant_id, name, status) VALUES ($1, $2, $3, 'PUBLISHED')`,
    [menuId, tenantId, 'Main A La Carte Menu']
  );

  const catStarters = `cat-starters-${runId}`;
  const catMains = `cat-mains-${runId}`;
  const catDesserts = `cat-desserts-${runId}`;
  const catBeverages = `cat-beverages-${runId}`;

  await pool.query(
    `INSERT INTO menu_categories (id, menu_id, tenant_id, name, description, sort_order, is_visible)
     VALUES 
       ($1, $2, $3, 'Starters', 'Crispy appetizers and tandoori bites', 1, true),
       ($4, $2, $3, 'Main Course', 'Curries, gravies, and fresh breads', 2, true),
       ($5, $2, $3, 'Desserts', 'Traditional Indian sweets & sundaes', 3, true),
       ($6, $2, $3, 'Beverages', 'Cold mocktails & hot beverages', 4, true)`,
    [catStarters, menuId, tenantId, catMains, catDesserts, catBeverages]
  );

  // 5. Menu Items
  const itemPaneerTikka = `item-paneer-tikka-${runId}`;
  const itemVegCrispy = `item-veg-crispy-${runId}`;
  const itemDalMakhani = `item-dal-makhani-${runId}`;
  const itemButterNaan = `item-butter-naan-${runId}`;
  const itemGulabJamun = `item-gulab-jamun-${runId}`;
  const itemMasalaChai = `item-masala-chai-${runId}`;

  await pool.query(
    `INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, description, price, half_price, full_price, diet_type, is_available, sort_order)
     VALUES
       ($1, $2, $3, $4, 'Paneer Tikka', 'Charcoal grilled cottage cheese marinated in spices', 250.00, 150.00, 250.00, 'veg', true, 1),
       ($5, $2, $3, $4, 'Veg Crispy', 'Deep fried battered vegetables in schezwan sauce', 180.00, NULL, NULL, 'veg', true, 2),
       ($6, $2, $3, $7, 'Dal Makhani', 'Slow-cooked black lentils with fresh cream and butter', 220.00, 130.00, 220.00, 'veg', true, 1),
       ($8, $2, $3, $7, 'Butter Naan', 'Clay-oven baked refined flour bread brushed with butter', 40.00, NULL, NULL, 'veg', true, 2),
       ($9, $2, $3, $10, 'Gulab Jamun', 'Warm milk-solid dumplings dipped in rose-scented syrup', 80.00, NULL, NULL, 'veg', true, 1),
       ($11, $2, $3, $12, 'Masala Chai', 'Aromatic spiced tea with ginger, cardamom and milk', 50.00, NULL, NULL, 'veg', true, 1)`,
    [
      itemPaneerTikka, menuId, tenantId, catStarters,
      itemVegCrispy,
      itemDalMakhani, catMains,
      itemButterNaan,
      itemGulabJamun, catDesserts,
      itemMasalaChai, catBeverages,
    ]
  );

  // 6. Variants for Dal Makhani (Half and Full)
  const variantDalHalf = `var-dal-half-${runId}`;
  const variantDalFull = `var-dal-full-${runId}`;
  try {
    await pool.query(
      `INSERT INTO menu_item_variants (id, menu_item_id, tenant_id, variant_group, name, price, is_available, sort_order)
       VALUES 
         ($1, $2, $3, 'Portion', 'Half', 130.00, true, 1),
         ($4, $2, $3, 'Portion', 'Full', 220.00, true, 2)`,
      [variantDalHalf, itemDalMakhani, tenantId, variantDalFull]
    );
  } catch {}

  // 7. Addon groups and options for Paneer Tikka
  const addonGroupChutney = `ag-chutney-${runId}`;
  const addonExtraMint = `ao-mint-${runId}`;
  try {
    await pool.query(
      `INSERT INTO menu_item_addon_groups (id, menu_item_id, tenant_id, name, is_required, min_select, max_select, sort_order)
       VALUES ($1, $2, $3, 'Dips & Sauces', false, 0, 2, 1)`,
      [addonGroupChutney, itemPaneerTikka, tenantId]
    );
    await pool.query(
      `INSERT INTO menu_item_addon_options (id, addon_group_id, tenant_id, name, price, is_available, sort_order)
       VALUES ($1, $2, $3, 'Extra Mint Chutney', 30.00, true, 1)`,
      [addonExtraMint, addonGroupChutney, tenantId]
    );
  } catch {}

  // 8. Ordering Settings
  await pool.query(
    `INSERT INTO ordering_settings (
       tenant_id, dine_in_enabled, takeaway_enabled, delivery_enabled, accepting_orders,
       delivery_min_order, delivery_fee, delivery_area_note, delivery_paused_until, delivery_time_slots
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     ON CONFLICT (tenant_id) DO UPDATE SET
       dine_in_enabled = EXCLUDED.dine_in_enabled,
       takeaway_enabled = EXCLUDED.takeaway_enabled,
       delivery_enabled = EXCLUDED.delivery_enabled,
       accepting_orders = EXCLUDED.accepting_orders,
       delivery_min_order = EXCLUDED.delivery_min_order,
       delivery_fee = EXCLUDED.delivery_fee,
       delivery_area_note = EXCLUDED.delivery_area_note,
       delivery_paused_until = EXCLUDED.delivery_paused_until,
       delivery_time_slots = EXCLUDED.delivery_time_slots`,
    [
      tenantId,
      dineIn,
      takeaway,
      delivery,
      acceptingOrders,
      deliveryMinOrder,
      deliveryFee,
      deliveryAreaNote,
      deliveryPausedUntil,
      JSON.stringify(deliveryTimeSlots),
    ]
  );

  // 9. Restaurant Dining Tables (Tables 1 through 15)
  for (let i = 1; i <= 15; i++) {
    try {
      await pool.query(
        `INSERT INTO restaurant_tables (tenant_id, table_number, label, capacity, is_active)
         VALUES ($1, $2, $3, 4, true)
         ON CONFLICT (tenant_id, table_number) DO NOTHING`,
        [tenantId, i, `Table ${i}`]
      );
    } catch {}
  }

  const token = generateTestAuthToken({ id: userId, role: 'RESTAURANT_OWNER', tenantId });

  return {
    runId,
    tenantId,
    userId,
    menuSlug,
    subId,
    token,
    authHeaders: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    items: {
      paneerTikka: { id: itemPaneerTikka, name: 'Paneer Tikka', price: 250, halfPrice: 150, fullPrice: 250 },
      vegCrispy: { id: itemVegCrispy, name: 'Veg Crispy', price: 180 },
      dalMakhani: { id: itemDalMakhani, name: 'Dal Makhani', price: 220, halfPrice: 130, fullPrice: 220 },
      butterNaan: { id: itemButterNaan, name: 'Butter Naan', price: 40 },
      gulabJamun: { id: itemGulabJamun, name: 'Gulab Jamun', price: 80 },
      masalaChai: { id: itemMasalaChai, name: 'Masala Chai', price: 50 },
    },
    categories: {
      starters: { id: catStarters, name: 'Starters' },
      mains: { id: catMains, name: 'Main Course' },
      desserts: { id: catDesserts, name: 'Desserts' },
      beverages: { id: catBeverages, name: 'Beverages' },
    },
    addons: {
      extraMintChutney: { id: addonExtraMint, name: 'Extra Mint Chutney', price: 30 },
    },
  };
}

/**
 * Thoroughly cleans up all records associated with a Phase 2 test tenant.
 */
export async function cleanupPhase2Tenant(tenantId) {
  if (!tenantId) return;
  const pool = getDbPool();

  const safeDelete = async (table, col = 'tenant_id') => {
    try {
      if (await tableExists(table)) {
        await pool.query(`DELETE FROM ${table} WHERE ${col} = $1`, [tenantId]);
      }
    } catch {}
  };

  try {
    // Delete line items first
    try {
      if (await tableExists('token_items') && await tableExists('table_tokens')) {
        await pool.query(
          `DELETE FROM token_items WHERE token_id IN (SELECT id FROM table_tokens WHERE tenant_id = $1)`,
          [tenantId]
        );
      }
    } catch {}

    await safeDelete('table_tokens');
    await safeDelete('customer_orders');
    await safeDelete('menu_item_addon_options');
    await safeDelete('menu_item_addon_groups');
    await safeDelete('menu_item_variants');
    await safeDelete('menu_items');
    await safeDelete('menu_categories');
    await safeDelete('menus');
    await safeDelete('ordering_settings');
    await safeDelete('restaurant_tables');
    await safeDelete('dining_tables');
    await safeDelete('link_clicks_daily');
    await safeDelete('subscription_events');
    await safeDelete('gst_invoices');
    await safeDelete('orders');
    await safeDelete('subscriptions');
    await safeDelete('users');
    await safeDelete('clients', 'id');
  } catch (err) {
    console.warn(`[cleanupPhase2Tenant] Warning cleaning ${tenantId}:`, err.message);
  }
}

/**
 * Executes an HTTP API request (authenticated or unauthenticated).
 */
export async function apiRequest(method, path, { token = null, body = null, headers = {}, baseUrl = getBaseUrl() } = {}) {
  const url = `${baseUrl}${path}`;
  const reqHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };
  if (token) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers: reqHeaders,
  };

  if (body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
    options.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    let parsedData = null;
    let rawText = '';

    if (contentType.includes('application/json')) {
      parsedData = await res.json();
    } else {
      rawText = await res.text();
      try {
        parsedData = JSON.parse(rawText);
      } catch {
        parsedData = rawText;
      }
    }

    return {
      status: res.status,
      ok: res.ok,
      headers: res.headers,
      data: parsedData,
      rawText,
    };
  } catch (err) {
    return {
      status: 0,
      ok: false,
      headers: new Headers(),
      data: null,
      error: err.message,
    };
  }
}

/**
 * Executes an unauthenticated public HTTP request.
 */
export async function publicRequest(method, path, { body = null, headers = {}, baseUrl = getBaseUrl() } = {}) {
  return apiRequest(method, path, { token: null, body, headers, baseUrl });
}

/**
 * Native Node.js Server-Sent Events (SSE) listener.
 */
export function listenToSse(urlStr, { headers = {}, timeoutMs = 4000, matchEvent = null, maxEvents = 1 } = {}) {
  return new Promise((resolve) => {
    const url = new URL(urlStr);
    const events = [];
    let buffer = '';

    let resolved = false;
    const finish = () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timer);
      try { req.destroy(); } catch {}
      resolve(events);
    };

    const timer = setTimeout(finish, timeoutMs);
    if (timer.unref) timer.unref();

    const req = http.get(url, { headers: { Accept: 'text/event-stream', ...headers } }, (res) => {
      res.on('data', (chunk) => {
        buffer += chunk.toString('utf8');
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          const lines = part.split('\n');
          let eventType = 'message';
          let eventData = '';
          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              eventData += line.slice(6);
            }
          }

          if (eventType || eventData) {
            let parsed = eventData;
            try { parsed = JSON.parse(eventData); } catch {}
            const ev = { event: eventType, data: parsed };
            events.push(ev);

            if (matchEvent) {
              if (matchEvent(ev)) {
                try { res.destroy(); } catch {}
                return finish();
              }
            } else if (events.length >= maxEvents) {
              try { res.destroy(); } catch {}
              return finish();
            }
          }
        }
      });

      res.on('end', () => finish());
      res.on('error', () => finish());
    });

    req.on('error', () => finish());
  });
}
