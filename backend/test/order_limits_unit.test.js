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

test('Premium advertises the included orders', () => {
  assert.ok(PLANS.premium.features.some((f) => /150 online orders/i.test(f)));
});
