import { reportMenuVisit } from '../../utils/menuHit';
import { useEffect, useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Clock3, 
  ShoppingCart, 
  X, 
  Plus, 
  Minus, 
  Star, 
  ExternalLink,
  UtensilsCrossed,
  Bike,
  Phone,
  ChevronRight,
  AlertTriangle,
  Trash2,
  Globe,
  CheckCircle2,
  Sparkles,
  BellRing,
  Droplets,
  Receipt,
  ConciergeBell,
  HandPlatter
} from 'lucide-react';

function InstagramIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
import { MenusQRBrand } from '../../components/brand/MenusQRBrand';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { 
  getClientByMenuSlug, 
  submitCustomerOrder, 
  submitCustomerOrderByQr, 
  getCustomerOrderStatus,
  type PublicMenuRecord,
  type CustomerOrder,
  type CreateCustomerOrderPayload
} from '../admin/clientStore';
import { useToast } from '../../components/feedback/ToastProvider';
import { themeFromPresetId } from '../../design-system/presets';
import { coerceTheme } from '../../design-system/validateTheme';
import { resolveTheme } from '../../design-system/resolveTheme';
import MenuTemplateRenderer from '../../components/menu-builder/MenuTemplateRenderer';
import { SEO } from '../../seo/SEO';
import GuestFeedbackCard from '../../components/customer/GuestFeedbackCard';
import VoiceWelcomeBanner from '../../components/customer/VoiceWelcomeBanner';
import './MenuPage.css';

export interface DiningSessionOrder {
  id: string;
  roundNumber: number;
  total: number;
  items: Array<{ id: string; name: string; quantity: number; price: number; variant?: string }>;
  status: string;
  createdAt: string;
}

export interface DiningSession {
  sessionId: string;
  slug: string;
  tableNumber: string;
  customerName: string;
  customerPhone: string;
  createdAt: number;
  expiresAt: number;
  orders: DiningSessionOrder[];
}

const DINING_SESSION_TTL_MS = 3.5 * 60 * 60 * 1000; // 3.5 hours auto-refresh window

export default function MenuPage() {
  const { slug } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const qrId = searchParams.get('qr');
  const tableParam = searchParams.get('table') || searchParams.get('t') || searchParams.get('tableNumber') || '';
  const showToast = useToast();

  // Anonymous once-a-day visit counter for the owner's analytics (QR scan vs direct link).
  useEffect(() => {
    if (slug) reportMenuVisit(slug, qrId ? 'qr' : 'direct');
  }, [slug, qrId]);

  const [menuResult, setMenuResult] = useState<{ slug: string; client?: PublicMenuRecord; error?: string }>();
  
  // Ordering State
  const [cart, setCart] = useState<{ id: string; name: string; quantity: number; price: number; variant?: string }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Order Type & Customer Details
  const [orderType, setOrderType] = useState<'DINE_IN' | 'DELIVERY'>(tableParam ? 'DINE_IN' : 'DINE_IN');
  const [tableNumber, setTableNumber] = useState(tableParam);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryLandmark, setDeliveryLandmark] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const idempotencyKeyRef = useRef<string>('');

  if (!idempotencyKeyRef.current) {
    idempotencyKeyRef.current = `idem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  // Active Order Live Tracking
  const [activeOrder, setActiveOrder] = useState<CustomerOrder | null>(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);

  // Multi-Round Table Dining Session (3.5 hours TTL)
  const [diningSession, setDiningSession] = useState<DiningSession | null>(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  // Live Second-by-Second Countdown Timer for Customer Order
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  // Table Service Request (Call Waiter / Water / Bill)
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isSendingService, setIsSendingService] = useState(false);
  const [lastServiceSentAt, setLastServiceSentAt] = useState<number>(0);
  

  const currentMenuResult = menuResult?.slug === slug ? menuResult : undefined;
  const client = currentMenuResult?.client;

  // Mirrors MenuTemplateRenderer's own theme resolution, so the page background behind the menu
  // never disagrees with the menu it is wrapping — including for presets the old static template
  // list never knew about (every new composable preset and all 3 Signature compositions).
  const pagePalette = useMemo(() => {
    const base = themeFromPresetId(client?.templateId);
    const theme = client?.theme ? coerceTheme(client.theme, base) : base;
    return resolveTheme(theme).palette;
  }, [client?.templateId, client?.theme]);

  // Strict plan gating: Customer ordering is exclusive to highest plan (Premium)
  const isPremium = Boolean(client?.orderingEnabled ?? (client?.plan?.toUpperCase() === 'PREMIUM'));
  const loadError = currentMenuResult?.error ?? '';
  const isLoading = Boolean(slug) && !currentMenuResult;

  // Restore saved cart & checkout details from localStorage
  useEffect(() => {
    if (!slug) return;
    try {
      const savedCart = localStorage.getItem(`menuqr_cart_${slug}`);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCart(parsed);
        }
      }
      const savedDetails = localStorage.getItem(`menuqr_checkout_${slug}`);
      if (savedDetails) {
        const parsed = JSON.parse(savedDetails);
        if (parsed.customerName && !customerName) setCustomerName(parsed.customerName);
        if (parsed.customerPhone && !customerPhone) setCustomerPhone(parsed.customerPhone);
        if (parsed.deliveryAddress && !deliveryAddress) setDeliveryAddress(parsed.deliveryAddress);
        if (parsed.deliveryLandmark && !deliveryLandmark) setDeliveryLandmark(parsed.deliveryLandmark);
        if (parsed.deliveryCity && !deliveryCity) setDeliveryCity(parsed.deliveryCity);
        if (parsed.orderType && !tableParam) setOrderType(parsed.orderType);
      }

      // Check 3.5h Dining Session
      const sessionKey = `menuqr_dining_session_${slug}`;
      const rawSession = localStorage.getItem(sessionKey);
      if (rawSession) {
        const parsedSession: DiningSession = JSON.parse(rawSession);
        if (parsedSession && typeof parsedSession.expiresAt === 'number') {
          if (Date.now() > parsedSession.expiresAt) {
            // Auto-refresh: 3.5 hours passed, start completely fresh
            localStorage.removeItem(sessionKey);
            setDiningSession(null);
          } else {
            setDiningSession(parsedSession);
            if (!tableParam && parsedSession.tableNumber) {
              setTableNumber(parsedSession.tableNumber);
              setOrderType('DINE_IN');
            }
            if (parsedSession.customerName && !customerName) setCustomerName(parsedSession.customerName);
            if (parsedSession.customerPhone && !customerPhone) setCustomerPhone(parsedSession.customerPhone);
          }
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, [slug, tableParam]);

  // Background check for 3.5 hour session expiration
  useEffect(() => {
    if (!slug || !diningSession) return;
    const checkExpiry = setInterval(() => {
      if (Date.now() > diningSession.expiresAt) {
        localStorage.removeItem(`menuqr_dining_session_${slug}`);
        setDiningSession(null);
        showToast('info', 'Your dining session has concluded (3.5h window completed).');
      }
    }, 60000);
    return () => clearInterval(checkExpiry);
  }, [slug, diningSession]);

  const finishDiningSession = () => {
    if (!slug) return;
    localStorage.removeItem(`menuqr_dining_session_${slug}`);
    sessionStorage.removeItem(`active_order_${slug}`);
    setDiningSession(null);
    setActiveOrder(null);
    setIsSessionModalOpen(false);
    showToast('info', 'Dining session completed. Thank you for dining with us!');
  };

  // Persist cart to localStorage
  useEffect(() => {
    if (!slug) return;
    try {
      if (cart.length > 0) {
        localStorage.setItem(`menuqr_cart_${slug}`, JSON.stringify(cart));
      } else {
        localStorage.removeItem(`menuqr_cart_${slug}`);
      }
    } catch {
      // Ignore storage errors
    }
  }, [cart, slug]);

  // Persist checkout details to localStorage
  useEffect(() => {
    if (!slug) return;
    try {
      localStorage.setItem(`menuqr_checkout_${slug}`, JSON.stringify({
        customerName,
        customerPhone,
        deliveryAddress,
        deliveryLandmark,
        deliveryCity,
        orderType
      }));
    } catch {
      // Ignore storage errors
    }
  }, [customerName, customerPhone, deliveryAddress, deliveryLandmark, deliveryCity, orderType, slug]);

  // Pre-fill city when client loads
  useEffect(() => {
    if (client?.city && !deliveryCity) {
      setDeliveryCity(client.city);
    }
  }, [client?.city, deliveryCity]);

  // Load existing active order from sessionStorage
  useEffect(() => {
    if (!slug) return;
    try {
      const saved = sessionStorage.getItem(`active_order_${slug}`);
      if (saved) {
        const parsed = JSON.parse(saved) as CustomerOrder;
        setActiveOrder(parsed);
      }
    } catch {
      // Ignore storage errors
    }
  }, [slug]);

  // Poll active order status with tracking token
  useEffect(() => {
    if (!activeOrder?.id) return;
    if (['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(activeOrder.status)) return;

    let isMounted = true;
    const pollInterval = setInterval(async () => {
      try {
        const latest = await getCustomerOrderStatus(activeOrder.id, activeOrder.trackingToken);
        if (!isMounted) return;
        setActiveOrder(latest);
        if (slug) {
          sessionStorage.setItem(`active_order_${slug}`, JSON.stringify(latest));
          // Sync live status with table dining session
          setDiningSession(prev => {
            if (!prev) return null;
            const updated = prev.orders.map(o => o.id === latest.id ? { ...o, status: latest.status } : o);
            const nextSession = { ...prev, orders: updated };
            try {
              localStorage.setItem(`menuqr_dining_session_${slug}`, JSON.stringify(nextSession));
            } catch {}
            return nextSession;
          });
        }
      } catch {
        // Silently retry
      }
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [activeOrder?.id, activeOrder?.status, activeOrder?.trackingToken, slug]);

  // Live countdown timer ticking down second-by-second (top-level hook)
  useEffect(() => {
    if (!activeOrder || !['ACCEPTED', 'PREPARING', 'IN_PROGRESS'].includes(activeOrder.status)) {
      setRemainingSeconds(null);
      return;
    }

    const calcRemaining = () => {
      let target: number | null = null;
      if (activeOrder.estimatedDeliveryTime) {
        target = new Date(activeOrder.estimatedDeliveryTime).getTime();
      } else if (activeOrder.estimatedTimeMinutes && activeOrder.time) {
        target = new Date(activeOrder.time).getTime() + activeOrder.estimatedTimeMinutes * 60 * 1000;
      }
      if (!target) return null;
      return Math.max(0, Math.floor((target - Date.now()) / 1000));
    };

    setRemainingSeconds(calcRemaining());
    const ticker = setInterval(() => {
      setRemainingSeconds(calcRemaining());
    }, 1000);

    return () => clearInterval(ticker);
  }, [activeOrder?.estimatedDeliveryTime, activeOrder?.estimatedTimeMinutes, activeOrder?.time, activeOrder?.status]);

  const addToCart = (item: any, priceStr?: string, variant?: string) => {
    if (!isPremium || !priceStr) return;
    const price = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
    if (isNaN(price)) return;

    setCart(prev => {
      const existing = prev.find(c => c.id === item.id && c.variant === variant);
      if (existing) {
        return prev.map(c => c === existing ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { id: item.id, name: item.name, quantity: 1, price, variant }];
    });
  };

  const removeFromCart = (id: string, variant?: string) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === id && c.variant === variant);
      if (!existing) return prev;
      if (existing.quantity > 1) {
        return prev.map(c => c === existing ? { ...c, quantity: c.quantity - 1 } : c);
      }
      return prev.filter(c => c !== existing);
    });
  };

  const deleteFromCart = (id: string, variant?: string) => {
    setCart(prev => prev.filter(c => !(c.id === id && c.variant === variant)));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getItemQuantity = (id: string, variant?: string): number => {
    if (!cart || cart.length === 0) return 0;
    if (variant) {
      const match = cart.find(c => c.id === id && c.variant === variant);
      return match ? match.quantity : 0;
    }
    const matches = cart.filter(c => c.id === id);
    return matches.reduce((sum, c) => sum + c.quantity, 0);
  };

  const placeOrder = async () => {
    if (isSubmitting) return;
    if (cart.length === 0) {
      showToast('info', 'Add at least one item to your order.');
      return;
    }

    const trimmedName = customerName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      showToast('error', 'Please enter your name (at least 2 characters).');
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!customerPhone.trim() || cleanPhone.length < 10) {
      showToast('error', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (orderType === 'DINE_IN') {
      if (!tableNumber.trim()) {
        showToast('error', 'Please enter your table number.');
        return;
      }
    } else {
      if (!deliveryAddress.trim() || deliveryAddress.trim().length < 5) {
        showToast('error', 'Please enter your full delivery address.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Determine multi-round table session
      let sessionIdToUse: string | null = null;
      let roundNumberToUse = 1;
      let parentOrderIdToUse: string | null = null;

      if (orderType === 'DINE_IN') {
        const isSameTable = diningSession && diningSession.tableNumber.trim().toLowerCase() === tableNumber.trim().toLowerCase();
        const isSessionValid = diningSession && Date.now() < diningSession.expiresAt && diningSession.orders.length > 0;

        if (isSameTable && isSessionValid) {
          sessionIdToUse = diningSession.sessionId;
          roundNumberToUse = diningSession.orders.length + 1;
          parentOrderIdToUse = diningSession.orders[0].id;
        } else {
          sessionIdToUse = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
          roundNumberToUse = 1;
          parentOrderIdToUse = null;
        }
      }

      const payload: CreateCustomerOrderPayload = {
        orderType,
        customerName: trimmedName,
        customerPhone: cleanPhone.slice(-10),
        tableNumber: orderType === 'DINE_IN' ? tableNumber.trim() : null,
        deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress.trim() : null,
        deliveryLandmark: orderType === 'DELIVERY' ? (deliveryLandmark.trim() || null) : null,
        deliveryCity: orderType === 'DELIVERY' ? (deliveryCity.trim() || null) : null,
        notes: notes.trim() || null,
        idempotencyKey: idempotencyKeyRef.current,
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        sessionId: sessionIdToUse,
        roundNumber: roundNumberToUse,
        parentOrderId: parentOrderIdToUse
      };

      const placed = qrId 
        ? await submitCustomerOrderByQr(qrId, payload)
        : await submitCustomerOrder(slug!, payload);

      setActiveOrder(placed);
      if (slug) {
        sessionStorage.setItem(`active_order_${slug}`, JSON.stringify(placed));
        localStorage.removeItem(`menuqr_cart_${slug}`);

        // Update or create 3.5-hour dining session
        if (orderType === 'DINE_IN' && sessionIdToUse) {
          const newOrderRecord: DiningSessionOrder = {
            id: placed.id,
            roundNumber: roundNumberToUse,
            total: placed.total,
            items: placed.items || cart,
            status: placed.status,
            createdAt: placed.time || new Date().toISOString()
          };

          const updatedOrders = (diningSession && diningSession.sessionId === sessionIdToUse)
            ? [...diningSession.orders, newOrderRecord]
            : [newOrderRecord];

          const newSession: DiningSession = {
            sessionId: sessionIdToUse,
            slug,
            tableNumber: tableNumber.trim(),
            customerName: trimmedName,
            customerPhone: cleanPhone.slice(-10),
            createdAt: diningSession?.createdAt || Date.now(),
            expiresAt: (diningSession?.createdAt || Date.now()) + DINING_SESSION_TTL_MS,
            orders: updatedOrders
          };

          localStorage.setItem(`menuqr_dining_session_${slug}`, JSON.stringify(newSession));
          setDiningSession(newSession);
        }
      }
      setCart([]);
      setIsCartOpen(false);
      setIsTrackerOpen(true);
      idempotencyKeyRef.current = `idem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      showToast('success', roundNumberToUse > 1 
        ? `Round ${roundNumberToUse} added to Table ${tableNumber.trim()}! Kitchen has been notified.`
        : 'Order placed successfully! The restaurant has been notified.');
    } catch (e: any) {
      showToast('error', e?.message || 'Your order did not go through. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendServiceRequest = async (requestType: 'WATER' | 'WAITER' | 'BILL') => {
    const effectiveTable = (diningSession?.tableNumber || tableNumber || tableParam || '').trim();
    if (!effectiveTable) {
      showToast('error', 'Please enter your table number to request service.');
      setIsServiceModalOpen(true);
      return;
    }
    const now = Date.now();
    if (now - lastServiceSentAt < 15000) {
      showToast('info', 'Your request was already received. Staff is on the way!');
      return;
    }
    setIsSendingService(true);
    try {
      const res = await fetch(`/api/public/menu/${slug}/service-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: effectiveTable,
          requestType,
          customerName: customerName || diningSession?.customerName || 'Guest'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not send service request');
      setLastServiceSentAt(now);
      const label = requestType === 'WATER' ? '💧 Drinking Water' : requestType === 'BILL' ? '🧾 Final Bill' : '🙋 Server Assistance';
      showToast('success', `🔔 ${label} requested for Table ${effectiveTable}! Staff has been notified.`);
      setIsServiceModalOpen(false);
    } catch (err: any) {
      showToast('error', err?.message || 'Could not send request. Please call staff directly.');
    } finally {
      setIsSendingService(false);
    }
  };

  useEffect(() => {
    let isCurrent = true;
    if (!slug) return;
    const initialMenu = (location.state as { publicMenu?: PublicMenuRecord } | null)?.publicMenu;
    if (initialMenu) {
      setMenuResult({ slug, client: initialMenu });
      return () => { isCurrent = false; };
    }
    void getClientByMenuSlug(slug).then((menu) => {
      if (!isCurrent) return;
      setMenuResult(menu
        ? { slug, client: menu }
        : { slug, error: 'This menu is unavailable. Check the link or contact the restaurant.' });
    }).catch((error: unknown) => {
      if (isCurrent) setMenuResult({ slug, error: error instanceof Error ? error.message : 'Could not load this menu.' });
    });
    return () => { isCurrent = false; };
  }, [location.state, slug]);

  const bespokeColors = (client?.accentConfiguration as { colors?: { bg?: string; text?: string } } | undefined)?.colors;
  const effectiveBg = bespokeColors?.bg || pagePalette.bg;
  const effectiveText = bespokeColors?.text || pagePalette.text;

  // Hooks must run on every render, so this lives above the early returns below. Placed after
  // them, the first loaded render called one more hook than the loading render and crashed the page.
  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = effectiveBg;
    return () => {
      document.body.style.backgroundColor = originalBg;
    };
  }, [effectiveBg]);

  if (loadError === 'SUBSCRIPTION_EXPIRED') {
    return (
      <div className="customer-menu menu-expired-lock">
        <header className="menu-topbar">
          <Link className="menu-wordmark" to={`/menu/${slug}#top`} aria-label="MenusQR menu">
            <MenusQRBrand size="sm" variant="light" className="scale-75 origin-left" />
          </Link>
        </header>
        <main className="menu-main menu-expired-main">
          <motion.div 
            className="menu-expired-content"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="menu-expired-icon-wrapper">
              <Clock3 size={42} strokeWidth={1.5} className="menu-expired-icon" />
            </div>
            <h2>Temporarily Unavailable</h2>
            <p>This menu is currently offline. Please check back later or contact the restaurant staff.</p>
          </motion.div>
        </main>

      </div>
    );
  }

  if (isLoading || loadError || !client) {
    return (
      <div className="customer-menu">
        <header className="menu-topbar"><Link className="menu-wordmark" to={`/menu/${slug}#top`} aria-label="MenusQR menu"><MenusQRBrand size="sm" variant="light" className="scale-75 origin-left" /></Link></header>
        <main id="top" className="menu-main"><div className="menu-empty-state" role={loadError ? 'alert' : 'status'}>{loadError || 'Preparing this menu…'}</div></main>
      </div>
    );
  }

  const categoriesForRenderer = (client.categories && client.categories.length > 0)
    ? client.categories.map((cat: { id?: string; name?: string; order?: number }, idx: number) => ({ id: cat.id || `cat-${idx}`, name: cat.name || String(cat), order: cat.order ?? idx }))
    : Array.from(new Set((client.menuItems || []).map((i) => i.category))).map((catName, idx) => ({
        id: `cat-${idx}`,
        name: catName,
        order: idx,
      }));

  const itemsForRenderer = (client.menuItems || []).map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description || '',
    price: item.price ? Number(item.price) : 0,
    halfPrice: item.halfPrice ? Number(item.halfPrice) : undefined,
    fullPrice: item.fullPrice ? Number(item.fullPrice) : undefined,
    pricingType: item.pricingType,
    variants: item.variants,
    category: item.category,
    dietType: (item.dietType === 'non-veg' ? 'non-veg' : item.dietType === 'vegan' ? 'vegan' : 'veg') as 'veg' | 'non-veg' | 'vegan',
    available: item.available !== false,
    image: item.image,
    focalX: item.focalX ?? undefined,
    focalY: item.focalY ?? undefined,
    tags: item.tags ?? null,
    soldOut: item.soldOut ?? false,
    isBestseller: Boolean(item.tags?.badges?.includes('bestseller')),
    isSpecial: Boolean(item.tags?.badges?.includes('special')),
  }));

  const cartTotalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartTotalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);



  const formatTimerClock = (secs: number | null) => {
    if (secs === null) return '';
    if (secs <= 0) return 'Plating & Serving Now!';
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem.toString().padStart(2, '0')}`;
  };

  const getFriendlyStatus = (status: string) => {
    switch (status) {
      case 'NEW': return { label: 'Received • Waiting for Kitchen', color: 'bg-amber-100 text-amber-900 border-amber-200' };
      case 'ACCEPTED': return { label: 'Accepted by Kitchen', color: 'bg-blue-100 text-blue-900 border-blue-200' };
      case 'PREPARING':
      case 'IN_PROGRESS': return { label: 'Cooking on Flame 🔥', color: 'bg-orange-100 text-orange-900 border-orange-200' };
      case 'READY': return { label: 'Plated & Ready to Serve', color: 'bg-purple-100 text-purple-900 border-purple-200' };
      case 'DELIVERED':
      case 'COMPLETED': return { label: 'Served at Table ✅', color: 'bg-emerald-100 text-emerald-900 border-emerald-200' };
      case 'CANCELLED': return { label: 'Declined', color: 'bg-rose-100 text-rose-900 border-rose-200' };
      default: return { label: status, color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  // Stepper helper for active order tracking
  const getStatusStep = (status: CustomerOrder['status']) => {
    switch (status) {
      case 'NEW': return 1;
      case 'ACCEPTED': return 2;
      case 'PREPARING':
      case 'IN_PROGRESS': return 3;
      case 'READY': return 4;
      case 'DELIVERED':
      case 'COMPLETED': return 5;
      default: return 1;
    }
  };

  const getStatusText = (status: CustomerOrder['status'], type?: string) => {
    switch (status) {
      case 'NEW': return 'Order Placed • Waiting for Restaurant';
      case 'ACCEPTED': return 'Accepted • Sent to Kitchen';
      case 'PREPARING':
      case 'IN_PROGRESS': return 'Cooking • Freshly being prepared';
      case 'READY': return type === 'DELIVERY' ? 'Packed • Out for Delivery' : 'Hot & Ready • Serving to Table';
      case 'DELIVERED':
      case 'COMPLETED': return type === 'DELIVERY' ? 'Delivered • Enjoy your meal!' : 'Served • Enjoy your meal!';
      case 'CANCELLED': return 'Order Cancelled';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300" style={{ backgroundColor: effectiveBg, color: effectiveText }}>
      <SEO 
        title={`${client?.businessName || 'Restaurant Menu'} | MenusQR`} 
        description={`Digital QR menu for ${client?.businessName || 'this restaurant'}.`} 
        canonicalUrl={`/menu/${slug}`} 
        index={false} 
      />
      <header className="px-4 py-3 border-b border-white/10 flex items-center justify-between backdrop-blur-md relative z-30 bg-black/40">
        <Link className="menu-wordmark flex items-center gap-2" to={`/menu/${slug}`} aria-label="MenusQR menu">
          <MenusQRBrand size="sm" variant="light" className="scale-75 origin-left" />
        </Link>
        <div className="flex items-center gap-3">
          {(client?.instagram || client?.facebook || client?.website) && (
            <div className="flex items-center gap-1.5 mr-1">
              {client.instagram && (
                <a
                  href={client.instagram.startsWith('http') ? client.instagram : `https://instagram.com/${client.instagram.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram profile"
                  className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-sm hover:scale-110 transition-transform"
                >
                  <InstagramIcon size={13} />
                </a>
              )}
              {client.facebook && (
                <a
                  href={client.facebook.startsWith('http') ? client.facebook : `https://facebook.com/${client.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook page"
                  className="w-7 h-7 rounded-full bg-[#1877F2] flex items-center justify-center text-white shadow-sm hover:scale-110 transition-transform"
                >
                  <FacebookIcon size={13} />
                </a>
              )}
              {client.website && (
                <a
                  href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Official Website"
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white shadow-sm hover:scale-110 transition-transform"
                >
                  <Globe size={13} />
                </a>
              )}
            </div>
          )}
          {client?.city && (
            <span className="text-xs font-mono opacity-80 flex items-center gap-1"><MapPin size={12} />{[client.city, client.state].filter(Boolean).join(', ')}</span>
          )}
        </div>
      </header>

      {/* Table Welcome Voice Greeting */}
      {Boolean(client?.accentConfiguration) && (
        <VoiceWelcomeBanner
          voiceGreeting={(client.accentConfiguration as any)?.voiceGreeting}
          restaurantName={client.businessName || 'the restaurant'}
        />
      )}

      <main className="flex-1 pb-28">
        <MenuTemplateRenderer
          templateId={client.templateId || 'royal-maharaja'}
          restaurant={{
            name: client.businessName,
            tagline: client.tagline,
            cuisine: (client as any).cuisine || client.category,
            phone: client.phone,
            address: client.address,
            city: client.city,
            logo: client.logoUrl,
          }}
          categories={categoriesForRenderer}
          items={itemsForRenderer}
          theme={client.theme}
          compact={false}
          onAddToCart={isPremium ? addToCart : undefined}
          onRemoveFromCart={isPremium ? removeFromCart : undefined}
          getItemQuantity={isPremium ? getItemQuantity : undefined}
          isPremium={isPremium}
          accentConfiguration={client.accentConfiguration}
        />
      </main>

      {/* Private Guest Feedback Section */}
      {slug && (
        <GuestFeedbackCard
          slug={slug}
          restaurantName={client.businessName || 'the restaurant'}
          initialTableNumber={tableParam || diningSession?.tableNumber || ''}
        />
      )}

      {/* Google Reviews Add-on Section */}
      {client.googleReviews?.enabled && client.googleReviews?.reviewUrl && (
        <section
          aria-label="Google Reviews"
          className="mx-auto my-10 max-w-sm px-4 text-center"
        >
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-lg transition-transform hover:scale-[1.01]">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/10 text-amber-400">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Share Your Experience
            </h3>
            <p className="mt-1 text-xs text-white/60">
              Enjoyed your dining at {client.businessName}? Leave an honest review on Google.
            </p>
            <a
              href={client.googleReviews.reviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Write a Google review for ${client.businessName} (opens in a new tab)`}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-2.5 text-xs font-semibold text-white transition-all duration-200 active:scale-95 shadow-sm"
            >
              <span>Write a Google Review</span>
              <ExternalLink size={13} className="opacity-70" />
            </a>
          </div>
        </section>
      )}

      <footer className="py-8 text-center text-xs opacity-80 border-t border-white/10 mt-12 mb-16 flex flex-col items-center gap-3">
        {(client.instagram || client.facebook || client.website) && (
          <div className="flex items-center justify-center gap-3 mb-2">
            {client.instagram && (
              <a
                href={client.instagram.startsWith('http') ? client.instagram : `https://instagram.com/${client.instagram.replace(/^@/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all text-xs font-semibold"
              >
                <InstagramIcon size={14} className="text-pink-400" />
                <span>Instagram</span>
              </a>
            )}
            {client.facebook && (
              <a
                href={client.facebook.startsWith('http') ? client.facebook : `https://facebook.com/${client.facebook}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all text-xs font-semibold"
              >
                <FacebookIcon size={14} className="text-blue-400" />
                <span>Facebook</span>
              </a>
            )}
            {client.website && (
              <a
                href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all text-xs font-semibold"
              >
                <Globe size={14} className="text-emerald-400" />
                <span>Website</span>
              </a>
            )}
          </div>
        )}
        <div>Prepared with care at <strong className="opacity-100">{client.businessName}</strong></div>
      </footer>

      {/* Active Table Dining Session Floating Pill */}
      {diningSession && diningSession.orders.length > 0 && !isSessionModalOpen && (
        <button
          type="button"
          onClick={() => setIsSessionModalOpen(true)}
          className={`table-session-pill ${cart.length > 0 ? 'with-cart-open' : ''}`}
          aria-label="View active table dining session"
        >
          <span className="table-session-dot" />
          <div className="flex flex-col text-left">
            <span className="font-bold text-white text-xs flex items-center gap-1.5">
              <UtensilsCrossed size={13} className="text-[#e8783c]" />
              Table {diningSession.tableNumber} • Round {diningSession.orders.length}
            </span>
            <span className="text-[11px] text-emerald-300 font-semibold mt-0.5 flex items-center gap-1.5">
              {remainingSeconds !== null && remainingSeconds > 0 ? (
                <span className="text-amber-300 font-black font-mono flex items-center gap-1">
                  <Clock3 size={11} className="animate-spin text-amber-400" style={{ animationDuration: '8s' }} />
                  Food in: {formatTimerClock(remainingSeconds)} •
                </span>
              ) : null}
              <span>Bill: ₹{diningSession.orders.reduce((sum, o) => sum + (o.total || 0), 0)} • View / Add</span>
            </span>
          </div>
          <ChevronRight size={14} className="opacity-70 ml-1 shrink-0 text-slate-300" />
        </button>
      )}

      {/* Active Order Floating Pill (Allows reopening the live status tracker) */}
      {activeOrder && !isTrackerOpen && !diningSession && (
        <button
          type="button"
          onClick={() => setIsTrackerOpen(true)}
          className="active-order-pill"
          aria-label="View active order status"
        >
          <span className="active-order-pill-dot" />
          <div className="flex flex-col text-left">
            <span>Active Order #{activeOrder.id}</span>
            {activeOrder.estimatedTimeMinutes && !['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(activeOrder.status) && (
              <span className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1 mt-0.5">
                <Clock3 size={11} /> {activeOrder.orderType === 'DELIVERY' ? `Delivery in ~${activeOrder.estimatedTimeMinutes}m` : `Ready in ~${activeOrder.estimatedTimeMinutes}m`}
              </span>
            )}
          </div>
          <ChevronRight size={14} className="opacity-70 ml-1 shrink-0" />
        </button>
      )}

      {/* Floating Table Service Bell (Water / Waiter / Bill) */}
      {isPremium && (
        <button
          type="button"
          onClick={() => setIsServiceModalOpen(true)}
          className={`table-service-bell-btn ${cart.length > 0 && !isCartOpen ? 'with-cart' : ''}`}
          aria-label="Request table service"
        >
          <BellRing size={15} className="text-[#e8783c] animate-pulse shrink-0" />
          <span>Call Waiter / Water</span>
        </button>
      )}

      {/* Modern Floating Bottom Cart Bar */}
      {isPremium && cart.length > 0 && !isCartOpen && (
        <div className="menu-floating-cart-bar">
          <div className="cart-bar-info">
            <div className="cart-bar-count">
              <ShoppingCart size={16} />
              <span>{cartTotalQuantity} {cartTotalQuantity === 1 ? 'item' : 'items'}</span>
            </div>
            <div className="cart-bar-price">₹{cartTotalAmount.toLocaleString('en-IN')}</div>
          </div>
          <button 
            type="button"
            className="cart-bar-action"
            onClick={() => setIsCartOpen(true)}
          >
            <span>View Cart</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Cart & Checkout Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div 
            className="menu-cart-modal-overlay" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
          >
            <motion.div 
              className="menu-cart-modal checkout-modal"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="menu-cart-header">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="m-0">Your Order</h3>
                    {cart.length > 0 && (
                      <button
                        type="button"
                        onClick={clearCart}
                        className="text-xs text-rose-500 hover:text-rose-600 font-semibold underline"
                      >
                        Clear Cart
                      </button>
                    )}
                  </div>
                  <span className="text-xs text-[#64748b] font-medium">Ordering from {client.businessName}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsCartOpen(false)} 
                  className="menu-cart-close"
                  aria-label="Close cart"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="menu-cart-content">
                {/* Order Type Selector Switch */}
                <div className="order-type-tabs">
                  <button
                    type="button"
                    className={`order-type-tab ${orderType === 'DINE_IN' ? 'active' : ''}`}
                    onClick={() => setOrderType('DINE_IN')}
                  >
                    <UtensilsCrossed size={16} />
                    <span>Dine-In (Table)</span>
                  </button>
                  <button
                    type="button"
                    className={`order-type-tab ${orderType === 'DELIVERY' ? 'active' : ''}`}
                    onClick={() => setOrderType('DELIVERY')}
                  >
                    <Bike size={16} />
                    <span>Delivery / Takeaway</span>
                  </button>
                </div>

                {/* Items in Cart */}
                <div className="menu-cart-items">
                  {cart.map((item) => (
                    <div key={`${item.id}-${item.variant || 'single'}`} className="menu-cart-item">
                      <div className="menu-cart-item-info">
                        <h4>{item.name}</h4>
                        {item.variant && <span className="item-variant">{item.variant}</span>}
                        <div className="item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                      </div>
                      <div className="menu-cart-item-controls">
                        <button 
                          type="button"
                          aria-label={`Remove one ${item.name}`} 
                          onClick={() => removeFromCart(item.id, item.variant)}
                        >
                          <Minus size={14} />
                        </button>
                        <span>{item.quantity}</span>
                        <button 
                          type="button"
                          aria-label={`Add one ${item.name}`} 
                          onClick={() => addToCart(item, `₹${item.price}`, item.variant)}
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Remove ${item.name} from cart`}
                          onClick={() => deleteFromCart(item.id, item.variant)}
                          className="p-1 text-slate-400 hover:text-rose-500 ml-1.5 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Customer Details Form based on Order Type */}
                <div className="order-form-section">
                  <div className="order-form-title">
                    {orderType === 'DINE_IN' ? <UtensilsCrossed size={14} /> : <Bike size={14} />}
                    <span>{orderType === 'DINE_IN' ? 'Dine-In Table Details' : 'Delivery Address & Contact'}</span>
                  </div>

                  {/* Dine-In specific: Table Number */}
                  {orderType === 'DINE_IN' && (
                    <div className="order-input-group">
                      <label className="order-input-label">Table Number *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Table 4, Corner Booth" 
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        className="order-input"
                      />
                    </div>
                  )}

                  {/* Customer Name */}
                  <div className="order-input-group">
                    <label className="order-input-label">Your Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Rahul Sharma" 
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="order-input"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="order-input-group">
                    <label className="order-input-label">Mobile Number *</label>
                    <input 
                      type="tel" 
                      placeholder="10-digit mobile number" 
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="order-input"
                      maxLength={15}
                    />
                  </div>

                  {/* Delivery Specific: Address, Landmark, City */}
                  {orderType === 'DELIVERY' && (
                    <>
                      <div className="order-input-group">
                        <label className="order-input-label">Full Delivery Address *</label>
                        <textarea 
                          placeholder="Flat / House No., Building Name, Street, Area" 
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          className="order-input order-textarea"
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="order-input-group">
                          <label className="order-input-label">Landmark</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Near Metro / Park" 
                            value={deliveryLandmark}
                            onChange={(e) => setDeliveryLandmark(e.target.value)}
                            className="order-input"
                          />
                        </div>
                        <div className="order-input-group">
                          <label className="order-input-label">City</label>
                          <input 
                            type="text" 
                            placeholder="City" 
                            value={deliveryCity}
                            onChange={(e) => setDeliveryCity(e.target.value)}
                            className="order-input"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Special Cooking or Delivery Notes */}
                  <div className="order-input-group">
                    <label className="order-input-label">Special Instructions (Optional)</label>
                    <input 
                      type="text" 
                      placeholder={orderType === 'DINE_IN' ? 'e.g. Less spicy, extra sauce' : 'e.g. Ring bell, leave at door'} 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="order-input"
                    />
                  </div>
                </div>

                {/* Active Table Dining Add-on Notice */}
                {orderType === 'DINE_IN' && diningSession && diningSession.orders.length > 0 && diningSession.tableNumber.trim().toLowerCase() === tableNumber.trim().toLowerCase() && (
                  <div className="mb-3.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5">
                      <span>🔔 Adding Round {diningSession.orders.length + 1} to Table {diningSession.tableNumber}</span>
                    </div>
                    <div className="text-amber-800 text-[11px] mt-1 leading-snug">
                      Previous Orders ({diningSession.orders.length}): ₹{diningSession.orders.reduce((sum, o) => sum + (o.total || 0), 0)} • This Round: ₹{cartTotalAmount}
                      <div className="font-bold text-amber-950 mt-0.5">
                        New Running Table Total: ₹{diningSession.orders.reduce((sum, o) => sum + (o.total || 0), 0) + cartTotalAmount}
                      </div>
                    </div>
                  </div>
                )}

                {/* Bill Summary */}
                <div className="menu-cart-summary">
                  <div className="summary-row">
                    <span>Items ({cartTotalQuantity})</span>
                    <span>₹{cartTotalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Grand Total</span>
                    <span className="text-[#e8783c]">₹{cartTotalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Reassuring Payment Notice - No Gateway, Pay on Delivery or Table */}
                <div className="my-3.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
                  <div className="p-1 rounded-full bg-emerald-100 text-emerald-600 shrink-0 mt-0.5">
                    <CheckCircle2 size={15} />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-slate-800">
                      {orderType === 'DELIVERY' ? '💵 Pay on Delivery (Cash / UPI Scanner)' : '🍽️ Pay at Counter / Table'}
                    </div>
                    <div className="text-slate-600 text-[11px] mt-0.5 leading-snug">
                      No online payment gateway needed. Simply place your order and pay directly to the restaurant or delivery partner upon receiving your food.
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <button 
                  type="button"
                  className="place-order-btn" 
                  onClick={placeOrder}
                  disabled={isSubmitting || cart.length === 0}
                >
                  {isSubmitting ? (
                    <span>Sending Order to Restaurant...</span>
                  ) : (
                    <>
                      <span>{
                        orderType === 'DINE_IN' && diningSession && diningSession.orders.length > 0 && diningSession.tableNumber.trim().toLowerCase() === tableNumber.trim().toLowerCase()
                          ? `Send Round ${diningSession.orders.length + 1} Dishes to Kitchen`
                          : (orderType === 'DELIVERY' ? 'Confirm Delivery Order (Pay After Delivery)' : 'Place Order (Pay After Meal)')
                      }</span>
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Table Dining Session & Multi-Round Bill Modal */}
      <AnimatePresence>
        {isSessionModalOpen && diningSession && (
          <motion.div
            className="menu-cart-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSessionModalOpen(false)}
          >
            <motion.div
              className="menu-cart-modal tracker-modal"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="menu-cart-header">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="m-0">Table {diningSession.tableNumber} Session</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                      Active
                    </span>
                  </div>
                  <span className="text-xs text-[#64748b]">
                    Dining at {client.businessName} • {diningSession.customerName || 'Guest'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSessionModalOpen(false)}
                  className="menu-cart-close"
                  aria-label="Close session details"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="order-tracker-content overflow-y-auto max-h-[75vh]">
                {/* Total Table Bill Summary Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-500/10 border border-emerald-500/30 flex items-center justify-between shadow-sm">
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Current Table Bill ({diningSession.orders.length} {diningSession.orders.length === 1 ? 'Round' : 'Rounds'})
                    </div>
                    <div className="text-2xl font-black text-emerald-700 mt-0.5">
                      ₹{diningSession.orders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Pay directly at table or counter when you finish dining.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSessionModalOpen(false);
                      setIsCartOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#e8783c] hover:bg-[#f08b55] text-white text-xs font-bold shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Add Dishes</span>
                  </button>
                </div>

                {/* Session Expiration & Auto-Refresh Notice */}
                <div className="my-3 p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock3 size={14} className="text-slate-500 shrink-0" />
                    <span>
                      Session active for ~{Math.max(1, Math.round((diningSession.expiresAt - Date.now()) / (60 * 1000)))} more mins.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={finishDiningSession}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 underline"
                  >
                    Finish Dining
                  </button>
                </div>

                {/* Multi-Round Order Breakdown */}
                <div className="space-y-3 mt-3">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Dishes Ordered by Round
                  </div>

                  {diningSession.orders.map((ord, idx) => (
                    <div key={ord.id || idx} className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-black text-xs">
                            Round {ord.roundNumber || idx + 1}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">#{ord.id}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-slate-800 text-sm">₹{ord.total}</span>
                          {(() => {
                            const statusInfo = getFriendlyStatus(ord.status);
                            return (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
                                {statusInfo.label}
                              </span>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="space-y-1">
                        {ord.items && ord.items.map((it, itemIdx) => (
                          <div key={itemIdx} className="flex justify-between text-xs text-slate-700">
                            <span className="font-medium">
                              {it.quantity}x {it.name} {it.variant ? `(${it.variant})` : ''}
                            </span>
                            <span className="text-slate-500 font-mono">₹{it.price * it.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Celebratory Google Review Prompt in Dining Session */}
                {client.googleReviews?.enabled && client.googleReviews?.reviewUrl && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-orange-500/10 border border-amber-300 text-center">
                    <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <div className="text-xs font-black text-slate-800">
                      Enjoying your dining at {client.businessName}?
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Your 5-star review helps our small kitchen team immensely!
                    </p>
                    <a
                      href={client.googleReviews.reviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#e8783c] text-white text-xs font-bold shadow-sm hover:opacity-95 transition-opacity"
                    >
                      <span>Rate 5 Stars on Google</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}

                {/* Bottom Actions */}
                <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={finishDiningSession}
                    className="flex-1 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                  >
                    Finish Dining & Leave
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSessionModalOpen(false);
                      setIsCartOpen(true);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#e8783c] hover:bg-[#f08b55] text-white text-xs font-bold transition-all shadow-sm"
                  >
                    + Add More to Round {diningSession.orders.length + 1}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Service Bell Request Modal (Call Waiter / Water / Bill) */}
      <AnimatePresence>
        {isServiceModalOpen && (
          <motion.div 
            className="menu-cart-modal-overlay" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsServiceModalOpen(false)}
          >
            <motion.div 
              className="menu-cart-modal !max-w-md"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="menu-cart-header">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-orange-500/15 text-[#e8783c] border border-orange-500/30">
                    <ConciergeBell size={20} />
                  </div>
                  <div>
                    <h3 className="m-0 text-base font-bold text-slate-900">Table Service Assistance</h3>
                    <span className="text-xs text-slate-500">Need help from our floor team?</span>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsServiceModalOpen(false)} 
                  className="menu-cart-close"
                  aria-label="Close service modal"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Table selector or indicator */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Your Table</span>
                    {(diningSession?.tableNumber || tableParam) ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                        Table {diningSession?.tableNumber || tableParam}
                      </span>
                    ) : (
                      <input
                        type="text"
                        placeholder="Table No. (e.g. 4)"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        className="w-28 px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:border-[#e8783c]"
                      />
                    )}
                  </div>
                </div>

                {/* Service Options */}
                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    type="button"
                    disabled={isSendingService}
                    onClick={() => handleSendServiceRequest('WATER')}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-sky-200 bg-sky-50/60 hover:bg-sky-100/80 transition-all text-left group disabled:opacity-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-sky-500 text-white shadow-sm group-hover:scale-105 transition-transform">
                        <Droplets size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">Drinking Water</div>
                        <div className="text-xs text-slate-500">Request fresh table water glasses</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-sky-700 bg-sky-100 px-2.5 py-1 rounded-lg">
                      Request 💧
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={isSendingService}
                    onClick={() => handleSendServiceRequest('WAITER')}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-orange-200 bg-orange-50/60 hover:bg-orange-100/80 transition-all text-left group disabled:opacity-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-[#e8783c] text-white shadow-sm group-hover:scale-105 transition-transform">
                        <HandPlatter size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">Call Waiter / Server</div>
                        <div className="text-xs text-slate-500">Staff will arrive at your table shortly</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2.5 py-1 rounded-lg">
                      Call 🙋
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={isSendingService}
                    onClick={() => handleSendServiceRequest('BILL')}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/80 transition-all text-left group disabled:opacity-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-sm group-hover:scale-105 transition-transform">
                        <Receipt size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">Request Final Bill</div>
                        <div className="text-xs text-slate-500">Get check ready for table / counter pay</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                      Bill 🧾
                    </span>
                  </button>
                </div>

                <div className="text-center text-[11px] text-slate-400">
                  ⚡ Notifies kitchen display and server handheld devices instantly.
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Order Status Tracking Modal */}
      <AnimatePresence>
        {isTrackerOpen && activeOrder && (
          <motion.div 
            className="menu-cart-modal-overlay" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsTrackerOpen(false)}
          >
            <motion.div 
              className="menu-cart-modal tracker-modal"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="menu-cart-header">
                <div>
                  <h3>Order Tracking</h3>
                  <span className="text-xs text-[#64748b]">Live updates from {activeOrder.restaurantName || client.businessName}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsTrackerOpen(false)} 
                  className="menu-cart-close"
                  aria-label="Close tracking"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="order-tracker-content overflow-y-auto max-h-[75vh]">
                <div className="order-tracker-header">
                  <div className={`order-tracker-badge ${activeOrder.status.toLowerCase()}`}>
                    <span>{activeOrder.status}</span>
                  </div>
                  <h4 className="order-tracker-title">{getStatusText(activeOrder.status, activeOrder.orderType)}</h4>
                  <div className="order-tracker-id">Order ID: #{activeOrder.id}</div>
                </div>

                {/* Live Countdown & Preparation Timer Card */}
                {activeOrder.status !== 'CANCELLED' && (
                  ['ACCEPTED', 'PREPARING', 'IN_PROGRESS'].includes(activeOrder.status) && remainingSeconds !== null ? (
                    <div className="my-3.5 p-5 rounded-2xl bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-emerald-500/15 border-2 border-[#e8783c]/50 text-center shadow-lg relative overflow-hidden">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8783c]/20 text-amber-300 text-xs font-black tracking-wide uppercase">
                        <Clock3 size={13} className="animate-spin" style={{ animationDuration: '6s' }} />
                        <span>{activeOrder.orderType === 'DELIVERY' ? '🛵 Food Arriving At Your Doorstep In' : `🍽️ Arriving at Table ${activeOrder.tableNumber || ''} In`}</span>
                      </div>

                      {/* Big Digital Countdown Clock */}
                      <div className="text-4xl sm:text-5xl font-black text-white mt-3 font-mono tracking-tight drop-shadow-md">
                        {formatTimerClock(remainingSeconds)}
                      </div>

                      {/* Animated Progress Bar */}
                      <div className="w-full bg-black/30 rounded-full h-2.5 mt-3 overflow-hidden border border-white/10">
                        <div 
                          className="bg-gradient-to-r from-[#e8783c] to-emerald-400 h-full rounded-full transition-all duration-1000 ease-linear"
                          style={{ 
                            width: `${Math.min(100, Math.max(8, 100 - (remainingSeconds / ((activeOrder.estimatedTimeMinutes || 20) * 60)) * 100))}%` 
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-300/80 font-medium mt-2 px-1">
                        <span>Chef Cooking on Flame 🔥</span>
                        {activeOrder.estimatedDeliveryTime && (
                          <span>Estimated by <strong>{new Date(activeOrder.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                        )}
                      </div>
                    </div>
                  ) : activeOrder.status === 'READY' ? (
                    <div className="my-3.5 p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-emerald-500/20 border-2 border-purple-500/40 text-center shadow-md animate-pulse">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/25 text-purple-200 text-xs font-black uppercase">
                        <Sparkles size={14} className="text-amber-300" />
                        <span>Hot & Freshly Plated!</span>
                      </div>
                      <div className="text-2xl font-black text-white mt-2">
                        {activeOrder.orderType === 'DELIVERY' ? 'Out for Delivery!' : `Serving to Table ${activeOrder.tableNumber || ''} Right Now!`}
                      </div>
                      <p className="text-xs text-purple-200/90 mt-1 font-medium">
                        Dishes are ready. Please get ready to enjoy your meal!
                      </p>
                    </div>
                  ) : activeOrder.status === 'NEW' ? (
                    <div className="my-3.5 p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-center">
                      <div className="text-xs text-amber-300 font-extrabold flex items-center justify-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                        <span>Order Received • Waiting for Kitchen Confirmation...</span>
                      </div>
                      <p className="text-[11px] text-amber-200/80 mt-1.5 leading-snug">
                        Our kitchen manager is reviewing your order. The live cooking timer will appear here in ~1-2 minutes.
                      </p>
                    </div>
                  ) : null
                )}

                {/* Visual Progress Stepper or Declined Alert */}
                {activeOrder.status === 'CANCELLED' ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-center my-4">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                      <AlertTriangle size={24} />
                    </div>
                    <h4 className="text-base font-extrabold text-rose-950">Order Declined</h4>
                    <p className="text-xs text-rose-800 mt-1 font-semibold">
                      {activeOrder.rejectionReason || 'The restaurant was unable to accept this order at this time.'}
                    </p>
                    <p className="text-[12px] text-rose-600/90 mt-2">
                      Please call the restaurant or choose alternative items from the menu.
                    </p>
                  </div>
                ) : (
                  <div className="order-stepper">
                    <div className={`stepper-step ${getStatusStep(activeOrder.status) >= 1 ? 'completed' : ''} ${getStatusStep(activeOrder.status) === 1 ? 'current' : ''}`}>
                      <span className="stepper-dot" />
                      <div className="stepper-title">Order Placed</div>
                      <div className="stepper-desc">Order sent to restaurant reception</div>
                    </div>

                    <div className={`stepper-step ${getStatusStep(activeOrder.status) >= 2 ? 'completed' : ''} ${getStatusStep(activeOrder.status) === 2 ? 'current' : ''}`}>
                      <span className="stepper-dot" />
                      <div className="stepper-title">Order Accepted</div>
                      <div className="stepper-desc">Kitchen staff confirmed the order</div>
                    </div>

                    <div className={`stepper-step ${getStatusStep(activeOrder.status) >= 3 ? 'completed' : ''} ${getStatusStep(activeOrder.status) === 3 ? 'current' : ''}`}>
                      <span className="stepper-dot" />
                      <div className="stepper-title">Cooking / Preparing</div>
                      <div className="stepper-desc">Your fresh food is on the flame</div>
                    </div>

                    <div className={`stepper-step ${getStatusStep(activeOrder.status) >= 4 ? 'completed' : ''} ${getStatusStep(activeOrder.status) === 4 ? 'current' : ''}`}>
                      <span className="stepper-dot" />
                      <div className="stepper-title">{activeOrder.orderType === 'DELIVERY' ? 'Out for Delivery' : 'Ready to Serve'}</div>
                      <div className="stepper-desc">{activeOrder.orderType === 'DELIVERY' ? 'Delivery partner is on the way' : 'Food is plated and hot'}</div>
                    </div>

                    <div className={`stepper-step ${getStatusStep(activeOrder.status) >= 5 ? 'completed' : ''} ${getStatusStep(activeOrder.status) === 5 ? 'current' : ''}`}>
                      <span className="stepper-dot" />
                      <div className="stepper-title">{activeOrder.orderType === 'DELIVERY' ? 'Delivered' : 'Served at Table'}</div>
                      <div className="stepper-desc">Bon appétit!</div>
                    </div>
                  </div>
                )}

                {/* Destination & Order Details */}
                <div className="order-detail-card">
                  <div className="order-detail-row">
                    <span className="order-detail-label">Service Type:</span>
                    <span className="order-detail-val">
                      {activeOrder.orderType === 'DELIVERY' ? '🛵 Home Delivery' : `🍽️ Dine-In (${activeOrder.tableNumber || 'Table'})`}
                    </span>
                  </div>

                  {activeOrder.orderType === 'DELIVERY' && activeOrder.deliveryAddress && (
                    <div className="order-detail-row">
                      <span className="order-detail-label">Deliver To:</span>
                      <span className="order-detail-val text-right max-w-[200px]">
                        {[activeOrder.deliveryAddress, activeOrder.deliveryLandmark, activeOrder.deliveryCity].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}

                  <div className="order-detail-row">
                    <span className="order-detail-label">Customer:</span>
                    <span className="order-detail-val">{activeOrder.customerName || 'Guest'} {activeOrder.customerPhone ? `(${activeOrder.customerPhone})` : ''}</span>
                  </div>

                  <div className="order-detail-row">
                    <span className="order-detail-label">Total Amount:</span>
                    <span className="order-detail-val text-emerald-600 font-extrabold">₹{activeOrder.total}</span>
                  </div>

                  <div className="order-detail-row">
                    <span className="order-detail-label">Payment:</span>
                    <span className="order-detail-val text-emerald-700 font-bold">
                      {activeOrder.orderType === 'DELIVERY' ? '💵 Pay on Delivery (Cash / UPI to Driver)' : '🍽️ Pay at Table / Counter'}
                    </span>
                  </div>

                  {/* Items summary */}
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ordered Items</div>
                    {activeOrder.items?.map((it: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-xs py-0.5 text-slate-700">
                        <span>{it.quantity}x {it.name} {it.variant ? `(${it.variant})` : ''}</span>
                        <span className="font-semibold">₹{it.price * it.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5-Star Google Review Prompt on Order Delivery / Completion */}
                {['DELIVERED', 'COMPLETED'].includes(activeOrder.status) && client.googleReviews?.enabled && client.googleReviews?.reviewUrl && (
                  <div className="my-4 p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-emerald-500/15 border-2 border-amber-400/50 text-center shadow-sm">
                    <div className="flex items-center justify-center gap-1 text-amber-400 mb-1.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={18} className="fill-amber-400 text-amber-400 animate-pulse" />
                      ))}
                    </div>
                    <h5 className="text-sm font-black text-slate-900">How was your meal?</h5>
                    <p className="text-xs text-slate-600 mt-1">
                      Loved the flavors? Please take 10 seconds to share your 5-star rating on Google!
                    </p>
                    <a
                      href={client.googleReviews.reviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-[#e8783c] text-white text-xs font-extrabold shadow-md hover:scale-[1.02] active:scale-95 transition-transform"
                    >
                      <Star size={14} className="fill-white" />
                      <span>Review on Google</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                )}

                {/* Action buttons */}
                <div className="order-actions-grid">
                  {(activeOrder.restaurantPhone || client.phone) && (
                    <a 
                      href={`tel:${activeOrder.restaurantPhone || client.phone}`}
                      className="btn-secondary"
                    >
                      <Phone size={15} />
                      <span>Call Restaurant</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsTrackerOpen(false)}
                    className="btn-secondary"
                  >
                    <UtensilsCrossed size={15} />
                    <span>Order More Items</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
