import { pool } from '../db.js';
import { generateAuthCookie, clearAuthCookie, getAuthenticatedUser, verifyPassword, enforceSuperAdmin } from '../auth.js';
import { apiError, sendJson, readJson, getClientIp, normalizeEmail } from '../utils.js';
import { createAdminSessionCookieOptions, createClearedAdminSessionCookieOptions } from '../adminSessionCookie.js';
import { randomUUID } from 'node:crypto';
import slugify from 'slugify';
import { hashPassword } from '../auth.js';
import {
  sendClientWelcomeEmail,
  sendPaymentSuccessEmail,
  sendLoginOtpEmail,
  sendAdminLoginOtpEmail,
  sendPasswordResetOtpEmail,
  sendEmailDirectly,
  getEmailConfig,
} from '../email.js';

const pendingTransactions = new Set();
const paidTransactions = new Set();
const passwordResetStore = new Map();
const clientLoginAttempts = new Map();
const clientLoginLockDurationMs = 60 * 1000;

export default async function authRoutes(request, response, url) {

  // DIAGNOSTIC EMAIL ROUTE (SUPER ADMIN PROTECTED)
  if (request.method === 'GET' && url.pathname === '/api/test-email') {
    await enforceSuperAdmin(request);
    const to = url.searchParams.get('to') || 'xshankarmishra@gmail.com';
    try {
      const result = await sendEmailDirectly({
        to,
        subject: 'Diagnostic Test Email from Render Production',
        html: '<h1>Diagnostic Email Test</h1><p>If you see this, Resend HTTPS delivery is working 100%!</p>',
        text: 'Diagnostic test email from Render Production',
      }, `diagnostic test email to ${to}`);

      if (!result.ok) {
        sendJson(response, 500, { success: false, error: result.error });
      } else {
        sendJson(response, 200, { success: true, message: `Email sent successfully to ${to}! Message ID: ${result.messageId}` });
      }
    } catch (err) {
      console.error('[test-email] Failed:', err);
      sendJson(response, 500, { success: false, error: err.message, stack: err.stack });
    }
    return true;
  }

  // SEND ALL EMAIL TYPES TEST ROUTE (SUPER ADMIN PROTECTED)
  if (request.method === 'GET' && url.pathname === '/api/test-all-emails') {
    await enforceSuperAdmin(request);
    const to = url.searchParams.get('to') || 'xshankarmishra@gmail.com';
    const emailObj = await import('../email.js');
    const results = [];
    const errors = [];

    const emailTasks = [
      { name: 'Admin Login OTP', fn: () => emailObj.sendAdminLoginOtpEmail({ email: to, otp: '849204' }) },
      { name: 'Password Reset OTP', fn: () => emailObj.sendPasswordResetOtpEmail({ email: to, otp: '592014', ownerName: 'Shankar Mishra' }) },
      { name: 'Restaurant Login OTP', fn: () => emailObj.sendLoginOtpEmail({ email: to, otp: '310482', ownerName: 'Shankar Mishra' }) },
      { name: 'Client Welcome & Credentials', fn: () => emailObj.sendClientWelcomeEmail({ email: to, ownerName: 'Shankar Mishra', businessName: 'Mishra Dhaba', plan: 'YEARLY PREMIUM', billingCycle: 'Yearly', password: 'DemoPassword2026!' }) },
      { name: 'Payment Success Receipt', fn: () => emailObj.sendPaymentSuccessEmail({ email: to, businessName: 'Mishra Dhaba', plan: 'YEARLY PREMIUM', amount: 1499, expiresAt: new Date(Date.now() + 365*86400000).toISOString() }) },
      { name: 'Workspace Activation', fn: () => emailObj.sendActivationEmail({ email: to, ownerName: 'Shankar Mishra', businessName: 'Mishra Dhaba', plan: 'YEARLY PREMIUM', password: 'DemoPassword2026!' }) },
      { name: 'Subscription Expiration Warning', fn: () => emailObj.sendSubscriptionWarningEmail({ email: to, businessName: 'Mishra Dhaba', daysRemaining: 7, expiresAt: new Date(Date.now() + 7*86400000).toISOString() }) },
      { name: 'Subscription Expired Notice', fn: () => emailObj.sendSubscriptionExpiredEmail({ email: to, businessName: 'Mishra Dhaba' }) },
      { name: 'Subscription Renewed Notice', fn: () => emailObj.sendRenewalEmail({ email: to, businessName: 'Mishra Dhaba', expiresAt: new Date(Date.now() + 365*86400000).toISOString() }) },
      { name: 'Table Placard QR Ready Artwork', fn: () => emailObj.sendQrReadyEmail({ email: to, businessName: 'Mishra Dhaba', tagline: 'Good Food | Happy Mood', menuSlug: 'mishraa-dhaba' }) }
    ];

    for (const task of emailTasks) {
      try {
        const res = await task.fn();
        results.push({ emailType: task.name, status: res?.ok !== false ? 'QUEUED_OR_SENT' : 'FAILED', messageId: res?.messageId || null });
      } catch (err) {
        console.error(`[test-all-emails] Error sending ${task.name}:`, err.message);
        errors.push({ emailType: task.name, error: err.message });
      }
    }

    sendJson(response, 200, {
      success: errors.length === 0,
      recipient: to,
      totalSent: results.length,
      results,
      errors
    });
    return true;
  }

  // RESEND WEBHOOK ENDPOINT
  if (request.method === 'POST' && url.pathname === '/api/webhooks/resend') {
    const webhookSecret = (process.env.RESEND_WEBHOOK_SECRET || '').trim();
    if (webhookSecret) {
      const authHeader = request.headers['authorization'] || '';
      const resendSig = request.headers['x-resend-signature'] || request.headers['svix-signature'] || request.headers['x-webhook-secret'] || '';
      const providedSecret = authHeader.replace(/^Bearer\s+/i, '').trim() || resendSig.trim();
      if (!providedSecret || providedSecret !== webhookSecret) {
        throw apiError(401, 'Invalid or missing webhook signature secret.');
      }
    }

    const input = await readJson(request);
    const eventType = input?.type || 'unknown';
    const data = input?.data || {};
    const providerMessageId = data.email_id || data.id || null;
    const recipient = Array.isArray(data.to) ? data.to[0] : (data.to || null);

    if (providerMessageId) {
      const outboxRes = await pool.query('SELECT id FROM email_outbox WHERE provider_message_id = $1', [providerMessageId]);
      const outboxId = outboxRes.rows[0]?.id || null;

      await pool.query(`
        INSERT INTO email_events (id, outbox_id, provider_message_id, event_type, recipient, payload)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [randomUUID(), outboxId, providerMessageId, eventType, recipient, JSON.stringify(input)]);

      if (outboxId) {
        let newStatus = null;
        if (eventType === 'email.delivered') newStatus = 'DELIVERED';
        else if (eventType === 'email.bounced') newStatus = 'BOUNCED';
        else if (eventType === 'email.complained') newStatus = 'FAILED';
        else if (eventType === 'email.sent') newStatus = 'PROVIDER_ACCEPTED';

        if (newStatus) {
          await pool.query('UPDATE email_outbox SET status = $1, updated_at = NOW() WHERE id = $2', [newStatus, outboxId]);
        }
      }
    }

    sendJson(response, 200, { received: true });
    return true;
  }

  // ADMIN OTP REQUEST ROUTE
  if (request.method === 'POST' && url.pathname === '/api/auth/admin/request-otp') {
    const input = await readJson(request);
    const email = input?.email?.trim().toLowerCase();
    if (!email) throw apiError(400, 'Email is required.');

    const { requestAdminOtp } = await import('../adminAuth.js');
    const address = getClientIp(request);
    
    const result = await requestAdminOtp(email, address);
    if (result) {
      const emailRes = await sendAdminLoginOtpEmail({ email, otp: result.otp });
      if (!emailRes.ok) {
        console.error('[admin auth] OTP email delivery failed:', emailRes.error);
        throw apiError(500, `Email delivery failed: ${emailRes.error || 'Provider error'}`);
      }
    }
    
    sendJson(response, 200, { success: true, message: 'If an admin account exists, an OTP has been sent.' });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/admin/verify-otp') {
    const input = await readJson(request);
    const { email, otp } = input || {};
    if (!email || !otp) throw apiError(400, 'Email and OTP are required.');

    const { verifyAdminOtp } = await import('../adminAuth.js');
    const address = getClientIp(request);
    
    let result;
    try {
      result = await verifyAdminOtp(email.trim().toLowerCase(), otp, address);
    } catch (err) {
      throw apiError(err.status || 401, err.status === 429
        ? 'Unable to verify sign-in. Please request a new code.'
        : 'Unable to verify sign-in. Check your details or request a new code.');
    }

    const { stringifySetCookie: serialize } = await import('cookie');
    const cookie = serialize(createAdminSessionCookieOptions(result.token));
    
    response.writeHead(200, { 'Content-Type': 'application/json', 'Set-Cookie': cookie, 'Cache-Control': 'no-store' });
    response.end(JSON.stringify({ authenticated: true, role: 'SUPER_ADMIN', email: result.email }));
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/admin/logout') {
    const { stringifySetCookie: serialize, parseCookie: parse } = await import('cookie');
    const cookies = parse(request.headers.cookie || '');
    const adminToken = cookies['menusqr_admin_session'];
    if (adminToken) {
      const { clearAdminSession } = await import('../adminAuth.js');
      await clearAdminSession(adminToken);
    }
    const cookie = serialize(createClearedAdminSessionCookieOptions());
    response.writeHead(200, { 'Content-Type': 'application/json', 'Set-Cookie': cookie, 'Cache-Control': 'no-store' });
    response.end(JSON.stringify({ authenticated: false }));
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/auth/session') {
    response.setHeader('Cache-Control', 'no-store');
    let user = await getAuthenticatedUser(request);
    if (!user) {
      const { parseCookie: parse } = await import('cookie');
      const cookies = parse(request.headers.cookie || '');
      const adminToken = cookies['menusqr_admin_session'];
      if (adminToken) {
        const { verifyAdminSession } = await import('../adminAuth.js');
        const adminUser = await verifyAdminSession(adminToken);
        if (adminUser) user = adminUser;
      }
    }
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
        console.error('Cashfree order creation network error:', err.message);
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
        console.error('Cashfree verification error:', err.message);
      }
    }

    if (!appId || !secretKey || isSandbox) {
      if (pendingTransactions.has(orderId)) {
        pendingTransactions.delete(orderId);
        paidTransactions.add(orderId);
        sendJson(response, 200, { success: true, orderId, status: 'PAID' });
        return true;
      }
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
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const client = await pool.connect();
    await client.query('BEGIN');
    try {
      await client.query(
        'INSERT INTO clients (id, public_id, business_name, menu_slug, status) VALUES ($1, $2, $3, $4, $5)',
        [clientId, publicId, restaurantName, menuSlug, 'active']
      );

      await client.query(
        'INSERT INTO users (id, email, password_hash, role, tenant_id) VALUES ($1, $2, $3, $4, $5)',
        [userId, email, pwdHash, 'RESTAURANT_OWNER', clientId]
      );

      await client.query(
        'INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [subscriptionId, clientId, 'PREMIUM', 'ACTIVE', new Date(), expiresAt]
      );

      const menuId = randomUUID();
      await client.query(
        'INSERT INTO menus (id, tenant_id, name) VALUES ($1, $2, $3)',
        [menuId, clientId, 'Main Menu']
      );

      const appSettingId = randomUUID();
      await client.query(
        'INSERT INTO appearance_settings (id, tenant_id, template_id, restaurant_display_name) VALUES ($1, $2, $3, $4)',
        [appSettingId, clientId, 'royal-maharaja', restaurantName]
      );

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    paidTransactions.delete(transactionId);
    
    // Queue Welcome & Payment Success Emails in Durable Outbox Queue
    void sendClientWelcomeEmail({
      id: clientId,
      email,
      ownerName,
      businessName: restaurantName,
      plan: 'YEARLY PREMIUM',
      billingCycle: 'Yearly',
      password,
    }).catch(err => console.error('[signup email error]', err.message));

    void sendPaymentSuccessEmail({
      email,
      businessName: restaurantName,
      plan: 'YEARLY PREMIUM',
      amount: 1499,
      expiresAt: expiresAt.toISOString(),
    }).catch(err => console.error('[payment email error]', err.message));

    const user = { id: userId, role: 'RESTAURANT_OWNER', tenantId: clientId };
    const cookie = generateAuthCookie(user);
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Set-Cookie': cookie, 'Cache-Control': 'no-store' });
    response.end(JSON.stringify({ success: true, user }));
    return true;
  }

  // CLIENT LOGIN ROUTE (POSTGRESQL-BACKED OTP)
  if (request.method === 'POST' && url.pathname === '/api/auth/login') {
    const address = getClientIp(request);
    const now = Date.now();
    const attempt = clientLoginAttempts.get(address);
    if (attempt?.lockedUntil > now) throw apiError(429, 'Too many login attempts. Try again in 1 minute.');
    
    const input = await readJson(request);
    let user = null;
    let userEmail = null;

    const normalizedEmail = normalizeEmail(input?.email);
    if (normalizedEmail) {
      const { isApprovedAdminEmail } = await import('../adminAuth.js');
      if (isApprovedAdminEmail(normalizedEmail)) {
        throw apiError(400, 'This is an Admin account. Please log in at https://admin.menusqr.in/login');
      }

      const dbRes = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
      const dbUser = dbRes.rows[0];
      
      if (dbUser && dbUser.role !== 'SUPER_ADMIN' && verifyPassword(input.password, dbUser.password_hash)) {
        user = { id: String(dbUser.id), role: dbUser.role, tenantId: dbUser.tenant_id };
        userEmail = dbUser.email;
      }
    }

    if (!user) {
      const currentAttempt = attempt && now - attempt.windowStartedAt < 15 * 60 * 1000 ? attempt : { count: 0, windowStartedAt: now, lockedUntil: 0 };
      currentAttempt.count += 1;
      if (currentAttempt.count >= 5) currentAttempt.lockedUntil = now + clientLoginLockDurationMs;
      clientLoginAttempts.set(address, currentAttempt);
      throw apiError(401, 'Incorrect credentials.');
    }
    
    clientLoginAttempts.delete(address);

    // Create PostgreSQL-backed OTP Challenge
    const { createClientOtpChallenge, invalidateClientOtpChallenge } = await import('../clientAuth.js');
    let challenge;
    try {
      challenge = await createClientOtpChallenge(userEmail, address);
    } catch (err) {
      throw apiError(err.status || 500, err.message);
    }

    // Await Resend API email delivery before reporting success!
    const emailResult = await sendLoginOtpEmail({
      email: userEmail,
      otp: challenge.otp,
      ownerName: userEmail.split('@')[0],
    });

    if (!emailResult.ok) {
      await invalidateClientOtpChallenge(challenge.challengeId);
      throw apiError(500, `Failed to send verification code email: ${emailResult.error || 'Provider rejected request'}`);
    }

    sendJson(response, 200, {
      requireOtp: true,
      tempToken: challenge.challengeId,
      email: userEmail,
      emailSent: true,
      message: 'A 6-digit 2-step verification code has been sent to your email.'
    });
    return true;
  }

  // CLIENT OTP VERIFICATION ROUTE (POSTGRESQL-BACKED)
  if (request.method === 'POST' && url.pathname === '/api/auth/verify-login-otp') {
    const input = await readJson(request);
    const { tempToken, otp } = input || {};

    if (!tempToken || !otp) {
      throw apiError(400, 'Temporary session token and OTP are required.');
    }

    const { verifyClientOtpChallenge } = await import('../clientAuth.js');
    let verification;
    try {
      verification = await verifyClientOtpChallenge(tempToken, otp);
    } catch (err) {
      throw apiError(err.status || 400, err.message);
    }

    const normalizedEmail = verification.email;
    const dbRes = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
    const dbUser = dbRes.rows[0];
    if (!dbUser) throw apiError(404, 'User account not found.');

    const sessionUser = { id: String(dbUser.id), role: dbUser.role, tenantId: dbUser.tenant_id };
    const cookie = generateAuthCookie(sessionUser);

    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Set-Cookie': cookie, 'Cache-Control': 'no-store' });
    response.end(JSON.stringify({ authenticated: true, role: sessionUser.role, user: sessionUser, onboardingState: dbUser.onboarding_state }));
    return true;
  }

  // CLIENT OTP RESEND ROUTE (POSTGRESQL-BACKED & AWAITED)
  if (request.method === 'POST' && url.pathname === '/api/auth/resend-login-otp') {
    const input = await readJson(request);
    const { tempToken } = input || {};
    if (!tempToken) throw apiError(400, 'Temporary session token is required.');

    const challengeRes = await pool.query('SELECT email FROM client_otp_challenges WHERE id = $1', [tempToken]);
    if (challengeRes.rows.length === 0) {
      throw apiError(400, 'Invalid or expired 2FA session. Please log in again.');
    }

    const userEmail = challengeRes.rows[0].email;
    const address = getClientIp(request);

    const { createClientOtpChallenge, invalidateClientOtpChallenge } = await import('../clientAuth.js');
    let newChallenge;
    try {
      newChallenge = await createClientOtpChallenge(userEmail, address);
    } catch (err) {
      throw apiError(err.status || 429, err.message);
    }

    const emailResult = await sendLoginOtpEmail({
      email: userEmail,
      otp: newChallenge.otp,
      ownerName: userEmail.split('@')[0],
    });

    if (!emailResult.ok) {
      await invalidateClientOtpChallenge(newChallenge.challengeId);
      throw apiError(500, `Failed to send new verification code email: ${emailResult.error || 'Provider rejected request'}`);
    }

    sendJson(response, 200, {
      success: true,
      tempToken: newChallenge.challengeId,
      message: 'New verification code sent to your email.'
    });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/forgot-password') {
    const input = await readJson(request);
    const { email } = input || {};

    if (!email) throw apiError(400, 'Email address is required.');

    const normalizedEmail = normalizeEmail(email);
    const dbRes = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
    if (dbRes.rows.length === 0) {
      sendJson(response, 200, { success: true, message: 'If an account exists with this email, a reset code has been sent.' });
      return true;
    }

    const dbUser = dbRes.rows[0];
    const { generateClientOtp, hashClientOtp } = await import('../clientAuth.js');
    const otp = generateClientOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    passwordResetStore.set(normalizedEmail, { otpHash: hashClientOtp(otp), expiresAt, userId: dbUser.id });

    const emailRes = await sendPasswordResetOtpEmail({
      email: normalizedEmail,
      otp,
      ownerName: normalizedEmail.split('@')[0],
    });

    if (!emailRes.ok) {
      passwordResetStore.delete(normalizedEmail);
      throw apiError(500, `Failed to send password reset email: ${emailRes.error || 'Provider error'}`);
    }

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

    const { matchesClientOtp } = await import('../clientAuth.js');
    if (!matchesClientOtp(String(otp).trim(), resetData.otpHash)) {
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
