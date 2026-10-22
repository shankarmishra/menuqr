import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validatePdfBuffer,
  inspectPdf,
  deterministicPdfExtraction,
  extractMenuFromPdf,
  refinePdfDesign,
} from '../pdfMenuService.js';
import { validateDesignSpecification } from '../designSpecValidator.js';

// Helper to construct a minimal valid PDF buffer for testing
function createMinimalPdf(textContent = 'Royal Punjab Dhaba\nStarters\nPaneer Tikka 220\nTandoori Chicken Half 240 Full 450\nDal Makhani 180 / 320') {
  const safeLines = textContent.split('\n').map(l => l.replace(/[()\\]/g, ''));
  const contentStream = `BT /F1 12 Tf 50 700 Td ` + safeLines.map(line => `(${line}) Tj T*`).join(' ') + ` ET`;
  const streamLength = Buffer.byteLength(contentStream);

  const pdfString = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${contentStream}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000227 00000 n 
0000000300 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
400
%%EOF`;

  return Buffer.from(pdfString);
}

test('PDF Security & Validation - Rejects Non-PDF Magic Bytes', () => {
  const fakePng = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const checkPng = validatePdfBuffer(fakePng);
  assert.equal(checkPng.isValid, false);
  assert.match(checkPng.error, /File is not a valid PDF document/);

  const htmlBuffer = Buffer.from('<!DOCTYPE html><html><body>Dangerous Script</body></html>');
  const checkHtml = validatePdfBuffer(htmlBuffer);
  assert.equal(checkHtml.isValid, false);
  assert.match(checkHtml.error, /File is not a valid PDF document/);
});

test('PDF Security & Validation - Rejects Oversized Files', () => {
  const fakeBigBuffer = Buffer.alloc(26 * 1024 * 1024);
  fakeBigBuffer.write('%PDF-1.4', 0);
  const check = validatePdfBuffer(fakeBigBuffer);
  assert.equal(check.isValid, false);
  assert.match(check.error, /exceeds maximum allowed size/);
});

test('PDF Security & Validation - Accepts Valid PDF Signature', () => {
  const validBuffer = createMinimalPdf();
  const check = validatePdfBuffer(validBuffer);
  assert.equal(check.isValid, true);
  assert.equal(check.error, undefined);
});

test('PDF Inspector - Extracts Page Count and Selectable Text', async () => {
  const pdfBuffer = createMinimalPdf('Starters\nPaneer Tikka 220\nTandoori Chicken 350');
  const inspection = await inspectPdf(pdfBuffer);

  assert.equal(typeof inspection.pageCount, 'number');
  assert.ok(inspection.pageCount >= 1);
  assert.equal(typeof inspection.isScanned, 'boolean');
  assert.equal(typeof inspection.rawText, 'string');
});

test('Deterministic PDF Fallback - Extracts Categories and Dishes', () => {
  const sampleMenuText = `
Bawarchi Biryani House
Authentic Hyderabadi Flavors

Starters & Appetizers
Paneer 65 - 190
Crispy Veg Spring Rolls 160
Chicken 65 (Spicy) 240
Fish Amritsari 320

Main Course
Paneer Butter Masala 260
Dal Makhani Special 220
Hyderabadi Chicken Dum Biryani Half 180 Full 340
Mutton Rogan Josh 420

Desserts
Gulab Jamun with Rabdi 90
`;

  const result = deterministicPdfExtraction(sampleMenuText, 'bawarchi_menu.pdf', {
    pageCount: 1,
    isScanned: false,
  });

  assert.ok(result);
  assert.ok(result.categories.length >= 2, 'Should detect at least 2 categories');
  
  // Verify category names
  const catNames = result.categories.map(c => c.name.toLowerCase());
  assert.ok(catNames.some(c => c.includes('starter') || c.includes('appetizer')));
  assert.ok(catNames.some(c => c.includes('main')));

  // Verify dishes and pricing
  const allDishes = result.categories.flatMap(c => c.items);
  assert.ok(allDishes.length >= 5, 'Should extract multiple dishes');

  // Find Paneer 65
  const paneer65 = allDishes.find(d => d.name.toLowerCase().includes('paneer 65'));
  assert.ok(paneer65, 'Paneer 65 should be extracted');
  assert.equal(paneer65.price, 190);
  assert.equal(paneer65.dietType, 'veg');

  // Find Chicken 65
  const chicken65 = allDishes.find(d => d.name.toLowerCase().includes('chicken 65'));
  assert.ok(chicken65, 'Chicken 65 should be extracted');
  assert.equal(chicken65.price, 240);
  assert.equal(chicken65.dietType, 'non-veg');

  // Verify Half/Full variant pairing
  const biryani = allDishes.find(d => d.name.toLowerCase().includes('biryani'));
  assert.ok(biryani, 'Biryani should be extracted');
  assert.equal(biryani.halfPrice, 180);
  assert.equal(biryani.fullPrice, 340);
  assert.ok(biryani.variants && biryani.variants.length === 2);
  assert.equal(biryani.variants[0].name, 'Half');
  assert.equal(biryani.variants[0].price, 180);
  assert.equal(biryani.variants[1].name, 'Full');
  assert.equal(biryani.variants[1].price, 340);

  // Verify design specification synthesis
  assert.ok(result.designSpec);
  assert.ok(result.designSpec.colors.bg);
  assert.ok(result.designSpec.colors.heading);
  assert.ok(result.designSpec.typography.headingFont);
  assert.ok(validateDesignSpecification(result.designSpec));
});

test('Deterministic PDF Fallback - Slash-separated Half/Full Price Pairing (180 / 320)', () => {
  const menuText = `
Main Course
Kadai Paneer 180 / 320
Butter Chicken 240 / 440
`;

  const result = deterministicPdfExtraction(menuText, 'portions.pdf', {
    pageCount: 1,
    isScanned: false,
  });

  const dishes = result.categories.flatMap(c => c.items);
  const kadai = dishes.find(d => d.name.toLowerCase().includes('kadai paneer'));
  assert.ok(kadai);
  assert.equal(kadai.halfPrice, 180);
  assert.equal(kadai.fullPrice, 320);
  assert.equal(kadai.price, 320);
  assert.equal(kadai.variants?.length, 2);
});

test('Multilingual Text Preservation - Indian Devanagari Scripts & Currency', () => {
  const hindiMenuText = `
शाही दावत रेस्टोरेंट
राजसी स्वाद की परंपरा

विशेष शुरुआत
पनीर टिक्का ₹240
तंदूरी चिकन ₹380

मुख्य भोजन
दाल मखनी ₹190
कड़ाही पनीर हाफ 170 फुल 310
`;

  const result = deterministicPdfExtraction(hindiMenuText, 'hindi_menu.pdf', {
    pageCount: 1,
    isScanned: false,
  });

  assert.ok(result);
  const allDishes = result.categories.flatMap(c => c.items);
  
  // Verify Hindi dish names are preserved without mojibake or corrupt encoding
  const paneer = allDishes.find(d => d.name.includes('पनीर'));
  assert.ok(paneer, 'Hindi dish name पनीर टिक्का must be preserved intact');
  assert.equal(paneer.price, 240);
  assert.equal(paneer.dietType, 'veg');

  const dal = allDishes.find(d => d.name.includes('दाल'));
  assert.ok(dal, 'Hindi dish name दाल मखनी must be preserved');
  assert.equal(dal.price, 190);
});

test('PDF Pipeline Orchestration - extractMenuFromPdf with Validation and Specs', async () => {
  const pdfBuffer = createMinimalPdf();
  const result = await extractMenuFromPdf({
    buffer: pdfBuffer,
    filename: 'royal_dhaba.pdf',
    tenantId: 'test-tenant-orch'
  });

  assert.ok(result);
  assert.ok(Array.isArray(result.categories));
  assert.ok(result.restaurant);
  assert.ok(result.designSpec);
  assert.ok(['gemini', 'deterministic-fallback'].includes(result.provider));
  assert.ok(typeof result.pageCount === 'number');
  assert.ok(validateDesignSpecification(result.designSpec));
});

test('Design Refinement - refinePdfDesign Updates Colors & Typography Safely', async () => {
  const initialSpec = {
    version: '1.0',
    composition: 'editorial',
    colors: {
      bg: '#121212',
      surface: '#1E1E1E',
      text: '#F5F5F5',
      heading: '#D4AF37',
      accent: '#E8783C',
      border: '#2E2E2E',
      muted: '#888888',
      price: '#D4AF37'
    },
    typography: {
      headingFont: 'Playfair Display',
      bodyFont: 'Plus Jakarta Sans',
      fontScale: 'classic'
    },
    spacing: {
      density: 'spacious',
      cardGap: 'gap-6',
      sectionGap: 'py-10'
    },
    decorations: {
      divider: 'gold-line',
      cardBorder: 'subtle',
      shadow: 'soft',
      texture: 'clean'
    },
    items: {
      layout: 'two-column',
      showImages: true,
      cardStyle: 'bordered',
      priceStyle: 'right-aligned'
    }
  };

  const refined = await refinePdfDesign({
    previousSpec: initialSpec,
    prompt: 'Change theme to dark emerald green with champagne gold accents and rounded modern cards',
    tenantId: 'test-tenant-refine'
  });

  assert.ok(refined);
  assert.ok(refined.spec);
  assert.equal(refined.spec.version, '1.0');
  assert.ok(refined.spec.colors.bg);
  assert.ok(refined.spec.colors.heading);
  assert.ok(validateDesignSpecification(refined.spec));
});
