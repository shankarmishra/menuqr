/**
 * LogoMark — Deterministic brand mark renderer.
 *
 * Implements the presentation rules from Platform Blueprint Section 7.5:
 * - When a logo is present:
 *   - Guaranteed contrast >= 3:1 via choosePresentation (plain, plate, mono).
 *   - Geometric plate scaling: never crops or slices badges (scale = d / sqrt(w^2 + h^2)).
 *   - Always object-fit: contain, never object-fit: cover.
 * - When no logo is present:
 *   - Falls back cleanly to a typographic initials lockup with zero warnings.
 */

import React, { useMemo } from 'react';
import type { LogoAnalysis } from '../../lib/logo/types.ts';
import {
  choosePresentation,
  fitInCircle,
  getBrandInitials,
  type PresentationMode,
} from './logoPresentation.ts';

export interface LogoMarkProps {
  /** Restaurant data holding name and optional logoUrl */
  restaurant?: {
    name: string;
    logoUrl?: string | null;
  } | null;
  /** Explicit logo URL override */
  logoUrl?: string | null;
  /** Explicit restaurant name override */
  name?: string;
  /** Precomputed logo analysis from logo pipeline */
  analysis?: LogoAnalysis | null;
  /** Desired bounding dimension (width/height or diameter) in pixels. Default 72. */
  size?: number;
  /** Background/surface colour behind the mark to evaluate contrast against */
  surfaceColor?: string;
  /** Presentation mode override */
  mode?: PresentationMode;
  /** Allowed presentation modes in preference order */
  allowedModes?: PresentationMode[];
  /** Shape of the container or plate: 'circle' | 'square' | 'rounded' (default 'circle') */
  shape?: 'circle' | 'square' | 'rounded';
  /** One-colour variant URLs if available */
  monoLightUrl?: string | null;
  monoDarkUrl?: string | null;
  loading?: 'eager' | 'lazy';
  className?: string;
  style?: React.CSSProperties;
  /** Optional click handler */
  onClick?: () => void;
}

export const LogoMark: React.FC<LogoMarkProps> = ({
  restaurant,
  logoUrl: propLogoUrl,
  name: propName,
  analysis,
  size = 72,
  surfaceColor = '#ffffff',
  mode: explicitMode,
  allowedModes = ['plain', 'plate', 'mono'],
  shape = 'circle',
  monoLightUrl,
  monoDarkUrl,
  loading = 'lazy',
  className = '',
  style,
  onClick,
}) => {
  const finalLogoUrl = propLogoUrl ?? restaurant?.logoUrl ?? null;
  const restaurantName = propName ?? restaurant?.name ?? '';

  const decision = useMemo(() => {
    if (!finalLogoUrl) return null;
    const computed = choosePresentation(analysis, {
      surfaceColor,
      allowedModes,
      minContrast: 3.0,
    });
    if (explicitMode) {
      return { ...computed, mode: explicitMode };
    }
    return computed;
  }, [finalLogoUrl, analysis, surfaceColor, allowedModes, explicitMode]);

  // Clean fallback when no logo is uploaded: typographic initials lockup
  if (!finalLogoUrl) {
    const initials = getBrandInitials(restaurantName);
    const borderRadius = shape === 'circle' ? '50%' : shape === 'rounded' ? '12px' : '4px';

    return (
      <span
        className={['mq-logo-lockup', className].filter(Boolean).join(' ')}
        style={{
          display: 'inline-grid',
          placeItems: 'center',
          width: size,
          height: size,
          borderRadius,
          backgroundColor: 'var(--mq-color-surface, rgba(255, 255, 255, 0.92))',
          color: 'var(--mq-color-text, #161616)',
          border: '1px solid var(--mq-color-border, rgba(0, 0, 0, 0.12))',
          boxSizing: 'border-box',
          userSelect: 'none',
          ...style,
        }}
        aria-label={restaurantName}
        role="img"
        onClick={onClick}
        data-testid="mq-logo-fallback"
      >
        <span
          className="mq-logo-initials"
          style={{
            fontFamily: 'var(--mq-font-display, sans-serif)',
            fontWeight: 700,
            fontSize: Math.max(12, Math.round(size * 0.4)),
            letterSpacing: '0.05em',
            lineHeight: 1,
          }}
        >
          {initials}
        </span>
      </span>
    );
  }

  // Active presentation mode
  const activeMode = decision?.mode ?? 'plain';
  const variant = decision?.variant ?? 'full';

  // Determine source image URL based on mono decision
  let imageSrc = finalLogoUrl;
  let cssFilter: string | undefined;

  if (activeMode === 'mono') {
    if (variant === 'mono-light') {
      if (monoLightUrl) imageSrc = monoLightUrl;
      else cssFilter = 'brightness(0) invert(1)';
    } else if (variant === 'mono-dark') {
      if (monoDarkUrl) imageSrc = monoDarkUrl;
      else cssFilter = 'brightness(0)';
    }
  }

  // Geometry: circular plates inscribe the logo so corners are never sliced
  const isCircle = shape === 'circle';
  const borderRadius = isCircle ? '50%' : shape === 'rounded' ? '12px' : '4px';

  if (activeMode === 'plate') {
    const plateBg = decision?.plateBg ?? '#ffffff';
    const isRound = analysis?.isRoundBadge ?? false;

    // Content bounds for geometric scaling
    const contentW = analysis?.content.width ?? size;
    const contentH = analysis?.content.height ?? size;
    const fitted = isCircle
      ? fitInCircle(contentW, contentH, size * 0.84, isRound)
      : { width: Math.round(size * 0.88), height: Math.round(size * 0.88) };

    return (
      <span
        className={['mq-logo-plate', `mq-logo-plate-${shape}`, className].filter(Boolean).join(' ')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          borderRadius,
          backgroundColor: plateBg,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          boxSizing: 'border-box',
          overflow: 'hidden',
          ...style,
        }}
        onClick={onClick}
        data-testid="mq-logo-plate"
      >
        <img
          src={imageSrc}
          alt={restaurantName}
          width={fitted.width}
          height={fitted.height}
          loading={loading}
          decoding="async"
          className="mq-logo"
          style={{
            width: fitted.width,
            height: fitted.height,
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            filter: cssFilter,
            display: 'block',
          }}
        />
      </span>
    );
  }

  // Plain or mono mode
  return (
    <span
      className={['mq-logo-wrapper', className].filter(Boolean).join(' ')}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        boxSizing: 'border-box',
        ...style,
      }}
      onClick={onClick}
      data-testid="mq-logo-plain"
    >
      <img
        src={imageSrc}
        alt={restaurantName}
        width={size}
        height={size}
        loading={loading}
        decoding="async"
        className="mq-logo"
        style={{
          width: '100%',
          height: '100%',
          maxWidth: size,
          maxHeight: size,
          objectFit: 'contain',
          filter: cssFilter,
          display: 'block',
        }}
      />
    </span>
  );
};
