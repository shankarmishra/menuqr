export interface StickerTemplate {
  id: 'menusqr-walnut-gold' | 'menusqr-emerald-gold' | 'menusqr-ebony-silver' | 'menusqr-ruby-gold';
  name: string;
  accentColor: string;
}

export const STICKER_TEMPLATES: StickerTemplate[] = [
  {
    id: 'menusqr-walnut-gold',
    name: 'Royal Walnut & Gold',
    accentColor: '#D4AF37',
  },
  {
    id: 'menusqr-emerald-gold',
    name: 'Emerald & Gold',
    accentColor: '#D4AF37',
  },
  {
    id: 'menusqr-ebony-silver',
    name: 'Midnight Ebony & Silver',
    accentColor: '#94A3B8',
  },
  {
    id: 'menusqr-ruby-gold',
    name: 'Royal Ruby & Gold',
    accentColor: '#D4AF37',
  },
];
