import './backend/env.js';
import { connectDB, queryPortable } from './backend/db.js';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const EXCEL_PATH = 'C:/Users/xshan/Downloads/Updated Menu-data.xlsx';
const TENANT_ID = 'tenant_shobharams';
const MENU_ID = 'menu_shobharams';

async function seed() {
  const pool = await connectDB(process.env.DATABASE_URL);
  console.log('Seeding Shobharam into local DB...');

  // 1. Upsert Client
  await pool.query(`
    INSERT INTO clients (
      id, public_id, business_name, menu_slug, status, category, tagline, cuisine, phone, city, address, logo_url
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
    ) ON CONFLICT (id) DO UPDATE SET
      business_name = EXCLUDED.business_name,
      menu_slug = EXCLUDED.menu_slug,
      tagline = EXCLUDED.tagline,
      cuisine = EXCLUDED.cuisine,
      phone = EXCLUDED.phone,
      city = EXCLUDED.city,
      address = EXCLUDED.address,
      logo_url = EXCLUDED.logo_url,
      status = 'active'
  `, [
    TENANT_ID,
    'pub_shobharams',
    "Shobharam's",
    'shobharam',
    'active',
    'restaurants',
    'Traditional Recipes • 100% Pure Veg',
    'Pure Veg North Indian • Traditional Sweets',
    '+91 98765 43210',
    'Jaipur',
    'Main Market Road, City Center',
    '/uploads/shobharam/shobharam_logo_transparent.webp'
  ]);
  console.log('Client record upserted.');

  // 2. Active Subscription
  await pool.query(`
    INSERT INTO subscriptions (
      id, tenant_id, plan_id, status, started_at, expires_at
    ) VALUES (
      $1, $2, $3, $4, NOW(), NOW() + INTERVAL '1 year'
    ) ON CONFLICT (tenant_id) DO UPDATE SET
      status = 'active',
      expires_at = NOW() + INTERVAL '1 year'
  `, [
    'sub_shobharams',
    TENANT_ID,
    'premium',
    'active'
  ]);
  console.log('Subscription active.');

  // 3. User account for sr.shobharams@gmail.com
  await pool.query(`
    INSERT INTO users (
      id, email, password_hash, role, tenant_id, onboarding_state
    ) VALUES (
      $1, $2, $3, $4, $5, $6
    ) ON CONFLICT (email) DO UPDATE SET
      tenant_id = EXCLUDED.tenant_id
  `, [
    'user_shobharams',
    'sr.shobharams@gmail.com',
    'otp_login_only',
    'client',
    TENANT_ID,
    'COMPLETED'
  ]);
  console.log('User account linked.');

  // 4. Menu
  await pool.query(`
    INSERT INTO menus (
      id, tenant_id, name, status, version
    ) VALUES (
      $1, $2, $3, $4, $5
    ) ON CONFLICT (id) DO UPDATE SET
      status = 'PUBLISHED'
  `, [
    MENU_ID,
    TENANT_ID,
    'Main Dining Menu',
    'PUBLISHED',
    1
  ]);

  // 5. Delete previous categories & items for clean replace
  await pool.query('DELETE FROM menu_items WHERE tenant_id = $1', [TENANT_ID]);
  await pool.query('DELETE FROM menu_categories WHERE tenant_id = $1', [TENANT_ID]);

  // 6. Read Excel
  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);
  console.log(`Loaded ${rows.length} rows from Excel.`);

  const categoryMap = new Map();
  let catOrder = 1;

  for (const row of rows) {
    const catName = (row['Category'] || 'Other').trim();
    if (!categoryMap.has(catName)) {
      const catId = randomUUID();
      await pool.query(`
        INSERT INTO menu_categories (
          id, menu_id, tenant_id, name, sort_order, is_visible
        ) VALUES ($1, $2, $3, $4, $5, true)
      `, [catId, MENU_ID, TENANT_ID, catName, catOrder++]);
      categoryMap.set(catName, catId);
    }

    const catId = categoryMap.get(catName);
    const itemName = (row['Dish Name'] || row['Item Name'] || '').trim();
    if (!itemName) continue;

    const singlePrice = parseFloat(row['Single Price'] || row['Price']) || null;
    const halfPrice = parseFloat(row['Half Price']) || null;
    const fullPrice = parseFloat(row['Full Price']) || null;
    const desc = (row['Description'] || '').trim() || null;
    const dietType = (row['Diet Type'] || 'veg').toLowerCase().includes('non') ? 'non-veg' : 'veg';
    const isAvailable = (row['Available'] || 'yes').toString().toLowerCase() !== 'no';

    // Assign hero dish image to first item or specials
    let imageUrl = null;
    if (catName.toLowerCase().includes('special') || catName.toLowerCase().includes('thali')) {
      imageUrl = '/uploads/shobharam/cover_hero_dish_extracted.webp';
    }

    await pool.query(`
      INSERT INTO menu_items (
        id, menu_id, tenant_id, category_id, name, description, price, half_price, full_price, diet_type, is_available, image_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [
      randomUUID(),
      MENU_ID,
      TENANT_ID,
      catId,
      itemName,
      desc,
      singlePrice,
      halfPrice,
      fullPrice,
      dietType,
      isAvailable,
      imageUrl
    ]);
  }

  // 7. QR Code
  await pool.query(`
    INSERT INTO qr_codes (
      id, tenant_id, public_id, qr_id, destination_type, is_active
    ) VALUES (
      $1, $2, $3, $4, $5, true
    ) ON CONFLICT (qr_id) DO NOTHING
  `, [
    'qr_code_shobharams',
    TENANT_ID,
    'pub_shobharams',
    'shobharam-qr-01',
    'menu'
  ]);

  // 8. Appearance Settings
  await pool.query(`
    INSERT INTO appearance_settings (
      id, tenant_id, template_id, restaurant_display_name, tagline, logo
    ) VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (tenant_id) DO UPDATE SET
      template_id = EXCLUDED.template_id,
      restaurant_display_name = EXCLUDED.restaurant_display_name,
      tagline = EXCLUDED.tagline,
      logo = EXCLUDED.logo
  `, [
    randomUUID(),
    TENANT_ID,
    'rajasthani-heritage',
    "Shobharam's",
    'Traditional Recipes • 100% Pure Veg',
    '/uploads/shobharam/shobharam_logo_transparent.webp'
  ]);

  console.log(`\nDONE! Seeded ${categoryMap.size} categories and ${rows.length} dishes for Shobharam!`);
  console.log(`Menu Slug: /menu/shobharam`);
  console.log(`QR Code: /qr/shobharam-qr-01`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
