import { pool } from '../db.js';
import { apiError, sendJson, readJson, getClientIp } from '../utils.js';
import { resolveTenantAuthorization, requireEntitlement } from '../authorization.js';

const contactRateLimits = new Map();

async function getFullPublicMenuData(tenantId) {
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

  let categories = [];
  let items = [];

  if (menu) {
    const catRes = await pool.query(
      'SELECT * FROM menu_categories WHERE menu_id = $1 AND is_visible = true ORDER BY sort_order',
      [menu.id]
    );
    categories = catRes.rows.map(c => ({ id: c.id, name: c.name, order: c.sort_order }));

    const itemRes = await pool.query(
      'SELECT * FROM menu_items WHERE menu_id = $1 AND is_available = true ORDER BY sort_order',
      [menu.id]
    );
    items = itemRes.rows.map(i => {
      const cat = categories.find(c => c.id === i.category_id);
      return {
        id: i.id,
        name: i.name,
        description: i.description || '',
        price: parseFloat(i.price || '0'),
        category: cat ? cat.name : 'Other',
        dietType: i.diet_type || 'veg',
        available: i.is_available,
        image: i.image_url || '',
      };
    });
  }

  return {
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
    templateId: appearance.template_id || 'royal-maharaja',
    categories,
    items,
  };
}

export default async function publicRoutes(request, response, url) {
  if (!url.pathname.startsWith('/api/public/')) return false;

  // Resolve by Menu Slug
  const publicMenuMatch = url.pathname.match(
    /^\/api\/public\/menus\/([^/]+)$/
  );
  if (request.method === 'GET' && publicMenuMatch) {
    const slug = decodeURIComponent(publicMenuMatch[1]);
    const clientRes = await pool.query('SELECT id FROM clients WHERE menu_slug = $1', [slug]);
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
    
    // Fetch real prices from database
    const menuItemsRes = await pool.query('SELECT id, price, name FROM menu_items WHERE tenant_id = $1 AND is_available = true', [client.id]);
    const itemPrices = new Map(menuItemsRes.rows.map(r => [r.id, { price: parseFloat(r.price || '0'), name: r.name }]));
    
    let calculatedTotal = 0;
    const validatedItems = [];
    
    for (const item of input.items) {
      if (!item || !item.id) throw apiError(400, 'Invalid item in order.');
      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty <= 0 || qty > 100) {
        throw apiError(400, `Invalid quantity for item: ${item.name || item.id}`);
      }
      if (!itemPrices.has(item.id)) {
        throw apiError(400, `Item not found or unavailable: ${item.name || item.id}`);
      }
      const dbItem = itemPrices.get(item.id);
      calculatedTotal += dbItem.price * qty;
      validatedItems.push({
        id: item.id,
        name: dbItem.name,
        price: dbItem.price,
        quantity: qty
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
