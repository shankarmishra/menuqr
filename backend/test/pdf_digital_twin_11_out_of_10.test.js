import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { extractImagesFromPdf, generateMonogramLogo } from '../pdfImageExtractor.js';
import { resolveDishImage } from '../culinaryImageService.js';
import { extractMenuFromPdf } from '../pdfMenuService.js';

// Helper to construct a minimal valid PDF buffer with text
function createSamplePdf(title = 'The Blue Orchid Cafe', lines = ['Starters', 'Crispy Paneer Tikka 220', 'Butter Chicken 380', 'Cold Coffee 120']) {
  const content = lines.map((l) => `(${l}) Tj T*`).join(' ');
  const stream = `BT /F1 14 Tf 50 720 Td (${title}) Tj T* /F1 11 Tf ${content} ET`;
  const streamLen = Buffer.byteLength(stream);

  const raw = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length ${streamLen} >>
stream
${stream}
endstream
endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
00000000115 00000 n 
00000000227 00000 n 
00000000300 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
450
%%EOF`;
  return Buffer.from(raw);
}

test('11/10 Digital Twin - Logo Generator creates crisp vector monogram when no raster logo in PDF', async () => {
  const logoUrl = await generateMonogramLogo({
    restaurantName: 'Blue Orchid Bistro',
    primaryColor: '#1A365D',
    accentColor: '#D69E2E',
    backgroundColor: '#FFFFFF',
    tenantId: 'test_tenant_orchid',
  });

  assert.ok(typeof logoUrl === 'string');
  assert.ok(logoUrl.startsWith('/uploads/logos/'));
  assert.ok(logoUrl.endsWith('.svg'));

  const diskPath = path.join(process.cwd(), logoUrl);
  assert.ok(fs.existsSync(diskPath));
  const svgContent = fs.readFileSync(diskPath, 'utf-8');
  assert.ok(svgContent.includes('BO')); // Blue Orchid initials
  assert.ok(svgContent.includes('#1A365D'));
  assert.ok(svgContent.includes('#D69E2E'));
});

test('11/10 Digital Twin - Culinary Dish Photo Resolver matches appetizing studio photos across cuisines', () => {
  // North Indian
  const biryaniImg = resolveDishImage('Hyderabadi Dum Biryani', 'Rice & Biryani');
  assert.ok(biryaniImg && biryaniImg.startsWith('http'));

  const paneerImg = resolveDishImage('Paneer Butter Masala', 'Main Course');
  assert.ok(paneerImg && paneerImg.startsWith('http'));

  // Cafe & Fast Food
  const pizzaImg = resolveDishImage('Margherita Stone Baked Pizza', 'Pizzas');
  assert.ok(pizzaImg && pizzaImg.startsWith('http'));

  const burgerImg = resolveDishImage('Gourmet Crispy Chicken Burger', 'Burgers');
  assert.ok(burgerImg && burgerImg.startsWith('http'));

  const coffeeImg = resolveDishImage('Hazelnut Cold Coffee Frappe', 'Beverages');
  assert.ok(coffeeImg && coffeeImg.startsWith('http'));

  // Pan Asian
  const momoImg = resolveDishImage('Steamed Darjeeling Veg Momos', 'Chinese');
  assert.ok(momoImg && momoImg.startsWith('http'));

  // Desserts
  const gulabImg = resolveDishImage('Hot Gulab Jamun with Rabri', 'Desserts');
  assert.ok(gulabImg && gulabImg.startsWith('http'));

  // Generic fallback still returns a high quality gourmet dish visual
  const exoticImg = resolveDishImage('Chef Secret Specialty Formula 9', 'Specials');
  assert.ok(exoticImg && exoticImg.startsWith('http'));
});

test('11/10 Digital Twin - End-to-End PDF Extraction generates bespoke theme, logo, and dish photos', async () => {
  const samplePdf = createSamplePdf('Ambrosia Continental Kitchen', [
    'Artisan Pizzas',
    'Farmhouse Veg Pizza 350',
    'Peri Peri Fries 160',
    'Creamy Alfredo Pasta 320',
    'Gourmet Burgers',
    'Smoky BBQ Burger 280',
    'Iced Caramel Latte 190',
  ]);

  const result = await extractMenuFromPdf(samplePdf, {
    filename: 'Ambrosia_Continental_Kitchen.pdf',
    tenantId: 'tenant_ambrosia_88',
  });

  assert.equal(result.success, true);
  assert.ok(result.restaurant.name.includes('Ambrosia'));
  assert.ok(result.restaurant.logo, 'Restaurant MUST have a resolved logo');
  assert.ok(result.restaurant.logo.startsWith('/uploads/logos/'));

  // Design Specification MUST NOT be Mannat Tandoori Junction!
  assert.notEqual(result.designSpec.composition, 'heritage-artboard');
  assert.ok(['image-showcase', 'compact-bistro', 'editorial', 'chalkboard-artboard', 'parametric-artboard'].includes(result.designSpec.composition));
  assert.notEqual(result.designSpec.themeId, 'pdf-bespoke-theme', 'Must never use the legacy MTJ hijack themeId');
  assert.ok(result.designSpec.themeId.startsWith('bespoke-'));

  // All extracted menu items MUST have appetizing dish photos attached
  assert.ok(result.categories.length > 0);
  for (const cat of result.categories) {
    for (const item of cat.items) {
      assert.ok(item.imageUrl, `Item ${item.name} must have an imageUrl`);
      assert.ok(item.image, `Item ${item.name} must have an image property`);
    }
  }
});

test('11/10 Digital Twin - Real Fixture Extraction (01_designed_cafe_multicolumn.pdf)', async () => {
  const fixturePath = path.resolve('test-fixtures/pdf-menus/01_designed_cafe_multicolumn.pdf');
  const buffer = fs.readFileSync(fixturePath);

  const result = await extractMenuFromPdf(buffer, {
    filename: '01_designed_cafe_multicolumn.pdf',
    tenantId: 'tenant_fixture_cafe',
  });

  assert.equal(result.success, true);
  assert.ok(result.restaurant.logo, 'Must have logo extracted or generated');
  assert.notEqual(result.designSpec.composition, 'heritage-artboard', 'Cafe must never be forced into MTJ');
  assert.ok(result.categories.length > 0);
  for (const cat of result.categories) {
    for (const item of cat.items) {
      assert.ok(item.imageUrl, `Item ${item.name} must have an imageUrl`);
    }
  }
});

