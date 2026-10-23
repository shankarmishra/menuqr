import SiteHeader from '../../components/marketing/SiteHeader';
import SiteFooter from '../../components/marketing/SiteFooter';
import { SEO } from '../../seo/SEO';
import BreadcrumbNav from '../../components/seo/BreadcrumbNav';
import { getBreadcrumbSchema, getOrganizationSchema } from '../../seo/structuredData';

export default function TermsPage() {
  const breadcrumbs = [{ name: 'Terms of Service', path: '/terms' }];

  return (
    <div className="bg-[#FAFAF7] min-h-screen text-gray-900 font-sans relative overflow-x-clip">
      <div className="texture-indian-heritage fixed inset-0 pointer-events-none z-0" />
      <SEO 
        title="Terms of Service | MenusQR"
        description="Review the MenusQR terms of service for restaurant owners and platform users."
        canonicalUrl="/terms"
        schema={[getOrganizationSchema(), getBreadcrumbSchema(breadcrumbs)]}
      />
      <SiteHeader />
      
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto relative z-10">
        <BreadcrumbNav items={breadcrumbs} />
        
        <h1 className="text-4xl font-extrabold text-[#151C19] mb-8">MenusQR Terms of Service</h1>
        
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm space-y-6 text-[#151C19]/80 text-base leading-relaxed">
          <p>Last updated: October 2026</p>

          <h2 className="text-xl font-bold text-[#151C19]">1. Agreement to Terms</h2>
          <p>
            By creating a MenusQR account or accessing our services, you agree to comply with and be bound by these Terms of Service.
          </p>

          <h2 className="text-xl font-bold text-[#151C19]">2. Platform Usage & Responsibilities</h2>
          <p>
            Restaurant owners are responsible for ensuring that all published menu descriptions, prices, dietary tags, and business information comply with local regulations and are accurate.
          </p>

          <h2 className="text-xl font-bold text-[#151C19]">3. Subscriptions & Renewal</h2>
          <p>
            MenusQR services are billed on a yearly subscription basis (Basic ₹559/mo or ₹1,999/yr, Intermediate ₹959/mo or ₹3,199/yr, Premium ₹1,119/mo or ₹6,799/yr). Subscriptions must be renewed prior to expiration to maintain uninterrupted access.
          </p>

          <h2 className="text-xl font-bold text-[#151C19]">4. Limitation of Liability</h2>
          <p>
            MenusQR is not liable for indirect or consequential damages resulting from service interruptions or third-party network connectivity issues.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
