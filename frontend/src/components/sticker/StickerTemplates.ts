export type StickerThemeId =
  | 'menusqr-flagship-standee'
  | 'menusqr-tandoor-fire'
  | 'menusqr-herb-garden'
  | 'menusqr-neon-bites'
  // Legacy aliases for backward compatibility
  | 'menusqr-obsidian-gold'
  | 'menusqr-walnut-gold'
  | 'menusqr-emerald-gold'
  | 'menusqr-ruby-gold'
  | 'menusqr-marble-gold';

export interface StickerTemplate {
  id: StickerThemeId;
  name: string;
  subtitle: string;
  accentColor: string;
  previewBg: string;
  category: string;
}

export const STICKER_TEMPLATES: StickerTemplate[] = [
  {
    id: 'menusqr-flagship-standee',
    name: 'Culinary Gold Table Sticker',
    subtitle: 'Print-Ready 3D Gold Plaque Sticker • Sizzling Skillet & Spices',
    accentColor: '#D4AF37',
    previewBg: 'linear-gradient(135deg, #1C1209 0%, #D4AF37 50%, #825E12 100%)',
    category: 'Print-Ready Table Sticker',
  },
  {
    id: 'menusqr-tandoor-fire',
    name: 'Tandoor Fire',
    subtitle: 'Smoky Charcoal, Saffron & Spiced Ember Hearth',
    accentColor: '#E88328',
    previewBg: 'linear-gradient(135deg, #18120E 0%, #D83A20 60%, #E88328 100%)',
    category: 'Indian & Flame Grill',
  },
  {
    id: 'menusqr-herb-garden',
    name: 'Herb Garden',
    subtitle: 'Artisan Linen, Botanical Sage & Forest Flora',
    accentColor: '#2D5E3C',
    previewBg: 'linear-gradient(135deg, #FAF7F0 0%, #E2ECE5 50%, #2D5E3C 100%)',
    category: 'Bistro, Café & Farm-to-Table',
  },
  {
    id: 'menusqr-neon-bites',
    name: 'Neon Bites',
    subtitle: 'Jet Slate, Electric Cyber Citrus & Hot Coral',
    accentColor: '#00F0FF',
    previewBg: 'linear-gradient(135deg, #0A0B0E 0%, #1A1F2C 50%, #FF3366 100%)',
    category: 'Street Food & Gastro-Bar',
  },
];
