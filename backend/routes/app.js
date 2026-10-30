import { pool, queryPortable } from '../db.js';
import { istDateString } from '../istTime.js';
import { getTenantAnalytics, ALLOWED_RANGES } from '../analytics.js';
import { getFeedbackSummary } from '../feedback.js';
import { validateSchedule } from '../schedule.js';
import { enforceTenant } from '../auth.js';
import { apiError, sendJson, readJson } from '../utils.js';
import { randomUUID } from 'node:crypto';
import { resolveTenantAuthorization, requireEntitlement, withContentChange, getContentUsage } from '../authorization.js';
import { detectColumnMappings, validateAndPreviewImport, executeImportTransaction } from '../menuImporter.js';
import { resolveDishImage } from '../culinaryImageService.js';
import { invalidatePublicMenuCache } from './public.js';
import { extractMenuFromPdf, refinePdfDesign } from '../pdfMenuService.js';
import { validateDesignSpecification } from '../designSpecValidator.js';
import { coerceTheme, validateTheme } from '../themeValidator.js';
import { registerOrderClient, broadcastOrderEvent } from '../orderStream.js';
import { optimizeAndSaveImage } from '../imageOptimizer.js';
import { enqueueTask, getJobStatus, TASK_TYPES } from '../taskQueue.js';
import { synthesizeVoiceGreeting, saveTenantVoiceGreeting } from '../welcomeVoice.js';
import { inputMenuFeatures } from '../menuFeatures.js';

function inputText(value, maxLength = 255) {
  if (value === undefined || value === null) return '';
  return String(value).trim().slice(0, maxLength);
}

/**
 * Normalises an owner-set photo focal point to 0-1 coordinates, or null when absent/invalid.
 * Stored inside `menu_items.metadata` (an existing, previously-unused JSONB column) rather than
 * a dedicated column — no migration needed to add this field.
 */
export function inputFocalPoint(value) {
  if (!value || typeof value !== 'object') return null;
  const x = Number(value.x);
  const y = Number(value.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return { x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y)) };
}

/** Merges a focal point into an item's existing metadata without discarding other fields. */
export function mergeItemMetadata(existingMetadata, focal) {
  const base = existingMetadata && typeof existingMetadata === 'object' ? existingMetadata : {};
  if (focal === null) {
    const { focal: _omit, ...rest } = base;
    return rest;
  }
  return { ...base, focal };
}

export const ITEM_ALLERGENS = ['nuts', 'peanuts', 'dairy', 'gluten', 'soy', 'egg', 'fish', 'shellfish', 'sesame'];
export const ITEM_BADGES = ['bestseller', 'special', 'new'];

/**
 * Normalises owner-set dish tags to a fixed, whitelisted shape (or null when nothing is set).
 * Stored in `menu_items.metadata.tags`; every value is checked against an enum so free text
 * can never reach the public menu.
 */
export function inputItemTags(value) {
  if (!value || typeof value !== 'object') return null;
  const allergens = Array.isArray(value.allergens)
    ? [...new Set(value.allergens.map((a) => String(a).toLowerCase()).filter((a) => ITEM_ALLERGENS.includes(a)))]
    : [];
  const badges = Array.isArray(value.badges)
    ? [...new Set(value.badges.map((b) => String(b).toLowerCase()).filter((b) => ITEM_BADGES.includes(b)))]
    : [];
  const spice = Math.min(3, Math.max(0, Math.trunc(Number(value.spice)) || 0));
  const jain = value.jain === true;
  const eggless = value.eggless === true;
  if (!allergens.length && !badges.length && !spice && !jain && !eggless) return null;
  return { allergens, badges, spice, jain, eggless };
}

/** Merges (or clears, when `tags` is null) dish tags without discarding other metadata fields. */
export function mergeItemTags(existingMetadata, tags) {
  const base = existingMetadata && typeof existingMetadata === 'object' ? existingMetadata : {};
  if (tags === null) {
    const { tags: _omit, ...rest } = base;
    return rest;
  }
  return { ...base, tags };
}

/** Sets (IST date string) or clears (null) the "sold out today" marker, keeping other metadata. */
export function mergeItemSoldOut(existingMetadata, istDate) {
  const base = existingMetadata && typeof existingMetadata === 'object' ? existingMetadata : {};
  if (istDate === null) {
    const { soldOutOn: _omit, ...rest } = base;
    return rest;
  }
  return { ...base, soldOutOn: istDate };
}

/** One extra language to start (Hindi) — a free-form keyed object, so more languages can be
 * added later without a schema change. Each language's name/description is capped the same as
 * the item's own `name`/`description` fields. */
const TRANSLATION_LANGUAGES = ['hi'];

export function inputItemTranslations(value) {
  if (!value || typeof value !== 'object') return null;
  const result = {};
  for (const lang of TRANSLATION_LANGUAGES) {
    const entry = value[lang];
    if (!entry || typeof entry !== 'object') continue;
    const name = inputText(entry.name, 255);
    const description = inputText(entry.description, 2000);
    if (name || description) result[lang] = { ...(name ? { name } : {}), ...(description ? { description } : {}) };
  }
  return Object.keys(result).length ? result : null;
}

/** Merges (or clears, when `translations` is null) owner-entered dish translations. */
export function mergeItemTranslations(existingMetadata, translations) {
  const base = existingMetadata && typeof existingMetadata === 'object' ? existingMetadata : {};
  if (translations === null) {
    const { translations: _omit, ...rest } = base;
    return rest;
  }
  return { ...base, translations };
}

function requireBasicContentAccess(authorization) {
  if (authorization.planId === 'BASIC') {
    requireEntitlement(authorization, 'one_time_edit', 'Your subscription does not allow menu changes right now.');
  }
}

export function isValidGoogleReviewUrl(urlString) {
  if (typeof urlString !== 'string') return false;
  const trimmed = urlString.trim();
  if (!trimmed || trimmed.length > 1000) return false;

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return false;
  }

  // Enforce HTTPS
  if (parsed.protocol !== 'https:') return false;

  // Reject embedded username/password
  if (parsed.username || parsed.password) return false;

  const hostname = parsed.hostname.toLowerCase();

  const isExactHost = [
    'search.google.com',
    'g.page',
    'maps.google.com',
    'goo.gl',
    'maps.app.goo.gl',
    'google.com',
    'www.google.com',
  ].includes(hostname);

  const isGoogleSubdomain =
    hostname.endsWith('.google.com') ||
    hostname.endsWith('.google.co.in') ||
    hostname.endsWith('.g.page');

  if (!isExactHost && !isGoogleSubdomain) {
    return false;
  }

  return true;
}

export default async function appRoutes(request, response, url) {
  if (!url.pathname.startsWith('/api/app/')) return false;
  
  const user = await enforceTenant(request);
  const authorization = await resolveTenantAuthorization(user);

  // Background Job Status Polling
  const jobStatusMatch = url.pathname.match(/^\/api\/app\/jobs\/([^/]+)$/);
  if (request.method === 'GET' && jobStatusMatch) {
    const jobId = decodeURIComponent(jobStatusMatch[1]);
    const job = getJobStatus(jobId, user.tenantId);
    if (!job) throw apiError(404, 'Job not found.');
    sendJson(response, 200, job);
    return true;
  }

  // Image Upload & Sharp WebP Optimization Pipeline
  if (request.method === 'POST' && url.pathname === '/api/app/upload-image') {
    const input = await readJson(request);
    if (!input || !input.image) {
      throw apiError(400, 'Image data is required (base64 string).');
    }
    const result = await optimizeAndSaveImage(
      input.image, 
      user.tenantId, 
      input.category || 'dishes',
      { maxWidth: input.maxWidth ? Number(input.maxWidth) : 1200, quality: 80 }
    );
    sendJson(response, 201, { success: true, ...result });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/app/onboarding/save') {
    requireEntitlement(authorization, 'initial_menu_setup');
    const input = await readJson(request);
    const businessName = inputText(input.businessName, 255);
    const menuName = inputText(input.menuName, 255) || 'Main Menu';
    const categories = input.categories;
    const items = input.items;
    if (!businessName || !Array.isArray(categories) || categories.length === 0 || categories.length > 50 || !Array.isArray(items) || items.length > 300) {
      throw apiError(400, 'Add your restaurant name, at least one menu category, and valid menu items.');
    }
    const normalizedCategories = categories.map((category) => ({
      name: inputText(category?.name, 100),
      description: inputText(category?.description, 500),
    }));
    if (normalizedCategories.some((category) => !category.name)) throw apiError(400, 'Every menu category needs a name.');
    const normalizedItems = items.map((item) => {
      const categoryIndex = Number(item?.categoryIndex);
      const halfPrice = item?.halfPrice != null && item?.halfPrice !== '' && Number.isFinite(Number(item.halfPrice)) ? Number(item.halfPrice) : null;
      const fullPrice = item?.fullPrice != null && item?.fullPrice !== '' && Number.isFinite(Number(item.fullPrice)) ? Number(item.fullPrice) : null;
      let price = Number(item?.price);
      if (!Number.isFinite(price) || price < 0) {
        price = fullPrice || halfPrice || 0;
      }
      if (!inputText(item?.name, 255) || !Number.isInteger(categoryIndex) || categoryIndex < 0 || categoryIndex >= normalizedCategories.length || price < 0 || price > 10000000) {
        throw apiError(400, 'Check each menu item name, category, and price.');
      }
      // Highlights set during onboarding live in the same `metadata` shape the item editor writes
      // (see the POST /api/app/items branch), so the public menu reads them through one code path.
      const focal = inputFocalPoint(
        Number.isFinite(Number(item?.focalX)) && Number.isFinite(Number(item?.focalY))
          ? { x: Number(item.focalX), y: Number(item.focalY) }
          : null
      );
      const tags = item?.isBestseller === true ? inputItemTags({ badges: ['bestseller'] }) : null;
      const metadata = { ...(focal ? { focal } : {}), ...(tags ? { tags } : {}) };

      return {
        categoryIndex,
        name: inputText(item.name, 255),
        description: inputText(item.description, 2000),
        price,
        halfPrice,
        fullPrice,
        imageUrl: inputText(item.imageUrl, 2048),
        dietType: ['veg', 'non-veg', 'vegan'].includes(String(item.dietType).toLowerCase()) ? String(item.dietType).toLowerCase() : 'veg',
        available: item.available !== false,
        metadata: Object.keys(metadata).length ? JSON.stringify(metadata) : null,
      };
    });

    const client = await pool.connect();
    let createdMenuId;
    try {
      await client.query('BEGIN');
      const current = await queryPortable(client, 'SELECT onboarding_state FROM users WHERE id = ? AND tenant_id = ? FOR UPDATE', [user.id, user.tenantId]);
      if (!current.rows[0]) throw apiError(404, 'Account setup could not be found.');
      if (String(current.rows[0].onboarding_state).toUpperCase() === 'COMPLETED') {
        const existingMenu = await queryPortable(client, 'SELECT id FROM menus WHERE tenant_id = ? ORDER BY created_at LIMIT 1', [user.tenantId]);
        if (existingMenu.rows[0]) {
          await client.query('COMMIT');
          sendJson(response, 200, { success: true, alreadySaved: true, menuId: existingMenu.rows[0].id });
          return true;
        }
      }

      await queryPortable(client,
        'UPDATE clients SET business_name = ?, tagline = ?, phone = ?, city = ?, address = ?, logo_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [businessName, inputText(input.tagline, 255) || null, inputText(input.phone, 50) || null, inputText(input.city, 255) || null, inputText(input.address, 2000) || null, inputText(input.logoUrl, 2048) || null, user.tenantId]
      );
      const existingMenu = await queryPortable(client, 'SELECT id FROM menus WHERE tenant_id = ? ORDER BY created_at LIMIT 1', [user.tenantId]);
      if (existingMenu.rows[0]) {
        createdMenuId = existingMenu.rows[0].id;
        await queryPortable(client, 'UPDATE menus SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND tenant_id = ?', [menuName, createdMenuId, user.tenantId]);
        await queryPortable(client, 'DELETE FROM menu_categories WHERE menu_id = ? AND tenant_id = ?', [createdMenuId, user.tenantId]);
      } else {
        createdMenuId = randomUUID();
        await queryPortable(client, "INSERT INTO menus (id, tenant_id, name) VALUES (?, ?, ?)", [createdMenuId, user.tenantId, menuName]);
      }

      const categoryIds = [];
      for (let index = 0; index < normalizedCategories.length; index += 1) {
        const category = normalizedCategories[index];
        const categoryId = randomUUID();
        categoryIds.push(categoryId);
        await queryPortable(client,
          'INSERT INTO menu_categories (id, menu_id, tenant_id, name, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
          [categoryId, createdMenuId, user.tenantId, category.name, category.description || null, index + 1]
        );
      }
      for (let index = 0; index < normalizedItems.length; index += 1) {
        const item = normalizedItems[index];
        await queryPortable(client,
          'INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, description, price, half_price, full_price, image_url, diet_type, is_available, sort_order, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [randomUUID(), createdMenuId, user.tenantId, categoryIds[item.categoryIndex], item.name, item.description || null, item.price, item.halfPrice, item.fullPrice, item.imageUrl || null, item.dietType, item.available, index + 1, item.metadata]
        );
      }

      if (input.templateId && authorization.entitlements.includes('templates')) {
        await queryPortable(client,
          'UPDATE appearance_settings SET template_id = ?, logo = ?, restaurant_display_name = ?, tagline = ?, updated_at = CURRENT_TIMESTAMP WHERE tenant_id = ?',
          [inputText(input.templateId, 100), inputText(input.logoUrl, 2048) || null, businessName, inputText(input.tagline, 255) || null, user.tenantId]
        );
      } else {
        await queryPortable(client,
          'UPDATE appearance_settings SET restaurant_display_name = ?, tagline = ?, updated_at = CURRENT_TIMESTAMP WHERE tenant_id = ?',
          [businessName, inputText(input.tagline, 255) || null, user.tenantId]
        );
      }
      await queryPortable(client, "UPDATE users SET onboarding_state = 'COMPLETED', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [user.id]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    invalidatePublicMenuCache(user.tenantId);
    sendJson(response, 200, { success: true, menuId: createdMenuId });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/app/onboarding/complete') {
    await queryPortable(pool, "UPDATE users SET onboarding_state = 'COMPLETED' WHERE id = ? AND tenant_id = ?", [user.id, user.tenantId]);
    sendJson(response, 200, { success: true });
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/app/profile') {
    const res = await pool.query(`
      SELECT u.email, u.role, c.business_name as "businessName", c.menu_slug as "menuSlug", c.status, c.tagline, c.phone, c.city, c.state, c.address, c.logo_url as "logoUrl", c.cuisine, c.opening_hours as "openingHours", c.instagram, c.facebook, c.website, a.accent_configuration as "accentConfiguration"
      FROM users u
      JOIN clients c ON u.tenant_id = c.id
      LEFT JOIN appearance_settings a ON a.tenant_id = c.id
      WHERE u.id = $1 AND c.id = $2
    `, [user.id, user.tenantId]);
    if (!res.rows[0]) throw apiError(404, 'Profile not found.');
    invalidatePublicMenuCache(user.tenantId);
    sendJson(response, 200, res.rows[0]);
    return true;
  }

  // ───────────────────────── AI Voice Greeting (Table Welcome Hostess) ─────────────────────────
  if (request.method === 'POST' && url.pathname === '/api/app/voice-greeting/preview') {
    const input = await readJson(request);
    const clientRes = await pool.query('SELECT business_name FROM clients WHERE id = $1', [user.tenantId]);
    const businessName = clientRes.rows[0]?.business_name || 'Our Restaurant';
    const { audioBuffer, text } = await synthesizeVoiceGreeting({
      businessName,
      messageStyle: input.messageStyle,
      customText: input.customText,
      voiceGender: input.voiceGender,
    });
    sendJson(response, 200, {
      audioBase64: `data:audio/wav;base64,${audioBuffer.toString('base64')}`,
      text,
    });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/app/voice-greeting') {
    const input = await readJson(request);
    const clientRes = await pool.query('SELECT business_name FROM clients WHERE id = $1', [user.tenantId]);
    const businessName = clientRes.rows[0]?.business_name || 'Our Restaurant';

    let voiceGreetingData = { enabled: Boolean(input.enabled) };

    if (input.enabled) {
      const res = await saveTenantVoiceGreeting({
        tenantId: user.tenantId,
        businessName,
        messageStyle: input.messageStyle,
        customText: input.customText,
        voiceGender: input.voiceGender,
      });
      voiceGreetingData = {
        enabled: true,
        audioUrl: res.audioUrl,
        text: res.text,
        messageStyle: res.messageStyle,
        voiceGender: res.voiceGender,
        customText: input.customText || '',
      };
    }

    const appRes = await pool.query('SELECT id, accent_configuration FROM appearance_settings WHERE tenant_id = $1', [user.tenantId]);
    let currentConfig = appRes.rows[0]?.accent_configuration || {};
    if (typeof currentConfig === 'string') {
      try { currentConfig = JSON.parse(currentConfig); } catch { currentConfig = {}; }
    }
    currentConfig.voiceGreeting = voiceGreetingData;

    if (appRes.rows[0]) {
      await pool.query(
        'UPDATE appearance_settings SET accent_configuration = $1, updated_at = NOW() WHERE tenant_id = $2',
        [currentConfig, user.tenantId]
      );
    } else {
      await pool.query(
        'INSERT INTO appearance_settings (id, tenant_id, accent_configuration) VALUES ($1, $2, $3)',
        [randomUUID(), user.tenantId, currentConfig]
      );
    }

    invalidatePublicMenuCache(user.tenantId);
    sendJson(response, 200, { success: true, voiceGreeting: voiceGreetingData });
    return true;
  }

  // One toggle panel for every optional customer-facing menu feature (Call Waiter — including
  // which of its request types are offered — WhatsApp chat, allergen/spice filters, Trending,
  // multi-language, the accessibility control). Follows the voice-greeting handler immediately
  // above: merge one new key into the tenant's existing `accent_configuration` JSONB, no migration.
  if (request.method === 'POST' && url.pathname === '/api/app/menu-features') {
    const input = await readJson(request);
    const menuFeatures = inputMenuFeatures(input);

    const appRes = await pool.query('SELECT id, accent_configuration FROM appearance_settings WHERE tenant_id = $1', [user.tenantId]);
    let currentConfig = appRes.rows[0]?.accent_configuration || {};
    if (typeof currentConfig === 'string') {
      try { currentConfig = JSON.parse(currentConfig); } catch { currentConfig = {}; }
    }
    currentConfig.menuFeatures = menuFeatures;

    if (appRes.rows[0]) {
      await pool.query(
        'UPDATE appearance_settings SET accent_configuration = $1, updated_at = NOW() WHERE tenant_id = $2',
        [currentConfig, user.tenantId]
      );
    } else {
      await pool.query(
        'INSERT INTO appearance_settings (id, tenant_id, accent_configuration) VALUES ($1, $2, $3)',
        [randomUUID(), user.tenantId, currentConfig]
      );
    }

    invalidatePublicMenuCache(user.tenantId);
    sendJson(response, 200, { success: true, menuFeatures });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/app/pdf/extract') {
    requireEntitlement(authorization, 'initial_menu_setup');
    const body = await readJson(request);
    const { pdfBase64, filename } = body || {};

    if (!pdfBase64 || typeof pdfBase64 !== 'string') {
      throw apiError(400, 'A valid base64-encoded PDF file is required.');
    }

    const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/i, '').trim();
    let buffer;
    try {
      buffer = Buffer.from(cleanBase64, 'base64');
    } catch {
      throw apiError(400, 'Invalid base64 payload.');
    }

    const cleanFilename = inputText(filename, 255) || 'Uploaded_Menu.pdf';
    try {
      const result = await extractMenuFromPdf({
        buffer,
        filename: cleanFilename,
        tenantId: user.tenantId,
      });

      const importId = randomUUID();
      const totalItems = result.categories?.reduce((acc, c) => acc + (c.items?.length || 0), 0) || 0;

      await pool.query(`
        INSERT INTO menu_imports (
          id, tenant_id, filename, import_type, status, categories_count, items_count, 
          page_count, is_scanned, draft_payload, design_specification
        ) VALUES ($1, $2, $3, 'pdf', 'DRAFT', $4, $5, $6, $7, $8, $9)
      `, [
        importId,
        user.tenantId,
        cleanFilename,
        result.categories?.length || 0,
        totalItems,
        result.pageCount || 1,
        Boolean(result.isScanned),
        JSON.stringify({ restaurant: result.restaurant, categories: result.categories }),
        JSON.stringify(result.designSpec)
      ]);

      sendJson(response, 200, {
        success: true,
        importId,
        pageCount: result.pageCount,
        isScanned: result.isScanned,
        restaurant: result.restaurant,
        candidateLogos: result.candidateLogos || [],
        categories: result.categories,
        designSpec: result.designSpec,
        warnings: result.warnings,
        provider: result.provider,
        model: result.model || null,
      });
      return true;
    } catch (err) {
      throw apiError(400, err.message || 'Failed to extract menu from PDF document.');
    }
  }

  if (request.method === 'POST' && url.pathname === '/api/app/pdf/refine-design') {
    requireEntitlement(authorization, 'initial_menu_setup');
    const body = await readJson(request);
    const { importId, prompt, currentSpec } = body || {};

    if (!currentSpec || typeof currentSpec !== 'object') {
      throw apiError(400, 'Current design specification is required.');
    }

    const validatedSpec = validateDesignSpecification(currentSpec);
    if (!validatedSpec) {
      throw apiError(400, 'Invalid current design specification.');
    }

    const result = await refinePdfDesign({
      previousSpec: validatedSpec,
      prompt: inputText(prompt, 2000),
      tenantId: user.tenantId,
    });

    if (importId && typeof importId === 'string') {
      await pool.query(
        'UPDATE menu_imports SET design_specification = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND tenant_id = $3',
        [JSON.stringify(result.spec), importId, user.tenantId]
      );
    }

    sendJson(response, 200, {
      success: true,
      spec: result.spec,
      provider: result.provider,
      model: result.model || null,
      warning: result.warning || null,
    });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/app/pdf/save-draft') {
    requireEntitlement(authorization, 'initial_menu_setup');
    const body = await readJson(request);
    const { importId, restaurant, categories, designSpec } = body || {};

    if (!importId || typeof importId !== 'string') {
      throw apiError(400, 'Import ID is required to save draft.');
    }

    const draftPayload = JSON.stringify({ restaurant, categories });
    const validatedSpec = designSpec ? validateDesignSpecification(designSpec) : null;

    const updateRes = await pool.query(`
      UPDATE menu_imports 
      SET draft_payload = $1, design_specification = $2, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $3 AND tenant_id = $4
    `, [
      draftPayload,
      validatedSpec ? JSON.stringify(validatedSpec) : null,
      importId,
      user.tenantId
    ]);

    if (updateRes.rowCount === 0) {
      throw apiError(404, 'Draft import not found.');
    }

    sendJson(response, 200, { success: true });
    return true;
  }

  if (request.method === 'GET' && url.pathname.startsWith('/api/app/pdf/draft/')) {
    requireEntitlement(authorization, 'initial_menu_setup');
    const importId = url.pathname.replace('/api/app/pdf/draft/', '').trim();
    if (!importId) throw apiError(400, 'Import ID is required.');

    const res = await pool.query(
      'SELECT id, filename, import_type as "importType", status, page_count as "pageCount", is_scanned as "isScanned", draft_payload as "draftPayload", design_specification as "designSpec", updated_at as "updatedAt" FROM menu_imports WHERE id = $1 AND tenant_id = $2',
      [importId, user.tenantId]
    );

    if (!res.rows[0]) throw apiError(404, 'Draft import not found.');
    const row = res.rows[0];
    const parsedDraft = row.draftPayload || {};

    sendJson(response, 200, {
      importId: row.id,
      filename: row.filename,
      status: row.status,
      pageCount: row.pageCount,
      isScanned: row.isScanned,
      restaurant: parsedDraft.restaurant || null,
      categories: parsedDraft.categories || [],
      designSpec: row.designSpec || null,
      updatedAt: row.updatedAt,
    });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/app/pdf/approve-and-publish') {
    requireEntitlement(authorization, 'initial_menu_setup');
    const body = await readJson(request);
    const { importId, restaurant: rawRestaurant, restaurantInfo, categories, designSpec: rawDesignSpec, designSpecification, approveContent, approveDesign } = body || {};
    const restaurant = rawRestaurant || restaurantInfo;
    const designSpec = rawDesignSpec || designSpecification;

    if (!Array.isArray(categories) || categories.length === 0) {
      throw apiError(400, 'At least one menu category with dishes is required.');
    }

    if (importId && typeof importId === 'string') {
      const checkRes = await pool.query(
        'SELECT id FROM menu_imports WHERE id = $1 AND tenant_id = $2',
        [importId, user.tenantId]
      );
      if (!checkRes.rows[0]) {
        throw apiError(404, 'Import record not found or does not belong to your account.');
      }
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let menuId;
      const menuRes = await client.query('SELECT id FROM menus WHERE tenant_id = $1 LIMIT 1', [user.tenantId]);
      if (menuRes.rows.length > 0) {
        menuId = menuRes.rows[0].id;
      } else {
        menuId = randomUUID();
        await client.query(
          'INSERT INTO menus (id, tenant_id, name, status, published_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)',
          [menuId, user.tenantId, restaurant?.name ? `${restaurant.name} Menu` : 'Main Menu', 'PUBLISHED']
        );
      }

      if (approveContent !== false) {
        await executeImportTransaction(client, user.tenantId, menuId, categories, 'update', 'reconstructed_menu.pdf');
      }

      const validatedSpec = designSpec ? validateDesignSpecification(designSpec) : null;
      if (approveDesign !== false && validatedSpec) {
        const settingId = randomUUID();
        await client.query(`
          INSERT INTO appearance_settings (id, tenant_id, template_id, accent_configuration, restaurant_display_name, tagline, logo)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (tenant_id)
          DO UPDATE SET
            template_id = COALESCE(EXCLUDED.template_id, appearance_settings.template_id),
            accent_configuration = EXCLUDED.accent_configuration,
            restaurant_display_name = COALESCE(EXCLUDED.restaurant_display_name, appearance_settings.restaurant_display_name),
            tagline = COALESCE(EXCLUDED.tagline, appearance_settings.tagline),
            logo = COALESCE(EXCLUDED.logo, appearance_settings.logo),
            updated_at = CURRENT_TIMESTAMP
        `, [
          settingId,
          user.tenantId,
          validatedSpec.themeId || 'bespoke-theme',
          JSON.stringify(validatedSpec),
          inputText(restaurant?.name, 255) || null,
          inputText(restaurant?.tagline, 255) || null,
          inputText(restaurant?.logo, 2000) || null,
        ]);
      }

      if (restaurant && typeof restaurant === 'object') {
        await client.query(`
          UPDATE clients
          SET 
            business_name = COALESCE($1, business_name),
            tagline = COALESCE($2, tagline),
            cuisine = COALESCE($3, cuisine),
            description = COALESCE($4, description),
            address = COALESCE($5, address),
            phone = COALESCE($6, phone),
            opening_hours = COALESCE($7, opening_hours),
            logo_url = COALESCE($8, logo_url),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $9
        `, [
          inputText(restaurant.name, 255) || null,
          inputText(restaurant.tagline, 255) || null,
          inputText(restaurant.cuisine, 255) || null,
          inputText(restaurant.description, 2000) || null,
          inputText(restaurant.address, 1000) || null,
          inputText(restaurant.phone, 50) || null,
          inputText(restaurant.openingHours, 255) || null,
          inputText(restaurant.logo, 2000) || null,
          user.tenantId
        ]);
      }

      if (importId && typeof importId === 'string') {
        await client.query(
          "UPDATE menu_imports SET status = 'PUBLISHED', updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND tenant_id = $2",
          [importId, user.tenantId]
        );
      }

      await client.query("UPDATE users SET onboarding_state = 'COMPLETED', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [user.id]);
      await client.query('COMMIT');

      invalidatePublicMenuCache(user.tenantId);

      const clientRes = await pool.query('SELECT menu_slug FROM clients WHERE id = $1', [user.tenantId]);
      const menuSlug = clientRes.rows[0]?.menu_slug || '';

      sendJson(response, 200, {
        success: true,
        menuId,
        menuSlug,
        publicUrl: `/m/${menuSlug}`,
      });
      return true;
    } catch (err) {
      await client.query('ROLLBACK');
      throw apiError(500, err.message || 'Failed to approve and publish reconstructed menu.');
    } finally {
      client.release();
    }
  }

  if (request.method === 'GET' && url.pathname === '/api/app/dashboard') {
    requireEntitlement(authorization, 'initial_menu_setup');
    const statsRes = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM menus WHERE tenant_id = $1) as total_menus,
        (SELECT COUNT(*) FROM menu_items WHERE tenant_id = $1 AND is_available = true) as active_items,
        (SELECT COUNT(*) FROM qr_codes WHERE tenant_id = $1 AND is_active = true) as active_qrs
    `, [user.tenantId]);
    sendJson(response, 200, { stats: statsRes.rows[0] });
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/app/subscription') {
    const subRes = await queryPortable(pool, `
      SELECT s.plan_id as "planId", s.status, s.started_at as "startedAt", s.expires_at as "expiresAt", COALESCE(s.content_period_start, s.started_at, s.created_at) as "periodStart",
        EXISTS (
          SELECT 1 FROM subscription_feature_usage u
          WHERE u.tenant_id = s.tenant_id AND u.feature_key = 'one_time_edit'
        ) as "menuEditUsed"
      FROM subscriptions s
      WHERE s.tenant_id = ?
    `, [user.tenantId]);
    const subscription = subRes.rows[0];
    const usage = await getContentUsage(user.tenantId, subscription?.periodStart, authorization.planId);
    sendJson(response, 200, subscription ? { ...subscription, contentChangesUsed: usage.used, contentChangesRemaining: usage.remaining, contentChangesLimit: usage.limit } : { status: 'none', contentChangesUsed: usage.used, contentChangesRemaining: usage.remaining, contentChangesLimit: usage.limit });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/app/subscription/renew') {
    throw apiError(400, 'Please use the checkout page to renew your subscription. Free renewals are not allowed.');
  }




  if (request.method === 'GET' && url.pathname === '/api/app/qr') {
    requireEntitlement(authorization, 'qr_code');
    const existingIdentity = await queryPortable(pool, 'SELECT qr_code_id FROM tenant_qr_identity WHERE tenant_id = ?', [user.tenantId]);
    if (!existingIdentity.rows[0]) {
      const legacyQr = await queryPortable(pool, 'SELECT id FROM qr_codes WHERE tenant_id = ? ORDER BY created_at LIMIT 1', [user.tenantId]);
      if (legacyQr.rows[0]) {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          await queryPortable(client, 'SELECT id FROM clients WHERE id = ? FOR UPDATE', [user.tenantId]);
          const concurrentIdentity = await queryPortable(client, 'SELECT qr_code_id FROM tenant_qr_identity WHERE tenant_id = ?', [user.tenantId]);
          if (!concurrentIdentity.rows[0]) {
            await queryPortable(client, 'INSERT INTO tenant_qr_identity (tenant_id, qr_code_id) VALUES (?, ?)', [user.tenantId, legacyQr.rows[0].id]);
          }
          await client.query('COMMIT');
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
      }
    }
    const qrRes = await queryPortable(pool, `
      SELECT q.public_id as "publicId", q.qr_id as "qrId", q.destination_type as "destinationType", q.is_active as "isActive",
        c.business_name as "restaurantName", c.phone, c.city, c.address, c.logo_url as "logoUrl",
        a.template_id as "templateId", a.accent_configuration as "accentConfiguration"
      FROM tenant_qr_identity identity_map
      JOIN qr_codes q ON q.id = identity_map.qr_code_id
      JOIN clients c ON c.id = identity_map.tenant_id
      LEFT JOIN appearance_settings a ON a.tenant_id = identity_map.tenant_id
      WHERE identity_map.tenant_id = ?
    `, [user.tenantId]);
    sendJson(response, 200, qrRes.rows[0] || null);
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/app/qr') {
    requireEntitlement(authorization, 'qr_code');
    const menu = await queryPortable(pool, 'SELECT id FROM menus WHERE tenant_id = ? LIMIT 1', [user.tenantId]);
    const owner = await queryPortable(pool, "SELECT onboarding_state FROM users WHERE id = ? AND tenant_id = ?", [user.id, user.tenantId]);
    if (!menu.rows[0]) {
      throw apiError(409, 'Save your restaurant and menu before creating its QR.');
    }

    const client = await pool.connect();
    let qr;
    let created = false;
    try {
      await client.query('BEGIN');
      const tenant = await queryPortable(client, 'SELECT id, public_id FROM clients WHERE id = ? FOR UPDATE', [user.tenantId]);
      if (!tenant.rows[0]) throw apiError(404, 'Restaurant could not be found.');
      let identity = await queryPortable(client, 'SELECT qr_code_id FROM tenant_qr_identity WHERE tenant_id = ?', [user.tenantId]);
      if (!identity.rows[0]) {
        const existing = await queryPortable(client, 'SELECT id FROM qr_codes WHERE tenant_id = ? ORDER BY created_at LIMIT 1', [user.tenantId]);
        const qrCodeId = existing.rows[0]?.id || randomUUID();
        if (!existing.rows[0]) {
          const qrId = randomUUID();
          await queryPortable(client, 'INSERT INTO qr_codes (id, tenant_id, public_id, qr_id) VALUES (?, ?, ?, ?)', [qrCodeId, user.tenantId, tenant.rows[0].public_id, qrId]);
          created = true;
        }
        await queryPortable(client, 'INSERT INTO tenant_qr_identity (tenant_id, qr_code_id) VALUES (?, ?)', [user.tenantId, qrCodeId]);
        identity = { rows: [{ qr_code_id: qrCodeId }] };
      }
      const qrResult = await queryPortable(client,
        'SELECT q.public_id as "publicId", q.qr_id as "qrId", q.destination_type as "destinationType", q.is_active as "isActive", c.business_name as "restaurantName", c.phone, c.city, c.address, c.logo_url as "logoUrl", a.template_id as "templateId", a.accent_configuration as "accentConfiguration" FROM qr_codes q JOIN clients c ON c.id = q.tenant_id LEFT JOIN appearance_settings a ON a.tenant_id = c.id WHERE q.id = ? AND q.tenant_id = ?',
        [identity.rows[0].qr_code_id, user.tenantId]
      );
      qr = qrResult.rows[0];
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    sendJson(response, 201, { ...qr, created });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/app/sticker-requests') {
    requireEntitlement(authorization, 'qr_code');
    const input = await readJson(request);
    const quantity = Number(input.quantity);
    const contactName = inputText(input.contactName, 255);
    const contactPhone = inputText(input.contactPhone, 50);
    const contactEmail = inputText(input.contactEmail, 255).toLowerCase();
    const deliveryAddress = inputText(input.deliveryAddress, 2000);
    const deliveryCity = inputText(input.deliveryCity, 255);
    const deliveryState = inputText(input.deliveryState, 255);
    const deliveryPostalCode = inputText(input.deliveryPostalCode, 50);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000 || !contactName || !contactPhone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail) || !deliveryAddress || !deliveryCity) {
      throw apiError(400, 'Check the sticker quantity and delivery/contact details.');
    }
    const qrIdentity = await queryPortable(pool,
      'SELECT q.id, q.qr_id as "qrId" FROM tenant_qr_identity identity_map JOIN qr_codes q ON q.id = identity_map.qr_code_id WHERE identity_map.tenant_id = ?',
      [user.tenantId]
    );
    if (!qrIdentity.rows[0]) throw apiError(409, 'Create your permanent QR before ordering stickers.');

    const requestId = randomUUID();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await queryPortable(client,
        'INSERT INTO sticker_requests (id, tenant_id, qr_code_id, quantity, contact_name, contact_phone, contact_email, delivery_address, delivery_city, delivery_state, delivery_postal_code, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, \'PENDING\')',
        [requestId, user.tenantId, qrIdentity.rows[0].id, quantity, contactName, contactPhone, contactEmail, deliveryAddress, deliveryCity, deliveryState || null, deliveryPostalCode || null, inputText(input.notes, 1000) || null]
      );
      await queryPortable(client,
        "INSERT INTO sticker_request_events (id, request_id, previous_status, new_status, changed_by, note) VALUES (?, ?, NULL, 'PENDING', ?, 'Request submitted')",
        [randomUUID(), requestId, user.id]
      );
      await queryPortable(client,
        'INSERT INTO notifications (id, tenant_id, message, is_read) VALUES (?, ?, ?, false)',
        [randomUUID(), user.tenantId, `Sticker request received: ${quantity} pieces for ${contactName}`]
      );
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    const created = await queryPortable(pool,
      'SELECT id, quantity, contact_name as "contactName", contact_phone as "contactPhone", contact_email as "contactEmail", delivery_address as "deliveryAddress", delivery_city as "deliveryCity", delivery_state as "deliveryState", delivery_postal_code as "deliveryPostalCode", notes, status, created_at as "createdAt", ? as "qrId" FROM sticker_requests WHERE id = ?',
      [qrIdentity.rows[0].qrId, requestId]
    );
    sendJson(response, 201, created.rows[0]);
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/app/sticker-requests') {
    const requests = await queryPortable(pool,
      'SELECT r.id, r.quantity, r.contact_name as "contactName", r.contact_phone as "contactPhone", r.contact_email as "contactEmail", r.delivery_address as "deliveryAddress", r.delivery_city as "deliveryCity", r.delivery_state as "deliveryState", r.delivery_postal_code as "deliveryPostalCode", r.notes, r.status, r.created_at as "createdAt", r.updated_at as "updatedAt", q.qr_id as "qrId" FROM sticker_requests r JOIN qr_codes q ON q.id = r.qr_code_id WHERE r.tenant_id = ? ORDER BY r.created_at DESC',
      [user.tenantId]
    );
    sendJson(response, 200, requests.rows);
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/app/appearance') {
    requireEntitlement(authorization, 'templates', 'Templates require an Intermediate or Premium plan.');
    const res = await pool.query(`
      SELECT template_id as "templateId", logo, cover_image as "coverImage", restaurant_display_name as "restaurantDisplayName", tagline, accent_configuration as "accentConfiguration"
      FROM appearance_settings
      WHERE tenant_id = $1
    `, [user.tenantId]);
    sendJson(response, 200, res.rows[0] || {});
    return true;
  }

  if (request.method === 'PUT' && url.pathname === '/api/app/appearance') {
    requireEntitlement(authorization, 'templates', 'Templates require an Intermediate or Premium plan.');
    const input = await readJson(request);
    const settingId = randomUUID();
    
    const res = await pool.query(`
      INSERT INTO appearance_settings (id, tenant_id, template_id, logo, cover_image, restaurant_display_name, tagline, accent_configuration)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (tenant_id) 
      DO UPDATE SET
        template_id = COALESCE(EXCLUDED.template_id, appearance_settings.template_id),
        logo = COALESCE(EXCLUDED.logo, appearance_settings.logo),
        cover_image = COALESCE(EXCLUDED.cover_image, appearance_settings.cover_image),
        restaurant_display_name = COALESCE(EXCLUDED.restaurant_display_name, appearance_settings.restaurant_display_name),
        tagline = COALESCE(EXCLUDED.tagline, appearance_settings.tagline),
        accent_configuration = EXCLUDED.accent_configuration,
        updated_at = CURRENT_TIMESTAMP
      RETURNING template_id as "templateId", logo, cover_image as "coverImage", restaurant_display_name as "restaurantDisplayName", tagline, accent_configuration as "accentConfiguration"
    `, [
      settingId,
      user.tenantId,
      input.templateId,
      input.logo || null,
      input.coverImage || null,
      input.restaurantDisplayName || null,
      input.tagline || null,
      input.accentConfiguration || null
    ]);
    
    if (input.logo) {
      await pool.query('UPDATE clients SET logo_url = $1 WHERE id = $2', [input.logo, user.tenantId]);
    }

    invalidatePublicMenuCache(user.tenantId);
    sendJson(response, 200, res.rows[0]);
    return true;
  }

  // ───────────────────────── Design Studio theme: draft / publish / rollback ─────────────────────────
  //
  // `theme_draft` is what the Studio edits live and autosaves to — accepted leniently via
  // coerceTheme, because an owner mid-edit should never see a 400 for a field they have not
  // finished changing. `theme_published` is what the public menu actually renders, written only
  // through /publish, which runs the STRICT validator and rejects a malformed document outright
  // rather than silently storing a coerced guess. `appearance_theme_history` keeps every
  // published version so /rollback can restore one without reconstructing it from memory.

  if (request.method === 'GET' && url.pathname === '/api/app/theme') {
    requireEntitlement(authorization, 'templates', 'Menu design requires an Intermediate or Premium plan.');
    const res = await pool.query(
      'SELECT theme_draft as "draft", theme_published as "published", theme_version as "version" FROM appearance_settings WHERE tenant_id = $1',
      [user.tenantId]
    );
    const row = res.rows[0] || {};
    sendJson(response, 200, {
      draft: row.draft || row.published || null,
      published: row.published || null,
      version: row.version || 0,
      // True once there is an edit the owner has not published yet, so the Studio can show
      // "unpublished changes" without the client re-deriving it from a deep-equal check.
      hasUnpublishedChanges: Boolean(row.draft) && JSON.stringify(row.draft) !== JSON.stringify(row.published),
    });
    return true;
  }

  if (request.method === 'PUT' && url.pathname === '/api/app/theme/draft') {
    requireEntitlement(authorization, 'templates', 'Menu design requires an Intermediate or Premium plan.');
    const input = await readJson(request);

    const existing = await pool.query('SELECT theme_published FROM appearance_settings WHERE tenant_id = $1', [user.tenantId]);
    const base = existing.rows[0]?.theme_published || undefined;
    const theme = coerceTheme(input, base);

    const settingId = randomUUID();
    const res = await pool.query(
      `INSERT INTO appearance_settings (id, tenant_id, theme_draft)
       VALUES ($1, $2, $3)
       ON CONFLICT (tenant_id) DO UPDATE SET theme_draft = EXCLUDED.theme_draft, updated_at = CURRENT_TIMESTAMP
       RETURNING theme_draft as "draft"`,
      [settingId, user.tenantId, JSON.stringify(theme)]
    );
    sendJson(response, 200, { draft: res.rows[0].draft });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/app/theme/publish') {
    requireEntitlement(authorization, 'templates', 'Menu design requires an Intermediate or Premium plan.');
    const input = await readJson(request);

    // Publishing an explicit body (the Studio's "Publish" button, mid-edit, before autosave
    // catches up) is supported; omitting it publishes whatever the last autosaved draft was.
    let candidate = input && Object.keys(input).length > 0 ? input : null;
    if (!candidate) {
      const draftRes = await pool.query('SELECT theme_draft FROM appearance_settings WHERE tenant_id = $1', [user.tenantId]);
      candidate = draftRes.rows[0]?.theme_draft;
    }
    if (!candidate) throw apiError(400, 'There is no theme to publish yet.');

    const result = validateTheme(candidate);
    if (!result.ok) {
      throw apiError(400, `The menu theme could not be published: ${result.errors.join('; ')}`);
    }

    const published = await withContentChange(authorization, async (client) => {
      const settingId = randomUUID();
      const updateRes = await client.query(
        `INSERT INTO appearance_settings (id, tenant_id, template_id, theme_published, theme_draft, theme_version, theme_updated_at)
         VALUES ($1, $2, $3, $4, $4, 1, CURRENT_TIMESTAMP)
         ON CONFLICT (tenant_id) DO UPDATE SET
           template_id = EXCLUDED.template_id,
           theme_published = EXCLUDED.theme_published,
           theme_draft = EXCLUDED.theme_draft,
           theme_version = appearance_settings.theme_version + 1,
           theme_updated_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
         RETURNING theme_published as "published", theme_version as "version"`,
        [settingId, user.tenantId, result.theme.presetId, JSON.stringify(result.theme)]
      );

      const row = updateRes.rows[0];
      await client.query(
        `INSERT INTO appearance_theme_history (id, tenant_id, version, theme)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (tenant_id, version) DO NOTHING`,
        [randomUUID(), user.tenantId, row.version, JSON.stringify(result.theme)]
      );

      return row;
    });

    invalidatePublicMenuCache(user.tenantId);
    sendJson(response, 200, published);
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/app/theme/history') {
    requireEntitlement(authorization, 'templates', 'Menu design requires an Intermediate or Premium plan.');
    const res = await pool.query(
      'SELECT version, theme, created_at as "createdAt" FROM appearance_theme_history WHERE tenant_id = $1 ORDER BY version DESC LIMIT 20',
      [user.tenantId]
    );
    sendJson(response, 200, res.rows);
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/app/theme/rollback') {
    requireEntitlement(authorization, 'templates', 'Menu design requires an Intermediate or Premium plan.');
    const input = await readJson(request);
    const targetVersion = Number(input.version);
    if (!Number.isInteger(targetVersion) || targetVersion < 1) {
      throw apiError(400, 'A valid theme version is required to roll back.');
    }

    const rolledBack = await withContentChange(authorization, async (client) => {
      const historyRes = await client.query(
        'SELECT theme FROM appearance_theme_history WHERE tenant_id = $1 AND version = $2',
        [user.tenantId, targetVersion]
      );
      if (!historyRes.rows[0]) throw apiError(404, `Theme version ${targetVersion} was not found.`);

      // The restored theme is re-validated, not trusted blindly — it was valid when it was
      // written, but the allowlists it must satisfy can change between releases.
      const result = validateTheme(historyRes.rows[0].theme);
      const restoredTheme = result.ok ? result.theme : coerceTheme(historyRes.rows[0].theme);

      // A rollback is itself a new, newest version — history is append-only, so "undo the undo"
      // is always possible by rolling back again, rather than special-casing a rewind.
      const updateRes = await client.query(
        `UPDATE appearance_settings SET
           template_id = $2,
           theme_published = $3,
           theme_draft = $3,
           theme_version = theme_version + 1,
           theme_updated_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
         WHERE tenant_id = $1
         RETURNING theme_published as "published", theme_version as "version"`,
        [user.tenantId, restoredTheme.presetId, JSON.stringify(restoredTheme)]
      );
      if (!updateRes.rows[0]) throw apiError(404, 'No published theme exists for this account yet.');

      await client.query(
        `INSERT INTO appearance_theme_history (id, tenant_id, version, theme)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (tenant_id, version) DO NOTHING`,
        [randomUUID(), user.tenantId, updateRes.rows[0].version, JSON.stringify(restoredTheme)]
      );

      return updateRes.rows[0];
    });

    invalidatePublicMenuCache(user.tenantId);
    sendJson(response, 200, rolledBack);
    return true;
  }

  if (request.method === 'PATCH' && url.pathname === '/api/app/settings') {
    requireBasicContentAccess(authorization);
    const input = await readJson(request);
    const updates = {};
    if (input.businessName !== undefined) updates.business_name = input.businessName;
    if (input.menuSlug !== undefined) updates.menu_slug = input.menuSlug;
    if (input.tagline !== undefined) updates.tagline = input.tagline;
    if (input.phone !== undefined) updates.phone = input.phone;
    if (input.city !== undefined) updates.city = input.city;
    if (input.address !== undefined) updates.address = input.address;
    if (input.logoUrl !== undefined) updates.logo_url = input.logoUrl;
    if (input.state !== undefined) updates.state = input.state;
    if (input.cuisine !== undefined) updates.cuisine = input.cuisine;
    if (input.openingHours !== undefined) updates.opening_hours = input.openingHours;
    if (input.instagram !== undefined) updates.instagram = input.instagram;
    if (input.facebook !== undefined) updates.facebook = input.facebook;
    if (input.website !== undefined) updates.website = input.website;

    if (authorization.planId !== 'BASIC') requireEntitlement(authorization, 'initial_menu_setup');
    
    if (updates.menu_slug) {
      const conflict = await pool.query('SELECT id FROM clients WHERE menu_slug = $1 AND id != $2', [updates.menu_slug, user.tenantId]);
      if (conflict.rows.length > 0) throw apiError(409, 'Menu slug already in use.');
    }

    const fields = Object.keys(updates);
    if (fields.length === 0) {
      sendJson(response, 200, { message: 'No updates provided' });
      return true;
    }

    const setClause = fields.map((f) => `"${f}" = ?`).join(', ');
    const values = fields.map(f => updates[f]);
    values.push(user.tenantId);

    const updated = await withContentChange(authorization, async (client) => {
      const updateRes = await queryPortable(client, `UPDATE clients SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
      if (updateRes.rowCount === 0) throw apiError(404, 'Restaurant could not be found.');
      return queryPortable(client, 'SELECT id, business_name as "businessName", menu_slug as "menuSlug", tagline, phone, city, state, address, logo_url as "logoUrl", cuisine, opening_hours as "openingHours", instagram, facebook, website FROM clients WHERE id = ?', [user.tenantId]);
    });

    sendJson(response, 200, updated.rows[0]);
    return true;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/app/addons/google-reviews — Status & Review Configuration
  // ─────────────────────────────────────────────────────────────────────────
  if (request.method === 'GET' && url.pathname === '/api/app/addons/google-reviews') {
    const entitlementRes = await pool.query(
      `SELECT status, expires_at, started_at, updated_at
       FROM tenant_addon_entitlements
       WHERE tenant_id = $1 AND addon_id = 'google_reviews'`,
      [user.tenantId]
    );

    const reviewRes = await pool.query(
      `SELECT review_url, updated_at FROM tenant_google_reviews WHERE tenant_id = $1`,
      [user.tenantId]
    );

    const ent = entitlementRes.rows[0];
    const rev = reviewRes.rows[0];

    const now = new Date();
    const hasEntitlement = Boolean(ent && ent.status === 'ACTIVE' && new Date(ent.expires_at) > now);
    const isExpired = Boolean(ent && (new Date(ent.expires_at) <= now || ent.status === 'EXPIRED'));

    let status = 'NOT_SUBSCRIBED';
    if (isExpired) {
      status = 'EXPIRED';
    } else if (hasEntitlement) {
      status = rev?.review_url ? 'ACTIVE' : 'SETUP_REQUIRED';
    }

    sendJson(response, 200, {
      status,
      canConfigure: hasEntitlement,
      hasEntitlement,
      isExpired,
      expiresAt: ent?.expires_at || null,
      startedAt: ent?.started_at || null,
      reviewUrl: rev?.review_url || '',
      lastUpdated: rev?.updated_at || ent?.updated_at || null,
    });
    return true;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PUT /api/app/addons/google-reviews — Save / Update Review Link
  // ─────────────────────────────────────────────────────────────────────────
  if (request.method === 'PUT' && url.pathname === '/api/app/addons/google-reviews') {
    // Entitlement verification: tenant must have active, unexpired entitlement
    const entCheck = await pool.query(
      `SELECT status, expires_at FROM tenant_addon_entitlements
       WHERE tenant_id = $1 AND addon_id = 'google_reviews' AND status = 'ACTIVE' AND expires_at > NOW()`,
      [user.tenantId]
    );

    if (entCheck.rows.length === 0) {
      throw apiError(403, 'Active Google Reviews add-on subscription required to configure review link.');
    }

    const input = await readJson(request);
    const rawUrl = String(input.reviewUrl || '').trim();

    if (!rawUrl) {
      throw apiError(400, 'Google review link is required.');
    }

    if (!isValidGoogleReviewUrl(rawUrl)) {
      throw apiError(400, 'Invalid Google review URL. Please provide a valid https:// Google review link (e.g. from g.page, search.google.com, or maps.google.com).');
    }

    const upsertRes = await pool.query(
      `INSERT INTO tenant_google_reviews (tenant_id, review_url, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (tenant_id)
       DO UPDATE SET review_url = EXCLUDED.review_url, updated_at = NOW()
       RETURNING review_url as "reviewUrl", updated_at as "updatedAt"`,
      [user.tenantId, rawUrl]
    );

    invalidatePublicMenuCache(user.tenantId);

    sendJson(response, 200, {
      success: true,
      status: 'ACTIVE',
      reviewUrl: upsertRes.rows[0].reviewUrl,
      updatedAt: upsertRes.rows[0].updatedAt,
      message: 'Google review link saved successfully.'
    });
    return true;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE /api/app/addons/google-reviews — Clear Review Link
  // ─────────────────────────────────────────────────────────────────────────
  if (request.method === 'DELETE' && url.pathname === '/api/app/addons/google-reviews') {
    const entCheck = await pool.query(
      `SELECT status, expires_at FROM tenant_addon_entitlements
       WHERE tenant_id = $1 AND addon_id = 'google_reviews' AND status = 'ACTIVE' AND expires_at > NOW()`,
      [user.tenantId]
    );

    if (entCheck.rows.length === 0) {
      throw apiError(403, 'Active Google Reviews add-on subscription required.');
    }

    await pool.query('DELETE FROM tenant_google_reviews WHERE tenant_id = $1', [user.tenantId]);
    invalidatePublicMenuCache(user.tenantId);

    sendJson(response, 200, {
      success: true,
      status: 'SETUP_REQUIRED',
      reviewUrl: '',
      message: 'Google review link removed.'
    });
    return true;
  }



  if (request.method === 'GET' && url.pathname === '/api/app/menu') {
    requireEntitlement(authorization, 'digital_menu');
    const menuRes = await pool.query(`
      SELECT m.*, c.menu_slug as "menuSlug" 
      FROM menus m 
      JOIN clients c ON m.tenant_id = c.id 
      WHERE m.tenant_id = $1 LIMIT 1
    `, [user.tenantId]);
    const menu = menuRes.rows[0] || null;
    if (!menu) {
      sendJson(response, 200, { menu: null, categories: [], importHistory: [] });
      return true;
    }
    
    const categoriesRes = await pool.query(
      'SELECT * FROM menu_categories WHERE menu_id = $1 AND tenant_id = $2 ORDER BY sort_order',
      [menu.id, user.tenantId]
    );
    const itemsRes = await pool.query(
      'SELECT * FROM menu_items WHERE menu_id = $1 AND tenant_id = $2 ORDER BY sort_order',
      [menu.id, user.tenantId]
    );
    const variantsRes = await pool.query(
      'SELECT * FROM menu_item_variants WHERE tenant_id = $1 ORDER BY sort_order',
      [user.tenantId]
    );
    const addonGroupsRes = await pool.query(
      'SELECT * FROM menu_item_addon_groups WHERE tenant_id = $1 ORDER BY sort_order',
      [user.tenantId]
    );
    const addonOptionsRes = await pool.query(
      'SELECT * FROM menu_item_addon_options WHERE tenant_id = $1 ORDER BY sort_order',
      [user.tenantId]
    );
    const historyRes = await pool.query(
      'SELECT * FROM menu_imports WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 10',
      [user.tenantId]
    );

    const categories = categoriesRes.rows.map(cat => ({
      ...cat,
      items: itemsRes.rows
        .filter(item => item.category_id === cat.id)
        .map(item => {
          const itemVariants = variantsRes.rows
            .filter(v => v.menu_item_id === item.id)
            .map(v => ({ id: v.id, name: v.name, price: Number(v.price), isAvailable: v.is_available, variantGroup: v.variant_group }));
          
          const itemAddonGroups = addonGroupsRes.rows
            .filter(g => g.menu_item_id === item.id)
            .map(g => ({
              id: g.id,
              name: g.name,
              description: g.description,
              isRequired: g.is_required,
              minSelect: g.min_select,
              maxSelect: g.max_select,
              options: addonOptionsRes.rows
                .filter(o => o.addon_group_id === g.id)
                .map(o => ({ id: o.id, name: o.name, price: Number(o.price), isAvailable: o.is_available }))
            }));

          return {
            ...item,
            variants: itemVariants,
            addon_groups: itemAddonGroups,
          };
        })
    }));
    
    sendJson(response, 200, { menu, categories, importHistory: historyRes.rows });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/app/menu/publish') {
    requireBasicContentAccess(authorization);
    const input = await readJson(request);
    const status = input.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED';
    const result = await withContentChange(authorization, async (client) => {
      const update = await queryPortable(client,
        'UPDATE menus SET status = ?, published_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE tenant_id = ? RETURNING *',
        [status, user.tenantId]
      );
      if (update.rowCount === 0) throw apiError(404, 'Menu not found.');
      return update;
    });
    sendJson(response, 200, result.rows[0]);
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/app/categories') {
    requireBasicContentAccess(authorization);
    if (authorization.planId !== 'BASIC') requireEntitlement(authorization, 'menu_management', 'Category management requires an Intermediate or Premium plan.');
    const input = await readJson(request);
    const name = inputText(input.name, 100);
    if (!name) throw apiError(400, 'Add a name for this menu category.');
    const schedule = validateSchedule(input.schedule);
    if (schedule?.error) throw apiError(400, schedule.error);
    const result = await withContentChange(authorization, async (client) => {
      let menuId = input.menuId;
      if (!menuId) {
        const mRes = await queryPortable(client, 'SELECT id FROM menus WHERE tenant_id = ? LIMIT 1', [user.tenantId]);
        menuId = mRes.rows[0]?.id;
      }
      const ownedMenu = await queryPortable(client, 'SELECT id FROM menus WHERE id = ? AND tenant_id = ?', [menuId, user.tenantId]);
      if (!ownedMenu.rows[0]) throw apiError(403, 'Menu does not belong to this account.');
      const sort = await queryPortable(client, 'SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM menu_categories WHERE menu_id = ? AND tenant_id = ?', [menuId, user.tenantId]);
      const categoryId = randomUUID();
      await queryPortable(client,
        'INSERT INTO menu_categories (id, menu_id, tenant_id, name, description, sort_order, schedule) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [categoryId, menuId, user.tenantId, name, inputText(input.description, 500) || null, sort.rows[0].next_order, schedule ? JSON.stringify(schedule) : null]
      );
      return queryPortable(client, 'SELECT * FROM menu_categories WHERE id = ? AND tenant_id = ?', [categoryId, user.tenantId]);
    });
    sendJson(response, 200, result.rows[0]);
    return true;
  }

  const catMatch = url.pathname.match(/^\/api\/app\/categories\/([^/]+)$/);
  if (catMatch) {
    requireBasicContentAccess(authorization);
    if (authorization.planId !== 'BASIC') requireEntitlement(authorization, 'menu_management', 'Category management requires an Intermediate or Premium plan.');
    const catId = catMatch[1];
    if (request.method === 'PUT') {
      const input = await readJson(request);
      // `schedule` absent leaves the window untouched; present (null clears it) replaces it.
      const hasSchedule = 'schedule' in input;
      const schedule = hasSchedule ? validateSchedule(input.schedule) : null;
      if (schedule?.error) throw apiError(400, schedule.error);
      const result = await withContentChange(authorization, async (client) => {
        const update = await queryPortable(client,
          'UPDATE menu_categories SET name = COALESCE(?, name), description = ?, schedule = CASE WHEN ?::boolean THEN ?::jsonb ELSE schedule END, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND tenant_id = ?',
          [input.name === undefined ? null : inputText(input.name, 100), inputText(input.description, 500) || null, hasSchedule, schedule ? JSON.stringify(schedule) : null, catId, user.tenantId]
        );
        if (update.rowCount === 0) throw apiError(404, 'Category not found.');
        return queryPortable(client, 'SELECT * FROM menu_categories WHERE id = ? AND tenant_id = ?', [catId, user.tenantId]);
      });
      sendJson(response, 200, result.rows[0]);
      return true;
    }
    if (request.method === 'DELETE') {
      await withContentChange(authorization, async (client) => {
        const result = await queryPortable(client, 'DELETE FROM menu_categories WHERE id = ? AND tenant_id = ?', [catId, user.tenantId]);
        if (result.rowCount === 0) throw apiError(404, 'Category not found.');
      });
      sendJson(response, 200, { success: true });
      return true;
    }
  }

  if (request.method === 'PATCH' && url.pathname === '/api/app/categories/reorder') {
    requireBasicContentAccess(authorization);
    if (authorization.planId !== 'BASIC') requireEntitlement(authorization, 'menu_management', 'Category management requires an Intermediate or Premium plan.');
    const input = await readJson(request);
    if (!Array.isArray(input.order) || input.order.length > 50) throw apiError(400, 'Invalid category order.');
    await withContentChange(authorization, async (client) => {
      for (const item of input.order) {
        const result = await queryPortable(client, 'UPDATE menu_categories SET sort_order = ? WHERE id = ? AND tenant_id = ?', [Number(item.sort_order), item.id, user.tenantId]);
        if (result.rowCount === 0) throw apiError(404, 'One of these categories could not be found.');
      }
    });
    sendJson(response, 200, { success: true });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/app/items') {
    requireBasicContentAccess(authorization);
    if (authorization.planId !== 'BASIC') requireEntitlement(authorization, 'add_item', 'Adding menu items requires an Intermediate or Premium plan.');
    const input = await readJson(request);
    let { menuId, categoryId, name, description, price, halfPrice, fullPrice, dietType, isAvailable, pricingType, variants, addonGroups } = input;
    name = inputText(name, 255);
    const numericPrice = Number(price);
    if (!name || !Number.isFinite(numericPrice) || numericPrice < 0) throw apiError(400, 'Check the menu item name and price.');
    const result = await withContentChange(authorization, async (client) => {
      if (!menuId) {
        const menuResult = await queryPortable(client, 'SELECT id FROM menus WHERE tenant_id = ? LIMIT 1', [user.tenantId]);
        menuId = menuResult.rows[0]?.id;
      }
      const ownedCategory = await queryPortable(client,
        'SELECT c.id FROM menu_categories c JOIN menus m ON m.id = c.menu_id AND m.tenant_id = c.tenant_id WHERE c.id = ? AND c.menu_id = ? AND c.tenant_id = ?',
        [categoryId, menuId, user.tenantId]
      );
      if (!ownedCategory.rows[0]) throw apiError(403, 'Category does not belong to this account menu.');
      const sort = await queryPortable(client, 'SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM menu_items WHERE category_id = ? AND tenant_id = ?', [categoryId, user.tenantId]);
      const itemId = randomUUID();
      const actualPricingType = pricingType || (Array.isArray(variants) && variants.length > 0 ? 'variants' : 'single');
      const focal = inputFocalPoint(input.focal);
      const tags = inputItemTags(input.tags);
      const translations = inputItemTranslations(input.translations);
      const newMetadata = { ...(focal ? { focal } : {}), ...(tags ? { tags } : {}), ...(translations ? { translations } : {}) };

      await queryPortable(client,
        'INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, description, price, half_price, full_price, image_url, diet_type, is_available, sort_order, pricing_type, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [itemId, menuId, user.tenantId, categoryId, name, inputText(description, 2000) || null, numericPrice, halfPrice ?? null, fullPrice ?? null, inputText(input.imageUrl, 2048) || null, dietType || 'veg', isAvailable !== false, sort.rows[0].next_order, actualPricingType, Object.keys(newMetadata).length ? JSON.stringify(newMetadata) : null]
      );

      if (Array.isArray(variants) && variants.length > 0) {
        for (let vIdx = 0; vIdx < variants.length; vIdx++) {
          const v = variants[vIdx];
          const vPrice = Number(v.price);
          if (inputText(v.name, 100) && Number.isFinite(vPrice) && vPrice >= 0) {
            await queryPortable(client,
              'INSERT INTO menu_item_variants (id, menu_item_id, tenant_id, variant_group, name, price, is_available, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
              [randomUUID(), itemId, user.tenantId, inputText(v.variantGroup, 100) || 'Portion', inputText(v.name, 100), vPrice, v.isAvailable !== false, vIdx + 1]
            );
          }
        }
      }

      if (Array.isArray(addonGroups) && addonGroups.length > 0) {
        for (let gIdx = 0; gIdx < addonGroups.length; gIdx++) {
          const g = addonGroups[gIdx];
          const gName = inputText(g.name, 100);
          if (gName) {
            const groupId = randomUUID();
            await queryPortable(client,
              'INSERT INTO menu_item_addon_groups (id, menu_item_id, tenant_id, name, description, is_required, min_select, max_select, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [groupId, itemId, user.tenantId, gName, inputText(g.description, 500) || null, Boolean(g.isRequired), Number(g.minSelect || 0), Number(g.maxSelect || 1), gIdx + 1]
            );

            if (Array.isArray(g.options)) {
              for (let oIdx = 0; oIdx < g.options.length; oIdx++) {
                const opt = g.options[oIdx];
                const optName = inputText(opt.name, 100);
                const optPrice = Number(opt.price || 0);
                if (optName && Number.isFinite(optPrice) && optPrice >= 0) {
                  await queryPortable(client,
                    'INSERT INTO menu_item_addon_options (id, addon_group_id, tenant_id, name, price, is_available, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [randomUUID(), groupId, user.tenantId, optName, optPrice, opt.isAvailable !== false, oIdx + 1]
                  );
                }
              }
            }
          }
        }
      }

      return queryPortable(client, 'SELECT * FROM menu_items WHERE id = ? AND tenant_id = ?', [itemId, user.tenantId]);
    });
    sendJson(response, 200, result.rows[0]);
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/app/items/duplicate') {
    requireBasicContentAccess(authorization);
    if (authorization.planId !== 'BASIC') requireEntitlement(authorization, 'add_item', 'Duplicating menu items requires an Intermediate or Premium plan.');
    const input = await readJson(request);
    const itemId = input.itemId;
    if (!itemId) throw apiError(400, 'Specify the item to duplicate.');

    const result = await withContentChange(authorization, async (client) => {
      const orig = await queryPortable(client, 'SELECT * FROM menu_items WHERE id = ? AND tenant_id = ?', [itemId, user.tenantId]);
      if (!orig.rows[0]) throw apiError(404, 'Item not found.');
      const itemData = orig.rows[0];

      const newItemId = randomUUID();
      const nextSort = await queryPortable(client, 'SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM menu_items WHERE category_id = ? AND tenant_id = ?', [itemData.category_id, user.tenantId]);
      
      await queryPortable(client,
        'INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, description, price, half_price, full_price, image_url, diet_type, is_available, sort_order, pricing_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [newItemId, itemData.menu_id, user.tenantId, itemData.category_id, `${itemData.name} (Copy)`, itemData.description, itemData.price, itemData.half_price, itemData.full_price, itemData.image_url, itemData.diet_type, itemData.is_available, nextSort.rows[0].next_order, itemData.pricing_type || 'single']
      );

      // Copy variants
      const origVariants = await queryPortable(client, 'SELECT * FROM menu_item_variants WHERE menu_item_id = ? AND tenant_id = ?', [itemId, user.tenantId]);
      for (const v of origVariants.rows) {
        await queryPortable(client,
          'INSERT INTO menu_item_variants (id, menu_item_id, tenant_id, variant_group, name, price, is_available, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [randomUUID(), newItemId, user.tenantId, v.variant_group, v.name, v.price, v.is_available, v.sort_order]
        );
      }

      // Copy addon groups & options
      const origGroups = await queryPortable(client, 'SELECT * FROM menu_item_addon_groups WHERE menu_item_id = ? AND tenant_id = ?', [itemId, user.tenantId]);
      for (const g of origGroups.rows) {
        const newGroupId = randomUUID();
        await queryPortable(client,
          'INSERT INTO menu_item_addon_groups (id, menu_item_id, tenant_id, name, description, is_required, min_select, max_select, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [newGroupId, newItemId, user.tenantId, g.name, g.description, g.is_required, g.min_select, g.max_select, g.sort_order]
        );
        const origOptions = await queryPortable(client, 'SELECT * FROM menu_item_addon_options WHERE addon_group_id = ? AND tenant_id = ?', [g.id, user.tenantId]);
        for (const opt of origOptions.rows) {
          await queryPortable(client,
            'INSERT INTO menu_item_addon_options (id, addon_group_id, tenant_id, name, price, is_available, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [randomUUID(), newGroupId, user.tenantId, opt.name, opt.price, opt.is_available, opt.sort_order]
          );
        }
      }

      return queryPortable(client, 'SELECT * FROM menu_items WHERE id = ? AND tenant_id = ?', [newItemId, user.tenantId]);
    });

    sendJson(response, 200, result.rows[0]);
    return true;
  }

  // Private guest feedback for the owner (every plan with a live menu).
  if (request.method === 'GET' && url.pathname === '/api/app/feedback') {
    requireEntitlement(authorization, 'digital_menu');
    sendJson(response, 200, await getFeedbackSummary(pool, user.tenantId, Number(url.searchParams.get('limit'))));
    return true;
  }

  // Call Waiter / Request Bill history — the live SSE broadcast (orderStream.js) is unchanged;
  // this is the persisted record of the same events, for the reception panel's "Done" button to
  // resolve and for an owner to review later.
  if (request.method === 'GET' && url.pathname === '/api/app/service-requests') {
    requireEntitlement(authorization, 'reception_orders');
    const limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit')) || 50));
    const result = await queryPortable(pool,
      'SELECT id, table_number as "tableNumber", request_type as "requestType", notes, customer_name as "customerName", status, created_at as "createdAt", resolved_at as "resolvedAt" FROM service_requests WHERE tenant_id = ? ORDER BY created_at DESC LIMIT ?',
      [user.tenantId, limit]
    );
    sendJson(response, 200, { requests: result.rows });
    return true;
  }

  const resolveServiceRequestMatch = url.pathname.match(/^\/api\/app\/service-requests\/([^/]+)\/resolve$/);
  if (request.method === 'PATCH' && resolveServiceRequestMatch) {
    requireEntitlement(authorization, 'reception_orders');
    const result = await queryPortable(pool,
      "UPDATE service_requests SET status = 'RESOLVED', resolved_at = CURRENT_TIMESTAMP WHERE id = ? AND tenant_id = ? RETURNING id",
      [resolveServiceRequestMatch[1], user.tenantId]
    );
    if (!result.rows[0]) throw apiError(404, 'Service request not found.');
    sendJson(response, 200, { success: true });
    return true;
  }

  // Owner analytics: scans/views for Intermediate+, order metrics only where ordering exists.
  if (request.method === 'GET' && url.pathname === '/api/app/analytics') {
    requireEntitlement(authorization, 'analytics', 'Analytics requires an Intermediate or Premium plan.');
    const requested = Number(url.searchParams.get('range'));
    const range = ALLOWED_RANGES.includes(requested) ? requested : 7;
    const data = await getTenantAnalytics(pool, user.tenantId, range, {
      includeOrders: authorization.entitlements.includes('reception_orders'),
    });
    sendJson(response, 200, data);
    return true;
  }

  // Operational toggle (not a content edit): deliberately skips `withContentChange` so marking a
  // dish sold out never consumes a Basic plan's edit allowance.
  const soldOutMatch = url.pathname.match(/^\/api\/app\/items\/([^/]+)\/sold-out$/);
  if (request.method === 'POST' && soldOutMatch) {
    requireEntitlement(authorization, 'digital_menu');
    const input = await readJson(request);
    const soldOut = input.soldOut === true;
    const existing = await queryPortable(pool, 'SELECT metadata FROM menu_items WHERE id = ? AND tenant_id = ?', [soldOutMatch[1], user.tenantId]);
    if (!existing.rows[0]) throw apiError(404, 'Menu item could not be found.');
    const nextMetadata = mergeItemSoldOut(existing.rows[0].metadata, soldOut ? istDateString() : null);
    await queryPortable(pool, 'UPDATE menu_items SET metadata = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND tenant_id = ?', [JSON.stringify(nextMetadata), soldOutMatch[1], user.tenantId]);
    invalidatePublicMenuCache(user.tenantId);
    sendJson(response, 200, { id: soldOutMatch[1], soldOut, soldOutOn: soldOut ? nextMetadata.soldOutOn : null });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/app/items/bulk-update') {
    requireBasicContentAccess(authorization);
    if (authorization.planId !== 'BASIC') requireEntitlement(authorization, 'edit_item', 'Bulk editing requires an Intermediate or Premium plan.');
    const input = await readJson(request);
    const { itemIds, action, payload } = input;
    if (!Array.isArray(itemIds) || itemIds.length === 0 || !action) {
      throw apiError(400, 'Select items and a valid bulk action.');
    }

    await withContentChange(authorization, async (client) => {
      // Validate all items belong to tenant
      const checkRes = await queryPortable(client,
        'SELECT id, price FROM menu_items WHERE id = ANY(?) AND tenant_id = ?',
        [itemIds, user.tenantId]
      );
      if (checkRes.rows.length !== itemIds.length) {
        throw apiError(403, 'One or more selected items could not be verified for your account.');
      }

      if (action === 'change_category') {
        const categoryId = payload?.categoryId;
        const catCheck = await queryPortable(client, 'SELECT id FROM menu_categories WHERE id = ? AND tenant_id = ?', [categoryId, user.tenantId]);
        if (!catCheck.rows[0]) throw apiError(403, 'Category not found or invalid.');
        await queryPortable(client, 'UPDATE menu_items SET category_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ANY(?) AND tenant_id = ?', [categoryId, itemIds, user.tenantId]);
      } else if (action === 'change_availability') {
        const isAvailable = Boolean(payload?.isAvailable);
        await queryPortable(client, 'UPDATE menu_items SET is_available = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ANY(?) AND tenant_id = ?', [isAvailable, itemIds, user.tenantId]);
      } else if (action === 'adjust_price') {
        const type = payload?.type; // 'flat' | 'percentage'
        const value = Number(payload?.value);
        if (!['flat', 'percentage'].includes(type) || !Number.isFinite(value)) {
          throw apiError(400, 'Enter a valid price adjustment amount.');
        }

        for (const row of checkRes.rows) {
          const currentPrice = Number(row.price || 0);
          let newPrice = currentPrice;
          if (type === 'flat') {
            newPrice = currentPrice + value;
          } else {
            newPrice = currentPrice + (currentPrice * (value / 100));
          }
          if (newPrice < 0) newPrice = 0;
          newPrice = Math.round(newPrice * 100) / 100;

          await queryPortable(client, 'UPDATE menu_items SET price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND tenant_id = ?', [newPrice, row.id, user.tenantId]);
          
          if (type === 'percentage') {
            const vars = await queryPortable(client, 'SELECT id, price FROM menu_item_variants WHERE menu_item_id = ? AND tenant_id = ?', [row.id, user.tenantId]);
            for (const v of vars.rows) {
              let vp = Number(v.price || 0);
              vp = Math.max(0, Math.round((vp + (vp * (value / 100))) * 100) / 100);
              await queryPortable(client, 'UPDATE menu_item_variants SET price = ? WHERE id = ? AND tenant_id = ?', [vp, v.id, user.tenantId]);
            }
          }
        }
      } else if (action === 'delete') {
        await queryPortable(client, 'DELETE FROM menu_items WHERE id = ANY(?) AND tenant_id = ?', [itemIds, user.tenantId]);
      } else {
        throw apiError(400, 'Unsupported bulk action.');
      }
    });

    sendJson(response, 200, { success: true, count: itemIds.length });
    return true;
  }

  // SMART EXCEL/CSV IMPORT API ENDPOINTS
  if (request.method === 'POST' && url.pathname === '/api/app/menu/import/preview') {
    requireBasicContentAccess(authorization);
    const input = await readJson(request);
    const { headers, rawRows } = input;
    if (!Array.isArray(headers) || !Array.isArray(rawRows)) {
      throw apiError(400, 'Headers and data rows are required for preview.');
    }

    const columnMap = detectColumnMappings(headers);
    const existingItemsRes = await pool.query('SELECT name FROM menu_items WHERE tenant_id = $1', [user.tenantId]);
    const existingNames = existingItemsRes.rows.map(r => r.name);
    
    const previewData = validateAndPreviewImport(rawRows, columnMap, existingNames);
    sendJson(response, 200, {
      detectedColumns: columnMap,
      ...previewData
    });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/app/menu/import/execute') {
    requireBasicContentAccess(authorization);
    if (authorization.planId !== 'BASIC') requireEntitlement(authorization, 'menu_management', 'Menu import requires an Intermediate or Premium plan.');
    const input = await readJson(request);
    const { categories, mode, filename } = input;
    if (!Array.isArray(categories) || categories.length === 0) {
      throw apiError(400, 'No menu categories or items provided for import.');
    }

    const validModes = ['add', 'update', 'skip', 'replace'];
    const importMode = validModes.includes(mode) ? mode : 'add';

    const menuResult = await queryPortable(pool, 'SELECT id FROM menus WHERE tenant_id = ? LIMIT 1', [user.tenantId]);
    let menuId = menuResult.rows[0]?.id;
    if (!menuId) {
      menuId = randomUUID();
      await queryPortable(pool, 'INSERT INTO menus (id, tenant_id, name) VALUES (?, ?, ?)', [menuId, user.tenantId, 'Main Menu']);
    }

    const client = await pool.connect();
    let stats;
    try {
      await client.query('BEGIN');
      stats = await executeImportTransaction(client, user.tenantId, menuId, categories, importMode, filename || 'uploaded_menu.xlsx');
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    sendJson(response, 200, { success: true, ...stats });
    return true;
  }

  // Batch dish-photo matching for the onboarding wizard's Excel path, which parses
  // client-side and therefore never runs through menuImporter.js's own resolveDishImage
  // call — this is what gives an onboarded-via-Excel menu the same photo coverage an
  // Excel import done later from the Menu page already gets.
  if (request.method === 'POST' && url.pathname === '/api/app/menu/resolve-images') {
    requireBasicContentAccess(authorization);
    const input = await readJson(request);
    const rawItems = Array.isArray(input?.items) ? input.items : [];
    if (rawItems.length === 0 || rawItems.length > 300) {
      throw apiError(400, 'Provide between 1 and 300 items to resolve photos for.');
    }
    const matches = rawItems.map((item, position) => ({
      index: Number.isInteger(item?.index) ? item.index : position,
      imageUrl: resolveDishImage(inputText(item?.name, 255), inputText(item?.category, 100), [], 0, user.tenantId),
    }));
    sendJson(response, 200, { matches });
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/app/menu/import/history') {
    const historyRes = await pool.query(
      'SELECT * FROM menu_imports WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 20',
      [user.tenantId]
    );
    sendJson(response, 200, historyRes.rows);
    return true;
  }

  const itemMatch = url.pathname.match(/^\/api\/app\/items\/([^/]+)(?:\/(.+))?$/);
  if (itemMatch && request.method !== 'POST') {
    requireBasicContentAccess(authorization);
    const itemId = itemMatch[1];
    const subAction = itemMatch[2];
    
    if (request.method === 'PUT' && !subAction) {
      const input = await readJson(request);
      if (authorization.planId !== 'BASIC') requireEntitlement(authorization, 'edit_item', 'Item editing requires an Intermediate or Premium plan.');
      const name = input.name === undefined ? null : inputText(input.name, 255);
      if (input.name !== undefined && !name) throw apiError(400, 'Add a name for this menu item.');
      const price = input.price === undefined ? null : Number(input.price);
      if (price !== null && (!Number.isFinite(price) || price < 0)) throw apiError(400, 'Enter a valid menu item price.');
      
      const result = await withContentChange(authorization, async (client) => {
        const existing = await queryPortable(client, 'SELECT menu_id, category_id, metadata FROM menu_items WHERE id = ? AND tenant_id = ?', [itemId, user.tenantId]);
        if (!existing.rows[0]) throw apiError(404, 'Menu item could not be found.');
        const categoryId = input.categoryId || existing.rows[0].category_id;

        // 'focal' absent from the request leaves metadata untouched; present (even as null,
        // which clears it) updates it. This mirrors the COALESCE semantics already used for
        // every other optional field on this endpoint.
        let nextMetadata = existing.rows[0].metadata;
        if ('focal' in input) nextMetadata = mergeItemMetadata(nextMetadata, inputFocalPoint(input.focal));
        if ('tags' in input) nextMetadata = mergeItemTags(nextMetadata, inputItemTags(input.tags));
        if ('translations' in input) nextMetadata = mergeItemTranslations(nextMetadata, inputItemTranslations(input.translations));
        const metadataJson = 'focal' in input || 'tags' in input || 'translations' in input ? JSON.stringify(nextMetadata ?? {}) : null;
        const ownedCategory = await queryPortable(client,
          'SELECT id FROM menu_categories WHERE id = ? AND menu_id = ? AND tenant_id = ?',
          [categoryId, existing.rows[0].menu_id, user.tenantId]
        );
        if (!ownedCategory.rows[0]) throw apiError(403, 'Category does not belong to this account menu.');
        
        const pricingType = input.pricingType || (Array.isArray(input.variants) && input.variants.length > 0 ? 'variants' : 'single');

        await queryPortable(client,
          'UPDATE menu_items SET category_id = ?, name = COALESCE(?, name), description = ?, price = COALESCE(?, price), half_price = COALESCE(?, half_price), full_price = COALESCE(?, full_price), image_url = COALESCE(?, image_url), diet_type = COALESCE(?, diet_type), is_available = COALESCE(?, is_available), pricing_type = ?, metadata = COALESCE(?, metadata), updated_at = CURRENT_TIMESTAMP WHERE id = ? AND tenant_id = ?',
          [categoryId, name, input.description === undefined ? null : inputText(input.description, 2000) || null, price, input.halfPrice === undefined ? null : input.halfPrice, input.fullPrice === undefined ? null : input.fullPrice, input.imageUrl === undefined ? null : inputText(input.imageUrl, 2048) || null, input.dietType === undefined ? null : input.dietType, input.isAvailable === undefined ? null : input.isAvailable !== false, pricingType, metadataJson, itemId, user.tenantId]
        );

        if (Array.isArray(input.variants)) {
          await queryPortable(client, 'DELETE FROM menu_item_variants WHERE menu_item_id = ? AND tenant_id = ?', [itemId, user.tenantId]);
          for (let vIdx = 0; vIdx < input.variants.length; vIdx++) {
            const v = input.variants[vIdx];
            const vPrice = Number(v.price);
            if (inputText(v.name, 100) && Number.isFinite(vPrice) && vPrice >= 0) {
              await queryPortable(client,
                'INSERT INTO menu_item_variants (id, menu_item_id, tenant_id, variant_group, name, price, is_available, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [randomUUID(), itemId, user.tenantId, inputText(v.variantGroup, 100) || 'Portion', inputText(v.name, 100), vPrice, v.isAvailable !== false, vIdx + 1]
              );
            }
          }
        }

        if (Array.isArray(input.addonGroups)) {
          await queryPortable(client, 'DELETE FROM menu_item_addon_groups WHERE menu_item_id = ? AND tenant_id = ?', [itemId, user.tenantId]);
          for (let gIdx = 0; gIdx < input.addonGroups.length; gIdx++) {
            const g = input.addonGroups[gIdx];
            const gName = inputText(g.name, 100);
            if (gName) {
              const groupId = randomUUID();
              await queryPortable(client,
                'INSERT INTO menu_item_addon_groups (id, menu_item_id, tenant_id, name, description, is_required, min_select, max_select, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [groupId, itemId, user.tenantId, gName, inputText(g.description, 500) || null, Boolean(g.isRequired), Number(g.minSelect || 0), Number(g.maxSelect || 1), gIdx + 1]
              );
              if (Array.isArray(g.options)) {
                for (let oIdx = 0; oIdx < g.options.length; oIdx++) {
                  const opt = g.options[oIdx];
                  const optName = inputText(opt.name, 100);
                  const optPrice = Number(opt.price || 0);
                  if (optName && Number.isFinite(optPrice) && optPrice >= 0) {
                    await queryPortable(client,
                      'INSERT INTO menu_item_addon_options (id, addon_group_id, tenant_id, name, price, is_available, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
                      [randomUUID(), groupId, user.tenantId, optName, optPrice, opt.isAvailable !== false, oIdx + 1]
                    );
                  }
                }
              }
            }
          }
        }

        return queryPortable(client, 'SELECT * FROM menu_items WHERE id = ? AND tenant_id = ?', [itemId, user.tenantId]);
      });
      sendJson(response, 200, result.rows[0]);
      return true;
    }
    
    if (request.method === 'DELETE' && !subAction) {
      if (authorization.planId !== 'BASIC') requireEntitlement(authorization, 'delete_item', 'Deleting items requires an Intermediate or Premium plan.');
      await withContentChange(authorization, async (client) => {
        const result = await queryPortable(client, 'DELETE FROM menu_items WHERE id = ? AND tenant_id = ?', [itemId, user.tenantId]);
        if (result.rowCount === 0) throw apiError(404, 'Menu item could not be found.');
      });
      sendJson(response, 200, { success: true });
      return true;
    }
    
    if (request.method === 'PATCH' && subAction === 'availability') {
      if (authorization.planId !== 'BASIC') requireEntitlement(authorization, 'edit_item', 'Item editing requires an Intermediate or Premium plan.');
      const input = await readJson(request);
      if (typeof input.isAvailable !== 'boolean') throw apiError(400, 'Choose whether this menu item is available.');
      const result = await withContentChange(authorization, async (client) => {
        const update = await queryPortable(client, 'UPDATE menu_items SET is_available = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND tenant_id = ?', [input.isAvailable, itemId, user.tenantId]);
        if (update.rowCount === 0) throw apiError(404, 'Menu item could not be found.');
        return queryPortable(client, 'SELECT * FROM menu_items WHERE id = ? AND tenant_id = ?', [itemId, user.tenantId]);
      });
      sendJson(response, 200, result.rows[0]);
      return true;
    }
  }

  // Customer Orders Real-Time SSE Stream (Zero Polling)
  if (request.method === 'GET' && url.pathname === '/api/app/orders/stream') {
    requireEntitlement(authorization, 'reception_orders', 'Access to customer reception orders requires an active Premium plan.');
    registerOrderClient(user.tenantId, response, request);
    return true;
  }

  // Customer Orders (Reception Dashboard)
  if (request.method === 'GET' && url.pathname === '/api/app/orders') {
    requireEntitlement(authorization, 'reception_orders', 'Access to customer reception orders requires an active Premium plan.');
    const res = await pool.query(`
      SELECT 
        id, 
        COALESCE(order_type, 'DINE_IN') as "orderType",
        table_number as "tableNumber", 
        customer_name as "customerName",
        customer_phone as "customerPhone",
        delivery_address as "deliveryAddress",
        delivery_landmark as "deliveryLandmark",
        delivery_city as "deliveryCity",
        notes, 
        items, 
        total, 
        status, 
        session_id as "sessionId",
        COALESCE(round_number, 1) as "roundNumber",
        parent_order_id as "parentOrderId",
        rejection_reason as "rejectionReason",
        estimated_time_minutes as "estimatedTimeMinutes",
        estimated_delivery_time as "estimatedDeliveryTime",
        created_at as time
      FROM customer_orders
      WHERE tenant_id = $1
        AND created_at >= NOW() - INTERVAL '24 HOURS'
      ORDER BY created_at DESC
    `, [user.tenantId]);

    const sessionMap = new Map();
    for (const r of res.rows) {
      if (r.sessionId) {
        if (!sessionMap.has(r.sessionId)) sessionMap.set(r.sessionId, []);
        sessionMap.get(r.sessionId).push(r);
      }
    }

    const enriched = res.rows.map(r => {
      let previousRoundItems = [];
      let sessionTotal = parseFloat(r.total);

      if (r.sessionId && sessionMap.has(r.sessionId)) {
        const sessionOrders = sessionMap.get(r.sessionId);
        const allSessionTotal = sessionOrders.reduce((sum, so) => sum + parseFloat(so.total || 0), 0);
        const previousOrders = sessionOrders.filter(
          so => so.id !== r.id && new Date(so.time).getTime() < new Date(r.time).getTime()
        );
        for (const po of previousOrders) {
          if (Array.isArray(po.items)) {
            previousRoundItems.push(...po.items.map(it => ({ ...it, roundNumber: po.roundNumber, orderId: po.id })));
          }
        }
        sessionTotal = allSessionTotal;
      }

      return {
        ...r,
        total: parseFloat(r.total),
        sessionTotal: Math.round(sessionTotal * 100) / 100,
        previousRoundItems,
      };
    });

    sendJson(response, 200, enriched);
    return true;
  }

  const orderUpdateMatch = url.pathname.match(/^\/api\/app\/orders\/([^/]+)\/status$/);
  if (request.method === 'PATCH' && orderUpdateMatch) {
    const orderId = decodeURIComponent(orderUpdateMatch[1]);
    const input = await readJson(request);
    
    const allowedStatuses = [
      'NEW', 
      'ACCEPTED', 
      'PREPARING', 
      'IN_PROGRESS', 
      'READY', 
      'DELIVERED', 
      'COMPLETED', 
      'CANCELLED'
    ];
    if (!allowedStatuses.includes(input.status)) {
      throw apiError(400, 'Invalid status.');
    }

    // Tenant isolation & current status verification
    const currentRes = await pool.query(
      'SELECT id, status, order_type as "orderType" FROM customer_orders WHERE id = $1 AND tenant_id = $2',
      [orderId, user.tenantId]
    );
    if (!currentRes.rows[0]) throw apiError(404, 'Order not found.');
    
    const currentOrder = currentRes.rows[0];
    const currentStatus = currentOrder.status;
    const targetStatus = input.status;

    // Explicit documented state machine transitions
    const VALID_TRANSITIONS = {
      NEW: ['ACCEPTED', 'CANCELLED'],
      ACCEPTED: ['PREPARING', 'IN_PROGRESS', 'CANCELLED'],
      PREPARING: ['READY', 'CANCELLED'],
      IN_PROGRESS: ['READY', 'CANCELLED'],
      READY: ['DELIVERED', 'COMPLETED', 'CANCELLED'],
      DELIVERED: [],
      COMPLETED: [],
      CANCELLED: []
    };

    if (currentStatus !== targetStatus) {
      const allowedNext = VALID_TRANSITIONS[currentStatus] || [];
      if (!allowedNext.includes(targetStatus)) {
        throw apiError(400, `Cannot transition order from ${currentStatus} to ${targetStatus}.`);
      }
    }

    const rejectionReason = input.rejectionReason 
      ? String(input.rejectionReason).trim() 
      : (targetStatus === 'CANCELLED' ? 'Declined by restaurant' : null);
    
    const res = await pool.query(`
      UPDATE customer_orders
      SET 
        status = $1, 
        rejection_reason = COALESCE($2, rejection_reason),
        estimated_time_minutes = CASE 
          WHEN $5::integer IS NOT NULL AND $5::integer > 0 THEN $5::integer 
          ELSE estimated_time_minutes 
        END,
        estimated_delivery_time = CASE 
          WHEN $5::integer IS NOT NULL AND $5::integer > 0 THEN (CURRENT_TIMESTAMP + ($5::integer * INTERVAL '1 minute'))
          ELSE estimated_delivery_time 
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND tenant_id = $4
      RETURNING 
        id, 
        COALESCE(order_type, 'DINE_IN') as "orderType",
        table_number as "tableNumber", 
        customer_name as "customerName",
        customer_phone as "customerPhone",
        delivery_address as "deliveryAddress",
        delivery_landmark as "deliveryLandmark",
        delivery_city as "deliveryCity",
        notes,
        items, 
        total, 
        status, 
        rejection_reason as "rejectionReason",
        estimated_time_minutes as "estimatedTimeMinutes",
        estimated_delivery_time as "estimatedDeliveryTime",
        created_at as time
    `, [targetStatus, rejectionReason, orderId, user.tenantId, (input.estimatedTimeMinutes && Number.isInteger(Number(input.estimatedTimeMinutes)) && Number(input.estimatedTimeMinutes) > 0) ? Number(input.estimatedTimeMinutes) : null]);
    
    const updated = res.rows[0];
    updated.total = parseFloat(updated.total);
    try {
      broadcastOrderEvent(user.tenantId, 'order_status_updated', updated);
    } catch (broadcastErr) {
      console.warn('[orderStream] Failed to broadcast status update:', broadcastErr.message);
    }
    sendJson(response, 200, updated);
    return true;
  }

  const orderTimeUpdateMatch = url.pathname.match(/^\/api\/app\/orders\/([^/]+)\/time$/);
  if (request.method === 'PATCH' && orderTimeUpdateMatch) {
    const orderId = decodeURIComponent(orderTimeUpdateMatch[1]);
    const input = await readJson(request);
    const estMins = Number(input.estimatedTimeMinutes);
    if (!Number.isInteger(estMins) || estMins <= 0 || estMins > 360) {
      throw apiError(400, 'estimatedTimeMinutes must be an integer between 1 and 360.');
    }

    const res = await pool.query(`
      UPDATE customer_orders
      SET 
        estimated_time_minutes = $1::integer,
        estimated_delivery_time = (CURRENT_TIMESTAMP + ($1::integer * INTERVAL '1 minute')),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND tenant_id = $3
      RETURNING 
        id, 
        COALESCE(order_type, 'DINE_IN') as "orderType",
        table_number as "tableNumber", 
        customer_name as "customerName",
        customer_phone as "customerPhone",
        delivery_address as "deliveryAddress",
        delivery_landmark as "deliveryLandmark",
        delivery_city as "deliveryCity",
        notes,
        items, 
        total, 
        status, 
        rejection_reason as "rejectionReason",
        estimated_time_minutes as "estimatedTimeMinutes",
        estimated_delivery_time as "estimatedDeliveryTime",
        created_at as time
    `, [estMins, orderId, user.tenantId]);

    if (!res.rows[0]) throw apiError(404, 'Order not found.');
    const updated = res.rows[0];
    updated.total = parseFloat(updated.total);
    try {
      broadcastOrderEvent(user.tenantId, 'order_time_updated', updated);
    } catch (broadcastErr) {
      console.warn('[orderStream] Failed to broadcast time update:', broadcastErr.message);
    }
    sendJson(response, 200, updated);
    return true;
  }

  return false;
}


