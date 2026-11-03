import React from 'react';
import type { IllustrationProps } from './types';
import { SIZE_MAP } from './types';

/**
 * IllusSalesAnalytics (Asset #9)
 * Communicates: Actionable Culinary Analytics, Revenue Trajectory, Scans vs Views.
 */
export const IllusSalesAnalytics: React.FC<IllustrationProps> = ({
  size = 'responsive',
  theme = 'emerald',
  animated = true,
  title = 'MENUQR Sales Analytics',
  description = 'Sales and traffic analytics dashboard showing revenue growth curve and scan metrics.',
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
        <linearGradient id="sa-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B120F" />
          <stop offset="50%" stopColor="#14211A" />
          <stop offset="100%" stopColor="#070D0A" />
        </linearGradient>

        <linearGradient id="sa-curve" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#E8783C" stopOpacity="0" />
          <stop offset="100%" stopColor="#E8783C" stopOpacity="0.4" />
        </linearGradient>

        <filter id="sa-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#000000" floodOpacity="0.5" />
        </filter>

        {animated && (
          <style>{`
            @keyframes saDraw { 0% { stroke-dashoffset: 240; } 100% { stroke-dashoffset: 0; } }
            @keyframes saPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
            .sa-line { stroke-dasharray: 240; animation: saDraw 3s ease-out infinite alternate; }
            .sa-dot { animation: saPulse 2s ease-in-out infinite; transform-origin: center; }
          `}</style>
        )}
      </defs>

      <rect width="540" height="400" rx="20" fill={theme === 'parchment' ? '#FAFAF7' : theme === 'neutral' ? '#222F29' : 'url(#sa-bg)'} />

      {/* Main Analytics Dashboard Card */}
      <g transform="translate(35, 35)" filter="url(#sa-shadow)">
        <rect x="0" y="0" width="470" height="330" rx="14" fill="#111B16" stroke="#283C30" strokeWidth="2" />

        {/* Header */}
        <rect x="16" y="16" width="438" height="34" rx="6" fill="#17261E" />
        <text x="30" y="38" fill="#FAFAF7" fontSize="11" fontFamily="sans-serif" fontWeight="900">
          PERFORMANCE INSIGHTS • LAST 30 DAYS
        </text>
        <text x="360" y="37" fill="#E8783C" fontSize="8.5" fontFamily="sans-serif" fontWeight="bold">
          +32.4% VS LAST MONTH
        </text>

        {/* 4 KPI Cards */}
        <g transform="translate(16, 62)">
          <rect x="0" y="0" width="102" height="60" rx="6" fill="#16231C" stroke="#25382D" strokeWidth="1" />
          <text x="10" y="18" fill="#758B80" fontSize="7" fontFamily="sans-serif">MENU SCANS</text>
          <text x="10" y="42" fill="#FAFAF7" fontSize="18" fontFamily="sans-serif" fontWeight="900">14,280</text>

          <rect x="112" y="0" width="102" height="60" rx="6" fill="#16231C" stroke="#25382D" strokeWidth="1" />
          <text x="10" y="18" fill="#758B80" fontSize="7" fontFamily="sans-serif">DIRECT VIEWS</text>
          <text x="122" y="42" fill="#34B56A" fontSize="18" fontFamily="sans-serif" fontWeight="900">8,940</text>

          <rect x="224" y="0" width="102" height="60" rx="6" fill="#16231C" stroke="#25382D" strokeWidth="1" />
          <text x="10" y="18" fill="#758B80" fontSize="7" fontFamily="sans-serif">TABLE ORDERS</text>
          <text x="234" y="42" fill="#FFC928" fontSize="18" fontFamily="sans-serif" fontWeight="900">1,420</text>

          <rect x="336" y="0" width="102" height="60" rx="6" fill="#16231C" stroke="#25382D" strokeWidth="1" />
          <text x="10" y="18" fill="#758B80" fontSize="7" fontFamily="sans-serif">NET REVENUE</text>
          <text x="346" y="42" fill="#FFA64D" fontSize="17" fontFamily="sans-serif" fontWeight="900">₹8.42L</text>
        </g>

        {/* Ascending Growth Trajectory Chart */}
        <g transform="translate(16, 136)">
          <rect x="0" y="0" width="438" height="175" rx="8" fill="#141F1A" stroke="#23352A" strokeWidth="1" />
          
          {/* Grid lines */}
          <line x1="20" y1="40" x2="418" y2="40" stroke="#1E2F26" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="20" y1="80" x2="418" y2="80" stroke="#1E2F26" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="20" y1="120" x2="418" y2="120" stroke="#1E2F26" strokeWidth="1" strokeDasharray="3 3" />

          {/* Area fill */}
          <path
            d="M 20 145 Q 80 135, 140 110 T 260 70 T 360 40 T 418 25 L 418 150 L 20 150 Z"
            fill="url(#sa-curve)"
          />

          {/* Main Trajectory Curve */}
          <path
            d="M 20 145 Q 80 135, 140 110 T 260 70 T 360 40 T 418 25"
            fill="none"
            stroke="#E8783C"
            strokeWidth="3.5"
            strokeLinecap="round"
            className="sa-line"
          />

          {/* Saffron Glowing Peak Dot */}
          <circle cx="418" cy="25" r="5" fill="#FFC928" className="sa-dot" />

          {/* X-Axis Day labels */}
          <text x="20" y="165" fill="#667C72" fontSize="7" fontFamily="sans-serif">Day 01</text>
          <text x="110" y="165" fill="#667C72" fontSize="7" fontFamily="sans-serif">Day 08</text>
          <text x="210" y="165" fill="#667C72" fontSize="7" fontFamily="sans-serif">Day 15</text>
          <text x="310" y="165" fill="#667C72" fontSize="7" fontFamily="sans-serif">Day 22</text>
          <text x="400" y="165" fill="#667C72" fontSize="7" fontFamily="sans-serif">Day 30</text>
        </g>
      </g>
    </svg>
  );
};

export default IllusSalesAnalytics;
