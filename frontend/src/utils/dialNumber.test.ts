import test from 'node:test';
import assert from 'node:assert/strict';
import { firstDialNumber } from './dialNumber.ts';

test('a single number is reduced to digits and a leading plus', () => {
  assert.equal(firstDialNumber('8591095483'), '8591095483');
  assert.equal(firstDialNumber('+91 95480 89761'), '+919548089761');
  assert.equal(firstDialNumber('011-23456789'), '01123456789');
});

test('only the first of several numbers is dialled', () => {
  assert.equal(firstDialNumber('+91 95480 89761, +91 90689 35364'), '+919548089761');
  assert.equal(firstDialNumber('98765 43210 / 98765 43211'), '9876543210');
  assert.equal(firstDialNumber('98765 43210 or 98765 43211'), '9876543210');
});

test('a missing phone gives an empty string', () => {
  assert.equal(firstDialNumber(null), '');
  assert.equal(firstDialNumber(undefined), '');
  assert.equal(firstDialNumber(''), '');
});
