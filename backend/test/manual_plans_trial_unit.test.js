/**
 * Pure-logic tests for offline (manual) plans and the free trial. No database required.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PLAN_CAPABILITIES,
  ALL_CAPABILITIES,
  TRIAL_DAYS,
  TRIAL_PLAN_ID,
  statusAllowsAccess,
  normalizeFeatureList,
  capabilitiesForSubscription,
} from '../authorization.js';
import { validateManualPlanInput, addDuration, getPlanCatalog } from '../manualPlans.js';
import { isFreshPlanPurchase, calculateProration } from '../subscriptionService.js';
import { reminderTypeFor } from '../scripts/subscription-reminders.js';

const NOW = new Date('2026-11-14T10:00:00.000Z');

const validInput = (overrides = {}) => ({
  planId: 'basic',
  agreedAmount: 300,
  paymentMode: 'upi',
  durationValue: 1,
  durationUnit: 'months',
  ...overrides,
});

test('trial is 14 days of Premium capabilities', () => {
  assert.equal(TRIAL_DAYS, 14);
  assert.equal(TRIAL_PLAN_ID, 'PREMIUM');
  assert.ok(PLAN_CAPABILITIES[TRIAL_PLAN_ID]);
});

test('TRIAL is an access-granting status; EXPIRED is not', () => {
  assert.equal(statusAllowsAccess('TRIAL'), true);
  assert.equal(statusAllowsAccess('trial'), true);
  assert.equal(statusAllowsAccess('ACTIVE'), true);
  assert.equal(statusAllowsAccess('EXPIRED'), false);
  assert.equal(statusAllowsAccess(undefined), false);
});

test('normalizeFeatureList keeps only known capabilities and de-duplicates', () => {
  assert.deepEqual(normalizeFeatureList(['analytics', 'analytics', 'rm_rf', ' qr_code ']), ['analytics', 'qr_code']);
  assert.deepEqual(normalizeFeatureList('["templates"]'), ['templates']);
  assert.equal(normalizeFeatureList(null), null);
  assert.equal(normalizeFeatureList('not json'), null);
  assert.equal(normalizeFeatureList({ analytics: true }), null);
});

test('custom_features override the plan default; null falls back to the plan', () => {
  assert.deepEqual(capabilitiesForSubscription({ plan_id: 'BASIC', custom_features: null }), PLAN_CAPABILITIES.BASIC);
  assert.deepEqual(
    capabilitiesForSubscription({ plan_id: 'BASIC', custom_features: ['digital_menu', 'analytics'] }),
    ['digital_menu', 'analytics']
  );
  // Unknown plans fall back to BASIC, never to everything.
  assert.deepEqual(capabilitiesForSubscription({ plan_id: 'GOLD' }), PLAN_CAPABILITIES.BASIC);
});

test('validateManualPlanInput normalizes a valid offline deal', () => {
  const data = validateManualPlanInput(validInput(), NOW);
  assert.equal(data.planId, 'BASIC');
  assert.equal(data.agreedAmount, 300);
  assert.equal(data.paymentMode, 'UPI');
  assert.equal(data.durationUnit, 'MONTHS');
  assert.equal(data.listPrice, 1999);
  assert.deepEqual(data.enabledFeatures, PLAN_CAPABILITIES.BASIC, 'defaults to the plan features');
  assert.equal(data.carryOverRemainingDays, false);
});

test('validateManualPlanInput accepts a custom feature selection beyond the plan', () => {
  const data = validateManualPlanInput(validInput({ enabledFeatures: ['digital_menu', 'customer_ordering', 'bogus'] }), NOW);
  assert.deepEqual(data.enabledFeatures, ['digital_menu', 'customer_ordering']);
});

test('validateManualPlanInput rejects bad input with 400', () => {
  const cases = [
    validInput({ planId: 'gold' }),
    validInput({ planId: '' }),
    validInput({ agreedAmount: -1 }),
    validInput({ agreedAmount: 'abc' }),
    validInput({ agreedAmount: 1e9 }),
    validInput({ paymentMode: 'BITCOIN' }),
    validInput({ durationValue: 0 }),
    validInput({ durationValue: 1.5 }),
    validInput({ durationUnit: 'WEEKS' }),
    validInput({ durationValue: 6, durationUnit: 'YEARS' }),
    validInput({ enabledFeatures: [] }),
    validInput({ enabledFeatures: ['bogus'] }),
    validInput({ paidOn: '14/11/2026' }),
  ];
  for (const input of cases) {
    assert.throws(() => validateManualPlanInput(input, NOW), (err) => err.status === 400, JSON.stringify(input));
  }
  assert.throws(() => validateManualPlanInput(null, NOW), (err) => err.status === 400);
});

test('a ₹0 deal (free goodwill activation) is allowed', () => {
  assert.equal(validateManualPlanInput(validInput({ agreedAmount: 0 }), NOW).agreedAmount, 0);
});

test('addDuration uses calendar days/months/years', () => {
  assert.equal(addDuration(NOW, 14, 'DAYS').toISOString(), '2026-11-28T10:00:00.000Z');
  assert.equal(addDuration(NOW, 1, 'MONTHS').toISOString(), '2026-12-14T10:00:00.000Z');
  assert.equal(addDuration(NOW, 1, 'YEARS').toISOString(), '2027-11-14T10:00:00.000Z');
  assert.throws(() => addDuration(NOW, 1, 'WEEKS'), (err) => err.status === 400);
});

test('plan catalog lists every plan and every capability', () => {
  const catalog = getPlanCatalog();
  assert.deepEqual(catalog.plans.map((p) => p.id), ['BASIC', 'INTERMEDIATE', 'PREMIUM']);
  assert.equal(catalog.capabilities.length, ALL_CAPABILITIES.length);
  assert.ok(catalog.paymentModes.includes('CASH'));
  assert.equal(catalog.trial.days, 14);
});

test('trial and lapsed plans buy any tier at full price', () => {
  assert.equal(isFreshPlanPurchase({ status: 'TRIAL' }), true);
  assert.equal(isFreshPlanPurchase({ status: 'ACTIVE' }, true), true);
  assert.equal(isFreshPlanPurchase({ status: 'ACTIVE' }, false), false);
  assert.equal(isFreshPlanPurchase(null), true);

  // 'none' has rank 0, so even Basic is allowed and no proration credit is given.
  const preview = calculateProration({ currentPlanId: 'none', currentExpiresAt: null, targetPlanId: 'basic', now: NOW });
  assert.equal(preview.isUpgradeAllowed, true);
  assert.equal(preview.prorationCreditPaise, 0);
  assert.equal(preview.fullPricePaise, 199900);
});

test('reminders: trials warn at 3 and 1 days and expire at 0', () => {
  const at = (days, status = 'TRIAL') => ({ status, expires_at: new Date(NOW.getTime() + days * 86_400_000 - 1000) });
  assert.equal(reminderTypeFor(at(3), NOW)?.type, 'TRIAL_WARNING_3D');
  assert.equal(reminderTypeFor(at(1), NOW)?.type, 'TRIAL_WARNING_1D');
  assert.equal(reminderTypeFor(at(5), NOW), null);
  assert.equal(reminderTypeFor(at(0), NOW)?.type, 'TRIAL_EXPIRED');
  assert.equal(reminderTypeFor(at(-2), NOW)?.type, 'TRIAL_EXPIRED');
  // Paid plans keep their own schedule.
  assert.equal(reminderTypeFor(at(10, 'ACTIVE'), NOW)?.type, 'SUB_WARNING_10D');
  assert.equal(reminderTypeFor(at(0, 'ACTIVE'), NOW)?.type, 'SUB_EXPIRED');
  assert.equal(reminderTypeFor(at(0, 'EXPIRED'), NOW), null);
});
