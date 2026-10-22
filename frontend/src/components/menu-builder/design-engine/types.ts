// MENUQR AI-Assisted Design Engine — Specification Schema & Types

import type { LayoutProps } from '../templates/types';

export type DesignCompositionStrategy = 'editorial' | 'image-showcase' | 'compact-bistro' | 'heritage-artboard';

export type RestaurantPositioning = 'fine-dining' | 'casual' | 'contemporary' | 'rustic' | 'minimalist';

export type RestaurantMood = 
  | 'royal-heritage' 
  | 'midnight-luxury' 
  | 'clean-editorial' 
  | 'warm-bistro' 
  | 'fresh-cafe' 
  | 'urban-street';

export interface RestaurantDesignProfile {
  businessName: string;
  cuisine: string;
  positioning: RestaurantPositioning;
  mood: RestaurantMood;
  hasPhotography: boolean;
  menuDensity: 'compact' | 'balanced' | 'spacious';
  brandColors?: {
    primary?: string;
    accent?: string;
    bg?: string;
  };
  logoUrl?: string;
  tagline?: string;
  customNotes?: string;
}

export interface DesignSpecification {
  version: '1.0';
  composition: DesignCompositionStrategy;
  themeId?: string;
  colors: {
    bg: string;
    surface: string;
    surfaceAlt: string;
    text: string;
    textMuted: string;
    heading: string;
    accent: string;
    border: string;
    badgeBg: string;
    badgeText: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    style: 'serif' | 'sans' | 'display' | 'editorial';
    headingWeight: 'light' | 'normal' | 'bold' | 'black';
  };
  header: {
    style: 'centered-crest' | 'split-masthead' | 'minimal-stacked' | 'banner-hero';
    showLogo: boolean;
    decorativeElement: 'crest' | 'minimal-line' | 'botanical' | 'dots' | 'none';
    crestType: 'crown' | 'lotus' | 'coffee' | 'star' | 'none';
  };
  categories: {
    navStyle: 'pills' | 'underline' | 'chips' | 'floating-glass';
    headerStyle: 'divider-line' | 'arch' | 'badge' | 'minimal-subtle';
  };
  items: {
    cardStyle: 'classic-leader' | 'photo-hero' | 'modern-card' | 'compact-row';
    imagePosition: 'top' | 'right' | 'left' | 'none';
    priceStyle: 'aligned-right' | 'pill-badge' | 'bold-inline';
  };
  decorations: {
    texture: 'subtle-grain' | 'silk-lattice' | 'parchment' | 'clean' | 'dots';
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    borderStyle: 'none' | 'hairline' | 'solid' | 'double';
    shadow: 'none' | 'subtle' | 'elevated' | 'glass';
  };
}

export interface CompositionProps extends LayoutProps {
  spec: DesignSpecification;
}

// Strict runtime sanitizer to reject malicious or broken values
const SAFE_COLOR_REGEX = /^(#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)|hsl\([^)]+\)|transparent)$/;

function isValidColor(val: unknown): boolean {
  if (typeof val !== 'string') return false;
  return SAFE_COLOR_REGEX.test(val.trim());
}

export function validateDesignSpecification(raw: unknown): DesignSpecification | null {
  if (!raw || typeof raw !== 'object') return null;

  const data = raw as Partial<DesignSpecification>;

  if (data.version !== '1.0') return null;

  const validCompositions: DesignCompositionStrategy[] = ['editorial', 'image-showcase', 'compact-bistro', 'heritage-artboard'];
  if (!data.composition || !validCompositions.includes(data.composition)) {
    return null;
  }

  // Validate colors
  if (!data.colors || typeof data.colors !== 'object') return null;
  const c = data.colors;
  if (
    !isValidColor(c.bg) ||
    !isValidColor(c.surface) ||
    !isValidColor(c.text) ||
    !isValidColor(c.heading) ||
    !isValidColor(c.accent) ||
    !isValidColor(c.border)
  ) {
    return null;
  }

  // Return sanitized specification with guaranteed defaults
  return {
    version: '1.0',
    composition: data.composition,
    themeId: typeof data.themeId === 'string' ? data.themeId : undefined,
    colors: {
      bg: c.bg,
      surface: c.surface,
      surfaceAlt: isValidColor(c.surfaceAlt) ? c.surfaceAlt : c.surface,
      text: c.text,
      textMuted: isValidColor(c.textMuted) ? c.textMuted : c.text,
      heading: c.heading,
      accent: c.accent,
      border: c.border,
      badgeBg: isValidColor(c.badgeBg) ? c.badgeBg : c.accent,
      badgeText: isValidColor(c.badgeText) ? c.badgeText : '#FFFFFF',
    },
    typography: {
      headingFont: typeof data.typography?.headingFont === 'string' ? data.typography.headingFont : "'Playfair Display', serif",
      bodyFont: typeof data.typography?.bodyFont === 'string' ? data.typography.bodyFont : "'Plus Jakarta Sans', sans-serif",
      style: data.typography?.style || 'serif',
      headingWeight: data.typography?.headingWeight || 'bold',
    },
    header: {
      style: data.header?.style || 'centered-crest',
      showLogo: Boolean(data.header?.showLogo ?? true),
      decorativeElement: data.header?.decorativeElement || 'crest',
      crestType: data.header?.crestType || 'none',
    },
    categories: {
      navStyle: data.categories?.navStyle || 'pills',
      headerStyle: data.categories?.headerStyle || 'divider-line',
    },
    items: {
      cardStyle: data.items?.cardStyle || (data.composition === 'image-showcase' ? 'photo-hero' : data.composition === 'compact-bistro' ? 'compact-row' : 'classic-leader'),
      imagePosition: data.items?.imagePosition || (data.composition === 'image-showcase' ? 'top' : 'right'),
      priceStyle: data.items?.priceStyle || 'aligned-right',
    },
    decorations: {
      texture: data.decorations?.texture || 'clean',
      borderRadius: data.decorations?.borderRadius || 'md',
      borderStyle: data.decorations?.borderStyle || 'hairline',
      shadow: data.decorations?.shadow || 'subtle',
    },
  };
}
