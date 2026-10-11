import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SiteHeader from '../../components/marketing/SiteHeader';

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
      <div className="min-h-screen bg-[#FAFAF7] grid place-items-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-[#E8783C]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-[#151C19]/60 font-medium">Loading order details...</span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center p-6 text-center">
        <p className="text-rose-600 mb-4 font-medium">{error}</p>
        <Link to="/plans" className="text-[#E8783C] underline font-medium">Return to pricing</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <SiteHeader />
      <div className="pt-32 pb-24 px-6 md:px-12 max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-[#151C19] mb-2">Review Order</h1>
        <p className="text-[#151C19]/60 mb-8">Please confirm your details before proceeding to payment.</p>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-bold text-[#151C19] mb-4 border-b border-gray-100 pb-4">Subscription Details</h2>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#151C19]/70 font-medium">Plan</span>
            <span className="font-bold text-[#E8783C] uppercase tracking-wide">{order.plan_id}</span>
          </div>
          {(order.selected_addons?.includes('google_reviews') || order.selectedAddons?.includes('google_reviews') || Number(order.addon_amount || order.addonAmount || 0) > 0) && (
            <div className="flex justify-between items-center mb-3 text-xs bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
              <span className="text-amber-900 font-semibold flex items-center gap-1.5">
                ★ Google Reviews Add-on (1 year)
              </span>
              <span className="font-bold text-amber-900">
                +₹{order.addon_amount || order.addonAmount || 499}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center mb-6 pt-2 border-t border-gray-100">
            <span className="text-[#151C19]/70 font-medium">Total Amount</span>
            <span className="font-black text-2xl text-[#151C19]">{order.currency === 'INR' ? '₹' : order.currency} {order.amount}</span>
          </div>
          
          <h2 className="text-lg font-bold text-[#151C19] mb-4 border-b border-gray-100 pb-4 mt-8">Account Information</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-[#151C19]/60">Owner Name</span>
              <span className="font-medium text-[#151C19] text-right">{order.customer_name}</span>
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

        <div className="flex flex-col-reverse md:flex-row gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-[#151C19] py-4 rounded-xl font-bold transition-colors"
          >
            Edit Details
          </button>
          <button
            onClick={async () => {
              const paymentSessionId = sessionStorage.getItem('paymentSessionId');
              if (paymentSessionId) {
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
              } else {
                alert('Payment gateway is not configured. Please contact support.');
              }
            }}
            className="flex-1 text-center bg-[#E8783C] hover:bg-[#d66a30] text-white py-4 rounded-xl font-bold transition-colors shadow-lg shadow-[#E8783C]/20"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
}
