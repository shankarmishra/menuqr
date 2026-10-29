/**
 * MENUQR Menu Renderer — Chalkboard Clipboard (Signature)
 *
 * Twin wooden clipboards holding chalkboard inserts: a cover board (name, tagline, hero photo,
 * contact details) and a menu board (a two-column, dotted-leader dish list). Rebuilt from the
 * original `ChalkboardClipboardComposition` with every literal colour replaced by `var(--mq-*)`
 * and every tenant placeholder (a hardcoded "$22", "WWW.YOURSTEAK.COM") replaced by real
 * restaurant data or omitted — so it is one composition any client can select, not one client's
 * bespoke page.
 */

import React, { useState } from 'react';
import { Clock, MapPin, Phone } from 'lucide-react';
import { useMenuTheme } from '../MenuThemeProvider.tsx';
import { useMenuFilters } from '../useMenuFilters.ts';
import { DietMark, DishFlags, DishPrice } from '../primitives/DishMeta.tsx';
import { SmartImage } from '../primitives/SmartImage.tsx';
import { EmptyResults, MenuToolbar } from '../primitives/MenuToolbar.tsx';
import { parseItemPricing } from '../../menu-builder/templates/shared/pricingUtils';
import type { RenderMenuItem, SignatureProps } from '../types.ts';
import './signature.css';

const ClipboardFrame: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={['mq-sig-clipboard', className].filter(Boolean).join(' ')}>
    <div className="mq-sig-clamp" aria-hidden="true">
      <span className="mq-sig-clamp-loop" />
      <span className="mq-sig-clamp-body" />
    </div>
    <div className="mq-sig-chalkboard">{children}</div>
  </div>
);

const DottedRow: React.FC<{ item: RenderMenuItem; readOnly?: boolean }> = ({ item, readOnly }) => {
  const pricing = parseItemPricing(item as Parameters<typeof parseItemPricing>[0]);
  const description = (pricing.cleanDescription ?? item.description ?? '').trim();

  return (
    <article className="mq-sig-chalk-row">
      <div className="mq-row" style={{ alignItems: 'baseline', minWidth: 0 }}>
        <DietMark type={item.dietType} />
        <span className="mq-sig-chalk-name mq-grow mq-clamp-2">{item.name}</span>
        <DishFlags item={item} />
        <span className="mq-sig-leader" aria-hidden="true" />
      </div>
      {description && <p className="mq-sig-chalk-desc mq-clamp-2">{description}</p>}
      <div style={{ marginTop: 'var(--mq-space-1)' }}>
        <DishPrice item={item} readOnly={readOnly} />
      </div>
    </article>
  );
};

export const ChalkboardComposition: React.FC<SignatureProps> = ({ restaurant, categories, compact, readOnly }) => {
  const tokens = useMenuTheme();
  const { query, setQuery, dietFilter, setDietFilter, counts, visible, hasQuery } = useMenuFilters(categories);
  const [activeBoard, setActiveBoard] = useState<'cover' | 'menu'>('cover');

  const half = Math.ceil(visible.length / 2);
  const leftColumn = visible.slice(0, half);
  const rightColumn = visible.slice(half);

  const heroItem = categories.flatMap((c) => c.items).find((item) => item.isBestseller && item.imageUrl);

  return (
    <div className="mq-page mq-sig-chalkboard-page">
      {!compact && (
        <div className="mq-sig-board-toggle" role="tablist" aria-label="Cover or menu board">
          <button
            type="button"
            role="tab"
            aria-selected={activeBoard === 'cover'}
            className={activeBoard === 'cover' ? 'mq-sig-board-tab is-active' : 'mq-sig-board-tab'}
            onClick={() => setActiveBoard('cover')}
          >
            Cover Board
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeBoard === 'menu'}
            className={activeBoard === 'menu' ? 'mq-sig-board-tab is-active' : 'mq-sig-board-tab'}
            onClick={() => setActiveBoard('menu')}
          >
            The Menu
          </button>
        </div>
      )}

      <div className="mq-sig-boards">
        {/* Both boards are always in the DOM; `mq-sig-board-mobile-hidden` only hides the
         * inactive one below the two-column breakpoint (css `@media (max-width: 63.9375rem)`),
         * so a desktop visitor sees both boards side by side and the toggle above only matters
         * on a narrow screen, which has room for one. Compact mode (gallery thumbnails, the
         * Design Studio preview) shows the cover board alone — there is no room to toggle. */}
        <ClipboardFrame
          className={
            compact || activeBoard === 'cover' ? 'mq-sig-cover-board' : 'mq-sig-cover-board mq-sig-board-mobile-hidden'
          }
        >
            <p className="mq-sig-chalk-eyebrow">{restaurant.tagline || restaurant.cuisine || 'Welcome'}</p>
            <h1 className="mq-display mq-sig-chalk-title">{restaurant.name}</h1>

            {heroItem?.imageUrl ? (
              <div className="mq-sig-hero-plate">
                <SmartImage
                  src={heroItem.imageUrl}
                  alt={heroItem.name}
                  role="hero"
                  focal={heroItem.focal}
                  aspectRatio="var(--mq-aspect-square)"
                />
              </div>
            ) : (
              <div className="mq-sig-hero-plate mq-sig-hero-plate-empty" aria-hidden="true" />
            )}

            <div className="mq-sig-chalk-contact">
              {restaurant.address && (
                <span className="mq-row" style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <MapPin size={12} />
                  <span>{restaurant.address}</span>
                </span>
              )}
              <span className="mq-row" style={{ justifyContent: 'center', alignItems: 'center' }}>
                {restaurant.openingHours && (
                  <>
                    <Clock size={12} />
                    <span>{restaurant.openingHours}</span>
                  </>
                )}
                {restaurant.phone && (
                  <>
                    <Phone size={12} />
                    <span>{restaurant.phone}</span>
                  </>
                )}
              </span>
              {restaurant.website && <span className="mq-sig-chalk-website">{restaurant.website}</span>}
            </div>
        </ClipboardFrame>

        {!compact && (
          <ClipboardFrame
            className={activeBoard === 'menu' ? 'mq-sig-menu-board' : 'mq-sig-menu-board mq-sig-board-mobile-hidden'}
          >
            <h2 className="mq-sig-chalk-masthead">The Menu</h2>

            <MenuToolbar
              query={query}
              onQueryChange={setQuery}
              dietFilter={dietFilter}
              onDietFilterChange={setDietFilter}
              counts={counts}
            />

            {visible.length === 0 ? (
              hasQuery ? (
                <EmptyResults query={query.trim()} onClear={() => setQuery('')} />
              ) : (
                <p className="mq-tagline" role="status">This menu has no items yet.</p>
              )
            ) : (
              <div className="mq-sig-chalk-columns">
                {[leftColumn, rightColumn].map((column, columnIndex) => (
                  <div className="mq-stack" key={columnIndex} style={{ gap: 'var(--mq-space-5)' }}>
                    {column.map((category) => (
                      <section key={category.id} aria-labelledby={`mq-sig-cat-${category.id}`}>
                        <span id={`mq-sig-cat-${category.id}`} className="mq-sig-chalk-banner">
                          {category.name}
                        </span>
                        <div className="mq-stack" style={{ gap: 'var(--mq-space-2)', marginTop: 'var(--mq-space-2)' }}>
                          {category.items.map((item) => (
                            <DottedRow key={item.id} item={item} readOnly={readOnly} />
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </ClipboardFrame>
        )}
      </div>

      <p className="mq-sig-chalk-footnote">{tokens.announcement ?? ''}</p>
    </div>
  );
};

export default ChalkboardComposition;
