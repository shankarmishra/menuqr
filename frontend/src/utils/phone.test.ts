import test from 'node:test';
import assert from 'node:assert/strict';
import { joinPhone, phoneError, splitPhone, whatsAppLink } from './phone.ts';

test('Indian mobile: validated and stored with +91', () => {
  assert.equal(phoneError('91', '98765 43210'), null);
  assert.match(phoneError('91', '58765 43210') || '', /starts with 6, 7, 8 or 9/);
  assert.match(phoneError('91', '98765') || '', /10 digits/);
  assert.equal(joinPhone('91', '98765 43210'), '+919876543210');
  assert.equal(joinPhone('91', '098765 43210'), '+919876543210');
  assert.equal(phoneError('91', ''), null, 'empty is allowed');
});

test('Indian landline and toll-free keep the STD form', () => {
  assert.equal(phoneError('91', '011-23456789', 'landline'), null);
  assert.equal(joinPhone('91', '011-23456789', 'landline'), '011-23456789');
  assert.equal(phoneError('91', '1800 123 4567', 'toll_free'), null);
  assert.ok(phoneError('91', '1900 123 4567', 'toll_free'));
});

test('other countries: mobiles only, E.164 length', () => {
  assert.equal(phoneError('971', '50 123 4567'), null);
  assert.equal(joinPhone('971', '050 123 4567'), '+971501234567');
  assert.ok(phoneError('971', '4 123 4567', 'landline'));
  assert.ok(phoneError('1', '123'));
});

test('splitPhone reverses joinPhone', () => {
  assert.deepEqual(splitPhone('+919876543210'), { code: '91', local: '9876543210' });
  assert.deepEqual(splitPhone('+971501234567'), { code: '971', local: '501234567' });
  assert.deepEqual(splitPhone('+12025550123'), { code: '1', local: '2025550123' });
  assert.deepEqual(splitPhone('9876543210'), { code: '91', local: '9876543210' });
  assert.deepEqual(splitPhone('011-23456789'), { code: '91', local: '011-23456789' });
});

test('whatsAppLink builds wa.me links and refuses toll-free and junk', () => {
  assert.equal(whatsAppLink('+919876543210', 'Hi'), 'https://wa.me/919876543210?text=Hi');
  assert.equal(whatsAppLink('9876543210'), 'https://wa.me/919876543210');
  assert.equal(whatsAppLink('+971501234567'), 'https://wa.me/971501234567');
  assert.equal(whatsAppLink('+9118001234567'), null);
  assert.equal(whatsAppLink('011-23456789'), null);
  assert.equal(whatsAppLink(''), null);
});
