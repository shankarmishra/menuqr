import React, { useState } from 'react';
import clsx from 'clsx';
import type { LayoutProps, MenuItem, CategoryGroup } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from './RenderItemPrices';
import { 
  VintageKitchenDoodleBg, 
  ChalkboardDoodleBg, 
  CutoutRedChili, 
  CutoutBasilLeaf, 
  CutoutLimeSlice, 
  Image1WheelCollage, 
  Image2ApertureRing 
} from '../artwork/FoodDoodleBackgrounds';
import { Phone, MapPin, Globe, Sparkles, BookOpen, UtensilsCrossed, Plus } from 'lucide-react';
import { ShobharamBespokeCover } from '../bespoke/ShobharamBespokeCover';
import { ShobharamBookletSpread } from '../bespoke/ShobharamBookletSpread';

export interface GraphicThemeConfig {
  id: string;
  name: string;
  subtitle: string;
  doodleBg: 'vintage-cream' | 'chalkboard-dark' | 'none';
  collageStyle: 'wheel-3slice' | 'aperture-ribbon';
  coverTitle: {
    line1: string;
    line2: string;
    color1?: string;
    color2?: string;
  };
  categoryBulletItems: string[];
  promoBadge: {
    title: string;
    subtitle: string;
  };
  ribbonBadgeText?: string;
  colors: {
    bg: string;
    surface: string;
    cardBg: string;
    text: string;
    heading: string;
    accent: string;
    secondary: string;
    border: string;
    bannerBg: string;
    bannerText: string;
    priceTagBg: string;
    priceTagText: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  featuredPhotos: [string, string, string];
  cutouts: Array<'chili' | 'basil' | 'lime'>;
}

export const GraphicBookletTemplate: React.FC<LayoutProps & { config: GraphicThemeConfig }> = (props) => {
  const {
    restaurant,
    categories,
    onAddToCart,
    searchBar,
    config,
  } = props;

  if (restaurant.name?.toLowerCase().includes('shobharam')) {
    return <ShobharamBookletSpread {...props} />;
  }
  // Page toggle: 'cover' (Front Cover) vs 'menu' (Inside Menu Pages)
  const [currentPage, setCurrentPage] = useState<'cover' | 'menu'>('cover');

  // Find highlight dishes with photos to display in the inside page callouts
  const allItems: MenuItem[] = categories.flatMap((c: CategoryGroup) => c.items);
  const itemPhotos = allItems.map((i) => i.image).filter(Boolean) as string[];
  const featuredPhotos: [string, string, string] = [
    itemPhotos[0] || config.featuredPhotos[0],
    itemPhotos[1] || config.featuredPhotos[1],
    itemPhotos[2] || config.featuredPhotos[2],
  ];

  const categoryBullets = categories.length > 0
    ? categories.slice(0, 5).map((c) => c.name)
    : config.categoryBulletItems;

  const featureDish1 = allItems.find((i) => (i.isBestseller || (i as any).isChefSpecial || i.isSpecial) && i.image) || allItems[0] || {
    id: 'f1',
    name: 'Chef Signature Dish',
    price: 249,
    description: 'Crispy special seasoned with herbs & chef sauce',
    image: featuredPhotos[0],
    dietType: 'non-veg',
    category: 'specials',
  };
  const featureDish2 = allItems.find((i) => i.id !== featureDish1.id && i.image) || allItems[1] || {
    id: 'f2',
    name: 'Artisan Woodfire Special',
    price: 329,
    description: 'Stone-baked thin crust with premium toppings',
    image: featuredPhotos[1],
    dietType: 'veg',
    category: 'specials',
  };

  const coverPromoTitle = featureDish1?.name
    ? `Featured: ${featureDish1.name}`
    : config.promoBadge.title;
  const coverPromoSubtitle = featureDish1?.description
    ? featureDish1.description
    : config.promoBadge.subtitle;

  return (
    <div 
      className="w-full relative min-h-screen transition-colors duration-300 overflow-hidden"
      style={{
        backgroundColor: config.colors.bg,
        color: config.colors.text,
        fontFamily: config.typography.bodyFont,
      }}
    >
      {/* Background Illustrated Doodle Watermark */}
      {config.doodleBg === 'vintage-cream' && (
        <VintageKitchenDoodleBg color={config.colors.secondary || '#7A5B3D'} opacity={0.16} />
      )}
      {config.doodleBg === 'chalkboard-dark' && (
        <ChalkboardDoodleBg opacity={0.09} />
      )}

      {/* Floating View Switcher Bar (Cover vs Menu) */}
      <div className="sticky top-2 z-40 max-w-md mx-auto px-4 py-1.5 mb-4">
        <div className="bg-black/60 backdrop-blur-md border border-white/20 p-1 rounded-full shadow-2xl flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentPage('cover')}
            className={clsx(
              'flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5',
              currentPage === 'cover'
                ? 'bg-gradient-to-r from-amber-500 to-[#E8783C] text-white shadow-md'
                : 'text-white/70 hover:text-white'
            )}
          >
            <BookOpen size={13} />
            <span>📖 Front Cover</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage('menu')}
            className={clsx(
              'flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5',
              currentPage === 'menu'
                ? 'bg-gradient-to-r from-amber-500 to-[#E8783C] text-white shadow-md'
                : 'text-white/70 hover:text-white'
            )}
          >
            <UtensilsCrossed size={13} />
            <span>📋 Inside Menu Pages ({allItems.length})</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* PAGE 1: FRONT COVER PAGE (Inspired by Image 1 & Image 2)              */}
      {/* ==================================================================== */}
      {currentPage === 'cover' && (
        restaurant.name?.toLowerCase().includes('shobharam') ? (
          <div className="relative z-10 max-w-3xl mx-auto px-2 sm:px-6 py-6 animate-in fade-in duration-300">
            <ShobharamBespokeCover
              restaurant={restaurant}
              categories={categories}
              onExploreMenu={() => setCurrentPage('menu')}
            />
          </div>
        ) : (
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-8 py-6 flex flex-col justify-between min-h-[820px] animate-in fade-in duration-300">
          {/* Top Row: Floating Cutout + Logo Medallion */}
          <div className="flex items-start justify-between relative mb-6">
            {/* Cutout Chili / Basil (Left) */}
            <div className="relative -top-2 left-2 z-20">
              {config.cutouts.includes('chili') && <CutoutRedChili size={48} rotation={-20} />}
              {config.cutouts.includes('basil') && <CutoutBasilLeaf size={42} rotation={15} className="ml-2" />}
            </div>

            {/* Circular "Your Logo" Stamp Badge (Top Right) */}
            <div className="relative z-20">
              <div 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed p-1 flex items-center justify-center text-center shadow-lg transform rotate-6 hover:rotate-0 transition-transform"
                style={{ borderColor: config.colors.accent, backgroundColor: config.colors.surface }}
              >
                {restaurant.logo ? (
                  <img src={restaurant.logo} alt={restaurant.name} className="w-full h-full object-cover rounded-full" decoding="async" loading="lazy" />
                ) : (
                  <div className="flex flex-col items-center justify-center p-1">
                    <span 
                      className="font-serif italic font-bold text-xs sm:text-sm leading-tight"
                      style={{ color: config.colors.heading }}
                    >
                      {restaurant.name.split(' ')[0] || 'Your'}
                    </span>
                    <span 
                      className="font-mono text-[9px] uppercase tracking-widest font-extrabold"
                      style={{ color: config.colors.accent }}
                    >
                      Logo
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center Main Stage: Headline + Visual Collage + Category List */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center my-auto">
            {/* Left Headline & Bullet Categories (6 cols) */}
            <div className="md:col-span-6 space-y-5 text-left">
              <div>
                <h2 
                  className="text-2xl sm:text-4xl font-black uppercase tracking-tight leading-none"
                  style={{ 
                    fontFamily: config.typography.headingFont,
                    color: config.coverTitle.color1 || config.colors.heading 
                  }}
                >
                  {restaurant.cuisine ? restaurant.cuisine.toUpperCase() : config.coverTitle.line1}
                </h2>
                <h1 
                  className="text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-tight"
                  style={{ 
                    fontFamily: config.typography.headingFont,
                    color: config.coverTitle.color2 || config.colors.accent 
                  }}
                >
                  {restaurant.name || config.coverTitle.line2}
                </h1>
                <p className="text-xs sm:text-sm font-medium mt-2 opacity-80 max-w-sm">
                  {restaurant.tagline || 'Exquisite culinary handcrafted specialties prepared with passion & authentic recipes.'}
                </p>
              </div>

              {/* Bulleted Category Highlights (Square bullets just like Image 1) */}
              <div className="space-y-1.5 pt-2 border-t border-current/15">
                {categoryBullets.map((cat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider">
                    <span 
                      className="w-2 h-2 rounded-xs shrink-0 shadow-xs" 
                      style={{ backgroundColor: config.colors.accent }} 
                    />
                    <span style={{ color: config.colors.heading }}>{cat}</span>
                  </div>
                ))}
              </div>

              {/* Explore Menu CTA Button */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => setCurrentPage('menu')}
                  className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider text-white shadow-xl flex items-center gap-2 hover:scale-[1.03] active:scale-95 transition-all"
                  style={{ backgroundColor: config.colors.accent }}
                >
                  <span>Explore Inside Menu</span>
                  <Sparkles size={16} />
                </button>
              </div>
            </div>

            {/* Right Food Showcase: Wheel Collage (Image 1) or Aperture Ring (Image 2) (6 cols) */}
            <div className="md:col-span-6 flex justify-center relative">
              {config.collageStyle === 'wheel-3slice' ? (
                <div className="relative">
                  <Image1WheelCollage 
                    photos={featuredPhotos}
                    borderColor={config.colors.surface}
                    centerColor={config.colors.accent}
                    centerText={restaurant.name ? restaurant.name.split(' ')[0] : 'Menu'}
                  />
                  {/* Floating cutouts around the wheel */}
                  {config.cutouts.includes('lime') && (
                    <div className="absolute -bottom-4 -left-4 z-20">
                      <CutoutLimeSlice size={54} />
                    </div>
                  )}
                  {config.cutouts.includes('basil') && (
                    <div className="absolute -top-3 right-6 z-20">
                      <CutoutBasilLeaf size={46} rotation={-15} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <Image2ApertureRing 
                    photo={featuredPhotos[0]}
                    badgeRibbonText={restaurant.name || config.ribbonBadgeText}
                    badgeRibbonColor={config.colors.accent}
                    accentRingColor={config.colors.accent}
                  />
                  {config.cutouts.includes('chili') && (
                    <div className="absolute -bottom-6 right-8 z-20">
                      <CutoutRedChili size={56} rotation={40} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section: Promo Card & Footer Contact Details */}
          <div className="pt-6 border-t border-current/15 mt-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Happy Hours / Promo Card */}
              <div 
                className="p-3.5 rounded-2xl border flex items-center gap-3 shadow-md max-w-sm"
                style={{ backgroundColor: config.colors.cardBg, borderColor: config.colors.border }}
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 font-black shadow-sm"
                  style={{ backgroundColor: config.colors.accent }}
                >
                  ★
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide leading-tight line-clamp-1" style={{ color: config.colors.heading }}>
                    {coverPromoTitle}
                  </h4>
                  <p className="text-[11px] opacity-75 leading-tight mt-0.5 line-clamp-2">
                    {coverPromoSubtitle}
                  </p>
                </div>
              </div>

              {/* Delivery & Reservation Phone / Address */}
              <div className="text-left sm:text-right space-y-1 text-xs">
                {restaurant.phone && (
                  <div className="flex items-center sm:justify-end gap-1.5 font-bold" style={{ color: config.colors.heading }}>
                    <Phone size={13} className="shrink-0" style={{ color: config.colors.accent }} />
                    <span>Order: {restaurant.phone}</span>
                  </div>
                )}
                {(restaurant.address || restaurant.city) && (
                  <div className="flex items-center sm:justify-end gap-1.5 opacity-80 text-[11px]">
                    <MapPin size={13} className="shrink-0" style={{ color: config.colors.accent }} />
                    <span className="truncate max-w-[240px]">{restaurant.address || restaurant.city}</span>
                  </div>
                )}
                <div className="flex items-center sm:justify-end gap-1.5 opacity-80 text-[10px] font-mono">
                  <Globe size={11} className="shrink-0" />
                  <span>Scan QR Code To Order Digitally</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        )
      )}

      {/* ==================================================================== */}
      {/* PAGE 2: INSIDE MENU PAGE (Inspired by Image 2 - Page 2)               */}
      {/* ==================================================================== */}
      {currentPage === 'menu' && (
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 py-6 space-y-8 animate-in fade-in duration-300">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-current/15">
            <div className="flex items-center gap-3">
              {restaurant.logo && (
                <img 
                  src={restaurant.logo} 
                  alt={restaurant.name} 
                  className="w-12 h-12 object-contain rounded-2xl border p-1 shrink-0" 
                  style={{ borderColor: config.colors.border, backgroundColor: config.colors.cardBg }}
                  decoding="async"
                  loading="lazy"
                />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span 
                    className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full text-white shadow-xs"
                    style={{ backgroundColor: config.colors.accent }}
                  >
                    Inside Menu
                  </span>
                  <span className="text-xs font-mono opacity-60">
                    {restaurant.cuisine || 'Catering & Dining'}
                  </span>
                </div>
                <h2 
                  className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight mt-1"
                  style={{ 
                    fontFamily: config.typography.headingFont,
                    color: config.colors.heading 
                  }}
                >
                  {restaurant.name}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage('cover')}
              className="px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 self-start sm:self-auto hover:bg-white/10"
              style={{ borderColor: config.colors.accent, color: config.colors.accent }}
            >
              <span>← View Front Cover</span>
            </button>
          </div>

          {/* Search & Diet Filter Bar */}
          {searchBar}

          {/* Top Feature Dish Highlight Cards (Organic Brush/Cutout Frames from Image 2) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Feature Dish 1 */}
            <div 
              className="p-4 rounded-3xl border shadow-lg flex items-center gap-4 relative overflow-hidden group"
              style={{ backgroundColor: config.colors.cardBg, borderColor: config.colors.border }}
            >
              {/* Brush stroke / circular photo callout with price badge */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border-2 shadow-md" style={{ borderColor: config.colors.accent }}>
                <img 
                  src={featureDish1.image || config.featuredPhotos[0]} 
                  alt={featureDish1.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  decoding="async"
                  loading="lazy"
                />
                <span 
                  className="absolute bottom-0 inset-x-0 text-[10px] font-black text-center py-0.5 text-white"
                  style={{ backgroundColor: config.colors.accent }}
                >
                  ₹{featureDish1.price}
                </span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#E8783C]">
                  CHEF RECOMMENDATION
                </span>
                <h4 className="font-bold text-sm sm:text-base truncate" style={{ color: config.colors.heading }}>
                  {featureDish1.name}
                </h4>
                <p className="text-xs opacity-75 line-clamp-2 mt-0.5">
                  {featureDish1.description}
                </p>
                {onAddToCart && (
                  <button
                    type="button"
                    onClick={() => onAddToCart(featureDish1, `₹${featureDish1.price}`)}
                    className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-white shadow-xs active:scale-95 transition-transform"
                    style={{ backgroundColor: config.colors.accent }}
                  >
                    <Plus size={12} />
                    <span>Add to Order</span>
                  </button>
                )}
              </div>
            </div>

            {/* Feature Dish 2 */}
            <div 
              className="p-4 rounded-3xl border shadow-lg flex items-center gap-4 relative overflow-hidden group"
              style={{ backgroundColor: config.colors.cardBg, borderColor: config.colors.border }}
            >
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border-2 shadow-md" style={{ borderColor: config.colors.accent }}>
                <img 
                  src={featureDish2.image || config.featuredPhotos[1]} 
                  alt={featureDish2.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  decoding="async"
                  loading="lazy"
                />
                <span 
                  className="absolute bottom-0 inset-x-0 text-[10px] font-black text-center py-0.5 text-white"
                  style={{ backgroundColor: config.colors.accent }}
                >
                  ₹{featureDish2.price}
                </span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-500">
                  HOUSE SPECIAL
                </span>
                <h4 className="font-bold text-sm sm:text-base truncate" style={{ color: config.colors.heading }}>
                  {featureDish2.name}
                </h4>
                <p className="text-xs opacity-75 line-clamp-2 mt-0.5">
                  {featureDish2.description}
                </p>
                {onAddToCart && (
                  <button
                    type="button"
                    onClick={() => onAddToCart(featureDish2, `₹${featureDish2.price}`)}
                    className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-white shadow-xs active:scale-95 transition-transform"
                    style={{ backgroundColor: config.colors.accent }}
                  >
                    <Plus size={12} />
                    <span>Add to Order</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Categories & Dish Items Listings (Double column structured just like Image 2) */}
          <div className="space-y-10">
            {categories.map((category: CategoryGroup) => (
              <div key={category.id} className="space-y-4">
                {/* Category Header Ribbon (Like Orange Banners in Image 2) */}
                <div className="flex items-center gap-3">
                  <div 
                    className="px-5 py-2 rounded-xl shadow-md flex items-center gap-2"
                    style={{ 
                      backgroundColor: config.colors.bannerBg, 
                      color: config.colors.bannerText,
                      fontFamily: config.typography.headingFont,
                    }}
                  >
                    <span className="font-black text-xs sm:text-sm uppercase tracking-wider">
                      {category.name}
                    </span>
                    <span className="text-[10px] font-mono opacity-80 font-bold px-1.5 py-0.2 rounded-md bg-black/20">
                      {category.items.length}
                    </span>
                  </div>
                  <div className="flex-1 h-0.5 opacity-20" style={{ backgroundColor: config.colors.accent }} />
                </div>

                {/* Items Grid (Clean 2-column list with dot leaders or card layout) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.items.map((item: MenuItem, itemIdx: number) => {
                    const pricing = parseItemPricing(item);
                    const priceStr = pricing.formattedBasePrice || String(item.price || 0);

                    return (
                      <div 
                        key={item.id}
                        className="p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between group"
                        style={{ 
                          backgroundColor: config.colors.cardBg, 
                          borderColor: config.colors.border 
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5 min-w-0">
                            {/* Item Number (#01, #02...) */}
                            <span 
                              className="text-[11px] font-mono font-bold shrink-0 mt-0.5 opacity-60"
                            >
                              {String(itemIdx + 1).padStart(2, '0')}.
                            </span>

                            <div className="text-left">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span 
                                  className="font-bold text-sm sm:text-base leading-snug group-hover:text-amber-500 transition-colors"
                                  style={{ color: config.colors.heading }}
                                >
                                  {item.name}
                                </span>
                                <DietIndicator type={item.dietType} />
                                {item.isBestseller && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                    ★ POPULAR
                                  </span>
                                )}
                              </div>

                              {item.description && (
                                <p className="text-xs opacity-75 line-clamp-2 mt-1 leading-relaxed">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Item Thumbnail if provided */}
                          {item.image && (
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-current/10 shadow-xs"
                              decoding="async"
                              loading="lazy"
                            />
                          )}
                        </div>

                        {/* Price and Add to Order Bar */}
                        <div className="flex items-center justify-between pt-3 mt-2 border-t border-current/10">
                          <div>
                            <RenderItemPrices item={item} />
                          </div>

                          {onAddToCart && (
                            <button
                              type="button"
                              onClick={() => onAddToCart(item, priceStr)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1 shadow-xs hover:scale-105 active:scale-95 transition-all"
                              style={{ backgroundColor: config.colors.accent }}
                            >
                              <Plus size={13} />
                              <span>Add</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Back-to-Cover Prompt */}
          <div className="pt-8 text-center">
            <button
              type="button"
              onClick={() => setCurrentPage('cover')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold border transition-colors hover:bg-white/10"
              style={{ borderColor: config.colors.accent, color: config.colors.accent }}
            >
              <BookOpen size={14} />
              <span>Back to Cover Page</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
