/**
 * Steps 3 of the pipeline: remove a flat background without eating the logo and without halos.
 *
 *  1. Flood fill from the border in OKLab. A pixel joins the background when it is within `tolBg`
 *     of the detected colour, or when it is a small step (`tolStep`) away from the pixel it was
 *     reached from and still within `tolCap` of the colour. The second rule follows JPEG ringing,
 *     soft shadows and gentle gradients without ever crossing a real edge.
 *  2. Specks the fill could not reach (JPEG noise) are dropped.
 *  3. Enclosed background-coloured regions are kept when they are big (a badge interior, an apron)
 *     and punched out when they are small counters of letters. An emblem (one compact main body)
 *     keeps every hole, and bays of the background inside its convex hull, because a white apron
 *     that touches the page is still part of the figure.
 *  4. Edge pixels are unmixed from the background: each one gets the colour of the nearest solid
 *     ink and the coverage that explains how much background it still contains, so an edge that
 *     was anti-aliased against white carries no white once the logo sits on a dark page.
 */
import { toOklabPlanes } from './color.ts';
import type { OklabPlanes, Rgb } from './color.ts';
import { convexHull, labelComponents, rasterizeConvex } from './regions.ts';
import type { RgbaImage } from './types.ts';

export interface CutoutParams {
  tolBg: number;
  tolStep: number;
  tolCap: number;
  keepEnclosed: boolean;
}

export interface CutoutResult {
  image: RgbaImage;
  removedShare: number;
  mode: 'emblem' | 'wordmark' | 'none';
  holesKept: number;
  holesPunched: number;
  bayPixels: number;
  /** 95th percentile delta E between the remaining pixels and the background colour. */
  separation: number;
  /** Nearly everything matched the background: the caller keeps the source image. */
  empty: boolean;
  /** The numbers behind the emblem decision, for tests and the contact sheets. */
  diagnostics: { dominance: number; solidity: number; inkSolidity: number; aspect: number };
}

const MIN_FRINGE_ALPHA = 0.06;
const SOLID_ALPHA = 0.94;
/** Largest distance (8-bit sRGB) between an edge pixel and the line background-to-ink that still counts as a mix of the two. */
const MIX_RESIDUAL = 40;
/** Ink this close to the background (8-bit sRGB distance) cannot be unmixed; the pixel is kept as it is. */
const MIN_INK_DISTANCE = 12;

function floodOutside(
  p: OklabPlanes,
  w: number,
  h: number,
  bg: readonly [number, number, number],
  tolBg: number,
  tolStep: number,
  tolCap: number
): { out: Uint8Array; count: number } {
  const n = w * h;
  const out = new Uint8Array(n);
  const queue = new Int32Array(n);
  let head = 0;
  let tail = 0;
  const { L, A, B } = p;
  const tolBg2 = tolBg * tolBg;
  const tolStep2 = tolStep * tolStep;
  const tolCap2 = tolCap * tolCap;
  const distBg2 = (i: number) => {
    const dl = L[i] - bg[0];
    const da = A[i] - bg[1];
    const db = B[i] - bg[2];
    return dl * dl + da * da + db * db;
  };
  const seed = (i: number) => {
    if (out[i] === 0 && distBg2(i) <= tolBg2) {
      out[i] = 1;
      queue[tail++] = i;
    }
  };
  for (let x = 0; x < w; x++) {
    seed(x);
    seed((h - 1) * w + x);
  }
  for (let y = 1; y < h - 1; y++) {
    seed(y * w);
    seed(y * w + w - 1);
  }
  const push = (cur: number, nb: number) => {
    if (out[nb] !== 0) return;
    const d = distBg2(nb);
    let ok = d <= tolBg2;
    if (!ok && d <= tolCap2) {
      const dl = L[nb] - L[cur];
      const da = A[nb] - A[cur];
      const db = B[nb] - B[cur];
      ok = dl * dl + da * da + db * db <= tolStep2;
    }
    if (ok) {
      out[nb] = 1;
      queue[tail++] = nb;
    }
  };
  while (head < tail) {
    const i = queue[head++];
    const x = i % w;
    if (x > 0) push(i, i - 1);
    if (x < w - 1) push(i, i + 1);
    if (i >= w) push(i, i - w);
    if (i < n - w) push(i, i + w);
  }
  return { out, count: tail };
}

/** Colour of the edge pixels is unmixed from the background; see the file header. */
function refineEdges(input: RgbaImage, out: Uint8Array, bay: Uint8Array, hasBay: boolean, bg: Rgb, bandR: number): Uint8ClampedArray {
  const { width: w, height: h, data } = input;
  const n = w * h;
  const res = new Uint8ClampedArray(data.length);
  res.set(data);

  const layer = new Uint8Array(n);
  const layers: number[][] = [[]];
  const firstLayer: number[] = [];
  // 3 x 3 dilation of the removed area in two separable passes; its rim of ink pixels is layer 1.
  const horizontal = new Uint8Array(n);
  for (let y = 0, row = 0; y < h; y++, row += w) {
    for (let x = 0; x < w; x++) {
      const i = row + x;
      horizontal[i] = out[i] | (x > 0 ? out[i - 1] : 0) | (x < w - 1 ? out[i + 1] : 0);
    }
  }
  for (let y = 0, row = 0; y < h; y++, row += w) {
    for (let x = 0; x < w; x++) {
      const i = row + x;
      if (out[i] !== 0) continue;
      if ((horizontal[i] | (y > 0 ? horizontal[i - w] : 0) | (y < h - 1 ? horizontal[i + w] : 0)) !== 0) {
        layer[i] = 1;
        firstLayer.push(i);
      }
    }
  }
  layers.push(firstLayer);
  for (let d = 2; d <= bandR; d++) {
    const next: number[] = [];
    for (const i of layers[d - 1]) {
      const x = i % w;
      const y = (i - x) / w;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= w) continue;
          const nb = yy * w + xx;
          if (out[nb] === 0 && layer[nb] === 0) {
            layer[nb] = d;
            next.push(nb);
          }
        }
      }
    }
    layers.push(next);
  }

  // Nearest solid ink colour for every edge pixel, propagated from the inside out.
  const fr = new Uint8Array(n);
  const fg = new Uint8Array(n);
  const fb = new Uint8Array(n);
  const known = new Uint8Array(n);
  for (let d = bandR; d >= 1; d--) {
    for (const i of layers[d]) {
      const x = i % w;
      const y = (i - x) / w;
      let best = -1;
      let br = 0;
      let bgc = 0;
      let bb = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          if ((dx === 0 && dy === 0) || xx < 0 || xx >= w) continue;
          const nb = yy * w + xx;
          if (out[nb] !== 0) continue;
          let r: number;
          let g: number;
          let b: number;
          if (layer[nb] === 0) {
            r = data[nb * 4];
            g = data[nb * 4 + 1];
            b = data[nb * 4 + 2];
          } else if (layer[nb] > d && known[nb] === 1) {
            r = fr[nb];
            g = fg[nb];
            b = fb[nb];
          } else continue;
          const dist = (r - bg.r) * (r - bg.r) + (g - bg.g) * (g - bg.g) + (b - bg.b) * (b - bg.b);
          if (dist > best) {
            best = dist;
            br = r;
            bgc = g;
            bb = b;
          }
        }
      }
      if (best >= 0) {
        fr[i] = br;
        fg[i] = bgc;
        fb[i] = bb;
        known[i] = 1;
      }
    }
  }

  const gone: number[] = [];
  for (let d = 1; d <= bandR; d++) {
    for (const i of layers[d]) {
      const j = i * 4;
      const cr = data[j];
      const cg = data[j + 1];
      const cb = data[j + 2];
      let alpha = 1;
      let r = cr;
      let g = cg;
      let b = cb;
      let resolved = false;
      if (known[i] === 1) {
        const ux = fr[i] - bg.r;
        const uy = fg[i] - bg.g;
        const uz = fb[i] - bg.b;
        const uu = ux * ux + uy * uy + uz * uz;
        if (uu < MIN_INK_DISTANCE * MIN_INK_DISTANCE) {
          resolved = true;
        } else {
          const vx = cr - bg.r;
          const vy = cg - bg.g;
          const vz = cb - bg.b;
          let a = (vx * ux + vy * uy + vz * uz) / uu;
          a = a < 0 ? 0 : a > 1 ? 1 : a;
          const rx = vx - a * ux;
          const ry = vy - a * uy;
          const rz = vz - a * uz;
          if (rx * rx + ry * ry + rz * rz <= MIX_RESIDUAL * MIX_RESIDUAL) {
            resolved = true;
            if (a >= SOLID_ALPHA) {
              alpha = 1;
            } else if (a < MIN_FRINGE_ALPHA) {
              alpha = 0;
            } else {
              alpha = a;
              r = fr[i];
              g = fg[i];
              b = fb[i];
            }
          }
        }
      }
      if (!resolved) {
        // Thin strokes have no solid ink next to them: take the smallest coverage that explains the pixel.
        let a = 0;
        const chan = [cr - bg.r, cg - bg.g, cb - bg.b];
        const base = [bg.r, bg.g, bg.b];
        for (let c = 0; c < 3; c++) {
          const v = chan[c] > 0 ? (base[c] < 255 ? chan[c] / (255 - base[c]) : 0) : base[c] > 0 ? -chan[c] / base[c] : 0;
          if (v > a) a = v;
        }
        if (a < MIN_FRINGE_ALPHA) {
          alpha = 0;
        } else if (a >= SOLID_ALPHA) {
          alpha = 1;
        } else {
          alpha = a;
          r = Math.round(bg.r + chan[0] / a);
          g = Math.round(bg.g + chan[1] / a);
          b = Math.round(bg.b + chan[2] / a);
        }
      }
      if (alpha === 0) {
        gone.push(i);
      } else {
        res[j] = r;
        res[j + 1] = g;
        res[j + 2] = b;
        res[j + 3] = alpha >= 1 ? 255 : Math.round(alpha * 255);
      }
    }
  }
  for (let i = 0; i < n; i++) if (out[i] !== 0) res[i * 4 + 3] = 0;
  for (const i of gone) res[i * 4 + 3] = 0;

  // One pixel of feather where a kept bay meets the removed page.
  for (let i = 0; i < n && hasBay; i++) {
    if (bay[i] === 0) continue;
    const x = i % w;
    if ((x > 0 && res[(i - 1) * 4 + 3] === 0) || (x < w - 1 && res[(i + 1) * 4 + 3] === 0) || (i >= w && res[(i - w) * 4 + 3] === 0) || (i < n - w && res[(i + w) * 4 + 3] === 0)) {
      res[i * 4 + 3] = 140;
    }
  }

  // Let transparent pixels next to the ink carry the ink's colour, so scaling never drags in white or black.
  const done = new Uint8Array(n);
  const frontier: number[] = [];
  for (let d = 1; d <= bandR; d++) {
    for (const i of layers[d]) {
      if (res[i * 4 + 3] === 0) continue;
      const x = i % w;
      const y = (i - x) / w;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= w) continue;
          const nb = yy * w + xx;
          if (res[nb * 4 + 3] !== 0 || done[nb] !== 0) continue;
          res[nb * 4] = res[i * 4];
          res[nb * 4 + 1] = res[i * 4 + 1];
          res[nb * 4 + 2] = res[i * 4 + 2];
          done[nb] = 1;
          frontier.push(nb);
        }
      }
    }
  }
  const secondary: number[] = [];
  for (const i of frontier) {
    const x = i % w;
    const y = (i - x) / w;
    for (let dy = -1; dy <= 1; dy++) {
      const yy = y + dy;
      if (yy < 0 || yy >= h) continue;
      for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx;
        if (xx < 0 || xx >= w) continue;
        const nb = yy * w + xx;
        if (res[nb * 4 + 3] !== 0 || done[nb] !== 0) continue;
        res[nb * 4] = res[i * 4];
        res[nb * 4 + 1] = res[i * 4 + 1];
        res[nb * 4 + 2] = res[i * 4 + 2];
        done[nb] = 1;
        secondary.push(nb);
      }
    }
  }
  return res;
}

export function cutOutBackground(
  input: RgbaImage,
  bg: { lab: readonly [number, number, number]; rgb: Rgb },
  params: CutoutParams
): CutoutResult {
  const { width: w, height: h } = input;
  const n = w * h;
  const planes = toOklabPlanes(input.data, n);
  const flood = floodOutside(planes, w, h, bg.lab, params.tolBg, params.tolStep, params.tolCap);
  const out = flood.out;
  let outCount = flood.count;
  const unchanged = (empty: boolean): CutoutResult => ({
    image: input,
    removedShare: 0,
    mode: 'none',
    holesKept: 0,
    holesPunched: 0,
    bayPixels: 0,
    separation: 0,
    empty,
    diagnostics: { dominance: 0, solidity: 0, inkSolidity: 0, aspect: 0 },
  });
  if (outCount === 0) return unchanged(false);
  if (outCount >= n * 0.985) return unchanged(true);

  const distBg2 = (i: number) => {
    const dl = planes.L[i] - bg.lab[0];
    const da = planes.A[i] - bg.lab[1];
    const db = planes.B[i] - bg.lab[2];
    return dl * dl + da * da + db * db;
  };

  // 1. Pieces of ink. Specks (JPEG noise the fill could not reach) are dropped; the biggest piece never is.
  const comps = labelComponents(out, w, h, true, 0);
  let main = 1;
  for (let l = 2; l <= comps.count; l++) if (comps.area[l] > comps.area[main]) main = l;
  const speckMax = Math.min(40, Math.max(3, Math.round(n * 1.5e-5)));
  const isSpeck = new Uint8Array(comps.count + 1);
  let anySpeck = false;
  for (let l = 1; l <= comps.count; l++) {
    if (l !== main && comps.area[l] <= speckMax) {
      isSpeck[l] = 1;
      anySpeck = true;
    }
  }
  if (anySpeck) {
    for (let i = 0; i < n; i++) {
      const l = comps.labels[i];
      if (l !== 0 && isSpeck[l] === 1) {
        out[i] = 1;
        outCount++;
      }
    }
  }
  const inkArea = n - outCount;

  // 2. Is there one compact main body (an emblem)?
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let l = 1; l <= comps.count; l++) {
    if (isSpeck[l] === 1) continue;
    if (comps.minX[l] < minX) minX = comps.minX[l];
    if (comps.minY[l] < minY) minY = comps.minY[l];
    if (comps.maxX[l] > maxX) maxX = comps.maxX[l];
    if (comps.maxY[l] > maxY) maxY = comps.maxY[l];
  }
  const bboxArea = (maxX - minX + 1) * (maxY - minY + 1);

  const rowPoints: [number, number][] = [];
  for (let y = comps.minY[main]; y <= comps.maxY[main]; y++) {
    let lo = -1;
    let hi = -1;
    for (let x = comps.minX[main]; x <= comps.maxX[main]; x++) {
      if (comps.labels[y * w + x] === main) {
        if (lo < 0) lo = x;
        hi = x;
      }
    }
    if (lo >= 0) {
      rowPoints.push([lo, y]);
      if (hi !== lo) rowPoints.push([hi, y]);
    }
  }
  const hull = convexHull(rowPoints);
  const rows = rasterizeConvex(hull, h);
  let hullArea = 0;
  for (let y = 0; y < h; y++) if (rows.hi[y] >= rows.lo[y]) hullArea += rows.hi[y] - rows.lo[y] + 1;
  // Background-coloured pixels the outside fill did not reach: counters, aprons, badge interiors.
  const tolBg2 = params.tolBg * params.tolBg;
  const holeMask = new Uint8Array(n);
  let anyHole = false;
  let bgLikeInMain = 0;
  for (let i = 0; i < n; i++) {
    if (out[i] === 0 && distBg2(i) <= tolBg2) {
      holeMask[i] = 1;
      anyHole = true;
      if (comps.labels[i] === main) bgLikeInMain++;
    }
  }

  // One compact, roundish body with real ink mass is an emblem: it keeps its holes (teeth, a badge
  // interior) and, with enough ink mass, the bays of the page inside its hull. Letters are neither
  // roundish nor massive, so wordmarks never take this path.
  const dominance = comps.area[main] / Math.max(1, inkArea);
  const solidity = comps.area[main] / Math.max(1, hullArea);
  const inkSolidity = (comps.area[main] - bgLikeInMain) / Math.max(1, hullArea);
  const bodyW = comps.maxX[main] - comps.minX[main] + 1;
  const bodyH = comps.maxY[main] - comps.minY[main] + 1;
  const aspect = bodyW / bodyH;
  const emblem = dominance >= 0.45 && solidity >= 0.78 && aspect >= 0.55 && aspect <= 1.8 && hullArea >= 400;
  const fillBays = emblem && inkSolidity >= 0.6;

  let holesKept = 0;
  let holesPunched = 0;
  if (anyHole) {
    const holes = labelComponents(holeMask, w, h, false);
    const keepMin = 0.02 * bboxArea;
    const punch = new Uint8Array(holes.count + 1);
    for (let k = 1; k <= holes.count; k++) {
      const owner = comps.labels[holes.first[k]];
      const keep = params.keepEnclosed && (holes.area[k] >= keepMin || (emblem && owner === main));
      if (keep) holesKept++;
      else {
        punch[k] = 1;
        holesPunched++;
      }
    }
    if (holesPunched > 0) {
      for (let i = 0; i < n; i++) {
        if (holeMask[i] === 1 && punch[holes.labels[i]] === 1) out[i] = 1;
      }
    }
  }

  // 4. Bays of the page inside the emblem's hull belong to the figure (white apron touching the page).
  const bay = new Uint8Array(n);
  let bayPixels = 0;
  if (fillBays && params.keepEnclosed) {
    const rho = Math.max(2, Math.round(0.03 * Math.sqrt(hullArea)));
    const cols = rasterizeConvex(
      hull.map(([x, y]) => [y, x] as [number, number]),
      w
    );
    const cand = new Uint8Array(n);
    let candCount = 0;
    for (let y = Math.max(minY, comps.minY[main]); y <= comps.maxY[main]; y++) {
      const xl = Math.max(comps.minX[main], rows.lo[y] + rho);
      const xr = Math.min(comps.maxX[main], rows.hi[y] - rho);
      for (let x = xl; x <= xr; x++) {
        const i = y * w + x;
        if (out[i] === 1 && y >= cols.lo[x] + rho && y <= cols.hi[x] - rho) {
          cand[i] = 1;
          candCount++;
        }
      }
    }
    if (candCount > 0) {
      const pieces = labelComponents(cand, w, h, false);
      const minPiece = Math.max(30, Math.round(0.012 * comps.area[main]));
      for (let i = 0; i < n; i++) {
        if (cand[i] === 1 && pieces.area[pieces.labels[i]] >= minPiece) {
          out[i] = 0;
          bay[i] = 1;
          bayPixels++;
        }
      }
    }
  }

  // 5. Unmix the edges.
  const bandR = Math.min(4, Math.max(1, Math.round(Math.max(w, h) / 400)));
  const data = refineEdges(input, out, bay, bayPixels > 0, bg.rgb, bandR);

  let transparent = 0;
  let kept = 0;
  for (let i = 0; i < n; i++) {
    if (data[i * 4 + 3] === 0) transparent++;
    else kept++;
  }
  // How far the remaining ink sits from the background colour (sampled: a percentile needs no more).
  const histogram = new Uint32Array(201);
  let sampled = 0;
  const sampleStride = Math.max(1, Math.floor(n / 60000));
  for (let i = 0; i < n; i += sampleStride) {
    if (data[i * 4 + 3] === 0) continue;
    sampled++;
    histogram[Math.min(200, Math.round(Math.sqrt(distBg2(i)) * 200))]++;
  }
  let acc = 0;
  let separation = 0;
  for (let b = 0; b <= 200; b++) {
    acc += histogram[b];
    if (acc >= 0.95 * sampled) {
      separation = b / 200;
      break;
    }
  }
  return {
    image: { width: w, height: h, data },
    removedShare: transparent / n,
    mode: emblem ? 'emblem' : 'wordmark',
    holesKept,
    holesPunched,
    bayPixels,
    separation,
    empty: kept === 0,
    diagnostics: { dominance, solidity, inkSolidity, aspect },
  };
}
