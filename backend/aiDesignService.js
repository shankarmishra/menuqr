// MENUQR Backend Gemini AI Design Service
// Uses official @google/genai SDK with multimodal reference image understanding & schema validation

import { GoogleGenAI } from '@google/genai';
import { validateDesignSpecification } from './designSpecValidator.js';

// Rate limiting: tenantId -> Array of timestamps
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;

function checkRateLimit(tenantId) {
  const now = Date.now();
  const timestamps = rateLimitMap.get(tenantId) || [];
  const validTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
  
  if (validTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  validTimestamps.push(now);
  rateLimitMap.set(tenantId, validTimestamps);
  return true;
}

export function isGeminiAvailable() {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
}

/**
 * Fallback deterministic generator if Gemini API key is absent or network fails
 */
function generateDeterministicFallback(profile) {
  const isFineDining = profile.positioning === 'fine-dining' || profile.mood === 'royal-heritage';
  const hasPhotos = Boolean(profile.hasPhotography);
  const composition = isFineDining ? 'editorial' : (hasPhotos ? 'image-showcase' : 'compact-bistro');

  let bg = '#180912';
  let surface = '#270F1E';
  let text = '#FAF3E0';
  let heading = '#E5C058';
  let accent = '#D4AF37';
  let border = 'rgba(212, 175, 55, 0.35)';

  if (profile.mood === 'clean-editorial') {
    bg = '#F9F7F2';
    surface = '#FFFFFF';
    text = '#1F2923';
    heading = '#163328';
    accent = '#C4703C';
    border = 'rgba(22, 51, 40, 0.15)';
  } else if (profile.mood === 'warm-bistro') {
    bg = '#FAF4EE';
    surface = '#FFFFFF';
    text = '#2A1B18';
    heading = '#3D1E16';
    accent = '#C85A32';
    border = 'rgba(61, 30, 22, 0.15)';
  } else if (profile.mood === 'fresh-cafe') {
    bg = '#141E19';
    surface = '#1D2A24';
    text = '#F4F7F5';
    heading = '#E3F2EB';
    accent = '#4ADE80';
    border = 'rgba(74, 222, 128, 0.25)';
  }

  // Brand color overrides
  if (profile.brandColors?.primary) heading = profile.brandColors.primary;
  if (profile.brandColors?.accent) accent = profile.brandColors.accent;
  if (profile.brandColors?.bg) bg = profile.brandColors.bg;

  return {
    version: '1.0',
    composition,
    themeId: `${profile.cuisine.toLowerCase().replace(/[^a-z0-9]/g, '-')}-fallback`,
    colors: {
      bg,
      surface,
      surfaceAlt: surface,
      text,
      textMuted: text,
      heading,
      accent,
      border,
      badgeBg: accent,
      badgeText: '#FFFFFF',
    },
    typography: {
      headingFont: composition === 'editorial' ? "'Cinzel', serif" : composition === 'image-showcase' ? "'Montserrat', sans-serif" : "'Oswald', sans-serif",
      bodyFont: "'Plus Jakarta Sans', sans-serif",
      style: composition === 'editorial' ? 'serif' : 'sans',
      headingWeight: 'bold',
    },
    header: {
      style: composition === 'editorial' ? 'centered-crest' : composition === 'image-showcase' ? 'split-masthead' : 'minimal-stacked',
      showLogo: Boolean(profile.logoUrl),
      decorativeElement: composition === 'editorial' ? 'crest' : 'none',
      crestType: profile.mood === 'royal-heritage' ? 'crown' : 'none',
    },
    categories: {
      navStyle: composition === 'image-showcase' ? 'floating-glass' : 'pills',
      headerStyle: composition === 'editorial' ? 'arch' : 'divider-line',
    },
    items: {
      cardStyle: composition === 'image-showcase' ? 'photo-hero' : composition === 'compact-bistro' ? 'compact-row' : 'classic-leader',
      imagePosition: composition === 'image-showcase' ? 'top' : 'right',
      priceStyle: composition === 'compact-bistro' ? 'pill-badge' : 'aligned-right',
    },
    decorations: {
      texture: composition === 'editorial' ? 'silk-lattice' : 'clean',
      borderRadius: composition === 'image-showcase' ? 'xl' : 'md',
      borderStyle: composition === 'editorial' ? 'double' : 'hairline',
      shadow: composition === 'image-showcase' ? 'elevated' : 'subtle',
    },
  };
}

/**
 * Main AI Menu Design Generation function
 */
export async function generateAiMenuDesign({
  tenantId,
  profile,
  brief = '',
  referenceImage = null,
  previousSpec = null,
  isRevision = false,
}) {
  if (!tenantId) {
    throw new Error('Tenant ID is required for design generation.');
  }

  // 1. Check Rate Limit
  if (!checkRateLimit(tenantId)) {
    throw new Error('Rate limit exceeded. Maximum 10 design generations per minute allowed.');
  }

  // 2. Check Gemini Availability
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    const fallbackSpec = generateDeterministicFallback(profile);
    return {
      spec: fallbackSpec,
      provider: 'deterministic-fallback',
      message: 'GEMINI_API_KEY is not configured on the server. Generated with expert deterministic design engine.',
    };
  }

  // 3. Prepare Multimodal Parts
  const contents = [];
  
  if (referenceImage && typeof referenceImage === 'string') {
    // Expected format: data:image/(png|jpeg|jpg|webp);base64,...
    const match = referenceImage.match(/^data:(image\/(png|jpeg|jpg|webp));base64,(.+)$/i);
    if (match) {
      const mimeType = match[1];
      const base64Data = match[3];
      // Size check: 4MB limit on base64 data (~3MB file)
      if (base64Data.length <= 4 * 1024 * 1024) {
        contents.push({
          inlineData: {
            mimeType,
            data: base64Data,
          },
        });
      }
    }
  }

  // 4. Construct System Instruction & Context Prompt
  const promptText = `
You are the Executive Menu Art Director and Design System Architect for MENUQR, a premier digital restaurant menu platform.
Your task is to analyze the restaurant's identity and produce a bespoke, mathematically balanced, visually stunning DesignSpecification in pure JSON.

RESTAURANT PROFILE:
- Business Name: "${profile.businessName}"
- Cuisine: "${profile.cuisine}"
- Positioning: "${profile.positioning}" (fine-dining | casual | contemporary | rustic | minimalist)
- Mood / Atmosphere: "${profile.mood}"
- Has Photography: ${Boolean(profile.hasPhotography)}
- Menu Density: "${profile.menuDensity || 'balanced'}"
- Tagline: "${profile.tagline || ''}"
${profile.brandColors?.primary ? `- Brand Primary: ${profile.brandColors.primary}` : ''}
${profile.brandColors?.accent ? `- Brand Accent: ${profile.brandColors.accent}` : ''}
${profile.brandColors?.bg ? `- Brand Background: ${profile.brandColors.bg}` : ''}

OWNER'S DESIGN BRIEF & VISION:
"${brief || 'Create a bespoke design that perfectly mirrors the cuisine and positioning of this restaurant.'}"

${isRevision && previousSpec ? `
THIS IS A REVISION REQUEST.
Previous Approved Specification:
${JSON.stringify(previousSpec, null, 2)}
Apply the requested changes from the brief while maintaining overall harmony and brand identity.
` : ''}

${contents.length > 0 ? `
ANALYZE THE ATTACHED REFERENCE IMAGE:
- Extract the dominant mood, lighting, color palette (background, surface, text, accent, and borders).
- Observe typography characteristics (serif elegance, bold geometric sans, architectural minimal).
- Emulate the aesthetic feel in the generated DesignSpecification.
` : ''}

STRICT ARCHITECTURAL REQUIREMENTS:
1. Version must be "1.0".
2. Composition must be exactly one of: "editorial" | "image-showcase" | "compact-bistro".
   - Choose "editorial" for fine dining, royal heritage, tasting menus, luxury wine bars, banquets.
   - Choose "image-showcase" for contemporary, photography-forward cafes, burger lounges, sushi bars, dessert studios.
   - Choose "compact-bistro" for fast-casual, high-density menus, pizzerias, street food counters, delis.
3. Colors:
   - Provide "bg", "surface", "surfaceAlt", "text", "textMuted", "heading", "accent", "border", "badgeBg", "badgeText".
   - All colors MUST be valid hex codes (e.g. #180912, #D4AF37) or valid rgba strings.
   - CRITICAL CONTRAST RULE: Ensure WCAG AA readable contrast between text/heading and background/surface. Never use dark text on dark backgrounds or light text on light backgrounds.
4. Typography:
   - "headingFont": Must use web-ready fonts such as 'Playfair Display', serif | 'Cinzel', serif | 'Bodoni Moda', serif | 'Montserrat', sans-serif | 'Plus Jakarta Sans', sans-serif | 'Inter', sans-serif | 'Oswald', sans-serif | 'Bebas Neue', sans-serif | 'Philosopher', sans-serif.
   - "bodyFont": Must be legible like 'Plus Jakarta Sans', sans-serif or 'Inter', sans-serif.
   - "style": "serif" | "sans" | "display" | "editorial".
5. Header:
   - "style": "centered-crest" | "split-masthead" | "minimal-stacked" | "banner-hero".
   - "decorativeElement": "crest" | "minimal-line" | "botanical" | "dots" | "none".
   - "crestType": "crown" | "lotus" | "coffee" | "star" | "none".
6. Categories:
   - "navStyle": "pills" | "underline" | "chips" | "floating-glass".
   - "headerStyle": "divider-line" | "arch" | "badge" | "minimal-subtle".
7. Items:
   - "cardStyle": "classic-leader" | "photo-hero" | "modern-card" | "compact-row".
   - "imagePosition": "top" | "right" | "left" | "none".
   - "priceStyle": "aligned-right" | "pill-badge" | "bold-inline".
8. Decorations:
   - "texture": "subtle-grain" | "silk-lattice" | "parchment" | "clean" | "dots".
   - "borderRadius": "none" | "sm" | "md" | "lg" | "xl" | "full".
   - "borderStyle": "none" | "hairline" | "solid" | "double".
   - "shadow": "none" | "subtle" | "elevated" | "glass".

OUTPUT FORMAT: Return ONLY the JSON object. No Markdown fences, no explanation text.
`;

  contents.push(promptText);

  // 5. Execute Gemini Call with SDK & Multi-Model Resilience
  const ai = new GoogleGenAI({ apiKey });
  const CANDIDATE_MODELS = ['gemini-3.5-flash-lite', 'gemini-2.5-flash', 'gemini-flash-latest'];
  let lastError = null;

  for (const activeModel of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: activeModel,
        contents,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const responseText = response.text?.trim() || '';
      if (!responseText) {
        throw new Error(`Model ${activeModel} returned an empty response.`);
      }

      // Clean any accidental markdown markers
      const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
      const parsedData = JSON.parse(cleanJson);

      // Validate specification
      const validatedSpec = validateDesignSpecification(parsedData);
      if (!validatedSpec) {
        console.warn(`Response from ${activeModel} did not pass schema validation.`);
        continue;
      }

      return {
        spec: validatedSpec,
        provider: 'gemini',
        model: activeModel,
      };
    } catch (err) {
      lastError = err;
      console.warn(`Gemini attempt with ${activeModel} failed:`, err.message?.slice(0, 150));
      // Continue to next candidate model
    }
  }

  // If all models failed or failed validation, use deterministic fallback
  console.warn('All Gemini models failed or failed validation, falling back to deterministic engine.');
  const fallbackSpec = generateDeterministicFallback(profile);
  return {
    spec: fallbackSpec,
    provider: 'deterministic-fallback',
    error: lastError ? lastError.message : 'All candidate models unavailable',
    warning: `Gemini design generation unavailable (${lastError ? lastError.message : 'timeout'}). Generated with expert deterministic design engine.`,
  };
}
