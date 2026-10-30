import { useCallback, useRef } from 'react';
import type { MenuTheme } from '../../../design-system/theme.types';

/**
 * Local-only resume for the onboarding wizard (no backend/DB change this
 * pass — same browser/device only). Keyed by the authenticated user's id so
 * two different logged-in sessions on one shared browser never read each
 * other's in-progress menu.
 */
const DRAFT_PREFIX = 'mq_onboarding_draft_v1_';
const DEBOUNCE_MS = 400;

export type OnboardingDraft<TRestaurantData> = {
  currentStepIdx: number;
  restaurantData: TRestaurantData;
  studioTheme: MenuTheme;
};

export function useOnboardingDraft<TRestaurantData>() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadDraft = useCallback((userId: string): OnboardingDraft<TRestaurantData> | null => {
    try {
      const raw = localStorage.getItem(DRAFT_PREFIX + userId);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed.currentStepIdx !== 'number' || !parsed.restaurantData || !parsed.studioTheme) {
        return null;
      }
      return parsed as OnboardingDraft<TRestaurantData>;
    } catch {
      return null;
    }
  }, []);

  const saveDraft = useCallback((userId: string, draft: OnboardingDraft<TRestaurantData>) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_PREFIX + userId, JSON.stringify(draft));
      } catch {
        // Storage full or disabled (private browsing) — resume just won't work this session.
      }
    }, DEBOUNCE_MS);
  }, []);

  const clearDraft = useCallback((userId: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    try {
      localStorage.removeItem(DRAFT_PREFIX + userId);
    } catch {
      // Nothing to do if storage is unavailable.
    }
  }, []);

  return { loadDraft, saveDraft, clearDraft };
}
