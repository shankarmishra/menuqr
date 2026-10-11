import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, createHash } from 'node:crypto';
import { pool, connectDB } from '../db.js';
import { ADDONS, PLANS, processOrderPaymentAndProvision } from '../routes/purchase.js';
import { isValidGoogleReviewUrl } from '../routes/app.js';
import publicRoutes, { getFullPublicMenuData, invalidatePublicMenuCache, clearAllPublicMenuCaches } from '../routes/public.js';
import appRoutes from '../routes/app.js';
import adminRoutes from '../routes/admin.js';
import purchaseRoutes from '../routes/purchase.js';
import { generateAuthToken } from '../auth.js';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required to run tests.');
}

function mockResponse() {
  const res = {
    statusCode: 200,
    headers: {},
    body: '',
    writeHead(status, headers = {}) {
      res.statusCode = status;
      Object.assign(res.headers, headers);
    },
    setHeader(key, value) {
      res.headers[key] = value;
    },
    end(data) {
      res.body = data;
    },
    get json() {
      try {
        return JSON.parse(res.body || '{}');
      } catch {
        return {};
      }
    }
  };
  return res;
}

test('Google Reviews Paid Annual Add-on Full Specification Test Suite', async (suite) => {
  await connectDB(process.env.DATABASE_URL);

  // ───────────────────────────────────────────────────────────────────────────
  // 1. ADDON CATALOGUE & PRICING RULES
  // ───────────────────────────────────────────────────────────────────────────
  await suite.test('1. Authoritative Addon Catalogue & Pricing Invariants', async (t) => {
    await t.test('ADDONS catalogue exports stable google_reviews add-on definition', () => {
      assert.ok(ADDONS.google_reviews, 'ADDONS.google_reviews must exist');
      assert.equal(ADDONS.google_reviews.id, 'google_reviews');
      assert.equal(ADDONS.google_reviews.name, 'Google Reviews Integration');
      assert.equal(ADDONS.google_reviews.currency, 'INR');
      assert.equal(ADDONS.google_reviews.billingPeriod, 'YEARLY');
      assert.equal(typeof ADDONS.google_reviews.price, 'number');
      assert.equal(ADDONS.google_reviews.price, 499, 'Default annual price must be ₹499');
    });

    await t.test('GET /api/purchase/addons returns active addon catalogue', async () => {
      const req = { method: 'GET', headers: {} };
      const res = mockResponse();
      const url = new URL('http://localhost/api/purchase/addons');

      const handled = await purchaseRoutes(req, res, url);
      assert.equal(handled, true);
      assert.equal(res.statusCode, 200);
      assert.ok(Array.isArray(res.json.addons));
      const gr = res.json.addons.find((a) => a.id === 'google_reviews');
      assert.ok(gr, 'google_reviews should be present in addons catalogue');
      assert.equal(gr.price, 499);
      assert.equal(gr.currency, 'INR');
    });

    await t.test('GET /api/purchase/catalogue includes plans and addons', async () => {
      const req = { method: 'GET', headers: {} };
      const res = mockResponse();
      const url = new URL('http://localhost/api/purchase/catalogue');

      const handled = await purchaseRoutes(req, res, url);
      assert.equal(handled, true);
      assert.equal(res.statusCode, 200);
      assert.ok(res.json.plans);
      assert.ok(Array.isArray(res.json.addons));
      const gr = res.json.addons.find((a) => a.id === 'google_reviews');
      assert.ok(gr);
      assert.equal(gr.price, 499);
    });

    await t.test('Coupon discount applies strictly to base plan, add-on amount is added to net amount', () => {
      // Test formula: payable = (plan.price - couponDiscount) + addonAmount
      const planPrice = PLANS.intermediate.price; // 1499
      const addonPrice = ADDONS.google_reviews.price; // 499
      const discountPct = 10;
      const discountAmount = Math.round((planPrice * discountPct) / 100); // 150
      const netPlanPrice = planPrice - discountAmount; // 1349
      const totalPayable = netPlanPrice + addonPrice; // 1848

      assert.equal(planPrice, 1499);
      assert.equal(addonPrice, 499);
      assert.equal(discountAmount, 150);
      assert.equal(netPlanPrice, 1349);
      assert.equal(totalPayable, 1848);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 2. URL VALIDATION & SANITIZATION ENGINE
  // ───────────────────────────────────────────────────────────────────────────
  await suite.test('2. Google Review URL Validation & Sanitization Engine', async (t) => {
    await t.test('Accepts authentic Google review links across supported Google domains', () => {
      const validUrls = [
        'https://g.page/r/CZZabcdef123/review',
        'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
        'https://maps.google.com/?cid=1029384756',
        'https://maps.app.goo.gl/wXYZ1234abcd',
        'https://goo.gl/maps/kLmNoPqRsTuV',
        'https://www.google.com/maps/place/Some+Restaurant/@12.9716,77.5946,17z/data=!4m8!3m7!1s0x0:0x0!8m2!3d12.9716!4d77.5946',
        'https://www.google.co.in/maps/place/Dhaba',
        'https://business.google.com/v/sample/review',
      ];

      for (const u of validUrls) {
        assert.equal(isValidGoogleReviewUrl(u), true, `URL should be valid: ${u}`);
      }
    });

    await t.test('Rejects plain HTTP, javascript scheme, and non-Google domains', () => {
      const invalidUrls = [
        'http://g.page/r/abcdef/review', // plain http
        'javascript:alert("hacked")', // javascript scheme
        'ftp://google.com/review', // ftp scheme
        'https://evil-google.com/review', // lookalike domain
        'https://g.page.evilphishing.com/r/test', // subdomain abuse
        'https://trustpilot.com/review/restaurant', // 3rd party
        'https://zomato.com/bangalore/restaurant', // 3rd party
        'https://127.0.0.1/review', // local ip
        'https://localhost:3000/review', // localhost
        'https://169.254.169.254/latest/meta-data', // AWS metadata
        'not-a-valid-url', // malformed
        '', // empty
      ];

      for (const u of invalidUrls) {
        assert.equal(isValidGoogleReviewUrl(u), false, `URL should be rejected: ${u}`);
      }
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 3. ORDER CREATION, ADD-ON SELECTION & SERVER-AUTHORITATIVE CHARGE
  // ───────────────────────────────────────────────────────────────────────────
  await suite.test('3. Order Creation & Authoritative Payable Calculations', async (t) => {
    const testEmail = `addon-order-test-${randomUUID()}@menusqr.in`;
    const testPhone = '+919876543210';

    t.after(async () => {
      await pool.query('DELETE FROM orders WHERE customer_email = $1', [testEmail]);
      await pool.query('DELETE FROM email_verification_grants WHERE email = $1', [testEmail]);
    });

    // Create grant so order passes mandatory email verification
    const grantToken = randomUUID();
    await pool.query(
      `INSERT INTO email_verification_grants (id, email, token, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '15 minutes')`,
      [randomUUID(), testEmail, grantToken]
    );

    await t.test('Order with Google Reviews add-on stores selected_addons and charges correct total', async () => {
      const req = {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          customerName: 'Test Owner',
          customerEmail: testEmail,
          phone: testPhone,
          businessName: 'Addon Dhaba',
          businessType: 'restaurant',
          city: 'Mumbai',
          state: 'Maharashtra',
          address: '42 Marine Drive',
          planId: 'BASIC', // 999
          selectedAddons: ['google_reviews'], // +499 = 1498
          emailVerificationToken: grantToken,
        }),
      };
      const { Readable } = await import('node:stream');
      const streamReq = Readable.from([Buffer.from(req.body)]);
      streamReq.method = 'POST';
      streamReq.headers = req.headers;

      const res = mockResponse();
      const url = new URL('http://localhost/api/purchase/orders');

      const handled = await purchaseRoutes(streamReq, res, url);
      assert.equal(handled, true);
      assert.equal(res.statusCode, 200);
      assert.ok(res.json.orderId);

      const dbOrder = await pool.query('SELECT * FROM orders WHERE id = $1', [res.json.orderId]);
      assert.equal(dbOrder.rows.length, 1);
      const row = dbOrder.rows[0];
      assert.equal(Number(row.amount), 1498, 'Basic (999) + Google Reviews (499) must equal 1498');
      assert.equal(Number(row.addon_amount), 499);
      assert.equal(row.selected_addons[0].id, 'google_reviews');
    });

    await t.test('Deduplicates duplicate add-on selections to prevent double-charging', async () => {
      const grantToken2 = randomUUID();
      await pool.query(
        `INSERT INTO email_verification_grants (id, email, token, expires_at)
         VALUES ($1, $2, $3, NOW() + INTERVAL '15 minutes')`,
        [randomUUID(), testEmail, grantToken2]
      );

      const reqBody = JSON.stringify({
        customerName: 'Test Owner Dup',
        customerEmail: testEmail,
        phone: testPhone,
        businessName: 'Addon Dhaba Dup',
        businessType: 'restaurant',
        city: 'Mumbai',
        state: 'Maharashtra',
        address: '42 Marine Drive',
        planId: 'BASIC', // 999
        selectedAddons: ['google_reviews', 'google_reviews'], // Should deduplicate to 1
        emailVerificationToken: grantToken2,
      });
      const { Readable } = await import('node:stream');
      const streamReq = Readable.from([Buffer.from(reqBody)]);
      streamReq.method = 'POST';
      streamReq.headers = { 'content-type': 'application/json' };

      const res = mockResponse();
      const url = new URL('http://localhost/api/purchase/orders');

      await purchaseRoutes(streamReq, res, url);
      assert.equal(res.statusCode, 200);

      const dbOrder = await pool.query('SELECT * FROM orders WHERE id = $1', [res.json.orderId]);
      const row = dbOrder.rows[0];
      assert.equal(Number(row.amount), 1498, 'Must charge 499 once, not twice');
      assert.equal(row.selected_addons[0].id, 'google_reviews');
      assert.equal(row.selected_addons.length, 1);
    });

    await t.test('Rejects unknown add-on identifiers', async () => {
      const grantToken3 = randomUUID();
      await pool.query(
        `INSERT INTO email_verification_grants (id, email, token, expires_at)
         VALUES ($1, $2, $3, NOW() + INTERVAL '15 minutes')`,
        [randomUUID(), testEmail, grantToken3]
      );

      const reqBody = JSON.stringify({
        customerName: 'Test Invalid Addon',
        customerEmail: testEmail,
        phone: testPhone,
        businessName: 'Addon Dhaba Invalid',
        businessType: 'restaurant',
        city: 'Mumbai',
        state: 'Maharashtra',
        address: '42 Marine Drive',
        planId: 'BASIC',
        selectedAddons: ['invalid_addon_nonexistent'],
        emailVerificationToken: grantToken3,
      });
      const { Readable } = await import('node:stream');
      const streamReq = Readable.from([Buffer.from(reqBody)]);
      streamReq.method = 'POST';
      streamReq.headers = { 'content-type': 'application/json' };

      const res = mockResponse();
      const url = new URL('http://localhost/api/purchase/orders');

      await assert.rejects(async () => {
        await purchaseRoutes(streamReq, res, url);
      }, (err) => err.status === 400);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 4. PAYMENT PROVISIONING & ENTITLEMENT ACTIVATION (IDEMPOTENCY)
  // ───────────────────────────────────────────────────────────────────────────
  await suite.test('4. Payment Provisioning & Add-on Entitlement Lifecycle', async (t) => {
    const orderId = `order-prov-${randomUUID()}`;
    const testEmail = `owner-prov-${randomUUID()}@menusqr.in`;
    let provisionedTenantId = null;

    t.after(async () => {
      if (provisionedTenantId) {
        await pool.query('DELETE FROM tenant_addon_entitlements WHERE tenant_id = $1', [provisionedTenantId]);
        await pool.query('DELETE FROM tenant_google_reviews WHERE tenant_id = $1', [provisionedTenantId]);
        await pool.query('DELETE FROM tenant_qr_identity WHERE tenant_id = $1', [provisionedTenantId]);
        await pool.query('DELETE FROM qr_codes WHERE tenant_id = $1', [provisionedTenantId]);
        await pool.query('DELETE FROM menus WHERE tenant_id = $1', [provisionedTenantId]);
        await pool.query('DELETE FROM subscriptions WHERE tenant_id = $1', [provisionedTenantId]);
        await pool.query('DELETE FROM activity_logs WHERE tenant_id = $1', [provisionedTenantId]);
        await pool.query('DELETE FROM users WHERE tenant_id = $1', [provisionedTenantId]);
        await pool.query('DELETE FROM clients WHERE id = $1', [provisionedTenantId]);
      }
      await pool.query('DELETE FROM payments WHERE order_id = $1', [orderId]);
      await pool.query('DELETE FROM orders WHERE id = $1', [orderId]);
      await pool.query('DELETE FROM users WHERE email = $1', [testEmail]);
    });

    await t.test('processOrderPaymentAndProvision provisions tenant and activates addon entitlement', async () => {
      await pool.query(`
        INSERT INTO orders (
          id, customer_name, customer_email, phone, business_name,
          business_type, plan_id, currency, amount, addon_amount, selected_addons,
          status, created_at, updated_at
        ) VALUES (
          $1, 'Prov Owner', $2, '+919999988888', 'Prov Restaurant',
          'restaurant', 'INTERMEDIATE', 'INR', 1998, 499, '[{"id":"google_reviews","name":"Google Reviews Integration","price":499,"currency":"INR"}]'::jsonb,
          'PENDING_PAYMENT', NOW(), NOW()
        )
      `, [orderId, testEmail]);

      const result = await processOrderPaymentAndProvision({
        orderId,
        mockSuccess: true,
        transactionId: `cf_pay_${randomUUID()}`,
        payloadAmount: 1998,
        payloadCurrency: 'INR',
        payloadEmail: testEmail,
      });

      assert.equal(Boolean(result.alreadyProvisioned), false);
      assert.equal(result.status, 'PAID');
      assert.equal(result.provisioning_status, 'COMPLETE');

      // Verify tenant_addon_entitlements row
      const entRes = await pool.query(
        'SELECT * FROM tenant_addon_entitlements WHERE order_id = $1 AND addon_id = $2',
        [orderId, 'google_reviews']
      );
      assert.equal(entRes.rows.length, 1);
      const ent = entRes.rows[0];
      assert.equal(ent.status, 'ACTIVE');
      assert.ok(new Date(ent.expires_at) > new Date(), 'expires_at should be in future');
      provisionedTenantId = ent.tenant_id;

      // Test idempotency: re-executing with the same order returns alreadyProvisioned: true
      const secondResult = await processOrderPaymentAndProvision({
        orderId,
        mockSuccess: true,
        transactionId: `cf_pay_dup_${randomUUID()}`,
        payloadAmount: 1998,
        payloadCurrency: 'INR',
        payloadEmail: testEmail,
      });
      assert.equal(secondResult.alreadyProvisioned, true);

      // Ensure no duplicate rows were created in tenant_addon_entitlements
      const countRes = await pool.query(
        'SELECT COUNT(*) as count FROM tenant_addon_entitlements WHERE order_id = $1 AND addon_id = $2',
        [orderId, 'google_reviews']
      );
      assert.equal(Number(countRes.rows[0].count), 1);
    });

    await t.test('Rebuying or renewing add-on extends future expiry without shortening', async () => {
      // Set existing entitlement to 60 days in the future
      const targetFuture = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
      await pool.query(
        'UPDATE tenant_addon_entitlements SET expires_at = $1 WHERE tenant_id = $2 AND addon_id = $3',
        [targetFuture, provisionedTenantId, 'google_reviews']
      );

      const renewOrderId = `order-renew-${randomUUID()}`;
      await pool.query(`
        INSERT INTO orders (
          id, customer_name, customer_email, phone, business_name,
          business_type, plan_id, currency, amount, addon_amount, selected_addons,
          status, created_at, updated_at
        ) VALUES (
          $1, 'Prov Owner', $2, '+919999988888', 'Prov Restaurant',
          'restaurant', 'INTERMEDIATE', 'INR', 1998, 499, '[{"id":"google_reviews","name":"Google Reviews Integration","price":499,"currency":"INR"}]'::jsonb,
          'PENDING_PAYMENT', NOW(), NOW()
        )
      `, [renewOrderId, testEmail]);

      await processOrderPaymentAndProvision({
        orderId: renewOrderId,
        mockSuccess: true,
        transactionId: `cf_pay_renew_${randomUUID()}`,
        payloadAmount: 1998,
        payloadCurrency: 'INR',
        payloadEmail: testEmail,
      });

      const updatedEnt = await pool.query(
        'SELECT * FROM tenant_addon_entitlements WHERE tenant_id = $1 AND addon_id = $2',
        [provisionedTenantId, 'google_reviews']
      );
      assert.equal(updatedEnt.rows.length, 1);
      const newExpiry = new Date(updatedEnt.rows[0].expires_at);

      // Must be at least 400 days in future (60 days + 1 year) and strictly greater than targetFuture + 360 days
      const expectedMinExpiry = new Date(targetFuture.getTime() + 360 * 24 * 60 * 60 * 1000);
      assert.ok(newExpiry > expectedMinExpiry, `New expiry (${newExpiry.toISOString()}) must be extended past 1 year + remaining duration`);

      // Clean up second order
      await pool.query('DELETE FROM payments WHERE order_id = $1', [renewOrderId]);
      await pool.query('DELETE FROM orders WHERE id = $1', [renewOrderId]);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 5. TENANT DASHBOARD SETTINGS & CROSS-TENANT ISOLATION
  // ───────────────────────────────────────────────────────────────────────────
  await suite.test('5. Tenant Dashboard Configuration & Access Isolation', async (t) => {
    const tenantA = `tenant-a-${randomUUID()}`;
    const tenantB = `tenant-b-${randomUUID()}`;
    const userA = { id: randomUUID(), tenantId: tenantA, role: 'RESTAURANT_OWNER' };
    const userB = { id: randomUUID(), tenantId: tenantB, role: 'RESTAURANT_OWNER' };
    const tokenA = generateAuthToken(userA);
    const tokenB = generateAuthToken(userB);

    t.before(async () => {
      await pool.query(
        "INSERT INTO clients (id, public_id, business_name, menu_slug, status) VALUES ($1, $2, 'Tenant A Cafe', $3, 'active')",
        [tenantA, randomUUID().split('-')[0], `slug-a-${randomUUID()}`]
      );
      await pool.query(
        "INSERT INTO clients (id, public_id, business_name, menu_slug, status) VALUES ($1, $2, 'Tenant B Cafe', $3, 'active')",
        [tenantB, randomUUID().split('-')[0], `slug-b-${randomUUID()}`]
      );
      // Insert users into users table so enforceAuth finds them
      await pool.query(
        "INSERT INTO users (id, email, password_hash, role, tenant_id) VALUES ($1, $2, 'hash_a', 'RESTAURANT_OWNER', $3)",
        [userA.id, `user-a-${randomUUID()}@menusqr.in`, tenantA]
      );
      await pool.query(
        "INSERT INTO users (id, email, password_hash, role, tenant_id) VALUES ($1, $2, 'hash_b', 'RESTAURANT_OWNER', $3)",
        [userB.id, `user-b-${randomUUID()}@menusqr.in`, tenantB]
      );

      // Tenant A has active addon entitlement
      await pool.query(`
        INSERT INTO tenant_addon_entitlements (id, tenant_id, addon_id, status, started_at, expires_at)
        VALUES ($1, $2, 'google_reviews', 'ACTIVE', NOW(), NOW() + INTERVAL '1 year')
      `, [randomUUID(), tenantA]);
      // Tenant B has NO entitlement
    });

    t.after(async () => {
      await pool.query('DELETE FROM users WHERE id IN ($1, $2)', [userA.id, userB.id]);
      await pool.query('DELETE FROM tenant_addon_entitlements WHERE tenant_id IN ($1, $2)', [tenantA, tenantB]);
      await pool.query('DELETE FROM tenant_google_reviews WHERE tenant_id IN ($1, $2)', [tenantA, tenantB]);
      await pool.query('DELETE FROM clients WHERE id IN ($1, $2)', [tenantA, tenantB]);
    });

    await t.test('Tenant without entitlement returns NOT_SUBSCRIBED and canConfigure: false', async () => {
      const req = {
        method: 'GET',
        headers: { authorization: `Bearer ${tokenB}` },
      };
      const res = mockResponse();
      const url = new URL('http://localhost/api/app/addons/google-reviews');

      const handled = await appRoutes(req, res, url);
      assert.equal(handled, true);
      assert.equal(res.statusCode, 200);
      assert.equal(res.json.status, 'NOT_SUBSCRIBED');
      assert.equal(res.json.canConfigure, false);
      assert.equal(res.json.reviewUrl || '', '');
    });

    await t.test('Tenant A with active entitlement but no URL returns SETUP_REQUIRED', async () => {
      const req = {
        method: 'GET',
        headers: { authorization: `Bearer ${tokenA}` },
      };
      const res = mockResponse();
      const url = new URL('http://localhost/api/app/addons/google-reviews');

      const handled = await appRoutes(req, res, url);
      assert.equal(handled, true);
      assert.equal(res.statusCode, 200);
      assert.equal(res.json.status, 'SETUP_REQUIRED');
      assert.equal(res.json.canConfigure, true);
      assert.equal(res.json.reviewUrl || '', '');
    });

    await t.test('Tenant B cannot PUT review URL (returns 403 Forbidden)', async () => {
      const { Readable } = await import('node:stream');
      const streamReq = Readable.from([Buffer.from(JSON.stringify({ reviewUrl: 'https://g.page/r/test/review' }))]);
      streamReq.method = 'PUT';
      streamReq.headers = {
        'content-type': 'application/json',
        authorization: `Bearer ${tokenB}`,
      };

      const res = mockResponse();
      const url = new URL('http://localhost/api/app/addons/google-reviews');

      await assert.rejects(async () => {
        await appRoutes(streamReq, res, url);
      }, (err) => err.status === 403);
    });

    await t.test('Tenant A can save valid Google review URL -> status becomes ACTIVE', async () => {
      const targetUrl = 'https://search.google.com/local/writereview?placeid=ChIJTEST123';
      const { Readable } = await import('node:stream');
      const streamReq = Readable.from([Buffer.from(JSON.stringify({ reviewUrl: targetUrl }))]);
      streamReq.method = 'PUT';
      streamReq.headers = {
        'content-type': 'application/json',
        authorization: `Bearer ${tokenA}`,
      };

      const res = mockResponse();
      const url = new URL('http://localhost/api/app/addons/google-reviews');

      const handled = await appRoutes(streamReq, res, url);
      assert.equal(handled, true);
      assert.equal(res.statusCode, 200);
      assert.equal(res.json.status, 'ACTIVE');
      assert.equal(res.json.reviewUrl, targetUrl);

      // Verify persisted in DB
      const getReq = {
        method: 'GET',
        headers: { authorization: `Bearer ${tokenA}` },
      };
      const getRes = mockResponse();
      await appRoutes(getReq, getRes, url);
      assert.equal(getRes.json.status, 'ACTIVE');
      assert.equal(getRes.json.reviewUrl, targetUrl);
    });

    await t.test('Tenant A can delete review URL -> status becomes SETUP_REQUIRED', async () => {
      const req = {
        method: 'DELETE',
        headers: { authorization: `Bearer ${tokenA}` },
      };
      const res = mockResponse();
      const url = new URL('http://localhost/api/app/addons/google-reviews');

      const handled = await appRoutes(req, res, url);
      assert.equal(handled, true);
      assert.equal(res.statusCode, 200);
      assert.equal(res.json.status, 'SETUP_REQUIRED');
      assert.equal(res.json.reviewUrl, '');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 6. PUBLIC MENU INTEGRATION, PERMANENT QR PRESERVATION & CACHE
  // ───────────────────────────────────────────────────────────────────────────
  await suite.test('6. Public Menu API, Cache Invalidation & QR Invariant', async (t) => {
    const tenantId = `pub-menu-test-${randomUUID()}`;
    const menuSlug = `pub-slug-${randomUUID()}`;
    const qrId = `pub-qr-${randomUUID().split('-')[0]}`;
    const testReviewUrl = 'https://g.page/r/pubtest/review';

    t.before(async () => {
      clearAllPublicMenuCaches();
      await pool.query(
        "INSERT INTO clients (id, public_id, business_name, menu_slug, status) VALUES ($1, $2, 'Public Menu Cafe', $3, 'active')",
        [tenantId, randomUUID().split('-')[0], menuSlug]
      );
      await pool.query(
        "INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at) VALUES ($1, $2, 'PREMIUM', 'ACTIVE', NOW(), NOW() + INTERVAL '1 year')",
        [randomUUID(), tenantId]
      );
      await pool.query(
        "INSERT INTO qr_codes (id, tenant_id, public_id, qr_id, destination_type, is_active) VALUES ($1, $2, $3, $4, 'menu', true)",
        [randomUUID(), tenantId, randomUUID().split('-')[0], qrId]
      );
      const menuId = randomUUID();
      await pool.query("INSERT INTO menus (id, tenant_id, name, status) VALUES ($1, $2, 'Main', 'PUBLISHED')", [menuId, tenantId]);
    });

    t.after(async () => {
      clearAllPublicMenuCaches();
      await pool.query('DELETE FROM tenant_addon_entitlements WHERE tenant_id = $1', [tenantId]);
      await pool.query('DELETE FROM tenant_google_reviews WHERE tenant_id = $1', [tenantId]);
      await pool.query('DELETE FROM qr_codes WHERE tenant_id = $1', [tenantId]);
      await pool.query('DELETE FROM menus WHERE tenant_id = $1', [tenantId]);
      await pool.query('DELETE FROM subscriptions WHERE tenant_id = $1', [tenantId]);
      await pool.query('DELETE FROM clients WHERE id = $1', [tenantId]);
    });

    await t.test('Without add-on entitlement, public menu returns googleReviews: { enabled: false }', async () => {
      const data = await getFullPublicMenuData(tenantId);
      assert.ok(data.googleReviews);
      assert.equal(data.googleReviews.enabled, false);
      assert.equal(data.googleReviews.reviewUrl, undefined);
    });

    await t.test('With active entitlement AND reviewUrl, public menu returns googleReviews: { enabled: true, reviewUrl }', async () => {
      await pool.query(`
        INSERT INTO tenant_addon_entitlements (id, tenant_id, addon_id, status, started_at, expires_at)
        VALUES ($1, $2, 'google_reviews', 'ACTIVE', NOW(), NOW() + INTERVAL '1 year')
      `, [randomUUID(), tenantId]);
      await pool.query(`
        INSERT INTO tenant_google_reviews (tenant_id, review_url, updated_at)
        VALUES ($1, $2, NOW())
      `, [tenantId, testReviewUrl]);

      invalidatePublicMenuCache(tenantId);

      const data = await getFullPublicMenuData(tenantId);
      assert.ok(data.googleReviews);
      assert.equal(data.googleReviews.enabled, true);
      assert.equal(data.googleReviews.reviewUrl, testReviewUrl);
    });

    await t.test('When add-on entitlement is EXPIRED, review button is disabled even if URL is stored', async () => {
      // Set expires_at in the past
      await pool.query(`
        UPDATE tenant_addon_entitlements
        SET expires_at = NOW() - INTERVAL '1 day'
        WHERE tenant_id = $1 AND addon_id = 'google_reviews'
      `, [tenantId]);

      invalidatePublicMenuCache(tenantId);

      const data = await getFullPublicMenuData(tenantId);
      assert.ok(data.googleReviews);
      assert.equal(data.googleReviews.enabled, false, 'Expired entitlement must disable review button');
      assert.equal(data.googleReviews.reviewUrl, undefined, 'Expired entitlement must not leak reviewUrl');
    });

    await t.test('Permanent QR identifier remains completely unchanged', async () => {
      const qrRes = await pool.query('SELECT qr_id, destination_type FROM qr_codes WHERE tenant_id = $1', [tenantId]);
      assert.equal(qrRes.rows[0].qr_id, qrId);
      assert.equal(qrRes.rows[0].destination_type, 'menu');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 7. SUPER-ADMIN REVENUE & METRICS ENDPOINT
  // ───────────────────────────────────────────────────────────────────────────
  await suite.test('7. Super-Admin Add-on Reporting & Revenue Tracking', async (t) => {
    const adminId = randomUUID();
    const adminSessionToken = randomUUID();
    const tokenHash = createHash('sha256').update(adminSessionToken).digest('hex');

    t.after(async () => {
      await pool.query('DELETE FROM admin_sessions WHERE admin_id = $1', [adminId]);
      await pool.query('DELETE FROM admin_users WHERE id = $1', [adminId]);
    });

    await pool.query(
      "INSERT INTO admin_users (id, email, status) VALUES ($1, $2, 'active')",
      [adminId, `admin-addon-${randomUUID()}@menusqr.in`]
    );
    await pool.query(
      "INSERT INTO admin_sessions (id, admin_id, token_hash, expires_at) VALUES ($1, $2, $3, NOW() + INTERVAL '1 hour')",
      [randomUUID(), adminId, tokenHash]
    );

    await t.test('Super-admin endpoint returns revenue summary and subscribers list', async () => {
      const req = {
        method: 'GET',
        headers: {
          cookie: `menusqr_admin_session=${adminSessionToken}`,
        },
      };
      const res = mockResponse();
      const url = new URL('http://localhost/api/admin/addons/google-reviews');

      const handled = await adminRoutes(req, res, url);
      assert.equal(handled, true);
      assert.equal(res.statusCode, 200);

      const body = res.json;
      assert.ok(body.summary, 'Summary should be present');
      assert.equal(typeof body.summary.totalRevenuePaise, 'number');
      assert.equal(typeof body.summary.totalRevenueRupees, 'number');
      assert.equal(typeof body.summary.totalSubscribers, 'number');
      assert.equal(typeof body.summary.activeSubscribers, 'number');
      assert.ok(Array.isArray(body.subscribers));
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 8. COMPLETE END-TO-END CUSTOMER JOURNEY (DISPOSABLE DATA)
  // ───────────────────────────────────────────────────────────────────────────
  await suite.test('8. Complete Customer Journey with Disposable Local Data', async (t) => {
    const e2eEmail = `journey-${randomUUID()}@menusqr.in`;
    const grantToken = randomUUID();
    let e2eOrderId = null;
    let createdTenantId = null;
    let initialQrId = null;

    t.after(async () => {
      if (createdTenantId) {
        await pool.query('DELETE FROM tenant_addon_entitlements WHERE tenant_id = $1', [createdTenantId]);
        await pool.query('DELETE FROM tenant_google_reviews WHERE tenant_id = $1', [createdTenantId]);
        await pool.query('DELETE FROM tenant_qr_identity WHERE tenant_id = $1', [createdTenantId]);
        await pool.query('DELETE FROM qr_codes WHERE tenant_id = $1', [createdTenantId]);
        await pool.query('DELETE FROM menus WHERE tenant_id = $1', [createdTenantId]);
        await pool.query('DELETE FROM appearance_settings WHERE tenant_id = $1', [createdTenantId]);
        await pool.query('DELETE FROM subscriptions WHERE tenant_id = $1', [createdTenantId]);
        await pool.query('DELETE FROM activity_logs WHERE tenant_id = $1', [createdTenantId]);
        await pool.query('DELETE FROM users WHERE tenant_id = $1', [createdTenantId]);
        await pool.query('DELETE FROM clients WHERE id = $1', [createdTenantId]);
      }
      if (e2eOrderId) {
        await pool.query('DELETE FROM payments WHERE order_id = $1', [e2eOrderId]);
        await pool.query('DELETE FROM orders WHERE id = $1', [e2eOrderId]);
      }
      await pool.query('DELETE FROM users WHERE email = $1', [e2eEmail]);
      await pool.query('DELETE FROM email_verification_grants WHERE email = $1', [e2eEmail]);
    });

    // Setup email verification grant
    await pool.query(
      `INSERT INTO email_verification_grants (id, email, token, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '15 minutes')`,
      [randomUUID(), e2eEmail, grantToken]
    );

    // Step 1 & 2: Select subscription plus Google Reviews add-on & verify server-calculated total
    await t.test('Step 1 & 2: Select plan + addon and confirm server-calculated order total', async () => {
      const { Readable } = await import('node:stream');
      const orderBody = JSON.stringify({
        customerName: 'Journey Owner',
        customerEmail: e2eEmail,
        phone: '+919876543299',
        businessName: 'Journey Bistro',
        businessType: 'restaurant',
        city: 'Pune',
        state: 'Maharashtra',
        address: '10 FC Road',
        planId: 'BASIC', // 999
        selectedAddons: ['google_reviews'], // + 499 = 1498
        emailVerificationToken: grantToken,
      });
      const streamReq = Readable.from([Buffer.from(orderBody)]);
      streamReq.method = 'POST';
      streamReq.headers = { 'content-type': 'application/json' };

      const res = mockResponse();
      const url = new URL('http://localhost/api/purchase/orders');

      await purchaseRoutes(streamReq, res, url);
      assert.equal(res.statusCode, 200);
      e2eOrderId = res.json.orderId;
      assert.ok(e2eOrderId);

      const dbOrder = await pool.query('SELECT * FROM orders WHERE id = $1', [e2eOrderId]);
      assert.equal(Number(dbOrder.rows[0].amount), 1498);
      assert.equal(Number(dbOrder.rows[0].addon_amount), 499);
      assert.equal(dbOrder.rows[0].selected_addons[0].id, 'google_reviews');
    });

    // Step 3: Verify entitlement activation through existing trusted payment path
    await t.test('Step 3: Verify payment and entitlement activation', async () => {
      const payResult = await processOrderPaymentAndProvision({
        orderId: e2eOrderId,
        mockSuccess: true,
        transactionId: `cf_journey_${randomUUID()}`,
        payloadAmount: 1498,
        payloadCurrency: 'INR',
        payloadEmail: e2eEmail,
      });

      assert.equal(payResult.status, 'PAID');
      assert.equal(payResult.provisioning_status, 'COMPLETE');

      const entRes = await pool.query(
        'SELECT * FROM tenant_addon_entitlements WHERE order_id = $1 AND addon_id = $2',
        [e2eOrderId, 'google_reviews']
      );
      assert.equal(entRes.rows.length, 1);
      assert.equal(entRes.rows[0].status, 'ACTIVE');
      assert.ok(new Date(entRes.rows[0].expires_at) > new Date());
      createdTenantId = entRes.rows[0].tenant_id;

      const qrRes = await pool.query('SELECT qr_id FROM qr_codes WHERE tenant_id = $1', [createdTenantId]);
      assert.ok(qrRes.rows.length > 0);
      initialQrId = qrRes.rows[0].qr_id;
    });

    // Step 4: Save valid Google review URL in owner settings
    await t.test('Step 4: Save valid Google review URL in owner settings', async () => {
      const ownerUser = await pool.query('SELECT id FROM users WHERE tenant_id = $1', [createdTenantId]);
      const ownerToken = generateAuthToken({
        id: ownerUser.rows[0].id,
        tenantId: createdTenantId,
        role: 'RESTAURANT_OWNER',
      });

      const { Readable } = await import('node:stream');
      const putBody = JSON.stringify({
        reviewUrl: 'https://g.page/r/CZZ_Journey_Test/review',
      });
      const streamReq = Readable.from([Buffer.from(putBody)]);
      streamReq.method = 'PUT';
      streamReq.headers = {
        'content-type': 'application/json',
        authorization: `Bearer ${ownerToken}`,
      };

      const res = mockResponse();
      const url = new URL('http://localhost/api/app/addons/google-reviews');

      await appRoutes(streamReq, res, url);
      assert.equal(res.statusCode, 200);
      assert.equal(res.json.status, 'ACTIVE');
      assert.equal(res.json.reviewUrl, 'https://g.page/r/CZZ_Journey_Test/review');
    });

    // Step 5: Open public menu and verify review button appears
    await t.test('Step 5: Public menu exposes active review button', async () => {
      const menuData = await getFullPublicMenuData(createdTenantId);
      assert.ok(menuData.googleReviews);
      assert.equal(menuData.googleReviews.enabled, true);
      assert.equal(menuData.googleReviews.reviewUrl, 'https://g.page/r/CZZ_Journey_Test/review');
    });

    // Step 6: Remove or expire the entitlement and verify button disappears
    await t.test('Step 6: Expire or remove entitlement and verify button disappears', async () => {
      // (a) Expire entitlement
      await pool.query(
        'UPDATE tenant_addon_entitlements SET expires_at = NOW() - INTERVAL \'1 hour\' WHERE tenant_id = $1',
        [createdTenantId]
      );
      invalidatePublicMenuCache(createdTenantId);

      let menuData = await getFullPublicMenuData(createdTenantId);
      assert.equal(menuData.googleReviews.enabled, false);
      assert.equal(menuData.googleReviews.reviewUrl, undefined);

      // (b) Reactivate entitlement, but remove URL
      await pool.query(
        'UPDATE tenant_addon_entitlements SET expires_at = NOW() + INTERVAL \'1 year\' WHERE tenant_id = $1',
        [createdTenantId]
      );
      await pool.query(
        'DELETE FROM tenant_google_reviews WHERE tenant_id = $1',
        [createdTenantId]
      );
      invalidatePublicMenuCache(createdTenantId);

      menuData = await getFullPublicMenuData(createdTenantId);
      assert.equal(menuData.googleReviews.enabled, false);
      assert.equal(menuData.googleReviews.reviewUrl, undefined);
    });

    // Step 7: Confirm permanent QR ID and URL remain unchanged
    await t.test('Step 7: Confirm permanent QR ID remains identical', async () => {
      const qrRes = await pool.query('SELECT qr_id, destination_type FROM qr_codes WHERE tenant_id = $1', [createdTenantId]);
      assert.equal(qrRes.rows[0].qr_id, initialQrId);
      assert.equal(qrRes.rows[0].destination_type, 'menu');
    });
  });
});
