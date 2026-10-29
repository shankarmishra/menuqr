// Renders the public marketing pages with react-dom/server so the prerendered
// HTML contains the real page content (not a hand-written summary).
// Output: dist/.ssr-pages.json, consumed (and removed) by prerender.cjs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outFile = path.join(root, 'dist', '.ssr-pages.json');

const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const pages = {};

try {
  const mod = await vite.ssrLoadModule('/src/ssr-entry.tsx');
  for (const url of mod.ssrPaths) {
    const { html } = mod.render(url);
    // React 19 renders <title>/<meta>/<link>/<script> from <Helmet> inline; lift them into <head>.
    const head = [];
    const body = html
      .replace(/<title>[\s\S]*?<\/title>/, (m) => (head.push(m), ''))
      .replace(/<meta\b[^>]*>/g, (m) => (head.push(m), ''))
      .replace(/<link\b[^>]*rel="canonical"[^>]*>/g, (m) => (head.push(m), ''))
      .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, (m) => (head.push(m), ''));
    if (!head.some((h) => h.startsWith('<title>'))) throw new Error(`No <title> rendered for ${url}`);
    // Marked so main.tsx can drop them once <Helmet> takes over (avoids duplicate tags).
    const marked = head.map((h) => h.replace(/^<(\w+)/, '<$1 data-prerendered'));
    pages[url] = { head: marked.join('\n'), body };
  }
} finally {
  await vite.close();
}

fs.writeFileSync(outFile, JSON.stringify(pages), 'utf-8');
console.log(`SSR rendered ${Object.keys(pages).length} routes`);
