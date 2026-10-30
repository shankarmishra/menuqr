/**
 * MENUQR Menu Renderer — Cover Slots
 *
 * The first thing a diner sees after scanning. Four genuinely different compositions rather than
 * four recolours, because the cover is where a cafe should look nothing like a banquet hall.
 *
 * Each cover reads the same tokens and the same data, so switching between them is one field in
 * `MenuTheme.slots.cover` — not a new file, which is what the old architecture required.
 */

import React from 'react';
import { useMenuTheme } from '../MenuThemeProvider.tsx';
import { SmartImage } from '../primitives/SmartImage.tsx';
import type { SlotProps } from '../types.ts';

type CoverProps = SlotProps;


/** Logo, sized by role and shaped per the owner's choice. */
const BrandLogo: React.FC<{ size: number; onCover?: boolean }> = ({ size, onCover }) => {
  const { brand, cover } = useMenuTheme();
  const url = brand.logoUrl;
  if (!url) return null;

  const shapeClass =
    brand.logoShape === 'circle' ? 'mq-logo-circle' : brand.logoShape === 'square' ? 'mq-logo-square' : '';

  return (
    <img
      className={['mq-logo', shapeClass].filter(Boolean).join(' ')}
      src={url}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      // The logo is the one thing worth fetching eagerly on a photo cover: it is above the fold
      // and it is the brand.
      loading={onCover || cover.showCoverPage ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
};

const Announcement: React.FC = () => {
  const { announcement } = useMenuTheme();
  if (!announcement) return null;
  return (
    <p className="mq-eyebrow" role="note">
      {announcement}
    </p>
  );
};

const RestaurantMeta: React.FC<{ restaurant: CoverProps['restaurant'] }> = ({ restaurant }) => {
  const parts = [restaurant.city, restaurant.openingHours].filter(Boolean);
  if (parts.length === 0) return null;
  return <p className="mq-tagline">{parts.join(' · ')}</p>;
};

/**
 * Style A — Cinematic hero.
 *
 * The owner's own photograph, full bleed, under a gradient scrim. The scrim strength is a theme
 * field rather than a constant because an owner's photo may be anything from a bright daylight
 * courtyard to a dark interior, and fixed overlay opacity fails at both ends.
 */
export const HeroPhotoCover: React.FC<CoverProps> = ({ restaurant, compact }) => {
  const { cover } = useMenuTheme();
  const hasPhoto = Boolean(cover.imageUrl);

  // Before a client uploads a cover photo — true for every brand-new menu — reserving 58vh for
  // an empty frame reads as broken, not as restrained. Fall back to a compact, centred layout
  // closer to the monogram cover until a photo exists, so the first thing an owner sees is
  // finished rather than half-built.
  if (!hasPhoto) {
    return (
      <header className="mq-cover" style={{ paddingBlock: compact ? 'var(--mq-space-8)' : 'var(--mq-space-14)' }}>
        <div className="mq-cover-content" style={{ alignItems: 'center', textAlign: 'center' }}>
          <BrandLogo size={compact ? 48 : 68} />
          <Announcement />
          <h1 className="mq-display mq-display-xl">{restaurant.name}</h1>
          {restaurant.tagline && <p className="mq-tagline">{restaurant.tagline}</p>}
          <RestaurantMeta restaurant={restaurant} />
        </div>
      </header>
    );
  }

  return (
    <header className="mq-cover mq-on-cover" style={{ minHeight: compact ? '42vh' : '58vh' }}>
      <div className="mq-cover-media">
        <SmartImage
          src={cover.imageUrl}
          alt=""
          role="hero"
          focal={cover.focal}
          priority
          aspectRatio={undefined}
        />
      </div>
      <div className="mq-cover-scrim" />
      <div className="mq-cover-content" style={{ justifyContent: 'flex-end', minHeight: 'inherit' }}>
        <BrandLogo size={compact ? 48 : 68} onCover />
        <Announcement />
        <h1 className="mq-display mq-display-xl">{restaurant.name}</h1>
        {restaurant.tagline && <p className="mq-tagline">{restaurant.tagline}</p>}
        <RestaurantMeta restaurant={restaurant} />
      </div>
    </header>
  );
};

/**
 * Style B — Michelin monogram.
 *
 * No photograph at all. Restraint is the signal here, which also makes this the right default
 * for a brand-new client who has not uploaded anything yet: an empty monogram cover looks
 * deliberate, whereas an empty photo cover looks broken.
 */
export const MonogramCover: React.FC<CoverProps> = ({ restaurant, compact }) => {
  const { brand } = useMenuTheme();
  const initials = restaurant.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  return (
    <header className="mq-cover" style={{ paddingBlock: compact ? 'var(--mq-space-8)' : 'var(--mq-space-16)' }}>
      <div className="mq-cover-content" style={{ alignItems: 'center', textAlign: 'center' }}>
        {brand.logoUrl ? (
          <BrandLogo size={compact ? 56 : 84} />
        ) : (
          <span
            className="mq-display mq-display-lg"
            aria-hidden="true"
            style={{
              display: 'grid',
              placeItems: 'center',
              width: compact ? 56 : 84,
              height: compact ? 56 : 84,
              borderRadius: '50%',
              border: '1px solid var(--mq-color-accent)',
              color: 'var(--mq-color-accent-text)',
            }}
          >
            {initials}
          </span>
        )}
        <Announcement />
        <h1 className="mq-display mq-display-lg">{restaurant.name}</h1>
        <hr className="mq-divider" style={{ width: '4rem', backgroundColor: 'var(--mq-color-accent)' }} />
        {restaurant.tagline && <p className="mq-tagline">{restaurant.tagline}</p>}
        <RestaurantMeta restaurant={restaurant} />
      </div>
    </header>
  );
};

/**
 * Style C — Heritage arch.
 *
 * A scalloped cusped arch, drawn as inline SVG so it takes the brand accent colour and stays
 * crisp at any density. The motif is the one piece of the old Rajasthani and Mughal templates
 * genuinely worth keeping; here it responds to the palette instead of being frozen in gold.
 */
export const HeritageArchCover: React.FC<CoverProps> = ({ restaurant, categories, compact }) => {
  return (
    <header className="mq-cover" style={{ paddingBlock: compact ? 'var(--mq-space-6)' : 'var(--mq-space-12)' }}>
    <div className="mq-cover-content" style={{ alignItems: 'center', textAlign: 'center' }}>
      <svg
        viewBox="0 0 200 120"
        width={compact ? 150 : 230}
        height={compact ? 90 : 138}
        aria-hidden="true"
        style={{ overflow: 'visible' }}
      >
        <path
          d="M100 8 C140 8 170 38 170 78 L170 112 L30 112 L30 78 C30 38 60 8 100 8 Z"
          fill="none"
          stroke="var(--mq-color-accent)"
          strokeWidth="1.5"
        />
        <path
          d="M100 20 C133 20 158 45 158 78 L158 100 L42 100 L42 78 C42 45 67 20 100 20 Z"
          fill="none"
          stroke="var(--mq-color-border-strong)"
          strokeWidth="0.75"
          strokeDasharray="3 3"
        />
        <circle cx="100" cy="78" r="2.5" fill="var(--mq-color-accent)" />
      </svg>

      <Announcement />
      <h1 className="mq-display mq-display-lg">{restaurant.name}</h1>
      {restaurant.tagline && <p className="mq-tagline">{restaurant.tagline}</p>}

      {categories.length > 0 && (
        <p className="mq-eyebrow" style={{ maxWidth: '32rem' }}>
          {categories.slice(0, 5).map((category) => category.name).join(' · ')}
        </p>
      )}
      <RestaurantMeta restaurant={restaurant} />
    </div>
  </header>
  );
};

/**
 * Style D — Bento collage.
 *
 * Three real dish photographs plus the brand block. Pulls from the menu's own bestsellers, so a
 * client who has uploaded dish photos gets a cover for free without choosing one — and a client
 * with no photos falls back to the brand block alone rather than to empty frames.
 */
export const BentoCollageCover: React.FC<CoverProps> = ({ restaurant, categories, compact }) => {
  const photographed = categories
    .flatMap((category) => category.items)
    .filter((item) => Boolean(item.imageUrl));

  // Bestsellers first: if the owner has flagged favourites, those are the ones worth showing.
  const featured = [...photographed]
    .sort((a, b) => Number(Boolean(b.isBestseller)) - Number(Boolean(a.isBestseller)))
    .slice(0, 3);

  return (
    <header className="mq-cover" style={{ paddingBlock: 'var(--mq-space-5)' }}>
      <div className="mq-cover-content">
        <div className="mq-row" style={{ alignItems: 'center' }}>
          <BrandLogo size={compact ? 44 : 60} />
          <div className="mq-grow mq-stack">
            <Announcement />
            <h1 className="mq-display mq-display-md">{restaurant.name}</h1>
            {restaurant.tagline && <p className="mq-tagline mq-clamp-2">{restaurant.tagline}</p>}
          </div>
        </div>

        {featured.length > 0 && (
          <div
            style={{
              display: 'grid',
              gap: 'var(--mq-space-2)',
              gridTemplateColumns: featured.length === 1 ? '1fr' : 'repeat(3, 1fr)',
            }}
          >
            {featured.map((item, index) => (
              <SmartImage
                key={item.id}
                src={item.imageUrl}
                alt={item.name}
                role="card"
                focal={item.focal}
                aspectRatio="var(--mq-aspect-square)"
                priority={index === 0}
              />
            ))}
          </div>
        )}

        <RestaurantMeta restaurant={restaurant} />
      </div>
    </header>
  );
};
