// MENUQR PDF-to-Digital-Menu Reconstruction Service
// Native PDF understanding via PDFParse and Gemini Multimodal AI

import { GoogleGenAI } from '@google/genai';
import { PDFParse } from 'pdf-parse';
import { validateDesignSpecification } from './designSpecValidator.js';
import { isGeminiAvailable } from './aiDesignService.js';

const MAX_PDF_SIZE_BYTES = 15 * 1024 * 1024; // 15MB
const MAX_PDF_PAGES = 12;

// Candidate models for resilience
const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-flash-latest',
];

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

  // Derive high-fidelity DesignSpecification fallback
  const isFineDining = categories.some(c => /royal|mughlai|heritage|wine|banquet|gourmet/i.test(c.name));
  const composition = isFineDining ? 'editorial' : (categories.length > 4 ? 'compact-bistro' : 'image-showcase');

  const designSpec = {
    version: '1.0',
    composition,
    themeId: 'reconstructed-pdf-theme',
    colors: {
      bg: isFineDining ? '#180912' : '#F9F7F2',
      surface: isFineDining ? '#270F1E' : '#FFFFFF',
      surfaceAlt: isFineDining ? '#2D1223' : '#F4EFE6',
      text: isFineDining ? '#FAF3E0' : '#1F2923',
      textMuted: isFineDining ? '#C9BFA8' : '#68786E',
      heading: isFineDining ? '#E5C058' : '#163328',
      accent: isFineDining ? '#D4AF37' : '#C4703C',
      border: isFineDining ? 'rgba(212, 175, 55, 0.35)' : 'rgba(22, 51, 40, 0.15)',
      badgeBg: isFineDining ? '#D4AF37' : '#C4703C',
      badgeText: '#FFFFFF',
    },
    typography: {
      headingFont: isFineDining ? "'Cinzel', serif" : "'Plus Jakarta Sans', sans-serif",
      bodyFont: "'Plus Jakarta Sans', sans-serif",
      style: isFineDining ? 'serif' : 'sans',
      headingWeight: 'bold',
    },
    header: {
      style: isFineDining ? 'centered-crest' : 'minimal-stacked',
      showLogo: true,
      decorativeElement: isFineDining ? 'crest' : 'minimal-line',
      crestType: isFineDining ? 'crown' : 'none',
    },
    categories: {
      navStyle: 'pills',
      headerStyle: isFineDining ? 'arch' : 'divider-line',
    },
    items: {
      cardStyle: composition === 'compact-bistro' ? 'compact-row' : (composition === 'image-showcase' ? 'photo-hero' : 'classic-leader'),
      imagePosition: 'right',
      priceStyle: composition === 'compact-bistro' ? 'pill-badge' : 'aligned-right',
    },
    decorations: {
      texture: isFineDining ? 'silk-lattice' : 'clean',
      borderRadius: 'md',
      borderStyle: 'hairline',
      shadow: 'subtle',
    },
  };

  const rawName = typeof filename === 'string' ? filename : (inspectedData?.fileName || inspectedData?.filename || 'Restaurant Menu');
  const cleanFilename = rawName.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');

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
      'Document parsed via deterministic text engine (Gemini AI was offline or unconfigured). Please review dish names and prices carefully.'
    ],
  };
}

/**
 * Main PDF Extraction Pipeline: Multimodal Gemini + Fallback
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

  // 3. Check Gemini Availability
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    return deterministicPdfExtraction(inspectedData.rawText, filename, inspectedData);
  }

  // 4. Multimodal AI Extraction with Gemini
  const base64Data = buffer.toString('base64');
  const promptText = `
You are the Chief Document Extraction Architect & Art Director for MENUQR, a premium restaurant menu platform.
Analyze this attached PDF menu document with forensic precision. The original PDF is the visual and data source of truth.

TASK:
1. Extract all structured menu content: restaurant identity, categories, dishes, descriptions, exact prices, portions/variants (Half/Full), add-ons, and dietary indicators (veg, non-veg, vegan, egg).
2. Extract the visual design specification: dominant color palette, background, typography (closest web-ready Google font), layout density, column arrangement, headers, and decorative style.
3. DO NOT invent dishes or prices. If a price is blurry, missing, or uncertain, set price to null and add a specific message in "warnings".
4. Preserve Indian Rupee (₹) prices, multilingual dish titles (including Hindi or regional scripts), and Half/Full price pairs.

OUTPUT FORMAT: Return ONLY a valid JSON object matching this exact structure:
{
  "restaurant": {
    "name": "Restaurant Name from PDF or best inference",
    "cuisine": "Cuisine type (e.g. North Indian, Continental, Cafe)",
    "tagline": "Tagline or slogan from document if present",
    "description": "Brief description from document if present",
    "address": "Address if printed on menu",
    "phone": "Phone number if printed on menu",
    "openingHours": "Timings if printed on menu"
  },
  "categories": [
    {
      "name": "Category Heading (e.g. STARTERS & APPETIZERS)",
      "description": "Category subtitle or info if printed",
      "items": [
        {
          "name": "Exact Dish Name",
          "description": "Ingredients / description from PDF",
          "price": 280,
          "halfPrice": null,
          "fullPrice": null,
          "pricingType": "single",
          "variants": [
            { "name": "Portion / Size", "price": 280 }
          ],
          "addonGroups": [
            {
              "name": "Add Extra Cheese",
              "isRequired": false,
              "minSelect": 0,
              "maxSelect": 1,
              "options": [{ "name": "Extra Mozzarella", "price": 40 }]
            }
          ],
          "dietType": "veg",
          "confidence": 0.95,
          "warnings": []
        }
      ]
    }
  ],
  "designSpec": {
    "version": "1.0",
    "composition": "editorial",
    "themeId": "pdf-bespoke-theme",
    "colors": {
      "bg": "#HEX or rgba",
      "surface": "#HEX or rgba",
      "surfaceAlt": "#HEX or rgba",
      "text": "#HEX or rgba",
      "textMuted": "#HEX or rgba",
      "heading": "#HEX or rgba",
      "accent": "#HEX or rgba",
      "border": "#HEX or rgba",
      "badgeBg": "#HEX or rgba",
      "badgeText": "#HEX or rgba"
    },
    "typography": {
      "headingFont": "Closest Google Font: 'Cinzel', serif | 'Playfair Display', serif | 'Bodoni Moda', serif | 'Montserrat', sans-serif | 'Plus Jakarta Sans', sans-serif | 'Inter', sans-serif | 'Oswald', sans-serif | 'Bebas Neue', sans-serif",
      "bodyFont": "'Plus Jakarta Sans', sans-serif",
      "style": "serif | sans | display",
      "headingWeight": "bold"
    },
    "header": {
      "style": "centered-crest | split-masthead | minimal-stacked | banner-hero",
      "showLogo": true,
      "decorativeElement": "crest | minimal-line | botanical | dots | none",
      "crestType": "crown | lotus | coffee | star | none"
    },
    "categories": {
      "navStyle": "pills | underline | chips | floating-glass",
      "headerStyle": "divider-line | arch | badge | minimal-subtle"
    },
    "items": {
      "cardStyle": "classic-leader | photo-hero | modern-card | compact-row",
      "imagePosition": "top | right | left | none",
      "priceStyle": "aligned-right | pill-badge | bold-inline"
    },
    "decorations": {
      "texture": "subtle-grain | silk-lattice | parchment | clean | dots",
      "borderRadius": "none | sm | md | lg | xl | full",
      "borderStyle": "none | hairline | solid | double",
      "shadow": "none | subtle | elevated | glass"
    }
  },
  "warnings": []
}

CRITICAL RULES:
- If an item has Half and Full prices (e.g. "Half 140 / Full 260"), set pricingType to "portion", halfPrice to 140, fullPrice to 260, price to 260, and variants to [{"name":"Half","price":140},{"name":"Full","price":260}].
- Contrast Rule: Ensure WCAG readable contrast between text/heading and bg/surface. Never output black text on black background.
- Dietary Rule: Assign dietType = "veg", "non-veg", "vegan", or "egg" accurately based on dish name, ingredients, or green/red dots on the PDF.
`;

  const ai = new GoogleGenAI({ apiKey });
  let lastError = null;

  for (const activeModel of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: activeModel,
        contents: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: base64Data,
            },
          },
          promptText,
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2, // Low temperature for maximum extraction precision
        },
      });

      const responseText = response.text?.trim() || '';
      if (!responseText) {
        throw new Error(`Model ${activeModel} returned an empty response.`);
      }

      const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
      const parsed = JSON.parse(cleanJson);

      // Validate categories
      if (!Array.isArray(parsed.categories) || parsed.categories.length === 0) {
        throw new Error('Gemini response missing categories array.');
      }

      // Validate & sanitize design specification
      let validatedSpec = validateDesignSpecification(parsed.designSpec);
      if (!validatedSpec) {
        console.warn('Gemini designSpec failed validation, constructing normalized specification.');
        const fallbackRes = deterministicPdfExtraction(inspectedData.rawText, filename, inspectedData);
        validatedSpec = fallbackRes.designSpec;
      }

      // Normalize items & prices
      const normalizedCategories = parsed.categories.map((cat, cIdx) => ({
        id: `cat-${cIdx + 1}`,
        name: String(cat.name || `Section ${cIdx + 1}`).trim(),
        description: String(cat.description || '').trim(),
        items: Array.isArray(cat.items) ? cat.items.map((it, iIdx) => {
          const rawPrice = Number(it.price);
          const price = Number.isFinite(rawPrice) && rawPrice >= 0 ? rawPrice : null;
          const halfPrice = Number.isFinite(Number(it.halfPrice)) ? Number(it.halfPrice) : null;
          const fullPrice = Number.isFinite(Number(it.fullPrice)) ? Number(it.fullPrice) : null;
          
          return {
            id: `item-${cIdx + 1}-${iIdx + 1}`,
            name: String(it.name || 'Untitled Dish').trim(),
            description: String(it.description || '').trim(),
            price,
            halfPrice,
            fullPrice,
            pricingType: ['single', 'portion', 'variants'].includes(it.pricingType) ? it.pricingType : (halfPrice ? 'portion' : 'single'),
            variants: Array.isArray(it.variants) ? it.variants.map(v => ({
              name: String(v.name || 'Standard').trim(),
              price: Number(v.price) || 0
            })) : [],
            addonGroups: Array.isArray(it.addonGroups) ? it.addonGroups : [],
            dietType: ['veg', 'non-veg', 'vegan', 'egg'].includes(String(it.dietType).toLowerCase()) ? String(it.dietType).toLowerCase() : 'veg',
            confidence: typeof it.confidence === 'number' ? it.confidence : 0.9,
            warnings: Array.isArray(it.warnings) ? it.warnings : (price === null ? ['Price was missing or unclear in document.'] : [])
          };
        }) : []
      }));

      return {
        success: true,
        provider: 'gemini',
        model: activeModel,
        pageCount: inspectedData.pageCount,
        isScanned: inspectedData.isScanned,
        restaurant: {
          name: parsed.restaurant?.name || filename.replace(/\.pdf$/i, ''),
          cuisine: parsed.restaurant?.cuisine || 'Contemporary Cuisine',
          tagline: parsed.restaurant?.tagline || '',
          description: parsed.restaurant?.description || '',
          address: parsed.restaurant?.address || '',
          phone: parsed.restaurant?.phone || '',
          openingHours: parsed.restaurant?.openingHours || '11:00 AM - 11:00 PM',
        },
        categories: normalizedCategories,
        designSpec: validatedSpec,
        warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
      };
    } catch (err) {
      lastError = err;
      console.warn(`PDF extraction attempt with ${activeModel} failed:`, err.message?.slice(0, 150));
    }
  }

  console.warn('All Gemini models failed for PDF extraction, running deterministic fallback.');
  const fallback = deterministicPdfExtraction(inspectedData.rawText, filename, inspectedData);
  fallback.warnings.push(`AI extraction unavailable (${lastError?.message || 'high demand'}). Analyzed via local deterministic engine.`);
  return fallback;
}

/**
 * Refines an existing DesignSpecification based on owner natural-language guidance
 */
export async function refinePdfDesign({
  previousSpec,
  prompt,
  tenantId,
}) {
  if (!tenantId) {
    throw new Error('Tenant ID is required for design refinement.');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !isGeminiAvailable()) {
    return {
      spec: previousSpec,
      provider: 'deterministic-fallback',
      warning: 'Gemini API is not configured. Kept previous design specification.',
    };
  }

  const promptText = `
You are the Executive Art Director for MENUQR.
The restaurant owner has requested an iterative revision to their menu design.

PREVIOUS DESIGN SPECIFICATION:
${JSON.stringify(previousSpec, null, 2)}

OWNER'S DESIGN REVISION REQUEST:
"${prompt}"

INSTRUCTIONS:
- Apply the owner's desired changes (e.g. color adjustments, font styles, header layout, card density) while preserving overall aesthetic harmony.
- Ensure strict WCAG AA contrast.
- Output ONLY the updated DesignSpecification JSON matching version "1.0".
`;

  const ai = new GoogleGenAI({ apiKey });

  for (const activeModel of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: activeModel,
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.5,
        },
      });

      const responseText = response.text?.trim() || '';
      const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
      const parsed = JSON.parse(cleanJson);

      const validated = validateDesignSpecification(parsed);
      if (validated) {
        return {
          spec: validated,
          provider: 'gemini',
          model: activeModel,
        };
      }
    } catch (err) {
      console.warn(`Design refinement with ${activeModel} failed:`, err.message?.slice(0, 150));
    }
  }

  return {
    spec: previousSpec,
    provider: 'deterministic-fallback',
    warning: 'Could not apply AI revision. Kept current design specification.',
  };
}
