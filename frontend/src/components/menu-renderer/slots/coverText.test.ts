import test from 'node:test';
import assert from 'node:assert/strict';
import { fittedSize, splitRestaurantName } from './coverText.ts';

test('splitRestaurantName: a one-word name is never padded with an invented second word', () => {
  assert.deepEqual(splitRestaurantName("Shobharam's"), { top: '', main: "Shobharam's" });
  assert.deepEqual(splitRestaurantName('  Mannat  '), { top: '', main: 'Mannat' });
});

test('splitRestaurantName: two words, then halves for longer names', () => {
  assert.deepEqual(splitRestaurantName('Shankar Dhaba'), { top: 'Shankar', main: 'Dhaba' });
  assert.deepEqual(splitRestaurantName('Mannat Tandoori Junction'), { top: 'Mannat Tandoori', main: 'Junction' });
  // An odd word count puts the extra word on the small top line.
  assert.deepEqual(splitRestaurantName('The Great Indian Food Court'), { top: 'The Great Indian', main: 'Food Court' });
});

test('splitRestaurantName: empty and Devanagari names', () => {
  assert.deepEqual(splitRestaurantName(''), { top: '', main: '' });
  assert.deepEqual(splitRestaurantName('मन्नत तंदूरी जंक्शन'), { top: 'मन्नत तंदूरी', main: 'जंक्शन' });
});

test('fittedSize: short text keeps the base size, long text shrinks, and there is a floor', () => {
  assert.equal(fittedSize(2, 'DHABA', 10, 0.95), '2.000rem');
  assert.equal(fittedSize(2, 'ABCDEFGHIJ', 10, 0.95), '2.000rem');
  assert.equal(fittedSize(2, 'ABCDEFGHIJKLMNOPQRST', 10, 0.95), '1.000rem');
  assert.equal(fittedSize(2, 'X'.repeat(200), 10, 0.95), '0.950rem');
});
