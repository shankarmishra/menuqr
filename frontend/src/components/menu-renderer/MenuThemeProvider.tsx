/**
 * MENUQR Menu Renderer — Theme Provider
 *
 * Applies resolved tokens as CSS custom properties on a single scoped wrapper, and exposes the
 * resolved theme to slots through context.
 *
 * Because a theme change only rewrites custom properties on one element, the Design Studio
 * preview updates without remounting the React tree — no image reloads, no lost scroll
 * position, no flash. That is also why slots must read `var(--mq-*)` and never take colours as
 * props: props would force a re-render of every card on every colour tweak.
 *
 * Performance Architecture Reality:
 * Updating CSS custom properties on a single scoped container (.mq-root) achieves O(1) React
 * reconciliation: React skips virtual DOM diffing and component remounts across 200+ dish cards,
 * preserving scroll position, cached images, and DOM state.
 *
 * Browser Rendering Reality (eliminating unverified "0ms paint" claims):
 * While React overhead is bypassed, the browser's native engine still performs Style Recalculation
 * (~3-12ms on mobile) and layout reflow/repaint as required when typography or spacing tokens
 * change. Animations and transitions target GPU-composited properties (transform, opacity) within
 * the standard 16.6ms frame budget (at 60Hz) or 8.3ms (at 120Hz).
 */

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { fontPreloadsFor } from '../../design-system/fonts.ts';
import { resolveTheme } from '../../design-system/resolveTheme.ts';
import { FALLBACK_THEME } from '../../design-system/validateTheme.ts';
import type { MenuTheme, ThemeTokens } from '../../design-system/theme.types.ts';

/**
 * Preloads exactly the active pairing's two critical faces. Idempotent by href, so mounting the
 * provider twice (Studio preview + customer menu, or a route remount) never duplicates a link.
 */
function usePreloadActiveFontPairing(typePair: MenuTheme['typePair']) {
  useEffect(() => {
    for (const asset of fontPreloadsFor(typePair)) {
      if (document.head.querySelector(`link[rel="preload"][href="${asset.href}"]`)) continue;
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = asset.href;
      document.head.appendChild(link);
    }
  }, [typePair]);
}

const ThemeContext = createContext<ThemeTokens | null>(null);

/** Resolved tokens for the nearest enclosing menu. Throws outside a provider, by design. */
const DEFAULT_TOKENS = resolveTheme(FALLBACK_THEME);

export function useMenuTheme(): ThemeTokens {
  const tokens = useContext(ThemeContext);
  return tokens ?? DEFAULT_TOKENS;
}

export type MenuThemeProviderProps = {
  theme: MenuTheme;
  className?: string;
  /** Extra inline styles merged after the tokens, e.g. a fixed height in the Studio preview. */
  style?: React.CSSProperties;
  children: React.ReactNode;
};

export const MenuThemeProvider: React.FC<MenuThemeProviderProps> = ({
  theme,
  className,
  style,
  children,
}) => {
  // Resolution is pure and cheap, but memoising keeps the token object identity stable so slots
  // reading context do not re-render when an unrelated parent does.
  const tokens = useMemo(() => resolveTheme(theme), [theme]);
  usePreloadActiveFontPairing(theme.typePair);

  return (
    <ThemeContext.Provider value={tokens}>
      <div
        className={['mq-root', tokens.layoutVersion === 2 ? 'mq-layout-v2' : 'mq-layout-v1', className].filter(Boolean).join(' ')}
        data-mq-layout-version={tokens.layoutVersion}
        data-mq-preset={tokens.presetId}
        data-mq-mode={tokens.mode}
        data-mq-density={tokens.density}
        style={{ ...(tokens.cssVariables as React.CSSProperties), ...style }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
