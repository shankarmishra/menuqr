import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Check, Lock } from 'lucide-react';
import { MenusQRBrand } from '../../../components/brand/MenusQRBrand';
import { buildTexture } from '../../../design-system/textures';
import LottieMoment from '../../../components/common/LottieMoment';
import { OB, DISPLAY } from './chrome';

export type ShellStep = {
  id: string;
  /** Short rail label, e.g. "Photos". */
  label: string;
  /** Live completion summary for this step, e.g. "13 dishes · 9 photos". Honest, not decorative. */
  hint?: string;
};

/**
 * The wizard's chrome: textured charcoal canvas, a named step rail, the step card, and the
 * Back/Continue footer. Every step body renders as `children`, so the frame is identical across
 * all five and a new step only has to supply content.
 */
export default function OnboardingShell({
  steps,
  currentStepIdx,
  eyebrow,
  title,
  description,
  onSkip,
  onBack,
  onNext,
  nextLabel,
  nextDisabled = false,
  isFinalStep = false,
  onStepSelect,
  children,
  aside,
}: {
  steps: ShellStep[];
  currentStepIdx: number;
  eyebrow: ReactNode;
  title: string;
  description: ReactNode;
  onSkip: () => void;
  onBack?: () => void;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
  isFinalStep?: boolean;
  /** Jumping back to an already-completed step; forward steps stay locked. */
  onStepSelect?: (idx: number) => void;
  children: ReactNode;
  /** Optional right-hand rail content (the live phone preview on the design steps). */
  aside?: ReactNode;
}) {
  const grain = useMemo(() => buildTexture('grain', OB.gold), []);
  const laid = useMemo(() => buildTexture('parchment', OB.gold), []);
  const progress = steps.length > 1 ? (currentStepIdx / (steps.length - 1)) * 100 : 100;

  // The wax-seal stamp plays once on the step just completed, then clears itself — a Lottie left
  // sitting on its last frame would permanently cover that node's tick.
  const [stampIdx, setStampIdx] = useState<number | null>(null);
  const previousIdx = useRef(currentStepIdx);
  useEffect(() => {
    if (currentStepIdx > previousIdx.current) setStampIdx(currentStepIdx - 1);
    previousIdx.current = currentStepIdx;
  }, [currentStepIdx]);

  return (
    <div className="relative min-h-screen font-sans text-[#F6F0E4] selection:bg-[#D4AF37] selection:text-[#12100D]" style={{ background: OB.canvas }}>
      {/* Canvas texture + warm vignette — felt, not seen. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-70"
        style={{ backgroundImage: grain.backgroundImage, backgroundSize: grain.backgroundSize, mixBlendMode: grain.blendMode }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{ background: `radial-gradient(1200px 600px at 50% -10%, rgba(212,175,55,0.10), transparent 70%), radial-gradient(900px 500px at 50% 110%, rgba(0,0,0,0.55), transparent 65%)` }}
      />

      <div className="relative flex min-h-screen flex-col">
        <header
          className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b px-4 py-3.5 backdrop-blur-md sm:px-6"
          style={{ borderColor: OB.goldLine, background: 'rgba(18,16,13,0.82)' }}
        >
          <MenusQRBrand size="sm" variant="light" />

          <div className="hidden items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] sm:flex" style={{ color: OB.inkMuted }}>
            <span>
              Step {currentStepIdx + 1} / {steps.length}
            </span>
            <span className="h-1 w-1 rounded-full" style={{ background: OB.gold }} />
            <span className="font-bold" style={{ color: OB.ink }}>
              {steps[currentStepIdx]?.label}
            </span>
          </div>

          <button
            type="button"
            onClick={onSkip}
            className="cursor-pointer text-[11px] font-semibold tracking-wide transition-colors hover:text-[#F6F0E4]"
            style={{ color: OB.inkFaint }}
          >
            Skip setup
          </button>
        </header>

        <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-6 px-3 py-6 sm:px-6 sm:py-8">
          {/* ───────────────── Step rail ───────────────── */}
          <nav aria-label="Setup progress" className="relative">
            <div className="absolute left-0 right-0 top-[18px] hidden h-px sm:block" style={{ background: OB.goldLineSoft }} />
            <div
              className="absolute left-0 top-[18px] hidden h-px transition-all duration-500 sm:block"
              style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${OB.gold}, ${OB.goldLight})` }}
            />

            <ol className="relative hidden grid-flow-col auto-cols-fr sm:grid">
              {steps.map((step, idx) => {
                const done = idx < currentStepIdx;
                const current = idx === currentStepIdx;
                const reachable = Boolean(onStepSelect) && idx < currentStepIdx;

                return (
                  <li key={step.id} className="flex flex-col items-center gap-2 text-center">
                    <button
                      type="button"
                      disabled={!reachable}
                      onClick={() => reachable && onStepSelect?.(idx)}
                      aria-current={current ? 'step' : undefined}
                      className={`relative flex h-9 w-9 items-center justify-center rounded-full border text-[11px] font-bold transition-all ${
                        reachable ? 'cursor-pointer hover:scale-105' : 'cursor-default'
                      }`}
                      style={{
                        background: current ? OB.gold : done ? OB.goldWash : OB.panel,
                        borderColor: current || done ? OB.gold : OB.goldLineSoft,
                        color: current ? OB.canvas : done ? OB.gold : OB.inkFaint,
                        boxShadow: current ? `0 0 0 5px rgba(212,175,55,0.14)` : 'none',
                      }}
                    >
                      {done ? <Check size={14} /> : idx > currentStepIdx ? <Lock size={11} /> : idx + 1}
                      {stampIdx === idx && (
                        <LottieMoment
                          moment="step-complete"
                          loop={false}
                          onComplete={() => setStampIdx(null)}
                          className="pointer-events-none absolute -inset-2"
                        />
                      )}
                    </button>
                    <span
                      className="text-[11px] font-bold uppercase tracking-[0.14em]"
                      style={{ color: current ? OB.ink : done ? OB.inkSoft : OB.inkFaint }}
                    >
                      {step.label}
                    </span>
                    {step.hint && (
                      <span className="text-[10px] leading-tight" style={{ color: OB.inkFaint }}>
                        {step.hint}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>

            {/* Mobile: one line plus a bar, so the rail never wraps into a wall of chips. */}
            <div className="sm:hidden">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: OB.ink }}>
                  Step {currentStepIdx + 1} of {steps.length} · {steps[currentStepIdx]?.label}
                </span>
                {steps[currentStepIdx]?.hint && (
                  <span className="text-[10px]" style={{ color: OB.inkFaint }}>
                    {steps[currentStepIdx].hint}
                  </span>
                )}
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full" style={{ background: OB.goldLineSoft }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(6, progress)}%`, background: `linear-gradient(90deg, ${OB.gold}, ${OB.goldLight})` }}
                />
              </div>
            </div>
          </nav>

          {/* ───────────────── Step card ───────────────── */}
          <div className={`grid flex-1 grid-cols-1 gap-5 ${aside ? 'lg:grid-cols-12' : ''}`}>
            <section
              className={`relative overflow-hidden rounded-3xl border p-4 shadow-2xl sm:p-7 ${aside ? 'lg:col-span-7' : ''}`}
              style={{ background: OB.panel, borderColor: OB.goldLine }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{ backgroundImage: laid.backgroundImage, backgroundSize: laid.backgroundSize, mixBlendMode: laid.blendMode }}
              />
              {/* Gold hairline under the title block, as on the Editions' covers. */}
              <div className="relative">
                <div className="mb-5 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.22em]" style={{ color: OB.gold }}>
                    {eyebrow}
                  </div>
                  <h1 className="text-[26px] leading-tight sm:text-[34px]" style={{ fontFamily: DISPLAY, color: OB.ink }}>
                    {title}
                  </h1>
                  <p className="max-w-3xl text-xs leading-relaxed sm:text-sm" style={{ color: OB.inkMuted }}>
                    {description}
                  </p>
                  <div className="h-px w-full" style={{ background: `linear-gradient(90deg, ${OB.goldLine}, transparent)` }} />
                </div>

                {children}
              </div>
            </section>

            {aside && <aside className="lg:col-span-5">{aside}</aside>}
          </div>
        </main>

        {/* ───────────────── Footer ───────────────── */}
        <footer
          className="sticky bottom-0 z-40 border-t px-4 py-3 backdrop-blur-md sm:px-6"
          style={{ borderColor: OB.goldLine, background: 'rgba(18,16,13,0.88)' }}
        >
          <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-3">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-colors"
                style={{ borderColor: OB.goldLineSoft, color: OB.inkSoft }}
              >
                <ArrowLeft size={14} /> Back
              </button>
            ) : (
              <span />
            )}

            <button
              type="button"
              onClick={onNext}
              disabled={nextDisabled}
              className="flex cursor-pointer items-center gap-2 rounded-xl px-6 py-3 text-xs font-bold text-white shadow-lg transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: isFinalStep ? OB.ok : OB.cta }}
            >
              {nextLabel} {isFinalStep ? <Check size={15} /> : <ArrowRight size={14} />}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
