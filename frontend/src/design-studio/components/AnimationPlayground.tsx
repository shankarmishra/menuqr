import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Gauge, Smartphone, Monitor, Sparkles } from 'lucide-react';
import { DESIGN_MANIFEST } from '../manifest';
import { AssetRenderer } from './AssetRenderer';

export const AnimationPlayground: React.FC = () => {
  const plannedAnimations = DESIGN_MANIFEST.filter((a) => a.type === 'animation');
  const [selectedAnimId, setSelectedAnimId] = useState<string>(plannedAnimations[0]?.id || 'anim-qr-scanner');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [loop, setLoop] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [key, setKey] = useState<number>(0);

  const activeSpec = plannedAnimations.find((a) => a.id === selectedAnimId) || plannedAnimations[0];

  const handleReplay = () => {
    setKey((prev) => prev + 1);
    setIsPlaying(true);
  };

  const handleSelectAnimation = (id: string) => {
    setSelectedAnimId(id);
    setKey((prev) => prev + 1);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col gap-8 rounded-3xl border border-[#23352C] bg-[#101713] p-6 sm:p-8">
      {/* Playground Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#23352C] pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#FFA64D]">
            INTERACTIVE MOTION RUNTIME · 8 ACTIVE BLUEPRINT ANIMATIONS
          </span>
          <h2 className="mt-1 text-2xl font-black text-white">
            MENUQR Animation Playground
          </h2>
          <p className="text-xs text-[#8C9B94]">
            Hardware-accelerated SVG & React motion suite. Test choreography, keyframe loops, velocity, and accessibility across devices.
          </p>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>8 of 8 Live & Running</span>
          </span>
        </div>
      </div>

      {/* Animation Selector Pills */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-[#7E9187] mb-2 block">
          Select Active Motion Canvas:
        </label>
        <div className="flex flex-wrap gap-2">
          {plannedAnimations.map((anim, idx) => {
            const isCurrent = anim.id === selectedAnimId;
            return (
              <button
                key={anim.id}
                type="button"
                onClick={() => handleSelectAnimation(anim.id)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-[#E8783C] text-white shadow-lg shadow-[#E8783C]/25 scale-[1.02]'
                    : 'bg-[#141F1A] text-[#9FB3A8] hover:bg-[#1D2D25] hover:text-white border border-[#23352C]'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${isCurrent ? 'bg-white' : 'bg-[#E8783C]'}`} />
                <span>#{idx + 1} {anim.shortTitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Interactive Canvas Screen */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#23352C] bg-[#0A0F0D] p-6 lg:col-span-7">
          <div
            className={`transition-all duration-300 flex items-center justify-center ${
              viewport === 'mobile' ? 'w-[280px]' : 'w-full max-w-[420px]'
            }`}
          >
            <div className="w-full">
              <AssetRenderer
                key={`${selectedAnimId}-${key}`}
                assetId={selectedAnimId}
                animated={isPlaying}
                speed={speed}
                loop={loop}
                reducedMotion={reducedMotion}
                className="w-full h-auto drop-shadow-2xl"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 w-full border-t border-[#1C2922] pt-4 text-[11px] font-mono text-[#63756C]">
            <p>
              Target: <span className="text-[#34B56A] font-bold">{activeSpec?.componentName}</span> ({activeSpec?.version})
            </p>
            <p className="text-[#E8783C] font-semibold">{activeSpec?.relatedFeature}</p>
          </div>
        </div>

        {/* Right: Motion Controls Console */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#23352C] bg-[#141E1A] p-6 lg:col-span-5">
          <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Gauge size={16} className="text-[#E8783C]" />
              <span>Motion Choreography Controls</span>
            </h3>

            {/* Play / Pause / Replay Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
                  isPlaying
                    ? 'bg-[#E8783C] text-white shadow-lg shadow-[#E8783C]/20'
                    : 'bg-[#23352C] text-[#C5D1CB] hover:bg-[#2F473B] hover:text-white'
                }`}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span>{isPlaying ? 'Pause Motion' : 'Play Motion'}</span>
              </button>

              <button
                type="button"
                onClick={handleReplay}
                className="rounded-xl border border-[#2A3D34] bg-[#1B2721] p-2.5 text-[#C5D1CB] hover:bg-[#24352D] hover:text-white transition-colors"
                title="Restart Animation"
              >
                <RotateCcw size={15} />
              </button>
            </div>

            {/* Speed Selector */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#7E9187]">
                  Playback Speed:
                </label>
                <span className="font-mono text-xs font-bold text-[#E8783C]">{speed}x</span>
              </div>
              <div className="mt-2 grid grid-cols-5 gap-1.5">
                {[0.25, 0.5, 1, 1.5, 2].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSpeed(s)}
                    className={`rounded-xl py-1.5 text-xs font-bold transition-colors ${
                      speed === s
                        ? 'bg-[#E8783C] text-white'
                        : 'bg-[#0E1512] text-[#7E9187] hover:bg-[#1C2A23] hover:text-white border border-[#23352C]'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Loop & Reduced Motion Toggles */}
            <div className="space-y-3 pt-2 border-t border-[#23352C]">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-[#C5D1CB]">Continuous Loop</span>
                  <p className="text-[10px] text-[#63756C]">Cycle indefinitely</p>
                </div>
                <input
                  type="checkbox"
                  checked={loop}
                  onChange={(e) => setLoop(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#E8783C]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-[#C5D1CB]">Simulate Reduced Motion</span>
                  <p className="text-[10px] text-[#63756C]">Graceful a11y degradation for vestibular sensitivities</p>
                </div>
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={(e) => setReducedMotion(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#E8783C]"
                />
              </label>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-xs font-semibold text-[#C5D1CB]">Viewport Frame</span>
                  <p className="text-[10px] text-[#63756C]">Test responsive viewport constraints</p>
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-[#0E1512] p-1 border border-[#23352C]">
                  <button
                    type="button"
                    onClick={() => setViewport('desktop')}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                      viewport === 'desktop' ? 'bg-[#E8783C] text-white font-bold' : 'text-[#7E9187]'
                    }`}
                    title="Desktop frame"
                  >
                    <Monitor size={13} />
                    <span>Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewport('mobile')}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                      viewport === 'mobile' ? 'bg-[#E8783C] text-white font-bold' : 'text-[#7E9187]'
                    }`}
                    title="Mobile 280px frame"
                  >
                    <Smartphone size={13} />
                    <span>Mobile</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-[#0C1310] p-3 border border-[#1E2C25] text-[11px] text-[#8C9B94]">
            <p className="font-bold text-white flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#E8783C]" />
              <span>Choreography Details:</span>
            </p>
            <p className="mt-1 leading-relaxed">
              {activeSpec?.description}
            </p>
            <p className="mt-1 font-mono text-[10px] text-[#556D62]">
              Source: {activeSpec?.sourceFile}
            </p>
          </div>
        </div>
      </div>

      {/* Grid of All 8 Active Motion Assets with Live Previews */}
      <div className="mt-4 pt-6 border-t border-[#23352C]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#A0B4AA]">
            All 8 Blueprint Motion Assets (Live Simultaneous Mini-Preview)
          </h3>
          <span className="text-xs text-[#63756C]">Click any card to load onto main stage</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plannedAnimations.map((anim, idx) => {
            const isSelected = anim.id === selectedAnimId;
            return (
              <div
                key={anim.id}
                onClick={() => handleSelectAnimation(anim.id)}
                className={`group cursor-pointer rounded-2xl border p-4 transition-all hover:border-[#E8783C]/70 hover:scale-[1.01] ${
                  isSelected
                    ? 'border-[#E8783C] bg-[#18261F] ring-2 ring-[#E8783C]/40'
                    : 'border-[#24352D] bg-[#121B17]'
                }`}
              >
                {/* Live Mini Preview Box */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#080D0B] border border-[#1C2A22] flex items-center justify-center p-2 mb-3">
                  <div className="w-full max-w-[200px]">
                    <AssetRenderer
                      assetId={anim.id}
                      animated={true}
                      speed={1}
                      loop={true}
                      className="w-full h-auto"
                    />
                  </div>
                  {isSelected && (
                    <span className="absolute top-2 right-2 rounded-full bg-[#E8783C] px-2 py-0.5 text-[9px] font-bold text-white shadow">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#E8783C] bg-[#E8783C]/10 px-2 py-0.5 rounded">
                    #{idx + 1} {anim.id}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    Live
                  </span>
                </div>

                <h4 className="mt-2 text-xs font-bold text-white group-hover:text-[#E8783C] transition-colors">
                  {anim.name}
                </h4>
                <p className="mt-1 text-[11px] text-[#7E9187] line-clamp-2">{anim.description}</p>
                <div className="mt-3 flex items-center justify-between border-t border-[#1C2922] pt-2 text-[10px]">
                  <span className="text-[#34B56A] font-mono">{anim.componentName}</span>
                  <span className="text-[#E8783C] font-semibold group-hover:underline">Play on Stage →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
