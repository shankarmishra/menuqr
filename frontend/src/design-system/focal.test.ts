import test from 'node:test';
import assert from 'node:assert/strict';
import { describeFocal, focalToOffset, nudgeFocal, positionToFocal } from './focal.ts';

const BOUNDS = { left: 100, top: 50, width: 200, height: 100 };

test('positionToFocal: pointer -> focal point', async (t) => {
  await t.test('the element centre maps to (0.5, 0.5)', () => {
    assert.deepEqual(positionToFocal({ clientX: 200, clientY: 100 }, BOUNDS), { x: 0.5, y: 0.5 });
  });

  await t.test('the four corners map to the four extremes', () => {
    assert.deepEqual(positionToFocal({ clientX: 100, clientY: 50 }, BOUNDS), { x: 0, y: 0 }, 'top-left');
    assert.deepEqual(positionToFocal({ clientX: 300, clientY: 50 }, BOUNDS), { x: 1, y: 0 }, 'top-right');
    assert.deepEqual(positionToFocal({ clientX: 100, clientY: 150 }, BOUNDS), { x: 0, y: 1 }, 'bottom-left');
    assert.deepEqual(positionToFocal({ clientX: 300, clientY: 150 }, BOUNDS), { x: 1, y: 1 }, 'bottom-right');
  });

  await t.test('a drag past the edge clamps to that edge rather than going out of range', () => {
    assert.deepEqual(positionToFocal({ clientX: -500, clientY: -500 }, BOUNDS), { x: 0, y: 0 });
    assert.deepEqual(positionToFocal({ clientX: 5000, clientY: 5000 }, BOUNDS), { x: 1, y: 1 });
  });

  await t.test('is proportional, not just clamped at the extremes', () => {
    // 25% across, 75% down.
    assert.deepEqual(positionToFocal({ clientX: 150, clientY: 125 }, BOUNDS), { x: 0.25, y: 0.75 });
  });

  await t.test('degenerates to the centre for a zero-size element rather than dividing by zero', () => {
    assert.deepEqual(positionToFocal({ clientX: 10, clientY: 10 }, { left: 0, top: 0, width: 0, height: 0 }), {
      x: 0.5,
      y: 0.5,
    });
  });
});

test('focalToOffset: focal point -> pixel offset (inverse of positionToFocal)', async (t) => {
  await t.test('round-trips through positionToFocal for interior points', () => {
    for (const focal of [{ x: 0.1, y: 0.9 }, { x: 0.5, y: 0.5 }, { x: 0.33, y: 0.67 }]) {
      const offset = focalToOffset(focal, BOUNDS);
      const back = positionToFocal({ clientX: BOUNDS.left + offset.x, clientY: BOUNDS.top + offset.y }, BOUNDS);
      assert.ok(Math.abs(back.x - focal.x) < 1e-9, `x drifted: ${JSON.stringify(back)}`);
      assert.ok(Math.abs(back.y - focal.y) < 1e-9, `y drifted: ${JSON.stringify(back)}`);
    }
  });

  await t.test('clamps an out-of-range focal value rather than placing the dot outside the frame', () => {
    assert.deepEqual(focalToOffset({ x: -1, y: 2 }, { width: 200, height: 100 }), { x: 0, y: 100 });
  });
});

test('nudgeFocal: keyboard control', async (t) => {
  await t.test('each arrow key moves exactly one axis, in the expected direction', () => {
    const centre = { x: 0.5, y: 0.5 };
    assert.ok(nudgeFocal(centre, 'ArrowUp').y < centre.y);
    assert.ok(nudgeFocal(centre, 'ArrowDown').y > centre.y);
    assert.ok(nudgeFocal(centre, 'ArrowLeft').x < centre.x);
    assert.ok(nudgeFocal(centre, 'ArrowRight').x > centre.x);

    assert.equal(nudgeFocal(centre, 'ArrowUp').x, centre.x, 'vertical nudge must not move x');
    assert.equal(nudgeFocal(centre, 'ArrowLeft').y, centre.y, 'horizontal nudge must not move y');
  });

  await t.test('the coarse step is larger than the fine step', () => {
    const centre = { x: 0.5, y: 0.5 };
    const fineDelta = 0.5 - nudgeFocal(centre, 'ArrowUp', false).y;
    const coarseDelta = 0.5 - nudgeFocal(centre, 'ArrowUp', true).y;
    assert.ok(coarseDelta > fineDelta);
  });

  await t.test('clamps at the edges instead of leaving the 0-1 range', () => {
    assert.deepEqual(nudgeFocal({ x: 0, y: 0 }, 'ArrowLeft'), { x: 0, y: 0 });
    assert.deepEqual(nudgeFocal({ x: 0, y: 0 }, 'ArrowUp'), { x: 0, y: 0 });
    assert.deepEqual(nudgeFocal({ x: 1, y: 1 }, 'ArrowRight'), { x: 1, y: 1 });
    assert.deepEqual(nudgeFocal({ x: 1, y: 1 }, 'ArrowDown'), { x: 1, y: 1 });
  });

  await t.test('repeated nudges accumulate rather than resetting', () => {
    let point = { x: 0.5, y: 0.5 };
    for (let i = 0; i < 5; i += 1) point = nudgeFocal(point, 'ArrowRight');
    assert.ok(point.x > 0.5 + 0.05, `expected meaningful accumulated movement, got x=${point.x}`);
  });
});

test('describeFocal: human-readable label', async (t) => {
  await t.test('the dead centre is described as centred', () => {
    assert.equal(describeFocal({ x: 0.5, y: 0.5 }), 'centred');
  });

  await t.test('the four corners and four edges are named correctly', () => {
    assert.equal(describeFocal({ x: 0.1, y: 0.1 }), 'top left');
    assert.equal(describeFocal({ x: 0.9, y: 0.1 }), 'top right');
    assert.equal(describeFocal({ x: 0.1, y: 0.9 }), 'bottom left');
    assert.equal(describeFocal({ x: 0.9, y: 0.9 }), 'bottom right');
    assert.equal(describeFocal({ x: 0.5, y: 0.1 }), 'top');
    assert.equal(describeFocal({ x: 0.5, y: 0.9 }), 'bottom');
    assert.equal(describeFocal({ x: 0.1, y: 0.5 }), 'left');
    assert.equal(describeFocal({ x: 0.9, y: 0.5 }), 'right');
  });

  await t.test('never throws for an out-of-range input', () => {
    assert.doesNotThrow(() => describeFocal({ x: -5, y: 50 }));
  });
});
