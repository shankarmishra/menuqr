import React from 'react';
import type { LayoutProps } from './types';
import { TEMPLATE_TEXTURES } from './assets/textures';

export type TemplateComponentType = React.ComponentType<LayoutProps> | React.LazyExoticComponent<React.ComponentType<LayoutProps>>;

const lazyTemplate = (
  importer: () => Promise<any>,
  namedExport: string
): React.LazyExoticComponent<React.ComponentType<LayoutProps>> => {
  return React.lazy(() =>
    importer().then((mod) => ({
      default: mod[namedExport] || mod.default,
    }))
  );
};

// Module-scoped lazy singletons — instantiated once so promise and component references remain stable
const RoyalMaharajaTemplate = lazyTemplate(
  () => import('./RoyalMaharaja/RoyalMaharajaTemplate'),
  'RoyalMaharajaTemplate'
);
const RajasthaniHeritageTemplate = lazyTemplate(
  () => import('./RajasthaniHeritage/RajasthaniHeritageTemplate'),
  'RajasthaniHeritageTemplate'
);
const MughalLuxeTemplate = lazyTemplate(
  () => import('./MughalLuxe/MughalLuxeTemplate'),
  'MughalLuxeTemplate'
);
const BanarasiGoldTemplate = lazyTemplate(
  () => import('./BanarasiGold/BanarasiGoldTemplate'),
  'BanarasiGoldTemplate'
);
const SouthIndianHeritageTemplate = lazyTemplate(
  () => import('./SouthIndianHeritage/SouthIndianHeritageTemplate'),
  'SouthIndianHeritageTemplate'
);
const IndianStreetKitchenTemplate = lazyTemplate(
  () => import('./IndianStreetKitchen/IndianStreetKitchenTemplate'),
  'IndianStreetKitchenTemplate'
);
const ModernIndiaTemplate = lazyTemplate(
  () => import('./ModernIndia/ModernIndiaTemplate'),
  'ModernIndiaTemplate'
);
const SpiceHouseTemplate = lazyTemplate(
  () => import('./SpiceHouse/SpiceHouseTemplate'),
  'SpiceHouseTemplate'
);
const MaisonNoirTemplate = lazyTemplate(
  () => import('./MaisonNoir/MaisonNoirTemplate'),
  'MaisonNoirTemplate'
);
const IvoryDiningTemplate = lazyTemplate(
  () => import('./IvoryDining/IvoryDiningTemplate'),
  'IvoryDiningTemplate'
);
const GrandTableTemplate = lazyTemplate(
  () => import('./GrandTable/GrandTableTemplate'),
  'GrandTableTemplate'
);
const CoffeeHouseTemplate = lazyTemplate(
  () => import('./CoffeeHouse/CoffeeHouseTemplate'),
  'CoffeeHouseTemplate'
);
const PaperCafeTemplate = lazyTemplate(
  () => import('./PaperCafe/PaperCafeTemplate'),
  'PaperCafeTemplate'
);
const BombayStreetTemplate = lazyTemplate(
  () => import('./BombayStreet/BombayStreetTemplate'),
  'BombayStreetTemplate'
);
const MinimalEditorialTemplate = lazyTemplate(
  () => import('./MinimalEditorial/MinimalEditorialTemplate'),
  'MinimalEditorialTemplate'
);

export const getTemplateComponent = (id: string): TemplateComponentType => {
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
