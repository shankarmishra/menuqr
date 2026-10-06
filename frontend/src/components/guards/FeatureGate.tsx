/**
 * FeatureGate.tsx
 * Wraps any child content behind a capability check.
 *
 * States:
 *  - loading  → spinner
 *  - allowed  → renders children
 *  - restricted → upgrade CTA (correct plan name + price shown)
 *  - expired  → subscription renewal CTA
 *
 * Do NOT simply hide restricted content — always show an upgrade path.
 */

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Lock, ArrowUpCircle, RefreshCw } from 'lucide-react';
import { usePlan } from '../../lib/usePlan';
import {
  minimumPlanFor,
  PLAN_NAMES,
  PLAN_PRICES,
  type PlanId,
} from '../../lib/planCapabilities';

interface FeatureGateProps {
  /** The capability string to check, e.g. 'add_item', 'reception_orders' */
  capability: string;
  /** Content to render when the user has access */
  children: ReactNode;
  /** Optional override for the restricted state UI */
  fallback?: ReactNode;
}

function LoadingGate() {
  return (
    <div className="flex items-center justify-center py-8 text-[#9ca3af] text-sm">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#9ca3af] border-t-transparent mr-2" />
      Checking access…
    </div>
  );
}

function ExpiredGate() {
  return (
    <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-start gap-3 flex-1">
        <RefreshCw className="h-5 w-5 text-rose-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-white font-semibold text-sm">Subscription Expired</p>
          <p className="text-[#9ca3af] text-xs mt-0.5">
            Renew your subscription to continue using this feature.
          </p>
        </div>
      </div>
      <Link
        to="/app/subscription"
        className="inline-flex items-center gap-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-4 py-2 transition-colors flex-shrink-0"
      >
        <RefreshCw className="h-4 w-4" />
        Renew Subscription
      </Link>
    </div>
  );
}

interface RestrictedGateProps {
  requiredPlan: PlanId;
  capability: string;
}

function RestrictedGate({ requiredPlan, capability }: RestrictedGateProps) {
  // Map capability slugs to user-friendly feature names
  const featureNames: Record<string, string> = {
    add_item: 'Adding menu items',
    edit_item: 'Editing menu items',
    delete_item: 'Deleting menu items',
    menu_management: 'Full menu management',
    templates_limited: 'Menu templates',
    customer_ordering: 'Customer ordering',
    reception_orders: 'Reception order dashboard',
    order_acceptance: 'Order acceptance',
    order_management: 'Order management',
    one_time_edit: 'Menu editing',
  };

  const featureName = featureNames[capability] ?? 'This feature';
  const planName = PLAN_NAMES[requiredPlan];
  const planPrice = PLAN_PRICES[requiredPlan];

  return (
    <div className="rounded-xl border border-[#e8783c]/40 bg-[#e8783c]/10 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-start gap-3 flex-1">
        <Lock className="h-5 w-5 text-[#e8783c] mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-white font-semibold text-sm">
            {featureName} is available with {planName}
          </p>
          <p className="text-[#9ca3af] text-xs mt-0.5">
            Upgrade to the {planName} plan ({planPrice}) to unlock this feature.
          </p>
        </div>
      </div>
      <Link
        to="/app/subscription"
        className="inline-flex items-center gap-2 rounded-lg bg-[#e8783c] hover:bg-[#d96227] text-white text-sm font-semibold px-4 py-2 transition-colors flex-shrink-0"
      >
        <ArrowUpCircle className="h-4 w-4" />
        Upgrade to {planName}
      </Link>
    </div>
  );
}

export function FeatureGate({ capability, children, fallback }: FeatureGateProps) {
  const { can, subState, loading } = usePlan();

  if (loading) return <LoadingGate />;
  if (subState === 'expired') return <ExpiredGate />;

  if (!can(capability)) {
    if (fallback) return <>{fallback}</>;
    const required = minimumPlanFor(capability);
    if (!required) {
      // Unknown capability — show generic locked state
      return (
        <div className="rounded-xl border border-[#2a3832] bg-[#1d2723] p-5 text-[#9ca3af] text-sm">
          <Lock className="h-4 w-4 inline mr-2" />
          This feature is not available on your current plan.
        </div>
      );
    }
    return <RestrictedGate requiredPlan={required} capability={capability} />;
  }

  return <>{children}</>;
}

export default FeatureGate;
