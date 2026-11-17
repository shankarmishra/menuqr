import SiteHeader from '../../components/marketing/SiteHeader';
import SiteFooter from '../../components/marketing/SiteFooter';
import HeroSection from '../../components/marketing/HeroSection';
import OneQrSection from '../../components/marketing/OneQrSection';
import PhysicalQrSection from '../../components/marketing/PhysicalQrSection';
import BuiltForTableSection from '../../components/marketing/BuiltForTableSection';
import TemplateGallerySection from '../../components/marketing/TemplateGallerySection';
import SameMenuDifferentPersonality from '../../components/marketing/template-gallery/SameMenuDifferentPersonality';
import RoyalHeritageMenuSection from '../../components/marketing/RoyalHeritageMenuSection';
import DashboardDemoSection from '../../components/marketing/DashboardDemoSection';
import PremiumOrderingSection from '../../components/marketing/PremiumOrderingSection';
import PlanComparisonSection from '../../components/marketing/PlanComparisonSection';
import HowItWorksSection from '../../components/marketing/HowItWorksSection';
import CustomerExperienceSection from '../../components/marketing/CustomerExperienceSection';
import CharacterCarouselSection from '../../components/marketing/CharacterCarouselSection';
import FaqSection, { faqs } from '../../components/marketing/FaqSection';
import FinalCtaSection from '../../components/marketing/FinalCtaSection';
import { Helmet } from 'react-helmet-async';
import { SEO } from '../../seo/SEO';
import { getOrganizationSchema, getWebSiteSchema, getFaqSchema, getWebPageSchema } from '../../seo/structuredData';
import './PublicHomePage.css';

export default function PublicHomePage() {
  return (
    <div className="bg-[#FAFAF7] min-h-screen text-gray-900 font-sans overflow-x-clip relative selection:bg-[#e8783c] selection:text-white">
      <SEO 
        title="MenusQR (Menus QR): QR Menu & Ordering for Restaurants"
        description="MenusQR is an Indian QR menu platform: menu designs made for Indian food, table ordering, kitchen screen and billing. From ₹1,999 a year, no commission."
        canonicalUrl="/"
        type="website"
        schema={[getOrganizationSchema(), getWebSiteSchema(), getFaqSchema(faqs), getWebPageSchema('/', 'MenusQR (Menus QR): QR Menu & Ordering for Restaurants', ['h1', '#faq h3'])]}
      />
      <Helmet>
        <link rel="preload" as="image" href="/marketing/hero/hero-restaurant-poster.webp" type="image/webp" fetchPriority="high" />
      </Helmet>
      {/* Header */}
      <SiteHeader />

      {/* Main Narrative Chapters */}
      <main id="main-content" className="relative z-10">
        <HeroSection />
        <OneQrSection />
        <PhysicalQrSection />
        <BuiltForTableSection />
        <TemplateGallerySection />
        <SameMenuDifferentPersonality />
        <RoyalHeritageMenuSection />
        <CharacterCarouselSection />
        <DashboardDemoSection />
        <PremiumOrderingSection />
        <PlanComparisonSection />
        <HowItWorksSection />
        <CustomerExperienceSection />
        <FaqSection />
        <FinalCtaSection />
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
