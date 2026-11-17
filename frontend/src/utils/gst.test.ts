import test from 'node:test';
import assert from 'node:assert/strict';
import { billTaxLines, calculateGst, fssaiError, formatRate, gstinError } from './gst.ts';

test('gstinError matches the backend rules', () => {
  assert.equal(gstinError('27AAPFU0939F1ZV'), null);
  assert.equal(gstinError('24aaacc1206d1zm'), null, 'lower case is accepted');
  assert.equal(gstinError('24AAACC1206D1ZM'), null);
  assert.match(gstinError('27AAPFU0939F1ZW') || '', /last character/);
  assert.match(gstinError('') || '', /15-character/);
  assert.match(gstinError('99AAPFU0939F1Z') || '', /exactly 15/);
});

test('fssaiError: empty is fine, otherwise 14 digits', () => {
  assert.equal(fssaiError(''), null);
  assert.equal(fssaiError('10019022008765'), null);
  assert.ok(fssaiError('1001902200876'));
  assert.ok(fssaiError('22222222222222'));
});

test('billTaxLines: labels follow the bill rate; no lines without GST', () => {
  assert.deepEqual(billTaxLines('REGULAR', 1800, 9000, 9000), [
    { label: 'CGST (9%)', paise: 9000 },
    { label: 'SGST (9%)', paise: 9000 },
  ]);
  assert.equal(billTaxLines('UNSET', 500, 250, 250)[0].label, 'CGST (2.5%)');
  assert.deepEqual(billTaxLines('NOT_REGISTERED', 0, 0, 0), []);
  assert.deepEqual(billTaxLines('COMPOSITION', 0, 0, 0), []);
  assert.equal(formatRate(1200), '12%');
});

test('calculateGst: exclusive, inclusive and inter-state', () => {
  assert.deepEqual(calculateGst(100000, 500), { taxablePaise: 100000, cgstPaise: 2500, sgstPaise: 2500, igstPaise: 0, taxPaise: 5000, totalPaise: 105000 });
  assert.deepEqual(calculateGst(100000, 1800, { interState: true }), { taxablePaise: 100000, cgstPaise: 0, sgstPaise: 0, igstPaise: 18000, taxPaise: 18000, totalPaise: 118000 });
  for (const amount of [105000, 99999, 1, 12345, 118000]) {
    for (const rate of [500, 1200, 1800]) {
      const r = calculateGst(amount, rate, { inclusive: true });
      assert.equal(r.totalPaise, amount, `inclusive total for ${amount} @ ${rate}`);
      assert.equal(r.taxablePaise + r.taxPaise, amount);
    }
  }
  assert.equal(calculateGst(105000, 500, { inclusive: true }).taxablePaise, 100000);
  assert.equal(calculateGst(-5, 500).totalPaise, 0);
});
