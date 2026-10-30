import React from 'react';
import { Camera, QrCode, BookOpen } from 'lucide-react';
import { MenusQRMark } from '../brand/MenusQRMark';
import { type StickerThemeId } from './StickerTemplates';

export type { StickerThemeId };

export interface ThemeConfig {
  id: StickerThemeId;
  name: string;
  frameBg: string;
  frameBorder: string;
  frameShadow: string;
  badgeGrad: string;
  badgeText: string;
  badgeBorder: string;
  badgeShadow: string;
  artboardBg: string;
  artboardBorder: string;
  accentGold: string;
  accentGoldLight: string;
  accentGoldDark: string;
  guillocheColor: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  qrBezelBg: string;
  qrBezelBorder: string;
  qrBorder: string;
  rivetBase: string;
  rivetHighlight: string;
  isDarkArtboard?: boolean;
}

// --------------------------------------------------------------------------
// FLAGSHIP LUXURY LIGHT THEME: IMPERIAL ROYAL IVORY & 24K CALACATTA GOLD
// Crafted for high-end restaurants, luxury dining tables, and 300+ DPI print.
// --------------------------------------------------------------------------
export const STICKER_THEMES: Record<StickerThemeId, ThemeConfig> = {
  'menusqr-marble-gold': {
    id: 'menusqr-marble-gold',
    name: 'Imperial Royal Ivory & Gold',
    // Physical Plaque Frame: Italian Calacatta Alabaster Stone with warm honey-amber undertones
    frameBg: 'linear-gradient(150deg, #FFFFFF 0%, #FAF7F0 25%, #F4ECE0 55%, #EBE0CD 85%, #E0D1B6 100%)',
    frameBorder: 'rgba(212, 168, 72, 0.9)',
    frameShadow: '0 32px 75px -12px rgba(60, 42, 16, 0.28), 0 12px 28px rgba(0,0,0,0.1), inset 0 0 35px rgba(255,255,255,0.95), inset 0 1px 3px #FFFFFF',
    // 3D Minted Metallic Cartouche Ribbon
    badgeGrad: 'linear-gradient(135deg, #FFFDF0 0%, #F5DE98 25%, #D4AF37 55%, #946F15 85%, #E5BE58 100%)',
    badgeText: '#261604',
    badgeBorder: '#FFFBE8',
    badgeShadow: '0 8px 22px rgba(90,60,20,0.35), inset 0 1px 2px rgba(255,255,255,0.98), inset 0 -1px 2px rgba(0,0,0,0.3)',
    // Inner Artboard: Heavyweight 350gsm Archival Vellum & Fine Ivory Porcelain
    artboardBg: 'linear-gradient(175deg, #FFFFFF 0%, #FCF9F3 40%, #F8F1E4 85%, #F0E5D2 100%)',
    artboardBorder: 'rgba(200, 155, 60, 0.85)',
    accentGold: '#BF8E2C',
    accentGoldLight: '#FFFDEB',
    accentGoldDark: '#785208',
    guillocheColor: 'rgba(184, 138, 48, 0.42)',
    textPrimary: '#140D05', // High-contrast deep ebony-bronze
    textSecondary: '#855716', // Rich warm polished brass
    textMuted: '#6B543D',
    qrBezelBg: '#FFFFFF',
    qrBezelBorder: 'linear-gradient(135deg, #FFFDEB, #DFB15B, #785208)',
    qrBorder: 'rgba(200, 155, 60, 0.9)',
    rivetBase: '#4E3208',
    rivetHighlight: '#FFFDEB',
    isDarkArtboard: false,
  },
  // Aliases fall back to the flagship Light Masterpiece
  'menusqr-obsidian-gold': {
    id: 'menusqr-obsidian-gold',
    name: 'Imperial Royal Ivory & Gold',
    frameBg: 'linear-gradient(150deg, #FFFFFF 0%, #FAF7F0 25%, #F4ECE0 55%, #EBE0CD 85%, #E0D1B6 100%)',
    frameBorder: 'rgba(212, 168, 72, 0.9)',
    frameShadow: '0 32px 75px -12px rgba(60, 42, 16, 0.28), 0 12px 28px rgba(0,0,0,0.1), inset 0 0 35px rgba(255,255,255,0.95), inset 0 1px 3px #FFFFFF',
    badgeGrad: 'linear-gradient(135deg, #FFFDF0 0%, #F5DE98 25%, #D4AF37 55%, #946F15 85%, #E5BE58 100%)',
    badgeText: '#261604',
    badgeBorder: '#FFFBE8',
    badgeShadow: '0 8px 22px rgba(90,60,20,0.35), inset 0 1px 2px rgba(255,255,255,0.98), inset 0 -1px 2px rgba(0,0,0,0.3)',
    artboardBg: 'linear-gradient(175deg, #FFFFFF 0%, #FCF9F3 40%, #F8F1E4 85%, #F0E5D2 100%)',
    artboardBorder: 'rgba(200, 155, 60, 0.85)',
    accentGold: '#BF8E2C',
    accentGoldLight: '#FFFDEB',
    accentGoldDark: '#785208',
    guillocheColor: 'rgba(184, 138, 48, 0.42)',
    textPrimary: '#140D05',
    textSecondary: '#855716',
    textMuted: '#6B543D',
    qrBezelBg: '#FFFFFF',
    qrBezelBorder: 'linear-gradient(135deg, #FFFDEB, #DFB15B, #785208)',
    qrBorder: 'rgba(200, 155, 60, 0.9)',
    rivetBase: '#4E3208',
    rivetHighlight: '#FFFDEB',
    isDarkArtboard: false,
  },
  'menusqr-walnut-gold': {
    id: 'menusqr-walnut-gold',
    name: 'Imperial Royal Ivory & Gold',
    frameBg: 'linear-gradient(150deg, #FFFFFF 0%, #FAF7F0 25%, #F4ECE0 55%, #EBE0CD 85%, #E0D1B6 100%)',
    frameBorder: 'rgba(212, 168, 72, 0.9)',
    frameShadow: '0 32px 75px -12px rgba(60, 42, 16, 0.28), 0 12px 28px rgba(0,0,0,0.1), inset 0 0 35px rgba(255,255,255,0.95), inset 0 1px 3px #FFFFFF',
    badgeGrad: 'linear-gradient(135deg, #FFFDF0 0%, #F5DE98 25%, #D4AF37 55%, #946F15 85%, #E5BE58 100%)',
    badgeText: '#261604',
    badgeBorder: '#FFFBE8',
    badgeShadow: '0 8px 22px rgba(90,60,20,0.35), inset 0 1px 2px rgba(255,255,255,0.98), inset 0 -1px 2px rgba(0,0,0,0.3)',
    artboardBg: 'linear-gradient(175deg, #FFFFFF 0%, #FCF9F3 40%, #F8F1E4 85%, #F0E5D2 100%)',
    artboardBorder: 'rgba(200, 155, 60, 0.85)',
    accentGold: '#BF8E2C',
    accentGoldLight: '#FFFDEB',
    accentGoldDark: '#785208',
    guillocheColor: 'rgba(184, 138, 48, 0.42)',
    textPrimary: '#140D05',
    textSecondary: '#855716',
    textMuted: '#6B543D',
    qrBezelBg: '#FFFFFF',
    qrBezelBorder: 'linear-gradient(135deg, #FFFDEB, #DFB15B, #785208)',
    qrBorder: 'rgba(200, 155, 60, 0.9)',
    rivetBase: '#4E3208',
    rivetHighlight: '#FFFDEB',
    isDarkArtboard: false,
  },
  'menusqr-emerald-gold': {
    id: 'menusqr-emerald-gold',
    name: 'Imperial Royal Ivory & Gold',
    frameBg: 'linear-gradient(150deg, #FFFFFF 0%, #FAF7F0 25%, #F4ECE0 55%, #EBE0CD 85%, #E0D1B6 100%)',
    frameBorder: 'rgba(212, 168, 72, 0.9)',
    frameShadow: '0 32px 75px -12px rgba(60, 42, 16, 0.28), 0 12px 28px rgba(0,0,0,0.1), inset 0 0 35px rgba(255,255,255,0.95), inset 0 1px 3px #FFFFFF',
    badgeGrad: 'linear-gradient(135deg, #FFFDF0 0%, #F5DE98 25%, #D4AF37 55%, #946F15 85%, #E5BE58 100%)',
    badgeText: '#261604',
    badgeBorder: '#FFFBE8',
    badgeShadow: '0 8px 22px rgba(90,60,20,0.35), inset 0 1px 2px rgba(255,255,255,0.98), inset 0 -1px 2px rgba(0,0,0,0.3)',
    artboardBg: 'linear-gradient(175deg, #FFFFFF 0%, #FCF9F3 40%, #F8F1E4 85%, #F0E5D2 100%)',
    artboardBorder: 'rgba(200, 155, 60, 0.85)',
    accentGold: '#BF8E2C',
    accentGoldLight: '#FFFDEB',
    accentGoldDark: '#785208',
    guillocheColor: 'rgba(184, 138, 48, 0.42)',
    textPrimary: '#140D05',
    textSecondary: '#855716',
    textMuted: '#6B543D',
    qrBezelBg: '#FFFFFF',
    qrBezelBorder: 'linear-gradient(135deg, #FFFDEB, #DFB15B, #785208)',
    qrBorder: 'rgba(200, 155, 60, 0.9)',
    rivetBase: '#4E3208',
    rivetHighlight: '#FFFDEB',
    isDarkArtboard: false,
  },
  'menusqr-ruby-gold': {
    id: 'menusqr-ruby-gold',
    name: 'Imperial Royal Ivory & Gold',
    frameBg: 'linear-gradient(150deg, #FFFFFF 0%, #FAF7F0 25%, #F4ECE0 55%, #EBE0CD 85%, #E0D1B6 100%)',
    frameBorder: 'rgba(212, 168, 72, 0.9)',
    frameShadow: '0 32px 75px -12px rgba(60, 42, 16, 0.28), 0 12px 28px rgba(0,0,0,0.1), inset 0 0 35px rgba(255,255,255,0.95), inset 0 1px 3px #FFFFFF',
    badgeGrad: 'linear-gradient(135deg, #FFFDF0 0%, #F5DE98 25%, #D4AF37 55%, #946F15 85%, #E5BE58 100%)',
    badgeText: '#261604',
    badgeBorder: '#FFFBE8',
    badgeShadow: '0 8px 22px rgba(90,60,20,0.35), inset 0 1px 2px rgba(255,255,255,0.98), inset 0 -1px 2px rgba(0,0,0,0.3)',
    artboardBg: 'linear-gradient(175deg, #FFFFFF 0%, #FCF9F3 40%, #F8F1E4 85%, #F0E5D2 100%)',
    artboardBorder: 'rgba(200, 155, 60, 0.85)',
    accentGold: '#BF8E2C',
    accentGoldLight: '#FFFDEB',
    accentGoldDark: '#785208',
    guillocheColor: 'rgba(184, 138, 48, 0.42)',
    textPrimary: '#140D05',
    textSecondary: '#855716',
    textMuted: '#6B543D',
    qrBezelBg: '#FFFFFF',
    qrBezelBorder: 'linear-gradient(135deg, #FFFDEB, #DFB15B, #785208)',
    qrBorder: 'rgba(200, 155, 60, 0.9)',
    rivetBase: '#4E3208',
    rivetHighlight: '#FFFDEB',
    isDarkArtboard: false,
  },
  'menusqr-tandoor-fire': {
    id: 'menusqr-tandoor-fire',
    name: 'Imperial Royal Ivory & Gold',
    frameBg: 'linear-gradient(150deg, #FFFFFF 0%, #FAF7F0 25%, #F4ECE0 55%, #EBE0CD 85%, #E0D1B6 100%)',
    frameBorder: 'rgba(212, 168, 72, 0.9)',
    frameShadow: '0 32px 75px -12px rgba(60, 42, 16, 0.28), 0 12px 28px rgba(0,0,0,0.1), inset 0 0 35px rgba(255,255,255,0.95), inset 0 1px 3px #FFFFFF',
    badgeGrad: 'linear-gradient(135deg, #FFFDF0 0%, #F5DE98 25%, #D4AF37 55%, #946F15 85%, #E5BE58 100%)',
    badgeText: '#261604',
    badgeBorder: '#FFFBE8',
    badgeShadow: '0 8px 22px rgba(90,60,20,0.35), inset 0 1px 2px rgba(255,255,255,0.98), inset 0 -1px 2px rgba(0,0,0,0.3)',
    artboardBg: 'linear-gradient(175deg, #FFFFFF 0%, #FCF9F3 40%, #F8F1E4 85%, #F0E5D2 100%)',
    artboardBorder: 'rgba(200, 155, 60, 0.85)',
    accentGold: '#BF8E2C',
    accentGoldLight: '#FFFDEB',
    accentGoldDark: '#785208',
    guillocheColor: 'rgba(184, 138, 48, 0.42)',
    textPrimary: '#140D05',
    textSecondary: '#855716',
    textMuted: '#6B543D',
    qrBezelBg: '#FFFFFF',
    qrBezelBorder: 'linear-gradient(135deg, #FFFDEB, #DFB15B, #785208)',
    qrBorder: 'rgba(200, 155, 60, 0.9)',
    rivetBase: '#4E3208',
    rivetHighlight: '#FFFDEB',
    isDarkArtboard: false,
  },
  'menusqr-flagship-standee': {
    id: 'menusqr-flagship-standee',
    name: 'Imperial Royal Ivory & Gold',
    frameBg: 'linear-gradient(150deg, #FFFFFF 0%, #FAF7F0 25%, #F4ECE0 55%, #EBE0CD 85%, #E0D1B6 100%)',
    frameBorder: 'rgba(212, 168, 72, 0.9)',
    frameShadow: '0 32px 75px -12px rgba(60, 42, 16, 0.28), 0 12px 28px rgba(0,0,0,0.1), inset 0 0 35px rgba(255,255,255,0.95), inset 0 1px 3px #FFFFFF',
    badgeGrad: 'linear-gradient(135deg, #FFFDF0 0%, #F5DE98 25%, #D4AF37 55%, #946F15 85%, #E5BE58 100%)',
    badgeText: '#261604',
    badgeBorder: '#FFFBE8',
    badgeShadow: '0 8px 22px rgba(90,60,20,0.35), inset 0 1px 2px rgba(255,255,255,0.98), inset 0 -1px 2px rgba(0,0,0,0.3)',
    artboardBg: 'linear-gradient(175deg, #FFFFFF 0%, #FCF9F3 40%, #F8F1E4 85%, #F0E5D2 100%)',
    artboardBorder: 'rgba(200, 155, 60, 0.85)',
    accentGold: '#BF8E2C',
    accentGoldLight: '#FFFDEB',
    accentGoldDark: '#785208',
    guillocheColor: 'rgba(184, 138, 48, 0.42)',
    textPrimary: '#140D05',
    textSecondary: '#855716',
    textMuted: '#6B543D',
    qrBezelBg: '#FFFFFF',
    qrBezelBorder: 'linear-gradient(135deg, #FFFDEB, #DFB15B, #785208)',
    qrBorder: 'rgba(200, 155, 60, 0.9)',
    rivetBase: '#4E3208',
    rivetHighlight: '#FFFDEB',
    isDarkArtboard: false,
  },
  'menusqr-herb-garden': {
    id: 'menusqr-herb-garden',
    name: 'Imperial Royal Ivory & Gold',
    frameBg: 'linear-gradient(150deg, #FFFFFF 0%, #FAF7F0 25%, #F4ECE0 55%, #EBE0CD 85%, #E0D1B6 100%)',
    frameBorder: 'rgba(212, 168, 72, 0.9)',
    frameShadow: '0 32px 75px -12px rgba(60, 42, 16, 0.28), 0 12px 28px rgba(0,0,0,0.1), inset 0 0 35px rgba(255,255,255,0.95), inset 0 1px 3px #FFFFFF',
    badgeGrad: 'linear-gradient(135deg, #FFFDF0 0%, #F5DE98 25%, #D4AF37 55%, #946F15 85%, #E5BE58 100%)',
    badgeText: '#261604',
    badgeBorder: '#FFFBE8',
    badgeShadow: '0 8px 22px rgba(90,60,20,0.35), inset 0 1px 2px rgba(255,255,255,0.98), inset 0 -1px 2px rgba(0,0,0,0.3)',
    artboardBg: 'linear-gradient(175deg, #FFFFFF 0%, #FCF9F3 40%, #F8F1E4 85%, #F0E5D2 100%)',
    artboardBorder: 'rgba(200, 155, 60, 0.85)',
    accentGold: '#BF8E2C',
    accentGoldLight: '#FFFDEB',
    accentGoldDark: '#785208',
    guillocheColor: 'rgba(184, 138, 48, 0.42)',
    textPrimary: '#140D05',
    textSecondary: '#855716',
    textMuted: '#6B543D',
    qrBezelBg: '#FFFFFF',
    qrBezelBorder: 'linear-gradient(135deg, #FFFDEB, #DFB15B, #785208)',
    qrBorder: 'rgba(200, 155, 60, 0.9)',
    rivetBase: '#4E3208',
    rivetHighlight: '#FFFDEB',
    isDarkArtboard: false,
  },
  'menusqr-neon-bites': {
    id: 'menusqr-neon-bites',
    name: 'Imperial Royal Ivory & Gold',
    frameBg: 'linear-gradient(150deg, #FFFFFF 0%, #FAF7F0 25%, #F4ECE0 55%, #EBE0CD 85%, #E0D1B6 100%)',
    frameBorder: 'rgba(212, 168, 72, 0.9)',
    frameShadow: '0 32px 75px -12px rgba(60, 42, 16, 0.28), 0 12px 28px rgba(0,0,0,0.1), inset 0 0 35px rgba(255,255,255,0.95), inset 0 1px 3px #FFFFFF',
    badgeGrad: 'linear-gradient(135deg, #FFFDF0 0%, #F5DE98 25%, #D4AF37 55%, #946F15 85%, #E5BE58 100%)',
    badgeText: '#261604',
    badgeBorder: '#FFFBE8',
    badgeShadow: '0 8px 22px rgba(90,60,20,0.35), inset 0 1px 2px rgba(255,255,255,0.98), inset 0 -1px 2px rgba(0,0,0,0.3)',
    artboardBg: 'linear-gradient(175deg, #FFFFFF 0%, #FCF9F3 40%, #F8F1E4 85%, #F0E5D2 100%)',
    artboardBorder: 'rgba(200, 155, 60, 0.85)',
    accentGold: '#BF8E2C',
    accentGoldLight: '#FFFDEB',
    accentGoldDark: '#785208',
    guillocheColor: 'rgba(184, 138, 48, 0.42)',
    textPrimary: '#140D05',
    textSecondary: '#855716',
    textMuted: '#6B543D',
    qrBezelBg: '#FFFFFF',
    qrBezelBorder: 'linear-gradient(135deg, #FFFDEB, #DFB15B, #785208)',
    qrBorder: 'rgba(200, 155, 60, 0.9)',
    rivetBase: '#4E3208',
    rivetHighlight: '#FFFDEB',
    isDarkArtboard: false,
  },
};

export interface RoyalWalnutStickerCardProps {
  restaurantName: string;
  /**
   * The owner's brand mark, shown as a gold-framed medallion above the name. Optional on purpose:
   * without it the plaque keeps its purely typographic lock, which is how it has always looked.
   */
  logoUrl?: string;
  category?: string;
  tagline?: string;
  menuUrl: string;
  qrImage: string;
  phone?: string;
  address?: string;
  headerText?: string;
  footerText?: string;
  isModal?: boolean;
  themeId?: StickerThemeId;
  stickerRef?: React.RefObject<HTMLDivElement | null>;
  showStatusBadge?: boolean;
  showDownloadButtons?: boolean;
  onDownloadPNG?: () => void;
  tableNumber?: string;
}

// -------------------------------------------------------------
// 1. HYPER-DETAILED SLOTTED BRASS SCREW RIVET
// -------------------------------------------------------------
function MetallicScrewRivet({
  cx,
  cy,
  radius = 4.5,
  rivetBase,
  rivetHighlight,
  prefix = 'rivet',
  angle = 35,
}: {
  cx: number;
  cy: number;
  radius?: number;
  rivetBase: string;
  rivetHighlight: string;
  prefix?: string;
  angle?: number;
}) {
  const gradId = `${prefix}_grad_${cx}_${cy}`;
  return (
    <g transform={`rotate(${angle} ${cx} ${cy})`}>
      <defs>
        <radialGradient id={gradId} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor={rivetHighlight} />
          <stop offset="38%" stopColor={rivetBase} />
          <stop offset="85%" stopColor="#241603" />
          <stop offset="100%" stopColor="#0B0601" />
        </radialGradient>
      </defs>
      {/* Countersunk Drop Shadow Hole */}
      <circle cx={cx} cy={cy + 0.8} r={radius + 0.9} fill="#000000" opacity="0.35" />
      {/* Outer Chamfer Rim Ring */}
      <circle cx={cx} cy={cy} r={radius + 0.5} fill="none" stroke={rivetHighlight} strokeWidth="0.5" opacity="0.85" />
      {/* Main Beveled Screw Head */}
      <circle cx={cx} cy={cy} r={radius} fill={`url(#${gradId})`} stroke={rivetHighlight} strokeWidth="0.8" />
      {/* Slotted Drive Groove with Realistic Depth */}
      <line
        x1={cx - radius * 0.72}
        y1={cy}
        x2={cx + radius * 0.72}
        y2={cy}
        stroke="#0D0701"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Specular Highlight Catching on Groove Lower Lip */}
      <line
        x1={cx - radius * 0.65}
        y1={cy + 0.6}
        x2={cx + radius * 0.65}
        y2={cy + 0.6}
        stroke={rivetHighlight}
        strokeWidth="0.55"
        opacity="0.95"
      />
    </g>
  );
}

// -------------------------------------------------------------
// 2. GRAND BANKNOTE GUILLOCHÉ ROSETTE (Sacred Geometry Watermark)
// -------------------------------------------------------------
function BanknoteGuillocheRosette({ color }: { color: string }) {
  // 16 Petals interlocking spirograph
  const angles = [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5];
  return (
    <svg
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] pointer-events-none opacity-30 overflow-visible"
      viewBox="0 0 300 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="150" cy="150" r="140" stroke={color} strokeWidth="0.9" strokeDasharray="3 3" />
      <circle cx="150" cy="150" r="125" stroke={color} strokeWidth="1.1" />
      <circle cx="150" cy="150" r="110" stroke={color} strokeWidth="0.7" strokeDasharray="4 2" />
      <circle cx="150" cy="150" r="85" stroke={color} strokeWidth="0.9" />
      <circle cx="150" cy="150" r="50" stroke={color} strokeWidth="0.7" />
      {angles.map((ang) => (
        <g key={ang} transform={`rotate(${ang} 150 150)`}>
          <ellipse cx="150" cy="150" rx="135" ry="45" stroke={color} strokeWidth="0.85" />
          <ellipse cx="150" cy="150" rx="110" ry="25" stroke={color} strokeWidth="0.75" opacity="0.8" />
        </g>
      ))}
    </svg>
  );
}

// -------------------------------------------------------------
// 3. BANKNOTE GUILLOCHÉ SECURITY WAVE LACE (Continuous Perimeter)
// -------------------------------------------------------------
function BanknoteGuillocheBorder({ color }: { color: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-hidden" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="guilloche-lace-h" width="32" height="12" patternUnits="userSpaceOnUse">
          <path
            d="M 0 6 Q 8 -3 16 6 T 32 6 M 0 6 Q 8 15 16 6 T 32 6 M 0 2 Q 8 10 16 2 T 32 2 M 0 10 Q 8 2 16 10 T 32 10"
            fill="none"
            stroke={color}
            strokeWidth="0.8"
          />
          <circle cx="16" cy="6" r="1.4" fill={color} opacity="0.95" />
          <circle cx="32" cy="6" r="1" fill={color} opacity="0.7" />
        </pattern>
        <pattern id="guilloche-lace-v" width="12" height="32" patternUnits="userSpaceOnUse">
          <path
            d="M 6 0 Q -3 8 6 16 T 6 32 M 6 0 Q 15 8 6 16 T 6 32 M 2 0 Q 10 8 2 16 T 2 32 M 10 0 Q 2 8 10 16 T 10 32"
            fill="none"
            stroke={color}
            strokeWidth="0.8"
          />
          <circle cx="6" cy="16" r="1.4" fill={color} opacity="0.95" />
          <circle cx="6" cy="32" r="1" fill={color} opacity="0.7" />
        </pattern>
      </defs>

      {/* Top Guilloché Border Strip */}
      <rect x="34" y="10" width="calc(100% - 68px)" height="12" fill="url(#guilloche-lace-h)" />
      {/* Bottom Guilloché Border Strip */}
      <rect x="34" y="calc(100% - 22px)" width="calc(100% - 68px)" height="12" fill="url(#guilloche-lace-h)" />
      {/* Left Guilloché Border Strip */}
      <rect x="10" y="34" width="12" height="calc(100% - 68px)" fill="url(#guilloche-lace-v)" />
      {/* Right Guilloché Border Strip */}
      <rect x="calc(100% - 22px)" y="34" width="12" height="calc(100% - 68px)" fill="url(#guilloche-lace-v)" />
    </svg>
  );
}

// -------------------------------------------------------------
// 4. BAROQUE ACANTHUS CORNER SPANDREL (Deeply Sculpted Filigree)
// -------------------------------------------------------------
function BaroqueAcanthusCorner({
  theme,
  position,
}: {
  theme: ThemeConfig;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}) {
  const transform =
    position === 'top-right'
      ? 'scale(-1, 1)'
      : position === 'bottom-left'
      ? 'scale(1, -1)'
      : position === 'bottom-right'
      ? 'scale(-1, -1)'
      : undefined;

  const stylePos =
    position === 'top-left'
      ? 'top-0 left-0'
      : position === 'top-right'
      ? 'top-0 right-0'
      : position === 'bottom-left'
      ? 'bottom-0 left-0'
      : 'bottom-0 right-0';

  const prefix = `acanthus_${position}_${theme.id}`;

  return (
    <svg
      className={`absolute ${stylePos} w-24 h-24 pointer-events-none z-20 overflow-visible`}
      viewBox="0 0 100 100"
      fill="none"
      style={{ transform }}
    >
      <defs>
        <linearGradient id={`${prefix}_foil`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFDEB" />
          <stop offset="28%" stopColor="#E2BA55" />
          <stop offset="65%" stopColor="#BF8E2C" />
          <stop offset="90%" stopColor="#5E3E06" />
          <stop offset="100%" stopColor="#241703" />
        </linearGradient>
        <filter id={`${prefix}_shadow`} x="-20%" y="-20%" width="160%" height="160%">
          <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="#402808" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Main Sculpted Bracket Silhouette */}
      <path
        d="M 0 0 L 88 0 C 74 0 54 8 42 22 C 32 34 28 50 26 66 C 18 74 8 84 0 94 Z"
        fill={`url(#${prefix}_foil)`}
        filter={`url(#${prefix}_shadow)`}
      />

      {/* Chiseled Dual Bevel Hairline */}
      <path
        d="M 4 4 L 80 4 C 68 4 49 11 38 24 C 28 36 24 51 22 65 C 15 72 6 81 4 88 Z"
        fill="none"
        stroke="#FFFDEB"
        strokeWidth="1.2"
        strokeOpacity="0.9"
      />

      {/* Detailed Baroque Acanthus Volutes & Intaglio Hatching Lines */}
      <path
        d="M 12 12 C 26 14 36 22 42 34 C 36 38 28 34 22 26 C 18 20 14 16 12 12 Z"
        fill="none"
        stroke="#FFFDEB"
        strokeWidth="1.2"
      />
      {/* Intaglio Shading Hatch Lines */}
      <path d="M 18 16 L 24 20 M 22 18 L 28 23 M 26 21 L 32 26 M 30 25 L 36 30" stroke="#3A2504" strokeWidth="0.8" opacity="0.65" />
      <path d="M 19 15 L 25 19 M 23 17 L 29 22 M 27 20 L 33 25" stroke="#FFFDEB" strokeWidth="0.6" opacity="0.85" />

      {/* Secondary Counter-Curving Acanthus Tendril */}
      <path
        d="M 12 12 C 14 26 22 36 34 42 C 38 36 34 28 26 22 C 20 18 16 14 12 12 Z"
        fill="none"
        stroke="#FFFDEB"
        strokeWidth="1.2"
      />
      <path d="M 16 18 L 20 24 M 18 22 L 23 28 M 21 26 L 26 32 M 25 30 L 30 36" stroke="#3A2504" strokeWidth="0.8" opacity="0.65" />

      {/* Ornate Fleur Terminal Spirals */}
      <circle cx="44" cy="36" r="2.2" fill="#FFFDEB" stroke="#3A2504" strokeWidth="0.6" />
      <circle cx="36" cy="44" r="2.2" fill="#FFFDEB" stroke="#3A2504" strokeWidth="0.6" />
      <circle cx="28" cy="28" r="1.6" fill="#FFFFFF" opacity="0.9" />

      {/* 3x Heavy Machined Slotted Brass Bolts */}
      <MetallicScrewRivet cx={14} cy={14} radius={4.5} rivetBase={theme.rivetBase} rivetHighlight={theme.rivetHighlight} prefix={prefix} angle={40} />
      <MetallicScrewRivet cx={66} cy={10} radius={3.4} rivetBase={theme.rivetBase} rivetHighlight={theme.rivetHighlight} prefix={prefix} angle={15} />
      <MetallicScrewRivet cx={10} cy={66} radius={3.4} rivetBase={theme.rivetBase} rivetHighlight={theme.rivetHighlight} prefix={prefix} angle={75} />
    </svg>
  );
}

// -------------------------------------------------------------
// 5. RICH TACTILE PROCEDURAL TEXTURES (Calacatta Gold + Linen Parchment)
// -------------------------------------------------------------
function LightLuxuryTextureOverlay() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Archival Linen / Hand-pressed Vellum Paper Fiber Texture */}
        <pattern id="archival-vellum-texture" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 0 10 L 40 10 M 0 20 L 40 20 M 0 30 L 40 30" stroke="#8C7355" strokeWidth="0.4" opacity="0.12" />
          <path d="M 10 0 L 10 40 M 20 0 L 20 40 M 30 0 L 30 40" stroke="#8C7355" strokeWidth="0.4" opacity="0.12" />
          <circle cx="12" cy="18" r="0.75" fill="#8C7355" opacity="0.15" />
          <circle cx="28" cy="32" r="0.75" fill="#C59B3F" opacity="0.22" />
          <circle cx="34" cy="8" r="0.6" fill="#8C7355" opacity="0.12" />
        </pattern>
        {/* Liquid 24K Gold Foil Vein Gradient */}
        <linearGradient id="calacatta-gold-vein" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DFB15B" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#F5DE98" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#BF8E2C" stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* Linen Parchment Fiber Grid */}
      <rect width="100%" height="100%" fill="url(#archival-vellum-texture)" />

      {/* Prominent Translucent Smoky Italian Marble Veins */}
      <g opacity="0.55">
        {/* Main Calacatta Vein Branching from Top Right to Center Left */}
        <path
          d="M 440 40 C 350 70, 290 140, 220 180 S 120 220, -20 280"
          stroke="#7A6552"
          strokeWidth="3.2"
          fill="none"
          opacity="0.3"
        />
        <path
          d="M 220 180 C 180 230, 160 310, 90 380 S 20 450, -20 500"
          stroke="#7A6552"
          strokeWidth="2.4"
          fill="none"
          opacity="0.25"
        />
        {/* Gold Leaf Vein Running Parallel with Luminous Sparkle */}
        <path
          d="M 430 48 C 345 78, 285 145, 218 184 S 118 224, -18 284"
          stroke="url(#calacatta-gold-vein)"
          strokeWidth="1.8"
          fill="none"
        />
        <path
          d="M 218 184 C 178 234, 158 314, 88 384"
          stroke="url(#calacatta-gold-vein)"
          strokeWidth="1.4"
          fill="none"
        />
        {/* Lower Right Secondary Marble Fracture */}
        <path
          d="M 180 660 C 240 600, 310 570, 370 510 S 420 420, 440 370"
          stroke="#7A6552"
          strokeWidth="2.6"
          fill="none"
          opacity="0.28"
        />
        <path
          d="M 185 655 C 245 595, 315 565, 375 505"
          stroke="url(#calacatta-gold-vein)"
          strokeWidth="1.6"
          fill="none"
        />
        {/* Gold Leaf Flake Micro-Particles */}
        <circle cx="80" cy="140" r="1.8" fill="#DFB15B" opacity="0.6" />
        <circle cx="340" cy="220" r="2.2" fill="#F5DE98" opacity="0.75" />
        <circle cx="160" cy="460" r="1.6" fill="#DFB15B" opacity="0.65" />
        <circle cx="310" cy="540" r="2" fill="#F5DE98" opacity="0.7" />
      </g>
    </svg>
  );
}

// -------------------------------------------------------------
// 6. GRAND IMPERIAL MEDALLION & CROSSED LAUREL HEADER
// -------------------------------------------------------------
function ImperialMedallionHeader({
  theme,
  headerText,
}: {
  theme: ThemeConfig;
  headerText: string;
}) {
  return (
    <div className="relative z-30 mx-auto mt-0.5 mb-2 flex flex-col items-center justify-center">
      {/* Symmetrical Crossed Laurel Wreath with Center 3D Minted Coin */}
      <div className="relative flex items-center justify-center">
        {/* Left Laurel Branch */}
        <svg className="w-16 h-8 -mr-2 overflow-visible" viewBox="0 0 64 32" fill="none">
          <path d="M 60 22 C 40 22, 20 18, 5 8" stroke={theme.accentGold} strokeWidth="1.4" strokeLinecap="round" />
          <ellipse cx="14" cy="9" rx="4" ry="2" transform="rotate(-35 14 9)" fill="#FFFDEB" stroke={theme.accentGoldDark} strokeWidth="0.6" />
          <ellipse cx="26" cy="13" rx="4.5" ry="2.2" transform="rotate(-25 26 13)" fill={theme.accentGold} stroke={theme.accentGoldDark} strokeWidth="0.6" />
          <ellipse cx="38" cy="17" rx="4.5" ry="2.2" transform="rotate(-15 38 17)" fill="#FFFDEB" stroke={theme.accentGoldDark} strokeWidth="0.6" />
          <ellipse cx="50" cy="20" rx="4.5" ry="2.2" transform="rotate(-5 50 20)" fill={theme.accentGold} stroke={theme.accentGoldDark} strokeWidth="0.6" />
          <circle cx="6" cy="7" r="1.6" fill="#FFFFFF" />
        </svg>

        {/* Center 3D Minted Gold Medallion */}
        <div
          className="relative z-10 w-9 h-9 rounded-full flex items-center justify-center p-0.5 border shadow-xl"
          style={{
            background: 'linear-gradient(135deg, #FFFDEB 0%, #E6C265 30%, #B8851B 65%, #6B4908 100%)',
            borderColor: theme.accentGoldLight,
            boxShadow: '0 6px 16px rgba(90,60,20,0.35), inset 0 1px 2px rgba(255,255,255,0.98), inset 0 -1px 2px rgba(0,0,0,0.3)',
          }}
        >
          {/* Inner Coin Bevel with Compass Sunburst */}
          <div
            className="w-full h-full rounded-full flex items-center justify-center border p-1"
            style={{
              background: 'radial-gradient(circle, #2A1D0D 0%, #120A02 100%)',
              borderColor: theme.accentGold,
            }}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <MenusQRMark color="#FFF3BD" orange="#EA580C" />
            </div>
          </div>
        </div>

        {/* Right Laurel Branch */}
        <svg className="w-16 h-8 -ml-2 overflow-visible" viewBox="0 0 64 32" fill="none" style={{ transform: 'scaleX(-1)' }}>
          <path d="M 60 22 C 40 22, 20 18, 5 8" stroke={theme.accentGold} strokeWidth="1.4" strokeLinecap="round" />
          <ellipse cx="14" cy="9" rx="4" ry="2" transform="rotate(-35 14 9)" fill="#FFFDEB" stroke={theme.accentGoldDark} strokeWidth="0.6" />
          <ellipse cx="26" cy="13" rx="4.5" ry="2.2" transform="rotate(-25 26 13)" fill={theme.accentGold} stroke={theme.accentGoldDark} strokeWidth="0.6" />
          <ellipse cx="38" cy="17" rx="4.5" ry="2.2" transform="rotate(-15 38 17)" fill="#FFFDEB" stroke={theme.accentGoldDark} strokeWidth="0.6" />
          <ellipse cx="50" cy="20" rx="4.5" ry="2.2" transform="rotate(-5 50 20)" fill={theme.accentGold} stroke={theme.accentGoldDark} strokeWidth="0.6" />
          <circle cx="6" cy="7" r="1.6" fill="#FFFFFF" />
        </svg>
      </div>

      {/* 3D Folded Gold Ribbon Banner */}
      <div
        className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full border shadow-2xl backdrop-blur-md whitespace-nowrap -mt-1.5"
        style={{
          background: theme.badgeGrad,
          borderColor: theme.badgeBorder,
          boxShadow: theme.badgeShadow,
        }}
      >
        <span
          className="font-black text-[9px] sm:text-[10px] tracking-[0.2em] uppercase"
          style={{
            fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
            color: theme.badgeText,
            textShadow: '0 1px 0 rgba(255,255,255,0.7), 0 -1px 0 rgba(0,0,0,0.35)',
          }}
        >
          MENUSQR
        </span>
        <span className="text-[7.5px] opacity-75" style={{ color: theme.badgeText }}>✦</span>
        <span
          className="font-extrabold text-[8.5px] sm:text-[9.5px] tracking-wider uppercase opacity-90"
          style={{
            fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
            color: theme.badgeText,
          }}
        >
          {headerText}
        </span>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 7. SCEPTRE & FLEUR-DE-LIS EMBLEM FLOURISH
// -------------------------------------------------------------
function RoyalSceptreFlourish({ color }: { color: string }) {
  return (
    <svg className="w-48 h-7 my-1 opacity-95 overflow-visible" viewBox="0 0 192 28" fill="none">
      <defs>
        <filter id="flourish-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#402808" floodOpacity="0.25" />
        </filter>
      </defs>
      {/* Symmetrical Curving Filigree Wings */}
      <path
        d="M 10 14 C 35 14, 55 4, 78 14 C 65 19, 48 19, 36 24 C 54 26, 72 20, 86 15 L 92 14"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
        filter="url(#flourish-glow)"
      />
      <path
        d="M 182 14 C 157 14, 137 4, 114 14 C 127 19, 144 19, 156 24 C 138 26, 120 20, 106 15 L 100 14"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
        filter="url(#flourish-glow)"
      />
      {/* Center 3D Royal Fleur-de-lis Lozenge */}
      <polygon points="96,5 103,14 96,23 89,14" fill={color} filter="url(#flourish-glow)" />
      <polygon points="96,8 100,14 96,20 92,14" fill="#FFFFFF" opacity="0.9" />
      <circle cx="96" cy="14" r="2.2" fill="#241603" />
      <circle cx="82" cy="14" r="1.8" fill={color} />
      <circle cx="110" cy="14" r="1.8" fill={color} />
      <circle cx="24" cy="14" r="1.5" fill={color} />
      <circle cx="168" cy="14" r="1.5" fill={color} />
    </svg>
  );
}

// -------------------------------------------------------------
// 8. GRAND HOROLOGY "VAULT BEZEL" QR CODE DOCK
// -------------------------------------------------------------
function VaultQrContainer({
  theme,
  qrImage,
  restaurantName,
}: {
  theme: ThemeConfig;
  qrImage: string;
  restaurantName: string;
}) {
  return (
    <div className="relative z-10 my-1.5 flex flex-col items-center">
      {/* Outer 48-Notch Coin-Edge Knurled Watch Bezel */}
      <div
        className="relative p-3 sm:p-3.5 rounded-[2.2rem] shadow-2xl border"
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF5EB 50%, #ECE1CF 100%)',
          borderColor: theme.accentGold,
          boxShadow: `0 14px 35px rgba(60,40,15,0.18), inset 0 1px 3px rgba(255,255,255,0.98), inset 0 0 0 1px ${theme.accentGoldDark}`,
        }}
      >
        {/* 48-Tooth Dentil Coin-Edge Border via SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none rounded-[2.2rem] overflow-hidden" xmlns="http://www.w3.org/2000/svg">
          <rect
            x="2"
            y="2"
            width="calc(100% - 4px)"
            height="calc(100% - 4px)"
            rx="32"
            fill="none"
            stroke={theme.accentGoldLight}
            strokeWidth="1.2"
            strokeDasharray="3 3"
            opacity="0.9"
          />
        </svg>

        {/* 4x Heavy Brass Corner Clamps / Jewel Prongs with Slotted Screws */}
        {/* Top-Left Prong */}
        <div className="absolute top-1.5 left-1.5 w-6 h-6 z-20 pointer-events-none">
          <svg viewBox="0 0 24 24" className="w-full h-full overflow-visible">
            <path d="M 0 0 L 18 0 C 12 0 8 4 6 10 C 4 14 0 18 0 24 Z" fill={theme.accentGold} stroke={theme.accentGoldLight} strokeWidth="0.8" />
            <MetallicScrewRivet cx={6} cy={6} radius={2.6} rivetBase={theme.rivetBase} rivetHighlight={theme.rivetHighlight} prefix="prong_tl" />
          </svg>
        </div>
        {/* Top-Right Prong */}
        <div className="absolute top-1.5 right-1.5 w-6 h-6 z-20 pointer-events-none">
          <svg viewBox="0 0 24 24" className="w-full h-full overflow-visible" style={{ transform: 'scaleX(-1)' }}>
            <path d="M 0 0 L 18 0 C 12 0 8 4 6 10 C 4 14 0 18 0 24 Z" fill={theme.accentGold} stroke={theme.accentGoldLight} strokeWidth="0.8" />
            <MetallicScrewRivet cx={6} cy={6} radius={2.6} rivetBase={theme.rivetBase} rivetHighlight={theme.rivetHighlight} prefix="prong_tr" />
          </svg>
        </div>
        {/* Bottom-Left Prong */}
        <div className="absolute bottom-1.5 left-1.5 w-6 h-6 z-20 pointer-events-none">
          <svg viewBox="0 0 24 24" className="w-full h-full overflow-visible" style={{ transform: 'scaleY(-1)' }}>
            <path d="M 0 0 L 18 0 C 12 0 8 4 6 10 C 4 14 0 18 0 24 Z" fill={theme.accentGold} stroke={theme.accentGoldLight} strokeWidth="0.8" />
            <MetallicScrewRivet cx={6} cy={6} radius={2.6} rivetBase={theme.rivetBase} rivetHighlight={theme.rivetHighlight} prefix="prong_bl" />
          </svg>
        </div>
        {/* Bottom-Right Prong */}
        <div className="absolute bottom-1.5 right-1.5 w-6 h-6 z-20 pointer-events-none">
          <svg viewBox="0 0 24 24" className="w-full h-full overflow-visible" style={{ transform: 'scale(-1, -1)' }}>
            <path d="M 0 0 L 18 0 C 12 0 8 4 6 10 C 4 14 0 18 0 24 Z" fill={theme.accentGold} stroke={theme.accentGoldLight} strokeWidth="0.8" />
            <MetallicScrewRivet cx={6} cy={6} radius={2.6} rivetBase={theme.rivetBase} rivetHighlight={theme.rivetHighlight} prefix="prong_br" />
          </svg>
        </div>

        {/* 4x Optical Precision Targeting Reticles [ + ] */}
        <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 pointer-events-none" style={{ borderColor: theme.accentGold }} />
        <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 pointer-events-none" style={{ borderColor: theme.accentGold }} />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 pointer-events-none" style={{ borderColor: theme.accentGold }} />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 pointer-events-none" style={{ borderColor: theme.accentGold }} />

        {/* Recessed Deep Chamfer Pure White Canvas Bed */}
        <div
          className="relative flex h-44 w-44 sm:h-48 sm:w-48 items-center justify-center rounded-[1.5rem] p-2.5 sm:p-3 shadow-inner"
          style={{
            backgroundColor: theme.qrBezelBg,
            border: `2px solid ${theme.accentGold}`,
            boxShadow: 'inset 0 4px 14px rgba(60,40,15,0.12), 0 2px 4px rgba(255,255,255,0.95)',
          }}
        >
          {qrImage ? (
            <>
              <img
                src={qrImage}
                alt={`Permanent QR code for ${restaurantName}`}
                className="h-full w-full object-contain"
                style={{ imageRendering: 'pixelated' }}
                decoding="async"
                loading="lazy"
              />
              {/* Centered 3D Minted Gold MenusQR Medallion */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="p-1.5 rounded-2xl shadow-xl border flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #FFFDEB 0%, #DFB15B 35%, #8F6914 70%, #2B1D04 100%)',
                    borderColor: '#FFFDF0',
                    boxShadow: '0 6px 18px rgba(60,40,15,0.35), inset 0 1px 2px rgba(255,255,255,0.98)',
                  }}
                >
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center p-1.5 border shadow-inner"
                    style={{
                      background: 'radial-gradient(circle, #2A1D0D 0%, #120A02 100%)',
                      borderColor: theme.accentGoldLight,
                    }}
                  >
                    <MenusQRMark color="#FFF8D6" orange="#EA580C" />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div
              className="flex h-full w-full items-center justify-center border-2 border-dashed rounded-xl bg-black/5"
              style={{ borderColor: theme.accentGold }}
            >
              <span className="text-xs font-bold opacity-70" style={{ color: theme.textPrimary }}>
                Generating QR...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 9. TRIPTYCH 3-STEP INTERACTIVE SCAN GUIDANCE
// -------------------------------------------------------------
function TriptychScanGuide({ theme }: { theme: ThemeConfig }) {
  return (
    <div
      className="flex items-center justify-center gap-2 sm:gap-2.5 px-3.5 py-1.5 rounded-full border mb-1.5 shadow-md whitespace-nowrap"
      style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, #FBF7EE 60%, #F5ECDA 100%)',
        borderColor: theme.accentGold,
        boxShadow: '0 3px 10px rgba(60,40,15,0.12), inset 0 1px 1px rgba(255,255,255,0.95)',
      }}
    >
      {/* Step 1: Open Camera */}
      <div className="flex items-center gap-1.5">
        <div
          className="w-4 h-4 rounded-full flex items-center justify-center shadow-xs"
          style={{ background: theme.accentGold, color: '#1A1102' }}
        >
          <Camera size={9} strokeWidth={2.6} />
        </div>
        <span
          className="text-[8.5px] font-black uppercase tracking-wider"
          style={{
            fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
            color: theme.textPrimary,
          }}
        >
          1. OPEN CAMERA
        </span>
      </div>

      {/* Gilded Arrow Divider */}
      <span className="text-[8px] font-black opacity-80" style={{ color: theme.accentGold }}>➔</span>

      {/* Step 2: Scan QR */}
      <div className="flex items-center gap-1.5">
        <div
          className="w-4 h-4 rounded-full flex items-center justify-center shadow-xs"
          style={{ background: theme.accentGold, color: '#1A1102' }}
        >
          <QrCode size={9} strokeWidth={2.6} />
        </div>
        <span
          className="text-[8.5px] font-black uppercase tracking-wider"
          style={{
            fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
            color: theme.textPrimary,
          }}
        >
          2. SCAN CODE
        </span>
      </div>

      {/* Gilded Arrow Divider */}
      <span className="text-[8px] font-black opacity-80" style={{ color: theme.accentGold }}>➔</span>

      {/* Step 3: View Menu */}
      <div className="flex items-center gap-1.5">
        <div
          className="w-4 h-4 rounded-full flex items-center justify-center shadow-xs"
          style={{ background: theme.accentGold, color: '#1A1102' }}
        >
          <BookOpen size={9} strokeWidth={2.6} />
        </div>
        <span
          className="text-[8.5px] font-black uppercase tracking-wider"
          style={{
            fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
            color: theme.textPrimary,
          }}
        >
          3. INDULGE MENU
        </span>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 10. SCULPTED BRASS TABLE NUMBER PLAQUE
// -------------------------------------------------------------
function SculptedTablePlaque({
  tableNumber,
  theme,
}: {
  tableNumber: string;
  theme: ThemeConfig;
}) {
  return (
    <div
      className="relative mb-2 px-5 py-1 rounded-lg border flex items-center gap-3 shadow-lg"
      style={{
        background: theme.badgeGrad,
        borderColor: theme.accentGoldLight,
        boxShadow: '0 4px 14px rgba(60,40,15,0.25), inset 0 1px 2px rgba(255,255,255,0.95), inset 0 -1px 2px rgba(0,0,0,0.25)',
      }}
    >
      <div className="w-2.5 h-2.5">
        <svg viewBox="0 0 10 10" className="w-full h-full">
          <circle cx="5" cy="5" r="4" fill="#241603" />
          <circle cx="5" cy="5" r="3.2" fill={theme.accentGoldLight} />
          <line x1="2" y1="5" x2="8" y2="5" stroke="#241603" strokeWidth="0.8" />
        </svg>
      </div>
      <div className="flex items-center gap-1.5">
        <span
          className="text-[8.5px] font-black tracking-[0.22em] uppercase"
          style={{
            fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
            color: theme.badgeText,
          }}
        >
          TABLE
        </span>
        <span
          className="text-[12px] font-black tracking-wider"
          style={{
            fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
            color: theme.badgeText,
          }}
        >
          № {tableNumber}
        </span>
      </div>
      <div className="w-2.5 h-2.5">
        <svg viewBox="0 0 10 10" className="w-full h-full">
          <circle cx="5" cy="5" r="4" fill="#241603" />
          <circle cx="5" cy="5" r="3.2" fill={theme.accentGoldLight} />
          <line x1="5" y1="2" x2="5" y2="8" stroke="#241603" strokeWidth="0.8" />
        </svg>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MAIN COMPONENT: ROYAL WALNUT / IMPERIAL TABLE STICKER CARD
// -------------------------------------------------------------
export default function RoyalWalnutStickerCard({
  restaurantName,
  logoUrl,
  category = 'FINE DINING & CULINARY EXCELLENCE',
  tagline,
  menuUrl,
  qrImage,
  headerText = 'SCAN FOR DIGITAL MENU',
  footerText = 'Point Camera to Scan Menu',
  isModal = false,
  themeId = 'menusqr-marble-gold',
  stickerRef,
  tableNumber,
}: RoyalWalnutStickerCardProps) {
  const theme = STICKER_THEMES[themeId] || STICKER_THEMES['menusqr-marble-gold'];

  // Clean domain extraction
  let domain = 'menusqr.in';
  try {
    if (menuUrl) {
      const parsed = new URL(menuUrl.startsWith('http') ? menuUrl : `https://${menuUrl}`);
      domain = parsed.host || 'menusqr.in';
    }
  } catch {
    domain = 'menusqr.in';
  }

  return (
    <div className="flex flex-col items-center select-none font-sans">
      {/* --- PHYSICAL TABLE STICKER ARTWORK FRAME (0deg Level, 100% Print-Ready) --- */}
      <div
        ref={stickerRef}
        data-testid="menusqr-standee-card"
        className={`${isModal ? 'qr-print-sticker ' : ''}relative flex w-[384px] sm:w-[420px] min-h-[660px] flex-col items-center overflow-hidden rounded-[2.8rem] p-4 sm:p-5 box-border border-2 transition-all`}
        style={{
          background: theme.frameBg,
          borderColor: theme.frameBorder,
          boxShadow: theme.frameShadow,
        }}
      >
        {/* Tactile Material Texture Overlay (Italian Calacatta Marble & Archival Linen) */}
        <LightLuxuryTextureOverlay />

        {/* Ambient Specular Edge Highlight Ring */}
        <div
          className="absolute inset-0 pointer-events-none rounded-[2.8rem] border opacity-80"
          style={{ borderColor: 'rgba(255,255,255,0.7)' }}
        />

        {/* 4x Masterpiece Baroque Acanthus Corner Spandrels with Slotted Hardware Screws */}
        <BaroqueAcanthusCorner theme={theme} position="top-left" />
        <BaroqueAcanthusCorner theme={theme} position="top-right" />
        <BaroqueAcanthusCorner theme={theme} position="bottom-left" />
        <BaroqueAcanthusCorner theme={theme} position="bottom-right" />

        {/* Outer Perimeter Slotted Hardware Rivets (Top, Bottom, Left, Right Midpoints) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
          {/* Top Edge Midpoint Rivets */}
          <MetallicScrewRivet cx={140} cy={14} radius={3.2} rivetBase={theme.rivetBase} rivetHighlight={theme.rivetHighlight} prefix="peri_top_l" angle={0} />
          <MetallicScrewRivet cx={276} cy={14} radius={3.2} rivetBase={theme.rivetBase} rivetHighlight={theme.rivetHighlight} prefix="peri_top_r" angle={90} />
          {/* Bottom Edge Midpoint Rivets */}
          <MetallicScrewRivet cx={140} cy={646} radius={3.2} rivetBase={theme.rivetBase} rivetHighlight={theme.rivetHighlight} prefix="peri_bot_l" angle={45} />
          <MetallicScrewRivet cx={276} cy={646} radius={3.2} rivetBase={theme.rivetBase} rivetHighlight={theme.rivetHighlight} prefix="peri_bot_r" angle={135} />
          {/* Side Midpoint Rivets */}
          <MetallicScrewRivet cx={14} cy={330} radius={3.2} rivetBase={theme.rivetBase} rivetHighlight={theme.rivetHighlight} prefix="peri_left" angle={60} />
          <MetallicScrewRivet cx={402} cy={330} radius={3.2} rivetBase={theme.rivetBase} rivetHighlight={theme.rivetHighlight} prefix="peri_right" angle={120} />
        </svg>

        {/* --- TOP GRAND IMPERIAL MEDALLION & LAUREL WREATH --- */}
        <ImperialMedallionHeader theme={theme} headerText={headerText} />

        {/* --- INNER HIGH-DETAIL LUXURY ARTBOARD --- */}
        <div
          className="relative z-10 flex w-full flex-1 flex-col items-center overflow-hidden rounded-[2.2rem] p-4 sm:p-5 box-border border-2"
          style={{
            background: theme.artboardBg,
            borderColor: theme.artboardBorder,
            boxShadow: `0 12px 35px rgba(60,40,15,0.14), inset 0 0 0 1px ${theme.artboardBorder}`,
          }}
        >
          {/* Tactile Artboard Grain Pattern */}
          <LightLuxuryTextureOverlay />

          {/* Banknote Guilloché Rosette Sacred Geometry Mandala */}
          <BanknoteGuillocheRosette color={theme.accentGold} />

          {/* Banknote Guilloché Security Wave Lace (Continuous Perimeter) */}
          <BanknoteGuillocheBorder color={theme.guillocheColor} />

          {/* Milgrain Coin-Edge Beaded Hairline */}
          <div
            className="absolute inset-3 pointer-events-none rounded-[1.7rem] border border-dashed opacity-45"
            style={{ borderColor: theme.accentGold }}
          />

          {/* Microtext Security Engraving around Inner Frame */}
          <div className="absolute top-2.5 left-8 right-8 flex justify-between pointer-events-none opacity-45 text-[5.5px] font-mono tracking-[0.28em] uppercase overflow-hidden" style={{ color: theme.accentGold }}>
            <span>★ OFFICIAL MENUSQR SPECIFICATION</span>
            <span>24K CRAFTED ARTIFACT ★</span>
          </div>

          {/* 4x Inner Viewfinder Rosettes */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 pointer-events-none opacity-85" style={{ borderColor: theme.accentGold }} />
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 pointer-events-none opacity-85" style={{ borderColor: theme.accentGold }} />
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 pointer-events-none opacity-85" style={{ borderColor: theme.accentGold }} />
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 pointer-events-none opacity-85" style={{ borderColor: theme.accentGold }} />

          {/* --- RESTAURANT BRANDING HEADER --- */}
          <div className="relative z-10 flex flex-col items-center pt-1 text-center w-full">
            {/* Brand Medallion — the owner's own logo, set in a minted gold bezel */}
            {logoUrl && (
              <div
                className="relative mb-2 flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 p-1.5"
                style={{
                  borderColor: theme.accentGold,
                  background: theme.qrBezelBg,
                  boxShadow: `0 4px 12px rgba(60,40,15,0.2), inset 0 0 0 1px ${theme.accentGoldLight}`,
                }}
              >
                <img
                  src={logoUrl}
                  alt=""
                  crossOrigin="anonymous"
                  className="h-full w-full object-contain"
                  // A logo served without permissive CORS headers cannot be inlined by the PNG
                  // exporter; hiding it keeps the plaque clean instead of showing a broken frame.
                  onError={(event) => {
                    (event.currentTarget.parentElement as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Restaurant Name in Deep Ebony-Bronze Serif (Ultra High Contrast on Light Background) */}
            <h2
              className={`font-black tracking-tight leading-snug w-full max-w-[350px] px-2 break-words text-center uppercase h-auto min-h-0 ${
                restaurantName.length > 30
                  ? 'text-xs sm:text-[13px]'
                  : restaurantName.length > 24
                  ? 'text-[13px] sm:text-sm'
                  : restaurantName.length > 18
                  ? 'text-sm sm:text-[15.5px]'
                  : restaurantName.length > 11
                  ? 'text-base sm:text-lg'
                  : 'text-lg sm:text-xl'
              }`}
              style={{
                fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif",
                color: theme.textPrimary,
                textShadow: '0 1px 0 rgba(255,255,255,0.95), 0 2px 4px rgba(60,35,10,0.18)',
              }}
            >
              {restaurantName}
            </h2>

            {/* Cuisine / Category Plaque */}
            <div className="flex items-center justify-center gap-1.5 mt-2 max-w-[320px] px-1">
              <span className="h-[1.5px] w-5 shrink-0" style={{ background: `linear-gradient(to right, transparent, ${theme.accentGold})` }} />
              <p
                className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-center drop-shadow-xs"
                style={{
                  fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                  color: theme.textSecondary,
                }}
              >
                {category}
              </p>
              <span className="h-[1.5px] w-5 shrink-0" style={{ background: `linear-gradient(to left, transparent, ${theme.accentGold})` }} />
            </div>

            {/* Sceptre & Fleur-de-lis Royal Flourish */}
            <div className="mt-1">
              <RoyalSceptreFlourish color={theme.accentGold} />
            </div>

            {tagline && (
              <p
                className="text-[10px] italic max-w-[280px] truncate opacity-85 block mt-0.5 mb-0.5 font-medium"
                style={{ color: theme.textMuted }}
              >
                "{tagline}"
              </p>
            )}
          </div>

          {/* --- GRAND HOROLOGY "VAULT BEZEL" QR CODE DOCK --- */}
          <VaultQrContainer theme={theme} qrImage={qrImage} restaurantName={restaurantName} />

          {/* --- INSTRUCTION & CUSTOMER GUIDANCE --- */}
          <div className="relative z-10 flex flex-col items-center text-center mt-0.5 w-full">
            <h3
              className="text-xs sm:text-[13px] font-black tracking-widest uppercase px-2 mb-1.5"
              style={{
                fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                color: theme.textPrimary,
              }}
            >
              {footerText}
            </h3>

            {/* Triptych 3-Step Interactive Scan Guidance */}
            <TriptychScanGuide theme={theme} />

            {/* Optional Sculpted Brass Table Number Plaque */}
            {tableNumber && <SculptedTablePlaque tableNumber={tableNumber} theme={theme} />}

            {/* Bottom Authenticity & Concierge Footnote */}
            <div
              className="flex items-center justify-between gap-2 w-full pt-1.5 border-t opacity-85 text-[8.5px] font-black tracking-[0.22em] uppercase"
              style={{
                fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                borderColor: theme.accentGold,
                color: theme.textMuted,
              }}
            >
              <span>100% CONTACTLESS</span>
              <span
                className="px-2.5 py-0.5 rounded-full border text-[8px] font-mono tracking-wider font-bold shadow-xs"
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  borderColor: theme.accentGold,
                  color: theme.textSecondary,
                }}
              >
                {domain}
              </span>
              <span>NO APP REQUIRED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
