/**
 * MENUQR Menu Renderer — Category Heading Slots
 *
 * Small components with outsized effect: the section heading is what makes a long menu feel
 * organised rather than endless. All three render the same heading level so the document
 * outline stays correct whichever one a preset picks.
 */

import React from 'react';

export type SectionHeadingProps = {
  name: string;
  description?: string;
  itemCount: number;
  /** Anchor target, so navigation can scroll to a category. */
  id: string;
};

/** A filled ribbon. Loud and legible: suits dhabas, grills and street-food presets. */
export const RibbonSection: React.FC<SectionHeadingProps> = ({ name, description, id }) => (
  <header id={id} className="mq-stack" style={{ gap: 'var(--mq-space-2)' }}>
    <div className="mq-row" style={{ alignItems: 'center' }}>
      <h2
        className="mq-display mq-display-sm"
        style={{
          backgroundColor: 'var(--mq-color-accent)',
          color: 'var(--mq-color-accent-contrast)',
          padding: 'var(--mq-space-1) var(--mq-space-4)',
          borderRadius: 'var(--mq-radius-sm)',
        }}
      >
        {name}
      </h2>
      <span aria-hidden="true" className="mq-grow" style={{ height: 2, backgroundColor: 'var(--mq-color-border)' }} />
    </div>
    {description && <p className="mq-tagline">{description}</p>}
  </header>
);

/** Small caps over a hairline rule. The restrained editorial default. */
export const HairlineCapsSection: React.FC<SectionHeadingProps> = ({ name, description, itemCount, id }) => (
  <header id={id} className="mq-stack" style={{ gap: 'var(--mq-space-2)' }}>
    <div className="mq-row-between" style={{ alignItems: 'baseline' }}>
      <h2 className="mq-display mq-display-sm" style={{ letterSpacing: 'var(--mq-tracking-caps)' }}>
        {name}
      </h2>
      <span className="mq-price-label">{itemCount}</span>
    </div>
    <hr className="mq-divider" style={{ backgroundColor: 'var(--mq-color-accent)' }} />
    {description && <p className="mq-tagline">{description}</p>}
  </header>
);

/**
 * A cusped arch over a centred title, echoing the heritage cover.
 *
 * Kept as a slot rather than baked into one template so a heritage restaurant can pair the arch
 * heading with any dish-card layout — the old architecture coupled the two permanently.
 */
export const ArchTitleSection: React.FC<SectionHeadingProps> = ({ name, description, id }) => (
  <header id={id} className="mq-stack" style={{ gap: 'var(--mq-space-2)', alignItems: 'center', textAlign: 'center' }}>
    <svg viewBox="0 0 120 26" width="120" height="26" aria-hidden="true">
      <path
        d="M4 24 C4 10 28 2 60 2 C92 2 116 10 116 24"
        fill="none"
        stroke="var(--mq-color-accent)"
        strokeWidth="1.25"
      />
      <circle cx="60" cy="8" r="2" fill="var(--mq-color-accent)" />
    </svg>
    <h2 className="mq-display mq-display-sm">{name}</h2>
    {description && <p className="mq-tagline">{description}</p>}
  </header>
);
