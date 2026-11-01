#!/usr/bin/env node
/**
 * Builds public-menu fixtures for tools/customer-qa/mock-public-api.mjs.
 *
 *   node tools/customer-qa/build-fixtures.mjs --backup <tenant_backup.json> --out <folder>
 *
 * Reads ONLY `menu_categories`, `menu_items` and `menu_item_variants` of the backup (real menus of
 * two restaurants) and converts them to the shape of GET /api/public/menus/:slug. Nothing else in the
 * backup is read. The restaurant block of every fixture is made up ("Test Dhaba", test numbers), and
 * dish photos are replaced by generated images served by the mock API. The output goes to a folder
 * outside the repository; do not commit it.
 */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const option = (name) => {
  const at = args.indexOf(`--${name}`);
  return at >= 0 ? args[at + 1] : undefined;
};
const backupPath = option('backup');
const outDir = option('out');
if (!backupPath || !outDir) {
  console.error('usage: build-fixtures.mjs --backup <file> --out <folder>');
  process.exit(1);
}

const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
const tenants = Object.values(backup.tenants).map((tenant) => ({
  categories: tenant.menu_categories ?? [],
  items: tenant.menu_items ?? [],
  variants: tenant.menu_item_variants ?? [],
}));
const withPhotos = tenants.reduce((best, tenant) => (tenant.items.filter((i) => i.image_url).length > best.items.filter((i) => i.image_url).length ? tenant : best));
const withVariants = tenants.reduce((best, tenant) => (tenant.variants.length > best.variants.length ? tenant : best));

/** Same fields, same conversions as getFullPublicMenuData in backend/routes/public.js. */
function toPayloadMenu(tenant, { photos }) {
  const categories = tenant.categories
    .filter((c) => c.is_visible !== false)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((c) => ({ id: c.id, name: c.name, order: c.sort_order, schedule: null }));
  const nameOf = new Map(categories.map((c) => [c.id, c.name]));
  const items = tenant.items
    .filter((i) => i.is_available !== false)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((i) => {
      const variants = tenant.variants
        .filter((v) => v.menu_item_id === i.id && v.is_available !== false)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((v) => ({ id: v.id, name: v.name, price: parseFloat(v.price || '0'), variantGroup: v.variant_group }));
      return {
        id: i.id,
        name: i.name,
        description: i.description || '',
        price: parseFloat(i.price || '0'),
        halfPrice: i.half_price ? parseFloat(i.half_price) : null,
        fullPrice: i.full_price ? parseFloat(i.full_price) : null,
        pricingType: i.pricing_type || (variants.length > 0 ? 'variants' : 'single'),
        category: nameOf.get(i.category_id) ?? 'Other',
        dietType: i.diet_type || 'veg',
        available: i.is_available !== false,
        categoryId: i.category_id,
        soldOutOn: null,
        image: photos && i.image_url ? `/api/mock-img/${i.id}.jpg` : '',
        focalX: i.metadata?.focal?.x ?? null,
        focalY: i.metadata?.focal?.y ?? null,
        tags: i.metadata?.tags ?? null,
        variants,
        addonGroups: [],
      };
    });
  return { categories, items };
}

const HINDI_NAMES = ['पनीर बटर मसाला', 'दाल मखनी', 'आलू गोभी', 'छोले भटूरे', 'मटर पनीर', 'राजमा चावल', 'वेज बिरयानी', 'गुलाब जामुन', 'मसाला डोसा', 'कढ़ाई पनीर', 'मिक्स वेज', 'जीरा राइस', 'तंदूरी रोटी', 'बटर नान', 'मसाला चाय', 'लस्सी', 'रसमलाई', 'पाव भाजी', 'दही भल्ले', 'समोसा चाट'];
const LONG_SENTENCE = 'Cooked slowly with whole spices over a low flame, finished with fresh cream and served hot with salad, green chutney and onion rings. ';
const repeatTo = (text, length) => text.repeat(Math.ceil(length / text.length)).slice(0, length).trim();

/** The same 205 dishes, changed so every awkward case a real owner produces is present. */
function toStressMenu(base) {
  const items = base.items.map((item, index) => {
    const copy = { ...item, variants: [...item.variants] };
    if (index % 5 < 2) copy.image = ''; // 40% without a photo
    if (index % 4 === 1 && copy.variants.length === 0) {
      copy.halfPrice = Math.round(copy.price * 0.6);
      copy.fullPrice = copy.price;
      copy.pricingType = 'half-full';
    }
    if (index % 6 === 2) {
      const hindi = HINDI_NAMES[index % HINDI_NAMES.length];
      if (index % 12 === 2) copy.name = hindi; // typed in Hindi only
      else copy.translations = { hi: { name: hindi, description: 'धीमी आँच पर पकाया गया, ताज़ी क्रीम के साथ परोसा जाता है।' } };
    }
    if (index % 7 === 3) copy.description = repeatTo(LONG_SENTENCE, 400);
    if (index % 29 === 0) copy.description = repeatTo(LONG_SENTENCE, 1500);
    if (index % 9 === 4) copy.tags = { allergens: ['dairy'], badges: index % 18 === 4 ? ['bestseller'] : ['chef'], spice: (index % 3) + 1, jain: false, eggless: false };
    if (index % 31 === 5) copy.soldOut = true;
    return copy;
  });
  items[10].name = 'Extra Large Special Mixed Vegetable Tandoori Platter With Mint Chutney And Salad (Serves Four People)';
  items[11].name = 'Supercalifragilisticexpialidocious-Paneer-Tikka-Masala-Special';
  items[12].description = repeatTo(LONG_SENTENCE, 4000);
  return { categories: base.categories, items };
}

const testRestaurant = {
  name: 'Test Dhaba',
  tagline: 'A made-up restaurant for page checks',
  category: 'dhabas',
  logo: '',
};
const legacyRestaurant = {
  ...testRestaurant,
  phone: '+91 98765 43210, +91 98765 43211',
  address: 'Test Road, Near Test Chowk',
  city: 'Testpur',
  state: 'Test State',
  cuisine: 'North Indian, Chinese',
  openingHours: '10 AM to 11 PM',
  instagram: '@testdhaba',
  facebook: 'https://facebook.com/testdhaba',
  website: 'testdhaba.in',
};
const everyDay = { closed: false, shifts: [{ open: '10:00', close: '23:00', overnight: false }] };
const canonicalRestaurant = {
  ...testRestaurant,
  phone: '+919876543210',
  address: 'E-36, Test Nagar',
  city: 'Testpur',
  state: 'Test State',
  pincode: '201001',
  landmark: 'Opposite Test Mall',
  cuisine: 'North Indian, Chinese',
  cuisineTags: ['North Indian', 'Chinese'],
  openingHours: 'Daily 10 AM to 11 PM',
  weeklyHours: { mon: everyDay, tue: everyDay, wed: everyDay, thu: everyDay, fri: everyDay, sat: { closed: false, shifts: [{ open: '10:00', close: '15:00' }, { open: '19:00', close: '02:00' }] }, sun: everyDay },
  hoursExceptions: [],
  lastOrderMinutes: 30,
  instagram: 'testdhaba',
  facebook: 'https://www.facebook.com/testdhaba',
  website: 'https://testdhaba.in',
  story: '',
  establishedYear: null,
  dietDeclaration: 'VEG_AND_NON_VEG',
  highlights: [],
  payments: [],
  priceNote: '',
  serviceChargeNote: '',
  fssai: '12345678901234',
  maps: { url: 'https://maps.app.goo.gl/test123' },
  contacts: [
    { id: 'c1', label: 'Reservations', kind: 'mobile', number: '+919876543210', public: true, whatsapp: true, whatsappMessage: '', primary: true },
    { id: 'c2', label: '', kind: 'mobile', number: '+919876543211', public: true, whatsapp: false, whatsappMessage: '', primary: false },
  ],
  links: [
    { type: 'instagram', value: 'testdhaba', label: '', placements: { cover: true, about: true, print: true } },
    { type: 'facebook', value: 'https://www.facebook.com/testdhaba', label: '', placements: { cover: false, about: true, print: true } },
    { type: 'website', value: 'https://testdhaba.in', label: '', placements: { cover: false, about: true, print: true } },
    { type: 'zomato', value: 'https://www.zomato.com/testpur/test-dhaba', label: '', placements: { cover: false, about: true, print: false } },
  ],
  reservations: {},
  i18n: {},
};

const envelope = (restaurant, menu, extra = {}) => ({
  isExpired: false,
  restaurant,
  orderingEnabled: true,
  orderingSettings: { dineIn: true, takeaway: false, delivery: true, accepting: true, autoByHours: false, deliveryMinOrder: 0, deliveryFee: 0, deliveryAreaNote: '', payNotes: ['Pay at counter'] },
  announcement: null,
  offers: [],
  menuFeatures: undefined,
  templateId: 'royal-maharaja',
  theme: null,
  googleReviews: { enabled: false },
  categories: menu.categories,
  items: menu.items,
  ...extra,
});

fs.mkdirSync(outDir, { recursive: true });
const write = (name, body) => fs.writeFileSync(path.join(outDir, `${name}.json`), JSON.stringify(body));

const photoMenu = toPayloadMenu(withPhotos, { photos: true });
const variantMenu = toPayloadMenu(withVariants, { photos: false });
const stressMenu = toStressMenu(photoMenu);

write('menu-205-photos', envelope(legacyRestaurant, photoMenu));
write('menu-137-variants', envelope(legacyRestaurant, variantMenu));
write('menu-stress', envelope(legacyRestaurant, stressMenu));
for (const templateId of ['desi-dhaba', 'maison-noir', 'darbar', 'bombay-chowk', 'thali-and-co', 'rang-e-punjab']) {
  write(`menu-stress-${templateId}`, envelope(legacyRestaurant, stressMenu, { templateId }));
}
write('menu-stress-light', envelope(legacyRestaurant, stressMenu, { templateId: 'craft-trattoria' }));

const profileMenu = { categories: stressMenu.categories.slice(0, 6), items: stressMenu.items.filter((i) => stressMenu.categories.slice(0, 6).some((c) => c.id === i.categoryId)) };
write('profile-legacy', envelope(legacyRestaurant, profileMenu));
write('profile-minimal', envelope(testRestaurant, profileMenu));
write('profile-full', envelope(canonicalRestaurant, profileMenu, {
  announcement: { text: 'Festival special: free dessert on orders above 500 rupees', linkType: 'url', linkTarget: 'https://testdhaba.in/festival', i18n: {} },
  offers: [{ id: 'o1', title: 'Lunch combo', details: 'Dal, rice and roti', priceText: '199 rupees', schedule: null, itemIds: [], mediaId: null, i18n: {} }],
  serverNow: undefined,
  menuFeatures: { callWaiter: { enabled: true, types: ['WATER', 'WAITER', 'BILL'] }, whatsappChat: { enabled: true, number: '9876543210', resolvedNumber: '+919876543210' }, allergenFilter: { enabled: true }, spiceFilter: { enabled: true }, trending: { enabled: true }, multiLanguage: { enabled: false }, accessibilityControls: { enabled: true } },
}));
write('profile-full-closed', envelope({ ...canonicalRestaurant, weeklyHours: { mon: { closed: true, shifts: [] }, tue: { closed: true, shifts: [] }, wed: { closed: true, shifts: [] }, thu: { closed: true, shifts: [] }, fri: { closed: false, shifts: [{ open: '10:00', close: '23:00' }] }, sat: { closed: false, shifts: [{ open: '10:00', close: '23:00' }] }, sun: { closed: false, shifts: [{ open: '10:00', close: '23:00' }] } } }, profileMenu));

// Trouble states
write('state-expired', { __mock: { status: 403, body: { error: 'SUBSCRIPTION_EXPIRED', message: 'This restaurant menu is currently unavailable due to subscription expiry.' } } });
write('state-error', { __mock: { status: 500, body: { error: 'Internal server error' } } });
write('state-slow', { __mock: { delayMs: 6000 }, ...envelope(legacyRestaurant, profileMenu) });
write('state-flaky', { __mock: { failFirst: 1 }, ...envelope(legacyRestaurant, profileMenu) });
const fakeDishes = Array.from({ length: 13 }, (_, index) => ({ id: `item-${index + 1}`, name: `Placeholder ${index + 1}`, description: '', price: 100, category: 'Starters & Appetizers', dietType: 'veg', available: true }));
write('state-empty-placeholder', envelope(legacyRestaurant, { categories: ['starters', 'main', 'breads', 'desserts', 'beverages'].map((name, order) => ({ id: `cat-${name}`, name, order })), items: fakeDishes }));
write('state-empty', envelope(legacyRestaurant, { categories: [], items: [] }));
write('_qr', { 'qr-test': 'profile-full' });

console.log(`fixtures written to ${outDir}: ${photoMenu.items.length} dishes with photos, ${variantMenu.items.length} dishes with ${withVariants.variants.length} variants, stress menu ${stressMenu.items.length} dishes`);
