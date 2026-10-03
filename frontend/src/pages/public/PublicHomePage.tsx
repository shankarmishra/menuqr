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
    <div className="bg-[#151c19] min-h-screen text-white font-sans overflow-x-hidden">
      <SiteHeader />
      <main>
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
      <SiteFooter />
    </div>
  );
}