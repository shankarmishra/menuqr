/**
 * MENUQR Signature Edition — Dakshin (South Indian Heritage)
 *
 * Banana-leaf green, turmeric yellow, coconut ivory, refined kolam-inspired
 * illustrations, and authentic South Indian culinary identity.
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

/** Geometric Kolam (Muggu) traditional rice-flour pattern in SVG. */
const KolamMotif: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true" focusable="false">
    <circle cx="20" cy="20" r="3" fill="currentColor" />
    <circle cx="8" cy="20" r="2" fill="currentColor" opacity="0.6" />
    <circle cx="32" cy="20" r="2" fill="currentColor" opacity="0.6" />
    <circle cx="20" cy="8" r="2" fill="currentColor" opacity="0.6" />
    <circle cx="20" cy="32" r="2" fill="currentColor" opacity="0.6" />
    <path
      d="M20 6 Q26 14 34 20 Q26 26 20 34 Q14 26 6 20 Q14 14 20 6 Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

export const DakshinHeritageEdition: React.FC<EditionProps> = ({
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

  const heroImage = tokens.cover.imageUrl || '/assets/themes/dakshin-heritage-hero.webp';

  return (
    <div className={compact ? 'mq-ed mq-ed-dakshin is-compact' : 'mq-ed mq-ed-dakshin'}>
      {/* =========================================================================
          COVER : Banana-Leaf & Temple Heritage Gateway
          ========================================================================= */}
      <header className="mq-ed-dakshin-cover" data-edition-cover="dakshin-heritage">
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

        <span className="mq-ed-dakshin-veil" aria-hidden="true" />
        <span className="mq-ed-dakshin-kolam-border" aria-hidden="true" />

        <div className="mq-ed-dakshin-cover-body">
          <div className="mq-ed-maharaja-heritage-badge">
            <KolamMotif size={16} />
            <span>Flavours of the 5 Southern States</span>
            <KolamMotif size={16} />
          </div>

          <BrandMark restaurant={restaurant} size={compact ? 44 : 64} className="mq-ed-mark-bare" />

          <h1 className="mq-ed-dakshin-title">{restaurant.name}</h1>

          {restaurant.tagline ? (
            <p className="mq-ed-dakshin-tagline">{restaurant.tagline}</p>
          ) : (
            <p className="mq-ed-dakshin-tagline">Pure Ghee Roasts, Podi Tiffin & Kumbakonam Kaapi</p>
          )}

          <CategoryTeaser
            categories={categories}
            limit={4}
            separator="•"
            className="mq-ed-dakshin-teaser"
          />
        </div>

        <EditionContact restaurant={restaurant} className="mq-ed-dakshin-contact" />
      </header>

      {/* =========================================================================
          TOOLBAR & FILTERS
          ========================================================================= */}
      {!compact && (
        <>
          {tokens.announcement && (
            <p className="mq-ed-noir-announce" role="note">
              <span>🪔</span>
              {tokens.announcement}
              <span>🪔</span>
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
          INTERIOR : Plantain Leaf Feast Layout
          ========================================================================= */}
      <main className="mq-ed-dakshin-plate">
        <div className="mq-ed-dakshin-leaf-banner">
          <span>🌿</span>
          <span>Served with Freshly Churned Chutneys & Piping Hot Sambar</span>
          <span>🌿</span>
        </div>

        {/* 1. SIGNATURE TIFFIN SHOWCASE */}
        {signatures.length > 0 && !compact && !hasQuery && (
          <section className="mq-ed-dakshin-showcase" aria-label="Heritage Highlights">
            <div className="mq-ed-dakshin-showcase-head">
              <KolamMotif size={20} />
              <h3 className="mq-ed-dakshin-showcase-title">Podi &amp; Ghee Specialities • தட்டச்சு</h3>
            </div>
            <div className="mq-ed-dakshin-showcase-grid">
              {signatures.map((item) => (
                <article key={item.id} className="mq-ed-dakshin-card">
                  <div className="mq-ed-dakshin-card-media">
                    <SmartImage
                      src={item.imageUrl}
                      alt={item.name}
                      role="card"
                      focal={item.focal}
                      aspectRatio="16 / 10"
                    />
                  </div>
                  <div className="mq-ed-dakshin-card-body">
                    <div className="mq-ed-dakshin-card-head">
                      <h4 className="mq-ed-dakshin-card-name">{item.name}</h4>
                      <span className="mq-ed-dakshin-card-price">{item.price ? `₹${item.price}` : ''}</span>
                    </div>
                    {item.description && (
                      <p className="mq-ed-dakshin-card-desc">{item.description}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 2. DAKSHIN COURSES */}
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
              className="mq-ed-dakshin-course"
              aria-labelledby={`mq-ed-dakshin-${category.id}`}
            >
              <div className="mq-ed-dakshin-course-header">
                <KolamMotif size={18} />
                <h2 id={`mq-ed-dakshin-${category.id}`} className="mq-ed-dakshin-course-title">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="mq-ed-dakshin-course-desc">{category.description}</p>
                )}
              </div>

              <div className="mq-ed-dakshin-list">
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
      <footer className="mq-ed-dakshin-foot">
        <KolamMotif size={24} />
        <p className="mq-ed-dakshin-foot-name">{restaurant.name}</p>
        <p className="mq-ed-dakshin-foot-sub">Vazhai Ilai Virundhu • Traditional South Indian Hospitality</p>
        <EditionContact restaurant={restaurant} />
      </footer>
    </div>
  );
};

export default DakshinHeritageEdition;
