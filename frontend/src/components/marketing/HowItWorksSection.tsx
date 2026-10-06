import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  CircleCheck,
  Layers,
  LayoutGrid,
  Palette,
  QrCode,
  Smartphone,
  Store,
  Utensils,
} from 'lucide-react';
import ScannableQRCode from './ScannableQRCode';

const STEPS = [
  { 
    id: '01', 
    title: 'Create', 
    heading: 'Create your profile',
    subtitle: 'Account Setup',
    desc: 'Register your restaurant identity. No app downloads required. Just a clean, browser-based command center for your brand.',
    Icon: Store,
    preview: 'profile',
  },
  { 
    id: '02', 
    title: 'Build', 
    heading: 'Build your digital menu',
    subtitle: 'Digital Menu',
    desc: 'Structure your offerings with categories, dietary tags, and high-resolution imagery using our seamless builder.',
    Icon: LayoutGrid,
    preview: 'menu',
  },
  { 
    id: '03', 
    title: 'Design', 
    heading: 'Design your menu',
    subtitle: 'Brand Alignment',
    desc: 'Select from professionally crafted templates. Adjust colors and typography to perfectly match your physical restaurant aesthetic.',
    Icon: Palette,
    preview: 'design',
  },
  { 
    id: '04', 
    title: 'QR', 
    heading: 'Generate your QR code',
    subtitle: 'Generate Code',
    desc: 'Your unique, permanent QR code is generated instantly. Export it in ultra-high resolution for professional printing.',
    Icon: QrCode,
    preview: 'qr',
  },
  { 
    id: '05', 
    title: 'Place', 
    heading: 'Place your QR code',
    subtitle: 'Physical Deployment',
    desc: 'Display your customized QR placards across tables, reception desks, and outdoor seating areas.',
    Icon: Layers,
    preview: 'tables',
  },
  { 
    id: '06', 
    title: 'Scan', 
    heading: 'Go live for diners',
    subtitle: 'Live Dining',
    desc: 'Diners scan and browse instantly. You update prices or remove sold-out items in real-time, without ever reprinting.',
    Icon: Smartphone,
    preview: 'live',
  },
];

function StepPreview({ preview }: { preview: string }) {
  if (preview === 'profile') {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-[#ECEBE6] bg-white p-5 shadow-[0_16px_40px_rgba(21,28,25,0.06)]">
        <div className="flex items-center gap-3 border-b border-[#F0EFEA] pb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-menusqr-emerald text-white"><Store size={20} /></div>
          <div><p className="text-sm font-bold text-[#151C19]">Your restaurant</p><p className="text-xs text-[#555D58]">Profile setup</p></div>
          <CircleCheck className="ml-auto text-[#34A853]" size={19} />
        </div>
        <div className="mt-4 space-y-3">
          <div className="h-9 rounded-lg border border-[#E8E7E2] px-3 py-2 text-xs text-[#333A35]">The Garden Cafe</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-9 rounded-lg border border-[#E8E7E2] px-3 py-2 text-xs text-[#555D58]">Restaurant</div>
            <div className="h-9 rounded-lg border border-[#E8E7E2] px-3 py-2 text-xs text-[#555D58]">Mumbai, India</div>
          </div>
        </div>
      </div>
    );
  }

  if (preview === 'menu') {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-[#ECEBE6] bg-white p-5 shadow-[0_16px_40px_rgba(21,28,25,0.06)]">
        <div className="mb-4 flex items-center justify-between">
          <div><p className="text-sm font-bold text-[#151C19]">Your menu</p><p className="text-xs text-[#555D58]">A few items to get started</p></div>
          <span className="rounded-lg bg-orange-50 px-2.5 py-1.5 text-xs font-semibold text-[#B84D1B]">+ Add item</span>
        </div>
        {[['Double Smash Burger', '₹340'], ['Truffle Fries', '₹180'], ['Classic Mojito', '₹150']].map(([name, price]) => (
          <div key={name} className="flex items-center gap-3 border-t border-[#F0EFEA] py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F6F5F1] text-[#475049]"><Utensils size={15} /></div>
            <span className="flex-1 text-xs font-semibold text-[#242A26]">{name}</span>
            <span className="text-xs font-bold text-[#242A26]">{price}</span>
          </div>
        ))}
      </div>
    );
  }

  if (preview === 'design') {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-[#ECEBE6] bg-white p-5 shadow-[0_16px_40px_rgba(21,28,25,0.06)]">
        <div className="mb-4 flex items-center justify-between"><div><p className="text-sm font-bold text-[#151C19]">Choose your look</p><p className="text-xs text-[#555D58]">Made to match your brand</p></div><Palette className="text-menusqr-orange" size={19} /></div>
        <div className="grid grid-cols-3 gap-3">
          {[
            ['#173B32', '#E8783C', 'Classic'],
            ['#3D342E', '#D6A66B', 'Warm'],
            ['#26354A', '#91AFC7', 'Modern'],
          ].map(([primary, accent, name], index) => (
            <div key={name} className={`rounded-xl border p-2 ${index === 0 ? 'border-menusqr-orange ring-2 ring-orange-100' : 'border-[#E8E7E2]'}`}>
              <div className="mb-2 flex h-16 items-end gap-1 rounded-lg p-2" style={{ backgroundColor: primary }}><span className="h-2 w-8 rounded bg-white/70" /><span className="h-2 w-4 rounded" style={{ backgroundColor: accent }} /></div>
              <p className="text-center text-[10px] font-semibold text-[#333A35]">{name}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (preview === 'qr') {
    return (
      <div className="flex w-full max-w-sm items-center gap-5 rounded-2xl border border-[#ECEBE6] bg-white p-5 shadow-[0_16px_40px_rgba(21,28,25,0.06)]">
        <div className="rounded-xl border border-[#ECEBE6] p-2"><ScannableQRCode url="https://menusqr.app/menu/the-garden" size={104} /></div>
        <div><div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF8F1] text-[#32834A]"><Check size={18} /></div><p className="text-sm font-bold text-[#151C19]">Your QR is ready</p><p className="mt-1 text-xs leading-relaxed text-[#414641]">One permanent code for your digital menu.</p></div>
      </div>
    );
  }

  if (preview === 'tables') {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-[#ECEBE6] bg-white p-5 shadow-[0_16px_40px_rgba(21,28,25,0.06)]">
        <div className="mb-4"><p className="text-sm font-bold text-[#151C19]">Ready for your tables</p><p className="text-xs text-[#555D58]">Place a QR at every seat</p></div>
        <div className="grid grid-cols-3 gap-3">
          {['01', '02', '03', '04', '05', '06'].map((table) => (
            <div key={table} className="flex flex-col items-center gap-2 rounded-xl border border-[#ECEBE6] bg-[#FBFAF7] py-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-menusqr-emerald shadow-sm"><QrCode size={22} /></div><span className="text-[10px] font-bold uppercase tracking-wide text-[#333A35]">Table {table}</span></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-[#ECEBE6] bg-white p-5 shadow-[0_16px_40px_rgba(21,28,25,0.06)]">
      <div className="mb-4 flex items-center justify-between"><div><p className="text-sm font-bold text-[#151C19]">The Garden Cafe</p><p className="text-xs text-[#555D58]">Live digital menu</p></div><span className="flex items-center gap-1.5 rounded-full bg-[#EFF8F1] px-2.5 py-1 text-[10px] font-bold text-[#32834A]"><span className="h-1.5 w-1.5 rounded-full bg-[#34A853]" />LIVE</span></div>
      {['Double Smash Burger', 'Truffle Fries', 'Classic Mojito'].map((item, index) => (
        <div key={item} className="flex items-center gap-3 border-t border-[#F0EFEA] py-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F6F5F1]"><Utensils size={15} className="text-[#475049]" /></div><span className="flex-1 text-xs font-semibold text-[#242A26]">{item}</span><span className="text-xs font-bold text-[#242A26]">{['₹340', '₹180', '₹150'][index]}</span></div>
      ))}
    </div>
  );
}

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const step = STEPS[activeStep];
  const StepIcon = step.Icon;

  return (
    <section className="relative overflow-hidden bg-white px-5 py-20 sm:px-8 md:py-24" id="how-it-works">
      <div className="pointer-events-none absolute right-0 top-8 h-80 w-80 rounded-full bg-orange-50 blur-[110px]" />
      <div className="relative z-10 mx-auto max-w-[1160px]">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55 }}
          className="mx-auto mb-10 max-w-3xl text-center md:mb-12"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-menusqr-orange/20 bg-orange-50/70 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-menusqr-emerald">
            <span className="h-1.5 w-1.5 rounded-full bg-menusqr-orange" />
            How It Works
          </span>
          <h2 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-menusqr-emerald sm:text-5xl md:text-6xl">
            One QR code.
            <br className="sm:hidden" />{' '}
            <span className="font-serif font-medium italic text-menusqr-orange">Endless possibilities.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#414641] sm:text-lg">
            From your first menu to your first scan, get your restaurant online in a few simple steps.
          </p>
        </motion.header>

        <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {STEPS.map((item, index) => {
            const Icon = item.Icon;
            const isActive = activeStep === index;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveStep(index)}
                aria-pressed={isActive}
                className={`group flex min-h-[112px] flex-col items-start rounded-2xl border p-3.5 text-left transition-all duration-200 sm:p-4 ${
                  isActive
                    ? 'border-menusqr-emerald bg-menusqr-emerald text-white shadow-[0_10px_24px_rgba(21,28,25,0.14)]'
                    : 'border-[#E9E7E1] bg-white text-menusqr-emerald hover:border-menusqr-orange/40 hover:bg-[#FCFBF9]'
                }`}
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  isActive ? 'bg-white/10 text-menusqr-orange' : 'bg-orange-50 text-menusqr-orange'
                }`}>
                  <Icon size={17} />
                </span>
                <span className={`mt-3 text-[9px] font-bold uppercase tracking-[0.14em] ${
                  isActive ? 'text-white/60' : 'text-[#555D58]'
                }`}>Step {item.id}</span>
                <span className="mt-0.5 text-sm font-bold">{item.title}</span>
              </button>
            );
          })}
        </div>

        <div className="grid overflow-hidden rounded-[28px] border border-[#E9E7E1] bg-[#FAF9F6] shadow-[0_22px_70px_rgba(21,28,25,0.08)] lg:min-h-[390px] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-5 flex items-center gap-3">
                  <span className="font-mono text-sm font-bold tracking-[0.16em] text-menusqr-orange">{step.id} / 06</span>
                  <span className="h-px w-8 bg-menusqr-orange/40" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#555D58]">{step.subtitle}</span>
                </div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-menusqr-orange shadow-sm">
                  <StepIcon size={23} />
                </div>
                <h3 className="text-3xl font-extrabold tracking-tight text-menusqr-emerald sm:text-4xl">{step.heading}</h3>
                <p className="mt-4 max-w-md text-base leading-relaxed text-[#292D2A]">{step.desc}</p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link to="/signup" className="inline-flex items-center gap-2 rounded-xl bg-menusqr-orange px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#D9652B]">
                    Get started <ArrowRight size={16} />
                  </Link>
                  <span className="text-xs font-medium text-[#414641]">No app download needed</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden border-t border-[#E9E7E1] bg-[radial-gradient(ellipse_at_50%_45%,#FFFFFF_0%,#F5F3EE_78%)] p-6 sm:min-h-[320px] sm:p-10 lg:border-l lg:border-t-0">
            <span className="absolute right-5 top-5 rounded-full border border-[#E9E7E1] bg-white/80 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[#414641]">Your workspace</span>
            <AnimatePresence mode="wait">
              <motion.div
                key={step.preview}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.99 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                <StepPreview preview={step.preview} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-xs font-medium text-[#555D58]">Select a step to see how it works</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveStep((activeStep + STEPS.length - 1) % STEPS.length)}
              aria-label="Previous step"
              className="rounded-full border border-[#E4E2DC] bg-white px-4 py-2 text-xs font-bold text-menusqr-emerald transition-colors hover:border-menusqr-orange/40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setActiveStep((activeStep + 1) % STEPS.length)}
              aria-label="Next step"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E2DC] bg-white px-4 py-2 text-xs font-bold text-menusqr-emerald transition-colors hover:border-menusqr-orange/40"
            >
              Next <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
