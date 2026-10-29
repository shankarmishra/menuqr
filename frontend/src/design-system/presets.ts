/**
 * MENUQR Design System — Presets
 *
 * A preset is a starting point, not a template: pure data describing one coherent combination of
 * slots, type pairing, texture and brand colour. Everything here is overridable by the owner in
 * the Design Studio, and "reset to preset" restores this record.
 *
 * All twelve ids match the template ids in `data/menuTemplates.ts`, so an existing
 * `appearance_settings.template_id` resolves straight to its preset with no data migration.
 *
 * Seed colours are taken from each old template's `accent`, and modes from its background
 * luminance, so a client who has already chosen a template keeps the look they picked.
 *
 * Note what a preset costs: roughly fifteen lines of data. The templates these replace averaged
 * about three hundred lines of TSX each.
 */

import type { Density, RadiusToken, ShadowToken } from './scales.ts';
import type { FontPairingId } from './fonts.ts';
import type { PaletteMode } from './palette.ts';
import {
  CENTRE_FOCAL,
  THEME_VERSION,
  type MenuTheme,
  type SignatureCompositionId,
  type SlotSelection,
  type TextureId,
} from './theme.types.ts';

export type PresetCategory = 'heritage' | 'fine-dining' | 'cafe' | 'street' | 'bar' | 'contemporary' | 'signature';

export type Preset = {
  id: string;
  label: string;
  /** One line shown on the preset card in the Design Studio. */
  description: string;
  /** Who it is for, so an owner can self-select without design vocabulary. */
  audience: string;
  category: PresetCategory;
  seedColor: string;
  mode: PaletteMode;
  slots: SlotSelection;
  /** Set only on the three Signature presets, which render their own full-page composition. */
  signatureId?: SignatureCompositionId;
  typePair: FontPairingId;
  texture: TextureId;
  density: Density;
  radius: RadiusToken;
  shadow: ShadowToken;
};

export const PRESETS: readonly Preset[] = [
  {
    id: 'rajasthani-heritage',
    label: 'Heritage Parchment',
    description: 'Warm parchment, terracotta botanicals and a scalloped arch.',
    audience: 'Royal Indian, heritage dining, traditional thali houses',
    category: 'heritage',
    seedColor: '#d76c3c',
    mode: 'light',
    slots: {
      cover: 'heritage-arch',
      nav: 'underline-tabs',
      dishCard: 'magazine',
      section: 'arch-title',
      footer: 'contact-block',
    },
    typePair: 'royal-serif',
    texture: 'parchment',
    density: 'spacious',
    radius: 'sm',
    shadow: 'subtle',
  },
  {
    id: 'mughal-luxe',
    label: 'Mughal Luxe',
    description: 'Deep emerald and antique gold under palace arches.',
    audience: 'Mughlai fine dining, banquet halls, Nawabi kitchens',
    category: 'heritage',
    seedColor: '#d7b66d',
    mode: 'dark',
    slots: {
      cover: 'heritage-arch',
      nav: 'underline-tabs',
      dishCard: 'magazine',
      section: 'arch-title',
      footer: 'contact-block',
    },
    typePair: 'royal-serif',
    texture: 'silk',
    density: 'spacious',
    radius: 'sm',
    shadow: 'elevated',
  },
  {
    id: 'awadhi-dastarkhwan',
    label: 'Awadhi Dastarkhwan',
    description: 'Ivory and saffron with maroon headings, set like a banquet card.',
    audience: 'Awadhi and Lucknowi kitchens, kebab houses',
    category: 'heritage',
    seedColor: '#c99700',
    mode: 'light',
    slots: {
      cover: 'heritage-arch',
      nav: 'underline-tabs',
      dishCard: 'michelin-leader',
      section: 'arch-title',
      footer: 'contact-block',
    },
    typePair: 'royal-serif',
    texture: 'parchment',
    density: 'spacious',
    radius: 'none',
    shadow: 'none',
  },
  {
    id: 'craft-trattoria',
    label: 'Craft Trattoria',
    description: 'Vintage cream and pillar-box red, built around a photo collage.',
    audience: 'Italian trattorias, pizzerias, wine bars',
    category: 'cafe',
    seedColor: '#d32f2f',
    mode: 'light',
    slots: {
      cover: 'bento-collage',
      nav: 'capsule-pills',
      dishCard: 'magazine',
      section: 'ribbon',
      footer: 'contact-block',
    },
    typePair: 'warm-editorial',
    texture: 'grain',
    density: 'balanced',
    radius: 'lg',
    shadow: 'subtle',
  },
  {
    id: 'artisan-pastry',
    label: 'Sweet Velvet Patisserie',
    description: 'Powdered rose and soft shadows, with dishes as square tiles.',
    audience: 'Patisseries, bakeries, dessert cafes',
    category: 'cafe',
    seedColor: '#d81b60',
    mode: 'light',
    slots: {
      cover: 'monogram',
      nav: 'underline-tabs',
      dishCard: 'bento-tile',
      section: 'hairline-caps',
      footer: 'minimal-mark',
    },
    typePair: 'warm-editorial',
    texture: 'dots',
    density: 'spacious',
    radius: 'xl',
    shadow: 'subtle',
  },
  {
    id: 'greenhouse-botanic',
    label: 'Botanica Organic',
    description: 'Sunlit cream and sage, generous spacing, photography led.',
    audience: 'Organic kitchens, salad and bowl bars, vegan cafes',
    category: 'cafe',
    seedColor: '#4caf50',
    mode: 'light',
    slots: {
      cover: 'bento-collage',
      nav: 'underline-tabs',
      dishCard: 'magazine',
      section: 'hairline-caps',
      footer: 'contact-block',
    },
    typePair: 'modern-sans',
    texture: 'grain',
    density: 'spacious',
    radius: 'lg',
    shadow: 'subtle',
  },
  {
    id: 'coastal-seafood',
    label: 'Coastal Raw Bar',
    description: 'Sea-glass teal on a bright page, with a full-width hero photo.',
    audience: 'Seafood, coastal and Mediterranean kitchens',
    category: 'contemporary',
    seedColor: '#00838f',
    mode: 'light',
    slots: {
      cover: 'hero-photo',
      nav: 'capsule-pills',
      dishCard: 'magazine',
      section: 'hairline-caps',
      footer: 'contact-block',
    },
    typePair: 'warm-editorial',
    texture: 'none',
    density: 'balanced',
    radius: 'lg',
    shadow: 'subtle',
  },
  {
    id: 'midnight-burger',
    label: 'Midnight Burger Club',
    description: 'Obsidian and amber, dense tiles, built for late-night scrolling.',
    audience: 'Smash burgers, fried chicken, late-night counters',
    category: 'street',
    seedColor: '#ff9800',
    mode: 'dark',
    slots: {
      cover: 'hero-photo',
      nav: 'capsule-pills',
      dishCard: 'bento-tile',
      section: 'ribbon',
      footer: 'minimal-mark',
    },
    typePair: 'bold-street',
    texture: 'slate',
    density: 'compact',
    radius: 'lg',
    shadow: 'elevated',
  },
  {
    id: 'tokyo-izakaya',
    label: 'Tokyo Izakaya',
    description: 'Near-black with a single red accent and square photo tiles.',
    audience: 'Ramen bars, izakaya, sushi counters',
    category: 'contemporary',
    seedColor: '#ff5252',
    mode: 'dark',
    slots: {
      cover: 'hero-photo',
      nav: 'capsule-pills',
      dishCard: 'bento-tile',
      section: 'hairline-caps',
      footer: 'minimal-mark',
    },
    typePair: 'modern-sans',
    texture: 'none',
    density: 'compact',
    radius: 'md',
    shadow: 'elevated',
  },
  {
    id: 'rustic-smokehouse',
    label: 'Rustic Smokehouse',
    description: 'Charred timber and flame orange, with large plated photography.',
    audience: 'Barbecue, steakhouses, grill rooms',
    category: 'street',
    seedColor: '#ff7043',
    mode: 'dark',
    slots: {
      cover: 'hero-photo',
      nav: 'capsule-pills',
      dishCard: 'magazine',
      section: 'ribbon',
      footer: 'contact-block',
    },
    typePair: 'bold-street',
    texture: 'slate',
    density: 'balanced',
    radius: 'sm',
    shadow: 'elevated',
  },
  {
    id: 'desi-dhaba',
    label: 'Grand Highway Dhaba',
    description: 'Saffron and chilli red, dense rows, and a side index for long menus.',
    audience: 'Dhabas, highway tandoors, large North Indian menus',
    category: 'street',
    seedColor: '#e65100',
    mode: 'light',
    slots: {
      cover: 'hero-photo',
      // A dhaba menu routinely runs past 150 items; horizontal pills alone cannot navigate that.
      nav: 'sidebar-index',
      dishCard: 'compact-row',
      section: 'ribbon',
      footer: 'contact-block',
    },
    typePair: 'bold-street',
    texture: 'grain',
    density: 'compact',
    radius: 'sm',
    shadow: 'none',
  },
  {
    id: 'boho-taproom',
    label: 'Bohemian Taproom',
    description: 'Industrial slate with amber, tuned for a long drinks list.',
    audience: 'Taprooms, breweries, cocktail bars, pubs',
    category: 'bar',
    seedColor: '#ffa000',
    mode: 'dark',
    slots: {
      cover: 'monogram',
      nav: 'capsule-pills',
      dishCard: 'compact-row',
      section: 'ribbon',
      footer: 'minimal-mark',
    },
    typePair: 'bold-street',
    texture: 'slate',
    density: 'balanced',
    radius: 'md',
    shadow: 'subtle',
  },

  // ------------------------------- Signature (Tier 2) -------------------------------
  // These three render a full-page art-directed composition instead of assembling slots. The
  // `slots` selection below is still a real, coherent fallback for "switch to a composable
  // preset" — not a dummy value.
  {
    id: 'signature-heritage-booklet',
    label: 'Heritage Booklet',
    description: 'An asymmetric chapter-by-chapter artboard with a bold colour panel per category.',
    audience: 'Heritage dining rooms wanting a printed-booklet feel, digitally',
    category: 'signature',
    seedColor: '#b3261e',
    mode: 'light',
    slots: {
      cover: 'heritage-arch',
      nav: 'underline-tabs',
      dishCard: 'magazine',
      section: 'arch-title',
      footer: 'contact-block',
    },
    signatureId: 'heritage-booklet',
    typePair: 'royal-serif',
    texture: 'parchment',
    density: 'spacious',
    radius: 'sm',
    shadow: 'elevated',
  },
  {
    id: 'signature-graphic-booklet',
    label: 'Graphic Booklet',
    description: 'A poster-style cover with a photo collage, then a numbered two-column menu.',
    audience: 'Casual dining wanting a playful, illustrated menu with real photography',
    category: 'signature',
    seedColor: '#e8783c',
    mode: 'light',
    slots: {
      cover: 'bento-collage',
      nav: 'capsule-pills',
      dishCard: 'bento-tile',
      section: 'ribbon',
      footer: 'contact-block',
    },
    signatureId: 'graphic-booklet',
    typePair: 'bold-street',
    texture: 'dots',
    density: 'balanced',
    radius: 'lg',
    shadow: 'subtle',
  },
  {
    id: 'signature-chalkboard-clipboard',
    label: 'Chalkboard Clipboard',
    description: 'Twin chalkboard clipboards: a cover board and a dotted-leader menu board.',
    audience: 'Steakhouses, bistros and grills wanting a rustic, hand-lettered feel',
    category: 'signature',
    seedColor: '#c27038',
    mode: 'dark',
    slots: {
      cover: 'monogram',
      nav: 'capsule-pills',
      dishCard: 'compact-row',
      section: 'hairline-caps',
      footer: 'minimal-mark',
    },
    signatureId: 'chalkboard-clipboard',
    typePair: 'bold-street',
    texture: 'slate',
    density: 'compact',
    radius: 'sm',
    shadow: 'elevated',
  },
];

export const PRESET_IDS = PRESETS.map((preset) => preset.id);

export const DEFAULT_PRESET_ID = 'rajasthani-heritage';

const PRESET_BY_ID = new Map(PRESETS.map((preset) => [preset.id, preset]));

/**
 * Legacy template ids that were reachable in `templates/index.ts` but absent from
 * `data/menuTemplates.ts`, plus the numeric aliases that registry accepted.
 *
 * Kept so a stored `template_id` from any point in the product's history still resolves to a
 * sensible preset rather than silently falling back to the first one. `schema.sql` defaults
 * `template_id` to `royal-maharaja`, which is one of these.
 */
const LEGACY_TEMPLATE_ALIASES: Record<string, string> = {
  'royal-maharaja': 'mughal-luxe',
  'banarasi-gold': 'mughal-luxe',
  'heritage-parchment': 'rajasthani-heritage',
  'emerald-heritage': 'mughal-luxe',
  'south-indian-heritage': 'rajasthani-heritage',
  'indian-street-kitchen': 'desi-dhaba',
  'modern-india': 'rajasthani-heritage',
  'spice-house': 'desi-dhaba',
  'maison-noir': 'tokyo-izakaya',
  'ivory-dining': 'awadhi-dastarkhwan',
  'grand-table': 'mughal-luxe',
  'coffee-house': 'artisan-pastry',
  'paper-cafe': 'artisan-pastry',
  'bombay-street': 'desi-dhaba',
  'minimal-editorial': 'coastal-seafood',
  ember: 'rustic-smokehouse',
  maison: 'coastal-seafood',
  botanica: 'greenhouse-botanic',
  'smash-club': 'midnight-burger',
  'tokyo-table': 'tokyo-izakaya',
  riviera: 'coastal-seafood',
  greenhouse: 'greenhouse-botanic',
  gully: 'desi-dhaba',
  patisserie: 'artisan-pastry',
  'studio-10': 'tokyo-izakaya',
};

export function getPreset(id: string | null | undefined): Preset {
  if (!id) return PRESET_BY_ID.get(DEFAULT_PRESET_ID)!;

  const normalised = String(id).trim().toLowerCase();
  const direct = PRESET_BY_ID.get(normalised);
  if (direct) return direct;

  const aliased = LEGACY_TEMPLATE_ALIASES[normalised];
  if (aliased) return PRESET_BY_ID.get(aliased)!;

  return PRESET_BY_ID.get(DEFAULT_PRESET_ID)!;
}

/** Expand a preset into a full, renderable theme. */
export function themeFromPreset(preset: Preset, overrides: Partial<MenuTheme> = {}): MenuTheme {
  return {
    version: THEME_VERSION,
    presetId: preset.id,
    mode: preset.mode,
    brand: { seedColor: preset.seedColor, logoUrl: null, logoShape: 'circle' },
    slots: { ...preset.slots },
    signatureId: preset.signatureId ?? null,
    typePair: preset.typePair,
    texture: preset.texture,
    density: preset.density,
    radius: preset.radius,
    shadow: preset.shadow,
    cover: { imageUrl: null, focal: CENTRE_FOCAL, overlayStrength: 0.55, showCoverPage: true },
    announcement: null,
    ...overrides,
  };
}

export function themeFromPresetId(id: string | null | undefined, overrides: Partial<MenuTheme> = {}): MenuTheme {
  return themeFromPreset(getPreset(id), overrides);
}

// ------------------------------------ onboarding mapping ------------------------------------

export type RestaurantPositioning = 'fine-dining' | 'casual' | 'contemporary' | 'rustic' | 'minimalist';

/**
 * Cuisine keyword to preset, matched longest-first so "north indian" wins over "indian".
 *
 * This is the deterministic rule table that replaces the switch statement in
 * `design-engine/designGenerator.ts`. No AI: a lookup is predictable, instant, free, testable,
 * and an owner can see why they got what they got.
 */
const CUISINE_RULES: ReadonlyArray<{ match: string[]; presetId: string }> = [
  { match: ['mughlai', 'awadhi', 'lucknowi', 'nawabi', 'kebab'], presetId: 'awadhi-dastarkhwan' },
  { match: ['rajasthani', 'heritage', 'thali', 'marwari', 'gujarati'], presetId: 'rajasthani-heritage' },
  { match: ['dhaba', 'punjabi', 'tandoor', 'highway', 'north indian'], presetId: 'desi-dhaba' },
  { match: ['italian', 'pizza', 'pizzeria', 'pasta', 'trattoria'], presetId: 'craft-trattoria' },
  { match: ['bakery', 'patisserie', 'dessert', 'cake', 'pastry', 'ice cream'], presetId: 'artisan-pastry' },
  { match: ['vegan', 'organic', 'salad', 'bowl', 'healthy', 'juice'], presetId: 'greenhouse-botanic' },
  { match: ['seafood', 'coastal', 'fish', 'mediterranean', 'greek'], presetId: 'coastal-seafood' },
  { match: ['burger', 'fried chicken', 'fast food', 'shake', 'fries'], presetId: 'midnight-burger' },
  { match: ['ramen', 'sushi', 'japanese', 'izakaya', 'asian', 'korean', 'chinese'], presetId: 'tokyo-izakaya' },
  { match: ['barbecue', 'bbq', 'smokehouse', 'steak', 'grill'], presetId: 'rustic-smokehouse' },
  { match: ['brewery', 'taproom', 'pub', 'bar', 'cocktail', 'beer'], presetId: 'boho-taproom' },
  { match: ['cafe', 'coffee', 'bistro', 'brunch'], presetId: 'artisan-pastry' },
  { match: ['indian', 'biryani', 'curry'], presetId: 'rajasthani-heritage' },
];

/** Positioning nudges only the slots that positioning genuinely implies. */
const POSITIONING_OVERRIDES: Partial<Record<RestaurantPositioning, Partial<SlotSelection>>> = {
  'fine-dining': { dishCard: 'michelin-leader', section: 'hairline-caps' },
  minimalist: { cover: 'monogram', dishCard: 'michelin-leader', section: 'hairline-caps' },
  casual: { dishCard: 'magazine', nav: 'capsule-pills' },
};

/**
 * Pick a preset from the onboarding answers.
 *
 * Runs at the end of import so a brand-new client sees a finished-looking menu on first view
 * rather than a default they have to fix — which is the moment they decide whether this product
 * is worth paying for.
 */
export function presetFromProfile(cuisine?: string, positioning?: RestaurantPositioning): Preset {
  const haystack = String(cuisine ?? '').toLowerCase();

  let matched: Preset | undefined;
  let bestLength = 0;

  for (const rule of CUISINE_RULES) {
    for (const keyword of rule.match) {
      // Longest match wins, so a more specific cuisine beats a generic one regardless of order.
      if (haystack.includes(keyword) && keyword.length > bestLength) {
        bestLength = keyword.length;
        matched = PRESET_BY_ID.get(rule.presetId);
      }
    }
  }

  const base = matched ?? PRESET_BY_ID.get(DEFAULT_PRESET_ID)!;
  const overrides = positioning ? POSITIONING_OVERRIDES[positioning] : undefined;

  return overrides ? { ...base, slots: { ...base.slots, ...overrides } } : base;
}
