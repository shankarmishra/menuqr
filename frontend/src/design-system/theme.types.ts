/**
 * MENUQR Design System — Theme Contract
 *
 * `MenuTheme` is *intent*: the fifteen-odd choices an owner actually makes. It is the only thing
 * persisted (`appearance_settings.theme_published`).
 *
 * `ThemeTokens` is *computed output*: roughly fifty CSS custom properties plus the slot
 * selections a renderer needs. It is never stored.
 *
 * That split is the property the current system lacks. Because only intent is saved, improving
 * the colour maths, the type scale or a slot component makes every existing client's menu better
 * on the next deploy, with no data migration — whereas today each of the twelve templates has
 * its palette and spacing frozen into a hand-written `.tsx` file.
 */

import type { Density, RadiusToken, ShadowToken } from './scales.ts';
import type { FontPairingId } from './fonts.ts';
import type { Palette, PaletteMode } from './palette.ts';

export const THEME_VERSION = 2 as const;

// ---------------------------------------- slots ----------------------------------------

/** Full-bleed brand moment at the top of the menu, or the first page of a two-page booklet. */
export type CoverSlot = 'hero-photo' | 'monogram' | 'heritage-arch' | 'bento-collage';

/** How a diner moves between categories. */
export type NavSlot = 'capsule-pills' | 'underline-tabs' | 'sidebar-index';

/** How a single dish is presented. The highest-impact choice an owner makes. */
export type DishCardSlot = 'magazine' | 'michelin-leader' | 'compact-row' | 'bento-tile';

/** Category heading treatment. */
export type SectionSlot = 'ribbon' | 'hairline-caps' | 'arch-title';

/** Closing block: contact details, or a restrained mark. */
export type FooterSlot = 'contact-block' | 'minimal-mark';

export type TextureId = 'none' | 'grain' | 'parchment' | 'slate' | 'silk' | 'dots';

export type LogoShape = 'circle' | 'square' | 'wordmark';

/**
 * A Signature composition owns its entire layout — cover through footer — rather than assembling
 * slots. It still reads nothing but `var(--mq-*)`, so it responds to brand colour, logo and
 * photos exactly like a composable preset; what differs is that one hand-art-directed component
 * renders the whole page instead of five independently-chosen pieces.
 */
export type SignatureCompositionId = 'heritage-booklet' | 'graphic-booklet' | 'chalkboard-clipboard';

export const SIGNATURE_COMPOSITION_IDS: readonly SignatureCompositionId[] = [
  'heritage-booklet',
  'graphic-booklet',
  'chalkboard-clipboard',
];

export const COVER_SLOTS: readonly CoverSlot[] = ['hero-photo', 'monogram', 'heritage-arch', 'bento-collage'];
export const NAV_SLOTS: readonly NavSlot[] = ['capsule-pills', 'underline-tabs', 'sidebar-index'];
export const DISH_CARD_SLOTS: readonly DishCardSlot[] = ['magazine', 'michelin-leader', 'compact-row', 'bento-tile'];
export const SECTION_SLOTS: readonly SectionSlot[] = ['ribbon', 'hairline-caps', 'arch-title'];
export const FOOTER_SLOTS: readonly FooterSlot[] = ['contact-block', 'minimal-mark'];
export const TEXTURE_IDS: readonly TextureId[] = ['none', 'grain', 'parchment', 'slate', 'silk', 'dots'];
export const LOGO_SHAPES: readonly LogoShape[] = ['circle', 'square', 'wordmark'];

export type SlotSelection = {
  cover: CoverSlot;
  nav: NavSlot;
  dishCard: DishCardSlot;
  section: SectionSlot;
  footer: FooterSlot;
};

/**
 * A normalised focal point in 0-1 coordinates.
 *
 * The owner drags a dot onto the part of the photo that matters, and every crop anchors there
 * via `object-position`. Deterministic, free, snapshot-testable, and more accurate than an
 * automatic crop — the owner knows which end of the plate is the hero.
 */
export type FocalPoint = { x: number; y: number };

export const CENTRE_FOCAL: FocalPoint = { x: 0.5, y: 0.5 };

// -------------------------------------- menu theme --------------------------------------

export type MenuTheme = {
  version: typeof THEME_VERSION;

  /** Which preset this started from. Used for analytics and for "reset to preset". */
  presetId: string;

  mode: PaletteMode;

  brand: {
    /** The single colour the whole palette is derived from. */
    seedColor: string;
    logoUrl: string | null;
    logoShape: LogoShape;
  };

  slots: SlotSelection;

  /**
   * When set, the renderer mounts this Signature composition instead of assembling `slots`.
   * `slots` is still populated and kept in sync with the preset's underlying skeleton, so
   * "switch to a composable preset" has a sane layout to switch to.
   */
  signatureId: SignatureCompositionId | null;

  typePair: FontPairingId;
  texture: TextureId;
  density: Density;
  radius: RadiusToken;
  shadow: ShadowToken;

  cover: {
    imageUrl: string | null;
    focal: FocalPoint;
    /** 0-1 scrim strength over the cover photo, so overlaid type stays legible on any image. */
    overlayStrength: number;
    /** False renders a single continuous scroll instead of a cover-then-menu booklet. */
    showCoverPage: boolean;
  };

  /** Optional ticker, e.g. "Happy Hours 4-7 PM". Null hides the strip entirely. */
  announcement: string | null;
};

// ------------------------------------- theme tokens -------------------------------------

export type ResolvedTypography = {
  displayStack: string;
  bodyStack: string;
  displayTracking: string;
  displayScaleAdjust: number;
  supportsDevanagari: boolean;
};

export type ThemeTokens = {
  presetId: string;
  mode: PaletteMode;
  palette: Palette;
  slots: SlotSelection;
  typography: ResolvedTypography;
  density: Density;
  cover: MenuTheme['cover'];
  announcement: string | null;
  brand: MenuTheme['brand'];

  /**
   * The `--mq-*` custom properties, applied to one scoped wrapper element.
   *
   * Slot components read these and nothing else. Because a theme change only rewrites custom
   * properties, the preview in the Design Studio updates without remounting the React tree.
   */
  cssVariables: Record<string, string>;
};
