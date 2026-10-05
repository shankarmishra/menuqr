import React from 'react';
import clsx from 'clsx';
import { menuTemplates, type MenuTemplate } from '../../data/menuTemplates';

interface MenuTemplateRendererProps {
  templateId: string;
  restaurant: {
    name: string;
    tagline?: string;
    cuisine?: string;
    phone?: string;
    address?: string;
    logo?: string;
  };
  categories: Array<{ id: string; name: string; order: number }>;
  items: Array<{
    id: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    dietType: 'veg' | 'non-veg';
    available: boolean;
    image?: string;
    isBestseller?: boolean;
  }>;
  compact?: boolean;
  className?: string;
}

const DietIndicator: React.FC<{ type: 'veg' | 'non-veg'; compact?: boolean; color?: string }> = ({
  type,
  compact = false,
  color,
}) => {
  const isVeg = type === 'veg';
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

export const MenuTemplateRenderer: React.FC<MenuTemplateRendererProps> = ({
  templateId,
  restaurant,
  categories,
  items,
  compact = false,
  className,
}) => {
  const template = menuTemplates.find((t) => t.id === templateId) || menuTemplates[0];

  // Group items by category
  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);
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

  const { colors, typography, decorations } = template;

  // Master Render Switch per Template ID for 100% Unique Visual Systems
  const renderTemplateBody = () => {
    switch (template.id) {
      case 'royal-maharaja':
        return <RoyalMaharajaLayout template={template} restaurant={restaurant} categories={finalCategories} compact={compact} />;
      case 'rajasthani-heritage':
        return <RajasthaniHeritageLayout template={template} restaurant={restaurant} categories={finalCategories} compact={compact} />;
      case 'mughal-luxe':
        return <MughalLuxeLayout template={template} restaurant={restaurant} categories={finalCategories} compact={compact} />;
      case 'banarasi-gold':
        return <BanarasiGoldLayout template={template} restaurant={restaurant} categories={finalCategories} compact={compact} />;
      case 'south-indian-heritage':
        return <SouthIndianHeritageLayout template={template} restaurant={restaurant} categories={finalCategories} compact={compact} />;
      case 'indian-street-kitchen':
        return <IndianStreetKitchenLayout template={template} restaurant={restaurant} categories={finalCategories} compact={compact} />;
      case 'modern-india':
        return <ModernIndiaLayout template={template} restaurant={restaurant} categories={finalCategories} compact={compact} />;
      case 'spice-house':
        return <SpiceHouseLayout template={template} restaurant={restaurant} categories={finalCategories} compact={compact} />;
      case 'maison-noir':
        return <MaisonNoirLayout template={template} restaurant={restaurant} categories={finalCategories} compact={compact} />;
      case 'ivory-dining':
        return <IvoryDiningLayout template={template} restaurant={restaurant} categories={finalCategories} compact={compact} />;
      case 'grand-table':
        return <GrandTableLayout template={template} restaurant={restaurant} categories={finalCategories} compact={compact} />;
      case 'coffee-house':
        return <CoffeeHouseLayout template={template} restaurant={restaurant} categories={finalCategories} compact={compact} />;
      case 'paper-cafe':
        return <PaperCafeLayout template={template} restaurant={restaurant} categories={finalCategories} compact={compact} />;
      case 'bombay-street':
        return <BombayStreetLayout template={template} restaurant={restaurant} categories={finalCategories} compact={compact} />;
      case 'minimal-editorial':
      default:
        return <MinimalEditorialLayout template={template} restaurant={restaurant} categories={finalCategories} compact={compact} />;
    }
  };

  return (
    <div
      className={clsx(
        'relative w-full h-full overflow-y-auto select-none transition-colors duration-300 font-sans',
        compact ? 'p-3 text-xs' : 'p-6 sm:p-8 md:p-10 text-sm',
        className
      )}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        fontFamily: typography.body,
      }}
    >
      {/* Background Texture Pattern */}
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
        </div>
      )}

      {/* Decorative Outer Border */}
      {decorations.borderStyle !== 'none' && (
        <div
          className="absolute inset-3 sm:inset-4 pointer-events-none z-10"
          style={{
            border: `1.5px solid ${colors.border}`,
            boxShadow: template.id === 'royal-maharaja' ? `inset 0 0 0 3px ${colors.bg}, inset 0 0 0 4.5px ${colors.accent}` : undefined,
          }}
        />
      )}

      {/* Render Template Specific Body */}
      <div className="relative z-20 max-w-2xl mx-auto flex flex-col h-full">
        {renderTemplateBody()}
      </div>
    </div>
  );
};

/* =========================================================================
   15 BESPOKE ART-DIRECTED TEMPLATE LAYOUT COMPONENTS
   ========================================================================= */

// TYPES FOR SUB-COMPONENTS
interface CategoryGroup {
  id: string;
  name: string;
  order: number;
  items: Array<{
    id: string;
    name: string;
    description?: string;
    price: number;
    dietType: 'veg' | 'non-veg';
    image?: string;
    isBestseller?: boolean;
  }>;
}

interface LayoutProps {
  template: MenuTemplate;
  restaurant: { name: string; tagline?: string; cuisine?: string; logo?: string };
  categories: CategoryGroup[];
  compact?: boolean;
}

// 01. ROYAL MAHARAJA LAYOUT
const RoyalMaharajaLayout: React.FC<LayoutProps> = ({ template, restaurant, categories, compact }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center pb-5 border-b border-[#D4AF37]/30">
        <div className="flex justify-center items-center gap-2 mb-1.5 text-[#D4AF37]">
          <span className="text-xs">❖</span>
          <span className="h-px w-10 bg-[#D4AF37]/50" />
          <span className="text-[10px] font-serif uppercase tracking-[0.25em]">ROYAL PALACE DINING</span>
          <span className="h-px w-10 bg-[#D4AF37]/50" />
          <span className="text-xs">❖</span>
        </div>
        <h1
          className={clsx('font-extrabold tracking-wide text-[#D4AF37]', compact ? 'text-xl' : 'text-3xl sm:text-4xl')}
          style={{ fontFamily: template.typography.heading }}
        >
          {restaurant.name}
        </h1>
        <p className="text-[11px] italic text-[#FAF3E0]/80 mt-1">{restaurant.tagline}</p>
      </div>

      {/* Categories & Items */}
      {categories.map((cat) => (
        <div key={cat.id} className="space-y-3">
          <div className="flex items-center gap-3 py-1">
            <span className="text-[#D4AF37] text-xs">✦</span>
            <h2
              className={clsx('font-bold text-[#D4AF37] uppercase tracking-wider', compact ? 'text-xs' : 'text-sm sm:text-base')}
              style={{ fontFamily: template.typography.heading }}
            >
              {cat.name}
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-[#D4AF37]/40 to-transparent" />
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {cat.items.map((item) => (
              <div key={item.id} className="p-3 rounded-lg bg-[#3D0D27]/60 border border-[#D4AF37]/25 flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <DietIndicator type={item.dietType} compact={compact} color="#D4AF37" />
                    <h3 className="font-bold text-xs sm:text-sm text-[#FAF3E0]" style={{ fontFamily: template.typography.heading }}>
                      {item.name}
                    </h3>
                  </div>
                  {item.description && <p className="text-[11px] text-[#FAF3E0]/70 mt-1 leading-snug">{item.description}</p>}
                </div>
                <span className="font-serif font-bold text-xs sm:text-sm text-[#D4AF37] shrink-0">₹{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="pt-4 text-center text-[9px] uppercase tracking-widest text-[#D4AF37]/60">
        A Celebration of Royal Indian Hospitality
      </div>
    </div>
  );
};

// 02. RAJASTHANI HERITAGE LAYOUT
const RajasthaniHeritageLayout: React.FC<LayoutProps> = ({ template, restaurant, categories, compact }) => {
  return (
    <div className="space-y-6">
      {/* Rectangular Terracotta Block Header */}
      <div className="bg-[#9E3B20] text-[#F7EBE1] p-4 rounded-md text-center shadow-sm border border-[#9E3B20]/40">
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#D47A37] block mb-1">
          REGIONAL TEXTILE & CRAFT KITCHEN
        </span>
        <h1
          className={clsx('font-black tracking-tight text-white', compact ? 'text-xl' : 'text-3xl')}
          style={{ fontFamily: template.typography.heading }}
        >
          {restaurant.name}
        </h1>
        <p className="text-xs text-[#F7EBE1]/80 mt-1 font-medium">{restaurant.tagline}</p>
      </div>

      {/* Asymmetric Food Blocks & Lists */}
      {categories.map((cat) => (
        <div key={cat.id} className="space-y-3">
          <div className="bg-[#9E3B20]/10 px-3 py-1 border-l-4 border-[#9E3B20] inline-block">
            <h2 className="font-bold text-[#9E3B20] uppercase text-xs sm:text-sm tracking-wider" style={{ fontFamily: template.typography.heading }}>
              {cat.name}
            </h2>
          </div>

          <div className="space-y-2">
            {cat.items.map((item) => (
              <div key={item.id} className="py-2 border-b border-[#9E3B20]/15 flex justify-between items-baseline gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <DietIndicator type={item.dietType} compact={compact} color="#9E3B20" />
                    <span className="font-bold text-xs sm:text-sm text-[#2C1D11]" style={{ fontFamily: template.typography.heading }}>
                      {item.name}
                    </span>
                  </div>
                  {item.description && <p className="text-[11px] text-[#2C1D11]/70 pl-5 mt-0.5">{item.description}</p>}
                </div>
                <span className="font-mono font-bold text-xs text-[#9E3B20]">₹{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// 03. MUGHAL LUXE LAYOUT
const MughalLuxeLayout: React.FC<LayoutProps> = ({ template, restaurant, categories, compact }) => {
  return (
    <div className="space-y-6">
      {/* Arch Motif Header */}
      <div className="text-center pt-2 pb-6 border-b border-[#E5C158]/30 relative">
        <div className="mx-auto w-16 h-12 border-t-2 border-x-2 border-[#E5C158] rounded-t-full flex items-center justify-center mb-2">
          <span className="text-[#E5C158] text-xs">☪</span>
        </div>
        <h1
          className={clsx('font-bold text-[#E5C158] tracking-widest uppercase', compact ? 'text-xl' : 'text-3xl')}
          style={{ fontFamily: template.typography.heading }}
        >
          {restaurant.name}
        </h1>
        <p className="text-[10px] text-[#A3D9C9] tracking-widest uppercase mt-1">FIVE-STAR MUGHAL FINE DINING</p>
      </div>

      {categories.map((cat) => (
        <div key={cat.id} className="space-y-3">
          <div className="text-center py-1 border-y border-[#E5C158]/30 my-2">
            <h2 className="font-semibold text-[#E5C158] uppercase text-xs tracking-widest" style={{ fontFamily: template.typography.heading }}>
              ❖ {cat.name} ❖
            </h2>
          </div>

          <div className="space-y-2.5">
            {cat.items.map((item) => (
              <div key={item.id} className="py-2 border-b border-[#E5C158]/15 flex justify-between items-baseline gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <DietIndicator type={item.dietType} compact={compact} color="#E5C158" />
                    <span className="font-medium text-xs sm:text-sm text-[#FFFBF0]" style={{ fontFamily: template.typography.heading }}>
                      {item.name}
                    </span>
                  </div>
                  {item.description && <p className="text-[11px] text-[#A3D9C9]/80 pl-5 mt-0.5">{item.description}</p>}
                </div>
                <span className="font-serif text-xs text-[#E5C158]">₹{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// 04. BANARASI GOLD LAYOUT
const BanarasiGoldLayout: React.FC<LayoutProps> = ({ template, restaurant, categories, compact }) => {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="text-center py-4 px-6 border-2 border-[#FFD700]/40 bg-[#3A0D28] rounded-lg">
        <span className="text-[9px] uppercase tracking-[0.3em] text-[#FFD700] block mb-1">BANARASI SILK WEAVE COLLECTION</span>
        <h1
          className={clsx('font-extrabold text-[#FFD700]', compact ? 'text-xl' : 'text-3xl')}
          style={{ fontFamily: template.typography.heading }}
        >
          {restaurant.name}
        </h1>
        <div className="h-0.5 w-16 bg-[#FFD700] mx-auto mt-2" />
      </div>

      {categories.map((cat) => (
        <div key={cat.id} className="space-y-3">
          <div className="text-center">
            <h2 className="text-xs font-bold text-[#FFD700] uppercase tracking-widest" style={{ fontFamily: template.typography.heading }}>
              ✦ {cat.name} ✦
            </h2>
          </div>

          <div className="space-y-2">
            {cat.items.map((item) => (
              <div key={item.id} className="p-2.5 rounded border border-[#FFD700]/20 bg-[#3A0D28]/40 flex justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <DietIndicator type={item.dietType} compact={compact} color="#FFD700" />
                    <span className="font-bold text-xs text-[#FFF9EF]" style={{ fontFamily: template.typography.heading }}>
                      {item.name}
                    </span>
                  </div>
                  {item.description && <p className="text-[11px] text-[#FFF9EF]/70 pl-5 mt-0.5">{item.description}</p>}
                </div>
                <span className="font-mono text-xs text-[#FFD700] font-bold">₹{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// 05. SOUTH INDIAN HERITAGE LAYOUT
const SouthIndianHeritageLayout: React.FC<LayoutProps> = ({ template, restaurant, categories, compact }) => {
  return (
    <div className="space-y-6">
      {/* Temple Border Header */}
      <div className="pb-3 border-b-2 border-[#6E1B1B]">
        <div className="h-2 w-full bg-[#6E1B1B] mb-2 flex justify-between px-1">
          <div className="w-2 h-2 bg-[#C28838]" />
          <div className="w-2 h-2 bg-[#C28838]" />
        </div>
        <div className="flex justify-between items-end">
          <div>
            <h1
              className={clsx('font-black text-[#6E1B1B]', compact ? 'text-xl' : 'text-3xl')}
              style={{ fontFamily: template.typography.heading }}
            >
              {restaurant.name}
            </h1>
            <p className="text-xs text-[#274E37] font-medium">{restaurant.tagline}</p>
          </div>
          <span className="text-[10px] font-bold text-[#C28838] uppercase tracking-wider">BANGALORE</span>
        </div>
      </div>

      {categories.map((cat) => (
        <div key={cat.id} className="space-y-2.5">
          <h2 className="font-bold text-[#6E1B1B] text-xs uppercase tracking-wider border-b border-[#C28838]/40 pb-1">
            {cat.name}
          </h2>
          <div className="space-y-2">
            {cat.items.map((item) => (
              <div key={item.id} className="flex justify-between items-baseline py-1.5 border-b border-dashed border-slate-200">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <DietIndicator type={item.dietType} compact={compact} color="#6E1B1B" />
                    <span className="font-bold text-xs text-[#2C2C2C]">{item.name}</span>
                  </div>
                  {item.description && <p className="text-[11px] text-slate-500 pl-5 mt-0.5">{item.description}</p>}
                </div>
                <span className="font-bold text-xs text-[#C28838]">₹{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// 06. INDIAN STREET KITCHEN LAYOUT
const IndianStreetKitchenLayout: React.FC<LayoutProps> = ({ template, restaurant, categories, compact }) => {
  return (
    <div className="space-y-6">
      <div className="bg-[#E85A2A] text-white p-4 text-center rounded-xl shadow-md">
        <span className="px-2 py-0.5 bg-yellow-400 text-black font-black text-[9px] uppercase tracking-wider rounded inline-block mb-1">
          VIBRANT STREET FLAVORS
        </span>
        <h1
          className={clsx('font-black tracking-wider uppercase', compact ? 'text-2xl' : 'text-4xl')}
          style={{ fontFamily: template.typography.heading }}
        >
          {restaurant.name}
        </h1>
      </div>

      {categories.map((cat) => (
        <div key={cat.id} className="space-y-3">
          <div className="inline-block px-3 py-1 bg-[#B81D1D] text-white rounded font-black text-xs uppercase tracking-wider">
            {cat.name}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cat.items.map((item) => (
              <div key={item.id} className="p-3 rounded-xl border-2 border-[#E85A2A]/30 bg-white shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5">
                      <DietIndicator type={item.dietType} compact={compact} />
                      <h3 className="font-black text-xs text-slate-900 uppercase tracking-tight">{item.name}</h3>
                    </div>
                  </div>
                  {item.description && <p className="text-[10px] text-slate-600 mt-1 line-clamp-2">{item.description}</p>}
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="px-2 py-0.5 bg-[#E85A2A] text-white text-xs font-black rounded">₹{item.price}</span>
                  {item.isBestseller && <span className="text-[9px] font-black text-[#B81D1D] uppercase">MUST TRY</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// 07. MODERN INDIA LAYOUT (Editorial Grid)
const ModernIndiaLayout: React.FC<LayoutProps> = ({ template, restaurant, categories, compact }) => {
  const firstItemWithImage = categories.flatMap(c => c.items).find(i => i.image);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-900">
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase" style={{ fontFamily: template.typography.heading }}>{restaurant.name}</h1>
        <p className="text-xs text-[#E8783C] font-mono tracking-widest uppercase mt-1">FASHION EDITORIAL CUISINE</p>
      </div>

      {/* Asymmetric Split Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {firstItemWithImage && (
          <div className="md:col-span-5 relative rounded-2xl overflow-hidden shadow-md bg-slate-900">
            <img src={firstItemWithImage.image} alt={firstItemWithImage.name} className="w-full h-48 md:h-full object-cover" />
            <div className="absolute bottom-2 left-2 right-2 p-2 bg-black/60 backdrop-blur-xs text-white rounded-lg text-xs font-bold">
              {firstItemWithImage.name} — ₹{firstItemWithImage.price}
            </div>
          </div>
        )}

        <div className={clsx('space-y-5', firstItemWithImage ? 'md:col-span-7' : 'md:col-span-12')}>
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-2">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{cat.name}</h2>
              <div className="space-y-2">
                {cat.items.map((item) => (
                  <div key={item.id} className="py-1.5 border-b border-slate-200 flex justify-between items-baseline">
                    <div className="flex items-center gap-2">
                      <DietIndicator type={item.dietType} compact={compact} />
                      <span className="font-bold text-xs text-slate-900">{item.name}</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#E8783C]">₹{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 08. SPICE HOUSE LAYOUT
const SpiceHouseLayout: React.FC<LayoutProps> = ({ template, restaurant, categories, compact }) => {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E68A00]/40">
        <span className="text-[10px] text-[#E68A00] font-mono tracking-widest uppercase block">FOOD-FIRST MAGAZINE</span>
        <h1 className="text-3xl font-bold text-[#FFFDF8] tracking-tight uppercase" style={{ fontFamily: template.typography.heading }}>
          {restaurant.name}
        </h1>
      </div>

      {categories.map((cat) => (
        <div key={cat.id} className="space-y-3">
          <h2 className="text-xs font-bold text-[#E68A00] uppercase tracking-wider">{cat.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cat.items.map((item) => (
              <div key={item.id} className="p-3 rounded-lg bg-[#3C2923] border border-[#E68A00]/20 flex flex-col justify-between">
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-full h-24 object-cover rounded mb-2" />
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <DietIndicator type={item.dietType} compact={compact} color="#E68A00" />
                    <h3 className="font-bold text-xs text-[#FFFDF8]">{item.name}</h3>
                  </div>
                  {item.description && <p className="text-[10px] text-[#D7CCC8] mt-1 line-clamp-2">{item.description}</p>}
                </div>
                <span className="text-xs font-bold text-[#E68A00] mt-2 block">₹{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// 09. MAISON NOIR LAYOUT (Michelin Star Benchmark)
const MaisonNoirLayout: React.FC<LayoutProps> = ({ template, restaurant, categories, compact }) => {
  return (
    <div className="space-y-8 py-2">
      {/* Minimal Header */}
      <div className="text-center pb-6 border-b border-white/10">
        <p className="text-[9px] font-mono tracking-[0.4em] text-[#888888] uppercase mb-1.5">MICHELIN SELECTION</p>
        <h1 className="text-3xl sm:text-4xl font-light text-[#F4EFEA] tracking-widest uppercase" style={{ fontFamily: template.typography.heading }}>
          {restaurant.name}
        </h1>
        <p className="text-xs italic text-[#D4AF37] mt-2 font-serif">à la carte menu</p>
      </div>

      {categories.map((cat) => (
        <div key={cat.id} className="space-y-4">
          <div className="text-center">
            <h2 className="text-xs font-light text-[#D4AF37] uppercase tracking-[0.3em]" style={{ fontFamily: template.typography.heading }}>
              — {cat.name} —
            </h2>
          </div>

          <div className="space-y-3">
            {cat.items.map((item) => (
              <div key={item.id} className="py-2 border-b border-white/5 flex items-baseline justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <DietIndicator type={item.dietType} compact={compact} color="#D4AF37" />
                    <span className="font-serif text-sm text-[#F4EFEA] tracking-wide font-normal">{item.name}</span>
                  </div>
                  {item.description && <p className="text-[11px] text-[#888888] font-light mt-0.5 pl-5">{item.description}</p>}
                </div>
                <span className="font-mono text-xs text-[#D4AF37]">{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// 10. IVORY DINING LAYOUT
const IvoryDiningLayout: React.FC<LayoutProps> = ({ template, restaurant, categories, compact }) => {
  return (
    <div className="space-y-6">
      <div className="pb-5 border-b border-slate-200 text-left">
        <span className="text-[10px] text-[#8B7355] font-serif uppercase tracking-widest block mb-1">FINE DINING</span>
        <h1 className="text-3xl text-[#111111]" style={{ fontFamily: template.typography.heading }}>{restaurant.name}</h1>
        <p className="text-xs text-slate-500 mt-1">{restaurant.tagline}</p>
      </div>

      {categories.map((cat) => (
        <div key={cat.id} className="space-y-3">
          <h2 className="text-xs font-bold text-[#8B7355] uppercase tracking-wider border-b border-[#8B7355]/30 pb-1">
            {cat.name}
          </h2>
          <div className="space-y-2">
            {cat.items.map((item) => (
              <div key={item.id} className="py-1.5 flex justify-between items-baseline">
                <div className="flex items-center gap-2">
                  <DietIndicator type={item.dietType} compact={compact} color="#111111" />
                  <span className="font-bold text-xs text-[#111111]">{item.name}</span>
                </div>
                <span className="font-mono text-xs text-slate-700">₹{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// 11. GRAND TABLE LAYOUT (Hotel Level)
const GrandTableLayout: React.FC<LayoutProps> = ({ template, restaurant, categories, compact }) => {
  return (
    <div className="space-y-6">
      <div className="rounded-xl overflow-hidden bg-slate-900 relative h-32">
        <img src={restaurant.logo} alt={restaurant.name} className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 bg-gradient-to-t from-black/80 to-transparent">
          <span className="text-[9px] font-mono text-[#D4AF37] uppercase tracking-widest">THE LEELA HOTEL LEVEL</span>
          <h1 className="text-2xl font-bold text-[#FFFDF5]" style={{ fontFamily: template.typography.heading }}>{restaurant.name}</h1>
        </div>
      </div>

      {categories.map((cat) => (
        <div key={cat.id} className="space-y-3">
          <h2 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest border-b border-[#D4AF37]/30 pb-1">
            {cat.name}
          </h2>
          <div className="space-y-2">
            {cat.items.map((item) => (
              <div key={item.id} className="p-2.5 rounded bg-[#133D2F] border border-[#D4AF37]/20 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <DietIndicator type={item.dietType} compact={compact} color="#D4AF37" />
                    <span className="font-bold text-xs text-[#FFFDF5]">{item.name}</span>
                  </div>
                  {item.description && <p className="text-[10px] text-[#B5C4BE] pl-5 mt-0.5">{item.description}</p>}
                </div>
                <span className="font-bold text-xs text-[#D4AF37]">₹{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// 12. COFFEE HOUSE LAYOUT
const CoffeeHouseLayout: React.FC<LayoutProps> = ({ template, restaurant, categories, compact }) => {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-dashed border-[#E0A96D]/40 flex justify-between items-center">
        <div>
          <span className="text-[10px] font-bold text-[#E0A96D] uppercase tracking-widest">ARTISAN ROASTERY</span>
          <h1 className="text-3xl font-bold text-[#FFFDF7]" style={{ fontFamily: template.typography.heading }}>
            {restaurant.name}
          </h1>
        </div>
        <span className="text-2xl">☕</span>
      </div>

      {categories.map((cat) => (
        <div key={cat.id} className="space-y-3">
          <h2 className="text-base font-bold text-[#E0A96D]" style={{ fontFamily: template.typography.heading }}>
            {cat.name}
          </h2>
          <div className="space-y-2">
            {cat.items.map((item) => (
              <div key={item.id} className="flex justify-between items-baseline py-1 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <DietIndicator type={item.dietType} compact={compact} color="#E0A96D" />
                  <span className="text-xs text-[#FFFDF7] font-medium">{item.name}</span>
                </div>
                <span className="font-mono text-xs text-[#E0A96D]">₹{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// 13. PAPER CAFE LAYOUT
const PaperCafeLayout: React.FC<LayoutProps> = ({ template, restaurant, categories, compact }) => {
  return (
    <div className="space-y-6">
      <div className="text-center pb-3 border-b-2 border-dashed border-[#2C2621]/30">
        <h1 className="text-3xl font-bold text-[#2C2621]" style={{ fontFamily: template.typography.heading }}>
          {restaurant.name}
        </h1>
        <p className="text-xs text-[#A65628] mt-0.5">freshly prepared • local ingredients</p>
      </div>

      {categories.map((cat) => (
        <div key={cat.id} className="space-y-2.5">
          <h2 className="text-xl font-bold text-[#2C2621]" style={{ fontFamily: template.typography.heading }}>
            {cat.name}
          </h2>
          <div className="space-y-2">
            {cat.items.map((item) => (
              <div key={item.id} className="py-1 border-b border-dotted border-[#2C2621]/30 flex justify-between items-baseline">
                <div className="flex items-center gap-2">
                  <DietIndicator type={item.dietType} compact={compact} color="#2C2621" />
                  <span className="text-xs font-bold text-[#2C2621]">{item.name}</span>
                </div>
                <span className="font-mono text-xs font-bold text-[#A65628]">₹{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// 14. BOMBAY STREET LAYOUT
const BombayStreetLayout: React.FC<LayoutProps> = ({ template, restaurant, categories, compact }) => {
  return (
    <div className="space-y-6">
      <div className="bg-[#1C1C1C] text-[#F26522] p-4 rounded-lg border-2 border-[#C82323] text-center">
        <h1 className="text-4xl font-black text-[#FFFDF2] uppercase tracking-wider" style={{ fontFamily: template.typography.heading }}>
          {restaurant.name}
        </h1>
        <span className="inline-block bg-[#C82323] text-white text-[9px] font-bold px-3 py-0.5 rounded-full uppercase mt-1">
          ORIGINAL MUMBAI STREET & CHAT
        </span>
      </div>

      {categories.map((cat) => (
        <div key={cat.id} className="space-y-3">
          <div className="inline-block px-3 py-1 bg-[#F26522] text-white rounded font-black text-xs uppercase">
            {cat.name}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cat.items.map((item) => (
              <div key={item.id} className="p-3 rounded-lg border-2 border-[#C82323]/20 bg-white flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-1.5">
                    <DietIndicator type={item.dietType} compact={compact} />
                    <h3 className="font-black text-xs text-slate-900 uppercase">{item.name}</h3>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-[#C82323] text-white font-black text-xs rounded">₹{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// 15. MINIMAL EDITORIAL LAYOUT
const MinimalEditorialLayout: React.FC<LayoutProps> = ({ template, restaurant, categories, compact }) => {
  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-slate-900">
        <div className="flex justify-between items-baseline">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: template.typography.heading }}>
            {restaurant.name}
          </h1>
          <span className="text-xs font-bold text-[#E8783C] uppercase tracking-widest">MENU</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">{restaurant.tagline}</p>
      </div>

      {categories.map((cat) => (
        <div key={cat.id} className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1">
            {cat.name}
          </h2>
          <div className="space-y-2">
            {cat.items.map((item) => (
              <div key={item.id} className="py-1.5 flex justify-between items-baseline">
                <div className="flex items-center gap-2">
                  <DietIndicator type={item.dietType} compact={compact} color="#18181B" />
                  <span className="font-bold text-xs text-slate-900">{item.name}</span>
                </div>
                <span className="font-mono text-xs font-bold text-[#E8783C]">₹{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MenuTemplateRenderer;
