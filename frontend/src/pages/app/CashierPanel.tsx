/**
 * CashierPanel.tsx
 * /app/cashier — PREMIUM plan only (reception_orders capability)
 *
 * Real-time cashier counter for token management & Floor Grid:
 *  - 2 Master Tabs: Active Floor (Table Grid) vs Settled History
 *  - SSE-driven live queue of UNPAID tokens
 *  - Visual Table Matrix with color-coded status (Vacant, Dining, Bill Requested)
 *  - 1-Click CASH / UPI / CARD settlement with auto-vacate & auto-archive
 *  - Settled Register with daily collection totals & hardware Thermal Receipts
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import TokenSearchInput from '../../components/cashier/TokenSearchInput';
import UnpaidTokenQueue, { type CashierToken } from '../../components/cashier/UnpaidTokenQueue';
import PaymentActionPanel from '../../components/cashier/PaymentActionPanel';
import FloorGrid from '../../components/cashier/FloorGrid';
import SettledHistoryView, { type SettledTokenItem } from '../../components/cashier/SettledHistoryView';
import { LayoutGrid, List, Receipt, UtensilsCrossed, Plus } from 'lucide-react';

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

interface DiningTable {
  id: string;
  label: string;
  sortOrder?: number;
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
  const [activeTab, setActiveTab] = useState<'FLOOR' | 'SETTLED'>('FLOOR');
  const [floorViewMode, setFloorViewMode] = useState<'GRID' | 'LIST'>('GRID');

  const [tokens, setTokens] = useState<CashierToken[]>([]);
  const [settledTokens, setSettledTokens] = useState<SettledTokenItem[]>([]);
  const [tables, setTables] = useState<DiningTable[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [settledLoading, setSettledLoading] = useState(false);
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

  // ── 1. Fetch tables & tokens ───────────────────────────────────────────────
  const fetchTables = useCallback(async () => {
    try {
      const res = await fetch('/api/app/tables', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json() as DiningTable[];
        if (Array.isArray(data)) setTables(data);
      }
    } catch {
      // Ignore
    }
  }, []);

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

  const fetchSettledTokens = useCallback(async () => {
    setSettledLoading(true);
    try {
      const res = await fetch('/api/app/tokens?status=SETTLED&date=all', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json() as { tokens?: SettledTokenItem[] } | SettledTokenItem[];
        const list = Array.isArray(data) ? data : (data as { tokens?: SettledTokenItem[] }).tokens ?? [];
        setSettledTokens(list);
      }
    } catch {
      // Ignore
    } finally {
      setSettledLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTables();
    void fetchTokens();
    void fetchSettledTokens();
  }, [fetchTables, fetchTokens, fetchSettledTokens]);

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

    // Token settled (paid) — remove from queue & add to settled history
    sse.addEventListener('token_settled', (e) => {
      try {
        const payload = JSON.parse(e.data) as Record<string, unknown>;
        const tokenId = String(payload.tokenId ?? payload.id ?? '');
        setTokens((prev) => prev.filter((t) => t.id !== tokenId));
        setSelectedToken((prev) => (prev?.id === tokenId ? null : prev));
        void fetchSettledTokens();
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
        setSelectedToken((prev) => {
          if (prev?.id === tokenId) {
            void fetchTokenDetail(tokenId);
          }
          return prev;
        });
      } catch { /* ignore */ }
    });

    // Bill requested by customer
    sse.addEventListener('bill_requested', (e) => {
      try {
        const payload = JSON.parse(e.data) as Record<string, unknown>;
        const tokenId = String(payload.tokenId ?? '');
        setTokens((prev) =>
          prev.map((t) => (t.id === tokenId ? { ...t, status: 'BILL_REQUESTED' as const } : t))
        );
      } catch { /* ignore */ }
    });

    return () => {
      sse.close();
      sseRef.current = null;
    };
  }, [fetchSettledTokens]);

  // ── 3. Fetch token detail when selection changes ────────────────────────────
  const fetchTokenDetail = useCallback(async (tokenId: string) => {
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

  // ── 4. Post-settlement handler (Auto-Archive & Instant Table Vacate) ─────────
  function handleSettled(tokenId: string) {
    setTokens((prev) => prev.filter((t) => t.id !== tokenId));
    setSelectedToken(null);
    setTokenDetail(null);
    void fetchSettledTokens();
  }

  // ── 5. Open Table Bill ──────────────────────────────────────────────────────
  function openTableBillModal(tableNumber?: number) {
    if (tableNumber) setNewTableNum(String(tableNumber));
    setShowNewTokenModal(true);
  }

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

  // ── Filtered tokens ─────────────────────────────────────────────────────────
  const filteredTokens = searchQuery
    ? tokens.filter((t) => String(t.tokenNumber).includes(searchQuery) || String(t.tableNumber).includes(searchQuery))
    : tokens;

  const unpaidCount = tokens.length;

  return (
    <div className="min-h-screen bg-[#0a100d] text-[#fcfaf8] font-sans">
      {/* ── Page Header & Tabs ── */}
      <div className="bg-[#151c19] border-b border-[#2a3832] p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>🏪 Cashier Counter</span>
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live POS
              </span>
            </div>
            <p className="text-xs text-[#849a90] mt-1">
              Table billing, real-time settlement & daily sales register.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* New Table Bill Button */}
            <button
              type="button"
              onClick={() => openTableBillModal()}
              className="inline-flex items-center gap-1.5 bg-[#e8783c] hover:bg-[#d66a30] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#e8783c]/20"
            >
              <Plus size={15} />
              <span>+ Open Table Bill</span>
            </button>

            {/* Live SSE Pulse Dot */}
            <div className="flex items-center gap-2 bg-[#1d2723] border border-[#2a3832] px-3 py-1.5 rounded-xl text-xs text-[#849a90]">
              <span
                className={`w-2 h-2 rounded-full ${
                  sseStatus === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="font-mono text-[11px]">{sseStatus === 'live' ? 'Live SSE' : 'Connecting'}</span>
            </div>
          </div>
        </div>

        {/* Master Navigation Tabs */}
        <div className="flex items-center gap-2 mt-5 border-t border-[#2a3832]/80 pt-4">
          <button
            type="button"
            onClick={() => setActiveTab('FLOOR')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'FLOOR'
                ? 'bg-white text-black shadow-md'
                : 'bg-[#1d2723] text-[#849a90] hover:text-white border border-[#2a3832]'
            }`}
          >
            <UtensilsCrossed size={14} />
            <span>Active Floor & Counter</span>
            {unpaidCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black font-mono text-[10px] font-extrabold">
                {unpaidCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SETTLED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'SETTLED'
                ? 'bg-white text-black shadow-md'
                : 'bg-[#1d2723] text-[#849a90] hover:text-white border border-[#2a3832]'
            }`}
          >
            <Receipt size={14} />
            <span>Settled Register (Today)</span>
            {settledTokens.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#2a3832] text-white font-mono text-[10px]">
                {settledTokens.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {activeTab === 'FLOOR' ? (
          /* Tab 1: Active Floor & Counter */
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Left Column: Floor Grid / List */}
            <div className="flex-1 w-full space-y-4">
              {/* View Switcher & Search Bar */}
              <div className="flex items-center justify-between gap-3 bg-[#151c19] p-3 rounded-2xl border border-[#2a3832]">
                <div className="flex items-center gap-1 p-1 bg-[#1d2723] border border-[#2a3832] rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFloorViewMode('GRID')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      floorViewMode === 'GRID'
                        ? 'bg-emerald-500 text-black shadow-sm'
                        : 'text-[#849a90] hover:text-white'
                    }`}
                  >
                    <LayoutGrid size={13} />
                    <span>Table Floor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFloorViewMode('LIST')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      floorViewMode === 'LIST'
                        ? 'bg-[#e8783c] text-white shadow-sm'
                        : 'text-[#849a90] hover:text-white'
                    }`}
                  >
                    <List size={13} />
                    <span>Tokens Queue ({unpaidCount})</span>
                  </button>
                </div>

                <div className="w-48 sm:w-60">
                  <TokenSearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                  />
                </div>
              </div>

              {/* View Display */}
              {floorViewMode === 'GRID' ? (
                <FloorGrid
                  tokens={tokens}
                  tables={tables}
                  selectedTokenId={selectedToken?.id ?? null}
                  onSelectToken={handleSelectToken}
                  onOpenTableBill={openTableBillModal}
                />
              ) : (
                <UnpaidTokenQueue
                  tokens={filteredTokens}
                  selectedId={selectedToken?.id ?? null}
                  onSelect={handleSelectToken}
                  loading={loading}
                />
              )}
            </div>

            {/* Right Column: Payment Action Panel */}
            <div className="w-full lg:w-96 shrink-0 sticky top-6">
              {selectedToken ? (
                <PaymentActionPanel
                  token={selectedToken}
                  detail={tokenDetail}
                  detailLoading={detailLoading}
                  onSettled={handleSettled}
                  onItemAdded={() => {
                    void fetchTokens();
                    void fetchTokenDetail(selectedToken.id);
                  }}
                />
              ) : (
                <div className="rounded-2xl border border-dashed border-[#2a3832] bg-[#151c19]/50 p-8 text-center flex flex-col items-center justify-center min-h-[360px]">
                  <div className="w-14 h-14 rounded-2xl bg-[#1d2723] border border-[#2a3832] flex items-center justify-center text-[#849a90] mb-3">
                    <UtensilsCrossed size={24} />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">Select a Table</h3>
                  <p className="text-xs text-[#849a90] max-w-xs leading-relaxed">
                    Click any occupied table tile to view its running bill and accept 1-click settlement via Cash, UPI, or Card.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Tab 2: Settled History Register */
          <SettledHistoryView
            settledTokens={settledTokens}
            loading={settledLoading}
            onRefresh={fetchSettledTokens}
          />
        )}
      </div>

      {/* ── Modal: Open New Table Bill ── */}
      {showNewTokenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#151c19] border border-[#2a3832] rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-white">Open New Table Bill</h2>
            <p className="text-xs text-[#849a90]">
              Enter table number to open an active dining session and generate a live token.
            </p>

            <form onSubmit={handleCreateToken} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#849a90] mb-1.5">
                  Table Number
                </label>
                <input
                  type="number"
                  min="1"
                  max="999"
                  autoFocus
                  required
                  placeholder="e.g. 4"
                  value={newTableNum}
                  onChange={(e) => setNewTableNum(e.target.value)}
                  className="w-full bg-[#1d2723] border border-[#2a3832] rounded-xl px-4 py-2.5 text-white text-base font-bold font-mono focus:outline-none focus:border-[#e8783c]"
                />
              </div>

              {createError && (
                <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
                  {createError}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowNewTokenModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#1d2723] hover:bg-[#2a3832] border border-[#2a3832] text-xs font-semibold text-[#849a90] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingToken}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#e8783c] hover:bg-[#d66a30] text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  {creatingToken ? 'Opening...' : 'Open Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
