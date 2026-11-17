import React, { useState } from 'react';
import { IllusPosBillingTerminal } from '../../components/brand-illustrations';
import {
  Sparkles,
  Printer,
  Moon,
  Sun,
  Code2,
  CheckCircle2,
  Copy,
  Layers,
  ShieldCheck,
} from 'lucide-react';

export const BenchmarkSingleShowcase: React.FC = () => {
  const [theme, setTheme] = useState<'obsidian' | 'parchment'>('obsidian');
  const [isPrinting, setIsPrinting] = useState<boolean>(true);
  const [animated, setAnimated] = useState<boolean>(true);
  const [activeFrame, setActiveFrame] = useState<'mobile' | 'tablet' | 'desktop' | 'full'>('desktop');
  const [showCode, setShowCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const frameWidths = {
    mobile: 'max-w-[340px]',
    tablet: 'max-w-[460px]',
    desktop: 'max-w-[620px]',
    full: 'max-w-4xl',
  };

  const handlePrintToggle = () => {
    setIsPrinting(false);
    setTimeout(() => {
      setIsPrinting(true);
    }, 150);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(
      `<IllusPosBillingTerminal theme="${theme}" animated={${animated}} isPrinting={${isPrinting}} size="responsive" />`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Alert */}
      <div className="rounded-2xl border border-[#10B981]/30 bg-[#0A1611] p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
              <Sparkles size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#10B981]/20 px-2.5 py-0.5 text-[11px] font-bold text-[#10B981] border border-[#10B981]/40">
                  BENCHMARK ASSET #1
                </span>
                <span className="text-xs text-[#8C9B94]">100% Brand Vector &amp; Motion</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                POS Billing Terminal &amp; Instant Thermal Receipt
              </h2>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="rounded-lg bg-[#14261D] px-3 py-1.5 text-[#10B981] border border-[#234533]">
              100% Transparent Ground
            </span>
            <span className="rounded-lg bg-[#14261D] px-3 py-1.5 text-[#D4AF37] border border-[#234533]">
              Zero Raster Collages
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: The Interactive Canvas */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Canvas Toolbar Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#131E18] p-3 border border-[#23382D]">
            {/* Theme Toggle (Dark vs Parchment) */}
            <div className="flex items-center gap-1.5 rounded-lg bg-[#0B120E] p-1 border border-[#1B2D22]">
              <button
                type="button"
                onClick={() => setTheme('obsidian')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
                  theme === 'obsidian'
                    ? 'bg-[#10B981] text-black shadow'
                    : 'text-[#8C9B94] hover:text-white'
                }`}
              >
                <Moon size={13} />
                <span>Obsidian Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('parchment')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
                  theme === 'parchment'
                    ? 'bg-[#FFFDF8] text-black shadow'
                    : 'text-[#8C9B94] hover:text-white'
                }`}
              >
                <Sun size={13} />
                <span>Parchment Light</span>
              </button>
            </div>

            {/* Viewport Frame Size */}
            <div className="flex items-center gap-1 rounded-lg bg-[#0B120E] p-1 border border-[#1B2D22]">
              {(['mobile', 'tablet', 'desktop', 'full'] as const).map((frame) => (
                <button
                  key={frame}
                  type="button"
                  onClick={() => setActiveFrame(frame)}
                  className={`rounded-md px-2.5 py-1 text-xs capitalize font-medium transition-all ${
                    activeFrame === frame
                      ? 'bg-[#1F3327] text-white font-bold'
                      : 'text-[#6D8276] hover:text-white'
                  }`}
                >
                  {frame}
                </button>
              ))}
            </div>

            {/* Interactive Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintToggle}
                className="flex items-center gap-1.5 rounded-lg bg-[#E8783C] px-3.5 py-1.5 text-xs font-bold text-white shadow-lg hover:bg-[#FF8847] transition-all"
              >
                <Printer size={13} />
                <span>Print Bill</span>
              </button>
              <button
                type="button"
                onClick={() => setAnimated(!animated)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold border transition-all ${
                  animated
                    ? 'bg-[#142A1E] text-[#10B981] border-[#10B981]/40'
                    : 'bg-[#161D19] text-[#788C82] border-[#26382E]'
                }`}
              >
                {animated ? 'Motion On' : 'Paused'}
              </button>
            </div>
          </div>

          {/* Canvas Render Surface (Transparent Grid Background) */}
          <div
            className={`relative flex min-h-[460px] items-center justify-center rounded-2xl border transition-all p-6 sm:p-12 overflow-hidden ${
              theme === 'obsidian'
                ? 'border-[#23382D] bg-[#070D0A]'
                : 'border-[#E2D6C0] bg-[#FFFDF8]'
            }`}
            style={{
              backgroundImage:
                theme === 'obsidian'
                  ? 'radial-gradient(#15261D 1px, transparent 1px)'
                  : 'radial-gradient(#E8DFC9 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          >
            {/* Viewport Frame Wrapper */}
            <div className={`w-full transition-all duration-300 ${frameWidths[activeFrame]}`}>
              <IllusPosBillingTerminal
                theme={theme}
                animated={animated}
                isPrinting={isPrinting}
                size="responsive"
                className="drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Code Inspection & Integration Bar */}
          <div className="flex items-center justify-between rounded-xl bg-[#0F1713] p-3 border border-[#1E2E25]">
            <div className="flex items-center gap-2 text-xs text-[#8C9B94]">
              <Code2 size={15} className="text-[#10B981]" />
              <span className="font-mono text-[#D4AF37]">
                &lt;IllusPosBillingTerminal /&gt;
              </span>
              <span>&bull; Ready for /app/cashier</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                className="text-xs text-[#8C9B94] hover:text-white underline underline-offset-4"
              >
                {showCode ? 'Hide Code' : 'View Code'}
              </button>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1 rounded-lg bg-[#182920] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#20382B] transition-colors"
              >
                {copied ? <CheckCircle2 size={13} className="text-[#10B981]" /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy JSX'}</span>
              </button>
            </div>
          </div>

          {/* Expanded Code Box */}
          {showCode && (
            <div className="rounded-xl bg-[#080D0A] p-4 border border-[#1A2C22] font-mono text-xs text-[#C5D6CC] overflow-x-auto">
              <pre>{`import { IllusPosBillingTerminal } from '@/components/brand-illustrations';

// In CashierPanel.tsx or BillPage.tsx:
<IllusPosBillingTerminal
  theme="${theme}"
  animated={${animated}}
  isPrinting={${isPrinting}}
  size="responsive"
/>`}</pre>
            </div>
          )}
        </div>

        {/* Right Column: Spec & Provenance Verification */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Feature Card */}
          <div className="rounded-2xl bg-[#111A15] p-5 border border-[#213329] shadow-lg">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#10B981] flex items-center gap-2">
              <ShieldCheck size={16} />
              <span>Verified Specifications</span>
            </h3>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-[#1E2C24]">
                <span className="text-[#7D9186]">Visual Style</span>
                <span className="font-bold text-white">2D Semi-Flat Vector</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#1E2C24]">
                <span className="text-[#7D9186]">Background</span>
                <span className="font-bold text-[#10B981]">100% Transparent</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#1E2C24]">
                <span className="text-[#7D9186]">Stroke Contours</span>
                <span className="font-mono text-white">2.5px Obsidian/Emerald</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#1E2C24]">
                <span className="text-[#7D9186]">Micro-Motion</span>
                <span className="font-bold text-[#E8783C]">Thermal Slide + NFC Pulse</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#1E2C24]">
                <span className="text-[#7D9186]">Hardware Prop</span>
                <span className="text-white">Matte Dual-Screen POS</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#7D9186]">Target Route</span>
                <span className="font-mono text-[#D4AF37]">/app/cashier</span>
              </div>
            </div>
          </div>

          {/* Brand Palette Applied */}
          <div className="rounded-2xl bg-[#111A15] p-5 border border-[#213329] shadow-lg">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-2">
              <Layers size={16} />
              <span>Applied Brand Palette</span>
            </h3>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2.5 rounded-lg bg-[#0B120E] p-2 border border-[#1A2A20]">
                <span className="h-4 w-4 rounded-full bg-[#10B981] shadow" />
                <div>
                  <p className="font-bold text-white">Signal Mint</p>
                  <p className="font-mono text-[10px] text-[#71857A]">#10B981</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-lg bg-[#0B120E] p-2 border border-[#1A2A20]">
                <span className="h-4 w-4 rounded-full bg-[#D4AF37] shadow" />
                <div>
                  <p className="font-bold text-white">Brushed Brass</p>
                  <p className="font-mono text-[10px] text-[#71857A]">#D4AF37</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-lg bg-[#0B120E] p-2 border border-[#1A2A20]">
                <span className="h-4 w-4 rounded-full bg-[#070D0A] border border-[#2C3D32] shadow" />
                <div>
                  <p className="font-bold text-white">Obsidian Base</p>
                  <p className="font-mono text-[10px] text-[#71857A]">#070D0A</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-lg bg-[#0B120E] p-2 border border-[#1A2A20]">
                <span className="h-4 w-4 rounded-full bg-[#E8783C] shadow" />
                <div>
                  <p className="font-bold text-white">Terracotta</p>
                  <p className="font-mono text-[10px] text-[#71857A]">#E8783C</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
