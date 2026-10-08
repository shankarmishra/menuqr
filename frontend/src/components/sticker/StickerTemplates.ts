export interface StickerTemplate {
  id: string;
  name: string;
  // Colors
  primaryBg: string; // The inner parchment paper section
  secondaryBg: string; // The dark wood outer frame section
  accentColor: string; // The metallic gold accent color
  textLight: string;
  textDark: string;
  // Typography
  titleFont: string; // e.g. Playfair Display
  headerFont: string; // e.g. Montserrat
  // Layout Options
  hasCurvedHeader: boolean;
  hasCurvedFooter: boolean;
  hasGoldenBursts: boolean;
  hasCornerLeaves: boolean;
  hasWoodFrame?: boolean;
  // Assets
  textureUrl?: string; // Optional noise/texture overlay
}

export const STICKER_TEMPLATES: StickerTemplate[] = [
  {
    id: 'menusqr-walnut-gold',
    name: 'Royal Walnut & Gold',
    primaryBg: '#FAF4EA',
    secondaryBg: '#2E180D',
    accentColor: '#D4AF37',
    textLight: '#FFE89E',
    textDark: '#22140A',
    titleFont: "'Playfair Display', Georgia, serif",
    headerFont: "'Montserrat', 'Poppins', sans-serif",
    hasCurvedHeader: false,
    hasCurvedFooter: false,
    hasGoldenBursts: false,
    hasCornerLeaves: true,
    hasWoodFrame: true,
    textureUrl: "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E"
  },
  {
    id: 'menusqr-classic-green',
    name: 'Classic Green Premium',
    primaryBg: '#f5f0e6',
    secondaryBg: '#0a2e1f',
    accentColor: '#d4af37',
    textLight: '#ffffff',
    textDark: '#333333',
    titleFont: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    headerFont: "'Montserrat', sans-serif",
    hasCurvedHeader: true,
    hasCurvedFooter: true,
    hasGoldenBursts: true,
    hasCornerLeaves: true,
    hasWoodFrame: false,
    textureUrl: "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E"
  },
  {
    id: 'menusqr-minimal-white',
    name: 'Minimal White',
    primaryBg: '#ffffff',
    secondaryBg: '#f8f9fa',
    accentColor: '#e8783c',
    textLight: '#111827',
    textDark: '#111827',
    titleFont: 'ui-sans-serif, system-ui, sans-serif',
    headerFont: 'inherit',
    hasCurvedHeader: false,
    hasCurvedFooter: false,
    hasGoldenBursts: false,
    hasCornerLeaves: false,
    hasWoodFrame: false,
  }
];
