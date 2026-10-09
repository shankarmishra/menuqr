import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyPassword, hashPassword } from '../auth.js';
import { isApprovedAdminEmail } from '../adminAuth.js';

test('Auth Hardening Unit Tests', async (t) => {

  await t.test('1. verifyPassword returns false safely on null, undefined, empty, or non-string inputs', () => {
    const validHash = hashPassword('TestPass123!');

    assert.equal(verifyPassword(undefined, validHash), false);
    assert.equal(verifyPassword(null, validHash), false);
    assert.equal(verifyPassword('', validHash), false);
    assert.equal(verifyPassword(12345, validHash), false);
    assert.equal(verifyPassword({}, validHash), false);
  });

  await t.test('2. verifyPassword returns false safely on malformed stored hashes', () => {
    assert.equal(verifyPassword('TestPass123!', undefined), false);
    assert.equal(verifyPassword('TestPass123!', null), false);
    assert.equal(verifyPassword('TestPass123!', ''), false);
    assert.equal(verifyPassword('TestPass123!', 'invalid_hash_without_colon'), false);
    assert.equal(verifyPassword('TestPass123!', 'saltonly:'), false);
    assert.equal(verifyPassword('TestPass123!', ':hashonly'), false);
  });

  await t.test('3. verifyPassword returns true for matching password and false for wrong password', () => {
    const password = 'SuperSecurePassword2026!';
    const hash = hashPassword(password);

    assert.equal(verifyPassword(password, hash), true);
    assert.equal(verifyPassword('WrongPassword', hash), false);
    assert.equal(verifyPassword('supersecurepassword2026!', hash), false); // Case-sensitive
  });

  await t.test('4. hashPassword throws expected error on invalid input', () => {
    assert.throws(() => hashPassword(undefined), /Password must be a non-empty string/);
    assert.throws(() => hashPassword(null), /Password must be a non-empty string/);
    assert.throws(() => hashPassword(''), /Password must be a non-empty string/);
  });

  await t.test('5. isApprovedAdminEmail correctly normalizes and checks admin emails', () => {
    assert.equal(isApprovedAdminEmail('xshankarmishra@gmail.com'), true);
    assert.equal(isApprovedAdminEmail(' XSHANKARMISHRA@GMAIL.COM '), true);
    assert.equal(isApprovedAdminEmail('qevnaro@gmail.com'), true);
    assert.equal(isApprovedAdminEmail('menusqr.in@gmail.com'), true);
    assert.equal(isApprovedAdminEmail('unauthorized@example.com'), false);
  });

});
