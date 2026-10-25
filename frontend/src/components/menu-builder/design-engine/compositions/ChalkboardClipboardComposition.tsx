// MENUQR Design Engine — Authentic Rustic Chalkboard Clipboard Composition
// Faithful 1:1 Digital Twin Recreation of Vintage Chalkboard Steakhouse & Bistro Flyers

import React, { useState } from 'react';
import clsx from 'clsx';
import type { CompositionProps } from '../types';
import { useMenuCart } from '../../templates/shared/MenuCartContext';
import { DietIndicator, parseItemPricing } from '../../templates/shared/RenderItemPrices';
import { Plus, Minus, MapPin, Phone, Clock } from 'lucide-react';

export const ChalkboardClipboardComposition: React.FC<CompositionProps> = ({
  spec,
  restaurant,
  categories,
  onAddToCart,
  isPremium,
}) => {
  const { typography } = spec;
  const { getItemQuantity, onRemoveFromCart } = useMenuCart();
  const [activeBoard, setActiveBoard] = useState<'both' | 'cover' | 'menu'>('both');
  const [selectedItemImage, setSelectedItemImage] = useState<{ name: string; image: string; price: number | string } | null>(null);

  // Separate "Our Favourite" special items if marked in categories
  const specialCategory = categories.find((c) => /favourite|special|chef|signature/i.test(c.name));
  const regularCategories = categories.filter((c) => !/favourite|special|chef|signature/i.test(c.name));

  // Default fallback plate if client logo is not a dish
  const heroPlateImage = '/uploads/dishes/crop_dish_plate.png';

  const headingFont = typography.headingFont || "'Bebas Neue', 'Oswald', sans-serif";
  const bodyFont = typography.bodyFont || "'Plus Jakarta Sans', sans-serif";

  return (
    <div
      className="relative z-10 w-full min-h-screen py-6 sm:py-10 px-2 sm:px-4 flex flex-col items-center justify-start text-white select-none"
      style={{
        backgroundColor: '#12100e',
        backgroundImage: `radial-gradient(#201c18 1px, transparent 1px), linear-gradient(to bottom, #161310, #0c0a09)`,
        backgroundSize: '24px 24px, 100% 100%',
        fontFamily: bodyFont,
      }}
    >
      {/* ─────────────────────────────────────────────────────────────────────────────
          MOBILE BOARD TOGGLE (Visible on small screens)
          ───────────────────────────────────────────────────────────────────────────── */}
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

      {/* ─────────────────────────────────────────────────────────────────────────────
          MASTER DUAL-CLIPBOARD CANVAS
          ───────────────────────────────────────────────────────────────────────────── */}
      <div className="w-full max-w-7xl flex flex-col xl:flex-row items-center xl:items-start justify-center gap-8 xl:gap-10">
        
        {/* ═══════════════════════════════════════════════════════════════════════════
            BOARD 1: COVER BOARD (The Rustic Cover Mockup)
            ═══════════════════════════════════════════════════════════════════════════ */}
        <div
          className={clsx(
            'w-full max-w-[540px] transition-all duration-300',
            activeBoard === 'menu' ? 'hidden xl:block' : 'block'
          )}
        >
          {/* Wooden Clipboard Backing */}
          <div className="relative rounded-2xl p-4 sm:p-5 shadow-[0_25px_60px_rgba(0,0,0,0.9)] bg-gradient-to-b from-[#8a5d3b] via-[#6d4425] to-[#4e2f18] border-4 border-[#9c6f4a]/80">
            {/* Top Metallic Clamp Clip */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center z-20 pointer-events-none">
              {/* Wire Loop */}
              <div className="w-20 h-5 border-4 border-[#858585] rounded-t-lg bg-transparent shadow-sm" />
              {/* Clamp Body */}
              <div className="w-36 sm:w-44 h-8 bg-gradient-to-b from-[#c0c0c0] via-[#9e9e9e] to-[#6d6d6d] rounded-md border border-black/40 shadow-xl flex items-center justify-between px-3">
                <div className="w-2 h-2 rounded-full bg-[#404040] shadow-inner" />
                <div className="h-1 w-16 bg-black/30 rounded-full" />
                <div className="w-2 h-2 rounded-full bg-[#404040] shadow-inner" />
              </div>
            </div>

            {/* Blackboard Chalkboard Paper Insert */}
            <div className="relative rounded-xl bg-[#141414] border border-white/20 p-6 sm:p-8 flex flex-col items-center justify-between min-h-[720px] overflow-hidden shadow-inner">
              {/* Faint chalk dust texture overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
                }}
              />

              {/* Inner Double Chalk Hairline Border */}
              <div className="absolute inset-3 border border-dashed border-white/20 rounded-lg pointer-events-none" />

              {/* Subtitle */}
              <div className="relative z-10 text-center mt-3">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.35em] text-[#b5b0a8] font-mono">
                  {restaurant.tagline || 'BEST QUALITY RESTAURANT'}
                </span>
              </div>

              {/* Masthead: FOOD MENU with Ribbon */}
              <div className="relative z-10 text-center my-4">
                <div className="relative inline-block">
                  <h1
                    className="text-7xl sm:text-8xl font-black tracking-[0.1em] text-white leading-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]"
                    style={{ fontFamily: headingFont }}
                  >
                    MENU
                  </h1>
                  {/* Angled Copper Banner Ribbon */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-3 bg-[#a65829] text-white text-xl sm:text-2xl font-bold uppercase tracking-[0.25em] px-8 py-1 rounded shadow-[0_4px_15px_rgba(0,0,0,0.7)] border-y border-white/20">
                    FOOD
                  </div>
                </div>
              </div>

              {/* Hero Dish Centerpiece with Badges */}
              <div className="relative z-10 w-full flex items-center justify-between my-2 px-2">
                {/* Left Badge: Open Hour 8AM */}
                <div className="text-center space-y-1">
                  <div className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#9c958b]">
                    Open Hour
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: headingFont }}>
                    8AM
                  </div>
                  <div className="text-[#a65829] text-xs font-mono">▲ ▲ ▲</div>
                </div>

                {/* Sizzling Cast Iron Platter */}
                <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-full p-2 bg-[#1f1f1f] border-4 border-[#2c2c2c] shadow-[0_20px_40px_rgba(0,0,0,0.9)] flex items-center justify-center shrink-0">
                  <img
                    src={heroPlateImage}
                    alt="Sizzling Steak Platter"
                    className="w-full h-full object-cover rounded-full shadow-inner hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      // Fallback to high res steak platter
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  {/* Subtle rim highlight */}
                  <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none" />
                </div>

                {/* Right Badge: Live Music 6PM */}
                <div className="text-center space-y-1">
                  <div className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#9c958b]">
                    Live Music
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: headingFont }}>
                    6PM
                  </div>
                  <div className="text-[#a65829] text-xs font-mono">▲ ▲ ▲</div>
                </div>
              </div>

              {/* Footer Information */}
              <div className="relative z-10 w-full text-center space-y-1.5 mt-4 pt-4 border-t border-white/10">
                <div className="text-[10px] sm:text-xs text-[#b0a99f] uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <MapPin size={12} className="text-[#a65829]" />
                  <span>{restaurant.address || '123 UPTOWN CITY, WASHINGTON METROPOLIS 201314'}</span>
                </div>
                <div className="text-[10px] sm:text-xs text-[#8f887f] uppercase tracking-wider flex items-center justify-center gap-2">
                  <Clock size={11} className="text-[#a65829]" />
                  <span>OPENING HOUR 8PM - 10PM</span>
                  <span>&bull;</span>
                  <Phone size={11} className="text-[#a65829]" />
                  <span>{restaurant.phone || '0987 65 321'}</span>
                </div>
                <div className="pt-1">
                  <span
                    className="text-sm sm:text-base font-bold text-[#c27038] uppercase tracking-[0.25em]"
                    style={{ fontFamily: headingFont }}
                  >
                    WWW.YOURSTEAK.COM
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════════
            BOARD 2: THE MENU BOARD (Two-Column Authentic Chalkboard Menu)
            ═══════════════════════════════════════════════════════════════════════════ */}
        <div
          className={clsx(
            'w-full max-w-[620px] transition-all duration-300',
            activeBoard === 'cover' ? 'hidden xl:block' : 'block'
          )}
        >
          {/* Wooden Clipboard Backing */}
          <div className="relative rounded-2xl p-4 sm:p-5 shadow-[0_25px_60px_rgba(0,0,0,0.9)] bg-gradient-to-b from-[#8a5d3b] via-[#6d4425] to-[#4e2f18] border-4 border-[#9c6f4a]/80">
            {/* Top Metallic Clamp Clip */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center z-20 pointer-events-none">
              <div className="w-20 h-5 border-4 border-[#858585] rounded-t-lg bg-transparent shadow-sm" />
              <div className="w-36 sm:w-44 h-8 bg-gradient-to-b from-[#c0c0c0] via-[#9e9e9e] to-[#6d6d6d] rounded-md border border-black/40 shadow-xl flex items-center justify-between px-3">
                <div className="w-2 h-2 rounded-full bg-[#404040] shadow-inner" />
                <div className="h-1 w-16 bg-black/30 rounded-full" />
                <div className="w-2 h-2 rounded-full bg-[#404040] shadow-inner" />
              </div>
            </div>

            {/* Blackboard Chalkboard Paper Insert */}
            <div className="relative rounded-xl bg-[#141414] border border-white/20 p-5 sm:p-7 min-h-[720px] shadow-inner flex flex-col justify-between">
              {/* Inner Chalk Hairline Border */}
              <div className="absolute inset-3 border border-dashed border-white/20 rounded-lg pointer-events-none" />

              {/* Masthead: — THE MENU — */}
              <div className="relative z-10 text-center mb-6 pt-2">
                <div className="inline-flex items-center gap-4 border-y border-white/30 py-1 px-8">
                  <span className="h-[2px] w-8 bg-white/40" />
                  <h2
                    className="text-4xl sm:text-5xl font-black text-white tracking-[0.2em] leading-none"
                    style={{ fontFamily: headingFont }}
                  >
                    THE MENU
                  </h2>
                  <span className="h-[2px] w-8 bg-white/40" />
                </div>
              </div>

              {/* Categories & Dish Items Grid (Authentic 2-Column Split) */}
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 flex-1">
                
                {/* ── LEFT COLUMN ── */}
                <div className="space-y-6">
                  {/* Render Categories mapped to Left (e.g., Appetizer, Pizza) */}
                  {regularCategories.slice(0, Math.ceil(regularCategories.length / 2)).map((cat) => (
                    <section key={cat.id} aria-label={cat.name} className="space-y-2.5">
                      {/* Terracotta Banner Badge */}
                      <div className="inline-block bg-[#a65829] text-white text-xs sm:text-sm font-bold uppercase tracking-[0.2em] px-4 py-0.5 rounded shadow-sm border-t border-white/20">
                        {cat.name}
                      </div>

                      {/* Dishes List with Dotted Leaders */}
                      <div className="space-y-2 pt-1">
                        {cat.items.map((item) => (
                          <ChalkboardDishRow
                            key={item.id}
                            item={item}
                            onAddToCart={onAddToCart}
                            onRemoveFromCart={onRemoveFromCart}
                            getItemQuantity={getItemQuantity}
                            isPremium={isPremium}
                            headingFont={headingFont}
                            onPreviewImage={() => item.image && setSelectedItemImage({ name: item.name, image: item.image, price: item.price })}
                          />
                        ))}
                      </div>
                    </section>
                  ))}

                  {/* 🌟 Special Box: OUR FAVOURITE MENU / $22 */}
                  {specialCategory && (
                    <div className="relative border-2 border-white/30 bg-white/[0.02] rounded-lg p-3 sm:p-4 my-2 shadow-sm space-y-2">
                      <div className="flex items-center justify-between pb-1.5 border-b border-white/20">
                        <span
                          className="text-sm sm:text-base font-bold text-[#c27038] uppercase tracking-[0.15em]"
                          style={{ fontFamily: headingFont }}
                        >
                          OUR FAVOURITE MENU
                        </span>
                        <span
                          className="text-sm sm:text-base font-bold text-white uppercase tracking-wider px-2 py-0.5 bg-[#a65829] rounded"
                          style={{ fontFamily: headingFont }}
                        >
                          $22
                        </span>
                      </div>

                      <div className="space-y-2 pt-1">
                        {specialCategory.items.map((item) => (
                          <ChalkboardDishRow
                            key={item.id}
                            item={item}
                            onAddToCart={onAddToCart}
                            onRemoveFromCart={onRemoveFromCart}
                            getItemQuantity={getItemQuantity}
                            isPremium={isPremium}
                            headingFont={headingFont}
                            isFeatured
                            onPreviewImage={() => item.image && setSelectedItemImage({ name: item.name, image: item.image, price: item.price })}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── RIGHT COLUMN ── */}
                <div className="space-y-6">
                  {/* Decorative skewer garnish separator */}
                  <div className="hidden md:flex items-center justify-center gap-2 py-1 opacity-70">
                    <span className="h-[1px] flex-1 bg-white/20" />
                    <span className="text-xs text-[#a65829] font-mono">✦ ✦ ✦</span>
                    <span className="h-[1px] flex-1 bg-white/20" />
                  </div>

                  {/* Render Categories mapped to Right (e.g. Best Water / Beverages) */}
                  {regularCategories.slice(Math.ceil(regularCategories.length / 2)).map((cat) => (
                    <section key={cat.id} aria-label={cat.name} className="space-y-2.5">
                      {/* Terracotta Banner Badge */}
                      <div className="inline-block bg-[#a65829] text-white text-xs sm:text-sm font-bold uppercase tracking-[0.2em] px-4 py-0.5 rounded shadow-sm border-t border-white/20">
                        {cat.name}
                      </div>

                      {/* Dishes List with Dotted Leaders */}
                      <div className="space-y-2 pt-1">
                        {cat.items.map((item) => (
                          <ChalkboardDishRow
                            key={item.id}
                            item={item}
                            onAddToCart={onAddToCart}
                            onRemoveFromCart={onRemoveFromCart}
                            getItemQuantity={getItemQuantity}
                            isPremium={isPremium}
                            headingFont={headingFont}
                            onPreviewImage={() => item.image && setSelectedItemImage({ name: item.name, image: item.image, price: item.price })}
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </div>

              {/* Board Footer */}
              <div className="relative z-10 w-full text-center pt-4 mt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-[#9c958b]">
                <span>All prices in USD &bull; Taxes included</span>
                <span
                  className="font-bold text-[#c27038] tracking-widest text-xs uppercase"
                  style={{ fontFamily: headingFont }}
                >
                  WWW.YOURSTEAK.COM
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          IMAGE PREVIEW POPUP MODAL (When tapping a dish)
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
            className="bg-[#1c1c1c] border-2 border-[#a65829] rounded-2xl p-4 max-w-sm w-full space-y-3 shadow-2xl relative"
          >
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-black/40 border border-white/10">
              <img
                src={selectedItemImage.image}
                alt={selectedItemImage.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base" style={{ fontFamily: headingFont }}>
                {selectedItemImage.name}
              </h3>
              <span className="font-bold text-[#c27038] text-base">
                ${selectedItemImage.price}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedItemImage(null)}
              className="w-full py-2 bg-[#a65829] hover:bg-[#8c461d] text-white text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer"
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
// CHALKBOARD DISH ROW COMPONENT (Dotted Leaders & Integrated Order Stepper)
// ─────────────────────────────────────────────────────────────────────────────
interface ChalkboardDishRowProps {
  item: any;
  onAddToCart?: (item: any, priceStr: string, variant?: string) => void;
  onRemoveFromCart?: (itemId: string, variant?: string) => void;
  getItemQuantity?: (itemId: string, variant?: string) => number;
  isPremium?: boolean;
  headingFont: string;
  isFeatured?: boolean;
  onPreviewImage?: () => void;
}

const ChalkboardDishRow: React.FC<ChalkboardDishRowProps> = ({
  item,
  onAddToCart,
  onRemoveFromCart,
  getItemQuantity,
  isPremium,
  headingFont,
  isFeatured,
  onPreviewImage,
}) => {
  const qty = getItemQuantity ? getItemQuantity(item.id) : 0;
  const pricing = parseItemPricing(item);
  const displayPrice = pricing.basePrice ?? item.price ?? 22;

  return (
    <article className="group flex items-center justify-between gap-2 py-0.5 hover:bg-white/[0.04] px-1 rounded transition-colors">
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        {/* Subtle Diet indicator dot */}
        <DietIndicator type={item.dietType} compact className="shrink-0 scale-90" />

        {/* Dish Name */}
        <button
          type="button"
          onClick={onPreviewImage}
          className={clsx(
            'text-left font-bold text-xs sm:text-sm tracking-wider uppercase truncate transition-colors cursor-pointer group-hover:text-[#c27038]',
            isFeatured ? 'text-white' : 'text-[#ece7df]'
          )}
          style={{ fontFamily: headingFont }}
          title={item.name}
        >
          {item.name}
        </button>

        {/* Dotted Leader Line */}
        <span className="flex-1 border-b border-dotted border-white/25 mx-1 translate-y-[2px]" />
      </div>

      {/* Right Price & Add to Cart stepper */}
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={clsx(
            'font-bold text-xs sm:text-sm tracking-wider',
            isFeatured ? 'text-[#c27038]' : 'text-white'
          )}
          style={{ fontFamily: headingFont }}
        >
          ${displayPrice}
        </span>

        {/* Unobtrusive Add Button or Quantity Stepper */}
        {isPremium && onAddToCart && (
          <div className="flex items-center">
            {qty > 0 ? (
              <div className="flex items-center gap-1 bg-[#a65829] rounded px-1 py-0.5 shadow-sm text-xs">
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
                className="w-5 h-5 rounded flex items-center justify-center bg-white/10 hover:bg-[#a65829] text-white transition-colors cursor-pointer opacity-70 group-hover:opacity-100"
              >
                <Plus size={12} />
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
};
