import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { setPool, pool } from '../db.js';
import authRoutes from '../routes/auth.js';

function mockReq(method, pathname, body = {}) {
  const raw = Buffer.from(JSON.stringify(body));
  const req = Readable.from([raw]);
  req.method = method;
  req.headers = { 'content-type': 'application/json' };
  req.socket = { remoteAddress: '127.0.0.1' };
  const url = new URL(`http://localhost${pathname}`);
  return { req, url };
}

function mockRes() {
  let statusCode = 200;
  let headers = {};
  let body = '';
  return {
    writeHead(code, h = {}) {
      statusCode = code;
      headers = h;
    },
    setHeader(k, v) {
      headers[k] = v;
    },
    end(data) {
      body = data;
    },
    get output() {
      return { statusCode, headers, body: body ? JSON.parse(body) : null };
    }
  };
}

test('Issue #1: Test-card 4242424242424242 and in-memory paidTransactions bypass test', async (t) => {
  const originalPool = pool;
  t.after(() => setPool(originalPool));

  await t.test('ATTACK: Calling process-payment and mock checkout endpoints must be rejected', async () => {
    // 1. Calling /api/auth/create-payment-intent must be rejected
    const { req: req1, url: url1 } = mockReq('POST', '/api/auth/create-payment-intent', { amount: 1499 });
    const res1 = mockRes();
    await assert.rejects(
      async () => await authRoutes(req1, res1, url1),
      (err) => err.status === 403 || err.status === 410,
      'create-payment-intent must reject mock transaction creation'
    );

    // 2. Calling /api/auth/process-payment with test card 4242424242424242 must be rejected
    const { req: req2, url: url2 } = mockReq('POST', '/api/auth/process-payment', {
      transactionId: 'order_fake_tx_1234',
      cardNumber: '4242424242424242',
    });
    const res2 = mockRes();
    await assert.rejects(
      async () => await authRoutes(req2, res2, url2),
      (err) => err.status === 403 || err.status === 410,
      'process-payment must reject test card 4242424242424242'
    );

    // 3. Calling /api/auth/signup must be rejected
    const { req: req3, url: url3 } = mockReq('POST', '/api/auth/signup', {
      ownerName: 'Attacker',
      email: 'attacker@example.com',
      password: 'AttackerPassword123!',
      restaurantName: 'Free Restaurant',
      transactionId: 'order_fake_tx_1234',
    });
    const res3 = mockRes();
    await assert.rejects(
      async () => await authRoutes(req3, res3, url3),
      (err) => err.status === 403 || err.status === 410,
      'signup must reject unverified transactions'
    );
  });
});
