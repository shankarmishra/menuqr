/**
 * MENUQR Edition — Maison Noir (Haute Gastronomie Art Déco)
 *
 * World-class Art Deco fine dining: an obsidian velvet cover under a bevelled gold double rule,
 * faceted sunburst spandrels, and a Michelin-starred tasting-room hierarchy.
 *
 * Distinctive multi-course interior featuring:
 *   - "Sélection du Chef" (Curated signature dishes with tasting notes & sommelier pairings)
 *   - Roman numeral course medallions (I, II, III, IV...) with French service designations
 *   - Precision-aligned micro-pearl dotted price leaders with baseline anchoring
 *   - Fixed-price Chef's Tasting Flight (Menu Dégustation en Sept Services) plaque with wine flight tiers
 *   - Michelin-starred 3-star constellation seal, culinary brigade colophon & legal disclosures
 */

import React from 'react';
import { useMenuTheme } from '../../MenuThemeProvider.tsx';
import { useMenuFilters } from '../../useMenuFilters.ts';
import { SmartImage } from '../../primitives/SmartImage.tsx';
import { EmptyResults, MenuToolbar } from '../../primitives/MenuToolbar.tsx';
import { DietMark, DishPrice } from '../../primitives/DishMeta.tsx';
import {
  BrandMark,
  CategoryTeaser,
  EditionContact,
  Leader,
  liveCategories,
  useFeatured,
  cleanDescription,
  type EditionProps,
} from './shared.tsx';
import './editions.css';

// =============================================================================
// CONSTANTS & HELPERS
// =============================================================================

export const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

const toRomanCourse = (idx: number): string => ROMAN_NUMERALS[idx] || String(idx + 1);

// =============================================================================
// ART DECO VECTOR ASSETS & ARCHITECTURAL ORNAMENTS
// =============================================================================

/** Stepped Art Deco corner ziggurat with geometric terraces and diamond rivets. */
const DecoCornerZiggurat: React.FC<{ size?: number }> = ({ size }) => (
  <svg
    viewBox="0 0 90 90"
    width={size || '100%'}
    height={size || '100%'}
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <linearGradient id="noirCornerFoil" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#bf953f" />
        <stop offset="25%" stopColor="#fcf6ba" />
        <stop offset="50%" stopColor="#b38728" />
        <stop offset="75%" stopColor="#fbf5b7" />
        <stop offset="100%" stopColor="#8a6117" />
      </linearGradient>
    </defs>
    {/* Concentric Stepped Ziggurat Rules */}
    <path
      d="M3 3 L87 3 L87 9 L75 9 L75 17 L65 17 L65 25 L25 25 L25 65 L17 65 L17 75 L9 75 L9 87 L3 87 Z"
      fill="none"
      stroke="url(#noirCornerFoil)"
      strokeWidth="1.25"
    />
    {/* Inner Hairline Stepped Rule */}
    <path
      d="M7 7 L83 7 L83 11 L71 11 L71 19 L61 19 L61 29 L29 29 L29 61 L19 61 L19 71 L11 71 L11 83 L7 83 Z"
      fill="none"
      stroke="url(#noirCornerFoil)"
      strokeWidth="0.5"
      opacity="0.65"
    />
    {/* Stepped Chevron Sunburst Blades */}
    <g fill="url(#noirCornerFoil)">
      <polygon points="7,7 28,7 7,28" opacity="0.28" />
      <polygon points="12,12 42,12 12,42" opacity="0.18" />
      <polygon points="17,17 56,17 17,56" opacity="0.1" />
    </g>
    {/* Corner Faceted Diamond Rivet */}
    <rect x="5.5" y="5.5" width="5" height="5" transform="rotate(45 8 8)" fill="url(#noirCornerFoil)" />
  </svg>
);

/**
 * Grand Art Deco architectural crest & cartouche housing the restaurant logo.
 * STRICT LOCATION: Kept directly in the central upper-third position above the title.
 */
const DecoLogoCartouche: React.FC<{ children: React.ReactNode; size?: number }> = ({
  children,
  size,
}) => (
  <div className="mq-ed-noir-cartouche" style={size ? { width: size, height: size } : undefined}>
    <svg viewBox="0 0 160 160" aria-hidden="true" focusable="false" className="mq-ed-noir-cartouche-svg">
      <defs>
        <linearGradient id="noirGoldFoil" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#bf953f" />
          <stop offset="25%" stopColor="#fcf6ba" />
          <stop offset="50%" stopColor="#b38728" />
          <stop offset="75%" stopColor="#fbf5b7" />
          <stop offset="100%" stopColor="#8a6117" />
        </linearGradient>
        <linearGradient id="noirGoldSoft" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fcf6ba" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#8a6117" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* 1. Tapered Sunburst Rays (16 Points) */}
      <g stroke="url(#noirGoldFoil)" strokeWidth="0.8" opacity="0.4">
        {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((ang) => {
          const rad = (ang * Math.PI) / 180;
          return (
            <line
              key={ang}
              x1={80 + 58 * Math.cos(rad)}
              y1={80 + 58 * Math.sin(rad)}
              x2={80 + 74 * Math.cos(rad)}
              y2={80 + 74 * Math.sin(rad)}
            />
          );
        })}
      </g>

      {/* 2. Outer Stepped Art Deco Octagon Frame */}
      <polygon
        points="80,10 98,10 126,38 126,56 150,80 126,104 126,122 98,150 80,150 62,150 34,122 34,104 10,80 34,56 34,38 62,10"
        fill="none"
        stroke="url(#noirGoldFoil)"
        strokeWidth="1.3"
      />

      {/* 3. Secondary Concentric Hairline Octagon */}
      <polygon
        points="80,16 95,16 120,41 120,56 144,80 120,104 120,119 95,144 80,144 65,144 40,119 40,104 16,80 40,56 40,41 65,16"
        fill="none"
        stroke="url(#noirGoldFoil)"
        strokeWidth="0.5"
        opacity="0.65"
      />

      {/* 4. Flanking Horizontal Architectural Winglets (3 & 9 o'clock) */}
      <path d="M 6 80 L 26 74 L 26 86 Z" fill="url(#noirGoldFoil)" opacity="0.85" />
      <path d="M 154 80 L 134 74 L 134 86 Z" fill="url(#noirGoldFoil)" opacity="0.85" />

      {/* 5. Perlage: 32 Micro-Beaded Pearl Ring */}
      <g fill="url(#noirGoldFoil)" opacity="0.75">
        {Array.from({ length: 32 }).map((_, i) => {
          const rad = (i * 11.25 * Math.PI) / 180;
          return <circle key={i} cx={80 + 55 * Math.cos(rad)} cy={80 + 55 * Math.sin(rad)} r="1.1" />;
        })}
      </g>

      {/* 6. Inner Bevel Ring (Recessed Coin Bed) */}
      <circle cx="80" cy="80" r="52" fill="#0d0c10" stroke="url(#noirGoldFoil)" strokeWidth="1.2" />
      <circle cx="80" cy="80" r="49.5" fill="none" stroke="url(#noirGoldSoft)" strokeWidth="0.6" />
    </svg>
    <div className="mq-ed-noir-cartouche-logo">{children}</div>
  </div>
);

/** Grand Art Deco Astragal divider with stepped horizontal flanking bars and center diamond jewel. */
const DecoAstragalRule: React.FC<{ className?: string }> = ({ className }) => (
  <div className={['mq-ed-noir-astragal', className].filter(Boolean).join(' ')} aria-hidden="true">
    <span className="mq-ed-noir-astragal-rail" />
    <svg viewBox="0 0 60 16" width="60" height="16" focusable="false" className="mq-ed-noir-astragal-center">
      {/* Left Stepped Horizontal Flanking Bars */}
      <line x1="2" y1="8" x2="18" y2="8" stroke="url(#noirGoldFoil)" strokeWidth="1.5" />
      <line x1="8" y1="5" x2="18" y2="5" stroke="url(#noirGoldFoil)" strokeWidth="0.75" />
      <line x1="8" y1="11" x2="18" y2="11" stroke="url(#noirGoldFoil)" strokeWidth="0.75" />
      {/* Center Diamond Lozenge */}
      <rect x="30" y="8" width="8" height="8" transform="translate(-4,-4) rotate(45 30 8)" fill="url(#noirGoldFoil)" />
      <rect x="30" y="8" width="4" height="4" transform="translate(-2,-2) rotate(45 30 8)" fill="#0d0c10" />
      {/* Right Stepped Flanking Bars */}
      <line x1="42" y1="8" x2="58" y2="8" stroke="url(#noirGoldFoil)" strokeWidth="1.5" />
      <line x1="42" y1="5" x2="52" y2="5" stroke="url(#noirGoldFoil)" strokeWidth="0.75" />
      <line x1="42" y1="11" x2="52" y2="11" stroke="url(#noirGoldFoil)" strokeWidth="0.75" />
    </svg>
    <span className="mq-ed-noir-astragal-rail" />
  </div>
);

/**
 * Architectural Art Deco Stepped Rule featuring:
 * - Central 3-tiered ziggurat pediment crown
 * - Center faceted lozenge diamond
 * - Lateral triple-fluted horizontal bars
 * - Micro-diamond flank rivets and gradient hairline rails
 */
const DecoArchitecturalDivider: React.FC<{
  className?: string;
  variant?: 'grand' | 'course';
}> = ({ className, variant = 'course' }) => {
  const isGrand = variant === 'grand';

  return (
    <div
      className={['mq-ed-noir-divider', isGrand ? 'is-grand' : '', className]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    >
      <span className="mq-ed-noir-divider-rail rail-left" />
      <svg
        viewBox="0 0 120 20"
        width={isGrand ? 130 : 96}
        height={isGrand ? 22 : 16}
        focusable="false"
        className="mq-ed-noir-divider-svg"
      >
        <defs>
          <linearGradient id="noirDividerGold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#bf953f" />
            <stop offset="30%" stopColor="#fcf6ba" />
            <stop offset="50%" stopColor="#b38728" />
            <stop offset="70%" stopColor="#fbf5b7" />
            <stop offset="100%" stopColor="#8a6117" />
          </linearGradient>
        </defs>

        {/* Left Fluting: 3 Tiered Stepped Architectural Bars */}
        <line x1="8" y1="10" x2="44" y2="10" stroke="url(#noirDividerGold)" strokeWidth="1.2" />
        <line x1="18" y1="7" x2="44" y2="7" stroke="url(#noirDividerGold)" strokeWidth="0.65" opacity="0.85" />
        <line x1="18" y1="13" x2="44" y2="13" stroke="url(#noirDividerGold)" strokeWidth="0.65" opacity="0.85" />
        <line x1="28" y1="4.5" x2="44" y2="4.5" stroke="url(#noirDividerGold)" strokeWidth="0.4" opacity="0.6" />
        <line x1="28" y1="15.5" x2="44" y2="15.5" stroke="url(#noirDividerGold)" strokeWidth="0.4" opacity="0.6" />

        {/* Left Flank Micro-Diamond */}
        <rect x="6" y="10" width="3.5" height="3.5" transform="translate(-1.75,-1.75) rotate(45 6 10)" fill="url(#noirDividerGold)" />

        {/* Center Ziggurat Pediment Terraces */}
        <path
          d="M 48 10 L 52 5 L 56 5 L 60 1 L 64 5 L 68 5 L 72 10 L 68 15 L 64 15 L 60 19 L 56 15 L 52 15 Z"
          fill="#0d0c10"
          stroke="url(#noirDividerGold)"
          strokeWidth="0.9"
        />

        {/* Center Faceted Diamond Lozenge */}
        <rect x="60" y="10" width="6" height="6" transform="translate(-3,-3) rotate(45 60 10)" fill="url(#noirDividerGold)" />
        <rect x="60" y="10" width="2.5" height="2.5" transform="translate(-1.25,-1.25) rotate(45 60 10)" fill="#0d0c10" />

        {/* Right Flank Micro-Diamond */}
        <rect x="114" y="10" width="3.5" height="3.5" transform="translate(-1.75,-1.75) rotate(45 114 10)" fill="url(#noirDividerGold)" />

        {/* Right Fluting: 3 Tiered Stepped Architectural Bars */}
        <line x1="76" y1="10" x2="112" y2="10" stroke="url(#noirDividerGold)" strokeWidth="1.2" />
        <line x1="76" y1="7" x2="102" y2="7" stroke="url(#noirDividerGold)" strokeWidth="0.65" opacity="0.85" />
        <line x1="76" y1="13" x2="102" y2="13" stroke="url(#noirDividerGold)" strokeWidth="0.65" opacity="0.85" />
        <line x1="76" y1="4.5" x2="92" y2="4.5" stroke="url(#noirDividerGold)" strokeWidth="0.4" opacity="0.6" />
        <line x1="76" y1="15.5" x2="92" y2="15.5" stroke="url(#noirDividerGold)" strokeWidth="0.4" opacity="0.6" />
      </svg>
      <span className="mq-ed-noir-divider-rail rail-right" />
    </div>
  );
};

/**
 * Authentic Art Deco faceted octagon cartouche for course numerals.
 * Features stepped concentric gold leaf fillets, 4 faceted diamond rivets at
 * the diagonal chamfers, and an obsidian velvet inner coin bed.
 */
const DecoCourseMedallion: React.FC<{
  index: number;
  size?: number;
  className?: string;
}> = ({ index, size = 52, className }) => {
  const numeral = toRomanCourse(index);

  return (
    <div
      className={['mq-ed-noir-medallion-wrap', className].filter(Boolean).join(' ')}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        focusable="false"
        className="mq-ed-noir-medallion-svg"
      >
        <defs>
          <linearGradient id="noirMedallionGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bf953f" />
            <stop offset="25%" stopColor="#fcf6ba" />
            <stop offset="50%" stopColor="#b38728" />
            <stop offset="75%" stopColor="#fbf5b7" />
            <stop offset="100%" stopColor="#8a6117" />
          </linearGradient>
          <radialGradient id="noirMedallionVelvet" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#1a1823" />
            <stop offset="70%" stopColor="#0d0c11" />
            <stop offset="100%" stopColor="#060508" />
          </radialGradient>
        </defs>

        {/* Outer Stepped Art Deco Octagon Frame */}
        <polygon
          points="20,4 44,4 60,20 60,44 44,60 20,60 4,44 4,20"
          fill="none"
          stroke="url(#noirMedallionGold)"
          strokeWidth="1.2"
        />

        {/* Secondary Hairline Concentric Octagon */}
        <polygon
          points="21.5,7 42.5,7 57,21.5 57,42.5 42.5,57 21.5,57 7,42.5 7,21.5"
          fill="none"
          stroke="url(#noirMedallionGold)"
          strokeWidth="0.5"
          opacity="0.6"
        />

        {/* Inner Recessed Velvet Coin Bed */}
        <polygon
          points="22.5,9.5 41.5,9.5 54.5,22.5 54.5,41.5 41.5,54.5 22.5,54.5 9.5,41.5 9.5,22.5"
          fill="url(#noirMedallionVelvet)"
          stroke="url(#noirMedallionGold)"
          strokeWidth="0.75"
        />

        {/* 4 Corner Faceted Diamond Rivets at the diagonal chamfers */}
        <rect x="11" y="11" width="3" height="3" transform="rotate(45 12.5 12.5)" fill="url(#noirMedallionGold)" />
        <rect x="50" y="11" width="3" height="3" transform="rotate(45 51.5 12.5)" fill="url(#noirMedallionGold)" />
        <rect x="11" y="50" width="3" height="3" transform="rotate(45 12.5 51.5)" fill="url(#noirMedallionGold)" />
        <rect x="50" y="50" width="3" height="3" transform="rotate(45 51.5 51.5)" fill="url(#noirMedallionGold)" />

        {/* Hot-Stamped 24k Gold Roman Numeral */}
        <text
          x="32"
          y="38.5"
          textAnchor="middle"
          fill="url(#noirMedallionGold)"
          fontFamily="var(--mq-font-display, 'Cinzel', serif)"
          fontSize={numeral.length > 2 ? '13' : '15'}
          fontWeight="600"
          letterSpacing="0.08em"
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.9))' }}
        >
          {numeral}
        </text>
      </svg>
    </div>
  );
};

/** Stepped Art Deco corner bracket for elevated "Sélection du Chef" cards. */
const DecoCardCornerBracket: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className,
}) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    aria-hidden="true"
    focusable="false"
    className={['mq-ed-noir-card-corner-svg', className].filter(Boolean).join(' ')}
  >
    <defs>
      <linearGradient id="noirBracketGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#bf953f" />
        <stop offset="50%" stopColor="#fcf6ba" />
        <stop offset="100%" stopColor="#8a6117" />
      </linearGradient>
    </defs>
    {/* Concentric Stepped Corner Bracket */}
    <path
      d="M 2 2 L 30 2 L 30 5 L 14 5 L 14 14 L 5 14 L 5 30 L 2 30 Z"
      fill="none"
      stroke="url(#noirBracketGold)"
      strokeWidth="1"
    />
    <path
      d="M 5 5 L 24 5 L 24 8 L 11 8 L 11 19 L 8 19 L 8 24 L 5 24 Z"
      fill="none"
      stroke="url(#noirBracketGold)"
      strokeWidth="0.5"
      opacity="0.65"
    />
    {/* Corner Faceted Diamond Accent */}
    <rect x="3.5" y="3.5" width="3" height="3" transform="rotate(45 5 5)" fill="url(#noirBracketGold)" />
  </svg>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const MaisonNoirEdition: React.FC<EditionProps> = ({
  restaurant,
  categories,
  compact,
  readOnly,
}) => {
  const tokens = useMenuTheme();
  const { query, setQuery, dietFilter, setDietFilter, counts, visible, hasQuery, allergenFilter, setAllergenFilter, spiceFilter, setSpiceFilter } = useMenuFilters(categories);
  const signatures = useFeatured(categories, 3);
  const sections = liveCategories(visible);

  const heroImage = tokens.cover.imageUrl || '/assets/themes/maison-noir-luxury-cover.webp';

  return (
    <div className={compact ? 'mq-ed mq-ed-noir is-compact' : 'mq-ed mq-ed-noir'}>
      {/* =========================================================================
          COVER : Art Deco Haute Gastronomie Grand Folio
          ========================================================================= */}
      <header className="mq-ed-noir-cover" data-edition-cover="maison-noir">
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

        {/* Deep obsidian vignette veil with micro-tooth texture */}
        <span className="mq-ed-noir-veil" aria-hidden="true" />

        {/* Architectural double-fillet ziggurat frame */}
        <span className="mq-ed-noir-frame" aria-hidden="true" />

        {/* 1920s Art Deco Stepped Corner Ziggurats */}
        <span className="mq-ed-noir-fan mq-ed-noir-fan-tl"><DecoCornerZiggurat size={compact ? 36 : undefined} /></span>
        <span className="mq-ed-noir-fan mq-ed-noir-fan-tr"><DecoCornerZiggurat size={compact ? 36 : undefined} /></span>
        <span className="mq-ed-noir-fan mq-ed-noir-fan-bl"><DecoCornerZiggurat size={compact ? 36 : undefined} /></span>
        <span className="mq-ed-noir-fan mq-ed-noir-fan-br"><DecoCornerZiggurat size={compact ? 36 : undefined} /></span>

        <div className="mq-ed-noir-cover-body">
          {/* Prestige Sur-Titre Strip */}
          <div className="mq-ed-noir-prestige-strip">
            <span className="mq-ed-noir-prestige-pip" aria-hidden="true">◈</span>
            <span className="mq-ed-noir-edition-label">
              {restaurant.cuisine || 'Menu'}
            </span>
            <span className="mq-ed-noir-prestige-pip" aria-hidden="true">◈</span>
          </div>

          {/* STRICT DEDICATED LOCATION: Architectural Central Logo Cartouche directly above title */}
          <DecoLogoCartouche size={compact ? 130 : undefined}>
            <BrandMark
              restaurant={restaurant}
              size={compact ? 84 : 116}
              className="mq-ed-mark-in-cartouche"
            />
          </DecoLogoCartouche>

          {/* Grand Chiseled Title with Dorure à Chaud Gold Foil Shader */}
          <h1 className="mq-ed-noir-title mq-ed-noir-foil-text">{restaurant.name}</h1>

          {/* Art Deco Center Astragal Divider */}
          <DecoAstragalRule className="mq-ed-noir-cover-divider" />

          {/* Tagline / Subtitle */}
          {restaurant.tagline && <p className="mq-ed-noir-tagline">&ldquo;{restaurant.tagline}&rdquo;</p>}

          {/* Curated Category Teaser */}
          <CategoryTeaser
            categories={categories}
            limit={4}
            separator="·"
            className="mq-ed-noir-teaser"
          />
        </div>

        {/* Colophon & Contact */}
        <EditionContact restaurant={restaurant} className="mq-ed-noir-contact" separator="·" />
      </header>

      {/* =========================================================================
          TOOLBAR & FILTERS
          ========================================================================= */}
      {!compact && (
        <>
          {tokens.announcement && (
            <p className="mq-ed-noir-announce" role="note">
              <span className="mq-ed-noir-announce-bullet">✦</span>
              {tokens.announcement}
              <span className="mq-ed-noir-announce-bullet">✦</span>
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
          INTERIOR : Michelin-Starred Tasting Card Layout & Folio
          ========================================================================= */}
      <main className="mq-ed-noir-plate">
        {/* 1. SÉLECTION DU CHEF : CURATED SIGNATURE SHOWCASE */}
        {signatures.length > 0 && !compact && !hasQuery && (
          <section className="mq-ed-noir-signatures-section" aria-label="Featured dishes">
            <div className="mq-ed-noir-section-header">
              <h2 className="mq-ed-noir-section-title">Featured dishes</h2>
              <DecoArchitecturalDivider variant="grand" className="mq-ed-noir-section-rule" />
            </div>

            <div className="mq-ed-noir-signatures-grid">
              {signatures.map((item, idx) => (
                <article key={item.id} className="mq-ed-noir-curation-card">
                  {/* Stepped gold corner brackets */}
                  <span className="mq-ed-noir-card-corner mq-ed-noir-card-corner-tl"><DecoCardCornerBracket /></span>
                  <span className="mq-ed-noir-card-corner mq-ed-noir-card-corner-tr"><DecoCardCornerBracket /></span>
                  <span className="mq-ed-noir-card-corner mq-ed-noir-card-corner-bl"><DecoCardCornerBracket /></span>
                  <span className="mq-ed-noir-card-corner mq-ed-noir-card-corner-br"><DecoCardCornerBracket /></span>

                  <div className="mq-ed-noir-card-media-wrapper">
                    <SmartImage
                      src={item.imageUrl}
                      alt={item.name}
                      role="card"
                      focal={item.focal}
                      aspectRatio="16 / 10"
                    />
                    <span className="mq-ed-noir-card-badge">
                      {toRomanCourse(idx)}
                    </span>
                  </div>

                  <div className="mq-ed-noir-card-info">
                    <div className="mq-ed-noir-card-header">
                      <div className="mq-ed-noir-card-identity">
                        <DietMark type={item.dietType} />
                        <h3 className="mq-ed-noir-card-name mq-dish-name">{item.name}</h3>
                      </div>
                      <div className="mq-ed-noir-card-price-slot">
                        <DishPrice item={item} readOnly={readOnly} />
                      </div>
                    </div>

                    {item.description && (
                      <p className="mq-ed-noir-card-desc mq-dish-desc">{cleanDescription(item)}</p>
                    )}

                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 2. MENU COURSES : DOTTED LEADER ROWS */}
        {sections.length === 0 ? (
          hasQuery ? (
            <EmptyResults query={query.trim()} onClear={() => setQuery('')} />
          ) : (
            <p className="mq-ed-empty" role="status">
              This menu has no dishes yet.
            </p>
          )
        ) : (
          sections.map((category, catIdx) => (
            <section
              key={category.id}
              className="mq-ed-noir-course"
              aria-labelledby={`mq-ed-noir-${category.id}`}
            >
              <div className="mq-ed-noir-course-heading-box">
                {/* 1920s Art Deco Roman Numeral Medallion */}
                <DecoCourseMedallion index={catIdx} />

                <span className="mq-ed-noir-course-service-name">
                  Section {toRomanCourse(catIdx)}
                </span>

                <h2 id={`mq-ed-noir-${category.id}`} className="mq-ed-noir-course-title">
                  {category.name}
                </h2>

                <DecoArchitecturalDivider variant="course" className="mq-ed-noir-course-rule" />

                {category.description && (
                  <p className="mq-ed-noir-course-note">{category.description}</p>
                )}
              </div>

              <div className="mq-ed-noir-list">
                {category.items.map((item) => (
                  <Leader key={item.id} item={item} readOnly={readOnly} showFlags={!compact} />
                ))}
              </div>
            </section>
          ))
        )}

      </main>

      {/* =========================================================================
          COLOPHON & FOOTER
          ========================================================================= */}
      <footer className="mq-ed-noir-foot">
        <DecoArchitecturalDivider variant="grand" />

        <p className="mq-ed-noir-foot-name mq-ed-noir-foil-text">{restaurant.name}</p>
        <EditionContact restaurant={restaurant} />

        {/* Final Art Deco Finial Lozenge */}
        <div className="mq-ed-noir-finial" aria-hidden="true">
          <span className="mq-ed-noir-finial-bar" />
          <span className="mq-ed-noir-finial-lozenge">❖</span>
          <span className="mq-ed-noir-finial-bar" />
        </div>
      </footer>
    </div>
  );
};

export default MaisonNoirEdition;
