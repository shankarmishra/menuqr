/**
 * Pure presentation logic for restaurant logos and brand marks.
 *
 * Implements the decisions in Blueprint section 7.5:
 * 1. Contrast contract: chooses between plain, plate, and mono presentations to ensure >= 3:1 contrast.
 * 2. Geometric plate scaling: ensures a rectangular logo's bounding box fits inside a circular plate
 *    without clipping corners: scale = d / sqrt(w^2 + h^2). For round badges, fits edge-to-edge.
 * 3. Fallback name lockup helpers for when no logo is provided.
 */

import { contrastRatio, parseCssColor, relativeLuminance } from '../../lib/logo/color.ts';
import type { LogoAnalysis } from '../../lib/logo/types.ts';

export type PresentationMode = 'plain' | 'plate' | 'mono';

export type LogoSize = number | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export const LOGO_SIZE_MAP: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number> = {
  xs: 32,
  sm: 40,
  md: 56,
  lg: 72,
  xl: 96,
};

export function resolveLogoSize(size?: LogoSize): number {
  if (typeof size === 'number') return size;
  if (typeof size === 'string' && size in LOGO_SIZE_MAP) {
    return LOGO_SIZE_MAP[size as keyof typeof LOGO_SIZE_MAP];
  }
  return 72;
}

export interface LogoPresentationOptions {
  /** Surface/background colour behind the logo mark (hex, rgb, hsl, or CSS name). Default #ffffff. */
  surfaceColor?: string;
  /** Allowed presentation modes in order of preference. Defaults to ['plain', 'plate', 'mono']. */
  allowedModes?: PresentationMode[];
  /** Minimum contrast ratio required for plain display. Defaults to 3.0 (WCAG UI / large text). */
  minContrast?: number;
}

export interface PresentationDecision {
  mode: PresentationMode;
  variant: 'full' | 'mono-light' | 'mono-dark';
  /** Recommended plate background colour if mode === 'plate'. */
  plateBg?: string;
  /** Calculated contrast ratio against the surface. */
  contrast: number;
}

/**
 * Calculates the effective contrast of a logo against a given surface colour.
 * Uses luma profiles when analysis is available, or luminance estimate.
 */
export function calculateLumaContrast(
  surfaceColor: string,
  analysis?: LogoAnalysis | null
): { contrast: number; surfaceLuma: number } {
  const parsedSurface = parseCssColor(surfaceColor) ?? { r: 255, g: 255, b: 255, a: 1 };
  const surfaceLuma = relativeLuminance(parsedSurface.r, parsedSurface.g, parsedSurface.b);

  if (!analysis) {
    // Default assumption: dark logo on unknown surface
    const defaultContrast = contrastRatio(0.05, surfaceLuma);
    return { contrast: defaultContrast, surfaceLuma };
  }

  // Use area profile bins if available
  if (analysis.luma?.area && analysis.luma.area.length > 0) {
    let totalWeight = 0;
    let weightedContrast = 0;
    for (const bin of analysis.luma.area) {
      const c = contrastRatio(bin.y, surfaceLuma);
      weightedContrast += c * bin.w;
      totalWeight += bin.w;
    }
    const contrast = totalWeight > 0 ? weightedContrast / totalWeight : contrastRatio(analysis.luminance, surfaceLuma);
    return { contrast, surfaceLuma };
  }

  // Fallback to mean luminance
  const contrast = contrastRatio(analysis.luminance, surfaceLuma);
  return { contrast, surfaceLuma };
}

/**
 * Chooses the best presentation mode (plain, plate, mono) to guarantee legibility.
 * Picks the first allowed mode reaching at least minContrast (default 3:1).
 */
export function choosePresentation(
  analysis?: LogoAnalysis | null,
  options: LogoPresentationOptions = {}
): PresentationDecision {
  const surfaceColor = options.surfaceColor ?? '#ffffff';
  const allowedModes = options.allowedModes ?? ['plain', 'plate', 'mono'];
  const minContrast = options.minContrast ?? 3.0;

  const { contrast: plainContrast, surfaceLuma } = calculateLumaContrast(surfaceColor, analysis);

  // 1. Try 'plain' presentation
  if (allowedModes.includes('plain') && plainContrast >= minContrast) {
    return {
      mode: 'plain',
      variant: 'full',
      contrast: plainContrast,
    };
  }

  // 2. Try 'mono' presentation if allowed and suitable
  if (allowedModes.includes('mono') && (!analysis || analysis.monoSuitable !== false)) {
    // On dark surfaces, mono-light (#ffffff, luma = 1)
    // On light surfaces, mono-dark (#111111, luma ~ 0.005)
    if (surfaceLuma < 0.3) {
      const monoLightContrast = contrastRatio(1.0, surfaceLuma);
      if (monoLightContrast >= minContrast) {
        return {
          mode: 'mono',
          variant: 'mono-light',
          contrast: monoLightContrast,
        };
      }
    } else {
      const monoDarkContrast = contrastRatio(0.005, surfaceLuma);
      if (monoDarkContrast >= minContrast) {
        return {
          mode: 'mono',
          variant: 'mono-dark',
          contrast: monoDarkContrast,
        };
      }
    }
  }

  // 3. Fallback to 'plate' presentation (or plain if plate is not allowed)
  if (allowedModes.includes('plate')) {
    const isLogoLight = analysis ? analysis.tone === 'light' || analysis.luminance >= 0.5 : false;
    const plateBg = isLogoLight ? '#121212' : '#ffffff';
    const plateLuma = isLogoLight ? 0.006 : 1.0;
    const logoLuma = analysis ? analysis.luminance : 0.05;
    const plateContrast = contrastRatio(logoLuma, plateLuma);

    return {
      mode: 'plate',
      variant: 'full',
      plateBg,
      contrast: plateContrast,
    };
  }

  // Fallback to plain even if contrast < minContrast
  return {
    mode: 'plain',
    variant: 'full',
    contrast: plainContrast,
  };
}

/**
 * Geometric plate scale calculation:
 * For a rectangular logo to fit inside a circle of diameter d without clipping its corners,
 * the rectangle diagonal must be <= diameter.
 * Thus: scale = d / sqrt(w^2 + h^2).
 *
 * For round badges (which are already circular emblems), they fit edge-to-edge:
 * scale = d / max(w, h).
 */
export function calculatePlateScale(width: number, height: number, isRoundBadge = false): number {
  if (width <= 0 || height <= 0) return 1;
  if (isRoundBadge) {
    return 1 / Math.max(width, height);
  }
  return 1 / Math.sqrt(width * width + height * height);
}

/**
 * Calculates dimensions to fit a logo of size width x height inside a circular plate of diameter d.
 */
export function fitInCircle(
  width: number,
  height: number,
  diameter: number,
  isRoundBadge = false
): { width: number; height: number; scale: number } {
  if (width <= 0 || height <= 0 || diameter <= 0) {
    return { width: diameter, height: diameter, scale: 1 };
  }
  const factor = isRoundBadge
    ? diameter / Math.max(width, height)
    : diameter / Math.sqrt(width * width + height * height);

  return {
    width: Math.round(width * factor),
    height: Math.round(height * factor),
    scale: factor,
  };
}

/**
 * Derives a clean two-letter monogram from a restaurant name for fallback display.
 * Avoids symbols and empty states.
 */
export function getBrandInitials(name: string, maxLetters = 2): string {
  if (!name || typeof name !== 'string') return '';
  const trimmed = name.trim();
  if (!trimmed) return '';
  // Replace non-alphanumeric chars (including underscores, hyphens, punctuation) with spaces
  const cleaned = trimmed.replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  if (!cleaned) return '';
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  if (words.length === 1) return words[0].slice(0, maxLetters).toUpperCase();
  return words
    .slice(0, maxLetters)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}
