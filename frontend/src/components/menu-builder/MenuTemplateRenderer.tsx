import React, { useState } from 'react';
import clsx from 'clsx';
import { menuTemplates, type MenuTemplate } from '../../data/menuTemplates';
import { getTemplateComponent, getTemplateTextureKey, TEMPLATE_TEXTURES, CategoryGroup, MenuItem } from './templates';

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
  const template = menuTemplates.find((t) => t.id === templateId || t.name.toLowerCase().replace(/\s+/g, '-') === templateId) || menuTemplates[0];
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Group items by category
  const sortedCategories = [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  
  const itemsByCategory: CategoryGroup[] = sortedCategories
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      items: items.filter((item) => item.category === cat.id || item.category === cat.name),
    }))
    .filter((cat) => cat.items.length > 0);

  const rawCategories: CategoryGroup[] =
    itemsByCategory.length > 0
      ? itemsByCategory
      : Array.from(new Set(items.map((i) => i.category))).map((catName, idx) => ({
          id: `cat-${idx}`,
          name: catName,
          items: items.filter((i) => i.category === catName),
        }));

  // Filter categories based on active category selection
  const filteredCategories = rawCategories.filter((cat) => {
    if (activeCategory !== 'all') {
      return cat.id === activeCategory || cat.name === activeCategory;
    }
    return true;
  });

  const TemplateComponent = getTemplateComponent(template.id);
  const textureKey = getTemplateTextureKey(template.id);
  const textureObj = TEMPLATE_TEXTURES[textureKey];

  return (
    <div
      className={clsx(
        'w-full transition-all duration-300 relative overflow-hidden',
        textureObj?.bg || 'bg-white',
        textureObj?.gradient || '',
        compact ? 'p-3 sm:p-4 text-xs' : 'p-4 sm:p-8 min-h-screen text-sm',
        className
      )}
      style={{
        fontFamily: template.typography.body,
        backgroundImage: textureObj?.overlayPattern !== 'none' ? textureObj?.overlayPattern : undefined,
      }}
    >
      <div className={clsx('mx-auto relative z-10', compact ? 'max-w-xl' : 'max-w-4xl')}>
        <TemplateComponent
          template={template}
          restaurant={restaurant}
          categories={filteredCategories}
          rawCategories={rawCategories}
          compact={compact}
          onAddToCart={onAddToCart}
          isPremium={isPremium}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
      </div>
    </div>
  );
};

export default MenuTemplateRenderer;
