import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { createHmac } from 'node:crypto';
import { setPool, pool } from '../db.js';
import purchaseRoutes from '../routes/purchase.js';

const TEST_SECRET = 'cf_secret_key_replay_test_123';

function createMockSignedRequest(bodyObj, secretKey, timestamp) {
  const rawText = JSON.stringify(bodyObj);
  const payloadToSign = `${timestamp}${rawText}`;
  const sig = createHmac('sha256', secretKey).update(payloadToSign).digest('base64');
  const req = Readable.from([Buffer.from(rawText)]);
  req.method = 'POST';
  req.headers = {
    'content-type': 'application/json',
    'x-webhook-signature': sig,
    'x-webhook-timestamp': String(timestamp),
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

test('Batch 2 #5: Cashfree webhook timestamp freshness (5-minute replay prevention)', async (t) => {
  const originalPool = pool;
  const originalSecret = process.env.CASHFREE_SECRET_KEY;

  t.beforeEach(() => {
    process.env.CASHFREE_SECRET_KEY = TEST_SECRET;
  });

  t.afterEach(() => {
    process.env.CASHFREE_SECRET_KEY = originalSecret;
    setPool(originalPool);
  });

  await t.test('ATTACK: Replayed webhook with 10-minute old timestamp must be rejected with 401', async () => {
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    const body = {
      type: 'PAYMENT_SUCCESS_WEBHOOK',
      data: {
        order: { order_id: 'order_replay_123', order_amount: 1499, order_status: 'PAID' },
        payment: { cf_payment_id: 111, payment_status: 'SUCCESS' },
      }
    };

    const req = createMockSignedRequest(body, TEST_SECRET, tenMinutesAgo);
    const res = createMockResponse();

    // BUG CHECK: In vulnerable code, 10-minute old signature passes verifyCashfreeWebhookSignature and does NOT reject!
    await assert.rejects(
      async () => purchaseRoutes(req, res, new URL('http://localhost/api/webhooks/cashfree')),
      (err) => err.status === 401 && err.message.includes('freshness window'),
      'CRITICAL VULNERABILITY: Stale/replayed webhook was accepted!'
    );
  });

  await t.test('Legitimate fresh webhook (< 5 minutes old) is accepted', async () => {
    const freshTimestamp = Date.now() - 30 * 1000; // 30 seconds ago
    const body = {
      type: 'PAYMENT_FAILED_WEBHOOK',
      data: {
        order: { order_id: 'order_fresh_failed_123' },
      }
    };

    setPool({
      query: async (sql) => {
        if (sql.includes('UPDATE orders')) return { rowCount: 1 };
        return { rows: [] };
      }
    });

    const req = createMockSignedRequest(body, TEST_SECRET, freshTimestamp);
    const res = createMockResponse();

    const handled = await purchaseRoutes(req, res, new URL('http://localhost/api/webhooks/cashfree'));
    assert.equal(handled, true);
    assert.equal(res.result.statusCode, 200);
    assert.equal(res.result.body.status, 'FAILED');
  });
});
