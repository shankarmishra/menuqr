import { useState, useEffect, Suspense } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePlan } from '../lib/usePlan';
import { Menu, LayoutDashboard, UtensilsCrossed, Palette, QrCode, CreditCard, Settings, LogOut, User, Bell, ChevronRight, Store, ShoppingBag, BarChart3, Receipt } from 'lucide-react';
import { getProfile } from '../pages/app/appStore';
import { MenusQRBrand } from '../components/brand/MenusQRBrand';
import clsx from 'clsx';
import BillingLockedPage from '../components/subscription/BillingLockedPage';
import CheckoutDrawer from '../components/subscription/CheckoutDrawer';
import { useOrderUsage } from '../lib/useOrderUsage';

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [restaurantName, setRestaurantName] = useState('Loading...');
  const [packDrawerOpen, setPackDrawerOpen] = useState(false);
  const { logout } = useAuth();
  const { sub, can, contentChangesRemaining, subState, loading } = usePlan();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getProfile().then(p => setRestaurantName(p.businessName || 'Your Restaurant')).catch(() => setRestaurantName('Restaurant Dashboard'));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const planId = sub?.planId?.toUpperCase() || 'BASIC';
  const isTrial = sub?.status?.toUpperCase() === 'TRIAL';
  // Trial over or plan lapsed: every /app page shows the billing page instead.
  const isLocked = !loading && subState === 'expired';
  const isActive = !isLocked && (sub?.status === 'ACTIVE' || isTrial);
  // Online-order limit: only restaurants that take online orders see usage and the buy-more prompt.
  const { usage: orderUsage, refresh: refreshOrderUsage } = useOrderUsage(!loading && !isLocked && can('customer_ordering'));
  const showOrderBanner = Boolean(orderUsage && orderUsage.used >= Math.ceil(orderUsage.limit * 0.8));
  const trialDaysLeft = isTrial && sub?.expiresAt
    ? Math.max(0, Math.ceil((new Date(sub.expiresAt).getTime() - Date.now()) / 86_400_000))
    : null;

  const navGroups = isLocked ? [
    {
      title: 'ACCOUNT',
      items: [{ to: '/app/subscription', icon: CreditCard, label: 'Billing' }],
    },
  ] : [
    {
      title: 'CONSOLE',
      items: [
        { to: '/app/dashboard', icon: LayoutDashboard, label: 'Home' },
        { to: '/app/menu', icon: UtensilsCrossed, label: 'Menu' },
        { to: '/app/appearance', icon: Palette, label: 'Design' },
        { to: '/app/restaurant', icon: Store, label: 'Restaurant' },
        { to: '/app/qr', icon: QrCode, label: 'QR & Print' },
        { to: '/app/analytics', icon: BarChart3, label: 'Insights' },
      ]
    },
    ...(can('reception_orders') ? [{
      title: 'OPERATIONS',
      items: [
        { to: '/app/orders', icon: ShoppingBag, label: 'Orders' },
        { to: '/app/cashier', icon: Receipt, label: 'Cashier' }
      ]
    }] : []),
    {
      title: 'ACCOUNT',
      items: [
        { to: '/app/subscription', icon: CreditCard, label: 'Account & Plan' },
        { to: '/app/settings', icon: Settings, label: 'Settings' },
      ]
    }
  ];

  const SidebarContent = () => (
    <>
      <div className="flex items-center h-16 px-6 border-b border-white/5">
        <MenusQRBrand size="sm" variant="light" className="scale-90 origin-left" />
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scrollbar-hide">
        {navGroups.map((group) => (
          <div key={group.title}>
            <h3 className="px-3 text-xs font-bold text-[#87958e] uppercase tracking-wider mb-3">{group.title}</h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group',
                      isActive
                        ? 'bg-gradient-to-r from-[#e8783c]/10 to-transparent text-[#e8783c] shadow-[inset_2px_0_0_#e8783c]'
                        : 'text-[#aab7b2] hover:bg-white/5 hover:text-white'
                    )
                  }
                >
                  <item.icon className={clsx("mr-3 h-5 w-5 transition-colors", location.pathname === item.to ? "text-[#e8783c]" : "text-[#87958e] group-hover:text-white")} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex w-full items-center px-3 py-2.5 rounded-lg text-sm font-semibold text-[#aab7b2] hover:bg-rose-500/10 hover:text-rose-400 transition-colors group"
        >
          <LogOut className="mr-3 h-5 w-5 text-[#87958e] group-hover:text-rose-400 transition-colors" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#0a100d] text-[#fcfaf8] font-sans flex overflow-hidden print:bg-white print:overflow-visible">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex print:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex w-[280px] flex-col bg-[#151c19] border-r border-white/5 animate-in slide-in-from-left">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-[260px] bg-[#151c19] border-r border-white/5 shrink-0 z-20 print:hidden">
        <SidebarContent />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 relative print:overflow-visible">
        {/* Top Bar */}
        <header className="h-16 shrink-0 bg-[#0a100d]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 md:px-8 z-10 print:hidden">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 -ml-2 text-[#aab7b2] hover:text-white">
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
              <Store className="text-[#87958e] hidden sm:block" size={18} />
              <span className="font-bold text-white tracking-wide">{restaurantName}</span>
              <ChevronRight size={14} className="text-white/20 mx-1 hidden sm:block" />
              <div className="flex items-center gap-1.5">
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-white/5 text-[#aab7b2] border border-white/10">{planId}</span>
                {isTrial && isActive ? (
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20">FREE TRIAL</span>
                ) : isActive ? (
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ACTIVE</span>
                ) : (
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">EXPIRED</span>
                )}
                {planId === 'BASIC' && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#e8783c]/10 text-[#e8783c] border border-[#e8783c]/20">
                    {contentChangesRemaining} left
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2 text-[#aab7b2] hover:text-white hover:bg-white/5 rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#e8783c] rounded-full border border-[#0a100d]"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#e8783c] to-[#FFC928] flex items-center justify-center text-white shadow-sm cursor-pointer ml-1">
              <User size={16} />
            </div>
          </div>
        </header>

        {isTrial && isActive && trialDaysLeft !== null && (
          <div className="shrink-0 flex flex-col gap-2 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-100 sm:flex-row sm:items-center sm:justify-between md:px-8 print:hidden">
            <span>
              <strong>Free trial:</strong> {trialDaysLeft === 0 ? 'ends today' : `${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} left`}. Choose a plan to keep your menu running.
            </span>
            <NavLink to="/app/subscription" className="self-start rounded-lg bg-amber-400 px-3 py-1 text-xs font-bold text-[#1a1408] hover:bg-amber-300 sm:self-auto">
              Choose a plan
            </NavLink>
          </div>
        )}

        {showOrderBanner && orderUsage && (
          <div
            role={orderUsage.exceeded ? 'alert' : 'status'}
            className={`shrink-0 flex flex-col gap-2 border-b px-4 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between md:px-8 print:hidden ${
              orderUsage.exceeded
                ? 'border-rose-500/30 bg-rose-500/15 text-rose-100'
                : 'border-amber-500/20 bg-amber-500/10 text-amber-100'
            }`}
          >
            <span>
              {orderUsage.exceeded
                ? <><strong>Order limit reached:</strong> customers can't place new online orders ({orderUsage.used} of {orderUsage.limit} used this month).</>
                : <><strong>{orderUsage.used} of {orderUsage.limit}</strong> online orders used this month.</>}
            </span>
            <button
              type="button"
              onClick={() => setPackDrawerOpen(true)}
              className={`self-start rounded-lg px-3 py-1 text-xs font-bold sm:self-auto ${
                orderUsage.exceeded ? 'bg-rose-400 text-[#2a0a0a] hover:bg-rose-300' : 'bg-amber-400 text-[#1a1408] hover:bg-amber-300'
              }`}
            >
              Buy {orderUsage.packSize} more · ₹{orderUsage.packPrice}
            </button>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#0a100d] print:bg-white print:overflow-visible print:p-0">
          <div className="w-full h-full">
            {/* Wait for the plan status before mounting a page, so a locked account never fires page requests. */}
            {loading && !sub ? (
              <div className="flex h-64 items-center justify-center" role="status" aria-live="polite">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#aab7b2]/20 border-t-[#e8783c]" />
              </div>
            ) : isLocked ? <BillingLockedPage restaurantName={restaurantName} /> : <Suspense fallback={
              <div className="flex h-64 items-center justify-center text-sm text-[#aab7b2]" role="status" aria-live="polite">
                <div className="flex items-center gap-2.5">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#aab7b2]/20 border-t-[#e8783c]" />
                  <span>Loading section...</span>
                </div>
              </div>
            }>
              <Outlet />
            </Suspense>}
          </div>
        </main>
      </div>
      <CheckoutDrawer
        isOpen={packDrawerOpen}
        onClose={() => {
          setPackDrawerOpen(false);
          refreshOrderUsage();
        }}
        initialAction="orders"
        currentPlanId={sub?.planId || 'PREMIUM'}
        expiresAt={sub?.expiresAt}
        startedAt={sub?.startedAt}
        onPlanUpdated={refreshOrderUsage}
      />
    </div>
  );
}
