import { useState } from 'react';
import { Printer, Table2, Download, ExternalLink, Scissors, Eye, Sparkles, X, FileText, Check } from 'lucide-react';
import { useToast } from '../feedback/ToastProvider';
import {
  buildTableQrUrl,
  buildTablePrintHtml,
  clampTableRange,
  type TableQrCard,
  type TableQrFormat,
} from '../../utils/tableQr';
import {
  generateBrandedQrDataUrl,
  generateBrandedQrSvg,
  downloadDataUrl,
  downloadSvg,
} from '../../utils/brandedQr';

type Props = {
  /** The restaurant's permanent QR link (`/qr/<id>`). */
  baseUrl: string;
  restaurantName: string;
};

export default function TableQrGenerator({ baseUrl, restaurantName }: Props) {
  const showToast = useToast();
  const [startTable, setStartTable] = useState('1');
  const [endTable, setEndTable] = useState('20');
  const [label, setLabel] = useState('Table');
  const [busy, setBusy] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<TableQrCard[]>([]);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printFormat, setPrintFormat] = useState<TableQrFormat>('tent');
  const [showGuides, setShowGuides] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Generate batch QR codes for the table range with Error Correction 'H' and Branded Medallions
  async function generateBatch(customStart?: string, customEnd?: string) {
    const s = customStart ?? startTable;
    const e = customEnd ?? endTable;
    const range = clampTableRange(s, e);
    if (!range) {
      showToast('error', 'Enter a valid table range between 1 and 200 (e.g. 1 to 20).');
      return;
    }

    setBusy(true);
    try {
      const cards: TableQrCard[] = [];
      const cleanLabel = label.trim() || 'Table';

      for (let table = range.start; table <= range.end; table += 1) {
        const url = buildTableQrUrl(baseUrl, table);

        // High-res branded PNG with errorCorrectionLevel 'H' and table badge
        const dataUrl = await generateBrandedQrDataUrl({
          text: url,
          size: 1400,
          restaurantName,
          tableNumber: table,
          includeMedallion: true,
        });

        // High-res vector SVG with errorCorrectionLevel 'H' and table badge
        const svgString = await generateBrandedQrSvg({
          text: url,
          restaurantName,
          tableNumber: table,
          includeMedallion: true,
        });

        cards.push({ table, url, dataUrl, svgString });
      }

      setGeneratedCards(cards);
      showToast('success', `Generated ${cards.length} branded ${cleanLabel.toLowerCase()} QR codes (Tables ${range.start} to ${range.end}).`);
    } catch (err) {
      console.error(err);
      showToast('error', 'Could not generate the table QR codes.');
    } finally {
      setBusy(false);
    }
  }

  // Quick preset helper
  function applyPreset(start: number, end: number) {
    setStartTable(String(start));
    setEndTable(String(end));
    void generateBatch(String(start), String(end));
  }

  // Open standalone print HTML in a new window/tab
  function openStandalonePrint() {
    if (generatedCards.length === 0) {
      showToast('error', 'Please generate table QR codes first.');
      return;
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('error', 'Allow pop-ups for this site to print table QRs.');
      return;
    }
    const cleanLabel = label.trim() || 'Table';
    printWindow.document.open();
    printWindow.document.write(
      buildTablePrintHtml(generatedCards, restaurantName, cleanLabel, printFormat, showGuides)
    );
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 350);
  }

  // Trigger browser print for dedicated print view
  function triggerPrint() {
    window.print();
  }

  // Download individual table PNG
  function handleDownloadPng(card: TableQrCard) {
    const safeName = restaurantName.replace(/[^a-z0-9]+/gi, '_');
    const safeLabel = label.trim().replace(/[^a-z0-9]+/gi, '_') || 'Table';
    const fileName = `${safeName}_${safeLabel}_${card.table}_QR_HighRes.png`;
    setDownloadingId(`png-${card.table}`);
    try {
      downloadDataUrl(card.dataUrl, fileName);
      showToast('success', `Downloaded ${label} ${card.table} PNG (300 DPI).`);
    } finally {
      setTimeout(() => setDownloadingId(null), 800);
    }
  }

  // Download individual table SVG
  function handleDownloadSvg(card: TableQrCard) {
    if (!card.svgString) return;
    const safeName = restaurantName.replace(/[^a-z0-9]+/gi, '_');
    const safeLabel = label.trim().replace(/[^a-z0-9]+/gi, '_') || 'Table';
    const fileName = `${safeName}_${safeLabel}_${card.table}_QR_Vector.svg`;
    setDownloadingId(`svg-${card.table}`);
    try {
      downloadSvg(card.svgString, fileName);
      showToast('success', `Downloaded ${label} ${card.table} Vector SVG.`);
    } finally {
      setTimeout(() => setDownloadingId(null), 800);
    }
  }

  const range = clampTableRange(startTable, endTable);
  const totalCount = range ? range.count : 0;

  return (
    <div className="bg-[#1d2723] rounded-2xl border border-[#2a3832] overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[#2a3832] bg-[#151c19] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-bold text-white text-sm">
          <span className="bg-sky-500/10 text-sky-400 p-1.5 rounded-md border border-sky-500/20">
            <Table2 size={16} />
          </span>
          Table-wise QR Batch &amp; Print Studio
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 border border-sky-500/20 px-2.5 py-1 rounded-full bg-sky-500/10">
            Error Correction 'H' • 300 DPI
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-5">
        <p className="text-xs text-[#849a90] leading-relaxed">
          Generate individual table QR codes in batches (e.g., Tables 1 to 20). Every QR automatically appends{' '}
          <code className="text-sky-300 bg-sky-950/40 px-1 py-0.5 rounded text-[11px]">?table=N</code> so customer orders route
          directly to the correct table number. Download individual tables or open the print studio for table tents, stickers, and acrylic inserts.
        </p>

        {/* Range Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="text-xs font-semibold text-[#849a90]">
            Start Table #
            <input
              type="number"
              min={1}
              max={300}
              value={startTable}
              onChange={(e) => setStartTable(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#36473f] bg-[#151c19] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#e8783c]"
            />
          </label>
          <label className="text-xs font-semibold text-[#849a90]">
            End Table #
            <input
              type="number"
              min={1}
              max={300}
              value={endTable}
              onChange={(e) => setEndTable(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#36473f] bg-[#151c19] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#e8783c]"
            />
          </label>
          <label className="text-xs font-semibold text-[#849a90]">
            Label Prefix
            <input
              value={label}
              maxLength={20}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Table, Booth, Seat"
              className="mt-1 w-full rounded-lg border border-[#36473f] bg-[#151c19] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#e8783c]"
            />
          </label>
        </div>

        {/* Quick Range Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-bold text-[#849a90] mr-1">Quick Presets:</span>
          {[
            { label: 'Tables 1–10', s: 1, e: 10 },
            { label: 'Tables 1–20', s: 1, e: 20 },
            { label: 'Tables 1–50', s: 1, e: 50 },
            { label: 'Tables 21–40', s: 21, e: 40 },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset.s, preset.e)}
              className="rounded-lg bg-[#25322d] hover:bg-[#2e3e38] text-white/90 border border-[#36473f] px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            disabled={busy || !range}
            onClick={() => void generateBatch()}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#25322d] hover:bg-[#2d3c36] border border-[#36473f] px-4 py-3 text-sm font-bold text-white disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Sparkles size={16} className="text-[#e8783c]" />
            {busy ? 'Generating Batch...' : `Generate Batch (${totalCount} Tables)`}
          </button>

          <button
            type="button"
            disabled={busy || generatedCards.length === 0}
            onClick={() => setShowPrintModal(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e8783c] to-[#f08b55] hover:brightness-110 px-5 py-3 text-sm font-extrabold text-white disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-[#e8783c]/20"
          >
            <Printer size={16} /> Print All Table Tents &amp; Inserts
          </button>
        </div>

        {/* Batch Preview Grid with Individual Table Downloads */}
        {generatedCards.length > 0 && (
          <div className="mt-6 pt-5 border-t border-[#2a3832] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Generated {label} Cards ({generatedCards.length})
                </span>
                <span className="text-[11px] text-[#849a90]">
                  • Tables {generatedCards[0]?.table} to {generatedCards[generatedCards.length - 1]?.table}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(true)}
                  className="text-xs font-bold text-[#e8783c] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Eye size={13} /> Open Printable Sheet Preview
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[460px] overflow-y-auto pr-1">
              {generatedCards.map((card) => (
                <div
                  key={card.table}
                  className="bg-[#151c19] border border-[#2a3832] rounded-xl p-3.5 flex flex-col items-center text-center space-y-2.5 hover:border-[#3d5147] transition-all"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-white/5 text-amber-300 border border-amber-400/20">
                      {label} {card.table}
                    </span>
                    <a
                      href={card.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Test live table link"
                      className="text-[#849a90] hover:text-white transition-colors p-1"
                    >
                      <ExternalLink size={13} />
                    </a>
                  </div>

                  {/* QR Image Box */}
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-amber-400/30">
                    <img
                      src={card.dataUrl}
                      alt={`${label} ${card.table} QR code`}
                      className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>

                  <p className="text-[10px] text-[#849a90] truncate max-w-[180px]">
                    {restaurantName}
                  </p>

                  {/* Individual Download Actions */}
                  <div className="grid grid-cols-2 gap-1.5 w-full pt-1">
                    <button
                      type="button"
                      onClick={() => handleDownloadPng(card)}
                      title={`Download ${label} ${card.table} High-Res PNG (300 DPI)`}
                      className="flex items-center justify-center gap-1 bg-[#25322d] hover:bg-[#2d3c36] text-white border border-[#36473f] py-1.5 px-2 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      {downloadingId === `png-${card.table}` ? <Check size={11} className="text-emerald-400" /> : <Download size={11} />}
                      PNG
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadSvg(card)}
                      title={`Download ${label} ${card.table} Scalable Vector SVG`}
                      className="flex items-center justify-center gap-1 bg-[#25322d] hover:bg-[#2d3c36] text-white border border-[#36473f] py-1.5 px-2 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      {downloadingId === `svg-${card.table}` ? <Check size={11} className="text-emerald-400" /> : <Download size={11} />}
                      SVG
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* DEDICATED PRINTABLE CARDS & TABLE TENTS MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#151c19] border border-white/15 rounded-3xl p-4 sm:p-6 max-w-4xl w-full flex flex-col space-y-4 shadow-2xl relative max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2a3832] pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#e8783c]">
                  Print Studio &amp; Layout Engine
                </p>
                <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                  Print Table Tents &amp; Inserts
                </h2>
                <p className="text-xs text-[#849a90]">
                  Crisp, ink-saving printable templates with razor-sharp cutting guidelines and 30% error-recovery QR codes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="self-end sm:self-center p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#849a90] hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Layout Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1d2723] p-3 rounded-xl border border-[#2a3832]">
              {/* Format Switcher */}
              <div className="flex items-center gap-1 bg-[#151c19] p-1 rounded-lg border border-[#36473f]">
                <button
                  type="button"
                  onClick={() => setPrintFormat('tent')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    printFormat === 'tent'
                      ? 'bg-[#e8783c] text-white shadow-sm'
                      : 'text-[#849a90] hover:text-white'
                  }`}
                >
                  <FileText size={13} /> Foldable Table Tents
                </button>
                <button
                  type="button"
                  onClick={() => setPrintFormat('acrylic')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    printFormat === 'acrylic'
                      ? 'bg-[#e8783c] text-white shadow-sm'
                      : 'text-[#849a90] hover:text-white'
                  }`}
                >
                  <Table2 size={13} /> Acrylic Inserts (A6 / 4&quot;&times;6&quot;)
                </button>
                <button
                  type="button"
                  onClick={() => setPrintFormat('stickers')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    printFormat === 'stickers'
                      ? 'bg-[#e8783c] text-white shadow-sm'
                      : 'text-[#849a90] hover:text-white'
                  }`}
                >
                  <Scissors size={13} /> Table Stickers
                </button>
              </div>

              {/* Cutting Guides Toggle */}
              <label className="flex items-center gap-2 text-xs font-semibold text-white/90 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showGuides}
                  onChange={(e) => setShowGuides(e.target.checked)}
                  className="rounded border-[#36473f] text-[#e8783c] focus:ring-0 w-4 h-4"
                />
                <span className="flex items-center gap-1">
                  <Scissors size={13} className="text-amber-400" /> Cutting &amp; Fold Guides
                </span>
              </label>
            </div>

            {/* Live Interactive Printable Sheet Preview Frame */}
            <div className="flex-1 overflow-y-auto bg-stone-200/90 rounded-2xl p-4 sm:p-6 border border-white/10 shadow-inner">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center text-[11px] font-bold text-stone-600 uppercase tracking-widest">
                  Preview of Printable Sheet ({generatedCards.length} {label}s &bull; Format:{' '}
                  {printFormat === 'tent'
                    ? 'Foldable Tent'
                    : printFormat === 'acrylic'
                    ? 'Acrylic Stand Insert'
                    : 'Sticker Grid'}
                  )
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {generatedCards.map((card) => {
                    if (printFormat === 'tent') {
                      return (
                        <div
                          key={card.table}
                          className="bg-white rounded-lg shadow-md overflow-hidden text-stone-900 text-center flex flex-col justify-between"
                          style={{
                            border: showGuides ? '1.5px dashed #999' : '1px solid #e5e5e5',
                          }}
                        >
                          {/* Front Panel */}
                          <div className="p-4 flex flex-col items-center">
                            <span className="text-[10px] font-extrabold tracking-widest text-amber-800 uppercase">
                              {restaurantName}
                            </span>
                            <div className="my-2 p-1 bg-white rounded">
                              <img
                                src={card.dataUrl}
                                alt="QR"
                                className="w-24 h-24 object-contain"
                                style={{ imageRendering: 'pixelated' }}
                              />
                            </div>
                            <div className="inline-block bg-stone-50 border border-amber-600/40 rounded px-3 py-0.5 text-xs font-black text-stone-900 tracking-wider">
                              {label} {card.table}
                            </div>
                            <span className="text-[9px] text-stone-500 mt-1 font-medium">
                              Scan to view menu &amp; order
                            </span>
                          </div>

                          {/* Fold Line Guide */}
                          {showGuides && (
                            <div className="border-t border-dashed border-amber-600/60 relative my-1">
                              <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white px-2 text-[8px] font-bold text-stone-400 tracking-wider">
                                &#x2702; - - FOLD HERE TO STAND - -
                              </span>
                            </div>
                          )}

                          {/* Back Panel (Mirrored when folded) */}
                          <div className="p-4 flex flex-col items-center bg-stone-50/50">
                            <span className="text-[10px] font-extrabold tracking-widest text-amber-800 uppercase">
                              {restaurantName}
                            </span>
                            <div className="my-2 p-1 bg-white rounded">
                              <img
                                src={card.dataUrl}
                                alt="QR"
                                className="w-24 h-24 object-contain"
                                style={{ imageRendering: 'pixelated' }}
                              />
                            </div>
                            <div className="inline-block bg-stone-50 border border-amber-600/40 rounded px-3 py-0.5 text-xs font-black text-stone-900 tracking-wider">
                              {label} {card.table}
                            </div>
                            <span className="text-[9px] text-stone-500 mt-1 font-medium">
                              Scan to view menu &amp; order
                            </span>
                          </div>
                        </div>
                      );
                    }

                    if (printFormat === 'acrylic') {
                      return (
                        <div
                          key={card.table}
                          className="bg-white rounded-lg shadow-md p-5 text-stone-900 text-center flex flex-col items-center justify-between min-h-[220px] relative"
                          style={{
                            border: showGuides ? '1.5px dashed #888' : '1px solid #e5e5e5',
                          }}
                        >
                          {showGuides && (
                            <>
                              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-stone-800" />
                              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-stone-800" />
                              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-stone-800" />
                              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-stone-800" />
                            </>
                          )}
                          <div>
                            <div className="w-8 h-0.5 bg-amber-600 mx-auto mb-1.5" />
                            <h3 className="text-xs font-black tracking-widest text-stone-900 uppercase">
                              {restaurantName}
                            </h3>
                            <p className="text-[8px] font-bold text-amber-700 tracking-wider uppercase">
                              DIGITAL MENU
                            </p>
                          </div>
                          <div className="my-2 p-1 bg-white">
                            <img
                              src={card.dataUrl}
                              alt="QR"
                              className="w-28 h-28 object-contain"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          </div>
                          <div>
                            <div className="inline-block bg-stone-50 border-2 border-amber-600/50 rounded-md px-3.5 py-1 text-sm font-black text-stone-900 tracking-wide">
                              {label} {card.table}
                            </div>
                            <p className="text-[9px] text-stone-500 mt-1">
                              Point camera to browse dishes &amp; order
                            </p>
                          </div>
                          <span className="text-[7.5px] text-stone-400 font-semibold tracking-wider uppercase mt-1">
                            MenusQR &bull; Contactless Table Ordering
                          </span>
                        </div>
                      );
                    }

                    // Compact Stickers
                    return (
                      <div
                        key={card.table}
                        className="bg-white rounded-md shadow p-3 text-stone-900 text-center flex flex-col items-center justify-between"
                        style={{
                          border: showGuides ? '1.5px dashed #999' : '1px solid #e5e5e5',
                        }}
                      >
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-stone-900">
                          {restaurantName}
                        </h4>
                        <img
                          src={card.dataUrl}
                          alt="QR"
                          className="w-20 h-20 object-contain my-1"
                          style={{ imageRendering: 'pixelated' }}
                        />
                        <div className="text-xs font-black text-stone-900 bg-stone-50 px-2 py-0.5 rounded border border-amber-600/40">
                          {label} {card.table}
                        </div>
                        <span className="text-[8px] text-stone-500 mt-0.5">Scan to Order</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-[11px] text-[#849a90]">
                Tip: Choose <strong className="text-white">&ldquo;Save as PDF&rdquo;</strong> in your browser print dialog to generate a print-ready file for commercial printers.
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={openStandalonePrint}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-[#25322d] hover:bg-[#2d3c36] text-white border border-[#36473f] py-2.5 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <ExternalLink size={14} /> Open in New Tab
                </button>
                <button
                  type="button"
                  onClick={triggerPrint}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#e8783c] to-[#f08b55] hover:brightness-110 text-white py-2.5 px-5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-[#e8783c]/25"
                >
                  <Printer size={15} /> Print Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
