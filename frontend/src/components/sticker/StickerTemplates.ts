export type StickerThemeId =
  | 'menusqr-obsidian-gold'
  | 'menusqr-walnut-gold'
  | 'menusqr-emerald-gold'
  | 'menusqr-ruby-gold'
  | 'menusqr-marble-gold'
  | 'menusqr-tandoor-fire'
  // Backward compatibility aliases
  | 'menusqr-flagship-standee'
  | 'menusqr-herb-garden'
  | 'menusqr-neon-bites';

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
    id: 'menusqr-marble-gold',
    name: 'Imperial Royal Ivory & Gold',
    subtitle: 'Calacatta Alabaster, Antique Brass & 24K Gold',
    accentColor: '#BF8E2C',
    previewBg: 'linear-gradient(135deg, #FFFFFF 0%, #FAF7F0 50%, #EBE0CD 100%)',
    category: 'Royal Light Plaque',
  },
];
