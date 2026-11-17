import { useCallback, useEffect, useState } from 'react';
import { getOrderUsage, type OrderUsage } from '../pages/app/appStore';

/**
 * Monthly online-order usage for the signed-in restaurant. Reloads when a plan/pack change arrives
 * over the live stream (menusqr:plan-updated), when the tab regains focus, and once a minute
 * (new customer orders change the count).
 */
export function useOrderUsage(enabled = true) {
  const [usage, setUsage] = useState<OrderUsage | null>(null);

  const refresh = useCallback(() => {
    getOrderUsage().then(setUsage).catch(() => { /* keep the last known usage */ });
  }, []);

  useEffect(() => {
    if (!enabled) return;
    refresh();
    const timer = setInterval(refresh, 60_000);
    window.addEventListener('menusqr:plan-updated', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener('menusqr:plan-updated', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [enabled, refresh]);

  return { usage, refresh };
}
