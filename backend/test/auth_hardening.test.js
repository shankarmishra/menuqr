import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyPassword, hashPassword } from '../auth.js';
import { isApprovedAdminEmail } from '../adminAuth.js';

test('Auth Hardening Unit Tests', async (t) => {

  await t.test('1. verifyPassword returns false safely on null, undefined, empty, or non-string inputs', async () => {
    const validHash = await hashPassword('TestPass123!');

    assert.equal(await verifyPassword(undefined, validHash), false);
    assert.equal(await verifyPassword(null, validHash), false);
    assert.equal(await verifyPassword('', validHash), false);
    assert.equal(await verifyPassword(12345, validHash), false);
    assert.equal(await verifyPassword({}, validHash), false);
  });

  await t.test('2. verifyPassword returns false safely on malformed stored hashes', async () => {
    assert.equal(await verifyPassword('TestPass123!', undefined), false);
    assert.equal(await verifyPassword('TestPass123!', null), false);
    assert.equal(await verifyPassword('TestPass123!', ''), false);
    assert.equal(await verifyPassword('TestPass123!', 'invalid_hash_without_colon'), false);
    assert.equal(await verifyPassword('TestPass123!', 'saltonly:'), false);
    assert.equal(await verifyPassword('TestPass123!', ':hashonly'), false);
  });

  await t.test('3. verifyPassword returns true for matching password and false for wrong password', async () => {
    const password = 'SuperSecurePassword2026!';
    const hash = await hashPassword(password);

    assert.equal(await verifyPassword(password, hash), true);
    assert.equal(await verifyPassword('WrongPassword', hash), false);
    assert.equal(await verifyPassword('supersecurepassword2026!', hash), false); // Case-sensitive
  });

  await t.test('4. hashPassword throws expected error on invalid input', async () => {
    await assert.rejects(async () => await hashPassword(undefined), /Password must be a non-empty string/);
    await assert.rejects(async () => await hashPassword(null), /Password must be a non-empty string/);
    await assert.rejects(async () => await hashPassword(''), /Password must be a non-empty string/);
  });

  await t.test('5. isApprovedAdminEmail correctly normalizes and checks admin emails', () => {
    assert.equal(isApprovedAdminEmail('xshankarmishra@gmail.com'), true);
    assert.equal(isApprovedAdminEmail(' XSHANKARMISHRA@GMAIL.COM '), true);
    assert.equal(isApprovedAdminEmail('qevnaro@gmail.com'), true);
    assert.equal(isApprovedAdminEmail('menusqr.in@gmail.com'), true);
    assert.equal(isApprovedAdminEmail('unauthorized@example.com'), false);
  });

});
