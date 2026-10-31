/**
 * MENUQR — Profile Service (Single Source of Truth)
 *
 * Implements §3, §8.1 of the Platform Blueprint:
 * - Reads & writes the canonical `restaurant_profiles` table.
 * - Dual-writes to legacy `clients` columns for uninterrupted backwards compatibility.
 * - Enforces server-authoritative validation & sanitisation.
 * - Tracks versioning, audit logging, and cache invalidation.
 * - Computes profile completeness (0-100 score).
 */

import { pool, queryPortable } from './db.js';
import { apiError } from './utils.js';
import { invalidatePublicMenuCache } from './routes/public.js';
import {
  sanitizeText,
  validateWeeklyHours,
  validateContacts,
  validateLinks,
  validatePincode,
  validateFSSAI,
  normalizeMapsUrl,
} from './validation.js';

/**
 * Computes profile completeness score (0-100) per §3.6.
 */
export function calculateProfileCompleteness(profile, menuStats = {}) {
  let score = 0;

  // 1. Contacts (15 pts) - at least one verified/public contact
  const hasPublicContact = Array.isArray(profile.contacts) && profile.contacts.some((c) => c.public && c.number);
  if (hasPublicContact) score += 15;

  // 2. Address & Maps (15 pts)
  const hasAddress = profile.address?.line && profile.address?.city;
  const hasMaps = profile.maps?.url;
  if (hasAddress && hasMaps) score += 15;
  else if (hasAddress || hasMaps) score += 8;

  // 3. Opening hours (15 pts)
  const hasWeeklyHours = profile.hours?.weekly && Object.values(profile.hours.weekly).some((d) => !d.closed && d.shifts?.length > 0);
  if (hasWeeklyHours) score += 15;

  // 4. Instagram / Social links (10 pts)
  const hasInstagram = Array.isArray(profile.links) && profile.links.some((l) => l.type === 'instagram' && !l.paused);
  if (hasInstagram) score += 10;

  // 5. Cuisine + Diet declaration (10 pts)
  const cuisineList = profile.cuisineTags || profile.cuisine_tags;
  const dietDecl = profile.dietDeclaration || profile.diet_declaration;
  const estYear = profile.establishedYear || profile.established_year;
  const hasCuisine = Array.isArray(cuisineList) && cuisineList.length > 0;
  const hasDiet = Boolean(dietDecl);
  if (hasCuisine && hasDiet) score += 10;
  else if (hasCuisine || hasDiet) score += 5;

  // 6. 3+ Dish photos (10 pts)
  if ((menuStats.dishPhotosCount || 0) >= 3) score += 10;

  // 7. Story or established year (5 pts)
  if (profile.story || estYear) score += 5;

  // 8. Payments or Highlights (5 pts)
  const hasHighlights = Array.isArray(profile.highlights) && profile.highlights.length > 0;
  const hasPayments = Array.isArray(profile.payments) && profile.payments.length > 0;
  if (hasHighlights || hasPayments) score += 5;

  // 9. FSSAI (5 pts)
  if (profile.fssai) score += 5;

  // 10. Menu descriptions for 50%+ of dishes (10 pts)
  if (menuStats.itemsWithDescriptionsPercent >= 50) score += 10;

  return Math.min(100, score);
}

/**
 * Fetches the canonical profile for a tenant.
 * Falls back transparently to legacy `clients` row if migration is pending.
 */
export async function getRestaurantProfile(tenantId) {
  const profileRes = await queryPortable(
    pool,
    'SELECT * FROM restaurant_profiles WHERE tenant_id = ?',
    [tenantId]
  );

  if (profileRes.rows.length > 0) {
    const row = profileRes.rows[0];
    return {
      displayName: row.display_name,
      tagline: row.tagline || '',
      story: row.story || '',
      establishedYear: row.established_year,
      restaurantTypes: row.restaurant_types || [],
      cuisineTags: row.cuisine_tags || [],
      dietDeclaration: row.diet_declaration || null,
      highlights: row.highlights || [],
      payments: row.payments || [],
      priceNote: row.price_note || '',
      serviceChargeNote: row.service_charge_note || '',
      fssai: row.fssai || '',
      address: row.address || {},
      maps: row.maps || {},
      hours: row.hours || {},
      contacts: row.contacts || [],
      links: row.links || [],
      reservations: row.reservations || {},
      i18n: row.i18n || {},
      reviewFlags: row.review_flags || {},
      version: row.version,
      updatedAt: row.updated_at,
    };
  }

  // Fallback to clients table
  const clientRes = await queryPortable(
    pool,
    'SELECT * FROM clients WHERE id = ?',
    [tenantId]
  );
  const c = clientRes.rows[0];
  if (!c) throw apiError(404, 'Restaurant profile not found.');

  return {
    displayName: c.business_name || '',
    tagline: c.tagline || '',
    story: '',
    establishedYear: null,
    restaurantTypes: [c.business_type || 'restaurant'],
    cuisineTags: c.cuisine ? c.cuisine.split(',').map((s) => s.trim()).filter(Boolean) : [],
    dietDeclaration: null,
    highlights: [],
    payments: [],
    priceNote: '',
    serviceChargeNote: '',
    fssai: '',
    address: {
      line: c.address || '',
      city: c.city || '',
      state: c.state || '',
      pincode: '',
      landmark: '',
    },
    maps: {},
    hours: { note: c.opening_hours || '', weekly: {} },
    contacts: c.phone ? [{ id: 'legacy', label: 'Primary', kind: 'mobile', number: c.phone, public: true, whatsapp: true, primary: true }] : [],
    links: [
      c.instagram && { type: 'instagram', value: c.instagram, placements: { cover: true, about: true, print: true } },
      c.facebook && { type: 'facebook', value: c.facebook, placements: { cover: false, about: true, print: true } },
      c.website && { type: 'website', value: c.website, placements: { cover: false, about: true, print: true } },
    ].filter(Boolean),
    reservations: {},
    i18n: {},
    reviewFlags: c.review_flags || {},
    version: 1,
    updatedAt: c.updated_at,
  };
}

/**
 * Updates restaurant profile with atomic dual-write to legacy clients columns.
 */
export async function updateRestaurantProfile(tenantId, updates, updatedBy = 'owner', expectedVersion = null) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch current profile or create initial record
    const existingRes = await client.query(
      'SELECT * FROM restaurant_profiles WHERE tenant_id = $1 FOR UPDATE',
      [tenantId]
    );

    let current = existingRes.rows[0];
    if (current && expectedVersion !== null && current.version !== expectedVersion) {
      throw apiError(409, 'Conflict: Profile was updated by another device. Please reload.');
    }

    if (!current) {
      // First-time initialization from clients table
      const cRes = await client.query('SELECT * FROM clients WHERE id = $1', [tenantId]);
      const c = cRes.rows[0] || {};
      const initRes = await client.query(
        `INSERT INTO restaurant_profiles (
          tenant_id, display_name, tagline, cuisine_tags, address, hours, contacts, links, review_flags, version
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 1) RETURNING *`,
        [
          tenantId,
          c.business_name || 'Restaurant',
          c.tagline || '',
          c.cuisine ? c.cuisine.split(',').map((s) => s.trim()).filter(Boolean) : [],
          JSON.stringify({ line: c.address || '', city: c.city || '', state: c.state || '' }),
          JSON.stringify({ note: c.opening_hours || '', weekly: {} }),
          JSON.stringify(c.phone ? [{ id: 'c1', label: 'Main', kind: 'mobile', number: c.phone, public: true, whatsapp: true, primary: true }] : []),
          JSON.stringify([
            c.instagram && { type: 'instagram', value: c.instagram, placements: { cover: true, about: true, print: true } },
            c.facebook && { type: 'facebook', value: c.facebook, placements: { cover: false, about: true, print: true } },
            c.website && { type: 'website', value: c.website, placements: { cover: false, about: true, print: true } },
          ].filter(Boolean)),
          c.review_flags || {},
        ]
      );
      current = initRes.rows[0];
    }

    // 2. Prepare validated changes
    const newVersion = (current.version || 1) + 1;
    const p = { ...current };

    if (updates.displayName !== undefined) {
      p.display_name = sanitizeText(updates.displayName, 80);
      if (!p.display_name) throw apiError(400, 'Display name is required.');
    }
    if (updates.tagline !== undefined) p.tagline = sanitizeText(updates.tagline, 80);
    if (updates.story !== undefined) p.story = sanitizeText(updates.story, 600);
    if (updates.establishedYear !== undefined) {
      const yr = Number(updates.establishedYear);
      p.established_year = (yr >= 1900 && yr <= 2100) ? yr : null;
    }
    if (updates.cuisineTags !== undefined && Array.isArray(updates.cuisineTags)) {
      p.cuisine_tags = updates.cuisineTags.slice(0, 5).map((t) => sanitizeText(t, 24)).filter(Boolean);
    }
    if (updates.dietDeclaration !== undefined) {
      p.diet_declaration = ['PURE_VEG', 'VEG_AND_NON_VEG'].includes(updates.dietDeclaration) ? updates.dietDeclaration : null;
    }
    if (updates.highlights !== undefined && Array.isArray(updates.highlights)) {
      p.highlights = updates.highlights.slice(0, 12).map((h) => sanitizeText(h, 40));
    }
    if (updates.payments !== undefined && Array.isArray(updates.payments)) {
      p.payments = updates.payments.slice(0, 8).map((pay) => sanitizeText(pay, 30));
    }
    if (updates.priceNote !== undefined) p.price_note = sanitizeText(updates.priceNote, 50);
    if (updates.serviceChargeNote !== undefined) p.service_charge_note = sanitizeText(updates.serviceChargeNote, 80);
    if (updates.fssai !== undefined) {
      p.fssai = validateFSSAI(updates.fssai) ? String(updates.fssai).trim() : null;
    }

    if (updates.address !== undefined && typeof updates.address === 'object') {
      const existingAddr = typeof p.address === 'string' ? JSON.parse(p.address || '{}') : (p.address || {});
      const addr = {
        line: sanitizeText(updates.address.line ?? existingAddr.line, 120),
        area: sanitizeText(updates.address.area ?? existingAddr.area, 80),
        city: sanitizeText(updates.address.city ?? existingAddr.city, 60),
        state: sanitizeText(updates.address.state ?? existingAddr.state, 60),
        pincode: validatePincode(updates.address.pincode) ? String(updates.address.pincode).trim() : (existingAddr.pincode || ''),
        landmark: sanitizeText(updates.address.landmark ?? existingAddr.landmark, 80),
      };
      p.address = addr;
    }

    if (updates.maps !== undefined) {
      if (typeof updates.maps === 'string') {
        p.maps = normalizeMapsUrl(updates.maps) || { url: updates.maps };
      } else if (typeof updates.maps === 'object') {
        p.maps = normalizeMapsUrl(updates.maps.url) || updates.maps;
      }
    }

    if (updates.hours !== undefined) {
      p.hours = validateWeeklyHours(updates.hours);
    }

    if (updates.contacts !== undefined) {
      p.contacts = validateContacts(updates.contacts);
    }

    if (updates.links !== undefined) {
      p.links = validateLinks(updates.links);
    }

    if (updates.reservations !== undefined && typeof updates.reservations === 'object') {
      p.reservations = {
        mode: ['none', 'call', 'whatsapp', 'link'].includes(updates.reservations.mode) ? updates.reservations.mode : 'none',
        url: sanitizeText(updates.reservations.url || '', 2048),
      };
    }

    if (updates.i18n !== undefined && typeof updates.i18n === 'object') {
      p.i18n = {
        hi: {
          name: sanitizeText(updates.i18n.hi?.name || '', 80),
          tagline: sanitizeText(updates.i18n.hi?.tagline || '', 80),
          story: sanitizeText(updates.i18n.hi?.story || '', 600),
        },
      };
    }

    if (updates.reviewFlags !== undefined && typeof updates.reviewFlags === 'object') {
      const existingFlags = typeof p.review_flags === 'string' ? JSON.parse(p.review_flags || '{}') : (p.review_flags || {});
      p.review_flags = { ...existingFlags, ...updates.reviewFlags };
    }

    // 3. Update canonical restaurant_profiles row
    await client.query(
      `UPDATE restaurant_profiles SET
        display_name = $1, tagline = $2, story = $3, established_year = $4,
        cuisine_tags = $5, diet_declaration = $6, highlights = $7, payments = $8,
        price_note = $9, service_charge_note = $10, fssai = $11, address = $12,
        maps = $13, hours = $14, contacts = $15, links = $16, reservations = $17,
        i18n = $18, review_flags = $19, version = $20, updated_at = NOW(), updated_by = $21
       WHERE tenant_id = $22`,
      [
        p.display_name,
        p.tagline,
        p.story,
        p.established_year,
        p.cuisine_tags,
        p.diet_declaration,
        p.highlights,
        p.payments,
        p.price_note,
        p.service_charge_note,
        p.fssai,
        JSON.stringify(p.address),
        JSON.stringify(p.maps),
        JSON.stringify(p.hours),
        JSON.stringify(p.contacts),
        JSON.stringify(p.links),
        JSON.stringify(p.reservations),
        JSON.stringify(p.i18n),
        JSON.stringify(p.review_flags),
        newVersion,
        updatedBy,
        tenantId,
      ]
    );

    // 4. Dual-write to legacy clients row for backward compatibility
    const primaryContact = Array.isArray(p.contacts) ? p.contacts.find((c) => c.primary && c.public) : null;
    const igLink = Array.isArray(p.links) ? p.links.find((l) => l.type === 'instagram') : null;
    const fbLink = Array.isArray(p.links) ? p.links.find((l) => l.type === 'facebook') : null;
    const webLink = Array.isArray(p.links) ? p.links.find((l) => l.type === 'website') : null;

    const legacyUpdates = {
      tagline: p.tagline,
      cuisine: p.cuisine_tags?.join(', '),
      address: p.address?.line,
      city: p.address?.city,
      state: p.address?.state,
      instagram: igLink?.value || null,
      facebook: fbLink?.value || null,
      website: webLink?.value || null,
    };

    if (primaryContact?.number) {
      legacyUpdates.phone = primaryContact.number;
    }

    const legacyFields = Object.keys(legacyUpdates).filter((k) => legacyUpdates[k] !== undefined);
    if (legacyFields.length > 0) {
      const setClause = legacyFields.map((f, i) => `"${f}" = $${i + 1}`).join(', ');
      const values = [...legacyFields.map((f) => legacyUpdates[f]), tenantId];
      await client.query(`UPDATE clients SET ${setClause}, updated_at = NOW() WHERE id = $${values.length}`, values);
    }

    // 5. Activity log entry
    await client.query(
      `INSERT INTO activity_logs (tenant_id, action, description, metadata)
       VALUES ($1, 'PROFILE_UPDATE', $2, $3)`,
      [tenantId, `Updated profile version ${newVersion}`, JSON.stringify({ fields: Object.keys(updates), updatedBy })]
    );

    await client.query('COMMIT');
    invalidatePublicMenuCache(tenantId);

    return {
      success: true,
      version: newVersion,
      profile: await getRestaurantProfile(tenantId),
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
