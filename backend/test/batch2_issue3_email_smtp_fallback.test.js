import test from 'node:test';
import assert from 'node:assert/strict';
import { sendEmailDirectly, getEmailConfig } from '../email.js';

test('Batch 2 #3: Email SMTP (nodemailer) fallback when RESEND_API_KEY is missing', async (t) => {
  const originalEnv = { ...process.env };

  t.afterEach(() => {
    process.env = { ...originalEnv };
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
});
