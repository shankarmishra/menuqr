import React from 'react';
import type { IllustrationProps } from './types';
import { SIZE_MAP } from './types';

/**
 * IllusMenuManagement (Asset #5)
 * Communicates: Digital Menu Management, Instant 86 Sold-Out Shield, Dish Customization.
 */
export const IllusMenuManagement: React.FC<IllustrationProps> = ({
  size = 'responsive',
  theme = 'emerald',
  animated = true,
  title = 'MENUQR Menu Management',
  description = 'Digital menu management board showing 86 sold-out item toggle and price editor.',
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
        <linearGradient id="mm-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B120F" />
          <stop offset="60%" stopColor="#132019" />
          <stop offset="100%" stopColor="#070D0A" />
        </linearGradient>

        <filter id="mm-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#000000" floodOpacity="0.5" />
        </filter>

        {animated && (
          <style>{`
            @keyframes mmFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
            @keyframes mmSwitch { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(14px); } }
            .mm-float { animation: mmFloat 4s ease-in-out infinite; }
            .mm-switch-thumb { animation: mmSwitch 2.5s ease-in-out infinite alternate; }
          `}</style>
        )}
      </defs>

      <rect width="540" height="400" rx="20" fill={theme === 'parchment' ? '#FAFAF7' : theme === 'neutral' ? '#222F29' : 'url(#mm-bg)'} />

      {/* Frame Border */}
      <rect x="20" y="20" width="500" height="360" rx="16" fill="#101915" stroke="#253A2E" strokeWidth="1.5" />

      {/* Main Menu Management Canvas */}
      <g transform="translate(45, 45)">
        {/* Studio Top Navigation Bar */}
        <rect x="0" y="0" width="450" height="36" rx="8" fill="#17241D" stroke="#2C4034" strokeWidth="1" />
        <circle cx="16" cy="18" r="4" fill="#E8783C" />
        <circle cx="28" cy="18" r="4" fill="#FFC928" />
        <circle cx="40" cy="18" r="4" fill="#34B56A" />
        <text x="60" y="22" fill="#FAFAF7" fontSize="10" fontFamily="sans-serif" fontWeight="bold">
          MENU BUILDER · Tandoori Junction
        </text>
        <rect x="340" y="7" width="98" height="22" rx="5" fill="#E8783C" />
        <text x="389" y="21" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontFamily="sans-serif" fontWeight="bold">
          + ADD DISH
        </text>

        {/* Category Tabs */}
        <g transform="translate(0, 50)">
          <rect x="0" y="0" width="105" height="26" rx="6" fill="#E8783C" />
          <text x="52" y="16" textAnchor="middle" fill="#FFFFFF" fontSize="8.5" fontFamily="sans-serif" fontWeight="bold">
            Tandoor Starters (12)
          </text>

          <rect x="115" y="0" width="95" height="26" rx="6" fill="#18261E" stroke="#2A3D31" strokeWidth="1" />
          <text x="162" y="16" textAnchor="middle" fill="#8FA69B" fontSize="8" fontFamily="sans-serif">
            Main Curries (18)
          </text>

          <rect x="220" y="0" width="85" height="26" rx="6" fill="#18261E" stroke="#2A3D31" strokeWidth="1" />
          <text x="262" y="16" textAnchor="middle" fill="#8FA69B" fontSize="8" fontFamily="sans-serif">
            Breads & Rice
          </text>
        </g>

        {/* Dish Row 1: Active In-Stock Dish (Paneer Tikka) */}
        <g transform="translate(0, 95)" filter="url(#mm-shadow)">
          <rect x="0" y="0" width="450" height="65" rx="10" fill="#15211B" stroke="#2C4033" strokeWidth="1" />
          <image href="/assets/dhaba-cover/paneer_tikka_masala.webp" x="12" y="10" width="45" height="45" preserveAspectRatio="xMidYMid meet" />
          <text x="70" y="26" fill="#FAFAF7" fontSize="11" fontFamily="sans-serif" fontWeight="bold">
            Paneer Tikka Achari
          </text>
          <text x="70" y="44" fill="#8FA69B" fontSize="8" fontFamily="sans-serif">
            Smoked cottage cheese cubes marinated in mustard & pickling spices
          </text>
          <text x="310" y="38" fill="#FFC928" fontSize="13" fontFamily="sans-serif" fontWeight="900">
            ₹320
          </text>
          {/* Active Status Badge */}
          <rect x="365" y="22" width="70" height="22" rx="11" fill="#1E382A" stroke="#34B56A" strokeWidth="1" />
          <circle cx="378" cy="33" r="3" fill="#34B56A" />
          <text x="388" y="36" fill="#34B56A" fontSize="7.5" fontFamily="sans-serif" fontWeight="bold">
            AVAILABLE
          </text>
        </g>

        {/* Dish Row 2: 86'd Sold-Out Item (Tandoori Raan) */}
        <g transform="translate(0, 175)" filter="url(#mm-shadow)">
          <rect x="0" y="0" width="450" height="65" rx="10" fill="#1E1916" stroke="#4A2F25" strokeWidth="1.2" />
          <image href="/assets/dhaba-cover/roasted_chicken_platter.webp" x="12" y="10" width="45" height="45" preserveAspectRatio="xMidYMid meet" />
          <text x="70" y="26" fill="#D3C7C2" fontSize="11" fontFamily="sans-serif" fontWeight="bold">
            Tandoori Soya Chaap Platter
          </text>
          <text x="70" y="44" fill="#8A766F" fontSize="8" fontFamily="sans-serif">
            100% Pure Soya marinated overnight in hung curd and yellow chili
          </text>
          <text x="310" y="38" fill="#D3C7C2" fontSize="13" fontFamily="sans-serif" fontWeight="bold">
            ₹280
          </text>

          {/* 86 Toggle Control */}
          <g transform="translate(365, 20)">
            <rect x="0" y="0" width="70" height="24" rx="12" fill="#4A1E1A" stroke="#FF5E4D" strokeWidth="1.2" />
            <circle cx="16" cy="12" r="7" fill="#FF5E4D" className="mm-switch-thumb" />
            <text x="35" y="15" fill="#FF8D80" fontSize="7" fontFamily="sans-serif" fontWeight="bold">
              86'D OUT
            </text>
          </g>
        </g>
      </g>

      {/* Floating Callout HUD: Real-time Sync */}
      <g className="mm-float" transform="translate(340, 290)" filter="url(#mm-shadow)">
        <rect x="0" y="0" width="165" height="68" rx="14" fill="#14221A" stroke="#2D4335" strokeWidth="1.5" />
        <circle cx="20" cy="20" r="5" fill="#34B56A" />
        <text x="32" y="24" fill="#34B56A" fontSize="8.5" fontFamily="sans-serif" fontWeight="bold">1-TAP ZERO REPRINT</text>
        <text x="16" y="44" fill="#FAFAF7" fontSize="13" fontFamily="sans-serif" fontWeight="900">Instant Table Sync</text>
        <text x="16" y="58" fill="#8FA69B" fontSize="7.5" fontFamily="sans-serif">Vanishes on guest phones in 2s</text>
      </g>
    </svg>
  );
};

export default IllusMenuManagement;
