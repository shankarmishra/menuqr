import { useEffect, useState } from 'react';
import { ExternalLink, PackageCheck, RefreshCw } from 'lucide-react';
import { useToast } from '../../components/feedback/ToastProvider';
import { getAdminStickerRequests, updateAdminStickerRequest, type AdminStickerRequest } from './clientStore';

const nextStatuses: Record<AdminStickerRequest['status'], AdminStickerRequest['status'][]> = {
  PENDING: ['REVIEWING', 'CANCELLED'],
  REVIEWING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['IN_PRODUCTION', 'CANCELLED'],
  IN_PRODUCTION: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

const statusColor: Record<AdminStickerRequest['status'], string> = {
  PENDING: 'text-amber-200 bg-amber-400/10',
  REVIEWING: 'text-sky-200 bg-sky-400/10',
  CONFIRMED: 'text-emerald-200 bg-emerald-400/10',
  IN_PRODUCTION: 'text-orange-200 bg-orange-400/10',
  SHIPPED: 'text-cyan-200 bg-cyan-400/10',
  DELIVERED: 'text-emerald-200 bg-emerald-400/10',
  CANCELLED: 'text-rose-200 bg-rose-400/10',
};

export default function StickerRequests() {
  const [requests, setRequests] = useState<AdminStickerRequest[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');
  const showToast = useToast();

  async function loadRequests() {
    try {
      setRequests(await getAdminStickerRequests());
    } catch {
      showToast('error', 'Sticker requests could not be loaded. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadRequests(); }, []);

  async function changeStatus(request: AdminStickerRequest, status: AdminStickerRequest['status']) {
    setUpdatingId(request.id);
    try {
      const updated = await updateAdminStickerRequest(request.id, status, notes[request.id]);
      setRequests((current) => current.map((item) => item.id === updated.id ? { ...item, status: updated.status, updatedAt: updated.updatedAt } : item));
      setNotes((current) => ({ ...current, [request.id]: '' }));
      showToast('success', `${request.restaurantName} sticker request updated to ${status.replace('_', ' ').toLowerCase()}.`);
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Status was not changed. Please try again.');
    } finally {
      setUpdatingId('');
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div><p className="text-xs font-semibold uppercase text-[#f29a66]">Fulfillment requests</p><h1 className="mt-1 text-2xl font-bold text-white">Sticker requests</h1></div>
        <button type="button" onClick={() => void loadRequests()} className="inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm font-semibold text-white"><RefreshCw size={15} /> Refresh</button>
      </header>

      {loading ? <p className="py-8 text-center text-sm text-[#aab7b2]">Loading sticker requests…</p> : requests.length === 0 ? (
        <div className="border-y border-white/10 py-12 text-center"><PackageCheck size={30} className="mx-auto text-[#87958e]" /><p className="mt-3 text-sm text-[#aab7b2]">No sticker requests to review.</p></div>
      ) : (
        <div className="divide-y divide-white/10">
          {requests.map((request) => (
            <article key={request.id} className="grid gap-5 py-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(15rem,0.8fr)]">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3"><h2 className="text-lg font-semibold text-white">{request.restaurantName}</h2><span className={`rounded px-2.5 py-1 text-xs font-bold ${statusColor[request.status]}`}>{request.status.replace('_', ' ')}</span></div>
                <p className="text-sm text-[#d6ded9]">{request.quantity.toLocaleString()} stickers</p>
                <p className="break-all font-mono text-xs text-[#aab7b2]">QR: {request.qrId}</p>
                <p className="text-xs text-[#87958e]">Requested {new Date(request.createdAt).toLocaleString()}</p>
                {request.notes && <p className="text-sm text-[#aab7b2]">Note: {request.notes}</p>}
              </div>

              <div className="space-y-2 text-sm">
                <h3 className="text-xs font-semibold uppercase text-[#87958e]">Contact</h3>
                <p className="font-medium text-white">{request.contactName}</p>
                <a className="block text-[#f29a66] hover:underline" href={`tel:${request.contactPhone}`}>{request.contactPhone}</a>
                <a className="inline-flex items-center gap-1 break-all text-[#f29a66] hover:underline" href={`mailto:${request.contactEmail}`}>{request.contactEmail} <ExternalLink size={12} /></a>
              </div>

              <div className="space-y-3">
                <div><h3 className="text-xs font-semibold uppercase text-[#87958e]">Delivery</h3><p className="mt-2 whitespace-pre-wrap text-sm text-[#d6ded9]">{request.deliveryAddress}<br />{[request.deliveryCity, request.deliveryState, request.deliveryPostalCode].filter(Boolean).join(', ')}</p></div>
                {nextStatuses[request.status].length > 0 ? (
                  <div className="space-y-2">
                    <input value={notes[request.id] ?? ''} onChange={(event) => setNotes((current) => ({ ...current, [request.id]: event.target.value }))} placeholder="Review note (optional)" aria-label="Review note" className="w-full rounded-md border border-white/15 bg-[#151c19] px-3 py-2 text-xs text-white" />
                    <div className="flex flex-wrap gap-2">
                      {nextStatuses[request.status].map((status) => <button key={status} type="button" disabled={updatingId === request.id} onClick={() => void changeStatus(request, status)} className={`rounded-md px-3 py-2 text-xs font-semibold text-white disabled:opacity-40 ${status === 'CANCELLED' ? 'border border-rose-400/40 text-rose-200' : 'bg-[#293832]'}`}>{updatingId === request.id ? 'Saving…' : status.replace('_', ' ')}</button>)}
                    </div>
                  </div>
                ) : <p className="text-xs text-[#87958e]">Request closed.</p>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}