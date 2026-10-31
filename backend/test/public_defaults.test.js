/**
 * The first backend deploy reads EMPTY new tables (restaurant_profiles, ordering_settings, ...).
 * These tests pin down that every default then equals what the menu did before the tables
 * existed, and that the order endpoint agrees with what the payload offers. No database needed:
 * the real route code runs against a fake pool.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { setPool } from '../db.js';
import publicRoutes, { getFullPublicMenuData, clearAllPublicMenuCaches } from '../routes/public.js';
import { resolvePublicPhone, orderingSettingsFromRow, legacyOrderingSettings } from '../publicMenuPayload.js';
import { createTenantPool } from './helpers/fakeDb.js';
import { fakeRequest, fakeResponse, urlFor } from './helpers/http.js';

const TWO_NUMBERS = '+91 95480 89761, +91 90689 35364'; // real production data: one field, two numbers

function seed({ client = {}, profile, ordering, items = true } = {}) {
  return {
    clients: [{
      id: 'tenant-a', public_id: 'pub-a', business_name: 'Test Dhaba', menu_slug: 'test-dhaba', status: 'active',
      category: 'Dhaba', tagline: '', phone: TWO_NUMBERS, city: 'Delhi', address: '12 Market Road', state: 'Delhi',
      cuisine: 'North Indian, Chinese', opening_hours: '10am-11pm', instagram: '@testdhaba', facebook: 'https://facebook.com/testdhaba',
      website: 'testdhaba.in', logo_url: '', review_flags: { phone_privacy_pending: true }, ...client,
    }],
    subscriptions: [{ id: 'sub-a', tenant_id: 'tenant-a', plan_id: 'PREMIUM', status: 'ACTIVE', started_at: new Date(Date.now() - 86400000), expires_at: new Date(Date.now() + 365 * 86400000) }],
    restaurant_profiles: profile ? [{ tenant_id: 'tenant-a', display_name: 'Test Dhaba', contacts: [], links: [], review_flags: {}, ...profile }] : [],
    ordering_settings: ordering ? [{ tenant_id: 'tenant-a', dine_in_enabled: true, takeaway_enabled: false, delivery_enabled: true, accepting_orders: true, ...ordering }] : [],
    appearance_settings: [],
    menus: [{ id: 'menu-a', tenant_id: 'tenant-a' }],
    menu_categories: items ? [{ id: 'cat-1', menu_id: 'menu-a', tenant_id: 'tenant-a', name: 'Mains', sort_order: 1, is_visible: true }] : [],
    menu_items: items ? [{ id: 'item-1', menu_id: 'menu-a', tenant_id: 'tenant-a', category_id: 'cat-1', name: 'Dal Tadka', price: '180', is_available: true, sort_order: 1 }] : [],
  };
}

const orderExtras = [
  ['FROM customer_orders WHERE tenant_id = $1 AND idempotency_key = $2', () => []],
];

async function payloadFor(rows) {
  clearAllPublicMenuCaches();
  setPool(createTenantPool(rows));
  return getFullPublicMenuData('tenant-a');
}

async function postOrder(rows, body) {
  clearAllPublicMenuCaches();
  setPool(createTenantPool(rows, orderExtras));
  const res = fakeResponse();
  try {
    await publicRoutes(fakeRequest({ method: 'POST', body }), res, urlFor('/api/public/menus/test-dhaba/orders'));
    return { status: res.statusCode, body: res.body ? res.json() : null };
  } catch (err) {
    return { status: err.status, message: err.message };
  }
}

test('no ordering_settings row reads as the legacy state: dine-in and delivery on, takeaway off', async () => {
  const legacy = legacyOrderingSettings();
  assert.equal(legacy.dineIn, true);
  assert.equal(legacy.delivery, true);
  assert.equal(legacy.takeaway, false);
  assert.equal(legacy.accepting, true);
  assert.equal(orderingSettingsFromRow(null).delivery, true);

  const payload = await payloadFor(seed());
  assert.equal(payload.orderingEnabled, true, 'PREMIUM menus still offer ordering');
  assert.equal(payload.orderingSettings.dineIn, true);
  assert.equal(payload.orderingSettings.delivery, true);
  assert.equal(payload.orderingSettings.takeaway, false);
  assert.equal(payload.orderingSettings.accepting, true);
});

test('an explicit ordering_settings row is honoured exactly', async () => {
  const payload = await payloadFor(seed({ ordering: { delivery_enabled: false, takeaway_enabled: true } }));
  assert.equal(payload.orderingSettings.delivery, false);
  assert.equal(payload.orderingSettings.takeaway, true);
});

test('the order endpoint agrees with the payload when there is no ordering_settings row', async () => {
  const takeaway = await postOrder(seed(), { orderType: 'TAKEAWAY', customerName: 'x', items: [] });
  assert.equal(takeaway.status, 400);
  assert.match(takeaway.message, /Takeaway pickup ordering is currently disabled/);

  // Delivery and dine-in pass the order-type check (the request then fails on the one-letter name,
  // which proves the type check did not stop it).
  for (const orderType of ['DELIVERY', 'DINE_IN']) {
    const result = await postOrder(seed(), { orderType, customerName: 'x', items: [] });
    assert.equal(result.status, 400);
    assert.match(result.message, /Customer name is required/, `${orderType} must pass the order-type check`);
  }
});

test('the order endpoint refuses what an explicit row switches off, and a closed restaurant', async () => {
  const noDelivery = await postOrder(seed({ ordering: { delivery_enabled: false } }), { orderType: 'DELIVERY', customerName: 'x', items: [] });
  assert.match(noDelivery.message, /Delivery ordering is currently disabled/);
  const closed = await postOrder(seed({ ordering: { accepting_orders: false } }), { orderType: 'DINE_IN', customerName: 'x', items: [] });
  assert.match(closed.message, /not accepting online orders/);
  const takeawayOn = await postOrder(seed({ ordering: { takeaway_enabled: true } }), { orderType: 'TAKEAWAY', customerName: 'x', items: [] });
  assert.match(takeawayOn.message, /Customer name is required/);
});

test('an empty menu returns empty lists, never invented dishes', async () => {
  const payload = await payloadFor(seed({ items: false }));
  assert.deepEqual(payload.items, []);
  assert.deepEqual(payload.categories, []);
  assert.doesNotMatch(JSON.stringify(payload), /Paneer Tikka|Butter Chicken|Dal Makhani|Starters & Appetizers/);
});

test('a menu with dishes returns exactly the owner dishes', async () => {
  const payload = await payloadFor(seed());
  assert.deepEqual(payload.items.map((i) => i.name), ['Dal Tadka']);
  assert.deepEqual(payload.categories.map((c) => c.name), ['Mains']);
});

test('public phone: legacy number stays visible while the phone prompt is pending (no profile yet)', async () => {
  const payload = await payloadFor(seed());
  assert.equal(payload.restaurant.phone, TWO_NUMBERS);
});

test('public phone rule (resolvePublicPhone)', () => {
  const legacy = { phone: '9548089761', review_flags: { phone_privacy_pending: true } };
  const contact = (extra) => ({ id: 'c', number: '+919000000001', public: true, primary: false, ...extra });

  // no profile / empty contact list: the legacy number stays, flag or not
  assert.equal(resolvePublicPhone(null, legacy), '9548089761');
  assert.equal(resolvePublicPhone({ contacts: [] }, legacy), '9548089761');
  assert.equal(resolvePublicPhone({ contacts: [], review_flags: { phone_privacy_pending: true } }, legacy), '9548089761');
  // first public contact; the primary public one wins
  assert.equal(resolvePublicPhone({ contacts: [contact({ number: '+919000000002' }), contact({ primary: true })] }, legacy), '+919000000001');
  assert.equal(resolvePublicPhone({ contacts: [contact({ public: false }), contact({ number: '+919000000003' })] }, legacy), '+919000000003');
  // the owner has a contact list and none of it is public: hidden, no fallback
  assert.equal(resolvePublicPhone({ contacts: [contact({ public: false })] }, legacy), null);
  // explicit hide with an empty list: hidden, no fallback (profile flag or client flag)
  assert.equal(resolvePublicPhone({ contacts: [], review_flags: { phone_hidden: true } }, legacy), null);
  assert.equal(resolvePublicPhone(null, { ...legacy, review_flags: { phone_hidden: true } }), null);
  // nothing anywhere
  assert.equal(resolvePublicPhone(null, { phone: '  ', review_flags: {} }), null);
  assert.equal(resolvePublicPhone(null, { review_flags: {} }), null);
});

test('public phone through the payload: split contacts, hidden, and unparseable legacy value', async () => {
  const split = await payloadFor(seed({
    profile: { contacts: [
      { id: 'phone_1', number: '+919548089761', public: true, primary: true },
      { id: 'phone_2', number: '+919068935364', public: true, primary: false },
    ] },
  }));
  assert.equal(split.restaurant.phone, '+919548089761');
  assert.deepEqual(split.restaurant.contacts.map((c) => c.number), ['+919548089761', '+919068935364']);

  const hidden = await payloadFor(seed({ profile: { contacts: [{ id: 'phone_1', number: '+919548089761', public: false, primary: true }] } }));
  assert.equal(hidden.restaurant.phone, null);
  assert.deepEqual(hidden.restaurant.contacts, []);

  const unparseable = await payloadFor(seed({ client: { phone: 'call the shop' }, profile: { contacts: [] } }));
  assert.equal(unparseable.restaurant.phone, 'call the shop', 'a legacy value that is not a phone number is not lost');

  const explicitlyHidden = await payloadFor(seed({ profile: { contacts: [], review_flags: { phone_hidden: true } } }));
  assert.equal(explicitlyHidden.restaurant.phone, null);
});

test('Instagram, Facebook and website stay visible from the legacy columns', async () => {
  const payload = await payloadFor(seed());
  assert.equal(payload.restaurant.instagram, '@testdhaba');
  assert.equal(payload.restaurant.facebook, 'https://facebook.com/testdhaba');
  assert.equal(payload.restaurant.website, 'testdhaba.in');

  const withProfile = await payloadFor(seed({ profile: { links: [{ type: 'instagram', value: 'testdhaba', paused: false }] } }));
  assert.equal(withProfile.restaurant.instagram, 'testdhaba');
  assert.equal(withProfile.restaurant.facebook, 'https://facebook.com/testdhaba', 'a link the profile does not hold falls back to the legacy value');
});

test('the order tracking page follows the same phone rule', async () => {
  const orderRow = (restaurantPhone, clientReviewFlags) => ({
    id: 'ABC12345', orderType: 'DINE_IN', tableNumber: 'T1', customerName: 'Guest', customerPhone: '9999999999', deliveryAddress: null,
    items: [], total: '100', status: 'NEW', trackingToken: 'tok', restaurantName: 'Test Dhaba', restaurantPhone, clientReviewFlags, tenantId: 'tenant-a',
  });
  const track = async (rows, row) => {
    setPool(createTenantPool(rows, [['FROM customer_orders o JOIN clients c', () => [row]]]));
    const res = fakeResponse();
    await publicRoutes(fakeRequest(), res, urlFor('/api/public/orders/ABC12345?token=tok'));
    return res.json();
  };
  const visible = await track(seed(), orderRow('9548089761', { phone_privacy_pending: true }));
  assert.equal(visible.restaurantPhone, '9548089761');
  assert.equal(visible.clientReviewFlags, undefined, 'internal helper fields never reach the client');
  assert.equal(visible.tenantId, undefined);

  const hidden = await track(seed({ profile: { contacts: [{ id: 'p', number: '+919548089761', public: false, primary: true }] } }), orderRow('9548089761', {}));
  assert.equal(hidden.restaurantPhone, null, 'a hidden number does not leak through the order page');
});
