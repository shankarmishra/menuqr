import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { createHmac } from 'node:crypto';
import { setPool, pool } from '../db.js';
import purchaseRoutes, { processOrderPaymentAndProvision } from '../routes/purchase.js';

const TEST_SECRET = 'test_cashfree_secret_key_12345';

function createMockRequest(body, headers = {}, method = 'POST') {
  const rawText = typeof body === 'string' ? body : JSON.stringify(body);
  const req = Readable.from([Buffer.from(rawText)]);
  req.method = method;
  req.headers = { 'content-type': 'application/json', ...headers };
  return req;
}

function createMockSignedRequest(bodyObj, secretKey = TEST_SECRET, timestamp = null, customSig = null) {
  const ts = timestamp ? String(timestamp) : String(Date.now());
  const rawText = JSON.stringify(bodyObj);
  const payloadToSign = `${ts}${rawText}`;
  const sig = customSig || createHmac('sha256', secretKey).update(payloadToSign).digest('base64');
  const req = Readable.from([Buffer.from(rawText)]);
  req.method = 'POST';
  req.headers = {
    'content-type': 'application/json',
    'x-webhook-signature': sig,
    'x-webhook-timestamp': ts,
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

test('POST /api/purchase/orders unit test suite', async (t) => {
  const originalPool = pool;
  const originalFetch = global.fetch;
  const originalEnvSecret = process.env.CASHFREE_SECRET_KEY;
  const originalEnvAppId = process.env.CASHFREE_APP_ID;
  let mockedFetchCalls = 0;

  t.beforeEach(() => {
    process.env.CASHFREE_SECRET_KEY = TEST_SECRET;
    process.env.CASHFREE_APP_ID = 'test_app_id_12345';
    mockedFetchCalls = 0;
    setPool({
      query: async (sql) => {
        if (sql.includes('SELECT id FROM client_otp_challenges')) return { rows: [{ id: 'chal_default_mock' }] };
        if (sql.includes('SELECT id, tenant_id FROM users')) return { rows: [] };
        if (sql.includes('SELECT id FROM orders')) return { rows: [] };
        if (sql.includes('INSERT INTO orders')) return { rowCount: 1 };
        return { rows: [] };
      }
    });
    global.fetch = async (url, options) => {
      mockedFetchCalls++;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          cf_order_id: 'cf_mock_order_123',
          order_id: 'order_mock_123',
          order_status: 'PAID',
          order_amount: 2999,
          order_currency: 'INR',
          payment_session_id: 'session_mock_123'
        }),
        text: async () => JSON.stringify({
          cf_order_id: 'cf_mock_order_123',
          order_id: 'order_mock_123',
          order_status: 'PAID',
          order_amount: 2999,
          order_currency: 'INR',
          payment_session_id: 'session_mock_123'
        })
      };
    };
  });

  t.afterEach(() => {
    global.fetch = originalFetch;
  });

  t.after(() => {
    setPool(originalPool);
    global.fetch = originalFetch;
    if (originalEnvSecret !== undefined) process.env.CASHFREE_SECRET_KEY = originalEnvSecret;
    else delete process.env.CASHFREE_SECRET_KEY;
    if (originalEnvAppId !== undefined) process.env.CASHFREE_APP_ID = originalEnvAppId;
    else delete process.env.CASHFREE_APP_ID;
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

  await t.test('3. existing PENDING_PAYMENT order reuse executes without error', async () => {
    setPool({
      query: async (sql) => {
        if (sql.includes('SELECT * FROM email_verification_grants')) {
          return { rows: [{ id: 'grant_m1', token: 'vgrant_m1', email: 'john@example.com', purpose: 'checkout', used: false }] };
        }
        if (sql.includes('UPDATE email_verification_grants')) {
          return { rows: [{ id: 'grant_m1' }] };
        }
        if (sql.includes('SELECT id, tenant_id FROM users')) return { rows: [] };
        if (sql.includes('SELECT id FROM orders')) return { rows: [{ id: 'order_existing12345' }] };
        if (sql.includes('UPDATE orders SET customer_name')) return { rowCount: 1 };
        return { rows: [] };
      }
    });

    const req = createMockRequest({
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      businessName: 'John Cafe',
      planId: 'basic',
      emailVerificationToken: 'vgrant_m1'
    });
    const res = createMockResponse();
    const url = new URL('http://localhost/api/purchase/orders');

    const handled = await purchaseRoutes(req, res, url);
    assert.equal(handled, true);
    assert.equal(res.result.statusCode, 200);
    assert.equal(res.result.body.orderId, 'order_existing12345');
    assert.equal(res.result.body.status, 'PENDING_PAYMENT');
  });

  await t.test('4. new order creation executes successfully and returns 200 OK', async () => {
    setPool({
      query: async (sql) => {
        if (sql.includes('SELECT * FROM email_verification_grants')) {
          return { rows: [{ id: 'grant_m2', token: 'vgrant_m2', email: 'jane@example.com', purpose: 'checkout', used: false }] };
        }
        if (sql.includes('UPDATE email_verification_grants')) {
          return { rows: [{ id: 'grant_m2' }] };
        }
        if (sql.includes('SELECT id, tenant_id FROM users')) return { rows: [] };
        if (sql.includes('SELECT id FROM orders')) return { rows: [] };
        if (sql.includes('INSERT INTO orders')) return { rowCount: 1 };
        return { rows: [] };
      }
    });

    const req = createMockRequest({
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      businessName: 'Jane Bakery',
      planId: 'intermediate',
      emailVerificationToken: 'vgrant_m2'
    });
    const res = createMockResponse();
    const url = new URL('http://localhost/api/purchase/orders');

    const handled = await purchaseRoutes(req, res, url);
    assert.equal(handled, true);
    assert.equal(res.result.statusCode, 200);
    assert.match(res.result.body.orderId, /^order_/);
    assert.equal(res.result.body.amount, 1499);
    assert.equal(res.result.body.status, 'PENDING_PAYMENT');
  });

  await t.test('5. Cashfree webhook missing signature header is rejected with 401', async () => {
    const req = createMockRequest({ type: 'PAYMENT_SUCCESS_WEBHOOK', data: { order: { order_id: 'order_123' } } }, { 'x-webhook-timestamp': String(Date.now()) });
    const res = createMockResponse();
    const url = new URL('http://localhost/api/webhooks/cashfree');

    await assert.rejects(
      async () => purchaseRoutes(req, res, url),
      (err) => err.status === 401 && err.message.includes('Missing Cashfree webhook signature')
    );
  });

  await t.test('6. Cashfree webhook missing timestamp header is rejected with 401', async () => {
    const req = createMockRequest({ type: 'PAYMENT_SUCCESS_WEBHOOK', data: { order: { order_id: 'order_123' } } }, { 'x-webhook-signature': 'some_sig' });
    const res = createMockResponse();
    const url = new URL('http://localhost/api/webhooks/cashfree');

    await assert.rejects(
      async () => purchaseRoutes(req, res, url),
      (err) => err.status === 401 && err.message.includes('Missing Cashfree webhook signature')
    );
  });

  await t.test('7. Cashfree webhook with invalid signature is rejected with 401', async () => {
    const body = { type: 'PAYMENT_SUCCESS_WEBHOOK', data: { order: { order_id: 'order_123' } } };
    const req = createMockSignedRequest(body, TEST_SECRET, String(Date.now()), 'invalid_signature_hash');
    const res = createMockResponse();
    const url = new URL('http://localhost/api/webhooks/cashfree');

    await assert.rejects(
      async () => purchaseRoutes(req, res, url),
      (err) => err.status === 401 && err.message.includes('Invalid Cashfree webhook signature')
    );
  });

  await t.test('8. Cashfree webhook signed for body A but sending body B is rejected with 401', async () => {
    const bodyA = { type: 'PAYMENT_SUCCESS_WEBHOOK', data: { order: { order_id: 'order_123' } } };
    const timestamp = String(Date.now());
    const sigA = createHmac('sha256', TEST_SECRET).update(`${timestamp}${JSON.stringify(bodyA)}`).digest('base64');

    const bodyB = { type: 'PAYMENT_SUCCESS_WEBHOOK', data: { order: { order_id: 'order_TAMPERED' } } };
    const req = Readable.from([Buffer.from(JSON.stringify(bodyB))]);
    req.method = 'POST';
    req.headers = { 'content-type': 'application/json', 'x-webhook-signature': sigA, 'x-webhook-timestamp': timestamp };
    const res = createMockResponse();
    const url = new URL('http://localhost/api/webhooks/cashfree');

    await assert.rejects(
      async () => purchaseRoutes(req, res, url),
      (err) => err.status === 401 && err.message.includes('Invalid Cashfree webhook signature')
    );
  });

  await t.test('9. Validly signed Cashfree webhook processes PAID event and provisions order idempotently', async () => {
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
      query: async (sql) => {
        if (sql.includes('SELECT * FROM orders WHERE id = $1')) return { rows: [mockOrder] };
        if (sql.includes('SELECT provisioning_status FROM orders')) return { rows: [{ provisioning_status: mockOrder.provisioning_status }] };
        if (sql.includes('SELECT id, tenant_id FROM users')) return { rows: [] };
        if (sql.includes('SELECT id FROM clients')) return { rows: [] };
        if (sql.includes('SELECT expires_at FROM subscriptions')) return { rows: [{ expires_at: new Date() }] };
        if (sql.includes('INSERT INTO email_outbox')) return { rows: [{ id: 'outbox_mock_123', status: 'QUEUED' }] };
        return { rows: [], rowCount: 1 };
      }
    });

    const bodyObj = {
      type: 'PAYMENT_SUCCESS_WEBHOOK',
      data: {
        order: { order_id: 'order_test_webhook_123', order_amount: 2999, order_status: 'PAID' },
        payment: { cf_payment_id: 998877, payment_status: 'SUCCESS' }
      }
    };

    const req = createMockSignedRequest(bodyObj);
    const res = createMockResponse();
    const url = new URL('http://localhost/api/webhooks/cashfree');

    const handled = await purchaseRoutes(req, res, url);
    assert.equal(handled, true);
    assert.equal(res.result.statusCode, 200);
    assert.equal(res.result.body.received, true);
    assert.equal(res.result.body.status, 'PAID');
    assert.equal(res.result.body.emailSent, true);
  });

  await t.test('10. Duplicate signed webhook event for already provisioned order returns alreadyProvisioned: true', async () => {
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
      query: async (sql) => {
        if (sql.includes('SELECT * FROM orders WHERE id = $1')) return { rows: [mockOrderPaid] };
        return { rows: [], rowCount: 1 };
      }
    });

    const bodyObj = {
      type: 'PAYMENT_SUCCESS_WEBHOOK',
      data: { order: { order_id: 'order_test_paid_123', order_status: 'PAID' } }
    };

    const req = createMockSignedRequest(bodyObj);
    const res = createMockResponse();
    const url = new URL('http://localhost/api/webhooks/cashfree');

    const handled = await purchaseRoutes(req, res, url);
    assert.equal(handled, true);
    assert.equal(res.result.statusCode, 200);
    assert.equal(res.result.body.alreadyProvisioned, true);
  });

  await t.test('11. Unsigned or invalid event cannot update payment or provision tenant', async () => {
    let updateCalled = false;
    setPool({
      query: async () => {
        updateCalled = true;
        return { rows: [], rowCount: 1 };
      }
    });

    const bodyObj = { type: 'PAYMENT_SUCCESS_WEBHOOK', data: { order: { order_id: 'order_unauthorized' } } };
    const req = createMockRequest(bodyObj); // Unsigned
    const res = createMockResponse();
    const url = new URL('http://localhost/api/webhooks/cashfree');

    await assert.rejects(
      async () => purchaseRoutes(req, res, url),
      (err) => err.status === 401
    );
    assert.equal(updateCalled, false);
  });

  await t.test('12. Missing CASHFREE_SECRET_KEY server configuration fails closed with 500', async () => {
    delete process.env.CASHFREE_SECRET_KEY;
    const req = createMockRequest({ type: 'PAYMENT_SUCCESS_WEBHOOK' }, { 'x-webhook-signature': 'sig', 'x-webhook-timestamp': '123' });
    const res = createMockResponse();
    const url = new URL('http://localhost/api/webhooks/cashfree');

    await assert.rejects(
      async () => purchaseRoutes(req, res, url),
      (err) => err.status === 500 && err.message.includes('CASHFREE_SECRET_KEY is missing')
    );
  });

  await t.test('13. Non-existent order ID in processOrderPaymentAndProvision throws 404', async () => {
    setPool({
      query: async () => ({ rows: [] })
    });

    await assert.rejects(
      async () => processOrderPaymentAndProvision({ orderId: 'non_existent_order_id' }),
      (err) => err.status === 404 && err.message.includes('Order not found')
    );
  });

  await t.test('14. GET /api/webhooks/cashfree health check returns 200 OK', async () => {
    const req = createMockRequest({}, {}, 'GET');
    const res = createMockResponse();
    const url = new URL('http://localhost/api/webhooks/cashfree');

    const handled = await purchaseRoutes(req, res, url);
    assert.equal(handled, true);
    assert.equal(res.result.statusCode, 200);
    assert.equal(res.result.body.status, 'OK');
  });

  await t.test('15. Signed PAYMENT_FAILED_WEBHOOK marks order status FAILED for pending order and does NOT provision', async () => {
    let updatedOrder = null;
    let provisionCalled = false;
    setPool({
      query: async (sql, params) => {
        if (sql.includes("UPDATE orders SET status='FAILED'")) {
          updatedOrder = params[0];
          return { rowCount: 1 };
        }
        if (sql.includes('INSERT INTO users')) {
          provisionCalled = true;
        }
        return { rows: [], rowCount: 1 };
      }
    });

    const bodyObj = {
      type: 'PAYMENT_FAILED_WEBHOOK',
      data: { order: { order_id: 'order_failed_999', order_status: 'FAILED' } }
    };

    const req = createMockSignedRequest(bodyObj);
    const res = createMockResponse();
    const url = new URL('http://localhost/api/webhooks/cashfree');

    const handled = await purchaseRoutes(req, res, url);
    assert.equal(handled, true);
    assert.equal(res.result.statusCode, 200);
    assert.equal(res.result.body.status, 'FAILED');
    assert.equal(updatedOrder, 'order_failed_999');
    assert.equal(provisionCalled, false);
  });

  await t.test('16. Signed PAYMENT_SUCCESS_WEBHOOK with underpayment or overpayment is rejected with 400 and does NOT provision', async () => {
    const mockOrder = {
      id: 'order_amount_mismatch_123',
      customer_email: 'amount@example.com',
      amount: 2999,
      currency: 'INR',
      status: 'PENDING_PAYMENT',
      provisioning_status: 'PENDING'
    };
    let userInserted = false;
    setPool({
      query: async (sql) => {
        if (sql.includes('SELECT * FROM orders WHERE id = $1')) return { rows: [mockOrder] };
        if (sql.includes('INSERT INTO users')) userInserted = true;
        return { rows: [], rowCount: 1 };
      }
    });

    // Test underpayment
    const bodyUnderpay = {
      type: 'PAYMENT_SUCCESS_WEBHOOK',
      data: {
        order: { order_id: 'order_amount_mismatch_123', order_amount: 100, order_currency: 'INR', order_status: 'PAID' },
        payment: { cf_payment_id: 111, payment_status: 'SUCCESS' }
      }
    };
    const req1 = createMockSignedRequest(bodyUnderpay);
    const res1 = createMockResponse();
    const url = new URL('http://localhost/api/webhooks/cashfree');

    const handled1 = await purchaseRoutes(req1, res1, url);
    assert.equal(handled1, true);
    assert.equal(res1.result.statusCode, 400);
    assert.match(res1.result.body.error, /amount mismatch/i);

    // Test overpayment
    const bodyOverpay = {
      type: 'PAYMENT_SUCCESS_WEBHOOK',
      data: {
        order: { order_id: 'order_amount_mismatch_123', order_amount: 5000, order_currency: 'INR', order_status: 'PAID' },
        payment: { cf_payment_id: 222, payment_status: 'SUCCESS' }
      }
    };
    const req2 = createMockSignedRequest(bodyOverpay);
    const res2 = createMockResponse();

    const handled2 = await purchaseRoutes(req2, res2, url);
    assert.equal(handled2, true);
    assert.equal(res2.result.statusCode, 400);
    assert.match(res2.result.body.error, /amount mismatch/i);
    assert.equal(userInserted, false);
  });

  await t.test('17. Signed PAYMENT_SUCCESS_WEBHOOK with currency mismatch is rejected with 400 and does NOT provision', async () => {
    const mockOrder = {
      id: 'order_currency_123',
      customer_email: 'curr@example.com',
      amount: 2999,
      currency: 'INR',
      status: 'PENDING_PAYMENT',
      provisioning_status: 'PENDING'
    };
    let userInserted = false;
    setPool({
      query: async (sql) => {
        if (sql.includes('SELECT * FROM orders WHERE id = $1')) return { rows: [mockOrder] };
        if (sql.includes('INSERT INTO users')) userInserted = true;
        return { rows: [], rowCount: 1 };
      }
    });

    const bodyObj = {
      type: 'PAYMENT_SUCCESS_WEBHOOK',
      data: {
        order: { order_id: 'order_currency_123', order_amount: 2999, order_currency: 'USD', order_status: 'PAID' }
      }
    };

    const req = createMockSignedRequest(bodyObj);
    const res = createMockResponse();
    const url = new URL('http://localhost/api/webhooks/cashfree');

    const handled = await purchaseRoutes(req, res, url);
    assert.equal(handled, true);
    assert.equal(res.result.statusCode, 400);
    assert.match(res.result.body.error, /currency mismatch/i);
    assert.equal(userInserted, false);
  });

  await t.test('18. Signed PAYMENT_SUCCESS_WEBHOOK with customer email mismatch is rejected with 400 and does NOT provision', async () => {
    const mockOrder = {
      id: 'order_email_123',
      customer_email: 'legit@example.com',
      amount: 2999,
      currency: 'INR',
      status: 'PENDING_PAYMENT',
      provisioning_status: 'PENDING'
    };
    let userInserted = false;
    setPool({
      query: async (sql) => {
        if (sql.includes('SELECT * FROM orders WHERE id = $1')) return { rows: [mockOrder] };
        if (sql.includes('INSERT INTO users')) userInserted = true;
        return { rows: [], rowCount: 1 };
      }
    });

    const bodyObj = {
      type: 'PAYMENT_SUCCESS_WEBHOOK',
      data: {
        order: { order_id: 'order_email_123', order_amount: 2999, order_currency: 'INR', order_status: 'PAID' },
        customer_details: { customer_email: 'attacker@example.com' }
      }
    };

    const req = createMockSignedRequest(bodyObj);
    const res = createMockResponse();
    const url = new URL('http://localhost/api/webhooks/cashfree');

    const handled = await purchaseRoutes(req, res, url);
    assert.equal(handled, true);
    assert.equal(res.result.statusCode, 400);
    assert.match(res.result.body.error, /customer email mismatch/i);
    assert.equal(userInserted, false);
  });

  await t.test('19. Browser return redirect fails with 400 when Cashfree API returns status != PAID', async () => {
    const mockOrder = {
      id: 'order_redirect_123',
      customer_email: 'redirect@example.com',
      amount: 2999,
      currency: 'INR',
      status: 'PENDING_PAYMENT',
      provisioning_status: 'PENDING'
    };
    setPool({
      query: async (sql) => {
        if (sql.includes('SELECT * FROM orders WHERE id = $1')) return { rows: [mockOrder] };
        return { rows: [], rowCount: 1 };
      }
    });

    const originalFetch = global.fetch;
    global.fetch = async () => ({
      ok: true,
      json: async () => ({ order_id: 'order_redirect_123', order_status: 'ACTIVE' })
    });

    try {
      await assert.rejects(
        async () => processOrderPaymentAndProvision({
          orderId: 'order_redirect_123',
          isCashfreeRedirect: true,
        }),
        (err) => err.status === 400 && err.message.includes('Payment is pending or incomplete with Cashfree')
      );
    } finally {
      global.fetch = originalFetch;
    }
  });

  await t.test('20. Malformed JSON payload with valid headers returns 400 Bad Request', async () => {
    const rawText = '{ malformed_json: ';
    const timestamp = String(Date.now());
    const sig = createHmac('sha256', TEST_SECRET).update(`${timestamp}${rawText}`).digest('base64');

    const req = Readable.from([Buffer.from(rawText)]);
    req.method = 'POST';
    req.headers = {
      'content-type': 'application/json',
      'x-webhook-signature': sig,
      'x-webhook-timestamp': timestamp,
    };
    const res = createMockResponse();
    const url = new URL('http://localhost/api/webhooks/cashfree');

    await assert.rejects(
      async () => purchaseRoutes(req, res, url),
      (err) => err.status === 400 && err.message.includes('valid JSON')
    );
  });

  await t.test('21. Oversized request body (>20MB limit) returns 413 Payload Too Large', async () => {
    const hugeChunk = Buffer.alloc(21 * 1024 * 1024); // 21MB
    const req = Readable.from([hugeChunk]);
    req.method = 'POST';
    req.headers = {
      'content-type': 'application/json',
      'x-webhook-signature': 'sig',
      'x-webhook-timestamp': String(Date.now()),
    };
    const res = createMockResponse();
    const url = new URL('http://localhost/api/webhooks/cashfree');

    await assert.rejects(
      async () => purchaseRoutes(req, res, url),
      (err) => err.status === 413 && err.message.includes('too large')
    );
  });

  await t.test('22. Concurrent duplicate webhook delivery (Promise.all) executes provisioning side-effects exactly once', async () => {
    const mockOrder = {
      id: 'order_concurrent_123',
      customer_name: 'Concurrent User',
      customer_email: 'concurrent@example.com',
      business_name: 'Concurrent Diner',
      plan_id: 'premium',
      amount: 2999,
      status: 'PENDING_PAYMENT',
      provisioning_status: 'PENDING',
      activation_email_sent: false,
      payment_receipt_email_sent: false,
    };

    let userInsertCount = 0;
    let lockClaimed = false;
    let isProvisionComplete = false;

    setPool({
      query: async (sql) => {
        if (sql.includes('FROM orders WHERE id = $1')) {
          const currentStatus = isProvisionComplete ? 'COMPLETE' : (lockClaimed ? 'PROCESSING' : 'PENDING');
          return { rows: [{ ...mockOrder, provisioning_status: currentStatus, status: isProvisionComplete ? 'PAID' : 'PENDING_PAYMENT' }] };
        }
        if (sql.includes('UPDATE orders') && sql.includes("provisioning_status='PROCESSING'")) {
          if (!lockClaimed) {
            lockClaimed = true;
            return { rowCount: 1 };
          }
          return { rowCount: 0 };
        }
        if (sql.includes("SET provisioning_status='COMPLETE'")) {
          isProvisionComplete = true;
          return { rowCount: 1 };
        }
        if (sql.includes('INSERT INTO users')) {
          userInsertCount++;
          return { rows: [] };
        }
        if (sql.includes('SELECT id FROM clients')) return { rows: [] };
        if (sql.includes('SELECT expires_at FROM subscriptions')) return { rows: [{ expires_at: new Date() }] };
        if (sql.includes('INSERT INTO email_outbox')) return { rows: [{ id: 'outbox_123', status: 'QUEUED' }] };
        return { rows: [], rowCount: 1 };
      }
    });

    const bodyObj = {
      type: 'PAYMENT_SUCCESS_WEBHOOK',
      data: { order: { order_id: 'order_concurrent_123', order_amount: 2999, order_status: 'PAID' } }
    };

    const req1 = createMockSignedRequest(bodyObj);
    const res1 = createMockResponse();
    const req2 = createMockSignedRequest(bodyObj);
    const res2 = createMockResponse();
    const url = new URL('http://localhost/api/webhooks/cashfree');

    await Promise.all([
      purchaseRoutes(req1, res1, url),
      purchaseRoutes(req2, res2, url)
    ]);

    assert.equal(res1.result.statusCode, 200);
    assert.equal(res2.result.statusCode, 200);
    assert.equal(userInsertCount, 1, 'User insert query must execute exactly once under concurrent delivery');
  });

  await t.test('23. Stale PROCESSING lock (updated_at > 5m ago) is recovered and successfully provisioned', async () => {
    const mockOrderStale = {
      id: 'order_stale_lock_123',
      customer_name: 'Stale User',
      customer_email: 'stale@example.com',
      business_name: 'Stale Diner',
      plan_id: 'premium',
      amount: 2999,
      status: 'PENDING_PAYMENT',
      provisioning_status: 'PROCESSING',
      updated_at: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    };

    let userInserted = false;
    setPool({
      query: async (sql) => {
        if (sql.includes('SELECT * FROM orders WHERE id = $1')) return { rows: [mockOrderStale] };
        if (sql.includes('UPDATE orders') && sql.includes("provisioning_status='PROCESSING'")) return { rows: [{ status: 'PENDING_PAYMENT', provisioning_status: 'PROCESSING' }], rowCount: 1 };
        if (sql.includes('INSERT INTO users')) userInserted = true;
        if (sql.includes('SELECT id FROM clients')) return { rows: [] };
        if (sql.includes('SELECT expires_at FROM subscriptions')) return { rows: [{ expires_at: new Date() }] };
        if (sql.includes('INSERT INTO email_outbox')) return { rows: [{ id: 'outbox_stale_123', status: 'QUEUED' }] };
        return { rows: [], rowCount: 1 };
      }
    });

    const bodyObj = {
      type: 'PAYMENT_SUCCESS_WEBHOOK',
      data: { order: { order_id: 'order_stale_lock_123', order_amount: 2999, order_status: 'PAID' } }
    };

    const req = createMockSignedRequest(bodyObj);
    const res = createMockResponse();
    const url = new URL('http://localhost/api/webhooks/cashfree');

    const handled = await purchaseRoutes(req, res, url);
    assert.equal(handled, true);
    assert.equal(res.result.statusCode, 200);
    assert.equal(res.result.body.status, 'PAID');
    assert.equal(userInserted, true);
  });

  await t.test('24. Signed PAYMENT_SUCCESS_WEBHOOK missing transaction payment_amount/payment block is rejected with 400 when API verification is unavailable', async () => {
    const mockOrder = {
      id: 'order_missing_payment_123',
      customer_email: 'test@example.com',
      amount: 2999,
      currency: 'INR',
      status: 'PENDING_PAYMENT',
      provisioning_status: 'PENDING'
    };
    let userInserted = false;
    setPool({
      query: async (sql) => {
        if (sql.includes('SELECT * FROM orders WHERE id = $1')) return { rows: [mockOrder] };
        if (sql.includes('INSERT INTO users')) userInserted = true;
        return { rows: [], rowCount: 1 };
      }
    });

    const bodyObj = {
      type: 'PAYMENT_SUCCESS_WEBHOOK',
      data: {
        order: { order_id: 'order_missing_payment_123', order_amount: 2999, order_status: 'PAID' }
      }
    };

    const origAppId = process.env.CASHFREE_APP_ID;
    delete process.env.CASHFREE_APP_ID;

    try {
      const req = createMockSignedRequest(bodyObj);
      const res = createMockResponse();
      const url = new URL('http://localhost/api/webhooks/cashfree');

      const handled = await purchaseRoutes(req, res, url);
      assert.equal(handled, true);
      assert.equal(res.result.statusCode, 400);
      assert.match(res.result.body.error, /Missing Cashfree transaction payment details/i);
      assert.equal(userInserted, false);
    } finally {
      if (origAppId !== undefined) {
        process.env.CASHFREE_APP_ID = origAppId;
      }
    }
  });

  await t.test('25. Outbound Cashfree provider requests are deterministically intercepted by fetch mock in tests', async () => {
    let fetchCalled = false;
    let requestedUrl = '';
    const mockFetch = async (url) => {
      fetchCalled = true;
      requestedUrl = String(url);
      return {
        ok: true,
        status: 200,
        json: async () => ({ payment_session_id: 'session_test_mock_999' })
      };
    };

    const origFetch = global.fetch;
    const origAppId = process.env.CASHFREE_APP_ID;
    const origSecret = process.env.CASHFREE_SECRET_KEY;
    process.env.CASHFREE_APP_ID = 'mock_app_id';
    process.env.CASHFREE_SECRET_KEY = 'mock_secret';
    global.fetch = mockFetch;

    try {
      setPool({
        query: async (sql) => {
          if (sql.includes('SELECT * FROM email_verification_grants')) {
            return { rows: [{ id: 'grant_m25', token: 'vgrant_m25', email: 'mocktest@example.com', purpose: 'checkout', used: false }] };
          }
          if (sql.includes('UPDATE email_verification_grants')) {
            return { rows: [{ id: 'grant_m25' }] };
          }
          if (sql.includes('SELECT id, tenant_id FROM users')) return { rows: [] };
          if (sql.includes('SELECT id FROM orders')) return { rows: [] };
          if (sql.includes('INSERT INTO orders')) return { rowCount: 1 };
          return { rows: [] };
        }
      });

      const req = createMockRequest({
        customerName: 'Mock Test User',
        customerEmail: 'mocktest@example.com',
        businessName: 'Mock Bistro',
        planId: 'basic',
        emailVerificationToken: 'vgrant_m25'
      });
      const res = createMockResponse();
      const url = new URL('http://localhost/api/purchase/orders');

      const handled = await purchaseRoutes(req, res, url);
      assert.equal(handled, true);
      assert.equal(res.result.statusCode, 200);
      assert.equal(res.result.body.paymentSessionId, 'session_test_mock_999');
      assert.equal(fetchCalled, true, 'Fetch mock must be invoked instead of outbound network');
      assert.match(requestedUrl, /cashfree\.com/);
    } finally {
      global.fetch = origFetch;
      if (origAppId !== undefined) process.env.CASHFREE_APP_ID = origAppId; else delete process.env.CASHFREE_APP_ID;
      if (origSecret !== undefined) process.env.CASHFREE_SECRET_KEY = origSecret; else delete process.env.CASHFREE_SECRET_KEY;
    }
  });

  await t.test('26. Failing provisioning catch block CANNOT downgrade an already COMPLETE order to FAILED', async () => {
    const mockOrder = {
      id: 'order_race_complete_123',
      customer_email: 'race@example.com',
      customer_name: 'Race User',
      business_name: 'Race Diner',
      plan_id: 'basic',
      amount: 999,
      currency: 'INR',
      status: 'PAID',
      provisioning_status: 'PROCESSING',
      metadata: {}
    };

    let failedUpdateQueries = [];

    setPool({
      query: async (sql, params) => {
        if (sql.includes('SELECT * FROM orders WHERE id = $1')) return { rows: [mockOrder] };
        if (sql.includes('UPDATE orders') && sql.includes("provisioning_status='PROCESSING'")) return { rowCount: 1 };
        if (sql.includes('SELECT provisioning_status')) {
          return { rows: [{ provisioning_status: 'PROCESSING', lock_token: null }] };
        }
        if (sql.includes('SELECT id, tenant_id FROM users')) {
          // Throw error during user lookup inside provisioning transaction to trigger catch block
          throw new Error('Simulated transient DB error during setup');
        }
        if (sql.includes('UPDATE orders') && sql.includes("provisioning_status='FAILED'")) {
          failedUpdateQueries.push(sql);
          return { rowCount: 0 };
        }
        return { rows: [], rowCount: 1 };
      }
    });

    const result = await processOrderPaymentAndProvision({
      orderId: 'order_race_complete_123',
      gatewayUsed: 'cashfree_webhook',
      isWebhook: true,
      webhookVerified: true,
      payloadAmount: 999,
      payloadCurrency: 'INR',
      payloadEmail: 'race@example.com',
      hasTransactionDetails: true,
    });

    assert.equal(result.provisioning_status, 'FAILED');
    assert.equal(failedUpdateQueries.length, 1);
    assert.match(failedUpdateQueries[0], /AND provisioning_status != 'COMPLETE'/i, 'Error rollback update query must enforce provisioning_status != COMPLETE');
  });

  await t.test('27. Stale worker losing lock token ownership detects lockLost, rolls back, and cannot mark newer worker lock FAILED', async () => {
    const mockOrder = {
      id: 'order_lock_fencing_123',
      customer_email: 'fencing@example.com',
      customer_name: 'Fencing User',
      business_name: 'Fencing Diner',
      plan_id: 'basic',
      amount: 999,
      currency: 'INR',
      status: 'PAID',
      provisioning_status: 'PROCESSING',
      metadata: { lock_token: 'worker_B_token_reclaimed' }
    };

    let userInserted = false;
    let failedUpdateCount = 0;

    setPool({
      query: async (sql, params) => {
        if (sql.includes('SELECT * FROM orders WHERE id = $1')) return { rows: [mockOrder] };
        if (sql.includes('UPDATE orders') && sql.includes("provisioning_status='PROCESSING'")) {
          // Lock update executed by worker A, but in DB metadata->>lock_token has been overwritten by Worker B
          return { rowCount: 1 };
        }
        if (sql.includes('SELECT provisioning_status, metadata')) {
          // Returns Worker B's lock_token
          return { rows: [{ provisioning_status: 'PROCESSING', lock_token: 'worker_B_token_reclaimed' }] };
        }
        if (sql.includes('INSERT INTO users')) userInserted = true;
        if (sql.includes('UPDATE orders SET provisioning_status=\'FAILED\'')) {
          failedUpdateCount++;
          return { rowCount: 0 };
        }
        return { rows: [], rowCount: 1 };
      }
    });

    const result = await processOrderPaymentAndProvision({
      orderId: 'order_lock_fencing_123',
      gatewayUsed: 'cashfree_webhook',
      isWebhook: true,
      webhookVerified: true,
      payloadAmount: 999,
      payloadCurrency: 'INR',
      payloadEmail: 'fencing@example.com',
      hasTransactionDetails: true,
    });

    assert.equal(result.lockLost, true, 'Worker must detect lock ownership loss');
    assert.equal(userInserted, false, 'Stale worker must not insert user or provision side effects');
    assert.equal(failedUpdateCount, 0, 'Stale worker must not execute FAILED update when lock lost cleanly');
  });

  await t.test('28. Order creation with mandatory email verification and unverified phone preserves phone_verified as false', async () => {
    let insertedPhoneVerified = null;
    let insertedEmailVerified = null;

    setPool({
      query: async (sql, params) => {
        if (sql.includes('SELECT * FROM email_verification_grants')) {
          return { rows: [{ id: 'grant_m28', token: 'vgrant_m28', email: 'jane@example.com', purpose: 'checkout', used: false }] };
        }
        if (sql.includes('UPDATE email_verification_grants')) {
          return { rows: [{ id: 'grant_m28' }] };
        }
        if (sql.includes('SELECT id, tenant_id FROM users')) return { rows: [] };
        if (sql.includes('SELECT id FROM orders')) return { rows: [] };
        if (sql.includes('INSERT INTO orders')) {
          insertedEmailVerified = params[20];
          insertedPhoneVerified = params[21];
          return { rows: [] };
        }
        return { rows: [] };
      }
    });

    const req = createMockRequest({
      customerName: 'Jane EmailOnly',
      customerEmail: 'jane@example.com',
      phone: '9876543210',
      businessName: 'Jane Diner',
      planId: 'basic',
      city: 'Delhi',
      address: '123 Main St',
      password: 'password123',
      emailVerificationToken: 'vgrant_m28',
      phoneVerified: false
    });
    const res = createMockResponse();
    const url = new URL('http://localhost/api/purchase/orders');

    const handled = await purchaseRoutes(req, res, url);
    assert.equal(handled, true);
    assert.equal(res.result.statusCode, 200);
    assert.equal(insertedEmailVerified, true, 'email_verified must be true when verified');
    assert.equal(insertedPhoneVerified, false, 'phone_verified must be false when unverified');
  });

  await t.test('29. SMS helper functions return disable errors without contacting paid SMS gateway', async () => {
    const { requestPhoneOtp, verifyPhoneOtp, sendSmsMessage } = await import('../sms.js');
    await assert.rejects(
      async () => requestPhoneOtp('+919876543210'),
      (err) => err.status === 400 && err.message.includes('SMS OTP verification is disabled')
    );
    await assert.rejects(
      async () => verifyPhoneOtp('+919876543210', '123456'),
      (err) => err.status === 400 && err.message.includes('SMS OTP verification is disabled')
    );
    const smsRes = await sendSmsMessage({ phone: '+919876543210', message: 'test' });
    assert.equal(smsRes.ok, false);
    assert.match(smsRes.error, /SMS API delivery is disabled/);
  });

  await t.test('30. Submitting emailVerified: true without completing server-side OTP verification throws 400 apiError', async () => {
    setPool({
      query: async (sql) => {
        if (sql.includes('SELECT id FROM client_otp_challenges')) return { rows: [] }; // No verified challenge in DB
        return { rows: [] };
      }
    });

    const req = createMockRequest({
      customerName: 'Unverified Hacker',
      customerEmail: 'unverified@example.com',
      businessName: 'Fake Diner',
      planId: 'basic',
      emailVerified: true // Client lies, but server checks client_otp_challenges
    });
    const res = createMockResponse();
    const url = new URL('http://localhost/api/purchase/orders');

    await assert.rejects(
      async () => purchaseRoutes(req, res, url),
      (err) => err.status === 400 && err.message.includes('Email address must be verified via OTP')
    );
  });

  await t.test('31. Legitimately email-verified customer can create order and proceed without SMS verification', async () => {
    let orderInserted = false;
    setPool({
      query: async (sql) => {
        if (sql.includes('SELECT * FROM email_verification_grants')) {
          return { rows: [{ id: 'grant_no_sms_123', token: 'vgrant_valid_nosms', email: 'valid@example.com', purpose: 'checkout', used: false }] };
        }
        if (sql.includes('UPDATE email_verification_grants')) {
          return { rows: [{ id: 'grant_no_sms_123' }] };
        }
        if (sql.includes('SELECT id, tenant_id FROM users')) return { rows: [] };
        if (sql.includes('SELECT id FROM orders')) return { rows: [] };
        if (sql.includes('INSERT INTO orders')) { orderInserted = true; return { rowCount: 1 }; }
        return { rows: [] };
      }
    });

    const req = createMockRequest({
      customerName: 'Valid Verified Customer',
      customerEmail: 'valid@example.com',
      phone: '9876543210',
      businessName: 'Valid Diner',
      planId: 'intermediate',
      emailVerificationToken: 'vgrant_valid_nosms',
      phoneVerified: false
    });
    const res = createMockResponse();
    const url = new URL('http://localhost/api/purchase/orders');

    const handled = await purchaseRoutes(req, res, url);
    assert.equal(handled, true);
    assert.equal(res.result.statusCode, 200);
    assert.equal(orderInserted, true, 'Order must be created for legitimately verified email');
  });

  await t.test('32. Submitting an invalid, expired, mismatched, or replayed emailVerificationToken is rejected with 400 apiError', async () => {
    setPool({
      query: async (sql) => {
        if (sql.includes('SELECT * FROM email_verification_grants')) return { rows: [] }; // No valid grant found
        return { rows: [] };
      }
    });

    const req = createMockRequest({
      customerName: 'Fake Token User',
      customerEmail: 'fake@example.com',
      businessName: 'Fake Diner',
      planId: 'basic',
      emailVerificationToken: 'vgrant_fake_invalid_token_123'
    });
    const res = createMockResponse();
    const url = new URL('http://localhost/api/purchase/orders');

    await assert.rejects(
      async () => purchaseRoutes(req, res, url),
      (err) => err.status === 400 && err.message.includes('Invalid, expired, mismatched, or already consumed email verification grant')
    );
  });

  await t.test('33. Submitting a valid emailVerificationToken atomically consumes grant and creates order', async () => {
    let orderInserted = false;
    let grantConsumed = false;

    setPool({
      query: async (sql, params) => {
        if (sql.includes('SELECT * FROM email_verification_grants')) {
          return { rows: [{ id: 'grant_123', token: 'vgrant_valid_123', email: 'validgrant@example.com', purpose: 'checkout', used: false }] };
        }
        if (sql.includes('UPDATE email_verification_grants')) {
          grantConsumed = true;
          return { rows: [{ id: 'grant_123' }] };
        }
        if (sql.includes('SELECT id, tenant_id FROM users')) return { rows: [] };
        if (sql.includes('SELECT id FROM orders')) return { rows: [] };
        if (sql.includes('INSERT INTO orders')) { orderInserted = true; return { rowCount: 1 }; }
        return { rows: [] };
      }
    });

    const req = createMockRequest({
      customerName: 'Valid Grant Customer',
      customerEmail: 'validgrant@example.com',
      phone: '9876543210',
      businessName: 'Valid Grant Diner',
      planId: 'intermediate',
      emailVerificationToken: 'vgrant_valid_123',
      phoneVerified: false
    });
    const res = createMockResponse();
    const url = new URL('http://localhost/api/purchase/orders');

    const handled = await purchaseRoutes(req, res, url);
    assert.equal(handled, true);
    assert.equal(res.result.statusCode, 200);
    assert.equal(grantConsumed, true, 'Grant must be atomically consumed in DB');
    assert.equal(orderInserted, true, 'Order must be created for valid grant token');
  });
});
