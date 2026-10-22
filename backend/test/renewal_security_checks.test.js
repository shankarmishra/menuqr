import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { setPool, pool } from '../db.js';
import purchaseRoutes from '../routes/purchase.js';

function createMockRequest(body, headers = {}) {
  const rawText = JSON.stringify(body);
  const req = Readable.from([Buffer.from(rawText)]);
  req.method = 'POST';
  req.headers = {
    'content-type': 'application/json',
    ...headers,
  };
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

test('Renewal Security & Extension Verification Suite', async (t) => {
  const originalPool = pool;
  const originalEnv = process.env.NODE_ENV;
  const originalAppId = process.env.CASHFREE_APP_ID;
  const originalSecret = process.env.CASHFREE_SECRET_KEY;
  const originalFetch = global.fetch;

  t.afterEach(() => {
    setPool(originalPool);
    process.env.NODE_ENV = originalEnv;
    process.env.CASHFREE_APP_ID = originalAppId;
    process.env.CASHFREE_SECRET_KEY = originalSecret;
    global.fetch = originalFetch;
  });

  const mockSourceOrder = {
    id: 'order_source_renewal_1',
    customer_name: 'Renewal Owner',
    customer_email: 'renew@example.com',
    business_name: 'Renew Cafe',
    plan_id: 'intermediate',
    amount: 1499,
    currency: 'INR',
    status: 'PAID',
    provisioning_status: 'COMPLETE',
  };

  const mockUser = {
    id: 'user_renew_1',
    email: 'renew@example.com',
    tenant_id: 'tenant_renew_1',
  };

  const mockCurrentSub = {
    id: 'sub_renew_1',
    tenant_id: 'tenant_renew_1',
    plan_id: 'INTERMEDIATE',
    status: 'ACTIVE',
    expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days in future
  };

  await t.test('Check (a): mockSuccess in production is REJECTED and cannot bypass payment', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.CASHFREE_APP_ID;
    delete process.env.CASHFREE_SECRET_KEY;

    setPool({
      query: async (sql) => {
        if (sql.includes('FROM orders WHERE id=$1')) return { rows: [mockSourceOrder] };
        if (sql.includes('FROM users WHERE email=$1')) return { rows: [mockUser] };
        return { rows: [] };
      }
    });

    const req = createMockRequest({ planId: 'intermediate', mockSuccess: true });
    const res = createMockResponse();
    const url = new URL('http://localhost/api/purchase/renew/order_source_renewal_1');

    await assert.rejects(
      async () => purchaseRoutes(req, res, url),
      (err) => err.status === 400 && err.message.includes('missing or invalid'),
      'CRITICAL: Production must reject mockSuccess request body bypass!'
    );
  });

  await t.test('Check (e) 1: Amount mismatch from Cashfree payment is REJECTED', async () => {
    process.env.NODE_ENV = 'production';
    process.env.CASHFREE_APP_ID = 'cf_app_test';
    process.env.CASHFREE_SECRET_KEY = 'cf_secret_test';

    global.fetch = async () => ({
      ok: true,
      json: async () => ({
        order_status: 'PAID',
        order_amount: 499, // Underpayment: intermediate plan is 1499
        cf_order_id: 'cf_mismatch_1',
      })
    });

    setPool({
      query: async (sql) => {
        if (sql.includes('FROM orders WHERE id=$1')) return { rows: [mockSourceOrder] };
        if (sql.includes('FROM users WHERE email=$1')) return { rows: [mockUser] };
        return { rows: [] };
      }
    });

    const req = createMockRequest({ planId: 'intermediate', cashfreeOrderId: 'cf_mismatch_1' });
    const res = createMockResponse();
    const url = new URL('http://localhost/api/purchase/renew/order_source_renewal_1');

    await assert.rejects(
      async () => purchaseRoutes(req, res, url),
      (err) => err.status === 400 && err.message.includes('Payment amount mismatch'),
      'Renewal must reject amount mismatch!'
    );
  });

  await t.test('Check (e) 2: Reusing the same payment transaction ID twice is REJECTED', async () => {
    process.env.NODE_ENV = 'production';
    process.env.CASHFREE_APP_ID = 'cf_app_test';
    process.env.CASHFREE_SECRET_KEY = 'cf_secret_test';

    global.fetch = async () => ({
      ok: true,
      json: async () => ({
        order_status: 'PAID',
        order_amount: 1499,
        cf_order_id: 'cf_already_used_tx',
      })
    });

    setPool({
      query: async (sql, params) => {
        if (sql.includes('FROM orders WHERE id=$1')) return { rows: [mockSourceOrder] };
        if (sql.includes('FROM users WHERE email=$1')) return { rows: [mockUser] };
        if (sql.includes('FROM payments WHERE transaction_id = $1')) {
          // Already used in previous renewal
          return { rows: [{ id: 'pay_existing_1', transaction_id: params[0] }] };
        }
        return { rows: [] };
      }
    });

    const req = createMockRequest({ planId: 'intermediate', cashfreeOrderId: 'cf_already_used_tx' });
    const res = createMockResponse();
    const url = new URL('http://localhost/api/purchase/renew/order_source_renewal_1');

    await assert.rejects(
      async () => purchaseRoutes(req, res, url),
      (err) => err.status === 400 && err.message.includes('already been applied'),
      'Renewal must reject already-used payment transaction!'
    );
  });

  await t.test('Check (e) 3: Valid renewal extends EXISTING client subscription without creating duplicate clients', async () => {
    process.env.NODE_ENV = 'production';
    process.env.CASHFREE_APP_ID = 'cf_app_test';
    process.env.CASHFREE_SECRET_KEY = 'cf_secret_test';

    global.fetch = async () => ({
      ok: true,
      json: async () => ({
        order_status: 'PAID',
        order_amount: 1499,
        cf_order_id: 'cf_valid_renewal_tx_123',
      })
    });

    let clientInsertCount = 0;
    let subscriptionUpdated = false;
    let updatedExpiry = null;

    setPool({
      query: async (sql, params) => {
        if (sql.includes('FROM orders WHERE id=$1')) return { rows: [mockSourceOrder] };
        if (sql.includes('FROM users WHERE email=$1')) return { rows: [mockUser] };
        if (sql.includes('FROM payments WHERE transaction_id = $1')) return { rows: [] };
        if (sql.includes('INSERT INTO clients')) {
          clientInsertCount++;
          return { rows: [] };
        }
        if (sql.includes('FROM subscriptions WHERE tenant_id=$1')) return { rows: [mockCurrentSub] };
        if (sql.includes('UPDATE subscriptions SET plan_id=$1')) {
          subscriptionUpdated = true;
          updatedExpiry = params[1];
          return { rowCount: 1 };
        }
        return { rows: [], rowCount: 1 };
      }
    });

    const req = createMockRequest({ planId: 'intermediate', cashfreeOrderId: 'cf_valid_renewal_tx_123' });
    const res = createMockResponse();
    const url = new URL('http://localhost/api/purchase/renew/order_source_renewal_1');

    const handled = await purchaseRoutes(req, res, url);
    assert.equal(handled, true);
    assert.equal(res.result.statusCode, 200);
    assert.equal(res.result.body.success, true);
    assert.equal(res.result.body.tenantId, 'tenant_renew_1');

    // Confirm existing client was NOT duplicated
    assert.equal(clientInsertCount, 0, 'Renewal must never insert duplicate client records!');
    assert.equal(subscriptionUpdated, true, 'Existing subscription must be updated!');

    // Confirm expiry was extended by +1 year from existing future expiry
    const expectedMinExpiry = new Date(mockCurrentSub.expires_at.getTime() + 360 * 24 * 60 * 60 * 1000);
    assert.ok(
      new Date(updatedExpiry) >= expectedMinExpiry,
      `Updated expiry (${updatedExpiry}) must extend existing expiry (${mockCurrentSub.expires_at}) by 1 year!`
    );
  });
});
