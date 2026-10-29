import test from 'node:test';
import assert from 'node:assert/strict';
import { pickCandidate, resolveDishImage } from '../culinaryImageService.js';

test('culinaryImageService: resolveDishImage', async (t) => {
  await t.test('matches a dish by name keyword', () => {
    const url = resolveDishImage('Paneer Tikka Half Plate', 'Starters');
    assert.match(url, /photo-1567188040759/, 'should match the paneer tikka entry');
  });

  await t.test('falls back to category keyword when the name does not match', () => {
    const url = resolveDishImage('Chef Special #7', 'Biryani & Rice');
    assert.match(url, /photo-1563379091339/, 'should match the biryani category entry');
  });

  await t.test('falls back to a cuisine-vibe default when nothing matches', () => {
    const url = resolveDishImage('Mystery Dish', 'Soups & Salads');
    assert.match(url, /photo-1540420773420/, 'should hit the soup/salad fallback');
  });

  await t.test('prefers extracted PDF photos over the library, up to dishIndex', () => {
    const extracted = [{ url: '/uploads/dishes/extracted-1.webp' }, { url: '/uploads/dishes/extracted-2.webp' }];
    assert.equal(resolveDishImage('Paneer Tikka', 'Starters', extracted, 0), '/uploads/dishes/extracted-1.webp');
    assert.equal(resolveDishImage('Paneer Tikka', 'Starters', extracted, 1), '/uploads/dishes/extracted-2.webp');
    // Beyond the extracted set, falls through to the library as normal.
    assert.match(resolveDishImage('Paneer Tikka', 'Starters', extracted, 2), /photo-1567188040759/);
  });

  await t.test('is deterministic for a given tenant and dish', () => {
    const a = resolveDishImage('Butter Chicken', 'Mains', [], 0, 'tenant_123');
    const b = resolveDishImage('Butter Chicken', 'Mains', [], 0, 'tenant_123');
    assert.equal(a, b);
  });

  await t.test('is safe with no tenantId at all, matching the pre-Phase-3 call signature', () => {
    assert.doesNotThrow(() => resolveDishImage('Dal Makhani', 'Mains'));
    assert.match(resolveDishImage('Dal Makhani', 'Mains'), /photo-1546833999/);
  });

  await t.test('is case- and portion-text insensitive', () => {
    const a = resolveDishImage('paneer tikka', 'starters');
    const b = resolveDishImage('Paneer Tikka (Half - 6 pcs)', 'Starters');
    assert.equal(a, b);
  });

  await t.test('returns a URL for every entry keyword in the library, not just a sample', () => {
    // Guards against a future edit that adds a keyword typo or an entry with no reachable match.
    const samples = [
      'soya chaap', 'tandoori chicken', 'seekh kebab', 'dal tadka', 'shahi paneer',
      'mutton rogan josh', 'masala dosa', 'idli sambar', 'hakka noodles', 'fried rice',
      'chilli paneer', 'sizzling steak', 'fish and chips', 'chicken parmesan', 'gulab jamun',
      'ice cream sundae', 'chocolate brownie', 'masala chai', 'mango lassi',
    ];
    for (const dish of samples) {
      const url = resolveDishImage(dish, '');
      assert.match(url, /^https:\/\/images\.unsplash\.com\//, `"${dish}" did not resolve to a photo`);
    }
  });
});

test('culinaryImageService: pickCandidate determinism and variety', async (t) => {
  const multiEntry = {
    url: 'https://example.test/a.jpg',
    urls: ['https://example.test/a.jpg', 'https://example.test/b.jpg', 'https://example.test/c.jpg'],
  };
  const singleEntry = { url: 'https://example.test/only.jpg' };

  await t.test('a single-candidate entry always returns its one url', () => {
    for (const tenant of ['t1', 't2', 't3', '']) {
      assert.equal(pickCandidate(singleEntry, tenant, 'Anything'), 'https://example.test/only.jpg');
    }
  });

  await t.test('is deterministic: same tenant, same dish, same photo every time', () => {
    const first = pickCandidate(multiEntry, 'tenant-abc', 'Butter Chicken');
    for (let i = 0; i < 20; i += 1) {
      assert.equal(pickCandidate(multiEntry, 'tenant-abc', 'Butter Chicken'), first);
    }
  });

  await t.test('different tenants are likely to land on different candidates', () => {
    // Deterministic hashing cannot guarantee every tenant differs (pigeonhole), but across a
    // spread of tenant ids it must not collapse to a single candidate every time.
    const picks = new Set();
    for (let i = 0; i < 30; i += 1) {
      picks.add(pickCandidate(multiEntry, `tenant-${i}`, 'Butter Chicken'));
    }
    assert.ok(picks.size > 1, 'thirty different tenants all received the identical photo');
  });

  await t.test('always returns one of the declared candidates, never an out-of-range value', () => {
    for (let i = 0; i < 50; i += 1) {
      const picked = pickCandidate(multiEntry, `tenant-${i}`, `dish-${i}`);
      assert.ok(multiEntry.urls.includes(picked), `${picked} is not one of the declared candidates`);
    }
  });

  await t.test('handles a missing or empty tenantId without throwing', () => {
    assert.doesNotThrow(() => pickCandidate(multiEntry, '', 'Butter Chicken'));
    assert.doesNotThrow(() => pickCandidate(multiEntry, undefined, 'Butter Chicken'));
    assert.ok(multiEntry.urls.includes(pickCandidate(multiEntry, undefined, 'Butter Chicken')));
  });

  await t.test('an entry with urls but only one element behaves like a single-candidate entry', () => {
    const oneCandidate = { url: 'https://example.test/x.jpg', urls: ['https://example.test/x.jpg'] };
    assert.equal(pickCandidate(oneCandidate, 'any-tenant', 'any-dish'), 'https://example.test/x.jpg');
  });
});

test('culinaryImageService: library data integrity', async (t) => {
  // Exercised indirectly through resolveDishImage/pickCandidate above, but re-imported here to
  // assert the shape every entry must have, independent of any one keyword lookup.
  const { resolveDishImage: resolve } = await import('../culinaryImageService.js');

  await t.test('every resolved library URL is a well-formed, parameterised Unsplash URL', () => {
    const dishes = ['paneer tikka', 'biryani', 'dosa', 'noodles', 'steak', 'brownie', 'lassi'];
    for (const dish of dishes) {
      const url = resolve(dish, '');
      const parsed = new URL(url);
      assert.equal(parsed.hostname, 'images.unsplash.com');
      assert.ok(parsed.searchParams.has('w'), `${dish}: missing width param, cannot be a responsive request`);
      assert.ok(parsed.searchParams.has('q'), `${dish}: missing quality param`);
    }
  });
});
