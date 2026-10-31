import { pool } from '../db.js';
import { istDateString } from '../istTime.js';
import { allowHit, isBotAgent, recordMenuHit } from '../menuStats.js';
import { saveFeedback, validateFeedback } from '../feedback.js';
import { applyLiveFlags, isScheduleActive, scheduleLabel } from '../schedule.js';
import { apiError, sendJson, readJson, getClientIp } from '../utils.js';
import { resolveTenantAuthorization, requireEntitlement } from '../authorization.js';
import { getCachedMenu, setCachedMenu, invalidateMenuCache } from '../redisClient.js';
import { broadcastOrderEvent } from '../orderStream.js';
import { resolveMenuFeatures } from '../menuFeatures.js';
import { getTrendingItemIds } from '../analytics.js';
import { randomUUID } from 'node:crypto';

const contactRateLimits = new Map();
const menuHitRateLimits = new Map();
const feedbackRateLimits = new Map();
const publicMenuCache = new Map();
const PUBLIC_MENU_CACHE_TTL_MS = 60 * 1000;

export async function invalidatePublicMenuCache(tenantId) {
  if (!tenantId) return;
  publicMenuCache.delete(tenantId);
  try {
    await invalidateMenuCache(tenantId);
  } catch (err) {
    console.warn('[redis] Failed async invalidation:', err.message);
  }
}

export function clearAllPublicMenuCaches() {
  publicMenuCache.clear();
}

export async function getFullPublicMenuData(tenantId) {
  // Tier 1: In-process memory cache (0ms)
  const cached = publicMenuCache.get(tenantId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  // Tier 2: Distributed Upstash Redis cache (fast & persistent)
  const redisCached = await getCachedMenu(tenantId);
  if (redisCached) {
    publicMenuCache.set(tenantId, {
      data: redisCached,
      expiresAt: Date.now() + PUBLIC_MENU_CACHE_TTL_MS,
    });
    return redisCached;
  }

  const authorization = await resolveTenantAuthorization({ id: null, tenantId });
  if (!authorization.active) {
    return { isExpired: true };
  }


  // 2. Fetch Client Info
  const clientRes = await pool.query('SELECT * FROM clients WHERE id = $1', [tenantId]);
  const client = clientRes.rows[0];
  if (!client || client.status.toLowerCase() !== 'active') {
    return null;
  }

  // 3. Fetch Canonical Profile & Brand (Blueprint §8)
  let canonicalProfile = null;
  try {
    const profRes = await pool.query('SELECT * FROM restaurant_profiles WHERE tenant_id = $1', [tenantId]);
    if (profRes.rows.length > 0) canonicalProfile = profRes.rows[0];
  } catch (err) {
    // Non-fatal if table not yet migrated
  }

  // Active Announcements
  let announcement = null;
  try {
    const annRes = await pool.query(
      `SELECT text, link_type, link_target, i18n FROM restaurant_announcements 
       WHERE tenant_id = $1 AND is_active = true 
         AND (starts_at IS NULL OR starts_at <= NOW()) 
         AND (ends_at IS NULL OR ends_at >= NOW()) 
       ORDER BY created_at DESC LIMIT 1`,
      [tenantId]
    );
    if (annRes.rows.length > 0) {
      announcement = {
        text: annRes.rows[0].text,
        linkType: annRes.rows[0].link_type,
        linkTarget: annRes.rows[0].link_target,
        i18n: annRes.rows[0].i18n || {},
      };
    }
  } catch {}

  // Active Promotional Offers
  let offers = [];
  try {
    const offRes = await pool.query(
      `SELECT id, title, details, price_text, schedule, item_ids, media_id, i18n 
       FROM restaurant_offers WHERE tenant_id = $1 AND is_active = true ORDER BY created_at DESC LIMIT 10`,
      [tenantId]
    );
    offers = offRes.rows.map(o => ({
      id: o.id,
      title: o.title,
      details: o.details,
      priceText: o.price_text,
      schedule: o.schedule,
      itemIds: o.item_ids || [],
      mediaId: o.media_id,
      i18n: o.i18n || {},
    }));
  } catch {}

  // Ordering Settings (Dine-in, Takeaway, Delivery switches)
  let orderingSettings = {
    dineIn: true,
    takeaway: false,
    delivery: false,
    accepting: true,
    autoByHours: false,
    deliveryMinOrder: 0,
    deliveryFee: 0,
    deliveryAreaNote: '',
    payNotes: ['Pay at counter'],
  };
  try {
    const ordRes = await pool.query('SELECT * FROM ordering_settings WHERE tenant_id = $1', [tenantId]);
    if (ordRes.rows.length > 0) {
      const o = ordRes.rows[0];
      orderingSettings = {
        dineIn: Boolean(o.dine_in_enabled),
        takeaway: Boolean(o.takeaway_enabled),
        delivery: Boolean(o.delivery_enabled),
        accepting: Boolean(o.accepting_orders),
        autoByHours: Boolean(o.auto_by_hours),
        deliveryMinOrder: Number(o.delivery_min_order || 0),
        deliveryFee: Number(o.delivery_fee || 0),
        deliveryAreaNote: o.delivery_area_note || '',
        payNotes: o.pay_notes || ['Pay at counter'],
      };
    }
  } catch {}

  // 3b. Fetch Appearance
  const appRes = await pool.query('SELECT * FROM appearance_settings WHERE tenant_id = $1', [tenantId]);
  const appearance = appRes.rows[0] || {};
  const menuFeatures = resolveMenuFeatures(appearance.accent_configuration, client.phone);
  const trendingIds = menuFeatures.trending.enabled ? await getTrendingItemIds(pool, tenantId) : new Set();

  // 4. Fetch Menu & Categories
  const menuRes = await pool.query('SELECT * FROM menus WHERE tenant_id = $1 LIMIT 1', [tenantId]);
  const menu = menuRes.rows[0];

  // 5. Fetch Google Reviews add-on status & URL if active and unexpired
  let googleReviews = { enabled: false };
  const addonRes = await pool.query(
    `SELECT status, expires_at FROM tenant_addon_entitlements
     WHERE tenant_id = $1 AND addon_id = 'google_reviews' AND status = 'ACTIVE' AND expires_at > NOW()`,
    [tenantId]
  );
  if (addonRes.rows.length > 0) {
    const reviewRes = await pool.query(
      `SELECT review_url FROM tenant_google_reviews WHERE tenant_id = $1`,
      [tenantId]
    );
    const reviewUrl = reviewRes.rows[0]?.review_url;
    if (reviewUrl) {
      googleReviews = {
        enabled: true,
        reviewUrl,
      };
    }
  }


  let categories = [];
  let items = [];

  if (menu) {
    const catRes = await pool.query(
      'SELECT * FROM menu_categories WHERE menu_id = $1 AND tenant_id = $2 AND is_visible = true ORDER BY sort_order',
      [menu.id, tenantId]
    );
    categories = catRes.rows.map(c => ({ id: c.id, name: c.name, order: c.sort_order, schedule: c.schedule || null }));

    const itemRes = await pool.query(
      'SELECT * FROM menu_items WHERE menu_id = $1 AND tenant_id = $2 AND is_available = true ORDER BY sort_order',
      [menu.id, tenantId]
    );

    const variantsRes = await pool.query(
      'SELECT * FROM menu_item_variants WHERE tenant_id = $1 AND is_available = true ORDER BY sort_order',
      [tenantId]
    );

    const addonGroupsRes = await pool.query(
      'SELECT * FROM menu_item_addon_groups WHERE tenant_id = $1 ORDER BY sort_order',
      [tenantId]
    );

    const addonOptionsRes = await pool.query(
      'SELECT * FROM menu_item_addon_options WHERE tenant_id = $1 AND is_available = true ORDER BY sort_order',
      [tenantId]
    );

    items = itemRes.rows.map(i => {
      const cat = categories.find(c => c.id === i.category_id);
      const itemVariants = variantsRes.rows
        .filter(v => v.menu_item_id === i.id)
        .map(v => ({ id: v.id, name: v.name, price: parseFloat(v.price || '0'), variantGroup: v.variant_group }));
      
      const itemAddonGroups = addonGroupsRes.rows
        .filter(g => g.menu_item_id === i.id)
        .map(g => ({
          id: g.id,
          name: g.name,
          description: g.description,
          isRequired: g.is_required,
          minSelect: g.min_select,
          maxSelect: g.max_select,
          options: addonOptionsRes.rows
            .filter(o => o.addon_group_id === g.id)
            .map(o => ({ id: o.id, name: o.name, price: parseFloat(o.price || '0') }))
        }));

      return {
        id: i.id,
        name: i.name,
        description: i.description || '',
        price: parseFloat(i.price || '0'),
        halfPrice: i.half_price ? parseFloat(i.half_price) : null,
        fullPrice: i.full_price ? parseFloat(i.full_price) : null,
        pricingType: i.pricing_type || (itemVariants.length > 0 ? 'variants' : 'single'),
        category: cat ? cat.name : 'Other',
        dietType: i.diet_type || 'veg',
        available: i.is_available,
        // "Sold out today" is separate from hidden: the dish stays visible but cannot be ordered,
        // and the flag lapses on its own at the next IST midnight.
        categoryId: i.category_id,
        // Raw date, not a boolean: the payload is cached, and "today" changes at IST midnight.
        // `applyLiveFlags` turns this into `soldOut` on every request.
        soldOutOn: i.metadata?.soldOutOn || null,
        image: i.image_url || '',
        // Owner-set photo focal point, stored in the previously-unused `metadata` JSONB column
        // (no migration needed). Absent for the common case of no focal point set, in which
        // case the renderer defaults to a centred crop.
        focalX: i.metadata?.focal?.x ?? null,
        focalY: i.metadata?.focal?.y ?? null,
        // Owner-set dish tags (allergens, spice, Jain/eggless, badges); null when none are set.
        tags: i.metadata?.tags ?? null,
        // Ordered 3+ times today (IST) — see getTrendingItemIds in analytics.js. Omitted
        // entirely (not just false) when the owner has the feature off, so a stale cached badge
        // can never outlive the toggle.
        ...(menuFeatures.trending.enabled ? { trending: trendingIds.has(i.id) } : {}),
        // Owner-entered dish-name/description translations, keyed by language code; null when
        // none are set or the owner has the customer-facing switch off.
        translations: menuFeatures.multiLanguage.enabled ? (i.metadata?.translations ?? null) : null,
        variants: itemVariants,
        addonGroups: itemAddonGroups,
      };
    });
  }

  if (items.length === 0) {
    categories = [
      { id: 'cat-starters', name: 'Starters & Appetizers', order: 1 },
      { id: 'cat-main', name: 'Main Course (Curries)', order: 2 },
      { id: 'cat-breads', name: 'Tandoori Breads & Rice', order: 3 },
      { id: 'cat-desserts', name: 'Desserts & Sweets', order: 4 },
      { id: 'cat-beverages', name: 'Beverages & Refreshments', order: 5 },
    ];
    items = [
      { id: 'item-1', name: 'Paneer Tikka', description: 'Char-grilled cottage cheese marinated in spiced yogurt and aromatic herbs', price: 240, halfPrice: 140, fullPrice: 240, category: 'Starters & Appetizers', dietType: 'veg', available: true },
      { id: 'item-2', name: 'Dahi Puri', description: 'Crisp puri shells filled with spiced potatoes, sweet chutney, and chilled yogurt', price: 120, category: 'Starters & Appetizers', dietType: 'veg', available: true },
      { id: 'item-3', name: 'Chicken Tikka', description: 'Tender chicken morsels marinated in Kashmiri chili and tandoori spices', price: 280, halfPrice: 160, fullPrice: 280, category: 'Starters & Appetizers', dietType: 'non-veg', available: true },
      { id: 'item-4', name: 'Butter Chicken', description: 'Slow-cooked tandoori chicken in creamy tomato-cashew gravy with dried fenugreek', price: 320, halfPrice: 190, fullPrice: 320, category: 'Main Course (Curries)', dietType: 'non-veg', available: true },
      { id: 'item-5', name: 'Dal Makhani', description: 'Overnight slow-cooked black lentils finished with fresh cream and butter', price: 220, category: 'Main Course (Curries)', dietType: 'veg', available: true },
      { id: 'item-6', name: 'Paneer Butter Masala', description: 'Cottage cheese cubes cooked in rich tomato gravy with royal spices', price: 260, halfPrice: 150, fullPrice: 260, category: 'Main Course (Curries)', dietType: 'veg', available: true },
      { id: 'item-7', name: 'Chicken Dum Biryani', description: 'Fragrant basmati rice layered with spiced marinated chicken and saffron', price: 290, category: 'Tandoori Breads & Rice', dietType: 'non-veg', available: true },
      { id: 'item-8', name: 'Garlic Naan', description: 'Leavened oven-baked flatbread brushed with garlic butter and fresh cilantro', price: 60, category: 'Tandoori Breads & Rice', dietType: 'veg', available: true },
      { id: 'item-9', name: 'Butter Naan', description: 'Traditional tandoor-fired soft bread with rich Indian butter', price: 50, category: 'Tandoori Breads & Rice', dietType: 'veg', available: true },
      { id: 'item-10', name: 'Gulab Jamun', description: 'Classic milk-solid dumplings soaked in rose-cardamom syrup', price: 110, category: 'Desserts & Sweets', dietType: 'veg', available: true },
      { id: 'item-11', name: 'Rasmalai', description: 'Soft cottage cheese patties immersed in saffron-infused milk', price: 140, category: 'Desserts & Sweets', dietType: 'veg', available: true },
      { id: 'item-12', name: 'Mango Lassi', description: 'Traditional chilled yogurt smoothie blended with Alphonso mango pulp', price: 90, category: 'Beverages & Refreshments', dietType: 'veg', available: true },
      { id: 'item-13', name: 'Masala Chai', description: 'Steaming Indian spiced tea brewed with ginger and cardamom', price: 40, category: 'Beverages & Refreshments', dietType: 'veg', available: true },
    ];
  }

  // Resolve contact phone (prefer explicit public contact from profile)
  const contactsList = Array.isArray(canonicalProfile?.contacts) ? canonicalProfile.contacts : [];
  const explicitPublicPhone = contactsList.find(c => c.public && c.number)?.number;
  // If canonical profile exists with configured contacts, strictly respect it (never leak hidden numbers).
  const primaryPublicPhone = explicitPublicPhone
    || (canonicalProfile ? null : ((client.review_flags && client.review_flags.phone_privacy_pending) ? null : (client.phone || null)));

  // Resolve links
  const linksList = Array.isArray(canonicalProfile?.links) ? canonicalProfile.links : [];
  const igLink = linksList.find(l => l.type === 'instagram' && !l.paused)?.value || client.instagram;
  const fbLink = linksList.find(l => l.type === 'facebook' && !l.paused)?.value || client.facebook;
  const webLink = linksList.find(l => l.type === 'website' && !l.paused)?.value || client.website;

  const result = {
    isExpired: false,
    restaurant: {
      name: canonicalProfile?.display_name || appearance.restaurant_display_name || client.business_name,
      tagline: canonicalProfile?.tagline || appearance.tagline || client.tagline || '',
      category: client.category,
      phone: primaryPublicPhone,
      address: canonicalProfile?.address?.line || client.address,
      city: canonicalProfile?.address?.city || client.city,
      state: canonicalProfile?.address?.state || client.state,
      pincode: canonicalProfile?.address?.pincode || '',
      landmark: canonicalProfile?.address?.landmark || '',
      cuisine: canonicalProfile?.cuisine_tags?.join(', ') || client.cuisine,
      cuisineTags: canonicalProfile?.cuisine_tags || (client.cuisine ? client.cuisine.split(',').map(s => s.trim()).filter(Boolean) : []),
      openingHours: canonicalProfile?.hours?.note || client.opening_hours,
      weeklyHours: canonicalProfile?.hours?.weekly || null,
      hoursExceptions: canonicalProfile?.hours?.exceptions || [],
      lastOrderMinutes: canonicalProfile?.hours?.lastOrderMinutes || 0,
      instagram: igLink,
      facebook: fbLink,
      website: webLink,
      logo: appearance.logo || client.logo_url || '',
      story: canonicalProfile?.story || '',
      establishedYear: canonicalProfile?.established_year || null,
      dietDeclaration: canonicalProfile?.diet_declaration || null,
      highlights: canonicalProfile?.highlights || [],
      payments: canonicalProfile?.payments || [],
      priceNote: canonicalProfile?.price_note || '',
      serviceChargeNote: canonicalProfile?.service_charge_note || '',
      fssai: canonicalProfile?.fssai || '',
      maps: canonicalProfile?.maps || {},
      contacts: contactsList.filter(c => c.public),
      links: linksList.filter(l => !l.paused),
      reservations: canonicalProfile?.reservations || {},
      i18n: canonicalProfile?.i18n || {},
    },
    orderingEnabled: Boolean(authorization.active && authorization.entitlements.includes('customer_ordering')),
    orderingSettings,
    announcement,
    offers,
    menuFeatures,
    templateId: appearance.template_id || 'royal-maharaja',
    theme: appearance.theme_published || null,
    googleReviews,
    categories,
    items,
  };


  publicMenuCache.set(tenantId, {
    data: result,
    expiresAt: Date.now() + PUBLIC_MENU_CACHE_TTL_MS,
  });

  // Store in Upstash Redis (TTL: 24 hours)
  await setCachedMenu(tenantId, result, 86400);

  return result;
}


const orderIpRateLimits = new Map();
const orderRestaurantRateLimits = new Map();

function checkOrderRateLimits(clientIp, tenantId) {
  const now = Date.now();
  const windowMs = 60 * 1000;

  const ipEntry = orderIpRateLimits.get(clientIp) || { count: 0, resetAt: now + windowMs };
  if (now > ipEntry.resetAt) {
    ipEntry.count = 0;
    ipEntry.resetAt = now + windowMs;
  }
  if (ipEntry.count >= 30) {
    throw apiError(429, 'Order rate limit exceeded. Please wait a moment before trying again.');
  }

  const restEntry = orderRestaurantRateLimits.get(tenantId) || { count: 0, resetAt: now + windowMs };
  if (now > restEntry.resetAt) {
    restEntry.count = 0;
    restEntry.resetAt = now + windowMs;
  }
  if (restEntry.count >= 60) {
    throw apiError(429, 'Restaurant order queue is busy. Please wait a moment before trying again.');
  }

  ipEntry.count++;
  restEntry.count++;
  orderIpRateLimits.set(clientIp, ipEntry);
  orderRestaurantRateLimits.set(tenantId, restEntry);
}

export default async function publicRoutes(request, response, url) {
  if (!url.pathname.startsWith('/api/public/')) return false;

  // Resolve by Menu Slug
  const publicMenuMatch = url.pathname.match(
    /^\/api\/public\/menus\/([^/]+)$/
  );
  if (request.method === 'GET' && publicMenuMatch) {
    const slug = decodeURIComponent(publicMenuMatch[1]);
    const clientRes = await pool.query('SELECT id, menu_slug FROM clients WHERE menu_slug = $1 OR public_id = $1 OR id = $1', [slug]);
    let client = clientRes.rows[0];
    let redirectedFromHistory = false;

    // Check menu_slug_history if not found (Decision ★5: 30-day slug changes redirect permanently)
    if (!client) {
      try {
        const histRes = await pool.query(
          'SELECT c.id, c.menu_slug FROM menu_slug_history h JOIN clients c ON c.id = h.tenant_id WHERE h.slug = $1',
          [slug]
        );
        if (histRes.rows.length > 0) {
          client = histRes.rows[0];
          redirectedFromHistory = true;
        }
      } catch (err) {
        // Table might be pending migration
      }
    }

    if (!client) {
      throw apiError(404, 'This menu was not found.');
    }

    const data = await getFullPublicMenuData(client.id);
    if (!data) throw apiError(404, 'This menu is unavailable.');
    if (data.isExpired) {
      sendJson(response, 403, { error: 'SUBSCRIPTION_EXPIRED', message: 'This restaurant menu is currently unavailable due to subscription expiry.' });
      return true;
    }

    const payload = applyLiveFlags(data, new Date(), istDateString());
    if (redirectedFromHistory && client.menu_slug) {
      payload.redirectToSlug = client.menu_slug;
    }
    sendJson(response, 200, payload);
    return true;
  }

  // Public Link Click Tracking Endpoint (Blueprint Phase 4 / 5)
  const trackClickMatch = url.pathname.match(
    /^\/api\/public\/menus\/([^/]+)\/track-click$/
  );
  if (request.method === 'POST' && trackClickMatch) {
    const slug = decodeURIComponent(trackClickMatch[1]);
    const body = await readJson(request);
    const ALLOWED_KINDS = ['instagram', 'whatsapp', 'call', 'directions', 'website', 'share', 'zomato', 'swiggy', 'custom'];
    const kind = String(body.kind || '').toLowerCase().trim();
    if (!ALLOWED_KINDS.includes(kind)) {
      throw apiError(400, 'Invalid click kind.');
    }

    const clientRes = await pool.query('SELECT id FROM clients WHERE menu_slug = $1 OR public_id = $1 OR id = $1', [slug]);
    let tenantId = clientRes.rows[0]?.id;
    if (!tenantId) {
      try {
        const histRes = await pool.query(
          'SELECT tenant_id FROM menu_slug_history WHERE slug = $1',
          [slug]
        );
        tenantId = histRes.rows[0]?.tenant_id;
      } catch (err) {}
    }

    if (tenantId) {
      try {
        await pool.query(
          `INSERT INTO link_clicks_daily (tenant_id, day, kind, count)
           VALUES ($1, CURRENT_DATE, $2, 1)
           ON CONFLICT (tenant_id, day, kind)
           DO UPDATE SET count = link_clicks_daily.count + 1`,
          [tenantId, kind]
        );
      } catch (err) {}
    }

    sendJson(response, 200, { success: true });
    return true;
  }

  // Resolve by QR Code ID
  const publicQrMatch = url.pathname.match(
    /^\/api\/public\/qr\/([^/]+)$/
  );
  if (request.method === 'GET' && publicQrMatch) {
    const qrId = decodeURIComponent(publicQrMatch[1]);
    const qrRes = await pool.query(
      'SELECT q.tenant_id, q.is_active, c.menu_slug FROM qr_codes q JOIN clients c ON c.id = q.tenant_id WHERE q.qr_id = $1',
      [qrId]
    );
    const qr = qrRes.rows[0];
    if (!qr || !qr.is_active) {
      throw apiError(404, 'This QR code is inactive or invalid.');
    }

    const data = await getFullPublicMenuData(qr.tenant_id);
    if (!data) throw apiError(404, 'This menu is unavailable.');
    if (data.isExpired) {
      sendJson(response, 403, { error: 'SUBSCRIPTION_EXPIRED', message: 'This restaurant menu is currently unavailable due to subscription expiry.' });
      return true;
    }

    sendJson(response, 200, applyLiveFlags({ ...data, menuSlug: qr.menu_slug }, new Date(), istDateString()));
    return true;
  }

  // Contact Form Submission
  if (request.method === 'POST' && url.pathname === '/api/public/contact') {
    const address = getClientIp(request);
    const now = Date.now();
    const hourAgo = now - 3600 * 1000;
    let limitData = contactRateLimits.get(address) || { count: 0, firstRequest: now };
    
    if (limitData.firstRequest < hourAgo) {
      limitData = { count: 0, firstRequest: now };
    }
    if (limitData.count >= 3) {
      throw apiError(429, 'Too many requests. Try again later.');
    }
    
    const input = await readJson(request);
    
    const name = String(input.name || '').trim();
    const email = String(input.email || '').trim();
    const phone = String(input.phone || '').trim();
    const message = String(input.message || '').trim();
    
    if (!name || !email || !message) {
      throw apiError(400, 'Name, email, and message are required.');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw apiError(400, 'Invalid email format.');
    }
    
    await pool.query(
      'INSERT INTO contact_leads (name, email, phone, message, ip_address) VALUES ($1, $2, $3, $4, $5)',
      [name, email, phone, message, address]
    );
    
    limitData.count++;
    contactRateLimits.set(address, limitData);
    
    sendJson(response, 200, { success: true });
    return true;
  }
  
  const orderMatch = url.pathname.match(/^\/api\/public\/menus\/([^/]+)\/orders$/);
  const qrOrderMatch = url.pathname.match(/^\/api\/public\/qr\/([^/]+)\/orders$/);
  if (request.method === 'POST' && (orderMatch || qrOrderMatch)) {
    const slug = orderMatch ? decodeURIComponent(orderMatch[1]) : null;
    
    // 1. Get client by slug, verify premium plan AND active subscription
    const clientRes = qrOrderMatch
      ? await pool.query('SELECT c.id FROM qr_codes q JOIN clients c ON c.id = q.tenant_id WHERE q.qr_id = $1 AND q.is_active = true', [decodeURIComponent(qrOrderMatch[1])])
      : await pool.query('SELECT id FROM clients WHERE menu_slug = $1', [slug]);
    let client = clientRes.rows[0];
    if (!client) {
      throw apiError(404, 'Menu not found.');
    }
    const clientIp = getClientIp(request);
    checkOrderRateLimits(clientIp, client.id);
    
    const authorization = await resolveTenantAuthorization({ id: null, tenantId: client.id });
    if (!authorization.active) {
      throw apiError(403, 'This restaurant\'s subscription has expired. Ordering is unavailable.');
    }
    requireEntitlement(authorization, 'customer_ordering', 'Online ordering is not available on this plan. Please upgrade to Premium.');
    
    const input = await readJson(request);

    // Idempotency check: prevent duplicate submissions on retries or rapid double-taps
    const rawIdempotencyKey = String(
      request.headers['x-idempotency-key'] ||
      request.headers['idempotency-key'] ||
      input.idempotencyKey ||
      ''
    ).trim();
    let idempotencyKey = rawIdempotencyKey ? rawIdempotencyKey.slice(0, 128) : null;

    if (!idempotencyKey) {
      // Deterministic synthetic fingerprint for rapid double-tap deduplication (15-second sliding window)
      const itemsFingerprint = Array.isArray(input.items) 
        ? input.items.map(i => `${i.id}:${i.quantity}:${i.variantId || i.variant || ''}`).sort().join('|')
        : '';
      const windowId = Math.floor(Date.now() / 15000); // 15-second time bucket
      const customerIdentifier = String(input.customerPhone || input.tableNumber || input.customerName || 'guest').slice(0, 50);
      idempotencyKey = `auto-idem-${client.id}-${customerIdentifier}-${Buffer.from(itemsFingerprint).toString('base64url').slice(0, 32)}-${windowId}`;
    }

    if (idempotencyKey) {
      const existingRes = await pool.query(`
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
          round_number as "roundNumber",
          parent_order_id as "parentOrderId",
          rejection_reason as "rejectionReason",
          tracking_token as "trackingToken", estimated_time_minutes as "estimatedTimeMinutes",
          estimated_delivery_time as "estimatedDeliveryTime",
          created_at as time
        FROM customer_orders
        WHERE tenant_id = $1 AND idempotency_key = $2
      `, [client.id, idempotencyKey]);

      if (existingRes.rows[0]) {
        const existingOrder = existingRes.rows[0];
        existingOrder.total = parseFloat(existingOrder.total);
        sendJson(response, 200, existingOrder);
        return true;
      }
    }

    // Normalise order type: Decision ★4 supports DINE_IN, TAKEAWAY, and DELIVERY as distinct owner switches
    const rawType = String(input.orderType || input.type || 'DINE_IN').toUpperCase();
    const orderType = ['DELIVERY', 'TAKEAWAY'].includes(rawType) ? rawType : 'DINE_IN';

    // Verify against restaurant's ordering_settings switches
    try {
      const osRes = await pool.query('SELECT * FROM ordering_settings WHERE tenant_id = $1', [client.id]);
      if (osRes.rows.length > 0) {
        const os = osRes.rows[0];
        if (!os.accepting_orders) {
          throw apiError(400, 'This restaurant is currently not accepting online orders.');
        }
        if (orderType === 'DINE_IN' && !os.dine_in_enabled) {
          throw apiError(400, 'Dine-in table ordering is currently disabled by the restaurant.');
        }
        if (orderType === 'TAKEAWAY' && !os.takeaway_enabled) {
          throw apiError(400, 'Takeaway pickup ordering is currently disabled by the restaurant.');
        }
        if (orderType === 'DELIVERY' && !os.delivery_enabled) {
          throw apiError(400, 'Delivery ordering is currently disabled by the restaurant.');
        }
      }
    } catch (osErr) {
      if (osErr.status) throw osErr;
    }

    // Customer name & phone handling
    const rawCustomerName = String(input.customerName || input.name || '').trim();
    const customerName = rawCustomerName || (orderType === 'DINE_IN' ? 'Guest' : '');
    if (!customerName || customerName.length < 2) {
      throw apiError(400, 'Customer name is required (at least 2 characters).');
    }

    const rawCustomerPhone = String(input.customerPhone || input.phone || '').trim();
    let customerPhone = null;
    if (orderType === 'DELIVERY') {
      const cleanDigits = rawCustomerPhone.replace(/\D/g, '');
      if (!rawCustomerPhone || cleanDigits.length < 10) {
        throw apiError(400, 'A valid 10-digit mobile number is required for delivery.');
      }
      customerPhone = cleanDigits.slice(-10);
    } else if (rawCustomerPhone) {
      const cleanDigits = rawCustomerPhone.replace(/\D/g, '');
      if (cleanDigits.length < 7) {
        throw apiError(400, 'Please enter a valid phone number.');
      }
      customerPhone = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;
    }

    let tableNumber = null;
    let deliveryAddress = null;
    let deliveryLandmark = null;
    let deliveryCity = null;

    if (orderType === 'DINE_IN') {
      tableNumber = String(input.tableNumber || '').trim();
      if (!tableNumber) {
        throw apiError(400, 'Table number is required for dine-in orders.');
      }
    } else if (orderType === 'TAKEAWAY') {
      // Takeaway does not require an address or table, but requires phone & name
      if (!customerPhone) {
        throw apiError(400, 'A contact mobile number is required for takeaway orders so we can notify you when ready.');
      }
      tableNumber = 'TAKEAWAY';
    } else {
      deliveryAddress = String(input.deliveryAddress || input.address || '').trim();
      if (!deliveryAddress || deliveryAddress.length < 5) {
        throw apiError(400, 'Full delivery address is required (at least 5 characters).');
      }
      deliveryLandmark = String(input.deliveryLandmark || input.landmark || '').trim() || null;
      deliveryCity = String(input.deliveryCity || input.city || '').trim() || null;
    }

    const notes = String(input.notes || input.instructions || '').trim() || null;
    const rawSessionId = input.sessionId ? String(input.sessionId).trim() : null;
    const sessionId = rawSessionId && rawSessionId.length <= 100 ? rawSessionId : `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const roundNumber = typeof input.roundNumber === 'number' && input.roundNumber > 0 ? Math.min(input.roundNumber, 20) : 1;
    const parentOrderId = input.parentOrderId ? String(input.parentOrderId).trim() : null;
    
    if (!Array.isArray(input.items) || input.items.length === 0) {
      throw apiError(400, 'Order items are required.');
    }
    if (input.items.length > 50) {
      throw apiError(400, 'Too many unique items in order (maximum 50).');
    }
    
    // Fetch real prices, variants, and addon options from database
    const menuItemsRes = await pool.query(
      "SELECT i.id, i.price, i.half_price, i.full_price, i.name, c.schedule FROM menu_items i LEFT JOIN menu_categories c ON c.id = i.category_id WHERE i.tenant_id = $1 AND i.is_available = true AND COALESCE(i.metadata->>'soldOutOn', '') <> $2",
      [client.id, istDateString()]
    );
    const variantsRes = await pool.query(
      'SELECT id, menu_item_id, name, price FROM menu_item_variants WHERE tenant_id = $1 AND is_available = true',
      [client.id]
    );
    const addonOptionsRes = await pool.query(
      `SELECT o.id, o.addon_group_id, o.name, o.price, o.is_available, g.menu_item_id
       FROM menu_item_addon_options o
       JOIN menu_item_addon_groups g ON o.addon_group_id = g.id
       WHERE o.tenant_id = $1`,
      [client.id]
    );

    const itemMap = new Map(menuItemsRes.rows.map(r => [
      r.id,
      {
        id: r.id,
        name: r.name,
        schedule: r.schedule || null,
        price: parseFloat(r.price || '0'),
        halfPrice: r.half_price !== null && r.half_price !== undefined ? parseFloat(r.half_price) : null,
        fullPrice: r.full_price !== null && r.full_price !== undefined ? parseFloat(r.full_price) : null,
      }
    ]));

    const variantsByItem = new Map();
    for (const v of variantsRes.rows) {
      const list = variantsByItem.get(v.menu_item_id) || [];
      list.push({
        id: v.id,
        name: v.name,
        price: parseFloat(v.price || '0'),
      });
      variantsByItem.set(v.menu_item_id, list);
    }

    const addonOptionMap = new Map(addonOptionsRes.rows.map(o => [
      o.id,
      {
        id: o.id,
        groupId: o.addon_group_id,
        name: o.name,
        price: parseFloat(o.price || '0'),
        isAvailable: Boolean(o.is_available),
        menuItemId: o.menu_item_id,
      }
    ]));

    let calculatedTotal = 0;
    let totalOrderQuantity = 0;
    const validatedItems = [];

    for (const item of input.items) {
      if (!item || !item.id) throw apiError(400, 'Invalid item in order.');

      const rawQty = typeof item.quantity === 'string' && /^\d+$/.test(item.quantity.trim())
        ? parseInt(item.quantity.trim(), 10)
        : (typeof item.quantity === 'number' && Number.isInteger(item.quantity) ? item.quantity : null);

      if (rawQty === null || rawQty <= 0) {
        throw apiError(400, `Invalid quantity for item: ${item.name || item.id}. Quantity must be a positive integer.`);
      }
      if (rawQty > 50) {
        throw apiError(400, `Quantity for item: ${item.name || item.id} exceeds maximum limit of 50.`);
      }
      const qty = rawQty;

      totalOrderQuantity += qty;
      if (totalOrderQuantity > 200) {
        throw apiError(400, 'Total order quantity cannot exceed 200 items.');
      }
      if (!itemMap.has(item.id)) {
        throw apiError(400, `Item not found or unavailable: ${item.name || item.id}`);
      }
      const dbItem = itemMap.get(item.id);
      if (!isScheduleActive(dbItem.schedule)) {
        throw apiError(400, `${dbItem.name} is only available ${scheduleLabel(dbItem.schedule)}.`);
      }
      let unitPrice = dbItem.price;
      const variantName = item.variant ? String(item.variant).trim() : null;

      if (variantName) {
        const itemVariants = variantsByItem.get(item.id) || [];
        const matchedDbVariant = itemVariants.find(v =>
          v.id === item.variantId ||
          v.name.toLowerCase() === variantName.toLowerCase() ||
          variantName.toLowerCase().startsWith(v.name.toLowerCase()) ||
          v.name.toLowerCase().startsWith(variantName.toLowerCase())
        );

        if (matchedDbVariant) {
          unitPrice = matchedDbVariant.price;
        } else if (/half/i.test(variantName) && dbItem.halfPrice !== null && !isNaN(dbItem.halfPrice)) {
          unitPrice = dbItem.halfPrice;
        } else if (/full/i.test(variantName) && dbItem.fullPrice !== null && !isNaN(dbItem.fullPrice)) {
          unitPrice = dbItem.fullPrice;
        } else {
          throw apiError(400, `Invalid variant "${variantName}" selected for item: ${dbItem.name}`);
        }
      }

      // Authoritative server-side add-on validation and calculation
      const validatedAddons = [];
      let itemAddonTotal = 0;
      const rawAddons = Array.isArray(item.addons) ? item.addons : (Array.isArray(item.selectedAddons) ? item.selectedAddons : []);

      for (const addonRef of rawAddons) {
        const addonId = typeof addonRef === 'string' ? addonRef : (addonRef && addonRef.id ? String(addonRef.id) : null);
        if (!addonId) {
          throw apiError(400, `Invalid addon selected for item: ${dbItem.name}`);
        }
        const dbAddon = addonOptionMap.get(addonId);
        if (!dbAddon) {
          throw apiError(400, `Addon "${addonId}" not found for this restaurant.`);
        }
        if (!dbAddon.isAvailable) {
          throw apiError(400, `Addon "${dbAddon.name}" is currently unavailable.`);
        }
        if (dbAddon.menuItemId && dbAddon.menuItemId !== item.id) {
          throw apiError(400, `Addon "${dbAddon.name}" does not belong to item "${dbItem.name}".`);
        }

        itemAddonTotal += dbAddon.price;
        validatedAddons.push({
          id: dbAddon.id,
          name: dbAddon.name,
          price: dbAddon.price,
        });
      }

      const lineItemUnitPrice = unitPrice + itemAddonTotal;
      calculatedTotal += lineItemUnitPrice * qty;

      validatedItems.push({
        id: item.id,
        name: dbItem.name,
        variant: variantName || undefined,
        price: unitPrice,
        addons: validatedAddons.length > 0 ? validatedAddons : undefined,
        addonTotal: itemAddonTotal > 0 ? itemAddonTotal : undefined,
        quantity: qty,
      });
    }
    
    if (orderType === 'DELIVERY') {
      try {
        const minRes = await pool.query('SELECT delivery_min_order FROM ordering_settings WHERE tenant_id = $1', [client.id]);
        const minAmt = Number(minRes.rows[0]?.delivery_min_order || 0);
        if (minAmt > 0 && calculatedTotal < minAmt) {
          throw apiError(400, `Minimum order amount for delivery is ₹${minAmt}. Please add more items.`);
        }
      } catch (minErr) {
        if (minErr.status) throw minErr;
      }
    }

    // Generate order ID and cryptographically random tracking token
    const { randomBytes } = await import('node:crypto');
    const orderId = randomBytes(4).toString('hex').toUpperCase();
    const trackingToken = randomBytes(16).toString('hex');
    
    const res = await pool.query(
      `INSERT INTO customer_orders (
         id, tenant_id, order_type, table_number, customer_name, customer_phone,
         delivery_address, delivery_landmark, delivery_city, notes, items, total, status,
         idempotency_key, tracking_token, session_id, round_number, parent_order_id
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'NEW', $13, $14, $15, $16, $17)
       ON CONFLICT (tenant_id, idempotency_key) WHERE idempotency_key IS NOT NULL
       DO NOTHING
       RETURNING 
         id, 
         order_type as "orderType",
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
         round_number as "roundNumber",
         parent_order_id as "parentOrderId",
         tracking_token as "trackingToken",
         estimated_time_minutes as "estimatedTimeMinutes",
         estimated_delivery_time as "estimatedDeliveryTime",
         created_at as time`,
      [
        orderId, 
        client.id, 
        orderType, 
        tableNumber, 
        customerName, 
        customerPhone, 
        deliveryAddress, 
        deliveryLandmark, 
        deliveryCity, 
        notes, 
        JSON.stringify(validatedItems), 
        calculatedTotal,
        idempotencyKey,
        trackingToken,
        sessionId,
        roundNumber,
        parentOrderId
      ]
    );
    
    let orderToReturn = res.rows[0];
    let statusCode = 201;

    // If an insert conflict occurred because a concurrent worker inserted with the same idempotency key:
    if (!orderToReturn && idempotencyKey) {
      const existingRes = await pool.query(`
        SELECT 
          id, 
          order_type as "orderType",
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
          round_number as "roundNumber",
          parent_order_id as "parentOrderId",
          rejection_reason as "rejectionReason",
          tracking_token as "trackingToken", estimated_time_minutes as "estimatedTimeMinutes",
          estimated_delivery_time as "estimatedDeliveryTime",
          created_at as time
        FROM customer_orders
        WHERE tenant_id = $1 AND idempotency_key = $2
      `, [client.id, idempotencyKey]);
      orderToReturn = existingRes.rows[0];
      statusCode = 200;
    }

    if (!orderToReturn) {
      throw apiError(500, 'Failed to create or retrieve order.');
    }

    orderToReturn.total = parseFloat(orderToReturn.total);

    // Enrich order with previous round items and running session total for instant real-time kitchen clarity
    let previousRoundItems = [];
    let sessionTotal = orderToReturn.total;
    if (orderToReturn.sessionId) {
      try {
        const prevRes = await pool.query(`
          SELECT id, items, total, COALESCE(round_number, 1) as "roundNumber"
          FROM customer_orders
          WHERE tenant_id = $1 AND session_id = $2 AND id != $3
          ORDER BY created_at ASC
        `, [client.id, orderToReturn.sessionId, orderToReturn.id]);

        for (const po of prevRes.rows) {
          const parsedItems = typeof po.items === 'string' ? JSON.parse(po.items) : (po.items || []);
          if (Array.isArray(parsedItems)) {
            previousRoundItems.push(...parsedItems.map(it => ({ ...it, roundNumber: po.roundNumber, orderId: po.id })));
          }
          sessionTotal += parseFloat(po.total || 0);
        }
      } catch (prevErr) {
        console.warn('[public.js] Failed to query previous session orders:', prevErr.message);
      }
    }
    orderToReturn.previousRoundItems = previousRoundItems;
    orderToReturn.sessionTotal = Math.round(sessionTotal * 100) / 100;

    if (statusCode === 201) {
      try {
        broadcastOrderEvent(client.id, 'new_order', orderToReturn);
      } catch (broadcastErr) {
        console.warn('[orderStream] Failed to broadcast new_order:', broadcastErr.message);
      }
    }
    sendJson(response, statusCode, orderToReturn);
    return true;
  }

  // Customer Order Status Tracking Endpoint (Privacy Protected)
  const customerOrderStatusMatch = url.pathname.match(/^\/api\/public\/orders\/([^/]+)$/);
  if (request.method === 'GET' && customerOrderStatusMatch) {
    const orderId = decodeURIComponent(customerOrderStatusMatch[1]);
    const res = await pool.query(`
      SELECT
        o.id,
        o.order_type as "orderType",
        o.table_number as "tableNumber",
        o.customer_name as "customerName",
        o.customer_phone as "customerPhone",
        o.delivery_address as "deliveryAddress",
        o.delivery_landmark as "deliveryLandmark",
        o.delivery_city as "deliveryCity",
        o.notes,
        o.items,
        o.total,
        o.status,
        o.session_id as "sessionId",
        o.round_number as "roundNumber",
        o.parent_order_id as "parentOrderId",
        o.rejection_reason as "rejectionReason",
        o.tracking_token as "trackingToken",
        o.estimated_time_minutes as "estimatedTimeMinutes",
        o.estimated_delivery_time as "estimatedDeliveryTime",
        o.created_at as time,
        c.business_name as "restaurantName",
        c.phone as "restaurantPhone"
      FROM customer_orders o
      JOIN clients c ON c.id = o.tenant_id
      WHERE o.id = $1
    `, [orderId]);

    if (!res.rows[0]) throw apiError(404, 'Order not found.');
    const order = res.rows[0];
    order.total = parseFloat(order.total);

    // Phase 2 Rule 8: Public tracking privacy protection
    const tokenParam = url.searchParams.get('token') || request.headers['x-tracking-token'];
    const isAuthorized = Boolean(order.trackingToken && tokenParam && String(tokenParam).trim() === order.trackingToken);

    if (!isAuthorized) {
      // Mask PII if request does not provide the secret order tracking token
      if (order.customerPhone) {
        const digits = order.customerPhone.replace(/\D/g, '');
        order.customerPhone = digits.length >= 4 
          ? `${digits.slice(0, 2)}******${digits.slice(-2)}` 
          : '******';
      }
      if (order.deliveryAddress) {
        order.deliveryAddress = 'Address hidden for privacy';
      }
      order.deliveryLandmark = null;
      order.notes = null;
      delete order.trackingToken;
    }

    sendJson(response, 200, order);
    return true;
  }

  // Dine-In Table Service Request (Call Waiter, Request Water, Request Bill)
  // Anonymous traffic counter: one aggregated row per tenant per IST hour, nothing per-visitor.
  const menuHitMatch = url.pathname.match(/^\/api\/public\/menu\/([^/]+)\/hit$/);
  if (request.method === 'POST' && menuHitMatch) {
    // Always answer 204 so the beacon never surfaces an error to a diner; drop bots and floods silently.
    if (isBotAgent(request.headers['user-agent']) || !allowHit(menuHitRateLimits, getClientIp(request))) {
      response.writeHead(204);
      response.end();
      return true;
    }
    const slug = decodeURIComponent(menuHitMatch[1]);
    const input = await readJson(request).catch(() => ({}));
    const clientRes = await pool.query("SELECT id FROM clients WHERE menu_slug = $1 AND LOWER(status) = 'active'", [slug]);
    if (clientRes.rows[0]) {
      await recordMenuHit(pool, clientRes.rows[0].id, input?.source === 'qr' ? 'qr' : 'direct');
    }
    response.writeHead(204);
    response.end();
    return true;
  }

  // Private guest feedback: rating + optional comment, visible only to the restaurant.
  const feedbackMatch = url.pathname.match(/^\/api\/public\/menu\/([^/]+)\/feedback$/);
  if (request.method === 'POST' && feedbackMatch) {
    if (!allowHit(feedbackRateLimits, getClientIp(request), Date.now(), 10)) {
      throw apiError(429, 'Too many feedback submissions. Please try again later.');
    }
    const slug = decodeURIComponent(feedbackMatch[1]);
    const clientRes = await pool.query("SELECT id FROM clients WHERE menu_slug = $1 AND LOWER(status) = 'active'", [slug]);
    if (!clientRes.rows[0]) throw apiError(404, 'Restaurant menu not found.');
    const feedback = validateFeedback(await readJson(request));
    if (feedback.error) throw apiError(400, feedback.error);
    await saveFeedback(pool, clientRes.rows[0].id, feedback);
    sendJson(response, 201, { success: true });
    return true;
  }

  const serviceReqMatch = url.pathname.match(/^\/api\/public\/menu\/([^/]+)\/service-request$/);
  if (request.method === 'POST' && serviceReqMatch) {
    const slug = decodeURIComponent(serviceReqMatch[1]);
    const clientRes = await pool.query(
      `SELECT c.id, c.status, c.business_name as "businessName", a.accent_configuration as "accentConfiguration"
         FROM clients c LEFT JOIN appearance_settings a ON a.tenant_id = c.id
        WHERE c.menu_slug = $1`,
      [slug]
    );
    const client = clientRes.rows[0];
    if (!client || client.status.toLowerCase() !== 'active') {
      throw apiError(404, 'Restaurant menu not found.');
    }

    // Owner-controlled: the whole feature, and which of the three request types, are both
    // configurable from Settings → Menu Features (defaults match the feature's original
    // hardcoded behaviour, so an untouched toggle changes nothing for an existing client).
    const menuFeatures = resolveMenuFeatures(client.accentConfiguration, null);
    if (!menuFeatures.callWaiter.enabled) {
      throw apiError(403, 'Table service requests are turned off for this restaurant.');
    }

    const input = await readJson(request);
    const rawTable = String(input.tableNumber || input.table || '').trim();
    if (!rawTable) {
      throw apiError(400, 'Table number is required for dine-in service request.');
    }

    const requestType = String(input.requestType || 'WAITER').toUpperCase();
    if (!menuFeatures.callWaiter.types.includes(requestType)) {
      throw apiError(400, `Invalid request type. Allowed: ${menuFeatures.callWaiter.types.join(', ')}`);
    }

    const serviceEvent = {
      id: randomUUID(),
      tableNumber: rawTable,
      requestType,
      notes: input.notes ? String(input.notes).trim().slice(0, 100) : null,
      customerName: input.customerName ? String(input.customerName).trim().slice(0, 50) : 'Guest',
      time: new Date().toISOString()
    };

    // Persisted so a request survives even when no reception tab is open, and so the owner has a
    // history to review — the live broadcast below is unchanged and still fires immediately.
    try {
      await pool.query(
        'INSERT INTO service_requests (id, tenant_id, table_number, request_type, notes, customer_name) VALUES ($1, $2, $3, $4, $5, $6)',
        [serviceEvent.id, client.id, serviceEvent.tableNumber, serviceEvent.requestType, serviceEvent.notes, serviceEvent.customerName]
      );
    } catch (err) {
      console.warn('[service_requests] Failed to persist request:', err.message);
    }

    // Broadcast in real-time to active kitchen & cashier dashboards
    try {
      broadcastOrderEvent(client.id, 'service_request', serviceEvent);
    } catch (err) {
      console.warn('[orderStream] Failed to broadcast service_request event:', err.message);
    }

    sendJson(response, 200, { success: true, serviceEvent });
    return true;
  }
  
  return false;
}
