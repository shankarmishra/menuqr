/**
 * MENUQR Signature Edition — Bombay Chowk (Modern Indian Street Food)
 *
 * Expressive typography, tomato red, saffron, cobalt and cream.
 * Distinctive street-food illustration, appetizing chaat, pav bhaji & cutting chai culture.
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

/** Mumbai Cutting Chai & Lantern motif in SVG. */
const CuttingChaiGlass: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" focusable="false">
    <path d="M8 8 L10 26 C10 28 12 29 16 29 C20 29 22 28 22 26 L24 8 Z" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M10 14 L22 14" stroke="currentColor" strokeWidth="1.5" />
    <path d="M11 20 L21 20" stroke="currentColor" strokeWidth="1.5" />
    {/* Steam curls */}
    <path d="M13 5 Q14 2 16 5 Q18 8 19 5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export const BombayChowkEdition: React.FC<EditionProps> = ({
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

  const heroImage = tokens.cover.imageUrl || '/assets/themes/bombay-chowk-hero.webp';

  return (
    <div className={compact ? 'mq-ed mq-ed-chowk is-compact' : 'mq-ed mq-ed-chowk'}>
      {/* =========================================================================
          COVER : Mumbai Street Bistro Gateway
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

        <span className="mq-ed-chowk-veil" aria-hidden="true" />

        <div className="mq-ed-chowk-cover-body">
          <div className="mq-ed-chowk-stamp">
            <span>★ Ekdum Kadak • Street Food Special ★</span>
          </div>

          <BrandMark restaurant={restaurant} size={compact ? 46 : 68} className="mq-ed-mark-bare" />

          <h1 className="mq-ed-chowk-title">{restaurant.name}</h1>

          {restaurant.tagline ? (
            <p className="mq-ed-chowk-tagline">{restaurant.tagline}</p>
          ) : (
            <p className="mq-ed-chowk-tagline">Irani Cafes • Chowpatty Beach • Midnight Tawa Streets</p>
          )}

          <CategoryTeaser
            categories={categories}
            limit={4}
            separator="⚡"
            className="mq-ed-chowk-teaser"
          />
        </div>

        <EditionContact restaurant={restaurant} className="mq-ed-chowk-contact" />
      </header>

      {/* =========================================================================
          TOOLBAR & FILTERS
          ========================================================================= */}
      {!compact && (
        <>
          {tokens.announcement && (
            <p className="mq-ed-noir-announce" role="note">
              <span>🔥</span>
              {tokens.announcement}
              <span>🔥</span>
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
          INTERIOR : Bombay Street Food Layout
          ========================================================================= */}
      <main className="mq-ed-chowk-plate">
        {/* 1. CHOWK SIGNATURES */}
        {signatures.length > 0 && !compact && !hasQuery && (
          <section className="mq-ed-chowk-showcase" aria-label="Street Favorites">
            <div className="mq-ed-chowk-showcase-head">
              <CuttingChaiGlass size={20} />
              <h3 className="mq-ed-chowk-showcase-title">Chowk Special • असली मुम्बई जायका</h3>
            </div>
            <div className="mq-ed-chowk-showcase-grid">
              {signatures.map((item) => (
                <article key={item.id} className="mq-ed-chowk-card">
                  <div className="mq-ed-chowk-card-media">
                    <SmartImage
                      src={item.imageUrl}
                      alt={item.name}
                      role="card"
                      focal={item.focal}
                      aspectRatio="16 / 10"
                    />
                  </div>
                  <div className="mq-ed-chowk-card-body">
                    <div className="mq-ed-chowk-card-head">
                      <h4 className="mq-ed-chowk-card-name">{item.name}</h4>
                      <span className="mq-ed-chowk-card-price">{item.price ? `₹${item.price}` : ''}</span>
                    </div>
                    {item.description && (
                      <p className="mq-ed-chowk-card-desc">{item.description}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 2. CHOWK COURSES */}
        {sections.length === 0 ? (
          hasQuery ? (
            <EmptyResults query={query.trim()} onClear={() => setQuery('')} />
          ) : (
            <p className="mq-ed-empty" role="status">No items found.</p>
          )
        ) : (
          sections.map((category) => (
            <section
              key={category.id}
              className="mq-ed-chowk-course"
              aria-labelledby={`mq-ed-chowk-${category.id}`}
            >
              <div className="mq-ed-chowk-course-header">
                <CuttingChaiGlass size={22} />
                <h2 id={`mq-ed-chowk-${category.id}`} className="mq-ed-chowk-course-title">
                  {category.name}
                </h2>
              </div>
              {category.description && (
                <p className="mq-ed-chowk-course-desc" style={{ marginBottom: '16px' }}>
                  {category.description}
                </p>
              )}

              <div className="mq-ed-chowk-list">
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
      <footer className="mq-ed-chowk-foot">
        <CuttingChaiGlass size={24} />
        <p className="mq-ed-chowk-foot-name">{restaurant.name}</p>
        <p className="mq-ed-chowk-foot-sub">Bambaiya Swaad • Maskapav, Chaat & Garma-Garam Chai</p>
        <EditionContact restaurant={restaurant} />
      </footer>
    </div>
  );
};

export default BombayChowkEdition;
