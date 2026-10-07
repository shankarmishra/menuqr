import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import SiteHeader from '../../components/marketing/SiteHeader';
import { CheckCircle2, ShieldCheck, Zap, Mail, ArrowRight, XCircle, AlertTriangle } from 'lucide-react';

export default function PurchaseSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const navigate = useNavigate();
  
  const [verifying, setVerifying] = useState(!!orderId);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState<boolean | null>(null);

  useEffect(() => {
    if (orderId) {
      const verifyOrder = async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/purchase/orders/${orderId}/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isCashfreeRedirect: true }) // Using Cashfree logic in backend
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to verify payment');
          setEmailSent(data.emailSent === true);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setVerifying(false);
        }
      };
      verifyOrder();
    } else {
      setVerifying(false);
      setError('No order ID found in the URL. Please return to the plans page.');
    }
  }, [orderId]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col">
        <SiteHeader />
        <div className="flex-1 grid place-items-center">
          <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
            <div className="relative">
              <div className="absolute inset-0 border-4 border-[#E8783C]/20 rounded-full animate-ping"></div>
              <svg className="animate-spin h-16 w-16 text-[#E8783C] relative z-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-[#151C19] mb-1">Verifying Payment</h2>
              <p className="text-[#151C19]/60 font-medium">Please do not close this window or refresh...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col">
      <SiteHeader />
      <div className="flex-1 pt-32 pb-24 px-6 md:px-12 max-w-3xl mx-auto w-full text-center flex flex-col justify-center">
        {error ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-rose-100 text-rose-500 rounded-full mb-8 shadow-sm">
              <XCircle size={48} strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black text-[#151C19] mb-4 tracking-tight">Payment Failed</h1>
            <p className="text-lg text-[#151C19]/70 mb-10 max-w-lg mx-auto">
              We couldn't process your payment successfully. Your account has not been charged, or the payment could not be verified.
            </p>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-rose-100 mb-10 text-left max-w-xl mx-auto">
              <div className="flex items-start gap-4">
                <AlertTriangle className="text-rose-500 mt-1 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-bold text-[#151C19] text-lg mb-2">Error Details</h3>
                  <p className="text-rose-600/80 font-medium">{error}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => navigate('/plans')}
                className="w-full sm:w-auto bg-[#151C19] hover:bg-black text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg"
              >
                Try Again
              </button>
              <a href="mailto:support@menusqr.com" className="w-full sm:w-auto bg-white border border-gray-200 hover:bg-gray-50 text-[#151C19] px-8 py-4 rounded-xl font-bold transition-all shadow-sm">
                Contact Support
              </a>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full mb-8 shadow-sm">
              <CheckCircle2 size={48} strokeWidth={2.5} />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-[#151C19] mb-4 tracking-tight">You're all set! 🎉</h1>
            <p className="text-lg text-[#151C19]/70 mb-12 max-w-lg mx-auto">
              Your payment has been successfully processed and your MenusQR account is ready.
            </p>

            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-lg shadow-gray-100 border border-gray-100 mb-12 text-left">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-8 text-center md:text-left">Provisioning Status</h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                    <CheckCircle2 size={24} className="text-emerald-500" strokeWidth={2.5} />
                  </div>
                  <h3 className="font-bold text-[#151C19] mb-2">Payment Confirmed</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">We've securely received your payment for the subscription.</p>
                </div>

                <div className="flex flex-col items-center md:items-start text-center md:text-left relative md:after:content-[''] md:after:absolute md:after:w-px md:after:h-full md:after:bg-gray-100 md:after:-left-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                    <ShieldCheck size={24} className="text-emerald-500" strokeWidth={2.5} />
                  </div>
                  <h3 className="font-bold text-[#151C19] mb-2">Account Created</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">Your restaurant tenant and credentials have been provisioned.</p>
                </div>

                <div className="flex flex-col items-center md:items-start text-center md:text-left relative md:after:content-[''] md:after:absolute md:after:w-px md:after:h-full md:after:bg-gray-100 md:after:-left-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                    <Zap size={24} className="text-emerald-500" strokeWidth={2.5} />
                  </div>
                  <h3 className="font-bold text-[#151C19] mb-2">Plan Activated</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">Your plan is active. You have full access to all premium features.</p>
                </div>
              </div>
            </div>

            <div className="bg-[#151C19] p-8 md:p-10 rounded-3xl shadow-xl text-left text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Mail size={160} />
              </div>
              <div className="relative z-10 max-w-md text-center md:text-left">
                <h2 className="text-2xl font-bold mb-3 flex items-center justify-center md:justify-start gap-3">
                  <Mail className="text-[#E8783C]" />
                  {emailSent ? 'Check your inbox' : 'Account ready'}
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  {emailSent
                    ? 'Your account details and payment receipt have been sent. Use your restaurant email and password to sign in; we will email a one-time verification code.'
                    : 'Your payment and workspace are ready, but we could not deliver the account email. Contact support and include your order reference.'}
                </p>
                {!emailSent && orderId && (
                  <>
                    <p className="mt-3 text-sm text-gray-400">Order reference: {orderId}</p>
                    <a
                      href={`mailto:support@menusqr.com?subject=Account%20email%20not%20received&body=Order%20reference%3A%20${encodeURIComponent(orderId)}`}
                      className="mt-3 inline-flex text-sm font-semibold text-[#ffc08d] underline underline-offset-4"
                    >
                      Contact support
                    </a>
                  </>
                )}
              </div>
              <Link
                to="/login"
                className="relative z-10 w-full md:w-auto flex items-center justify-center bg-[#E8783C] hover:bg-[#d66a30] text-white px-8 py-5 rounded-2xl font-bold transition-all hover:scale-105 gap-2 shadow-lg shadow-[#E8783C]/20"
              >
                RESTAURANT LOGIN <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
