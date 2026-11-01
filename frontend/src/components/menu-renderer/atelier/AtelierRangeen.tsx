import React from 'react';
import { AtelierCanvas } from './AtelierCanvas.tsx';
import { B1Cover } from './blocks/B1Cover.tsx';
import { B4Contents } from './blocks/B4Contents.tsx';
import { B5SectionOpener } from './blocks/B5SectionOpener.tsx';
import { B6ListRow } from './blocks/B6ListRow.tsx';
import { B15BackCover } from './blocks/B15BackCover.tsx';
import { useMenuFilters } from '../useMenuFilters.ts';
import { EmptyResults } from '../primitives/MenuToolbar.tsx';
import type { SignatureProps } from '../types.ts';
import './atelier.css';

export const AtelierRangeen: React.FC<SignatureProps> = ({
  restaurant,
  categories,
  readOnly,
}) => {
  const {
    activeCategoryId,
    setActiveCategoryId,
    query,
    setQuery,
    dietFilter,
    setDietFilter,
    counts,
    visible,
    navigableCategories,
    hasQuery,
  } = useMenuFilters(categories);

  return (
    <AtelierCanvas className="atelier-rangeen">
      {/* Block B1: Cover "Name Poster" */}
      <B1Cover
        restaurant={restaurant}
        onExplore={() => {
          const el = document.getElementById('atelier-contents');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Block B4: Category navigation / contents summary */}
      <B4Contents
        categories={navigableCategories}
        activeCategoryId={activeCategoryId}
        onSelectCategory={setActiveCategoryId}
        dietFilter={dietFilter}
        onDietFilterChange={setDietFilter}
        counts={counts}
        query={query}
        onQueryChange={setQuery}
      />

      {/* Main Dishes and Sections */}
      <main className="atelier-main-content">
        {visible.length === 0 ? (
          hasQuery ? (
            <EmptyResults query={query.trim()} onClear={() => setQuery('')} />
          ) : (
            <p className="atelier-empty-state" role="status">
              {counts.all === 0 ? 'This menu has no items yet.' : 'No dishes match this filter.'}
            </p>
          )
        ) : (
          visible.map((category, index) => (
            <section
              key={category.id}
              id={`mq-section-${category.id}`}
              className="atelier-category-section"
              aria-labelledby={`mq-cat-${category.id}`}
            >
              {/* Block B5: Section Opener */}
              <B5SectionOpener category={category} index={index} />

              {/* Block B6: List rows */}
              <div className="atelier-items-list">
                {category.items.map((item, itemIdx) => (
                  <B6ListRow
                    key={item.id}
                    item={item}
                    index={itemIdx}
                    readOnly={readOnly}
                  />
                ))}
              </div>
            </section>
          ))
        )}

        {/* Block B15 / B16: Back cover + About & Visit */}
        <B15BackCover restaurant={restaurant} />
      </main>
    </AtelierCanvas>
  );
};

export default AtelierRangeen;
