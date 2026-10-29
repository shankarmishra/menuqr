// Adds decoding="async" + loading="lazy" (below-the-fold) and width/height (when the src is a
// static file in public/) to every <img> in src/**/*.tsx. Safe to re-run: existing attrs are kept.
// Usage: node scripts/img-attrs-codemod.mjs [--dry-run]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(root, '../backend/package.json'));
const sharp = require('sharp');
const SRC = path.join(root, 'src');
const PUBLIC = path.join(root, 'public');
const dry = process.argv.includes('--dry-run');

// Above-the-fold files: keep eager loading (LCP / header logos).
const EAGER = [/hero-v2[\/]/, /HeroScene\.tsx$/, /HeroCopy\.tsx$/, /PublicHomePage\.tsx$/, /layouts[\/]/, /AdminLogin\.tsx$/];
const BACKSLASH = String.fromCharCode(92);
const dimCache = new Map();
async function dims(rel) {
  if (dimCache.has(rel)) return dimCache.get(rel);
  const file = path.join(PUBLIC, rel);
  let d = null;
  if (/\.(png|jpe?g|webp|avif|gif)$/i.test(rel) && fs.existsSync(file)) {
    const m = await sharp(file).metadata();
    if (m.width && m.height) d = [m.width, m.height];
  }
  dimCache.set(rel, d);
  return d;
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.tsx') && !e.name.endsWith('.test.tsx')) out.push(p);
  }
  return out;
}

// Find the end index of a JSX opening tag starting at `start` (handles {...} and quotes).
function tagEnd(s, start) {
  let depth = 0, quote = null;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (quote) { if (c === quote && s[i - 1] !== BACKSLASH) quote = null; continue; }
    if (depth === 0 && (c === '"' || c === "'")) { quote = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') depth--;
    else if (depth > 0 && (c === '"' || c === "'" || c === '`')) { quote = c; }
    else if (depth === 0 && c === '>') return i;
  }
  return -1;
}

let touched = 0, imgs = 0, withDims = 0, lazyAdded = 0;
for (const file of walk(SRC)) {
  let s = fs.readFileSync(file, 'utf-8');
  const eager = EAGER.some((re) => re.test(file));
  let out = '', pos = 0, changed = false;
  for (let i = s.indexOf('<img', pos); i !== -1; i = s.indexOf('<img', pos)) {
    const next = s[i + 4];
    if (next !== ' ' && next !== '\n' && next !== '\r' && next !== '\t') { out += s.slice(pos, i + 4); pos = i + 4; continue; }
    const end = tagEnd(s, i + 4);
    if (end === -1) break;
    imgs++;
    const selfClose = s[end - 1] === '/';
    const bodyEnd = selfClose ? end - 1 : end;
    let tag = s.slice(i, bodyEnd);
    const add = [];
    if (!/\sdecoding=/.test(tag)) add.push('decoding="async"');
    if (!eager && !/\sloading=/.test(tag)) { add.push('loading="lazy"'); lazyAdded++; }
    if (!/\swidth=/.test(tag) && !/\sheight=/.test(tag)) {
      const m = tag.match(/\ssrc=(?:"([^"]+)"|'([^']+)'|\{\s*["'`]([^"'`$]+)["'`]\s*\})/);
      const src = m && (m[1] || m[2] || m[3]);
      if (src && src.startsWith('/')) {
        const d = await dims(src.split('?')[0]);
        if (d) { add.push(`width={${d[0]}}`, `height={${d[1]}}`); withDims++; }
      }
    }
    if (add.length) {
      const multiline = /\n/.test(tag);
      const indent = multiline ? (tag.match(/\n([ \t]+)\S/) || [, '  '])[1] : ' ';
      tag = tag.replace(/\s*$/, '') + (multiline ? add.map((a) => `\n${indent}${a}`).join('') + '\n' + indent.slice(2) : ' ' + add.join(' ') + ' ');
      changed = true;
    }
    out += s.slice(pos, i) + tag + s.slice(bodyEnd, end + 1);
    pos = end + 1;
  }
  out += s.slice(pos);
  if (changed) { touched++; if (!dry) fs.writeFileSync(file, out, 'utf-8'); }
}
console.log(`${imgs} <img> tags scanned; ${touched} files ${dry ? 'would change' : 'changed'}; +lazy ${lazyAdded}; +dimensions ${withDims}`);
