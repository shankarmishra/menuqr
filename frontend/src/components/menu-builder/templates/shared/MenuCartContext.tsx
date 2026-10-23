import { createContext, useContext } from 'react';

export interface MenuCartContextType {
  onAddToCart?: (item: any, priceStr: string, variant?: string) => void;
  onRemoveFromCart?: (itemId: string, variant?: string) => void;
  getItemQuantity?: (itemId: string, variant?: string) => number;
  isPremium?: boolean;
}

export const MenuCartContext = createContext<MenuCartContextType>({});

export const useMenuCart = () => useContext(MenuCartContext);
