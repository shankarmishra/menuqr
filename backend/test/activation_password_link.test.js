import test from 'node:test';
import assert from 'node:assert/strict';
import { setPool, pool } from '../db.js';
import { sendActivationEmail, sendClientWelcomeEmail } from '../email.js';

test('Check (b): Activation and Welcome emails provide set-password / reset link for passwordless flows', async (t) => {
  const originalPool = pool;
  const queuedEmails = [];

  t.beforeEach(() => {
    queuedEmails.length = 0;
    setPool({
      query: async (sql, params) => {
        if (sql.includes('INSERT INTO email_outbox')) {
          const payload = typeof params[4] === 'string' ? JSON.parse(params[4]) : params[4];
          queuedEmails.push({
            id: params[0],
            notificationType: params[1],
            recipient: params[2],
            subject: params[3],
            html: payload?.html || '',
            text: payload?.text || '',
          });
          return { rows: [{ id: 'outbox_test_1', status: 'QUEUED' }] };
        }
        return { rows: [] };
      }
    });
  });

  t.after(() => {
    setPool(originalPool);
  });

  await t.test('sendActivationEmail includes set-password / reset link for purchase accounts without preset password', async () => {
    const email = 'newcustomer@example.com';
    await sendActivationEmail({
      email,
      ownerName: 'Harish Kumar',
      businessName: 'Harish Sweets',
      plan: 'PREMIUM',
    });

    assert.equal(queuedEmails.length, 1);
    const emailData = queuedEmails[0];
    assert.equal(emailData.recipient, email);

    // Verify Set / Reset Password link is included in both HTML and text
    assert.match(
      emailData.html,
      /action=forgot&amp;email=newcustomer%40example\.com|action=forgot&email=newcustomer%40example\.com/,
      'Activation email must contain set/reset password link with action=forgot and customer email'
    );
    assert.match(
      emailData.text,
      /action=forgot&email=newcustomer%40example\.com/,
      'Activation text email must contain set/reset password link'
    );
    assert.match(
      emailData.html,
      /Set \/ Reset Password|Set Password/,
      'Email body must have clear Set Password action button'
    );
  });

  await t.test('sendClientWelcomeEmail includes set-password / reset link for admin-created clients', async () => {
    const email = 'adminclient@example.com';
    await sendClientWelcomeEmail({
      id: 'tenant_123',
      email,
      ownerName: 'Ramesh Singh',
      businessName: 'Ramesh Cafe',
    });

    assert.equal(queuedEmails.length, 1);
    const emailData = queuedEmails[0];
    assert.equal(emailData.recipient, email);

    assert.match(
      emailData.html,
      /action=forgot&amp;email=adminclient%40example\.com|action=forgot&email=adminclient%40example\.com/,
      'Welcome email must contain set/reset password link with action=forgot and client email'
    );
    assert.match(
      emailData.text,
      /action=forgot&email=adminclient%40example\.com/,
      'Welcome text email must contain set/reset password link'
    );
    assert.match(
      emailData.html,
      /Set Password/,
      'Email body must have clear Set Password action button'
    );
  });
});
