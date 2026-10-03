import SiteHeader from '../../components/marketing/SiteHeader';
import SiteFooter from '../../components/marketing/SiteFooter';
import HeroSection from '../../components/marketing/HeroSection';
import OneQrSection from '../../components/marketing/OneQrSection';
import PhysicalQrSection from '../../components/marketing/PhysicalQrSection';
import BuiltForTableSection from '../../components/marketing/BuiltForTableSection';
import TemplateGallerySection from '../../components/marketing/TemplateGallerySection';
import DashboardDemoSection from '../../components/marketing/DashboardDemoSection';
import SubscriptionSection from '../../components/marketing/SubscriptionSection';
import HowItWorksSection from '../../components/marketing/HowItWorksSection';
import CustomerExperienceSection from '../../components/marketing/CustomerExperienceSection';
import PricingSection from '../../components/marketing/PricingSection';
import FaqSection from '../../components/marketing/FaqSection';
import FinalCtaSection from '../../components/marketing/FinalCtaSection';
import './PublicHomePage.css';

export default function PublicHomePage() {
  return (
    <div className="bg-[#151c19] min-h-screen text-white font-sans overflow-x-hidden relative selection:bg-[#e8783c] selection:text-white">
      {/* Background Dot-Grid Texture */}
      <div className="fixed inset-0 opacity-[0.08] pointer-events-none z-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Ambient Spotlight Mesh Backgrounds */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-[#e8783c]/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-1/3 right-1/4 w-[600px] h-[600px] bg-[#ffc928]/5 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* Header */}
      <SiteHeader />

      {/* Main Narrative Chapters */}
      <main className="relative z-10">
        <HeroSection />
        <OneQrSection />
        <PhysicalQrSection />
        <BuiltForTableSection />
        <TemplateGallerySection />
        <DashboardDemoSection />
        <SubscriptionSection />
        <HowItWorksSection />
        <CustomerExperienceSection />
        <PricingSection />
        <FaqSection />
        <FinalCtaSection />
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}