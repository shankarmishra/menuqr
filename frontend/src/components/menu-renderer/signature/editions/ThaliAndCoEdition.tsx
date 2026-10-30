/**
 * MENUQR Signature Edition — Thali & Co. (Modern Indian Regional Cuisine)
 *
 * Terracotta, turmeric, indigo and warm cream.
 * Overhead thali compositions, regional food storytelling, and artisanal editorial layout.
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

/** Handcrafted block-print botanical stamp in SVG. */
const BlockPrintStamp: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" focusable="false">
    <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
    <path
      d="M16 8 C12 12 12 20 16 24 C20 20 20 12 16 8 Z"
      fill="currentColor"
      opacity="0.8"
    />
    <circle cx="16" cy="16" r="2" fill="var(--mq-color-surface)" />
  </svg>
);

export const ThaliAndCoEdition: React.FC<EditionProps> = ({
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

  const heroImage = tokens.cover.imageUrl || '/assets/themes/thali-and-co-hero.webp';

  return (
    <div className={compact ? 'mq-ed mq-ed-thali is-compact' : 'mq-ed mq-ed-thali'}>
      {/* =========================================================================
          COVER : Artisanal Regional Thali Gateway
          ========================================================================= */}
      <header className="mq-ed-thali-cover" data-edition-cover="thali-and-co">
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

        <span className="mq-ed-thali-veil" aria-hidden="true" />

        <div className="mq-ed-thali-cover-body">
          <div className="mq-ed-maharaja-heritage-badge">
            <BlockPrintStamp size={16} />
            <span>Curated Flavours from the 28 States</span>
            <BlockPrintStamp size={16} />
          </div>

          <BrandMark restaurant={restaurant} size={compact ? 44 : 64} className="mq-ed-mark-bare" />

          <h1 className="mq-ed-thali-title">{restaurant.name}</h1>

          {restaurant.tagline ? (
            <p className="mq-ed-thali-tagline">{restaurant.tagline}</p>
          ) : (
            <p className="mq-ed-thali-tagline">Artisanal Grand Thalis & Lost Recipes of Bharat</p>
          )}

          <CategoryTeaser
            categories={categories}
            limit={4}
            separator="—"
            className="mq-ed-thali-teaser"
          />
        </div>

        <EditionContact restaurant={restaurant} className="mq-ed-thali-contact" />
      </header>

      {/* =========================================================================
          TOOLBAR & FILTERS
          ========================================================================= */}
      {!compact && (
        <>
          {tokens.announcement && (
            <p className="mq-ed-noir-announce" role="note">
              <span>🏺</span>
              {tokens.announcement}
              <span>🏺</span>
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
          INTERIOR : Regional Platter Layout
          ========================================================================= */}
      <main className="mq-ed-thali-plate">
        {/* Anatomy of an Indian Thali Banner */}
        {!compact && !hasQuery && (
          <aside className="mq-ed-thali-anatomy-banner" aria-label="Thali Tradition">
            <h3 className="mq-ed-thali-anatomy-title">The Grand Thali Experience</h3>
            <p className="mq-ed-noir-card-desc" style={{ marginBottom: '12px' }}>
              Every thali is composed with harmonious balance: 6 tastes (shadrasa) combining sweet,
              sour, salty, pungent, bitter, and astringent.
            </p>
            <div className="mq-ed-thali-anatomy-tags">
              <span className="mq-ed-thali-state-pill">Awadh</span>
              <span className="mq-ed-thali-state-pill">Rajasthan</span>
              <span className="mq-ed-thali-state-pill">Gujarat</span>
              <span className="mq-ed-thali-state-pill">Malabar</span>
              <span className="mq-ed-thali-state-pill">Kashmir</span>
              <span className="mq-ed-thali-state-pill">Chettinad</span>
            </div>
          </aside>
        )}

        {/* 1. SIGNATURE THALIS SHOWCASE */}
        {signatures.length > 0 && !compact && !hasQuery && (
          <section className="mq-ed-thali-showcase" aria-label="Thali Highlights">
            <div className="mq-ed-thali-showcase-head">
              <BlockPrintStamp size={20} />
              <h3 className="mq-ed-thali-showcase-title">Signature Regional Platters • विरासत थाली</h3>
            </div>
            <div className="mq-ed-thali-showcase-grid">
              {signatures.map((item) => (
                <article key={item.id} className="mq-ed-thali-card">
                  <div className="mq-ed-thali-card-media">
                    <SmartImage
                      src={item.imageUrl}
                      alt={item.name}
                      role="card"
                      focal={item.focal}
                      aspectRatio="16 / 10"
                    />
                  </div>
                  <div className="mq-ed-thali-card-body">
                    <div className="mq-ed-thali-card-head">
                      <h4 className="mq-ed-thali-card-name">{item.name}</h4>
                      <span className="mq-ed-thali-card-price">{item.price ? `₹${item.price}` : ''}</span>
                    </div>
                    {item.description && (
                      <p className="mq-ed-thali-card-desc">{item.description}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 2. REGIONAL COURSES */}
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
              className="mq-ed-thali-course"
              aria-labelledby={`mq-ed-thali-${category.id}`}
            >
              <div className="mq-ed-thali-course-header">
                <BlockPrintStamp size={18} />
                <h2 id={`mq-ed-thali-${category.id}`} className="mq-ed-thali-course-title">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="mq-ed-thali-course-desc">{category.description}</p>
                )}
              </div>

              <div className="mq-ed-thali-list">
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
      <footer className="mq-ed-thali-foot">
        <BlockPrintStamp size={24} />
        <p className="mq-ed-thali-foot-name">{restaurant.name}</p>
        <p className="mq-ed-thali-foot-sub">Shadrasa • The Sacred Six Tastes of Indian Cuisine</p>
        <EditionContact restaurant={restaurant} />
      </footer>
    </div>
  );
};

export default ThaliAndCoEdition;
