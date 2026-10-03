import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, AlertTriangle, Lock, QrCode, CheckCircle2 } from 'lucide-react';
import IPhoneMockup from './IPhoneMockup';

type SubState = 'active' | 'warning' | 'expired' | 'renewed';

interface StateDetail {
  id: SubState;
  title: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  desc: string;
  phoneStatus: string;
  qrStatus: string;
}

const SUB_STATES: StateDetail[] = [
  {
    id: 'active',
    title: 'Active Subscription',
    badge: 'Active • 365 Days',
    badgeBg: 'bg-[#34b56a]/10',
    badgeColor: 'text-[#34b56a]',
    desc: 'Your digital menu is live, instant, and receiving customers.',
    phoneStatus: 'Live Menu Active',
    qrStatus: 'QR Verified (Same Identity)',
  },
  {
    id: 'warning',
    title: '10-Day Expiry Warning',
    badge: 'Expiring Soon • 10 Days Left',
    badgeBg: 'bg-[#ffc928]/10',
    badgeColor: 'text-[#ffc928]',
    desc: 'Dashboard displays a persistent renewal notification. Menu remains live.',
    phoneStatus: 'Live Menu Active',
    qrStatus: 'QR Verified (Same Identity)',
  },
  {
    id: 'expired',
    title: 'Subscription Expired',
    badge: 'Lapsed • Menu Temporarily Locked',
    badgeBg: 'bg-rose-500/10',
    badgeColor: 'text-rose-400',
    desc: 'Menu displays an elegant "Temporarily Unavailable" screen. Physical QR identity is safely protected.',
    phoneStatus: 'Menu Temporarily Blocked',
    qrStatus: 'Physical QR Reserved',
  },
  {
    id: 'renewed',
    title: 'Instant Renewal',
    badge: 'Reactivated • Same QR',
    badgeBg: 'bg-[#34b56a]/10',
    badgeColor: 'text-[#34b56a]',
    desc: 'Upon renewal, your menu is instantly restored. You DO NOT need to reprint a single QR code!',
    phoneStatus: 'Live Menu Restored',
    qrStatus: 'QR Identity 100% Intact',
  },
];

export default function SubscriptionSection() {
  const [selectedState, setSelectedState] = useState<SubState>('active');
  const current = SUB_STATES.find((s) => s.id === selectedState)!;

  return (
    <section className="py-24 md:py-36 px-6 bg-[#1d2723] border-b border-white/5 relative overflow-hidden">
      <div className="max-w-[1240px] mx-auto grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151c19] text-[#34b56a] text-xs font-semibold uppercase tracking-wider border border-[#34b56a]/30">
            <ShieldCheck size={14} />
            <span>QR Preservation & Protection Engine</span>
          </div>

          <h2 className="text-[2.25rem] sm:text-[3rem] font-extrabold text-white leading-tight tracking-tight">
            Subscription & <br />
            <span className="text-[#ffc928]">QR Expiry Protection</span>
          </h2>

          <p className="text-base sm:text-lg text-[#aab7b2] leading-relaxed">
            Your physical QR stickers are permanent assets. Even if your subscription lapses, your QR identity is protected and instantly reactivated upon renewal without reprinting.
          </p>

          <div className="space-y-3 pt-2">
            {SUB_STATES.map((state) => {
              const isSelected = selectedState === state.id;
              return (
                <button
                  key={state.id}
                  onClick={() => setSelectedState(state.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                    isSelected
                      ? 'bg-[#151c19] border-[#e8783c] shadow-xl shadow-[#e8783c]/10'
                      : 'bg-[#151c19]/50 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className={`p-2 rounded-xl mt-0.5 ${state.badgeBg} ${state.badgeColor}`}>
                    {state.id === 'active' || state.id === 'renewed' ? (
                      <CheckCircle2 size={18} />
                    ) : state.id === 'warning' ? (
                      <AlertTriangle size={18} />
                    ) : (
                      <Lock size={18} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-sm font-bold text-white">{state.title}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${state.badgeBg} ${state.badgeColor}`}>
                        {state.badge}
                      </span>
                    </div>
                    <p className="text-xs text-[#aab7b2]">{state.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-6 flex justify-center relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full relative flex flex-col items-center"
            >
              <div className="mb-6 bg-[#151c19] border border-white/15 p-4 rounded-2xl shadow-2xl flex items-center gap-4 border-l-4 border-l-[#e8783c] w-full max-w-[340px]">
                <div className="bg-white p-2 rounded-xl border border-[#e8783c]">
                  <QrCode size={36} className="text-[#151c19]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">QR #PERMANENT-104</span>
                    <span className="h-2 w-2 rounded-full bg-[#34b56a]" />
                  </div>
                  <p className="text-[10px] text-[#ffc928] font-mono mt-0.5">{current.qrStatus}</p>
                  <p className="text-[9px] text-[#aab7b2]">Physical Placard Never Changes</p>
                </div>
              </div>

              <IPhoneMockup badgeText={current.phoneStatus}>
                <div className="p-4 min-h-[380px] flex flex-col justify-between">
                  {current.id === 'expired' ? (
                    <div className="my-auto text-center py-8 space-y-3">
                      <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 mx-auto flex items-center justify-center">
                        <Lock size={24} />
                      </div>
                      <h4 className="text-sm font-bold text-white">Menu Temporarily Unavailable</h4>
                      <p className="text-[11px] text-[#aab7b2] max-w-[200px] mx-auto">
                        This restaurant's digital menu is temporarily paused. Please contact staff.
                      </p>
                      <div className="pt-2">
                        <span className="text-[9px] text-white/40 bg-white/5 px-2 py-1 rounded font-mono">
                          Protected by MENUQR SafeLock
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {current.id === 'warning' && (
                        <div className="bg-[#ffc928]/10 border border-[#ffc928]/30 p-2.5 rounded-xl text-left flex items-center gap-2">
                          <AlertTriangle size={14} className="text-[#ffc928] shrink-0" />
                          <span className="text-[10px] text-[#ffc928]">
                            10 Days Remaining on Plan • Live Menu Active
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center border-b border-white/10 pb-2">
                        <span className="text-xs font-bold text-white">Cafe Royale</span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          Menu Active
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#1d2723] border border-white/10 flex items-center justify-between">
                        <span className="text-xs text-white font-medium">Chef's Tasting Menu</span>
                        <span className="text-xs font-bold text-[#e8783c]">₹1,200</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#1d2723] border border-white/10 flex items-center justify-between">
                        <span className="text-xs text-white font-medium">Artisanal Mocktail</span>
                        <span className="text-xs font-bold text-[#e8783c]">₹280</span>
                      </div>
                    </div>
                  )}

                  <div className="text-[10px] text-[#aab7b2] text-center pt-3 border-t border-white/10">
                    Same QR Code • 100% Scan Safe
                  </div>
                </div>
              </IPhoneMockup>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}