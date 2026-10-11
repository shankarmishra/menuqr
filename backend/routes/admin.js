import { randomUUID } from 'node:crypto';
import { pool, queryPortable } from '../db.js';
import { enforceSuperAdmin } from '../auth.js';
import { apiError, sendJson, readJson } from '../utils.js';
import { createNewUserNotification } from '../notifications.js';

const categories = new Set(['restaurants', 'dhabas', 'cafes']);

export function validateClient(input, id, createdAt) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw apiError(400, 'Client data is required.');
  }
  const businessName = String(input.businessName ?? '').trim();
  const menuSlug = String(input.menuSlug ?? '').trim().toLowerCase();
  if (!businessName) throw apiError(400, 'Business name is required.');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(menuSlug)) {
    throw apiError(400, 'Menu URL slug is invalid.');
  }
  if (!categories.has(input.category)) {
    throw apiError(400, 'Business category is invalid.');
  }
  if (!Array.isArray(input.menuItems) || input.menuItems.length > 300) {
    throw apiError(400, 'Menu items must be a list of up to 300 items.');
  }
  if (!Array.isArray(input.services)) {
    throw apiError(400, 'Services must be a list.');
  }

  const menuItems = input.menuItems.map((item) => {
    if (!item || typeof item !== 'object' || !String(item.name ?? '').trim()) {
      throw apiError(400, 'Each menu item needs a name.');
    }
    return {
      id: String(item.id || randomUUID()),
      name: String(item.name).trim(),
      description: String(item.description ?? ''),
      price: String(item.price ?? ''),
      pricingType: ['single', 'half-full', 'sizes'].includes(item.pricingType)
        ? item.pricingType
        : 'single',
      halfPrice: String(item.halfPrice ?? ''),
      fullPrice: String(item.fullPrice ?? ''),
      regPrice: String(item.regPrice ?? ''),
      medPrice: String(item.medPrice ?? ''),
      largePrice: String(item.largePrice ?? ''),
      category: String(item.category ?? 'Other'),
      dietType: ['veg', 'non-veg', 'vegan'].includes(item.dietType)
        ? item.dietType
        : 'veg',
      image: String(item.image ?? ''),
      available: Boolean(item.available),
    };
  });

  return {
    id,
    businessName,
    category: input.category,
    ownerName: String(input.ownerName ?? ''),
    email: String(input.email ?? ''),
    phone: String(input.phone ?? ''),
    website: String(input.website ?? ''),
    address: String(input.address ?? ''),
    city: String(input.city ?? ''),
    state: String(input.state ?? ''),
    postalCode: String(input.postalCode ?? ''),
    country: String(input.country ?? ''),
    menuSlug,
    plan: String(input.plan ?? 'Starter'),
    billingCycle: String(input.billingCycle ?? 'Monthly'),
    monthlyPrice: String(input.monthlyPrice ?? ''),
    openingHours: String(input.openingHours ?? ''),
    services: input.services.map(String),
    menuItems,
    heroImage: String(input.heroImage ?? ''),
    status: String(input.status ?? 'Active'),
    notes: String(input.notes ?? ''),
    createdAt,
  };
}

export default async function adminRoutes(request, response, url) {
  if (!url.pathname.startsWith('/api/admin/')) return false;
  
  await enforceSuperAdmin(request);

  if (request.method === 'GET' && url.pathname === '/api/admin/clients') {
    const res = await pool.query(`
      SELECT c.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', m.id,
                   'name', m.name,
                   'description', m.description,
                   'price', m.price,
                   'available', m.is_available,
                   'category', mc.name
                 )
               ) FILTER (WHERE m.id IS NOT NULL), '[]'
             ) as "menuItems"
      FROM clients c
      LEFT JOIN menu_items m ON m.tenant_id = c.id
      LEFT JOIN menu_categories mc ON m.category_id = mc.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    const records = res.rows.map(row => ({
      ...row,
      menuItems: row.menuItems,
      businessName: row.business_name,
      menuSlug: row.menu_slug,
      referenceCode: row.reference_code,
      businessType: row.business_type || row.category || 'restaurant',
      categoryOther: row.category_other,
      state: row.state,
      outletCount: row.outlet_count || 1,
      emailVerified: Boolean(row.email_verified),
      phoneVerified: Boolean(row.phone_verified),
    }));
    sendJson(response, 200, records);
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/admin/orders') {
    const res = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 200');
    sendJson(response, 200, res.rows);
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/admin/sticker-requests') {
    const requests = await pool.query(`
      SELECT r.id, r.tenant_id as "tenantId", c.business_name as "restaurantName",
        q.qr_id as "qrId", r.quantity, r.contact_name as "contactName",
        r.contact_phone as "contactPhone", r.contact_email as "contactEmail",
        r.delivery_address as "deliveryAddress", r.delivery_city as "deliveryCity",
        r.delivery_state as "deliveryState", r.delivery_postal_code as "deliveryPostalCode",
        r.notes, r.status, r.created_at as "createdAt", r.updated_at as "updatedAt"
      FROM sticker_requests r
      JOIN clients c ON c.id = r.tenant_id
      JOIN qr_codes q ON q.id = r.qr_code_id
      ORDER BY r.created_at DESC
    `);
    sendJson(response, 200, requests.rows);
    return true;
  }

  const stickerRequestMatch = url.pathname.match(/^\/api\/admin\/sticker-requests\/([^/]+)$/);
  if (request.method === 'PATCH' && stickerRequestMatch) {
    const requestId = decodeURIComponent(stickerRequestMatch[1]);
    const input = await readJson(request);
    const status = String(input.status || '').toUpperCase();
    const transitions = {
      PENDING: ['REVIEWING', 'CANCELLED'],
      REVIEWING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['IN_PRODUCTION', 'CANCELLED'],
      IN_PRODUCTION: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: [],
      CANCELLED: [],
    };
    if (!Object.hasOwn(transitions, status)) throw apiError(400, 'Choose a valid sticker request status.');
    const client = await pool.connect();
    let updated;
    try {
      await client.query('BEGIN');
      const current = await queryPortable(client,
        'SELECT r.status FROM sticker_requests r WHERE r.id = ? FOR UPDATE',
        [requestId]
      );
      const previousStatus = String(current.rows[0]?.status || '').toUpperCase();
      if (!current.rows[0]) throw apiError(404, 'Sticker request was not found.');
      if (!transitions[previousStatus]?.includes(status)) throw apiError(409, `This request cannot move from ${previousStatus} to ${status}.`);
      await queryPortable(client,
        'UPDATE sticker_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, requestId]
      );
      await queryPortable(client,
        'INSERT INTO sticker_request_events (id, request_id, previous_status, new_status, changed_by, note) VALUES (?, ?, ?, ?, NULL, ?)',
        [randomUUID(), requestId, previousStatus, status, `Admin: super-admin. ${String(input.note || '').trim().slice(0, 900)}`]
      );
      updated = await queryPortable(client,
        'SELECT id, status, updated_at as "updatedAt" FROM sticker_requests WHERE id = ?',
        [requestId]
      );
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    sendJson(response, 200, updated.rows[0]);
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/admin/payments') {
    const res = await pool.query('SELECT * FROM payments ORDER BY created_at DESC LIMIT 200');
    sendJson(response, 200, res.rows);
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/admin/notifications') {
    const notifications = (await pool.query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50')).rows;
    sendJson(response, 200, notifications);
    return true;
  }

  if (request.method === 'DELETE' && url.pathname === '/api/admin/notifications') {
    const result = await pool.query('DELETE FROM notifications');
    sendJson(response, 200, { deletedCount: result.rowCount });
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/admin/timeline') {
    const res = await pool.query(`
      SELECT 'CLIENT_JOINED' as type, id as entity_id, business_name as details, created_at as time 
      FROM clients
      UNION ALL
      SELECT 'ORDER_CREATED' as type, id as entity_id, 'Plan: ' || plan_id || ' - Amt: ' || amount as details, created_at as time 
      FROM orders
      UNION ALL
      SELECT 'PAYMENT_RECEIVED' as type, id as entity_id, 'Gateway: ' || gateway || ' - Status: ' || status as details, created_at as time 
      FROM payments
      ORDER BY time DESC
      LIMIT 50
    `);
    sendJson(response, 200, res.rows);
    return true;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SUPER ADMIN COUPON ENGINE ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────
  if (request.method === 'GET' && url.pathname === '/api/admin/coupons') {
    const planId = url.searchParams.get('planId')?.toUpperCase();
    const status = url.searchParams.get('status')?.toUpperCase();
    const search = url.searchParams.get('search')?.trim().toUpperCase();

    let query = `SELECT * FROM coupons WHERE 1=1`;
    const params = [];

    if (planId) {
      params.push(planId);
      query += ` AND plan_id = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND code LIKE $${params.length}`;
    }

    query += ` ORDER BY created_at DESC LIMIT 200`;

    const res = await pool.query(query, params);

    // Also get active counts per plan
    const countsRes = await pool.query(`
      SELECT plan_id, COUNT(*) as count
      FROM coupons
      WHERE status = 'AVAILABLE' AND (expires_at IS NULL OR expires_at > NOW())
      GROUP BY plan_id
    `);

    const activeCounts = { INTERMEDIATE: 0, PREMIUM: 0 };
    for (const r of countsRes.rows) {
      activeCounts[r.plan_id] = parseInt(r.count, 10);
    }

    sendJson(response, 200, { coupons: res.rows, activeCounts });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/admin/coupons/bulk-generate') {
    const input = await readJson(request);
    const { bulkGenerateCoupons } = await import('../coupons.js');
    const created = await bulkGenerateCoupons({
      planId: input.planId,
      discountPct: input.discountPct,
      count: input.count || 10,
      expiryDays: input.expiryDays || null,
      createdBy: 'SUPER_ADMIN',
    });
    sendJson(response, 201, { success: true, createdCount: created.length, coupons: created });
    return true;
  }

  const disableCouponMatch = url.pathname.match(/^\/api\/admin\/coupons\/([^/]+)\/disable$/);
  if (request.method === 'PATCH' && disableCouponMatch) {
    const couponId = decodeURIComponent(disableCouponMatch[1]);
    const { disableCoupon } = await import('../coupons.js');
    const disabled = await disableCoupon(couponId);
    sendJson(response, 200, { success: true, coupon: disabled });
    return true;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SUPER ADMIN GOOGLE REVIEWS ADD-ON OPERATIONS ENDPOINT
  // ─────────────────────────────────────────────────────────────────────────
  if (request.method === 'GET' && url.pathname === '/api/admin/addons/google-reviews') {
    const listRes = await pool.query(`
      SELECT
        e.id as "entitlementId",
        e.tenant_id as "tenantId",
        c.business_name as "businessName",
        c.menu_slug as "menuSlug",
        u.email as "ownerEmail",
        e.status as "entitlementStatus",
        e.started_at as "startedAt",
        e.expires_at as "expiresAt",
        e.order_id as "orderId",
        o.amount as "orderAmount",
        COALESCE(o.addon_amount, 0) as "addonAmount",
        r.review_url as "reviewUrl",
        CASE
          WHEN e.expires_at < NOW() THEN 'EXPIRED'
          WHEN r.review_url IS NOT NULL AND r.review_url != '' THEN 'ACTIVE'
          ELSE 'SETUP_REQUIRED'
        END as "integrationStatus"
      FROM tenant_addon_entitlements e
      JOIN clients c ON c.id = e.tenant_id
      LEFT JOIN users u ON u.tenant_id = c.id
      LEFT JOIN orders o ON o.id = e.order_id
      LEFT JOIN tenant_google_reviews r ON r.tenant_id = e.tenant_id
      WHERE e.addon_id = 'google_reviews'
      ORDER BY e.created_at DESC
    `);

    const rows = listRes.rows;
    const now = new Date();
    const totalSubscribers = rows.length;
    const activeSubscribers = rows.filter(r => r.entitlementStatus === 'ACTIVE' && new Date(r.expiresAt) > now).length;
    const setupPendingCount = rows.filter(r => r.entitlementStatus === 'ACTIVE' && new Date(r.expiresAt) > now && !r.reviewUrl).length;
    const expiredCount = rows.filter(r => r.entitlementStatus === 'EXPIRED' || new Date(r.expiresAt) <= now).length;
    const totalAddonRevenue = rows.reduce((sum, r) => sum + Number(r.addonAmount || 0), 0);

    const summary = {
      totalSubscribers,
      activeSubscribers,
      setupRequired: setupPendingCount,
      setupPendingCount,
      expired: expiredCount,
      expiredCount,
      totalRevenueRupees: totalAddonRevenue,
      totalRevenuePaise: Math.round(totalAddonRevenue * 100),
      totalAddonRevenue,
    };

    sendJson(response, 200, {
      subscribers: rows,
      summary,
      metrics: summary,
    });
    return true;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CATEGORY-AWARE & OPERATIONAL METRICS ENDPOINT
  // ─────────────────────────────────────────────────────────────────────────
  if (request.method === 'GET' && url.pathname === '/api/admin/metrics') {
    const clientsByCategory = await pool.query(`
      SELECT COALESCE(business_type, category, 'other') as category, status, COUNT(*) as count
      FROM clients
      GROUP BY COALESCE(business_type, category, 'other'), status
    `);

    const subsByPlanAndCategory = await pool.query(`
      SELECT COALESCE(c.business_type, c.category, 'other') as category, s.plan_id, s.status, COUNT(*) as count
      FROM subscriptions s
      JOIN clients c ON c.id = s.tenant_id
      GROUP BY COALESCE(c.business_type, c.category, 'other'), s.plan_id, s.status
    `);

    const verificationStats = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE email_verified = true) as email_verified_count,
        COUNT(*) FILTER (WHERE email_verified = false OR email_verified IS NULL) as email_pending_count,
        COUNT(*) FILTER (WHERE phone_verified = true) as phone_verified_count,
        COUNT(*) FILTER (WHERE phone_verified = false OR phone_verified IS NULL) as phone_pending_count
      FROM clients
    `);

    const couponInventory = await pool.query(`
      SELECT status, COUNT(*) as count FROM coupons GROUP BY status
    `);

    sendJson(response, 200, {
      clientsByCategory: clientsByCategory.rows,
      subsByPlanAndCategory: subsByPlanAndCategory.rows,
      verificationStats: verificationStats.rows[0] || {},
      couponInventory: couponInventory.rows,
    });
    return true;
  }

  const notificationReadMatch = url.pathname.match(
    /^\/api\/admin\/notifications\/([^/]+)\/read$/
  );
  if (request.method === 'PATCH' && notificationReadMatch) {
    const notificationId = decodeURIComponent(notificationReadMatch[1]);
    const result = await pool.query('UPDATE notifications SET is_read = true WHERE id = $1', [notificationId]);
    if (result.rowCount === 0) throw apiError(404, 'Notification not found.');
    sendJson(response, 200, { status: 'read' });
    return true;
  }

  const adminClientMatch = url.pathname.match(
    /^\/api\/admin\/clients\/([^/]+)$/
  );
  if (adminClientMatch) {
    const id = decodeURIComponent(adminClientMatch[1]);

    if (request.method === 'GET') {
      const clientRes = await pool.query(`
        SELECT c.*, 
               COALESCE(
                 json_agg(
                   json_build_object(
                     'id', m.id,
                     'name', m.name,
                     'description', m.description,
                     'price', m.price,
                     'available', m.is_available,
                     'category', mc.name
                   )
                 ) FILTER (WHERE m.id IS NOT NULL), '[]'
               ) as "menuItems"
        FROM clients c
        LEFT JOIN menu_items m ON m.tenant_id = c.id
        LEFT JOIN menu_categories mc ON m.category_id = mc.id
        WHERE c.id = $1
        GROUP BY c.id
      `, [id]);
      const client = clientRes.rows[0] ? {
        ...clientRes.rows[0],
        menuItems: clientRes.rows[0].menuItems,
        businessName: clientRes.rows[0].business_name,
        menuSlug: clientRes.rows[0].menu_slug
      } : null;
      if (!client) throw apiError(404, 'Client not found.');
      sendJson(response, 200, client);
      return true;
    }

    if (request.method === 'PUT') {
      const currentRes = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);
      const current = currentRes.rows[0];
      if (!current) throw apiError(404, 'Client not found.');
      const updated = validateClient(
        await readJson(request),
        id,
        current.created_at
      );
      const conflictRes = await pool.query('SELECT id FROM clients WHERE menu_slug = $1 AND id != $2', [updated.menuSlug, id]);
      const conflict = conflictRes.rows[0];
      if (conflict) {
        throw apiError(409, 'That menu URL is already in use.');
      }
      
      const updateFields = Object.keys(updated).filter(k => k !== 'menuItems');
      if (updateFields.length > 0) {
        const setClause = updateFields.map((k, i) => `"${k.replace(/[A-Z]/g, m => '_' + m.toLowerCase())}" = $${i+2}`).join(', ');
        const values = updateFields.map(k => updated[k]);
        await pool.query(`UPDATE clients SET ${setClause} WHERE id = $1`, [id, ...values]);
      }
      if (updated.menuItems) {
        const menuId = 'menu-' + id;
        await pool.query('DELETE FROM menus WHERE tenant_id = $1', [id]);
        await pool.query(
          'INSERT INTO menus (id, tenant_id, name, status) VALUES ($1, $2, $3, $4)',
          [menuId, id, 'Main Menu', 'PUBLISHED']
        );
        
        const uniqueCategories = [...new Set(updated.menuItems.map(i => i.category || 'Other'))];
        const categoryMap = new Map();
        
        for (let i = 0; i < uniqueCategories.length; i++) {
          const catName = uniqueCategories[i];
          const catId = randomUUID();
          await pool.query(
            'INSERT INTO menu_categories (id, menu_id, tenant_id, name, sort_order) VALUES ($1, $2, $3, $4, $5)',
            [catId, menuId, id, catName, i]
          );
          categoryMap.set(catName, catId);
        }

        for (let i = 0; i < updated.menuItems.length; i++) {
          const item = updated.menuItems[i];
          await pool.query(
            'INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, description, price, is_available, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [item.id, menuId, id, categoryMap.get(item.category || 'Other'), item.name, item.description, item.price, item.available, i]
          );
        }
      }
      sendJson(response, 200, updated);
      return true;
    }

    if (request.method === 'DELETE') {
      const result = await pool.query('DELETE FROM clients WHERE id = $1', [id]);
      if (result.rowCount === 0) throw apiError(404, 'Client not found.');
      response.writeHead(204);
      response.end();
      return true;
    }
  }

  if (request.method === 'POST' && url.pathname === '/api/admin/clients') {
    const input = await readJson(request);
    const requestedId =
      typeof input?.id === 'string' && input.id.length <= 100
        ? input.id
        : randomUUID();
    const client = validateClient(
      input,
      requestedId,
      new Date().toISOString()
    );
    if (
      (await pool.query('SELECT id FROM clients WHERE id = $1', [client.id])).rows[0]
    ) {
      throw apiError(409, 'That client ID is already in use.');
    }
    if (
      (await pool.query('SELECT id FROM clients WHERE menu_slug = $1', [client.menuSlug])).rows[0]
    ) {
      throw apiError(409, 'That menu URL is already in use.');
    }

    const clientEmail = client.email || `${client.menuSlug || client.id}@menusqr.local`;
    if (
      (await pool.query('SELECT id FROM users WHERE email = $1', [clientEmail])).rows[0]
    ) {
      throw apiError(409, 'That email is already in use by another user.');
    }

    await pool.query(
        'INSERT INTO clients (id, public_id, business_name, menu_slug, category, tagline, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [client.id, client.publicId || client.id, client.businessName, client.menuSlug, client.category, client.tagline, client.status]
      );

    const rawPassword = input.password || randomUUID().slice(0, 8);
    const { hashPassword } = await import('../auth.js');
    const passwordHash = hashPassword(rawPassword);
    const userId = randomUUID();

    await pool.query(
      'INSERT INTO users (id, email, password_hash, role, tenant_id) VALUES ($1, $2, $3, $4, $5)',
      [userId, clientEmail, passwordHash, 'RESTAURANT_OWNER', client.id]
    );

    client.temporaryPassword = rawPassword;

      if (client.menuItems && client.menuItems.length > 0) {
        const menuId = 'menu-' + client.id;
        await pool.query(
          'INSERT INTO menus (id, tenant_id, name, status) VALUES ($1, $2, $3, $4)',
          [menuId, client.id, 'Main Menu', 'PUBLISHED']
        );
        
        const uniqueCategories = [...new Set(client.menuItems.map(i => i.category || 'Other'))];
        const categoryMap = new Map();
        
        for (let i = 0; i < uniqueCategories.length; i++) {
          const catName = uniqueCategories[i];
          const catId = randomUUID();
          await pool.query(
            'INSERT INTO menu_categories (id, menu_id, tenant_id, name, sort_order) VALUES ($1, $2, $3, $4, $5)',
            [catId, menuId, client.id, catName, i]
          );
          categoryMap.set(catName, catId);
        }

        for (let i = 0; i < client.menuItems.length; i++) {
          const item = client.menuItems[i];
          await pool.query(
            'INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, description, price, is_available, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [item.id, menuId, client.id, categoryMap.get(item.category || 'Other'), item.name, item.description, item.price, item.available, i]
          );
        }
      }
    if (request.headers['x-menusqr-import'] !== 'legacy') {
      const notif = createNewUserNotification(client);
      await pool.query('INSERT INTO notifications (id, message, is_read, created_at) VALUES ($1, $2, $3, $4)', [notif.id, notif.message, notif.isRead, notif.createdAt]);
      void import('../email.js')
        .then(({ sendClientWelcomeEmail }) => sendClientWelcomeEmail(client))
        .catch((error) => {
          console.error('[email] Could not queue welcome email:', error.message);
        });
    }
    sendJson(response, 201, client);
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/admin/email-diagnostics') {
    const { getEmailConfig } = await import('../email.js');
    const outboxStats = await pool.query(`
      SELECT status, COUNT(*) as count FROM email_outbox GROUP BY status
    `);
    const recentOutbox = await pool.query(`
      SELECT id, notification_type, recipient, idempotency_key, status, attempt_count, provider_message_id, last_error, created_at, updated_at
      FROM email_outbox ORDER BY created_at DESC LIMIT 20
    `);
    const recentEvents = await pool.query(`
      SELECT * FROM email_events ORDER BY created_at DESC LIMIT 20
    `);

    sendJson(response, 200, {
      config: getEmailConfig(),
      outboxStats: outboxStats.rows,
      recentOutbox: recentOutbox.rows,
      recentEvents: recentEvents.rows,
    });
    return true;
  }
  
  return false;
}
