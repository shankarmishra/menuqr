import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTableQrUrl, formatTableCode } from './tableQr.ts';

test('every table shares the restaurant link; only the code differs', () => {
  const base = 'https://menusqr.in/qr/r7k2m9';
  const t4 = buildTableQrUrl(base, 'k7q92m');
  const t9 = buildTableQrUrl(base, 'ZZ88HH');
  assert.equal(t4, 'https://menusqr.in/qr/r7k2m9?tc=K7Q92M');
  assert.equal(t9, 'https://menusqr.in/qr/r7k2m9?tc=ZZ88HH');
  assert.equal(new URL(t4).pathname, new URL(t9).pathname);
});

test('the table number is never put in the link, and an old ?table=N is replaced', () => {
  const url = new URL(buildTableQrUrl('https://menusqr.in/qr/abc?table=4&src=print', 'K7Q92M'));
  assert.equal(url.searchParams.get('table'), null);
  assert.equal(url.searchParams.get('tc'), 'K7Q92M');
  assert.equal(url.searchParams.get('src'), 'print', 'other parameters are kept');
});

test('a relative base link still gets the code', () => {
  assert.equal(buildTableQrUrl('/qr/abc', 'K7Q92M'), '/qr/abc?tc=K7Q92M');
  assert.equal(buildTableQrUrl('/qr/abc?x=1', 'K7Q92M'), '/qr/abc?x=1&tc=K7Q92M');
});

test('codes are shown the way they are printed', () => {
  assert.equal(formatTableCode('k7q92m'), 'K7Q9-2M');
  assert.equal(formatTableCode('ABC'), 'ABC');
});
