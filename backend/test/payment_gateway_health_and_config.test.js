import test from 'node:test';
import assert from 'node:assert/strict';
import { checkPaymentGatewayConfig } from '../server.js';

test('Payment Gateway Configuration & Health Check Suite', async (t) => {
  const origAppId = process.env.CASHFREE_APP_ID;
  const origSecret = process.env.CASHFREE_SECRET_KEY;
  const origEnv = process.env.CASHFREE_ENV;

  t.afterEach(() => {
    process.env.CASHFREE_APP_ID = origAppId;
    process.env.CASHFREE_SECRET_KEY = origSecret;
    process.env.CASHFREE_ENV = origEnv;
  });

  await t.test('detects unconfigured payment gateway when keys are absent', () => {
    delete process.env.CASHFREE_APP_ID;
    delete process.env.CASHFREE_SECRET_KEY;

    const config = checkPaymentGatewayConfig();
    assert.equal(config.configured, false);
    assert.ok(config.errors.length > 0, 'Must record error for missing keys');
  });

  await t.test('detects mismatch when CASHFREE_ENV is PROD but test key is provided', () => {
    process.env.CASHFREE_APP_ID = 'TEST102030';
    process.env.CASHFREE_SECRET_KEY = 'cfsk_test_secret_123';
    process.env.CASHFREE_ENV = 'PROD';

    const config = checkPaymentGatewayConfig();
    assert.equal(config.configured, true);
    assert.ok(config.warnings.some(w => w.includes('sandbox/test key')), 'Must warn on PROD env with TEST key');
  });

  await t.test('accepts clean production credentials', () => {
    process.env.CASHFREE_APP_ID = 'CF102030PROD';
    process.env.CASHFREE_SECRET_KEY = 'cfsk_prod_live_secret';
    process.env.CASHFREE_ENV = 'PROD';

    const config = checkPaymentGatewayConfig();
    assert.equal(config.configured, true);
    assert.equal(config.env, 'PROD');
    assert.equal(config.warnings.length, 0);
    assert.equal(config.errors.length, 0);
  });
});
