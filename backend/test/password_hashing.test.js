import test from 'node:test';
import assert from 'node:assert/strict';
import createHash from 'node:crypto';
import { hashPassword, verifyPassword, isLegacyHash } from '../auth.js';

test('hashPassword generates PBKDF2 salt and hash', () => {
  const hash = hashPassword('MySecretPassword123!');
  assert.equal(typeof hash, 'string');
  assert.equal(hash.includes(':'), true);
  const [salt, originalHash] = hash.split(':');
  assert.equal(salt.length, 32); // 16 bytes hex = 32 chars
  assert.equal(originalHash.length, 128); // 64 bytes hex = 128 chars
});

test('verifyPassword validates correct PBKDF2 password and rejects incorrect password', () => {
  const password = 'CorrectPassword456!';
  const hash = hashPassword(password);

  assert.equal(verifyPassword(password, hash), true);
  assert.equal(verifyPassword('WrongPassword', hash), false);
  assert.equal(verifyPassword('', hash), false);
  assert.equal(verifyPassword(password, 'invalid-hash'), false);
});

test('isLegacyHash identifies 64-character un-salted SHA-256 hex strings', () => {
  const legacyHash = 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3';
  const newHash = hashPassword('Test1234');

  assert.equal(isLegacyHash(legacyHash), true);
  assert.equal(isLegacyHash(newHash), false);
  assert.equal(isLegacyHash('short-hash'), false);
  assert.equal(isLegacyHash(null), false);
});

test('verifyPassword fallback correctly authenticates legacy SHA-256 hashes', () => {
  const password = 'LegacyPassword789!';
  // crypto.createHash('sha256').update(password).digest('hex')
  const legacyHash = createHash.createHash('sha256').update(password).digest('hex');

  assert.equal(verifyPassword(password, legacyHash), true);
  assert.equal(verifyPassword('WrongPassword', legacyHash), false);
});
