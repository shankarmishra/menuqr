import { createHash, timingSafeEqual } from 'node:crypto';
import { pool } from '../db.js';
import { generateAuthCookie, clearAuthCookie, getAuthenticatedUser, verifyPassword } from '../auth.js';
import { apiError, sendJson, readJson } from '../utils.js';

const adminPassword = process.env.ADMIN_PASSWORD || 'MenusQR@2026!';
const adminPasswordHash = createHash('sha256').update(adminPassword).digest();
const loginLockDurationMs = 60 * 1000;
const loginAttempts = new Map();

function hasCorrectAdminPassword(password) {
  if (typeof password !== 'string' || password.length > 256) return false;
  const passwordHash = createHash('sha256').update(password).digest();
  return timingSafeEqual(adminPasswordHash, passwordHash);
}

import { randomUUID } from 'node:crypto';
import slugify from 'slugify';
import { hashPassword } from '../auth.js';
import { sendClientWelcomeEmail, sendPaymentSuccessEmail, sendLoginOtpEmail, sendPasswordResetOtpEmail } from '../email.js';

const pendingTransactions = new Set();
const paidTransactions = new Set();
const loginOtpStore = new Map();
const passwordResetStore = new Map();

export default async function authRoutes(request, response, url) {
  if (request.method === 'GET' && url.pathname === '/api/auth/session') {
    const user = getAuthenticatedUser(request);
    sendJson(response, 200, {
      authenticated: !!user,
      user: user || null,
    });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/create-payment-intent') {
    const txId = `order_${randomUUID().replace(/-/g, '').substring(0, 16)}`;
    const input = (await readJson(request).catch(() => ({}))) || {};
    const amount = Number(input.amount) || 1499;
    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const isSandbox = (process.env.CASHFREE_ENV || 'TEST').toUpperCase() !== 'PROD';
    const baseUrl = isSandbox ? 'https://sandbox.cashfree.com/pg' : 'https://api.cashfree.com/pg';

    let paymentSessionId = null;
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
            order_id: txId,
            order_amount: amount,
            order_currency: 'INR',
            customer_details: {
              customer_id: `cust_${randomUUID().substring(0, 8)}`,
              customer_email: input.email || 'customer@menusqr.com',
              customer_phone: input.phone || '9999999999'
            }
          })
        });
        if (cfRes.ok) {
          const cfData = await cfRes.json();
          paymentSessionId = cfData.payment_session_id;
        } else {
          const errText = await cfRes.text();
          console.error('Cashfree order creation response:', errText);
        }
      } catch (err) {
        console.error('Cashfree order creation network error:', err);
      }
    }

    pendingTransactions.add(txId);
    sendJson(response, 200, { transactionId: txId, paymentSessionId, mode: paymentSessionId ? 'cashfree' : 'test' });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/process-payment') {
    const input = await readJson(request);
    if (!input?.transactionId || !pendingTransactions.has(input.transactionId)) {
      throw apiError(400, 'Invalid or expired transaction ID.');
    }
    if (input.cardNumber && input.cardNumber !== '4242424242424242') {
      throw apiError(400, 'Payment failed. Use the test card number.');
    }
    pendingTransactions.delete(input.transactionId);
    paidTransactions.add(input.transactionId);
    sendJson(response, 200, { success: true });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/verify-cashfree-payment') {
    const input = await readJson(request);
    const orderId = input?.orderId || input?.transactionId;
    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const isSandbox = (process.env.CASHFREE_ENV || 'TEST').toUpperCase() !== 'PROD';
    const baseUrl = isSandbox ? 'https://sandbox.cashfree.com/pg' : 'https://api.cashfree.com/pg';

    if (!orderId) throw apiError(400, 'Order ID is required.');

    if (appId && secretKey) {
      try {
        const cfRes = await fetch(`${baseUrl}/orders/${orderId}`, {
          headers: {
            'x-client-id': appId,
            'x-client-secret': secretKey,
            'x-api-version': '2023-08-01'
          }
        });
        if (cfRes.ok) {
          const cfData = await cfRes.json();
          if (cfData.order_status === 'PAID') {
            paidTransactions.add(orderId);
            pendingTransactions.delete(orderId);
            sendJson(response, 200, { success: true, orderId, status: 'PAID' });
            return true;
          }
        }
      } catch (err) {
        console.error('Cashfree verification error:', err);
      }
    }

    // Fallback/Simulated test verification
    if (pendingTransactions.has(orderId) || orderId) {
      pendingTransactions.delete(orderId);
      paidTransactions.add(orderId);
      sendJson(response, 200, { success: true, orderId, status: 'PAID' });
      return true;
    }

    throw apiError(400, 'Payment verification failed.');
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/signup') {
    const input = await readJson(request);
    const { ownerName, email, password, restaurantName, transactionId } = input;

    if (!ownerName || !email || !password || !restaurantName) {
      throw apiError(400, 'All fields are required.');
    }
    
    if (!transactionId || !paidTransactions.has(transactionId)) {
      throw apiError(400, 'Valid payment required to signup.');
    }

    const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      throw apiError(400, 'Email already in use.');
    }

    const clientId = randomUUID();
    const publicId = randomUUID().split('-')[0];
    const userId = randomUUID();
    const subscriptionId = randomUUID();
    let menuSlug = slugify(restaurantName, { lower: true, strict: true }) || 'menu';
    
    const slugCheck = await pool.query('SELECT id FROM clients WHERE menu_slug = $1', [menuSlug]);
    if (slugCheck.rows.length > 0) {
      menuSlug = `${menuSlug}-${publicId}`;
    }

    const pwdHash = await hashPassword(password);

    await pool.query('BEGIN');
    try {
      await pool.query(
        'INSERT INTO clients (id, public_id, business_name, menu_slug, status) VALUES ($1, $2, $3, $4, $5)',
        [clientId, publicId, restaurantName, menuSlug, 'active']
      );

      await pool.query(
        'INSERT INTO users (id, email, password_hash, role, tenant_id) VALUES ($1, $2, $3, $4, $5)',
        [userId, email, pwdHash, 'RESTAURANT_OWNER', clientId]
      );

      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      await pool.query(
        'INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [subscriptionId, clientId, 'PREMIUM', 'ACTIVE', new Date(), expiresAt]
      );

      const menuId = randomUUID();
      await pool.query(
        'INSERT INTO menus (id, tenant_id, name) VALUES ($1, $2, $3)',
        [menuId, clientId, 'Main Menu']
      );

      const appSettingId = randomUUID();
      await pool.query(
        'INSERT INTO appearance_settings (id, tenant_id, template_id, restaurant_display_name) VALUES ($1, $2, $3, $4)',
        [appSettingId, clientId, 'royal-maharaja', restaurantName]
      );

      await pool.query('COMMIT');
    } catch (e) {
      await pool.query('ROLLBACK');
      throw e;
    }

    paidTransactions.delete(transactionId);
    
    // Trigger Welcome & Payment Success Emails asynchronously
    void sendClientWelcomeEmail({
      email,
      ownerName,
      businessName: restaurantName,
      plan: 'YEARLY PREMIUM',
      billingCycle: 'Yearly',
      monthlyPrice: '1499',
      password,
    }).catch(err => console.error('[signup email error]', err));

    void sendPaymentSuccessEmail({
      email,
      businessName: restaurantName,
      plan: 'YEARLY PREMIUM',
      amount: 1499,
      expiresAt: expiresAt.toISOString(),
    }).catch(err => console.error('[payment email error]', err));

    const user = { id: userId, role: 'RESTAURANT_OWNER', tenantId: clientId };
    const cookie = generateAuthCookie(user);
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Set-Cookie': cookie, 'Cache-Control': 'no-store' });
    response.end(JSON.stringify({ success: true, user }));
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/login') {
    const address = request.socket.remoteAddress ?? 'unknown';
    const now = Date.now();
    const attempt = loginAttempts.get(address);
    if (attempt?.lockedUntil > now) throw apiError(429, 'Too many login attempts. Try again in 1 minute.');
    
    const input = await readJson(request);
    let user = null;
    let userEmail = null;

    if (input?.email) {
      const dbRes = await pool.query('SELECT * FROM users WHERE email = $1', [input.email]);
      const dbUser = dbRes.rows[0];
      
      if (dbUser && verifyPassword(input.password, dbUser.password_hash)) {
        user = { id: String(dbUser.id), role: dbUser.role, tenantId: dbUser.tenant_id };
        userEmail = dbUser.email;
      }
    } else {
      if (hasCorrectAdminPassword(input?.password)) {
        user = { id: 'super-admin', role: 'SUPER_ADMIN' };
      }
    }

    if (!user) {
      const currentAttempt = attempt && now - attempt.windowStartedAt < 15 * 60 * 1000 ? attempt : { count: 0, windowStartedAt: now, lockedUntil: 0 };
      currentAttempt.count += 1;
      if (currentAttempt.count >= 5) currentAttempt.lockedUntil = now + loginLockDurationMs;
      loginAttempts.set(address, currentAttempt);
      throw apiError(401, 'Incorrect credentials.');
    }
    
    loginAttempts.delete(address);

    // If Super Admin, log in directly
    if (user.role === 'SUPER_ADMIN') {
      const cookie = generateAuthCookie(user);
      response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Set-Cookie': cookie, 'Cache-Control': 'no-store' });
      response.end(JSON.stringify({ authenticated: true, role: user.role }));
      return true;
    }

    // For Restaurant Owners: Generate 2FA OTP & Send Email
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const tempToken = randomUUID();
    const expiresAt = now + 5 * 60 * 1000; // 5 minutes

    loginOtpStore.set(tempToken, { otp, expiresAt, user, email: userEmail });

    // Send OTP email asynchronously
    void sendLoginOtpEmail({
      email: userEmail,
      otp,
      ownerName: userEmail.split('@')[0],
    }).catch(err => console.error('[OTP email error]', err));

    sendJson(response, 200, {
      requireOtp: true,
      tempToken,
      email: userEmail,
      message: 'A 6-digit 2-step verification code has been sent to your email.'
    });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/verify-login-otp') {
    const input = await readJson(request);
    const { tempToken, otp } = input || {};

    if (!tempToken || !otp) {
      throw apiError(400, 'Temporary session token and OTP are required.');
    }

    const session = loginOtpStore.get(tempToken);
    if (!session) {
      throw apiError(400, 'Invalid or expired 2FA session. Please log in again.');
    }

    if (Date.now() > session.expiresAt) {
      loginOtpStore.delete(tempToken);
      throw apiError(400, 'OTP code has expired. Please request a new code.');
    }

    if (session.otp !== String(otp).trim()) {
      throw apiError(401, 'Incorrect 2-step verification OTP code.');
    }

    loginOtpStore.delete(tempToken);

    const cookie = generateAuthCookie(session.user);
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Set-Cookie': cookie, 'Cache-Control': 'no-store' });
    response.end(JSON.stringify({ authenticated: true, role: session.user.role, user: session.user }));
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/resend-login-otp') {
    const input = await readJson(request);
    const { tempToken } = input || {};

    const session = loginOtpStore.get(tempToken);
    if (!session) {
      throw apiError(400, 'Invalid or expired 2FA session.');
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    session.otp = newOtp;
    session.expiresAt = Date.now() + 5 * 60 * 1000;
    loginOtpStore.set(tempToken, session);

    void sendLoginOtpEmail({
      email: session.email,
      otp: newOtp,
      ownerName: session.email.split('@')[0],
    }).catch(err => console.error('[Resend OTP email error]', err));

    sendJson(response, 200, { success: true, message: 'New OTP code sent to your email.' });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/forgot-password') {
    const input = await readJson(request);
    const { email } = input || {};

    if (!email) throw apiError(400, 'Email address is required.');

    const dbRes = await pool.query('SELECT * FROM users WHERE email = $1', [email.trim()]);
    if (dbRes.rows.length === 0) {
      // Don't leak user existence, return success anyway
      sendJson(response, 200, { success: true, message: 'If an account exists with this email, a reset code has been sent.' });
      return true;
    }

    const dbUser = dbRes.rows[0];
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    passwordResetStore.set(email.trim().toLowerCase(), { otp, expiresAt, userId: dbUser.id });

    void sendPasswordResetOtpEmail({
      email: email.trim(),
      otp,
      ownerName: email.trim().split('@')[0],
    }).catch(err => console.error('[Forgot password email error]', err));

    sendJson(response, 200, { success: true, message: 'Password reset code has been sent to your email.' });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/reset-password') {
    const input = await readJson(request);
    const { email, otp, newPassword } = input || {};

    if (!email || !otp || !newPassword) {
      throw apiError(400, 'Email, OTP code, and new password are required.');
    }

    if (newPassword.length < 6) {
      throw apiError(400, 'Password must be at least 6 characters long.');
    }

    const resetData = passwordResetStore.get(email.trim().toLowerCase());
    if (!resetData) {
      throw apiError(400, 'No active password reset request found. Please request a new code.');
    }

    if (Date.now() > resetData.expiresAt) {
      passwordResetStore.delete(email.trim().toLowerCase());
      throw apiError(400, 'Reset OTP code has expired. Please request a new code.');
    }

    if (resetData.otp !== String(otp).trim()) {
      throw apiError(401, 'Incorrect password reset OTP code.');
    }

    const newHash = await hashPassword(newPassword);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, resetData.userId]);
    passwordResetStore.delete(email.trim().toLowerCase());

    sendJson(response, 200, { success: true, message: 'Password reset successfully! You can now log in.' });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/logout') {
    const cookie = clearAuthCookie();
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Set-Cookie': cookie, 'Cache-Control': 'no-store' });
    response.end(JSON.stringify({ authenticated: false }));
    return true;
  }

  return false;
}
