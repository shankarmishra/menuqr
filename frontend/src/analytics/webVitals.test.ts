import test from 'node:test';
import assert from 'node:assert/strict';
import { addLayoutShift, pickInp, rateVital } from './webVitals.ts';

test('ratings follow the published thresholds', () => {
  assert.equal(rateVital('LCP', 2500), 'good');
  assert.equal(rateVital('LCP', 2501), 'needs-improvement');
  assert.equal(rateVital('LCP', 4001), 'poor');
  assert.equal(rateVital('INP', 200), 'good');
  assert.equal(rateVital('INP', 501), 'poor');
  assert.equal(rateVital('CLS', 0.1), 'good');
  assert.equal(rateVital('CLS', 0.2), 'needs-improvement');
  assert.equal(rateVital('CLS', 0.26), 'poor');
});

test('layout shifts less than 1 s apart add up in one session', () => {
  let state = addLayoutShift(null, 0, { startTime: 100, value: 0.05 });
  state = addLayoutShift(state.current, state.best, { startTime: 600, value: 0.04 });
  assert.equal(Math.round(state.best * 100), 9);
});

test('a gap of 1 s starts a new session and CLS keeps the largest one', () => {
  let state = addLayoutShift(null, 0, { startTime: 100, value: 0.2 });
  state = addLayoutShift(state.current, state.best, { startTime: 1200, value: 0.05 });
  assert.equal(state.current.value, 0.05);
  assert.equal(state.best, 0.2);
});

test('a session is cut after 5 s even when shifts keep coming', () => {
  let state = addLayoutShift(null, 0, { startTime: 0, value: 0.01 });
  for (let t = 900; t <= 4500; t += 900) state = addLayoutShift(state.current, state.best, { startTime: t, value: 0.01 });
  const before = state.current.value;
  state = addLayoutShift(state.current, state.best, { startTime: 5400, value: 0.01 });
  assert.equal(state.current.value, 0.01);
  assert.equal(state.best, before);
});

test('INP is the slowest interaction, skipping one outlier per 50', () => {
  assert.equal(pickInp([]), null);
  assert.equal(pickInp([80, 300, 120]), 300);
  const many = Array.from({ length: 49 }, () => 100).concat([900]);
  assert.equal(pickInp(many), 100);
});
