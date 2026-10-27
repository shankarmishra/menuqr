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

  // Dynamic Background Image Selection per Page (Cover vs Inner Page Rotation)
  const pageBg = (() => {
    if (page.pageType === 'cover') {
      return theme.coverBgImage || theme.bgImage;
    }
    if (theme.pageBgImages && theme.pageBgImages.length > 0) {
      const innerIdx = Math.max(0, page.pageNumber - 2);
      return theme.pageBgImages[innerIdx % theme.pageBgImages.length];
    }
    return theme.bgImage;
  })();

  // Dynamic Safe-Zone calculation (mirrors left/right for flipped facing pages)
  const isFacingPage = typeof pageBg === 'string' && pageBg.includes('-facing');
  const isSidebarTheme = theme.id === 'tuscan-italian' || theme.id === 'asian-dimsum';
  const activeSafeZone = isFacingPage && isSidebarTheme
    ? {
        top: safeZoneMargins.top,
        bottom: safeZoneMargins.bottom,
        left: safeZoneMargins.right,
        right: safeZoneMargins.left,
      }
    : safeZoneMargins;

  // Authoritative contrast detection
  const isDarkTheme = ['rustic-bbq', 'speakeasy-cocktails', 'black-gold-luxury', 'chalkboard-bistro', 'firepot-dragon'].includes(theme.id);
  const textShadowStyle = isDarkTheme ? '0 1px 2px rgba(0,0,0,0.85)' : '0 1px 1px rgba(255,255,255,0.75)';

  // -------------------------------------------------------------
  // RENDER COVER PAGE (PAGE 1)
  // -------------------------------------------------------------
  if (page.pageType === 'cover') {
    return (
      <div
        className={`relative w-full aspect-[9/16] overflow-hidden select-none bg-stone-900 ${isPrintPreview ? 'shadow-none' : 'shadow-2xl'} transition-all ${className}`}
        style={{
          backgroundImage: `url(${pageBg})`,
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
            paddingTop: activeSafeZone.top,
            paddingBottom: activeSafeZone.bottom,
            paddingLeft: activeSafeZone.left,
            paddingRight: activeSafeZone.right,
          }}
        >
          {/* Top Crest & Brand Logo */}
          <div className="flex flex-col items-center space-y-1 sm:space-y-2 shrink-0">
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold tracking-widest uppercase border backdrop-blur-xs"
              style={{
                color: colors.subheading,
                borderColor: colors.border,
                backgroundColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <Sparkles size={11} style={{ color: colors.ornament }} />
              <span>Est. {restaurant.estYear || '2024'} • Culinary Collection</span>
            </div>

            {/* Restaurant Brand Logo or Elegant Culinary Crest */}
            {restaurant.logo ? (
              <div className="my-1 sm:my-2 flex items-center justify-center max-w-[130px] max-h-[60px] sm:max-w-[170px] sm:max-h-[85px] px-2">
                <img
                  src={restaurant.logo}
                  alt={restaurant.name}
                  className="max-h-full max-w-full object-contain filter drop-shadow-md transition-transform"
                />
              </div>
            ) : (
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border flex items-center justify-center my-1 sm:my-2 shadow-xs"
                style={{
                  borderColor: colors.border,
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: colors.subheading,
                }}
              >
                <Utensils size={16} style={{ color: colors.ornament }} />
              </div>
            )}
          </div>

          {/* Center Title & Aesthetic Menu Typography */}
          <div className="my-auto py-1 sm:py-2 flex flex-col items-center max-w-[90%]">
            <h1
              className="text-lg sm:text-3xl md:text-4xl font-extrabold uppercase tracking-wider leading-tight drop-shadow-xs"
              style={{
                color: colors.heading,
                fontFamily: typography.headingFont,
                textShadow: textShadowStyle,
              }}
            >
              {restaurant.name}
            </h1>

            {/* Subtle Divider Motif */}
            <div className="flex items-center justify-center gap-2 w-32 sm:w-44 my-1.5 sm:my-2.5">
              <span className="h-px flex-1 opacity-50" style={{ backgroundColor: colors.border }} />
              <Utensils size={12} style={{ color: colors.ornament }} />
              <span className="h-px flex-1 opacity-50" style={{ backgroundColor: colors.border }} />
            </div>

            <p
              className="text-[9.5px] sm:text-xs md:text-sm font-medium tracking-wide italic opacity-90 max-w-xs line-clamp-2"
              style={{ color: colors.description }}
            >
              {restaurant.tagline || restaurant.cuisine || 'Fine Culinary Experience & Crafted Delights'}
            </p>

            <div
              className="mt-2.5 sm:mt-4 px-4 sm:px-6 py-0.5 sm:py-1 border-y text-[11px] sm:text-base tracking-[0.25em] uppercase font-bold"
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
          <div className="flex flex-col items-center space-y-1.5 sm:space-y-2.5 w-full border-t pt-1.5 sm:pt-3 shrink-0" style={{ borderColor: colors.border }}>
            {qrCodeDataUrl && (
              <div className="flex flex-col items-center">
                <div
                  className="p-1 rounded-md bg-white shadow-xs border"
                  style={{ borderColor: colors.border }}
                >
                  <img src={qrCodeDataUrl} alt="Menu QR" className="w-12 h-12 sm:w-16 sm:h-16" />
                </div>
                <span
                  className="text-[8.5px] sm:text-[10px] tracking-wider uppercase font-semibold mt-0.5 opacity-80"
                  style={{ color: colors.text }}
                >
                  Scan for Digital Menu
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-[9px] sm:text-[11px] opacity-85" style={{ color: colors.text }}>
              {restaurant.address && (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={10} style={{ color: colors.ornament }} />
                  {restaurant.address}{restaurant.city ? `, ${restaurant.city}` : ''}
                </span>
              )}
              {restaurant.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone size={10} style={{ color: colors.ornament }} />
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
      className={`relative w-full aspect-[9/16] overflow-hidden select-none bg-stone-900 ${isPrintPreview ? 'shadow-none' : 'shadow-2xl'} transition-all ${className}`}
      style={{
        backgroundImage: `url(${pageBg})`,
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

      {/* Subtle Soft Focus Safe-Zone Contrast Backing (Zero harsh borders, 100% seamless feather) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDarkTheme
            ? 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0) 75%)'
            : 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 75%)',
        }}
      />

      {/* Center Safe-Zone Content Area */}
      <div
        className="relative h-full flex flex-col justify-between z-10"
        style={{
          paddingTop: activeSafeZone.top,
          paddingBottom: activeSafeZone.bottom,
          paddingLeft: activeSafeZone.left,
          paddingRight: activeSafeZone.right,
        }}
      >
        {/* Running Top Page Header */}
        <div
          className="flex items-center justify-between pb-1.5 border-b text-[10px] sm:text-xs tracking-wider uppercase font-semibold shrink-0 gap-2"
          style={{ borderColor: colors.border, color: colors.subheading }}
        >
          <span className="truncate max-w-[48%]" style={{ fontFamily: typography.headingFont, textShadow: textShadowStyle }}>
            {restaurant.name}
          </span>
          <span className="text-[9.5px] sm:text-[10px] tracking-widest opacity-85 truncate max-w-[50%] text-right" style={{ textShadow: textShadowStyle }}>
            {page.runningTitle || 'Specialties'}
          </span>
        </div>

        {/* Page Content: Categories & Dishes (Vertically centered when few items, natural flow when full) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden my-auto py-1 flex flex-col justify-center space-y-2 pr-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {page.sections.map((section, sIdx) => (
            <div key={`${section.categoryId}-${sIdx}`} className="space-y-1.5 min-w-0">
              {/* Category Header */}
              <div className="flex items-center gap-2 pt-0.5 pb-0.5 min-w-0">
                <span
                  className="text-xs sm:text-sm font-bold uppercase tracking-widest shrink-0 truncate max-w-[75%]"
                  style={{
                    color: colors.subheading,
                    fontFamily: typography.subheadingFont,
                    textShadow: textShadowStyle,
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
                        className="text-xs sm:text-[13px] font-bold tracking-wide leading-tight truncate min-w-0"
                        style={{ color: colors.text, textShadow: textShadowStyle }}
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
                            className="text-xs sm:text-[13px] font-extrabold"
                            style={{
                              color: colors.price,
                              fontFamily: typography.priceFont,
                              textShadow: textShadowStyle,
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
