process.env.NODE_ENV = process.env.NODE_ENV || 'production';

import './env.js';
import dns from 'node:dns';
import { createServer } from 'node:http';

// Render free tier IPv6 outbound routing is broken; force IPv4 for SMTP & external APIs.
dns.setDefaultResultOrder('ipv4first');

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

const port = Number(process.env.PORT || process.env.API_PORT || 3001);
const isAllowedOrigin = createCorsOriginChecker(process.env);

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
  const originAllowed = isAllowedOrigin(requestOrigin);
  if (url.pathname !== '/api/health') {
    console.log(`[api] [req:${requestId.substring(0, 8)}] (${request.method}) ${url.pathname}`);
  }

  if (requestOrigin && originAllowed) {
    response.setHeader('Access-Control-Allow-Origin', requestOrigin);
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-MenusQR-Import, X-Resend-Signature'
    );
    response.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );
    response.setHeader('Vary', 'Origin');
  } else if (requestOrigin && !originAllowed) {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      sendJson(response, 403, { error: 'Forbidden: Request origin is not allowed.' });
      return;
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

      sendJson(response, dbConnected ? 200 : 503, {
        status: dbConnected ? 'ok' : 'degraded',
        database: 'postgresql',
        dbConnected,
        emailProvider: 'resend',
        resendConfigured: getEmailConfig().configured,
        cashfreeConfigured: Boolean(process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY),
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
      });
      return;
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

await initializeStore();
const PORT = process.env.PORT || port || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`MenusQR API listening on port ${PORT}`);
});