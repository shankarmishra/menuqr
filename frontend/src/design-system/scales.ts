/**
 * MENUQR Design System — Type, Space, Radius and Shadow Scales
 *
 * The scales are the reason generated designs look designed. Every size a menu can render comes
 * from here, so no component can invent `text-[7.5px]` or a one-off `py-0.2` again — which is
 * exactly what the hand-written templates in `components/menu-builder/templates/` did.
 *
 * Two deliberate decisions:
 *
 *  1. A hard 12px floor. Below roughly 12px, dish descriptions stop being readable on a phone
 *     held at arm's length over a table, which is the only context that matters for a QR menu.
 *
 *  2. A two-ratio scale: 1.15 below the body size, 1.25 above it. Small text needs fine
 *     gradation to stay distinguishable without becoming illegible; display text needs coarse
 *     jumps to read as hierarchy. A single ratio cannot do both.
 */

// ------------------------------------- type scale -------------------------------------

export type TypeStep = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

export const TYPE_STEPS: readonly TypeStep[] = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'];

/** Offsets from the body size: negative uses the fine ratio, positive the display ratio. */
const STEP_OFFSETS: Record<TypeStep, number> = {
  xs: -2,
  sm: -1,
  base: 0,
  lg: 1,
  xl: 2,
  '2xl': 3,
  '3xl': 4,
  '4xl': 5,
};

export const MIN_FONT_SIZE_PX = 12;

const FINE_RATIO = 1.15;
const DISPLAY_RATIO = 1.25;

/** Viewport endpoints the fluid interpolation is anchored to: small phone to laptop. */
export const FLUID_MIN_VIEWPORT = 375;
export const FLUID_MAX_VIEWPORT = 1280;

const MOBILE_BASE_PX = 15.5;
const DESKTOP_BASE_PX = 16.5;

function sizeAt(basePx: number, offset: number): number {
  const ratio = offset < 0 ? FINE_RATIO : DISPLAY_RATIO;
  const raw = basePx * Math.pow(ratio, offset);
  return Math.max(MIN_FONT_SIZE_PX, Math.round(raw * 100) / 100);
}

const round = (value: number, places = 3) => {
  const factor = Math.pow(10, places);
  return Math.round(value * factor) / factor;
};

/**
 * A `clamp()` that grows linearly with the viewport between 375px and 1280px, so one scale
 * serves every device without breakpoint-specific overrides.
 */
export function fluidSize(minPx: number, maxPx: number): string {
  if (maxPx <= minPx) return `${round(minPx, 2)}px`;

  const slopeVw = ((maxPx - minPx) / (FLUID_MAX_VIEWPORT - FLUID_MIN_VIEWPORT)) * 100;
  const interceptPx = minPx - (slopeVw * FLUID_MIN_VIEWPORT) / 100;

  return `clamp(${round(minPx, 2)}px, ${round(interceptPx, 2)}px + ${round(slopeVw, 3)}vw, ${round(maxPx, 2)}px)`;
}

export function typeStepSizes(step: TypeStep): { min: number; max: number } {
  const offset = STEP_OFFSETS[step];
  return { min: sizeAt(MOBILE_BASE_PX, offset), max: sizeAt(DESKTOP_BASE_PX, offset) };
}

/** The full fluid type scale as CSS values, keyed by step name. */
export function buildTypeScale(): Record<TypeStep, string> {
  const scale = {} as Record<TypeStep, string>;
  for (const step of TYPE_STEPS) {
    const { min, max } = typeStepSizes(step);
    scale[step] = fluidSize(min, max);
  }
  return scale;
}

// ------------------------------------ line heights ------------------------------------

export type LeadingStep = 'tight' | 'snug' | 'normal' | 'relaxed';

/** Unitless so they inherit correctly when font size is fluid. */
export const LEADING: Record<LeadingStep, number> = {
  tight: 1.12, // display / cover titles
  snug: 1.28, // section and category headings
  normal: 1.5, // dish names, body
  relaxed: 1.68, // dish descriptions
};

// ----------------------------------- letter spacing -----------------------------------

export type TrackingStep = 'tighter' | 'tight' | 'normal' | 'wide' | 'widest';

export const TRACKING: Record<TrackingStep, string> = {
  tighter: '-0.02em', // large display type needs negative tracking to avoid looking loose
  tight: '-0.01em',
  normal: '0em',
  wide: '0.04em',
  widest: '0.14em', // small all-caps labels: "STARTERS", "PURE VEG"
};

// -------------------------------------- spacing --------------------------------------

export type Density = 'compact' | 'balanced' | 'spacious';

/**
 * Density scales the rhythm, not the type. A dhaba with 180 items needs compact; a tasting menu
 * with 12 needs spacious. Both must stay on the same 4px grid, so the multiplier is applied to
 * the step and then re-snapped.
 */
export const DENSITY_MULTIPLIER: Record<Density, number> = {
  compact: 0.78,
  balanced: 1,
  spacious: 1.28,
};

export const SPACE_BASE_PX = 4;

export type SpaceStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20;

export const SPACE_STEPS: readonly SpaceStep[] = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20];

/** Step 4 means 4 * 4px = 16px at balanced density. Snapped to half-pixels to stay crisp. */
export function space(step: SpaceStep, density: Density = 'balanced'): string {
  if (step === 0) return '0px';
  const raw = step * SPACE_BASE_PX * DENSITY_MULTIPLIER[density];
  return `${Math.max(SPACE_BASE_PX / 2, Math.round(raw * 2) / 2)}px`;
}

export function buildSpaceScale(density: Density = 'balanced'): Record<string, string> {
  const scale: Record<string, string> = {};
  for (const step of SPACE_STEPS) {
    scale[String(step)] = space(step, density);
  }
  return scale;
}

// --------------------------------------- radii ---------------------------------------

export type RadiusToken = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * A preset picks one radius personality and every surface derives from it, so cards, chips,
 * images and buttons agree. Mixed radii are the most common tell of an amateur layout.
 */
export const RADIUS_SETS: Record<RadiusToken, { sm: string; md: string; lg: string; pill: string }> = {
  none: { sm: '0px', md: '0px', lg: '0px', pill: '0px' },
  sm: { sm: '2px', md: '4px', lg: '6px', pill: '999px' },
  md: { sm: '4px', md: '8px', lg: '12px', pill: '999px' },
  lg: { sm: '6px', md: '12px', lg: '18px', pill: '999px' },
  xl: { sm: '8px', md: '16px', lg: '26px', pill: '999px' },
  full: { sm: '12px', md: '24px', lg: '36px', pill: '999px' },
};

// -------------------------------------- shadows --------------------------------------

export type ShadowToken = 'none' | 'subtle' | 'elevated' | 'glass';

/**
 * Shadow colour is intentionally neutral-transparent rather than brand-tinted: a coloured
 * shadow over a photo reads as a printing error.
 */
export const SHADOW_SETS: Record<ShadowToken, { sm: string; md: string; lg: string }> = {
  none: { sm: 'none', md: 'none', lg: 'none' },
  subtle: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 2px 6px rgba(0, 0, 0, 0.08)',
    lg: '0 6px 16px rgba(0, 0, 0, 0.10)',
  },
  elevated: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.10)',
    md: '0 4px 12px rgba(0, 0, 0, 0.14)',
    lg: '0 12px 32px rgba(0, 0, 0, 0.18)',
  },
  glass: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.10)',
    md: '0 6px 20px rgba(0, 0, 0, 0.26), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
    lg: '0 18px 48px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.14)',
  },
};

// ------------------------------------- dimensions -------------------------------------

/**
 * Upper bound on line length. Past roughly 75 characters the eye loses the line on return
 * sweep, which is why wide-screen menus with full-width descriptions feel unreadable.
 */
export const MEASURE = '68ch';

/** Minimum interactive target, per WCAG 2.5.5 / platform guidance. */
export const MIN_TAP_TARGET_PX = 44;

/** Locked aspect ratios so photography never shifts the grid between presets. */
export const ASPECT = {
  hero: '16 / 9',
  card: '4 / 3',
  square: '1 / 1',
  portrait: '3 / 4',
  cover: '9 / 16',
} as const;
