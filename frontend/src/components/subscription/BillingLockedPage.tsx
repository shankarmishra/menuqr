import { useState } from 'react';
import { Lock, CreditCard, Check } from 'lucide-react';
import CheckoutDrawer from './CheckoutDrawer';
import ContactSupportCard from './ContactSupportCard';
import InvoiceHistory from './InvoiceHistory';
import { usePlan } from '../../lib/usePlan';
import { PLAN_NAMES, PLAN_PRICES, PLAN_PRICES_MONTHLY, type PlanId } from '../../lib/planCapabilities';

const PLAN_HIGHLIGHTS: Record<PlanId, string[]> = {
  basic: ['Permanent QR code & digital menu', 'Up to 20 menu changes per period', 'Email support'],
  intermediate: ['Unlimited menu edits', 'All design templates', 'Analytics dashboard'],
  premium: ['Everything in Intermediate', 'Table ordering & live orders', 'Cashier panel & thermal bills'],
};

interface BillingLockedPageProps {
  restaurantName?: string;
}

/**
 * Shown in place of every /app page once the free trial or paid plan has ended.
 * The owner can pay online (in-app checkout) or contact the team to pay offline;
 * either way the account unlocks in real time via the plan_updated SSE event.
 */
export default function BillingLockedPage({ restaurantName }: BillingLockedPageProps) {
  const { sub, refresh } = usePlan();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const wasTrial = sub?.source?.toUpperCase() === 'TRIAL' || sub?.status?.toUpperCase() === 'TRIAL';
  const title = wasTrial ? 'Your 14-day free trial has ended' : 'Your plan has expired';
  const subtitle = wasTrial
    ? 'Choose a plan to keep using your dashboard and digital menu. Everything you set up is saved.'
    : 'Renew or choose a plan to switch your dashboard and digital menu back on. Your data is saved.';

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 md:px-8">
      <div className="rounded-2xl border border-rose-500/20 bg-gradient-to-r from-[#2a1a1a] to-[#1d2723] p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-rose-500/15 p-3 text-rose-300">
            <Lock size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white md:text-3xl">{title}</h1>
            <p className="mt-2 text-sm text-[#cbd5cf] md:text-base">{subtitle}</p>
            <p className="mt-2 text-xs text-[#87958e]">
              Your customers' QR menu is paused until a plan is active.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {(['basic', 'intermediate', 'premium'] as PlanId[]).map((planId) => (
          <div
            key={planId}
            className={`flex flex-col rounded-2xl border p-5 ${planId === 'premium' ? 'border-[#e8783c]/40 bg-[#e8783c]/5' : 'border-white/10 bg-[#151c19]'}`}
          >
            <p className="text-sm font-bold uppercase tracking-wider text-[#aab7b2]">{PLAN_NAMES[planId]}</p>
            <p className="mt-2 text-2xl font-black text-white">{PLAN_PRICES[planId]}</p>
            <p className="text-xs text-[#87958e]">or {PLAN_PRICES_MONTHLY[planId]}</p>
            <ul className="mt-4 flex-1 space-y-2">
              {PLAN_HIGHLIGHTS[planId].map((line) => (
                <li key={line} className="flex items-start gap-2 text-sm text-[#cbd5cf]">
                  <Check size={15} className="mt-0.5 shrink-0 text-emerald-400" /> {line}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <button
        onClick={() => setDrawerOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e8783c] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#e8783c]/20 transition-all hover:bg-[#d66a30]"
      >
        <CreditCard size={16} /> Pay online &amp; unlock now
      </button>

      <ContactSupportCard
        supportPhone={sub?.supportPhone}
        restaurantName={restaurantName}
        reason={wasTrial ? 'my free trial has ended and I want to take a plan' : 'my plan has expired and I want to renew'}
      />

      <InvoiceHistory />

      <CheckoutDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          refresh();
        }}
        initialAction="upgrade"
        freshPurchase
        currentPlanId={sub?.planId || 'BASIC'}
        expiresAt={sub?.expiresAt}
        startedAt={sub?.startedAt}
        onPlanUpdated={refresh}
      />
    </div>
  );
}
