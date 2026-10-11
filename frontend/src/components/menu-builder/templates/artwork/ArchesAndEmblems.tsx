import React from 'react';

// ============================================================================
// 01. PALACE CROWN & SUNBURST EMBLEM (Royal Maharaja)
// ============================================================================
export const PalaceCrownEmblem: React.FC<{
  className?: string;
  color?: string;
  size?: number;
}> = ({ className = '', color = '#D4AF37', size = 36 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Sunburst rays */}
    <g stroke={color} strokeWidth="1" strokeOpacity="0.4">
      <line x1="32" y1="2" x2="32" y2="10" />
      <line x1="48" y1="6" x2="44" y2="13" />
      <line x1="16" y1="6" x2="20" y2="13" />
      <line x1="58" y1="18" x2="51" y2="22" />
      <line x1="6" y1="18" x2="13" y2="22" />
    </g>
    {/* Central Crown */}
    <path
      d="M14 44 L20 22 L32 32 L44 22 L50 44 Z"
      fill={color}
      fillOpacity="0.15"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Crown Jewels */}
    <circle cx="20" cy="20" r="3" fill={color} />
    <circle cx="32" cy="16" r="3.5" fill={color} />
    <circle cx="44" cy="20" r="3" fill={color} />
    {/* Base Band */}
    <rect x="14" y="44" width="36" height="6" rx="1.5" fill={color} />
    <circle cx="22" cy="47" r="1.5" fill="#180912" />
    <circle cx="32" cy="47" r="1.5" fill="#180912" />
    <circle cx="42" cy="47" r="1.5" fill="#180912" />
  </svg>
);

// ============================================================================
// 02. BLOOMING LOTUS MEDALLION (Rajasthani Heritage)
// ============================================================================
export const LotusMedallion: React.FC<{
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
  size?: number;
}> = ({ className = '', primaryColor = '#D76C3C', secondaryColor = '#315A53', size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Central Petal */}
    <path
      d="M24 8 C22 18, 20 26, 24 34 C28 26, 26 18, 24 8 Z"
      fill={primaryColor}
    />
    {/* Left Inner Petal */}
    <path
      d="M24 14 C17 19, 14 27, 21 34 C22 28, 23 20, 24 14 Z"
      fill={primaryColor}
      fillOpacity="0.85"
    />
    {/* Right Inner Petal */}
    <path
      d="M24 14 C31 19, 34 27, 27 34 C26 28, 25 20, 24 14 Z"
      fill={primaryColor}
      fillOpacity="0.85"
    />
    {/* Left Outer Wing Petal */}
    <path
      d="M22 24 C12 24, 8 32, 17 36 C20 34, 21 29, 22 24 Z"
      fill={primaryColor}
      fillOpacity="0.65"
    />
    {/* Right Outer Wing Petal */}
    <path
      d="M26 24 C36 24, 40 32, 31 36 C28 34, 27 29, 26 24 Z"
      fill={primaryColor}
      fillOpacity="0.65"
    />
    {/* Base Calyx Leaves */}
    <path
      d="M16 36 C20 38, 28 38, 32 36 C30 41, 18 41, 16 36 Z"
      fill={secondaryColor}
    />
    {/* Dewdrop dot */}
    <circle cx="24" cy="5" r="1.5" fill={primaryColor} />
  </svg>
);

// ============================================================================
// 03. BANARASI KALKA / PAISLEY EMBROIDERY (Banarasi Gold)
// ============================================================================
export const BanarasiKalka: React.FC<{
  className?: string;
  color?: string;
  size?: number;
}> = ({ className = '', color = '#FFD700', size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Paisley Outer Body */}
    <path
      d="M24 4 C10 14, 6 30, 14 42 C20 50, 32 50, 38 42 C44 32, 40 18, 30 14 C26 12, 22 8, 24 4 Z"
      fill={color}
      fillOpacity="0.18"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Inner Floral Rosette */}
    <circle cx="25" cy="34" r="5" fill={color} fillOpacity="0.4" />
    <circle cx="25" cy="34" r="2" fill={color} />
    {/* Zari Seed Hatching */}
    <path
      d="M21 22 Q25 28 29 22 M18 28 Q25 34 32 28 M18 38 Q25 44 32 38"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeOpacity="0.8"
    />
  </svg>
);

// ============================================================================
// 04. DRAVIDIAN TEMPLE GOPURAM SILHOUETTE (Southern Heritage)
// ============================================================================
export const TempleGopuramCrest: React.FC<{
  className?: string;
  maroon?: string;
  brass?: string;
  size?: number;
}> = ({ className = '', maroon = '#6E1B1B', brass = '#C28838', size = 36 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Kalasam finials (Top 3 brass spires) */}
    <circle cx="32" cy="6" r="2" fill={brass} />
    <path d="M30 8 L32 2 L34 8 Z" fill={brass} />
    <circle cx="25" cy="9" r="1.5" fill={brass} />
    <circle cx="39" cy="9" r="1.5" fill={brass} />
    {/* Stepped Temple Tower Tiers */}
    <rect x="26" y="12" width="12" height="6" rx="1" fill={maroon} stroke={brass} strokeWidth="1" />
    <rect x="22" y="19" width="20" height="7" rx="1" fill={maroon} stroke={brass} strokeWidth="1" />
    <rect x="18" y="27" width="28" height="8" rx="1" fill={maroon} stroke={brass} strokeWidth="1" />
    <rect x="14" y="36" width="36" height="9" rx="1" fill={maroon} stroke={brass} strokeWidth="1" />
    <rect x="10" y="46" width="44" height="11" rx="1" fill={maroon} stroke={brass} strokeWidth="1.5" />
    {/* Sacred Gateway Opening */}
    <path d="M26 57 C26 50, 38 50, 38 57 Z" fill={brass} />
  </svg>
);

// ============================================================================
// 05. VINTAGE CUTTING CHAI GLASS (Bombay Street)
// ============================================================================
export const ChaiGlassEmblem: React.FC<{
  className?: string;
  primary?: string;
  accent?: string;
  size?: number;
}> = ({ className = '', primary = '#C82323', accent = '#F26522', size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Steam Wafts */}
    <path
      d="M20 12 C18 9, 21 6, 19 3 M25 12 C23 9, 26 6, 24 3 M29 12 C27 9, 30 6, 28 3"
      stroke={accent}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeOpacity="0.75"
    />
    {/* Cutting Chai Fluted Glass Outline */}
    <path
      d="M14 14 L17 42 C17 44, 31 44, 31 42 L34 14 Z"
      fill={accent}
      fillOpacity="0.25"
      stroke={primary}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Cutting Glass Fluted Ribs */}
    <line x1="21" y1="18" x2="22" y2="40" stroke={primary} strokeWidth="1" strokeOpacity="0.5" />
    <line x1="24" y1="18" x2="24" y2="40" stroke={primary} strokeWidth="1" strokeOpacity="0.5" />
    <line x1="27" y1="18" x2="26" y2="40" stroke={primary} strokeWidth="1" strokeOpacity="0.5" />
    {/* Hot Tea Fill Level */}
    <path d="M16 26 L17.5 41 C18 42.5, 30 42.5, 30.5 41 L32 26 Z" fill={accent} fillOpacity="0.7" />
  </svg>
);

// ============================================================================
// 06. ARTISANAL COFFEE BRANCH (Coffee House)
// ============================================================================
export const CoffeeBranchEmblem: React.FC<{
  className?: string;
  woodColor?: string;
  leafColor?: string;
  size?: number;
}> = ({ className = '', woodColor = '#E0A96D', leafColor = '#4A6B5D', size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Central Branch */}
    <path d="M6 42 Q24 24 42 6" stroke={woodColor} strokeWidth="2" strokeLinecap="round" />
    {/* Left Leaf */}
    <path
      d="M18 30 C12 28, 10 20, 16 16 C22 18, 22 26, 18 30 Z"
      fill={leafColor}
      fillOpacity="0.75"
      stroke={woodColor}
      strokeWidth="1"
    />
    {/* Right Leaf */}
    <path
      d="M30 18 C36 14, 42 16, 40 24 C34 26, 28 22, 30 18 Z"
      fill={leafColor}
      fillOpacity="0.75"
      stroke={woodColor}
      strokeWidth="1"
    />
    {/* Ripe Coffee Cherries */}
    <circle cx="26" cy="23" r="3.5" fill="#B81D1D" stroke={woodColor} strokeWidth="1" />
    <circle cx="21" cy="26" r="3" fill="#D76C3C" stroke={woodColor} strokeWidth="1" />
  </svg>
);

// ============================================================================
// 07. WHEAT STALK / SOURDOUGH EAR (Paper Cafe)
// ============================================================================
export const WheatStalkEmblem: React.FC<{
  className?: string;
  color?: string;
  size?: number;
}> = ({ className = '', color = '#A65628', size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Stem */}
    <line x1="24" y1="46" x2="24" y2="8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    {/* Wheat Grains & Awns */}
    <path d="M24 10 Q28 6 32 4 M24 10 Q20 6 16 4" stroke={color} strokeWidth="1" />
    <path d="M24 16 C28 14 30 11 34 10 M24 16 C20 14 18 11 14 10" stroke={color} strokeWidth="1" />
    <path d="M24 22 C28 20 30 17 34 16 M24 22 C20 20 18 17 14 16" stroke={color} strokeWidth="1" />
    <ellipse cx="21" cy="18" rx="2.5" ry="4" transform="rotate(-30 21 18)" fill={color} fillOpacity="0.7" />
    <ellipse cx="27" cy="18" rx="2.5" ry="4" transform="rotate(30 27 18)" fill={color} fillOpacity="0.7" />
    <ellipse cx="21" cy="26" rx="2.5" ry="4" transform="rotate(-30 21 26)" fill={color} fillOpacity="0.7" />
    <ellipse cx="27" cy="26" rx="2.5" ry="4" transform="rotate(30 27 26)" fill={color} fillOpacity="0.7" />
    <ellipse cx="24" cy="10" rx="2.5" ry="4" fill={color} />
  </svg>
);

// ============================================================================
// 08. MICHELIN CIRCULAR GASTRONOMY SEAL (Maison Noir)
// ============================================================================
export const MichelinSealEmblem: React.FC<{
  className?: string;
  goldColor?: string;
  size?: number;
}> = ({ className = '', goldColor = '#D4AF37', size = 36 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Outer Dotted Ring */}
    <circle cx="32" cy="32" r="29" stroke={goldColor} strokeWidth="0.75" strokeDasharray="3 3" strokeOpacity="0.6" />
    {/* Inner Solid Keyline */}
    <circle cx="32" cy="32" r="25" stroke={goldColor} strokeWidth="1.2" strokeOpacity="0.8" />
    {/* Star Monogram */}
    <path
      d="M32 18 L34 26 L42 26 L36 31 L38 39 L32 34 L26 39 L28 31 L22 26 L30 26 Z"
      fill={goldColor}
      fillOpacity="0.8"
    />
    <circle cx="32" cy="32" r="1.5" fill="#0A0A0A" />
  </svg>
);
