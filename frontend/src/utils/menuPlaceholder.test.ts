import test from 'node:test';
import assert from 'node:assert/strict';
import { isPlaceholderMenu } from './menuPlaceholder.ts';

const fakeItems = Array.from({ length: 13 }, (_, index) => ({ id: `item-${index + 1}` }));
const fakeCategories = ['starters', 'main', 'breads', 'desserts', 'beverages'].map((name) => ({ id: `cat-${name}` }));

test('the fixed placeholder dishes of an old backend are recognised', () => {
  assert.equal(isPlaceholderMenu(fakeItems, fakeCategories), true);
});

test('a real menu with generated ids is never mistaken for the placeholder', () => {
  const items = [{ id: '3f2b1c9e-6a1d-4c0e-9d57-0a8f2d7b1e44' }, { id: '8c6d0a53-2b7e-4f1a-b9c4-5e1d3a7f9b20' }];
  const categories = [{ id: '1a2b3c4d-5e6f-4a1b-8c2d-3e4f5a6b7c8d' }];
  assert.equal(isPlaceholderMenu(items, categories), false);
});

test('an empty menu is not a placeholder, and a mix of real and placeholder ids is a real menu', () => {
  assert.equal(isPlaceholderMenu([], []), false);
  assert.equal(isPlaceholderMenu([...fakeItems, { id: '3f2b1c9e-6a1d-4c0e-9d57-0a8f2d7b1e44' }], fakeCategories), false);
  assert.equal(isPlaceholderMenu(fakeItems, [...fakeCategories, { id: '1a2b3c4d-5e6f-4a1b-8c2d-3e4f5a6b7c8d' }]), false);
});
