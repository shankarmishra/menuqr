import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SiteHeader from '../../components/marketing/SiteHeader';
import { CreditCard, Lock, ShieldCheck, Zap } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-900/50 flex flex-col justify-center items-center p-4 backdrop-blur-sm">
      <SiteHeader />
      
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden mt-16 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#151C19] p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Zap size={100} />
          </div>
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 relative z-10 border border-white/20">
            <Lock className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 relative z-10">Test Payment Gateway</h1>
          <p className="text-white/70 text-sm relative z-10">This is a simulated secure checkout environment.</p>
        </div>

        <div className="p-8">
          <form onSubmit={handlePayment}>
            {error && (
              <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium border border-rose-100 flex items-start gap-2">
                <ShieldCheck size={20} className="flex-shrink-0" />
                {error}
              </div>
            )}
            
            <div className="space-y-5 mb-8">
              <div>
                <label className="block text-sm font-semibold text-[#151C19] mb-2">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#151C19]/10 focus:border-[#151C19] transition-all font-mono text-lg tracking-wider"
                    placeholder="0000 0000 0000 0000"
                  />
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                </div>
                <p className="text-xs text-[#E8783C] font-medium mt-2 ml-1">Use test card 4242 4242 4242 4242 for success.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#151C19] mb-2">Expiry</label>
                  <input
                    type="text"
                    required
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full px-4 py-4 rounded-2xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#151C19]/10 focus:border-[#151C19] transition-all font-mono text-center text-lg"
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
                    className="w-full px-4 py-4 rounded-2xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#151C19]/10 focus:border-[#151C19] transition-all font-mono text-center text-lg tracking-widest"
                    placeholder="123"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#151C19] hover:bg-[#151C19]/90 text-white py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-[#151C19]/20 hover:shadow-[#151C19]/30 disabled:opacity-70 disabled:hover:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Pay Securely'
              )}
            </button>
            
            <div className="flex items-center gap-2 justify-center mt-6 text-gray-400 text-sm font-medium">
              <ShieldCheck size={16} />
              Secured by Mock Gateway
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
