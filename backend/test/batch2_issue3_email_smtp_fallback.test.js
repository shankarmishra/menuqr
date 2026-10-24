import test from 'node:test';
import assert from 'node:assert/strict';
import { sendEmailDirectly, getEmailConfig } from '../email.js';

test('Batch 2 #3: Email SMTP (nodemailer) fallback when RESEND_API_KEY is missing', async (t) => {
  const originalEnv = { ...process.env };
  delete process.env.BREVO_API_KEY;
  delete process.env.SENDINBLUE_API_KEY;
  process.env.ENABLE_EMAIL_SERVICE = 'true';

  t.afterEach(() => {
    process.env = { ...originalEnv };
    delete process.env.BREVO_API_KEY;
    delete process.env.SENDINBLUE_API_KEY;
    process.env.ENABLE_EMAIL_SERVICE = 'true';
  });

  await t.test('Falls back to SMTP when RESEND_API_KEY is empty but SMTP_HOST is configured', async () => {
    delete process.env.RESEND_API_KEY;
    process.env.SMTP_HOST = 'smtp.mockserver.local';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'smtp_test_user';
    process.env.SMTP_PASS = 'smtp_test_pass';

    const cfg = getEmailConfig(process.env);
    assert.equal(cfg.configured, true, 'Email must be marked as configured via SMTP');
    assert.equal(cfg.provider, 'smtp', 'Email provider must be smtp');

    // Attempting send with a mock transport
    const res = await sendEmailDirectly({
      to: 'recipient@example.com',
      subject: 'Test Subject',
      html: '<p>Test</p>',
      text: 'Test',
    });

    // It should have attempted SMTP (not failing with "RESEND_API_KEY is missing")
    assert.notEqual(res.error, 'RESEND_API_KEY environment variable is missing.');
    assert.equal(res.provider, 'smtp');
  });

  await t.test('Reports clean, actionable error when neither RESEND_API_KEY nor SMTP is provisioned', async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.SMTP_HOST;
    delete process.env.MAIL_HOST;

    const cfg = getEmailConfig(process.env);
    assert.equal(cfg.configured, false);
    assert.equal(cfg.provider, 'none');

    const res = await sendEmailDirectly({
      to: 'recipient@example.com',
      subject: 'Test Subject',
      html: '<p>Test</p>',
      text: 'Test',
    });

    assert.equal(res.ok, false);
    assert.match(res.error, /No email transport configured|SMTP/);
  });

  await t.test('Prefers direct SMTP by default even if RESEND_API_KEY is present', async () => {
    process.env.RESEND_API_KEY = 're_invalid_test_key_12345';
    process.env.SMTP_HOST = 'smtp.mockserver.local';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'smtp_test_user';
    process.env.SMTP_PASS = 'smtp_test_pass';

    const cfg = getEmailConfig(process.env);
    assert.equal(cfg.provider, 'smtp', 'Direct SMTP must be preferred by default');
  });

  await t.test('Falls back to SMTP when EMAIL_PROVIDER=resend fails (e.g. 401 error)', async () => {
    process.env.EMAIL_PROVIDER = 'resend';
    process.env.RESEND_API_KEY = 're_invalid_test_key_12345';
    process.env.SMTP_HOST = 'smtp.mockserver.local';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'smtp_test_user';
    process.env.SMTP_PASS = 'smtp_test_pass';

    const cfg = getEmailConfig(process.env);
    assert.equal(cfg.provider, 'resend');

    const res = await sendEmailDirectly({
      to: 'recipient@example.com',
      subject: 'Test Subject',
      html: '<p>Test</p>',
      text: 'Test',
    });

    // Since RESEND_API_KEY is invalid, Resend fails and it automatically falls back to SMTP
    assert.equal(res.ok, false);
    assert.equal(res.provider, 'smtp');
  });

  await t.test('Prioritizes Resend HTTPS on Render when both SMTP and RESEND_API_KEY are configured', async () => {
    process.env.RENDER = 'true';
    process.env.RESEND_API_KEY = 're_test_key_12345';
    process.env.SMTP_HOST = 'smtp.gmail.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'user@gmail.com';
    process.env.SMTP_PASS = 'secret_pass';

    const cfg = getEmailConfig(process.env);
    assert.equal(cfg.isRender, true);
    assert.equal(cfg.provider, 'resend', 'On Render, Resend HTTPS API on port 443 must be prioritized over blocked SMTP');
  });

  await t.test('Supports Brevo HTTPS API as a provider', async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.SMTP_HOST;
    process.env.BREVO_API_KEY = 'xkeysib-test-dummy';

    const cfg = getEmailConfig(process.env);
    assert.equal(cfg.provider, 'brevo');
    assert.equal(cfg.configured, true);

    const res = await sendEmailDirectly({
      to: 'recipient@example.com',
      subject: 'Test Subject',
      html: '<p>Test</p>',
      text: 'Test',
    });

    assert.equal(res.ok, false);
    assert.equal(res.provider, 'brevo');
    assert.match(res.error, /Brevo API key is invalid \(401\)/);
  });

  await t.test('Explains Render Free Tier SMTP block when only SMTP is configured on Render and network is blocked', async () => {
    process.env.RENDER = 'true';
    delete process.env.RESEND_API_KEY;
    delete process.env.BREVO_API_KEY;
    process.env.SMTP_HOST = '192.0.2.1';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'user@gmail.com';
    process.env.SMTP_PASS = 'secret_pass';
    process.env.SMTP_CONNECTION_TIMEOUT_MS = '500';

    const cfg = getEmailConfig(process.env);
    assert.equal(cfg.isRender, true);
    assert.equal(cfg.provider, 'smtp');

    const res = await sendEmailDirectly({
      to: 'recipient@example.com',
      subject: 'Test Subject',
      html: '<p>Test</p>',
      text: 'Test',
    });

    assert.equal(res.ok, false);
    assert.match(res.error, /Render Free Tier blocks outbound SMTP traffic/);
  });
});
