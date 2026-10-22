import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { setPool, pool } from '../db.js';
import authRoutes from '../routes/auth.js';

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

test('Batch 2 #7: RESEND_WEBHOOK_SECRET missing must fail closed (500), not open', async (t) => {
  const originalSecret = process.env.RESEND_WEBHOOK_SECRET;
  const originalPool = pool;

  t.beforeEach(() => {
    setPool({
      query: async () => ({ rows: [] }),
    });
  });

  t.afterEach(() => {
    process.env.RESEND_WEBHOOK_SECRET = originalSecret;
    setPool(originalPool);
  });

  await t.test('ATTACK: When RESEND_WEBHOOK_SECRET is empty/unset, unauthenticated webhook must be rejected with 500, not processed', async () => {
    delete process.env.RESEND_WEBHOOK_SECRET;

    const req = createMockRequest({
      type: 'email.delivered',
      data: { email_id: 'fake_msg_id', to: 'victim@example.com' }
    });
    const res = createMockResponse();
    const url = new URL('http://localhost/api/webhooks/resend');

    // In vulnerable code, omitting RESEND_WEBHOOK_SECRET skips the auth check entirely and returns 200!
    await assert.rejects(
      async () => authRoutes(req, res, url),
      (err) => err.status === 500 && err.message.includes('not configured'),
      'CRITICAL: Endpoint allowed unauthenticated access when secret was missing!'
    );
  });

  await t.test('When RESEND_WEBHOOK_SECRET is set, valid secret is accepted and invalid secret is rejected with 401', async () => {
    process.env.RESEND_WEBHOOK_SECRET = 'whsec_test_secret_123';

    // 1. Invalid secret -> 401
    const invalidReq = createMockRequest(
      { type: 'email.delivered', data: { email_id: 'msg_1' } },
      { 'x-resend-signature': 'wrong_secret' }
    );
    const invalidRes = createMockResponse();
    await assert.rejects(
      async () => authRoutes(invalidReq, invalidRes, new URL('http://localhost/api/webhooks/resend')),
      (err) => err.status === 401
    );

    // 2. Valid secret -> 200 OK
    const validReq = createMockRequest(
      { type: 'email.delivered', data: { email_id: 'msg_1' } },
      { 'x-resend-signature': 'whsec_test_secret_123' }
    );
    const validRes = createMockResponse();
    const handled = await authRoutes(validReq, validRes, new URL('http://localhost/api/webhooks/resend'));
    assert.equal(handled, true);
    assert.equal(validRes.result.statusCode, 200);
    assert.equal(validRes.result.body.received, true);
  });
});
