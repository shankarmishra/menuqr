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

test('Batch 2 #2: Subscription renewal powered by Cashfree instead of Razorpay', async (t) => {
  const originalPool = pool;
  const originalFetch = global.fetch;
  const originalAppId = process.env.CASHFREE_APP_ID;
  const originalSecret = process.env.CASHFREE_SECRET_KEY;

  t.afterEach(() => {
    process.env.CASHFREE_APP_ID = originalAppId;
    process.env.CASHFREE_SECRET_KEY = originalSecret;
    global.fetch = originalFetch;
    setPool(originalPool);
  });

  await t.test('Cashfree verification successfully renews subscription when paid on Cashfree PG', async () => {
    process.env.CASHFREE_APP_ID = 'cf_app_test_123';
    process.env.CASHFREE_SECRET_KEY = 'cf_secret_test_123';
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;

    const sourceOrder = {
      id: 'order_source_paid_123',
      customer_name: 'Renewal Customer',
      customer_email: 'renew@example.com',
      business_name: 'Renewal Dhaba',
      plan_id: 'PREMIUM',
      amount: 2999,
      status: 'PAID',
    };

    let insertedPaymentGateway = null;
    let insertedPaymentTxId = null;

    setPool({
      query: async (sql, params) => {
        if (sql.includes('SELECT * FROM orders WHERE id=$1')) return { rows: [sourceOrder] };
        if (sql.includes('SELECT id, tenant_id FROM users WHERE email=$1')) return { rows: [{ id: 'u_1', tenant_id: 't_1' }] };
        if (sql.includes('INSERT INTO orders')) return { rowCount: 1 };
        if (sql.includes('INSERT INTO payments')) {
          insertedPaymentGateway = params[2];
          insertedPaymentTxId = params[3];
          return { rowCount: 1 };
        }
        if (sql.includes('SELECT * FROM subscriptions WHERE tenant_id=$1')) {
          return {
            rows: [{
              id: 'sub_1',
              tenant_id: 't_1',
              plan_id: 'PREMIUM',
              status: 'ACTIVE',
              expires_at: new Date(Date.now() + 10 * 24 * 3600 * 1000),
            }]
          };
        }
        if (sql.includes('UPDATE subscriptions')) return { rowCount: 1 };
        if (sql.includes('INSERT INTO email_outbox')) return { rows: [{ id: 'outbox_1' }] };
        return { rows: [] };
      }
    });

    global.fetch = async (url) => {
      if (url.includes('/orders/cf_order_renew_123')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            cf_order_id: 'cf_tx_999888',
            order_id: 'cf_order_renew_123',
            order_status: 'PAID',
            order_amount: 2999,
            order_currency: 'INR',
          }),
        };
      }
      return { ok: false, status: 404 };
    };

    const req = createMockRequest({
      planId: 'PREMIUM',
      cashfreeOrderId: 'cf_order_renew_123',
    });
    const res = createMockResponse();

    const handled = await purchaseRoutes(req, res, new URL(`http://localhost/api/purchase/renew/${sourceOrder.id}`));
    assert.equal(handled, true);
    assert.equal(res.result.statusCode, 200);
    assert.equal(res.result.body.success, true);
    assert.equal(res.result.body.plan.toUpperCase(), 'PREMIUM');
    assert.equal(insertedPaymentGateway, 'cashfree');
    assert.equal(insertedPaymentTxId, 'cf_tx_999888');
  });
});
