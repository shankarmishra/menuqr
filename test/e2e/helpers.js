/**
 * E2E Test Suite Helpers & Infrastructure Harness
 * Provides opaque-box HTTP clients, database helpers, test tenancy lifecycle,
 * SSE listeners, and authoritative mathematical reference oracles.
 */

import http from 'node:http';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';

const requireBackend = createRequire(new URL('../../backend/package.json', import.meta.url));
const pg = requireBackend('pg');
const jwt = requireBackend('jsonwebtoken');

// Resolve configuration
const DB_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/menuqr';
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_12345';
let serverProcess = null;
let cachedPool = null;

export const PLANS_REFERENCE = {
  basic: { yearlyPrice: 1999, paise: 199900, dailyRatePaise: 548, label: 'Basic' },
  intermediate: { yearlyPrice: 3199, paise: 319900, dailyRatePaise: 876, label: 'Intermediate' },
  premium: { yearlyPrice: 6799, paise: 679900, dailyRatePaise: 1863, label: 'Premium' },
};

/**
 * Returns database pool instance.
 */
export function getDbPool() {
  if (!cachedPool) {
    cachedPool = new pg.Pool({ connectionString: DB_URL });
    cachedPool.on('error', (err) => {
      console.warn('[e2e-helper] DB Pool error:', err.message);
    });
  }
  return cachedPool;
}

/**
 * Executes a query using the cached pool.
 */
export async function dbQuery(text, params = []) {
  const pool = getDbPool();
  return pool.query(text, params);
}

/**
 * Checks if a table exists in public schema.
 */
export async function tableExists(tableName) {
  try {
    const res = await dbQuery(
      "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1",
      [tableName]
    );
    return res.rows.length > 0;
  } catch {
    return false;
  }
}

/**
 * Resolves the target backend base URL.
 */
export function getBaseUrl() {
  return process.env.TEST_API_URL || 'http://localhost:3001';
}

/**
 * Verifies if the backend server is reachable at /api/health.
 */
export async function isServerHealthy(baseUrl = getBaseUrl()) {
  try {
    const res = await fetch(`${baseUrl}/api/health`, { method: 'GET' });
    return res.ok || res.status === 200 || res.status === 503;
  } catch {
    return false;
  }
}

/**
 * Ensures backend server is running. If not, spawns backend/server.js.
 */
export async function ensureServer(port = 3001) {
  const baseUrl = `http://localhost:${port}`;
  const alive = await isServerHealthy(baseUrl);
  if (alive) {
    return baseUrl;
  }

  // Attempt to spawn backend
  return new Promise((resolve, reject) => {
    const env = {
      ...process.env,
      PORT: String(port),
      API_PORT: String(port),
      NODE_ENV: 'development',
      DATABASE_URL: DB_URL,
      JWT_SECRET: JWT_SECRET,
    };
    delete env.NODE_TEST_CONTEXT;

    serverProcess = spawn('node', ['backend/server.js'], {
      cwd: process.cwd(),
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stderrOutput = '';
    serverProcess.stderr.on('data', (d) => {
      stderrOutput += d.toString();
    });

    const timeout = setTimeout(async () => {
      const isUp = await isServerHealthy(baseUrl);
      if (isUp) {
        resolve(baseUrl);
      } else {
        reject(new Error(`Timed out waiting for server to start on port ${port}. Error: ${stderrOutput}`));
      }
    }, 7000);

    const checkInterval = setInterval(async () => {
      const isUp = await isServerHealthy(baseUrl);
      if (isUp) {
        clearInterval(checkInterval);
        clearTimeout(timeout);
        resolve(baseUrl);
      }
    }, 400);

    serverProcess.on('error', (err) => {
      clearInterval(checkInterval);
      clearTimeout(timeout);
      reject(err);
    });

    process.on('exit', () => {
      if (serverProcess) {
        try { serverProcess.kill(); } catch {}
      }
    });
  });
}

/**
 * Gracefully terminates spawned server process (if started by tests).
 */
export async function stopServer() {
  if (serverProcess) {
    try {
      if (process.platform === 'win32') {
        const { execSync } = await import('node:child_process');
        execSync(	askkill /F /PID  /T, { stdio: 'ignore' });
      } else {
        serverProcess.kill('SIGKILL');
      }
    } catch {}
    serverProcess = null;
  }
}

/**
 * Creates an authenticated JWT auth token.
 */
export function generateTestAuthToken(user) {
  const payload = {
    id: user.id,
    role: user.role || 'RESTAURANT_OWNER',
    tenantId: user.tenantId || null,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Seeds a clean test tenant, user, and subscription for isolated test runs.
 */
export async function createTestTenant({
  planId = 'BASIC',
  expiresAt = new Date(Date.now() + 180 * 86400000), // 180 days default
  status = 'ACTIVE',
  state = 'Maharashtra',
  businessName = 'Test Dhaba',
  googleReviewUrl = 'https://g.page/r/test-review-link',
} = {}) {
  const pool = getDbPool();
  const runId = randomUUID().slice(0, 8);
  const tenantId = `tenant-e2e-${runId}`;
  const userId = `user-e2e-${runId}`;
  const menuSlug = `e2e-slug-${runId}`;
  const subId = `sub-e2e-${runId}`;

  // Insert client
  await pool.query(
    `INSERT INTO clients (id, public_id, business_name, menu_slug, status, state, city)
     VALUES ($1, $2, $3, $4, 'active', $5, 'Mumbai')
     ON CONFLICT (id) DO NOTHING`,
    [tenantId, `pub-${runId}`, `${businessName} ${runId}`, menuSlug, state]
  );

  // Update google_review_url if column exists
  try {
    await pool.query(
      `UPDATE clients SET google_review_url = $1 WHERE id = $2`,
      [googleReviewUrl, tenantId]
    );
  } catch {}

  // Insert user
  await pool.query(
    `INSERT INTO users (id, email, password_hash, role, tenant_id, onboarding_state)
     VALUES ($1, $2, 'dummyhash', 'RESTAURANT_OWNER', $3, 'COMPLETED')
     ON CONFLICT (id) DO NOTHING`,
    [userId, `owner-${runId}@example.com`, tenantId]
  );

  // Insert subscription
  await pool.query(
    `INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at)
     VALUES ($1, $2, $3, $4, NOW() - INTERVAL '30 days', $5)
     ON CONFLICT (id) DO NOTHING`,
    [subId, tenantId, planId.toUpperCase(), status, expiresAt]
  );

  const token = generateTestAuthToken({ id: userId, role: 'RESTAURANT_OWNER', tenantId });

  return {
    runId,
    tenantId,
    userId,
    menuSlug,
    subId,
    token,
    authHeaders: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cookieHeaders: {
      Cookie: `menusqr_auth=${token}`,
      'Content-Type': 'application/json',
    },
  };
}

/**
 * Completely cleans up a test tenant and all associated records.
 */
export async function cleanupTenant(tenantId) {
  if (!tenantId) return;
  const pool = getDbPool();
  try {
    // Delete in reverse dependency order
    const safeDelete = async (table, col = 'tenant_id') => {
      try {
        if (await tableExists(table)) {
          await pool.query(`DELETE FROM ${table} WHERE ${col} = $1`, [tenantId]);
        }
      } catch {}
    };

    // System 2 tables
    try {
      if (await tableExists('token_items') && await tableExists('table_tokens')) {
        await pool.query(
          `DELETE FROM token_items WHERE token_id IN (SELECT id FROM table_tokens WHERE tenant_id = $1)`,
          [tenantId]
        );
      }
    } catch {}
    await safeDelete('table_tokens');
    await safeDelete('restaurant_tables');

    // System 1 tables
    await safeDelete('subscription_events');
    await safeDelete('gst_invoices');
    await safeDelete('orders');
    await safeDelete('subscriptions');
    await safeDelete('users');
    await safeDelete('clients', 'id');
  } catch (err) {
    console.warn(`[cleanupTenant] Warning during cleanup of ${tenantId}:`, err.message);
  }
}

/**
 * Performs an authenticated HTTP request against the API.
 */
export async function apiRequest(method, path, { token, body = null, headers = {}, baseUrl = getBaseUrl() } = {}) {
  const url = `${baseUrl}${path}`;
  const reqHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };
  if (token) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers: reqHeaders,
  };

  if (body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
    options.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    let parsedData = null;
    let rawText = '';

    if (contentType.includes('application/json')) {
      parsedData = await res.json();
    } else {
      rawText = await res.text();
      try {
        parsedData = JSON.parse(rawText);
      } catch {
        parsedData = rawText;
      }
    }

    return {
      status: res.status,
      ok: res.ok,
      headers: res.headers,
      data: parsedData,
      rawText,
    };
  } catch (err) {
    return {
      status: 0,
      ok: false,
      headers: new Headers(),
      data: null,
      error: err.message,
    };
  }
}

/**
 * Performs an unauthenticated public HTTP request.
 */
export async function publicRequest(method, path, { body = null, headers = {}, baseUrl = getBaseUrl() } = {}) {
  return apiRequest(method, path, { token: null, body, headers, baseUrl });
}

/**
 * Listens to a Server-Sent Events (SSE) stream over HTTP.
 */
export function listenToSse(urlStr, { headers = {}, timeoutMs = 4000, matchEvent = null, maxEvents = 1 } = {}) {
  return new Promise((resolve) => {
    const url = new URL(urlStr);
    const events = [];
    let buffer = '';

    const timer = setTimeout(() => {
      req.destroy();
      resolve(events);
    }, timeoutMs);

    const req = http.get(url, { headers: { Accept: 'text/event-stream', ...headers } }, (res) => {
      res.on('data', (chunk) => {
        buffer += chunk.toString('utf8');
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          const lines = part.split('\n');
          let eventType = 'message';
          let eventData = '';
          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              eventData += line.slice(6);
            }
          }

          if (eventType || eventData) {
            let parsed = eventData;
            try { parsed = JSON.parse(eventData); } catch {}
            const ev = { event: eventType, data: parsed };
            events.push(ev);

            if (matchEvent && matchEvent(ev)) {
              clearTimeout(timer);
              req.destroy();
              return resolve(events);
            }

            if (events.length >= maxEvents) {
              clearTimeout(timer);
              req.destroy();
              return resolve(events);
            }
          }
        }
      });

      res.on('end', () => {
        clearTimeout(timer);
        resolve(events);
      });

      res.on('error', () => {
        clearTimeout(timer);
        resolve(events);
      });
    });

    req.on('error', () => {
      clearTimeout(timer);
      resolve(events);
    });
  });
}

/**
 * Authoritative Mathematical Reference: Proration Calculation Formula.
 */
export function calculateExpectedProration(currentPlanKey, remainingDays, targetPlanKey, isIntraState = false) {
  const currentPlan = PLANS_REFERENCE[currentPlanKey.toLowerCase()];
  const targetPlan = PLANS_REFERENCE[targetPlanKey.toLowerCase()];

  const remainingDaysValid = Math.max(0, remainingDays);
  const dailyRatePaise = Math.round((currentPlan.yearlyPrice * 100) / 365);
  const creditPaise = remainingDaysValid * dailyRatePaise;

  const targetPricePaise = targetPlan.yearlyPrice * 100;
  const subtotalPaise = Math.max(100, targetPricePaise - creditPaise);

  let cgstPaise = 0;
  let sgstPaise = 0;
  let igstPaise = 0;

  if (isIntraState) {
    cgstPaise = Math.round(subtotalPaise * 0.09);
    sgstPaise = Math.round(subtotalPaise * 0.09);
  } else {
    igstPaise = Math.round(subtotalPaise * 0.18);
  }

  const totalPaise = subtotalPaise + cgstPaise + sgstPaise + igstPaise;

  return {
    remainingDays: remainingDaysValid,
    dailyRatePaise,
    creditPaise,
    subtotalPaise,
    cgstPaise,
    sgstPaise,
    igstPaise,
    totalPaise,
  };
}

/**
 * Authoritative Indian Financial Year Calculation.
 */
export function getIndianFinancialYear(date = new Date()) {
  const month = date.getMonth() + 1; // 1-12
  const year = date.getFullYear();
  if (month >= 4) {
    return `${year}-${String(year + 1).slice(-2)}`;
  }
  return `${year - 1}-${String(year).slice(-2)}`;
}

/**
 * Authoritative Invoice Number Formatter.
 */
export function formatExpectedInvoiceNumber(fy, seq) {
  return `MQR/${fy}/${String(seq).padStart(5, '0')}`;
}
