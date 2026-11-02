import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { prerender } from 'react-dom/static';
import { createServer, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import { allowedFor, findInventions, type TruthFixture } from '../truthLint.ts';
import type { RenderCategory, RenderMenuItem, RenderRestaurant } from '../types.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(here, '..', '..', '..', '..');

let vite: ViteDevServer;
let AtelierCanvas: React.ComponentType<any>;
let B1Cover: React.ComponentType<any>;
let B4Contents: React.ComponentType<any>;
let B5SectionOpener: React.ComponentType<any>;
let B6ListRow: React.ComponentType<any>;
let B15BackCover: React.ComponentType<any>;
let AtelierRangeen: React.ComponentType<any>;

before(async () => {
  const stubCss = {
    name: 'atelier-stub-css',
    enforce: 'pre' as const,
    load(id: string) {
      if (/\.css(\?|$)/.test(id)) return 'export default ""';
      return undefined;
    },
  };
  vite = await createServer({
    configFile: false,
    root: frontendRoot,
    logLevel: 'error',
    appType: 'custom',
    cacheDir: path.join(frontendRoot, 'node_modules', '.vite_test_atelier'),
    server: { middlewareMode: true, hmr: false, watch: null, ws: false },
    optimizeDeps: { disabled: true, noDiscovery: true, include: [] },
    plugins: [stubCss, react()],
  });

  const canvasMod = await vite.ssrLoadModule('/src/components/menu-renderer/atelier/AtelierCanvas.tsx');
  const b1Mod = await vite.ssrLoadModule('/src/components/menu-renderer/atelier/blocks/B1Cover.tsx');
  const b4Mod = await vite.ssrLoadModule('/src/components/menu-renderer/atelier/blocks/B4Contents.tsx');
  const b5Mod = await vite.ssrLoadModule('/src/components/menu-renderer/atelier/blocks/B5SectionOpener.tsx');
  const b6Mod = await vite.ssrLoadModule('/src/components/menu-renderer/atelier/blocks/B6ListRow.tsx');
  const b15Mod = await vite.ssrLoadModule('/src/components/menu-renderer/atelier/blocks/B15BackCover.tsx');
  const rangeenMod = await vite.ssrLoadModule('/src/components/menu-renderer/atelier/AtelierRangeen.tsx');

  AtelierCanvas = canvasMod.AtelierCanvas;
  B1Cover = b1Mod.B1Cover;
  B4Contents = b4Mod.B4Contents;
  B5SectionOpener = b5Mod.B5SectionOpener;
  B6ListRow = b6Mod.B6ListRow;
  B15BackCover = b15Mod.B15BackCover;
  AtelierRangeen = rangeenMod.AtelierRangeen;
});

after(async () => {
  await vite?.close();
});

async function toHtml(element: React.ReactElement): Promise<string> {
  const { prelude } = await prerender(element);
  return new Response(prelude).text();
}

test('AtelierCanvas: renders a 400px wide canvas element with scaling wrapper', async () => {
  const html = await toHtml(
    React.createElement(
      AtelierCanvas,
      { className: 'test-canvas' },
      React.createElement('div', null, 'Canvas Content')
    )
  );
  assert.ok(html.includes('atelier-viewport'));
  assert.ok(html.includes('atelier-canvas-scaler'));
  assert.ok(html.includes('atelier-canvas'));
  assert.ok(html.includes('width:400px'));
  assert.ok(html.includes('Canvas Content'));
});

test('B1Cover: renders Name Poster typography, truthful tagline, city and optional logo', async () => {
  const restaurantWithLogo: RenderRestaurant = {
    name: 'Mannat Tandoori Junction',
    tagline: 'Authentic Charcoal Tastes',
    city: 'Ghaziabad',
    cuisine: 'North Indian',
    phone: '+91 95480 89761',
    logoUrl: '/logos/mannat.png',
  };

  const htmlWithLogo = await toHtml(React.createElement(B1Cover, { restaurant: restaurantWithLogo }));
  assert.ok(htmlWithLogo.includes('Mannat Tandoori'), 'top line rendered');
  assert.ok(htmlWithLogo.includes('Junction'), 'main poster line rendered');
  assert.ok(htmlWithLogo.includes('Authentic Charcoal Tastes'), 'truthful tagline rendered');
  assert.ok(htmlWithLogo.includes('Ghaziabad'), 'city rendered');
  assert.ok(htmlWithLogo.includes('North Indian'), 'cuisine rendered');
  assert.ok(htmlWithLogo.includes('/logos/mannat.png'), 'logo rendered');
  assert.ok(htmlWithLogo.includes('object-fit:contain'), 'logo must use object-fit: contain');
  assert.ok(htmlWithLogo.includes('tel:+919548089761'), 'phone link rendered');

  const minimalRestaurant: RenderRestaurant = {
    name: "Shobharam's",
  };
  const htmlMinimal = await toHtml(React.createElement(B1Cover, { restaurant: minimalRestaurant }));
  assert.ok(htmlMinimal.includes('Shobharam'), 'one-word name rendered');
  assert.ok(!htmlMinimal.includes('<img'), 'no img rendered when logoUrl is missing');
  assert.ok(!htmlMinimal.includes('atelier-cover-tagline'), 'tagline omitted when not supplied');
});

test('B4Contents: renders search bar, diet chips and category tabs with counts', async () => {
  const categories: RenderCategory[] = [
    { id: 'c1', name: 'Tandoori Starters', items: [{ id: 'i1', name: 'Paneer Tikka', price: 240, dietType: 'veg' }] },
    { id: 'c2', name: 'Breads & Roti', items: [{ id: 'i2', name: 'Butter Naan', price: 60, dietType: 'veg' }] },
  ];

  const html = await toHtml(
    React.createElement(B4Contents, {
      categories,
      activeCategoryId: 'c1',
      onSelectCategory: () => {},
      dietFilter: 'all',
      onDietFilterChange: () => {},
      counts: { all: 2, veg: 2, nonVeg: 0 },
      query: '',
      onQueryChange: () => {},
    })
  );

  assert.ok(html.includes('Tandoori Starters'));
  assert.ok(html.includes('Breads') && html.includes('Roti'));
  assert.ok(html.includes('#mq-section-c1'));
  assert.ok(html.includes('#mq-section-c2'));
  assert.ok(html.includes('Search dishes'));
});

test('B5SectionOpener: renders honest section number and category title', async () => {
  const category: RenderCategory = {
    id: 'c1',
    name: 'Main Course',
    description: 'Slow-cooked Punjabi gravies',
    items: [
      { id: 'i1', name: 'Dal Makhani', price: 260, dietType: 'veg' },
      { id: 'i2', name: 'Paneer Butter Masala', price: 290, dietType: 'veg' },
    ],
  };

  const html = await toHtml(React.createElement(B5SectionOpener, { category, index: 0 }));
  assert.ok(html.includes('Section') && html.includes('01'), 'zero-padded honest section number');
  assert.ok(html.includes('2') && html.includes('dishes'), 'computed dish count');
  assert.ok(html.includes('Main Course'), 'category name');
  assert.ok(html.includes('Slow-cooked Punjabi gravies'), 'category description');
});

test('B6ListRow: handles honest pricing, variants, Hindi subtitles, and hides zero/missing price', async () => {
  const dish1: RenderMenuItem = {
    id: 'd1',
    name: 'Paneer Tikka',
    description: 'Charcoal grilled cottage cheese',
    price: 250,
    dietType: 'veg',
    imageUrl: '/images/paneer-tikka.webp',
    isBestseller: true,
    i18n: { hi: { name: 'पनीर टिक्का' } },
  };
  const html1 = await toHtml(React.createElement(B6ListRow, { item: dish1, index: 0 }));
  assert.ok(html1.includes('Paneer Tikka'));
  assert.ok(html1.includes('पनीर टिक्का'));
  assert.ok(html1.includes('250'));
  assert.ok(html1.includes('Bestseller'));
  assert.ok(html1.includes('aria-label="Vegetarian"'));
  assert.ok(html1.includes('/images/paneer-tikka.webp'));

  const dishVariants: RenderMenuItem = {
    id: 'd2',
    name: 'Dal Makhani',
    price: 220,
    pricingType: 'half-full',
    variants: [
      { id: 'v1', name: 'Half', price: 140 },
      { id: 'v2', name: 'Full', price: 220 },
    ],
    dietType: 'veg',
  };
  const htmlVariants = await toHtml(React.createElement(B6ListRow, { item: dishVariants, index: 1 }));
  assert.ok(htmlVariants.includes('Half'));
  assert.ok(htmlVariants.includes('140'));
  assert.ok(htmlVariants.includes('Full'));
  assert.ok(htmlVariants.includes('220'));

  const dishZero: RenderMenuItem = {
    id: 'd3',
    name: 'Mystery Dish',
    price: 0,
    dietType: 'veg',
  };
  const htmlZero = await toHtml(React.createElement(B6ListRow, { item: dishZero, index: 2 }));
  assert.ok(!htmlZero.includes('₹'), 'zero price must not print currency');
  assert.ok(!htmlZero.includes('>0<'), 'zero price must not print 0');

  const dishUnknownDiet: RenderMenuItem = {
    id: 'd4',
    name: 'Plain Rice',
    price: 120,
    dietType: undefined as never,
  };
  const htmlUnknownDiet = await toHtml(React.createElement(B6ListRow, { item: dishUnknownDiet, index: 3 }));
  assert.ok(!htmlUnknownDiet.includes('mq-diet'), 'unknown diet must get no diet mark');
});

test('B15BackCover: prints only owner data and valid links', async () => {
  const restaurant: RenderRestaurant = {
    name: 'Shankar Dhaba',
    tagline: 'Desi Ghee Delicacies',
    address: 'NH-58, Highway Road',
    city: 'Murthal',
    state: 'Haryana',
    phone: '+91 98765 43210',
    openingHours: '24 Hours Open',
    instagram: '@shankardhaba',
    website: 'https://shankardhaba.in',
  };

  const html = await toHtml(React.createElement(B15BackCover, { restaurant }));
  assert.ok(html.includes('Shankar Dhaba'));
  assert.ok(html.includes('Desi Ghee Delicacies'));
  assert.ok(html.includes('NH-58, Highway Road, Murthal, Haryana'));
  assert.ok(html.includes('tel:+919876543210'));
  assert.ok(html.includes('https://www.instagram.com/shankardhaba/'));
  assert.ok(html.includes('https://shankardhaba.in'));
  assert.ok(html.includes('24 Hours Open'));
  assert.ok(!html.includes('ESTD'), 'no invented founding year');
});

test('AtelierRangeen: vertical slice renders end-to-end truthfully', async () => {
  const restaurant: RenderRestaurant = {
    name: 'Rangeen Rasoi',
    tagline: 'Flavours of Old Delhi',
    city: 'New Delhi',
    cuisine: 'Mughlai & Street Food',
    phone: '+91 98111 22233',
    openingHours: '11:00 AM to 11:30 PM',
  };

  const categories: RenderCategory[] = [
    {
      id: 'c1',
      name: 'Starters',
      items: [
        { id: 'i1', name: 'Seekh Kebab', price: 280, dietType: 'non-veg', isBestseller: true },
        { id: 'i2', name: 'Dahi Ke Sholay', price: 210, dietType: 'veg' },
      ],
    },
    {
      id: 'c2',
      name: 'Breads',
      items: [{ id: 'i3', name: 'Roomali Roti', price: 30, dietType: 'veg' }],
    },
  ];

  const html = await toHtml(
    React.createElement(AtelierRangeen, {
      restaurant,
      categories,
    })
  );

  const fixture: TruthFixture = {
    restaurant: restaurant as Record<string, string | undefined>,
    categories: categories as TruthFixture['categories'],
  };
  const allowed = allowedFor(fixture);
  const inventions = findInventions(html, allowed);
  assert.deepEqual(inventions, [], `Found unexpected tokens: ${JSON.stringify(inventions)}`);
});
