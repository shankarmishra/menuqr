import { randomUUID } from 'node:crypto';
import slugify from 'slugify';
import { pool } from '../db.js';
import { apiError, sendJson, readJson } from '../utils.js';
import { hashPassword } from '../auth.js';
import { sendClientWelcomeEmail, sendPaymentSuccessEmail } from '../email.js';

export default async function purchaseRoutes(request, response, url) {
  if (!url.pathname.startsWith('/api/orders')) return false;

  // 1. Create Order
  if (request.method === 'POST' && url.pathname === '/api/orders') {
    const input = await readJson(request);
    const { customerName, customerEmail, businessName, planId, currency } = input;
    
    if (!customerName || !customerEmail || !businessName || !planId) {
      throw apiError(400, 'Missing required fields.');
    }

    // Hardcode backend prices
    const plans = {
      basic: 999,
      intermediate: 1499,
      premium: 2999,
    };
    const amount = plans[planId.toLowerCase()];
    if (!amount) {
      throw apiError(400, 'Invalid plan selected.');
    }

    // Prevent duplicate emails if tenant already exists
    const userCheck = await pool.query('SELECT id, tenant_id FROM users WHERE email = $1', [customerEmail]);
    if (userCheck.rows.length > 0) {
      if (userCheck.rows[0].tenant_id) {
        throw apiError(409, 'An account already exists with this email.');
      }
    }

    const orderId = `order_${randomUUID().replace(/-/g, '').substring(0, 16)}`;
    
    await pool.query(
      `INSERT INTO orders (id, customer_name, customer_email, business_name, plan_id, amount, currency, status, provisioning_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [orderId, customerName, customerEmail, businessName, planId, amount, currency || 'INR', 'PENDING_PAYMENT', 'PENDING']
    );

    sendJson(response, 200, { orderId, amount, status: 'PENDING_PAYMENT' });
    return true;
  }

  // 1b. Get Order Details
  const orderMatch = url.pathname.match(/^\/api\/orders\/([^/]+)$/);
  if (request.method === 'GET' && orderMatch) {
    const orderId = orderMatch[1];
    const res = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
    if (!res.rows[0]) throw apiError(404, 'Order not found.');
    sendJson(response, 200, res.rows[0]);
    return true;
  }

  // 2. Process Payment & Provision
  const payMatch = url.pathname.match(/^\/api\/orders\/([^/]+)\/verify-payment$/);
  if (request.method === 'POST' && payMatch) {
    const orderId = payMatch[1];
    const input = await readJson(request);
    const { cardNumber } = input;

    // Verify Order
    const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
    const order = orderRes.rows[0];
    if (!order) throw apiError(404, 'Order not found.');
    if (order.status === 'PAID') {
       // already paid, just return success or re-try provisioning if needed
       // we will proceed to provisioning if it is not complete
    } else if (order.status !== 'PENDING_PAYMENT') {
       throw apiError(400, 'Order is in invalid state.');
    } else {
       // Simulated Payment Gateway Check
       if (cardNumber && cardNumber !== '4242424242424242') {
         await pool.query('UPDATE orders SET status = $1 WHERE id = $2', ['FAILED', orderId]);
         throw apiError(400, 'Payment failed.');
       }

       // Mark as PAID
       await pool.query('UPDATE orders SET status = $1 WHERE id = $2', ['PAID', orderId]);
       
       const paymentId = `pay_${randomUUID().replace(/-/g, '').substring(0, 16)}`;
       await pool.query(
         `INSERT INTO payments (id, order_id, gateway, transaction_id, amount, status)
          VALUES ($1, $2, $3, $4, $5, $6)`,
         [paymentId, orderId, 'test_gateway', `txn_${randomUUID()}`, order.amount, 'SUCCESS']
       );
    }

    // PROVISIONING (Idempotent)
    const provCheck = await pool.query('SELECT provisioning_status FROM orders WHERE id = $1', [orderId]);
    if (provCheck.rows[0].provisioning_status === 'COMPLETE') {
        sendJson(response, 200, { success: true, orderId, status: 'PAID', provisioning_status: 'COMPLETE' });
        return true;
    }

    await pool.query('UPDATE orders SET provisioning_status = $1 WHERE id = $2', ['PROCESSING', orderId]);

    try {
      await pool.query('BEGIN');

      // Find user if exists
      let userId;
      let userCheck = await pool.query('SELECT id, tenant_id FROM users WHERE email = $1 FOR UPDATE', [order.customer_email]);
      let tenantId;

      if (userCheck.rows.length > 0) {
        userId = userCheck.rows[0].id;
        if (userCheck.rows[0].tenant_id) {
           // User already has a tenant. This shouldn't happen normally due to order check, but handle it.
           tenantId = userCheck.rows[0].tenant_id;
        }
      } else {
        userId = randomUUID();
        // Generate random password hash (login via reset or magic link later)
        const pwdHash = await hashPassword(randomUUID().substring(0, 32));
        await pool.query(
          'INSERT INTO users (id, email, password_hash, role, onboarding_state) VALUES ($1, $2, $3, $4, $5)',
          [userId, order.customer_email, pwdHash, 'RESTAURANT_OWNER', 'PENDING']
        );
      }

      if (!tenantId) {
        tenantId = randomUUID();
        const publicId = randomUUID().split('-')[0];
        let menuSlug = slugify(order.business_name, { lower: true, strict: true }) || 'menu';
        
        const slugCheck = await pool.query('SELECT id FROM clients WHERE menu_slug = $1', [menuSlug]);
        if (slugCheck.rows.length > 0) {
          menuSlug = `${menuSlug}-${publicId}`;
        }

        await pool.query(
          'INSERT INTO clients (id, public_id, business_name, menu_slug, status) VALUES ($1, $2, $3, $4, $5)',
          [tenantId, publicId, order.business_name, menuSlug, 'active']
        );

        await pool.query('UPDATE users SET tenant_id = $1 WHERE id = $2', [tenantId, userId]);

        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);

        const subscriptionId = randomUUID();
        await pool.query(
          'INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at) VALUES ($1, $2, $3, $4, $5, $6)',
          [subscriptionId, tenantId, order.plan_id.toUpperCase(), 'ACTIVE', new Date(), expiresAt]
        );

        const menuId = randomUUID();
        await pool.query(
          'INSERT INTO menus (id, tenant_id, name) VALUES ($1, $2, $3)',
          [menuId, tenantId, 'Main Menu']
        );

        const appSettingId = randomUUID();
        await pool.query(
          'INSERT INTO appearance_settings (id, tenant_id, template_id, restaurant_display_name) VALUES ($1, $2, $3, $4)',
          [appSettingId, tenantId, 'royal-maharaja', order.business_name]
        );
      }

      await pool.query('UPDATE orders SET provisioning_status = $1 WHERE id = $2', ['COMPLETE', orderId]);
      await pool.query('COMMIT');

      // Trigger "Account is ready" email (no plaintext password)
      // Send welcome email that redirects user to "Reset Password" or "Activation" link
      void sendClientWelcomeEmail({
        email: order.customer_email,
        ownerName: order.customer_name,
        businessName: order.business_name,
        plan: order.plan_id,
        billingCycle: 'Yearly',
        monthlyPrice: order.amount,
        // Omit password, the template will say "Click here to set your password"
      }).catch(err => console.error('[signup email error]', err));

      sendJson(response, 200, { success: true, orderId, status: 'PAID', provisioning_status: 'COMPLETE' });
    } catch (e) {
      await pool.query('ROLLBACK');
      await pool.query('UPDATE orders SET provisioning_status = $1 WHERE id = $2', ['FAILED', orderId]);
      console.error('[Provisioning Error]', e);
      // Return 200 because payment succeeded, but indicate provisioning failed so client can retry or contact support
      sendJson(response, 200, { success: true, orderId, status: 'PAID', provisioning_status: 'FAILED', message: 'Payment successful but provisioning failed.' });
    }
    
    return true;
  }

  return false;
}
