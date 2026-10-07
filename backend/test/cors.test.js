import test from 'node:test';
import assert from 'node:assert/strict';
import { createCorsOriginChecker } from '../cors.js';

test('production CORS allows only configured main and admin origins', () => {
  const isAllowed = createCorsOriginChecker({
    NODE_ENV: 'production',
    FRONTEND_ORIGINS: 'https://menusqr.in,https://admin.menusqr.in',
  });

  assert.equal(isAllowed('https://menusqr.in'), true);
  assert.equal(isAllowed('https://admin.menusqr.in'), true);
  assert.equal(isAllowed('https://attacker.example'), false);
  assert.equal(isAllowed('https://malicious.onrender.com'), false);
});

test('development allows local frontends but production does not', () => {
  const development = createCorsOriginChecker({ NODE_ENV: 'test' });
  const production = createCorsOriginChecker({ NODE_ENV: 'production' });
  const unspecified = createCorsOriginChecker({});

  assert.equal(development('http://127.0.0.1:5174'), true);
  assert.equal(production('http://127.0.0.1:5174'), false);
  assert.equal(unspecified('http://127.0.0.1:5174'), false);
});

test('origin matching rejects wildcards, paths, and malformed origins', () => {
  const isAllowed = createCorsOriginChecker({
    NODE_ENV: 'production',
    FRONTEND_ORIGINS: '*,https://menusqr.in/path,not-an-origin',
  });

  assert.equal(isAllowed('https://menusqr.in'), false);
  assert.equal(isAllowed('null'), false);
  assert.equal(isAllowed(undefined), true);
});