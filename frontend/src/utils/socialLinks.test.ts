import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { facebookUrl, firstPhone, instagramHandle, instagramUrl, phoneLinks, websiteLabel, websiteUrl } from './socialLinks.ts';

// The same cases the backend's profile rules are tested against, so the two cannot drift apart.
// The server is strict (it returns an error); this module is lenient (it returns null), so for
// every case the server rejects, this module must produce no link at all.
const fixtures = JSON.parse(
  fs.readFileSync(new URL('../../../backend/test/fixtures/profile-rules.json', import.meta.url), 'utf8')
) as Record<string, Array<{ input: string | null; value?: string | null; error?: true }>>;

test('instagramHandle matches the server fixtures', async (t) => {
  for (const fixture of fixtures.instagram) {
    await t.test(JSON.stringify(fixture.input), () => {
      assert.equal(instagramHandle(fixture.input), fixture.error ? null : fixture.value ?? null);
    });
  }
});

test('facebookUrl matches the server fixtures', async (t) => {
  for (const fixture of fixtures.facebook) {
    await t.test(JSON.stringify(fixture.input), () => {
      assert.equal(facebookUrl(fixture.input), fixture.error ? null : fixture.value ?? null);
    });
  }
});

test('websiteUrl matches the server fixtures', async (t) => {
  for (const fixture of fixtures.website) {
    await t.test(JSON.stringify(fixture.input), () => {
      assert.equal(websiteUrl(fixture.input), fixture.error ? null : fixture.value ?? null);
    });
  }
});

test('phoneLinks agrees with the server on every number it accepts', async (t) => {
  for (const fixture of fixtures.phones.filter((entry) => !entry.error && entry.value)) {
    await t.test(JSON.stringify(fixture.input), () => {
      assert.equal(
        phoneLinks(fixture.input).map((link) => link.display).join(', '),
        fixture.value
      );
    });
  }
});

test('instagramUrl builds the profile link, or nothing', () => {
  assert.equal(instagramUrl('@mannat.tandoori.junction'), 'https://www.instagram.com/mannat.tandoori.junction/');
  assert.equal(instagramUrl('https://www.instagram.com/p/abc/'), null);
  assert.equal(instagramUrl(undefined), null);
});

test('legacy stored values that older owners typed still produce valid links', () => {
  // These are the shapes found in real tenants' rows before the profile rules existed.
  assert.equal(instagramHandle('https://instagram.com/the_spice_house'), 'the_spice_house');
  assert.equal(instagramUrl('@ApnaDhaba'), 'https://www.instagram.com/apnadhaba/');
  assert.equal(facebookUrl('https://facebook.com/mannatfoods'), 'https://www.facebook.com/mannatfoods');
  assert.equal(websiteUrl('www.mannat.in'), 'https://www.mannat.in');
});

test('websiteLabel drops the scheme and a leading www', () => {
  assert.equal(websiteLabel('https://www.mannat.in/menu/'), 'mannat.in/menu');
  assert.equal(websiteLabel('mannat.in'), 'mannat.in');
  assert.equal(websiteLabel('javascript:alert(1)'), null);
});

test('several numbers in one string are separate links, not one merged number', () => {
  const links = phoneLinks('+91 95480 89761, +91 90689 35364');
  assert.deepEqual(links.map((link) => link.tel), ['+919548089761', '+919068935364']);
  assert.deepEqual(links.map((link) => link.whatsapp), ['919548089761', '919068935364']);
  assert.equal(firstPhone('+91 95480 89761, +91 90689 35364')?.tel, '+919548089761');
});

test('toll-free numbers can be called but not messaged', () => {
  const link = firstPhone('1800 123 4567');
  assert.equal(link?.tel, '18001234567');
  assert.equal(link?.whatsapp, '');
});

test('nothing is invented when there is no usable number', () => {
  assert.equal(firstPhone(''), null);
  assert.equal(firstPhone(null), null);
  assert.equal(firstPhone('call us'), null);
  assert.deepEqual(phoneLinks(undefined), []);
});
