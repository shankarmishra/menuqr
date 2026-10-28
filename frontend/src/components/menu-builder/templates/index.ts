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
const EmberTemplate = lazyTemplate(
  () => import('./Ember/EmberTemplate'),
  'EmberTemplate'
);
const MaisonTemplate = lazyTemplate(
  () => import('./Maison/MaisonTemplate'),
  'MaisonTemplate'
);
const BotanicaTemplate = lazyTemplate(
  () => import('./Botanica/BotanicaTemplate'),
  'BotanicaTemplate'
);
const SmashClubTemplate = lazyTemplate(
  () => import('./SmashClub/SmashClubTemplate'),
  'SmashClubTemplate'
);
const TokyoTableTemplate = lazyTemplate(
  () => import('./TokyoTable/TokyoTableTemplate'),
  'TokyoTableTemplate'
);
const RivieraTemplate = lazyTemplate(
  () => import('./Riviera/RivieraTemplate'),
  'RivieraTemplate'
);
const GreenhouseTemplate = lazyTemplate(
  () => import('./Greenhouse/GreenhouseTemplate'),
  'GreenhouseTemplate'
);
const GullyTemplate = lazyTemplate(
  () => import('./Gully/GullyTemplate'),
  'GullyTemplate'
);
const PatisserieTemplate = lazyTemplate(
  () => import('./Patisserie/PatisserieTemplate'),
  'PatisserieTemplate'
);
const Studio10Template = lazyTemplate(
  () => import('./Studio10/Studio10Template'),
  'Studio10Template'
);

// 10 Independent Dedicated Masterpiece Templates
const CraftTrattoriaTemplate = lazyTemplate(
  () => import('./custom/CraftTrattoriaTemplate'),
  'CraftTrattoriaTemplate'
);
const MidnightBurgerTemplate = lazyTemplate(
  () => import('./custom/MidnightBurgerTemplate'),
  'MidnightBurgerTemplate'
);
const AwadhiDastarkhwanTemplate = lazyTemplate(
  () => import('./custom/AwadhiDastarkhwanTemplate'),
  'AwadhiDastarkhwanTemplate'
);
const ArtisanPastryTemplate = lazyTemplate(
  () => import('./custom/ArtisanPastryTemplate'),
  'ArtisanPastryTemplate'
);
const TokyoIzakayaTemplate = lazyTemplate(
  () => import('./custom/TokyoIzakayaTemplate'),
  'TokyoIzakayaTemplate'
);
const CoastalSeafoodTemplate = lazyTemplate(
  () => import('./custom/CoastalSeafoodTemplate'),
  'CoastalSeafoodTemplate'
);
const RusticSmokehouseTemplate = lazyTemplate(
  () => import('./custom/RusticSmokehouseTemplate'),
  'RusticSmokehouseTemplate'
);
const GreenhouseBotanicTemplate = lazyTemplate(
  () => import('./custom/GreenhouseBotanicTemplate'),
  'GreenhouseBotanicTemplate'
);
const DesiDhabaTemplate = lazyTemplate(
  () => import('./custom/DesiDhabaTemplate'),
  'DesiDhabaTemplate'
);
const BohoTaproomTemplate = lazyTemplate(
  () => import('./custom/BohoTaproomTemplate'),
  'BohoTaproomTemplate'
);

export const getTemplateComponent = (id: string): TemplateComponentType => {
  switch (id) {
    case 'craft-trattoria':
      return CraftTrattoriaTemplate;
    case 'midnight-burger':
      return MidnightBurgerTemplate;
    case 'awadhi-dastarkhwan':
      return AwadhiDastarkhwanTemplate;
    case 'artisan-pastry':
      return ArtisanPastryTemplate;
    case 'tokyo-izakaya':
      return TokyoIzakayaTemplate;
    case 'coastal-seafood':
      return CoastalSeafoodTemplate;
    case 'rustic-smokehouse':
      return RusticSmokehouseTemplate;
    case 'greenhouse-botanic':
      return GreenhouseBotanicTemplate;
    case 'desi-dhaba':
      return DesiDhabaTemplate;
    case 'boho-taproom':
      return BohoTaproomTemplate;
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
      return MinimalEditorialTemplate;
    case '16':
    case 'ember':
      return EmberTemplate;
    case '17':
    case 'maison':
      return MaisonTemplate;
    case '18':
    case 'botanica':
      return BotanicaTemplate;
    case '19':
    case 'smash-club':
      return SmashClubTemplate;
    case '20':
    case 'tokyo-table':
      return TokyoTableTemplate;
    case '21':
    case 'riviera':
      return RivieraTemplate;
    case '22':
    case 'greenhouse':
      return GreenhouseTemplate;
    case '23':
    case 'gully':
      return GullyTemplate;
    case '24':
    case 'patisserie':
      return PatisserieTemplate;
    case '25':
    case 'studio-10':
      return Studio10Template;
    default:
      return RajasthaniHeritageTemplate;
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
      return 'minimalEditorial';
    case '16':
    case 'ember':
      return 'ember';
    case '17':
    case 'maison':
      return 'maison';
    case '18':
    case 'botanica':
      return 'botanica';
    case '19':
    case 'smash-club':
      return 'smashClub';
    case '20':
    case 'tokyo-table':
      return 'tokyoTable';
    case '21':
    case 'riviera':
      return 'riviera';
    case '22':
    case 'greenhouse':
      return 'greenhouse';
    case '23':
    case 'gully':
      return 'gully';
    case '24':
    case 'patisserie':
      return 'patisserie';
    case '25':
    case 'studio-10':
      return 'studio10';
    default:
      return 'rajasthaniHeritage';
  }
};

export type { LayoutProps, CategoryGroup, MenuItem, RestaurantInfo } from './types';
export * from './assets/textures';
