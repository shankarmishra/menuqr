/**
 * MENUQR Menu Renderer — Search and Diet Filter Toolbar
 *
 * Cross-cutting component providing search and dietary filters across every template.
 * - Prominent Search bar with icon and instant clear button
 * - Clean diet filter pills (All, Pure Veg, Non-Veg, Jain) with verified FSSAI dots and live counters
 * - Optional allergen exclusion and spice level ceiling rows
 */

import React from 'react';
import { Search, X } from 'lucide-react';
import './MenuToolbar.css';

export type DietFilter = 'all' | 'veg' | 'non-veg' | 'jain';

const ALLERGEN_LABELS: Record<string, string> = {
  nuts: 'Nuts',
  peanuts: 'Peanuts',
  dairy: 'Dairy',
  gluten: 'Gluten',
  soy: 'Soy',
  egg: 'Egg',
  fish: 'Fish',
  shellfish: 'Shellfish',
  sesame: 'Sesame',
};

export type MenuToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  dietFilter: DietFilter;
  onDietFilterChange: (value: DietFilter) => void;
  counts: {
    all: number;
    veg: number;
    nonVeg: number;
    jain?: number;
    allergens?: Record<string, number>;
    spicy?: number;
  };
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

  const getActiveChipClass = (id: DietFilter) => {
    if (dietFilter !== id) return '';
    switch (id) {
      case 'veg':
        return 'is-active-veg';
      case 'non-veg':
        return 'is-active-nonveg';
      case 'jain':
        return 'is-active-jain';
      default:
        return 'is-active-all';
    }
  };

  return (
    <div className="mq-toolbar" role="region" aria-label="Search and filter">
      {/* Search Input Bar */}
      <div className="mq-search-wrapper">
        <Search className="mq-search-icon" size={18} aria-hidden="true" />
        <input
          type="search"
          className="mq-search-input"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search dishes"
          autoComplete="off"
          aria-label="Search dishes"
        />
        {query ? (
          <button
            type="button"
            className="mq-search-clear"
            onClick={() => onQueryChange('')}
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        ) : null}
      </div>

      {/* Diet Filters Row */}
      <div className="mq-filter-row" role="group" aria-label="Filter by diet">
        {filters
          .filter((filter) => filter.count > 0 || filter.id === 'all')
          .map((filter) => {
            const isActive = dietFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                className={`mq-filter-chip ${isActive ? getActiveChipClass(filter.id) : ''}`}
                aria-pressed={isActive}
                aria-current={isActive}
                onClick={() => onDietFilterChange(filter.id)}
              >
                {filter.id === 'veg' && (
                  <span className="mq-chip-fssai-icon is-veg" aria-hidden="true">
                    <span className="mq-chip-dot" />
                  </span>
                )}
                {filter.id === 'non-veg' && (
                  <span className="mq-chip-fssai-icon is-nonveg" aria-hidden="true">
                    <span className="mq-chip-dot" />
                  </span>
                )}
                {filter.id === 'all' && (
                  <span className="mq-chip-all-icon" aria-hidden="true">
                    🍽️
                  </span>
                )}
                {filter.id === 'jain' && (
                  <span className="mq-chip-all-icon" aria-hidden="true">
                    🌱
                  </span>
                )}

                <span>{filter.label}</span>
                <span className="mq-chip-count">{filter.count}</span>
              </button>
            );
          })}
      </div>

      {/* Spice Filter Row (Optional) */}
      {showSpiceRow && (
        <div className="mq-filter-row" role="group" aria-label="Filter by spice level">
          {[1, 2, 3].map((level) => (
            <button
              key={level}
              type="button"
              className={`mq-filter-chip ${spiceFilter === level ? 'is-active-spice' : ''}`}
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

      {/* Allergen Exclusion Row (Optional) */}
      {showAllergenRow && (
        <div className="mq-filter-row" role="group" aria-label="Exclude an allergen">
          {allergenEntries.map(([allergen, count]) => {
            const active = (allergenFilter ?? []).includes(allergen);
            return (
              <button
                key={allergen}
                type="button"
                className={`mq-filter-chip ${active ? 'is-active-allergen' : ''}`}
                aria-pressed={active}
                onClick={() =>
                  onAllergenFilterChange!(
                    active
                      ? (allergenFilter ?? []).filter((a) => a !== allergen)
                      : [...(allergenFilter ?? []), allergen]
                  )
                }
                title={
                  active
                    ? `Showing dishes without ${ALLERGEN_LABELS[allergen] ?? allergen}`
                    : `Hide dishes containing ${ALLERGEN_LABELS[allergen] ?? allergen}`
                }
              >
                <span>{active ? 'No ' : ''}{ALLERGEN_LABELS[allergen] ?? allergen}</span>
                <span className="mq-chip-count">{count}</span>
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
  <div className="mq-empty-results-box" role="status">
    <h3 className="mq-empty-results-title">No dishes match &ldquo;{query}&rdquo;</h3>
    <p className="mq-empty-results-sub">Try a shorter search, or clear it to see the full menu.</p>
    <button type="button" className="mq-empty-clear-btn" onClick={onClear}>
      <X size={16} />
      <span>Clear search</span>
    </button>
  </div>
);
