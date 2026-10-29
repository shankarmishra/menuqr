import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import type { ReactElement } from 'react';
import HomePage from './pages/HomePage';
import PricingPage from './pages/purchase/PricingPage';
import DigitalQrMenu from './pages/public/seo/DigitalQrMenu';
import RestaurantQrMenu from './pages/public/seo/RestaurantQrMenu';
import DigitalMenuForRestaurants from './pages/public/seo/DigitalMenuForRestaurants';
import QrMenuForRestaurants from './pages/public/seo/QrMenuForRestaurants';
import RestaurantDigitalMenu from './pages/public/seo/RestaurantDigitalMenu';
import QrOrderingForRestaurants from './pages/public/seo/QrOrderingForRestaurants';
import HowItWorksPage from './pages/public/HowItWorksPage';
import TemplatesPage from './pages/public/TemplatesPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import FaqPage from './pages/public/FaqPage';
import PrivacyPolicyPage from './pages/public/PrivacyPolicyPage';
import TermsPage from './pages/public/TermsPage';
import RefundPolicyPage from './pages/public/RefundPolicyPage';

const pages: Record<string, () => ReactElement> = {
  '/': () => <HomePage />,
  '/plans': () => <PricingPage />,
  '/digital-qr-menu': () => <DigitalQrMenu />,
  '/restaurant-qr-menu': () => <RestaurantQrMenu />,
  '/digital-menu-for-restaurants': () => <DigitalMenuForRestaurants />,
  '/qr-menu-for-restaurants': () => <QrMenuForRestaurants />,
  '/restaurant-digital-menu': () => <RestaurantDigitalMenu />,
  '/qr-ordering-for-restaurants': () => <QrOrderingForRestaurants />,
  '/how-it-works': () => <HowItWorksPage />,
  '/templates': () => <TemplatesPage />,
  '/about': () => <AboutPage />,
  '/contact': () => <ContactPage />,
  '/faq': () => <FaqPage />,
  '/privacy': () => <PrivacyPolicyPage />,
  '/terms': () => <TermsPage />,
  '/refund-cancellation': () => <RefundPolicyPage />,
};

export const ssrPaths = Object.keys(pages);

export function render(url: string) {
  const helmetContext: { helmet?: Record<string, { toString(): string }> } = {};
  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>{pages[url]()}</StaticRouter>
    </HelmetProvider>,
  );
  return { html, helmet: helmetContext.helmet };
}
