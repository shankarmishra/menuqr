/**
 * MENUQR — Backfill 001: Populate `restaurant_profiles`, `brand_kits` & `ordering_settings`
 *
 * Implements §8.1 of the Platform Blueprint:
 * - Idempotent, safe to run multiple times.
 * - Reads existing `clients` and `appearance_settings` rows.
 * - Only fills missing/unmigrated profiles without overwriting active updates.
 * - Supports `--dry-run` to print the diff report before writing.
 *
 * Usage:
 *   node backend/backfill/001_profile_backfill.js [--dry-run]
 */

import { pool, connectDB } from '../db.js';
import {
  sanitizeText,
  normalizeInstagram,
  normalizeFacebook,
  normalizeWebsite,
  normalizePhoneNumber,
} from '../validation.js';

const isDryRun = process.argv.includes('--dry-run');

async function runBackfill() {
  console.log(`\n🚀 Starting Profile & Brand Kit Backfill (dryRun=${isDryRun})...\n`);

  const activePool = pool || (await connectDB(process.env.DATABASE_URL));
  const client = await activePool.connect();
  try {
    const clientsRes = await client.query('SELECT * FROM clients');
    console.log(`Found ${clientsRes.rows.length} total client tenant(s) to inspect.\n`);

    let migratedProfiles = 0;
    let migratedBrandKits = 0;
    let migratedOrdering = 0;

    for (const c of clientsRes.rows) {
      const tenantId = c.id;

      // ── 1. Check & Backfill restaurant_profiles ───────────────────────────
      const profRes = await client.query('SELECT tenant_id FROM restaurant_profiles WHERE tenant_id = $1', [tenantId]);
      if (profRes.rows.length === 0) {
        // Build profile from clients row
        const displayName = sanitizeText(c.business_name || 'Restaurant', 80);
        const tagline = sanitizeText(c.tagline || '', 80);
        const cuisineTags = c.cuisine
          ? c.cuisine.split(',').map((s) => sanitizeText(s.trim(), 24)).filter(Boolean)
          : [];

        const address = {
          line: sanitizeText(c.address || '', 120),
          city: sanitizeText(c.city || '', 60),
          state: sanitizeText(c.state || '', 60),
          area: '',
          pincode: '',
          landmark: '',
        };

        const hours = {
          note: sanitizeText(c.opening_hours || '', 120),
          weekly: {},
          exceptions: [],
          lastOrderMinutes: 0,
        };

        // Phone: normalize if present
        const contacts = [];
        if (c.phone) {
          const normPhone = normalizePhoneNumber(c.phone);
          if (normPhone) {
            contacts.push({
              id: 'initial_phone',
              label: 'Primary',
              kind: 'mobile',
              number: normPhone,
              public: true,
              whatsapp: true,
              whatsappMessage: '',
              primary: true,
            });
          }
        }

        // Links
        const links = [];
        if (c.instagram) {
          const ig = normalizeInstagram(c.instagram);
          if (ig) links.push({ type: 'instagram', value: ig, placements: { cover: true, about: true, print: true }, paused: false });
        }
        if (c.facebook) {
          const fb = normalizeFacebook(c.facebook);
          if (fb) links.push({ type: 'facebook', value: fb, placements: { cover: false, about: true, print: true }, paused: false });
        }
        if (c.website) {
          const web = normalizeWebsite(c.website);
          if (web) links.push({ type: 'website', value: web, placements: { cover: false, about: true, print: true }, paused: false });
        }

        const reviewFlags = c.review_flags || { phone_privacy_pending: true };

        console.log(`[PROFILE] Tenant ${tenantId} (${displayName}): missing profile -> will create.`);
        if (!isDryRun) {
          await client.query(
            `INSERT INTO restaurant_profiles (
              tenant_id, display_name, tagline, cuisine_tags, address, hours,
              contacts, links, review_flags, version, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 1, NOW())
            ON CONFLICT (tenant_id) DO NOTHING`,
            [
              tenantId,
              displayName,
              tagline,
              cuisineTags,
              JSON.stringify(address),
              JSON.stringify(hours),
              JSON.stringify(contacts),
              JSON.stringify(links),
              JSON.stringify(reviewFlags),
            ]
          );
        }
        migratedProfiles++;
      }

      // ── 2. Check & Backfill brand_kits ────────────────────────────────────
      const brandRes = await client.query('SELECT tenant_id FROM brand_kits WHERE tenant_id = $1', [tenantId]);
      if (brandRes.rows.length === 0) {
        // Fetch appearance_settings if present
        const appRes = await client.query('SELECT logo, cover_image, accent_configuration FROM appearance_settings WHERE tenant_id = $1', [tenantId]);
        const app = appRes.rows[0] || {};
        const logoUrl = app.logo || c.logo_url || null;

        const logoObj = logoUrl ? { mediaUrl: logoUrl, aspect: 'square', isBadge: false } : {};
        const palette = app.accent_configuration?.palette || {};

        console.log(`[BRAND] Tenant ${tenantId}: missing brand_kit -> will create.`);
        if (!isDryRun) {
          await client.query(
            `INSERT INTO brand_kits (tenant_id, logo, palette, colour_mood, cover_media_id, version, updated_at)
             VALUES ($1, $2, $3, 'default', $4, 1, NOW())
             ON CONFLICT (tenant_id) DO NOTHING`,
            [tenantId, JSON.stringify(logoObj), JSON.stringify(palette), app.cover_image || null]
          );
        }
        migratedBrandKits++;
      }

      // ── 3. Check & Backfill ordering_settings ─────────────────────────────
      const ordRes = await client.query('SELECT tenant_id FROM ordering_settings WHERE tenant_id = $1', [tenantId]);
      if (ordRes.rows.length === 0) {
        console.log(`[ORDERING] Tenant ${tenantId}: missing ordering_settings -> will create.`);
        if (!isDryRun) {
          await client.query(
            `INSERT INTO ordering_settings (tenant_id, dine_in_enabled, takeaway_enabled, delivery_enabled, accepting_orders)
             VALUES ($1, true, false, false, true)
             ON CONFLICT (tenant_id) DO NOTHING`,
            [tenantId]
          );
        }
        migratedOrdering++;
      }
    }

    console.log(`\n Backfill Summary:`);
    console.log(`  Profiles migrated:     ${migratedProfiles}`);
    console.log(`  Brand Kits migrated:   ${migratedBrandKits}`);
    console.log(`  Ordering configs added:${migratedOrdering}`);
    console.log(isDryRun ? `\n(Dry run completed: no database modifications made)\n` : `\nDatabase successfully updated.\n`);
  } finally {
    client.release();
    await pool.end();
  }
}

if (process.argv[1] && process.argv[1].endsWith('001_profile_backfill.js')) {
  runBackfill().catch((err) => {
    console.error('Backfill failed:', err);
    process.exit(1);
  });
}
