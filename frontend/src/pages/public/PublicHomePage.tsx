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
import SpatialStudioMockup from '../../components/marketing/SpatialStudioMockup';
import FaqSection from '../../components/marketing/FaqSection';
import FinalCtaSection from '../../components/marketing/FinalCtaSection';
import { SEO } from '../../seo/SEO';
import { getOrganizationSchema, getWebSiteSchema } from '../../seo/structuredData';
import './PublicHomePage.css';

export default function PublicHomePage() {
  return (
    <div className="bg-[#FAFAF7] min-h-screen text-gray-900 font-sans overflow-x-clip relative selection:bg-[#e8783c] selection:text-white">
      <SEO 
        title="MenusQR | Digital QR Menu for Restaurants"
        description="Create a professional digital QR menu for your restaurant. Update dishes, prices and availability without reprinting your QR code."
        canonicalUrl="/"
        type="website"
        schema={[getOrganizationSchema(), getWebSiteSchema()]}
      />
      {/* Header */}
      <SiteHeader />

      {/* Main Narrative Chapters */}
      <main className="relative z-10">
        <HeroSection />
        <OneQrSection />
        <PhysicalQrSection />
        <BuiltForTableSection />
        {/* ThreeUI-Style 3D Spatial Studio Showcase */}
        <section className="py-8 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <SpatialStudioMockup />
        </section>
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
