/**
 * ThermalBillCard.tsx
 * Renders a realistic 80mm thermal paper receipt simulation.
 *
 * Props:
 *  - token: PublicTokenData  — full bill data from /api/public/tokens/:id
 *  - isPaid: boolean         — true = green rubber stamp; false = amber warning strip
 *  - paidAt: string | null   — ISO timestamp of payment
 *  - paymentMethod: string | null  — "CASH" | "UPI" | "CARD"
 */

import { useState, useEffect, useCallback } from 'react';
import './ThermalBillCard.css';
import type { PublicTokenData } from '../../pages/customer/BillPage';

interface Props {
  token: PublicTokenData;
  isPaid: boolean;
  paidAt: string | null;
  paymentMethod: string | null;
}

// ── Web Audio API Realistic Thermal Printer Sound Simulation ───────────────────
function playThermalPrintSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    
    // Rapid micro-bursts for ~2.1 seconds simulating stepper motor paper feed
    const totalBursts = 16;
    for (let i = 0; i < totalBursts; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i % 2 === 0 ? 'square' : 'triangle';
      osc.frequency.setValueAtTime(140 + (i % 4) * 45, now + (i * 0.12));
      gain.gain.setValueAtTime(0.015, now + (i * 0.12));
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (i * 0.12) + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + (i * 0.12));
      osc.stop(now + (i * 0.12) + 0.055);
    }

    // Mechanical cutter click sound at finish
    const cutterTime = now + 2.05;
    const cutterOsc = ctx.createOscillator();
    const cutterGain = ctx.createGain();
    cutterOsc.type = 'sawtooth';
    cutterOsc.frequency.setValueAtTime(720, cutterTime);
    cutterGain.gain.setValueAtTime(0.035, cutterTime);
    cutterGain.gain.exponentialRampToValueAtTime(0.001, cutterTime + 0.1);
    cutterOsc.connect(cutterGain);
    cutterGain.connect(ctx.destination);
    cutterOsc.start(cutterTime);
    cutterOsc.stop(cutterTime + 0.1);
  } catch {
    // Autoplay or unsupported audio - silent fallback
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRupees(amount: number): string {
  return '₹' + amount.toFixed(2);
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      timeZone: 'Asia/Kolkata',
    });
  } catch {
    return iso;
  }
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
  } catch {
    return '';
  }
}

function zeroPad(n: number, width = 3): string {
  return String(n).padStart(width, '0');
}

// ── Barcode SVG — visual bars (pseudo-Code128 look) ──────────────────────────
function BarcodeSvg({ value }: { value: string }) {
  const bars: Array<{ width: number; isBar: boolean }> = [];
  let i = 0;
  bars.push({ width: 4, isBar: false });
  bars.push({ width: 2, isBar: true });
  bars.push({ width: 1, isBar: false });
  bars.push({ width: 3, isBar: true });
  bars.push({ width: 1, isBar: false });

  for (const ch of value) {
    const code = ch.charCodeAt(0);
    bars.push({ width: 1 + (code % 3), isBar: true });
    bars.push({ width: 1 + ((code >> 2) % 2), isBar: false });
    bars.push({ width: 1 + ((code >> 4) % 2), isBar: true });
    bars.push({ width: 1, isBar: false });
    i++;
    if (i > 24) break;
  }

  bars.push({ width: 2, isBar: true });
  bars.push({ width: 3, isBar: false });
  bars.push({ width: 2, isBar: true });
  bars.push({ width: 4, isBar: false });

  const totalWidth = bars.reduce((s, b) => s + b.width, 0);
  const svgWidth = 180;
  const svgHeight = 38;
  const scale = svgWidth / totalWidth;

  let x = 0;
  const rects: React.ReactNode[] = [];
  bars.forEach((bar, idx) => {
    if (bar.isBar) {
      rects.push(
        <rect
          key={idx}
          x={x * scale}
          y={0}
          width={bar.width * scale}
          height={svgHeight}
          fill="#1a1a1a"
        />
      );
    }
    x += bar.width;
  });

  return (
    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} xmlns="http://www.w3.org/2000/svg">
      <rect width={svgWidth} height={svgHeight} fill="#faf9f5" />
      {rects}
    </svg>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ThermalBillCard({ token, isPaid, paidAt, paymentMethod }: Props) {
  const [billRequested, setBillRequested] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(true);

  const startPrintingAnimation = useCallback(() => {
    setIsPrinting(true);
    playThermalPrintSound();
    const timer = setTimeout(() => {
      setIsPrinting(false);
    }, 2400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const cleanup = startPrintingAnimation();
    return cleanup;
  }, [startPrintingAnimation]);

  async function handleRequestBill() {
    if (requesting || billRequested) return;
    setRequesting(true);
    try {
      const res = await fetch(`/api/public/tokens/${encodeURIComponent(token.tokenId)}/request-bill`, {
        method: 'POST',
      });
      if (res.ok) {
        setBillRequested(true);
      }
    } catch {
      // ignore
    } finally {
      setRequesting(false);
    }
  }

  const tokenLabel = `#${zeroPad(token.tokenNumber)}`;
  const barcodeValue = `TKN${zeroPad(token.tokenNumber)}TABLE${token.tableNumber}`;
  const payLabel = paymentMethod
    ? paymentMethod.toUpperCase()
    : 'SETTLEMENT';

  return (
    <div className="pos-printer-wrapper">
      {/* ── Hardware Printer Head Chassis ── */}
      <div className="pos-machine-head">
        <div className="pos-machine-surface">
          <div className="pos-brand-tag">
            <span className="pos-brand-dot"></span>
            <span className="pos-brand-name">POS-80 THERMAL</span>
          </div>
          <div className="pos-status-lights">
            <div className={`pos-led ${isPrinting ? 'printing' : 'online'}`}>
              <span className="led-bulb"></span>
              <span className="led-label">{isPrinting ? 'PRINTING' : 'ONLINE'}</span>
            </div>
            <button
              type="button"
              onClick={startPrintingAnimation}
              disabled={isPrinting}
              className="pos-feed-btn"
              title="Feed / Re-print Receipt"
            >
              🖨️ FEED
            </button>
          </div>
        </div>
        <div className="pos-paper-slit">
          <div className="pos-slit-teeth"></div>
        </div>
      </div>

      {/* ── Paper Viewport ── */}
      <div className={`pos-paper-viewport ${isPrinting ? 'is-printing' : ''}`}>
        <div className={`thermal-card ${isPrinting ? 'printing-feed' : ''}`} role="region" aria-label="Your Bill">

      {/* ── Top zigzag — rendered via ::before pseudo-element in CSS ── */}

      <div className="thermal-inner">

        {/* ── Restaurant Header ──────────────────────────────────────── */}
        <p className="thermal-restaurant-name">{token.restaurantName}</p>
        {token.restaurantTagline && (
          <p className="thermal-tagline">{token.restaurantTagline}</p>
        )}
        {(token.restaurantCity || token.restaurantPhone) && (
          <p className="thermal-city-phone">
            {[token.restaurantCity, token.restaurantPhone].filter(Boolean).join(' • ')}
          </p>
        )}

        <hr className="thermal-divider-double" />

        {/* ── Token & Table meta ─────────────────────────────────────── */}
        <div className="thermal-meta">
          <span>
            <span className="thermal-meta-label">TABLE</span>{' '}
            {token.tableNumber}
          </span>
          <span>
            <span className="thermal-meta-label">TOKEN</span>{' '}
            {tokenLabel}
          </span>
        </div>
        <p className="thermal-datetime">
          {formatDate(token.createdAt)} &nbsp; {formatTime(token.createdAt)}
        </p>

        <hr className="thermal-divider" />

        {/* ── Items header ───────────────────────────────────────────── */}
        <div className="thermal-items-header">
          <span>ITEM</span>
          <span style={{ textAlign: 'center' }}>QTY</span>
          <span style={{ textAlign: 'right' }}>AMT</span>
        </div>

        <hr className="thermal-divider" />

        {/* ── Items rows ─────────────────────────────────────────────── */}
        {token.items.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999', fontSize: 11, padding: '8px 0' }}>
            — No items yet —
          </p>
        ) : (
          token.items.map((item, idx) => (
            <div key={idx} className="thermal-item-row">
              <span className="thermal-item-name">
                <span
                  className={`veg-dot ${item.isVeg ? 'veg' : 'nonveg'}`}
                  aria-label={item.isVeg ? 'Veg' : 'Non-Veg'}
                />
                {item.name}
                {item.variant && <small>{item.variant}</small>}
              </span>
              <span className="thermal-item-qty">{item.quantity}</span>
              <span className="thermal-item-price">{formatRupees(item.totalPrice)}</span>
            </div>
          ))
        )}

        <hr className="thermal-divider" />

        {/* ── Totals ─────────────────────────────────────────────────── */}
        <div className="thermal-totals">
          <div className="thermal-totals-row subtotal">
            <span>Subtotal</span>
            <span>{formatRupees(token.subtotal)}</span>
          </div>
          {token.gst > 0 && (
            <div className="thermal-totals-row gst">
              <span>GST / Tax</span>
              <span>{formatRupees(token.gst)}</span>
            </div>
          )}
          {token.discount > 0 && (
            <div className="thermal-totals-row discount">
              <span>Discount</span>
              <span>- {formatRupees(token.discount)}</span>
            </div>
          )}
        </div>

        <hr className="thermal-divider-solid" />

        <div className="thermal-total-final">
          <span>TOTAL</span>
          <span>{formatRupees(token.total)}</span>
        </div>

        {/* ── Status section — swaps between UNPAID / PAID ───────────── */}
        <div className="thermal-status-transition">

          {isPaid ? (
            /* ── PAID State: Green Rubber Stamp ──────────────────────── */
            <div className="thermal-status-paid" aria-live="assertive">
              <div className="thermal-paid-stamp" role="status">
                <p className="thermal-paid-stamp-text">✓ PAID</p>
                <p className="thermal-paid-stamp-sub">&amp; SETTLED</p>
              </div>
              {paymentMethod && (
                <p className="thermal-paid-method">
                  Paid via {payLabel}
                </p>
              )}
              {paidAt && (
                <p className="thermal-paid-at">
                  {formatDate(paidAt)} at {formatTime(paidAt)}
                </p>
              )}
            </div>
          ) : (
            /* ── UNPAID State: Amber pulsing strip + barcode ─────────── */
            <div className="thermal-status-unpaid" role="status" aria-live="polite">
              <div className="thermal-unpaid-badge">
                <span>⏳</span>
                <span>UNPAID</span>
              </div>
              <p className="thermal-unpaid-token">
                SHOW TOKEN {tokenLabel} AT COUNTER
              </p>

              {/* Barcode */}
              <div className="thermal-barcode-wrap" aria-hidden="true">
                <BarcodeSvg value={barcodeValue} />
              </div>
              <p className="thermal-barcode-number">{barcodeValue}</p>

              {/* Customer Request Bill Action */}
              <div style={{ marginTop: 10 }}>
                {billRequested ? (
                  <div style={{
                    padding: '8px 12px',
                    background: '#dcfce7',
                    border: '1px solid #86efac',
                    borderRadius: 6,
                    fontSize: 11,
                    color: '#166534',
                    fontWeight: 700,
                    textAlign: 'center',
                  }}>
                    ✓ Staff Alerted! Cashier Notified.
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => void handleRequestBill()}
                    disabled={requesting}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: '#1d2723',
                      border: '1.5px solid #d97706',
                      borderRadius: 6,
                      color: '#fef3c7',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: requesting ? 'not-allowed' : 'pointer',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      transition: 'all 0.15s',
                    }}
                  >
                    {requesting ? 'Alerting Counter…' : '🔔 Ask for Bill at Table'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <hr className="thermal-divider" />
        <div className="thermal-footer">
          <p>Thank you for dining with us!</p>
          <p>Powered by MenuSQR · menusqr.in</p>
        </div>

      </div>

      {/* ── Bottom zigzag — rendered via ::after pseudo-element in CSS ── */}

        </div>
      </div>
    </div>
  );
}
