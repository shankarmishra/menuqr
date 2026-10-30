/**
 * MENUQR Edition #2 — Herbarium (World-Class Redesign)
 *
 * Botanical letterpress & French conservatory garden bistro.
 * Dedicated to farm-to-table restaurants, artisan patisseries, sourdough bakeries,
 * organic vegetarian dining, and garden cafés.
 *
 * Features:
 * - Hand-pressed botanical specimen cover on warm linen rag parchment
 * - Bespoke engraved laurel & olive botanical medallion seal with integrated BrandMark
 * - Museum-archival passepartout specimen mounts with kraft photo corner tabs
 * - Curated "Récolte du Jardin" signature showcase with botanical infusion notes
 * - Responsive single-to-two-column layout (spacious single column on mobile, balanced dual columns on desktop)
 * - Last-baseline anchored dotted leaders with botanical pearl dots
 * - French garden botanical service headings and greenhouse conservatory experience aside
 */

import React from 'react';
import { useMenuTheme } from '../../MenuThemeProvider.tsx';
import { useMenuFilters } from '../../useMenuFilters.ts';
import { SmartImage } from '../../primitives/SmartImage.tsx';
import { DietMark, DishPrice } from '../../primitives/DishMeta.tsx';
import { EmptyResults, MenuToolbar } from '../../primitives/MenuToolbar.tsx';
import {
  BrandMark,
  CategoryTeaser,
  EditionContact,
  Leader,
  cleanDescription,
  liveCategories,
  useFeatured,
  type EditionProps,
} from './shared.tsx';
import './editions.css';

// =============================================================================
// BESPOKE BOTANICAL VECTOR ORNAMENTATION
// =============================================================================

/** Delicate botanical corner sprig for archival plate margins. */
const BotanicalCornerFiligree: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className,
}) => (
  <svg
    viewBox="0 0 48 48"
    width={size}
    height={size}
    aria-hidden="true"
    focusable="false"
    className={['mq-ed-herb-corner-svg', className].filter(Boolean).join(' ')}
  >
    {/* Outer corner stem curve */}
    <path
      d="M 4 44 C 4 20, 20 4, 44 4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M 8 44 C 8 24, 24 8, 44 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.5"
      opacity="0.6"
    />
    {/* Curling tendril flourishes */}
    <path
      d="M 14 14 C 18 8, 26 10, 24 16 C 22 22, 12 18, 14 14 Z"
      fill="currentColor"
      opacity="0.25"
      stroke="currentColor"
      strokeWidth="0.8"
    />
    <path
      d="M 6 30 C 2 24, 8 20, 12 24 C 15 27, 10 33, 6 30 Z"
      fill="currentColor"
      opacity="0.25"
      stroke="currentColor"
      strokeWidth="0.8"
    />
    <path
      d="M 30 6 C 24 2, 20 8, 24 12 C 27 15, 33 10, 30 6 Z"
      fill="currentColor"
      opacity="0.25"
      stroke="currentColor"
      strokeWidth="0.8"
    />
    {/* Corner rosette berry */}
    <circle cx="6" cy="6" r="2.5" fill="currentColor" opacity="0.85" />
    <circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
  </svg>
);

/** Single wild olive / rosemary branch. Mirrored by CSS for symmetrical wreaths. */
const BotanicalSprig: React.FC<{ size?: number; className?: string }> = ({
  size = 110,
  className,
}) => (
  <svg
    viewBox="0 0 64 130"
    width={size * 0.48}
    height={size}
    aria-hidden="true"
    focusable="false"
    className={['mq-ed-herb-sprig-svg', className].filter(Boolean).join(' ')}
  >
    {/* Archival organic stem */}
    <path
      d="M 32 128 C 32 96, 26 64, 32 4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    {[16, 32, 48, 64, 80, 96, 112].map((y, index) => {
      const lean = index % 2 === 0 ? 1 : -1;
      const span = 22 - index * 1.4;
      return (
        <g key={y}>
          {/* Leaf blade with delicate natural vein */}
          <path
            d={`M 32 ${y} C ${32 + lean * span * 0.5} ${y - 10} ${32 + lean * span} ${y - 6} ${32 + lean * span} ${y + 3}
                C ${32 + lean * span} ${y + 11} ${32 + lean * span * 0.4} ${y + 10} 32 ${y}`}
            fill="currentColor"
            opacity="0.22"
          />
          <path
            d={`M 32 ${y} C ${32 + lean * span * 0.5} ${y - 10} ${32 + lean * span} ${y - 6} ${32 + lean * span} ${y + 3}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.9"
            strokeLinecap="round"
          />
          {/* Botanical seed node */}
          {index % 2 === 1 && (
            <circle
              cx={32 + lean * (span * 0.75)}
              cy={y - 2}
              r="1.4"
              fill="currentColor"
              opacity="0.75"
            />
          )}
        </g>
      );
    })}
    {/* Terminal apex flower bud */}
    <circle cx="32" cy="4" r="2.8" fill="currentColor" opacity="0.8" />
  </svg>
);

/**
 * Museum Accession Botanical Wreath Seal with integrated BrandMark.
 * Features:
 * - 32-seed circular perlage ring
 * - Twin symmetrical laurel & olive branches
 * - Accession banner ribbon
 * - Recessed coin bed for restaurant logo
 */
const BotanicalWreathSeal: React.FC<{
  size?: number;
  children?: React.ReactNode;
}> = ({ size, children }) => (
  <div
    className="mq-ed-herb-wreath-seal"
    style={size ? { width: size, height: size } : undefined}
    aria-hidden="true"
  >
    <svg
      viewBox="0 0 160 160"
      className="mq-ed-herb-seal-svg"
      focusable="false"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="herbSealBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#faf8f2" />
          <stop offset="85%" stopColor="#ede7d8" />
          <stop offset="100%" stopColor="#ded6c3" />
        </radialGradient>
      </defs>

      {/* Outer concentric hairline ring */}
      <circle cx="80" cy="80" r="76" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.45" />
      <circle cx="80" cy="80" r="72" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />

      {/* 32 Botanical seed beads */}
      {Array.from({ length: 32 }).map((_, i) => {
        const rad = (i * 11.25 * Math.PI) / 180;
        return (
          <circle
            key={i}
            cx={80 + 74 * Math.cos(rad)}
            cy={80 + 74 * Math.sin(rad)}
            r="1"
            fill="currentColor"
            opacity="0.65"
          />
        );
      })}

      {/* Left Laurel Wreath Branch */}
      <path
        d="M 38 120 C 20 98, 20 62, 38 40 C 44 32, 54 26, 68 22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.85"
      />
      {[45, 60, 78, 96, 114].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const cx = 80 - 52 * Math.sin(rad);
        const cy = 80 + 52 * Math.cos(rad);
        return (
          <ellipse
            key={deg}
            cx={cx}
            cy={cy}
            rx="5.5"
            ry="2.5"
            transform={`rotate(${-deg + 45} ${cx} ${cy})`}
            fill="currentColor"
            opacity="0.35"
            stroke="currentColor"
            strokeWidth="0.8"
          />
        );
      })}

      {/* Right Laurel Wreath Branch */}
      <path
        d="M 122 120 C 140 98, 140 62, 122 40 C 116 32, 106 26, 92 22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.85"
      />
      {[45, 60, 78, 96, 114].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const cx = 80 + 52 * Math.sin(rad);
        const cy = 80 + 52 * Math.cos(rad);
        return (
          <ellipse
            key={deg}
            cx={cx}
            cy={cy}
            rx="5.5"
            ry="2.5"
            transform={`rotate(${deg - 45} ${cx} ${cy})`}
            fill="currentColor"
            opacity="0.35"
            stroke="currentColor"
            strokeWidth="0.8"
          />
        );
      })}

      {/* Bottom Archival Motto Ribbon */}
      <path
        d="M 44 128 L 116 128 L 110 142 L 50 142 Z"
        fill="url(#herbSealBg)"
        stroke="currentColor"
        strokeWidth="0.8"
      />
      <text
        x="80"
        y="138"
        textAnchor="middle"
        fill="currentColor"
        fontFamily="var(--mq-font-display, serif)"
        fontSize="6"
        fontWeight="700"
        letterSpacing="0.22em"
      >
        FLORA &bull; TERROIR
      </text>

      {/* Inner Recessed Coin Bed */}
      <circle cx="80" cy="76" r="44" fill="url(#herbSealBg)" stroke="currentColor" strokeWidth="1" />
      <circle cx="80" cy="76" r="41.5" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 2" opacity="0.6" />
    </svg>
    <div className="mq-ed-herb-seal-logo">{children}</div>
  </div>
);

/** Botanical Engraved Divider with three-leaf fleur and tapered rails. */
const BotanicalEngravedDivider: React.FC<{ className?: string }> = ({ className }) => (
  <div className={['mq-ed-herb-divider', className].filter(Boolean).join(' ')} aria-hidden="true">
    <span className="mq-ed-herb-divider-rail rail-left" />
    <svg viewBox="0 0 64 20" width="64" height="20" focusable="false" className="mq-ed-herb-divider-svg">
      {/* Central Trefoil Leaf Fleur */}
      <path
        d="M 32 3 C 28 8, 30 14, 32 17 C 34 14, 36 8, 32 3 Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path
        d="M 32 10 C 26 8, 21 11, 23 15 C 26 17, 30 14, 32 10 Z"
        fill="currentColor"
        opacity="0.75"
      />
      <path
        d="M 32 10 C 38 8, 43 11, 41 15 C 38 17, 34 14, 32 10 Z"
        fill="currentColor"
        opacity="0.75"
      />
      {/* Flanking Stems & Seed Rivets */}
      <line x1="6" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="1" />
      <circle cx="4" cy="10" r="2" fill="currentColor" opacity="0.8" />
      <line x1="42" y1="10" x2="58" y2="10" stroke="currentColor" strokeWidth="1" />
      <circle cx="60" cy="10" r="2" fill="currentColor" opacity="0.8" />
    </svg>
    <span className="mq-ed-herb-divider-rail rail-right" />
  </div>
);

/** Olive leaf glyph preceding course titles. */
const LeafTick: React.FC = () => (
  <svg viewBox="0 0 24 16" width="22" height="15" aria-hidden="true" focusable="false" className="mq-ed-herb-leaf-tick">
    <path d="M1 8 H9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path
      d="M9 8 C13 1 19 1 23 3 C21 11 15 14 9 8 Z"
      fill="currentColor"
      opacity="0.3"
      stroke="currentColor"
      strokeWidth="1"
    />
    <path d="M9 8 C14 7 18 6 22 4" stroke="currentColor" strokeWidth="0.6" opacity="0.8" />
  </svg>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const HerbariumEdition: React.FC<EditionProps> = ({
  restaurant,
  categories,
  compact,
  readOnly,
}) => {
  const tokens = useMenuTheme();
  const { query, setQuery, dietFilter, setDietFilter, counts, visible, hasQuery } =
    useMenuFilters(categories);
  const signatures = useFeatured(categories, 3);
  const sections = liveCategories(visible);

  const heroImage = tokens.cover.imageUrl || '/assets/themes/herbarium-hero.webp';

  return (
    <div className={compact ? 'mq-ed mq-ed-herb is-compact' : 'mq-ed mq-ed-herb'}>
      {/* =========================================================================
          COVER : Pressed Botanical Specimen & Archival Letterpress Plate
          ========================================================================= */}
      <header className="mq-ed-herb-cover" data-edition-cover="herbarium">
        {/* Archival Double-Ruled Plate Margin */}
        <span className="mq-ed-herb-plate" aria-hidden="true" />

        {/* 4 Corner Botanical Filigrees */}
        <span className="mq-ed-herb-corner mq-ed-herb-corner-tl"><BotanicalCornerFiligree size={compact ? 28 : 42} /></span>
        <span className="mq-ed-herb-corner mq-ed-herb-corner-tr"><BotanicalCornerFiligree size={compact ? 28 : 42} /></span>
        <span className="mq-ed-herb-corner mq-ed-herb-corner-bl"><BotanicalCornerFiligree size={compact ? 28 : 42} /></span>
        <span className="mq-ed-herb-corner mq-ed-herb-corner-br"><BotanicalCornerFiligree size={compact ? 28 : 42} /></span>

        <div className="mq-ed-herb-cover-body">
          {/* Natural History Accession Folio Header */}
          <div className="mq-ed-herb-folio">
            <span className="mq-ed-herb-folio-badge">HORTUS BOTANICUS</span>
            <span className="mq-ed-herb-folio-dash" aria-hidden="true" />
            <span className="mq-ed-herb-folio-num">FOLIO No. 02</span>
            <span className="mq-ed-herb-folio-dash" aria-hidden="true" />
            <span className="mq-ed-herb-folio-label">CARTE DU JOUR</span>
          </div>

          {/* Symmetrical Botanical Wreath Seal with integrated BrandMark */}
          <BotanicalWreathSeal size={compact ? 94 : 124}>
            <BrandMark
              restaurant={restaurant}
              size={compact ? 52 : 72}
              className="mq-ed-mark-herb"
            />
          </BotanicalWreathSeal>

          {/* Grand Typography: Restaurant Name */}
          <div className="mq-ed-herb-identity">
            <h1 className="mq-ed-herb-title">{restaurant.name}</h1>
            <BotanicalEngravedDivider className="mq-ed-herb-title-divider" />
            {restaurant.cuisine ? (
              <p className="mq-ed-herb-cuisine">{restaurant.cuisine}</p>
            ) : (
              <p className="mq-ed-herb-cuisine">Artisanal Garden Bistro &bull; Farm-to-Table</p>
            )}
          </div>

          {/* Poetic Provenance / Tagline */}
          <p className="mq-ed-herb-tagline">
            {restaurant.tagline ? (
              <>&ldquo;{restaurant.tagline}&rdquo;</>
            ) : (
              <>Heirloom grains, slow fermentation hearth, and seasonal botanicals picked at dawn.</>
            )}
          </p>

          {/* Curated Category Teaser */}
          <CategoryTeaser
            categories={categories}
            limit={4}
            separator="·"
            className="mq-ed-herb-teaser"
          />

          {/* Archival Specimen Photograph Mount (Passepartout Frame) */}
          {heroImage && (
            <figure className="mq-ed-herb-specimen-mount">
              {/* Kraft photo corner mounts */}
              <span className="mq-ed-herb-kraft-corner corner-tl" aria-hidden="true" />
              <span className="mq-ed-herb-kraft-corner corner-tr" aria-hidden="true" />
              <span className="mq-ed-herb-kraft-corner corner-bl" aria-hidden="true" />
              <span className="mq-ed-herb-kraft-corner corner-br" aria-hidden="true" />

              <div className="mq-ed-herb-mount-inner">
                <SmartImage
                  src={heroImage}
                  alt={restaurant.name}
                  role="card"
                  focal={tokens.cover.focal}
                  aspectRatio="16 / 10"
                  priority
                />
              </div>

              {/* Museum Accession Ticket */}
              <figcaption className="mq-ed-herb-mount-caption">
                <span className="caption-tag">SPECIMEN No. 1894</span>
                <span className="caption-sep">&bull;</span>
                <span className="caption-title">R&eacute;colte du Potager &amp; Fournil Artisanal</span>
              </figcaption>
            </figure>
          )}

          {/* Archival Ledger Contact & Colophon */}
          <EditionContact
            restaurant={restaurant}
            className="mq-ed-herb-contact"
            separator="·"
          />
        </div>
      </header>

      {/* =========================================================================
          INTERIOR : Botanical Bill of Fare
          ========================================================================= */}
      {!compact && (
        <>
          {tokens.announcement && (
            <p className="mq-ed-herb-announce" role="note">
              <span className="mq-ed-herb-announce-pip">&sect;</span>
              <span>{tokens.announcement}</span>
              <span className="mq-ed-herb-announce-pip">&sect;</span>
            </p>
          )}
          <MenuToolbar
            query={query}
            onQueryChange={setQuery}
            dietFilter={dietFilter}
            onDietFilterChange={setDietFilter}
            counts={counts}
          />
        </>
      )}

      <main className="mq-ed-herb-plate-main">
        {/* 1. RÉCOLTE DU JARDIN — CURATED HARVEST SHOWCASE */}
        {signatures.length > 0 && !compact && !hasQuery && (
          <section className="mq-ed-herb-showcase" aria-label="Récolte du Jardin">
            <div className="mq-ed-herb-showcase-header">
              <span className="mq-ed-eyebrow">Sélection Maraîchère</span>
              <h2 className="mq-ed-herb-showcase-title">R&eacute;colte du Jardin &bull; Harvest Specialties</h2>
              <BotanicalEngravedDivider className="mq-ed-herb-showcase-rule" />
              <p className="mq-ed-herb-showcase-sub">
                Hand-harvested estate greens, cold-pressed culinary botanicals, and wood-fired hearth delicacies.
              </p>
            </div>

            <div className="mq-ed-herb-showcase-grid">
              {signatures.map((item, idx) => (
                <article key={item.id} className="mq-ed-herb-card">
                  {/* Kraft photo corners */}
                  <span className="mq-ed-herb-kraft-corner corner-tl" aria-hidden="true" />
                  <span className="mq-ed-herb-kraft-corner corner-tr" aria-hidden="true" />
                  <span className="mq-ed-herb-kraft-corner corner-bl" aria-hidden="true" />
                  <span className="mq-ed-herb-kraft-corner corner-br" aria-hidden="true" />

                  <div className="mq-ed-herb-card-media">
                    <SmartImage
                      src={item.imageUrl}
                      alt={item.name}
                      role="card"
                      focal={item.focal}
                      aspectRatio="16 / 10"
                    />
                    <span className="mq-ed-herb-card-badge">
                      Planche 0{idx + 1}
                    </span>
                  </div>

                  <div className="mq-ed-herb-card-body">
                    <div className="mq-ed-herb-card-head">
                      <div className="mq-ed-herb-card-name-group">
                        <DietMark type={item.dietType} />
                        <h3 className="mq-ed-herb-card-name">{item.name}</h3>
                      </div>
                      <span className="mq-ed-herb-card-price">
                        <DishPrice item={item} readOnly={readOnly} />
                      </span>
                    </div>

                    {item.description && (
                      <p className="mq-ed-herb-card-desc">{cleanDescription(item)}</p>
                    )}

                    {/* Botanical infusion provenance tag */}
                    <div className="mq-ed-herb-card-infusion">
                      <span className="infusion-icon">🌿</span>
                      <span className="infusion-text">Infusion botanique de saison &bull; Terroir local</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 2. MENU COURSES : BILL OF FARE WITH CENTER RULE (Responsive 1 or 2 Columns) */}
        {sections.length === 0 ? (
          hasQuery ? (
            <EmptyResults query={query.trim()} onClear={() => setQuery('')} />
          ) : (
            <p className="mq-ed-empty" role="status">
              This garden menu has no dishes yet.
            </p>
          )
        ) : (
          <div className="mq-ed-herb-columns">
            {sections.map((category) => (
              <section
                key={category.id}
                className="mq-ed-herb-section"
                aria-labelledby={`mq-ed-herb-${category.id}`}
              >
                <div className="mq-ed-herb-section-heading">
                  <div className="mq-ed-herb-section-title-wrap">
                    <LeafTick />
                    <h2 id={`mq-ed-herb-${category.id}`} className="mq-ed-herb-section-title">
                      {category.name}
                    </h2>
                    <span className="mq-ed-herb-section-count">
                      {category.items.length} {category.items.length === 1 ? 'sélection' : 'sélections'}
                    </span>
                  </div>
                  <BotanicalEngravedDivider className="mq-ed-herb-section-divider" />
                  {category.description && (
                    <p className="mq-ed-herb-section-note">{category.description}</p>
                  )}
                </div>

                <div className="mq-ed-herb-list">
                  {category.items.map((item) => (
                    <Leader key={item.id} item={item} readOnly={readOnly} showFlags={!compact} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* 3. GREENHOUSE CONSERVATORY EXPERIENCE PLAQUE */}
        {!compact && !hasQuery && sections.length > 0 && (
          <aside className="mq-ed-herb-conservatory-aside" aria-label="Conservatory & Hearth">
            <span className="mq-ed-herb-corner mq-ed-herb-corner-tl"><BotanicalCornerFiligree size={24} /></span>
            <span className="mq-ed-herb-corner mq-ed-herb-corner-tr"><BotanicalCornerFiligree size={24} /></span>
            <span className="mq-ed-herb-corner mq-ed-herb-corner-bl"><BotanicalCornerFiligree size={24} /></span>
            <span className="mq-ed-herb-corner mq-ed-herb-corner-br"><BotanicalCornerFiligree size={24} /></span>

            <div className="mq-ed-herb-conservatory-inner">
              <span className="mq-ed-herb-conservatory-surtitle">LE FOURNIL &amp; CONSERVATOIRE</span>
              <h3 className="mq-ed-herb-conservatory-title">Artisan Hearth &amp; Wild Herbal Tisanes</h3>
              <p className="mq-ed-herb-conservatory-text">
                Every loaf of sourdough is naturally leavened over 36 hours from organic stone-ground heritage flour.
                Our seasonal botanicals, edible blossoms, and herbal infusions are steeped fresh daily from the kitchen garden.
              </p>
              <div className="mq-ed-herb-conservatory-tags">
                <span className="conservatory-pill">Stone-Milled Grains</span>
                <span className="conservatory-pill">Organic Estate Olive Oil</span>
                <span className="conservatory-pill">Wild Garden Herbs</span>
              </div>
            </div>
          </aside>
        )}
      </main>

      {/* =========================================================================
          FOOTER : Field Ledger Seal & Botanical Colophon
          ========================================================================= */}
      <footer className="mq-ed-herb-foot">
        <BotanicalSprig size={68} className="mq-ed-herb-foot-sprig" />
        <p className="mq-ed-herb-foot-name">{restaurant.name}</p>
        <p className="mq-ed-herb-foot-motto">
          Hortus Botanicus &bull; Cuisine Mara&icirc;ch&egrave;re du Terroir
        </p>
        <EditionContact restaurant={restaurant} className="mq-ed-herb-foot-contact" />
      </footer>
    </div>
  );
};

export default HerbariumEdition;
