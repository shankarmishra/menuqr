/**
 * MENUQR Menu Renderer — Category Navigation Slots
 *
 * Navigation was previously re-implemented inside each template, so every layout had slightly
 * different behaviour and some had none at all. Here it is one concern with three presentations,
 * and all three share the same keyboard semantics and 44px targets.
 */

import React from 'react';
import type { SlotProps } from '../types.ts';

type NavProps = SlotProps;

const ALL = 'all';

function useNavItems(allCategories: NavProps['allCategories']) {
  return React.useMemo(
    () => [
      { id: ALL, name: 'All', count: allCategories.reduce((total, c) => total + c.items.length, 0) },
      ...allCategories.map((category) => ({
        id: category.id,
        name: category.name,
        count: category.items.length,
      })),
    ],
    [allCategories]
  );
}

/** Sticky capsule pills. The default: thumb-reachable and obvious on a phone. */
export const CapsulePillsNav: React.FC<NavProps> = ({ allCategories, activeCategoryId, onSelectCategory }) => {
  const items = useNavItems(allCategories);
  if (items.length <= 2) return null;

  return (
    <nav className="mq-nav" aria-label="Menu categories">
      <div className="mq-nav-scroller">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="mq-nav-item"
            aria-current={item.id === activeCategoryId}
            onClick={() => onSelectCategory(item.id)}
          >
            {item.name}
          </button>
        ))}
      </div>
    </nav>
  );
};

/** Underlined tabs: quieter, suits editorial and fine-dining presets. */
export const UnderlineTabsNav: React.FC<NavProps> = ({ allCategories, activeCategoryId, onSelectCategory }) => {
  const items = useNavItems(allCategories);
  if (items.length <= 2) return null;

  return (
    <nav className="mq-nav" aria-label="Menu categories">
      <div className="mq-nav-scroller">
        {items.map((item) => {
          const isActive = item.id === activeCategoryId;
          return (
            <button
              key={item.id}
              type="button"
              className="mq-nav-item"
              aria-current={isActive}
              onClick={() => onSelectCategory(item.id)}
              style={{
                background: 'transparent',
                border: 0,
                borderRadius: 0,
                color: isActive ? 'var(--mq-color-accent-text)' : 'var(--mq-color-text-muted)',
                borderBottom: `2px solid ${isActive ? 'var(--mq-color-accent)' : 'transparent'}`,
                paddingInline: 'var(--mq-space-3)',
              }}
            >
              {item.name}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

/**
 * A vertical index beside the menu on wide screens, collapsing to pills on a phone.
 *
 * Useful for long menus — a 180-item dhaba list is genuinely hard to navigate with horizontal
 * pills alone, and this gives the whole structure at a glance on a tablet at the table.
 */
export const SidebarIndexNav: React.FC<NavProps> = (props) => {
  const items = useNavItems(props.allCategories);
  if (items.length <= 2) return null;

  return (
    <>
      <nav className="mq-nav mq-sidebar-index-compact" aria-label="Menu categories">
        <div className="mq-nav-scroller">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="mq-nav-item"
              aria-current={item.id === props.activeCategoryId}
              onClick={() => props.onSelectCategory(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>
      </nav>

      <nav className="mq-sidebar-index" aria-label="Menu categories">
        <ul className="mq-stack" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {items.map((item) => {
            const isActive = item.id === props.activeCategoryId;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className="mq-nav-item"
                  aria-current={isActive}
                  onClick={() => props.onSelectCategory(item.id)}
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    background: isActive ? 'var(--mq-color-accent)' : 'transparent',
                    borderColor: isActive ? 'var(--mq-color-accent)' : 'transparent',
                    color: isActive ? 'var(--mq-color-accent-contrast)' : 'var(--mq-color-text)',
                  }}
                >
                  <span>{item.name}</span>
                  <span className="mq-price-label" style={{ color: 'inherit', opacity: 0.75 }}>
                    {item.count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};
