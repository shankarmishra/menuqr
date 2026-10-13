import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, RefreshCw, ShieldCheck } from 'lucide-react';
import ScannableQRCode from './ScannableQRCode';

const timelineStates = [
  {
    id: 'monday',
    day: 'Monday',
    title: 'Regular Day',
    subtitle: 'Base prices active',
    items: [
      { id: 1, name: 'Double Smash Burger', desc: 'Two beef patties, house sauce, brioche bun.', price: '₹340', tag: '', available: true },
      { id: 2, name: 'Truffle Fries', desc: 'Crispy fries tossed in truffle oil and parmesan.', price: '₹180', tag: '', available: true },
      { id: 3, name: 'Classic Mojito', desc: 'Mint, lime, soda.', price: '₹150', tag: '', available: true },
    ]
  },
  {
    id: 'wednesday',
    day: 'Wednesday',
    title: 'Mid-week Rush',
    subtitle: 'Fries sold out!',
    items: [
      { id: 1, name: 'Double Smash Burger', desc: 'Two beef patties, house sauce, brioche bun.', price: '₹340', tag: '', available: true },
      { id: 2, name: 'Truffle Fries', desc: 'Crispy fries tossed in truffle oil and parmesan.', price: '₹180', tag: 'Sold Out', available: false },
      { id: 3, name: 'Classic Mojito', desc: 'Mint, lime, soda.', price: '₹150', tag: '', available: true },
    ]
  },
  {
    id: 'saturday',
    day: 'Saturday',
    title: 'Weekend Surge',
    subtitle: 'Dynamic weekend pricing',
    items: [
      { id: 1, name: 'Double Smash Burger', desc: 'Two beef patties, house sauce, brioche bun.', price: '₹380', tag: 'Bestseller', available: true },
      { id: 2, name: 'Truffle Fries', desc: 'Crispy fries tossed in truffle oil and parmesan.', price: '₹220', tag: 'Back in stock', available: true },
      { id: 3, name: 'Classic Mojito', desc: 'Mint, lime, soda.', price: '₹180', tag: '', available: true },
    ]
  }
];

export default function OneQrSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const activeState = timelineStates[activeIndex];

  const handleTabClick = (index: number) => {
    if (index === activeIndex || isUpdating) return;
    setIsUpdating(true);
    
    // Smooth cinematic sequence: overlay appears, data swaps, overlay fades
    setTimeout(() => {
      setActiveIndex(index);
    }, 200);
    
    setTimeout(() => {
      setIsUpdating(false);
    }, 500);
  };

  return (
    <section className="relative overflow-hidden bg-white px-5 py-20 sm:px-8 md:py-24">
      <div className="pointer-events-none absolute -right-24 top-20 h-80 w-80 rounded-full bg-orange-50 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-[1240px]">
        <header className="mx-auto max-w-3xl space-y-5 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-menusqr-orange/20 bg-orange-50/70 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-menusqr-emerald">
            <span className="h-1.5 w-1.5 rounded-full bg-menusqr-orange" />
            Your menu changes. Your QR doesn't.
          </span>
          <h2 className="text-[2.6rem] font-extrabold leading-[1.04] tracking-tight text-menusqr-emerald sm:text-[3.5rem]">
            One QR.<br className="sm:hidden" />{' '}
            <span className="font-serif font-medium italic text-menusqr-orange">Countless Updates.</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-[#292D2A] sm:text-lg">
            Update prices for the weekend, mark items sold out instantly, or launch new specials. Your physical QR codes remain exactly where they are—saving you printing costs forever.
          </p>
        </header>

        <div className="mt-10 grid gap-3 md:grid-cols-3">
          {timelineStates.map((state, idx) => (
            <button
              key={state.id}
              onClick={() => handleTabClick(idx)}
              type="button"
              aria-pressed={activeIndex === idx}
              className={`rounded-2xl border p-4 text-left transition-all duration-300 ${
                activeIndex === idx
                  ? 'border-menusqr-orange/40 bg-orange-50/70 shadow-[0_12px_30px_rgba(232,120,60,0.1)]'
                  : 'border-[#E8E7E2] bg-white hover:border-menusqr-orange/25 hover:bg-[#FCFBF9]'
              }`}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className={`text-[10px] font-mono font-bold tracking-[0.14em] sm:text-[11px] ${
                  activeIndex === idx ? 'text-menusqr-orange' : 'text-menusqr-neutral-muted'
                }`}>
                  {idx === 0 ? '09:10 MENU LIVE' : idx === 1 ? '12:45 SOLD OUT' : '18:20 PRICE UPDATED'}
                </span>
                <span className="text-xs font-mono font-bold text-menusqr-emerald">
                  {idx === 0 ? '₹280' : idx === 1 ? '₹280' : '₹320'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${activeIndex === idx ? 'bg-menusqr-orange' : 'bg-[#D8D8D2]'}`} />
                <h4 className="text-base font-bold text-menusqr-emerald">{state.title}</h4>
              </div>
              <p className="mt-1 pl-4 text-xs text-[#414641]">{state.subtitle}</p>
            </button>
          ))}
        </div>

        <div className="relative mt-10 overflow-hidden rounded-[28px] border border-[#E9E7E0] bg-white shadow-[0_24px_80px_rgba(37,43,36,0.09)]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EFEEE9] px-5 py-4 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-menusqr-emerald text-sm font-black text-white">M</div>
              <div>
                <p className="text-sm font-extrabold text-menusqr-emerald">The Garden Cafe</p>
                <p className="text-xs text-menusqr-neutral-muted">Menu manager</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#EFF8F1] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#32834A]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#41A45E]" />
              Menu live
            </span>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1fr)_270px]">
            <div className="p-5 sm:p-7">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-menusqr-neutral-muted">{activeState.day} menu</p>
                  <h3 className="mt-1 text-xl font-extrabold tracking-tight text-menusqr-emerald">Menu items</h3>
                </div>
                <span className="rounded-lg bg-[#F6F5F1] px-2.5 py-1.5 text-[11px] font-semibold text-menusqr-neutral-sec">
                  {activeState.items.length} items
                </span>
              </div>

              <div className="mt-5 divide-y divide-[#F0EFEA]">
                <AnimatePresence mode="popLayout">
                  {activeState.items.map((item) => (
                    <motion.div
                      key={`${item.id}-${item.price}-${item.available}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                      className="flex items-center gap-3 py-4 sm:gap-4"
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${
                        item.available ? 'bg-orange-50 text-menusqr-orange' : 'bg-[#F2F2EF] text-menusqr-neutral-muted'
                      }`}>
                        {item.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className={`text-sm font-bold ${item.available ? 'text-menusqr-emerald' : 'text-menusqr-neutral-muted line-through'}`}>
                            {item.name}
                          </h4>
                          {item.tag && (
                            <span className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                              item.available ? 'bg-orange-50 text-menusqr-orange' : 'bg-red-50 text-red-600'
                            }`}>
                              {item.tag}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 line-clamp-1 text-xs text-[#414641]">{item.desc}</p>
                      </div>
                      <span className="shrink-0 text-sm font-extrabold text-menusqr-emerald">{item.price}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <aside className="flex flex-col items-center justify-center border-t border-[#EFEEE9] bg-[#FBFAF7] px-5 py-7 text-center lg:border-l lg:border-t-0">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-menusqr-orange shadow-sm">
                <QrCode size={20} />
              </div>
              <p className="text-sm font-extrabold text-menusqr-emerald">Your QR stays the same</p>
              <p className="mt-1 max-w-[210px] text-xs leading-relaxed text-[#414641]">
                Update the menu anytime. No need to print a new code.
              </p>
              <div className="my-5 rounded-2xl border border-[#ECEAE4] bg-white p-3 shadow-sm">
                <ScannableQRCode url="https://menusqr.app/menu/the-garden" size={124} />
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-menusqr-neutral-sec">
                <ShieldCheck size={14} className="text-menusqr-veg" />
                Never moves
              </div>
            </aside>
          </div>

          <AnimatePresence>
            {isUpdating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 z-20 flex items-center justify-center bg-white/65 backdrop-blur-[2px]"
              >
                <div className="rounded-2xl border border-[#ECEAE4] bg-white p-3 shadow-lg">
                  <RefreshCw className="animate-spin text-menusqr-orange" size={24} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
