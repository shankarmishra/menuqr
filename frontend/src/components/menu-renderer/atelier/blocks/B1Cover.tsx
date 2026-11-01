import React from 'react';
import { splitRestaurantName, fittedSize } from '../../slots/coverText.ts';
import { WaveDivider, CornerFlourish } from '../rangeen-art.tsx';
import { phoneLinks, instagramUrl, websiteUrl } from '../../../../utils/socialLinks.ts';
import type { RenderRestaurant } from '../../types.ts';

export interface B1CoverProps {
  restaurant: RenderRestaurant;
  onExplore?: () => void;
}

export const B1Cover: React.FC<B1CoverProps> = ({ restaurant, onExplore }) => {
  const { top, main } = splitRestaurantName(restaurant.name || '');
  const phones = phoneLinks(restaurant.phone).slice(0, 1);
  const insta = instagramUrl(restaurant.instagram);
  const web = websiteUrl(restaurant.website);
  const hasLogo = Boolean(restaurant.logoUrl);

  const mainFontSize = fittedSize(3.2, main, 12, 1.8);
  const topFontSize = fittedSize(1.1, top, 18, 0.85);

  return (
    <header className="atelier-b1-cover">
      <div className="atelier-cover-frame">
        <CornerFlourish className="atelier-corner-tl" />
        <CornerFlourish className="atelier-corner-tr" />

        {/* Top Eyebrow / Menu Label */}
        <div className="atelier-cover-eyebrow">
          <span className="atelier-eyebrow-rule" />
          <span className="atelier-eyebrow-pill">MENU</span>
          <span className="atelier-eyebrow-rule" />
        </div>

        {/* Logo if present, cleanly framed with contain */}
        {hasLogo && (
          <div className="atelier-cover-logo-wrapper">
            <div className="atelier-cover-logo-plate">
              <img
                src={restaurant.logoUrl!}
                alt={restaurant.name}
                className="atelier-cover-logo-img"
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        )}

        {/* Name Poster Typography */}
        <div className="atelier-cover-title-group">
          {top && (
            <span
              className="atelier-cover-top-line"
              style={{ fontSize: topFontSize }}
            >
              {top}
            </span>
          )}
          <h1
            className="atelier-cover-main-line"
            style={{ fontSize: mainFontSize }}
          >
            {main}
          </h1>
        </div>

        {/* Truthful Tagline (only printed when owner provided it) */}
        {restaurant.tagline && (
          <p className="atelier-cover-tagline">
            &bull; {restaurant.tagline} &bull;
          </p>
        )}

        {/* Honest City & Cuisine */}
        {(restaurant.city || restaurant.cuisine) && (
          <div className="atelier-cover-meta-chips">
            {restaurant.city && (
              <span className="atelier-meta-chip">
                {restaurant.city}
              </span>
            )}
            {restaurant.cuisine && (
              <span className="atelier-meta-chip atelier-meta-chip-accent">
                {restaurant.cuisine}
              </span>
            )}
          </div>
        )}

        <WaveDivider className="atelier-cover-divider" />

        {/* Action Links (only when valid contact values exist) */}
        {(phones.length > 0 || insta || web) && (
          <div className="atelier-cover-actions">
            {phones.length > 0 && (
              <a
                href={`tel:${phones[0].tel}`}
                className="atelier-cover-action-btn"
                aria-label={`Call ${phones[0].display}`}
              >
                <span>Call</span>
              </a>
            )}
            {insta && (
              <a
                href={insta}
                target="_blank"
                rel="noopener noreferrer"
                className="atelier-cover-action-btn"
                aria-label="Instagram"
              >
                <span>Follow</span>
              </a>
            )}
            {web && (
              <a
                href={web}
                target="_blank"
                rel="noopener noreferrer"
                className="atelier-cover-action-btn"
              >
                <span>Website</span>
              </a>
            )}
          </div>
        )}

        {/* Jump button */}
        <div className="atelier-cover-explore-wrap">
          <a
            href="#atelier-contents"
            onClick={(e) => {
              if (onExplore) {
                e.preventDefault();
                onExplore();
              }
            }}
            className="atelier-cover-explore-btn"
          >
            <span>Explore Menu</span>
            <span className="atelier-explore-arrow">&darr;</span>
          </a>
        </div>
      </div>
    </header>
  );
};

export default B1Cover;
