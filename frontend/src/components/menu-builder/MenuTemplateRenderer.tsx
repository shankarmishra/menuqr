import React, { useState } from 'react';
import clsx from 'clsx';
import { menuTemplates, type MenuTemplate } from '../../data/menuTemplates';

export interface MenuTemplateRendererProps {
  templateId: string;
  restaurant: {
    name: string;
    tagline?: string;
    cuisine?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    openingHours?: string;
    logo?: string;
  };
  categories: Array<{ id: string; name: string; order?: number }>;
  items: Array<{
    id: string;
    name: string;
    description?: string;
    price: number | string;
    halfPrice?: number | string;
    fullPrice?: number | string;
    regPrice?: number | string;
    medPrice?: number | string;
    largePrice?: number | string;
    pricingType?: string;
    category: string;
    dietType: 'veg' | 'non-veg' | 'vegan';
    available?: boolean;
    isBestseller?: boolean;
  }>;
  compact?: boolean;
  className?: string;
  onAddToCart?: (item: any, priceStr: string, variant?: string) => void;
  isPremium?: boolean;
}

const DietIndicator: React.FC<{ type: 'veg' | 'non-veg' | 'vegan'; compact?: boolean; color?: string }> = ({
  type,
  compact = false,
  color,
}) => {
  const isVeg = type === 'veg' || type === 'vegan';
  const borderCol = color || (isVeg ? '#34B56A' : '#E84A27');
  const dotCol = color || (isVeg ? '#34B56A' : '#E84A27');

  return (
    <div
      className={clsx(
        'flex items-center justify-center border shrink-0',
        compact ? 'w-3 h-3 border-[1px]' : 'w-3.5 h-3.5 border-[1.5px]'
      )}
      style={{ borderColor: borderCol }}
      title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
    >
      <div
        className={clsx('rounded-full', compact ? 'w-1 h-1' : 'w-1.5 h-1.5')}
        style={{ backgroundColor: dotCol }}
      />
    </div>
  );
};

const FormatPrice = (val: number | string) => {
  if (typeof val === 'number') return `₹${val.toLocaleString('en-IN')}`;
  if (!val) return '';
  return String(val).startsWith('₹') ? String(val) : `₹${val}`;
};

export const MenuTemplateRenderer: React.FC<MenuTemplateRendererProps> = ({
  templateId,
  restaurant,
  categories,
  items,
  compact = false,
  className,
  onAddToCart,
  isPremium = false,
}) => {
  const template = menuTemplates.find((t) => t.id === templateId) || menuTemplates[0];
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Group items by category
  const sortedCategories = [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  
  const itemsByCategory = sortedCategories
    .map((cat) => ({
      ...cat,
      items: items.filter((item) => item.category === cat.id || item.category === cat.name),
    }))
    .filter((cat) => cat.items.length > 0);

  const finalCategories =
    itemsByCategory.length > 0
      ? itemsByCategory
      : Array.from(new Set(items.map((i) => i.category))).map((catName, idx) => ({
          id: `cat-${idx}`,
          name: catName,
          order: idx,
          items: items.filter((i) => i.category === catName),
        }));

  // Apply Search & Category Filters
  const filteredCategories = finalCategories
    .map((cat) => {
      if (activeCategory !== 'all' && cat.id !== activeCategory && cat.name !== activeCategory) {
        return null;
      }
      const matchingItems = cat.items.filter((item) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) || (item.description && item.description.toLowerCase().includes(q));
      });
      if (matchingItems.length === 0) return null;
      return { ...cat, items: matchingItems };
    })
    .filter((c): c is (typeof finalCategories)[0] => c !== null);

  const { colors, typography, decorations } = template;

  const layoutProps: LayoutProps = {
    template,
    restaurant,
    categories: filteredCategories,
    rawCategories: finalCategories,
    compact,
    onAddToCart,
    isPremium,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
  };

  const renderTemplateBody = () => {
    switch (template.id) {
      case 'royal-maharaja':
        return <RoyalMaharajaLayout {...layoutProps} />;
      case 'rajasthani-heritage':
        return <RajasthaniHeritageLayout {...layoutProps} />;
      case 'mughal-luxe':
        return <MughalLuxeLayout {...layoutProps} />;
      case 'banarasi-gold':
        return <BanarasiGoldLayout {...layoutProps} />;
      case 'south-indian-heritage':
        return <SouthIndianHeritageLayout {...layoutProps} />;
      case 'indian-street-kitchen':
        return <IndianStreetKitchenLayout {...layoutProps} />;
      case 'modern-india':
        return <ModernIndiaLayout {...layoutProps} />;
      case 'spice-house':
        return <SpiceHouseLayout {...layoutProps} />;
      case 'maison-noir':
        return <MaisonNoirLayout {...layoutProps} />;
      case 'ivory-dining':
        return <IvoryDiningLayout {...layoutProps} />;
      case 'grand-table':
        return <GrandTableLayout {...layoutProps} />;
      case 'coffee-house':
        return <CoffeeHouseLayout {...layoutProps} />;
      case 'paper-cafe':
        return <PaperCafeLayout {...layoutProps} />;
      case 'bombay-street':
        return <BombayStreetLayout {...layoutProps} />;
      case 'chalk-bistro':
        return <ChalkBistroLayout {...layoutProps} />;
      case 'fluid-abstract':
        return <FluidAbstractLayout {...layoutProps} />;
      case 'dark-clipboard':
        return <DarkClipboardLayout {...layoutProps} />;
      case 'minimal-editorial':
      default:
        return <MinimalEditorialLayout {...layoutProps} />;
    }
  };

  return (
    <div
      className={clsx(
        'relative w-full min-h-full overflow-y-auto select-none transition-colors duration-300 font-sans',
        compact ? 'p-2 sm:p-3 text-xs' : 'p-3 sm:p-6 md:p-10 text-sm',
        className
      )}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        fontFamily: typography.body,
      }}
    >
      {/* Background Texture Patterns */}
      {decorations.hasPattern && (
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay z-0"
          style={{ opacity: decorations.patternOpacity }}
        >
          {decorations.patternType === 'damask' && (
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0c16.568 0 30 13.432 30 30 0 16.568-13.432 30-30 30C13.432 60 0 46.568 0 30 0 13.432 13.432 0 30 0zm0 10C18.954 10 10 18.954 10 30s8.954 20 20 20 20-8.954 20-20-8.954-20-20-20z' fill='%23ffffff' fill-opacity='0.15'/%3E%3C/svg%3E")`,
                backgroundSize: '40px 40px',
              }}
            />
          )}
          {decorations.patternType === 'arch' && (
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='60' viewBox='0 0 40 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 60V30C0 13.431 8.954 0 20 0s20 13.431 20 30v30H0z' fill='none' stroke='%23E5C158' stroke-width='1' stroke-opacity='0.2'/%3E%3C/svg%3E")`,
                backgroundSize: '40px 60px',
              }}
            />
          )}
          {decorations.patternType === 'woven' && (
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h10v10H0V0zm10 10h10v10H10V10z' fill='%23FFD700' fill-opacity='0.12'/%3E%3C/svg%3E")`,
                backgroundSize: '20px 20px',
              }}
            />
          )}
          {decorations.patternType === 'grain' && (
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.3'/%3E%3C/svg%3E")`,
              }}
            />
          )}
          {decorations.patternType === 'dots' && (
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `radial-gradient(circle, ${colors.accent} 1px, transparent 1px)`,
                backgroundSize: '16px 16px',
              }}
            />
          )}
        </div>
      )}

      {/* Decorative Frame */}
      {decorations.borderStyle !== 'none' && !compact && (
        <div
          className="absolute inset-2 sm:inset-4 pointer-events-none z-10"
          style={{
            border: `1.5px solid ${colors.border}`,
            boxShadow: template.id === 'royal-maharaja' ? `inset 0 0 0 3px ${colors.bg}, inset 0 0 0 4.5px ${colors.accent}` : undefined,
          }}
        />
      )}

      <div className="relative z-20 max-w-3xl mx-auto flex flex-col h-full">
        {renderTemplateBody()}
      </div>
    </div>
  );
};

/* =========================================================================
   LAYOUT INTERFACES & ITEM PRICE DISPLAY
   ========================================================================= */

interface CategoryGroup {
  id: string;
  name: string;
  order?: number;
  items: Array<{
    id: string;
    name: string;
    description?: string;
    price: number | string;
    halfPrice?: number | string;
    fullPrice?: number | string;
    regPrice?: number | string;
    medPrice?: number | string;
    largePrice?: number | string;
    pricingType?: string;
    dietType: 'veg' | 'non-veg' | 'vegan';
    available?: boolean;
    isBestseller?: boolean;
  }>;
}

interface LayoutProps {
  template: MenuTemplate;
  restaurant: { name: string; tagline?: string; cuisine?: string; phone?: string; address?: string; city?: string; logo?: string };
  categories: CategoryGroup[];
  rawCategories: CategoryGroup[];
  compact?: boolean;
  onAddToCart?: (item: any, priceStr: string, variant?: string) => void;
  isPremium?: boolean;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const RenderItemPrices: React.FC<{
  item: CategoryGroup['items'][0];
  accentColor: string;
  textColor?: string;
  onAddToCart?: (item: any, priceStr: string, variant?: string) => void;
  isPremium?: boolean;
  btnStyle?: string;
}> = ({ item, accentColor, onAddToCart, isPremium, btnStyle }) => {
  if (item.available === false) {
    return <span className="text-[10px] italic opacity-60 font-sans">Currently unavailable</span>;
  }

  if (item.halfPrice || item.fullPrice) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {item.halfPrice && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] opacity-70">Half</span>
            <span className="font-mono text-xs font-bold" style={{ color: accentColor }}>{FormatPrice(item.halfPrice)}</span>
            {onAddToCart && isPremium && (
              <button
                type="button"
                onClick={() => onAddToCart(item, String(item.halfPrice), 'Half')}
                className={btnStyle || "text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/20 hover:bg-black/40"}
              >
                +
              </button>
            )}
          </div>
        )}
        {item.fullPrice && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] opacity-70">Full</span>
            <span className="font-mono text-xs font-bold" style={{ color: accentColor }}>{FormatPrice(item.fullPrice)}</span>
            {onAddToCart && isPremium && (
              <button
                type="button"
                onClick={() => onAddToCart(item, String(item.fullPrice), 'Full')}
                className={btnStyle || "text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/20 hover:bg-black/40"}
              >
                +
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="font-mono text-xs sm:text-sm font-bold" style={{ color: accentColor }}>
        {FormatPrice(item.price)}
      </span>
      {onAddToCart && isPremium && (
        <button
          type="button"
          onClick={() => onAddToCart(item, String(item.price))}
          className={btnStyle || "text-[10px] font-bold px-2 py-0.5 rounded border opacity-90 hover:opacity-100"}
        >
          + Add
        </button>
      )}
    </div>
  );
};

/* =========================================================================
   15 BESPOKE DESIGN SYSTEMS & TEMPLATE-SPECIFIC CATEGORY NAVS
   ========================================================================= */

// 01. ROYAL MAHARAJA
const RoyalMaharajaLayout: React.FC<LayoutProps> = ({ template, restaurant, categories, rawCategories, compact, onAddToCart, isPremium, activeCategory, setActiveCategory }) => {
  return (
    <div className="space-y-6 relative z-10">
      {/* Header */}
      <div className="relative text-center pb-4 pt-2">
        <div className="flex justify-center items-center gap-2 mb-2 text-[#D4AF37]">
          <span className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-[#D4AF37]" />
          <span className="text-[9px] font-serif uppercase tracking-[0.35em] font-bold text-[#D4AF37]">Palace Dining</span>
          <span className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-[#D4AF37]" />
        </div>
        <h1
          className={clsx('font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-[#FFF5D1] via-[#D4AF37] to-[#AA7C11]', compact ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-5xl')}
          style={{ fontFamily: template.typography.heading }}
        >
          {restaurant.name}
        </h1>
        {restaurant.tagline && <p className="text-xs italic text-[#FAF3E0]/70 mt-1 font-serif tracking-widest">{restaurant.tagline}</p>}
      </div>

      {/* Royal Maharaja Category Navigation: Centered Brass Framed Tabs */}
      {!compact && rawCategories.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 py-2 border-y border-[#D4AF37]/30 my-4">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'px-3 py-1 text-xs font-serif uppercase tracking-widest border transition-all',
              activeCategory === 'all' ? 'bg-[#D4AF37] text-[#1A0B13] border-[#D4AF37] font-bold' : 'text-[#D4AF37] border-[#D4AF37]/40 hover:border-[#D4AF37]'
            )}
          >
            All
          </button>
          {rawCategories.map((cat) => {
            const isActive = activeCategory === cat.id || activeCategory === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={clsx(
                  'px-3 py-1 text-xs font-serif uppercase tracking-widest border transition-all',
                  isActive ? 'bg-[#D4AF37] text-[#1A0B13] border-[#D4AF37] font-bold' : 'text-[#D4AF37] border-[#D4AF37]/40 hover:border-[#D4AF37]'
                )}
              >
                ❖ {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Categories & Items */}
      <div className="space-y-8">
        {categories.map((cat) => (
          <div key={cat.id} className="space-y-4">
            <div className="flex items-center justify-center py-1.5 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
              </div>
              <div className="bg-[#1A0B13] px-4 py-1 border border-[#D4AF37]/50 rounded-sm relative z-10 flex items-center gap-2">
                <span className="text-[#D4AF37] text-[9px]">❖</span>
                <h2
                  className={clsx('font-extrabold text-[#D4AF37] uppercase tracking-[0.2em]', compact ? 'text-xs' : 'text-sm')}
                  style={{ fontFamily: template.typography.heading }}
                >
                  {cat.name}
                </h2>
                <span className="text-[#D4AF37] text-[9px]">❖</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {cat.items.map((item) => (
                <div key={item.id} className="relative group p-3.5 rounded-tr-2xl rounded-bl-2xl bg-gradient-to-br from-[#2A111F]/90 to-[#1A0B13]/95 border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <DietIndicator type={item.dietType} compact={compact} color="#D4AF37" />
                        <h3 className="font-bold text-xs sm:text-sm text-[#FFF8E7] group-hover:text-[#D4AF37] transition-colors" style={{ fontFamily: template.typography.heading }}>
                          {item.name}
                        </h3>
                        {item.isBestseller && (
                          <span className="px-1 py-0.5 text-[8px] uppercase tracking-wider bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 rounded ml-1">
                            Royal
                          </span>
                        )}
                      </div>
                      {item.description && <p className="text-[11px] text-[#FAF3E0]/70 leading-relaxed font-serif mt-0.5">{item.description}</p>}
                    </div>
                    
                    <RenderItemPrices
                      item={item}
                      accentColor="#D4AF37"
                      textColor="#FAF3E0"
                      onAddToCart={onAddToCart}
                      isPremium={isPremium}
                      btnStyle="text-[10px] font-bold px-2 py-0.5 bg-[#D4AF37] text-[#1A0B13] rounded hover:bg-[#FFF5D1]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 02. RAJASTHANI HERITAGE
const RajasthaniHeritageLayout: React.FC<LayoutProps> = ({ template, restaurant, categories, rawCategories, compact, onAddToCart, isPremium, activeCategory, setActiveCategory }) => {
  return (
    <div className="space-y-6">
      {/* Terracotta Header */}
      <div className="bg-[#9E3B20] text-[#F7EBE1] p-4 sm:p-5 rounded text-center shadow-md border-b-4 border-[#1E3A5F]">
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#F7EBE1]/80 block mb-1">
          REGIONAL TEXTILE & CRAFT KITCHEN
        </span>
        <h1 className={clsx('font-black tracking-tight text-white', compact ? 'text-xl' : 'text-2xl sm:text-3xl')} style={{ fontFamily: template.typography.heading }}>
          {restaurant.name}
        </h1>
        {restaurant.tagline && <p className="text-xs text-[#F7EBE1]/90 mt-1 font-medium">{restaurant.tagline}</p>}
      </div>

      {/* Rajasthani Heritage Category Nav: Terracotta Block Strip */}
      {!compact && rawCategories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'px-3 py-1 text-xs font-bold uppercase tracking-wider rounded border transition-all whitespace-nowrap',
              activeCategory === 'all' ? 'bg-[#9E3B20] text-white border-[#9E3B20]' : 'bg-white text-[#9E3B20] border-[#9E3B20]/30'
            )}
          >
            All Categories
          </button>
          {rawCategories.map((cat) => {
            const isActive = activeCategory === cat.id || activeCategory === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={clsx(
                  'px-3 py-1 text-xs font-bold uppercase tracking-wider rounded border transition-all whitespace-nowrap',
                  isActive ? 'bg-[#9E3B20] text-white border-[#9E3B20]' : 'bg-white text-[#9E3B20] border-[#9E3B20]/30'
                )}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {categories.map((cat) => (
        <div key={cat.id} className="space-y-3">
          <div className="bg-[#9E3B20]/10 px-3.5 py-1 border-l-4 border-[#9E3B20] inline-block rounded-r">
            <h2 className="font-bold text-[#9E3B20] uppercase text-xs sm:text-sm tracking-wider" style={{ fontFamily: template.typography.heading }}>
              {cat.name}
            </h2>
          </div>

          <div className="space-y-2.5">
            {cat.items.map((item) => (
              <div key={item.id} className="py-2 border-b border-[#9E3B20]/20 flex justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <DietIndicator type={item.dietType} compact={compact} color="#9E3B20" />
                    <span className="font-bold text-xs sm:text-sm text-[#2C1D11]" style={{ fontFamily: template.typography.heading }}>
                      {item.name}
                    </span>
                  </div>
                  {item.description && <p className="text-[11px] text-[#2C1D11]/80 pl-5 mt-0.5 font-sans leading-relaxed">{item.description}</p>}
                </div>
                
                <RenderItemPrices
                  item={item}
                  accentColor="#9E3B20"
                  textColor="#2C1D11"
                  onAddToCart={onAddToCart}
                  isPremium={isPremium}
                  btnStyle="text-[10px] font-bold px-2 py-0.5 bg-[#9E3B20] text-white rounded hover:bg-[#7D2E18]"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// 03. MUGHAL LUXE
const MughalLuxeLayout: React.FC<LayoutProps> = ({ template, restaurant, categories, rawCategories, compact, onAddToCart, isPremium, activeCategory, setActiveCategory }) => {
  return (
    <div className="space-y-6">
      {/* Arch Motif Header */}
      <div className="text-center pt-2 pb-5 border-b border-[#E5C158]/30 relative">
        <div className="mx-auto w-14 h-10 border-t-2 border-x-2 border-[#E5C158] rounded-t-full flex items-center justify-center mb-2">
          <span className="text-[#E5C158] text-xs">☪</span>
        </div>
        <h1 className={clsx('font-bold text-[#E5C158] tracking-widest uppercase', compact ? 'text-xl' : 'text-2xl sm:text-3xl')} style={{ fontFamily: template.typography.heading }}>
          {restaurant.name}
        </h1>
        {restaurant.tagline && <p className="text-[10px] text-[#A3D9C9] tracking-widest uppercase mt-1">{restaurant.tagline}</p>}
      </div>

      {/* Mughal Luxe Category Nav: Arched Underlined Tabs */}
      {!compact && rawCategories.length > 1 && (
        <div className="flex justify-center gap-4 overflow-x-auto pb-1 border-b border-[#E5C158]/20">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'pb-1.5 text-xs font-serif uppercase tracking-widest transition-all border-b-2',
              activeCategory === 'all' ? 'text-[#E5C158] border-[#E5C158] font-bold' : 'text-[#FFFBF0]/60 border-transparent hover:text-[#E5C158]'
            )}
          >
            All
          </button>
          {rawCategories.map((cat) => {
            const isActive = activeCategory === cat.id || activeCategory === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={clsx(
                  'pb-1.5 text-xs font-serif uppercase tracking-widest transition-all border-b-2 whitespace-nowrap',
                  isActive ? 'text-[#E5C158] border-[#E5C158] font-bold' : 'text-[#FFFBF0]/60 border-transparent hover:text-[#E5C158]'
                )}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {categories.map((cat) => (
        <div key={cat.id} className="space-y-3">
          <div className="text-center py-1 border-y border-[#E5C158]/40 my-2">
            <h2 className="font-semibold text-[#E5C158] uppercase text-xs tracking-widest" style={{ fontFamily: template.typography.heading }}>
              ❖ {cat.name} ❖
            </h2>
          </div>

          <div className="space-y-3">
            {cat.items.map((item) => (
              <div key={item.id} className="py-2 border-b border-[#E5C158]/15 flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <DietIndicator type={item.dietType} compact={compact} color="#E5C158" />
                    <span className="font-medium text-xs sm:text-sm text-[#FFFBF0]" style={{ fontFamily: template.typography.heading }}>
                      {item.name}
                    </span>
                  </div>
                  {item.description && <p className="text-[11px] text-[#A3D9C9]/80 pl-5 mt-0.5 font-serif">{item.description}</p>}
                </div>
                
                <RenderItemPrices
                  item={item}
                  accentColor="#E5C158"
                  textColor="#FFFBF0"
                  onAddToCart={onAddToCart}
                  isPremium={isPremium}
                  btnStyle="text-[10px] font-bold px-2 py-0.5 border border-[#E5C158] text-[#E5C158] hover:bg-[#E5C158] hover:text-[#0C2920] rounded"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// 04. BANARASI GOLD
const BanarasiGoldLayout: React.FC<LayoutProps> = ({ template, restaurant, categories, rawCategories, compact, onAddToCart, isPremium, activeCategory, setActiveCategory }) => {
  return (
    <div className="space-y-6">
      <div className="text-center py-4 px-5 border-2 border-[#FFD700]/40 bg-[#3A0D28] rounded-lg shadow-lg">
        <span className="text-[9px] uppercase tracking-[0.3em] text-[#FFD700] block mb-1">BANARASI SILK WEAVE COLLECTION</span>
        <h1 className={clsx('font-extrabold text-[#FFD700]', compact ? 'text-xl' : 'text-2xl sm:text-3xl')} style={{ fontFamily: template.typography.heading }}>
          {restaurant.name}
        </h1>
        <div className="h-0.5 w-14 bg-[#FFD700] mx-auto mt-2" />
      </div>

      {!compact && rawCategories.length > 1 && (
        <div className="flex justify-center gap-3 overflow-x-auto pb-1 text-xs text-[#FFD700]">
          <button type="button" onClick={() => setActiveCategory('all')} className={activeCategory === 'all' ? 'font-bold underline' : 'opacity-70 hover:opacity-100'}>All</button>
          {rawCategories.map((cat) => {
            const isActive = activeCategory === cat.id || activeCategory === cat.name;
            return (
              <React.Fragment key={cat.id}>
                <span>✦</span>
                <button type="button" onClick={() => setActiveCategory(cat.id)} className={isActive ? 'font-bold underline' : 'opacity-70 hover:opacity-100'}>{cat.name}</button>
              </React.Fragment>
            );
          })}
        </div>
      )}

      {categories.map((cat) => (
        <div key={cat.id} className="space-y-3">
          <div className="text-center">
            <h2 className="text-xs font-bold text-[#FFD700] uppercase tracking-widest" style={{ fontFamily: template.typography.heading }}>
              ✦ {cat.name} ✦
            </h2>
          </div>

          <div className="space-y-2.5">
            {cat.items.map((item) => (
              <div key={item.id} className="p-3 rounded border border-[#FFD700]/25 bg-[#3A0D28]/60 flex justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <DietIndicator type={item.dietType} compact={compact} color="#FFD700" />
                    <span className="font-bold text-xs sm:text-sm text-[#FFF9EF]" style={{ fontFamily: template.typography.heading }}>
                      {item.name}
                    </span>
                  </div>
                  {item.description && <p className="text-[11px] text-[#FFF9EF]/70 pl-5 mt-0.5">{item.description}</p>}
                </div>
                
                <RenderItemPrices
                  item={item}
                  accentColor="#FFD700"
                  textColor="#FFF9EF"
                  onAddToCart={onAddToCart}
                  isPremium={isPremium}
                  btnStyle="text-[10px] font-bold px-2 py-0.5 bg-[#FFD700] text-[#28081B] rounded hover:bg-yellow-300"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// 05. SOUTH INDIAN HERITAGE
const SouthIndianHeritageLayout: React.FC<LayoutProps> = ({ template, restaurant, categories, rawCategories, compact, onAddToCart, isPremium, activeCategory, setActiveCategory }) => {
  return (
    <div className="space-y-6">
      <div className="pb-3 border-b-2 border-[#6E1B1B]">
        <div className="h-2 w-full bg-[#6E1B1B] mb-2 flex justify-between px-1">
          <div className="w-2 h-2 bg-[#C28838]" />
          <div className="w-2 h-2 bg-[#C28838]" />
        </div>
        <div className="flex justify-between items-end">
          <div>
            <h1 className={clsx('font-black text-[#6E1B1B]', compact ? 'text-xl' : 'text-2xl sm:text-3xl')} style={{ fontFamily: template.typography.heading }}>
              {restaurant.name}
            </h1>
            <p className="text-xs text-[#274E37] font-medium">{restaurant.tagline || 'AUTHENTIC SOUTHERN KITCHEN'}</p>
          </div>
          <span className="text-[10px] font-bold text-[#C28838] uppercase tracking-wider">HERITAGE</span>
        </div>
      </div>

      {!compact && rawCategories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-[#C28838]/30">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx('px-3 py-1 text-xs font-bold uppercase tracking-wider border-b-2 transition-all', activeCategory === 'all' ? 'border-[#6E1B1B] text-[#6E1B1B]' : 'border-transparent text-slate-600')}
          >
            All
          </button>
          {rawCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={clsx('px-3 py-1 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap', activeCategory === cat.id ? 'border-[#6E1B1B] text-[#6E1B1B]' : 'border-transparent text-slate-600')}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {categories.map((cat) => (
        <div key={cat.id} className="space-y-3">
          <h2 className="font-bold text-[#6E1B1B] text-xs uppercase tracking-wider border-b border-[#C28838]/40 pb-1">
            {cat.name}
          </h2>
          <div className="space-y-2">
            {cat.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start py-2 border-b border-dashed border-slate-300 gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <DietIndicator type={item.dietType} compact={compact} color="#6E1B1B" />
                    <span className="font-bold text-xs sm:text-sm text-[#2C2C2C]">{item.name}</span>
                  </div>
                  {item.description && <p className="text-[11px] text-slate-600 pl-5 mt-0.5">{item.description}</p>}
                </div>
                
                <RenderItemPrices
                  item={item}
                  accentColor="#C28838"
                  textColor="#2C2C2C"
                  onAddToCart={onAddToCart}
                  isPremium={isPremium}
                  btnStyle="text-[10px] font-bold px-2 py-0.5 bg-[#6E1B1B] text-white rounded hover:bg-[#521313]"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// 06. INDIAN STREET KITCHEN
const IndianStreetKitchenLayout: React.FC<LayoutProps> = ({ template, restaurant, categories, rawCategories, compact, onAddToCart, isPremium, activeCategory, setActiveCategory }) => {
  return (
    <div className="space-y-5">
      <div className="bg-[#E85A2A] text-white p-4 sm:p-5 text-center rounded-xl shadow-md">
        <span className="px-2.5 py-0.5 bg-[#FFEB3B] text-black font-black text-[9px] uppercase tracking-wider rounded inline-block mb-1">
          VIBRANT STREET FLAVORS
        </span>
        <h1 className={clsx('font-black tracking-wider uppercase', compact ? 'text-2xl' : 'text-3xl sm:text-4xl')} style={{ fontFamily: template.typography.heading }}>
          {restaurant.name}
        </h1>
      </div>

      {!compact && rawCategories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx('px-3 py-1 rounded font-black text-xs uppercase tracking-wider transition-all', activeCategory === 'all' ? 'bg-[#E85A2A] text-white' : 'bg-slate-200 text-slate-800')}
          >
            All
          </button>
          {rawCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={clsx('px-3 py-1 rounded font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap', activeCategory === cat.id ? 'bg-[#E85A2A] text-white' : 'bg-slate-200 text-slate-800')}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {categories.map((cat) => (
        <div key={cat.id} className="space-y-3">
          <div className="inline-block px-3 py-1 bg-[#B81D1D] text-white rounded font-black text-xs uppercase tracking-wider">
            {cat.name}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cat.items.map((item) => (
              <div key={item.id} className="p-3.5 rounded-xl border-2 border-[#E85A2A]/30 bg-white shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      <DietIndicator type={item.dietType} compact={compact} />
                      <h3 className="font-black text-xs sm:text-sm text-slate-900 uppercase tracking-tight">{item.name}</h3>
                    </div>
                  </div>
                  {item.description && <p className="text-[11px] text-slate-600 mt-1">{item.description}</p>}
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <RenderItemPrices
                    item={item}
                    accentColor="#E85A2A"
                    textColor="#1C1C1C"
                    onAddToCart={onAddToCart}
                    isPremium={isPremium}
                    btnStyle="text-[10px] font-black px-2 py-0.5 bg-[#B81D1D] text-white rounded hover:bg-red-800"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// 07. MODERN INDIA
const ModernIndiaLayout: React.FC<LayoutProps> = ({ template, restaurant, categories, rawCategories, compact, onAddToCart, isPremium, activeCategory, setActiveCategory }) => {
  return (
    <div className={clsx('bg-[#F4F4F4] text-[#111111] relative overflow-hidden', compact ? 'space-y-3 p-1' : 'space-y-6 p-3 sm:p-5')}>
      <div className={clsx('border-b-2 border-[#111111] relative z-10 flex flex-col justify-between items-start gap-2', compact ? 'pb-2' : 'pb-4 sm:flex-row sm:items-end')}>
        <div>
          <span className="text-[10px] text-[#E8783C] font-mono tracking-[0.2em] uppercase font-bold mb-0.5 block">
            Vol. 1 — Culinary Edit
          </span>
          <h1 className={clsx('font-black text-[#111111] tracking-tighter uppercase leading-none', compact ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-5xl')} style={{ fontFamily: template.typography.heading }}>
            {restaurant.name}
          </h1>
        </div>
        {restaurant.tagline && (
          <p className="text-slate-500 font-serif italic border-l-2 border-[#E8783C] pl-3 py-0.5 text-xs max-w-[200px]">
            {restaurant.tagline}
          </p>
        )}
      </div>

      {/* Numbered Category Tabs */}
      {!compact && rawCategories.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-1 text-xs font-mono border-b border-black/10">
          <button type="button" onClick={() => setActiveCategory('all')} className={activeCategory === 'all' ? 'font-bold text-[#E8783C] border-b-2 border-[#E8783C]' : 'text-slate-600'}>00 ALL</button>
          {rawCategories.map((cat, idx) => {
            const isActive = activeCategory === cat.id || activeCategory === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={clsx('whitespace-nowrap pb-1 transition-all', isActive ? 'font-bold text-[#E8783C] border-b-2 border-[#E8783C]' : 'text-slate-600')}
              >
                {String(idx + 1).padStart(2, '0')} {cat.name.toUpperCase()}
              </button>
            );
          })}
        </div>
      )}

      {/* Feature Block */}
      <div className="bg-[#111111] text-white p-4 sm:p-6 border-t-4 border-[#E8783C] relative overflow-hidden mb-4">
        <h2 className="text-lg sm:text-xl font-black uppercase mb-1" style={{ fontFamily: template.typography.heading }}>The Experience</h2>
        <p className="text-xs text-slate-400 font-serif italic">Artisanal modern Indian creations crafted for the contemporary palate.</p>
      </div>

      <div className={clsx('grid grid-cols-1 z-10 relative gap-6', compact ? 'gap-3' : 'md:grid-cols-2')}>
        {categories.map((cat, idx) => (
          <div key={cat.id} className="relative">
            <div className="flex items-end gap-2 mb-3 border-b border-black/15 pb-1.5">
              <span className="font-black text-slate-400 tracking-tighter text-xl sm:text-2xl">{String(idx + 1).padStart(2, '0')}</span>
              <h2 className="font-black text-[#111111] uppercase tracking-widest text-sm sm:text-base" style={{ fontFamily: template.typography.heading }}>
                {cat.name}
              </h2>
            </div>
            
            <div className="grid gap-2.5 grid-cols-1">
              {cat.items.map((item) => (
                <div key={item.id} className="group relative bg-white border border-slate-200 p-3 hover:border-[#111111] hover:shadow-[5px_5px_0px_0px_rgba(232,120,60,1)] transition-all">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <DietIndicator type={item.dietType} compact={compact} color="#111111" />
                        <span className="font-bold text-[#111111] uppercase tracking-tight text-xs sm:text-sm">{item.name}</span>
                      </div>
                      {item.description && <p className="text-slate-600 font-serif text-[11px] leading-relaxed">{item.description}</p>}
                    </div>
                    
                    <RenderItemPrices
                      item={item}
                      accentColor="#111111"
                      textColor="#111111"
                      onAddToCart={onAddToCart}
                      isPremium={isPremium}
                      btnStyle="bg-[#E8783C] text-white font-bold px-2 py-0.5 text-xs hover:bg-[#d4652a]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 08. SPICE HOUSE
const SpiceHouseLayout: React.FC<LayoutProps> = ({ template, restaurant, categories, rawCategories, compact, onAddToCart, isPremium, activeCategory, setActiveCategory }) => {
  return (
    <div className="space-y-5">
      <div className="pb-3 border-b border-[#E68A00]/40">
        <span className="text-[10px] text-[#E68A00] font-mono tracking-widest uppercase block mb-0.5">FOOD-FIRST MAGAZINE</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#FFFDF8] tracking-tight uppercase" style={{ fontFamily: template.typography.heading }}>
          {restaurant.name}
        </h1>
        {restaurant.tagline && <p className="text-xs text-[#D7CCC8] mt-0.5">{restaurant.tagline}</p>}
      </div>

      {!compact && rawCategories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx('px-3 py-1 rounded text-xs font-bold uppercase transition-all', activeCategory === 'all' ? 'bg-[#E68A00] text-[#2B1B17]' : 'bg-[#3C2923] text-[#D7CCC8]')}
          >
            All
          </button>
          {rawCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={clsx('px-3 py-1 rounded text-xs font-bold uppercase transition-all whitespace-nowrap', activeCategory === cat.id ? 'bg-[#E68A00] text-[#2B1B17]' : 'bg-[#3C2923] text-[#D7CCC8]')}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {categories.map((cat) => (
        <div key={cat.id} className="space-y-3">
          <h2 className="text-xs font-bold text-[#E68A00] uppercase tracking-wider border-b border-[#E68A00]/20 pb-1">{cat.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cat.items.map((item) => (
              <div key={item.id} className="p-3 rounded bg-[#3C2923] border border-[#E68A00]/20 flex flex-col justify-between relative overflow-hidden">
                <span className="text-[#E68A00]/10 font-mono text-5xl font-black italic absolute -right-2 -bottom-2 select-none pointer-events-none">{item.name.charAt(0)}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <DietIndicator type={item.dietType} compact={compact} color="#E68A00" />
                    <h3 className="font-bold text-xs sm:text-sm text-[#FFFDF8]">{item.name}</h3>
                  </div>
                  {item.description && <p className="text-[11px] text-[#D7CCC8] leading-relaxed">{item.description}</p>}
                </div>
                <div className="mt-3 flex justify-between items-center relative z-10">
                  <RenderItemPrices
                    item={item}
                    accentColor="#E68A00"
                    textColor="#FFFDF8"
                    onAddToCart={onAddToCart}
                    isPremium={isPremium}
                    btnStyle="text-[10px] font-bold px-2 py-0.5 bg-[#E68A00] text-[#2B1B17] rounded hover:bg-amber-400"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// 09. MAISON NOIR
const MaisonNoirLayout: React.FC<LayoutProps> = ({ template, restaurant, categories, rawCategories, compact, onAddToCart, isPremium, activeCategory, setActiveCategory }) => {
  return (
    <div className="space-y-8 py-4 px-2 sm:px-6 bg-[#0A0A0A] text-[#E0E0E0] min-h-full relative">
      <div className="flex flex-col items-center justify-center pb-6 border-b border-white/10">
        <div className="w-px h-10 bg-gradient-to-b from-transparent via-[#D4AF37] to-transparent mb-3" />
        <p className="text-[8px] font-mono tracking-[0.4em] text-[#888888] uppercase mb-1">TASTING MENU</p>
        <h1 className={clsx('font-light tracking-[0.2em] uppercase text-transparent bg-clip-text bg-gradient-to-b from-[#FFFFFF] to-[#A0A0A0]', compact ? 'text-xl' : 'text-2xl sm:text-4xl')} style={{ fontFamily: template.typography.heading }}>
          {restaurant.name}
        </h1>
        {restaurant.tagline && <p className="text-[10px] tracking-[0.25em] uppercase text-[#D4AF37] mt-2 font-light">{restaurant.tagline}</p>}
      </div>

      {!compact && rawCategories.length > 1 && (
        <div className="flex justify-center gap-4 overflow-x-auto pb-1 text-xs tracking-widest font-light text-[#888888]">
          <button type="button" onClick={() => setActiveCategory('all')} className={activeCategory === 'all' ? 'text-[#D4AF37] font-normal underline' : 'hover:text-white'}>ALL</button>
          {rawCategories.map((cat) => (
            <button key={cat.id} type="button" onClick={() => setActiveCategory(cat.id)} className={activeCategory === cat.id ? 'text-[#D4AF37] font-normal underline' : 'hover:text-white'}>{cat.name.toUpperCase()}</button>
          ))}
        </div>
      )}

      <div className="space-y-10">
        {categories.map((cat) => (
          <div key={cat.id} className="space-y-5">
            <div className="text-center flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-white/10" />
              <h2 className="text-[10px] sm:text-xs font-light text-[#D4AF37] uppercase tracking-[0.35em]" style={{ fontFamily: template.typography.heading }}>
                {cat.name}
              </h2>
              <div className="h-px w-8 bg-white/10" />
            </div>

            <div className="space-y-3">
              {cat.items.map((item) => (
                <div key={item.id} className="group relative py-2 pl-3 pr-1 transition-colors duration-300 hover:bg-white/[0.03] rounded-r">
                  <div className="flex items-end justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-[#D4AF37] opacity-70">
                          {item.dietType === 'veg' ? 'V' : 'NV'}
                        </span>
                        <h3 className="font-serif text-xs sm:text-sm text-[#F4EFEA] tracking-wider font-normal">
                          {item.name}
                        </h3>
                      </div>
                      {item.description && <p className="text-[11px] text-[#888888] font-light mt-0.5 pl-4 leading-relaxed font-sans">{item.description}</p>}
                    </div>

                    <RenderItemPrices
                      item={item}
                      accentColor="#D4AF37"
                      textColor="#F4EFEA"
                      onAddToCart={onAddToCart}
                      isPremium={isPremium}
                      btnStyle="text-[10px] font-light px-2 py-0.5 border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0A0A]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 10. IVORY DINING
const IvoryDiningLayout: React.FC<LayoutProps> = ({ template, restaurant, categories, rawCategories, compact, onAddToCart, isPremium, activeCategory, setActiveCategory }) => {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-300 text-left">
        <span className="text-[10px] text-[#8B7355] font-serif uppercase tracking-widest block mb-1">FINE DINING</span>
        <h1 className={clsx('text-[#111111] font-serif', compact ? 'text-xl' : 'text-2xl sm:text-3xl')} style={{ fontFamily: template.typography.heading }}>
          {restaurant.name}
        </h1>
        {restaurant.tagline && <p className="text-xs text-slate-500 mt-1 font-sans">{restaurant.tagline}</p>}
      </div>

      {!compact && rawCategories.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-1 text-xs font-serif">
          <button type="button" onClick={() => setActiveCategory('all')} className={activeCategory === 'all' ? 'text-[#8B7355] font-bold underline' : 'text-slate-600'}>All</button>
          {rawCategories.map((cat) => (
            <button key={cat.id} type="button" onClick={() => setActiveCategory(cat.id)} className={activeCategory === cat.id ? 'text-[#8B7355] font-bold underline' : 'text-slate-600'}>{cat.name}</button>
          ))}
        </div>
      )}

      {categories.map((cat) => (
        <div key={cat.id} className="space-y-3">
          <h2 className="text-xs font-bold text-[#8B7355] uppercase tracking-wider border-b border-[#8B7355]/30 pb-1">
            {cat.name}
          </h2>
          <div className="space-y-2.5">
            {cat.items.map((item) => (
              <div key={item.id} className="py-2 border-b border-slate-100 flex justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <DietIndicator type={item.dietType} compact={compact} color="#111111" />
                    <span className="font-bold text-xs sm:text-sm text-[#111111]" style={{ fontFamily: template.typography.heading }}>
                      {item.name}
                    </span>
                  </div>
                  {item.description && <p className="text-[11px] text-slate-500 pl-5 mt-0.5">{item.description}</p>}
                </div>
                
                <RenderItemPrices
                  item={item}
                  accentColor="#111111"
                  textColor="#111111"
                  onAddToCart={onAddToCart}
                  isPremium={isPremium}
                  btnStyle="text-[10px] font-bold px-2 py-0.5 bg-[#8B7355] text-white rounded hover:bg-[#6f5b43]"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// 11. GRAND TABLE
const GrandTableLayout: React.FC<LayoutProps> = ({ template, restaurant, categories, rawCategories, compact, onAddToCart, isPremium, activeCategory, setActiveCategory }) => {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-[#133D2F] border border-[#D4AF37]/40 p-5 text-center shadow-lg relative">
        <div className="w-9 h-9 border border-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-1.5 text-[#D4AF37] font-serif text-xs font-bold">
          {restaurant.name.charAt(0)}
        </div>
        <span className="text-[8px] font-mono text-[#D4AF37] uppercase tracking-widest block mb-0.5">LUXURY HOTEL DINING</span>
        <h1 className={clsx('font-bold text-[#FFFDF5]', compact ? 'text-xl' : 'text-2xl sm:text-3xl')} style={{ fontFamily: template.typography.heading }}>
          {restaurant.name}
        </h1>
        {restaurant.tagline && <p className="text-xs text-[#B5C4BE] mt-0.5 font-serif">{restaurant.tagline}</p>}
      </div>

      {!compact && rawCategories.length > 1 && (
        <div className="flex justify-center gap-3 overflow-x-auto pb-1 text-xs font-serif text-[#D4AF37]">
          <button type="button" onClick={() => setActiveCategory('all')} className={activeCategory === 'all' ? 'font-bold border-b border-[#D4AF37]' : 'opacity-70'}>All</button>
          {rawCategories.map((cat) => (
            <button key={cat.id} type="button" onClick={() => setActiveCategory(cat.id)} className={activeCategory === cat.id ? 'font-bold border-b border-[#D4AF37]' : 'opacity-70'}>{cat.name}</button>
          ))}
        </div>
      )}

      {categories.map((cat) => (
        <div key={cat.id} className="space-y-3">
          <h2 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest border-b border-[#D4AF37]/40 pb-1">
            {cat.name}
          </h2>
          <div className="space-y-2.5">
            {cat.items.map((item) => (
              <div key={item.id} className="p-3 rounded bg-[#133D2F]/80 border border-[#D4AF37]/25 flex justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <DietIndicator type={item.dietType} compact={compact} color="#D4AF37" />
                    <span className="font-bold text-xs sm:text-sm text-[#FFFDF5]" style={{ fontFamily: template.typography.heading }}>
                      {item.name}
                    </span>
                  </div>
                  {item.description && <p className="text-[11px] text-[#B5C4BE] pl-5 mt-0.5">{item.description}</p>}
                </div>
                
                <RenderItemPrices
                  item={item}
                  accentColor="#D4AF37"
                  textColor="#FFFDF5"
                  onAddToCart={onAddToCart}
                  isPremium={isPremium}
                  btnStyle="text-[10px] font-bold px-2 py-0.5 bg-[#D4AF37] text-[#0B2B20] rounded hover:bg-amber-300"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// 12. COFFEE HOUSE
const CoffeeHouseLayout: React.FC<LayoutProps> = ({ template, restaurant, categories, rawCategories, compact, onAddToCart, isPremium, activeCategory, setActiveCategory }) => {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-dashed border-[#E0A96D]/50 flex justify-between items-center">
        <div>
          <span className="text-[10px] font-bold text-[#E0A96D] uppercase tracking-widest">ARTISAN ROASTERY</span>
          <h1 className={clsx('font-bold text-[#FFFDF7]', compact ? 'text-xl' : 'text-2xl sm:text-3xl')} style={{ fontFamily: template.typography.heading }}>
            {restaurant.name}
          </h1>
          {restaurant.tagline && <p className="text-xs text-[#E0A96D]/80 mt-0.5">{restaurant.tagline}</p>}
        </div>
        <div className="w-9 h-9 rounded-full border border-[#E0A96D]/40 flex items-center justify-center text-[#E0A96D] text-base shrink-0">
          ☕
        </div>
      </div>

      {!compact && rawCategories.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 text-xs text-[#E0A96D]">
          <button type="button" onClick={() => setActiveCategory('all')} className={activeCategory === 'all' ? 'font-bold underline' : 'opacity-70'}>All</button>
          {rawCategories.map((cat) => (
            <button key={cat.id} type="button" onClick={() => setActiveCategory(cat.id)} className={activeCategory === cat.id ? 'font-bold underline' : 'opacity-70'}>{cat.name}</button>
          ))}
        </div>
      )}

      {categories.map((cat) => (
        <div key={cat.id} className="space-y-3">
          <h2 className="text-sm sm:text-base font-bold text-[#E0A96D] border-b border-white/10 pb-1" style={{ fontFamily: template.typography.heading }}>
            {cat.name}
          </h2>
          <div className="space-y-2">
            {cat.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start py-2 border-b border-white/5 gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <DietIndicator type={item.dietType} compact={compact} color="#E0A96D" />
                    <span className="text-xs sm:text-sm text-[#FFFDF7] font-medium">{item.name}</span>
                  </div>
                  {item.description && <p className="text-[11px] text-white/60 pl-5 mt-0.5">{item.description}</p>}
                </div>
                
                <RenderItemPrices
                  item={item}
                  accentColor="#E0A96D"
                  textColor="#FFFDF7"
                  onAddToCart={onAddToCart}
                  isPremium={isPremium}
                  btnStyle="text-[10px] font-bold px-2 py-0.5 bg-[#E0A96D] text-[#2E1C14] rounded hover:bg-amber-300"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// 13. PAPER CAFE
const PaperCafeLayout: React.FC<LayoutProps> = ({ template, restaurant, categories, rawCategories, compact, onAddToCart, isPremium, activeCategory, setActiveCategory }) => {
  return (
    <div className="space-y-6">
      <div className="text-center pb-4 border-b-2 border-dashed border-[#2C2621]/30">
        <h1 className={clsx('font-bold text-[#2C2621]', compact ? 'text-2xl' : 'text-3xl sm:text-4xl')} style={{ fontFamily: template.typography.heading }}>
          {restaurant.name}
        </h1>
        <p className="text-xs text-[#A65628] mt-0.5 font-semibold">freshly prepared • local ingredients</p>
      </div>

      {!compact && rawCategories.length > 1 && (
        <div className="flex justify-center gap-3 overflow-x-auto pb-1 text-sm font-bold text-[#2C2621]">
          <button type="button" onClick={() => setActiveCategory('all')} className={activeCategory === 'all' ? 'text-[#A65628] underline' : 'opacity-70'}>All</button>
          {rawCategories.map((cat) => (
            <button key={cat.id} type="button" onClick={() => setActiveCategory(cat.id)} className={activeCategory === cat.id ? 'text-[#A65628] underline' : 'opacity-70'}>{cat.name}</button>
          ))}
        </div>
      )}

      {categories.map((cat) => (
        <div key={cat.id} className="space-y-3">
          <h2 className="text-lg sm:text-2xl font-bold text-[#2C2621]" style={{ fontFamily: template.typography.heading }}>
            {cat.name}
          </h2>
          <div className="space-y-2">
            {cat.items.map((item) => (
              <div key={item.id} className="py-2 border-b border-dotted border-[#2C2621]/30 flex justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <DietIndicator type={item.dietType} compact={compact} color="#2C2621" />
                    <span className="text-xs sm:text-sm font-bold text-[#2C2621]">{item.name}</span>
                  </div>
                  {item.description && <p className="text-[11px] text-[#6E6258] pl-5 mt-0.5">{item.description}</p>}
                </div>
                
                <RenderItemPrices
                  item={item}
                  accentColor="#A65628"
                  textColor="#2C2621"
                  onAddToCart={onAddToCart}
                  isPremium={isPremium}
                  btnStyle="text-[10px] font-bold px-2 py-0.5 bg-[#A65628] text-white rounded hover:bg-[#85431d]"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// 14. BOMBAY STREET
const BombayStreetLayout: React.FC<LayoutProps> = ({ template, restaurant, categories, rawCategories, compact, onAddToCart, isPremium, activeCategory, setActiveCategory }) => {
  return (
    <div className="space-y-6 p-1 sm:p-2 bg-[repeating-linear-gradient(45deg,#fafafa,#fafafa_10px,#f0f0f0_10px,#f0f0f0_20px)] text-[#1C1C1C]">
      {/* Street Sign Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-[#000000] translate-x-1.5 translate-y-1.5 rounded-xl" />
        <div className="bg-[#FFEB3B] border-3 sm:border-4 border-[#000000] p-4 rounded-xl relative z-10 text-center transform -rotate-1">
          <h1 className={clsx('font-black text-[#000000] uppercase tracking-tighter leading-none', compact ? 'text-2xl' : 'text-3xl sm:text-4xl')} style={{ fontFamily: template.typography.heading }}>
            {restaurant.name}
          </h1>
          <div className="inline-block bg-[#E32636] text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase mt-2 border-2 border-black transform rotate-2">
            {restaurant.tagline || 'STREET FOOD REVOLUTION'}
          </div>
        </div>
      </div>

      {/* Rotated Sticker Category Nav */}
      {!compact && rawCategories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx('px-3 py-1 font-black text-xs uppercase border-2 border-black transition-all whitespace-nowrap', activeCategory === 'all' ? 'bg-[#FFEB3B] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-black')}
          >
            All
          </button>
          {rawCategories.map((cat, idx) => {
            const badgeColors = ['bg-[#00C853]', 'bg-[#2979FF]', 'bg-[#FF9100]', 'bg-[#E040FB]'];
            const catColor = badgeColors[idx % badgeColors.length];
            const isActive = activeCategory === cat.id || activeCategory === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={clsx('px-3 py-1 font-black text-xs uppercase border-2 border-black transition-all whitespace-nowrap text-white', isActive ? `${catColor} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]` : 'bg-slate-700')}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      <div className="space-y-6 relative z-10">
        {categories.map((cat, idx) => {
          const badgeColors = ['bg-[#00C853]', 'bg-[#2979FF]', 'bg-[#FF9100]', 'bg-[#E040FB]'];
          const catColor = badgeColors[idx % badgeColors.length];

          return (
            <div key={cat.id} className="space-y-3">
              <div className="flex justify-start">
                <div className={clsx('inline-block px-3 py-1 text-white font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transform -rotate-1', catColor)}>
                  {cat.name}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cat.items.map((item) => (
                  <div key={item.id} className="p-3 bg-white border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between relative">
                    {item.isBestseller && (
                      <div className="absolute -right-4 top-2 bg-[#FFEB3B] text-black font-black text-[8px] uppercase py-0.5 px-4 transform rotate-45 border-y border-black z-10">
                        HIT!
                      </div>
                    )}
                    
                    <div>
                      <div className="flex items-start gap-2 pr-3">
                        <DietIndicator type={item.dietType} compact={compact} color="#000000" />
                        <h3 className="font-black text-xs sm:text-sm text-black uppercase leading-tight">{item.name}</h3>
                      </div>
                      {item.description && (
                        <p className="text-[11px] text-slate-700 mt-1.5 font-bold bg-slate-100 p-1 border-l-2 border-black">
                          {item.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 pt-1.5 border-t border-slate-200">
                      <RenderItemPrices
                        item={item}
                        accentColor="#E32636"
                        textColor="#1C1C1C"
                        onAddToCart={onAddToCart}
                        isPremium={isPremium}
                        btnStyle="bg-[#000000] text-white font-black text-[10px] px-2 py-0.5 uppercase rounded hover:bg-slate-800"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 15. MINIMAL EDITORIAL
const MinimalEditorialLayout: React.FC<LayoutProps> = ({ template, restaurant, categories, rawCategories, compact, onAddToCart, isPremium, activeCategory, setActiveCategory }) => {
  return (
    <div className="space-y-6">
      <div className="pb-3 border-b-2 border-slate-900 flex justify-between items-end">
        <div>
          <span className="text-[9px] font-mono text-[#E8783C] uppercase tracking-widest font-bold block mb-0.5">DIGITAL MENU</span>
          <h1 className={clsx('font-black text-slate-900 tracking-tight', compact ? 'text-xl' : 'text-2xl sm:text-3xl')} style={{ fontFamily: template.typography.heading }}>
            {restaurant.name}
          </h1>
          {restaurant.tagline && <p className="text-xs text-slate-500 mt-0.5 font-sans">{restaurant.tagline}</p>}
        </div>
      </div>

      {!compact && rawCategories.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-1 text-xs font-mono uppercase tracking-wider border-b border-slate-200">
          <button type="button" onClick={() => setActiveCategory('all')} className={activeCategory === 'all' ? 'font-bold text-[#E8783C] border-b-2 border-[#E8783C]' : 'text-slate-500'}>All</button>
          {rawCategories.map((cat) => (
            <button key={cat.id} type="button" onClick={() => setActiveCategory(cat.id)} className={activeCategory === cat.id ? 'font-bold text-[#E8783C] border-b-2 border-[#E8783C]' : 'text-slate-500'}>{cat.name}</button>
          ))}
        </div>
      )}

      {categories.map((cat) => (
        <div key={cat.id} className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1">
            {cat.name}
          </h2>
          <div className="space-y-2">
            {cat.items.map((item) => (
              <div key={item.id} className="py-2 border-b border-slate-100 flex justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <DietIndicator type={item.dietType} compact={compact} color="#18181B" />
                    <span className="font-bold text-xs sm:text-sm text-slate-900">{item.name}</span>
                  </div>
                  {item.description && <p className="text-[11px] text-slate-500 pl-5 mt-0.5">{item.description}</p>}
                </div>
                
                <RenderItemPrices
                  item={item}
                  accentColor="#E8783C"
                  textColor="#18181B"
                  onAddToCart={onAddToCart}
                  isPremium={isPremium}
                  btnStyle="text-[10px] font-bold px-2 py-0.5 bg-[#18181B] text-white rounded hover:bg-slate-700"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// 16. CHALKBOARD BISTRO
const ChalkBistroLayout: React.FC<LayoutProps> = ({ template, restaurant, categories, rawCategories, compact, onAddToCart, isPremium, activeCategory, setActiveCategory }) => {
  return (
    <div className="space-y-5 p-3 sm:p-4 rounded-xl bg-[#212121] text-[#F5F5F5] border-2 border-[#E5DF39]/30">
      <div className="text-center pb-3 border-b border-dashed border-[#E5DF39]/40">
        <span className="text-[#E5DF39] text-[9px] font-bold uppercase tracking-[0.3em]">ARTISAN BISTRO</span>
        <h1 className={clsx('font-black text-[#F5F5F5] uppercase tracking-wider', compact ? 'text-xl' : 'text-2xl sm:text-3xl')} style={{ fontFamily: template.typography.heading }}>
          {restaurant.name}
        </h1>
        {restaurant.tagline && <p className="text-xs text-[#E5DF39] font-bold mt-0.5 uppercase tracking-widest">{restaurant.tagline}</p>}
      </div>

      {!compact && rawCategories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button type="button" onClick={() => setActiveCategory('all')} className={clsx('px-3 py-1 rounded text-xs font-bold uppercase', activeCategory === 'all' ? 'bg-[#E5DF39] text-[#212121]' : 'bg-[#2A2A2A] text-[#F5F5F5]')}>All</button>
          {rawCategories.map((cat) => (
            <button key={cat.id} type="button" onClick={() => setActiveCategory(cat.id)} className={clsx('px-3 py-1 rounded text-xs font-bold uppercase whitespace-nowrap', activeCategory === cat.id ? 'bg-[#E5DF39] text-[#212121]' : 'bg-[#2A2A2A] text-[#F5F5F5]')}>{cat.name}</button>
          ))}
        </div>
      )}

      {categories.map((cat) => (
        <div key={cat.id} className="space-y-3">
          <div className="inline-block bg-[#E5DF39] text-[#212121] px-3 py-0.5 font-black text-xs uppercase tracking-widest transform -rotate-1 rounded-sm">
            {cat.name}
          </div>
          <div className="space-y-2">
            {cat.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start py-2 border-b border-white/10 gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <DietIndicator type={item.dietType} compact={compact} color="#E5DF39" />
                    <span className="font-bold text-xs sm:text-sm text-[#F5F5F5]">{item.name}</span>
                  </div>
                  {item.description && <p className="text-[11px] text-[#A0A0A0] pl-5 mt-0.5 italic">{item.description}</p>}
                </div>
                <RenderItemPrices
                  item={item}
                  accentColor="#E5DF39"
                  textColor="#F5F5F5"
                  onAddToCart={onAddToCart}
                  isPremium={isPremium}
                  btnStyle="text-[10px] font-bold px-2 py-0.5 bg-[#E5DF39] text-[#212121] rounded hover:bg-yellow-300"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// 17. FLUID ABSTRACT
const FluidAbstractLayout: React.FC<LayoutProps> = ({ template, restaurant, categories, rawCategories, compact, onAddToCart, isPremium, activeCategory, setActiveCategory }) => {
  return (
    <div className="space-y-5 bg-[#F5F0E6] text-[#221A16] p-3 sm:p-4 rounded-xl border border-black/10">
      <div className="text-center pb-3 border-b border-[#E27522]/30">
        <h1 className={clsx('font-black text-[#221A16] tracking-tighter', compact ? 'text-xl' : 'text-2xl sm:text-3xl')} style={{ fontFamily: template.typography.heading }}>
          {restaurant.name}
        </h1>
        {restaurant.tagline && <p className="text-xs text-[#E27522] font-bold mt-0.5">{restaurant.tagline}</p>}
      </div>

      {!compact && rawCategories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button type="button" onClick={() => setActiveCategory('all')} className={clsx('px-3 py-1 rounded-full text-xs font-bold transition-all', activeCategory === 'all' ? 'bg-[#E27522] text-white' : 'bg-white text-[#221A16]')}>All</button>
          {rawCategories.map((cat) => (
            <button key={cat.id} type="button" onClick={() => setActiveCategory(cat.id)} className={clsx('px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap', activeCategory === cat.id ? 'bg-[#E27522] text-white' : 'bg-white text-[#221A16]')}>{cat.name}</button>
          ))}
        </div>
      )}

      {categories.map((cat) => (
        <div key={cat.id} className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#E27522] border-b border-[#E27522]/20 pb-1">{cat.name}</h2>
          <div className="space-y-2">
            {cat.items.map((item) => (
              <div key={item.id} className="p-3 bg-white/80 rounded-xl border border-[#E27522]/20 flex justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <DietIndicator type={item.dietType} compact={compact} color="#E27522" />
                    <span className="font-bold text-xs sm:text-sm text-[#221A16]">{item.name}</span>
                  </div>
                  {item.description && <p className="text-[11px] text-[#64544A] pl-5 mt-0.5">{item.description}</p>}
                </div>
                <RenderItemPrices
                  item={item}
                  accentColor="#E27522"
                  textColor="#221A16"
                  onAddToCart={onAddToCart}
                  isPremium={isPremium}
                  btnStyle="text-[10px] font-bold px-2 py-0.5 bg-[#E27522] text-white rounded hover:bg-[#d05615]"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// 18. DARK CLIPBOARD
const DarkClipboardLayout: React.FC<LayoutProps> = ({ template, restaurant, categories, rawCategories, compact, onAddToCart, isPremium, activeCategory, setActiveCategory }) => {
  return (
    <div className="space-y-5 bg-[#111214] text-[#E0E0E0] p-3 sm:p-4 rounded-xl border-t-6 border-[#F26D21]">
      <div className="pb-3 border-b border-white/10">
        <span className="text-[9px] text-[#F26D21] font-mono tracking-widest uppercase block mb-0.5">CLIPBOARD MENU</span>
        <h1 className={clsx('font-black text-white uppercase tracking-tight', compact ? 'text-xl' : 'text-2xl sm:text-3xl')} style={{ fontFamily: template.typography.heading }}>
          {restaurant.name}
        </h1>
        {restaurant.tagline && <p className="text-xs text-white/60 mt-0.5">{restaurant.tagline}</p>}
      </div>

      {!compact && rawCategories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-mono">
          <button type="button" onClick={() => setActiveCategory('all')} className={activeCategory === 'all' ? 'text-[#F26D21] font-bold underline' : 'text-white/60'}>ALL</button>
          {rawCategories.map((cat) => (
            <button key={cat.id} type="button" onClick={() => setActiveCategory(cat.id)} className={activeCategory === cat.id ? 'text-[#F26D21] font-bold underline' : 'text-white/60'}>{cat.name.toUpperCase()}</button>
          ))}
        </div>
      )}

      {categories.map((cat) => (
        <div key={cat.id} className="space-y-3">
          <h2 className="text-xs font-black text-[#F26D21] uppercase tracking-wider">{cat.name}</h2>
          <div className="space-y-2">
            {cat.items.map((item) => (
              <div key={item.id} className="p-3 bg-[#1A1C1F] rounded-lg border border-white/10 flex justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <DietIndicator type={item.dietType} compact={compact} color="#F26D21" />
                    <span className="font-bold text-xs sm:text-sm text-white">{item.name}</span>
                  </div>
                  {item.description && <p className="text-[11px] text-white/60 pl-5 mt-0.5">{item.description}</p>}
                </div>
                <RenderItemPrices
                  item={item}
                  accentColor="#F26D21"
                  textColor="#E0E0E0"
                  onAddToCart={onAddToCart}
                  isPremium={isPremium}
                  btnStyle="text-[10px] font-bold px-2 py-0.5 bg-[#F26D21] text-white rounded hover:bg-orange-600"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MenuTemplateRenderer;
