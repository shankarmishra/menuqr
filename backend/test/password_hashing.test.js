import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, pbkdf2Sync } from 'node:crypto';
import { hashPassword, verifyPassword, isLegacyHash } from '../auth.js';

test('hashPassword generates self-identifying OWASP PBKDF2-SHA256 hash with 600k iterations', async () => {
  const hash = await hashPassword('MySecretPassword123!');
  assert.equal(typeof hash, 'string');
  assert.equal(hash.startsWith('$pbkdf2-sha256$i=600000$l=32$'), true);
  const parts = hash.split('$');
  assert.equal(parts.length, 6);
  assert.equal(parts[4].length, 32); // 16 bytes salt = 32 hex chars
  assert.equal(parts[5].length, 64); // 32 bytes derived key = 64 hex chars
});

test('verifyPassword validates correct PBKDF2 password and rejects incorrect password', async () => {
  const password = 'CorrectPassword456!';
  const hash = await hashPassword(password);

  assert.equal(await verifyPassword(password, hash), true);
  assert.equal(await verifyPassword('WrongPassword', hash), false);
  assert.equal(await verifyPassword('', hash), false);
  assert.equal(await verifyPassword(password, 'invalid-hash'), false);
});

test('unique salts produce different hash strings for identical passwords', async () => {
  const password = 'SamePassword999!';
  const hash1 = await hashPassword(password);
  const hash2 = await hashPassword(password);

  assert.notEqual(hash1, hash2);
  assert.equal(await verifyPassword(password, hash1), true);
  assert.equal(await verifyPassword(password, hash2), true);
});

test('isLegacyHash identifies non-$pbkdf2-sha256$ hashes', async () => {
  const legacySha256 = 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3';
  const legacyPbkdf2_10k = '12345678901234567890123456789012:abcdef';
  const newHash = await hashPassword('Test1234');

  assert.equal(isLegacyHash(legacySha256), true);
  assert.equal(isLegacyHash(legacyPbkdf2_10k), true);
  assert.equal(isLegacyHash(newHash), false);
  assert.equal(isLegacyHash(null), true);
});

test('verifyPassword fallback correctly authenticates legacy PBKDF2 10k and legacy SHA-256 hashes', async () => {
  const password = 'LegacyPassword789!';

  // 1. Legacy SHA-256
  const legacySha256 = createHash('sha256').update(password).digest('hex');
  assert.equal(await verifyPassword(password, legacySha256), true);
  assert.equal(await verifyPassword('WrongPassword', legacySha256), false);

  // 2. Legacy PBKDF2 10k sha512 (salt:hash)
  const salt = '1234567890abcdef1234567890abcdef';
  const hash10k = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  const legacyPbkdf2 = `${salt}:${hash10k}`;
  assert.equal(await verifyPassword(password, legacyPbkdf2), true);
  assert.equal(await verifyPassword('WrongPassword', legacyPbkdf2), false);
});
