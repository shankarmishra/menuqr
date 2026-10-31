process.env.NODE_ENV = process.env.NODE_ENV || 'production';

import './env.js';
import dns from 'node:dns';
import { createServer } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

// Render free tier IPv6 outbound routing is broken; force IPv4 for SMTP & external APIs.
dns.setDefaultResultOrder('ipv4first');

process.on('uncaughtException', (err) => {
  console.error('[server] Uncaught exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[server] Unhandled rejection:', reason);
});


import { connectDB, pool } from './db.js';
import { apiError, sendJson } from './utils.js';
import { getSystemHealth, captureException } from './observability.js';
import { createCorsOriginChecker, createAdminOriginChecker } from './cors.js';
import { startOutboxWorker, getEmailConfig } from './email.js';
import { getStorage, storageInfo } from './storage/index.js';

import authRoutes from './routes/auth.js';
import appRoutes from './routes/app.js';
import adminRoutes from './routes/admin.js';
import publicRoutes from './routes/public.js';
import purchaseRoutes from './routes/purchase.js';

import { randomUUID } from 'node:crypto';

import { parseCookie as parse } from 'cookie';
import { verifyCsrfToken } from './csrf.js';

const port = Number(process.env.PORT || process.env.API_PORT || 3001);
const isAllowedOrigin = createCorsOriginChecker(process.env);
const isAdminOrigin = createAdminOriginChecker(process.env);

export function checkPaymentGatewayConfig() {
  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  const env = (process.env.CASHFREE_ENV || 'TEST').toUpperCase();
  const isProd = env === 'PROD';
  
  const configured = Boolean(appId && secretKey);
  const errors = [];
  const warnings = [];

  if (!appId || !secretKey) {
    errors.push('CASHFREE_APP_ID and/or CASHFREE_SECRET_KEY is missing.');
  }

  if (appId) {
    const isTestKey = appId.startsWith('TEST') || appId.includes('TEST');
    if (isProd && isTestKey) {
      warnings.push("CASHFREE_ENV is 'PROD' but CASHFREE_APP_ID appears to be a sandbox/test key.");
    } else if (!isProd && !isTestKey) {
      warnings.push(`CASHFREE_ENV is '${env}' but CASHFREE_APP_ID does not appear to be a sandbox/test key.`);
    }
  }

  return {
    configured,
    provider: 'cashfree',
    env,
    errors,
    warnings,
  };
}

async function initializeStore() {
  await connectDB(process.env.DATABASE_URL);
  startOutboxWorker();
}

const server = createServer(async (request, response) => {
  const requestId = request.headers['x-request-id'] || randomUUID();
  response.setHeader('X-Request-ID', requestId);
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('X-XSS-Protection', '1; mode=block');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true') {
    response.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  const requestOrigin = request.headers.origin;
  const referer = request.headers.referer;
  const originAllowed = isAllowedOrigin(requestOrigin);

  if (url.pathname !== '/api/health') {
    console.log(`[api] [req:${requestId.substring(0, 8)}] (${request.method}) ${url.pathname}`);
  }

  if (requestOrigin && originAllowed) {
    response.setHeader('Access-Control-Allow-Origin', requestOrigin);
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-CSRF-Token, X-MenusQR-Import, X-Resend-Signature'
    );
    response.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );
    response.setHeader('Vary', 'Origin');
  } else if (requestOrigin && !originAllowed && !url.pathname.startsWith('/api/webhooks/')) {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      sendJson(response, 403, { error: 'Forbidden: Request origin is not allowed.' });
      return;
    }
  }

  // Admin APIs answer only to the admin site, never to the restaurant site or any other origin.
  if (url.pathname.startsWith('/api/auth/admin/') || url.pathname.startsWith('/api/admin/')) {
    response.setHeader('Cache-Control', 'no-store');
    let refererOrigin = '';
    try { refererOrigin = referer ? new URL(referer).origin : ''; } catch { refererOrigin = 'invalid'; }
    if (!isAdminOrigin(requestOrigin) || (refererOrigin && !isAdminOrigin(refererOrigin))) {
      sendJson(response, 403, { error: 'Forbidden: admin access is only available from the admin site.' });
      return;
    }
  }

  // Referer Defense-in-Depth
  if (referer && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method) && !url.pathname.startsWith('/api/webhooks/')) {
    try {
      const refererOrigin = new URL(referer).origin;
      if (!isAllowedOrigin(refererOrigin)) {
        sendJson(response, 403, { error: 'Forbidden: Request referrer is not allowed.' });
        return;
      }
    } catch {
      sendJson(response, 403, { error: 'Forbidden: Invalid request referrer.' });
      return;
    }
  }

  // CSRF Token Validation for Cookie-Authenticated State-Changing Requests
  const isAuthRoute = url.pathname.startsWith('/api/auth/');
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method) && !url.pathname.startsWith('/api/webhooks/') && !isAuthRoute) {
    const cookies = parse(request.headers.cookie || '');
    const sessionToken = cookies['menusqr_auth'] || cookies['menusqr_admin_session'];
    const csrfCookie = cookies['menusqr_csrf'];

    if (sessionToken) {
      const csrfTokenHeader = request.headers['x-csrf-token'] || request.headers['X-CSRF-Token'];
      const isValidHmacToken = csrfTokenHeader && verifyCsrfToken(csrfTokenHeader, sessionToken);
      const isValidDoubleSubmitToken = csrfTokenHeader && csrfCookie && csrfTokenHeader === csrfCookie;

      if (!isValidHmacToken && !isValidDoubleSubmitToken) {
        sendJson(response, 403, { error: 'Forbidden: Invalid or missing CSRF token.' });
        return;
      }
    }
  }

  if (request.method === 'OPTIONS') {
    response.writeHead(originAllowed ? 204 : 403);
    response.end();
    return;
  }

  try {
    if ((request.method === 'GET' || request.method === 'HEAD') && url.pathname === '/') {
      sendJson(response, 200, {
        status: 'online',
        service: 'MenusQR API',
        version: '2.0.0',
        healthCheck: '/api/health',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/health') {
      let dbConnected = false;
      try {
        await pool.query('SELECT 1');
        dbConnected = true;
      } catch (err) {
        dbConnected = false;
      }

      const pgCfg = checkPaymentGatewayConfig();
      const isDegraded = !dbConnected || (process.env.NODE_ENV === 'production' && !pgCfg.configured);

      const telemetry = await getSystemHealth();
      sendJson(response, isDegraded ? 503 : 200, {
        status: isDegraded ? 'degraded' : 'ok',
        database: 'postgresql',
        telemetry,
        dbConnected,
        paymentGateway: {
          configured: pgCfg.configured,
          provider: pgCfg.provider,
          env: pgCfg.env,
          warnings: pgCfg.warnings.length > 0 ? pgCfg.warnings : undefined,
          errors: pgCfg.errors.length > 0 ? pgCfg.errors : undefined,
        },
        cashfreeConfigured: pgCfg.configured,
        emailProvider: getEmailConfig().provider,
        emailConfigured: getEmailConfig().configured,
        resendConfigured: getEmailConfig().configured,
        storageDriver: storageInfo(),
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Legacy read path for images written before object storage, and for the local driver.
    // Kept permanently: existing DB rows and printed QR menus still reference /uploads/*.
    if (request.method === 'GET' && url.pathname.startsWith('/uploads/')) {
      const sanitized = path.normalize(url.pathname.replace(/^\/uploads\//, '')).replace(/^(\.\.[\/\\])+/, '');
      const filePath = path.join(process.cwd(), 'uploads', sanitized);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.webp': 'image/webp',
          '.svg': 'image/svg+xml'
        };
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        response.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Access-Control-Allow-Origin': '*'
        });
        fs.createReadStream(filePath).pipe(response);
        return;
      }

      // Not on local disk. On a remote driver the object lives in the bucket, so redirect
      // rather than 404 — this keeps pre-migration database rows and printed QR menus working
      // without ever rewriting stored URLs.
      const storage = getStorage();
      if (storage.isRemote && sanitized) {
        // path.normalize yields OS separators; object keys are always forward-slashed.
        const objectKey = sanitized.split(path.sep).join('/');
        response.writeHead(302, {
          Location: storage.url(objectKey),
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*',
        });
        response.end();
        return;
      }
    }

    // Public Menu Bot / Crawler and Browser landing with Open Graph preview metadata (Blueprint Phase 0/5)
    const menuSlugMatch = request.method === 'GET' && url.pathname.match(/^\/menu\/([^/]+)$/);
    if (menuSlugMatch) {
      const slug = decodeURIComponent(menuSlugMatch[1]);
      try {
        const clientRes = await pool.query(
          `SELECT c.business_name, c.tagline, c.logo_url, c.cover_image, c.menu_slug,
                  p.display_name, p.story
             FROM clients c
             LEFT JOIN restaurant_profiles p ON p.tenant_id = c.id
            WHERE c.menu_slug = $1 OR c.public_id = $1 OR c.id = $1`,
          [slug]
        );
        const row = clientRes.rows[0];
        if (row) {
          const restaurantName = row.display_name || row.business_name || 'Restaurant';
          const description = row.tagline || row.story || 'View our complete digital menu and order online.';
          const image = row.cover_image || row.logo_url || 'https://menusqr.in/og-image.png';
          const menuUrl = `https://menusqr.in/menu/${row.menu_slug || slug}`;

          const escapeHtml = (s) => String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          const safeName = escapeHtml(restaurantName);
          const safeDesc = escapeHtml(description);
          const safeImg = escapeHtml(image);

          const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>${safeName} | Digital Menu</title>
    <meta name="description" content="${safeDesc}">
    <meta property="og:type" content="restaurant.menu">
    <meta property="og:title" content="${safeName}">
    <meta property="og:description" content="${safeDesc}">
    <meta property="og:image" content="${safeImg}">
    <meta property="og:url" content="${menuUrl}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${safeName}">
    <meta name="twitter:description" content="${safeDesc}">
    <meta name="twitter:image" content="${safeImg}">
    <meta http-equiv="refresh" content="0;url=/menu/${encodeURIComponent(row.menu_slug || slug)}">
    <style>body{background:#151c19;color:#fff;font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center;padding:20px;}</style>
  </head>
  <body>
    <div>
      <h1 style="font-size:1.75rem;margin-bottom:0.5rem;">${safeName}</h1>
      <p style="color:#aab7b2;max-width:400px;margin:0 auto 1.5rem;">${safeDesc}</p>
      <a href="/menu/${encodeURIComponent(row.menu_slug || slug)}" style="color:#e8783c;text-decoration:none;font-weight:bold;border:1px solid #e8783c;padding:10px 20px;border-radius:10px;display:inline-block;">Open Menu &rarr;</a>
    </div>
    <script>window.location.replace('/menu/${encodeURIComponent(row.menu_slug || slug)}');</script>
  </body>
</html>`;
          response.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=300'
          });
          response.end(html);
          return;
        }
      } catch (err) {}
    }

    if (await authRoutes(request, response, url)) return;
    if (await adminRoutes(request, response, url)) return;
    if (await appRoutes(request, response, url)) return;
    if (await publicRoutes(request, response, url)) return;
    if (await purchaseRoutes(request, response, url)) return;

    throw apiError(404, 'API route not found.');
  } catch (error) {
    console.error(`[api] (${request.method})${url.pathname}:`, error.message);
    const isConflict = error.code === '23505';
    const status = error.status || (isConflict ? 409 : 500);
    sendJson(response, status, {
      error:
        error.status
          ? error.message
          : isConflict
            ? 'Conflict: A record with this unique identifier already exists.'
            : 'The server could not complete this request.',
    });
  }
});

const isTest = Boolean(process.env.NODE_TEST_CONTEXT || process.env.NODE_ENV === 'test' || process.argv.includes('--test') || process.argv.some(a => a.includes('test')));
if (!isTest) {
  await initializeStore();
  const PORT = process.env.PORT || port || 3001;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`MenusQR API listening on port ${PORT}`);
  });
}