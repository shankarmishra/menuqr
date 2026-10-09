import { randomUUID, randomBytes, createHash, createHmac } from 'node:crypto';
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

// ---------------------------------------------------------------------------
// Core Idempotent Payment Processing & Provisioning Engine
// ---------------------------------------------------------------------------
export async function processOrderPaymentAndProvision({
  orderId,
  gatewayUsed = 'cashfree',
  transactionId = null,
  rawResponse = null,
  isCashfreeRedirect = false,
  isWebhook = false,
  razorpayPaymentId = null,
  razorpayOrderId = null,
  razorpaySignature = null,
  mockSuccess = false,
}) {
  const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
  const order = orderRes.rows[0];
  if (!order) throw apiError(404, 'Order not found.');

  // ── IDEMPOTENCY GUARD: already fully provisioned ──────────────────────
  if (order.status === 'PAID' && order.provisioning_status === 'COMPLETE') {
    return {
      success: true,
      orderId,
      status: 'PAID',
      provisioning_status: 'COMPLETE',
      alreadyProvisioned: true,
      emailSent: Boolean(order.activation_email_sent && order.payment_receipt_email_sent),
    };
  }

  if (order.status === 'FAILED') {
    throw apiError(400, 'This order has been marked as failed. Please start a new order.');
  }

  // ── PAYMENT VERIFICATION ──────────────────────────────────────────────
  if (order.status !== 'PAID') {
    const razorpayConfigured = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
    const cashfreeConfigured = !!(process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY);

    let verifiedGateway = gatewayUsed || 'mock';
    let verifiedTxId = transactionId || `tx_${randomUUID().replace(/-/g, '').substring(0, 16)}`;

    if ((isCashfreeRedirect || isWebhook) && cashfreeConfigured) {
      const appId = process.env.CASHFREE_APP_ID;
      const secretKey = process.env.CASHFREE_SECRET_KEY;
      const isSandbox = (process.env.CASHFREE_ENV || 'TEST').toUpperCase() !== 'PROD';
      const baseUrl = isSandbox ? 'https://sandbox.cashfree.com/pg' : 'https://api.cashfree.com/pg';

      try {
        const cfRes = await fetch(`${baseUrl}/orders/${orderId}`, {
          method: 'GET',
          headers: {
            'x-client-id': appId,
            'x-client-secret': secretKey,
            'x-api-version': '2023-08-01',
          }
        });

        if (cfRes.ok) {
          const cfData = await cfRes.json();
          if (cfData.order_status !== 'PAID') {
            await pool.query("UPDATE orders SET status='FAILED', updated_at=NOW() WHERE id=$1", [orderId]);
            throw apiError(400, 'Payment not marked as PAID by Cashfree.');
          }
          verifiedGateway = 'cashfree';
          verifiedTxId = transactionId || cfData.cf_order_id || orderId;
        } else if (isWebhook) {
          verifiedGateway = 'cashfree_webhook';
          verifiedTxId = transactionId || orderId;
        } else {
          throw apiError(400, 'Failed to verify Cashfree order status with payment provider.');
        }
      } catch (err) {
        if (isWebhook) {
          verifiedGateway = 'cashfree_webhook';
          verifiedTxId = transactionId || orderId;
        } else {
          throw err;
        }
      }
    } else if (razorpayConfigured) {
      if (!razorpayPaymentId || !razorpaySignature) {
        throw apiError(400, 'Razorpay payment details missing.');
      }
      const body = `${razorpayOrderId}|${razorpayPaymentId}`;
      const expected = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body).digest('hex');
      if (expected !== razorpaySignature) {
        await pool.query("UPDATE orders SET status='FAILED', updated_at=NOW() WHERE id=$1", [orderId]);
        throw apiError(400, 'Payment signature verification failed.');
      }
      verifiedGateway = 'razorpay';
      verifiedTxId = razorpayPaymentId;
    } else if (process.env.NODE_ENV !== 'production' && mockSuccess) {
      verifiedGateway = 'mock';
    } else if (isCashfreeRedirect || isWebhook || mockSuccess) {
      verifiedGateway = 'cashfree_sandbox';
    } else {
      throw apiError(400, 'Payment verification data missing or invalid.');
    }

    await pool.query("UPDATE orders SET status='PAID', updated_at=NOW() WHERE id=$1", [orderId]);

    const paymentId = `pay_${randomUUID().replace(/-/g, '').substring(0, 16)}`;
    await pool.query(
      `INSERT INTO payments (id, order_id, gateway, transaction_id, amount, status, raw_response)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        paymentId,
        orderId,
        verifiedGateway,
        verifiedTxId,
        order.amount,
        'SUCCESS',
        typeof rawResponse === 'string' ? rawResponse : JSON.stringify(rawResponse || { isCashfreeRedirect, isWebhook, razorpayPaymentId, mockSuccess })
      ]
    );
  }

  // ── PROVISIONING (idempotent via provisioning_status) ─────────────────
  const provCheck = await pool.query(
    'SELECT provisioning_status FROM orders WHERE id=$1', [orderId]
  );
  if (provCheck.rows[0]?.provisioning_status === 'COMPLETE') {
    return {
      success: true,
      orderId,
      status: 'PAID',
      provisioning_status: 'COMPLETE',
      alreadyProvisioned: true,
      emailSent: Boolean(order.activation_email_sent && order.payment_receipt_email_sent),
    };
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
      const orderMeta = order.metadata || {};
      const pwdHash = orderMeta.password_hash || hashPassword(randomUUID().substring(0, 32));
      const { raw, hashed } = generateActivationToken();
      activationTokenRaw = raw;
      const tokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h

      await pool.query(
        `INSERT INTO users
           (id, email, password_hash, role, onboarding_state,
            activation_token_hash, activation_token_expires_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [userId, order.customer_email, pwdHash, 'RESTAURANT_OWNER', orderMeta.password_hash ? 'COMPLETED' : 'PENDING',
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
    console.error('[Provisioning Error]', e.message);
    return {
      success: true,
      orderId,
      status: 'PAID',
      provisioning_status: 'FAILED',
      message: 'Payment received but account setup encountered an error. Contact support with your order ID.',
    };
  }

  // ── 9. Send account and payment emails ───────────────────────────────
  const planMeta = PLANS[makePlanKey(order.plan_id)] || {};
  const clearPassword = (order.metadata || {}).clear_password;

  const subscriptionResult = await pool.query(
    'SELECT expires_at FROM subscriptions WHERE tenant_id = $1',
    [provisionedTenantId]
  );
  const expiresAt = subscriptionResult.rows[0]?.expires_at || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  const emailResults = await Promise.allSettled([
    sendActivationEmail({
      email: order.customer_email,
      ownerName: order.customer_name,
      businessName: order.business_name,
      plan: planMeta.label || order.plan_id.toUpperCase(),
      activationToken: activationTokenRaw,
      password: clearPassword,
    }),
    sendPaymentSuccessEmail({
      email: order.customer_email,
      businessName: order.business_name,
      plan: planMeta.label || order.plan_id.toUpperCase(),
      amount: order.amount,
      expiresAt,
    }),
  ]);

  const activationEmailSent = emailResults[0].status === 'fulfilled';
  const paymentReceiptEmailSent = emailResults[1].status === 'fulfilled';

  await pool.query(
    'UPDATE orders SET activation_email_sent = $1, payment_receipt_email_sent = $2 WHERE id = $3',
    [activationEmailSent, paymentReceiptEmailSent, orderId]
  );

  for (const [index, result] of emailResults.entries()) {
    if (result.status === 'rejected') {
      const emailType = index === 0 ? 'Activation' : 'Payment receipt';
      console.error(`[${emailType} email error]`, result.reason?.message || 'Email delivery failed.');
      await pool.query(
        `INSERT INTO activity_logs (tenant_id, action, description, metadata)
         VALUES ($1,$2,$3,$4)`,
        [provisionedTenantId, 'EMAIL_FAILED', `${emailType} email failed to send`, JSON.stringify({ orderId })]
      ).catch(() => {});
    }
  }

  return {
    success: true,
    orderId,
    status: 'PAID',
    provisioning_status: 'COMPLETE',
    emailSent: activationEmailSent && paymentReceiptEmailSent,
  };
}


export default async function purchaseRoutes(request, response, url) {
  if (!url.pathname.startsWith('/api/purchase') && !url.pathname.startsWith('/api/webhooks/cashfree')) {
    return false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // POST /api/webhooks/cashfree AND POST /api/purchase/webhook
  // Cashfree Payment Webhook Endpoint
  // ─────────────────────────────────────────────────────────────────────────
  if (url.pathname === '/api/webhooks/cashfree' || url.pathname === '/api/purchase/webhook') {
    if (request.method === 'GET' || request.method === 'HEAD') {
      sendJson(response, 200, { status: 'OK', message: 'Cashfree webhook endpoint is active.', service: 'menuqr-backend' });
      return true;
    }
  }

  if (request.method === 'POST' && (url.pathname === '/api/webhooks/cashfree' || url.pathname === '/api/purchase/webhook')) {
    const secretKey = (process.env.CASHFREE_SECRET_KEY || '').trim();
    const input = await readJson(request).catch(() => ({}));

    const data = input?.data || input;
    const orderId = data?.order?.order_id || data?.order_id || input?.order_id || input?.data?.orderId;
    const paymentStatus = (data?.payment?.payment_status || data?.order?.order_status || input?.type || input?.event || '').toUpperCase();

    const isSuccess = paymentStatus === 'SUCCESS' || paymentStatus === 'PAID' || paymentStatus === 'PAYMENT_SUCCESS_WEBHOOK' || input?.type === 'PAYMENT_SUCCESS_WEBHOOK';
    const isFailed = paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED' || paymentStatus === 'USER_DROPPED' || input?.type === 'PAYMENT_FAILED_WEBHOOK';

    const rawSig = request.headers['x-cashfree-signature'] || request.headers['x-webhook-signature'] || '';
    const timestamp = request.headers['x-webhook-timestamp'] || request.headers['x-cashfree-timestamp'] || '';
    if (secretKey && rawSig && timestamp) {
      const payloadString = `${timestamp}${JSON.stringify(input)}`;
      const expectedSig = createHmac('sha256', secretKey).update(payloadString).digest('base64');
      if (rawSig !== expectedSig && rawSig !== createHmac('sha256', secretKey).update(payloadString).digest('hex')) {
        console.warn(`[webhook] Invalid Cashfree signature for order ${orderId}`);
        throw apiError(401, 'Invalid Cashfree webhook signature.');
      }
    }

    if (!orderId) {
      sendJson(response, 200, { received: true, status: 'IGNORED', message: 'No order ID in payload.' });
      return true;
    }

    if (isFailed) {
      await pool.query("UPDATE orders SET status='FAILED', updated_at=NOW() WHERE id=$1 AND status='PENDING_PAYMENT'", [orderId]);
      sendJson(response, 200, { received: true, orderId, status: 'FAILED' });
      return true;
    }

    if (isSuccess || (process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY)) {
      try {
        const result = await processOrderPaymentAndProvision({
          orderId,
          gatewayUsed: 'cashfree_webhook',
          transactionId: data?.payment?.cf_payment_id || orderId,
          rawResponse: JSON.stringify(input),
          isWebhook: true,
        });
        sendJson(response, 200, { received: true, ...result });
        return true;
      } catch (err) {
        console.error(`[webhook] Cashfree processing error for ${orderId}:`, err.message);
        sendJson(response, err.status || 500, { error: err.message, orderId });
        return true;
      }
    }

    sendJson(response, 200, { received: true, orderId, status: 'ACKNOWLEDGED' });
    return true;
  }

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

    const userCheck = await pool.query(
      'SELECT id, tenant_id FROM users WHERE email = $1',
      [customerEmail.trim().toLowerCase()]
    );
    if (userCheck.rows.length > 0 && userCheck.rows[0].tenant_id) {
      throw apiError(409, 'An account already exists with this email.');
    }

    const existingOrder = await pool.query(
      `SELECT id FROM orders
        WHERE customer_email = $1 AND plan_id = $2
          AND status = 'PENDING_PAYMENT'
          AND created_at > NOW() - INTERVAL '30 minutes'
        ORDER BY created_at DESC LIMIT 1`,
      [customerEmail.trim().toLowerCase(), planKey]
    );
    if (existingOrder.rows.length > 0) {
      const eid = existingOrder.rows[0].id;
      await pool.query(
        `UPDATE orders SET customer_name=$1, business_name=$2, phone=$3, city=$4, address=$5,
          cuisine=$6, website=$7, instagram=$8, updated_at=NOW() WHERE id=$9`,
        [customerName, businessName, phone || null, city || null, address || null,
         cuisine || null, website || null, instagram || null, eid]
      );
      
      let paymentSessionId = null;
      const appId = process.env.CASHFREE_APP_ID;
      const secretKey = process.env.CASHFREE_SECRET_KEY;
      const isSandbox = (process.env.CASHFREE_ENV || 'TEST').toUpperCase() !== 'PROD';
      if (appId && secretKey) {
        const baseUrl = isSandbox ? 'https://sandbox.cashfree.com/pg' : 'https://api.cashfree.com/pg';
        try {
          const cfRes = await fetch(`${baseUrl}/orders/${eid}`, {
            headers: {
              'x-client-id': appId,
              'x-client-secret': secretKey,
              'x-api-version': '2023-08-01',
            }
          });
          if (cfRes.ok) {
            const cfData = await cfRes.json();
            paymentSessionId = cfData.payment_session_id;
          } else if (cfRes.status === 404) {
            const cfCreate = await fetch(`${baseUrl}/orders`, {
              method: 'POST',
              headers: {
                'x-client-id': appId,
                'x-client-secret': secretKey,
                'x-api-version': '2023-08-01',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                order_id: eid,
                order_amount: plan.price,
                order_currency: currency || 'INR',
                customer_details: {
                  customer_id: `cust_${randomUUID().substring(0, 8)}`,
                  customer_email: customerEmail.trim().toLowerCase(),
                  customer_phone: ((phone || '').replace(/[^0-9]/g, '').length >= 10) ? (phone || '').replace(/[^0-9]/g, '').substring(0, 15) : '9999999999',
                  customer_name: customerName
                },
                order_meta: {
                  return_url: `${process.env.FRONTEND_ORIGIN || 'https://menusqr.in'}/purchase/success?order_id={order_id}`
                }
              })
            });
            if (cfCreate.ok) {
              const cfData = await cfCreate.json();
              paymentSessionId = cfData.payment_session_id;
            }
          }
        } catch (e) {
          console.error('Cashfree existing order fetch error:', e.message);
        }
      }

      sendJson(response, 200, { orderId: eid, amount: plan.price, status: 'PENDING_PAYMENT', paymentSessionId, cashfreeMode: isSandbox ? 'sandbox' : 'production' });
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
              customer_phone: ((phone || '').replace(/[^0-9]/g, '').length >= 10) ? (phone || '').replace(/[^0-9]/g, '').substring(0, 15) : '9999999999',
              customer_name: customerName
            },
            order_meta: {
              return_url: `${process.env.FRONTEND_ORIGIN || 'https://menusqr.in'}/purchase/success?order_id={order_id}`
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
        console.error('Cashfree order creation network error:', err.message);
      }
    }

    let metadataJSON = null;
    if (input.password) {
      metadataJSON = JSON.stringify({ password_hash: hashPassword(input.password), clear_password: input.password });
    }

    await pool.query(
      `INSERT INTO orders
         (id, customer_name, customer_email, phone, business_name, city, address,
          cuisine, website, instagram, plan_id, amount, currency, status, provisioning_status, metadata)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
      [orderId, customerName, customerEmail.trim().toLowerCase(), phone || null,
       businessName, city || null, address || null, cuisine || null,
       website || null, instagram || null,
       planKey, plan.price, currency || 'INR',
       'PENDING_PAYMENT', 'PENDING', metadataJSON]
    );

    sendJson(response, 200, { orderId, amount: plan.price, status: 'PENDING_PAYMENT', paymentSessionId, cashfreeMode: isSandbox ? 'sandbox' : 'production' });
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
    const input = await readJson(request).catch(() => ({}));
    const result = await processOrderPaymentAndProvision({
      orderId,
      gatewayUsed: input.isCashfreeRedirect ? 'cashfree' : 'mock',
      transactionId: input.razorpayPaymentId || input.transactionId || orderId,
      rawResponse: JSON.stringify(input),
      isCashfreeRedirect: Boolean(input.isCashfreeRedirect),
      razorpayPaymentId: input.razorpayPaymentId,
      razorpayOrderId: input.razorpayOrderId,
      razorpaySignature: input.razorpaySignature,
      mockSuccess: Boolean(input.mockSuccess),
    });
    sendJson(response, 200, result);
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

    const sourceRes = await pool.query('SELECT * FROM orders WHERE id=$1', [sourceOrderId]);
    const sourceOrder = sourceRes.rows[0];
    if (!sourceOrder) throw apiError(404, 'Source order not found.');
    if (sourceOrder.status !== 'PAID') throw apiError(400, 'Source order is not paid.');

    const userRes = await pool.query(
      'SELECT id, tenant_id FROM users WHERE email=$1', [sourceOrder.customer_email]
    );
    if (!userRes.rows[0]?.tenant_id) throw apiError(400, 'No active account found for this order.');
    const tenantId = userRes.rows[0].tenant_id;

    const planKey = makePlanKey(planId || sourceOrder.plan_id);
    const plan = PLANS[planKey];
    const razorpayConfigured = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

    if (razorpayConfigured) {
      if (!razorpayPaymentId || !razorpaySignature) {
        throw apiError(400, 'Razorpay payment details missing.');
      }
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

    const renewOrderId = `order_${randomUUID().replace(/-/g, '').substring(0, 16)}`;
    await pool.query(
      `INSERT INTO orders
         (id, customer_name, customer_email, business_name, plan_id, amount, currency, status, provisioning_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [renewOrderId, sourceOrder.customer_name, sourceOrder.customer_email,
       sourceOrder.business_name, planKey, plan.price,
       sourceOrder.currency || 'INR', 'PAID', 'PENDING']
    );

    const paymentId = `pay_${randomUUID().replace(/-/g, '').substring(0, 16)}`;
    await pool.query(
      `INSERT INTO payments (id, order_id, gateway, transaction_id, amount, status)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [paymentId, renewOrderId,
       razorpayPaymentId ? 'razorpay' : 'mock',
       razorpayPaymentId || `mock_renew_${randomUUID()}`,
       plan.price, 'SUCCESS']
    );

    const existingSub = await pool.query(
      'SELECT * FROM subscriptions WHERE tenant_id=$1 ORDER BY created_at DESC LIMIT 1',
      [tenantId]
    );

    let newStart = new Date();
    let newExpiry = new Date();

    if (existingSub.rows[0]) {
      const currentExpiry = new Date(existingSub.rows[0].expires_at);
      newStart = currentExpiry > newStart ? currentExpiry : newStart;
      newExpiry = new Date(newStart);
      newExpiry.setFullYear(newExpiry.getFullYear() + 1);

      await pool.query(
        `UPDATE subscriptions SET plan_id=$1, status='ACTIVE', expires_at=$2, content_period_start=$3, content_period_id=$4, updated_at=NOW()
         WHERE tenant_id=$5`,
        [planKey.toUpperCase(), newExpiry, new Date(), renewOrderId, tenantId]
      );
    } else {
      newExpiry.setFullYear(newExpiry.getFullYear() + 1);
      const subId = randomUUID();
      await pool.query(
        `INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at, content_period_start, content_period_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [subId, tenantId, planKey.toUpperCase(), 'ACTIVE', newStart, newExpiry, new Date(), renewOrderId]
      );
    }

    await pool.query(
      "UPDATE orders SET provisioning_status='COMPLETE', updated_at=NOW() WHERE id=$1",
      [renewOrderId]
    );

    await pool.query(
      `INSERT INTO activity_logs (tenant_id, action, description, metadata)
       VALUES ($1,$2,$3,$4)`,
      [tenantId, 'SUBSCRIPTION_RENEWED',
       `Subscription renewed via order ${renewOrderId}`,
       JSON.stringify({ renewOrderId, plan: planKey, expiresAt: newExpiry })]
    );

    void sendRenewalEmail({
      email: sourceOrder.customer_email,
      businessName: sourceOrder.business_name,
      expiresAt: newExpiry,
    }).catch(err => console.error('[renewal email error]', err.message));

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

  return false;
}
