import { invalidatePublicMenuCache } from './public.js';
/**
 * MENUQR — Profile, Marketing & Operations API Routes
 *
 * Implements §9.1 of the Platform Blueprint:
 * - GET /api/app/profile — returns profile + completeness score
 * - PATCH /api/app/profile/identity — restaurant name, tagline, story, cuisine, diet
 * - PATCH /api/app/profile/brand — brand mood, palette, logo metadata
 * - PATCH /api/app/profile/location-hours — structured address, maps link, hours
 * - PATCH /api/app/profile/contact-social — phone list, social links, reservations
 * - PATCH /api/app/profile/photos-story — gallery items, cover, chef picks
 * - PATCH /api/app/profile/highlights-legal — highlights, payments, FSSAI, tax note
 * - POST /api/app/profile/review-flags/respond — "Keep / Edit / Hide" phone prompt response
 * - GET & PATCH /api/app/ordering-settings — dine-in, takeaway, delivery, auto_by_hours
 * - GET & POST & DELETE /api/app/announcements — single active banner or scheduled announcement
 * - GET & POST & DELETE /api/app/offers — scheduled promotional offers
 * - GET & POST & DELETE /api/app/tables — dining tables for table QR ordering
 */

import { pool, queryPortable } from '../db.js';
import { apiError, sendJson, readJson } from '../utils.js';
import {
  getRestaurantProfile,
  updateRestaurantProfile,
  calculateProfileCompleteness,
} from '../profileService.js';
import { orderingSettingsFromRow } from '../publicMenuPayload.js';
import { contactsFromLegacyPhone } from '../legacyProfile.js';
import { requireEntitlement } from '../authorization.js';
import { activeOfferLimit, validateAnnouncementInput, validateOfferInput } from '../offers.js';
import { sanitizeText } from '../validation.js';
import { randomUUID } from 'node:crypto';

const SETUP_STEPS = ['S0', 'S1', 'S2', 'S3', 'S4'];
const TABLE_LABEL_MAX = 50;
const TABLE_MAX = 200;

export async function handleProfileRoutes(request, response, url, user, authorization) {
  const tenantId = user.tenantId;

  // ── 1. GET /api/app/profile ──────────────────────────────────────────────
  if (request.method === 'GET' && url.pathname === '/api/app/profile') {
    const profile = await getRestaurantProfile(tenantId);

    // Fetch menu stats for completeness calculation
    const itemsRes = await queryPortable(
      pool,
      'SELECT COUNT(*) as total, COUNT(image_url) as with_image, COUNT(description) as with_desc FROM menu_items WHERE tenant_id = ?',
      [tenantId]
    );
    const totalItems = Number(itemsRes.rows[0]?.total || 0);
    const withDesc = Number(itemsRes.rows[0]?.with_desc || 0);
    const withImg = Number(itemsRes.rows[0]?.with_image || 0);

    const completeness = calculateProfileCompleteness(profile, {
      dishPhotosCount: withImg,
      itemsWithDescriptionsPercent: totalItems > 0 ? (withDesc / totalItems) * 100 : 0,
    });

    sendJson(response, 200, {
      profile,
      completeness,
      plan: authorization.planId,
    });
    return true;
  }

  // ── 2. PATCH /api/app/profile/:section ───────────────────────────────────
  const sectionMatch = url.pathname.match(/^\/api\/app\/profile\/(identity|brand|location-hours|contact-social|photos-story|highlights-legal)$/);
  if (request.method === 'PATCH' && sectionMatch) {
    const section = sectionMatch[1];
    const input = await readJson(request);
    const expectedVersion = input.version !== undefined ? Number(input.version) : null;

    let updates = {};
    if (section === 'identity') {
      updates = {
        displayName: input.displayName,
        tagline: input.tagline,
        story: input.story,
        establishedYear: input.establishedYear,
        cuisineTags: input.cuisineTags,
        dietDeclaration: input.dietDeclaration,
        i18n: input.i18n,
      };
    } else if (section === 'location-hours') {
      updates = {
        address: input.address,
        maps: input.maps,
        hours: input.hours,
      };
    } else if (section === 'contact-social') {
      updates = {
        contacts: input.contacts,
        links: input.links,
        reservations: input.reservations,
      };
    } else if (section === 'photos-story') {
      updates = {
        story: input.story,
        photos: input.photos,
      };
    } else if (section === 'highlights-legal') {
      updates = {
        highlights: input.highlights,
        payments: input.payments,
        priceNote: input.priceNote,
        serviceChargeNote: input.serviceChargeNote,
        fssai: input.fssai,
      };
    } else if (section === 'brand') {
      // Update brand_kits. A field that was not sent is passed as NULL so COALESCE keeps the stored
      // value: saving the colour mood alone must not wipe the logo or the palette.
      const asJson = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? JSON.stringify(value) : null);
      const colourMood = input.colourMood === undefined ? null : (sanitizeText(String(input.colourMood ?? ''), 30) || null);
      const coverMediaId = input.coverMediaId ? String(input.coverMediaId).slice(0, 255) : null;

      await pool.query(
        `INSERT INTO brand_kits (tenant_id, colour_mood, palette, logo, cover_media_id, version, updated_at)
         VALUES ($1, COALESCE($2::varchar, 'default'), COALESCE($3::jsonb, '{}'::jsonb), COALESCE($4::jsonb, '{}'::jsonb), $5::varchar, 1, NOW())
         ON CONFLICT (tenant_id) DO UPDATE SET
           colour_mood = COALESCE($2::varchar, brand_kits.colour_mood),
           palette = COALESCE($3::jsonb, brand_kits.palette),
           logo = COALESCE($4::jsonb, brand_kits.logo),
           cover_media_id = COALESCE($5::varchar, brand_kits.cover_media_id),
           version = brand_kits.version + 1,
           updated_at = NOW()`,
        [tenantId, colourMood, asJson(input.palette), asJson(input.logo), coverMediaId]
      );
      sendJson(response, 200, { success: true });
      return true;
    }

    const res = await updateRestaurantProfile(tenantId, updates, user.email || 'owner', expectedVersion);
    sendJson(response, 200, res);
    return true;
  }

  // ── 3. POST /api/app/profile/review-flags/respond ────────────────────────
  // Responds to the "Keep / Edit / Hide" phone privacy prompt
  if (request.method === 'POST' && url.pathname === '/api/app/profile/review-flags/respond') {
    const input = await readJson(request);
    const action = String(input.action || ''); // 'keep' | 'edit' | 'hide'
    if (!['keep', 'edit', 'hide'].includes(action)) {
      throw apiError(400, 'Choose keep, edit or hide.');
    }

    const currentProfile = await getRestaurantProfile(tenantId);
    let updatedContacts = [...(currentProfile.contacts || [])];

    if (action === 'hide') {
      // Make all numbers non-public. `phone_hidden` below records the choice even when the
      // contact list is empty, so the legacy number is not shown again through the fallback.
      updatedContacts = updatedContacts.map((c) => ({ ...c, public: false }));
    } else if (action === 'edit') {
      const { contacts: parsed } = contactsFromLegacyPhone(input.newPhone);
      if (parsed.length === 0) {
        throw apiError(400, 'Enter a 10-digit mobile number starting with 6, 7, 8 or 9.');
      }
      if (updatedContacts.length > 0) {
        updatedContacts[0] = { ...updatedContacts[0], number: parsed[0].number, public: true };
      } else {
        updatedContacts = parsed;
      }
    } else if (updatedContacts.length > 0) {
      // keep: the number stays public (an unparseable legacy number simply stays on the fallback)
      updatedContacts[0] = { ...updatedContacts[0], public: true };
    }

    // Clear the phone_privacy_pending prompt and record whether the owner chose to hide the phone.
    const res = await updateRestaurantProfile(
      tenantId,
      {
        contacts: updatedContacts,
        reviewFlags: { phone_privacy_pending: false, phone_hidden: action === 'hide' },
      },
      user.email || 'owner'
    );

    sendJson(response, 200, { success: true, profile: res.profile });
    return true;
  }

  // ── 4. Ordering Settings: GET & PATCH /api/app/ordering-settings ──────────
  if (url.pathname === '/api/app/ordering-settings') {
    if (request.method === 'GET') {
      // No row means the legacy state (dine-in and delivery on): the same state the public menu
      // and the order endpoint use, so the console never shows a switch the diners do not see.
      const res = await pool.query('SELECT * FROM ordering_settings WHERE tenant_id = $1', [tenantId]);
      const s = orderingSettingsFromRow(res.rows[0]);
      sendJson(response, 200, {
        dineInEnabled: s.dineIn,
        takeawayEnabled: s.takeaway,
        deliveryEnabled: s.delivery,
        acceptingOrders: s.accepting,
        autoByHours: s.autoByHours,
        deliveryMinOrder: s.deliveryMinOrder,
        deliveryFee: s.deliveryFee,
        deliveryAreaNote: s.deliveryAreaNote,
        payNotes: s.payNotes,
      });
      return true;
    }

    if (request.method === 'PATCH') {
      const input = await readJson(request);
      const flag = (value, name) => {
        if (value === undefined || value === null) return null;
        if (typeof value !== 'boolean') throw apiError(400, `${name} must be true or false.`);
        return value;
      };
      const amount = (value, name) => {
        if (value === undefined || value === null || value === '') return null;
        const n = Number(value);
        if (!Number.isFinite(n) || n < 0 || n > 100000) throw apiError(400, `${name} must be a number between 0 and 100000.`);
        return n;
      };
      const payNotes = Array.isArray(input.payNotes)
        ? input.payNotes.slice(0, 6).map((n) => sanitizeText(n, 60)).filter(Boolean)
        : null;
      // A first save writes a row. Fields the owner did not send start from the legacy state
      // (dine-in and delivery on), so saving one switch never silently turns the others off.
      await pool.query(
        `INSERT INTO ordering_settings (
          tenant_id, dine_in_enabled, takeaway_enabled, delivery_enabled, accepting_orders,
          auto_by_hours, delivery_min_order, delivery_fee, delivery_area_note, pay_notes, version, updated_at
        ) VALUES ($1, COALESCE($2::boolean, true), COALESCE($3::boolean, false), COALESCE($4::boolean, true),
                  COALESCE($5::boolean, true), COALESCE($6::boolean, false), COALESCE($7::numeric, 0),
                  COALESCE($8::numeric, 0), $9::text, COALESCE($10::text[], ARRAY['Pay at counter']), 1, NOW())
        ON CONFLICT (tenant_id) DO UPDATE SET
          dine_in_enabled = COALESCE($2::boolean, ordering_settings.dine_in_enabled),
          takeaway_enabled = COALESCE($3::boolean, ordering_settings.takeaway_enabled),
          delivery_enabled = COALESCE($4::boolean, ordering_settings.delivery_enabled),
          accepting_orders = COALESCE($5::boolean, ordering_settings.accepting_orders),
          auto_by_hours = COALESCE($6::boolean, ordering_settings.auto_by_hours),
          delivery_min_order = COALESCE($7::numeric, ordering_settings.delivery_min_order),
          delivery_fee = COALESCE($8::numeric, ordering_settings.delivery_fee),
          delivery_area_note = COALESCE($9::text, ordering_settings.delivery_area_note),
          pay_notes = COALESCE($10::text[], ordering_settings.pay_notes),
          version = ordering_settings.version + 1,
          updated_at = NOW()`,
        [
          tenantId,
          flag(input.dineInEnabled, 'dineInEnabled'),
          flag(input.takeawayEnabled, 'takeawayEnabled'),
          flag(input.deliveryEnabled, 'deliveryEnabled'),
          flag(input.acceptingOrders, 'acceptingOrders'),
          flag(input.autoByHours, 'autoByHours'),
          amount(input.deliveryMinOrder, 'deliveryMinOrder'),
          amount(input.deliveryFee, 'deliveryFee'),
          input.deliveryAreaNote === undefined || input.deliveryAreaNote === null ? null : sanitizeText(String(input.deliveryAreaNote), 120),
          payNotes,
        ]
      );
      // The switches are part of the public payload, so the cached copy must go.
      await invalidatePublicMenuCache(tenantId);
      sendJson(response, 200, { success: true });
      return true;
    }
  }

  // ── 5. Announcements: GET & POST & DELETE /api/app/announcements ──────────
  if (url.pathname.startsWith('/api/app/announcements')) {
    if (request.method === 'GET') {
      const res = await pool.query(
        'SELECT * FROM restaurant_announcements WHERE tenant_id = $1 ORDER BY created_at DESC',
        [tenantId]
      );
      sendJson(response, 200, res.rows);
      return true;
    }

    if (request.method === 'POST') {
      const input = await readJson(request);
      const clean = validateAnnouncementInput(input);
      // Only an id this tenant owns is reused (an update); any other id gets a fresh one.
      let id = randomUUID();
      if (input.id) {
        const check = await pool.query('SELECT id FROM restaurant_announcements WHERE id = $1 AND tenant_id = $2', [String(input.id), tenantId]);
        if (check.rows.length > 0) id = check.rows[0].id;
      }
      // The WHERE on DO UPDATE is a second lock: even if an id from another tenant ever got
      // here, the conflicting row would be left alone.
      const res = await pool.query(
        `INSERT INTO restaurant_announcements (id, tenant_id, text, link_type, link_target, starts_at, ends_at, is_active, i18n)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
           text = EXCLUDED.text,
           link_type = EXCLUDED.link_type,
           link_target = EXCLUDED.link_target,
           starts_at = EXCLUDED.starts_at,
           ends_at = EXCLUDED.ends_at,
           is_active = EXCLUDED.is_active,
           i18n = EXCLUDED.i18n,
           updated_at = NOW()
         WHERE restaurant_announcements.tenant_id = EXCLUDED.tenant_id
         RETURNING *`,
        [id, tenantId, clean.text, clean.linkType, clean.linkTarget, clean.startsAt, clean.endsAt, clean.isActive, JSON.stringify(clean.i18n)]
      );
      if (res.rows.length === 0) throw apiError(404, 'Announcement not found.');
      await invalidatePublicMenuCache(tenantId);
      sendJson(response, 200, res.rows[0]);
      return true;
    }

    const delMatch = url.pathname.match(/^\/api\/app\/announcements\/([^/]+)$/);
    if (request.method === 'DELETE' && delMatch) {
      const id = decodeURIComponent(delMatch[1]);
      await pool.query('DELETE FROM restaurant_announcements WHERE id = $1 AND tenant_id = $2', [id, tenantId]);
      await invalidatePublicMenuCache(tenantId);
      sendJson(response, 200, { success: true });
      return true;
    }
  }

  // ── 6. Offers: GET & POST & DELETE /api/app/offers ─────────────────────────
  // Offer ids are public (the menu payload lists them), so an id in a request body is never
  // trusted: it is only used when this tenant owns it, and the upsert itself refuses to touch a
  // row that belongs to another tenant.
  if (url.pathname.startsWith('/api/app/offers')) {
    if (request.method === 'GET') {
      const res = await pool.query(
        'SELECT * FROM restaurant_offers WHERE tenant_id = $1 ORDER BY created_at DESC',
        [tenantId]
      );
      sendJson(response, 200, res.rows);
      return true;
    }

    if (request.method === 'POST') {
      requireEntitlement(authorization, 'digital_menu');
      const input = await readJson(request);
      const clean = validateOfferInput(input);

      const tx = await pool.connect();
      let saved;
      try {
        await tx.query('BEGIN');
        // One writer per tenant at a time, so the active-offer count below cannot be raced.
        await tx.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`offers:${tenantId}`]);

        let id = randomUUID();
        if (input.id !== undefined && input.id !== null && input.id !== '') {
          const owned = await tx.query('SELECT id FROM restaurant_offers WHERE id = $1 AND tenant_id = $2', [String(input.id), tenantId]);
          if (owned.rows.length === 0) throw apiError(404, 'Offer not found.');
          id = owned.rows[0].id;
        }

        if (clean.itemIds.length > 0) {
          const items = await tx.query('SELECT id FROM menu_items WHERE tenant_id = $1 AND id = ANY($2::text[])', [tenantId, clean.itemIds]);
          if (items.rows.length !== clean.itemIds.length) {
            throw apiError(400, 'One or more of the selected dishes are not on your menu.');
          }
        }
        if (clean.mediaId) {
          const media = await tx.query('SELECT id FROM menu_media WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL', [clean.mediaId, tenantId]);
          if (media.rows.length === 0) throw apiError(400, 'That photo is not in your library.');
        }

        if (clean.isActive) {
          const limit = activeOfferLimit(authorization.planId);
          const active = await tx.query(
            'SELECT count(*)::int AS n FROM restaurant_offers WHERE tenant_id = $1 AND is_active = true AND id <> $2',
            [tenantId, id]
          );
          if (Number(active.rows[0]?.n || 0) >= limit) {
            throw apiError(403, `Your ${authorization.planId} plan allows ${limit} active offer${limit === 1 ? '' : 's'}. Switch one off or upgrade your plan to add another.`);
          }
        }

        const res = await tx.query(
          `INSERT INTO restaurant_offers (id, tenant_id, title, details, price_text, schedule, item_ids, media_id, is_active, i18n)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO UPDATE SET
             title = EXCLUDED.title,
             details = EXCLUDED.details,
             price_text = EXCLUDED.price_text,
             schedule = EXCLUDED.schedule,
             item_ids = EXCLUDED.item_ids,
             media_id = EXCLUDED.media_id,
             is_active = EXCLUDED.is_active,
             i18n = EXCLUDED.i18n,
             updated_at = NOW()
           WHERE restaurant_offers.tenant_id = EXCLUDED.tenant_id
           RETURNING *`,
          [id, tenantId, clean.title, clean.details, clean.priceText, JSON.stringify(clean.schedule), clean.itemIds, clean.mediaId, clean.isActive, JSON.stringify(clean.i18n)]
        );
        if (res.rows.length === 0) throw apiError(404, 'Offer not found.');
        saved = res.rows[0];
        await tx.query('COMMIT');
      } catch (err) {
        await tx.query('ROLLBACK');
        throw err;
      } finally {
        tx.release();
      }

      await invalidatePublicMenuCache(tenantId);
      sendJson(response, 200, saved);
      return true;
    }

    const delMatch = url.pathname.match(/^\/api\/app\/offers\/([^/]+)$/);
    if (request.method === 'DELETE' && delMatch) {
      const id = decodeURIComponent(delMatch[1]);
      await pool.query('DELETE FROM restaurant_offers WHERE id = $1 AND tenant_id = $2', [id, tenantId]);
      await invalidatePublicMenuCache(tenantId);
      sendJson(response, 200, { success: true });
      return true;
    }
  }

  // ── 7. Dining Tables: GET & POST & DELETE /api/app/tables ─────────────────
  if (url.pathname.startsWith('/api/app/tables')) {
    if (request.method === 'GET') {
      const res = await pool.query(
        'SELECT * FROM dining_tables WHERE tenant_id = $1 ORDER BY sort_order ASC, label ASC',
        [tenantId]
      );
      sendJson(response, 200, res.rows);
      return true;
    }

    if (request.method === 'POST') {
      const input = await readJson(request);
      const toLabel = (entry) => {
        const raw = entry && typeof entry === 'object' ? entry.label : entry;
        return typeof raw === 'string' || typeof raw === 'number' ? sanitizeText(String(raw), TABLE_LABEL_MAX) : '';
      };
      // Bulk or single creation. Ids are always generated here, never taken from the request, and
      // every statement is keyed by (tenant_id, label), so one tenant can never touch another's tables.
      const labels = Array.isArray(input.tables)
        ? input.tables.map(toLabel).filter(Boolean)
        : [toLabel(input.label)].filter(Boolean);
      if (labels.length > TABLE_MAX) throw apiError(400, `You can save up to ${TABLE_MAX} tables.`);
      const sortOrder = Number.isInteger(input.sortOrder) && input.sortOrder >= 0 && input.sortOrder <= 1000 ? input.sortOrder : 0;

      const existing = await pool.query('SELECT label FROM dining_tables WHERE tenant_id = $1', [tenantId]);
      const known = new Set(existing.rows.map((r) => r.label));
      const total = known.size + labels.filter((l) => !known.has(l)).length;
      if (total > TABLE_MAX) throw apiError(400, `You can save up to ${TABLE_MAX} tables.`);

      for (let i = 0; i < labels.length; i++) {
        await pool.query(
          `INSERT INTO dining_tables (id, tenant_id, label, sort_order)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (tenant_id, label) DO UPDATE SET is_active = true, sort_order = EXCLUDED.sort_order, updated_at = NOW()`,
          [randomUUID(), tenantId, labels[i], Array.isArray(input.tables) ? i : sortOrder]
        );
      }
      sendJson(response, 200, { success: true });
      return true;
    }

    const delMatch = url.pathname.match(/^\/api\/app\/tables\/([^/]+)$/);
    if (request.method === 'DELETE' && delMatch) {
      const id = decodeURIComponent(delMatch[1]);
      await pool.query('DELETE FROM dining_tables WHERE id = $1 AND tenant_id = $2', [id, tenantId]);
      sendJson(response, 200, { success: true });
      return true;
    }
  }

  // 8. Setup Progress: GET & PATCH /api/app/setup-progress (always the session tenant's own row)
  if (url.pathname === '/api/app/setup-progress') {
    const UNMIGRATED = '42P01'; // undefined_table: the only failure that falls back to the default
    if (request.method === 'GET') {
      try {
        const res = await pool.query(
          'SELECT current_step as "currentStep", steps, completed_at as "completedAt" FROM setup_progress WHERE tenant_id = $1',
          [tenantId]
        );
        if (res.rows[0]) {
          sendJson(response, 200, res.rows[0]);
          return true;
        }
      } catch (err) {
        if (err.code !== UNMIGRATED) throw err;
      }
      sendJson(response, 200, {
        currentStep: 'S0',
        steps: { s0: false, s1: false, s2: false, s3: false, s4: false },
        completedAt: null
      });
      return true;
    }

    if (request.method === 'PATCH' || request.method === 'POST') {
      const input = await readJson(request);
      let currentStep = null;
      if (input.currentStep !== undefined && input.currentStep !== null && input.currentStep !== '') {
        currentStep = String(input.currentStep).toUpperCase();
        if (!SETUP_STEPS.includes(currentStep)) throw apiError(400, 'Setup step must be S0, S1, S2, S3 or S4.');
      }
      const steps = {};
      if (input.steps && typeof input.steps === 'object' && !Array.isArray(input.steps)) {
        for (const key of SETUP_STEPS.map((s) => s.toLowerCase())) {
          if (input.steps[key] !== undefined) {
            if (typeof input.steps[key] !== 'boolean') throw apiError(400, `Setup step ${key} must be true or false.`);
            steps[key] = input.steps[key];
          }
        }
      }
      const completed = input.completed === true;
      try {
        const res = await pool.query(
          `INSERT INTO setup_progress (tenant_id, current_step, steps, completed_at, updated_at)
           VALUES ($1, COALESCE($2::varchar, 'S0'), $3::jsonb, $4, CURRENT_TIMESTAMP)
           ON CONFLICT (tenant_id) DO UPDATE SET
             current_step = COALESCE($2::varchar, setup_progress.current_step),
             steps = setup_progress.steps || EXCLUDED.steps,
             completed_at = CASE WHEN EXCLUDED.completed_at IS NOT NULL THEN EXCLUDED.completed_at ELSE setup_progress.completed_at END,
             updated_at = CURRENT_TIMESTAMP
           RETURNING current_step as "currentStep", steps, completed_at as "completedAt"`,
          [tenantId, currentStep, JSON.stringify(steps), completed ? new Date() : null]
        );
        sendJson(response, 200, res.rows[0]);
        return true;
      } catch (err) {
        if (err.code !== UNMIGRATED) throw err;
        sendJson(response, 200, { currentStep: currentStep || 'S0', steps, completedAt: completed ? new Date().toISOString() : null });
        return true;
      }
    }
  }

  return false;
}
