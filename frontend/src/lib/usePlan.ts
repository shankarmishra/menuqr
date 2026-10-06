/**
 * usePlan.ts
 * React hook that fetches and caches the current restaurant's subscription
 * plan. Provides plan-check helpers and expiry state throughout the app tree.
 */

import { useState, useEffect, useCallback } from 'react';
import { getSubscription, type AppSubscriptionData } from '../pages/app/appStore';
import { normalizePlan, hasCapability, type PlanId } from './planCapabilities';

export type SubscriptionState =
  | 'loading'
  | 'active'
  | 'warning'   // expiring within 14 days
  | 'expired'
  | 'none';

export interface UsePlanResult {
  /** Normalised plan id: 'basic' | 'intermediate' | 'premium' */
  plan: PlanId;
  /** Raw subscription data from the API */
  sub: AppSubscriptionData | null;
  /** High-level subscription state */
  subState: SubscriptionState;
  /** True while the first fetch is in-flight */
  loading: boolean;
  /** True if Basic plan and the one included edit has been consumed */
  basicEditUsed: boolean;
  /** Returns true if the current plan includes the requested capability */
  can: (capability: string) => boolean;
  /** Manually refresh the subscription data */
  refresh: () => void;
}

const WARNING_DAYS = 14;

function computeSubState(sub: AppSubscriptionData | null): SubscriptionState {
  if (!sub || sub.status === 'none') return 'none';
  const status = (sub.status ?? '').toUpperCase();
  if (status === 'EXPIRED') return 'expired';
  if (sub.expiresAt) {
    const msLeft = new Date(sub.expiresAt).getTime() - Date.now();
    const daysLeft = msLeft / (1000 * 60 * 60 * 24);
    if (daysLeft < 0) return 'expired';
    if (daysLeft < WARNING_DAYS) return 'warning';
  }
  if (status === 'ACTIVE') return 'active';
  return 'none';
}

export function usePlan(): UsePlanResult {
  const [sub, setSub] = useState<AppSubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getSubscription()
      .then((data) => {
        if (!cancelled) setSub(data);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [tick]);

  const plan = normalizePlan(sub?.planId);
  const subState = loading ? 'loading' : computeSubState(sub);

  /** Basic edit used is now tracked server-side via sub.menuEditUsed */
  const basicEditUsed = plan === 'basic' && (sub?.menuEditUsed === true);

  const can = useCallback(
    (capability: string) => hasCapability(plan, capability),
    [plan],
  );

  return { plan, sub, subState, loading, basicEditUsed, can, refresh };
}
