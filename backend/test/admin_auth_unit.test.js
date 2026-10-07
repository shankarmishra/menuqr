import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAdminOtp, hashAdminOtp, matchesAdminOtp, isApprovedAdminEmail } from '../adminAuth.js';
import { normalizeEmail } from '../utils.js';

test('admin OTPs are six digits and only their hashes are suitable for storage', () => {
  const otp = generateAdminOtp();
  const otpHash = hashAdminOtp(otp);

  assert.match(otp, /^\d{6}$/);
  assert.match(otpHash, /^[a-f\d]{64}$/);
  assert.notEqual(otpHash, otp);
  assert.equal(matchesAdminOtp(otp, otpHash), true);
  assert.equal(matchesAdminOtp('000000', otpHash), false);
});

test('only the three approved administrator addresses pass the email allowlist', () => {
  for (const email of ['xshankarmishra@gmail.com', 'qevnaro@gmail.com', 'menusqr.in@gmail.com']) {
    assert.equal(isApprovedAdminEmail(email.toUpperCase()), true);
  }
  assert.equal(isApprovedAdminEmail('other@example.com'), false);
});

test('email normalization trims whitespace and ignores case', () => {
  assert.equal(normalizeEmail('  Owner.Name+trial@Example.COM  '), 'owner.name+trial@example.com');
});