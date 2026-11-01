// QA-2: realistic synthetic fixtures (Excel workbook, photos, logos, link values). Everything is generated; nothing is
// copied from a customer. Real client logos are only REFERENCED from docs/reference-assets (local, never committed).
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { frontendRoot, outDir, realLogoDir, urls } from './gate-env.mjs';
import { buildMenu, SOCIAL_VALUES } from './menu-data.mjs';

const requireFromFrontend = createRequire(join(frontendRoot, 'package.json'));

const PALETTES = [
  ['#7a2e0e', '#e8a34a'], ['#1f4d2b', '#9bd17f'], ['#5b1a1a', '#e27d60'], ['#3b2a6b', '#c9a7ff'], ['#124559', '#a9d6e5'], ['#6b4f12', '#f2d479'],
  ['#2d2d2d', '#d9d9d9'], ['#7c2d52', '#f4a6c6'], ['#14532d', '#fde68a'], ['#7f1d1d', '#fecaca'], ['#0b3d3a', '#9be7d8'], ['#4a2c0f', '#f3c892'],
];

function dishSvg(slot) {
  const [dark, light] = PALETTES[slot % PALETTES.length];
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="0 0 960 720">
  <defs><radialGradient id="g" cx="50%" cy="45%" r="75%"><stop offset="0%" stop-color="${light}"/><stop offset="100%" stop-color="${dark}"/></radialGradient></defs>
  <rect width="960" height="720" fill="url(#g)"/>
  <circle cx="480" cy="372" r="250" fill="#f7f1e6"/><circle cx="480" cy="372" r="210" fill="${dark}" opacity="0.88"/>
  <circle cx="420" cy="330" r="62" fill="${light}"/><circle cx="548" cy="402" r="74" fill="${light}" opacity="0.9"/><circle cx="470" cy="450" r="40" fill="#f7f1e6" opacity="0.85"/>
</svg>`);
}

function logoSvg(kind) {
  if (kind === 'wordmark') {
    return Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="900" height="300" viewBox="0 0 900 300"><rect x="30" y="100" width="840" height="100" rx="12" fill="#b45309"/><rect x="60" y="130" width="300" height="40" fill="#fff7ed"/><circle cx="780" cy="150" r="30" fill="#fff7ed"/></svg>');
  }
  if (kind === 'badge') {
    return Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><rect width="800" height="800" fill="#000"/><circle cx="400" cy="400" r="300" fill="none" stroke="#d4af37" stroke-width="22"/><circle cx="400" cy="400" r="210" fill="#d4af37"/><rect x="330" y="330" width="140" height="140" fill="#000"/></svg>');
  }
  if (kind === 'white-box') {
    return Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="700" height="700" viewBox="0 0 700 700"><rect width="700" height="700" fill="#fff"/><path d="M350 120 L560 520 L140 520 Z" fill="#0f766e"/><circle cx="350" cy="400" r="60" fill="#fff"/></svg>');
  }
  return Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#be123c"/></svg>');
}

async function writeImage(sharp, svg, file, format) {
  const pipeline = sharp(svg);
  if (format === 'jpg') await pipeline.flatten({ background: '#ffffff' }).jpeg({ quality: 84 }).toFile(file);
  else await pipeline.png().toFile(file);
}

/**
 * @returns {Promise<{dir:string, workbook:string, expected:object, photos:string[], logos:Record<string,string>, realLogos:string[], social:string}>}
 */
export async function buildFixtures({ outRoot = outDir(), photoBase = `${urls().api}/uploads/gate` } = {}) {
  const sharp = requireFromFrontend('sharp');
  const XLSX = requireFromFrontend('xlsx');
  const dir = join(outRoot, 'fixtures');
  const logosDir = join(dir, 'logos');
  const photosDir = join(dir, 'photos');
  const uploadsDir = join(outRoot, 'runtime', 'backend-cwd', 'uploads', 'gate'); // served by the backend as /uploads/gate/*
  for (const d of [dir, logosDir, photosDir, uploadsDir]) mkdirSync(d, { recursive: true });

  const photos = [];
  for (let slot = 0; slot < 12; slot++) {
    const name = `photo-${slot}.jpg`;
    await writeImage(sharp, dishSvg(slot), join(photosDir, name), 'jpg');
    await writeImage(sharp, dishSvg(slot), join(uploadsDir, name), 'jpg');
    photos.push(join(photosDir, name));
  }

  const logos = {
    wordmark: join(logosDir, 'synthetic-wordmark-transparent.png'),
    badge: join(logosDir, 'synthetic-badge-on-black.jpg'),
    whiteBox: join(logosDir, 'synthetic-mark-in-white-box.jpg'),
    tiny: join(logosDir, 'synthetic-tiny-64px.png'),
    notAnImage: join(logosDir, 'not-an-image.png'),
    huge: join(logosDir, 'synthetic-huge-6000px.png'),
  };
  await writeImage(sharp, logoSvg('wordmark'), logos.wordmark, 'png');
  await writeImage(sharp, logoSvg('badge'), logos.badge, 'jpg');
  await writeImage(sharp, logoSvg('white-box'), logos.whiteBox, 'jpg');
  await writeImage(sharp, logoSvg('tiny'), logos.tiny, 'png');
  writeFileSync(logos.notAnImage, 'This is plain text pretending to be a PNG logo.\n');
  await sharp({ create: { width: 6000, height: 6000, channels: 3, background: '#335577' } }).png({ compressionLevel: 9 }).toFile(logos.huge);

  const realDir = realLogoDir();
  const realLogos = realDir && existsSync(realDir)
    ? readdirSync(realDir).filter((f) => /\.(png|jpe?g|webp|svg)$/i.test(f)).map((f) => join(realDir, f))
    : [];

  // The workbook, in the format frontend/src/utils/excelMenuParser.ts accepts.
  const menu = buildMenu();
  const header = ['Category', 'Item Name', 'Description', 'Price', 'Half Price', 'Full Price', 'Veg/Non-Veg', 'Available', 'Image URL', 'Bestseller'];
  const rows = [header];
  for (const item of menu.items) {
    const split = item.halfPrice != null;
    rows.push([
      item.categoryName,
      item.name,
      item.description || '',
      split ? null : item.price,
      split ? item.halfPrice : null,
      split ? item.fullPrice : null,
      item.diet === 'non-veg' ? 'Non-Veg' : item.diet === 'vegan' ? 'Vegan' : 'Veg',
      'Yes',
      item.hasPhoto ? `${photoBase}/photo-${item.photoSlot}.jpg` : '',
      item.bestseller ? 'Yes' : '',
    ]);
  }
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), 'Menu');
  const workbookPath = join(dir, 'menu-220-dishes.xlsx');
  writeFileSync(workbookPath, XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));

  const expected = {
    dishes: menu.items.length,
    categories: menu.categories.length,
    missingPrice: menu.items.filter((i) => i.price == null).length,
    halfFull: menu.items.filter((i) => i.halfPrice != null).length,
    withPhoto: menu.items.filter((i) => i.hasPhoto).length,
    withoutPhoto: menu.items.filter((i) => !i.hasPhoto).length,
    devanagariNames: menu.items.filter((i) => /[ऀ-ॿ]/.test(i.name)).length,
    longestDescription: Math.max(...menu.items.map((i) => i.description.length)),
    descriptionsOver500: menu.items.filter((i) => i.description.length > 500).length,
    dietCounts: menu.items.reduce((m, i) => ((m[i.diet] = (m[i.diet] || 0) + 1), m), {}),
    highestPrice: Math.max(...menu.items.map((i) => i.price || 0)),
    parserCheck: 'not run',
  };

  // Round-trip through the REAL parser (Node strips the TypeScript types).
  try {
    const parser = await import(pathToFileURL(join(frontendRoot, 'src', 'utils', 'excelMenuParser.ts')).href);
    const { readFileSync } = await import('node:fs');
    const file = new File([readFileSync(workbookPath)], 'menu-220-dishes.xlsx');
    const parsed = await parser.parseExcelMenuFile(file);
    expected.parserCheck = {
      dishes: parsed.summary.totalDishes,
      categories: parsed.summary.categoriesCount,
      dualPrice: parsed.summary.dualPriceCount,
      zeroPrice: parsed.items.filter((i) => !(i.price > 0)).length,
      nonVeg: parsed.summary.nonVegCount,
    };
  } catch (error) {
    expected.parserCheck = `could not import the TypeScript parser in Node: ${error instanceof Error ? error.message : error}`;
  }
  writeFileSync(join(dir, 'menu-220-dishes.expected.json'), JSON.stringify(expected, null, 2));
  const social = join(dir, 'social-values.json');
  writeFileSync(social, JSON.stringify(SOCIAL_VALUES, null, 2));
  return { dir, workbook: workbookPath, expected, photos, logos, realLogos, social };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const result = await buildFixtures();
  console.log(`[fixtures] ${result.dir}`);
  console.log(`[fixtures] workbook ${result.workbook}`);
  console.log('[fixtures] expected', JSON.stringify(result.expected));
  console.log(`[fixtures] real logos found: ${result.realLogos.length}`);
}
