import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectColumnMappings,
  parsePrice,
  parseDietType,
  parseBool,
  validateAndPreviewImport
} from '../menuImporter.js';

test('Smart Excel Importer Unit & Validation Test Suite', async (t) => {
  await t.test('1. Column alias auto-detection correctly maps common spreadsheet headers', () => {
    const rawHeaders = ['Menu Category', 'Dish Name', 'Selling Price', 'Details', 'Veg/Non-Veg', 'Status'];
    const mappings = detectColumnMappings(rawHeaders);

    assert.equal(mappings['Menu Category'], 'category');
    assert.equal(mappings['Dish Name'], 'name');
    assert.equal(mappings['Selling Price'], 'price');
    assert.equal(mappings['Details'], 'description');
    assert.equal(mappings['Veg/Non-Veg'], 'dietType');
    assert.equal(mappings['Status'], 'available');
  });

  await t.test('2. Value parsers handle currency symbols, strings, diet types, and boolean flags', () => {
    assert.equal(parsePrice('₹180'), 180);
    assert.equal(parsePrice('250.50 INR'), 250.50);
    assert.equal(parsePrice('-50'), null);
    assert.equal(parsePrice('abc'), null);

    assert.equal(parseDietType('Veg'), 'veg');
    assert.equal(parseDietType('Non-Veg'), 'non-veg');
    assert.equal(parseDietType('Vegan'), 'vegan');
    assert.equal(parseDietType('chicken'), 'non-veg');

    assert.equal(parseBool('yes'), true);
    assert.equal(parseBool('false'), false);
    assert.equal(parseBool('no'), false);
    assert.equal(parseBool('hidden'), false);
  });

  await t.test('3. Format A single-table spreadsheet import validation and grouping', () => {
    const rawRows = [
      { Category: 'Starters', 'Dish Name': 'Paneer Tikka', Price: 240, Description: 'Tandoori paneer', 'Diet Type': 'veg' },
      { Category: 'Starters', 'Dish Name': 'Chicken Tikka', Price: 280, Description: 'Spiced chicken', 'Diet Type': 'non-veg' },
      { Category: 'Main Course', 'Dish Name': 'Dal Makhani', Price: 220, Description: 'Slow cooked black lentils', 'Diet Type': 'veg' }
    ];

    const columnMap = {
      Category: 'category',
      'Dish Name': 'name',
      Price: 'price',
      Description: 'description',
      'Diet Type': 'dietType'
    };

    const res = validateAndPreviewImport(rawRows, columnMap, []);

    assert.equal(res.summary.categoriesCount, 2);
    assert.equal(res.summary.itemsCount, 3);
    assert.equal(res.summary.errorCount, 0);
    assert.equal(res.summary.isValid, true);
  });

  await t.test('4. Format B size/portion variants grouped under single parent dish', () => {
    const rawRows = [
      { Category: 'Pizza', 'Dish Name': 'Margherita', 'Variant Name': 'Small', 'Variant Price': 199 },
      { Category: 'Pizza', 'Dish Name': 'Margherita', 'Variant Name': 'Medium', 'Variant Price': 299 },
      { Category: 'Pizza', 'Dish Name': 'Margherita', 'Variant Name': 'Large', 'Variant Price': 449 }
    ];

    const columnMap = {
      Category: 'category',
      'Dish Name': 'name',
      'Variant Name': 'variantName',
      'Variant Price': 'variantPrice'
    };

    const res = validateAndPreviewImport(rawRows, columnMap, []);

    assert.equal(res.summary.categoriesCount, 1);
    assert.equal(res.summary.itemsCount, 1, 'Should group 3 variant rows into 1 single dish');
    assert.equal(res.summary.variantsCount, 3, 'Should detect 3 portion variants');
  });

  await t.test('5. Validation error flag for missing price or invalid dish name', () => {
    const rawRows = [
      { Category: 'Starters', 'Dish Name': 'Invalid Price Item', Price: 'invalid-price-str' }
    ];

    const columnMap = {
      Category: 'category',
      'Dish Name': 'name',
      Price: 'price'
    };

    const res = validateAndPreviewImport(rawRows, columnMap, []);

    assert.equal(res.summary.errorCount, 1);
    assert.equal(res.summary.isValid, false);
    assert.equal(res.issues[0].field, 'price');
  });
});
