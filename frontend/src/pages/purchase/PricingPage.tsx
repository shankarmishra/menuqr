import { useState } from 'react';
import { Link } from 'react-router-dom';
import { trackSelectPlan } from '../../analytics/analytics';
import SiteHeader from '../../components/marketing/SiteHeader';
import SiteFooter from '../../components/marketing/SiteFooter';
import { Check, Sparkles } from 'lucide-react';
import { SEO } from '../../seo/SEO';
import BreadcrumbNav from '../../components/seo/BreadcrumbNav';
import GeoFaqSection from '../../components/seo/GeoFaqSection';
import { getBreadcrumbSchema, getOrganizationSchema, getSoftwareApplicationSchema } from '../../seo/structuredData';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'yearly' | 'monthly'>('yearly');
  const breadcrumbs = [{ name: 'Plans & Pricing', path: '/plans' }];

  const plans = [
    {
      id: 'basic',
      name: 'BASIC',
      monthlyPrice: '₹559',
      yearlyPrice: '₹1,999',
      savings: 'Save 70%',
      effectiveMonthly: '₹166/mo when billed yearly',
      description: 'Perfect for small cafes and food stalls starting their digital journey.',
      features: [
        'Permanent Table QR Code',
        'Up to 50 Menu Items',
        'Basic Design Template',
        'Universal Menu Search',
        'Dietary Tags (Veg/Non-Veg)',
        'Instant Customer Scan (No App)',
        'Print-Ready QR Download',
      ],
      highlight: false,
    },
    {
      id: 'intermediate',
      name: 'INTERMEDIATE',
      monthlyPrice: '₹959',
      yearlyPrice: '₹3,199',
      savings: 'Save 72%',
      effectiveMonthly: '₹266/mo when billed yearly',
      description: 'Ideal for growing restaurants needing more flexibility and style.',
      features: [
        'Permanent Table QR Code',
        'Up to 150 Menu Items',
        'Premium Design Templates',
        'Half/Full & Portion Variant Pricing',
        'Universal Menu Search',
        'Dietary Tags & Image Support',
        'Instant Customer Scan (No App)',
        'Standard Email Support',
      ],
      highlight: false,
    },
    {
      id: 'premium',
      name: 'PREMIUM',
      monthlyPrice: '₹1,119',
      yearlyPrice: '₹6,799',
      savings: 'Save 49%',
      effectiveMonthly: '₹566/mo when billed yearly',
      description: 'Everything you need to run a world-class digital menu for your restaurant.',
      features: [
        'Permanent Table QR Code',
        'Unlimited Menu Edits & Categories',
        'All 15 Premium Design Templates',
        'Direct Table QR Ordering System',
        'Half/Full & Portion Variant Pricing',
        'Universal Menu Search',
        'Dietary Tags & Image Support',
        'Priority Email Support',
      ],
      highlight: true,
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF7] relative overflow-x-clip">
      <div className="texture-indian-heritage fixed inset-0 pointer-events-none z-0" />
      <SEO 
        title="MenusQR Pricing | Digital Menu Plans for Restaurants"
        description="View MenusQR pricing plans. Basic from ₹559/mo (₹1,999/yr), Intermediate from ₹959/mo (₹3,199/yr), and Premium from ₹1,119/mo (₹6,799/yr). Create your digital restaurant QR menu today."
        canonicalUrl="/plans"
        schema={[
          getOrganizationSchema(),
          getBreadcrumbSchema(breadcrumbs),
          getSoftwareApplicationSchema(
            plans.map((plan) => ({
              name: plan.name.charAt(0) + plan.name.slice(1).toLowerCase(),
              price: Number(plan.yearlyPrice.replace(/[^\d]/g, '')),
            })),
          ),
        ]}
      />
      <SiteHeader />
      
      <main id="main-content" className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10">
        <BreadcrumbNav items={breadcrumbs} />
        
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#151C19] tracking-tight mb-4">
            Simple Digital Menu Plans for Restaurants
          </h1>
          <p className="text-lg text-[#53615a] font-medium">
            One permanent table QR code. Unlimited menu updates. Transparent pricing for every food business.
          </p>
        </div>

        {/* Monthly vs Yearly Toggle */}
        <div className="flex justify-center items-center mb-14">
          <div className="bg-gray-200/80 p-1.5 rounded-full inline-flex items-center shadow-inner">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-[#151C19] shadow-sm'
                  : 'text-[#151C19]/60 hover:text-[#151C19]'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-[#E8783C] text-white shadow-sm'
                  : 'text-[#151C19]/60 hover:text-[#151C19]'
              }`}
            >
              <span>Yearly Billing</span>
              <span className="bg-white/20 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={11} /> Save Up to 72%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan) => {
            const currentPrice = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
            const periodLabel = billingCycle === 'yearly' ? '/ year' : '/ month';

            return (
              <div 
                key={plan.id}
                className={`bg-white rounded-3xl shadow-xl border overflow-hidden flex flex-col ${
                  plan.highlight ? 'border-[#E8783C] ring-2 ring-[#E8783C]/20 relative transform md:-translate-y-4' : 'border-gray-100'
                }`}
              >
                {plan.highlight && (
                  <div className="bg-[#E8783C] text-white text-center py-2 text-sm font-bold tracking-wider">
                    MOST POPULAR
                  </div>
                )}
                <div className="p-8 md:p-10 flex-grow flex flex-col">
                  <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-6 w-max ${
                    plan.highlight ? 'bg-[#E8783C]/10 text-[#E8783C]' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {billingCycle === 'yearly' ? 'YEARLY' : 'MONTHLY'} {plan.name}
                  </div>

                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-black text-[#151C19]">{currentPrice}</span>
                    <span className="text-[#151C19]/60 font-medium">{periodLabel}</span>
                  </div>

                  {billingCycle === 'yearly' ? (
                    <div className="text-xs font-semibold text-emerald-600 mb-6 flex items-center gap-1.5">
                      <span className="bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">{plan.savings}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500 font-medium">{plan.effectiveMonthly}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 mb-6">
                      Billed monthly, cancel anytime
                    </div>
                  )}

                  <p className="text-[#151C19]/70 mb-8 pb-8 border-b border-gray-100 min-h-[80px]">
                    {plan.description}
                  </p>
                  
                  <ul className="space-y-5 mb-10 flex-grow">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-[#151C19]/80 font-medium">
                        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                          plan.highlight ? 'bg-[#E8783C]/10' : 'bg-gray-100'
                        }`}>
                          <Check size={14} className={plan.highlight ? 'text-[#E8783C]' : 'text-gray-600'} strokeWidth={3} />
                        </span>
                        <span className="leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={`/purchase/details?plan=${plan.id}&billing=${billingCycle}`}
                    onClick={() => trackSelectPlan({ planId: plan.id, billing: billingCycle })}
                    className={`block w-full text-center py-4 rounded-2xl font-bold text-lg transition-colors mt-auto ${
                      plan.highlight 
                        ? 'bg-[#E8783C] hover:bg-[#d66a30] text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-[#151C19]'
                    }`}
                  >
                    Get Started Now
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Optional Add-Ons Section */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-200/80 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#E8783C]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#E8783C]/10 text-[#E8783C] mb-3">
                Optional Annual Add-On
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#151C19] tracking-tight mb-2">
                Google Reviews Integration
              </h2>
              <p className="text-[#53615a] text-sm sm:text-base leading-relaxed">
                Add a direct &ldquo;Write a Google Review&rdquo; button to your live QR menu. Prompt dining guests to open your official Google business review link with one tap right from their table.
              </p>
              <p className="text-xs text-[#82928a] mt-2 italic">
                * Direct review-link button CTA for your menu; does not sync live Google star counts or ratings. Available during checkout with any plan.
              </p>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-4 shrink-0 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
              <div className="text-left md:text-right">
                <span className="text-3xl sm:text-4xl font-black text-[#151C19]">₹499</span>
                <span className="text-sm text-[#53615a] font-medium"> / year</span>
              </div>
              <Link
                to={`/purchase/details?plan=intermediate&billing=${billingCycle}`}
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-sm bg-[#151C19] hover:bg-[#25322d] text-white transition-colors shadow-sm"
              >
                Select at Checkout
              </Link>
            </div>
          </div>
        </div>

        <GeoFaqSection title="Pricing & Subscription FAQs" />
      </main>

      <SiteFooter />
    </div>
  );
}
