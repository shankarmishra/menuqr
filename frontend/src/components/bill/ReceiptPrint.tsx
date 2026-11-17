/**
 * ReceiptPrint.tsx
 * The shared thermal-printer frame: printer head, paper feed animation, optional motor sound,
 * and a rubber stamp. Every receipt in the app (table bill, cashier preview, subscription
 * receipt, kitchen ticket) puts its own lines inside it, so they all print the same way.
 *
 * - CSS-only animation (ThermalBillCard.css); people who ask for reduced motion get the paper
 *   already printed, without movement or sound.
 * - A stamp only says what the caller passes. Payment screens must pass `approved` only after the
 *   server confirmed the payment.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import './ThermalBillCard.css';

export const PRINT_DURATION_MS = 2200;

export function prefersReducedMotion(): boolean {
  try {
    return typeof window !== 'undefined'
      && typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/** Short stepper-motor burst and a cutter click, made with Web Audio (no files). */
export function playThermalPrintSound(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    for (let i = 0; i < 14; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i % 2 === 0 ? 'square' : 'triangle';
      osc.frequency.setValueAtTime(140 + (i % 4) * 45, now + i * 0.12);
      gain.gain.setValueAtTime(0.015, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.055);
    }
    const cutterTime = now + 1.85;
    const cutterOsc = ctx.createOscillator();
    const cutterGain = ctx.createGain();
    cutterOsc.type = 'sawtooth';
    cutterOsc.frequency.setValueAtTime(720, cutterTime);
    cutterGain.gain.setValueAtTime(0.035, cutterTime);
    cutterGain.gain.exponentialRampToValueAtTime(0.001, cutterTime + 0.09);
    cutterOsc.connect(cutterGain);
    cutterGain.connect(ctx.destination);
    cutterOsc.start(cutterTime);
    cutterOsc.stop(cutterTime + 0.095);
    setTimeout(() => { void ctx.close().catch(() => {}); }, 2400);
  } catch {
    // Autoplay blocked or unsupported: stay silent.
  }
}

export type ReceiptStampKind = 'approved' | 'paid' | 'declined';

export interface ReceiptStampProps {
  kind: ReceiptStampKind;
  title: string;
  sub?: string;
  date?: string;
}

/** Rotated rubber stamp. Green for approved/paid, red for declined. */
export function ReceiptStamp({ kind, title, sub, date }: ReceiptStampProps) {
  return (
    <div className="thermal-status-paid" aria-live="assertive">
      <div className={`thermal-rubber-stamp ${kind === 'declined' ? 'declined' : ''}`} role="status" data-stamp={kind}>
        <span className="thermal-stamp-heading">{title}</span>
        {sub && <span className="thermal-stamp-sub">{sub}</span>}
        {date && <span className="thermal-stamp-date">{date}</span>}
      </div>
    </div>
  );
}

export interface ReceiptPrintProps {
  children: ReactNode;
  /** Name read by screen readers for the paper, e.g. "Table bill". */
  ariaLabel: string;
  /** Text on the printer head. */
  machineLabel?: string;
  /** Play the motor sound when printing (only after a user gesture will browsers allow it). */
  sound?: boolean;
  /** Show the FEED button that prints the paper again. */
  showFeedButton?: boolean;
  /** Changing this value prints the paper again (e.g. a new order id). */
  printKey?: string | number;
  /** Narrow 58 mm paper instead of 80 mm. */
  narrow?: boolean;
}

export default function ReceiptPrint({
  children,
  ariaLabel,
  machineLabel = 'POS-80 THERMAL',
  sound = false,
  showFeedButton = true,
  printKey,
  narrow = false,
}: ReceiptPrintProps) {
  const [isPrinting, setIsPrinting] = useState(() => !prefersReducedMotion());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startPrinting = useCallback((withSound: boolean) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (prefersReducedMotion()) {
      setIsPrinting(false);
      return;
    }
    setIsPrinting(true);
    if (withSound) playThermalPrintSound();
    timerRef.current = setTimeout(() => setIsPrinting(false), PRINT_DURATION_MS);
  }, []);

  useEffect(() => {
    startPrinting(sound);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [printKey, sound, startPrinting]);

  return (
    <div className={`pos-printer-wrapper ${narrow ? 'is-narrow' : ''}`}>
      <div className="pos-machine-head" aria-hidden="true">
        <div className="pos-machine-surface">
          <div className="pos-brand-tag">
            <span className="pos-brand-dot" />
            <span className="pos-brand-name">{machineLabel}</span>
          </div>
          <div className="pos-status-lights">
            <div className={`pos-led ${isPrinting ? 'printing' : 'online'}`}>
              <span className="led-bulb" />
              <span className="led-label">{isPrinting ? 'PRINTING' : 'ONLINE'}</span>
            </div>
            {showFeedButton && (
              <button
                type="button"
                onClick={() => startPrinting(sound)}
                disabled={isPrinting}
                className="pos-feed-btn"
                title="Feed / Re-print Receipt"
                tabIndex={-1}
              >
                🖨️ FEED
              </button>
            )}
          </div>
        </div>
        <div className="pos-paper-slit">
          <div className="pos-slit-teeth" />
        </div>
      </div>

      <div className={`pos-paper-viewport ${isPrinting ? 'is-printing' : ''}`}>
        <div className="thermal-shadow-wrapper">
          <div
            className={`thermal-card-clipped ${isPrinting ? 'printing-feed' : ''}`}
            role="region"
            aria-label={ariaLabel}
            aria-busy={isPrinting}
          >
            <div className="thermal-inner">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
