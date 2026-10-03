import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ChefHat, QrCode, ArrowRight, ArrowUpRight, ChevronDown,
  Smartphone, Utensils, CreditCard, Settings, Palette, LayoutDashboard,
  Menu as MenuIcon, X, Search, Leaf, Coffee, UtensilsCrossed,
  Store, ConciergeBell, ShoppingBag, Check, RefreshCw, Shield,
  AlertTriangle, XCircle, Clock, Send, Eye, type LucideIcon,
} from 'lucide-react';
import './MarketingPage.css';

/* ── Animation Helpers ───────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
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

/* ── HEADER ──────────────────────────────────────────────────── */
function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="mkt-header">
      <Link className="mkt-logo" to="/" aria-label="MenuQR home">
        <span className="mkt-logo-mark"><ChefHat size={18} strokeWidth={1.9} /></span>
        Menu<span>QR</span>
      </Link>
      <nav className={`mkt-nav${open ? ' open' : ''}`}>
        <a href="#how-it-works" onClick={() => setOpen(false)}>How It Works</a>
        <a href="#templates" onClick={() => setOpen(false)}>Templates</a>
        <a href="#pricing" onClick={() => setOpen(false)}>Pricing</a>
        <Link to="/admin/login" onClick={() => setOpen(false)}>Login</Link>
        <Link to="/admin/login" className="mkt-nav-cta" onClick={() => setOpen(false)}>Get Started</Link>
      </nav>
      {open && <div className="mkt-nav-overlay" onClick={() => setOpen(false)} />}
      <button className="mkt-mobile-toggle" onClick={() => setOpen(!open)} aria-label="Menu">
        {open ? <X size={24} /> : <MenuIcon size={24} />}
      </button>
    </header>
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
          className="mkt-hero-visual"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Machine */}
          <div className="mkt-machine">
            <div className="mkt-machine-display">
              <motion.div
                className="mkt-machine-display-dot"
                animate={prefersReduced ? {} : { opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="mkt-machine-display-text">MenuQR Ready</span>
            </div>
            <div className="mkt-machine-sticker-area">
              <motion.div
                className="mkt-machine-sticker"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6, type: 'spring' }}
              >
                <div className="mkt-machine-sticker-logo"><ChefHat size={22} /></div>
                <span className="mkt-machine-sticker-name">Your Restaurant</span>
                <div className="mkt-machine-sticker-qr"><QrCode size={40} strokeWidth={1.2} /></div>
                <span className="mkt-machine-sticker-label">Scan for Menu</span>
              </motion.div>
            </div>
            <div className="mkt-machine-slot">
              <motion.div
                className="mkt-machine-slot-inner"
                style={{ background: 'linear-gradient(90deg, #e8783c, #ffc928)' }}
                animate={prefersReduced ? {} : { x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </div>

          {/* Scan beam */}
          <motion.div
            className="mkt-scan-beam"
            animate={prefersReduced ? {} : { opacity: [0, 0.8, 0], scaleX: [0.5, 1.2, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Phone */}
          <div className="mkt-hero-phone">
            <div className="mkt-hero-phone-notch" />
            <div className="mkt-hero-phone-screen">
              <div className="mkt-phone-menu-header">
                <div className="mkt-phone-menu-avatar"><ChefHat size={14} /></div>
                <span className="mkt-phone-menu-name">Your Menu</span>
              </div>
              <div className="mkt-phone-menu-items">
                {[
                  { name: 'Classic Burger', price: '₹199' },
                  { name: 'Farmhouse Pizza', price: '₹299' },
                  { name: 'Cold Coffee', price: '₹149' },
                ].map((item) => (
                  <div className="mkt-phone-menu-item" key={item.name}>
                    <span className="mkt-phone-menu-item-name">{item.name}</span>
                    <span className="mkt-phone-menu-item-price">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
  const timerRef = useRef<ReturnType<typeof setInterval>>();

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
      >
        {/* Editor */}
        <div className="mkt-editor-panel">
          <div className="mkt-editor-panel-header">
            <Settings size={16} color="#e8783c" />
            <span className="mkt-editor-panel-title">Restaurant Panel</span>
          </div>
          <div className="mkt-editor-row">
            <span className="mkt-editor-label">Paneer Tikka</span>
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
            <span className="mkt-editor-label">Butter Chicken</span>
            <span className="mkt-editor-value">₹380</span>
          </div>
          <motion.div
            className="mkt-editor-publish-btn"
            animate={published ? { scale: [1, 1.03, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Send size={14} /> {published ? 'Published ✓' : 'Publish Changes'}
          </motion.div>
        </div>

        {/* Phone */}
        <div>
          <div className="mkt-demo-phone" style={{ margin: '0 auto' }}>
            <div className="mkt-demo-phone-screen">
              <div className="mkt-phone-menu-header">
                <div className="mkt-phone-menu-avatar"><ChefHat size={14} /></div>
                <span className="mkt-phone-menu-name">Customer View</span>
              </div>
              <div className="mkt-phone-menu-items">
                <div className="mkt-phone-menu-item">
                  <span className="mkt-phone-menu-item-name">Paneer Tikka</span>
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
                  <span className="mkt-phone-menu-item-name">Butter Chicken</span>
                  <span className="mkt-phone-menu-item-price">₹380</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mkt-qr-badge">
            <div className="mkt-qr-badge-icon"><QrCode size={22} /></div>
            <div>
              <div className="mkt-qr-badge-label">✓ Same QR — No Reprint</div>
              <div className="mkt-qr-badge-sublabel">QR identity unchanged after publish</div>
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
        className="mkt-physical-demo"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        {/* QR Stand */}
        <div className="mkt-qr-stand">
          <span className="mkt-qr-stand-title">TABLE 04</span>
          <div className="mkt-qr-stand-code"><QrCode size={52} strokeWidth={1.2} /></div>
          <span className="mkt-qr-stand-label">Scan for Menu</span>
        </div>

        {/* Arrow */}
        <div className="mkt-scan-arrow">
          <motion.div
            className="mkt-scan-arrow-line"
            animate={{ scaleX: [0.6, 1, 0.6], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="mkt-scan-arrow-label">SCAN</span>
        </div>

        {/* Phone */}
        <div className="mkt-demo-phone">
          <div className="mkt-demo-phone-screen">
            <div className="mkt-phone-menu-header">
              <div className="mkt-phone-menu-avatar"><ChefHat size={14} /></div>
              <span className="mkt-phone-menu-name">Live Menu</span>
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
          </div>
        </div>
      </motion.div>
    </Section>
  );
}

/* ── 04: BUILT FOR THE TABLE ─────────────────────────────────── */
const contexts: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: UtensilsCrossed, title: 'Dining Table', desc: 'QR placard at every table. Guests scan and browse before ordering.' },
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

/* ── 05: TEMPLATE GALLERY ────────────────────────────────────── */
const templates = [
  { name: 'Minimal', bg: '#151c19', accent: '#e8783c', text: '#fff' },
  { name: 'Luxury', bg: '#1a1014', accent: '#c4956a', text: '#f5e6d0' },
  { name: 'Modern', bg: '#0f1923', accent: '#3b82f6', text: '#e2e8f0' },
  { name: 'Cafe', bg: '#f5f0e8', accent: '#8b6914', text: '#3d2e1a' },
  { name: 'Indian', bg: '#1c0f0a', accent: '#e85d3c', text: '#fde8d0' },
  { name: 'Fine Dining', bg: '#0a0a0a', accent: '#d4af37', text: '#f0ead6' },
  { name: 'Bakery', bg: '#faf4ee', accent: '#b5651d', text: '#3d2e1a' },
  { name: 'Premium Dark', bg: '#0d1117', accent: '#58a6ff', text: '#c9d1d9' },
  { name: 'Classic', bg: '#f8f6f0', accent: '#2d5016', text: '#1a1a1a' },
  { name: 'Visual', bg: '#1a0520', accent: '#e040fb', text: '#f3e5f5' },
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
              <div style={{ fontSize: 11, fontWeight: 600, color: t.accent, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Menu
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Restaurant Name</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                {['Starter', 'Main Course', 'Dessert'].map((cat) => (
                  <div key={cat} style={{ padding: '8px 10px', background: `${t.accent}15`, borderRadius: 6, fontSize: 11 }}>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{cat}</div>
                    <div style={{ opacity: 0.6, fontSize: 10 }}>₹199 – ₹499</div>
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
                  <div className="mkt-dash-stat"><div className="mkt-dash-stat-label">QR Scans (Demo)</div><div className="mkt-dash-stat-value">—</div></div>
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
                  {['Dark Emerald', 'Warm Cream', 'Midnight'].map((theme) => (
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
                  <div style={{ color: '#7a8a82', fontSize: 13 }}>menuqr.in/m/your-restaurant</div>
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
  { dot: 'active', title: 'Subscription Active', desc: 'Your menu is live. Customers can scan and browse freely.' },
  { dot: 'warning', title: '10-Day Warning', desc: 'A persistent alert reminds you to renew before expiry.' },
  { dot: 'danger', title: 'Subscription Expired', desc: 'Menu becomes temporarily unavailable to scanners.' },
  { dot: 'danger', title: 'Menu Unavailable', desc: 'Customers see "This menu is currently unavailable."' },
  { dot: 'success', title: 'Renew Subscription', desc: 'Pay for another year. Your QR remains the same.' },
  { dot: 'active', title: 'Same QR — Menu Live Again', desc: 'No reprint. Same QR code, same permanent URL.' },
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
        <motion.p variants={fadeUp} className="mkt-body" style={{ margin: '0 auto' }}>
          Fast, beautiful, and designed for phones. No app download required.
        </motion.p>
      </motion.div>
      <motion.div
        className="mkt-customer-phone"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <div className="mkt-customer-phone-screen">
          <div className="mkt-customer-phone-content">
            <div className="mkt-phone-menu-header" style={{ marginBottom: 12 }}>
              <div className="mkt-phone-menu-avatar"><ChefHat size={16} /></div>
              <div>
                <div className="mkt-phone-menu-name" style={{ fontSize: 14 }}>Green Bistro</div>
                <div style={{ fontSize: 10, color: '#7a8a82' }}>Cafe & Restaurant</div>
              </div>
            </div>
            <div className="mkt-customer-search">
              <Search size={14} /> Search menu...
            </div>
            <div className="mkt-customer-filters">
              <span className="mkt-customer-filter active">All</span>
              <span className="mkt-customer-filter">🟢 Veg</span>
              <span className="mkt-customer-filter">🔴 Non-Veg</span>
              <span className="mkt-customer-filter">Starters</span>
            </div>
            <div className="mkt-customer-items">
              {[
                { emoji: '🍔', name: 'Classic Burger', desc: 'Juicy patty, fresh veggies', price: '₹199' },
                { emoji: '🍕', name: 'Margherita Pizza', desc: 'Hand-tossed, mozzarella', price: '₹349' },
                { emoji: '🥗', name: 'Caesar Salad', desc: 'Romaine, croutons, parmesan', price: '₹179' },
                { emoji: '☕', name: 'Cappuccino', desc: 'Double shot espresso', price: '₹149' },
              ].map((item) => (
                <div className="mkt-customer-item" key={item.name}>
                  <div className="mkt-customer-item-img">{item.emoji}</div>
                  <div className="mkt-customer-item-info">
                    <div className="mkt-customer-item-name">{item.name}</div>
                    <div className="mkt-customer-item-desc">{item.desc}</div>
                  </div>
                  <span className="mkt-customer-item-price">{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
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
          <div className="mkt-pricing-price">Yearly</div>
          <div className="mkt-pricing-period">Annual subscription — contact for pricing</div>
          <ul className="mkt-pricing-features">
            {[
              'Unlimited menu items',
              'Permanent QR code',
              '10 unique templates',
              'Restaurant branding',
              'Real-time menu updates',
              'Mobile-optimized menu',
              'Category management',
              'Veg / Non-Veg filters',
              'Subscription protection',
              'Priority support',
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
