/**
 * Colour maths for the logo pipeline: sRGB <-> OKLab (Bjorn Ottosson's matrices, written out here
 * so no dependency is needed), WCAG contrast, and a small CSS colour parser.
 *
 * OKLab distance is the pipeline's "delta E": 0 is identical, about 0.02 is just visible, white
 * against black is 1.
 */

const SRGB_TO_LINEAR = new Float32Array(256);
for (let i = 0; i < 256; i++) {
  const c = i / 255;
  SRGB_TO_LINEAR[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export function linearToSrgb8(v: number): number {
  const c = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  const n = Math.round(c * 255);
  return n < 0 ? 0 : n > 255 ? 255 : n;
}

export function srgb8ToOklab(r: number, g: number, b: number): [number, number, number] {
  const lr = SRGB_TO_LINEAR[r & 255];
  const lg = SRGB_TO_LINEAR[g & 255];
  const lb = SRGB_TO_LINEAR[b & 255];
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

export function oklabToSrgb8(L: number, a: number, b: number): [number, number, number] {
  const l = L + 0.3963377774 * a + 0.2158037573 * b;
  const m = L - 0.1055613458 * a - 0.0638541728 * b;
  const s = L - 0.0894841775 * a - 1.291485548 * b;
  const l3 = l * l * l;
  const m3 = m * m * m;
  const s3 = s * s * s;
  return [
    linearToSrgb8(4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3),
    linearToSrgb8(-1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3),
    linearToSrgb8(-0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3),
  ];
}

/**
 * OKLab's lightness is the cube root of luminance, which exaggerates tiny differences near black
 * (one 8-bit step above black is already 0.067). Compression noise is uniform in code values, not in
 * cube roots, so distances are measured with Ottosson's revised lightness (the "toe" of Okhsl):
 * near white it is almost identical to L, near black it is about four times less sensitive.
 */
const TOE_K1 = 0.206;
const TOE_K2 = 0.03;
const TOE_K3 = (1 + TOE_K1) / (1 + TOE_K2);

export function toe(x: number): number {
  const t = TOE_K3 * x - TOE_K1;
  return 0.5 * (t + Math.sqrt(t * t + 4 * TOE_K2 * TOE_K3 * x));
}

export function toeInverse(x: number): number {
  return (x * x + TOE_K1 * x) / (TOE_K3 * (x + TOE_K2));
}

/** sRGB to OKLab with revised lightness: the space every distance in the pipeline is measured in. */
export function srgb8ToOklabR(r: number, g: number, b: number): [number, number, number] {
  const lab = srgb8ToOklab(r, g, b);
  return [toe(lab[0]), lab[1], lab[2]];
}

export function oklabRToSrgb8(L: number, a: number, b: number): [number, number, number] {
  return oklabToSrgb8(toeInverse(L), a, b);
}

/** Euclidean distance in OKLab. */
export function deltaE(a: ArrayLike<number>, b: ArrayLike<number>): number {
  const dl = a[0] - b[0];
  const da = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.sqrt(dl * dl + da * da + db * db);
}

export interface OklabPlanes {
  L: Float32Array;
  A: Float32Array;
  B: Float32Array;
}

/**
 * OKLab (revised lightness, see toe) of every pixel, one plane per channel. Runs of identical colours (flat graphics) reuse the
 * previous result, which makes this the cheap part of the pipeline for logos.
 */
export function toOklabPlanes(data: ArrayLike<number>, pixels: number): OklabPlanes {
  const L = new Float32Array(pixels);
  const A = new Float32Array(pixels);
  const B = new Float32Array(pixels);
  let pr = -1;
  let pg = -1;
  let pb = -1;
  let cl = 0;
  let ca = 0;
  let cb = 0;
  for (let i = 0, j = 0; i < pixels; i++, j += 4) {
    const r = data[j];
    const g = data[j + 1];
    const b = data[j + 2];
    if (r !== pr || g !== pg || b !== pb) {
      pr = r;
      pg = g;
      pb = b;
      const lr = SRGB_TO_LINEAR[r];
      const lg = SRGB_TO_LINEAR[g];
      const lb = SRGB_TO_LINEAR[b];
      const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
      const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
      const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
      cl = toe(0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s);
      ca = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
      cb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    }
    L[i] = cl;
    A[i] = ca;
    B[i] = cb;
  }
  return { L, A, B };
}

/** Plain OKLab lightness (0..1) of an 8-bit sRGB colour, without allocating. */
export function oklabLightness(r: number, g: number, b: number): number {
  const lr = SRGB_TO_LINEAR[r & 255];
  const lg = SRGB_TO_LINEAR[g & 255];
  const lb = SRGB_TO_LINEAR[b & 255];
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
}

/** WCAG relative luminance (0..1) of an sRGB colour given as 8-bit channels. */
export function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * SRGB_TO_LINEAR[r & 255] + 0.7152 * SRGB_TO_LINEAR[g & 255] + 0.0722 * SRGB_TO_LINEAR[b & 255];
}

/** WCAG contrast ratio between two relative luminances (1..21). */
export function contrastRatio(y1: number, y2: number): number {
  const hi = y1 > y2 ? y1 : y2;
  const lo = y1 > y2 ? y2 : y1;
  return (hi + 0.05) / (lo + 0.05);
}

export function contrastBetween(a: Rgb, b: Rgb): number {
  return contrastRatio(relativeLuminance(a.r, a.g, a.b), relativeLuminance(b.r, b.g, b.b));
}

const hex2 = (n: number) => (n < 0 ? 0 : n > 255 ? 255 : Math.round(n)).toString(16).padStart(2, '0');

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${hex2(r)}${hex2(g)}${hex2(b)}`;
}

const NAMED: Record<string, Rgb & { a: number }> = {
  white: { r: 255, g: 255, b: 255, a: 1 },
  black: { r: 0, g: 0, b: 0, a: 1 },
  transparent: { r: 255, g: 255, b: 255, a: 0 },
};

function hslToRgb(h: number, s: number, l: number): Rgb {
  const hh = (((h % 360) + 360) % 360) / 360;
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (t: number) => {
    let x = t;
    if (x < 0) x += 1;
    if (x > 1) x -= 1;
    if (x < 1 / 6) return p + (q - p) * 6 * x;
    if (x < 1 / 2) return q;
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
    return p;
  };
  return { r: Math.round(channel(hh + 1 / 3) * 255), g: Math.round(channel(hh) * 255), b: Math.round(channel(hh - 1 / 3) * 255) };
}

/**
 * Parses the CSS colour forms a theme can contain: #rgb, #rgba, #rrggbb, #rrggbbaa, rgb()/rgba()
 * with commas or spaces, hsl()/hsla(), white, black, transparent. Returns null for anything else
 * (var(), gradients, named colours not listed), so callers can fall back instead of guessing.
 */
export function parseCssColor(input: string | null | undefined): (Rgb & { a: number }) | null {
  if (typeof input !== 'string') return null;
  const text = input.trim().toLowerCase();
  if (!text) return null;
  if (NAMED[text]) return { ...NAMED[text] };

  const hex = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(text);
  if (hex) {
    let h = hex[1];
    if (h.length <= 4) h = h.split('').map((c) => c + c).join('');
    const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 };
  }

  const fn = /^(rgba?|hsla?)\(([^)]*)\)$/.exec(text);
  if (!fn) return null;
  const parts = fn[2].split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3 || parts.length > 4) return null;
  const num = (value: string, scale: number) => {
    const isPercent = value.endsWith('%');
    const v = parseFloat(value);
    if (!Number.isFinite(v)) return null;
    return isPercent ? (v / 100) * scale : v;
  };
  const alpha = parts[3] === undefined ? 1 : num(parts[3], 1);
  if (alpha === null) return null;
  const a = Math.min(1, Math.max(0, alpha));
  if (fn[1].startsWith('rgb')) {
    const r = num(parts[0], 255);
    const g = num(parts[1], 255);
    const b = num(parts[2], 255);
    if (r === null || g === null || b === null) return null;
    const c = (v: number) => Math.min(255, Math.max(0, Math.round(v)));
    return { r: c(r), g: c(g), b: c(b), a };
  }
  const h = parseFloat(parts[0]);
  const s = num(parts[1], 1);
  const l = num(parts[2], 1);
  if (!Number.isFinite(h) || s === null || l === null) return null;
  return { ...hslToRgb(h, Math.min(1, Math.max(0, s)), Math.min(1, Math.max(0, l))), a };
}
