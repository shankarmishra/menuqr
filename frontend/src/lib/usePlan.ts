/**
 * usePlan.ts
 * React hook and singleton SSE stream manager for real-time subscription
 * state, capability evaluation, and zero-reload feature unlock.
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

export function computeSubState(sub: AppSubscriptionData | null): SubscriptionState {
  if (!sub || sub.status === 'none') return 'none';
  const status = (sub.status ?? '').toUpperCase();
  if (['EXPIRED', 'TERMINATED', 'SUSPENDED'].includes(status)) return 'expired';
  if (!['ACTIVE', 'WARNING', 'EXPIRING', 'RENEWAL_PENDING', 'CANCELLED'].includes(status)) return 'inactive';

  if (!sub.expiresAt || new Date(sub.expiresAt).getTime() <= Date.now()) return 'expired';
  const daysLeft = (new Date(sub.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (['WARNING', 'EXPIRING'].includes(status) || daysLeft < WARNING_DAYS) return 'warning';
  return 'active';
}

// ─────────────────────────────────────────────────────────────────────────────
// SINGLETON SSE STREAM & CACHE MANAGER
// ─────────────────────────────────────────────────────────────────────────────

type Subscriber = (data: AppSubscriptionData | null, isLoading: boolean) => void;

let cachedSub: AppSubscriptionData | null = null;
let isInitialLoading = true;
let isFetchInFlight = false;
const subscribers = new Set<Subscriber>();

let eventSource: EventSource | null = null;
let sseRefCount = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempts = 0;
let fallbackPollingTimer: ReturnType<typeof setInterval> | null = null;

function notifySubscribers() {
  for (const sub of subscribers) {
    try {
      sub(cachedSub, isInitialLoading);
    } catch (err) {
      console.warn('[usePlan] Subscriber error:', err);
    }
  }
}

/**
 * Perform server fetch with optional silent mode (no loading indicator)
 */
async function fetchSubscriptionData(silent = false): Promise<AppSubscriptionData | null> {
  if (isFetchInFlight) return cachedSub;
  isFetchInFlight = true;
  if (!silent && !cachedSub) {
    isInitialLoading = true;
    notifySubscribers();
  }

  try {
    const data = await getSubscription();
    cachedSub = data;
    return data;
  } catch (err) {
    console.warn('[usePlan] Failed to fetch subscription:', err);
    if (!cachedSub) cachedSub = null;
    return null;
  } finally {
    isInitialLoading = false;
    isFetchInFlight = false;
    notifySubscribers();
  }
}

/**
 * Handle real-time 'plan_updated' event received over SSE
 */
function handlePlanUpdatedEvent(e: MessageEvent) {
  try {
    const data = JSON.parse(e.data);
    const updatedPlanId = (data.planId || data.plan || '').toUpperCase();
    const updatedExpiresAt = data.expiresAt || cachedSub?.expiresAt;

    // 1. Instant Synchronous State Update (Zero Reload, Zero In-Flight Spinner)
    cachedSub = cachedSub
      ? {
          ...cachedSub,
          planId: updatedPlanId,
          expiresAt: updatedExpiresAt,
          status: 'ACTIVE',
        }
      : {
          planId: updatedPlanId,
          status: 'ACTIVE',
          expiresAt: updatedExpiresAt,
          contentChangesRemaining: 30,
        };

    isInitialLoading = false;
    notifySubscribers();

    // 2. Broadcast custom DOM event for external panels (e.g. CheckoutDrawer)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('menusqr:plan-updated', {
          detail: {
            planId: updatedPlanId,
            expiresAt: updatedExpiresAt,
            status: 'ACTIVE',
            orderId: data.orderId,
            orderSubtype: data.orderSubtype,
          },
        })
      );
    }

    // 3. Silent background refresh to synchronize content usage limits
    fetchSubscriptionData(true);
  } catch (err) {
    console.warn('[usePlan] Failed to parse plan_updated SSE event:', err);
  }
}

/**
 * Establish singleton SSE connection to /api/app/orders/stream
 */
function connectSSE() {
  if (eventSource) return;
  if (sseRefCount <= 0) return;
  if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;

  try {
    eventSource = new EventSource('/api/app/orders/stream', { withCredentials: true });

    eventSource.onopen = () => {
      reconnectAttempts = 0;
      stopFallbackPolling();
    };

    eventSource.addEventListener('connected', () => {
      reconnectAttempts = 0;
      stopFallbackPolling();
    });

    eventSource.addEventListener('plan_updated', handlePlanUpdatedEvent);

    eventSource.onerror = () => {
      cleanupSSEConnection();
      scheduleSSEReconnect();
    };
  } catch (err) {
    console.warn('[usePlan] Error initializing EventSource:', err);
    scheduleSSEReconnect();
  }
}

function cleanupSSEConnection() {
  if (eventSource) {
    eventSource.removeEventListener('plan_updated', handlePlanUpdatedEvent);
    eventSource.close();
    eventSource = null;
  }
}

function scheduleSSEReconnect() {
  if (sseRefCount <= 0 || reconnectTimer) return;
  reconnectAttempts++;

  // Exponential backoff: 1s, 1.5s, 2.25s, 3.3s ... capped at 30s + jitter
  const delay = Math.min(30000, 1000 * Math.pow(1.5, reconnectAttempts)) + Math.random() * 500;
  
  if (reconnectAttempts >= 3) {
    startFallbackPolling();
  }

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    if (sseRefCount > 0) {
      connectSSE();
    }
  }, delay);
}

function startFallbackPolling() {
  if (fallbackPollingTimer) return;
  // Poll once every 45 seconds when SSE is degraded
  fallbackPollingTimer = setInterval(() => {
    fetchSubscriptionData(true);
  }, 45000);
}

function stopFallbackPolling() {
  if (fallbackPollingTimer) {
    clearInterval(fallbackPollingTimer);
    fallbackPollingTimer = null;
  }
}

// Global window event listeners (visibility & manual refresh)
if (typeof window !== 'undefined') {
  window.addEventListener('menusqr:plan-updated', () => {
    fetchSubscriptionData(true);
  });

  // Re-sync and check SSE health when user returns to tab
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        if (sseRefCount > 0) {
          fetchSubscriptionData(true);
          if (!eventSource) connectSSE();
        }
      }
    });
  }

  window.addEventListener('focus', () => {
    if (sseRefCount > 0) {
      fetchSubscriptionData(true);
      if (!eventSource) connectSSE();
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// USEPLAN HOOK
// ─────────────────────────────────────────────────────────────────────────────

export function usePlan(): UsePlanResult {
  const [sub, setSub] = useState<AppSubscriptionData | null>(cachedSub);
  const [loading, setLoading] = useState<boolean>(isInitialLoading);

  useEffect(() => {
    const subscriber: Subscriber = (data, isLoading) => {
      setSub(data);
      setLoading(isLoading);
    };

    subscribers.add(subscriber);
    sseRefCount++;

    // Start SSE and initial fetch when first consumer mounts
    if (sseRefCount === 1) {
      connectSSE();
      fetchSubscriptionData(false);
    } else {
      // Immediately hydrate from in-memory cache
      setSub(cachedSub);
      setLoading(isInitialLoading);
    }

    return () => {
      subscribers.delete(subscriber);
      sseRefCount--;
      if (sseRefCount <= 0) {
        sseRefCount = 0;
        cleanupSSEConnection();
        stopFallbackPolling();
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
          reconnectTimer = null;
        }
      }
    };
  }, []);

  const refresh = useCallback(() => {
    fetchSubscriptionData(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('menusqr:plan-updated'));
    }
  }, []);

  const plan = normalizePlan(sub?.planId);
  const subState = loading ? 'loading' : computeSubState(sub);

  const contentChangesRemaining = Math.max(0, sub?.contentChangesRemaining ?? 30);
  const contentChangesLimit = sub?.contentChangesLimit;
  const isEditLimitReached = contentChangesLimit !== null && contentChangesRemaining === 0;
  const basicEditUsed = isEditLimitReached;

  const can = useCallback((capability: string) => {
    if (loading || !['active', 'warning'].includes(subState)) return false;
    if (capability === 'one_time_edit') return !isEditLimitReached;
    return hasCapability(plan, capability);
  }, [loading, plan, subState, isEditLimitReached]);

  return {
    plan,
    sub,
    subState,
    loading,
    basicEditUsed,
    contentChangesRemaining,
    contentChangesLimit,
    isEditLimitReached,
    can,
    refresh,
  };
}

