/**
 * planCapabilities.ts
 * Central source of truth for plan-to-capability mapping.
 * Used by both frontend guards (FeatureGate, PlanGuard) and
 * referenced as documentation for the backend middleware.
 *
 * PLANS:
 *   BASIC        ₹699/mo | ₹2,499/yr
 *   INTERMEDIATE ₹1,199/mo | ₹3,999/yr
 *   PREMIUM      ₹1,399/mo | ₹8,499/yr
 */

const BASIC_CAPABILITIES = [
  'digital_menu',
  'menu_conversion',
  'qr_code',
  'login',
  'menu_setup',
  'one_time_edit',
] as const;

const INTERMEDIATE_CAPABILITIES = [
  ...BASIC_CAPABILITIES,
  'templates',
  'add_item',
  'edit_item',
  'delete_item',
  'menu_management',
] as const;

const PREMIUM_CAPABILITIES = [
  ...INTERMEDIATE_CAPABILITIES,
  'customer_ordering',
  'reception_orders',
  'order_acceptance',
  'order_management',
] as const;

export type Capability =
  | (typeof BASIC_CAPABILITIES)[number]
  | (typeof INTERMEDIATE_CAPABILITIES)[number]
  | (typeof PREMIUM_CAPABILITIES)[number];

export type PlanId = 'basic' | 'intermediate' | 'premium';

export const PLAN_CAPABILITIES: Record<PlanId, readonly string[]> = {
  basic: BASIC_CAPABILITIES,
  intermediate: INTERMEDIATE_CAPABILITIES,
  premium: PREMIUM_CAPABILITIES,
};

/** Plan display names for UI copy */
export const PLAN_NAMES: Record<PlanId, string> = {
  basic: 'Basic',
  intermediate: 'Intermediate',
  premium: 'Premium',
};

/** Plan prices for UI copy */
export const PLAN_PRICES: Record<PlanId, string> = {
  basic: '₹2,499/yr',
  intermediate: '₹3,999/yr',
  premium: '₹8,499/yr',
};

/**
 * Normalize a raw plan string from the backend (e.g. "BASIC", "Basic")
 * to a canonical PlanId key.
 */
export function normalizePlan(plan: string | null | undefined): PlanId {
  const lower = (plan ?? '').toLowerCase();
  if (lower === 'premium') return 'premium';
  if (lower === 'intermediate') return 'intermediate';
  return 'basic';
}

/**
 * Returns true if the given plan includes the requested capability.
 */
export function hasCapability(
  plan: string | null | undefined,
  capability: string,
): boolean {
  const normalizedPlan = normalizePlan(plan);
  return PLAN_CAPABILITIES[normalizedPlan].includes(capability);
}

/**
 * Returns the minimum plan required to unlock a capability, or null if
 * the capability is unknown.
 */
export function minimumPlanFor(capability: string): PlanId | null {
  if ((BASIC_CAPABILITIES as readonly string[]).includes(capability))
    return 'basic';
  if ((INTERMEDIATE_CAPABILITIES as readonly string[]).includes(capability))
    return 'intermediate';
  if ((PREMIUM_CAPABILITIES as readonly string[]).includes(capability))
    return 'premium';
  return null;
}

/**
 * Human-readable upgrade message for a blocked capability.
 */
export function upgradeMessage(capability: string): string {
  const minPlan = minimumPlanFor(capability);
  if (!minPlan) return 'This feature is not available on your current plan.';
  return `This feature is included with the ${PLAN_NAMES[minPlan]} plan (${PLAN_PRICES[minPlan]}).`;
}
