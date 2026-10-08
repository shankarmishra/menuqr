import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import { toPng, toSvg } from 'html-to-image';
import RoyalWalnutStickerCard from '../sticker/RoyalWalnutStickerCard';
import './QRGenerationSequence.css';

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
  preparing: { label: 'Preparing your QR', duration: 600 },
  material: { label: 'Selecting material', duration: 500 },
  branding: { label: 'Printing brand', duration: 600 },
  generating: { label: 'Generating QR code', duration: 1000 },
  details: { label: 'Applying details', duration: 500 },
  finishing: { label: 'Finishing touches', duration: 400 },
  ready: { label: 'Your QR is ready', duration: 0 },
};

const PHASES: Phase[] = ['preparing', 'material', 'branding', 'generating', 'details', 'finishing', 'ready'];

export default function QRGenerationSequence({
  restaurantName,
  menuUrl,
  onComplete,
  onClose,
  onError,
  initiallyReady = false,
}: QRGenerationSequenceProps) {
  const [currentPhase, setCurrentPhase] = useState<Phase>(initiallyReady ? 'ready' : 'preparing');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const stickerRef = useRef<HTMLDivElement>(null);

  const generateQR = useCallback(async () => {
    try {
      const dataUrl = await QRCode.toDataURL(menuUrl, {
        width: 600,
        margin: 2,
        color: { dark: '#1C1209', light: '#FFFFFF' },
        errorCorrectionLevel: 'H',
      });
      setQrDataUrl(dataUrl);
      return dataUrl;
    } catch {
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

    void runSequence();
    return () => {
      cancelled = true;
    };
  }, [generateQR, initiallyReady, onComplete]);

  const phaseIndex = PHASES.indexOf(currentPhase);
  const progress = ((phaseIndex + 1) / PHASES.length) * 100;
  const isReady = currentPhase === 'ready';

  const downloadPNG = async () => {
    if (!stickerRef.current) return;
    try {
      const dataUrl = await toPng(stickerRef.current, { pixelRatio: 3, cacheBust: true });
      const link = document.createElement('a');
      link.download = `MenusQR_${restaurantName.replace(/[^a-z0-9]+/gi, '_')}_Sticker.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      onError?.();
    }
  };

  const downloadSVG = async () => {
    if (!stickerRef.current) return;
    try {
      const svg = await toSvg(stickerRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `MenusQR_${restaurantName.replace(/[^a-z0-9]+/gi, '_')}_Sticker.svg`;
      link.href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      onError?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 px-3 py-6 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="my-auto w-full max-w-xl overflow-hidden rounded-2xl bg-[#0f1412] border border-white/10 shadow-2xl"
      >
        {/* Production Studio Header Window Bar */}
        <div className="bg-[#161c19] px-5 py-3.5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#FF5E4D]" />
              <div className="w-3 h-3 rounded-full bg-[#FFC928]" />
              <div className="w-3 h-3 rounded-full bg-[#34B56A]" />
            </div>
            <span className="text-xs font-mono font-bold tracking-widest text-[#aab7b2] uppercase">
              QR PRODUCTION STUDIO
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-[#849a90] hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {!isReady ? (
              <motion.div
                key="production"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-6 w-full"
              >
                <div className="scale-90 transform-gpu mb-6">
                  <RoyalWalnutStickerCard
                    restaurantName={restaurantName}
                    menuUrl={menuUrl}
                    qrImage={qrDataUrl}
                    showStatusBadge={false}
                    showDownloadButtons={false}
                  />
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-xs space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-white/80">
                    <span>{PHASE_CONFIG[currentPhase].label}</span>
                    <span className="text-[#D4AF37]">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#D4AF37] to-[#FFE89E] rounded-full"
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
                className="flex flex-col items-center w-full py-2"
              >
                <RoyalWalnutStickerCard
                  stickerRef={stickerRef}
                  restaurantName={restaurantName}
                  menuUrl={menuUrl}
                  qrImage={qrDataUrl}
                  showStatusBadge={true}
                  showDownloadButtons={true}
                  onDownloadPNG={() => void downloadPNG()}
                  onDownloadSVG={() => void downloadSVG()}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
