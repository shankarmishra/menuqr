/**
 * MENUQR Edition — Carta Rustica (Signature Edition #4)
 *
 * Artisanal Italian Trattoria & Tuscan Kraft Paper Bill of Fare.
 * Crafted with:
 * - Woven Chianti red and ecru gingham check (*Tovaglia a Quadri*) with linen saddle stitching.
 * - Artisan Tuscan crimson wax seal (*Sigillo di Ceralacca*) housing the client brand mark.
 * - Photographic snapshot mounts (*Cartoline Polaroids*) pinned with deckle-edged crepe masking tape.
 * - Curated "Specialità della Casa" (House Specialties) showcase.
 * - Anti-squash two-tier dish architecture with dotted leader lines and circular stamped price seals.
 * - Container-query responsive flow: generous single-column on mobile, dual-column on wide screens.
 * - Woodcut hearth aside plaque (*La Nostra Tradizione — Il Forno a Legna e L'Olio d'Oliva*).
 * - Colophon footer with weathered rubber stamp seal and Italian hospitality motto.
 */

import React, { useMemo } from 'react';
import { useMenuTheme } from '../../MenuThemeProvider.tsx';
import { useMenuFilters } from '../../useMenuFilters.ts';
import { SmartImage } from '../../primitives/SmartImage.tsx';
import { UnifiedDishCard } from '../../primitives/UnifiedDishCard.tsx';
import { EmptyResults, MenuToolbar } from '../../primitives/MenuToolbar.tsx';
import { CapsulePillsNav } from '../../slots/navs.tsx';
import { DietMark, DishFlags, DishPrice } from '../../primitives/DishMeta.tsx';
import {
  BrandMark,
  EditionContact,
  cleanDescription,
  liveCategories,
  useFeatured,
  type EditionProps,
} from './shared.tsx';
import './editions.css';
import './editions-b.css';

/** Deterministic tilts for polaroid snapshot mounts, so page renders consistently across snapshots. */
const TAPE_TILTS = ['-2.2deg', '1.8deg', '-1.4deg', '2.5deg'];

/**
 * Woven Gingham Band (*Tovaglia a Quadri*)
 * Authentic trattoria cotton-linen check ribbon with top and bottom saddle-stitch dashes.
 */
const TovagliaGinghamBand: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`mq-ed-carta-gingham ${className || ''}`} aria-hidden="true">
    <div className="mq-ed-carta-stitch top-stitch" />
    <div className="mq-ed-carta-gingham-weave" />
    <div className="mq-ed-carta-stitch bottom-stitch" />
  </div>
);

/**
 * Tuscan Wheat Ear Sprig Divider (*Spiga di Grano*)
 */
const TuscanWheatDivider: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`mq-ed-carta-wheat-divider ${className || ''}`} aria-hidden="true">
    <svg viewBox="0 0 180 20" width="160" height="18" fill="none" stroke="currentColor">
      {/* Left stem */}
      <line x1="10" y1="10" x2="65" y2="10" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
      {/* Left grains */}
      <path d="M 45 10 Q 52 4 60 7 Q 54 10 45 10 Z" fill="currentColor" opacity="0.75" />
      <path d="M 45 10 Q 52 16 60 13 Q 54 10 45 10 Z" fill="currentColor" opacity="0.75" />
      <path d="M 58 10 Q 66 3 74 6 Q 67 10 58 10 Z" fill="currentColor" opacity="0.85" />
      <path d="M 58 10 Q 66 17 74 14 Q 67 10 58 10 Z" fill="currentColor" opacity="0.85" />
      {/* Center rosette */}
      <circle cx="90" cy="10" r="4.5" fill="currentColor" />
      <circle cx="90" cy="10" r="2" fill="var(--mq-color-surface, #F6EEDB)" />
      {/* Right grains */}
      <path d="M 135 10 Q 128 4 120 7 Q 126 10 135 10 Z" fill="currentColor" opacity="0.75" />
      <path d="M 135 10 Q 128 16 120 13 Q 126 10 135 10 Z" fill="currentColor" opacity="0.75" />
      <path d="M 122 10 Q 114 3 106 6 Q 113 10 122 10 Z" fill="currentColor" opacity="0.85" />
      <path d="M 122 10 Q 114 17 106 14 Q 113 10 122 10 Z" fill="currentColor" opacity="0.85" />
      {/* Right stem */}
      <line x1="115" y1="10" x2="170" y2="10" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
    </svg>
  </div>
);

/**
 * Artisan Crimson Wax Seal (*Sigillo di Ceralacca*)
 * Deep Chianti crimson wax medallion with molten rim, circular letterpress text, and client brand mark.
 */
const CeralaccaWaxSeal: React.FC<{
  restaurant: EditionProps['restaurant'];
  compact?: boolean;
}> = ({ restaurant, compact }) => {
  const sealSize = compact ? 88 : 110;
  const brandSize = compact ? 46 : 58;

  return (
    <div
      className="mq-ed-carta-wax-seal"
      style={{ width: sealSize, height: sealSize }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 140 140"
        className="mq-ed-carta-seal-svg"
        focusable="false"
      >
        <defs>
          <radialGradient id="cartaWaxGrad" cx="45%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#A8282E" />
            <stop offset="45%" stopColor="#7E181D" />
            <stop offset="85%" stopColor="#550E12" />
            <stop offset="100%" stopColor="#3C090C" />
          </radialGradient>
          <linearGradient id="cartaWaxGleam" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E26A70" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#7E181D" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#3C090C" stopOpacity="0.9" />
          </linearGradient>
          <filter id="waxShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#230a0c" floodOpacity="0.45" />
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#230a0c" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Molten Scalloped Wax Rim */}
        <path
          d="M 70 8
             C 82 7, 91 12, 102 18
             C 113 25, 122 34, 128 46
             C 134 58, 133 71, 131 84
             C 128 97, 121 109, 111 118
             C 101 127, 88 132, 75 132
             C 61 133, 48 129, 37 122
             C 26 114, 17 104, 12 92
             C 7 80, 8 66, 12 53
             C 17 41, 26 30, 37 22
             C 47 14, 58 8, 70 8 Z"
          fill="url(#cartaWaxGrad)"
          filter="url(#waxShadow)"
        />

        {/* Outer Beveled Molten Ring */}
        <circle cx="70" cy="70" r="58" fill="none" stroke="url(#cartaWaxGleam)" strokeWidth="1.6" opacity="0.8" />
        <circle cx="70" cy="70" r="54" fill="none" stroke="#2a0608" strokeWidth="1" opacity="0.45" />

        {/* Circular Letterpress Motto */}
        <path
          id="waxMottoArc"
          d="M 22 70 A 48 48 0 1 1 118 70 A 48 48 0 1 1 22 70"
          fill="none"
        />
        <text
          fontSize="7"
          fontFamily="var(--mq-font-display, serif)"
          fontWeight="700"
          letterSpacing="0.16em"
          fill="#F5D8B8"
          opacity="0.85"
        >
          <textPath href="#waxMottoArc" startOffset="50%" textAnchor="middle">
            {restaurant.name.toUpperCase()}
          </textPath>
        </text>

        {/* Beaded Perlage Ring */}
        <g fill="#F5D8B8" opacity="0.6">
          {Array.from({ length: 24 }).map((_, i) => {
            const rad = (i * 15 * Math.PI) / 180;
            return <circle key={i} cx={70 + 40 * Math.cos(rad)} cy={70 + 40 * Math.sin(rad)} r="0.9" />;
          })}
        </g>

        {/* Recessed Center Seal Bed */}
        <circle cx="70" cy="70" r="36" fill="#4a0d11" stroke="#310709" strokeWidth="1.2" />
        <circle cx="70" cy="70" r="34" fill="none" stroke="url(#cartaWaxGleam)" strokeWidth="0.8" opacity="0.4" />
      </svg>

      {/* Brand Mark positioned inside the recessed wax center bed */}
      <div className="mq-ed-carta-seal-logo">
        <BrandMark
          restaurant={restaurant}
          size={brandSize}
          className="mq-ed-carta-seal-brand"
        />
      </div>
    </div>
  );
};

export const CartaRusticaEdition: React.FC<EditionProps> = ({
  restaurant,
  categories,
  compact,
  readOnly,
}) => {
  const tokens = useMenuTheme();
  const { query, setQuery, dietFilter, setDietFilter, counts, visible, hasQuery, allergenFilter, setAllergenFilter, spiceFilter, setSpiceFilter, activeCategoryId, setActiveCategoryId, navigableCategories } = useMenuFilters(categories);
  const sections = liveCategories(visible);
  const pinned = useFeatured(categories, 3);

  // House Specialties (*Specialità della Casa*): Top 2-3 items with images or bestsellers
  const houseSpecialties = useMemo(() => {
    const pool = categories.flatMap((cat) => cat.items);
    const withImages = pool.filter((item) => item.imageUrl);
    return withImages.slice(0, 3);
  }, [categories]);

  // Fallback hero image if restaurant hasn't provided a custom cover photo
  const heroCoverImage = tokens.cover?.imageUrl || '/assets/themes/carta-rustica-hero.webp';

  return (
    <div className={compact ? 'mq-ed mq-ed-carta is-compact' : 'mq-ed mq-ed-carta'}>
      {/* =========================================================================
          COVER PUBLICATION: Trattoria Kraft, Woven Gingham & Pinned Snapshots
          ========================================================================= */}
      <header className="mq-ed-carta-cover" data-edition-cover="carta-rustica">
        {/* Top Woven Gingham Check Ribbon */}
        <TovagliaGinghamBand className="mq-ed-carta-check-top" />

        <div className="mq-ed-carta-cover-body">
          {/* Archival Folio Ledger Eyebrow */}
          <div className="mq-ed-carta-folio-header">
            <span className="folio-wheat">🌾</span>
            <span className="folio-text">Menu</span>
            <span className="folio-wheat">🌾</span>
          </div>

          {/* Artisan Crimson Wax Seal with Client Logo */}
          <CeralaccaWaxSeal restaurant={restaurant} compact={compact} />

          {/* Restaurant Identity & High-Contrast Typography */}
          <div className="mq-ed-carta-brand-block">
            <h1 className="mq-ed-carta-title">{restaurant.name}</h1>
            <TuscanWheatDivider className="mq-ed-carta-title-divider" />
            {restaurant.cuisine && (
              <p className="mq-ed-carta-cuisine">{restaurant.cuisine}</p>
            )}
            {restaurant.tagline && (
              <p className="mq-ed-carta-tagline">&ldquo;{restaurant.tagline}&rdquo;</p>
            )}
          </div>

          {/* Pinned Photographic Mounts (Taped Polaroids at Fixed Angles) */}
          <div className="mq-ed-carta-collage" aria-label="Dish photos">
            {/* If we have featured items, render up to 3 polaroids */}
            {pinned.length > 0 ? (
              pinned.map((item, index) => {
                const tilt = TAPE_TILTS[index % TAPE_TILTS.length];
                const imageSrc = item.imageUrl || heroCoverImage;
                return (
                  <figure
                    key={item.id}
                    className="mq-ed-carta-snap"
                    style={{ '--snap-tilt': tilt } as React.CSSProperties}
                  >
                    {/* Semi-translucent Crepe Masking Tape Pin */}
                    <span className="mq-ed-carta-tape" aria-hidden="true" />
                    <div className="mq-ed-carta-snap-frame">
                      <SmartImage
                        src={imageSrc}
                        alt={item.name}
                        role="card"
                        focal={item.focal}
                        aspectRatio="1 / 1"
                      />
                    </div>
                    <figcaption className="mq-ed-carta-snap-caption">
                      <span className="snap-title">{item.name}</span>
                    </figcaption>
                  </figure>
                );
              })
            ) : (
              /* Fallback: Hero Wood-Fired Trattoria Snapshot */
              <figure
                className="mq-ed-carta-snap mq-ed-carta-snap-hero"
                style={{ '--snap-tilt': '-1.8deg' } as React.CSSProperties}
              >
                <span className="mq-ed-carta-tape" aria-hidden="true" />
                <div className="mq-ed-carta-snap-frame">
                  <SmartImage
                    src={heroCoverImage}
                    alt={restaurant.name}
                    role="card"
                    aspectRatio="4 / 3"
                  />
                </div>
                <figcaption className="mq-ed-carta-snap-caption">
                  <span className="snap-title">{restaurant.name}</span>
                </figcaption>
              </figure>
            )}
          </div>

          {/* Category Preview Teaser Ribbon */}
          {categories.length > 0 && (
            <nav className="mq-ed-carta-teasers" aria-label="Menu sections">
              {categories.map((cat, idx) => (
                <React.Fragment key={cat.id}>
                  {idx > 0 && <span className="teaser-dot">&bull;</span>}
                  <span className="teaser-item">{cat.name}</span>
                </React.Fragment>
              ))}
            </nav>
          )}

          {/* Contact Folio */}
          <EditionContact restaurant={restaurant} className="mq-ed-carta-contact" separator="·" />
        </div>

        {/* Bottom Woven Gingham Check Ribbon */}
        <TovagliaGinghamBand className="mq-ed-carta-check-bottom" />
      </header>

      {/* =========================================================================
          INTERIOR BILL OF FARE: Announcement & Filter Toolbar
          ========================================================================= */}
      {!compact && (
        <>
          {tokens.announcement && (
            <div className="mq-ed-carta-announce-wrap">
              <p className="mq-ed-carta-announce" role="note">
                <span className="announce-star">★</span> {tokens.announcement}{' '}
                <span className="announce-star">★</span>
              </p>
            </div>
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
          <CapsulePillsNav
            restaurant={restaurant}
            categories={visible}
            allCategories={navigableCategories}
            activeCategoryId={activeCategoryId}
            onSelectCategory={setActiveCategoryId}
            compact={compact}
          />
        </>
      )}

      {/* =========================================================================
          INTERIOR BILL OF FARE: Main Course Sections & Storytelling
          ========================================================================= */}
      <main className="mq-ed-carta-body">
        {/* Curated "Specialità della Casa" Showcase (House Signature Dishes) */}
        {!compact && !hasQuery && houseSpecialties.length > 0 && (
          <section className="mq-ed-carta-showcase" aria-label="Featured dishes">
            <div className="mq-ed-carta-showcase-header">
              <h3 className="mq-ed-carta-showcase-title">Featured dishes</h3>
              <TuscanWheatDivider className="mq-ed-carta-showcase-divider" />
            </div>

            <div className="mq-ed-carta-showcase-grid">
              {houseSpecialties.map((item, idx) => {
                const tilt = idx % 2 === 0 ? '-1.5deg' : '1.5deg';
                const itemImg = item.imageUrl as string;
                const desc = cleanDescription(item);
                return (
                  <article
                    key={`showcase-${item.id}`}
                    className="mq-ed-carta-showcase-card"
                    style={{ '--card-tilt': tilt } as React.CSSProperties}
                  >
                    <span className="mq-ed-carta-card-tape" aria-hidden="true" />
                    <div className="mq-ed-carta-showcase-media">
                      <SmartImage
                        src={itemImg}
                        alt={item.name}
                        role="card"
                        focal={item.focal}
                        aspectRatio="16 / 10"
                      />
                    </div>

                    <div className="mq-ed-carta-showcase-body">
                      <div className="mq-ed-carta-showcase-top">
                        <div className="mq-ed-carta-showcase-identity">
                          <DietMark type={item.dietType} />
                          <h4 className="mq-ed-carta-showcase-name mq-dish-name">{item.name}</h4>
                        </div>
                        <div className="mq-ed-carta-showcase-stamp">
                          <DishPrice item={item} readOnly={readOnly} />
                        </div>
                      </div>

                      {desc && <p className="mq-ed-carta-showcase-desc mq-dish-desc">{desc}</p>}

                      <div className="mq-ed-carta-item-flags">
                        <DishFlags item={item} />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Empty state or Course Sections */}
        {sections.length === 0 ? (
          hasQuery ? (
            <EmptyResults query={query.trim()} onClear={() => setQuery('')} />
          ) : (
            <p className="mq-ed-empty" role="status">This menu has no dishes yet.</p>
          )
        ) : (
          <div className="mq-ed-carta-columns">
            {sections.map((category, catIndex) => {
              const formattedIndex = String(catIndex + 1).padStart(2, '0');
              return (
                <React.Fragment key={category.id}>
                  {/* Embedded Hearth Aside Plaque after the first 2 sections */}

                  <section
                    id={`mq-section-${category.id}`}
                    className="mq-ed-carta-section"
                    aria-labelledby={`mq-ed-carta-${category.id}`}
                  >
                    {/* Course Category Header */}
                    <div className="mq-ed-carta-section-head">
                      <div className="mq-ed-carta-section-badge">
                        <span className="section-index">{formattedIndex}</span>
                        <span className="section-dot">&bull;</span>
                        <h2 id={`mq-ed-carta-${category.id}`} className="section-title">
                          {category.name}
                        </h2>
                        <span className="section-count">{category.items.length} {category.items.length === 1 ? 'item' : 'items'}</span>
                      </div>
                    </div>

                    {/* Dish rows with Anti-Squash Architecture */}
                    <div className="mq-ed-carta-list">
                      {category.items.map((item, itemIdx) => {
                        if (tokens.layoutVersion === 2) {
                          return (
                            <UnifiedDishCard
                              key={item.id}
                              item={item}
                              index={itemIdx}
                              compact={compact}
                              readOnly={readOnly}
                              className="mq-card-carta"
                            />
                          );
                        }

                        const description = cleanDescription(item);
                        return (
                          <article key={item.id} className="mq-ed-carta-row">
                            {/* TIER 1: Name, Dot Leader Line, and Stamped Price Tag */}
                            <div className="mq-ed-row-header mq-ed-carta-row-header">
                              <div className="mq-ed-carta-row-identity">
                                <DietMark type={item.dietType} />
                                <h4 className="mq-ed-carta-item-name mq-dish-name">{item.name}</h4>
                              </div>

                              {/* Dotted Leader Line stretching between dish name and price */}
                              <span className="mq-ed-carta-leader-dots" aria-hidden="true" />

                              {/* Baseline-anchored stamped price seal */}
                              <div className="mq-ed-carta-stamp-slot">
                                <DishPrice item={item} readOnly={readOnly} />
                              </div>
                            </div>

                            {/* TIER 2: Full-width un-squashed description (never wrapped 1 word/line) */}
                            {description && (
                              <p className="mq-ed-carta-item-desc mq-dish-desc">{description}</p>
                            )}

                            {/* TIER 3: Badges and Dietary Flags */}
                            <div className="mq-ed-carta-item-flags">
                              {item.isBestseller && (
                                <span className="mq-ed-carta-badge badge-bestseller">Bestseller</span>
                              )}
                              {item.isSpecial && (
                                <span className="mq-ed-carta-badge badge-special">Special</span>
                              )}
                              <DishFlags item={item} />
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </main>

      {/* =========================================================================
          COLOPHON FOOTER: Weathered Stamp Seal, Buon Appetito Motto & Folio
          ========================================================================= */}
      <footer className="mq-ed-carta-foot">
        <TovagliaGinghamBand className="mq-ed-carta-foot-check-top" />

        <div className="mq-ed-carta-foot-body">
          {/* Weathered Circular Rubber Stamp Mark */}
          <div className="mq-ed-carta-stamp-colophon" aria-hidden="true">
            <svg viewBox="0 0 140 140" width="105" height="105">
              <circle
                cx="70"
                cy="70"
                r="64"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeDasharray="5 2.5"
              />
              <circle cx="70" cy="70" r="54" fill="none" stroke="currentColor" strokeWidth="1" />
              <path
                id="cartaFootStampArc"
                d="M 22 70 A 48 48 0 1 1 118 70 A 48 48 0 1 1 22 70"
                fill="none"
              />
              <text
                fontSize="8"
                fontFamily="var(--mq-font-display, serif)"
                fontWeight="700"
                letterSpacing="0.16em"
                fill="currentColor"
              >
                <textPath href="#cartaFootStampArc" startOffset="50%" textAnchor="middle">
                  {restaurant.name.toUpperCase()}
                </textPath>
              </text>
              {/* Crossed Wheat & Pizza Peel motif */}
              <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="46" y1="94" x2="94" y2="46" />
                <line x1="46" y1="46" x2="94" y2="94" />
                <circle cx="70" cy="70" r="10" fill="var(--mq-color-surface, #F6EEDB)" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="70" cy="70" r="2.5" fill="currentColor" />
              </g>
            </svg>
          </div>

          <h3 className="mq-ed-carta-foot-name">{restaurant.name}</h3>
          <EditionContact restaurant={restaurant} className="mq-ed-carta-foot-contact" separator="·" />
        </div>

        <TovagliaGinghamBand className="mq-ed-carta-foot-check-bottom" />
      </footer>
    </div>
  );
};

export default CartaRusticaEdition;
