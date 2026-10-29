// MENUQR Parametric Design Engine — Master Adaptive Artboard Composition
// Generative Zero-Code Digital Twin Renderer for Real-World Physical Menus & Flyers

import React, { useState } from 'react';
import clsx from 'clsx';
import type { CompositionProps } from '../types';
import { useMenuCart } from '../../templates/shared/MenuCartContext';
import { DietIndicator, parseItemPricing } from '../../templates/shared/RenderItemPrices';
import { Plus, Minus, MapPin, Phone, Clock } from 'lucide-react';

export const ParametricArtboardComposition: React.FC<CompositionProps> = ({
  spec,
  restaurant,
  categories,
  onAddToCart,
  isPremium,
}) => {
  const { colors, typography, layoutGrammar: rawGrammar } = spec;
  const { getItemQuantity, onRemoveFromCart } = useMenuCart();
  const [activeBoard, setActiveBoard] = useState<'both' | 'cover' | 'menu'>('both');
  const [selectedItemImage, setSelectedItemImage] = useState<{ name: string; image: string; price: number | string } | null>(null);

  // Fallback defaults if grammar is partially defined
  const grammar = {
    containerMetaphor: rawGrammar?.containerMetaphor || (spec.themeId?.includes('yoursteak') || spec.themeId?.includes('chalkboard') ? 'clipboard' : 'minimal-sheet'),
    coverPage: rawGrammar?.coverPage ?? {
      enabled: Boolean(spec.themeId?.includes('yoursteak') || spec.themeId?.includes('chalkboard')),
      titleLayout: 'stamp-ribbon',
      ribbonText: 'FOOD',
      heroPlatter: true,
      badges: [
        { label: 'OPEN HOUR', value: '8AM' },
        { label: 'LIVE MUSIC', value: '6PM' },
      ],
      footerText: 'WWW.YOURSTEAK.COM',
    },
    pageLayout: rawGrammar?.pageLayout ?? { columns: 2, columnBalance: 'equal' },
    categoryStyle: rawGrammar?.categoryStyle ?? { badgeType: 'banner-ribbon' },
    itemStyle: rawGrammar?.itemStyle ?? { presentation: 'dotted-leader', pricePlacement: 'dotted-end', showImages: false },
    calloutBoxes: rawGrammar?.calloutBoxes ?? [
      { categoryMatch: 'FAVOURITE|SPECIAL|CHEF', style: 'double-border', badgeText: '$22' },
    ],
  };

  const isClipboard = grammar.containerMetaphor === 'clipboard';
  const isLeather = grammar.containerMetaphor === 'leather-folio';
  const isParchment = grammar.containerMetaphor === 'parchment';

  // Identify special callout categories vs regular
  const isSpecialCategory = (catName: string) =>
    grammar.calloutBoxes.some((cb) => new RegExp(cb.categoryMatch, 'i').test(catName));

  const specialCategories = categories.filter((c) => isSpecialCategory(c.name));
  const regularCategories = categories.filter((c) => !isSpecialCategory(c.name));

  const headingFont = typography.headingFont || "'Bebas Neue', 'Oswald', sans-serif";
  const bodyFont = typography.bodyFont || "'Plus Jakarta Sans', sans-serif";
  const heroPlateImage = '/uploads/dishes/crop_dish_plate.webp';

  return (
    <div
      className="relative z-10 w-full min-h-screen py-6 sm:py-10 px-2 sm:px-4 flex flex-col items-center justify-start select-none transition-colors duration-300"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        fontFamily: bodyFont,
        backgroundImage: isClipboard
          ? `radial-gradient(#201c18 1px, transparent 1px), linear-gradient(to bottom, #161310, #0c0a09)`
          : undefined,
        backgroundSize: isClipboard ? '24px 24px, 100% 100%' : undefined,
      }}
    >
      {/* ─────────────────────────────────────────────────────────────────────────────
          MOBILE VIEW SWITCHER (When cover page exists)
          ───────────────────────────────────────────────────────────────────────────── */}
      {grammar.coverPage?.enabled && (
        <div className="flex xl:hidden items-center justify-center gap-2 mb-6 p-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setActiveBoard('cover')}
            className={clsx(
              'px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer',
              activeBoard === 'cover' ? 'bg-[#c27038] text-white shadow-lg' : 'text-neutral-400 hover:text-white'
            )}
          >
            Cover Board
          </button>
          <button
            type="button"
            onClick={() => setActiveBoard('menu')}
            className={clsx(
              'px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer',
              activeBoard === 'menu' || activeBoard === 'both' ? 'bg-[#c27038] text-white shadow-lg' : 'text-neutral-400 hover:text-white'
            )}
          >
            The Menu
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          MASTER PARAMETRIC CANVAS
          ───────────────────────────────────────────────────────────────────────────── */}
      <div className="w-full max-w-7xl flex flex-col xl:flex-row items-center xl:items-start justify-center gap-8 xl:gap-10">
        
        {/* ═══════════════════════════════════════════════════════════════════════════
            BOARD 1: COVER BOARD (Dynamic Hero Metaphor)
            ═══════════════════════════════════════════════════════════════════════════ */}
        {grammar.coverPage?.enabled && (
          <div
            className={clsx(
              'w-full max-w-[540px] transition-all duration-300',
              activeBoard === 'menu' ? 'hidden xl:block' : 'block'
            )}
          >
            <div
              className={clsx(
                'relative rounded-2xl p-4 sm:p-5 shadow-[0_25px_60px_rgba(0,0,0,0.9)]',
                isClipboard && 'bg-gradient-to-b from-[#8a5d3b] via-[#6d4425] to-[#4e2f18] border-4 border-[#9c6f4a]/80',
                isLeather && 'bg-[#2b1810] border-8 border-[#3d2317] rounded-2xl',
                isParchment && 'bg-[#f8f5ee] border-4 border-[#d4af37]/40 text-[#1f2923]'
              )}
            >
              {/* Metallic Clamp Clip if Clipboard Metaphor */}
              {isClipboard && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center z-20 pointer-events-none">
                  <div className="w-20 h-5 border-4 border-[#858585] rounded-t-lg bg-transparent shadow-sm" />
                  <div className="w-36 sm:w-44 h-8 bg-gradient-to-b from-[#c0c0c0] via-[#9e9e9e] to-[#6d6d6d] rounded-md border border-black/40 shadow-xl flex items-center justify-between px-3">
                    <div className="w-2 h-2 rounded-full bg-[#404040] shadow-inner" />
                    <div className="h-1 w-16 bg-black/30 rounded-full" />
                    <div className="w-2 h-2 rounded-full bg-[#404040] shadow-inner" />
                  </div>
                </div>
              )}

              {/* Blackboard / Paper Insert */}
              <div
                className="relative rounded-xl border p-6 sm:p-8 flex flex-col items-center justify-between min-h-[720px] overflow-hidden shadow-inner"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
              >
                {/* Chalk Dust Overlay */}
                {isClipboard && (
                  <div
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                      backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
                    }}
                  />
                )}

                {/* Inner Border */}
                <div
                  className="absolute inset-3 border rounded-lg pointer-events-none opacity-30"
                  style={{
                    borderStyle: isClipboard ? 'dashed' : 'solid',
                    borderColor: colors.heading,
                  }}
                />

                {/* Subtitle */}
                <div className="relative z-10 text-center mt-3">
                  <span
                    className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.35em] font-mono"
                    style={{ color: colors.textMuted }}
                  >
                    {restaurant.tagline || 'BEST QUALITY RESTAURANT'}
                  </span>
                </div>

                {/* Masthead: Title Layout */}
                <div className="relative z-10 text-center my-4">
                  <div className="relative inline-block">
                    <h1
                      className="text-7xl sm:text-8xl font-black tracking-[0.1em] leading-none drop-shadow-md"
                      style={{
                        fontFamily: headingFont,
                        color: colors.heading,
                      }}
                    >
                      MENU
                    </h1>
                    {/* Angled Ribbon Banner */}
                    {grammar.coverPage.ribbonText && (
                      <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-3 text-xl sm:text-2xl font-bold uppercase tracking-[0.25em] px-8 py-1 rounded shadow-lg border-y"
                        style={{
                          backgroundColor: colors.badgeBg,
                          color: colors.badgeText,
                          borderColor: colors.border,
                        }}
                      >
                        {grammar.coverPage.ribbonText}
                      </div>
                    )}
                  </div>
                </div>

                {/* Hero Centerpiece Platter with Badges */}
                <div className="relative z-10 w-full flex items-center justify-between my-2 px-2">
                  {/* Left Badges */}
                  <div className="text-center space-y-1">
                    {grammar.coverPage.badges?.[0] && (
                      <>
                        <div className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]" style={{ color: colors.textMuted }}>
                          {grammar.coverPage.badges[0].label}
                        </div>
                        <div className="text-2xl sm:text-3xl font-black" style={{ fontFamily: headingFont, color: colors.heading }}>
                          {grammar.coverPage.badges[0].value}
                        </div>
                        <div className="text-xs font-mono" style={{ color: colors.accent }}>▲ ▲ ▲</div>
                      </>
                    )}
                  </div>

                  {/* Sizzling Center Platter */}
                  <div
                    className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-full p-2 border-4 shadow-2xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: colors.surfaceAlt,
                      borderColor: colors.border,
                    }}
                  >
                    <img
                      src={heroPlateImage}
                      alt="Sizzling Steak Platter"
                      className="w-full h-full object-cover rounded-full shadow-inner hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          '/img/photos/photo-1544025162-d76694265947-w600.webp';
                      }}
                      decoding="async"
                      loading="lazy"
                    />
                  </div>

                  {/* Right Badges */}
                  <div className="text-center space-y-1">
                    {grammar.coverPage.badges?.[1] && (
                      <>
                        <div className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]" style={{ color: colors.textMuted }}>
                          {grammar.coverPage.badges[1].label}
                        </div>
                        <div className="text-2xl sm:text-3xl font-black" style={{ fontFamily: headingFont, color: colors.heading }}>
                          {grammar.coverPage.badges[1].value}
                        </div>
                        <div className="text-xs font-mono" style={{ color: colors.accent }}>▲ ▲ ▲</div>
                      </>
                    )}
                  </div>
                </div>

                {/* Cover Board Footer */}
                <div className="relative z-10 w-full text-center space-y-1.5 mt-4 pt-4 border-t" style={{ borderColor: `${colors.border}40` }}>
                  <div className="text-[10px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5" style={{ color: colors.textMuted }}>
                    <MapPin size={12} style={{ color: colors.accent }} />
                    <span>{restaurant.address || '123 UPTOWN CITY, WASHINGTON METROPOLIS 201314'}</span>
                  </div>
                  <div className="text-[10px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-2" style={{ color: colors.textMuted }}>
                    <Clock size={11} style={{ color: colors.accent }} />
                    <span>{(restaurant as any).openingHours || 'OPENING HOUR 8PM - 10PM'}</span>
                    <span>&bull;</span>
                    <Phone size={11} style={{ color: colors.accent }} />
                    <span>{restaurant.phone || '0987 65 321'}</span>
                  </div>
                  <div className="pt-1">
                    <span
                      className="text-sm sm:text-base font-bold uppercase tracking-[0.25em]"
                      style={{ fontFamily: headingFont, color: colors.accent }}
                    >
                      {grammar.coverPage.footerText || restaurant.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════════
            BOARD 2: THE MENU BOARD (Parametric Multi-Column Artboard)
            ═══════════════════════════════════════════════════════════════════════════ */}
        <div
          className={clsx(
            'w-full max-w-[620px] transition-all duration-300',
            activeBoard === 'cover' ? 'hidden xl:block' : 'block'
          )}
        >
          <div
            className={clsx(
              'relative rounded-2xl p-4 sm:p-5 shadow-[0_25px_60px_rgba(0,0,0,0.9)]',
              isClipboard && 'bg-gradient-to-b from-[#8a5d3b] via-[#6d4425] to-[#4e2f18] border-4 border-[#9c6f4a]/80',
              isLeather && 'bg-[#2b1810] border-8 border-[#3d2317] rounded-2xl',
              isParchment && 'bg-[#f8f5ee] border-4 border-[#d4af37]/40 text-[#1f2923]'
            )}
          >
            {/* Clamp Clip */}
            {isClipboard && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center z-20 pointer-events-none">
                <div className="w-20 h-5 border-4 border-[#858585] rounded-t-lg bg-transparent shadow-sm" />
                <div className="w-36 sm:w-44 h-8 bg-gradient-to-b from-[#c0c0c0] via-[#9e9e9e] to-[#6d6d6d] rounded-md border border-black/40 shadow-xl flex items-center justify-between px-3">
                  <div className="w-2 h-2 rounded-full bg-[#404040] shadow-inner" />
                  <div className="h-1 w-16 bg-black/30 rounded-full" />
                  <div className="w-2 h-2 rounded-full bg-[#404040] shadow-inner" />
                </div>
              </div>
            )}

            {/* Paper Insert */}
            <div
              className="relative rounded-xl border p-5 sm:p-7 min-h-[720px] shadow-inner flex flex-col justify-between"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              {/* Inner Chalk Border */}
              <div
                className="absolute inset-3 border rounded-lg pointer-events-none opacity-30"
                style={{
                  borderStyle: isClipboard ? 'dashed' : 'solid',
                  borderColor: colors.heading,
                }}
              />

              {/* Masthead: — THE MENU — */}
              <div className="relative z-10 text-center mb-6 pt-2">
                <div className="inline-flex items-center gap-4 border-y py-1 px-8" style={{ borderColor: `${colors.heading}40` }}>
                  <span className="h-[2px] w-8 opacity-40" style={{ backgroundColor: colors.heading }} />
                  <h2
                    className="text-4xl sm:text-5xl font-black tracking-[0.2em] leading-none"
                    style={{ fontFamily: headingFont, color: colors.heading }}
                  >
                    THE MENU
                  </h2>
                  <span className="h-[2px] w-8 opacity-40" style={{ backgroundColor: colors.heading }} />
                </div>
              </div>

              {/* Categories & Dish Items Grid */}
              <div
                className={clsx(
                  'relative z-10 grid gap-x-6 gap-y-6 flex-1',
                  grammar.pageLayout.columns === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
                )}
              >
                {/* ── LEFT COLUMN ── */}
                <div className="space-y-6">
                  {regularCategories.slice(0, Math.ceil(regularCategories.length / (grammar.pageLayout.columns || 2))).map((cat) => (
                    <section key={cat.id} aria-label={cat.name} className="space-y-2.5">
                      {/* Banner Badge */}
                      <div
                        className="inline-block text-xs sm:text-sm font-bold uppercase tracking-[0.2em] px-4 py-0.5 rounded shadow-sm border-t"
                        style={{
                          backgroundColor: colors.badgeBg,
                          color: colors.badgeText,
                          borderColor: `${colors.heading}30`,
                        }}
                      >
                        {cat.name}
                      </div>

                      {/* Dishes List */}
                      <div className="space-y-2 pt-1">
                        {cat.items.map((item) => (
                          <ParametricDishRow
                            key={item.id}
                            item={item}
                            onAddToCart={onAddToCart}
                            onRemoveFromCart={onRemoveFromCart}
                            getItemQuantity={getItemQuantity}
                            isPremium={isPremium}
                            headingFont={headingFont}
                            accentColor={colors.accent}
                            textColor={colors.text}
                            onPreviewImage={() => item.image && setSelectedItemImage({ name: item.name, image: item.image, price: item.price })}
                          />
                        ))}
                      </div>
                    </section>
                  ))}

                  {/* 🌟 Special Box: OUR FAVOURITE MENU / $22 */}
                  {specialCategories.map((specCat) => (
                    <div
                      key={specCat.id}
                      className="relative border-2 rounded-lg p-3 sm:p-4 my-2 shadow-sm space-y-2"
                      style={{
                        borderColor: `${colors.heading}50`,
                        backgroundColor: `${colors.surfaceAlt}40`,
                      }}
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b" style={{ borderColor: `${colors.heading}30` }}>
                        <span
                          className="text-sm sm:text-base font-bold uppercase tracking-[0.15em]"
                          style={{ fontFamily: headingFont, color: colors.accent }}
                        >
                          {specCat.name}
                        </span>
                        <span
                          className="text-sm sm:text-base font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                          style={{
                            fontFamily: headingFont,
                            backgroundColor: colors.badgeBg,
                            color: colors.badgeText,
                          }}
                        >
                          $22
                        </span>
                      </div>

                      <div className="space-y-2 pt-1">
                        {specCat.items.map((item) => (
                          <ParametricDishRow
                            key={item.id}
                            item={item}
                            onAddToCart={onAddToCart}
                            onRemoveFromCart={onRemoveFromCart}
                            getItemQuantity={getItemQuantity}
                            isPremium={isPremium}
                            headingFont={headingFont}
                            accentColor={colors.accent}
                            textColor={colors.heading}
                            isFeatured
                            onPreviewImage={() => item.image && setSelectedItemImage({ name: item.name, image: item.image, price: item.price })}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── RIGHT COLUMN ── */}
                {grammar.pageLayout.columns > 1 && (
                  <div className="space-y-6">
                    {/* Decorative Accent Separator */}
                    <div className="hidden md:flex items-center justify-center gap-2 py-1 opacity-70">
                      <span className="h-[1px] flex-1" style={{ backgroundColor: `${colors.heading}25` }} />
                      <span className="text-xs font-mono" style={{ color: colors.accent }}>✦ ✦ ✦</span>
                      <span className="h-[1px] flex-1" style={{ backgroundColor: `${colors.heading}25` }} />
                    </div>

                    {regularCategories.slice(Math.ceil(regularCategories.length / 2)).map((cat) => (
                      <section key={cat.id} aria-label={cat.name} className="space-y-2.5">
                        <div
                          className="inline-block text-xs sm:text-sm font-bold uppercase tracking-[0.2em] px-4 py-0.5 rounded shadow-sm border-t"
                          style={{
                            backgroundColor: colors.badgeBg,
                            color: colors.badgeText,
                            borderColor: `${colors.heading}30`,
                          }}
                        >
                          {cat.name}
                        </div>

                        <div className="space-y-2 pt-1">
                          {cat.items.map((item) => (
                            <ParametricDishRow
                              key={item.id}
                              item={item}
                              onAddToCart={onAddToCart}
                              onRemoveFromCart={onRemoveFromCart}
                              getItemQuantity={getItemQuantity}
                              isPremium={isPremium}
                              headingFont={headingFont}
                              accentColor={colors.accent}
                              textColor={colors.text}
                              onPreviewImage={() => item.image && setSelectedItemImage({ name: item.name, image: item.image, price: item.price })}
                            />
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                )}
              </div>

              {/* Menu Board Footer */}
              <div
                className="relative z-10 w-full text-center pt-4 mt-6 border-t flex items-center justify-between text-[11px]"
                style={{ borderColor: `${colors.border}40`, color: colors.textMuted }}
              >
                <span>All prices in USD &bull; Taxes included</span>
                <span
                  className="font-bold tracking-widest text-xs uppercase"
                  style={{ fontFamily: headingFont, color: colors.accent }}
                >
                  {restaurant.name}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          IMAGE PREVIEW POPUP MODAL
          ───────────────────────────────────────────────────────────────────────────── */}
      {selectedItemImage && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedItemImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="rounded-2xl p-4 max-w-sm w-full space-y-3 shadow-2xl relative border-2"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.accent,
            }}
          >
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-black/40 border border-white/10">
              <img
                src={selectedItemImage.image}
                alt={selectedItemImage.name}
                className="w-full h-full object-cover"
                decoding="async"
                loading="lazy"
              />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base" style={{ fontFamily: headingFont, color: colors.heading }}>
                {selectedItemImage.name}
              </h3>
              <span className="font-bold text-base" style={{ color: colors.accent }}>
                ${selectedItemImage.price}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedItemImage(null)}
              className="w-full py-2 text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer"
              style={{
                backgroundColor: colors.accent,
                color: colors.badgeText,
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PARAMETRIC DISH ROW COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface ParametricDishRowProps {
  item: any;
  onAddToCart?: (item: any, priceStr: string, variant?: string) => void;
  onRemoveFromCart?: (itemId: string, variant?: string) => void;
  getItemQuantity?: (itemId: string, variant?: string) => number;
  isPremium?: boolean;
  headingFont: string;
  accentColor: string;
  textColor: string;
  isFeatured?: boolean;
  onPreviewImage?: () => void;
}

const ParametricDishRow: React.FC<ParametricDishRowProps> = ({
  item,
  onAddToCart,
  onRemoveFromCart,
  getItemQuantity,
  isPremium,
  headingFont,
  accentColor,
  textColor,
  isFeatured,
  onPreviewImage,
}) => {
  const qty = getItemQuantity ? getItemQuantity(item.id) : 0;
  const pricing = parseItemPricing(item);
  const displayPrice = pricing.basePrice ?? item.price ?? 22;

  return (
    <article className="group flex items-center justify-between gap-2 py-0.5 hover:bg-white/[0.04] px-1 rounded transition-colors">
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <DietIndicator type={item.dietType} compact className="shrink-0 scale-90" />

        <button
          type="button"
          onClick={onPreviewImage}
          className="text-left font-bold text-xs sm:text-sm tracking-wider uppercase truncate transition-colors cursor-pointer hover:opacity-80"
          style={{
            fontFamily: headingFont,
            color: textColor,
          }}
          title={item.name}
        >
          {item.name}
        </button>

        <span className="flex-1 border-b border-dotted opacity-25 mx-1 translate-y-[2px]" style={{ borderColor: textColor }} />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span
          className="font-bold text-xs sm:text-sm tracking-wider"
          style={{
            fontFamily: headingFont,
            color: isFeatured ? accentColor : textColor,
          }}
        >
          ${displayPrice}
        </span>

        {isPremium && onAddToCart && (
          <div className="flex items-center">
            {qty > 0 ? (
              <div
                className="flex items-center gap-1 rounded px-1 py-0.5 shadow-sm text-xs"
                style={{ backgroundColor: accentColor }}
              >
                <button
                  type="button"
                  onClick={() => onRemoveFromCart && onRemoveFromCart(item.id)}
                  className="w-4 h-4 flex items-center justify-center text-white hover:bg-black/20 rounded cursor-pointer"
                >
                  <Minus size={10} />
                </button>
                <span className="font-bold text-white text-[11px] px-0.5">{qty}</span>
                <button
                  type="button"
                  onClick={() => onAddToCart(item, String(displayPrice))}
                  className="w-4 h-4 flex items-center justify-center text-white hover:bg-black/20 rounded cursor-pointer"
                >
                  <Plus size={10} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onAddToCart(item, String(displayPrice))}
                aria-label={`Add ${item.name} to order`}
                className="w-5 h-5 rounded flex items-center justify-center bg-white/10 hover:opacity-100 text-white transition-all cursor-pointer opacity-70"
                style={{
                  backgroundColor: `${accentColor}30`,
                }}
              >
                <Plus size={12} style={{ color: accentColor }} />
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
};
