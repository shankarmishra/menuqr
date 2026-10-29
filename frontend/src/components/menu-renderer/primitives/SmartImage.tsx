/**
 * MENUQR Menu Renderer — SmartImage
 *
 * The only way the renderer paints a photo. It exists because every `<img>` in the old templates
 * repeated the same four mistakes: no `loading`, no intrinsic dimensions (so every image shifted
 * the layout as it arrived), no modern format, and a centre crop that cut the dish in half.
 *
 * What it does instead:
 *  - serves AVIF, then WebP, then the original, via `<picture>`;
 *  - anchors the crop to the owner's focal point through `object-position`;
 *  - reserves space with an explicit aspect ratio, so Cumulative Layout Shift stays at zero;
 *  - lazy-loads by default, and eagerly fetches only what the caller marks as above the fold.
 *
 * Variant URLs follow the convention emitted by `backend/imageOptimizer.js`: a stored
 * `.../name.webp` also exists as `.../name-{w}.avif` and `.../name-{w}.webp`. When a URL does not
 * match that convention — an external or legacy image — it is used as-is with no srcset, which
 * degrades to exactly today's behaviour rather than producing broken requests.
 */

import React from 'react';
import type { FocalPoint } from '../../../design-system/theme.types.ts';

/** Widths generated at upload time. Keep in step with backend/imageOptimizer.js. */
export const IMAGE_WIDTHS = [160, 640, 1440] as const;

export type ImageRole = 'thumb' | 'card' | 'hero';

const ROLE_SIZES: Record<ImageRole, string> = {
  // A thumbnail is a fixed small square whatever the viewport.
  thumb: '64px',
  // Cards are full width on a phone, roughly half of an 896px page on a laptop.
  card: '(min-width: 768px) 420px, 100vw',
  hero: '100vw',
};

const ROLE_FALLBACK_WIDTH: Record<ImageRole, number> = { thumb: 160, card: 640, hero: 1440 };

/**
 * Only images written by our own upload pipeline have generated variants.
 *
 * Deliberately conservative: claiming variants exist for an arbitrary URL would emit a srcset of
 * 404s, and a browser that picks a broken candidate shows no image at all. Anything that is not
 * a `/uploads/` WebP renders as a plain `<img>`, which is exactly today's behaviour.
 */
function isOptimisedUpload(url: string): boolean {
  return url.startsWith('/uploads/') && /\.webp$/i.test(url);
}

function variantSrcSet(url: string, extension: 'avif' | 'webp'): string {
  const base = url.replace(/\.webp$/i, '');
  return IMAGE_WIDTHS.map((width) => `${base}-${width}.${extension} ${width}w`).join(', ');
}

export type SmartImageProps = {
  src?: string | null;
  /**
   * Alternative text. Required, including the empty string, so a decorative image is an explicit
   * decision rather than an oversight — the accessibility gate asserts every image has one.
   */
  alt: string;
  role: ImageRole;
  focal?: FocalPoint;
  /** CSS aspect ratio, e.g. `var(--mq-aspect-hero)`. Reserves space to prevent layout shift. */
  aspectRatio?: string;
  /** Set only for the one image above the fold; everything else stays lazy. */
  priority?: boolean;
  className?: string;
  /** Rendered in place of the image when `src` is absent. */
  placeholder?: React.ReactNode;
};

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  role,
  focal,
  aspectRatio,
  priority = false,
  className,
  placeholder,
}) => {
  const frameStyle: React.CSSProperties = aspectRatio ? { aspectRatio } : {};

  if (!src) {
    return (
      <div className={['mq-image-frame', className].filter(Boolean).join(' ')} style={frameStyle}>
        {placeholder ?? <div className="mq-image-placeholder" aria-hidden="true" />}
      </div>
    );
  }

  const x = Math.min(100, Math.max(0, (focal?.x ?? 0.5) * 100));
  const y = Math.min(100, Math.max(0, (focal?.y ?? 0.5) * 100));

  const imageStyle = {
    '--mq-image-position': `${x}% ${y}%`,
  } as React.CSSProperties;

  const optimised = isOptimisedUpload(src);
  const width = ROLE_FALLBACK_WIDTH[role];

  const img = (
    <img
      className="mq-image"
      src={src}
      alt={alt}
      // Intrinsic dimensions plus the frame's aspect-ratio are what hold layout steady while
      // the file is still in flight.
      width={width}
      height={Math.round(width * 0.75)}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      sizes={optimised ? ROLE_SIZES[role] : undefined}
      srcSet={optimised ? variantSrcSet(src, 'webp') : undefined}
      style={imageStyle}
    />
  );

  return (
    <div className={['mq-image-frame', className].filter(Boolean).join(' ')} style={frameStyle}>
      {optimised ? (
        <picture>
          <source type="image/avif" srcSet={variantSrcSet(src, 'avif')} sizes={ROLE_SIZES[role]} />
          {img}
        </picture>
      ) : (
        img
      )}
    </div>
  );
};
