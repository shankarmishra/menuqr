import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import type { LayoutProps, CategoryGroup } from '../types';
import { ShobharamBespokeCover } from './ShobharamBespokeCover';
import { ChalkboardDoodleBg } from '../artwork/FoodDoodleBackgrounds';
import {
  BookOpen,
  Sparkles,
  Phone,
  MapPin,
  Globe,
  HeartHandshake,
  Plus,
  Grid,
  ShieldCheck,
  Star,
} from 'lucide-react';

export interface ShobharamBookletSpreadProps extends LayoutProps {
  // Inherits all LayoutProps
}

export const ShobharamBookletSpread: React.FC<LayoutProps> = ({
  restaurant,
  categories = [],
  rawCategories = [],
  compact = false,
  onAddToCart,
  searchBar,
}) => {
  // Navigation tabs: 'cover' | 'starters-mains' | 'thalis-breads' | 'south-chinese' | 'sweets-beverages' | 'all'
  const [activeTab, setActiveTab] = useState<
    'cover' | 'starters-mains' | 'thalis-breads' | 'south-chinese' | 'sweets-beverages' | 'all'
  >('cover');

  const displayCategories = categories.length > 0 ? categories : rawCategories;

  // Group categories into thematic booklet chapters
  const chapters = useMemo(() => {
    const findCats = (regex: RegExp) =>
      displayCategories.filter((c) => regex.test(c.name));

    const startersAndSnacks = findCats(/starter|snack|chaat|appetizer|crispy|breakfast/i);
    const specialsAndMains = findCats(/special|main|curry|sabzi|paneer|dal/i);
    const thalisAndMeals = findCats(/thali|meal|combo/i);
    const breadsAndRice = findCats(/bread|roti|naan|paratha|kulcha|rice|biryani/i);
    const southIndian = findCats(/south|dosa|idli|vada|uttapam/i);
    const chineseAndMomos = findCats(/chinese|noodle|momo|wok|fried rice|soup/i);
    const sweetsAndDesserts = findCats(/sweet|dessert|halwa|jamun|kulfi/i);
    const beverages = findCats(/drink|beverage|shake|coffee|tea|lassi|cooler|accompaniment|extra|add-on/i);

    // Fallback unmapped categories
    const mappedIds = new Set([
      ...startersAndSnacks,
      ...specialsAndMains,
      ...thalisAndMeals,
      ...breadsAndRice,
      ...southIndian,
      ...chineseAndMomos,
      ...sweetsAndDesserts,
      ...beverages,
    ].map((c) => c.id));

    const others = displayCategories.filter((c) => !mappedIds.has(c.id));

    return {
      spread1: {
        title: 'Starters & Royal Signatures',
        subtitle: 'Crunchy Bites & Slow-Cooked Delicacies',
        left: startersAndSnacks.length > 0 ? startersAndSnacks : displayCategories.slice(0, 2),
        right: specialsAndMains.length > 0 ? specialsAndMains : displayCategories.slice(2, 4),
        leftPhoto: '/uploads/shobharam/dishes/dish_starters.webp',
        rightPhoto: '/uploads/shobharam/generated_cover_hero_circle.webp',
      },
      spread2: {
        title: 'Royal Thalis & Tandoor Breads',
        subtitle: 'Opulent Feasts with 100% Desi Ghee',
        left: thalisAndMeals.length > 0 ? thalisAndMeals : displayCategories.slice(4, 6),
        right: breadsAndRice.length > 0 ? breadsAndRice : displayCategories.slice(6, 8),
        leftPhoto: '/uploads/shobharam/dish_royal_thali.webp',
        rightPhoto: '/uploads/shobharam/dishes/dish_platter.webp',
      },
      spread3: {
        title: 'South Indian & Indo-Chinese',
        subtitle: 'Crispy Golden Dosas & Wok Specialties',
        left: southIndian.length > 0 ? southIndian : displayCategories.slice(8, 10),
        right: chineseAndMomos.length > 0 ? chineseAndMomos : displayCategories.slice(10, 12),
        leftPhoto: '/uploads/shobharam/dishes/dish_pasta.webp',
        rightPhoto: '/uploads/shobharam/dishes/dish_noodles.webp',
      },
      spread4: {
        title: 'Traditional Sweets & Beverages',
        subtitle: 'Authentic Heritage Mawa, Shakes & Coolers',
        left: sweetsAndDesserts.length > 0 ? sweetsAndDesserts : displayCategories.slice(12, 14),
        right: [...beverages, ...others],
        leftPhoto: '/uploads/shobharam/dish_sweets_luxury.webp',
        rightPhoto: '/uploads/shobharam/dishes/dish_coffee.webp',
      },
    };
  }, [displayCategories]);

  // Total items count
  const totalItemCount = useMemo(() => {
    return displayCategories.reduce((acc, cat) => acc + (cat.items?.length || 0), 0);
  }, [displayCategories]);

  const phone = restaurant.phone || '+91 98765 43210';
  const address = [restaurant.address, restaurant.city].filter(Boolean).join(', ') || 'Main Market, City Center';
  const website = (restaurant as any).website || 'WWW.MENUSQR.IN';

  // Helper to render a single culinary section block (similar to reference mockup)
  const renderCategoryColumn = (
    cat: CategoryGroup,
    photoUrl?: string,
    photoBadge?: string
  ) => {
    if (!cat || !cat.items || cat.items.length === 0) return null;

    return (
      <div key={cat.id} className="relative rounded-2xl bg-black/60 border border-[#D4AF37]/30 p-4 sm:p-5 backdrop-blur-md shadow-xl space-y-4">
        {/* Subtle Section Chalk Border Inset */}
        <div className="absolute inset-1.5 rounded-xl border border-dashed border-[#D4AF37]/15 pointer-events-none" />

        {/* Section Header with Circular Photo Callout */}
        <div className="flex items-center justify-between gap-3 border-b border-[#D4AF37]/30 pb-3 relative z-10">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#F5C542] flex items-center gap-1">
              <Sparkles size={11} />
              <span>Royal Selection</span>
            </span>
            <h3
              className="text-lg sm:text-xl font-black uppercase text-white tracking-wide"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {cat.name}
            </h3>
          </div>

          {photoUrl && (
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/30 to-emerald-500/30 blur-xs" />
              <img
                src={photoUrl}
                alt={cat.name}
                className="relative z-10 w-full h-full object-cover rounded-full border-2 border-[#D4AF37] shadow-lg transform hover:scale-110 transition-transform duration-300"
                loading="lazy"
                decoding="async"
              />
              {photoBadge && (
                <span className="absolute -bottom-1 -right-1 z-20 px-1.5 py-0.5 rounded-full bg-emerald-600 text-[8px] font-bold text-white border border-emerald-400">
                  {photoBadge}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Dish Items Listing (Format matching reference mockup: Number, Name, Price) */}
        <div className="space-y-2.5 relative z-10">
          {cat.items.map((item, idx) => {
            const numStr = String(idx + 1).padStart(2, '0');
            const singlePrice = item.price;
            const hasHalfFull = item.halfPrice || item.fullPrice;

            return (
              <div
                key={item.id}
                className="group flex flex-col p-2 rounded-xl hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <span className="text-xs font-mono font-bold text-[#F5C542] shrink-0 pt-0.5">
                      {numStr}.
                    </span>

                    {/* Veg dot icon */}
                    <span className="w-3.5 h-3.5 rounded-xs border border-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-gray-100 group-hover:text-[#F5C542] transition-colors">
                          {item.name}
                        </span>
                        {item.isBestseller && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 text-[9px] font-bold">
                            <Star size={9} className="fill-amber-400 text-amber-400" />
                            <span>Popular</span>
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-[10px] sm:text-[11px] text-gray-400 line-clamp-1 mt-0.5 font-sans">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price Block & Action Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    {hasHalfFull ? (
                      <div className="text-right text-[10px] sm:text-xs font-mono font-bold">
                        {item.halfPrice && (
                          <span className="text-gray-300 block">H: ₹{item.halfPrice}/-</span>
                        )}
                        {item.fullPrice && (
                          <span className="text-[#F5C542] block">F: ₹{item.fullPrice}/-</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs sm:text-sm font-mono font-bold text-[#F5C542]">
                        ₹{singlePrice}/-
                      </span>
                    )}

                    {onAddToCart && (
                      <button
                        type="button"
                        onClick={() =>
                          onAddToCart(
                            item,
                            hasHalfFull ? `₹${item.fullPrice || item.halfPrice}` : `₹${singlePrice}`
                          )
                        }
                        className="w-6 h-6 rounded-lg bg-[#D4AF37]/20 hover:bg-[#D4AF37] text-amber-300 hover:text-black border border-[#D4AF37]/50 flex items-center justify-center transition-all active:scale-90"
                        title="Add to Order"
                      >
                        <Plus size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Helper to render an entire booklet 2-page spread
  const renderSpread = (
    spread: {
      title: string;
      subtitle: string;
      left: CategoryGroup[];
      right: CategoryGroup[];
      leftPhoto: string;
      rightPhoto: string;
    },
    spreadNumber: number
  ) => {
    return (
      <div key={spreadNumber} className="relative w-full max-w-5xl mx-auto rounded-3xl border border-[#D4AF37]/40 shadow-2xl bg-[#0B0E0D] text-[#F3F4F6] p-4 sm:p-8 my-6 overflow-hidden">
        {/* Authentic Background Texture & Doodles */}
        <ChalkboardDoodleBg opacity={0.12} />
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Ambient Warm Golden Glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(circle at 20% 20%, rgba(212, 175, 55, 0.12) 0%, transparent 40%),
              radial-gradient(circle at 80% 80%, rgba(30, 94, 58, 0.15) 0%, transparent 45%)
            `,
          }}
        />

        {/* Corner Ornaments */}
        <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-[#F5C542] pointer-events-none" />
        <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-[#F5C542] pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-[#F5C542] pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-[#F5C542] pointer-events-none" />

        {/* Spread Top Header Ribbon */}
        <div className="relative z-10 flex flex-col items-center text-center pb-6 border-b border-[#D4AF37]/30 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#1E5E3A]/40 border border-[#1E5E3A] text-[10px] font-bold tracking-widest uppercase text-emerald-300 mb-1.5">
            <ShieldCheck size={11} className="text-emerald-400" />
            <span>SHOBHARAM&apos;S BOOKLET • CHAPTER {spreadNumber}</span>
          </div>

          <h2
            className="text-2xl sm:text-4xl font-black uppercase text-white tracking-wide"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {spread.title}
          </h2>

          <p
            className="text-xs sm:text-sm text-[#F5C542] italic mt-1 font-serif"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {spread.subtitle}
          </p>
        </div>

        {/* Two-Column Interior Booklet Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column Categories */}
          <div className="space-y-6">
            {spread.left.map((cat) =>
              renderCategoryColumn(cat, spread.leftPhoto, 'Chef Pick')
            )}
          </div>

          {/* Right Column Categories */}
          <div className="space-y-6">
            {spread.right.map((cat) =>
              renderCategoryColumn(cat, spread.rightPhoto, 'Must Try')
            )}
          </div>
        </div>

        {/* Footer Ribbon & Page Marker */}
        <div className="relative z-10 pt-6 mt-8 border-t border-[#D4AF37]/30 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F5C542]" />
            <span className="font-bold text-gray-200">Shobharam&apos;s Pure Veg</span>
          </div>
          <span className="font-mono text-[#F5C542] font-bold">PAGE 0{spreadNumber + 1}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full select-text font-serif text-[#F3F4F6] relative max-w-5xl mx-auto my-2">
      {/* ── Sticky Chapter / View Switcher Bar ────────────────────────── */}
      <div className="pt-2 pb-2 flex items-center justify-center sticky top-2 z-40 px-2">
        <div className="flex items-center gap-1 p-1.5 bg-[#0B0E0D]/95 backdrop-blur-md rounded-full border border-[#D4AF37]/60 shadow-2xl overflow-x-auto max-w-full scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('cover')}
            className={clsx(
              'px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5',
              activeTab === 'cover'
                ? 'bg-gradient-to-r from-[#D4AF37] via-[#F5C542] to-[#D4AF37] text-black shadow-md font-extrabold'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            )}
          >
            <BookOpen size={13} />
            <span>📖 Cover</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('starters-mains')}
            className={clsx(
              'px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5',
              activeTab === 'starters-mains'
                ? 'bg-gradient-to-r from-[#D4AF37] via-[#F5C542] to-[#D4AF37] text-black shadow-md font-extrabold'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            )}
          >
            <span>🍛 Starters & Mains</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('thalis-breads')}
            className={clsx(
              'px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5',
              activeTab === 'thalis-breads'
                ? 'bg-gradient-to-r from-[#D4AF37] via-[#F5C542] to-[#D4AF37] text-black shadow-md font-extrabold'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            )}
          >
            <span>🍱 Thalis & Breads</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('south-chinese')}
            className={clsx(
              'px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5',
              activeTab === 'south-chinese'
                ? 'bg-gradient-to-r from-[#D4AF37] via-[#F5C542] to-[#D4AF37] text-black shadow-md font-extrabold'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            )}
          >
            <span>🥞 Dosas & Chinese</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sweets-beverages')}
            className={clsx(
              'px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5',
              activeTab === 'sweets-beverages'
                ? 'bg-gradient-to-r from-[#D4AF37] via-[#F5C542] to-[#D4AF37] text-black shadow-md font-extrabold'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            )}
          >
            <span>🍨 Sweets & Drinks</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={clsx(
              'px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5',
              activeTab === 'all'
                ? 'bg-gradient-to-r from-[#D4AF37] via-[#F5C542] to-[#D4AF37] text-black shadow-md font-extrabold'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            )}
          >
            <Grid size={13} />
            <span>❖ All Spreads ({totalItemCount})</span>
          </button>
        </div>
      </div>

      {/* ── Optional Universal Search Bar ─────────────────────────────── */}
      {searchBar && activeTab !== 'cover' && (
        <div className="max-w-xl mx-auto px-4 py-2">{searchBar}</div>
      )}

      {/* ── Render Content Based on Active Tab ────────────────────────── */}
      {activeTab === 'cover' && (
        <section aria-label="Shobharam Front Cover" className="w-full flex justify-center py-2 animate-in fade-in duration-300">
          <ShobharamBespokeCover
            restaurant={restaurant}
            categories={displayCategories}
            onExploreMenu={() => setActiveTab('starters-mains')}
            compact={compact}
          />
        </section>
      )}

      {activeTab === 'starters-mains' && (
        <section aria-label="Starters & Royal Signatures" className="animate-in fade-in duration-300">
          {renderSpread(chapters.spread1, 1)}
        </section>
      )}

      {activeTab === 'thalis-breads' && (
        <section aria-label="Royal Thalis & Tandoor Breads" className="animate-in fade-in duration-300">
          {renderSpread(chapters.spread2, 2)}
        </section>
      )}

      {activeTab === 'south-chinese' && (
        <section aria-label="South Indian & Indo-Chinese" className="animate-in fade-in duration-300">
          {renderSpread(chapters.spread3, 3)}
        </section>
      )}

      {activeTab === 'sweets-beverages' && (
        <section aria-label="Traditional Sweets & Beverages" className="animate-in fade-in duration-300">
          {renderSpread(chapters.spread4, 4)}
        </section>
      )}

      {activeTab === 'all' && (
        <section aria-label="Complete Shobharam Booklet" className="space-y-6 animate-in fade-in duration-300">
          <div className="w-full flex justify-center py-2">
            <ShobharamBespokeCover
              restaurant={restaurant}
              categories={displayCategories}
              compact={compact}
            />
          </div>
          {renderSpread(chapters.spread1, 1)}
          {renderSpread(chapters.spread2, 2)}
          {renderSpread(chapters.spread3, 3)}
          {renderSpread(chapters.spread4, 4)}
        </section>
      )}

      {/* Booklet Universal Footer Plaque */}
      {activeTab !== 'cover' && (
        <footer className="relative z-10 mt-6 mx-auto max-w-5xl p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#141A17] to-[#0A0D0B] border border-[#D4AF37]/40 shadow-inner">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#F5C542] flex items-center gap-1">
                <HeartHandshake size={12} />
                <span>{totalItemCount} Pure Veg Dishes • Free Home Delivery</span>
              </span>
              <a
                href={`tel:${phone}`}
                className="text-xs sm:text-sm font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 mt-0.5 transition-colors"
              >
                <Phone size={13} className="text-[#F5C542]" />
                <span>{phone}</span>
              </a>
            </div>

            <div className="flex flex-col items-center sm:items-end text-xs text-gray-400 space-y-1">
              <div className="flex items-center gap-1.5">
                <MapPin size={12} className="text-emerald-400 shrink-0" />
                <span className="text-gray-300 text-[11px] sm:text-xs text-center sm:text-right max-w-xs truncate">
                  {address}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-amber-200/80">
                <Globe size={11} className="text-[#F5C542]" />
                <span>{website}</span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default ShobharamBookletSpread;
