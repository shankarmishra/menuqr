export interface MenuTemplate {
  id: string;
  name: string;
  subtitle: string;
  categories: string[];
  description: string;
  badge?: string;
  colors: {
    bg: string;
    surface: string;
    text: string;
    heading: string;
    accent: string;
    secondary: string;
    border: string;
  };
  typography: {
    heading: string;
    body: string;
    style: 'serif' | 'sans' | 'handwritten' | 'editorial' | 'display';
  };
  layout: {
    type: 'centered' | 'left-aligned' | 'two-column' | 'card-grid' | 'editorial' | 'magazine';
    headerStyle: 'ornate' | 'minimal' | 'banner' | 'typographic' | 'hero-image' | 'split' | 'arch' | 'woven' | 'street';
    itemStyle: 'inline' | 'card' | 'detailed-card' | 'image-card' | 'list' | 'grid' | 'michelin' | 'compact-badge';
    categoryStyle: 'underline' | 'badge' | 'ornamental' | 'tab' | 'section-header' | 'chip' | 'arch-title';
    separator: 'line' | 'dots' | 'ornament' | 'none' | 'gradient' | 'double-line';
    spacing: 'compact' | 'normal' | 'spacious' | 'luxury';
  };
  decorations: {
    motif: string;
    borderStyle: string;
    hasPattern: boolean;
    patternType?: 'damask' | 'arch' | 'woven' | 'grain' | 'temple' | 'dots';
    patternOpacity: number;
  };
}

export function isColorDark(hex?: string): boolean {
  if (!hex || typeof hex !== 'string') return false;
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 128;
  }
  if (cleanHex.length >= 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 128;
  }
  return false;
}

export function isTemplateDark(template?: MenuTemplate | null): boolean {
  if (!template) return false;
  return isColorDark(template.colors.bg);
}

export const menuTemplates: MenuTemplate[] = [
  // 01. ROYAL MAHARAJA
  {
    id: 'royal-maharaja',
    name: 'Royal Maharaja',
    subtitle: 'Delhi Luxury Indian Palace Dining',
    categories: ['Indian', 'Luxury', 'Traditional'],
    description: 'Deep wine and antique gold with ornate palace crests, gold double line borders, and Playfair Display serif typography.',
    badge: 'Popular',
    colors: {
      bg: '#2A081A',
      surface: '#3D0D27',
      text: '#FAF3E0',
      heading: '#D4AF37',
      accent: '#D4AF37',
      secondary: '#C59B27',
      border: 'rgba(212, 175, 55, 0.35)',
    },
    typography: {
      heading: "'Playfair Display', serif",
      body: "'Plus Jakarta Sans', sans-serif",
      style: 'serif',
    },
    layout: {
      type: 'centered',
      headerStyle: 'ornate',
      itemStyle: 'detailed-card',
      categoryStyle: 'ornamental',
      separator: 'ornament',
      spacing: 'luxury',
    },
    decorations: {
      motif: 'Ornate Palace Gold Crest',
      borderStyle: 'double gold frame',
      hasPattern: true,
      patternType: 'damask',
      patternOpacity: 0.08,
    },
  },

  // 02. HERITAGE PARCHMENT ATELIER (RAJASTHANI HERITAGE)
  {
    id: 'rajasthani-heritage',
    name: 'Heritage Parchment Atelier',
    subtitle: 'Indian Botanical Parchment & Scalloped Arch Edition',
    categories: ['Royal Heritage', 'Fine Dining', 'Traditional', 'Indian'],
    description: 'Warm antique cream parchment, deep teal framing, terracotta botanical floral borders, central scalloped arch, blooming lotus emblem, and curated food photography.',
    badge: 'Art-Directed Masterpiece',
    colors: {
      bg: '#F7EBD7',
      surface: '#FCF5E9',
      text: '#35463E',
      heading: '#244740',
      accent: '#D76C3C',
      secondary: '#315A53',
      border: '#315A53',
    },
    typography: {
      heading: "'Cinzel', 'Playfair Display', serif",
      body: "'Plus Jakarta Sans', sans-serif",
      style: 'serif',
    },
    layout: {
      type: 'editorial',
      headerStyle: 'arch',
      itemStyle: 'detailed-card',
      categoryStyle: 'arch-title',
      separator: 'ornament',
      spacing: 'luxury',
    },
    decorations: {
      motif: 'Botanical Floral Vine & Scalloped Arch',
      borderStyle: '5-layer teal gold floral border',
      hasPattern: true,
      patternType: 'arch',
      patternOpacity: 0.15,
    },
  },

  // 03. MUGHAL LUXE (EMERALD HERITAGE)
  {
    id: 'mughal-luxe',
    name: 'Mughal Luxe',
    subtitle: 'Indian Palace Arches & Antique Gold Foil Edition',
    categories: ['Royal Heritage', 'Fine Dining', 'North Indian', 'Luxury'],
    description: 'Deep emerald-green heritage artwork, antique-gold ornamental borders, Indian palace-inspired cusped arches, handcrafted ivory menu pages, authentic food photography, and refined editorial typography.',
    badge: 'Signature Masterpiece',
    colors: {
      bg: '#064F43',
      surface: '#F5EBDD',
      text: '#F5EBDD',
      heading: '#D7B66D',
      accent: '#D7B66D',
      secondary: '#073D34',
      border: '#C9A967',
    },
    typography: {
      heading: "'Cormorant Garamond', Georgia, serif",
      body: "'Plus Jakarta Sans', sans-serif",
      style: 'serif',
    },
    layout: {
      type: 'editorial',
      headerStyle: 'arch',
      itemStyle: 'detailed-card',
      categoryStyle: 'arch-title',
      separator: 'ornament',
      spacing: 'luxury',
    },
    decorations: {
      motif: 'Palace Arch & Lotus Ornaments',
      borderStyle: 'emerald gold jaali border',
      hasPattern: true,
      patternType: 'arch',
      patternOpacity: 0.08,
    },
  },

  // 04. BANARASI GOLD
  {
    id: 'banarasi-gold',
    name: 'Banarasi Gold',
    subtitle: 'Luxury Silk Weave × Heritage',
    categories: ['Indian', 'Luxury', 'Traditional'],
    description: 'Burgundy silk canvas with subtle woven textile patterns, centered Philosopher typography, and double gold rule borders.',
    colors: {
      bg: '#28081B',
      surface: '#3A0D28',
      text: '#FFF9EF',
      heading: '#FFD700',
      accent: '#FFD700',
      secondary: '#E0A96D',
      border: 'rgba(255, 215, 0, 0.28)',
    },
    typography: {
      heading: "'Philosopher', sans-serif",
      body: "'Plus Jakarta Sans', sans-serif",
      style: 'serif',
    },
    layout: {
      type: 'centered',
      headerStyle: 'woven',
      itemStyle: 'card',
      categoryStyle: 'underline',
      separator: 'double-line',
      spacing: 'luxury',
    },
    decorations: {
      motif: 'Banarasi Silk Weave',
      borderStyle: 'double line gold',
      hasPattern: true,
      patternType: 'woven',
      patternOpacity: 0.09,
    },
  },

  // 05. SOUTH INDIAN HERITAGE
  {
    id: 'south-indian-heritage',
    name: 'Southern Heritage',
    subtitle: 'Authentic Temple Architecture & Brass',
    categories: ['Indian', 'Traditional', 'Heritage'],
    description: 'Crisp ivory layout anchored by maroon & brass temple top geometric rules, Rozha One font, and clear category columns.',
    colors: {
      bg: '#FFFDF7',
      surface: '#FFFFFF',
      text: '#2C2C2C',
      heading: '#6E1B1B',
      accent: '#C28838',
      secondary: '#274E37',
      border: 'rgba(110, 27, 27, 0.2)',
    },
    typography: {
      heading: "'Rozha One', serif",
      body: "'Plus Jakarta Sans', sans-serif",
      style: 'serif',
    },
    layout: {
      type: 'left-aligned',
      headerStyle: 'split',
      itemStyle: 'detailed-card',
      categoryStyle: 'section-header',
      separator: 'line',
      spacing: 'normal',
    },
    decorations: {
      motif: 'Temple Pillar & Brass',
      borderStyle: 'temple border',
      hasPattern: true,
      patternType: 'temple',
      patternOpacity: 0.05,
    },
  },

  // 06. INDIAN STREET KITCHEN
  {
    id: 'indian-street-kitchen',
    name: 'Street Kitchen',
    subtitle: 'High-End Street-Food Brand Identity',
    categories: ['Street Food', 'Indian'],
    description: 'Vibrant orange and tomato red with high-impact Bebas Neue display typography, MUST TRY tags, and price badges.',
    badge: 'Popular',
    colors: {
      bg: '#FFF9F2',
      surface: '#FFFFFF',
      text: '#1C1C1C',
      heading: '#E85A2A',
      accent: '#B81D1D',
      secondary: '#2C2C2C',
      border: 'rgba(232, 90, 42, 0.25)',
    },
    typography: {
      heading: "'Bebas Neue', sans-serif",
      body: "'Plus Jakarta Sans', sans-serif",
      style: 'display',
    },
    layout: {
      type: 'card-grid',
      headerStyle: 'street',
      itemStyle: 'compact-badge',
      categoryStyle: 'chip',
      separator: 'none',
      spacing: 'compact',
    },
    decorations: {
      motif: 'Street Badges & Tags',
      borderStyle: 'bold orange stroke',
      hasPattern: false,
      patternOpacity: 0,
    },
  },

  // 07. MODERN INDIA
  {
    id: 'modern-india',
    name: 'Modern India',
    subtitle: 'Indian Food × Fashion Editorial',
    categories: ['Indian', 'Minimal', 'Fine Dining'],
    description: 'Asymmetric fashion editorial grid featuring oversized dish names, thin orange rules, and large crop photography.',
    colors: {
      bg: '#F6F4F0',
      surface: '#FFFFFF',
      text: '#1A1A1A',
      heading: '#1A1A1A',
      accent: '#E8783C',
      secondary: '#7C7C80',
      border: 'rgba(26, 26, 26, 0.1)',
    },
    typography: {
      heading: "'Montserrat', sans-serif",
      body: "'Plus Jakarta Sans', sans-serif",
      style: 'editorial',
    },
    layout: {
      type: 'two-column',
      headerStyle: 'minimal',
      itemStyle: 'list',
      categoryStyle: 'underline',
      separator: 'line',
      spacing: 'spacious',
    },
    decorations: {
      motif: 'Thin Editorial Hairline',
      borderStyle: 'fine offset frame',
      hasPattern: false,
      patternOpacity: 0,
    },
  },

  // 08. SPICE HOUSE
  {
    id: 'spice-house',
    name: 'Spice House',
    subtitle: 'Food-First Magazine Composition',
    categories: ['Indian', 'Fine Dining'],
    description: 'Warm cocoa and saffron tones with a magazine-style composition highlighting signature dishes and photography.',
    colors: {
      bg: '#2B1B17',
      surface: '#3C2923',
      text: '#FFFDF8',
      heading: '#E68A00',
      accent: '#E68A00',
      secondary: '#D7CCC8',
      border: 'rgba(230, 138, 0, 0.25)',
    },
    typography: {
      heading: "'Oswald', sans-serif",
      body: "'Plus Jakarta Sans', sans-serif",
      style: 'sans',
    },
    layout: {
      type: 'magazine',
      headerStyle: 'hero-image',
      itemStyle: 'image-card',
      categoryStyle: 'section-header',
      separator: 'dots',
      spacing: 'normal',
    },
    decorations: {
      motif: 'Saffron & Spice Dust',
      borderStyle: 'warm shadow frame',
      hasPattern: true,
      patternType: 'dots',
      patternOpacity: 0.08,
    },
  },

  // 09. MAISON NOIR
  {
    id: 'maison-noir',
    name: 'Maison Noir',
    subtitle: 'Michelin Tasting Menu Benchmark',
    categories: ['Fine Dining', 'Luxury', 'Minimal'],
    description: 'Nearly black charcoal canvas with warm ivory text, Bodoni Moda font, and expansive internal whitespace.',
    badge: 'Luxury Benchmark',
    colors: {
      bg: '#121212',
      surface: '#1E1E1E',
      text: '#F4EFEA',
      heading: '#F4EFEA',
      accent: '#D4AF37',
      secondary: '#888888',
      border: 'rgba(244, 239, 234, 0.12)',
    },
    typography: {
      heading: "'Bodoni Moda', serif",
      body: "'Plus Jakarta Sans', sans-serif",
      style: 'editorial',
    },
    layout: {
      type: 'centered',
      headerStyle: 'minimal',
      itemStyle: 'michelin',
      categoryStyle: 'ornamental',
      separator: 'dots',
      spacing: 'luxury',
    },
    decorations: {
      motif: 'Michelin Whitespace',
      borderStyle: 'ultra thin hairline',
      hasPattern: false,
      patternOpacity: 0,
    },
  },

  // 10. IVORY DINING
  {
    id: 'ivory-dining',
    name: 'Ivory Dining',
    subtitle: 'Pristine Minimalist Luxury',
    categories: ['Minimal', 'Fine Dining'],
    description: 'Ultra-clean warm ivory canvas with crisp dark serif typography, subtle dividers, logo mark, and restrained layout.',
    colors: {
      bg: '#FFFDF7',
      surface: '#FFFFFF',
      text: '#111111',
      heading: '#111111',
      accent: '#8B7355',
      secondary: '#666666',
      border: 'rgba(0, 0, 0, 0.08)',
    },
    typography: {
      heading: "'Playfair Display', serif",
      body: "'Plus Jakarta Sans', sans-serif",
      style: 'serif',
    },
    layout: {
      type: 'left-aligned',
      headerStyle: 'typographic',
      itemStyle: 'list',
      categoryStyle: 'underline',
      separator: 'line',
      spacing: 'spacious',
    },
    decorations: {
      motif: 'Crisp Hairline Geometry',
      borderStyle: 'subtle offset line',
      hasPattern: false,
      patternOpacity: 0,
    },
  },

  // 11. GRAND TABLE
  {
    id: 'grand-table',
    name: 'The Grand Table',
    subtitle: 'Luxury Hotel Level (The Leela / Taj Style)',
    categories: ['Fine Dining', 'Luxury'],
    description: 'Forest emerald, full-width hero branding, gold monogram crest, two-column menu rows, and gold foiled section titles.',
    colors: {
      bg: '#0B2B20',
      surface: '#133D2F',
      text: '#FFFDF5',
      heading: '#D4AF37',
      accent: '#D4AF37',
      secondary: '#B5C4BE',
      border: 'rgba(212, 175, 55, 0.3)',
    },
    typography: {
      heading: "'Cormorant Garamond', serif",
      body: "'Plus Jakarta Sans', sans-serif",
      style: 'serif',
    },
    layout: {
      type: 'two-column',
      headerStyle: 'hero-image',
      itemStyle: 'detailed-card',
      categoryStyle: 'section-header',
      separator: 'double-line',
      spacing: 'luxury',
    },
    decorations: {
      motif: 'Grand Hotel Crest',
      borderStyle: 'solid gold frame',
      hasPattern: true,
      patternType: 'damask',
      patternOpacity: 0.05,
    },
  },

  // 12. COFFEE HOUSE
  {
    id: 'coffee-house',
    name: 'Coffee House',
    subtitle: 'Specialty Café & Artisan Bakery',
    categories: ['Café', 'Minimal'],
    description: 'Cozy espresso and warm cream palette with editorial typography, pastry & coffee photography, and handwritten Caveat accents.',
    colors: {
      bg: '#2E1C14',
      surface: '#3D281E',
      text: '#FFFDF7',
      heading: '#FFFDF7',
      accent: '#E0A96D',
      secondary: '#4A6B5D',
      border: 'rgba(224, 169, 109, 0.25)',
    },
    typography: {
      heading: "'Caveat', cursive",
      body: "'Plus Jakarta Sans', sans-serif",
      style: 'handwritten',
    },
    layout: {
      type: 'editorial',
      headerStyle: 'split',
      itemStyle: 'inline',
      categoryStyle: 'tab',
      separator: 'dots',
      spacing: 'normal',
    },
    decorations: {
      motif: 'Handcrafted Espresso Notes',
      borderStyle: 'dashed coffee frame',
      hasPattern: true,
      patternType: 'dots',
      patternOpacity: 0.06,
    },
  },

  // 13. PAPER CAFE
  {
    id: 'paper-cafe',
    name: 'Paper Cafe',
    subtitle: 'Tactile Printed Craft Menu',
    categories: ['Café', 'Minimal'],
    description: 'Natural kraft paper background with printed grain, hand-drawn sketch borders, handwritten Amatic SC category titles, and stamped labels.',
    colors: {
      bg: '#F2EAE1',
      surface: '#EBE1D6',
      text: '#2C2621',
      heading: '#2C2621',
      accent: '#A65628',
      secondary: '#6E6258',
      border: 'rgba(44, 38, 33, 0.2)',
    },
    typography: {
      heading: "'Amatic SC', cursive",
      body: "'Plus Jakarta Sans', sans-serif",
      style: 'handwritten',
    },
    layout: {
      type: 'centered',
      headerStyle: 'minimal',
      itemStyle: 'list',
      categoryStyle: 'underline',
      separator: 'dots',
      spacing: 'spacious',
    },
    decorations: {
      motif: 'Tactile Paper Texture',
      borderStyle: 'hand-drawn sketch',
      hasPattern: true,
      patternType: 'grain',
      patternOpacity: 0.22,
    },
  },

  // 14. BOMBAY STREET
  {
    id: 'bombay-street',
    name: 'Bombay Street',
    subtitle: 'Mumbai Street Food × Modern Visual Identity',
    categories: ['Indian', 'Street Food', 'Heritage'],
    description: 'High-energy Mumbai street food vibe with punchy Anton display type, food-photo blocks, and strong price labels.',
    colors: {
      bg: '#FFFDF2',
      surface: '#FFFFFF',
      text: '#1C1C1C',
      heading: '#C82323',
      accent: '#F26522',
      secondary: '#388E3C',
      border: 'rgba(242, 101, 34, 0.3)',
    },
    typography: {
      heading: "'Anton', sans-serif",
      body: "'Plus Jakarta Sans', sans-serif",
      style: 'display',
    },
    layout: {
      type: 'card-grid',
      headerStyle: 'street',
      itemStyle: 'image-card',
      categoryStyle: 'chip',
      separator: 'none',
      spacing: 'compact',
    },
    decorations: {
      motif: 'Vibrant Street Badges',
      borderStyle: 'thick red stroke',
      hasPattern: false,
      patternOpacity: 0,
    },
  },

  // 15. MINIMAL EDITORIAL
  {
    id: 'minimal-editorial',
    name: 'Minimal Editorial',
    subtitle: 'Universal Modern Premium',
    categories: ['Minimal', 'Fine Dining', 'Luxury'],
    description: 'Ultra-clean warm white canvas with razor-thin rules, high contrast Montserrat typography, and generous spacing. Proves great design needs no decoration.',
    colors: {
      bg: '#FAFAF8',
      surface: '#FFFFFF',
      text: '#18181B',
      heading: '#18181B',
      accent: '#E8783C',
      secondary: '#71717A',
      border: 'rgba(24, 24, 27, 0.1)',
    },
    typography: {
      heading: "'Montserrat', sans-serif",
      body: "'Plus Jakarta Sans', sans-serif",
      style: 'editorial',
    },
    layout: {
      type: 'centered',
      headerStyle: 'minimal',
      itemStyle: 'list',
      categoryStyle: 'underline',
      separator: 'line',
      spacing: 'luxury',
    },
    decorations: {
      motif: 'Minimal Lines',
      borderStyle: 'fine single line',
      hasPattern: false,
      patternOpacity: 0,
    },
  },

  // === PREMIUM GLOBAL COLLECTION (16–25) ===

  // 16. EMBER — Indian Signature Dining
  {
    id: 'ember',
    name: 'Ember',
    subtitle: 'Indian Signature Dining',
    categories: ['Indian', 'Fine Dining', 'Luxury'],
    description: 'Smouldering charcoal black with saffron-amber fire accents. Dramatic tandoor heat, bold Cormorant type, and glowing ember photography.',
    badge: 'New',
    colors: {
      bg: '#0D0A08',
      surface: '#1A1209',
      text: '#F5ECD7',
      heading: '#F5A623',
      accent: '#F5A623',
      secondary: '#C0703A',
      border: 'rgba(245, 166, 35, 0.25)',
    },
    typography: {
      heading: "'Cormorant Garamond', Georgia, serif",
      body: "'Plus Jakarta Sans', sans-serif",
      style: 'serif',
    },
    layout: {
      type: 'magazine',
      headerStyle: 'hero-image',
      itemStyle: 'image-card',
      categoryStyle: 'section-header',
      separator: 'gradient',
      spacing: 'luxury',
    },
    decorations: {
      motif: 'Ember Glow & Flame',
      borderStyle: 'amber glow frame',
      hasPattern: true,
      patternType: 'dots',
      patternOpacity: 0.04,
    },
  },

  // 17. MAISON — Luxury Fine Dining
  {
    id: 'maison',
    name: 'Maison',
    subtitle: 'Luxury Fine Dining',
    categories: ['Fine Dining', 'Luxury', 'Minimal'],
    description: 'Parisian haute couture elevated for the table. Warm cream linen, champagne gold, Bodoni Display caps, and museum-quality whitespace.',
    badge: 'New',
    colors: {
      bg: '#FAF8F4',
      surface: '#FFFFFF',
      text: '#1C1A18',
      heading: '#1C1A18',
      accent: '#B8944A',
      secondary: '#8A8078',
      border: 'rgba(28, 26, 24, 0.1)',
    },
    typography: {
      heading: "'Bodoni Moda', 'Playfair Display', serif",
      body: "'Lato', 'Plus Jakarta Sans', sans-serif",
      style: 'editorial',
    },
    layout: {
      type: 'centered',
      headerStyle: 'typographic',
      itemStyle: 'michelin',
      categoryStyle: 'ornamental',
      separator: 'line',
      spacing: 'luxury',
    },
    decorations: {
      motif: 'Champagne Hairlines',
      borderStyle: 'platinum single rule',
      hasPattern: false,
      patternOpacity: 0,
    },
  },

  // 18. BOTANICA — Artisan Cafes & Bakeries
  {
    id: 'botanica',
    name: 'Botanica',
    subtitle: 'Artisan Cafes & Bakeries',
    categories: ['Cafe', 'Minimal', 'Vegan'],
    description: 'Wild botanical garden aesthetic. Sage green and antique cream, pressed-flower motifs, DM Serif Display, and hand-crafted calm.',
    badge: 'New',
    colors: {
      bg: '#F4F0E8',
      surface: '#FDFCF8',
      text: '#2D3B2D',
      heading: '#2D3B2D',
      accent: '#5C7A4E',
      secondary: '#8B7355',
      border: 'rgba(45, 59, 45, 0.15)',
    },
    typography: {
      heading: "'DM Serif Display', Georgia, serif",
      body: "'Plus Jakarta Sans', sans-serif",
      style: 'serif',
    },
    layout: {
      type: 'editorial',
      headerStyle: 'split',
      itemStyle: 'inline',
      categoryStyle: 'tab',
      separator: 'dots',
      spacing: 'spacious',
    },
    decorations: {
      motif: 'Pressed Botanical Leaves',
      borderStyle: 'sage leaf border',
      hasPattern: true,
      patternType: 'grain',
      patternOpacity: 0.06,
    },
  },

  // 19. SMASH CLUB — Burgers & Fast Food
  {
    id: 'smash-club',
    name: 'Smash Club',
    subtitle: 'Burgers & Fast Food',
    categories: ['Street Food', 'Fast Food', 'Minimal'],
    description: 'Hardcore smash-burger energy. Obsidian black with blaze-red and bone-white, Bebas Neue bold type, and maximum attitude.',
    badge: 'New',
    colors: {
      bg: '#0F0F0F',
      surface: '#1A1A1A',
      text: '#F5F5F5',
      heading: '#FF3B1A',
      accent: '#FF3B1A',
      secondary: '#F5F5F5',
      border: 'rgba(255, 59, 26, 0.3)',
    },
    typography: {
      heading: "'Bebas Neue', 'Impact', sans-serif",
      body: "'Plus Jakarta Sans', sans-serif",
      style: 'display',
    },
    layout: {
      type: 'card-grid',
      headerStyle: 'street',
      itemStyle: 'image-card',
      categoryStyle: 'chip',
      separator: 'none',
      spacing: 'compact',
    },
    decorations: {
      motif: 'Bold Burger Drop',
      borderStyle: 'thick red stroke',
      hasPattern: false,
      patternOpacity: 0,
    },
  },

  // 20. TOKYO TABLE — Asian Fusion
  {
    id: 'tokyo-table',
    name: 'Tokyo Table',
    subtitle: 'Asian Fusion',
    categories: ['Asian', 'Fine Dining', 'Minimal'],
    description: 'Japanese editorial precision. Pure white with single-weight ink strokes, Noto Serif Display, bento-grid layouts, and zen negative space.',
    badge: 'New',
    colors: {
      bg: '#FAFAFA',
      surface: '#FFFFFF',
      text: '#1A1A1A',
      heading: '#1A1A1A',
      accent: '#C0392B',
      secondary: '#666666',
      border: 'rgba(26, 26, 26, 0.12)',
    },
    typography: {
      heading: "'Noto Serif Display', 'Playfair Display', serif",
      body: "'Plus Jakarta Sans', sans-serif",
      style: 'editorial',
    },
    layout: {
      type: 'two-column',
      headerStyle: 'minimal',
      itemStyle: 'list',
      categoryStyle: 'underline',
      separator: 'line',
      spacing: 'luxury',
    },
    decorations: {
      motif: 'Ink Brush Stroke',
      borderStyle: 'single ink line',
      hasPattern: false,
      patternOpacity: 0,
    },
  },

  // 21. RIVIERA — Mediterranean Dining
  {
    id: 'riviera',
    name: 'Riviera',
    subtitle: 'Mediterranean Dining',
    categories: ['Mediterranean', 'Fine Dining', 'Luxury'],
    description: "Azure coast glamour. Cobalt blue and sun-bleached sand, Cormorant swash caps, terracotta accents, and warm Cote d'Azur atmosphere.",
    badge: 'New',
    colors: {
      bg: '#0A2A4A',
      surface: '#0E3460',
      text: '#F5EDD8',
      heading: '#F0C674',
      accent: '#F0C674',
      secondary: '#B8A08A',
      border: 'rgba(240, 198, 116, 0.25)',
    },
    typography: {
      heading: "'Cormorant Garamond', Georgia, serif",
      body: "'Plus Jakarta Sans', sans-serif",
      style: 'serif',
    },
    layout: {
      type: 'editorial',
      headerStyle: 'hero-image',
      itemStyle: 'detailed-card',
      categoryStyle: 'section-header',
      separator: 'gradient',
      spacing: 'spacious',
    },
    decorations: {
      motif: 'Coastal Wave Crest',
      borderStyle: 'gold wave rule',
      hasPattern: true,
      patternType: 'dots',
      patternOpacity: 0.05,
    },
  },

  // 22. GREENHOUSE — Vegetarian & Vegan Dining
  {
    id: 'greenhouse',
    name: 'Greenhouse',
    subtitle: 'Vegetarian & Vegan Dining',
    categories: ['Vegan', 'Cafe', 'Minimal'],
    description: 'Living plant sanctuary. Greenhouse-glass green, natural linen, botanical line art, hand-lettered Caveat categories, and earthy calm.',
    badge: 'New',
    colors: {
      bg: '#E8F0E6',
      surface: '#FFFFFF',
      text: '#1C2D1C',
      heading: '#1C2D1C',
      accent: '#3A6B3A',
      secondary: '#6B8C6B',
      border: 'rgba(28, 45, 28, 0.15)',
    },
    typography: {
      heading: "'DM Serif Display', Georgia, serif",
      body: "'Plus Jakarta Sans', sans-serif",
      style: 'serif',
    },
    layout: {
      type: 'editorial',
      headerStyle: 'split',
      itemStyle: 'detailed-card',
      categoryStyle: 'tab',
      separator: 'dots',
      spacing: 'spacious',
    },
    decorations: {
      motif: 'Botanical Leaf Grid',
      borderStyle: 'leaf-green outline',
      hasPattern: true,
      patternType: 'grain',
      patternOpacity: 0.04,
    },
  },

  // 23. GULLY — Indian Street Food
  {
    id: 'gully',
    name: 'Gully',
    subtitle: 'Indian Street Food',
    categories: ['Indian', 'Street Food', 'Fast Food'],
    description: 'Gritty roadside chaat vibes. Turmeric yellow, deep red, bold street-sign Bebas Neue, chalk-board specials, and raw market energy.',
    badge: 'New',
    colors: {
      bg: '#1A1200',
      surface: '#261A00',
      text: '#FFF5CC',
      heading: '#FFD700',
      accent: '#E84040',
      secondary: '#FF9900',
      border: 'rgba(255, 215, 0, 0.25)',
    },
    typography: {
      heading: "'Bebas Neue', 'Impact', sans-serif",
      body: "'Plus Jakarta Sans', sans-serif",
      style: 'display',
    },
    layout: {
      type: 'card-grid',
      headerStyle: 'street',
      itemStyle: 'compact-badge',
      categoryStyle: 'chip',
      separator: 'none',
      spacing: 'compact',
    },
    decorations: {
      motif: 'Chaat Stall Chalk Board',
      borderStyle: 'chalk-dust border',
      hasPattern: true,
      patternType: 'grain',
      patternOpacity: 0.08,
    },
  },

  // 24. PATISSERIE — Desserts & Sweets
  {
    id: 'patisserie',
    name: 'Patisserie',
    subtitle: 'Desserts & Sweets',
    categories: ['Desserts', 'Cafe', 'Luxury'],
    description: 'Parisian patisserie perfection. Blush rose and ivory with champagne gold, Playfair italic, macaron palette, and precious delicacy.',
    badge: 'New',
    colors: {
      bg: '#FDF6F0',
      surface: '#FFFFFF',
      text: '#2A1A1A',
      heading: '#2A1A1A',
      accent: '#C4736A',
      secondary: '#A0826D',
      border: 'rgba(196, 115, 106, 0.2)',
    },
    typography: {
      heading: "'Playfair Display', Georgia, serif",
      body: "'Plus Jakarta Sans', sans-serif",
      style: 'serif',
    },
    layout: {
      type: 'card-grid',
      headerStyle: 'typographic',
      itemStyle: 'image-card',
      categoryStyle: 'tab',
      separator: 'dots',
      spacing: 'spacious',
    },
    decorations: {
      motif: 'Gold Ribbon & Bow',
      borderStyle: 'rose petal frame',
      hasPattern: true,
      patternType: 'dots',
      patternOpacity: 0.04,
    },
  },

  // 25. STUDIO 10 — Contemporary Editorial Dining
  {
    id: 'studio-10',
    name: 'Studio 10',
    subtitle: 'Contemporary Editorial Dining',
    categories: ['Fine Dining', 'Minimal', 'Luxury'],
    description: "Art-director's tasting menu. Warm off-black, bone white, stark contrast, editorial proportions, tight-crop photography.",
    badge: 'New',
    colors: {
      bg: '#111111',
      surface: '#1A1A1A',
      text: '#F0EDE8',
      heading: '#F0EDE8',
      accent: '#E8D5B0',
      secondary: '#888888',
      border: 'rgba(240, 237, 232, 0.1)',
    },
    typography: {
      heading: "'Montserrat', sans-serif",
      body: "'Plus Jakarta Sans', sans-serif",
      style: 'editorial',
    },
    layout: {
      type: 'magazine',
      headerStyle: 'hero-image',
      itemStyle: 'michelin',
      categoryStyle: 'underline',
      separator: 'line',
      spacing: 'luxury',
    },
    decorations: {
      motif: 'Editorial Grid',
      borderStyle: 'hairline offset frame',
      hasPattern: false,
      patternOpacity: 0,
    },
  },
];

export const TEMPLATE_FILTER_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'Indian', label: 'Indian' },
  { id: 'Luxury', label: 'Luxury' },
  { id: 'Heritage', label: 'Heritage' },
  { id: 'Traditional', label: 'Traditional' },
  { id: 'Fine Dining', label: 'Fine Dining' },
  { id: 'Street Food', label: 'Street Food' },
  { id: 'Fast Food', label: 'Fast Food' },
  { id: 'Café', label: 'Café' },
  { id: 'Cafe', label: 'Cafe' },
  { id: 'Minimal', label: 'Minimal' },
  { id: 'Asian', label: 'Asian' },
  { id: 'Mediterranean', label: 'Mediterranean' },
  { id: 'Vegan', label: 'Vegan' },
  { id: 'Desserts', label: 'Desserts' },
];

export const DEMO_RESTAURANT = {
  name: 'THE GARDEN RESTAURANT',
  tagline: 'Modern Indian Kitchen & Fine Dining',
  cuisine: 'Indian • Contemporary Fine Dining',
  address: 'MG Road, Indiranagar, Bangalore',
  logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&auto=format&fit=crop&q=80',
  categories: [
    { id: 'cat-1', name: 'STARTERS', order: 0 },
    { id: 'cat-2', name: 'MAIN COURSE', order: 1 },
    { id: 'cat-3', name: 'BREADS & RICE', order: 2 },
    { id: 'cat-4', name: 'DESSERTS & DRINKS', order: 3 },
  ],
  items: [
    {
      id: 'demo-1',
      name: 'Paneer Tikka Royale',
      description: 'Charcoal-smoked organic cottage cheese, hung yogurt, mint chutney, roasted cumin',
      price: 280,
      category: 'cat-1',
      dietType: 'veg' as const,
      available: true,
      isBestseller: true,
      image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'demo-2',
      name: 'Chicken Seekh Kebab',
      description: 'Hand-spiced minced chicken, charred peppers, mint glazed roomali',
      price: 320,
      category: 'cat-1',
      dietType: 'non-veg' as const,
      available: true,
      image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'demo-3',
      name: 'Malai Tandoori Broccoli',
      description: 'Cream & cardamom-marinated broccoli, clay oven charred finish',
      price: 260,
      category: 'cat-1',
      dietType: 'veg' as const,
      available: true,
    },
    {
      id: 'demo-4',
      name: 'Old Delhi Butter Chicken',
      description: 'Slow-simmered velvety tomato gravy, pulled tandoori chicken, white butter',
      price: 380,
      category: 'cat-2',
      dietType: 'non-veg' as const,
      available: true,
      isBestseller: true,
      image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'demo-5',
      name: 'Dal Makhani Signature',
      description: '24-hour slow cooked black lentils, fresh cultured cream, fenugreek dust',
      price: 280,
      category: 'cat-2',
      dietType: 'veg' as const,
      available: true,
      isBestseller: true,
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'demo-6',
      name: 'Kashmiri Mutton Rogan Josh',
      description: 'Tender baby lamb shank, ratanjot infused gravy, aromatic saffron',
      price: 450,
      category: 'cat-2',
      dietType: 'non-veg' as const,
      available: true,
    },
    {
      id: 'demo-7',
      name: 'Hyderabadi Dum Biryani',
      description: 'Long-grain basmati rice, layered spiced chicken, kewra rose water',
      price: 360,
      category: 'cat-3',
      dietType: 'non-veg' as const,
      available: true,
      isBestseller: true,
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'demo-8',
      name: 'Garlic Butter Naan',
      description: 'Refined clay oven bread, minced roasted garlic, fresh coriander butter',
      price: 90,
      category: 'cat-3',
      dietType: 'veg' as const,
      available: true,
      image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'demo-9',
      name: 'Saffron Gulab Jamun',
      description: 'Golden mawa dumplings, green cardamom syrup, pistachio silver leaf',
      price: 150,
      category: 'cat-4',
      dietType: 'veg' as const,
      available: true,
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'demo-10',
      name: 'Artisanal Masala Chai',
      description: 'Brewed CTC tea leaves, fresh ginger, green cardamom, steamed milk',
      price: 120,
      category: 'cat-4',
      dietType: 'veg' as const,
      available: true,
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80',
    },
  ],
};
