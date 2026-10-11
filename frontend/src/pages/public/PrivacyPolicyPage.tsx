import SiteHeader from '../../components/marketing/SiteHeader';
import SiteFooter from '../../components/marketing/SiteFooter';
import { SEO } from '../../seo/SEO';
import BreadcrumbNav from '../../components/seo/BreadcrumbNav';
import { getBreadcrumbSchema, getOrganizationSchema } from '../../seo/structuredData';

export default function PrivacyPolicyPage() {
  const breadcrumbs = [{ name: 'Privacy Policy', path: '/privacy' }];

  return (
    <div className="bg-[#FAFAF7] min-h-screen text-gray-900 font-sans relative overflow-x-clip">
      <div className="texture-indian-heritage fixed inset-0 pointer-events-none z-0" />
      <SEO 
        title="Privacy Policy | MenusQR"
        description="Read the official MenusQR privacy policy detailing how user and restaurant data is collected, stored, and protected."
        canonicalUrl="/privacy"
        schema={[getOrganizationSchema(), getBreadcrumbSchema(breadcrumbs)]}
      />
      <SiteHeader />
      
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto relative z-10">
        <BreadcrumbNav items={breadcrumbs} />
        
        <h1 className="text-4xl font-extrabold text-[#151C19] mb-8">MenusQR Privacy Policy</h1>
        
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm space-y-6 text-[#151C19]/80 text-base leading-relaxed">
          <p>Last updated: October 2026</p>

          <h2 className="text-xl font-bold text-[#151C19]">1. Information We Collect</h2>
          <p>
            When you register for MenusQR, we collect account details such as your business name, contact name, email address, phone number, and menu data. When dining guests view a digital menu, standard server access logs (such as IP address and user-agent) are collected for performance and security purposes.
          </p>

          <h2 className="text-xl font-bold text-[#151C19]">2. How Information is Used</h2>
          <p>
            We use collected information to provide, maintain, and improve the MenusQR platform, process subscriptions, generate analytics for restaurant owners, and deliver support.
          </p>

          <h2 className="text-xl font-bold text-[#151C19]">3. Data Protection & Security</h2>
          <p>
            MenusQR implements industry-standard encryption and security practices to safeguard restaurant and user data against unauthorized access or disclosure.
          </p>

          <h2 className="text-xl font-bold text-[#151C19]">4. Contact Us</h2>
          <p>
            If you have questions regarding this Privacy Policy, contact us at <a href="mailto:support@menusqr.in" className="text-[#E8783C] font-bold">support@menusqr.in</a>.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
