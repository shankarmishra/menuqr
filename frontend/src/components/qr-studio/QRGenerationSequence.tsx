import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import { CheckCircle2, Download, Printer, ExternalLink } from 'lucide-react';

interface QRGenerationSequenceProps {
  restaurantName: string;
  menuUrl: string;
  onComplete: (qrDataUrl: string) => void;
  onClose: () => void;
}

type Phase = 'preparing' | 'material' | 'branding' | 'generating' | 'details' | 'finishing' | 'ready';

const PHASE_CONFIG: Record<Phase, { label: string; duration: number }> = {
  preparing: { label: 'Preparing your QR', duration: 800 },
  material: { label: 'Selecting material', duration: 600 },
  branding: { label: 'Printing brand', duration: 700 },
  generating: { label: 'Generating QR code', duration: 1200 },
  details: { label: 'Applying details', duration: 500 },
  finishing: { label: 'Finishing touches', duration: 400 },
  ready: { label: 'Your QR is ready', duration: 0 },
};

const PHASES: Phase[] = ['preparing', 'material', 'branding', 'generating', 'details', 'finishing', 'ready'];

export default function QRGenerationSequence({ restaurantName, menuUrl, onComplete, onClose }: QRGenerationSequenceProps) {
  const [currentPhase, setCurrentPhase] = useState<Phase>('preparing');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrSvg, setQrSvg] = useState<string>('');

  const generateQR = useCallback(async () => {
    try {
      const [dataUrl, svgString] = await Promise.all([
        QRCode.toDataURL(menuUrl, {
          width: 600,
          margin: 2,
          color: { dark: '#151C19', light: '#FAFAF7' },
          errorCorrectionLevel: 'H',
        }),
        QRCode.toString(menuUrl, {
          type: 'svg',
          width: 600,
          margin: 2,
          color: { dark: '#151C19', light: '#FAFAF7' },
          errorCorrectionLevel: 'H',
        }),
      ]);
      setQrDataUrl(dataUrl);
      setQrSvg(svgString);
      return dataUrl;
    } catch (err) {
      console.error('QR generation failed:', err);
      return '';
    }
  }, [menuUrl]);

  useEffect(() => {
    let cancelled = false;
    let qrResult = '';

    async function runSequence() {
      for (let i = 0; i < PHASES.length; i++) {
        if (cancelled) return;
        const phase = PHASES[i];
        setCurrentPhase(phase);

        if (phase === 'generating') {
          qrResult = await generateQR();
        }

        if (phase !== 'ready') {
          await new Promise((resolve) => setTimeout(resolve, PHASE_CONFIG[phase].duration));
        }
      }

      if (!cancelled && qrResult) {
        onComplete(qrResult);
      }
    }

    runSequence();
    return () => { cancelled = true; };
  }, [generateQR, onComplete]);

  const phaseIndex = PHASES.indexOf(currentPhase);
  const progress = ((phaseIndex + 1) / PHASES.length) * 100;
  const isReady = currentPhase === 'ready';

  const downloadPNG = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `MenusQR_${restaurantName.replace(/\s+/g, '_')}.png`;
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadSVG = () => {
    if (!qrSvg) return;
    const blob = new Blob([qrSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `MenusQR_${restaurantName.replace(/\s+/g, '_')}.svg`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg mx-4 bg-[#FAFAF7] rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Production Workspace Header */}
        <div className="bg-[#151C19] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#FF5E4D]" />
              <div className="w-3 h-3 rounded-full bg-[#FFC928]" />
              <div className="w-3 h-3 rounded-full bg-[#34B56A]" />
            </div>
            <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">QR Production Studio</span>
          </div>
          {isReady && (
            <button onClick={onClose} className="text-white/40 hover:text-white text-xs font-bold">
              Close
            </button>
          )}
        </div>

        {/* Main Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {!isReady ? (
              <motion.div
                key="production"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                {/* Physical Sticker Preview */}
                <div className="relative w-64 h-80 mb-8">
                  {/* Card Base */}
                  <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 bg-[#FAFAF7] rounded-2xl border-2 border-[#151C19]/10 shadow-xl"
                    style={{
                      background: 'linear-gradient(135deg, #FAFAF7 0%, #F0EDE6 100%)',
                    }}
                  >
                    {/* Crop Marks */}
                    <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-[#151C19]/20" />
                    <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-[#151C19]/20" />
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-[#151C19]/20" />
                    <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-[#151C19]/20" />

                    <div className="flex flex-col items-center justify-center h-full p-6">
                      {/* MENUSQR branding */}
                      <AnimatePresence>
                        {phaseIndex >= 2 && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[8px] font-black tracking-[0.4em] text-[#151C19]/40 uppercase mb-2"
                          >
                            MENUSQR
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Restaurant Name */}
                      <AnimatePresence>
                        {phaseIndex >= 2 && (
                          <motion.h2
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-sm font-black text-[#151C19] text-center uppercase tracking-wider mb-6"
                          >
                            {restaurantName}
                          </motion.h2>
                        )}
                      </AnimatePresence>

                      {/* QR Code Area */}
                      <div className="w-36 h-36 rounded-xl overflow-hidden relative mb-4">
                        {phaseIndex < 3 ? (
                          <div className="w-full h-full bg-[#151C19]/5 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-[#151C19]/20 border-t-[#E8783C] rounded-full animate-spin" />
                          </div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                          >
                            {qrDataUrl && (
                              <img src={qrDataUrl} alt="QR Code" className="w-full h-full object-contain" />
                            )}
                          </motion.div>
                        )}

                        {/* Scan line during generation */}
                        {currentPhase === 'generating' && (
                          <motion.div
                            animate={{ top: ['0%', '100%', '0%'] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                            className="absolute left-0 right-0 h-0.5 bg-[#E8783C] shadow-[0_0_8px_#E8783C]"
                          />
                        )}
                      </div>

                      {/* Bottom text */}
                      <AnimatePresence>
                        {phaseIndex >= 4 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-[9px] font-bold tracking-[0.3em] text-[#151C19]/40 uppercase"
                          >
                            Scan for Menu
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </div>

                {/* Progress */}
                <div className="w-full max-w-xs space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#151C19]">{PHASE_CONFIG[currentPhase].label}</span>
                    <span className="text-[#151C19]/40 font-mono">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1.5 bg-[#151C19]/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#E8783C] rounded-full"
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="ready"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center"
              >
                {/* Finished Sticker */}
                <div className="relative w-64 h-80 mb-8">
                  <motion.div
                    initial={{ rotateY: -10, rotateX: 5 }}
                    animate={{ rotateY: 0, rotateX: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="absolute inset-0 bg-gradient-to-b from-[#FAFAF7] to-[#F0EDE6] rounded-2xl border border-[#151C19]/10 shadow-2xl"
                    style={{ perspective: '1000px' }}
                  >
                    <div className="flex flex-col items-center justify-center h-full p-6">
                      <div className="text-[8px] font-black tracking-[0.4em] text-[#151C19]/40 uppercase mb-2">MENUSQR</div>
                      <h2 className="text-sm font-black text-[#151C19] text-center uppercase tracking-wider mb-6">{restaurantName}</h2>
                      <div className="w-36 h-36 rounded-xl overflow-hidden mb-4">
                        {qrDataUrl && <img src={qrDataUrl} alt="QR Code" className="w-full h-full object-contain" />}
                      </div>
                      <div className="text-[9px] font-bold tracking-[0.3em] text-[#151C19]/40 uppercase">Scan for Menu</div>
                    </div>
                  </motion.div>
                </div>

                {/* Success */}
                <div className="flex items-center gap-2 text-[#34B56A] mb-2">
                  <CheckCircle2 size={20} />
                  <span className="text-sm font-black">Your permanent QR is ready</span>
                </div>
                <p className="text-xs text-[#151C19]/50 text-center mb-6 max-w-xs">
                  This QR will remain the same even when you update your menu, change templates, or modify prices.
                </p>

                {/* Download Actions */}
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                  <button
                    onClick={downloadPNG}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#151C19] hover:bg-[#202A26] text-white text-sm font-bold rounded-xl transition-colors"
                  >
                    <Download size={16} /> PNG
                  </button>
                  <button
                    onClick={downloadSVG}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#151C19] hover:bg-[#202A26] text-white text-sm font-bold rounded-xl transition-colors"
                  >
                    <Download size={16} /> SVG
                  </button>
                </div>
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 text-xs font-bold text-[#151C19]/60 hover:text-[#151C19] transition-colors"
                  >
                    <Printer size={14} /> Print
                  </button>
                  <a
                    href={menuUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs font-bold text-[#E8783C] hover:text-[#d96227] transition-colors"
                  >
                    <ExternalLink size={14} /> View Live Menu
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
