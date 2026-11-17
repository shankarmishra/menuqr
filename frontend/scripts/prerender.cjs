// Writes the static HTML for every public page from the real server-rendered output of
// scripts/ssr-render.mjs, plus empty app shells, 404.html and sitemap.xml.
// There is no hand-written fallback copy: a page that did not render fails the build,
// so stale text or prices can never be published.
const fs = require('fs');
const path = require('path');

const DIST_DIR = path.resolve(__dirname, '../dist');
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');
const SSR_PATH = path.join(DIST_DIR, '.ssr-pages.json');
const DOMAIN = 'https://menusqr.in';

function stop(message) {
  console.error(`prerender.cjs error: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(TEMPLATE_PATH)) stop('dist/index.html not found. Run vite build first.');
if (!fs.existsSync(SSR_PATH)) stop('dist/.ssr-pages.json not found. scripts/ssr-render.mjs must run first.');

const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
const ssrPages = JSON.parse(fs.readFileSync(SSR_PATH, 'utf-8'));
const routes = Object.keys(ssrPages);

// Pages the site cannot ship without. Everything else comes from src/ssr-entry.tsx.
const REQUIRED = ['/', '/plans', '/digital-qr-menu', '/qr-menu-for-restaurants', '/qr-ordering-for-restaurants', '/privacy', '/terms'];
const missing = REQUIRED.filter((route) => !routes.includes(route));
if (missing.length) stop(`these pages were not server-rendered: ${missing.join(', ')}`);

function writeRoute(routePath, html) {
  if (routePath === '/') {
    fs.writeFileSync(TEMPLATE_PATH, html, 'utf-8');
    return;
  }
  const cleanPath = routePath.slice(1);
  const targetDir = path.join(DIST_DIR, cleanPath);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf-8');

  // Also write a direct .html file for Vercel cleanUrls.
  const htmlFilePath = path.join(DIST_DIR, `${cleanPath}.html`);
  fs.mkdirSync(path.dirname(htmlFilePath), { recursive: true });
  fs.writeFileSync(htmlFilePath, html, 'utf-8');
}

for (const route of routes) {
  const { head, body } = ssrPages[route];
  if (!body || !/<h1[\s>]/.test(body)) stop(`${route} rendered without an <h1>`);
  const html = template
    .replace(/<title>.*?<\/title>/gi, '')
    .replace(/<meta name="description" content=".*?" \/>/gi, '')
    .replace('</head>', () => `${head}\n</head>`)
    .replace('<div id="root"></div>', () => `<div id="root">${body}</div>`);
  writeRoute(route, html);
}

// Empty shells for routes the browser renders (app, checkout, login).
const spaRoutes = ['/onboarding', '/purchase/success', '/purchase/details', '/purchase/review', '/signup', '/login', '/app', '/admin', '/bill'];
const cleanSpaTemplate = template.replace(/<div id="root">[\s\S]*?<\/div>/, '<div id="root"></div>');

for (const routePath of spaRoutes) {
  const cleanPath = routePath.slice(1);
  const targetDir = path.join(DIST_DIR, cleanPath);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'index.html'), cleanSpaTemplate, 'utf-8');
  const htmlFilePath = path.join(DIST_DIR, `${cleanPath}.html`);
  fs.mkdirSync(path.dirname(htmlFilePath), { recursive: true });
  fs.writeFileSync(htmlFilePath, cleanSpaTemplate, 'utf-8');
}

// 404.html with noindex.
const html404 = cleanSpaTemplate
  .replace(/<title>.*?<\/title>/gi, '<title>404 - Page Not Found | MenusQR</title>')
  .replace(/<meta name="description" content=".*?" \/>/gi, '<meta name="description" content="The page you requested could not be found." />')
  .replace('</head>', '<meta name="robots" content="noindex, nofollow" />\n</head>')
  .replace(
    '<div id="root"></div>',
    '<div id="root"><main class="max-w-4xl mx-auto px-6 py-20 text-center"><h1 class="text-4xl font-bold text-[#151C19]">404 - Page Not Found</h1><p class="mt-4 text-gray-600">The requested page does not exist on MenusQR.</p><a href="/" class="mt-6 inline-block bg-[#E8783C] text-white px-6 py-3 rounded-full font-bold">Go to Homepage</a></main></div>',
  );
fs.writeFileSync(path.join(DIST_DIR, '404.html'), html404, 'utf-8');

// sitemap.xml is built from the rendered pages, so a new page can never be forgotten.
function sitemapMeta(route) {
  if (route === '/') return { changefreq: 'weekly', priority: '1.0' };
  if (route === '/plans') return { changefreq: 'weekly', priority: '0.9' };
  if (['/privacy', '/terms', '/refund-cancellation'].includes(route)) return { changefreq: 'yearly', priority: '0.3' };
  if (['/about', '/contact', '/faq'].includes(route)) return { changefreq: 'monthly', priority: '0.6' };
  return { changefreq: 'monthly', priority: '0.8' };
}
const today = new Date().toISOString().slice(0, 10);
const indexable = routes.filter((route) => !/name="robots"[^>]*content="noindex/.test(ssrPages[route].head));
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...indexable.map((route) => {
    const { changefreq, priority } = sitemapMeta(route);
    return `  <url>\n    <loc>${DOMAIN}${route}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  }),
  '</urlset>',
  '',
].join('\n');
fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap, 'utf-8');

fs.unlinkSync(SSR_PATH);

console.log(`Prerender complete: ${routes.length} pages, ${indexable.length} in sitemap.xml, ${spaRoutes.length} app shells, 404.html`);
