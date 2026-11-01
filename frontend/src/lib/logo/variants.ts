/**
 * Step 8: one-colour versions of the logo.
 *
 * A logo with one or two inks is flattened: every visible pixel takes the mono colour and keeps its
 * alpha. A logo whose shapes are carried by tone (dark linework on light fills, a gold ring on a
 * black badge) is keyed by lightness instead, so the detail survives: the ink is the side of the
 * tonal range that touches the logo's outline, and the other side becomes transparent.
 */
import { oklabLightness, srgb8ToOklabR } from './color.ts';
import type { Rgb } from './color.ts';
import type { RgbaImage } from './types.ts';

export const MONO_LIGHT = { r: 255, g: 255, b: 255 };
export const MONO_DARK = { r: 17, g: 17, b: 17 };

interface MonoPlan {
  flat: boolean;
  darkInk: boolean;
  lo: number;
  hi: number;
}

function planMono(img: RgbaImage): MonoPlan {
  const { width: w, height: h, data } = img;
  const hist = new Uint32Array(256);
  let count = 0;
  let sum = 0;
  let rimSum = 0;
  let rimCount = 0;
  const alphaAt = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : data[(y * w + x) * 4 + 3]);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const j = (y * w + x) * 4;
      if (data[j + 3] < 200) continue;
      const lightness = oklabLightness(data[j], data[j + 1], data[j + 2]);
      hist[Math.min(255, Math.floor(lightness * 256))]++;
      count++;
      sum += lightness;
      if (alphaAt(x - 2, y) < 64 || alphaAt(x + 2, y) < 64 || alphaAt(x, y - 2) < 64 || alphaAt(x, y + 2) < 64) {
        rimSum += lightness;
        rimCount++;
      }
    }
  }
  if (count === 0) return { flat: true, darkInk: true, lo: 0, hi: 1 };
  const at = (share: number) => {
    let acc = 0;
    for (let i = 0; i < 256; i++) {
      acc += hist[i];
      if (acc >= share * count) return i / 255;
    }
    return 1;
  };
  const lo = at(0.1);
  const hi = at(0.9);
  const areaMean = sum / count;
  const rimMean = rimCount === 0 ? areaMean : rimSum / rimCount;
  return { flat: hi - lo < 0.3, darkInk: !(rimMean > areaMean + 0.1), lo, hi };
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function render(img: RgbaImage, plan: MonoPlan, colour: { r: number; g: number; b: number }, background: Rgb | null): RgbaImage {
  const bgLab = background ? srgb8ToOklabR(background.r, background.g, background.b) : null;
  const { width, height, data } = img;
  const out = new Uint8ClampedArray(data.length);
  const span = Math.max(1e-6, plan.hi - plan.lo);
  for (let i = 0; i < width * height; i++) {
    const j = i * 4;
    out[j] = colour.r;
    out[j + 1] = colour.g;
    out[j + 2] = colour.b;
    const a = data[j + 3];
    if (a === 0) continue;
    let ink = 1;
    if (bgLab) {
      // Kept enclosed areas (apron, badge interior, counters) have the old background colour: they are not ink.
      const lab = srgb8ToOklabR(data[j], data[j + 1], data[j + 2]);
      const d = Math.hypot(lab[0] - bgLab[0], lab[1] - bgLab[1], lab[2] - bgLab[2]);
      ink = d <= 0.05 ? 0 : d >= 0.1 ? 1 : (d - 0.05) / 0.05;
    }
    if (ink > 0 && !plan.flat) {
      const lightness = oklabLightness(data[j], data[j + 1], data[j + 2]);
      const t = plan.darkInk ? (plan.hi - lightness) / span : (lightness - plan.lo) / span;
      ink *= smooth(0.08, 0.92, t);
    }
    out[j + 3] = Math.round(a * ink);
  }
  return { width, height, data: out };
}

/** `background` is the colour that was removed around the logo; pixels of that colour left inside are not ink. */
export function makeMonoVariants(img: RgbaImage, background: Rgb | null = null): { monoLight: RgbaImage; monoDark: RgbaImage } {
  const plan = planMono(img);
  return { monoLight: render(img, plan, MONO_LIGHT, background), monoDark: render(img, plan, MONO_DARK, background) };
}
