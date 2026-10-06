import './env.js';
import { createServer } from 'node:http';

import { connectDB, pool } from './db.js';
import { apiError, sendJson } from './utils.js';

import authRoutes from './routes/auth.js';
import appRoutes from './routes/app.js';
import adminRoutes from './routes/admin.js';
import publicRoutes from './routes/public.js';
import purchaseRoutes from './routes/purchase.js';

const port = Number(process.env.PORT || process.env.API_PORT || 3001);
const frontendOrigin = process.env.FRONTEND_ORIGIN?.trim().replace(/\/$/, '');

async function initializeStore() {
  await connectDB(process.env.DATABASE_URL);
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  const requestOrigin = request.headers.origin;

  // Render & Localhost origin allowed for CORS
  const allowedLocalOrigins = ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'];
  let isAllowedOrigin = !frontendOrigin || requestOrigin === frontendOrigin || frontendOrigin === '*';
  if (requestOrigin && !isAllowedOrigin) {
    try {
      const parsedOrigin = new URL(requestOrigin);
      if (allowedLocalOrigins.includes(requestOrigin)) isAllowedOrigin = true;
      if (parsedOrigin.hostname.endsWith('.onrender.com')) isAllowedOrigin = true;
    } catch { /* invalid origin */ }
  }

  if (requestOrigin && isAllowedOrigin) {
    response.setHeader('Access-Control-Allow-Origin', requestOrigin);
    response.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-MenusQR-Import'
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
        smtpConfigured: Boolean(process.env.SMTP_USER && process.env.SMTP_PASSWORD),
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
  console.log(`MenusQR API listening on port ${PORT}`);
});