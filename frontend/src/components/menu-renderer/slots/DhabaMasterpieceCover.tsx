import React from 'react';
import { Phone, Globe, MessageCircle } from 'lucide-react';
import { facebookUrl, firstPhone, instagramHandle, instagramUrl, phoneLinks, websiteLabel, websiteUrl } from '../../../utils/socialLinks.ts';
import { fittedSize, splitRestaurantName } from './coverText.ts';
import type { SlotProps } from '../types.ts';

/**
 * The Dhaba poster cover.
 *
 * Every word on it comes from the restaurant's own details or is a neutral label ("Menu", "View
 * menu"). Nothing is invented: there is no fallback name, phone number, website or Instagram
 * account, and no claim about the food. A contact line the owner has not filled in is simply not
 * drawn.
 */

function InstagramIcon({ size = 13, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 13, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

const DISPLAY_FONT = "'Anton', 'Oswald', 'Mukta', Impact, 'Arial Narrow', sans-serif";

export const DhabaMasterpieceCover: React.FC<SlotProps> = ({ restaurant, categories, compact }) => {
  const name = restaurant.name.trim();
  const { top, main } = splitRestaurantName(name);

  const items = categories.flatMap((category) => category.items);
  const hasVeg = items.some((item) => item.dietType === 'veg' || item.dietType === 'vegan');
  const hasNonVeg = items.some((item) => item.dietType === 'non-veg');

  const phones = phoneLinks(restaurant.phone).slice(0, 2);
  const whatsapp = firstPhone(restaurant.phone)?.whatsapp || '';
  const website = websiteUrl(restaurant.website);
  const instagram = instagramUrl(restaurant.instagram);
  const facebook = facebookUrl(restaurant.facebook);
  const subtitle = (restaurant.tagline || restaurant.cuisine || '').trim();
  const hasContact = phones.length > 0 || Boolean(website) || Boolean(instagram) || Boolean(whatsapp) || Boolean(facebook);

  const scrollToMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    const target =
      document.getElementById('menu-content') ||
      document.querySelector('.mq-nav') ||
      document.querySelector('.mq-toolbar') ||
      document.querySelector('main');
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };

  const dishSize = compact ? 110 : 140;
  const bottomDishSize = compact ? 120 : 155;
  const mascotWidth = compact ? 98 : 118;

  return (
    <header
      className="relative w-full overflow-hidden select-none bg-[#FAF7F2] text-[#1A1C1B]"
      style={{
        backgroundImage: "url('/assets/dhaba-cover/white_stucco_wall.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        paddingTop: compact ? '10px' : '14px',
        paddingBottom: compact ? '14px' : '20px',
      }}
    >
      {/* Four corner dishes. Decorative artwork, so hidden from assistive technology rather than
          labelled as if they were items on this restaurant's menu. */}
      <div className="absolute -top-7 -left-7 sm:-top-9 sm:-left-9 pointer-events-none z-10" aria-hidden="true">
        <img
          src="/assets/dhaba-cover/paneer_tikka_masala.webp"
          alt=""
          width={dishSize}
          height={dishSize}
          className="object-contain filter drop-shadow-[0_12px_22px_rgba(0,0,0,0.25)] -rotate-3"
          style={{ width: dishSize, height: dishSize }}
          loading="eager"
          decoding="async"
        />
      </div>
      <div className="absolute -top-7 -right-7 sm:-top-9 sm:-right-9 pointer-events-none z-10" aria-hidden="true">
        <img
          src="/assets/dhaba-cover/dal_tadka.webp"
          alt=""
          width={dishSize}
          height={dishSize}
          className="object-contain filter drop-shadow-[0_12px_22px_rgba(0,0,0,0.25)] rotate-3"
          style={{ width: dishSize, height: dishSize }}
          loading="eager"
          decoding="async"
        />
      </div>
      <div className="absolute -bottom-8 -left-8 sm:-bottom-10 sm:-left-10 pointer-events-none z-10" aria-hidden="true">
        <img
          src="/assets/dhaba-cover/tandoori_skewers.webp"
          alt=""
          width={bottomDishSize}
          height={bottomDishSize}
          className="object-contain filter drop-shadow-[0_14px_24px_rgba(0,0,0,0.28)] rotate-2"
          style={{ width: bottomDishSize, height: bottomDishSize }}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="absolute -bottom-8 -right-8 sm:-bottom-10 sm:-right-10 pointer-events-none z-10" aria-hidden="true">
        <img
          src="/assets/dhaba-cover/roasted_chicken_platter.webp"
          alt=""
          width={bottomDishSize}
          height={bottomDishSize}
          className="object-contain filter drop-shadow-[0_14px_24px_rgba(0,0,0,0.28)] -rotate-2"
          style={{ width: bottomDishSize, height: bottomDishSize }}
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="relative z-20 flex flex-col items-center text-center px-4 max-w-[370px] sm:max-w-[430px] mx-auto">
        {/* Diet marks: shown only for the kinds of dish that are actually on this menu. */}
        {(hasVeg || hasNonVeg) && (
          <div className="flex items-center gap-2 mb-1.5">
            {hasNonVeg && (
              <div
                className="w-5 h-5 border-[1.6px] border-[#B71C1C] rounded-[3px] bg-white flex items-center justify-center shadow-xs"
                role="img"
                aria-label="Non-vegetarian dishes on this menu"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#C62828]" />
              </div>
            )}
            {hasVeg && (
              <div
                className="w-5 h-5 border-[1.6px] border-[#1B5E20] rounded-[3px] bg-white flex items-center justify-center shadow-xs"
                role="img"
                aria-label="Vegetarian dishes on this menu"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" />
              </div>
            )}
          </div>
        )}

        {/* The restaurant's own logo when it has one; otherwise a generic chef illustration. The
            logo is contained, never cropped, on a round plate so a wide or tall logo still fits. */}
        <div className="relative pointer-events-none z-10 -mb-5 sm:-mb-6" style={{ width: mascotWidth }}>
          {restaurant.logoUrl ? (
            <div
              className="mx-auto rounded-full bg-white shadow-[0_8px_16px_rgba(0,0,0,0.22)] flex items-center justify-center overflow-hidden"
              style={{ width: mascotWidth, height: mascotWidth, padding: Math.round(mascotWidth * 0.1) }}
            >
              <img
                src={restaurant.logoUrl}
                alt={name}
                className="max-w-full max-h-full object-contain"
                loading="eager"
                decoding="async"
              />
            </div>
          ) : (
            <img
              src="/assets/dhaba-cover/chef_mascot.webp"
              alt=""
              aria-hidden="true"
              width={mascotWidth}
              height={Math.round(mascotWidth * 1.147)}
              className="w-full h-auto object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.22)]"
              loading="eager"
              decoding="async"
            />
          )}
        </div>

        {/* Name plaque */}
        <div className="relative z-20 w-full flex items-center justify-center my-0.5">
          <div
            className="relative flex items-center justify-center"
            style={{ width: compact ? '260px' : '298px', height: compact ? '150px' : '172px' }}
          >
            <img
              src="/assets/dhaba-cover/cartouche_plaque.svg"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
            />
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-2 pt-3">
              <h1 className="sr-only">{name}</h1>
              {top && (
                <span
                  aria-hidden="true"
                  className="font-black uppercase leading-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                  style={{
                    fontSize: fittedSize(compact ? 1.1 : 1.3, top, 12, 0.8),
                    fontFamily: "'Cinzel', 'Playfair Display', 'Mukta', serif",
                    letterSpacing: '0.1em',
                  }}
                >
                  {top}
                </span>
              )}
              <span
                aria-hidden="true"
                className="font-black uppercase leading-none my-0.5"
                style={{
                  fontSize: fittedSize(compact ? 1.65 : 1.95, main, 10, 0.95),
                  fontFamily: DISPLAY_FONT,
                  color: '#FFA726',
                  textShadow: '0 2px 5px rgba(0,0,0,0.9), 0 0 10px rgba(255,167,38,0.45)',
                  letterSpacing: '0.04em',
                  overflowWrap: 'anywhere',
                }}
              >
                {main}
              </span>
              <div className="flex items-center justify-center gap-2 mt-1 text-[#FFD54F]" aria-hidden="true">
                <span className="w-6 sm:w-8 h-[1.5px] bg-[#FFD54F]/70" />
                <span className="text-[10px] sm:text-[11px] font-black tracking-[0.24em] uppercase text-[#FFE082] drop-shadow-sm">MENU</span>
                <span className="w-6 sm:w-8 h-[1.5px] bg-[#FFD54F]/70" />
              </div>
            </div>
          </div>
        </div>

        {subtitle && (
          <p className="mt-1 text-xs sm:text-sm font-black uppercase tracking-wider text-[#E65100] text-balance">{subtitle}</p>
        )}

        <div className="mt-1.5 mb-1.5">
          <a
            href="#menu-content"
            onClick={scrollToMenu}
            className="inline-flex items-center justify-center px-7 py-2 rounded-full bg-gradient-to-r from-[#FF9800] via-[#F57C00] to-[#E65100] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-600/35 hover:brightness-110 active:scale-95 transition-all cursor-pointer border border-amber-300/40"
          >
            View menu
          </a>
        </div>

        {hasContact && (
          <div className="w-full space-y-1 pt-0.5 text-center">
            {phones.map((phone) => (
              <div key={phone.tel}>
                <a
                  href={`tel:${phone.tel}`}
                  className="inline-flex items-center gap-1.5 text-sm sm:text-base font-black text-[#111827] hover:text-[#E65100] tracking-wider transition-colors"
                >
                  <Phone size={13} className="text-[#E65100] shrink-0" />
                  <span>{phone.display}</span>
                </a>
              </div>
            ))}

            {website && (
              <div>
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#4B5563] hover:text-[#E65100] tracking-widest uppercase transition-colors"
                >
                  <Globe size={11} className="text-[#4B5563] shrink-0" />
                  <span>{websiteLabel(restaurant.website)}</span>
                </a>
              </div>
            )}

            {(instagram || whatsapp || facebook) && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                {instagram && (
                  <a
                    href={instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 border border-stone-300/80 text-[10px] font-bold text-[#C13584] shadow-xs hover:border-[#C13584] transition-colors"
                    title="Follow on Instagram"
                  >
                    <InstagramIcon size={12} className="text-[#C13584]" />
                    <span>@{instagramHandle(restaurant.instagram)}</span>
                  </a>
                )}
                {whatsapp && (
                  <a
                    href={`https://wa.me/${whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 border border-stone-300/80 text-[10px] font-bold text-[#25D366] shadow-xs hover:border-[#25D366] transition-colors"
                    title="Chat on WhatsApp"
                  >
                    <MessageCircle size={12} className="text-[#25D366]" />
                    <span>WhatsApp</span>
                  </a>
                )}
                {facebook && (
                  <a
                    href={facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 border border-stone-300/80 text-[10px] font-bold text-[#1877F2] shadow-xs hover:border-[#1877F2] transition-colors"
                    title="Follow on Facebook"
                  >
                    <FacebookIcon size={12} className="text-[#1877F2]" />
                    <span>Facebook</span>
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
