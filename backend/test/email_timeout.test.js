import test from 'node:test';
import assert from 'node:assert/strict';
import { getSmtpTimeoutOptions } from '../email.js';

test('SMTP connection, greeting, and socket timeouts are bounded by default', () => {
  assert.deepEqual(getSmtpTimeoutOptions({}), {
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
});

test('SMTP timeout values can be configured per deployment', () => {
  assert.deepEqual(getSmtpTimeoutOptions({
    SMTP_CONNECTION_TIMEOUT_MS: '5000',
    SMTP_GREETING_TIMEOUT_MS: '7000',
    SMTP_SOCKET_TIMEOUT_MS: '15000',
  }), {
    connectionTimeout: 5000,
    greetingTimeout: 7000,
    socketTimeout: 15000,
  });
});