/**
 * MENUQR Menu Renderer — Search and Diet Filter
 *
 * Cross-cutting rather than a slot: every preset needs these, and a diner should not lose the
 * ability to find a dish because the owner picked a different cover style. The old
 * `MenuTemplateRenderer` built this inline with hardcoded colours and 10px type; here it is one
 * token-driven component shared by all 288 layout combinations.
 */

import React from 'react';

export type DietFilter = 'all' | 'veg' | 'non-veg';

export type MenuToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  dietFilter: DietFilter;
  onDietFilterChange: (value: DietFilter) => void;
  counts: { all: number; veg: number; nonVeg: number };
};

export const MenuToolbar: React.FC<MenuToolbarProps> = ({
  query,
  onQueryChange,
  dietFilter,
  onDietFilterChange,
  counts,
}) => {
  // With nothing to filter, the toolbar is noise.
  if (counts.all === 0) return null;

  const filters: Array<{ id: DietFilter; label: string; count: number }> = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'veg', label: 'Pure Veg', count: counts.veg },
    { id: 'non-veg', label: 'Non-Veg', count: counts.nonVeg },
  ];

  return (
    <div className="mq-toolbar">
      <label className="mq-search">
        <span className="mq-sr-only">Search dishes</span>
        <input
          type="search"
          className="mq-search-input"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search dishes"
          autoComplete="off"
        />
      </label>

      {/* A single-group toggle, so it is announced as a group rather than three loose buttons. */}
      <div className="mq-row" role="group" aria-label="Filter by diet" style={{ flexWrap: 'wrap' }}>
        {filters
          .filter((filter) => filter.count > 0 || filter.id === 'all')
          .map((filter) => (
            <button
              key={filter.id}
              type="button"
              className="mq-nav-item"
              aria-pressed={dietFilter === filter.id}
              aria-current={dietFilter === filter.id}
              onClick={() => onDietFilterChange(filter.id)}
            >
              {filter.label}
              <span className="mq-price-label" style={{ color: 'inherit', opacity: 0.7, marginInlineStart: '0.4em' }}>
                {filter.count}
              </span>
            </button>
          ))}
      </div>
    </div>
  );
};

export type EmptyResultsProps = { query: string; onClear: () => void };

export const EmptyResults: React.FC<EmptyResultsProps> = ({ query, onClear }) => (
  <div className="mq-stack" style={{ alignItems: 'center', textAlign: 'center', paddingBlock: 'var(--mq-space-12)' }}>
    <p className="mq-dish-name">No dishes match &ldquo;{query}&rdquo;</p>
    <p className="mq-tagline">Try a shorter search, or clear it to see the full menu.</p>
    <button type="button" className="mq-button" onClick={onClear}>
      Clear search
    </button>
  </div>
);
