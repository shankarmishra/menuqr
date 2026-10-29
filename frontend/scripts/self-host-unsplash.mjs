// One-off/idempotent tool: downloads every images.unsplash.com URL referenced in src/
// at the exact requested width, stores it as WebP under public/img/photos/, and
// rewrites the references to the local file.
// Usage: node scripts/self-host-unsplash.mjs            (apply)
//        node scripts/self-host-unsplash.mjs --dry-run  (list only)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(root, '../backend/package.json'));
const sharp = require('sharp');

const SRC = path.join(root, 'src');
const OUT_DIR = path.join(root, 'public/img/photos');
const dry = process.argv.includes('--dry-run');
const URL_RE = /https:\/\/images\.unsplash\.com\/(photo-[A-Za-z0-9-]+)(\?[^'"`\s)]*)?/g;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(tsx?|css)$/.test(e.name)) out.push(p);
  }
  return out;
}

const files = walk(SRC);
const variants = new Map(); // full url -> { id, width, file }
for (const f of files) {
  const text = fs.readFileSync(f, 'utf-8');
  for (const m of text.matchAll(URL_RE)) {
    const [url, id, query = ''] = m;
    if (/[${}]/.test(url)) continue; // dynamic, handled manually
    const params = new URLSearchParams(query.slice(1));
    const width = Number(params.get('w')) || 800;
    variants.set(url, { id, width, file: `${id}-w${width}.webp` });
  }
}
console.log(`${variants.size} unique URLs, ${new Set([...variants.values()].map((v) => v.id)).size} photos`);
if (dry) process.exit(0);

fs.mkdirSync(OUT_DIR, { recursive: true });
const failed = [];
let done = 0;
for (const [url, v] of variants) {
  const dest = path.join(OUT_DIR, v.file);
  if (fs.existsSync(dest)) { done++; continue; }
  try {
    const src = `https://images.unsplash.com/${v.id}?w=${v.width}&q=80&auto=format&fit=crop&fm=webp`;
    const res = await fetch(src, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    // Normalise to WebP regardless of what the CDN returned.
    await sharp(buf).resize({ width: v.width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(dest);
    done++;
  } catch (e) {
    failed.push(`${url} (${e.message})`);
  }
}
console.log(`downloaded/kept ${done}/${variants.size}`);
if (failed.length) { console.log('FAILED:\n' + failed.join('\n')); process.exit(1); }

let changedFiles = 0;
for (const f of files) {
  let text = fs.readFileSync(f, 'utf-8');
  const next = text.replace(URL_RE, (url) => (variants.has(url) ? `/img/photos/${variants.get(url).file}` : url));
  if (next !== text) { fs.writeFileSync(f, next, 'utf-8'); changedFiles++; }
}
console.log(`rewrote references in ${changedFiles} files`);
