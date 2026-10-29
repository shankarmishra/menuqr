import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSpaceScale,
  buildTypeScale,
  DENSITY_MULTIPLIER,
  FLUID_MAX_VIEWPORT,
  FLUID_MIN_VIEWPORT,
  fluidSize,
  LEADING,
  MIN_FONT_SIZE_PX,
  MIN_TAP_TARGET_PX,
  RADIUS_SETS,
  SHADOW_SETS,
  space,
  SPACE_STEPS,
  TYPE_STEPS,
  typeStepSizes,
  type Density,
} from './scales.ts';

const DENSITIES: Density[] = ['compact', 'balanced', 'spacious'];

/** Evaluate a clamp() string at a given viewport width the way a browser would. */
function resolveClamp(value: string, viewportPx: number): number {
  const fixed = /^([\d.]+)px$/.exec(value);
  if (fixed) return Number(fixed[1]);

  const match = /^clamp\(([\d.]+)px, (-?[\d.]+)px \+ ([\d.]+)vw, ([\d.]+)px\)$/.exec(value);
  assert.ok(match, `unparseable clamp: ${value}`);

  const [min, intercept, slopeVw, max] = [match[1], match[2], match[3], match[4]].map(Number);
  const preferred = intercept + (slopeVw / 100) * viewportPx;
  return Math.min(Math.max(preferred, min), max);
}

test('scales: type scale', async (t) => {
  await t.test('never emits a font size below the 12px legibility floor', () => {
    for (const step of TYPE_STEPS) {
      const { min, max } = typeStepSizes(step);
      assert.ok(min >= MIN_FONT_SIZE_PX, `${step} mobile size ${min} is below the floor`);
      assert.ok(max >= MIN_FONT_SIZE_PX, `${step} desktop size ${max} is below the floor`);
    }
  });

  await t.test('is monotonically increasing across steps', () => {
    let previousMin = 0;
    let previousMax = 0;
    for (const step of TYPE_STEPS) {
      const { min, max } = typeStepSizes(step);
      assert.ok(min >= previousMin, `${step} mobile size regressed`);
      assert.ok(max >= previousMax, `${step} desktop size regressed`);
      previousMin = min;
      previousMax = max;
    }
  });

  await t.test('desktop sizes are at least mobile sizes', () => {
    for (const step of TYPE_STEPS) {
      const { min, max } = typeStepSizes(step);
      assert.ok(max >= min, `${step}: desktop ${max} must not be smaller than mobile ${min}`);
    }
  });

  await t.test('display steps separate enough to read as hierarchy', () => {
    // A category heading must be clearly larger than a dish name, not a hair larger.
    const base = typeStepSizes('base').min;
    const xl = typeStepSizes('xl').min;
    assert.ok(xl / base >= 1.4, `xl/base ratio was only ${(xl / base).toFixed(2)}`);
  });

  await t.test('every step resolves to a real size at both viewport anchors', () => {
    const scale = buildTypeScale();
    for (const step of TYPE_STEPS) {
      const { min, max } = typeStepSizes(step);
      const atMobile = resolveClamp(scale[step], FLUID_MIN_VIEWPORT);
      const atDesktop = resolveClamp(scale[step], FLUID_MAX_VIEWPORT);

      assert.ok(Math.abs(atMobile - min) < 0.1, `${step} at 375px resolved to ${atMobile}, want ${min}`);
      assert.ok(Math.abs(atDesktop - max) < 0.1, `${step} at 1280px resolved to ${atDesktop}, want ${max}`);
    }
  });

  await t.test('stays clamped outside the anchor range', () => {
    const scale = buildTypeScale();
    for (const step of TYPE_STEPS) {
      const { min, max } = typeStepSizes(step);
      assert.ok(resolveClamp(scale[step], 280) >= min - 0.01, `${step} dipped below min on a 280px screen`);
      assert.ok(resolveClamp(scale[step], 2560) <= max + 0.01, `${step} exceeded max on a 2560px screen`);
      assert.ok(
        resolveClamp(scale[step], 280) >= MIN_FONT_SIZE_PX - 0.01,
        `${step} broke the 12px floor on a 280px screen`
      );
    }
  });

  await t.test('fluidSize collapses to a fixed value when there is nothing to interpolate', () => {
    assert.equal(fluidSize(16, 16), '16px');
    assert.equal(fluidSize(20, 16), '20px');
  });
});

test('scales: spacing', async (t) => {
  await t.test('stays on the 4px grid in half-pixel increments at every density', () => {
    for (const density of DENSITIES) {
      for (const step of SPACE_STEPS) {
        const value = space(step, density);
        const px = Number(/^([\d.]+)px$/.exec(value)![1]);
        assert.ok(Number.isInteger(px * 2), `${density}/${step} produced ${value}, not a half-pixel value`);
      }
    }
  });

  await t.test('zero is exactly zero and nothing else collapses to zero', () => {
    for (const density of DENSITIES) {
      assert.equal(space(0, density), '0px');
      for (const step of SPACE_STEPS.filter((s) => s !== 0)) {
        assert.notEqual(space(step, density), '0px', `${density}/${step} collapsed to zero`);
      }
    }
  });

  await t.test('is monotonically increasing within a density', () => {
    for (const density of DENSITIES) {
      let previous = -1;
      for (const step of SPACE_STEPS) {
        const px = Number(/^([\d.]+)px$/.exec(space(step, density))![1]);
        assert.ok(px >= previous, `${density}: step ${step} regressed`);
        previous = px;
      }
    }
  });

  await t.test('density ordering holds: compact < balanced < spacious', () => {
    assert.ok(DENSITY_MULTIPLIER.compact < DENSITY_MULTIPLIER.balanced);
    assert.ok(DENSITY_MULTIPLIER.balanced < DENSITY_MULTIPLIER.spacious);

    for (const step of SPACE_STEPS.filter((s) => s >= 4)) {
      const read = (d: Density) => Number(/^([\d.]+)px$/.exec(space(step, d))![1]);
      assert.ok(read('compact') < read('balanced'), `step ${step}: compact must be tighter`);
      assert.ok(read('balanced') < read('spacious'), `step ${step}: spacious must be looser`);
    }
  });

  await t.test('buildSpaceScale exposes every step', () => {
    const scale = buildSpaceScale('balanced');
    assert.equal(Object.keys(scale).length, SPACE_STEPS.length);
    assert.equal(scale['4'], '16px', 'step 4 is the 16px reference');
  });
});

test('scales: radii, shadows and dimensions', async (t) => {
  await t.test('every radius set is internally ordered', () => {
    for (const [token, set] of Object.entries(RADIUS_SETS)) {
      const px = (value: string) => Number(value.replace('px', ''));
      assert.ok(px(set.sm) <= px(set.md), `${token}: sm must not exceed md`);
      assert.ok(px(set.md) <= px(set.lg), `${token}: md must not exceed lg`);
    }
    assert.equal(RADIUS_SETS.none.lg, '0px', 'the none set must be genuinely square');
  });

  await t.test('pill radius is always fully rounded except in the square set', () => {
    for (const [token, set] of Object.entries(RADIUS_SETS)) {
      assert.equal(set.pill, token === 'none' ? '0px' : '999px');
    }
  });

  await t.test('shadow sets define all three depths', () => {
    for (const [token, set] of Object.entries(SHADOW_SETS)) {
      for (const depth of ['sm', 'md', 'lg'] as const) {
        assert.ok(set[depth].length > 0, `${token}.${depth} is empty`);
      }
    }
    assert.equal(SHADOW_SETS.none.lg, 'none');
  });

  await t.test('line heights and tap target meet accessibility expectations', () => {
    assert.ok(LEADING.normal >= 1.5, 'body leading must be at least 1.5 per WCAG 1.4.12');
    assert.ok(LEADING.relaxed > LEADING.normal);
    assert.ok(LEADING.tight < LEADING.snug);
    assert.ok(MIN_TAP_TARGET_PX >= 44, 'tap targets must be at least 44px');
  });
});
