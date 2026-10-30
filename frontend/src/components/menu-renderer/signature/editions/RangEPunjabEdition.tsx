/**
 * MENUQR Signature Edition — Rang-e-Punjab (Premium Punjabi Restaurant)
 *
 * Tandoori red, charcoal, creamy ivory, traditional Punjabi graphic motifs,
 * spectacular tandoor & kebab photography, and bold contemporary typography.
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

/** Traditional Phulkari geometric diamond cross-stitch motif in SVG. */
const PhulkariDiamond: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" focusable="false">
    <polygon points="16,2 30,16 16,30 2,16" fill="none" stroke="currentColor" strokeWidth="2" />
    <polygon points="16,7 25,16 16,25 7,16" fill="currentColor" opacity="0.6" />
    <circle cx="16" cy="16" r="3" fill="var(--mq-color-accent-contrast)" />
  </svg>
);

export const RangEPunjabEdition: React.FC<EditionProps> = ({
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

  const heroImage = tokens.cover.imageUrl || '/assets/themes/rang-e-punjab-hero.webp';

  return (
    <div className={compact ? 'mq-ed mq-ed-punjab is-compact' : 'mq-ed mq-ed-punjab'}>
      {/* =========================================================================
          COVER : Bhatti & Tandoori Grand Gateway
          ========================================================================= */}
      <header className="mq-ed-punjab-cover" data-edition-cover="rang-e-punjab">
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

        <span className="mq-ed-punjab-veil" aria-hidden="true" />
        <span className="mq-ed-punjab-phulkari-strip mq-ed-punjab-phulkari-top" aria-hidden="true" />
        <span className="mq-ed-punjab-phulkari-strip mq-ed-punjab-phulkari-bottom" aria-hidden="true" />

        <div className="mq-ed-punjab-cover-body">
          <div className="mq-ed-punjab-badge">
            <PhulkariDiamond size={16} />
            <span>Asli Punjabi Swaad • Clay Tandoor & Bhatti</span>
            <PhulkariDiamond size={16} />
          </div>

          <BrandMark restaurant={restaurant} size={compact ? 44 : 64} className="mq-ed-mark-bare" />

          <h1 className="mq-ed-punjab-title">{restaurant.name}</h1>

          {restaurant.tagline ? (
            <p className="mq-ed-punjab-tagline">{restaurant.tagline}</p>
          ) : (
            <p className="mq-ed-punjab-tagline">Purani Dilli Te Amritsari Zaika Since 1984</p>
          )}

          <CategoryTeaser
            categories={categories}
            limit={4}
            separator="|"
            className="mq-ed-punjab-teaser"
          />
        </div>

        <EditionContact restaurant={restaurant} className="mq-ed-punjab-contact" />
      </header>

      {/* =========================================================================
          TOOLBAR & FILTERS
          ========================================================================= */}
      {!compact && (
        <>
          {tokens.announcement && (
            <p className="mq-ed-noir-announce" role="note">
              <span>★</span>
              {tokens.announcement}
              <span>★</span>
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
          INTERIOR : Hearty Punjabi Feasts
          ========================================================================= */}
      <main className="mq-ed-punjab-plate">
        {/* 1. BHATTI SPECIALS SHOWCASE */}
        {signatures.length > 0 && !compact && !hasQuery && (
          <section className="mq-ed-punjab-showcase" aria-label="Bhatti Highlights">
            <div className="mq-ed-punjab-showcase-head">
              <PhulkariDiamond size={20} />
              <h3 className="mq-ed-punjab-showcase-title">Bhatti Te Tandoor Da Kamaal • ਸ਼ਾਨ-ਏ-ਤੰਦੂਰ</h3>
            </div>
            <div className="mq-ed-punjab-showcase-grid">
              {signatures.map((item) => (
                <article key={item.id} className="mq-ed-punjab-card">
                  <div className="mq-ed-punjab-card-media">
                    <SmartImage
                      src={item.imageUrl}
                      alt={item.name}
                      role="card"
                      focal={item.focal}
                      aspectRatio="16 / 10"
                    />
                  </div>
                  <div className="mq-ed-punjab-card-body">
                    <div className="mq-ed-punjab-card-head">
                      <h4 className="mq-ed-punjab-card-name">{item.name}</h4>
                      <span className="mq-ed-punjab-card-price">{item.price ? `₹${item.price}` : ''}</span>
                    </div>
                    {item.description && (
                      <p className="mq-ed-punjab-card-desc">{item.description}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 2. PUNJABI COURSES */}
        {sections.length === 0 ? (
          hasQuery ? (
            <EmptyResults query={query.trim()} onClear={() => setQuery('')} />
          ) : (
            <p className="mq-ed-empty" role="status">No items available.</p>
          )
        ) : (
          sections.map((category) => (
            <section
              key={category.id}
              className="mq-ed-punjab-course"
              aria-labelledby={`mq-ed-punjab-${category.id}`}
            >
              <div className="mq-ed-punjab-course-header">
                <PhulkariDiamond size={18} />
                <h2 id={`mq-ed-punjab-${category.id}`} className="mq-ed-punjab-course-title">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="mq-ed-punjab-course-desc">{category.description}</p>
                )}
              </div>

              <div className="mq-ed-punjab-list">
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
      <footer className="mq-ed-punjab-foot">
        <PhulkariDiamond size={24} />
        <p className="mq-ed-punjab-foot-name">{restaurant.name}</p>
        <p className="mq-ed-punjab-foot-sub">Pure Desi Ghee & Freshly Churned Butter</p>
        <EditionContact restaurant={restaurant} />
      </footer>
    </div>
  );
};

export default RangEPunjabEdition;
