import type { MenuTemplate } from '../../../data/menuTemplates';

export interface MenuItem {
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
  isSpecial?: boolean;
  spicyLevel?: number;
  image?: string;
}

export interface CategoryGroup {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface RestaurantInfo {
  name: string;
  tagline?: string;
  cuisine?: string;
  phone?: string;
  address?: string;
  city?: string;
  logo?: string;
}

export interface LayoutProps {
  template: MenuTemplate;
  restaurant: RestaurantInfo;
  categories: CategoryGroup[];
  rawCategories: CategoryGroup[];
  compact?: boolean;
  onAddToCart?: (item: MenuItem, priceStr: string, variant?: string) => void;
  isPremium?: boolean;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
}
