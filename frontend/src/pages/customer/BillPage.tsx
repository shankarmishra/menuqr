/**
 * BillPage.tsx
 * Customer-Facing Live Thermal Bill Page — Zero Authentication Required
 * Route: /bill/:tokenId
 *
 * Real-Time Dual-SSE Architecture:
 *  - Strict client-side UUID format validation with graceful 404 screen
 *  - REST hydration via GET /api/public/tokens/:tokenId
 *  - Scoped customer SSE stream connection to /api/public/tokens/:tokenId/stream
 *  - Handles 'token_status', 'token_settled', and 'token_items_updated' events
 *  - Silent reconnect re-hydration to heal transient network drops
 *  - Triggers celebratory confetti upon cashier settlement
 *  - Triggers interactive GoogleReviewSlide 1.5s post-settlement
 *  - Action button: Print / Save Receipt (window.print())
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import ThermalBillCard, { triggerCelebrationConfetti } from '../../components/bill/ThermalBillCard';
import GoogleReviewSlide from '../../components/bill/GoogleReviewSlide';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface PublicTokenItem {
  id?: string;
  name: string;
  dishName?: string;
  variant?: string | null;
  quantity: number;
  unitPrice: number;       // rupees
  unitPricePaise?: number; // paise
  totalPrice: number;      // rupees
  totalPricePaise?: number;// paise
  isVeg: boolean;
  notes?: string | null;
}

export interface PublicTokenData {
  tokenId: string;
  tokenNumber: number;
  tokenCode: string;
  tableNumber: number;
  tableName?: string | null;
  covers?: number;
  restaurantName: string;
  restaurantCity?: string | null;
  restaurantPhone?: string | null;
  restaurantAddress?: string | null;
  restaurantTagline?: string | null;
  restaurantGstin?: string | null;
  restaurantFssai?: string | null;
  /** Registered business name, printed when it differs from the restaurant name. */
  restaurantLegalName?: string | null;
  restaurantGstMode?: string | null;
  /** GST rule this bill was created under. */
  taxMode?: string | null;
  taxRateBps?: number | null;
  cashierName?: string | null;
  items: PublicTokenItem[];
  subtotal: number;
  gst: number;
  cgst?: number;
  sgst?: number;
  discount: number;
  roundOff?: number;
  total: number;
  status: 'ISSUED' | 'ORDERING' | 'DINING' | 'BILL_REQUESTED' | 'UNPAID' | 'SETTLED' | 'PAID' | 'CLOSED' | 'VOID';
  paymentMethod?: string | null;
  paidAt?: string | null;
  settledAt?: string | null;
  googleReviewUrl?: string | null;
  createdAt: string;
}

export default function BillPage() {
  const { tokenId } = useParams<{ tokenId: string }>();
  const [token, setToken] = useState<PublicTokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [paidAt, setPaidAt] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);

  const sseRef = useRef<EventSource | null>(null);
  const reviewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Settlement transition handler
  const handleSettledTransition = useCallback(
    (settledTimestamp?: string | null, method?: string | null, reviewUrl?: string | null) => {
      setIsPaid(true);
      if (settledTimestamp) setPaidAt(settledTimestamp);
      if (method) setPaymentMethod(method);
      if (reviewUrl) {
        setToken((prev) => (prev ? { ...prev, googleReviewUrl: reviewUrl } : prev));
      }

      // Trigger celebration confetti
      void triggerCelebrationConfetti();

      // Trigger Google Review slide-up after exactly 1.5 seconds
      if (reviewTimerRef.current) clearTimeout(reviewTimerRef.current);
      reviewTimerRef.current = setTimeout(() => setShowReview(true), 1500);
    },
    []
  );

  // ── 1. Hydration API ────────────────────────────────────────────────────────
  const hydrateToken = useCallback(async () => {
    if (!tokenId || !UUID_REGEX.test(tokenId)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/public/tokens/${encodeURIComponent(tokenId)}`);
      if (res.status === 404 || res.status === 400) {
        setNotFound(true);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const rawToken = json.token || json;
      const restaurant = json.restaurant || {};

      const normalized: PublicTokenData = {
        tokenId: rawToken.id || rawToken.tokenId || tokenId,
        tokenNumber: Number(rawToken.tokenNumber || 0),
        tokenCode:
          rawToken.tokenCode || `#${String(rawToken.tokenNumber || 0).padStart(3, '0')}`,
        tableNumber: Number(rawToken.tableNumber || 0),
        tableName: rawToken.tableName || null,
        covers: rawToken.covers ? Number(rawToken.covers) : undefined,
        restaurantName:
          restaurant.businessName ||
          restaurant.name ||
          rawToken.restaurantName ||
          json.restaurantName ||
          'Restaurant',
        restaurantCity: restaurant.city || rawToken.restaurantCity || null,
        restaurantPhone: restaurant.phone || rawToken.restaurantPhone || null,
        restaurantAddress: restaurant.address || rawToken.restaurantAddress || null,
        restaurantTagline: restaurant.tagline || rawToken.restaurantTagline || null,
        restaurantGstin: restaurant.gstin || rawToken.restaurantGstin || null,
        restaurantFssai: restaurant.fssai || rawToken.restaurantFssai || null,
        restaurantLegalName: restaurant.legalName || rawToken.restaurantLegalName || null,
        restaurantGstMode: restaurant.gstMode || rawToken.restaurantGstMode || null,
        taxMode: rawToken.taxMode || null,
        taxRateBps: rawToken.taxRateBps !== undefined ? Number(rawToken.taxRateBps) : null,
        cashierName: rawToken.cashierName || null,
        items: (rawToken.items || json.items || []).map((it: any) => ({
          id: it.id,
          name: it.dishName || it.itemName || it.name || 'Dish',
          dishName: it.dishName || it.name,
          variant: it.variant || null,
          quantity: Number(it.quantity || 1),
          unitPrice: Number(
            it.price ?? (it.unitPricePaise !== undefined ? it.unitPricePaise / 100 : 0)
          ),
          totalPrice: Number(
            it.total ?? (it.totalPricePaise !== undefined ? it.totalPricePaise / 100 : 0)
          ),
          isVeg: it.isVeg !== false,
          notes: it.notes || null,
        })),
        subtotal: rawToken.subtotalPaise !== undefined ? Number(rawToken.subtotalPaise) / 100 : Number(rawToken.subtotal ?? 0),
        gst: rawToken.taxPaise !== undefined ? Number(rawToken.taxPaise) / 100 : Number(rawToken.tax ?? rawToken.gst ?? 0),
        cgst:
          rawToken.cgst !== undefined
            ? Number(rawToken.cgst)
            : rawToken.cgstPaise !== undefined
            ? Number(rawToken.cgstPaise / 100)
            : undefined,
        sgst:
          rawToken.sgst !== undefined
            ? Number(rawToken.sgst)
            : rawToken.sgstPaise !== undefined
            ? Number(rawToken.sgstPaise / 100)
            : undefined,
        discount: rawToken.discountPaise !== undefined ? Number(rawToken.discountPaise) / 100 : Number(rawToken.discount ?? 0),
        total: rawToken.totalPaise !== undefined ? Number(rawToken.totalPaise) / 100 : Number(rawToken.total ?? 0),
        status: (rawToken.status || 'UNPAID').toUpperCase() as PublicTokenData['status'],
        paymentMethod: rawToken.paymentMethod || null,
        paidAt: rawToken.paidAt || rawToken.settledAt || null,
        settledAt: rawToken.settledAt || null,
        googleReviewUrl:
          restaurant.googleReviewUrl ||
          json.googleReviewUrl ||
          rawToken.googleReviewUrl ||
          null,
        createdAt: rawToken.createdAt || new Date().toISOString(),
      };

      setToken(normalized);

      if (['SETTLED', 'PAID'].includes(normalized.status)) {
        setIsPaid(true);
        setPaidAt(normalized.paidAt ?? null);
        setPaymentMethod(normalized.paymentMethod ?? null);
        if (reviewTimerRef.current) clearTimeout(reviewTimerRef.current);
        reviewTimerRef.current = setTimeout(() => setShowReview(true), 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load bill');
    } finally {
      setLoading(false);
    }
  }, [tokenId]);

  useEffect(() => {
    void hydrateToken();
    return () => {
      if (reviewTimerRef.current) clearTimeout(reviewTimerRef.current);
    };
  }, [hydrateToken]);

  // ── 2. Live Scoped Customer SSE Stream ──────────────────────────────────────
  useEffect(() => {
    if (!tokenId || notFound || !UUID_REGEX.test(tokenId)) return;

    const sse = new EventSource(`/api/public/tokens/${encodeURIComponent(tokenId)}/stream`);
    sseRef.current = sse;

    // Status updated (e.g. BILL_REQUESTED, SETTLED)
    sse.addEventListener('token_status', (e) => {
      try {
        const data = JSON.parse(e.data);
        const status = (data.status || data.token?.status || '').toUpperCase();
        if (['SETTLED', 'PAID'].includes(status)) {
          handleSettledTransition(
            data.token?.settledAt || data.settledAt,
            data.token?.paymentMethod || data.paymentMethod,
            data.token?.googleReviewUrl || data.googleReviewUrl
          );
        }
        if (data.token) {
          const t = data.token;
          setToken((prev) =>
            prev
              ? {
                  ...prev,
                  status,
                  subtotal: t.subtotal ?? (t.subtotalPaise ? t.subtotalPaise / 100 : prev.subtotal),
                  gst: t.tax ?? (t.taxPaise ? t.taxPaise / 100 : prev.gst),
                  total: t.total ?? (t.totalPaise ? t.totalPaise / 100 : prev.total),
                }
              : prev
          );
        } else {
          setToken((prev) => (prev ? { ...prev, status } : prev));
        }
      } catch {}
    });

    // Explicit settlement event
    sse.addEventListener('token_settled', (e) => {
      try {
        const data = JSON.parse(e.data);
        handleSettledTransition(data.settledAt, data.paymentMethod, data.googleReviewUrl);
      } catch {}
    });

    // Incremental line items appended by waiter / kitchen
    sse.addEventListener('token_items_updated', (e) => {
      try {
        const data = JSON.parse(e.data);
        setToken((prev) => {
          if (!prev) return prev;
          const updatedItems: PublicTokenItem[] = (data.items || []).map((it: any) => ({
            id: it.id,
            name: it.dishName || it.itemName || it.name || 'Dish',
            dishName: it.dishName || it.name,
            variant: it.variant || null,
            quantity: Number(it.quantity || 1),
            unitPrice: Number(
              it.price ?? (it.unitPricePaise !== undefined ? it.unitPricePaise / 100 : 0)
            ),
            totalPrice: Number(
              it.total ?? (it.totalPricePaise !== undefined ? it.totalPricePaise / 100 : 0)
            ),
            isVeg: it.isVeg !== false,
            notes: it.notes || null,
          }));

          return {
            ...prev,
            items: updatedItems,
            subtotal: Number(
              data.subtotal ??
                (data.subtotalPaise !== undefined ? data.subtotalPaise / 100 : prev.subtotal)
            ),
            gst: Number(
              data.tax ??
                (data.taxPaise !== undefined ? data.taxPaise / 100 : prev.gst)
            ),
            total: Number(
              data.total ??
                (data.totalPaise !== undefined ? data.totalPaise / 100 : prev.total)
            ),
          };
        });
      } catch {}
    });

    // Reconnection handling: heal state by re-fetching
    sse.addEventListener('error', () => {
      void hydrateToken();
    });

    return () => {
      sse.close();
      sseRef.current = null;
      if (reviewTimerRef.current) clearTimeout(reviewTimerRef.current);
    };
  }, [tokenId, notFound, handleSettledTransition, hydrateToken]);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#151c19] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/20 border-t-[#e8783c] mx-auto mb-3" />
          <p className="text-[#aab7b2] text-xs font-mono tracking-wider uppercase">
            Loading live receipt…
          </p>
        </div>
      </div>
    );
  }

  // Graceful 404 Screen for invalid or non-existent token IDs
  if (notFound || !token) {
    return (
      <div className="min-h-screen bg-[#151c19] flex items-center justify-center p-4">
        <div className="max-w-xs text-center rounded-2xl border border-white/10 bg-[#1d2723] p-7 shadow-2xl">
          <div className="text-4xl mb-3">🧾</div>
          <h2 className="text-base font-bold text-white mb-2">Bill Not Found or Expired</h2>
          <p className="text-xs text-[#aab7b2] leading-relaxed mb-5">
            {error || 'This digital bill session may have already closed or the link is invalid. Please check with your server.'}
          </p>
          <Link
            to="/"
            className="inline-block w-full rounded-xl bg-[#e8783c] py-2.5 text-xs font-bold text-white transition hover:bg-[#d6672b]"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121715] flex flex-col items-center justify-start py-8 px-4 print:bg-white print:p-0">
      <ThermalBillCard
        token={token}
        isPaid={isPaid}
        paidAt={paidAt}
        paymentMethod={paymentMethod}
      />

      {/* Screen-Only Action Buttons */}
      <div className="mt-5 flex flex-col items-center gap-2 print:hidden no-print">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white border border-white/10 transition active:scale-95 cursor-pointer shadow-sm"
        >
          <span>🖨️ Print / Save Receipt</span>
        </button>
        <p className="text-[11px] text-[#53615a]">
          Powered by <span className="font-semibold text-[#8b9c95]">MenuSQR</span> · Live Table Sync
        </p>
      </div>

      {/* Post-Settlement Google Review Slide */}
      {showReview && (
        <GoogleReviewSlide
          googleReviewUrl={token.googleReviewUrl}
          restaurantName={token.restaurantName}
          restaurantCity={token.restaurantCity}
          onDismiss={() => setShowReview(false)}
        />
      )}
    </div>
  );
}
