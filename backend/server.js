import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';
import { connectDB, pool } from './db.js';
import { enforceAuth, enforceSuperAdmin, enforceTenant, generateAuthCookie, clearAuthCookie, getAuthenticatedUser } from './auth.js';
import { createNewUserNotification } from './notifications.js';

const directory = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: join(directory, '.env') });

const legacyDataFile = join(directory, 'data', 'clients.json');
const port = Number(process.env.PORT || process.env.API_PORT || 3001);
const maxBodyBytes = 20 * 1024 * 1024;
const adminPassword = process.env.ADMIN_PASSWORD || 'MenuQR@2026!';
const adminPasswordHash = createHash('sha256').update(adminPassword).digest();
const sessionDurationSeconds = 8 * 60 * 60;
const loginLockDurationMs = 60 * 1000;
const frontendOrigin = process.env.FRONTEND_ORIGIN?.trim().replace(/\/$/, '');
const categories = new Set(['restaurants', 'dhabas', 'cafes']);
const loginAttempts = new Map();

function apiError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function sendJson(response, status, value, headers = {}) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  });
  response.end(JSON.stringify(value));
}

function getSessionToken(request) {
  const authorization = request.headers.authorization;
  return authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : undefined;
}


function hasCorrectAdminPassword(password) {
  if (typeof password !== 'string' || password.length > 256) return false;
  const passwordHash = createHash('sha256').update(password).digest();
  return timingSafeEqual(adminPasswordHash, passwordHash);
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBodyBytes) throw apiError(413, 'Request body is too large.');
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw apiError(400, 'Request body must contain valid JSON.');
  }
}

function validateClient(input, id, createdAt) {
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

function toPublicMenu(client) {
  return {
    businessName: client.businessName,
    category: client.category,
    phone: client.phone,
    address: client.address,
    city: client.city,
    state: client.state,
    website: client.website,
    openingHours: client.openingHours,
    services: client.services,
    heroImage: client.heroImage,
    menuItems: client.menuItems.filter((item) => item.available),
  };
}

async function initializeStore() {
  await connectDB(process.env.DATABASE_URL);
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  const requestOrigin = request.headers.origin;

  // Render & Localhost origin allowed for CORS
  const isAllowedOrigin =
    !frontendOrigin ||
    requestOrigin === frontendOrigin ||
    frontendOrigin === '*' ||
    requestOrigin?.includes('localhost') ||
    requestOrigin?.includes('onrender.com');

  if (requestOrigin && isAllowedOrigin) {
    response.setHeader('Access-Control-Allow-Origin', requestOrigin);
    response.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-MenuQR-Import'
    );
    response.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );
    response.setHeader('Vary', 'Origin');
  }

  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }

  try {
    if (request.method === 'GET' && url.pathname === '/api/health') {
      sendJson(response, 200, {
        status: 'ok',
        storage: 'postgresql',
        clients: parseInt((await pool.query('SELECT COUNT(*) FROM clients')).rows[0].count, 10),
      });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/auth/session') {
      const user = getAuthenticatedUser(request);
      sendJson(response, 200, {
        authenticated: !!user,
        user: user || null,
      });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/login') {
      const address = request.socket.remoteAddress ?? 'unknown';
      const now = Date.now();
      const attempt = loginAttempts.get(address);
      if (attempt?.lockedUntil > now) throw apiError(429, 'Too many login attempts. Try again in 1 minute.');
      
      const input = await readJson(request);
      let user = null;

      if (input?.email) {
        // Restaurant Owner Login
        const dbRes = await pool.query('SELECT * FROM users WHERE email = $1', [input.email]);
        const dbUser = dbRes.rows[0];
        
        if (dbUser && (await import('./auth.js')).verifyPassword(input.password, dbUser.password_hash)) {
          user = { id: String(dbUser.id), role: dbUser.role, tenantId: dbUser.tenant_id };
        }
      } else {
        // Legacy Super Admin Login
        if (hasCorrectAdminPassword(input?.password)) {
          user = { id: 'super-admin', role: 'SUPER_ADMIN' };
        }
      }

      if (!user) {
        const currentAttempt = attempt && now - attempt.windowStartedAt < 15 * 60 * 1000 ? attempt : { count: 0, windowStartedAt: now, lockedUntil: 0 };
        currentAttempt.count += 1;
        if (currentAttempt.count >= 5) currentAttempt.lockedUntil = now + loginLockDurationMs;
        loginAttempts.set(address, currentAttempt);
        throw apiError(401, 'Incorrect credentials.');
      }
      
      loginAttempts.delete(address);
      const cookie = generateAuthCookie(user);
      response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Set-Cookie': cookie, 'Cache-Control': 'no-store' });
      response.end(JSON.stringify({ authenticated: true, role: user.role }));
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/logout') {
      const cookie = clearAuthCookie();
      response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Set-Cookie': cookie, 'Cache-Control': 'no-store' });
      response.end(JSON.stringify({ authenticated: false }));
      return;
    }

    if (url.pathname.startsWith('/api/admin/')) {
      enforceSuperAdmin(request);
    }

    if (url.pathname.startsWith('/api/app/')) {
      const user = enforceTenant(request);

      if (request.method === 'GET' && url.pathname === '/api/app/profile') {
        const res = await pool.query(`
          SELECT u.email, u.role, c.business_name as "businessName", c.menu_slug as "menuSlug", c.status, c.tagline
          FROM users u
          JOIN clients c ON u.tenant_id = c.id
          WHERE u.id = $1 AND c.id = $2
        `, [user.id, user.tenantId]);
        if (!res.rows[0]) throw apiError(404, 'Profile not found.');
        sendJson(response, 200, res.rows[0]);
        return;
      }

      if (request.method === 'GET' && url.pathname === '/api/app/dashboard') {
        const statsRes = await pool.query(`
          SELECT 
            (SELECT COUNT(*) FROM menus WHERE tenant_id = $1) as total_menus,
            (SELECT COUNT(*) FROM menu_items WHERE tenant_id = $1 AND is_available = true) as active_items,
            (SELECT COUNT(*) FROM qr_codes WHERE tenant_id = $1 AND is_active = true) as active_qrs
        `, [user.tenantId]);
        sendJson(response, 200, { stats: statsRes.rows[0] });
        return;
      }

      if (request.method === 'GET' && url.pathname === '/api/app/subscription') {
        const subRes = await pool.query(`
          SELECT plan_id as "planId", status, started_at as "startedAt", expires_at as "expiresAt"
          FROM subscriptions 
          WHERE tenant_id = $1
        `, [user.tenantId]);
        sendJson(response, 200, subRes.rows[0] || { status: 'none' });
        return;
      }

      if (request.method === 'GET' && url.pathname === '/api/app/qr') {
        const qrRes = await pool.query(`
          SELECT public_id as "publicId", qr_id as "qrId", destination_type as "destinationType", is_active as "isActive"
          FROM qr_codes 
          WHERE tenant_id = $1
        `, [user.tenantId]);
        sendJson(response, 200, qrRes.rows);
        return;
      }

      if (request.method === 'PATCH' && url.pathname === '/api/app/settings') {
        const input = await readJson(request);
        const updates = {};
        if (input.businessName !== undefined) updates.business_name = input.businessName;
        if (input.menuSlug !== undefined) updates.menu_slug = input.menuSlug;
        if (input.tagline !== undefined) updates.tagline = input.tagline;
        
        if (updates.menu_slug) {
          const conflict = await pool.query('SELECT id FROM clients WHERE menu_slug = $1 AND id != $2', [updates.menu_slug, user.tenantId]);
          if (conflict.rows.length > 0) throw apiError(409, 'Menu slug already in use.');
        }

        const fields = Object.keys(updates);
        if (fields.length === 0) {
          sendJson(response, 200, { message: 'No updates provided' });
          return;
        }

        const setClause = fields.map((f, i) => `"${f}" = $${i + 1}`).join(', ');
        const values = fields.map(f => updates[f]);
        values.push(user.tenantId);
        
        const updateRes = await pool.query(`
          UPDATE clients 
          SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
          WHERE id = $${values.length} 
          RETURNING id, business_name as "businessName", menu_slug as "menuSlug", tagline
        `, values);
        
        sendJson(response, 200, updateRes.rows[0]);
        return;
      }
    }

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
        menuSlug: row.menu_slug
      }));
      sendJson(response, 200, records);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/admin/notifications') {
      const notifications = (await pool.query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50')).rows;
      sendJson(response, 200, notifications);
      return;
    }

    if (request.method === 'DELETE' && url.pathname === '/api/admin/notifications') {
      const result = await pool.query('DELETE FROM notifications');
      sendJson(response, 200, { deletedCount: result.rowCount });
      return;
    }

    const notificationReadMatch = url.pathname.match(
      /^\/api\/admin\/notifications\/([^/]+)\/read$/
    );
    if (request.method === 'PATCH' && notificationReadMatch) {
      const notificationId = decodeURIComponent(notificationReadMatch[1]);
      const result = await pool.query('UPDATE notifications SET is_read = true WHERE id = $1', [notificationId]);
      if (result.rowCount === 0) throw apiError(404, 'Notification not found.');
      sendJson(response, 200, { status: 'read' });
      return;
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
        return;
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
        // Simplistic update for now (in production, use parameterized fields or a query builder)
        const updateFields = Object.keys(updated).filter(k => k !== 'menuItems');
        if (updateFields.length > 0) {
          const setClause = updateFields.map((k, i) => `"${k.replace(/[A-Z]/g, m => '_' + m.toLowerCase())}" = ${i+2}`).join(', ');
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
        return;
      }

      if (request.method === 'DELETE') {
        const result = await pool.query('DELETE FROM clients WHERE id = $1', [id]);
        if (result.rowCount === 0) throw apiError(404, 'Client not found.');
        response.writeHead(204);
        response.end();
        return;
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

      const clientEmail = client.email || `${client.menuSlug || client.id}@menuqr.local`;
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
      const { hashPassword } = await import('./auth.js');
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
      if (request.headers['x-menuqr-import'] !== 'legacy') {
        const notif = createNewUserNotification(client);
          await pool.query('INSERT INTO notifications (id, message, is_read, created_at) VALUES ($1, $2, $3, $4)', [notif.id, notif.message, notif.isRead, notif.createdAt]);
        // Email delivery is best-effort and must not hold up the API response.
        void import('./email.js')
          .then(({ sendNewUserAlert, sendClientWelcomeEmail }) =>
            Promise.all([
              sendNewUserAlert(client),
              sendClientWelcomeEmail(client),
            ])
          )
          .catch((error) => {
            console.error('[email] Could not start registration emails:', error.message);
          });
      }
      sendJson(response, 201, client);
      return;
    }

    const publicMenuMatch = url.pathname.match(
      /^\/api\/public\/menus\/([^/]+)$/
    );
    if (request.method === 'GET' && publicMenuMatch) {
      const slug = decodeURIComponent(publicMenuMatch[1]);
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
          WHERE c.menu_slug = $1
          GROUP BY c.id
        `, [slug]);
        const client = clientRes.rows[0] ? {
          ...clientRes.rows[0],
          menuItems: clientRes.rows[0].menuItems,
          businessName: clientRes.rows[0].business_name,
          menuSlug: clientRes.rows[0].menu_slug
        } : null;
      if (!client || client.status.toLowerCase() !== 'active') {
        throw apiError(404, 'This menu is unavailable.');
      }
      sendJson(response, 200, toPublicMenu(client));
      return;
    }

    throw apiError(404, 'API route not found.');
  } catch (error) {
    console.error(`[api] \({request.method}\){url.pathname}:`, error.message);
    const status = error.status || (error.code === '23505' ? 409 : 500);
    sendJson(response, status, {
      error:
        error.status || error.code === '23505'
          ? error.message
          : 'The server could not complete this request.',
    });
  }
});

await initializeStore();
const PORT = process.env.PORT || port || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`MenuQR API listening on port ${PORT}`);
});