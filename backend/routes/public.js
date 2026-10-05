import { pool } from '../db.js';
import { apiError, sendJson, readJson } from '../utils.js';

const contactRateLimits = new Map();

async function getFullPublicMenuData(tenantId) {
  // 1. Check subscription
  const subRes = await pool.query(
    'SELECT status, expires_at, plan_id FROM subscriptions WHERE tenant_id = $1',
    [tenantId]
  );
  const sub = subRes.rows[0];
  if (!sub || sub.status.toUpperCase() !== 'ACTIVE' || (sub.expires_at && new Date(sub.expires_at) < new Date())) {
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
    },
    plan: sub.plan_id,
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
    const qrRes = await pool.query('SELECT tenant_id, is_active FROM qr_codes WHERE qr_id = $1', [qrId]);
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

    sendJson(response, 200, data);
    return true;
  }

  // Contact Form Submission
  if (request.method === 'POST' && url.pathname === '/api/public/contact') {
    const address = request.socket.remoteAddress ?? 'unknown';
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
  
  return false;
}
