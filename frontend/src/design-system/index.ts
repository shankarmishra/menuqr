/**
 * MENUQR Design System — public surface.
 *
 * Everything a renderer or the Design Studio needs. Import from here rather than from the
 * individual modules, so the internal file layout can change without touching call sites.
 */

export {
  adjust,
  alpha,
  contrastRatio,
  ensureContrast,
  ensureContrastAll,
  hexToOklch,
  isDark,
  isValidHex,
  mix,
  oklchToHex,
  oklchToRgb,
  parseHex,
  readableOn,
  relativeLuminance,
  rgbToOklch,
  toHex,
  type Oklch,
  type Rgb,
} from './color.ts';

export {
  CURATED_SEEDS,
  DEFAULT_SEED,
  derivePalette,
  type Palette,
  type PaletteMode,
} from './palette.ts';

export {
  ASPECT,
  buildSpaceScale,
  buildTypeScale,
  DENSITY_MULTIPLIER,
  fluidSize,
  LEADING,
  MEASURE,
  MIN_FONT_SIZE_PX,
  MIN_TAP_TARGET_PX,
  RADIUS_SETS,
  SHADOW_SETS,
  space,
  SPACE_STEPS,
  TRACKING,
  TYPE_STEPS,
  typeStepSizes,
  type Density,
  type RadiusToken,
  type ShadowToken,
  type TypeStep,
} from './scales.ts';

export {
  allFontFamilies,
  DEFAULT_FONT_PAIRING,
  FONT_PAIRING_IDS,
  FONT_PAIRINGS,
  fontAssetsFor,
  fontPreloadsFor,
  getFontPairing,
  type FontAsset,
  type FontFace,
  type FontPairing,
  type FontPairingId,
  type FontSubset,
} from './fonts.ts';

export { buildTexture, type Texture } from './textures.ts';

export {
  CENTRE_FOCAL,
  COVER_SLOTS,
  DISH_CARD_SLOTS,
  FOOTER_SLOTS,
  LOGO_SHAPES,
  NAV_SLOTS,
  SECTION_SLOTS,
  TEXTURE_IDS,
  THEME_VERSION,
  type CoverSlot,
  type DishCardSlot,
  type FocalPoint,
  type FooterSlot,
  type LogoShape,
  type MenuTheme,
  type NavSlot,
  type SectionSlot,
  type SlotSelection,
  type TextureId,
  type ThemeTokens,
} from './theme.types.ts';

export { resolveTheme, TOKEN_PREFIX, tokensToCssText, tokensToStyle } from './resolveTheme.ts';

export {
  coerceTheme,
  FALLBACK_THEME,
  MAX_ANNOUNCEMENT_LENGTH,
  MAX_PRESET_ID_LENGTH,
  MAX_URL_LENGTH,
  sanitizeImageUrl,
  validateTheme,
  type ThemeValidationResult,
} from './validateTheme.ts';
