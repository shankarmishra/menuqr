// Direct inserts into the SCRATCH database (menuqr_e2e*). Refuses to connect anywhere else.
import { randomUUID, pbkdf2, randomBytes } from 'node:crypto';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { appRoot, assertScratchDbUrl, requirePg } from './gate-env.mjs';

const pbkdf2Async = promisify(pbkdf2);
let pool;

export function getPool() {
  if (pool) return pool;
  const url = process.env.E2E_DATABASE_URL;
  if (!url) throw new Error('E2E_DATABASE_URL is not set. Run the gate through frontend/e2e-gate/run-gate.mjs.');
  assertScratchDbUrl(url);
  const { Pool } = requirePg();
  pool = new Pool({ connectionString: url, max: 4 });
  return pool;
}

export async function closePool() {
  if (pool) await pool.end();
  pool = undefined;
}

/** Synthetic test password for every seeded owner (not a secret). */
export const OWNER_PASSWORD = 'Gate-Owner-Pass-2026!';
let cachedHash;
/** Same format as backend/auth.js hashPassword: PBKDF2-HMAC-SHA256, 600k iterations. */
export async function passwordHash() {
  if (cachedHash) return cachedHash;
  const salt = randomBytes(16);
  const key = await pbkdf2Async(OWNER_PASSWORD, salt, 600000, 32, 'sha256');
  cachedHash = `$pbkdf2-sha256$i=600000$l=32$${salt.toString('hex')}$${key.toString('hex')}`;
  return cachedHash;
}

async function coerceTheme(presetId) {
  const mod = await import(pathToFileURL(join(appRoot(), 'backend', 'themeValidator.js')).href);
  return mod.coerceTheme({ presetId });
}

function insertMany(table, columns, rows) {
  const p = getPool();
  const chunks = [];
  for (let i = 0; i < rows.length; i += 80) chunks.push(rows.slice(i, i + 80));
  return Promise.all(chunks.map((chunk) => {
    const values = [];
    const tuples = chunk.map((row, r) => {
      const marks = row.map((value, c) => {
        values.push(value);
        return `$${r * columns.length + c + 1}`;
      });
      return `(${marks.join(',')})`;
    });
    return p.query(`INSERT INTO ${table} (${columns.join(',')}) VALUES ${tuples.join(',')}`, values);
  }));
}

/**
 * @param {object} o
 * @param {string} o.businessName
 * @param {'BASIC'|'INTERMEDIATE'|'PREMIUM'} [o.plan]
 * @param {'COMPLETED'|'PENDING'} [o.onboarding]
 * @param {string} [o.slug]
 * @param {string} [o.phone] @param {string} [o.city] @param {string} [o.address] @param {string} [o.tagline]
 * @param {string} [o.instagram] @param {string} [o.facebook] @param {string} [o.website] @param {string} [o.cuisine]
 * @param {string} [o.templateId] @param {string} [o.themePreset]  themePreset => theme_published via the backend's own coerceTheme
 * @param {string[]} [o.categories]
 * @param {Array<{name:string,category:number,description?:string,price?:number|null,halfPrice?:number|null,fullPrice?:number|null,imageUrl?:string,diet?:string,variants?:Array<{name:string,price:number}>,bestseller?:boolean}>} [o.items]
 * @param {boolean} [o.withMenu] create the menus row even when there are no items
 * @param {boolean} [o.withQr]
 * @param {string} [o.logoUrl]
 */
export async function seedTenant(o) {
  const p = getPool();
  const tenantId = randomUUID();
  const userId = randomUUID();
  const publicId = randomUUID().replace(/-/g, '').slice(0, 12);
  const slug = o.slug || `gate-${publicId}`;
  const email = o.email || `owner-${publicId}@gate.test`;
  const plan = o.plan || 'PREMIUM';
  const now = new Date();
  const expires = new Date(now);
  expires.setFullYear(expires.getFullYear() + 1);

  await p.query(
    `INSERT INTO clients (id, public_id, business_name, menu_slug, status, phone, city, address, tagline, instagram, facebook, website, cuisine, logo_url)
     VALUES ($1,$2,$3,$4,'active',$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
    [tenantId, publicId, o.businessName, slug, o.phone ?? null, o.city ?? null, o.address ?? null, o.tagline ?? null,
      o.instagram ?? null, o.facebook ?? null, o.website ?? null, o.cuisine ?? null, o.logoUrl ?? null],
  );
  await p.query(
    'INSERT INTO users (id, email, password_hash, role, tenant_id, onboarding_state) VALUES ($1,$2,$3,$4,$5,$6)',
    [userId, email, await passwordHash(), 'RESTAURANT_OWNER', tenantId, o.onboarding || 'COMPLETED'],
  );
  await p.query(
    'INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at, content_period_start) VALUES ($1,$2,$3,$4,$5,$6,$7)',
    [randomUUID(), tenantId, plan, 'ACTIVE', now, expires, now],
  );
  const theme = o.themePreset ? await coerceTheme(o.themePreset) : null;
  await p.query(
    `INSERT INTO appearance_settings (id, tenant_id, template_id, restaurant_display_name, tagline, theme_published, theme_version)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [randomUUID(), tenantId, o.templateId || o.themePreset || 'royal-maharaja', o.businessName, o.tagline ?? null, theme ? JSON.stringify(theme) : null, theme ? 1 : 0],
  );

  const items = o.items || [];
  const categories = o.categories || [];
  let menuId = null;
  const itemIds = [];
  if (items.length || categories.length || o.withMenu) {
    menuId = randomUUID();
    await p.query('INSERT INTO menus (id, tenant_id, name) VALUES ($1,$2,$3)', [menuId, tenantId, 'Main Menu']);
    const categoryIds = categories.map(() => randomUUID());
    if (categories.length) {
      await insertMany('menu_categories', ['id', 'menu_id', 'tenant_id', 'name', 'sort_order'],
        categories.map((name, i) => [categoryIds[i], menuId, tenantId, name, i]));
    }
    const rows = items.map((item, i) => {
      const id = randomUUID();
      itemIds.push(id);
      const split = item.halfPrice != null && item.fullPrice != null;
      return [id, menuId, tenantId, categoryIds[item.category], item.name, item.description || null,
        item.price ?? null, item.halfPrice ?? null, item.fullPrice ?? null, item.imageUrl || null,
        item.diet || 'veg', true, i, split ? 'half-full' : 'single',
        item.bestseller ? JSON.stringify({ tags: { badges: ['bestseller'] } }) : null];
    });
    if (rows.length) {
      await insertMany('menu_items',
        ['id', 'menu_id', 'tenant_id', 'category_id', 'name', 'description', 'price', 'half_price', 'full_price', 'image_url', 'diet_type', 'is_available', 'sort_order', 'pricing_type', 'metadata'],
        rows);
    }
    const variantRows = [];
    items.forEach((item, i) => (item.variants || []).forEach((variant, v) => {
      variantRows.push([randomUUID(), itemIds[i], tenantId, 'Portion', variant.name, variant.price, true, v]);
    }));
    if (variantRows.length) {
      await insertMany('menu_item_variants', ['id', 'menu_item_id', 'tenant_id', 'variant_group', 'name', 'price', 'is_available', 'sort_order'], variantRows);
    }
  }

  let qrId = null;
  if (o.withQr !== false && (menuId || o.withQr)) {
    qrId = randomUUID();
    const qrRowId = randomUUID();
    await p.query('INSERT INTO qr_codes (id, tenant_id, public_id, qr_id, is_active) VALUES ($1,$2,$3,$4,true)', [qrRowId, tenantId, publicId, qrId]);
    await p.query('INSERT INTO tenant_qr_identity (tenant_id, qr_code_id) VALUES ($1,$2)', [tenantId, qrRowId]);
  }
  return { tenantId, userId, publicId, slug, email, password: OWNER_PASSWORD, plan, qrId, menuId, itemCount: items.length, categoryCount: categories.length, businessName: o.businessName };
}

export async function scalar(sql, values = []) {
  const result = await getPool().query(sql, values);
  const row = result.rows[0];
  return row ? Object.values(row)[0] : null;
}
