import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Sparkles, Phone, MapPin, Utensils } from 'lucide-react';
import type { ArtisanGraphicTheme } from '../../../../data/artisanGraphicThemes';
import type { MenuPageDefinition } from '../../../../utils/menuPaginator';

export interface ArtisanGraphicTemplateProps {
  theme: ArtisanGraphicTheme;
  page: MenuPageDefinition;
  restaurant: {
    name: string;
    tagline?: string;
    cuisine?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    openingHours?: string;
    logo?: string;
    slug?: string;
    estYear?: string | number;
  };
  layoutMode?: 'single-column' | 'two-column';
  className?: string;
  isPrintPreview?: boolean;
  onAddToCart?: (item: any, priceStr?: string, variant?: string) => void;
  getItemQuantity?: (itemId: string, variant?: string) => number;
}

// Authentic FSSAI-style dietary indicator badge
function DietBadge({ type, colors }: { type?: string; colors: ArtisanGraphicTheme['colors'] }) {
  const isVeg = type === 'veg' || type === 'vegan';
  const borderColor = isVeg ? colors.badgeVeg : colors.badgeNonVeg;

  return (
    <span
      className="inline-flex items-center justify-center w-3.5 h-3.5 border rounded-xs shrink-0 self-center"
      style={{ borderColor }}
      title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: borderColor }}
      />
    </span>
  );
}

export function ArtisanGraphicTemplate({
  theme,
  page,
  restaurant,
  layoutMode = 'two-column',
  className = '',
  isPrintPreview = false,
  onAddToCart,
  getItemQuantity,
}: ArtisanGraphicTemplateProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    const digitalMenuUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/m/${restaurant.slug || 'demo'}`
      : `https://menusqr.com/m/${restaurant.slug || 'demo'}`;

    QRCode.toDataURL(digitalMenuUrl, {
      width: 140,
      margin: 1,
      color: {
        dark: theme.colors.heading,
        light: '#00000000', // transparent background
      },
    })
      .then(url => setQrCodeDataUrl(url))
      .catch(() => {});
  }, [restaurant.slug, theme.colors.heading]);

  const { colors, typography, safeZoneMargins } = theme;

  // -------------------------------------------------------------
  // RENDER COVER PAGE (PAGE 1)
  // -------------------------------------------------------------
  if (page.pageType === 'cover') {
    return (
      <div
        className={`relative w-full aspect-[1/1.414] overflow-hidden select-none bg-stone-900 ${isPrintPreview ? 'shadow-none' : 'shadow-2xl'} transition-all ${className}`}
        style={{
          backgroundImage: `url(${theme.bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          fontFamily: typography.bodyFont,
        }}
      >
        {/* Soft Ambient Vignette Scrim */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: theme.colors.scrimOverlay }}
        />

        {/* Center Safe-Zone Content */}
        <div
          className="relative h-full flex flex-col justify-between items-center text-center z-10"
          style={{
            paddingTop: safeZoneMargins.top,
            paddingBottom: safeZoneMargins.bottom,
            paddingLeft: safeZoneMargins.left,
            paddingRight: safeZoneMargins.right,
          }}
        >
          {/* Top Crest / Establishment Badge */}
          <div className="flex flex-col items-center space-y-2">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase border backdrop-blur-xs"
              style={{
                color: colors.subheading,
                borderColor: colors.border,
                backgroundColor: 'rgba(255,255,255,0.1)',
              }}
            >
              <Sparkles size={12} style={{ color: colors.ornament }} />
              <span>Est. {restaurant.estYear || '2024'} • Culinary Collection</span>
            </div>

            {/* Restaurant Logo / Monogram Circle */}
            {restaurant.logo ? (
              <img
                src={restaurant.logo}
                alt={restaurant.name}
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-full border-2 shadow-md my-2"
                style={{ borderColor: colors.subheading }}
              />
            ) : (
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 flex items-center justify-center font-bold text-xl sm:text-2xl shadow-md my-2"
                style={{
                  borderColor: colors.subheading,
                  color: colors.heading,
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  fontFamily: typography.headingFont,
                }}
              >
                {restaurant.name?.charAt(0) || 'M'}
              </div>
            )}
          </div>

          {/* Center Title & Aesthetic Menu Typography */}
          <div className="my-auto py-4 flex flex-col items-center max-w-[85%]">
            <h1
              className="text-2xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-wider leading-tight drop-shadow-xs"
              style={{
                color: colors.heading,
                fontFamily: typography.headingFont,
              }}
            >
              {restaurant.name}
            </h1>

            {/* Subtle Divider Motif */}
            <div className="flex items-center justify-center gap-3 w-48 my-3">
              <span className="h-px flex-1" style={{ backgroundColor: colors.border }} />
              <Utensils size={14} style={{ color: colors.ornament }} />
              <span className="h-px flex-1" style={{ backgroundColor: colors.border }} />
            </div>

            <p
              className="text-xs sm:text-sm md:text-base font-medium tracking-wide italic opacity-90 max-w-sm"
              style={{ color: colors.description }}
            >
              {restaurant.tagline || restaurant.cuisine || 'Fine Culinary Experience & Crafted Delights'}
            </p>

            <div
              className="mt-6 px-6 py-1.5 border-y-2 text-sm sm:text-lg tracking-[0.25em] uppercase font-bold"
              style={{
                borderColor: colors.subheading,
                color: colors.subheading,
                fontFamily: typography.headingFont,
              }}
            >
              M E N U
            </div>
          </div>

          {/* Bottom QR Code & Location Information */}
          <div className="flex flex-col items-center space-y-3 w-full border-t pt-3" style={{ borderColor: colors.border }}>
            {qrCodeDataUrl && (
              <div className="flex flex-col items-center">
                <div
                  className="p-1.5 rounded-lg bg-white/90 shadow-sm border"
                  style={{ borderColor: colors.border }}
                >
                  <img src={qrCodeDataUrl} alt="Menu QR" className="w-16 h-16 sm:w-20 sm:h-20" />
                </div>
                <span
                  className="text-[10px] sm:text-xs tracking-wider uppercase font-semibold mt-1 opacity-80"
                  style={{ color: colors.text }}
                >
                  Scan for Digital Menu
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] sm:text-xs opacity-85" style={{ color: colors.text }}>
              {restaurant.address && (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={11} style={{ color: colors.ornament }} />
                  {restaurant.address}{restaurant.city ? `, ${restaurant.city}` : ''}
                </span>
              )}
              {restaurant.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone size={11} style={{ color: colors.ornament }} />
                  {restaurant.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER INNER MENU BODY PAGES (PAGES 2..N)
  // -------------------------------------------------------------
  return (
    <div
      className={`relative w-full aspect-[1/1.414] overflow-hidden select-none bg-stone-900 ${isPrintPreview ? 'shadow-none' : 'shadow-2xl'} transition-all ${className}`}
      style={{
        backgroundImage: `url(${theme.bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: typography.bodyFont,
      }}
    >
      {/* Soft Ambient Vignette Scrim */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: theme.colors.scrimOverlay }}
      />

      {/* Center Safe-Zone Content Area */}
      <div
        className="relative h-full flex flex-col justify-between z-10"
        style={{
          paddingTop: safeZoneMargins.top,
          paddingBottom: safeZoneMargins.bottom,
          paddingLeft: safeZoneMargins.left,
          paddingRight: safeZoneMargins.right,
        }}
      >
        {/* Running Top Page Header */}
        <div
          className="flex items-center justify-between pb-2 border-b text-[10px] sm:text-xs tracking-wider uppercase font-semibold shrink-0 gap-2"
          style={{ borderColor: colors.border, color: colors.subheading }}
        >
          <span className="truncate max-w-[48%]" style={{ fontFamily: typography.headingFont }}>
            {restaurant.name}
          </span>
          <span className="text-[9.5px] sm:text-[10px] tracking-widest opacity-80 truncate max-w-[50%] text-right">
            {page.runningTitle || 'Specialties'}
          </span>
        </div>

        {/* Page Content: Categories & Dishes */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden my-2 flex flex-col justify-start space-y-2.5 pr-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {page.sections.map((section, sIdx) => (
            <div key={`${section.categoryId}-${sIdx}`} className="space-y-1.5 min-w-0">
              {/* Category Header */}
              <div className="flex items-center gap-2 pt-0.5 pb-0.5 min-w-0">
                <span
                  className="text-xs sm:text-sm font-bold uppercase tracking-widest shrink-0 truncate max-w-[75%]"
                  style={{
                    color: colors.subheading,
                    fontFamily: typography.subheadingFont,
                  }}
                >
                  {section.categoryName} {section.isContinuation ? '(Cont.)' : ''}
                </span>
                <span className="h-px flex-1 opacity-40" style={{ backgroundColor: colors.border }} />
                <span className="text-[10px] opacity-60 font-serif" style={{ color: colors.ornament }}>❦</span>
              </div>

              {/* Items Grid (Single-Column for mobile/compact, Two-Column for desktop/print) */}
              <div
                className={
                  layoutMode === 'two-column'
                    ? 'grid grid-cols-2 gap-x-3 sm:gap-x-5 gap-y-2'
                    : 'space-y-2'
                }
              >
                {section.items.map((item) => (
                  <div key={item.id} className="flex flex-col group min-w-0">
                    {/* Item Title, Dots Leader & Price */}
                    <div className="flex items-baseline gap-1.5 w-full min-w-0">
                      {/* Veg / Non-Veg Indicator */}
                      <DietBadge type={item.dietType} colors={colors} />

                      {/* Dish Name */}
                      <span
                        className="text-xs sm:text-[13px] font-semibold tracking-wide leading-tight truncate min-w-0"
                        style={{ color: colors.text }}
                        title={item.name}
                      >
                        {item.name}
                      </span>

                      {/* Dotted Leader Line */}
                      <span
                        className="flex-1 border-b border-dotted mx-1 mb-1 opacity-30 min-w-[6px]"
                        style={{ borderColor: colors.border }}
                      />

                      {/* Pricing Tag */}
                      <div className="shrink-0 text-right whitespace-nowrap ml-auto">
                        {item.halfPrice || item.fullPrice ? (
                          <div className="inline-flex items-center gap-1.5 text-[9.5px] sm:text-xs font-semibold">
                            {item.halfPrice && (
                              <span style={{ color: colors.priceHalfFull }}>
                                H: ₹{item.halfPrice}
                              </span>
                            )}
                            {item.fullPrice && (
                              <span style={{ color: colors.price }} className="font-bold">
                                F: ₹{item.fullPrice}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span
                            className="text-xs sm:text-[13px] font-bold"
                            style={{
                              color: colors.price,
                              fontFamily: typography.priceFont,
                            }}
                          >
                            ₹{item.price}
                          </span>
                        )}
                        {onAddToCart && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const p = item.price || item.fullPrice || item.halfPrice || 0;
                              onAddToCart(item, `₹${p}`);
                            }}
                            className="ml-1.5 px-2 py-0.5 rounded text-[10px] font-bold transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-xs inline-flex items-center gap-0.5"
                            style={{
                              backgroundColor: colors.subheading,
                              color: '#FFFFFF',
                            }}
                            title={`Add ${item.name} to order`}
                          >
                            <span>+</span>
                            {getItemQuantity && getItemQuantity(item.id) > 0 && (
                              <span className="ml-1 px-1 rounded-full bg-white text-black font-extrabold text-[9px]">
                                {getItemQuantity(item.id)}
                              </span>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Dish Description */}
                    {item.description && (
                      <p
                        className="text-[10px] sm:text-[11px] leading-tight line-clamp-2 mt-0.5 pl-5 italic opacity-85"
                        style={{ color: colors.description }}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Running Bottom Page Footer */}
        <div
          className="flex items-center justify-between pt-2 border-t text-[10px] sm:text-xs opacity-75 shrink-0"
          style={{ borderColor: colors.border, color: colors.text }}
        >
          <span>All prices exclusive of taxes • Freshly prepared</span>
          <span className="font-semibold tracking-widest uppercase">
            Page {page.pageNumber} of {page.totalPages}
          </span>
        </div>
      </div>
    </div>
  );
}
