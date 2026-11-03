/**
 * BillPage.tsx
 * Customer-facing live thermal bill page — NO AUTH required.
 * URL: /bill/:tokenId
 *
 * States:
 *  LOADING  → fetching token from /api/public/tokens/:tokenId
 *  UNPAID   → shows thermal bill + amber flashing badge + SSE listening
 *  PAID     → shows thermal bill + green rubber stamp (SSE push, zero reload)
 *  REVIEW   → after 1.5s on PAID: Google Review nudge slides up
 *  NOT_FOUND → token not found or malformed ID
 */

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import ThermalBillCard from '../../components/bill/ThermalBillCard';
import GoogleReviewSlide from '../../components/bill/GoogleReviewSlide';

export interface PublicTokenData {
  tokenId: string;
  tokenNumber: number;
  tableNumber: number;
  restaurantName: string;
  restaurantCity?: string | null;
  restaurantPhone?: string | null;
  restaurantTagline?: string | null;
  items: Array<{
    name: string;
    variant?: string | null;
    quantity: number;
    unitPrice: number;   // in rupees (float)
    totalPrice: number;  // in rupees (float)
    isVeg: boolean;
  }>;
  subtotal: number;  // rupees
  gst: number;       // rupees
  discount: number;  // rupees
  total: number;     // rupees
  status: 'UNPAID' | 'PAID' | 'VOID';
  paymentMethod?: string | null;
  paidAt?: string | null;
  googleReviewUrl?: string | null;
  createdAt: string;
}

export default function BillPage() {
  const { tokenId } = useParams<{ tokenId: string }>();
  const [token, setToken] = useState<PublicTokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [paidAt, setPaidAt] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);
  const sseRef = useRef<EventSource | null>(null);
  const reviewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── 1. Fetch initial token state ─────────────────────────────────────────
  useEffect(() => {
    if (!tokenId) { setNotFound(true); setLoading(false); return; }

    fetch(`/api/public/tokens/${encodeURIComponent(tokenId)}`)
      .then(async (res) => {
        if (res.status === 404 || res.status === 400) { setNotFound(true); return; }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: PublicTokenData = await res.json();
        setToken(data);
        if (data.status === 'PAID') {
          setIsPaid(true);
          setPaidAt(data.paidAt ?? null);
          setPaymentMethod(data.paymentMethod ?? null);
          // Already paid when page loaded — show review after delay
          reviewTimerRef.current = setTimeout(() => setShowReview(true), 1500);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));

    return () => {
      if (reviewTimerRef.current) clearTimeout(reviewTimerRef.current);
    };
  }, [tokenId]);

  // ── 2. Open SSE stream for live PAID push ────────────────────────────────
  useEffect(() => {
    if (!tokenId || notFound) return;

    const sse = new EventSource(`/api/public/tokens/${encodeURIComponent(tokenId)}/stream`);
    sseRef.current = sse;

    sse.addEventListener('token_status', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.status === 'PAID') {
          setIsPaid(true);
          setPaidAt(data.paidAt ?? null);
          setPaymentMethod(data.paymentMethod ?? null);
          // Trigger confetti burst
          triggerConfetti();
          // Show Google Review after 1.5s
          reviewTimerRef.current = setTimeout(() => setShowReview(true), 1500);
        }
      } catch { /* ignore parse errors */ }
    });

    sse.addEventListener('token_items', (e) => {
      try {
        const data = JSON.parse(e.data);
        setToken((prev) => prev ? { ...prev, items: data.items, subtotal: data.subtotal, gst: data.gst, total: data.total } : prev);
      } catch { /* ignore */ }
    });

    sse.addEventListener('error', () => {
      // Browser auto-reconnects on EventSource error — no action needed
    });

    return () => {
      sse.close();
      sseRef.current = null;
      if (reviewTimerRef.current) clearTimeout(reviewTimerRef.current);
    };
  }, [tokenId, notFound]);

  // ── 3. Confetti effect ───────────────────────────────────────────────────
  function triggerConfetti() {
    const colors = ['#22c55e', '#16a34a', '#bbf7d0', '#fbbf24', '#f59e0b'];
    const count = 80;
    const container = document.body;

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.style.cssText = `
        position: fixed;
        top: -10px;
        left: ${Math.random() * 100}vw;
        width: ${4 + Math.random() * 6}px;
        height: ${8 + Math.random() * 8}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 2px;
        transform: rotate(${Math.random() * 360}deg);
        animation: confettiFall ${1.5 + Math.random() * 2}s ease-in forwards;
        z-index: 9999;
        pointer-events: none;
      `;
      container.appendChild(el);
      setTimeout(() => el.remove(), 4000);
    }
  }

  // ── 4. Render states ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-mono">Loading your bill…</p>
        </div>
      </div>
    );
  }

  if (notFound || !token) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center max-w-xs">
          <div className="text-5xl mb-4">🧾</div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Bill Not Found</h2>
          <p className="text-sm text-gray-500">
            This bill link may be expired or invalid. Please ask the restaurant staff for assistance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Global confetti keyframe */}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>

      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start py-8 px-4">
        <ThermalBillCard
          token={token}
          isPaid={isPaid}
          paidAt={paidAt}
          paymentMethod={paymentMethod}
        />
        <p className="mt-6 text-xs text-gray-400 text-center">
          Powered by <span className="font-semibold">MenuSQR</span> · menusqr.in
        </p>
      </div>

      {showReview && (
        <GoogleReviewSlide
          googleReviewUrl={token.googleReviewUrl}
          restaurantName={token.restaurantName}
          onDismiss={() => setShowReview(false)}
        />
      )}
    </>
  );
}
