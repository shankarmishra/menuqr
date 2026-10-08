import SiteHeader from '../../components/marketing/SiteHeader';
import SiteFooter from '../../components/marketing/SiteFooter';
import { SEO } from '../../seo/SEO';
import BreadcrumbNav from '../../components/seo/BreadcrumbNav';
import { getBreadcrumbSchema, getOrganizationSchema } from '../../seo/structuredData';

export default function RefundPolicyPage() {
  const breadcrumbs = [{ name: 'Refund Policy', path: '/refund-cancellation' }];

  return (
    <div className="bg-[#FAFAF7] min-h-screen text-gray-900 font-sans">
      <SEO 
        title="Refund & Cancellation Policy | MenusQR"
        description="Official refund and cancellation policy for MenusQR subscription plans."
        canonicalUrl="/refund-cancellation"
        schema={[getOrganizationSchema(), getBreadcrumbSchema(breadcrumbs)]}
      />
      <SiteHeader />
      
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto">
        <BreadcrumbNav items={breadcrumbs} />
        
        <h1 className="text-4xl font-extrabold text-[#151C19] mb-8">Refund & Cancellation Policy</h1>
        
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm space-y-6 text-[#151C19]/80 text-base leading-relaxed">
          <p>Last updated: October 2026</p>

          <h2 className="text-xl font-bold text-[#151C19]">1. Subscription Cancellations</h2>
          <p>
            You may cancel your MenusQR subscription plan at any time through your account dashboard or by emailing <a href="mailto:support@menusqr.in" className="text-[#E8783C] font-bold">support@menusqr.in</a>. Upon cancellation, your service will remain active until the end of your paid subscription cycle.
          </p>

          <h2 className="text-xl font-bold text-[#151C19]">2. Refund Policy</h2>
          <p>
            Due to the immediate provisioning of digital infrastructure, table QR code generation, and hosting resources, subscription fees are generally non-refundable once activated.
          </p>

          <h2 className="text-xl font-bold text-[#151C19]">3. Assistance & Discrepancies</h2>
          <p>
            If you encounter billing issues or duplicate transactions, please reach out to our support team at <a href="mailto:support@menusqr.in" className="text-[#E8783C] font-bold">support@menusqr.in</a> within 7 days for review.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
