import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, ChefHat, UtensilsCrossed, Clock3, Globe2, Phone, ShoppingCart, X, Plus, Minus } from 'lucide-react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { getClientByMenuSlug, submitCustomerOrder, submitCustomerOrderByQr, type PublicMenuRecord } from '../admin/clientStore';
import { useToast } from '../../components/feedback/ToastProvider';
import { menuTemplates } from '../../data/menuTemplates';
import './MenuPage.css';

const categoryPalette = ['#ff761a', '#ffc928', '#ff5e4d', '#34b56a', '#28a5a2', '#e56ea9', '#6785e6', '#a36be0', '#e7a52a', '#56a7dd'];

function App() {
  const { slug } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const qrId = searchParams.get('qr');
  const showToast = useToast();
  const [menuResult, setMenuResult] = useState<{ slug: string; client?: PublicMenuRecord; error?: string }>();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Ordering State
  const [cart, setCart] = useState<{ id: string; name: string; quantity: number; price: number; variant?: string }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [orderStatus, setOrderStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  
  const currentMenuResult = menuResult?.slug === slug ? menuResult : undefined;
  const client = currentMenuResult?.client;
  const template = menuTemplates.find((option) => option.id === client?.templateId) ?? menuTemplates[0];
  const isPremium = client?.plan?.toUpperCase() === 'PREMIUM';
  const loadError = currentMenuResult?.error ?? '';
  const isLoading = Boolean(slug) && !currentMenuResult;

  const addToCart = (item: any, priceStr: string, variant?: string) => {
    if (!isPremium) return;
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

  const placeOrder = async () => {
    if (!tableNumber) {
      showToast('info', 'Enter your table number to place the order.');
      return;
    }
    if (cart.length === 0) {
      showToast('info', 'Add at least one dish to your order.');
      return;
    }
    setOrderStatus('submitting');
    try {
      const order = {
        tableNumber,
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
      };
      if (qrId) await submitCustomerOrderByQr(qrId, order);
      else await submitCustomerOrder(slug!, order);
      setOrderStatus('success');
      setCart([]);
      setTimeout(() => {
        setIsCartOpen(false);
        setOrderStatus('idle');
      }, 3000);
    } catch (e) {
      showToast('error', 'Your order did not go through. Please try again in a moment.');
      setOrderStatus('idle');
    }
  };

  useEffect(() => {
    let isCurrent = true;
    if (!slug) {
      return;
    }
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

  const menuItems = (client?.menuItems ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price ? `₹${Number(item.price).toLocaleString('en-IN')}` : '',
      pricingType: item.pricingType || 'single',
      halfPrice: item.halfPrice ? `₹${Number(item.halfPrice).toLocaleString('en-IN')}` : '',
      fullPrice: item.fullPrice ? `₹${Number(item.fullPrice).toLocaleString('en-IN')}` : '',
      regPrice: item.regPrice ? `₹${Number(item.regPrice).toLocaleString('en-IN')}` : '',
      medPrice: item.medPrice ? `₹${Number(item.medPrice).toLocaleString('en-IN')}` : '',
      largePrice: item.largePrice ? `₹${Number(item.largePrice).toLocaleString('en-IN')}` : '',
      category: item.category,
      type: item.dietType,
      img: item.image,
    }));
  const categories = ['All', ...new Set(menuItems.map((item) => item.category))];
  const categoryColors = new Map(categories.slice(1).map((category, index) => [
    category,
    categoryPalette[index] ?? `hsl(${(index * 137.508) % 360} 80% 70%)`,
  ]));

  const filteredItems = menuItems.filter((item) => {
    const categoryMatch = activeCategory === 'All' ? true : item.category === activeCategory;
    const searchMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });
    const heroImage = client?.heroImage
      || menuItems.find((item) => item.img)?.img
      || '';
  
    const renderDish = (item: any) => {
      const itemColor = categoryColors.get(item.category) ?? '#ff761a';
      return (
        <motion.div
          key={item.id}
          layout
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.28 }}
          className="menu-dish"
          style={{ '--dish-bg': template.colors.surface, '--dish-ink': template.colors.text, '--dish-accent': template.colors.accent, '--dish-line': template.colors.border, '--category-color': itemColor } as React.CSSProperties}
        >
          <div className="menu-dish-info">
            <h3 className="menu-dish-title">{item.name}</h3>
            {item.description && <p className="menu-dish-description" title={item.description}>{item.description}</p>}
            
            {item.pricingType === 'single' && <button type="button" className="menu-dish-price-btn" onClick={() => addToCart(item, item.price)} disabled={!isPremium}>{item.price}{isPremium && <Plus size={14} style={{ marginLeft: '4px' }} />}</button>}
            {item.pricingType === 'half-full' && (
              <div className="menu-dish-price-variants">
                {item.halfPrice && <button type="button" className="menu-dish-price-btn" onClick={() => addToCart(item, item.halfPrice, 'Half')} disabled={!isPremium}><span className="variant-label">Half</span> {item.halfPrice}{isPremium && <Plus size={14} style={{ marginLeft: '4px' }} />}</button>}
                {item.fullPrice && <button type="button" className="menu-dish-price-btn" onClick={() => addToCart(item, item.fullPrice, 'Full')} disabled={!isPremium}><span className="variant-label">Full</span> {item.fullPrice}{isPremium && <Plus size={14} style={{ marginLeft: '4px' }} />}</button>}
              </div>
            )}
            {item.pricingType === 'sizes' && (
              <div className="menu-dish-price-variants">
                {item.regPrice && <button type="button" className="menu-dish-price-btn" onClick={() => addToCart(item, item.regPrice, 'Reg')} disabled={!isPremium}><span className="variant-label">Reg</span> {item.regPrice}{isPremium && <Plus size={14} style={{ marginLeft: '4px' }} />}</button>}
                {item.medPrice && <button type="button" className="menu-dish-price-btn" onClick={() => addToCart(item, item.medPrice, 'Med')} disabled={!isPremium}><span className="variant-label">Med</span> {item.medPrice}{isPremium && <Plus size={14} style={{ marginLeft: '4px' }} />}</button>}
                {item.largePrice && <button type="button" className="menu-dish-price-btn" onClick={() => addToCart(item, item.largePrice, 'Lrg')} disabled={!isPremium}><span className="variant-label">Lrg</span> {item.largePrice}{isPremium && <Plus size={14} style={{ marginLeft: '4px' }} />}</button>}
              </div>
            )}
          </div>
          <div className="menu-dish-image-container">
            <div className="menu-dish-image-wrap">
              {item.img ? <img
                src={item.img}
                alt={item.name}
                className="menu-dish-image"
                loading="lazy"
              /> : <div className="menu-dish-image-placeholder" aria-hidden="true"><UtensilsCrossed size={32} strokeWidth={1.5} /></div>}
            </div>
          </div>
        </motion.div>
      );
    };

    if (loadError === 'SUBSCRIPTION_EXPIRED') {
    return (
      <div className="customer-menu menu-expired-lock">
        <header className="menu-topbar">
          <Link className="menu-wordmark" to={`/menu/${slug}#top`} aria-label="MenusQR menu">
            <span className="menu-brand-icon"><ChefHat size={19} strokeWidth={2} /></span>
            <span>Menus<span className="menu-brand-accent">QR</span></span>
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
        <header className="menu-topbar"><Link className="menu-wordmark" to={`/menu/${slug}#top`} aria-label="MenusQR menu"><span className="menu-brand-icon"><ChefHat size={19} strokeWidth={2} /></span><span>Menus<span className="menu-brand-accent">QR</span></span></Link></header>
        <main id="top" className="menu-main"><div className="menu-empty-state" role={loadError ? 'alert' : 'status'}>{loadError || 'Preparing this menu…'}</div></main>
      </div>
    );
  }

  return (
    <div className="customer-menu" style={{
      '--menu-bg': template.colors.bg,
      '--menu-surface': template.colors.surface,
      '--menu-ink': template.colors.text,
      '--menu-muted': template.colors.secondary,
      '--menu-accent': template.colors.accent,
      '--menu-line': template.colors.border,
      '--menu-heading': template.colors.heading,
      '--font-heading': template.typography.heading,
      '--font-body': template.typography.body,
    } as React.CSSProperties}>
      <header className="menu-topbar">
        <Link className="menu-wordmark" to={`/menu/${slug}#top`} aria-label="MenusQR menu">
          <span className="menu-brand-icon"><ChefHat size={19} strokeWidth={2} /></span>
          <span>Menus<span className="menu-brand-accent">QR</span></span>
        </Link>
        {client?.city && (
          <span className="menu-location"><MapPin size={14} />{[client.city, client.state].filter(Boolean).join(', ')}</span>
        )}
      </header>

      <main id="top" className="menu-main">
        <motion.section
          className="menu-hero"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          style={{ background: template.colors.bg, color: template.colors.text }}
        >
          <div className="menu-hero-text">
            <div className="menu-hero-badge">{client.category.replace(/s$/, '')}</div>
            <h1>{client.businessName}</h1>
            {client.city && <p>{`Made with love in ${client.city}`}</p>}
            <div className="menu-hero-stats">
              <span className="menu-hero-stat">🍽️ {menuItems.length} Dishes</span>
            </div>
          </div>
          <div className="menu-hero-visual">
            <div className="menu-hero-visual-bg"></div>
            {heroImage ? <img className="menu-hero-image-new" src={heroImage} alt="Featured dish" /> : <div className="menu-hero-image-placeholder" aria-hidden="true"><ChefHat size={54} strokeWidth={1.4} /></div>}
          </div>
        </motion.section>

        {(client.address || client.phone || client.openingHours || client.services.length > 0 || client.website) && (
          <section className="menu-business-details" aria-label="Business details">
            {(client.address || client.city || client.state) && <div className="menu-business-detail"><MapPin size={16} aria-hidden="true" /><span>{[client.address, client.city, client.state].filter(Boolean).join(', ')}</span></div>}
            {client.phone && <a className="menu-business-detail" href={`tel:${client.phone.replace(/[^\d+]/g, '')}`}><Phone size={16} aria-hidden="true" /><span>{client.phone}</span></a>}
            {client.openingHours && <div className="menu-business-detail"><Clock3 size={16} aria-hidden="true" /><span>{client.openingHours}</span></div>}
            {client.services.length > 0 && <div className="menu-business-services">{client.services.map((service) => <span key={service}>{service}</span>)}</div>}
            {client.website && <a className="menu-business-detail" href={client.website} target="_blank" rel="noreferrer"><Globe2 size={16} aria-hidden="true" /><span>Website</span></a>}
          </section>
        )}

        <section className="menu-controls" aria-label="Find dishes">
          <div className="menu-section-heading">
            <div>
              <span className="menu-eyebrow menu-eyebrow-light">FRESH FROM OUR KITCHEN</span>
              <h2>Explore the menu</h2>
            </div>
            <span className="menu-result-count">{filteredItems.length} {filteredItems.length === 1 ? 'dish' : 'dishes'}</span>
          </div>

          <label className="menu-search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              placeholder="Find your favourite dish"
              aria-label="Search menu items"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </label>

          <div className="menu-categories" role="group" aria-label="Filter by category">
          {categories.map((cat, index) => (
            <motion.button
              key={cat}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.045 }}
              onClick={() => setActiveCategory(cat)}
              className={`menu-category ${activeCategory === cat ? 'is-active' : ''}`}
              aria-pressed={activeCategory === cat}
            >
              {cat}
            </motion.button>
          ))}
          </div>
        </section>

        <section className="menu-dishes-container" aria-label="Menu dishes">
          <AnimatePresence mode="popLayout">
            {activeCategory === 'All' ? (
              categories.slice(1).map(cat => {
                const groupItems = filteredItems.filter(i => i.category === cat);
                if (groupItems.length === 0) return null;
                return (
                  <div key={cat} className="menu-category-group">
                    <h2 className="menu-category-title" style={{ color: template.colors.heading }}>{cat}</h2>
                    <div className="menu-dishes-grid">
                      {groupItems.map(item => renderDish(item))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="menu-dishes-grid">
                {filteredItems.map(item => renderDish(item))}
              </div>
            )}
          </AnimatePresence>

          {filteredItems.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="menu-empty-state">
              <UtensilsCrossed size={24} />
              <p>No dishes found. Try another search.</p>
            </motion.div>
          )}
        </section>
        <footer className="menu-footer">Prepared with care at <strong>{client.businessName}</strong></footer>
      </main>

      {/* Cart Button */}
      {isPremium && cart.length > 0 && (
        <button aria-label={`Open order cart, ${cart.reduce((sum, item) => sum + item.quantity, 0)} pieces`} className="menu-cart-fab" onClick={() => setIsCartOpen(true)}>
          <ShoppingCart size={24} />
          <span className="menu-cart-count">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
        </button>
      )}

      {/* Cart Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="menu-cart-modal-overlay">
            <motion.div 
              className="menu-cart-modal"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="menu-cart-header">
                <h3>Your Order</h3>
                <button onClick={() => setIsCartOpen(false)} className="menu-cart-close"><X size={24} /></button>
              </div>

              {orderStatus === 'success' ? (
                <div className="menu-cart-success">
                  <div className="success-icon">✓</div>
                  <h4>Order Placed Successfully!</h4>
                  <p>Your food is being prepared.</p>
                </div>
              ) : (
                <div className="menu-cart-content">
                  <div className="menu-cart-items">
                    {cart.map((item) => (
                      <div key={`${item.id}-${item.variant || 'single'}`} className="menu-cart-item">
                        <div className="menu-cart-item-info">
                          <h4>{item.name}</h4>
                          {item.variant && <span className="item-variant">{item.variant}</span>}
                          <div className="item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                        </div>
                        <div className="menu-cart-item-controls">
                          <button aria-label={`Remove one ${item.name}`} onClick={() => removeFromCart(item.id, item.variant)}><Minus size={16} /></button>
                          <span>{item.quantity}</span>
                          <button aria-label={`Add one ${item.name}`} onClick={() => addToCart(item, `₹${item.price}`, item.variant)}><Plus size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="menu-cart-summary">
                    <div className="summary-row total">
                      <span>Total</span>
                      <span>₹{cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="menu-cart-actions">
                    <input 
                      type="text" 
                      placeholder="Table Number" 
                      aria-label="Table number"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="table-input"
                    />
                    <button 
                      className="place-order-btn" 
                      onClick={placeOrder}
                      disabled={orderStatus === 'submitting'}
                    >
                      {orderStatus === 'submitting' ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
