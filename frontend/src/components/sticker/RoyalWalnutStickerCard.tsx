import React from 'react';
import { MenusQRMark } from '../brand/MenusQRMark';
import { type StickerThemeId } from './StickerTemplates';

export type { StickerThemeId };

export interface ThemeConfig {
  id: StickerThemeId;
  name: string;
  frameBg: string;
  frameBorder: string;
  frameShadow: string;
  frameInnerGlow: string;
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

export const STICKER_THEMES: Record<StickerThemeId, ThemeConfig> = {
  'menusqr-obsidian-gold': {
    id: 'menusqr-obsidian-gold',
    name: 'Imperial Obsidian',
    frameBg: 'radial-gradient(ellipse at 50% 0%, #1e2823 0%, #101613 55%, #050807 100%)',
    frameBorder: 'rgba(223, 177, 91, 0.45)',
    frameShadow: '0 28px 60px -12px rgba(0,0,0,0.85), inset 0 0 45px rgba(0,0,0,0.95), inset 0 1px 2px rgba(255,230,150,0.3)',
    frameInnerGlow: 'inset 0 0 25px rgba(0,0,0,0.85)',
    badgeGrad: 'linear-gradient(135deg, #FFF1B0 0%, #E8C15A 32%, #C2962D 68%, #825E12 100%)',
    badgeText: '#261702',
    badgeBorder: '#FFF6D1',
    badgeShadow: '0 8px 20px rgba(0,0,0,0.65), inset 0 1px 2px rgba(255,255,255,0.9), inset 0 -1px 2px rgba(0,0,0,0.5)',
    artboardBg: 'linear-gradient(175deg, #141C18 0%, #0D1310 50%, #080C0A 100%)',
    artboardBorder: 'rgba(223, 177, 91, 0.45)',
    accentGold: '#DFB15B',
    accentGoldLight: '#FFF3C4',
    accentGoldDark: '#8A6615',
    guillocheColor: 'rgba(223, 177, 91, 0.28)',
    textPrimary: '#FBF8EF',
    textSecondary: '#DFB15B',
    textMuted: '#94A89E',
    qrBezelBg: '#FFFFFF',
    qrBezelBorder: 'linear-gradient(135deg, #FFF1B0, #C2962D, #825E12)',
    qrBorder: 'rgba(223, 177, 91, 0.65)',
    rivetBase: '#4E3A10',
    rivetHighlight: '#FFF2B2',
    isDarkArtboard: true,
  },
  'menusqr-walnut-gold': {
    id: 'menusqr-walnut-gold',
    name: 'Royal Heritage Walnut',
    frameBg: 'linear-gradient(155deg, #482816 0%, #2A1408 35%, #3B1E0E 65%, #180903 100%)',
    frameBorder: 'rgba(223, 177, 91, 0.42)',
    frameShadow: '0 28px 60px -12px rgba(0,0,0,0.8), inset 0 0 40px rgba(0,0,0,0.9), inset 0 1px 2px rgba(255,235,180,0.3)',
    frameInnerGlow: 'inset 0 0 25px rgba(0,0,0,0.85)',
    badgeGrad: 'linear-gradient(135deg, #FFF3BD 0%, #E0B45C 32%, #B8851B 68%, #6E4907 100%)',
    badgeText: '#301B02',
    badgeBorder: '#FFF9DC',
    badgeShadow: '0 8px 20px rgba(0,0,0,0.65), inset 0 1px 2px rgba(255,255,255,0.9), inset 0 -1px 2px rgba(0,0,0,0.5)',
    artboardBg: 'linear-gradient(175deg, #FCF8F0 0%, #F5ECE0 50%, #EADDCB 100%)',
    artboardBorder: 'rgba(184, 133, 27, 0.45)',
    accentGold: '#B8851B',
    accentGoldLight: '#FFF2B2',
    accentGoldDark: '#6E4907',
    guillocheColor: 'rgba(184, 133, 27, 0.25)',
    textPrimary: '#1E1005',
    textSecondary: '#8A5714',
    textMuted: '#6B5441',
    qrBezelBg: '#FFFFFF',
    qrBezelBorder: 'linear-gradient(135deg, #FFF3BD, #DFB15B, #6E4907)',
    qrBorder: 'rgba(184, 133, 27, 0.65)',
    rivetBase: '#4D3208',
    rivetHighlight: '#FFF3BD',
    isDarkArtboard: false,
  },
  'menusqr-emerald-gold': {
    id: 'menusqr-emerald-gold',
    name: 'Emerald Palace',
    frameBg: 'radial-gradient(ellipse at 50% 0%, #103825 0%, #082116 55%, #030F0A 100%)',
    frameBorder: 'rgba(229, 193, 88, 0.45)',
    frameShadow: '0 28px 60px -12px rgba(0,0,0,0.85), inset 0 0 45px rgba(0,0,0,0.95), inset 0 1px 2px rgba(255,235,180,0.3)',
    frameInnerGlow: 'inset 0 0 25px rgba(0,0,0,0.85)',
    badgeGrad: 'linear-gradient(135deg, #FFF3BD 0%, #E5C158 32%, #BE9429 68%, #7A570C 100%)',
    badgeText: '#261C03',
    badgeBorder: '#FFF9DC',
    badgeShadow: '0 8px 20px rgba(0,0,0,0.65), inset 0 1px 2px rgba(255,255,255,0.9), inset 0 -1px 2px rgba(0,0,0,0.5)',
    artboardBg: 'linear-gradient(175deg, #F4FAF6 0%, #E8F3EC 50%, #D8EADB 100%)',
    artboardBorder: 'rgba(14, 69, 44, 0.4)',
    accentGold: '#C99B2A',
    accentGoldLight: '#FFF3BD',
    accentGoldDark: '#7A570C',
    guillocheColor: 'rgba(14, 69, 44, 0.25)',
    textPrimary: '#082115',
    textSecondary: '#125234',
    textMuted: '#3A634E',
    qrBezelBg: '#FFFFFF',
    qrBezelBorder: 'linear-gradient(135deg, #FFF3BD, #E5C158, #7A570C)',
    qrBorder: 'rgba(14, 69, 44, 0.55)',
    rivetBase: '#453309',
    rivetHighlight: '#FFF3BD',
    isDarkArtboard: false,
  },
  'menusqr-ruby-gold': {
    id: 'menusqr-ruby-gold',
    name: 'Ruby Royale',
    frameBg: 'radial-gradient(ellipse at 50% 0%, #3D0B16 0%, #24050D 55%, #0F0205 100%)',
    frameBorder: 'rgba(230, 188, 101, 0.45)',
    frameShadow: '0 28px 60px -12px rgba(0,0,0,0.85), inset 0 0 45px rgba(0,0,0,0.95), inset 0 1px 2px rgba(255,235,180,0.3)',
    frameInnerGlow: 'inset 0 0 25px rgba(0,0,0,0.85)',
    badgeGrad: 'linear-gradient(135deg, #FFF5C7 0%, #E6BC65 32%, #C2912D 68%, #7D540F 100%)',
    badgeText: '#261603',
    badgeBorder: '#FFFAEB',
    badgeShadow: '0 8px 20px rgba(0,0,0,0.65), inset 0 1px 2px rgba(255,255,255,0.9), inset 0 -1px 2px rgba(0,0,0,0.5)',
    artboardBg: 'linear-gradient(175deg, #FCF5F6 0%, #F8E8EA 50%, #EFD5D8 100%)',
    artboardBorder: 'rgba(99, 17, 34, 0.4)',
    accentGold: '#B8851B',
    accentGoldLight: '#FFF5C7',
    accentGoldDark: '#7D540F',
    guillocheColor: 'rgba(99, 17, 34, 0.25)',
    textPrimary: '#24040B',
    textSecondary: '#6E1125',
    textMuted: '#66323E',
    qrBezelBg: '#FFFFFF',
    qrBezelBorder: 'linear-gradient(135deg, #FFF5C7, #E6BC65, #7D540F)',
    qrBorder: 'rgba(99, 17, 34, 0.55)',
    rivetBase: '#472F08',
    rivetHighlight: '#FFF5C7',
    isDarkArtboard: false,
  },
  'menusqr-marble-gold': {
    id: 'menusqr-marble-gold',
    name: 'Carrara Marble',
    frameBg: 'linear-gradient(145deg, #F5F5F7 0%, #E4E4E8 45%, #F8F8FA 70%, #D8D8DE 100%)',
    frameBorder: 'rgba(196, 154, 108, 0.55)',
    frameShadow: '0 28px 60px -12px rgba(0,0,0,0.35), inset 0 0 25px rgba(0,0,0,0.06), inset 0 1px 2px rgba(255,255,255,0.95)',
    frameInnerGlow: 'inset 0 0 25px rgba(0,0,0,0.05)',
    badgeGrad: 'linear-gradient(135deg, #FFFFFF 0%, #E8D3BF 32%, #C49A6C 68%, #855C33 100%)',
    badgeText: '#26160A',
    badgeBorder: '#FFFFFF',
    badgeShadow: '0 6px 18px rgba(0,0,0,0.25), inset 0 1px 2px rgba(255,255,255,0.9), inset 0 -1px 2px rgba(0,0,0,0.2)',
    artboardBg: 'linear-gradient(175deg, #FFFFFF 0%, #FAF8F6 50%, #F4EFEA 100%)',
    artboardBorder: 'rgba(196, 154, 108, 0.45)',
    accentGold: '#9C7345',
    accentGoldLight: '#E8D3BF',
    accentGoldDark: '#66431E',
    guillocheColor: 'rgba(156, 115, 69, 0.22)',
    textPrimary: '#171311',
    textSecondary: '#75522F',
    textMuted: '#665E57',
    qrBezelBg: '#FFFFFF',
    qrBezelBorder: 'linear-gradient(135deg, #FFFFFF, #C49A6C, #855C33)',
    qrBorder: 'rgba(196, 154, 108, 0.55)',
    rivetBase: '#5E4021',
    rivetHighlight: '#FFFFFF',
    isDarkArtboard: false,
  },
};

export interface RoyalWalnutStickerCardProps {
  restaurantName: string;
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

// Hyper-Detailed Metallic Slotted Brass Screw Rivet
function MetallicScrewRivet({
  cx,
  cy,
  radius = 4,
  rivetBase,
  rivetHighlight,
  prefix = 'rivet',
}: {
  cx: number;
  cy: number;
  radius?: number;
  rivetBase: string;
  rivetHighlight: string;
  prefix?: string;
}) {
  const gradId = `${prefix}_grad_${cx}_${cy}`;
  return (
    <g>
      <defs>
        <radialGradient id={gradId} cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor={rivetHighlight} />
          <stop offset="45%" stopColor={rivetBase} />
          <stop offset="100%" stopColor="#1A1102" />
        </radialGradient>
      </defs>
      {/* Drop Shadow Outer Rim */}
      <circle cx={cx} cy={cy + 0.6} r={radius + 0.6} fill="#000000" opacity="0.65" />
      {/* Main Beveled Screw Head */}
      <circle cx={cx} cy={cy} r={radius} fill={`url(#${gradId})`} stroke={rivetHighlight} strokeWidth="0.6" />
      {/* Inner Recessed Cross / Slot */}
      <line x1={cx - radius * 0.65} y1={cy} x2={cx + radius * 0.65} y2={cy} stroke="#1A1102" strokeWidth="0.8" strokeLinecap="round" />
      <line x1={cx} y1={cy - radius * 0.65} x2={cx} y2={cy + radius * 0.65} stroke="#1A1102" strokeWidth="0.8" strokeLinecap="round" />
      {/* Specular Highlight on Slot Edge */}
      <line x1={cx - radius * 0.6} y1={cy + 0.5} x2={cx + radius * 0.6} y2={cy + 0.5} stroke={rivetHighlight} strokeWidth="0.4" opacity="0.8" />
    </g>
  );
}

// Ornate Corner Bracket with Acanthus Filigree & Slotted Screws
function OrnateCornerBracket({
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

  const prefix = `bracket_${position}_${theme.id}`;

  return (
    <svg
      className={`absolute ${stylePos} w-20 h-20 pointer-events-none z-20 overflow-visible`}
      viewBox="0 0 85 85"
      fill="none"
      style={{ transform }}
    >
      <defs>
        <linearGradient id={`${prefix}_grad`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={theme.accentGoldLight} />
          <stop offset="35%" stopColor={theme.accentGold} />
          <stop offset="75%" stopColor={theme.accentGoldDark} />
          <stop offset="100%" stopColor="#4A3408" />
        </linearGradient>
        <filter id={`${prefix}_shadow`} x="-20%" y="-20%" width="150%" height="150%">
          <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.75" />
        </filter>
      </defs>

      {/* Main Sculpted Bracket Body */}
      <path
        d="M 0 0 L 75 0 C 60 0 40 8 30 22 C 22 34 20 48 20 62 C 12 68 6 78 0 84 Z"
        fill={`url(#${prefix}_grad)`}
        filter={`url(#${prefix}_shadow)`}
      />

      {/* Engraved Inner Filigree Contour */}
      <path
        d="M 4 4 L 66 4 C 53 4 37 11 28 23 C 20 33 18 46 17 60 C 10 65 5 72 4 78 Z"
        fill="none"
        stroke={theme.accentGoldLight}
        strokeWidth="1.2"
        strokeOpacity="0.85"
      />

      {/* Decorative Acanthus Scrollwork Lines */}
      <path
        d="M 12 12 Q 28 14 38 28 Q 28 36 18 28"
        fill="none"
        stroke="#3B2605"
        strokeWidth="1"
        strokeOpacity="0.5"
      />
      <path
        d="M 12 12 Q 14 28 28 38 Q 36 28 28 18"
        fill="none"
        stroke="#FFF2B2"
        strokeWidth="0.8"
        strokeOpacity="0.7"
      />

      {/* Three Precision Slotted Brass Screws */}
      <MetallicScrewRivet cx={14} cy={14} radius={4.2} rivetBase={theme.rivetBase} rivetHighlight={theme.rivetHighlight} prefix={prefix} />
      <MetallicScrewRivet cx={52} cy={12} radius={3.2} rivetBase={theme.rivetBase} rivetHighlight={theme.rivetHighlight} prefix={prefix} />
      <MetallicScrewRivet cx={12} cy={52} radius={3.2} rivetBase={theme.rivetBase} rivetHighlight={theme.rivetHighlight} prefix={prefix} />
    </svg>
  );
}

// Royal Architectural Crown & Filigree Divider
function RoyalEmblemFlourish({ color }: { color: string }) {
  return (
    <svg className="w-40 h-6 my-1.5 opacity-90 overflow-visible" viewBox="0 0 160 24" fill="none">
      {/* Symmetrical Ornamental Wings */}
      <path
        d="M 5 12 C 25 12, 45 4, 65 12 C 55 16, 40 16, 30 20 C 45 22, 60 17, 72 13 L 78 12"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M 155 12 C 135 12, 115 4, 95 12 C 105 16, 120 16, 130 20 C 115 22, 100 17, 88 13 L 82 12"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Center Diamond Jewel */}
      <polygon points="80,5 86,12 80,19 74,12" fill={color} />
      <circle cx="80" cy="12" r="2" fill="#FFFFFF" opacity="0.9" />
      {/* Side Pearls */}
      <circle cx="68" cy="12" r="1.5" fill={color} />
      <circle cx="92" cy="12" r="1.5" fill={color} />
      <circle cx="20" cy="12" r="1.5" fill={color} />
      <circle cx="140" cy="12" r="1.5" fill={color} />
    </svg>
  );
}

export default function RoyalWalnutStickerCard({
  restaurantName,
  category = 'FINE DINING & CULINARY EXCELLENCE',
  tagline,
  menuUrl,
  qrImage,
  headerText = 'SCAN FOR DIGITAL MENU',
  footerText = 'Point Camera to Scan Menu',
  isModal = false,
  themeId = 'menusqr-obsidian-gold',
  stickerRef,
  tableNumber,
}: RoyalWalnutStickerCardProps) {
  const theme = STICKER_THEMES[themeId] || STICKER_THEMES['menusqr-obsidian-gold'];

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
      {/* --- PRODUCTION TABLE STAND / PHYSICAL STICKER ARTWORK FRAME --- */}
      <div
        ref={stickerRef}
        className={`${isModal ? 'qr-print-sticker ' : ''}relative flex w-[380px] sm:w-[416px] min-h-[640px] flex-col items-center overflow-hidden rounded-[2.5rem] p-4 sm:p-5 box-border border`}
        style={{
          background: theme.frameBg,
          borderColor: theme.frameBorder,
          boxShadow: theme.frameShadow,
        }}
      >
        {/* Ambient Radial Vignette & Specular Edge Highlight */}
        <div
          className="absolute inset-0 pointer-events-none rounded-[2.5rem] border opacity-80"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        />

        {/* 4x Majestic Sculpted Corner Brackets with Brass Rivets */}
        <OrnateCornerBracket theme={theme} position="top-left" />
        <OrnateCornerBracket theme={theme} position="top-right" />
        <OrnateCornerBracket theme={theme} position="bottom-left" />
        <OrnateCornerBracket theme={theme} position="bottom-right" />

        {/* --- TOP 3D SCULPTED METALLIC CARTOUCHE (PLAQUE) --- */}
        <div className="relative z-30 mx-auto mt-0.5 mb-3.5 flex items-center justify-center">
          {/* Ornate Plaque Wings Left/Right */}
          <div
            className="flex items-center justify-center px-6 sm:px-8 py-2.5 rounded-full border shadow-2xl backdrop-blur-md"
            style={{
              background: theme.badgeGrad,
              borderColor: theme.badgeBorder,
              boxShadow: theme.badgeShadow,
            }}
          >
            <span
              className="flex items-center gap-2 font-black text-xs sm:text-[13px] tracking-[0.16em] uppercase"
              style={{
                fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                color: theme.badgeText,
                textShadow: '0 1px 0 rgba(255,255,255,0.6), 0 -1px 0 rgba(0,0,0,0.35)',
              }}
            >
              <span className="text-[10px] opacity-80">✦</span>
              <span>{headerText}</span>
              <span className="text-[10px] opacity-80">✦</span>
            </span>
          </div>
        </div>

        {/* --- INNER HIGH-DETAIL LUXURY ARTBOARD --- */}
        <div
          className="relative z-10 flex w-full flex-1 flex-col items-center overflow-hidden rounded-[1.8rem] p-4 sm:p-5 box-border border"
          style={{
            background: theme.artboardBg,
            borderColor: theme.artboardBorder,
            boxShadow: `0 14px 40px rgba(0,0,0,0.55), inset 0 0 0 1px ${theme.artboardBorder}`,
          }}
        >
          {/* Subtle Fine Linen / Parchment Micro-Weave */}
          <div
            className="absolute inset-0 pointer-events-none opacity-25 mix-blend-overlay"
            style={{
              backgroundImage: `radial-gradient(${theme.guillocheColor} 1px, transparent 1px)`,
              backgroundSize: '12px 12px',
            }}
          />

          {/* Concentric Double Hairline Frame */}
          <div
            className="absolute inset-2.5 pointer-events-none rounded-[1.3rem] border opacity-60"
            style={{ borderColor: theme.accentGold }}
          />
          <div
            className="absolute inset-3.5 pointer-events-none rounded-[1.1rem] border border-dashed opacity-35"
            style={{ borderColor: theme.accentGoldLight }}
          />

          {/* 4x Corner Viewfinder Rosettes inside Artboard */}
          <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 pointer-events-none opacity-80" style={{ borderColor: theme.accentGold }} />
          <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 pointer-events-none opacity-80" style={{ borderColor: theme.accentGold }} />
          <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 pointer-events-none opacity-80" style={{ borderColor: theme.accentGold }} />
          <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 pointer-events-none opacity-80" style={{ borderColor: theme.accentGold }} />

          {/* --- RESTAURANT BRANDING HEADER --- */}
          <div className="relative z-10 flex flex-col items-center pt-1 text-center w-full">
            {/* MenusQR Luxury Mark Badge */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <div
                className="w-5 h-5 p-0.5 rounded-md flex items-center justify-center shadow-md border"
                style={{
                  backgroundColor: theme.isDarkArtboard ? '#0A0D0B' : '#1F1106',
                  borderColor: theme.accentGold,
                }}
              >
                <MenusQRMark color="#FFFFFF" orange="#E8783C" />
              </div>
              <span
                className="text-[11px] font-black tracking-[0.25em] uppercase"
                style={{ color: theme.textSecondary }}
              >
                Menus<span style={{ color: theme.accentGold }}>QR</span>
              </span>
            </div>

            {/* Restaurant Name */}
            <h2
              className={`font-black tracking-tight leading-tight w-full max-w-[340px] px-2 break-words mt-1 mb-1 ${
                restaurantName.length > 24
                  ? 'text-lg sm:text-xl'
                  : restaurantName.length > 15
                  ? 'text-xl sm:text-2xl'
                  : 'text-2xl sm:text-3xl'
              }`}
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                color: theme.textPrimary,
                textShadow: theme.isDarkArtboard ? '0 2px 8px rgba(0,0,0,0.7)' : '0 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              {restaurantName}
            </h2>

            {/* Cuisine / Category Subtitle */}
            <p
              className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.22em] opacity-90 block mb-1"
              style={{ color: theme.textSecondary }}
            >
              {category}
            </p>

            {/* Ornate Symmetrical Royal Flourish */}
            <RoyalEmblemFlourish color={theme.accentGold} />

            {tagline && (
              <p
                className="text-[11px] italic max-w-[290px] truncate opacity-85 block mb-1"
                style={{ color: theme.textMuted }}
              >
                "{tagline}"
              </p>
            )}
          </div>

          {/* --- JEWEL-BEZEL QR CODE CONTAINER --- */}
          <div className="relative z-10 my-2.5 flex flex-col items-center">
            {/* Outer Beveled Chamfer Frame */}
            <div
              className="relative p-2.5 rounded-[1.8rem] shadow-2xl border"
              style={{
                background: theme.isDarkArtboard
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.5) 100%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(212,175,55,0.2) 100%)',
                borderColor: theme.accentGold,
                boxShadow: `0 12px 32px rgba(0,0,0,0.45), inset 0 1px 2px rgba(255,255,255,0.6)`,
              }}
            >
              {/* Camera Viewfinder Corners */}
              <div className="absolute top-1.5 left-1.5 w-4 h-4 border-t-2 border-l-2 pointer-events-none rounded-tl" style={{ borderColor: theme.accentGold }} />
              <div className="absolute top-1.5 right-1.5 w-4 h-4 border-t-2 border-r-2 pointer-events-none rounded-tr" style={{ borderColor: theme.accentGold }} />
              <div className="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-2 border-l-2 pointer-events-none rounded-bl" style={{ borderColor: theme.accentGold }} />
              <div className="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-2 border-r-2 pointer-events-none rounded-br" style={{ borderColor: theme.accentGold }} />

              {/* High Contrast White QR Canvas Bed */}
              <div
                className="relative flex h-44 w-44 sm:h-48 sm:w-48 items-center justify-center rounded-[1.3rem] bg-white p-2.5 shadow-inner"
                style={{ border: `1.5px solid ${theme.accentGold}` }}
              >
                {qrImage ? (
                  <>
                    <img
                      src={qrImage}
                      alt={`Permanent QR code for ${restaurantName}`}
                      className="h-full w-full object-contain"
                    />
                    {/* Center 3D Metallic Seal with MenusQR Emblem */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div
                        className="p-1 rounded-xl shadow-xl border flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF6EE 100%)',
                          borderColor: theme.accentGold,
                        }}
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center p-1 shadow-inner border border-white/40"
                          style={{
                            background: 'linear-gradient(135deg, #1A1F1C 0%, #0A0D0B 100%)',
                          }}
                        >
                          <MenusQRMark color="#FFFFFF" orange="#E8783C" />
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

          {/* --- INSTRUCTION & ACTION CALLOUT --- */}
          <div className="relative z-10 flex flex-col items-center text-center mt-1 w-full">
            <h3
              className="text-sm sm:text-base font-extrabold tracking-wide uppercase px-2 mb-1"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                color: theme.textPrimary,
              }}
            >
              {footerText}
            </h3>

            {/* Smart Camera Hint Pill */}
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border mb-2 shadow-sm"
              style={{
                backgroundColor: theme.isDarkArtboard ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                borderColor: theme.accentGold,
              }}
            >
              <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: theme.textSecondary }}>
                📱 Open Camera • Scan QR • Browse Menu
              </span>
            </div>

            {/* Optional Table Number Badge */}
            {tableNumber && (
              <div
                className="mb-2 px-3 py-0.5 rounded-md border text-[11px] font-black tracking-widest uppercase"
                style={{
                  backgroundColor: theme.accentGold,
                  color: theme.badgeText,
                  borderColor: theme.accentGoldLight,
                }}
              >
                TABLE {tableNumber}
              </div>
            )}

            {/* Bottom Authenticity & Domain Divider */}
            <div
              className="flex items-center justify-between gap-2 w-full pt-2 border-t opacity-75 text-[9px] font-bold tracking-[0.2em] uppercase"
              style={{ borderColor: theme.accentGold, color: theme.textMuted }}
            >
              <span>100% CONTACTLESS</span>
              <span className="font-mono text-center opacity-90" style={{ color: theme.accentGold }}>
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
