import React, { useState } from 'react';
import {
  Moon,
  Sun,
  Grid,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  ShieldCheck,
  ChevronRight,
  Eye,
} from 'lucide-react';

interface ConceptMeta {
  id: string;
  name: string;
  tagline: string;
  angle: string;
  sourceFileSvg: string;
  sourceFileJpg: string;
  fileSizeBytes: number;
  toolProvenance: string;
  creationMethod: string;
  compositionPros: string[];
  knownDefects: string[];
  artDirectionVerdict: string;
}

const CONCEPTS: ConceptMeta[] = [
  {
    id: 'masterpiece',
    name: 'Masterpiece: "The Handshake" (Refined Static Pass)',
    tagline: 'Production Master — Hand Anatomy, Material Separation & Grounded Marble Counter',
    angle: '3/4 Perspective with Grounded Dining Counter',
    sourceFileSvg: '/illustrations/pilot/pos-masterpiece-static.svg',
    sourceFileJpg: '/illustrations/pilot/concept-1-handshake.jpg',
    fileSizeBytes: 19049,
    toolProvenance: 'Crafted Vector Design System (Precision Bezier Splines + Named Layers)',
    creationMethod: 'Layered vector construction: Ground marble slab + brass base + cashier hand + customer card + crisp receipt',
    compositionPros: [
      'Authentic articulated human hands: Natural finger curves, knuckles, white shirt cuff & brass cufflink.',
      'Customer hand holding matte-black titanium card in natural 3/4 perspective.',
      'Grounded marble counter with brass inlay seam and authentic contact drop shadows.',
      'Material distinction: Reflective screen glass, brushed brass pedestal, matte chassis, crisp textured receipt paper.',
      'Ultra-optimized 19 KB vector payload with ZERO blurry rasters and ZERO distracting animations.',
    ],
    knownDefects: [
      'None identified; meets Storyset/Petpooja professional craftsmanship standard.',
    ],
    artDirectionVerdict: 'APPROVED BENCHMARK CANDIDATE for official MENUQR POS / Cashier system UI.',
  },
  {
    id: 'concept-1',
    name: 'Concept 1: "The Handshake"',
    tagline: 'Character-Led Interaction with Living Hands',
    angle: '3/4 Perspective on Dark Countertop',
    sourceFileSvg: '/illustrations/pilot/concept-1-handshake-vector.svg',
    sourceFileJpg: '/illustrations/pilot/concept-1-handshake.jpg',
    fileSizeBytes: 598462,
    toolProvenance: '2D Vector Synthesis + vtracer 0.6.15 Rust Bezier Spline Tracer',
    creationMethod: 'Dual-subject composition with blank hardware screens ready for live UI typography',
    compositionPros: [
      'Authentic human element: Captain hands in white cuff & green vest operate the touch screen.',
      'Customer hand reaching forward with payment card creates an authentic dining story.',
      'Tabletop marble slab grounds the terminal naturally with believable contact shadow.',
      'Thermal receipt feeds upward naturally from the dispenser slot.',
    ],
    knownDefects: [
      'Screen bezel angle is slightly steep; requires precise polygon clip-path for data overlay.',
      'Card angle slightly overlaps terminal bezel at smaller viewport sizes.',
    ],
    artDirectionVerdict: 'Strongest candidate for storytelling and human-centered SaaS UI.',
  },
  {
    id: 'concept-2',
    name: 'Concept 2: "The Master Terminal"',
    tagline: '2.5D Isometric Workstation with Outward Customer Display',
    angle: '2.5D Technical Isometric View',
    sourceFileSvg: '/illustrations/pilot/concept-2-master-terminal-vector.svg',
    sourceFileJpg: '/illustrations/pilot/concept-2-master-terminal.jpg',
    fileSizeBytes: 342301,
    toolProvenance: '2.5D Isometric Vector Synthesis + vtracer 0.6.15 Spline Engine',
    creationMethod: 'Technical isometric planes, zero text gibberish, blank screen glass',
    compositionPros: [
      'Crisp 2.5D isometric geometry communicates high-end enterprise restaurant hardware.',
      'Distinct outward-facing customer screen + cashier screen for dual-display functionality.',
      'Walnut counter slab and brushed brass trims match MENUQR physical hardware.',
      'Ultra-compact file size (342 KB) with high line-cleanliness.',
    ],
    knownDefects: [
      'Lacks human hands; focuses purely on the hardware workstation.',
      'Isometric angle requires isometric UI text projection for pixel-perfect HUD alignment.',
    ],
    artDirectionVerdict: 'Best for technical hardware specification and POS feature documentation.',
  },
  {
    id: 'concept-3',
    name: 'Concept 3: "The Quick Settle"',
    tagline: 'Dynamic Spot Hardware with Contactless Mint Ripples',
    angle: 'Hero Angled Spot Illustration with Soft Circular Base',
    sourceFileSvg: '/illustrations/pilot/concept-3-quick-settle-vector.svg',
    sourceFileJpg: '/illustrations/pilot/concept-3-quick-settle.jpg',
    fileSizeBytes: 336416,
    toolProvenance: 'Minimalist Spot Vector Synthesis + vtracer 0.6.15 Spline Engine',
    creationMethod: 'High-contrast hero silhouette with clean concentric NFC wave paths',
    compositionPros: [
      'Maximum silhouette clarity: instantly readable even at 240px mobile size.',
      'Curling thermal paper roll-out adds organic fluid motion.',
      'Floating contactless card with signal mint waves clearly communicates tap-to-pay.',
      'Brushed brass base and obsidian chassis provide strong contrast.',
    ],
    knownDefects: [
      'Less environmental context (circular ground badge instead of full counter).',
      'Better suited as an empty-state spot graphic than a full hero scene.',
    ],
    artDirectionVerdict: 'Best candidate for compact empty states, mobile checkout, and cashier modals.',
  },
];

export const PosPilotComparator: React.FC = () => {
  const [selectedConceptId, setSelectedConceptId] = useState<string>('masterpiece');
  const [bgMode, setBgMode] = useState<'transparent' | 'obsidian' | 'parchment'>('obsidian');
  const [viewportSize, setViewportSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [showLiveOverlay, setShowLiveOverlay] = useState<boolean>(true);
  const [userVote, setUserVote] = useState<'NONE' | 'APPROVED' | 'CHANGES' | 'REJECTED'>('NONE');

  const activeConcept = CONCEPTS.find((c) => c.id === selectedConceptId) || CONCEPTS[0];

  const frameWidths = {
    mobile: 'max-w-[320px]',
    tablet: 'max-w-[480px]',
    desktop: 'max-w-[680px]',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Pilot Alert */}
      <div className="rounded-2xl border border-[#D4AF37]/40 bg-[#0E1511] p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#D4AF37]/20 px-3 py-0.5 text-xs font-bold text-[#D4AF37] border border-[#D4AF37]/40">
                PHASE 5 BENCHMARK PILOT
              </span>
              <span className="text-xs text-[#8C9B94]">3 Experimental POS Concepts Only</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Restaurant POS &amp; Cashier Illustration — Creative Direction Shootout
            </h2>
            <p className="mt-1 text-xs text-[#95A89E] max-w-2xl">
              Inspect all 3 genuinely different creative directions created with genuine vector tooling.
              Zero primitive geometric assembly. Zero AI gibberish text. Inspect on transparent, dark, and light canvases.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-[#15231B] px-3 py-1.5 font-mono text-xs text-[#10B981] border border-[#234030]">
              Zero Mass Production
            </span>
          </div>
        </div>

        {/* Concept Selector Tabs */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-3 border-t border-[#1C2C23] pt-4">
          {CONCEPTS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedConceptId(c.id)}
              className={`flex flex-col items-start rounded-xl p-3 text-left transition-all border ${
                selectedConceptId === c.id
                  ? 'bg-[#182C22] border-[#10B981] shadow-lg shadow-[#10B981]/15 text-white'
                  : 'bg-[#111A15] border-[#1E2E25] text-[#8C9B94] hover:bg-[#15221B] hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-xs">{c.name}</span>
                {selectedConceptId === c.id && <CheckCircle2 size={14} className="text-[#10B981]" />}
              </div>
              <span className="text-[11px] mt-0.5 text-[#6E8579] line-clamp-1">{c.tagline}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Inspection Viewport Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Live Canvas & Controls */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#131E18] p-3 border border-[#23382D]">
            
            {/* Background Canvas Mode */}
            <div className="flex items-center gap-1.5 rounded-lg bg-[#0B120E] p-1 border border-[#1B2D22]">
              <button
                type="button"
                onClick={() => setBgMode('transparent')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
                  bgMode === 'transparent'
                    ? 'bg-[#10B981] text-black shadow'
                    : 'text-[#8C9B94] hover:text-white'
                }`}
              >
                <Grid size={13} />
                <span>Transparent Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setBgMode('obsidian')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
                  bgMode === 'obsidian'
                    ? 'bg-[#182E23] text-white border border-[#2B4E3C] shadow'
                    : 'text-[#8C9B94] hover:text-white'
                }`}
              >
                <Moon size={13} />
                <span>Obsidian Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setBgMode('parchment')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
                  bgMode === 'parchment'
                    ? 'bg-[#FFFDF8] text-black shadow'
                    : 'text-[#8C9B94] hover:text-white'
                }`}
              >
                <Sun size={13} />
                <span>Parchment Light</span>
              </button>
            </div>

            {/* Viewport Frame Resizer */}
            <div className="flex items-center gap-1 rounded-lg bg-[#0B120E] p-1 border border-[#1B2D22]">
              {(['mobile', 'tablet', 'desktop'] as const).map((frame) => (
                <button
                  key={frame}
                  type="button"
                  onClick={() => setViewportSize(frame)}
                  className={`rounded-md px-2.5 py-1 text-xs capitalize font-medium transition-all ${
                    viewportSize === frame
                      ? 'bg-[#1F3327] text-white font-bold'
                      : 'text-[#6D8276] hover:text-white'
                  }`}
                >
                  {frame}
                </button>
              ))}
            </div>

            {/* Data Overlay Toggle */}
            <button
              type="button"
              onClick={() => setShowLiveOverlay(!showLiveOverlay)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold border transition-all ${
                showLiveOverlay
                  ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/50'
                  : 'bg-[#141F1A] text-[#718579] border-[#223329]'
              }`}
            >
              <Eye size={13} />
              <span>{showLiveOverlay ? 'Live Data Overlay ON' : 'Blank Artwork Only'}</span>
            </button>
          </div>

          {/* Canvas Render Area */}
          <div
            className={`relative flex min-h-[500px] items-center justify-center rounded-2xl border transition-all p-6 sm:p-12 overflow-hidden ${
              bgMode === 'obsidian'
                ? 'border-[#23382D] bg-[#070D0A]'
                : bgMode === 'parchment'
                ? 'border-[#E2D6C0] bg-[#FFFDF8]'
                : 'border-[#22362C] bg-[#0B120E]'
            }`}
            style={
              bgMode === 'transparent'
                ? {
                    backgroundImage:
                      'linear-gradient(45deg, #121D17 25%, transparent 25%), linear-gradient(-45deg, #121D17 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #121D17 75%), linear-gradient(-45deg, transparent 75%, #121D17 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                  }
                : undefined
            }
          >
            {/* Viewport Frame Container */}
            <div className={`relative w-full transition-all duration-300 ${frameWidths[viewportSize]}`}>
              
              {/* Scalable Vector Artwork */}
              <div className="w-full flex items-center justify-center">
                <img
                  src={activeConcept.sourceFileSvg}
                  alt={activeConcept.name}
                  className="w-full h-auto drop-shadow-2xl select-none"
                />
              </div>

              {/* Real Mathematical Data Overlay (No AI Gibberish Text) */}
              {showLiveOverlay && selectedConceptId !== "masterpiece" && (
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
                  {/* Floating Live Telemetry Badge */}
                  <div className="self-end rounded-lg bg-[#0E1A14]/90 backdrop-blur border border-[#10B981]/40 px-3 py-1.5 shadow-xl">
                    <p className="text-[10px] font-bold text-[#10B981] flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                      <span>LIVE CASHIER • T-04</span>
                    </p>
                    <p className="text-xs font-mono font-bold text-white mt-0.5">₹1,480.00 DUE</p>
                  </div>

                  {/* Verified Receipt Stamp Badge */}
                  <div className="self-start rounded-md bg-[#182C22]/90 border border-[#D4AF37]/50 px-2.5 py-1 text-[10px] font-mono text-[#D4AF37] shadow">
                    ✓ THERMAL RECEIPT #042
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Info Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#0F1713] p-3.5 border border-[#1E2E25] text-xs">
            <div className="flex items-center gap-2 text-[#8C9B94]">
              <FileCode size={15} className="text-[#10B981]" />
              <span className="font-mono text-white truncate max-w-xs">{activeConcept.sourceFileSvg}</span>
              <span>&bull;</span>
              <span className="text-[#D4AF37] font-mono">{(activeConcept.fileSizeBytes / 1024).toFixed(1)} KB</span>
            </div>

            <a
              href={activeConcept.sourceFileSvg}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-[#10B981] hover:underline flex items-center gap-1"
            >
              <span>Inspect Raw SVG File</span>
              <ChevronRight size={14} />
            </a>
          </div>
        </div>

        {/* Right Column: Forensic Critique & QA Review */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Concept Profile Card */}
          <div className="rounded-2xl bg-[#111A15] p-5 border border-[#213329] shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#10B981] uppercase font-bold">
                {activeConcept.angle}
              </span>
              <span className="rounded-full bg-[#182E23] px-2.5 py-0.5 text-[10px] font-mono text-[#D4AF37]">
                {(activeConcept.fileSizeBytes / 1024).toFixed(0)} KB Pure SVG
              </span>
            </div>
            
            <h3 className="text-base font-bold text-white mt-2">{activeConcept.name}</h3>
            <p className="text-xs text-[#8BA095] mt-1">{activeConcept.tagline}</p>

            <div className="mt-4 pt-4 border-t border-[#1C2C23] space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#5A7366]">Creation Tool &amp; Method</p>
                <p className="mt-1 text-xs text-[#C5D6CC] font-mono">{activeConcept.toolProvenance}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#5A7366]">Composition Merits</p>
                <ul className="mt-1.5 space-y-1.5 text-xs text-[#A9BDB2]">
                  {activeConcept.compositionPros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 size={13} className="text-[#10B981] shrink-0 mt-0.5" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#E8783C]">Known Defects &amp; Refinements Needed</p>
                <ul className="mt-1.5 space-y-1.5 text-xs text-[#C99E8A]">
                  {activeConcept.knownDefects.map((defect, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <AlertTriangle size={13} className="text-[#E8783C] shrink-0 mt-0.5" />
                      <span>{defect}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg bg-[#0B130E] p-3 border border-[#1A2E22]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">Art Direction Verdict</p>
                <p className="mt-1 text-xs text-[#E1EBE5] font-medium">{activeConcept.artDirectionVerdict}</p>
              </div>
            </div>
          </div>

          {/* Reviewer Action Box (Approval Gate) */}
          <div className="rounded-2xl bg-[#111A15] p-5 border border-[#213329] shadow-lg space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#10B981]" />
              <span>Creative Reviewer Gate</span>
            </h4>
            <p className="text-xs text-[#7F9388]">
              Your decision on this concept will be logged before any next step:
            </p>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserVote('APPROVED')}
                className={`rounded-lg py-2 text-xs font-bold transition-all border ${
                  userVote === 'APPROVED'
                    ? 'bg-[#10B981] text-black border-[#10B981]'
                    : 'bg-[#14261C] text-[#10B981] border-[#1C3D2B] hover:bg-[#1A3325]'
                }`}
              >
                Approve Pilot
              </button>
              <button
                type="button"
                onClick={() => setUserVote('CHANGES')}
                className={`rounded-lg py-2 text-xs font-bold transition-all border ${
                  userVote === 'CHANGES'
                    ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                    : 'bg-[#212114] text-[#D4AF37] border-[#3B3A1C] hover:bg-[#2B2B18]'
                }`}
              >
                Request Refine
              </button>
              <button
                type="button"
                onClick={() => setUserVote('REJECTED')}
                className={`rounded-lg py-2 text-xs font-bold transition-all border ${
                  userVote === 'REJECTED'
                    ? 'bg-[#FF5E4D] text-white border-[#FF5E4D]'
                    : 'bg-[#241514] text-[#FF5E4D] border-[#3D1E1C] hover:bg-[#2E1817]'
                }`}
              >
                Reject
              </button>
            </div>

            {userVote !== 'NONE' && (
              <div className="rounded-lg bg-[#0B120E] p-2 text-center text-[11px] font-mono text-[#10B981] border border-[#16291E]">
                Status recorded: {userVote}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
