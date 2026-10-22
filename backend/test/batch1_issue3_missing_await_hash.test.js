import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { createHash } from 'node:crypto';
import { setPool, pool } from '../db.js';
import adminRoutes from '../routes/admin.js';
import { processOrderPaymentAndProvision } from '../routes/purchase.js';

function createMockRequest(body, headers = {}, method = 'POST') {
  const rawText = typeof body === 'string' ? body : JSON.stringify(body);
  const req = Readable.from([Buffer.from(rawText)]);
  req.method = method;
  req.headers = { 'content-type': 'application/json', ...headers };
  return req;
}

function createMockResponse() {
  let statusCode = 200;
  let headers = {};
  let body = '';
  return {
    writeHead(status, hdrs) {
      statusCode = status;
      headers = hdrs || {};
    },
    end(str) {
      body = str;
    },
    get result() {
      return { statusCode, headers, body: JSON.parse(body || '{}') };
    }
  };
}

test('Issue #3: Missing await on hashPassword in admin.js and purchase.js', async (t) => {
  const originalPool = pool;

  t.afterEach(() => {
    setPool(originalPool);
  });

  await t.test('ATTACK: Admin client creation must await hashPassword before INSERT INTO users', async () => {
    let capturedUserPasswordHash = null;
    const adminToken = 'admin_valid_session_token_123';
    const adminTokenHash = createHash('sha256').update(adminToken).digest('hex');

    setPool({
      query: async (sql, params) => {
        // Mock admin session validation
        if (sql.includes('FROM admin_sessions s')) {
          if (params[0] === adminTokenHash) {
            return {
              rows: [{
                session_id: 's_123',
                admin_id: 'adm_123',
                email: 'xshankarmishra@gmail.com',
                status: 'active',
                expires_at: new Date(Date.now() + 3600000),
              }]
            };
          }
        }
        if (sql.includes('SELECT id FROM clients WHERE id = $1')) return { rows: [] };
        if (sql.includes('SELECT id FROM clients WHERE menu_slug = $1')) return { rows: [] };
        if (sql.includes('SELECT id FROM users WHERE email = $1')) return { rows: [] };
        if (sql.includes('INSERT INTO clients')) return { rowCount: 1 };
        if (sql.includes('INSERT INTO users')) {
          // SQL: INSERT INTO users (id, email, password_hash, role, tenant_id) VALUES ($1, $2, $3, $4, $5)
          capturedUserPasswordHash = params[2];
          return { rowCount: 1 };
        }
        if (sql.includes('INSERT INTO notifications')) return { rowCount: 1 };
        return { rows: [] };
      }
    });

    const clientPayload = {
      businessName: 'Admin Created Dhaba',
      category: 'dhabas',
      menuSlug: 'admin-created-dhaba',
      ownerName: 'Admin Partner',
      email: 'partner@example.com',
      services: ['dine_in'],
      menuItems: [{ name: 'Chai', price: '20' }],
      password: 'AdminCustomPassword123!',
    };

    const req = createMockRequest(clientPayload, {
      cookie: `menusqr_admin_session=${adminToken}`,
    });
    const res = createMockResponse();

    await adminRoutes(req, res, new URL('http://localhost/api/admin/clients'));

    assert.equal(res.result.statusCode, 201);
    assert.ok(capturedUserPasswordHash, 'Password hash must be captured during user creation');

    // BUG CHECK: In vulnerable code, capturedUserPasswordHash is a Promise instance!
    assert.equal(
      typeof capturedUserPasswordHash,
      'string',
      `CRITICAL VULNERABILITY: password_hash passed to DB was a ${typeof capturedUserPasswordHash} (unawaited Promise)`
    );
    assert.notEqual(
      String(capturedUserPasswordHash),
      '[object Promise]',
      'CRITICAL VULNERABILITY: password_hash was stored as literal "[object Promise]"'
    );
    assert.match(
      capturedUserPasswordHash,
      /^\$pbkdf2-sha256\$/,
      'password_hash must be a valid resolved PBKDF2 hash string'
    );
  });

  await t.test('ATTACK: Purchase order provisioning with no preset password must await hashPassword', async () => {
    let capturedUserPasswordHash = null;

    const mockOrder = {
      id: 'order_no_pwd_123',
      customer_name: 'Auto Pass Customer',
      customer_email: 'autopass@example.com',
      business_name: 'Auto Pass Cafe',
      plan_id: 'PREMIUM',
      amount: 1499,
      status: 'PENDING_PAYMENT',
      provisioning_status: 'PENDING',
      metadata: {}, // No password_hash provided! Must generate and await hash
    };

    setPool({
      query: async (sql, params) => {
        if (sql.includes('SELECT * FROM orders WHERE id = $1')) return { rows: [mockOrder] };
        if (sql.includes('SELECT provisioning_status FROM orders')) return { rows: [{ provisioning_status: 'PENDING' }] };
        if (sql.includes('SELECT id, tenant_id FROM users')) return { rows: [] };
        if (sql.includes('SELECT id FROM clients')) return { rows: [] };
        if (sql.includes('SELECT expires_at FROM subscriptions')) return { rows: [{ expires_at: new Date() }] };
        if (sql.includes('INSERT INTO email_outbox')) return { rows: [{ id: 'outbox_1' }] };
        return { rows: [], rowCount: 1 };
      },
      connect: async () => ({
        query: async (sql, params) => {
          if (sql.includes('SELECT id, tenant_id FROM users')) return { rows: [] };
          if (sql.includes('INSERT INTO users')) {
            // SQL: INSERT INTO users (... password_hash ...) VALUES ($1,$2,$3,...)
            capturedUserPasswordHash = params[2];
            return { rowCount: 1 };
          }
          if (sql.includes('SELECT id FROM clients')) return { rows: [] };
          if (sql.includes('SELECT expires_at FROM subscriptions')) return { rows: [{ expires_at: new Date() }] };
          return { rows: [], rowCount: 1 };
        },
        release: () => {},
      })
    });

    await processOrderPaymentAndProvision({
      orderId: mockOrder.id,
      paidAmount: 1499,
      isWebhook: true,
      webhookVerified: true,
      transactionId: 'tx_mock_123',
      paymentDetails: { cf_payment_id: 112233, payment_status: 'SUCCESS' },
    });

    assert.ok(capturedUserPasswordHash, 'Password hash must be captured during user creation');

    // BUG CHECK: In vulnerable code, capturedUserPasswordHash is a Promise instance!
    assert.equal(
      typeof capturedUserPasswordHash,
      'string',
      `CRITICAL VULNERABILITY: purchase provisioning password_hash was a ${typeof capturedUserPasswordHash} (unawaited Promise)`
    );
    assert.notEqual(
      String(capturedUserPasswordHash),
      '[object Promise]',
      'CRITICAL VULNERABILITY: purchase provisioning password_hash was stored as literal "[object Promise]"'
    );
    assert.match(
      capturedUserPasswordHash,
      /^\$pbkdf2-sha256\$/,
      'password_hash must be a valid resolved PBKDF2 hash string'
    );
  });
});
