import { useEffect, useState, useRef, useCallback } from 'react';
import { CreditCard, Loader2, AlertCircle, RefreshCw, ArrowLeft, ShieldCheck } from 'lucide-react';
import { getSubscription } from '../../pages/app/appStore';

export interface PaymentStepProps {
  orderId: string;
  paymentSessionId: string;
  amount: number;
  amountPaise: number;
  orderSubtype: 'RENEWAL' | 'UPGRADE';
  targetPlan?: string;
  newExpiry?: string;
  checkoutMode?: string;
  onPaymentSuccess: (details: { orderId: string; newExpiry?: string; planId?: string }) => void;
  onPaymentFailure: (errorMessage: string) => void;
  onBack: () => void;
}

declare global {
  interface Window {
    Cashfree?: (config: { mode: 'sandbox' | 'production' }) => any;
  }
}

export function loadCashfreeSDK(mode: 'sandbox' | 'production' = 'sandbox'): Promise<any> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window not available'));
  }

  if (window.Cashfree) {
    return Promise.resolve(window.Cashfree({ mode }));
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.getElementById('cashfree-sdk') as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (window.Cashfree) {
          resolve(window.Cashfree({ mode }));
        } else {
          reject(new Error('Cashfree SDK object missing after load'));
        }
      });
      existingScript.addEventListener('error', () => {
        reject(new Error('Failed to load Cashfree checkout script. Please check your network or ad-blocker.'));
      });
      return;
    }

    const script = document.createElement('script');
    script.id = 'cashfree-sdk';
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => {
      if (window.Cashfree) {
        resolve(window.Cashfree({ mode }));
      } else {
        reject(new Error('Cashfree SDK object not found after script injection.'));
      }
    };
    script.onerror = () => {
      reject(new Error('Failed to load Cashfree checkout script. Please check your internet connection or ad-blocker.'));
    };
    document.body.appendChild(script);
  });
}

export default function PaymentStep({
  orderId,
  paymentSessionId,
  amount: _amount,
  amountPaise,
  orderSubtype,
  targetPlan,
  newExpiry,
  checkoutMode,
  onPaymentSuccess,
  onPaymentFailure: _onPaymentFailure,
  onBack,
}: PaymentStepProps) {
  const [sdkLoading, setSdkLoading] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [checkoutOpened, setCheckoutOpened] = useState(false);

  const completedRef = useRef(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const mode = (checkoutMode || (import.meta.env.VITE_CASHFREE_MODE as string) || 'sandbox') as 'sandbox' | 'production';

  const formatPaise = (paise?: number) => {
    if (typeof paise !== 'number' || isNaN(paise)) return '₹0.00';
    return (paise / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    });
  };

  const handleComplete = useCallback(
    (planId?: string, expiry?: string) => {
      if (completedRef.current) return;
      completedRef.current = true;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      setVerifying(false);
      onPaymentSuccess({
        orderId,
        planId: planId || targetPlan,
        newExpiry: expiry || newExpiry,
      });
    },
    [newExpiry, onPaymentSuccess, orderId, targetPlan]
  );

  // 1. Listen for background real-time SSE plan update
  useEffect(() => {
    const handlePlanUpdated = (e: Event) => {
      const customEvent = e as CustomEvent;
      const detail = customEvent.detail;
      console.log('[PaymentStep] Received menusqr:plan-updated event:', detail);
      // Validate event belongs to this specific order if orderId is provided
      if (detail?.orderId && detail.orderId !== orderId) {
        return;
      }
      handleComplete(detail?.planId, detail?.expiresAt);
    };

    window.addEventListener('menusqr:plan-updated', handlePlanUpdated);
    return () => {
      window.removeEventListener('menusqr:plan-updated', handlePlanUpdated);
    };
  }, [handleComplete, orderId]);

  // 2. Launch Cashfree Modal Checkout
  const launchCashfree = useCallback(async () => {
    if (!paymentSessionId) return;
    setSdkLoading(true);
    setSdkError(null);

    try {
      const cashfree = await loadCashfreeSDK(mode);
      setSdkLoading(false);
      setCheckoutOpened(true);

      // Trigger modal checkout
      cashfree
        .checkout({
          paymentSessionId,
          redirectTarget: '_modal',
        })
        .then((result: any) => {
          console.log('[PaymentStep] Cashfree checkout modal closed or finished:', result);
          if (result?.error) {
            console.warn('[PaymentStep] Cashfree error:', result.error);
          }
          // Poll immediately once modal closes
          checkPaymentStatus();
        })
        .catch((err: any) => {
          console.warn('[PaymentStep] Cashfree checkout exception:', err);
          checkPaymentStatus();
        });

      // Start background verification poller as fallback
      startVerificationPolling();
    } catch (err: unknown) {
      console.error('[PaymentStep] Failed to load or execute Cashfree SDK:', err);
      setSdkLoading(false);
      const msg = err instanceof Error ? err.message : 'Failed to launch payment checkout.';
      setSdkError(msg);
    }
  }, [mode, paymentSessionId]);

  // Check payment status against backend
  const checkPaymentStatus = useCallback(async () => {
    if (completedRef.current) return;
    setVerifying(true);
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
      // Try verify endpoint
      const verifyRes = await fetch(`${apiBaseUrl}/api/purchase/orders/${encodeURIComponent(orderId)}/verify`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCashfreeRedirect: true }),
      });

      if (verifyRes.ok) {
        const verifyData = await verifyRes.json();
        if (verifyData.status === 'PAID' || verifyData.success) {
          handleComplete(verifyData.planId, verifyData.expiresAt);
          return;
        }
      }

      // Also check active subscription state as a fallback
      const sub = await getSubscription();
      if (sub && sub.status === 'ACTIVE') {
        if (orderSubtype === 'UPGRADE') {
          if (targetPlan && sub.planId.toUpperCase() === targetPlan.toUpperCase()) {
            handleComplete(sub.planId, sub.expiresAt);
            return;
          }
        } else if (orderSubtype === 'RENEWAL') {
          // Robust renewal check: only complete if backend has actually extended expiration
          if (newExpiry && sub.expiresAt) {
            const currentSubExpiry = new Date(sub.expiresAt).getTime();
            const expectedMinExpiry = new Date(newExpiry).getTime() - 60000; // 60s skew buffer
            if (currentSubExpiry >= expectedMinExpiry) {
              handleComplete(sub.planId, sub.expiresAt);
              return;
            }
          }
        }
      }
    } catch (e) {
      console.warn('[PaymentStep] Status check tick failed:', e);
    } finally {
      setVerifying(false);
    }
  }, [handleComplete, newExpiry, orderId, orderSubtype, targetPlan]);

  const startVerificationPolling = useCallback(() => {
    if (pollIntervalRef.current) return;
    let attempts = 0;
    pollIntervalRef.current = setInterval(async () => {
      attempts++;
      if (completedRef.current || attempts > 15) {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        return;
      }
      await checkPaymentStatus();
    }, 2500);
  }, [checkPaymentStatus]);

  // Auto-launch checkout when mounting
  useEffect(() => {
    if (paymentSessionId && !checkoutOpened) {
      launchCashfree();
    }
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [paymentSessionId, checkoutOpened, launchCashfree]);

  return (
    <div className="space-y-6">
      {/* Order Summary Header */}
      <div className="p-4 rounded-xl bg-[#151c19] border border-[#2a3832] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-semibold text-[#849a90]">
            {orderSubtype === 'UPGRADE' ? 'Plan Upgrade Order' : 'Plan Renewal Order'}
          </span>
          <span className="text-xs font-mono text-[#62756d]">{orderId}</span>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div>
            <h3 className="text-xl font-bold text-white">
              {targetPlan ? `${targetPlan.toUpperCase()} Plan` : 'Subscription Renewal'}
            </h3>
            <p className="text-xs text-[#849a90] mt-0.5">Includes 18% GST • 365 Days Validity</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-[#849a90] block">Total Payable</span>
            <span className="text-2xl font-black text-emerald-400">{formatPaise(amountPaise)}</span>
          </div>
        </div>
      </div>

      {/* Gateway Status / Modal Trigger Box */}
      <div className="p-6 rounded-xl bg-[#151c19]/50 border border-white/5 text-center space-y-4">
        {sdkLoading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3">
            <Loader2 size={36} className="animate-spin text-[#e8783c]" />
            <h4 className="text-sm font-bold text-white">Connecting Secure Payment Gateway...</h4>
            <p className="text-xs text-[#849a90] max-w-xs">
              Initializing Cashfree Payments SDK. Your payment session is 100% encrypted.
            </p>
          </div>
        ) : sdkError ? (
          <div className="py-4 space-y-3">
            <div className="inline-flex p-3 rounded-full bg-rose-500/10 text-rose-400">
              <AlertCircle size={28} />
            </div>
            <h4 className="text-sm font-bold text-white">Gateway Connection Error</h4>
            <p className="text-xs text-rose-300 max-w-sm mx-auto">{sdkError}</p>
            <button
              onClick={launchCashfree}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#e8783c] hover:bg-[#d66a30] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw size={14} /> Retry Payment
            </button>
          </div>
        ) : (
          <div className="py-6 space-y-4">
            <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Complete Payment in Checkout Modal</h4>
              <p className="text-xs text-[#849a90] max-w-sm mx-auto mt-1">
                UPI, Google Pay, PhonePe, Cards, and Netbanking are supported. If the modal was closed, click below to reopen.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={launchCashfree}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#e8783c] hover:bg-[#d66a30] text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-[#e8783c]/20 cursor-pointer"
              >
                <CreditCard size={16} /> Reopen Checkout
              </button>

              <button
                onClick={checkPaymentStatus}
                disabled={verifying}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xl border border-white/10 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={14} className={verifying ? 'animate-spin text-[#e8783c]' : ''} />
                <span>I Have Paid (Verify Now)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Security Note */}
      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-[#849a90] flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>PCI-DSS Level 1 Compliant 256-bit Encryption</span>
        </span>
        <button
          onClick={onBack}
          className="text-[#e8783c] hover:underline font-semibold cursor-pointer inline-flex items-center gap-1"
        >
          <ArrowLeft size={12} /> Back
        </button>
      </div>
    </div>
  );
}
