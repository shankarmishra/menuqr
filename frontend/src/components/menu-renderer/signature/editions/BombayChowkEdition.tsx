/**
 * MENUQR Signature Edition — Bombay Chowk (Iconic Mumbai Irani Cafe & Street Food Masterpiece)
 *
 * Inspired by the legendary culinary institutions of South Bombay & Coastal Maharashtra:
 *   - 1930s Marine Drive & Regal Cinema Art Deco geometric arches & stepped cornices
 *   - Heritage South Bombay Irani Cafes (bentwood chairs, Italian marble tables, brass carafes)
 *   - Handcrafted wireframe Cutting Chai Caddy with 6 steaming fluted glasses
 *   - Gateway of India stepped basalt arch & sunburst brand cartouche
 *   - Victoria Terminus (CSMT) colonial railway station cast-iron course plaques (१, २, ३, ४, ५...)
 *   - Iconic Irani Cafe Rules & Midnight Chowk Lore aside plaque
 *   - Enamel tin stamp diet seals (Pure Butter / Ghee Shakahari vs Sigri Tawa Mansahari)
 *   - Traditional Bombay Chowk Kitchen Brigade Colophon (Ustad-e-Kadak, Khansama-e-Tawa, etc.)
 *   - Precision last-baseline anchored radial dotted leader rows with ₹ pricing
 */

import React from 'react';
import { useMenuTheme } from '../../MenuThemeProvider.tsx';
import { useMenuFilters } from '../../useMenuFilters.ts';
import { SmartImage } from '../../primitives/SmartImage.tsx';
import { EmptyResults, MenuToolbar } from '../../primitives/MenuToolbar.tsx';
import { DishPrice } from '../../primitives/DishMeta.tsx';
import {
  BrandMark,
  CategoryTeaser,
  EditionContact,
  cleanDescription,
  liveCategories,
  useFeatured,
  type EditionProps,
} from './shared.tsx';
import './editions.css';
import './editions-indian.css';

// =============================================================================
// BESPOKE CULTURAL VECTOR SVG ASSETS
// =============================================================================

/**
 * Handcrafted Mumbai Wireframe Cutting Chai Caddy.
 * Features 6 fluted glass tumblers with hot milk tea, rising steam curls, and brass saucer rings.
 */
export const CuttingChaiCaddy: React.FC<{ size?: number; className?: string }> = ({
  size = 54,
  className,
}) => (
  <svg
    viewBox="0 0 160 120"
    width={size}
    height={(size * 120) / 160}
    aria-hidden="true"
    focusable="false"
    className={['mq-ed-chowk-caddy-svg', className].filter(Boolean).join(' ')}
  >
    <defs>
      <linearGradient id="caddyBrassWire" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="50%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#78350f" />
      </linearGradient>
      <linearGradient id="chaiTeaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fef3c7" />
        <stop offset="30%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
      <filter id="caddyChaiGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Wire Carrying Handle */}
    <path
      d="M 40 50 C 40 12, 120 12, 120 50"
      fill="none"
      stroke="url(#caddyBrassWire)"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Wooden Grip Handle Wrap */}
    <rect x="66" y="10" width="28" height="6" rx="2" fill="#78350f" stroke="#f59e0b" strokeWidth="0.8" />
    <line x1="73" y1="10" x2="73" y2="16" stroke="#f59e0b" strokeWidth="0.6" />
    <line x1="80" y1="10" x2="80" y2="16" stroke="#f59e0b" strokeWidth="0.6" />
    <line x1="87" y1="10" x2="87" y2="16" stroke="#f59e0b" strokeWidth="0.6" />

    {/* Wire Basket Framework */}
    <rect
      x="12"
      y="48"
      width="136"
      height="54"
      rx="6"
      fill="rgba(18, 20, 24, 0.75)"
      stroke="url(#caddyBrassWire)"
      strokeWidth="2.2"
    />
    <line x1="12" y1="72" x2="148" y2="72" stroke="url(#caddyBrassWire)" strokeWidth="1.2" strokeDasharray="3 2" />
    <line x1="12" y1="94" x2="148" y2="94" stroke="url(#caddyBrassWire)" strokeWidth="1.5" />

    {/* 4 Supporting Legs */}
    <line x1="20" y1="102" x2="16" y2="114" stroke="url(#caddyBrassWire)" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="56" y1="102" x2="54" y2="114" stroke="url(#caddyBrassWire)" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="104" y1="102" x2="106" y2="114" stroke="url(#caddyBrassWire)" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="140" y1="102" x2="144" y2="114" stroke="url(#caddyBrassWire)" strokeWidth="2.5" strokeLinecap="round" />

    {/* 4 Visible Front Cutting Chai Glasses (Fluted) */}
    {[22, 54, 86, 118].map((gx, idx) => (
      <g key={idx}>
        {/* Steam Curls */}
        <path
          d={`M ${gx + 8} 38 Q ${gx + 5} 30, ${gx + 10} 24 T ${gx + 8} 16`}
          fill="none"
          stroke="rgba(254, 243, 199, 0.45)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* Glass Outer Wall */}
        <polygon
          points={`${gx},42 ${gx + 18},42 ${gx + 15},90 ${gx + 3},90`}
          fill="rgba(255, 255, 255, 0.12)"
          stroke="url(#caddyBrassWire)"
          strokeWidth="1.2"
        />
        {/* Golden Milk Chai Tea Liquid */}
        <polygon
          points={`${gx + 1.5},52 ${gx + 16.5},52 ${gx + 14.5},88 ${gx + 3.5},88`}
          fill="url(#chaiTeaGrad)"
          filter="url(#caddyChaiGlow)"
        />
        {/* Frothy Chai Head */}
        <ellipse cx={gx + 9} cy="52" rx="7.5" ry="2" fill="#fffbeb" opacity="0.9" />
        {/* Vertical Fluted Glass Ridges */}
        <line x1={gx + 6} y1="46" x2={gx + 5} y2="86" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.8" />
        <line x1={gx + 12} y1="46" x2={gx + 13} y2="86" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.8" />
      </g>
    ))}
  </svg>
);

/**
 * Art Deco Gateway & Sunburst Arch Cartouche.
 * Inspired by Gateway of India basalt geometry and 1930s South Bombay Art Deco cinema facades.
 */
export const GatewayDecoCartouche: React.FC<{
  children: React.ReactNode;
  size?: number;
}> = ({ children, size = 156 }) => {
  const sunburstRays = Array.from({ length: 24 }, (_, i) => {
    const angle = (i * 15 * Math.PI) / 180;
    return {
      x1: 80 + 52 * Math.cos(angle),
      y1: 80 + 52 * Math.sin(angle),
      x2: 80 + 64 * Math.cos(angle),
      y2: 80 + 64 * Math.sin(angle),
    };
  });

  return (
    <div
      className="mq-ed-chowk-cartouche"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 160 160" width={size} height={size} focusable="false">
        <defs>
          <linearGradient id="bombayDecoGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="35%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id="bombayPlateBack" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#181e26" />
            <stop offset="100%" stopColor="#0d1117" />
          </linearGradient>
          <linearGradient id="tomatoRedGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#be123c" />
          </linearGradient>
        </defs>

        {/* Outer Stepped Art Deco Octagonal Ring */}
        <polygon
          points="46,12 114,12 148,46 148,114 114,148 46,148 12,114 12,46"
          fill="url(#bombayPlateBack)"
          stroke="url(#bombayDecoGold)"
          strokeWidth="2.5"
        />
        <polygon
          points="49,18 111,18 142,49 142,111 111,142 49,142 18,111 18,49"
          fill="none"
          stroke="url(#tomatoRedGlow)"
          strokeWidth="1.2"
          opacity="0.85"
        />

        {/* 24 Sunburst Radiance Rays */}
        {sunburstRays.map((ray, i) => (
          <line
            key={i}
            x1={ray.x1}
            y1={ray.y1}
            x2={ray.x2}
            y2={ray.y2}
            stroke="url(#bombayDecoGold)"
            strokeWidth={i % 2 === 0 ? '1.8' : '1'}
            opacity={i % 2 === 0 ? '0.9' : '0.6'}
          />
        ))}

        {/* Inner Brass Rim with Minute Dots */}
        <circle cx="80" cy="80" r="49" fill="url(#bombayPlateBack)" stroke="url(#bombayDecoGold)" strokeWidth="1.8" />
        <circle cx="80" cy="80" r="45" fill="none" stroke="url(#bombayDecoGold)" strokeWidth="0.8" strokeDasharray="3 2" />

        {/* 4 Corner Stepped Art Deco Chevrons */}
        <g stroke="url(#bombayDecoGold)" strokeWidth="1.2" fill="none">
          <path d="M 24 36 L 36 24 L 44 24" />
          <path d="M 136 36 L 124 24 L 116 24" />
          <path d="M 24 124 L 36 136 L 44 136" />
          <path d="M 136 124 L 124 136 L 116 136" />
        </g>
      </svg>
      <div className="mq-ed-chowk-cartouche-logo">{children}</div>
    </div>
  );
};

/**
 * Colonial Victoria Terminus (CSMT) Railway Station Course Medallion.
 * Features a cast-iron platform plaque silhouette, brass mounting bolts, and Devanagari numerals.
 */
export const VictoriaStationCourseMedallion: React.FC<{
  index: number;
  size?: number;
}> = ({ index, size = 52 }) => {
  const devanagariNumerals = ['१', '२', '३', '४', '५', '६', '७', '੮', '९', '१०'];
  const numeral = devanagariNumerals[index] || `${index + 1}`;

  return (
    <div
      className="mq-ed-chowk-medallion"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 64 64" width={size} height={size} focusable="false">
        <defs>
          <linearGradient id="stationPlaqueIron" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1f2937" />
            <stop offset="50%" stopColor="#111827" />
            <stop offset="100%" stopColor="#030712" />
          </linearGradient>
          <linearGradient id="stationPlaqueBrass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>

        {/* Vintage Scalloped Platform Plaque Frame */}
        <path
          d="M 12 4 C 8 4, 4 8, 4 12 L 4 52 C 4 56, 8 60, 12 60 L 52 60 C 56 60, 60 56, 60 52 L 60 12 C 60 8, 56 4, 52 4 Z"
          fill="url(#stationPlaqueIron)"
          stroke="url(#stationPlaqueBrass)"
          strokeWidth="2"
        />

        {/* Inner Scalloped Brass Inset Border */}
        <rect
          x="8"
          y="8"
          width="48"
          height="48"
          rx="4"
          fill="none"
          stroke="url(#stationPlaqueBrass)"
          strokeWidth="1"
          strokeDasharray="2 1.5"
          opacity="0.8"
        />

        {/* 4 Corner Brass Fixing Screws */}
        <circle cx="8" cy="8" r="1.8" fill="url(#stationPlaqueBrass)" />
        <circle cx="56" cy="8" r="1.8" fill="url(#stationPlaqueBrass)" />
        <circle cx="8" cy="56" r="1.8" fill="url(#stationPlaqueBrass)" />
        <circle cx="56" cy="56" r="1.8" fill="url(#stationPlaqueBrass)" />

        {/* Track Line Accent */}
        <line x1="16" y1="50" x2="48" y2="50" stroke="url(#stationPlaqueBrass)" strokeWidth="1.2" />
        <line x1="20" y1="48" x2="20" y2="52" stroke="url(#stationPlaqueBrass)" strokeWidth="0.8" />
        <line x1="28" y1="48" x2="28" y2="52" stroke="url(#stationPlaqueBrass)" strokeWidth="0.8" />
        <line x1="36" y1="48" x2="36" y2="52" stroke="url(#stationPlaqueBrass)" strokeWidth="0.8" />
        <line x1="44" y1="48" x2="44" y2="52" stroke="url(#stationPlaqueBrass)" strokeWidth="0.8" />

        {/* Devanagari Numeral Centered */}
        <text
          x="32"
          y="35"
          textAnchor="middle"
          dominantBaseline="central"
          fill="url(#stationPlaqueBrass)"
          fontFamily="'Rozha One', 'Yatra One', 'Cinzel', serif"
          fontSize={numeral.length > 2 ? '17' : '22'}
          fontWeight="800"
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.9))' }}
        >
          {numeral}
        </text>
      </svg>
    </div>
  );
};

/**
 * Art Deco Marine Drive Sea Wave Astragal.
 * Alternates between Marine Drive tetrapod diamonds, ocean waves, and tea leaf accents.
 */
export const MarineDriveWaveAstragal: React.FC<{
  variant?: 'grand' | 'standard';
  className?: string;
}> = ({ variant = 'standard', className }) => {
  const isGrand = variant === 'grand';

  return (
    <div
      className={['mq-ed-chowk-astragal', isGrand ? 'is-grand' : '', className]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    >
      <span className="mq-ed-chowk-astragal-line" />
      <svg
        viewBox="0 0 140 24"
        width={isGrand ? 160 : 120}
        height={isGrand ? 24 : 18}
        focusable="false"
      >
        <defs>
          <linearGradient id="astragalGoldWave" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>

        {/* Central Marine Drive Tetrapod Diamond */}
        <polygon points="70,2 78,12 70,22 62,12" fill="#d83a2d" stroke="url(#astragalGoldWave)" strokeWidth="1.5" />
        <circle cx="70" cy="12" r="3" fill="#fef08a" />

        {/* Stepped Art Deco Flanking Chevrons */}
        <polygon points="52,6 58,12 52,18 46,12" fill="#f59e0b" opacity="0.9" />
        <polygon points="88,6 94,12 88,18 82,12" fill="#f59e0b" opacity="0.9" />

        {/* Stylized Ocean Waves */}
        <path
          d="M 12 12 Q 22 4, 32 12 T 44 12"
          fill="none"
          stroke="url(#astragalGoldWave)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M 96 12 Q 108 4, 118 12 T 128 12"
          fill="none"
          stroke="url(#astragalGoldWave)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Tea Leaf Buds */}
        <circle cx="6" cy="12" r="2.2" fill="#f59e0b" />
        <circle cx="134" cy="12" r="2.2" fill="#f59e0b" />
      </svg>
      <span className="mq-ed-chowk-astragal-line" />
    </div>
  );
};

/**
 * Handcrafted 1930s Art Deco Stepped Iron Corner Bracket.
 */
export const ArtDecoCornerBracket: React.FC<{
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: number;
}> = ({ position, size = 38 }) => {
  const rotationMap = {
    'top-left': 'rotate(0deg)',
    'top-right': 'rotate(90deg)',
    'bottom-right': 'rotate(180deg)',
    'bottom-left': 'rotate(270deg)',
  };

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={`mq-ed-chowk-bracket is-${position}`}
      style={{ transformOrigin: '24px 24px', transform: rotationMap[position] }}
    >
      <defs>
        <linearGradient id="decoBracketGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>

      {/* Stepped Art Deco Cornice Lines */}
      <path d="M 4 4 L 44 4 L 44 8 L 8 8 L 8 44 L 4 44 Z" fill="url(#decoBracketGold)" opacity="0.9" />
      <path d="M 12 12 L 36 12 L 36 15 L 15 15 L 15 36 L 12 36 Z" fill="#d83a2d" opacity="0.85" />
      <circle cx="18" cy="18" r="2.5" fill="url(#decoBracketGold)" />
      <circle cx="28" cy="8" r="1.5" fill="#fef08a" />
      <circle cx="8" cy="28" r="1.5" fill="#fef08a" />
    </svg>
  );
};

/**
 * Authentic Bombay Street Enamel Tin Stamp Diet Mark.
 */
export const ChowkDietMark: React.FC<{ type?: string; isSpicy?: boolean }> = ({
  type,
  isSpicy,
}) => {
  const isVeg = type === 'veg' || type === 'vegan';
  const isNonVeg = type === 'non-veg';

  if (!isVeg && !isNonVeg) return null;

  return (
    <span
      className={`mq-ed-chowk-diet ${isVeg ? 'is-veg' : 'is-nonveg'}`}
      title={isVeg ? 'शाकाहारी • 100% Vegetarian (Pure Butter & Milk Pav)' : 'मांसाहारी • Non-Vegetarian (Midnight Charcoal Sigri)'}
      aria-label={isVeg ? 'Pure Vegetarian' : 'Non-Vegetarian'}
    >
      <span className="mq-ed-chowk-diet-badge">
        <span className="mq-ed-chowk-diet-dot" />
      </span>
      {isSpicy && (
        <span className="mq-ed-chowk-diet-spice" title="Tikha • Bombay Street Spiced" aria-hidden="true">
          🔥
        </span>
      )}
    </span>
  );
};

// =============================================================================
// MAIN EDITION COMPONENT
// =============================================================================

export const BombayChowkEdition: React.FC<EditionProps> = ({
  restaurant,
  categories,
  compact,
  readOnly,
}) => {
  const tokens = useMenuTheme();
  const {
    query,
    setQuery,
    dietFilter,
    setDietFilter,
    counts,
    visible,
    hasQuery,
    allergenFilter,
    setAllergenFilter,
    spiceFilter,
    setSpiceFilter,
  } = useMenuFilters(categories);
  const signatures = useFeatured(categories, 2);
  const sections = liveCategories(visible);

  const heroImage = tokens.cover.imageUrl || '/assets/themes/bombay-chowk-hero.webp';

  return (
    <div className={compact ? 'mq-ed mq-ed-chowk is-compact' : 'mq-ed mq-ed-chowk'}>
      {/* =========================================================================
          COVER : Vintage Irani Cafe & Marine Drive Gateway
          ========================================================================= */}
      <header className="mq-ed-chowk-cover" data-edition-cover="bombay-chowk">
        {heroImage && (
          <div className="mq-ed-cover-media" aria-hidden="true">
            <SmartImage
              src={heroImage}
              alt=""
              role="hero"
              focal={tokens.cover.focal}
              priority
              aspectRatio={undefined}
            />
          </div>
        )}

        {/* Vintage Marine Drive Twilight & Spiced Amber Scrim */}
        <span className="mq-ed-chowk-veil" aria-hidden="true" />
        <span className="mq-ed-chowk-checker-border" aria-hidden="true" />

        {/* 4 Art Deco Stepped Ironwork Corner Brackets */}
        <span className="mq-ed-chowk-corner corner-tl">
          <ArtDecoCornerBracket position="top-left" size={compact ? 28 : 40} />
        </span>
        <span className="mq-ed-chowk-corner corner-tr">
          <ArtDecoCornerBracket position="top-right" size={compact ? 28 : 40} />
        </span>
        <span className="mq-ed-chowk-corner corner-bl">
          <ArtDecoCornerBracket position="bottom-left" size={compact ? 28 : 40} />
        </span>
        <span className="mq-ed-chowk-corner corner-br">
          <ArtDecoCornerBracket position="bottom-right" size={compact ? 28 : 40} />
        </span>

        <div className="mq-ed-chowk-cover-body">
          {/* Heritage Municipal Stamp */}
          <div className="mq-ed-chowk-stamp">
            <span aria-hidden="true">★</span>
            <span>EKDUM KADAK • असली मुम्बई जायका • ESTD. 1953</span>
            <span aria-hidden="true">★</span>
          </div>

          {/* Gateway of India & Sunburst Cartouche */}
          <GatewayDecoCartouche size={compact ? 116 : 152}>
            <BrandMark
              restaurant={restaurant}
              size={compact ? 70 : 88}
              className="mq-ed-mark-in-cartouche"
            />
          </GatewayDecoCartouche>

          {/* Restaurant Title with Foil Glow */}
          <h1 className="mq-ed-chowk-title mq-ed-chowk-foil-text">{restaurant.name}</h1>

          {/* Marine Drive Wave Astragal */}
          <MarineDriveWaveAstragal variant="grand" />

          {/* Tagline / Subtitle */}
          {restaurant.tagline ? (
            <p className="mq-ed-chowk-tagline">&ldquo;{restaurant.tagline}&rdquo;</p>
          ) : (
            <p className="mq-ed-chowk-tagline">
              Nostalgic Irani Cafes • Midnight Charcoal Grills • Chowpatty Beach Chaat
            </p>
          )}

          {/* Category Teaser */}
          <CategoryTeaser
            categories={categories}
            limit={4}
            separator="⚡"
            className="mq-ed-chowk-teaser"
          />
        </div>

        {/* Contact & Hours */}
        <EditionContact restaurant={restaurant} className="mq-ed-chowk-contact" separator="·" />
      </header>

      {/* =========================================================================
          TOOLBAR & FILTERS
          ========================================================================= */}
      {!compact && (
        <>
          {tokens.announcement && (
            <p className="mq-ed-noir-announce" role="note">
              <span className="mq-ed-noir-announce-bullet">☕</span>
              {tokens.announcement}
              <span className="mq-ed-noir-announce-bullet">☕</span>
            </p>
          )}

          <MenuToolbar
            query={query}
            onQueryChange={setQuery}
            dietFilter={dietFilter}
            onDietFilterChange={setDietFilter}
            counts={counts}
            allergenFilter={allergenFilter}
            onAllergenFilterChange={setAllergenFilter}
            spiceFilter={spiceFilter}
            onSpiceFilterChange={setSpiceFilter}
          />
        </>
      )}

      {/* =========================================================================
          INTERIOR : Bombay Chowk Masterpiece Layout
          ========================================================================= */}
      <main className="mq-ed-chowk-plate">
        {/* Mumbai Heritage Banner */}
        {!compact && !hasQuery && (
          <aside className="mq-ed-chowk-heritage-banner" aria-label="Bombay Street Food Heritage">
            <div className="mq-ed-chowk-heritage-head">
              <span className="mq-ed-chowk-section-eyebrow">⚡ THE SOUL OF MAXIMUM CITY ⚡</span>
              <h3 className="mq-ed-chowk-heritage-title">From South Bombay Irani Cafes to Chowpatty Sands</h3>
              <p className="mq-ed-chowk-heritage-desc">
                Slow-brewed strong Assam tea with bruised green cardamom, freshly baked warm milk pavs slathered in cultured white butter, and fiery cast-iron griddles humming into the midnight breeze:
              </p>
            </div>
            <div className="mq-ed-chowk-heritage-pills">
              <span className="mq-ed-chowk-pill">
                <strong>कटिंग चाय</strong> • Bruised Cardamom &amp; Steamed Milk
              </span>
              <span className="mq-ed-chowk-pill">
                <strong>मस्का पाव</strong> • Freshly Baked Crusty Brun Bun
              </span>
              <span className="mq-ed-chowk-pill">
                <strong>तवा पाव भाजी</strong> • Sizzling Amul Butter Iron Griddle
              </span>
              <span className="mq-ed-chowk-pill">
                <strong>सीख कबाब</strong> • Charcoal Sigri with Mint Chutney
              </span>
            </div>
          </aside>
        )}

        {/* 1. CHOWK SIGNATURES SHOWCASE */}
        {signatures.length > 0 && !compact && !hasQuery && (
          <section className="mq-ed-chowk-showcase" aria-label="Iconic Chowk Highlights">
            <div className="mq-ed-chowk-showcase-header">
              <CuttingChaiCaddy size={44} />
              <span className="mq-ed-chowk-section-eyebrow">असली मुम्बई जायका • SIGNATURE SPECIALITIES</span>
              <h2 className="mq-ed-chowk-showcase-title mq-ed-chowk-foil-text">
                The Midnight Tawa &amp; Irani Oven
              </h2>
              <p className="mq-ed-chowk-showcase-subtitle">
                Cooked on sizzling cast-iron tawas and wood-fired bakery hearths, served garma-garam with lime wedges, pickled pink onions, and mint coriander chutney.
              </p>
              <MarineDriveWaveAstragal />
            </div>

            <div className="mq-ed-chowk-showcase-grid">
              {signatures.map((item, idx) => (
                <article key={item.id} className="mq-ed-chowk-card">
                  {/* Art Deco Stepped Corner Accents */}
                  <span className="mq-ed-chowk-card-bracket bracket-tl">
                    <ArtDecoCornerBracket position="top-left" size={22} />
                  </span>
                  <span className="mq-ed-chowk-card-bracket bracket-tr">
                    <ArtDecoCornerBracket position="top-right" size={22} />
                  </span>
                  <span className="mq-ed-chowk-card-bracket bracket-bl">
                    <ArtDecoCornerBracket position="bottom-left" size={22} />
                  </span>
                  <span className="mq-ed-chowk-card-bracket bracket-br">
                    <ArtDecoCornerBracket position="bottom-right" size={22} />
                  </span>

                  {item.imageUrl && (
                    <div className="mq-ed-chowk-card-media">
                      <SmartImage
                        src={item.imageUrl}
                        alt={item.name}
                        role="card"
                        focal={item.focal}
                        aspectRatio="16 / 10"
                      />
                      <span className="mq-ed-chowk-card-badge">
                        Chowk Pride {idx === 0 ? '१' : '२'}
                      </span>
                    </div>
                  )}

                  <div className="mq-ed-chowk-card-body">
                    <div className="mq-ed-chowk-card-head">
                      <div className="mq-ed-chowk-card-title-group">
                        <ChowkDietMark type={item.dietType} isSpicy={!!item.spicyLevel} />
                        <h3 className="mq-ed-chowk-card-name mq-dish-name">{item.name}</h3>
                      </div>
                      <div className="mq-ed-chowk-card-price-slot">
                        <DishPrice item={item} readOnly={readOnly} />
                      </div>
                    </div>

                    {item.description && (
                      <p className="mq-ed-chowk-card-desc mq-dish-desc">
                        {cleanDescription(item)}
                      </p>
                    )}

                    {/* Bambaiya Street Accompaniment Ribbon */}
                    <div className="mq-ed-chowk-pairing-ribbon">
                      <span aria-hidden="true">⚡</span>
                      <span>
                        {idx === 0
                          ? 'Accompaniment: Double-Toasted Maska Pav, Pickled Pink Shallots & Lemon Cheek'
                          : 'Accompaniment: Hot Cutting Chai in Fluted Glass, Crisp Nylon Sev & Garlic Dip'}
                      </span>
                    </div>

                    {/* Culinary Heritage Lore */}
                    <p className="mq-ed-chowk-card-lore">
                      <em>Bombay Chowk Heritage:</em> Slow-reduced on heavy 35kg hand-beaten cast iron. Finished with double dollops of golden butter and fragrant toasted pav.
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 2. THE IRANI CAFE CODE & CHOWPATTY LORE (EDITORIAL ASIDE PLAQUE) */}
        {!compact && !hasQuery && (
          <aside className="mq-ed-chowk-irani-plaque" aria-label="The Irani Cafe Code and Lore">
            <span className="mq-ed-chowk-plaque-bracket bracket-tl">
              <ArtDecoCornerBracket position="top-left" size={30} />
            </span>
            <span className="mq-ed-chowk-plaque-bracket bracket-tr">
              <ArtDecoCornerBracket position="top-right" size={30} />
            </span>
            <span className="mq-ed-chowk-plaque-bracket bracket-bl">
              <ArtDecoCornerBracket position="bottom-left" size={30} />
            </span>
            <span className="mq-ed-chowk-plaque-bracket bracket-br">
              <ArtDecoCornerBracket position="bottom-right" size={30} />
            </span>

            <span className="mq-ed-chowk-section-eyebrow">◈ IRANI CAFE RULES &amp; STREET CHOWK CODE ◈</span>
            <h2 className="mq-ed-chowk-plaque-title mq-ed-chowk-foil-text">
              The Legend of South Bombay Hospitality
            </h2>
            <p className="mq-ed-chowk-plaque-subtitle">
              Cherished rules preserved since the 1930s on antique cafe mirrors across Colaba and Fort:
            </p>

            <div className="mq-ed-chowk-plaque-grid">
              <div className="mq-ed-chowk-plaque-col">
                <span className="mq-ed-chowk-col-badge">नियम १ • CAFE CODE</span>
                <h3 className="mq-ed-chowk-col-heading">No Combing Hair, Only Kadak Chai</h3>
                <p className="mq-ed-chowk-col-desc">
                  &ldquo;No sleeping on chairs, no writing letters, no talking loud, no arguing with cashier, and no leaving without dipping warm bun maska in steaming cutting chai.&rdquo;
                </p>
              </div>

              <div className="mq-ed-chowk-plaque-col">
                <span className="mq-ed-chowk-col-badge">नियम २ • TAWA CRAFT</span>
                <h3 className="mq-ed-chowk-col-heading">The Midnight Iron Flat-Top</h3>
                <p className="mq-ed-chowk-col-desc">
                  Seasoned over decades, our giant concave tawa retains intense volcanic heat. Spiced tomatoes, boiled potatoes, and whole crushed spices are hand-mashed to velvety perfection.
                </p>
              </div>

              <div className="mq-ed-chowk-plaque-col">
                <span className="mq-ed-chowk-col-badge">नियम ३ • CHOWPATTY SOUL</span>
                <h3 className="mq-ed-chowk-col-heading">Crisp Sev &amp; Tangy Tamarind</h3>
                <p className="mq-ed-chowk-col-desc">
                  Freshly pounded coriander chutneys, sun-dried amchur, raw mango slivers, and feather-light nylon sev delivered straight from traditional Gujarati and Maharashtrian snack masters.
                </p>
              </div>
            </div>

            <p className="mq-ed-chowk-plaque-footer">
              ⚓ Colaba • Fort • Dadar • Bandra • Chowpatty • Mohammad Ali Road ⚓
            </p>
          </aside>
        )}

        {/* 3. COURSES WITH VICTORIA STATION MEDALLIONS & PRECISION LEADERS */}
        {sections.length === 0 ? (
          hasQuery ? (
            <EmptyResults query={query.trim()} onClear={() => setQuery('')} />
          ) : (
            <p className="mq-ed-empty" role="status">No items found in this section.</p>
          )
        ) : (
          sections.map((category, catIdx) => (
            <section
              key={category.id}
              className="mq-ed-chowk-course"
              aria-labelledby={`mq-ed-chowk-${category.id}`}
            >
              <div className="mq-ed-chowk-course-header">
                <VictoriaStationCourseMedallion index={catIdx} size={compact ? 42 : 52} />
                <div className="mq-ed-chowk-course-title-wrap">
                  <span className="mq-ed-chowk-course-subtitle">
                    मुम्बई मेन्यू • भाग {['१', '२', '३', '४', '५', '६', '७', '८', '९', '१०'][catIdx] || (catIdx + 1)} • Track {catIdx + 1}
                  </span>
                  <h2 id={`mq-ed-chowk-${category.id}`} className="mq-ed-chowk-course-title mq-ed-chowk-foil-text">
                    {category.name}
                  </h2>
                </div>
                {category.description && (
                  <p className="mq-ed-chowk-course-desc">{category.description}</p>
                )}
                <MarineDriveWaveAstragal className="mq-ed-chowk-course-divider" />
              </div>

              <div className="mq-ed-chowk-list">
                {category.items.map((item) => (
                  <article key={item.id} className="mq-ed-chowk-dish-row">
                    <div className="mq-ed-chowk-dish-head">
                      <ChowkDietMark type={item.dietType} isSpicy={!!item.spicyLevel} />
                      <h3 className="mq-ed-chowk-dish-name mq-dish-name">{item.name}</h3>
                      <span className="mq-ed-chowk-dish-rule" aria-hidden="true" />
                      <div className="mq-ed-chowk-dish-price">
                        <DishPrice item={item} readOnly={readOnly} />
                      </div>
                    </div>

                    {item.description && (
                      <p className="mq-ed-chowk-dish-desc mq-dish-desc">
                        {cleanDescription(item)}
                      </p>
                    )}

                    {/* Regional Badges & Street Callouts */}
                    <div className="mq-ed-chowk-dish-meta">
                      {item.isBestseller && (
                        <span className="mq-ed-chowk-tag is-bestseller">
                          ⚡ Chowk Bestseller
                        </span>
                      )}
                      {item.isSpecial && (
                        <span className="mq-ed-chowk-tag is-special">
                          ★ Irani Heritage
                        </span>
                      )}
                      {item.spicyLevel && item.spicyLevel > 1 && (
                        <span className="mq-ed-chowk-tag is-spice">
                          {'🌶'.repeat(Math.min(item.spicyLevel, 3))} Ekdum Tikha
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* =========================================================================
          FOOTER & BOMBAY CHOWK KITCHEN BRIGADE COLOPHON
          ========================================================================= */}
      <footer className="mq-ed-chowk-foot">
        <MarineDriveWaveAstragal variant="grand" />
        <p className="mq-ed-chowk-foot-name mq-ed-chowk-foil-text">{restaurant.name}</p>
        <p className="mq-ed-chowk-foot-sub">
          Irani Cafes • Sizzling Tawa Pav Bhaji • Cutting Chai • Marine Drive Breezes
        </p>

        {/* Traditional Bombay Chowk Culinary Brigade Hierarchy */}
        {!compact && (
          <div className="mq-ed-chowk-brigade-grid">
            <div className="mq-ed-chowk-brigade-item">
              <span className="mq-ed-chowk-brigade-title">Ustad-e-Kadak</span>
              <span className="mq-ed-chowk-brigade-role">Master of CTC Assam Decoctions &amp; Bruised Cardamom Chai</span>
            </div>
            <div className="mq-ed-chowk-brigade-item">
              <span className="mq-ed-chowk-brigade-title">Khansama-e-Tawa</span>
              <span className="mq-ed-chowk-brigade-role">Commander of the Sizzling 35kg Cast-Iron Midnight Flat-Top</span>
            </div>
            <div className="mq-ed-chowk-brigade-item">
              <span className="mq-ed-chowk-brigade-title">Ustad-e-Sigri</span>
              <span className="mq-ed-chowk-brigade-role">Coastal Pomfret, Seekh Kebab &amp; Charcoal Boti Artisan</span>
            </div>
            <div className="mq-ed-chowk-brigade-item">
              <span className="mq-ed-chowk-brigade-title">Maharaj-e-Maska</span>
              <span className="mq-ed-chowk-brigade-role">Baker of Crusty Brun Muska &amp; Pillowy Golden Hearth Pavs</span>
            </div>
          </div>
        )}

        <EditionContact restaurant={restaurant} />
      </footer>
    </div>
  );
};

export default BombayChowkEdition;
