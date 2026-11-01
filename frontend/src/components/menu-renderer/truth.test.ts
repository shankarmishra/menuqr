import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { prerender } from 'react-dom/static';
import { createServer, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import { allowedFor, findInventions, visibleStrings, type TruthFixture } from './truthLint.ts';
import type { RenderCategory, RenderRestaurant } from './types.ts';

/**
 * Truth lint for the menu renderers (blueprint 7.3).
 *
 * A menu may only print what the restaurant told us, what we can compute from it, or a neutral
 * label. These designs used to carry invented copy: founding years ("ESTD. 1953"), a Michelin seal,
 * a fictional chef brigade, medical claims about bell-metal plates, euro-priced dishes that were not
 * on the menu, a vegetarian mark on dishes whose diet nobody declared, and placeholder contact
 * details ("WWW.YOURWEBSITE.COM", "@ApnaDhaba"). All of it reached real restaurants' live menus.
 *
 * Two layers, because each catches what the other misses:
 *   1. Render lint. Every preset (legacy presets and every Edition) is rendered on the server with
 *      minimal data, with rich data and with no dishes, and every word or number on the page must
 *      be in the data, computed from it, or on the neutral allowlist in `truthLint.ts`.
 *   2. Source scan. Known kinds of invention are searched for in the renderer source, so one that
 *      hides in a branch the fixtures do not reach (a fallback, an unused prop) is still found.
 *
 * Add a pattern to FORBIDDEN whenever a new kind of invention is found.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(here, '..', '..', '..');
const SCAN_ROOTS = [here, path.join(here, '..', 'menu-builder', 'MenuTemplateRenderer.tsx')];

// ------------------------------------------ source scan ------------------------------------------

const FORBIDDEN: Array<{ name: string; pattern: RegExp }> = [
  { name: 'invented founding year', pattern: /\b(ESTD\.?|EST\.?|ESTABLISHED|SINCE)\s*(19|20)\d{2}\b/i },
  { name: 'invented heritage period', pattern: /\bsince the (19|20)\d0s\b|\bfor centuries\b|\bpreserved since\b/i },
  { name: 'currency the menu does not use', pattern: /€/ },
  { name: 'placeholder website', pattern: /YOURWEBSITE|yourwebsite|example\.com/i },
  { name: 'placeholder social handle', pattern: /ApnaDhaba|Apna Dhaba/i },
  { name: 'placeholder phone number', pattern: /323-517-4946/ },
  { name: 'placeholder cover words', pattern: /\bMENUBOOK\b/ },
  { name: 'award claim', pattern: /Michelin[ -]?stars?|3-?Star|michelin-seal|DecoMichelinSeal|Michelin 3/i },
  { name: 'fictional kitchen brigade', pattern: /brigade-(grid|item|title|role)|Kitchen Brigade|Ustad-e-|Bawarchi-e-|Khansama-e-|Halwai-e-|Rotiwala-e-|Maharaj-e-|Rasoi-e-|Pramukha Samayalkar|Chef Pâtissier Exécutif/ },
  { name: 'invented dish pairing', pattern: /Paired with:|Accompaniment:|Accompanied by:|12-Katori Ensemble|Pairing Ribbon/i },
  { name: 'invented preparation lore', pattern: /Tradition:<\/em>|Heritage:<\/em>|Kansa Bell Metal Benefit|card-lore|Basted in Desi Ghee|Charcoal seared •|sixteen hours|35kg/i },
  { name: 'health or medical claim', pattern: /alkalizes|tridosha|Charaka|therapeutic|neutralizes harsh|nourish mind, body/i },
  { name: 'invented provenance claim', pattern: /Beurres? AOP|Charentes-Poitou|Rishiri|Kishū Binchōtan|A2 cow ghee|Valrhona/i },
  { name: 'invented signature dish', pattern: /Millefeuille Inversé|Ispahan Rose|Ispahan/i },
  { name: 'French legal text for a menu that is not French', pattern: /Service et taxes compris|monnaie légale|Origine des viandes|Végétarien|Sans Gluten|Création de la Maison/i },
  { name: 'invented tagline fallback', pattern: /Nostalgic Irani|Where seasonal discipline|Awadhi &amp; Rajputana Imperial|Heirloom Podi Tiffins|Artisanal Grand Thalis|Highway Bhatthi Fire|Créations d&apos;Auteur|Menu D&eacute;gustation/ },
  { name: 'fallback cuisine the owner did not state', pattern: /ROBATAYAKI · KAISEKI|Haute Pâtisserie &amp; Salon de Thé|FAMILY RESTAURANT/ },
  { name: 'invented opening-hours or seating claim', pattern: />\s*Open Late\s*<|Counter Only|Today&rsquo;s Board|Khaas Pasand/ },
  { name: 'invented dietary-tradition name', pattern: /Shuddha Saivam|Asaivam|Shakahari|Mamsahari|Saatvik Bhojan|Rajasik Bhojan/ },
  { name: 'diet guessed from a dish name', pattern: /name\.toLowerCase\(\)\.includes\('(paneer|dal|veg|paratha|roti|naan|chana|lassi)'\)/ },
  { name: 'diet defaulted to vegetarian', pattern: /type = 'veg'|dietType \?\? 'veg'|dietType \|\| 'veg'/ },
];

function walk(target: string, out: string[] = []): string[] {
  const stat = fs.statSync(target);
  if (stat.isFile()) {
    if (/\.tsx?$/.test(target) && !/\.test\.tsx?$/.test(target)) out.push(target);
    return out;
  }
  for (const entry of fs.readdirSync(target)) {
    if (entry === 'node_modules') continue;
    walk(path.join(target, entry), out);
  }
  return out;
}

/** Blanks out comments but keeps every newline, so a match reports its real line number. */
function stripComments(source: string): string {
  const blank = (match: string) => match.replace(/[^\n]/g, ' ');
  return source.replace(/\/\*[\s\S]*?\*\//g, blank).replace(/(^|[^:'"`])\/\/[^\n]*/g, (match, lead: string) => lead + blank(match.slice(lead.length)));
}

const files = SCAN_ROOTS.flatMap((root) => walk(root)).filter((file) => !file.endsWith('truthLint.ts'));

test('truth lint: the source scan covers the real renderer files', () => {
  assert.ok(files.length >= 30, `expected to scan the renderer tree, found only ${files.length} files`);
  assert.ok(files.some((file) => file.endsWith('DhabaMasterpieceCover.tsx')));
  assert.ok(files.some((file) => file.endsWith('BombayChowkEdition.tsx')));
});

for (const { name, pattern } of FORBIDDEN) {
  test(`truth lint: no ${name}`, () => {
    const hits: string[] = [];
    for (const file of files) {
      const lines = stripComments(fs.readFileSync(file, 'utf8')).split('\n');
      lines.forEach((line, index) => {
        if (pattern.test(line)) hits.push(`${path.relative(here, file).split(path.sep).join('/')}:${index + 1}  ${line.trim().slice(0, 100)}`);
      });
    }
    assert.deepEqual(hits, [], `${name} found in the renderers:\n${hits.join('\n')}`);
  });
}

test('truth lint: renderer stylesheets cannot print text through CSS content', () => {
  const hits: string[] = [];
  const stack = [here];
  while (stack.length) {
    const dir = stack.pop() as string;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name.endsWith('.css')) {
        const css = fs.readFileSync(full, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
        for (const match of css.matchAll(/content:\s*(["'])((?:(?!\1).)*)\1/g)) {
          // Glyph escapes such as "\2022" and empty strings are decoration; letters and digits are copy.
          if (/[A-Za-z0-9]/.test(match[2].replace(/\\[0-9a-fA-F]{1,6}\s?/g, ''))) hits.push(`${entry.name}: ${match[0]}`);
        }
        if (/attr\(/.test(css)) hits.push(`${entry.name}: attr() content`);
      }
    }
  }
  assert.deepEqual(hits, [], `CSS prints text:\n${hits.join('\n')}`);
});

// ------------------------------------------ render lint ------------------------------------------

type Fixture = { restaurant: RenderRestaurant; categories: RenderCategory[] };

const MINIMAL: Fixture = {
  restaurant: { name: 'Test Kitchen' },
  categories: [{ id: 'c1', name: 'Starters', items: [{ id: 'i1', name: 'Paneer Tikka', price: 250, dietType: 'veg' }] }],
};

const RICH: Fixture = {
  restaurant: {
    name: "Shobharam's Kitchen",
    tagline: 'Pure veg and fresh',
    cuisine: 'North Indian, Chinese',
    phone: '+91 98765 43210, +91 98765 43211',
    address: 'Station Road',
    city: 'Sample City',
    state: 'Uttar Pradesh',
    openingHours: '9 AM to 10 PM',
    website: 'https://shobharam.in',
    instagram: '@https://instagram.com/shobharams',
    facebook: 'facebook.com/shobharams',
    logoUrl: '/logo.png',
  },
  categories: [
    {
      id: 'c1',
      name: 'Starters',
      description: 'Crisp and hot',
      items: [
        { id: 'i1', name: 'Paneer Tikka', description: 'Smoky cottage cheese', price: 250, dietType: 'veg', isBestseller: true, spicyLevel: 2, imageUrl: '/img/a.jpg' },
        { id: 'i2', name: 'Chicken Tikka', price: 320, dietType: 'non-veg', isSpecial: true, spicyLevel: 0 },
        { id: 'i3', name: 'Dal Fry', price: 190, halfPrice: 120, fullPrice: 190, pricingType: 'half-full', dietType: 'veg' },
        { id: 'i4', name: 'Gobi Manchurian', price: 160, dietType: 'veg', variants: [{ name: 'Half', price: 90 }, { name: 'Full', price: 160 }] },
        { id: 'i5', name: 'Mystery Dish', price: 0, dietType: 'veg' },
        { id: 'i6', name: 'Unmarked Dish', price: 100, dietType: undefined as never },
        { id: 'i7', name: 'Sold Dish', price: 110, dietType: 'veg', soldOut: true },
      ],
    },
    {
      id: 'c2',
      name: 'Breads',
      items: [
        { id: 'i8', name: 'Butter Naan', price: 60, dietType: 'veg', description: 'Soft and warm' },
        { id: 'i9', name: 'Zero Variant Roti', price: 30, dietType: 'veg', variants: [{ name: 'Half', price: 0 }, { name: 'Full', price: 30 }] },
      ],
    },
    { id: 'c3', name: 'Drinks', items: [{ id: 'i10', name: 'Sweet Lassi', price: 80, dietType: 'veg', imageUrl: '/img/b.jpg' }] },
  ],
};

const EMPTY: Fixture = { restaurant: { name: 'Test Kitchen' }, categories: [] };

/** The target of every <a> in the markup (not the resource hints React adds for images). */
const anchorHrefs = (html: string): string[] => [...html.matchAll(/<a\s[^>]*?href="([^"]*)"/g)].map((match) => match[1]);

/** Links a design may print for RICH: anchors, the two phone numbers, WhatsApp, Facebook, the website and a maps search. */
const ALLOWED_HREF = [
  /^#/,
  /^https:\/\/maps\.google\.com\/\?q=/,
  /^tel:\+91\d{10}$/,
  /^https:\/\/wa\.me\/91\d{10}$/,
  /^https:\/\/www\.facebook\.com\/shobharams$/,
  /^https:\/\/shobharam\.in$/,
];

type Loaded = {
  MenuRenderer: React.ComponentType<Record<string, unknown>>;
  CartContext: React.Context<Record<string, unknown>>;
  PRESETS: ReadonlyArray<{ id: string; legacy?: boolean }>;
  themeFromPresetId: (id: string) => unknown;
  DietMark: React.ComponentType<{ type?: string }>;
  DishPrice: React.ComponentType<{ item: unknown }>;
  EditionContact: React.ComponentType<{ restaurant: RenderRestaurant }>;
};

let vite: ViteDevServer;
let loaded: Loaded;

before(async () => {
  const stubCss = {
    name: 'truth-lint-stub-css',
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
    server: { middlewareMode: true, hmr: false, watch: null, ws: false },
    optimizeDeps: { noDiscovery: true, include: [] },
    plugins: [stubCss, react()],
  });
  const renderer = await vite.ssrLoadModule('/src/components/menu-renderer/MenuRenderer.tsx');
  const presets = await vite.ssrLoadModule('/src/design-system/presets.ts');
  const cart = await vite.ssrLoadModule('/src/components/menu-builder/templates/shared/MenuCartContext.tsx');
  const meta = await vite.ssrLoadModule('/src/components/menu-renderer/primitives/DishMeta.tsx');
  const shared = await vite.ssrLoadModule('/src/components/menu-renderer/signature/editions/shared.tsx');
  loaded = {
    EditionContact: shared.EditionContact,
    MenuRenderer: renderer.default,
    CartContext: cart.MenuCartContext,
    PRESETS: presets.PRESETS,
    themeFromPresetId: presets.themeFromPresetId,
    DietMark: meta.DietMark,
    DishPrice: meta.DishPrice,
  };
});

after(async () => {
  await vite?.close();
});

async function toHtml(element: React.ReactElement): Promise<string> {
  const { prelude } = await prerender(element);
  return new Response(prelude).text();
}

async function renderPreset(presetId: string, fixture: Fixture, ordering = false): Promise<string> {
  const menu = React.createElement(loaded.MenuRenderer, {
    theme: loaded.themeFromPresetId(presetId),
    restaurant: fixture.restaurant,
    categories: fixture.categories,
  });
  if (!ordering) return toHtml(menu);
  const cart = { isPremium: true, onAddToCart: () => {}, onRemoveFromCart: () => {}, getItemQuantity: () => 1 };
  return toHtml(React.createElement(loaded.CartContext.Provider, { value: cart }, menu));
}

const asTruthFixture = (fixture: Fixture): TruthFixture => ({
  restaurant: fixture.restaurant as Record<string, string | undefined>,
  categories: fixture.categories as TruthFixture['categories'],
});

function inventionsIn(html: string, fixture: Fixture): string[] {
  return findInventions(html, allowedFor(asTruthFixture(fixture))).map((item) => `"${item.token}" in "${item.context}"`);
}

test('render lint: the registry holds every legacy preset and every Edition', () => {
  assert.ok(loaded.PRESETS.length >= 30, `expected at least 30 presets, found ${loaded.PRESETS.length}`);
  assert.ok(loaded.PRESETS.some((preset) => preset.id === 'edition-bombay-chowk'));
  assert.ok(loaded.PRESETS.some((preset) => preset.id === 'rajasthani-heritage'));
});

// The presets are only known once the server is up, so the loop is over a fixed id list and the
// test below fails when a preset is registered that this list does not cover.
const PRESET_IDS = [
  'rajasthani-heritage', 'mughal-luxe', 'awadhi-dastarkhwan', 'craft-trattoria', 'artisan-pastry', 'greenhouse-botanic', 'coastal-seafood',
  'midnight-burger', 'tokyo-izakaya', 'rustic-smokehouse', 'desi-dhaba', 'boho-taproom',
  'signature-heritage-booklet', 'signature-graphic-booklet', 'signature-chalkboard-clipboard',
  'edition-maison-noir', 'edition-herbarium', 'edition-noren', 'edition-carta-rustica', 'edition-darbar', 'edition-chalk-house',
  'edition-atelier-pastel', 'edition-presse-brut', 'edition-littorale', 'edition-neon-ichiban', 'edition-maharaja-table',
  'edition-rang-e-punjab', 'edition-dakshin-heritage', 'edition-thali-and-co', 'edition-bombay-chowk',
];

test('render lint: no registered preset is missing from the lint list', () => {
  const missing = loaded.PRESETS.map((preset) => preset.id).filter((id) => !PRESET_IDS.includes(id) && !id.startsWith('atelier-'));
  assert.deepEqual(missing, [], `add these presets to PRESET_IDS in truth.test.ts: ${missing.join(', ')}`);
});

for (const presetId of PRESET_IDS) {
  test(`render lint: ${presetId} prints only data, computed facts and neutral labels`, async () => {
    const problems: string[] = [];
    for (const [label, fixture, ordering] of [
      ['minimal data', MINIMAL, false],
      ['rich data', RICH, false],
      ['rich data with ordering on', RICH, true],
      ['no dishes', EMPTY, false],
    ] as const) {
      const html = await renderPreset(presetId, fixture, ordering);
      assert.ok(html.length > 200, `${presetId} rendered almost nothing for ${label}`);
      for (const problem of inventionsIn(html, fixture)) problems.push(`[${label}] ${problem}`);
      // A price of zero or a missing price is never shown as a price.
      assert.ok(!/₹\s*0(?![\d.,])/.test(html), `[${label}] ${presetId} shows a price of 0`);
      // Every link is a real one: the malformed Instagram value in RICH must produce no link at all.
      assert.ok(!html.includes('@https'), `[${label}] ${presetId} prints an "@https" handle`);
      assert.ok(!/instagram\.com/i.test(html), `[${label}] ${presetId} links to Instagram from a malformed value`);
      for (const href of anchorHrefs(html)) {
        assert.ok(ALLOWED_HREF.some((pattern) => pattern.test(href)), `[${label}] ${presetId} has an unexpected link: ${href}`);
      }
    }
    assert.deepEqual(problems, [], `${presetId} prints text that is not from the data:\n${problems.join('\n')}`);
  });
}

// ------------------------------------ behaviour the lint relies on ------------------------------------

test('a dish whose diet is unknown gets no diet mark, and the three known diets each get a label', async () => {
  assert.equal(await toHtml(React.createElement(loaded.DietMark, {})), '');
  assert.equal(await toHtml(React.createElement(loaded.DietMark, { type: 'unknown' })), '');
  assert.match(await toHtml(React.createElement(loaded.DietMark, { type: 'veg' })), /aria-label="Vegetarian"/);
  assert.match(await toHtml(React.createElement(loaded.DietMark, { type: 'vegan' })), /aria-label="Vegan"/);
  assert.match(await toHtml(React.createElement(loaded.DietMark, { type: 'non-veg' })), /aria-label="Non-vegetarian"/);
});

test('a missing, zero or non-numeric price prints no price and no order button', async () => {
  const cart = { isPremium: true, onAddToCart: () => {}, onRemoveFromCart: () => {}, getItemQuantity: () => 0 };
  for (const price of [0, '0', '', 'abc', undefined]) {
    const item = { id: 'x', name: 'Test Dish', price, dietType: 'veg' };
    const html = await toHtml(React.createElement(loaded.CartContext.Provider, { value: cart }, React.createElement(loaded.DishPrice, { item })));
    assert.ok(!html.includes('₹'), `price ${String(price)} printed a price: ${html}`);
    assert.ok(!/>0</.test(html), `price ${String(price)} printed a stray 0: ${html}`);
    assert.ok(!html.includes('<button'), `price ${String(price)} offered an order button: ${html}`);
  }
});

test('EditionContact builds every link through socialLinks: a malformed value renders no link, never "@https://..."', async () => {
  const hrefsOf = async (restaurant: RenderRestaurant) => {
    const html = await toHtml(React.createElement(loaded.EditionContact, { restaurant }));
    return { html, hrefs: anchorHrefs(html) };
  };

  const broken = await hrefsOf({
    name: 'X',
    instagram: '@https://instagram.com/shankar.dhaba',
    facebook: 'https://www.facebook.com/sharer/sharer.php?u=1',
    website: 'javascript:alert(1)',
    phone: '12345',
  });
  assert.deepEqual(broken.hrefs, [], `malformed values produced links: ${broken.hrefs.join(', ')}`);
  assert.ok(!broken.html.includes('@https'), 'prints an @https handle');
  assert.ok(broken.html.includes('12345'), 'a number we cannot dial is still shown as the owner wrote it, just not as a link');

  const post = await hrefsOf({ name: 'X', instagram: 'https://www.instagram.com/p/ABC123/' });
  assert.deepEqual(post.hrefs, [], 'an Instagram post link is not a profile');

  const good = await hrefsOf({
    name: 'X',
    instagram: '@shobharams',
    facebook: 'facebook.com/shobharams',
    website: 'shobharam.in',
    phone: '+91 98765 43210, +91 98765 43211',
  });
  assert.deepEqual(good.hrefs, [
    'tel:+919876543210',
    'tel:+919876543211',
    'https://www.instagram.com/shobharams/',
    'https://www.facebook.com/shobharams',
    'https://shobharam.in',
  ]);
  // React separates adjacent text nodes with a comment, so read the text the way a person does.
  assert.ok(visibleStrings(good.html).includes('@shobharams'));
});

test('visibleStrings sees what a design prints, so the render lint cannot pass on an empty page', async () => {
  const html = await renderPreset('edition-bombay-chowk', MINIMAL);
  const strings = visibleStrings(html);
  assert.ok(strings.some((text) => text.includes('Test Kitchen')));
  assert.ok(strings.some((text) => text.includes('Paneer Tikka')));
});
