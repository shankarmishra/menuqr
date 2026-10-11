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
];

export const TEMPLATE_FILTER_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'Indian', label: 'Indian' },
  { id: 'Luxury', label: 'Luxury' },
  { id: 'Heritage', label: 'Heritage' },
  { id: 'Traditional', label: 'Traditional' },
  { id: 'Fine Dining', label: 'Fine Dining' },
  { id: 'Street Food', label: 'Street Food' },
  { id: 'Café', label: 'Café' },
  { id: 'Minimal', label: 'Minimal' },
];

export const DEMO_RESTAURANT = {
  name: 'THE GARDEN RESTAURANT',
  tagline: 'Modern Indian Kitchen & Fine Dining',
  cuisine: 'Indian • Contemporary Fine Dining',
  phone: '+91 98765 43210',
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
