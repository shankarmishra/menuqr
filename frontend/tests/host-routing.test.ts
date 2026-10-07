import test from 'node:test';
import assert from 'node:assert/strict';
import { getAdminRedirectUrl, isAdminHostname, isAdminPath } from '../src/utils/hostRouting.ts';

test('admin portal is enabled only on its configured hostname', () => {
  assert.equal(isAdminHostname('admin.menusqr.in', 'admin.menusqr.in'), true);
  assert.equal(isAdminHostname('menusqr.in', 'admin.menusqr.in'), false);
  assert.equal(isAdminHostname('admin.menusqr.in.attacker.example', 'admin.menusqr.in'), false);
  assert.equal(isAdminHostname('admin.menusqr.in', undefined), false);
});

test('admin path matching is limited to /admin and its descendants', () => {
  assert.equal(isAdminPath('/admin'), true);
  assert.equal(isAdminPath('/admin/clients'), true);
  assert.equal(isAdminPath('/admin/login'), true);
  assert.equal(isAdminPath('/administrator'), false);
  assert.equal(isAdminPath('/login'), false);
});

test('legacy public admin paths redirect to the configured admin host', () => {
  assert.equal(
    getAdminRedirectUrl('admin.menusqr.in', '/admin/login', '?from=public', '#section'),
    'https://admin.menusqr.in/login',
  );
  assert.equal(
    getAdminRedirectUrl('admin.menusqr.in', '/admin/dashboard', '?tab=clients', '#list'),
    'https://admin.menusqr.in/admin/dashboard?tab=clients#list',
  );
});