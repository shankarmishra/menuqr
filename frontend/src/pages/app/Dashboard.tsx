import { useEffect, useState } from 'react';
import { getProfile, getSubscription, getMenu, getOrders, getStickerRequests } from './appStore';
import type { AppSubscriptionData, AppProfile, StickerRequest } from './appStore';
import { QrCode, ArrowRight, UtensilsCrossed, Edit3, ExternalLink, Download, Sparkles, ChefHat, CheckCircle2, XCircle, Package } from 'lucide-react';
import { Link } from 'react-router-dom';


export default function Dashboard() {
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [sub, setSub] = useState<AppSubscriptionData & { contentChangesUsed?: number, contentChangesRemaining?: number, contentChangesLimit?: number } | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [menu, setMenu] = useState<any>(null);
  const [qr, setQr] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [stickers, setStickers] = useState<StickerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [now] = useState(() => Date.now());
  

  useEffect(() => {
    import('./appStore').then(({ getQr }) => {
      getQr().then(q => setQr(q)).catch(() => null);
    });
    Promise.all([
      getProfile().catch(() => null),
      getSubscription().catch(() => null),
      getMenu().catch(() => null),
      getStickerRequests().catch(() => [])
    ])
      .then(async ([p, s, menuData, stickerData]) => {
        if (p) setProfile(p);
        if (s) setSub(s);
        if (menuData) {
          setMenu(menuData.menu);
          setCategories(menuData.categories || []);
          setItems(menuData.categories?.flatMap((c: any) => c.items) || []);
        }
        if (stickerData) setStickers(stickerData);
        
        const planId = s?.planId?.toUpperCase() || 'BASIC';
        if (planId === 'PREMIUM') {
          try {
            const o = await getOrders();
            setOrders(o || []);
          } catch (err) {
            console.error('Failed to fetch orders:', err);
          }
        }
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
  
  const daysLeft = sub?.expiresAt ? Math.ceil((new Date(sub.expiresAt).getTime() - now) / (1000 * 60 * 60 * 24)) : 0;
  const formattedExpiry = sub?.expiresAt ? new Date(sub.expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';



  const activeItemsCount = items.filter(i => i.isAvailable !== false).length;
  const hiddenItemsCount = items.length - activeItemsCount;
  
  const newOrdersCount = orders.filter(o => o.status === 'NEW').length;
  
  const pendingStickers = stickers.filter(s => s.status === 'PENDING').length;

  const publicUrl = qr?.qrId ? `${window.location.origin}/qr/${encodeURIComponent(qr.qrId)}` : profile?.menuSlug ? `${window.location.origin}/menu/${profile.menuSlug}` : '';

  const planFeatures = {
    BASIC: [
      { name: 'Digital Menu & QR Code', included: true },
      { name: 'Initial Menu Setup', included: true },
      { name: '1 Included Menu Edit', included: true },
      { name: 'Unlimited Menu Edits', included: false },
      { name: 'Premium UI Templates', included: false },
      { name: 'Customer Online Ordering', included: false },
      { name: 'Order Management Dashboard', included: false }
    ],
    INTERMEDIATE: [
      { name: 'Digital Menu & QR Code', included: true },
      { name: 'Initial Menu Setup', included: true },
      { name: 'Unlimited Menu Edits', included: true },
      { name: 'Premium UI Templates', included: true },
      { name: 'Customer Online Ordering', included: false },
      { name: 'Order Management Dashboard', included: false }
    ],
    PREMIUM: [
      { name: 'Digital Menu & QR Code', included: true },
      { name: 'Initial Menu Setup', included: true },
      { name: 'Unlimited Menu Edits', included: true },
      { name: 'Premium UI Templates', included: true },
      { name: 'Customer Online Ordering', included: true },
      { name: 'Order Management Dashboard', included: true }
    ]
  };

  const currentFeatures = planFeatures[planId as keyof typeof planFeatures] || planFeatures.BASIC;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12 px-4 md:px-8 pt-4 sm:pt-6">
      
      {/* Overview Hero */}
      <div className="bg-[#1d2723] rounded-2xl p-8 border border-[#2a3832] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 text-white/5 pointer-events-none">
          <Sparkles size={240} />
        </div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome, {profile?.businessName || 'Partner'}
          </h1>
          <p className="text-[#849a90] text-lg">
            {isActive ? 'Your digital operations are online.' : 'Your subscription has expired. Please renew to restore access.'}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 relative z-10 w-full md:w-auto">
          <a href={publicUrl} target="_blank" rel="noreferrer" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#25322d] hover:bg-[#2a3832] text-white border border-[#36473f] px-5 py-2.5 rounded-lg font-semibold transition-colors">
            <ExternalLink size={18} /> View Live Menu
          </a>
          <Link to="/app/menu" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#e8783c] hover:bg-[#f08b55] text-white px-5 py-2.5 rounded-lg font-semibold transition-colors shadow-lg shadow-[#e8783c]/20">
            <Edit3 size={18} /> Edit Menu
          </Link>
        </div>
      </div>

      {/* Subscription & Features Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left - Detailed Plan Status */}
        <div className="lg:col-span-1 bg-[#151c19] rounded-2xl p-6 border border-[#2a3832] flex flex-col relative overflow-hidden shadow-sm">
           <div className={`absolute top-0 left-0 w-full h-1 ${isActive ? 'bg-[#e8783c]' : 'bg-rose-500'}`}></div>
           <h3 className="text-sm font-bold text-[#849a90] tracking-wider uppercase mb-4">Current Plan</h3>
           
           <div className="flex items-end gap-2 mb-1">
             <span className="text-3xl font-black text-white">{planId}</span>
             <span className={`text-xs px-2 py-1 rounded font-bold mb-1 ${isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-500'}`}>
               {isActive ? 'ACTIVE' : 'EXPIRED'}
             </span>
           </div>
           
           <div className="text-sm text-[#849a90] mb-6">
             Expires on: <span className="text-white font-medium">{formattedExpiry}</span> ({daysLeft > 0 ? `${daysLeft} days left` : 'Expired'})
           </div>

           <div className="space-y-4 mb-6 flex-1">
             <div className="bg-[#1d2723] p-4 rounded-xl border border-[#2a3832]">
               <div className="text-xs text-[#849a90] uppercase tracking-wider font-bold mb-1">Menu Edits Used</div>
               <div className="text-xl font-bold text-white">
                 {sub?.contentChangesLimit === null ? 'Unlimited' : `${sub?.contentChangesUsed || 0} / ${sub?.contentChangesLimit || 0}`}
               </div>
             </div>
             
             {pendingStickers > 0 && (
                <div className="bg-[#1d2723] p-4 rounded-xl border border-[#2a3832] flex items-center justify-between">
                  <div>
                     <div className="text-xs text-[#849a90] uppercase tracking-wider font-bold mb-1">Pending Stickers</div>
                     <div className="text-xl font-bold text-white">{pendingStickers} Orders</div>
                  </div>
                  <Package className="text-[#e8783c]" size={24} />
                </div>
             )}
           </div>

           <Link to="/app/subscription" className={`w-full text-center py-3 rounded-lg font-bold transition-colors ${isActive ? 'bg-[#25322d] hover:bg-[#2a3832] text-white border border-[#36473f]' : 'bg-rose-500 hover:bg-rose-600 text-white'}`}>
              Renew / Upgrade Plan
           </Link>
        </div>

        {/* Right - Features Checklist */}
        <div className="lg:col-span-2 bg-[#1d2723] rounded-2xl p-6 border border-[#2a3832]">
           <h3 className="text-sm font-bold text-[#849a90] tracking-wider uppercase mb-5">Your Capabilities</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {currentFeatures.map((f, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${f.included ? 'bg-[#151c19] border-[#2a3832]' : 'bg-transparent border-transparent opacity-50'}`}>
                  {f.included ? <CheckCircle2 className="text-emerald-400 shrink-0" size={20} /> : <XCircle className="text-rose-500 shrink-0" size={20} />}
                  <span className={`text-sm font-semibold ${f.included ? 'text-white' : 'text-[#849a90]'}`}>{f.name}</span>
                </div>
             ))}
           </div>
           
           {planId !== 'PREMIUM' && (
             <div className="mt-6 p-4 bg-gradient-to-r from-[#e8783c]/10 to-transparent border border-[#e8783c]/20 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-bold mb-1">Want more features?</h4>
                    <p className="text-sm text-[#849a90]">Upgrade to Premium to unlock online ordering and reception management.</p>
                  </div>
                  <Link to="/app/subscription" className="hidden md:block bg-[#e8783c] hover:bg-[#f08b55] text-white px-4 py-2 rounded-lg font-bold text-sm">
                    Upgrade Now
                  </Link>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT - MENU SNAPSHOT */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1d2723] rounded-2xl border border-[#2a3832] overflow-hidden flex flex-col h-full">
            <div className="p-5 border-b border-[#2a3832] flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UtensilsCrossed size={18} className="text-[#849a90]" /> Menu Snapshot
              </h2>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-[#151c19] p-4 rounded-lg border border-[#2a3832]">
                  <div className="text-2xl font-bold text-white">{categories.length}</div>
                  <div className="text-xs text-[#849a90] font-semibold uppercase tracking-wider mt-1">Categories</div>
                </div>
                <div className="bg-[#151c19] p-4 rounded-lg border border-[#2a3832]">
                  <div className="text-2xl font-bold text-white">{items.length}</div>
                  <div className="text-xs text-[#849a90] font-semibold uppercase tracking-wider mt-1">Total Items</div>
                </div>
                <div className="bg-[#151c19] p-4 rounded-lg border border-[#2a3832]">
                  <div className="text-2xl font-bold text-emerald-400">{activeItemsCount}</div>
                  <div className="text-xs text-[#849a90] font-semibold uppercase tracking-wider mt-1">Live Today</div>
                </div>
                <div className="bg-[#151c19] p-4 rounded-lg border border-[#2a3832]">
                  <div className="text-2xl font-bold text-[#849a90]">{hiddenItemsCount}</div>
                  <div className="text-xs text-[#62756d] font-semibold uppercase tracking-wider mt-1">Hidden</div>
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-[#2a3832]">
                <Link to="/app/menu" className="w-full flex items-center justify-center gap-2 bg-[#25322d] hover:bg-[#2a3832] text-white border border-[#36473f] py-3 rounded-lg font-semibold transition-colors">
                  Open Menu Manager <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
          
          {/* PREMIUM ORDER CENTER */}
          {planId === 'PREMIUM' && (
            <div className="bg-gradient-to-br from-[#1d2723] to-[#25322d] rounded-2xl border border-[#e8783c]/30 overflow-hidden shadow-inner">
              <div className="p-5 border-b border-[#e8783c]/20 flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ChefHat size={18} className="text-[#e8783c]" /> Orders Today
                </h2>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-[#e8783c] bg-[#e8783c]/10 px-2 py-1 rounded-md">{newOrdersCount} NEW</span>
                  <Link to="/app/orders" className="text-sm text-[#e8783c] hover:text-[#f08b55] font-semibold">
                    Open Reception &rarr;
                  </Link>
                </div>
              </div>
              
              <div className="p-0">
                {orders.length > 0 ? (
                  <div className="divide-y divide-[#2a3832]">
                    {orders.slice(0, 3).map((o: any) => (
                      <div key={o.id} className="p-4 flex items-center justify-between hover:bg-[#151c19] transition-colors">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-bold text-sm">Table {o.tableNumber || 'N/A'}</span>
                            <span className="text-[#849a90] text-xs">#{String(o.id).substring(0,6)}</span>
                          </div>
                          <div className="text-sm text-[#849a90]">
                            {o.items?.length || 0} items • ₹{o.total}
                          </div>
                        </div>
                        <div>
                          {o.status === 'NEW' && <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[#e8783c]/10 text-[#e8783c] border border-[#e8783c]/20">NEW</span>}
                          {o.status === 'ACCEPTED' && <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">ACCEPTED</span>}
                          {o.status === 'IN_PROGRESS' && <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">PREPARING</span>}
                          {o.status === 'COMPLETED' && <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">COMPLETED</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-[#849a90]">
                    <p className="text-sm">No orders received yet today.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT - QR / LIVE PREVIEW */}
        <div className="bg-[#1d2723] rounded-2xl border border-[#2a3832] overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#2a3832]">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <QrCode size={18} className="text-[#849a90]" /> Universal QR Code
            </h2>
          </div>
          
          <div className="p-6 flex-1 flex flex-col items-center justify-center bg-[#151c19]/50 relative">
            {!qr?.qrId && !menu ? (
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-[#1d2723] rounded-full flex items-center justify-center border border-[#2a3832] mb-4">
                  <QrCode size={32} className="text-[#849a90]" />
                </div>
                <h3 className="text-white font-bold mb-2">Create Your Menu</h3>
                <p className="text-sm text-[#849a90] mb-6">You need to set up your menu before generating a QR code.</p>
                <Link to="/onboarding" className="inline-flex items-center justify-center gap-2 bg-[#e8783c] hover:bg-[#f08b55] text-white px-6 py-2.5 rounded-lg font-bold transition-colors">
                  Get Started
                </Link>
              </div>
            ) : !qr?.qrId ? (
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-[#1d2723] rounded-full flex items-center justify-center border border-[#2a3832] mb-4">
                  <QrCode size={32} className="text-[#e8783c]" />
                </div>
                <h3 className="text-white font-bold mb-2">Ready to Generate</h3>
                <p className="text-sm text-[#849a90] mb-6">Your menu is ready. Generate your permanent QR code now.</p>
                <Link to="/app/qr" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#e8783c] to-[#f08b55] hover:opacity-90 text-white shadow-lg shadow-[#e8783c]/20 px-6 py-2.5 rounded-lg font-bold transition-opacity">
                  Generate QR
                </Link>
              </div>
            ) : (
              <>
                <div className="w-44 h-44 bg-white rounded-xl p-3 shadow-2xl border border-white/10 mb-6 flex items-center justify-center">
                  <div className="w-full h-full relative" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 2px, transparent 4px)' }}>
                     <div className="absolute inset-2 bg-white flex items-center justify-center">
                        <QrCode size={90} className="text-[#151c19]" />
                     </div>
                  </div>
                </div>
                
                <p className="text-sm text-[#849a90] text-center font-medium mb-6">
                  This QR code never changes. <br/>You can print it once and use it forever.
                </p>
                
                <div className="w-full space-y-3 mt-auto">
                  <a href={publicUrl} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 bg-[#25322d] hover:bg-[#2a3832] text-white border border-[#36473f] py-3 rounded-lg text-sm font-bold transition-colors">
                     Open Preview
                  </a>
                  <Link to="/app/qr" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#e8783c] to-[#f08b55] hover:opacity-90 text-white shadow-lg shadow-[#e8783c]/20 py-3 rounded-lg text-sm font-bold transition-opacity">
                    <Download size={16} /> Get Print Files / Stickers
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
