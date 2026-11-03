import React from 'react';
import type { IllustrationProps } from './types';
import { SIZE_MAP } from './types';

/**
 * IllusOnlineOrdering (Asset #8)
 * Communicates: Customer Online Table Ordering, Appetite Upsell, Cart Drawer.
 */
export const IllusOnlineOrdering: React.FC<IllustrationProps> = ({
  size = 'responsive',
  theme = 'emerald',
  animated = true,
  title = 'MENUQR Online Table Ordering',
  description = 'Diner browsing visual digital menu and adding dishes to cart with upselling chips.',
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
        <linearGradient id="oo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B120F" />
          <stop offset="50%" stopColor="#14211A" />
          <stop offset="100%" stopColor="#080E0B" />
        </linearGradient>

        <filter id="oo-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="#000000" floodOpacity="0.55" />
        </filter>

        <clipPath id="oo-clip">
          <rect x="20" y="20" width="500" height="360" rx="16" />
        </clipPath>

        {animated && (
          <style>{`
            @keyframes ooFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
            .oo-float { animation: ooFloat 4.2s ease-in-out infinite; }
          `}</style>
        )}
      </defs>

      <rect width="540" height="400" rx="20" fill={theme === 'parchment' ? '#FAFAF7' : theme === 'neutral' ? '#222F29' : 'url(#oo-bg)'} />

      {/* Atmospheric Table Photography Background */}
      <g clipPath="url(#oo-clip)" opacity="0.75">
        <image href="/marketing/carousel/smart_upsell.webp" x="20" y="20" width="500" height="360" preserveAspectRatio="xMidYMid slice" />
        <rect x="20" y="20" width="500" height="360" fill="#0A140F" opacity="0.72" />
      </g>

      <rect x="20" y="20" width="500" height="360" rx="16" fill="none" stroke="#2B4034" strokeWidth="1.5" />

      {/* Centerpiece: Smartphone with Live MENUQR Cart Experience */}
      <g transform="translate(185, 45)" filter="url(#oo-shadow)">
        <rect x="0" y="0" width="170" height="310" rx="18" fill="#0E1612" stroke="#3D5649" strokeWidth="2.5" />
        <rect x="6" y="6" width="158" height="298" rx="14" fill="#131E18" />

        {/* Dynamic Island & Header */}
        <rect x="55" y="10" width="60" height="8" rx="4" fill="#090E0C" />
        <rect x="14" y="26" width="142" height="24" rx="5" fill="#1C2D24" />
        <text x="22" y="41" fill="#FAFAF7" fontSize="8" fontFamily="sans-serif" fontWeight="bold">Tandoori Junction • Table 02</text>

        {/* Dish Card on Phone */}
        <rect x="14" y="58" width="142" height="110" rx="8" fill="#182720" stroke="#2B3F33" strokeWidth="1" />
        <image href="/assets/dhaba-cover/paneer_tikka_masala.webp" x="20" y="64" width="40" height="40" preserveAspectRatio="xMidYMid meet" />
        <text x="68" y="76" fill="#FAFAF7" fontSize="8" fontFamily="sans-serif" fontWeight="bold">Paneer Tikka</text>
        <text x="68" y="88" fill="#FFC928" fontSize="9" fontFamily="sans-serif" fontWeight="bold">₹320</text>
        {/* Quantity selector */}
        <rect x="20" y="112" width="130" height="22" rx="4" fill="#1F3429" />
        <text x="35" y="126" fill="#34B56A" fontSize="11" fontWeight="bold">-</text>
        <text x="85" y="126" fill="#FFFFFF" fontSize="9" fontWeight="bold">2</text>
        <text x="135" y="126" fill="#34B56A" fontSize="11" fontWeight="bold">+</text>

        {/* Upsell Chips Recommendation */}
        <rect x="14" y="176" width="142" height="55" rx="8" fill="#1B2620" stroke="#E8783C" strokeWidth="1" />
        <text x="22" y="190" fill="#E8783C" fontSize="7" fontFamily="sans-serif" fontWeight="bold">FREQUENTLY PAIRED TOGETHER</text>
        <text x="22" y="204" fill="#FAFAF7" fontSize="8" fontFamily="sans-serif">+ Butter Garlic Naan (₹60)</text>
        <text x="22" y="218" fill="#FAFAF7" fontSize="8" fontFamily="sans-serif">+ Cold Beverage Mint (₹90)</text>

        {/* Floating Cart Sticky Bar */}
        <g transform="translate(14, 240)">
          <rect x="0" y="0" width="142" height="34" rx="8" fill="#E8783C" />
          <circle cx="20" cy="17" r="7" fill="#FFFFFF" opacity="0.25" />
          <text x="32" y="21" fill="#FFFFFF" fontSize="8.5" fontFamily="sans-serif" fontWeight="bold">2 ITEMS • ₹640</text>
          <text x="130" y="21" textAnchor="end" fill="#FFFFFF" fontSize="8.5" fontFamily="sans-serif" fontWeight="bold">VIEW CART ➔</text>
        </g>
      </g>

      {/* Floating Callout: Upsell Margin Lift */}
      <g className="oo-float" transform="translate(365, 80)" filter="url(#oo-shadow)">
        <rect x="0" y="0" width="145" height="74" rx="14" fill="#15221B" stroke="#2D4335" strokeWidth="1.5" />
        <text x="16" y="24" fill="#FFC928" fontSize="8" fontFamily="sans-serif" fontWeight="bold">APPETITE UPSELLING</text>
        <text x="16" y="46" fill="#FAFAF7" fontSize="18" fontFamily="sans-serif" fontWeight="900">+34% <tspan fill="#34B56A" fontSize="12">AOV</tspan></text>
        <text x="16" y="60" fill="#8FA69B" fontSize="7.5" fontFamily="sans-serif">Visual drink & side pairing</text>
      </g>
    </svg>
  );
};

export default IllusOnlineOrdering;
