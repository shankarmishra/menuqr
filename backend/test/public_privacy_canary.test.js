/**
 * Privacy canary for the public menu (Blueprint 10.2). Unique sentinel strings are planted in
 * every private field the database holds for a restaurant, and in a second restaurant's rows.
 * The REAL payload builder runs against them; none may appear in anything a diner can fetch.
 *
 * The public fields carry their own `PUBLIC_OK_` sentinels, so the test also proves that it is
 * looking at a real, populated payload (and not an empty one that trivially contains nothing).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { setPool } from '../db.js';
import publicRoutes, { getFullPublicMenuData, clearAllPublicMenuCaches } from '../routes/public.js';
import { createTenantPool } from './helpers/fakeDb.js';
import { fakeRequest, fakeResponse, urlFor } from './helpers/http.js';

const PRIVATE = /PRIVATE_CANARY_[A-Z0-9_]+/g;
const FORBIDDEN_KEY = /^(plan|plan_?id|subscription\w*|review_?flags|accent_?configuration|tenant_?id|owner\w*|gstin\w*|billing\w*|updated_?by|theme_?draft|password\w*|email|contact_?email|reference_?code|public_?id)$/i;

function keysDeep(value, path = '', found = []) {
  if (Array.isArray(value)) value.forEach((v, i) => keysDeep(v, `${path}[${i}]`, found));
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      found.push({ key: k, path: `${path}.${k}` });
      keysDeep(v, `${path}.${k}`, found);
    }
  }
  return found;
}

function canaryWorld({ withProfile = true, hidePhone = false } = {}) {
  const future = new Date(Date.now() + 365 * 86400000);
  const past = new Date(Date.now() - 86400000);
  const tables = {
    clients: [
      {
        id: 'tenant-a', public_id: 'PRIVATE_CANARY_PUBLIC_ID_A', business_name: 'PUBLIC_OK_Name', menu_slug: 'canary-dhaba', status: 'active', category: 'Dhaba',
        tagline: 'PUBLIC_OK_Tagline', phone: '+919000000001', city: 'Delhi', address: 'PUBLIC_OK_Address', state: 'Delhi', cuisine: 'North Indian',
        opening_hours: '10-11', instagram: '@canary', facebook: '', website: '', logo_url: '',
        review_flags: { phone_privacy_pending: true, PRIVATE_CANARY_CLIENT_FLAG: true },
        // private columns, real or future: none of these may ever be spread into the payload
        owner_email: 'PRIVATE_CANARY_OWNER_EMAIL@example.invalid', owner_phone: 'PRIVATE_CANARY_OWNER_PHONE', owner_name: 'PRIVATE_CANARY_OWNER_NAME',
        gstin: 'PRIVATE_CANARY_GSTIN', billing_address: 'PRIVATE_CANARY_BILLING_ADDRESS', reference_code: 'PRIVATE_CANARY_REFERENCE_CODE',
        description: 'PRIVATE_CANARY_LEGACY_DESCRIPTION', email_verified: true, phone_verified: true, outlet_count: 3, business_type: 'PRIVATE_CANARY_BUSINESS_TYPE',
      },
      {
        id: 'PRIVATE_CANARY_OTHER_TENANT_ID', public_id: 'PRIVATE_CANARY_OTHER_PUBLIC_ID', business_name: 'PRIVATE_CANARY_OTHER_TENANT_NAME', menu_slug: 'PRIVATE_CANARY_OTHER_SLUG',
        status: 'active', phone: 'PRIVATE_CANARY_OTHER_TENANT_PHONE', city: 'PRIVATE_CANARY_OTHER_CITY', address: 'PRIVATE_CANARY_OTHER_ADDRESS', review_flags: {},
      },
    ],
    subscriptions: [
      { id: 'PRIVATE_CANARY_SUBSCRIPTION_A', tenant_id: 'tenant-a', plan_id: 'PREMIUM', status: 'ACTIVE', started_at: past, expires_at: future, razorpay_ref: 'PRIVATE_CANARY_PAYMENT_REF' },
      { id: 'PRIVATE_CANARY_SUBSCRIPTION_B', tenant_id: 'PRIVATE_CANARY_OTHER_TENANT_ID', plan_id: 'INTERMEDIATE', status: 'ACTIVE', started_at: past, expires_at: future },
    ],
    restaurant_profiles: [
      ...(withProfile ? [{
        tenant_id: 'tenant-a', display_name: 'PUBLIC_OK_Name', tagline: 'PUBLIC_OK_Tagline', story: 'PUBLIC_OK_Story', cuisine_tags: ['North Indian'],
        address: { line: 'PUBLIC_OK_Address', city: 'Delhi', state: 'Delhi', pincode: '110001', landmark: 'PUBLIC_OK_Landmark' },
        hours: { note: '10-11', weekly: {}, exceptions: [], lastOrderMinutes: 0 },
        contacts: [
          { id: 'p1', label: '', kind: 'mobile', number: hidePhone ? 'PRIVATE_CANARY_HIDDEN_PUBLIC_PHONE' : '+919000000002', public: !hidePhone, whatsapp: false, primary: true },
          { id: 'p2', label: '', kind: 'mobile', number: 'PRIVATE_CANARY_NON_PUBLIC_CONTACT', public: false, whatsapp: false, primary: false },
        ],
        links: [{ type: 'instagram', value: 'canary_public', placements: { cover: true, about: true, print: true }, paused: false }, { type: 'website', value: 'https://PRIVATE_CANARY_PAUSED_LINK.example.invalid/', paused: true }],
        review_flags: { phone_privacy_pending: true, PRIVATE_CANARY_PROFILE_FLAG: true, phone_hidden: hidePhone },
        updated_by: 'PRIVATE_CANARY_UPDATED_BY_EMAIL@example.invalid', version: 7, updated_at: past, fssai: '12345678901234',
      }] : []),
      { tenant_id: 'PRIVATE_CANARY_OTHER_TENANT_ID', display_name: 'PRIVATE_CANARY_OTHER_PROFILE', contacts: [{ number: 'PRIVATE_CANARY_OTHER_CONTACT', public: true }], links: [] },
    ],
    ordering_settings: [
      { tenant_id: 'tenant-a', dine_in_enabled: true, takeaway_enabled: true, delivery_enabled: true, accepting_orders: true, delivery_min_order: '100.00', delivery_fee: '20.00', delivery_area_note: 'PUBLIC_OK_AreaNote', pay_notes: ['Pay at counter'], version: 9 },
      { tenant_id: 'PRIVATE_CANARY_OTHER_TENANT_ID', dine_in_enabled: true, delivery_area_note: 'PRIVATE_CANARY_OTHER_AREA_NOTE' },
    ],
    appearance_settings: [
      {
        id: 'app-a', tenant_id: 'tenant-a', template_id: 'royal-maharaja', restaurant_display_name: null, tagline: null, logo: null,
        theme_published: { presetId: 'desi-dhaba' },
        theme_draft: { presetId: 'PRIVATE_CANARY_UNPUBLISHED_DRAFT' },
        accent_configuration: { menuFeatures: { trending: { enabled: true } }, PRIVATE_CANARY_ACCENT_NOTE: 'x', voiceGreeting: { text: 'PRIVATE_CANARY_VOICE_GREETING' } },
      },
      { id: 'app-b', tenant_id: 'PRIVATE_CANARY_OTHER_TENANT_ID', theme_published: { presetId: 'PRIVATE_CANARY_OTHER_THEME' }, accent_configuration: {} },
    ],
    restaurant_announcements: [
      { tenant_id: 'tenant-a', text: 'PUBLIC_OK_Announcement', link_type: 'none', link_target: null, i18n: {}, created_at: past },
      { tenant_id: 'PRIVATE_CANARY_OTHER_TENANT_ID', text: 'PRIVATE_CANARY_OTHER_ANNOUNCEMENT', link_type: 'none', i18n: {}, created_at: past },
    ],
    restaurant_offers: [
      { id: 'offer-a', tenant_id: 'tenant-a', title: 'PUBLIC_OK_Offer', details: '', price_text: '', schedule: {}, item_ids: [], media_id: null, i18n: {}, is_active: true },
      { id: 'PRIVATE_CANARY_OTHER_OFFER_ID', tenant_id: 'PRIVATE_CANARY_OTHER_TENANT_ID', title: 'PRIVATE_CANARY_OTHER_OFFER', details: '', price_text: '', schedule: {}, item_ids: [], i18n: {}, is_active: true },
    ],
    menus: [{ id: 'menu-a', tenant_id: 'tenant-a' }, { id: 'PRIVATE_CANARY_OTHER_MENU', tenant_id: 'PRIVATE_CANARY_OTHER_TENANT_ID' }],
    menu_categories: [
      { id: 'cat-a', menu_id: 'menu-a', tenant_id: 'tenant-a', name: 'PUBLIC_OK_Category', sort_order: 1, is_visible: true },
      { id: 'cat-b', menu_id: 'PRIVATE_CANARY_OTHER_MENU', tenant_id: 'PRIVATE_CANARY_OTHER_TENANT_ID', name: 'PRIVATE_CANARY_OTHER_CATEGORY', sort_order: 1, is_visible: true },
    ],
    menu_items: [
      { id: 'item-a', menu_id: 'menu-a', tenant_id: 'tenant-a', category_id: 'cat-a', name: 'PUBLIC_OK_Dish', price: '120', is_available: true, sort_order: 1, metadata: { tags: null, internalNote: 'PRIVATE_CANARY_ITEM_METADATA' } },
      { id: 'item-b', menu_id: 'PRIVATE_CANARY_OTHER_MENU', tenant_id: 'PRIVATE_CANARY_OTHER_TENANT_ID', category_id: 'cat-b', name: 'PRIVATE_CANARY_OTHER_DISH', price: '99', is_available: true, sort_order: 1 },
    ],
    // tables the public builder must never read
    customer_orders: [{ id: 'o1', tenant_id: 'tenant-a', customer_name: 'PRIVATE_CANARY_CUSTOMER_NAME', customer_phone: 'PRIVATE_CANARY_CUSTOMER_PHONE', delivery_address: 'PRIVATE_CANARY_CUSTOMER_ADDRESS' }],
    dining_tables: [{ tenant_id: 'tenant-a', label: 'PRIVATE_CANARY_TABLE_LABEL' }],
    menu_feedback: [{ tenant_id: 'tenant-a', comment: 'PRIVATE_CANARY_GUEST_FEEDBACK' }],
    setup_progress: [{ tenant_id: 'tenant-a', steps: { PRIVATE_CANARY_SETUP: true } }],
    audit_logs: [{ tenant_id: 'tenant-a', description: 'PRIVATE_CANARY_AUDIT' }],
  };
  return tables;
}

async function assertNothingPrivate(payload, label) {
  const text = JSON.stringify(payload);
  const leaked = [...new Set(text.match(PRIVATE) || [])];
  assert.deepEqual(leaked, [], `${label}: private values reached the public payload`);
  const badKeys = keysDeep(payload).filter((k) => FORBIDDEN_KEY.test(k.key)).map((k) => k.path);
  assert.deepEqual(badKeys, [], `${label}: private field names reached the public payload`);
}

test('public menu payload (with a canonical profile) contains no private value and no private field name', async () => {
  clearAllPublicMenuCaches();
  setPool(createTenantPool(canaryWorld()));
  const payload = await getFullPublicMenuData('tenant-a');

  const text = JSON.stringify(payload);
  for (const ok of ['PUBLIC_OK_Name', 'PUBLIC_OK_Tagline', 'PUBLIC_OK_Address', 'PUBLIC_OK_Story', 'PUBLIC_OK_Landmark', 'PUBLIC_OK_Announcement', 'PUBLIC_OK_Offer', 'PUBLIC_OK_Category', 'PUBLIC_OK_Dish', 'PUBLIC_OK_AreaNote', '+919000000002', 'canary_public']) {
    assert.ok(text.includes(ok), `the payload must still carry the public value ${ok} (otherwise this test proves nothing)`);
  }
  await assertNothingPrivate(payload, 'with profile');
  assert.equal(payload.orderingEnabled, true);
});

test('public menu payload (legacy tenant, no profile row) contains no private value either', async () => {
  clearAllPublicMenuCaches();
  setPool(createTenantPool(canaryWorld({ withProfile: false })));
  const payload = await getFullPublicMenuData('tenant-a');
  assert.equal(payload.restaurant.phone, '+919000000001', 'the legacy public phone is still shown');
  assert.equal(payload.restaurant.name, 'PUBLIC_OK_Name');
  await assertNothingPrivate(payload, 'legacy tenant');
});

test('a phone the owner hid appears nowhere: not in the payload, the QR payload or the order page', async () => {
  const world = canaryWorld({ hidePhone: true });
  world.clients[0].phone = 'PRIVATE_CANARY_LEGACY_PHONE_OF_HIDING_OWNER';
  world.clients[0].menu_slug = 'canary-dhaba';
  world.qr_codes = [{ qr_id: 'qr-1', tenant_id: 'tenant-a', is_active: true }];

  clearAllPublicMenuCaches();
  setPool(createTenantPool(world, [
    ['FROM qr_codes q JOIN clients c', (_s, p) => world.qr_codes.filter((q) => q.qr_id === p[0]).map((q) => ({ tenant_id: q.tenant_id, is_active: q.is_active, menu_slug: 'canary-dhaba' }))],
    ['FROM customer_orders o JOIN clients c', () => [{
      id: 'ABC12345', orderType: 'DINE_IN', tableNumber: 'T1', customerName: 'Guest', customerPhone: '9999999999', deliveryAddress: null, items: [], total: '100', status: 'NEW',
      trackingToken: 'tok', restaurantName: 'PUBLIC_OK_Name', restaurantPhone: world.clients[0].phone, clientReviewFlags: world.clients[0].review_flags, tenantId: 'tenant-a',
    }]],
  ]));

  const menu = await getFullPublicMenuData('tenant-a');
  assert.equal(menu.restaurant.phone, null);
  await assertNothingPrivate(menu, 'hidden phone, menu');

  const qrRes = fakeResponse();
  await publicRoutes(fakeRequest(), qrRes, urlFor('/api/public/qr/qr-1'));
  assert.equal(qrRes.statusCode, 200);
  await assertNothingPrivate(qrRes.json(), 'hidden phone, QR payload');

  const slugRes = fakeResponse();
  await publicRoutes(fakeRequest(), slugRes, urlFor('/api/public/menus/canary-dhaba'));
  await assertNothingPrivate(slugRes.json(), 'hidden phone, slug payload');

  const orderRes = fakeResponse();
  await publicRoutes(fakeRequest(), orderRes, urlFor('/api/public/orders/ABC12345?token=tok'));
  await assertNothingPrivate(orderRes.json(), 'hidden phone, order page');
  assert.equal(orderRes.json().restaurantPhone, null);
});

test('the builder never reads tables that hold private data', async () => {
  clearAllPublicMenuCaches();
  const pool = createTenantPool(canaryWorld());
  setPool(pool);
  await getFullPublicMenuData('tenant-a');
  const touched = pool.calls.map((c) => c.sql).filter((sql) => /customer_orders\b(?!, jsonb)|dining_tables|menu_feedback|setup_progress|audit_logs|\busers\b|\borders\b|design_history/.test(sql));
  assert.deepEqual(touched, []);
});

test('every tenant-scoped query is parameterised with this tenant only, never the other one', async () => {
  clearAllPublicMenuCaches();
  const pool = createTenantPool(canaryWorld());
  setPool(pool);
  await getFullPublicMenuData('tenant-a');
  const withOther = pool.calls.filter((c) => c.params.some((p) => typeof p === 'string' && p.includes('PRIVATE_CANARY_OTHER')));
  assert.deepEqual(withOther.map((c) => c.sql.slice(0, 80)), []);
});
