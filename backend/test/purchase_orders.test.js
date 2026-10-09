import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { setPool, pool } from '../db.js';
import purchaseRoutes, { processOrderPaymentAndProvision } from '../routes/purchase.js';

function createMockRequest(body, headers = {}, method = 'POST') {
  const json = typeof body === 'string' ? body : JSON.stringify(body);
  const req = Readable.from([Buffer.from(json)]);
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

test('POST /api/purchase/orders unit test suite', async (t) => {
  const originalPool = pool;

  t.after(() => {
    setPool(originalPool);
  });

  await t.test('1. missing required fields throws 400 apiError', async () => {
    const req = createMockRequest({ customerEmail: 'test@example.com' });
    const res = createMockResponse();
    const url = new URL('http://localhost/api/purchase/orders');

    await assert.rejects(
      async () => purchaseRoutes(req, res, url),
      (err) => err.status === 400 && err.message.includes('Missing required fields')
    );
  });

  await t.test('2. invalid plan selected throws 400 apiError', async () => {
    const req = createMockRequest({
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      businessName: 'John Cafe',
      planId: 'super_invalid_plan'
    });
    const res = createMockResponse();
    const url = new URL('http://localhost/api/purchase/orders');

    await assert.rejects(
      async () => purchaseRoutes(req, res, url),
      (err) => err.status === 400 && err.message.includes('Invalid plan selected')
    );
  });

  await t.test('3. existing PENDING_PAYMENT order reuse executes without TDZ or isSandbox error', async () => {
    const queries = [];
    setPool({
      query: async (sql, params) => {
        queries.push({ sql, params });
        if (sql.includes('SELECT id, tenant_id FROM users')) {
          return { rows: [] };
        }
        if (sql.includes('SELECT id FROM orders')) {
          return { rows: [{ id: 'order_existing12345' }] };
        }
        if (sql.includes('UPDATE orders SET customer_name')) {
          return { rowCount: 1 };
        }
        return { rows: [] };
      }
    });

    const req = createMockRequest({
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      businessName: 'John Cafe',
      planId: 'basic'
    });
    const res = createMockResponse();
    const url = new URL('http://localhost/api/purchase/orders');

    const handled = await purchaseRoutes(req, res, url);
    assert.equal(handled, true);
    assert.equal(res.result.statusCode, 200);
    assert.equal(res.result.body.orderId, 'order_existing12345');
    assert.equal(res.result.body.status, 'PENDING_PAYMENT');
    assert.equal(res.result.body.cashfreeMode, 'sandbox');
  });

  await t.test('4. new order creation executes successfully and returns 200 OK', async () => {
    const queries = [];
    setPool({
      query: async (sql, params) => {
        queries.push({ sql, params });
        if (sql.includes('SELECT id, tenant_id FROM users')) {
          return { rows: [] };
        }
        if (sql.includes('SELECT id FROM orders')) {
          return { rows: [] };
        }
        if (sql.includes('INSERT INTO orders')) {
          return { rowCount: 1 };
        }
        return { rows: [] };
      }
    });

    const req = createMockRequest({
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      businessName: 'Jane Bakery',
      planId: 'intermediate'
    });
    const res = createMockResponse();
    const url = new URL('http://localhost/api/purchase/orders');

    const handled = await purchaseRoutes(req, res, url);
    assert.equal(handled, true);
    assert.equal(res.result.statusCode, 200);
    assert.match(res.result.body.orderId, /^order_/);
    assert.equal(res.result.body.amount, 1499);
    assert.equal(res.result.body.status, 'PENDING_PAYMENT');
    assert.equal(res.result.body.cashfreeMode, 'sandbox');
  });

  await t.test('5. Cashfree webhook processes PAID event and provisions order idempotently', async () => {
    const mockOrder = {
      id: 'order_test_webhook_123',
      customer_name: 'Webhook User',
      customer_email: 'webhook@example.com',
      business_name: 'Webhook Diner',
      plan_id: 'premium',
      amount: 2999,
      status: 'PENDING_PAYMENT',
      provisioning_status: 'PENDING',
      activation_email_sent: false,
      payment_receipt_email_sent: false,
    };

    setPool({
      query: async (sql, params) => {
        if (sql.includes('SELECT * FROM orders WHERE id = $1')) {
          return { rows: [mockOrder] };
        }
        if (sql.includes('SELECT provisioning_status FROM orders')) {
          return { rows: [{ provisioning_status: mockOrder.provisioning_status }] };
        }
        if (sql.includes('SELECT id, tenant_id FROM users')) {
          return { rows: [] };
        }
        if (sql.includes('SELECT id FROM clients')) {
          return { rows: [] };
        }
        if (sql.includes('SELECT expires_at FROM subscriptions')) {
          return { rows: [{ expires_at: new Date() }] };
        }
        if (sql.includes('INSERT INTO email_outbox')) {
          return { rows: [{ id: 'outbox_mock_123', status: 'QUEUED' }] };
        }
        return { rows: [], rowCount: 1 };
      }
    });

    const req = createMockRequest({
      type: 'PAYMENT_SUCCESS_WEBHOOK',
      data: {
        order: {
          order_id: 'order_test_webhook_123',
          order_amount: 2999,
          order_status: 'PAID'
        },
        payment: {
          cf_payment_id: 998877,
          payment_status: 'SUCCESS'
        }
      }
    });
    const res = createMockResponse();
    const url = new URL('http://localhost/api/webhooks/cashfree');

    const handled = await purchaseRoutes(req, res, url);
    assert.equal(handled, true);
    assert.equal(res.result.statusCode, 200);
    assert.equal(res.result.body.received, true);
    assert.equal(res.result.body.status, 'PAID');
    assert.equal(res.result.body.emailSent, true);
  });

  await t.test('6. Duplicate webhook event for already provisioned order returns alreadyProvisioned: true', async () => {
    const mockOrderPaid = {
      id: 'order_test_paid_123',
      customer_name: 'Already Paid',
      customer_email: 'paid@example.com',
      business_name: 'Paid Bistro',
      plan_id: 'basic',
      amount: 999,
      status: 'PAID',
      provisioning_status: 'COMPLETE',
      activation_email_sent: true,
      payment_receipt_email_sent: true,
    };

    setPool({
      query: async (sql, params) => {
        if (sql.includes('SELECT * FROM orders WHERE id = $1')) {
          return { rows: [mockOrderPaid] };
        }
        return { rows: [], rowCount: 1 };
      }
    });

    const req = createMockRequest({
      type: 'PAYMENT_SUCCESS_WEBHOOK',
      data: {
        order: {
          order_id: 'order_test_paid_123',
          order_status: 'PAID'
        }
      }
    });
    const res = createMockResponse();
    const url = new URL('http://localhost/api/webhooks/cashfree');

    const handled = await purchaseRoutes(req, res, url);
    assert.equal(handled, true);
    assert.equal(res.result.statusCode, 200);
    assert.equal(res.result.body.alreadyProvisioned, true);
  });

  await t.test('7. Cashfree webhook PAYMENT_FAILED event marks order FAILED', async () => {
    const updatedStatus = [];
    setPool({
      query: async (sql, params) => {
        if (sql.includes('UPDATE orders SET status=\'FAILED\'')) {
          updatedStatus.push(params);
        }
        return { rows: [], rowCount: 1 };
      }
    });

    const req = createMockRequest({
      type: 'PAYMENT_FAILED_WEBHOOK',
      data: {
        order: {
          order_id: 'order_failed_123',
          order_status: 'FAILED'
        }
      }
    });
    const res = createMockResponse();
    const url = new URL('http://localhost/api/webhooks/cashfree');

    const handled = await purchaseRoutes(req, res, url);
    assert.equal(handled, true);
    assert.equal(res.result.statusCode, 200);
    assert.equal(res.result.body.status, 'FAILED');
    assert.equal(updatedStatus.length, 1);
    assert.equal(updatedStatus[0][0], 'order_failed_123');
  });
});
