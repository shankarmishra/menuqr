import test from 'node:test';
import assert from 'node:assert/strict';
import { createAdminSessionCookieOptions, createClearedAdminSessionCookieOptions } from '../adminSessionCookie.js';

test('production admin session cookie is secure, HttpOnly, same-site strict, 12 hours, and host-only', () => {
  const cookie = createAdminSessionCookieOptions('session-token', {
    NODE_ENV: 'production',
  });

  assert.equal(cookie.name, 'menusqr_admin_session');
  assert.equal(cookie.value, 'session-token');
  assert.equal(cookie.httpOnly, true);
  assert.equal(cookie.secure, true);
  assert.equal(cookie.sameSite, 'strict');
  assert.equal(cookie.path, '/');
  assert.equal(cookie.maxAge, 12 * 60 * 60);
  assert.equal('domain' in cookie, false);
});

test('production cookie can be forced Secure when the runtime omits NODE_ENV', () => {
  const cookie = createAdminSessionCookieOptions('session-token', {
    COOKIE_SECURE: 'true',
  });
  assert.equal(cookie.secure, true);
  assert.equal(cookie.sameSite, 'strict');
});

test('logout clears the same host-only cookie with matching attributes', () => {
  const cookie = createClearedAdminSessionCookieOptions({ NODE_ENV: 'production' });

  assert.equal(cookie.value, '');
  assert.equal(cookie.httpOnly, true);
  assert.equal(cookie.secure, true);
  assert.equal(cookie.sameSite, 'strict');
  assert.equal(cookie.path, '/');
  assert.equal(cookie.maxAge, 0);
  assert.equal('domain' in cookie, false);
});
test('session lifetime is configurable but capped at 72 hours and falls back to 12 on bad input', () => {
  assert.equal(createAdminSessionCookieOptions('t', { NODE_ENV: 'production', ADMIN_SESSION_HOURS: '2' }).maxAge, 2 * 3600);
  assert.equal(createAdminSessionCookieOptions('t', { NODE_ENV: 'production', ADMIN_SESSION_HOURS: '9999' }).maxAge, 72 * 3600);
  assert.equal(createAdminSessionCookieOptions('t', { NODE_ENV: 'production', ADMIN_SESSION_HOURS: 'abc' }).maxAge, 12 * 3600);
});
