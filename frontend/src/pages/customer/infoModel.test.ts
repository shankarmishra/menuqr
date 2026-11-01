import test from 'node:test';
import assert from 'node:assert/strict';
import { buildInfoModel, type InfoSource } from './infoModel.ts';

// Monday 2026-11-02, 15:00 in India.
const NOW = new Date(Date.UTC(2026, 10, 2, 15, 0) - 330 * 60_000);

const bare = (): InfoSource => ({
  businessName: 'Test Dhaba',
  phone: '',
  address: '',
  city: '',
  state: '',
  website: '',
  openingHours: '',
  menuItems: [],
});

const legacy = (): InfoSource => ({
  ...bare(),
  phone: '+91 98765 43210, +91 98765 43211',
  address: 'Test Road',
  city: 'Testpur',
  state: 'Test State',
  website: 'testdhaba.in',
  instagram: '@testdhaba',
  facebook: 'https://facebook.com/testdhaba',
  openingHours: '10 AM to 11 PM',
});

const everyDay = { closed: false, shifts: [{ open: '10:00', close: '23:00', overnight: false }] };
const canonical = (): InfoSource => ({
  ...bare(),
  phone: '+919876543210',
  address: 'E-36, Patel Nagar',
  city: 'Ghaziabad',
  state: 'Uttar Pradesh',
  pincode: '201001',
  landmark: 'Opposite Test Mall',
  openingHours: 'ignored free text',
  weeklyHours: { mon: everyDay, tue: everyDay, wed: { closed: true, shifts: [] }, thu: everyDay, fri: everyDay, sat: everyDay, sun: everyDay },
  maps: { url: 'https://maps.app.goo.gl/abc123' },
  contacts: [
    { label: 'Reservations', kind: 'mobile', number: '+919876543210', whatsapp: true, whatsappMessage: 'Hello from the menu', primary: true },
    { label: '', kind: 'landline', number: '+911123456789', whatsapp: false, whatsappMessage: '', primary: false },
  ],
  links: [
    { type: 'instagram', value: 'testdhaba', label: '' },
    { type: 'facebook', value: 'https://www.facebook.com/testdhaba', label: '' },
    { type: 'website', value: 'testdhaba.in', label: '' },
    { type: 'custom', value: 'https://catering.testdhaba.in', label: 'Catering' },
    { type: 'zomato', value: 'https://www.zomato.com/ghaziabad/test-dhaba', label: '' },
    { type: 'swiggy', value: 'https://www.swiggy.com/restaurants/test-dhaba', label: '' },
  ],
  fssai: '12345678901234',
  dietDeclaration: 'PURE_VEG',
});

test('a restaurant with no saved details has nothing to show, so the page has no Info button', () => {
  const model = buildInfoModel(bare(), { now: NOW });
  assert.equal(model.hasContent, false);
  assert.equal(model.status, null);
  assert.equal(model.directions, null);
  assert.deepEqual(model.calls, []);
  assert.equal(model.whatsapp, null);
  assert.deepEqual(model.links, []);
});

test('an older backend payload gives call, directions and links from its flat fields', () => {
  const model = buildInfoModel(legacy(), { now: NOW });
  assert.equal(model.hasContent, true);
  assert.deepEqual(model.calls.map((call) => [call.href, call.detail]), [['tel:+919876543210', '+91 98765 43210']]);
  assert.equal(model.directions?.href, 'https://www.google.com/maps/search/?api=1&query=Test%20Dhaba%20Test%20Road%20Testpur');
  assert.deepEqual(model.links.map((link) => link.href), [
    'https://www.instagram.com/testdhaba/',
    'https://www.facebook.com/testdhaba',
    'https://testdhaba.in',
  ]);
  assert.equal(model.hoursText, '10 AM to 11 PM');
  assert.equal(model.status, null);
  assert.deepEqual(model.addressLines, ['Test Road', 'Testpur, Test State']);
});

test('without a chat number or a WhatsApp contact there is no WhatsApp button', () => {
  assert.equal(buildInfoModel(legacy(), { now: NOW }).whatsapp, null);
});

test('the menu chat number gives the WhatsApp button, with the default message', () => {
  const model = buildInfoModel(legacy(), { now: NOW, whatsappNumber: '+919876543210' });
  assert.equal(model.whatsapp?.href, "https://wa.me/919876543210?text=Hi%2C%20I'm%20looking%20at%20the%20Test%20Dhaba%20menu");
});

test('the canonical profile drives status, week, hours, directions, contacts and links', () => {
  const model = buildInfoModel(canonical(), { now: NOW });
  assert.equal(model.status?.label, 'Open · closes 11 PM');
  assert.equal(model.today, '10 AM – 11 PM');
  assert.equal(model.week?.length, 7);
  assert.equal(model.hoursText, null, 'free text is hidden while structured hours exist');
  assert.equal(model.directions?.href, 'https://maps.app.goo.gl/abc123');
  assert.deepEqual(model.addressLines, ['E-36, Patel Nagar', 'Ghaziabad, Uttar Pradesh 201001', 'Landmark: Opposite Test Mall']);
  assert.deepEqual(model.calls.map((call) => [call.label, call.href, call.detail]), [
    ['Call Reservations', 'tel:+919876543210', '+91 98765 43210'],
    ['Call', 'tel:+911123456789', '+91 11234 56789'],
  ]);
  assert.equal(model.whatsapp?.href, 'https://wa.me/919876543210?text=Hello%20from%20the%20menu');
  assert.deepEqual(model.links.map((link) => [link.kind, link.label, link.detail]), [
    ['instagram', 'Instagram', '@testdhaba'],
    ['custom', 'Facebook', 'facebook.com/testdhaba'],
    ['website', 'Website', 'testdhaba.in'],
    ['custom', 'Catering', 'catering.testdhaba.in'],
  ]);
  assert.deepEqual(model.partners.map((partner) => [partner.kind, partner.label]), [['zomato', 'Zomato'], ['swiggy', 'Swiggy']]);
  assert.equal(model.fssai, '12345678901234');
  assert.equal(model.diet, 'Pure vegetarian');
});

test('saved links win over the flat legacy fields and no link appears twice', () => {
  const source = { ...canonical(), instagram: '@someone_else', website: 'testdhaba.in' };
  const model = buildInfoModel(source, { now: NOW });
  assert.equal(model.links.filter((link) => link.icon === 'instagram').length, 1);
  assert.equal(model.links.find((link) => link.icon === 'instagram')?.href, 'https://www.instagram.com/testdhaba/');
  assert.equal(model.links.filter((link) => link.icon === 'website').length, 1);
});

test('invalid saved values produce no link at all, never a placeholder one', () => {
  const source: InfoSource = {
    ...bare(),
    instagram: 'https://www.instagram.com/p/abc/',
    facebook: 'https://evil.test/page',
    website: 'javascript:alert(1)',
    phone: 'call us',
    links: [{ type: 'zomato', value: 'https://evil.test/zomato', label: '' }, { type: 'custom', value: '#', label: 'Menu' }],
    maps: { url: 'https://evil.test/maps' },
  };
  const model = buildInfoModel(source, { now: NOW });
  assert.equal(model.hasContent, false);
  for (const action of [...model.links, ...model.partners, ...model.calls, model.directions, model.whatsapp]) {
    if (action) assert.notEqual(action.href, '#');
  }
});

test('a phone-only contact list marks WhatsApp only on numbers the owner flagged', () => {
  const source = canonical();
  source.contacts = [{ label: '', kind: 'mobile', number: '+919876543210', whatsapp: false, whatsappMessage: '', primary: true }];
  assert.equal(buildInfoModel(source, { now: NOW }).whatsapp, null);
});

test('pure vegetarian is not claimed while a dish contradicts it', () => {
  const source = canonical();
  source.menuItems = [{ id: '1', name: 'Chicken Tikka', dietType: 'non-veg' } as InfoSource['menuItems'][number]];
  assert.equal(buildInfoModel(source, { now: NOW }).diet, null);
  source.dietDeclaration = 'VEG_AND_NON_VEG';
  assert.equal(buildInfoModel(source, { now: NOW }).diet, 'Veg and non-veg');
});

test('an FSSAI number is shown only when it has 14 digits', () => {
  const source = canonical();
  source.fssai = '1234';
  assert.equal(buildInfoModel(source, { now: NOW }).fssai, null);
});

test('directions are hidden for a restaurant with neither a map link nor an address', () => {
  const source = { ...bare(), city: '' };
  assert.equal(buildInfoModel(source, { now: NOW }).directions, null);
});

test('a restaurant that is closed now says when it opens', () => {
  const tuesdayNight = new Date(Date.UTC(2026, 10, 3, 23, 30) - 330 * 60_000);
  assert.equal(buildInfoModel(canonical(), { now: tuesdayNight }).status?.label, 'Closed · opens Thu 10 AM');
});
