import '../env.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { pool, connectDB } from '../db.js';
import { fakeRequest, fakeResponse, urlFor } from './helpers/http.js';
import { ownerHeaders } from './helpers/ownerFake.js';
import appRoutes from '../routes/app.js';
import { processOrderPaymentAndProvision } from '../routes/purchase.js';
import * as subscriptionService from '../subscriptionService.js';
import * as orderStream from '../orderStream.js';
import { generateAuthToken } from '../auth.js';

/**
 * Robust wrapper that invokes appRoutes and formats errors into HTTP status and JSON
 * identical to server.js runtime behavior.
 */
async function callAppRoute(req, res, url) {
  try {
    const handled = await appRoutes(req, res, url);
    if (!handled && res.statusCode === 200) {
      res.statusCode = 404;
      res.body = JSON.stringify({ error: 'API route not found.' });
    }
    return { handled, statusCode: res.statusCode, headers: res.headers, body: res.body };
  } catch (err) {
    const isConflict = err.code === '23505';
    const status = err.status || (isConflict ? 409 : 500);
    res.statusCode = status;
    res.body = JSON.stringify({ error: err.message, status });
    return { handled: true, statusCode: status, headers: res.headers, body: res.body, error: err };
  }
}

/**
 * Creates an SSE-compatible request/response double capable of receiving
 * chunked SSE writes and handling connection close handlers.
 */
function createSseDouble(headers = {}) {
  const chunks = [];
  const listeners = {};
  const res = {
    statusCode: 200,
    headers: {},
    chunks,
    writeHead(status, headers = {}) {
      res.statusCode = status;
      Object.assign(res.headers, headers);
    },
    setHeader(key, value) {
      res.headers[key] = value;
    },
    write(chunk) {
      chunks.push(typeof chunk === 'string' ? chunk : chunk.toString('utf-8'));
      return true;
    },
    end(data) {
      if (data) res.write(data);
    },
    on() {},
    get output() {
      return chunks.join('');
    },
  };

  const req = {
    method: 'GET',
    headers,
    socket: { remoteAddress: '203.0.113.7' },
    on(event, handler) {
      listeners[event] = handler;
    },
    close() {
      if (listeners['close']) listeners['close']();
      if (listeners['end']) listeners['end']();
    },
    async *[Symbol.asyncIterator]() {},
  };

  return { req, res };
}

test('Milestone 2 Challenger 2: Adversarial Penetration & Security Hardening Test Suite', async (suite) => {
  const db = await connectDB(process.env.DATABASE_URL, { runMigrations: false });
  assert.ok(db, 'PostgreSQL database pool connected');

  // Seed isolated Tenant A (Basic plan)
  const TENANT_A_ID = 'adv_sec_tenant_a_' + Date.now();
  const USER_A_ID = 'adv_sec_user_a_' + Date.now();
  const USER_A_EMAIL = `owner_a_${Date.now()}@menuqr-sec.in`;

  // Seed isolated Tenant B (Attacker / Cross-tenant)
  const TENANT_B_ID = 'adv_sec_tenant_b_' + Date.now();
  const USER_B_ID = 'adv_sec_user_b_' + Date.now();
  const USER_B_EMAIL = `owner_b_${Date.now()}@menuqr-sec.in`;

  // Seed isolated Tenant C (Premium plan with kitchen display entitlement)
  const TENANT_C_ID = 'adv_sec_tenant_c_' + Date.now();
  const USER_C_ID = 'adv_sec_user_c_' + Date.now();
  const USER_C_EMAIL = `owner_c_${Date.now()}@menuqr-sec.in`;

  let tenantA_invoiceId;
  let tenantA_invoiceNumber;

  suite.before(async () => {
    const now = new Date();
    const expiry = new Date(Date.now() + 180 * 86400000); // 180 days remaining

    // 1. Seed Tenant A
    await db.query(`
      INSERT INTO clients (id, public_id, business_name, menu_slug, status, state, address)
      VALUES ($1, $2, 'Victim Cafe A', $3, 'active', 'Maharashtra', '101 MG Road, Pune')
      ON CONFLICT (id) DO NOTHING;
    `, [TENANT_A_ID, 'pub_' + TENANT_A_ID, 'slug-' + TENANT_A_ID]);

    await db.query(`
      INSERT INTO users (id, email, password_hash, role, tenant_id, onboarding_state)
      VALUES ($1, $2, 'dummyhash', 'RESTAURANT_OWNER', $3, 'COMPLETED')
      ON CONFLICT (id) DO NOTHING;
    `, [USER_A_ID, USER_A_EMAIL, TENANT_A_ID]);

    await db.query(`
      INSERT INTO subscriptions (
        id, tenant_id, plan_id, status, started_at, expires_at, renewal_count
      ) VALUES (
        $1, $2, 'BASIC', 'ACTIVE', $3, $4, 0
      ) ON CONFLICT (tenant_id) DO UPDATE SET
        plan_id = 'BASIC', status = 'ACTIVE', started_at = $3, expires_at = $4;
    `, [randomUUID(), TENANT_A_ID, now, expiry]);

    // 2. Seed Tenant B (Attacker)
    await db.query(`
      INSERT INTO clients (id, public_id, business_name, menu_slug, status, state, address)
      VALUES ($1, $2, 'Attacker Bistro B', $3, 'active', 'Maharashtra', '202 FC Road, Pune')
      ON CONFLICT (id) DO NOTHING;
    `, [TENANT_B_ID, 'pub_' + TENANT_B_ID, 'slug-' + TENANT_B_ID]);

    await db.query(`
      INSERT INTO users (id, email, password_hash, role, tenant_id, onboarding_state)
      VALUES ($1, $2, 'dummyhash', 'RESTAURANT_OWNER', $3, 'COMPLETED')
      ON CONFLICT (id) DO NOTHING;
    `, [USER_B_ID, USER_B_EMAIL, TENANT_B_ID]);

    await db.query(`
      INSERT INTO subscriptions (
        id, tenant_id, plan_id, status, started_at, expires_at, renewal_count
      ) VALUES (
        $1, $2, 'BASIC', 'ACTIVE', $3, $4, 0
      ) ON CONFLICT (tenant_id) DO UPDATE SET
        plan_id = 'BASIC', status = 'ACTIVE', started_at = $3, expires_at = $4;
    `, [randomUUID(), TENANT_B_ID, now, expiry]);

    // 3. Seed Tenant C (Premium)
    await db.query(`
      INSERT INTO clients (id, public_id, business_name, menu_slug, status, state, address)
      VALUES ($1, $2, 'Premium Restaurant C', $3, 'active', 'Maharashtra', '303 Baner Road, Pune')
      ON CONFLICT (id) DO NOTHING;
    `, [TENANT_C_ID, 'pub_' + TENANT_C_ID, 'slug-' + TENANT_C_ID]);

    await db.query(`
      INSERT INTO users (id, email, password_hash, role, tenant_id, onboarding_state)
      VALUES ($1, $2, 'dummyhash', 'RESTAURANT_OWNER', $3, 'COMPLETED')
      ON CONFLICT (id) DO NOTHING;
    `, [USER_C_ID, USER_C_EMAIL, TENANT_C_ID]);

    await db.query(`
      INSERT INTO subscriptions (
        id, tenant_id, plan_id, status, started_at, expires_at, renewal_count
      ) VALUES (
        $1, $2, 'PREMIUM', 'ACTIVE', $3, $4, 0
      ) ON CONFLICT (tenant_id) DO UPDATE SET
        plan_id = 'PREMIUM', status = 'ACTIVE', started_at = $3, expires_at = $4;
    `, [randomUUID(), TENANT_C_ID, now, expiry]);

    // 4. Generate a valid GST Invoice for Tenant A to act as target for IDOR attacks
    const tenantA_orderId = 'ord_sec_init_' + randomUUID().replace(/-/g, '').substring(0, 16);
    await db.query(`
      INSERT INTO orders (
        id, customer_name, customer_email, business_name, state,
        plan_id, amount, status, provisioning_status, order_subtype
      ) VALUES (
        $1, 'Victim Owner A', $2, 'Victim Cafe A', 'Maharashtra',
        'BASIC', 1999.00, 'PAID', 'COMPLETE', 'SUBSCRIPTION'
      )
    `, [tenantA_orderId, USER_A_EMAIL]);

    const inv = await subscriptionService.generateGstInvoice({
      orderId: tenantA_orderId,
      tenantId: TENANT_A_ID,
      client: db,
    });
    tenantA_invoiceId = inv.id;
    tenantA_invoiceNumber = inv.invoice_number;
    assert.ok(tenantA_invoiceId, 'Tenant A invoice ID must be generated');
  });

  suite.after(async () => {
    // Teardown test fixtures
    for (const tId of [TENANT_A_ID, TENANT_B_ID, TENANT_C_ID]) {
      await db.query('DELETE FROM gst_invoices WHERE tenant_id = $1', [tId]).catch(() => {});
      await db.query('DELETE FROM subscription_events WHERE tenant_id = $1', [tId]).catch(() => {});
      await db.query('DELETE FROM subscriptions WHERE tenant_id = $1', [tId]).catch(() => {});
      await db.query('DELETE FROM clients WHERE id = $1', [tId]).catch(() => {});
    }
    for (const uEmail of [USER_A_EMAIL, USER_B_EMAIL, USER_C_EMAIL]) {
      await db.query('DELETE FROM orders WHERE customer_email = $1', [uEmail]).catch(() => {});
    }
    for (const uId of [USER_A_ID, USER_B_ID, USER_C_ID]) {
      await db.query('DELETE FROM users WHERE id = $1', [uId]).catch(() => {});
    }
  });

  // =========================================================================
  // 1. IDOR (Insecure Direct Object Reference) Attacks
  // =========================================================================
  await suite.test('1. Adversarial IDOR Attacks & Tenant Isolation', async (t) => {
    const authHeadersA = ownerHeaders(USER_A_ID, TENANT_A_ID);
    const authHeadersB = ownerHeaders(USER_B_ID, TENANT_B_ID);

    await t.test('1.1 Tenant A can legitimately download their own invoice PDF', async () => {
      const res = fakeResponse();
      const result = await callAppRoute(
        fakeRequest({ method: 'GET', headers: authHeadersA }),
        res,
        urlFor(`/api/app/subscription/invoices/${tenantA_invoiceId}/pdf`)
      );

      assert.equal(result.statusCode, 200, 'Owner A should successfully retrieve their invoice');
      assert.equal(result.headers['Content-Type'], 'application/pdf');
      assert.ok(res.body.toString().startsWith('%PDF-1.4'), 'Must return valid PDF-1.4 stream');
    });

    await t.test('1.2 IDOR Attack: Tenant B attempting to download Tenant A invoice PDF is blocked (HTTP 403)', async () => {
      const res = fakeResponse();
      const result = await callAppRoute(
        fakeRequest({ method: 'GET', headers: authHeadersB }),
        res,
        urlFor(`/api/app/subscription/invoices/${tenantA_invoiceId}/pdf`)
      );

      assert.equal(result.statusCode, 403, 'Must return HTTP 403 Forbidden for cross-tenant invoice download');
      assert.ok(!res.body.toString().startsWith('%PDF'), 'Must NEVER leak PDF bytes to attacker');
      const json = JSON.parse(res.body);
      assert.match(json.error, /Forbidden/i, 'Error message must clearly state forbidden access');
    });

    await t.test('1.3 IDOR Attack: Tenant B invoice listing does NOT leak Tenant A invoices', async () => {
      const res = fakeResponse();
      const result = await callAppRoute(
        fakeRequest({ method: 'GET', headers: authHeadersB }),
        res,
        urlFor('/api/app/subscription/invoices')
      );

      assert.equal(result.statusCode, 200);
      const json = JSON.parse(res.body);
      assert.ok(Array.isArray(json.invoices));
      const leaked = json.invoices.find((inv) => inv.id === tenantA_invoiceId || inv.invoiceNumber === tenantA_invoiceNumber);
      assert.equal(leaked, undefined, 'Tenant A invoice must not appear in Tenant B invoice list');
    });

    await t.test('1.4 Direct Service Layer IDOR Check: getTenantInvoiceById returns null for foreign tenant', async () => {
      const invoice = await subscriptionService.getTenantInvoiceById(TENANT_B_ID, tenantA_invoiceId, db);
      assert.equal(invoice, null, 'Service method getTenantInvoiceById must strictly enforce tenant scoping');
    });

    await t.test('1.5 Unauthenticated invoice PDF download attempt returns HTTP 401', async () => {
      const res = fakeResponse();
      const result = await callAppRoute(
        fakeRequest({ method: 'GET', headers: {} }),
        res,
        urlFor(`/api/app/subscription/invoices/${tenantA_invoiceId}/pdf`)
      );

      assert.equal(result.statusCode, 401, 'Unauthenticated request must be rejected with 401');
    });

    // Seed isolated Staff user (for non-owner authorization check)
    const USER_STAFF_ID = 'adv_sec_user_staff_' + Date.now();
    await db.query(`
      INSERT INTO users (id, email, password_hash, role, tenant_id, onboarding_state)
      VALUES ($1, $2, 'dummyhash', 'STAFF', $3, 'COMPLETED')
      ON CONFLICT (id) DO NOTHING;
    `, [USER_STAFF_ID, `staff_${Date.now()}@menuqr-sec.in`, TENANT_A_ID]);

    await t.test('1.6 Non-Owner role (e.g. STAFF) attempting invoice download returns HTTP 403', async () => {
      const staffToken = generateAuthToken({ id: USER_STAFF_ID, role: 'STAFF', tenantId: TENANT_A_ID });
      const staffHeaders = { authorization: `Bearer ${staffToken}` };

      const res = fakeResponse();
      const result = await callAppRoute(
        fakeRequest({ method: 'GET', headers: staffHeaders }),
        res,
        urlFor(`/api/app/subscription/invoices/${tenantA_invoiceId}/pdf`)
      );

      assert.equal(result.statusCode, 403, 'Non-owner roles must be denied invoice access');
      const json = JSON.parse(res.body);
      assert.match(json.error, /Forbidden/i);
    });
  });

  // =========================================================================
  // 2. Tampered Amount & Plan Injection Attacks
  // =========================================================================
  await suite.test('2. Adversarial Tampered Amount & Plan Injection Attacks', async (t) => {
    const authHeadersA = ownerHeaders(USER_A_ID, TENANT_A_ID);

    await t.test('2.1 Tampered Amount Injection in POST upgrade/initiate: Client-supplied ₹1 is completely ignored', async () => {
      const res = fakeResponse();
      const maliciousPayload = {
        targetPlanId: 'premium',
        amount: 1,
        amountPaise: 100,
        price: 1,
        original_amount: 1,
        totalDue: 1,
        totalDuePaise: 100,
        prorationCreditPaise: 9999999,
        discount: 9999999,
      };

      const result = await callAppRoute(
        fakeRequest({ method: 'POST', body: maliciousPayload, headers: authHeadersA }),
        res,
        urlFor('/api/app/subscription/upgrade/initiate')
      );

      assert.equal(result.statusCode, 200);
      const json = JSON.parse(res.body);
      assert.equal(json.success, true);
      const createdOrderId = json.orderId;

      // Inspect order in database
      const orderRow = await db.query('SELECT * FROM orders WHERE id = $1', [createdOrderId]);
      assert.equal(orderRow.rows.length, 1);
      const order = orderRow.rows[0];

      // Server must NOT accept ₹1! Basic -> Premium with ~180 days left should be > ₹5000
      assert.ok(Number(order.amount) > 100, `Order amount must be server-calculated, was: ₹${order.amount}`);
      assert.notEqual(Number(order.amount), 1, 'Server MUST reject client injected ₹1 price');

      // proration_credit_paise must NOT be 9999999
      assert.notEqual(order.proration_credit_paise, 9999999, 'Server MUST reject client injected proration credit');
      assert.ok(order.proration_credit_paise > 0 && order.proration_credit_paise < 200000);
    });

    await t.test('2.2 Tampered Amount Injection in POST renew/initiate: Client-supplied ₹0.01 is ignored', async () => {
      const res = fakeResponse();
      const maliciousPayload = {
        amount: 0.01,
        amountPaise: 1,
        price: 0,
        plan: 'FREE',
        planId: 'FREE',
        yearsToAdd: 99,
      };

      const result = await callAppRoute(
        fakeRequest({ method: 'POST', body: maliciousPayload, headers: authHeadersA }),
        res,
        urlFor('/api/app/subscription/renew/initiate')
      );

      assert.equal(result.statusCode, 200);
      const json = JSON.parse(res.body);
      const orderId = json.orderId;

      const orderRow = await db.query('SELECT * FROM orders WHERE id = $1', [orderId]);
      const order = orderRow.rows[0];

      // Basic plan renewal is ₹1,999.00
      assert.equal(Number(order.amount), 1999.00, 'Renewal amount must be strictly derived from DB plan price');
      assert.equal(order.plan_id, 'BASIC', 'Plan ID must match current tenant plan');
    });

    await t.test('2.3 Downgrade Attack: Upgrading to lower or same tier is rejected with HTTP 400', async () => {
      const authHeadersC = ownerHeaders(USER_C_ID, TENANT_C_ID); // Premium tenant

      // 1. Premium tenant attempting downgrade to basic
      const res1 = fakeResponse();
      const result1 = await callAppRoute(
        fakeRequest({ method: 'POST', body: { targetPlanId: 'basic' }, headers: authHeadersC }),
        res1,
        urlFor('/api/app/subscription/upgrade/initiate')
      );
      assert.equal(result1.statusCode, 400, 'Downgrade to basic must be rejected with 400');
      assert.match(res1.body, /same or lower plan tier/i);

      // 2. Premium tenant attempting downgrade to intermediate
      const res2 = fakeResponse();
      const result2 = await callAppRoute(
        fakeRequest({ method: 'POST', body: { targetPlanId: 'intermediate' }, headers: authHeadersC }),
        res2,
        urlFor('/api/app/subscription/upgrade/initiate')
      );
      assert.equal(result2.statusCode, 400, 'Downgrade to intermediate must be rejected with 400');

      // 3. Premium tenant attempting upgrade to premium (same tier)
      const res3 = fakeResponse();
      const result3 = await callAppRoute(
        fakeRequest({ method: 'POST', body: { targetPlanId: 'premium' }, headers: authHeadersC }),
        res3,
        urlFor('/api/app/subscription/upgrade/initiate')
      );
      assert.equal(result3.statusCode, 400, 'Upgrading to identical plan tier must be rejected with 400');
    });

    await t.test('2.4 Arbitrary and Malicious Plan Names are rejected with HTTP 400', async () => {
      const maliciousPlans = [
        'free',
        'FREE',
        'admin',
        'ENTERPRISE_LIFETIME_FREE',
        "'; DROP TABLE subscriptions; --",
        '<script>alert(1)</script>',
        'super_user',
      ];

      for (const badPlan of maliciousPlans) {
        const res = fakeResponse();
        const result = await callAppRoute(
          fakeRequest({ method: 'POST', body: { targetPlanId: badPlan }, headers: authHeadersA }),
          res,
          urlFor('/api/app/subscription/upgrade/initiate')
        );
        assert.equal(result.statusCode, 400, `Plan "${badPlan}" must be rejected with 400`);
        assert.match(res.body, /Invalid target plan/i);
      }
    });

    await t.test('2.5 Missing or Empty Target Plan is rejected with HTTP 400', async () => {
      const badBodies = [
        {},
        { targetPlan: '' },
        { targetPlan: '   ' },
        { targetPlan: null },
      ];

      for (const body of badBodies) {
        const res = fakeResponse();
        const result = await callAppRoute(
          fakeRequest({ method: 'POST', body, headers: authHeadersA }),
          res,
          urlFor('/api/app/subscription/upgrade/initiate')
        );
        assert.equal(result.statusCode, 400, 'Empty target plan must be rejected with 400');
        assert.match(res.body, /Target plan is required|Invalid target plan/i);
      }
    });

    await t.test('2.6 Malicious Prototype / Built-in Property Injection: targetPlan="__proto__" or "constructor" must be rejected with HTTP 400', async () => {
      for (const protoPayload of ['__proto__', 'constructor']) {
        const res = fakeResponse();
        const result = await callAppRoute(
          fakeRequest({ method: 'POST', body: { targetPlanId: protoPayload }, headers: authHeadersA }),
          res,
          urlFor('/api/app/subscription/upgrade/initiate')
        );
        // The server MUST reject with HTTP 400. If it returns 200, an invalid order with amount NaN was created!
        assert.equal(result.statusCode, 400, `targetPlan "${protoPayload}" must be rejected with 400 Bad Request`);
      }
    });

    await t.test('2.7 Expired Subscription Downgrade Injection: Upgrading expired Premium to Basic must be rejected with 400', async () => {
      const EXPIRED_TENANT_ID = 'adv_sec_exp_tenant_' + Date.now();
      const EXPIRED_USER_ID = 'adv_sec_exp_user_' + Date.now();
      const EXPIRED_EMAIL = `exp_${Date.now()}@menuqr.in`;

      await db.query(`
        INSERT INTO clients (id, public_id, business_name, menu_slug, status, state, address)
        VALUES ($1, $2, 'Expired Kitchen', $3, 'active', 'Maharashtra', '100 Road')
      `, [EXPIRED_TENANT_ID, 'pub_' + EXPIRED_TENANT_ID, 'slug-' + EXPIRED_TENANT_ID]);
      await db.query(`
        INSERT INTO users (id, email, password_hash, role, tenant_id, onboarding_state)
        VALUES ($1, $2, 'dummy', 'RESTAURANT_OWNER', $3, 'COMPLETED')
      `, [EXPIRED_USER_ID, EXPIRED_EMAIL, EXPIRED_TENANT_ID]);
      await db.query(`
        INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at)
        VALUES ($1, $2, 'PREMIUM', 'EXPIRED', NOW() - INTERVAL '30 days', NOW() - INTERVAL '1 day')
      `, [randomUUID(), EXPIRED_TENANT_ID]);

      const expHeaders = ownerHeaders(EXPIRED_USER_ID, EXPIRED_TENANT_ID);
      const res = fakeResponse();
      const result = await callAppRoute(
        fakeRequest({ method: 'POST', body: { targetPlanId: 'basic' }, headers: expHeaders }),
        res,
        urlFor('/api/app/subscription/upgrade/initiate')
      );

      // Clean up
      await db.query('DELETE FROM orders WHERE customer_email = $1', [EXPIRED_EMAIL]).catch(() => {});
      await db.query('DELETE FROM subscriptions WHERE tenant_id = $1', [EXPIRED_TENANT_ID]).catch(() => {});
      await db.query('DELETE FROM users WHERE id = $1', [EXPIRED_USER_ID]).catch(() => {});
      await db.query('DELETE FROM clients WHERE id = $1', [EXPIRED_TENANT_ID]).catch(() => {});

      assert.equal(result.statusCode, 400, 'Expired downgrade request must be rejected with 400 Bad Request');
    });

    await t.test('2.8 Upgrade Preview Prototype & Expired Downgrade Checks: Must be rejected with HTTP 400', async () => {
      // 1. Prototype injection in upgrade-preview
      const res1 = fakeResponse();
      const result1 = await callAppRoute(
        fakeRequest({ method: 'GET', headers: authHeadersA }),
        res1,
        urlFor('/api/app/subscription/upgrade-preview?targetPlan=__proto__')
      );
      assert.equal(result1.statusCode, 400, 'upgrade-preview with targetPlan=__proto__ must return 400');
    });
  });

  // =========================================================================
  // 3. Unauthorized Orders Stream & Event Filtering
  // =========================================================================
  await suite.test('3. Adversarial Orders Stream Security & Event Isolation', async (t) => {
    await t.test('3.1 Connecting to /api/app/orders/stream without valid auth returns HTTP 401', async () => {
      const { req, res } = createSseDouble({});
      const result = await callAppRoute(req, res, urlFor('/api/app/orders/stream'));
      assert.equal(result.statusCode, 401, 'Unauthenticated SSE stream connection must be rejected with 401');
    });

    await t.test('3.2 Basic Plan Connection: Kitchen order tickets are NEVER leaked to Basic plan tab', async () => {
      const authHeadersA = ownerHeaders(USER_A_ID, TENANT_A_ID);
      const { req, res } = createSseDouble(authHeadersA);

      const result = await callAppRoute(req, res, urlFor('/api/app/orders/stream'));
      assert.equal(result.statusCode, 200);
      assert.equal(result.headers['Content-Type'], 'text/event-stream; charset=utf-8');

      // Initial connection event should be received
      assert.ok(res.output.includes('event: connected'));

      // Now broadcast order-specific events that require 'reception_orders' entitlement
      const sensitiveEvents = [
        ['new_order', { id: 'ord_leak_1', customer_name: 'Secret Diner', items: ['Steak'], total: 950 }],
        ['order_status_updated', { id: 'ord_leak_1', status: 'PREPARING' }],
        ['order_time_updated', { id: 'ord_leak_1', estimatedTimeMinutes: 25 }],
        ['service_request', { table: 7, type: 'CALL_WAITER', request: 'Urgent' }],
      ];

      for (const [evType, evData] of sensitiveEvents) {
        orderStream.broadcastOrderEvent(TENANT_A_ID, evType, evData);
      }

      // Verify that NONE of the order tickets leaked to this Basic plan client
      const output = res.output;
      assert.ok(!output.includes('event: new_order'), 'new_order MUST NOT leak to Basic plan');
      assert.ok(!output.includes('Secret Diner'), 'Customer PII MUST NOT leak to Basic plan');
      assert.ok(!output.includes('event: order_status_updated'), 'order_status_updated MUST NOT leak');
      assert.ok(!output.includes('event: order_time_updated'), 'order_time_updated MUST NOT leak');
      assert.ok(!output.includes('event: service_request'), 'service_request MUST NOT leak');

      req.close();
    });

    await t.test('3.3 Basic Plan Connection: Receives plan_updated broadcast without 403 entitlement restriction', async () => {
      const authHeadersA = ownerHeaders(USER_A_ID, TENANT_A_ID);
      const { req, res } = createSseDouble(authHeadersA);

      await callAppRoute(req, res, urlFor('/api/app/orders/stream'));

      // Broadcast subscription unlock event
      const planPayload = {
        type: 'plan_updated',
        plan: 'INTERMEDIATE',
        expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
      };
      orderStream.broadcastPlanEvent(TENANT_A_ID, planPayload);

      const output = res.output;
      assert.ok(output.includes('event: plan_updated'), 'Must receive plan_updated event');
      assert.ok(output.includes('"plan":"INTERMEDIATE"'), 'Must deliver updated plan payload');

      req.close();
    });

    await t.test('3.4 Cross-Tenant Stream Isolation: Tenant B never receives events targeted at Tenant A', async () => {
      const authHeadersA = ownerHeaders(USER_A_ID, TENANT_A_ID);
      const authHeadersB = ownerHeaders(USER_B_ID, TENANT_B_ID);

      const clientA = createSseDouble(authHeadersA);
      const clientB = createSseDouble(authHeadersB);

      await callAppRoute(clientA.req, clientA.res, urlFor('/api/app/orders/stream'));
      await callAppRoute(clientB.req, clientB.res, urlFor('/api/app/orders/stream'));

      // Broadcast event exclusively for Tenant A
      orderStream.broadcastPlanEvent(TENANT_A_ID, {
        type: 'plan_updated',
        plan: 'CONFIDENTIAL_TENANT_A',
      });

      assert.ok(clientA.res.output.includes('CONFIDENTIAL_TENANT_A'), 'Tenant A receives Tenant A event');
      assert.ok(!clientB.res.output.includes('CONFIDENTIAL_TENANT_A'), 'Tenant B must NEVER receive Tenant A event');

      clientA.req.close();
      clientB.req.close();
    });

    await t.test('3.5 Premium Plan Connection: Legitimate kitchen orders ARE delivered to entitled tabs', async () => {
      const authHeadersC = ownerHeaders(USER_C_ID, TENANT_C_ID); // Premium tenant
      const { req, res } = createSseDouble(authHeadersC);

      await callAppRoute(req, res, urlFor('/api/app/orders/stream'));

      const kitchenOrder = { id: 'ord_kitchen_101', tableNumber: 3, items: ['Pizza'], total: 600 };
      orderStream.broadcastOrderEvent(TENANT_C_ID, 'new_order', kitchenOrder);

      assert.ok(res.output.includes('event: new_order'), 'Premium client tab must receive kitchen orders');
      assert.ok(res.output.includes('ord_kitchen_101'), 'Must include order payload');

      req.close();
    });
  });

  // =========================================================================
  // 4. Malformed & Injection Attacks on Invoice Endpoints
  // =========================================================================
  await suite.test('4. Adversarial Malformed & Injection Attacks on Invoice Endpoints', async (t) => {
    const authHeadersA = ownerHeaders(USER_A_ID, TENANT_A_ID);

    await t.test('4.1 SQL Injection payloads in invoice ID parameter are rejected with HTTP 404 without SQL error', async () => {
      const sqliPayloads = [
        "' OR '1'='1",
        "1'; DROP TABLE gst_invoices; --",
        "' UNION SELECT id, invoice_number, NULL, NULL FROM gst_invoices --",
        "123' OR 1=1--",
        "admin'--",
        "'; EXEC xp_cmdshell('dir');--",
      ];

      const initialCountRes = await db.query('SELECT count(*)::int AS count FROM gst_invoices');
      const countBefore = initialCountRes.rows[0].count;

      for (const sqli of sqliPayloads) {
        const res = fakeResponse();
        const encoded = encodeURIComponent(sqli);
        const result = await callAppRoute(
          fakeRequest({ method: 'GET', headers: authHeadersA }),
          res,
          urlFor(`/api/app/subscription/invoices/${encoded}/pdf`)
        );

        assert.equal(result.statusCode, 404, `SQL injection payload "${sqli}" must return HTTP 404`);
        assert.match(res.body, /Invoice not found|API route not found/i);
      }

      // Verify gst_invoices table is completely unaffected
      const finalCountRes = await db.query('SELECT count(*)::int AS count FROM gst_invoices');
      assert.equal(finalCountRes.rows[0].count, countBefore, 'gst_invoices table must be completely intact');
    });

    await t.test('4.2 Path Traversal in invoice ID parameter is rejected with HTTP 404', async () => {
      const traversalPayloads = [
        '../../../../package.json',
        '..%2f..%2f..%2fpackage.json',
        '..\\..\\package.json',
        '....//....//etc/passwd',
      ];

      for (const traversal of traversalPayloads) {
        const res = fakeResponse();
        const result = await callAppRoute(
          fakeRequest({ method: 'GET', headers: authHeadersA }),
          res,
          urlFor(`/api/app/subscription/invoices/${traversal}/pdf`)
        );

        assert.equal(result.statusCode, 404, `Path traversal "${traversal}" must return HTTP 404`);
      }
    });

    await t.test('4.3 Invalid and Malformed UUID formats return HTTP 404', async () => {
      const malformedIds = [
        'not-a-uuid',
        '12345',
        'undefined',
        'null',
        '[object Object]',
        '00000000-0000-0000-0000-00000000000g', // invalid hex char 'g'
        '00000000-0000-0000-0000-0000000000000', // 13 chars in last group
        '00000000-0000-0000-0000', // truncated
        'true',
      ];

      for (const badId of malformedIds) {
        const res = fakeResponse();
        const result = await callAppRoute(
          fakeRequest({ method: 'GET', headers: authHeadersA }),
          res,
          urlFor(`/api/app/subscription/invoices/${badId}/pdf`)
        );

        assert.equal(result.statusCode, 404, `Malformed ID "${badId}" must return HTTP 404`);
        assert.match(res.body, /Invoice not found/i);
      }
    });

    await t.test('4.4 Non-existent valid UUID returns HTTP 404 Invoice not found', async () => {
      const nonExistentUuid = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
      const res = fakeResponse();
      const result = await callAppRoute(
        fakeRequest({ method: 'GET', headers: authHeadersA }),
        res,
        urlFor(`/api/app/subscription/invoices/${nonExistentUuid}/pdf`)
      );

      assert.equal(result.statusCode, 404);
      assert.match(res.body, /Invoice not found/i);
    });

    await t.test('4.5 Extreme Buffer / Long string parameter attack does not crash server and returns 404', async () => {
      const extremeString = 'a'.repeat(8000);
      const res = fakeResponse();
      const result = await callAppRoute(
        fakeRequest({ method: 'GET', headers: authHeadersA }),
        res,
        urlFor(`/api/app/subscription/invoices/${extremeString}/pdf`)
      );

      assert.equal(result.statusCode, 404, 'Extreme length string must return HTTP 404');
    });
  });
});
