import React from 'react';
import type { LayoutProps } from '../types';
import { GraphicBookletTemplate } from '../shared/GraphicBookletTemplate';
import { GRAPHIC_THEME_CONFIGS } from '../configs/graphicThemeConfigs';

const createGraphicTemplate = (themeId: string) => {
  const Component: React.FC<LayoutProps> = (props) => {
    const config = GRAPHIC_THEME_CONFIGS[themeId] || GRAPHIC_THEME_CONFIGS['craft-trattoria'];
    return <GraphicBookletTemplate {...props} config={config} />;
  };
  Component.displayName = `GraphicTemplate_${themeId}`;
  return Component;
};

// 1. Craft Trattoria & Pizzeria (Direct mirror of Image 1)
export const CraftTrattoriaTemplate = createGraphicTemplate('craft-trattoria');

// 2. Midnight Burger & Grill Club (Direct mirror of Image 2)
export const MidnightBurgerTemplate = createGraphicTemplate('midnight-burger');

// 3. Royal Awadhi Dastarkhwan
export const AwadhiDastarkhwanTemplate = createGraphicTemplate('awadhi-dastarkhwan');

// 4. Sweet Velvet Patisserie
export const ArtisanPastryTemplate = createGraphicTemplate('artisan-pastry');

// 5. Tokyo Ramen & Izakaya Club
export const TokyoIzakayaTemplate = createGraphicTemplate('tokyo-izakaya');

// 6. Coastal Catch & Raw Bar
export const CoastalSeafoodTemplate = createGraphicTemplate('coastal-seafood');

// 7. Rustic Smokehouse & BBQ Bar
export const RusticSmokehouseTemplate = createGraphicTemplate('rustic-smokehouse');

// 8. Botanica Organic Kitchen & Bowls
export const GreenhouseBotanicTemplate = createGraphicTemplate('greenhouse-botanic');

// 9. Grand Highway Dhaba
export const DesiDhabaTemplate = createGraphicTemplate('desi-dhaba');

// 10. The Bohemian Taproom & Grill
export const BohoTaproomTemplate = createGraphicTemplate('boho-taproom');
