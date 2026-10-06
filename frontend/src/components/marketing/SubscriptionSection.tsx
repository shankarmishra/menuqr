import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, AlertTriangle, Lock, QrCode, CheckCircle2, RefreshCcw, ArrowRight } from 'lucide-react';
import IPhoneMockup from './PremiumIPhoneMockup';

type SubState = 'active' | '10days' | 'expiring' | 'expired' | 'renew' | 'same_qr';

const TIMELINE_STEPS: { id: SubState; label: string }[] = [
  { id: 'active', label: 'ACTIVE' },
  { id: '10days', label: '10 DAYS' },
  { id: 'expiring', label: 'EXPIRING' },
  { id: 'expired', label: 'EXPIRED' },
  { id: 'renew', label: 'RENEW' },
  { id: 'same_qr', label: 'SAME QR' },
];

const SUB_STATES: Record<SubState, any> = {
  active: {
    title: 'Active Subscription',
    badge: '365 Days Remaining',
    badgeBg: 'bg-menusqr-veg/10',
    badgeColor: 'text-menusqr-veg',
    desc: 'Your digital menu is live, lightning-fast, and receiving hungry customers daily.',
    phoneStatus: 'Live Menu Active',
    qrStatus: 'QR Verified (Identity Intact)',
    icon: CheckCircle2,
  },
  '10days': {
    title: '10-Day Warning',
    badge: '10 Days Left',
    badgeBg: 'bg-menusqr-yellow/10',
    badgeColor: 'text-menusqr-yellow',
    desc: 'A gentle reminder appears in your dashboard. Your menu remains fully active for diners without interruption.',
    phoneStatus: 'Live Menu Active',
    qrStatus: 'QR Verified (Identity Intact)',
    icon: AlertTriangle,
  },
  expiring: {
    title: 'Expiring Soon',
    badge: '24 Hours Left',
    badgeBg: 'bg-menusqr-orange/10',
    badgeColor: 'text-menusqr-orange',
    desc: 'Urgent alerts in your dashboard. Diners can still scan and order perfectly fine.',
    phoneStatus: 'Live Menu Active',
    qrStatus: 'QR Verified (Identity Intact)',
    icon: AlertTriangle,
  },
  expired: {
    title: 'Subscription Expired',
    badge: 'Menu Locked',
    badgeBg: 'bg-menusqr-nonveg/10',
    badgeColor: 'text-menusqr-nonveg',
    desc: 'Menu gracefully displays an elegant "Temporarily Unavailable" screen. Your physical QR identity is safely protected and reserved.',
    phoneStatus: 'Menu Temporarily Blocked',
    qrStatus: 'Physical QR Reserved',
    icon: Lock,
  },
  renew: {
    title: 'Quick Renewal',
    badge: 'Action Required',
    badgeBg: 'bg-menusqr-orange/10',
    badgeColor: 'text-menusqr-orange',
    desc: 'Renew in one click from your dashboard to restore access instantly. Your data is never deleted.',
    phoneStatus: 'Menu Temporarily Blocked',
    qrStatus: 'Awaiting Renewal',
    icon: RefreshCcw,
    actionText: 'Renew Subscription Now',
  },
  same_qr: {
    title: 'Instant Reactivation',
    badge: 'Same QR • 100% Intact',
    badgeBg: 'bg-menusqr-veg/10',
    badgeColor: 'text-menusqr-veg',
    desc: 'Upon renewal, your menu is instantly restored. You DO NOT need to reprint a single QR code!',
    phoneStatus: 'Live Menu Restored',
    qrStatus: 'QR Identity Reactivated',
    icon: QrCode,
  },
};

export default function SubscriptionSection() {
  const [selectedState, setSelectedState] = useState<SubState>('active');
  const current = SUB_STATES[selectedState];
  const currentIndex = TIMELINE_STEPS.findIndex(s => s.id === selectedState);

  return (
    <section className="py-24 md:py-24 px-6 bg-menusqr-primary border-b border-menusqr-emerald/5 relative overflow-hidden">
      {/* Texture */}
      <div className="texture-paper-grain z-0" />

      <div className="max-w-[1240px] mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-menusqr-emerald/5 text-menusqr-emerald text-xs font-semibold uppercase tracking-wider border border-menusqr-emerald/10">
            <ShieldCheck size={14} className="text-menusqr-orange" />
            <span>QR Preservation Engine</span>
          </div>

          <h2 className="text-[2.5rem] sm:text-[3.5rem] font-extrabold text-menusqr-emerald leading-tight tracking-tight">
            One QR. <br />
            <span className="text-menusqr-orange">Infinite Lifespan.</span>
          </h2>

          <p className="text-lg text-menusqr-neutral-sec leading-relaxed">
            Your physical QR stickers are permanent assets. Even if your subscription lapses, your QR identity is safely protected and instantly reactivates upon renewal.
          </p>
        </div>

        {/* Horizontal Editorial Timeline */}
        <div className="relative mb-16">
          {/* Progress Line */}
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-menusqr-emerald/20 -translate-y-1/2 hidden md:block">
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 relative">
            {TIMELINE_STEPS.map((step, idx) => {
              const isSelected = selectedState === step.id;
              const isPast = currentIndex >= idx;
              
              return (
                <button
                  key={step.id}
                  onClick={() => setSelectedState(step.id)}
                  className="group relative flex md:flex-col items-center gap-4 md:gap-3 w-full md:w-auto text-left md:text-center"
                >
                  <div 
                    className={`relative w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 ${
                      isSelected 
                        ? 'bg-menusqr-orange border-menusqr-orange text-white scale-110 shadow-lg shadow-menusqr-orange/20' 
                        : isPast 
                          ? 'bg-menusqr-emerald text-white border-menusqr-emerald'
                          : 'bg-menusqr-primary border-menusqr-emerald/20 text-menusqr-neutral-muted group-hover:border-menusqr-emerald/40'
                    }`}
                  >
                    <span className="text-xs md:text-sm font-bold font-mono">{idx + 1}</span>
                  </div>
                  <span className={`text-xs md:text-sm font-bold tracking-wider uppercase transition-colors ${
                    isSelected ? 'text-menusqr-orange' : isPast ? 'text-menusqr-emerald' : 'text-menusqr-neutral-muted'
                  }`}>
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Panel & Mockup Container */}
        <div className="grid lg:grid-cols-12 gap-12 items-center bg-menusqr-secondary rounded-[2.5rem] p-6 sm:p-12 border border-menusqr-emerald/5 shadow-xl shadow-menusqr-emerald/5">
          
          {/* Left: Physical Status Panel */}
          <div className="lg:col-span-6 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedState}
                initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="bg-menusqr-emerald rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden"
              >
                {/* Internal Decorative Grid */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className={`p-3 rounded-2xl ${current.badgeBg} ${current.badgeColor}`}>
                      <current.icon size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${current.badgeBg} ${current.badgeColor}`}>
                        {current.badge}
                      </span>
                      <h3 className="text-2xl font-bold text-white mt-2">{current.title}</h3>
                    </div>
                  </div>

                  <p className="text-menusqr-neutral-muted text-lg leading-relaxed mb-8">
                    {current.desc}
                  </p>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 flex items-start gap-4">
                    <div className="bg-white p-2.5 rounded-xl border border-white/20 shrink-0">
                      <QrCode size={32} className="text-menusqr-emerald" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-white tracking-wide">QR #PERMANENT-104</span>
                        {current.id !== 'expired' && current.id !== 'renew' && (
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-menusqr-veg opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-menusqr-veg"></span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-menusqr-orange font-mono uppercase tracking-wider mb-1">
                        {current.qrStatus}
                      </p>
                      <p className="text-[11px] text-menusqr-neutral-muted">Physical Placard Never Changes</p>
                    </div>
                  </div>

                  {current.actionText && (
                    <button className="w-full bg-menusqr-orange hover:bg-orange-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-lg shadow-menusqr-orange/20">
                      {current.actionText}
                      <ArrowRight size={18} strokeWidth={3} />
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Phone Mockup */}
          <div className="lg:col-span-6 flex justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedState}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <IPhoneMockup>
                  <div className="p-4 min-h-[400px] flex flex-col justify-between pt-12">
                    {current.id === 'expired' || current.id === 'renew' ? (
                      <div className="my-auto text-center py-8 space-y-4">
                        <div className="h-16 w-16 rounded-full bg-menusqr-nonveg/10 text-menusqr-nonveg border border-menusqr-nonveg/20 mx-auto flex items-center justify-center">
                          <Lock size={32} />
                        </div>
                        <h4 className="text-[15px] font-bold text-menusqr-emerald">Menu Temporarily<br/>Unavailable</h4>
                        <p className="text-xs text-menusqr-neutral-muted max-w-[200px] mx-auto leading-relaxed">
                          This restaurant's digital menu is temporarily paused. Please contact staff.
                        </p>
                        <div className="pt-4">
                          <span className="text-[9px] text-menusqr-neutral-sec bg-menusqr-emerald/5 px-2.5 py-1.5 rounded-full font-mono font-bold tracking-wider uppercase">
                            Protected by MENUSQR SafeLock
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(current.id === '10days' || current.id === 'expiring') && (
                          <div className={`border p-3 rounded-xl text-left flex items-start gap-2.5 ${
                            current.id === 'expiring' 
                              ? 'bg-menusqr-orange/10 border-menusqr-orange/30' 
                              : 'bg-menusqr-yellow/10 border-menusqr-yellow/30'
                          }`}>
                            <AlertTriangle size={16} className={`shrink-0 mt-0.5 ${current.id === 'expiring' ? 'text-menusqr-orange' : 'text-menusqr-yellow'}`} />
                            <div className="space-y-1">
                              <p className={`text-[10px] font-bold uppercase tracking-wider ${current.id === 'expiring' ? 'text-menusqr-orange' : 'text-menusqr-yellow'}`}>
                                {current.id === 'expiring' ? '24 Hours Remaining' : '10 Days Remaining'}
                              </p>
                              <p className="text-[10px] text-menusqr-emerald/80 leading-tight">
                                Only visible to restaurant owner in dashboard.
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="flex justify-between items-center border-b border-menusqr-emerald/10 pb-3">
                          <span className="text-sm font-bold text-menusqr-emerald">Cafe Royale</span>
                          <span className="text-[10px] text-menusqr-veg font-bold bg-menusqr-veg/10 px-2 py-1 rounded-full uppercase tracking-wider">
                            Menu Active
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-white border border-menusqr-emerald/10 flex flex-col gap-1 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] text-menusqr-emerald font-bold">Chef's Tasting Menu</span>
                            <span className="text-[13px] font-bold text-menusqr-orange">₹1,200</span>
                          </div>
                          <span className="text-[10px] text-menusqr-neutral-muted">Truffle oil, wild mushrooms...</span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-white border border-menusqr-emerald/10 flex flex-col gap-1 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] text-menusqr-emerald font-bold">Artisanal Mocktail</span>
                            <span className="text-[13px] font-bold text-menusqr-orange">₹280</span>
                          </div>
                          <span className="text-[10px] text-menusqr-neutral-muted">Fresh mint, lime, crushed ice</span>
                        </div>
                      </div>
                    )}

                    <div className="text-[10px] text-menusqr-neutral-muted text-center pt-4 border-t border-menusqr-emerald/10 font-bold uppercase tracking-wider">
                      Same QR Code • 100% Scan Safe
                    </div>
                  </div>
                </IPhoneMockup>
              </motion.div>
            </AnimatePresence>
          </div>
          
        </div>
      </div>
    </section>
  );
}
