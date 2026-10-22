// MENUQR Design Engine — Authentic Heritage Artboard Composition
// Bespoke 1:1 Digital Artboard for Indian Tandoor, Chaap & Royal Dhaba Menus

import React from 'react';
import clsx from 'clsx';
import type { CompositionProps } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../../templates/shared/RenderItemPrices';
import { 
  MapPin, 
  Phone, 
  Coffee, 
  Flame, 
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

  // Category Hero Image Mapping (directly matching PDF artboard pages)
  const getCategoryHeroImage = (catName: string): string | null => {
    const lower = catName.toLowerCase();
    if (lower.includes('momo')) return '/uploads/mannat/momos.png';
    if (lower.includes('pizza')) return '/uploads/mannat/pizza.png';
    if (lower.includes('burger')) return '/uploads/mannat/burger.png';
    if (lower.includes('coffee') || lower.includes('brew') || lower.includes('tea')) return '/uploads/mannat/iced_coffee.png';
    if (lower.includes('garlic bread')) return '/uploads/mannat/garlic_bread.png';
    if (lower.includes('shake')) return '/uploads/mannat/shake.png';
    if (lower.includes('dessert')) return '/uploads/mannat/dessert.png';
    if (lower.includes('labanese') || lower.includes('lebanese')) return '/uploads/mannat/falafel.png';
    if (lower.includes('fries') || lower.includes('nachos')) return '/uploads/mannat/fries.png';
    if (lower.includes('chaap') || lower.includes('paneer feast') || lower.includes('platter')) return '/uploads/mannat/hero_chaap.png';
    return null;
  };

  // Category Hindi Subtitle mapping (from PDF Artboard)
  const getCategoryHindiSubtitle = (catName: string): string => {
    const lower = catName.toLowerCase();
    if (lower.includes('chaap')) return 'चांप का असली स्वाद • 100% शुद्ध सोया';
    if (lower.includes('paneer')) return 'शाही पनीर का खज़ाना';
    if (lower.includes('momo')) return 'स्टीम्ड • कुरकुरे • तंदूरी • मलाई मोमोज़';
    if (lower.includes('roll')) return 'गरमा-गरम रुमाली रोल्स विथ स्पेशल ग्रेवी';
    if (lower.includes('pizza')) return 'स्टोन बेक्ड थिन क्रस्ट पिज़्ज़ा';
    if (lower.includes('burger')) return 'गॉरमेट लोडेड बर्गर व सैंडविच';
    if (lower.includes('coffee') || lower.includes('brew')) return 'हॉट व कोल्ड अरेबिका कॉफी';
    if (lower.includes('shake')) return 'गाढ़े व स्वादिष्ट थिक शेक्स';
    if (lower.includes('dessert')) return 'सिज़लिंग ब्राउनी व गुलाब जामुन';
    if (lower.includes('dal')) return 'दाल मखनी व स्पेशल तड़का';
    if (lower.includes('biryani') || lower.includes('rice')) return 'दम बिरयानी व पुलाव';
    if (lower.includes('bread')) return 'तंदूरी रोटी, नान व पराठा';
    if (lower.includes('thali') || lower.includes('combo')) return 'स्पेशल थाली व भोजन कॉम्बो';
    return 'मनपसंद शुद्ध शाकाहारी व्यंजन';
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
          MASTHEAD: ROYAL ARTBOARD CREST (PDF Page 1 & 17 style)
          ═══════════════════════════════════════════════════════════════════════ */}
      <header
        className="relative overflow-hidden p-6 sm:p-8 rounded-3xl shadow-xl border text-center transition-all"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: 'rgba(206, 24, 44, 0.25)',
          boxShadow: '0 10px 30px -10px rgba(206, 24, 44, 0.15)',
        }}
      >
        {/* Subtle Ornamental Top Filigree Banner */}
        <div 
          className="absolute top-0 left-0 right-0 h-2" 
          style={{ 
            background: 'linear-gradient(90deg, #FAB700 0%, #CE182C 50%, #FAB700 100%)' 
          }} 
        />

        <div className="flex flex-col items-center justify-center space-y-3.5 max-w-2xl mx-auto">
          {/* Circular Mascot Emblem with Concentric Gold Rings */}
          {restaurant.logo ? (
            <div 
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1.5 shadow-xl border-2 flex items-center justify-center bg-white"
              style={{ borderColor: '#FAB700' }}
            >
              <img
                src={restaurant.logo}
                alt={restaurant.name}
                className="w-full h-full object-contain rounded-full"
              />
            </div>
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center font-black text-2xl border-2 shadow-lg"
              style={{
                backgroundColor: '#CE182C',
                borderColor: '#FAB700',
                color: '#FFFFFF',
              }}
            >
              {restaurant.name.charAt(0)}
            </div>
          )}

          {/* Restaurant Title (Bold Royal Serif) */}
          <div className="space-y-1">
            <h1
              className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight"
              style={{
                fontFamily: typography.headingFont || "'Playfair Display', serif",
                color: '#CE182C',
                textShadow: '0 1px 2px rgba(206, 24, 44, 0.1)',
              }}
            >
              {restaurant.name}
            </h1>

            {/* Tagline & Slogan */}
            {restaurant.tagline && (
              <p
                className="text-xs sm:text-sm font-bold tracking-wide uppercase flex items-center justify-center gap-2"
                style={{ color: '#FAB700' }}
              >
                <span className="hidden sm:inline">⚜</span>
                <span className="text-[#CE182C] dark:text-[#E53935]">{restaurant.tagline}</span>
                <span className="hidden sm:inline">⚜</span>
              </p>
            )}
          </div>

          {/* 100% Pure Soya & Veg Assurance Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>100% PURE VEG & SOYA SPECIALITIES</span>
          </div>

          {/* Contact & Address Bar */}
          {(restaurant.address || restaurant.phone) && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-[11px] font-medium text-[#55635C]">
              {restaurant.phone && (
                <a
                  href={`tel:${restaurant.phone}`}
                  className="flex items-center gap-1.5 hover:text-[#CE182C] transition-colors"
                >
                  <Phone size={12} className="text-[#CE182C]" />
                  <span>{restaurant.phone}</span>
                </a>
              )}
              {restaurant.address && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-[#CE182C]" />
                  <span>{restaurant.address}</span>
                </div>
              )}
            </div>
          )}
        </div>
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
          const heroImage = getCategoryHeroImage(cat.name);
          const hindiSubtitle = getCategoryHindiSubtitle(cat.name);
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
                  SECTION RIBBON HEADER (Exact PDF Page Banner)
                  ───────────────────────────────────────────────────────────── */}
              <div 
                className="relative overflow-hidden rounded-2xl p-4 sm:p-5 text-center text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4"
                style={{
                  background: 'linear-gradient(135deg, #B71C1C 0%, #CE182C 50%, #991B1B 100%)',
                  border: '2px solid #FAB700',
                  boxShadow: '0 4px 15px rgba(206, 24, 44, 0.25)',
                }}
              >
                <div className="text-center sm:text-left space-y-1 flex-1">
                  <div className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-[#FAB700]">
                    <Flame size={12} />
                    <span>Mannat Special Chapter</span>
                  </div>
                  <h2 
                    className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white"
                    style={{ fontFamily: typography.headingFont || "'Playfair Display', serif" }}
                  >
                    {cat.name}
                  </h2>
                  <p className="text-xs font-medium text-amber-200/90 font-serif">
                    {hindiSubtitle}
                  </p>
                </div>

                {/* Section Hero Photo Badge if available */}
                {heroImage && (
                  <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-[#FAB700] shadow-md bg-white p-1">
                    <img
                      src={heroImage}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                )}
              </div>

              {/* Coffee Syrup Callout Notice if beverage */}
              {(cat.name.toLowerCase().includes('coffee') || cat.name.toLowerCase().includes('brew')) && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center justify-between">
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
                <div className="overflow-x-auto rounded-2xl border border-black/10 shadow-sm">
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

                          {/* Variants / Portion chips */}
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
          FOOTER CREST: GUARANTEE & THANKS
          ═══════════════════════════════════════════════════════════════════════ */}
      <footer className="pt-8 pb-12 text-center space-y-2 border-t border-[#CE182C]/20">
        <div className="text-xs font-bold uppercase tracking-wider text-[#CE182C] flex items-center justify-center gap-2">
          <span>⚜</span>
          <span>Mannat Tandoori Junction</span>
          <span>⚜</span>
        </div>
        <p className="text-xs text-[#55635C]">
          Authentic North Indian, Chaap Specialities & Tandoor Delights. Prepared fresh with care.
        </p>
      </footer>
    </div>
  );
};

export default HeritageArtboardComposition;
