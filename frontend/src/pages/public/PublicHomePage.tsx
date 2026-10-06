import { MenusQRLoader } from '../../components/brand/MenusQRLoader';
import SiteHeader from '../../components/marketing/SiteHeader';
import SiteFooter from '../../components/marketing/SiteFooter';
import HeroSection from '../../components/marketing/HeroSection';
import OneQrSection from '../../components/marketing/OneQrSection';
import PhysicalQrSection from '../../components/marketing/PhysicalQrSection';
import BuiltForTableSection from '../../components/marketing/BuiltForTableSection';
import TemplateGallerySection from '../../components/marketing/TemplateGallerySection';
import SameMenuDifferentPersonality from '../../components/marketing/template-gallery/SameMenuDifferentPersonality';
import DashboardDemoSection from '../../components/marketing/DashboardDemoSection';
import PremiumOrderingSection from '../../components/marketing/PremiumOrderingSection';
import PlanComparisonSection from '../../components/marketing/PlanComparisonSection';
import HowItWorksSection from '../../components/marketing/HowItWorksSection';
import CustomerExperienceSection from '../../components/marketing/CustomerExperienceSection';
import FaqSection from '../../components/marketing/FaqSection';
import FinalCtaSection from '../../components/marketing/FinalCtaSection';
import { SEO } from '../../seo/SEO';
import { getOrganizationSchema, getWebSiteSchema } from '../../seo/structuredData';
import './PublicHomePage.css';

export default function PublicHomePage() {
  return (
    <div className="bg-[#FAFAF7] min-h-screen text-gray-900 font-sans overflow-x-clip relative selection:bg-[#e8783c] selection:text-white">
      <SEO 
        title="MenusQR | Digital QR Menu & Ordering for Restaurants"
        description="MenusQR helps restaurants and cafés create beautiful digital QR menus. Manage your menu, choose your design, and let Premium customers order directly from the table."
        canonicalUrl="/"
        type="website"
        schema={[getOrganizationSchema(), getWebSiteSchema()]}
      />
      {/* Brand Opening Loader (Plays once per browser session) */}
      <MenusQRLoader />

      {/* Header */}
      <SiteHeader />

      {/* Main Narrative Chapters */}
      <main className="relative z-10">
        <HeroSection />
        <OneQrSection />
        <PhysicalQrSection />
        <BuiltForTableSection />
        <TemplateGallerySection />
        <SameMenuDifferentPersonality />
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
