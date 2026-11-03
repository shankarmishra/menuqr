import React from 'react';
import type { IllustrationProps } from './types';
import { SIZE_MAP } from './types';

/**
 * IllusQrScanning (Asset #4)
 * Communicates: Zero-App Table QR Scanning, Instant Menu Render, Laser Recognition.
 */
export const IllusQrScanning: React.FC<IllustrationProps> = ({
  size = 'responsive',
  theme = 'emerald',
  animated = true,
  title = 'MENUQR Table Scanning',
  description = 'Diner scanning an authentic table QR standee with smartphone camera.',
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
        <linearGradient id="qs-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B120F" />
          <stop offset="50%" stopColor="#132019" />
          <stop offset="100%" stopColor="#080E0B" />
        </linearGradient>

        <linearGradient id="qs-laser" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E8783C" stopOpacity="0" />
          <stop offset="30%" stopColor="#E8783C" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#FFC928" stopOpacity="1" />
          <stop offset="70%" stopColor="#34B56A" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#34B56A" stopOpacity="0" />
        </linearGradient>

        <filter id="qs-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="#000000" floodOpacity="0.55" />
        </filter>

        <clipPath id="qs-clip">
          <rect x="20" y="20" width="500" height="360" rx="16" />
        </clipPath>

        {animated && (
          <style>{`
            @keyframes qsScan { 0% { transform: translateY(0); opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { transform: translateY(130px); opacity: 0; } }
            @keyframes qsFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
            .qs-laser { animation: qsScan 2.4s ease-in-out infinite; }
            .qs-float-1 { animation: qsFloat 4.2s ease-in-out infinite; }
            .qs-float-2 { animation: qsFloat 3.6s ease-in-out infinite 0.7s; }
          `}</style>
        )}
      </defs>

      <rect width="540" height="400" rx="20" fill={theme === 'parchment' ? '#FAFAF7' : theme === 'neutral' ? '#222F29' : 'url(#qs-bg)'} />

      {/* Real Dining Table & Standee Background */}
      <g clipPath="url(#qs-clip)" opacity="0.8">
        <image href="/marketing/carousel/walnut_standee.webp" x="20" y="20" width="500" height="360" preserveAspectRatio="xMidYMid slice" />
        <rect x="20" y="20" width="500" height="360" fill="#09130F" opacity="0.7" />
      </g>

      <rect x="20" y="20" width="500" height="360" rx="16" fill="none" stroke="#2B4034" strokeWidth="1.5" />

      {/* Central Table Standee with Real QR Code */}
      <g transform="translate(195, 65)" filter="url(#qs-shadow)">
        {/* Walnut Wood Base */}
        <polygon points="5,230 145,230 135,248 15,248" fill="#2C1B10" stroke="#D4A359" strokeWidth="1.5" />
        {/* Acrylic Standee Plate */}
        <rect x="15" y="10" width="120" height="220" rx="10" fill="#111B16" stroke="#D4A359" strokeWidth="2" />
        {/* Header */}
        <rect x="25" y="20" width="100" height="20" rx="4" fill="#0C1310" />
        <text x="75" y="33" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontFamily="sans-serif" fontWeight="900">
          Menus<tspan fill="#E8783C">QR</tspan>
        </text>
        {/* White Matte QR Plaque */}
        <rect x="25" y="48" width="100" height="100" rx="6" fill="#FAFAF7" />
        {/* Real Center Scannable QR Matrix Illustration */}
        <rect x="33" y="56" width="22" height="22" fill="#151C19" rx="2" />
        <rect x="36" y="59" width="16" height="16" fill="#FAFAF7" rx="1" />
        <rect x="39" y="62" width="10" height="10" fill="#151C19" />

        <rect x="95" y="56" width="22" height="22" fill="#151C19" rx="2" />
        <rect x="98" y="59" width="16" height="16" fill="#FAFAF7" rx="1" />
        <rect x="101" y="62" width="10" height="10" fill="#151C19" />

        <rect x="33" y="118" width="22" height="22" fill="#151C19" rx="2" />
        <rect x="36" y="121" width="16" height="16" fill="#FAFAF7" rx="1" />
        <rect x="39" y="124" width="10" height="10" fill="#151C19" />

        {/* Center Brand Mark Dot */}
        <circle cx="75" cy="98" r="6" fill="#E8783C" />
        <circle cx="75" cy="98" r="3" fill="#FAFAF7" />

        {/* Laser Sweep Beam */}
        <g className="qs-laser" transform="translate(18, 50)">
          <line x1="0" y1="0" x2="114" y2="0" stroke="url(#qs-laser)" strokeWidth="3" />
          <circle cx="57" cy="0" r="2.5" fill="#FFFFFF" />
        </g>

        {/* Table Number & Callout */}
        <text x="75" y="170" textAnchor="middle" fill="#D4A359" fontSize="8" fontFamily="sans-serif" fontWeight="bold">TABLE 04</text>
        <text x="75" y="184" textAnchor="middle" fill="#8FA69B" fontSize="6.5" fontFamily="sans-serif">Camera Scan • Zero App</text>
      </g>

      {/* Floating Smartphone Frame scanning in foreground */}
      <g transform="translate(40, 95)" filter="url(#qs-shadow)">
        <rect x="0" y="0" width="115" height="195" rx="14" fill="#0E1612" stroke="#3A5344" strokeWidth="2" />
        <rect x="4" y="4" width="107" height="187" rx="10" fill="#15241C" />
        {/* Phone Camera Viewfinder Screen */}
        <path d="M 20 40 L 30 40 M 20 40 L 20 50" stroke="#E8783C" strokeWidth="2" strokeLinecap="round" />
        <path d="M 95 40 L 85 40 M 95 40 L 95 50" stroke="#E8783C" strokeWidth="2" strokeLinecap="round" />
        <path d="M 20 120 L 30 120 M 20 120 L 20 110" stroke="#34B56A" strokeWidth="2" strokeLinecap="round" />
        <path d="M 95 120 L 85 120 M 95 120 L 95 110" stroke="#34B56A" strokeWidth="2" strokeLinecap="round" />
        {/* Safari / Chrome Push Notification Banner */}
        <g transform="translate(8, 140)">
          <rect x="0" y="0" width="99" height="38" rx="6" fill="#1C2F25" stroke="#324B3C" strokeWidth="1" />
          <circle cx="12" cy="19" r="4.5" fill="#E8783C" />
          <text x="22" y="16" fill="#FAFAF7" fontSize="5.5" fontFamily="sans-serif" fontWeight="bold">Open in Safari</text>
          <text x="22" y="26" fill="#8FA69B" fontSize="5" fontFamily="sans-serif">menuqr.in/menu/dhaba</text>
        </g>
      </g>

      {/* Floating HUD 1: Instant Menu Unlocked */}
      <g className="qs-float-1" transform="translate(350, 60)" filter="url(#qs-shadow)">
        <rect x="0" y="0" width="155" height="78" rx="14" fill="#15221B" stroke="#2E4537" strokeWidth="1.5" />
        <circle cx="20" cy="20" r="5" fill="#34B56A" />
        <text x="32" y="24" fill="#34B56A" fontSize="9" fontFamily="sans-serif" fontWeight="bold">FAST 40ms UNLOCK</text>
        <text x="16" y="46" fill="#FAFAF7" fontSize="13" fontFamily="sans-serif" fontWeight="900">Zero App Needed</text>
        <text x="16" y="62" fill="#8FA69B" fontSize="7.5" fontFamily="sans-serif">Direct browser navigation</text>
      </g>

      {/* Floating HUD 2: Permanent QR Guarantee */}
      <g className="qs-float-2" transform="translate(360, 260)" filter="url(#qs-shadow)">
        <rect x="0" y="0" width="145" height="68" rx="12" fill="#141E1A" stroke="#2B3F32" strokeWidth="1.5" />
        <text x="14" y="24" fill="#8FA69B" fontSize="7.5" fontFamily="sans-serif" fontWeight="bold">LIFETIME STANDEE</text>
        <text x="14" y="44" fill="#FFC928" fontSize="15" fontFamily="sans-serif" fontWeight="900">Never Reprint</text>
        <text x="14" y="58" fill="#C5D1CB" fontSize="7" fontFamily="sans-serif">Update dishes anytime</text>
      </g>
    </svg>
  );
};

export default IllusQrScanning;
