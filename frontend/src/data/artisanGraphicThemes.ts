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
    accentIcon: 'Anchor',
    colors: {
      heading: '#2D1606',
      subheading: '#8B4513',
      text: '#1C120C',
      description: '#5A4638',
      price: '#9E2A2B',
      priceHalfFull: '#78350F',
      border: 'rgba(139, 69, 19, 0.28)',
      safeZoneBg: 'rgba(235, 218, 193, 0.88)',
      scrimOverlay: 'radial-gradient(ellipse at center, rgba(240, 225, 203, 0.95) 0%, rgba(224, 202, 172, 0.9) 100%)',
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
    safeZoneMargins: {
      top: '13%',
      bottom: '12%',
      left: '12%',
      right: '12%'
    },
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
    accentIcon: 'Flame',
    colors: {
      heading: '#FAF0E6',
      subheading: '#E25822',
      text: '#F3E5D8',
      description: '#D1B8A0',
      price: '#FF7A38',
      priceHalfFull: '#F59E0B',
      border: 'rgba(226, 88, 34, 0.35)',
      safeZoneBg: 'rgba(24, 18, 15, 0.92)',
      scrimOverlay: 'radial-gradient(ellipse at center, rgba(28, 20, 16, 0.94) 0%, rgba(18, 12, 10, 0.98) 100%)',
      ornament: '#E25822',
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
    safeZoneMargins: {
      top: '11%',
      bottom: '11%',
      left: '11%',
      right: '11%'
    },
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
    accentIcon: 'Pizza',
    colors: {
      heading: '#2B1700',
      subheading: '#991B1B',
      text: '#261C14',
      description: '#5C4A3E',
      price: '#991B1B',
      priceHalfFull: '#78350F',
      border: 'rgba(153, 27, 27, 0.25)',
      safeZoneBg: 'rgba(253, 248, 240, 0.94)',
      scrimOverlay: 'radial-gradient(ellipse at center, rgba(255, 252, 247, 0.97) 0%, rgba(246, 238, 226, 0.92) 100%)',
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
    safeZoneMargins: {
      top: '12%',
      bottom: '11%',
      left: '11%',
      right: '11%'
    },
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
    accentIcon: 'Crown',
    colors: {
      heading: '#D4AF37',
      subheading: '#F3C053',
      text: '#FAF3E0',
      description: '#D8C3A5',
      price: '#F59E0B',
      priceHalfFull: '#FBBF24',
      border: 'rgba(212, 175, 55, 0.35)',
      safeZoneBg: 'rgba(30, 8, 18, 0.93)',
      scrimOverlay: 'radial-gradient(ellipse at center, rgba(38, 10, 24, 0.95) 0%, rgba(20, 4, 12, 0.98) 100%)',
      ornament: '#D4AF37',
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
    safeZoneMargins: {
      top: '12%',
      bottom: '12%',
      left: '11%',
      right: '11%'
    },
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
    accentIcon: 'Croissant',
    colors: {
      heading: '#3D2B1F',
      subheading: '#8C5A3E',
      text: '#2E2018',
      description: '#6E5545',
      price: '#9C4221',
      priceHalfFull: '#7A3519',
      border: 'rgba(140, 90, 62, 0.22)',
      safeZoneBg: 'rgba(255, 252, 248, 0.95)',
      scrimOverlay: 'radial-gradient(ellipse at center, rgba(255, 253, 250, 0.98) 0%, rgba(247, 240, 232, 0.92) 100%)',
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
    safeZoneMargins: {
      top: '11%',
      bottom: '10%',
      left: '10%',
      right: '10%'
    },
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
    accentIcon: 'Coffee',
    colors: {
      heading: '#2D1B11',
      subheading: '#6F4E37',
      text: '#22150D',
      description: '#5E4334',
      price: '#8B4513',
      priceHalfFull: '#6B3209',
      border: 'rgba(111, 78, 55, 0.3)',
      safeZoneBg: 'rgba(244, 235, 222, 0.93)',
      scrimOverlay: 'radial-gradient(ellipse at center, rgba(248, 240, 230, 0.96) 0%, rgba(236, 224, 206, 0.9) 100%)',
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
    safeZoneMargins: {
      top: '12%',
      bottom: '11%',
      left: '11%',
      right: '11%'
    },
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
    accentIcon: 'Wine',
    colors: {
      heading: '#FBBF24',
      subheading: '#F59E0B',
      text: '#F3F4F6',
      description: '#9CA3AF',
      price: '#F59E0B',
      priceHalfFull: '#D97706',
      border: 'rgba(245, 158, 11, 0.28)',
      safeZoneBg: 'rgba(15, 17, 23, 0.93)',
      scrimOverlay: 'radial-gradient(ellipse at center, rgba(18, 21, 28, 0.96) 0%, rgba(9, 10, 14, 0.99) 100%)',
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
    safeZoneMargins: {
      top: '12%',
      bottom: '12%',
      left: '11%',
      right: '11%'
    },
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
    accentIcon: 'Leaf',
    colors: {
      heading: '#143826',
      subheading: '#2D6A4F',
      text: '#1C2E24',
      description: '#4B6B58',
      price: '#1E5A3E',
      priceHalfFull: '#2D6A4F',
      border: 'rgba(45, 106, 79, 0.25)',
      safeZoneBg: 'rgba(255, 255, 255, 0.94)',
      scrimOverlay: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.98) 0%, rgba(242, 247, 244, 0.92) 100%)',
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
    safeZoneMargins: {
      top: '11%',
      bottom: '10%',
      left: '10%',
      right: '10%'
    },
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
    accentIcon: 'Soup',
    colors: {
      heading: '#881337',
      subheading: '#9F1239',
      text: '#2A1810',
      description: '#5C4436',
      price: '#9F1239',
      priceHalfFull: '#BE123C',
      border: 'rgba(159, 18, 57, 0.25)',
      safeZoneBg: 'rgba(253, 246, 237, 0.94)',
      scrimOverlay: 'radial-gradient(ellipse at center, rgba(255, 250, 242, 0.97) 0%, rgba(246, 234, 219, 0.91) 100%)',
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
    safeZoneMargins: {
      top: '12%',
      bottom: '11%',
      left: '11%',
      right: '11%'
    },
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
    accentIcon: 'Fish',
    colors: {
      heading: '#E5E7EB',
      subheading: '#F43F5E',
      text: '#E2E8F0',
      description: '#94A3B8',
      price: '#F43F5E',
      priceHalfFull: '#FB7185',
      border: 'rgba(244, 63, 94, 0.3)',
      safeZoneBg: 'rgba(18, 20, 26, 0.94)',
      scrimOverlay: 'radial-gradient(ellipse at center, rgba(22, 25, 32, 0.96) 0%, rgba(12, 14, 18, 0.99) 100%)',
      ornament: '#F43F5E',
      badgeVeg: '#10B981',
      badgeNonVeg: '#F43F5E'
    },
    typography: {
      headingFont: "'Cinzel', sans-serif",
      subheadingFont: "'Cinzel', sans-serif",
      bodyFont: "'Plus Jakarta Sans', sans-serif",
      priceFont: "'Cinzel', sans-serif",
      fontCategory: 'sans'
    },
    safeZoneMargins: {
      top: '11%',
      bottom: '11%',
      left: '10%',
      right: '10%'
    },
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
    accentIcon: 'Sparkles',
    colors: {
      heading: '#854D0E',
      subheading: '#C2410C',
      text: '#29180C',
      description: '#5A3D25',
      price: '#C2410C',
      priceHalfFull: '#9A3412',
      border: 'rgba(194, 65, 12, 0.28)',
      safeZoneBg: 'rgba(254, 249, 238, 0.95)',
      scrimOverlay: 'radial-gradient(ellipse at center, rgba(255, 252, 244, 0.98) 0%, rgba(249, 239, 219, 0.92) 100%)',
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
    safeZoneMargins: {
      top: '11%',
      bottom: '11%',
      left: '11%',
      right: '11%'
    },
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
    accentIcon: 'Beef',
    colors: {
      heading: '#991B1B',
      subheading: '#B45309',
      text: '#1F1A17',
      description: '#574C45',
      price: '#991B1B',
      priceHalfFull: '#B45309',
      border: 'rgba(185, 28, 28, 0.25)',
      safeZoneBg: 'rgba(255, 253, 248, 0.96)',
      scrimOverlay: 'radial-gradient(ellipse at center, rgba(255, 254, 251, 0.98) 0%, rgba(250, 244, 233, 0.93) 100%)',
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
    safeZoneMargins: {
      top: '11%',
      bottom: '10%',
      left: '10%',
      right: '10%'
    },
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
    accentIcon: 'Utensils',
    colors: {
      heading: '#7C2D12',
      subheading: '#C2410C',
      text: '#29180C',
      description: '#604128',
      price: '#C2410C',
      priceHalfFull: '#9A3412',
      border: 'rgba(194, 65, 12, 0.28)',
      safeZoneBg: 'rgba(255, 250, 240, 0.94)',
      scrimOverlay: 'radial-gradient(ellipse at center, rgba(255, 253, 246, 0.97) 0%, rgba(248, 238, 221, 0.91) 100%)',
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
    safeZoneMargins: {
      top: '12%',
      bottom: '11%',
      left: '11%',
      right: '11%'
    },
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
    accentIcon: 'Salad',
    colors: {
      heading: '#1E3A8A',
      subheading: '#3B82F6',
      text: '#1E293B',
      description: '#475569',
      price: '#1E3A8A',
      priceHalfFull: '#2563EB',
      border: 'rgba(30, 58, 138, 0.22)',
      safeZoneBg: 'rgba(255, 255, 255, 0.95)',
      scrimOverlay: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.98) 0%, rgba(241, 245, 249, 0.92) 100%)',
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
    safeZoneMargins: {
      top: '11%',
      bottom: '10%',
      left: '10%',
      right: '10%'
    },
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
    accentIcon: 'Crown',
    colors: {
      heading: '#FDE047',
      subheading: '#EAB308',
      text: '#F8FAFC',
      description: '#94A3B8',
      price: '#FDE047',
      priceHalfFull: '#EAB308',
      border: 'rgba(234, 179, 8, 0.35)',
      safeZoneBg: 'rgba(15, 17, 23, 0.94)',
      scrimOverlay: 'radial-gradient(ellipse at center, rgba(18, 20, 27, 0.96) 0%, rgba(10, 11, 15, 0.99) 100%)',
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
    safeZoneMargins: {
      top: '12%',
      bottom: '12%',
      left: '11%',
      right: '11%'
    },
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
    accentIcon: 'Sparkles',
    colors: {
      heading: '#E5E7EB',
      subheading: '#FBBF24',
      text: '#F3F4F6',
      description: '#CBD5E1',
      price: '#FBBF24',
      priceHalfFull: '#F59E0B',
      border: 'rgba(251, 191, 36, 0.32)',
      safeZoneBg: 'rgba(32, 10, 28, 0.94)',
      scrimOverlay: 'radial-gradient(ellipse at center, rgba(39, 12, 34, 0.96) 0%, rgba(22, 6, 19, 0.99) 100%)',
      ornament: '#CBD5E1',
      badgeVeg: '#22C55E',
      badgeNonVeg: '#EF4444'
    },
    typography: {
      headingFont: "'Cinzel', 'Playfair Display', serif",
      subheadingFont: "'Cinzel', serif",
      bodyFont: "'Plus Jakarta Sans', sans-serif",
      priceFont: "'Cinzel', serif",
      fontCategory: 'serif'
    },
    safeZoneMargins: {
      top: '12%',
      bottom: '12%',
      left: '11%',
      right: '11%'
    },
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
    accentIcon: 'Sparkles',
    colors: {
      heading: '#831843',
      subheading: '#BE185D',
      text: '#371B28',
      description: '#704258',
      price: '#BE185D',
      priceHalfFull: '#9D174D',
      border: 'rgba(190, 24, 93, 0.22)',
      safeZoneBg: 'rgba(255, 251, 253, 0.95)',
      scrimOverlay: 'radial-gradient(ellipse at center, rgba(255, 253, 254, 0.98) 0%, rgba(252, 238, 245, 0.92) 100%)',
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
    safeZoneMargins: {
      top: '11%',
      bottom: '10%',
      left: '10%',
      right: '10%'
    },
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
    accentIcon: 'Beer',
    colors: {
      heading: '#FEF08A',
      subheading: '#FFFFFF',
      text: '#F3F4F6',
      description: '#9CA3AF',
      price: '#FEF08A',
      priceHalfFull: '#FDE047',
      border: 'rgba(254, 240, 138, 0.3)',
      safeZoneBg: 'rgba(24, 26, 27, 0.94)',
      scrimOverlay: 'radial-gradient(ellipse at center, rgba(28, 30, 32, 0.96) 0%, rgba(16, 17, 18, 0.99) 100%)',
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
    safeZoneMargins: {
      top: '11%',
      bottom: '11%',
      left: '10%',
      right: '10%'
    },
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
    accentIcon: 'FileText',
    colors: {
      heading: '#261C14',
      subheading: '#5C3818',
      text: '#1C130B',
      description: '#544131',
      price: '#78350F',
      priceHalfFull: '#5C3818',
      border: 'rgba(92, 56, 24, 0.28)',
      safeZoneBg: 'rgba(237, 222, 201, 0.93)',
      scrimOverlay: 'radial-gradient(ellipse at center, rgba(242, 229, 210, 0.96) 0%, rgba(228, 211, 188, 0.9) 100%)',
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
    safeZoneMargins: {
      top: '12%',
      bottom: '11%',
      left: '11%',
      right: '11%'
    },
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
    accentIcon: 'Flame',
    colors: {
      heading: '#FF4D4D',
      subheading: '#FFAA33',
      text: '#F3EFEA',
      description: '#C7B9AC',
      price: '#FF4D4D',
      priceHalfFull: '#FFAA33',
      border: 'rgba(255, 77, 77, 0.35)',
      safeZoneBg: 'rgba(20, 14, 14, 0.94)',
      scrimOverlay: 'radial-gradient(ellipse at center, rgba(26, 18, 18, 0.96) 0%, rgba(14, 10, 10, 0.99) 100%)',
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
    safeZoneMargins: {
      top: '12%',
      bottom: '12%',
      left: '11%',
      right: '11%'
    },
    ornamentStyle: 'dotted-leader'
  }
];

export function getArtisanThemeById(id: string): ArtisanGraphicTheme {
  return artisanGraphicThemes.find(t => t.id === id) || artisanGraphicThemes[0];
}
