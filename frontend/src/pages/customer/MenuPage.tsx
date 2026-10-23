import { useEffect, useState, useRef } from 'react';
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
  CheckCircle2
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
import { menuTemplates } from '../../data/menuTemplates';
import MenuTemplateRenderer from '../../components/menu-builder/MenuTemplateRenderer';
import { SEO } from '../../seo/SEO';
import './MenuPage.css';

export default function MenuPage() {
  const { slug } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const qrId = searchParams.get('qr');
  const tableParam = searchParams.get('table') || searchParams.get('t') || searchParams.get('tableNumber') || '';
  const showToast = useToast();
  
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
  

  const currentMenuResult = menuResult?.slug === slug ? menuResult : undefined;
  const client = currentMenuResult?.client;

  const template = menuTemplates.find((option) => option.id === client?.templateId) ?? menuTemplates[0];
  
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
    } catch {
      // Ignore storage errors
    }
  }, [slug, tableParam]);

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
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
      };

      const placed = qrId 
        ? await submitCustomerOrderByQr(qrId, payload)
        : await submitCustomerOrder(slug!, payload);

      setActiveOrder(placed);
      if (slug) {
        sessionStorage.setItem(`active_order_${slug}`, JSON.stringify(placed));
        localStorage.removeItem(`menuqr_cart_${slug}`);
      }
      setCart([]);
      setIsCartOpen(false);
      setIsTrackerOpen(true);
      idempotencyKeyRef.current = `idem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      showToast('success', 'Order placed successfully! The restaurant has been notified.');
    } catch (e: any) {
      showToast('error', e?.message || 'Your order did not go through. Please try again.');
    } finally {
      setIsSubmitting(false);
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
  }));

  const cartTotalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartTotalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

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

  const bespokeColors = (client?.accentConfiguration as { colors?: { bg?: string; text?: string } } | undefined)?.colors;
  const effectiveBg = bespokeColors?.bg || template.colors.bg;
  const effectiveText = bespokeColors?.text || template.colors.text;

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300" style={{ backgroundColor: effectiveBg, color: effectiveText }}>
      <SEO 
        title={`${client?.businessName || 'Restaurant Menu'} | MenusQR`} 
        description={`Digital QR menu for ${client?.businessName || 'this restaurant'}.`} 
        canonicalUrl={`/menu/${slug}`} 
        index={false} 
      />
      <header className="px-4 py-3 border-b border-white/10 flex items-center justify-between backdrop-blur-md sticky top-0 z-40 bg-black/40">
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

      <main className="flex-1 pb-28">
        <MenuTemplateRenderer
          templateId={client.templateId || 'royal-maharaja'}
          restaurant={{
            name: client.businessName,
            tagline: client.tagline,
            phone: client.phone,
            address: client.address,
            city: client.city,
            logo: client.logoUrl,
          }}
          categories={categoriesForRenderer}
          items={itemsForRenderer}
          compact={false}
          onAddToCart={isPremium ? addToCart : undefined}
          onRemoveFromCart={isPremium ? removeFromCart : undefined}
          getItemQuantity={isPremium ? getItemQuantity : undefined}
          isPremium={isPremium}
          accentConfiguration={client.accentConfiguration}
        />
      </main>

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

      {/* Active Order Floating Pill (Allows reopening the live status tracker) */}
      {activeOrder && !isTrackerOpen && (
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
                      <span>{orderType === 'DELIVERY' ? 'Confirm Delivery Order (Pay After Delivery)' : 'Place Order (Pay After Meal)'}</span>
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
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

                {/* Estimated Delivery / Prep Time Notice */}
                {activeOrder.status !== 'CANCELLED' && (
                  activeOrder.estimatedTimeMinutes ? (
                    <div className="my-3.5 p-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border-2 border-emerald-500/30 text-center shadow-sm">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide uppercase">
                        <Clock3 size={13} />
                        <span>{activeOrder.orderType === 'DELIVERY' ? 'Order Delivery Time' : 'Kitchen Preparation Time'}</span>
                      </div>
                      <div className="text-3xl font-black text-emerald-300 mt-2 tracking-tight">
                        ~{activeOrder.estimatedTimeMinutes} Minutes
                      </div>
                      {activeOrder.estimatedDeliveryTime && (
                        <div className="text-xs text-emerald-200/90 font-medium mt-1">
                          Expected by: <strong>{new Date(activeOrder.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                        </div>
                      )}
                      <p className="text-[11px] text-slate-400 mt-1.5">
                        {activeOrder.orderType === 'DELIVERY'
                          ? 'Your fresh meal is being prepared and will be delivered within the estimated time.'
                          : 'Our chef is preparing your dishes hot and fresh for your table.'}
                      </p>
                    </div>
                  ) : activeOrder.status === 'NEW' ? (
                    <div className="my-3.5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-center">
                      <div className="text-xs text-amber-300 font-semibold flex items-center justify-center gap-1.5">
                        <Clock3 size={14} className="animate-pulse" />
                        <span>Restaurant is reviewing your order...</span>
                      </div>
                      <p className="text-[11px] text-amber-200/70 mt-1">
                        Preparation & delivery time will be updated here as soon as the restaurant accepts.
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
