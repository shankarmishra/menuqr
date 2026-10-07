import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import { toPng, toSvg } from 'html-to-image';
import { CheckCircle2, Download, Printer, ExternalLink } from 'lucide-react';
import { MenusQRBrand } from '../brand/MenusQRBrand';
import './QRGenerationSequence.css';
import { menuTemplates } from '../../data/menuTemplates';

interface QRGenerationSequenceProps {
  restaurantName: string;
  menuUrl: string;
  onComplete: (qrDataUrl: string) => void;
  onClose: () => void;
  phone?: string;
  address?: string;
  onError?: () => void;
  initiallyReady?: boolean;
  templateId?: string;
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

export default function QRGenerationSequence({ restaurantName, menuUrl, onComplete, onClose, phone, address, onError, initiallyReady = false, templateId = 'royal-maharaja' }: QRGenerationSequenceProps) {
  const [currentPhase, setCurrentPhase] = useState<Phase>('preparing');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const stickerRef = useRef<HTMLDivElement>(null);
  const stickerTemplate = menuTemplates.find((template) => template.id === templateId) ?? menuTemplates[0];

  const generateQR = useCallback(async () => {
    try {
      const [dataUrl] = await Promise.all([
        QRCode.toDataURL(menuUrl, {
          width: 600,
          margin: 2,
          color: { dark: '#151C19', light: '#FAFAF7' },
          errorCorrectionLevel: 'H',
        }),
      ]);
      setQrDataUrl(dataUrl);
      return dataUrl;
    } catch (err) {
      onError?.();
      return '';
    }
  }, [menuUrl, onError]);

  useEffect(() => {
    let cancelled = false;
    let qrResult = '';

    async function runSequence() {
      if (initiallyReady) {
        qrResult = await generateQR();
        if (!cancelled && qrResult) {
          setCurrentPhase('ready');
          onComplete(qrResult);
        }
        return;
      }
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
  }, [generateQR, initiallyReady, onComplete]);

  const phaseIndex = PHASES.indexOf(currentPhase);
  const progress = ((phaseIndex + 1) / PHASES.length) * 100;
  const isReady = currentPhase === 'ready';

  const downloadPNG = async () => {
    if (!qrDataUrl || !stickerRef.current) return;
    try {
      const dataUrl = await toPng(stickerRef.current, { pixelRatio: 3, cacheBust: true });
      const link = document.createElement('a');
      link.download = `MenusQR_${restaurantName.replace(/[^a-z0-9]+/gi, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      onError?.();
    }
  };

  const downloadSVG = async () => {
    if (!qrDataUrl || !stickerRef.current) return;
    try {
      const svg = await toSvg(stickerRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `MenusQR_${restaurantName.replace(/[^a-z0-9]+/gi, '_')}.svg`;
      link.href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      onError?.();
    }
  };

  return (
    <div className="qr-generation-overlay fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 px-3 py-6 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="qr-production-panel my-auto w-full max-w-lg bg-[#FAFAF7] shadow-2xl"
      >
        {/* Production Workspace Header */}
        <div className="qr-production-header bg-[#151C19] px-6 py-4 flex items-center justify-between">
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
        <div className="qr-production-content p-8">
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
                    className="absolute inset-0 bg-[#FAFAF7] rounded-sm border border-[#151C19]/10 shadow-xl"
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
                            className="mb-2"
                          >
                            <MenusQRBrand size="sm" variant="primary" />
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
                <div className="relative w-72 max-w-full mb-6">
                  <motion.div
                    initial={{ y: 28, rotateX: 3 }}
                    animate={{ y: 0, rotateX: 0 }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                    ref={stickerRef}
                    className="qr-print-sticker relative flex min-h-[390px] flex-col items-center rounded-sm border border-[#18231f]/15 bg-white px-7 py-6 text-center shadow-2xl"
                    style={{ '--sticker-accent': stickerTemplate.colors.accent, '--sticker-frame': stickerTemplate.colors.border } as React.CSSProperties}
                  >
                    <div className="qr-print-cropmarks" aria-hidden="true" />
                    <MenusQRBrand size="sm" variant="primary" className="mb-4" />
                    <h2 className="max-w-full break-words text-lg font-extrabold text-[#18231f]">{restaurantName}</h2>
                    <p className="mt-1 max-w-full break-words text-xs text-[#65716c]">Digital menu · Updated live</p>
                    <div className="my-5 grid h-52 w-52 place-items-center bg-white p-2">
                      {qrDataUrl && <img src={qrDataUrl} alt="Permanent restaurant menu QR code" className="h-full w-full object-contain" />}
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-sm font-bold text-[#18231f]">Scan to view our menu</p>
                      <p className="break-all text-[10px] text-[#65716c]">{new URL(menuUrl).host}</p>
                      {phone && <p className="text-[10px] text-[#65716c]">{phone}</p>}
                      {address && <p className="max-w-[15rem] text-[10px] text-[#65716c]">{address}</p>}
                    </div>
                    <p className="mt-auto pt-4 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#e8783c]">One QR · Always the latest menu</p>
                  </motion.div>
                </div>

                {/* Success */}
                <div className="qr-print-actions flex w-full max-w-xs flex-col items-center">
                <div className="flex items-center gap-2 text-[#34B56A] mb-2">
                  <CheckCircle2 size={20} />
                  <span className="text-sm font-black">Your permanent QR is ready</span>
                </div>
                <p className="text-xs text-[#151C19]/50 text-center mb-6 max-w-xs">
                  This QR will remain the same even when you update your menu, change templates, or modify prices.
                </p>

                {/* Download Actions */}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={() => void downloadPNG()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#151C19] hover:bg-[#202A26] text-white text-sm font-bold rounded-xl transition-colors"
                  >
                    <Download size={16} /> PNG
                  </button>
                  <button
                    onClick={() => void downloadSVG()}
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
