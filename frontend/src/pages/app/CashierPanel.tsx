/**
 * CashierPanel.tsx
 * /app/cashier — PREMIUM plan only (reception_orders capability)
 *
 * Real-time cashier counter for token management:
 *  - SSE-driven live queue of UNPAID tokens
 *  - Quick token search by number
 *  - One-click CASH / UPI / CARD settlement
 *  - Customer's phone updates instantly (zero reload) via per-token SSE
 *  - Staff can open a new table token directly from the counter
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import TokenSearchInput from '../../components/cashier/TokenSearchInput';
import UnpaidTokenQueue, { type CashierToken } from '../../components/cashier/UnpaidTokenQueue';
import PaymentActionPanel from '../../components/cashier/PaymentActionPanel';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TokenDetail extends CashierToken {
  items: Array<{
    name: string;
    variant?: string | null;
    quantity: number;
    totalPrice: number;
    isVeg: boolean;
  }>;
  subtotal: number;
  gst: number;
  discount: number;
  restaurantName?: string;
}

// ── Helper ────────────────────────────────────────────────────────────────────

function buildTokenFromSsePayload(payload: Record<string, unknown>): CashierToken {
  return {
    id: String(payload.tokenId ?? payload.id ?? ''),
    tokenNumber: Number(payload.tokenNumber ?? 0),
    tableNumber: Number(payload.tableNumber ?? 0),
    total: Number(payload.total ?? 0),
    itemCount: Number(payload.itemCount ?? (payload.items as unknown[] | undefined)?.length ?? 0),
    createdAt: String(payload.createdAt ?? new Date().toISOString()),
    status: (payload.status as CashierToken['status']) ?? 'UNPAID',
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CashierPanel() {
  const [tokens, setTokens] = useState<CashierToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToken, setSelectedToken] = useState<CashierToken | null>(null);
  const [tokenDetail, setTokenDetail] = useState<TokenDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [sseStatus, setSseStatus] = useState<'connecting' | 'live' | 'error'>('connecting');

  // Modal for creating a new token
  const [showNewTokenModal, setShowNewTokenModal] = useState(false);
  const [newTableNum, setNewTableNum] = useState('');
  const [creatingToken, setCreatingToken] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const sseRef = useRef<EventSource | null>(null);
  const detailAbortRef = useRef<AbortController | null>(null);

  // ── 1. Initial token list fetch ─────────────────────────────────────────────
  const fetchTokens = useCallback(async () => {
    try {
      const res = await fetch('/api/app/tokens?status=UNPAID', { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { tokens?: CashierToken[] } | CashierToken[];
      const list = Array.isArray(data) ? data : (data as { tokens?: CashierToken[] }).tokens ?? [];
      setTokens(list.map((t) => ({
        id: t.id,
        tokenNumber: t.tokenNumber,
        tableNumber: t.tableNumber,
        total: t.total,
        itemCount: t.itemCount ?? 0,
        createdAt: t.createdAt,
        status: t.status,
      })));
    } catch {
      // Non-critical — SSE will keep us updated
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTokens();
  }, [fetchTokens]);

  // ── 2. SSE — real-time token events ────────────────────────────────────────
  useEffect(() => {
    const sse = new EventSource('/api/app/orders/stream', { withCredentials: true });
    sseRef.current = sse;

    sse.onopen = () => setSseStatus('live');
    sse.onerror = () => setSseStatus('error');

    // New token created (waiter opened a bill)
    sse.addEventListener('new_token', (e) => {
      try {
        const payload = JSON.parse(e.data) as Record<string, unknown>;
        const t = buildTokenFromSsePayload(payload);
        setTokens((prev) => {
          if (prev.some((x) => x.id === t.id)) return prev;
          return [t, ...prev];
        });
      } catch { /* ignore */ }
    });

    // Token settled (paid) — remove from queue
    sse.addEventListener('token_settled', (e) => {
      try {
        const payload = JSON.parse(e.data) as Record<string, unknown>;
        const tokenId = String(payload.tokenId ?? payload.id ?? '');
        setTokens((prev) => prev.filter((t) => t.id !== tokenId));
        setSelectedToken((prev) => (prev?.id === tokenId ? null : prev));
      } catch { /* ignore */ }
    });

    // Token voided — remove from queue
    sse.addEventListener('token_voided', (e) => {
      try {
        const payload = JSON.parse(e.data) as Record<string, unknown>;
        const tokenId = String(payload.tokenId ?? payload.id ?? '');
        setTokens((prev) => prev.filter((t) => t.id !== tokenId));
        setSelectedToken((prev) => (prev?.id === tokenId ? null : prev));
      } catch { /* ignore */ }
    });

    // Item added to token — update total & itemCount
    sse.addEventListener('token_item_added', (e) => {
      try {
        const payload = JSON.parse(e.data) as Record<string, unknown>;
        const tokenId = String(payload.tokenId ?? '');
        const newTotal = Number(payload.total ?? 0);
        const newItemCount = Number(payload.itemCount ?? 0);
        setTokens((prev) =>
          prev.map((t) =>
            t.id === tokenId
              ? { ...t, total: newTotal, itemCount: newItemCount }
              : t
          )
        );
        // Refresh detail if this is the selected token
        setSelectedToken((prev) => {
          if (prev?.id === tokenId) {
            void fetchTokenDetail(tokenId);
          }
          return prev;
        });
      } catch { /* ignore */ }
    });

    // Bill requested by customer (optional — shows a pulse)
    sse.addEventListener('bill_requested', (e) => {
      try {
        const payload = JSON.parse(e.data) as Record<string, unknown>;
        const tokenId = String(payload.tokenId ?? '');
        // Flash the token row as a visual cue
        const el = document.getElementById(`token-row-${tokenId}`);
        if (el) {
          el.style.animation = 'billRequestFlash 1.2s ease 3';
          setTimeout(() => { if (el) el.style.animation = ''; }, 3700);
        }
      } catch { /* ignore */ }
    });

    return () => {
      sse.close();
      sseRef.current = null;
    };
  }, []);

  // ── 3. Fetch token detail when selection changes ────────────────────────────
  const fetchTokenDetail = useCallback(async (tokenId: string) => {
    // Cancel previous fetch
    detailAbortRef.current?.abort();
    const ctrl = new AbortController();
    detailAbortRef.current = ctrl;

    setDetailLoading(true);
    setTokenDetail(null);

    try {
      const res = await fetch(`/api/app/tokens/${encodeURIComponent(tokenId)}`, {
        credentials: 'include',
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as TokenDetail;
      setTokenDetail(data);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setTokenDetail(null);
      }
    } finally {
      if (!ctrl.signal.aborted) setDetailLoading(false);
    }
  }, []);

  function handleSelectToken(token: CashierToken) {
    setSelectedToken(token);
    void fetchTokenDetail(token.id);
  }

  // ── 4. Post-settlement handler ──────────────────────────────────────────────
  function handleSettled(tokenId: string, _method: string) {
    // Remove from queue
    setTokens((prev) => prev.filter((t) => t.id !== tokenId));
    setSelectedToken(null);
    setTokenDetail(null);
  }

  // ── 5. Create new table token handler ───────────────────────────────────────
  async function handleCreateToken(e: React.FormEvent) {
    e.preventDefault();
    const tableNum = parseInt(newTableNum, 10);
    if (isNaN(tableNum) || tableNum <= 0) return;

    setCreatingToken(true);
    setCreateError(null);

    try {
      const res = await fetch('/api/app/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tableNumber: tableNum }),
      });
      const data = await res.json() as { error?: string; message?: string; token?: CashierToken };
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to open table');
      }

      setShowNewTokenModal(false);
      setNewTableNum('');
      await fetchTokens();

      if (data.token) {
        const created: CashierToken = {
          id: data.token.id,
          tokenNumber: data.token.tokenNumber,
          tableNumber: data.token.tableNumber,
          total: data.token.total || 0,
          itemCount: 0,
          createdAt: data.token.createdAt,
          status: 'UNPAID',
        };
        setSelectedToken(created);
        void fetchTokenDetail(created.id);
      }
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create token');
    } finally {
      setCreatingToken(false);
    }
  }

  // ── 6. Filtered tokens ──────────────────────────────────────────────────────
  const filteredTokens = searchQuery
    ? tokens.filter((t) => String(t.tokenNumber).includes(searchQuery))
    : tokens;

  const unpaidCount = tokens.filter((t) => t.status === 'UNPAID').length;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#0a100d', color: '#fcfaf8', fontFamily: 'sans-serif' }}>

      {/* ── Flash animation keyframe ─────────────────────────────── */}
      <style>{`
        @keyframes billRequestFlash {
          0%, 100% { background: #1d2723; }
          50%       { background: rgba(251,191,36,0.18); border-color: rgba(251,191,36,0.5); }
        }
      `}</style>

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '18px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#151c19',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>
            🏪 Cashier Counter
          </h1>
          <p style={{ fontSize: 12, color: '#6b7280' }}>
            {unpaidCount > 0
              ? `${unpaidCount} unpaid token${unpaidCount !== 1 ? 's' : ''} waiting`
              : 'No pending tokens'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* New Token Button */}
          <button
            type="button"
            onClick={() => setShowNewTokenModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#e8783c',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            + Open Table Bill
          </button>

          {/* SSE status dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: sseStatus === 'live' ? '#22c55e' : sseStatus === 'error' ? '#ef4444' : '#f59e0b',
              boxShadow: sseStatus === 'live' ? '0 0 6px #22c55e' : 'none',
              display: 'inline-block',
              animation: sseStatus === 'live' ? 'livePulse 2s ease infinite' : 'none',
            }} />
            {sseStatus === 'live' ? 'Live' : sseStatus === 'error' ? 'Reconnecting…' : 'Connecting…'}
            <style>{`
              @keyframes livePulse {
                0%, 100% { opacity: 1; box-shadow: 0 0 6px #22c55e; }
                50%       { opacity: 0.7; box-shadow: 0 0 12px #22c55e; }
              }
            `}</style>
          </div>
        </div>
      </div>

      {/* ── Main layout — two column on md+ ──────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(280px, 380px) 1fr',
        gap: 0,
        height: 'calc(100vh - 73px)',
        overflow: 'hidden',
      }}>
        {/* ── LEFT PANEL: Token Queue ──────────────────────────────── */}
        <div style={{
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Search bar */}
          <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <TokenSearchInput value={searchQuery} onChange={setSearchQuery} />
          </div>

          {/* Scrollable token list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 24px' }}>
            <UnpaidTokenQueue
              tokens={filteredTokens}
              selectedId={selectedToken?.id ?? null}
              onSelect={handleSelectToken}
              loading={loading}
            />
          </div>
        </div>

        {/* ── RIGHT PANEL: Payment Action ──────────────────────────── */}
        <div style={{
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: selectedToken ? 'flex-start' : 'center',
          alignItems: selectedToken ? 'stretch' : 'center',
        }}>
          {selectedToken ? (
            <PaymentActionPanel
              token={selectedToken}
              detail={tokenDetail}
              detailLoading={detailLoading}
              onSettled={handleSettled}
              onItemAdded={() => {
                if (selectedToken) void fetchTokenDetail(selectedToken.id);
                void fetchTokens();
              }}
            />
          ) : (
            /* Empty state */
            <div style={{ textAlign: 'center', maxWidth: 320, padding: '0 24px' }}>
              <div style={{ fontSize: 56, marginBottom: 16, lineHeight: 1 }}>👈</div>
              <h3 style={{ fontSize: 17, fontWeight: 600, color: '#aab7b2', marginBottom: 8 }}>
                Select a Token
              </h3>
              <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6 }}>
                Choose an unpaid token from the left queue to collect payment or add dishes.
                Or click &quot;+ Open Table Bill&quot; to start a new dining session.
              </p>
              <div style={{
                marginTop: 24,
                padding: '16px',
                background: '#151c19',
                borderRadius: 12,
                border: '1.5px solid rgba(255,255,255,0.06)',
                fontSize: 12,
                color: '#6b7280',
                lineHeight: 1.8,
                textAlign: 'left',
              }}>
                <p>💵 <strong style={{ color: '#aab7b2' }}>Cash</strong> — Manual cash collection</p>
                <p>📱 <strong style={{ color: '#aab7b2' }}>UPI</strong> — QR / GPay / PhonePe</p>
                <p>💳 <strong style={{ color: '#aab7b2' }}>Card</strong> — Swipe / Tap to pay</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Open Table Modal ────────────────────────────────────────── */}
      {showNewTokenModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16,
        }}>
          <div style={{
            background: '#151c19',
            border: '1.5px solid rgba(255,255,255,0.1)',
            borderRadius: 14,
            padding: 24,
            width: '100%',
            maxWidth: 380,
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>
                Open New Table Bill
              </h2>
              <button
                type="button"
                onClick={() => { setShowNewTokenModal(false); setCreateError(null); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  fontSize: 18,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => void handleCreateToken(e)}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#aab7b2', marginBottom: 6, fontWeight: 600 }}>
                  Table Number
                </label>
                <input
                  type="number"
                  min="1"
                  max="999"
                  required
                  autoFocus
                  placeholder="e.g. 5"
                  value={newTableNum}
                  onChange={(e) => setNewTableNum(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: '#1d2723',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 700,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {createError && (
                <div style={{
                  padding: '8px 12px',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 6,
                  color: '#f87171',
                  fontSize: 12,
                  marginBottom: 16,
                }}>
                  {createError}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => { setShowNewTokenModal(false); setCreateError(null); }}
                  style={{
                    padding: '9px 16px',
                    background: 'rgba(255,255,255,0.06)',
                    border: 'none',
                    borderRadius: 8,
                    color: '#aab7b2',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creatingToken || !newTableNum}
                  style={{
                    padding: '9px 18px',
                    background: '#e8783c',
                    border: 'none',
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: creatingToken ? 'not-allowed' : 'pointer',
                  }}
                >
                  {creatingToken ? 'Opening…' : 'Open Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
