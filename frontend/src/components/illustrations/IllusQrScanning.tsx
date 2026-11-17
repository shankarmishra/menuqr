import React from 'react';
import type { IllustrationProps } from './types';
import { SIZE_MAP } from './types';

/**
 * IllusQrScanning (v3.0.0 Editorial Masterpiece)
 * Feature: Zero-App Table QR Scanning & Holographic AR Menu
 * Style: Direction A — Modern Luxury Editorial Vector
 */
export const IllusQrScanning: React.FC<IllustrationProps> = ({
  size = 'responsive',
  theme = 'emerald',
  animated = true,
  title = 'MENUQR Table Scanning — Frictionless Guest Discovery',
  description = 'Smartphone scanning an authentic walnut and brushed brass table standee, unlocking an interactive digital dining menu instantly without any app download.',
  className = '',
  style,
  ...rest
}) => {
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.responsive;
  const isParchment = theme === 'parchment';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 640 440"
      width={sizeConfig.width}
      height={sizeConfig.height}
      className={`select-none ${sizeConfig.className || ''} ${className}`}
      style={style}
      role="img"
      aria-label={title}
      {...rest}
    >
      <title>{title}</title>
      <desc>{description}</desc>

      <defs>
        {/* Gradients */}
        <linearGradient id="qs-v3-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isParchment ? '#FFFDF8' : '#070D0A'} />
          <stop offset="50%" stopColor={isParchment ? '#F4EFE6' : '#0F1813'} />
          <stop offset="100%" stopColor={isParchment ? '#E8DFCE' : '#060A08'} />
        </linearGradient>

        <linearGradient id="qs-v3-laser" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0" />
          <stop offset="40%" stopColor="#10B981" stopOpacity="0.8" />
          <stop offset="60%" stopColor="#34D399" stopOpacity="1" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </linearGradient>

        <filter id="qs-v3-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#000000" floodOpacity={isParchment ? 0.15 : 0.6} />
        </filter>

        <clipPath id="qs-v3-clip">
          <rect x="0" y="0" width="640" height="440" rx="20" />
        </clipPath>

        {animated && (
          <style>{`
            @keyframes qsSweep { 0% { transform: translateY(0); opacity: 0.2; } 50% { opacity: 0.9; } 100% { transform: translateY(140px); opacity: 0.2; } }
            @keyframes qsPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.1); } }
            @keyframes qsFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
            .qs-laser-beam { animation: qsSweep 2.2s ease-in-out infinite alternate; }
            .qs-live-pulse { transform-origin: 16px 13px; animation: qsPulse 1.8s ease-in-out infinite; }
            .qs-float-badge { animation: qsFloat 4s ease-in-out infinite; }
          `}</style>
        )}
      </defs>

      {/* Frame Background Canvas */}
      <rect width="640" height="440" rx="20" fill="url(#qs-v3-bg)" />

      {/* Pure Vector Artwork Layer */}
      <g clipPath="url(#qs-v3-clip)" style={{ filter: isParchment ? 'contrast(1.05) brightness(1.15) sepia(0.08)' : undefined }}>
        <image
          href="/illustrations/editorial/illus-qr-scanning-vector.svg"
          x="0"
          y="0"
          width="640"
          height="440"
          preserveAspectRatio="xMidYMid slice"
        />
      </g>

      {/* Laser Scan Sweep Effect */}
      {animated && (
        <g clipPath="url(#qs-v3-clip)" opacity="0.75">
          <rect x="180" y="140" width="280" height="4" fill="url(#qs-v3-laser)" className="qs-laser-beam" />
        </g>
      )}

      {/* Elegant Border */}
      <rect
        x="1.5"
        y="1.5"
        width="637"
        height="437"
        rx="18.5"
        fill="none"
        stroke={isParchment ? '#D4AF37' : '#1D3B2E'}
        strokeWidth="1.5"
        opacity={0.7}
      />

      {/* Floating HUD: Instant Session Unlocked */}
      <g className="qs-float-badge" transform="translate(370, 24)" filter="url(#qs-v3-shadow)">
        <rect
          x="0"
          y="0"
          width="246"
          height="82"
          rx="12"
          fill={isParchment ? '#FFFFFF' : '#0B1712'}
          stroke={isParchment ? '#D4AF37' : '#10B981'}
          strokeWidth="1.2"
        />
        <rect x="0" y="0" width="246" height="26" rx="12" fill={isParchment ? '#F4EFE6' : '#14291F'} />
        
        {/* Pulsing Green Indicator */}
        <circle cx="16" cy="13" r="4" fill="#10B981" className="qs-live-pulse" />
        <text
          x="28"
          y="17"
          fill={isParchment ? '#182E23' : '#E8F5E9'}
          fontSize="9.5"
          fontFamily="system-ui, sans-serif"
          fontWeight="700"
          letterSpacing="0.05em"
        >
          ZERO-APP INSTANT SCAN
        </text>
        <text
          x="202"
          y="17"
          fill="#10B981"
          fontSize="8.5"
          fontFamily="system-ui, sans-serif"
          fontWeight="800"
        >
          &lt; 200ms
        </text>

        {/* Scan Details */}
        <text
          x="14"
          y="44"
          fill={isParchment ? '#182E23' : '#F5EFE6'}
          fontSize="10"
          fontFamily="system-ui, sans-serif"
          fontWeight="700"
        >
          Table #04 Dine-In Menu Active
        </text>
        <text
          x="14"
          y="62"
          fill={isParchment ? '#524336' : '#9EBAAC'}
          fontSize="9.5"
          fontFamily="system-ui, sans-serif"
        >
          Multi-guest ordering &bull; Direct kitchen KOT sync
        </text>
      </g>

      {/* Floating HUD: Walnut QR Standee Verified */}
      <g transform="translate(24, 24)" filter="url(#qs-v3-shadow)">
        <rect
          x="0"
          y="0"
          width="170"
          height="48"
          rx="10"
          fill={isParchment ? '#FFFFFF' : '#0B1712'}
          stroke={isParchment ? '#D4AF37' : '#233E31'}
          strokeWidth="1.2"
        />
        <text
          x="12"
          y="20"
          fill={isParchment ? '#7C6752' : '#8FA89B'}
          fontSize="8.5"
          fontFamily="system-ui, sans-serif"
          fontWeight="700"
          letterSpacing="0.06em"
        >
          SMART TABLE HARDWARE
        </text>
        <text
          x="12"
          y="37"
          fill={isParchment ? '#182E23' : '#FFFFFF'}
          fontSize="12"
          fontFamily="system-ui, sans-serif"
          fontWeight="700"
        >
          Walnut &amp; Brass Standee
        </text>
      </g>
    </svg>
  );
};

export default IllusQrScanning;
