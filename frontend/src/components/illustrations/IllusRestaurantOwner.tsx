import React from 'react';
import type { IllustrationProps } from './types';
import { SIZE_MAP } from './types';

/**
 * IllusRestaurantOwner (Asset #1)
 * Version: 2.0.0 (Master Commercial Quality)
 * Communicates: Owner Command Center, Live RevPASH surge pricing, Table oversight.
 */
export const IllusRestaurantOwner: React.FC<IllustrationProps> = ({
  size = 'responsive',
  theme = 'emerald',
  animated = true,
  title = 'MENUQR Restaurant Owner',
  description = 'Restaurant owner commanding live operations, table tokens, and revenue via MENUQR.',
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
        <linearGradient id="own-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B120F" />
          <stop offset="50%" stopColor="#15211B" />
          <stop offset="100%" stopColor="#080D0B" />
        </linearGradient>

        <linearGradient id="own-saffron" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFA64D" />
          <stop offset="50%" stopColor="#E8783C" />
          <stop offset="100%" stopColor="#C05E2B" />
        </linearGradient>

        <linearGradient id="own-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="50%" stopColor="#FFC928" />
          <stop offset="100%" stopColor="#D4A359" />
        </linearGradient>

        <radialGradient id="own-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFC928" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#E8783C" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#151C19" stopOpacity="0" />
        </radialGradient>

        <filter id="own-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="#000000" floodOpacity="0.6" />
        </filter>

        <clipPath id="own-arch-clip">
          <path d="M 40 400 L 40 160 C 40 60, 150 25, 270 25 C 390 25, 500 60, 500 160 L 500 400 Z" />
        </clipPath>

        {animated && (
          <style>{`
            @keyframes ownFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
            @keyframes ownPulse { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
            .own-float-1 { animation: ownFloat 4.6s ease-in-out infinite; }
            .own-float-2 { animation: ownFloat 3.8s ease-in-out infinite 0.7s; }
            .own-pulse { animation: ownPulse 3s ease-in-out infinite; }
          `}</style>
        )}
      </defs>

      {/* Frame Base */}
      <rect width="540" height="400" rx="20" fill={theme === 'parchment' ? '#FAFAF7' : theme === 'neutral' ? '#222F29' : 'url(#own-bg)'} />

      {/* Architectural Heritage Background */}
      <g clipPath="url(#own-arch-clip)" opacity="0.85">
        <image href="/marketing/carousel/dynamic_surge.webp" x="20" y="20" width="500" height="380" preserveAspectRatio="xMidYMid slice" />
        <rect x="20" y="20" width="500" height="380" fill="#0B1410" opacity="0.65" />
      </g>

      {/* Heritage Gold Archway Border */}
      <path
        d="M 40 400 L 40 160 C 40 60, 150 25, 270 25 C 390 25, 500 60, 500 160 L 500 400"
        fill="none"
        stroke="#D4A359"
        strokeWidth="2.5"
        strokeDasharray="8 6"
        opacity="0.8"
      />

      {/* Overhead Brass Pendant Lantern */}
      <g transform="translate(100, 0)">
        <circle cx="20" cy="85" r="70" fill="url(#own-glow)" className="own-pulse" />
        <line x1="20" y1="0" x2="20" y2="70" stroke="#D4A359" strokeWidth="2.5" />
        <path d="M 0 70 L 40 70 L 48 88 L -8 88 Z" fill="#D4A359" stroke="#9C721A" strokeWidth="1.5" />
        <circle cx="20" cy="92" r="7" fill="#FFE580" />
      </g>

      {/* Center Character: Dignified Indian Restaurateur (Arjun) */}
      <g transform="translate(160, 70)">
        {/* Soft shadow */}
        <ellipse cx="110" cy="330" rx="90" ry="14" fill="#000000" opacity="0.75" />

        {/* Tailored Nehru Jacket in Obsidian Emerald with Gold Thread */}
        <path d="M 50 180 L 76 122 L 144 122 L 170 180 L 164 330 L 56 330 Z" fill="#14231C" stroke="#253A2F" strokeWidth="2" />
        <path d="M 94 116 L 126 116 L 130 130 L 90 130 Z" fill="#FAFAF7" stroke="#151C19" strokeWidth="1.5" />
        
        {/* Gold Piping & Buttons */}
        <line x1="110" y1="126" x2="110" y2="330" stroke="#D4A359" strokeWidth="2" />
        <circle cx="110" cy="148" r="3" fill="url(#own-gold)" stroke="#9C721A" strokeWidth="0.8" />
        <circle cx="110" cy="176" r="3" fill="url(#own-gold)" stroke="#9C721A" strokeWidth="0.8" />
        <circle cx="110" cy="204" r="3" fill="url(#own-gold)" stroke="#9C721A" strokeWidth="0.8" />
        <circle cx="110" cy="232" r="3" fill="url(#own-gold)" stroke="#9C721A" strokeWidth="0.8" />

        {/* Saffron Pocket Square */}
        <polygon points="72,185 78,172 84,185" fill="url(#own-saffron)" />

        {/* Neck */}
        <rect x="98" y="98" width="24" height="24" fill="#C68642" rx="3" />
        {/* Head */}
        <path d="M 90 62 C 90 34, 130 34, 130 62 C 130 88, 122 102, 110 102 C 98 102, 90 88, 90 62 Z" fill="#D99B5A" stroke="#151C19" strokeWidth="2" />
        {/* Pompadour Hair */}
        <path d="M 86 58 C 86 24, 106 18, 120 18 C 134 18, 138 30, 136 48 C 132 44, 124 42, 118 42 C 106 42, 96 48, 90 58 Z" fill="#18201B" />
        {/* Facial details */}
        <path d="M 97 58 C 101 56, 105 57, 108 58" fill="none" stroke="#18201B" strokeWidth="2" strokeLinecap="round" />
        <path d="M 112 58 C 115 57, 119 56, 123 58" fill="none" stroke="#18201B" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="102" cy="65" rx="2.5" ry="1.8" fill="#151C19" />
        <ellipse cx="118" cy="65" rx="2.5" ry="1.8" fill="#151C19" />
        <path d="M 110 63 L 110 74 L 114 76" fill="none" stroke="#8A4E1B" strokeWidth="1.6" strokeLinecap="round" />
        {/* Beard & Smile */}
        <path d="M 104 82 C 107 80, 113 80, 116 82" fill="none" stroke="#18201B" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 94 72 C 94 94, 102 101, 110 101 C 118 101, 126 94, 126 72 C 126 90, 118 97, 110 97 C 102 97, 94 90, 94 72 Z" fill="#1E2822" opacity="0.95" />

        {/* Arms */}
        <path d="M 52 170 C 34 195, 20 226, 16 250 C 18 258, 28 262, 34 254 C 42 234, 56 206, 68 184" fill="#14231C" stroke="#253A2F" strokeWidth="2" />
        <circle cx="24" cy="254" r="8" fill="#D99B5A" />

        <path d="M 166 170 C 184 195, 194 226, 190 262 L 168 266 C 172 234, 164 206, 150 184" fill="#14231C" stroke="#253A2F" strokeWidth="2" />
        <circle cx="180" cy="260" r="9" fill="#D99B5A" />

        {/* Modern Live Desk Tablet */}
        <g transform="translate(160, 185) rotate(-5)" filter="url(#own-shadow)">
          <rect x="0" y="0" width="104" height="142" rx="10" fill="#0C1310" stroke="#384E42" strokeWidth="2" />
          <rect x="5" y="5" width="94" height="132" rx="7" fill="#131E18" />
          {/* Header */}
          <rect x="9" y="9" width="86" height="16" rx="4" fill="#1C2C24" />
          <circle cx="18" cy="17" r="3.5" fill="#34B56A" />
          <text x="26" y="20" fill="#FAFAF7" fontSize="7" fontFamily="sans-serif" fontWeight="bold">LIVE DESK</text>
          <text x="74" y="20" fill="#34B56A" fontSize="6.5" fontFamily="sans-serif" fontWeight="bold">SSE ON</text>
          {/* Metrics */}
          <rect x="9" y="30" width="41" height="30" rx="5" fill="#0E1713" stroke="#25382E" strokeWidth="1" />
          <text x="14" y="40" fill="#758B80" fontSize="5.5" fontFamily="sans-serif">TABLES</text>
          <text x="14" y="54" fill="#FAFAF7" fontSize="12" fontFamily="sans-serif" fontWeight="900">18/24</text>
          
          <rect x="54" y="30" width="41" height="30" rx="5" fill="#0E1713" stroke="#25382E" strokeWidth="1" />
          <text x="59" y="40" fill="#758B80" fontSize="5.5" fontFamily="sans-serif">TODAY</text>
          <text x="59" y="54" fill="#FFC928" fontSize="11" fontFamily="sans-serif" fontWeight="900">₹48.2k</text>
          {/* Upward Curve */}
          <path d="M 12 76 Q 30 68, 50 62 T 90 55" fill="none" stroke="#E8783C" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="90" cy="55" r="3" fill="#FFA64D" />
          {/* Live Order Tags */}
          <rect x="9" y="90" width="86" height="18" rx="4" fill="#1A2921" stroke="#2D4236" strokeWidth="0.8" />
          <circle cx="17" cy="99" r="2.5" fill="#E8783C" />
          <text x="24" y="102" fill="#FFFFFF" fontSize="6.5" fontFamily="sans-serif" fontWeight="bold">Table #04</text>
          <text x="62" y="102" fill="#34B56A" fontSize="6" fontFamily="sans-serif" fontWeight="bold">PREPARING</text>
          
          <rect x="9" y="113" width="86" height="18" rx="4" fill="#101914" stroke="#203027" strokeWidth="0.8" />
          <circle cx="17" cy="122" r="2.5" fill="#FFC928" />
          <text x="24" y="125" fill="#C5D1CB" fontSize="6.5" fontFamily="sans-serif">Table #12</text>
          <text x="65" y="125" fill="#FFC928" fontSize="6" fontFamily="sans-serif">BILL REQ</text>
        </g>
      </g>

      {/* Floating Glassmorphic HUD 1: RevPASH Surge */}
      <g className="own-float-1" transform="translate(340, 45)" filter="url(#own-shadow)">
        <rect x="0" y="0" width="165" height="74" rx="14" fill="#15221B" stroke="#2C4235" strokeWidth="1.5" />
        <path d="M 0 14 C 0 6.27, 6.27 0, 14 0 L 151 0 C 158.73 0, 165 6.27, 165 14 L 165 17 L 0 17 Z" fill="url(#own-saffron)" />
        <circle cx="28" cy="45" r="14" fill="#24372D" />
        <path d="M 21 49 L 26 42 L 30 45 L 35 39" fill="none" stroke="#34B56A" strokeWidth="2.5" strokeLinecap="round" />
        <text x="50" y="38" fill="#8FA69B" fontSize="8.5" fontFamily="sans-serif" fontWeight="bold">WEEKEND SURGE</text>
        <text x="50" y="60" fill="#FAFAF7" fontSize="20" fontFamily="sans-serif" fontWeight="900">+24% <tspan fill="#34B56A" fontSize="13">RevPASH</tspan></text>
      </g>

      {/* Floating Glassmorphic HUD 2: Digital Table Standee */}
      <g className="own-float-2" transform="translate(30, 260)" filter="url(#own-shadow)">
        <rect x="0" y="0" width="150" height="98" rx="14" fill="#131F19" stroke="#293E32" strokeWidth="1.5" />
        <rect x="0" y="0" width="150" height="26" rx="14" fill="#1A2B22" />
        <circle cx="16" cy="13" r="3.5" fill="#34B56A" />
        <text x="28" y="17" fill="#FAFAF7" fontSize="8.5" fontFamily="sans-serif" fontWeight="bold">DIGITAL TABLE TOKEN</text>
        {/* QR silhouette */}
        <rect x="14" y="36" width="34" height="46" rx="4" fill="#0A100D" stroke="#D4A359" strokeWidth="1" />
        <rect x="18" y="40" width="26" height="26" fill="#FAFAF7" rx="2" />
        <rect x="21" y="43" width="7" height="7" fill="#151C19" />
        <rect x="34" y="43" width="6" height="6" fill="#151C19" />
        <rect x="21" y="56" width="6" height="6" fill="#151C19" />
        <circle cx="31" cy="53" r="2.5" fill="#E8783C" />
        <text x="31" y="76" textAnchor="middle" fill="#D4A359" fontSize="5.5" fontFamily="sans-serif" fontWeight="bold">TABLE 01</text>
        {/* Text */}
        <text x="56" y="48" fill="#8FA69B" fontSize="7.5" fontFamily="sans-serif">Zero-App Scan</text>
        <text x="56" y="64" fill="#34B56A" fontSize="10.5" fontFamily="sans-serif" fontWeight="bold">✓ Active Session</text>
        <text x="56" y="78" fill="#C5D1CB" fontSize="8" fontFamily="sans-serif">Token <tspan fill="#FFC928" fontWeight="bold">#024</tspan> · Dine-In</text>
      </g>
    </svg>
  );
};

export default IllusRestaurantOwner;
