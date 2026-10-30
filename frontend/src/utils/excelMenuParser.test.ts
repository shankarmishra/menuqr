import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseImageUrl, parsePrice, parseDietType, getDemoMenuData } from './excelMenuParser.ts';

describe('excelMenuParser: parseImageUrl', () => {
  it('extracts standard web URLs', () => {
    const url = 'https://images.unsplash.com/photo-1567184109191-37a69f369f24?w=600';
    assert.equal(parseImageUrl(url), url);
  });

  it('strips enclosing quotes and whitespace', () => {
    const url = '  "https://example.com/dish.jpg"  ';
    assert.equal(parseImageUrl(url), 'https://example.com/dish.jpg');
  });

  it('handles excel HYPERLINK formulas', () => {
    const formula = '=HYPERLINK("https://cdn.restaurant.com/paneer.webp", "Photo")';
    assert.equal(parseImageUrl(formula), 'https://cdn.restaurant.com/paneer.webp');
  });

  it('preserves root-relative uploaded paths', () => {
    assert.equal(parseImageUrl('/uploads/dishes/shobharam-special.webp'), '/uploads/dishes/shobharam-special.webp');
    assert.equal(parseImageUrl('/img/photos/photo-1567184109191.webp'), '/img/photos/photo-1567184109191.webp');
  });

  it('prepends https to bare domains', () => {
    assert.equal(parseImageUrl('images.unsplash.com/photo-sample.jpg'), 'https://images.unsplash.com/photo-sample.jpg');
  });

  it('returns empty string for null, undefined, or empty values', () => {
    assert.equal(parseImageUrl(''), '');
    assert.equal(parseImageUrl(null), '');
    assert.equal(parseImageUrl(undefined), '');
    assert.equal(parseImageUrl('   '), '');
  });
});

describe('excelMenuParser: parseDietType & parsePrice', () => {
  it('identifies veg vs non-veg from keywords', () => {
    assert.equal(parseDietType('Veg'), 'veg');
    assert.equal(parseDietType('Pure Vegetarian'), 'veg');
    assert.equal(parseDietType('Chicken Tikka'), 'non-veg');
    assert.equal(parseDietType('Fish Curry'), 'non-veg');
    assert.equal(parseDietType('NV'), 'non-veg');
    assert.equal(parseDietType('Vegan Salad'), 'vegan');
  });

  it('parses valid numeric prices and cleans currency symbols', () => {
    assert.equal(parsePrice('₹240'), 240);
    assert.equal(parsePrice(' 180.50 '), 180.5);
    assert.equal(parsePrice(320), 320);
    assert.equal(parsePrice('—'), undefined);
    assert.equal(parsePrice(''), undefined);
  });
});

describe('excelMenuParser: getDemoMenuData', () => {
  it('returns rich demo menu with preloaded photos and bestsellers', () => {
    const demo = getDemoMenuData();
    assert.equal(demo.items.length, 13);
    assert.ok(demo.items[0].imageUrl.startsWith('https://'));
    assert.equal(demo.items[0].isBestseller, true);
    assert.equal(demo.categories.length, 5);
  });
});
