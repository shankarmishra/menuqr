import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { setPool, pool } from '../db.js';
import purchaseRoutes from '../routes/purchase.js';

function createMockRequest(body) {
  const json = JSON.stringify(body);
  const req = Readable.from([Buffer.from(json)]);
  req.method = 'POST';
  req.headers = { 'content-type': 'application/json' };
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
});
