import test from 'node:test';
import assert from 'node:assert/strict';
import { generateCsrfToken, verifyCsrfToken, createCsrfCookie, createClearedCsrfCookie } from '../csrf.js';

test('generateCsrfToken creates a valid token format', () => {
  const token = generateCsrfToken('session-123');
  assert.equal(typeof token, 'string');
  assert.equal(token.includes('.'), true);
  const [nonce, hmac] = token.split('.');
  assert.equal(nonce.length, 32);
  assert.equal(hmac.length, 64);
});

test('verifyCsrfToken validates token for correct session and rejects tampered token or wrong session', () => {
  const sessionId = 'session-owner-99';
  const token = generateCsrfToken(sessionId);

  assert.equal(verifyCsrfToken(token, sessionId), true);
  assert.equal(verifyCsrfToken(token, 'different-session'), false);
  assert.equal(verifyCsrfToken('invalid.token', sessionId), false);
  assert.equal(verifyCsrfToken('', sessionId), false);
  assert.equal(verifyCsrfToken(null, sessionId), false);
});

test('createCsrfCookie generates un-HttpOnly readable cookie with correct attributes', () => {
  const token = generateCsrfToken('sess-1');
  const cookieOptions = createCsrfCookie(token, { NODE_ENV: 'production' });

  assert.equal(cookieOptions.includes('menusqr_csrf='), true);
  assert.equal(cookieOptions.includes('HttpOnly'), false); // readable by JS
  assert.equal(cookieOptions.includes('Secure'), true);
  assert.equal(cookieOptions.includes('SameSite=None'), true);
});

test('createClearedCsrfCookie generates zero-max-age cookie', () => {
  const cookieOptions = createClearedCsrfCookie({ NODE_ENV: 'production' });

  assert.equal(cookieOptions.includes('menusqr_csrf=;'), true);
  assert.equal(cookieOptions.includes('Max-Age=0'), true);
});
