import React, { useState } from 'react';
import clsx from 'clsx';
import type { LayoutProps, MenuItem } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../shared/RenderItemPrices';

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
        compact ? 'p-1.5' : 'p-3 sm:p-5 lg:p-6',
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
        <div className={clsx("rounded-lg border border-[#D4AE68] pointer-events-none absolute", compact ? "inset-0.5" : "inset-1 sm:inset-1.5")} />

        {/* Sawtooth Chevron Bands along edges */}
        <div className={clsx("absolute top-2 h-1 pointer-events-none overflow-hidden", compact ? "inset-x-6" : "inset-x-9 sm:inset-x-12")}>
          <SawtoothBorderStrip />
        </div>
        <div className={clsx("absolute bottom-2 h-1 pointer-events-none overflow-hidden", compact ? "inset-x-6" : "inset-x-9 sm:inset-x-12")}>
          <SawtoothBorderStrip />
        </div>
        <div className={clsx("absolute left-2 w-1 pointer-events-none overflow-hidden", compact ? "inset-y-6" : "inset-y-9 sm:inset-y-12")}>
          <SawtoothBorderStrip vertical />
        </div>
        <div className={clsx("absolute right-2 w-1 pointer-events-none overflow-hidden", compact ? "inset-y-6" : "inset-y-9 sm:inset-y-12")}>
          <SawtoothBorderStrip vertical />
        </div>

        {/* Four Symmetrical Corner Rosettes */}
        <div className="absolute top-0.5 left-0.5 z-20">
          <HeritageFloralCorner size={compact ? 24 : 38} rotation={0} />
        </div>
        <div className="absolute top-0.5 right-0.5 z-20">
          <HeritageFloralCorner size={compact ? 24 : 38} rotation={90} />
        </div>
        <div className="absolute bottom-0.5 right-0.5 z-20">
          <HeritageFloralCorner size={compact ? 24 : 38} rotation={180} />
        </div>
        <div className="absolute bottom-0.5 left-0.5 z-20">
          <HeritageFloralCorner size={compact ? 24 : 38} rotation={270} />
        </div>

        {/* Perimeter Floral Strips (Desktop only to prevent mobile cramping) */}
        {!compact && (
          <>
            <div className="absolute top-4 inset-x-9 sm:inset-x-14 h-5 pointer-events-none overflow-hidden flex items-center justify-around opacity-95">
              <RepeatingFloralStrip />
            </div>
            <div className="absolute bottom-4 inset-x-9 sm:inset-x-14 h-5 pointer-events-none overflow-hidden flex items-center justify-around opacity-95 transform rotate-180">
              <RepeatingFloralStrip />
            </div>
            <div className="absolute left-4 inset-y-9 sm:inset-y-14 w-5 pointer-events-none overflow-hidden flex flex-col items-center justify-around opacity-95">
              <RepeatingFloralStrip vertical />
            </div>
            <div className="absolute right-4 inset-y-9 sm:inset-y-14 w-5 pointer-events-none overflow-hidden flex flex-col items-center justify-around opacity-95 transform rotate-180">
              <RepeatingFloralStrip vertical />
            </div>
          </>
        )}

        {/* Inner Content Protective Dotted Hairline Rule */}
        <div className={clsx("rounded-md border border-dashed border-[#D76C3C]/45 pointer-events-none absolute", compact ? "inset-1.5" : "inset-8 sm:inset-9")} />

        {/* Inner Content Area */}
        <div className={clsx("relative z-10 w-full flex-1", compact ? "px-2.5 py-3" : "px-9 sm:px-11 lg:px-12 pt-11 pb-10 sm:pt-12 sm:pb-11")}>{children}</div>
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
  compact?: boolean;
}> = ({ children, className = '', compact = false }) => (
  <div className={clsx('relative w-full max-w-[440px] mx-auto flex flex-col items-center justify-center', className)}>
    <svg
      viewBox="0 0 400 540"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full pointer-events-none select-none filter drop-shadow-[0_12px_28px_rgba(27,73,66,0.22)]"
      preserveAspectRatio="none"
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
    <div
      className={clsx(
        'relative z-10 w-full flex flex-col items-center justify-center text-center',
        compact ? 'px-6 pt-9 pb-10' : 'px-8 sm:px-12 pt-12 sm:pt-16 pb-14 sm:pb-18'
      )}
    >
      {children}
    </div>
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
  searchBar,
}) => {
  // Mobile / Desktop View Mode Switcher: "Cover" vs "Menu" vs "All"
  const [activeViewTab, setActiveViewTab] = useState<'both' | 'cover' | 'menu'>('both');

  // Filtered categories
  const displayCategories = categories.length > 0 ? categories : rawCategories;

  // Smartly identify bread category for S M L tabular matrix
  const breadCategory = displayCategories.find((cat) =>
    /bread|roti|naan|paratha|kulcha/i.test(cat.name)
  );
  const nonBreadCategories = displayCategories.filter((cat) => cat !== breadCategory);

  // First non-bread category gets the photo stack alongside dish items
  const firstCategory = nonBreadCategories[0] || displayCategories[0];
  // Other non-bread categories
  const otherCategories = nonBreadCategories.slice(1);

  // Whether a single category is filtered
  const isFiltered = activeCategory !== 'all';
  const selectedCategory = isFiltered
    ? rawCategories.find((c) => c.id === activeCategory || c.name === activeCategory)
    : null;

  return (
    <div
      className={clsx(
        'w-full select-text font-serif text-[#244740] relative max-w-4xl mx-auto',
        compact ? 'space-y-3' : 'space-y-6 sm:space-y-8'
      )}
    >
      {/* ═══════════════════════════════════════════════════════════════════════
          VIEW MODE TOGGLE SWITCHER: [❖ COVER] [❖ MENU] [❖ ALL]
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="pt-2 pb-1.5 flex items-center justify-center sticky top-2 z-40">
        <div className="flex items-center gap-1 p-1 bg-[#163E36]/95 backdrop-blur-md rounded-full border border-[#D4AE68]/60 shadow-xl">
          <button
            type="button"
            onClick={() => setActiveViewTab('cover')}
            className={clsx(
              'px-3.5 py-1 rounded-full text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer',
              activeViewTab === 'cover'
                ? 'bg-[#D97036] text-white shadow-md'
                : 'text-[#FCF5E9]/80 hover:text-white hover:bg-[#D4AE68]/20'
            )}
          >
            ❖ Cover
          </button>
          <button
            type="button"
            onClick={() => setActiveViewTab('menu')}
            className={clsx(
              'px-3.5 py-1 rounded-full text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer',
              activeViewTab === 'menu'
                ? 'bg-[#D97036] text-white shadow-md'
                : 'text-[#FCF5E9]/80 hover:text-white hover:bg-[#D4AE68]/20'
            )}
          >
            ❖ Menu
          </button>
          <button
            type="button"
            onClick={() => setActiveViewTab('both')}
            className={clsx(
              'px-3.5 py-1 rounded-full text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer',
              activeViewTab === 'both'
                ? 'bg-[#D97036] text-white shadow-md'
                : 'text-[#FCF5E9]/80 hover:text-white hover:bg-[#D4AE68]/20'
            )}
          >
            ❖ All
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          PAGE ONE: FRONT COVER PAGE (THE ORNATE SCALLOPED ARCH OF ROYAL HAVELI)
          ═══════════════════════════════════════════════════════════════════════ */}
      {(activeViewTab === 'both' || activeViewTab === 'cover') && (
        <section aria-label="Menu Front Cover" className="w-full flex justify-center">
          <div className="w-full max-w-md sm:max-w-lg">
            <HeritageParchmentFrame compact={compact} hasBackgroundLace={true} className="text-center relative">
              <ScallopedArchFrame compact={compact}>
                <div className="flex flex-col items-center justify-center space-y-2 sm:space-y-3 relative w-full">
                  {/* Top Blooming Lotus Crest or Client Logo with Symmetrical Gold Connector Lines */}
                  <div className="flex items-center justify-center gap-2.5">
                    <span className="h-px w-8 sm:w-14 bg-gradient-to-r from-transparent to-[#D4AE68]" />
                    {restaurant.logo ? (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FCF5E9] p-1 border-2 border-[#D4AE68] shadow-md flex items-center justify-center overflow-hidden">
                        <img src={restaurant.logo} alt={restaurant.name} className="w-full h-full object-contain rounded-full" />
                      </div>
                    ) : (
                      <BloomingLotusEmblem size={compact ? 36 : 46} />
                    )}
                    <span className="h-px w-8 sm:w-14 bg-gradient-to-l from-transparent to-[#D4AE68]" />
                  </div>

                  {/* Subtitle / Edition */}
                  <p className="font-serif uppercase tracking-[0.25em] text-[9px] sm:text-[10.5px] text-[#D97036] font-bold">
                    {restaurant.cuisine ? `${restaurant.cuisine.split(' ')[0].toUpperCase()} CUISINE MENU` : 'INDIAN CUISINE MENU'}
                  </p>

                  {/* Restaurant Title in Elegant Signature Calligraphy */}
                  <div className="space-y-0.5 px-2 max-w-[92%] mx-auto">
                    <h1
                      className={clsx(
                        'font-bold tracking-wide leading-tight text-[#1B4942] drop-shadow-xs whitespace-normal break-normal text-balance',
                        "font-['Caveat',cursive]",
                        compact
                          ? 'text-2xl sm:text-3xl'
                          : restaurant.name.length > 24
                          ? 'text-2xl sm:text-3xl md:text-4xl'
                          : 'text-3xl sm:text-4xl lg:text-4xl'
                      )}
                    >
                      {toTitleCase(restaurant.name)}
                    </h1>

                    {/* Tagline / Subtitle */}
                    {restaurant.tagline && (
                      <p
                        className={clsx(
                          'font-serif italic tracking-wide text-[#D97036] font-medium',
                          compact ? 'text-[10px]' : 'text-xs sm:text-sm'
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
                  <div className="text-center text-[#6E6657] pt-1 space-y-0.5">
                    {(restaurant.address || restaurant.city) && (
                      <p className="font-sans text-[8px] sm:text-[9.5px] tracking-wider uppercase font-semibold text-[#1B4942]">
                        {[restaurant.address, restaurant.city].filter(Boolean).join(', ')}
                      </p>
                    )}
                    {restaurant.phone && (
                      <p className="font-sans text-[7.5px] sm:text-[8.5px] tracking-wider text-[#6E6657] font-medium">
                        Order & Table Booking: {restaurant.phone}
                      </p>
                    )}
                  </div>
                </div>
              </ScallopedArchFrame>

              {/* Symmetrical Botanical Flowering Shrubs in Bottom Corners outside the Arch */}
              <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 pointer-events-none opacity-85 z-20">
                <BotanicalShrub size={compact ? 28 : 38} />
              </div>
              <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 pointer-events-none opacity-85 z-20">
                <BotanicalShrub size={compact ? 28 : 38} flip />
              </div>
            </HeritageParchmentFrame>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          UNIVERSAL MENU SEARCH
          ═══════════════════════════════════════════════════════════════════════ */}
      {activeViewTab !== 'cover' && searchBar}

      {/* ═══════════════════════════════════════════════════════════════════════
          PAGE TWO: INTERIOR MENU SPREAD (CONTINUOUS OPULENT BOOKLET PAGE)
          ═══════════════════════════════════════════════════════════════════════ */}
      {(activeViewTab === 'both' || activeViewTab === 'menu') && (
        <section aria-label="Interior Menu Spread" className="w-full space-y-4">
          {/* Sticky Category Quick Filter Pills */}
          {rawCategories.length > 1 && (
            <div className="sticky top-14 z-30 bg-[#163E36]/95 backdrop-blur-md py-2 px-3 rounded-full border border-[#D4AE68]/45 shadow-xl flex items-center gap-1.5 overflow-x-auto scrollbar-none max-w-2xl mx-auto">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={clsx(
                  'px-3.5 py-1 text-xs font-serif tracking-widest rounded-full transition-all shrink-0 font-bold cursor-pointer',
                  activeCategory === 'all'
                    ? 'bg-[#D97036] text-white shadow-sm'
                    : 'text-[#FCF5E9] hover:bg-[#D4AE68]/20'
                )}
              >
                ❖ All Dishes
              </button>
              {rawCategories.map((cat) => {
                const isActive = activeCategory === cat.id || activeCategory === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={clsx(
                      'px-3 py-1 text-xs font-serif tracking-widest rounded-full transition-all shrink-0 whitespace-nowrap font-bold cursor-pointer',
                      isActive
                        ? 'bg-[#D97036] text-white shadow-sm'
                        : 'text-[#FCF5E9] hover:bg-[#D4AE68]/20'
                    )}
                  >
                    ❖ {cat.name} ({cat.items.length})
                  </button>
                );
              })}
            </div>
          )}

          {/* UNIFIED INTERIOR BOOKLET SHEET */}
          <HeritageParchmentFrame compact={compact}>
            <div className="space-y-6 sm:space-y-8">
              {/* VIEW A: FILTERED SINGLE CATEGORY VIEW */}
              {isFiltered && selectedCategory && (
                <div className="space-y-4">
                  <div className="text-center space-y-1 pb-2">
                    <h2
                      className={clsx(
                        'font-black text-[#D97036] uppercase tracking-[0.22em] inline-block px-4 py-1 rounded bg-[#FCF5E9] border border-[#D4AE68]/50 shadow-xs',
                        compact ? 'text-xs' : 'text-sm sm:text-base'
                      )}
                      style={{ fontFamily: template.typography.heading }}
                    >
                      ❖ {selectedCategory.name} ❖
                    </h2>
                    <OrnateSectionDivider />
                  </div>

                  {/bread|roti|naan|paratha|kulcha/i.test(selectedCategory.name) ? (
                    <BreadVariantSection
                      category={selectedCategory}
                      template={template}
                      compact={compact}
                      onAddToCart={onAddToCart}
                      isPremium={isPremium}
                    />
                  ) : (
                    <div className="space-y-1.5">
                      {selectedCategory.items.map((item, idx) => (
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
                  )}
                </div>
              )}

              {/* VIEW B: COMPLETE CONTINUOUS MENU SPREAD (ALL CATEGORIES) */}
              {!isFiltered && (
                <>
                  {/* 1. PRIMARY CATEGORY (STARTERS / MAINS) WITH 5-PHOTO STACK */}
                  {firstCategory && (
                    <div className="space-y-4">
                      {/* Overall Signature Photo Showcase across the TOP */}
                      <PhotoCardStack items={firstCategory.items} compact={compact} />

                      <div className="text-center space-y-1 pb-2 pt-1">
                        <h2
                          className={clsx(
                            'font-black text-[#D97036] uppercase tracking-[0.22em] inline-block px-4 py-1 rounded bg-[#FCF5E9] border border-[#D4AE68]/50 shadow-xs',
                            compact ? 'text-xs' : 'text-sm sm:text-base'
                          )}
                          style={{ fontFamily: template.typography.heading }}
                        >
                          ❖ {firstCategory.name} ❖
                        </h2>
                        <OrnateSectionDivider />
                      </div>

                      {/* Full Width Dish Rows */}
                      <div className="w-full space-y-1 min-w-0">
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
                  )}

                  {/* 2. TANDOORI BREAD SELECTION (TABULAR S M L MATRIX) */}
                  {breadCategory && (
                    <div className="space-y-3 pt-4 border-t border-[#D4AE68]/40">
                      <div className="text-center space-y-1 pb-1">
                        <h2
                          className={clsx(
                            'font-black text-[#D97036] uppercase tracking-[0.22em] inline-block px-4 py-1 rounded bg-[#FCF5E9] border border-[#D4AE68]/50 shadow-xs',
                            compact ? 'text-xs' : 'text-sm sm:text-base'
                          )}
                          style={{ fontFamily: template.typography.heading }}
                        >
                          ❖ {breadCategory.name} ❖
                        </h2>
                        <OrnateSectionDivider />
                      </div>

                      <BreadVariantSection
                        category={breadCategory}
                        template={template}
                        compact={compact}
                        onAddToCart={onAddToCart}
                        isPremium={isPremium}
                      />
                    </div>
                  )}

                  {/* 3. ADDITIONAL CATEGORIES (CURRIES, RICE, DESSERTS, DRINKS) */}
                  {otherCategories.map((cat) => (
                    <div key={cat.id} className="space-y-3 pt-4 border-t border-[#D4AE68]/40">
                      <div className="text-center space-y-1 pb-1">
                        <h2
                          className={clsx(
                            'font-black text-[#D97036] uppercase tracking-[0.22em] inline-block px-4 py-1 rounded bg-[#FCF5E9] border border-[#D4AE68]/50 shadow-xs',
                            compact ? 'text-xs' : 'text-sm sm:text-base'
                          )}
                          style={{ fontFamily: template.typography.heading }}
                        >
                          ❖ {cat.name} ❖
                        </h2>
                        <OrnateSectionDivider />
                      </div>

                      <div className="space-y-1.5">
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
                </>
              )}

              {/* 4. CLOSING RESERVATIONS & LOCATION FOOTER */}
              <div className="pt-5 border-t border-[#D4AE68]/50 text-center space-y-2">
                <OrnateSectionDivider />
                <h3 className="font-serif font-black text-sm uppercase tracking-[0.2em] text-[#1B4942]">
                  {restaurant.name}
                </h3>
                <p className="font-sans text-[9.5px] sm:text-[10.5px] uppercase tracking-[0.2em] font-medium text-[#D97036]">
                  {restaurant.address || '123 ROYAL HAVELI MARG, HERITAGE CITY'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 text-[9px] sm:text-[10px] text-[#6E6657] pt-1 font-sans">
                  <span>✦ Open Daily: 12:00 PM – 11:30 PM</span>
                  {restaurant.phone && <span>✦ Reservations: {restaurant.phone}</span>}
                  <span>✦ {restaurant.city ? `www.${restaurant.city.toLowerCase().replace(/\s+/g, '')}food.com` : 'www.example.com'}</span>
                </div>
                <p className="text-[8.5px] sm:text-[9.5px] font-serif italic text-[#1B4942]/75 pt-1">
                  Handcrafted Royal Haveli Cuisine • Authentic Indian Spices
                </p>
              </div>
            </div>
          </HeritageParchmentFrame>
        </section>
      )}
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
    <div className="w-full pb-2">
      {/* Horizontal Scroll Gallery (visible on small screens OR when compact) */}
      <div
        className={clsx(
          'gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x my-1',
          compact ? 'flex' : 'flex md:hidden'
        )}
      >
        {photoList.map((photo) => (
          <div
            key={photo.num}
            className={clsx(
              'shrink-0 snap-start rounded-lg overflow-hidden border border-[#D4AE68] shadow-xs relative aspect-[4/3] bg-[#FCF5E9]',
              compact ? 'w-24 sm:w-28' : 'w-32 sm:w-36'
            )}
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
            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-[#D97036] text-white font-mono text-[8.5px] font-bold shadow-xs">
              {photo.num}
            </span>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <span className="absolute bottom-1.5 inset-x-1.5 text-[9px] font-serif uppercase tracking-wider text-white font-bold truncate">
              {photo.name}
            </span>
          </div>
        ))}
      </div>

      {/* Desktop Horizontal 5-Photo Grid Row across the TOP (visible on md+ only when NOT compact) */}
      {!compact && (
        <div className="hidden md:grid grid-cols-5 gap-3.5 mb-2">
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-[#D97036] text-white font-mono text-[9px] font-bold shadow-xs border border-white/40">
                {photo.num}
              </span>
              <span className="absolute bottom-1.5 left-1.5 right-1.5 text-[9.5px] font-serif uppercase tracking-wider text-white font-bold drop-shadow-sm truncate">
                {photo.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// HELPER COMPONENT: DISH ROW WITH NUMBER BADGE, TEAL POPULAR PILL & PINNED PRICE
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
  const pricing = parseItemPricing(item);

  return (
    <div className="group/dish py-1.5 sm:py-2.5 border-b border-[#D4AE68]/25 hover:border-[#D76C3C]/50 transition-colors">
      <div className="flex items-start justify-between gap-1.5 sm:gap-3">
        {/* Left: Number Badge + Diet Indicator + Title & Description Column */}
        <div className="flex items-start gap-1.5 sm:gap-2 min-w-0 flex-1">
          {/* Circular Number Badge: Top-anchored to first line of text */}
          <span
            className={clsx(
              'shrink-0 rounded-full bg-[#D97036] text-white flex items-center justify-center font-mono font-bold shadow-2xs mt-0.5',
              compact ? 'w-3.5 h-3.5 text-[7px]' : 'w-4 h-4 sm:w-4.5 sm:h-4.5 text-[8px] sm:text-[8.5px]'
            )}
          >
            {formattedIndex}
          </span>

          {/* Diet Indicator: Top-anchored to first line of text */}
          <div className="shrink-0 mt-0.5">
            <DietIndicator
              type={item.dietType}
              compact={compact}
              color={item.dietType === 'non-veg' ? '#C85A32' : '#386450'}
            />
          </div>

          {/* Title + Pill Badges + Description Column */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4
                className={clsx(
                  'font-bold text-[#1B4942] group-hover/dish:text-[#D97036] transition-colors leading-snug',
                  compact ? 'text-xs' : 'text-sm sm:text-base'
                )}
                style={{ fontFamily: template.typography.body }}
              >
                {item.name}
              </h4>

              {(item.isBestseller || index === 1) && (
                <span
                  className={clsx(
                    'font-sans font-bold uppercase tracking-wider rounded-full bg-[#1B4942] text-[#FCF5E9] shadow-2xs shrink-0',
                    compact ? 'text-[6.5px] px-1 py-0.2' : 'text-[7.5px] sm:text-[8px] px-1.5 py-0.5'
                  )}
                >
                  POPULAR
                </span>
              )}
              {index === 2 && !item.isBestseller && (
                <span
                  className={clsx(
                    'font-sans font-bold uppercase tracking-wider rounded-full bg-[#386450] text-[#FCF5E9] shadow-2xs shrink-0',
                    compact ? 'text-[6.5px] px-1 py-0.2' : 'text-[7.5px] sm:text-[8px] px-1.5 py-0.5'
                  )}
                >
                  SPECIAL
                </span>
              )}
            </div>

            {/* Description: Takes full available horizontal width */}
            {pricing.cleanDescription && (
              <p
                className={clsx(
                  'text-[#6E6657] font-serif italic mt-0.5 pr-1',
                  compact ? 'text-[9.5px] leading-snug line-clamp-2' : 'text-xs sm:text-[13px] leading-relaxed'
                )}
              >
                {pricing.cleanDescription}
              </p>
            )}
          </div>
        </div>

        {/* Right: Pinned Price Badges & Add to Cart */}
        <div className="shrink-0 flex items-center gap-1.5 pl-1.5 self-start mt-0.5">
          <RenderItemPrices
            item={item}
            accentColor="#D97036"
            isPremium={isPremium}
            onAddToCart={onAddToCart}
            priceClassName="font-serif font-black text-[#1B4942] tracking-wider whitespace-nowrap bg-[#FCF5E9] rounded border border-[#D4AE68]/60 shadow-2xs text-xs sm:text-sm px-2 py-0.5"
            btnStyle="text-[9px] font-bold px-2 py-0.5 bg-[#D97036] text-white rounded hover:bg-[#b65023] transition-colors cursor-pointer shrink-0"
            compact={compact}
          />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// HELPER COMPONENT: MULTI-VARIANT / TABULAR BREAD SECTION
// ============================================================================
const BreadVariantSection: React.FC<{
  category: { id: string; name: string; items: MenuItem[] };
  template: any;
  compact?: boolean;
  onAddToCart?: (item: any, priceStr: string, variant?: string) => void;
  isPremium?: boolean;
}> = ({ category, template, compact, onAddToCart, isPremium }) => {
  return (
    <div className="space-y-1 w-full">
      {category.items.map((item, idx) => (
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
  );
};

export default RajasthaniHeritageTemplate;
