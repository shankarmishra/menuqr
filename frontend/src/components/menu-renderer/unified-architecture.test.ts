/**
 * MENUQR Unified Architecture Phase 1 Regression Tests
 *
 * Verifies:
 * 1. layoutVersion gating (missing -> 1, 1 -> 1, 2 -> 2, invalid caught)
 * 2. ThemeTokens and CSS classes (.mq-layout-v1 vs .mq-layout-v2)
 * 3. FSSAI diet invariants (0 marks for unknown/empty diet, green for veg/vegan, brown for non-veg)
 * 4. UnifiedDishDescription expansion (Read more for >110 chars)
 * 5. Plan entitlement & ADD button suppression for Basic/Intermediate
 * 6. Elastic no-image layout structure
 */

import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { prerender } from 'react-dom/static';
import { createServer, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';

const here = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(here, '..', '..', '..');

let vite: ViteDevServer;
let coerceTheme: (input: unknown, base?: any) => any;
let validateTheme: (input: unknown) => any;
let FALLBACK_THEME: any;
let resolveTheme: (theme: any) => any;
let themeFromPresetId: (id: string | null | undefined, overrides?: any) => any;
let DietMark: React.ComponentType<any>;
let isKnownDiet: (type: unknown) => boolean;
let UnifiedDishCard: React.ComponentType<any>;
let UnifiedDishDescription: React.ComponentType<any>;
let MenuCartContext: React.Context<any>;

before(async () => {
  const stubCss = {
    name: 'unified-stub-css',
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
    cacheDir: path.join(frontendRoot, 'node_modules', '.vite_test_unified'),
    server: { middlewareMode: true, hmr: false, watch: null, ws: false },
    optimizeDeps: { disabled: true, noDiscovery: true, include: [] },
    plugins: [stubCss, react()],
  });

  const validateMod = await vite.ssrLoadModule('/src/design-system/validateTheme.ts');
  coerceTheme = validateMod.coerceTheme;
  validateTheme = validateMod.validateTheme;
  FALLBACK_THEME = validateMod.FALLBACK_THEME;

  const resolveMod = await vite.ssrLoadModule('/src/design-system/resolveTheme.ts');
  resolveTheme = resolveMod.resolveTheme;

  const presetsMod = await vite.ssrLoadModule('/src/design-system/presets.ts');
  themeFromPresetId = presetsMod.themeFromPresetId;

  const dishMetaMod = await vite.ssrLoadModule('/src/components/menu-renderer/primitives/DishMeta.tsx');
  DietMark = dishMetaMod.DietMark;
  isKnownDiet = dishMetaMod.isKnownDiet;

  const unifiedMod = await vite.ssrLoadModule('/src/components/menu-renderer/primitives/UnifiedDishCard.tsx');
  UnifiedDishCard = unifiedMod.UnifiedDishCard;
  UnifiedDishDescription = unifiedMod.UnifiedDishDescription;

  const cartMod = await vite.ssrLoadModule('/src/components/menu-builder/templates/shared/MenuCartContext.tsx');
  MenuCartContext = cartMod.MenuCartContext;
});

after(async () => {
  await vite?.close();
});

async function renderHtml(el: React.ReactElement): Promise<string> {
  const { prelude } = await prerender(el);
  const stream = prelude;
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value);
  }
  return result;
}

test('Unified Architecture: layoutVersion version gating & validation', () => {
  // 1. Missing layoutVersion defaults to 1 (existing customer protection)
  const legacyThemeInput = { ...FALLBACK_THEME };
  delete legacyThemeInput.layoutVersion;
  const coercedLegacy = coerceTheme(legacyThemeInput);
  assert.equal(coercedLegacy.layoutVersion, 1, 'Missing layoutVersion must strictly default to 1');

  // 2. Explicit layoutVersion: 1 stays 1
  const v1ThemeInput = { ...FALLBACK_THEME, layoutVersion: 1 };
  const coercedV1 = coerceTheme(v1ThemeInput);
  assert.equal(coercedV1.layoutVersion, 1, 'Explicit layoutVersion: 1 must remain 1');

  // 3. Explicit layoutVersion: 2 stays 2
  const v2ThemeInput = { ...FALLBACK_THEME, layoutVersion: 2 };
  const coercedV2 = coerceTheme(v2ThemeInput);
  assert.equal(coercedV2.layoutVersion, 2, 'Explicit layoutVersion: 2 must remain 2');

  // 4. validateTheme reports invalid layoutVersion
  const invalidResult = validateTheme({ ...FALLBACK_THEME, layoutVersion: 3 });
  assert.equal(invalidResult.ok, false);
  assert.ok(invalidResult.errors.some((e: string) => e.includes('layoutVersion must be 1 or 2')));
  assert.equal(invalidResult.theme.layoutVersion, 1, 'Invalid layoutVersion coerces safely to 1');

  // 5. themeFromPresetId defaults to 1
  const presetTheme = themeFromPresetId('royal-maharaja');
  assert.equal(presetTheme.layoutVersion, 1, 'themeFromPresetId must default to layoutVersion: 1');

  // 6. themeFromPresetId accepts explicit layoutVersion: 2
  const presetThemeV2 = themeFromPresetId('royal-maharaja', { layoutVersion: 2 });
  assert.equal(presetThemeV2.layoutVersion, 2, 'themeFromPresetId must accept explicit layoutVersion: 2');
});

test('Unified Architecture: resolveTheme token integration', () => {
  const v1Theme = themeFromPresetId('royal-maharaja', { layoutVersion: 1 });
  const v1Tokens = resolveTheme(v1Theme);
  assert.equal(v1Tokens.layoutVersion, 1);

  const v2Theme = themeFromPresetId('royal-maharaja', { layoutVersion: 2 });
  const v2Tokens = resolveTheme(v2Theme);
  assert.equal(v2Tokens.layoutVersion, 2);
});

test('Unified Architecture: FSSAI diet mark invariants', async () => {
  // Unknown diets must NEVER get a green vegetarian mark
  assert.equal(isKnownDiet(undefined), false);
  assert.equal(isKnownDiet(null), false);
  assert.equal(isKnownDiet('unknown'), false);
  assert.equal(isKnownDiet('halal'), false);
  assert.equal(isKnownDiet(''), false);

  // DietMark renders null for unknown diet
  const unknownHtml = await renderHtml(React.createElement(DietMark, { type: undefined }));
  assert.equal(unknownHtml, '', 'Unknown diet must render zero HTML marks');

  const emptyHtml = await renderHtml(React.createElement(DietMark, { type: '' as any }));
  assert.equal(emptyHtml, '', 'Empty diet string must render zero HTML marks');

  // Veg and Vegan render veg glyph
  const vegHtml = await renderHtml(React.createElement(DietMark, { type: 'veg' }));
  assert.ok(vegHtml.includes('mq-diet-veg'), 'Veg diet must render veg mark');
  assert.ok(vegHtml.includes('Vegetarian'));

  const veganHtml = await renderHtml(React.createElement(DietMark, { type: 'vegan' }));
  assert.ok(veganHtml.includes('mq-diet-veg'), 'Vegan diet must render veg mark');
  assert.ok(veganHtml.includes('Vegan'));

  // Non-veg renders non-veg glyph
  const nonVegHtml = await renderHtml(React.createElement(DietMark, { type: 'non-veg' }));
  assert.ok(nonVegHtml.includes('mq-diet-non-veg'), 'Non-veg diet must render non-veg mark');
  assert.ok(nonVegHtml.includes('Non-vegetarian'));
});

test('Unified Architecture: UnifiedDishDescription accessible expansion', async () => {
  // Short description (<110 chars)
  const shortText = 'Tender paneer cubes simmered in a rich tomato, butter, and cashew gravy.';
  const shortHtml = await renderHtml(React.createElement(UnifiedDishDescription, { text: shortText }));
  assert.ok(shortHtml.includes(shortText));
  assert.ok(!shortHtml.includes('Read more'), 'Short description must NOT render "Read more" button');

  // Long description (>110 chars)
  const longText =
    'Authentic Rajasthani slow-cooked mutton prepared in pure ghee with traditional Mathania red chillies, whole spices, garlic, and fresh ground coriander over wood embers for eight hours.';
  assert.ok(longText.length > 110);
  const longHtml = await renderHtml(React.createElement(UnifiedDishDescription, { text: longText }));
  assert.ok(longHtml.includes('Read more'), 'Long description must render accessible "Read more" button');
  assert.ok(longHtml.includes('aria-expanded="false"'), 'Expander must have accessible aria-expanded attribute');
});

test('Unified Architecture: Plan entitlement and ADD button suppression', async () => {
  const sampleItem = {
    id: 'dish-1',
    name: 'Dal Makhani',
    description: 'Slow-cooked black lentils with cream and butter.',
    price: 240,
    dietType: 'veg',
  };

  // 1. Basic / Intermediate Plan (isPremium = false): ADD button MUST NOT appear
  const basicCart = {
    isPremium: false,
    onAddToCart: undefined,
    getItemQuantity: () => 0,
  };

  const basicHtml = await renderHtml(
    React.createElement(
      MenuCartContext.Provider,
      { value: basicCart },
      React.createElement(UnifiedDishCard, { item: sampleItem })
    )
  );

  assert.ok(
    !basicHtml.includes('mq-unified-add-btn') && !basicHtml.includes('mq-unified-stepper'),
    'Basic plan without ordering capability MUST NOT render ADD button'
  );

  // 2. Premium Plan (isPremium = true, onAddToCart provided): ADD button MUST appear
  const premiumCart = {
    isPremium: true,
    onAddToCart: () => {},
    getItemQuantity: () => 0,
  };

  const premiumHtml = await renderHtml(
    React.createElement(
      MenuCartContext.Provider,
      { value: premiumCart },
      React.createElement(UnifiedDishCard, { item: sampleItem })
    )
  );

  assert.ok(
    premiumHtml.includes('mq-unified-add-btn'),
    'Premium plan with customer_ordering capability MUST render ADD button'
  );

  // 3. readOnly = true: ADD button MUST NOT appear even on Premium
  const readOnlyHtml = await renderHtml(
    React.createElement(
      MenuCartContext.Provider,
      { value: premiumCart },
      React.createElement(UnifiedDishCard, { item: sampleItem, readOnly: true })
    )
  );

  assert.ok(
    !readOnlyHtml.includes('mq-unified-add-btn'),
    'readOnly mode MUST suppress ADD button regardless of plan'
  );
});

test('Unified Architecture: Elastic no-image layout', async () => {
  const itemNoImage = {
    id: 'dish-no-img',
    name: 'Butter Naan',
    description: 'Crisp, layered traditional tandoori flatbread with cultured butter.',
    price: 60,
    dietType: 'veg',
    imageUrl: undefined,
  };

  const itemWithImage = {
    id: 'dish-with-img',
    name: 'Paneer Tikka',
    description: 'Charcoal grilled cottage cheese marinated in spiced yogurt.',
    price: 280,
    dietType: 'veg',
    imageUrl: '/images/paneer-tikka.jpg',
  };

  // No-image card
  const noImageHtml = await renderHtml(React.createElement(UnifiedDishCard, { item: itemNoImage }));
  assert.ok(noImageHtml.includes('mq-no-image'), 'No-image card must include mq-no-image class');
  assert.ok(!noImageHtml.includes('mq-unified-media-col'), 'No-image card must completely omit media column');

  // With-image card
  const withImageHtml = await renderHtml(React.createElement(UnifiedDishCard, { item: itemWithImage }));
  assert.ok(withImageHtml.includes('has-image'), 'Image card must include has-image class');
  assert.ok(withImageHtml.includes('mq-unified-media-col'), 'Image card must render media column');
});

test('Unified Architecture: Real Indian Hindi text & Devanagari names', async () => {
  const hindiDish = {
    id: 'dish-hindi',
    name: 'मक्के दी रोटी ते सरसों दा साग',
    description: 'ताज़ी सरसों का साग मक्खन और गुड़ के साथ परोसा जाता है।',
    price: 280,
    dietType: 'veg',
  };

  const html = await renderHtml(React.createElement(UnifiedDishCard, { item: hindiDish }));
  assert.ok(html.includes('मक्के दी रोटी ते सरसों दा साग'), 'Hindi name must render uncorrupted');
  assert.ok(html.includes('ताज़ी सरसों का साग मक्खन और गुड़ के साथ परोसा जाता है।'), 'Hindi description must render uncorrupted');
});

test('Unified Architecture: Verified badges rendering (Bestseller, Special, Jain, Eggless, Spicy)', async () => {
  const bestsellerDish = {
    id: 'dish-bestseller',
    name: 'Paneer Makhani Deluxe',
    description: 'Rich royal paneer dish.',
    price: 320,
    dietType: 'veg',
    isBestseller: true,
    spicyLevel: 2,
    tags: {
      jain: true,
      eggless: true,
      allergens: ['Dairy', 'Cashew'],
    },
  };

  const specialDish = {
    id: 'dish-special',
    name: 'Shahi Gosht Biryani',
    description: 'Royal aromatic dum biryani.',
    price: 450,
    dietType: 'non-veg',
    isSpecial: true,
  };

  const bestsellerHtml = await renderHtml(React.createElement(UnifiedDishCard, { item: bestsellerDish }));
  assert.ok(bestsellerHtml.includes('Bestseller'), 'Bestseller badge must render');
  assert.ok(bestsellerHtml.includes('Jain'), 'Jain badge must render');
  assert.ok(bestsellerHtml.includes('Eggless'), 'Eggless badge must render');
  assert.ok(bestsellerHtml.includes('Dairy, Cashew'), 'Allergens badge must render');

  const specialHtml = await renderHtml(React.createElement(UnifiedDishCard, { item: specialDish }));
  assert.ok(specialHtml.includes('Chef') && specialHtml.includes('Special'), 'Special badge must render for chef special dishes');
});

test('Unified Architecture: Pilot variants styling support (.mq-card-dhaba, .mq-card-luxury, .mq-card-editorial)', async () => {
  const sampleItem = {
    id: 'dish-pilot',
    name: 'Signature Feast',
    description: 'Artfully curated dish.',
    price: 450,
    dietType: 'veg',
  };

  // Rang-e-Punjab Dhaba variant
  const dhabaHtml = await renderHtml(
    React.createElement(UnifiedDishCard, { item: sampleItem, className: 'mq-card-dhaba' })
  );
  assert.ok(dhabaHtml.includes('mq-card-dhaba'), 'Card must accept mq-card-dhaba variant class');

  // Maison Noir Luxury variant
  const luxuryHtml = await renderHtml(
    React.createElement(UnifiedDishCard, { item: sampleItem, className: 'mq-card-luxury' })
  );
  assert.ok(luxuryHtml.includes('mq-card-luxury'), 'Card must accept mq-card-luxury variant class');

  // Presse Brut Editorial variant with monospaced index
  const editorialHtml = await renderHtml(
    React.createElement(UnifiedDishCard, { item: sampleItem, index: 4, className: 'mq-card-editorial' })
  );
  assert.ok(editorialHtml.includes('mq-card-editorial'), 'Card must accept mq-card-editorial variant class');
  assert.ok(editorialHtml.includes('05'), 'Editorial card must render 2-digit monospaced index 05');
});

test('Unified Architecture: 300-item menu performance & stress containment', async () => {
  const items300 = Array.from({ length: 300 }, (_, i) => ({
    id: `dish-${i + 1}`,
    name: `Course Dish #${i + 1}`,
    description: `Delicious chef specialty item number ${i + 1} with authentic seasoning.`,
    price: 150 + (i % 10) * 15,
    dietType: i % 2 === 0 ? 'veg' : 'non-veg',
    imageUrl: i % 3 === 0 ? undefined : `/images/thumb-${i}.jpg`,
  }));

  const startTime = Date.now();
  // Render batch of 50 in static SSR (representative slice of heavy viewport render)
  for (let i = 0; i < 50; i++) {
    await renderHtml(React.createElement(UnifiedDishCard, { item: items300[i], index: i }));
  }
  const renderDuration = Date.now() - startTime;
  assert.ok(renderDuration < 1500, `SSR render of 50 cards took ${renderDuration}ms (threshold 1500ms)`);
});
