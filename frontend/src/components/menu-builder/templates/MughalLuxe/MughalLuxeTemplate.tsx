import React, { useState } from 'react';
import clsx from 'clsx';
import type { LayoutProps, MenuItem } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../shared/RenderItemPrices';

// --- AUTHENTIC HERITAGE CURATED PHOTOGRAPHY ---
// High quality Unsplash imagery for Indian luxury cuisine
const DEFAULT_HERITAGE_IMAGES = {
  curries: [
    'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80', // Velvet Butter Chicken / Curry
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80', // Dal Makhani Clay Pot
    'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80', // Paneer Tikka Masala
  ],
  mains: [
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80', // Royal Dum Biryani
    'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&auto=format&fit=crop&q=80', // Seekh Kebab Platter
    'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80', // Tandoori Naan Roti
  ],
};

// --- ORNAMENTAL ASSET: LOTUS CORNER FLOWER ---
// Intricate 16-petal royal Indian lotus with gold filigree veins and amber core
export const LotusCorner: React.FC<{
  className?: string;
  size?: number;
  rotation?: number;
}> = ({ className = '', size = 52, rotation = 0 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={clsx('pointer-events-none select-none transition-transform filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)]', className)}
    style={{ transform: `rotate(${rotation}deg)` }}
    aria-hidden="true"
  >
    <defs>
      <radialGradient id="lotusCenterGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFF2D1" />
        <stop offset="40%" stopColor="#E5B242" />
        <stop offset="85%" stopColor="#A9781E" />
        <stop offset="100%" stopColor="#6E4A0C" />
      </radialGradient>
      <linearGradient id="lotusPetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="60%" stopColor="#FBF5E9" />
        <stop offset="100%" stopColor="#EBD69A" />
      </linearGradient>
    </defs>

    {/* Outermost Layer: 4 Cardinal Blossoming Petals */}
    <path
      d="M32 2 C36 16 52 20 62 32 C52 44 36 48 32 62 C28 48 12 44 2 32 C12 20 28 16 32 2 Z"
      fill="url(#lotusPetalGrad)"
      stroke="#D7B66D"
      strokeWidth="1.2"
    />
    {/* Outer Layer Gold Vein Lines */}
    <line x1="32" y1="4" x2="32" y2="24" stroke="#A9823E" strokeWidth="0.8" opacity="0.75" />
    <line x1="4" y1="32" x2="24" y2="32" stroke="#A9823E" strokeWidth="0.8" opacity="0.75" />
    <line x1="60" y1="32" x2="40" y2="32" stroke="#A9823E" strokeWidth="0.8" opacity="0.75" />
    <line x1="32" y1="60" x2="32" y2="40" stroke="#A9823E" strokeWidth="0.8" opacity="0.75" />

    {/* Secondary Layer: 4 Diagonal Blossoming Petals */}
    <path
      d="M32 9 C40 19 49 23 55 32 C49 41 40 45 32 55 C24 45 15 41 9 32 C15 23 24 19 32 9 Z"
      fill="#FFFDF7"
      stroke="#C9A967"
      strokeWidth="1"
    />
    <line x1="16" y1="16" x2="26" y2="26" stroke="#C9A967" strokeWidth="0.6" opacity="0.6" />
    <line x1="48" y1="16" x2="38" y2="26" stroke="#C9A967" strokeWidth="0.6" opacity="0.6" />
    <line x1="16" y1="48" x2="26" y2="38" stroke="#C9A967" strokeWidth="0.6" opacity="0.6" />
    <line x1="48" y1="48" x2="38" y2="38" stroke="#C9A967" strokeWidth="0.6" opacity="0.6" />

    {/* Tertiary Inner Petals */}
    <path
      d="M32 17 C37 23 44 26 48 32 C44 38 37 41 32 47 C27 41 20 38 16 32 C20 26 27 23 32 17 Z"
      fill="#FBF5E9"
      stroke="#D7B66D"
      strokeWidth="0.8"
    />

    {/* 8 Pearl Stamens around center core */}
    <circle cx="32" cy="24" r="1.2" fill="#EBD69A" />
    <circle cx="38" cy="26" r="1.2" fill="#EBD69A" />
    <circle cx="40" cy="32" r="1.2" fill="#EBD69A" />
    <circle cx="38" cy="38" r="1.2" fill="#EBD69A" />
    <circle cx="32" cy="40" r="1.2" fill="#EBD69A" />
    <circle cx="26" cy="38" r="1.2" fill="#EBD69A" />
    <circle cx="24" cy="32" r="1.2" fill="#EBD69A" />
    <circle cx="26" cy="26" r="1.2" fill="#EBD69A" />

    {/* Rich Golden-Amber Core Center */}
    <circle cx="32" cy="32" r="6.5" fill="url(#lotusCenterGlow)" stroke="#7D550A" strokeWidth="1" />
    <circle cx="32" cy="32" r="2.5" fill="#FFF9E6" opacity="0.9" />
  </svg>
);

// --- ORNAMENTAL ASSET: ORNATE DIVIDER SVG ---
export const OrnateDividerSVG: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 240 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={clsx('pointer-events-none select-none w-full max-w-[200px] mx-auto', className)}
    aria-hidden="true"
  >
    <line x1="10" y1="12" x2="95" y2="12" stroke="#D7B66D" strokeWidth="1" strokeDasharray="3 2" />
    <circle cx="102" cy="12" r="2" fill="#D7B66D" />
    <path d="M120 6 L126 12 L120 18 L114 12 Z" fill="#D7B66D" />
    <circle cx="120" cy="12" r="1.5" fill="#FFF9E6" />
    <circle cx="138" cy="12" r="2" fill="#D7B66D" />
    <line x1="145" y1="12" x2="230" y2="12" stroke="#D7B66D" strokeWidth="1" strokeDasharray="3 2" />
  </svg>
);

// --- ORNAMENTAL ASSET: HANGING GOLD GARLANDS ---
// Royal chandelier garland with pearl beads, drop links, and jhumkas
export const HangingGarlandsSVG: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 280 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={clsx('pointer-events-none select-none w-full max-w-[260px] mx-auto', className)}
    aria-hidden="true"
  >
    {/* Garland 1 (Left outer - short) */}
    <g transform="translate(30, 0)">
      <line x1="0" y1="0" x2="0" y2="44" stroke="#D7B66D" strokeWidth="1.5" strokeDasharray="3 2" />
      <circle cx="0" cy="14" r="2" fill="#EBD69A" />
      <circle cx="0" cy="28" r="2.5" fill="#D7B66D" />
      <path d="M0 44 L-4 50 L0 56 L4 50 Z" fill="#EBD69A" stroke="#A9823E" strokeWidth="0.8" />
      <circle cx="0" cy="60" r="2" fill="#D7B66D" />
    </g>

    {/* Garland 2 (Mid-left - medium) */}
    <g transform="translate(80, 0)">
      <line x1="0" y1="0" x2="0" y2="64" stroke="#D7B66D" strokeWidth="1.5" strokeDasharray="3 2" />
      <circle cx="0" cy="18" r="2" fill="#EBD69A" />
      <circle cx="0" cy="36" r="2.5" fill="#D7B66D" />
      <circle cx="0" cy="54" r="2.5" fill="#EBD69A" />
      <path d="M0 64 L-5 71 L0 78 L5 71 Z" fill="#EBD69A" stroke="#A9823E" strokeWidth="0.8" />
      <circle cx="0" cy="82" r="2.2" fill="#D7B66D" />
    </g>

    {/* Garland 3 (Center - longest crest drop) */}
    <g transform="translate(140, 0)">
      <line x1="0" y1="0" x2="0" y2="76" stroke="#D7B66D" strokeWidth="1.8" strokeDasharray="3 2" />
      <circle cx="0" cy="20" r="2.5" fill="#EBD69A" />
      <circle cx="0" cy="38" r="3" fill="#D7B66D" />
      <circle cx="0" cy="58" r="3" fill="#EBD69A" />
      <path d="M0 76 L-6 84 L0 92 L6 84 Z" fill="#EBD69A" stroke="#A9823E" strokeWidth="1" />
      <circle cx="0" cy="98" r="2.5" fill="#D7B66D" />
    </g>

    {/* Garland 4 (Mid-right - medium) */}
    <g transform="translate(200, 0)">
      <line x1="0" y1="0" x2="0" y2="64" stroke="#D7B66D" strokeWidth="1.5" strokeDasharray="3 2" />
      <circle cx="0" cy="18" r="2" fill="#EBD69A" />
      <circle cx="0" cy="36" r="2.5" fill="#D7B66D" />
      <circle cx="0" cy="54" r="2.5" fill="#EBD69A" />
      <path d="M0 64 L-5 71 L0 78 L5 71 Z" fill="#EBD69A" stroke="#A9823E" strokeWidth="0.8" />
      <circle cx="0" cy="82" r="2.2" fill="#D7B66D" />
    </g>

    {/* Garland 5 (Right outer - short) */}
    <g transform="translate(250, 0)">
      <line x1="0" y1="0" x2="0" y2="44" stroke="#D7B66D" strokeWidth="1.5" strokeDasharray="3 2" />
      <circle cx="0" cy="14" r="2" fill="#EBD69A" />
      <circle cx="0" cy="28" r="2.5" fill="#D7B66D" />
      <path d="M0 44 L-4 50 L0 56 L4 50 Z" fill="#EBD69A" stroke="#A9823E" strokeWidth="0.8" />
      <circle cx="0" cy="60" r="2" fill="#D7B66D" />
    </g>
  </svg>
);

// --- ORNAMENTAL ASSET: GOLDEN LOTUS CREST ---
// Majestic royal Indian blooming lotus emblem fanning upwards
export const GoldenLotusCrestSVG: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 64,
}) => (
  <svg
    width={size}
    height={Math.round(size * 0.65)}
    viewBox="0 0 100 65"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={clsx('pointer-events-none select-none filter drop-shadow-[0_2px_8px_rgba(215,182,109,0.35)]', className)}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="crestGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF4D4" />
        <stop offset="35%" stopColor="#EBD69A" />
        <stop offset="70%" stopColor="#D7B66D" />
        <stop offset="100%" stopColor="#A9823E" />
      </linearGradient>
    </defs>
    {/* Center tall blooming petal */}
    <path
      d="M50 4 C47 20 42 36 50 50 C58 36 53 20 50 4 Z"
      fill="url(#crestGoldGrad)"
      stroke="#A9823E"
      strokeWidth="1"
    />
    {/* Inner left petal */}
    <path
      d="M50 50 C41 40 32 26 33 14 C39 24 45 36 50 50 Z"
      fill="url(#crestGoldGrad)"
      stroke="#A9823E"
      strokeWidth="1"
    />
    {/* Inner right petal */}
    <path
      d="M50 50 C59 40 68 26 67 14 C61 24 55 36 50 50 Z"
      fill="url(#crestGoldGrad)"
      stroke="#A9823E"
      strokeWidth="1"
    />
    {/* Outer left spreading petal */}
    <path
      d="M50 50 C36 44 20 34 16 25 C26 31 38 42 50 50 Z"
      fill="url(#crestGoldGrad)"
      stroke="#A9823E"
      strokeWidth="1"
    />
    {/* Outer right spreading petal */}
    <path
      d="M50 50 C64 44 80 34 84 25 C74 31 62 42 50 50 Z"
      fill="url(#crestGoldGrad)"
      stroke="#A9823E"
      strokeWidth="1"
    />
    {/* Lowermost left petal flare */}
    <path
      d="M50 50 C38 48 16 45 8 38 C18 43 32 48 50 50 Z"
      fill="url(#crestGoldGrad)"
      stroke="#A9823E"
      strokeWidth="0.8"
    />
    {/* Lowermost right petal flare */}
    <path
      d="M50 50 C62 48 84 45 92 38 C82 43 68 48 50 50 Z"
      fill="url(#crestGoldGrad)"
      stroke="#A9823E"
      strokeWidth="0.8"
    />
    {/* Tiered Lotus Base Pedestal */}
    <path d="M36 53 C44 56 56 56 64 53 L62 57 C55 59 45 59 38 57 Z" fill="#D7B66D" stroke="#A9823E" strokeWidth="0.8" />
    <circle cx="50" cy="52" r="2.5" fill="#FFF2D1" stroke="#A9823E" strokeWidth="0.8" />
  </svg>
);

// --- ORNAMENTAL ASSET: TRADITIONAL MUGHAL MINIATURE FLOWERING SHRUB ---
// Symmetrical flowering marigold bush from traditional Indian miniature art
export const MughalShrubSVG: React.FC<{ className?: string; flip?: boolean; size?: number }> = ({
  className = '',
  flip = false,
  size = 72,
}) => (
  <svg
    width={size}
    height={Math.round(size * 1.35)}
    viewBox="0 0 60 82"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={clsx('pointer-events-none select-none opacity-90', className)}
    style={{ transform: flip ? 'scaleX(-1)' : undefined }}
    aria-hidden="true"
  >
    {/* Main Stem */}
    <path d="M30 82 C30 65 32 45 28 24" stroke="#165746" strokeWidth="1.6" strokeLinecap="round" />
    {/* Left Branch */}
    <path d="M29 55 C22 48 14 44 10 38" stroke="#165746" strokeWidth="1.2" strokeLinecap="round" />
    {/* Right Branch */}
    <path d="M29 46 C37 40 45 36 50 28" stroke="#165746" strokeWidth="1.2" strokeLinecap="round" />
    {/* Upper Left Branch */}
    <path d="M28 32 C22 26 18 20 16 12" stroke="#165746" strokeWidth="1" strokeLinecap="round" />

    {/* Leaves (Olive/Emerald Green) */}
    <path d="M28 66 C22 64 20 58 26 62 Z" fill="#27844F" />
    <path d="M31 60 C37 58 40 54 33 56 Z" fill="#27844F" />
    <path d="M20 50 C14 50 12 44 19 46 Z" fill="#27844F" />
    <path d="M38 42 C44 42 46 36 39 38 Z" fill="#27844F" />
    <path d="M22 28 C16 28 15 22 21 24 Z" fill="#27844F" />

    {/* Blooming Flowers (Golden/Orange Marigolds) */}
    {/* Top Flower */}
    <g transform="translate(28, 20)">
      <circle cx="0" cy="0" r="4.5" fill="#E59832" stroke="#B8731F" strokeWidth="0.6" />
      <circle cx="0" cy="0" r="2.2" fill="#FFE29A" />
      <circle cx="-3" cy="-1" r="1.5" fill="#E59832" />
      <circle cx="3" cy="-1" r="1.5" fill="#E59832" />
      <circle cx="0" cy="-3" r="1.5" fill="#E59832" />
    </g>

    {/* Upper Left Flower */}
    <g transform="translate(16, 12)">
      <circle cx="0" cy="0" r="3.5" fill="#D7B66D" stroke="#A9823E" strokeWidth="0.5" />
      <circle cx="0" cy="0" r="1.6" fill="#FFF2D1" />
    </g>

    {/* Lower Left Flower */}
    <g transform="translate(10, 38)">
      <circle cx="0" cy="0" r="4" fill="#E59832" stroke="#B8731F" strokeWidth="0.6" />
      <circle cx="0" cy="0" r="2" fill="#FFE29A" />
    </g>

    {/* Right Flower */}
    <g transform="translate(50, 28)">
      <circle cx="0" cy="0" r="4.2" fill="#E59832" stroke="#B8731F" strokeWidth="0.6" />
      <circle cx="0" cy="0" r="2" fill="#FFE29A" />
    </g>
  </svg>
);

// --- ORNAMENTAL ASSET: HERITAGE CORNER ROSETTE ---
export const CornerRosetteSVG: React.FC<{ size?: number; className?: string }> = ({
  size = 36,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={clsx('pointer-events-none select-none filter drop-shadow-sm', className)}
    aria-hidden="true"
  >
    {/* Outer 8-pointed star */}
    <rect x="6" y="6" width="28" height="28" fill="#F6EAD1" stroke="#D7B66D" strokeWidth="1.2" rx="2" />
    <rect x="6" y="6" width="28" height="28" fill="#F6EAD1" stroke="#D7B66D" strokeWidth="1.2" rx="2" transform="rotate(45 20 20)" />
    {/* Center rosette */}
    <circle cx="20" cy="20" r="8" fill="#EBD69A" stroke="#A9823E" strokeWidth="0.8" />
    <circle cx="20" cy="20" r="4.5" fill="#165746" />
    <circle cx="20" cy="20" r="2" fill="#FFF4D4" />
  </svg>
);


// --- ORNAMENTAL ASSET: PALACE ARCH FRAME ---
// Indian cusped multi-foil arch with kalash finial, dual antique gold border, and ivory parchment field
export const PalaceArchSVG: React.FC<{
  children?: React.ReactNode;
  className?: string;
  variant?: 'ivory' | 'emerald';
  compact?: boolean;
}> = ({ children, className = '', variant = 'ivory', compact = false }) => (
  <div className={clsx('relative w-full flex flex-col items-center justify-center', className)}>
    <svg
      viewBox="0 0 400 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full pointer-events-none select-none filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="goldGradientArch" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF2D1" />
          <stop offset="35%" stopColor="#EBD69A" />
          <stop offset="70%" stopColor="#D7B66D" />
          <stop offset="100%" stopColor="#A9823E" />
        </linearGradient>
        <linearGradient id="ivoryArchFill" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FFFDF7" stopOpacity="0.99" />
          <stop offset="45%" stopColor="#FAF2E4" stopOpacity="0.99" />
          <stop offset="100%" stopColor="#F5EBDD" stopOpacity="0.99" />
        </linearGradient>
        <linearGradient id="emeraldArchFill" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#085B4E" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#063E35" stopOpacity="0.98" />
        </linearGradient>
      </defs>

      {/* Background Fill Path for the Arch */}
      <path
        d="M 28 500
           L 28 220
           C 28 178, 48 168, 52 148
           C 56 128, 78 118, 84 103
           C 94 83, 120 78, 144 66
           C 174 48, 190 30, 200 14
           C 210 30, 226 48, 256 66
           C 280 78, 306 83, 316 103
           C 322 118, 344 128, 348 148
           C 352 168, 372 178, 372 220
           L 372 500
           Z"
        fill={variant === 'ivory' ? 'url(#ivoryArchFill)' : 'url(#emeraldArchFill)'}
      />

      {/* Outer Layer Gold Contour with Repoussé Weight */}
      <path
        d="M 28 500
           L 28 220
           C 28 178, 48 168, 52 148
           C 56 128, 78 118, 84 103
           C 94 83, 120 78, 144 66
           C 174 48, 190 30, 200 14
           C 210 30, 226 48, 256 66
           C 280 78, 306 83, 316 103
           C 322 118, 344 128, 348 148
           C 352 168, 372 178, 372 220
           L 372 500"
        stroke="url(#goldGradientArch)"
        strokeWidth="3.6"
        strokeLinecap="round"
      />

      {/* Inner Layer Gold Contour (Fine Beaded Accent) */}
      <path
        d="M 36 500
           L 36 222
           C 36 184, 54 174, 58 155
           C 62 136, 83 127, 88 112
           C 98 94, 122 89, 146 78
           C 175 61, 191 44, 200 28
           C 209 44, 225 61, 254 78
           C 278 89, 302 94, 312 112
           C 317 127, 338 136, 342 155
           C 346 174, 364 184, 364 222
           L 364 500"
        stroke={variant === 'ivory' ? '#064F43' : '#EBD69A'}
        strokeWidth="1.6"
        strokeDasharray="4 2"
        strokeOpacity="0.85"
      />

      {/* Royal Kalash Finial Spire at Top Crest */}
      <circle cx="200" cy="14" r="4.5" fill="#FFF2D1" stroke="#A9823E" strokeWidth="1" />
      <path d="M200 3 L195 11 L205 11 Z" fill="#D7B66D" stroke="#A9823E" strokeWidth="0.8" />
      <circle cx="200" cy="2" r="1.5" fill="#FFF7DF" />

      {/* Small Gold Floral Accents along cusps */}
      <circle cx="144" cy="66" r="3" fill="#D7B66D" stroke="#A9823E" strokeWidth="0.6" />
      <circle cx="256" cy="66" r="3" fill="#D7B66D" stroke="#A9823E" strokeWidth="0.6" />
      <circle cx="84" cy="103" r="2.8" fill="#EBD69A" />
      <circle cx="316" cy="103" r="2.8" fill="#EBD69A" />
      <circle cx="52" cy="148" r="2.4" fill="#D7B66D" />
      <circle cx="348" cy="148" r="2.4" fill="#D7B66D" />
    </svg>

    {/* Arch Internal Content with Safe Margin from Strokes */}
    <div className={clsx('relative z-10 w-full', compact ? 'px-2' : 'px-4 sm:px-6')}>{children}</div>
  </div>
);

// --- TOP BRAND CARTOUCHE PLAQUE ---
export const BrandPlaque: React.FC<{
  logo?: string;
  name?: string;
  compact?: boolean;
}> = ({ logo, compact }) => (
  <div className="inline-flex items-center justify-center relative">
    <div
      className={clsx(
        'relative bg-gradient-to-b from-[#FFFDF7] via-[#F6EAD1] to-[#EBD69A] border-2 border-[#D7B66D] shadow-[0_4px_14px_rgba(0,0,0,0.35)] flex items-center justify-center',
        compact ? 'px-4 py-1 rounded-md' : 'px-7 py-2 rounded-lg'
      )}
      style={{
        clipPath: 'polygon(8% 0%, 92% 0%, 100% 25%, 100% 75%, 92% 100%, 8% 100%, 0% 75%, 0% 25%)',
      }}
    >
      {logo && !logo.includes('unsplash.com') ? (
        <img
          src={logo}
          alt="Restaurant Emblem"
          className={clsx('object-contain', compact ? 'max-h-5 max-w-[80px]' : 'max-h-7 max-w-[110px]')}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <span
          className={clsx(
            'font-serif italic font-black text-[#064F43] lowercase tracking-widest select-none drop-shadow-sm',
            compact ? 'text-xs' : 'text-sm sm:text-base'
          )}
        >
          menu
        </span>
      )}
    </div>
  </div>
);

// --- INTERIOR PAGE RUNNING ORNAMENTAL BORDER ---
// Emerald base with repeating antique gold jaali diamond motif, safe insets, and no edge collision
export const HeritageRunningBorder: React.FC<{
  children: React.ReactNode;
  compact?: boolean;
  className?: string;
}> = ({ children, compact = false, className = '' }) => {
  if (compact) {
    return (
      <div
        className={clsx(
          'relative w-full rounded-2xl shadow-md bg-[#FAF4E8] overflow-hidden border border-[#D7B66D]/75 p-3',
          className
        )}
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 0%, rgba(215, 182, 109, 0.15) 0%, transparent 65%),
            radial-gradient(circle at 50% 100%, rgba(6, 79, 67, 0.08) 0%, transparent 65%)
          `,
        }}
      >
        {/* Inner delicate beaded border */}
        <div className="absolute inset-1.5 rounded-xl border border-[#D7B66D]/40 border-dashed pointer-events-none" />

        {/* Four small gold corner rosettes */}
        <div className="absolute top-1.5 left-1.5 z-20 pointer-events-none">
          <CornerRosetteSVG size={18} />
        </div>
        <div className="absolute top-1.5 right-1.5 z-20 pointer-events-none">
          <CornerRosetteSVG size={18} />
        </div>
        <div className="absolute bottom-1.5 left-1.5 z-20 pointer-events-none">
          <CornerRosetteSVG size={18} />
        </div>
        <div className="absolute bottom-1.5 right-1.5 z-20 pointer-events-none">
          <CornerRosetteSVG size={18} />
        </div>

        {/* Interior Content with safe padding so nothing touches borders */}
        <div className="relative z-10 w-full pt-1.5 pb-1 px-1">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'relative w-full rounded-2xl sm:rounded-3xl shadow-[0_18px_60px_rgba(6,79,67,0.22)] bg-[#F5EBDD] overflow-hidden p-4 sm:p-8',
        className
      )}
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 0%, rgba(215, 182, 109, 0.12) 0%, transparent 60%),
          radial-gradient(circle at 50% 100%, rgba(6, 79, 67, 0.08) 0%, transparent 60%)
        `,
      }}
    >
      {/* Outer Ornamental Frame: Repeating Diamond Band */}
      <div className="relative w-full h-full rounded-xl sm:rounded-2xl border-2 border-[#165746]/50 bg-[#FBF5E9] shadow-[inset_0_0_24px_rgba(215,182,109,0.2)] flex flex-col p-6 sm:p-9">
        {/* Decorative repeating diamond inner outline with safe inset */}
        <div className="absolute inset-2 sm:inset-3 rounded-lg sm:rounded-xl border border-[#D7B66D]/80 pointer-events-none" />

        {/* Four Corner Lotus Blossoms - Inset cleanly inside corners without clipping */}
        <div className="absolute top-2 left-2 z-20">
          <LotusCorner size={36} rotation={45} />
        </div>
        <div className="absolute top-2 right-2 z-20">
          <LotusCorner size={36} rotation={-45} />
        </div>
        <div className="absolute bottom-2 left-2 z-20">
          <LotusCorner size={36} rotation={135} />
        </div>
        <div className="absolute bottom-2 right-2 z-20">
          <LotusCorner size={36} rotation={-135} />
        </div>

        {/* Interior Content with safe padding so nothing touches borders */}
        <div className="relative z-10 w-full flex-1 px-1 sm:px-2 pt-4 pb-2">{children}</div>
      </div>
    </div>
  );
};

// --- EDITORIAL FOOD PHOTO COLLAGE ---
export const EditorialCollage: React.FC<{
  images: string[];
  title?: string;
  reverse?: boolean;
  compact?: boolean;
}> = ({ images, title = 'Cuisine', reverse = false, compact }) => {
  const safeImages = images.length >= 3 ? images : [...images, ...DEFAULT_HERITAGE_IMAGES.curries].slice(0, 3);

  if (compact) {
    // Single appetizing featured dish image in phone mockup to save space and look sharp
    return (
      <div className="my-2.5 rounded-xl overflow-hidden border border-[#D7B66D]/50 shadow-md aspect-[16/9] relative group">
        <img
          src={safeImages[0]}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        <span className="absolute bottom-1.5 left-2.5 text-[9px] font-serif uppercase tracking-widest text-[#F6EAD1] font-bold">
          {title}
        </span>
      </div>
    );
  }

  return (
    <div className={clsx('grid grid-cols-2 gap-2 sm:gap-2.5 h-full min-h-[220px]', reverse ? 'order-1' : 'order-2')}>
      {/* Primary Featured Photo (Span 2 or Large) */}
      <div className="col-span-2 aspect-[16/9] rounded-xl overflow-hidden border border-[#D7B66D]/60 shadow-md relative group">
        <img
          src={safeImages[0]}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        <span className="absolute bottom-2 left-3 text-[10px] font-serif uppercase tracking-[0.2em] text-[#F6EAD1] font-bold">
          Signature Selection
        </span>
      </div>

      {/* Secondary Left Image */}
      <div className="aspect-square rounded-lg overflow-hidden border border-[#D7B66D]/50 shadow-sm relative group">
        <img
          src={safeImages[1]}
          alt={`${title} detail 1`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Secondary Right Image */}
      <div className="aspect-square rounded-lg overflow-hidden border border-[#D7B66D]/50 shadow-sm relative group">
        <img
          src={safeImages[2]}
          alt={`${title} detail 2`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
    </div>
  );
};

// --- MASTER TEMPLATE COMPONENT ---
export const MughalLuxeTemplate: React.FC<LayoutProps> = ({
  template,
  restaurant,
  categories,
  rawCategories,
  compact = false,
  onAddToCart,
  isPremium,
  activeCategory,
  setActiveCategory,
  searchBar,
}) => {
  // Mobile / Phone Mockup Tab Switcher: "Cover" vs "Inside Menu"
  const [activeViewTab, setActiveViewTab] = useState<'both' | 'cover' | 'menu'>(compact ? 'menu' : 'both');

  // Filtered categories handling
  const displayCategories = categories.length > 0 ? categories : rawCategories;

  // Split categories for editorial magazine flow:
  // First category: Page B (Curries / Starters) with Photo Collage on right
  // Second category: Page C (Main Dishes) with Photo Collage on left
  // Remaining categories: Page D & E (Drinks, Desserts, Breads) with side-by-side or dotted leader alignment
  const firstCategory = displayCategories[0];
  const secondCategory = displayCategories[1];
  const otherCategories = displayCategories.slice(2);

  return (
    <div className={clsx('w-full select-text font-serif text-[#51483B] relative', compact ? 'space-y-3' : 'space-y-8 sm:space-y-12')}>
      {/* In Compact Mode (Phone Mockup), provide a safe area header below the Dynamic Island with view toggle */}
      {compact && (
        <div className="pt-8 pb-1 flex items-center justify-center">
          <div className="flex items-center gap-1 p-0.5 bg-[#042821]/95 backdrop-blur-md rounded-full border border-[#D7B66D]/60 shadow-lg">
            <button
              type="button"
              onClick={() => setActiveViewTab('cover')}
              className={clsx(
                'px-3 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider transition-all',
                activeViewTab === 'cover'
                  ? 'bg-[#D7B66D] text-[#064F43] shadow-sm'
                  : 'text-[#F6EAD1]/70 hover:text-white'
              )}
            >
              Cover
            </button>
            <button
              type="button"
              onClick={() => setActiveViewTab('menu')}
              className={clsx(
                'px-3 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider transition-all',
                activeViewTab === 'menu'
                  ? 'bg-[#D7B66D] text-[#064F43] shadow-sm'
                  : 'text-[#F6EAD1]/70 hover:text-white'
              )}
            >
              Menu
            </button>
            <button
              type="button"
              onClick={() => setActiveViewTab('both')}
              className={clsx(
                'px-2.5 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider transition-all',
                activeViewTab === 'both'
                  ? 'bg-[#D7B66D] text-[#064F43] shadow-sm'
                  : 'text-[#F6EAD1]/70 hover:text-white'
              )}
            >
              All
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE ONE: THE FRONT COVER (EMERALD HERITAGE PALACE ARCH & IVORY FIELD) */}
      {/* ========================================================================= */}
      {(activeViewTab === 'both' || activeViewTab === 'cover') && (
        <section
          aria-label="Menu Front Cover"
          className={clsx(
            'relative w-full mx-auto rounded-3xl overflow-hidden border-2 border-[#D7B66D]/70 shadow-[0_24px_70px_rgba(6,79,67,0.4)] bg-gradient-to-b from-[#073D34] via-[#064F43] to-[#042A24] text-center flex flex-col justify-between',
            compact ? 'p-2.5 min-h-[460px]' : 'p-6 sm:p-10 min-h-[620px] sm:min-h-[720px]'
          )}
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 50% 15%, rgba(13, 130, 112, 0.35) 0%, transparent 65%),
              radial-gradient(circle at 50% 90%, rgba(6, 79, 67, 0.45) 0%, transparent 70%)
            `,
          }}
        >
          {/* Authentic Jharokha Fan-Scale Lattice Pattern across Cover Background */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" aria-hidden="true">
            <defs>
              <pattern id="jharokhaScalesCover" width="36" height="20" patternUnits="userSpaceOnUse">
                <path
                  d="M 0 20 C 0 10, 9 0, 18 0 C 27 0, 36 10, 36 20"
                  fill="none"
                  stroke="#D7B66D"
                  strokeWidth="1"
                />
                <path
                  d="M 18 20 C 18 10, 27 0, 36 0"
                  fill="none"
                  stroke="#EBD69A"
                  strokeWidth="0.6"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#jharokhaScalesCover)" />
          </svg>

          {/* Thin Outer Antique Gold Border Frame with Inset */}
          <div className="absolute inset-2 sm:inset-3 rounded-2xl border border-[#D7B66D]/50 pointer-events-none" />
          <div className="absolute inset-3 sm:inset-4 rounded-xl border border-[#EBD69A]/30 border-dashed pointer-events-none" />

          {/* Four Corner Heritage Rosettes */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20">
            <CornerRosetteSVG size={compact ? 24 : 36} />
          </div>
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20">
            <CornerRosetteSVG size={compact ? 24 : 36} />
          </div>
          <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 z-20">
            <CornerRosetteSVG size={compact ? 24 : 36} />
          </div>
          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-20">
            <CornerRosetteSVG size={compact ? 24 : 36} />
          </div>

          {/* Top Brand Plaque Header */}
          <div className="relative z-20 pt-1.5 sm:pt-3">
            <BrandPlaque logo={restaurant.logo} name={restaurant.name} compact={compact} />
          </div>

          {/* Central Ornamental Palace Arch with Warm Ivory Field */}
          <div className="relative z-10 my-auto py-2 sm:py-4 max-w-[460px] mx-auto w-full px-1 sm:px-3">
            <PalaceArchSVG variant="ivory" compact={compact}>
              <div
                className={clsx(
                  'relative flex flex-col items-center justify-center text-center',
                  compact ? 'px-2 pt-10 pb-6 space-y-2' : 'px-3 pt-12 sm:pt-16 pb-8 space-y-2.5 sm:space-y-4'
                )}
              >
                {/* Golden Blooming Lotus Crest Emblem */}
                <GoldenLotusCrestSVG size={compact ? 44 : 70} className="mb-1" />

                {/* Spaced Restaurant Cuisine Title - No Awkward Mid-Word Wraps */}
                <div className="space-y-1 px-2 max-w-[92%] mx-auto">
                  <h1
                    className={clsx(
                      'font-black tracking-[0.12em] uppercase leading-tight text-[#064F43] drop-shadow-xs whitespace-normal break-normal text-balance',
                      restaurant.name.length > 28
                        ? (compact ? 'text-xs' : 'text-lg sm:text-xl lg:text-2xl')
                        : restaurant.name.length > 18
                        ? (compact ? 'text-sm' : 'text-xl sm:text-2xl lg:text-3xl')
                        : (compact ? 'text-base' : 'text-2xl sm:text-3xl lg:text-4xl')
                    )}
                    style={{ fontFamily: template.typography.heading }}
                  >
                    {restaurant.name}
                  </h1>

                  {/* Supporting Cuisine Script / Italic Subtitle */}
                  <p
                    className={clsx(
                      'font-serif italic tracking-wide text-[#A9823E] font-medium',
                      compact ? 'text-[11px]' : 'text-sm sm:text-lg'
                    )}
                  >
                    {restaurant.cuisine || 'Authentic Indian Cuisine'}
                  </p>
                </div>

                {/* Golden Cartouche Ribbon Plaque */}
                <div
                  className={clsx(
                    'my-0.5 rounded-full border border-[#D7B66D] bg-gradient-to-r from-[#F6EAD1] via-[#FFFDF7] to-[#F6EAD1] shadow-xs',
                    compact ? 'px-2.5 py-0.5' : 'px-4 py-0.5'
                  )}
                >
                  <span
                    className={clsx(
                      'font-sans uppercase font-bold text-[#064F43] tracking-[0.2em]',
                      compact ? 'text-[8px]' : 'text-[10px] sm:text-xs'
                    )}
                  >
                    {restaurant.tagline || 'ROYAL HAVELI HERITAGE'}
                  </span>
                </div>

                {/* Location & Metadata Details */}
                <div className="space-y-0.5 text-center pt-0.5">
                  <p
                    className={clsx(
                      'font-sans uppercase tracking-[0.2em] text-[#776B5B] font-medium',
                      compact ? 'text-[8px]' : 'text-[8px] sm:text-[9.5px]'
                    )}
                  >
                    {restaurant.city ? `${restaurant.city.toUpperCase()} • FINE DINING` : 'ESTD. HERITAGE KITCHEN'}
                  </p>
                  {restaurant.phone && (
                    <p
                      className={clsx(
                        'font-mono text-[#285B48] tracking-wider font-semibold',
                        compact ? 'text-[8px]' : 'text-[8px] sm:text-[9.5px]'
                      )}
                    >
                      {restaurant.phone}
                    </p>
                  )}
                </div>

                {/* Symmetrical Mughal Miniature Flowering Shrubs at Arch Base */}
                <div className="absolute bottom-1 left-2 sm:bottom-2 sm:left-4 pointer-events-none z-10">
                  <MughalShrubSVG size={compact ? 36 : 54} />
                </div>
                <div className="absolute bottom-1 right-2 sm:bottom-2 sm:right-4 pointer-events-none z-10">
                  <MughalShrubSVG size={compact ? 36 : 54} flip />
                </div>
              </div>
            </PalaceArchSVG>
          </div>

          {/* Bottom Cover Footer Plaque */}
          <div className="relative z-20 pb-1.5 sm:pb-2.5 flex flex-col items-center gap-1">
            <div className="flex items-center justify-center gap-2 text-[#D7B66D]/70 text-xs">
              <span className="w-8 h-px bg-[#D7B66D]/40" />
              <span className="text-[9.5px] uppercase font-serif tracking-[0.25em] text-[#EBD69A]">Royal Haveli Heritage</span>
              <span className="w-8 h-px bg-[#D7B66D]/40" />
            </div>
            {restaurant.city && (
              <span className="text-[9px] font-mono text-[#EBD69A]/75 tracking-wider uppercase">
                {restaurant.city}
              </span>
            )}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          UNIVERSAL MENU SEARCH
          ═══════════════════════════════════════════════════════════════════════ */}
      {activeViewTab !== 'cover' && searchBar}

      {/* ========================================================================= */}
      {/* INTERIOR MENU PAGES: WARM IVORY PARCHMENT BOOKLET */}
      {/* ========================================================================= */}
      {(activeViewTab === 'both' || activeViewTab === 'menu') && (
        <section aria-label="Menu Interior Pages" className="w-full">
          {compact ? (
            /* ========================================================================= */
            /* UNIFIED CONTINUOUS ROYAL PARCHMENT MENU FOR PHONE MOCKUP */
            /* ========================================================================= */
            <HeritageRunningBorder compact={true}>
              <div className="space-y-4">
                {/* Royal Ornamental Header */}
                <div className="text-center pb-2.5 border-b border-[#C9A967]/40">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-[#064F43] text-xs">❖</span>
                    <h2
                      className="font-black text-[#064F43] uppercase tracking-[0.2em] text-xs"
                      style={{ fontFamily: template.typography.heading }}
                    >
                      ROYAL MENU SELECTION
                    </h2>
                    <span className="text-[#064F43] text-xs">❖</span>
                  </div>
                  <OrnateDividerSVG className="max-w-[140px] mt-1" />
                </div>

                {/* Mobile Category Quick Filter Pills */}
                {rawCategories.length > 1 && (
                  <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setActiveCategory('all')}
                      className={clsx(
                        'px-2.5 py-1 text-[10px] font-serif tracking-wider rounded-full border transition-all shrink-0',
                        activeCategory === 'all'
                          ? 'bg-[#D7B66D] text-[#064F43] border-[#D7B66D] font-bold shadow-xs'
                          : 'text-[#064F43] border-[#D7B66D]/50 bg-[#F5EBDD] hover:border-[#D7B66D]'
                      )}
                    >
                      ❖ All
                    </button>
                    {rawCategories.map((cat) => {
                      const isActive = activeCategory === cat.id || activeCategory === cat.name;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setActiveCategory(cat.id)}
                          className={clsx(
                            'px-2.5 py-1 text-[10px] font-serif tracking-wider rounded-full border transition-all shrink-0 whitespace-nowrap',
                            isActive
                              ? 'bg-[#D7B66D] text-[#064F43] border-[#D7B66D] font-bold shadow-xs'
                              : 'text-[#064F43] border-[#D7B66D]/50 bg-[#F5EBDD] hover:border-[#D7B66D]'
                          )}
                        >
                          ❖ {cat.name}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Featured Signature Dish Photo Banner */}
                <div className="rounded-xl overflow-hidden border border-[#D7B66D]/70 shadow-sm aspect-[16/8] relative bg-[#042821]">
                  <img
                    src={
                      displayCategories.flatMap((c) => c.items).find((i) => Boolean(i.image))?.image ||
                      DEFAULT_HERITAGE_IMAGES.mains[0]
                    }
                    alt="Royal Heritage Signature"
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#042821]/80 via-black/20 to-transparent flex items-end p-2.5">
                    <span className="text-[9px] font-serif uppercase tracking-[0.2em] text-[#F6EAD1] font-bold">
                      ❖ Imperial Signature Selection
                    </span>
                  </div>
                </div>

                {/* All Menu Categories */}
                <div className="space-y-4">
                  {displayCategories.map((cat, catIdx) => (
                    <div key={cat.id} className={clsx('space-y-1', catIdx > 0 && 'pt-3 border-t border-[#D7B66D]/30')}>
                      {/* Category Header */}
                      <div className="flex items-center justify-between pb-1 mb-1 border-b border-[#D7B66D]/30">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#165746] text-[10px]">❖</span>
                          <h3
                            className="font-black text-[#165746] uppercase tracking-[0.15em] text-xs"
                            style={{ fontFamily: template.typography.heading }}
                          >
                            {cat.name}
                          </h3>
                        </div>
                        <span className="text-[9px] font-mono font-semibold text-[#776B5B]">
                          {cat.items.length} items
                        </span>
                      </div>

                      {/* Dish Rows */}
                      <div className="divide-y divide-[#D7B66D]/15">
                        {cat.items.map((item) => (
                          <DishRow
                            key={item.id}
                            item={item}
                            template={template}
                            compact={true}
                            onAddToCart={onAddToCart}
                            isPremium={isPremium}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Plaque inside Mobile Menu */}
                <div className="pt-3 border-t border-[#D7B66D]/40 text-center space-y-1">
                  <p className="font-serif text-[10px] text-[#776B5B] italic">
                    Freshly Prepared Daily with Royal Spices
                  </p>
                  {restaurant.phone && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-[#C9A967]/60 bg-[#F5EBDD] font-mono text-[9px] text-[#165746] font-bold shadow-xs">
                      <span>☎ {restaurant.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </HeritageRunningBorder>
          ) : (
            /* ========================================================================= */
            /* DESKTOP / TABLET MULTI-PAGE MAGAZINE SPREAD */
            /* ========================================================================= */
            <div className="space-y-6 sm:space-y-10">
              {/* Category Sticky Nav */}
              {rawCategories.length > 1 && (
                <div className="sticky top-12 z-30 bg-[#064F43]/95 backdrop-blur-md py-2 px-3 rounded-2xl border border-[#D7B66D]/40 shadow-xl overflow-x-auto scrollbar-none flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveCategory('all')}
                    className={clsx(
                      'px-3.5 py-1.5 text-xs font-serif tracking-widest rounded-full border transition-all shrink-0',
                      activeCategory === 'all'
                        ? 'bg-[#D7B66D] text-[#064F43] border-[#D7B66D] font-bold shadow-sm'
                        : 'text-[#F6EAD1] border-[#D7B66D]/30 bg-[#064F43]/80 hover:border-[#D7B66D]'
                    )}
                  >
                    ❖ All
                  </button>
                  {rawCategories.map((cat) => {
                    const isActive = activeCategory === cat.id || activeCategory === cat.name;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveCategory(cat.id)}
                        className={clsx(
                          'px-3.5 py-1.5 text-xs font-serif tracking-widest rounded-full border transition-all shrink-0 whitespace-nowrap',
                          isActive
                            ? 'bg-[#D7B66D] text-[#064F43] border-[#D7B66D] font-bold shadow-sm'
                            : 'text-[#F6EAD1] border-[#D7B66D]/30 bg-[#064F43]/80 hover:border-[#D7B66D]'
                        )}
                      >
                        ❖ {cat.name}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* PAGE TYPE B: FIRST CATEGORY SPREAD */}
              {firstCategory && (
                <HeritageRunningBorder compact={false}>
                  <div className="space-y-6">
                    <div className="text-center pb-3 border-b border-[#C9A967]/40 relative">
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-[#165746] text-xs">❖</span>
                        <h2
                          className="font-black text-[#165746] uppercase tracking-[0.2em] text-xl sm:text-2xl lg:text-3xl"
                          style={{ fontFamily: template.typography.heading }}
                        >
                          {firstCategory.name}
                        </h2>
                        <span className="text-[#165746] text-xs">❖</span>
                      </div>
                      <OrnateDividerSVG className="max-w-[180px] mt-1.5" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      <div className="md:col-span-7 space-y-2">
                        {firstCategory.items.map((item) => (
                          <DishRow
                            key={item.id}
                            item={item}
                            template={template}
                            compact={false}
                            onAddToCart={onAddToCart}
                            isPremium={isPremium}
                          />
                        ))}
                      </div>
                      <div className="md:col-span-5 w-full">
                        <EditorialCollage
                          images={firstCategory.items.map((i) => i.image).filter(Boolean) as string[]}
                          title={firstCategory.name}
                          compact={false}
                        />
                      </div>
                    </div>
                  </div>
                </HeritageRunningBorder>
              )}

              {/* PAGE TYPE C: SECOND CATEGORY SPREAD */}
              {secondCategory && (
                <HeritageRunningBorder compact={false}>
                  <div className="space-y-6">
                    <div className="text-center pb-3 border-b border-[#C9A967]/40 relative">
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-[#165746] text-xs">❖</span>
                        <h2
                          className="font-black text-[#165746] uppercase tracking-[0.2em] text-xl sm:text-2xl lg:text-3xl"
                          style={{ fontFamily: template.typography.heading }}
                        >
                          {secondCategory.name}
                        </h2>
                        <span className="text-[#165746] text-xs">❖</span>
                      </div>
                      <OrnateDividerSVG className="max-w-[180px] mt-1.5" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      <div className="md:col-span-5 w-full order-2 md:order-1">
                        <EditorialCollage
                          images={secondCategory.items.map((i) => i.image).filter(Boolean) as string[]}
                          title={secondCategory.name}
                          reverse={true}
                          compact={false}
                        />
                      </div>
                      <div className="md:col-span-7 space-y-2 order-1 md:order-2">
                        {secondCategory.items.map((item) => (
                          <DishRow
                            key={item.id}
                            item={item}
                            template={template}
                            compact={false}
                            onAddToCart={onAddToCart}
                            isPremium={isPremium}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </HeritageRunningBorder>
              )}

              {/* PAGE TYPE D & E: ADDITIONAL CATEGORIES */}
              {otherCategories.length > 0 && (
                <HeritageRunningBorder compact={false}>
                  <div className="space-y-8">
                    <div
                      className={clsx(
                        'grid gap-8 items-start',
                        otherCategories.length >= 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
                      )}
                    >
                      {otherCategories.map((cat) => (
                        <div key={cat.id} className="space-y-4">
                          <div className="pb-1.5 border-b border-[#C9A967]/60 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[#165746] text-xs">❖</span>
                              <h3
                                className="font-black text-[#165746] uppercase tracking-wider text-base sm:text-lg"
                                style={{ fontFamily: template.typography.heading }}
                              >
                                {cat.name}
                              </h3>
                            </div>
                            <span className="text-[10px] font-sans font-semibold text-[#776B5B]">
                              {cat.items.length} items
                            </span>
                          </div>

                          <div className="space-y-2">
                            {cat.items.map((item) => (
                              <DishRow
                                key={item.id}
                                item={item}
                                template={template}
                                compact={false}
                                onAddToCart={onAddToCart}
                                isPremium={isPremium}
                                useDottedLeader={true}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-[#C9A967]/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#776B5B]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#27844F]" />
                        <span className="font-sans font-medium">Freshly Prepared Daily with Traditional Heritage Spices</span>
                      </div>
                      {restaurant.phone && (
                        <div className="px-4 py-2 rounded-xl border border-[#C9A967] bg-[#F5EBDD] flex items-center gap-2 font-mono text-[11px] font-bold text-[#165746] shadow-sm">
                          <span>☎ Delivery & Reservations:</span>
                          <span>{restaurant.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </HeritageRunningBorder>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

// --- REUSABLE DISH ROW COMPONENT ---
// Preserves full text, supports multiline names without ellipsis, displays ₹xxx price without border touching
const DishRow: React.FC<{
  item: MenuItem;
  template: any;
  compact?: boolean;
  onAddToCart?: (item: any, priceStr: string, variant?: string) => void;
  isPremium?: boolean;
  useDottedLeader?: boolean;
}> = ({ item, template, compact = false, onAddToCart, isPremium, useDottedLeader = false }) => {
  const pricing = parseItemPricing(item);

  if (compact) {
    return (
      <div className="py-2 border-b border-[#D7B66D]/20 last:border-b-0">
        <div className="flex items-start justify-between gap-2">
          {/* Diet Dot + Dish Name + Description */}
          <div className="flex items-start gap-1.5 min-w-0 flex-1">
            <div className="mt-0.5 shrink-0">
              <DietIndicator
                type={item.dietType}
                compact={true}
                color={item.dietType === 'non-veg' ? '#B7473E' : '#27844F'}
              />
            </div>
            <div className="min-w-0 flex-1 pr-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4
                  className="font-serif font-bold text-[#165746] text-xs leading-snug whitespace-normal break-normal"
                  style={{ fontFamily: template.typography.body }}
                >
                  {item.name}
                </h4>
                {item.isBestseller && (
                  <span className="text-[7.5px] font-sans font-bold uppercase tracking-wider px-1 py-0.2 rounded bg-[#27844F]/15 text-[#27844F] border border-[#27844F]/30 shrink-0">
                    ROYAL
                  </span>
                )}
              </div>
              {pricing.cleanDescription && (
                <p className="text-[10px] text-[#776B5B] leading-tight font-sans font-normal mt-0.5 line-clamp-2 break-normal">
                  {pricing.cleanDescription}
                </p>
              )}
            </div>
          </div>

          {/* Price Badges & Add buttons */}
          <div className="shrink-0 pt-0.5">
            <RenderItemPrices
              item={item}
              accentColor="#285B48"
              isPremium={isPremium}
              onAddToCart={onAddToCart}
              priceClassName="font-serif font-bold text-[11px] text-[#285B48] tracking-wider bg-[#F5EBDD] px-2 py-0.5 rounded border border-[#C9A967]/50 shadow-xs whitespace-nowrap"
              btnStyle="text-[9px] font-bold px-2 py-0.5 bg-[#D7B66D] text-[#064F43] rounded hover:bg-[#e4ca8c] transition-colors cursor-pointer"
              compact={true}
            />
          </div>
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <div className="group py-2.5 border-b border-[#C9A967]/20 hover:border-[#C9A967]/60 transition-colors">
      <div className="flex items-baseline justify-between gap-3">
        {/* Dish Name & Dietary Indicator */}
        <div className="flex items-baseline gap-2.5 min-w-0 flex-1">
          <DietIndicator
            type={item.dietType}
            compact={compact}
            color={item.dietType === 'non-veg' ? '#B7473E' : '#27844F'}
            className="self-center shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4
              className="font-bold text-[#165746] group-hover:text-[#064F43] transition-colors leading-relaxed text-sm sm:text-base break-words"
              style={{ fontFamily: template.typography.body }}
            >
              {item.name}
            </h4>
          </div>
        </div>

        {/* Optional Dotted Leader */}
        {useDottedLeader && (
          <span className="hidden sm:inline-block flex-1 border-b border-dotted border-[#C9A967]/60 mx-3 self-end mb-1" />
        )}

        {/* Price & Add */}
        <div className="shrink-0 flex items-center gap-2 ml-2">
          {item.isBestseller && (
            <span className="hidden xs:inline-block text-[9px] font-sans font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#27844F]/15 text-[#27844F] border border-[#27844F]/30">
              BEST SELLER
            </span>
          )}
          <RenderItemPrices
            item={item}
            accentColor="#285B48"
            isPremium={isPremium}
            onAddToCart={onAddToCart}
            priceClassName="font-serif font-bold text-xs sm:text-sm text-[#285B48] tracking-widest bg-[#F5EBDD] px-2 py-0.5 rounded border border-[#C9A967]/50 shadow-xs"
            btnStyle="text-[9px] font-bold px-2 py-0.5 bg-[#D7B66D] text-[#064F43] rounded hover:bg-[#e4ca8c] transition-colors cursor-pointer"
            compact={compact}
          />
        </div>
      </div>

      {pricing.cleanDescription && (
        <p className="text-[#776B5B] pl-6 mt-1.5 leading-relaxed font-sans font-normal max-w-[92%] text-xs sm:text-[13px]">
          {pricing.cleanDescription}
        </p>
      )}
    </div>
  );
};

export default MughalLuxeTemplate;
