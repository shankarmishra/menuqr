import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Flame,
  Coffee,
  Crown,
  AlertTriangle,
  SlidersHorizontal,
  TrendingUp,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Info
} from 'lucide-react';

export interface OperationalArchetype {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  icon: typeof Flame;
  baseline: {
    environment: string;
    capacity: string;
    footfall: string;
    preMenusQRState: string;
  };
  coreFriction: {
    title: string;
    points: string[];
  };
  menusQRConfig: {
    themeName: string;
    themeStyle: string;
    planTier: string;
    planPrice: string;
    planLink: string;
    features: string[];
  };
  operationalImpact: {
    summary: string;
    metrics: Array<{ label: string; detail: string }>;
  };
}

const ARCHETYPES: OperationalArchetype[] = [
  {
    id: 'dhaba',
    name: 'Highway Dhaba & Family Dining',
    badge: 'High Footfall & Quick Table Turns',
    tagline: 'High volume, fast seating turnover, and daily volatile ingredient rates',
    accentColor: '#D97706', // warm amber / spice
    accentBg: 'bg-amber-500/10',
    accentBorder: 'border-amber-500/30',
    icon: Flame,
    baseline: {
      environment: 'Corridor Highway & Suburban Family Multi-Cuisine (GT Road / NH Style)',
      capacity: '24–32 tables • 120–160 catalog items • High weekend & evening rushes',
      footfall: '300–500 covers per day with high party sizes (4–8 diners per table)',
      preMenusQRState: 'Laminated paper card booklets; frequent dairy/seasonal produce price adjustments scribbled over with ballpoint pens.'
    },
    coreFriction: {
      title: 'Physical Menu Degradation & Repetitive Ordering Questions',
      points: [
        'Laminated paper menus degrade rapidly under heavy tandoori butter and curry spills, requiring frequent reprints.',
        'Market-driven price swings in dairy and seasonal produce lead to unsightly pen edits or tape stickers on physical menus.',
        'Waiters spend significant table time clarifying portion splits (Quarter vs Half vs Full Handi) instead of seating new arrivals.'
      ]
    },
    menusQRConfig: {
      themeName: 'Rang-e-Punjab / Bombay Chowk',
      themeStyle: 'High-contrast typography, bold food cards & spice-inspired warm brass tones',
      planTier: 'Intermediate Plan',
      planPrice: '₹3,199/yr (₹299/mo)',
      planLink: '/purchase/details?plan=intermediate',
      features: [
        'Multi-portion pricing (Quarter / Half / Full Handi)',
        'FSSAI-compliant Veg / Non-Veg / Jain green and red indicator badges',
        'Phone-based 1-second price & dish availability updates',
        '86 "Sold Out Today" operational toggle for peak evening specials',
        'Permanent QR standees that never require physical reprinting'
      ]
    },
    operationalImpact: {
      summary: 'Eliminates paper menu reprint cycles while allowing immediate phone adjustments whenever market ingredient costs fluctuate.',
      metrics: [
        { label: 'Menu Reprint Costs', detail: '₹0 recurring reprint costs (previously 3–4 reprint runs per year)' },
        { label: 'Price Update Speed', detail: '< 5 seconds from owner smartphone without reprinting placards' },
        { label: 'Ordering Clarity', detail: 'Guests see clear portion sizes & FSSAI dietary badges instantly on scan' }
      ]
    }
  },
  {
    id: 'cafe',
    name: 'Urban Specialty Café',
    badge: 'Third-Wave Coffee & Artisan Bakery',
    tagline: 'Aesthetic visual presentation, fast morning queues, and rotational bakery offerings',
    accentColor: '#0D9488', // refined teal / emerald
    accentBg: 'bg-teal-500/10',
    accentBorder: 'border-teal-500/30',
    icon: Coffee,
    baseline: {
      environment: 'Urban Lifestyle Hub (Bandra, Indiranagar, Hauz Khas, Jubilee Hills)',
      capacity: '12–16 compact marble tables • High daytime remote work & weekend brunch',
      footfall: '150–220 specialty beverage orders daily with rapidly rotating bakery display',
      preMenusQRState: 'Bulky acrylic stands cluttering small 2-seater tables; printed bakery boards that fall out of sync with morning bake counts.'
    },
    coreFriction: {
      title: 'Table Clutter, Dietary Inquiries & Unpredictable Bake Sell-Outs',
      points: [
        'Bulky physical stands clutter compact tables where guests require space for laptops, journals, and beverage cups.',
        'Baristas spend excessive time answering repetitive ingredient questions (oat vs almond milk, gluten-free, eggless, keto).',
        'Fresh morning croissants, cruffins, and single-origin pour-overs sell out early, causing counter frustration when orders are taken manually.'
      ]
    },
    menusQRConfig: {
      themeName: 'Atelier Pastel / Presse Brut',
      themeStyle: 'Clean editorial typography, generous whitespace & crisp focal-point photo presentation',
      planTier: 'Intermediate Plan',
      planPrice: '₹3,199/yr (₹299/mo)',
      planLink: '/purchase/details?plan=intermediate',
      features: [
        'High-resolution visual showcase with responsive focal-point photography',
        'Dietary filter chips (Eggless, Gluten-Free, Dairy-Free, Vegan, Keto)',
        'Instant morning bake availability toggle right from barista phone',
        'Brushed champagne-gold tabletop QR stands with minimal physical footprint',
        'Direct Google Review footer link to capture diner satisfaction tableside'
      ]
    },
    operationalImpact: {
      summary: 'Maintains an uncluttered table aesthetic while letting guests self-filter dietary preferences and see live bake availability.',
      metrics: [
        { label: 'Table Footprint', detail: 'Single minimalist 65mm QR stand replaces bulky acrylic menu towers' },
        { label: 'Allergen Inquiries', detail: 'Diners filter dietary badges directly on their phones' },
        { label: 'Bakery Sync', detail: 'Sold-out pastries toggled off in real-time as morning batches deplete' }
      ]
    }
  },
  {
    id: 'finedining',
    name: 'Heritage Multi-Cuisine Fine Dining',
    badge: 'Royal Hospitality & Banquet Service',
    tagline: 'Extensive multi-course menus, secluded alcoves, and synchronized kitchen stations',
    accentColor: '#E8783C', // signature MenusQR burnt orange / copper
    accentBg: 'bg-[#E8783C]/10',
    accentBorder: 'border-[#E8783C]/30',
    icon: Crown,
    baseline: {
      environment: 'Heritage Awadhi, Mughlai & Pan-Indian Dining Room with Private Suites',
      capacity: '32–40 tables + 2 private dining rooms • Multi-course tasting & banquet dining',
      footfall: 'High average party sizes (4–10 guests), leisurely 75–110 minute dining journeys',
      preMenusQRState: 'Heavy leather-bound gold-embossed menus; difficult waiter visibility into corner alcoves for secondary bread/drink rounds.'
    },
    coreFriction: {
      title: 'Multi-Course Service Delays & Disjointed Billing Reconciliation',
      points: [
        'Guests seated in private alcoves face delayed service when trying to signal waiters for secondary beverage or bread rounds.',
        'Multiple handwritten KOT slips for mid-meal additions (e.g., fresh tandoori rotis or mocktails) cause checkout reconciliation errors.',
        'Extensive 200+ item culinary catalogs with sommelier pairings overwhelm diners when presented in dense printed booklets.'
      ]
    },
    menusQRConfig: {
      themeName: "Maharaja's Table / Maison Noir",
      themeStyle: 'Regal obsidian emerald, gold ornamental accents & traditional heritage typography',
      planTier: 'Premium Plan',
      planPrice: '₹6,799/yr (₹899/mo)',
      planLink: '/purchase/details?plan=premium',
      features: [
        'Customer Table QR Ordering with secure 3-character table validation tokens',
        'Live Kitchen Stream (/api/app/orders/stream) with audible chime alerts',
        'Table Token Bridge consolidating multiple dining rounds into a single GST receipt',
        'Instant "Call Waiter" and "Request Bill" alerts routed to Cashier Reception',
        'Curated sommelier beverage pairing and chef signature tasting highlights'
      ]
    },
    operationalImpact: {
      summary: 'Enables discreet tableside re-ordering and eliminates checkout billing discrepancies through centralized table token consolidation.',
      metrics: [
        { label: 'Mid-Meal Re-orders', detail: 'Secondary bread and beverage orders route directly to kitchen stations' },
        { label: 'Order Accuracy', detail: 'Table-token security prevents misplaced tickets or misallocated bills' },
        { label: 'Checkout Consolidation', detail: 'Cashier prints one unified thermal GST tax invoice upon bill request' }
      ]
    }
  }
];

export default function IllustrativeProfilesSection() {
  const [activeId, setActiveId] = useState<string>('all');

  const filteredArchetypes = activeId === 'all'
    ? ARCHETYPES
    : ARCHETYPES.filter((a) => a.id === activeId);

  return (
    <section
      id="illustrative-scenarios"
      aria-label="Illustrative Restaurant Scenarios"
      className="relative overflow-hidden bg-[#FAFAF7] py-16 sm:py-20 lg:py-24 border-t border-[#151C19]/10"
    >
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8 md:px-12">
        {/* Section Header with Non-Negotiable Explicit Label */}
        <div className="mb-12 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151C19]/5 border border-[#151C19]/10 text-xs font-semibold text-[#151C19] mb-4">
            <Info className="w-3.5 h-3.5 text-[#E8783C]" />
            <span className="uppercase tracking-[0.14em]">Operational Architecture Evidence</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#151C19] tracking-tight leading-tight mb-4">
            Illustrative Restaurant Scenarios — Not Actual Customer Case Studies.
          </h2>

          <p className="text-base sm:text-lg text-[#626776] leading-relaxed max-w-3xl">
            We do not publish fabricated client names, synthetic testimonials, or vanity percentages.
            Below are three grounded operational archetypes reflecting typical Indian dining realities,
            illustrating how different establishments configure MenusQR themes and tiers to solve everyday table frictions.
          </p>

          {/* Filter Tabs */}
          <div className="mt-8 flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveId('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeId === 'all'
                  ? 'bg-[#151C19] text-white shadow-sm'
                  : 'bg-white text-[#626776] border border-[#151C19]/15 hover:border-[#151C19]/30 hover:text-[#151C19]'
              }`}
            >
              All 3 Archetypes
            </button>
            {ARCHETYPES.map((arch) => {
              const Icon = arch.icon;
              const isActive = activeId === arch.id;
              return (
                <button
                  key={arch.id}
                  type="button"
                  onClick={() => setActiveId(arch.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#151C19] text-white shadow-sm'
                      : 'bg-white text-[#626776] border border-[#151C19]/15 hover:border-[#151C19]/30 hover:text-[#151C19]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#E8783C]" />
                  <span>{arch.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Archetypes Grid */}
        <div className={`grid gap-8 ${activeId === 'all' ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 max-w-4xl mx-auto'}`}>
          <AnimatePresence mode="popLayout">
            {filteredArchetypes.map((archetype) => {
              const Icon = archetype.icon;
              return (
                <motion.article
                  key={archetype.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col rounded-2xl bg-white border border-[#151C19]/12 p-6 sm:p-7 shadow-[0_4px_20px_-8px_rgba(21,28,25,0.06)] hover:shadow-[0_8px_30px_-10px_rgba(21,28,25,0.12)] transition-shadow relative overflow-hidden"
                >
                  {/* Archetype Accent Strip */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: archetype.accentColor }}
                  />

                  {/* Header Badge & Title */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${archetype.accentBg} text-[#151C19] border ${archetype.accentBorder}`}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: archetype.accentColor }} />
                        {archetype.badge}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-[#151C19] leading-snug">
                      {archetype.name}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#626776] mt-1.5 font-medium leading-relaxed">
                      {archetype.tagline}
                    </p>
                  </div>

                  {/* Segment 1: Concept & Baseline */}
                  <div className="mb-6 rounded-xl bg-[#FAFAF7] p-4 border border-[#151C19]/8">
                    <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-[#151C19]">
                      <Layers className="w-3.5 h-3.5 text-[#E8783C]" />
                      <span>Concept & Baseline Environment</span>
                    </div>
                    <div className="space-y-1.5 text-xs sm:text-[13px] text-[#4A4E5A] leading-relaxed">
                      <p><strong className="text-[#151C19]">Setting:</strong> {archetype.baseline.environment}</p>
                      <p><strong className="text-[#151C19]">Capacity:</strong> {archetype.baseline.capacity}</p>
                      <p><strong className="text-[#151C19]">Pre-MenusQR State:</strong> {archetype.baseline.preMenusQRState}</p>
                    </div>
                  </div>

                  {/* Segment 2: The Core Operational Friction */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2.5 text-xs font-bold uppercase tracking-wider text-[#C0392B]">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#C0392B]" />
                      <span>The Core Operational Friction</span>
                    </div>
                    <h4 className="text-sm font-semibold text-[#151C19] mb-2">
                      {archetype.coreFriction.title}
                    </h4>
                    <ul className="space-y-2 text-xs sm:text-[13px] text-[#626776] leading-relaxed">
                      {archetype.coreFriction.points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#C0392B] font-bold mt-0.5">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Segment 3: MenusQR Configuration */}
                  <div className="mb-6 rounded-xl border border-[#151C19]/10 p-4 bg-white">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#151C19]">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-[#E8783C]" />
                        <span>MenusQR Configuration</span>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#151C19] text-white">
                        {archetype.menusQRConfig.planTier}
                      </span>
                    </div>

                    <div className="text-xs sm:text-[13px] text-[#4A4E5A] mb-3">
                      <p><strong className="text-[#151C19]">Theme:</strong> {archetype.menusQRConfig.themeName}</p>
                      <p className="text-[#626776] text-xs mt-0.5">{archetype.menusQRConfig.themeStyle}</p>
                      <p className="mt-1"><strong className="text-[#151C19]">Plan Investment:</strong> {archetype.menusQRConfig.planPrice}</p>
                    </div>

                    <div className="border-t border-[#151C19]/8 pt-2.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#626776] block mb-1.5">
                        Operational Features Deployed:
                      </span>
                      <ul className="space-y-1.5 text-xs text-[#333742]">
                        {archetype.menusQRConfig.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#34B56A] mt-0.5 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Segment 4: Expected Operational Impact */}
                  <div className="mt-auto pt-4 border-t border-[#151C19]/10">
                    <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-[#34B56A]">
                      <TrendingUp className="w-3.5 h-3.5 text-[#34B56A]" />
                      <span>Expected Operational Impact</span>
                    </div>

                    <p className="text-xs sm:text-[13px] text-[#4A4E5A] leading-relaxed mb-4">
                      {archetype.operationalImpact.summary}
                    </p>

                    <div className="grid grid-cols-1 gap-2 bg-[#FAFAF7] rounded-lg p-3 border border-[#151C19]/6">
                      {archetype.operationalImpact.metrics.map((m, mIdx) => (
                        <div key={mIdx} className="text-xs">
                          <span className="font-semibold text-[#151C19]">{m.label}: </span>
                          <span className="text-[#626776]">{m.detail}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action link */}
                    <div className="mt-5 pt-3 flex items-center justify-between">
                      <Link
                        to={archetype.menusQRConfig.planLink}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E8783C] hover:text-[#d6672b] transition-colors"
                      >
                        <span>Explore {archetype.menusQRConfig.planTier}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <Link
                        to="/templates"
                        className="text-xs font-medium text-[#626776] hover:text-[#151C19] transition-colors"
                      >
                        View theme styles
                      </Link>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Footnote on methodology */}
        <div className="mt-12 rounded-xl bg-white border border-[#151C19]/10 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#34B56A] shrink-0 mt-0.5" />
            <div className="text-xs text-[#626776] leading-relaxed">
              <strong className="text-[#151C19]">Methodology Transparency:</strong> Operational archetypes are synthesized from active menu audits across Delhi-NCR, Mumbai, and Bengaluru food service setups. Want to pilot MenusQR in your dining room with measurable verification?
            </div>
          </div>
          <Link
            to="/plans"
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#E8783C] text-white text-xs font-bold hover:bg-[#d6672b] transition-colors shadow-sm"
          >
            <span>Start 14-Day Free Trial</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
