/**
 * Steps 4 to 7 of the pipeline: trim and pad, classify, extract the palette, profile the luminance
 * (so placement never needs the pixels again), and tell a photograph from a flat graphic.
 */
import { oklabLightness, oklabRToSrgb8, relativeLuminance, rgbToHex, srgb8ToOklabR } from './color.ts';
import type { AspectClass, LumaBin, PaletteEntry, RgbaImage } from './types.ts';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Bounding box of the pixels whose alpha is at least `alphaMin`, or null when there are none. */
export function findContentBounds(img: RgbaImage, alphaMin = 8): Rect | null {
  const { width: w, height: h, data } = img;
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    const row = y * w * 4;
    for (let x = 0; x < w; x++) {
      if (data[row + x * 4 + 3] >= alphaMin) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        maxY = y;
      }
    }
  }
  if (maxX < 0) return null;
  return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

/** Copies `rect` into a new transparent canvas with `pad` pixels on every side. */
export function cropAndPad(img: RgbaImage, rect: Rect, pad: number): RgbaImage {
  const width = rect.width + 2 * pad;
  const height = rect.height + 2 * pad;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < rect.height; y++) {
    const from = ((rect.y + y) * img.width + rect.x) * 4;
    data.set(img.data.subarray(from, from + rect.width * 4), ((y + pad) * width + pad) * 4);
  }
  return { width, height, data };
}

export function classifyAspect(ratio: number): AspectClass {
  if (ratio >= 2.2) return 'wide';
  if (ratio >= 1.33) return 'landscape';
  if (ratio >= 0.75) return 'square';
  return 'tall';
}

/**
 * A round emblem: nearly square, the filled silhouette covers pi/4 of its box, and the outline
 * keeps one radius all the way round. Holes are filled first, so a ring with a transparent
 * interior counts as round too.
 */
export function detectRoundBadge(img: RgbaImage, content: Rect): boolean {
  const cw = content.width;
  const ch = content.height;
  if (cw < 24 || ch < 24 || Math.abs(cw / ch - 1) > 0.08) return false;
  const n = cw * ch;
  const solid = new Uint8Array(n);
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      solid[y * cw + x] = img.data[((content.y + y) * img.width + content.x + x) * 4 + 3] >= 128 ? 1 : 0;
    }
  }
  const outside = new Uint8Array(n);
  const queue = new Int32Array(n);
  let head = 0;
  let tail = 0;
  const seed = (i: number) => {
    if (solid[i] === 0 && outside[i] === 0) {
      outside[i] = 1;
      queue[tail++] = i;
    }
  };
  for (let x = 0; x < cw; x++) {
    seed(x);
    seed((ch - 1) * cw + x);
  }
  for (let y = 1; y < ch - 1; y++) {
    seed(y * cw);
    seed(y * cw + cw - 1);
  }
  while (head < tail) {
    const i = queue[head++];
    const x = i % cw;
    if (x > 0) seed(i - 1);
    if (x < cw - 1) seed(i + 1);
    if (i >= cw) seed(i - cw);
    if (i < n - cw) seed(i + cw);
  }
  let area = 0;
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < n; i++) {
    if (outside[i] === 0) {
      area++;
      sx += i % cw;
      sy += Math.floor(i / cw);
    }
  }
  const fill = area / n;
  if (fill < 0.72 || fill > 0.83) return false;
  const cx = sx / area;
  const cy = sy / area;
  const radii: number[] = [];
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const i = y * cw + x;
      if (outside[i] === 1) continue;
      const edge = x === 0 || y === 0 || x === cw - 1 || y === ch - 1 || outside[i - 1] === 1 || outside[i + 1] === 1 || outside[i - cw] === 1 || outside[i + cw] === 1;
      if (edge) radii.push(Math.hypot(x - cx, y - cy));
    }
  }
  if (radii.length < 16) return false;
  const mean = radii.reduce((a, b) => a + b, 0) / radii.length;
  let close = 0;
  for (const r of radii) if (Math.abs(r - mean) / mean <= 0.08) close++;
  return close / radii.length >= 0.9;
}

function sampleStep(count: number, cap: number): number {
  return Math.max(1, Math.ceil(count / cap));
}

/**
 * Colours by k-means in OKLab, started deterministically from the most populated colour cells.
 * Returns the colours sorted by weight, with near-duplicates merged and crumbs below 1.5 percent dropped.
 */
export function extractPalette(img: RgbaImage, maxColours = 5): { entries: PaletteEntry[]; meanLightness: number } {
  const { width: w, height: h, data } = img;
  const total = w * h;
  let opaque = 0;
  for (let i = 0; i < total; i++) if (data[i * 4 + 3] >= 200) opaque++;
  if (opaque === 0) return { entries: [], meanLightness: 0.5 };
  const step = sampleStep(opaque, 14000);
  const labs = new Float32Array(3 * Math.ceil(opaque / step) + 3);
  let m = 0;
  let seen = 0;
  let lightSum = 0;
  for (let i = 0; i < total; i++) {
    const j = i * 4;
    if (data[j + 3] < 200) continue;
    if (seen++ % step !== 0) continue;
    const lab = srgb8ToOklabR(data[j], data[j + 1], data[j + 2]);
    labs[3 * m] = lab[0];
    labs[3 * m + 1] = lab[1];
    labs[3 * m + 2] = lab[2];
    lightSum += oklabLightness(data[j], data[j + 1], data[j + 2]);
    m++;
  }

  // Candidate starting colours: means of the most populated 0.04-wide cells.
  const cells = new Map<number, { n: number; l: number; a: number; b: number }>();
  for (let i = 0; i < m; i++) {
    const k = (Math.floor(labs[3 * i] / 0.04) * 64 + Math.floor((labs[3 * i + 1] + 0.5) / 0.04)) * 64 + Math.floor((labs[3 * i + 2] + 0.5) / 0.04);
    const cell = cells.get(k);
    if (cell) {
      cell.n++;
      cell.l += labs[3 * i];
      cell.a += labs[3 * i + 1];
      cell.b += labs[3 * i + 2];
    } else cells.set(k, { n: 1, l: labs[3 * i], a: labs[3 * i + 1], b: labs[3 * i + 2] });
  }
  const candidates = [...cells.values()]
    .filter((c) => c.n >= Math.max(2, 0.004 * m))
    .sort((p, q) => q.n - p.n)
    .map((c) => [c.l / c.n, c.a / c.n, c.b / c.n] as [number, number, number]);
  if (candidates.length === 0) candidates.push([labs[0], labs[1], labs[2]]);
  const k = Math.min(7, candidates.length);
  const centres: [number, number, number][] = [candidates[0]];
  while (centres.length < k) {
    let best = -1;
    let bestDist = -1;
    for (let i = 0; i < candidates.length; i++) {
      let nearest = Infinity;
      for (const c of centres) {
        const d = (candidates[i][0] - c[0]) ** 2 + (candidates[i][1] - c[1]) ** 2 + (candidates[i][2] - c[2]) ** 2;
        if (d < nearest) nearest = d;
      }
      if (nearest > bestDist) {
        bestDist = nearest;
        best = i;
      }
    }
    centres.push(candidates[best]);
  }

  const counts = new Float64Array(k);
  for (let iteration = 0; iteration < 8; iteration++) {
    const sums = new Float64Array(3 * k);
    counts.fill(0);
    for (let i = 0; i < m; i++) {
      let best = 0;
      let bestDist = Infinity;
      for (let c = 0; c < k; c++) {
        const d = (labs[3 * i] - centres[c][0]) ** 2 + (labs[3 * i + 1] - centres[c][1]) ** 2 + (labs[3 * i + 2] - centres[c][2]) ** 2;
        if (d < bestDist) {
          bestDist = d;
          best = c;
        }
      }
      counts[best]++;
      sums[3 * best] += labs[3 * i];
      sums[3 * best + 1] += labs[3 * i + 1];
      sums[3 * best + 2] += labs[3 * i + 2];
    }
    for (let c = 0; c < k; c++) {
      if (counts[c] > 0) centres[c] = [sums[3 * c] / counts[c], sums[3 * c + 1] / counts[c], sums[3 * c + 2] / counts[c]];
    }
  }

  // Merge near-duplicates, weighted.
  const merged: { c: [number, number, number]; n: number }[] = [];
  const order = [...Array(k).keys()].sort((p, q) => counts[q] - counts[p]);
  for (const idx of order) {
    if (counts[idx] === 0) continue;
    const c = centres[idx];
    const near = merged.find((x) => (x.c[0] - c[0]) ** 2 + (x.c[1] - c[1]) ** 2 + (x.c[2] - c[2]) ** 2 < 0.07 * 0.07);
    if (near) {
      const total2 = near.n + counts[idx];
      near.c = [
        (near.c[0] * near.n + c[0] * counts[idx]) / total2,
        (near.c[1] * near.n + c[1] * counts[idx]) / total2,
        (near.c[2] * near.n + c[2] * counts[idx]) / total2,
      ];
      near.n = total2;
    } else merged.push({ c, n: counts[idx] });
  }
  const entries: PaletteEntry[] = merged
    .map((x) => ({ x, weight: x.n / m }))
    .filter((e) => e.weight >= 0.015)
    .sort((p, q) => q.weight - p.weight)
    .slice(0, maxColours)
    .map(({ x, weight }) => {
      const [r, g, b] = oklabRToSrgb8(x.c[0], x.c[1], x.c[2]);
      return { hex: rgbToHex(r, g, b), weight: Math.round(weight * 1000) / 1000, lightness: Math.round(x.c[0] * 1000) / 1000, chroma: Math.round(Math.hypot(x.c[1], x.c[2]) * 1000) / 1000 };
    });
  return { entries, meanLightness: lightSum / m };
}

const LUMA_BINS = 32;

function toProfile(weights: Float64Array, ySums: Float64Array): LumaBin[] {
  let total = 0;
  for (let i = 0; i < LUMA_BINS; i++) total += weights[i];
  if (total === 0) return [];
  const bins: LumaBin[] = [];
  for (let i = 0; i < LUMA_BINS; i++) {
    if (weights[i] / total < 0.002) continue;
    bins.push({ y: Math.round((ySums[i] / weights[i]) * 10000) / 10000, w: Math.round((weights[i] / total) * 10000) / 10000 });
  }
  return bins;
}

/**
 * Luminance profile of the ink (every visible pixel, weighted by alpha) and of its outer rim (the
 * visible pixels within two pixels of the edge). Contrast against any background is then a sum
 * over at most 32 bins.
 */
export function lumaProfiles(img: RgbaImage): { area: LumaBin[]; rim: LumaBin[] } {
  const { width: w, height: h, data } = img;
  const total = w * h;
  const areaW = new Float64Array(LUMA_BINS);
  const areaY = new Float64Array(LUMA_BINS);
  const rimW = new Float64Array(LUMA_BINS);
  const rimY = new Float64Array(LUMA_BINS);
  const stride = sampleStep(total, 250000);
  const binOf = (y: number) => Math.min(LUMA_BINS - 1, Math.floor(Math.cbrt(y) * LUMA_BINS));
  const alphaAt = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : data[(y * w + x) * 4 + 3]);
  let rimCount = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const j = (y * w + x) * 4;
      const a = data[j + 3];
      if (a < 24) continue;
      let isRim = false;
      if (a >= 128) {
        isRim = alphaAt(x - 2, y) < 64 || alphaAt(x + 2, y) < 64 || alphaAt(x, y - 2) < 64 || alphaAt(x, y + 2) < 64;
      }
      if (isRim) rimCount++;
      if ((y * w + x) % stride === 0) {
        const lum = relativeLuminance(data[j], data[j + 1], data[j + 2]);
        const b = binOf(lum);
        areaW[b] += a / 255;
        areaY[b] += (a / 255) * lum;
      }
    }
  }
  const rimStep = sampleStep(rimCount, 60000);
  let rimSeen = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const j = (y * w + x) * 4;
      if (data[j + 3] < 128) continue;
      if (!(alphaAt(x - 2, y) < 64 || alphaAt(x + 2, y) < 64 || alphaAt(x, y - 2) < 64 || alphaAt(x, y + 2) < 64)) continue;
      if (rimSeen++ % rimStep !== 0) continue;
      const lum = relativeLuminance(data[j], data[j + 1], data[j + 2]);
      const b = binOf(lum);
      rimW[b] += 1;
      rimY[b] += lum;
    }
  }
  return { area: toProfile(areaW, areaY), rim: toProfile(rimW, rimY) };
}

/**
 * Photographs have thousands of colours and noisy texture; flat graphics have a few dozen colours
 * and only two kinds of neighbouring pixels: identical, or across a hard edge.
 */
export function looksLikePhoto(img: RgbaImage): { isPhoto: boolean; colours: number; midShare: number } {
  const { width: w, height: h, data } = img;
  const bins = new Uint32Array(32768);
  let samples = 0;
  let pairs = 0;
  let mid = 0;
  const step = Math.max(1, Math.floor(Math.sqrt((w * h) / 90000)));
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x + 1 < w; x += step) {
      const j = (y * w + x) * 4;
      if (data[j + 3] < 200) continue;
      bins[((data[j] >> 3) << 10) | ((data[j + 1] >> 3) << 5) | (data[j + 2] >> 3)]++;
      samples++;
      const k = j + 4;
      if (data[k + 3] < 200) continue;
      const d = Math.abs(data[j] - data[k]) + Math.abs(data[j + 1] - data[k + 1]) + Math.abs(data[j + 2] - data[k + 2]);
      pairs++;
      if (d >= 9 && d <= 90) mid++;
    }
  }
  if (samples < 64) return { isPhoto: false, colours: 0, midShare: 0 };
  let colours = 0;
  const floor = Math.max(2, 0.0015 * samples);
  for (let i = 0; i < bins.length; i++) if (bins[i] >= floor) colours++;
  const midShare = pairs === 0 ? 0 : mid / pairs;
  return { isPhoto: colours >= 120 && midShare >= 0.25, colours, midShare };
}
