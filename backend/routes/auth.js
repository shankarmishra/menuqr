import { pool } from '../db.js';
import { generateAuthCookie, clearAuthCookie, getAuthenticatedUser, verifyPassword, enforceSuperAdmin, hashPassword, isLegacyHash } from '../auth.js';
import { apiError, sendJson, readJson, getClientIp, normalizeEmail, detectEmailTypoDomain } from '../utils.js';
import { createAdminSessionCookieOptions, createClearedAdminSessionCookieOptions } from '../adminSessionCookie.js';
import { randomUUID } from 'node:crypto';
import slugify from 'slugify';
import {
  sendClientWelcomeEmail,
  sendPaymentSuccessEmail,
  sendLoginOtpEmail,
  sendAdminLoginOtpEmail,
  sendPasswordResetOtpEmail,
  sendEmailDirectly,
  getEmailConfig,
} from '../email.js';

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
      { name: 'Payment Success Receipt', fn: () => emailObj.sendPaymentSuccessEmail({ email: to, businessName: 'Mishra Dhaba', plan: 'YEARLY PREMIUM', amount: 8499, expiresAt: new Date(Date.now() + 365*86400000).toISOString() }) },
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
    if (!webhookSecret) {
      console.error('[webhook] Server misconfiguration: RESEND_WEBHOOK_SECRET is missing.');
      throw apiError(500, 'Resend webhook secret is not configured on the server.');
    }

    const authHeader = request.headers['authorization'] || '';
    const resendSig = request.headers['x-resend-signature'] || request.headers['svix-signature'] || request.headers['x-webhook-secret'] || '';
    const providedSecret = authHeader.replace(/^Bearer\s+/i, '').trim() || resendSig.trim();
    if (!providedSecret || providedSecret !== webhookSecret) {
      throw apiError(401, 'Invalid or missing webhook signature secret.');
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
    const { generateCsrfToken, createCsrfCookie } = await import('../csrf.js');
    const adminCookie = serialize(createAdminSessionCookieOptions(result.token));
    const csrfToken = generateCsrfToken(result.token);
    const csrfCookie = createCsrfCookie(csrfToken);
    
    response.writeHead(200, {
      'Content-Type': 'application/json',
      'Set-Cookie': [adminCookie, csrfCookie],
      'Cache-Control': 'no-store'
    });
    response.end(JSON.stringify({ authenticated: true, role: 'SUPER_ADMIN', email: result.email, csrfToken }));
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/admin/logout') {
    const { stringifySetCookie: serialize, parseCookie: parse } = await import('cookie');
    const { createClearedCsrfCookie } = await import('../csrf.js');
    const cookies = parse(request.headers.cookie || '');
    const adminToken = cookies['menusqr_admin_session'];
    if (adminToken) {
      const { clearAdminSession } = await import('../adminAuth.js');
      await clearAdminSession(adminToken);
    }
    const adminCookie = serialize(createClearedAdminSessionCookieOptions());
    const csrfCookie = createClearedCsrfCookie();
    response.writeHead(200, {
      'Content-Type': 'application/json',
      'Set-Cookie': [adminCookie, csrfCookie],
      'Cache-Control': 'no-store'
    });
    response.end(JSON.stringify({ authenticated: false }));
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/auth/session') {
    response.setHeader('Cache-Control', 'no-store');
    let user = await getAuthenticatedUser(request);
    let sessionToken = null;
    const { parseCookie: parse } = await import('cookie');
    const cookies = parse(request.headers.cookie || '');
    sessionToken = cookies['menusqr_auth'] || null;

    if (!user) {
      const adminToken = cookies['menusqr_admin_session'];
      if (adminToken) {
        const { verifyAdminSession } = await import('../adminAuth.js');
        const adminUser = await verifyAdminSession(adminToken);
        if (adminUser) {
          user = adminUser;
          sessionToken = adminToken;
        }
      }
    }

    const { generateCsrfToken, createCsrfCookie } = await import('../csrf.js');
    const csrfToken = user ? generateCsrfToken(sessionToken || user.id) : null;
    const setCookies = [];
    if (csrfToken) {
      setCookies.push(createCsrfCookie(csrfToken));
    }

    sendJson(response, 200, {
      authenticated: !!user,
      user: user || null,
      csrfToken: csrfToken || null,
    }, setCookies.length > 0 ? { 'Set-Cookie': setCookies } : {});
    return true;
  }

  // DEPRECATED & INSECURE PAYMENT/SIGNUP ENDPOINTS REMOVED
  // All onboarding & subscription orders MUST use the authoritative /api/purchase engine.
  if (request.method === 'POST' && (
    url.pathname === '/api/auth/create-payment-intent' ||
    url.pathname === '/api/auth/process-payment' ||
    url.pathname === '/api/auth/verify-cashfree-payment' ||
    url.pathname === '/api/auth/signup'
  )) {
    throw apiError(403, 'Direct card/mock checkout is disabled. Please complete registration via the secure /api/purchase flow.');
  }

  // CLIENT LOGIN ROUTE (POSTGRESQL-BACKED OTP)
  if (request.method === 'POST' && url.pathname === '/api/auth/login') {
    const address = getClientIp(request);
    const now = Date.now();
    const ipAttempt = clientLoginAttempts.get(address);
    if (ipAttempt?.lockedUntil > now) throw apiError(429, 'Too many login attempts from this IP. Account access is temporarily locked.');
    
    const input = await readJson(request);
    let user = null;
    let userEmail = null;

    const normalizedEmail = normalizeEmail(input?.email);
    if (!normalizedEmail || typeof input?.password !== 'string' || !input.password) {
      throw apiError(401, 'Incorrect credentials.');
    }

    const { isApprovedAdminEmail } = await import('../adminAuth.js');
    if (isApprovedAdminEmail(normalizedEmail)) {
      throw apiError(400, 'This is an Admin account. Please log in at https://admin.menusqr.in/login');
    }

    const dbRes = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
    const dbUser = dbRes.rows[0];

    const compoundKey = `${normalizedEmail}:${address}`;
    const attempt = clientLoginAttempts.get(compoundKey) || ipAttempt;
    if (attempt?.lockedUntil > now) {
      throw apiError(429, 'Account is temporarily locked due to too many failed attempts. Try again later.');
    }

    let passwordMatches = false;
    if (dbUser && dbUser.role !== 'SUPER_ADMIN' && (await verifyPassword(input.password, dbUser.password_hash))) {
      passwordMatches = true;
      user = { id: String(dbUser.id), role: dbUser.role, tenantId: dbUser.tenant_id };
      userEmail = dbUser.email;

      if (isLegacyHash(dbUser.password_hash)) {
        try {
          const upgradedHash = await hashPassword(input.password);
          await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [upgradedHash, dbUser.id]);
        } catch (rehashErr) {
          console.error('[auth] Failed to auto-rehash legacy password:', rehashErr.message);
        }
      }
    }

    // If password does not match AND account is currently locked out:
    if (!passwordMatches && dbUser && dbUser.locked_until && new Date(dbUser.locked_until).getTime() > now) {
      throw apiError(429, 'Account is temporarily locked due to too many failed attempts. Try again later.');
    }

    if (!user) {
      const currentAttempt = attempt && now - attempt.windowStartedAt < 15 * 60 * 1000 ? attempt : { count: 0, windowStartedAt: now, lockedUntil: 0 };
      currentAttempt.count += 1;
      if (currentAttempt.count >= 5) currentAttempt.lockedUntil = now + 15 * 60 * 1000;
      clientLoginAttempts.set(compoundKey, currentAttempt);
      clientLoginAttempts.set(address, currentAttempt);

      if (dbUser && dbUser.role !== 'SUPER_ADMIN') {
        const nextAttempts = (dbUser.failed_attempts || 0) + 1;
        if (nextAttempts >= 5) {
          const lockExpiry = new Date(now + 15 * 60 * 1000);
          await pool.query('UPDATE users SET failed_attempts = $1, locked_until = $2 WHERE id = $3', [nextAttempts, lockExpiry, dbUser.id]);
        } else {
          await pool.query('UPDATE users SET failed_attempts = $1 WHERE id = $2', [nextAttempts, dbUser.id]);
        }
      }
      throw apiError(401, 'Incorrect credentials.');
    }

    if (dbUser && (dbUser.failed_attempts > 0 || dbUser.locked_until)) {
      await pool.query('UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = $1', [dbUser.id]);
    }
    
    clientLoginAttempts.delete(compoundKey);
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
    const { generateAuthToken } = await import('../auth.js');
    const sessionToken = generateAuthToken(sessionUser);
    const authCookie = generateAuthCookie(sessionToken);

    const { generateCsrfToken, createCsrfCookie } = await import('../csrf.js');
    const csrfToken = generateCsrfToken(sessionToken);
    const csrfCookie = createCsrfCookie(csrfToken);

    response.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Set-Cookie': [authCookie, csrfCookie],
      'Cache-Control': 'no-store'
    });
    response.end(JSON.stringify({
      authenticated: true,
      role: sessionUser.role,
      user: sessionUser,
      onboardingState: dbUser.onboarding_state,
      csrfToken,
    }));
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

    const address = getClientIp(request);
    const { createPasswordResetChallenge, invalidatePasswordResetChallenge } = await import('../clientAuth.js');
    let challenge;
    try {
      challenge = await createPasswordResetChallenge(normalizedEmail, address);
    } catch (err) {
      throw apiError(err.status || 500, err.message);
    }

    const emailRes = await sendPasswordResetOtpEmail({
      email: normalizedEmail,
      otp: challenge.otp,
      ownerName: normalizedEmail.split('@')[0],
    });

    if (!emailRes.ok) {
      await invalidatePasswordResetChallenge(challenge.challengeId);
      throw apiError(500, `Failed to send password reset email: ${emailRes.error || 'Provider error'}`);
    }

    sendJson(response, 200, { success: true, message: 'If an account exists with this email, a reset code has been sent.' });
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

    const normalizedEmail = normalizeEmail(email);
    const { verifyPasswordResetChallenge } = await import('../clientAuth.js');
    try {
      await verifyPasswordResetChallenge(normalizedEmail, otp);
    } catch (err) {
      throw apiError(err.status || 400, err.message);
    }

    const newHash = await hashPassword(newPassword);
    await pool.query('UPDATE users SET password_hash = $1 WHERE LOWER(email) = $2', [newHash, normalizedEmail]);

    sendJson(response, 200, { success: true, message: 'Password reset successfully! You can now log in.' });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/logout') {
    const { createClearedCsrfCookie } = await import('../csrf.js');
    const authCookie = clearAuthCookie();
    const csrfCookie = createClearedCsrfCookie();
    response.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Set-Cookie': [authCookie, csrfCookie],
      'Cache-Control': 'no-store'
    });
    response.end(JSON.stringify({ authenticated: false }));
    return true;
  }

  // ACCOUNT UNIQUENESS CHECK ENDPOINT
  if (request.method === 'POST' && url.pathname === '/api/auth/check-unique') {
    const input = await readJson(request);
    const { email, phone } = input || {};
    const normEmail = email ? normalizeEmail(email) : null;
    const { normalizePhone } = await import('../sms.js');
    const normPhone = phone ? normalizePhone(phone) : null;

    let emailAvailable = true;
    let phoneAvailable = true;

    if (normEmail) {
      const userRes = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [normEmail]);
      if (userRes.rows.length > 0) emailAvailable = false;
    }

    if (normPhone) {
      const clientRes = await pool.query('SELECT id FROM clients WHERE phone = $1', [normPhone]);
      const userRes = await pool.query('SELECT id FROM users WHERE phone = $1', [normPhone]);
      if (clientRes.rows.length > 0 || userRes.rows.length > 0) phoneAvailable = false;
    }

    sendJson(response, 200, {
      emailAvailable,
      phoneAvailable,
      email: normEmail,
      phone: normPhone,
    });
    return true;
  }

  // ONBOARDING EMAIL OTP REQUEST & VERIFY
  if (request.method === 'POST' && url.pathname === '/api/auth/verify-email/request-otp') {
    const input = await readJson(request);
    const { email } = input || {};
    if (!email) throw apiError(400, 'Email address is required.');

    const normEmail = normalizeEmail(email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normEmail)) {
      throw apiError(400, 'Please enter a valid email address.');
    }

    const typoCorrection = detectEmailTypoDomain(normEmail);
    if (typoCorrection) {
      throw apiError(400, `Did you mean @${typoCorrection}? Please check your email address spelling.`);
    }

    const address = getClientIp(request);

    const { createClientOtpChallenge, invalidateClientOtpChallenge } = await import('../clientAuth.js');
    let challenge;
    try {
      challenge = await createClientOtpChallenge(normEmail, address);
    } catch (err) {
      throw apiError(err.status || 429, err.message);
    }

    const emailResult = await sendLoginOtpEmail({
      email: normEmail,
      otp: challenge.otp,
      ownerName: normEmail.split('@')[0],
    });

    if (!emailResult.ok) {
      await invalidateClientOtpChallenge(challenge.challengeId);
      throw apiError(500, `Failed to send email OTP: ${emailResult.error || 'Provider rejected request'}`);
    }

    sendJson(response, 200, {
      success: true,
      challengeId: challenge.challengeId,
      email: normEmail,
      message: 'Verification code sent to email.',
    });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/verify-email/verify-otp') {
    const input = await readJson(request);
    const { challengeId, otp } = input || {};
    if (!challengeId || !otp) throw apiError(400, 'Challenge ID and OTP are required.');

    const { verifyClientOtpChallenge } = await import('../clientAuth.js');
    const result = await verifyClientOtpChallenge(challengeId, otp);
    sendJson(response, 200, { verified: true, email: result.email, verificationToken: result.verificationToken });
    return true;
  }

  // ONBOARDING PHONE OTP REQUEST & VERIFY
  if (request.method === 'POST' && url.pathname === '/api/auth/verify-phone/request-otp') {
    const input = await readJson(request);
    const { phone } = input || {};
    if (!phone) throw apiError(400, 'Phone number is required.');

    const address = getClientIp(request);
    const { requestPhoneOtp } = await import('../sms.js');
    const result = await requestPhoneOtp(phone, address);
    sendJson(response, 200, result);
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/verify-phone/verify-otp') {
    const input = await readJson(request);
    const { phone, otp } = input || {};
    if (!phone || !otp) throw apiError(400, 'Phone number and OTP code are required.');

    const address = getClientIp(request);
    const { verifyPhoneOtp } = await import('../sms.js');
    const result = await verifyPhoneOtp(phone, otp, address);
    sendJson(response, 200, result);
    return true;
  }

  return false;
}
