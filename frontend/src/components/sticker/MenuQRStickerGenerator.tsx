import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChefHat, CheckCircle2, Copy, Download, RefreshCw, Image as ImageIcon, Utensils, Smartphone, Heart, Star, Leaf, ConciergeBell } from 'lucide-react';
import { toPng } from 'html-to-image';
import { STICKER_TEMPLATES } from './StickerTemplates';

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

export default function MenuQRStickerGenerator({ client, menuUrl, qrImage }: Props) {
  const [stage, setStage] = useState<GenerationStage>('IDLE');
  const [templateId, setTemplateId] = useState<string>('menuqr-classic-green');
  const prefersReducedMotion = useReducedMotion();
  const stickerRef = useRef<HTMLDivElement>(null);
  
  const template = STICKER_TEMPLATES.find((t) => t.id === templateId) || STICKER_TEMPLATES[0];

  const restaurantName = client?.businessName || 'GreenBite';
  const category = client?.category || 'RESTAURANT & CAFE';
  const tagline = client?.tagline || 'Good Food | Happy Mood';

  const [progress, setProgress] = useState(0);

  // Inject Google Font for cursive text
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    if (stage === 'IDLE' || stage === 'COMPLETE') return;

    const sequence = async () => {
      const wait = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, prefersReducedMotion ? ms / 4 : ms));

      if (stage === 'RECALIBRATING') {
        setProgress(30);
        await wait(500);
        setStage('FINISHING');
        setProgress(80);
        await wait(800);
        setStage('COMPLETE');
        setProgress(100);
        return;
      }

      setProgress(10);
      await wait(600);
      
      setStage('PREPARING_DESIGN');
      setProgress(25);
      await wait(800);

      setStage('PRINTING_LOGO');
      setProgress(40);
      await wait(600);

      setStage('PRINTING_RESTAURANT');
      setProgress(55);
      await wait(600);

      setStage('GENERATING_QR');
      setProgress(75);
      await wait(1000);

      setStage('PRINTING_DETAILS');
      setProgress(90);
      await wait(600);

      setStage('FINISHING');
      setProgress(98);
      await wait(1200);

      setStage('EJECTING');
      setProgress(100);
      await wait(800);

      setStage('COMPLETE');
    };

    void sequence();
  }, [stage, prefersReducedMotion]);

  const handleStart = () => {
    if (stage === 'IDLE' || stage === 'COMPLETE') {
      setStage('INITIALIZING');
    }
  };

  const handleTemplateChange = (newTemplateId: string) => {
    if (newTemplateId === templateId) return;
    setTemplateId(newTemplateId);
    if (stage === 'COMPLETE') {
      setStage('RECALIBRATING');
    }
  };

  const downloadSticker = async () => {
    if (!stickerRef.current) return;
    try {
      const dataUrl = await toPng(stickerRef.current, { cacheBust: true, quality: 1, pixelRatio: 3 });
      const link = document.createElement('a');
      link.download = `${client?.menuSlug || 'menu'}-sticker.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download sticker:', err);
    }
  };

  const isPrinting = stage !== 'IDLE' && stage !== 'COMPLETE';
  const showSticker = stage !== 'IDLE' && stage !== 'INITIALIZING' && stage !== 'PREPARING_DESIGN';

  const isCompleteOrEjecting = ['COMPLETE', 'EJECTING', 'RECALIBRATING'].includes(stage);

  return (
    <div className="relative flex h-full min-h-[750px] w-full flex-col items-center justify-center overflow-hidden bg-[#0d1210] p-4 sm:p-6 text-white font-sans">
      
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
        <div 
          className="h-[500px] w-[500px] rounded-full opacity-[0.04] blur-[120px] transition-colors duration-1000"
          style={{ backgroundColor: template.accentColor }} 
        />
      </div>

      <div className="absolute top-4 sm:top-6 z-20 flex w-full max-w-3xl items-start justify-between px-4 sm:px-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <ChefHat size={18} style={{ color: template.accentColor }} />
            <span className="text-xs sm:text-sm font-bold tracking-widest text-[#dce5df]">MENUQR SYSTEM</span>
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

      <div className="relative z-10 mt-12 flex w-full flex-col items-center perspective-[1200px] scale-[0.65] sm:scale-75 md:scale-[0.85] lg:scale-100 origin-top">
        
        {/* Machine Slot */}
        <div className="relative z-20 h-5 w-[420px] rounded-full border border-white/5 bg-black/80 shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)]">
          <div className="absolute inset-x-8 top-1/2 h-[2px] -translate-y-1/2 opacity-20 shadow-[0_0_12px_rgba(255,255,255,0.2)]" style={{ backgroundColor: template.accentColor }} />
        </div>

        <div className="relative mt-2 flex justify-center">
          <AnimatePresence mode="wait">
            {showSticker && (
              <motion.div
                key="sticker"
                initial={{ y: -300, opacity: 0, rotateX: -30, scale: 0.95 }}
                animate={{ 
                  y: stage === 'COMPLETE' ? 20 : (stage === 'EJECTING' || stage === 'RECALIBRATING') ? 10 : 0, 
                  opacity: 1,
                  rotateX: stage === 'COMPLETE' ? 0 : 5,
                  scale: stage === 'COMPLETE' ? 1 : 1
                }}
                transition={{ type: "spring", stiffness: 80, damping: 20, duration: 1 }}
                className="relative flex justify-center"
              >
                {/* Physical Finishing Pass / Laser Sweep */}
                {(stage === 'FINISHING' || stage === 'RECALIBRATING') && !prefersReducedMotion && (
                  <motion.div 
                    initial={{ top: -20, opacity: 0 }}
                    animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
                    transition={{ duration: stage === 'RECALIBRATING' ? 0.6 : 1.5, ease: "linear" }}
                    className="absolute inset-x-0 z-50 h-1.5 pointer-events-none"
                    style={{ backgroundColor: template.accentColor, boxShadow: `0 0 30px ${template.accentColor}` }}
                  />
                )}

                {/* --- PREMIUM STICKER DOM --- */}
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
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute top-0 inset-x-0 h-[220px] z-0 overflow-hidden transition-colors duration-500"
                    style={{
                      backgroundColor: template.secondaryBg,
                      borderBottomLeftRadius: template.hasCurvedHeader ? '50% 20%' : '0',
                      borderBottomRightRadius: template.hasCurvedHeader ? '50% 20%' : '0',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}
                  >
                    {/* Gold accent line under the curve */}
                    <div className="absolute bottom-0 inset-x-0 h-[3px]" style={{ backgroundColor: template.accentColor }} />
                  </motion.div>

                  {/* Top Content */}
                  <div className="relative z-10 w-full flex flex-col items-center pt-8" style={{ color: template.textLight }}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: ['PRINTING_LOGO', 'PRINTING_RESTAURANT', 'GENERATING_QR', 'PRINTING_DETAILS', 'FINISHING', 'EJECTING', 'RECALIBRATING', 'COMPLETE'].includes(stage) ? 1 : 0, y: 0 }}
                      className="flex flex-col items-center"
                    >
                      <div className="flex items-center gap-1 mb-2" style={{ color: template.textLight }}>
                         {template.hasCornerLeaves && <Leaf size={20} className="transform -scale-x-100 rotate-45 opacity-80 text-[#8bc34a]" />}
                         <div className="relative mx-2">
                           <ChefHat size={42} strokeWidth={1.5} />
                           <Utensils size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/4" strokeWidth={2} />
                         </div>
                         {template.hasCornerLeaves && <Leaf size={20} className="transform rotate-45 opacity-80 text-[#8bc34a]" />}
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: ['PRINTING_RESTAURANT', 'GENERATING_QR', 'PRINTING_DETAILS', 'FINISHING', 'EJECTING', 'RECALIBRATING', 'COMPLETE'].includes(stage) ? 1 : 0, scale: 1 }}
                      className="flex flex-col items-center w-full px-4 text-center"
                    >
                      <h2 className="text-4xl font-bold tracking-tight mb-1" style={{ fontFamily: template.titleFont, color: template.textLight }}>
                        {restaurantName}
                      </h2>
                      {category && (
                        <div className="flex items-center justify-center gap-2 w-full mb-2">
                          <div className="h-px w-8 bg-current opacity-40" />
                          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-90">{category}</p>
                          <div className="h-px w-8 bg-current opacity-40" />
                        </div>
                      )}
                      {tagline && (
                        <p className="text-2xl mt-1 drop-shadow-md" style={{ fontFamily: template.cursiveFont, color: template.accentColor }}>
                          {tagline}
                        </p>
                      )}
                    </motion.div>
                  </div>

                  {/* Middle Section (QR & Details) */}
                  <div className="relative z-10 w-full flex-1 flex flex-col items-center pt-6 px-8">
                    {/* Golden bursts */}
                    {template.hasGoldenBursts && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: stage === 'GENERATING_QR' || isCompleteOrEjecting ? 1 : 0 }}
                        className="absolute top-[60px] w-[320px] flex justify-between pointer-events-none"
                      >
                        <div className="flex flex-col gap-3 items-end opacity-60">
                          <div className="w-4 h-0.5 rotate-45 transform origin-right" style={{ backgroundColor: template.accentColor }} />
                          <div className="w-6 h-0.5" style={{ backgroundColor: template.accentColor }} />
                          <div className="w-4 h-0.5 -rotate-45 transform origin-right" style={{ backgroundColor: template.accentColor }} />
                        </div>
                        <div className="flex flex-col gap-3 items-start opacity-60">
                          <div className="w-4 h-0.5 -rotate-45 transform origin-left" style={{ backgroundColor: template.accentColor }} />
                          <div className="w-6 h-0.5" style={{ backgroundColor: template.accentColor }} />
                          <div className="w-4 h-0.5 rotate-45 transform origin-left" style={{ backgroundColor: template.accentColor }} />
                        </div>
                      </motion.div>
                    )}

                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
                      animate={{ 
                        opacity: ['GENERATING_QR', 'PRINTING_DETAILS', 'FINISHING', 'EJECTING', 'RECALIBRATING', 'COMPLETE'].includes(stage) ? 1 : 0, 
                        scale: 1,
                        filter: 'blur(0px)'
                      }}
                      className="relative mb-5 flex aspect-square w-48 items-center justify-center rounded-2xl p-2 shadow-[0_10px_25px_rgba(0,0,0,0.15)] bg-white"
                      style={{ 
                        borderColor: template.accentColor, 
                        borderWidth: '4px' 
                      }}
                    >
                      {qrImage ? (
                        <>
                          {/* We apply a small mask or inner background to preserve scan safety while overlaying logo */}
                          <img src={qrImage} alt="QR Code" className="h-full w-full object-contain mix-blend-multiply" />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-white p-1 rounded-lg">
                              <div className="text-white p-1.5 rounded-md flex items-center justify-center shadow-inner" style={{ backgroundColor: template.secondaryBg }}>
                                <ChefHat size={18} strokeWidth={2} />
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="h-full w-full border-2 border-dashed border-black/10 rounded-xl" />
                      )}
                      
                      {stage === 'GENERATING_QR' && !prefersReducedMotion && (
                        <motion.div 
                          initial={{ top: "0%" }}
                          animate={{ top: "100%" }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-x-2 h-0.5 shadow-[0_0_12px_currentColor]"
                          style={{ backgroundColor: template.accentColor, color: template.accentColor }}
                        />
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: ['PRINTING_DETAILS', 'FINISHING', 'EJECTING', 'RECALIBRATING', 'COMPLETE'].includes(stage) ? 1 : 0, y: 0 }}
                      className="flex flex-col items-center w-full"
                      style={{ color: template.textDark }}
                    >
                      <div className="flex items-center gap-2 px-5 py-2 rounded-full shadow-md mb-4 border" style={{ backgroundColor: template.secondaryBg, color: template.textLight, borderColor: 'rgba(0,0,0,0.1)' }}>
                        <Smartphone size={16} />
                        <span className="font-bold text-sm tracking-wide">
                          SCAN FOR <span style={{ color: template.accentColor }}>MENU</span>
                        </span>
                      </div>

                      <p className="text-[9px] font-bold uppercase tracking-[0.15em] mb-5 text-center leading-relaxed">
                        VIEW OUR DELICIOUS MENU<br/>
                        <span className="text-[14px] leading-none">•</span> ORDER YOUR FAVORITES <span className="text-[14px] leading-none">•</span>
                      </p>

                      <div className="flex justify-between w-full px-2">
                        <div className="flex flex-col items-center text-center gap-1.5">
                          <ConciergeBell size={20} strokeWidth={1.5} />
                          <span className="text-[7px] font-bold uppercase tracking-wider">Delicious<br/>Food</span>
                        </div>
                        <div className="w-px h-8 bg-current opacity-20" />
                        <div className="flex flex-col items-center text-center gap-1.5">
                          <Leaf size={20} strokeWidth={1.5} />
                          <span className="text-[7px] font-bold uppercase tracking-wider">Fresh<br/>Ingredients</span>
                        </div>
                        <div className="w-px h-8 bg-current opacity-20" />
                        <div className="flex flex-col items-center text-center gap-1.5">
                          <Star size={20} strokeWidth={1.5} />
                          <span className="text-[7px] font-bold uppercase tracking-wider">Best<br/>Quality</span>
                        </div>
                        <div className="w-px h-8 bg-current opacity-20" />
                        <div className="flex flex-col items-center text-center gap-1.5">
                          <Heart size={20} strokeWidth={1.5} />
                          <span className="text-[7px] font-bold uppercase tracking-wider">Your<br/>Satisfaction<br/>Matters</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Bottom Section */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute bottom-0 inset-x-0 h-[70px] z-0 overflow-hidden flex flex-col items-center justify-center pt-2 transition-colors duration-500"
                    style={{
                      backgroundColor: template.secondaryBg,
                      borderTopLeftRadius: template.hasCurvedFooter ? '50% 30%' : '0',
                      borderTopRightRadius: template.hasCurvedFooter ? '50% 30%' : '0',
                      boxShadow: '0 -4px 15px rgba(0,0,0,0.1)',
                      color: template.textLight
                    }}
                  >
                    <div className="absolute top-0 inset-x-0 h-[2px]" style={{ backgroundColor: template.accentColor }} />
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: ['PRINTING_DETAILS', 'FINISHING', 'EJECTING', 'RECALIBRATING', 'COMPLETE'].includes(stage) ? 1 : 0 }}
                      className="flex flex-col items-center"
                    >
                      <p className="text-xl" style={{ fontFamily: template.cursiveFont, color: template.accentColor }}>
                        Thank You
                      </p>
                      <div className="flex items-center justify-center gap-2 w-full mt-0.5">
                        <div className="h-px w-4 bg-current opacity-40" />
                        <p className="text-[7px] font-semibold uppercase tracking-[0.2em] opacity-90">FOR YOUR SUPPORT</p>
                        <div className="h-px w-4 bg-current opacity-40" />
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Subtle sheen on complete */}
                  {stage === 'COMPLETE' && !prefersReducedMotion && (
                    <motion.div 
                      initial={{ x: "-100%" }}
                      animate={{ x: "200%" }}
                      transition={{ duration: 2, delay: 0.2, ease: "easeInOut" }}
                      className="pointer-events-none absolute inset-0 z-50 w-[50%] skew-x-[-25deg] bg-gradient-to-r from-transparent via-white/20 to-transparent mix-blend-overlay"
                    />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls & Final Actions */}
      <div className="absolute bottom-4 sm:bottom-6 z-20 w-full px-4 sm:px-6 pointer-events-none flex flex-col justify-end h-full pt-[550px]">
        <div className="pointer-events-auto">
          <AnimatePresence mode="wait">
            {stage === 'IDLE' ? (
              <motion.div 
                key="idle-controls"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mx-auto flex w-full max-w-sm flex-col items-center gap-4 text-center"
              >
                <button
                  onClick={handleStart}
                  disabled={!client || !qrImage}
                  className="w-full rounded-lg px-6 py-3 font-bold text-[#0a2e1f] shadow-[0_4px_15px_rgba(212,175,55,0.4)] transition hover:brightness-110 disabled:opacity-50"
                  style={{ backgroundColor: template.accentColor }}
                >
                  Manufacture QR Sticker
                </button>
              </motion.div>
            ) : stage === 'COMPLETE' || stage === 'RECALIBRATING' ? (
              <motion.div 
                key="complete-controls"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-xl border border-white/10 bg-[#111815]/90 p-4 sm:p-5 backdrop-blur-md shadow-2xl"
              >
                <div className="w-full mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#aab7b2]">Template Engine</span>
                    <span className="text-xs text-[#2ec4b6] flex items-center gap-1"><CheckCircle2 size={12}/> Ready</span>
                  </div>
                  <div className="flex gap-2 w-full overflow-x-auto pb-2 scrollbar-hide">
                    {STICKER_TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handleTemplateChange(t.id)}
                        disabled={stage === 'RECALIBRATING'}
                        className="shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50"
                        style={{ 
                          borderColor: templateId === t.id ? t.accentColor : 'rgba(255,255,255,0.1)',
                          backgroundColor: templateId === t.id ? `${t.accentColor}15` : 'rgba(255,255,255,0.05)',
                          color: templateId === t.id ? t.accentColor : '#94a39d'
                        }}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid w-full grid-cols-2 gap-2 sm:gap-3">
                  <button onClick={() => void downloadSticker()} disabled={stage === 'RECALIBRATING'} className="flex w-full items-center justify-center gap-2 rounded-lg px-2 sm:px-4 py-2.5 text-xs sm:text-sm font-bold text-[#0a2e1f] transition hover:brightness-110 disabled:opacity-50" style={{ backgroundColor: template.accentColor }}>
                    <ImageIcon size={16} /> Download Sticker
                  </button>
                  {qrImage && (
                    <a href={qrImage} download={`${client?.menuSlug || 'menu'}-qr.png`} className="flex w-full items-center justify-center gap-2 rounded-lg border px-2 sm:px-4 py-2.5 text-xs sm:text-sm font-bold transition hover:brightness-110 pointer-events-auto" style={{ borderColor: `${template.accentColor}80`, backgroundColor: `${template.accentColor}1A`, color: template.accentColor }}>
                      <Download size={16} /> Download QR
                    </a>
                  )}
                  <button
                    onClick={() => void navigator.clipboard.writeText(menuUrl)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold text-white transition hover:bg-white/10 pointer-events-auto"
                  >
                    <Copy size={16} /> Copy URL
                  </button>
                  <button
                    onClick={() => { setStage('IDLE'); setProgress(0); }}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold text-white transition hover:bg-white/10 pointer-events-auto"
                  >
                    <RefreshCw size={16} /> Start Again
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
