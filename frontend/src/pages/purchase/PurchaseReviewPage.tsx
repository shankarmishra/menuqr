import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import SiteHeader from '../../components/marketing/SiteHeader';
import { trackBeginCheckout } from '../../analytics/analytics';

export default function PurchaseReviewPage() {
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const orderId = sessionStorage.getItem('pendingOrderId');
    if (!orderId) {
      navigate('/plans');
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/purchase/orders/${orderId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Order not found');
        setOrder(data);
        const value = Number(data.amount);
        if (Number.isFinite(value)) {
          try { sessionStorage.setItem(`ga_value_${orderId}`, String(value)); } catch { /* optional */ }
        }
        trackBeginCheckout({ planId: String(data.plan_id || data.planId || 'plan') }, Number.isFinite(value) ? value : undefined);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E8783C]"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col justify-center items-center px-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-[#151C19] mb-2">Something went wrong</h2>
          <p className="text-[#151C19]/60 mb-6">{error || 'Could not load order details'}</p>
          <Link to="/plans" className="inline-block bg-[#E8783C] text-white px-6 py-3 rounded-xl font-bold">
            Back to Plans
          </Link>
        </div>
      </div>
    );
  }

  const paymentSessionId = sessionStorage.getItem('paymentSessionId');

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col">
      <SiteHeader />
      
      <div className="flex-1 max-w-3xl w-full mx-auto px-6 py-32">
        <h1 className="text-3xl font-extrabold text-[#151C19] mb-2 tracking-tight">Review Your Order</h1>
        <p className="text-[#151C19]/60 mb-8">Please check your details before proceeding to payment.</p>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8 space-y-6">
          <div className="flex justify-between items-center pb-6 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-[#151C19]">{order.planLabel || order.plan_id} Plan</h2>
              <p className="text-sm text-[#151C19]/60">{order.billingCycle === "monthly" ? "Monthly Subscription" : "Annual Subscription"}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-[#151C19]">₹{order.amount}</span>
              {order.original_amount && Number(order.original_amount) > Number(order.amount) && (
                <div className="text-xs text-emerald-600 font-bold">
                  Saved ₹{Number(order.original_amount) - Number(order.amount)} ({order.discount_pct}% off)
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-[#151C19]/60">Contact Person</span>
              <span className="font-medium text-[#151C19]">{order.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#151C19]/60">Phone</span>
              <span className="font-medium text-[#151C19]">{order.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#151C19]/60">Email</span>
              <span className="font-medium text-[#151C19] text-right">{order.customer_email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#151C19]/60">Restaurant Name</span>
              <span className="font-medium text-[#151C19] text-right">{order.business_name}</span>
            </div>
          </div>
        </div>

        {!paymentSessionId && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
            <AlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={20} />
            <div className="text-sm font-medium text-amber-900 leading-relaxed">
              Payment gateway is temporarily unavailable. Please contact our support team at <a href="mailto:support@menusqr.in" className="underline font-bold">support@menusqr.in</a> or try again shortly.
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse md:flex-row gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-[#151C19] py-4 rounded-xl font-bold transition-colors"
          >
            Edit Details
          </button>
          <button
            disabled={!paymentSessionId}
            onClick={async () => {
              if (!paymentSessionId) return;
              const mode = sessionStorage.getItem('cashfreeMode') || import.meta.env.VITE_CASHFREE_MODE || (import.meta.env.DEV ? 'sandbox' : 'sandbox');
              // Initialize Cashfree SDK
              if (!document.getElementById('cashfree-sdk')) {
                const script = document.createElement('script');
                script.id = 'cashfree-sdk';
                script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
                script.onload = () => {
                  const cashfree = (window as any).Cashfree({ mode });
                  cashfree.checkout({ paymentSessionId });
                };
                document.body.appendChild(script);
              } else {
                const cashfree = (window as any).Cashfree({ mode });
                cashfree.checkout({ paymentSessionId });
              }
            }}
            className={`flex-1 text-center py-4 rounded-xl font-bold transition-colors ${
              paymentSessionId
                ? 'bg-[#E8783C] hover:bg-[#d66a30] text-white shadow-lg shadow-[#E8783C]/20 cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
            }`}
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
}
