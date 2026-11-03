import React from 'react';
import type { IllustrationProps } from './types';
import { SIZE_MAP } from './types';

/**
 * IllusWaiterOrder (Asset #2)
 * Communicates: Waiter Taking Orders, Wireless handheld token device, Table Service Coordination.
 */
export const IllusWaiterOrder: React.FC<IllustrationProps> = ({
  size = 'responsive',
  theme = 'emerald',
  animated = true,
  title = 'MENUQR Waiter Taking Orders',
  description = 'Waiter taking dining orders at a table using a wireless handheld token terminal.',
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
        <linearGradient id="wo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B120F" />
          <stop offset="60%" stopColor="#14211A" />
          <stop offset="100%" stopColor="#09100D" />
        </linearGradient>

        <linearGradient id="wo-saffron" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFA64D" />
          <stop offset="60%" stopColor="#E8783C" />
          <stop offset="100%" stopColor="#B34C1A" />
        </linearGradient>

        <filter id="wo-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#000000" floodOpacity="0.5" />
        </filter>

        <clipPath id="wo-clip">
          <rect x="20" y="20" width="500" height="360" rx="16" />
        </clipPath>

        {animated && (
          <style>{`
            @keyframes woFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
            @keyframes woBeam { 0% { stroke-dashoffset: 60; } 100% { stroke-dashoffset: 0; } }
            .wo-float-1 { animation: woFloat 4.2s ease-in-out infinite; }
            .wo-float-2 { animation: woFloat 3.6s ease-in-out infinite 0.6s; }
            .wo-beam { stroke-dasharray: 8 6; animation: woBeam 1.8s linear infinite; }
          `}</style>
        )}
      </defs>

      <rect width="540" height="400" rx="20" fill={theme === 'parchment' ? '#FAFAF7' : theme === 'neutral' ? '#222F29' : 'url(#wo-bg)'} />

      {/* Atmospheric Restaurant Background */}
      <g clipPath="url(#wo-clip)" opacity="0.8">
        <image href="/marketing/carousel/whatsapp_kot.webp" x="20" y="20" width="500" height="360" preserveAspectRatio="xMidYMid slice" />
        <rect x="20" y="20" width="500" height="360" fill="#0A130F" opacity="0.72" />
      </g>

      {/* Frame border */}
      <rect x="20" y="20" width="500" height="360" rx="16" fill="none" stroke="#2B4035" strokeWidth="1.5" />

      {/* Table & Serving Setup */}
      <g transform="translate(60, 240)">
        <ellipse cx="140" cy="90" rx="130" ry="32" fill="#18241E" stroke="#3A5345" strokeWidth="2" />
        <ellipse cx="140" cy="85" rx="120" ry="26" fill="#121D17" />
        {/* Table Standee on Table */}
        <rect x="80" y="40" width="28" height="38" rx="3" fill="#0E1612" stroke="#D4A359" strokeWidth="1" />
        <rect x="84" y="44" width="20" height="20" fill="#FAFAF7" rx="1" />
        <text x="94" y="74" textAnchor="middle" fill="#D4A359" fontSize="4.5" fontFamily="sans-serif" fontWeight="bold">TABLE 08</text>
        {/* Gourmet Plate with Cloche */}
        <ellipse cx="170" cy="80" rx="32" ry="12" fill="#FAFAF7" stroke="#2B3D33" strokeWidth="1" />
        <path d="M 148 76 C 148 58, 192 58, 192 76 Z" fill="#D4A359" stroke="#9C721A" strokeWidth="1" />
        <circle cx="170" cy="56" r="3.5" fill="#FFE066" />
      </g>

      {/* Waiter Character Silhouette with Modern Uniform */}
      <g transform="translate(230, 80)">
        <ellipse cx="80" cy="310" rx="60" ry="12" fill="#000000" opacity="0.6" />
        {/* Uniform Apron over Oxford Shirt */}
        <path d="M 40 160 L 58 116 L 102 116 L 120 160 L 116 305 L 44 305 Z" fill="#FAFAF7" stroke="#151C19" strokeWidth="1.8" />
        {/* Bistro Apron with Ties */}
        <path d="M 46 168 L 114 168 L 110 305 L 50 305 Z" fill="#16251E" stroke="#2A3F33" strokeWidth="1.5" />
        <line x1="56" y1="190" x2="104" y2="190" stroke="#34B56A" strokeWidth="1.5" />
        {/* Head & Friendly Waiter Features */}
        <rect x="72" y="96" width="16" height="20" fill="#C68642" rx="2" />
        <path d="M 64 64 C 64 38, 96 38, 96 64 C 96 86, 90 98, 80 98 C 70 98, 64 86, 64 64 Z" fill="#D99B5A" stroke="#151C19" strokeWidth="1.8" />
        <path d="M 62 60 C 62 30, 78 24, 90 24 C 98 24, 100 32, 98 46 C 96 42, 90 40, 84 40 C 74 40, 66 46, 62 60 Z" fill="#18201B" />
        {/* Smile & Gaze */}
        <ellipse cx="73" cy="65" rx="2" ry="1.5" fill="#151C19" />
        <ellipse cx="87" cy="65" rx="2" ry="1.5" fill="#151C19" />
        <path d="M 75 78 C 78 82, 82 82, 85 78" fill="none" stroke="#7A4513" strokeWidth="1.8" strokeLinecap="round" />

        {/* Handheld Ordering Terminal in Hand */}
        <g transform="translate(18, 175) rotate(-10)">
          <rect x="0" y="0" width="46" height="74" rx="6" fill="#0C1310" stroke="#34B56A" strokeWidth="1.5" filter="url(#wo-shadow)" />
          <rect x="3" y="3" width="40" height="68" rx="4" fill="#13211A" />
          <rect x="6" y="6" width="34" height="10" rx="2" fill="#1C3026" />
          <text x="9" y="13" fill="#34B56A" fontSize="4.5" fontFamily="sans-serif" fontWeight="bold">TBL 08 • TKN #12</text>
          {/* Order items list */}
          <line x1="6" y1="22" x2="36" y2="22" stroke="#FAFAF7" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="6" y1="28" x2="30" y2="28" stroke="#8FA69B" strokeWidth="1" strokeLinecap="round" />
          <line x1="6" y1="34" x2="34" y2="34" stroke="#FAFAF7" strokeWidth="1.2" strokeLinecap="round" />
          {/* Action button */}
          <rect x="6" y="52" width="34" height="14" rx="3" fill="#E8783C" />
          <text x="12" y="61" fill="#FFFFFF" fontSize="5" fontFamily="sans-serif" fontWeight="bold">SEND KOT ➔</text>
        </g>
      </g>

      {/* Wireless Stream Line from Waiter Terminal to Kitchen */}
      <path d="M 270 260 C 330 220, 370 190, 420 140" fill="none" stroke="#34B56A" strokeWidth="2.5" className="wo-beam" />

      {/* Floating HUD 1: Order Ticket Streaming */}
      <g className="wo-float-1" transform="translate(340, 50)" filter="url(#wo-shadow)">
        <rect x="0" y="0" width="160" height="78" rx="12" fill="#14211A" stroke="#2D4236" strokeWidth="1.5" />
        <rect x="0" y="0" width="160" height="22" rx="12" fill="#1D3025" />
        <circle cx="14" cy="11" r="3.5" fill="#34B56A" />
        <text x="24" y="15" fill="#FAFAF7" fontSize="8" fontFamily="sans-serif" fontWeight="bold">INSTANT KOT TRANSMIT</text>
        <text x="14" y="38" fill="#C5D1CB" fontSize="7.5" fontFamily="sans-serif">Table #08 · Round 01</text>
        <text x="14" y="52" fill="#FFC928" fontSize="10" fontFamily="sans-serif" fontWeight="900">2x Paneer Tikka + Dal</text>
        <text x="14" y="67" fill="#8FA69B" fontSize="7" fontFamily="sans-serif">Zero-Misplacement Guaranteed</text>
      </g>

      {/* Floating HUD 2: Live Token Counter */}
      <g className="wo-float-2" transform="translate(30, 60)" filter="url(#wo-shadow)">
        <rect x="0" y="0" width="130" height="65" rx="12" fill="#121D17" stroke="#273C30" strokeWidth="1.5" />
        <text x="14" y="24" fill="#8FA69B" fontSize="8" fontFamily="sans-serif" fontWeight="bold">LIVE TOKEN</text>
        <text x="14" y="48" fill="#34B56A" fontSize="22" fontFamily="sans-serif" fontWeight="900">#012</text>
        <text x="70" y="46" fill="#C5D1CB" fontSize="8" fontFamily="sans-serif">Active Diners</text>
      </g>
    </svg>
  );
};

export default IllusWaiterOrder;
