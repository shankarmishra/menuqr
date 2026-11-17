// Restaurant GST/FSSAI rules, bill tax maths and phone normalisation. No database needed.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateGSTIN,
  validateGstSettings,
  validateFSSAI,
  normalizeInternationalMobile,
  normalizePhoneNumber,
  validateContacts,
} from '../validation.js';
import { computeBillTax, normalizeTaxSettings, taxSettingsOfToken } from '../billTax.js';

// Real-format GSTINs whose check character is correct.
const GOOD_GSTIN = '27AAPFU0939F1ZV';
const GOOD_GSTIN_2 = '24AAACC1206D1ZM';

test('GSTIN: accepts correct GSTINs, upper-cases and strips spaces', () => {
  assert.deepEqual(validateGSTIN(GOOD_GSTIN), { ok: true, value: GOOD_GSTIN });
  assert.deepEqual(validateGSTIN(GOOD_GSTIN_2), { ok: true, value: GOOD_GSTIN_2 });
  assert.equal(validateGSTIN(' 27aapfu0939f1zv ').value, GOOD_GSTIN);
  assert.equal(validateGSTIN('27 AAPFU 0939F1ZV').value, GOOD_GSTIN);
});

test('GSTIN: rejects wrong length, shape, state code and check character with a clear reason', () => {
  const cases = {
    '': /Enter your 15-character GSTIN/,
    '27AAPFU0939F1Z': /exactly 15 characters/,
    '27AAPFU0939F1ZVX': /exactly 15 characters/,
    '2AAAPFU0939F1ZV': /does not look like a GSTIN/,
    '27AAPFU0939F1YV': /does not look like a GSTIN/,
    '00AAPFU0939F1ZV': /state code/,
    '45AAPFU0939F1ZV': /state code/,
    '27AAPFU0939F1ZW': /last character/,
    '27AAPFU0939F1Z1': /last character/,
  };
  for (const [input, reason] of Object.entries(cases)) {
    const result = validateGSTIN(input);
    assert.equal(result.ok, false, input);
    assert.match(result.reason, reason, input);
  }
});

test('GST settings: REGULAR and COMPOSITION need a GSTIN; UNSET and NOT_REGISTERED never keep one', () => {
  assert.deepEqual(validateGstSettings({ gstMode: 'REGULAR', gstin: GOOD_GSTIN, gstRateBps: 1800 }).value, { gstMode: 'REGULAR', gstin: GOOD_GSTIN, gstRateBps: 1800 });
  assert.deepEqual(validateGstSettings({ gstMode: 'COMPOSITION', gstin: GOOD_GSTIN, gstRateBps: 500 }).value, { gstMode: 'COMPOSITION', gstin: GOOD_GSTIN, gstRateBps: 0 });
  assert.deepEqual(validateGstSettings({ gstMode: 'NOT_REGISTERED', gstin: GOOD_GSTIN }).value, { gstMode: 'NOT_REGISTERED', gstin: null, gstRateBps: 0 });
  assert.deepEqual(validateGstSettings({}).value, { gstMode: 'UNSET', gstin: null, gstRateBps: 500 });

  assert.equal(validateGstSettings({ gstMode: 'REGULAR' }).field, 'gstin');
  assert.equal(validateGstSettings({ gstMode: 'COMPOSITION', gstin: '27AAPFU0939F1ZW' }).field, 'gstin');
  assert.equal(validateGstSettings({ gstMode: 'REGULAR', gstin: GOOD_GSTIN, gstRateBps: 700 }).field, 'gstRateBps');
  assert.equal(validateGstSettings({ gstMode: 'SOMETHING' }).field, 'gstMode');
});

test('FSSAI: exactly 14 digits, not one repeated digit', () => {
  assert.equal(validateFSSAI('10019022008765'), true);
  assert.equal(validateFSSAI('21219106000123'), true);
  assert.equal(validateFSSAI('1001902200876'), false);
  assert.equal(validateFSSAI('1001902200876A'), false);
  assert.equal(validateFSSAI('11111111111111'), false);
  assert.equal(validateFSSAI(''), false);
});

test('bill tax: each mode gives the right GST, CGST and SGST are equal halves', () => {
  const sub = 123456; // ₹1,234.56
  assert.deepEqual(computeBillTax(sub, { mode: 'UNSET' }), { mode: 'UNSET', rateBps: 500, cgstPaise: 3086, sgstPaise: 3086, taxPaise: 6172 });
  assert.deepEqual(computeBillTax(sub, { mode: 'REGULAR', rateBps: 500 }).taxPaise, 6172);
  assert.deepEqual(computeBillTax(sub, { mode: 'REGULAR', rateBps: 1800 }), { mode: 'REGULAR', rateBps: 1800, cgstPaise: 11111, sgstPaise: 11111, taxPaise: 22222 });
  assert.equal(computeBillTax(sub, { mode: 'NOT_REGISTERED', rateBps: 1800 }).taxPaise, 0);
  assert.equal(computeBillTax(sub, { mode: 'COMPOSITION', rateBps: 500 }).taxPaise, 0);
  assert.equal(computeBillTax(0, { mode: 'REGULAR', rateBps: 500 }).taxPaise, 0);
  assert.equal(computeBillTax(-50, { mode: 'REGULAR', rateBps: 500 }).taxPaise, 0);
});

test('bill tax: unknown modes and rates fall back safely', () => {
  assert.deepEqual(normalizeTaxSettings('bogus', 1800), { mode: 'UNSET', rateBps: 500 });
  assert.deepEqual(normalizeTaxSettings('REGULAR', 999), { mode: 'REGULAR', rateBps: 500 });
  assert.deepEqual(normalizeTaxSettings('regular', 1200), { mode: 'REGULAR', rateBps: 1200 });
});

test('a bill keeps the rule it was created with; old bills keep their old behaviour', () => {
  assert.deepEqual(taxSettingsOfToken({ tax_mode: 'REGULAR', tax_rate_bps: 1800, tax_paise: 0 }), { mode: 'REGULAR', rateBps: 1800 });
  assert.deepEqual(taxSettingsOfToken({ tax_mode: 'NOT_REGISTERED', tax_rate_bps: 0 }), { mode: 'NOT_REGISTERED', rateBps: 0 });
  // Created before migration 027: 5% if tax had been charged, otherwise none (old QR-order bills).
  assert.deepEqual(taxSettingsOfToken({ tax_mode: null, tax_paise: 250 }), { mode: 'UNSET', rateBps: 500 });
  assert.deepEqual(taxSettingsOfToken({ tax_mode: null, tax_paise: 0 }), { mode: 'NOT_REGISTERED', rateBps: 0 });
});

test('phones: Indian numbers unchanged; other countries accepted only with an explicit code', () => {
  assert.equal(normalizePhoneNumber('98765 43210'), '+919876543210');
  assert.equal(normalizePhoneNumber('+91 98765 43210'), '+919876543210');
  assert.equal(normalizeInternationalMobile('+971 50 123 4567'), '+971501234567');
  assert.equal(normalizeInternationalMobile('+977 98 0123 4567'), '+9779801234567');
  assert.equal(normalizeInternationalMobile('+91 98765 43210'), null, 'Indian numbers use the Indian rules');
  assert.equal(normalizeInternationalMobile('971501234567'), null, 'needs the + country code');
  assert.equal(normalizeInternationalMobile('+1 234'), null, 'too short');
  assert.equal(normalizeInternationalMobile('+44 abc 1234 5678'), null);
});

test('contacts: an international WhatsApp mobile is kept; an international landline is not', () => {
  const cleaned = validateContacts([
    { number: '+971 50 123 4567', kind: 'mobile', whatsapp: true, public: true },
    { number: '+971 4 123 4567', kind: 'landline', public: true },
    { number: '98765 43210', kind: 'mobile', public: true },
  ]);
  assert.deepEqual(cleaned.map((c) => c.number), ['+971501234567', '+919876543210']);
  assert.equal(cleaned[0].whatsapp, true);
});
