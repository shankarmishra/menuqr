import { createContext, useContext } from 'react';

export interface MenuCartContextType {
  onAddToCart?: (item: any, priceStr: string, variant?: string, instructions?: string, spiceLevel?: number) => void;
  onRemoveFromCart?: (itemId: string, variant?: string) => void;
  getItemQuantity?: (itemId: string, variant?: string) => number;
  onCustomizeDish?: (item: any) => void;
  isPremium?: boolean;
}

export const MenuCartContext = createContext<MenuCartContextType>({});

export const useMenuCart = () => useContext(MenuCartContext);
