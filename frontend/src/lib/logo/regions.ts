/**
 * Region helpers: connected-component labelling and convex-hull rasterising on pixel masks.
 */

export interface Components {
  count: number;
  /** 0 = not in the mask, otherwise 1..count. */
  labels: Int32Array;
  /** Per label (index 0 unused). */
  area: Int32Array;
  /** Raster-first pixel of each component. */
  first: Int32Array;
  minX: Int32Array;
  minY: Int32Array;
  maxX: Int32Array;
  maxY: Int32Array;
}

/**
 * Two-pass labelling with union-find. Use 8-connectivity for ink and 4-connectivity for the
 * background-coloured regions inside it (the standard dual pair, so thin diagonal strokes stay in
 * one piece and cannot be leaked through).
 */
export function labelComponents(mask: Uint8Array, w: number, h: number, eight: boolean): Components {
  const n = w * h;
  const labels = new Int32Array(n);
  const parent = new Int32Array((n >> 1) + 2);
  let next = 1;

  const find = (start: number) => {
    let x = start;
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  const union = (a: number, b: number) => {
    const ra = find(a);
    const rb = find(b);
    if (ra === rb) return ra;
    if (ra < rb) {
      parent[rb] = ra;
      return ra;
    }
    parent[ra] = rb;
    return rb;
  };

  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      const i = row + x;
      if (!mask[i]) continue;
      let label = 0;
      const consider = (l: number) => {
        if (l === 0) return;
        label = label === 0 ? l : union(label, l);
      };
      if (x > 0) consider(labels[i - 1]);
      if (y > 0) {
        consider(labels[i - w]);
        if (eight) {
          if (x > 0) consider(labels[i - w - 1]);
          if (x < w - 1) consider(labels[i - w + 1]);
        }
      }
      if (label === 0) {
        label = next;
        parent[next] = next;
        next++;
      }
      labels[i] = label;
    }
  }

  const remap = new Int32Array(next);
  let count = 0;
  for (let l = 1; l < next; l++) {
    const root = find(l);
    if (remap[root] === 0) remap[root] = ++count;
    remap[l] = remap[root];
  }

  const area = new Int32Array(count + 1);
  const first = new Int32Array(count + 1).fill(-1);
  const minX = new Int32Array(count + 1).fill(w);
  const minY = new Int32Array(count + 1).fill(h);
  const maxX = new Int32Array(count + 1).fill(-1);
  const maxY = new Int32Array(count + 1).fill(-1);
  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      const i = row + x;
      const raw = labels[i];
      if (raw === 0) continue;
      const l = remap[raw];
      labels[i] = l;
      area[l]++;
      if (first[l] < 0) first[l] = i;
      if (x < minX[l]) minX[l] = x;
      if (x > maxX[l]) maxX[l] = x;
      if (y < minY[l]) minY[l] = y;
      if (y > maxY[l]) maxY[l] = y;
    }
  }
  return { count, labels, area, first, minX, minY, maxX, maxY };
}

type Point = [number, number];

function cross(o: Point, a: Point, b: Point): number {
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
}

/** Andrew's monotone chain; returns the hull in order. */
export function convexHull(points: Point[]): Point[] {
  const pts = points.slice().sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  if (pts.length <= 2) return pts;
  const lower: Point[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: Point[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

/**
 * Per-row x interval [lo, hi] covered by a convex polygon, for rows 0..rows-1 (lo > hi marks an
 * empty row). Used to test "is this pixel inside the hull" without a per-pixel polygon test.
 */
export function rasterizeConvex(poly: Point[], rows: number): { lo: Int32Array; hi: Int32Array } {
  const lo = new Int32Array(rows).fill(1 << 30);
  const hi = new Int32Array(rows).fill(-(1 << 30));
  const count = poly.length;
  for (let i = 0; i < count; i++) {
    const [x0, y0] = poly[i];
    const [x1, y1] = poly[(i + 1) % count];
    const yStart = Math.max(0, Math.ceil(Math.min(y0, y1)));
    const yEnd = Math.min(rows - 1, Math.floor(Math.max(y0, y1)));
    for (let y = yStart; y <= yEnd; y++) {
      const x = y1 === y0 ? Math.min(x0, x1) : x0 + ((y - y0) * (x1 - x0)) / (y1 - y0);
      const xHi = y1 === y0 ? Math.max(x0, x1) : x;
      const a = Math.floor(Math.min(x, xHi));
      const b = Math.ceil(Math.max(x, xHi));
      if (a < lo[y]) lo[y] = a;
      if (b > hi[y]) hi[y] = b;
    }
  }
  return { lo, hi };
}
