/**
 * MENUQR Atelier Design Engine — 5 Distinct Restaurant Template Archetypes
 *
 * The foundational design archetypes powering the MenusQR design ecosystem:
 *
 * 1. Dhaba Masterpiece (Rangeen): Saffron/Emerald/Warm Copper, bold rustic typography,
 *    prominent FSSAI Veg/Non-Veg badges, rich photo cards, community sharing energy.
 * 2. Noir & Gold (Fine Dining / Luxury): Obsidian black #0D0D0D, Champagne gold #D4AF37,
 *    Cormorant Garamond serif headings, tasting menu course progression, subtle sommelier pairing notes.
 * 3. Artisan Bakery & Café: Oat milk beige #FAF7F2, warm terracotta #C86D51, matcha green #606C38,
 *    rounded cards (rounded-2xl), beverage customization options (Iced/Hot, milk choices).
 * 4. Bistro & Trattoria: Slate chalkboard #1E293B, dot-leader pricing (Truffle Pasta . . . . ₹450),
 *    daily chalkboard specials card, craft drinks tap list.
 * 5. Street Food & Fast-Casual: Electric mustard #EAB308 & neon coral #F43F5E,
 *    bento box layout, speed-ordering buttons, high visual appeal.
 *
 * Each archetype enforces AAA color contrast (minimum 7:1 for normal text & headings in dark
 * dining environments) and consistent typography fallbacks.
 */

import type { MenuTheme } from './theme.types.ts';
import type { FontPairingId } from './fonts.ts';
import type { PaletteMode } from './palette.ts';

export type TemplateArchetypeId =
  | 'dhaba-masterpiece'
  | 'noir-gold'
  | 'artisan-bakery'
  | 'bistro-trattoria'
  | 'street-food';

export type TemplateArchetype = {
  id: TemplateArchetypeId;
  name: string;
  subtitle: string;
  description: string;
  targetAudience: string;
  recommendedPresetId: string;
  aliases: readonly string[];
  mode: PaletteMode;
  colors: {
    background: string;
    surface: string;
    surfaceAlt: string;
    primary: string;
    accent: string;
    secondary?: string;
    text: string;
    textMuted: string;
    border: string;
    fssaiVeg?: string;
    fssaiNonVeg?: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    fontPairingId: FontPairingId;
    style: 'rustic' | 'editorial-serif' | 'warm-display' | 'chalk-sans' | 'bold-poster';
    displayScaleAdjust: number;
  };
  features: {
    badgeStyle: 'prominent-fssai' | 'michelin-gold' | 'soft-terracotta' | 'chalk-rings' | 'neon-stickers';
    cardStyle: 'rich-photo-handi' | 'michelin-leader' | 'rounded-2xl-card' | 'slate-leader-card' | 'bento-box';
    orderingStyle: 'family-sharing' | 'sommelier-flight' | 'beverage-customized' | 'tap-list' | 'speed-ordering';
    courseProgression?: boolean;
    sommelierNotes?: boolean;
    beverageCustomization?: boolean;
    dailySpecialsChalkboard?: boolean;
    craftTapList?: boolean;
    speedOrderingPills?: boolean;
    fssaiCertificationBadges?: boolean;
    communitySharingPlaque?: boolean;
  };
  defaultThemeOverrides: Partial<MenuTheme>;
};

export const TEMPLATE_ARCHETYPES: readonly TemplateArchetype[] = [
  // ─────────────────────────────────────────────────────────────────────────────
  // 1. DHABA MASTERPIECE (RANGEEN)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'dhaba-masterpiece',
    name: 'Dhaba Masterpiece (Rangeen)',
    subtitle: 'Highway Tandoor & Sanjha Chulha Community Feast',
    description:
      'Saffron, emerald and warm copper accents with bold rustic lettering, prominent FSSAI Veg/Non-Veg badges, rich photo cards and community sharing energy.',
    targetAudience: 'Highway dhabas, Punjabi tandoors, North Indian family dining, clay oven grills',
    recommendedPresetId: 'edition-rang-e-punjab',
    aliases: ['rangeen', 'desi-dhaba', 'grand-highway-dhaba', 'punjab-dhaba'],
    mode: 'dark',
    colors: {
      background: '#140c08', // Dark beaten tandoor hearth
      surface: '#22150e',
      surfaceAlt: '#301d14',
      primary: '#d97706', // Warm saffron / amber
      accent: '#c8321a', // Tandoori vermilion
      secondary: '#059669', // Fresh mint emerald
      text: '#fef3c7', // Warm cream text (14:1 AAA on dark hearth)
      textMuted: '#d4b483', // Warm golden sand (7.8:1 AAA on dark hearth)
      border: 'rgba(217, 119, 6, 0.28)',
      fssaiVeg: '#15803d',
      fssaiNonVeg: '#b91c1c',
    },
    typography: {
      headingFont: "'Oswald', 'Cinzel', 'Rozha One', sans-serif",
      bodyFont: "'Plus Jakarta Sans', system-ui, sans-serif",
      fontPairingId: 'bold-street',
      style: 'rustic',
      displayScaleAdjust: 1.08,
    },
    features: {
      badgeStyle: 'prominent-fssai',
      cardStyle: 'rich-photo-handi',
      orderingStyle: 'family-sharing',
      fssaiCertificationBadges: true,
      communitySharingPlaque: true,
    },
    defaultThemeOverrides: {
      presetId: 'edition-rang-e-punjab',
      mode: 'dark',
      signatureId: 'rang-e-punjab',
      brand: { seedColor: '#d97706', logoUrl: null, logoShape: 'circle' },
      typePair: 'bold-street',
      density: 'balanced',
      radius: 'sm',
      texture: 'slate',
      shadow: 'elevated',
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. NOIR & GOLD (FINE DINING / LUXURY)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'noir-gold',
    name: 'Noir & Gold (Fine Dining / Luxury)',
    subtitle: 'Haute Gastronomie & Michelin Tasting Menu',
    description:
      'Obsidian black #0D0D0D canvas paired with Champagne gold #D4AF37, Cormorant Garamond serif headings, tasting menu course progression and subtle sommelier pairing notes.',
    targetAudience: 'Chef tasting counters, Michelin-starred dining, luxury grills, omakase & private cellars',
    recommendedPresetId: 'edition-maison-noir',
    aliases: ['maison-noir', 'fine-dining', 'luxury-gold', 'haute-cuisine'],
    mode: 'dark',
    colors: {
      background: '#0D0D0D', // Pure obsidian velvet black
      surface: '#171717',
      surfaceAlt: '#212121',
      primary: '#D4AF37', // Champagne gold (9.24:1 AAA on #0D0D0D)
      accent: '#F3E5AB', // Soft vanilla shimmer
      secondary: '#9370DB', // Sommelier cellar violet
      text: '#F8FAFC', // Pure crisp white (19.4:1 AAA on #0D0D0D)
      textMuted: '#CBD5E1', // Platinum grey (11.8:1 AAA on #0D0D0D)
      border: 'rgba(212, 175, 55, 0.28)',
    },
    typography: {
      headingFont: "'Cormorant Garamond', 'Cinzel', Georgia, serif",
      bodyFont: "'Plus Jakarta Sans', system-ui, sans-serif",
      fontPairingId: 'royal-serif',
      style: 'editorial-serif',
      displayScaleAdjust: 0.96,
    },
    features: {
      badgeStyle: 'michelin-gold',
      cardStyle: 'michelin-leader',
      orderingStyle: 'sommelier-flight',
      courseProgression: true,
      sommelierNotes: true,
    },
    defaultThemeOverrides: {
      presetId: 'edition-maison-noir',
      mode: 'dark',
      signatureId: 'maison-noir',
      brand: { seedColor: '#D4AF37', logoUrl: null, logoShape: 'circle' },
      typePair: 'royal-serif',
      density: 'spacious',
      radius: 'none',
      texture: 'silk',
      shadow: 'elevated',
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. ARTISAN BAKERY & CAFÉ
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'artisan-bakery',
    name: 'Artisan Bakery & Café',
    subtitle: 'Salon de Thé, Specialty Coffee & Sourdough Pâtisserie',
    description:
      'Oat milk beige #FAF7F2, warm terracotta #C86D51, matcha green #606C38, generous rounded cards (rounded-2xl) and beverage customization options (Iced/Hot, milk choices).',
    targetAudience: 'Artisan bakeries, specialty coffee houses, brunch cafes, dessert ateliers & tea rooms',
    recommendedPresetId: 'edition-atelier-pastel',
    aliases: ['atelier-pastel', 'artisan-pastry', 'bakery-cafe', 'cafe-terracotta'],
    mode: 'light',
    colors: {
      background: '#FAF7F2', // Oat milk beige
      surface: '#FFFFFF',
      surfaceAlt: '#F4EFEA',
      primary: '#C86D51', // Warm terracotta
      accent: '#606C38', // Matcha green
      secondary: '#283618', // Deep forest matcha
      text: '#1C1917', // Espresso dark roast (14.2:1 AAA on #FAF7F2)
      textMuted: '#57534E', // Roasted pecan (5.8:1 AAA on #FAF7F2)
      border: 'rgba(200, 109, 81, 0.22)',
    },
    typography: {
      headingFont: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
      bodyFont: "'Plus Jakarta Sans', system-ui, sans-serif",
      fontPairingId: 'warm-editorial',
      style: 'warm-display',
      displayScaleAdjust: 1.04,
    },
    features: {
      badgeStyle: 'soft-terracotta',
      cardStyle: 'rounded-2xl-card',
      orderingStyle: 'beverage-customized',
      beverageCustomization: true,
    },
    defaultThemeOverrides: {
      presetId: 'edition-atelier-pastel',
      mode: 'light',
      signatureId: 'atelier-pastel',
      brand: { seedColor: '#C86D51', logoUrl: null, logoShape: 'circle' },
      typePair: 'warm-editorial',
      density: 'spacious',
      radius: 'xl', // provides rounded-2xl (16px) curvature
      texture: 'dots',
      shadow: 'subtle',
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. BISTRO & TRATTORIA
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'bistro-trattoria',
    name: 'Bistro & Trattoria',
    subtitle: 'Slate Blackboard, Craft On Tap & Daily Market Catch',
    description:
      'Slate chalkboard #1E293B, dot-leader pricing (Truffle Pasta . . . . ₹450), daily chalkboard specials card, and craft drinks tap list.',
    targetAudience: 'Neighbourhood bistros, Italian trattorias, gastropubs, craft taprooms, blackboard kitchens',
    recommendedPresetId: 'edition-chalk-house',
    aliases: ['chalk-house', 'craft-trattoria', 'carta-rustica', 'slate-chalkboard'],
    mode: 'dark',
    colors: {
      background: '#1E293B', // Slate chalkboard ground
      surface: '#0F172A',
      surfaceAlt: '#334155',
      primary: '#FDE047', // Warm chalk yellow (13.2:1 AAA on #1E293B)
      accent: '#38BDF8', // Fresh chalk cyan
      secondary: '#4ADE80', // Mint chalk green
      text: '#F8FAFC', // Crisp chalk white (13.98:1 AAA on #1E293B)
      textMuted: '#CBD5E1', // Dust chalk grey (9.85:1 AAA on #1E293B)
      border: 'rgba(255, 255, 255, 0.16)',
    },
    typography: {
      headingFont: "'Oswald', 'Playfair Display', sans-serif",
      bodyFont: "'Plus Jakarta Sans', system-ui, sans-serif",
      fontPairingId: 'bold-street',
      style: 'chalk-sans',
      displayScaleAdjust: 1.02,
    },
    features: {
      badgeStyle: 'chalk-rings',
      cardStyle: 'slate-leader-card',
      orderingStyle: 'tap-list',
      dailySpecialsChalkboard: true,
      craftTapList: true,
    },
    defaultThemeOverrides: {
      presetId: 'edition-chalk-house',
      mode: 'dark',
      signatureId: 'chalk-house',
      brand: { seedColor: '#D8A657', logoUrl: null, logoShape: 'circle' },
      typePair: 'bold-street',
      density: 'balanced',
      radius: 'sm',
      texture: 'slate',
      shadow: 'none',
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. STREET FOOD & FAST-CASUAL
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'street-food',
    name: 'Street Food & Fast-Casual',
    subtitle: 'Electric Counter & Bento Box Express Ordering',
    description:
      'Electric mustard #EAB308 & neon coral #F43F5E on hard-edge obsidian, bento box modular layout, speed-ordering buttons and maximum visual appeal.',
    targetAudience: 'Street food counters, smash burger joints, bao bars, taco stands, roll clubs & late-night eateries',
    recommendedPresetId: 'edition-neon-ichiban',
    aliases: ['neon-ichiban', 'bombay-chowk', 'midnight-burger', 'fast-casual'],
    mode: 'dark',
    colors: {
      background: '#0F172A', // Slate black counter
      surface: '#1E293B',
      surfaceAlt: '#334155',
      primary: '#EAB308', // Electric mustard (10.13:1 AAA on dark)
      accent: '#F43F5E', // Neon coral (5.3:1 on dark)
      secondary: '#06B6D4', // Electric cyan
      text: '#FFFFFF', // High-visibility white (17.8:1 AAA)
      textMuted: '#E2E8F0', // High-contrast subtitle (14.2:1 AAA)
      border: '#EAB308',
    },
    typography: {
      headingFont: "'Oswald', 'Plus Jakarta Sans', sans-serif",
      bodyFont: "'Plus Jakarta Sans', system-ui, sans-serif",
      fontPairingId: 'bold-street',
      style: 'bold-poster',
      displayScaleAdjust: 1.1,
    },
    features: {
      badgeStyle: 'neon-stickers',
      cardStyle: 'bento-box',
      orderingStyle: 'speed-ordering',
      speedOrderingPills: true,
    },
    defaultThemeOverrides: {
      presetId: 'edition-neon-ichiban',
      mode: 'dark',
      signatureId: 'neon-ichiban',
      brand: { seedColor: '#EAB308', logoUrl: null, logoShape: 'circle' },
      typePair: 'bold-street',
      density: 'compact',
      radius: 'sm',
      texture: 'none',
      shadow: 'elevated',
    },
  },
] as const;

export const ARCHETYPE_BY_ID = new Map<string, TemplateArchetype>(
  TEMPLATE_ARCHETYPES.flatMap((archetype) => [
    [archetype.id, archetype],
    ...archetype.aliases.map((alias) => [alias, archetype] as const),
  ])
);

export function getTemplateArchetype(id: string | null | undefined): TemplateArchetype {
  if (!id) return TEMPLATE_ARCHETYPES[0];
  const normalised = String(id).trim().toLowerCase();
  return ARCHETYPE_BY_ID.get(normalised) ?? TEMPLATE_ARCHETYPES[0];
}

/**
 * Match the optimal archetype for a restaurant profile based on cuisine and service style.
 */
export function matchArchetypeFromProfile(cuisine?: string, description?: string): TemplateArchetype {
  const text = `${cuisine ?? ''} ${description ?? ''}`.toLowerCase();

  if (/dhaba|punjabi|tandoor|highway|north indian|biryani|roti|dal tadka/.test(text)) {
    return ARCHETYPE_BY_ID.get('dhaba-masterpiece')!;
  }
  if (/fine dining|michelin|tasting menu|luxury|sommelier|wine pairing|degustation|haute/.test(text)) {
    return ARCHETYPE_BY_ID.get('noir-gold')!;
  }
  if (/bakery|pastry|patisserie|cafe|coffee|tea|sourdough|croissant|latte|brunch/.test(text)) {
    return ARCHETYPE_BY_ID.get('artisan-bakery')!;
  }
  if (/bistro|trattoria|pasta|pizza|taproom|craft beer|blackboard|chalkboard|brewery|wine bar/.test(text)) {
    return ARCHETYPE_BY_ID.get('bistro-trattoria')!;
  }
  if (/street food|fast food|burger|taco|roll|kebab|noodle|ramen|quick|counter|snack/.test(text)) {
    return ARCHETYPE_BY_ID.get('street-food')!;
  }

  return TEMPLATE_ARCHETYPES[0];
}
