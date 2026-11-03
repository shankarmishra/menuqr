import React from 'react';
import type { IllustrationProps } from './types';
import { SIZE_MAP } from './types';

/**
 * IllusRestaurantOnboarding (Asset #10)
 * Communicates: 5-Minute Setup, Excel Menu Parser, Instant Digital Conversion.
 */
export const IllusRestaurantOnboarding: React.FC<IllustrationProps> = ({
  size = 'responsive',
  theme = 'emerald',
  animated = true,
  title = 'MENUQR Restaurant Onboarding',
  description = 'Excel spreadsheet transforming through AI parser into categorized digital menu.',
  className = '',
  style,
  ...rest
}) => {
  const sizeConfig = SIZE_MAP[size];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 540 400"
      width={sizeConfig.width}
      className={`select-none ${sizeConfig.className || ''} ${className}`}
      style={style}
      role="img"
      aria-label={title}
      {...rest}
    >
      <defs>
        <linearGradient id="ro-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B120F" />
          <stop offset="50%" stopColor="#14211A" />
          <stop offset="100%" stopColor="#080E0B" />
        </linearGradient>

        <linearGradient id="ro-beam" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22C55E" />
          <stop offset="50%" stopColor="#FFC928" />
          <stop offset="100%" stopColor="#E8783C" />
        </linearGradient>

        <filter id="ro-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#000000" floodOpacity="0.5" />
        </filter>

        {animated && (
          <style>{`
            @keyframes roPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
            @keyframes roSlide { 0% { transform: translateX(0); } 100% { transform: translateX(18px); } }
            .ro-pulse { animation: roPulse 3s ease-in-out infinite; transform-origin: center; }
            .ro-arrow { animation: roSlide 1.5s ease-in-out infinite alternate; }
          `}</style>
        )}
      </defs>

      <rect width="540" height="400" rx="20" fill={theme === 'parchment' ? '#FAFAF7' : theme === 'neutral' ? '#222F29' : 'url(#ro-bg)'} />
      <rect x="20" y="20" width="500" height="360" rx="16" fill="#111B16" stroke="#263A2E" strokeWidth="1.5" />

      {/* Title Header */}
      <g transform="translate(50, 45)">
        <text x="0" y="20" fill="#E8783C" fontSize="10" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.6">
          5-MINUTE INSTANT ONBOARDING
        </text>
        <text x="0" y="44" fill="#FAFAF7" fontSize="22" fontFamily="sans-serif" fontWeight="900">
          From Raw Excel to Live QR Menu
        </text>
      </g>

      {/* Left Box: Raw Excel Spreadsheet */}
      <g transform="translate(50, 120)" filter="url(#ro-shadow)">
        <rect x="0" y="0" width="165" height="210" rx="12" fill="#15241C" stroke="#25824C" strokeWidth="1.8" />
        {/* Excel Header */}
        <rect x="0" y="0" width="165" height="34" rx="12" fill="#1A4A2F" />
        <rect x="12" y="8" width="18" height="18" rx="3" fill="#22C55E" />
        <text x="21" y="21" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontFamily="sans-serif" fontWeight="900">X</text>
        <text x="36" y="21" fill="#FAFAF7" fontSize="8.5" fontFamily="sans-serif" fontWeight="bold">menu_sheet.xlsx</text>

        {/* Spreadsheet Grid Lines */}
        <g transform="translate(12, 46)">
          <rect x="0" y="0" width="141" height="16" rx="2" fill="#203328" />
          <text x="6" y="11" fill="#8FA69B" fontSize="6.5" fontFamily="sans-serif" fontWeight="bold">Category | Dish | Price</text>
          
          <rect x="0" y="22" width="141" height="22" rx="2" fill="#182A21" />
          <text x="6" y="36" fill="#C5D1CB" fontSize="7" fontFamily="sans-serif">Starters • Paneer Tikka • 320</text>

          <rect x="0" y="50" width="141" height="22" rx="2" fill="#182A21" />
          <text x="6" y="64" fill="#C5D1CB" fontSize="7" fontFamily="sans-serif">Mains • Dal Makhani • 280</text>

          <rect x="0" y="78" width="141" height="22" rx="2" fill="#182A21" />
          <text x="6" y="92" fill="#C5D1CB" fontSize="7" fontFamily="sans-serif">Breads • Garlic Naan • 60</text>

          <rect x="0" y="106" width="141" height="22" rx="2" fill="#182A21" />
          <text x="6" y="120" fill="#C5D1CB" fontSize="7" fontFamily="sans-serif">Drinks • Masala Chai • 40</text>
        </g>
      </g>

      {/* Center AI Engine Transformer Pulse */}
      <g transform="translate(235, 200)">
        {/* Connecting beam */}
        <line x1="-15" y1="20" x2="65" y2="20" stroke="url(#ro-beam)" strokeWidth="3" strokeDasharray="4 4" />
        <circle cx="25" cy="20" r="26" fill="#1D2E24" stroke="#E8783C" strokeWidth="2" className="ro-pulse" />
        <text x="25" y="18" textAnchor="middle" fill="#FFC928" fontSize="8" fontFamily="sans-serif" fontWeight="900">AI</text>
        <text x="25" y="28" textAnchor="middle" fill="#34B56A" fontSize="6" fontFamily="sans-serif" fontWeight="bold">PARSE</text>
      </g>

      {/* Right Box: Gorgeous Rendered Mobile Digital Menu */}
      <g transform="translate(325, 110)" filter="url(#ro-shadow)">
        <rect x="0" y="0" width="165" height="230" rx="16" fill="#0E1612" stroke="#3A5344" strokeWidth="2" />
        <rect x="6" y="6" width="153" height="218" rx="12" fill="#14211A" />
        {/* Top phone bar */}
        <rect x="12" y="14" width="141" height="26" rx="4" fill="#1C2D24" />
        <text x="20" y="30" fill="#FAFAF7" fontSize="8" fontFamily="sans-serif" fontWeight="bold">Tandoori Junction Menu</text>
        
        {/* Dish Card 1 */}
        <g transform="translate(12, 48)">
          <rect x="0" y="0" width="141" height="48" rx="6" fill="#1A2A22" stroke="#2B3F33" strokeWidth="0.8" />
          <image href="/assets/dhaba-cover/paneer_tikka_masala.webp" x="6" y="6" width="36" height="36" preserveAspectRatio="xMidYMid meet" />
          <text x="48" y="20" fill="#FAFAF7" fontSize="8" fontFamily="sans-serif" fontWeight="bold">Paneer Tikka</text>
          <text x="48" y="34" fill="#FFC928" fontSize="8.5" fontFamily="sans-serif" fontWeight="bold">₹320</text>
          <rect x="106" y="14" width="28" height="18" rx="3" fill="#E8783C" />
          <text x="120" y="26" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="bold">ADD</text>
        </g>

        {/* Dish Card 2 */}
        <g transform="translate(12, 104)">
          <rect x="0" y="0" width="141" height="48" rx="6" fill="#1A2A22" stroke="#2B3F33" strokeWidth="0.8" />
          <image href="/assets/dhaba-cover/dal_tadka.webp" x="6" y="6" width="36" height="36" preserveAspectRatio="xMidYMid meet" />
          <text x="48" y="20" fill="#FAFAF7" fontSize="8" fontFamily="sans-serif" fontWeight="bold">Dal Makhani</text>
          <text x="48" y="34" fill="#FFC928" fontSize="8.5" fontFamily="sans-serif" fontWeight="bold">₹280</text>
          <rect x="106" y="14" width="28" height="18" rx="3" fill="#E8783C" />
          <text x="120" y="26" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="bold">ADD</text>
        </g>

        {/* Success Check Badge */}
        <rect x="12" y="162" width="141" height="46" rx="6" fill="#1B3325" stroke="#34B56A" strokeWidth="1" />
        <circle cx="26" cy="185" r="7" fill="#34B56A" />
        <text x="38" y="181" fill="#FAFAF7" fontSize="8" fontFamily="sans-serif" fontWeight="bold">100% Auto-Matched</text>
        <text x="38" y="193" fill="#A7D4BA" fontSize="6.5" fontFamily="sans-serif">Zero manual entry required</text>
      </g>
    </svg>
  );
};

export default IllusRestaurantOnboarding;
