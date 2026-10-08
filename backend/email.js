import https from 'https';
import nodemailer from 'nodemailer';

let smtpTransporter = null;

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

function getSmtpTransporter() {
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASSWORD?.trim();

  let defaultHost = 'smtp.hostinger.com';
  if (smtpUser && smtpUser.toLowerCase().endsWith('@gmail.com')) {
    defaultHost = 'smtp.gmail.com';
  }

  const smtpHost = process.env.SMTP_HOST || defaultHost;
  const smtpPort = Number(process.env.SMTP_PORT) || 587;

  if (smtpUser && smtpPass) {
    if (!smtpTransporter) {
      smtpTransporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        family: 4, // Force IPv4 to avoid Render ENETUNREACH errors
        ...getSmtpTimeoutOptions(),
      });
    }
    return smtpTransporter;
  }
  return null;
}

async function sendEmail(message, label) {
  const transporter = getSmtpTransporter();
  const fromAddress = process.env.MAIL_FROM_ADDRESS || process.env.SMTP_USER || 'no-reply@menusqr.in';
  const fromName = process.env.MAIL_FROM_NAME || 'MENUSQR';
  let smtpError;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text
      });
      console.info(`[email] ${label} sent successfully via SMTP.`);
      return;
    } catch (err) {
      smtpError = err;
      console.error(`[email] Error sending ${label} via SMTP:`, err.message);
    }
  }

  if (!process.env.BREVO_API_KEY) {
    throw new Error(smtpError ? 'Email delivery failed.' : 'No email delivery provider is configured.');
  }
  
  const senderEmail = process.env.MAIL_FROM_ADDRESS?.trim() || process.env.SMTP_USER?.trim() || 'qevnaro@gmail.com';

  const payload = JSON.stringify({
    sender: { email: senderEmail, name: 'MENUSQR' },
    to: [{ email: message.to }],
    subject: message.subject,
    htmlContent: message.html,
    textContent: message.text
  });

  const options = {
    hostname: 'api.brevo.com',
    path: '/v3/smtp/email',
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY.trim(),
      'content-type': 'application/json',
      'content-length': Buffer.byteLength(payload)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      res.resume();
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.info(`[email] ${label} accepted by Brevo.`);
          resolve();
        } else {
          console.error(`[email] Could not send ${label} (status: ${res.statusCode}).`);
          reject(new Error('Email provider rejected the message.'));
        }
      });
    });
    
    req.on('error', (e) => {
      console.error(`[email] Request error for ${label}:`, e.message);
      reject(new Error('Email provider request failed.'));
    });

    req.setTimeout(Number(process.env.BREVO_REQUEST_TIMEOUT_MS) || 15_000, () => {
      req.destroy(new Error('Email provider request timed out.'));
    });
    
    req.write(payload);
    req.end();
  });
}

// CORPORATE TRANSACTIONAL EMAIL WRAPPER (Minimal Aesthetic)
function buildCorporateEmailHtml({ title, bodyHtml }) {
  const currentYear = new Date().getFullYear();
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
              
              <!-- Minimal Brand Header -->
              <tr>
                <td style="padding: 24px 32px; border-bottom: 1px solid #eaeaea; text-align: left;">
                  <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 20px; font-weight: 800; color: #111827; letter-spacing: -0.5px;">
                    MENUSQR
                  </span>
                </td>
              </tr>

              <!-- Main Body Content -->
              <tr>
                <td style="padding: 32px; background-color: #ffffff; text-align: left;">
                  ${bodyHtml}
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #fafafa; padding: 24px 32px; border-top: 1px solid #eaeaea; text-align: left;">
                  <p style="margin: 0; font-size: 12px; color: #888888;">
                    &copy; ${currentYear} MENUSQR Technologies. &bull; <a href="${process.env.APP_URL || 'https://menusqr.in'}" style="color: #666666; text-decoration: none;">menusqr.in</a>
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

export async function sendClientWelcomeEmail(client) {
  const recipient = client.email.trim();
  if (!recipient) return;

  const name = client.ownerName?.trim() || client.businessName;
  const loginUrl = `${process.env.APP_URL || 'https://menusqr.in'}/admin/login?mode=restaurant`;

  const bodyHtml = `
    <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #111827;">Account Activated &mdash; Welcome to MENUSQR</h1>
    
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #374151;">
      Hello <strong>${name}</strong>,
    </p>
    
    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #374151;">
      Your digital restaurant account for <strong>${client.businessName}</strong> has been provisioned and is now live. Below are your official account details and login credentials:
    </p>

    <!-- Account Details Table -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 24px 0; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px;">
      <tr>
        <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="font-size: 13px; font-weight: 600; color: #6b7280; width: 140px;">Restaurant Name:</td>
              <td style="font-size: 14px; font-weight: 700; color: #111827;">${client.businessName}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="font-size: 13px; font-weight: 600; color: #6b7280; width: 140px;">Login Portal URL:</td>
              <td style="font-size: 13px; font-weight: 600; color: #2563eb;"><a href="${loginUrl}" style="color: #2563eb; text-decoration: underline;">${loginUrl}</a></td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="font-size: 13px; font-weight: 600; color: #6b7280; width: 140px;">Account Email ID:</td>
              <td style="font-size: 14px; font-weight: 700; font-family: monospace; color: #111827;">${recipient}</td>
            </tr>
          </table>
        </td>
      </tr>
      ${client.password ? `
      <tr>
        <td style="padding: 16px;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="font-size: 13px; font-weight: 600; color: #6b7280; width: 140px;">Password:</td>
              <td style="font-size: 14px; font-weight: 700; font-family: monospace; color: #059669; background: #ecfdf5; padding: 4px 8px; border-radius: 4px; display: inline-block;">${client.password}</td>
            </tr>
          </table>
        </td>
      </tr>
      ` : ''}
    </table>

    <!-- Call to Action Button -->
    <div style="margin: 28px 0; text-align: left;">
      <a href="${loginUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 6px; text-decoration: none;">${client.password ? 'Sign In to Client Portal &rarr;' : 'Activate Account &rarr;'}</a>
    </div>

    <!-- Subscription Summary Box -->
    <div style="margin: 0 0 24px 0; padding: 16px; background-color: #f8fafc; border-left: 4px solid #0284c7; border-radius: 0 6px 6px 0;">
      <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #0369a1;">Subscription Plan: ${client.plan || 'YEARLY PREMIUM'}</p>
      <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.5;">Billing Cycle: ${client.billingCycle || 'Yearly'} &bull; Status: Active</p>
    </div>

    <p style="margin: 0; font-size: 13px; color: #6b7280; line-height: 1.5;">
      If you did not request this account creation or have any technical inquiries, please contact our platform administrator.
    </p>
  `;

  await sendEmail({
    to: recipient,
    subject: `Account Credentials & Confirmation - ${client.businessName}`,
    html: buildCorporateEmailHtml({ title: `Account Activated - ${client.businessName}`, bodyHtml }),
    text: `Welcome to MENUSQR. Restaurant: ${client.businessName}. Login URL: ${loginUrl}. Email: ${recipient}. Password: ${client.password || 'Set during signup'}.`
  }, `welcome email for ${client.businessName}`);
}

export async function sendActivationEmail({ email, ownerName, businessName, plan, activationToken, password }) {
  if (!email) return;

  const name = ownerName?.trim() || 'Partner';
  const baseUrl = process.env.APP_URL || 'https://menusqr.in';
  const restaurantLoginUrl = `${baseUrl}/admin/login?mode=restaurant`;
  
  // Direct to login page if they already have a password set
  const loginUrl = (activationToken && !password)
    ? `${baseUrl}/#/auth/activate?token=${encodeURIComponent(activationToken)}`
    : restaurantLoginUrl;
  
  const ctaText = (activationToken && !password) ? 'Complete Account Setup' : 'Sign in to Dashboard';

  const bodyHtml = `
    <h1 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #111827; letter-spacing: -0.5px;">Workspace successfully provisioned</h1>
    
    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #4b5563;">
      Hello ${name},<br><br>
      Your digital menu workspace for <strong>${businessName || 'your restaurant'}</strong> is now active. Please use the credentials below to access your dashboard.
    </p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
      <p style="margin: 0 0 12px 0; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Login Details</p>
      
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #64748b; width: 100px;">Portal URL:</td>
          <td style="padding: 6px 0; font-size: 13px; font-weight: 500; color: #111827;">${restaurantLoginUrl}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Email:</td>
          <td style="padding: 6px 0; font-size: 13px; font-weight: 500; color: #111827;">${email}</td>
        </tr>
        ${password ? `
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Password:</td>
          <td style="padding: 6px 0; font-size: 13px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-weight: 600; color: #0f172a;">${password}</td>
        </tr>
        ` : ''}
      </table>
    </div>

    <div style="margin: 32px 0;">
      <a href="${loginUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 13px; font-weight: 500; padding: 10px 24px; border-radius: 6px; text-decoration: none;">${ctaText}</a>
    </div>

    <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
      If you require assistance, please reply to this email to contact our support team.
    </p>
  `;

  await sendEmail({
    to: email,
    subject: `Your MENUSQR workspace is ready - ${businessName || 'Restaurant'}`,
    html: buildCorporateEmailHtml({ title: 'Workspace Ready', bodyHtml }),
    text: `Your MENUSQR workspace is ready. Log in at: ${loginUrl}. Email: ${email}${password ? `, Password: ${password}` : ''}`
  }, `activation/welcome email for ${email}`);
}

export async function sendLoginOtpEmail({ email, otp, ownerName }) {
  if (!email) return;
  const name = ownerName ? ownerName.trim() : 'Partner';

  const bodyHtml = `
    <h1 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #111827;">Security Verification Code</h1>
    
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #374151;">
      Hello <strong>${name}</strong>, a sign-in attempt was initiated for your MENUSQR portal account.
    </p>

    <!-- OTP Box -->
    <div style="margin: 24px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; text-align: center;">
      <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; tracking: 1px; color: #64748b;">Your 6-Digit OTP Code</p>
      <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; color: #0f172a; letter-spacing: 8px; margin: 8px 0;">${otp}</div>
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #94a3b8;">This code will expire in 5 minutes.</p>
    </div>

    <div style="margin: 0 0 20px 0; padding: 12px 16px; background-color: #fffbeb; border-left: 4px solid #d97706; border-radius: 0 4px 4px 0;">
      <p style="margin: 0; font-size: 12px; color: #92400e; line-height: 1.5;">
        <strong>Security Notice:</strong> Never share this code with anyone. MENUSQR staff will never call or message you asking for your verification code.
      </p>
    </div>

    <p style="margin: 0; font-size: 12px; color: #9ca3af; line-height: 1.5;">
      If you did not initiate this sign-in request, please secure your account immediately by changing your password.
    </p>
  `;

  await sendEmail({
    to: email,
    subject: `${otp} is your MENUSQR login verification code`,
    html: buildCorporateEmailHtml({ title: 'Login OTP Code', bodyHtml }),
    text: `Your MENUSQR 2-step verification code is: ${otp}. Valid for 5 minutes.`
  }, `login OTP email for ${email}`);
}

export async function sendAdminLoginOtpEmail({ email, otp }) {
  if (!email) return;

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
    <p style="margin: 0; padding: 13px 15px; background: #fff8e8; border-left: 3px solid #bf7b18; font-size: 12px; line-height: 1.55; color: #6f511b;">
      MENUSQR will never ask you to share this code. If you did not request it, you can safely ignore this email.
    </p>
  `;

  await sendEmail({
    to: email,
    subject: 'Your MENUSQR admin sign-in code',
    html: buildCorporateEmailHtml({ title: 'Admin Sign-In Code', bodyHtml }),
    text: `Your MENUSQR admin sign-in code is ${otp}. It expires in five minutes. Never share this code.`
  }, `admin sign-in OTP email for ${email}`);
}

export async function sendPasswordResetOtpEmail({ email, otp, ownerName }) {
  if (!email) return;
  const name = ownerName ? ownerName.trim() : 'Partner';

  const bodyHtml = `
    <h1 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #111827;">Password Reset Request</h1>
    
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #374151;">
      Hello <strong>${name}</strong>, we received a request to reset the password for your MENUSQR portal account (<span style="font-family: monospace;">${email}</span>).
    </p>

    <!-- Reset OTP Box -->
    <div style="margin: 24px 0; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 24px; text-align: center;">
      <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569;">Reset Verification Code</p>
      <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; color: #2563eb; letter-spacing: 8px; margin: 8px 0;">${otp}</div>
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b;">This code will expire in 10 minutes.</p>
    </div>

    <p style="margin: 0; font-size: 12px; color: #6b7280; line-height: 1.5;">
      If you did not request a password reset, you can safely disregard this message. Your password will remain unchanged.
    </p>
  `;

  await sendEmail({
    to: email,
    subject: `Password Reset Code: ${otp} - MENUSQR`,
    html: buildCorporateEmailHtml({ title: 'Password Reset Request', bodyHtml }),
    text: `Your MENUSQR password reset code is: ${otp}. Valid for 10 minutes.`
  }, `password reset OTP email for ${email}`);
}

export async function sendPaymentSuccessEmail({ email, businessName, plan, amount, expiresAt }) {
  if (!email) return;
  const formattedDate = new Date(expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const bodyHtml = `
    <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #111827;">Payment Receipt & Confirmation</h1>
    
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #374151;">
      Thank you for your payment. Your subscription for <strong>${businessName}</strong> has been successfully processed and activated.
    </p>

    <!-- Receipt Details Table -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 24px 0; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px;">
      <tr>
        <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="font-size: 13px; color: #6b7280;">Subscription Plan:</td>
              <td style="font-size: 14px; font-weight: 700; color: #111827; text-align: right;">${plan}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="font-size: 13px; color: #6b7280;">Amount Paid:</td>
              <td style="font-size: 16px; font-weight: 800; color: #059669; text-align: right;">₹${amount}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px 16px;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="font-size: 13px; color: #6b7280;">Subscription Active Until:</td>
              <td style="font-size: 14px; font-weight: 700; color: #111827; text-align: right;">${formattedDate}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <div style="padding: 14px 16px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; margin: 0 0 20px 0;">
      <p style="margin: 0; font-size: 13px; color: #166534; line-height: 1.5;">
        <strong>Service Active:</strong> Your permanent QR code and digital menu service remain 100% active.
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Payment Receipt: ₹${amount} - ${businessName} (MENUSQR)`,
    html: buildCorporateEmailHtml({ title: 'Payment Receipt', bodyHtml }),
    text: `Payment Successful! Plan: ${plan}, Amount: ₹${amount}, Active Until: ${formattedDate}.`
  }, `payment success email for ${businessName}`);
}

export async function sendSubscriptionWarningEmail({ email, businessName, daysRemaining, expiresAt }) {
  if (!email) return;
  const formattedDate = new Date(expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const renewUrl = `${process.env.APP_URL || 'https://menusqr.in'}/#/app/subscription`;

  const bodyHtml = `
    <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #dc2626;">Subscription Expiring Soon (${daysRemaining} Days Remaining)</h1>
    
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #374151;">
      This is a reminder that the MENUSQR subscription for <strong>${businessName}</strong> is scheduled to expire in <strong>${daysRemaining} days</strong> on <strong>${formattedDate}</strong>.
    </p>

    <div style="margin: 0 0 24px 0; padding: 16px; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px;">
      <p style="margin: 0; font-size: 13px; color: #991b1b; line-height: 1.5;">
        Please renew your subscription prior to the expiration date to ensure uninterrupted customer QR menu access.
      </p>
    </div>

    <div style="margin: 24px 0; text-align: left;">
      <a href="${renewUrl}" style="display: inline-block; background-color: #dc2626; color: #ffffff; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Renew Subscription &rarr;</a>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Action Required: Subscription Expiring in ${daysRemaining} Days - ${businessName}`,
    html: buildCorporateEmailHtml({ title: 'Subscription Renewal Notice', bodyHtml }),
    text: `Your subscription for ${businessName} expires in ${daysRemaining} days on ${formattedDate}. Renew at your dashboard.`
  }, `subscription warning email for ${businessName}`);
}

export async function sendSubscriptionExpiredEmail({ email, businessName }) {
  if (!email) return;
  const renewUrl = `${process.env.APP_URL || 'https://menusqr.in'}/#/app/subscription`;

  const bodyHtml = `
    <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #991b1b;">Subscription Expired &mdash; QR Service Blocked</h1>
    
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #374151;">
      The MENUSQR subscription for <strong>${businessName}</strong> has expired. As a result, public access to your digital customer menu via table QR codes has been temporarily suspended.
    </p>

    <div style="margin: 0 0 24px 0; padding: 16px; background-color: #fef2f2; border: 1px solid #f87171; border-radius: 6px;">
      <p style="margin: 0; font-size: 13px; color: #991b1b; line-height: 1.5;">
        <strong>Important:</strong> Your permanent QR code identity is preserved. Renewing your plan will instantly restore public menu service on the exact same physical QR code.
      </p>
    </div>

    <div style="margin: 24px 0; text-align: left;">
      <a href="${renewUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Reactivate Subscription Now &rarr;</a>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Subscription Expired - ${businessName} Menu Suspended`,
    html: buildCorporateEmailHtml({ title: 'Subscription Expired', bodyHtml }),
    text: `Your MENUSQR subscription for ${businessName} has expired. Public QR menu is blocked. Log in to renew.`
  }, `subscription expired email for ${businessName}`);
}

export async function sendRenewalEmail({ email, businessName, expiresAt }) {
  if (!email) return;
  const formattedDate = new Date(expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const bodyHtml = `
    <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #059669;">Subscription Successfully Renewed</h1>
    
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #374151;">
      Your MENUSQR subscription for <strong>${businessName}</strong> has been successfully renewed. Service is active until <strong>${formattedDate}</strong>.
    </p>

    <div style="margin: 0 0 20px 0; padding: 14px 16px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px;">
      <p style="margin: 0; font-size: 13px; color: #065f46; line-height: 1.5;">
        Your existing permanent table QR code remains fully active and connected to your live menu.
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Subscription Renewed - ${businessName}`,
    html: buildCorporateEmailHtml({ title: 'Subscription Renewed', bodyHtml }),
    text: `Subscription for ${businessName} renewed until ${formattedDate}.`
  }, `renewal email for ${businessName}`);
}

export async function sendQrReadyEmail({ email, businessName, tagline, menuSlug, qrUrl, qrImageUrl, downloadUrl }) {
  if (!email) return;

  const restName = businessName ? businessName.trim() : 'Your Restaurant';
  const restTagline = tagline ? tagline.trim() : 'Good Food | Happy Mood';
  const menuDestUrl = qrUrl || `${process.env.APP_URL || 'https://menusqr.in'}/#/menu/${menuSlug || 'mishraa-dhaba'}`;
  
  // High quality QR Code image URL for display in email
  const displayQrImg = qrImageUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=0b3826&bgcolor=ffffff&data=${encodeURIComponent(menuDestUrl)}`;
  const downloadPngUrl = downloadUrl || `${process.env.APP_URL || 'https://menusqr.in'}/api/app/qr/download?format=png&slug=${menuSlug || 'mishraa-dhaba'}`;
  const downloadPdfUrl = `${process.env.APP_URL || 'https://menusqr.in'}/api/app/qr/download?format=pdf&slug=${menuSlug || 'mishraa-dhaba'}`;

  const bodyHtml = `
    <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #111827; text-align: center;">Your Permanent Table QR Placard Artwork is Ready! 📲</h1>
    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #4b5563; text-align: center;">
      We have generated your custom physical table standee artwork for <strong>${restName}</strong>. You can preview, print, or download your high-resolution artwork directly below.
    </p>

    <!-- DYNAMIC PHYSICAL QR STANDEE CARD (Matching uploaded gold & emerald standee design) -->
    <div style="max-width: 420px; margin: 0 auto 28px auto; background: linear-gradient(145deg, #dfb445 0%, #b8860b 50%, #996515 100%); border-radius: 28px; padding: 4px; box-shadow: 0 14px 35px rgba(11, 56, 38, 0.25);">
      <div style="background-color: #0b3826; border-radius: 24px; overflow: hidden; text-align: center;">
        
        <!-- Top Banner: Logo & Restaurant Name -->
        <div style="padding: 28px 20px 16px 20px; background: radial-gradient(circle at 50% 30%, #134e36 0%, #0b3826 100%); border-bottom: 2px solid #dfb445;">
          <div style="display: inline-block; background-color: #156143; border: 1.5px solid #dfb445; width: 46px; height: 46px; border-radius: 50%; text-align: center; line-height: 44px; margin-bottom: 8px;">
            <span style="font-size: 24px; vertical-align: middle;">👨‍🍳</span>
          </div>
          <h2 style="font-family: 'Georgia', serif; font-size: 26px; font-weight: 800; color: #ffffff; margin: 4px 0 2px 0; letter-spacing: 0.5px;">${restName}</h2>
          <p style="font-family: 'Brush Script MT', 'Palatino', cursive, Georgia, serif; font-size: 16px; color: #f3e5ab; margin: 0; font-style: italic;">${restTagline}</p>
        </div>

        <!-- Center Cream Card with Live QR -->
        <div style="background-color: #fcf9f2; padding: 24px 20px; border-radius: 0 0 20px 20px;">
          
          <!-- Gold Framed QR Container -->
          <div style="display: inline-block; background: linear-gradient(135deg, #dfb445 0%, #b8860b 100%); padding: 6px; border-radius: 20px; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
            <div style="background-color: #ffffff; padding: 12px; border-radius: 14px; position: relative;">
              <img src="${displayQrImg}" width="200" height="200" alt="Permanent Table QR" style="display: block; border-radius: 8px;" />
            </div>
          </div>

          <!-- Scan Badge -->
          <div style="margin-top: 16px;">
            <div style="display: inline-block; background-color: #0b3826; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 13px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; padding: 8px 22px; border-radius: 25px; border: 1px solid #dfb445;">
              📱 SCAN FOR MENU
            </div>
          </div>

          <p style="font-size: 11px; font-weight: 700; color: #0b3826; text-transform: uppercase; letter-spacing: 1px; margin: 12px 0 16px 0;">
            VIEW OUR DELICIOUS MENU &bull; ORDER YOUR FAVORITES
          </p>

          <!-- 4 Feature Badges Grid -->
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 10px; border-top: 1px solid #e2d9c5; padding-top: 12px;">
            <tr>
              <td width="25%" align="center" style="padding: 4px;">
                <span style="font-size: 16px; display: block;">🍲</span>
                <span style="font-size: 8px; font-weight: 800; color: #0b3826; text-transform: uppercase; display: block; margin-top: 2px;">DELICIOUS FOOD</span>
              </td>
              <td width="25%" align="center" style="padding: 4px; border-left: 1px solid #e2d9c5;">
                <span style="font-size: 16px; display: block;">🌿</span>
                <span style="font-size: 8px; font-weight: 800; color: #0b3826; text-transform: uppercase; display: block; margin-top: 2px;">FRESH INGREDIENTS</span>
              </td>
              <td width="25%" align="center" style="padding: 4px; border-left: 1px solid #e2d9c5;">
                <span style="font-size: 16px; display: block;">⭐</span>
                <span style="font-size: 8px; font-weight: 800; color: #0b3826; text-transform: uppercase; display: block; margin-top: 2px;">BEST QUALITY</span>
              </td>
              <td width="25%" align="center" style="padding: 4px; border-left: 1px solid #e2d9c5;">
                <span style="font-size: 16px; display: block;">❤️</span>
                <span style="font-size: 8px; font-weight: 800; color: #0b3826; text-transform: uppercase; display: block; margin-top: 2px;">100% SATISFACTION</span>
              </td>
            </tr>
          </table>

        </div>

        <!-- Bottom Footer Banner -->
        <div style="background-color: #052418; padding: 12px; border-top: 1px solid #dfb445;">
          <p style="font-family: 'Brush Script MT', 'Palatino', cursive, Georgia, serif; font-size: 16px; color: #f3e5ab; margin: 0; font-style: italic;">
            Thank You FOR YOUR SUPPORT
          </p>
        </div>

      </div>
    </div>

    <!-- DOWNLOAD & PRINT BUTTONS -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px;">
      <h3 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 700; color: #0f172a;">Print & Download Options</h3>
      <p style="margin: 0 0 16px 0; font-size: 13px; color: #64748b;">Download high-resolution print artwork ready for acrylic table stands or counter displays:</p>
      
      <table align="center" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
        <tr>
          <td style="padding: 6px;">
            <a href="${downloadPngUrl}" style="display: inline-block; background-color: #0b3826; color: #ffffff; font-size: 13px; font-weight: 700; padding: 10px 18px; border-radius: 6px; text-decoration: none; border: 1px solid #dfb445;">📥 Download PNG Artwork</a>
          </td>
          <td style="padding: 6px;">
            <a href="${downloadPdfUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 13px; font-weight: 700; padding: 10px 18px; border-radius: 6px; text-decoration: none;">📄 Download Vector PDF</a>
          </td>
        </tr>
      </table>

      <div style="margin-top: 14px;">
        <a href="${menuDestUrl}" style="color: #2563eb; font-size: 13px; font-weight: 600; text-decoration: underline;">📲 Open Live Digital Menu in Browser &rarr;</a>
      </div>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `📲 Table Placard Artwork & Permanent QR Ready - ${restName}`,
    html: buildCorporateEmailHtml({ title: 'Table QR Artwork Ready', bodyHtml }),
    text: `Permanent table QR artwork for ${restName} is ready. Download PNG/PDF from: ${downloadPngUrl}`
  }, `QR ready email for ${restName}`);
}

export async function sendMarketingCampaignEmail({ email, restaurantName, ownerName, offerPrice = '1499' }) {
  if (!email) return;
  const name = ownerName ? ownerName.trim() : 'Restaurant Partner';
  const restName = restaurantName ? restaurantName.trim() : 'your restaurant';
  const signupUrl = `${process.env.APP_URL || 'https://menusqr.in'}/#/signup`;

  const bodyHtml = `
    <!-- Ad Banner Graphic -->
    <div style="margin: -36px -32px 28px -32px; background-image: url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80'); background-size: cover; background-position: center; padding: 48px 24px; text-align: center; position: relative;">
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(180deg, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.95) 100%);"></div>
      <div style="position: relative; z-index: 1;">
        <span style="display: inline-block; background-color: #e8783c; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; padding: 6px 14px; border-radius: 20px; margin-bottom: 12px;">EXCLUSIVE LAUNCH OFFER</span>
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 900; margin: 0 0 8px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">Upgrade ${restName} to an Interactive QR Menu</h1>
        <p style="color: #cbd5e1; font-size: 14px; margin: 0; max-width: 440px; margin: 0 auto; line-height: 1.5;">Print your QR code once. Update prices, dishes & specials anytime from your phone.</p>
      </div>
    </div>

    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #374151;">
      Hello <strong>${name}</strong>,
    </p>

    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #374151;">
      Give your guests an instant, contactless digital menu experience. No PDF downloads or slow loading pages &mdash; your customer menu opens in under 1 second on any smartphone camera scan.
    </p>

    <!-- Key Features List -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 28px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; vertical-align: top; width: 32px;">⚡</td>
        <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;">
          <strong style="font-size: 14px; color: #0f172a;">Instant 1-Second Scanning:</strong>
          <span style="display: block; font-size: 12px; color: #64748b; margin-top: 2px;">Optimized mobile layout that loads immediately with zero customer friction.</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; vertical-align: top;">🎨</td>
        <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;">
          <strong style="font-size: 14px; color: #0f172a;">10+ Premium Designer Themes:</strong>
          <span style="display: block; font-size: 12px; color: #64748b; margin-top: 2px;">Rajasthani Heritage, Modern Minimalist, Fine Dining & Cafe themes.</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; vertical-align: top;">📌</td>
        <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;">
          <strong style="font-size: 14px; color: #0f172a;">One Permanent Table QR:</strong>
          <span style="display: block; font-size: 12px; color: #64748b; margin-top: 2px;">Change menu prices or dishes anytime without re-printing table stickers.</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px; vertical-align: top;">🛡️</td>
        <td style="padding: 10px;">
          <strong style="font-size: 14px; color: #0f172a;">100% Guaranteed Uptime & Dedicated Support:</strong>
          <span style="display: block; font-size: 12px; color: #64748b; margin-top: 2px;">High-availability PostgreSQL cloud infrastructure.</span>
        </td>
      </tr>
    </table>

    <!-- Limited Time Promotional Pricing Box -->
    <div style="margin: 0 0 28px 0; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 8px; padding: 24px; text-align: center; color: #ffffff;">
      <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px;">Special Launch Offer</p>
      <div style="margin: 8px 0;">
        <span style="font-size: 16px; color: #94a3b8; text-decoration: line-through; margin-right: 8px;">₹4,999/yr</span>
        <span style="font-size: 32px; font-weight: 900; color: #f29a66;">₹${offerPrice} <span style="font-size: 14px; font-weight: 500; color: #cbd5e1;">/ Year</span></span>
      </div>
      <p style="margin: 0 0 18px 0; font-size: 12px; color: #cbd5e1;">Includes Unlimited Dishes, Permanent QR Studio, High-Res Print Artwork & 24/7 Support.</p>
      
      <a href="${signupUrl}" style="display: inline-block; background-color: #e8783c; color: #ffffff; font-size: 14px; font-weight: 800; padding: 12px 28px; border-radius: 6px; text-decoration: none; box-shadow: 0 4px 12px rgba(232, 120, 60, 0.4);">Claim Offer & See Live Demo &rarr;</a>
    </div>

    <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5;">
      Have questions? Reply to this email or visit <a href="${process.env.APP_URL || 'https://menusqr.in'}" style="color: #2563eb; text-decoration: underline;">menusqr.in</a> to explore live demos.
    </p>
  `;

  await sendEmail({
    to: email,
    subject: `🔥 Special Launch Offer: Transform ${restName}'s Menu with MENUSQR`,
    html: buildCorporateEmailHtml({ title: `Upgrade ${restName} to MENUSQR`, bodyHtml }),
    text: `Upgrade ${restName}'s menu to MENUSQR for just ₹${offerPrice}/year. Visit ${signupUrl} to claim your offer.`
  }, `marketing ad campaign email for ${email}`);
}
