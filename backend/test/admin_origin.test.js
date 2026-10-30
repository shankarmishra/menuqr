import test from 'node:test';
import assert from 'node:assert/strict';
import { createAdminOriginChecker } from '../cors.js';

const production = { NODE_ENV: 'production', FRONTEND_ORIGINS: 'https://menusqr.in,https://admin.menusqr.in' };

test('production: only the admin site may call the admin APIs', () => {
  const allowed = createAdminOriginChecker(production);
  assert.equal(allowed('https://admin.menusqr.in'), true);
  assert.equal(allowed('https://menusqr.in'), false, 'the restaurant site is in the general CORS list but not allowed here');
  assert.equal(allowed('https://www.menusqr.in'), false);
  assert.equal(allowed('https://evil.example'), false);
  assert.equal(allowed('https://admin.menusqr.in.evil.example'), false);
  assert.equal(allowed('not a url'), false);
});

test('requests without an Origin header (curl, server-to-server) pass this gate', () => {
  assert.equal(createAdminOriginChecker(production)(undefined), true);
});

test('ADMIN_FRONTEND_ORIGIN overrides the production default', () => {
  const allowed = createAdminOriginChecker({ ...production, ADMIN_FRONTEND_ORIGIN: 'https://ops.menusqr.in' });
  assert.equal(allowed('https://ops.menusqr.in'), true);
  assert.equal(allowed('https://admin.menusqr.in'), false);
});

test('development without an admin origin falls back to the general local allowlist', () => {
  const allowed = createAdminOriginChecker({ NODE_ENV: 'development' });
  assert.equal(allowed('http://localhost:5173'), true);
  assert.equal(allowed('https://evil.example'), false);
});
