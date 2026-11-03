import React from 'react';
import type { IllustrationProps } from './types';
import { SIZE_MAP } from './types';

/**
 * IllusKitchenDisplay (Asset #7)
 * Communicates: KDS Kanban board (New, Cooking, Ready), Multi-station timers.
 */
export const IllusKitchenDisplay: React.FC<IllustrationProps> = ({
  size = 'responsive',
  theme = 'emerald',
  animated = true,
  title = 'MENUQR Kitchen Display System',
  description = 'Kitchen display system showing live orders organized by stage.',
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
        <linearGradient id="kd-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0A110E" />
          <stop offset="50%" stopColor="#14211A" />
          <stop offset="100%" stopColor="#080E0B" />
        </linearGradient>

        <filter id="kd-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#000000" floodOpacity="0.55" />
        </filter>

        {animated && (
          <style>{`
            @keyframes kdPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
            .kd-pulse { animation: kdPulse 1.4s ease-in-out infinite; }
          `}</style>
        )}
      </defs>

      <rect width="540" height="400" rx="20" fill={theme === 'parchment' ? '#FAFAF7' : theme === 'neutral' ? '#222F29' : 'url(#kd-bg)'} />

      {/* Main KDS Monitor Outer Casing */}
      <g transform="translate(35, 35)" filter="url(#kd-shadow)">
        <rect x="0" y="0" width="470" height="330" rx="14" fill="#0C1410" stroke="#2B3E32" strokeWidth="2" />
        {/* Screen */}
        <rect x="8" y="8" width="454" height="314" rx="10" fill="#111B16" />

        {/* Top Header Bar */}
        <rect x="16" y="16" width="438" height="32" rx="6" fill="#17261E" stroke="#263A2E" strokeWidth="1" />
        <circle cx="32" cy="32" r="4" fill="#34B56A" className="kd-pulse" />
        <text x="44" y="36" fill="#FAFAF7" fontSize="10" fontFamily="sans-serif" fontWeight="900">
          KDS MASTER STATION • 6 ACTIVE TICKETS
        </text>
        <text x="360" y="36" fill="#FFC928" fontSize="9" fontFamily="sans-serif" fontWeight="bold">
          100% SSE SYNC
        </text>

        {/* ── 3 KANBAN STAGE COLUMNS ── */}
        
        {/* Column 1: NEW ORDERS (Amber) */}
        <g transform="translate(16, 60)">
          <rect x="0" y="0" width="138" height="250" rx="8" fill="#15211B" stroke="#2A3D31" strokeWidth="1" />
          <rect x="0" y="0" width="138" height="26" rx="8" fill="#203326" />
          <text x="10" y="17" fill="#FFA64D" fontSize="8" fontFamily="sans-serif" fontWeight="bold">NEW (2)</text>
          
          {/* Card A */}
          <rect x="8" y="34" width="122" height="95" rx="6" fill="#1C2D23" stroke="#FFA64D" strokeWidth="1" />
          <text x="14" y="50" fill="#FFFFFF" fontSize="8" fontFamily="sans-serif" fontWeight="bold">Table #04 • Dine-In</text>
          <text x="14" y="64" fill="#FFA64D" fontSize="7" fontFamily="sans-serif">⏱ Just now</text>
          <text x="14" y="80" fill="#D3DED9" fontSize="7.5" fontFamily="sans-serif">2x Paneer Tikka</text>
          <text x="14" y="94" fill="#D3DED9" fontSize="7.5" fontFamily="sans-serif">1x Dal Makhani</text>
          <rect x="14" y="104" width="110" height="16" rx="3" fill="#E8783C" />
          <text x="69" y="115" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontFamily="sans-serif" fontWeight="bold">START COOKING</text>
        </g>

        {/* Column 2: COOKING IN PROGRESS (Orange Saffron) */}
        <g transform="translate(166, 60)">
          <rect x="0" y="0" width="138" height="250" rx="8" fill="#15211B" stroke="#2A3D31" strokeWidth="1" />
          <rect x="0" y="0" width="138" height="26" rx="8" fill="#203326" />
          <text x="10" y="17" fill="#FFC928" fontSize="8" fontFamily="sans-serif" fontWeight="bold">COOKING (3)</text>
          
          {/* Card B */}
          <rect x="8" y="34" width="122" height="95" rx="6" fill="#1C2D23" stroke="#FFC928" strokeWidth="1" />
          <text x="14" y="50" fill="#FFFFFF" fontSize="8" fontFamily="sans-serif" fontWeight="bold">Table #12 • Dine-In</text>
          <text x="14" y="64" fill="#FFC928" fontSize="7" fontFamily="sans-serif">⏱ 06:15 elapsed</text>
          <text x="14" y="80" fill="#D3DED9" fontSize="7.5" fontFamily="sans-serif">4x Butter Naan</text>
          <text x="14" y="94" fill="#D3DED9" fontSize="7.5" fontFamily="sans-serif">1x Tandoori Chaap</text>
          <rect x="14" y="104" width="110" height="16" rx="3" fill="#FFC928" />
          <text x="69" y="115" textAnchor="middle" fill="#151C19" fontSize="7" fontFamily="sans-serif" fontWeight="bold">MARK READY</text>
        </g>

        {/* Column 3: READY TO SERVE (Emerald Green) */}
        <g transform="translate(316, 60)">
          <rect x="0" y="0" width="138" height="250" rx="8" fill="#15211B" stroke="#2A3D31" strokeWidth="1" />
          <rect x="0" y="0" width="138" height="26" rx="8" fill="#203326" />
          <text x="10" y="17" fill="#34B56A" fontSize="8" fontFamily="sans-serif" fontWeight="bold">READY (1)</text>
          
          {/* Card C */}
          <rect x="8" y="34" width="122" height="95" rx="6" fill="#1E3025" stroke="#34B56A" strokeWidth="1" />
          <text x="14" y="50" fill="#FFFFFF" fontSize="8" fontFamily="sans-serif" fontWeight="bold">Table #02 • Dine-In</text>
          <text x="14" y="64" fill="#34B56A" fontSize="7" fontFamily="sans-serif">✓ Picked Up by Kabir</text>
          <text x="14" y="80" fill="#D3DED9" fontSize="7.5" fontFamily="sans-serif">2x Cold Coffee</text>
          <text x="14" y="94" fill="#D3DED9" fontSize="7.5" fontFamily="sans-serif">1x Truffle Fries</text>
          <rect x="14" y="104" width="110" height="16" rx="3" fill="#34B56A" />
          <text x="69" y="115" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontFamily="sans-serif" fontWeight="bold">SERVED TO TABLE</text>
        </g>
      </g>
    </svg>
  );
};

export default IllusKitchenDisplay;
