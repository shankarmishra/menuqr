import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChefHat, CheckCircle2, Copy, Download, RefreshCw, Image as ImageIcon, Utensils, Smartphone, Leaf } from 'lucide-react';
import { toPng, toSvg } from 'html-to-image';
import { STICKER_TEMPLATES } from './StickerTemplates';
import RoyalWalnutStickerCard from './RoyalWalnutStickerCard';

type GenerationStage =
  | 'IDLE'
  | 'INITIALIZING'
  | 'PREPARING_DESIGN'
  | 'PRINTING_LOGO'
  | 'PRINTING_RESTAURANT'
  | 'GENERATING_QR'
  | 'PRINTING_DETAILS'
  | 'FINISHING'
  | 'EJECTING'
  | 'RECALIBRATING'
  | 'COMPLETE';

interface ClientProps {
  id: string;
  businessName: string;
  category: string;
  menuSlug: string;
  tagline?: string;
  logo?: string;
}

interface Props {
  client?: ClientProps | null;
  menuUrl: string;
  qrImage: string;
}

export default function MenusQRStickerGenerator({ client, menuUrl, qrImage }: Props) {
  const [stage, setStage] = useState<GenerationStage>('COMPLETE');
  const [templateId, setTemplateId] = useState<string>('menusqr-walnut-gold');
  const prefersReducedMotion = useReducedMotion();
  const stickerRef = useRef<HTMLDivElement>(null);
  
  const template = STICKER_TEMPLATES.find((t) => t.id === templateId) || STICKER_TEMPLATES[0];

  const restaurantName = client?.businessName || 'shankar hotel';
  const category = client?.category || 'RESTAURANT & CAFE';
  const tagline = client?.tagline || 'Digital Menu';

  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (stage === 'IDLE' || stage === 'COMPLETE') return;

    const sequence = async () => {
      const wait = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, prefersReducedMotion ? ms / 4 : ms));

      if (stage === 'RECALIBRATING') {
        setProgress(30);
        await wait(300);
        setStage('FINISHING');
        setProgress(80);
        await wait(400);
        setStage('COMPLETE');
        setProgress(100);
        return;
      }

      setProgress(10);
      await wait(400);
      
      setStage('PREPARING_DESIGN');
      setProgress(25);
      await wait(400);

      setStage('PRINTING_LOGO');
      setProgress(40);
      await wait(400);

      setStage('PRINTING_RESTAURANT');
      setProgress(55);
      await wait(400);

      setStage('GENERATING_QR');
      setProgress(75);
      await wait(500);

      setStage('PRINTING_DETAILS');
      setProgress(90);
      await wait(400);

      setStage('FINISHING');
      setProgress(98);
      await wait(500);

      setStage('EJECTING');
      setProgress(100);
      await wait(400);

      setStage('COMPLETE');
    };

    void sequence();
  }, [stage, prefersReducedMotion]);

  const handleTemplateChange = (newTemplateId: string) => {
    if (newTemplateId === templateId) return;
    setTemplateId(newTemplateId);
    if (stage === 'COMPLETE') {
      setStage('RECALIBRATING');
    }
  };

  const downloadStickerPNG = async () => {
    if (!stickerRef.current) return;
    try {
      const dataUrl = await toPng(stickerRef.current, { cacheBust: true, quality: 1, pixelRatio: 3 });
      const link = document.createElement('a');
      link.download = `${client?.menuSlug || 'menu'}-sticker.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download sticker PNG:', err);
    }
  };

  const downloadStickerSVG = async () => {
    if (!stickerRef.current) return;
    try {
      const svg = await toSvg(stickerRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `${client?.menuSlug || 'menu'}-sticker.svg`;
      link.href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Failed to download sticker SVG:', err);
    }
  };

  const isPrinting = stage !== 'IDLE' && stage !== 'COMPLETE';
  const showSticker = stage !== 'IDLE' && stage !== 'INITIALIZING' && stage !== 'PREPARING_DESIGN';

  return (
    <div className="relative flex h-full min-h-[750px] w-full flex-col items-center justify-center overflow-hidden bg-[#0d1210] p-4 sm:p-6 text-white font-sans">
      
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
        <div 
          className="h-[500px] w-[500px] rounded-full opacity-[0.04] blur-[120px] transition-colors duration-1000"
          style={{ backgroundColor: template.accentColor }} 
        />
      </div>

      {/* Fabrication Engine Status Bar */}
      <div className="absolute top-4 sm:top-6 z-20 flex w-full max-w-3xl items-start justify-between px-4 sm:px-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <ChefHat size={18} style={{ color: template.accentColor }} />
            <span className="text-xs sm:text-sm font-bold tracking-widest text-[#dce5df]">MENUSQR SYSTEM</span>
          </div>
          <span className="text-[10px] sm:text-xs text-[#94a39d] font-mono">FABRICATION ENGINE v2.0</span>
        </div>

        <div className="flex w-32 sm:w-48 flex-col gap-2 rounded-lg border border-white/10 bg-[#111815]/80 p-2 sm:p-3 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-2 text-[10px] sm:text-xs">
            <div 
              className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${isPrinting ? 'animate-pulse' : ''}`} 
              style={{ backgroundColor: isPrinting ? template.accentColor : '#2ec4b6' }} 
            />
            <span className="font-mono text-[#aab7b2] truncate">{isPrinting ? 'PRINTING' : 'READY'}</span>
          </div>
          <div className="h-1 sm:h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <motion.div 
              className="h-full"
              style={{ backgroundColor: template.accentColor }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeInOut" }}
            />
          </div>
          <span className="text-[8px] sm:text-[10px] text-[#66736d] font-mono uppercase tracking-wider truncate">
            {stage.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="relative z-10 mt-12 flex w-full flex-col items-center perspective-[1200px] scale-[0.75] sm:scale-85 md:scale-[0.95] lg:scale-100 origin-top">
        
        {/* Machine Slot */}
        <div className="relative z-20 h-5 w-[420px] rounded-full border border-white/5 bg-black/80 shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)]">
          <div className="absolute inset-x-8 top-1/2 h-[2px] -translate-y-1/2 opacity-20 shadow-[0_0_12px_rgba(255,255,255,0.2)]" style={{ backgroundColor: template.accentColor }} />
        </div>

        <div className="relative mt-2 flex justify-center">
          <AnimatePresence mode="wait">
            {showSticker && (
              <motion.div
                key="sticker"
                initial={{ y: -100, opacity: 0 }}
                animate={{ 
                  y: stage === 'COMPLETE' ? 10 : (stage === 'EJECTING' || stage === 'RECALIBRATING') ? 5 : 0, 
                  opacity: 1,
                  scale: 1
                }}
                transition={{ type: "spring", stiffness: 90, damping: 20, duration: 0.8 }}
                className="relative flex justify-center"
              >
                {/* Physical Finishing Pass / Laser Sweep */}
                {(stage === 'FINISHING' || stage === 'RECALIBRATING') && !prefersReducedMotion && (
                  <motion.div 
                    initial={{ top: -20, opacity: 0 }}
                    animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
                    transition={{ duration: stage === 'RECALIBRATING' ? 0.6 : 1.2, ease: "linear" }}
                    className="absolute inset-x-0 z-50 h-1.5 pointer-events-none"
                    style={{ backgroundColor: template.accentColor, boxShadow: `0 0 30px ${template.accentColor}` }}
                  />
                )}

                {/* --- RENDERED STICKER DOM --- */}
                {template.id === 'menusqr-walnut-gold' ? (
                  <RoyalWalnutStickerCard
                    stickerRef={stickerRef}
                    restaurantName={restaurantName}
                    category={category}
                    tagline={tagline}
                    menuUrl={menuUrl}
                    qrImage={qrImage}
                    showStatusBadge={true}
                    showDownloadButtons={true}
                    onDownloadPNG={() => void downloadStickerPNG()}
                    onDownloadSVG={() => void downloadStickerSVG()}
                  />
                ) : (
                  <div 
                    ref={stickerRef}
                    className="relative flex w-[400px] h-[580px] flex-col items-center overflow-hidden rounded-[2.5rem] transition-colors duration-500 box-border ring-1 ring-black/10"
                    style={{
                      backgroundColor: template.primaryBg,
                      borderColor: template.accentColor,
                      borderWidth: '4px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 0 0 2px rgba(255,255,255,0.4)',
                      backgroundImage: template.textureUrl ? `url("${template.textureUrl}")` : 'none'
                    }}
                  >
                    {/* Top Section */}
                    <div 
                      className="absolute top-0 inset-x-0 h-[220px] z-0 overflow-hidden transition-colors duration-500"
                      style={{
                        backgroundColor: template.secondaryBg,
                        borderBottomLeftRadius: template.hasCurvedHeader ? '50% 20%' : '0',
                        borderBottomRightRadius: template.hasCurvedHeader ? '50% 20%' : '0',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div className="absolute bottom-0 inset-x-0 h-[3px]" style={{ backgroundColor: template.accentColor }} />
                    </div>

                    {/* Top Content */}
                    <div className="relative z-10 w-full flex flex-col items-center pt-8" style={{ color: template.textLight }}>
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1 mb-2" style={{ color: template.textLight }}>
                           {template.hasCornerLeaves && <Leaf size={20} className="transform -scale-x-100 rotate-45 opacity-80 text-[#8bc34a]" />}
                           <div className="relative mx-2">
                             <ChefHat size={42} strokeWidth={1.5} />
                             <Utensils size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/4" strokeWidth={2} />
                           </div>
                           {template.hasCornerLeaves && <Leaf size={20} className="transform rotate-45 opacity-80 text-[#8bc34a]" />}
                        </div>
                      </div>

                      <div className="flex flex-col items-center w-full px-4 text-center">
                        <h2 className="text-3xl font-bold tracking-tight mb-1" style={{ fontFamily: template.titleFont, color: template.textLight }}>
                          {restaurantName}
                        </h2>
                        {category && (
                          <div className="flex items-center justify-center gap-2 w-full mb-2">
                            <div className="h-px w-8 bg-current opacity-40" />
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-90">{category}</p>
                            <div className="h-px w-8 bg-current opacity-40" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Middle Section (QR & Details) */}
                    <div className="relative z-10 w-full flex-1 flex flex-col items-center pt-6 px-8">
                      <div className="relative mb-5 flex aspect-square w-44 items-center justify-center rounded-2xl p-2 shadow-[0_10px_25px_rgba(0,0,0,0.15)] bg-white" style={{ borderColor: template.accentColor, borderWidth: '4px' }}>
                        {qrImage ? (
                          <img src={qrImage} alt="QR Code" className="h-full w-full object-contain" />
                        ) : (
                          <div className="h-full w-full border-2 border-dashed border-black/10 rounded-xl" />
                        )}
                      </div>

                      <div className="flex flex-col items-center w-full" style={{ color: template.textDark }}>
                        <div className="flex items-center gap-2 px-5 py-2 rounded-full shadow-md mb-4 border" style={{ backgroundColor: template.secondaryBg, color: template.textLight }}>
                          <Smartphone size={16} />
                          <span className="font-bold text-sm tracking-wide">
                            SCAN FOR <span style={{ color: template.accentColor }}>MENU</span>
                          </span>
                        </div>

                        <p className="text-[9px] font-bold uppercase tracking-[0.15em] mb-4 text-center leading-relaxed">
                          VIEW OUR DELICIOUS MENU
                        </p>
                      </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="absolute bottom-0 inset-x-0 h-[60px] z-0 overflow-hidden flex flex-col items-center justify-center transition-colors duration-500" style={{ backgroundColor: template.secondaryBg, color: template.textLight }}>
                      <div className="absolute top-0 inset-x-0 h-[2px]" style={{ backgroundColor: template.accentColor }} />
                      <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: template.accentColor }}>
                        ONE QR - ALWAYS THE LATEST MENU
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls & Final Actions */}
      <div className="mt-8 z-20 w-full max-w-md px-4 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {stage === 'COMPLETE' || stage === 'RECALIBRATING' ? (
            <motion.div 
              key="complete-controls"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col items-center gap-4 rounded-xl border border-white/10 bg-[#111815]/90 p-4 sm:p-5 backdrop-blur-md shadow-2xl"
            >
              <div className="w-full mb-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#aab7b2]">Sticker Theme</span>
                  <span className="text-xs text-[#2ec4b6] flex items-center gap-1"><CheckCircle2 size={12}/> Active</span>
                </div>
                <div className="flex gap-2 w-full overflow-x-auto pb-1 scrollbar-hide">
                  {STICKER_TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleTemplateChange(t.id)}
                      disabled={stage === 'RECALIBRATING'}
                      className="shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 cursor-pointer"
                      style={{ 
                        borderColor: templateId === t.id ? t.accentColor : 'rgba(255,255,255,0.1)',
                        backgroundColor: templateId === t.id ? `${t.accentColor}20` : 'rgba(255,255,255,0.05)',
                        color: templateId === t.id ? t.accentColor : '#94a39d'
                      }}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid w-full grid-cols-2 gap-2 sm:gap-3">
                <button onClick={() => void downloadStickerPNG()} disabled={stage === 'RECALIBRATING'} className="flex w-full items-center justify-center gap-2 rounded-lg px-2 sm:px-4 py-2.5 text-xs sm:text-sm font-bold text-[#0a2e1f] transition hover:brightness-110 disabled:opacity-50 cursor-pointer" style={{ backgroundColor: template.accentColor }}>
                  <ImageIcon size={16} /> Download PNG
                </button>
                <button onClick={() => void downloadStickerSVG()} disabled={stage === 'RECALIBRATING'} className="flex w-full items-center justify-center gap-2 rounded-lg border px-2 sm:px-4 py-2.5 text-xs sm:text-sm font-bold transition hover:brightness-110 disabled:opacity-50 cursor-pointer" style={{ borderColor: `${template.accentColor}80`, backgroundColor: `${template.accentColor}1A`, color: template.accentColor }}>
                  <Download size={16} /> Download SVG
                </button>
                <button
                  onClick={() => void navigator.clipboard.writeText(menuUrl)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold text-white transition hover:bg-white/10 cursor-pointer"
                >
                  <Copy size={16} /> Copy Menu URL
                </button>
                <button
                  onClick={() => { setStage('INITIALIZING'); setProgress(0); }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold text-white transition hover:bg-white/10 cursor-pointer"
                >
                  <RefreshCw size={16} /> Refresh Render
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
