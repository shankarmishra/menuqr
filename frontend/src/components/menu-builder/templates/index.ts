import React from 'react';
import type { LayoutProps } from './types';
import { TEMPLATE_TEXTURES } from './assets/textures';

import { RoyalMaharajaTemplate } from './RoyalMaharaja/RoyalMaharajaTemplate';
import { RajasthaniHeritageTemplate } from './RajasthaniHeritage/RajasthaniHeritageTemplate';
import { MughalLuxeTemplate } from './MughalLuxe/MughalLuxeTemplate';
import { BanarasiGoldTemplate } from './BanarasiGold/BanarasiGoldTemplate';
import { SouthIndianHeritageTemplate } from './SouthIndianHeritage/SouthIndianHeritageTemplate';
import { IndianStreetKitchenTemplate } from './IndianStreetKitchen/IndianStreetKitchenTemplate';
import { ModernIndiaTemplate } from './ModernIndia/ModernIndiaTemplate';
import { SpiceHouseTemplate } from './SpiceHouse/SpiceHouseTemplate';
import { MaisonNoirTemplate } from './MaisonNoir/MaisonNoirTemplate';
import { IvoryDiningTemplate } from './IvoryDining/IvoryDiningTemplate';
import { GrandTableTemplate } from './GrandTable/GrandTableTemplate';
import { CoffeeHouseTemplate } from './CoffeeHouse/CoffeeHouseTemplate';
import { PaperCafeTemplate } from './PaperCafe/PaperCafeTemplate';
import { BombayStreetTemplate } from './BombayStreet/BombayStreetTemplate';
import { MinimalEditorialTemplate } from './MinimalEditorial/MinimalEditorialTemplate';

export const getTemplateComponent = (id: string): React.FC<LayoutProps> => {
  switch (id) {
    case '01':
    case 'royal-maharaja':
      return RoyalMaharajaTemplate;
    case '02':
    case 'rajasthani-heritage':
    case 'heritage-parchment':
      return RajasthaniHeritageTemplate;
    case '03':
    case 'mughal-luxe':
    case 'emerald-heritage':
      return MughalLuxeTemplate;
    case '04':
    case 'banarasi-gold':
      return BanarasiGoldTemplate;
    case '05':
    case 'south-indian-heritage':
      return SouthIndianHeritageTemplate;
    case '06':
    case 'indian-street-kitchen':
      return IndianStreetKitchenTemplate;
    case '07':
    case 'modern-india':
      return ModernIndiaTemplate;
    case '08':
    case 'spice-house':
      return SpiceHouseTemplate;
    case '09':
    case 'maison-noir':
      return MaisonNoirTemplate;
    case '10':
    case 'ivory-dining':
      return IvoryDiningTemplate;
    case '11':
    case 'grand-table':
      return GrandTableTemplate;
    case '12':
    case 'coffee-house':
      return CoffeeHouseTemplate;
    case '13':
    case 'paper-cafe':
      return PaperCafeTemplate;
    case '14':
    case 'bombay-street':
      return BombayStreetTemplate;
    case '15':
    case 'minimal-editorial':
    default:
      return MinimalEditorialTemplate;
  }
};

export const getTemplateTextureKey = (id: string): keyof typeof TEMPLATE_TEXTURES => {
  switch (id) {
    case '01':
    case 'royal-maharaja':
      return 'royalMaharaja';
    case '02':
    case 'rajasthani-heritage':
    case 'heritage-parchment':
      return 'rajasthaniHeritage';
    case '03':
    case 'mughal-luxe':
    case 'emerald-heritage':
      return 'mughalLuxe';
    case '04':
    case 'banarasi-gold':
      return 'banarasiGold';
    case '05':
    case 'south-indian-heritage':
      return 'southIndianHeritage';
    case '06':
    case 'indian-street-kitchen':
      return 'indianStreetKitchen';
    case '07':
    case 'modern-india':
      return 'modernIndia';
    case '08':
    case 'spice-house':
      return 'spiceHouse';
    case '09':
    case 'maison-noir':
      return 'maisonNoir';
    case '10':
    case 'ivory-dining':
      return 'ivoryDining';
    case '11':
    case 'grand-table':
      return 'grandTable';
    case '12':
    case 'coffee-house':
      return 'coffeeHouse';
    case '13':
    case 'paper-cafe':
      return 'paperCafe';
    case '14':
    case 'bombay-street':
      return 'bombayStreet';
    case '15':
    case 'minimal-editorial':
    default:
      return 'minimalEditorial';
  }
};

export type { LayoutProps, CategoryGroup, MenuItem, RestaurantInfo } from './types';
export * from './assets/textures';
