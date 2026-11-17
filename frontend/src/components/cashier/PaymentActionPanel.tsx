/**
 * PaymentActionPanel.tsx
 * Shows selected token details + CASH / UPI / CARD settlement buttons.
 * Calls POST /api/app/tokens/:id/settle and invokes onSettled callback.
 * Features:
 *  - 1-Click settlement (Cash / UPI / Card)
 *  - Inline "+ Add Dish" form to append items to open session
 *  - "Receipt Preview" and "Copy Bill Link" quick buttons
 *  - "Close & Free Table" action calling POST /api/app/tokens/:id/close with confirmation
 */

import React, { useState } from 'react';
import type { CashierToken } from './UnpaidTokenQueue';

export interface TokenDetail extends CashierToken {
  items: Array<{
    name: string;
    variant?: string | null;
    quantity: number;
    totalPrice: number;
    isVeg: boolean;
  }>;
  subtotal: number;
  gst: number;
  cgst?: number;
  sgst?: number;
  discount: number;
  roundOff?: number;
  restaurantName?: string;
  restaurantGstin?: string | null;
  restaurantFssai?: string | null;
  restaurantLegalName?: string | null;
  restaurantGstMode?: string | null;
  restaurantAddress?: string | null;
  restaurantCity?: string | null;
  restaurantPhone?: string | null;
  taxMode?: string | null;
  taxRateBps?: number | null;
}

interface Props {
  token: CashierToken;
  detail: TokenDetail | null;
  detailLoading: boolean;
  onSettled: (tokenId: string, method: string) => void;
  onItemAdded?: () => void;
  onPreviewReceipt?: (token: CashierToken, detail: TokenDetail | null) => void;
}

type PayMethod = 'CASH' | 'UPI' | 'CARD';

const METHOD_CONFIG: Record<PayMethod, { label: string; icon: string; color: string; bg: string }> = {
  CASH: { label: 'Cash', icon: '💵', color: '#065f46', bg: '#d1fae5' },
  UPI:  { label: 'UPI',  icon: '📱', color: '#1e3a8a', bg: '#dbeafe' },
  CARD: { label: 'Card', icon: '💳', color: '#4c1d95', bg: '#ede9fe' },
};

export default function PaymentActionPanel({
  token,
  detail,
  detailLoading,
  onSettled,
  onItemAdded,
  onPreviewReceipt,
}: Props) {
  const [settling, setSettling] = useState<PayMethod | null>(null);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Add item form state
  const [showAddItem, setShowAddItem] = useState(false);
  const [dishName, setDishName] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [dishQty, setDishQty] = useState('1');
  const [isVeg, setIsVeg] = useState(true);
  const [addingItem, setAddingItem] = useState(false);

  const billUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/bill/${token.id}`
      : `/bill/${token.id}`;

  async function handleSettle(method: PayMethod) {
    if (settling || closing) return;
    setSettling(method);
    setError(null);

    try {
      const res = await fetch(`/api/app/tokens/${encodeURIComponent(token.id)}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, paymentMethod: method }),
        credentials: 'include',
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          (body as { message?: string; error?: string }).error ||
            (body as { message?: string }).message ||
            `HTTP ${res.status}`
        );
      }

      onSettled(token.id, method);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Settlement failed. Try again.');
      setSettling(null);
    }
  }

  async function handleCloseTable() {
    if (closing || settling) return;

    const isAlreadySettled = ['SETTLED', 'PAID', 'VOID'].includes(
      (token.status || '').toUpperCase()
    );

    if (!isAlreadySettled) {
      const confirmSettleAndClose = window.confirm(
        `Table ${token.tableNumber} bill (₹${token.total.toFixed(2)}) is not settled yet.\n\nSettle with CASH and free Table ${token.tableNumber}?`
      );
      if (!confirmSettleAndClose) return;

      setClosing(true);
      setError(null);
      try {
        // Step 1: settle via CASH
        const settleRes = await fetch(`/api/app/tokens/${encodeURIComponent(token.id)}/settle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ method: 'CASH', paymentMethod: 'CASH' }),
          credentials: 'include',
        });
        if (!settleRes.ok) {
          const body = await settleRes.json().catch(() => ({}));
          throw new Error(
            (body as any).error || (body as any).message || `Settlement failed: ${settleRes.status}`
          );
        }

        // Step 2: close table session
        const closeRes = await fetch(`/api/app/tokens/${encodeURIComponent(token.id)}/close`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (!closeRes.ok) {
          const body = await closeRes.json().catch(() => ({}));
          throw new Error(
            (body as any).error || (body as any).message || `Close failed: ${closeRes.status}`
          );
        }

        onSettled(token.id, 'CLOSED');
      } catch (err: any) {
        setError(err.message || 'Failed to close table.');
      } finally {
        setClosing(false);
      }
      return;
    }

    // Already settled: direct confirmation to free table
    if (!window.confirm(`Free Table ${token.tableNumber} and complete dining session?`)) return;

    setClosing(true);
    setError(null);
    try {
      const res = await fetch(`/api/app/tokens/${encodeURIComponent(token.id)}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          (body as any).error || (body as any).message || `Close failed: ${res.status}`
        );
      }
      onSettled(token.id, 'CLOSED');
    } catch (err: any) {
      setError(err.message || 'Failed to close table.');
    } finally {
      setClosing(false);
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(billUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!dishName.trim()) return;
    const priceNum = parseFloat(dishPrice);
    if (isNaN(priceNum) || priceNum < 0) return;
    const qtyNum = parseInt(dishQty, 10) || 1;

    setAddingItem(true);
    setError(null);

    try {
      const res = await fetch(`/api/app/tokens/${encodeURIComponent(token.id)}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          dishName: dishName.trim(),
          price: priceNum,
          unitPricePaise: Math.round(priceNum * 100),
          quantity: qtyNum,
          isVeg,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error || `HTTP ${res.status}`);
      }

      setDishName('');
      setDishPrice('');
      setDishQty('1');
      setShowAddItem(false);
      onItemAdded?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
    } finally {
      setAddingItem(false);
    }
  }

  return (
    <div
      style={{
        background: '#151c19',
        border: '1.5px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(90deg, rgba(232,120,60,0.12), transparent)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <p
            style={{
              fontSize: 12,
              color: '#6b7280',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              marginBottom: 2,
            }}
          >
            Settling Table
          </p>
          <p
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#fcfaf8',
              fontFamily: 'Courier Prime, Courier New, monospace',
            }}
          >
            Token #{String(token.tokenNumber).padStart(3, '0')} · Table {token.tableNumber}
          </p>
        </div>
        <div
          style={{
            background: '#e8783c',
            color: '#fff',
            borderRadius: 8,
            padding: '6px 14px',
            fontFamily: 'Courier Prime, Courier New, monospace',
            fontWeight: 700,
            fontSize: 20,
          }}
        >
          ₹{token.total.toFixed(2)}
        </div>
      </div>

      {/* ── Quick Actions Bar ───────────────────────────────────────── */}
      <div
        style={{
          padding: '10px 16px',
          background: 'rgba(255,255,255,0.02)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 6,
        }}
      >
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {/* Inline Receipt Preview */}
          {onPreviewReceipt && (
            <button
              type="button"
              onClick={() => onPreviewReceipt(token, detail)}
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: '5px 10px',
                borderRadius: 6,
                background: 'rgba(59,130,246,0.15)',
                color: '#60a5fa',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              🧾 Preview Receipt
            </button>
          )}

          <a
            href={billUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '5px 10px',
              borderRadius: 6,
              background: 'rgba(232,120,60,0.12)',
              color: '#e8783c',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            ↗ Open Tab
          </a>

          <button
            type="button"
            onClick={() => void handleCopyLink()}
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '5px 10px',
              borderRadius: 6,
              background: 'rgba(255,255,255,0.06)',
              color: copied ? '#4ade80' : '#aab7b2',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {copied ? '✓ Link Copied' : '📋 Copy Link'}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowAddItem(!showAddItem)}
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: '5px 10px',
            borderRadius: 6,
            background: showAddItem ? 'rgba(255,255,255,0.1)' : 'rgba(34,197,94,0.15)',
            color: showAddItem ? '#aab7b2' : '#4ade80',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {showAddItem ? '✕ Close' : '+ Add Dish'}
        </button>
      </div>

      {/* ── Add Item Inline Form ───────────────────────────────────── */}
      {showAddItem && (
        <form
          onSubmit={(e) => void handleAddItem(e)}
          style={{
            padding: '12px 16px',
            background: 'rgba(0,0,0,0.25)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr auto auto',
            gap: 6,
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            required
            placeholder="Dish name"
            value={dishName}
            onChange={(e) => setDishName(e.target.value)}
            style={{
              padding: '6px 8px',
              background: '#1d2723',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6,
              color: '#fff',
              fontSize: 12,
            }}
          />
          <input
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="Price"
            value={dishPrice}
            onChange={(e) => setDishPrice(e.target.value)}
            style={{
              padding: '6px 8px',
              background: '#1d2723',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6,
              color: '#fff',
              fontSize: 12,
            }}
          />
          <input
            type="number"
            min="1"
            max="99"
            required
            placeholder="Qty"
            value={dishQty}
            onChange={(e) => setDishQty(e.target.value)}
            style={{
              padding: '6px 8px',
              background: '#1d2723',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6,
              color: '#fff',
              fontSize: 12,
            }}
          />
          <button
            type="button"
            onClick={() => setIsVeg(!isVeg)}
            style={{
              padding: '6px 8px',
              background: isVeg ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
              border: `1px solid ${isVeg ? '#16a34a' : '#dc2626'}`,
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 700,
              color: isVeg ? '#4ade80' : '#f87171',
              cursor: 'pointer',
            }}
          >
            {isVeg ? 'Veg' : 'Non'}
          </button>
          <button
            type="submit"
            disabled={addingItem}
            style={{
              padding: '6px 12px',
              background: '#e8783c',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              fontWeight: 700,
              fontSize: 12,
              cursor: addingItem ? 'not-allowed' : 'pointer',
            }}
          >
            {addingItem ? '…' : 'Add'}
          </button>
        </form>
      )}

      {/* ── Item summary ──────────────────────────────────────────── */}
      {detailLoading ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
          Loading items…
        </div>
      ) : detail ? (
        <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {detail.items.length === 0 ? (
            <p style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', padding: '8px 0' }}>
              No dishes added yet. Click &quot;+ Add Dish&quot; above to add items.
            </p>
          ) : (
            detail.items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  color: '#aab7b2',
                  padding: '3px 0',
                  fontFamily: 'Courier Prime, Courier New, monospace',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: item.isVeg ? '#16a34a' : '#dc2626',
                      flexShrink: 0,
                      display: 'inline-block',
                    }}
                  />
                  {item.quantity}× {item.name}
                  {item.variant ? <span style={{ color: '#4b5563' }}> ({item.variant})</span> : null}
                </span>
                <span>₹{item.totalPrice.toFixed(2)}</span>
              </div>
            ))
          )}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 11,
              color: '#6b7280',
              paddingTop: 6,
              marginTop: 6,
              borderTop: '1px dashed rgba(255,255,255,0.07)',
            }}
          >
            <span>GST (5%)</span>
            <span>₹{detail.gst.toFixed(2)}</span>
          </div>
        </div>
      ) : null}

      {/* ── Settlement Buttons ─────────────────────────────────────── */}
      <div style={{ padding: '16px 20px' }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#6b7280',
            marginBottom: 10,
          }}
        >
          Accept Settlement Via
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
          {(Object.entries(METHOD_CONFIG) as [PayMethod, (typeof METHOD_CONFIG)[PayMethod]][]).map(
            ([method, cfg]) => {
              const isActive = settling === method;
              return (
                <button
                  key={method}
                  type="button"
                  disabled={!!settling || closing}
                  onClick={() => void handleSettle(method)}
                  aria-busy={isActive}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '14px 8px',
                    background: isActive ? cfg.bg : '#1d2723',
                    border: `2px solid ${isActive ? cfg.color : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 10,
                    cursor: settling || closing ? 'not-allowed' : 'pointer',
                    opacity: settling && !isActive ? 0.45 : 1,
                    transition: 'all 0.15s ease',
                    gap: 6,
                  }}
                >
                  <span style={{ fontSize: 22 }}>{cfg.icon}</span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: isActive ? cfg.color : '#aab7b2',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {isActive ? '…' : cfg.label}
                  </span>
                </button>
              );
            }
          )}
        </div>

        {/* Close & Free Table Action Button */}
        <button
          type="button"
          disabled={closing || !!settling}
          onClick={() => void handleCloseTable()}
          style={{
            width: '100%',
            padding: '10px 14px',
            background: '#1d2723',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 10,
            color: '#f87171',
            fontSize: 11,
            fontWeight: 700,
            cursor: closing || settling ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all 0.15s ease',
            marginBottom: 8,
          }}
        >
          <span>🚪</span>
          <span>
            {closing ? 'Closing Table…' : `Close & Free Table ${token.tableNumber}`}
          </span>
        </button>

        {/* Error Notification */}
        {error && (
          <div
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 12,
              color: '#fca5a5',
              marginBottom: 10,
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
            }}
          >
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <p style={{ fontSize: 10, color: '#4b5563', textAlign: 'center', lineHeight: 1.5 }}>
          Real-time table synchronization · Customer phone updates instantly
        </p>
      </div>
    </div>
  );
}
