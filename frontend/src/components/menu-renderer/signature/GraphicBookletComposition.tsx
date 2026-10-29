/**
 * MENUQR Menu Renderer — Graphic Booklet (Signature)
 *
 * A poster-style front cover (photo collage, bulleted categories, a CTA into the menu) followed
 * by a numbered two-column menu with chef-recommendation callouts. Rebuilt from the original
 * `GraphicBookletTemplate` with its config object (`GraphicThemeConfig`) replaced by
 * `var(--mq-*)` tokens, so any preset's seed colour and photos drive it instead of one
 * hand-picked palette.
 */

import React, { useMemo, useState } from 'react';
import { BookOpen, MapPin, Phone, Sparkles, UtensilsCrossed } from 'lucide-react';
import { useMenuTheme } from '../MenuThemeProvider.tsx';
import { useMenuFilters } from '../useMenuFilters.ts';
import { DietMark, DishFlags, DishPrice } from '../primitives/DishMeta.tsx';
import { SmartImage } from '../primitives/SmartImage.tsx';
import { EmptyResults, MenuToolbar } from '../primitives/MenuToolbar.tsx';
import { parseItemPricing } from '../../menu-builder/templates/shared/pricingUtils';
import {
  CutoutBasilLeaf,
  CutoutLimeSlice,
  CutoutRedChili,
  Image1WheelCollage,
  Image2ApertureRing,
} from '../../menu-builder/templates/artwork/FoodDoodleBackgrounds';
import type { RenderMenuItem, SignatureProps } from '../types.ts';
import './signature.css';

const PLACEHOLDER_PHOTO = '/menuqr/generated/placeholder-dish.webp';

function featuredDishes(categories: SignatureProps['categories']): RenderMenuItem[] {
  const items = categories.flatMap((category) => category.items);
  const withPhotos = items.filter((item) => item.imageUrl);
  const bestsellers = withPhotos.filter((item) => item.isBestseller);
  const rest = withPhotos.filter((item) => !item.isBestseller);
  return [...bestsellers, ...rest].slice(0, 3);
}

export const GraphicBookletComposition: React.FC<SignatureProps> = ({
  restaurant,
  categories,
  compact,
  readOnly,
}) => {
  const tokens = useMenuTheme();
  const { query, setQuery, dietFilter, setDietFilter, counts, visible, hasQuery } = useMenuFilters(categories);
  const [page, setPage] = useState<'cover' | 'menu'>('cover');

  const featured = useMemo(() => featuredDishes(categories), [categories]);
  const collagePhotos: [string, string, string] = [
    featured[0]?.imageUrl ?? PLACEHOLDER_PHOTO,
    featured[1]?.imageUrl ?? PLACEHOLDER_PHOTO,
    featured[2]?.imageUrl ?? PLACEHOLDER_PHOTO,
  ];
  const categoryBullets = categories.filter((c) => c.items.length > 0).slice(0, 5);

  // Deterministic, not random: three or more real dish photos earn the fuller wheel collage,
  // otherwise the single-photo aperture ring reads less empty.
  const useWheelCollage = featured.length >= 2;

  return (
    <div className="mq-page mq-sig-graphic-page">
      {!compact && (
        <div className="mq-sig-board-toggle" role="tablist" aria-label="Cover or menu page">
          <button
            type="button"
            role="tab"
            aria-selected={page === 'cover'}
            className={page === 'cover' ? 'mq-sig-board-tab is-active' : 'mq-sig-board-tab'}
            onClick={() => setPage('cover')}
          >
            <BookOpen size={13} />
            <span>Front Cover</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={page === 'menu'}
            className={page === 'menu' ? 'mq-sig-board-tab is-active' : 'mq-sig-board-tab'}
            onClick={() => setPage('menu')}
          >
            <UtensilsCrossed size={13} />
            <span>Menu</span>
          </button>
        </div>
      )}

      {(compact || page === 'cover') && (
        <section className="mq-sig-graphic-cover">
          <div className="mq-sig-graphic-logo" aria-hidden={!restaurant.logoUrl}>
            {restaurant.logoUrl ? (
              <img src={restaurant.logoUrl} alt={restaurant.name} className="mq-logo mq-logo-circle" />
            ) : (
              <span className="mq-sig-graphic-logo-mark">{restaurant.name.slice(0, 2).toUpperCase()}</span>
            )}
          </div>

          <div className="mq-sig-graphic-hero">
            <div className="mq-stack" style={{ gap: 'var(--mq-space-3)' }}>
              {restaurant.cuisine && <p className="mq-eyebrow">{restaurant.cuisine}</p>}
              <h1 className="mq-display mq-sig-graphic-title">{restaurant.name}</h1>
              {restaurant.tagline && <p className="mq-tagline">{restaurant.tagline}</p>}

              <ul className="mq-sig-bullets">
                {categoryBullets.map((category) => (
                  <li key={category.id}>{category.name}</li>
                ))}
              </ul>

              {!compact && (
                <button type="button" className="mq-button mq-sig-cta" onClick={() => setPage('menu')}>
                  <span>Explore the Menu</span>
                  <Sparkles size={15} />
                </button>
              )}
            </div>

            <div className="mq-sig-collage">
              {useWheelCollage ? (
                <Image1WheelCollage
                  photos={collagePhotos}
                  borderColor="var(--mq-color-surface)"
                  centerColor="var(--mq-color-accent)"
                  centerText={restaurant.name.split(' ')[0]}
                />
              ) : (
                <Image2ApertureRing
                  photo={collagePhotos[0]}
                  badgeRibbonText={restaurant.name}
                  badgeRibbonColor="var(--mq-color-accent)"
                  accentRingColor="var(--mq-color-accent)"
                />
              )}
              <div className="mq-sig-cutout mq-sig-cutout-chili"><CutoutRedChili size={44} rotation={-18} /></div>
              <div className="mq-sig-cutout mq-sig-cutout-basil"><CutoutBasilLeaf size={38} rotation={14} /></div>
              <div className="mq-sig-cutout mq-sig-cutout-lime"><CutoutLimeSlice size={40} /></div>
            </div>
          </div>

          <div className="mq-sig-graphic-contact">
            {restaurant.phone && (
              <span className="mq-row" style={{ alignItems: 'center' }}>
                <Phone size={13} />
                <span>{restaurant.phone}</span>
              </span>
            )}
            {(restaurant.address || restaurant.city) && (
              <span className="mq-row" style={{ alignItems: 'center' }}>
                <MapPin size={13} />
                <span>{restaurant.address || restaurant.city}</span>
              </span>
            )}
          </div>
        </section>
      )}

      {(compact || page === 'menu') && (
        <section className="mq-sig-graphic-menu">
          {!compact && (
            <MenuToolbar
              query={query}
              onQueryChange={setQuery}
              dietFilter={dietFilter}
              onDietFilterChange={setDietFilter}
              counts={counts}
            />
          )}

          {featured.length > 0 && (
            <div className="mq-sig-feature-row">
              {featured.slice(0, 2).map((item) => (
                <article key={item.id} className="mq-sig-feature-card">
                  <SmartImage src={item.imageUrl} alt={item.name} role="thumb" focal={item.focal} aspectRatio="var(--mq-aspect-square)" className="mq-sig-feature-photo" />
                  <div className="mq-grow" style={{ minWidth: 0 }}>
                    <span className="mq-eyebrow">{item.isBestseller ? 'Bestseller' : 'Chef Pick'}</span>
                    <h4 className="mq-dish-name mq-clamp-2">{item.name}</h4>
                    <DishPrice item={item} readOnly={readOnly} />
                  </div>
                </article>
              ))}
            </div>
          )}

          {visible.length === 0 ? (
            hasQuery ? (
              <EmptyResults query={query.trim()} onClear={() => setQuery('')} />
            ) : (
              <p className="mq-tagline" role="status">This menu has no items yet.</p>
            )
          ) : (
            <div className="mq-stack" style={{ gap: 'var(--mq-space-8)' }}>
              {visible.map((category) => (
                <section key={category.id} aria-labelledby={`mq-sig-gb-${category.id}`}>
                  <div className="mq-row" style={{ alignItems: 'center' }}>
                    <span id={`mq-sig-gb-${category.id}`} className="mq-sig-graphic-banner">
                      {category.name}
                      <span className="mq-sig-graphic-count">{category.items.length}</span>
                    </span>
                    <span className="mq-grow mq-divider" aria-hidden="true" />
                  </div>

                  <div className="mq-sig-graphic-grid">
                    {category.items.map((item, index) => {
                      const pricing = parseItemPricing(item as Parameters<typeof parseItemPricing>[0]);
                      const description = (pricing.cleanDescription ?? item.description ?? '').trim();
                      return (
                        <article key={item.id} className="mq-card mq-sig-graphic-item">
                          <div className="mq-row" style={{ alignItems: 'flex-start', gap: 'var(--mq-space-2)' }}>
                            <span className="mq-sig-graphic-index">{String(index + 1).padStart(2, '0')}</span>
                            <div className="mq-grow" style={{ minWidth: 0 }}>
                              <div className="mq-row" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
                                <DietMark type={item.dietType} />
                                <h4 className="mq-dish-name mq-grow">{item.name}</h4>
                                <DishFlags item={item} />
                              </div>
                              {description && <p className="mq-dish-desc mq-clamp-2">{description}</p>}
                            </div>
                            {item.imageUrl && (
                              <SmartImage src={item.imageUrl} alt={item.name} role="thumb" focal={item.focal} aspectRatio="var(--mq-aspect-square)" className="mq-thumb" />
                            )}
                          </div>
                          <div className="mq-row-between" style={{ alignItems: 'center', marginTop: 'var(--mq-space-2)' }}>
                            <DishPrice item={item} readOnly={readOnly} />
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </section>
      )}

      <p className="mq-sig-chalk-footnote">{tokens.announcement ?? ''}</p>
    </div>
  );
};

export default GraphicBookletComposition;
