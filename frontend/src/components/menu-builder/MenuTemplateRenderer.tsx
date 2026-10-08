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
      case 'chalk-bistro':
        return <ChalkBistroLayout template={template} restaurant={restaurant} categories={finalCategories} compact={compact} />;
      case 'fluid-abstract':
        return <FluidAbstractLayout template={template} restaurant={restaurant} categories={finalCategories} compact={compact} />;
      case 'dark-clipboard':
        return <DarkClipboardLayout template={template} restaurant={restaurant} categories={finalCategories} compact={compact} />;
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
    <div className="space-y-8 relative z-10 before:absolute before:inset-0 before:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMSIgZmlsbD0iI2Q0YWYzNyIgZmlsbC1vcGFjaXR5PSIwLjE1Ii8+PC9zdmc+')] before:-z-10 before:opacity-50">
      {/* Elaborate Header */}
      <div className="relative text-center pb-8 pt-4">
        {/* Ornate Top Border */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-sm flex items-center justify-center">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
          <svg className="w-8 h-8 text-[#D4AF37] mx-2 shrink-0 drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L14.4 9.6H22L15.8 14.4L18.2 22L12 17.2L5.8 22L8.2 14.4L2 9.6H9.6L12 2Z" />
          </svg>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
        </div>

        <div className="flex justify-center items-center gap-3 mb-4 mt-6 text-[#D4AF37]">
          <span className="h-[2px] w-12 bg-gradient-to-r from-transparent to-[#D4AF37]/80" />
          <span className="text-[10px] font-serif uppercase tracking-[0.4em] font-bold text-[#D4AF37] drop-shadow-md">A Culinary Heritage</span>
          <span className="h-[2px] w-12 bg-gradient-to-l from-transparent to-[#D4AF37]/80" />
        </div>
        
        <h1
          className={clsx('font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-[#FFF5D1] via-[#D4AF37] to-[#AA7C11] filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]', compact ? 'text-3xl' : 'text-5xl sm:text-6xl')}
          style={{ fontFamily: template.typography.heading }}
        >
          {restaurant.name}
        </h1>
        <p className="text-xs sm:text-sm italic text-[#FAF3E0]/70 mt-3 font-serif tracking-widest">{restaurant.tagline}</p>
        
        {/* Ornate Bottom Border */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 flex items-center justify-center opacity-70">
           <svg className="w-full h-4 text-[#D4AF37]" preserveAspectRatio="none" viewBox="0 0 100 10" fill="none" stroke="currentColor" strokeWidth="0.5">
             <path d="M0 5 Q 25 0, 50 5 T 100 5" />
             <path d="M0 5 Q 25 10, 50 5 T 100 5" />
           </svg>
        </div>
      </div>

      {/* Categories & Items */}
      <div className="px-2 sm:px-4 space-y-10">
        {categories.map((cat) => (
          <div key={cat.id} className="space-y-6 relative">
            <div className="flex flex-col items-center justify-center py-2 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
              </div>
              <div className="bg-[#1A0B13] px-6 py-2 border border-[#D4AF37]/40 rounded-sm shadow-[0_0_15px_rgba(212,175,55,0.15)] relative z-10 flex items-center gap-3">
                <span className="text-[#D4AF37] text-[10px]">❖</span>
                <h2
                  className={clsx('font-extrabold text-[#D4AF37] uppercase tracking-[0.2em]', compact ? 'text-sm' : 'text-base sm:text-lg')}
                  style={{ fontFamily: template.typography.heading }}
                >
                  {cat.name}
                </h2>
                <span className="text-[#D4AF37] text-[10px]">❖</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {cat.items.map((item) => (
                <div key={item.id} className="relative group p-4 sm:p-5 rounded-tr-3xl rounded-bl-3xl bg-gradient-to-br from-[#2A111F]/80 to-[#1A0B13]/90 border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 transition-all duration-500 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                  {/* Decorative Corner */}
                  <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-[#D4AF37] rounded-tr-3xl opacity-30 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-[#D4AF37] rounded-bl-3xl opacity-30 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0 z-10">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <DietIndicator type={item.dietType} compact={compact} color="#D4AF37" />
                        <h3 className="font-bold text-sm sm:text-base text-[#FFF8E7] group-hover:text-[#D4AF37] transition-colors" style={{ fontFamily: template.typography.heading }}>
                          {item.name}
                        </h3>
                        {item.isBestseller && (
                          <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 rounded-full ml-2">
                            Royal
                          </span>
                        )}
                      </div>
                      {item.description && <p className="text-[11px] sm:text-xs text-[#FAF3E0]/60 leading-relaxed font-serif">{item.description}</p>}
                    </div>
                    <div className="relative z-10 flex flex-col items-end">
                      <span className="font-serif font-bold text-base sm:text-lg text-[#D4AF37] drop-shadow-md">₹{item.price}</span>
                      <div className="h-px w-full bg-gradient-to-l from-[#D4AF37]/50 to-transparent mt-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 pt-6 border-t border-[#D4AF37]/20 text-center relative pb-6">
        <svg className="w-8 h-8 text-[#D4AF37]/30 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#2a0818] px-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L14.4 9.6H22L15.8 14.4L18.2 22L12 17.2L5.8 22L8.2 14.4L2 9.6H9.6L12 2Z" />
        </svg>
        <span className="text-[9px] uppercase tracking-[0.3em] text-[#D4AF37]/70 font-serif">A Celebration of Royal Indian Hospitality</span>
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
  const allItemsWithImages = categories.flatMap(c => c.items).filter(i => i.image);
  const featureItem = allItemsWithImages[0];

  return (
    <div className={clsx("bg-[#F4F4F4] text-[#111111] relative overflow-hidden", compact ? "space-y-4 p-4" : "space-y-8 p-4 sm:p-8")}>
      {/* Editorial Decorative Elements */}
      <div className="absolute top-0 left-0 w-1/3 h-2 bg-[#E8783C]" />
      <div className="absolute top-8 left-8 w-px h-full bg-black/5" />
      <div className="absolute top-8 right-8 w-px h-full bg-black/5" />
      
      <div className={clsx("border-b-2 border-[#111111] relative z-10 flex flex-col justify-between items-start gap-4", compact ? "pb-4" : "pb-8 sm:flex-row sm:items-end")}>
        <div>
          <span className="text-[10px] text-[#E8783C] font-mono tracking-[0.2em] uppercase font-bold mb-2 block">
            Vol. 1 — The Culinary Edit
          </span>
          <h1 className={clsx("font-black text-[#111111] tracking-tighter uppercase leading-none break-words", compact ? "text-3xl" : "text-4xl sm:text-6xl")} style={{ fontFamily: template.typography.heading }}>
            {restaurant.name}
          </h1>
        </div>
        <p className={clsx("text-slate-500 font-serif italic border-l-2 border-[#E8783C] pl-3 py-1", compact ? "text-[10px]" : "text-xs sm:text-sm max-w-[200px] text-right")}>
          {restaurant.tagline || 'Modern flavors curated for the contemporary palate.'}
        </p>
      </div>

      {/* Typographic Magazine Feature instead of an image */}
      <div className={clsx("grid grid-cols-1 items-stretch z-10 relative", compact ? "mb-6 gap-3" : "md:grid-cols-12 gap-6 mb-10")}>
        <div className={clsx("relative group overflow-hidden bg-black flex items-center justify-center border border-black/10 shadow-xl", compact ? "h-32" : "md:col-span-7 h-64 md:h-96")}>
           {/* Abstract Typographic Texture */}
           <div className="absolute inset-0 overflow-hidden flex flex-wrap items-center justify-center opacity-10 pointer-events-none select-none">
             <span className="text-[200px] font-black text-white leading-none tracking-tighter break-all">MODERN</span>
           </div>
           <div className="absolute inset-0 border-[10px] border-[#F4F4F4] mix-blend-overlay pointer-events-none" />
           <div className={clsx("absolute bg-white/95 backdrop-blur-md shadow-2xl border-l-4 border-[#E8783C]", compact ? "bottom-3 left-3 right-3 p-3" : "bottom-6 left-6 right-6 p-4")}>
              <span className="text-[10px] font-bold tracking-widest text-[#E8783C] uppercase mb-1 block">Editor's Pick</span>
              <h3 className={clsx("font-black uppercase tracking-tight text-[#111111]", compact ? "text-sm" : "text-lg")}>The Signature Experience</h3>
              <p className={clsx("text-slate-600 line-clamp-2", compact ? "text-[10px] mt-0.5" : "text-xs mt-1")}>Discover our chef's meticulously crafted seasonal creations.</p>
           </div>
        </div>
        {!compact && (
          <div className="md:col-span-5 flex flex-col justify-between space-y-6">
            <div className="bg-[#111111] text-white p-6 sm:p-8 h-full flex flex-col justify-center border-t-4 border-[#E8783C] relative overflow-hidden">
              <span className="text-8xl font-black text-white/5 absolute -top-4 -right-4 tracking-tighter select-none pointer-events-none">01</span>
              <h2 className="text-2xl font-black uppercase mb-4 relative z-10" style={{ fontFamily: template.typography.heading }}>The Experience</h2>
              <p className="text-sm text-slate-400 font-serif italic leading-relaxed relative z-10">
                A meticulously crafted selection of contemporary dishes that challenge tradition while respecting their roots.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Structured Category Grid */}
      <div className={clsx('grid grid-cols-1 z-10 relative', compact ? "gap-6" : "gap-12 md:grid-cols-2")}>
        {categories.map((cat, idx) => (
          <div key={cat.id} className="relative">
            <div className="flex items-end gap-2 sm:gap-4 mb-4 sm:mb-6 border-b border-black/10 pb-2">
              <span className={clsx("font-black text-slate-200 tracking-tighter w-8 sm:w-12", compact ? "text-2xl" : "text-3xl")}>{String(idx + 1).padStart(2, '0')}</span>
              <h2 className={clsx("font-black text-[#111111] uppercase tracking-widest leading-none pb-1", compact ? "text-base" : "text-lg sm:text-xl")} style={{ fontFamily: template.typography.heading }}>
                {cat.name}
              </h2>
            </div>
            
            <div className="grid gap-3 sm:gap-6 grid-cols-1">
              {cat.items.map((item) => (
                <div key={item.id} className={clsx("group relative bg-white border border-slate-200 hover:border-[#111111] hover:shadow-[8px_8px_0px_0px_rgba(232,120,60,1)] transition-all duration-300", compact ? "p-3" : "p-4 sm:p-5")}>
                  <div className="flex justify-between items-start gap-3 sm:gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                        <DietIndicator type={item.dietType} compact={compact} color="#111111" />
                        <span className={clsx("font-bold text-[#111111] uppercase tracking-tight group-hover:text-[#E8783C] transition-colors leading-tight", compact ? "text-xs" : "text-sm")}>{item.name}</span>
                      </div>
                      {item.description && <p className={clsx("text-slate-500 font-serif leading-relaxed line-clamp-2", compact ? "text-[10px]" : "text-xs")}>{item.description}</p>}
                    </div>
                    <div className={clsx("bg-[#111111] text-white font-bold shrink-0 shadow-sm group-hover:bg-[#E8783C] transition-colors", compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs")}>
                      ₹{item.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className={clsx("border-t-4 border-[#111111] flex justify-between items-center z-10 relative", compact ? "mt-8 pt-4" : "mt-16 pt-8")}>
        <span className={clsx("font-black tracking-tighter uppercase", compact ? "text-lg" : "text-2xl")}>{restaurant.name}</span>
        <span className={clsx("uppercase font-bold tracking-[0.2em] text-[#E8783C]", compact ? "text-[8px]" : "text-[10px]")}>Curated Selection</span>
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
                <div className="w-full h-24 rounded mb-2 bg-[#2A1D18] flex items-center justify-center border border-[#E68A00]/10 overflow-hidden relative">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#E68A00 1px, transparent 1px)', backgroundSize: '8px 8px' }}></div>
                  <span className="text-[#E68A00]/20 font-mono text-5xl font-black italic absolute -right-2 -bottom-2">{item.name.charAt(0)}</span>
                </div>
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
const MaisonNoirLayout: React.FC<LayoutProps> = ({ template, restaurant, categories }) => {
  return (
    <div className="space-y-12 py-8 px-4 sm:px-10 bg-[#0A0A0A] text-[#E0E0E0] min-h-full relative shadow-2xl">
      {/* Subtle Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

      {/* Ultra Minimal Header */}
      <div className="flex flex-col items-center justify-center pb-12 relative z-10">
        <div className="w-px h-16 bg-gradient-to-b from-transparent via-[#D4AF37]/50 to-transparent mb-6" />
        <p className="text-[8px] font-mono tracking-[0.6em] text-[#888888] uppercase mb-4 opacity-70">L'EXCELLENCE CULINAIRE</p>
        <h1 className="text-4xl sm:text-6xl font-light tracking-[0.2em] uppercase text-transparent bg-clip-text bg-gradient-to-b from-[#FFFFFF] to-[#A0A0A0]" style={{ fontFamily: template.typography.heading }}>
          {restaurant.name}
        </h1>
        {restaurant.tagline && (
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] mt-6 font-light">{restaurant.tagline}</p>
        )}
        <div className="w-8 h-px bg-[#D4AF37]/60 mt-8" />
      </div>

      <div className="max-w-3xl mx-auto space-y-16 relative z-10">
        {categories.map((cat) => (
          <div key={cat.id} className="space-y-8">
            <div className="text-center flex items-center justify-center gap-6">
              <div className="h-px w-12 bg-white/10" />
              <h2 className="text-[11px] font-light text-[#D4AF37] uppercase tracking-[0.4em]" style={{ fontFamily: template.typography.heading }}>
                {cat.name}
              </h2>
              <div className="h-px w-12 bg-white/10" />
            </div>

            <div className="space-y-6">
              {cat.items.map((item) => (
                <div key={item.id} className="group relative py-3 pl-6 pr-4 sm:pr-8 transition-colors duration-500 hover:bg-white/[0.02]">
                  {/* Vertical Accent Line */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 bg-[#D4AF37] transition-all duration-500 group-hover:h-full opacity-0 group-hover:opacity-100" />
                  
                  <div className="flex items-end justify-between gap-6 relative">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-[#D4AF37] opacity-60">
                          {item.dietType === 'veg' ? 'V' : 'NV'}
                        </span>
                        <h3 className="font-serif text-sm sm:text-base text-[#F4EFEA] tracking-wider font-normal transition-colors group-hover:text-white">
                          {item.name}
                        </h3>
                      </div>
                    </div>
                    {/* Minimal Dotted Leader */}
                    <div className="flex-1 border-b border-dotted border-white/10 mb-1.5 opacity-50 hidden sm:block mx-4" />
                    <span className="font-mono text-xs sm:text-sm text-[#D4AF37] tracking-widest shrink-0">
                      ₹{item.price}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-[11px] text-[#777777] font-light mt-2 max-w-lg leading-loose tracking-wide pl-6">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-24 pb-8 flex flex-col items-center justify-center text-[#555] z-10 relative">
        <svg className="w-6 h-6 mb-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M12 2L15 8L21 9L16.5 14L18 20L12 17L6 20L7.5 14L3 9L9 8L12 2Z" />
        </svg>
        <span className="text-[9px] tracking-[0.5em] uppercase font-light">Service Compris</span>
      </div>
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
    <div className="space-y-10 p-2 sm:p-4 bg-[repeating-linear-gradient(45deg,#fafafa,#fafafa_10px,#f0f0f0_10px,#f0f0f0_20px)] text-[#1C1C1C]">
      {/* Street Sign Header */}
      <div className="relative group">
        <div className="absolute inset-0 bg-[#000000] translate-x-2 translate-y-2 rounded-xl transition-transform group-hover:translate-x-3 group-hover:translate-y-3" />
        <div className="bg-[#FFEB3B] border-4 border-[#000000] p-6 rounded-xl relative z-10 text-center transform -rotate-1 hover:rotate-0 transition-transform">
          <div className="flex justify-center gap-2 mb-2">
            {[1, 2, 3].map(i => (
              <span key={i} className="text-[#000000] text-[10px]">★</span>
            ))}
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-[#000000] uppercase tracking-tighter leading-none filter drop-shadow-[2px_2px_0px_#fff]" style={{ fontFamily: template.typography.heading }}>
            {restaurant.name}
          </h1>
          <div className="inline-block bg-[#E32636] text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase mt-4 border-2 border-black transform rotate-2">
            {restaurant.tagline || 'STREET FOOD REVOLUTION'}
          </div>
        </div>
      </div>

      <div className="space-y-12 relative z-10">
        {categories.map((cat, idx) => {
          const colors = ['bg-[#00C853]', 'bg-[#2979FF]', 'bg-[#FF9100]', 'bg-[#E040FB]'];
          const catColor = colors[idx % colors.length];
          const rotation = idx % 2 === 0 ? '-rotate-1' : 'rotate-1';
          
          return (
            <div key={cat.id} className="space-y-6">
              {/* Category Sticker */}
              <div className="flex justify-start">
                <div className={clsx(`inline-block px-5 py-2 text-white font-black text-sm sm:text-base uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform ${rotation}`, catColor)}>
                  {cat.name}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                {cat.items.map((item) => (
                  <div key={item.id} className="group p-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all flex flex-col justify-between h-full relative overflow-hidden">
                    {/* Bestseller Badge */}
                    {item.isBestseller && (
                      <div className="absolute -right-6 top-4 bg-[#FFEB3B] text-black font-black text-[9px] uppercase py-1 px-8 transform rotate-45 border-y-2 border-black z-10">
                        HIT!
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 shrink-0">
                          <DietIndicator type={item.dietType} compact={compact} color="#000000" />
                        </div>
                        <h3 className="font-black text-base sm:text-lg text-black uppercase leading-tight pr-6">{item.name}</h3>
                      </div>
                      {item.description && (
                        <p className="text-xs text-slate-700 mt-2 font-bold bg-slate-100 p-2 border-l-4 border-black">
                          {item.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex justify-end items-center mt-2">
                      <div className="bg-[#E32636] border-2 border-black text-white px-3 py-1 font-black text-sm sm:text-base transform -skew-x-6 group-hover:skew-x-0 transition-transform">
                        ₹{item.price}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="text-center pt-8">
        <span className="inline-block font-black text-4xl text-black/10 tracking-tighter uppercase transform -rotate-2">
          100% AUTHENTIC
        </span>
      </div>
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

// 16. CHALKBOARD BISTRO LAYOUT
const ChalkBistroLayout: React.FC<LayoutProps> = ({ template, restaurant, categories }) => {
  return (
    <div className="space-y-10 pb-12 relative px-4 sm:px-8 py-8 w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl border-4 border-[#333]">
      {/* Chalkboard Texture Background */}
      <div className="absolute inset-0 z-0 bg-[#212121]" style={{
        backgroundImage: `
          url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E"),
          radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 80%)
        `,
        backgroundBlendMode: 'overlay, normal'
      }}></div>

      {/* Decorative Corner Ornaments */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-[#E5DF39]/40 z-10"></div>
      <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-[#E5DF39]/40 z-10"></div>
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-[#E5DF39]/40 z-10"></div>
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-[#E5DF39]/40 z-10"></div>

      {/* Header Section */}
      <div className="text-center relative z-10 pt-4 pb-8 border-b-2 border-dashed border-[#E5DF39]/20">
        <div className="flex justify-center items-center gap-4 mb-4">
          <svg width="40" height="12" viewBox="0 0 40 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 6H30 M25 1L35 6L25 11" stroke="#E5DF39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[#E5DF39] text-[10px] font-bold uppercase tracking-[0.4em] font-mono">Bistro & Bar</span>
          <svg width="40" height="12" viewBox="0 0 40 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M40 6H10 M15 1L5 6L15 11" stroke="#E5DF39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="text-5xl sm:text-7xl font-black text-[#F5F5F5] uppercase tracking-wider mb-4 leading-none" style={{ fontFamily: template.typography.heading, textShadow: '3px 3px 6px rgba(0,0,0,0.8), -1px -1px 0 rgba(229,223,57,0.3)' }}>
          {restaurant.name}
        </h1>
        <div className="inline-flex items-center gap-2 px-6 py-1.5 border border-[#E5DF39]/60 rounded-full bg-[#111]/40 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E5DF39]"></span>
          <p className="text-xs text-[#E5DF39] font-bold uppercase tracking-[0.2em]">{restaurant.tagline || 'Est. 2024'}</p>
          <span className="w-1.5 h-1.5 rounded-full bg-[#E5DF39]"></span>
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 relative z-10 mt-8">
        {categories.map((cat) => (
          <div key={cat.id} className="space-y-6 relative">
            {/* Detailed Ribbon Header */}
            <div className="relative flex justify-center -mt-10 mb-6">
              <div className="relative z-10 bg-[#E5DF39] text-[#212121] px-10 py-2 shadow-[0_4px_15px_rgba(229,223,57,0.2)] transform -rotate-1">
                <div className="absolute top-0 left-0 w-full h-full border-[1px] border-[#212121]/20 m-[2px]" style={{ width: 'calc(100% - 4px)', height: 'calc(100% - 4px)' }}></div>
                <h2 className="text-sm font-black uppercase tracking-[0.25em] relative z-20" style={{ fontFamily: template.typography.heading }}>
                  {cat.name}
                </h2>
                {/* Ribbon Tails */}
                <div className="absolute top-2 -left-3 w-4 h-full bg-[#C5BF29] -z-10 transform skew-y-12"></div>
                <div className="absolute top-2 -right-3 w-4 h-full bg-[#C5BF29] -z-10 transform -skew-y-12"></div>
              </div>
            </div>

            <div className="space-y-5">
              {cat.items.map((item) => (
                <div key={item.id} className="flex justify-between items-baseline group relative">
                  {/* Hover chalk highlight */}
                  <div className="absolute -inset-2 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none blur-md"></div>
                  
                  <div className="flex-1 pr-4 relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base sm:text-lg font-bold text-[#F5F5F5] group-hover:text-[#E5DF39] transition-colors tracking-wide" style={{ fontFamily: template.typography.body }}>{item.name}</span>
                      {item.isBestseller && (
                        <span className="text-[9px] px-1.5 py-0.5 border border-[#E5DF39] text-[#E5DF39] rounded font-bold uppercase tracking-wider transform -rotate-3">Star</span>
                      )}
                    </div>
                    {item.description && <p className="text-xs text-[#A0A0A0] leading-relaxed italic font-serif opacity-80">{item.description}</p>}
                  </div>
                  <div className="flex items-baseline relative z-10 shrink-0 w-24">
                    <div className="flex-1 border-b-[2px] border-dotted border-[#E5DF39]/30 mr-3 mb-1.5 group-hover:border-[#E5DF39]/60 transition-colors"></div>
                    <span className="font-bold text-lg sm:text-xl text-[#E5DF39] font-mono tracking-tighter">₹{item.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Hand-drawn style decorative footer */}
      <div className="mt-16 text-center opacity-40 relative z-10 flex flex-col items-center gap-2">
        <svg width="100" height="15" viewBox="0 0 100 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 7.5C20 7.5 25 1 35 1C45 1 50 14 60 14C70 14 75 7.5 95 7.5" stroke="#E5DF39" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4"/>
        </svg>
        <p className="text-[10px] uppercase tracking-[0.4em] text-[#F5F5F5] font-mono">End of Menu</p>
      </div>
    </div>
  );
};

// 17. FLUID ABSTRACT LAYOUT
const FluidAbstractLayout: React.FC<LayoutProps> = ({ template, restaurant, categories }) => {
  return (
    <div className="space-y-12 relative overflow-hidden bg-[#F5F0E6] z-0 px-4 sm:px-10 py-12 min-h-full rounded-2xl shadow-xl border border-white/40">
      {/* Advanced Abstract Background Blobs - animated organically */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-[#E27522] to-[#D05615] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-gradient-to-tr from-[#221A16] to-[#4A3B32] rounded-[60%_40%_30%_70%/60%_30%_70%_40%] mix-blend-multiply filter blur-3xl opacity-10 pointer-events-none z-0"></div>
      <div className="absolute top-[40%] left-[20%] w-[30%] h-[30%] bg-gradient-to-tr from-[#E27522] to-transparent rounded-full mix-blend-multiply filter blur-2xl opacity-10 pointer-events-none z-0"></div>

      {/* Modern Header */}
      <div className="relative z-10 flex flex-col items-center text-center pb-10">
        <div className="mb-6 w-20 h-20 rounded-[2rem] bg-[#221A16] rotate-3 flex items-center justify-center shadow-lg border-4 border-white">
          <span className="text-3xl text-[#E27522] -rotate-3 font-serif italic">M</span>
        </div>
        <h1 className="text-5xl sm:text-7xl font-black text-[#221A16] tracking-tighter leading-none" style={{ fontFamily: template.typography.heading }}>
          {restaurant.name.split(' ').map((word, i) => (
            <span key={i} className={i % 2 !== 0 ? 'text-[#E27522] italic font-serif mr-2' : 'mr-2'}>{word}</span>
          ))}
        </h1>
        <p className="mt-4 px-6 py-2 bg-white/60 backdrop-blur-md rounded-full text-xs text-[#64544A] font-bold uppercase tracking-[0.3em] shadow-sm border border-white/50">
          {restaurant.tagline || 'Modern Culinary Experience'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
        {categories.map((cat) => (
          <div key={cat.id} className="space-y-8 relative">
            {/* Pill-shaped modern header */}
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#E27522]/30"></div>
              <div className="inline-flex items-center justify-center bg-white border border-[#E27522]/20 text-[#221A16] px-8 py-3 rounded-full shadow-md shadow-[#E27522]/5">
                <span className="w-2 h-2 rounded-full bg-[#E27522] mr-3"></span>
                <h2 className="text-sm font-black uppercase tracking-[0.2em]" style={{ fontFamily: template.typography.body }}>
                  {cat.name}
                </h2>
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#E27522]/30"></div>
            </div>
            
            <div className="space-y-5">
              {cat.items.map((item) => (
                <div key={item.id} className="group flex gap-5 items-center bg-white/70 hover:bg-white p-4 rounded-3xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-10px_rgba(226,117,34,0.15)] transition-all duration-300 backdrop-blur-xl border border-white">
                  <div className="w-16 h-16 rounded-[1.2rem] shrink-0 bg-gradient-to-br from-[#E27522]/10 to-[#E27522]/5 flex items-center justify-center border border-[#E27522]/20 overflow-hidden relative">
                    <span className="text-[#E27522]/20 font-serif text-4xl absolute -right-1 -bottom-2">{item.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-bold text-base text-[#221A16] leading-tight group-hover:text-[#E27522] transition-colors">{item.name}</h3>
                      <div className="shrink-0 font-black text-sm text-[#221A16] bg-[#F5F0E6] px-3 py-1 rounded-xl shadow-inner border border-[#E27522]/10">
                        ₹{item.price}
                      </div>
                    </div>
                    {item.description && <p className="text-xs text-[#64544A] mt-2 leading-relaxed opacity-80 line-clamp-2">{item.description}</p>}
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

// 18. DARK CLIPBOARD LAYOUT
const DarkClipboardLayout: React.FC<LayoutProps> = ({ template, restaurant, categories }) => {
  return (
    <div className="space-y-8 bg-[#111214] text-[#E0E0E0] rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden relative border-t-[12px] border-[#2A2A2A] mx-auto px-4 sm:px-8 py-8 w-full max-w-3xl">
      {/* Clip mechanism visual */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[12px] w-32 h-6 bg-gradient-to-b from-[#444] to-[#222] rounded-b-md shadow-lg border border-[#555]"></div>
      
      {/* Subtle line art background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#F26D21 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      <div className="relative z-10 border-b border-[#333] pb-6 mb-8 flex flex-col md:flex-row justify-between items-center md:items-end">
        <div className="text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
            <span className="w-2 h-2 rounded-full bg-[#F26D21] animate-pulse"></span>
            <span className="text-[10px] text-[#F26D21] font-mono tracking-[0.3em] uppercase">DIGITAL MENU</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter" style={{ fontFamily: template.typography.heading }}>
            {restaurant.name}
          </h1>
        </div>
        {restaurant.logo && (
          <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#333] mt-4 md:mt-0">
             <img src={restaurant.logo} alt="Logo" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <div className="space-y-10 relative z-10">
        {categories.map((cat) => (
          <div key={cat.id} className="relative">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-lg font-black text-[#F26D21] uppercase tracking-widest" style={{ fontFamily: template.typography.heading }}>
                {cat.name}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-[#F26D21]/50 to-transparent"></div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {cat.items.map((item) => (
                <div key={item.id} className="group relative bg-[#1A1C1F] rounded-lg p-4 border border-[#333] hover:border-[#F26D21]/50 transition-colors duration-300 flex items-center justify-between overflow-hidden">
                  {/* Hover accent */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F26D21] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                  
                  <div className="flex-1 pr-6 z-10">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-sm text-white group-hover:text-[#F26D21] transition-colors">{item.name}</h3>
                      <span className="font-mono font-bold text-sm text-[#F26D21] bg-[#F26D21]/10 px-2 py-0.5 rounded">₹{item.price}</span>
                    </div>
                    {item.description && <p className="text-[11px] text-[#888] line-clamp-2 mt-2 leading-relaxed">{item.description}</p>}
                  </div>
                  <div className="w-16 h-16 rounded-full border border-[#333] shrink-0 flex items-center justify-center bg-[#111214] relative overflow-hidden group-hover:border-[#F26D21]/30 transition-colors">
                    <span className="text-[#333] font-black text-2xl group-hover:text-[#F26D21]/20 transition-colors">{item.name.substring(0, 2).toUpperCase()}</span>
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

export default MenuTemplateRenderer;
