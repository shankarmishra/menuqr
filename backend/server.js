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
import { createCorsOriginChecker } from './cors.js';
import { startOutboxWorker, getEmailConfig } from './email.js';

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

      sendJson(response, isDegraded ? 503 : 200, {
        status: isDegraded ? 'degraded' : 'ok',
        database: 'postgresql',
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
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
      });
      return;
    }

        // Static file serving for uploads (dish images, logos, covers)
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
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
          'Access-Control-Allow-Origin': '*'
        });
        fs.createReadStream(filePath).pipe(response);
        return;
      }
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