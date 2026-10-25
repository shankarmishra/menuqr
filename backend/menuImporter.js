import { randomUUID } from 'node:crypto';
import { queryPortable } from './db.js';
import { apiError } from './utils.js';

export const COLUMN_ALIASES = {
  category: ['category', 'section', 'group', 'menu category', 'category name', 'type', 'course', 'item category'],
  name: ['item name', 'dish', 'product', 'food name', 'item', 'name', 'dish name', 'title', 'menu item'],
  description: ['description', 'details', 'detail', 'info', 'summary', 'item description', 'about'],
  price: ['price', 'rate', 'amount', 'selling price', 'cost', 'mrp', 'base price', 'single price'],
  halfPrice: ['half price', 'half', 'half rate', 'half amount', 'half_price', 'small price'],
  fullPrice: ['full price', 'full', 'full rate', 'full amount', 'full_price', 'large price'],
  variantName: ['variant', 'size', 'portion', 'variant name', 'serving', 'option', 'item size'],
  variantPrice: ['variant price', 'size price', 'portion price', 'variant cost', 'option price'],
  dietType: ['veg', 'vegetarian', 'food type', 'diet', 'diet type', 'type (veg/non-veg)', 'is veg', 'veg/non-veg'],
  available: ['available', 'status', 'is available', 'in stock', 'active'],
  imageUrl: ['image', 'image url', 'photo', 'picture', 'photo url', 'image_url']
};

export function detectColumnMappings(headers) {
  const mappings = {};
  const usedFields = new Set();
  
  headers.forEach(header => {
    const cleanHeader = String(header || '').trim().toLowerCase();
    let matchedField = 'ignore';
    
    for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
      if (!usedFields.has(field) && aliases.includes(cleanHeader)) {
        matchedField = field;
        usedFields.add(field);
        break;
      }
    }
    mappings[header] = matchedField;
  });
  
  return mappings;
}

export function parsePrice(val) {
  if (val === undefined || val === null || val === '') return null;
  if (typeof val === 'number') return Number.isFinite(val) && val >= 0 ? val : null;
  const strVal = String(val).trim();
  if (strVal.includes('-')) return null;
  const str = strVal.replace(/[^0-9.]/g, '');
  if (!str) return null;
  const num = parseFloat(str);
  return Number.isFinite(num) && num >= 0 ? num : null;
}

export function parseDietType(val) {
  if (!val) return 'veg';
  const str = String(val).trim().toLowerCase();
  if (str.includes('non') || str.includes('chicken') || str.includes('mutton') || str.includes('fish') || str.includes('meat') || str.includes('prawn') || str === 'nv' || str === 'n') return 'non-veg';
  if (str.includes('vegan')) return 'vegan';
  if (str.includes('egg')) return 'non-veg';
  return 'veg';
}

export function parseBool(val) {
  if (val === undefined || val === null || val === '') return true;
  if (typeof val === 'boolean') return val;
  const str = String(val).trim().toLowerCase();
  return !['false', 'no', '0', 'hidden', 'inactive', 'n'].includes(str);
}

export function validateAndPreviewImport(rawRows, columnMap, existingItemNames = []) {
  const issues = [];
  const existingSet = new Set(existingItemNames.map(n => n.toLowerCase().trim()));
  
  const categoryMap = new Map();
  let rowIdx = 0;
  
  rawRows.forEach((rawRow, idx) => {
    rowIdx = idx + 2; // 1-indexed plus header row
    
    const mappedRow = {};
    for (const [header, field] of Object.entries(columnMap)) {
      if (field && field !== 'ignore') {
        mappedRow[field] = rawRow[header];
      }
    }
    
    const rawCategory = String(mappedRow.category || '').trim();
    const rawName = String(mappedRow.name || '').trim();
    const rawPrice = mappedRow.price;
    const rawHalf = mappedRow.halfPrice;
    const rawFull = mappedRow.fullPrice;
    const rawVariantName = String(mappedRow.variantName || '').trim();
    const rawVariantPrice = mappedRow.variantPrice;
    
    if (!rawName && !rawCategory) {
      // Empty row, skip
      return;
    }
    
    if (!rawCategory) {
      issues.push({ row: rowIdx, field: 'category', severity: 'error', message: 'Category name is required.' });
    }
    
    if (!rawName) {
      issues.push({ row: rowIdx, field: 'name', severity: 'error', message: 'Item name is required.' });
    }
    
    const parsedPrice = parsePrice(rawPrice);
    const parsedHalf = parsePrice(rawHalf);
    const parsedFull = parsePrice(rawFull);
    const parsedVarPrice = parsePrice(rawVariantPrice);
    
    const hasPrice = parsedPrice !== null || (parsedHalf !== null && parsedFull !== null) || parsedVarPrice !== null;
    if (!hasPrice && rawName) {
      issues.push({ row: rowIdx, field: 'price', severity: 'error', message: `Invalid or missing price for item "${rawName}".` });
    }
    
    const catKey = (rawCategory || 'Uncategorized').trim();
    if (!categoryMap.has(catKey.toLowerCase())) {
      categoryMap.set(catKey.toLowerCase(), {
        name: catKey,
        items: new Map()
      });
    }
    const catGroup = categoryMap.get(catKey.toLowerCase());
    
    const itemKey = (rawName || `item-${rowIdx}`).trim().toLowerCase();
    if (!catGroup.items.has(itemKey)) {
      const isExisting = existingSet.has(itemKey);
      catGroup.items.set(itemKey, {
        rowNumber: rowIdx,
        name: rawName || 'Unnamed Item',
        category: catKey,
        description: String(mappedRow.description || '').trim(),
        price: parsedPrice ?? parsedFull ?? parsedHalf ?? 0,
        halfPrice: parsedHalf,
        fullPrice: parsedFull,
        dietType: parseDietType(mappedRow.dietType),
        available: parseBool(mappedRow.available),
        imageUrl: String(mappedRow.imageUrl || '').trim(),
        pricingType: (parsedHalf !== null || parsedFull !== null || rawVariantName) ? 'variants' : 'single',
        variants: [],
        addonGroups: [],
        isExisting
      });
    }
    
    const itemObj = catGroup.items.get(itemKey);
    
    // Check if row adds half/full variants
    if (parsedHalf !== null && parsedFull !== null) {
      itemObj.pricingType = 'variants';
      if (!itemObj.variants.some(v => v.name.toLowerCase() === 'half')) {
        itemObj.variants.push({ name: 'Half', price: parsedHalf, isAvailable: true });
      }
      if (!itemObj.variants.some(v => v.name.toLowerCase() === 'full')) {
        itemObj.variants.push({ name: 'Full', price: parsedFull, isAvailable: true });
      }
    }
    
    // Check if row specifies custom size/variant
    if (rawVariantName && parsedVarPrice !== null) {
      itemObj.pricingType = 'variants';
      if (!itemObj.variants.some(v => v.name.toLowerCase() === rawVariantName.toLowerCase())) {
        itemObj.variants.push({ name: rawVariantName, price: parsedVarPrice, isAvailable: true });
      }
    }
  });
  
  // Format summary output
  const previewCategories = [];
  let totalItemsCount = 0;
  let totalVariantsCount = 0;
  let duplicatesCount = 0;
  
  for (const cat of categoryMap.values()) {
    const itemsList = Array.from(cat.items.values());
    totalItemsCount += itemsList.length;
    itemsList.forEach(item => {
      totalVariantsCount += item.variants.length;
      if (item.isExisting) duplicatesCount++;
    });
    previewCategories.push({
      name: cat.name,
      items: itemsList
    });
  }
  
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  
  return {
    summary: {
      totalRowsProcessed: rawRows.length,
      categoriesCount: previewCategories.length,
      itemsCount: totalItemsCount,
      variantsCount: totalVariantsCount,
      duplicatesCount,
      errorCount,
      warningCount,
      isValid: errorCount === 0
    },
    categories: previewCategories,
    issues
  };
}

export async function executeImportTransaction(client, tenantId, menuId, parsedCategories, mode = 'add', filename = 'uploaded_menu.xlsx') {
  let categoriesCreated = 0;
  let itemsCreated = 0;
  let itemsUpdated = 0;
  let variantsCreated = 0;
  let addonsCreated = 0;
  let skippedCount = 0;
  
  // 1. Fetch existing categories and items for this tenant
  const existingCatRes = await queryPortable(client,
    'SELECT id, name FROM menu_categories WHERE menu_id = ? AND tenant_id = ?',
    [menuId, tenantId]
  );
  const catNameToId = new Map();
  existingCatRes.rows.forEach(c => catNameToId.set(c.name.toLowerCase().trim(), c.id));
  
  const existingItemRes = await queryPortable(client,
    'SELECT id, name, category_id FROM menu_items WHERE menu_id = ? AND tenant_id = ?',
    [menuId, tenantId]
  );
  const itemNameToObj = new Map();
  existingItemRes.rows.forEach(i => itemNameToObj.set(i.name.toLowerCase().trim(), i));
  
  // 2. Process each category
  for (let cIdx = 0; cIdx < parsedCategories.length; cIdx++) {
    const cat = parsedCategories[cIdx];
    const catKey = cat.name.toLowerCase().trim();
    let categoryId = catNameToId.get(catKey);
    
    if (!categoryId) {
      categoryId = randomUUID();
      const nextSort = await queryPortable(client,
        'SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM menu_categories WHERE menu_id = ? AND tenant_id = ?',
        [menuId, tenantId]
      );
      await queryPortable(client,
        'INSERT INTO menu_categories (id, menu_id, tenant_id, name, sort_order) VALUES (?, ?, ?, ?, ?)',
        [categoryId, menuId, tenantId, cat.name, nextSort.rows[0].next_order]
      );
      catNameToId.set(catKey, categoryId);
      categoriesCreated++;
    }
    
    // 3. Process items within category
    for (let iIdx = 0; iIdx < cat.items.length; iIdx++) {
      const item = cat.items[iIdx];
      const itemKey = item.name.toLowerCase().trim();
      const existingItem = itemNameToObj.get(itemKey);
      
      if (existingItem && mode === 'skip') {
        skippedCount++;
        continue;
      }
      
      let itemId;
      const pricingType = item.pricingType || (item.variants?.length > 0 ? 'variants' : 'single');
      const finalImageUrl = item.imageUrl || item.image || item.image_url || null;
      
      if (existingItem && mode === 'update') {
        itemId = existingItem.id;
        await queryPortable(client,
          'UPDATE menu_items SET category_id = ?, name = ?, description = ?, price = ?, half_price = ?, full_price = ?, image_url = ?, diet_type = ?, is_available = ?, pricing_type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND tenant_id = ?',
          [categoryId, item.name, item.description || null, item.price || 0, item.halfPrice || null, item.fullPrice || null, finalImageUrl, item.dietType || 'veg', item.available !== false, pricingType, itemId, tenantId]
        );
        itemsUpdated++;
        
        // Clean up previous variants/addons to replace cleanly
        await queryPortable(client, 'DELETE FROM menu_item_variants WHERE menu_item_id = ? AND tenant_id = ?', [itemId, tenantId]);
        await queryPortable(client, 'DELETE FROM menu_item_addon_groups WHERE menu_item_id = ? AND tenant_id = ?', [itemId, tenantId]);
      } else {
        itemId = randomUUID();
        const nextSort = await queryPortable(client,
          'SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM menu_items WHERE category_id = ? AND tenant_id = ?',
          [categoryId, tenantId]
        );
        await queryPortable(client,
          'INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, description, price, half_price, full_price, image_url, diet_type, is_available, sort_order, pricing_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [itemId, menuId, tenantId, categoryId, item.name, item.description || null, item.price || 0, item.halfPrice || null, item.fullPrice || null, finalImageUrl, item.dietType || 'veg', item.available !== false, nextSort.rows[0].next_order, pricingType]
        );
        itemsCreated++;
      }
      
      // Insert variants if present
      if (Array.isArray(item.variants) && item.variants.length > 0) {
        for (let vIdx = 0; vIdx < item.variants.length; vIdx++) {
          const v = item.variants[vIdx];
          const variantId = randomUUID();
          await queryPortable(client,
            'INSERT INTO menu_item_variants (id, menu_item_id, tenant_id, variant_group, name, price, is_available, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [variantId, itemId, tenantId, v.variantGroup || 'Portion', v.name, v.price || 0, v.isAvailable !== false, vIdx + 1]
          );
          variantsCreated++;
        }
      }
      
      // Insert addon groups if present
      if (Array.isArray(item.addonGroups) && item.addonGroups.length > 0) {
        for (let gIdx = 0; gIdx < item.addonGroups.length; gIdx++) {
          const g = item.addonGroups[gIdx];
          const groupId = randomUUID();
          await queryPortable(client,
            'INSERT INTO menu_item_addon_groups (id, menu_item_id, tenant_id, name, description, is_required, min_select, max_select, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [groupId, itemId, tenantId, g.name, g.description || null, Boolean(g.isRequired), g.minSelect || 0, g.maxSelect || 1, gIdx + 1]
          );
          addonsCreated++;
          
          if (Array.isArray(g.options)) {
            for (let oIdx = 0; oIdx < g.options.length; oIdx++) {
              const opt = g.options[oIdx];
              await queryPortable(client,
                'INSERT INTO menu_item_addon_options (id, addon_group_id, tenant_id, name, price, is_available, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [randomUUID(), groupId, tenantId, opt.name, opt.price || 0, opt.isAvailable !== false, oIdx + 1]
              );
            }
          }
        }
      }
    }
  }
  
  // Log import event
  const importId = randomUUID();
  await queryPortable(client,
    'INSERT INTO menu_imports (id, tenant_id, filename, status, categories_count, items_count, variants_count, addons_count, skipped_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [importId, tenantId, filename, 'SUCCESS', categoriesCreated, itemsCreated + itemsUpdated, variantsCreated, addonsCreated, skippedCount]
  );
  
  return {
    importId,
    categoriesCreated,
    itemsCreated,
    itemsUpdated,
    variantsCreated,
    addonsCreated,
    skippedCount
  };
}
