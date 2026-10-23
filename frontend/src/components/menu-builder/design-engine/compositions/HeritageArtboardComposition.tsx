// MENUQR Design Engine — Authentic Heritage Artboard Composition
// 100% Pure HTML/CSS Coded Recreation of Art Board 3.pdf (Mannat Tandoori Junction)
// Identical Logo, Typography, Textures, Geometry, Badges & Real Interactive Ordering

import React, { useMemo, useState } from 'react';
import clsx from 'clsx';
import type { CompositionProps } from '../types';
import { useMenuCart } from '../../templates/shared/MenuCartContext';
import '../HeritageArtboard.css';
import { 
  MapPin, 
  Phone, 
  Coffee, 
  Plus,
  Minus,
  Flame, 
  Sparkles, 
  Utensils
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Authentic Page 4 (Menu Page 01) Food Catalog from Art Board 3.pdf
// ─────────────────────────────────────────────────────────────────────────────
interface PdfDishItem {
  id: string;
  name: string;
  halfPrice: number;
  fullPrice: number;
  isChefSpecial?: boolean;
  isSpicy?: boolean;
  isPureSoya?: boolean;
  category: string;
}

const PAGE04_CHAAP_ITEMS: PdfDishItem[] = [
  { id: 'chaap-01', name: 'Malai Chaap', halfPrice: 149, fullPrice: 239, isChefSpecial: true, category: 'Chaap Specialities' },
  { id: 'chaap-02', name: 'Afghani Chaap', halfPrice: 149, fullPrice: 239, isChefSpecial: true, category: 'Chaap Specialities' },
  { id: 'chaap-03', name: 'Tandoori Chaap', halfPrice: 139, fullPrice: 229, category: 'Chaap Specialities' },
  { id: 'chaap-04', name: 'Achari Chaap', halfPrice: 139, fullPrice: 229, category: 'Chaap Specialities' },
  { id: 'chaap-05', name: 'Pudina Chaap', halfPrice: 139, fullPrice: 229, category: 'Chaap Specialities' },
  { id: 'chaap-06', name: 'Lemon Chaap', halfPrice: 139, fullPrice: 229, category: 'Chaap Specialities' },
  { id: 'chaap-07', name: 'Haryali Chaap', halfPrice: 139, fullPrice: 229, category: 'Chaap Specialities' },
  { id: 'chaap-08', name: 'Garlic Chaap', halfPrice: 139, fullPrice: 229, category: 'Chaap Specialities' },
  { id: 'chaap-09', name: 'Black Pepper Chaap', halfPrice: 149, fullPrice: 239, category: 'Chaap Specialities' },
  { id: 'chaap-10', name: 'Punjabi Chaap', halfPrice: 149, fullPrice: 239, isSpicy: true, category: 'Chaap Specialities' },
  { id: 'chaap-11', name: 'Masala Chaap', halfPrice: 149, fullPrice: 239, isSpicy: true, category: 'Chaap Specialities' },
  { id: 'chaap-12', name: 'Toofani Chaap', halfPrice: 159, fullPrice: 249, isChefSpecial: true, isSpicy: true, category: 'Chaap Specialities' },
  { id: 'chaap-13', name: 'Nizami Chaap', halfPrice: 159, fullPrice: 249, isChefSpecial: true, category: 'Chaap Specialities' },
  { id: 'chaap-14', name: 'Chatpata Chaap', halfPrice: 149, fullPrice: 239, category: 'Chaap Specialities' },
  { id: 'chaap-15', name: 'Veg Chicken Tikka Chaap (Pure Soya)', halfPrice: 159, fullPrice: 249, isPureSoya: true, category: 'Chaap Specialities' },
  { id: 'chaap-16', name: 'Veg Mutton Chaap (Pure Soya)', halfPrice: 159, fullPrice: 249, isPureSoya: true, category: 'Chaap Specialities' },
  { id: 'chaap-17', name: 'Veg Fish Tikka Chaap (Pure Soya)', halfPrice: 169, fullPrice: 259, isPureSoya: true, category: 'Chaap Specialities' },
  { id: 'chaap-18', name: 'Veg Creamy Butter Leg Piece (Pure Soya)', halfPrice: 179, fullPrice: 279, isPureSoya: true, category: 'Chaap Specialities' },
  { id: 'chaap-19', name: 'MTJ Special Stuffed Chaap', halfPrice: 169, fullPrice: 269, isChefSpecial: true, category: 'Chaap Specialities' },
];

const PAGE04_PANEER_ITEMS: PdfDishItem[] = [
  { id: 'paneer-01', name: 'Paneer Tikka', halfPrice: 169, fullPrice: 259, category: 'Paneer Feast' },
  { id: 'paneer-02', name: 'Malai Paneer Tikka', halfPrice: 179, fullPrice: 279, isChefSpecial: true, category: 'Paneer Feast' },
  { id: 'paneer-03', name: 'Achari Paneer Tikka', halfPrice: 169, fullPrice: 259, category: 'Paneer Feast' },
  { id: 'paneer-04', name: 'Pudina Paneer Tikka', halfPrice: 169, fullPrice: 259, category: 'Paneer Feast' },
  { id: 'paneer-05', name: 'Haryali Paneer Tikka', halfPrice: 169, fullPrice: 259, category: 'Paneer Feast' },
  { id: 'paneer-06', name: 'Garlic Paneer Tikka', halfPrice: 169, fullPrice: 259, category: 'Paneer Feast' },
  { id: 'paneer-07', name: 'Black Pepper Paneer Tikka', halfPrice: 179, fullPrice: 279, category: 'Paneer Feast' },
  { id: 'paneer-08', name: 'Toofani Paneer Tikka', halfPrice: 179, fullPrice: 279, isSpicy: true, category: 'Paneer Feast' },
];

// ─────────────────────────────────────────────────────────────────────────────
// 12 Authentic PDF Chapters (Mirroring Art Board 3.pdf Table of Contents)
// ─────────────────────────────────────────────────────────────────────────────
interface ChapterDef {
  id: string;
  title: string;
  shortTitle: string;
  pdfPageNumber: number;
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
    pdfPageNumber: 4,
    banner: '/uploads/mannat/textures/banner_tandoori_snacks.png',
    heroImage: '/uploads/mannat/assets/hero_chaap_sizzler.png',
    heroSubImage: '/uploads/mannat/assets/dish_malai_chaap.png',
    heroTitle: 'MTJ Tandoori Snacks & Chaap Feast',
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
    pdfPageNumber: 5,
    banner: '/uploads/mannat/textures/banner_signature_platters.png',
    heroImage: '/uploads/mannat/assets/hero_veg_kebabs_platter.png',
    heroSubImage: '/uploads/mannat/assets/hero_chaap_rolls.png',
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
    pdfPageNumber: 6,
    banner: '/uploads/mannat/textures/banner_street_specials.png',
    heroImage: '/uploads/mannat/assets/hero_street_specials.png',
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
    pdfPageNumber: 7,
    banner: '/uploads/mannat/textures/banner_paneer_khazana.png',
    heroImage: '/uploads/mannat/assets/hero_paneer_curries_handi.png',
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
    pdfPageNumber: 8,
    banner: '/uploads/mannat/textures/banner_soya_gravies.png',
    heroImage: '/uploads/mannat/assets/hero_soya_chaap_curry.png',
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
    pdfPageNumber: 9,
    banner: '/uploads/mannat/textures/banner_thalis_combos.png',
    heroImage: '/uploads/mannat/assets/hero_royal_thali.png',
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
    pdfPageNumber: 10,
    banner: '/uploads/mannat/textures/banner_momos.png',
    heroImage: '/uploads/mannat/assets/dish_steamed_momos.png',
    heroTitle: 'Authentic Himalayan Momo Junction',
    heroSubtitle: 'Steamed, Kurkure, Tandoori & Gravy Momos (6 Pcs)',
    themeClass: 'chapter-theme-momos',
    subcategories: ['momo junction', 'momos'],
    isMomo: true,
  },
  {
    id: 'chapter-chinese-wok',
    title: 'MTJ Chinese Wok & Bowls',
    shortTitle: 'Chinese Wok',
    pdfPageNumber: 11,
    banner: '/uploads/mannat/textures/banner_chinese_wok.png',
    heroImage: '/uploads/mannat/assets/hero_chinese_wok.png',
    heroTitle: 'Sizzling Wok Bowls, Noodles & Manchurian',
    heroSubtitle: 'Indo-Chinese Wok Specialities Cooked on High Flame',
    themeClass: 'chapter-theme-chinese',
    subcategories: ['mtj chinese wok', 'chinese wok', 'noodles bowls', 'noodles', 'mtj chinese bowls', 'fried rice', 'wok gravies'],
    announcement: {
      text: 'High-heat wok-tossed Hakka noodles, crispy spring rolls & spicy Manchurian',
      badge: 'Indo-Chinese',
      icon: 'flame',
    },
  },
  {
    id: 'chapter-lebanese-bites',
    title: 'Lebanese Delights & Mexican Fiesta',
    shortTitle: 'Lebanese & Mexican',
    pdfPageNumber: 12,
    banner: '/uploads/mannat/textures/banner_lebanese_fries.png',
    heroImage: '/uploads/mannat/assets/dish_falafel_wrap.png',
    heroTitle: 'Cheesy Nachos, Loaded Fries & Hummus Platters',
    heroSubtitle: 'Mediterranean Falafel, Crispy Tacos & Cheesy Fries',
    themeClass: 'chapter-theme-cafe',
    subcategories: ['mtj cafe', 'cafe', 'cheesy bites', 'fries & nachos', 'fries', 'nachos', 'labanese delights', 'lebanese', 'mexican fiesta', 'mexican'],
    announcement: {
      text: 'Freshly fried falafels with garlic tahini & loaded Mexican nacho bowls',
      badge: 'World Bites',
      icon: 'sparkles',
    },
  },
  {
    id: 'chapter-pizzas-burgers',
    title: 'Stone Baked Pizzas, Burgers & Pastas',
    shortTitle: 'Pizzas & Burgers',
    pdfPageNumber: 13,
    banner: '/uploads/mannat/textures/banner_pizza_burger.png',
    heroImage: '/uploads/mannat/assets/dish_margherita_pizza.png',
    heroSubImage: '/uploads/mannat/assets/dish_brioche_burger.png',
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
    pdfPageNumber: 15,
    banner: '/uploads/mannat/textures/banner_thick_shakes.png',
    heroImage: '/uploads/mannat/assets/dish_cappuccino.png',
    heroSubImage: '/uploads/mannat/assets/hero_beverages_shakes.png',
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
    pdfPageNumber: 16,
    banner: '/uploads/mannat/textures/banner_desserts.png',
    heroImage: '/uploads/mannat/assets/hero_gulab_jamun_kheer.png',
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
  isPremium: _isPremium,
  activeCategory: _parentActiveCategory,
  setActiveCategory: setParentActiveCategory,
  searchBar,
}) => {
  const { colors, typography } = spec;
  const menuCart = useMenuCart();

  // Active Chapter Navigation State
  const [selectedChapterId, setSelectedChapterId] = useState<string>('all');

  // Effective add to cart dispatcher
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

  // Group rawCategories into the authentic 12 Chapters
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
          MASTHEAD: 100% REAL CODED HTML/CSS ARTBOARD DESIGN (PAGE 1 COVER)
          ═══════════════════════════════════════════════════════════════════════ */}
      <header className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-[#FAB700] artboard-crimson-plate">
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

        {/* Real HTML/CSS Artboard Visual Composition */}
        <div className="relative z-10 px-4 py-8 sm:py-12 flex flex-col items-center text-center space-y-6">
          {/* 1. Brand Wordmark Section */}
          <div className="space-y-1">
            <h1 className="artboard-brand-script text-5xl sm:text-7xl tracking-wide select-none">
              mannat
            </h1>
            <div className="artboard-brand-caps text-xl sm:text-3xl tracking-widest text-white uppercase select-none">
              TANDOORI JUNCTION
            </div>
            
            {/* Tagline Strip with Horizontal Rules */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 pt-2">
              <span className="h-[1.5px] w-8 sm:w-16 bg-[#FAB700]/70" />
              <span className="text-white/95 text-[11px] sm:text-xs font-bold tracking-widest uppercase font-sans">
                100% Pure Soya &nbsp;|&nbsp; Authentic Taste Since 2015
              </span>
              <span className="h-[1.5px] w-8 sm:w-16 bg-[#FAB700]/70" />
            </div>
          </div>

          {/* 2. Royal Circular Chef Mascot with Ring Frame */}
          <div className="my-2">
            <div className="artboard-mascot-frame">
              <img
                src="/uploads/mannat/assets/chef_mascot_clean_transparent.webp"
                alt="Mannat Tandoori Junction Chef Mascot"
                className="w-full h-full object-contain transform scale-110 select-none"
                loading="eager"
              />
            </div>
          </div>

          {/* 3. Rounded Cream Category Capsule Badge */}
          <div className="pt-1">
            <div className="artboard-capsule-badge">
              <span>NORTH INDIAN</span>
              <span className="mx-2 text-[#FAB700]">•</span>
              <span>INDO-CHINESE</span>
              <span className="mx-2 text-[#FAB700]">•</span>
              <span>CONTINENTAL</span>
            </div>
          </div>

          {/* 4. Signature Angled Vintage Slogan */}
          <div className="pt-2">
            <div className="artboard-slogan-angled">
              <span>CHAAP KA ASLI SWAD!</span>
            </div>
          </div>
        </div>

        {/* Storefront Contact & Badges Strip */}
        <div className="bg-[#121613] text-white px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs border-t-2 border-[#FAB700]/80 relative z-20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10B981]" />
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
          CHAPTERS & DISHES: REAL CODED HTML/CSS ASYMMETRICAL LAYOUT
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-12">
        {visibleChapters.map((chapter) => {
          const isTandooriChapter = chapter.id === 'chapter-tandoori-snacks';

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

              {/* Chapter Header Banner Plate */}
              <div className="rounded-2xl overflow-hidden shadow-md border-2 border-[#FAB700] bg-[#181E19]">
                <picture>
                  <source srcSet={chapter.banner.replace('.png', '.webp')} type="image/webp" />
                  <img
                    src={chapter.banner}
                    alt={chapter.title}
                    className="w-full h-auto object-cover select-none"
                    loading="lazy"
                  />
                </picture>
              </div>

              {/* ─────────────────────────────────────────────────────────────
                  CHAPTER 1: REAL CODED HTML/CSS ASYMMETRICAL SPLIT OF PAGE 4
                  ───────────────────────────────────────────────────────────── */}
              {isTandooriChapter ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border-2 border-[#FAB700] shadow-xl">
                  {/* Left Column: Real Coded Crimson Hero Panel */}
                  <div className="lg:col-span-5 artboard-left-panel p-5 sm:p-8 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="font-sans font-black text-white text-3xl sm:text-5xl tracking-tighter leading-none opacity-90 uppercase">
                        MTJ
                      </div>
                      <div className="font-serif font-black text-white text-4xl sm:text-5xl tracking-tight leading-none uppercase">
                        TANDOORI
                      </div>
                      <div className="font-serif font-black text-[#FAB700] text-4xl sm:text-5xl tracking-tight leading-none uppercase">
                        SNACKS
                      </div>
                      <div className="h-1.5 w-20 bg-[#FAB700] rounded-full mt-2" />
                      
                      <p className="text-white/90 text-xs sm:text-sm font-sans pt-2 leading-relaxed">
                        Charcoal clay tandoor baked multi-grain chaap marinated in fresh yogurt & secret ground spices.
                      </p>
                    </div>

                    {/* Sizzler Platter Cutout */}
                    <div className="relative mt-6 sm:mt-12 flex justify-center">
                      <img
                        src="/uploads/mannat/assets/hero_chaap_sizzler.png"
                        alt="Tandoori Chaap Sizzler Platter"
                        className="w-full max-w-xs h-auto object-contain rounded-2xl drop-shadow-2xl select-none"
                      />
                    </div>
                  </div>

                  {/* Right Column: Real Coded Parchment Panel with Tables */}
                  <div className="lg:col-span-7 artboard-right-panel p-4 sm:p-6 space-y-6">
                    {/* Floating Malai Chaap Dish Showcase */}
                    <div className="flex justify-end -mt-2 -mr-1">
                      <div className="flex items-center gap-2.5 bg-white/95 backdrop-blur-xs p-1.5 rounded-2xl border border-[#FAB700] shadow-md">
                        <img
                          src="/uploads/mannat/assets/dish_malai_chaap.png"
                          alt="Creamy Malai Chaap"
                          className="w-20 sm:w-28 h-auto object-cover rounded-xl"
                        />
                        <div className="pr-2 text-right">
                          <div className="font-bold text-xs text-[#9E0D24]">Malai Chaap</div>
                          <div className="text-[10px] text-amber-600 font-black uppercase">Chef Special</div>
                        </div>
                      </div>
                    </div>

                    {/* Section 1: CHAAP SPECIALITIES */}
                    <div className="space-y-3">
                      <div className="border-b-2 border-[#9E0D24] pb-1.5 flex items-center justify-between">
                        <h3 className="font-serif font-black text-lg sm:text-xl text-[#9E0D24] tracking-wide uppercase">
                          CHAAP SPECIALITIES
                        </h3>
                        <span className="text-[11px] font-bold text-amber-900 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-300">
                          Multi Grain Chaap
                        </span>
                      </div>

                      {/* Dual Column Header: ITEM | HALF | FULL */}
                      <div className="heritage-grid-header heritage-dual-grid text-center font-bold">
                        <span className="text-left">ITEM</span>
                        <span className="text-[#9E0D24]">HALF</span>
                        <span className="text-[#9E0D24]">FULL</span>
                      </div>

                      {/* 19 Chaap Items */}
                      <div className="divide-y divide-black/5 bg-white rounded-2xl border border-black/10 shadow-xs p-2">
                        {PAGE04_CHAAP_ITEMS.map((dish) => {
                          const halfQty = getDishQty(dish.id, 'Half');
                          const fullQty = getDishQty(dish.id, 'Full');

                          return (
                            <div key={dish.id} className="heritage-grid-row heritage-dual-grid py-2">
                              {/* Col 1: Name & Badges */}
                              <div className="min-w-0 pr-1">
                                <div className="flex items-center gap-1.5 font-serif font-bold text-xs sm:text-sm text-[#181E19]">
                                  <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                                  <span className="truncate">{dish.name}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] mt-0.5 font-sans">
                                  {dish.isChefSpecial && (
                                    <span className="text-amber-800 font-bold">👨‍🍳 Chef Special</span>
                                  )}
                                  {dish.isSpicy && (
                                    <span className="text-red-700 font-bold">🌶️ Mild Spicy</span>
                                  )}
                                  {dish.isPureSoya && (
                                    <span className="text-emerald-700 font-bold bg-emerald-50 px-1 rounded">Pure Soya</span>
                                  )}
                                </div>
                              </div>

                              {/* Col 2: Half Price & Controls */}
                              <div className="flex justify-center">
                                {halfQty > 0 ? (
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
                                      onClick={() => handleAddToCart({ id: dish.id, name: dish.name, price: dish.halfPrice, category: dish.category }, `₹${dish.halfPrice}`, 'Half')}
                                      className="text-emerald-700 hover:scale-110"
                                    >
                                      <Plus size={11} />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleAddToCart({ id: dish.id, name: dish.name, price: dish.halfPrice, category: dish.category }, `₹${dish.halfPrice}`, 'Half')}
                                    className="heritage-portion-btn-half cursor-pointer"
                                  >
                                    <span>₹{dish.halfPrice}</span>
                                    <Plus size={11} className="opacity-70" />
                                  </button>
                                )}
                              </div>

                              {/* Col 3: Full Price & Controls */}
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
                                      onClick={() => handleAddToCart({ id: dish.id, name: dish.name, price: dish.fullPrice, category: dish.category }, `₹${dish.fullPrice}`, 'Full')}
                                      className="text-emerald-700 hover:scale-110"
                                    >
                                      <Plus size={11} />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleAddToCart({ id: dish.id, name: dish.name, price: dish.fullPrice, category: dish.category }, `₹${dish.fullPrice}`, 'Full')}
                                    className="heritage-portion-btn-full cursor-pointer"
                                  >
                                    <span>₹{dish.fullPrice}</span>
                                    <Plus size={11} className="opacity-70" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Real Coded Emerald Green Announcement Banner */}
                    <div className="bg-[#15803D] text-white p-3.5 rounded-xl border border-emerald-600 shadow-md my-4 flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping shrink-0" />
                      <p className="text-xs sm:text-sm font-bold leading-snug">
                        *All Chaap Specialities are prepared using our Multigrain Chaap. Add-on upgrade available for Premium 100% Plant-Based Soya Chaap.
                      </p>
                    </div>

                    {/* Section 2: PANEER FEAST */}
                    <div className="space-y-3">
                      <div className="border-b-2 border-[#9E0D24] pb-1.5 flex items-center justify-between">
                        <h3 className="font-serif font-black text-lg sm:text-xl text-[#9E0D24] tracking-wide uppercase">
                          PANEER FEAST
                        </h3>
                        <span className="text-[11px] font-bold text-amber-900 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-300">
                          Fresh Cottage Cheese
                        </span>
                      </div>

                      {/* Dual Column Header: ITEM | HALF | FULL */}
                      <div className="heritage-grid-header heritage-dual-grid text-center font-bold">
                        <span className="text-left">ITEM</span>
                        <span className="text-[#9E0D24]">HALF</span>
                        <span className="text-[#9E0D24]">FULL</span>
                      </div>

                      {/* 8 Paneer Items */}
                      <div className="divide-y divide-black/5 bg-white rounded-2xl border border-black/10 shadow-xs p-2">
                        {PAGE04_PANEER_ITEMS.map((dish) => {
                          const halfQty = getDishQty(dish.id, 'Half');
                          const fullQty = getDishQty(dish.id, 'Full');

                          return (
                            <div key={dish.id} className="heritage-grid-row heritage-dual-grid py-2">
                              {/* Col 1: Name */}
                              <div className="min-w-0 pr-1">
                                <div className="flex items-center gap-1.5 font-serif font-bold text-xs sm:text-sm text-[#181E19]">
                                  <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                                  <span className="truncate">{dish.name}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] mt-0.5 font-sans">
                                  {dish.isChefSpecial && (
                                    <span className="text-amber-800 font-bold">👨‍🍳 Chef Special</span>
                                  )}
                                  {dish.isSpicy && (
                                    <span className="text-red-700 font-bold">🌶️ Mild Spicy</span>
                                  )}
                                </div>
                              </div>

                              {/* Col 2: Half Price */}
                              <div className="flex justify-center">
                                {halfQty > 0 ? (
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
                                      onClick={() => handleAddToCart({ id: dish.id, name: dish.name, price: dish.halfPrice, category: dish.category }, `₹${dish.halfPrice}`, 'Half')}
                                      className="text-emerald-700 hover:scale-110"
                                    >
                                      <Plus size={11} />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleAddToCart({ id: dish.id, name: dish.name, price: dish.halfPrice, category: dish.category }, `₹${dish.halfPrice}`, 'Half')}
                                    className="heritage-portion-btn-half cursor-pointer"
                                  >
                                    <span>₹{dish.halfPrice}</span>
                                    <Plus size={11} className="opacity-70" />
                                  </button>
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
                                      onClick={() => handleAddToCart({ id: dish.id, name: dish.name, price: dish.fullPrice, category: dish.category }, `₹${dish.fullPrice}`, 'Full')}
                                      className="text-emerald-700 hover:scale-110"
                                    >
                                      <Plus size={11} />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleAddToCart({ id: dish.id, name: dish.name, price: dish.fullPrice, category: dish.category }, `₹${dish.fullPrice}`, 'Full')}
                                    className="heritage-portion-btn-full cursor-pointer"
                                  >
                                    <span>₹{dish.fullPrice}</span>
                                    <Plus size={11} className="opacity-70" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Legend Badges */}
                    <div className="flex items-center gap-3 pt-2 text-xs font-bold">
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-950 border border-amber-300 flex items-center gap-1">
                        👨‍🍳 CHEF SPECIAL
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-950 border border-red-300 flex items-center gap-1">
                        🌶️ MILD SPICY
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Default Chapter Layout for other chapters */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Food Photography Showcase */}
                  <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
                    <div className="heritage-hero-showcase">
                      <picture>
                        <source srcSet={chapter.heroImage.replace('.png', '.webp')} type="image/webp" />
                        <img
                          src={chapter.heroImage}
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

                    {/* Announcement Note */}
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

                  {/* Right Column: Categories & Dishes */}
                  <div className="lg:col-span-7 space-y-6">
                    {chapter.categories.map((subcat, idx) => {
                      const isRolls = subcat.name.toLowerCase().includes('roll');
                      const hasAnyHalfFull = subcat.items.some((i) => Boolean(i.halfPrice && i.fullPrice));

                      return (
                        <div key={subcat.id} className="space-y-3">
                          {idx > 0 && <div className="heritage-divider-raster" />}

                          {/* Subcategory Ribbon Header */}
                          <div className="heritage-subcat-header">
                            <span className="heritage-subcat-badge">
                              <Utensils size={13} className="text-[#FAB700]" />
                              <span>{subcat.name}</span>
                              <span className="text-[11px] opacity-80 font-mono">({subcat.items.length})</span>
                            </span>
                            <span className="heritage-subcat-line" />
                          </div>

                          {/* Dishes Table */}
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
                                      const halfQty = getDishQty(item.id, isRolls ? '2 Pcs' : 'Half');
                                      const fullQty = getDishQty(item.id, isRolls ? '4 Pcs' : 'Full');

                                      return (
                                        <div key={item.id} className="heritage-grid-row heritage-dual-grid">
                                          <div className="min-w-0 pr-1">
                                            <div className="flex items-center gap-1.5 font-serif font-bold text-xs sm:text-sm text-[#181E19]">
                                              <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                                              <span className="truncate">{item.name}</span>
                                            </div>
                                          </div>

                                          <div className="flex justify-center">
                                            {halfQty > 0 ? (
                                              <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-300 rounded px-1.5 py-0.5 text-xs font-bold text-emerald-900">
                                                <button type="button" onClick={() => handleRemoveFromCart(item.id, isRolls ? '2 Pcs' : 'Half')}><Minus size={11} /></button>
                                                <span>{halfQty}</span>
                                                <button type="button" onClick={() => handleAddToCart(item, `₹${item.halfPrice}`, isRolls ? '2 Pcs' : 'Half')}><Plus size={11} /></button>
                                              </div>
                                            ) : (
                                              <button
                                                type="button"
                                                onClick={() => handleAddToCart(item, `₹${item.halfPrice}`, isRolls ? '2 Pcs' : 'Half')}
                                                className="heritage-portion-btn-half cursor-pointer"
                                              >
                                                <span>₹{item.halfPrice}</span>
                                                <Plus size={11} className="opacity-70" />
                                              </button>
                                            )}
                                          </div>

                                          <div className="flex justify-center">
                                            {fullQty > 0 ? (
                                              <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-300 rounded px-1.5 py-0.5 text-xs font-bold text-emerald-900">
                                                <button type="button" onClick={() => handleRemoveFromCart(item.id, isRolls ? '4 Pcs' : 'Full')}><Minus size={11} /></button>
                                                <span>{fullQty}</span>
                                                <button type="button" onClick={() => handleAddToCart(item, `₹${item.fullPrice}`, isRolls ? '4 Pcs' : 'Full')}><Plus size={11} /></button>
                                              </div>
                                            ) : (
                                              <button
                                                type="button"
                                                onClick={() => handleAddToCart(item, `₹${item.fullPrice}`, isRolls ? '4 Pcs' : 'Full')}
                                                className="heritage-portion-btn-full cursor-pointer"
                                              >
                                                <span>₹{item.fullPrice}</span>
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

                                      return (
                                        <div key={item.id} className="heritage-grid-row heritage-single-grid">
                                          <div className="min-w-0 pr-1">
                                            <div className="flex items-center gap-1.5 font-serif font-bold text-xs sm:text-sm text-[#181E19]">
                                              <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                                              <span className="truncate">{item.name}</span>
                                            </div>
                                          </div>

                                          <div className="flex justify-center">
                                            {singleQty > 0 ? (
                                              <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-300 rounded px-1.5 py-0.5 text-xs font-bold text-emerald-900">
                                                <button type="button" onClick={() => handleRemoveFromCart(item.id)}><Minus size={11} /></button>
                                                <span>{singleQty}</span>
                                                <button type="button" onClick={() => handleAddToCart(item, `₹${item.price}`)}><Plus size={11} /></button>
                                              </div>
                                            ) : (
                                              <button
                                                type="button"
                                                onClick={() => handleAddToCart(item, `₹${item.price}`)}
                                                className="heritage-portion-btn-half cursor-pointer"
                                              >
                                                <span>₹{item.price}</span>
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
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};
