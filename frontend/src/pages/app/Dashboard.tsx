import { useEffect, useState } from 'react';
import { getDashboard, getSubscription, getProfile, AppSubscriptionData, AppProfile, getQr } from './appStore';
import { ShieldCheck, Calendar, Zap, Lock, Unlock, CreditCard, Clock, QrCode, ArrowRight, UtensilsCrossed, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [sub, setSub] = useState<AppSubscriptionData | null>(null);
  const [qrCodeId, setQrCodeId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProfile().catch(() => null),
      getDashboard().catch(() => null),
      getSubscription().catch(() => null),
      getQr().catch(() => null)
    ])
      .then(([p, d, s, q]) => {
        if (p) setProfile(p);
        if (d?.stats) setStats(d.stats);
        if (s) setSub(s);
        if (q && (q as any).length > 0) setQrCodeId((q as any)[0].qrId);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e8783c]"></div>
    </div>
  );

  const planId = sub?.planId?.toUpperCase() || 'BASIC';
  const isActive = sub?.status === 'ACTIVE';
  
  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A';
  const daysLeft = sub?.expiresAt ? Math.ceil((new Date(sub.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

  const features = [
    { 
      name: 'Digital Menu Access', 
      desc: 'Beautiful digital menu for your customers',
      has: true 
    },
    { 
      name: 'Permanent QR Identity', 
      desc: 'Physical QR stickers that never change',
      has: true 
    },
    { 
      name: 'One-Time Setup Edit', 
      desc: 'Make changes to your initial menu setup',
      has: planId === 'BASIC' ? true : true, 
      note: planId === 'BASIC' ? '1 Edit Included' : 'Unlimited Edits'
    },
    { 
      name: 'Self Menu Management', 
      desc: 'Add, edit, or delete items anytime',
      has: planId === 'INTERMEDIATE' || planId === 'PREMIUM'
    },
    { 
      name: 'Pro Templates & Themes', 
      desc: 'Change the look and feel of your menu instantly',
      has: planId === 'INTERMEDIATE' || planId === 'PREMIUM'
    },
    { 
      name: 'Customer Ordering', 
      desc: 'Allow customers to place orders from their phone',
      has: planId === 'PREMIUM'
    },
    { 
      name: 'Order Management Panel', 
      desc: 'Receive and manage live orders at reception',
      has: planId === 'PREMIUM'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            Welcome back, {profile?.ownerName?.split(' ')[0] || 'Partner'}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e8783c]/10 text-[#e8783c] border border-[#e8783c]/20">
              <Sparkles size={12} /> {planId}
            </span>
          </h1>
          <p className="text-[#849a90] mt-1">{profile?.businessName}</p>
        </div>
        
        {(!isActive || daysLeft < 15) && (
          <Link to="/app/subscription" className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 px-4 py-2 rounded-lg font-semibold transition-colors">
            <CreditCard size={18} /> Renew Plan
          </Link>
        )}
      </div>

      {/* Subscription Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1d2723] to-[#25322d] border border-[#2a3832] p-6 md:p-8">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 text-white/5">
          <ShieldCheck size={200} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Subscription Status</h2>
                <p className="text-sm text-[#849a90]">{isActive ? 'Your account is active and protected.' : 'Your subscription has expired.'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <p className="text-xs text-[#62756d] uppercase tracking-wider font-semibold mb-1">Started On</p>
                <div className="flex items-center gap-2 text-white font-medium">
                  <Calendar size={16} className="text-[#e8783c]" />
                  {formatDate(sub?.startedAt)}
                </div>
              </div>
              <div>
                <p className="text-xs text-[#62756d] uppercase tracking-wider font-semibold mb-1">Valid Until</p>
                <div className="flex items-center gap-2 text-white font-medium">
                  <Clock size={16} className="text-[#e8783c]" />
                  {formatDate(sub?.expiresAt)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-[#151c19]/50 rounded-xl p-5 border border-white/5 flex flex-col justify-center min-w-[200px]">
            <p className="text-xs text-[#849a90] uppercase tracking-wider font-semibold text-center mb-2">Days Remaining</p>
            <div className="text-5xl font-black text-center text-white">
              {daysLeft > 0 ? daysLeft : 0}
            </div>
            {daysLeft <= 7 && daysLeft > 0 && (
              <p className="text-xs text-rose-400 text-center mt-2 font-medium">Expiring Soon!</p>
            )}
            {daysLeft <= 0 && (
              <p className="text-xs text-rose-500 text-center mt-2 font-bold">Expired</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1d2723] rounded-xl p-5 border border-[#2a3832] flex flex-col justify-between hover:border-[#e8783c]/50 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#849a90] font-semibold">Live Menu Items</h3>
              <UtensilsCrossed className="text-[#e8783c]/60" size={20} />
            </div>
            <p className="text-3xl font-bold text-white">{stats?.active_items || 0}</p>
          </div>
          <Link to="/app/menu" className="mt-4 flex items-center text-sm font-semibold text-[#e8783c] hover:text-white transition-colors">
            Manage Menu <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        <div className="bg-[#1d2723] rounded-xl p-5 border border-[#2a3832] flex flex-col justify-between hover:border-[#e8783c]/50 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#849a90] font-semibold">Active QR Stickers</h3>
              <QrCode className="text-[#e8783c]/60" size={20} />
            </div>
            <p className="text-3xl font-bold text-white">{stats?.active_qrs || 0}</p>
            {qrCodeId && <p className="text-xs text-[#62756d] mt-1 font-mono">ID: {qrCodeId.substring(0,8)}</p>}
          </div>
          <Link to="/app/qr" className="mt-4 flex items-center text-sm font-semibold text-[#e8783c] hover:text-white transition-colors">
            Download Assets <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        <div className="bg-[#1d2723] rounded-xl p-5 border border-[#2a3832] flex flex-col justify-between hover:border-[#e8783c]/50 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#849a90] font-semibold">Current Theme</h3>
              <Sparkles className="text-[#e8783c]/60" size={20} />
            </div>
            <p className="text-lg font-bold text-white">Default</p>
          </div>
          <Link to="/app/appearance" className="mt-4 flex items-center text-sm font-semibold text-[#e8783c] hover:text-white transition-colors">
            Change Appearance <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
      </div>

      {/* Plan Capabilities Breakdown */}
      <div className="bg-[#1d2723] rounded-xl border border-[#2a3832] overflow-hidden">
        <div className="p-6 border-b border-[#2a3832]">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="text-[#e8783c]" /> 
            {planId} Plan Capabilities
          </h2>
          <p className="text-sm text-[#849a90] mt-1">Here is exactly what you can do on your current subscription plan.</p>
        </div>
        
        <div className="divide-y divide-[#2a3832]">
          {features.map((feat, i) => (
            <div key={i} className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors ${feat.has ? 'hover:bg-[#25322d]' : 'opacity-60 bg-[#151c19]/50'}`}>
              <div className="flex items-start gap-4">
                <div className={`mt-0.5 ${feat.has ? 'text-emerald-400' : 'text-rose-400/50'}`}>
                  {feat.has ? <CheckCircle2 size={20} /> : <Lock size={20} />}
                </div>
                <div>
                  <h3 className={`font-semibold ${feat.has ? 'text-white' : 'text-[#62756d]'}`}>
                    {feat.name}
                    {feat.note && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#e8783c]/20 text-[#e8783c]">
                        {feat.note}
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-[#849a90] mt-0.5">{feat.desc}</p>
                </div>
              </div>
              
              {!feat.has && (
                <div className="hidden sm:block">
                  <Link to="/app/subscription" className="text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded transition-colors flex items-center gap-1">
                    <Unlock size={12} /> Unlock
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
