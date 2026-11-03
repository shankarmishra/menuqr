import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { normalizePlan, hasCapability, minimumPlanFor, upgradeMessage, PLAN_CAPABILITIES } from './planCapabilities.ts';

describe('planCapabilities: tier capability matrix', () => {
  it('normalizes plan strings into canonical PlanId', () => {
    assert.equal(normalizePlan('BASIC'), 'basic');
    assert.equal(normalizePlan('basic'), 'basic');
    assert.equal(normalizePlan('INTERMEDIATE'), 'intermediate');
    assert.equal(normalizePlan('intermediate'), 'intermediate');
    assert.equal(normalizePlan('PREMIUM'), 'premium');
    assert.equal(normalizePlan('premium'), 'premium');
    assert.equal(normalizePlan(null), 'basic');
    assert.equal(normalizePlan(undefined), 'basic');
  });

  it('evaluates capability unlocks accurately across tiers', () => {
    // Basic tier capabilities
    assert.equal(hasCapability('basic', 'digital_menu'), true);
    assert.equal(hasCapability('basic', 'qr_code'), true);
    assert.equal(hasCapability('basic', 'analytics'), false);
    assert.equal(hasCapability('basic', 'reception_orders'), false);

    // Intermediate tier capabilities
    assert.equal(hasCapability('intermediate', 'digital_menu'), true);
    assert.equal(hasCapability('intermediate', 'add_item'), true);
    assert.equal(hasCapability('intermediate', 'analytics'), true);
    assert.equal(hasCapability('intermediate', 'reception_orders'), false);

    // Premium tier capabilities
    assert.equal(hasCapability('premium', 'digital_menu'), true);
    assert.equal(hasCapability('premium', 'analytics'), true);
    assert.equal(hasCapability('premium', 'reception_orders'), true);
    assert.equal(hasCapability('premium', 'order_acceptance'), true);
    assert.equal(hasCapability('premium', 'customer_ordering'), true);
  });

  it('identifies minimum required plan for restricted capabilities', () => {
    assert.equal(minimumPlanFor('digital_menu'), 'basic');
    assert.equal(minimumPlanFor('analytics'), 'intermediate');
    assert.equal(minimumPlanFor('reception_orders'), 'premium');
    assert.equal(minimumPlanFor('unknown_capability'), null);
  });

  it('ensures each successive tier is a superset of the previous tier', () => {
    const basicCaps = PLAN_CAPABILITIES.basic;
    const intermediateCaps = PLAN_CAPABILITIES.intermediate;
    const premiumCaps = PLAN_CAPABILITIES.premium;

    for (const cap of basicCaps) {
      assert.ok(intermediateCaps.includes(cap), `Intermediate should include ${cap}`);
      assert.ok(premiumCaps.includes(cap), `Premium should include ${cap}`);
    }

    for (const cap of intermediateCaps) {
      assert.ok(premiumCaps.includes(cap), `Premium should include ${cap}`);
    }
  });

  it('provides friendly upgrade message for blocked capabilities', () => {
    const msgAnalytics = upgradeMessage('analytics');
    assert.ok(msgAnalytics.includes('Intermediate'));
    assert.ok(msgAnalytics.includes('₹3,199/yr'));

    const msgOrders = upgradeMessage('reception_orders');
    assert.ok(msgOrders.includes('Premium'));
    assert.ok(msgOrders.includes('₹6,799/yr'));
  });
});
