import test from 'node:test';
import assert from 'node:assert/strict';
import { mapPublicMenu, type RawPublicMenuApiResponse } from './publicMenuMapper.ts';
import { isPlaceholderMenu } from '../../utils/menuPlaceholder.ts';

/**
 * The mapper as it was before the canonical profile fields existed (clientStore.ts at 17ced44),
 * kept verbatim as the oracle for "a legacy payload still maps exactly as today".
 */
function legacyMapPublicMenu(raw: any) {
  const placeholder = isPlaceholderMenu(raw.items, raw.categories);
  const menuItems = (placeholder ? [] : raw.items).map((item: any) => ({
    id: item.id,
    name: item.name,
    description: item.description ?? '',
    price: String(item.price),
    pricingType: (item.pricingType as any) || (item.variants && item.variants.length > 0 ? 'variants' : (item.halfPrice || item.fullPrice ? 'half-full' : 'single')),
    halfPrice: item.halfPrice !== undefined && item.halfPrice !== null ? String(item.halfPrice) : '',
    fullPrice: item.fullPrice !== undefined && item.fullPrice !== null ? String(item.fullPrice) : '',
    regPrice: '',
    medPrice: '',
    largePrice: '',
    category: item.category,
    dietType: item.dietType ?? 'veg',
    image: item.image ?? '',
    focalX: item.focalX ?? null,
    focalY: item.focalY ?? null,
    tags: item.tags ?? null,
    soldOut: item.soldOut ?? false,
    availabilityNote: item.availabilityNote ?? null,
    available: item.available,
    variants: item.variants,
    trending: item.trending,
    translations: item.translations ?? null,
  }));
  return {
    businessName: raw.restaurant.name,
    tagline: raw.restaurant.tagline ?? '',
    logoUrl: raw.restaurant.logo || undefined,
    category: raw.restaurant.category ?? 'restaurants',
    phone: raw.restaurant.phone ?? '',
    address: raw.restaurant.address ?? '',
    city: raw.restaurant.city ?? '',
    state: (raw.restaurant as any).state || '',
    website: (raw.restaurant as any).website || '',
    openingHours: (raw.restaurant as any).openingHours || '',
    instagram: (raw.restaurant as any).instagram || undefined,
    facebook: (raw.restaurant as any).facebook || undefined,
    cuisine: (raw.restaurant as any).cuisine || undefined,
    services: [],
    heroImage: undefined,
    categories: placeholder ? [] : raw.categories,
    menuItems,
    plan: raw.plan,
    orderingEnabled: raw.orderingEnabled,
    templateId: raw.templateId,
    accentConfiguration: raw.accentConfiguration,
    menuFeatures: raw.menuFeatures,
    theme: raw.theme,
    googleReviews: raw.googleReviews,
    orderingSettings: raw.orderingSettings,
  };
}

/** What the live backend (commit 8086328) sends: a flat restaurant block, no profile fields. */
const legacyPayload = (): RawPublicMenuApiResponse => ({
  isExpired: false,
  restaurant: {
    name: 'Test Dhaba',
    tagline: 'Test tagline',
    category: 'dhabas',
    phone: '+91 98765 43210, +91 98765 43211',
    address: 'Test Road',
    city: 'Testpur',
    state: 'Test State',
    cuisine: 'North Indian',
    openingHours: '10 AM to 11 PM',
    instagram: '@testdhaba',
    facebook: 'https://facebook.com/testdhaba',
    website: 'testdhaba.in',
    logo: '/uploads/logo.png',
  },
  plan: 'PREMIUM',
  orderingEnabled: true,
  templateId: 'royal-maharaja',
  accentConfiguration: { voiceGreeting: { enabled: false } },
  theme: null,
  googleReviews: { enabled: false },
  categories: [
    { id: '1a2b3c4d-0000-4000-8000-000000000001', name: 'Starters', order: 1 },
    { id: '1a2b3c4d-0000-4000-8000-000000000002', name: 'Mains', order: 2 },
  ],
  items: [
    {
      id: '3f2b1c9e-0000-4000-8000-000000000001', name: 'Paneer Tikka', description: 'Smoky', price: 240,
      halfPrice: 140, fullPrice: 240, pricingType: 'half-full', category: 'Starters', dietType: 'veg',
      available: true, image: 'https://cdn.test/a.jpg', focalX: 0.4, focalY: 0.6, tags: null,
    },
    {
      id: '3f2b1c9e-0000-4000-8000-000000000002', name: 'Dal Makhani', price: 220, category: 'Mains',
      dietType: 'veg', available: true, variants: [{ id: 'v1', name: 'Half', price: 120 }, { id: 'v2', name: 'Full', price: 220 }],
    },
    { id: '3f2b1c9e-0000-4000-8000-000000000003', name: 'Chicken Tikka', price: 280, category: 'Starters', dietType: 'non-veg', available: true, soldOut: true },
  ],
});

const NEW_KEYS = [
  'story', 'establishedYear', 'dietDeclaration', 'highlights', 'payments', 'priceNote', 'serviceChargeNote', 'fssai',
  'maps', 'contacts', 'links', 'weeklyHours', 'hoursExceptions', 'lastOrderMinutes', 'reservations', 'i18n',
  'pincode', 'landmark', 'cuisineTags', 'announcement', 'offers', 'serverNow', 'redirectToSlug',
];

test('a legacy payload maps exactly as before, with none of the new keys', () => {
  const raw = legacyPayload();
  const mapped = mapPublicMenu(raw);
  assert.deepStrictEqual(mapped, legacyMapPublicMenu(legacyPayload()));
  for (const key of NEW_KEYS) assert.equal(key in mapped, false, `${key} must be absent for a legacy payload`);
});

test('a legacy payload with only the required fields still maps as before', () => {
  const raw = { restaurant: { name: 'Bare' }, plan: 'BASIC', categories: [], items: [] } as unknown as RawPublicMenuApiResponse;
  assert.deepStrictEqual(mapPublicMenu(raw), legacyMapPublicMenu({ restaurant: { name: 'Bare' }, plan: 'BASIC', categories: [], items: [] }));
});

test('legacy payload carrying orderingSettings still forwards them', () => {
  const raw = { ...legacyPayload(), orderingSettings: { dineIn: true, takeaway: true, delivery: false, accepting: true } };
  assert.deepStrictEqual(mapPublicMenu(raw).orderingSettings, raw.orderingSettings);
  assert.deepStrictEqual(mapPublicMenu(raw), legacyMapPublicMenu(raw));
});

test('the invented dishes of an old backend are still mapped to an empty menu', () => {
  const raw = legacyPayload();
  raw.categories = ['starters', 'main'].map((name, order) => ({ id: `cat-${name}`, name, order }));
  raw.items = Array.from({ length: 5 }, (_, index) => ({ id: `item-${index + 1}`, name: `Dish ${index}`, price: 100, category: 'starters', dietType: 'veg' as const, available: true }));
  const mapped = mapPublicMenu(raw);
  assert.deepEqual(mapped.menuItems, []);
  assert.deepEqual(mapped.categories, []);
});

/** What the new backend (routes/public.js at 17ced44) adds to the restaurant block. */
const canonicalPayload = (): RawPublicMenuApiResponse => {
  const raw = legacyPayload();
  Object.assign(raw.restaurant, {
    phone: '+919876543210',
    pincode: '201001',
    landmark: 'Opposite Test Mall',
    cuisineTags: ['North Indian', 'Indo-Chinese'],
    openingHours: 'Daily 10 AM to 11 PM',
    weeklyHours: {
      mon: { closed: false, shifts: [{ open: '10:00', close: '23:00', overnight: false }] },
      tue: { closed: false, shifts: [{ open: '10:00', close: '23:00', overnight: false }] },
      wed: { closed: true, shifts: [] },
      thu: { closed: false, shifts: [{ open: '12:00', close: '15:30' }, { open: '19:00', close: '02:00' }] },
      fri: { closed: false, shifts: [{ open: '10:00', close: '23:00' }] },
      sat: { closed: false, shifts: [{ open: '10:00', close: '23:00' }] },
      sun: { closed: false, shifts: [{ open: '10:00', close: '23:00' }] },
    },
    hoursExceptions: [{ date: '2026-11-12', closed: true, note: 'Diwali', shifts: [] }],
    lastOrderMinutes: 30,
    story: 'Started as a roadside stall.',
    establishedYear: 2015,
    dietDeclaration: 'VEG_AND_NON_VEG',
    highlights: ['ac', 'parking'],
    payments: ['cash', 'upi'],
    priceNote: 'Prices include all taxes',
    serviceChargeNote: '5% service charge applicable',
    fssai: '12345678901234',
    maps: { url: 'https://maps.app.goo.gl/abc123', lat: 28.6692, lng: 77.4538 },
    contacts: [
      { id: 'c2', label: 'Reservations', kind: 'mobile', number: '+919876543211', public: true, whatsapp: false, primary: false },
      { id: 'c1', label: 'Main', kind: 'mobile', number: '+919876543210', public: true, whatsapp: true, whatsappMessage: 'Hello', primary: true },
    ],
    links: [
      { type: 'instagram', value: 'testdhaba', label: '', placements: { cover: true, about: true, print: true } },
      { type: 'facebook', value: 'https://www.facebook.com/testdhaba', placements: { cover: false } },
      { type: 'zomato', value: 'https://www.zomato.com/testpur/test-dhaba' },
    ],
    reservations: { mode: 'whatsapp' },
    i18n: { hi: { name: 'टेस्ट ढाबा' } },
  });
  Object.assign(raw, {
    announcement: { text: 'Diwali special: 10% off', linkType: 'url', linkTarget: 'https://testdhaba.in/diwali', i18n: {} },
    offers: [{ id: 'o1', title: 'Lunch combo', details: 'Dal, rice, roti', priceText: 'Rs 199', schedule: { days: [1, 2] }, itemIds: ['3f2b1c9e-0000-4000-8000-000000000002'], mediaId: null, i18n: {} }],
    orderingSettings: { dineIn: true, takeaway: true, delivery: true, accepting: true },
    serverNow: '2026-10-31T09:41:07+05:30',
  });
  return raw;
};

test('every canonical profile field reaches the page', () => {
  const mapped = mapPublicMenu(canonicalPayload());
  assert.equal(mapped.story, 'Started as a roadside stall.');
  assert.equal(mapped.establishedYear, 2015);
  assert.equal(mapped.dietDeclaration, 'VEG_AND_NON_VEG');
  assert.deepEqual(mapped.highlights, ['ac', 'parking']);
  assert.deepEqual(mapped.payments, ['cash', 'upi']);
  assert.equal(mapped.priceNote, 'Prices include all taxes');
  assert.equal(mapped.serviceChargeNote, '5% service charge applicable');
  assert.equal(mapped.fssai, '12345678901234');
  assert.deepEqual(mapped.maps, { url: 'https://maps.app.goo.gl/abc123', lat: 28.6692, lng: 77.4538 });
  assert.deepEqual(mapped.reservations, { mode: 'whatsapp' });
  assert.deepEqual(mapped.i18n, { hi: { name: 'टेस्ट ढाबा' } });
  assert.equal(mapped.pincode, '201001');
  assert.equal(mapped.landmark, 'Opposite Test Mall');
  assert.deepEqual(mapped.cuisineTags, ['North Indian', 'Indo-Chinese']);
  assert.equal(mapped.lastOrderMinutes, 30);
  assert.deepEqual(mapped.hoursExceptions, [{ date: '2026-11-12', closed: true, note: 'Diwali', shifts: [] }]);
  assert.equal(mapped.serverNow, '2026-10-31T09:41:07+05:30');
  // The free-text hours and every legacy field keep arriving next to the new ones.
  assert.equal(mapped.openingHours, 'Daily 10 AM to 11 PM');
  assert.equal(mapped.instagram, '@testdhaba');
});

test('weekly hours arrive normalised, with the overnight flag worked out from the times', () => {
  const weekly = mapPublicMenu(canonicalPayload()).weeklyHours!;
  assert.deepEqual(weekly.mon, { closed: false, shifts: [{ open: '10:00', close: '23:00', overnight: false }] });
  assert.deepEqual(weekly.wed, { closed: true, shifts: [] });
  assert.deepEqual(weekly.thu!.shifts, [
    { open: '12:00', close: '15:30', overnight: false },
    { open: '19:00', close: '02:00', overnight: true },
  ]);
});

test('contacts keep the primary number first and links keep their placements', () => {
  const mapped = mapPublicMenu(canonicalPayload());
  assert.deepEqual(mapped.contacts!.map((contact) => contact.number), ['+919876543210', '+919876543211']);
  assert.equal(mapped.contacts![0].whatsapp, true);
  assert.equal(mapped.contacts![0].whatsappMessage, 'Hello');
  assert.deepEqual(mapped.links!.map((link) => link.type), ['instagram', 'facebook', 'zomato']);
  assert.deepEqual(mapped.links![0].placements, { cover: true, about: true, print: true });
});

test('announcement, offers and ordering settings reach the page', () => {
  const mapped = mapPublicMenu(canonicalPayload());
  assert.deepEqual(mapped.announcement, { text: 'Diwali special: 10% off', linkType: 'url', linkTarget: 'https://testdhaba.in/diwali' });
  assert.equal(mapped.offers!.length, 1);
  assert.equal(mapped.offers![0].title, 'Lunch combo');
  assert.equal(mapped.offers![0].priceText, 'Rs 199');
  assert.deepEqual(mapped.offers![0].itemIds, ['3f2b1c9e-0000-4000-8000-000000000002']);
  assert.equal(mapped.orderingSettings?.takeaway, true);
});

test('no announcement, no offers and empty profile values add nothing', () => {
  const raw = legacyPayload();
  Object.assign(raw, { announcement: null, offers: [], orderingSettings: undefined });
  Object.assign(raw.restaurant, {
    story: '   ', establishedYear: null, dietDeclaration: null, highlights: [], payments: [], priceNote: '', serviceChargeNote: '',
    fssai: '', maps: {}, contacts: [], links: [], weeklyHours: {}, hoursExceptions: [], lastOrderMinutes: 0, reservations: {}, i18n: {},
  });
  const mapped = mapPublicMenu(raw);
  for (const key of NEW_KEYS) assert.equal(key in mapped, false, `${key} must stay absent`);
});

test('hidden numbers, paused links and unusable values never reach the page', () => {
  const raw = canonicalPayload();
  Object.assign(raw.restaurant, {
    contacts: [
      { number: '+919000000001', public: false, label: 'Owner' },
      { number: '', public: true },
      { number: '+919000000002', public: true },
    ],
    links: [
      { type: 'instagram', value: 'hidden_one', paused: true },
      { type: '', value: 'x' },
      { type: 'website', value: '' },
      { type: 'website', value: 'testdhaba.in' },
      { type: 'website', value: 'testdhaba.in' },
    ],
    establishedYear: 'since long',
    pincode: '12',
    dietDeclaration: 'SOMETHING_ELSE',
    reservations: { mode: 'teleport' },
    lastOrderMinutes: 999,
    weeklyHours: { mon: { closed: false, shifts: [{ open: '25:00', close: 'late' }] } },
    maps: { url: '   ' },
  });
  Object.assign(raw, { announcement: { text: '  ', linkTarget: 'https://x.test' }, offers: [{ title: '' }, 'not an offer', null] });
  const mapped = mapPublicMenu(raw);
  assert.deepEqual(mapped.contacts!.map((contact) => contact.number), ['+919000000002']);
  assert.deepEqual(mapped.links!.map((link) => `${link.type}:${link.value}`), ['website:testdhaba.in']);
  for (const key of ['establishedYear', 'pincode', 'dietDeclaration', 'reservations', 'lastOrderMinutes', 'weeklyHours', 'maps', 'announcement', 'offers']) {
    assert.equal(key in mapped, false, `${key} must be dropped`);
  }
});

test('an old link name is reported so the page can move to the current one', () => {
  const raw = { ...legacyPayload(), redirectToSlug: 'new-name' };
  assert.equal(mapPublicMenu(raw).redirectToSlug, 'new-name');
});

test('a payload without a restaurant is rejected instead of crashing on a property read', () => {
  assert.throws(() => mapPublicMenu({} as RawPublicMenuApiResponse), /MENU_PAYLOAD_INVALID/);
  assert.throws(() => mapPublicMenu(null as unknown as RawPublicMenuApiResponse), /MENU_PAYLOAD_INVALID/);
});

test('missing item and category lists read as an empty menu', () => {
  const mapped = mapPublicMenu({ restaurant: { name: 'X' }, plan: 'BASIC' } as unknown as RawPublicMenuApiResponse);
  assert.deepEqual(mapped.menuItems, []);
  assert.deepEqual(mapped.categories, []);
});
