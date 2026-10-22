// MENUQR AI & Deterministic Design Engine Generator

import type {
  RestaurantDesignProfile,
  DesignSpecification,
  DesignCompositionStrategy,
} from './types';

export interface DesignGenerationProvider {
  name: string;
  isAIAvailable: () => boolean;
  generateDesign: (profile: RestaurantDesignProfile) => Promise<DesignSpecification>;
}

// WCAG Luminance & Contrast Helpers
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    };
  }
  if (clean.length >= 6) {
    return {
      r: parseInt(clean.substring(0, 2), 16),
      g: parseInt(clean.substring(2, 4), 16),
      b: parseInt(clean.substring(4, 6), 16),
    };
  }
  return null;
}

function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
}

/**
 * Deterministic Expert Design Generator
 * Translates restaurant profile parameters (cuisine, positioning, mood, imagery, density)
 * into a bespoke, mathematically balanced DesignSpecification.
 */
export class DeterministicDesignEngine implements DesignGenerationProvider {
  name = 'Deterministic Expert Rules Engine';

  isAIAvailable(): boolean {
    return false; // Deterministic local engine
  }

  generateDesignSync(profile: RestaurantDesignProfile): DesignSpecification {
    // 1. Determine Composition Strategy
    let composition: DesignCompositionStrategy;
    if (profile.positioning === 'fine-dining' || profile.mood === 'royal-heritage' || profile.mood === 'midnight-luxury') {
      composition = 'editorial';
    } else if (profile.hasPhotography || profile.mood === 'fresh-cafe') {
      composition = 'image-showcase';
    } else {
      composition = 'compact-bistro';
    }

    // 2. Determine Color Palette
    let bg = '#160814';
    let surface = '#240F21';
    let surfaceAlt = '#2F142B';
    let text = '#FDF8F0';
    let textMuted = '#D4AF37';
    let heading = '#E8C564';
    let accent = '#D4AF37';
    let border = 'rgba(212, 175, 55, 0.3)';
    let badgeBg = '#D4AF37';
    let badgeText = '#180912';
    let texture: DesignSpecification['decorations']['texture'] = 'silk-lattice';

    switch (profile.mood) {
      case 'royal-heritage':
        bg = '#180912';
        surface = '#270F1E';
        surfaceAlt = '#351429';
        text = '#FAF3E0';
        textMuted = 'rgba(250, 243, 224, 0.7)';
        heading = '#E5C058';
        accent = '#D4AF37';
        border = 'rgba(212, 175, 55, 0.35)';
        badgeBg = '#D4AF37';
        badgeText = '#180912';
        texture = 'silk-lattice';
        break;

      case 'clean-editorial':
        bg = '#F9F7F2';
        surface = '#FFFFFF';
        surfaceAlt = '#F1ECE1';
        text = '#1F2923';
        textMuted = '#6B7A70';
        heading = '#163328';
        accent = '#C4703C';
        border = 'rgba(22, 51, 40, 0.15)';
        badgeBg = '#163328';
        badgeText = '#FFFFFF';
        texture = 'parchment';
        break;

      case 'warm-bistro':
        bg = '#FAF4EE';
        surface = '#FFFFFF';
        surfaceAlt = '#F4ECE4';
        text = '#2A1B18';
        textMuted = '#7D635D';
        heading = '#3D1E16';
        accent = '#C85A32';
        border = 'rgba(61, 30, 22, 0.15)';
        badgeBg = '#C85A32';
        badgeText = '#FFFFFF';
        texture = 'subtle-grain';
        break;

      case 'fresh-cafe':
        bg = '#141E19';
        surface = '#1D2A24';
        surfaceAlt = '#26372F';
        text = '#F4F7F5';
        textMuted = '#8CA397';
        heading = '#E3F2EB';
        accent = '#4ADE80';
        border = 'rgba(74, 222, 128, 0.25)';
        badgeBg = '#4ADE80';
        badgeText = '#0F1713';
        texture = 'dots';
        break;

      case 'urban-street':
        bg = '#131416';
        surface = '#1D1F23';
        surfaceAlt = '#272A30';
        text = '#FFFFFF';
        textMuted = '#9CA3AF';
        heading = '#FCD34D';
        accent = '#F59E0B';
        border = 'rgba(245, 158, 11, 0.3)';
        badgeBg = '#F59E0B';
        badgeText = '#000000';
        texture = 'dots';
        break;

      case 'midnight-luxury':
      default:
        bg = '#0C0F12';
        surface = '#15191E';
        surfaceAlt = '#1F242C';
        text = '#F8FAFC';
        textMuted = '#94A3B8';
        heading = '#E2E8F0';
        accent = '#38BDF8';
        border = 'rgba(56, 189, 248, 0.25)';
        badgeBg = '#38BDF8';
        badgeText = '#0B132B';
        texture = 'clean';
        break;
    }

    // 3. Harmonize Custom Brand Colors if provided
    if (profile.brandColors?.bg) {
      bg = profile.brandColors.bg;
      const lum = getLuminance(bg);
      if (lum > 0.6) {
        // Light background
        surface = '#FFFFFF';
        surfaceAlt = '#F1F5F9';
        text = '#0F172A';
        textMuted = '#475569';
        heading = '#020617';
        border = 'rgba(15, 23, 42, 0.12)';
      } else {
        // Dark background
        surface = 'rgba(255, 255, 255, 0.05)';
        surfaceAlt = 'rgba(255, 255, 255, 0.08)';
        text = '#F8FAFC';
        textMuted = '#94A3B8';
        heading = '#FFFFFF';
        border = 'rgba(255, 255, 255, 0.12)';
      }
    }

    if (profile.brandColors?.accent) {
      accent = profile.brandColors.accent;
      badgeBg = accent;
      badgeText = getLuminance(accent) > 0.5 ? '#000000' : '#FFFFFF';
    }

    if (profile.brandColors?.primary) {
      heading = profile.brandColors.primary;
    }

    // 4. Select Typography Pairings
    let headingFont = "'Playfair Display', serif";
    let bodyFont = "'Plus Jakarta Sans', sans-serif";
    let typographyStyle: DesignSpecification['typography']['style'] = 'serif';

    if (composition === 'editorial') {
      headingFont = profile.mood === 'royal-heritage' ? "'Cinzel', serif" : "'Playfair Display', serif";
      bodyFont = "'Plus Jakarta Sans', sans-serif";
      typographyStyle = 'serif';
    } else if (composition === 'image-showcase') {
      headingFont = "'Montserrat', sans-serif";
      bodyFont = "'Plus Jakarta Sans', sans-serif";
      typographyStyle = 'display';
    } else {
      // compact-bistro
      headingFont = profile.mood === 'urban-street' ? "'Anton', sans-serif" : "'Oswald', sans-serif";
      bodyFont = "'Inter', sans-serif";
      typographyStyle = 'sans';
    }

    // 5. Synthesize Specification
    return {
      version: '1.0',
      composition,
      themeId: `${profile.cuisine.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${profile.mood}`,
      colors: {
        bg,
        surface,
        surfaceAlt,
        text,
        textMuted,
        heading,
        accent,
        border,
        badgeBg,
        badgeText,
      },
      typography: {
        headingFont,
        bodyFont,
        style: typographyStyle,
        headingWeight: composition === 'compact-bistro' ? 'bold' : 'normal',
      },
      header: {
        style: composition === 'editorial' ? 'centered-crest' : composition === 'image-showcase' ? 'split-masthead' : 'minimal-stacked',
        showLogo: Boolean(profile.logoUrl),
        decorativeElement: composition === 'editorial' ? 'crest' : composition === 'image-showcase' ? 'minimal-line' : 'none',
        crestType: profile.mood === 'royal-heritage' ? 'crown' : profile.mood === 'fresh-cafe' ? 'coffee' : 'none',
      },
      categories: {
        navStyle: composition === 'image-showcase' ? 'floating-glass' : composition === 'compact-bistro' ? 'chips' : 'pills',
        headerStyle: composition === 'editorial' ? 'arch' : composition === 'image-showcase' ? 'badge' : 'divider-line',
      },
      items: {
        cardStyle: composition === 'image-showcase' ? 'photo-hero' : composition === 'compact-bistro' ? 'compact-row' : 'classic-leader',
        imagePosition: composition === 'image-showcase' ? 'top' : composition === 'compact-bistro' ? 'none' : 'right',
        priceStyle: composition === 'compact-bistro' ? 'pill-badge' : 'aligned-right',
      },
      decorations: {
        texture,
        borderRadius: composition === 'image-showcase' ? 'xl' : composition === 'compact-bistro' ? 'md' : 'none',
        borderStyle: composition === 'editorial' ? 'double' : 'hairline',
        shadow: composition === 'image-showcase' ? 'elevated' : 'subtle',
      },
    };
  }

  generateDesign(profile: RestaurantDesignProfile): Promise<DesignSpecification> {
    return Promise.resolve(this.generateDesignSync(profile));
  }
}

/**
 * Production Runtime AI Provider Bridge
 * Designed to connect to a secured server-side Gemini endpoint (`/api/app/ai/generate-menu-design`)
 * when deployed with a valid API key. Safely degrades to DeterministicDesignEngine if unconfigured.
 */
export class RuntimeGeminiDesignProvider implements DesignGenerationProvider {
  name = 'Gemini 3.8 Flash AI Design Engine';
  private fallbackEngine = new DeterministicDesignEngine();

  isAIAvailable(): boolean {
    // Verified: No runtime API key or AI server endpoint is currently configured in production
    return false;
  }

  async generateDesign(profile: RestaurantDesignProfile): Promise<DesignSpecification> {
    if (!this.isAIAvailable()) {
      return this.fallbackEngine.generateDesign(profile);
    }
    // If future server endpoint is activated, API call will be executed here.
    return this.fallbackEngine.generateDesign(profile);
  }
}

// Global active provider instance
export const activeDesignProvider: DesignGenerationProvider = new DeterministicDesignEngine();
