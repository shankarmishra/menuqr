
import { Link } from 'react-router-dom';
import SiteHeader from '../../components/marketing/SiteHeader';
import { CheckCircle2, ShieldCheck, Zap, Mail, ArrowRight } from 'lucide-react';

export default function PurchaseSuccessPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <SiteHeader />
      <div className="pt-32 pb-24 px-6 md:px-12 max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full mb-8 shadow-sm">
          <CheckCircle2 size={48} strokeWidth={2.5} />
        </div>
        
        <h1 className="text-4xl font-black text-[#151C19] mb-4 tracking-tight">You're all set!</h1>
        <p className="text-lg text-[#151C19]/70 mb-10 max-w-lg mx-auto">
          Your payment has been successfully processed and your MenusQR account is ready.
        </p>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-10 text-left">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Provisioning Status</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 size={16} className="text-emerald-500" strokeWidth={3} />
              </div>
              <div>
                <h3 className="font-bold text-[#151C19]">PAYMENT CONFIRMED</h3>
                <p className="text-sm text-gray-500 mt-1">We've securely received your payment for the subscription.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck size={16} className="text-emerald-500" strokeWidth={3} />
              </div>
              <div>
                <h3 className="font-bold text-[#151C19]">ACCOUNT CREATED</h3>
                <p className="text-sm text-gray-500 mt-1">Your restaurant tenant and user credentials have been securely provisioned.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Zap size={16} className="text-emerald-500" strokeWidth={3} />
              </div>
              <div>
                <h3 className="font-bold text-[#151C19]">SUBSCRIPTION ACTIVE</h3>
                <p className="text-sm text-gray-500 mt-1">Your plan is active. You have full access to all premium features.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#151C19] p-8 rounded-3xl shadow-xl text-left text-white relative overflow-hidden mb-10">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Mail size={120} />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-3 flex items-center gap-3">
              <Mail className="text-[#E8783C]" />
              Check your inbox
            </h2>
            <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
              We have sent a Welcome Email containing your temporary password. You will need it to log in and begin customizing your menu.
            </p>
            <Link
              to="/admin/login"
              className="inline-flex items-center justify-center w-full sm:w-auto bg-[#E8783C] hover:bg-[#d66a30] text-white px-8 py-4 rounded-xl font-bold transition-all hover:scale-105 gap-2"
            >
              SET UP YOUR MENU <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
