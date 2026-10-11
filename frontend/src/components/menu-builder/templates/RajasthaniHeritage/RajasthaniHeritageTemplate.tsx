import React, { useState } from 'react';
import clsx from 'clsx';
import type { LayoutProps, MenuItem } from '../types';
import { DietIndicator } from '../shared/RenderItemPrices';

// ============================================================================
// HERITAGE PARCHMENT ATELIER — CURATED CUISINE PHOTOGRAPHY
// ============================================================================
const DEFAULT_HERITAGE_PHOTOS = [
  {
    num: '01',
    name: 'Butter Chicken Royale',
    url: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80',
    alt: 'Velvet Butter Chicken in copper handi',
  },
  {
    num: '02',
    name: 'Crispy Samosa Platter',
    url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
    alt: 'Golden crisp samosas with mint chutney',
  },
  {
    num: '03',
    name: 'Charcoal Tandoori Chicken',
    url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&auto=format&fit=crop&q=80',
    alt: 'Charred tandoori chicken tikka skewers',
  },
  {
    num: '04',
    name: 'Paneer Tikka Masala',
    url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80',
    alt: 'Cottage cheese tikka with peppers',
  },
  {
    num: '05',
    name: 'Awadhi Dum Biryani',
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    alt: 'Fragrant dum biryani in clay pot',
  },
];

export function toTitleCase(str: string): string {
  if (!str) return 'Your Place Name';
  if (str !== str.toUpperCase() && str !== str.toLowerCase()) {
    return str;
  }
  return str
    .toLowerCase()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ============================================================================
// ORNAMENTAL ARTWORK 1: CORNER ROSETTE WITH 8-PETAL BLOSSOM & SQUARE MAT
// ============================================================================
export const HeritageFloralCorner: React.FC<{
  size?: number;
  rotation?: number;
  className?: string;
}> = ({ size = 40, rotation = 0, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={clsx('pointer-events-none select-none transition-transform', className)}
    style={{ transform: `rotate(${rotation}deg)` }}
    aria-hidden="true"
  >
    <defs>
      <radialGradient id="cornerGoldGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFF8E7" />
        <stop offset="45%" stopColor="#D4AE68" />
        <stop offset="100%" stopColor="#AC8144" />
      </radialGradient>
      <radialGradient id="cornerPetalGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#E88E5A" />
        <stop offset="60%" stopColor="#D97036" />
        <stop offset="100%" stopColor="#9E3B20" />
      </radialGradient>
    </defs>

    {/* Square Corner Block Mat */}
    <rect x="2" y="2" width="44" height="44" rx="2" fill="#FCF5E9" stroke="#1B4942" strokeWidth="2" />
    <rect x="5" y="5" width="38" height="38" fill="none" stroke="#D4AE68" strokeWidth="0.8" strokeDasharray="2 1.5" />

    {/* Symmetrical Corner Foliage Leaves */}
    <path d="M 24 24 L 38 10 C 41 8, 43 13, 39 16 Z" fill="#386450" />
    <path d="M 24 24 L 10 38 C 8 41, 13 43, 16 39 Z" fill="#386450" />
    <path d="M 24 24 L 10 10 C 8 8, 13 6, 15 11 Z" fill="#4E7A60" />
    <path d="M 24 24 L 38 38 C 41 41, 39 45, 35 41 Z" fill="#4E7A60" />

    {/* 8-Petal Terracotta & Gold Blossom */}
    <g transform="translate(24, 24)">
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <path
          key={deg}
          d="M 0 0 C -2.2 -5 0 -9.5 0 -10.5 C 0 -9.5 2.2 -5 0 0 Z"
          fill="url(#cornerPetalGrad)"
          stroke="#9E3B20"
          strokeWidth="0.4"
          transform={`rotate(${deg})`}
        />
      ))}
      <circle cx="0" cy="0" r="3.8" fill="url(#cornerGoldGrad)" stroke="#AC8144" strokeWidth="0.6" />
      <circle cx="0" cy="0" r="1.3" fill="#FFFDF7" />
    </g>
  </svg>
);

// ============================================================================
// ORNAMENTAL ARTWORK 2: SEAMLESS REPEATING FLORAL BORDER STRIP
// ============================================================================
export const RepeatingFloralStrip: React.FC<{ vertical?: boolean }> = ({ vertical = false }) => {
  return (
    <svg
      width={vertical ? '22' : '100%'}
      height={vertical ? '100%' : '22'}
      viewBox={vertical ? '0 0 22 240' : '0 0 240 22'}
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full pointer-events-none"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={vertical ? 'patternFloralStripV' : 'patternFloralStripH'}
          width={vertical ? '22' : '60'}
          height={vertical ? '60' : '22'}
          patternUnits="userSpaceOnUse"
        >
          {vertical ? (
            <g transform="rotate(90 11 11)">
              {/* Sinusoidal Connecting Vine */}
              <path d="M 0 11 Q 15 5 30 11 T 60 11" stroke="#386450" strokeWidth="1.2" fill="none" />
              {/* Green Leaf Pair with Vein */}
              <path d="M 10 9 C 12 4 18 4 19 9 C 16 9 14 10 10 9 Z" fill="#386450" />
              <path d="M 19 13 C 21 18 27 18 28 13 C 25 13 23 12 19 13 Z" fill="#4E7A60" />
              <path d="M 40 9 C 42 4 48 4 49 9 C 46 9 44 10 40 9 Z" fill="#386450" />
              <path d="M 49 13 C 51 18 57 18 58 13 C 55 13 53 12 49 13 Z" fill="#4E7A60" />
              {/* 6-Petal Terracotta Flower */}
              <g transform="translate(30, 11)">
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <ellipse
                    key={deg}
                    cx="0"
                    cy="-4.2"
                    rx="1.9"
                    ry="3.2"
                    fill="#D97036"
                    stroke="#9E3B20"
                    strokeWidth="0.3"
                    transform={`rotate(${deg})`}
                  />
                ))}
                <circle cx="0" cy="0" r="2.2" fill="#D4AE68" stroke="#AC8144" strokeWidth="0.5" />
                <circle cx="0" cy="0" r="0.7" fill="#FFFDF7" />
              </g>
              {/* Gold Connectors */}
              <circle cx="4" cy="11" r="1.1" fill="#D4AE68" />
              <circle cx="56" cy="11" r="1.1" fill="#D4AE68" />
            </g>
          ) : (
            <g>
              {/* Sinusoidal Connecting Vine */}
              <path d="M 0 11 Q 15 5 30 11 T 60 11" stroke="#386450" strokeWidth="1.2" fill="none" />
              {/* Green Leaf Pair with Vein */}
              <path d="M 10 9 C 12 4 18 4 19 9 C 16 9 14 10 10 9 Z" fill="#386450" />
              <path d="M 19 13 C 21 18 27 18 28 13 C 25 13 23 12 19 13 Z" fill="#4E7A60" />
              <path d="M 40 9 C 42 4 48 4 49 9 C 46 9 44 10 40 9 Z" fill="#386450" />
              <path d="M 49 13 C 51 18 57 18 58 13 C 55 13 53 12 49 13 Z" fill="#4E7A60" />
              {/* 6-Petal Terracotta Flower */}
              <g transform="translate(30, 11)">
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <ellipse
                    key={deg}
                    cx="0"
                    cy="-4.2"
                    rx="1.9"
                    ry="3.2"
                    fill="#D97036"
                    stroke="#9E3B20"
                    strokeWidth="0.3"
                    transform={`rotate(${deg})`}
                  />
                ))}
                <circle cx="0" cy="0" r="2.2" fill="#D4AE68" stroke="#AC8144" strokeWidth="0.5" />
                <circle cx="0" cy="0" r="0.7" fill="#FFFDF7" />
              </g>
              {/* Gold Connectors */}
              <circle cx="4" cy="11" r="1.1" fill="#D4AE68" />
              <circle cx="56" cy="11" r="1.1" fill="#D4AE68" />
            </g>
          )}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${vertical ? 'patternFloralStripV' : 'patternFloralStripH'})`} />
    </svg>
  );
};

// ============================================================================
// ORNAMENTAL ARTWORK 2B: GEOMETRIC SAWTOOTH CHEVRON BAND
// ============================================================================
export const SawtoothBorderStrip: React.FC<{ vertical?: boolean }> = ({ vertical = false }) => (
  <svg
    width={vertical ? '7' : '100%'}
    height={vertical ? '100%' : '7'}
    viewBox={vertical ? '0 0 7 120' : '0 0 120 7'}
    preserveAspectRatio="none"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full pointer-events-none opacity-80"
    aria-hidden="true"
  >
    <defs>
      <pattern
        id={vertical ? 'patternSawtoothV' : 'patternSawtoothH'}
        width={vertical ? '7' : '14'}
        height={vertical ? '14' : '7'}
        patternUnits="userSpaceOnUse"
      >
        {vertical ? (
          <g>
            <polygon points="0,0 7,3.5 0,7" fill="#D97036" />
            <polygon points="7,7 0,10.5 7,14" fill="#1B4942" />
          </g>
        ) : (
          <g>
            <polygon points="0,0 3.5,7 7,0" fill="#D97036" />
            <polygon points="7,7 10.5,0 14,7" fill="#1B4942" />
          </g>
        )}
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill={`url(#${vertical ? 'patternSawtoothV' : 'patternSawtoothH'})`} />
  </svg>
);

// ============================================================================
// ORNAMENTAL ARTWORK 3: UNIFIED MULTI-LAYER HERITAGE PARCHMENT FRAME
// ============================================================================
export const HeritageParchmentFrame: React.FC<{
  children: React.ReactNode;
  compact?: boolean;
  className?: string;
  hasBackgroundLace?: boolean;
}> = ({ children, compact = false, className = '', hasBackgroundLace = false }) => {
  return (
    <div
      className={clsx(
        'relative w-full rounded-2xl sm:rounded-3xl shadow-[0_24px_60px_rgba(22,62,54,0.35)] bg-[#163E36] text-[#244740] overflow-hidden',
        compact ? 'p-2 sm:p-2.5' : 'p-3 sm:p-4 lg:p-5',
        className
      )}
    >
      {/* Outer Card Sheet with Parchment Texture */}
      <div
        className={clsx(
          'relative w-full h-full rounded-xl sm:rounded-2xl border-[3.5px] border-[#1B4942] bg-[#FCF5E9] shadow-[inset_0_0_24px_rgba(212,174,104,0.18)] flex flex-col',
          compact ? 'p-1.5' : 'p-2 sm:p-3'
        )}
      >
        {/* Jharokha Peacock Feather Background Pattern for Cover Page */}
        {hasBackgroundLace && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25" aria-hidden="true">
            <defs>
              <pattern id="jharokhaPeacockFeatherBg" width="36" height="24" patternUnits="userSpaceOnUse">
                <path
                  d="M 0 24 C 0 11, 9 0, 18 0 C 27 0, 36 11, 36 24"
                  fill="none"
                  stroke="#D4AE68"
                  strokeWidth="0.9"
                />
                <path
                  d="M 4 24 C 4 14, 10 5, 18 5 C 26 5, 32 14, 32 24"
                  fill="none"
                  stroke="#CCA154"
                  strokeWidth="0.6"
                  strokeOpacity="0.8"
                />
                <path d="M 18 0 L 18 24" stroke="#D76C3C" strokeWidth="0.5" strokeOpacity="0.45" />
                <path d="M 18 5 L 11 20" stroke="#D76C3C" strokeWidth="0.4" strokeOpacity="0.35" />
                <path d="M 18 5 L 25 20" stroke="#D76C3C" strokeWidth="0.4" strokeOpacity="0.35" />
                <circle cx="18" cy="2" r="1.3" fill="#D4AE68" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#jharokhaPeacockFeatherBg)" />
          </svg>
        )}

        {/* Secondary Thin Gold Rule */}
        <div className={clsx("rounded-lg border border-[#D4AE68] pointer-events-none absolute", compact ? "inset-1" : "inset-1 sm:inset-1.5")} />

        {/* Sawtooth Chevron Bands along edges */}
        <div className={clsx("absolute top-2.5 h-1.5 pointer-events-none overflow-hidden", compact ? "inset-x-7" : "inset-x-9 sm:inset-x-12")}>
          <SawtoothBorderStrip />
        </div>
        <div className={clsx("absolute bottom-2.5 h-1.5 pointer-events-none overflow-hidden", compact ? "inset-x-7" : "inset-x-9 sm:inset-x-12")}>
          <SawtoothBorderStrip />
        </div>
        <div className={clsx("absolute left-2.5 w-1.5 pointer-events-none overflow-hidden", compact ? "inset-y-7" : "inset-y-9 sm:inset-y-12")}>
          <SawtoothBorderStrip vertical />
        </div>
        <div className={clsx("absolute right-2.5 w-1.5 pointer-events-none overflow-hidden", compact ? "inset-y-7" : "inset-y-9 sm:inset-y-12")}>
          <SawtoothBorderStrip vertical />
        </div>

        {/* Four Symmetrical Corner Rosettes */}
        <div className="absolute top-1 left-1 z-20">
          <HeritageFloralCorner size={compact ? 22 : 38} rotation={0} />
        </div>
        <div className="absolute top-1 right-1 z-20">
          <HeritageFloralCorner size={compact ? 22 : 38} rotation={90} />
        </div>
        <div className="absolute bottom-1 right-1 z-20">
          <HeritageFloralCorner size={compact ? 22 : 38} rotation={180} />
        </div>
        <div className="absolute bottom-1 left-1 z-20">
          <HeritageFloralCorner size={compact ? 22 : 38} rotation={270} />
        </div>

        {/* Perimeter Floral Strips */}
        <div className={clsx("absolute top-4 h-5 pointer-events-none overflow-hidden flex items-center justify-around opacity-95", compact ? "inset-x-7" : "inset-x-9 sm:inset-x-14")}>
          <RepeatingFloralStrip />
        </div>
        <div className={clsx("absolute bottom-4 h-5 pointer-events-none overflow-hidden flex items-center justify-around opacity-95 transform rotate-180", compact ? "inset-x-7" : "inset-x-9 sm:inset-x-14")}>
          <RepeatingFloralStrip />
        </div>
        <div className={clsx("absolute left-4 w-5 pointer-events-none overflow-hidden flex flex-col items-center justify-around opacity-95", compact ? "inset-y-7" : "inset-y-9 sm:inset-y-14")}>
          <RepeatingFloralStrip vertical />
        </div>
        <div className={clsx("absolute right-4 w-5 pointer-events-none overflow-hidden flex flex-col items-center justify-around opacity-95 transform rotate-180", compact ? "inset-y-7" : "inset-y-9 sm:inset-y-14")}>
          <RepeatingFloralStrip vertical />
        </div>

        {/* Inner Content Protective Dotted Hairline Rule */}
        <div className={clsx("rounded-md border border-dashed border-[#D76C3C]/45 pointer-events-none absolute", compact ? "inset-5" : "inset-8 sm:inset-9")} />

        {/* Inner Content Area */}
        <div className={clsx("relative z-10 w-full flex-1", compact ? "px-5 pt-7 pb-6" : "px-9 sm:px-11 lg:px-12 pt-11 pb-10 sm:pt-12 sm:pb-11")}>{children}</div>
      </div>
    </div>
  );
};

// ============================================================================
// ORNAMENTAL ARTWORK 4: SCALLOPED ARCH FRAME WITH BEADED TEAL RIM
// ============================================================================
export const ScallopedArchFrame: React.FC<{
  children?: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={clsx('relative w-full max-w-[420px] mx-auto flex flex-col items-center justify-center', className)}>
    <svg
      viewBox="0 0 400 540"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full pointer-events-none select-none filter drop-shadow-[0_12px_28px_rgba(27,73,66,0.22)]"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="scallopedArchFill" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FFFDF7" stopOpacity="0.99" />
          <stop offset="60%" stopColor="#FCF7ED" stopOpacity="0.99" />
          <stop offset="100%" stopColor="#F7EBD7" stopOpacity="0.99" />
        </linearGradient>
      </defs>

      {/* Closed 360° Scalloped Mughal/Rajasthani Arch Fill Path */}
      <path
        d="M 200 22
           C 208 36, 222 52, 246 66
           C 268 78, 292 84, 304 104
           C 310 118, 330 130, 336 150
           C 340 170, 358 184, 358 220
           L 358 400
           C 358 430, 336 450, 310 472
           C 285 492, 250 514, 200 500
           C 150 514, 115 492, 90 472
           C 64 450, 42 430, 42 400
           L 42 220
           C 42 184, 60 170, 64 150
           C 70 130, 90 118, 96 104
           C 108 84, 132 78, 154 66
           C 178 52, 192 36, 200 22
           Z"
        fill="url(#scallopedArchFill)"
      />

      {/* Outer Structural Teal Contour */}
      <path
        d="M 200 22
           C 208 36, 222 52, 246 66
           C 268 78, 292 84, 304 104
           C 310 118, 330 130, 336 150
           C 340 170, 358 184, 358 220
           L 358 400
           C 358 430, 336 450, 310 472
           C 285 492, 250 514, 200 500
           C 150 514, 115 492, 90 472
           C 64 450, 42 430, 42 400
           L 42 220
           C 42 184, 60 170, 64 150
           C 70 130, 90 118, 96 104
           C 108 84, 132 78, 154 66
           C 178 52, 192 36, 200 22
           Z"
        stroke="#1B4942"
        strokeWidth="3.6"
        strokeLinecap="round"
      />

      {/* Scalloped Beaded / Dotted Contour with Golden Cream Pearls */}
      <path
        d="M 200 31
           C 207 43, 220 57, 242 71
           C 264 83, 286 89, 298 109
           C 304 123, 322 135, 328 155
           C 332 173, 348 187, 348 221
           L 348 396
           C 348 424, 328 444, 304 464
           C 280 484, 246 502, 200 490
           C 150 502, 120 484, 96 464
           C 72 444, 52 424, 52 396
           L 52 221
           C 52 187, 68 173, 72 155
           C 78 135, 96 123, 102 109
           C 114 89, 136 83, 158 71
           C 180 57, 193 43, 200 31
           Z"
        stroke="#D76C3C"
        strokeWidth="1.4"
        strokeDasharray="3.5 2.5"
        strokeOpacity="0.85"
      />

      {/* Inner Thin Gold Contour */}
      <path
        d="M 200 39
           C 206 49, 218 63, 238 77
           C 260 89, 280 95, 292 113
           C 298 127, 314 139, 320 159
           C 324 177, 338 191, 338 223
           L 338 392
           C 338 418, 320 438, 298 456
           C 275 474, 242 492, 200 480
           C 158 492, 125 474, 102 456
           C 80 438, 62 418, 62 392
           L 62 223
           C 62 191, 76 177, 80 159
           C 86 139, 102 127, 108 113
           C 120 95, 140 89, 162 77
           C 182 63, 194 49, 200 39
           Z"
        stroke="#D4AE68"
        strokeWidth="1.2"
      />

      {/* Spire Kalash Crest at Top */}
      <circle cx="200" cy="20" r="4.2" fill="#D4AE68" stroke="#AC8144" strokeWidth="0.8" />
      <path d="M 200 7 L 194 17 L 206 17 Z" fill="#D76C3C" stroke="#9E3B20" strokeWidth="0.6" />
      <circle cx="200" cy="6" r="1.5" fill="#FFF8EB" />

      {/* Decorative Gold Pearls along Cusp Nodes */}
      <circle cx="246" cy="66" r="2.5" fill="#D4AE68" />
      <circle cx="154" cy="66" r="2.5" fill="#D4AE68" />
      <circle cx="304" cy="104" r="2.3" fill="#D4AE68" />
      <circle cx="96" cy="104" r="2.3" fill="#D4AE68" />
      <circle cx="336" cy="150" r="2.3" fill="#D4AE68" />
      <circle cx="64" cy="150" r="2.3" fill="#D4AE68" />
      <circle cx="310" cy="472" r="2.3" fill="#D4AE68" />
      <circle cx="90" cy="472" r="2.3" fill="#D4AE68" />
    </svg>

    {/* Arch Content Area */}
    <div className="relative z-10 w-full px-5 sm:px-8 py-3">{children}</div>
  </div>
);

// ============================================================================
// ORNAMENTAL ARTWORK 5: RADIANT BLOOMING LOTUS CREST EMBLEM
// ============================================================================
export const BloomingLotusEmblem: React.FC<{ size?: number; className?: string }> = ({
  size = 64,
  className = '',
}) => (
  <svg
    width={size}
    height={Math.round(size * 0.65)}
    viewBox="0 0 100 65"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={clsx('pointer-events-none select-none filter drop-shadow-xs', className)}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="lotusGoldEmblem" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF2D1" />
        <stop offset="45%" stopColor="#D4AE68" />
        <stop offset="100%" stopColor="#AC8144" />
      </linearGradient>
      <linearGradient id="lotusTerracotta" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E88E5A" />
        <stop offset="100%" stopColor="#D97036" />
      </linearGradient>
    </defs>

    {/* Center Tall Blooming Petal */}
    <path
      d="M 50 6 C 46 22 43 38 50 52 C 57 38 54 22 50 6 Z"
      fill="url(#lotusTerracotta)"
      stroke="#D76C3C"
      strokeWidth="1.2"
    />
    {/* Inner Left Petal */}
    <path
      d="M 50 52 C 40 42 32 28 34 16 C 40 26 46 38 50 52 Z"
      fill="url(#lotusGoldEmblem)"
      stroke="#D4AE68"
      strokeWidth="1"
    />
    {/* Inner Right Petal */}
    <path
      d="M 50 52 C 60 42 68 28 66 16 C 60 26 54 38 50 52 Z"
      fill="url(#lotusGoldEmblem)"
      stroke="#D4AE68"
      strokeWidth="1"
    />
    {/* Outer Left Spreading Petal */}
    <path
      d="M 50 52 C 34 46 20 36 16 26 C 26 32 38 44 50 52 Z"
      fill="#FCF5E9"
      stroke="#D76C3C"
      strokeWidth="1"
    />
    {/* Outer Right Spreading Petal */}
    <path
      d="M 50 52 C 66 46 80 36 84 26 C 74 32 62 44 50 52 Z"
      fill="#FCF5E9"
      stroke="#D76C3C"
      strokeWidth="1"
    />
    {/* Lowermost Left Petal Flare */}
    <path
      d="M 50 52 C 36 50 16 46 8 38 C 18 43 32 48 50 52 Z"
      fill="#FCF5E9"
      stroke="#D4AE68"
      strokeWidth="0.8"
    />
    {/* Lowermost Right Petal Flare */}
    <path
      d="M 50 52 C 64 50 84 46 92 38 C 82 43 68 48 50 52 Z"
      fill="#FCF5E9"
      stroke="#D4AE68"
      strokeWidth="0.8"
    />

    {/* Lotus Pedestal Base */}
    <path
      d="M 36 54 C 44 57 56 57 64 54 L 62 58 C 55 60 45 60 38 58 Z"
      fill="#D76C3C"
      stroke="#AC8144"
      strokeWidth="0.8"
    />
    <circle cx="50" cy="53" r="2.5" fill="#FFF2D1" stroke="#AC8144" strokeWidth="0.8" />
  </svg>
);

// ============================================================================
// ORNAMENTAL ARTWORK 6: MULTI-TIERED BOTANICAL SHRUBS (LOWER ARCH CORNERS)
// ============================================================================
export const BotanicalShrub: React.FC<{ size?: number; flip?: boolean; className?: string }> = ({
  size = 56,
  flip = false,
  className = '',
}) => (
  <svg
    width={size}
    height={Math.round(size * 1.35)}
    viewBox="0 0 70 95"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={clsx('pointer-events-none select-none opacity-95', className)}
    style={{ transform: flip ? 'scaleX(-1)' : undefined }}
    aria-hidden="true"
  >
    {/* Main Central Stem */}
    <path d="M 35 95 C 35 75 38 52 32 28" stroke="#1B4942" strokeWidth="1.8" strokeLinecap="round" />
    {/* Left Branch */}
    <path d="M 34 64 C 26 56 16 50 12 42" stroke="#1B4942" strokeWidth="1.3" strokeLinecap="round" />
    {/* Right Branch */}
    <path d="M 34 52 C 44 45 54 40 60 30" stroke="#1B4942" strokeWidth="1.3" strokeLinecap="round" />
    {/* Top Left Branch */}
    <path d="M 33 38 C 26 30 20 24 18 14" stroke="#1B4942" strokeWidth="1.1" strokeLinecap="round" />

    {/* Botanical Green Leaves */}
    <path d="M 32 78 C 24 76 22 68 30 72 Z" fill="#386450" />
    <path d="M 36 70 C 44 68 46 62 38 66 Z" fill="#386450" />
    <path d="M 24 58 C 16 58 14 52 22 54 Z" fill="#386450" />
    <path d="M 45 48 C 53 48 55 42 47 44 Z" fill="#386450" />
    <path d="M 26 34 C 18 34 16 28 24 30 Z" fill="#386450" />
    <path d="M 38 28 C 45 28 47 22 40 24 Z" fill="#386450" />

    {/* Blooming Terracotta / Gold Marigolds */}
    {/* Top Center Main Flower */}
    <g transform="translate(32, 24)">
      <circle cx="0" cy="0" r="5" fill="#D97036" stroke="#9E3B20" strokeWidth="0.7" />
      <circle cx="0" cy="0" r="2.5" fill="#D4AE68" />
      <circle cx="-3.5" cy="-1.5" r="1.8" fill="#E88E5A" />
      <circle cx="3.5" cy="-1.5" r="1.8" fill="#E88E5A" />
      <circle cx="0" cy="-3.5" r="1.8" fill="#E88E5A" />
    </g>

    {/* Upper Left Bud */}
    <g transform="translate(18, 14)">
      <circle cx="0" cy="0" r="4" fill="#D4AE68" stroke="#AC8144" strokeWidth="0.6" />
      <circle cx="0" cy="0" r="1.8" fill="#FFF2D1" />
    </g>

    {/* Lower Left Flower */}
    <g transform="translate(12, 42)">
      <circle cx="0" cy="0" r="4.6" fill="#D97036" stroke="#9E3B20" strokeWidth="0.7" />
      <circle cx="0" cy="0" r="2.3" fill="#D4AE68" />
    </g>

    {/* Right Flower */}
    <g transform="translate(60, 30)">
      <circle cx="0" cy="0" r="4.8" fill="#D97036" stroke="#9E3B20" strokeWidth="0.7" />
      <circle cx="0" cy="0" r="2.4" fill="#D4AE68" />
    </g>
  </svg>
);

// ============================================================================
// ORNAMENTAL ARTWORK 7: DECORATIVE CARTOUCHE PLAQUE (ORANGE PILL WITH TABS)
// ============================================================================
export const PlaqueCartouche: React.FC<{ text: string; compact?: boolean }> = ({ text, compact }) => (
  <div className="inline-flex items-center justify-center my-0.5">
    <div
      className={clsx(
        'relative bg-[#D97036] text-[#FCF5E9] shadow-sm flex items-center justify-center rounded-full border border-[#D4AE68]',
        compact ? 'px-3 py-0.5' : 'px-4 sm:px-5 py-0.8'
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#FCF5E9] mr-2" />
      <span
        className={clsx(
          'font-serif uppercase font-bold tracking-[0.2em]',
          compact ? 'text-[8px]' : 'text-[9.5px] sm:text-[11px]'
        )}
      >
        {text}
      </span>
      <span className="w-1.5 h-1.5 rounded-full bg-[#FCF5E9] ml-2" />
    </div>
  </div>
);

// ============================================================================
// ORNAMENTAL ARTWORK 8: ORNATE SECTION DIVIDER
// ============================================================================
export const OrnateSectionDivider: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 200 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={clsx('pointer-events-none select-none w-full max-w-[180px] mx-auto', className)}
    aria-hidden="true"
  >
    <line x1="10" y1="8" x2="80" y2="8" stroke="#D4AE68" strokeWidth="1" strokeDasharray="3 2" />
    <circle cx="88" cy="8" r="1.8" fill="#D97036" />
    <path d="M 100 3 L 105 8 L 100 13 L 95 8 Z" fill="#D4AE68" stroke="#AC8144" strokeWidth="0.6" />
    <circle cx="112" cy="8" r="1.8" fill="#D97036" />
    <line x1="120" y1="8" x2="190" y2="8" stroke="#D4AE68" strokeWidth="1" strokeDasharray="3 2" />
  </svg>
);

// ============================================================================
// MASTER COMPONENT: HERITAGE PARCHMENT ATELIER (TEMPLATE 02)
// ============================================================================
export const RajasthaniHeritageTemplate: React.FC<LayoutProps> = ({
  template,
  restaurant,
  categories,
  rawCategories,
  compact = false,
  onAddToCart,
  isPremium,
  activeCategory,
  setActiveCategory,
}) => {
  // Mobile / Desktop View Mode Switcher
  // When compact (e.g. phone mockups on landing page & mobile), default to 'menu' so food items and prices are showcased immediately
  const [activeViewTab, setActiveViewTab] = useState<'both' | 'cover' | 'menu'>(
    compact ? 'menu' : 'both'
  );

  // Filtered categories
  const displayCategories = categories.length > 0 ? categories : rawCategories;

  // Smartly categorize items:
  // Identify actual bread category for S M L matrix
  const breadCategory = displayCategories.find((cat) =>
    /bread|roti|naan|paratha|kulcha/i.test(cat.name)
  );
  const nonBreadCategories = displayCategories.filter((cat) => cat !== breadCategory);

  // First non-bread category gets the photo stack alongside dish items
  const firstCategory = nonBreadCategories[0] || displayCategories[0];
  // Other non-bread categories
  const otherCategories = nonBreadCategories.slice(1);

  return (
    <div className="w-full select-text font-serif text-[#244740] relative space-y-6 sm:space-y-8">
      {/* Top View Mode Switcher */}
      <div className="flex items-center justify-center gap-1.5 p-1 bg-[#163E36]/90 rounded-full border border-[#D4AE68]/60 shadow-lg mx-auto max-w-[280px]">
        <button
          type="button"
          onClick={() => setActiveViewTab('menu')}
          className={clsx(
            'px-3.5 py-1 rounded-full text-[10.5px] font-sans font-bold uppercase tracking-wider transition-all',
            activeViewTab === 'menu'
              ? 'bg-[#D97036] text-white shadow-sm'
              : 'text-[#FCF5E9] hover:text-white'
          )}
        >
          Menu
        </button>
        <button
          type="button"
          onClick={() => setActiveViewTab('cover')}
          className={clsx(
            'px-3.5 py-1 rounded-full text-[10.5px] font-sans font-bold uppercase tracking-wider transition-all',
            activeViewTab === 'cover'
              ? 'bg-[#D97036] text-white shadow-sm'
              : 'text-[#FCF5E9] hover:text-white'
          )}
        >
          Cover
        </button>
        {!compact && (
          <button
            type="button"
            onClick={() => setActiveViewTab('both')}
            className={clsx(
              'px-3.5 py-1 rounded-full text-[10.5px] font-sans font-bold uppercase tracking-wider transition-all',
              activeViewTab === 'both'
                ? 'bg-[#D97036] text-white shadow-sm'
                : 'text-[#FCF5E9] hover:text-white'
            )}
          >
            Spread View
          </button>
        )}
      </div>

      {/* SPREAD CONTAINER (Side-by-Side on Desktop when "both" is active, or Single View) */}
      <div
        className={clsx(
          'w-full',
          activeViewTab === 'both' && !compact
            ? 'grid grid-cols-1 lg:grid-cols-2 gap-8 items-start max-w-7xl mx-auto'
            : 'max-w-3xl mx-auto space-y-8'
        )}
      >
        {/* ========================================================================= */}
        {/* PAGE ONE: THE ORNATE COVER (HERITAGE PARCHMENT SCALLOPED ARCH) */}
        {/* ========================================================================= */}
        {(activeViewTab === 'both' || activeViewTab === 'cover') && (
          <section aria-label="Menu Front Cover" className="w-full">
            <HeritageParchmentFrame compact={compact} hasBackgroundLace={true}>
              <div className="text-center flex flex-col justify-between py-2 sm:py-3 min-h-[480px] sm:min-h-[580px]">
                {/* Central Scalloped Arch Frame */}
                <div className="relative my-auto max-w-[420px] mx-auto w-full px-1">
                  <ScallopedArchFrame>
                    <div className="relative flex flex-col items-center justify-center px-4 pt-10 sm:pt-12 pb-14 sm:pb-16 text-center space-y-2.5 sm:space-y-3">
                      {/* Top Radiant Blooming Lotus Crest */}
                      <BloomingLotusEmblem size={compact ? 50 : 62} className="mb-0.5" />

                      {/* Indian Cuisine Menu Title */}
                      <p className="font-serif uppercase tracking-[0.28em] text-[10px] sm:text-xs text-[#1B4942] font-black">
                        {restaurant.cuisine ? `${restaurant.cuisine.toUpperCase()} MENU` : 'INDIAN CUISINE MENU'}
                      </p>

                      {/* Restaurant Title in Elegant Signature Calligraphy */}
                      <div className="space-y-0.5 px-2 max-w-[88%] mx-auto">
                        <h1
                          className={clsx(
                            'font-bold tracking-wide leading-snug text-[#1B4942] drop-shadow-xs whitespace-normal break-normal text-balance',
                            "font-['Caveat',cursive]",
                            restaurant.name.length > 24
                              ? 'text-3xl sm:text-4xl'
                              : restaurant.name.length > 14
                              ? 'text-3xl sm:text-4xl lg:text-5xl'
                              : 'text-4xl sm:text-5xl lg:text-6xl'
                          )}
                        >
                          {toTitleCase(restaurant.name)}
                        </h1>

                        {/* Tagline / Subtitle */}
                        {restaurant.tagline && (
                          <p
                            className={clsx(
                              'font-serif italic tracking-wide text-[#D97036] font-medium pt-0.5',
                              compact ? 'text-[11px]' : 'text-xs sm:text-sm'
                            )}
                          >
                            {restaurant.tagline}
                          </p>
                        )}
                      </div>

                      {/* Decorative Plaque Cartouche (Orange Pill with Tabs) */}
                      <PlaqueCartouche
                        text={restaurant.tagline ? 'EXECUTIVE CHEF SELECTION' : 'AUTHENTIC RECIPES'}
                        compact={compact}
                      />

                      {/* Address & Contact Metadata */}
                      <div className="space-y-0.5 text-center pt-1 text-[#6E6657]">
                        {restaurant.address && (
                          <p className="font-sans text-[8px] sm:text-[9.5px] uppercase tracking-[0.18em] font-medium">
                            {restaurant.address}
                          </p>
                        )}
                        <p className="font-sans text-[7.5px] sm:text-[9px] text-[#6E6657] tracking-wider">
                          more info {restaurant.city ? `www.${restaurant.city.toLowerCase().replace(/\s+/g, '')}food.com` : 'www.example.com'}
                        </p>
                        <p className="font-mono text-[8px] sm:text-[9.5px] text-[#1B4942] tracking-wider font-bold pt-0.5">
                          call {restaurant.phone || '+0123-456-789'}
                        </p>
                      </div>

                      {/* Symmetrical Botanical Flowering Shrubs at Arch Base */}
                      <div className="absolute bottom-2 left-1.5 sm:bottom-3 sm:left-3 pointer-events-none z-10">
                        <BotanicalShrub size={compact ? 38 : 50} />
                      </div>
                      <div className="absolute bottom-2 right-1.5 sm:bottom-3 sm:right-3 pointer-events-none z-10">
                        <BotanicalShrub size={compact ? 38 : 50} flip />
                      </div>
                    </div>
                  </ScallopedArchFrame>
                </div>

                {/* Cover Bottom Footer Line */}
                <div className="pt-2 sm:pt-2.5 flex flex-col items-center gap-0.5">
                  <div className="flex items-center justify-center gap-2 text-[#D4AE68] text-xs">
                    <span className="w-8 h-px bg-[#D4AE68]/60" />
                    <span className="text-[9px] uppercase font-serif tracking-[0.25em] text-[#1B4942] font-bold">
                      Royal Haveli Cuisine
                    </span>
                    <span className="w-8 h-px bg-[#D4AE68]/60" />
                  </div>
                </div>
              </div>
            </HeritageParchmentFrame>
          </section>
        )}

        {/* ========================================================================= */}
        {/* PAGE TWO: THE INTERIOR MENU SPREAD (MATCHING USER REFERENCE) */}
        {/* ========================================================================= */}
        {(activeViewTab === 'both' || activeViewTab === 'menu') && (
          <section aria-label="Menu Interior Spread" className="w-full space-y-4 sm:space-y-6">
            {/* Sticky Mobile Category Navigation Bar */}
            {rawCategories.length > 1 && (
              <div className="sticky top-12 z-30 bg-[#FCF5E9]/95 backdrop-blur-md py-2 px-3 rounded-2xl border border-[#1B4942]/30 shadow-md overflow-x-auto scrollbar-none flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className={clsx(
                    'px-3.5 py-1.5 text-xs font-serif tracking-widest rounded-full border transition-all shrink-0 font-bold',
                    activeCategory === 'all'
                      ? 'bg-[#D97036] text-white border-[#D97036] shadow-sm'
                      : 'bg-[#FCF5E9] text-[#1B4942] border-[#1B4942]/40 hover:border-[#1B4942]'
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
                        'px-3.5 py-1.5 text-xs font-serif tracking-widest rounded-full border transition-all shrink-0 whitespace-nowrap font-bold',
                        isActive
                          ? 'bg-[#D97036] text-white border-[#D97036] shadow-sm'
                          : 'bg-[#FCF5E9] text-[#1B4942] border-[#1B4942]/40 hover:border-[#1B4942]'
                      )}
                    >
                      ❖ {cat.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* HARMONIOUS INTERIOR PARCHMENT MENU SPREAD */}
            <HeritageParchmentFrame compact={compact}>
              <div className="space-y-5 sm:space-y-7">
                {/* SECTION 1: PRIMARY CATEGORY (Split Layout: 5 Photo Stack on Left, Dish Rows on Right) */}
                {firstCategory && (
                  <div className="space-y-3">
                    {/* Category Header */}
                    <div className="pb-1 border-b border-[#D4AE68]/50">
                      <h2
                        className={clsx(
                          'font-black text-[#D97036] uppercase tracking-[0.22em]',
                          compact ? 'text-base' : 'text-lg sm:text-xl'
                        )}
                        style={{ fontFamily: template.typography.heading }}
                      >
                        {firstCategory.name}
                      </h2>
                    </div>

                    {/* Editorial Split: Stack on Top/Left, Dish Rows */}
                    <div
                      className={clsx(
                        'grid gap-4 lg:gap-5 items-start',
                        compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-12'
                      )}
                    >
                      {/* Left Column: Numbered Editorial Food Photos */}
                      <div className={clsx('w-full', compact ? 'w-full' : 'md:col-span-5')}>
                        <PhotoCardStack items={firstCategory.items} compact={compact} />
                      </div>

                      {/* Right Column: Dish Rows with Clean Price Alignment */}
                      <div className={clsx('w-full space-y-1.5 min-w-0', compact ? 'w-full' : 'md:col-span-7')}>
                        {firstCategory.items.map((item, idx) => (
                          <DishRow
                            key={item.id}
                            item={item}
                            index={idx + 1}
                            template={template}
                            compact={compact}
                            onAddToCart={onAddToCart}
                            isPremium={isPremium}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 2: BREAD SELECTION (Tabular S M L Matrix) */}
                {breadCategory && (
                  <div className="space-y-2.5 pt-3 border-t border-[#D4AE68]/45">
                    {/* Category Header */}
                    <div className="pb-1 border-b border-[#D4AE68]/50">
                      <h2
                        className={clsx(
                          'font-black text-[#D97036] uppercase tracking-[0.22em]',
                          compact ? 'text-base' : 'text-lg sm:text-xl'
                        )}
                        style={{ fontFamily: template.typography.heading }}
                      >
                        {breadCategory.name}
                      </h2>
                    </div>

                    {/* Multi-Variant S M L Columns */}
                    <BreadVariantSection
                      category={breadCategory}
                      template={template}
                      compact={compact}
                      onAddToCart={onAddToCart}
                      isPremium={isPremium}
                    />
                  </div>
                )}

                {/* SECTION 3: ADDITIONAL CATEGORIES (Starters, Curries, Drinks, Desserts) */}
                {otherCategories.length > 0 && (
                  <div className="space-y-5 pt-3 border-t border-[#D4AE68]/45">
                    {otherCategories.map((cat) => (
                      <div key={cat.id} className="space-y-2">
                        <div className="pb-1 border-b border-[#D76C3C]/40 flex items-center justify-between">
                          <h3
                            className={clsx(
                              'font-black text-[#D97036] uppercase tracking-wider',
                              compact ? 'text-sm' : 'text-base'
                            )}
                            style={{ fontFamily: template.typography.heading }}
                          >
                            {cat.name}
                          </h3>
                          <span className="text-[10px] font-sans font-semibold text-[#6E6657]">
                            {cat.items.length} items
                          </span>
                        </div>

                        <div className="space-y-1">
                          {cat.items.map((item, idx) => (
                            <DishRow
                              key={item.id}
                              item={item}
                              index={idx + 1}
                              template={template}
                              compact={compact}
                              onAddToCart={onAddToCart}
                              isPremium={isPremium}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bottom Interior Location & Reservation Footer */}
                <div className="pt-4 border-t border-[#D4AE68]/50 text-center space-y-0.5 text-xs text-[#6E6657]">
                  <p className="font-sans text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-medium text-[#1B4942]">
                    {restaurant.address || '123 LOCATION NAME, CITY NAME'}
                  </p>
                  <p className="font-sans text-[8.5px] sm:text-[9.5px]">
                    more info {restaurant.city ? `www.${restaurant.city.toLowerCase().replace(/\s+/g, '')}food.com` : 'www.example.com'} | {restaurant.phone || '+0123-456-789'}
                  </p>
                </div>
              </div>
            </HeritageParchmentFrame>
          </section>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// HELPER COMPONENT: NUMBERED EDITORIAL FOOD PHOTO STACK (5 PHOTOS WITH ORANGE BADGES)
// ============================================================================
const PhotoCardStack: React.FC<{
  items: MenuItem[];
  compact?: boolean;
}> = ({ items, compact = false }) => {
  const photoList = DEFAULT_HERITAGE_PHOTOS.map((def, idx) => {
    const itemWithImg = items[idx]?.image ? items[idx] : undefined;
    return {
      num: String(idx + 1).padStart(2, '0'),
      name: itemWithImg ? itemWithImg.name : def.name,
      url: itemWithImg ? itemWithImg.image! : def.url,
      alt: def.alt,
    };
  });

  return (
    <>
      {/* Horizontal Scroll Gallery (visible on small screens OR when compact) */}
      <div
        className={clsx(
          'gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x my-1.5',
          compact ? 'flex' : 'flex md:hidden'
        )}
      >
        {photoList.map((photo) => (
          <div
            key={photo.num}
            className="w-24 sm:w-28 shrink-0 snap-start rounded-lg overflow-hidden border border-[#D4AE68] shadow-xs relative aspect-[4/3] bg-[#FCF5E9]"
          >
            <img
              src={photo.url}
              alt={photo.alt}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.currentTarget.parentElement as HTMLElement)?.style.setProperty('display', 'none');
              }}
            />
            <span className="absolute top-1 left-1 px-1 py-0.2 rounded bg-[#D97036] text-white font-mono text-[7.5px] font-bold shadow-xs">
              {photo.num}
            </span>
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
            <span className="absolute bottom-1 inset-x-1 text-[8px] font-serif uppercase tracking-wider text-white font-bold truncate">
              {photo.name}
            </span>
          </div>
        ))}
      </div>

      {/* Desktop Vertical 5-Photo Column (visible on md+ only when NOT compact) */}
      {!compact && (
        <div className="hidden md:flex flex-col space-y-2">
          {photoList.map((photo) => (
            <div
              key={photo.num}
              className="relative rounded-lg overflow-hidden border border-[#D4AE68]/80 shadow-xs group aspect-[4/3] bg-[#FCF5E9]"
            >
              <img
                src={photo.url}
                alt={photo.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget.parentElement as HTMLElement)?.style.setProperty('display', 'none');
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.2 rounded bg-[#D97036] text-white font-mono text-[9px] font-bold shadow-xs border border-white/40">
                {photo.num}
              </span>
              <span className="absolute bottom-1 left-1.5 right-1.5 text-[9.5px] font-serif uppercase tracking-wider text-white font-bold drop-shadow-sm truncate">
                {photo.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

// ============================================================================
// HELPER COMPONENT: DISH ROW WITH NUMBER BADGE, TEAL POPULAR PILL & PRICE
// ============================================================================
const DishRow: React.FC<{
  item: MenuItem;
  index: number;
  template: any;
  compact?: boolean;
  onAddToCart?: (item: any, priceStr: string, variant?: string) => void;
  isPremium?: boolean;
}> = ({ item, index, template, compact, onAddToCart, isPremium }) => {
  const formattedIndex = String(index).padStart(2, '0');
  const displayPrice = item.price ? `₹${item.price}` : '—';

  return (
    <div className="group py-2 border-b border-[#D4AE68]/25 hover:border-[#D76C3C]/50 transition-colors">
      <div className="flex items-start justify-between gap-3">
        {/* Left: Badge, Diet, Title, Tags, Description */}
        <div className="flex items-start gap-2 min-w-0 flex-1">
          {/* Orange Number Badge */}
          <span className="shrink-0 w-4 h-4 rounded-full bg-[#D97036] text-white flex items-center justify-center font-mono text-[8px] font-bold mt-0.5 shadow-2xs">
            {formattedIndex}
          </span>

          <DietIndicator
            type={item.dietType}
            compact={compact}
            color={item.dietType === 'non-veg' ? '#C85A32' : '#386450'}
            className="mt-0.5 shrink-0"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4
                className={clsx(
                  'font-bold text-[#1B4942] group-hover:text-[#D97036] transition-colors leading-snug',
                  compact ? 'text-xs' : 'text-sm'
                )}
                style={{ fontFamily: template.typography.body }}
              >
                {item.name}
              </h4>

              {/* Popular or Special Pill Badge in Deep Teal */}
              {(item.isBestseller || index === 1) && (
                <span className="text-[7.5px] font-sans font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-[#1B4942] text-[#FCF5E9] shadow-2xs shrink-0">
                  POPULAR
                </span>
              )}
              {index === 2 && !item.isBestseller && (
                <span className="text-[7.5px] font-sans font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-[#386450] text-[#FCF5E9] shadow-2xs shrink-0">
                  SPECIAL
                </span>
              )}
            </div>

            {/* Description */}
            {item.description && (
              <p
                className={clsx(
                  'text-[#6E6657] mt-0.5 leading-relaxed font-serif italic',
                  compact ? 'text-[9.5px] line-clamp-2' : 'text-[11px]'
                )}
              >
                {item.description}
              </p>
            )}
          </div>
        </div>

        {/* Right: Pinned Price */}
        <div className="shrink-0 flex items-center gap-1.5 pl-2 text-right pt-0.5">
          <span className="font-serif font-black text-xs sm:text-sm text-[#1B4942] tracking-wider whitespace-nowrap">
            {displayPrice}
          </span>

          {isPremium && onAddToCart && (
            <button
              type="button"
              onClick={() => onAddToCart(item, String(item.price || ''))}
              className="text-[9px] font-bold px-1.5 py-0.5 bg-[#D97036] text-white rounded hover:bg-[#b65023] transition-colors cursor-pointer"
              aria-label={`Add ${item.name} to order`}
            >
              +
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// HELPER COMPONENT: MULTI-VARIANT / TABULAR BREAD SECTION (S M L MATRIX)
// ============================================================================
const BreadVariantSection: React.FC<{
  category: { id: string; name: string; items: MenuItem[] };
  template: any;
  compact?: boolean;
  onAddToCart?: (item: any, priceStr: string, variant?: string) => void;
  isPremium?: boolean;
}> = ({ category, template, compact, onAddToCart, isPremium }) => {
  return (
    <div className="space-y-1.5 w-full">
      {/* S M L Table Header Row */}
      <div className="flex items-center justify-between pb-1 border-b border-[#D4AE68]/50 text-[10px] font-serif uppercase tracking-widest text-[#6E6657] font-bold">
        <span>Bread Selection</span>
        <div className="grid grid-cols-3 gap-2 w-32 sm:w-44 text-center font-black text-[#1B4942]">
          <span>S</span>
          <span>M</span>
          <span>L</span>
        </div>
      </div>

      {/* Bread Rows */}
      <div className="space-y-1">
        {category.items.map((item) => {
          const basePriceNum = Number(item.price) || 40;
          const sPrice = item.halfPrice || item.regPrice || basePriceNum;
          const mPrice = item.price || Math.round(basePriceNum * 1.15);
          const lPrice = item.fullPrice || item.largePrice || Math.round(basePriceNum * 1.3);

          return (
            <div
              key={item.id}
              className="flex items-center justify-between py-1.5 border-b border-[#D4AE68]/20 hover:border-[#D76C3C]/40 transition-colors"
            >
              <div className="flex items-center gap-1.5 min-w-0 flex-1 pr-2">
                <DietIndicator type={item.dietType} compact={compact} color="#386450" />
                <span
                  className="font-bold text-xs sm:text-sm text-[#1B4942] truncate"
                  style={{ fontFamily: template.typography.body }}
                >
                  {item.name}
                </span>
              </div>

              {/* Price Multi-Columns */}
              <div className="grid grid-cols-3 gap-2 w-32 sm:w-44 text-center font-serif text-xs font-black text-[#1B4942] shrink-0">
                <button
                  type="button"
                  disabled={!isPremium || !onAddToCart}
                  onClick={() => onAddToCart?.(item, String(sPrice), 'Small')}
                  className={clsx(isPremium && onAddToCart && 'hover:text-[#D97036] hover:underline cursor-pointer')}
                >
                  ₹{sPrice}
                </button>
                <button
                  type="button"
                  disabled={!isPremium || !onAddToCart}
                  onClick={() => onAddToCart?.(item, String(mPrice), 'Medium')}
                  className={clsx(isPremium && onAddToCart && 'hover:text-[#D97036] hover:underline cursor-pointer')}
                >
                  ₹{mPrice}
                </button>
                <button
                  type="button"
                  disabled={!isPremium || !onAddToCart}
                  onClick={() => onAddToCart?.(item, String(lPrice), 'Large')}
                  className={clsx(isPremium && onAddToCart && 'hover:text-[#D97036] hover:underline cursor-pointer')}
                >
                  ₹{lPrice}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RajasthaniHeritageTemplate;
