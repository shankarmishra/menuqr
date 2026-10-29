/**
 * MENUQR Design System — Theme Resolver
 *
 * `MenuTheme` (intent) in, `ThemeTokens` (CSS custom properties) out. Pure and deterministic.
 *
 * This is the only place that turns choices into values. Slot components read `var(--mq-*)` and
 * never a literal, so there is exactly one way for a colour or a size to reach the screen.
 */

import { alpha } from './color.ts';
import { derivePalette, type Palette } from './palette.ts';
import { getFontPairing } from './fonts.ts';
import { buildTexture } from './textures.ts';
import {
  ASPECT,
  buildSpaceScale,
  buildTypeScale,
  LEADING,
  MEASURE,
  MIN_TAP_TARGET_PX,
  RADIUS_SETS,
  SHADOW_SETS,
  TRACKING,
  TYPE_STEPS,
  typeStepSizes,
  fluidSize,
} from './scales.ts';
import type { MenuTheme, ThemeTokens } from './theme.types.ts';

/** Prefix for every custom property, so menu tokens cannot collide with app or marketing CSS. */
export const TOKEN_PREFIX = '--mq';

const round = (value: number, places = 4) => {
  const factor = Math.pow(10, places);
  return Math.round(value * factor) / factor;
};

const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);

function paletteVariables(palette: Palette): Record<string, string> {
  const variables: Record<string, string> = {};
  for (const [token, value] of Object.entries(palette)) {
    // camelCase token -> kebab-case custom property: surfaceAlt becomes --mq-color-surface-alt.
    const name = token.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
    variables[`${TOKEN_PREFIX}-color-${name}`] = value;
  }
  return variables;
}

export function resolveTheme(theme: MenuTheme): ThemeTokens {
  const palette = derivePalette(theme.brand.seedColor, theme.mode);
  const pairing = getFontPairing(theme.typePair);
  const radii = RADIUS_SETS[theme.radius] ?? RADIUS_SETS.md;
  const shadows = SHADOW_SETS[theme.shadow] ?? SHADOW_SETS.subtle;
  const texture = buildTexture(theme.texture, palette.borderStrong);
  const spacing = buildSpaceScale(theme.density);
  const typeScale = buildTypeScale();

  const cssVariables: Record<string, string> = {
    ...paletteVariables(palette),

    // Typography
    [`${TOKEN_PREFIX}-font-display`]: pairing.display.stack,
    [`${TOKEN_PREFIX}-font-body`]: pairing.body.stack,
    [`${TOKEN_PREFIX}-tracking-display`]: TRACKING[pairing.displayTracking],
    [`${TOKEN_PREFIX}-tracking-caps`]: TRACKING.widest,
    [`${TOKEN_PREFIX}-tracking-normal`]: TRACKING.normal,
  };

  // Body type scale, then display steps adjusted for the pairing's optical size. Without the
  // adjustment, an all-caps engraved face and a condensed poster face at the same nominal size
  // look nothing like the same level of hierarchy.
  for (const step of TYPE_STEPS) {
    cssVariables[`${TOKEN_PREFIX}-text-${step}`] = typeScale[step];

    const { min, max } = typeStepSizes(step);
    cssVariables[`${TOKEN_PREFIX}-display-${step}`] = fluidSize(
      round(min * pairing.displayScaleAdjust, 2),
      round(max * pairing.displayScaleAdjust, 2)
    );
  }

  for (const [name, value] of Object.entries(LEADING)) {
    cssVariables[`${TOKEN_PREFIX}-leading-${name}`] = String(value);
  }

  for (const [step, value] of Object.entries(spacing)) {
    cssVariables[`${TOKEN_PREFIX}-space-${step}`] = value;
  }

  cssVariables[`${TOKEN_PREFIX}-radius-sm`] = radii.sm;
  cssVariables[`${TOKEN_PREFIX}-radius-md`] = radii.md;
  cssVariables[`${TOKEN_PREFIX}-radius-lg`] = radii.lg;
  cssVariables[`${TOKEN_PREFIX}-radius-pill`] = radii.pill;

  cssVariables[`${TOKEN_PREFIX}-shadow-sm`] = shadows.sm;
  cssVariables[`${TOKEN_PREFIX}-shadow-md`] = shadows.md;
  cssVariables[`${TOKEN_PREFIX}-shadow-lg`] = shadows.lg;

  cssVariables[`${TOKEN_PREFIX}-texture-image`] = texture.backgroundImage;
  cssVariables[`${TOKEN_PREFIX}-texture-size`] = texture.backgroundSize;
  cssVariables[`${TOKEN_PREFIX}-texture-blend`] = texture.blendMode;

  cssVariables[`${TOKEN_PREFIX}-measure`] = MEASURE;
  cssVariables[`${TOKEN_PREFIX}-tap-target`] = `${MIN_TAP_TARGET_PX}px`;

  for (const [name, value] of Object.entries(ASPECT)) {
    cssVariables[`${TOKEN_PREFIX}-aspect-${name}`] = value;
  }

  // Cover photo: focal point drives object-position, and the scrim is a two-stop gradient so
  // type at the bottom stays legible over a bright image without flattening the whole photo.
  const focalX = round(clamp01(theme.cover.focal.x) * 100, 2);
  const focalY = round(clamp01(theme.cover.focal.y) * 100, 2);
  const overlay = clamp01(theme.cover.overlayStrength);

  cssVariables[`${TOKEN_PREFIX}-cover-focal-x`] = `${focalX}%`;
  cssVariables[`${TOKEN_PREFIX}-cover-focal-y`] = `${focalY}%`;
  cssVariables[`${TOKEN_PREFIX}-cover-position`] = `${focalX}% ${focalY}%`;
  cssVariables[`${TOKEN_PREFIX}-cover-scrim`] = [
    'linear-gradient(to top,',
    `${alpha('#05070A', round(overlay, 3))} 0%,`,
    `${alpha('#05070A', round(overlay * 0.55, 3))} 38%,`,
    `${alpha('#05070A', round(overlay * 0.12, 3))} 100%)`,
  ].join(' ');

  // Ink for type sitting on top of the scrim. The scrim is anchored to near-black in both
  // modes, so this is light regardless of the palette mode.
  cssVariables[`${TOKEN_PREFIX}-color-on-cover`] = '#ffffff';
  cssVariables[`${TOKEN_PREFIX}-color-on-cover-muted`] = 'rgba(255, 255, 255, 0.78)';

  return {
    presetId: theme.presetId,
    mode: theme.mode,
    palette,
    slots: theme.slots,
    density: theme.density,
    cover: theme.cover,
    announcement: theme.announcement,
    brand: theme.brand,
    typography: {
      displayStack: pairing.display.stack,
      bodyStack: pairing.body.stack,
      displayTracking: TRACKING[pairing.displayTracking],
      displayScaleAdjust: pairing.displayScaleAdjust,
      supportsDevanagari: pairing.supportsDevanagari,
    },
    cssVariables,
  };
}

/** Convert resolved tokens into a React `style` object for the scoped wrapper element. */
export function tokensToStyle(tokens: ThemeTokens): Record<string, string> {
  return { ...tokens.cssVariables };
}

/** Serialise tokens as a CSS rule, for server rendering and for Playwright fixtures. */
export function tokensToCssText(tokens: ThemeTokens, selector = ':root'): string {
  const body = Object.entries(tokens.cssVariables)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');
  return `${selector} {\n${body}\n}`;
}
