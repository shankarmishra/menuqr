// MENUQR Design Engine — Authentic Heritage Artboard Composition
// Bespoke 1:1 Digital Artboard for Indian Tandoor, Chaap & Royal Dhaba Menus
// Clean, organized, luxury restaurant styling mirroring Art Board 3.pdf

import React, { useMemo, useState } from 'react';
import clsx from 'clsx';
import type { CompositionProps } from '../types';
import type { MenuItem } from '../../templates/types';
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
    heroSubtitle: 'Paneer Butter Masala, Shahi Paneer & Dal Makhani',
    themeClass: 'chapter-theme-gravies',
    subcategories: [
      'paneer ka khazana', 
      'paneer khazana',
      'paneer gravies',
      'veg specialities', 
      'dal specialities', 
      'desi junction', 
      'rice & biryani', 
      'biryani',
      'raita & papad'
    ],
    announcement: {
      text: 'Slow-simmered 24-hour Dal Makhani & rich cashew-makhani gravies prepared in pure desi butter',
      badge: 'Royal Dhaba',
      icon: 'flame',
    },
  },
  {
    id: 'chapter-soya-breads',
    title: 'MTJ Pure Soya Gravies & Tandoori Breads',
    shortTitle: 'Soya & Breads',
    banner: '/uploads/mannat/textures/banner_soya_gravies.webp',
    heroImage: '/uploads/mannat/assets/hero_biryani_gravies.webp',
    heroTitle: 'Pure Soya Gravies & Tandoori Breads',
    heroSubtitle: 'Rich Desi Gravies & Clay-Oven Baked Rotis & Naans',
    themeClass: 'chapter-theme-gravies',
    subcategories: ['mtj pure soya gravies', 'pure soya gravies', 'soya gravies', 'tandoori breads', 'breads', 'rotis'],
    announcement: {
      text: 'Fresh hand-stretched rotis & naans baked to perfection in traditional charcoal tandoor',
      badge: 'Clay Oven Fresh',
      icon: 'flame',
    },
  },
  {
    id: 'chapter-thalis-street',
    title: 'MTJ Thalis & Street Food Specials',
    shortTitle: 'Thalis & Combos',
    banner: '/uploads/mannat/textures/banner_thalis_combos.webp',
    heroImage: '/uploads/mannat/assets/hero_royal_thali.webp',
    heroTitle: 'MTJ Deluxe Thalis & Street Food',
    heroSubtitle: 'Complete Wholesome Thalis, Pav Bhaji & Chole Kulche',
    themeClass: 'chapter-theme-thalis',
    subcategories: ['mtj thalis', 'thalis', 'mtja meal combos', 'meal combos', 'combos', 'mtj street specials', 'street specials'],
    announcement: {
      text: 'Wholesome Deluxe & Special Thalis served with Dal Makhani, Shahi Paneer, Rice, Roti & Sweet',
      badge: 'Wholesome Thali',
      icon: 'sparkles',
    },
  },
  {
    id: 'chapter-momo-junction',
    title: 'MTJ Momo Junction',
    shortTitle: 'Momo Junction',
    banner: '/uploads/mannat/textures/banner_momos.webp',
    heroImage: '/uploads/mannat/assets/hero_momos_platter.webp',
    heroTitle: 'Himalayan Momo Junction',
    heroSubtitle: 'Steamed, Kurkure, Afghani & Tandoori Momos',
    themeClass: 'chapter-theme-momos',
    subcategories: ['mtj momo junction', 'momo junction', 'momos'],
    announcement: {
      text: 'Choose your preparation style across Veg (6 Pcs), Paneer (6 Pcs) or Corn N Cheese (6 Pcs)',
      badge: '3-Tier Matrix',
      icon: 'sparkles',
    },
    isMomo: true,
  },
  {
    id: 'chapter-chinese-wok',
    title: 'MTJ Indo-Chinese Wok',
    shortTitle: 'Chinese Wok',
    banner: '/uploads/mannat/textures/banner_chinese_wok.webp',
    heroImage: '/uploads/mannat/assets/hero_chinese_wok.webp',
    heroTitle: 'Indo-Chinese Wok Master Recipes',
    heroSubtitle: 'Hakka Noodles Bowls, Manchurian & Chilly Paneer Gravy',
    themeClass: 'chapter-theme-chinese',
    subcategories: ['noodles bowls', 'noodle bowls', 'mtj chinese bowls', 'chinese bowls', 'appetizers', 'wok gravies', 'fried rice', 'chinese'],
    announcement: {
      text: 'High-flame wok tossed Hakka noodles, crispy Manchurian & sizzling chilly gravies',
      badge: 'Indo-Chinese',
      icon: 'flame',
    },
  },
  {
    id: 'chapter-cafe-quick-bites',
    title: 'MTJ Café, Fries & Mexican Bites',
    shortTitle: 'Café & Quick Bites',
    banner: '/uploads/mannat/textures/banner_lebanese_fries.webp',
    heroImage: '/uploads/mannat/assets/hero_lebanese_fries.webp',
    heroSubImage: '/uploads/mannat/assets/hero_tacos_pasta.webp',
    heroTitle: 'Café Delights, Fries & Mexican Tacos',
    heroSubtitle: 'Peri-Peri Fries, Cheesy Nachos, Falafel & Crispy Tacos',
    themeClass: 'chapter-theme-cafe',
    subcategories: ['cheesy bites', 'fries & nachos', 'lebanese delights', 'mexican fiesta', 'fries', 'nachos', 'lebanese', 'mexican', 'tacos'],
    announcement: {
      text: 'Loaded Peri-Peri fries, Cheesy Nachos, Hummus Falafel & Crispy Mexican Tacos',
      badge: 'Snack Station',
      icon: 'sparkles',
    },
  },
  {
    id: 'chapter-pizzas-burgers',
    title: 'Stone Baked Pizzas, Burgers & Pastas',
    shortTitle: 'Pizzas & Burgers',
    banner: '/uploads/mannat/textures/banner_pizza_burger.webp',
    heroImage: '/uploads/mannat/assets/hero_pizza_burger.webp',
    heroTitle: 'Stone Baked Pizzas & Brioche Burgers',
    heroSubtitle: '10-Inch Thin Crust Pizzas, Sesame Burgers & Pasta',
    themeClass: 'chapter-theme-pizzas',
    subcategories: ['pasta selections', 'pasta', 'stone baked pizzas', 'pizzas', 'burgers & sandwiches', 'burgers', 'garlic breads'],
    announcement: {
      text: '10-inch hand-stretched thin crust stone-baked pizzas topped with 100% mozzarella',
      badge: 'Stone Oven',
      icon: 'sparkles',
    },
  },
  {
    id: 'chapter-brews-shakes',
    title: 'Brews, Thick Shakes & Coolers',
    shortTitle: 'Brews & Shakes',
    banner: '/uploads/mannat/textures/banner_thick_shakes.webp',
    heroImage: '/uploads/mannat/assets/hero_coffee_shakes.webp',
    heroTitle: 'Artisan Brews, Boba & Thick Shakes',
    heroSubtitle: 'Chilled Iced Latte, Oreo Thick Shakes & Fresh Mojito',
    themeClass: 'chapter-theme-brews',
    subcategories: ['hot coffee', 'cold brew', 'ice tea', 'thick shakes', 'boba shakes & coffee', 'boba', 'coolers', 'beverages', 'shakes'],
    announcement: {
      text: 'Flavour Syrups: Hazelnut • Caramel • Irish • Vanilla • Chocolate (+₹39)',
      badge: 'Barista Specials',
      icon: 'coffee',
    },
  },
  {
    id: 'chapter-desserts',
    title: 'MTJ Desserts & Sweet Indulgence',
    shortTitle: 'Desserts',
    banner: '/uploads/mannat/textures/banner_desserts.webp',
    heroImage: '/uploads/mannat/assets/hero_desserts_brownie.webp',
    heroTitle: 'Sweet Treats & Sizzling Desserts',
    heroSubtitle: 'Hot Sizzling Chocolate Brownie & Golden Gulab Jamun',
    themeClass: 'chapter-theme-desserts',
    subcategories: ['desserts', 'dessert', 'sweets', 'sweet endings', 'sweet'],
    announcement: {
      text: 'Hot Sizzling Brownie with Vanilla Ice Cream & Golden Gulab Jamun',
      badge: 'Sweet Finish',
      icon: 'sparkles',
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Authentic Dish Photo Matcher (40 Clean Hand-Cropped PDF Food Photos)
// ─────────────────────────────────────────────────────────────────────────────
const getDishImage = (item: MenuItem, catName: string): string => {
  if (item.image && !item.image.includes('placeholder')) {
    return item.image;
  }
  const name = (item.name || '').toLowerCase();
  const cat = catName.toLowerCase();

  // 1. Tandoori Chaap Specialities
  if (name.includes('malai chaap')) return '/uploads/mannat/assets/dish_malai_chaap.webp';
  if (name.includes('afghani chaap')) return '/uploads/mannat/assets/dish_afghani_chaap.webp';
  if (name.includes('chaap roll')) return '/uploads/mannat/assets/dish_chaap_roll.webp';
  if (name.includes('paneer roll')) return '/uploads/mannat/assets/dish_paneer_roll.webp';
  if (name.includes('roll')) return '/uploads/mannat/assets/dish_chaap_roll.webp';
  if (name.includes('chaap gravy') || name.includes('soya gravy') || (cat.includes('soya grav') && name.includes('chaap'))) {
    return '/uploads/mannat/assets/dish_chaap_gravy.webp';
  }
  if (name.includes('chaap') || cat.includes('chaap')) return '/uploads/mannat/assets/dish_tandoori_chaap.webp';

  // 2. Paneer Feast & Gravies
  if (name.includes('malai paneer tikka')) return '/uploads/mannat/assets/dish_malai_paneer_tikka.webp';
  if (name.includes('paneer tikka')) return '/uploads/mannat/assets/dish_paneer_tikka.webp';
  if (name.includes('paneer butter') || name.includes('paneer makhani')) return '/uploads/mannat/assets/dish_paneer_butter_masala.webp';
  if (name.includes('shahi paneer') || name.includes('lababdar') || name.includes('kadhai paneer')) return '/uploads/mannat/assets/dish_shahi_paneer.webp';
  if (name.includes('chilli paneer') || name.includes('chili paneer')) return '/uploads/mannat/assets/dish_chili_paneer.webp';

  // 3. Kebabs, Dahi Ke Sholay & Crunch
  if (name.includes('sholay') || name.includes('dahi')) return '/uploads/mannat/assets/dish_dahi_ke_sholay.webp';
  if (name.includes('seekh') || name.includes('kebab') || name.includes('hara bhara')) return '/uploads/mannat/assets/dish_veg_seekh_kebab.webp';
  if (name.includes('crunch') || name.includes('popcorn') || name.includes('satay') || cat.includes('crunch')) return '/uploads/mannat/assets/dish_crunchy_soya.webp';
  if (name.includes('salad') || cat.includes('salad')) return '/uploads/mannat/assets/dish_greek_salad.webp';

  // 4. Dal, Rice & Breads
  if (name.includes('dal') || name.includes('makhani')) return '/uploads/mannat/assets/dish_dal_makhani.webp';
  if (name.includes('biryani') || name.includes('pulao') || name.includes('rice')) return '/uploads/mannat/assets/dish_veg_biryani.webp';
  if (name.includes('naan')) return '/uploads/mannat/assets/dish_garlic_naan.webp';
  if (name.includes('roti') || name.includes('kulcha') || name.includes('paratha') || cat.includes('bread')) {
    return '/uploads/mannat/assets/dish_butter_roti.webp';
  }

  // 5. Thalis & Street Food
  if (name.includes('deluxe thali') || name.includes('dawat thali')) return '/uploads/mannat/assets/dish_deluxe_thali.webp';
  if (name.includes('special thali') || name.includes('thali') || name.includes('combo')) return '/uploads/mannat/assets/dish_special_thali.webp';
  if (name.includes('kulche') || name.includes('chole') || name.includes('bhature')) return '/uploads/mannat/assets/dish_chole_kulche.webp';
  if (name.includes('pav') || name.includes('bhaji')) return '/uploads/mannat/assets/dish_pav_bhaji.webp';

  // 6. Momos
  if (name.includes('momo') || cat.includes('momo')) {
    return name.includes('fried') || name.includes('kurkure')
      ? '/uploads/mannat/assets/dish_fried_momos.webp'
      : '/uploads/mannat/assets/dish_steamed_momos.webp';
  }

  // 7. Chinese & Wok
  if (name.includes('noodle') || name.includes('chowmein')) return '/uploads/mannat/assets/dish_hakka_noodles.webp';
  if (name.includes('manchurian') || name.includes('fried rice') || cat.includes('chinese') || cat.includes('wok')) {
    return '/uploads/mannat/assets/dish_veg_manchurian.webp';
  }

  // 8. Café, Lebanese & Mexican
  if (name.includes('falafel') || name.includes('shawarma') || cat.includes('lebanese')) return '/uploads/mannat/assets/dish_falafel_wrap.webp';
  if (name.includes('taco') || name.includes('quesadilla') || cat.includes('mexican')) return '/uploads/mannat/assets/dish_crispy_tacos.webp';
  if (name.includes('nacho') || cat.includes('nacho')) return '/uploads/mannat/assets/dish_cheese_nachos.webp';
  if (name.includes('fries') || name.includes('finger') || cat.includes('fries')) return '/uploads/mannat/assets/dish_peri_peri_fries.webp';

  // 9. Pizzas, Burgers, Pastas & Garlic Bread
  if (name.includes('pizza') || cat.includes('pizza')) return '/uploads/mannat/assets/dish_margherita_pizza.webp';
  if (name.includes('pasta') || cat.includes('pasta')) return '/uploads/mannat/assets/dish_creamy_pasta.webp';
  if (name.includes('burger') || name.includes('sandwich') || cat.includes('burger')) return '/uploads/mannat/assets/dish_brioche_burger.webp';
  if (name.includes('garlic bread') || cat.includes('garlic')) return '/uploads/mannat/assets/dish_garlic_bread.webp';

  // 10. Beverages, Shakes & Coolers
  if (name.includes('cold brew') || name.includes('iced latte') || name.includes('latte')) return '/uploads/mannat/assets/dish_iced_latte.webp';
  if (name.includes('cappuccino') || name.includes('coffee') || cat.includes('coffee')) return '/uploads/mannat/assets/dish_cappuccino.webp';
  if (name.includes('shake') || name.includes('boba') || cat.includes('shake')) return '/uploads/mannat/assets/dish_oreo_shake.webp';
  if (name.includes('mojito') || name.includes('cooler') || cat.includes('cooler')) return '/uploads/mannat/assets/dish_mint_mojito.webp';

  // 11. Desserts
  if (name.includes('brownie') || name.includes('dessert') || cat.includes('dessert') || name.includes('jamun') || name.includes('ice cream')) {
    return '/uploads/mannat/assets/dish_fudge_brownie.webp';
  }

  // Category based smart fallback
  if (cat.includes('bread') || cat.includes('roti')) return '/uploads/mannat/assets/dish_butter_roti.webp';
  if (cat.includes('rice') || cat.includes('biryani')) return '/uploads/mannat/assets/dish_veg_biryani.webp';
  if (cat.includes('dal')) return '/uploads/mannat/assets/dish_dal_makhani.webp';
  if (cat.includes('paneer')) return '/uploads/mannat/assets/dish_shahi_paneer.webp';
  if (cat.includes('shake')) return '/uploads/mannat/assets/dish_oreo_shake.webp';
  if (cat.includes('coffee')) return '/uploads/mannat/assets/dish_cappuccino.webp';

  return '/uploads/mannat/assets/dish_tandoori_chaap.webp';
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
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
      className="heritage-canvas relative z-10 space-y-8 max-w-4xl mx-auto w-full transition-colors duration-300 p-2 sm:p-5"
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
          STICKY 12-CHAPTER NAVIGATION PILLS (Eliminates 40 micro-pills clutter!)
          ═══════════════════════════════════════════════════════════════════════ */}
      <nav
        aria-label="Menu Chapters"
        className="sticky top-14 z-30 bg-[#FFFDF9]/95 backdrop-blur-md py-2.5 px-3 rounded-2xl shadow-md border-2 border-[#FAB700]/60 overflow-x-auto scrollbar-none flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() => {
            setSelectedChapterId('all');
            if (setParentActiveCategory) setParentActiveCategory('all');
          }}
          className={clsx(
            'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer',
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
                'shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 shadow-xs active:scale-95 cursor-pointer',
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
          CHAPTERS & DISHES (1 Header Banner per Chapter!)
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-12">
        {visibleChapters.map((chapter) => {
          return (
            <section
              key={chapter.id}
              id={chapter.id}
              data-chapter-id={chapter.id}
              className={clsx(
                "p-4 sm:p-6 space-y-6 rounded-3xl transition-all duration-300",
                chapter.themeClass || 'chapter-theme-tandoori'
              )}
            >
              {/* ─────────────────────────────────────────────────────────────
                  SINGLE CHAPTER HEADER BANNER (Authentic PDF Artwork Plate)
                  ───────────────────────────────────────────────────────────── */}
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
                {/* Left Column: Authentic Grand Food Photography Showcase (Pages 4–16) */}
                <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
                  <div className="heritage-hero-showcase">
                    <picture>
                      <source srcSet={chapter.heroImage} type="image/webp" />
                      <img
                        src={chapter.heroImage.replace('.webp', '.png')}
                        alt={chapter.heroTitle}
                        className="w-full h-56 sm:h-64 lg:h-72 object-cover"
                        loading="lazy"
                      />
                    </picture>
                    <div className="bg-[#181E19] text-[#FAB700] p-3.5 border-t-2 border-[#FAB700]/40">
                      <div className="font-serif font-bold text-sm sm:text-base text-white tracking-wide">
                        {chapter.heroTitle}
                      </div>
                      <div className="text-[11px] sm:text-xs text-[#FAB700]/90 font-sans mt-0.5">
                        {chapter.heroSubtitle}
                      </div>
                    </div>
                  </div>

                  {/* Secondary Hero Photo Plate (when present in source) */}
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
                    <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#FAB700] text-amber-950 text-xs font-semibold flex flex-col gap-2 shadow-xs">
                      <div className="flex items-center gap-2">
                        {chapter.announcement.icon === 'coffee' && <Coffee size={16} className="text-amber-800 shrink-0" />}
                        {chapter.announcement.icon === 'flame' && <Flame size={16} className="text-[#CE182C] shrink-0" />}
                        {chapter.announcement.icon === 'sparkles' && <Sparkles size={16} className="text-[#FAB700] shrink-0" />}
                        <span className="leading-snug">{chapter.announcement.text}</span>
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
                  {chapter.categories.map((subcat) => {
                    const isMomoSection = chapter.isMomo || subcat.name.toLowerCase().includes('momo');
                    const isRolls = subcat.name.toLowerCase().includes('roll');
                    const hasAnyHalfFull = subcat.items.some((i) => Boolean(i.halfPrice && i.fullPrice));

                    return (
                      <div key={subcat.id} className="space-y-3">
                        {/* Subcategory Ribbon Header */}
                        <div className="heritage-subcat-header">
                          <span className="heritage-subcat-badge">
                            <Utensils size={13} className="text-[#FAB700]" />
                            <span>{subcat.name}</span>
                            <span className="text-[11px] opacity-80 font-mono">({subcat.items.length})</span>
                          </span>
                          <span className="heritage-subcat-line" />
                        </div>

                        {/* Momo Table or Editorial Container */}
                        {isMomoSection ? (
                          <div className="space-y-4">
                            <div className="overflow-x-auto rounded-2xl border-2 border-[#FAB700] shadow-sm bg-white">
                              <table className="heritage-matrix-table w-full">
                                <thead>
                                  <tr 
                                    className="text-white text-xs font-black uppercase tracking-wider"
                                    style={{ background: '#1F2923' }}
                                  >
                                    <th className="py-2.5 px-2.5 sm:px-4 text-left">Preparation</th>
                                    <th className="py-2.5 px-2 text-center bg-emerald-950/90 text-emerald-300 border-l border-white/10 w-24 sm:w-28">
                                      Veg (6 Pcs)
                                    </th>
                                    <th className="py-2.5 px-2 text-center bg-amber-950/90 text-amber-300 border-l border-white/10 w-24 sm:w-28">
                                      Paneer (6 Pcs)
                                    </th>
                                    <th className="py-2.5 px-2 text-center bg-orange-950/90 text-orange-300 border-l border-white/10 w-24 sm:w-32">
                                      Corn N Cheese
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-black/5 text-xs">
                                  {subcat.items.map((item, idx) => {
                                    const vegVar = item.variants?.find((v) => v.name.toLowerCase().includes('veg'));
                                    const panVar = item.variants?.find((v) => v.name.toLowerCase().includes('paneer'));
                                    const chzVar = item.variants?.find((v) => v.name.toLowerCase().includes('corn') || v.name.toLowerCase().includes('cheese'));

                                    const vegPrice = vegVar ? vegVar.price : (item.halfPrice || item.price || 149);
                                    const panPrice = panVar ? panVar.price : (typeof vegPrice === 'number' ? vegPrice + 20 : 169);
                                    const chzPrice = chzVar ? chzVar.price : (typeof vegPrice === 'number' ? vegPrice + 40 : 189);

                                    const thumb = getDishImage(item, subcat.name);

                                    return (
                                      <tr 
                                        key={item.id}
                                        className={idx % 2 === 0 ? 'bg-white hover:bg-amber-50/40' : 'bg-[#FFFDF9] hover:bg-amber-50/40'}
                                      >
                                        <td className="py-2 px-2.5 sm:px-4 font-bold text-[#1F2923]">
                                          <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#FAB700] overflow-hidden shrink-0 bg-white shadow-xs">
                                              <img
                                                src={thumb}
                                                alt={item.name}
                                                className="w-full h-full object-cover scale-110"
                                                loading="lazy"
                                              />
                                            </div>
                                            <div className="min-w-0">
                                              <div className="flex items-center gap-1 font-serif text-xs sm:text-sm text-[#181E19]">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                                                <span className="truncate">{item.name}</span>
                                              </div>
                                            </div>
                                          </div>
                                        </td>

                                        {/* Veg Column */}
                                        <td className="py-2 px-1.5 sm:px-2 text-center border-l border-black/5">
                                          <button
                                            type="button"
                                            onClick={() => onAddToCart && onAddToCart(item, `₹${vegPrice}`, 'Veg (6 Pcs)')}
                                            className="heritage-matrix-btn heritage-matrix-btn-veg cursor-pointer text-[11px] sm:text-xs py-1 px-2 w-full justify-center"
                                            title={`Add Veg ${item.name}`}
                                          >
                                            <span>₹{vegPrice}</span>
                                            {isPremium && <Plus size={10} />}
                                          </button>
                                        </td>

                                        {/* Paneer Column */}
                                        <td className="py-2 px-1.5 sm:px-2 text-center border-l border-black/5">
                                          <button
                                            type="button"
                                            onClick={() => onAddToCart && onAddToCart(item, `₹${panPrice}`, 'Paneer (6 Pcs)')}
                                            className="heritage-matrix-btn heritage-matrix-btn-paneer cursor-pointer text-[11px] sm:text-xs py-1 px-2 w-full justify-center"
                                            title={`Add Paneer ${item.name}`}
                                          >
                                            <span>₹{panPrice}</span>
                                            {isPremium && <Plus size={10} />}
                                          </button>
                                        </td>

                                        {/* Corn N Cheese Column */}
                                        <td className="py-2 px-1.5 sm:px-2 text-center border-l border-black/5">
                                          <button
                                            type="button"
                                            onClick={() => onAddToCart && onAddToCart(item, `₹${chzPrice}`, 'Corn N Cheese (6 Pcs)')}
                                            className="heritage-matrix-btn heritage-matrix-btn-cheese cursor-pointer text-[11px] sm:text-xs py-1 px-2 w-full justify-center"
                                            title={`Add Corn N Cheese ${item.name}`}
                                          >
                                            <span>₹{chzPrice}</span>
                                            {isPremium && <Plus size={10} />}
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>

                            {/* Momo Platter Showcase Banner (Mirroring PDF Page 10 Bottom Plate) */}
                            <div className="rounded-2xl overflow-hidden border-2 border-[#FAB700] shadow-md bg-white">
                              <img
                                src="/uploads/mannat/assets/dish_steamed_momos.webp"
                                alt="Freshly Steamed & Pan-Fried Momos with Spicy Dip"
                                className="w-full h-44 sm:h-56 object-cover"
                                loading="lazy"
                              />
                              <div className="bg-[#181E19] text-[#FAB700] px-4 py-2 text-xs font-serif flex items-center justify-between">
                                <span className="font-bold tracking-wide">Authentic Himalayan Momos • Served with Fiery Chutney & Dip</span>
                                <span className="text-[10px] bg-[#CE182C] text-white font-mono px-2 py-0.5 rounded font-bold">FRESHLY STEAMED</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Clean Editorial Typographic Listing */
                          <div className="heritage-menu-container">
                            {/* Table Header */}
                            <div className="heritage-table-header">
                              <span>ITEM</span>
                              {hasAnyHalfFull ? (
                                <div className="flex items-center gap-3 sm:gap-6 pr-1">
                                  <span className="w-16 sm:w-20 text-center">{isRolls ? '2 PCS' : 'HALF'}</span>
                                  <span className="w-16 sm:w-20 text-center">{isRolls ? '4 PCS' : 'FULL'}</span>
                                </div>
                              ) : (
                                <span className="pr-3">PRICE</span>
                              )}
                            </div>

                            {/* Dish Rows */}
                            <div className="divide-y divide-black/5">
                              {subcat.items.map((item) => {
                                const pricing = parseItemPricing(item);
                                const hasHalfFull = Boolean(item.halfPrice && item.fullPrice);

                                return (
                                  <div key={item.id} className="heritage-dish-row">
                                    {/* Left: Indicator & Dish Name */}
                                    <div className="flex items-baseline gap-2 min-w-0 flex-1 mr-2">
                                      <DietIndicator type={item.dietType} compact className="shrink-0 self-center" />
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="font-serif font-bold text-xs sm:text-sm text-[#181E19] leading-tight">
                                            {item.name}
                                          </span>
                                          {item.isBestseller && (
                                            <span className="shrink-0 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#CE182C] text-white">
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
                                      <div className="flex items-center gap-2 shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => onAddToCart && onAddToCart(item, `₹${item.halfPrice}`, isRolls ? '2 Pcs' : 'Half')}
                                          className="heritage-portion-btn-half px-2 py-1 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer active:scale-95 w-16 sm:w-20"
                                          title={`Add ${isRolls ? '2 Pcs' : 'Half'} ${item.name}`}
                                        >
                                          <span className="font-mono font-bold">₹{item.halfPrice}</span>
                                          {isPremium && <Plus size={10} className="shrink-0" />}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => onAddToCart && onAddToCart(item, `₹${item.fullPrice}`, isRolls ? '4 Pcs' : 'Full')}
                                          className="heritage-portion-btn-full px-2 py-1 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer active:scale-95 w-16 sm:w-20"
                                          title={`Add ${isRolls ? '4 Pcs' : 'Full'} ${item.name}`}
                                        >
                                          <span className="font-mono font-bold">₹{item.fullPrice}</span>
                                          {isPremium && <Plus size={10} />}
                                        </button>
                                      </div>
                                    ) : pricing.hasVariants ? (
                                      <div className="flex flex-wrap items-center justify-end gap-1.5 shrink-0">
                                        {pricing.variants.map((v) => (
                                          <button
                                            key={v.name}
                                            type="button"
                                            onClick={() => onAddToCart && onAddToCart(item, `₹${v.price}`, v.name)}
                                            className="heritage-portion-btn-half px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1 cursor-pointer active:scale-95"
                                            title={`Add ${v.name} ${item.name}`}
                                          >
                                            <span className="text-[10px] text-[#CE182C] font-semibold">{v.name}:</span>
                                            <span className="font-mono font-bold">₹{v.price}</span>
                                            {isPremium && <Plus size={10} />}
                                          </button>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2 shrink-0">
                                        <span className="font-mono font-black text-xs sm:text-sm text-[#CE182C]">
                                          ₹{item.price}
                                        </span>
                                        {isPremium && (
                                          <button
                                            type="button"
                                            onClick={() => onAddToCart && onAddToCart(item, `₹${item.price}`)}
                                            className="heritage-portion-btn-full px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 cursor-pointer active:scale-95"
                                            title={`Add ${item.name}`}
                                          >
                                            <span>ADD</span>
                                            <Plus size={10} />
                                          </button>
                                        )}
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
          <section className="p-4 sm:p-6 space-y-6 rounded-3xl bg-white/95 border-2 border-[#FAB700]/50 shadow-md">
            <div className="heritage-subcat-header">
              <span className="heritage-subcat-badge">
                <Utensils size={13} className="text-[#FAB700]" />
                <span>Speciality Dishes & Beverages</span>
              </span>
              <span className="heritage-subcat-line" />
            </div>

            <div className="heritage-menu-container">
              <div className="heritage-table-header">
                <span>ITEM</span>
                <span className="pr-3">PRICE</span>
              </div>
              <div className="divide-y divide-black/5">
                {unassignedCategories.flatMap((c) => c.items).map((item) => (
                  <div key={item.id} className="heritage-dish-row">
                    <div className="flex items-baseline gap-2 min-w-0 flex-1 mr-2">
                      <DietIndicator type={item.dietType} compact className="shrink-0 self-center" />
                      <span className="font-serif font-bold text-xs sm:text-sm text-[#181E19] truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-black text-xs sm:text-sm text-[#CE182C]">₹{item.price}</span>
                      {isPremium && (
                        <button
                          type="button"
                          onClick={() => onAddToCart && onAddToCart(item, `₹${item.price}`)}
                          className="heritage-portion-btn-full px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 cursor-pointer active:scale-95"
                          title={`Add ${item.name}`}
                        >
                          <span>ADD</span>
                          <Plus size={10} />
                        </button>
                      )}
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
