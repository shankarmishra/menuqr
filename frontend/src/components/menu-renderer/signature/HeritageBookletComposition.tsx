/**
 * MENUQR Menu Renderer — Heritage Booklet (Signature)
 *
 * A chapter-by-chapter artboard: every category gets a bold asymmetric spread — a full-colour
 * panel with the category name and its best photo on one side, alternating left and right down
 * the page, with a corner flourish marking each chapter.
 *
 * This is a new, generic composition rather than a port. The composition it is inspired by
 * (`HeritageArtboardComposition`) turned out to be an irreducibly tenant-specific page — twelve
 * hardcoded chapter definitions and asset paths for one restaurant's exact category names — so
 * reusing it verbatim would have shipped one client's bespoke menu under a new name. What is
 * reusable is the art direction: the alternating colour-panel spread and the chapter flourish,
 * rebuilt here to run off *any* restaurant's categories and `var(--mq-*)` tokens.
 */

import React from 'react';
import { useMenuTheme } from '../MenuThemeProvider.tsx';
import { useMenuFilters } from '../useMenuFilters.ts';
import { DietMark, DishFlags, DishPrice } from '../primitives/DishMeta.tsx';
import { SmartImage } from '../primitives/SmartImage.tsx';
import { EmptyResults, MenuToolbar } from '../primitives/MenuToolbar.tsx';
import { parseItemPricing } from '../../menu-builder/templates/shared/pricingUtils';
import type { RenderCategory, SignatureProps } from '../types.ts';
import './signature.css';

function chapterHeroImage(category: RenderCategory): { src: string; alt: string; focal?: { x: number; y: number } } | null {
  const withPhoto = category.items.find((item) => item.imageUrl);
  return withPhoto?.imageUrl ? { src: withPhoto.imageUrl, alt: withPhoto.name, focal: withPhoto.focal } : null;
}

const Chapter: React.FC<{ category: RenderCategory; index: number; readOnly?: boolean }> = ({
  category,
  index,
  readOnly,
}) => {
  const hero = chapterHeroImage(category);
  const flipped = index % 2 === 1;

  return (
    <section
      className={flipped ? 'mq-sig-chapter mq-sig-chapter-flip' : 'mq-sig-chapter'}
      aria-labelledby={`mq-sig-hb-${category.id}`}
    >
      <div className="mq-sig-chapter-panel">
        <span className="mq-sig-flourish mq-sig-flourish-tl" aria-hidden="true" />
        <span className="mq-sig-chapter-number">Chapter {String(index + 1).padStart(2, '0')}</span>
        <h2 id={`mq-sig-hb-${category.id}`} className="mq-display mq-sig-chapter-title">
          {category.name}
        </h2>
        {category.description && <p className="mq-sig-chapter-desc">{category.description}</p>}

        <div className="mq-sig-chapter-photo">
          {hero ? (
            <SmartImage src={hero.src} alt={hero.alt} role="card" focal={hero.focal} aspectRatio="var(--mq-aspect-hero)" />
          ) : (
            <div className="mq-sig-chapter-photo-empty" aria-hidden="true" />
          )}
        </div>
      </div>

      <div className="mq-sig-chapter-list">
        {category.items.map((item) => {
          const pricing = parseItemPricing(item as Parameters<typeof parseItemPricing>[0]);
          const description = (pricing.cleanDescription ?? item.description ?? '').trim();

          return (
            <article key={item.id} className="mq-sig-chapter-row">
              <div className="mq-row" style={{ alignItems: 'baseline', minWidth: 0 }}>
                <DietMark type={item.dietType} />
                <span className="mq-dish-name mq-grow mq-clamp-2">{item.name}</span>
                <DishFlags item={item} />
              </div>
              {description && <p className="mq-dish-desc mq-clamp-2">{description}</p>}
              <DishPrice item={item} readOnly={readOnly} />
            </article>
          );
        })}
      </div>
    </section>
  );
};

export const HeritageBookletComposition: React.FC<SignatureProps> = ({
  restaurant,
  categories,
  compact,
  readOnly,
}) => {
  const tokens = useMenuTheme();
  const { query, setQuery, dietFilter, setDietFilter, counts, visible, hasQuery, allergenFilter, setAllergenFilter, spiceFilter, setSpiceFilter } = useMenuFilters(categories);

  return (
    <div className="mq-page mq-sig-heritage-page">
      <header className="mq-sig-heritage-cover">
        <span className="mq-sig-flourish mq-sig-flourish-tl" aria-hidden="true" />
        <span className="mq-sig-flourish mq-sig-flourish-tr" aria-hidden="true" />

        {restaurant.logoUrl ? (
          <img src={restaurant.logoUrl} alt={restaurant.name} className="mq-logo mq-logo-circle mq-sig-heritage-logo" />
        ) : null}

        <h1 className="mq-display mq-sig-heritage-title">{restaurant.name}</h1>
        {restaurant.tagline && <p className="mq-tagline">{restaurant.tagline}</p>}

        <span className="mq-sig-flourish mq-sig-flourish-bl" aria-hidden="true" />
        <span className="mq-sig-flourish mq-sig-flourish-br" aria-hidden="true" />
      </header>

      {!compact && (
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
      )}

      {visible.length === 0 ? (
        hasQuery ? (
          <EmptyResults query={query.trim()} onClear={() => setQuery('')} />
        ) : (
          <p className="mq-tagline" role="status">This menu has no items yet.</p>
        )
      ) : (
        <div className="mq-stack" style={{ gap: 'var(--mq-space-10)' }}>
          {visible.map((category, index) => (
            <Chapter key={category.id} category={category} index={index} readOnly={readOnly} />
          ))}
        </div>
      )}

      <p className="mq-sig-chalk-footnote">{tokens.announcement ?? ''}</p>
    </div>
  );
};

export default HeritageBookletComposition;
