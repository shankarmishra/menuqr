import { useEffect, useState } from 'react';
import { Lottie } from 'lottie-react';

/**
 * The onboarding dwell-moments that get a Lottie treatment. Several keys share
 * one asset (see MOMENT_LOADERS) — the key names the *purpose*, not the file,
 * so a moment can be re-pointed at a different asset later without touching
 * every call site.
 */
export type LottieMomentKey =
  | 'logo-upload-success'
  | 'design-pick-confirm'
  | 'upload-idle'
  | 'excel-parsing'
  | 'photo-matching'
  | 'empty-state'
  | 'qr-activation-success'
  | 'error';

// Each entry is its own dynamic import, so Vite gives it its own chunk — a
// moment's ~2-5KB JSON only ever downloads once that moment actually mounts.
const MOMENT_LOADERS: Record<LottieMomentKey, () => Promise<{ default: object }>> = {
  'logo-upload-success': () => import('../../assets/lottie/success-check.json'),
  'design-pick-confirm': () => import('../../assets/lottie/success-check.json'),
  'upload-idle': () => import('../../assets/lottie/upload-idle.json'),
  'excel-parsing': () => import('../../assets/lottie/processing-scan.json'),
  'photo-matching': () => import('../../assets/lottie/processing-scan.json'),
  'empty-state': () => import('../../assets/lottie/empty-state.json'),
  'qr-activation-success': () => import('../../assets/lottie/qr-success-burst.json'),
  error: () => import('../../assets/lottie/error-pulse.json'),
};

export default function LottieMoment({
  moment,
  loop = true,
  autoplay = true,
  className = '',
  onComplete,
}: {
  moment: LottieMomentKey;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  onComplete?: () => void;
}) {
  const [data, setData] = useState<object | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    MOMENT_LOADERS[moment]().then((mod) => {
      if (!cancelled) setData(mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, [moment]);

  // Reserves the box so nothing jumps once the ~2-5KB chunk resolves.
  if (!data) return <div className={className} aria-hidden="true" />;

  return (
    <Lottie
      src={data}
      loop={loop}
      autoplay={autoplay}
      className={className}
      subscriptions={onComplete ? { complete: onComplete } : undefined}
    />
  );
}
