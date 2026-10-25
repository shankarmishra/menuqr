import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAiMenuDesign } from '../aiDesignService.js';

test('AI Design Regeneration - Unlocked for Unlimited Repeat Customizations', async () => {
  const tenantId = 'tenant_unlocked_repeat_test_' + Date.now();

  const baseProfile = {
    businessName: 'The Amber Pavilion',
    cuisine: 'North Indian Fine Dining',
    positioning: 'luxury',
    mood: 'mood-heritage',
    hasPhotography: true,
  };

  // 1st Generation: Initial Bespoke Design
  const run1 = await generateAiMenuDesign({
    tenantId,
    profile: baseProfile,
    brief: 'Create royal Awadhi dining identity with rich gold accents and Cinzel serif typography',
  });

  assert.ok(run1.spec, 'First generation should produce a valid specification');
  assert.equal(typeof run1.spec.themeId, 'string');
  assert.ok(run1.spec.composition, 'Valid composition assigned');

  // 2nd Generation: Immediate Regeneration with Mood Change
  const run2 = await generateAiMenuDesign({
    tenantId,
    profile: {
      ...baseProfile,
      mood: 'mood-noir',
    },
    brief: 'Shift to dark velvet ambience with warm candlelight',
  });

  assert.ok(run2.spec, 'Second generation must succeed without 403 or lock errors');
  assert.equal(typeof run2.spec.colors.bg, 'string');

  // 3rd Generation: AI Revision with previous spec
  const run3 = await generateAiMenuDesign({
    tenantId,
    profile: baseProfile,
    brief: 'Make category headers bolder and tighten line spacing',
    previousSpec: run2.spec,
    isRevision: true,
  });

  assert.ok(run3.spec, 'Third iterative revision must succeed and retain brand integrity');
  assert.ok(run3.spec.typography.headingFont, 'Heading font present');
  assert.ok(run3.spec.typography.bodyFont, 'Body font present');

  // 4th Generation: Parametric Artboard Strategy
  const run4 = await generateAiMenuDesign({
    tenantId,
    profile: {
      businessName: 'YourSteak Charcoal Grill',
      cuisine: 'American Steakhouse',
      positioning: 'rustic',
      mood: 'mood-street',
    },
    brief: 'Wooden clipboard with chalkboard slate and dotted-leader prices',
  });

  assert.ok(run4.spec, 'Parametric artboard generation succeeds seamlessly');
});
