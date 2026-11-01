import React from 'react';
import type { RenderRestaurant } from '../../types.ts';
import { phoneLinks, instagramUrl, instagramHandle, facebookUrl, websiteUrl, websiteLabel } from '../../../../utils/socialLinks.ts';
import { WaveDivider, FestiveStamp } from '../rangeen-art.tsx';

export interface B15BackCoverProps {
  restaurant: RenderRestaurant;
}

export const B15BackCover: React.FC<B15BackCoverProps> = ({ restaurant }) => {
  const phones = phoneLinks(restaurant.phone).slice(0, 2);
  const insta = instagramUrl(restaurant.instagram);
  const fb = facebookUrl(restaurant.facebook);
  const web = websiteUrl(restaurant.website);
  const fullAddress = [restaurant.address, restaurant.city, restaurant.state, (restaurant as any).pincode]
    .filter(Boolean)
    .join(', ');
  const storyText = (restaurant as any).story || (restaurant as any).description;
  const fssai = (restaurant as any).fssai;
  const priceNote = (restaurant as any).priceNote;

  const external = { target: '_blank', rel: 'noopener noreferrer' } as const;

  return (
    <footer className="atelier-b15-back-cover" aria-label="Location">
      <WaveDivider className="atelier-back-top-divider" />

      <div className="atelier-back-frame">
        {/* Name and Tagline */}
        <div className="atelier-back-brand">
          <h2 className="atelier-back-name">{restaurant.name}</h2>
          {restaurant.tagline && (
            <p className="atelier-back-tagline">&bull; {restaurant.tagline} &bull;</p>
          )}
        </div>

        {/* Story if provided by owner */}
        {storyText && (
          <div className="atelier-back-story">
            <p className="atelier-back-story-text">{storyText}</p>
          </div>
        )}

        {/* Location & Hours Details */}
        {(fullAddress || restaurant.openingHours) && (
          <div className="atelier-back-section">
            <h3 className="atelier-back-heading">Location</h3>
            {fullAddress && (
              <p className="atelier-back-address">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`}
                  className="atelier-back-link"
                  {...external}
                >
                  {fullAddress}
                </a>
              </p>
            )}
            {restaurant.openingHours && (
              <p className="atelier-back-hours">
                {restaurant.openingHours}
              </p>
            )}
          </div>
        )}

        {/* Direct Phone Links */}
        {phones.length > 0 && (
          <div className="atelier-back-section">
            <h3 className="atelier-back-heading">Call</h3>
            <div className="atelier-back-phones">
              {phones.map((phone) => (
                <a
                  key={phone.tel}
                  href={`tel:${phone.tel}`}
                  className="atelier-back-phone-btn"
                >
                  {phone.display}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Social and Website Links */}
        {(insta || fb || web) && (
          <div className="atelier-back-section">
            <h3 className="atelier-back-heading">Follow</h3>
            <div className="atelier-back-links">
              {insta && (
                <a
                  href={insta}
                  className="atelier-back-social-link"
                  aria-label="Instagram"
                  {...external}
                >
                  @{instagramHandle(restaurant.instagram)}
                </a>
              )}
              {fb && (
                <a
                  href={fb}
                  className="atelier-back-social-link"
                  {...external}
                >
                  Facebook
                </a>
              )}
              {web && (
                <a
                  href={web}
                  className="atelier-back-social-link"
                  {...external}
                >
                  {websiteLabel(restaurant.website)}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Price Note if provided */}
        {priceNote && (
          <p className="atelier-back-note">{priceNote}</p>
        )}

        {/* FSSAI if provided */}
        {fssai && (
          <div className="atelier-back-fssai">
            <span>{fssai}</span>
          </div>
        )}

        {/* Decorative Festive Stamp */}
        <div className="atelier-back-seal-wrap">
          <FestiveStamp className="atelier-back-stamp" />
        </div>
      </div>
    </footer>
  );
};

export default B15BackCover;
