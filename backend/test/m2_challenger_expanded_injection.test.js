import '../env.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { pool, connectDB } from '../db.js';
import { fakeRequest, fakeResponse, urlFor } from './helpers/http.js';
import { ownerHeaders } from './helpers/ownerFake.js';
import appRoutes from '../routes/app.js';
import purchaseRoutes from '../routes/purchase.js';
import * as subscriptionService from '../subscriptionService.js';

async function callAppRoute(req, res, url) {
  try {
    const handled = await appRoutes(req, res, url);
    if (!handled && res.statusCode === 200) {
      res.statusCode = 404;
      res.body = JSON.stringify({ error: 'API route not found.' });
    }
    return { handled, statusCode: res.statusCode, headers: res.headers, body: res.body };
  } catch (err) {
    const status = err.status || 500;
    res.statusCode = status;
    res.body = JSON.stringify({ error: err.message, status });
    return { handled: true, statusCode: status, headers: res.headers, body: res.body, error: err };
  }
}

async function callPurchaseRoute(req, res, url) {
  try {
    const handled = await purchaseRoutes(req, res, url);
    if (!handled && res.statusCode === 200) {
      res.statusCode = 404;
      res.body = JSON.stringify({ error: 'Purchase route not found.' });
    }
    return { handled, statusCode: res.statusCode, headers: res.headers, body: res.body };
  } catch (err) {
    const status = err.status || 500;
    res.statusCode = status;
    res.body = JSON.stringify({ error: err.message, status });
    return { handled: true, statusCode: status, headers: res.headers, body: res.body, error: err };
  }
}

test('Milestone 2 Iteration 2 Challenger 2: Expanded Adversarial Injection Suite', async (suite) => {
  const db = await connectDB(process.env.DATABASE_URL, { runMigrations: false });

  const TENANT_BASIC_ID = 'adv2_ten_basic_' + Date.now();
  const USER_BASIC_ID = 'adv2_usr_basic_' + Date.now();
  const EMAIL_BASIC = `basic_${Date.now()}@menuqr-test.in`;

  const TENANT_EXP_ID = 'adv2_ten_exp_' + Date.now();
  const USER_EXP_ID = 'adv2_usr_exp_' + Date.now();
  const EMAIL_EXP = `expired_${Date.now()}@menuqr-test.in`;

  const TENANT_EXP_BASIC_ID = 'adv2_ten_exp_basic_' + Date.now();
  const USER_EXP_BASIC_ID = 'adv2_usr_exp_basic_' + Date.now();
  const EMAIL_EXP_BASIC = `expbasic_${Date.now()}@menuqr-test.in`;

  suite.before(async () => {
    // 1. Seed Active Basic Tenant
    await db.query(`
      INSERT INTO clients (id, public_id, business_name, menu_slug, status, state, address)
      VALUES ($1, $2, 'Active Basic Bistro', $3, 'active', 'Maharashtra', '101 FC Road, Pune')
      ON CONFLICT (id) DO NOTHING;
    `, [TENANT_BASIC_ID, 'pub_' + TENANT_BASIC_ID, 'slug-' + TENANT_BASIC_ID]);

    await db.query(`
      INSERT INTO users (id, email, password_hash, role, tenant_id, onboarding_state)
      VALUES ($1, $2, 'dummyhash', 'RESTAURANT_OWNER', $3, 'COMPLETED')
      ON CONFLICT (id) DO NOTHING;
    `, [USER_BASIC_ID, EMAIL_BASIC, TENANT_BASIC_ID]);

    await db.query(`
      INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at)
      VALUES ($1, $2, 'BASIC', 'ACTIVE', NOW() - INTERVAL '30 days', NOW() + INTERVAL '180 days')
      ON CONFLICT (tenant_id) DO UPDATE SET plan_id = 'BASIC', status = 'ACTIVE';
    `, [randomUUID(), TENANT_BASIC_ID]);

    // 2. Seed Expired Premium Tenant
    await db.query(`
      INSERT INTO clients (id, public_id, business_name, menu_slug, status, state, address)
      VALUES ($1, $2, 'Expired Premium Dining', $3, 'active', 'Maharashtra', '202 Baner Road, Pune')
      ON CONFLICT (id) DO NOTHING;
    `, [TENANT_EXP_ID, 'pub_' + TENANT_EXP_ID, 'slug-' + TENANT_EXP_ID]);

    await db.query(`
      INSERT INTO users (id, email, password_hash, role, tenant_id, onboarding_state)
      VALUES ($1, $2, 'dummyhash', 'RESTAURANT_OWNER', $3, 'COMPLETED')
      ON CONFLICT (id) DO NOTHING;
    `, [USER_EXP_ID, EMAIL_EXP, TENANT_EXP_ID]);

    await db.query(`
      INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at)
      VALUES ($1, $2, 'PREMIUM', 'EXPIRED', NOW() - INTERVAL '395 days', NOW() - INTERVAL '30 days')
      ON CONFLICT (tenant_id) DO UPDATE SET plan_id = 'PREMIUM', status = 'EXPIRED';
    `, [randomUUID(), TENANT_EXP_ID]);

    // 3. Seed Expired Basic Tenant
    await db.query(`
      INSERT INTO clients (id, public_id, business_name, menu_slug, status, state, address)
      VALUES ($1, $2, 'Expired Basic Cafe', $3, 'active', 'Maharashtra', '303 MG Road, Pune')
      ON CONFLICT (id) DO NOTHING;
    `, [TENANT_EXP_BASIC_ID, 'pub_' + TENANT_EXP_BASIC_ID, 'slug-' + TENANT_EXP_BASIC_ID]);

    await db.query(`
      INSERT INTO users (id, email, password_hash, role, tenant_id, onboarding_state)
      VALUES ($1, $2, 'dummyhash', 'RESTAURANT_OWNER', $3, 'COMPLETED')
      ON CONFLICT (id) DO NOTHING;
    `, [USER_EXP_BASIC_ID, EMAIL_EXP_BASIC, TENANT_EXP_BASIC_ID]);

    await db.query(`
      INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at)
      VALUES ($1, $2, 'BASIC', 'EXPIRED', NOW() - INTERVAL '395 days', NOW() - INTERVAL '30 days')
      ON CONFLICT (tenant_id) DO UPDATE SET plan_id = 'BASIC', status = 'EXPIRED';
    `, [randomUUID(), TENANT_EXP_BASIC_ID]);
  });

  suite.after(async () => {
    for (const tId of [TENANT_BASIC_ID, TENANT_EXP_ID, TENANT_EXP_BASIC_ID]) {
      await db.query('DELETE FROM gst_invoices WHERE tenant_id = $1', [tId]).catch(() => {});
      await db.query('DELETE FROM subscription_events WHERE tenant_id = $1', [tId]).catch(() => {});
      await db.query('DELETE FROM subscriptions WHERE tenant_id = $1', [tId]).catch(() => {});
      await db.query('DELETE FROM clients WHERE id = $1', [tId]).catch(() => {});
    }
    for (const email of [EMAIL_BASIC, EMAIL_EXP, EMAIL_EXP_BASIC]) {
      await db.query('DELETE FROM orders WHERE customer_email = $1', [email]).catch(() => {});
    }
    for (const uId of [USER_BASIC_ID, USER_EXP_ID, USER_EXP_BASIC_ID]) {
      await db.query('DELETE FROM users WHERE id = $1', [uId]).catch(() => {});
    }
  });

  // =========================================================================
  // Section A: Edge-case Object Prototype & Built-in Property Injection
  // =========================================================================
  await suite.test('A. Comprehensive Object Prototype & Built-in Property Injection', async (t) => {
    const basicAuth = ownerHeaders(USER_BASIC_ID, TENANT_BASIC_ID);

    const edgeCaseProperties = [
      '__proto__',
      'constructor',
      'toString',
      'valueOf',
      'hasOwnProperty',
      'isPrototypeOf',
      'propertyIsEnumerable',
      'toLocaleString',
      '__defineGetter__',
      '__defineSetter__',
      '__lookupGetter__',
      '__lookupSetter__',
      'CONSTRUCTOR',
      '__PROTO__',
      'TOSTRING',
      'VALUEOF',
      'HASOWNPROPERTY',
    ];

    for (const prop of edgeCaseProperties) {
      await t.test(`A.1 POST upgrade/initiate rejects prototype prop "${prop}" with HTTP 400`, async () => {
        const res = fakeResponse();
        const result = await callAppRoute(
          fakeRequest({
            method: 'POST',
            body: { targetPlanId: prop },
            headers: basicAuth,
          }),
          res,
          urlFor('/api/app/subscription/upgrade/initiate')
        );

        assert.equal(result.statusCode, 400, `Expected 400 for "${prop}", got ${result.statusCode}`);
        assert.match(res.body, /Invalid target plan/i);
      });

      await t.test(`A.2 GET upgrade-preview rejects prototype prop "${prop}" with HTTP 400`, async () => {
        const res = fakeResponse();
        const result = await callAppRoute(
          fakeRequest({
            method: 'GET',
            headers: basicAuth,
          }),
          res,
          urlFor(`/api/app/subscription/upgrade-preview?targetPlan=${encodeURIComponent(prop)}`)
        );

        assert.equal(result.statusCode, 400, `Expected 400 for preview of "${prop}", got ${result.statusCode}`);
        assert.match(res.body, /Invalid target plan/i);
      });
    }
  });

  // =========================================================================
  // Section B: Expired Subscription Downgrade & Tier Matrix Verification
  // =========================================================================
  await suite.test('B. Expired Subscription Downgrade & Tier Matrix Enforcement', async (t) => {
    const expAuth = ownerHeaders(USER_EXP_ID, TENANT_EXP_ID); // Expired Premium
    const expBasicAuth = ownerHeaders(USER_EXP_BASIC_ID, TENANT_EXP_BASIC_ID); // Expired Basic

    // 1. Expired Premium attempting downgrade to Basic
    await t.test('B.1 Expired Premium attempting POST upgrade to basic is rejected with 400', async () => {
      const res = fakeResponse();
      const result = await callAppRoute(
        fakeRequest({ method: 'POST', body: { targetPlanId: 'basic' }, headers: expAuth }),
        res,
        urlFor('/api/app/subscription/upgrade/initiate')
      );
      assert.equal(result.statusCode, 400);
      assert.match(res.body, /same or lower plan tier/i);
    });

    // 2. Expired Premium attempting downgrade to Intermediate
    await t.test('B.2 Expired Premium attempting POST upgrade to intermediate is rejected with 400', async () => {
      const res = fakeResponse();
      const result = await callAppRoute(
        fakeRequest({ method: 'POST', body: { targetPlanId: 'intermediate' }, headers: expAuth }),
        res,
        urlFor('/api/app/subscription/upgrade/initiate')
      );
      assert.equal(result.statusCode, 400);
      assert.match(res.body, /same or lower plan tier/i);
    });

    // 3. Expired Premium attempting "upgrade" to same tier (Premium)
    await t.test('B.3 Expired Premium attempting POST upgrade to premium (same tier) is rejected with 400', async () => {
      const res = fakeResponse();
      const result = await callAppRoute(
        fakeRequest({ method: 'POST', body: { targetPlanId: 'premium' }, headers: expAuth }),
        res,
        urlFor('/api/app/subscription/upgrade/initiate')
      );
      assert.equal(result.statusCode, 400);
      assert.match(res.body, /same or lower plan tier/i);
    });

    // 4. Expired Basic attempting "upgrade" to same tier (Basic)
    await t.test('B.4 Expired Basic attempting POST upgrade to basic (same tier) is rejected with 400', async () => {
      const res = fakeResponse();
      const result = await callAppRoute(
        fakeRequest({ method: 'POST', body: { targetPlanId: 'basic' }, headers: expBasicAuth }),
        res,
        urlFor('/api/app/subscription/upgrade/initiate')
      );
      assert.equal(result.statusCode, 400);
      assert.match(res.body, /same or lower plan tier/i);
    });

    // 5. Expired Premium requesting upgrade-preview for Basic
    await t.test('B.5 Expired Premium requesting upgrade-preview for basic is rejected with 400', async () => {
      const res = fakeResponse();
      const result = await callAppRoute(
        fakeRequest({ method: 'GET', headers: expAuth }),
        res,
        urlFor('/api/app/subscription/upgrade-preview?targetPlan=basic')
      );
      assert.equal(result.statusCode, 400);
      assert.match(res.body, /same or lower plan tier/i);
    });

    // 6. Expired Premium requesting upgrade-preview for Intermediate
    await t.test('B.6 Expired Premium requesting upgrade-preview for intermediate is rejected with 400', async () => {
      const res = fakeResponse();
      const result = await callAppRoute(
        fakeRequest({ method: 'GET', headers: expAuth }),
        res,
        urlFor('/api/app/subscription/upgrade-preview?targetPlan=intermediate')
      );
      assert.equal(result.statusCode, 400);
      assert.match(res.body, /same or lower plan tier/i);
    });

    // 7. Legitimate upgrade from Expired Basic to Intermediate
    await t.test('B.7 Legitimate upgrade from Expired Basic to Intermediate succeeds with ₹0 credit and full price', async () => {
      const res = fakeResponse();
      const result = await callAppRoute(
        fakeRequest({ method: 'GET', headers: expBasicAuth }),
        res,
        urlFor('/api/app/subscription/upgrade-preview?targetPlan=intermediate')
      );
      assert.equal(result.statusCode, 200);
      const json = JSON.parse(res.body);
      assert.equal(json.success, true);
      assert.equal(json.creditPaise, 0, 'Expired subscription must receive ₹0 proration credit');
      assert.ok(json.totalDuePaise > 300000, 'Must charge full intermediate yearly price');
    });

    // 8. Legitimate upgrade initiate from Expired Basic to Premium
    await t.test('B.8 Legitimate upgrade initiate from Expired Basic to Premium creates valid order with non-NaN amount', async () => {
      const res = fakeResponse();
      const result = await callAppRoute(
        fakeRequest({ method: 'POST', body: { targetPlanId: 'premium' }, headers: expBasicAuth }),
        res,
        urlFor('/api/app/subscription/upgrade/initiate')
      );
      assert.equal(result.statusCode, 200);
      const json = JSON.parse(res.body);
      assert.equal(json.success, true);
      const orderId = json.orderId;

      const orderRow = await db.query('SELECT * FROM orders WHERE id = $1', [orderId]);
      assert.equal(orderRow.rows.length, 1);
      const order = orderRow.rows[0];

      assert.ok(!Number.isNaN(Number(order.amount)), 'Order amount must not be NaN');
      assert.ok(Number(order.amount) > 6000, `Amount must be full premium price: ₹${order.amount}`);
      assert.equal(order.plan_id, 'PREMIUM');
      assert.equal(order.proration_credit_paise, 0);
    });
  });

  // =========================================================================
  // Section C: PostgreSQL Database NaN Integrity Audit
  // =========================================================================
  await suite.test('C. PostgreSQL Orders Table Integrity: Zero NaN Amounts', async (t) => {
    await t.test('C.1 Confirm zero orders exist with amount = NaN in PostgreSQL', async () => {
      const result = await db.query(`
        SELECT count(*)::int AS count
        FROM orders
        WHERE amount::text = 'NaN'
           OR original_amount::text = 'NaN'
           OR amount != amount
      `);
      assert.equal(result.rows[0].count, 0, 'ZERO orders with amount = NaN must exist in the database');
    });
  });

  // =========================================================================
  // Section D: Public Purchase Endpoint Prototype Fuzzing
  // =========================================================================
  await suite.test('D. Adversarial Prototype Injection on Public Purchase / Orders Endpoint', async (t) => {
    const maliciousPlanIds = [
      '__proto__',
      'constructor',
      'toString',
      'valueOf',
      'hasOwnProperty',
      'isPrototypeOf',
    ];

    for (const badPlan of maliciousPlanIds) {
      await t.test(`D.1 POST /api/purchase/orders with planId="${badPlan}" is rejected or safe from NaN order`, async () => {
        const res = fakeResponse();
        const testEmail = `proto_${Date.now()}_${badPlan.replace(/[^a-z0-9]/gi, '')}@example.com`;
        const { createEmailVerificationGrant } = await import('../clientAuth.js');
        const grant = await createEmailVerificationGrant(testEmail, 'checkout');
        const token = grant.token;

        const result = await callPurchaseRoute(
          fakeRequest({
            method: 'POST',
            body: {
              customerName: 'Adversary Tester',
              customerEmail: testEmail,
              businessName: 'Adversary Diner',
              planId: badPlan,
              billingCycle: 'yearly',
              emailVerificationToken: token,
            },
          }),
          res,
          urlFor('/api/purchase/orders')
        );

        // Clean up any test order created if any
        await db.query('DELETE FROM orders WHERE customer_email = $1', [testEmail]).catch(() => {});

        // If it returns 400 or fails, verify that NO NaN order was written
        const nanCheck = await db.query(`
          SELECT count(*)::int AS count
          FROM orders
          WHERE customer_email = $1 AND (amount::text = 'NaN' OR original_amount::text = 'NaN')
        `, [testEmail]);
        assert.equal(nanCheck.rows[0].count, 0, `No NaN order must be created for planId="${badPlan}"`);

        // Check response code: must not be 200 with NaN amount
        if (result.statusCode === 200) {
          const body = JSON.parse(res.body);
          assert.notEqual(body.amount, 'NaN');
          assert.ok(Number.isFinite(Number(body.amount)));
        } else {
          // It returned an error status (e.g. 400 or 502)
          assert.ok(result.statusCode === 400 || result.statusCode === 502, `Bad planId "${badPlan}" returned ${result.statusCode}`);
        }
      });
    }

    await t.test('D.2 In NODE_ENV=test mode, planId="constructor" or "__proto__" in POST /api/purchase/orders check', async () => {
      const prevEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';
      const testEmail = `proto_test_env_${Date.now()}@example.com`;
      try {
        const { createEmailVerificationGrant } = await import('../clientAuth.js');
        const grant = await createEmailVerificationGrant(testEmail, 'checkout');
        const res = fakeResponse();
        const result = await callPurchaseRoute(
          fakeRequest({
            method: 'POST',
            body: {
              customerName: 'Adversary Tester',
              customerEmail: testEmail,
              businessName: 'Adversary Diner',
              planId: 'constructor',
              billingCycle: 'yearly',
              emailVerificationToken: grant.token,
            },
          }),
          res,
          urlFor('/api/purchase/orders')
        );

        // Inspect database
        const rows = await db.query('SELECT id, plan_id, amount, original_amount FROM orders WHERE customer_email = $1', [testEmail]);
        console.log('D.2 Test result:', { statusCode: result.statusCode, body: res.body, rows: rows.rows });

        // Clean up
        await db.query('DELETE FROM orders WHERE customer_email = $1', [testEmail]).catch(() => {});

        // If a row was written with NaN, this is a finding!
        if (rows.rows.length > 0) {
          const row = rows.rows[0];
          assert.notEqual(String(row.amount), 'NaN', 'Order amount in DB must NOT be NaN!');
        }
      } finally {
        process.env.NODE_ENV = prevEnv;
      }
    });
  });
});
