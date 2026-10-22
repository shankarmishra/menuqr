// MENUQR Design Engine — Authentic Heritage Artboard Composition
// Bespoke 1:1 Digital Artboard for Indian Tandoor, Chaap & Royal Dhaba Menus
// Faithfully matches Art Board 3.pdf with interactive 3-tier Momos, Half/Full portions, and sizzlers

import React from 'react';
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
  Sparkles
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// 1. ASSET LOOKUP TABLES (Matched 1:1 to Art Board 3.pdf extracted assets)
// ─────────────────────────────────────────────────────────────────────────────

// Section Chapter Banners (Extracted directly from PDF pages)
const getCategoryBanner = (catName: string): string => {
  const lower = catName.toLowerCase();
  if (lower.includes('momo')) return '/uploads/mannat/textures/banner_momos.webp';
  if (lower.includes('pizza') || lower.includes('burger') || lower.includes('sandwich')) return '/uploads/mannat/textures/banner_pizza_burger.webp';
  if (lower.includes('coffee') || lower.includes('brew') || lower.includes('tea') || lower.includes('garlic bread')) return '/uploads/mannat/textures/banner_coffee_garlicbread.webp';
  if (lower.includes('shake') || lower.includes('boba')) return '/uploads/mannat/textures/banner_thick_shakes.webp';
  if (lower.includes('dessert') || lower.includes('cooler') || lower.includes('sweet')) return '/uploads/mannat/textures/banner_desserts.webp';
  if (lower.includes('labanese') || lower.includes('lebanese') || lower.includes('fries') || lower.includes('nachos')) return '/uploads/mannat/textures/banner_lebanese_fries.webp';
  if (lower.includes('chinese') || lower.includes('noodle') || lower.includes('wok') || lower.includes('fried rice') || lower.includes('manchurian')) return '/uploads/mannat/textures/banner_chinese_wok.webp';
  if (lower.includes('thali') || lower.includes('combo')) return '/uploads/mannat/textures/banner_thalis_combos.webp';
  if (lower.includes('street') || lower.includes('kulche') || lower.includes('chole') || lower.includes('pav')) return '/uploads/mannat/textures/banner_street_specials.webp';
  if (lower.includes('soya grav') || lower.includes('gravy')) return '/uploads/mannat/textures/banner_soya_gravies.webp';
  if (lower.includes('desi') || lower.includes('rice') || lower.includes('biryani') || lower.includes('pulao')) return '/uploads/mannat/textures/banner_desi_junction.webp';
  if (lower.includes('khazana') || lower.includes('dal') || lower.includes('makhani')) return '/uploads/mannat/textures/banner_paneer_khazana.webp';
  if (lower.includes('platter') || lower.includes('kebab') || lower.includes('starter')) return '/uploads/mannat/textures/banner_signature_platters.webp';
  if (lower.includes('paneer feast') || lower.includes('roll')) return '/uploads/mannat/textures/banner_paneer_feast.webp';
  return '/uploads/mannat/textures/banner_chaap.webp';
};

// Section Hero Sizzler Plates & Hindi Subtitles
interface SectionHeroInfo {
  hero: string;
  hindiTitle: string;
  subtitle: string;
}

const getSectionHeroInfo = (catName: string): SectionHeroInfo | null => {
  const lower = catName.toLowerCase();
  if (lower.includes('momo')) {
    return {
      hero: '/uploads/mannat/assets/hero_momos_platter.webp',
      hindiTitle: 'मोमोज़ जंक्शन',
      subtitle: 'Steamed • Fried • Kurkure • Tandoori • Afghani Malai (6 Pcs)',
    };
  }
  if (lower.includes('roll')) {
    return {
      hero: '/uploads/mannat/assets/hero_chaap_rolls.webp',
      hindiTitle: 'गरमा-गरम रुमाली रोल्स',
      subtitle: 'Fresh Rumali Roti Rolls with Secret House Chutney & Gravy',
    };
  }
  if (lower.includes('chaap') || lower.includes('soya')) {
    return {
      hero: '/uploads/mannat/assets/hero_chaap_sizzler.webp',
      hindiTitle: 'चांप का असली स्वाद',
      subtitle: '100% Pure Soya • Charcoal Fired Tandoori Specialities',
    };
  }
  if (lower.includes('paneer') || lower.includes('khazana')) {
    return {
      hero: '/uploads/mannat/assets/hero_paneer_curries_handi.webp',
      hindiTitle: 'शाही पनीर का खज़ाना',
      subtitle: 'Rich Handi Gravies • Fresh Cottage Cheese Delicacies',
    };
  }
  if (lower.includes('chinese') || lower.includes('wok') || lower.includes('noodle')) {
    return {
      hero: '/uploads/mannat/assets/hero_chinese_wok.webp',
      hindiTitle: 'चाइनीज़ वोक कॉर्नर',
      subtitle: 'Indo-Chinese Wok Tossed Noodles, Fried Rice & Manchurian',
    };
  }
  if (lower.includes('pizza') || lower.includes('burger')) {
    return {
      hero: '/uploads/mannat/assets/hero_pizza_burger.webp',
      hindiTitle: 'पिज़्ज़ा व बर्गर जंक्शन',
      subtitle: 'Artisan Hand-Stretched Crusts & Loaded Brioche Burgers',
    };
  }
  if (lower.includes('lebanese') || lower.includes('fries') || lower.includes('nacho')) {
    return {
      hero: '/uploads/mannat/assets/hero_lebanese_fries.webp',
      hindiTitle: 'लेबनीज़ व पेरी-पेरी फ्राइज़',
      subtitle: 'Authentic Falafel, Shawarma Wraps & Loaded Fries',
    };
  }
  if (lower.includes('thali') || lower.includes('combo')) {
    return {
      hero: '/uploads/mannat/assets/hero_royal_thali.webp',
      hindiTitle: 'शाही भोजन थाली',
      subtitle: 'Complete Royal North Indian Meal with Dal Makhani & Breads',
    };
  }
  if (lower.includes('street') || lower.includes('kulche') || lower.includes('pav')) {
    return {
      hero: '/uploads/mannat/assets/hero_street_specials.webp',
      hindiTitle: 'दिल्ली स्ट्रीट स्पेशल',
      subtitle: 'Crispy Dahi Sholay, Amritsari Chole Kulche & Pav Bhaji',
    };
  }
  if (lower.includes('desi') || lower.includes('biryani') || lower.includes('dal')) {
    return {
      hero: '/uploads/mannat/assets/hero_biryani_gravies.webp',
      hindiTitle: 'देसी जंक्शन व दम बिरयानी',
      subtitle: 'Aromatic Dum Biryanis, Slow Cooked Gravies & Dal Makhani',
    };
  }
  if (lower.includes('shake') || lower.includes('coffee') || lower.includes('beverage') || lower.includes('brew')) {
    return {
      hero: '/uploads/mannat/assets/hero_coffee_shakes.webp',
      hindiTitle: 'अरेबिका कॉफ़ी व थिक शेक्स',
      subtitle: 'Chilled Thick Milkshakes, Cold Brews & Refreshers',
    };
  }
  if (lower.includes('dessert') || lower.includes('sweet') || lower.includes('brownie')) {
    return {
      hero: '/uploads/mannat/assets/hero_desserts_brownie.webp',
      hindiTitle: 'स्वीट्स व सिज़लिंग ब्राउनी',
      subtitle: 'Sizzling Hot Brownie with Vanilla Ice Cream & Gulab Jamun',
    };
  }
  if (lower.includes('kebab') || lower.includes('starter') || lower.includes('platter')) {
    return {
      hero: '/uploads/mannat/assets/hero_veg_kebabs_platter.webp',
      hindiTitle: 'स्टार्टर्स व कबाब थाल',
      subtitle: 'Crispy Tandoori Bites & Freshly Grilled Kebabs',
    };
  }
  return null;
};

// Dish Individual Photo Lookup (Comprehensive 40+ cutouts from library)
const DISH_CUTOUT_MAP: Record<string, string> = {
  // Chaap
  'malai chaap': '/uploads/mannat/assets/dish_malai_chaap.webp',
  'tandoori chaap': '/uploads/mannat/assets/dish_tandoori_chaap.webp',
  'afghani chaap': '/uploads/mannat/assets/dish_afghani_chaap.webp',
  'chaap gravy': '/uploads/mannat/assets/dish_chaap_gravy.webp',
  'chaap roll': '/uploads/mannat/assets/dish_chaap_roll.webp',
  // Paneer
  'paneer tikka': '/uploads/mannat/assets/dish_paneer_tikka.webp',
  'malai paneer tikka': '/uploads/mannat/assets/dish_malai_paneer_tikka.webp',
  'paneer roll': '/uploads/mannat/assets/dish_paneer_roll.webp',
  'paneer butter masala': '/uploads/mannat/assets/dish_paneer_butter_masala.webp',
  'shahi paneer': '/uploads/mannat/assets/dish_shahi_paneer.webp',
  'kadai paneer': '/uploads/mannat/assets/dish_paneer_butter_masala.webp',
  'chilli paneer': '/uploads/mannat/assets/dish_chili_paneer.webp',
  // Dal & Mains
  'dal makhani': '/uploads/mannat/assets/dish_dal_makhani.webp',
  'veg biryani': '/uploads/mannat/assets/dish_veg_biryani.webp',
  'chicken biryani': '/uploads/mannat/assets/dish_veg_biryani.webp',
  'chole kulche': '/uploads/mannat/assets/dish_chole_kulche.webp',
  'pav bhaji': '/uploads/mannat/assets/dish_pav_bhaji.webp',
  'dahi ke sholay': '/uploads/mannat/assets/dish_dahi_ke_sholay.webp',
  'hara bhara kebab': '/uploads/mannat/assets/dish_veg_seekh_kebab.webp',
  'veg seekh kebab': '/uploads/mannat/assets/dish_veg_seekh_kebab.webp',
  // Momos
  'steamed momos': '/uploads/mannat/assets/dish_steamed_momos.webp',
  'fried momos': '/uploads/mannat/assets/dish_fried_momos.webp',
  'kurkure momos': '/uploads/mannat/assets/dish_fried_momos.webp',
  'tandoori momos': '/uploads/mannat/assets/dish_steamed_momos.webp',
  'afghani momos': '/uploads/mannat/assets/dish_steamed_momos.webp',
  'malai momos': '/uploads/mannat/assets/dish_steamed_momos.webp',
  // Fast Food & Continental
  'margherita pizza': '/uploads/mannat/assets/dish_margherita_pizza.webp',
  'pizza': '/uploads/mannat/assets/dish_margherita_pizza.webp',
  'brioche burger': '/uploads/mannat/assets/dish_brioche_burger.webp',
  'burger': '/uploads/mannat/assets/dish_brioche_burger.webp',
  'peri peri fries': '/uploads/mannat/assets/dish_peri_peri_fries.webp',
  'french fries': '/uploads/mannat/assets/dish_peri_peri_fries.webp',
  'cheese nachos': '/uploads/mannat/assets/dish_cheese_nachos.webp',
  'garlic bread': '/uploads/mannat/assets/dish_garlic_bread.webp',
  'creamy pasta': '/uploads/mannat/assets/dish_creamy_pasta.webp',
  'crispy tacos': '/uploads/mannat/assets/dish_crispy_tacos.webp',
  'falafel wrap': '/uploads/mannat/assets/dish_falafel_wrap.webp',
  // Chinese
  'hakka noodles': '/uploads/mannat/assets/dish_hakka_noodles.webp',
  'veg manchurian': '/uploads/mannat/assets/dish_veg_manchurian.webp',
  // Thalis
  'special thali': '/uploads/mannat/assets/dish_special_thali.webp',
  'deluxe thali': '/uploads/mannat/assets/dish_deluxe_thali.webp',
  // Drinks & Sweets
  'iced latte': '/uploads/mannat/assets/dish_iced_latte.webp',
  'cold coffee': '/uploads/mannat/assets/dish_iced_latte.webp',
  'cappuccino': '/uploads/mannat/assets/dish_cappuccino.webp',
  'fudge brownie': '/uploads/mannat/assets/dish_fudge_brownie.webp',
  'oreo shake': '/uploads/mannat/assets/dish_oreo_shake.webp',
  'mint mojito': '/uploads/mannat/assets/dish_mint_mojito.webp',
  'fresh lime soda': '/uploads/mannat/assets/dish_mint_mojito.webp',
  'virgin mojito': '/uploads/mannat/assets/dish_mint_mojito.webp',
  'mango lassi': '/uploads/mannat/assets/dish_oreo_shake.webp',
  'masala chai': '/uploads/mannat/assets/dish_cappuccino.webp',
};

const getDishImage = (item: MenuItem, catName: string): string => {
  if (item.image && !item.image.includes('placeholder')) {
    return item.image;
  }
  const nameLower = (item.name || '').toLowerCase();
  for (const [key, path] of Object.entries(DISH_CUTOUT_MAP)) {
    if (nameLower.includes(key)) {
      return path;
    }
  }
  // Fuzzy keyword fallbacks
  if (nameLower.includes('chaap')) return '/uploads/mannat/assets/dish_malai_chaap.webp';
  if (nameLower.includes('paneer')) return '/uploads/mannat/assets/dish_paneer_tikka.webp';
  if (nameLower.includes('momo')) return '/uploads/mannat/assets/dish_steamed_momos.webp';
  if (nameLower.includes('roll')) return '/uploads/mannat/assets/dish_chaap_roll.webp';
  if (nameLower.includes('dal')) return '/uploads/mannat/assets/dish_dal_makhani.webp';
  if (nameLower.includes('biryani') || nameLower.includes('rice')) return '/uploads/mannat/assets/dish_veg_biryani.webp';
  if (nameLower.includes('pizza')) return '/uploads/mannat/assets/dish_margherita_pizza.webp';
  if (nameLower.includes('burger')) return '/uploads/mannat/assets/dish_brioche_burger.webp';
  if (nameLower.includes('fries')) return '/uploads/mannat/assets/dish_peri_peri_fries.webp';
  if (nameLower.includes('noodle')) return '/uploads/mannat/assets/dish_hakka_noodles.webp';
  if (nameLower.includes('shake')) return '/uploads/mannat/assets/dish_oreo_shake.webp';
  if (nameLower.includes('coffee') || nameLower.includes('brew')) return '/uploads/mannat/assets/dish_iced_latte.webp';
  if (nameLower.includes('dessert') || nameLower.includes('sweet') || nameLower.includes('brownie')) return '/uploads/mannat/assets/dish_fudge_brownie.webp';
  if (nameLower.includes('thali')) return '/uploads/mannat/assets/dish_special_thali.webp';
  
  // Category default
  const catLower = catName.toLowerCase();
  if (catLower.includes('chaap')) return '/uploads/mannat/assets/dish_tandoori_chaap.webp';
  if (catLower.includes('momo')) return '/uploads/mannat/assets/dish_steamed_momos.webp';
  if (catLower.includes('paneer')) return '/uploads/mannat/assets/dish_paneer_butter_masala.webp';
  return '/uploads/mannat/assets/dish_malai_chaap.webp';
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

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

  return (
    <div
      className="heritage-canvas relative z-10 space-y-8 max-w-5xl mx-auto w-full transition-colors duration-300 p-2 sm:p-6"
      style={{
        color: colors.text,
        fontFamily: typography.bodyFont,
      }}
    >
      {/* ═══════════════════════════════════════════════════════════════════════
          MASTHEAD: AUTHENTIC PDF COVER ARTBOARD (Page 1)
          ═══════════════════════════════════════════════════════════════════════ */}
      <header className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-[#FAB700] bg-[#181E19]">
        <div className="heritage-corner heritage-corner-tl" />
        <div className="heritage-corner heritage-corner-tr" />
        <div className="heritage-corner heritage-corner-bl" />
        <div className="heritage-corner heritage-corner-br" />

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
        <div className="bg-[#181E19] text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs border-t-2 border-[#FAB700]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10B981]" />
            <span className="font-bold text-[#FAB700] uppercase tracking-wider text-[11px] sm:text-xs font-serif">
              चांप का असली स्वाद • 100% Pure Soya
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            {restaurant.phone && (
              <a
                href={`tel:${restaurant.phone}`}
                className="flex items-center gap-1.5 text-white/90 hover:text-[#FAB700] transition-colors"
              >
                <Phone size={13} className="text-[#FAB700]" />
                <span className="font-mono">{restaurant.phone}</span>
              </a>
            )}
            {restaurant.address && (
              <div className="hidden sm:flex items-center gap-1.5 text-white/80">
                <MapPin size={13} className="text-[#FAB700]" />
                <span>{restaurant.address}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════════
          SEARCH BAR (Royal Crimson & Gold Framing)
          ═══════════════════════════════════════════════════════════════════════ */}
      {searchBar && (
        <div className="rounded-2xl border-2 border-[#FAB700]/60 p-1.5 bg-[#FFFDF9] shadow-md">
          {searchBar}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          STICKY CATEGORY NAVIGATION PILLS
          ═══════════════════════════════════════════════════════════════════════ */}
      <nav
        aria-label="Menu Sections"
        className="sticky top-14 z-30 bg-[#FFFDF9]/95 backdrop-blur-md py-2.5 px-3 rounded-2xl shadow-lg border-2 border-[#FAB700]/70 overflow-x-auto scrollbar-none flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={clsx(
            'shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer',
            activeCategory === 'all'
              ? 'bg-gradient-to-r from-[#991B1B] to-[#CE182C] text-white border-2 border-[#FAB700] shadow-md scale-105'
              : 'bg-white text-[#1F2923] hover:bg-[#CE182C]/10 border border-[#CE182C]/20'
          )}
        >
          <span>All Items</span>
          <span className="ml-1 text-[10px] opacity-80 font-mono">
            ({rawCategories.reduce((acc, c) => acc + c.items.length, 0)})
          </span>
        </button>
        {rawCategories.map((cat) => {
          const isActive = activeCategory === cat.id || activeCategory === cat.name;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={clsx(
                'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer',
                isActive
                  ? 'bg-gradient-to-r from-[#991B1B] to-[#CE182C] text-white border-2 border-[#FAB700] shadow-md scale-105'
                  : 'bg-white text-[#1F2923] hover:bg-[#CE182C]/10 border border-[#CE182C]/20'
              )}
            >
              <span>{cat.name}</span>
              <span className="text-[10px] opacity-75 font-mono">({cat.items.length})</span>
            </button>
          );
        })}
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTIONS & DISHES (AUTHENTIC ARTBOARD SECTIONS)
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-12">
        {categories.map((cat) => {
          const chapterBanner = getCategoryBanner(cat.name);
          const heroInfo = getSectionHeroInfo(cat.name);
          const isMomoSection = cat.name.toLowerCase().includes('momo');

          return (
            <section
              key={cat.id}
              className="heritage-section-plate p-4 sm:p-7 space-y-6"
            >
              {/* Corner Filigrees */}
              <div className="heritage-corner heritage-corner-tl" />
              <div className="heritage-corner heritage-corner-tr" />
              <div className="heritage-corner heritage-corner-bl" />
              <div className="heritage-corner heritage-corner-br" />

              {/* ─────────────────────────────────────────────────────────────
                  CHAPTER HEADER BANNER (Authentic PDF Artboard Plate)
                  ───────────────────────────────────────────────────────────── */}
              <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-[#FAB700] bg-[#181E19]">
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

              {/* Sizzler Showcase & Hindi Calligraphy Header Plate */}
              {heroInfo && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-gradient-to-r from-[#FFF9EE] via-[#FFFDF9] to-[#FFF9EE] p-3 sm:p-4 rounded-2xl border border-[#FAB700]/40 shadow-xs">
                  <div className="md:col-span-4 shrink-0">
                    <div className="heritage-hero-sizzler aspect-video md:aspect-[4/3] max-h-44 w-full">
                      <picture>
                        <source srcSet={heroInfo.hero} type="image/webp" />
                        <img
                          src={heroInfo.hero.replace('.webp', '.png')}
                          alt={heroInfo.hindiTitle}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </picture>
                    </div>
                  </div>

                  <div className="md:col-span-8 space-y-1 sm:space-y-2">
                    <div className="flex items-center gap-2">
                      <Flame size={16} className="text-[#CE182C] animate-pulse" />
                      <h3 className="font-serif font-black text-lg sm:text-xl text-[#991B1B] tracking-wide">
                        {heroInfo.hindiTitle}
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FAB700] text-[#181E19]">
                        Chef's Pride
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#44554C] leading-relaxed">
                      {heroInfo.subtitle}
                    </p>
                    <div className="heritage-filigree-divider pt-1" />
                  </div>
                </div>
              )}

              {/* Beverage syrup announcement banner if beverage */}
              {(cat.name.toLowerCase().includes('coffee') || cat.name.toLowerCase().includes('brew')) && (
                <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-[#FAB700] text-amber-950 text-xs font-semibold flex flex-wrap items-center justify-between gap-2 shadow-xs">
                  <span className="flex items-center gap-2">
                    <Coffee size={16} className="text-amber-800" />
                    <span>Flavour Syrups: Hazelnut • Caramel • Irish • Vanilla • Chocolate</span>
                  </span>
                  <span className="font-mono font-bold bg-[#FAB700] text-[#181E19] px-2.5 py-0.5 rounded-lg text-xs shadow-xs">
                    +₹39
                  </span>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  SPECIAL LAYOUT: MOMO JUNCTION 3-TIER MATRIX TABLE (Page 10)
                  ───────────────────────────────────────────────────────────── */}
              {isMomoSection ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#991B1B] flex items-center gap-1.5 font-serif">
                      <Sparkles size={14} className="text-[#FAB700]" />
                      <span>Authentic Momo Matrix • 6 Pieces Per Plate</span>
                    </div>
                    <span className="text-[11px] font-medium text-[#66776E]">
                      Select variant below to order
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border-2 border-[#FAB700] shadow-md bg-white">
                    <table className="heritage-matrix-table min-w-[540px]">
                      <thead>
                        <tr 
                          className="text-white text-xs font-black uppercase tracking-wider"
                          style={{ background: 'linear-gradient(180deg, #2B231D 0%, #181E19 100%)' }}
                        >
                          <th className="py-3.5 px-4 text-left border-r border-white/10">
                            Preparation Style
                          </th>
                          <th className="py-3.5 px-3 text-center bg-emerald-950/90 text-emerald-300 border-r border-white/10">
                            Veg (6 Pcs)
                          </th>
                          <th className="py-3.5 px-3 text-center bg-amber-950/90 text-amber-300 border-r border-white/10">
                            Paneer (6 Pcs)
                          </th>
                          <th className="py-3.5 px-3 text-center bg-orange-950/90 text-orange-300">
                            Corn N Cheese
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#CE182C]/10 text-xs">
                        {cat.items.map((item, idx) => {
                          // Extract variants or synthesize 3-tier prices
                          const vegVar = item.variants?.find((v) => v.name.toLowerCase().includes('veg'));
                          const panVar = item.variants?.find((v) => v.name.toLowerCase().includes('paneer'));
                          const chzVar = item.variants?.find((v) => v.name.toLowerCase().includes('corn') || v.name.toLowerCase().includes('cheese'));

                          const vegPrice = vegVar ? vegVar.price : (item.halfPrice || item.price || 120);
                          const panPrice = panVar ? panVar.price : (typeof vegPrice === 'number' ? vegPrice + 30 : 150);
                          const chzPrice = chzVar ? chzVar.price : (typeof vegPrice === 'number' ? vegPrice + 50 : 170);

                          const thumb = getDishImage(item, cat.name);

                          return (
                            <tr 
                              key={item.id}
                              className={idx % 2 === 0 ? 'bg-white hover:bg-amber-50/50' : 'bg-[#FFFDF9] hover:bg-amber-50/50'}
                            >
                              {/* Dish Name & Cutout Thumbnail */}
                              <td className="py-3 px-3 sm:px-4 font-bold text-[#1F2923] border-r border-[#CE182C]/10">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full border border-[#FAB700] overflow-hidden shrink-0 shadow-xs bg-white">
                                    <img
                                      src={thumb}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                    />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5 font-serif text-sm text-[#181E19]">
                                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                                      <span>{item.name}</span>
                                    </div>
                                    {item.description && (
                                      <p className="text-[11px] text-[#66776E] line-clamp-1 font-sans">
                                        {item.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Veg Column with Dedicated + Add Button */}
                              <td className="py-3 px-2 text-center border-r border-[#CE182C]/10 bg-emerald-50/20">
                                <button
                                  type="button"
                                  onClick={() => onAddToCart && onAddToCart(item, `₹${vegPrice}`, 'Veg (6 Pcs)')}
                                  className="heritage-matrix-btn heritage-matrix-btn-veg cursor-pointer"
                                  title={`Add Veg ${item.name}`}
                                >
                                  <span>₹{vegPrice}</span>
                                  {isPremium && <Plus size={12} />}
                                </button>
                              </td>

                              {/* Paneer Column with Dedicated + Add Button */}
                              <td className="py-3 px-2 text-center border-r border-[#CE182C]/10 bg-amber-50/20">
                                <button
                                  type="button"
                                  onClick={() => onAddToCart && onAddToCart(item, `₹${panPrice}`, 'Paneer (6 Pcs)')}
                                  className="heritage-matrix-btn heritage-matrix-btn-paneer cursor-pointer"
                                  title={`Add Paneer ${item.name}`}
                                >
                                  <span>₹{panPrice}</span>
                                  {isPremium && <Plus size={12} />}
                                </button>
                              </td>

                              {/* Corn N Cheese Column with Dedicated + Add Button */}
                              <td className="py-3 px-2 text-center bg-orange-50/20">
                                <button
                                  type="button"
                                  onClick={() => onAddToCart && onAddToCart(item, `₹${chzPrice}`, 'Corn N Cheese (6 Pcs)')}
                                  className="heritage-matrix-btn heritage-matrix-btn-cheese cursor-pointer"
                                  title={`Add Corn N Cheese ${item.name}`}
                                >
                                  <span>₹{chzPrice}</span>
                                  {isPremium && <Plus size={12} />}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* ─────────────────────────────────────────────────────────────
                    STANDARD 2-COLUMN LUXURY DHABA / ARTBOARD GRID
                    ───────────────────────────────────────────────────────────── */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cat.items.map((item) => {
                    const pricing = parseItemPricing(item);
                    const thumb = getDishImage(item, cat.name);
                    const hasPortions = Boolean(item.halfPrice && item.fullPrice);

                    return (
                      <article
                        key={item.id}
                        className="p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-[#FFFDF9] transition-all duration-200 border-1.5 border-[#FAB700]/40 hover:border-[#CE182C]/50 shadow-sm hover:shadow-md flex items-center justify-between gap-3 group"
                      >
                        {/* Left: Glowing Gold Ring Food Cutout Thumbnail */}
                        <div className="heritage-dish-thumb shrink-0">
                          <img
                            src={thumb}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>

                        {/* Middle & Right Content */}
                        <div className="min-w-0 flex-1 space-y-1">
                          {/* Dish Header line with Dotted Leader to Price */}
                          <div className="flex items-baseline justify-between gap-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <DietIndicator type={item.dietType} compact className="shrink-0" />
                              <h3
                                className="font-serif font-bold text-sm sm:text-[15px] text-[#181E19] leading-snug truncate group-hover:text-[#991B1B] transition-colors"
                                title={item.name}
                              >
                                {item.name}
                              </h3>
                              {item.isBestseller && (
                                <span className="shrink-0 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#CE182C] text-white shadow-xs">
                                  MTJ Special
                                </span>
                              )}
                            </div>

                            {/* Dotted leader line if single price */}
                            {!hasPortions && !pricing.hasVariants && (
                              <>
                                <span className="heritage-leader-line hidden sm:block" />
                                <span className="font-mono font-black text-sm text-[#991B1B] shrink-0">
                                  ₹{item.price}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Description */}
                          {pricing.cleanDescription && (
                            <p className="text-xs text-[#55635C] line-clamp-2 leading-relaxed font-sans">
                              {pricing.cleanDescription}
                            </p>
                          )}

                          {/* ───────────────────────────────────────────────────
                              INTERACTIVE PORTION CONTROLS (Half / Full / Variants)
                              ─────────────────────────────────────────────────── */}
                          {/* Case A: Half & Full Portion Buttons */}
                          {hasPortions && (
                            <div className="flex flex-wrap items-center gap-2 pt-1.5">
                              <button
                                type="button"
                                onClick={() => onAddToCart && onAddToCart(item, `₹${item.halfPrice}`, 'Half')}
                                className="heritage-portion-btn-half px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                                title={`Add Half ${item.name}`}
                              >
                                <span>Half: ₹{item.halfPrice}</span>
                                {isPremium && <Plus size={11} />}
                              </button>

                              <button
                                type="button"
                                onClick={() => onAddToCart && onAddToCart(item, `₹${item.fullPrice}`, 'Full')}
                                className="heritage-portion-btn-full px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                                title={`Add Full ${item.name}`}
                              >
                                <span>Full: ₹{item.fullPrice}</span>
                                {isPremium && <Plus size={11} />}
                              </button>
                            </div>
                          )}

                          {/* Case B: Custom Variants (e.g. 2 Pcs / 4 Pcs / Sizes) */}
                          {!hasPortions && pricing.hasVariants && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                              {pricing.variants.map((v) => (
                                <button
                                  key={v.name}
                                  type="button"
                                  onClick={() => onAddToCart && onAddToCart(item, `₹${v.price}`, v.name)}
                                  className="heritage-portion-btn-half px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1 cursor-pointer active:scale-95"
                                  title={`Add ${v.name} ${item.name}`}
                                >
                                  <span>{v.name}: ₹{v.price}</span>
                                  {isPremium && <Plus size={10} />}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Case C: Single Price Add Button (Mobile & Action) */}
                          {!hasPortions && !pricing.hasVariants && isPremium && (
                            <div className="flex items-center justify-between sm:justify-end pt-1">
                              <span className="sm:hidden font-mono font-black text-xs text-[#991B1B]">
                                ₹{item.price}
                              </span>
                              <button
                                type="button"
                                onClick={() => onAddToCart && onAddToCart(item, `₹${item.price}`)}
                                className="heritage-portion-btn-full px-3 py-1 rounded-lg text-xs flex items-center gap-1 cursor-pointer active:scale-95"
                              >
                                <span>ADD</span>
                                <Plus size={12} />
                              </button>
                            </div>
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
      <footer className="pt-6 pb-12 rounded-3xl overflow-hidden shadow-2xl border-2 border-[#FAB700] bg-[#181E19]">
        <div className="heritage-corner heritage-corner-tl" />
        <div className="heritage-corner heritage-corner-tr" />
        <div className="heritage-corner heritage-corner-bl" />
        <div className="heritage-corner heritage-corner-br" />

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