/**
 * MENUQR Design System — Typeface Pairings
 *
 * Five curated pairings over six families, replacing the thirteen families currently pulled from
 * the Google Fonts CDN in `frontend/index.html` (two stylesheets, one of them render-blocking,
 * with full variable weight ranges and italics). A QR menu's first paint is the moment a diner
 * decides whether the restaurant looks competent, and on Indian mobile data that budget is
 * being spent on fonts nobody selected.
 *
 * Every family here is licensed under the SIL Open Font License, so all six can be self-hosted
 * and subset. Only the two faces belonging to the active pairing are ever preloaded.
 *
 * Pairing rules applied: one display family plus one text family; never two display families;
 * the text family is a neutral workhorse so dish names and prices stay scannable; the display
 * family carries all of the personality.
 */

export type FontPairingId =
  | 'royal-serif'
  | 'modern-sans'
  | 'warm-editorial'
  | 'bold-street'
  | 'devanagari-pro';

export type FontSubset = 'latin' | 'latin-ext' | 'devanagari';

export type FontFace = {
  /** CSS family name, matching the self-hosted @font-face declaration. */
  family: string;
  /** Full stack including system fallbacks, so a failed font load degrades rather than breaks. */
  stack: string;
  /** Only these weights are generated and shipped. */
  weights: number[];
  subsets: FontSubset[];
  /** SIL Open Font License for every family in this set. */
  license: 'OFL-1.1';
};

export type FontPairing = {
  id: FontPairingId;
  label: string;
  /** Short note shown in the Design Studio so an owner can choose without jargon. */
  description: string;
  display: FontFace;
  body: FontFace;
  /** Display faces vary wildly in apparent size; this trims the type scale per pairing. */
  displayScaleAdjust: number;
  /** All-caps display faces need extra tracking to stay legible. */
  displayTracking: 'tighter' | 'tight' | 'normal' | 'wide' | 'widest';
  /** True when the pairing can render Devanagari, for Hindi and Marathi menus. */
  supportsDevanagari: boolean;
};

const SERIF_FALLBACK = '\'Cormorant Garamond\', Georgia, "Times New Roman", serif';
const SANS_FALLBACK = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const FACES = {
  cinzel: {
    family: 'Cinzel',
    stack: `'Cinzel', ${SERIF_FALLBACK}`,
    weights: [400, 700],
    subsets: ['latin'],
    license: 'OFL-1.1',
  },
  playfair: {
    family: 'Playfair Display',
    stack: `'Playfair Display', ${SERIF_FALLBACK}`,
    weights: [400, 600, 700],
    subsets: ['latin', 'latin-ext'],
    license: 'OFL-1.1',
  },
  jakarta: {
    family: 'Plus Jakarta Sans',
    stack: `'Plus Jakarta Sans', ${SANS_FALLBACK}`,
    weights: [400, 500, 700],
    subsets: ['latin', 'latin-ext'],
    license: 'OFL-1.1',
  },
  jakartaDisplay: {
    family: 'Plus Jakarta Sans',
    stack: `'Plus Jakarta Sans', ${SANS_FALLBACK}`,
    weights: [700, 800],
    subsets: ['latin', 'latin-ext'],
    license: 'OFL-1.1',
  },
  oswald: {
    family: 'Oswald',
    stack: `'Oswald', ${SANS_FALLBACK}`,
    weights: [500, 700],
    subsets: ['latin'],
    license: 'OFL-1.1',
  },
  rozha: {
    family: 'Rozha One',
    stack: `'Rozha One', ${SERIF_FALLBACK}`,
    weights: [400],
    subsets: ['latin', 'devanagari'],
    license: 'OFL-1.1',
  },
  mukta: {
    family: 'Mukta',
    stack: `'Mukta', ${SANS_FALLBACK}`,
    weights: [400, 600, 700],
    subsets: ['latin', 'devanagari'],
    license: 'OFL-1.1',
  },
} satisfies Record<string, FontFace>;

export const FONT_PAIRINGS: Record<FontPairingId, FontPairing> = {
  'royal-serif': {
    id: 'royal-serif',
    label: 'Royal Serif',
    description: 'Engraved capitals for heritage dining and fine dining.',
    display: FACES.cinzel,
    body: FACES.jakarta,
    // Cinzel is all-caps and optically large; trim it so headings do not overpower the page.
    displayScaleAdjust: 0.92,
    displayTracking: 'wide',
    supportsDevanagari: false,
  },
  'modern-sans': {
    id: 'modern-sans',
    label: 'Modern Sans',
    description: 'One clean family throughout. Minimal, contemporary, fastest to load.',
    display: FACES.jakartaDisplay,
    body: FACES.jakarta,
    displayScaleAdjust: 1,
    displayTracking: 'tight',
    supportsDevanagari: false,
  },
  'warm-editorial': {
    id: 'warm-editorial',
    label: 'Warm Editorial',
    description: 'High-contrast serif headings for bistros, cafes and patisseries.',
    display: FACES.playfair,
    body: FACES.jakarta,
    displayScaleAdjust: 1.04,
    displayTracking: 'tighter',
    supportsDevanagari: false,
  },
  'bold-street': {
    id: 'bold-street',
    label: 'Bold Street',
    description: 'Condensed poster type for dhabas, grills and burger joints.',
    display: FACES.oswald,
    body: FACES.jakarta,
    // Condensed faces read smaller at the same point size, so they get a lift.
    displayScaleAdjust: 1.08,
    displayTracking: 'wide',
    supportsDevanagari: false,
  },
  'devanagari-pro': {
    id: 'devanagari-pro',
    label: 'Devanagari Pro',
    description: 'Hindi and Marathi menus with matched Latin, for bilingual listings.',
    display: FACES.rozha,
    body: FACES.mukta,
    displayScaleAdjust: 0.96,
    displayTracking: 'normal',
    supportsDevanagari: true,
  },
};

export const FONT_PAIRING_IDS = Object.keys(FONT_PAIRINGS) as FontPairingId[];

export const DEFAULT_FONT_PAIRING: FontPairingId = 'warm-editorial';

export function getFontPairing(id: string | undefined): FontPairing {
  return FONT_PAIRINGS[id as FontPairingId] ?? FONT_PAIRINGS[DEFAULT_FONT_PAIRING];
}

export type FontAsset = { href: string; family: string; weight: number; subset: FontSubset };

function assetHref(face: FontFace, weight: number, subset: FontSubset): string {
  const slug = face.family.toLowerCase().replace(/\s+/g, '-');
  return `/fonts/${slug}-${weight}-${subset}.woff2`;
}

/**
 * Every woff2 file a pairing can use — the manifest for the asset build step and for
 * `@font-face` declarations.
 *
 * These are *declared*, not *preloaded*. Non-critical weights and subsets are fetched only when
 * a glyph in that range is actually painted, which is what `unicode-range` on each `@font-face`
 * is for. Use `fontPreloadsFor` to decide what goes in a `<link rel="preload">`.
 */
export function fontAssetsFor(id: FontPairingId): FontAsset[] {
  const pairing = FONT_PAIRINGS[id];
  const assets: FontAsset[] = [];
  const seen = new Set<string>();

  for (const face of [pairing.display, pairing.body]) {
    for (const weight of face.weights) {
      for (const subset of face.subsets) {
        const href = assetHref(face, weight, subset);
        if (seen.has(href)) continue;
        seen.add(href);
        assets.push({ href, family: face.family, weight, subset });
      }
    }
  }

  return assets;
}

/**
 * The critical files to preload: one display face and one body face.
 *
 * Deliberately two requests. The display face paints the restaurant name and the body face
 * paints everything else, so those two cover first paint; extra weights and the latin-ext or
 * Devanagari subsets arrive on demand. The menu performance gate budgets two font requests on
 * first view, and this is what keeps it there.
 */
export function fontPreloadsFor(id: FontPairingId): FontAsset[] {
  const pairing = FONT_PAIRINGS[id];
  const primarySubset: FontSubset = pairing.supportsDevanagari ? 'devanagari' : 'latin';

  const pick = (face: FontFace, preferredWeight: number): FontAsset => {
    const subset = face.subsets.includes(primarySubset) ? primarySubset : face.subsets[0];
    const weight = face.weights.includes(preferredWeight) ? preferredWeight : face.weights[0];
    return { href: assetHref(face, weight, subset), family: face.family, weight, subset };
  };

  // Display type is set bold where the family offers it; body copy is set at regular.
  const display = pick(pairing.display, pairing.display.weights.includes(700) ? 700 : pairing.display.weights[0]);
  const body = pick(pairing.body, 400);

  return display.href === body.href ? [display] : [display, body];
}

/** Every family that must exist in `frontend/public/fonts/`, for the build and for licence audit. */
export function allFontFamilies(): FontFace[] {
  const byFamily = new Map<string, FontFace>();

  for (const pairing of Object.values(FONT_PAIRINGS)) {
    for (const face of [pairing.display, pairing.body]) {
      const existing = byFamily.get(face.family);
      if (!existing) {
        byFamily.set(face.family, { ...face, weights: [...face.weights], subsets: [...face.subsets] });
        continue;
      }
      // The same family can appear with different weight sets (display vs body usage).
      existing.weights = [...new Set([...existing.weights, ...face.weights])].sort((a, b) => a - b);
      existing.subsets = [...new Set([...existing.subsets, ...face.subsets])];
    }
  }

  return [...byFamily.values()];
}
