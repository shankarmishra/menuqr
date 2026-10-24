import https from 'node:https';
import dns from 'node:dns';
import { randomUUID } from 'node:crypto';
import { pool } from './db.js';

// Force IPv4 lookup for all SMTP & external API calls (fixes ENETUNREACH on Render/cloud containers)
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}

// ===========================================================================
// EMAIL SERVICE MASTER TOGGLE:
// Active when ENABLE_EMAIL_SERVICE=true in Render / environment settings.
// ===========================================================================
export function isEmailServiceActive(environment = process.env) {
  return environment.ENABLE_EMAIL_SERVICE === 'true';
}

export function getSmtpTimeoutOptions(environment = process.env) {
  const timeoutValue = (value, fallback) => {
    const timeout = Number(value);
    return Number.isFinite(timeout) && timeout > 0 ? timeout : fallback;
  };

  return {
    connectionTimeout: timeoutValue(environment.SMTP_CONNECTION_TIMEOUT_MS, 10_000),
    greetingTimeout: timeoutValue(environment.SMTP_GREETING_TIMEOUT_MS, 10_000),
    socketTimeout: timeoutValue(environment.SMTP_SOCKET_TIMEOUT_MS, 20_000),
  };
}

export function maskEmail(email) {
  if (!email || typeof email !== 'string') return '***';
  const parts = email.trim().split('@');
  if (parts.length !== 2) return '***';
  const [user, domain] = parts;
  const maskedUser = user.length > 2 ? `${user[0]}***${user[user.length - 1]}` : `${user[0]}***`;
  const domainParts = domain.split('.');
  const maskedDomain = domainParts.length > 1
    ? `${domainParts[0][0]}***.${domainParts.slice(1).join('.')}`
    : domain;
  return `${maskedUser}@${maskedDomain}`;
}

export function getEmailConfig(environment = process.env) {
  const sanitizeKey = (k) => (k || '').trim().replace(/^["']|["']$/g, '').trim();
  const apiKey = sanitizeKey(environment.RESEND_API_KEY);
  const brevoApiKey = sanitizeKey(environment.BREVO_API_KEY || environment.SENDINBLUE_API_KEY);
  const smtpHost = (environment.SMTP_HOST || environment.MAIL_HOST || '').trim();
  const smtpPort = Number(environment.SMTP_PORT || environment.MAIL_PORT || 587);
  const smtpUser = (environment.SMTP_USER || environment.SMTP_USERNAME || environment.MAIL_USERNAME || '').trim();
  const smtpPass = (environment.SMTP_PASS || environment.SMTP_PASSWORD || environment.MAIL_PASSWORD || '').trim();
  const smtpSecure = environment.SMTP_SECURE === 'true' || smtpPort === 465;

  const rawFromAddress = (environment.EMAIL_FROM || environment.MAIL_FROM_ADDRESS || 'onboarding@resend.dev').trim();

  let fromAddress = rawFromAddress;
  let extractedName = '';

  if (rawFromAddress.includes('<') && rawFromAddress.includes('>')) {
    const nameMatch = rawFromAddress.match(/^(.*?)\s*<([^>]+)>/);
    if (nameMatch) {
      extractedName = nameMatch[1].replace(/["']/g, '').trim();
      fromAddress = nameMatch[2].trim();
    }
  }

  const fromName = (environment.MAIL_FROM_NAME || extractedName || 'MENUSQR').trim();
  const preferredProvider = (environment.EMAIL_PROVIDER || '').trim().toLowerCase();

  // Detect whether running in a cloud container like Render or production
  const isRender = Boolean(
    environment.RENDER ||
    environment.RENDER_SERVICE_ID ||
    environment.RENDER_EXTERNAL_URL ||
    environment.RENDER_INSTANCE_ID ||
    environment.ON_RENDER ||
    process.env.RENDER ||
    process.env.RENDER_SERVICE_ID ||
    process.env.RENDER_EXTERNAL_URL ||
    process.env.RENDER_INSTANCE_ID ||
    process.env.ON_RENDER
  );
  const isProduction = environment.NODE_ENV === 'production' || process.env.NODE_ENV === 'production';

  let provider = 'none';
  if (preferredProvider === 'brevo' && brevoApiKey) {
    provider = 'brevo';
  } else if (preferredProvider === 'resend' && apiKey) {
    provider = 'resend';
  } else if (preferredProvider === 'smtp' && smtpHost) {
    provider = 'smtp';
  } else if (isRender || isProduction) {
    // CRITICAL: Render Free Tier permanently blocks outbound SMTP traffic on ports 25, 465, and 587!
    // Prioritize free HTTPS REST API providers (Brevo or Resend) on Port 443!
    if (brevoApiKey) {
      provider = 'brevo';
    } else if (apiKey) {
      provider = 'resend';
    } else if (smtpHost) {
      provider = 'smtp';
    }
  } else {
    // Non-Render / local development environment:
    if (brevoApiKey) {
      provider = 'brevo';
    } else if (smtpHost) {
      provider = 'smtp';
    } else if (apiKey) {
      provider = 'resend';
    }
  }

  return {
    apiKey,
    brevoApiKey,
    smtp: {
      host: smtpHost,
      port: smtpPort,
      user: smtpUser,
      pass: smtpPass,
      secure: smtpSecure,
    },
    fromAddress,
    fromName,
    brevoSender: (environment.BREVO_SENDER_EMAIL || environment.MAIL_FROM_ADDRESS || environment.SMTP_USER || '').trim(),
    formattedFrom: `"${fromName}" <${fromAddress}>`,
    configured: provider !== 'none',
    provider,
    isRender,
    isProduction,
  };
}

async function sendViaSmtp(config, message, label = 'transactional email', retryPort = null) {
  const isCloudHost = Boolean(
    config.isRender ||
    config.isProduction ||
    process.env.RENDER ||
    process.env.RENDER_SERVICE_ID ||
    process.env.ON_RENDER ||
    process.env.NODE_ENV === 'production'
  );
  const port = retryPort || config.smtp.port;
  const secure = retryPort ? (retryPort === 465) : config.smtp.secure;
  const timeouts = getSmtpTimeoutOptions();
  // On Render free tier, outbound SMTP is permanently blocked. Use aggressive timeout (2.5s) to avoid 10s-20s UI freezing!
  const connectionTimeout = isCloudHost ? Math.min(timeouts.connectionTimeout, 2500) : timeouts.connectionTimeout;

  try {
    const nodemailerModule = await import('nodemailer');
    const createTransport = nodemailerModule.default?.createTransport || nodemailerModule.createTransport;
    const transporter = createTransport({
      host: config.smtp.host,
      port,
      secure,
      auth: config.smtp.user ? {
        user: config.smtp.user,
        pass: config.smtp.pass,
      } : undefined,
      family: 4, // CRITICAL: Force IPv4 connection to prevent ENETUNREACH on Render/cloud containers
      connectionTimeout,
      greetingTimeout: isCloudHost ? 2500 : timeouts.greetingTimeout,
      socketTimeout: isCloudHost ? 5000 : timeouts.socketTimeout,
    });

    const info = await transporter.sendMail({
      from: config.formattedFrom,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });

    console.info(`[email] ${label} sent successfully to ${maskEmail(message.to)} via SMTP (port ${port}, Message ID: ${info.messageId || 'unknown'}).`);
    return {
      ok: true,
      provider: 'smtp',
      messageId: info.messageId,
    };
  } catch (err) {
    console.error(`[email] SMTP send failed for ${label} (port ${port}):`, err.message);

    // If running on Render/cloud host, ALL standard outbound SMTP ports (25, 465, 587) are blocked at the firewall level.
    // Retrying on 465 will only cause another 10s hang!
    const isNetworkBlocked = err.code === 'ENETUNREACH' || err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED' || err.message?.includes('timeout') || err.message?.includes('ENETUNREACH');
    if (isCloudHost && isNetworkBlocked) {
      return {
        ok: false,
        provider: 'smtp',
        error: `Render Free Tier blocks outbound SMTP traffic on ports 25, 465, and 587 (${err.message}). An HTTPS API provider (Resend or Brevo) on Port 443 must be used.`,
      };
    }

    // Off Render / Local: if port 587 failed and host is Gmail, retry immediately on port 465 (SSL/TLS direct)
    if (!isCloudHost && !retryPort && port === 587 && config.smtp.host === 'smtp.gmail.com') {
      console.warn(`[email] Retrying Gmail SMTP for ${label} on port 465 (SSL/TLS, family 4)...`);
      return sendViaSmtp(config, message, label, 465);
    }
    return {
      ok: false,
      provider: 'smtp',
      error: err.message,
    };
  }
}

async function sendViaResend(config, message, label = 'transactional email') {
  if (!config.apiKey) {
    return {
      ok: false,
      provider: 'resend',
      error: 'RESEND_API_KEY environment variable is missing.',
    };
  }

  const payload = JSON.stringify({
    from: config.formattedFrom,
    to: [message.to],
    subject: message.subject,
    html: message.html,
    text: message.text,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: payload,
      signal: controller.signal,
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      console.info(`[email] ${label} sent successfully to ${maskEmail(message.to)} via Resend HTTPS API (Message ID: ${data.id || 'unknown'}).`);
      return {
        ok: true,
        provider: 'resend',
        messageId: data.id || null,
      };
    }

    let errorMsg = `Resend API returned status ${res.status}`;
    if (res.status === 401) {
      const looksLikeResendKey = config.apiKey.startsWith('re_');
      if (!looksLikeResendKey) {
        errorMsg = `Resend API key is invalid (401). Your RESEND_API_KEY does not start with "re_". Please check Render environment settings and generate a valid key from https://resend.com/api-keys.`;
      } else {
        errorMsg = 'Resend API key is invalid (401). Please update RESEND_API_KEY in Render environment settings with an active key from https://resend.com/api-keys.';
      }
    } else if (res.status === 403 && data.message?.includes('testing emails')) {
      errorMsg = `Resend Free Domain Restriction (403): ${data.message} - To send OTPs to any email address, verify your domain in the Resend dashboard or configure BREVO_API_KEY.`;
    } else if (data.message) {
      errorMsg = `Resend API error (${res.status}): ${data.message}`;
    }

    console.warn(`[email] Resend API failed for ${label} to ${maskEmail(message.to)}: ${errorMsg}`);
    return {
      ok: false,
      provider: 'resend',
      status: res.status,
      error: errorMsg,
    };
  } catch (err) {
    const isTimeout = err.name === 'AbortError' || err.message?.includes('aborted');
    const errorMsg = isTimeout
      ? 'Resend API request timed out after 6 seconds.'
      : `Network error: ${err.message}`;
    console.error(`[email] Resend API network error for ${label}:`, errorMsg);
    return {
      ok: false,
      provider: 'resend',
      error: errorMsg,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function sendViaBrevo(config, message, label = 'transactional email') {
  if (!config.brevoApiKey) {
    return {
      ok: false,
      provider: 'brevo',
      error: 'BREVO_API_KEY environment variable is missing.',
    };
  }

  // Determine sender email for Brevo: prefer explicit brevoSender or non-resend email
  const senderEmail = (
    config.brevoSender && !config.brevoSender.includes('@resend.dev')
      ? config.brevoSender
      : (!config.fromAddress.includes('@resend.dev') ? config.fromAddress : 'support@menusqr.in')
  );

  const payload = JSON.stringify({
    sender: {
      name: config.fromName,
      email: senderEmail,
    },
    to: [{ email: message.to }],
    subject: message.subject,
    htmlContent: message.html,
    textContent: message.text,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': config.brevoApiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: payload,
      signal: controller.signal,
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok || res.status === 201) {
      console.info(`[email] ${label} sent successfully to ${maskEmail(message.to)} via Brevo HTTPS API (Message ID: ${data.messageId || 'unknown'}).`);
      return {
        ok: true,
        provider: 'brevo',
        messageId: data.messageId || null,
      };
    }

    let errorMsg = `Brevo API returned status ${res.status}`;
    if (res.status === 401) {
      errorMsg = 'Brevo API key is invalid (401). Please check BREVO_API_KEY in Render environment settings.';
    } else if (res.status === 400 && data.message?.toLowerCase().includes('sender')) {
      errorMsg = `Brevo API error (400): Sender email "${senderEmail}" is not verified in your Brevo account. Add it at https://app.brevo.com/senders or set BREVO_SENDER_EMAIL to your Brevo signup email.`;
    } else if (data.message) {
      errorMsg = `Brevo API error (${res.status}): ${data.message}`;
    }

    console.warn(`[email] Brevo API failed for ${label} to ${maskEmail(message.to)}: ${errorMsg}`);
    return {
      ok: false,
      provider: 'brevo',
      status: res.status,
      error: errorMsg,
    };
  } catch (err) {
    const isTimeout = err.name === 'AbortError' || err.message?.includes('aborted');
    const errorMsg = isTimeout
      ? 'Brevo API request timed out after 6 seconds.'
      : `Network error: ${err.message}`;
    console.error(`[email] Brevo API network error for ${label}:`, errorMsg);
    return {
      ok: false,
      provider: 'brevo',
      error: errorMsg,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function sendEmailDirectly(message, label = 'transactional email') {
  if (!isEmailServiceActive()) {
    console.info(`[email-service] Paused: Outbound email delivery is disabled (skipped "${label}" to ${maskEmail(message?.to)}). Set ENABLE_EMAIL_SERVICE=true to enable.`);
    return {
      ok: true,
      provider: 'disabled',
      messageId: `paused_${Date.now()}`,
      disabled: true,
      note: 'Outbound emails paused until ENABLE_EMAIL_SERVICE=true is configured.',
    };
  }

  const config = getEmailConfig();

  const hasSmtp = Boolean(config.smtp.host && (config.smtp.user || !config.smtp.secure));
  const hasResend = Boolean(config.apiKey);
  const hasBrevo = Boolean(config.brevoApiKey);

  if (!hasSmtp && !hasResend && !hasBrevo) {
    const errMsg = config.isRender
      ? 'No email transport configured. On Render Free Tier, SMTP is blocked; please set a valid RESEND_API_KEY or BREVO_API_KEY in Render environment variables.'
      : 'No email transport configured. Either RESEND_API_KEY, BREVO_API_KEY, or SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) must be provisioned.';
    console.error(`[email] Direct send failed for ${label}: ${errMsg}`);
    return {
      ok: false,
      provider: 'none',
      error: errMsg,
    };
  }

  // Determine priority order of providers to try
  const providersToTry = [];
  if (config.provider && config.provider !== 'none') {
    providersToTry.push(config.provider);
  }

  // Add remaining configured providers as automatic fallbacks
  const allConfigured = [];
  if (config.isRender || config.isProduction) {
    // In cloud / production, always prefer HTTPS REST APIs (Port 443) over blocked SMTP
    if (hasBrevo) allConfigured.push('brevo');
    if (hasResend) allConfigured.push('resend');
    if (hasSmtp) allConfigured.push('smtp');
  } else {
    if (hasBrevo) allConfigured.push('brevo');
    if (hasSmtp) allConfigured.push('smtp');
    if (hasResend) allConfigured.push('resend');
  }

  for (const p of allConfigured) {
    if (!providersToTry.includes(p)) {
      providersToTry.push(p);
    }
  }

  const errors = [];
  for (let i = 0; i < providersToTry.length; i++) {
    const providerName = providersToTry[i];
    if (i > 0) {
      console.warn(`[email] Attempting automatic fallback to ${providerName.toUpperCase()} for ${label}...`);
    }

    let res;
    if (providerName === 'smtp') {
      res = await sendViaSmtp(config, message, label);
    } else if (providerName === 'resend') {
      res = await sendViaResend(config, message, label);
    } else if (providerName === 'brevo') {
      res = await sendViaBrevo(config, message, label);
    }

    if (res && res.ok) {
      if (i > 0) {
        return {
          ...res,
          fallbackFrom: providersToTry[0],
        };
      }
      return res;
    }

    if (res && res.error) {
      errors.push(`${providerName.toUpperCase()}: ${res.error}`);
    }
  }

  const combinedError = errors.join(' | ');
  return {
    ok: false,
    provider: providersToTry[providersToTry.length - 1] || 'none',
    error: combinedError,
  };
}

// Durable Outbox Queueing Helper
export async function queueEmailOutbox({ notificationType, recipient, subject, html, text, idempotencyKey, payload = {} }) {
  if (!isEmailServiceActive()) {
    console.info(`[outbox] Paused: Outbox email queueing disabled (skipped "${notificationType}" for ${maskEmail(recipient)}).`);
    return {
      queued: true,
      disabled: true,
      outboxId: `paused_${Date.now()}`,
      status: 'PAUSED',
    };
  }

  const messageId = randomUUID();
  const idKey = idempotencyKey || `email_${notificationType}_${recipient}_${messageId}`;
  const config = getEmailConfig();
  const defaultProvider = config.provider === 'smtp' ? 'smtp' : 'resend';

  try {
    const res = await pool.query(`
      INSERT INTO email_outbox (id, notification_type, recipient, subject, payload, idempotency_key, status, attempt_count, max_attempts, next_retry_at, provider)
      VALUES ($1, $2, $3, $4, $5, $6, 'QUEUED', 0, 5, NOW(), $7)
      ON CONFLICT (idempotency_key) DO UPDATE SET updated_at = NOW()
      RETURNING id, status, provider_message_id
    `, [
      messageId,
      notificationType,
      recipient.trim().toLowerCase(),
      subject,
      JSON.stringify({ html, text, ...payload }),
      idKey,
      defaultProvider,
    ]);

    // Immediately trigger outbox processing in background
    setImmediate(() => { processEmailOutboxQueue().catch(() => {}); });

    return {
      queued: true,
      outboxId: res.rows[0].id,
      status: res.rows[0].status,
    };
  } catch (error) {
    console.error(`[outbox] Failed to queue email outbox job for ${notificationType} to ${maskEmail(recipient)}:`, error.message);
    return {
      queued: false,
      error: error.message,
    };
  }
}

// Persistent Outbox Queue Worker
export async function processEmailOutboxQueue() {
  if (!isEmailServiceActive()) {
    return { processedCount: 0, disabled: true };
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Fetch batch of up to 10 pending or stuck jobs using FOR UPDATE SKIP LOCKED
    const res = await client.query(`
      SELECT * FROM email_outbox
      WHERE (
        status = 'QUEUED'
        OR (status = 'PROCESSING' AND updated_at <= NOW() - INTERVAL '5 minutes')
      )
        AND next_retry_at <= NOW()
        AND attempt_count < max_attempts
      ORDER BY created_at ASC
      LIMIT 10
      FOR UPDATE SKIP LOCKED
    `);

    if (res.rows.length === 0) {
      await client.query('COMMIT');
      return { processedCount: 0 };
    }

    const jobs = res.rows;

    // Mark batch as PROCESSING
    const jobIds = jobs.map((j) => j.id);
    await client.query(`
      UPDATE email_outbox
      SET status = 'PROCESSING', updated_at = NOW()
      WHERE id = ANY($1::text[])
    `, [jobIds]);

    await client.query('COMMIT');

    let processedCount = 0;

    for (const job of jobs) {
      const message = {
        to: job.recipient,
        subject: job.subject,
        html: job.payload?.html || '',
        text: job.payload?.text || '',
      };

      const result = await sendEmailDirectly(message, `outbox job ${job.notification_type}`);

      const updateClient = await pool.connect();
      try {
        if (result.ok) {
          await updateClient.query(`
            UPDATE email_outbox
            SET status = 'PROVIDER_ACCEPTED',
                attempt_count = attempt_count + 1,
                provider_message_id = $1,
                last_error = NULL,
                updated_at = NOW()
            WHERE id = $2
          `, [result.messageId, job.id]);
        } else {
          const attempt = job.attempt_count + 1;
          const backoffSec = Math.pow(2, attempt) * 15; // 30s, 60s, 120s, 240s...
          const nextRetry = new Date(Date.now() + backoffSec * 1000);
          const finalStatus = attempt >= job.max_attempts ? 'FAILED' : 'QUEUED';

          await updateClient.query(`
            UPDATE email_outbox
            SET status = $1,
                attempt_count = $2,
                next_retry_at = $3,
                last_error = $4,
                updated_at = NOW()
            WHERE id = $5
          `, [finalStatus, attempt, nextRetry, result.error, job.id]);
        }
      } finally {
        updateClient.release();
      }
      processedCount++;
    }

    return { processedCount };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[outbox] Worker error processing outbox queue:', err.message);
    return { error: err.message };
  } finally {
    client.release();
  }
}

// Background Cron Poller for Outbox Worker (runs every 30 seconds)
let workerInterval = null;
export function startOutboxWorker(intervalMs = 30_000) {
  if (!isEmailServiceActive()) {
    console.info('[email-service] Background email worker is paused (ENABLE_EMAIL_SERVICE is not true).');
    return;
  }
  if (workerInterval) return;
  workerInterval = setInterval(() => {
    processEmailOutboxQueue().catch((err) => {
      console.error('[outbox worker interval error]', err.message);
    });
  }, intervalMs);
}

// CORPORATE TRANSACTIONAL EMAIL TEMPLATE WRAPPER
function buildCorporateEmailHtml({ title, bodyHtml }) {
  const currentYear = new Date().getFullYear();
  const baseUrl = process.env.APP_URL || 'https://menusqr.in';
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #111827;">
      
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fafafa; padding: 40px 15px;">
        <tr>
          <td align="center">
            
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border-radius: 8px; border: 1px solid #eaeaea; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);">
              
              <!-- Brand Header -->
              <tr>
                <td style="padding: 24px 32px; border-bottom: 1px solid #eaeaea; text-align: left;">
                  <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 20px; font-weight: 800; color: #111827; letter-spacing: -0.5px;">
                    MENUSQR
                  </span>
                </td>
              </tr>

              <!-- Body Content -->
              <tr>
                <td style="padding: 32px; background-color: #ffffff; text-align: left;">
                  ${bodyHtml}
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #fafafa; padding: 24px 32px; border-top: 1px solid #eaeaea; text-align: left;">
                  <p style="margin: 0; font-size: 12px; color: #888888;">
                    &copy; ${currentYear} MENUSQR Technologies. &bull; <a href="${baseUrl}" style="color: #666666; text-decoration: none;">menusqr.in</a>
                  </p>
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>

    </body>
    </html>
  `;
}

// ===========================================================================
// TRANSACTIONAL EMAIL IMPLEMENTATIONS
// ===========================================================================

// 1. CLIENT LOGIN OTP EMAIL (DIRECT & AWAITED)
export async function sendLoginOtpEmail({ email, otp, ownerName }) {
  if (!email) return { ok: false, error: 'Recipient email is required.' };
  console.info(`[auth] Client login OTP for ${maskEmail(email)}: ${otp}`);
  if (!isEmailServiceActive()) {
    return { ok: true, disabled: true, messageId: 'login_otp_paused' };
  }
  const name = ownerName ? ownerName.trim() : 'Partner';

  const bodyHtml = `
    <h1 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #111827;">Security Verification Code</h1>
    
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #374151;">
      Hello <strong>${name}</strong>, a sign-in attempt was initiated for your MENUSQR portal account.
    </p>

    <div style="margin: 24px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; text-align: center;">
      <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b;">Your 6-Digit OTP Code</p>
      <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; color: #0f172a; letter-spacing: 8px; margin: 8px 0;">${otp}</div>
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #94a3b8;">This code will expire in 5 minutes.</p>
    </div>

    <div style="margin: 0 0 20px 0; padding: 12px 16px; background-color: #fffbeb; border-left: 4px solid #d97706; border-radius: 0 4px 4px 0;">
      <p style="margin: 0; font-size: 12px; color: #92400e; line-height: 1.5;">
        <strong>Security Notice:</strong> Never share this code with anyone. MENUSQR staff will never call or message you asking for your verification code.
      </p>
    </div>
  `;

  return sendEmailDirectly({
    to: email,
    subject: `${otp} is your MENUSQR login verification code`,
    html: buildCorporateEmailHtml({ title: 'Login OTP Code', bodyHtml }),
    text: `Your MENUSQR 2-step verification code is: ${otp}. Valid for 5 minutes.`,
  }, `client login OTP for ${maskEmail(email)}`);
}

// 2. ADMIN LOGIN OTP EMAIL (DIRECT & AWAITED)
export async function sendAdminLoginOtpEmail({ email, otp }) {
  if (!email) return { ok: false, error: 'Recipient email is required.' };
  console.info(`[admin-auth] Admin sign-in OTP for ${maskEmail(email)}: ${otp}`);
  if (!isEmailServiceActive()) {
    return { ok: true, disabled: true, messageId: 'admin_otp_paused' };
  }

  const bodyHtml = `
    <h1 style="margin: 0 0 12px; font-size: 21px; line-height: 1.3; font-weight: 700; color: #17231e;">Admin sign-in code</h1>
    <p style="margin: 0 0 22px; font-size: 14px; line-height: 1.65; color: #53615a;">
      Use this one-time code to sign in to the MENUSQR administration portal. It expires in five minutes.
    </p>
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 22px; background: #f5f8f6; border: 1px solid #dbe5de; border-radius: 8px;">
      <tr><td align="center" style="padding: 24px 16px 20px;">
        <p style="margin: 0 0 10px; font-size: 11px; font-weight: 700; color: #6e7e74; text-transform: uppercase;">Your verification code</p>
        <p style="margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 34px; line-height: 1.2; font-weight: 700; letter-spacing: 7px; color: #17231e;">${otp}</p>
      </td></tr>
    </table>
  `;

  return sendEmailDirectly({
    to: email,
    subject: 'Your MENUSQR admin sign-in code',
    html: buildCorporateEmailHtml({ title: 'Admin Sign-In Code', bodyHtml }),
    text: `Your MENUSQR admin sign-in code is ${otp}. It expires in five minutes.`,
  }, `admin sign-in OTP for ${maskEmail(email)}`);
}

// 3. PASSWORD RESET OTP EMAIL (DIRECT & AWAITED)
export async function sendPasswordResetOtpEmail({ email, otp, ownerName }) {
  if (!email) return { ok: false, error: 'Recipient email is required.' };
  console.info(`[password-reset] Password reset OTP for ${maskEmail(email)}: ${otp}`);
  if (!isEmailServiceActive()) {
    return { ok: true, disabled: true, messageId: 'password_reset_paused' };
  }
  const name = ownerName ? ownerName.trim() : 'Partner';

  const bodyHtml = `
    <h1 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #111827;">Password Reset Request</h1>
    
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #374151;">
      Hello <strong>${name}</strong>, we received a request to reset the password for your MENUSQR portal account (<span style="font-family: monospace;">${email}</span>).
    </p>

    <div style="margin: 24px 0; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 24px; text-align: center;">
      <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569;">Reset Verification Code</p>
      <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; color: #2563eb; letter-spacing: 8px; margin: 8px 0;">${otp}</div>
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b;">This code will expire in 10 minutes.</p>
    </div>
  `;

  return sendEmailDirectly({
    to: email,
    subject: `Password Reset Code: ${otp} - MENUSQR`,
    html: buildCorporateEmailHtml({ title: 'Password Reset Request', bodyHtml }),
    text: `Your MENUSQR password reset code is: ${otp}. Valid for 10 minutes.`,
  }, `password reset OTP for ${maskEmail(email)}`);
}

// 4. CLIENT WELCOME EMAIL (QUEUED IN OUTBOX)
export async function sendClientWelcomeEmail(client) {
  const recipient = client.email?.trim();
  if (!recipient) return { ok: false, error: 'Recipient email is required.' };

  const name = client.ownerName?.trim() || client.businessName;
  const baseUrl = process.env.APP_URL || 'https://menusqr.in';
  const loginUrl = `${baseUrl}/admin/login?mode=restaurant&email=${encodeURIComponent(recipient)}`;
  const setPasswordUrl = `${baseUrl}/admin/login?mode=restaurant&action=forgot&email=${encodeURIComponent(recipient)}`;

  const bodyHtml = `
    <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #111827;">Account Activated &mdash; Welcome to MENUSQR</h1>
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #374151;">Hello <strong>${name}</strong>,</p>
    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #374151;">
      Your digital restaurant account for <strong>${client.businessName}</strong> has been provisioned and is live.
    </p>
    <div style="margin: 28px 0; text-align: left;">
      <a href="${loginUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-right: 12px;">Sign In to Client Portal &rarr;</a>
      <a href="${setPasswordUrl}" style="display: inline-block; background-color: #f1f5f9; color: #0f172a; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 6px; text-decoration: none; border: 1px solid #cbd5e1;">Set Password</a>
    </div>
    <p style="margin: 16px 0 0 0; font-size: 13px; line-height: 1.5; color: #64748b;">
      You can sign in using an instant one-time security code (OTP) sent to this email, or set a permanent password anytime via the Set Password link.
    </p>
  `;

  return queueEmailOutbox({
    notificationType: 'CLIENT_WELCOME',
    recipient,
    subject: `Account Credentials & Confirmation - ${client.businessName}`,
    html: buildCorporateEmailHtml({ title: `Account Activated - ${client.businessName}`, bodyHtml }),
    text: `Welcome to MENUSQR. Restaurant: ${client.businessName}. Login URL: ${loginUrl}. Set Password URL: ${setPasswordUrl}.`,
    idempotencyKey: `welcome_${client.id || recipient}`,
  });
}

// 5. ACCOUNT ACTIVATION EMAIL (QUEUED IN OUTBOX)
export async function sendActivationEmail({ email, ownerName, businessName, plan, activationToken, password }) {
  if (!email) return { ok: false, error: 'Recipient email is required.' };

  const name = ownerName?.trim() || 'Partner';
  const baseUrl = process.env.APP_URL || 'https://menusqr.in';
  const loginUrl = `${baseUrl}/admin/login?mode=restaurant&email=${encodeURIComponent(email)}`;
  const setPasswordUrl = `${baseUrl}/admin/login?mode=restaurant&action=forgot&email=${encodeURIComponent(email)}`;

  const bodyHtml = `
    <h1 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #111827;">Workspace successfully provisioned</h1>
    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #4b5563;">
      Hello ${name},<br>Your digital menu workspace for <strong>${businessName || 'your restaurant'}</strong> is active.
    </p>
    <div style="margin: 28px 0; text-align: left;">
      <a href="${loginUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 13px; font-weight: 600; padding: 10px 24px; border-radius: 6px; text-decoration: none; margin-right: 12px;">Access Dashboard &rarr;</a>
      <a href="${setPasswordUrl}" style="display: inline-block; background-color: #f1f5f9; color: #0f172a; font-size: 13px; font-weight: 600; padding: 10px 24px; border-radius: 6px; text-decoration: none; border: 1px solid #cbd5e1;">Set / Reset Password</a>
    </div>
    <p style="margin: 16px 0 0 0; font-size: 13px; line-height: 1.5; color: #64748b;">
      You can sign in directly using email OTP or set your permanent password anytime using the link above.
    </p>
  `;

  return queueEmailOutbox({
    notificationType: 'ACCOUNT_ACTIVATION',
    recipient: email,
    subject: `Your MENUSQR workspace is ready - ${businessName || 'Restaurant'}`,
    html: buildCorporateEmailHtml({ title: 'Workspace Ready', bodyHtml }),
    text: `Your MENUSQR workspace is ready. Log in at: ${loginUrl}. Set password at: ${setPasswordUrl}.`,
    idempotencyKey: `activation_${email}_${businessName}`,
  });
}

// 6. PAYMENT SUCCESS EMAIL (QUEUED IN OUTBOX)
export async function sendPaymentSuccessEmail({ email, businessName, plan, amount, expiresAt }) {
  if (!email) return { ok: false, error: 'Recipient email is required.' };
  const formattedDate = new Date(expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const bodyHtml = `
    <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #111827;">Payment Receipt & Confirmation</h1>
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #374151;">
      Thank you for your payment. Your subscription for <strong>${businessName}</strong> (Plan: ${plan}, Amount: ₹${amount}) is active until <strong>${formattedDate}</strong>.
    </p>
  `;

  return queueEmailOutbox({
    notificationType: 'PAYMENT_SUCCESS',
    recipient: email,
    subject: `Payment Receipt: ₹${amount} - ${businessName} (MENUSQR)`,
    html: buildCorporateEmailHtml({ title: 'Payment Receipt', bodyHtml }),
    text: `Payment Successful! Plan: ${plan}, Amount: ₹${amount}, Active Until: ${formattedDate}.`,
    idempotencyKey: `payment_${email}_${amount}_${new Date(expiresAt).getTime()}`,
  });
}

// 7. SUBSCRIPTION WARNING EMAIL (QUEUED IN OUTBOX)
export async function sendSubscriptionWarningEmail({ email, businessName, daysRemaining, expiresAt }) {
  if (!email) return { ok: false, error: 'Recipient email is required.' };
  const formattedDate = new Date(expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const bodyHtml = `
    <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #dc2626;">Subscription Expiring Soon (${daysRemaining} Days Remaining)</h1>
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #374151;">
      Your MENUSQR subscription for <strong>${businessName}</strong> expires on <strong>${formattedDate}</strong>.
    </p>
  `;

  return queueEmailOutbox({
    notificationType: `SUB_WARNING_${daysRemaining}D`,
    recipient: email,
    subject: `Action Required: Subscription Expiring in ${daysRemaining} Days - ${businessName}`,
    html: buildCorporateEmailHtml({ title: 'Subscription Renewal Notice', bodyHtml }),
    text: `Your subscription for ${businessName} expires in ${daysRemaining} days.`,
    idempotencyKey: `sub_warn_${email}_${daysRemaining}d_${new Date().toISOString().split('T')[0]}`,
  });
}

// 8. SUBSCRIPTION EXPIRED EMAIL (QUEUED IN OUTBOX)
export async function sendSubscriptionExpiredEmail({ email, businessName }) {
  if (!email) return { ok: false, error: 'Recipient email is required.' };

  const bodyHtml = `
    <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #991b1b;">Subscription Expired &mdash; QR Service Blocked</h1>
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #374151;">
      The MENUSQR subscription for <strong>${businessName}</strong> has expired. Log in to renew and unblock your menu service instantly.
    </p>
  `;

  return queueEmailOutbox({
    notificationType: 'SUB_EXPIRED',
    recipient: email,
    subject: `Subscription Expired - ${businessName} Menu Suspended`,
    html: buildCorporateEmailHtml({ title: 'Subscription Expired', bodyHtml }),
    text: `Your MENUSQR subscription for ${businessName} has expired.`,
    idempotencyKey: `sub_expired_${email}_${new Date().toISOString().split('T')[0]}`,
  });
}

// 9. RENEWAL EMAIL (QUEUED IN OUTBOX)
export async function sendRenewalEmail({ email, businessName, expiresAt }) {
  if (!email) return { ok: false, error: 'Recipient email is required.' };
  const formattedDate = new Date(expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const bodyHtml = `
    <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #059669;">Subscription Successfully Renewed</h1>
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #374151;">
      Your MENUSQR subscription for <strong>${businessName}</strong> has been renewed until <strong>${formattedDate}</strong>.
    </p>
  `;

  return queueEmailOutbox({
    notificationType: 'RENEWAL',
    recipient: email,
    subject: `Subscription Renewed - ${businessName}`,
    html: buildCorporateEmailHtml({ title: 'Subscription Renewed', bodyHtml }),
    text: `Subscription for ${businessName} renewed until ${formattedDate}.`,
    idempotencyKey: `renewal_${email}_${new Date(expiresAt).getTime()}`,
  });
}

// 10. QR READY EMAIL (QUEUED IN OUTBOX)
export async function sendQrReadyEmail({ email, businessName, tagline, menuSlug, qrUrl, qrImageUrl, downloadUrl }) {
  if (!email) return { ok: false, error: 'Recipient email is required.' };

  const bodyHtml = `
    <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #111827;">Your Permanent Table QR Placard Artwork is Ready! 📲</h1>
    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #4b5563;">
      We have generated your custom physical table standee artwork for <strong>${businessName || 'Your Restaurant'}</strong>.
    </p>
  `;

  return queueEmailOutbox({
    notificationType: 'QR_READY',
    recipient: email,
    subject: `📲 Table Placard Artwork & Permanent QR Ready - ${businessName || 'Restaurant'}`,
    html: buildCorporateEmailHtml({ title: 'Table QR Artwork Ready', bodyHtml }),
    text: `Permanent table QR artwork for ${businessName} is ready.`,
    idempotencyKey: `qr_ready_${email}_${menuSlug || 'default'}`,
  });
}

// 11. MARKETING CAMPAIGN EMAIL (QUEUED IN OUTBOX)
export async function sendMarketingCampaignEmail({ email, restaurantName, ownerName, offerPrice = '3199' }) {
  if (!email) return { ok: false, error: 'Recipient email is required.' };

  const bodyHtml = `
    <h1 style="color: #111827; font-size: 22px; font-weight: 900;">Upgrade ${restaurantName || 'your restaurant'} to an Interactive QR Menu</h1>
    <p style="font-size: 14px; line-height: 1.6; color: #374151;">Claim your special launch offer for ₹${offerPrice}/year.</p>
  `;

  return queueEmailOutbox({
    notificationType: 'MARKETING',
    recipient: email,
    subject: `🔥 Special Launch Offer: Transform ${restaurantName || 'Your Restaurant'}'s Menu with MENUSQR`,
    html: buildCorporateEmailHtml({ title: 'Upgrade to MENUSQR', bodyHtml }),
    text: `Upgrade to MENUSQR for ₹${offerPrice}/year.`,
    idempotencyKey: `mktg_${email}_${offerPrice}`,
  });
}
