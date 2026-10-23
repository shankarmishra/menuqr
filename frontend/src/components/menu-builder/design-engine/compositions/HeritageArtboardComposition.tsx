// MENUQR Design Engine — Authentic Heritage Artboard Composition
// 100% Source-Fidelity Recreation of Art Board 3.pdf (Mannat Tandoori Junction)
// Authentic Cover Page 1 Artwork + Elegant Coded HTML/CSS Artboards for Interior Menu
// Razor-Sharp Typography, Dual/Single Price Tables, Zero Truncation, Interactive Cart

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
// Authentic Dish Data Types
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

// ─────────────────────────────────────────────────────────────────────────────
// Chapter 1: MTJ Tandoori Snacks & Paneer Feast (Art Board 3.pdf Page 4)
// ─────────────────────────────────────────────────────────────────────────────
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
// Chapter 2: Veg Kebabs & Signature Platters (Art Board 3.pdf Page 5)
// ─────────────────────────────────────────────────────────────────────────────
const PAGE05_KEBAB_ITEMS: PdfDishItem[] = [
  { id: 'kebab-01', name: 'Mushroom Tikka', fullPrice: 249, category: 'Veg Kebabs & Appetizers' },
  { id: 'kebab-02', name: 'Veg Kebab', fullPrice: 249, category: 'Veg Kebabs & Appetizers' },
  { id: 'kebab-03', name: 'Tandoori Stuffed Aloo', fullPrice: 259, category: 'Veg Kebabs & Appetizers' },
  { id: 'kebab-04', name: 'Peele Moti Ke Kebab (6 Pcs)', fullPrice: 259, isChefSpecial: true, isSpicy: true, category: 'Veg Kebabs & Appetizers' },
  { id: 'kebab-05', name: 'Dahi Ke Sholay (6 Pcs)', fullPrice: 259, isChefSpecial: true, category: 'Veg Kebabs & Appetizers' },
  { id: 'kebab-06', name: 'Veg Malai Chicken Kebab (3 Pcs)', fullPrice: 269, isPureSoya: true, category: 'Veg Kebabs & Appetizers' },
  { id: 'kebab-07', name: 'Veg Mutton Soya Kebab (3 Pcs)', fullPrice: 269, isPureSoya: true, category: 'Veg Kebabs & Appetizers' },
  { id: 'kebab-08', name: 'Dahi Ke Kebab (6 Pcs)', fullPrice: 279, isChefSpecial: true, category: 'Veg Kebabs & Appetizers' },
  { id: 'kebab-09', name: 'Hara Bhara Kebab (6 Pcs)', fullPrice: 279, isChefSpecial: true, category: 'Veg Kebabs & Appetizers' },
  { id: 'kebab-10', name: 'Beetroot Kebab (6 Pcs)', fullPrice: 279, category: 'Veg Kebabs & Appetizers' },
  { id: 'kebab-11', name: 'Stuffed Mushroom Tikka', fullPrice: 299, isChefSpecial: true, category: 'Veg Kebabs & Appetizers' },
];

const PAGE05_PLATTER_ITEMS: PdfDishItem[] = [
  { id: 'platter-01', name: 'Chaap Platter', fullPrice: 369, category: 'Signature Platters' },
  { id: 'platter-02', name: 'MTJ Tandoori Platter', fullPrice: 389, category: 'Signature Platters' },
  { id: 'platter-03', name: 'Tandoori Platter (Pure Soya)', fullPrice: 499, isPureSoya: true, category: 'Signature Platters' },
];

const PAGE05_ROLL_ITEMS: PdfDishItem[] = [
  { id: 'roll-01', name: 'Malai Chaap Roll With Gravy', halfPrice: 199, fullPrice: 299, category: 'Chaap Rolls With Gravy' },
  { id: 'roll-02', name: 'Tandoori Chaap Roll With Gravy', halfPrice: 199, fullPrice: 299, category: 'Chaap Rolls With Gravy' },
  { id: 'roll-03', name: 'Punjabi Chaap Roll With Gravy', halfPrice: 199, fullPrice: 299, isSpicy: true, category: 'Chaap Rolls With Gravy' },
  { id: 'roll-04', name: 'Haryali Chaap Roll With Gravy', halfPrice: 199, fullPrice: 299, category: 'Chaap Rolls With Gravy' },
  { id: 'roll-05', name: 'Afghani Chaap Roll With Gravy', halfPrice: 209, fullPrice: 309, category: 'Chaap Rolls With Gravy' },
  { id: 'roll-06', name: 'Veg Malai Chicken Kebab Roll (Pure Soya)', halfPrice: 219, fullPrice: 359, isPureSoya: true, category: 'Chaap Rolls With Gravy' },
  { id: 'roll-07', name: 'Veg Mutton Soya Kebab Roll (Pure Soya)', halfPrice: 219, fullPrice: 359, isPureSoya: true, category: 'Chaap Rolls With Gravy' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Chapter 3: MTJ Crunch House & Soups & Salads (Art Board 3.pdf Page 6)
// ─────────────────────────────────────────────────────────────────────────────
const PAGE06_CRUNCH_ITEMS: PdfDishItem[] = [
  { id: 'crunch-01', name: 'Crunchy Soya Chaap PopCorn (12 Pcs)', fullPrice: 190, category: 'MTJ Crunch House' },
  { id: 'crunch-02', name: 'Veg Happy Juicy Tikka (5 Pcs)', fullPrice: 190, category: 'MTJ Crunch House' },
  { id: 'crunch-03', name: 'Crispy Soya Satay Sticks (4 Pcs)', fullPrice: 200, category: 'MTJ Crunch House' },
  { id: 'crunch-04', name: 'Veg Leg Piece Fry (3 Pcs)', fullPrice: 200, category: 'MTJ Crunch House' },
  { id: 'crunch-05', name: 'Soya Singada Fish Nuggets (4 Pcs)', fullPrice: 210, category: 'MTJ Crunch House' },
  { id: 'crunch-06', name: 'Crunchy Soya Chaap Chicken Nuggets (6 Pcs)', fullPrice: 230, category: 'MTJ Crunch House' },
  { id: 'crunch-07', name: 'Crispy Soya Tikka (12 Pcs)', fullPrice: 230, category: 'MTJ Crunch House' },
  { id: 'crunch-08', name: 'Soya Crumb Fish Fry (2 Pcs)', fullPrice: 230, category: 'MTJ Crunch House' },
  { id: 'crunch-09', name: 'Veg Shammi Kebab (4 Pcs)', fullPrice: 230, category: 'MTJ Crunch House' },
  { id: 'crunch-10', name: 'Kurkuri Soya Chaap (6 Pcs)', fullPrice: 240, category: 'MTJ Crunch House' },
  { id: 'crunch-11', name: 'Soya Chaap Crispy Fish Fingers (6 Pcs)', fullPrice: 240, category: 'MTJ Crunch House' },
  { id: 'crunch-12', name: 'Barbie Doll Chaap (5 Pcs)', fullPrice: 260, category: 'MTJ Crunch House' },
  { id: 'crunch-13', name: 'Crunchy Soya Chaap Drumsticks (4 Pcs)', fullPrice: 260, category: 'MTJ Crunch House' },
  { id: 'crunch-14', name: 'Soya Chaap Fish Nuggets (6 Pcs)', fullPrice: 270, category: 'MTJ Crunch House' },
  { id: 'crunch-15', name: 'Soya Japanese Fish Fry (6 Pcs)', fullPrice: 310, category: 'MTJ Crunch House' },
  { id: 'crunch-16', name: 'Veg Pemfret Fish Fry', fullPrice: 350, category: 'MTJ Crunch House' },
];

const PAGE06_SOUP_ITEMS: PdfDishItem[] = [
  { id: 'soup-01', name: 'Cream of Tomato Soup', fullPrice: 129, category: 'Soup Station' },
  { id: 'soup-02', name: 'Sweet Corn Soup', fullPrice: 129, category: 'Soup Station' },
  { id: 'soup-03', name: 'Veggie Sweet Corn Soup', fullPrice: 139, category: 'Soup Station' },
  { id: 'soup-04', name: 'Lemon Coriander Soup', fullPrice: 139, category: 'Soup Station' },
  { id: 'soup-05', name: 'Hot N Sour Soup', fullPrice: 139, category: 'Soup Station' },
  { id: 'soup-06', name: 'Manchow Soup', fullPrice: 139, category: 'Soup Station' },
  { id: 'soup-07', name: 'Creamy Mushroom Soup', fullPrice: 159, category: 'Soup Station' },
  { id: 'soup-08', name: 'Broccoli & Almond Soup', fullPrice: 189, category: 'Soup Station' },
];

const PAGE06_SALAD_ITEMS: PdfDishItem[] = [
  { id: 'salad-01', name: 'Garden Green Salad', fullPrice: 119, category: 'Fresh Salads' },
  { id: 'salad-02', name: 'Greek Salad', fullPrice: 209, category: 'Fresh Salads' },
  { id: 'salad-03', name: 'Veg Caesar Salad', fullPrice: 229, category: 'Fresh Salads' },
  { id: 'salad-04', name: 'Watermelon Feta Cheese Salad', fullPrice: 259, category: 'Fresh Salads' },
  { id: 'salad-05', name: 'Couscous Salad', fullPrice: 259, category: 'Fresh Salads' },
];

// ─────────────────────────────────────────────────────────────────────────────
// 12 Authentic PDF Chapters
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

  // Group rawCategories into the authentic 12 Chapters with enriched counts
  const chaptersWithCategories = useMemo(() => {
    const list = rawCategories.length > 0 ? rawCategories : categories;

    return CHAPTER_DEFINITIONS.map((chDef) => {
      const matchedCats = list.filter((cat) => {
        const catNameLower = cat.name.toLowerCase().trim();
        return chDef.subcategories.some((kw) => catNameLower.includes(kw));
      });

      let totalItems = matchedCats.reduce((sum, c) => sum + c.items.length, 0);

      // Chapter-specific source-accurate item overrides
      if (chDef.id === 'chapter-tandoori-snacks') {
        totalItems = PAGE04_CHAAP_ITEMS.length + PAGE04_PANEER_ITEMS.length; // 27
      } else if (chDef.id === 'chapter-kebabs-platters') {
        totalItems = PAGE05_KEBAB_ITEMS.length + PAGE05_PLATTER_ITEMS.length + PAGE05_ROLL_ITEMS.length; // 21
      } else if (chDef.id === 'chapter-crunch-soups') {
        totalItems = PAGE06_CRUNCH_ITEMS.length + PAGE06_SOUP_ITEMS.length + PAGE06_SALAD_ITEMS.length; // 29
      }

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
    return chaptersWithCategories.reduce((sum, c) => sum + c.totalItems, 0);
  }, [chaptersWithCategories]);

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
          <h1 className="sr-only">Mannat Tandoori Junction - Chaap Ka Asli Swad</h1>
        </div>

        {/* Storefront Contact & Badges Strip */}
        <div className="bg-[#181E19] text-[#FAF4EC] px-4 py-2.5 sm:px-6 flex flex-wrap items-center justify-between gap-3 border-t-2 border-[#FAB700]/50">
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
          CHAPTERS: 100% CODED HTML/CSS REAL ARTBOARD ARCHITECTURE
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
                  CHAPTER 1: REAL CODED HTML/CSS ASYMMETRICAL SPLIT OF PAGE 4
                  MTJ Tandoori Snacks & Chaap Specialities (Art Board 3.pdf Page 4)
                  ───────────────────────────────────────────────────────────── */}
              {isTandooriChapter ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border-2 border-[#FAB700] shadow-xl relative bg-[#CD1B2D]">
                  {/* Left Column: Real Coded Crimson Hero Panel (Sticky on Desktop) */}
                  <div className="lg:col-span-5 artboard-left-panel p-5 sm:p-7 flex flex-col justify-between relative overflow-hidden lg:sticky lg:top-24 self-start">
                    {/* Watermark text */}
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

                    {/* Sizzler Skillet Platter Cutout from 300DPI PDF */}
                    <div className="relative mt-6 sm:mt-8 flex justify-center z-10">
                      <img
                        src="/uploads/mannat/assets/p4_paneer_skillet_left.webp"
                        alt="Tandoori Paneer Tikka Skewers Skillet"
                        className="w-full max-w-[260px] sm:max-w-xs h-auto object-contain drop-shadow-2xl select-none"
                      />
                    </div>
                  </div>

                  {/* Right Column: Real Coded Parchment Panel with Tables */}
                  <div className="lg:col-span-7 artboard-right-panel p-4 sm:p-6 space-y-6 relative overflow-hidden">
                    {/* Top Right Floating Plate from 300DPI PDF */}
                    <div className="absolute top-0 right-0 w-32 sm:w-44 pointer-events-none select-none z-10 overflow-hidden">
                      <img
                        src="/uploads/mannat/assets/p4_malai_plate_clean.webp"
                        alt="Creamy Malai Chaap Platter"
                        className="w-full h-auto object-contain rounded-bl-3xl drop-shadow-md"
                      />
                    </div>

                    {/* Section 1: CHAAP SPECIALITIES */}
                    <div className="space-y-3 relative z-20">
                      <div className="border-b-4 border-[#CE182C] pb-1 max-w-[220px]">
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
                                  <span className="break-words leading-tight">{dish.name}</span>
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
                    </div>

                    {/* Section 2: PANEER FEAST */}
                    <div className="space-y-3 relative z-20">
                      <div className="border-b-4 border-[#CE182C] pb-1 max-w-[180px]">
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
                                  <span className="break-words leading-tight">{dish.name}</span>
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
                   CHAPTER 2: VEG KEBABS, PLATTERS & GRAVY ROLLS (PAGE 5)
                   ───────────────────────────────────────────────────────────── */
                <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border-2 border-[#FAB700] shadow-xl relative bg-[#CD1B2D]">
                  {/* Left Column: Crimson Hero Panel with Kebab Platter */}
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

                  {/* Right Column: Coded Tables */}
                  <div className="lg:col-span-7 artboard-right-panel p-4 sm:p-6 space-y-6 relative overflow-hidden">
                    {/* Section 1: VEG KEBABS & APPETIZERS */}
                    <div className="space-y-3 relative z-20">
                      <div className="border-b-4 border-[#CE182C] pb-1 max-w-[240px]">
                        <h3 className="font-sans font-black text-xl sm:text-2xl text-[#CE182C] tracking-tight uppercase leading-none">
                          VEG KEBABS &amp; APPETIZERS
                        </h3>
                      </div>

                      <div className="heritage-grid-header heritage-single-grid text-center font-bold">
                        <span className="text-left">ITEM</span>
                        <span className="text-[#CE182C]">PRICE</span>
                      </div>

                      <div className="divide-y divide-black/5 bg-white rounded-2xl border border-black/10 shadow-xs p-2">
                        {PAGE05_KEBAB_ITEMS.map((dish) => {
                          const singleQty = getDishQty(dish.id);

                          return (
                            <div key={dish.id} className="heritage-grid-row heritage-single-grid py-2">
                              <div className="min-w-0 pr-1">
                                <div className="flex items-center gap-1.5 font-sans font-bold text-xs sm:text-sm text-[#181E19]">
                                  {dish.isChefSpecial && <span title="Chef Special" className="text-sm">👨‍🍳</span>}
                                  <span className="break-words leading-tight">{dish.name}</span>
                                  {dish.isSpicy && <span title="Mild Spicy" className="text-sm">🌶️</span>}
                                </div>
                                {dish.isPureSoya && (
                                  <div className="text-[10px] text-emerald-700 font-bold font-sans">
                                    (Pure Soya)
                                  </div>
                                )}
                              </div>

                              <div className="flex justify-center">
                                {singleQty > 0 ? (
                                  <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-300 rounded px-1.5 py-0.5 text-xs font-bold text-emerald-900">
                                    <button type="button" onClick={() => handleRemoveFromCart(dish.id)} className="text-red-700 hover:scale-110"><Minus size={11} /></button>
                                    <span>{singleQty}</span>
                                    <button type="button" onClick={() => handleAddToCart({ id: dish.id, name: dish.name, price: dish.fullPrice, category: dish.category }, `₹${dish.fullPrice}`)} className="text-emerald-700 hover:scale-110"><Plus size={11} /></button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleAddToCart({ id: dish.id, name: dish.name, price: dish.fullPrice, category: dish.category }, `₹${dish.fullPrice}`)}
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

                    {/* Section 2: SIGNATURE PLATTERS */}
                    <div className="space-y-3 relative z-20">
                      <div className="border-b-4 border-[#CE182C] pb-1 max-w-[220px]">
                        <h3 className="font-sans font-black text-xl sm:text-2xl text-[#CE182C] tracking-tight uppercase leading-none">
                          SIGNATURE PLATTERS
                        </h3>
                      </div>

                      <div className="heritage-grid-header heritage-single-grid text-center font-bold">
                        <span className="text-left">ITEM</span>
                        <span className="text-[#CE182C]">PRICE</span>
                      </div>

                      <div className="divide-y divide-black/5 bg-white rounded-2xl border border-black/10 shadow-xs p-2">
                        {PAGE05_PLATTER_ITEMS.map((dish) => {
                          const singleQty = getDishQty(dish.id);

                          return (
                            <div key={dish.id} className="heritage-grid-row heritage-single-grid py-2">
                              <div className="min-w-0 pr-1">
                                <div className="flex items-center gap-1.5 font-sans font-bold text-xs sm:text-sm text-[#181E19]">
                                  <span className="break-words leading-tight">{dish.name}</span>
                                </div>
                                {dish.isPureSoya && (
                                  <div className="text-[10px] text-emerald-700 font-bold font-sans">
                                    (Pure Soya)
                                  </div>
                                )}
                              </div>

                              <div className="flex justify-center">
                                {singleQty > 0 ? (
                                  <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-300 rounded px-1.5 py-0.5 text-xs font-bold text-emerald-900">
                                    <button type="button" onClick={() => handleRemoveFromCart(dish.id)} className="text-red-700 hover:scale-110"><Minus size={11} /></button>
                                    <span>{singleQty}</span>
                                    <button type="button" onClick={() => handleAddToCart({ id: dish.id, name: dish.name, price: dish.fullPrice, category: dish.category }, `₹${dish.fullPrice}`)} className="text-emerald-700 hover:scale-110"><Plus size={11} /></button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleAddToCart({ id: dish.id, name: dish.name, price: dish.fullPrice, category: dish.category }, `₹${dish.fullPrice}`)}
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

                    {/* Section 3: CHAAP ROLLS WITH GRAVY (2 Pcs / 4 Pcs) */}
                    <div className="space-y-3 relative z-20">
                      <div className="border-b-4 border-[#CE182C] pb-1 max-w-[240px]">
                        <h3 className="font-sans font-black text-xl sm:text-2xl text-[#CE182C] tracking-tight uppercase leading-none">
                          CHAAP ROLLS WITH GRAVY
                        </h3>
                      </div>

                      <div className="heritage-grid-header heritage-dual-grid text-center font-bold">
                        <span className="text-left">ITEM</span>
                        <span className="text-[#CE182C]">2 PCS</span>
                        <span className="text-[#CE182C]">4 PCS</span>
                      </div>

                      <div className="divide-y divide-black/5 bg-white rounded-2xl border border-black/10 shadow-xs p-2">
                        {PAGE05_ROLL_ITEMS.map((dish) => {
                          const halfQty = getDishQty(dish.id, '2 Pcs');
                          const fullQty = getDishQty(dish.id, '4 Pcs');

                          return (
                            <div key={dish.id} className="heritage-grid-row heritage-dual-grid py-2">
                              <div className="min-w-0 pr-1">
                                <div className="flex items-center gap-1.5 font-sans font-bold text-xs sm:text-sm text-[#181E19]">
                                  <span className="break-words leading-tight">{dish.name}</span>
                                  {dish.isSpicy && <span title="Mild Spicy" className="text-sm">🌶️</span>}
                                </div>
                                {dish.isPureSoya && (
                                  <div className="text-[10px] text-emerald-700 font-bold font-sans">
                                    (Pure Soya)
                                  </div>
                                )}
                              </div>

                              <div className="flex justify-center">
                                {halfQty > 0 ? (
                                  <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-300 rounded px-1.5 py-0.5 text-xs font-bold text-emerald-900">
                                    <button type="button" onClick={() => handleRemoveFromCart(dish.id, '2 Pcs')} className="text-red-700 hover:scale-110"><Minus size={11} /></button>
                                    <span>{halfQty}</span>
                                    <button type="button" onClick={() => handleAddToCart({ id: dish.id, name: dish.name, price: dish.halfPrice, category: dish.category }, `₹${dish.halfPrice}`, '2 Pcs')} className="text-emerald-700 hover:scale-110"><Plus size={11} /></button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleAddToCart({ id: dish.id, name: dish.name, price: dish.halfPrice, category: dish.category }, `₹${dish.halfPrice}`, '2 Pcs')}
                                    className="heritage-portion-btn-half cursor-pointer"
                                  >
                                    <span>₹{dish.halfPrice}</span>
                                    <Plus size={11} className="opacity-70" />
                                  </button>
                                )}
                              </div>

                              <div className="flex justify-center">
                                {fullQty > 0 ? (
                                  <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-300 rounded px-1.5 py-0.5 text-xs font-bold text-emerald-900">
                                    <button type="button" onClick={() => handleRemoveFromCart(dish.id, '4 Pcs')} className="text-red-700 hover:scale-110"><Minus size={11} /></button>
                                    <span>{fullQty}</span>
                                    <button type="button" onClick={() => handleAddToCart({ id: dish.id, name: dish.name, price: dish.fullPrice, category: dish.category }, `₹${dish.fullPrice}`, '4 Pcs')} className="text-emerald-700 hover:scale-110"><Plus size={11} /></button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleAddToCart({ id: dish.id, name: dish.name, price: dish.fullPrice, category: dish.category }, `₹${dish.fullPrice}`, '4 Pcs')}
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

                      {/* Add on banner */}
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
                   CHAPTER 3: CRUNCH HOUSE, SOUPS & SALADS (PAGE 6)
                   ───────────────────────────────────────────────────────────── */
                <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border-2 border-[#FAB700] shadow-xl relative bg-[#D97706]">
                  {/* Left Column: Coded Items */}
                  <div className="lg:col-span-7 artboard-right-panel p-4 sm:p-6 space-y-6 relative overflow-hidden order-2 lg:order-1">
                    {/* Section 1: MTJ CRUNCH HOUSE */}
                    <div className="space-y-3 relative z-20">
                      <div className="border-b-4 border-[#D97706] pb-1 max-w-[240px]">
                        <h3 className="font-sans font-black text-xl sm:text-2xl text-[#D97706] tracking-tight uppercase leading-none">
                          MTJ CRUNCH HOUSE
                        </h3>
                        <p className="text-[11px] font-bold text-amber-900 mt-1">Crispy Plant-Based Soya Delights (Fried)</p>
                      </div>

                      <div className="heritage-grid-header heritage-single-grid text-center font-bold">
                        <span className="text-left">ITEM</span>
                        <span className="text-[#D97706]">PRICE</span>
                      </div>

                      <div className="divide-y divide-black/5 bg-white rounded-2xl border border-black/10 shadow-xs p-2">
                        {PAGE06_CRUNCH_ITEMS.map((dish) => {
                          const singleQty = getDishQty(dish.id);

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
                                    <button type="button" onClick={() => handleAddToCart({ id: dish.id, name: dish.name, price: dish.fullPrice, category: dish.category }, `₹${dish.fullPrice}`)} className="text-amber-700 hover:scale-110"><Plus size={11} /></button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleAddToCart({ id: dish.id, name: dish.name, price: dish.fullPrice, category: dish.category }, `₹${dish.fullPrice}`)}
                                    className="heritage-portion-btn-full cursor-pointer !bg-[#D97706]"
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

                    {/* Section 2: SOUP STATION */}
                    <div className="space-y-3 relative z-20">
                      <div className="border-b-4 border-[#D97706] pb-1 max-w-[200px]">
                        <h3 className="font-sans font-black text-xl sm:text-2xl text-[#D97706] tracking-tight uppercase leading-none">
                          SOUP STATION
                        </h3>
                      </div>

                      <div className="heritage-grid-header heritage-single-grid text-center font-bold">
                        <span className="text-left">ITEM</span>
                        <span className="text-[#D97706]">PRICE</span>
                      </div>

                      <div className="divide-y divide-black/5 bg-white rounded-2xl border border-black/10 shadow-xs p-2">
                        {PAGE06_SOUP_ITEMS.map((dish) => {
                          const singleQty = getDishQty(dish.id);

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
                                    <button type="button" onClick={() => handleAddToCart({ id: dish.id, name: dish.name, price: dish.fullPrice, category: dish.category }, `₹${dish.fullPrice}`)} className="text-amber-700 hover:scale-110"><Plus size={11} /></button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleAddToCart({ id: dish.id, name: dish.name, price: dish.fullPrice, category: dish.category }, `₹${dish.fullPrice}`)}
                                    className="heritage-portion-btn-full cursor-pointer !bg-[#D97706]"
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

                    {/* Section 3: FRESH SALADS */}
                    <div className="space-y-3 relative z-20">
                      <div className="border-b-4 border-[#D97706] pb-1 max-w-[200px]">
                        <h3 className="font-sans font-black text-xl sm:text-2xl text-[#D97706] tracking-tight uppercase leading-none">
                          FRESH SALADS
                        </h3>
                      </div>

                      <div className="heritage-grid-header heritage-single-grid text-center font-bold">
                        <span className="text-left">ITEM</span>
                        <span className="text-[#D97706]">PRICE</span>
                      </div>

                      <div className="divide-y divide-black/5 bg-white rounded-2xl border border-black/10 shadow-xs p-2">
                        {PAGE06_SALAD_ITEMS.map((dish) => {
                          const singleQty = getDishQty(dish.id);

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
                                    <button type="button" onClick={() => handleAddToCart({ id: dish.id, name: dish.name, price: dish.fullPrice, category: dish.category }, `₹${dish.fullPrice}`)} className="text-amber-700 hover:scale-110"><Plus size={11} /></button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleAddToCart({ id: dish.id, name: dish.name, price: dish.fullPrice, category: dish.category }, `₹${dish.fullPrice}`)}
                                    className="heritage-portion-btn-full cursor-pointer !bg-[#D97706]"
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
                  </div>

                  {/* Right Column: Golden Amber Hero Panel (Sticky on Desktop) */}
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
                   REMAINING CHAPTERS: CLEAN CODED RESTAURANT TABLES (NO BANNER)
                   ───────────────────────────────────────────────────────────── */
                <div className="space-y-6">
                  {/* Authentic Chapter Header */}
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
                    {/* Left Column: Hero Food Showcase (Sticky on Desktop) */}
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

                    {/* Right Column: Categories & Dishes */}
                    <div className="lg:col-span-7 space-y-6">
                      {chapter.categories.map((subcat, idx) => {
                        const isRolls = subcat.name.toLowerCase().includes('roll');
                        const hasAnyHalfFull = subcat.items.some((i) => Boolean(i.halfPrice && i.fullPrice));

                        return (
                          <div key={subcat.id} className="space-y-3">
                            {idx > 0 && <div className="heritage-divider-raster" />}

                            {/* Subcategory Header */}
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
                                                <span className="break-words leading-tight">{item.name}</span>
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
                                                <span className="break-words leading-tight">{item.name}</span>
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
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};
