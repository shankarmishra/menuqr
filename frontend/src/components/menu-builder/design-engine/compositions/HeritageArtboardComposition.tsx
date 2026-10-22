// MENUQR Design Engine — Authentic Heritage Artboard Composition
// Bespoke 1:1 Digital Artboard for Indian Tandoor, Chaap & Royal Dhaba Menus
// Powered by Authentic Extracted PDF Artboard Banners, Textures & 3-Tier Interactive Matrix

import React from 'react';
import clsx from 'clsx';
import type { CompositionProps } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../../templates/shared/RenderItemPrices';
import { 
  MapPin, 
  Phone, 
  Coffee, 
  Plus
} from 'lucide-react';

export const HeritageArtboardComposition: React.FC<CompositionProps> = ({
  spec,
  restaurant,
  categories,
  rawCategories,
  compact: _compact,
  onAddToCart,
  isPremium,
  activeCategory,
  setActiveCategory,
  searchBar,
}) => {
  const { colors, typography } = spec;

  // Chapter Banner Mapping (Directly from Art Board 3.pdf pages)
  const getCategoryBanner = (catName: string): string => {
    const lower = catName.toLowerCase();
    if (lower.includes('momo')) return '/uploads/mannat/textures/banner_momos.webp';
    if (lower.includes('pizza') || lower.includes('burger') || lower.includes('sandwich')) return '/uploads/mannat/textures/banner_pizza_burger.webp';
    if (lower.includes('coffee') || lower.includes('brew') || lower.includes('tea') || lower.includes('garlic bread')) return '/uploads/mannat/textures/banner_coffee_garlicbread.webp';
    if (lower.includes('shake') || lower.includes('boba')) return '/uploads/mannat/textures/banner_thick_shakes.webp';
    if (lower.includes('dessert') || lower.includes('cooler')) return '/uploads/mannat/textures/banner_desserts.webp';
    if (lower.includes('labanese') || lower.includes('lebanese') || lower.includes('fries') || lower.includes('nachos')) return '/uploads/mannat/textures/banner_lebanese_fries.webp';
    if (lower.includes('chinese') || lower.includes('noodle') || lower.includes('wok') || lower.includes('fried rice')) return '/uploads/mannat/textures/banner_chinese_wok.webp';
    if (lower.includes('thali') || lower.includes('combo')) return '/uploads/mannat/textures/banner_thalis_combos.webp';
    if (lower.includes('street')) return '/uploads/mannat/textures/banner_street_specials.webp';
    if (lower.includes('soya grav')) return '/uploads/mannat/textures/banner_soya_gravies.webp';
    if (lower.includes('desi') || lower.includes('rice') || lower.includes('biryani')) return '/uploads/mannat/textures/banner_desi_junction.webp';
    if (lower.includes('khazana') || lower.includes('dal')) return '/uploads/mannat/textures/banner_paneer_khazana.webp';
    if (lower.includes('platter') || lower.includes('kebab')) return '/uploads/mannat/textures/banner_signature_platters.webp';
    if (lower.includes('paneer feast') || lower.includes('roll')) return '/uploads/mannat/textures/banner_paneer_feast.webp';
    return '/uploads/mannat/textures/banner_chaap.webp';
  };

  return (
    <div
      className="relative z-10 space-y-6 max-w-5xl mx-auto w-full transition-colors duration-300"
      style={{
        color: colors.text,
        fontFamily: typography.bodyFont,
      }}
    >
      {/* ═══════════════════════════════════════════════════════════════════════
          MASTHEAD: AUTHENTIC PDF COVER ARTBOARD (Page 1)
          ═══════════════════════════════════════════════════════════════════════ */}
      <header className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-[#FAB700]/50 bg-white">
        <picture>
          <source srcSet="/uploads/mannat/textures/masthead_main.webp" type="image/webp" />
          <img
            src="/uploads/mannat/textures/masthead_main.png"
            alt={restaurant.name}
            className="w-full h-auto object-cover select-none"
            loading="eager"
          />
        </picture>

        {/* Contact Quick Action Strip below the authentic banner */}
        {(restaurant.address || restaurant.phone) && (
          <div className="bg-[#1F2923] text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs border-t-2 border-[#FAB700]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-[#FAB700] uppercase tracking-wider text-[11px]">
                Chaap Ka Asli Swad • 100% Pure Soya
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-medium">
              {restaurant.phone && (
                <a
                  href={`tel:${restaurant.phone}`}
                  className="flex items-center gap-1.5 text-white/90 hover:text-[#FAB700] transition-colors"
                >
                  <Phone size={12} className="text-[#FAB700]" />
                  <span>{restaurant.phone}</span>
                </a>
              )}
              {restaurant.address && (
                <div className="hidden sm:flex items-center gap-1.5 text-white/80">
                  <MapPin size={12} className="text-[#FAB700]" />
                  <span>{restaurant.address}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════════════════════════════════════
          SEARCH BAR
          ═══════════════════════════════════════════════════════════════════════ */}
      {searchBar}

      {/* ═══════════════════════════════════════════════════════════════════════
          STICKY CATEGORY NAVIGATION PILLS
          ═══════════════════════════════════════════════════════════════════════ */}
      <nav
        aria-label="Menu Sections"
        className="sticky top-14 z-20 bg-[#FFFDF9]/95 dark:bg-[#121212]/95 backdrop-blur-md py-2.5 px-2 rounded-2xl shadow-sm border border-black/5 overflow-x-auto scrollbar-none flex items-center gap-1.5"
      >
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={clsx(
            'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all',
            activeCategory === 'all'
              ? 'bg-[#CE182C] text-white shadow-md'
              : 'bg-white dark:bg-white/5 text-[#1F2923] dark:text-white/80 hover:bg-[#CE182C]/10 border border-black/5'
          )}
        >
          All Items ({rawCategories.reduce((acc, c) => acc + c.items.length, 0)})
        </button>
        {rawCategories.map((cat) => {
          const isActive = activeCategory === cat.id || activeCategory === cat.name;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={clsx(
                'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5',
                isActive
                  ? 'bg-[#CE182C] text-white shadow-md'
                  : 'bg-white dark:bg-white/5 text-[#1F2923] dark:text-white/80 hover:bg-[#CE182C]/10 border border-black/5'
              )}
            >
              <span>{cat.name}</span>
              <span className="text-[10px] opacity-75 font-mono">({cat.items.length})</span>
            </button>
          );
        })}
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTIONS & DISHES (AUTHENTIC ARTBOARD LAYOUT)
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-10">
        {categories.map((cat) => {
          const chapterBanner = getCategoryBanner(cat.name);
          const isMomoSection = cat.name.toLowerCase().includes('momo');

          return (
            <section
              key={cat.id}
              className="space-y-4 rounded-3xl p-4 sm:p-6 bg-white shadow-md border"
              style={{
                borderColor: 'rgba(206, 24, 44, 0.15)',
              }}
            >
              {/* ─────────────────────────────────────────────────────────────
                  CHAPTER HEADER BANNER (Authentic PDF Artboard Plate)
                  ───────────────────────────────────────────────────────────── */}
              <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-[#FAB700]/70 bg-[#1F2923]">
                <picture>
                  <source srcSet={chapterBanner} type="image/webp" />
                  <img
                    src={chapterBanner.replace('.webp', '.png')}
                    alt={cat.name}
                    className="w-full h-auto object-cover select-none"
                    loading="lazy"
                  />
                </picture>
              </div>

              {/* Coffee Syrup Callout Notice if beverage */}
              {(cat.name.toLowerCase().includes('coffee') || cat.name.toLowerCase().includes('brew')) && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center justify-between shadow-xs">
                  <span className="flex items-center gap-1.5">
                    <Coffee size={14} className="text-amber-700" />
                    <span>Flavour Syrups: Hazelnut • Caramel • Irish • Vanilla • Chocolate</span>
                  </span>
                  <span className="font-mono font-bold bg-amber-200 px-2 py-0.5 rounded text-[11px]">+₹39</span>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  SPECIAL LAYOUT: MOMO JUNCTION 3-TIER MATRIX TABLE (Page 10)
                  ───────────────────────────────────────────────────────────── */}
              {isMomoSection ? (
                <div className="overflow-x-auto rounded-2xl border-2 border-[#FAB700]/50 shadow-md">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr 
                        className="text-white text-xs font-black uppercase tracking-wider"
                        style={{ backgroundColor: '#1F2923' }}
                      >
                        <th className="py-3 px-3 sm:px-4">Preparation Style</th>
                        <th className="py-3 px-3 text-center bg-emerald-950/80 text-emerald-300">
                          Veg (6 Pcs)
                        </th>
                        <th className="py-3 px-3 text-center bg-amber-950/80 text-amber-300">
                          Paneer (6 Pcs)
                        </th>
                        <th className="py-3 px-3 text-center bg-orange-950/80 text-orange-300">
                          Corn N Cheese
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 text-xs">
                      {cat.items.map((item, idx) => {
                        const vegVar = item.variants?.find((v) => v.name.toLowerCase().includes('veg'));
                        const panVar = item.variants?.find((v) => v.name.toLowerCase().includes('paneer'));
                        const chzVar = item.variants?.find((v) => v.name.toLowerCase().includes('corn') || v.name.toLowerCase().includes('cheese'));

                        return (
                          <tr 
                            key={item.id}
                            className={idx % 2 === 0 ? 'bg-white hover:bg-black/5' : 'bg-[#FFFDF9] hover:bg-black/5'}
                          >
                            <td className="py-3 px-3 sm:px-4 font-bold text-[#1F2923]">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                                <span>{item.name}</span>
                              </div>
                            </td>

                            {/* Veg Column */}
                            <td className="py-3 px-2 text-center">
                              {vegVar ? (
                                <button
                                  type="button"
                                  onClick={() => onAddToCart && onAddToCart(item, `₹${vegVar.price}`, vegVar.name)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95"
                                  title={`Add Veg ${item.name}`}
                                >
                                  <span>₹{vegVar.price}</span>
                                  {isPremium && <Plus size={12} />}
                                </button>
                              ) : (
                                <span className="text-black/30 font-mono">—</span>
                              )}
                            </td>

                            {/* Paneer Column */}
                            <td className="py-3 px-2 text-center">
                              {panVar ? (
                                <button
                                  type="button"
                                  onClick={() => onAddToCart && onAddToCart(item, `₹${panVar.price}`, panVar.name)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-600 hover:text-white transition-all shadow-sm active:scale-95"
                                  title={`Add Paneer ${item.name}`}
                                >
                                  <span>₹{panVar.price}</span>
                                  {isPremium && <Plus size={12} />}
                                </button>
                              ) : (
                                <span className="text-black/30 font-mono">—</span>
                              )}
                            </td>

                            {/* Corn N Cheese Column */}
                            <td className="py-3 px-2 text-center">
                              {chzVar ? (
                                <button
                                  type="button"
                                  onClick={() => onAddToCart && onAddToCart(item, `₹${chzVar.price}`, chzVar.name)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-orange-50 text-orange-900 border border-orange-300 hover:bg-orange-600 hover:text-white transition-all shadow-sm active:scale-95"
                                  title={`Add Corn N Cheese ${item.name}`}
                                >
                                  <span>₹{chzVar.price}</span>
                                  {isPremium && <Plus size={12} />}
                                </button>
                              ) : (
                                <span className="text-black/30 font-mono">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* ─────────────────────────────────────────────────────────────
                    STANDARD 2-COLUMN LUXURY DHABA / ARTBOARD GRID
                    ───────────────────────────────────────────────────────────── */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cat.items.map((item) => {
                    const pricing = parseItemPricing(item);

                    return (
                      <article
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-white hover:bg-[#FFFDF9] transition-all duration-200 border border-black/5 hover:border-[#CE182C]/30 shadow-sm hover:shadow-md flex items-start gap-3 justify-between"
                      >
                        {/* Dish Details */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <DietIndicator type={item.dietType} compact className="shrink-0" />
                            <h3
                              className="font-bold text-sm text-[#1F2923] leading-snug"
                              title={item.name}
                            >
                              {item.name}
                            </h3>
                            {item.isBestseller && (
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#CE182C] text-white">
                                MTJ Special
                              </span>
                            )}
                          </div>

                          {pricing.cleanDescription && (
                            <p className="text-xs text-[#55635C] line-clamp-2 leading-relaxed">
                              {pricing.cleanDescription}
                            </p>
                          )}

                          {/* Variants / Portion chips (Half / Full / 2 Pcs / 4 Pcs) */}
                          {pricing.hasVariants && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {pricing.variants.map((v) => (
                                <button
                                  key={v.name}
                                  type="button"
                                  onClick={() => onAddToCart && onAddToCart(item, `₹${v.price}`, v.name)}
                                  className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#FFF9F0] text-[#CE182C] border border-[#CE182C]/20 hover:bg-[#CE182C] hover:text-white transition-all flex items-center gap-1 shadow-xs active:scale-95"
                                >
                                  <span>{v.name}: ₹{v.price}</span>
                                  {isPremium && <Plus size={10} />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Right: Dish Photo & Single/Portion Price Controls */}
                        <div className="shrink-0 flex flex-col items-end gap-2">
                          {item.image && (
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-[#FAB700]/60 shadow-sm bg-white p-0.5">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover rounded-lg"
                                loading="lazy"
                              />
                            </div>
                          )}

                          {!pricing.hasVariants && (
                            <RenderItemPrices
                              item={item}
                              accentColor="#CE182C"
                              isPremium={isPremium}
                              onAddToCart={onAddToCart}
                              priceClassName="font-mono font-black text-sm tracking-tight text-[#CE182C]"
                              btnStyle="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#CE182C] text-white shadow-sm hover:bg-[#991B1B] cursor-pointer"
                              compact={false}
                            />
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          FOOTER CREST: AUTHENTIC PDF ARTBOARD MASCOT FOOTER (Page 17)
          ═══════════════════════════════════════════════════════════════════════ */}
      <footer className="pt-6 pb-12 rounded-3xl overflow-hidden shadow-2xl border-2 border-[#FAB700]/50 bg-white">
        <picture>
          <source srcSet="/uploads/mannat/textures/footer_mascot.webp" type="image/webp" />
          <img
            src="/uploads/mannat/textures/footer_mascot.png"
            alt="Mannat Tandoori Junction Footer"
            className="w-full h-auto object-cover select-none"
            loading="lazy"
          />
        </picture>
      </footer>
    </div>
  );
};

export default HeritageArtboardComposition;
