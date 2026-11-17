/**
 * ThermalBillCard.tsx
 * Photorealistic 80mm Continuous Thermal POS Receipt Emulation
 *
 * Designed to authentically replicate real-world Indian thermal receipts (Petpooja, Posist):
 *  - 20-Tooth mathematical CSS clip-path torn zigzag top & bottom tear edges
 *  - Outer .thermal-shadow-wrapper preserving drop-shadow depth
 *  - Monospace typography stack ('Courier Prime', 'Courier New', monospace)
 *  - Strict 4-column itemized grid: QTY | ITEM NAME | RATE | TOTAL (tabular-nums)
 *  - Indian statutory compliance: GSTIN, FSSAI Lic No, CGST 2.5%, SGST 2.5%, Round-Off
 *  - Amber pulsing UNPAID container with interactive "Ask for Bill at Table" action
 *  - Animated green rubber stamp rotated at -12deg with inertial stampDrop keyframe
 *  - Resilient confetti celebration with zero-dependency DOM particle fallback
 *  - Continuous 80mm roll printer styles under @media print
 */

import { useState, useEffect, type ReactNode } from 'react';
import './ThermalBillCard.css';
import type { PublicTokenData } from '../../pages/customer/BillPage';
import ReceiptPrint, { ReceiptStamp, prefersReducedMotion } from './ReceiptPrint';

interface Props {
  token: PublicTokenData;
  isPaid: boolean;
  paidAt?: string | null;
  paymentMethod?: string | null;
  onPrint?: () => void;
}

// ── Confetti Celebration Trigger with Dynamic Import & Fallback ───────────────
export async function triggerCelebrationConfetti(): Promise<void> {
  const colors = ['#22c55e', '#16a34a', '#86efac', '#fbbf24', '#f59e0b', '#3b82f6'];

  try {
    // Dynamic import to support canvas-confetti if installed (runtime-only to avoid bundler failure)
    const dynamicImport = new Function('m', 'return import(m)');
    const confettiModule = await dynamicImport('canvas-confetti');
    const confetti = (confettiModule as any).default || confettiModule;
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.65 },
        colors,
        disableForReducedMotion: true,
      });
      return;
    }
  } catch {
    // Fallback to DOM particles below
  }

  // Graceful zero-dependency DOM particle fallback (skipped for people who ask for less motion)
  if (typeof document !== 'undefined' && !prefersReducedMotion()) {
    const count = 70;
    const body = document.body;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'confetti-particle-fallback';
      particle.style.cssText = `
        position: fixed;
        top: -12px;
        left: ${Math.random() * 100}vw;
        width: ${5 + Math.random() * 5}px;
        height: ${8 + Math.random() * 8}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 2px;
        transform: rotate(${Math.random() * 360}deg);
        animation: confettiFall ${1.4 + Math.random() * 1.6}s ease-in forwards;
        z-index: 99999;
        pointer-events: none;
      `;
      body.appendChild(particle);
      setTimeout(() => particle.remove(), 3200);
    }
  }
}

// ── Formatting Helpers ────────────────────────────────────────────────────────
function formatDate(iso?: string | null): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    });
  } catch {
    return iso;
  }
}

function formatTime(iso?: string | null): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
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

// ── Barcode SVG — visual bars (Code128 look) ──────────────────────────────────
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
  const rects: ReactNode[] = [];
  bars.forEach((bar, idx) => {
    if (bar.isBar) {
      rects.push(
        <rect
          key={idx}
          x={x * scale}
          y={0}
          width={bar.width * scale}
          height={svgHeight}
          fill="#111111"
        />
      );
    }
    x += bar.width;
  });

  return (
    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width={svgWidth} height={svgHeight} fill="#faf9f5" />
      {rects}
    </svg>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ThermalBillCard({
  token,
  isPaid,
  paidAt,
  paymentMethod,
  onPrint,
}: Props) {
  const [billRequested, setBillRequested] = useState(
    token.status === 'BILL_REQUESTED'
  );
  const [requesting, setRequesting] = useState(false);

  // Synchronize internal billRequested state when parent updates
  useEffect(() => {
    if (token.status === 'BILL_REQUESTED') {
      setBillRequested(true);
    }
  }, [token.status]);

  async function handleRequestBill() {
    if (requesting || billRequested || isPaid) return;
    setRequesting(true);
    try {
      const res = await fetch(
        `/api/public/tokens/${encodeURIComponent(token.tokenId)}/request-bill`,
        { method: 'POST' }
      );
      if (res.ok) {
        setBillRequested(true);
      }
    } catch {
      // silent fallback
    } finally {
      setRequesting(false);
    }
  }

  // ── Financial Tax Calculations ──
  const subtotal = typeof token.subtotal === 'number' ? token.subtotal : (token.subtotal || 0);
  const discount = typeof token.discount === 'number' ? token.discount : (token.discount || 0);
  const taxableAmount = Math.max(0, Number((subtotal - discount).toFixed(2)));

  // 2.5% CGST + 2.5% SGST standard Indian restaurant tax
  const cgst = token.cgst ?? Number((taxableAmount * 0.025).toFixed(2));
  const sgst = token.sgst ?? Number((taxableAmount * 0.025).toFixed(2));
  const totalTaxes = cgst + sgst;

  const calculatedTotal = taxableAmount + totalTaxes;
  const grandTotal = typeof token.total === 'number' ? Math.round(token.total) : Math.round(calculatedTotal);
  const roundOff = Number((grandTotal - calculatedTotal).toFixed(2));

  const tokenBadgeLabel = token.tokenCode || `#${zeroPad(token.tokenNumber)}`;
  const barcodeValue = `TKN${zeroPad(token.tokenNumber)}TABLE${token.tableNumber}`;
  const effectiveMethod = paymentMethod || token.paymentMethod || 'COUNTER';

  return (
    <ReceiptPrint ariaLabel="Thermal Dining Bill" sound>
            <>
              {/* ── 1. Restaurant Header ── */}
              <div className="text-center mb-1">
                <h1 className="thermal-restaurant-name">
                  {token.restaurantName || 'RESTAURANT'}
                </h1>
                {token.restaurantTagline && (
                  <p className="thermal-tagline">{token.restaurantTagline}</p>
                )}
                {token.restaurantAddress && (
                  <p className="thermal-address">{token.restaurantAddress}</p>
                )}
                {(token.restaurantCity || token.restaurantPhone) && (
                  <p className="thermal-city-phone">
                    {[token.restaurantCity, token.restaurantPhone]
                      .filter(Boolean)
                      .join(' • ')}
                  </p>
                )}

                {/* Statutory Badges (GSTIN / FSSAI) */}
                <div className="thermal-statutory-badges">
                  {token.restaurantGstin && <span>GSTIN: {token.restaurantGstin}</span>}
                  {token.restaurantFssai && <span>FSSAI: {token.restaurantFssai}</span>}
                </div>
              </div>

              <hr className="thermal-divider-double" />

              {/* ── 2. Metadata Section: Table, Token, Timestamp, Cashier ── */}
              <div className="thermal-meta-row">
                <span>
                  TABLE #{token.tableNumber}
                  {token.tableName ? ` (${token.tableName})` : ''}
                </span>
                <span className="thermal-token-badge">
                  {tokenBadgeLabel}
                </span>
              </div>
              <div className="thermal-meta-sub">
                <span>
                  {formatDate(token.createdAt)} • {formatTime(token.createdAt)}
                </span>
                <span>{token.cashierName ? `Staff: ${token.cashierName}` : 'Dine-In'}</span>
              </div>

              <hr className="thermal-divider" />

              {/* ── 3. Strict 4-Column Item Grid: QTY | ITEM NAME | RATE | TOTAL ── */}
              <div className="thermal-items-header">
                <span className="thermal-col-qty">QTY</span>
                <span className="thermal-col-name">ITEM NAME</span>
                <span className="thermal-col-rate">RATE</span>
                <span className="thermal-col-total">TOTAL</span>
              </div>

              {token.items.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#888', fontSize: 11, padding: '10px 0' }}>
                  — No items in session —
                </p>
              ) : (
                token.items.map((item, idx) => {
                  const qty = typeof item.quantity === 'number' ? item.quantity : 1;
                  const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : 0;
                  const totalPrice = typeof item.totalPrice === 'number' ? item.totalPrice : unitPrice * qty;
                  return (
                    <div key={item.id || idx} className="thermal-item-row" style={{ padding: '2px 0' }}>
                      <span className="thermal-col-qty">{qty}</span>
                      <span className="thermal-col-name">
                        <span
                          className={`veg-dot ${item.isVeg !== false ? 'veg' : 'nonveg'}`}
                          aria-label={item.isVeg !== false ? 'Veg' : 'Non-Veg'}
                        />
                        {item.name || (item as any).dishName || (item as any).itemName}
                        {item.variant && (
                          <small style={{ display: 'block', fontSize: 9.5, color: '#666', marginLeft: 11 }}>
                            ({item.variant})
                          </small>
                        )}
                      </span>
                      <span className="thermal-col-rate">
                        ₹{unitPrice.toFixed(2)}
                      </span>
                      <span className="thermal-col-total">
                        ₹{totalPrice.toFixed(2)}
                      </span>
                    </div>
                  );
                })
              )}

              <hr className="thermal-divider" />

              {/* ── 4. Financial Summary & Tax Breakdown ── */}
              <div className="thermal-totals">
                <div className="thermal-totals-row">
                  <span>Item Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="thermal-totals-row discount">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="thermal-totals-row">
                  <span>CGST (2.5%)</span>
                  <span>₹{cgst.toFixed(2)}</span>
                </div>
                <div className="thermal-totals-row">
                  <span>SGST (2.5%)</span>
                  <span>₹{sgst.toFixed(2)}</span>
                </div>
                {Math.abs(roundOff) > 0 && (
                  <div className="thermal-totals-row roundoff">
                    <span>Round Off</span>
                    <span>{roundOff > 0 ? `+₹${roundOff.toFixed(2)}` : `-₹${Math.abs(roundOff).toFixed(2)}`}</span>
                  </div>
                )}
              </div>

              {/* ── Grand Total ── */}
              <div className="thermal-grand-total">
                <span>GRAND TOTAL</span>
                <span className="thermal-grand-total-amount">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>

              {/* ── 5. Status Section: UNPAID vs SETTLED Rubber Stamp ── */}
              {isPaid ? (
                /* ── SETTLED State: Inertial Green Rubber Stamp ── */
                <ReceiptStamp
                  kind="paid"
                  title="PAID & SETTLED"
                  sub={`VIA ${effectiveMethod.toUpperCase()}`}
                  date={`${formatDate(paidAt || token.paidAt || token.settledAt)} · ${formatTime(paidAt || token.paidAt || token.settledAt)}`}
                />
              ) : (
                /* ── UNPAID State: Pulsing Amber Warning Container ── */
                <div className="thermal-unpaid-badge-container" role="status" aria-live="polite">
                  <div className="thermal-unpaid-badge">
                    <span>⏳</span>
                    <span>UNPAID BILL</span>
                  </div>
                  <p className="thermal-unpaid-token">
                    SHOW TOKEN {tokenBadgeLabel} AT COUNTER
                  </p>

                  {/* High Contrast Barcode */}
                  <div className="thermal-barcode-wrap">
                    <BarcodeSvg value={barcodeValue} />
                  </div>
                  <p className="thermal-barcode-number">{barcodeValue}</p>

                  {/* Interactive "Ask for Bill at Table" Action */}
                  <div className="thermal-unpaid-actions mt-2.5">
                    {billRequested ? (
                      <div
                        style={{
                          padding: '8px 12px',
                          background: '#dcfce7',
                          border: '1px solid #86efac',
                          borderRadius: 6,
                          fontSize: 11,
                          color: '#166534',
                          fontWeight: 700,
                          textAlign: 'center',
                        }}
                      >
                        ✓ Staff Alerted! Cashier Notified.
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void handleRequestBill()}
                        disabled={requesting}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          background: '#1d2723',
                          border: '1.5px solid #d97706',
                          borderRadius: 6,
                          color: '#fef3c7',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: requesting ? 'not-allowed' : 'pointer',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {requesting ? 'Alerting Counter…' : '🔔 Ask for Bill at Table'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ── 6. Receipt Footer ── */}
              <hr className="thermal-divider" />
              <div className="thermal-footer">
                <p>Thank you for dining with us!</p>
                <p>Powered by MenuSQR · menusqr.in</p>
              </div>

              {/* Screen-Only Print Button */}
              <div className="thermal-print-action mt-3 text-center no-print">
                <button
                  type="button"
                  onClick={() => {
                    if (onPrint) onPrint();
                    else window.print();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/10 hover:bg-black/15 text-[11px] font-bold text-gray-800 transition active:scale-95"
                >
                  <span>🖨️ Print Hardware Receipt</span>
                </button>
              </div>
            </>
    </ReceiptPrint>
  );
}
