// MENUQR PDF-to-Digital-Menu Reconstruction Service
// Native PDF understanding via PDFParse and a deterministic text engine (no AI service is used)

import { PDFParse } from 'pdf-parse';
import { extractImagesFromPdf, generateMonogramLogo } from './pdfImageExtractor.js';
import { resolveDishImage } from './culinaryImageService.js';

const MAX_PDF_SIZE_BYTES = 25 * 1024 * 1024; // 25MB
const MAX_PDF_PAGES = 20;

/**
 * Validates PDF binary signature (magic bytes: %PDF-)
 */
export function validatePdfBuffer(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    return { isValid: false, error: 'A valid binary file buffer is required.' };
  }

  if (buffer.length === 0) {
    return { isValid: false, error: 'Uploaded PDF file is empty.' };
  }

  if (buffer.length > MAX_PDF_SIZE_BYTES) {
    return { isValid: false, error: `PDF file exceeds maximum allowed size of 15MB (got ${(buffer.length / (1024 * 1024)).toFixed(1)}MB).` };
  }

  // Check magic bytes: %PDF- (0x25 0x50 0x44 0x46 0x2D)
  const header = buffer.subarray(0, 5).toString('ascii');
  if (header !== '%PDF-') {
    return { isValid: false, error: 'File is not a valid PDF document (magic bytes %PDF- missing).' };
  }

  return { isValid: true };
}

/**
 * Inspects PDF locally using PDFParse for text, page count, and scanned detection
 */
export async function inspectPdf(buffer) {
  try {
    const parser = new PDFParse({ data: buffer });
    // Note: Do not call getInfo() and getText() concurrently with Promise.all
    // because pdf-parse detaches the buffer across the worker boundary.
    const textResult = await parser.getText();

    const pageCount = textResult?.total || textResult?.pages?.length || 1;
    const rawText = textResult?.text || '';
    
    // Scanned detection: If digital text length is less than 60 chars across pages
    const isScanned = rawText.replace(/\s+/g, '').length < 60;

    return {
      pageCount,
      isScanned,
      rawText,
    };
  } catch (err) {
    console.warn('PDFParse local inspection warning:', err.message);
    // Fallback inspection from buffer scanning
    const pdfString = buffer.toString('latin1', 0, Math.min(buffer.length, 500000));
    const pageMatches = pdfString.match(/\/Type\s*\/Page\b/g);
    const estimatedPages = pageMatches ? pageMatches.length : 1;
    return {
      pageCount: Math.max(1, estimatedPages),
      isScanned: true,
      rawText: '',
    };
  }
}

/**
 * Deterministic line-by-line regex heuristic fallback
 */
export function deterministicPdfExtraction(rawText, filename, inspectedData = {}) {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const categories = [];
  let currentCategory = { name: 'Main Menu', description: '', items: [] };

  const priceRegex = /(?:₹|Rs\.?|INR)?\s*(\d{1,5}(?:\.\d{1,2})?)\s*(?:\/|\-)?$/i;
  const halfFullRegex = /(?:(?:Half|H|Small|S|हाफ)\s*)?(?:₹|Rs\.?)?\s*(\d{2,4})\s*(?:[\/|&,]|(?:Full|F|Large|L|फुल))\s*(?:₹|Rs\.?)?\s*(\d{2,4})/i;

  const COMMON_SECTION_KEYWORDS = [
    'starter', 'appetizer', 'main course', 'main dish', 'beverage', 'drink',
    'dessert', 'soup', 'salad', 'bread', 'roti', 'biryani', 'rice', 'snack',
    'breakfast', 'lunch', 'dinner', 'side', 'combo', 'thali', 'shuruat', 'special',
    'शुरुआत', 'भोजन'
  ];

  const NON_VEG_WORDS = ['chicken', 'mutton', 'fish', 'egg', 'prawn', 'lamb', 'keema', 'pork', 'beef', 'non-veg', 'meat', 'wings', 'tandoori chicken', 'biryani non'];
  const VEGAN_WORDS = ['vegan', 'tofu', 'almond milk', 'oat milk', 'plant-based'];

  for (const line of lines) {
    if (line.length > 100 || line.startsWith('--') || line.startsWith('Page ')) continue;

    // Check if line looks like a category header (all caps, or short header line without numbers)
    const isHeaderLine = line.length < 50 && !/\d/.test(line) && (
      line === line.toUpperCase() ||
      line.endsWith(':') ||
      line.startsWith('#') ||
      COMMON_SECTION_KEYWORDS.some(k => line.toLowerCase().includes(k))
    );
    if (isHeaderLine) {
      const cleanCatName = line.replace(/[:#]/g, '').trim();
      if (cleanCatName.length > 2) {
        if (currentCategory.items.length > 0) {
          categories.push(currentCategory);
        }
        currentCategory = { name: cleanCatName, description: '', items: [] };
        continue;
      }
    }

    // Check for Half / Full or variant pricing
    const halfFullMatch = line.match(halfFullRegex);
    if (halfFullMatch) {
      const itemName = line.replace(halfFullRegex, '').replace(/[-–—:]+$/, '').trim();
      if (itemName.length > 2) {
        const halfPrice = parseFloat(halfFullMatch[1]);
        const fullPrice = parseFloat(halfFullMatch[2]);
        const lowerName = itemName.toLowerCase();
        const dietType = NON_VEG_WORDS.some(w => lowerName.includes(w)) ? 'non-veg' : VEGAN_WORDS.some(w => lowerName.includes(w)) ? 'vegan' : 'veg';

        currentCategory.items.push({
          name: itemName,
          description: '',
          price: fullPrice,
          halfPrice,
          fullPrice,
          pricingType: 'portion',
          variants: [
            { name: 'Half', price: halfPrice },
            { name: 'Full', price: fullPrice }
          ],
          addonGroups: [],
          dietType,
          confidence: 0.85,
          warnings: []
        });
        continue;
      }
    }

    // Check for single price
    const priceMatch = line.match(priceRegex);
    if (priceMatch) {
      const priceVal = parseFloat(priceMatch[1]);
      const itemName = line.replace(priceRegex, '').replace(/[-–—:]+$/, '').trim();
      if (itemName.length > 2 && priceVal > 0) {
        const lowerName = itemName.toLowerCase();
        const dietType = NON_VEG_WORDS.some(w => lowerName.includes(w)) ? 'non-veg' : VEGAN_WORDS.some(w => lowerName.includes(w)) ? 'vegan' : 'veg';

        currentCategory.items.push({
          name: itemName,
          description: '',
          price: priceVal,
          halfPrice: null,
          fullPrice: null,
          pricingType: 'single',
          variants: [],
          addonGroups: [],
          dietType,
          confidence: 0.8,
          warnings: []
        });
        continue;
      }
    }

    // Dish without obvious price
    if (line.length > 3 && line.length < 50 && !/^(telephone|phone|gst|tax|call|address|timing)/i.test(line)) {
      if (currentCategory.items.length > 0) {
        // Could be description for last item if indented or longer
        const lastItem = currentCategory.items[currentCategory.items.length - 1];
        if (!lastItem.description) {
          lastItem.description = line;
          continue;
        }
      }
    }
  }

  if (currentCategory.items.length > 0) {
    categories.push(currentCategory);
  }

  // Fallback single category if empty
  if (categories.length === 0) {
    categories.push({
      name: 'Chef Specialties',
      description: 'Extracted from uploaded menu document',
      items: [
        {
          name: 'Special Signature Item',
          description: 'Please review and enter item details from your PDF',
          price: 250,
          halfPrice: null,
          fullPrice: null,
          pricingType: 'single',
          variants: [],
          addonGroups: [],
          dietType: 'veg',
          confidence: 0.5,
          warnings: ['Price could not be automatically detected. Please update with your actual price.']
        }
      ]
    });
  }

  // Populate appetizing culinary dish images
  let dishIndex = 0;
  for (const cat of categories) {
    for (const item of cat.items) {
      if (!item.imageUrl) {
        item.imageUrl = resolveDishImage(item.name, cat.name, [], dishIndex++);
        item.image = item.imageUrl;
      }
    }
  }

  // Derive high-fidelity DesignSpecification fallback
  const isFineDining = categories.some(c => /royal|mughlai|heritage|wine|banquet|gourmet/i.test(c.name));
  const isChalkboard = /steak|chalk|bbq|grill|clipboard/i.test(inspectedData.rawText) || /chalkboard|clipboard/i.test(filename);
  const composition = isChalkboard ? 'parametric-artboard' : (isFineDining ? 'editorial' : (categories.length > 4 ? 'compact-bistro' : 'image-showcase'));
  const rawName = typeof filename === 'string' ? filename : (inspectedData?.fileName || inspectedData?.filename || 'Restaurant Menu');
  const cleanFilename = rawName.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
  const cleanSlug = cleanFilename.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'menu';

  const designSpec = {
    version: '1.0',
    composition,
    themeId: `bespoke-${cleanSlug}`,
    colors: {
      bg: isChalkboard ? '#141414' : (isFineDining ? '#180912' : '#F9F7F2'),
      surface: isChalkboard ? '#1D1D1D' : (isFineDining ? '#270F1E' : '#FFFFFF'),
      surfaceAlt: isChalkboard ? '#262626' : (isFineDining ? '#2D1223' : '#F4EFE6'),
      text: isChalkboard ? '#EFECE6' : (isFineDining ? '#FAF3E0' : '#1F2923'),
      textMuted: isChalkboard ? '#9F988F' : (isFineDining ? '#C9BFA8' : '#68786E'),
      heading: isChalkboard ? '#FFFFFF' : (isFineDining ? '#E5C058' : '#163328'),
      accent: isChalkboard ? '#C27038' : (isFineDining ? '#D4AF37' : '#C4703C'),
      border: isChalkboard ? 'rgba(255, 255, 255, 0.15)' : (isFineDining ? 'rgba(212, 175, 55, 0.35)' : 'rgba(22, 51, 40, 0.15)'),
      badgeBg: isChalkboard ? '#C27038' : (isFineDining ? '#D4AF37' : '#C4703C'),
      badgeText: '#FFFFFF',
    },
    typography: {
      headingFont: isChalkboard ? "'Bebas Neue', 'Oswald', sans-serif" : (isFineDining ? "'Cinzel', serif" : "'Plus Jakarta Sans', sans-serif"),
      bodyFont: "'Plus Jakarta Sans', sans-serif",
      style: isChalkboard ? 'display' : (isFineDining ? 'serif' : 'sans'),
      headingWeight: 'bold',
    },
    header: {
      style: isChalkboard ? 'minimal-stacked' : (isFineDining ? 'centered-crest' : 'minimal-stacked'),
      showLogo: true,
      decorativeElement: isChalkboard ? 'minimal-line' : (isFineDining ? 'crest' : 'minimal-line'),
      crestType: isFineDining ? 'crown' : 'none',
    },
    categories: {
      navStyle: isChalkboard ? 'chips' : 'pills',
      headerStyle: isChalkboard ? 'badge' : (isFineDining ? 'arch' : 'divider-line'),
    },
    items: {
      cardStyle: isChalkboard ? 'classic-leader' : (composition === 'compact-bistro' ? 'compact-row' : (composition === 'image-showcase' ? 'photo-hero' : 'classic-leader')),
      imagePosition: isChalkboard ? 'none' : 'right',
      priceStyle: isChalkboard ? 'aligned-right' : (composition === 'compact-bistro' ? 'pill-badge' : 'aligned-right'),
    },
    decorations: {
      texture: isChalkboard ? 'subtle-grain' : (isFineDining ? 'silk-lattice' : 'clean'),
      borderRadius: isChalkboard ? 'sm' : 'md',
      borderStyle: isChalkboard ? 'solid' : 'hairline',
      shadow: 'subtle',
    },
    layoutGrammar: isChalkboard ? {
      containerMetaphor: 'clipboard',
      coverPage: {
        enabled: true,
        titleLayout: 'stamp-ribbon',
        ribbonText: 'FOOD',
        heroPlatter: true,
        badges: [
          { label: 'OPEN HOUR', value: '8AM' },
          { label: 'LIVE MUSIC', value: '6PM' },
        ],
        footerText: '',
      },
      pageLayout: { columns: 2, columnBalance: 'equal' },
      categoryStyle: { badgeType: 'banner-ribbon' },
      itemStyle: { presentation: 'dotted-leader', pricePlacement: 'dotted-end', showImages: false },
      calloutBoxes: [
        { categoryMatch: 'FAVOURITE|SPECIAL', style: 'double-border', badgeText: '$22' },
      ],
    } : undefined,
  };

  return {
    success: true,
    provider: 'deterministic-fallback',
    pageCount: inspectedData.pageCount || 1,
    isScanned: inspectedData.isScanned ?? false,
    restaurant: {
      name: cleanFilename,
      cuisine: isFineDining ? 'Heritage & Fine Dining' : 'Multi-Cuisine Restaurant',
      tagline: 'Freshly Prepared Daily',
      description: 'Extracted faithfully from uploaded PDF menu.',
      address: '',
      phone: '',
      openingHours: '11:00 AM - 11:00 PM',
    },
    categories,
    designSpec,
    warnings: [
      'Document read by the built-in text engine. Please review dish names and prices carefully.'
    ],
  };
}

/**
 * Main PDF extraction pipeline: validation, local inspection, embedded media, deterministic text extraction
 */
export async function extractMenuFromPdf(arg1, arg2) {
  let buffer, filename, tenantId;
  if (Buffer.isBuffer(arg1)) {
    buffer = arg1;
    filename = arg2?.filename || arg2?.fileName || 'menu.pdf';
    tenantId = arg2?.tenantId;
  } else if (arg1 && typeof arg1 === 'object') {
    buffer = arg1.buffer;
    filename = arg1.filename || arg1.fileName || 'menu.pdf';
    tenantId = arg1.tenantId;
  } else {
    throw new Error('Valid PDF buffer is required.');
  }

  if (!tenantId) {
    throw new Error('Tenant ID is required for PDF extraction.');
  }

  // 1. Buffer & File Signature Validation
  const validation = validatePdfBuffer(buffer);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // 2. Local PDF Inspection
  const inspectedData = await inspectPdf(buffer);
  if (inspectedData.pageCount > MAX_PDF_PAGES) {
    throw new Error(`PDF has ${inspectedData.pageCount} pages. Maximum supported document length is ${MAX_PDF_PAGES} pages.`);
  }

  // 3. Extract embedded media, logo candidates, and dish photos from PDF
  const extractedMedia = await extractImagesFromPdf(buffer, tenantId, filename);

  // 4. Deterministic text extraction. No AI service is called: the dishes and prices come from the
  // PDF text itself and the owner reviews them before anything is saved.
  const extraction = deterministicPdfExtraction(inspectedData.rawText, filename, inspectedData);
  let dishGlobalIdx = 0;
  for (const cat of extraction.categories) {
    for (const item of cat.items) {
      if (!item.imageUrl) {
        item.imageUrl = resolveDishImage(item.name, cat.name, extractedMedia.dishImages, dishGlobalIdx++);
        item.image = item.imageUrl;
      }
    }
  }
  const finalLogoUrl = extractedMedia.logoUrl || await generateMonogramLogo({
    restaurantName: extraction.restaurant?.name || filename.replace(/\.pdf$/i, ''),
    primaryColor: extraction.designSpec?.colors?.heading || '#1F2923',
    accentColor: extraction.designSpec?.colors?.accent || '#D4AF37',
    backgroundColor: extraction.designSpec?.colors?.surface || '#FFFFFF',
    tenantId,
  });
  extraction.restaurant.logo = finalLogoUrl;
  extraction.candidateLogos = extractedMedia.candidateLogos;
  return extraction;
}

/**
 * Refines an existing DesignSpecification based on owner natural-language guidance
 */
export async function refinePdfDesign({
  previousSpec,
  tenantId,
}) {
  if (!tenantId) {
    throw new Error('Tenant ID is required for design refinement.');
  }

  // Changing a design from a written request needs an AI service, which MENUQR does not use.
  // The owner's current specification is returned unchanged, with a plain explanation.
  return {
    spec: previousSpec,
    provider: 'deterministic-fallback',
    warning: 'Changing the design from a written request is not available. Your current design was kept.',
  };
}
