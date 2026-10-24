import { randomUUID, randomBytes, createHash, createHmac, timingSafeEqual } from 'node:crypto';
import slugify from 'slugify';
import { pool } from '../db.js';
import { apiError, sendJson, readJson, readJsonWithRaw } from '../utils.js';
import { hashPassword } from '../auth.js';
import { sendActivationEmail, sendPaymentSuccessEmail, sendRenewalEmail } from '../email.js';
import { invalidatePublicMenuCache } from './public.js';

// ---------------------------------------------------------------------------
// PLAN CONFIG — prices NEVER come from the frontend
// ---------------------------------------------------------------------------
export const PLANS = {
  basic:        { price: 1999, monthlyPrice: 559,  yearlyPrice: 1999, label: 'Basic',        features: ['1 QR Code', 'Unlimited menu views', 'Up to 50 items', 'Basic templates', 'Email support'] },
  intermediate: { price: 3199, monthlyPrice: 959,  yearlyPrice: 3199, label: 'Intermediate', features: ['1 QR Code', 'Unlimited menu views', 'Unlimited items', 'All templates', 'Priority support', 'Analytics dashboard'] },
  premium:      { price: 6799, monthlyPrice: 1119, yearlyPrice: 6799, label: 'Premium',      features: ['1 QR Code', 'Unlimited menu views', 'Unlimited items', 'All templates', '24/7 support', 'Analytics dashboard', 'Table ordering', 'Live orders panel', 'Reception workflow'] },
};

// ---------------------------------------------------------------------------
// ADD-ON CATALOGUE — server-authoritative annual services
// ---------------------------------------------------------------------------
export const ADDONS = {
  google_reviews: {
    id: 'google_reviews',
    name: 'Google Reviews Integration',
    description: "Connect your restaurant's Google review page to your MENUQR menu so customers can easily share their experience.",
    price: Number(process.env.ADDON_GOOGLE_REVIEWS_PRICE) || 499,
    currency: 'INR',
    billingPeriod: 'YEARLY',
    active: true,
  },
};

export function getAddon(addonId) {
  if (!addonId) return null;
  const key = String(addonId).toLowerCase().trim();
  const addon = ADDONS[key];
  if (!addon || !addon.active) return null;
  return addon;
}


// ---------------------------------------------------------------------------
// Helpers & Signature Verification
// ---------------------------------------------------------------------------
export function makePlanKey(raw) { return (raw || '').toLowerCase().trim(); }

function generateActivationToken() {
  const raw = randomBytes(32).toString('hex');
  const hashed = createHash('sha256').update(raw).digest('hex');
  return { raw, hashed };
}

export function safeCompareSignatures(providedSig, expectedSig) {
  if (typeof providedSig !== 'string' || typeof expectedSig !== 'string') return false;
  const bufA = Buffer.from(providedSig);
  const bufB = Buffer.from(expectedSig);
  if (bufA.length !== bufB.length || bufA.length === 0) return false;
  return timingSafeEqual(bufA, bufB);
}

export function verifyCashfreeWebhookSignature({ rawText, timestamp, signature, secretKey }) {
  if (!secretKey || !timestamp || !signature || rawText === undefined || rawText === null) {
    return false;
  }
  const payloadToSign = `${timestamp}${rawText}`;
  const expectedBase64 = createHmac('sha256', secretKey).update(payloadToSign).digest('base64');
  const expectedHex = createHmac('sha256', secretKey).update(payloadToSign).digest('hex');

  return safeCompareSignatures(signature, expectedBase64) || safeCompareSignatures(signature, expectedHex);
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
  webhookVerified = false,
  razorpayPaymentId = null,
  razorpayOrderId = null,
  razorpaySignature = null,
  mockSuccess = false,
  payloadAmount = null,
  payloadCurrency = null,
  payloadEmail = null,
}) {
  const workerLockToken = randomUUID();

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

  // ── AMOUNT, CURRENCY & CUSTOMER VERIFICATION ───────────────────────────
  const expectedAmount = Number(order.amount);
  const checkAmount = payloadAmount !== null && payloadAmount !== undefined ? Number(payloadAmount) : null;
  if (checkAmount !== null) {
    if (!Number.isFinite(checkAmount) || checkAmount <= 0) {
      throw apiError(400, 'Invalid payment amount.');
    }
    const expectedPaise = Math.round(expectedAmount * 100);
    const checkPaise = Math.round(checkAmount * 100);
    if (checkPaise !== expectedPaise) {
      throw apiError(400, `Payment amount mismatch: received ${checkAmount}, expected ${expectedAmount}.`);
    }
  }

  const expectedCurrency = (order.currency || 'INR').toUpperCase();
  const checkCurrency = payloadCurrency ? String(payloadCurrency).toUpperCase() : null;
  if (checkCurrency && checkCurrency !== expectedCurrency) {
    throw apiError(400, `Payment currency mismatch: received ${checkCurrency}, expected ${expectedCurrency}.`);
  }

  const checkEmail = payloadEmail ? String(payloadEmail).trim().toLowerCase() : null;
  if (checkEmail && checkEmail !== order.customer_email.trim().toLowerCase()) {
    throw apiError(400, `Payment customer email mismatch.`);
  }

  // ── CONCURRENCY LOCK & STALE RECOVERY WITH FENCING TOKEN ─────────────────
  if (order.status !== 'PAID' || order.provisioning_status !== 'COMPLETE') {
    const lockRes = await pool.query(
      `UPDATE orders
       SET provisioning_status='PROCESSING',
           updated_at=NOW(),
           metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('lock_token', $2::text)
       WHERE id=$1
         AND provisioning_status != 'COMPLETE'
         AND (provisioning_status != 'PROCESSING' OR updated_at < NOW() - INTERVAL '5 minutes')
       RETURNING status, provisioning_status`,
      [orderId, workerLockToken]
    );
    if (lockRes.rowCount === 0) {
      // Another worker holds the lock or the order was already completed.
      // Poll briefly so that Worker B only returns alreadyProvisioned: true when provisioning_status is COMPLETE.
      let current = null;
      for (let attempt = 0; attempt < 30; attempt++) {
        const reCheck = await pool.query(
          'SELECT status, provisioning_status, activation_email_sent, payment_receipt_email_sent FROM orders WHERE id = $1',
          [orderId]
        );
        current = reCheck.rows[0];
        if (current && current.provisioning_status === 'COMPLETE') {
          return {
            success: true,
            orderId,
            status: current.status || 'PAID',
            provisioning_status: 'COMPLETE',
            alreadyProvisioned: true,
            emailSent: Boolean(current?.activation_email_sent && current?.payment_receipt_email_sent),
          };
        }
        if (current && current.provisioning_status === 'FAILED') {
          return {
            success: false,
            orderId,
            status: current.status || 'PAID',
            provisioning_status: 'FAILED',
            alreadyProvisioned: false,
            message: 'Concurrent provisioning worker encountered an error.',
          };
        }
        // Still PROCESSING: wait 50ms before polling again
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      return {
        success: false,
        orderId,
        status: current?.status || 'PENDING_PAYMENT',
        provisioning_status: current?.provisioning_status || 'PROCESSING',
        alreadyProvisioned: false,
        message: 'Timed out waiting for concurrent provisioning lock to complete.',
      };
    }
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
          if (cfData.order_status === 'ACTIVE') {
            throw apiError(400, 'Payment is pending or incomplete with Cashfree. Order status: ACTIVE.');
          }
          if (cfData.order_status !== 'PAID') {
            await pool.query("UPDATE orders SET status='FAILED', updated_at=NOW() WHERE id=$1 AND status != 'PAID'", [orderId]);
            throw apiError(400, 'Payment not marked as PAID by Cashfree.');
          }
          if (cfData.order_amount !== undefined && cfData.order_amount !== null) {
            const cfAmount = Number(cfData.order_amount);
            if (!Number.isFinite(cfAmount) || cfAmount <= 0) {
              throw apiError(400, 'Invalid payment amount from provider.');
            }
            const expectedPaise = Math.round(expectedAmount * 100);
            const cfPaise = Math.round(cfAmount * 100);
            if (cfPaise !== expectedPaise) {
              throw apiError(400, `Payment amount mismatch: received ${cfData.order_amount}, expected ${expectedAmount}.`);
            }
          }
          if (cfData.order_currency && cfData.order_currency.toUpperCase() !== expectedCurrency) {
            throw apiError(400, `Payment currency mismatch: received ${cfData.order_currency}, expected ${expectedCurrency}.`);
          }
          verifiedGateway = 'cashfree';
          verifiedTxId = transactionId || cfData.cf_order_id || orderId;
        } else if (isWebhook && webhookVerified) {
          verifiedGateway = 'cashfree_webhook';
          verifiedTxId = transactionId || orderId;
        } else {
          throw apiError(400, 'Failed to verify Cashfree order status with payment provider.');
        }
      } catch (err) {
        if (err.status) throw err;
        if (isWebhook && webhookVerified) {
          verifiedGateway = 'cashfree_webhook';
          verifiedTxId = transactionId || orderId;
        } else {
          throw apiError(400, `Payment verification failed: ${err.message}`);
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
        await pool.query("UPDATE orders SET status='FAILED', updated_at=NOW() WHERE id=$1 AND status != 'PAID'", [orderId]);
        throw apiError(400, 'Payment signature verification failed.');
      }
      verifiedGateway = 'razorpay';
      verifiedTxId = razorpayPaymentId;
    } else if (process.env.NODE_ENV !== 'production' && mockSuccess) {
      verifiedGateway = 'mock';
    } else if (!cashfreeConfigured && !razorpayConfigured && (isCashfreeRedirect || (isWebhook && webhookVerified) || mockSuccess)) {
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
  const provCheck = await pool.query('SELECT provisioning_status, activation_email_sent, payment_receipt_email_sent FROM orders WHERE id=$1', [orderId]);
  if (provCheck.rows[0]?.provisioning_status === 'COMPLETE') {
    return {
      success: true,
      orderId,
      status: 'PAID',
      provisioning_status: 'COMPLETE',
      alreadyProvisioned: true,
      emailSent: Boolean(provCheck.rows[0].activation_email_sent && provCheck.rows[0].payment_receipt_email_sent),
    };
  }

  let activationTokenRaw;
  let provisionedTenantId;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ── FENCING CHECK: Verify lock ownership under row lock FOR UPDATE ───
    const lockCheck = await client.query(
      "SELECT provisioning_status, metadata->>'lock_token' as lock_token FROM orders WHERE id=$1 FOR UPDATE",
      [orderId]
    );
    const activeOrder = lockCheck.rows[0];

    if (activeOrder?.provisioning_status === 'COMPLETE') {
      await client.query('ROLLBACK').catch(() => {});
      return {
        success: true,
        orderId,
        status: 'PAID',
        provisioning_status: 'COMPLETE',
        alreadyProvisioned: true,
      };
    }

    const activeLockToken = activeOrder?.lock_token;
    if (activeLockToken && activeLockToken !== workerLockToken) {
      await client.query('ROLLBACK').catch(() => {});
      console.warn(`[Provisioning Lock Lost] Worker ${workerLockToken} lost lock to worker ${activeLockToken} for order ${orderId}`);
      return {
        success: true,
        orderId,
        status: 'PAID',
        provisioning_status: 'PROCESSING',
        lockLost: true,
      };
    }

    // ── 1. Create or find user ───────────────────────────────────────────
    let userId;
    let tenantId;
    const userCheck = await client.query(
      'SELECT id, tenant_id FROM users WHERE email=$1 FOR UPDATE',
      [order.customer_email]
    );

    if (userCheck.rows.length > 0) {
      userId = userCheck.rows[0].id;
      tenantId = userCheck.rows[0].tenant_id || null;
    } else {
      userId = randomUUID();
      const orderMeta = order.metadata || {};
      const pwdHash = orderMeta.password_hash || await hashPassword(randomUUID().substring(0, 32));
      const { raw, hashed } = generateActivationToken();
      activationTokenRaw = raw;
      const tokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h

      await client.query(
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
      const slugCheck = await client.query(
        'SELECT id FROM clients WHERE menu_slug=$1', [menuSlug]
      );
      if (slugCheck.rows.length > 0) menuSlug = `${menuSlug}-${publicId}`;

      // Generate unique 5-digit numeric reference code with collision retries
      let refCode;
      for (let attempt = 0; attempt < 10; attempt++) {
        const candidate = String(Math.floor(10000 + Math.random() * 90000));
        const check = await client.query('SELECT id FROM clients WHERE reference_code = $1', [candidate]);
        if (check.rows.length === 0) {
          refCode = candidate;
          break;
        }
      }
      if (!refCode) refCode = String(Math.floor(10000 + Math.random() * 90000));

      await client.query(
        `INSERT INTO clients
           (id, public_id, business_name, menu_slug, category, business_type, category_other,
            state, outlet_count, phone, city, address, reference_code, email_verified, phone_verified, status,
            instagram, facebook, website)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
        [tenantId, publicId, order.business_name, menuSlug,
         order.cuisine || order.business_type || 'restaurant', order.business_type || 'restaurant',
         order.category_other || null, order.state || null, order.outlet_count || 1,
         order.phone || null, order.city || null, order.address || null,
         refCode, Boolean(order.email_verified), Boolean(order.phone_verified), 'active',
         order.instagram || null, order.facebook || null, order.website || null]
      );

      await client.query(
        'UPDATE users SET tenant_id=$1, phone=$2, email_verified=$3, phone_verified=$4, updated_at=NOW() WHERE id=$5',
        [tenantId, order.phone || null, Boolean(order.email_verified), Boolean(order.phone_verified), userId]
      );

      // Ensure permanent QR Code & Tenant QR Identity exist
      const qrCodeId = randomUUID();
      const qrId = `qr_${randomBytes(6).toString('hex')}`;
      await client.query(
        `INSERT INTO qr_codes (id, tenant_id, public_id, qr_id, destination_type, is_active)
         VALUES ($1, $2, $3, $4, 'menu', true) ON CONFLICT DO NOTHING`,
        [qrCodeId, tenantId, publicId, qrId]
      );
      await client.query(
        `INSERT INTO tenant_qr_identity (tenant_id, qr_code_id)
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [tenantId, qrCodeId]
      );

      // Redeem coupon if attached
      if (order.coupon_code) {
        const { redeemCouponForOrder } = await import('../coupons.js');
        await redeemCouponForOrder({ orderId, couponCode: order.coupon_code, client });
      }

      // ── 3. Create subscription ──────────────────────────────────────────
      const orderMeta = order.metadata || {};
      const isMonthly = orderMeta.billing_cycle === 'monthly';
      const expiresAt = new Date();
      if (isMonthly) {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }
      const subscriptionId = randomUUID();
      await client.query(
        `INSERT INTO subscriptions
           (id, tenant_id, plan_id, status, started_at, expires_at)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [subscriptionId, tenantId,
         order.plan_id.toUpperCase(), 'ACTIVE', new Date(), expiresAt]
      );

      // ── 4. Create menu skeleton ─────────────────────────────────────────
      const menuId = randomUUID();
      await client.query(
        'INSERT INTO menus (id, tenant_id, name) VALUES ($1,$2,$3)',
        [menuId, tenantId, 'Main Menu']
      );

      // ── 5. Create appearance defaults ───────────────────────────────────
      const appSettingId = randomUUID();
      await client.query(
        `INSERT INTO appearance_settings
           (id, tenant_id, template_id, restaurant_display_name)
         VALUES ($1,$2,$3,$4)`,
        [appSettingId, tenantId, 'royal-maharaja', order.business_name]
      );

      // ── 6. Set onboarding state ─────────────────────────────────────────
      await client.query(
        "UPDATE users SET onboarding_state='PENDING', updated_at=NOW() WHERE id=$1",
        [userId]
      );
    }

    provisionedTenantId = tenantId;

    // ── 6b. Provision Add-on Entitlements (e.g. Google Reviews) ─────────
    const rawSelectedAddons = order.selected_addons;
    let selectedAddonsList = [];
    if (Array.isArray(rawSelectedAddons)) {
      selectedAddonsList = rawSelectedAddons;
    } else if (typeof rawSelectedAddons === 'string') {
      try { selectedAddonsList = JSON.parse(rawSelectedAddons); } catch (_) {}
    }

    for (const addonItem of selectedAddonsList) {
      const addonKey = typeof addonItem === 'string' ? addonItem : addonItem?.id;
      if (addonKey === 'google_reviews') {
        const addonExpiresAt = new Date();
        addonExpiresAt.setFullYear(addonExpiresAt.getFullYear() + 1);
        const entitlementId = `ent_${randomUUID().replace(/-/g, '').substring(0, 16)}`;
        await client.query(
          `INSERT INTO tenant_addon_entitlements
             (id, tenant_id, addon_id, status, started_at, expires_at, order_id, updated_at)
           VALUES ($1, $2, 'google_reviews', 'ACTIVE', NOW(), $3, $4, NOW())
           ON CONFLICT (tenant_id, addon_id)
           DO UPDATE SET
             status = 'ACTIVE',
             expires_at = CASE
               WHEN tenant_addon_entitlements.expires_at > NOW()
                 THEN tenant_addon_entitlements.expires_at + INTERVAL '1 year'
               ELSE EXCLUDED.expires_at
             END,
             order_id = EXCLUDED.order_id,
             updated_at = NOW()`,
          [entitlementId, tenantId, addonExpiresAt, orderId]
        );
      }
    }

    // ── 7. Log provisioning ─────────────────────────────────────────────
    await client.query(
      `INSERT INTO activity_logs (tenant_id, user_id, action, description, metadata)
       VALUES ($1,$2,$3,$4,$5)`,
      [tenantId, userId, 'ORDER_PROVISIONED',
       `Order ${orderId} provisioned successfully`,
       JSON.stringify({ orderId, plan: order.plan_id, amount: order.amount, selectedAddons: selectedAddonsList })]
    );

    // ── 8. Mark order complete with lock ownership fencing ──────────────
    const completeRes = await client.query(
      `UPDATE orders
       SET provisioning_status='COMPLETE', updated_at=NOW()
       WHERE id=$1
         AND (metadata->>'lock_token' = $2 OR metadata->>'lock_token' IS NULL)`,
      [orderId, workerLockToken]
    );

    if (completeRes.rowCount === 0) {
      await client.query('ROLLBACK').catch(() => {});
      console.warn(`[Provisioning Lock Lost] Lock token check failed at completion for order ${orderId}`);
      return {
        success: true,
        orderId,
        status: 'PAID',
        provisioning_status: 'PROCESSING',
        lockLost: true,
      };
    }

    await client.query('COMMIT');
    invalidatePublicMenuCache(tenantId);
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    await pool.query(
      `UPDATE orders
       SET provisioning_status='FAILED', updated_at=NOW()
       WHERE id=$1
         AND (metadata->>'lock_token' = $2 OR metadata->>'lock_token' IS NULL)
         AND provisioning_status != 'COMPLETE'`,
      [orderId, workerLockToken]
    );
    console.error('[Provisioning Error]', e.message);
    return {
      success: true,
      orderId,
      status: 'PAID',
      provisioning_status: 'FAILED',
      message: 'Payment received but account setup encountered an error. Contact support with your order ID.',
    };
  } finally {
    client.release();
  }


  // ── 9. Send account and payment emails ───────────────────────────────
  const planMeta = PLANS[makePlanKey(order.plan_id)] || {};

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
    if (!secretKey) {
      console.error('[webhook] Server misconfiguration: CASHFREE_SECRET_KEY is missing.');
      throw apiError(500, 'Webhook processing unavailable: CASHFREE_SECRET_KEY is missing.');
    }

    const rawSig = request.headers['x-cashfree-signature'] || request.headers['x-webhook-signature'] || '';
    const timestamp = request.headers['x-webhook-timestamp'] || request.headers['x-cashfree-timestamp'] || '';

    if (!rawSig || !timestamp) {
      console.warn('[webhook] Rejection: Missing Cashfree signature or timestamp header.');
      throw apiError(401, 'Missing Cashfree webhook signature or timestamp header.');
    }

    const parsedTimestamp = Number(timestamp);
    const now = Date.now();
    const timestampMs = parsedTimestamp > 1e11 ? parsedTimestamp : parsedTimestamp * 1000;
    const maxToleranceMs = 5 * 60 * 1000;

    if (!Number.isFinite(timestampMs) || Math.abs(now - timestampMs) > maxToleranceMs) {
      console.warn(`[webhook] Rejection: Webhook timestamp expired or stale (${timestamp}).`);
      throw apiError(401, 'Webhook timestamp outside allowed 5-minute freshness window.');
    }

    const { parsed: input, rawText } = await readJsonWithRaw(request);

    const isValidSignature = verifyCashfreeWebhookSignature({
      rawText,
      timestamp,
      signature: rawSig,
      secretKey,
    });

    if (!isValidSignature) {
      console.warn('[webhook] Rejection: Invalid Cashfree webhook signature.');
      throw apiError(401, 'Invalid Cashfree webhook signature.');
    }

    const data = input?.data || input;
    const orderId = data?.order?.order_id || data?.order_id || input?.order_id || input?.data?.orderId;
    const paymentStatus = (data?.payment?.payment_status || data?.order?.order_status || input?.type || input?.event || '').toUpperCase();

    const isSuccess = paymentStatus === 'SUCCESS' || paymentStatus === 'PAID' || paymentStatus === 'PAYMENT_SUCCESS_WEBHOOK' || input?.type === 'PAYMENT_SUCCESS_WEBHOOK';
    const isFailed = paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED' || paymentStatus === 'USER_DROPPED' || input?.type === 'PAYMENT_FAILED_WEBHOOK';

    if (!orderId) {
      sendJson(response, 200, { received: true, status: 'IGNORED', message: 'No order ID in payload.' });
      return true;
    }

    if (isFailed) {
      await pool.query("UPDATE orders SET status='FAILED', updated_at=NOW() WHERE id=$1 AND status='PENDING_PAYMENT'", [orderId]);
      sendJson(response, 200, { received: true, orderId, status: 'FAILED' });
      return true;
    }

    if (isSuccess) {
      try {
        const payloadAmount = data?.payment?.payment_amount ?? data?.order?.order_amount ?? null;
        const payloadCurrency = data?.payment?.payment_currency ?? data?.order?.order_currency ?? null;
        const payloadEmail = data?.customer_details?.customer_email ?? data?.customer?.customer_email ?? null;

        const hasTransactionDetails = Boolean(
          (data?.payment?.payment_amount !== undefined && data?.payment?.payment_amount !== null) ||
          data?.payment?.payment_status
        );

        if (!hasTransactionDetails) {
          const cashfreeConfigured = !!(process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY);
          if (!cashfreeConfigured) {
            console.warn(`[webhook] Rejection for order ${orderId}: Missing Cashfree transaction payment details in payload.`);
            throw apiError(400, 'Missing Cashfree transaction payment details in webhook payload.');
          }
        }

        const result = await processOrderPaymentAndProvision({
          orderId,
          gatewayUsed: 'cashfree_webhook',
          transactionId: data?.payment?.cf_payment_id || orderId,
          rawResponse: rawText,
          isWebhook: true,
          webhookVerified: true,
          payloadAmount,
          payloadCurrency,
          payloadEmail,
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
  // POST /api/purchase/coupons/validate — Validate coupon for a plan
  // ─────────────────────────────────────────────────────────────────────────
  if (request.method === 'POST' && url.pathname === '/api/purchase/coupons/validate') {
    const input = await readJson(request);
    const { code, planId } = input || {};
    if (!code || !planId) throw apiError(400, 'Coupon code and plan ID are required.');

    const planKey = makePlanKey(planId);
    if (planKey === 'basic') {
      throw apiError(400, 'Basic plan is not eligible for coupon discounts.');
    }
    const plan = PLANS[planKey];
    if (!plan) throw apiError(400, 'Invalid plan selected.');

    const normCode = String(code).trim().toUpperCase();
    const cpnRes = await pool.query(
      `SELECT * FROM coupons WHERE code = $1`,
      [normCode]
    );
    const coupon = cpnRes.rows[0];
    if (!coupon) throw apiError(404, 'Coupon code does not exist.');
    if (coupon.plan_id !== planKey.toUpperCase()) {
      throw apiError(400, `Coupon '${normCode}' is only valid for the ${coupon.plan_id} plan.`);
    }
    if (coupon.status === 'DISABLED') throw apiError(400, 'This coupon code has been disabled.');
    if (coupon.status === 'REDEEMED') throw apiError(400, 'This single-use coupon has already been redeemed.');
    if (coupon.status === 'EXPIRED' || (coupon.expires_at && new Date(coupon.expires_at) < new Date())) {
      throw apiError(400, 'This coupon code has expired.');
    }

    const isMonthly = String(input.billingCycle || '').toLowerCase() === 'monthly';
    const basePrice = isMonthly ? plan.monthlyPrice : (plan.yearlyPrice || plan.price);
    const { calculateDiscount } = await import('../coupons.js');
    const discountCalc = calculateDiscount(basePrice, coupon.discount_pct);

    sendJson(response, 200, {
      valid: true,
      code: coupon.code,
      planId: planKey.toUpperCase(),
      discountPct: coupon.discount_pct,
      ...discountCalc,
    });
    return true;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/purchase/catalogue & /api/purchase/addons — Authoritative catalogue
  // ─────────────────────────────────────────────────────────────────────────
  if (request.method === 'GET' && (url.pathname === '/api/purchase/catalogue' || url.pathname === '/api/purchase/addons')) {
    sendJson(response, 200, {
      plans: PLANS,
      addons: Object.values(ADDONS),
    });
    return true;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // POST /api/purchase/orders — Create order with coupon & business metadata
  // ─────────────────────────────────────────────────────────────────────────
  if (request.method === 'POST' && url.pathname === '/api/purchase/orders') {
    const input = await readJson(request);
    const {
      customerName, customerEmail, phone,
      businessName, city, address, state, cuisine, businessType, categoryOther, outletCount,
      website, instagram, facebook,
      planId, currency, couponCode, emailVerified, phoneVerified, emailChallengeId, emailVerificationToken,
      selectedAddons,
    } = input;

    if (!customerName || !customerEmail || !businessName || !planId) {
      throw apiError(400, 'Missing required fields.');
    }

    const planKey = makePlanKey(planId);
    const plan = PLANS[planKey];
    if (!plan) throw apiError(400, 'Invalid plan selected.');

    // ── Authoritative Add-on Validation & Pricing ───────────────────────────
    let addonAmount = 0;
    const validatedAddons = [];
    if (selectedAddons !== undefined && selectedAddons !== null) {
      if (!Array.isArray(selectedAddons)) {
        throw apiError(400, 'selectedAddons must be an array.');
      }
      const rawKeys = selectedAddons.map(a => String(typeof a === 'object' && a !== null ? (a.id || '') : a).toLowerCase().trim());
      const uniqueAddonKeys = Array.from(new Set(rawKeys.filter(Boolean)));
      for (const key of uniqueAddonKeys) {
        const addon = getAddon(key);
        if (!addon) {
          throw apiError(400, `Add-on '${key}' is invalid or currently unavailable.`);
        }
        addonAmount += addon.price;
        validatedAddons.push({
          id: addon.id,
          name: addon.name,
          price: addon.price,
          currency: addon.currency,
          billingPeriod: addon.billingPeriod,
        });
      }
    }

    const normalizedEmail = customerEmail.trim().toLowerCase();
    const { consumeEmailVerificationGrant } = await import('../clientAuth.js');
    let isServerEmailVerified = false;

    if (emailVerificationToken && typeof emailVerificationToken === 'string') {
      await consumeEmailVerificationGrant({
        token: emailVerificationToken,
        email: normalizedEmail,
        purpose: 'checkout',
      });
      isServerEmailVerified = true;
    }

    const { isEmailServiceActive } = await import('../email.js');
    const emailActive = isEmailServiceActive();
    if (emailActive && !isServerEmailVerified) {
      throw apiError(400, 'Email address must be verified via OTP before completing checkout.');
    }
    if (!emailActive) {
      isServerEmailVerified = true;
    }

    // Account Uniqueness Guard
    const userCheck = await pool.query(
      'SELECT id, tenant_id FROM users WHERE LOWER(email) = $1',
      [customerEmail.trim().toLowerCase()]
    );
    if (userCheck.rows.length > 0 && userCheck.rows[0].tenant_id) {
      throw apiError(409, 'An account already exists with this email address. Please sign in.');
    }

    if (phone) {
      const { normalizePhone } = await import('../sms.js');
      const normPhone = normalizePhone(phone);
      if (normPhone) {
        const phoneUserCheck = await pool.query('SELECT id FROM users WHERE phone = $1 AND tenant_id IS NOT NULL', [normPhone]);
        if (phoneUserCheck.rows.length > 0) {
          throw apiError(409, 'An account already exists with this phone number. Please sign in.');
        }
      }
    }

    const existingOrderCheck = await pool.query(
      'SELECT id FROM orders WHERE LOWER(customer_email) = $1 AND LOWER(business_name) = $2 AND status = $3 LIMIT 1',
      [customerEmail.trim().toLowerCase(), businessName.trim().toLowerCase(), 'PENDING_PAYMENT']
    );
    let orderId = existingOrderCheck.rows[0]?.id;
    const isReuse = Boolean(orderId);

    if (!orderId) {
      orderId = `order_${randomUUID().replace(/-/g, '').substring(0, 16)}`;
    }

    const isMonthly = String(input.billingCycle || '').toLowerCase() === 'monthly';
    const planBasePrice = isMonthly ? plan.monthlyPrice : (plan.yearlyPrice || plan.price);

    // Authoritative total calculations: coupon applies strictly to base plan; add-on added cleanly
    let finalAmount = planBasePrice + addonAmount;
    let originalAmount = planBasePrice + addonAmount;
    let discountPct = null;
    let discountAmount = null;
    let validCouponCode = null;

    if (couponCode && String(couponCode).trim()) {
      if (planKey === 'basic') {
        throw apiError(400, 'Basic plan is not eligible for coupon discounts.');
      }
      const { validateAndReserveCoupon, calculateDiscount } = await import('../coupons.js');
      const reservedCoupon = await validateAndReserveCoupon({
        code: couponCode,
        planId: planKey.toUpperCase(),
        orderId,
      });
      const calc = calculateDiscount(planBasePrice, reservedCoupon.discount_pct);
      finalAmount = (planBasePrice - calc.discountAmount) + addonAmount;
      originalAmount = planBasePrice + addonAmount;
      discountPct = calc.discountPct;
      discountAmount = calc.discountAmount;
      validCouponCode = reservedCoupon.code;
    }

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
            order_amount: finalAmount,
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
          const errText = await cfRes.text();
          console.error('[cashfree] Cashfree order creation response error:', errText);
          if (process.env.NODE_ENV !== 'test') {
            throw apiError(502, `Payment gateway failed to initialize session: ${errText}`);
          }
        }
      } catch (err) {
        console.error('[cashfree] Cashfree order creation network error:', err.message);
        if (process.env.NODE_ENV !== 'test') {
          throw apiError(502, `Payment gateway communication error: ${err.message}`);
        }
      }
    } else {
      console.warn('[cashfree] CASHFREE_APP_ID or CASHFREE_SECRET_KEY is missing');
      if (process.env.NODE_ENV !== 'test') {
        throw apiError(503, 'Payment gateway is not configured on the server. Please contact support.');
      }
    }

    const metadataObj = {
      billing_cycle: isMonthly ? 'monthly' : 'yearly',
    };
    if (input.password) {
      const { hashPassword } = await import('../auth.js');
      const pwdHash = await hashPassword(input.password);
      metadataObj.password_hash = pwdHash;
    }
    const metadataJSON = JSON.stringify(metadataObj);

    if (isReuse) {
      await pool.query(
        `UPDATE orders
         SET customer_name = $1, phone = $2, city = $3, address = $4, state = $5,
             cuisine = $6, business_type = $7, category_other = $8, outlet_count = $9,
             website = $10, instagram = $11, facebook = $12, plan_id = $13, amount = $14, original_amount = $15,
             discount_pct = $16, discount_amount = $17, coupon_code = $18, email_verified = $19,
             phone_verified = $20, currency = $21, metadata = COALESCE($22, metadata),
             selected_addons = $23, addon_amount = $24, updated_at = CURRENT_TIMESTAMP
         WHERE id = $25`,
        [customerName, phone || null, city || null, address || null, state || null,
         cuisine || businessType || null, businessType || 'restaurant', categoryOther || null,
         Number(outletCount) || 1, website || null, instagram || null, facebook || null,
         planKey, finalAmount, originalAmount, discountPct, discountAmount, validCouponCode,
         isServerEmailVerified, false, currency || 'INR', metadataJSON,
         JSON.stringify(validatedAddons), addonAmount, orderId]
      );
    } else {
      await pool.query(
        `INSERT INTO orders
           (id, customer_name, customer_email, phone, business_name, city, address, state,
            cuisine, business_type, category_other, outlet_count, website, instagram, facebook,
            plan_id, amount, original_amount, discount_pct, discount_amount, coupon_code,
            email_verified, phone_verified, currency, status, provisioning_status, metadata,
            selected_addons, addon_amount)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29)`,
        [orderId, customerName, customerEmail.trim().toLowerCase(), phone || null,
         businessName, city || null, address || null, state || null,
         cuisine || businessType || null, businessType || 'restaurant', categoryOther || null,
         Number(outletCount) || 1, website || null, instagram || null, facebook || null,
         planKey, finalAmount, originalAmount, discountPct, discountAmount, validCouponCode,
         isServerEmailVerified, false, currency || 'INR',
         'PENDING_PAYMENT', 'PENDING', metadataJSON,
         JSON.stringify(validatedAddons), addonAmount]
      );
    }

    sendJson(response, 200, {
      orderId,
      amount: finalAmount,
      originalAmount,
      discountAmount: discountAmount || 0,
      discountPct: discountPct || 0,
      addonAmount,
      selectedAddons: validatedAddons,
      couponCode: validCouponCode,
      status: 'PENDING_PAYMENT',
      paymentSessionId,
      cashfreeMode: isSandbox ? 'sandbox' : 'production'
    });
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
    const { metadata, lock_token, provisioning_error, ...safeOrder } = order;
    sendJson(response, 200, {
      ...safeOrder,
      planLabel: planMeta.label,
      planFeatures: planMeta.features,
      selectedAddons: order.selected_addons || [],
      addonAmount: Number(order.addon_amount || 0),
      billingCycle: order.metadata?.billing_cycle || 'yearly',
    });
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
    const { planId, cashfreeOrderId, transactionId, razorpayPaymentId, razorpayOrderId, razorpaySignature, mockSuccess, selectedAddons } = input;

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
    if (!plan) throw apiError(400, 'Invalid plan selected.');

    // Authoritative add-on validation for renewal
    let addonAmount = 0;
    const validatedAddons = [];
    if (selectedAddons !== undefined && selectedAddons !== null) {
      if (!Array.isArray(selectedAddons)) {
        throw apiError(400, 'selectedAddons must be an array.');
      }
      const rawKeys = selectedAddons.map(a => String(typeof a === 'object' && a !== null ? (a.id || '') : a).toLowerCase().trim());
      const uniqueAddonKeys = Array.from(new Set(rawKeys.filter(Boolean)));
      for (const key of uniqueAddonKeys) {
        const addon = getAddon(key);
        if (!addon) {
          throw apiError(400, `Add-on '${key}' is invalid or currently unavailable.`);
        }
        addonAmount += addon.price;
        validatedAddons.push({
          id: addon.id,
          name: addon.name,
          price: addon.price,
          currency: addon.currency,
          billingPeriod: addon.billingPeriod,
        });
      }
    }
    const renewalTotal = plan.price + addonAmount;

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const isSandbox = (process.env.CASHFREE_ENV || 'TEST').toUpperCase() !== 'PROD';
    const baseUrl = isSandbox ? 'https://sandbox.cashfree.com/pg' : 'https://api.cashfree.com/pg';

    let verifiedGateway = 'cashfree';
    let verifiedTxId = transactionId || cashfreeOrderId;

    if (process.env.NODE_ENV === 'test' && mockSuccess) {
      verifiedGateway = 'mock';
      verifiedTxId = `mock_renew_${randomUUID().substring(0, 8)}`;
    } else if (appId && secretKey) {
      const orderToVerify = cashfreeOrderId || transactionId;
      if (!orderToVerify) {
        throw apiError(400, 'Cashfree order ID or transaction ID is required.');
      }
      try {
        const cfRes = await fetch(`${baseUrl}/orders/${orderToVerify}`, {
          headers: {
            'x-client-id': appId,
            'x-client-secret': secretKey,
            'x-api-version': '2023-08-01',
          }
        });
        if (cfRes.ok) {
          const cfData = await cfRes.json();
          if (cfData.order_status !== 'PAID') {
            throw apiError(400, 'Payment not marked as PAID by Cashfree.');
          }
          if (cfData.order_amount !== undefined && Number(cfData.order_amount) !== renewalTotal) {
            throw apiError(400, `Payment amount mismatch: received ${cfData.order_amount}, expected ${renewalTotal}.`);
          }
          verifiedGateway = 'cashfree';
          verifiedTxId = cfData.cf_order_id || orderToVerify;
        } else {
          throw apiError(400, 'Failed to verify Cashfree order status.');
        }
      } catch (err) {
        if (err.status) throw err;
        throw apiError(400, `Payment verification failed: ${err.message}`);
      }
    } else if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && razorpayPaymentId && razorpaySignature) {
      const body = `${razorpayOrderId}|${razorpayPaymentId}`;
      const expected = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
      if (expected !== razorpaySignature) {
        throw apiError(400, 'Payment signature verification failed.');
      }
      verifiedGateway = 'razorpay';
      verifiedTxId = razorpayPaymentId;
    } else {
      throw apiError(400, 'Payment verification data missing or invalid.');
    }

    // Check if this payment transaction was already applied
    if (verifiedGateway !== 'mock') {
      const dupPayment = await pool.query(
        'SELECT id FROM payments WHERE transaction_id = $1 AND status = $2',
        [verifiedTxId, 'SUCCESS']
      );
      if (dupPayment.rows.length > 0) {
        throw apiError(400, 'This payment transaction has already been applied for a renewal.');
      }
    }

    const renewOrderId = `order_${randomUUID().replace(/-/g, '').substring(0, 16)}`;
    await pool.query(
      `INSERT INTO orders
         (id, customer_name, customer_email, business_name, plan_id, amount, currency, status, provisioning_status, selected_addons, addon_amount)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [renewOrderId, sourceOrder.customer_name, sourceOrder.customer_email,
       sourceOrder.business_name, planKey, renewalTotal,
       sourceOrder.currency || 'INR', 'PAID', 'PENDING',
       JSON.stringify(validatedAddons), addonAmount]
    );

    const paymentId = `pay_${randomUUID().replace(/-/g, '').substring(0, 16)}`;
    await pool.query(
      `INSERT INTO payments (id, order_id, gateway, transaction_id, amount, status)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [paymentId, renewOrderId,
       verifiedGateway,
       verifiedTxId,
       renewalTotal, 'SUCCESS']
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

    // Provision renewed add-on entitlement if purchased
    for (const addonItem of validatedAddons) {
      if (addonItem.id === 'google_reviews') {
        const entitlementId = `ent_${randomUUID().replace(/-/g, '').substring(0, 16)}`;
        await pool.query(
          `INSERT INTO tenant_addon_entitlements
             (id, tenant_id, addon_id, status, started_at, expires_at, order_id, updated_at)
           VALUES ($1, $2, 'google_reviews', 'ACTIVE', NOW(), $3, $4, NOW())
           ON CONFLICT (tenant_id, addon_id)
           DO UPDATE SET
             status = 'ACTIVE',
             expires_at = CASE
               WHEN tenant_addon_entitlements.expires_at > NOW()
                 THEN GREATEST(tenant_addon_entitlements.expires_at + INTERVAL '1 year', EXCLUDED.expires_at)
               ELSE EXCLUDED.expires_at
             END,
             order_id = EXCLUDED.order_id,
             updated_at = NOW()`,
          [entitlementId, tenantId, newExpiry, renewOrderId]
        );
        invalidatePublicMenuCache(tenantId);
      }
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
