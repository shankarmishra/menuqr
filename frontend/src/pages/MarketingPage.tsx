import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ChefHat, QrCode, ArrowRight, ChevronDown,
  Smartphone, Utensils, Settings, Palette,
  Menu as MenuIcon, X, Search, Coffee, UtensilsCrossed,
  Store, ConciergeBell, ShoppingBag, Check, RefreshCw,
  Send, Eye, type LucideIcon,
} from 'lucide-react';
import './MarketingPage.css';

/* ── Animation Curve Constants ───────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

function Section({
  children, alt, id, className = '',
}: { children: React.ReactNode; alt?: boolean; id?: string; className?: string }) {
  return (
    <section id={id} className={`${alt ? 'mkt-section-alt' : ''} ${className}`}>
      <div className="mkt-section">
        {children}
      </div>
    </section>
  );
}

/* ── REUSABLE PHOTOREALISTIC IPHONE 16 PRO COMPONENT ─────────── */
function IPhone16ProFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="iphone-frame">
      <div className="iphone-notch">
        <div className="iphone-lens" />
      </div>
      <div className="iphone-glare" />
      <div className="iphone-screen">
        {children}
      </div>
    </div>
  );
}

/* ── LOTTIE-STYLE ANIMATED QR SCANNER COMPONENT ───────────────── */
function LottieStyleQRScanner() {
  const prefersReduced = useReducedMotion();

  return (
    <div className="lottie-qr-container">
      {/* 4 Animated Viewfinder Corner Brackets */}
      <div className="lottie-qr-viewfinder">
        <motion.div
          className="lottie-qr-corner lottie-qr-corner-tl"
          animate={prefersReduced ? {} : { scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="lottie-qr-corner lottie-qr-corner-tr"
          animate={prefersReduced ? {} : { scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />
        <motion.div
          className="lottie-qr-corner lottie-qr-corner-bl"
          animate={prefersReduced ? {} : { scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        />
        <motion.div
          className="lottie-qr-corner lottie-qr-corner-br"
          animate={prefersReduced ? {} : { scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        />
      </div>

      {/* Laser Scanning Line */}
      <motion.div
        className="lottie-scan-laser-line"
        animate={prefersReduced ? {} : { top: ['5%', '92%', '5%'] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Radar Expansion Wave */}
      <motion.div
        className="lottie-radar-pulse"
        animate={prefersReduced ? {} : { scale: [0.3, 1.4], opacity: [0.8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
      />

      {/* Center High-Contrast QR Code */}
      <QrCode size={90} color="#151c19" strokeWidth={1.5} />
    </div>
  );
}

/* ── REUSABLE 3D ACRYLIC PLACARD COMPONENT ───────────────────── */
function AcrylicQRPlacard({ title = 'TABLE 04', name = 'GreenBite Cafe', tagline = 'Scan for Digital Menu' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="mkt-qr-placard-3d">
        <div className="mkt-qr-placard-header">
          <ChefHat size={16} />
          <span>{title}</span>
        </div>
        <LottieStyleQRScanner />
        <div className="mkt-qr-placard-footer">
          <div className="mkt-qr-placard-name">{name}</div>
          <div className="mkt-qr-placard-tagline">{tagline}</div>
        </div>
      </div>
      <div className="mkt-qr-stand-base" />
    </div>
  );
}

/* ── IPHONE DYNAMIC ISLAND FLOATING PILL HEADER ─────────────── */
function Header() {
  const [open, setOpen] = useState(false);

  return (
    <div className="iphone-navbar-wrapper">
      <div className="iphone-navbar-pill">
        {/* Brand Mark & Title */}
        <Link className="iphone-nav-logo" to="/" aria-label="MenuQR home">
          <span className="iphone-nav-logo-mark"><ChefHat size={18} strokeWidth={2} /></span>
          Menu<span style={{ color: '#e8783c' }}>QR</span>
        </Link>

        {/* Dynamic Island Status Badge */}
        <div className="iphone-dynamic-island-badge">
          <span className="iphone-dynamic-dot" />
          <span>Menu Live</span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="iphone-nav-links iphone-nav-links-desktop">
          <a href="#how-it-works" className="iphone-nav-link">How It Works</a>
          <a href="#templates" className="iphone-nav-link">Templates</a>
          <a href="#pricing" className="iphone-nav-link">Pricing</a>
          <Link to="/admin/login" className="iphone-nav-link">Login</Link>
          <Link to="/admin/login" className="iphone-nav-cta">Get Started</Link>
        </nav>

        {/* Mobile Hamburger / Toggle */}
        <button
          className="iphone-mobile-toggle-btn"
          onClick={() => setOpen(!open)}
          aria-label="Toggle Navigation"
        >
          {open ? <X size={18} /> : <MenuIcon size={18} />}
        </button>
      </div>

      {/* Mobile Dynamic Island Expansion Card */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="iphone-mobile-menu-card"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <a href="#how-it-works" className="iphone-mobile-menu-item" onClick={() => setOpen(false)}>
              <span>How It Works</span>
              <ArrowRight size={16} color="#e8783c" />
            </a>
            <a href="#templates" className="iphone-mobile-menu-item" onClick={() => setOpen(false)}>
              <span>Templates</span>
              <ArrowRight size={16} color="#e8783c" />
            </a>
            <a href="#pricing" className="iphone-mobile-menu-item" onClick={() => setOpen(false)}>
              <span>Pricing</span>
              <ArrowRight size={16} color="#e8783c" />
            </a>
            <Link to="/admin/login" className="iphone-mobile-menu-item" onClick={() => setOpen(false)}>
              <span>Login</span>
              <ArrowRight size={16} color="#e8783c" />
            </Link>
            <Link
              to="/admin/login"
              className="iphone-nav-cta"
              style={{ width: '100%', textAlign: 'center', display: 'block', marginTop: 6 }}
              onClick={() => setOpen(false)}
            >
              Get Started
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── 01: CINEMATIC HERO ──────────────────────────────────────── */
function HeroSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="mkt-hero">
      <div className="mkt-hero-inner">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.p variants={fadeUp} className="mkt-kicker">Permanent QR · Dynamic Menu</motion.p>
          <motion.h1 variants={fadeUp}>
            Your menu changes.<br />Your QR <em>doesn't.</em>
          </motion.h1>
          <motion.p variants={fadeUp} className="mkt-hero-sub">
            Build a digital menu your customers can scan. Update prices, items, and categories anytime —
            the same permanent QR keeps working forever.
          </motion.p>
          <motion.div variants={fadeUp} className="mkt-hero-actions">
            <Link to="/admin/login" className="mkt-btn-primary">Create Your Menu <ArrowRight size={18} /></Link>
            <a href="#how-it-works" className="mkt-btn-ghost">See How It Works</a>
          </motion.div>
        </motion.div>

        <motion.div
          className="mkt-hero-composite"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Acrylic QR Stand */}
          <motion.div
            animate={prefersReduced ? {} : { y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <AcrylicQRPlacard name="GreenBite Bistro" tagline="Table 04 · Scan Menu" />
          </motion.div>

          {/* Animated Laser Scan Beam */}
          <motion.div
            className="mkt-scan-beam-laser"
            animate={prefersReduced ? {} : { top: ['20%', '80%', '20%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Photorealistic iPhone 16 Pro */}
          <motion.div
            style={{ position: 'absolute', right: '-10px', bottom: '-10px' }}
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, type: 'spring' }}
          >
            <IPhone16ProFrame>
              <div className="mkt-phone-menu-header">
                <div className="mkt-phone-menu-avatar"><ChefHat size={14} /></div>
                <span className="mkt-phone-menu-name">GreenBite Bistro</span>
              </div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: 9, padding: '2px 6px', background: '#e8783c', color: '#fff', borderRadius: 10, fontWeight: 600 }}>All</span>
                <span style={{ fontSize: 9, padding: '2px 6px', background: '#1d2723', color: '#7a8a82', borderRadius: 10 }}>Starters</span>
                <span style={{ fontSize: 9, padding: '2px 6px', background: '#1d2723', color: '#7a8a82', borderRadius: 10 }}>Mains</span>
              </div>
              <div className="mkt-phone-menu-items">
                {[
                  { name: 'Paneer Tikka', price: '₹280', tag: '🟢 Veg' },
                  { name: 'Butter Chicken', price: '₹380', tag: '🔴 Non-Veg' },
                  { name: 'Dal Makhani', price: '₹220', tag: '🟢 Veg' },
                  { name: 'Garlic Naan', price: '₹60', tag: '🟢 Veg' },
                ].map((item) => (
                  <div className="mkt-phone-menu-item" key={item.name}>
                    <div>
                      <div className="mkt-phone-menu-item-name">{item.name}</div>
                      <div style={{ fontSize: 8, color: '#7a8a82' }}>{item.tag}</div>
                    </div>
                    <span className="mkt-phone-menu-item-price">{item.price}</span>
                  </div>
                ))}
              </div>
            </IPhone16ProFrame>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── 02: ONE QR, COUNTLESS UPDATES ───────────────────────────── */
function UpdateDemoSection() {
  const prices = ['₹280', '₹320', '₹350'];
  const [priceIdx, setPriceIdx] = useState(0);
  const [published, setPublished] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setPriceIdx((i) => {
        const next = (i + 1) % prices.length;
        setPublished(false);
        setTimeout(() => setPublished(true), 800);
        return next;
      });
    }, 3500);
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <Section alt id="update-demo">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
        <motion.p variants={fadeUp} className="mkt-kicker">Live Menu Updates</motion.p>
        <motion.h2 variants={fadeUp} className="mkt-h2">One QR. Countless updates.</motion.h2>
        <motion.p variants={fadeUp} className="mkt-body">
          Change a price in the restaurant panel. Hit publish. Your customer's menu updates instantly — same QR, new content.
        </motion.p>
      </motion.div>
      <motion.div
        className="mkt-update-demo"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{ marginTop: 40 }}
      >
        {/* Dashboard Editor */}
        <div className="mkt-editor-panel">
          <div className="mkt-editor-panel-header">
            <span className="mkt-editor-panel-title">
              <Settings size={18} color="#e8783c" /> Restaurant Panel Editor
            </span>
            <span style={{ fontSize: 11, background: '#e8783c20', color: '#e8783c', padding: '4px 8px', borderRadius: 4, fontWeight: 600 }}>LIVE DEMO</span>
          </div>
          <div className="mkt-editor-row">
            <span className="mkt-editor-label">Paneer Tikka Special</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={prices[priceIdx]}
                className="mkt-editor-value"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {prices[priceIdx]}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="mkt-editor-row">
            <span className="mkt-editor-label">Butter Chicken Curry</span>
            <span className="mkt-editor-value">₹380</span>
          </div>
          <motion.div
            className="mkt-editor-publish-btn"
            animate={published ? { scale: [1, 1.03, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Send size={15} /> {published ? 'Published to Menu ✓' : 'Updating Price...'}
          </motion.div>
        </div>

        {/* Live Phone Screen */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <IPhone16ProFrame>
            <div className="mkt-phone-menu-header">
              <div className="mkt-phone-menu-avatar"><ChefHat size={14} /></div>
              <span className="mkt-phone-menu-name">Live Customer View</span>
            </div>
            <div className="mkt-phone-menu-items">
              <div className="mkt-phone-menu-item">
                <div>
                  <span className="mkt-phone-menu-item-name">Paneer Tikka Special</span>
                  <div style={{ fontSize: 8, color: '#34b56a' }}>🟢 Chef's Recommendation</div>
                </div>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={published ? prices[priceIdx] : 'old'}
                    className="mkt-phone-menu-item-price"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {published ? prices[priceIdx] : prices[(priceIdx + prices.length - 1) % prices.length]}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="mkt-phone-menu-item">
                <span className="mkt-phone-menu-item-name">Butter Chicken Curry</span>
                <span className="mkt-phone-menu-item-price">₹380</span>
              </div>
            </div>
          </IPhone16ProFrame>
          <div className="mkt-qr-badge">
            <div className="mkt-qr-badge-icon"><QrCode size={24} /></div>
            <div>
              <div className="mkt-qr-badge-label">✓ SAME QR — NO REPRINT</div>
              <div className="mkt-qr-badge-sublabel">QR identity remains 100% stable after menu edit</div>
            </div>
          </div>
        </div>
      </motion.div>
    </Section>
  );
}

/* ── 03: PHYSICAL QR → DIGITAL MENU ──────────────────────────── */
function PhysicalQRSection() {
  return (
    <Section id="scan-demo">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} style={{ textAlign: 'center' }}>
        <motion.p variants={fadeUp} className="mkt-kicker">From Table to Screen</motion.p>
        <motion.h2 variants={fadeUp} className="mkt-h2">Physical QR. Digital menu.</motion.h2>
        <motion.p variants={fadeUp} className="mkt-body" style={{ margin: '0 auto 48px' }}>
          A single scan bridges the physical world and your digital experience.
        </motion.p>
      </motion.div>
      <motion.div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        {/* Acrylic Stand */}
        <AcrylicQRPlacard name="Royal Dine" tagline="Table 12 · Scan Menu" />

        {/* Scan Arrow */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#e8783c' }}>
          <motion.div
            style={{ width: 80, height: 2, background: 'linear-gradient(90deg, #e8783c, #ffc928)' }}
            animate={{ scaleX: [0.6, 1, 0.6], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#7a8a82' }}>INSTANT SCAN</span>
        </div>

        {/* iPhone Viewport */}
        <IPhone16ProFrame>
          <div className="mkt-phone-menu-header">
            <div className="mkt-phone-menu-avatar"><ChefHat size={14} /></div>
            <span className="mkt-phone-menu-name">Royal Dine</span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <span className="mkt-customer-filter active" style={{ fontSize: 10, padding: '4px 10px' }}>All</span>
            <span className="mkt-customer-filter" style={{ fontSize: 10, padding: '4px 10px' }}>Starters</span>
            <span className="mkt-customer-filter" style={{ fontSize: 10, padding: '4px 10px' }}>Main</span>
          </div>
          <div className="mkt-phone-menu-items">
            {[
              { n: 'Paneer Tikka', p: '₹280' },
              { n: 'Butter Naan', p: '₹60' },
              { n: 'Dal Makhani', p: '₹220' },
              { n: 'Gulab Jamun', p: '₹120' },
            ].map((i) => (
              <div className="mkt-phone-menu-item" key={i.n}>
                <span className="mkt-phone-menu-item-name" style={{ fontSize: 9 }}>{i.n}</span>
                <span className="mkt-phone-menu-item-price" style={{ fontSize: 9 }}>{i.p}</span>
              </div>
            ))}
          </div>
        </IPhone16ProFrame>
      </motion.div>
    </Section>
  );
}

/* ── 04: BUILT FOR THE TABLE ─────────────────────────────────── */
const contexts: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: UtensilsCrossed, title: 'Dining Table', desc: 'Acrylic QR placard at every table. Guests scan and browse before ordering.' },
  { icon: Coffee, title: 'Cafe Counter', desc: 'Display your QR at the counter for quick mobile browsing while waiting.' },
  { icon: ConciergeBell, title: 'Reception', desc: 'Let guests explore the menu while waiting for their table.' },
  { icon: ShoppingBag, title: 'Takeaway Area', desc: 'Customers scan and decide their order before reaching the counter.' },
  { icon: Store, title: 'Outdoor Seating', desc: 'Weather-resistant QR stands for garden and terrace dining.' },
];

function BuiltForTableSection() {
  return (
    <Section alt>
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
        <motion.p variants={fadeUp} className="mkt-kicker">Real Restaurant Use Cases</motion.p>
        <motion.h2 variants={fadeUp} className="mkt-h2">Built for every surface.</motion.h2>
        <motion.p variants={fadeUp} className="mkt-body">
          From fine dining to street food — your permanent QR works wherever your customers are.
        </motion.p>
      </motion.div>
      <div className="mkt-contexts-grid" style={{ marginTop: 40 }}>
        {contexts.map(({ icon: Icon, title, desc }, i) => (
          <motion.div
            key={title}
            className="mkt-context-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <div className="mkt-context-icon"><Icon size={24} /></div>
            <h3 className="mkt-context-title">{title}</h3>
            <p className="mkt-context-desc">{desc}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ── 05: TEMPLATE GALLERY (10 DISTINCT STRUCTURAL LAYOUTS) ────── */
const templates = [
  { name: '1. Minimal', bg: '#151c19', accent: '#e8783c', text: '#fff', style: 'Serif elegance, high whitespace' },
  { name: '2. Luxury', bg: '#0d0d0d', accent: '#ffc928', text: '#f5e6d0', style: 'Gold foil accents, script font' },
  { name: '3. Modern', bg: '#0f1923', accent: '#3b82f6', text: '#e2e8f0', style: 'Bold sans, special chef badges' },
  { name: '4. Cafe', bg: '#f5f0e8', accent: '#8b6914', text: '#3d2e1a', style: 'Parchment dual-column drinks' },
  { name: '5. Indian', bg: '#1c0f0a', accent: '#e85d3c', text: '#fde8d0', style: 'Royal crimson, veg indicators' },
  { name: '6. Fine Dining', bg: '#0a0a0a', accent: '#d4af37', text: '#f0ead6', style: 'Tasting course sequence' },
  { name: '7. Bakery', bg: '#faf4ee', accent: '#b5651d', text: '#3d2e1a', style: 'Grid cards, pastry tags' },
  { name: '8. Premium Dark', bg: '#1e293b', accent: '#34b56a', text: '#f8fafc', style: 'Slate charcoal high-density' },
  { name: '9. Classic', bg: '#f8f6f0', accent: '#2d5016', text: '#1a1a1a', style: 'Bistro double-line borders' },
  { name: '10. Image-Heavy', bg: '#1a0520', accent: '#e040fb', text: '#f3e5f5', style: 'Craving photography emphasis' },
];

function TemplateGallerySection() {
  return (
    <Section id="templates">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} style={{ textAlign: 'center' }}>
        <motion.p variants={fadeUp} className="mkt-kicker">10 Unique Templates</motion.p>
        <motion.h2 variants={fadeUp} className="mkt-h2">Your menu. Your style.</motion.h2>
        <motion.p variants={fadeUp} className="mkt-body" style={{ margin: '0 auto' }}>
          Every template has its own structure, typography, and character — not just different colors.
        </motion.p>
      </motion.div>
      <div className="mkt-templates-scroll" style={{ marginTop: 40 }}>
        {templates.map((t, i) => (
          <motion.div
            key={t.name}
            className="mkt-template-card"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <div
              className="mkt-template-preview"
              style={{ background: t.bg, color: t.text }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, color: t.accent, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {t.style}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Restaurant Menu</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                {['Starters', 'Main Course', 'Desserts'].map((cat) => (
                  <div key={cat} style={{ padding: '8px 10px', background: `${t.accent}18`, borderRadius: 6, fontSize: 11 }}>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{cat}</div>
                    <div style={{ opacity: 0.7, fontSize: 10 }}>₹199 – ₹499</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mkt-template-label">{t.name}</div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ── 06: DASHBOARD DEMO ──────────────────────────────────────── */
const dashTabs = ['Dashboard', 'Menu Editor', 'Appearance', 'QR Center'];

function DashboardDemoSection() {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveTab((i) => (i + 1) % dashTabs.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <Section alt>
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} style={{ textAlign: 'center' }}>
        <motion.p variants={fadeUp} className="mkt-kicker">Restaurant Panel</motion.p>
        <motion.h2 variants={fadeUp} className="mkt-h2">Everything in one place.</motion.h2>
      </motion.div>
      <motion.div
        className="mkt-browser-frame"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{ marginTop: 40 }}
      >
        <div className="mkt-browser-bar">
          <div className="mkt-browser-dot" style={{ background: '#ff5f56' }} />
          <div className="mkt-browser-dot" style={{ background: '#ffbd2e' }} />
          <div className="mkt-browser-dot" style={{ background: '#27c93f' }} />
          <div className="mkt-browser-url">menuqr.in/app/{dashTabs[activeTab].toLowerCase().replace(' ', '-')}</div>
        </div>
        <div className="mkt-browser-content">
          <div className="mkt-demo-label">Demo Preview</div>
          <div className="mkt-dash-tabs">
            {dashTabs.map((tab, i) => (
              <button key={tab} className={`mkt-dash-tab${i === activeTab ? ' active' : ''}`} onClick={() => setActiveTab(i)}>
                {tab}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              {activeTab === 0 && (
                <div className="mkt-dash-stats">
                  <div className="mkt-dash-stat"><div className="mkt-dash-stat-label">Menu Items</div><div className="mkt-dash-stat-value">24</div></div>
                  <div className="mkt-dash-stat"><div className="mkt-dash-stat-label">Categories</div><div className="mkt-dash-stat-value">6</div></div>
                  <div className="mkt-dash-stat"><div className="mkt-dash-stat-label">Active Plan</div><div className="mkt-dash-stat-value" style={{ color: '#34b56a', fontSize: 22 }}>MenuQR Pro</div></div>
                </div>
              )}
              {activeTab === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Paneer Tikka — ₹280', 'Butter Chicken — ₹380', 'Dal Makhani — ₹220'].map((item) => (
                    <div key={item} className="mkt-dash-stat" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
                      <span style={{ color: '#fff', fontSize: 14 }}>{item}</span>
                      <Eye size={16} color="#7a8a82" />
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 2 && (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {['Dark Emerald', 'Warm Cream', 'Midnight Slate'].map((theme) => (
                    <div key={theme} className="mkt-dash-stat" style={{ flex: '1 1 140px', textAlign: 'center' }}>
                      <Palette size={20} color="#e8783c" style={{ marginBottom: 8 }} />
                      <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{theme}</div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 3 && (
                <div className="mkt-dash-stat" style={{ textAlign: 'center', padding: 32 }}>
                  <QrCode size={48} color="#e8783c" style={{ marginBottom: 12 }} />
                  <div style={{ color: '#fff', fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Your Permanent QR</div>
                  <div style={{ color: '#7a8a82', fontSize: 13 }}>menuqr.in/m/greenbite-bistro</div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </Section>
  );
}

/* ── 07: SUBSCRIPTION + QR PROTECTION ────────────────────────── */
const timelineSteps: { dot: string; title: string; desc: string }[] = [
  { dot: 'active', title: '1. Subscription Active', desc: 'Your menu is live. Customers can scan and browse freely.' },
  { dot: 'warning', title: '2. 10-Day Expiry Warning', desc: 'A persistent alert reminds you in the panel to renew.' },
  { dot: 'danger', title: '3. Subscription Expired', desc: 'Menu becomes temporarily unavailable to scanners.' },
  { dot: 'danger', title: '4. Menu Unavailable Screen', desc: 'Customers see "This menu is currently unavailable."' },
  { dot: 'success', title: '5. Renew Subscription', desc: 'Pay for another year. Your QR remains identical.' },
  { dot: 'active', title: '6. Same QR — Menu Live Again', desc: 'No reprint required. Same physical QR code resumes.' },
];

function SubscriptionSection() {
  return (
    <Section>
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} style={{ textAlign: 'center' }}>
        <motion.p variants={fadeUp} className="mkt-kicker">Subscription Protection</motion.p>
        <motion.h2 variants={fadeUp} className="mkt-h2">Your QR survives expiry.</motion.h2>
        <motion.p variants={fadeUp} className="mkt-body" style={{ margin: '0 auto' }}>
          Even when your subscription lapses, your QR identity is preserved. Renew anytime and your same QR resumes — no reprinting.
        </motion.p>
      </motion.div>
      <div className="mkt-timeline">
        {timelineSteps.map((step, i) => (
          <motion.div
            key={i}
            className="mkt-timeline-step"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <div className="mkt-timeline-track">
              <div className={`mkt-timeline-dot ${step.dot}`} />
              {i < timelineSteps.length - 1 && <div className="mkt-timeline-line" />}
            </div>
            <div className="mkt-timeline-content">
              <h3 className="mkt-timeline-title">{step.title}</h3>
              <p className="mkt-timeline-desc">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ── 08: HOW MENUQR WORKS ────────────────────────────────────── */
const steps: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Store, title: 'Set up restaurant', desc: 'Add your business name, category, and branding.' },
  { icon: Utensils, title: 'Build your menu', desc: 'Add categories, items, prices, and descriptions.' },
  { icon: Palette, title: 'Choose your design', desc: 'Select a template that matches your brand.' },
  { icon: QrCode, title: 'Generate your QR', desc: 'Get your permanent QR code — printed once.' },
  { icon: Smartphone, title: 'Print and display', desc: 'Place QR on tables, counters, walls.' },
  { icon: RefreshCw, title: 'Update anytime', desc: 'Change prices, items, availability — QR stays the same.' },
];

function HowItWorksSection() {
  return (
    <Section alt id="how-it-works">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} style={{ textAlign: 'center' }}>
        <motion.p variants={fadeUp} className="mkt-kicker">6 Simple Steps</motion.p>
        <motion.h2 variants={fadeUp} className="mkt-h2">How MenuQR works.</motion.h2>
      </motion.div>
      <div className="mkt-steps" style={{ marginTop: 48 }}>
        {steps.map(({ icon: Icon, title, desc }, i) => (
          <motion.div
            key={title}
            className="mkt-step"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <div className="mkt-step-number">0{i + 1}</div>
            <div className="mkt-step-icon"><Icon size={24} /></div>
            <h3 className="mkt-step-title">{title}</h3>
            <p className="mkt-step-desc">{desc}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ── 09: CUSTOMER EXPERIENCE ─────────────────────────────────── */
function CustomerExperienceSection() {
  return (
    <Section>
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} style={{ textAlign: 'center' }}>
        <motion.p variants={fadeUp} className="mkt-kicker">Customer View</motion.p>
        <motion.h2 variants={fadeUp} className="mkt-h2">A menu your guests will love.</motion.h2>
        <motion.p variants={fadeUp} className="mkt-body" style={{ margin: '0 auto 40px' }}>
          Fast, beautiful, and designed for phones. No app download required.
        </motion.p>
      </motion.div>
      <motion.div
        style={{ display: 'flex', justifyContent: 'center' }}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <IPhone16ProFrame>
          <div className="mkt-phone-menu-header" style={{ marginBottom: 12 }}>
            <div className="mkt-phone-menu-avatar"><ChefHat size={16} /></div>
            <div>
              <div className="mkt-phone-menu-name" style={{ fontSize: 14 }}>GreenBite Bistro</div>
              <div style={{ fontSize: 10, color: '#7a8a82' }}>Cafe & Restaurant</div>
            </div>
          </div>
          <div style={{ background: '#1d2723', border: '1px solid #2a3832', borderRadius: 10, padding: '8px 12px', fontSize: 12, color: '#7a8a82', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Search size={14} /> Search menu...
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto' }}>
            <span style={{ padding: '4px 12px', borderRadius: 14, fontSize: 11, fontWeight: 600, background: '#e8783c', color: '#fff' }}>All</span>
            <span style={{ padding: '4px 12px', borderRadius: 14, fontSize: 11, fontWeight: 600, background: '#1d2723', color: '#34b56a', border: '1px solid #34b56a' }}>🟢 Veg</span>
            <span style={{ padding: '4px 12px', borderRadius: 14, fontSize: 11, fontWeight: 600, background: '#1d2723', color: '#ff5e4d', border: '1px solid #ff5e4d' }}>🔴 Non-Veg</span>
          </div>
          <div className="mkt-phone-menu-items">
            {[
              { name: 'Classic Burger', price: '₹199', desc: 'Juicy patty, fresh lettuce' },
              { name: 'Farmhouse Pizza', price: '₹349', desc: 'Mozzarella, bell peppers' },
              { name: 'Cold Coffee', price: '₹149', desc: 'Espresso with rich cream' },
            ].map((item) => (
              <div className="mkt-phone-menu-item" key={item.name}>
                <div>
                  <div className="mkt-phone-menu-item-name">{item.name}</div>
                  <div style={{ fontSize: 8, color: '#7a8a82' }}>{item.desc}</div>
                </div>
                <span className="mkt-phone-menu-item-price">{item.price}</span>
              </div>
            ))}
          </div>
        </IPhone16ProFrame>
      </motion.div>
    </Section>
  );
}

/* ── 10: PRICING ─────────────────────────────────────────────── */
function PricingSection() {
  return (
    <Section alt id="pricing">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} style={{ textAlign: 'center' }}>
        <motion.p variants={fadeUp} className="mkt-kicker">Simple Pricing</motion.p>
        <motion.h2 variants={fadeUp} className="mkt-h2">One plan. Everything included.</motion.h2>
      </motion.div>
      <div className="mkt-pricing-cards">
        <motion.div
          className="mkt-pricing-card featured"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="mkt-pricing-plan">MenuQR Pro</div>
          <div className="mkt-pricing-price">Yearly Plan</div>
          <div className="mkt-pricing-period">Annual subscription — contact for custom volume</div>
          <ul className="mkt-pricing-features">
            {[
              'Unlimited menu items',
              'Permanent QR code identity',
              '10 distinct visual templates',
              'Restaurant branding & logos',
              'Real-time price & menu updates',
              'Mobile-optimized customer view',
              'Category & Dietary filters',
              'Veg / Non-Veg badge indicators',
              'Subscription protection (No QR change)',
              'Priority technical support',
            ].map((f) => (
              <li key={f}><Check size={16} className="mkt-pricing-check" /> {f}</li>
            ))}
          </ul>
          <Link to="/admin/login" className="mkt-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Get Started <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </Section>
  );
}

/* ── 11: FAQ ─────────────────────────────────────────────────── */
const faqs = [
  { q: 'Does my QR code ever change?', a: 'No. Your QR code is permanent. You can update your menu, prices, categories, images, and even your restaurant theme — the QR always points to the same permanent URL.' },
  { q: 'Can I change prices after printing my QR?', a: 'Absolutely. Update any price from your restaurant panel and hit publish. Your customers will see the new price immediately — no QR reprint needed.' },
  { q: 'Can I change my full menu after printing?', a: 'Yes. You can add, remove, or reorder items, create new categories, upload images, and change descriptions. The QR remains the same.' },
  { q: 'What happens when my subscription expires?', a: 'Your menu becomes temporarily unavailable to scanners. Your QR identity is preserved. Once you renew, the same QR starts working again — no reprint.' },
  { q: 'What happens after I renew?', a: 'Everything resumes instantly. Same QR, same URL, same menu. Your customers never notice a disruption.' },
  { q: 'Can I customize my menu design?', a: 'Yes. Choose from 10 unique templates with different layouts, typography, and visual styles. You can also customize colors and branding.' },
  { q: 'Can I download and print the QR?', a: 'Yes. MenuQR generates a high-quality downloadable sticker that includes your restaurant name, branding, and QR code — ready to print.' },
  { q: 'Does my customer need to download an app?', a: 'No. Customers simply scan the QR with their phone camera and the menu opens instantly in their browser. No app required.' },
];

function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <Section id="faq">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} style={{ textAlign: 'center' }}>
        <motion.p variants={fadeUp} className="mkt-kicker">Common Questions</motion.p>
        <motion.h2 variants={fadeUp} className="mkt-h2">Frequently asked questions.</motion.h2>
      </motion.div>
      <div className="mkt-faq-list">
        {faqs.map((faq, i) => (
          <div className="mkt-faq-item" key={i}>
            <button className="mkt-faq-question" onClick={() => setOpenIdx(openIdx === i ? null : i)}>
              {faq.q}
              <ChevronDown size={18} className={`mkt-faq-chevron${openIdx === i ? ' open' : ''}`} />
            </button>
            <AnimatePresence>
              {openIdx === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                >
                  <p className="mkt-faq-answer">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ── 12: FINAL CTA ───────────────────────────────────────────── */
function FinalCTASection() {
  return (
    <section className="mkt-final-cta">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7 }}
      >
        <p className="mkt-kicker" style={{ textAlign: 'center' }}>MenuQR</p>
        <h2>Print it once.<br />Update it anytime.</h2>
        <Link to="/admin/login" className="mkt-btn-primary" style={{ fontSize: 18, padding: '18px 36px' }}>
          Create Your MenuQR <ArrowRight size={20} />
        </Link>
      </motion.div>
    </section>
  );
}

/* ── FOOTER ──────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="mkt-footer">
      <div className="mkt-footer-inner">
        <div className="mkt-footer-brand">
          <Link className="mkt-logo" to="/" style={{ fontSize: 20 }}>
            <span className="mkt-logo-mark" style={{ width: 32, height: 32 }}><ChefHat size={16} /></span>
            Menu<span>QR</span>
          </Link>
          <p>Digital menus with permanent QR codes for restaurants, cafes, and food businesses.</p>
        </div>
        <div className="mkt-footer-col">
          <h4>Product</h4>
          <a href="#how-it-works">How It Works</a>
          <a href="#templates">Templates</a>
          <a href="#pricing">Pricing</a>
          <Link to="/admin/login">Login</Link>
        </div>
        <div className="mkt-footer-col">
          <h4>Support</h4>
          <a href="#faq">FAQ</a>
          <a href="mailto:support@menuqr.in">Contact</a>
        </div>
        <div className="mkt-footer-col">
          <h4>Legal</h4>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
      <div className="mkt-footer-bottom">
        © {new Date().getFullYear()} MenuQR. All rights reserved.
      </div>
    </footer>
  );
}

/* ── PAGE EXPORT ─────────────────────────────────────────────── */
export default function MarketingPage() {
  return (
    <main className="marketing-page">
      <Header />
      <HeroSection />
      <UpdateDemoSection />
      <PhysicalQRSection />
      <BuiltForTableSection />
      <TemplateGallerySection />
      <DashboardDemoSection />
      <SubscriptionSection />
      <HowItWorksSection />
      <CustomerExperienceSection />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </main>
  );
}
