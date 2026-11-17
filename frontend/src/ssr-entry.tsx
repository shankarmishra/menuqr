import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import type { ReactElement } from 'react';
import HomePage from './pages/HomePage';
import PricingPage from './pages/purchase/PricingPage';
import PillarPage from './pages/public/seo/PillarPage';
import GuidesIndexPage from './pages/public/seo/GuidesIndexPage';
import { PILLAR_PAGES, GUIDES, GUIDES_PATH, STANDALONE_PAGES } from './content';
import NichePage from './pages/public/seo/NichePage';
import { NICHE_PAGES, nichePath } from './pages/public/seo/nichePages';
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
  '/how-it-works': () => <HowItWorksPage />,
  '/templates': () => <TemplatesPage />,
  '/about': () => <AboutPage />,
  '/contact': () => <ContactPage />,
  '/faq': () => <FaqPage />,
  '/privacy': () => <PrivacyPolicyPage />,
  '/terms': () => <TermsPage />,
  '/refund-cancellation': () => <RefundPolicyPage />,
};

for (const page of [...PILLAR_PAGES, ...STANDALONE_PAGES]) pages[page.path] = () => <PillarPage page={page} />;
pages[GUIDES_PATH] = () => <GuidesIndexPage />;
for (const page of GUIDES) pages[page.path] = () => <PillarPage page={page} parents={[{ name: 'Guides', path: GUIDES_PATH }]} />;
for (const page of NICHE_PAGES) pages[nichePath(page.slug)] = () => <NichePage page={page} />;

export const ssrPaths = Object.keys(pages);

export function render(url: string) {
  const html = renderToString(
    <HelmetProvider>
      <StaticRouter location={url}>{pages[url]()}</StaticRouter>
    </HelmetProvider>,
  );
  return { html };
}
