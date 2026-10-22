import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  X, 
  Layers,
  UtensilsCrossed
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface MenuPageItem {
  page: number;
  title: string;
  url: string;
  fallbackUrl?: string;
  category?: string;
}

interface PdfBookletViewerProps {
  pages: MenuPageItem[];
  restaurantName: string;
  accentColor?: string;
  brandColor?: string;
  onOpenQuickOrder?: () => void;
}

export const PdfBookletViewer: React.FC<PdfBookletViewerProps> = ({
  pages,
  restaurantName,
  accentColor = '#FAB700',
  brandColor = '#CE182C',
  onOpenQuickOrder,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'scroll' | 'single'>('scroll');
  const [zoomPage, setZoomPage] = useState<MenuPageItem | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Track active page during continuous scroll
  useEffect(() => {
    if (viewMode !== 'scroll') return;

    const handleScroll = () => {
      const scrollPos = window.scrollY + 250;
      for (let i = 0; i < pageRefs.current.length; i++) {
        const el = pageRefs.current[i];
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setCurrentPage(i + 1);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [viewMode, pages.length]);

  const scrollToPage = (pageNum: number) => {
    setCurrentPage(pageNum);
    if (viewMode === 'scroll') {
      const el = pageRefs.current[pageNum - 1];
      if (el) {
        const yOffset = -90;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  const handleNext = () => {
    if (currentPage < pages.length) {
      scrollToPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      scrollToPage(currentPage - 1);
    }
  };

  return (
    <section className="relative w-full max-w-4xl mx-auto px-2 sm:px-4 py-3 space-y-4">
      {/* ═══════════════════════════════════════════════════════════════════════
          SUB-HEADER: CHAPTER JUMP BAR & VIEW MODE SWITCH
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="sticky top-14 z-30 bg-[#FFFDF9]/95 dark:bg-[#121212]/95 backdrop-blur-md py-2.5 px-3 rounded-2xl shadow-sm border border-black/5 dark:border-white/10 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span 
              className="w-2.5 h-2.5 rounded-full animate-pulse shrink-0" 
              style={{ backgroundColor: brandColor }} 
            />
            <span className="text-xs font-bold uppercase tracking-wider text-black/80 dark:text-white/90">
              Page {currentPage} of {pages.length}
            </span>
            <span className="text-xs font-semibold opacity-60 truncate max-w-[150px] sm:max-w-[260px]">
              • {pages[currentPage - 1]?.title}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 p-1 rounded-xl text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setViewMode('scroll')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'scroll' 
                  ? 'bg-white dark:bg-[#1E1E1E] text-black dark:text-white shadow-sm' 
                  : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
              }`}
            >
              <Layers size={13} />
              <span>Scroll</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('single')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'single' 
                  ? 'bg-white dark:bg-[#1E1E1E] text-black dark:text-white shadow-sm' 
                  : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
              }`}
            >
              <BookOpen size={13} />
              <span>Flip Page</span>
            </button>
          </div>
        </div>

        {/* Horizontal Chapter Navigation Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none scroll-smooth">
          {pages.map((p) => {
            const isActive = currentPage === p.page;
            return (
              <button
                key={p.page}
                type="button"
                onClick={() => scrollToPage(p.page)}
                className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                  isActive 
                    ? 'font-bold text-white shadow-sm' 
                    : 'bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 hover:bg-black/10'
                }`}
                style={isActive ? { backgroundColor: brandColor } : {}}
              >
                {p.page}. {p.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          MAIN VIEW: CONTINUOUS SCROLL MODE
          ═══════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'scroll' && (
        <div className="space-y-6 sm:space-y-8">
          {pages.map((p, idx) => (
            <div
              key={p.page}
              ref={(el) => { pageRefs.current[idx] = el; }}
              className="relative group rounded-2xl overflow-hidden bg-white shadow-xl border border-black/10 transition-transform duration-200"
            >
              <div className="relative w-full aspect-[1240/1754] bg-[#F7F3EB] overflow-hidden">
                <picture>
                  <source srcSet={p.url} type="image/webp" />
                  <img
                    src={p.fallbackUrl || p.url}
                    alt={`${restaurantName} - Page ${p.page}: ${p.title}`}
                    className="w-full h-full object-contain select-none"
                    loading={idx <= 2 ? 'eager' : 'lazy'}
                  />
                </picture>

                {/* Page Action Overlay */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <span className="bg-black/70 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-full shadow-md">
                    Page {p.page} of {pages.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setZoomPage(p);
                      setZoomLevel(1);
                    }}
                    className="p-2 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-md transition-all shadow-md active:scale-95"
                    aria-label={`Zoom in on page ${p.page}`}
                    title="Zoom in full resolution"
                  >
                    <Maximize2 size={14} />
                  </button>
                </div>
              </div>

              {/* Bottom Card Strip */}
              <div className="px-4 py-2.5 bg-white border-t border-black/5 flex items-center justify-between text-xs font-semibold text-black/70">
                <span>{p.title}</span>
                <div className="flex items-center gap-3">
                  {onOpenQuickOrder && (
                    <button
                      type="button"
                      onClick={onOpenQuickOrder}
                      className="text-[11px] font-bold flex items-center gap-1 hover:underline"
                      style={{ color: brandColor }}
                    >
                      <UtensilsCrossed size={12} />
                      <span>Order Items</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setZoomPage(p);
                      setZoomLevel(1);
                    }}
                    className="text-[11px] font-bold flex items-center gap-1"
                    style={{ color: accentColor }}
                  >
                    <ZoomIn size={12} />
                    <span>Tap to Zoom</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          FLIP / SINGLE PAGE CAROUSEL MODE
          ═══════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'single' && (
        <div className="relative space-y-3">
          <div className="relative rounded-2xl overflow-hidden bg-white shadow-2xl border border-black/10 aspect-[1240/1754]">
            <picture>
              <source srcSet={pages[currentPage - 1].url} type="image/webp" />
              <img
                src={pages[currentPage - 1].fallbackUrl || pages[currentPage - 1].url}
                alt={`${restaurantName} - Page ${currentPage}: ${pages[currentPage - 1].title}`}
                className="w-full h-full object-contain select-none"
              />
            </picture>

            <button
              type="button"
              onClick={() => {
                setZoomPage(pages[currentPage - 1]);
                setZoomLevel(1);
              }}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-md transition-all shadow-md active:scale-95"
              aria-label="Zoom in"
            >
              <Maximize2 size={16} />
            </button>
          </div>

          {/* Prev / Next Bottom Controls */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white shadow-md border border-black/5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={handlePrev}
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-black/5 hover:bg-black/10 active:scale-95"
            >
              <ChevronLeft size={16} />
              <span>Previous Page</span>
            </button>

            <div className="text-center font-bold text-xs">
              <div>Page {currentPage} of {pages.length}</div>
              <div className="text-[11px] font-normal opacity-60 truncate max-w-[180px]">
                {pages[currentPage - 1]?.title}
              </div>
            </div>

            <button
              type="button"
              disabled={currentPage >= pages.length}
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 shadow-sm"
              style={{ backgroundColor: brandColor }}
            >
              <span>Next Page</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          FULL RESOLUTION ZOOM LIGHTBOX MODAL
          ═══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {zoomPage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col p-2 sm:p-4 backdrop-blur-md"
            onClick={() => setZoomPage(null)}
          >
            {/* Top Toolbar */}
            <div 
              className="flex items-center justify-between text-white pb-3 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-xs font-bold">
                Page {zoomPage.page} • {zoomPage.title}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(1, z - 0.3))}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                  aria-label="Zoom out"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="text-xs font-mono">{Math.round(zoomLevel * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.3))}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                  aria-label="Zoom in"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomPage(null)}
                  className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white ml-2"
                  aria-label="Close zoom"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Zoomable Image Container */}
            <div 
              className="flex-1 overflow-auto flex items-center justify-center p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={zoomPage.fallbackUrl || zoomPage.url}
                alt={zoomPage.title}
                className="max-h-[85vh] max-w-full object-contain transition-transform duration-200 select-none shadow-2xl rounded-lg"
                style={{ transform: `scale(${zoomLevel})` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default PdfBookletViewer;
