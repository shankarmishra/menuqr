import React from 'react';
import type { RenderCategory } from '../../types.ts';
import type { DietFilter } from '../../primitives/MenuToolbar.tsx';

export interface B4ContentsProps {
  categories: RenderCategory[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
  dietFilter: DietFilter;
  onDietFilterChange: (filter: DietFilter) => void;
  counts: { all: number; veg: number; nonVeg: number };
  query: string;
  onQueryChange: (q: string) => void;
}

export const B4Contents: React.FC<B4ContentsProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
  dietFilter,
  onDietFilterChange,
  counts,
  query,
  onQueryChange,
}) => {
  const hasBothDiets = counts.veg > 0 && counts.nonVeg > 0;

  return (
    <nav id="atelier-contents" className="atelier-b4-contents" aria-label="Menu navigation">
      {/* Search Input */}
      <div className="atelier-search-bar">
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search dishes"
          className="atelier-search-input"
          aria-label="Search dishes"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            className="atelier-search-clear"
            aria-label="Clear search"
          >
            Clear
          </button>
        )}
      </div>

      {/* Diet Filter Chips */}
      {hasBothDiets && (
        <div className="atelier-diet-chips" role="radiogroup" aria-label="Diet filter">
          <button
            type="button"
            onClick={() => onDietFilterChange('all')}
            className={`atelier-diet-pill ${dietFilter === 'all' ? 'is-active' : ''}`}
            aria-label="All dishes"
          >
            All ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => onDietFilterChange('veg')}
            className={`atelier-diet-pill is-veg ${dietFilter === 'veg' ? 'is-active' : ''}`}
            aria-label="Vegetarian dishes"
          >
            Veg ({counts.veg})
          </button>
          <button
            type="button"
            onClick={() => onDietFilterChange('non-veg')}
            className={`atelier-diet-pill is-nonveg ${dietFilter === 'non-veg' ? 'is-active' : ''}`}
            aria-label="Non-vegetarian dishes"
          >
            Non-veg ({counts.nonVeg})
          </button>
        </div>
      )}

      {/* Horizontal scrolling Category Tabs */}
      <div className="atelier-cat-scroll" role="tablist">
        {categories.map((cat) => {
          const isActive = activeCategoryId === cat.id;
          return (
            <a
              key={cat.id}
              href={`#mq-section-${cat.id}`}
              onClick={(e) => {
                e.preventDefault();
                onSelectCategory(cat.id);
                const el = document.getElementById(`mq-section-${cat.id}`);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              role="tab"
              aria-selected={isActive}
              className={`atelier-cat-tab ${isActive ? 'is-active' : ''}`}
            >
              <span className="atelier-cat-tab-name">{cat.name}</span>
              <span className="atelier-cat-tab-count">({cat.items.length})</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
};

export default B4Contents;
