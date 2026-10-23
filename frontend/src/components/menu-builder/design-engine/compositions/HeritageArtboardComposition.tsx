// MENUQR Design Engine — Authentic Heritage Artboard Composition
// Source-Fidelity Recreation of Art Board 3.pdf (Mannat Tandoori Junction)
// Individual DOM Elements for Cover Page 1 + 100% Dynamic Database-Driven Menu Chapters
// Dynamic Prices, Dynamic Items, Real Cart & Table QR Order Flow with Authentic Tandoor Aesthetics

import React, { useMemo, useState } from 'react';
import clsx from 'clsx';
import type { CompositionProps } from '../types';
import { useMenuCart } from '../../templates/shared/MenuCartContext';
import '../HeritageArtboard.css';
import { 
  MapPin, 
  Phone, 
  Plus, 
  Minus, 
  Utensils 
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// 12 Authentic PDF Chapters (Mirroring Art Board 3.pdf Structure)
// ─────────────────────────────────────────────────────────────────────────────
interface ChapterDef {
  id: string;
  title: string;
  shortTitle: string;
  pdfPageNumber: number;
  heroImage: string;
  heroSubtitle: string;
  themeClass: string;
  subcategories: string[];
}

const CHAPTER_DEFINITIONS: ChapterDef[] = [
  {
    id: 'chapter-tandoori-snacks',
    title: 'MTJ Tandoori Snacks',
    shortTitle: 'Tandoori Snacks',
    pdfPageNumber: 4,
    heroImage: '/uploads/mannat/assets/p4_paneer_skillet_left.webp',
    heroSubtitle: 'Charcoal Clay Tandoor Baked • Pure Soya & Multigrain',
    themeClass: 'chapter-theme-tandoori',
    subcategories: ['chaap specialities', 'paneer feast', 'tandoori snacks', 'tandoori chaap'],
  },
  {
    id: 'chapter-kebabs-platters',
    title: 'Veg Kebabs & Signature Platters',
    shortTitle: 'Kebabs & Platters',
    pdfPageNumber: 5,
    heroImage: '/uploads/mannat/assets/hero_veg_kebabs_platter.webp',
    heroSubtitle: 'Dahi Ke Sholay, Seekh Kebabs & Gravy Rolls',
    themeClass: 'chapter-theme-tandoori',
    subcategories: ['veg kebabs & appetizers', 'veg kebabs', 'signature platters', 'platters', 'chaap rolls with gravy', 'chaap rolls', 'rolls'],
  },
  {
    id: 'chapter-crunch-soups',
    title: 'MTJ Crunch House, Soups & Salads',
    shortTitle: 'Crunch & Soups',
    pdfPageNumber: 6,
    heroImage: '/uploads/mannat/assets/crunchy_bites.webp',
    heroSubtitle: 'Crispy Golden Bites, Hot Soups & Fresh Salads',
    themeClass: 'chapter-theme-crunch',
    subcategories: ['mtj crunch house', 'crunch house', 'soup station', 'soups', 'fresh salads', 'salads'],
  },
  {
    id: 'chapter-signature-gravies',
    title: 'MTJ Signature Gravies & Curries',
    shortTitle: 'Signature Gravies',
    pdfPageNumber: 7,
    heroImage: '/uploads/mannat/assets/hero_paneer_curries_handi.png',
    heroSubtitle: 'Slow-Cooked Dal Makhani & Royal Paneer Curries',
    themeClass: 'chapter-theme-gravies',
    subcategories: ['paneer ka khazana', 'veg specialities', 'dal specialities', 'desi junction', 'rice & biryani', 'raita & papad'],
  },
  {
    id: 'chapter-pure-soya-gravies',
    title: 'Pure Soya Gravies & Tandoori Breads',
    shortTitle: 'Soya & Breads',
    pdfPageNumber: 8,
    heroImage: '/uploads/mannat/assets/hero_soya_chaap_curry.png',
    heroSubtitle: 'Rich Soya Curries with Butter Naan & Laccha Paratha',
    themeClass: 'chapter-theme-gravies',
    subcategories: ['pure soya gravies', 'tandoori breads', 'breads', 'naan', 'roti'],
  },
  {
    id: 'chapter-thalis-combos',
    title: 'MTJ Royal Thalis & Combos',
    shortTitle: 'Thalis & Combos',
    pdfPageNumber: 9,
    heroImage: '/uploads/mannat/assets/hero_thali_platter.png',
    heroSubtitle: 'Complete Maharaja Meal Platters & Executive Combos',
    themeClass: 'chapter-theme-thalis',
    subcategories: ['mtj thalis', 'thalis', 'mtja meal combos', 'combos', 'street specials'],
  },
  {
    id: 'chapter-momos',
    title: 'Authentic Himalayan Momo Junction',
    shortTitle: 'Momo Junction',
    pdfPageNumber: 10,
    heroImage: '/uploads/mannat/assets/dish_steamed_momos.png',
    heroSubtitle: 'Steamed, Kurkure, Tandoori & Gravy Momos (6 Pcs)',
    themeClass: 'chapter-theme-momos',
    subcategories: ['momo junction', 'momos'],
  },
  {
    id: 'chapter-chinese-wok',
    title: 'MTJ Chinese Wok & Bowls',
    shortTitle: 'Chinese Wok',
    pdfPageNumber: 11,
    heroImage: '/uploads/mannat/assets/hero_chinese_wok.png',
    heroSubtitle: 'Indo-Chinese Wok Specialities Cooked on High Flame',
    themeClass: 'chapter-theme-chinese',
    subcategories: ['mtj chinese wok', 'chinese wok', 'noodles bowls', 'noodles', 'mtj chinese bowls', 'fried rice', 'wok gravies'],
  },
  {
    id: 'chapter-lebanese-bites',
    title: 'Lebanese Delights & Mexican Fiesta',
    shortTitle: 'Lebanese & Mexican',
    pdfPageNumber: 12,
    heroImage: '/uploads/mannat/assets/dish_falafel_wrap.png',
    heroSubtitle: 'Mediterranean Falafel, Crispy Tacos & Cheesy Fries',
    themeClass: 'chapter-theme-cafe',
    subcategories: ['mtj cafe', 'cafe', 'cheesy bites', 'fries & nachos', 'fries', 'nachos', 'labanese delights', 'lebanese', 'mexican fiesta', 'mexican'],
  },
  {
    id: 'chapter-pizzas-burgers',
    title: 'Stone Baked Pizzas & Brioche Burgers',
    shortTitle: 'Pizzas & Burgers',
    pdfPageNumber: 13,
    heroImage: '/uploads/mannat/assets/dish_margherita_pizza.png',
    heroSubtitle: '10-Inch Thin Crust Pizzas & Gourmet Brioche Buns',
    themeClass: 'chapter-theme-pizzas',
    subcategories: ['pasta selections', 'stone baked pizzas', 'burgers & sandwiches', 'burgers', 'sandwiches'],
  },
  {
    id: 'chapter-brews-beverages',
    title: 'Artisan Brews, Shakes & Coolers',
    shortTitle: 'Brews & Shakes',
    pdfPageNumber: 15,
    heroImage: '/uploads/mannat/assets/dish_cappuccino.png',
    heroSubtitle: 'Thick Shakes, Cold Brews & Refreshing Mocktails',
    themeClass: 'chapter-theme-brews',
    subcategories: ['garlic breads', 'hot coffee', 'cold brew', 'ice tea', 'thick shakes', 'boba shakes & coffee', 'coolers', 'beverages'],
  },
  {
    id: 'chapter-desserts',
    title: 'Sweet Treats & Heritage Desserts',
    shortTitle: 'Desserts',
    pdfPageNumber: 16,
    heroImage: '/uploads/mannat/assets/hero_gulab_jamun_kheer.png',
    heroSubtitle: 'Warm Gulab Jamuns, Kesari Kheer & Ice Creams',
    themeClass: 'chapter-theme-desserts',
    subcategories: ['desserts', 'sweets'],
  },
];

export const HeritageArtboardComposition: React.FC<CompositionProps> = ({
  spec,
  restaurant,
  categories,
  rawCategories,
  compact: _compact,
  onAddToCart,
  isPremium: _isPremium,
  activeCategory: _parentActiveCategory,
  setActiveCategory: setParentActiveCategory,
  searchBar,
}) => {
  const { colors, typography } = spec;
  const menuCart = useMenuCart();

  // Active Chapter Navigation State
  const [selectedChapterId, setSelectedChapterId] = useState<string>('all');

  // Effective add to cart dispatcher using REAL dynamic item
  const handleAddToCart = (dish: any, priceStr: string, variant?: string) => {
    const fn = onAddToCart || menuCart.onAddToCart;
    if (fn) {
      fn({ ...dish, dietType: dish.dietType || 'veg' }, priceStr, variant);
    }
  };

  const handleRemoveFromCart = (dishId: string, variant?: string) => {
    const fn = menuCart.onRemoveFromCart;
    if (fn) {
      fn(dishId, variant);
    }
  };

  const getDishQty = (dishId: string, variant?: string) => {
    const fn = menuCart.getItemQuantity;
    return fn ? fn(dishId, variant) : 0;
  };

  // Group dynamic categories into the authentic 12 Chapters
  const chaptersWithCategories = useMemo(() => {
    const list = rawCategories.length > 0 ? rawCategories : categories;

    return CHAPTER_DEFINITIONS.map((chDef) => {
      const matchedCats = list.filter((cat) => {
        const catNameLower = cat.name.toLowerCase().trim();
        return chDef.subcategories.some((kw) => catNameLower.includes(kw));
      });

      const totalItems = matchedCats.reduce((sum, c) => sum + c.items.length, 0);

      return {
        ...chDef,
        categories: matchedCats,
        totalItems,
      };
    }).filter((ch) => ch.totalItems > 0);
  }, [rawCategories, categories]);

  // Filtered chapters based on selection
  const visibleChapters = useMemo(() => {
    if (selectedChapterId === 'all') {
      return chaptersWithCategories;
    }
    return chaptersWithCategories.filter((ch) => ch.id === selectedChapterId);
  }, [selectedChapterId, chaptersWithCategories]);

  const totalAllItems = useMemo(() => {
    const list = rawCategories.length > 0 ? rawCategories : categories;
    return list.reduce((sum, c) => sum + c.items.length, 0);
  }, [rawCategories, categories]);

  return (
    <div
      className="heritage-canvas heritage-main-content relative z-10 space-y-8 max-w-4xl mx-auto w-full transition-colors duration-300 p-2 sm:p-5"
      style={{
        color: colors.text,
        fontFamily: typography.bodyFont,
      }}
    >
      {/* ═══════════════════════════════════════════════════════════════════════
          MASTHEAD: AUTHENTIC 1ST PAGE BRAND COVER (ART BOARD 3.PDF PAGE 1)
          Direct high-resolution render of the official Mannat cover
          ═══════════════════════════════════════════════════════════════════════ */}
      <header className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-[#FAB700] bg-[#CD1B2D]">
        <div className="relative w-full flex justify-center bg-[#CD1B2D]">
          <picture>
            <source srcSet="/uploads/mannat/assets/mannat_cover_p1_official.webp" type="image/webp" />
            <img
              src="/uploads/mannat/assets/mannat_cover_p1_official.png"
              alt="Mannat Tandoori Junction - Official Brand Cover"
              className="w-full max-w-2xl h-auto object-contain mx-auto select-none"
              loading="eager"
            />
          </picture>
        </div>

        {/* Storefront Contact & Badges Strip */}
        <div className="bg-[#181E19] text-[#FAF4EC] px-4 py-2.5 sm:px-6 flex flex-wrap items-center justify-between gap-3 border-t-2 border-[#FAB700]/50 relative z-20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-[#FAB700] uppercase tracking-wider text-[11px] sm:text-xs font-serif">
              Order Online • Fast Delivery & Dine In
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs font-medium">
            <a
              href={`tel:${restaurant.phone || '8591095483'}`}
              className="flex items-center gap-1.5 text-white/90 hover:text-[#FAB700] transition-colors"
            >
              <Phone size={13} className="text-[#FAB700]" />
              <span className="font-mono">{restaurant.phone || '8591095483'}</span>
            </a>
            {restaurant.address && (
              <div className="hidden sm:flex items-center gap-1.5 text-white/80">
                <MapPin size={13} className="text-[#FAB700]" />
                <span className="line-clamp-1">{restaurant.address}</span>
              </div>
            )}
            <span className="bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/40 text-[10px] tracking-wider uppercase">
              100% PURE VEG
            </span>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════════
          SEARCH BAR
          ═══════════════════════════════════════════════════════════════════════ */}
      {searchBar && (
        <div className="rounded-2xl border-2 border-[#FAB700]/70 p-1.5 bg-[#FFFDF9] shadow-sm">
          {searchBar}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          STICKY 12-CHAPTER NAVIGATION BAR
          ═══════════════════════════════════════════════════════════════════════ */}
      <nav
        aria-label="Menu Chapters"
        className="sticky top-14 z-30 bg-[#FFFDF9]/95 backdrop-blur-md py-2.5 px-3 rounded-2xl shadow-md border-2 border-[#FAB700]/70 flex flex-wrap items-center gap-1.5 sm:gap-2"
      >
        <button
          type="button"
          onClick={() => {
            setSelectedChapterId('all');
            if (setParentActiveCategory) setParentActiveCategory('all');
          }}
          className={clsx(
            'px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer',
            selectedChapterId === 'all'
              ? 'bg-[#CE182C] text-white border border-[#FAB700] shadow-sm'
              : 'bg-white text-[#1F2923] hover:bg-[#CE182C]/10 border border-[#CE182C]/20'
          )}
        >
          <span>All Items</span>
          <span className="ml-1 text-[10px] opacity-80 font-mono">
            ({totalAllItems})
          </span>
        </button>

        {chaptersWithCategories.map((ch) => {
          const isActive = selectedChapterId === ch.id;
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => {
                setSelectedChapterId(ch.id);
                if (setParentActiveCategory) setParentActiveCategory(ch.id);
              }}
              className={clsx(
                'px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 shadow-xs active:scale-95 cursor-pointer',
                isActive
                  ? 'bg-[#CE182C] text-white border border-[#FAB700] shadow-sm'
                  : 'bg-white text-[#1F2923] hover:bg-[#CE182C]/10 border border-[#CE182C]/20'
              )}
            >
              <span>{ch.shortTitle}</span>
              <span className="text-[10px] opacity-75 font-mono">({ch.totalItems})</span>
            </button>
          );
        })}
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════════
          CHAPTERS: 100% DYNAMIC MENU DRIVEN BY DATABASE RECORDS
          Themed with Authentic PDF Luxury Indian Tandoor Visual Identity
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-12">
        {visibleChapters.map((chapter) => {
          const isTandooriChapter = chapter.id === 'chapter-tandoori-snacks';
          const isKebabsChapter = chapter.id === 'chapter-kebabs-platters';
          const isCrunchChapter = chapter.id === 'chapter-crunch-soups';

          return (
            <section
              key={chapter.id}
              id={chapter.id}
              data-chapter-id={chapter.id}
              className={clsx(
                "p-2 sm:p-5 space-y-6 rounded-3xl transition-all duration-300 relative",
                chapter.themeClass || 'chapter-theme-tandoori'
              )}
            >
              {/* Corner Flourishes */}
              <div 
                className="heritage-corner-flourish heritage-corner-flourish-tl" 
                style={{ backgroundImage: "url('/menuqr/generated/corner_flourish_gold.png')" }} 
              />
              <div 
                className="heritage-corner-flourish heritage-corner-flourish-tr" 
                style={{ backgroundImage: "url('/menuqr/generated/corner_flourish_gold.png')" }} 
              />
              <div 
                className="heritage-corner-flourish heritage-corner-flourish-bl" 
                style={{ backgroundImage: "url('/menuqr/generated/corner_flourish_gold.png')" }} 
              />
              <div 
                className="heritage-corner-flourish heritage-corner-flourish-br" 
                style={{ backgroundImage: "url('/menuqr/generated/corner_flourish_gold.png')" }} 
              />

              {/* ─────────────────────────────────────────────────────────────
                  CHAPTER 1: DYNAMIC ASYMMETRICAL SPLIT (PAGE 4 THEME)
                  MTJ Tandoori Snacks & Chaap Specialities
                  ───────────────────────────────────────────────────────────── */}
              {isTandooriChapter ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border-2 border-[#FAB700] shadow-xl relative bg-[#CD1B2D]">
                  {/* Left Column: Crimson Hero Panel (Sticky on Desktop) */}
                  <div className="lg:col-span-5 artboard-left-panel p-5 sm:p-7 flex flex-col justify-between relative overflow-hidden lg:sticky lg:top-24 self-start">
                    <div className="absolute inset-0 flex flex-col justify-around items-center pointer-events-none opacity-10 select-none">
                      <span className="text-white font-black text-6xl tracking-widest">PURE</span>
                      <span className="text-white font-black text-6xl tracking-widest">CHAAP</span>
                      <span className="text-white font-black text-6xl tracking-widest">SOYA</span>
                    </div>

                    <div className="space-y-2 relative z-10">
                      <h2 className="font-sans font-black text-white text-3xl sm:text-5xl lg:text-4xl xl:text-5xl tracking-tight leading-none uppercase">
                        MTJ
                      </h2>
                      <h2 className="font-sans font-black text-white text-3xl sm:text-5xl lg:text-4xl xl:text-5xl tracking-tight leading-none uppercase">
                        TANDOORI
                      </h2>
                      <h2 className="font-sans font-black text-white text-3xl sm:text-5xl lg:text-4xl xl:text-5xl tracking-tight leading-none uppercase">
                        SNACKS
                      </h2>
                      <div className="h-1.5 w-16 bg-[#FAB700] rounded-full mt-2" />
                      
                      <p className="text-white/95 text-xs sm:text-sm font-sans pt-2 leading-relaxed max-w-xs">
                        Charcoal clay tandoor baked multi-grain chaap marinated in fresh yogurt & secret ground spices.
                      </p>
                    </div>

                    <div className="relative mt-6 sm:mt-8 flex justify-center z-10">
                      <img
                        src="/uploads/mannat/assets/p4_paneer_skillet_left.webp"
                        alt="Tandoori Paneer Tikka Skewers Skillet"
                        className="w-full max-w-[260px] sm:max-w-xs h-auto object-contain drop-shadow-2xl select-none"
                      />
                    </div>
                  </div>

                  {/* Right Column: Dynamic Coded Tables */}
                  <div className="lg:col-span-7 artboard-right-panel p-4 sm:p-6 space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 sm:w-44 pointer-events-none select-none z-10 overflow-hidden">
                      <img
                        src="/uploads/mannat/assets/p4_malai_plate_clean.webp"
                        alt="Creamy Malai Chaap Platter"
                        className="w-full h-auto object-contain rounded-bl-3xl drop-shadow-md"
                      />
                    </div>

                    {chapter.categories.map((subcat) => {
                      const hasPortions = subcat.items.some((i) => Boolean(i.halfPrice || (i as any).half_price));

                      return (
                        <div key={subcat.id} className="space-y-3 relative z-20">
                          <div className="border-b-4 border-[#CE182C] pb-1 max-w-[260px]">
                            <h3 className="font-sans font-black text-xl sm:text-2xl text-[#CE182C] tracking-tight uppercase leading-none">
                              {subcat.name}
                            </h3>
                          </div>

                          <div className={`heritage-grid-header ${hasPortions ? 'heritage-dual-grid' : 'heritage-single-grid'} text-center font-bold`}>
                            <span className="text-left">ITEM</span>
                            {hasPortions ? (
                              <>
                                <span className="text-[#CE182C]">HALF</span>
                                <span className="text-[#CE182C]">FULL</span>
                              </>
                            ) : (
                              <span className="text-[#CE182C]">PRICE</span>
                            )}
                          </div>

                          <div className="divide-y divide-black/5 bg-white rounded-2xl border border-black/10 shadow-xs p-2">
                            {subcat.items.map((dish) => {
                              const halfVal = dish.halfPrice || (dish as any).half_price;
                              const fullVal = dish.fullPrice || (dish as any).full_price || dish.price;
                              const halfQty = halfVal ? getDishQty(dish.id, 'Half') : 0;
                              const fullQty = getDishQty(dish.id, hasPortions ? 'Full' : undefined);

                              const isChef = dish.name.toLowerCase().includes('malai') || 
                                             dish.name.toLowerCase().includes('nizami') || 
                                             dish.name.toLowerCase().includes('afghani') || 
                                             dish.name.toLowerCase().includes('special');
                              const isSpicy = dish.name.toLowerCase().includes('punjabi') || 
                                              dish.name.toLowerCase().includes('masala') || 
                                              dish.name.toLowerCase().includes('toofani') || 
                                              dish.name.toLowerCase().includes('mirch');
                              const isSoya = dish.name.toLowerCase().includes('pure soya');

                              return hasPortions ? (
                                <div key={dish.id} className="heritage-grid-row heritage-dual-grid py-2">
                                  {/* Col 1: Dish Name & Badges */}
                                  <div className="min-w-0 pr-1">
                                    <div className="flex items-center gap-1.5 font-sans font-bold text-xs sm:text-sm text-[#181E19]">
                                      {isChef && <span title="Chef Special" className="text-sm">👨‍🍳</span>}
                                      <span className="break-words leading-tight">{dish.name}</span>
                                      {isSpicy && <span title="Mild Spicy" className="text-sm">🌶️</span>}
                                    </div>
                                    {isSoya && (
                                      <div className="text-[10px] text-emerald-700 font-bold font-sans">
                                        (Pure Soya)
                                      </div>
                                    )}
                                  </div>

                                  {/* Col 2: Half Price */}
                                  <div className="flex justify-center">
                                    {halfVal ? (
                                      halfQty > 0 ? (
                                        <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-300 rounded px-1.5 py-0.5 text-xs font-bold text-emerald-900">
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveFromCart(dish.id, 'Half')}
                                            className="text-red-700 hover:scale-110"
                                          >
                                            <Minus size={11} />
                                          </button>
                                          <span>{halfQty}</span>
                                          <button
                                            type="button"
                                            onClick={() => handleAddToCart(dish, `₹${halfVal}`, 'Half')}
                                            className="text-emerald-700 hover:scale-110"
                                          >
                                            <Plus size={11} />
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => handleAddToCart(dish, `₹${halfVal}`, 'Half')}
                                          className="heritage-portion-btn-half cursor-pointer"
                                        >
                                          <span>₹{halfVal}</span>
                                          <Plus size={11} className="opacity-70" />
                                        </button>
                                      )
                                    ) : (
                                      <span className="text-gray-400 font-bold">-</span>
                                    )}
                                  </div>

                                  {/* Col 3: Full Price */}
                                  <div className="flex justify-center">
                                    {fullQty > 0 ? (
                                      <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-300 rounded px-1.5 py-0.5 text-xs font-bold text-emerald-900">
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveFromCart(dish.id, 'Full')}
                                          className="text-red-700 hover:scale-110"
                                        >
                                          <Minus size={11} />
                                        </button>
                                        <span>{fullQty}</span>
                                        <button
                                          type="button"
                                          onClick={() => handleAddToCart(dish, `₹${fullVal}`, 'Full')}
                                          className="text-emerald-700 hover:scale-110"
                                        >
                                          <Plus size={11} />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleAddToCart(dish, `₹${fullVal}`, 'Full')}
                                        className="heritage-portion-btn-full cursor-pointer"
                                      >
                                        <span>₹{fullVal}</span>
                                        <Plus size={11} className="opacity-70" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div key={dish.id} className="heritage-grid-row heritage-single-grid py-2">
                                  <div className="min-w-0 pr-1">
                                    <div className="flex items-center gap-1.5 font-sans font-bold text-xs sm:text-sm text-[#181E19]">
                                      {isChef && <span title="Chef Special" className="text-sm">👨‍🍳</span>}
                                      <span className="break-words leading-tight">{dish.name}</span>
                                      {isSpicy && <span title="Mild Spicy" className="text-sm">🌶️</span>}
                                    </div>
                                    {isSoya && (
                                      <div className="text-[10px] text-emerald-700 font-bold font-sans">
                                        (Pure Soya)
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex justify-center">
                                    {fullQty > 0 ? (
                                      <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-300 rounded px-1.5 py-0.5 text-xs font-bold text-emerald-900">
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveFromCart(dish.id)}
                                          className="text-red-700 hover:scale-110"
                                        >
                                          <Minus size={11} />
                                        </button>
                                        <span>{fullQty}</span>
                                        <button
                                          type="button"
                                          onClick={() => handleAddToCart(dish, `₹${fullVal}`)}
                                          className="text-emerald-700 hover:scale-110"
                                        >
                                          <Plus size={11} />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleAddToCart(dish, `₹${fullVal}`)}
                                        className="heritage-portion-btn-full cursor-pointer"
                                      >
                                        <span>₹{fullVal}</span>
                                        <Plus size={11} className="opacity-70" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}

                    {/* ADD ON Banner matching PDF Page 4 */}
                    <div className="rounded-xl bg-[#CE182C]/10 border border-[#CE182C]/30 p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-sans font-black text-[#CE182C] uppercase tracking-wide text-[11px] sm:text-xs">
                          ADD ON : 100% SOYA UPGRADE
                        </span>
                        <span className="block text-[10px] text-[#881313] font-semibold uppercase tracking-wider">
                          NO MAIDA &nbsp;|&nbsp; NO WHEAT &nbsp;|&nbsp; NO GLUTEN &nbsp;|&nbsp; HIGH PROTEIN
                        </span>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-6 font-mono font-black text-sm text-[#CE182C] shrink-0">
                        <span className="text-center w-10 sm:w-12">₹49</span>
                        <span className="text-center w-10 sm:w-12">₹79</span>
                      </div>
                    </div>

                    {/* Emerald Green Announcement Bar */}
                    <div className="rounded-xl bg-[#0E8345] text-white p-2.5 text-center text-[11px] sm:text-xs font-semibold leading-relaxed shadow-xs">
                      <p>*All Chaap Specialities are prepared using our Multigrain Chaap.</p>
                      <p className="opacity-95 font-medium">Add-on upgrade available for Premium 100% Plant-Based Soya Chaap.</p>
                    </div>

                    {/* Legend Badges */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs font-bold relative z-20">
                      <span className="px-3 py-1 rounded-full bg-white text-[#CE182C] border-2 border-[#CE182C] shadow-xs flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                        👨‍🍳 CHEF SPECIAL
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white text-[#CE182C] border-2 border-[#CE182C] shadow-xs flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                        🌶️ MILD SPICY
                      </span>
                    </div>
                  </div>
                </div>
              ) : isKebabsChapter ? (
                /* ─────────────────────────────────────────────────────────────
                   CHAPTER 2: VEG KEBABS, PLATTERS & GRAVY ROLLS (PAGE 5 THEME)
                   ───────────────────────────────────────────────────────────── */
                <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border-2 border-[#FAB700] shadow-xl relative bg-[#CD1B2D]">
                  <div className="lg:col-span-5 artboard-left-panel p-5 sm:p-7 flex flex-col justify-between relative overflow-hidden lg:sticky lg:top-24 self-start">
                    <div className="space-y-2 relative z-10">
                      <h2 className="font-sans font-black text-white text-3xl sm:text-5xl lg:text-4xl xl:text-5xl tracking-tight leading-none uppercase">
                        VEG KEBABS &amp;<br />PLATTERS
                      </h2>
                      <div className="h-1.5 w-16 bg-[#FAB700] rounded-full mt-2" />
                      <p className="text-white/95 text-xs sm:text-sm font-sans pt-2 leading-relaxed max-w-xs">
                        Dahi Ke Sholay, Seekh Kebabs & Gravy Rolls served with mint chutney and pickled onions.
                      </p>
                    </div>

                    <div className="relative mt-6 sm:mt-8 flex justify-center z-10">
                      <img
                        src="/uploads/mannat/assets/hero_veg_kebabs_platter.webp"
                        alt="Signature Veg Kebabs Platter"
                        className="w-full max-w-[280px] sm:max-w-xs h-auto object-contain drop-shadow-2xl select-none rounded-2xl"
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-7 artboard-right-panel p-4 sm:p-6 space-y-6 relative overflow-hidden">
                    {chapter.categories.map((subcat) => {
                      const isRolls = subcat.name.toLowerCase().includes('roll');
                      const hasPortions = subcat.items.some((i) => Boolean(i.halfPrice || (i as any).half_price));

                      return (
                        <div key={subcat.id} className="space-y-3 relative z-20">
                          <div className="border-b-4 border-[#CE182C] pb-1 max-w-[260px]">
                            <h3 className="font-sans font-black text-xl sm:text-2xl text-[#CE182C] tracking-tight uppercase leading-none">
                              {subcat.name}
                            </h3>
                          </div>

                          {hasPortions ? (
                            <>
                              <div className="heritage-grid-header heritage-dual-grid text-center font-bold">
                                <span className="text-left">ITEM</span>
                                <span className="text-[#CE182C]">{isRolls ? '2 PCS' : 'HALF'}</span>
                                <span className="text-[#CE182C]">{isRolls ? '4 PCS' : 'FULL'}</span>
                              </div>

                              <div className="divide-y divide-black/5 bg-white rounded-2xl border border-black/10 shadow-xs p-2">
                                {subcat.items.map((dish) => {
                                  const halfVal = dish.halfPrice || (dish as any).half_price;
                                  const fullVal = dish.fullPrice || (dish as any).full_price || dish.price;
                                  const halfLabel = isRolls ? '2 Pcs' : 'Half';
                                  const fullLabel = isRolls ? '4 Pcs' : 'Full';
                                  const halfQty = halfVal ? getDishQty(dish.id, halfLabel) : 0;
                                  const fullQty = getDishQty(dish.id, fullLabel);

                                  return (
                                    <div key={dish.id} className="heritage-grid-row heritage-dual-grid py-2">
                                      <div className="min-w-0 pr-1">
                                        <div className="flex items-center gap-1.5 font-sans font-bold text-xs sm:text-sm text-[#181E19]">
                                          <span className="break-words leading-tight">{dish.name}</span>
                                        </div>
                                      </div>

                                      <div className="flex justify-center">
                                        {halfVal ? (
                                          halfQty > 0 ? (
                                            <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-300 rounded px-1.5 py-0.5 text-xs font-bold text-emerald-900">
                                              <button type="button" onClick={() => handleRemoveFromCart(dish.id, halfLabel)} className="text-red-700 hover:scale-110"><Minus size={11} /></button>
                                              <span>{halfQty}</span>
                                              <button type="button" onClick={() => handleAddToCart(dish, `₹${halfVal}`, halfLabel)} className="text-emerald-700 hover:scale-110"><Plus size={11} /></button>
                                            </div>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() => handleAddToCart(dish, `₹${halfVal}`, halfLabel)}
                                              className="heritage-portion-btn-half cursor-pointer"
                                            >
                                              <span>₹{halfVal}</span>
                                              <Plus size={11} className="opacity-70" />
                                            </button>
                                          )
                                        ) : (
                                          <span className="text-gray-400 font-bold">-</span>
                                        )}
                                      </div>

                                      <div className="flex justify-center">
                                        {fullQty > 0 ? (
                                          <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-300 rounded px-1.5 py-0.5 text-xs font-bold text-emerald-900">
                                            <button type="button" onClick={() => handleRemoveFromCart(dish.id, fullLabel)} className="text-red-700 hover:scale-110"><Minus size={11} /></button>
                                            <span>{fullQty}</span>
                                            <button type="button" onClick={() => handleAddToCart(dish, `₹${fullVal}`, fullLabel)} className="text-emerald-700 hover:scale-110"><Plus size={11} /></button>
                                          </div>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => handleAddToCart(dish, `₹${fullVal}`, fullLabel)}
                                            className="heritage-portion-btn-full cursor-pointer"
                                          >
                                            <span>₹{fullVal}</span>
                                            <Plus size={11} className="opacity-70" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="heritage-grid-header heritage-single-grid text-center font-bold">
                                <span className="text-left">ITEM</span>
                                <span className="text-[#CE182C]">PRICE</span>
                              </div>

                              <div className="divide-y divide-black/5 bg-white rounded-2xl border border-black/10 shadow-xs p-2">
                                {subcat.items.map((dish) => {
                                  const singleQty = getDishQty(dish.id);
                                  const priceVal = dish.price || (dish as any).full_price;

                                  return (
                                    <div key={dish.id} className="heritage-grid-row heritage-single-grid py-2">
                                      <div className="min-w-0 pr-1">
                                        <div className="flex items-center gap-1.5 font-sans font-bold text-xs sm:text-sm text-[#181E19]">
                                          <span className="break-words leading-tight">{dish.name}</span>
                                        </div>
                                      </div>

                                      <div className="flex justify-center">
                                        {singleQty > 0 ? (
                                          <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-300 rounded px-1.5 py-0.5 text-xs font-bold text-emerald-900">
                                            <button type="button" onClick={() => handleRemoveFromCart(dish.id)} className="text-red-700 hover:scale-110"><Minus size={11} /></button>
                                            <span>{singleQty}</span>
                                            <button type="button" onClick={() => handleAddToCart(dish, `₹${priceVal}`)} className="text-emerald-700 hover:scale-110"><Plus size={11} /></button>
                                          </div>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => handleAddToCart(dish, `₹${priceVal}`)}
                                            className="heritage-portion-btn-full cursor-pointer"
                                          >
                                            <span>₹{priceVal}</span>
                                            <Plus size={11} className="opacity-70" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}

                    <div className="rounded-xl bg-[#CE182C]/10 border border-[#CE182C]/30 p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-sans font-black text-[#CE182C] uppercase tracking-wide text-[11px] sm:text-xs">
                          ADD ON : 100% SOYA UPGRADE
                        </span>
                        <span className="block text-[10px] text-[#881313] font-semibold uppercase tracking-wider">
                          NO MAIDA &nbsp;|&nbsp; NO WHEAT &nbsp;|&nbsp; NO GLUTEN &nbsp;|&nbsp; HIGH PROTEIN
                        </span>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-6 font-mono font-black text-sm text-[#CE182C] shrink-0">
                        <span className="text-center w-10 sm:w-12">₹49</span>
                        <span className="text-center w-10 sm:w-12">₹79</span>
                      </div>
                    </div>

                    <div className="rounded-xl bg-[#0E8345] text-white p-2.5 text-center text-[11px] sm:text-xs font-semibold leading-relaxed shadow-xs">
                      <p>*All MTJ Rolls are prepared using our Multigrain Chaap.</p>
                      <p className="opacity-95 font-medium">Add-on upgrade available for Premium Plant-Based Soya Chaap.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs font-bold relative z-20">
                      <span className="px-3 py-1 rounded-full bg-white text-[#CE182C] border-2 border-[#CE182C] shadow-xs flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                        👨‍🍳 CHEF SPECIAL
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white text-[#CE182C] border-2 border-[#CE182C] shadow-xs flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                        🌶️ MILD SPICY
                      </span>
                    </div>
                  </div>
                </div>
              ) : isCrunchChapter ? (
                /* ─────────────────────────────────────────────────────────────
                   CHAPTER 3: CRUNCH HOUSE, SOUPS & SALADS (PAGE 6 THEME)
                   ───────────────────────────────────────────────────────────── */
                <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border-2 border-[#FAB700] shadow-xl relative bg-[#D97706]">
                  <div className="lg:col-span-7 artboard-right-panel p-4 sm:p-6 space-y-6 relative overflow-hidden order-2 lg:order-1">
                    {chapter.categories.map((subcat) => (
                      <div key={subcat.id} className="space-y-3 relative z-20">
                        <div className="border-b-4 border-[#D97706] pb-1 max-w-[260px]">
                          <h3 className="font-sans font-black text-xl sm:text-2xl text-[#D97706] tracking-tight uppercase leading-none">
                            {subcat.name}
                          </h3>
                        </div>

                        <div className="heritage-grid-header heritage-single-grid text-center font-bold">
                          <span className="text-left">ITEM</span>
                          <span className="text-[#D97706]">PRICE</span>
                        </div>

                        <div className="divide-y divide-black/5 bg-white rounded-2xl border border-black/10 shadow-xs p-2">
                          {subcat.items.map((dish) => {
                            const singleQty = getDishQty(dish.id);
                            const priceVal = dish.price || (dish as any).full_price;

                            return (
                              <div key={dish.id} className="heritage-grid-row heritage-single-grid py-2">
                                <div className="min-w-0 pr-1">
                                  <span className="font-sans font-bold text-xs sm:text-sm text-[#181E19] break-words leading-tight">{dish.name}</span>
                                </div>
                                <div className="flex justify-center">
                                  {singleQty > 0 ? (
                                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-300 rounded px-1.5 py-0.5 text-xs font-bold text-amber-900">
                                      <button type="button" onClick={() => handleRemoveFromCart(dish.id)} className="text-red-700 hover:scale-110"><Minus size={11} /></button>
                                      <span>{singleQty}</span>
                                      <button type="button" onClick={() => handleAddToCart(dish, `₹${priceVal}`)} className="text-amber-700 hover:scale-110"><Plus size={11} /></button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleAddToCart(dish, `₹${priceVal}`)}
                                      className="heritage-portion-btn-full cursor-pointer !bg-[#D97706]"
                                    >
                                      <span>₹{priceVal}</span>
                                      <Plus size={11} className="opacity-70" />
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

                  <div className="lg:col-span-5 p-5 sm:p-7 flex flex-col justify-between relative overflow-hidden lg:sticky lg:top-24 self-start bg-[#D97706] order-1 lg:order-2">
                    <div className="space-y-2 relative z-10">
                      <h2 className="font-sans font-black text-white text-3xl sm:text-5xl lg:text-4xl xl:text-5xl tracking-tight leading-none uppercase">
                        CRUNCH<br />HOUSE &amp;<br />SOUPS
                      </h2>
                      <div className="h-1.5 w-16 bg-[#FAB700] rounded-full mt-2" />
                      <p className="text-white/95 text-xs sm:text-sm font-sans pt-2 leading-relaxed max-w-xs">
                        Crispy Plant-Based Soya Delights, piping hot restorative soups & freshly tossed artisan salads.
                      </p>
                    </div>

                    <div className="relative mt-6 sm:mt-8 flex justify-center z-10">
                      <img
                        src="/uploads/mannat/assets/crunchy_bites.webp"
                        alt="Crispy Crunch Soya Delights"
                        className="w-full max-w-[280px] sm:max-w-xs h-auto object-contain drop-shadow-2xl select-none rounded-2xl"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* ─────────────────────────────────────────────────────────────
                   REMAINING CHAPTERS: DYNAMIC HERITAGE MENU (NO DUPLICATE BANNER)
                   ───────────────────────────────────────────────────────────── */
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#FAB700]/60 pb-3 gap-2">
                    <div>
                      <span className="text-[10px] sm:text-xs font-mono font-black uppercase tracking-widest text-[#CE182C] bg-[#CE182C]/10 px-2.5 py-1 rounded-full border border-[#CE182C]/30">
                        CHAPTER {chapter.pdfPageNumber - 3 < 10 ? `0${chapter.pdfPageNumber - 3}` : chapter.pdfPageNumber - 3} • PAGE {chapter.pdfPageNumber}
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-sans font-black text-[#881313] tracking-tight uppercase mt-2">
                        {chapter.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#1F2923]/70 font-medium">
                        {chapter.heroSubtitle}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24 self-start">
                      <div className="heritage-hero-showcase">
                        <picture>
                          <source srcSet={chapter.heroImage.replace('.png', '.webp')} type="image/webp" />
                          <img
                            src={chapter.heroImage}
                            alt={chapter.title}
                            className="w-full h-48 sm:h-60 lg:h-64 object-cover"
                            loading="lazy"
                          />
                        </picture>
                        <div className="bg-[#181E19] text-[#FAB700] p-3 border-t-2 border-[#FAB700]/40">
                          <div className="font-serif font-bold text-sm text-white tracking-wide">
                            {chapter.title}
                          </div>
                          <div className="text-[11px] text-[#FAB700]/90 font-sans mt-0.5">
                            {chapter.heroSubtitle}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-7 space-y-6">
                      {chapter.categories.map((subcat, idx) => {
                        const isRolls = subcat.name.toLowerCase().includes('roll');
                        const hasAnyHalfFull = subcat.items.some((i) => Boolean(i.halfPrice || (i as any).half_price));

                        return (
                          <div key={subcat.id} className="space-y-3">
                            {idx > 0 && <div className="heritage-divider-raster" />}

                            <div className="heritage-subcat-header">
                              <span className="heritage-subcat-badge">
                                <Utensils size={13} className="text-[#FAB700]" />
                                <span>{subcat.name}</span>
                                <span className="text-[11px] opacity-80 font-mono">({subcat.items.length})</span>
                              </span>
                              <span className="heritage-subcat-line" />
                            </div>

                            <div className="space-y-2">
                              <div className="heritage-menu-container p-2 sm:p-3">
                                {hasAnyHalfFull ? (
                                  <>
                                    <div className="heritage-grid-header heritage-dual-grid text-center font-bold">
                                      <span className="text-left">ITEM</span>
                                      <span className="text-[#9E0D24]">{isRolls ? '2 PCS' : 'HALF'}</span>
                                      <span className="text-[#9E0D24]">{isRolls ? '4 PCS' : 'FULL'}</span>
                                    </div>
                                    <div className="divide-y divide-black/5">
                                      {subcat.items.map((item) => {
                                        const halfVal = item.halfPrice || (item as any).half_price;
                                        const fullVal = item.fullPrice || (item as any).full_price || item.price;
                                        const halfLabel = isRolls ? '2 Pcs' : 'Half';
                                        const fullLabel = isRolls ? '4 Pcs' : 'Full';
                                        const halfQty = halfVal ? getDishQty(item.id, halfLabel) : 0;
                                        const fullQty = getDishQty(item.id, fullLabel);

                                        return (
                                          <div key={item.id} className="heritage-grid-row heritage-dual-grid">
                                            <div className="min-w-0 pr-1">
                                              <div className="flex items-center gap-1.5 font-serif font-bold text-xs sm:text-sm text-[#181E19]">
                                                <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                                                <span className="break-words leading-tight">{item.name}</span>
                                              </div>
                                            </div>

                                            <div className="flex justify-center">
                                              {halfVal ? (
                                                halfQty > 0 ? (
                                                  <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-300 rounded px-1.5 py-0.5 text-xs font-bold text-emerald-900">
                                                    <button type="button" onClick={() => handleRemoveFromCart(item.id, halfLabel)}><Minus size={11} /></button>
                                                    <span>{halfQty}</span>
                                                    <button type="button" onClick={() => handleAddToCart(item, `₹${halfVal}`, halfLabel)}><Plus size={11} /></button>
                                                  </div>
                                                ) : (
                                                  <button
                                                    type="button"
                                                    onClick={() => handleAddToCart(item, `₹${halfVal}`, halfLabel)}
                                                    className="heritage-portion-btn-half cursor-pointer"
                                                  >
                                                    <span>₹{halfVal}</span>
                                                    <Plus size={11} className="opacity-70" />
                                                  </button>
                                                )
                                              ) : (
                                                <span className="text-gray-400 font-bold">-</span>
                                              )}
                                            </div>

                                            <div className="flex justify-center">
                                              {fullQty > 0 ? (
                                                <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-300 rounded px-1.5 py-0.5 text-xs font-bold text-emerald-900">
                                                  <button type="button" onClick={() => handleRemoveFromCart(item.id, fullLabel)}><Minus size={11} /></button>
                                                  <span>{fullQty}</span>
                                                  <button type="button" onClick={() => handleAddToCart(item, `₹${fullVal}`, fullLabel)}><Plus size={11} /></button>
                                                </div>
                                              ) : (
                                                <button
                                                  type="button"
                                                  onClick={() => handleAddToCart(item, `₹${fullVal}`, fullLabel)}
                                                  className="heritage-portion-btn-full cursor-pointer"
                                                >
                                                  <span>₹{fullVal}</span>
                                                  <Plus size={11} className="opacity-70" />
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="heritage-grid-header heritage-single-grid text-center font-bold">
                                      <span className="text-left">ITEM</span>
                                      <span className="text-[#9E0D24]">PRICE</span>
                                    </div>
                                    <div className="divide-y divide-black/5">
                                      {subcat.items.map((item) => {
                                        const singleQty = getDishQty(item.id);
                                        const priceVal = item.price || (item as any).full_price;

                                        return (
                                          <div key={item.id} className="heritage-grid-row heritage-single-grid">
                                            <div className="min-w-0 pr-1">
                                              <div className="flex items-center gap-1.5 font-serif font-bold text-xs sm:text-sm text-[#181E19]">
                                                <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                                                <span className="break-words leading-tight">{item.name}</span>
                                              </div>
                                            </div>

                                            <div className="flex justify-center">
                                              {singleQty > 0 ? (
                                                <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-300 rounded px-1.5 py-0.5 text-xs font-bold text-emerald-900">
                                                  <button type="button" onClick={() => handleRemoveFromCart(item.id)}><Minus size={11} /></button>
                                                  <span>{singleQty}</span>
                                                  <button type="button" onClick={() => handleAddToCart(item, `₹${priceVal}`)}><Plus size={11} /></button>
                                                </div>
                                              ) : (
                                                <button
                                                  type="button"
                                                  onClick={() => handleAddToCart(item, `₹${priceVal}`)}
                                                  className="heritage-portion-btn-half cursor-pointer"
                                                >
                                                  <span>₹{priceVal}</span>
                                                  <Plus size={11} className="opacity-70" />
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};
