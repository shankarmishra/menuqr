/**
 * MENUQR Menu Renderer — Category Navigation Slots
 *
 * Navigation was previously re-implemented inside each template, so every layout had slightly
 * different behaviour and some had none at all. Here it is one concern with three presentations,
 * and all three share the same keyboard semantics, 44px targets, and smooth scroll-spy highlighting.
 */

import React, { useMemo, useRef, useEffect } from 'react';
import type { SlotProps } from '../types.ts';

type NavProps = SlotProps;

const ALL = 'all';

function useNavItems(allCategories: NavProps['allCategories']) {
  return useMemo(
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

/**
 * Scroll-spy hook:
 * - Detects which category section is currently in view near the top of the viewport.
 * - Auto-scrolls the active pill into the horizontal center of the sticky pill bar.
 * - Smoothly scrolls the window to the selected category section when a pill is tapped.
 */
function useCategoryScrollSpy(
  categories: NavProps['allCategories'],
  activeCategoryId: string,
  onSelectCategory: (id: string) => void
) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const isClickingRef = useRef(false);

  // Auto-scroll the active pill horizontally into view
  useEffect(() => {
    if (!scrollerRef.current) return;
    const activeButton = scrollerRef.current.querySelector<HTMLButtonElement>(`[data-category-id="${activeCategoryId}"]`);
    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeCategoryId]);

  // Scroll listener for spy tracking
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const handleScroll = () => {
      if (isClickingRef.current) return;
      if (timer) return;

      timer = setTimeout(() => {
        timer = null;
        if (isClickingRef.current) return;

        // At the top of the page, highlight 'All'
        if (window.scrollY < 120) {
          if (activeCategoryId !== ALL) {
            onSelectCategory(ALL);
          }
          return;
        }

        const navOffset = 110;
        let matchedId = ALL;

        for (const cat of categories) {
          const el = document.getElementById(`mq-section-${cat.id}`) || document.getElementById(`mq-cat-${cat.id}`);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= navOffset + 80 && rect.bottom > navOffset) {
              matchedId = cat.id;
              break;
            } else if (rect.top <= navOffset + 80) {
              matchedId = cat.id;
            }
          }
        }

        if (matchedId && matchedId !== activeCategoryId) {
          onSelectCategory(matchedId);
        }
      }, 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timer) clearTimeout(timer);
    };
  }, [categories, activeCategoryId, onSelectCategory]);

  const handleSelect = (id: string) => {
    onSelectCategory(id);
    isClickingRef.current = true;

    if (id === ALL) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(`mq-section-${id}`) || document.getElementById(`mq-cat-${id}`);
      if (el) {
        const navOffset = 100;
        const bodyTop = document.body.getBoundingClientRect().top;
        const elTop = el.getBoundingClientRect().top;
        const scrollTarget = elTop - bodyTop - navOffset;

        window.scrollTo({
          top: Math.max(0, scrollTarget),
          behavior: 'smooth',
        });
      }
    }

    setTimeout(() => {
      isClickingRef.current = false;
    }, 600);
  };

  return { scrollerRef, handleSelect };
}

/** Sticky capsule pills with scroll-spy highlighting. The default: thumb-reachable and obvious on mobile. */
export const CapsulePillsNav: React.FC<NavProps> = ({ allCategories, activeCategoryId, onSelectCategory }) => {
  const items = useNavItems(allCategories);
  const { scrollerRef, handleSelect } = useCategoryScrollSpy(allCategories, activeCategoryId, onSelectCategory);

  if (items.length <= 2) return null;

  return (
    <nav className="mq-nav" aria-label="Menu categories">
      <div className="mq-nav-scroller" ref={scrollerRef}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            data-category-id={item.id}
            className="mq-nav-item"
            aria-current={item.id === activeCategoryId}
            onClick={() => handleSelect(item.id)}
          >
            {item.name}
          </button>
        ))}
      </div>
    </nav>
  );
};

/** Underlined tabs with scroll-spy: quieter, suits editorial and fine-dining presets. */
export const UnderlineTabsNav: React.FC<NavProps> = ({ allCategories, activeCategoryId, onSelectCategory }) => {
  const items = useNavItems(allCategories);
  const { scrollerRef, handleSelect } = useCategoryScrollSpy(allCategories, activeCategoryId, onSelectCategory);

  if (items.length <= 2) return null;

  return (
    <nav className="mq-nav" aria-label="Menu categories">
      <div className="mq-nav-scroller" ref={scrollerRef}>
        {items.map((item) => {
          const isActive = item.id === activeCategoryId;
          return (
            <button
              key={item.id}
              type="button"
              data-category-id={item.id}
              className="mq-nav-item"
              aria-current={isActive}
              onClick={() => handleSelect(item.id)}
              style={{
                background: 'transparent',
                border: 0,
                borderRadius: 0,
                color: isActive ? 'var(--mq-color-accent-text)' : 'var(--mq-color-text-muted)',
                borderBottom: `2px solid ${isActive ? 'var(--mq-color-accent)' : 'transparent'}`,
                paddingInline: 'var(--mq-space-3)',
                fontWeight: isActive ? 700 : 500,
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
  const { scrollerRef, handleSelect } = useCategoryScrollSpy(props.allCategories, props.activeCategoryId, props.onSelectCategory);

  if (items.length <= 2) return null;

  return (
    <>
      <nav className="mq-nav mq-sidebar-index-compact" aria-label="Menu categories">
        <div className="mq-nav-scroller" ref={scrollerRef}>
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              data-category-id={item.id}
              className="mq-nav-item"
              aria-current={item.id === props.activeCategoryId}
              onClick={() => handleSelect(item.id)}
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
                  data-category-id={item.id}
                  className="mq-nav-item"
                  aria-current={isActive}
                  onClick={() => handleSelect(item.id)}
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
