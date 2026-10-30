/**
 * MENUQR Menu Renderer — Search and Diet Filter
 *
 * Cross-cutting rather than a slot: every preset needs these, and a diner should not lose the
 * ability to find a dish because the owner picked a different cover style. The old
 * `MenuTemplateRenderer` built this inline with hardcoded colours and 10px type; here it is one
 * token-driven component shared by all 288 layout combinations.
 */

import React from 'react';

export type DietFilter = 'all' | 'veg' | 'non-veg' | 'jain';

/** Matches `ITEM_ALLERGENS` in `backend/routes/app.js` — the whitelist the owner's tag editor
 * already enforces, so every allergen this chip row could ever need to show already exists. */
const ALLERGEN_LABELS: Record<string, string> = {
  nuts: 'Nuts', peanuts: 'Peanuts', dairy: 'Dairy', gluten: 'Gluten', soy: 'Soy',
  egg: 'Egg', fish: 'Fish', shellfish: 'Shellfish', sesame: 'Sesame',
};

export type MenuToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  dietFilter: DietFilter;
  onDietFilterChange: (value: DietFilter) => void;
  counts: { all: number; veg: number; nonVeg: number; jain?: number; allergens?: Record<string, number>; spicy?: number };
  /**
   * Allergen and spice filtering, both optional — a caller that doesn't pass them simply doesn't
   * get the extra chip rows (every existing call site keeps compiling and rendering unchanged).
   * The owner's on/off switches for these (`menuFeatures.allergenFilter`/`spiceFilter`) are
   * applied by the caller choosing whether to pass these props at all, not inside this component.
   */
  allergenFilter?: string[];
  onAllergenFilterChange?: (value: string[]) => void;
  spiceFilter?: number | null;
  onSpiceFilterChange?: (value: number | null) => void;
};

export const MenuToolbar: React.FC<MenuToolbarProps> = ({
  query,
  onQueryChange,
  dietFilter,
  onDietFilterChange,
  counts,
  allergenFilter,
  onAllergenFilterChange,
  spiceFilter,
  onSpiceFilterChange,
}) => {
  // With nothing to filter, the toolbar is noise.
  if (counts.all === 0) return null;

  const allergenEntries = Object.entries(counts.allergens ?? {}).filter(([, count]) => count > 0);
  const showAllergenRow = Boolean(onAllergenFilterChange) && allergenEntries.length > 0;
  const showSpiceRow = Boolean(onSpiceFilterChange) && (counts.spicy ?? 0) > 0;

  const filters: Array<{ id: DietFilter; label: string; count: number }> = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'veg', label: 'Pure Veg', count: counts.veg },
    { id: 'non-veg', label: 'Non-Veg', count: counts.nonVeg },
    { id: 'jain', label: 'Jain', count: counts.jain ?? 0 },
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

      {showSpiceRow && (
        <div className="mq-row" role="group" aria-label="Filter by spice level" style={{ flexWrap: 'wrap' }}>
          {[1, 2, 3].map((level) => (
            <button
              key={level}
              type="button"
              className="mq-nav-item"
              aria-pressed={spiceFilter === level}
              aria-current={spiceFilter === level}
              onClick={() => onSpiceFilterChange!(level)}
              title={`${level} of 3 or milder`}
            >
              {'🌶️'.repeat(level)}
            </button>
          ))}
        </div>
      )}

      {showAllergenRow && (
        <div className="mq-row" role="group" aria-label="Exclude an allergen" style={{ flexWrap: 'wrap' }}>
          {allergenEntries.map(([allergen, count]) => {
            const active = (allergenFilter ?? []).includes(allergen);
            return (
              <button
                key={allergen}
                type="button"
                className="mq-nav-item"
                aria-pressed={active}
                onClick={() =>
                  onAllergenFilterChange!(
                    active ? (allergenFilter ?? []).filter((a) => a !== allergen) : [...(allergenFilter ?? []), allergen]
                  )
                }
                title={active ? `Showing dishes without ${ALLERGEN_LABELS[allergen] ?? allergen}` : `Hide dishes containing ${ALLERGEN_LABELS[allergen] ?? allergen}`}
              >
                {active ? 'No ' : ''}{ALLERGEN_LABELS[allergen] ?? allergen}
                <span className="mq-price-label" style={{ color: 'inherit', opacity: 0.7, marginInlineStart: '0.4em' }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}
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
