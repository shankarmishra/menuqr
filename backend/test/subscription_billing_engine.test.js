import '../env.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { pool, connectDB } from '../db.js';
import { fakeRequest, fakeResponse, urlFor } from './helpers/http.js';
import { ownerHeaders } from './helpers/ownerFake.js';
import appRoutes from '../routes/app.js';
import { processOrderPaymentAndProvision, PLANS } from '../routes/purchase.js';
import * as subscriptionService from '../subscriptionService.js';
import * as orderStream from '../orderStream.js';

test('Milestone 2: Subscription, Renewal & Billing Engine Verification', async (suite) => {
  const db = await connectDB(process.env.DATABASE_URL, { runMigrations: false });
  assert.ok(db, 'Database connected');

  // Seed isolated tenant and owner for API testing
  const TENANT_ID = 'test_sub_tenant_' + Date.now();
  const USER_ID = 'test_sub_user_' + Date.now();
  const USER_EMAIL = `owner_${Date.now()}@menuqr-test.in`;

  // Seed second tenant and user for IDOR testing
  const OTHER_TENANT_ID = 'other_sub_tenant_' + Date.now();
  const OTHER_USER_ID = 'other_sub_user_' + Date.now();
  const OTHER_USER_EMAIL = `other_owner_${Date.now()}@menuqr-test.in`;

  suite.before(async () => {
    // Tenant 1
    await db.query(`
      INSERT INTO clients (id, public_id, business_name, menu_slug, status, state, address)
      VALUES ($1, $2, 'Billing Test Kitchen', $3, 'active', 'Maharashtra', '100 Marine Drive, Mumbai')
      ON CONFLICT (id) DO NOTHING;
    `, [TENANT_ID, 'pub_' + TENANT_ID, 'slug-' + TENANT_ID]);

    await db.query(`
      INSERT INTO users (id, email, password_hash, role, tenant_id, onboarding_state)
      VALUES ($1, $2, 'dummyhash', 'RESTAURANT_OWNER', $3, 'COMPLETED')
      ON CONFLICT (id) DO NOTHING;
    `, [USER_ID, USER_EMAIL, TENANT_ID]);

    // Tenant 2 (for IDOR)
    await db.query(`
      INSERT INTO clients (id, public_id, business_name, menu_slug, status, state, address)
      VALUES ($1, $2, 'Other Test Kitchen', $3, 'active', 'Maharashtra', '200 Other Road, Pune')
      ON CONFLICT (id) DO NOTHING;
    `, [OTHER_TENANT_ID, 'pub_' + OTHER_TENANT_ID, 'slug-' + OTHER_TENANT_ID]);

    await db.query(`
      INSERT INTO users (id, email, password_hash, role, tenant_id, onboarding_state)
      VALUES ($1, $2, 'dummyhash', 'RESTAURANT_OWNER', $3, 'COMPLETED')
      ON CONFLICT (id) DO NOTHING;
    `, [OTHER_USER_ID, OTHER_USER_EMAIL, OTHER_TENANT_ID]);
  });

  suite.after(async () => {
    // Cleanup seeded data
    for (const tId of [TENANT_ID, OTHER_TENANT_ID]) {
      await db.query('DELETE FROM gst_invoices WHERE tenant_id = $1', [tId]).catch(() => {});
      await db.query('DELETE FROM subscription_events WHERE tenant_id = $1', [tId]).catch(() => {});
      await db.query('DELETE FROM subscriptions WHERE tenant_id = $1', [tId]).catch(() => {});
      await db.query('DELETE FROM clients WHERE id = $1', [tId]).catch(() => {});
    }
    for (const uEmail of [USER_EMAIL, OTHER_USER_EMAIL]) {
      await db.query('DELETE FROM orders WHERE customer_email = $1', [uEmail]).catch(() => {});
    }
    for (const uId of [USER_ID, OTHER_USER_ID]) {
      await db.query('DELETE FROM users WHERE id = $1', [uId]).catch(() => {});
    }
  });

  // =========================================================================
  // 1. Proration Math Calculations
  // =========================================================================
  await suite.test('1. Proration Math Engine', async (t) => {
    await t.test('1.1 Basic -> Intermediate upgrade calculation (200 days left)', () => {
      // Basic = 1999/yr, Intermediate = 3199/yr
      const currentPricePaise = 1999 * 100;
      const targetPricePaise = 3199 * 100;
      const remainingDays = 200;

      const res = subscriptionService.calculateProrationPaise(currentPricePaise, remainingDays, targetPricePaise);
      assert.equal(res.dailyRatePaise, 548, 'Daily rate: 199900/365 = 548 paise');
      assert.equal(res.creditPaise, 200 * 548, 'Credit: 200 * 548 = 109600 paise');
      assert.equal(res.subtotalPaise, 319900 - 109600, 'Subtotal: 319900 - 109600 = 210300 paise');
      assert.equal(res.gstPaise, Math.round(210300 * 0.09) * 2, 'GST: 18% (9%+9%) of 210300 = 37854 paise');
      assert.equal(res.totalDuePaise, 210300 + 37854, 'Total Due: 248154 paise');
    });

    await t.test('1.2 Intermediate -> Premium upgrade calculation (285 days left)', () => {
      // Intermediate = 3199/yr, Premium = 6799/yr
      const currentPricePaise = 3199 * 100;
      const targetPricePaise = 6799 * 100;
      const remainingDays = 285;

      const res = subscriptionService.calculateProrationPaise(currentPricePaise, remainingDays, targetPricePaise, 'Maharashtra');
      assert.equal(res.dailyRatePaise, 876, 'Daily rate: 319900/365 = 876 paise');
      assert.equal(res.creditPaise, 285 * 876, 'Credit: 285 * 876 = 249660 paise');
      assert.equal(res.subtotalPaise, 679900 - 249660, 'Subtotal: 679900 - 249660 = 430240 paise');
      assert.equal(res.cgstPaise, 38722, 'CGST 9% = 38722 paise');
      assert.equal(res.sgstPaise, 38722, 'SGST 9% = 38722 paise');
      assert.equal(res.gstPaise, 77444, 'Total GST (9%+9%) = 77444 paise');
      assert.equal(res.totalDuePaise, 430240 + 77444, 'Total Due: 507684 paise');
    });

    await t.test('1.3 Expired plan upgrade (0 remaining days)', () => {
      const currentPricePaise = 1999 * 100;
      const targetPricePaise = 6799 * 100;
      const remainingDays = 0; // or negative

      const res = subscriptionService.calculateProrationPaise(currentPricePaise, remainingDays, targetPricePaise);
      assert.equal(res.creditPaise, 0, 'No credit for expired plan');
      assert.equal(res.subtotalPaise, 679900, 'Subtotal is full new plan price');
      assert.equal(res.gstPaise, Math.round(679900 * 0.09) * 2, '18% GST on full price');
      assert.equal(res.totalDuePaise, 679900 + Math.round(679900 * 0.09) * 2);
    });

    await t.test('1.4 Minimum payable floor cap (100 paise floor)', () => {
      const currentPricePaise = 6799 * 100;
      const targetPricePaise = 1999 * 100;
      const remainingDays = 360; // huge credit exceeding target

      const res = subscriptionService.calculateProrationPaise(currentPricePaise, remainingDays, targetPricePaise);
      assert.equal(res.subtotalPaise, 100, 'Subtotal floored at 100 paise (₹1)');
      assert.equal(res.gstPaise, 18, '18 paise GST on ₹1');
      assert.equal(res.totalDuePaise, 118, '118 paise total floor');
    });
  });

  // =========================================================================
  // 2. Zero-Lost-Days Renewal Expiration Stacking
  // =========================================================================
  await suite.test('2. Days-Loss Prevention Renewal Stacking', async (t) => {
    await t.test('2.1 Early renewal stacks on existing future expiry', () => {
      const futureExpiry = new Date(Date.now() + 180 * 86400000); // 180 days in future
      const newExpiry = subscriptionService.calculateRenewalExpiry(futureExpiry);

      const expected = new Date(futureExpiry);
      expected.setFullYear(expected.getFullYear() + 1);

      assert.equal(
        newExpiry.toISOString().slice(0, 10),
        expected.toISOString().slice(0, 10),
        'New expiry must add exactly 1 year to future expiry'
      );
    });

    await t.test('2.2 Late renewal stacks from now when currently expired', () => {
      const pastExpiry = new Date(Date.now() - 30 * 86400000); // 30 days in past
      const newExpiry = subscriptionService.calculateRenewalExpiry(pastExpiry);

      const expected = new Date();
      expected.setFullYear(expected.getFullYear() + 1);

      assert.equal(
        newExpiry.toISOString().slice(0, 10),
        expected.toISOString().slice(0, 10),
        'New expiry must add 1 year from today for expired subscriptions'
      );
    });
  });

  // =========================================================================
  // 3. Atomic FY Sequence Counter Generation
  // =========================================================================
  await suite.test('3. Atomic Financial Year Sequence Generation', async (t) => {
    await t.test('3.1 Deterministic FY calculation with April 1 cutoff', () => {
      assert.equal(subscriptionService.getFinancialYear(new Date('2026-04-01T00:00:00Z')), '2026-27');
      assert.equal(subscriptionService.getFinancialYear(new Date('2026-11-03T00:00:00Z')), '2026-27');
      assert.equal(subscriptionService.getFinancialYear(new Date('2027-03-31T12:00:00Z')), '2026-27');
      assert.equal(subscriptionService.getFinancialYear(new Date('2027-04-01T00:00:00Z')), '2027-28');
      assert.equal(subscriptionService.getFinancialYear(new Date('2028-01-15T00:00:00Z')), '2027-28');
    });

    await t.test('3.2 Invoice format: MQR/YYYY-YY/XXXXX', () => {
      assert.equal(subscriptionService.formatInvoiceNumber('2026-27', 1), 'MQR/2026-27/00001');
      assert.equal(subscriptionService.formatInvoiceNumber('2026-27', 247), 'MQR/2026-27/00247');
      assert.equal(subscriptionService.formatInvoiceNumber('2027-28', 10042), 'MQR/2027-28/10042');
    });

    await t.test('3.3 Database sequence increments atomically', async () => {
      const fy = subscriptionService.getCurrentFinancialYear();
      const seq1 = await subscriptionService.getNextInvoiceSequence(db, fy);
      const seq2 = await subscriptionService.getNextInvoiceSequence(db, fy);
      assert.equal(seq2, seq1 + 1, 'Sequences must increment by 1 without collision');
    });

    await t.test('3.4 Defensive creation of future FY sequence', async () => {
      const futureFy = '2035-36';
      await db.query(`DROP SEQUENCE IF EXISTS gst_invoice_seq_${futureFy.replace(/-/g, '_')};`);
      const seq = await subscriptionService.getNextInvoiceSequence(db, futureFy);
      assert.equal(seq, 1, 'New future sequence begins at 1');
    });
  });

  // =========================================================================
  // 4. GST Tax Calculations
  // =========================================================================
  await suite.test('4. GST Tax Calculations (Intra-state vs Inter-state)', async (t) => {
    await t.test('4.1 Intra-state: Maharashtra customer gets CGST 9% + SGST 9%', () => {
      const subtotalPaise = 100000; // ₹1,000
      const tax = subscriptionService.calculateGstTax({ subtotalPaise, customerState: 'Maharashtra' });
      assert.equal(tax.cgstRate, 9.00);
      assert.equal(tax.sgstRate, 9.00);
      assert.equal(tax.igstRate, 0.00);
      assert.equal(tax.cgstPaise, 9000);
      assert.equal(tax.sgstPaise, 9000);
      assert.equal(tax.igstPaise, 0);
      assert.equal(tax.totalPaise, 118000);
    });

    await t.test('4.2 Inter-state: Uttar Pradesh customer gets IGST 18%', () => {
      const subtotalPaise = 100000; // ₹1,000
      const tax = subscriptionService.calculateGstTax({ subtotalPaise, customerState: 'Uttar Pradesh' });
      assert.equal(tax.cgstRate, 0.00);
      assert.equal(tax.sgstRate, 0.00);
      assert.equal(tax.igstRate, 18.00);
      assert.equal(tax.cgstPaise, 0);
      assert.equal(tax.sgstPaise, 0);
      assert.equal(tax.igstPaise, 18000);
      assert.equal(tax.totalPaise, 118000);
    });
  });

  // =========================================================================
  // 5. In-App API Endpoints & Provisioning Integration
  // =========================================================================
  await suite.test('5. Endpoints & Payment Provisioning Flow', async (t) => {
    // Seed initial active subscription
    const initialExpiry = new Date(Date.now() + 180 * 86400000);
    await db.query(`
      INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at)
      VALUES ($1, $2, 'BASIC', 'ACTIVE', NOW(), $3)
      ON CONFLICT (id) DO NOTHING;
    `, [randomUUID(), TENANT_ID, initialExpiry]);

    const authHeaders = ownerHeaders(USER_ID, TENANT_ID);

    await t.test('5.1 GET /api/app/subscription/upgrade-preview', async () => {
      const res = fakeResponse();
      await appRoutes(
        fakeRequest({ method: 'GET', headers: authHeaders }),
        res,
        urlFor('/api/app/subscription/upgrade-preview?targetPlanId=premium')
      );
      assert.equal(res.statusCode, 200);
      const body = res.json();
      assert.equal(body.success, true);
      assert.equal(body.preview.targetPlanId, 'premium');
      assert.equal(body.preview.currentPlanId, 'basic');
      assert.ok(body.preview.remainingDays > 0);
      assert.ok(body.preview.creditPaise > 0);
      assert.ok(body.preview.totalDuePaise > 0);
    });

    let renewalOrderId;
    await t.test('5.2 POST /api/app/subscription/renew/initiate', async () => {
      const res = fakeResponse();
      await appRoutes(
        fakeRequest({ method: 'POST', body: {}, headers: authHeaders }),
        res,
        urlFor('/api/app/subscription/renew/initiate')
      );
      assert.equal(res.statusCode, 200);
      const body = res.json();
      assert.equal(body.success, true);
      assert.equal(body.order.orderSubtype, 'RENEWAL');
      renewalOrderId = body.order.id;

      const orderRow = await db.query('SELECT * FROM orders WHERE id = $1', [renewalOrderId]);
      assert.equal(orderRow.rows[0].order_subtype, 'RENEWAL');
      assert.equal(orderRow.rows[0].status, 'PENDING_PAYMENT');
    });

    let upgradeOrderId;
    await t.test('5.3 POST /api/app/subscription/upgrade/initiate', async () => {
      const res = fakeResponse();
      await appRoutes(
        fakeRequest({ method: 'POST', body: { targetPlanId: 'premium' }, headers: authHeaders }),
        res,
        urlFor('/api/app/subscription/upgrade/initiate')
      );
      assert.equal(res.statusCode, 200);
      const body = res.json();
      assert.equal(body.success, true);
      assert.equal(body.order.orderSubtype, 'UPGRADE');
      upgradeOrderId = body.order.id;

      const orderRow = await db.query('SELECT * FROM orders WHERE id = $1', [upgradeOrderId]);
      assert.equal(orderRow.rows[0].order_subtype, 'UPGRADE');
      assert.equal(orderRow.rows[0].upgrade_from_plan, 'BASIC');
      assert.ok(orderRow.rows[0].proration_credit_paise > 0);
    });

    await t.test('5.4 Provisioning Renewal Order via processOrderPaymentAndProvision', async () => {
      const result = await processOrderPaymentAndProvision({
        orderId: renewalOrderId,
        gatewayUsed: 'mock',
        transactionId: 'tx_mock_renew_' + Date.now(),
        mockSuccess: true,
      });
      assert.equal(result.success, true);
      assert.equal(result.status, 'PAID');
      assert.equal(result.provisioning_status, 'COMPLETE');

      // Verify subscriptions table
      const subRes = await db.query('SELECT * FROM subscriptions WHERE tenant_id = $1', [TENANT_ID]);
      const sub = subRes.rows[0];
      assert.equal(sub.renewal_count, 1);
      assert.ok(sub.last_renewed_at !== null);
      assert.ok(new Date(sub.expires_at).getTime() > initialExpiry.getTime());

      // Verify audit event
      const eventRes = await db.query('SELECT * FROM subscription_events WHERE order_id = $1', [renewalOrderId]);
      assert.equal(eventRes.rows.length, 1);
      assert.equal(eventRes.rows[0].event_type, 'SUBSCRIPTION_RENEWED');

      // Verify GST invoice
      const invRes = await db.query('SELECT * FROM gst_invoices WHERE order_id = $1', [renewalOrderId]);
      assert.equal(invRes.rows.length, 1);
      assert.ok(invRes.rows[0].invoice_number.startsWith('MQR/'));
      assert.equal(invRes.rows[0].invoice_type, 'RENEWAL');

      // Verify order link
      const ordRes = await db.query('SELECT gst_invoice_id FROM orders WHERE id = $1', [renewalOrderId]);
      assert.equal(ordRes.rows[0].gst_invoice_id, invRes.rows[0].id);
    });

    await t.test('5.5 Provisioning Upgrade Order via processOrderPaymentAndProvision', async () => {
      const result = await processOrderPaymentAndProvision({
        orderId: upgradeOrderId,
        gatewayUsed: 'mock',
        transactionId: 'tx_mock_upg_' + Date.now(),
        mockSuccess: true,
      });
      assert.equal(result.success, true);
      assert.equal(result.status, 'PAID');

      // Verify subscriptions table
      const subRes = await db.query('SELECT * FROM subscriptions WHERE tenant_id = $1', [TENANT_ID]);
      const sub = subRes.rows[0];
      assert.equal(sub.plan_id, 'PREMIUM');
      assert.equal(sub.previous_plan_id, 'BASIC');
      assert.ok(sub.upgraded_at !== null);

      // Verify audit event
      const eventRes = await db.query('SELECT * FROM subscription_events WHERE order_id = $1', [upgradeOrderId]);
      assert.equal(eventRes.rows.length, 1);
      assert.equal(eventRes.rows[0].event_type, 'SUBSCRIPTION_UPGRADED');

      // Verify GST invoice
      const invRes = await db.query('SELECT * FROM gst_invoices WHERE order_id = $1', [upgradeOrderId]);
      assert.equal(invRes.rows.length, 1);
      assert.equal(invRes.rows[0].plan_id, 'PREMIUM');
    });

    let testInvoiceId;
    await t.test('5.6 GET /api/app/subscription/invoices listing', async () => {
      const res = fakeResponse();
      await appRoutes(
        fakeRequest({ method: 'GET', headers: authHeaders }),
        res,
        urlFor('/api/app/subscription/invoices')
      );
      assert.equal(res.statusCode, 200);
      const body = res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.invoices));
      assert.ok(body.invoices.length >= 2, 'Should list both renewal and upgrade invoices');
      testInvoiceId = body.invoices[0].id;
    });

    await t.test('5.7 GET /api/app/subscription/invoices/:id/pdf retrieval and IDOR safety', async () => {
      // 1. Owner accesses their own invoice
      const res = fakeResponse();
      await appRoutes(
        fakeRequest({ method: 'GET', headers: authHeaders }),
        res,
        urlFor(`/api/app/subscription/invoices/${testInvoiceId}/pdf`)
      );
      assert.equal(res.statusCode, 200);
      assert.equal(res.headers['Content-Type'], 'application/pdf');
      assert.ok(res.body.toString().startsWith('%PDF-'), 'Response must be valid binary PDF stream');

      // 2. IDOR check: Another authenticated tenant cannot access this invoice
      const otherAuthHeaders = ownerHeaders(OTHER_USER_ID, OTHER_TENANT_ID);
      const unauthorizedRes = fakeResponse();
      try {
        await appRoutes(
          fakeRequest({ method: 'GET', headers: otherAuthHeaders }),
          unauthorizedRes,
          urlFor(`/api/app/subscription/invoices/${testInvoiceId}/pdf`)
        );
        assert.ok([403, 404].includes(unauthorizedRes.statusCode), 'Must reject cross-tenant invoice access');
      } catch (err) {
        assert.ok([401, 403, 404].includes(err.status), 'Throws 403 or 404 on cross-tenant access');
      }
    });

    await t.test('5.8 SSE Plan Unlock Broadcast verification', () => {
      const receivedChunks = [];
      let cleanupFn = () => {};
      const mockRes = {
        writeHead: () => {},
        write: (chunk) => {
          receivedChunks.push(chunk);
        },
        on: () => {},
      };
      const mockReq = {
        on: (ev, handler) => {
          if (ev === 'close') cleanupFn = handler;
        },
      };
      orderStream.registerOrderClient(TENANT_ID, mockRes, mockReq, { canReceiveOrders: false });

      orderStream.broadcastPlanEvent(TENANT_ID, {
        type: 'plan_updated',
        plan: 'PREMIUM',
        expiresAt: new Date().toISOString(),
      });

      const joined = receivedChunks.join('\n');
      assert.ok(joined.includes('event: plan_updated'), 'Received plan_updated event');
      assert.ok(joined.includes('"plan":"PREMIUM"'), 'Received payload data');
      cleanupFn();
    });
  });
});
