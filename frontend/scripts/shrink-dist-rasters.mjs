// Post-build: re-encodes oversized rasters in dist/ IN PLACE, keeping every URL and file format
// (so DB rows / printed menus that point at /uploads/x.png keep working) while cutting the
// deployment size. Sources in public/ are never touched. Skips a file if re-encoding is not smaller.
// Usage: node scripts/shrink-dist-rasters.mjs [--dry-run]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(root, 'dist');
const dry = process.argv.includes('--dry-run');
const MIN_BYTES = 200 * 1024; // leave already-small files alone
const MAX_WIDTH = 1920;
const CONCURRENCY = 6;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(png|jpe?g|webp)$/i.test(e.name) && fs.statSync(p).size >= MIN_BYTES) out.push(p);
  }
  return out;
}

async function shrink(file) {
  const input = fs.readFileSync(file);
  const img = sharp(input).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true });
  const ext = path.extname(file).toLowerCase();
  const out = ext === '.png'
    ? await img.png({ palette: true, quality: 90, effort: 7, compressionLevel: 9 }).toBuffer()
    : ext === '.webp'
      ? await img.webp({ quality: 80 }).toBuffer()
      : await img.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  if (out.length >= input.length * 0.95) return { before: input.length, after: input.length, kept: true };
  if (!dry) fs.writeFileSync(file, out);
  return { before: input.length, after: out.length, kept: false };
}

if (!fs.existsSync(DIST)) { console.error('shrink-dist-rasters: dist/ not found'); process.exit(1); }
const files = walk(DIST);
let before = 0, after = 0, changed = 0, i = 0, failed = 0;
async function worker() {
  while (i < files.length) {
    const f = files[i++];
    try {
      const r = await shrink(f);
      before += r.before; after += r.after; if (!r.kept) changed++;
    } catch (e) { failed++; console.warn(`shrink skipped ${path.relative(DIST, f)}: ${e.message}`); }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log(`${dry ? '[dry-run] ' : ''}shrunk ${changed}/${files.length} rasters: ${(before / 1048576).toFixed(0)} MB -> ${(after / 1048576).toFixed(0)} MB${failed ? `, ${failed} skipped` : ''}`);
