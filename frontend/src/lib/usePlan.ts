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
  | 'warning'
  | 'expired'
  | 'inactive'
  | 'none';

export interface UsePlanResult {
  contentChangesLimit?: number;
  isEditLimitReached: boolean;
  /** Normalised plan id: 'basic' | 'intermediate' | 'premium' */
  plan: PlanId;
  /** Raw subscription data from the API */
  sub: AppSubscriptionData | null;
  /** High-level subscription state */
  subState: SubscriptionState;
  /** True while the first fetch is in-flight */
  loading: boolean;
  /** True if Basic plan and all included menu changes have been consumed */
  basicEditUsed: boolean;
  contentChangesRemaining: number;
  /** Returns true if the current plan includes the requested capability */
  can: (capability: string) => boolean;
  /** Manually refresh the subscription data */
  refresh: () => void;
}

const WARNING_DAYS = 14;

function computeSubState(sub: AppSubscriptionData | null): SubscriptionState {
  if (!sub || sub.status === 'none') return 'none';
  const status = (sub.status ?? '').toUpperCase();
  if (['EXPIRED', 'TERMINATED', 'SUSPENDED'].includes(status)) return 'expired';
  if (!['ACTIVE', 'WARNING', 'EXPIRING', 'RENEWAL_PENDING', 'CANCELLED'].includes(status)) return 'inactive';

  if (!sub.expiresAt || new Date(sub.expiresAt).getTime() <= Date.now()) return 'expired';
  const daysLeft = (new Date(sub.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (['WARNING', 'EXPIRING'].includes(status) || daysLeft < WARNING_DAYS) return 'warning';
  return 'active';
}

export function usePlan(): UsePlanResult {
  const [sub, setSub] = useState<AppSubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    window.dispatchEvent(new Event('menusqr:plan-updated'));
  }, []);

  useEffect(() => {
    const handlePlanUpdate = () => {
      setLoading(true);
      setTick((t) => t + 1);
    };
    window.addEventListener('menusqr:plan-updated', handlePlanUpdate);
    return () => {
      window.removeEventListener('menusqr:plan-updated', handlePlanUpdate);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getSubscription()
      .then((data) => {
        if (!cancelled) setSub(data);
      })
      .catch(() => {
        if (!cancelled) setSub(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [tick]);

  const plan = normalizePlan(sub?.planId);
  const subState = loading ? 'loading' : computeSubState(sub);

  const contentChangesRemaining = Math.max(0, sub?.contentChangesRemaining ?? 30);
  const contentChangesLimit = sub?.contentChangesLimit;
  const isEditLimitReached = contentChangesLimit !== null && contentChangesRemaining === 0;
  const basicEditUsed = isEditLimitReached; // For backwards compatibility
  
  const can = useCallback((capability: string) => {
    if (loading || !['active', 'warning'].includes(subState)) return false;
    if (capability === 'one_time_edit') return !isEditLimitReached;
    return hasCapability(plan, capability);
  }, [basicEditUsed, loading, plan, subState]);

  return { plan, sub, subState, loading, basicEditUsed, contentChangesRemaining, contentChangesLimit, isEditLimitReached, can, refresh };
}
