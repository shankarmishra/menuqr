import { pool } from '../db.js';
import { apiError, sendJson, readJson, getClientIp } from '../utils.js';
import { resolveTenantAuthorization, requireEntitlement } from '../authorization.js';

const contactRateLimits = new Map();
const publicMenuCache = new Map();
const PUBLIC_MENU_CACHE_TTL_MS = 60 * 1000;

export function invalidatePublicMenuCache(tenantId) {
  if (!tenantId) return;
  publicMenuCache.delete(tenantId);
}

export function clearAllPublicMenuCaches() {
  publicMenuCache.clear();
}

export async function getFullPublicMenuData(tenantId) {
  const cached = publicMenuCache.get(tenantId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
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

  // 3. Fetch Appearance
  const appRes = await pool.query('SELECT * FROM appearance_settings WHERE tenant_id = $1', [tenantId]);
  const appearance = appRes.rows[0] || {};

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
    categories = catRes.rows.map(c => ({ id: c.id, name: c.name, order: c.sort_order }));

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
        image: i.image_url || '',
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

  const result = {
    isExpired: false,
    restaurant: {
      name: appearance.restaurant_display_name || client.business_name,
      tagline: appearance.tagline || client.tagline || '',
      category: client.category,
      phone: client.phone,
      address: client.address,
      city: client.city,
    },
    plan: authorization.planId,
    orderingEnabled: Boolean(authorization.active && authorization.entitlements.includes('customer_ordering')),
    templateId: appearance.template_id || 'royal-maharaja',
    googleReviews,
    categories,
    items,
  };


  publicMenuCache.set(tenantId, {
    data: result,
    expiresAt: Date.now() + PUBLIC_MENU_CACHE_TTL_MS,
  });

  return result;
}

export default async function publicRoutes(request, response, url) {
  if (!url.pathname.startsWith('/api/public/')) return false;

  // Resolve by Menu Slug
  const publicMenuMatch = url.pathname.match(
    /^\/api\/public\/menus\/([^/]+)$/
  );
  if (request.method === 'GET' && publicMenuMatch) {
    const slug = decodeURIComponent(publicMenuMatch[1]);
    const clientRes = await pool.query('SELECT id FROM clients WHERE menu_slug = $1 OR public_id = $1 OR id = $1', [slug]);
    const client = clientRes.rows[0];
    if (!client) {
      throw apiError(404, 'This menu was not found.');
    }

    const data = await getFullPublicMenuData(client.id);
    if (!data) throw apiError(404, 'This menu is unavailable.');
    if (data.isExpired) {
      sendJson(response, 403, { error: 'SUBSCRIPTION_EXPIRED', message: 'This restaurant menu is currently unavailable due to subscription expiry.' });
      return true;
    }

    sendJson(response, 200, data);
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

    data.menuSlug = qr.menu_slug;

    sendJson(response, 200, data);
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
    const client = clientRes.rows[0];
    if (!client) {
      throw apiError(404, 'Menu not found.');
    }
    
    const authorization = await resolveTenantAuthorization({ id: null, tenantId: client.id });
    if (!authorization.active) {
      throw apiError(403, 'This restaurant\'s subscription has expired. Ordering is unavailable.');
    }
    requireEntitlement(authorization, 'customer_ordering', 'Online ordering is not available on this plan. Please upgrade to Premium.');
    
    const input = await readJson(request);
    
    const tableNumber = String(input.tableNumber || '').trim();
    if (!tableNumber) {
      throw apiError(400, 'Table number is required.');
    }
    
    if (!Array.isArray(input.items) || input.items.length === 0) {
      throw apiError(400, 'Order items are required.');
    }
    
    // Fetch real prices and variants from database
    const menuItemsRes = await pool.query(
      'SELECT id, price, half_price, full_price, name FROM menu_items WHERE tenant_id = $1 AND is_available = true',
      [client.id]
    );
    const variantsRes = await pool.query(
      'SELECT id, menu_item_id, name, price FROM menu_item_variants WHERE tenant_id = $1 AND is_available = true',
      [client.id]
    );

    const itemMap = new Map(menuItemsRes.rows.map(r => [
      r.id,
      {
        id: r.id,
        name: r.name,
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

    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of input.items) {
      if (!item || !item.id) throw apiError(400, 'Invalid item in order.');
      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty <= 0 || qty > 100) {
        throw apiError(400, `Invalid quantity for item: ${item.name || item.id}`);
      }
      if (!itemMap.has(item.id)) {
        throw apiError(400, `Item not found or unavailable: ${item.name || item.id}`);
      }
      const dbItem = itemMap.get(item.id);
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
        }
      }

      calculatedTotal += unitPrice * qty;
      validatedItems.push({
        id: item.id,
        name: dbItem.name,
        variant: variantName || undefined,
        price: unitPrice,
        quantity: qty,
      });
    }
    
    // Generate a readable ID like MQR-4B9F2
    const { randomBytes } = await import('node:crypto');
    const orderId = randomBytes(4).toString('hex').toUpperCase();
    
    const res = await pool.query(
      `INSERT INTO customer_orders (id, tenant_id, table_number, items, total, status)
       VALUES ($1, $2, $3, $4, $5, 'NEW')
       RETURNING id, table_number as "tableNumber", items, total, status, created_at as time`,
      [orderId, client.id, tableNumber, JSON.stringify(validatedItems), calculatedTotal]
    );
    
    const newOrder = res.rows[0];
    newOrder.total = parseFloat(newOrder.total);
    sendJson(response, 201, newOrder);
    return true;
  }
  
  return false;
}
