/**
 * MENUQR Signature Edition — Maharaja's Table (Indian Royal Dining)
 *
 * Imperial emerald green, royal burgundy, antique brass and warm ivory parchment.
 * Authentic Mughal & Rajput palace architecture featuring:
 *   - Multifoil cusped darbar arches and jaali fretwork
 *   - Royal brass crest framing the establishment seal
 *   - "Shahi Dastarkhwan" signature feast showcase
 *   - Dum Pukht slow-cooked storytelling and royal culinary notes
 *   - Royal brass dotted leaders with elegant course indexing
 */

import React from 'react';
import { useMenuTheme } from '../../MenuThemeProvider.tsx';
import { useMenuFilters } from '../../useMenuFilters.ts';
import { SmartImage } from '../../primitives/SmartImage.tsx';
import { EmptyResults, MenuToolbar } from '../../primitives/MenuToolbar.tsx';
import {
  BrandMark,
  CategoryTeaser,
  EditionContact,
  Leader,
  liveCategories,
  useFeatured,
  type EditionProps,
} from './shared.tsx';
import './editions.css';
import './editions-indian.css';

/** Cusped Multifoil Arch — authentic Mughal palace architecture in SVG. */
const MultifoilArch: React.FC<{ size?: number; className?: string }> = ({ size = 70, className }) => (
  <svg
    viewBox="0 0 120 120"
    width={size}
    height={size}
    aria-hidden="true"
    focusable="false"
    className={className}
  >
    <path
      d="M10 110 L10 60 C10 40 25 30 35 30 C45 30 50 15 60 10 C70 15 75 30 85 30 C95 30 110 40 110 60 L110 110"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M16 110 L16 62 C16 44 30 35 38 35 C47 35 52 22 60 18 C68 22 73 35 82 35 C90 35 104 44 104 62 L104 110"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      opacity="0.6"
    />
    {/* Lotus finial at the pinnacle */}
    <circle cx="60" cy="7" r="2.5" fill="currentColor" />
  </svg>
);

/** Ornate Royal Shahi Divider with a blossoming lotus motif. */
const ShahiDivider: React.FC<{ className?: string }> = ({ className }) => (
  <span className={['mq-ed-maharaja-divider', className].filter(Boolean).join(' ')} aria-hidden="true">
    <span className="mq-ed-maharaja-divider-line" />
    <svg viewBox="0 0 32 32" width="18" height="18" focusable="false">
      {/* Central blooming lotus bud */}
      <path d="M16 4 C14 12 8 16 8 22 C8 26 11 28 16 28 C21 28 24 26 24 22 C24 16 18 12 16 4 Z" fill="currentColor" opacity="0.9" />
      <path d="M16 12 C18 16 22 18 26 19 C28 16 26 13 22 13 Z" fill="currentColor" opacity="0.7" />
      <path d="M16 12 C14 16 10 18 6 19 C4 16 6 13 10 13 Z" fill="currentColor" opacity="0.7" />
    </svg>
    <span className="mq-ed-maharaja-divider-line" />
  </span>
);

export const MaharajaTableEdition: React.FC<EditionProps> = ({
  restaurant,
  categories,
  compact,
  readOnly,
}) => {
  const tokens = useMenuTheme();
  const { query, setQuery, dietFilter, setDietFilter, counts, visible, hasQuery } =
    useMenuFilters(categories);
  const signatures = useFeatured(categories, 2);
  const sections = liveCategories(visible);

  const heroImage = tokens.cover.imageUrl || '/assets/themes/maharaja-table-hero.webp';

  return (
    <div className={compact ? 'mq-ed mq-ed-maharaja is-compact' : 'mq-ed mq-ed-maharaja'}>
      {/* =========================================================================
          COVER : Imperial Mughal Palace Darbar Gateway
          ========================================================================= */}
      <header className="mq-ed-maharaja-cover" data-edition-cover="maharaja-table">
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

        <span className="mq-ed-maharaja-veil" aria-hidden="true" />
        <span className="mq-ed-maharaja-arch-frame" aria-hidden="true" />
        <span className="mq-ed-maharaja-jali-watermark" aria-hidden="true" />

        <div className="mq-ed-maharaja-cover-body">
          <div className="mq-ed-maharaja-heritage-badge">
            <span>⚜</span>
            <span>Shahi Dastarkhwan • Royal Table</span>
            <span>⚜</span>
          </div>

          <div className="mq-ed-maharaja-crest">
            <MultifoilArch size={compact ? 54 : 96} />
            <BrandMark restaurant={restaurant} size={compact ? 36 : 52} className="mq-ed-mark-bare" />
          </div>

          <h1 className="mq-ed-maharaja-title">{restaurant.name}</h1>

          <ShahiDivider />

          {restaurant.tagline ? (
            <p className="mq-ed-maharaja-tagline">{restaurant.tagline}</p>
          ) : (
            <p className="mq-ed-maharaja-tagline">Awadhi & Rajputana Imperial Recipes Since Antiquity</p>
          )}

          <CategoryTeaser
            categories={categories}
            limit={4}
            separator="◆"
            className="mq-ed-maharaja-teaser"
          />
        </div>

        <EditionContact restaurant={restaurant} className="mq-ed-maharaja-contact" />
      </header>

      {/* =========================================================================
          TOOLBAR & FILTERS
          ========================================================================= */}
      {!compact && (
        <>
          {tokens.announcement && (
            <p className="mq-ed-noir-announce" role="note">
              <span>✦</span>
              {tokens.announcement}
              <span>✦</span>
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

      {/* =========================================================================
          INTERIOR : Shahi Banquet Layout
          ========================================================================= */}
      <main className="mq-ed-maharaja-plate">
        {/* 1. SHAHI KHAS — SIGNATURE SHOWCASE */}
        {signatures.length > 0 && !compact && !hasQuery && (
          <section className="mq-ed-maharaja-showcase" aria-label="Royal Highlights">
            <h3 className="mq-ed-maharaja-showcase-title">Khas-e-Maharaja • Royal Signature</h3>
            <div className="mq-ed-maharaja-showcase-grid">
              {signatures.map((item) => (
                <article key={item.id} className="mq-ed-maharaja-card">
                  <div className="mq-ed-maharaja-card-media">
                    <SmartImage
                      src={item.imageUrl}
                      alt={item.name}
                      role="card"
                      focal={item.focal}
                      aspectRatio="16 / 10"
                    />
                  </div>
                  <div className="mq-ed-maharaja-card-body">
                    <div className="mq-ed-maharaja-card-head">
                      <h4 className="mq-ed-maharaja-card-name">{item.name}</h4>
                      <span className="mq-ed-maharaja-card-price">{item.price ? `₹${item.price}` : ''}</span>
                    </div>
                    {item.description && (
                      <p className="mq-ed-maharaja-card-desc">{item.description}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 2. ROYAL COURSES */}
        {sections.length === 0 ? (
          hasQuery ? (
            <EmptyResults query={query.trim()} onClear={() => setQuery('')} />
          ) : (
            <p className="mq-ed-empty" role="status">No dishes found in this category.</p>
          )
        ) : (
          sections.map((category) => (
            <section
              key={category.id}
              className="mq-ed-maharaja-course"
              aria-labelledby={`mq-ed-royal-${category.id}`}
            >
              <div className="mq-ed-maharaja-course-header">
                <ShahiDivider />
                <h2 id={`mq-ed-royal-${category.id}`} className="mq-ed-maharaja-course-title">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="mq-ed-maharaja-course-desc">{category.description}</p>
                )}
              </div>

              <div className="mq-ed-maharaja-list">
                {category.items.map((item) => (
                  <Leader key={item.id} item={item} readOnly={readOnly} showFlags={!compact} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* =========================================================================
          FOOTER
          ========================================================================= */}
      <footer className="mq-ed-maharaja-foot">
        <ShahiDivider />
        <p className="mq-ed-maharaja-foot-name">{restaurant.name}</p>
        <p className="mq-ed-maharaja-foot-sub">Royal Indian Hospitality & Heirloom Recipes</p>
        <EditionContact restaurant={restaurant} />
      </footer>
    </div>
  );
};

export default MaharajaTableEdition;
