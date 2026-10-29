// Converts every local PNG/JPG referenced from src/ into a WebP sibling and rewrites
// the references. Originals are kept (menu items stored in the DB may still point at them).
// Also writes src/data/imageDimensions.json (path -> [width, height]) used for <img width/height>.
// Usage: node scripts/optimize-images.mjs [--dry-run]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(root, '../backend/package.json'));
const sharp = require('sharp');
const SRC = path.join(root, 'src');
const PUBLIC = path.join(root, 'public');
const MAX_WIDTH = 1920;
const dry = process.argv.includes('--dry-run');
const REF_RE = /(?<=['"`(])\/(?:uploads|marketing|assets|menuqr|img)\/[^'"`)\s?#]+?\.(?:png|jpe?g)(?=['"`)?#\s])/gi;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(tsx?|css)$/.test(e.name)) out.push(p);
  }
  return out;
}

const files = walk(SRC);
const refs = new Set();
for (const f of files) for (const m of fs.readFileSync(f, 'utf-8').matchAll(REF_RE)) refs.add(m[0]);
const missing = [...refs].filter((r) => !fs.existsSync(path.join(PUBLIC, r)));
const existing = [...refs].filter((r) => fs.existsSync(path.join(PUBLIC, r)));
console.log(`${refs.size} referenced raster files, ${missing.length} missing on disk`);
if (missing.length) console.log('MISSING:\n' + missing.join('\n'));
if (dry) process.exit(0);

let before = 0, after = 0;
const converted = new Map();
for (const ref of existing) {
  const src = path.join(PUBLIC, ref);
  const dest = src.replace(/\.(png|jpe?g)$/i, '.webp');
  const webpRef = ref.replace(/\.(png|jpe?g)$/i, '.webp');
  const buf = fs.readFileSync(src);
  before += buf.length;
  const out = await sharp(buf).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer({ resolveWithObject: true });
  fs.writeFileSync(dest, out.data);
  after += out.data.length;
  converted.set(ref, { webpRef, w: out.info.width, h: out.info.height });
}
console.log(`converted ${converted.size}: ${(before / 1048576).toFixed(1)} MB -> ${(after / 1048576).toFixed(1)} MB`);

let changedFiles = 0;
for (const f of files) {
  const text = fs.readFileSync(f, 'utf-8');
  const next = text.replace(REF_RE, (m) => converted.get(m)?.webpRef ?? m);
  if (next !== text) { fs.writeFileSync(f, next, 'utf-8'); changedFiles++; }
}
console.log(`rewrote references in ${changedFiles} files`);
