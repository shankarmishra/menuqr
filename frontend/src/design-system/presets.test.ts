import test from 'node:test';
import assert from 'node:assert/strict';
import { contrastRatio, isValidHex } from './color.ts';
import { derivePalette } from './palette.ts';
import { FONT_PAIRING_IDS } from './fonts.ts';
import {
  DEFAULT_PRESET_ID,
  getPreset,
  PRESET_IDS,
  PRESETS,
  presetFromProfile,
  themeFromPreset,
  themeFromPresetId,
} from './presets.ts';
import { resolveTheme } from './resolveTheme.ts';
import {
  COVER_SLOTS,
  DISH_CARD_SLOTS,
  FOOTER_SLOTS,
  NAV_SLOTS,
  SECTION_SLOTS,
  SIGNATURE_COMPOSITION_IDS,
  TEXTURE_IDS,
  THEME_VERSION,
} from './theme.types.ts';
import { validateTheme } from './validateTheme.ts';

/** The twelve template ids live in data/menuTemplates.ts; presets must cover all of them. */
const LIVE_TEMPLATE_IDS = [
  'rajasthani-heritage',
  'mughal-luxe',
  'craft-trattoria',
  'midnight-burger',
  'awadhi-dastarkhwan',
  'artisan-pastry',
  'tokyo-izakaya',
  'coastal-seafood',
  'rustic-smokehouse',
  'greenhouse-botanic',
  'desi-dhaba',
  'boho-taproom',
];

/** The three Tier-2 presets, each pointing at a Signature composition rather than slots alone. */
const SIGNATURE_PRESET_IDS = [
  'signature-heritage-booklet',
  'signature-graphic-booklet',
  'signature-chalkboard-clipboard',
];

test('presets: catalogue integrity', async (t) => {
  await t.test('covers every currently live template id', () => {
    for (const id of LIVE_TEMPLATE_IDS) {
      assert.ok(PRESET_IDS.includes(id), `no preset for live template "${id}"`);
    }
    assert.equal(PRESETS.length, LIVE_TEMPLATE_IDS.length + SIGNATURE_PRESET_IDS.length);
  });

  await t.test('exactly the three Signature presets carry a signatureId, one each', () => {
    const withSignature = PRESETS.filter((p) => p.signatureId != null);
    assert.equal(withSignature.length, SIGNATURE_PRESET_IDS.length);

    for (const id of SIGNATURE_PRESET_IDS) {
      const preset = PRESETS.find((p) => p.id === id);
      assert.ok(preset, `missing signature preset "${id}"`);
      assert.ok(
        SIGNATURE_COMPOSITION_IDS.includes(preset!.signatureId!),
        `${id}: signatureId "${preset!.signatureId}" is not a known composition`
      );
    }

    // Every composition id is used by exactly one preset — no silent duplicate or gap.
    const usedCompositionIds = withSignature.map((p) => p.signatureId);
    assert.equal(new Set(usedCompositionIds).size, SIGNATURE_COMPOSITION_IDS.length);

    for (const preset of PRESETS) {
      if (!SIGNATURE_PRESET_IDS.includes(preset.id)) {
        assert.equal(preset.signatureId, undefined, `${preset.id}: composable preset must not set signatureId`);
      }
    }
  });

  await t.test('ids are unique, slug-shaped and lowercase', () => {
    assert.equal(new Set(PRESET_IDS).size, PRESET_IDS.length, 'duplicate preset id');
    for (const id of PRESET_IDS) {
      assert.match(id, /^[a-z0-9][a-z0-9-]*$/, `"${id}" is not slug-shaped`);
    }
  });

  await t.test('every field is drawn from the allowed vocabulary', () => {
    for (const preset of PRESETS) {
      assert.ok(isValidHex(preset.seedColor), `${preset.id}: invalid seed colour`);
      assert.ok(['light', 'dark'].includes(preset.mode), `${preset.id}: invalid mode`);
      assert.ok(FONT_PAIRING_IDS.includes(preset.typePair), `${preset.id}: unknown type pairing`);
      assert.ok(TEXTURE_IDS.includes(preset.texture), `${preset.id}: unknown texture`);
      assert.ok(COVER_SLOTS.includes(preset.slots.cover), `${preset.id}: unknown cover slot`);
      assert.ok(NAV_SLOTS.includes(preset.slots.nav), `${preset.id}: unknown nav slot`);
      assert.ok(DISH_CARD_SLOTS.includes(preset.slots.dishCard), `${preset.id}: unknown card slot`);
      assert.ok(SECTION_SLOTS.includes(preset.slots.section), `${preset.id}: unknown section slot`);
      assert.ok(FOOTER_SLOTS.includes(preset.slots.footer), `${preset.id}: unknown footer slot`);
    }
  });

  await t.test('every preset has owner-facing copy', () => {
    for (const preset of PRESETS) {
      assert.ok(preset.label.length > 2, `${preset.id}: missing label`);
      assert.ok(preset.description.length > 20, `${preset.id}: description is too thin to help`);
      assert.ok(preset.audience.length > 10, `${preset.id}: no audience stated`);
    }
  });

  await t.test('the catalogue is varied rather than twelve recolours', () => {
    // The old twelve templates were largely the same layout in different palettes. A preset
    // catalogue that repeats one slot combination would reproduce exactly that problem.
    const combinations = new Set(
      PRESETS.map((p) => [p.slots.cover, p.slots.nav, p.slots.dishCard, p.slots.section].join('|'))
    );
    assert.ok(combinations.size >= 8, `only ${combinations.size} distinct slot combinations`);

    for (const slot of ['cover', 'nav', 'dishCard', 'section', 'footer'] as const) {
      const used = new Set(PRESETS.map((p) => p.slots[slot]));
      assert.ok(used.size >= 2, `every preset uses the same ${slot} slot`);
    }

    assert.ok(new Set(PRESETS.map((p) => p.typePair)).size >= 3, 'type pairings are not varied');
    assert.ok(PRESETS.some((p) => p.mode === 'light'), 'no light preset');
    assert.ok(PRESETS.some((p) => p.mode === 'dark'), 'no dark preset');
  });
});

test('presets: resolution', async (t) => {
  await t.test('every preset expands into a theme that validates', () => {
    for (const preset of PRESETS) {
      const theme = themeFromPreset(preset);
      const result = validateTheme(theme);
      assert.ok(result.ok, `${preset.id}: ${result.ok ? '' : result.errors.join('; ')}`);
      assert.equal(theme.version, THEME_VERSION);
      assert.equal(theme.presetId, preset.id);
    }
  });

  await t.test('every preset resolves to a legible palette', () => {
    // The same contract enforced in palette.test.ts, re-checked here so a preset cannot ship a
    // seed colour that happens to break on its own mode.
    for (const preset of PRESETS) {
      const palette = derivePalette(preset.seedColor, preset.mode);
      const checks: Array<[string, string, string, number]> = [
        ['text', palette.text, palette.bg, 7],
        ['text-on-surface', palette.text, palette.surface, 7],
        ['textMuted', palette.textMuted, palette.bg, 4.5],
        ['heading', palette.heading, palette.bg, 7],
        ['accentText', palette.accentText, palette.surface, 4.5],
        ['accent', palette.accent, palette.bg, 3],
        ['badgeText', palette.badgeText, palette.badgeBg, 4.5],
      ];

      for (const [name, fg, bg, min] of checks) {
        const ratio = contrastRatio(fg, bg);
        assert.ok(ratio >= min - 1e-6, `${preset.id}: ${name} is ${ratio.toFixed(2)}:1, needs ${min}:1`);
      }
    }
  });

  await t.test('overrides survive expansion', () => {
    const theme = themeFromPresetId('mughal-luxe', { announcement: 'Happy Hours 4-7 PM' });
    assert.equal(theme.announcement, 'Happy Hours 4-7 PM');
    assert.equal(theme.presetId, 'mughal-luxe');
  });
});

test('presets: legacy id resolution', async (t) => {
  await t.test('resolves the live ids to themselves', () => {
    for (const id of LIVE_TEMPLATE_IDS) {
      assert.equal(getPreset(id).id, id);
    }
  });

  await t.test('maps the retired template ids to a sensible preset', () => {
    // Every id that templates/index.ts could reach but menuTemplates.ts never defined.
    const retired = [
      'royal-maharaja',
      'banarasi-gold',
      'south-indian-heritage',
      'indian-street-kitchen',
      'modern-india',
      'spice-house',
      'maison-noir',
      'ivory-dining',
      'grand-table',
      'coffee-house',
      'paper-cafe',
      'bombay-street',
      'minimal-editorial',
      'ember',
      'maison',
      'botanica',
      'smash-club',
      'tokyo-table',
      'riviera',
      'greenhouse',
      'gully',
      'patisserie',
      'studio-10',
    ];

    for (const id of retired) {
      const preset = getPreset(id);
      assert.ok(PRESET_IDS.includes(preset.id), `${id} resolved to unknown preset ${preset.id}`);
    }
  });

  await t.test('resolves the schema default, which names a template that never existed', () => {
    // backend/schema.sql defaults template_id to 'royal-maharaja', absent from menuTemplates.ts.
    assert.equal(getPreset('royal-maharaja').id, 'mughal-luxe');
  });

  await t.test('falls back for unknown, empty and hostile ids', () => {
    for (const id of [null, undefined, '', 'does-not-exist', '../../etc/passwd', 'ROYAL-MAHARAJA']) {
      const preset = getPreset(id as string);
      assert.ok(PRESET_IDS.includes(preset.id), `${String(id)} resolved outside the catalogue`);
    }
    assert.equal(getPreset('does-not-exist').id, DEFAULT_PRESET_ID);
    assert.equal(getPreset('  Mughal-Luxe  ').id, 'mughal-luxe', 'should normalise case and spacing');
  });
});

test('presets: onboarding rules', async (t) => {
  await t.test('maps representative cuisines deterministically', () => {
    const cases: Array<[string, string]> = [
      ['Mughlai', 'awadhi-dastarkhwan'],
      ['Pure Veg Rajasthani Thali', 'rajasthani-heritage'],
      ['Punjabi Dhaba', 'desi-dhaba'],
      ['Wood Fired Pizza', 'craft-trattoria'],
      ['Artisan Bakery & Patisserie', 'artisan-pastry'],
      ['Organic Salad Bowls', 'greenhouse-botanic'],
      ['Coastal Seafood', 'coastal-seafood'],
      ['Smash Burger Joint', 'midnight-burger'],
      ['Japanese Ramen', 'tokyo-izakaya'],
      ['Texas BBQ Smokehouse', 'rustic-smokehouse'],
      ['Craft Brewery Taproom', 'boho-taproom'],
    ];

    for (const [cuisine, expected] of cases) {
      assert.equal(presetFromProfile(cuisine).id, expected, `"${cuisine}" mapped incorrectly`);
    }
  });

  await t.test('prefers the most specific cuisine keyword', () => {
    // "north indian" (12 chars) must beat the generic "indian" (6 chars).
    assert.equal(presetFromProfile('North Indian').id, 'desi-dhaba');
    assert.equal(presetFromProfile('Indian').id, 'rajasthani-heritage');
  });

  await t.test('falls back rather than failing for an unknown or missing cuisine', () => {
    assert.equal(presetFromProfile(undefined).id, DEFAULT_PRESET_ID);
    assert.equal(presetFromProfile('').id, DEFAULT_PRESET_ID);
    assert.equal(presetFromProfile('Molecular Gastronomy').id, DEFAULT_PRESET_ID);
  });

  await t.test('positioning adjusts slots without changing the brand colour', () => {
    const base = presetFromProfile('Pizza');
    const fine = presetFromProfile('Pizza', 'fine-dining');

    assert.equal(fine.seedColor, base.seedColor, 'positioning must not alter the palette');
    assert.equal(fine.slots.dishCard, 'michelin-leader');

    const minimal = presetFromProfile('Pizza', 'minimalist');
    assert.equal(minimal.slots.cover, 'monogram');
  });

  await t.test('every profile result is renderable', () => {
    for (const cuisine of ['Mughlai', 'Pizza', 'unknown cuisine', '']) {
      for (const positioning of [undefined, 'fine-dining', 'casual', 'minimalist'] as const) {
        const theme = themeFromPreset(presetFromProfile(cuisine, positioning));
        assert.doesNotThrow(() => resolveTheme(theme), `${cuisine}/${positioning} failed to resolve`);
      }
    }
  });
});
