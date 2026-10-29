/**
 * MENUQR Design System — Palette Derivation
 *
 * One brand colour in, a complete semantic palette out, with legibility proven rather than
 * eyeballed. This replaces the hand-authored 7-to-10 key colour literals in
 * `data/menuTemplates.ts` and the switch statement in `design-engine/designGenerator.ts`, where
 * every palette was tuned by hand and therefore varied in quality.
 *
 * The derivation is a fixed set of OKLCH lightness targets plus a chroma budget. Because OKLCH
 * lightness is perceptually uniform, the same targets produce a coherent palette for a gold, an
 * emerald or a navy seed. Contrast is then *enforced*, not hoped for, so an owner cannot pick a
 * colour that makes their own menu unreadable.
 */

import {
  adjust,
  alpha,
  contrastRatio,
  ensureContrast,
  ensureContrastAll,
  hexToOklch,
  oklchToHex,
  readableOn,
  type Oklch,
} from './color.ts';

export type PaletteMode = 'light' | 'dark';

export type Palette = {
  /** Page background. */
  bg: string;
  /** Raised surface: cards, sheets. */
  surface: string;
  /** Secondary surface: alternating rows, chips. */
  surfaceAlt: string;
  /** Recessed surface: wells, image placeholders. */
  surfaceSunken: string;

  /** Body ink. Guaranteed 7:1 on both bg and surface. */
  text: string;
  /** Secondary ink for descriptions. Guaranteed 4.5:1 on both bg and surface. */
  textMuted: string;
  /** Heading ink. Guaranteed 7:1 on both bg and surface. */
  heading: string;

  /** Brand colour for decorative fills, rules and icons. At least 3:1 on bg. */
  accent: string;
  /** Brand colour safe to use as small text on bg or surface. At least 4.5:1. */
  accentText: string;
  /** Ink to place on top of an `accent` fill. At least 4.5:1 on accent. */
  accentContrast: string;

  /** Hairline divider. */
  border: string;
  /** Emphasised divider and input outline. */
  borderStrong: string;

  /** Badge fill and its ink: "BESTSELLER", price pills. */
  badgeBg: string;
  badgeText: string;

  /** Diet marks. Fixed by regulation and convention — never derived from the brand colour. */
  veg: string;
  vegContrast: string;
  nonVeg: string;
  nonVegContrast: string;

  /** Gradient scrim laid over cover photography so overlaid type stays legible. */
  scrim: string;

  /**
   * Focus ring for controls sitting on the page or on a card. At least 3:1 on bg and surface.
   *
   * Split into two tokens on purpose. A single ring colour that must also be visible on an
   * accent-filled button is over-constrained — on a dark page with a light brand colour, the
   * only colour that contrasts with both is a mid-tone that contrasts well with neither. Two
   * tokens let each context get a ring that is actually visible.
   */
  focus: string;
  /** Focus ring for controls filled with `accent`. At least 3:1 on accent. */
  focusOnAccent: string;
};

/**
 * FSSAI-style diet marks: green for vegetarian, maroon-brown for non-vegetarian. These are a
 * regulatory and recognition signal, not a style choice, so brand colour must never override
 * them — a restaurant with a red brand colour must not end up with red veg marks.
 */
const DIET_VEG = '#1A7F37';
const DIET_NON_VEG = '#A4272B';

/** Lightness and chroma-budget targets per mode. Chroma budgets keep neutrals from going muddy. */
const TARGETS = {
  dark: {
    bg: { l: 0.17, chromaBudget: 0.028, chromaShare: 0.22 },
    surface: { l: 0.235, chromaBudget: 0.026, chromaShare: 0.2 },
    surfaceAlt: { l: 0.29, chromaBudget: 0.03, chromaShare: 0.2 },
    surfaceSunken: { l: 0.125, chromaBudget: 0.024, chromaShare: 0.22 },
    border: { l: 0.37, chromaBudget: 0.032, chromaShare: 0.25 },
    borderStrong: { l: 0.47, chromaBudget: 0.04, chromaShare: 0.3 },
    text: { l: 0.96, chromaBudget: 0.009, chromaShare: 0.05 },
    textMuted: { l: 0.74, chromaBudget: 0.014, chromaShare: 0.08 },
    heading: { l: 0.985, chromaBudget: 0.007, chromaShare: 0.04 },
    /** On a dark page a dark accent disappears, so the seed is lifted into this band. */
    accentBand: { min: 0.6, max: 0.86 },
  },
  light: {
    bg: { l: 0.975, chromaBudget: 0.014, chromaShare: 0.12 },
    surface: { l: 1, chromaBudget: 0.004, chromaShare: 0.03 },
    surfaceAlt: { l: 0.945, chromaBudget: 0.018, chromaShare: 0.14 },
    surfaceSunken: { l: 0.912, chromaBudget: 0.022, chromaShare: 0.16 },
    border: { l: 0.862, chromaBudget: 0.024, chromaShare: 0.18 },
    borderStrong: { l: 0.73, chromaBudget: 0.034, chromaShare: 0.24 },
    text: { l: 0.26, chromaBudget: 0.014, chromaShare: 0.06 },
    textMuted: { l: 0.505, chromaBudget: 0.02, chromaShare: 0.1 },
    heading: { l: 0.19, chromaBudget: 0.012, chromaShare: 0.05 },
    /** On a light page a pale accent disappears, so the seed is pulled into this band. */
    accentBand: { min: 0.3, max: 0.62 },
  },
} as const;

type Target = { l: number; chromaBudget: number; chromaShare: number };

/** Place a neutral at a target lightness, tinted by the seed hue within its chroma budget. */
function neutral(seed: Oklch, target: Target): string {
  return oklchToHex(
    adjust(seed, {
      l: target.l,
      c: Math.min(target.chromaBudget, seed.c * target.chromaShare),
    })
  );
}

export const DEFAULT_SEED = '#D4AF37';

/**
 * Build a full palette from a single seed colour.
 *
 * Contrast targets: 7:1 for primary ink and headings (menus get read in dim restaurant light,
 * so AAA is worth the small loss of brand tint), 4.5:1 for secondary ink and any brand colour
 * used as small text, 3:1 for purely decorative brand fills.
 */
export function derivePalette(seedHex: string, mode: PaletteMode = 'dark'): Palette {
  const seed = hexToOklch(seedHex) ?? hexToOklch(DEFAULT_SEED)!;
  const t = TARGETS[mode];

  const bg = neutral(seed, t.bg);
  const surface = neutral(seed, t.surface);
  const surfaceAlt = neutral(seed, t.surfaceAlt);
  const surfaceSunken = neutral(seed, t.surfaceSunken);
  const border = neutral(seed, t.border);
  const borderStrong = neutral(seed, t.borderStrong);

  // Ink must survive on the page background and on raised cards alike.
  const inkSurfaces = [bg, surface, surfaceAlt];

  const text = ensureContrastAll(neutral(seed, t.text), inkSurfaces, 7);
  const heading = ensureContrastAll(neutral(seed, t.heading), inkSurfaces, 7);
  const textMuted = ensureContrastAll(neutral(seed, t.textMuted), inkSurfaces, 4.5);

  // Keep the seed recognisable but pull it into a lightness band where it reads against the page.
  //
  // An achromatic seed (black, white, grey) stays achromatic. Hue is undefined at zero chroma,
  // so inventing chroma here would turn a deliberately monochrome brand into an arbitrary tint —
  // a Swiss-editorial black-and-white menu must not come back dusty pink.
  const bandedAccent = oklchToHex(
    adjust(seed, {
      l: Math.min(t.accentBand.max, Math.max(t.accentBand.min, seed.l)),
      c: seed.c < 0.02 ? 0 : seed.c,
    })
  );

  const accent = ensureContrastAll(bandedAccent, [bg, surface], 3);
  const accentText = ensureContrastAll(bandedAccent, inkSurfaces, 4.5);
  const accentContrast = ensureContrast(readableOn(accent), accent, 4.5);

  return {
    bg,
    surface,
    surfaceAlt,
    surfaceSunken,

    text,
    textMuted,
    heading,

    accent,
    accentText,
    accentContrast,

    border,
    borderStrong,

    badgeBg: accent,
    badgeText: accentContrast,

    veg: DIET_VEG,
    vegContrast: ensureContrast(readableOn(DIET_VEG), DIET_VEG, 4.5),
    nonVeg: DIET_NON_VEG,
    nonVegContrast: ensureContrast(readableOn(DIET_NON_VEG), DIET_NON_VEG, 4.5),

    // Cover photos are arbitrary, so the scrim is anchored to near-black rather than the brand
    // colour: a tinted scrim over an unknown photo reads as a colour cast.
    scrim: alpha('#05070A', mode === 'dark' ? 0.62 : 0.48),

    // Keep the ring recognisably brand-coloured where that is legible, and fall back to a
    // neutral only when the brand colour cannot reach 3:1 against the surfaces it sits on.
    focus: pickFocusRing(accent, [bg, surface]),
    focusOnAccent: pickFocusRing(accent, [accent]),
  };
}

/**
 * Choose the ring colour with the best worst-case contrast across the given backgrounds,
 * preferring lightness variants of the brand colour over plain black or white.
 */
function pickFocusRing(accent: string, against: string[]): string {
  const accentOklch = hexToOklch(accent)!;
  const candidates = [
    accent,
    oklchToHex(adjust(accentOklch, { l: 0.82 })),
    oklchToHex(adjust(accentOklch, { l: 0.66 })),
    oklchToHex(adjust(accentOklch, { l: 0.42 })),
    oklchToHex(adjust(accentOklch, { l: 0.22 })),
    '#ffffff',
    '#000000',
  ];

  let best = candidates[0];
  let bestWorstCase = -1;

  for (const candidate of candidates) {
    const worstCase = Math.min(...against.map((background) => contrastRatio(candidate, background)));
    // Once a candidate clears the 3:1 non-text threshold, prefer it over a higher-contrast but
    // less brand-faithful option further down the list.
    if (worstCase >= 3 && bestWorstCase < 3) return candidate;
    if (worstCase > bestWorstCase) {
      bestWorstCase = worstCase;
      best = candidate;
    }
  }

  return best;
}

/**
 * Curated starting points shown before the custom colour picker.
 *
 * `ensureContrast` guarantees legibility for any seed, but it cannot guarantee taste — so the
 * Design Studio leads with these and treats the free picker as the secondary path.
 */
export const CURATED_SEEDS: ReadonlyArray<{ id: string; label: string; seed: string; mode: PaletteMode }> = [
  { id: 'imperial-gold', label: 'Imperial Gold', seed: '#D4AF37', mode: 'dark' },
  { id: 'royal-emerald', label: 'Royal Emerald', seed: '#0B6E4F', mode: 'dark' },
  { id: 'espresso-oat', label: 'Espresso & Oat', seed: '#8A5A2B', mode: 'light' },
  { id: 'heritage-maroon', label: 'Heritage Maroon', seed: '#8D1436', mode: 'light' },
  { id: 'midnight-amber', label: 'Midnight Amber', seed: '#F59E0B', mode: 'dark' },
  { id: 'sage-terracotta', label: 'Sage & Terracotta', seed: '#C4703C', mode: 'light' },
  { id: 'coastal-indigo', label: 'Coastal Indigo', seed: '#1E4C7C', mode: 'dark' },
  { id: 'patisserie-rose', label: 'Patisserie Rose', seed: '#B2566F', mode: 'light' },
];
