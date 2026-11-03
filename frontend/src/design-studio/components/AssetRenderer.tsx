import React from 'react';
import {
  IllusRestaurantOwner,
  IllusWaiterOrder,
  IllusChefKitchen,
  IllusQrScanning,
  IllusMenuManagement,
  IllusPosBilling,
  IllusKitchenDisplay,
  IllusOnlineOrdering,
  IllusSalesAnalytics,
  IllusRestaurantOnboarding,
  IllusSubscriptionBilling,
  IllusEmptyState,
} from '../../components/illustrations';
import {
  AnimQrScanner,
  AnimOrderPulse,
  AnimWaiterToKitchen,
  AnimMenuPublish,
  AnimAddToCart,
  AnimPaymentStamp,
  AnimKitchenFlame,
  AnimAnalyticsDraw,
} from '../../components/motion';

interface Props {
  assetId: string;
  theme?: 'emerald' | 'parchment' | 'neutral';
  animated?: boolean;
  className?: string;
  speed?: number;
  loop?: boolean;
  reducedMotion?: boolean;
}

export const AssetRenderer: React.FC<Props> = ({
  assetId,
  theme = 'emerald',
  animated = true,
  className = '',
  speed = 1,
  loop = true,
  reducedMotion = false,
}) => {
  switch (assetId) {
    // ── 12 ILLUSTRATIONS ────────────────────────────────────────────────
    case 'illus-restaurant-owner':
      return <IllusRestaurantOwner size="responsive" theme={theme} animated={animated} className={className} />;
    case 'illus-waiter-order':
      return <IllusWaiterOrder size="responsive" theme={theme} animated={animated} className={className} />;
    case 'illus-chef-kitchen':
      return <IllusChefKitchen size="responsive" theme={theme} animated={animated} className={className} />;
    case 'illus-qr-scanning':
      return <IllusQrScanning size="responsive" theme={theme} animated={animated} className={className} />;
    case 'illus-menu-management':
      return <IllusMenuManagement size="responsive" theme={theme} animated={animated} className={className} />;
    case 'illus-pos-billing':
      return <IllusPosBilling size="responsive" theme={theme} animated={animated} className={className} />;
    case 'illus-kitchen-display':
      return <IllusKitchenDisplay size="responsive" theme={theme} animated={animated} className={className} />;
    case 'illus-online-ordering':
      return <IllusOnlineOrdering size="responsive" theme={theme} animated={animated} className={className} />;
    case 'illus-sales-analytics':
      return <IllusSalesAnalytics size="responsive" theme={theme} animated={animated} className={className} />;
    case 'illus-restaurant-onboarding':
      return <IllusRestaurantOnboarding size="responsive" theme={theme} animated={animated} className={className} />;
    case 'illus-subscription-billing':
      return <IllusSubscriptionBilling size="responsive" theme={theme} animated={animated} className={className} />;
    case 'illus-empty-state':
      return <IllusEmptyState size="responsive" theme={theme} animated={animated} className={className} />;

    // ── 8 ANIMATIONS ────────────────────────────────────────────────────
    case 'anim-qr-scanner':
      return <AnimQrScanner isPlaying={animated} speed={speed} loop={loop} reducedMotion={reducedMotion} className={className} />;
    case 'anim-order-pulse':
      return <AnimOrderPulse isPlaying={animated} speed={speed} loop={loop} reducedMotion={reducedMotion} className={className} />;
    case 'anim-waiter-to-kitchen':
      return <AnimWaiterToKitchen isPlaying={animated} speed={speed} loop={loop} reducedMotion={reducedMotion} className={className} />;
    case 'anim-menu-publish':
      return <AnimMenuPublish isPlaying={animated} speed={speed} loop={loop} reducedMotion={reducedMotion} className={className} />;
    case 'anim-add-to-cart':
      return <AnimAddToCart isPlaying={animated} speed={speed} loop={loop} reducedMotion={reducedMotion} className={className} />;
    case 'anim-payment-stamp':
      return <AnimPaymentStamp isPlaying={animated} speed={speed} loop={loop} reducedMotion={reducedMotion} className={className} />;
    case 'anim-kitchen-flame':
      return <AnimKitchenFlame isPlaying={animated} speed={speed} loop={loop} reducedMotion={reducedMotion} className={className} />;
    case 'anim-analytics-draw':
      return <AnimAnalyticsDraw isPlaying={animated} speed={speed} loop={loop} reducedMotion={reducedMotion} className={className} />;

    default:
      return null;
  }
};
