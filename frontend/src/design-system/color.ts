/**
 * MENUQR Design System — Colour Science
 *
 * Deterministic, dependency-free colour maths. Everything here is a pure function: the same
 * seed colour always produces the same palette, which is what makes palettes snapshot-testable
 * and lets us improve the maths later without migrating any stored data.
 *
 * Why OKLCH rather than HSL: HSL lightness is not perceptual. `hsl(60 100% 50%)` (yellow) and
 * `hsl(240 100% 50%)` (blue) share an "L" of 50% but look nothing alike in brightness, so a rule
 * like "surface = seed, 6% lighter" produces wildly inconsistent results across hues — which is
 * exactly why hand-tuned hex sets drift. OKLab lightness is perceptually uniform, so one rule
 * behaves identically for gold, emerald and navy. That is what makes a *generated* palette read
 * as *designed*.
 *
 * Conversion coefficients are the standard OKLab matrices (Bjorn Ottosson).
 */

export type Oklch = { l: number; c: number; h: number };
export type Rgb = { r: number; g: number; b: number };

const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);

// ---------------------------------- hex parsing ----------------------------------

const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/** Returns 0-255 channels, or null when the input is not a parseable hex colour. */
export function parseHex(input: string): Rgb | null {
  if (typeof input !== 'string') return null;
  const match = HEX_PATTERN.exec(input.trim());
  if (!match) return null;

  let hex = match[1];
  if (hex.length === 3 || hex.length === 4) {
    hex = hex
      .slice(0, 3)
      .split('')
      .map((char) => char + char)
      .join('');
  } else {
    hex = hex.slice(0, 6);
  }

  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

export function isValidHex(input: string): boolean {
  return parseHex(input) !== null;
}

export function toHex({ r, g, b }: Rgb): string {
  const channel = (value: number) =>
    Math.round(clamp01(value / 255) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

// ------------------------------ sRGB transfer function ------------------------------

/** sRGB electro-optical transfer function: 0-1 encoded channel to linear light. */
function linearize(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
}

/** Inverse transfer function: linear light to 0-1 encoded sRGB. */
function delinearize(channel: number): number {
  return channel <= 0.0031308 ? channel * 12.92 : 1.055 * Math.pow(channel, 1 / 2.4) - 0.055;
}

// --------------------------------- OKLab / OKLCH ---------------------------------

type Oklab = { L: number; a: number; b: number };

function rgbToOklab({ r, g, b }: Rgb): Oklab {
  const lr = linearize(r / 255);
  const lg = linearize(g / 255);
  const lb = linearize(b / 255);

  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const lRoot = Math.cbrt(l);
  const mRoot = Math.cbrt(m);
  const sRoot = Math.cbrt(s);

  return {
    L: 0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot,
    a: 1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot,
    b: 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot,
  };
}

/** Unclamped conversion — channels may fall outside 0-255 when the colour is out of gamut. */
function oklabToRgbRaw({ L, a, b }: Oklab): Rgb {
  const lRoot = L + 0.3963377774 * a + 0.2158037573 * b;
  const mRoot = L - 0.1055613458 * a - 0.0638541728 * b;
  const sRoot = L - 0.0894841775 * a - 1.291485548 * b;

  const l = lRoot * lRoot * lRoot;
  const m = mRoot * mRoot * mRoot;
  const s = sRoot * sRoot * sRoot;

  return {
    r: delinearize(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s) * 255,
    g: delinearize(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s) * 255,
    b: delinearize(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s) * 255,
  };
}

export function rgbToOklch(rgb: Rgb): Oklch {
  const { L, a, b } = rgbToOklab(rgb);
  const c = Math.sqrt(a * a + b * b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  // Hue is meaningless at zero chroma; normalise it so conversions stay reproducible.
  return { l: L, c, h: c < 1e-6 ? 0 : h };
}

function oklchToRgbRaw({ l, c, h }: Oklch): Rgb {
  const radians = (h * Math.PI) / 180;
  return oklabToRgbRaw({ L: l, a: Math.cos(radians) * c, b: Math.sin(radians) * c });
}

const GAMUT_TOLERANCE = 0.5; // in 0-255 units: absorb floating-point overshoot before rescaling

function inGamut({ r, g, b }: Rgb): boolean {
  const low = -GAMUT_TOLERANCE;
  const high = 255 + GAMUT_TOLERANCE;
  return r >= low && r <= high && g >= low && g <= high && b >= low && b <= high;
}

function clampChannels({ r, g, b }: Rgb): Rgb {
  return { r: clamp01(r / 255) * 255, g: clamp01(g / 255) * 255, b: clamp01(b / 255) * 255 };
}

/**
 * Convert OKLCH to sRGB, preserving lightness and hue.
 *
 * Out-of-gamut colours are brought in by reducing chroma via binary search rather than clamping
 * channels — channel clamping shifts hue, which is how "the same colour" ends up looking like a
 * different colour at a different lightness.
 */
export function oklchToRgb(colour: Oklch): Rgb {
  const direct = oklchToRgbRaw(colour);
  if (inGamut(direct)) return clampChannels(direct);

  let low = 0;
  let high = colour.c;
  let best = oklchToRgbRaw({ ...colour, c: 0 });

  for (let i = 0; i < 24; i += 1) {
    const mid = (low + high) / 2;
    const candidate = oklchToRgbRaw({ ...colour, c: mid });
    if (inGamut(candidate)) {
      best = candidate;
      low = mid;
    } else {
      high = mid;
    }
  }

  return clampChannels(best);
}

export function hexToOklch(hex: string): Oklch | null {
  const rgb = parseHex(hex);
  return rgb ? rgbToOklch(rgb) : null;
}

export function oklchToHex(colour: Oklch): string {
  return toHex(oklchToRgb(colour));
}

/** Derive a new OKLCH colour, clamping lightness to 0-1 and chroma to a displayable maximum. */
export function adjust(colour: Oklch, delta: Partial<Oklch>): Oklch {
  const hue = delta.h ?? colour.h;
  return {
    l: clamp01(delta.l ?? colour.l),
    c: Math.max(0, Math.min(0.37, delta.c ?? colour.c)),
    h: ((hue % 360) + 360) % 360,
  };
}

// --------------------------------- WCAG contrast ---------------------------------

/**
 * WCAG 2.1 relative luminance.
 *
 * Replaces the YIQ brightness approximations previously duplicated in
 * `data/menuTemplates.ts` (`isColorDark`) and `design-engine/designGenerator.ts`
 * (`getLuminance`), neither of which produced a real contrast ratio — so neither could support
 * a legibility guarantee.
 */
export function relativeLuminance(rgb: Rgb): number {
  const r = linearize(clamp01(rgb.r / 255));
  const g = linearize(clamp01(rgb.g / 255));
  const b = linearize(clamp01(rgb.b / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two hex colours: 1 (identical) to 21 (black on white). */
export function contrastRatio(foreground: string, background: string): number {
  const fg = parseHex(foreground);
  const bg = parseHex(background);
  if (!fg || !bg) return 1;

  const lf = relativeLuminance(fg);
  const lb = relativeLuminance(bg);
  return (Math.max(lf, lb) + 0.05) / (Math.min(lf, lb) + 0.05);
}

/** True when a colour is dark enough that light text belongs on top of it. */
export function isDark(hex: string): boolean {
  const rgb = parseHex(hex);
  return rgb ? relativeLuminance(rgb) < 0.18 : false;
}

/** Whichever of black or white is more legible on the given background. */
export function readableOn(background: string): string {
  return contrastRatio('#ffffff', background) >= contrastRatio('#000000', background)
    ? '#ffffff'
    : '#000000';
}

/**
 * Push `foreground` lighter or darker — along OKLCH lightness, preserving hue — until it meets
 * `minRatio` against `background`. Chroma is eased off toward the extremes, because highly
 * saturated colours cannot reach extreme lightness inside the sRGB gamut.
 *
 * This is the guarantee that makes "the owner may pick any brand colour" safe: no combination of
 * inputs can produce unreadable text. It is pure, so it doubles as the CI gate.
 */
export function ensureContrast(foreground: string, background: string, minRatio = 4.5): string {
  if (contrastRatio(foreground, background) >= minRatio) return foreground;

  const start = hexToOklch(foreground);
  const bgRgb = parseHex(background);
  if (!start || !bgRgb) return readableOn(background);

  // Move away from the background: light backgrounds get darker text, dark backgrounds lighter.
  const target = relativeLuminance(bgRgb) > 0.18 ? 0 : 1;

  const candidateAt = (lightness: number) => {
    // Taper chroma as lightness approaches an extreme so the result stays in gamut.
    const chromaScale = Math.max(0.2, 1 - Math.abs(lightness - start.l) * 0.6);
    return oklchToHex(adjust(start, { l: lightness, c: start.c * chromaScale }));
  };

  // If even the extreme lightness cannot satisfy the ratio, pure black/white is the best
  // available answer (a mid-grey background simply cannot reach 4.5:1 with any colour).
  if (contrastRatio(candidateAt(target), background) < minRatio) {
    return readableOn(background);
  }

  // Binary search for the smallest lightness change that satisfies the ratio, so the result
  // stays as close to the brand colour as legibility allows.
  let low = start.l;
  let high = target;
  let best = candidateAt(target);

  for (let i = 0; i < 20; i += 1) {
    const mid = (low + high) / 2;
    const candidate = candidateAt(mid);
    if (contrastRatio(candidate, background) >= minRatio) {
      best = candidate;
      high = mid;
    } else {
      low = mid;
    }
  }

  return best;
}

/**
 * Satisfy `minRatio` against several backgrounds at once.
 *
 * Needed because the same ink lands on more than one surface: a dish description sits on the
 * page background in a compact list but on a card in a magazine layout. Fixing it against only
 * one of them leaves the other unreadable.
 */
export function ensureContrastAll(foreground: string, backgrounds: string[], minRatio = 4.5): string {
  let result = foreground;

  // Each pass can only move lightness further from the mid-tones, so this converges quickly;
  // the bound exists to guarantee termination, not because many passes are expected.
  for (let pass = 0; pass < 6; pass += 1) {
    const failing = backgrounds.find((bg) => contrastRatio(result, bg) < minRatio);
    if (!failing) break;
    result = ensureContrast(result, failing, minRatio);
  }

  return result;
}

/** Mix two hex colours in OKLab, which avoids the muddy midpoints of naive sRGB blending. */
export function mix(a: string, b: string, weight = 0.5): string {
  const ca = parseHex(a);
  const cb = parseHex(b);
  if (!ca || !cb) return a;

  const la = rgbToOklab(ca);
  const lb = rgbToOklab(cb);
  const t = clamp01(weight);

  const blended: Oklab = {
    L: la.L + (lb.L - la.L) * t,
    a: la.a + (lb.a - la.a) * t,
    b: la.b + (lb.b - la.b) * t,
  };

  // Round-trip through OKLCH so the gamut-safe chroma reduction applies to the mixed colour.
  return oklchToHex(rgbToOklch(oklabToRgbRaw(blended)));
}

/** Translucent rgba() from a hex colour — used for hairline borders and photo scrims. */
export function alpha(hex: string, opacity: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  const a = Math.round(clamp01(opacity) * 1000) / 1000;
  return `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${a})`;
}
