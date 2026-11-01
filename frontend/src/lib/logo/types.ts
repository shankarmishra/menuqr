/**
 * Shared types of the logo pipeline.
 *
 * Everything in `src/lib/logo` works on plain pixel buffers (no DOM, no canvas), so the same code
 * runs in the browser (live preview), in a worker and in Node (tests, server).
 */

/** A straight (non-premultiplied) 8-bit RGBA image in sRGB, row-major, 4 bytes per pixel. */
export interface RgbaImage {
  width: number;
  height: number;
  data: Uint8ClampedArray | Uint8Array;
}

export type AspectClass = 'wide' | 'landscape' | 'square' | 'tall';

/** What the outer ring of the source image looked like. */
export type BackgroundKind = 'transparent' | 'flat' | 'gradient' | 'photo' | 'complex';

export type WarningCode =
  | 'low-resolution'
  | 'photo-background'
  | 'background-not-flat'
  | 'low-contrast'
  | 'nothing-left'
  | 'cropped-edge';

export interface LogoWarning {
  code: WarningCode;
  severity: 'info' | 'warning';
  /** Plain English the console can show as is. */
  message: string;
}

export interface PaletteEntry {
  hex: string;
  /** Share of the logo's ink, 0..1. The entries sum to about 1. */
  weight: number;
  /** OKLab lightness 0..1. */
  lightness: number;
  /** OKLab chroma. Greys are about 0, saturated brand colours 0.15 and above. */
  chroma: number;
}

/** One bin of a luminance histogram: WCAG relative luminance `y` and its share `w` of the ink. */
export interface LumaBin {
  y: number;
  w: number;
}

export interface LogoAnalysis {
  version: 1;
  source: { width: number; height: number; hadTransparency: boolean };
  background: {
    kind: BackgroundKind;
    /** The flat colour that was detected (sRGB hex), or null when there is none. */
    colorHex: string | null;
    /** Share of the outer ring that sits in the dominant colour cluster, 0..1. */
    ringCoverage: number;
    removed: boolean;
    /** Share of the source pixels that became transparent, 0..1. */
    removedShare: number;
  };
  /** The content box in SOURCE pixels (before padding); null when the image was not trimmed. */
  crop: { x: number; y: number; width: number; height: number } | null;
  /** Transparent padding added on every side of the content, in output pixels. */
  padding: number;
  output: { width: number; height: number };
  /** The content box inside the OUTPUT image (excludes the padding). */
  content: { x: number; y: number; width: number; height: number };
  /** Number of visible (alpha 128 or more) pixels of the content. */
  contentPixels: number;
  aspect: AspectClass;
  /** content width / content height */
  ratio: number;
  /** A round emblem: a roundel or badge that already carries its own circle. */
  isRoundBadge: boolean;
  /** How enclosed areas were treated: an emblem keeps its holes and bays, a wordmark loses its counters. */
  structure: { mode: 'emblem' | 'wordmark' | 'none'; holesKept: number; holesPunched: number; bayPixels: number };
  /** Overall lightness of the ink (area weighted). */
  tone: 'light' | 'dark';
  /** OKLab lightness 0..1 behind `tone`. */
  luminance: number;
  /** The image itself looks like a photograph (many colours, noisy texture), not a flat graphic. */
  isPhoto: boolean;
  palette: PaletteEntry[];
  dominantHex: string;
  /** The most characteristic saturated colour, or null for a monochrome logo. */
  brandHex: string | null;
  /** A one-colour version keeps the logo recognisable (one or two inks). */
  monoSuitable: boolean;
  /** Luminance profiles (whole ink and outer rim) so placement never needs the pixels again. */
  luma: { area: LumaBin[]; rim: LumaBin[] };
  warnings: LogoWarning[];
}

export interface LogoPipelineOptions {
  /** Padding around the trimmed content as a share of its longer side. Default 0.04. */
  paddingRatio?: number;
  /** Content smaller than this (longer side, pixels) triggers the low-resolution warning. Default 300. */
  minContentPx?: number;
  /** Keep large enclosed background-coloured areas (apron, badge interior). Default true; false is the owner's opt-in to remove them. */
  keepEnclosed?: boolean;
  /** Also build the mono-light and mono-dark variants. Default true. */
  variants?: boolean;
}

export interface LogoPipelineResult {
  /** The processed logo: transparent, trimmed, padded. The source image when nothing could be removed. */
  image: RgbaImage;
  variants: { monoLight: RgbaImage; monoDark: RgbaImage } | null;
  analysis: LogoAnalysis;
}
