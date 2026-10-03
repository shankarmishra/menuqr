export interface StickerTemplate {
  id: string;
  name: string;
  // Colors
  primaryBg: string; // The outer cream/white section
  secondaryBg: string; // The dark green top/bottom sections
  accentColor: string; // The gold color
  textLight: string;
  textDark: string;
  // Typography
  titleFont: string; // e.g. serif
  cursiveFont: string; // e.g. Great Vibes
  // Layout Options
  hasCurvedHeader: boolean;
  hasCurvedFooter: boolean;
  hasGoldenBursts: boolean;
  hasCornerLeaves: boolean;
  // Assets
  textureUrl?: string; // Optional noise/texture overlay
}

export const STICKER_TEMPLATES: StickerTemplate[] = [
  {
    id: 'menuqr-classic-green',
    name: 'Classic Green Premium',
    primaryBg: '#f5f0e6',
    secondaryBg: '#0a2e1f',
    accentColor: '#d4af37',
    textLight: '#ffffff',
    textDark: '#333333',
    titleFont: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    cursiveFont: "'Great Vibes', cursive",
    hasCurvedHeader: true,
    hasCurvedFooter: true,
    hasGoldenBursts: true,
    hasCornerLeaves: true,
    textureUrl: "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E"
  },
  {
    id: 'menuqr-minimal-white',
    name: 'Minimal White',
    primaryBg: '#ffffff',
    secondaryBg: '#f8f9fa',
    accentColor: '#e8783c',
    textLight: '#111827',
    textDark: '#111827',
    titleFont: 'ui-sans-serif, system-ui, sans-serif',
    cursiveFont: 'inherit',
    hasCurvedHeader: false,
    hasCurvedFooter: false,
    hasGoldenBursts: false,
    hasCornerLeaves: false,
  }
];
