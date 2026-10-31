/**
 * MENUQR backfill 001: fill `restaurant_profiles`, `brand_kits` and `ordering_settings` for the
 * restaurants that existed before those tables did (Blueprint section 8.1).
 *
 * The rule that shapes everything below: running this must not change what a diner sees today.
 *   - ordering_settings gets dine-in ON, delivery ON, takeaway OFF (the menu has always offered
 *     dine-in plus delivery, so switching delivery off here would silently stop delivery orders),
 *   - a phone field holding several numbers becomes up to 4 public contacts, first = primary,
 *   - a value that cannot be understood (a phone that is not a phone number, a mistyped social
 *     link) is kept OUT of the structured lists and stays in the legacy column, which this script
 *     never writes to; the public menu keeps showing the legacy value,
 *   - the display name and tagline follow what the public menu already shows (the appearance
 *     value wins over the legal business name).
 *
 * Safety properties:
 *   - dry-run is the default; nothing is written without `--apply`,
 *   - idempotent: only tenants without a row get one (`ON CONFLICT DO NOTHING`), nothing is
 *     overwritten, a second run changes nothing,
 *   - batched: a fixed number of reads (never one per tenant) and multi-row inserts, all in one
 *     transaction, so a failure leaves nothing half-written,
 *   - no deletes, no updates.
 *
 * Usage (from backend/):
 *   node backfill/001_profile_backfill.js            # dry run: prints the per-tenant diff, writes nothing
 *   node backfill/001_profile_backfill.js --apply    # writes
 */

import '../env.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool as sharedPool, connectDB } from '../db.js';
import { sanitizeText } from '../validation.js';
import { contactsFromLegacyPhone, linksFromLegacyClient } from '../legacyProfile.js';
import { buildRestaurantBlock, legacyOrderingSettings } from '../publicMenuPayload.js';

export const BATCH_SIZE = 100;

// Fields of the public `restaurant` block that the diff reports when they change. `contacts` and
// `links` are additive (they go from empty to filled) and are listed on their own line instead.
const ADDITIVE_FIELDS = new Set(['contacts', 'links']);

function cuisineTagsFrom(cuisine) {
  if (typeof cuisine !== 'string') return [];
  const tags = [];
  for (const part of cuisine.split(',')) {
    const tag = sanitizeText(part, 40);
    if (tag && !tags.includes(tag)) tags.push(tag);
  }
  return tags.slice(0, 8);
}

/**
 * Pure planning step: what would be created for one tenant, and how the public `restaurant`
 * block changes. No database access.
 *
 * @param {object} client raw `clients` row
 * @param {object} appearance raw `appearance_settings` row ({} when none)
 * @param {{profile:boolean, brand:boolean, ordering:boolean}} existing which rows already exist
 */
export function planTenant(client, appearance, existing) {
  const plan = { tenantId: client.id, name: client.business_name, profile: null, brand: null, ordering: null, notes: [], changes: [], additions: [] };

  if (!existing.profile) {
    const displayName = sanitizeText(appearance.restaurant_display_name || client.business_name || '', 80);
    if (!displayName) {
      plan.notes.push('no business name: profile skipped');
    } else {
      const { contacts, unparsed: phoneUnparsed } = contactsFromLegacyPhone(client.phone);
      const { links, unparsed: linkUnparsed } = linksFromLegacyClient(client);
      const flags = client.review_flags && typeof client.review_flags === 'object' && Object.keys(client.review_flags).length > 0
        ? client.review_flags
        : { phone_privacy_pending: true };

      plan.profile = {
        tenant_id: client.id,
        display_name: displayName,
        tagline: sanitizeText(appearance.tagline || client.tagline || '', 80),
        cuisine_tags: cuisineTagsFrom(client.cuisine),
        address: { line: sanitizeText(client.address || '', 300), area: '', city: sanitizeText(client.city || '', 60), state: sanitizeText(client.state || '', 60), pincode: '', landmark: '' },
        hours: { note: sanitizeText(client.opening_hours || '', 300), weekly: {}, exceptions: [], lastOrderMinutes: 0 },
        contacts,
        links,
        review_flags: flags,
      };

      if (phoneUnparsed.length > 0) {
        plan.notes.push(`phone not understood, left on the legacy column and still shown: ${phoneUnparsed.map((p) => JSON.stringify(p)).join(', ')}`);
      }
      for (const raw of linkUnparsed) plan.notes.push(`link not understood, left on the legacy column and still shown: ${raw}`);

      if (contacts.length > 0) plan.additions.push(`contacts: ${contacts.map((c) => `${c.number}${c.primary ? ' (primary)' : ''}`).join(', ')}`);
      if (links.length > 0) plan.additions.push(`links: ${links.map((l) => `${l.type}=${l.value}`).join(', ')}`);

      const before = buildRestaurantBlock({ client, appearance, profile: null });
      const after = buildRestaurantBlock({ client, appearance, profile: plan.profile });
      for (const key of Object.keys(after)) {
        if (ADDITIVE_FIELDS.has(key)) continue;
        if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
          plan.changes.push({ field: key, before: before[key], after: after[key] });
        }
      }
    }
  }

  if (!existing.brand) {
    const logoUrl = appearance.logo || client.logo_url || null;
    plan.brand = {
      tenant_id: client.id,
      // Only the URL is recorded. Aspect, badge and background are facts the logo pipeline will
      // measure from the pixels; guessing them here would be inventing data.
      logo: logoUrl ? { mediaUrl: logoUrl } : {},
      palette: appearance.accent_configuration && typeof appearance.accent_configuration === 'object' && appearance.accent_configuration.palette
        ? appearance.accent_configuration.palette
        : {},
    };
  }

  if (!existing.ordering) {
    const legacy = legacyOrderingSettings();
    plan.ordering = {
      tenant_id: client.id,
      dine_in_enabled: legacy.dineIn,
      takeaway_enabled: legacy.takeaway,
      delivery_enabled: legacy.delivery,
      accepting_orders: legacy.accepting,
    };
  }

  return plan;
}

const PROFILE_COLUMNS = [
  { name: 'tenant_id' },
  { name: 'display_name' },
  { name: 'tagline' },
  { name: 'cuisine_tags', cast: 'text[]' },
  { name: 'address', cast: 'jsonb', json: true },
  { name: 'hours', cast: 'jsonb', json: true },
  { name: 'contacts', cast: 'jsonb', json: true },
  { name: 'links', cast: 'jsonb', json: true },
  { name: 'review_flags', cast: 'jsonb', json: true },
  { name: 'version', raw: '1' },
  { name: 'updated_at', raw: 'NOW()' },
];
const BRAND_COLUMNS = [
  { name: 'tenant_id' },
  { name: 'logo', cast: 'jsonb', json: true },
  { name: 'palette', cast: 'jsonb', json: true },
  { name: 'colour_mood', raw: "'default'" },
  { name: 'version', raw: '1' },
  { name: 'updated_at', raw: 'NOW()' },
];
const ORDERING_COLUMNS = [
  { name: 'tenant_id' },
  { name: 'dine_in_enabled' },
  { name: 'takeaway_enabled' },
  { name: 'delivery_enabled' },
  { name: 'accepting_orders' },
];

async function insertInChunks(conn, table, columns, rows) {
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const params = [];
    const tuples = rows.slice(i, i + BATCH_SIZE).map((row) => {
      const cells = columns.map((col) => {
        if (col.raw !== undefined) return col.raw;
        params.push(col.json ? JSON.stringify(row[col.name]) : row[col.name]);
        return `$${params.length}${col.cast ? `::${col.cast}` : ''}`;
      });
      return `(${cells.join(', ')})`;
    });
    const result = await conn.query(
      `INSERT INTO ${table} (${columns.map((c) => c.name).join(', ')}) VALUES ${tuples.join(', ')} ON CONFLICT (tenant_id) DO NOTHING`,
      params
    );
    inserted += result.rowCount ?? 0;
  }
  return inserted;
}

function show(value) {
  return JSON.stringify(value === undefined ? null : value);
}

export function formatPlan(plan) {
  const lines = [`tenant ${plan.tenantId}  ${show(plan.name)}`];
  if (plan.profile) {
    lines.push(`  + restaurant_profiles: ${plan.additions.length > 0 ? plan.additions.join(' | ') : 'no contacts, no links'}`);
    for (const change of plan.changes) {
      lines.push(`    visible change: ${change.field}  ${show(change.before)} -> ${show(change.after)}`);
    }
  }
  if (plan.ordering) lines.push('  + ordering_settings: dine-in on, takeaway off, delivery ON, accepting on (keeps today\'s behaviour)');
  if (plan.brand) lines.push(`  + brand_kits: logo ${Object.keys(plan.brand.logo).length > 0 ? 'recorded' : 'none'}`);
  for (const note of plan.notes) lines.push(`    note: ${note}`);
  return lines.join('\n');
}

/**
 * @param {{ dryRun?: boolean, pool?: object, log?: (line:string)=>void }} [options]
 *   `dryRun` defaults to TRUE: writing needs an explicit `dryRun: false`.
 */
export async function runBackfill(options = {}) {
  const dryRun = options.dryRun !== false;
  const log = options.log || ((line) => console.log(line));
  const db = options.pool || sharedPool || (await connectDB(process.env.DATABASE_URL));

  log(`Profile backfill (${dryRun ? 'DRY RUN: nothing will be written' : 'APPLY: writing'})`);

  // A fixed number of reads, independent of the number of tenants.
  const [clientsRes, profilesRes, brandsRes, orderingRes, appearanceRes] = await Promise.all([
    db.query('SELECT * FROM clients ORDER BY id'),
    db.query('SELECT tenant_id FROM restaurant_profiles'),
    db.query('SELECT tenant_id FROM brand_kits'),
    db.query('SELECT tenant_id FROM ordering_settings'),
    db.query('SELECT tenant_id, logo, cover_image, restaurant_display_name, tagline, accent_configuration FROM appearance_settings'),
  ]);
  const hasProfile = new Set(profilesRes.rows.map((r) => r.tenant_id));
  const hasBrand = new Set(brandsRes.rows.map((r) => r.tenant_id));
  const hasOrdering = new Set(orderingRes.rows.map((r) => r.tenant_id));
  const appearanceByTenant = new Map(appearanceRes.rows.map((r) => [r.tenant_id, r]));

  const plans = [];
  for (const client of clientsRes.rows) {
    const plan = planTenant(client, appearanceByTenant.get(client.id) || {}, {
      profile: hasProfile.has(client.id),
      brand: hasBrand.has(client.id),
      ordering: hasOrdering.has(client.id),
    });
    if (plan.profile || plan.brand || plan.ordering || plan.notes.length > 0) plans.push(plan);
  }

  for (const plan of plans) log(formatPlan(plan));

  const profileRows = plans.filter((p) => p.profile).map((p) => p.profile);
  const brandRows = plans.filter((p) => p.brand).map((p) => p.brand);
  const orderingRows = plans.filter((p) => p.ordering).map((p) => p.ordering);
  const summary = {
    dryRun,
    tenantsInspected: clientsRes.rows.length,
    profilesToCreate: profileRows.length,
    brandKitsToCreate: brandRows.length,
    orderingToCreate: orderingRows.length,
    profilesCreated: 0,
    brandKitsCreated: 0,
    orderingCreated: 0,
    plans,
  };

  if (!dryRun && (profileRows.length || brandRows.length || orderingRows.length)) {
    const conn = await db.connect();
    try {
      await conn.query('BEGIN');
      summary.profilesCreated = await insertInChunks(conn, 'restaurant_profiles', PROFILE_COLUMNS, profileRows);
      summary.brandKitsCreated = await insertInChunks(conn, 'brand_kits', BRAND_COLUMNS, brandRows);
      summary.orderingCreated = await insertInChunks(conn, 'ordering_settings', ORDERING_COLUMNS, orderingRows);
      await conn.query('COMMIT');
    } catch (err) {
      await conn.query('ROLLBACK');
      throw err;
    } finally {
      conn.release();
    }
  }

  log(
    `Summary: ${summary.tenantsInspected} tenant(s) inspected; profiles ${summary.profilesToCreate}, brand kits ${summary.brandKitsToCreate}, ` +
      `ordering settings ${summary.orderingToCreate} ${dryRun ? 'would be created (dry run, nothing written)' : `planned; created ${summary.profilesCreated}/${summary.brandKitsCreated}/${summary.orderingCreated}`}`
  );
  return summary;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has('--dry-run') || !args.has('--apply');
  try {
    await connectDB(process.env.DATABASE_URL);
    await runBackfill({ dryRun });
    process.exit(0);
  } catch (err) {
    console.error('Backfill failed:', err.message);
    process.exit(1);
  }
}
