// MENUQR Design Engine — Authentic Heritage Artboard Composition
// Bespoke 1:1 Digital Artboard for Indian Tandoor, Chaap & Royal Dhaba Menus
// Clean, organized, luxury restaurant styling mirroring Art Board 3.pdf

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
  Plus
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Chapter Banner Plates (Extracted directly from PDF pages)
// ─────────────────────────────────────────────────────────────────────────────
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

// Dish Thumbnail Image Mapping
const getDishImage = (item: MenuItem, catName: string): string => {
  if (item.image && !item.image.includes('placeholder')) {
    return item.image;
  }
  const nameLower = (item.name || '').toLowerCase();
  const catLower = catName.toLowerCase();

  // Keyword Matching
  if (nameLower.includes('malai chaap')) return '/uploads/mannat/assets/dish_malai_chaap.webp';
  if (nameLower.includes('afghani chaap')) return '/uploads/mannat/assets/dish_afghani_chaap.webp';
  if (nameLower.includes('chaap roll') || catLower.includes('roll')) return '/uploads/mannat/assets/dish_chaap_roll.webp';
  if (nameLower.includes('chaap') || catLower.includes('chaap')) return '/uploads/mannat/assets/dish_tandoori_chaap.webp';
  
  if (nameLower.includes('paneer tikka') || catLower.includes('paneer feast')) return '/uploads/mannat/assets/dish_paneer_tikka.webp';
  if (nameLower.includes('shahi paneer') || nameLower.includes('paneer butter') || catLower.includes('khazana')) return '/uploads/mannat/assets/dish_shahi_paneer.webp';
  if (nameLower.includes('dal makhani') || catLower.includes('dal')) return '/uploads/mannat/assets/dish_dal_makhani.webp';
  
  if (nameLower.includes('kebab') || nameLower.includes('sholay') || catLower.includes('kebab') || catLower.includes('platter')) return '/uploads/mannat/assets/dish_dahi_ke_sholay.webp';
  if (nameLower.includes('biryani') || nameLower.includes('rice') || catLower.includes('desi')) return '/uploads/mannat/assets/dish_veg_biryani.webp';
  if (nameLower.includes('thali') || catLower.includes('thali') || catLower.includes('combo')) return '/uploads/mannat/assets/dish_deluxe_thali.webp';
  if (nameLower.includes('pav bhaji') || nameLower.includes('chole') || catLower.includes('street')) return '/uploads/mannat/assets/dish_pav_bhaji.webp';
  
  if (catLower.includes('momo') || nameLower.includes('momo')) {
    return nameLower.includes('fried') || nameLower.includes('kurkure') 
      ? '/uploads/mannat/assets/dish_fried_momos.webp' 
      : '/uploads/mannat/assets/dish_steamed_momos.webp';
  }
  
  if (nameLower.includes('noodle') || nameLower.includes('manchurian') || nameLower.includes('chilli') || catLower.includes('chinese') || catLower.includes('wok')) {
    return '/uploads/mannat/assets/dish_hakka_noodles.webp';
  }
  if (nameLower.includes('shawarma') || nameLower.includes('falafel') || catLower.includes('lebanese')) return '/uploads/mannat/assets/dish_falafel_wrap.webp';
  if (nameLower.includes('fries') || nameLower.includes('nacho') || catLower.includes('fries')) return '/uploads/mannat/assets/dish_peri_peri_fries.webp';
  if (nameLower.includes('taco') || nameLower.includes('quesadilla') || catLower.includes('taco')) return '/uploads/mannat/assets/dish_crispy_tacos.webp';
  if (nameLower.includes('pasta') || catLower.includes('pasta')) return '/uploads/mannat/assets/dish_creamy_pasta.webp';
  if (nameLower.includes('pizza') || catLower.includes('pizza')) return '/uploads/mannat/assets/dish_margherita_pizza.webp';
  if (nameLower.includes('burger') || nameLower.includes('sandwich') || catLower.includes('burger')) return '/uploads/mannat/assets/dish_brioche_burger.webp';
  if (nameLower.includes('garlic bread') || catLower.includes('garlic')) return '/uploads/mannat/assets/dish_garlic_bread.webp';
  if (nameLower.includes('coffee') || nameLower.includes('latte') || catLower.includes('coffee') || catLower.includes('brew')) return '/uploads/mannat/assets/dish_iced_latte.webp';
  if (nameLower.includes('shake') || catLower.includes('shake') || catLower.includes('boba')) return '/uploads/mannat/assets/dish_oreo_shake.webp';
  if (nameLower.includes('mojito') || nameLower.includes('cooler') || catLower.includes('cooler')) return '/uploads/mannat/assets/dish_mint_mojito.webp';
  if (nameLower.includes('brownie') || nameLower.includes('dessert') || catLower.includes('dessert')) return '/uploads/mannat/assets/dish_fudge_brownie.webp';

  return '/uploads/mannat/assets/dish_tandoori_chaap.webp';
};

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
      className="heritage-canvas relative z-10 space-y-8 max-w-4xl mx-auto w-full transition-colors duration-300 p-2 sm:p-5"
      style={{
        color: colors.text,
        fontFamily: typography.bodyFont,
      }}
    >
      {/* ═══════════════════════════════════════════════════════════════════════
          MASTHEAD: AUTHENTIC PDF COVER ARTBOARD (Page 1)
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

        {/* Contact Strip */}
        <div className="bg-[#181E19] text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs border-t-2 border-[#FAB700]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10B981]" />
            <span className="font-bold text-[#FAB700] uppercase tracking-wider text-[11px] sm:text-xs font-serif">
              Chaap Ka Asli Swad • 100% Pure Soya
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
                <span className="line-clamp-1">{restaurant.address}</span>
              </div>
            )}
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
          STICKY CATEGORY NAVIGATION PILLS
          ═══════════════════════════════════════════════════════════════════════ */}
      <nav
        aria-label="Menu Sections"
        className="sticky top-14 z-30 bg-[#FFFDF9]/95 backdrop-blur-md py-2.5 px-3 rounded-2xl shadow-md border-2 border-[#FAB700]/60 overflow-x-auto scrollbar-none flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={clsx(
            'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer',
            activeCategory === 'all'
              ? 'bg-[#CE182C] text-white border border-[#FAB700] shadow-sm'
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
                'shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 shadow-xs active:scale-95 cursor-pointer',
                isActive
                  ? 'bg-[#CE182C] text-white border border-[#FAB700] shadow-sm'
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
      <div className="space-y-10">
        {categories.map((cat) => {
          const chapterBanner = getCategoryBanner(cat.name);
          const isMomoSection = cat.name.toLowerCase().includes('momo');

          return (
            <section
              key={cat.id}
              className="p-4 sm:p-6 space-y-5 rounded-3xl bg-white/95 border-2 border-[#FAB700]/50 shadow-md backdrop-blur-xs"
            >
              {/* ─────────────────────────────────────────────────────────────
                  CHAPTER HEADER BANNER (Authentic PDF Artboard Plate)
                  ───────────────────────────────────────────────────────────── */}
              <div className="rounded-2xl overflow-hidden shadow-md border-2 border-[#FAB700] bg-[#181E19]">
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

              {/* Beverage syrup announcement banner if beverage */}
              {(cat.name.toLowerCase().includes('coffee') || cat.name.toLowerCase().includes('brew')) && (
                <div className="p-3 rounded-xl bg-amber-50 border border-[#FAB700] text-amber-950 text-xs font-semibold flex flex-wrap items-center justify-between gap-2 shadow-xs">
                  <span className="flex items-center gap-2">
                    <Coffee size={15} className="text-amber-800" />
                    <span>Flavour Syrups: Hazelnut • Caramel • Irish • Vanilla • Chocolate</span>
                  </span>
                  <span className="font-mono font-bold bg-[#FAB700] text-[#181E19] px-2 py-0.5 rounded text-[11px]">
                    +₹39
                  </span>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  SPECIAL LAYOUT: MOMO JUNCTION 3-TIER MATRIX TABLE (Page 10)
                  ───────────────────────────────────────────────────────────── */}
              {isMomoSection ? (
                <div className="overflow-x-auto rounded-2xl border-2 border-[#FAB700] shadow-sm bg-white">
                  <table className="heritage-matrix-table min-w-[500px]">
                    <thead>
                      <tr 
                        className="text-white text-xs font-black uppercase tracking-wider"
                        style={{ background: '#1F2923' }}
                      >
                        <th className="py-3 px-3 sm:px-4 text-left">Preparation Style</th>
                        <th className="py-3 px-3 text-center bg-emerald-950/90 text-emerald-300 border-l border-white/10">
                          Veg (6 Pcs)
                        </th>
                        <th className="py-3 px-3 text-center bg-amber-950/90 text-amber-300 border-l border-white/10">
                          Paneer (6 Pcs)
                        </th>
                        <th className="py-3 px-3 text-center bg-orange-950/90 text-orange-300 border-l border-white/10">
                          Corn N Cheese
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 text-xs">
                      {cat.items.map((item, idx) => {
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
                            className={idx % 2 === 0 ? 'bg-white hover:bg-amber-50/40' : 'bg-[#FFFDF9] hover:bg-amber-50/40'}
                          >
                            <td className="py-2.5 px-3 sm:px-4 font-bold text-[#1F2923]">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full border border-[#FAB700] overflow-hidden shrink-0 bg-white">
                                  <img
                                    src={thumb}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 font-serif text-sm text-[#181E19]">
                                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                                    <span className="truncate">{item.name}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Veg Column */}
                            <td className="py-2.5 px-2 text-center border-l border-black/5">
                              <button
                                type="button"
                                onClick={() => onAddToCart && onAddToCart(item, `₹${vegPrice}`, 'Veg (6 Pcs)')}
                                className="heritage-matrix-btn heritage-matrix-btn-veg cursor-pointer"
                                title={`Add Veg ${item.name}`}
                              >
                                <span>₹{vegPrice}</span>
                                {isPremium && <Plus size={11} />}
                              </button>
                            </td>

                            {/* Paneer Column */}
                            <td className="py-2.5 px-2 text-center border-l border-black/5">
                              <button
                                type="button"
                                onClick={() => onAddToCart && onAddToCart(item, `₹${panPrice}`, 'Paneer (6 Pcs)')}
                                className="heritage-matrix-btn heritage-matrix-btn-paneer cursor-pointer"
                                title={`Add Paneer ${item.name}`}
                              >
                                <span>₹{panPrice}</span>
                                {isPremium && <Plus size={11} />}
                              </button>
                            </td>

                            {/* Corn N Cheese Column */}
                            <td className="py-2.5 px-2 text-center border-l border-black/5">
                              <button
                                type="button"
                                onClick={() => onAddToCart && onAddToCart(item, `₹${chzPrice}`, 'Corn N Cheese (6 Pcs)')}
                                className="heritage-matrix-btn heritage-matrix-btn-cheese cursor-pointer"
                                title={`Add Corn N Cheese ${item.name}`}
                              >
                                <span>₹{chzPrice}</span>
                                {isPremium && <Plus size={11} />}
                              </button>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {cat.items.map((item) => {
                    const pricing = parseItemPricing(item);
                    const thumb = getDishImage(item, cat.name);
                    const hasHalfFull = Boolean(item.halfPrice && item.fullPrice);

                    return (
                      <article
                        key={item.id}
                        className="p-3 sm:p-3.5 rounded-2xl bg-white hover:bg-[#FFFDF9] transition-all duration-200 border border-[#FAB700]/30 hover:border-[#CE182C]/40 shadow-xs hover:shadow-md flex items-center justify-between gap-3"
                      >
                        {/* Left: Food Cutout Thumbnail */}
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
                          {/* Dish Header line with Dotted Leader */}
                          <div className="flex items-baseline justify-between gap-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <DietIndicator type={item.dietType} compact className="shrink-0" />
                              <h3
                                className="font-serif font-bold text-sm text-[#181E19] leading-snug truncate"
                                title={item.name}
                              >
                                {item.name}
                              </h3>
                              {item.isBestseller && (
                                <span className="shrink-0 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#CE182C] text-white">
                                  Special
                                </span>
                              )}
                            </div>

                            {/* Dotted line & single price (if no portions) */}
                            {!hasHalfFull && !pricing.hasVariants && (
                              <div className="flex items-center gap-1 shrink-0">
                                <span className="heritage-leader-line hidden sm:inline-block" />
                                <span className="font-mono font-black text-sm text-[#CE182C]">
                                  ₹{item.price}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Description if present */}
                          {pricing.cleanDescription && (
                            <p className="text-[11px] text-[#55635C] line-clamp-1 leading-normal font-sans">
                              {pricing.cleanDescription}
                            </p>
                          )}

                          {/* ───────────────────────────────────────────────────
                              PORTION CONTROLS (Half/Full OR Variants OR Single ADD)
                              ─────────────────────────────────────────────────── */}
                          {hasHalfFull ? (
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => onAddToCart && onAddToCart(item, `₹${item.halfPrice}`, 'Half')}
                                className="heritage-portion-btn-half px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 cursor-pointer active:scale-95"
                                title={`Add Half ${item.name}`}
                              >
                                <span className="text-[10px] uppercase font-bold text-[#CE182C]">Half:</span>
                                <span className="font-mono font-bold text-[#CE182C]">₹{item.halfPrice}</span>
                                {isPremium && <Plus size={11} className="text-[#CE182C]" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => onAddToCart && onAddToCart(item, `₹${item.fullPrice}`, 'Full')}
                                className="heritage-portion-btn-full px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 cursor-pointer active:scale-95"
                                title={`Add Full ${item.name}`}
                              >
                                <span className="text-[10px] uppercase font-bold text-white/90">Full:</span>
                                <span className="font-mono font-bold text-white">₹{item.fullPrice}</span>
                                {isPremium && <Plus size={11} className="text-white" />}
                              </button>
                            </div>
                          ) : pricing.hasVariants ? (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
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
                          ) : isPremium ? (
                            <div className="flex items-center justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => onAddToCart && onAddToCart(item, `₹${item.price}`)}
                                className="heritage-portion-btn-full px-3 py-1 rounded-lg text-xs flex items-center gap-1 cursor-pointer active:scale-95"
                              >
                                <span>ADD</span>
                                <Plus size={11} />
                              </button>
                            </div>
                          ) : null}
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
      <footer className="pt-6 pb-10 rounded-3xl overflow-hidden shadow-xl border-2 border-[#FAB700] bg-white">
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
