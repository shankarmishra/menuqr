/**
 * MENUQR Design System — Background Textures
 *
 * Procedural SVG data URIs rather than bitmaps. A tileable SVG is a few hundred bytes, scales to
 * any density without blurring, and — because the ink colour is injected at resolve time — it
 * picks up the brand hue instead of fighting it.
 *
 * This supersedes the two partial, unrelated texture sets currently in the codebase:
 * `components/menu-builder/templates/assets/textures.ts` (Tailwind class strings, coupled to the
 * old template records) and `TEXTURE_PATTERNS` in `design-engine/DynamicDesignEngine.tsx`
 * (hardcoded gold, so it only ever suited one palette).
 */

import type { TextureId } from './theme.types.ts';
import { parseHex } from './color.ts';

/** Minimal, deterministic encoding for an SVG data URI. */
function encodeSvg(svg: string): string {
  const compact = svg.replace(/\s+/g, ' ').trim();
  const encoded = compact
    .replace(/%/g, '%25')
    .replace(/#/g, '%23')
    .replace(/"/g, "'")
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E')
    .replace(/&/g, '%26');
  return `url("data:image/svg+xml,${encoded}")`;
}

/** `rgba()` string usable inside an SVG fill, since data URIs cannot read CSS variables. */
function ink(hex: string, opacity: number): string {
  const rgb = parseHex(hex) ?? { r: 255, g: 255, b: 255 };
  return `rgba(${Math.round(rgb.r)},${Math.round(rgb.g)},${Math.round(rgb.b)},${opacity})`;
}

export type Texture = {
  backgroundImage: string;
  backgroundSize: string;
  /** How much of the page the texture should cover; parchment reads best edge to edge. */
  blendMode: 'normal' | 'overlay' | 'soft-light';
};

const NONE: Texture = { backgroundImage: 'none', backgroundSize: 'auto', blendMode: 'normal' };

/**
 * Build a texture tile tinted with `inkHex` (normally the palette's `borderStrong`).
 *
 * Opacities are deliberately low. A texture should be felt rather than seen: once it is
 * noticeable it competes with the food photography, which is the thing that actually sells.
 */
export function buildTexture(id: TextureId, inkHex: string): Texture {
  switch (id) {
    case 'grain':
      // Offset dots at two scales read as paper tooth rather than a visible pattern.
      return {
        backgroundImage: encodeSvg(`
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <circle cx="3" cy="3" r="0.6" fill="${ink(inkHex, 0.28)}"/>
            <circle cx="15" cy="9" r="0.5" fill="${ink(inkHex, 0.2)}"/>
            <circle cx="9" cy="18" r="0.55" fill="${ink(inkHex, 0.24)}"/>
            <circle cx="21" cy="21" r="0.45" fill="${ink(inkHex, 0.18)}"/>
          </svg>
        `),
        backgroundSize: '24px 24px',
        blendMode: 'soft-light',
      };

    case 'parchment':
      // Long horizontal fibres, as in laid paper.
      return {
        backgroundImage: encodeSvg(`
          <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
            <path d="M0 14h60M0 31h60M0 48h60" stroke="${ink(inkHex, 0.1)}" stroke-width="0.5"/>
            <path d="M0 22h60M0 39h60" stroke="${ink(inkHex, 0.06)}" stroke-width="0.5"/>
            <circle cx="11" cy="7" r="0.7" fill="${ink(inkHex, 0.14)}"/>
            <circle cx="43" cy="27" r="0.6" fill="${ink(inkHex, 0.12)}"/>
            <circle cx="27" cy="52" r="0.65" fill="${ink(inkHex, 0.13)}"/>
          </svg>
        `),
        backgroundSize: '60px 60px',
        blendMode: 'soft-light',
      };

    case 'slate':
      // Fine diagonal hatch: industrial, suits taprooms and smokehouses.
      return {
        backgroundImage: encodeSvg(`
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path d="M0 16L16 0" stroke="${ink(inkHex, 0.16)}" stroke-width="0.6"/>
            <path d="M-4 12L12 -4M4 20L20 4" stroke="${ink(inkHex, 0.09)}" stroke-width="0.6"/>
          </svg>
        `),
        backgroundSize: '16px 16px',
        blendMode: 'soft-light',
      };

    case 'silk':
      // Concentric diamonds, echoing jaali and brocade motifs for heritage presets.
      return {
        backgroundImage: encodeSvg(`
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
            <path d="M24 2L46 24L24 46L2 24Z" fill="none" stroke="${ink(inkHex, 0.14)}" stroke-width="0.7"/>
            <path d="M24 12L36 24L24 36L12 24Z" fill="none" stroke="${ink(inkHex, 0.1)}" stroke-width="0.6"/>
            <circle cx="24" cy="24" r="1.4" fill="${ink(inkHex, 0.12)}"/>
          </svg>
        `),
        backgroundSize: '48px 48px',
        blendMode: 'soft-light',
      };

    case 'dots':
      // Even grid: clean, modern, suits bento and editorial layouts.
      return {
        backgroundImage: encodeSvg(`
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
            <circle cx="9" cy="9" r="1" fill="${ink(inkHex, 0.18)}"/>
          </svg>
        `),
        backgroundSize: '18px 18px',
        blendMode: 'soft-light',
      };

    case 'none':
    default:
      return NONE;
  }
}
