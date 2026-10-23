// MENUQR Design Engine — Authentic Heritage Artboard Composition
// Bespoke 1:1 Digital Artboard for Indian Tandoor, Chaap & Royal Dhaba Menus
// Clean, organized, luxury restaurant styling mirroring Art Board 3.pdf

import React, { useMemo, useState } from 'react';
import clsx from 'clsx';
import type { CompositionProps } from '../types';
import { DietIndicator, parseItemPricing } from '../../templates/shared/RenderItemPrices';
import '../HeritageArtboard.css';
import { 
  MapPin, 
  Phone, 
  Coffee, 
  Plus,
  Flame,
  Sparkles,
  Utensils
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// 12 Authentic PDF Chapters (Mirroring Art Board 3.pdf Table of Contents)
// ─────────────────────────────────────────────────────────────────────────────
interface ChapterDef {
  id: string;
  title: string;
  shortTitle: string;
  banner: string;
  heroImage: string;
  heroSubImage?: string;
  heroTitle: string;
  heroSubtitle: string;
  themeClass: string;
  subcategories: string[];
  announcement?: {
    text: string;
    badge?: string;
    icon?: 'flame' | 'coffee' | 'sparkles';
  };
  isMomo?: boolean;
}

const CHAPTER_DEFINITIONS: ChapterDef[] = [
  {
    id: 'chapter-tandoori-snacks',
    title: 'MTJ Tandoori Snacks',
    shortTitle: 'Tandoori Snacks',
    banner: '/uploads/mannat/textures/banner_tandoori_snacks.webp',
    heroImage: '/uploads/mannat/assets/hero_chaap_sizzler.webp',
    heroSubImage: '/uploads/mannat/assets/hero_paneer_tikka.webp',
    heroTitle: 'Tandoori Snacks & Chaap Feast',
    heroSubtitle: 'Charcoal Tandoor Baked • 100% Pure Soya',
    themeClass: 'chapter-theme-tandoori',
    subcategories: ['chaap specialities', 'paneer feast', 'tandoori snacks', 'tandoori chaap'],
    announcement: {
      text: 'Served with fresh mint chutney, spiced pickled onions & chef special dip',
      badge: '100% Pure Soya',
      icon: 'flame',
    },
  },
  {
    id: 'chapter-kebabs-platters',
    title: 'Veg Kebabs & Signature Platters',
    shortTitle: 'Kebabs & Platters',
    banner: '/uploads/mannat/textures/banner_signature_platters.webp',
    heroImage: '/uploads/mannat/assets/hero_veg_kebabs_platter.webp',
    heroSubImage: '/uploads/mannat/assets/hero_chaap_rolls.webp',
    heroTitle: 'Veg Kebabs & Signature Platters',
    heroSubtitle: 'Dahi Ke Sholay, Seekh Kebabs & Gravy Rolls',
    themeClass: 'chapter-theme-tandoori',
    subcategories: ['veg kebabs & appetizers', 'veg kebabs', 'signature platters', 'platters', 'chaap rolls with gravy', 'chaap rolls', 'rolls'],
    announcement: {
      text: 'Rolls available in 2 Pcs & 4 Pcs portions simmered in rich velvety gravy',
      badge: 'Chef Special',
      icon: 'sparkles',
    },
  },
  {
    id: 'chapter-crunch-soups',
    title: 'MTJ Crunch House, Soups & Salads',
    shortTitle: 'Crunch & Soups',
    banner: '/uploads/mannat/textures/banner_street_specials.webp',
    heroImage: '/uploads/mannat/assets/hero_street_specials.webp',
    heroTitle: 'MTJ Crunch House & Soups',
    heroSubtitle: 'Crispy Golden Bites, Hot Soups & Fresh Salads',
    themeClass: 'chapter-theme-crunch',
    subcategories: ['mtj crunch house', 'crunch house', 'soup station', 'soups', 'fresh salads', 'salads'],
    announcement: {
      text: 'Crispy golden crunch bites & freshly tossed garden salads with artisan dressing',
      badge: 'Crunch House',
      icon: 'sparkles',
    },
  },
  {
    id: 'chapter-signature-gravies',
    title: 'MTJ Signature Gravies & Curries',
    shortTitle: 'Signature Gravies',
    banner: '/uploads/mannat/textures/banner_paneer_khazana.webp',
    heroImage: '/uploads/mannat/assets/hero_paneer_curries_handi.webp',
    heroTitle: 'Paneer Ka Khazana & Handi Curries',
    heroSubtitle: 'Slow-Cooked Dal Makhani & Royal Paneer Curries',
    themeClass: 'chapter-theme-gravies',
    subcategories: ['paneer ka khazana', 'veg specialities', 'dal specialities', 'desi junction', 'rice & biryani', 'raita & papad'],
    announcement: {
      text: 'Overnight simmered Dal Makhani & handcrafted rich gravies with authentic spices',
      badge: 'Signature Curries',
      icon: 'flame',
    },
  },
  {
    id: 'chapter-soya-breads',
    title: 'MTJ Pure Soya Gravies & Breads',
    shortTitle: 'Soya & Breads',
    banner: '/uploads/mannat/textures/banner_soya_gravies.webp',
    heroImage: '/uploads/mannat/assets/hero_soya_chaap_curry.webp',
    heroTitle: 'MTJ Pure Soya Gravies & Breads',
    heroSubtitle: '100% Plant-Based Soya Curries & Tandoori Breads',
    themeClass: 'chapter-theme-gravies',
    subcategories: ['mtj pure soya gravies', 'pure soya gravies', 'tandoori breads', 'breads'],
    announcement: {
      text: '100% Plant-Based Soya Gravies paired with crisp tandoori butter naans',
      badge: 'Pure Soya',
      icon: 'flame',
    },
  },
  {
    id: 'chapter-thalis-combos',
    title: 'MTJ Thalis & Street Specials',
    shortTitle: 'Thalis & Combos',
    banner: '/uploads/mannat/textures/banner_thalis_combos.webp',
    heroImage: '/uploads/mannat/assets/hero_royal_thali.webp',
    heroTitle: 'Grand Dawat Thalis & Meal Combos',
    heroSubtitle: 'Complete Royal Meals & Street Food Classics',
    themeClass: 'chapter-theme-thalis',
    subcategories: ['mtj thalis', 'thalis', 'mtja meal combos', 'meal combos', 'mtj street specials', 'street specials'],
    announcement: {
      text: 'Served with Dal Makhani, Paneer, Rice, Choice of Breads, Salad & Sweet',
      badge: 'Royal Feast',
      icon: 'sparkles',
    },
  },
  {
    id: 'chapter-momos',
    title: 'MTJ Momo Junction',
    shortTitle: 'Momo Junction',
    banner: '/uploads/mannat/textures/banner_momos.webp',
    heroImage: '/uploads/mannat/assets/dish_steamed_momos.webp',
    heroTitle: 'Authentic Himalayan Momo Junction',
    heroSubtitle: 'Steamed, Kurkure, Tandoori & Gravy Momos (6 Pcs)',
    themeClass: 'chapter-theme-momos',
    subcategories: ['momo junction', 'momos'],
    isMomo: true,
    announcement: {
      text: 'Every order served fresh with fiery red chili-garlic dip & spiced mayo',
      badge: 'Himalayan Style',
      icon: 'flame',
    },
  },
  {
    id: 'chapter-chinese-wok',
    title: 'MTJ Chinese Wok',
    shortTitle: 'Chinese Wok',
    banner: '/uploads/mannat/textures/banner_chinese_wok.webp',
    heroImage: '/uploads/mannat/assets/dish_chili_paneer.webp',
    heroTitle: 'Indo-Chinese Wok Specialities',
    heroSubtitle: 'Hakka Noodles, Manchurian & Chili Paneer Bowls',
    themeClass: 'chapter-theme-chinese',
    subcategories: ['noodles bowls', 'mtj chinese bowls', 'appetizers (chinese wok)', 'wok gravies', 'fried rice'],
    announcement: {
      text: 'Tossed in high-heat wok with garlic, spring onions & oriental sauces',
      badge: 'Wok Tossed',
      icon: 'flame',
    },
  },
  {
    id: 'chapter-cafe-quick-bites',
    title: 'MTJ Café, Fries & Quick Bites',
    shortTitle: 'Café & Quick Bites',
    banner: '/uploads/mannat/textures/banner_lebanese_fries.webp',
    heroImage: '/uploads/mannat/assets/dish_falafel_wrap.webp',
    heroTitle: 'Lebanese Delights & Mexican Bites',
    heroSubtitle: 'Cheesy Nachos, Loaded Fries & Hummus Platters',
    themeClass: 'chapter-theme-cafe',
    subcategories: ['cheesy bites', 'fries & nachos', 'labanese delights', 'mexican fiesta', 'mexicana fiest'],
    announcement: {
      text: 'Artisanal quick bites, cheesy finger foods & authentic zaatar hummus',
      badge: 'MTJ Café',
      icon: 'coffee',
    },
  },
  {
    id: 'chapter-pizzas-burgers',
    title: 'Stone Baked Pizzas & Brioche Burgers',
    shortTitle: 'Pizzas & Burgers',
    banner: '/uploads/mannat/textures/banner_pizza_burger.webp',
    heroImage: '/uploads/mannat/assets/dish_creamy_pasta.webp',
    heroSubImage: '/uploads/mannat/assets/dish_brioche_burger.webp',
    heroTitle: 'Italian Pizzas, Pastas & Brioche Burgers',
    heroSubtitle: '10-Inch Thin Crust Pizzas & Gourmet Brioche Buns',
    themeClass: 'chapter-theme-pizzas',
    subcategories: ['pasta selections', 'stone baked pizzas', 'burgers & sandwiches', 'burgers', 'sandwiches'],
    announcement: {
      text: '100% mozzarella stone-baked pizzas & butter toasted brioche burgers',
      badge: 'Stone Baked',
      icon: 'sparkles',
    },
  },
  {
    id: 'chapter-brews-beverages',
    title: 'Artisan Brews, Shakes & Coolers',
    shortTitle: 'Brews & Shakes',
    banner: '/uploads/mannat/textures/banner_thick_shakes.webp',
    heroImage: '/uploads/mannat/assets/dish_cappuccino.webp',
    heroSubImage: '/uploads/mannat/assets/hero_beverages_shakes.webp',
    heroTitle: 'Hot & Cold Artisan Brews, Boba & Shakes',
    heroSubtitle: 'Thick Shakes, Cold Brews & Refreshing Mocktails',
    themeClass: 'chapter-theme-brews',
    subcategories: ['garlic breads', 'hot coffee', 'cold brew', 'ice tea', 'thick shakes', 'boba shakes & coffee', 'coolers', 'beverages'],
    announcement: {
      text: '100% Arabica coffee, loaded thick shakes & hand-crafted fruit coolers',
      badge: 'Barista Specials',
      icon: 'coffee',
    },
  },
  {
    id: 'chapter-desserts',
    title: 'Sweet Treats & Desserts',
    shortTitle: 'Desserts',
    banner: '/uploads/mannat/textures/banner_desserts.webp',
    heroImage: '/uploads/mannat/assets/hero_gulab_jamun_kheer.webp',
    heroTitle: 'Hot Sizzling Brownie & Heritage Sweets',
    heroSubtitle: 'Warm Gulab Jamuns, Kesari Kheer & Ice Creams',
    themeClass: 'chapter-theme-desserts',
    subcategories: ['desserts', 'sweets'],
    announcement: {
      text: 'Indulgent classic Indian sweets & sizzling walnut fudge brownies',
      badge: 'Sweet Ending',
      icon: 'sparkles',
    },
  },
];

export const HeritageArtboardComposition: React.FC<CompositionProps> = ({
  spec,
  restaurant,
  categories,
  rawCategories,
  compact: _compact,
  onAddToCart,
  isPremium,
  activeCategory: _parentActiveCategory,
  setActiveCategory: setParentActiveCategory,
  searchBar,
}) => {
  const { colors, typography } = spec;

  // Active Chapter Navigation State
  const [selectedChapterId, setSelectedChapterId] = useState<string>('all');

  // Group rawCategories into the authentic 12 Chapters
  const chaptersWithCategories = useMemo(() => {
    const list = rawCategories.length > 0 ? rawCategories : categories;

    return CHAPTER_DEFINITIONS.map((chDef) => {
      // Find matching subcategories
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

  // Unassigned categories fallback (if any custom categories exist)
  const unassignedCategories = useMemo(() => {
    const list = rawCategories.length > 0 ? rawCategories : categories;
    const allAssignedIds = new Set(
      chaptersWithCategories.flatMap((ch) => ch.categories.map((c) => c.id))
    );
    return list.filter((cat) => !allAssignedIds.has(cat.id));
  }, [rawCategories, categories, chaptersWithCategories]);

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
          MASTHEAD: AUTHENTIC PDF STOREFRONT SIGNBOARD
          ═══════════════════════════════════════════════════════════════════════ */}
      <header className="relative rounded-3xl overflow-hidden shadow-xl border-2 border-[#FAB700] bg-[#181E19]">
        <picture>
          <source srcSet="/uploads/mannat/textures/masthead_main.webp" type="image/webp" />
          <img
            src="/uploads/mannat/textures/masthead_main.png"
            alt={restaurant.name}
            className="w-full h-auto object-cover select-none"
            loading="eager"
          />
        </picture>

        {/* Storefront Contact & Badges Strip */}
        <div className="bg-[#181E19] text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs border-t-2 border-[#FAB700]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10B981]" />
            <span className="font-bold text-[#FAB700] uppercase tracking-wider text-[11px] sm:text-xs font-serif">
              Chaap Ka Asli Swad • 100% Pure Soya | Authentic Taste Since 2015
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
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
          STICKY 12-CHAPTER NAVIGATION (Adaptive Wrap, Zero Sideways Scroll)
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
          CHAPTERS & DISHES
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-12">
        {visibleChapters.map((chapter) => {
          return (
            <section
              key={chapter.id}
              id={chapter.id}
              data-chapter-id={chapter.id}
              className={clsx(
                "p-3 sm:p-6 space-y-6 rounded-3xl transition-all duration-300 relative",
                chapter.themeClass || 'chapter-theme-tandoori'
              )}
            >
              {/* Corner Flourishes (Authentic High-Res Raster Ornaments) */}
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

              {/* Chapter Header Banner Plate */}
              <div className="rounded-2xl overflow-hidden shadow-md border-2 border-[#FAB700] bg-[#181E19]">
                <picture>
                  <source srcSet={chapter.banner} type="image/webp" />
                  <img
                    src={chapter.banner.replace('.webp', '.png')}
                    alt={chapter.title}
                    className="w-full h-auto object-cover select-none"
                    loading="lazy"
                  />
                </picture>
              </div>

              {/* ─────────────────────────────────────────────────────────────
                  ART-DIRECTED SPATIAL LAYOUT: HERO SHOWCASE + TYPOGRAPHIC MENU
                  ───────────────────────────────────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Authentic Food Photography Showcase */}
                <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
                  <div className="heritage-hero-showcase">
                    <picture>
                      <source srcSet={chapter.heroImage} type="image/webp" />
                      <img
                        src={chapter.heroImage.replace('.webp', '.png')}
                        alt={chapter.heroTitle}
                        className="w-full h-52 sm:h-64 lg:h-72 object-cover"
                        loading="lazy"
                      />
                    </picture>
                    <div className="bg-[#181E19] text-[#FAB700] p-3 sm:p-3.5 border-t-2 border-[#FAB700]/40">
                      <div className="font-serif font-bold text-sm sm:text-base text-white tracking-wide">
                        {chapter.heroTitle}
                      </div>
                      <div className="text-[11px] sm:text-xs text-[#FAB700]/90 font-sans mt-0.5">
                        {chapter.heroSubtitle}
                      </div>
                    </div>
                  </div>

                  {/* Secondary Hero Photo Plate (when present) */}
                  {chapter.heroSubImage && (
                    <div className="heritage-hero-showcase hidden sm:block">
                      <picture>
                        <source srcSet={chapter.heroSubImage} type="image/webp" />
                        <img
                          src={chapter.heroSubImage.replace('.webp', '.png')}
                          alt={chapter.heroTitle}
                          className="w-full h-40 sm:h-48 object-cover"
                          loading="lazy"
                        />
                      </picture>
                    </div>
                  )}

                  {/* Chapter Announcement / Specialty Note */}
                  {chapter.announcement && (
                    <div className="p-3 sm:p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#FAB700] text-amber-950 text-xs font-semibold flex flex-col gap-2 shadow-xs">
                      <div className="flex items-center gap-2">
                        {chapter.announcement.icon === 'coffee' && <Coffee size={15} className="text-amber-800 shrink-0" />}
                        {chapter.announcement.icon === 'flame' && <Flame size={15} className="text-[#CE182C] shrink-0" />}
                        {chapter.announcement.icon === 'sparkles' && <Sparkles size={15} className="text-[#FAB700] shrink-0" />}
                        <span className="leading-snug text-[11px] sm:text-xs">{chapter.announcement.text}</span>
                      </div>
                      {chapter.announcement.badge && (
                        <span className="self-start font-mono font-bold bg-[#FAB700] text-[#181E19] px-2.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
                          {chapter.announcement.badge}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Column: Editorial Typographic Parchment Menu */}
                <div className="lg:col-span-7 space-y-6">
                  {chapter.categories.map((subcat, idx) => {
                    const isMomoSection = chapter.isMomo || subcat.name.toLowerCase().includes('momo');
                    const isRolls = subcat.name.toLowerCase().includes('roll');
                    const hasAnyHalfFull = subcat.items.some((i) => Boolean(i.halfPrice && i.fullPrice));

                    return (
                      <div key={subcat.id} className="space-y-3">
                        {idx > 0 && (
                          <div className="heritage-divider-raster" />
                        )}

                        {/* Subcategory Ribbon Header */}
                        <div className="heritage-subcat-header">
                          <span className="heritage-subcat-badge">
                            <Utensils size={13} className="text-[#FAB700]" />
                            <span>{subcat.name}</span>
                            <span className="text-[11px] opacity-80 font-mono">({subcat.items.length})</span>
                          </span>
                          <span className="heritage-subcat-line" />
                        </div>

                        {/* Momo Section: Tibetan Wave Header & Compact 3-Tier Grid */}
                        {isMomoSection ? (
                          <div className="space-y-4">
                            <div className="rounded-2xl overflow-hidden border-2 border-[#1B3B2B] shadow-sm bg-white">
                              {/* Tibetan Wave Motif Decorative Strip (Authentic Raster Scallop) */}
                              <div 
                                className="w-full h-10 sm:h-12 bg-[#1B3B2B] bg-cover bg-center"
                                style={{ backgroundImage: "url('/menuqr/generated/source_momo_wave_header.png')" }}
                              />
                              <div className="p-2 sm:p-3 bg-[#FFFDF9]">
                                {/* 3-Tier Grid Header */}
                                <div className="heritage-grid-header heritage-momo-grid text-center font-bold">
                                  <span className="text-left">PREPARATION</span>
                                  <span className="text-emerald-700 bg-emerald-50 rounded py-0.5 border border-emerald-200">VEG (6)</span>
                                  <span className="text-amber-800 bg-amber-50 rounded py-0.5 border border-amber-200">PANEER</span>
                                  <span className="text-orange-800 bg-orange-50 rounded py-0.5 border border-orange-200">CHZ (6)</span>
                                </div>

                                {/* Momo Rows */}
                                <div className="divide-y divide-black/5">
                                  {subcat.items.map((item) => {
                                    const basePrice = typeof item.price === 'number' ? item.price : parseFloat(String(item.price || 129));
                                    const halfNum = typeof item.halfPrice === 'number' ? item.halfPrice : (item.halfPrice ? parseFloat(String(item.halfPrice)) : null);
                                    const fullNum = typeof item.fullPrice === 'number' ? item.fullPrice : (item.fullPrice ? parseFloat(String(item.fullPrice)) : null);
                                    const vegPrice = halfNum ?? basePrice;
                                    const panPrice = fullNum ?? (basePrice + 20);
                                    const chzPrice = (fullNum ? fullNum + 20 : basePrice + 40);

                                    return (
                                      <div key={item.id} className="heritage-grid-row heritage-momo-grid">
                                        {/* Col 1: Prep Name */}
                                        <div className="min-w-0 pr-1">
                                          <div className="flex items-center gap-1.5 font-serif font-bold text-xs sm:text-sm text-[#181E19]">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                                            <span className="truncate">{item.name}</span>
                                          </div>
                                        </div>

                                        {/* Col 2: Veg */}
                                        <div>
                                          <button
                                            type="button"
                                            onClick={() => onAddToCart && onAddToCart(item, `₹${vegPrice}`, 'Veg (6 Pcs)')}
                                            className="heritage-matrix-btn heritage-matrix-btn-veg cursor-pointer"
                                            title={`Add Veg ${item.name}`}
                                          >
                                            <span>₹{vegPrice}</span>
                                            {isPremium && <Plus size={9} />}
                                          </button>
                                        </div>

                                        {/* Col 3: Paneer */}
                                        <div>
                                          <button
                                            type="button"
                                            onClick={() => onAddToCart && onAddToCart(item, `₹${panPrice}`, 'Paneer (6 Pcs)')}
                                            className="heritage-matrix-btn heritage-matrix-btn-paneer cursor-pointer"
                                            title={`Add Paneer ${item.name}`}
                                          >
                                            <span>₹{panPrice}</span>
                                            {isPremium && <Plus size={9} />}
                                          </button>
                                        </div>

                                        {/* Col 4: Corn N Cheese */}
                                        <div>
                                          <button
                                            type="button"
                                            onClick={() => onAddToCart && onAddToCart(item, `₹${chzPrice}`, 'Corn N Cheese (6 Pcs)')}
                                            className="heritage-matrix-btn heritage-matrix-btn-cheese cursor-pointer"
                                            title={`Add Corn N Cheese ${item.name}`}
                                          >
                                            <span>₹{chzPrice}</span>
                                            {isPremium && <Plus size={9} />}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Momo Platter Showcase Banner */}
                            <div className="rounded-2xl overflow-hidden border-2 border-[#FAB700] shadow-md bg-white">
                              <img
                                src="/uploads/mannat/assets/dish_steamed_momos.webp"
                                alt="Freshly Steamed & Pan-Fried Momos with Spicy Dip"
                                className="w-full h-40 sm:h-52 object-cover"
                                loading="lazy"
                              />
                              <div className="bg-[#181E19] text-[#FAB700] px-3.5 py-2 text-xs font-serif flex items-center justify-between">
                                <span className="font-bold tracking-wide">Authentic Himalayan Momos • Served with Fiery Chutney & Dip</span>
                                <span className="text-[10px] bg-[#CE182C] text-white font-mono px-2 py-0.5 rounded font-bold">FRESHLY STEAMED</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Clean Editorial Typographic Listing */
                          <div className="heritage-menu-container">
                            {/* Table Header with Exact Same Grid Columns */}
                            <div className={clsx(
                              "heritage-grid-header",
                              hasAnyHalfFull ? "heritage-dual-grid" : "heritage-single-grid"
                            )}>
                              <span>ITEM</span>
                              {hasAnyHalfFull ? (
                                <>
                                  <span className="text-center">{isRolls ? '2 PCS' : 'HALF'}</span>
                                  <span className="text-center">{isRolls ? '4 PCS' : 'FULL'}</span>
                                </>
                              ) : (
                                <span className="text-center">PRICE</span>
                              )}
                            </div>

                            {/* Dish Rows */}
                            <div className="divide-y divide-black/5">
                              {subcat.items.map((item) => {
                                const pricing = parseItemPricing(item);
                                const hasHalfFull = Boolean(item.halfPrice && item.fullPrice);

                                return (
                                  <div 
                                    key={item.id} 
                                    className={clsx(
                                      "heritage-grid-row",
                                      hasAnyHalfFull ? "heritage-dual-grid" : "heritage-single-grid"
                                    )}
                                  >
                                    {/* Left: Indicator & Dish Name */}
                                    <div className="flex items-baseline gap-1.5 min-w-0 pr-1">
                                      <DietIndicator type={item.dietType} compact className="shrink-0 self-center" />
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="font-serif font-bold text-xs sm:text-sm text-[#181E19] leading-tight">
                                            {item.name}
                                          </span>
                                          {item.isBestseller && (
                                            <span className="shrink-0 text-[8px] font-bold uppercase px-1.5 py-0.2 rounded bg-[#CE182C] text-white">
                                              Special
                                            </span>
                                          )}
                                        </div>
                                        {pricing.cleanDescription && (
                                          <p className="text-[10px] sm:text-[11px] text-[#55635C] line-clamp-1 leading-normal font-sans mt-0.5">
                                            {pricing.cleanDescription}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {/* Right: Tabular Pricing & Ordering Controls */}
                                    {hasHalfFull ? (
                                      <>
                                        <div>
                                          <button
                                            type="button"
                                            onClick={() => onAddToCart && onAddToCart(item, `₹${item.halfPrice}`, isRolls ? '2 Pcs' : 'Half')}
                                            className="heritage-portion-btn-half cursor-pointer active:scale-95"
                                            title={`Add ${isRolls ? '2 Pcs' : 'Half'} ${item.name}`}
                                          >
                                            <span className="truncate">₹{item.halfPrice}</span>
                                            {isPremium && <Plus size={10} className="shrink-0 hidden sm:inline" />}
                                          </button>
                                        </div>
                                        <div>
                                          <button
                                            type="button"
                                            onClick={() => onAddToCart && onAddToCart(item, `₹${item.fullPrice}`, isRolls ? '4 Pcs' : 'Full')}
                                            className="heritage-portion-btn-full cursor-pointer active:scale-95"
                                            title={`Add ${isRolls ? '4 Pcs' : 'Full'} ${item.name}`}
                                          >
                                            <span className="truncate">₹{item.fullPrice}</span>
                                            {isPremium && <Plus size={10} className="shrink-0 hidden sm:inline" />}
                                          </button>
                                        </div>
                                      </>
                                    ) : hasAnyHalfFull ? (
                                      <>
                                        <div className="text-center text-[10px] text-stone-400 font-mono">—</div>
                                        <div>
                                          <button
                                            type="button"
                                            onClick={() => onAddToCart && onAddToCart(item, `₹${item.price}`)}
                                            className="heritage-portion-btn-full cursor-pointer active:scale-95"
                                            title={`Add ${item.name}`}
                                          >
                                            <span className="truncate">₹{item.price}</span>
                                            {isPremium && <Plus size={10} className="shrink-0 hidden sm:inline" />}
                                          </button>
                                        </div>
                                      </>
                                    ) : (
                                      <div>
                                        <button
                                          type="button"
                                          onClick={() => onAddToCart && onAddToCart(item, `₹${item.price}`)}
                                          className="heritage-portion-btn-full cursor-pointer active:scale-95"
                                          title={`Add ${item.name}`}
                                        >
                                          <span className="truncate">₹{item.price}</span>
                                          {isPremium && <Plus size={10} className="shrink-0 hidden sm:inline" />}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}

        {/* ─────────────────────────────────────────────────────────────
            FALLBACK: UNASSIGNED CATEGORIES (Ensures no items are ever lost!)
            ───────────────────────────────────────────────────────────── */}
        {unassignedCategories.length > 0 && selectedChapterId === 'all' && (
          <section className="p-3 sm:p-6 space-y-6 rounded-3xl bg-white/95 border-2 border-[#FAB700]/50 shadow-md relative">
            <div className="heritage-subcat-header">
              <span className="heritage-subcat-badge">
                <Utensils size={13} className="text-[#FAB700]" />
                <span>Speciality Dishes & Beverages</span>
              </span>
              <span className="heritage-subcat-line" />
            </div>

            <div className="heritage-menu-container">
              <div className="heritage-grid-header heritage-single-grid">
                <span>ITEM</span>
                <span className="text-center">PRICE</span>
              </div>
              <div className="divide-y divide-black/5">
                {unassignedCategories.flatMap((c) => c.items).map((item) => (
                  <div key={item.id} className="heritage-grid-row heritage-single-grid">
                    <div className="flex items-baseline gap-1.5 min-w-0 pr-1">
                      <DietIndicator type={item.dietType} compact className="shrink-0 self-center" />
                      <span className="font-serif font-bold text-xs sm:text-sm text-[#181E19] truncate">{item.name}</span>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => onAddToCart && onAddToCart(item, `₹${item.price}`)}
                        className="heritage-portion-btn-full cursor-pointer active:scale-95"
                        title={`Add ${item.name}`}
                      >
                        <span className="truncate">₹{item.price}</span>
                        {isPremium && <Plus size={10} className="shrink-0 hidden sm:inline" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Clean Heritage Brand Signoff (Page 17 Instagram poster & QR strictly excluded) */}
      <footer className="pt-8 pb-12 text-center text-xs text-[#556B5D] border-t border-[#FAB700]/30 mt-8 space-y-2">
        <div className="flex items-center justify-center gap-2">
          <span className="w-8 h-[1px] bg-[#FAB700]/60" />
          <span className="font-serif font-black tracking-widest text-[#9E0D24] uppercase text-xs">Mannat Tandoori Junction</span>
          <span className="w-8 h-[1px] bg-[#FAB700]/60" />
        </div>
        <p className="font-sans text-[11px] text-[#181E19]/70">
          Chaap Ka Asli Swad • 100% Pure Soya | Authentic Taste Since 2015
        </p>
      </footer>
    </div>
  );
};

export default HeritageArtboardComposition;
