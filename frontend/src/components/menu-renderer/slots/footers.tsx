/**
 * MENUQR Menu Renderer — Footer Slots
 *
 * The end of the menu is where a diner looks for a phone number or an address, so the contact
 * block is real content rather than decoration. Phone and address are rendered as `tel:` and
 * maps links because the diner is on a phone, at a table, and tapping is the whole point.
 */

import React from 'react';
import type { RenderRestaurant } from '../types.ts';

export type FooterProps = { restaurant: RenderRestaurant };

/** Strip anything that is not a digit or a leading plus, so `tel:` links dial correctly. */
function telHref(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '');
  return `tel:${cleaned}`;
}

export const ContactBlockFooter: React.FC<FooterProps> = ({ restaurant }) => {
  const location = [restaurant.address, restaurant.city, restaurant.state].filter(Boolean).join(', ');

  return (
    <footer className="mq-stack" style={{ paddingBlock: 'var(--mq-space-8)', gap: 'var(--mq-space-3)' }}>
      <hr className="mq-divider" />
      <h2 className="mq-eyebrow">{restaurant.name}</h2>

      {/*
       * Calling and navigating are the two actions a diner actually takes from a menu footer, so
       * these are full-width tap targets rather than inline links in a sentence. At the table,
       * on a phone, a 17px-tall phone number is a miss waiting to happen.
       */}
      <div className="mq-stack" style={{ gap: 'var(--mq-space-1)' }}>
        {restaurant.phone && (
          <a className="mq-contact-link" href={telHref(restaurant.phone)}>
            <span className="mq-price-label">Call</span>
            <span>{restaurant.phone}</span>
          </a>
        )}
        {location && (
          <a
            className="mq-contact-link"
            href={`https://maps.google.com/?q=${encodeURIComponent(`${restaurant.name} ${location}`)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="mq-price-label">Find us</span>
            <span>{location}</span>
          </a>
        )}
        {restaurant.openingHours && <p className="mq-tagline">{restaurant.openingHours}</p>}
      </div>
    </footer>
  );
};

/** A single restrained mark. For presets where the page itself is the statement. */
export const MinimalMarkFooter: React.FC<FooterProps> = ({ restaurant }) => (
  <footer
    className="mq-stack"
    style={{ paddingBlock: 'var(--mq-space-10)', alignItems: 'center', gap: 'var(--mq-space-2)' }}
  >
    <span
      aria-hidden="true"
      style={{ width: '2.5rem', height: 1, backgroundColor: 'var(--mq-color-accent)' }}
    />
    <p className="mq-eyebrow">{restaurant.name}</p>
    {restaurant.phone && (
      <a className="mq-contact-link" href={telHref(restaurant.phone)}>
        {restaurant.phone}
      </a>
    )}
  </footer>
);
