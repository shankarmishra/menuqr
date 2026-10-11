import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ChefHat, QrCode, Palette, LayoutDashboard, Plus, Settings, TrendingUp, Search, CheckCircle2 } from 'lucide-react';
import IPhoneMockup from './PremiumIPhoneMockup';
import IndianHeritageMenuDisplay from './IndianHeritageMenuDisplay';

export default function DashboardDemoSection() {
  const [step, setStep] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { margin: '100px 0px' });

  useEffect(() => {
    if (!isInView) return;

    const sequence = [
      { step: 0, duration: 2000 },
      { step: 1, duration: 1000 },
      { step: 2, duration: 1500 },
      { step: 3, duration: 1000 },
      { step: 4, duration: 3000 },
    ];
    let timer: ReturnType<typeof setTimeout>;

    const runStep = (index: number) => {
      const current = sequence[index];
      setStep(current.step);
      timer = setTimeout(() => runStep((index + 1) % sequence.length), current.duration);
    };

    runStep(0);
    return () => clearTimeout(timer);
  }, [isInView]);

  const getPrice = () => {
    if (step >= 2) return 320;
    return 280;
  };

  const getPreviewPrice = () => {
    if (step >= 4) return 320;
    return 280;
  };

  return (
    <section ref={sectionRef} className="py-16 md:py-20 px-6 bg-menusqr-primary overflow-hidden relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-menusqr-emerald/10 to-transparent"></div>
      
      <div className="max-w-[1200px] mx-auto text-center mb-16 relative z-10">
        <h2 className="text-3xl md:text-5xl font-extrabold text-menusqr-emerald mb-4 tracking-tight">Enterprise Grade Dashboard</h2>
        <p className="text-lg text-menusqr-emerald/70 max-w-2xl mx-auto font-medium">
          Manage your restaurant's digital presence from a single, powerful command center. 
          Updates reflect instantly on your customer's phones.
        </p>
      </div>

      <div className="max-w-[1300px] mx-auto bg-white rounded-[2rem] border border-gray-200/60 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.15)] relative overflow-hidden flex flex-col h-[750px] ring-1 ring-black/5 z-10">
        {/* Mock Mac OS Top Bar */}
        <div className="h-14 border-b border-gray-200/60 flex items-center px-5 gap-2 bg-white/80 backdrop-blur-md shrink-0">
          <div className="flex gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
          </div>
          <div className="mx-auto flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-100/80 px-12 py-1.5 rounded-md border border-gray-200/50">
            <Lock size={12} className="text-gray-400" /> menusqr.in/app/dashboard
          </div>
        </div>

        {/* Dashboard Layout */}
        <div className="flex flex-1 overflow-hidden relative bg-white">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50/50 border-r border-gray-200/60 p-6 flex flex-col hidden lg:flex shrink-0">
            <div className="flex items-center gap-2 mb-10 text-menusqr-emerald">
              <ChefHat size={28} />
              <span className="font-black text-xl tracking-tight">MenusQR</span>
            </div>
            
            <nav className="space-y-1.5 flex-1">
              {[
                { icon: LayoutDashboard, label: 'Dashboard', active: false },
                { icon: ChefHat, label: 'Menu Items', active: true },
                { icon: Palette, label: 'Appearance', active: false },
                { icon: QrCode, label: 'QR Center', active: false },
                { icon: Settings, label: 'Settings', active: false },
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm cursor-pointer transition-colors ${item.active ? 'bg-menusqr-emerald text-white shadow-md' : 'text-gray-500 hover:bg-gray-200/50 hover:text-menusqr-emerald'}`}>
                  <item.icon size={18} className={item.active ? 'text-white' : 'text-gray-400'} />
                  {item.label}
                </div>
              ))}
            </nav>

            <div className="mt-auto bg-white border border-gray-200/60 rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-menusqr-orange to-orange-300 flex items-center justify-center text-white font-bold shadow-inner">
                SL
              </div>
              <div>
                <p className="text-xs font-bold text-menusqr-emerald">Spice Lounge & Haveli</p>
                <p className="text-[10px] font-bold text-menusqr-veg uppercase tracking-wider">Royal Palace Active</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white p-6 md:p-8 overflow-y-auto relative z-10 scrollbar-hide">
            <div className="lg:pr-[360px]">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-2xl font-black text-menusqr-emerald tracking-tight">Menu Items</h1>
                  <p className="text-sm text-gray-500 font-medium mt-1">Manage your dishes and pricing.</p>
                </div>
                <div className="flex gap-3">
                  <div className="relative hidden md:block">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search items..." className="pl-10 pr-4 py-2 bg-gray-50/80 border border-gray-200/80 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-menusqr-orange/20 focus:border-menusqr-orange transition-all w-64 shadow-sm" />
                  </div>
                  <button className="bg-menusqr-emerald hover:bg-menusqr-emerald/90 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-menusqr-emerald/20 transition-all active:scale-95">
                    <Plus size={16} strokeWidth={3} /> Add Item
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  { label: 'Total Scans', value: '1,248', trend: '+12%', color: 'text-menusqr-veg' },
                  { label: 'Active Items', value: '86', trend: 'Updated today', color: 'text-gray-400' },
                  { label: 'Menu Views', value: '4,592', trend: '+24%', color: 'text-menusqr-veg' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white border border-gray-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{stat.label}</p>
                    <div className="flex items-end gap-3">
                      <span className="text-4xl font-black text-menusqr-emerald tracking-tight">{stat.value}</span>
                      <span className={`text-[11px] font-bold mb-1.5 flex items-center gap-1 ${stat.color}`}>
                        {stat.color.includes('menusqr-veg') && <TrendingUp size={12} strokeWidth={3} />}
                        {stat.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <h2 className="text-lg font-bold text-menusqr-emerald mb-4">Recent Menu Items</h2>
              <div className="bg-white border border-gray-200/60 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-gray-50/80 text-[11px] uppercase tracking-wider text-gray-400 font-bold border-b border-gray-200/60">
                      <th className="p-4 pl-6 font-bold">Item Name</th>
                      <th className="p-4 font-bold">Category</th>
                      <th className="p-4 font-bold">Price</th>
                      <th className="p-4 font-bold">Status</th>
                      <th className="p-4 text-right pr-6 font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {[
                      { name: 'Murgh Makhani (Butter Chicken)', category: 'Royal Curries', price: getPrice(), status: 'Available', type: 'non-veg', highlight: true },
                      { name: 'Dal Makhani Bukhara', category: 'Royal Curries', price: 340, status: 'Available', type: 'veg' },
                      { name: 'Tandoori Malai Paneer Tikka', category: 'Clay Oven Tandoor', price: 360, status: 'Available', type: 'veg' },
                      { name: 'Awadhi Dum Gosht Biryani', category: 'Dum Biryani', price: 480, status: 'Available', type: 'non-veg' },
                      { name: 'Shahi Kesari Tukda', category: 'Desserts', price: 220, status: 'Sold Out', type: 'veg' },
                    ].map((item, i) => (
                      <tr key={i} className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${item.highlight && step >= 1 && step <= 3 ? 'bg-menusqr-orange/5 hover:bg-menusqr-orange/5' : ''}`}>
                        <td className="p-4 pl-6 font-bold text-menusqr-emerald flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${item.type === 'veg' ? 'bg-menusqr-veg shadow-[0_0_8px_rgba(39,201,63,0.5)]' : 'bg-menusqr-nonveg shadow-[0_0_8px_rgba(224,68,62,0.5)]'}`}></div>
                          {item.name}
                        </td>
                        <td className="p-4 text-gray-500 font-medium">{item.category}</td>
                        <td className="p-4 font-black text-menusqr-emerald">
                          {item.highlight ? (
                            <div className="relative inline-flex">
                              {step >= 1 && step <= 3 && (
                                <motion.div
                                  layoutId="price-input"
                                  className="absolute -inset-y-1.5 -inset-x-3 bg-white shadow-lg border border-menusqr-orange rounded-lg flex items-center px-3 z-10 text-base"
                                >
                                  <span className="text-gray-400 mr-1 font-semibold">₹</span>
                                  <span className={step === 1 ? 'animate-pulse' : ''}>{getPrice()}</span>
                                  {step === 1 && <div className="w-0.5 h-5 bg-menusqr-orange animate-pulse ml-0.5 rounded-full"></div>}
                                </motion.div>
                              )}
                              <span className={step >= 1 && step <= 3 ? 'opacity-0' : 'opacity-100'}>
                                ₹{item.price}
                              </span>
                            </div>
                          ) : (
                            `₹${item.price}`
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${item.status === 'Available' ? 'bg-menusqr-veg/10 text-menusqr-veg border-menusqr-veg/20' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-4 text-right pr-6">
                          {item.highlight && step >= 2 && step <= 4 ? (
                            <motion.button
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`px-4 py-2 rounded-lg text-xs font-bold text-white transition-colors flex items-center justify-center ml-auto min-w-[84px] shadow-md ${step === 4 ? 'bg-menusqr-veg shadow-menusqr-veg/20' : 'bg-menusqr-orange shadow-menusqr-orange/20'}`}
                            >
                              {step === 3 ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                              ) : step === 4 ? (
                                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} strokeWidth={3}/> Saved</span>
                              ) : (
                                'Save'
                              )}
                            </motion.button>
                          ) : (
                            <button className="text-gray-400 hover:text-menusqr-emerald font-bold transition-colors">Edit</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live Preview (Phone) */}
            <div className="absolute right-0 top-0 bottom-0 w-[360px] hidden lg:flex items-center justify-center bg-gray-50/80 border-l border-gray-200/60 z-0 shadow-inner">
              <div className="relative">
                {/* Status Badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-menusqr-emerald text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest z-10 shadow-lg border border-white/10 whitespace-nowrap flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-menusqr-veg animate-pulse"></div>
                  Live Preview
                </div>
                
                <IPhoneMockup
                  className="scale-[0.85] transform-gpu shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] border-gray-800"
                  screenClassName="overflow-hidden flex flex-col bg-[#200817]"
                  statusBarTheme="light"
                  statusBarBg="bg-[#280B1E]"
                >
                  <IndianHeritageMenuDisplay
                    restaurantName="Spice Lounge & Haveli"
                    tagline="Royal Awadhi & Mughlai Cuisine"
                    tableInfo="Table #04 • Royal Courtyard"
                    badgeText="24K Royal Luxe"
                    highlightItemPrice={getPreviewPrice()}
                    isUpdated={step === 4}
                  />
                </IPhoneMockup>

                <AnimatePresence>
                  {step === 4 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -20 }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#1A0512] via-[#2A081A] to-[#1A0512] text-[#FAF3E0] border-2 border-[#D4AF37] px-4 py-3 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex items-center gap-3 z-50 whitespace-nowrap"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#180912] flex items-center justify-center font-bold text-xs shadow-md shrink-0">
                        ✓
                      </div>
                      <div className="text-left font-sans">
                        <p className="text-[11px] font-black text-[#D4AF37] uppercase tracking-wider">Live Cloud Sync</p>
                        <p className="text-[10px] text-white/90 font-medium">Butter Chicken: ₹280 → ₹320</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

function Lock({ size, className }: { size: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}
