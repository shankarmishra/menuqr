import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { outDir, urls } from './lib/gate-env.mjs';
import { buildFixtures } from './lib/fixtures.mjs';
import { buildMenu } from './lib/menu-data.mjs';
import { closePool, seedTenant } from './lib/seed.mjs';

type Item = ReturnType<typeof buildMenu>['items'][number];

/** Seeds the "world" every spec reads: tenants shaped like the live ones plus a large synthetic one. */
export default async function globalSetup() {
  const { api, base } = urls();
  const health = await fetch(`${api}/api/health`).catch(() => null);
  if (!health || health.status >= 500) throw new Error(`Backend is not healthy at ${api}/api/health (status ${health?.status ?? 'unreachable'}).`);

  const photoBase = `${api}/uploads/gate`;
  const fixtures = await buildFixtures({ photoBase });
  const menu = buildMenu();
  const photo = (item: Item) => (item.hasPhoto ? `${photoBase}/photo-${item.photoSlot}.jpg` : undefined);

  // 1. Large synthetic PREMIUM tenant: 220 dishes, 20 categories, Hindi + English, half/full, missing prices, long descriptions.
  const lab = await seedTenant({
    businessName: 'Gate Rasoi Dhaba', slug: 'gate-rasoi', plan: 'PREMIUM', phone: '+91 98765 43210', city: 'Jaipur',
    address: 'Plot 12, Station Road, Jaipur', tagline: 'Synthetic test restaurant', instagram: 'gate.dhaba',
    facebook: 'facebook.com/gatedhaba', website: 'https://gate-dhaba.in', themePreset: 'desi-dhaba',
    categories: menu.categories.map((c) => c.name),
    items: menu.items.map((i) => ({ name: i.name, category: i.category, description: i.description, price: i.price, halfPrice: i.halfPrice, fullPrice: i.fullPrice, imageUrl: photo(i), diet: i.diet, variants: i.variants, bestseller: i.bestseller })),
  });

  // 2. Shankar Dhaba style: PREMIUM, 205 dishes in 19 categories (one with 65), 204 stock-style photos, 47 half/full, Edition theme.
  const shape = menu.items.slice(0, 205);
  let split = 0;
  const shankar = await seedTenant({
    businessName: 'Gate Dhaba (Premium Edition Style)', slug: 'gate-premium-edition', plan: 'PREMIUM', phone: '+91 98765 43211', city: 'Bhopal',
    address: 'NH-46, Bhopal', tagline: 'Dhaba shaped like a live premium tenant', themePreset: 'edition-bombay-chowk',
    categories: Array.from({ length: 19 }, (_, i) => `Section ${i + 1}`),
    items: shape.map((i, n) => {
      const keepSplit = i.halfPrice != null && split < 47 && (split++, true);
      return {
        name: i.nameEn, category: n < 65 ? 0 : 1 + ((n - 65) % 18), description: n % 5 < 2 && n < 205 ? i.description.slice(0, 105) : '',
        price: keepSplit ? i.fullPrice : (i.price ?? 150), halfPrice: keepSplit ? i.halfPrice : null, fullPrice: keepSplit ? i.fullPrice : null,
        imageUrl: n === 204 ? undefined : `${photoBase}/photo-${n % 12}.jpg`, diet: 'veg',
      };
    }),
  });

  // 3. Shobharam's style: BASIC, 137 dishes, 19 categories, 76 Half/Full variants, no photos, a phone field with two numbers, legacy PDF theme.
  let variantItems = 0;
  const shobha = await seedTenant({
    businessName: 'Gate Bhojnalaya (Basic Variants Style)', slug: 'gate-basic-variants', plan: 'BASIC', phone: '+91 98765 43212, +91 91234 56781', city: 'Indore',
    address: 'Main Road, Indore', templateId: 'pdf-bespoke-theme',
    categories: Array.from({ length: 19 }, (_, i) => `Menu ${i + 1}`),
    items: menu.items.slice(0, 137).map((i, n) => {
      const withVariants = variantItems < 38 && n % 3 === 0 && (variantItems++, true);
      const full = i.fullPrice ?? i.price ?? 120;
      const half = i.halfPrice ?? Math.round(full * 0.6 / 5) * 5;
      return {
        name: i.nameEn, category: n % 19, price: withVariants ? full : (i.price ?? 120), halfPrice: withVariants ? half : null, fullPrice: withVariants ? full : null,
        diet: 'veg', variants: withVariants ? [{ name: 'Half', price: half }, { name: 'Full', price: full }] : [],
      };
    }),
  });

  // 4. A paid tenant that has not loaded a menu yet.
  const empty = await seedTenant({ businessName: 'Gate Empty Kitchen', slug: 'gate-empty-menu', plan: 'PREMIUM', phone: '+91 98765 43213', city: 'Pune', withMenu: true, withQr: true });

  const pick = (t: Awaited<ReturnType<typeof seedTenant>>) => t;
  const world = {
    api, base, outDir: outDir(),
    tenants: { lab: pick(lab), shankar: pick(shankar), shobha: pick(shobha), empty: pick(empty) },
    fixtures: { workbook: fixtures.workbook, logos: fixtures.logos, realLogos: fixtures.realLogos, expected: fixtures.expected, social: fixtures.social },
  };
  mkdirSync(join(outDir(), 'results'), { recursive: true });
  writeFileSync(join(outDir(), 'results', 'world.json'), JSON.stringify(world, null, 2));
  await closePool();
}
