/**
 * MENUQR Menu Renderer — Theme Provider
 *
 * Applies resolved tokens as CSS custom properties on a single scoped wrapper, and exposes the
 * resolved theme to slots through context.
 *
 * Because a theme change only rewrites custom properties on one element, the Design Studio
 * preview repaints without remounting the React tree — no image reloads, no lost scroll
 * position, no flash. That is also why slots must read `var(--mq-*)` and never take colours as
 * props: props would force a re-render of every card on every colour tweak.
 */

import React, { createContext, useContext, useMemo } from 'react';
import { resolveTheme } from '../../design-system/resolveTheme.ts';
import type { MenuTheme, ThemeTokens } from '../../design-system/theme.types.ts';

const ThemeContext = createContext<ThemeTokens | null>(null);

/** Resolved tokens for the nearest enclosing menu. Throws outside a provider, by design. */
export function useMenuTheme(): ThemeTokens {
  const tokens = useContext(ThemeContext);
  if (!tokens) {
    throw new Error('useMenuTheme must be used inside a MenuThemeProvider.');
  }
  return tokens;
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

  return (
    <ThemeContext.Provider value={tokens}>
      <div
        className={['mq-root', className].filter(Boolean).join(' ')}
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
