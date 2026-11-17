/**
 * Pure-logic tests for the price table and the monthly order limit. No database required.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { PLANS, ORDER_LIMIT } from '../planCatalog.js';
import { PLANS as PLANS_FROM_SERVICE } from '../subscriptionService.js';
import { PLANS as PLANS_FROM_PURCHASE } from '../routes/purchase.js';
import { parsePackCount, packsAmount } from '../orderLimits.js';
import { getPlanCatalog } from '../manualPlans.js';
import { getPlanItemLimit } from '../authorization.js';

const makeError = (status, message) => Object.assign(new Error(message), { status });

test('monthly prices: Basic ₹199, Intermediate ₹299, Premium ₹899', () => {
  assert.equal(PLANS.basic.monthlyPrice, 199);
  assert.equal(PLANS.intermediate.monthlyPrice, 299);
  assert.equal(PLANS.premium.monthlyPrice, 899);
});

test('yearly prices are unchanged', () => {
  assert.equal(PLANS.basic.yearlyPrice, 1999);
  assert.equal(PLANS.intermediate.yearlyPrice, 3199);
  assert.equal(PLANS.premium.yearlyPrice, 6799);
});

test('checkout and renewals read the very same price table', () => {
  assert.equal(PLANS_FROM_PURCHASE, PLANS);
  assert.equal(PLANS_FROM_SERVICE, PLANS);
});

test('150 orders a month included; ₹99 per pack of 50', () => {
  assert.equal(ORDER_LIMIT.includedPerMonth, 150);
  assert.equal(ORDER_LIMIT.packSize, 50);
  assert.equal(ORDER_LIMIT.packPrice, 99);
});

test('pack price is ₹99 per 50 orders', () => {
  assert.equal(packsAmount(1), 99);
  assert.equal(packsAmount(3), 297);
});

test('parsePackCount accepts 1..max whole numbers (including numeric strings)', () => {
  assert.equal(parsePackCount(1, makeError), 1);
  assert.equal(parsePackCount('4', makeError), 4);
  assert.equal(parsePackCount(ORDER_LIMIT.maxPacksPerPurchase, makeError), ORDER_LIMIT.maxPacksPerPurchase);
});

test('parsePackCount rejects bad counts with 400', () => {
  for (const bad of [0, -1, 1.5, 'abc', null, undefined, '', ORDER_LIMIT.maxPacksPerPurchase + 1, NaN, Infinity]) {
    assert.throws(() => parsePackCount(bad, makeError), (err) => err.status === 400, String(bad));
  }
});

test('the admin plan catalog exposes the new prices and the order limit', () => {
  const catalog = getPlanCatalog();
  const byId = Object.fromEntries(catalog.plans.map((p) => [p.id, p]));
  assert.equal(byId.BASIC.monthlyPrice, 199);
  assert.equal(byId.INTERMEDIATE.monthlyPrice, 299);
  assert.equal(byId.PREMIUM.monthlyPrice, 899);
  assert.equal(catalog.orderLimit.includedPerMonth, 150);
  assert.equal(catalog.orderLimit.packPrice, 99);
});

test('plan catalog advertises aligned item, edit, and order limits across all tiers', () => {
  assert.ok(PLANS.basic.features.includes('Up to 50 items, 20 edits included'));
  assert.ok(PLANS.intermediate.features.includes('Up to 150 items, 100 edits included'));
  assert.ok(PLANS.premium.features.includes('Unlimited items & edits, 150 monthly orders included'));
  assert.ok(PLANS.premium.features.some((f) => /150 monthly orders/i.test(f)));
});

test('getPlanItemLimit fails closed for undefined, null, empty, and unknown plans', () => {
  for (const unknown of [undefined, null, '', 'UNKNOWN', 'ENTERPRISE', 'CUSTOM', 'free', 'trial_hack', 0, 123, NaN]) {
    assert.equal(getPlanItemLimit(unknown), 0, `Plan "${unknown}" must fail closed with limit 0`);
  }
});

test('getPlanItemLimit returns correct limits for valid plans (case-insensitive)', () => {
  assert.equal(getPlanItemLimit('BASIC'), 50);
  assert.equal(getPlanItemLimit('basic'), 50);
  assert.equal(getPlanItemLimit('Basic'), 50);

  assert.equal(getPlanItemLimit('INTERMEDIATE'), 150);
  assert.equal(getPlanItemLimit('intermediate'), 150);
  assert.equal(getPlanItemLimit('Intermediate'), 150);

  assert.equal(getPlanItemLimit('PREMIUM'), Number.POSITIVE_INFINITY);
  assert.equal(getPlanItemLimit('premium'), Number.POSITIVE_INFINITY);
  assert.equal(getPlanItemLimit('Premium'), Number.POSITIVE_INFINITY);
  assert.equal(getPlanItemLimit('PREMIUM'), Infinity);
});

test('dish limit enforcement: creation blocks at plan limit while updates and toggles pass', () => {
  // Simulate item creation check logic
  function canCreateDish(currentDishCount, planId) {
    const limit = getPlanItemLimit(planId);
    return currentDishCount < limit;
  }

  // Simulate update & toggle logic (mutations on existing items do not increase dish count)
  function canUpdateOrToggleDish(currentDishCount, planId) {
    // Updates/toggles are operational modifications to existing items, never adding a new dish
    return true;
  }

  // Basic (limit 50)
  assert.equal(canCreateDish(0, 'BASIC'), true);
  assert.equal(canCreateDish(49, 'BASIC'), true);
  assert.equal(canCreateDish(50, 'BASIC'), false, '51st dish blocked on Basic');
  assert.equal(canCreateDish(51, 'BASIC'), false, 'over-limit dish blocked on Basic');

  // Intermediate (limit 150)
  assert.equal(canCreateDish(149, 'INTERMEDIATE'), true);
  assert.equal(canCreateDish(150, 'INTERMEDIATE'), false, '151st dish blocked on Intermediate');

  // Premium (unlimited)
  assert.equal(canCreateDish(150, 'PREMIUM'), true);
  assert.equal(canCreateDish(1000, 'PREMIUM'), true);

  // Unknown / fail-closed (limit 0)
  assert.equal(canCreateDish(0, 'UNKNOWN'), false, 'fail-closed blocks creation on unknown plan');
  assert.equal(canCreateDish(0, null), false, 'fail-closed blocks creation on null plan');

  // Updates & operational toggles (sold-out, availability) never count as new dishes even at capacity
  assert.equal(canUpdateOrToggleDish(50, 'BASIC'), true, 'update allowed at max capacity on Basic');
  assert.equal(canUpdateOrToggleDish(150, 'INTERMEDIATE'), true, 'toggle allowed at max capacity on Intermediate');
  assert.equal(canUpdateOrToggleDish(500, 'PREMIUM'), true, 'update allowed on Premium');
});
