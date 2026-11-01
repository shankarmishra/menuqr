import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  announcementHref,
  directionsUrl,
  facebookUrl,
  firstPhone,
  instagramHandle,
  instagramUrl,
  mapsUrl,
  phoneLinks,
  storedLinkTarget,
  telHref,
  websiteLabel,
  websiteUrl,
  whatsappUrl,
} from './socialLinks.ts';

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

test('telHref dials only the first number of a field, and nothing when there is none', () => {
  assert.equal(telHref('+91 95480 89761, +91 90689 35364'), 'tel:+919548089761');
  assert.equal(telHref('011-23456789'), 'tel:01123456789');
  assert.equal(telHref('1800 123 4567'), 'tel:18001234567');
  assert.equal(telHref('call us'), null);
  assert.equal(telHref(''), null);
  assert.equal(telHref(undefined), null);
});

test('whatsappUrl builds a wa.me link for Indian mobiles and explicit international numbers', () => {
  assert.equal(whatsappUrl('+919548089761'), 'https://wa.me/919548089761');
  assert.equal(whatsappUrl('95480 89761'), 'https://wa.me/919548089761');
  assert.equal(whatsappUrl('+91 95480 89761, +91 90689 35364'), 'https://wa.me/919548089761');
  assert.equal(whatsappUrl('+447911123456'), 'https://wa.me/447911123456');
  assert.equal(whatsappUrl('+919548089761', "Hi, I'm looking at the Test menu"), "https://wa.me/919548089761?text=Hi%2C%20I'm%20looking%20at%20the%20Test%20menu");
});

test('whatsappUrl gives nothing for toll-free, landline-only or unreadable values', () => {
  assert.equal(whatsappUrl('1800 123 4567'), null);
  assert.equal(whatsappUrl('call us'), null);
  assert.equal(whatsappUrl(''), null);
  assert.equal(whatsappUrl(null), null);
  assert.equal(whatsappUrl('12345'), null);
});

test('mapsUrl accepts real Google Maps links and refuses redirects and other hosts', () => {
  assert.equal(mapsUrl('https://maps.app.goo.gl/abc123'), 'https://maps.app.goo.gl/abc123');
  assert.equal(mapsUrl('maps.app.goo.gl/abc123'), 'https://maps.app.goo.gl/abc123');
  assert.equal(mapsUrl('http://www.google.com/maps/place/Test+Dhaba/@28.66,77.45,17z'), 'https://www.google.com/maps/place/Test+Dhaba/@28.66,77.45,17z');
  assert.equal(mapsUrl('https://goo.gl/maps/xyz'), 'https://goo.gl/maps/xyz');
  assert.equal(mapsUrl('https://maps.google.com/?q=28.66,77.45'), 'https://maps.google.com/?q=28.66,77.45');
  // Not map links: a Google redirect, an arbitrary short link, another host, a script.
  assert.equal(mapsUrl('https://www.google.com/url?q=https://evil.test'), null);
  assert.equal(mapsUrl('https://goo.gl/abcd'), null);
  assert.equal(mapsUrl('https://evil.test/maps/place/x'), null);
  assert.equal(mapsUrl('https://google.com.evil.test/maps/x'), null);
  assert.equal(mapsUrl('javascript:alert(1)'), null);
  assert.equal(mapsUrl('https://user:pw@www.google.com/maps/x'), null);
  assert.equal(mapsUrl(''), null);
});

test('directions use the saved Maps link, else a Google Maps search for name, address and city', () => {
  assert.equal(
    directionsUrl({ mapsUrl: 'https://maps.app.goo.gl/abc123', name: 'Test Dhaba', address: 'Test Road', city: 'Testpur' }),
    'https://maps.app.goo.gl/abc123'
  );
  assert.equal(
    directionsUrl({ mapsUrl: 'https://evil.test/x', name: 'Test Dhaba', address: 'NH-24, Near Toll', city: 'Ghaziabad' }),
    'https://www.google.com/maps/search/?api=1&query=Test%20Dhaba%20NH-24%2C%20Near%20Toll%20Ghaziabad'
  );
  assert.equal(
    directionsUrl({ name: 'Test Dhaba', city: 'Testpur' }),
    'https://www.google.com/maps/search/?api=1&query=Test%20Dhaba%20Testpur'
  );
  assert.equal(directionsUrl({ directionsUrl: 'https://maps.app.goo.gl/zzz' }), 'https://maps.app.goo.gl/zzz');
});

test('directions are hidden when there is no saved link and no address to search for', () => {
  assert.equal(directionsUrl({ name: 'Test Dhaba' }), null);
  assert.equal(directionsUrl({ name: 'Test Dhaba', address: '  ', city: '' }), null);
  assert.equal(directionsUrl({}), null);
});

test('storedLinkTarget builds each saved link type or nothing', () => {
  assert.deepEqual(storedLinkTarget('instagram', '@Test.Dhaba'), { href: 'https://www.instagram.com/test.dhaba/', text: '@test.dhaba' });
  assert.deepEqual(storedLinkTarget('facebook', 'https://www.facebook.com/testdhaba'), { href: 'https://www.facebook.com/testdhaba', text: 'facebook.com/testdhaba' });
  assert.deepEqual(storedLinkTarget('website', 'testdhaba.in'), { href: 'https://testdhaba.in', text: 'testdhaba.in' });
  assert.deepEqual(storedLinkTarget('custom', 'https://catering.testdhaba.in/enquiry'), { href: 'https://catering.testdhaba.in/enquiry', text: 'catering.testdhaba.in/enquiry' });
  assert.deepEqual(storedLinkTarget('zomato', 'https://www.zomato.com/testpur/test-dhaba'), { href: 'https://www.zomato.com/testpur/test-dhaba', text: 'Zomato' });
  assert.deepEqual(storedLinkTarget('swiggy', 'https://www.swiggy.com/restaurants/test-dhaba'), { href: 'https://www.swiggy.com/restaurants/test-dhaba', text: 'Swiggy' });
  assert.deepEqual(storedLinkTarget('youtube', 'https://www.youtube.com/@testdhaba'), { href: 'https://www.youtube.com/@testdhaba', text: 'youtube.com/@testdhaba' });
});

test('storedLinkTarget refuses invalid values, wrong hosts and unknown types', () => {
  assert.equal(storedLinkTarget('instagram', 'https://www.instagram.com/p/abc/'), null);
  assert.equal(storedLinkTarget('instagram', ''), null);
  assert.equal(storedLinkTarget('facebook', 'https://evil.test/testdhaba'), null);
  assert.equal(storedLinkTarget('website', 'javascript:alert(1)'), null);
  assert.equal(storedLinkTarget('website', null), null);
  assert.equal(storedLinkTarget('zomato', 'https://evil.test/zomato'), null);
  assert.equal(storedLinkTarget('swiggy', 'https://notswiggy.com/x'), null);
  assert.equal(storedLinkTarget('youtube', 'https://vimeo.com/123'), null);
  assert.equal(storedLinkTarget('telegram', 'https://t.me/x'), null);
});

test('announcement links are web addresses or WhatsApp numbers only', () => {
  assert.equal(announcementHref('url', 'https://testdhaba.in/diwali'), 'https://testdhaba.in/diwali');
  assert.equal(announcementHref('url', 'javascript:alert(1)'), null);
  assert.equal(announcementHref('url', 'diwali'), null);
  assert.equal(announcementHref('whatsapp', '+919548089761'), 'https://wa.me/919548089761');
  assert.equal(announcementHref('category', 'Starters'), null);
  assert.equal(announcementHref(undefined, 'https://testdhaba.in'), null);
});
