import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { setPool, pool } from '../db.js';
import purchaseRoutes from '../routes/purchase.js';

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

test('Issue #2: clear_password storage and GET /api/purchase/orders/:id credential leak', async (t) => {
  const originalPool = pool;
  const originalFetch = global.fetch;

  t.afterEach(() => {
    global.fetch = originalFetch;
    setPool(originalPool);
  });

  await t.test('ATTACK: Order creation must NOT persist clear_password in order metadata', async () => {
    let capturedMetadata = null;

    setPool({
      query: async (sql, params) => {
        if (sql.includes('SELECT id FROM client_otp_challenges')) {
          return { rows: [{ id: 'chal_mock_123' }] };
        }
        if (sql.includes('SELECT * FROM email_verification_grants')) {
          return { rows: [{ id: 'grant_123', used: false }] };
        }
        if (sql.includes('UPDATE email_verification_grants')) {
          return { rowCount: 1, rows: [{ id: 'grant_123' }] };
        }
        if (sql.includes('SELECT id, tenant_id FROM users')) {
          return { rows: [] };
        }
        if (sql.includes('SELECT id FROM orders')) {
          return { rows: [] };
        }
        if (sql.includes('INSERT INTO orders')) {
          // In INSERT query, metadata is parameter $26
          capturedMetadata = params[25];
          return { rowCount: 1 };
        }
        return { rows: [] };
      }
    });

    global.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({ payment_session_id: 'session_mock' }),
      text: async () => JSON.stringify({ payment_session_id: 'session_mock' }),
    });

    const secretPassword = 'SuperSecretClearPassword!123';
    const req = createMockRequest({
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      businessName: 'John Bistro',
      planId: 'PREMIUM',
      password: secretPassword,
      emailVerificationToken: 'vgrant_test_token',
    });
    const res = createMockResponse();

    await purchaseRoutes(req, res, new URL('http://localhost/api/purchase/orders'));

    assert.equal(res.result.statusCode, 200);
    assert.ok(capturedMetadata, 'Metadata should be stored for password hash');
    const parsedMeta = JSON.parse(capturedMetadata);

    // BUG CHECK: In vulnerable code, parsedMeta contains clear_password!
    assert.equal(
      parsedMeta.clear_password,
      undefined,
      'CRITICAL VULNERABILITY: clear_password was stored in plain text in database order metadata!'
    );
    assert.ok(parsedMeta.password_hash, 'Safe password_hash should still be stored for provisioning');
  });

  await t.test('ATTACK: GET /api/purchase/orders/:id must NOT expose metadata or plaintext credentials to unauthenticated users', async () => {
    const leakOrder = {
      id: 'order_test_leak_123',
      customer_name: 'Victim User',
      customer_email: 'victim@example.com',
      business_name: 'Victim Cafe',
      plan_id: 'PREMIUM',
      amount: 1499,
      currency: 'INR',
      status: 'PENDING_PAYMENT',
      metadata: {
        password_hash: '$pbkdf2-sha256$mockhash',
        clear_password: 'VictimPlainTextPassword123!',
      },
      lock_token: 'secret_lock_token_xyz',
    };

    setPool({
      query: async (sql, params) => {
        if (sql.includes('SELECT * FROM orders WHERE id = $1')) {
          if (params[0] === 'order_test_leak_123') {
            return { rows: [leakOrder] };
          }
        }
        return { rows: [] };
      }
    });

    const req = createMockRequest({}, {}, 'GET');
    const res = createMockResponse();

    await purchaseRoutes(req, res, new URL(`http://localhost/api/purchase/orders/${leakOrder.id}`));

    assert.equal(res.result.statusCode, 200);
    const body = res.result.body;

    // The endpoint should not expose metadata, clear_password, password_hash, or internal lock_tokens
    assert.equal(body.clear_password, undefined, 'clear_password leaked on unauthenticated endpoint');
    assert.equal(body.lock_token, undefined, 'internal lock_token leaked on unauthenticated endpoint');
    if (body.metadata) {
      assert.equal(body.metadata.clear_password, undefined, 'metadata.clear_password leaked on unauthenticated endpoint');
      assert.equal(body.metadata.password_hash, undefined, 'metadata.password_hash leaked on unauthenticated endpoint');
    }
  });
});
