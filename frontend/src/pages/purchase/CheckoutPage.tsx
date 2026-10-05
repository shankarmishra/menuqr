import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SiteHeader from '../../components/marketing/SiteHeader';
import { CreditCard, Lock, ShieldCheck } from 'lucide-react';

export default function CheckoutPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/26');
  const [cvc, setCvc] = useState('123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanCardNumber = cardNumber.replace(/\s+/g, '');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/purchase/orders/${orderId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardNumber: cleanCardNumber }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      sessionStorage.removeItem('pendingOrderId');
      navigate('/purchase/success');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <SiteHeader />
      <div className="pt-32 pb-24 px-6 md:px-12 max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#151C19]/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="text-[#151C19]" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-[#151C19] mb-2">Secure Checkout</h1>
          <p className="text-[#151C19]/60">Complete your payment to activate your subscription.</p>
        </div>

        <form onSubmit={handlePayment} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          {error && <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium border border-rose-100">{error}</div>}
          
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-[#151C19] mb-2">Card Number</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E8783C]/20 focus:border-[#E8783C] transition-all font-mono"
                  placeholder="0000 0000 0000 0000"
                />
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
              <p className="text-xs text-gray-400 mt-2">Use test card 4242 4242 4242 4242 for success.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#151C19] mb-2">Expiry Date</label>
                <input
                  type="text"
                  required
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E8783C]/20 focus:border-[#E8783C] transition-all font-mono"
                  placeholder="MM/YY"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#151C19] mb-2">CVC</label>
                <input
                  type="text"
                  required
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E8783C]/20 focus:border-[#E8783C] transition-all font-mono"
                  placeholder="123"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-center mb-6 text-emerald-600 text-sm font-medium">
            <ShieldCheck size={18} />
            Payments are 100% secure and encrypted
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#151C19] hover:bg-[#151C19]/90 text-white py-4 rounded-xl font-bold transition-colors disabled:opacity-70 flex items-center justify-center"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Payment...
              </span>
            ) : 'Pay & Provision Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
