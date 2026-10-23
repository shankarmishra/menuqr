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
  halfPrice?: number;
  fullPrice: number;
  isChefSpecial?: boolean;
  isSpicy?: boolean;
  isPureSoya?: boolean;
  category: string;
}

const PAGE04_CHAAP_ITEMS: PdfDishItem[] = [
  { id: 'chaap-01', name: 'Malai Chaap', halfPrice: 149, fullPrice: 239, isChefSpecial: true, category: 'Chaap Specialities' },
  { id: 'chaap-02', name: 'Tandoori Chaap', halfPrice: 149, fullPrice: 239, category: 'Chaap Specialities' },
  { id: 'chaap-03', name: 'Punjabi Chaap', halfPrice: 149, fullPrice: 239, isSpicy: true, category: 'Chaap Specialities' },
  { id: 'chaap-04', name: 'Achari Chaap', halfPrice: 149, fullPrice: 239, category: 'Chaap Specialities' },
  { id: 'chaap-05', name: 'Masala Chaap', halfPrice: 149, fullPrice: 239, isSpicy: true, category: 'Chaap Specialities' },
  { id: 'chaap-06', name: 'Chatpati Chaap', halfPrice: 149, fullPrice: 239, category: 'Chaap Specialities' },
  { id: 'chaap-07', name: 'Haryali Chaap', halfPrice: 159, fullPrice: 249, category: 'Chaap Specialities' },
  { id: 'chaap-08', name: 'Garlic Chaap', halfPrice: 159, fullPrice: 249, category: 'Chaap Specialities' },
  { id: 'chaap-09', name: 'Mirch Malai Chaap', halfPrice: 159, fullPrice: 249, isSpicy: true, category: 'Chaap Specialities' },
  { id: 'chaap-10', name: 'Diet Chaap', halfPrice: 159, fullPrice: 249, category: 'Chaap Specialities' },
  { id: 'chaap-11', name: 'Afghani Chaap', halfPrice: 159, fullPrice: 249, isChefSpecial: true, category: 'Chaap Specialities' },
  { id: 'chaap-12', name: 'Nizami Chaap', halfPrice: 169, fullPrice: 259, isChefSpecial: true, category: 'Chaap Specialities' },
  { id: 'chaap-13', name: 'Toofani Chaap', halfPrice: 169, fullPrice: 259, isChefSpecial: true, isSpicy: true, category: 'Chaap Specialities' },
  { id: 'chaap-14', name: 'Mastani Chaap', halfPrice: 169, fullPrice: 259, isChefSpecial: true, category: 'Chaap Specialities' },
  { id: 'chaap-15', name: 'Veg Chicken Tikka Chaap (Pure Soya)', halfPrice: 169, fullPrice: 259, isChefSpecial: true, isPureSoya: true, category: 'Chaap Specialities' },
  { id: 'chaap-16', name: 'Veg Fish Tikka Chaap (Pure Soya)', halfPrice: 169, fullPrice: 259, isChefSpecial: true, isPureSoya: true, category: 'Chaap Specialities' },
  { id: 'chaap-17', name: 'Veg Creamy Butter Leg Piece (Pure Soya)', halfPrice: 169, fullPrice: 259, isChefSpecial: true, isPureSoya: true, category: 'Chaap Specialities' },
  { id: 'chaap-18', name: 'Stuffed Chaap Tandoori', fullPrice: 189, category: 'Chaap Specialities' },
  { id: 'chaap-19', name: 'Stuffed Chaap Afghani', fullPrice: 189, category: 'Chaap Specialities' },
];

const PAGE04_PANEER_ITEMS: PdfDishItem[] = [
  { id: 'paneer-01', name: 'Paneer Tikka', halfPrice: 189, fullPrice: 289, category: 'Paneer Feast' },
  { id: 'paneer-02', name: 'Achari Paneer Tikka', halfPrice: 189, fullPrice: 289, category: 'Paneer Feast' },
  { id: 'paneer-03', name: 'Pudina Paneer Tikka', halfPrice: 189, fullPrice: 289, category: 'Paneer Feast' },
  { id: 'paneer-04', name: 'Kali Mirch Paneer Tikka', halfPrice: 189, fullPrice: 289, category: 'Paneer Feast' },
  { id: 'paneer-05', name: 'Afghani Paneer Tikka', halfPrice: 209, fullPrice: 309, category: 'Paneer Feast' },
  { id: 'paneer-06', name: 'Paneer Malai Tikka', halfPrice: 209, fullPrice: 309, isChefSpecial: true, category: 'Paneer Feast' },
  { id: 'paneer-07', name: 'Paneer Cheese Corn Tikka', fullPrice: 329, category: 'Paneer Feast' },
  { id: 'paneer-08', name: 'Silk Roll Paneer Tikka', fullPrice: 339, isChefSpecial: true, category: 'Paneer Feast' },
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
          Reconstructing Art Board 3.pdf Page 1 with Source-Fidelity
          ═══════════════════════════════════════════════════════════════════════ */}
      <header className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-[#FAB700] artboard-crimson-plate">
        {/* Subtle Watermark Lettering from PDF Page 1 */}
        <div className="artboard-watermark-container">
          <span className="artboard-watermark-word text-[16vw] sm:text-[120px]">PURE</span>
          <span className="artboard-watermark-word text-[16vw] sm:text-[120px]">CHAAP</span>
          <span className="artboard-watermark-word text-[16vw] sm:text-[120px]">SOYA</span>
        </div>

        {/* Real HTML/CSS Artboard Visual Composition */}
        <div className="relative z-10 px-4 py-8 sm:py-12 flex flex-col items-center text-center space-y-4 sm:space-y-5">
          {/* 1. Royal Circular Chef Mascot Emblem (Top Center) */}
          <div className="w-48 sm:w-64 drop-shadow-[0_12px_28px_rgba(0,0,0,0.45)] transition-transform duration-300 hover:scale-105 select-none">
            <img
              src="/uploads/mannat/assets/mascot_chef_isolated_p1.webp"
              alt="Mannat Tandoori Junction Chef Mascot"
              className="w-full h-auto object-contain"
              loading="eager"
            />
          </div>

          {/* 2. Primary Brand Logo & Name (Directly Below Mascot) */}
          <div className="max-w-[280px] sm:max-w-md w-full drop-shadow-[0_4px_16px_rgba(0,0,0,0.35)] select-none">
            <img
              src="/uploads/mannat/assets/mannat_logo_isolated_p1.webp"
              alt="Mannat Tandoori Junction"
              className="w-full h-auto object-contain"
              loading="eager"
            />
            <h1 className="sr-only">Mannat Tandoori Junction</h1>
          </div>

          {/* 3. Tagline Strip with Two Thin White Horizontal Rules */}
          <div className="w-full max-w-sm sm:max-w-md space-y-1 select-none">
            <div className="h-[1px] w-full bg-white/70" />
            <div className="text-white font-sans font-bold text-xs sm:text-sm tracking-wider uppercase py-1">
              100% Pure Soya &nbsp;|&nbsp; Authentic Taste Since 2015
            </div>
            <div className="h-[1px] w-full bg-white/70" />
          </div>

          {/* 4. Rounded Cream Cuisine Capsule Badge */}
          <div className="pt-0.5 select-none">
            <div className="bg-[#FAF4EC] px-6 sm:px-8 py-2 rounded-full shadow-lg border border-[#FAB700]/40">
              <span className="text-[#9E0D24] font-black text-[11px] sm:text-xs tracking-wider uppercase font-sans">
                NORTH INDIAN | INDO-CHINESE | CONTINENTAL
              </span>
            </div>
          </div>

          {/* 5. Signature Dynamic Angled Slogan */}
          <div className="w-56 sm:w-72 pt-1 drop-shadow-[0_8px_20px_rgba(0,0,0,0.4)] transition-transform duration-300 hover:scale-105 select-none">
            <img
              src="/uploads/mannat/assets/slogan_chaap_ka_asli_swad.webp"
              alt="Chaap Ka Asli Swad!"
              className="w-full h-auto object-contain"
              loading="eager"
            />
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
                  MTJ Tandoori Snacks & Chaap Specialities (Art Board 3.pdf Page 4)
                  ───────────────────────────────────────────────────────────── */}
              {isTandooriChapter ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border-2 border-[#FAB700] shadow-xl relative bg-[#CD1B2D]">
                  {/* Left Column: Real Coded Crimson Hero Panel */}
                  <div className="lg:col-span-5 artboard-left-panel p-5 sm:p-8 flex flex-col justify-between relative overflow-hidden">
                    <div className="space-y-2 relative z-10">
                      <div className="font-sans font-black text-white text-4xl sm:text-6xl tracking-tight leading-none uppercase">
                        MTJ
                      </div>
                      <div className="font-sans font-black text-white text-4xl sm:text-6xl tracking-tight leading-none uppercase">
                        TANDOORI
                      </div>
                      <div className="font-sans font-black text-white text-4xl sm:text-6xl tracking-tight leading-none uppercase">
                        SNACKS
                      </div>
                      <div className="h-1.5 w-20 bg-white/80 rounded-full mt-2" />
                      
                      <p className="text-white/90 text-xs sm:text-sm font-sans pt-2 leading-relaxed">
                        Charcoal clay tandoor baked multi-grain chaap marinated in fresh yogurt & secret ground spices.
                      </p>
                    </div>

                    {/* Sizzler Skillet Platter Cutout from 300DPI PDF */}
                    <div className="relative mt-6 sm:mt-10 -ml-5 -mb-5 flex justify-center z-10">
                      <img
                        src="/uploads/mannat/assets/p4_paneer_skillet_left.webp"
                        alt="Tandoori Paneer Tikka Skewers Skillet"
                        className="w-full max-w-sm h-auto object-contain drop-shadow-2xl select-none"
                      />
                    </div>
                  </div>

                  {/* Right Column: Real Coded Parchment Panel with Tables */}
                  <div className="lg:col-span-7 artboard-right-panel p-4 sm:p-6 space-y-6 relative overflow-hidden">
                    {/* Top Right Floating Plate from 300DPI PDF */}
                    <div className="absolute top-0 right-0 w-36 sm:w-52 pointer-events-none select-none z-10 overflow-hidden">
                      <img
                        src="/uploads/mannat/assets/p4_malai_plate_clean.webp"
                        alt="Creamy Malai Chaap Platter"
                        className="w-full h-auto object-contain rounded-bl-3xl drop-shadow-md"
                      />
                    </div>

                    {/* Section 1: CHAAP SPECIALITIES */}
                    <div className="space-y-3 relative z-20">
                      <div className="border-b-4 border-[#CE182C] pb-1 max-w-[240px] sm:max-w-xs">
                        <h3 className="font-sans font-black text-xl sm:text-2xl text-[#CE182C] tracking-tight uppercase leading-none">
                          CHAAP
                        </h3>
                        <h3 className="font-sans font-black text-xl sm:text-2xl text-[#CE182C] tracking-tight uppercase leading-none">
                          SPECIALITIES
                        </h3>
                      </div>

                      {/* Dual Column Header: ITEM | HALF | FULL */}
                      <div className="heritage-grid-header heritage-dual-grid text-center font-bold">
                        <span className="text-left">ITEM</span>
                        <span className="text-[#CE182C]">HALF</span>
                        <span className="text-[#CE182C]">FULL</span>
                      </div>

                      {/* 19 Chaap Items */}
                      <div className="divide-y divide-black/5 bg-white rounded-2xl border border-black/10 shadow-xs p-2">
                        {PAGE04_CHAAP_ITEMS.map((dish) => {
                          const halfQty = dish.halfPrice ? getDishQty(dish.id, 'Half') : 0;
                          const fullQty = getDishQty(dish.id, 'Full');

                          return (
                            <div key={dish.id} className="heritage-grid-row heritage-dual-grid py-2">
                              {/* Col 1: Name & Badges */}
                              <div className="min-w-0 pr-1">
                                <div className="flex items-center gap-1.5 font-sans font-bold text-xs sm:text-sm text-[#181E19]">
                                  {dish.isChefSpecial && (
                                    <span title="Chef Special" className="text-sm">👨‍🍳</span>
                                  )}
                                  <span className="truncate">{dish.name}</span>
                                  {dish.isSpicy && (
                                    <span title="Mild Spicy" className="text-sm">🌶️</span>
                                  )}
                                </div>
                                {dish.isPureSoya && (
                                  <div className="text-[10px] text-emerald-700 font-bold font-sans">
                                    (Pure Soya)
                                  </div>
                                )}
                              </div>

                              {/* Col 2: Half Price & Controls */}
                              <div className="flex justify-center">
                                {dish.halfPrice ? (
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
                                  )
                                ) : (
                                  <span className="text-gray-400 font-bold">-</span>
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

                      {/* Add-on 100% Soya Upgrade Row */}
                      <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 my-3 flex items-center justify-between text-xs font-bold text-[#CE182C]">
                        <div>
                          <div className="tracking-wide">ADD ON : ADD-ON: 100% SOYA UPGRADE</div>
                          <div className="text-[10px] text-red-600 font-semibold tracking-wider">
                            NO MAIDA | NO WHEAT | NO GLUTEN | HIGH PROTIEN
                          </div>
                        </div>
                        <div className="flex gap-4 font-mono font-bold text-red-700 text-sm">
                          <span>₹49</span>
                          <span>₹79</span>
                        </div>
                      </div>
                    </div>

                    {/* Real Coded Emerald Green Announcement Banner */}
                    <div className="bg-[#0E8345] text-white p-3 sm:p-3.5 rounded-xl shadow-md my-4 flex items-center gap-2.5 relative z-20">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-200 animate-pulse shrink-0" />
                      <p className="text-xs sm:text-sm font-bold leading-snug">
                        *All Chaap Specialities are prepared using our Multigrain Chaap. Add-on upgrade available for Premium 100% Plant-Based Soya Chaap.
                      </p>
                    </div>

                    {/* Section 2: PANEER FEAST */}
                    <div className="space-y-3 relative z-20">
                      <div className="border-b-4 border-[#CE182C] pb-1 max-w-[200px]">
                        <h3 className="font-sans font-black text-xl sm:text-2xl text-[#CE182C] tracking-tight uppercase leading-none">
                          PANEER FEAST
                        </h3>
                      </div>

                      {/* Dual Column Header: ITEM | HALF | FULL */}
                      <div className="heritage-grid-header heritage-dual-grid text-center font-bold">
                        <span className="text-left">ITEM</span>
                        <span className="text-[#CE182C]">HALF</span>
                        <span className="text-[#CE182C]">FULL</span>
                      </div>

                      {/* 8 Paneer Items */}
                      <div className="divide-y divide-black/5 bg-white rounded-2xl border border-black/10 shadow-xs p-2">
                        {PAGE04_PANEER_ITEMS.map((dish) => {
                          const halfQty = dish.halfPrice ? getDishQty(dish.id, 'Half') : 0;
                          const fullQty = getDishQty(dish.id, 'Full');

                          return (
                            <div key={dish.id} className="heritage-grid-row heritage-dual-grid py-2">
                              {/* Col 1: Name */}
                              <div className="min-w-0 pr-1">
                                <div className="flex items-center gap-1.5 font-sans font-bold text-xs sm:text-sm text-[#181E19]">
                                  {dish.isChefSpecial && (
                                    <span title="Chef Special" className="text-sm">👨‍🍳</span>
                                  )}
                                  <span className="truncate">{dish.name}</span>
                                  {dish.isSpicy && (
                                    <span title="Mild Spicy" className="text-sm">🌶️</span>
                                  )}
                                </div>
                              </div>

                              {/* Col 2: Half Price */}
                              <div className="flex justify-center">
                                {dish.halfPrice ? (
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

                    {/* Legend Badges Matching PDF */}
                    <div className="flex items-center gap-3 pt-3 text-xs font-bold relative z-20">
                      <span className="px-3 py-1 rounded-full bg-white text-[#CE182C] border border-[#CE182C]/30 shadow-xs flex items-center gap-1.5">
                        👨‍🍳 CHEF SPECIAL
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white text-[#CE182C] border border-[#CE182C]/30 shadow-xs flex items-center gap-1.5">
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
