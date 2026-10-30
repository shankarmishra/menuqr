/**
 * MENUQR Editions — Shared Editorial Primitives
 *
 * The ten Edition compositions are deliberately *not* variations of one layout: each owns its
 * cover, its category headers, its dish rows and its ornament. What they legitimately share is
 * the handful of pieces where divergence would be a bug rather than a design choice — pricing
 * parsing, diet marks, deterministic photo selection, contact formatting.
 *
 * Everything here is layout-neutral: it emits content and semantics, never a look. The look is
 * the composition's own CSS in `editions.css`.
 */

import React, { useMemo } from 'react';
import { DietMark, DishFlags, DishPrice } from '../../primitives/DishMeta.tsx';
import { SmartImage } from '../../primitives/SmartImage.tsx';
import { parseItemPricing } from '../../../menu-builder/templates/shared/pricingUtils';
import type { RenderCategory, RenderMenuItem, RenderRestaurant, SignatureProps } from '../../types.ts';

export type EditionProps = SignatureProps;

// ------------------------------------- content helpers -------------------------------------

/** Two-letter mark for a crest or seal when the owner has not uploaded a logo. */
export function initials(name: string, max = 2): string {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('');
  return (letters || name.slice(0, max)).slice(0, max).toUpperCase();
}

/** The dish description with any pricing noise the owner typed into it removed. */
export function cleanDescription(item: RenderMenuItem): string {
  const pricing = parseItemPricing(item as Parameters<typeof parseItemPricing>[0]);
  return (pricing.cleanDescription ?? item.description ?? '').trim();
}

/** Non-empty categories only — an empty section is a hole in a printed page. */
export function liveCategories(categories: RenderCategory[]): RenderCategory[] {
  return categories.filter((category) => category.items.length > 0);
}

/**
 * Photographed dishes, bestsellers first.
 *
 * Deterministic rather than random so a cover never reshuffles between renders — the same menu
 * always produces the same page, which is what makes the layout snapshot-testable.
 */
export function useFeatured(categories: RenderCategory[], count: number): RenderMenuItem[] {
  return useMemo(() => {
    const items = categories.flatMap((category) => category.items).filter((item) => item.imageUrl);
    const bestsellers = items.filter((item) => item.isBestseller);
    const rest = items.filter((item) => !item.isBestseller);
    return [...bestsellers, ...rest].slice(0, count);
  }, [categories, count]);
}

/** Address, city and hours as one line, skipping whatever the owner has not filled in. */
export function locationLine(restaurant: RenderRestaurant): string {
  return [restaurant.address, restaurant.city].filter(Boolean).join(', ');
}

// ------------------------------------ shared fragments ------------------------------------

/**
 * Name, then a rule that eats the remaining width, then the price.
 *
 * The leader is a flex child rather than a CSS dotted background because the rule has to stop
 * exactly where the price starts at any string length — a background repeat cannot do that, and
 * every hand-written attempt in the old templates got it subtly wrong.
 */
export const Leader: React.FC<{
  item: RenderMenuItem;
  readOnly?: boolean;
  showDiet?: boolean;
  showFlags?: boolean;
  showDescription?: boolean;
  className?: string;
}> = ({ item, readOnly, showDiet = true, showFlags = true, showDescription = true, className }) => {
  const description = showDescription ? cleanDescription(item) : '';

  return (
    <article className={['mq-ed-leader', className].filter(Boolean).join(' ')}>
      <div className="mq-ed-leader-head">
        {showDiet && <DietMark type={item.dietType} />}
        <h4 className="mq-ed-leader-name mq-dish-name">{item.name}</h4>
        <span className="mq-ed-leader-rule" aria-hidden="true" />
        <DishPrice item={item} readOnly={readOnly} />
      </div>
      {description && <p className="mq-ed-leader-desc mq-dish-desc">{description}</p>}
      {showFlags && (
        <div className="mq-ed-leader-flags">
          <DishFlags item={item} />
        </div>
      )}
    </article>
  );
};

/** A dish with a photo at a fixed ratio, for compositions built around photography. */
export const PhotoDish: React.FC<{
  item: RenderMenuItem;
  readOnly?: boolean;
  aspect?: string;
  className?: string;
  /** Rendered above the name, e.g. an index number or a "Chef's pick" eyebrow. */
  eyebrow?: React.ReactNode;
}> = ({ item, readOnly, aspect = 'var(--mq-aspect-card)', className, eyebrow }) => {
  const description = cleanDescription(item);

  return (
    <article className={['mq-ed-photo-dish', className].filter(Boolean).join(' ')}>
      {item.imageUrl && (
        <div className="mq-ed-photo-dish-media">
          <SmartImage
            src={item.imageUrl}
            alt={item.name}
            role="card"
            focal={item.focal}
            aspectRatio={aspect}
          />
        </div>
      )}
      <div className="mq-ed-photo-dish-body">
        {eyebrow && <span className="mq-ed-eyebrow">{eyebrow}</span>}
        <div className="mq-ed-photo-dish-title">
          <DietMark type={item.dietType} />
          <h4 className="mq-ed-leader-name mq-dish-name">{item.name}</h4>
        </div>
        {description && <p className="mq-ed-leader-desc mq-dish-desc">{description}</p>}
        <div className="mq-ed-photo-dish-foot">
          <DishPrice item={item} readOnly={readOnly} />
          <DishFlags item={item} />
        </div>
      </div>
    </article>
  );
};

/** Phone, address and hours, formatted identically everywhere it appears. */
export const EditionContact: React.FC<{
  restaurant: RenderRestaurant;
  className?: string;
  separator?: string;
}> = ({ restaurant, className, separator = '·' }) => {
  const parts = [restaurant.phone, locationLine(restaurant), restaurant.openingHours].filter(Boolean);
  if (parts.length === 0) return null;

  return (
    <p className={['mq-ed-contact', className].filter(Boolean).join(' ')} data-testid="mq-cover-meta">
      {parts.map((part, index) => (
        <React.Fragment key={part}>
          {index > 0 && <span className="mq-ed-contact-sep" aria-hidden="true">{separator}</span>}
          <span>{part}</span>
        </React.Fragment>
      ))}
    </p>
  );
};

/**
 * The owner's logo, or a typographic mark built from their name.
 *
 * Never renders nothing: a cover with an empty space where the brand should be is the single
 * most common way a generated menu reads as unfinished.
 */
export const BrandMark: React.FC<{
  restaurant: RenderRestaurant;
  className?: string;
  size?: number;
}> = ({ restaurant, className, size = 72 }) => (
  <span
    className={['mq-ed-mark', className].filter(Boolean).join(' ')}
    style={{ width: size, height: size }}
    data-testid="mq-cover-mark"
  >
    {restaurant.logoUrl ? (
      <img
        src={restaurant.logoUrl}
        alt={restaurant.name}
        width={size}
        height={size}
        loading="eager"
        decoding="async"
      />
    ) : (
      <span className="mq-ed-mark-letters">{initials(restaurant.name)}</span>
    )}
  </span>
);

/** The first few category names, for a cover's "what's inside" line. */
export const CategoryTeaser: React.FC<{
  categories: RenderCategory[];
  limit?: number;
  separator?: string;
  className?: string;
}> = ({ categories, limit = 5, separator = '·', className }) => {
  const names = liveCategories(categories).slice(0, limit).map((category) => category.name);
  if (names.length === 0) return null;

  return (
    <p className={['mq-ed-teaser', className].filter(Boolean).join(' ')}>
      {names.map((name, index) => (
        <React.Fragment key={name}>
          {index > 0 && <span className="mq-ed-teaser-sep" aria-hidden="true">{separator}</span>}
          <span>{name}</span>
        </React.Fragment>
      ))}
    </p>
  );
};
