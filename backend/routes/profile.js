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
import { randomUUID } from 'node:crypto';

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
      // Update brand_kits table
      const brandUpdates = {};
      if (input.colourMood !== undefined) brandUpdates.colour_mood = input.colourMood;
      if (input.palette !== undefined) brandUpdates.palette = input.palette;
      if (input.logo !== undefined) brandUpdates.logo = input.logo;
      if (input.coverMediaId !== undefined) brandUpdates.cover_media_id = input.coverMediaId;

      await pool.query(
        `INSERT INTO brand_kits (tenant_id, colour_mood, palette, logo, cover_media_id, version, updated_at)
         VALUES ($1, $2, $3, $4, $5, 1, NOW())
         ON CONFLICT (tenant_id) DO UPDATE SET
           colour_mood = COALESCE(EXCLUDED.colour_mood, brand_kits.colour_mood),
           palette = COALESCE(EXCLUDED.palette, brand_kits.palette),
           logo = COALESCE(EXCLUDED.logo, brand_kits.logo),
           cover_media_id = COALESCE(EXCLUDED.cover_media_id, brand_kits.cover_media_id),
           version = brand_kits.version + 1,
           updated_at = NOW()`,
        [
          tenantId,
          brandUpdates.colour_mood || 'default',
          JSON.stringify(brandUpdates.palette || {}),
          JSON.stringify(brandUpdates.logo || {}),
          brandUpdates.cover_media_id || null,
        ]
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
    const action = input.action; // 'keep' | 'edit' | 'hide'

    const currentProfile = await getRestaurantProfile(tenantId);
    let updatedContacts = [...(currentProfile.contacts || [])];

    if (action === 'hide') {
      // Make all numbers non-public
      updatedContacts = updatedContacts.map((c) => ({ ...c, public: false }));
    } else if (action === 'edit' && input.newPhone) {
      // Update primary phone
      if (updatedContacts.length > 0) {
        updatedContacts[0] = { ...updatedContacts[0], number: input.newPhone, public: true };
      } else {
        updatedContacts.push({
          id: 'p1',
          label: 'Primary',
          kind: 'mobile',
          number: input.newPhone,
          public: true,
          whatsapp: true,
          primary: true,
        });
      }
    } else if (action === 'keep') {
      // Keep verified and active
      if (updatedContacts.length > 0) {
        updatedContacts[0].public = true;
      }
    }

    // Clear the phone_privacy_pending review flag
    const res = await updateRestaurantProfile(
      tenantId,
      {
        contacts: updatedContacts,
        reviewFlags: { phone_privacy_pending: false },
      },
      user.email || 'owner'
    );

    sendJson(response, 200, { success: true, profile: res.profile });
    return true;
  }

  // ── 4. Ordering Settings: GET & PATCH /api/app/ordering-settings ──────────
  if (url.pathname === '/api/app/ordering-settings') {
    if (request.method === 'GET') {
      const res = await pool.query('SELECT * FROM ordering_settings WHERE tenant_id = $1', [tenantId]);
      if (res.rows.length === 0) {
        sendJson(response, 200, {
          dineInEnabled: true,
          takeawayEnabled: false,
          deliveryEnabled: false,
          acceptingOrders: true,
          autoByHours: false,
          deliveryMinOrder: 0,
          deliveryFee: 0,
          deliveryAreaNote: '',
          payNotes: ['Pay at counter'],
        });
        return true;
      }
      const r = res.rows[0];
      sendJson(response, 200, {
        dineInEnabled: r.dine_in_enabled,
        takeawayEnabled: r.takeaway_enabled,
        deliveryEnabled: r.delivery_enabled,
        acceptingOrders: r.accepting_orders,
        autoByHours: r.auto_by_hours,
        deliveryMinOrder: Number(r.delivery_min_order || 0),
        deliveryFee: Number(r.delivery_fee || 0),
        deliveryAreaNote: r.delivery_area_note || '',
        payNotes: r.pay_notes || [],
      });
      return true;
    }

    if (request.method === 'PATCH') {
      const input = await readJson(request);
      await pool.query(
        `INSERT INTO ordering_settings (
          tenant_id, dine_in_enabled, takeaway_enabled, delivery_enabled, accepting_orders,
          auto_by_hours, delivery_min_order, delivery_fee, delivery_area_note, pay_notes, version, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 1, NOW())
        ON CONFLICT (tenant_id) DO UPDATE SET
          dine_in_enabled = COALESCE($2, ordering_settings.dine_in_enabled),
          takeaway_enabled = COALESCE($3, ordering_settings.takeaway_enabled),
          delivery_enabled = COALESCE($4, ordering_settings.delivery_enabled),
          accepting_orders = COALESCE($5, ordering_settings.accepting_orders),
          auto_by_hours = COALESCE($6, ordering_settings.auto_by_hours),
          delivery_min_order = COALESCE($7, ordering_settings.delivery_min_order),
          delivery_fee = COALESCE($8, ordering_settings.delivery_fee),
          delivery_area_note = COALESCE($9, ordering_settings.delivery_area_note),
          pay_notes = COALESCE($10, ordering_settings.pay_notes),
          version = ordering_settings.version + 1,
          updated_at = NOW()`,
        [
          tenantId,
          input.dineInEnabled,
          input.takeawayEnabled,
          input.deliveryEnabled,
          input.acceptingOrders,
          input.autoByHours,
          input.deliveryMinOrder,
          input.deliveryFee,
          input.deliveryAreaNote,
          input.payNotes,
        ]
      );
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
      let id = randomUUID();
      if (input.id) {
        const check = await pool.query('SELECT id FROM restaurant_announcements WHERE id = $1 AND tenant_id = $2', [input.id, tenantId]);
        if (check.rows.length > 0) id = input.id;
      }
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
         RETURNING *`,
        [
          id,
          tenantId,
          input.text,
          input.linkType || 'none',
          input.linkTarget || null,
          input.startsAt || null,
          input.endsAt || null,
          input.isActive !== false,
          JSON.stringify(input.i18n || {}),
        ]
      );
      try { invalidatePublicMenuCache(tenantId); } catch (e) {}
      sendJson(response, 200, res.rows[0]);
      return true;
    }

    const delMatch = url.pathname.match(/^\/api\/app\/announcements\/([^/]+)$/);
    if (request.method === 'DELETE' && delMatch) {
      const id = decodeURIComponent(delMatch[1]);
      await pool.query('DELETE FROM restaurant_announcements WHERE id = $1 AND tenant_id = $2', [id, tenantId]);
      sendJson(response, 200, { success: true });
      return true;
    }
  }

  // ── 6. Offers: GET & POST & DELETE /api/app/offers ─────────────────────────
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
      const input = await readJson(request);
      const id = input.id || randomUUID();
      const res = await pool.query(
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
         RETURNING *`,
        [
          id,
          tenantId,
          input.title,
          input.details || '',
          input.priceText || '',
          JSON.stringify(input.schedule || {}),
          input.itemIds || [],
          input.mediaId || null,
          input.isActive !== false,
          JSON.stringify(input.i18n || {}),
        ]
      );
      sendJson(response, 200, res.rows[0]);
      return true;
    }

    const delMatch = url.pathname.match(/^\/api\/app\/offers\/([^/]+)$/);
    if (request.method === 'DELETE' && delMatch) {
      const id = decodeURIComponent(delMatch[1]);
      await pool.query('DELETE FROM restaurant_offers WHERE id = $1 AND tenant_id = $2', [id, tenantId]);
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
      // Bulk or single creation
      if (Array.isArray(input.tables)) {
        for (let i = 0; i < input.tables.length; i++) {
          const t = input.tables[i];
          const label = String(t.label || t).trim();
          if (label) {
            await pool.query(
              `INSERT INTO dining_tables (id, tenant_id, label, sort_order)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (tenant_id, label) DO UPDATE SET is_active = true, sort_order = EXCLUDED.sort_order`,
              [randomUUID(), tenantId, label, i]
            );
          }
        }
      } else if (input.label) {
        const label = String(input.label).trim();
        await pool.query(
          `INSERT INTO dining_tables (id, tenant_id, label, sort_order)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (tenant_id, label) DO UPDATE SET is_active = true`,
          [randomUUID(), tenantId, label, input.sortOrder || 0]
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

  // 8. Setup Progress: GET & PATCH /api/app/setup-progress
  if (url.pathname === '/api/app/setup-progress') {
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
      } catch (err) {}
      sendJson(response, 200, {
        currentStep: 'S0',
        steps: { s0: false, s1: false, s2: false, s3: false, s4: false },
        completedAt: null
      });
      return true;
    }

    if (request.method === 'PATCH' || request.method === 'POST') {
      const input = await readJson(request);
      const currentStep = input.currentStep ? String(input.currentStep).toUpperCase() : 'S0';
      const steps = input.steps && typeof input.steps === 'object' ? input.steps : {};
      const completed = Boolean(input.completed);
      try {
        const res = await pool.query(
          `INSERT INTO setup_progress (tenant_id, current_step, steps, completed_at, updated_at)
           VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
           ON CONFLICT (tenant_id) DO UPDATE SET
             current_step = EXCLUDED.current_step,
             steps = setup_progress.steps || EXCLUDED.steps,
             completed_at = CASE WHEN EXCLUDED.completed_at IS NOT NULL THEN EXCLUDED.completed_at ELSE setup_progress.completed_at END,
             updated_at = CURRENT_TIMESTAMP
           RETURNING current_step as "currentStep", steps, completed_at as "completedAt"`,
          [tenantId, currentStep, JSON.stringify(steps), completed ? new Date() : null]
        );
        sendJson(response, 200, res.rows[0]);
        return true;
      } catch (err) {
        sendJson(response, 200, { currentStep, steps, completedAt: completed ? new Date().toISOString() : null });
        return true;
      }
    }
  }

  return false;
}
