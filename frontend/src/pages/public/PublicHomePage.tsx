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
import { SEO } from '../../seo/SEO';
import { getOrganizationSchema, getWebSiteSchema, getFaqSchema, getWebPageSchema } from '../../seo/structuredData';
import './PublicHomePage.css';

export default function PublicHomePage() {
  return (
    <div className="bg-[#FAFAF7] min-h-screen text-gray-900 font-sans overflow-x-clip relative selection:bg-[#e8783c] selection:text-white">
      <SEO 
        title="MenusQR | Digital QR Menu for Restaurants"
        description="Create a professional digital QR menu for your restaurant. Update dishes, prices and availability without reprinting your QR code."
        canonicalUrl="/"
        type="website"
        schema={[getOrganizationSchema(), getWebSiteSchema(), getFaqSchema(faqs), getWebPageSchema('/', 'MenusQR | Digital QR Menu for Restaurants', ['h1', '#faq h3'])]}
      />
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
