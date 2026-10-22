import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubscription, type AppSubscriptionData } from './appStore';
import { ShieldCheck, Calendar, CreditCard, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function Subscription() {
  const navigate = useNavigate();
  const [data, setData] = useState<AppSubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = () => {
    setLoading(true);
    getSubscription()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleRenew = () => {
    navigate(`/purchase/details?plan=${planId.toLowerCase()}`);
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e8783c]"></div>
    </div>
  );

  const planId = data?.planId?.toUpperCase() || 'BASIC';
  const isActive = data?.status === 'ACTIVE';
  const isExpired = data?.expiresAt ? new Date(data.expiresAt) < new Date() : false;
  
  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A';
  const daysLeft = data?.expiresAt ? Math.ceil((new Date(data.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Subscription Management</h1>
          <p className="text-[#849a90] mt-1">View your current plan details and billing history.</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1d2723] to-[#25322d] border border-[#2a3832] p-6 md:p-8">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 text-white/5 pointer-events-none">
          <ShieldCheck size={250} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2.5 rounded-xl ${isActive && !isExpired ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {isActive && !isExpired ? <CheckCircle2 size={28} /> : <AlertTriangle size={28} />}
              </div>
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#849a90]">Current Plan</h2>
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-bold text-white">{planId}</p>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${isActive && !isExpired ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {isExpired ? 'EXPIRED' : (data?.status || 'UNKNOWN')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mt-8 p-5 bg-[#151c19]/50 rounded-xl border border-white/5">
              <div>
                <p className="text-xs text-[#62756d] uppercase tracking-wider font-semibold mb-1.5 flex items-center gap-1.5">
                  <Calendar size={14} /> Activation Date
                </p>
                <p className="text-white font-medium text-lg">{formatDate(data?.startedAt)}</p>
              </div>
              <div>
                <p className="text-xs text-[#62756d] uppercase tracking-wider font-semibold mb-1.5 flex items-center gap-1.5">
                  <Clock size={14} /> Expiration Date
                </p>
                <p className={`font-medium text-lg ${isExpired ? 'text-rose-400' : 'text-white'}`}>
                  {formatDate(data?.expiresAt)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col justify-center gap-4 min-w-[220px]">
            <div className="bg-[#151c19]/50 rounded-xl p-5 border border-white/5 text-center">
              <p className="text-xs text-[#849a90] uppercase tracking-wider font-semibold mb-1">Days Remaining</p>
              <div className={`text-5xl font-black ${daysLeft <= 7 ? 'text-rose-400' : 'text-white'}`}>
                {daysLeft > 0 ? daysLeft : 0}
              </div>
            </div>
            
            <button 
              onClick={handleRenew}
              className="w-full flex items-center justify-center gap-2 bg-[#e8783c] hover:bg-[#d66a30] text-white px-5 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-[#e8783c]/20 hover:shadow-[#e8783c]/40 cursor-pointer"
            >
              <CreditCard size={18} /> Renew or Upgrade Plan
            </button>
            <p className="text-[11px] text-center text-[#62756d] leading-tight">
              Renewing keeps your permanent QR code and digital menu data intact.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
