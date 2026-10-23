export type StickerThemeId = 
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
}

export const STICKER_TEMPLATES: StickerTemplate[] = [
  {
    id: 'menusqr-obsidian-gold',
    name: 'Imperial Obsidian',
    subtitle: 'Satin Titanium & 24K Gold Foil',
    accentColor: '#D4AF37',
    previewBg: 'linear-gradient(135deg, #0A0D0B 0%, #171E1A 100%)',
  },
  {
    id: 'menusqr-walnut-gold',
    name: 'Royal Heritage Walnut',
    subtitle: 'Italian Burl Walnut & Antique Brass',
    accentColor: '#DFB15B',
    previewBg: 'linear-gradient(135deg, #2D180C 0%, #4A2B19 100%)',
  },
  {
    id: 'menusqr-emerald-gold',
    name: 'Emerald Palace',
    subtitle: 'Royal British Velvet & Gold Leaf',
    accentColor: '#E5C158',
    previewBg: 'linear-gradient(135deg, #061A11 0%, #0D3322 100%)',
  },
  {
    id: 'menusqr-ruby-gold',
    name: 'Ruby Royale',
    subtitle: 'Vintage Bordeaux & Champagne Gold',
    accentColor: '#E6BC65',
    previewBg: 'linear-gradient(135deg, #22060C 0%, #3D0D18 100%)',
  },
  {
    id: 'menusqr-marble-gold',
    name: 'Carrara Marble',
    subtitle: 'Italian Porcelain & Brushed Rose Gold',
    accentColor: '#C49A6C',
    previewBg: 'linear-gradient(135deg, #ECECEE 0%, #FFFFFF 100%)',
  },
];
