import test from 'node:test';
import assert from 'node:assert/strict';
import { contrastRatio, hexToOklch, isValidHex, oklchToHex, relativeLuminance, parseHex } from './color.ts';
import { CURATED_SEEDS, DEFAULT_SEED, derivePalette, type Palette, type PaletteMode } from './palette.ts';

const MODES: PaletteMode[] = ['light', 'dark'];

/** 24 hues at a realistic chroma — wide enough to catch hue-specific derivation errors. */
const HUE_SWEEP = Array.from({ length: 24 }, (_, i) => oklchToHex({ l: 0.6, c: 0.15, h: i * 15 }));

/** Deliberately hostile seeds: achromatic, near-white, near-black, and maximum chroma. */
const HOSTILE_SEEDS = [
  '#000000',
  '#ffffff',
  '#808080',
  '#FFC928', // very light and very saturated — worst case on a light page
  '#0B0B3B', // very dark and saturated — worst case on a dark page
  '#00FF00', // out of gamut once lightness is forced
];

const ALL_SEEDS = [DEFAULT_SEED, ...CURATED_SEEDS.map((s) => s.seed), ...HOSTILE_SEEDS, ...HUE_SWEEP];

/**
 * The legibility contract. Every pair here is enforced by `derivePalette`, and this table is the
 * single source of truth for what "a readable menu" means — the Playwright contrast gate in
 * Phase 6 asserts exactly the same pairs against the rendered DOM.
 */
const CONTRAST_CONTRACT: ReadonlyArray<{
  ink: keyof Palette;
  on: ReadonlyArray<keyof Palette>;
  min: number;
  why: string;
}> = [
  { ink: 'text', on: ['bg', 'surface', 'surfaceAlt'], min: 7, why: 'body ink, read in dim light' },
  { ink: 'heading', on: ['bg', 'surface', 'surfaceAlt'], min: 7, why: 'headings' },
  { ink: 'textMuted', on: ['bg', 'surface', 'surfaceAlt'], min: 4.5, why: 'dish descriptions' },
  { ink: 'accentText', on: ['bg', 'surface', 'surfaceAlt'], min: 4.5, why: 'brand colour as price text' },
  { ink: 'accent', on: ['bg', 'surface'], min: 3, why: 'decorative brand fills and rules' },
  { ink: 'accentContrast', on: ['accent'], min: 4.5, why: 'ink on an accent-filled button' },
  { ink: 'badgeText', on: ['badgeBg'], min: 4.5, why: 'BESTSELLER / price pills' },
  { ink: 'vegContrast', on: ['veg'], min: 4.5, why: 'veg mark glyph' },
  { ink: 'nonVegContrast', on: ['nonVeg'], min: 4.5, why: 'non-veg mark glyph' },
  { ink: 'focus', on: ['bg', 'surface'], min: 3, why: 'keyboard focus ring on the page' },
  { ink: 'focusOnAccent', on: ['accent'], min: 3, why: 'keyboard focus ring on a brand button' },
];

const HEX_TOKENS: ReadonlyArray<keyof Palette> = [
  'bg', 'surface', 'surfaceAlt', 'surfaceSunken',
  'text', 'textMuted', 'heading',
  'accent', 'accentText', 'accentContrast',
  'border', 'borderStrong',
  'badgeBg', 'badgeText',
  'veg', 'vegContrast', 'nonVeg', 'nonVegContrast',
  'focus', 'focusOnAccent',
];

test('palette: the contrast contract holds for every seed and mode', async (t) => {
  await t.test(`enforces all ${CONTRAST_CONTRACT.length} rules across ${ALL_SEEDS.length} seeds x 2 modes`, () => {
    const failures: string[] = [];

    for (const seed of ALL_SEEDS) {
      for (const mode of MODES) {
        const palette = derivePalette(seed, mode);

        for (const rule of CONTRAST_CONTRACT) {
          for (const background of rule.on) {
            const ratio = contrastRatio(palette[rule.ink], palette[background]);
            if (ratio < rule.min - 1e-6) {
              failures.push(
                `${seed}/${mode}: ${String(rule.ink)} on ${String(background)} = ${ratio.toFixed(2)}:1 ` +
                  `(need ${rule.min}:1 — ${rule.why})`
              );
            }
          }
        }
      }
    }

    assert.deepEqual(failures, [], `${failures.length} contrast failures:\n${failures.join('\n')}`);
  });
});

test('palette: structure', async (t) => {
  await t.test('every colour token is a valid hex value', () => {
    for (const seed of ALL_SEEDS) {
      for (const mode of MODES) {
        const palette = derivePalette(seed, mode);
        for (const token of HEX_TOKENS) {
          assert.ok(
            isValidHex(palette[token]),
            `${seed}/${mode}: ${String(token)} is not a hex colour (${palette[token]})`
          );
        }
        assert.match(palette.scrim, /^rgba\(\d+, \d+, \d+, [\d.]+\)$/, 'scrim must be an rgba string');
      }
    }
  });

  await t.test('surfaces are ordered by luminance in each mode', () => {
    for (const seed of ALL_SEEDS) {
      const luminance = (hex: string) => relativeLuminance(parseHex(hex)!);

      const dark = derivePalette(seed, 'dark');
      assert.ok(luminance(dark.surfaceSunken) <= luminance(dark.bg), `${seed}: dark sunken must be darkest`);
      assert.ok(luminance(dark.bg) <= luminance(dark.surface), `${seed}: dark surface must lift off bg`);
      assert.ok(luminance(dark.surface) <= luminance(dark.surfaceAlt), `${seed}: dark surfaceAlt must lift further`);

      const light = derivePalette(seed, 'light');
      assert.ok(luminance(light.surfaceSunken) <= luminance(light.surfaceAlt), `${seed}: light sunken ordering`);
      assert.ok(luminance(light.surfaceAlt) <= luminance(light.surface), `${seed}: light surfaceAlt ordering`);
    }
  });

  await t.test('borders are visible against the surfaces they divide', () => {
    for (const seed of ALL_SEEDS) {
      for (const mode of MODES) {
        const palette = derivePalette(seed, mode);
        assert.ok(
          contrastRatio(palette.border, palette.bg) > 1.08,
          `${seed}/${mode}: border is indistinguishable from bg`
        );
        assert.ok(
          contrastRatio(palette.borderStrong, palette.bg) > contrastRatio(palette.border, palette.bg),
          `${seed}/${mode}: borderStrong must be more prominent than border`
        );
      }
    }
  });

  await t.test('is deterministic', () => {
    for (const seed of ALL_SEEDS.slice(0, 12)) {
      for (const mode of MODES) {
        assert.deepEqual(derivePalette(seed, mode), derivePalette(seed, mode));
      }
    }
  });

  await t.test('falls back to the default seed for unparseable input', () => {
    assert.deepEqual(derivePalette('not-a-colour', 'dark'), derivePalette(DEFAULT_SEED, 'dark'));
    assert.deepEqual(derivePalette('', 'light'), derivePalette(DEFAULT_SEED, 'light'));
  });
});

test('palette: brand fidelity', async (t) => {
  await t.test('the accent keeps the seed hue', () => {
    for (const seed of HUE_SWEEP) {
      for (const mode of MODES) {
        const seedHue = hexToOklch(seed)!.h;
        const accentHue = hexToOklch(derivePalette(seed, mode).accent)!.h;
        const drift = Math.min(Math.abs(accentHue - seedHue), 360 - Math.abs(accentHue - seedHue));
        assert.ok(drift < 12, `${seed}/${mode}: accent hue drifted ${drift.toFixed(1)} degrees`);
      }
    }
  });

  await t.test('neutrals carry a hint of the brand hue without becoming colourful', () => {
    // The tint is what makes a generated palette feel authored rather than default-grey, but
    // too much chroma in a background reads as a printing error.
    const palette = derivePalette('#0B6E4F', 'dark');
    const bgChroma = hexToOklch(palette.bg)!.c;
    assert.ok(bgChroma > 0.001, 'background should pick up a trace of the brand hue');
    assert.ok(bgChroma <= 0.03, `background chroma ${bgChroma.toFixed(4)} is too saturated for a neutral`);
  });

  await t.test('an achromatic seed produces an achromatic palette', () => {
    // A black-and-white brand is a deliberate editorial choice; hue is undefined at zero chroma,
    // so inventing one would silently tint the whole menu.
    for (const seed of ['#000000', '#ffffff', '#808080', '#3a3a3a']) {
      for (const mode of MODES) {
        const palette = derivePalette(seed, mode);
        for (const token of ['bg', 'surface', 'accent', 'text', 'heading'] as const) {
          const chroma = hexToOklch(palette[token])!.c;
          assert.ok(chroma < 0.005, `${seed}/${mode}: ${token} picked up chroma ${chroma.toFixed(4)}`);
        }
      }
    }
  });

  await t.test('diet marks never follow the brand colour', () => {
    const reference = derivePalette(DEFAULT_SEED, 'dark');
    for (const seed of ALL_SEEDS) {
      for (const mode of MODES) {
        const palette = derivePalette(seed, mode);
        assert.equal(palette.veg, reference.veg, `${seed}/${mode}: veg mark must stay fixed`);
        assert.equal(palette.nonVeg, reference.nonVeg, `${seed}/${mode}: non-veg mark must stay fixed`);
      }
    }
  });

  await t.test('curated seeds are all parseable and distinct', () => {
    const seen = new Set<string>();
    for (const entry of CURATED_SEEDS) {
      assert.ok(isValidHex(entry.seed), `${entry.id} has an invalid seed`);
      assert.ok(MODES.includes(entry.mode), `${entry.id} has an invalid mode`);
      assert.ok(!seen.has(entry.id), `duplicate curated id ${entry.id}`);
      seen.add(entry.id);
    }
  });
});
