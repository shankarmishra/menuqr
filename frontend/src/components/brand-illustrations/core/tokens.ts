/**
 * MENUQR Brand Vector System — Design Tokens
 * 100% Brand-Specific Vector Standard
 */

export const MENUQR_BRAND = {
  colors: {
    obsidian: '#070D0A',
    obsidianSurface: '#0E1713',
    obsidianBorder: '#1E3327',
    emeraldDeep: '#13281E',
    forestFabric: '#182E23',
    mintSignal: '#10B981',
    mintGlow: 'rgba(16, 185, 129, 0.25)',
    terracottaEmber: '#E8783C',
    saffronAccent: '#FFA64D',
    brushedBrass: '#D4AF37',
    brassDeep: '#997A24',
    parchmentBg: '#FFFDF8',
    parchmentPaper: '#F5EFE6',
    parchmentBorder: '#E6DCC8',
    inkDark: '#121C16',
    inkMuted: '#6B7F74',
  },
  strokes: {
    contour: 2.5,
    structure: 1.8,
    accent: 1.2,
    hairline: 0.8,
  },
  sizes: {
    sm: { width: 240, height: 180 },
    md: { width: 360, height: 260 },
    lg: { width: 480, height: 340 },
    responsive: { width: '100%', height: 'auto' },
  },
} as const;

export type BrandTheme = 'obsidian' | 'parchment';
