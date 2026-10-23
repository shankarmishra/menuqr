// MENUQR Design Engine — Authentic Heritage Artboard Composition
// 100% Source-Accurate Reconstruction of Art Board 3.pdf (Mannat Tandoori Junction)
// Identical Logo, Name, Textures, Typography, Badges & 1:1 Artboards with Real Ordering

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
  Utensils,
  BookOpen,
  Layers
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
    heroImage: '/uploads/mannat/page04_elements/page04_left_panel_300dpi.webp',
    heroSubImage: '/uploads/mannat/page04_elements/page04_top_right_bowl_300dpi.webp',
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

// Available 1:1 Artboard Pages from Art Board 3.pdf (strictly Pages 1–16, Page 17 excluded)
const PDF_PAGES = [
  { num: 1, title: 'Page 1: Brand Cover Artboard' },
  { num: 2, title: 'Page 2: Heritage Story' },
  { num: 3, title: 'Page 3: Table of Contents' },
  { num: 4, title: 'Page 4: MTJ Tandoori Snacks (Menu Page 01)' },
  { num: 5, title: 'Page 5: Veg Kebabs & Signature Platters' },
  { num: 6, title: 'Page 6: Crunch House, Soups & Salads' },
  { num: 7, title: 'Page 7: Signature Gravies & Curries' },
  { num: 8, title: 'Page 8: Pure Soya Gravies & Breads' },
  { num: 9, title: 'Page 9: Thalis & Street Specials' },
  { num: 10, title: 'Page 10: Momo Junction' },
  { num: 11, title: 'Page 11: Chinese Wok' },
  { num: 12, title: 'Page 12: Lebanese & Mexican' },
  { num: 13, title: 'Page 13: Pizzas & Burgers' },
  { num: 14, title: 'Page 14: Garlic Breads & Hot Coffee' },
  { num: 15, title: 'Page 15: Thick Shakes & Boba' },
  { num: 16, title: 'Page 16: Heritage Desserts' },
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

  // Active View Mode: 'interactive' (responsive split) or 'artboard' (1:1 PDF plate)
  const [viewMode, setViewMode] = useState<'interactive' | 'artboard'>('interactive');
  const [activeArtboardPage, setActiveArtboardPage] = useState<number>(4);

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
          MASTHEAD: 100% IDENTICAL BRAND COVER ARTBOARD (PAGE 1 OF ART BOARD 3.PDF)
          ═══════════════════════════════════════════════════════════════════════ */}
      <header className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-[#FAB700] bg-[#881313]">
        {/* Corner Flourishes on Header */}
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

        {/* 1:1 Complete High-Resolution Page 1 Artboard Plate */}
        <div className="relative flex justify-center items-center bg-[#881313] p-1 sm:p-3">
          <picture className="w-full max-w-2xl mx-auto block">
            <source srcSet="/uploads/mannat/pages/page_01_artboard_300dpi.webp" type="image/webp" />
            <img
              src="/uploads/mannat/pages/page_01_artboard_300dpi.png"
              alt="Mannat Tandoori Junction — Chaap Ka Asli Swad (Art Board 3.pdf Page 1)"
              className="w-full h-auto object-contain select-none block rounded-2xl shadow-xl"
              loading="eager"
            />
          </picture>
        </div>

        {/* Storefront Contact & Badges Strip */}
        <div className="bg-[#121613] text-white px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs border-t-2 border-[#FAB700]/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10B981]" />
            <span className="font-bold text-[#FAB700] uppercase tracking-wider text-[11px] sm:text-xs font-serif">
              Chaap Ka Asli Swad • 100% Pure Soya | Authentic Taste Since 2015
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
          VIEW MODE TOGGLE: 1:1 PDF ARTBOARD vs RESPONSIVE MENU
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-center p-1 bg-[#FFFDF9] rounded-2xl border-2 border-[#FAB700] shadow-sm">
        <button
          type="button"
          onClick={() => setViewMode('artboard')}
          className={clsx(
            'flex-1 py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer',
            viewMode === 'artboard'
              ? 'bg-[#CE182C] text-white shadow-md'
              : 'text-[#1F2923] hover:bg-[#CE182C]/10'
          )}
        >
          <BookOpen size={16} className={viewMode === 'artboard' ? 'text-[#FAB700]' : 'text-[#CE182C]'} />
          <span>📖 1:1 PDF Artboard (Page 4)</span>
          <span className="text-[10px] bg-[#FAB700] text-black font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
            Same to Same
          </span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('interactive')}
          className={clsx(
            'flex-1 py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer',
            viewMode === 'interactive'
              ? 'bg-[#CE182C] text-white shadow-md'
              : 'text-[#1F2923] hover:bg-[#CE182C]/10'
          )}
        >
          <Utensils size={16} className={viewMode === 'interactive' ? 'text-[#FAB700]' : 'text-[#CE182C]'} />
          <span>🍽️ Interactive Split Menu</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          MODE 1: PURE 1:1 PDF ARTBOARD WITH REAL INTERACTIVE ORDERING
          ═══════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'artboard' && (
        <div className="space-y-6">
          {/* Page Carousel Selector */}
          <div className="bg-[#FFFDF9] p-3 rounded-2xl border-2 border-[#FAB700]/70 shadow-sm flex items-center justify-between gap-2 overflow-x-auto">
            <span className="text-xs font-bold text-[#9E0D24] uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5">
              <Layers size={14} className="text-[#FAB700]" />
              <span>Select Page:</span>
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {PDF_PAGES.map((p) => (
                <button
                  key={p.num}
                  type="button"
                  onClick={() => setActiveArtboardPage(p.num)}
                  className={clsx(
                    'px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer',
                    activeArtboardPage === p.num
                      ? 'bg-[#CE182C] text-white border border-[#FAB700] shadow-xs'
                      : 'bg-white text-[#181E19] border border-black/10 hover:bg-[#CE182C]/10'
                  )}
                >
                  P.{p.num}
                </button>
              ))}
            </div>
          </div>

          {/* Master 1:1 Artboard Display Container */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-[#FAB700] bg-[#181E19]">
            {/* Corner Ornaments */}
            <div 
              className="heritage-corner-flourish heritage-corner-flourish-tl" 
              style={{ backgroundImage: "url('/menuqr/generated/corner_flourish_gold.png')" }} 
            />
            <div 
              className="heritage-corner-flourish heritage-corner-flourish-tr" 
              style={{ backgroundImage: "url('/menuqr/generated/corner_flourish_gold.png')" }} 
            />

            {/* Header Plate */}
            <div className="bg-[#121613] text-[#FAB700] p-3 border-b-2 border-[#FAB700]/80 flex items-center justify-between text-xs sm:text-sm font-serif font-bold">
              <span>{PDF_PAGES.find(p => p.num === activeArtboardPage)?.title}</span>
              <span className="text-emerald-400 font-sans text-[11px] font-semibold bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-500/40">
                ✨ 300 DPI Native Artboard
              </span>
            </div>

            {/* The 1:1 Native Artboard Image */}
            <div className="relative bg-[#FAF4EC] flex justify-center">
              <picture className="w-full block">
                <source 
                  srcSet={activeArtboardPage === 1 
                    ? '/uploads/mannat/pages/page_01_artboard_300dpi.webp' 
                    : activeArtboardPage === 4 
                      ? '/uploads/mannat/pages/page_04_artboard_300dpi.webp' 
                      : `/uploads/mannat/pages/page_${String(activeArtboardPage).padStart(2, '0')}.webp`} 
                  type="image/webp" 
                />
                <img
                  src={activeArtboardPage === 1 
                    ? '/uploads/mannat/pages/page_01_artboard_300dpi.png' 
                    : activeArtboardPage === 4 
                      ? '/uploads/mannat/pages/page_04_artboard_300dpi.png' 
                      : `/uploads/mannat/pages/page_${String(activeArtboardPage).padStart(2, '0')}.png`}
                  alt={`Art Board 3.pdf Page ${activeArtboardPage}`}
                  className="w-full h-auto object-contain select-none block"
                />
              </picture>
            </div>
          </div>

          {/* Quick Order Tap Deck for Page 4 items */}
          <div className="p-4 sm:p-6 rounded-3xl bg-[#FFFDF9] border-2 border-[#FAB700] shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-[#FAB700]/40 pb-2">
              <div className="font-serif font-bold text-base sm:text-lg text-[#9E0D24] flex items-center gap-2">
                <Flame size={18} className="text-[#CE182C]" />
                <span>Tap Any Dish from Page 4 to Order:</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Live Interactive Cart
              </span>
            </div>

            {/* Chaap Specialities Quick-Order Rows */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-[#CE182C] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#CE182C]" />
                <span>Chaap Specialities (19 Dishes)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PAGE04_CHAAP_ITEMS.map((dish) => {
                  const halfQty = getDishQty(dish.id, 'Half');
                  const fullQty = getDishQty(dish.id, 'Full');

                  return (
                    <div 
                      key={dish.id}
                      className="p-2 sm:p-2.5 rounded-xl border border-black/10 bg-white hover:border-[#FAB700] transition-colors flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0 pr-1">
                        <div className="font-bold text-[#181E19] truncate">{dish.name}</div>
                        {dish.isChefSpecial && (
                          <span className="text-[10px] text-amber-700 font-semibold">👨‍🍳 Chef Special</span>
                        )}
                        {dish.isSpicy && (
                          <span className="text-[10px] text-red-600 font-semibold ml-1">🌶️ Spicy</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Half Button */}
                        <button
                          type="button"
                          onClick={() => handleAddToCart({ id: dish.id, name: dish.name, price: dish.halfPrice, category: dish.category }, `₹${dish.halfPrice}`, 'Half')}
                          className={clsx(
                            'px-2 py-1 rounded font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer',
                            halfQty > 0
                              ? 'bg-emerald-700 text-white'
                              : 'bg-amber-50 text-amber-950 border border-amber-300 hover:bg-amber-100'
                          )}
                        >
                          <span>H: ₹{dish.halfPrice}</span>
                          {halfQty > 0 && <span className="bg-white text-emerald-800 px-1 rounded text-[10px]">{halfQty}</span>}
                        </button>

                        {/* Full Button */}
                        <button
                          type="button"
                          onClick={() => handleAddToCart({ id: dish.id, name: dish.name, price: dish.fullPrice, category: dish.category }, `₹${dish.fullPrice}`, 'Full')}
                          className={clsx(
                            'px-2 py-1 rounded font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer',
                            fullQty > 0
                              ? 'bg-emerald-700 text-white'
                              : 'bg-red-50 text-red-950 border border-red-300 hover:bg-red-100'
                          )}
                        >
                          <span>F: ₹{dish.fullPrice}</span>
                          {fullQty > 0 && <span className="bg-white text-red-800 px-1 rounded text-[10px]">{fullQty}</span>}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Paneer Feast Quick-Order Rows */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-[#CE182C] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#CE182C]" />
                <span>Paneer Feast (8 Dishes)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PAGE04_PANEER_ITEMS.map((dish) => {
                  const halfQty = getDishQty(dish.id, 'Half');
                  const fullQty = getDishQty(dish.id, 'Full');

                  return (
                    <div 
                      key={dish.id}
                      className="p-2 sm:p-2.5 rounded-xl border border-black/10 bg-white hover:border-[#FAB700] transition-colors flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0 pr-1">
                        <div className="font-bold text-[#181E19] truncate">{dish.name}</div>
                        {dish.isChefSpecial && (
                          <span className="text-[10px] text-amber-700 font-semibold">👨‍🍳 Chef Special</span>
                        )}
                        {dish.isSpicy && (
                          <span className="text-[10px] text-red-600 font-semibold ml-1">🌶️ Spicy</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Half Button */}
                        <button
                          type="button"
                          onClick={() => handleAddToCart({ id: dish.id, name: dish.name, price: dish.halfPrice, category: dish.category }, `₹${dish.halfPrice}`, 'Half')}
                          className={clsx(
                            'px-2 py-1 rounded font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer',
                            halfQty > 0
                              ? 'bg-emerald-700 text-white'
                              : 'bg-amber-50 text-amber-950 border border-amber-300 hover:bg-amber-100'
                          )}
                        >
                          <span>H: ₹{dish.halfPrice}</span>
                          {halfQty > 0 && <span className="bg-white text-emerald-800 px-1 rounded text-[10px]">{halfQty}</span>}
                        </button>

                        {/* Full Button */}
                        <button
                          type="button"
                          onClick={() => handleAddToCart({ id: dish.id, name: dish.name, price: dish.fullPrice, category: dish.category }, `₹${dish.fullPrice}`, 'Full')}
                          className={clsx(
                            'px-2 py-1 rounded font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer',
                            fullQty > 0
                              ? 'bg-emerald-700 text-white'
                              : 'bg-red-50 text-red-950 border border-red-300 hover:bg-red-100'
                          )}
                        >
                          <span>F: ₹{dish.fullPrice}</span>
                          {fullQty > 0 && <span className="bg-white text-red-800 px-1 rounded text-[10px]">{fullQty}</span>}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODE 2: RESPONSIVE SPLIT MENU (FEATURING PAGE 4 ASYMMETRICAL SPLIT)
          ═══════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'interactive' && (
        <div className="space-y-8">
          {/* Search Bar */}
          {searchBar && (
            <div className="rounded-2xl border-2 border-[#FAB700]/70 p-1.5 bg-[#FFFDF9] shadow-sm">
              {searchBar}
            </div>
          )}

          {/* Sticky 12-Chapter Navigation Bar */}
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

          {/* Chapters Render */}
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
                      CHAPTER 1: EXACT ASYMMETRICAL SPLIT ARCHITECTURE OF PAGE 4
                      ───────────────────────────────────────────────────────────── */}
                  {isTandooriChapter ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Left Column: Authentic Page 4 Vertical Crimson Panel */}
                      <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
                        <div className="rounded-2xl overflow-hidden border-2 border-[#FAB700] shadow-xl bg-[#881313]">
                          <picture>
                            <source srcSet="/uploads/mannat/page04_elements/page04_left_panel_300dpi.webp" type="image/webp" />
                            <img
                              src="/uploads/mannat/page04_elements/page04_left_panel_300dpi.png"
                              alt="MTJ Tandoori Snacks Vertical Panel with Sizzler"
                              className="w-full h-auto object-cover select-none block"
                            />
                          </picture>
                        </div>
                      </div>

                      {/* Right Column: Authentic Page 4 Content & Tables */}
                      <div className="lg:col-span-7 space-y-6 relative">
                        {/* Top-Right Bowl of Malai Chaap */}
                        <div className="flex justify-end -mt-3 -mr-2 mb-1">
                          <img
                            src="/uploads/mannat/page04_elements/page04_top_right_bowl_300dpi.webp"
                            alt="Yellow Bowl of Malai Chaap"
                            className="w-36 sm:w-48 h-auto object-contain drop-shadow-md select-none"
                          />
                        </div>

                        {/* Section 1: CHAAP SPECIALITIES */}
                        <div className="space-y-3">
                          <div className="border-b-2 border-[#9E0D24] pb-1.5 flex items-center justify-between">
                            <h3 className="font-serif font-black text-lg sm:text-xl text-[#9E0D24] tracking-wide uppercase">
                              CHAAP SPECIALITIES
                            </h3>
                            <span className="text-[11px] font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded">
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

                        {/* Emerald Green Multigrain Announcement Banner */}
                        <div className="rounded-2xl overflow-hidden border-2 border-emerald-700 shadow-md">
                          <picture>
                            <source srcSet="/uploads/mannat/page04_elements/page04_green_banner_300dpi.webp" type="image/webp" />
                            <img
                              src="/uploads/mannat/page04_elements/page04_green_banner_300dpi.png"
                              alt="All Chaap Specialities Multigrain Announcement"
                              className="w-full h-auto object-cover select-none block"
                            />
                          </picture>
                        </div>

                        {/* Section 2: PANEER FEAST */}
                        <div className="space-y-3">
                          <div className="border-b-2 border-[#9E0D24] pb-1.5 flex items-center justify-between">
                            <h3 className="font-serif font-black text-lg sm:text-xl text-[#9E0D24] tracking-wide uppercase">
                              PANEER FEAST
                            </h3>
                            <span className="text-[11px] font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded">
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
      )}
    </div>
  );
};
