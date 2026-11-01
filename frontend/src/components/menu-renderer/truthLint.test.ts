import test from 'node:test';
import assert from 'node:assert/strict';
import { allowedFor, decodeEntities, findInventions, tokenize, visibleStrings, type TruthFixture } from './truthLint.ts';

const fixture: TruthFixture = {
  restaurant: { name: "Shobharam's Kitchen", phone: '+91 98765 43210', openingHours: '9 AM to 10 PM' },
  categories: [
    { id: 'c1', name: 'Starters', items: [{ name: 'Paneer Tikka', price: 250 }, { name: 'Dal Fry', halfPrice: 120, fullPrice: 190 }] },
    { id: 'c2', name: 'Breads', items: [{ name: 'Butter Naan', price: 60 }] },
  ],
};
const allowed = allowedFor(fixture);

test('tokenize: lower-cases, splits on punctuation and drops a possessive s', () => {
  assert.deepEqual(tokenize("Chef’s Special ₹250 - 2 pcs"), ['chef', 'special', '250', '2', 'pcs']);
  assert.deepEqual(tokenize('असली मुम्बई'), ['असली', 'मुम्बई']);
});

test('decodeEntities and visibleStrings read what a person reads, including aria-label and alt', () => {
  assert.equal(decodeEntities('Dal &amp; Rice &#x27;n&#39; more &rsquo;'), "Dal & Rice 'n' more ’");
  const html = '<style>.a{content:"X"}</style><div aria-label="Spice level 2 of 3"><img alt="Paneer Tikka"/><p>Hello<!-- -->World</p></div>';
  assert.deepEqual(visibleStrings(html).sort(), ['HelloWorld', 'Paneer Tikka', 'Spice level 2 of 3']);
});

test('data, computed facts and neutral labels pass', () => {
  const html = '<h1>Shobharam&#x27;s Kitchen</h1><p>Menu</p><li>Paneer Tikka ₹250</li><li>Half ₹120 Full ₹190</li><span>3 items</span><span>SK</span><span>01</span><p>Sold out today</p>';
  assert.deepEqual(findInventions(html, allowed), []);
});

test('invented years, awards, brigades, euro prices and fake contacts are caught', () => {
  const html = [
    '<span>ESTD. 1953</span>',
    '<p>Michelin star</p>',
    '<p>Ustad-e-Tandoor</p>',
    '<p>€18</p>',
    '<a>WWW.YOURWEBSITE.COM</a>',
    '<p>Since 1984</p>',
  ].join('');
  const tokens = findInventions(html, allowed).map((item) => item.token);
  for (const expected of ['estd', '1953', 'michelin', 'star', 'ustad', 'tandoor', '18', 'yourwebsite', 'com', '1984', 'since']) {
    assert.ok(tokens.includes(expected), `expected "${expected}" to be flagged, got ${tokens.join(',')}`);
  }
});

test('a stray zero is flagged, but "00" in an opening time is not the number 0', () => {
  assert.deepEqual(findInventions('<p>0</p>', allowed).map((item) => item.token), ['0']);
  const withTime = allowedFor({ ...fixture, restaurant: { ...fixture.restaurant, openingHours: '10:00 to 23:00' } });
  assert.deepEqual(findInventions('<p>0</p>', withTime).map((item) => item.token), ['0']);
  assert.deepEqual(findInventions('<p>10:00</p>', withTime), []);
});

test('single letters pass only when they appear in the data (letter-by-letter animation of the name)', () => {
  assert.deepEqual(findInventions('<p>S</p><p>K</p><p>Z</p>', allowed).map((item) => item.token), ['z']);
});
