import { useState } from 'react';
import QRCode from 'qrcode';
import { Printer, Table2 } from 'lucide-react';
import { useToast } from '../feedback/ToastProvider';
import { buildTableQrUrl, buildTablePrintHtml, clampTableCount, type TableQrCard } from '../../utils/tableQr';

type Props = {
  /** The restaurant's permanent QR link (`/qr/<id>`). */
  baseUrl: string;
  restaurantName: string;
};

/**
 * Generates one QR per table, each opening the same menu with `?table=N` so the order lands on
 * the right table. Runs entirely in the browser: no backend call, nothing stored.
 */
export default function TableQrGenerator({ baseUrl, restaurantName }: Props) {
  const showToast = useToast();
  const [count, setCount] = useState('10');
  const [label, setLabel] = useState('Table');
  const [busy, setBusy] = useState(false);

  async function printTableQrs() {
    const total = clampTableCount(count);
    if (!total) {
      showToast('error', 'Enter a number of tables between 1 and 200.');
      return;
    }
    // Opened synchronously from the click so popup blockers allow it.
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('error', 'Allow pop-ups for this site to print table QRs.');
      return;
    }
    setBusy(true);
    try {
      const cards: TableQrCard[] = [];
      for (let table = 1; table <= total; table += 1) {
        const dataUrl = await QRCode.toDataURL(buildTableQrUrl(baseUrl, table), {
          width: 480,
          margin: 1,
          errorCorrectionLevel: 'M',
        });
        cards.push({ table, dataUrl });
      }
      printWindow.document.open();
      printWindow.document.write(buildTablePrintHtml(cards, restaurantName, label.trim() || 'Table'));
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 300);
    } catch {
      printWindow.close();
      showToast('error', 'Could not generate the table QR codes.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-[#1d2723] rounded-2xl border border-[#2a3832] overflow-hidden shadow-xl">
      <div className="p-4 sm:p-5 border-b border-[#2a3832] bg-[#151c19] flex items-center gap-2 font-bold text-white text-sm">
        <span className="bg-sky-500/10 text-sky-400 p-1.5 rounded-md border border-sky-500/20"><Table2 size={16} /></span>
        Table-wise QR codes
      </div>
      <div className="p-4 sm:p-6 space-y-4">
        <p className="text-xs text-[#849a90] leading-relaxed">
          Print one QR per table so every order automatically carries its table number. Your permanent QR stays the same;
          only the table number is added to the link.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs font-semibold text-[#849a90]">Number of tables
            <input
              type="number"
              min={1}
              max={200}
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#36473f] bg-[#151c19] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#e8783c]"
            />
          </label>
          <label className="text-xs font-semibold text-[#849a90]">Label
            <input
              value={label}
              maxLength={20}
              onChange={(e) => setLabel(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#36473f] bg-[#151c19] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#e8783c]"
            />
          </label>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void printTableQrs()}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#e8783c] hover:bg-[#f08b55] px-5 py-3 text-sm font-extrabold text-white disabled:opacity-50 transition-colors cursor-pointer"
        >
          <Printer size={16} /> {busy ? 'Preparing…' : 'Print / Save as PDF'}
        </button>
        <p className="text-[11px] text-[#849a90]">
          Tip: in the print dialog choose &ldquo;Save as PDF&rdquo; to send the sheet to a print shop.
        </p>
      </div>
    </div>
  );
}
