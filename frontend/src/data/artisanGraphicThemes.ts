// 20 Curated Artisan Graphic Background Poster Themes
// High-resolution framed backdrops with culinary perimeter artwork & safe-zone parchment centers

export interface ArtisanGraphicTheme {
  id: string;
  name: string;
  cuisine: string;
  badge: string;
  description: string;
  bgImage: string;
  coverBgImage?: string;
  pageBgImages?: string[];
  accentIcon: string;
  colors: {
    heading: string;
    subheading: string;
    text: string;
    description: string;
    price: string;
    priceHalfFull: string;
    border: string;
    safeZoneBg: string;
    scrimOverlay: string;
    ornament: string;
    badgeVeg: string;
    badgeNonVeg: string;
  };
  typography: {
    headingFont: string;
    subheadingFont: string;
    bodyFont: string;
    priceFont: string;
    fontCategory: 'serif' | 'display' | 'handwritten' | 'sans';
  };
  safeZoneMargins: {
    top: string;
    bottom: string;
    left: string;
    right: string;
  };
  ornamentStyle: 'dotted-leader' | 'solid-leader' | 'bracket' | 'minimal' | 'vintage-flourish';
}

export const artisanGraphicThemes: ArtisanGraphicTheme[] = [
  // 01. SEAFOOD & COASTAL CATCH (The authentic lobster, lemon & shell rustic board)
  {
    id: 'seafood-coastal',
    name: 'Seafood & Coastal Catch',
    cuisine: 'Coastal, Seafood & Oyster Bar',
    badge: 'Artisan Wood & Crustacean',
    description: 'Weathered dark timber with whole red lobsters, fresh cut lemons, mussels and rosemary surrounding an aged parchment center.',
    bgImage: '/assets/themes/seafood-coastal.png',
    pageBgImages: ["/assets/themes/seafood-coastal.png", "/assets/themes/variations/seafood-coastal-facing.png", "/assets/themes/variations/seafood-coastal-alt.png"],
    accentIcon: 'Anchor',
    colors: {
      heading: '#2D1606',
      subheading: '#8B4513',
      text: '#1C120C',
      description: '#5A4638',
      price: '#9E2A2B',
      priceHalfFull: '#78350F',
      border: 'rgba(139, 69, 19, 0.28)',
      safeZoneBg: 'transparent',
      scrimOverlay: 'rgba(0, 0, 0, 0)',
      ornament: '#A75D28',
      badgeVeg: '#166534',
      badgeNonVeg: '#991B1B'
    },
    typography: {
      headingFont: "'Cinzel', 'Playfair Display', serif",
      subheadingFont: "'Playfair Display', serif",
      bodyFont: "'Plus Jakarta Sans', sans-serif",
      priceFont: "'Cinzel', serif",
      fontCategory: 'serif'
    },
    safeZoneMargins: { top: '16%', bottom: '18%', left: '18%', right: '18%' },
    ornamentStyle: 'dotted-leader'
  },

  // 02. RUSTIC SMOKEHOUSE & STEAKHOUSE
  {
    id: 'rustic-bbq',
    name: 'Rustic Smokehouse & BBQ',
    cuisine: 'Steakhouses, BBQ & Smokehouse',
    badge: 'Charred Oak & Embers',
    description: 'Charred dark oak with glowing charcoal embers, cast iron skillets, cracked peppercorns and roasted garlic sprigs.',
    bgImage: '/assets/themes/rustic-bbq.jpg',
    pageBgImages: ["/assets/themes/rustic-bbq.jpg", "/assets/themes/variations/rustic-bbq-facing.jpg", "/assets/themes/variations/rustic-bbq-alt.jpg"],
    accentIcon: 'Flame',
    colors: {
      heading: '#FFFFFF',
      subheading: '#FBBF24',
      text: '#F8FAFC',
      description: '#D1D5DB',
      price: '#FDE047',
      priceHalfFull: '#FBBF24',
      border: 'rgba(251, 191, 36, 0.3)',
      safeZoneBg: 'transparent',
      scrimOverlay: 'rgba(0, 0, 0, 0)',
      ornament: '#FBBF24',
      badgeVeg: '#22C55E',
      badgeNonVeg: '#EF4444'
    },
    typography: {
      headingFont: "'Oswald', 'Cinzel', sans-serif",
      subheadingFont: "'Oswald', sans-serif",
      bodyFont: "'Plus Jakarta Sans', sans-serif",
      priceFont: "'Oswald', sans-serif",
      fontCategory: 'display'
    },
    safeZoneMargins: { top: '22%', bottom: '19%', left: '12%', right: '14%' },
    ornamentStyle: 'dotted-leader'
  },

  // 03. TUSCAN TRATTORIA & PIZZERIA
  {
    id: 'tuscan-italian',
    name: 'Tuscan Trattoria & Pizzeria',
    cuisine: 'Italian, Pizzeria & Wine Bar',
    badge: 'San Marzano & Olive Leaf',
    description: 'Sun-drenched Mediterranean rustic table with ripe vine tomatoes, fresh basil leaves, extra virgin olive oil cruet and folded linen.',
    bgImage: '/assets/themes/tuscan-italian.jpg',
    pageBgImages: ["/assets/themes/tuscan-italian.jpg", "/assets/themes/variations/tuscan-italian-facing.jpg", "/assets/themes/variations/tuscan-italian-alt.jpg"],
    accentIcon: 'Pizza',
    colors: {
      heading: '#2B1700',
      subheading: '#991B1B',
      text: '#261C14',
      description: '#5C4A3E',
      price: '#991B1B',
      priceHalfFull: '#78350F',
      border: 'rgba(153, 27, 27, 0.25)',
      safeZoneBg: 'transparent',
      scrimOverlay: 'rgba(0, 0, 0, 0)',
      ornament: '#166534',
      badgeVeg: '#15803D',
      badgeNonVeg: '#B91C1C'
    },
    typography: {
      headingFont: "'Playfair Display', serif",
      subheadingFont: "'Playfair Display', serif",
      bodyFont: "'Plus Jakarta Sans', sans-serif",
      priceFont: "'Playfair Display', serif",
      fontCategory: 'serif'
    },
    safeZoneMargins: { top: '8%', bottom: '18%', left: '25%', right: '8%' },
    ornamentStyle: 'dotted-leader'
  },

  // 04. ROYAL DARBAR & TANDOOR
  {
    id: 'royal-darbar',
    name: 'Royal Darbar & Tandoor',
    cuisine: 'North Indian, Mughlai & Biryani',
    badge: 'Hammered Copper & Saffron',
    description: 'Rich velvet backdrop framed with hand-hammered copper handis, star anise, saffron strands and whole cinnamon barks.',
    bgImage: '/assets/themes/royal-darbar.jpg',
    pageBgImages: ["/assets/themes/royal-darbar.jpg", "/assets/themes/variations/royal-darbar-facing.jpg", "/assets/themes/variations/royal-darbar-alt.jpg"],
    accentIcon: 'Crown',
    colors: {
      heading: '#2D1204',
      subheading: '#8B2500',
      text: '#1C0F07',
      description: '#4A2E1B',
      price: '#991B1B',
      priceHalfFull: '#78350F',
      border: 'rgba(139, 37, 0, 0.32)',
      safeZoneBg: 'transparent',
      scrimOverlay: 'rgba(0, 0, 0, 0)',
      ornament: '#8B2500',
      badgeVeg: '#166534',
      badgeNonVeg: '#991B1B'
    },
    typography: {
      headingFont: "'Cinzel', serif",
      subheadingFont: "'Cinzel', serif",
      bodyFont: "'Plus Jakarta Sans', sans-serif",
      priceFont: "'Cinzel', serif",
      fontCategory: 'serif'
    },
    safeZoneMargins: { top: '23%', bottom: '15%', left: '14%', right: '17%' },
    ornamentStyle: 'vintage-flourish'
  },

  // 05. ARTISAN FRENCH PATISSERIE
  {
    id: 'artisan-bakery',
    name: 'Artisan French Patisserie',
    cuisine: 'Bakery, Pastry & Dessert Parlour',
    badge: 'Flour Dust & Wheat Sheaves',
    description: 'White marble workstation with dusted flour, golden wheat sheaves, pastel macarons and antique wooden pastry tools.',
    bgImage: '/assets/themes/artisan-bakery.jpg',
    pageBgImages: ["/assets/themes/artisan-bakery.jpg", "/assets/themes/variations/artisan-bakery-facing.jpg", "/assets/themes/variations/artisan-bakery-alt.jpg"],
    accentIcon: 'Croissant',
    colors: {
      heading: '#3D2B1F',
      subheading: '#8C5A3E',
      text: '#2E2018',
      description: '#6E5545',
      price: '#9C4221',
      priceHalfFull: '#7A3519',
      border: 'rgba(140, 90, 62, 0.22)',
      safeZoneBg: 'transparent',
      scrimOverlay: 'rgba(0, 0, 0, 0)',
      ornament: '#B47C57',
      badgeVeg: '#166534',
      badgeNonVeg: '#991B1B'
    },
    typography: {
      headingFont: "'Playfair Display', serif",
      subheadingFont: "'Playfair Display', serif",
      bodyFont: "'Plus Jakarta Sans', sans-serif",
      priceFont: "'Playfair Display', serif",
      fontCategory: 'serif'
    },
    safeZoneMargins: { top: '14%', bottom: '15%', left: '12%', right: '12%' },
    ornamentStyle: 'dotted-leader'
  },

  // 06. VINTAGE COFFEE ROASTERY
  {
    id: 'vintage-cafe',
    name: 'Vintage Coffee Roastery',
    cuisine: 'Specialty Coffee, Roasters & Brunch',
    badge: 'Jute Sack & Roasted Arabica',
    description: 'Rustic burlap sack textures, scattered dark-roast coffee beans, brass manual grinder and watermarks of espresso crema rings.',
    bgImage: '/assets/themes/vintage-cafe.jpg',
    pageBgImages: ["/assets/themes/vintage-cafe.jpg", "/assets/themes/variations/vintage-cafe-facing.jpg", "/assets/themes/variations/vintage-cafe-alt.jpg"],
    accentIcon: 'Coffee',
    colors: {
      heading: '#2D1B11',
      subheading: '#6F4E37',
      text: '#22150D',
      description: '#5E4334',
      price: '#8B4513',
      priceHalfFull: '#6B3209',
      border: 'rgba(111, 78, 55, 0.3)',
      safeZoneBg: 'transparent',
      scrimOverlay: 'rgba(0, 0, 0, 0)',
      ornament: '#6F4E37',
      badgeVeg: '#15803D',
      badgeNonVeg: '#991B1B'
    },
    typography: {
      headingFont: "'Playfair Display', serif",
      subheadingFont: "'Oswald', sans-serif",
      bodyFont: "'Plus Jakarta Sans', sans-serif",
      priceFont: "'Oswald', sans-serif",
      fontCategory: 'serif'
    },
    safeZoneMargins: { top: '15%', bottom: '22%', left: '12%', right: '12%' },
    ornamentStyle: 'dotted-leader'
  },

  // 07. SPEAKEASY & COCKTAIL LOUNGE
  {
    id: 'speakeasy-cocktails',
    name: 'Speakeasy & Cocktail Lounge',
    cuisine: 'Craft Bar, Taproom & Nightclub',
    badge: 'Dark Slate & Crystal Glass',
    description: 'Midnight black textured slate with glowing amber lights, etched cocktail shakers, dehydrated citrus twists and copper bar spoons.',
    bgImage: '/assets/themes/speakeasy-cocktails.jpg',
    pageBgImages: ["/assets/themes/speakeasy-cocktails.jpg", "/assets/themes/variations/speakeasy-cocktails-facing.jpg", "/assets/themes/variations/speakeasy-cocktails-alt.jpg"],
    accentIcon: 'Wine',
    colors: {
      heading: '#FBBF24',
      subheading: '#F59E0B',
      text: '#F3F4F6',
      description: '#9CA3AF',
      price: '#F59E0B',
      priceHalfFull: '#D97706',
      border: 'rgba(245, 158, 11, 0.28)',
      safeZoneBg: 'transparent',
      scrimOverlay: 'rgba(0, 0, 0, 0)',
      ornament: '#F59E0B',
      badgeVeg: '#10B981',
      badgeNonVeg: '#F43F5E'
    },
    typography: {
      headingFont: "'Cinzel', serif",
      subheadingFont: "'Cinzel', serif",
      bodyFont: "'Plus Jakarta Sans', sans-serif",
      priceFont: "'Cinzel', serif",
      fontCategory: 'serif'
    },
    safeZoneMargins: { top: '12%', bottom: '12%', left: '10%', right: '10%' },
    ornamentStyle: 'solid-leader'
  },

  // 08. BOTANICAL GARDEN & ORGANICS
  {
    id: 'botanical-greens',
    name: 'Botanical Garden & Organics',
    cuisine: 'Farm-to-Table, Vegan & Clean Bowls',
    badge: 'Monstera & White Marble',
    description: 'Polished Carrera white marble framed with lush green monstera leaves, eucalyptus sprigs, and gentle botanical watermarks.',
    bgImage: '/assets/themes/botanical-greens.jpg',
    pageBgImages: ["/assets/themes/botanical-greens.jpg", "/assets/themes/variations/botanical-greens-facing.jpg", "/assets/themes/variations/botanical-greens-alt.jpg"],
    accentIcon: 'Leaf',
    colors: {
      heading: '#143826',
      subheading: '#2D6A4F',
      text: '#1C2E24',
      description: '#4B6B58',
      price: '#1E5A3E',
      priceHalfFull: '#2D6A4F',
      border: 'rgba(45, 106, 79, 0.25)',
      safeZoneBg: 'transparent',
      scrimOverlay: 'rgba(0, 0, 0, 0)',
      ornament: '#2D6A4F',
      badgeVeg: '#15803D',
      badgeNonVeg: '#B91C1C'
    },
    typography: {
      headingFont: "'Playfair Display', serif",
      subheadingFont: "'Plus Jakarta Sans', sans-serif",
      bodyFont: "'Plus Jakarta Sans', sans-serif",
      priceFont: "'Playfair Display', serif",
      fontCategory: 'serif'
    },
    safeZoneMargins: { top: '14%', bottom: '14%', left: '14%', right: '14%' },
    ornamentStyle: 'dotted-leader'
  },

  // 09. ASIAN WOK & DIM SUM HOUSE
  {
    id: 'asian-dimsum',
    name: 'Asian Wok & Dim Sum House',
    cuisine: 'Chinese, Pan-Asian & Dim Sum',
    badge: 'Bamboo Steamer & Ink Wash',
    description: 'Traditional woven bamboo steamer textures with red bird-eye chilies, dark lacquered chopsticks, and oriental brush flourishes.',
    bgImage: '/assets/themes/asian-dimsum.jpg',
    pageBgImages: ["/assets/themes/asian-dimsum.jpg", "/assets/themes/variations/asian-dimsum-facing.jpg", "/assets/themes/variations/asian-dimsum-alt.jpg"],
    accentIcon: 'Soup',
    colors: {
      heading: '#881337',
      subheading: '#9F1239',
      text: '#2A1810',
      description: '#5C4436',
      price: '#9F1239',
      priceHalfFull: '#BE123C',
      border: 'rgba(159, 18, 57, 0.25)',
      safeZoneBg: 'transparent',
      scrimOverlay: 'rgba(0, 0, 0, 0)',
      ornament: '#881337',
      badgeVeg: '#15803D',
      badgeNonVeg: '#BE123C'
    },
    typography: {
      headingFont: "'Cinzel', serif",
      subheadingFont: "'Cinzel', serif",
      bodyFont: "'Plus Jakarta Sans', sans-serif",
      priceFont: "'Cinzel', serif",
      fontCategory: 'display'
    },
    safeZoneMargins: { top: '8%', bottom: '10%', left: '28%', right: '8%' },
    ornamentStyle: 'dotted-leader'
  },

  // 10. TOKYO SUSHI & RAMEN BAR
  {
    id: 'tokyo-sushi',
    name: 'Tokyo Sushi & Ramen Bar',
    cuisine: 'Japanese Sushi, Ramen & Izakaya',
    badge: 'Cedar Wood & Nori Slate',
    description: 'Japanese dark cedar wood with natural grain, pickled pink ginger, wasabi leaf accents, and minimalist calligraphy frames.',
    bgImage: '/assets/themes/tokyo-sushi.jpg',
    pageBgImages: ["/assets/themes/tokyo-sushi.jpg", "/assets/themes/variations/tokyo-sushi-facing.jpg", "/assets/themes/variations/tokyo-sushi-alt.jpg"],
    accentIcon: 'Fish',
    colors: {
      heading: '#0F172A',
      subheading: '#B91C1C',
      text: '#020617',
      description: '#334155',
      price: '#B91C1C',
      priceHalfFull: '#991B1B',
      border: 'rgba(185, 28, 28, 0.3)',
      safeZoneBg: 'transparent',
      scrimOverlay: 'rgba(0, 0, 0, 0)',
      ornament: '#B91C1C',
      badgeVeg: '#166534',
      badgeNonVeg: '#B91C1C'
    },
    typography: {
      headingFont: "'Cinzel', sans-serif",
      subheadingFont: "'Cinzel', sans-serif",
      bodyFont: "'Plus Jakarta Sans', sans-serif",
      priceFont: "'Cinzel', sans-serif",
      fontCategory: 'sans'
    },
    safeZoneMargins: { top: '26%', bottom: '22%', left: '10%', right: '10%' },
    ornamentStyle: 'solid-leader'
  },

  // 11. DESI STREET FOOD & CHAAT BAZAAR
  {
    id: 'desi-street-food',
    name: 'Desi Street Food & Chaat',
    cuisine: 'Chaat, Kadhai & Indian Street Food',
    badge: 'Truck Art & Kulhad Clay',
    description: 'Vibrant desi truck-art floral borders, earthen kulhad terracotta cups, fresh mint chutney drops and rustic butter paper texture.',
    bgImage: '/assets/themes/desi-street-food.jpg',
    pageBgImages: ["/assets/themes/desi-street-food.jpg", "/assets/themes/variations/desi-street-food-facing.jpg", "/assets/themes/variations/desi-street-food-alt.jpg"],
    accentIcon: 'Sparkles',
    colors: {
      heading: '#854D0E',
      subheading: '#C2410C',
      text: '#29180C',
      description: '#5A3D25',
      price: '#C2410C',
      priceHalfFull: '#9A3412',
      border: 'rgba(194, 65, 12, 0.28)',
      safeZoneBg: 'transparent',
      scrimOverlay: 'rgba(0, 0, 0, 0)',
      ornament: '#D97706',
      badgeVeg: '#15803D',
      badgeNonVeg: '#DC2626'
    },
    typography: {
      headingFont: "'Oswald', 'Playfair Display', sans-serif",
      subheadingFont: "'Oswald', sans-serif",
      bodyFont: "'Plus Jakarta Sans', sans-serif",
      priceFont: "'Oswald', sans-serif",
      fontCategory: 'display'
    },
    safeZoneMargins: { top: '21%', bottom: '21%', left: '18%', right: '16%' },
    ornamentStyle: 'dotted-leader'
  },

  // 12. RETRO AMERICAN BURGER & DINER
  {
    id: 'retro-burger-diner',
    name: 'Retro Burger & American Diner',
    cuisine: 'Burgers, Shakes & American Diner',
    badge: 'Wax Deli Paper & Checker',
    description: 'Vintage red-and-white checkered picnic tablecloth, golden toasted brioche, crisp fries basket and retro chrome diner badging.',
    bgImage: '/assets/themes/retro-burger-diner.jpg',
    pageBgImages: ["/assets/themes/retro-burger-diner.jpg", "/assets/themes/variations/retro-burger-diner-facing.jpg", "/assets/themes/variations/retro-burger-diner-alt.jpg"],
    accentIcon: 'Beef',
    colors: {
      heading: '#991B1B',
      subheading: '#B45309',
      text: '#1F1A17',
      description: '#574C45',
      price: '#991B1B',
      priceHalfFull: '#B45309',
      border: 'rgba(185, 28, 28, 0.25)',
      safeZoneBg: 'transparent',
      scrimOverlay: 'rgba(0, 0, 0, 0)',
      ornament: '#991B1B',
      badgeVeg: '#166534',
      badgeNonVeg: '#B91C1C'
    },
    typography: {
      headingFont: "'Oswald', sans-serif",
      subheadingFont: "'Oswald', sans-serif",
      bodyFont: "'Plus Jakarta Sans', sans-serif",
      priceFont: "'Oswald', sans-serif",
      fontCategory: 'display'
    },
    safeZoneMargins: { top: '14%', bottom: '16%', left: '10%', right: '10%' },
    ornamentStyle: 'dotted-leader'
  },

  // 13. MEXICAN TAQUERIA & CANTINA
  {
    id: 'mexican-cantina',
    name: 'Mexican Taqueria & Cantina',
    cuisine: 'Mexican, Tacos & Tex-Mex',
    badge: 'Talavera Tile & Jalapeno',
    description: 'Sun-warmed terracotta pottery, artisanal glazed Mexican blue-orange tiles, roasted jalapeños, and fresh lime wedges.',
    bgImage: '/assets/themes/mexican-cantina.jpg',
    pageBgImages: ["/assets/themes/mexican-cantina.jpg", "/assets/themes/variations/mexican-cantina-facing.jpg", "/assets/themes/variations/mexican-cantina-alt.jpg"],
    accentIcon: 'Utensils',
    colors: {
      heading: '#7C2D12',
      subheading: '#C2410C',
      text: '#29180C',
      description: '#604128',
      price: '#C2410C',
      priceHalfFull: '#9A3412',
      border: 'rgba(194, 65, 12, 0.28)',
      safeZoneBg: 'transparent',
      scrimOverlay: 'rgba(0, 0, 0, 0)',
      ornament: '#0284C7',
      badgeVeg: '#15803D',
      badgeNonVeg: '#DC2626'
    },
    typography: {
      headingFont: "'Playfair Display', serif",
      subheadingFont: "'Playfair Display', serif",
      bodyFont: "'Plus Jakarta Sans', sans-serif",
      priceFont: "'Playfair Display', serif",
      fontCategory: 'serif'
    },
    safeZoneMargins: { top: '18%', bottom: '20%', left: '10%', right: '10%' },
    ornamentStyle: 'dotted-leader'
  },

  // 14. MEDITERRANEAN MEZZE & OLIVE GROVE
  {
    id: 'mediterranean-mezze',
    name: 'Mediterranean Mezze & Olive',
    cuisine: 'Greek, Lebanese & Mediterranean',
    badge: 'Limestone & Olive Branch',
    description: 'Chalky white Mediterranean limestone, fresh leafy olive branches, raw sea salt crystals and hand-thrown ceramic bowls.',
    bgImage: '/assets/themes/mediterranean-mezze.jpg',
    pageBgImages: ["/assets/themes/mediterranean-mezze.jpg", "/assets/themes/variations/mediterranean-mezze-facing.jpg", "/assets/themes/variations/mediterranean-mezze-alt.jpg"],
    accentIcon: 'Salad',
    colors: {
      heading: '#1E3A8A',
      subheading: '#3B82F6',
      text: '#1E293B',
      description: '#475569',
      price: '#1E3A8A',
      priceHalfFull: '#2563EB',
      border: 'rgba(30, 58, 138, 0.22)',
      safeZoneBg: 'transparent',
      scrimOverlay: 'rgba(0, 0, 0, 0)',
      ornament: '#166534',
      badgeVeg: '#166534',
      badgeNonVeg: '#B91C1C'
    },
    typography: {
      headingFont: "'Playfair Display', serif",
      subheadingFont: "'Playfair Display', serif",
      bodyFont: "'Plus Jakarta Sans', sans-serif",
      priceFont: "'Playfair Display', serif",
      fontCategory: 'serif'
    },
    safeZoneMargins: { top: '24%', bottom: '17%', left: '15%', right: '12%' },
    ornamentStyle: 'dotted-leader'
  },

  // 15. EXECUTIVE BLACK & GOLD STEAKHOUSE
  {
    id: 'black-gold-luxury',
    name: 'Executive Black & Gold Luxury',
    cuisine: 'Luxury Steakhouse & Caviar Bar',
    badge: 'Obsidian Marble & 24K Gold',
    description: 'Flawless black Belgian marble veins with brushed metallic 24K gold geometric art-deco borders and gold foil typography.',
    bgImage: '/assets/themes/black-gold-luxury.jpg',
    pageBgImages: ["/assets/themes/black-gold-luxury.jpg", "/assets/themes/variations/black-gold-luxury-facing.jpg", "/assets/themes/variations/black-gold-luxury-alt.jpg"],
    accentIcon: 'Crown',
    colors: {
      heading: '#FDE047',
      subheading: '#EAB308',
      text: '#F8FAFC',
      description: '#94A3B8',
      price: '#FDE047',
      priceHalfFull: '#EAB308',
      border: 'rgba(234, 179, 8, 0.35)',
      safeZoneBg: 'transparent',
      scrimOverlay: 'rgba(0, 0, 0, 0)',
      ornament: '#EAB308',
      badgeVeg: '#22C55E',
      badgeNonVeg: '#EF4444'
    },
    typography: {
      headingFont: "'Cinzel', serif",
      subheadingFont: "'Cinzel', serif",
      bodyFont: "'Plus Jakarta Sans', sans-serif",
      priceFont: "'Cinzel', serif",
      fontCategory: 'serif'
    },
    safeZoneMargins: { top: '12%', bottom: '12%', left: '10%', right: '10%' },
    ornamentStyle: 'solid-leader'
  },

  // 16. NAWABI DUM PUKHT (AWADHI ATELIER)
  {
    id: 'nawabi-dum-pukht',
    name: 'Nawabi Dum Pukht Atelier',
    cuisine: 'Awadhi, Lucknowi & Royal Mughlai',
    badge: 'Silver Wark & Kashmiri Velvet',
    description: 'Deep royal plum velvet border embellished with silver wark foils, royal green cardamom pods, and dried Damascus rose petals.',
    bgImage: '/assets/themes/nawabi-dum-pukht.jpg',
    pageBgImages: ["/assets/themes/nawabi-dum-pukht.jpg", "/assets/themes/variations/nawabi-dum-pukht-facing.jpg", "/assets/themes/variations/nawabi-dum-pukht-alt.jpg"],
    accentIcon: 'Sparkles',
    colors: {
      heading: '#2D0A1E',
      subheading: '#831843',
      text: '#180611',
      description: '#4A1D33',
      price: '#991B1B',
      priceHalfFull: '#78350F',
      border: 'rgba(131, 24, 67, 0.32)',
      safeZoneBg: 'transparent',
      scrimOverlay: 'rgba(0, 0, 0, 0)',
      ornament: '#831843',
      badgeVeg: '#166534',
      badgeNonVeg: '#991B1B'
    },
    typography: {
      headingFont: "'Cinzel', 'Playfair Display', serif",
      subheadingFont: "'Cinzel', serif",
      bodyFont: "'Plus Jakarta Sans', sans-serif",
      priceFont: "'Cinzel', serif",
      fontCategory: 'serif'
    },
    safeZoneMargins: { top: '8%', bottom: '25%', left: '12%', right: '10%' },
    ornamentStyle: 'vintage-flourish'
  },

  // 17. GELATO & SWEET TREATS
  {
    id: 'gelato-pastels',
    name: 'Gelato & Sweet Treats',
    cuisine: 'Ice Cream, Waffles & Sundaes',
    badge: 'Waffle Grid & Rainbow Sprinkles',
    description: 'Soft crisp waffle cone grid textures, pastel strawberry and pistachio cream drips, and celebratory rainbow sugar sprinkles.',
    bgImage: '/assets/themes/gelato-pastels.jpg',
    pageBgImages: ["/assets/themes/gelato-pastels.jpg", "/assets/themes/variations/gelato-pastels-facing.jpg", "/assets/themes/variations/gelato-pastels-alt.jpg"],
    accentIcon: 'Sparkles',
    colors: {
      heading: '#831843',
      subheading: '#BE185D',
      text: '#371B28',
      description: '#704258',
      price: '#BE185D',
      priceHalfFull: '#9D174D',
      border: 'rgba(190, 24, 93, 0.22)',
      safeZoneBg: 'transparent',
      scrimOverlay: 'rgba(0, 0, 0, 0)',
      ornament: '#DB2777',
      badgeVeg: '#15803D',
      badgeNonVeg: '#BE185D'
    },
    typography: {
      headingFont: "'Playfair Display', cursive, serif",
      subheadingFont: "'Playfair Display', serif",
      bodyFont: "'Plus Jakarta Sans', sans-serif",
      priceFont: "'Playfair Display', serif",
      fontCategory: 'display'
    },
    safeZoneMargins: { top: '12%', bottom: '14%', left: '10%', right: '10%' },
    ornamentStyle: 'dotted-leader'
  },

  // 18. CHALKBOARD CRAFT BREWERY & TAPROOM
  {
    id: 'chalkboard-bistro',
    name: 'Chalkboard Craft Brewery',
    cuisine: 'Gastropub, Microbrewery & Grills',
    badge: 'Aged Slate & Hand-Drawn Chalk',
    description: 'Deep matte blackboard with authentic chalk dust textures, hand-sketched beer mugs, barley stalks and playful bistro flourishes.',
    bgImage: '/assets/themes/chalkboard-bistro.jpg',
    pageBgImages: ["/assets/themes/chalkboard-bistro.jpg", "/assets/themes/variations/chalkboard-bistro-facing.jpg", "/assets/themes/variations/chalkboard-bistro-alt.jpg"],
    accentIcon: 'Beer',
    colors: {
      heading: '#FEF08A',
      subheading: '#FFFFFF',
      text: '#F3F4F6',
      description: '#9CA3AF',
      price: '#FEF08A',
      priceHalfFull: '#FDE047',
      border: 'rgba(254, 240, 138, 0.3)',
      safeZoneBg: 'transparent',
      scrimOverlay: 'rgba(0, 0, 0, 0)',
      ornament: '#FFFFFF',
      badgeVeg: '#4ADE80',
      badgeNonVeg: '#F87171'
    },
    typography: {
      headingFont: "'Oswald', sans-serif",
      subheadingFont: "'Oswald', sans-serif",
      bodyFont: "'Plus Jakarta Sans', sans-serif",
      priceFont: "'Oswald', sans-serif",
      fontCategory: 'display'
    },
    safeZoneMargins: { top: '12%', bottom: '12%', left: '10%', right: '10%' },
    ornamentStyle: 'dotted-leader'
  },

  // 19. INDUSTRIAL RAW KRAFT PAPER
  {
    id: 'industrial-kraft',
    name: 'Industrial Raw Kraft Paper',
    cuisine: 'Artisan Cafe, Brunch & Daily Specials',
    badge: 'Recycled Fiber & Rubber Stamp',
    description: 'Authentic fibrous brown kraft paper with brass binder clip impressions, postal rubber stamps, and vintage typewriter aesthetic.',
    bgImage: '/assets/themes/industrial-kraft.jpg',
    pageBgImages: ["/assets/themes/industrial-kraft.jpg", "/assets/themes/variations/industrial-kraft-facing.jpg", "/assets/themes/variations/industrial-kraft-alt.jpg"],
    accentIcon: 'FileText',
    colors: {
      heading: '#261C14',
      subheading: '#5C3818',
      text: '#1C130B',
      description: '#544131',
      price: '#78350F',
      priceHalfFull: '#5C3818',
      border: 'rgba(92, 56, 24, 0.28)',
      safeZoneBg: 'transparent',
      scrimOverlay: 'rgba(0, 0, 0, 0)',
      ornament: '#5C3818',
      badgeVeg: '#166534',
      badgeNonVeg: '#991B1B'
    },
    typography: {
      headingFont: "'Courier Prime', 'Oswald', monospace",
      subheadingFont: "'Courier Prime', 'Oswald', monospace",
      bodyFont: "'Plus Jakarta Sans', sans-serif",
      priceFont: "'Courier Prime', monospace",
      fontCategory: 'display'
    },
    safeZoneMargins: { top: '14%', bottom: '20%', left: '10%', right: '10%' },
    ornamentStyle: 'dotted-leader'
  },

  // 20. FIREPOT & DRAGON GRILL
  {
    id: 'firepot-dragon',
    name: 'Firepot & Dragon Grill',
    cuisine: 'Sichuan Hotpot, BBQ & Korean Grill',
    badge: 'Charcoal Flames & Red Lanterns',
    description: 'Deep scorched coal background with glowing orange embers, red Sichuan peppercorns, dried chilies, and crimson lantern silhouettes.',
    bgImage: '/assets/themes/firepot-dragon.jpg',
    pageBgImages: ["/assets/themes/firepot-dragon.jpg", "/assets/themes/variations/firepot-dragon-facing.jpg", "/assets/themes/variations/firepot-dragon-alt.jpg"],
    accentIcon: 'Flame',
    colors: {
      heading: '#FF4D4D',
      subheading: '#FFAA33',
      text: '#F3EFEA',
      description: '#C7B9AC',
      price: '#FF4D4D',
      priceHalfFull: '#FFAA33',
      border: 'rgba(255, 77, 77, 0.35)',
      safeZoneBg: 'transparent',
      scrimOverlay: 'rgba(0, 0, 0, 0)',
      ornament: '#FFAA33',
      badgeVeg: '#22C55E',
      badgeNonVeg: '#EF4444'
    },
    typography: {
      headingFont: "'Cinzel', serif",
      subheadingFont: "'Cinzel', serif",
      bodyFont: "'Plus Jakarta Sans', sans-serif",
      priceFont: "'Cinzel', serif",
      fontCategory: 'display'
    },
    safeZoneMargins: { top: '26%', bottom: '24%', left: '14%', right: '14%' },
    ornamentStyle: 'dotted-leader'
  }
];

export function getArtisanThemeById(id: string): ArtisanGraphicTheme {
  return artisanGraphicThemes.find(t => t.id === id) || artisanGraphicThemes[0];
}
