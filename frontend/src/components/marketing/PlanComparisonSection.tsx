import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  { name: 'Digital Menu via QR', basic: true, intermediate: true, premium: true },
  { name: 'Universal Menu Search', basic: true, intermediate: true, premium: true },
  { name: 'Half/Full & Portion Pricing', basic: true, intermediate: true, premium: true },
  { name: 'Print-Ready QR Downloads', basic: true, intermediate: true, premium: true },
  { name: 'Included Edits', basic: '1 Edit', intermediate: 'Unlimited', premium: 'Unlimited' },
  { name: 'Premium Layout Templates', basic: false, intermediate: '3-4 Templates', premium: 'All Templates' },
  { name: 'Live Menu Updates', basic: false, intermediate: true, premium: true },
  { name: 'Table-wise QR Codes', basic: true, intermediate: true, premium: true },
  { name: 'Analytics Dashboard', basic: false, intermediate: true, premium: true },
  { name: 'Customer Table Ordering', basic: false, intermediate: false, premium: true },
  { name: 'Reception Dashboard', basic: false, intermediate: false, premium: true },
  { name: 'Permanent QR Identity', basic: true, intermediate: true, premium: true },
];

type PlanKey = 'basic' | 'intermediate' | 'premium';

const plans: Array<{
  key: PlanKey;
  name: string;
  price: string;
  summary: string;
}> = [
  { key: 'basic', name: 'Basic', price: '₹1,999/YR', summary: 'Start with a digital menu and a permanent QR.' },
  { key: 'intermediate', name: 'Intermediate', price: '₹3,199/YR', summary: 'More creative control and unlimited menu updates.' },
  { key: 'premium', name: 'Premium', price: '₹6,799/YR', summary: 'Turn every scan into a complete table experience.' },
];

export default function PlanComparisonSection() {
  return (
    <section id="pricing" className="relative overflow-hidden border-t border-[#151C19]/10 bg-[#FAFAF7] py-14 md:py-18">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8 md:px-12">
        <div className="mb-8 flex flex-col gap-3 border-b border-[#151C19]/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#E8783C]">Simple annual plans</p>
            <h2 className="max-w-2xl text-3xl font-extrabold leading-tight text-[#151C19] sm:text-4xl">
              Choose the level of control your business needs.
          </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-[#626776] sm:text-right">
            Every plan keeps your printed QR connected to a menu you can update.
          </p>
        </div>

        <div className="grid items-stretch gap-4 md:grid-cols-3">
          {plans.map((plan) => {
            const isPremium = plan.key === 'premium';
            const includedFeatures = features.flatMap((feature) => {
              const value = feature[plan.key];
              if (value === false) return [];
              return [value === true ? feature.name : `${feature.name}: ${value}`];
            });

            return (
              <article
                key={plan.key}
                className={`relative flex h-full flex-col border p-5 sm:p-6 ${
                  isPremium
                    ? 'border-[#151C19] bg-[#151C19] text-white shadow-[0_18px_44px_-24px_rgba(21,28,25,0.75)]'
                    : 'border-[#151C19]/15 bg-white text-[#151C19]'
                }`}
              >
                {isPremium && (
                  <span className="absolute right-4 top-4 bg-[#E8783C] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
                    Full experience
                  </span>
                )}
                <h3 className={`text-xl font-extrabold ${isPremium ? 'pr-28' : ''}`}>{plan.name}</h3>
                <p className={`mt-1 text-xs ${isPremium ? 'text-white/60' : 'text-[#626776]'}`}>{plan.summary}</p>
                <p className={`mt-5 text-2xl font-bold ${isPremium ? 'text-[#F1D99D]' : 'text-[#E8783C]'}`}>{plan.price}</p>

                <ul className="mt-5 flex-1 space-y-2.5 border-t border-current/15 pt-4 text-xs leading-snug sm:text-[13px]">
                  {includedFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 shrink-0 text-[#34B56A]" size={15} aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={`/purchase/details?plan=${plan.key}`}
                  className={`mt-5 inline-flex min-h-11 items-center justify-center px-4 py-2.5 text-sm font-bold transition-colors ${
                    isPremium
                      ? 'bg-[#E8783C] text-white hover:bg-[#D9672D]'
                      : 'border border-[#151C19]/20 text-[#151C19] hover:bg-[#151C19]/5'
                  }`}
                >
                  Choose {plan.name}
                </Link>
              </article>
            );
          })}
        </div>

        {/* Optional Add-On Callout */}
        <div className="mt-8 rounded-2xl border border-[#151C19]/15 bg-white p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="max-w-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8783C] bg-[#E8783C]/10 px-2 py-0.5 rounded">
              Optional Annual Add-On
            </span>
            <h3 className="text-lg font-extrabold text-[#151C19] mt-1">
              Google Reviews Integration — ₹499/year
            </h3>
            <p className="text-xs text-[#626776] mt-1 leading-relaxed">
              Display a direct &ldquo;Write a Google Review&rdquo; button on your live QR menu linked to your Google Business profile. <span className="italic">(Direct review-link CTA; does not fetch or sync live star ratings).</span>
            </p>
          </div>
          <Link
            to="/purchase/details?plan=intermediate"
            className="shrink-0 text-xs font-bold px-4 py-2.5 rounded-lg border border-[#151C19]/20 hover:bg-[#151C19]/5 text-[#151C19] transition-colors"
          >
            Add at Checkout
          </Link>
        </div>
      </div>
    </section>
  );
}
