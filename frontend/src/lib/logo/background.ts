/**
 * Step 2 of the pipeline: is the background one flat colour?
 *
 * The rule (blueprint 7.5): one tight OKLab cluster must cover at least 85 percent of the outer 3
 * percent ring of the image. Logos that are cropped tight to the edge can fail that count while
 * still having a flat background, so a rescue rule accepts a smaller share when all four corners
 * agree and the ring is smooth.
 */
import { oklabRToSrgb8, rgbToHex, srgb8ToOklabR } from './color.ts';
import type { BackgroundKind, RgbaImage } from './types.ts';

export const RING_SHARE = 0.03;
/** Radius of the "tight" cluster, in OKLab delta E. */
export const FLAT_RADIUS = 0.05;
/** Radius that still counts as a gentle gradient or vignette. */
export const GENTLE_RADIUS = 0.1;
export const MIN_COVERAGE = 0.85;
const RESCUE_COVERAGE = 0.6;
/** Mean delta E between neighbouring ring pixels above which the ring is textured (a photo), not smooth. */
export const ROUGHNESS_LIMIT = 0.012;
const MAX_SAMPLES = 12000;
const CELL = 0.03;

export interface BackgroundDetection {
  kind: BackgroundKind;
  lab: [number, number, number] | null;
  rgb: { r: number; g: number; b: number } | null;
  colorHex: string | null;
  /** Share of the ring inside the tight cluster (transparent pixels count as matching). */
  coverage: number;
  gentleCoverage: number;
  /** 95th percentile distance of the tight cluster's members to its centre. */
  noiseP95: number;
  /** 98th percentile distance of all opaque ring pixels to the centre. */
  spread: number;
  /** Mean delta E between neighbouring ring pixels. */
  roughness: number;
  transparentShare: number;
}

export function ringThickness(width: number, height: number): number {
  const short = Math.min(width, height);
  return Math.max(1, Math.min(Math.round(RING_SHARE * short), Math.floor(short / 2)));
}

function compositeOverWhite(c: number, a: number): number {
  return a >= 255 ? c : Math.round((c * a + 255 * (255 - a)) / 255);
}

function percentile(sorted: Float32Array, p: number): number {
  if (sorted.length === 0) return 0;
  return sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
}

export function detectBackground(img: RgbaImage): BackgroundDetection {
  const { width: w, height: h, data } = img;
  const t = ringThickness(w, h);
  const ringTotal = w * h - Math.max(0, w - 2 * t) * Math.max(0, h - 2 * t);
  const step = Math.max(1, Math.ceil(ringTotal / MAX_SAMPLES));

  const labs = new Float32Array(3 * Math.min(ringTotal, MAX_SAMPLES + 8));
  const corner = new Uint8Array(Math.min(ringTotal, MAX_SAMPLES + 8));
  let opaque = 0;
  let transparent = 0;
  const cornerTotals = [0, 0, 0, 0];
  let roughSum = 0;
  let roughCount = 0;
  let seen = 0;

  const labAt = (x: number, y: number): [number, number, number] | null => {
    const j = (y * w + x) * 4;
    const a = data[j + 3];
    if (a < 16) return null;
    return srgb8ToOklabR(compositeOverWhite(data[j], a), compositeOverWhite(data[j + 1], a), compositeOverWhite(data[j + 2], a));
  };

  const visit = (x: number, y: number) => {
    if (seen++ % step !== 0) return;
    const lab = labAt(x, y);
    const nearX = x < t || x >= w - t;
    const nearY = y < t || y >= h - t;
    const cornerId = nearX && nearY ? (y < t ? 0 : 2) + (x < t ? 0 : 1) : -1;
    if (cornerId >= 0) cornerTotals[cornerId]++;
    if (!lab) {
      transparent++;
      return;
    }
    labs[3 * opaque] = lab[0];
    labs[3 * opaque + 1] = lab[1];
    labs[3 * opaque + 2] = lab[2];
    corner[opaque] = cornerId + 1;
    opaque++;
    // Smoothness along the ring: the right neighbour on the top and bottom strips, the lower one on the sides.
    const topOrBottom = y < t || y >= h - t;
    const nx = topOrBottom ? x + 1 : x;
    const ny = topOrBottom ? y : y + 1;
    if (nx < w && ny < h) {
      const other = labAt(nx, ny);
      if (other) {
        const dl = lab[0] - other[0];
        const da = lab[1] - other[1];
        const db = lab[2] - other[2];
        roughSum += Math.sqrt(dl * dl + da * da + db * db);
        roughCount++;
      }
    }
  };

  for (let y = 0; y < h; y++) {
    if (y < t || y >= h - t) {
      for (let x = 0; x < w; x++) visit(x, y);
    } else {
      for (let x = 0; x < t; x++) visit(x, y);
      for (let x = Math.max(t, w - t); x < w; x++) visit(x, y);
    }
  }

  const total = opaque + transparent;
  const transparentShare = total === 0 ? 0 : transparent / total;
  const roughness = roughCount === 0 ? 0 : roughSum / roughCount;
  const none: BackgroundDetection = {
    kind: 'transparent',
    lab: null,
    rgb: null,
    colorHex: null,
    coverage: 1,
    gentleCoverage: 1,
    noiseP95: 0,
    spread: 0,
    roughness,
    transparentShare,
  };
  if (opaque === 0 || transparentShare >= 0.5) return { ...none, transparentShare: opaque === 0 ? 1 : transparentShare };

  // Densest OKLab cell (counting its 26 neighbours), then mean-shift to its centre.
  const key = (a: number, b: number, c: number) => (a * 64 + b) * 64 + c;
  const cells = new Map<number, number>();
  for (let i = 0; i < opaque; i++) {
    const k = key(
      Math.floor(labs[3 * i] / CELL) + 2,
      Math.floor((labs[3 * i + 1] + 0.5) / CELL) + 2,
      Math.floor((labs[3 * i + 2] + 0.5) / CELL) + 2
    );
    cells.set(k, (cells.get(k) ?? 0) + 1);
  }
  let bestKey = -1;
  let bestSum = -1;
  for (const [k] of cells) {
    const c = k % 64;
    const b = ((k - c) / 64) % 64;
    const a = (k - c - b * 64) / 4096;
    let sum = 0;
    for (let da = -1; da <= 1; da++) for (let db = -1; db <= 1; db++) for (let dc = -1; dc <= 1; dc++) sum += cells.get(key(a + da, b + db, c + dc)) ?? 0;
    if (sum > bestSum || (sum === bestSum && k < bestKey)) {
      bestSum = sum;
      bestKey = k;
    }
  }
  const kc = bestKey % 64;
  const kb = ((bestKey - kc) / 64) % 64;
  const ka = (bestKey - kc - kb * 64) / 4096;
  let cL = (ka - 2 + 0.5) * CELL;
  let cA = (kb - 2 + 0.5) * CELL - 0.5;
  let cB = (kc - 2 + 0.5) * CELL - 0.5;
  for (let iteration = 0; iteration < 4; iteration++) {
    let sl = 0;
    let sa = 0;
    let sb = 0;
    let count = 0;
    for (let i = 0; i < opaque; i++) {
      const dl = labs[3 * i] - cL;
      const da = labs[3 * i + 1] - cA;
      const db = labs[3 * i + 2] - cB;
      if (dl * dl + da * da + db * db <= 0.06 * 0.06) {
        sl += labs[3 * i];
        sa += labs[3 * i + 1];
        sb += labs[3 * i + 2];
        count++;
      }
    }
    if (count === 0) break;
    cL = sl / count;
    cA = sa / count;
    cB = sb / count;
  }

  const distances = new Float32Array(opaque);
  let inFlat = 0;
  let inGentle = 0;
  const cornerIn = [0, 0, 0, 0];
  for (let i = 0; i < opaque; i++) {
    const dl = labs[3 * i] - cL;
    const da = labs[3 * i + 1] - cA;
    const db = labs[3 * i + 2] - cB;
    const d = Math.sqrt(dl * dl + da * da + db * db);
    distances[i] = d;
    if (d <= FLAT_RADIUS) {
      inFlat++;
      if (corner[i] > 0) cornerIn[corner[i] - 1]++;
    }
    if (d <= GENTLE_RADIUS) inGentle++;
  }
  const members = new Float32Array(inFlat);
  let m = 0;
  for (let i = 0; i < opaque; i++) if (distances[i] <= FLAT_RADIUS) members[m++] = distances[i];
  members.sort();
  const noiseP95 = percentile(members, 0.95);
  const all = distances.slice().sort();
  const spread = percentile(all, 0.98);

  const coverage = (transparent + inFlat) / total;
  const gentleCoverage = (transparent + inGentle) / total;
  const cornersAgree = cornerTotals.every((count, i) => count === 0 || cornerIn[i] / count >= 0.9);

  const [r, g, b] = oklabRToSrgb8(cL, cA, cB);
  let kind: BackgroundKind;
  if (coverage >= MIN_COVERAGE) kind = 'flat';
  else if (coverage >= RESCUE_COVERAGE && cornersAgree && roughness < ROUGHNESS_LIMIT) kind = 'flat';
  else if (gentleCoverage >= MIN_COVERAGE && roughness < ROUGHNESS_LIMIT) kind = 'gradient';
  else if (roughness >= ROUGHNESS_LIMIT) kind = 'photo';
  else kind = 'complex';

  return {
    kind,
    lab: [cL, cA, cB],
    rgb: { r, g, b },
    colorHex: rgbToHex(r, g, b),
    coverage,
    gentleCoverage,
    noiseP95,
    spread,
    roughness,
    transparentShare,
  };
}
