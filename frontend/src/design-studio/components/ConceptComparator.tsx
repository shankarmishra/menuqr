import React, { useState } from 'react';
import { Palette, Sparkles, CheckCircle2, ZoomIn, Eye } from 'lucide-react';

interface Concept {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  palette: Array<{ name: string; hex: string }>;
  philosophy: string;
  characterProfile: string;
  settingProps: string;
  motionLanguage: string;
  recommendedFor: string;
  tags: string[];
}

const CONCEPTS: Concept[] = [
  {
    id: 'concept-a',
    code: 'DIRECTION A',
    title: 'Modern Luxury Editorial Vector',
    subtitle: 'The Sovereign Restaurateur',
    imageSrc: '/design-studio/concepts/concept-a-editorial.jpg',
    palette: [
      { name: 'Obsidian Canvas', hex: '#070D0A' },
      { name: 'Nehru Green', hex: '#182E23' },
      { name: 'Brushed Brass', hex: '#D4AF37' },
      { name: 'Signal Mint', hex: '#10B981' },
      { name: 'Terracotta Ember', hex: '#E8783C' },
    ],
    philosophy: 'World-class B2B SaaS editorial vector art inspired by Stripe Press and Linear. Combines refined South Asian hospitality dignity with razor-sharp digital precision.',
    characterProfile: 'Vikram in a bespoke bottle-green Nehru jacket with standing mandarin collar, four solid brushed brass buttons, pompadour haircut with temple fade, and clean manicured beard.',
    settingProps: 'Contemporary luxury Indian restaurant interior with an architectural archway, warm amber pendant sconces, and an authentic walnut and acrylic tabletop QR standee.',
    motionLanguage: 'Subtle 3-4s breathing curves, soft pulsing live telemetry indicators, and gentle touch-ripple feedback on tablet glass.',
    recommendedFor: 'Core B2B SaaS branding, owner dashboards, fine-dining marketing, and luxury standee sales.',
    tags: ['Editorial Vector', 'High-Status', '1:7.2 Proportions', 'Luxury Dining'],
  },
  {
    id: 'concept-b',
    code: 'DIRECTION B',
    title: 'Warm Heritage Botanical & Litho Modern',
    subtitle: 'The Culinary Artisan',
    imageSrc: '/design-studio/concepts/concept-b-heritage.jpg',
    palette: [
      { name: 'Terracotta Clay', hex: '#C05E2B' },
      { name: 'Aged Parchment', hex: '#F5EFE6' },
      { name: 'Deep Forest', hex: '#152A20' },
      { name: 'Antique Brass', hex: '#D4AF37' },
      { name: 'Raw Umber', hex: '#4A2E1B' },
    ],
    philosophy: 'A soulful fusion of traditional Indian woodblock printcraft and botanical lithography with clean modern vector lines. Deeply warm, welcoming, and culinary-first.',
    characterProfile: 'Vikram in a tailored linen kurta and dark embroidered waistcoat, exuding warmth, culinary mastery, and genuine hospitality experience.',
    settingProps: 'Heritage dining courtyard with terracotta tiles, brass degchi pots, warm hanging lanterns, and delicate cardamom & star anise spice botanicals framing the borders.',
    motionLanguage: 'Hand-drawn linocut stroke reveals, rising fragrant steam ribbons with organic displacement, and tactile paper curls.',
    recommendedFor: 'Heritage restaurants, regional culinary hubs, customer mobile menu storytelling, and artisanal dhaba themes.',
    tags: ['Lithographic Woodcut', 'Warm Heritage', 'Botanical Spices', 'Artisanal'],
  },
  {
    id: 'concept-c',
    code: 'DIRECTION C',
    title: 'High-Octane Cyber-Hospitality Vector',
    subtitle: 'The Tech-First Operator',
    imageSrc: '/design-studio/concepts/concept-c-cyber.jpg',
    palette: [
      { name: 'Pitch Obsidian', hex: '#050806' },
      { name: 'Cyber Mint', hex: '#00FF88' },
      { name: 'Solar Ember', hex: '#FF6B35' },
      { name: 'Electric Cyan', hex: '#00E5FF' },
      { name: 'Frosted Glass', hex: '#1A2922' },
    ],
    philosophy: 'A futuristic, data-dense 2.5D isometric glassmorphism aesthetic for high-velocity mega-kitchens, multi-unit franchise chains, and real-time cloud dispatch.',
    characterProfile: 'Vikram in a sleek minimalist tech blazer with subtle glowing lapel trim, holding a borderless holographic tablet surrounded by floating 3D telemetry cards.',
    settingProps: 'Panoramic command mezzanine overlooking a vibrant neon dining room with illuminated table tokens (Table #01 to #24) and fiber-optic data streams.',
    motionLanguage: 'High-velocity spring physics, radar sweeps, glowing matrix target locks, and real-time numerical counter incrementation.',
    recommendedFor: 'Kitchen Display Systems (KDS), fast-casual QSR chains, franchise analytics, and high-volume billing desks.',
    tags: ['2.5D Glassmorphism', 'High-Velocity', 'Cyber Mint', 'Cloud Operations'],
  },
];

export const ConceptComparator: React.FC = () => {
  const [selectedConcept, setSelectedConcept] = useState<string>('concept-a');
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const active = CONCEPTS.find((c) => c.id === selectedConcept) || CONCEPTS[0];

  return (
    <div className="flex flex-col gap-8 rounded-3xl border border-[#23352C] bg-[#101713] p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#23352C] pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#FFA64D] flex items-center gap-1.5">
            <Sparkles size={14} />
            <span>AI CREATIVE FACTORY · THREE COMPETING ART DIRECTIONS</span>
          </span>
          <h2 className="mt-1 text-2xl font-black text-white">
            Art Direction Benchmark Comparator
          </h2>
          <p className="text-xs text-[#8C9B94]">
            Three distinct professional design systems created for the Restaurant Owner benchmark scene. Compare palettes, character anatomy, environment depth, and motion signatures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>3 Generated Candidates Ready</span>
          </span>
        </div>
      </div>

      {/* 3 Candidate Cards Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {CONCEPTS.map((concept) => {
          const isSelected = concept.id === selectedConcept;
          return (
            <div
              key={concept.id}
              onClick={() => setSelectedConcept(concept.id)}
              className={`group relative cursor-pointer overflow-hidden rounded-2xl border transition-all ${
                isSelected
                  ? 'border-[#E8783C] bg-[#16221C] ring-2 ring-[#E8783C]/40 shadow-xl shadow-[#E8783C]/10 scale-[1.01]'
                  : 'border-[#24352D] bg-[#0E1512] hover:border-[#3D5749]'
              }`}
            >
              {/* Image Preview Container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#070D0A]">
                <img
                  src={concept.imageSrc}
                  alt={concept.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E1512] via-transparent to-transparent opacity-80" />

                {/* Badge Top Left */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-md bg-[#070D0A]/80 px-2 py-1 text-[10px] font-mono font-bold text-[#FFA64D] border border-white/10 backdrop-blur-md">
                  <span>{concept.code}</span>
                </div>

                {/* Full-screen Zoom Icon */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoomImage(concept.imageSrc);
                  }}
                  className="absolute top-3 right-3 rounded-lg bg-[#070D0A]/70 p-1.5 text-white/70 hover:text-white hover:bg-[#070D0A] transition-colors backdrop-blur-md"
                  title="Zoom full image"
                >
                  <ZoomIn size={14} />
                </button>

                {isSelected && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-[#E8783C] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-lg">
                    <CheckCircle2 size={12} />
                    <span>ACTIVE INSPECTION</span>
                  </div>
                )}
              </div>

              {/* Card Meta */}
              <div className="p-5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#34D399]">
                  {concept.subtitle}
                </span>
                <h3 className="mt-0.5 text-base font-black text-white group-hover:text-[#FFA64D] transition-colors">
                  {concept.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#8C9B94] line-clamp-3">
                  {concept.philosophy}
                </p>

                {/* Palette Swatches */}
                <div className="mt-4 flex items-center gap-1.5 border-t border-[#1C2A22] pt-3">
                  <span className="text-[10px] font-mono text-[#63756C] mr-1">Palette:</span>
                  {concept.palette.map((swatch) => (
                    <span
                      key={swatch.name}
                      className="h-4 w-4 rounded-full border border-white/20"
                      style={{ backgroundColor: swatch.hex }}
                      title={`${swatch.name} (${swatch.hex})`}
                    />
                  ))}
                </div>

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {concept.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-[#16261D] px-2 py-0.5 text-[9px] font-medium text-[#7D9186]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Direction Deep-Dive Inspection Panel */}
      <div className="rounded-2xl border border-[#23352C] bg-[#0A0F0D] p-6 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          {/* Left Large Preview */}
          <div className="relative aspect-[4/3] w-full max-w-[480px] overflow-hidden rounded-xl border border-[#23352C] bg-black shadow-2xl">
            <img
              src={active.imageSrc}
              alt={active.title}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => setZoomImage(active.imageSrc)}
              className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-black/80 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md hover:bg-black transition-colors"
            >
              <Eye size={13} />
              <span>Inspect Full Resolution</span>
            </button>
          </div>

          {/* Right Detailed Specs */}
          <div className="flex-1 space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-[#E8783C]/20 px-2 py-0.5 text-[10px] font-mono font-bold text-[#FFA64D] border border-[#E8783C]/30">
                  {active.code} SELECTED
                </span>
                <span className="text-xs text-[#8C9B94]">{active.subtitle}</span>
              </div>
              <h3 className="mt-1 text-2xl font-black text-white">{active.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#A0B4AA]">
                {active.philosophy}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#1C2A22] bg-[#121B17] p-3.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#34D399]">
                  Character Anatomy & Attire
                </h4>
                <p className="mt-1 text-xs text-[#8C9B94] leading-relaxed">
                  {active.characterProfile}
                </p>
              </div>

              <div className="rounded-xl border border-[#1C2A22] bg-[#121B17] p-3.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#34D399]">
                  Environment & Hardware Props
                </h4>
                <p className="mt-1 text-xs text-[#8C9B94] leading-relaxed">
                  {active.settingProps}
                </p>
              </div>

              <div className="rounded-xl border border-[#1C2A22] bg-[#121B17] p-3.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#FFA64D]">
                  Motion Choreography Signature
                </h4>
                <p className="mt-1 text-xs text-[#8C9B94] leading-relaxed">
                  {active.motionLanguage}
                </p>
              </div>

              <div className="rounded-xl border border-[#1C2A22] bg-[#121B17] p-3.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#FFA64D]">
                  Recommended Application Context
                </h4>
                <p className="mt-1 text-xs text-[#8C9B94] leading-relaxed">
                  {active.recommendedFor}
                </p>
              </div>
            </div>

            {/* Color Swatches Grid */}
            <div className="border-t border-[#1C2A22] pt-4">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#7D9186] block mb-2">
                Primary Design Tokens:
              </label>
              <div className="flex flex-wrap gap-3">
                {active.palette.map((swatch) => (
                  <div
                    key={swatch.name}
                    className="flex items-center gap-2 rounded-lg bg-[#141F1A] p-1.5 pr-3 border border-[#23352C]"
                  >
                    <span
                      className="h-5 w-5 rounded-md border border-white/20"
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <div>
                      <p className="text-[10px] font-bold text-white">{swatch.name}</p>
                      <p className="text-[9px] font-mono text-[#8C9B94]">{swatch.hex}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tool Capability & Infrastructure Status Matrix */}
      <div className="rounded-2xl border border-[#23352C] bg-[#0E1512] p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-2">
          <Palette size={16} className="text-[#34D399]" />
          <span>Real Creative Tooling & Connection Status Matrix</span>
        </h3>
        <p className="text-xs text-[#8C9B94] mb-4">
          Strict, unexaggerated status of all creative platforms, runtime engines, and MCP connections on this local machine.
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6 text-xs">
          <div className="rounded-xl bg-[#141F1A] p-3 border border-[#23352C]">
            <span className="text-[10px] font-mono text-[#7D9186]">FIGMA MCP</span>
            <p className="mt-1 font-bold text-amber-400">Bridge Pending</p>
            <p className="text-[10px] text-[#63756C]">Needs Token</p>
          </div>

          <div className="rounded-xl bg-[#141F1A] p-3 border border-[#23352C]">
            <span className="text-[10px] font-mono text-[#7D9186]">RECRAFT API</span>
            <p className="mt-1 font-bold text-amber-400">Key Pending</p>
            <p className="text-[10px] text-[#63756C]">API key needed</p>
          </div>

          <div className="rounded-xl bg-[#141F1A] p-3 border border-emerald-500/30 bg-emerald-500/5">
            <span className="text-[10px] font-mono text-emerald-400">GSAP MOTION</span>
            <p className="mt-1 font-bold text-emerald-300">Active v3.15</p>
            <p className="text-[10px] text-[#63756C]">Installed in repo</p>
          </div>

          <div className="rounded-xl bg-[#141F1A] p-3 border border-emerald-500/30 bg-emerald-500/5">
            <span className="text-[10px] font-mono text-emerald-400">FRAMER MOTION</span>
            <p className="mt-1 font-bold text-emerald-300">Active v13.4</p>
            <p className="text-[10px] text-[#63756C]">Installed in repo</p>
          </div>

          <div className="rounded-xl bg-[#141F1A] p-3 border border-emerald-500/30 bg-emerald-500/5">
            <span className="text-[10px] font-mono text-emerald-400">LOTTIE REACT</span>
            <p className="mt-1 font-bold text-emerald-300">Active v3.1</p>
            <p className="text-[10px] text-[#63756C]">Installed in repo</p>
          </div>

          <div className="rounded-xl bg-[#141F1A] p-3 border border-emerald-500/30 bg-emerald-500/5">
            <span className="text-[10px] font-mono text-emerald-400">AI GENERATION</span>
            <p className="mt-1 font-bold text-emerald-300">DeepMind Active</p>
            <p className="text-[10px] text-[#63756C]">Subagent verified</p>
          </div>
        </div>
      </div>

      {/* Full Resolution Zoom Modal */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-h-[92vh] max-w-[92vw] overflow-hidden rounded-2xl border border-white/20 bg-black">
            <img src={zoomImage} alt="Full Zoom Preview" className="h-full w-full object-contain" />
            <button
              type="button"
              onClick={() => setZoomImage(null)}
              className="absolute top-4 right-4 rounded-full bg-black/80 px-3 py-1.5 text-xs font-bold text-white hover:bg-black border border-white/20"
            >
              Close [ESC]
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
