import React from 'react';
import type { RenderCategory } from '../../types.ts';
import { WaveDivider } from '../rangeen-art.tsx';

export interface B5SectionOpenerProps {
  category: RenderCategory;
  index: number;
}

export const B5SectionOpener: React.FC<B5SectionOpenerProps> = ({ category, index }) => {
  const sectionNumber = String(index + 1).padStart(2, '0');
  const hindiName = (category as any).i18n?.hi?.name || (category as any).hindiName;

  return (
    <header className="atelier-b5-section-opener">
      <div className="atelier-section-badge-row">
        <span className="atelier-section-num-pill">
          Section {sectionNumber}
        </span>
        <span className="atelier-section-count-pill">
          {category.items.length} dishes
        </span>
      </div>

      <h2 id={`mq-cat-${category.id}`} className="atelier-section-title">
        {category.name}
      </h2>

      {hindiName && (
        <span className="atelier-section-hindi-title">
          {hindiName}
        </span>
      )}

      {category.description && (
        <p className="atelier-section-desc">
          {category.description}
        </p>
      )}

      <WaveDivider className="atelier-section-divider" />
    </header>
  );
};

export default B5SectionOpener;
