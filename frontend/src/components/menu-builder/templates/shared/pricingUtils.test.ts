import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeRegExp, formatIndianPrice, parseItemPricing } from './pricingUtils.ts';

type PricingItem = Parameters<typeof parseItemPricing>[0];
const item = (overrides: Record<string, unknown>) => ({ id: 'x', name: 'Dish', category: 'c', ...overrides }) as unknown as PricingItem;

test('a missing price is not shown as ₹0', () => {
  assert.equal(parseItemPricing(item({ price: 0 })).formattedBasePrice, '');
  assert.equal(parseItemPricing(item({ price: '0' })).formattedBasePrice, '');
  assert.equal(parseItemPricing(item({ price: undefined })).formattedBasePrice, '');
  assert.equal(parseItemPricing(item({ price: null })).formattedBasePrice, '');
  assert.equal(parseItemPricing(item({ price: 'abc' })).formattedBasePrice, '');
});

test('a real price is formatted in Indian grouping', () => {
  assert.equal(parseItemPricing(item({ price: 240 })).formattedBasePrice, '₹240');
  assert.equal(parseItemPricing(item({ price: 125000 })).formattedBasePrice, '₹1,25,000');
  assert.equal(formatIndianPrice('₹ 99.50'), '₹99.5');
});

test('half and full prices still come through as variants', () => {
  const pricing = parseItemPricing(item({ halfPrice: 140, fullPrice: 240 }));
  assert.equal(pricing.hasVariants, true);
  assert.deepEqual(pricing.variants.map((variant) => [variant.name, variant.formattedPrice]), [
    ['Half', '₹140'],
    ['Full', '₹240'],
  ]);
});

test('escapeRegExp neutralises every regular-expression character', () => {
  const text = 'a.b*c+d?e^f${g}h(i)j|k[l]m\\n';
  assert.equal(new RegExp(escapeRegExp(text)).test(text), true);
  assert.equal(new RegExp(`^${escapeRegExp('Half (')}$`).test('Half ('), true);
});

test('variant names with regular-expression characters do not crash the menu', () => {
  for (const name of ['Half (', '[Large', 'Full)', 'Reg*', 'A+B', '(?<x>', '\\']) {
    assert.doesNotThrow(
      () =>
        parseItemPricing(
          item({
            description: `${name}: 6 pcs`,
            variants: [{ name, price: 100 }],
          })
        ),
      `variant name ${JSON.stringify(name)} must not throw`
    );
  }
});

test('a variant portion written in the description is still picked up', () => {
  const pricing = parseItemPricing(item({ description: 'Half: 6 pcs', variants: [{ name: 'Half', price: 90 }] }));
  assert.equal(pricing.variants[0].portion, '6 pcs');
  assert.equal(pricing.variants[0].label, 'Half · 6 pcs');
});
