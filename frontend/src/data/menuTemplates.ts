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
  // 01. HERITAGE PARCHMENT ATELIER (RAJASTHANI HERITAGE)
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

  // 02. MUGHAL LUXE (EMERALD HERITAGE)
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
      patternOpacity: 0.2,
    },
  },

  // 03. CRAFT TRATTORIA & PIZZERIA (Direct mirror of Image 1)
  {
    id: 'craft-trattoria',
    name: 'Craft Trattoria & Pizzeria',
    subtitle: 'Vintage Italian Kitchen Wheel Collage Edition',
    categories: ['Cover & Booklet', 'Italian & Bistro', 'Fine Dining'],
    description: 'Authentic Italian bistro theme modeled after classic culinary posters: warm vintage cream doodle background, 3-slice circular food collage wheel, floating red chili, basil leaf & lime cutouts, and Happy Hours promo box.',
    badge: 'Cover & Inside Pages',
    colors: {
      bg: '#FAF6ED',
      surface: '#FFFFFF',
      text: '#3A332C',
      heading: '#C62828',
      accent: '#D32F2F',
      secondary: '#2E7D32',
      border: '#E3D8C4',
    },
    typography: {
      heading: "'Playfair Display', Georgia, serif",
      body: "'Plus Jakarta Sans', sans-serif",
      style: 'serif',
    },
    layout: {
      type: 'editorial',
      headerStyle: 'banner',
      itemStyle: 'detailed-card',
      categoryStyle: 'badge',
      separator: 'dots',
      spacing: 'luxury',
    },
    decorations: {
      motif: 'Kitchen Doodle Watermark & Cutout Garnishes',
      borderStyle: 'vintage cream postal border',
      hasPattern: true,
      patternType: 'dots',
      patternOpacity: 0.15,
    },
  },

  // 04. MIDNIGHT BURGER & GRILL CLUB (Direct mirror of Image 2)
  {
    id: 'midnight-burger',
    name: 'Midnight Burger & Grill Club',
    subtitle: 'Dark Chalkboard Aperture & Price Badges Edition',
    categories: ['Cover & Booklet', 'Burger & Grill', 'Fast Food'],
    description: 'High-contrast dark chalkboard fast-food aesthetic: top hanging orange ribbon logo crest, circular aperture food frame with dashed halo, orange category pill banners, dish numbers, dot leaders, and organic brush-stroke photo callouts.',
    badge: 'Cover & Inside Pages',
    colors: {
      bg: '#141417',
      surface: '#1F1F24',
      text: '#E5E5EB',
      heading: '#FFA000',
      accent: '#FF9800',
      secondary: '#FFB74D',
      border: '#33333F',
    },
    typography: {
      heading: "'Montserrat', sans-serif",
      body: "'Plus Jakarta Sans', sans-serif",
      style: 'display',
    },
    layout: {
      type: 'two-column',
      headerStyle: 'banner',
      itemStyle: 'compact-badge',
      categoryStyle: 'badge',
      separator: 'dots',
      spacing: 'normal',
    },
    decorations: {
      motif: 'Chalkboard Watermark & Brush Cutout Cards',
      borderStyle: 'chalk neon stroke border',
      hasPattern: true,
      patternType: 'dots',
      patternOpacity: 0.18,
    },
  },

  // 05. ROYAL AWADHI DASTARKHWAN
  {
    id: 'awadhi-dastarkhwan',
    name: 'Royal Awadhi Dastarkhwan',
    subtitle: 'Nawabi Jaali, Saffron Ribbon & Shahi Handi Edition',
    categories: ['Cover & Booklet', 'Royal Heritage', 'Traditional', 'Indian'],
    description: 'Imperial Nawabi court banquet: warm ivory jaali parchment, regal burgundy & antique gold accents, arch aperture frame, saffron crest ribbon, and handi dish callout badges.',
    badge: 'Cover & Inside Pages',
    colors: {
      bg: '#FBF7EE',
      surface: '#FFFFFF',
      text: '#2D2422',
      heading: '#8D1436',
      accent: '#C99700',
      secondary: '#0D47A1',
      border: '#E4CF9F',
    },
    typography: {
      heading: "'Cinzel', Georgia, serif",
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
      motif: 'Nawabi Jaali & Royal Shahi Ribbon',
      borderStyle: 'gold floral court border',
      hasPattern: true,
      patternType: 'arch',
      patternOpacity: 0.2,
    },
  },

  // 06. SWEET VELVET PATISSERIE
  {
    id: 'artisan-pastry',
    name: 'Sweet Velvet Patisserie',
    subtitle: 'Parisian High Tea, Macaron Wheel & Rose Ribbons',
    categories: ['Cover & Booklet', 'Café & Desserts', 'Bakery'],
    description: 'Chic Parisian bakery & tea room: delicate blush cream paper, French pastry doodle watermarks, 3-slice dessert wheel collage, magenta ribbon emblem, and sweet macaron garnish cutouts.',
    badge: 'Cover & Inside Pages',
    colors: {
      bg: '#FDF7F8',
      surface: '#FFFFFF',
      text: '#3C2E33',
      heading: '#880E4F',
      accent: '#D81B60',
      secondary: '#8E24AA',
      border: '#F3D5DE',
    },
    typography: {
      heading: "'Playfair Display', serif",
      body: "'Plus Jakarta Sans', sans-serif",
      style: 'serif',
    },
    layout: {
      type: 'editorial',
      headerStyle: 'banner',
      itemStyle: 'card',
      categoryStyle: 'badge',
      separator: 'dots',
      spacing: 'spacious',
    },
    decorations: {
      motif: 'Pastry Whisk Doodle & Macaron Cutouts',
      borderStyle: 'rose gold filigree border',
      hasPattern: true,
      patternType: 'dots',
      patternOpacity: 0.15,
    },
  },

  // 07. TOKYO RAMEN & IZAKAYA CLUB
  {
    id: 'tokyo-izakaya',
    name: 'Tokyo Ramen & Izakaya Club',
    subtitle: 'Sumi Ink Chalkboard, Ensō Frame & Crimson Crest',
    categories: ['Cover & Booklet', 'Asian & Japanese', 'Street Food'],
    description: 'Vibrant Tokyo alleyway izakaya: sumi ink chalkboard doodles, ensō circular food aperture, crimson lantern crest ribbon, ramen bowl callouts, and Japanese typography.',
    badge: 'Cover & Inside Pages',
    colors: {
      bg: '#121316',
      surface: '#1B1C22',
      text: '#ECECF0',
      heading: '#E53935',
      accent: '#FF5252',
      secondary: '#FFB300',
      border: '#2F313D',
    },
    typography: {
      heading: "'Montserrat', sans-serif",
      body: "'Plus Jakarta Sans', sans-serif",
      style: 'display',
    },
    layout: {
      type: 'two-column',
      headerStyle: 'banner',
      itemStyle: 'compact-badge',
      categoryStyle: 'badge',
      separator: 'dots',
      spacing: 'normal',
    },
    decorations: {
      motif: 'Japanese Wave & Crimson Lantern Crest',
      borderStyle: 'neon red kanji border',
      hasPattern: true,
      patternType: 'dots',
      patternOpacity: 0.2,
    },
  },

  // 08. COASTAL CATCH & RAW BAR
  {
    id: 'coastal-seafood',
    name: 'Coastal Catch & Raw Bar',
    subtitle: 'Aegean Deep Blue, Porthole Wheel & Fresh Citrus Edition',
    categories: ['Cover & Booklet', 'Seafood & Raw Bar', 'Mediterranean'],
    description: 'Sun-drenched Mediterranean raw bar: crisp maritime linen background, 3-slice porthole food wheel, fresh lime slice & herb cutouts, and ocean blue category banners.',
    badge: 'Cover & Inside Pages',
    colors: {
      bg: '#F3F7FA',
      surface: '#FFFFFF',
      text: '#223038',
      heading: '#0D47A1',
      accent: '#00838F',
      secondary: '#00695C',
      border: '#C8D5DB',
    },
    typography: {
      heading: "'Playfair Display', serif",
      body: "'Plus Jakarta Sans', sans-serif",
      style: 'serif',
    },
    layout: {
      type: 'editorial',
      headerStyle: 'banner',
      itemStyle: 'detailed-card',
      categoryStyle: 'badge',
      separator: 'dots',
      spacing: 'luxury',
    },
    decorations: {
      motif: 'Anchor Waves & Lime Citrus Cutouts',
      borderStyle: 'nautical rope border',
      hasPattern: true,
      patternType: 'dots',
      patternOpacity: 0.15,
    },
  },

  // 09. RUSTIC SMOKEHOUSE & BBQ BAR
  {
    id: 'rustic-smokehouse',
    name: 'Rustic Smokehouse & BBQ Bar',
    subtitle: 'Texas Timber Chalkboard, Iron Cast Aperture & Smoked Ribs',
    categories: ['Cover & Booklet', 'Burger & Grill', 'Smokehouse'],
    description: 'Charred hickory Texas pithouse: deep smoke chalkboard background, cast-iron skillet aperture ring, leather ribbon crest, burnt orange category pills, and BBQ platter callouts.',
    badge: 'Cover & Inside Pages',
    colors: {
      bg: '#171311',
      surface: '#221C19',
      text: '#EAE1DA',
      heading: '#E65100',
      accent: '#FF7043',
      secondary: '#FFA726',
      border: '#3E3028',
    },
    typography: {
      heading: "'Montserrat', sans-serif",
      body: "'Plus Jakarta Sans', sans-serif",
      style: 'display',
    },
    layout: {
      type: 'two-column',
      headerStyle: 'banner',
      itemStyle: 'compact-badge',
      categoryStyle: 'badge',
      separator: 'dots',
      spacing: 'normal',
    },
    decorations: {
      motif: 'Cleaver Chalk Etchings & Iron Skillet',
      borderStyle: 'timber burned wood border',
      hasPattern: true,
      patternType: 'dots',
      patternOpacity: 0.18,
    },
  },

  // 10. BOTANICA ORGANIC KITCHEN & BOWLS
  {
    id: 'greenhouse-botanic',
    name: 'Botanica Organic Kitchen',
    subtitle: 'Flaxseed Paper, Garden Wheel Collage & Cold-Pressed Juices',
    categories: ['Cover & Booklet', 'Healthy & Vegan', 'Bowls & Greens'],
    description: 'Eco-modern greenhouse eatery: flaxseed textured botanical paper, 3-slice farm fresh food wheel, green leaf & lime garnishes, cold-pressed juice badges, and garden typography.',
    badge: 'Cover & Inside Pages',
    colors: {
      bg: '#F6FAF4',
      surface: '#FFFFFF',
      text: '#2A362B',
      heading: '#2E7D32',
      accent: '#4CAF50',
      secondary: '#689F38',
      border: '#D2E2D3',
    },
    typography: {
      heading: "'Playfair Display', serif",
      body: "'Plus Jakarta Sans', sans-serif",
      style: 'serif',
    },
    layout: {
      type: 'editorial',
      headerStyle: 'banner',
      itemStyle: 'card',
      categoryStyle: 'badge',
      separator: 'dots',
      spacing: 'spacious',
    },
    decorations: {
      motif: 'Botanical Leaf Sketches & Fresh Basil',
      borderStyle: 'flaxseed green vine border',
      hasPattern: true,
      patternType: 'dots',
      patternOpacity: 0.15,
    },
  },

  // 11. GRAND HIGHWAY DHABA
  {
    id: 'desi-dhaba',
    name: 'Grand Highway Dhaba',
    subtitle: 'Authentic Tandoor Truck-Art, Brass Thali Aperture & Kulche',
    categories: ['Cover & Booklet', 'Traditional', 'Indian', 'Dhaba'],
    description: 'Vibrant Punjabi Grand Trunk Road dhaba: warm wheat paper, clay tandoor doodles, brass thali circular aperture, saffron & vermilion ribbon, hot chili cutout, and thali callouts.',
    badge: 'Cover & Inside Pages',
    colors: {
      bg: '#FFF8EE',
      surface: '#FFFFFF',
      text: '#38251C',
      heading: '#B71C1C',
      accent: '#E65100',
      secondary: '#F57F17',
      border: '#EFD4B2',
    },
    typography: {
      heading: "'Cinzel', Georgia, serif",
      body: "'Plus Jakarta Sans', sans-serif",
      style: 'serif',
    },
    layout: {
      type: 'two-column',
      headerStyle: 'banner',
      itemStyle: 'compact-badge',
      categoryStyle: 'badge',
      separator: 'dots',
      spacing: 'normal',
    },
    decorations: {
      motif: 'Truck Art Motifs & Red Chili Cutout',
      borderStyle: 'dhaba floral marigold border',
      hasPattern: true,
      patternType: 'dots',
      patternOpacity: 0.15,
    },
  },

  // 12. THE BOHEMIAN TAPROOM & GRILL
  {
    id: 'boho-taproom',
    name: 'The Bohemian Taproom & Grill',
    subtitle: 'Industrial Chalk Slate, Amber Hops Wheel & Slider Flights',
    categories: ['Cover & Booklet', 'Burger & Grill', 'Craft Beer'],
    description: 'Atmospheric artisan microbrewery: industrial dark slate chalkboard doodles, 3-slice slider & craft beer wheel collage, amber hop ribbon, and late-night social promo box.',
    badge: 'Cover & Inside Pages',
    colors: {
      bg: '#14171B',
      surface: '#1E2228',
      text: '#E3E6EB',
      heading: '#FFB300',
      accent: '#FFA000',
      secondary: '#FF8F00',
      border: '#343B47',
    },
    typography: {
      heading: "'Montserrat', sans-serif",
      body: "'Plus Jakarta Sans', sans-serif",
      style: 'display',
    },
    layout: {
      type: 'two-column',
      headerStyle: 'banner',
      itemStyle: 'compact-badge',
      categoryStyle: 'badge',
      separator: 'dots',
      spacing: 'normal',
    },
    decorations: {
      motif: 'Craft Hop Etchings & Amber Ring',
      borderStyle: 'industrial steel rivet border',
      hasPattern: true,
      patternType: 'dots',
      patternOpacity: 0.18,
    },
  },
];

export const TEMPLATE_FILTER_CATEGORIES = [
  { id: 'all', label: 'All Templates (12)' },
  { id: 'Cover & Booklet', label: 'Cover & Inside Pages (10)' },
  { id: 'Royal Heritage', label: 'Royal Heritage (3)' },
  { id: 'Italian & Bistro', label: 'Italian & Bistro' },
  { id: 'Burger & Grill', label: 'Burger & Grill' },
  { id: 'Asian & Japanese', label: 'Asian & Japanese' },
  { id: 'Seafood & Raw Bar', label: 'Seafood & Raw Bar' },
  { id: 'Café & Desserts', label: 'Café & Desserts' },
];

export const DEMO_RESTAURANT = {
  name: 'Bukhara Grand',
  tagline: 'North-West Frontier Heritage Dining Since 1978',
  cuisine: 'North Indian • Mughlai • Tandoor',
  phone: '+91 11 2611 2233',
  address: 'Diplomatic Enclave, Chanakyapuri, New Delhi, Delhi 110021',
  logo: '/img/photos/photo-1517248135467-4c7edcad34c4-w120.webp',
  categories: [
    { id: 'cat-1', name: 'Tandoori Starters', order: 0 },
    { id: 'cat-2', name: 'Heritage Curries', order: 1 },
    { id: 'cat-3', name: 'Biryani & Breads', order: 2 },
    { id: 'cat-4', name: 'Desserts & Beverages', order: 3 },
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
      image: '/img/photos/photo-1567188040759-fb8a883dc6d8-w500.webp',
    },
    {
      id: 'demo-2',
      name: 'Chicken Seekh Kebab',
      description: 'Hand-spiced minced chicken, charred peppers, mint glazed roomali',
      price: 320,
      category: 'cat-1',
      dietType: 'non-veg' as const,
      available: true,
      image: '/img/photos/photo-1599487488170-d11ec9c172f0-w500.webp',
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
      image: '/img/photos/photo-1588166524941-3bf61a9c41db-w500.webp',
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
      image: '/img/photos/photo-1546833999-b9f581a1996d-w500.webp',
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
      image: '/img/photos/photo-1563379091339-03b21ab4a4f8-w500.webp',
    },
    {
      id: 'demo-8',
      name: 'Garlic Butter Naan',
      description: 'Refined clay oven bread, minced roasted garlic, fresh coriander butter',
      price: 90,
      category: 'cat-3',
      dietType: 'veg' as const,
      available: true,
      image: '/img/photos/photo-1626074353765-517a681e40be-w500.webp',
    },
    {
      id: 'demo-9',
      name: 'Saffron Gulab Jamun',
      description: 'Golden mawa dumplings, green cardamom syrup, pistachio silver leaf',
      price: 150,
      category: 'cat-4',
      dietType: 'veg' as const,
      available: true,
      image: '/img/photos/photo-1601050690597-df0568f70950-w500.webp',
    },
    {
      id: 'demo-10',
      name: 'Artisanal Masala Chai',
      description: 'Brewed CTC tea leaves, fresh ginger, green cardamom, steamed milk',
      price: 120,
      category: 'cat-4',
      dietType: 'veg' as const,
      available: true,
      image: '/img/photos/photo-1576092768241-dec231879fc3-w500.webp',
    },
  ],
};
