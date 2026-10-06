import { randomUUID, randomBytes, createHash } from 'node:crypto';
import slugify from 'slugify';
import { pool } from '../db.js';
import { apiError, sendJson, readJson } from '../utils.js';
import { hashPassword } from '../auth.js';
import { sendActivationEmail, sendPaymentSuccessEmail, sendRenewalEmail } from '../email.js';

// ---------------------------------------------------------------------------
// PLAN CONFIG — prices NEVER come from the frontend
// ---------------------------------------------------------------------------
const PLANS = {
  basic:        { price: 999,  label: 'Basic',        features: ['1 QR Code', 'Unlimited menu views', 'Up to 50 items', 'Basic templates', 'Email support'] },
  intermediate: { price: 1499, label: 'Intermediate', features: ['1 QR Code', 'Unlimited menu views', 'Unlimited items', 'All templates', 'Priority support', 'Analytics dashboard'] },
  premium:      { price: 2999, label: 'Premium',      features: ['1 QR Code', 'Unlimited menu views', 'Unlimited items', 'All templates', '24/7 support', 'Analytics dashboard', 'Table ordering', 'Live orders panel', 'Reception workflow'] },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makePlanKey(raw) { return (raw || '').toLowerCase().trim(); }

function generateActivationToken() {
  const raw = randomBytes(32).toString('hex');
  const hashed = createHash('sha256').update(raw).digest('hex');
  return { raw, hashed };
}

export default async function purchaseRoutes(request, response, url) {
  if (!url.pathname.startsWith('/api/purchase')) return false;

  // ─────────────────────────────────────────────────────────────────────────
  // POST /api/purchase/orders — Create order (business details + planId only)
  // ─────────────────────────────────────────────────────────────────────────
  if (request.method === 'POST' && url.pathname === '/api/purchase/orders') {
    const input = await readJson(request);
    const {
      customerName, customerEmail, phone,
      businessName, city, address, cuisine,
      website, instagram,
      planId, currency,
    } = input;

    if (!customerName || !customerEmail || !businessName || !planId) {
      throw apiError(400, 'Missing required fields.');
    }

    const planKey = makePlanKey(planId);
    const plan = PLANS[planKey];
    if (!plan) throw apiError(400, 'Invalid plan selected.');

    // Prevent duplicate active accounts for the same email
    const userCheck = await pool.query(
      'SELECT id, tenant_id FROM users WHERE email = $1',
      [customerEmail.trim().toLowerCase()]
    );
    if (userCheck.rows.length > 0 && userCheck.rows[0].tenant_id) {
      throw apiError(409, 'An account already exists with this email.');
    }

    // Idempotency: if a PENDING_PAYMENT order for this email+plan exists in last 30 mins, reuse it
    const existingOrder = await pool.query(
      `SELECT id FROM orders
        WHERE customer_email = $1 AND plan_id = $2
          AND status = 'PENDING_PAYMENT'
          AND created_at > NOW() - INTERVAL '30 minutes'
        ORDER BY created_at DESC LIMIT 1`,
      [customerEmail.trim().toLowerCase(), planKey]
    );
    if (existingOrder.rows.length > 0) {
      // Update the existing order details in case they changed and reuse
      const eid = existingOrder.rows[0].id;
      await pool.query(
        `UPDATE orders SET customer_name=$1, business_name=$2, phone=$3, city=$4, address=$5,
          cuisine=$6, website=$7, instagram=$8, updated_at=NOW() WHERE id=$9`,
        [customerName, businessName, phone || null, city || null, address || null,
         cuisine || null, website || null, instagram || null, eid]
      );
      sendJson(response, 200, { orderId: eid, amount: plan.price, status: 'PENDING_PAYMENT' });
      return true;
    }

    const orderId = `order_${randomUUID().replace(/-/g, '').substring(0, 16)}`;

    let paymentSessionId = null;
    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const isSandbox = (process.env.CASHFREE_ENV || 'TEST').toUpperCase() !== 'PROD';
    const baseUrl = isSandbox ? 'https://sandbox.cashfree.com/pg' : 'https://api.cashfree.com/pg';

    if (appId && secretKey) {
      try {
        const cfRes = await fetch(`${baseUrl}/orders`, {
          method: 'POST',
          headers: {
            'x-client-id': appId,
            'x-client-secret': secretKey,
            'x-api-version': '2023-08-01',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            order_id: orderId,
            order_amount: plan.price,
            order_currency: currency || 'INR',
            customer_details: {
              customer_id: `cust_${randomUUID().substring(0, 8)}`,
              customer_email: customerEmail.trim().toLowerCase(),
              customer_phone: phone || '9999999999',
              customer_name: customerName
            },
            order_meta: {
              return_url: `${process.env.FRONTEND_ORIGIN || 'http://localhost:5173'}/purchase/success?order_id={order_id}`
            }
          })
        });
        if (cfRes.ok) {
          const cfData = await cfRes.json();
          paymentSessionId = cfData.payment_session_id;
        } else {
          console.error('Cashfree order creation response:', await cfRes.text());
        }
      } catch (err) {
        console.error('Cashfree order creation network error:', err);
      }
    }

    await pool.query(
      `INSERT INTO orders
         (id, customer_name, customer_email, phone, business_name, city, address,
          cuisine, website, instagram, plan_id, amount, currency, status, provisioning_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [orderId, customerName, customerEmail.trim().toLowerCase(), phone || null,
       businessName, city || null, address || null, cuisine || null,
       website || null, instagram || null,
       planKey, plan.price, currency || 'INR',
       'PENDING_PAYMENT', 'PENDING']
    );

    sendJson(response, 200, { orderId, amount: plan.price, status: 'PENDING_PAYMENT', paymentSessionId });
    return true;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/purchase/orders/:id — Fetch order for review page
  // ─────────────────────────────────────────────────────────────────────────
  const orderMatch = url.pathname.match(/^\/api\/purchase\/orders\/([^/]+)$/);
  if (request.method === 'GET' && orderMatch) {
    const orderId = orderMatch[1];
    const res = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
    if (!res.rows[0]) throw apiError(404, 'Order not found.');
    const order = res.rows[0];
    // Attach plan features for the review page
    const planMeta = PLANS[makePlanKey(order.plan_id)] || {};
    sendJson(response, 200, { ...order, planLabel: planMeta.label, planFeatures: planMeta.features });
    return true;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // POST /api/purchase/orders/:id/verify — Verify payment & provision (idempotent)
  // ─────────────────────────────────────────────────────────────────────────
  const verifyMatch = url.pathname.match(/^\/api\/purchase\/orders\/([^/]+)\/verify$/);
  if (request.method === 'POST' && verifyMatch) {
    const orderId = verifyMatch[1];
    const input = await readJson(request);
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature, mockSuccess } = input;

    const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
    const order = orderRes.rows[0];
    if (!order) throw apiError(404, 'Order not found.');

    // ── IDEMPOTENCY GUARD: already fully provisioned ──────────────────────
    if (order.status === 'PAID' && order.provisioning_status === 'COMPLETE') {
      sendJson(response, 200, {
        success: true, orderId, status: 'PAID',
        provisioning_status: 'COMPLETE', alreadyProvisioned: true,
      });
      return true;
    }

    if (order.status === 'FAILED') {
      throw apiError(400, 'This order has been marked as failed. Please start a new order.');
    }

    // ── PAYMENT VERIFICATION ──────────────────────────────────────────────
    if (order.status !== 'PAID') {
      const razorpayConfigured = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

      if (razorpayConfigured) {
        if (!razorpayPaymentId || !razorpaySignature) {
          throw apiError(400, 'Razorpay payment details missing.');
        }
        // Real Razorpay signature check
        const { createHmac } = await import('node:crypto');
        const body = `${razorpayOrderId}|${razorpayPaymentId}`;
        const expected = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
          .update(body).digest('hex');
        if (expected !== razorpaySignature) {
          await pool.query("UPDATE orders SET status='FAILED' WHERE id=$1", [orderId]);
          throw apiError(400, 'Payment signature verification failed.');
        }
      } else if (process.env.NODE_ENV !== 'production' && mockSuccess) {
        // mock payment accepted only in dev/test
      } else {
        throw apiError(400, 'Payment verification data missing or invalid.');
      }

      await pool.query("UPDATE orders SET status='PAID', updated_at=NOW() WHERE id=$1", [orderId]);

      const paymentId = `pay_${randomUUID().replace(/-/g, '').substring(0, 16)}`;
      await pool.query(
        `INSERT INTO payments (id, order_id, gateway, transaction_id, amount, status, raw_response)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [paymentId, orderId,
         razorpayPaymentId ? 'razorpay' : 'mock',
         razorpayPaymentId || `mock_${randomUUID()}`,
         order.amount, 'SUCCESS',
         JSON.stringify({ razorpayPaymentId, razorpayOrderId, mockSuccess })]
      );
    }

    // ── PROVISIONING (idempotent via provisioning_status) ─────────────────
    const provCheck = await pool.query(
      'SELECT provisioning_status FROM orders WHERE id=$1', [orderId]
    );
    if (provCheck.rows[0]?.provisioning_status === 'COMPLETE') {
      sendJson(response, 200, { success: true, orderId, status: 'PAID', provisioning_status: 'COMPLETE', alreadyProvisioned: true });
      return true;
    }

    // Lock against concurrent provisioning
    await pool.query(
      "UPDATE orders SET provisioning_status='PROCESSING', updated_at=NOW() WHERE id=$1",
      [orderId]
    );

    let activationTokenRaw;
    let provisionedTenantId;

    try {
      await pool.query('BEGIN');

      // ── 1. Create or find user ───────────────────────────────────────────
      let userId;
      let tenantId;
      const userCheck = await pool.query(
        'SELECT id, tenant_id FROM users WHERE email=$1 FOR UPDATE',
        [order.customer_email]
      );

      if (userCheck.rows.length > 0) {
        userId = userCheck.rows[0].id;
        tenantId = userCheck.rows[0].tenant_id || null;
      } else {
        userId = randomUUID();
        // Random hashed password — user MUST use activation link to set real password
        const pwdHash = hashPassword(randomUUID().substring(0, 32));
        const { raw, hashed } = generateActivationToken();
        activationTokenRaw = raw;
        const tokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h

        await pool.query(
          `INSERT INTO users
             (id, email, password_hash, role, onboarding_state,
              activation_token_hash, activation_token_expires_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [userId, order.customer_email, pwdHash, 'RESTAURANT_OWNER', 'PENDING',
           hashed, tokenExpiry]
        );
      }

      // ── 2. Create restaurant (client) if not already linked ──────────────
      if (!tenantId) {
        tenantId = randomUUID();
        const publicId = randomUUID().split('-')[0];
        let menuSlug = slugify(order.business_name, { lower: true, strict: true }) || 'menu';
        const slugCheck = await pool.query(
          'SELECT id FROM clients WHERE menu_slug=$1', [menuSlug]
        );
        if (slugCheck.rows.length > 0) menuSlug = `${menuSlug}-${publicId}`;

        await pool.query(
          `INSERT INTO clients
             (id, public_id, business_name, menu_slug, category, status)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [tenantId, publicId, order.business_name, menuSlug,
           order.cuisine || null, 'active']
        );

        await pool.query(
          'UPDATE users SET tenant_id=$1, updated_at=NOW() WHERE id=$2',
          [tenantId, userId]
        );

        // ── 3. Create subscription ──────────────────────────────────────────
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        const subscriptionId = randomUUID();
        await pool.query(
          `INSERT INTO subscriptions
             (id, tenant_id, plan_id, status, started_at, expires_at)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [subscriptionId, tenantId,
           order.plan_id.toUpperCase(), 'ACTIVE', new Date(), expiresAt]
        );

        // ── 4. Create menu skeleton ─────────────────────────────────────────
        const menuId = randomUUID();
        await pool.query(
          'INSERT INTO menus (id, tenant_id, name) VALUES ($1,$2,$3)',
          [menuId, tenantId, 'Main Menu']
        );

        // ── 5. Create appearance defaults ───────────────────────────────────
        const appSettingId = randomUUID();
        await pool.query(
          `INSERT INTO appearance_settings
             (id, tenant_id, template_id, restaurant_display_name)
           VALUES ($1,$2,$3,$4)`,
          [appSettingId, tenantId, 'royal-maharaja', order.business_name]
        );

        // ── 6. Set onboarding state ─────────────────────────────────────────
        // (already set to PENDING on user insert — explicit update for safety)
        await pool.query(
          "UPDATE users SET onboarding_state='PENDING', updated_at=NOW() WHERE id=$1",
          [userId]
        );
      }

      provisionedTenantId = tenantId;

      // ── 7. Log provisioning ─────────────────────────────────────────────
      await pool.query(
        `INSERT INTO activity_logs (tenant_id, user_id, action, description, metadata)
         VALUES ($1,$2,$3,$4,$5)`,
        [tenantId, userId, 'ORDER_PROVISIONED',
         `Order ${orderId} provisioned successfully`,
         JSON.stringify({ orderId, plan: order.plan_id, amount: order.amount })]
      );

      // ── 8. Mark order complete ──────────────────────────────────────────
      await pool.query(
        "UPDATE orders SET provisioning_status='COMPLETE', updated_at=NOW() WHERE id=$1",
        [orderId]
      );

      await pool.query('COMMIT');
    } catch (e) {
      await pool.query('ROLLBACK');
      await pool.query(
        "UPDATE orders SET provisioning_status='FAILED', updated_at=NOW() WHERE id=$1",
        [orderId]
      );
      console.error('[Provisioning Error]', e);
      // Payment succeeded — don't return a 500. Tell client to contact support.
      sendJson(response, 200, {
        success: true, orderId, status: 'PAID',
        provisioning_status: 'FAILED',
        message: 'Payment received but account setup encountered an error. Contact support with your order ID.',
      });
      return true;
    }

    // ── 9. Send activation email (async, non-blocking) ───────────────────
    const planMeta = PLANS[makePlanKey(order.plan_id)] || {};
    void sendActivationEmail({
      email: order.customer_email,
      ownerName: order.customer_name,
      businessName: order.business_name,
      plan: planMeta.label || order.plan_id.toUpperCase(),
      activationToken: activationTokenRaw,  // null if user already existed
    }).catch(err => {
      console.error('[activation email error]', err);
      // Log email failure to activity_logs but don't block
      pool.query(
        `INSERT INTO activity_logs (tenant_id, action, description, metadata)
         VALUES ($1,$2,$3,$4)`,
        [provisionedTenantId, 'EMAIL_FAILED',
         'Activation email failed to send',
         JSON.stringify({ orderId, error: err.message })]
      ).catch(() => {});
    });

    sendJson(response, 200, {
      success: true, orderId, status: 'PAID', provisioning_status: 'COMPLETE',
    });
    return true;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // POST /api/purchase/renew/:orderId — Renewal (preserves restaurant/QR)
  // ─────────────────────────────────────────────────────────────────────────
  const renewMatch = url.pathname.match(/^\/api\/purchase\/renew\/([^/]+)$/);
  if (request.method === 'POST' && renewMatch) {
    const sourceOrderId = renewMatch[1];
    const input = await readJson(request);
    const { planId, razorpayPaymentId, razorpayOrderId, razorpaySignature, mockSuccess } = input;

    // Find source order
    const sourceRes = await pool.query('SELECT * FROM orders WHERE id=$1', [sourceOrderId]);
    const sourceOrder = sourceRes.rows[0];
    if (!sourceOrder) throw apiError(404, 'Source order not found.');
    if (sourceOrder.status !== 'PAID') throw apiError(400, 'Source order is not paid.');

    // Find existing tenant via user email
    const userRes = await pool.query(
      'SELECT id, tenant_id FROM users WHERE email=$1', [sourceOrder.customer_email]
    );
    if (!userRes.rows[0]?.tenant_id) throw apiError(400, 'No active account found for this order.');
    const tenantId = userRes.rows[0].tenant_id;

    // Resolve renewal plan
    const planKey = makePlanKey(planId || sourceOrder.plan_id);
    const plan = PLANS[planKey];
    const razorpayConfigured = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

    if (razorpayConfigured) {
      if (!razorpayPaymentId || !razorpaySignature) {
        throw apiError(400, 'Razorpay payment details missing.');
      }
      const { createHmac } = await import('node:crypto');
      const body = `${razorpayOrderId}|${razorpayPaymentId}`;
      const expected = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
      if (expected !== razorpaySignature) {
        throw apiError(400, 'Payment signature verification failed.');
      }
    } else if (process.env.NODE_ENV !== 'production' && mockSuccess) {
      // mock payment accepted in dev/test
    } else {
      throw apiError(400, 'Payment verification data missing or invalid.');
    }

    // Create renewal order record
    const renewOrderId = `order_${randomUUID().replace(/-/g, '').substring(0, 16)}`;
    await pool.query(
      `INSERT INTO orders
         (id, customer_name, customer_email, business_name, plan_id, amount, currency, status, provisioning_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [renewOrderId, sourceOrder.customer_name, sourceOrder.customer_email,
       sourceOrder.business_name, planKey, plan.price,
       sourceOrder.currency || 'INR', 'PAID', 'PENDING']
    );

    // Payment record (mock or Razorpay)
    const paymentId = `pay_${randomUUID().replace(/-/g, '').substring(0, 16)}`;
    await pool.query(
      `INSERT INTO payments (id, order_id, gateway, transaction_id, amount, status)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [paymentId, renewOrderId,
       razorpayPaymentId ? 'razorpay' : 'mock',
       razorpayPaymentId || `mock_renew_${randomUUID()}`,
       plan.price, 'SUCCESS']
    );

    // Extend/create subscription — same tenant, same QR
    const existingSub = await pool.query(
      'SELECT * FROM subscriptions WHERE tenant_id=$1 ORDER BY created_at DESC LIMIT 1',
      [tenantId]
    );

    let newStart = new Date();
    let newExpiry = new Date();

    if (existingSub.rows[0]) {
      // Extend from current expiry if still valid, else from now
      const currentExpiry = new Date(existingSub.rows[0].expires_at);
      newStart = currentExpiry > newStart ? currentExpiry : newStart;
      newExpiry = new Date(newStart);
      newExpiry.setFullYear(newExpiry.getFullYear() + 1);

      await pool.query(
        `UPDATE subscriptions SET plan_id=$1, status='ACTIVE', expires_at=$2, updated_at=NOW()
         WHERE tenant_id=$3`,
        [planKey.toUpperCase(), newExpiry, tenantId]
      );
    } else {
      newExpiry.setFullYear(newExpiry.getFullYear() + 1);
      const subId = randomUUID();
      await pool.query(
        `INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [subId, tenantId, planKey.toUpperCase(), 'ACTIVE', newStart, newExpiry]
      );
    }

    await pool.query(
      "UPDATE orders SET provisioning_status='COMPLETE', updated_at=NOW() WHERE id=$1",
      [renewOrderId]
    );

    // Log renewal
    await pool.query(
      `INSERT INTO activity_logs (tenant_id, action, description, metadata)
       VALUES ($1,$2,$3,$4)`,
      [tenantId, 'SUBSCRIPTION_RENEWED',
       `Subscription renewed via order ${renewOrderId}`,
       JSON.stringify({ renewOrderId, plan: planKey, expiresAt: newExpiry })]
    );

    // Send renewal email async
    void sendRenewalEmail({
      email: sourceOrder.customer_email,
      businessName: sourceOrder.business_name,
      expiresAt: newExpiry,
    }).catch(err => console.error('[renewal email error]', err));

    sendJson(response, 200, {
      success: true,
      renewOrderId,
      tenantId,
      plan: planKey,
      expiresAt: newExpiry,
      message: 'Subscription renewed. Your existing QR code and restaurant data are unchanged.',
    });
    return true;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // POST /api/purchase/orders/:id/pay — Legacy mock-payment endpoint
  // (kept for backward compat with existing CheckoutPage flow)
  // ─────────────────────────────────────────────────────────────────────────
  const payMatch = url.pathname.match(/^\/api\/purchase\/orders\/([^/]+)\/pay$/);
  if (request.method === 'POST' && payMatch) {
    if (process.env.NODE_ENV === 'production') {
      throw apiError(403, 'Mock payment endpoint disabled in production.');
    }
    // Delegate to /verify logic by forwarding as a mock verify
    const orderId = payMatch[1];
    const input = await readJson(request);
    // Allow the test card 4242... to pass, reject any other card
    const cleanCard = (input.cardNumber || '').replace(/\s+/g, '');
    if (cleanCard && cleanCard !== '4242424242424242') {
      await pool.query("UPDATE orders SET status='FAILED' WHERE id=$1", [orderId]);
      throw apiError(400, 'Payment declined. Use test card 4242 4242 4242 4242.');
    }
    // Simulate as mock verify
    const fakeReq = { ...request, body: JSON.stringify({ mockSuccess: true }) };
    // Re-use verify logic inline
    const orderRes = await pool.query('SELECT * FROM orders WHERE id=$1', [orderId]);
    const order = orderRes.rows[0];
    if (!order) throw apiError(404, 'Order not found.');

    if (order.status === 'PAID' && order.provisioning_status === 'COMPLETE') {
      sendJson(response, 200, { success: true, orderId, status: 'PAID', provisioning_status: 'COMPLETE', alreadyProvisioned: true });
      return true;
    }

    if (order.status !== 'PAID') {
      await pool.query("UPDATE orders SET status='PAID', updated_at=NOW() WHERE id=$1", [orderId]);
      const paymentId = `pay_${randomUUID().replace(/-/g, '').substring(0, 16)}`;
      await pool.query(
        `INSERT INTO payments (id, order_id, gateway, transaction_id, amount, status)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [paymentId, orderId, 'mock', `mock_${randomUUID()}`, order.amount, 'SUCCESS']
      );
    }

    const provCheck = await pool.query('SELECT provisioning_status FROM orders WHERE id=$1', [orderId]);
    if (provCheck.rows[0]?.provisioning_status === 'COMPLETE') {
      sendJson(response, 200, { success: true, orderId, status: 'PAID', provisioning_status: 'COMPLETE', alreadyProvisioned: true });
      return true;
    }

    await pool.query("UPDATE orders SET provisioning_status='PROCESSING', updated_at=NOW() WHERE id=$1", [orderId]);

    let activationTokenRaw;
    let provisionedTenantId;

    try {
      await pool.query('BEGIN');
      let userId; let tenantId;
      const userCheck = await pool.query('SELECT id, tenant_id FROM users WHERE email=$1 FOR UPDATE', [order.customer_email]);

      if (userCheck.rows.length > 0) {
        userId = userCheck.rows[0].id;
        tenantId = userCheck.rows[0].tenant_id || null;
      } else {
        userId = randomUUID();
        const pwdHash = hashPassword(randomUUID().substring(0, 32));
        const { raw, hashed } = generateActivationToken();
        activationTokenRaw = raw;
        const tokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);
        await pool.query(
          `INSERT INTO users (id, email, password_hash, role, onboarding_state, activation_token_hash, activation_token_expires_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [userId, order.customer_email, pwdHash, 'RESTAURANT_OWNER', 'PENDING', hashed, tokenExpiry]
        );
      }

      if (!tenantId) {
        tenantId = randomUUID();
        const publicId = randomUUID().split('-')[0];
        let menuSlug = slugify(order.business_name, { lower: true, strict: true }) || 'menu';
        const slugCheck = await pool.query('SELECT id FROM clients WHERE menu_slug=$1', [menuSlug]);
        if (slugCheck.rows.length > 0) menuSlug = `${menuSlug}-${publicId}`;

        await pool.query(
          'INSERT INTO clients (id, public_id, business_name, menu_slug, status) VALUES ($1,$2,$3,$4,$5)',
          [tenantId, publicId, order.business_name, menuSlug, 'active']
        );
        await pool.query('UPDATE users SET tenant_id=$1, updated_at=NOW() WHERE id=$2', [tenantId, userId]);

        const expiresAt = new Date(); expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        await pool.query(
          'INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at) VALUES ($1,$2,$3,$4,$5,$6)',
          [randomUUID(), tenantId, order.plan_id.toUpperCase(), 'ACTIVE', new Date(), expiresAt]
        );
        await pool.query('INSERT INTO menus (id, tenant_id, name) VALUES ($1,$2,$3)', [randomUUID(), tenantId, 'Main Menu']);
        await pool.query(
          'INSERT INTO appearance_settings (id, tenant_id, template_id, restaurant_display_name) VALUES ($1,$2,$3,$4)',
          [randomUUID(), tenantId, 'royal-maharaja', order.business_name]
        );
      }

      provisionedTenantId = tenantId;
      await pool.query(
        `INSERT INTO activity_logs (tenant_id, action, description, metadata) VALUES ($1,$2,$3,$4)`,
        [tenantId, 'ORDER_PROVISIONED', `Order ${orderId} provisioned`, JSON.stringify({ orderId })]
      );
      await pool.query("UPDATE orders SET provisioning_status='COMPLETE', updated_at=NOW() WHERE id=$1", [orderId]);
      await pool.query('COMMIT');
    } catch (e) {
      await pool.query('ROLLBACK');
      await pool.query("UPDATE orders SET provisioning_status='FAILED', updated_at=NOW() WHERE id=$1", [orderId]);
      console.error('[Provisioning Error]', e);
      sendJson(response, 200, { success: true, orderId, status: 'PAID', provisioning_status: 'FAILED', message: 'Payment received but account setup failed. Contact support.' });
      return true;
    }

    const planMeta = PLANS[makePlanKey(order.plan_id)] || {};
    void sendActivationEmail({
      email: order.customer_email,
      ownerName: order.customer_name,
      businessName: order.business_name,
      plan: planMeta.label || order.plan_id.toUpperCase(),
      activationToken: activationTokenRaw,
    }).catch(err => {
      console.error('[activation email error]', err);
      pool.query(
        'INSERT INTO activity_logs (tenant_id, action, description, metadata) VALUES ($1,$2,$3,$4)',
        [provisionedTenantId, 'EMAIL_FAILED', 'Activation email failed', JSON.stringify({ orderId, error: err.message })]
      ).catch(() => {});
    });

    sendJson(response, 200, { success: true, orderId, status: 'PAID', provisioning_status: 'COMPLETE' });
    return true;
  }

  return false;
}
