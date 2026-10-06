import { Link } from 'react-router-dom';
import SiteHeader from '../../components/marketing/SiteHeader';
import { Check } from 'lucide-react';
import { SEO } from '../../seo/SEO';

export default function PricingPage() {
  const plans = [
    {
      id: 'basic',
      name: 'BASIC',
      price: '₹999',
      description: 'Perfect for small cafes and food stalls starting their digital journey.',
      features: [
        'Permanent Table QR Code',
        'Up to 50 Menu Items',
        'Basic Design Template',
        'Dietary Tags',
        'Instant Customer Scan (No App)',
      ],
      highlight: false,
    },
    {
      id: 'intermediate',
      name: 'INTERMEDIATE',
      price: '₹1499',
      description: 'Ideal for growing restaurants needing more flexibility and style.',
      features: [
        'Permanent Table QR Code',
        'Up to 150 Menu Items',
        'Premium Design Templates',
        'Dietary Tags & Image Support',
        'Instant Customer Scan (No App)',
        'Standard Email Support',
      ],
      highlight: false,
    },
    {
      id: 'premium',
      name: 'PREMIUM',
      price: '₹2999',
      description: 'Everything you need to run a world-class digital menu for your restaurant.',
      features: [
        'Permanent Table QR Code',
        'Unlimited Menu Edits & Categories',
        'All Premium Design Templates',
        'Dietary Tags & Image Support',
        'Premium Ordering System',
        'Priority Email Support',
      ],
      highlight: true,
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <SEO 
        title="MenusQR Pricing | Digital Menu Plans for Restaurants"
        description="View MenusQR pricing plans. Basic ₹999/year, Intermediate ₹1499/year, and Premium ₹2999/year. Create your digital restaurant QR menu today."
        canonicalUrl="/plans"
      />
      <SiteHeader />
      <div className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#151C19] tracking-tight mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-[#151C19]/70 max-w-2xl mx-auto">
            One permanent QR code. Unlimited menu updates. Premium restaurant tech for your business.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
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
                  YEARLY {plan.name}
                </div>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-5xl font-black text-[#151C19]">{plan.price}</span>
                  <span className="text-[#151C19]/60 font-medium">/ year</span>
                </div>
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
                  to={`/purchase/details?plan=${plan.id}`}
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
          ))}
        </div>
      </div>
    </div>
  );
}
