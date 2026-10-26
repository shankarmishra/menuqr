// Client-Side Excel / CSV Menu Parser & Sample Generator for MENUSQR
// Converts spreadsheets (.xlsx, .xls, .csv) into categories and items with Half/Full price support

let xlsxPromise: Promise<typeof import('xlsx')> | null = null;
function getXLSX(): Promise<typeof import('xlsx')> {
  if (!xlsxPromise) {
    xlsxPromise = import('xlsx').catch((err) => {
      xlsxPromise = null;
      throw err;
    });
  }
  return xlsxPromise;
}

export interface ParsedMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  halfPrice?: number;
  fullPrice?: number;
  category: string;
  dietType: 'veg' | 'non-veg' | 'vegan';
  available: boolean;
  imageUrl: string;
}

export interface ParsedCategory {
  id: string;
  name: string;
  description: string;
  order: number;
}

export interface ParseResult {
  categories: ParsedCategory[];
  items: ParsedMenuItem[];
  summary: {
    totalDishes: number;
    categoriesCount: number;
    vegCount: number;
    nonVegCount: number;
    dualPriceCount: number;
  };
}

const COLUMN_ALIASES: Record<string, string[]> = {
  category: ['category', 'section', 'group', 'menu category', 'category name', 'type', 'course', 'item category', 'menu_category'],
  name: ['item name', 'dish', 'product', 'food name', 'item', 'name', 'dish name', 'title', 'menu item', 'dish_name', 'item_name'],
  description: ['description', 'details', 'detail', 'info', 'summary', 'item description', 'about', 'ingredients'],
  price: ['price', 'rate', 'amount', 'selling price', 'cost', 'mrp', 'base price', 'single price', 'price (single)', 'single_price'],
  halfPrice: ['half price', 'half', 'half rate', 'half amount', 'half_price', 'small price', 'small', 'half_rate', 'price (half)'],
  fullPrice: ['full price', 'full', 'full rate', 'full amount', 'full_price', 'large price', 'large', 'full_rate', 'price (full)'],
  dietType: ['veg', 'vegetarian', 'food type', 'diet', 'diet type', 'diet_type', 'type (veg/non-veg)', 'is veg', 'veg/non-veg', 'veg or non-veg'],
  available: ['available', 'status', 'is available', 'in stock', 'active'],
  imageUrl: ['image', 'image url', 'photo', 'picture', 'photo url', 'image_url'],
};

function cleanString(val: unknown): string {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

export function parseDietType(val: unknown): 'veg' | 'non-veg' | 'vegan' {
  if (!val) return 'veg';
  const str = String(val).trim().toLowerCase();
  if (
    str.includes('non') ||
    str.includes('chicken') ||
    str.includes('mutton') ||
    str.includes('fish') ||
    str.includes('meat') ||
    str.includes('prawn') ||
    str.includes('seafood') ||
    str.includes('egg') ||
    str === 'nv' ||
    str === 'n'
  ) {
    return 'non-veg';
  }
  if (str.includes('vegan')) return 'vegan';
  return 'veg';
}

export function parsePrice(val: unknown): number | undefined {
  if (val === undefined || val === null || val === '') return undefined;
  if (typeof val === 'number') return Number.isFinite(val) && val >= 0 ? val : undefined;
  const strVal = String(val).trim();
  if (strVal.includes('-')) return undefined;
  const cleaned = strVal.replace(/[^0-9.]/g, '');
  if (!cleaned) return undefined;
  const num = parseFloat(cleaned);
  return Number.isFinite(num) && num >= 0 ? num : undefined;
}

export async function parseExcelMenuFile(file: File): Promise<ParseResult> {
  const XLSX = await getXLSX();
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawMatrix: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  if (!rawMatrix || rawMatrix.length < 2) {
    throw new Error('Spreadsheet appears to be empty or missing data rows.');
  }

  // Row 0 is headers
  const headerRow = rawMatrix[0].map((h) => cleanString(h));
  const columnMap: Record<number, string> = {};
  const matchedFields = new Set<string>();

  headerRow.forEach((h, colIdx) => {
    const cleanHeader = h.toLowerCase();
    for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
      if (!matchedFields.has(field) && aliases.includes(cleanHeader)) {
        columnMap[colIdx] = field;
        matchedFields.add(field);
        break;
      }
    }
  });

  // Fallbacks if header mapping didn't find essential fields
  if (!matchedFields.has('name')) {
    // Find first column with strings as name
    const candidateIdx = headerRow.findIndex((h) => /name|dish|item/i.test(h));
    if (candidateIdx >= 0) columnMap[candidateIdx] = 'name';
    else columnMap[1] = 'name'; // assume column 2
  }
  if (!matchedFields.has('category')) {
    const candidateIdx = headerRow.findIndex((h) => /category|type|sec/i.test(h));
    if (candidateIdx >= 0) columnMap[candidateIdx] = 'category';
    else columnMap[0] = 'category'; // assume column 1
  }

  const categoryMap = new Map<string, ParsedCategory>();
  const parsedItems: ParsedMenuItem[] = [];

  for (let r = 1; r < rawMatrix.length; r++) {
    const row = rawMatrix[r];
    if (!row || row.length === 0) continue;

    const rowObj: Record<string, unknown> = {};
    row.forEach((cellVal, colIdx) => {
      const field = columnMap[colIdx];
      if (field) rowObj[field] = cellVal;
    });

    const dishName = cleanString(rowObj.name);
    if (!dishName) continue; // skip blank item rows

    const catName = cleanString(rowObj.category) || 'General';
    const catKey = catName.toLowerCase();

    if (!categoryMap.has(catKey)) {
      categoryMap.set(catKey, {
        id: `cat_${categoryMap.size + 1}_${catKey.replace(/[^a-z0-9]/g, '_')}`,
        name: catName,
        description: '',
        order: categoryMap.size,
      });
    }
    const cat = categoryMap.get(catKey)!;

    const singlePrice = parsePrice(rowObj.price);
    const halfPrice = parsePrice(rowObj.halfPrice);
    const fullPrice = parsePrice(rowObj.fullPrice);

    const price = singlePrice !== undefined ? singlePrice : fullPrice || halfPrice || 0;
    const dietType = parseDietType(rowObj.dietType || dishName);

    parsedItems.push({
      id: `item_${parsedItems.length + 1}_${dishName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      name: dishName,
      description: cleanString(rowObj.description),
      price,
      halfPrice,
      fullPrice,
      category: cat.id,
      dietType,
      available: true,
      imageUrl: cleanString(rowObj.imageUrl),
    });
  }

  if (parsedItems.length === 0) {
    throw new Error('No valid dishes found. Please check that your file has Dish Name and Category columns.');
  }

  const categories = Array.from(categoryMap.values());
  const vegCount = parsedItems.filter((i) => i.dietType === 'veg' || i.dietType === 'vegan').length;
  const nonVegCount = parsedItems.filter((i) => i.dietType === 'non-veg').length;
  const dualPriceCount = parsedItems.filter((i) => i.halfPrice !== undefined || i.fullPrice !== undefined).length;

  return {
    categories,
    items: parsedItems,
    summary: {
      totalDishes: parsedItems.length,
      categoriesCount: categories.length,
      vegCount,
      nonVegCount,
      dualPriceCount,
    },
  };
}

export function getDemoMenuData(): ParseResult {
  const categories: ParsedCategory[] = [
    { id: 'cat_starters', name: 'Starters & Appetizers', description: 'Tandoori & wok tossed delights', order: 0 },
    { id: 'cat_mains', name: 'Main Course Specialties', description: 'Rich gravies and slow-cooked curries', order: 1 },
    { id: 'cat_breads_rice', name: 'Breads & Rice', description: 'Fresh clay oven breads and aromatic basmati', order: 2 },
    { id: 'cat_beverages', name: 'Beverages & Mocktails', description: 'Cold refreshments & handcrafted coolers', order: 3 },
    { id: 'cat_desserts', name: 'Desserts & Sweets', description: 'Traditional and artisanal sweet endings', order: 4 },
  ];

  const items: ParsedMenuItem[] = [
    // Starters
    {
      id: 'demo_1',
      name: 'Paneer Tikka Angara',
      description: 'Cottage cheese marinated in Kashmiri red chillies, mustard oil and hung yogurt, charred in clay oven.',
      price: 240,
      halfPrice: 140,
      fullPrice: 240,
      category: 'cat_starters',
      dietType: 'veg',
      available: true,
      imageUrl: '',
    },
    {
      id: 'demo_2',
      name: 'Crispy Corn Salt & Pepper',
      description: 'Sweet corn kernels wok-tossed with scallions, crushed garlic, and freshly cracked black pepper.',
      price: 180,
      category: 'cat_starters',
      dietType: 'veg',
      available: true,
      imageUrl: '',
    },
    {
      id: 'demo_3',
      name: 'Murgh Malai Kebab',
      description: 'Tender chicken morsels steeped in cream cheese, green cardamom, and roasted garlic.',
      price: 320,
      halfPrice: 190,
      fullPrice: 320,
      category: 'cat_starters',
      dietType: 'non-veg',
      available: true,
      imageUrl: '',
    },
    {
      id: 'demo_4',
      name: 'Amritsari Fish Fry',
      description: 'Crisp river sole crusted with carom seeds (ajwain), gram flour, and tangy chaat masala.',
      price: 380,
      category: 'cat_starters',
      dietType: 'non-veg',
      available: true,
      imageUrl: '',
    },

    // Mains
    {
      id: 'demo_5',
      name: 'Dal Makhani Bukhara',
      description: 'Black lentils slow-simmered overnight over charcoal embers with vine tomatoes and churned butter.',
      price: 260,
      halfPrice: 160,
      fullPrice: 260,
      category: 'cat_mains',
      dietType: 'veg',
      available: true,
      imageUrl: '',
    },
    {
      id: 'demo_6',
      name: 'Paneer Lababdar',
      description: 'Cottage cheese cubes folded in a rich tomato, onion and cashew nut gravy finished with kasoori methi.',
      price: 290,
      halfPrice: 180,
      fullPrice: 290,
      category: 'cat_mains',
      dietType: 'veg',
      available: true,
      imageUrl: '',
    },
    {
      id: 'demo_7',
      name: 'Butter Chicken Delhi 6',
      description: 'Tandoor-smoked pulled chicken in a velvet tomato cream gravy, infused with fenugreek.',
      price: 380,
      halfPrice: 220,
      fullPrice: 380,
      category: 'cat_mains',
      dietType: 'non-veg',
      available: true,
      imageUrl: '',
    },
    {
      id: 'demo_8',
      name: 'Kashmiri Mutton Rogan Josh',
      description: 'Tender lamb shanks braised in browned onions, Kashmiri saffron, and ratanjyot oil.',
      price: 460,
      halfPrice: 280,
      fullPrice: 460,
      category: 'cat_mains',
      dietType: 'non-veg',
      available: true,
      imageUrl: '',
    },

    // Breads & Rice
    {
      id: 'demo_9',
      name: 'Garlic Butter Naan',
      description: 'Soft tandoori flatbread studded with roasted minced garlic and brushed with salted butter.',
      price: 65,
      category: 'cat_breads_rice',
      dietType: 'veg',
      available: true,
      imageUrl: '',
    },
    {
      id: 'demo_10',
      name: 'Dum Biryani Subz-E-Awadh',
      description: 'Fragrant aged long-grain basmati rice layered with garden vegetables, saffron milk, and fried onions.',
      price: 260,
      halfPrice: 160,
      fullPrice: 260,
      category: 'cat_breads_rice',
      dietType: 'veg',
      available: true,
      imageUrl: '',
    },

    // Beverages
    {
      id: 'demo_11',
      name: 'Masala Shikanji Soda',
      description: 'Fresh hand-squeezed lime with crushed black salt, roasted cumin, and carbonated club soda.',
      price: 90,
      category: 'cat_beverages',
      dietType: 'veg',
      available: true,
      imageUrl: '',
    },
    {
      id: 'demo_12',
      name: 'Cold Brew Hazelnut Frappe',
      description: 'Slow-steeped Arabica coffee blended with cold milk, hazelnut syrup, and dark chocolate shavings.',
      price: 150,
      category: 'cat_beverages',
      dietType: 'veg',
      available: true,
      imageUrl: '',
    },

    // Desserts
    {
      id: 'demo_13',
      name: 'Gulab Jamun with Kesari Rabri',
      description: 'Warm melt-in-mouth milk dumplings served over chilled saffron-infused clotted cream.',
      price: 130,
      category: 'cat_desserts',
      dietType: 'veg',
      available: true,
      imageUrl: '',
    },
  ];

  return {
    categories,
    items,
    summary: {
      totalDishes: items.length,
      categoriesCount: categories.length,
      vegCount: items.filter((i) => i.dietType === 'veg').length,
      nonVegCount: items.filter((i) => i.dietType === 'non-veg').length,
      dualPriceCount: items.filter((i) => i.halfPrice !== undefined).length,
    },
  };
}

export async function downloadSampleMenuExcel(): Promise<void> {
  const XLSX = await getXLSX();
  const sampleRows = [
    {
      Category: 'Starters',
      'Dish Name': 'Paneer Tikka Angara',
      'Single Price': '',
      'Half Price': 140,
      'Full Price': 240,
      Description: 'Charcoal charred cottage cheese marinated in spiced hung yogurt',
      'Diet Type': 'Veg',
    },
    {
      Category: 'Starters',
      'Dish Name': 'Crispy Corn Salt & Pepper',
      'Single Price': 180,
      'Half Price': '',
      'Full Price': '',
      Description: 'Sweet corn tossed with scallions and crushed black pepper',
      'Diet Type': 'Veg',
    },
    {
      Category: 'Starters',
      'Dish Name': 'Murgh Malai Kebab',
      'Single Price': '',
      'Half Price': 190,
      'Full Price': 320,
      Description: 'Chicken morsels in cream cheese and roasted garlic marinade',
      'Diet Type': 'Non-Veg',
    },
    {
      Category: 'Main Course',
      'Dish Name': 'Dal Makhani Bukhara',
      'Single Price': '',
      'Half Price': 160,
      'Full Price': 260,
      Description: 'Slow-simmered black lentils with tomatoes and churned butter',
      'Diet Type': 'Veg',
    },
    {
      Category: 'Main Course',
      'Dish Name': 'Paneer Butter Masala',
      'Single Price': '',
      'Half Price': 180,
      'Full Price': 290,
      Description: 'Cottage cheese in rich tomato and cashew nut gravy',
      'Diet Type': 'Veg',
    },
    {
      Category: 'Main Course',
      'Dish Name': 'Butter Chicken Delhi Style',
      'Single Price': '',
      'Half Price': 220,
      'Full Price': 380,
      Description: 'Tandoori chicken in velvet tomato cream sauce',
      'Diet Type': 'Non-Veg',
    },
    {
      Category: 'Breads & Rice',
      'Dish Name': 'Garlic Butter Naan',
      'Single Price': 60,
      'Half Price': '',
      'Full Price': '',
      Description: 'Clay oven bread with roasted garlic and salted butter',
      'Diet Type': 'Veg',
    },
    {
      Category: 'Breads & Rice',
      'Dish Name': 'Jeera Rice',
      'Single Price': '',
      'Half Price': 90,
      'Full Price': 150,
      Description: 'Basmati rice tempered with roasted cumin seeds',
      'Diet Type': 'Veg',
    },
    {
      Category: 'Beverages',
      'Dish Name': 'Fresh Lime Soda',
      'Single Price': 80,
      'Half Price': '',
      'Full Price': '',
      Description: 'Hand-squeezed fresh lime with mint and sparkling soda',
      'Diet Type': 'Veg',
    },
    {
      Category: 'Desserts',
      'Dish Name': 'Gulab Jamun with Rabri',
      'Single Price': 110,
      'Half Price': '',
      'Full Price': '',
      Description: 'Warm golden dumplings in saffron syrup with rabri',
      'Diet Type': 'Veg',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Menu');

  XLSX.writeFile(workbook, 'menusqr-sample-menu.xlsx');
}
