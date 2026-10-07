import { useEffect, useState } from 'react';
import { Download, PackageCheck, QrCode, Printer, ExternalLink, Send } from 'lucide-react';
import QRGenerationSequence from '../../components/qr-studio/QRGenerationSequence';
import ScannableQRCode from '../../components/marketing/ScannableQRCode';
import { useToast } from '../../components/feedback/ToastProvider';
import { createPermanentQr, createStickerRequest, getProfile, getQr, getStickerRequests, type AppProfile, type AppQrData, type StickerRequest } from './appStore';

export default function QrCenter() {
  const [qr, setQr] = useState<AppQrData | null>(null);
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [requests, setRequests] = useState<StickerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [printerOpen, setPrinterOpen] = useState(false);
  const [newlyCreated, setNewlyCreated] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  
  const [quantity, setQuantity] = useState('100');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryState, setDeliveryState] = useState('');
  
  const showToast = useToast();

  useEffect(() => {
    let current = true;
    Promise.allSettled([getQr(), getProfile(), getStickerRequests()]).then(([qrResult, profileResult, requestResult]) => {
      if (!current) return;
      if (qrResult.status === 'fulfilled' && (qrResult.value as any).length > 0) setQr((qrResult.value as any)[0]);
      if (profileResult.status === 'fulfilled') {
        setProfile(profileResult.value);
        if (profileResult.value) {
          setContactName(profileResult.value.ownerName || '');
          setContactPhone(profileResult.value.phone || '');
        }
      }
      if (requestResult.status === 'fulfilled') setRequests(requestResult.value);
    }).catch(() => {
      if (current) showToast('error', 'Your QR studio could not be loaded. Please refresh.');
    }).finally(() => {
      if (current) setLoading(false);
    });
    return () => { current = false; };
  }, [showToast]);

  async function openPermanentQr() {
    setSaving(true);
    try {
      const data = await createPermanentQr();
      setQr(data as any);
      setNewlyCreated(true);
      setPrinterOpen(true);
      showToast('success', 'Permanent QR code generated.');
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'The QR could not be generated. Save some menu items first.');
    } finally {
      setSaving(false);
    }
  }

  async function submitStickerRequest(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const parsedQuantity = parseInt(quantity, 10);
      if (isNaN(parsedQuantity) || parsedQuantity < 1) throw new Error('Invalid quantity');
      const request = await createStickerRequest({ quantity: parsedQuantity, contactName, contactPhone, contactEmail, deliveryAddress, deliveryCity, deliveryState });
      setRequests((prev) => [request, ...prev]);
      setShowRequestForm(false);
      showToast('success', 'Sticker request submitted successfully. We will contact you soon.');
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'The request could not be submitted. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e8783c]"></div>
    </div>
  );

  const menuUrl = qr?.qrId ? `${window.location.origin}/qr/${encodeURIComponent(qr.qrId)}` : '';


  const statusTone: Record<string, string> = {
    PENDING: 'bg-amber-400/10 text-amber-400 border border-amber-400/20',
    REVIEWING: 'bg-sky-400/10 text-sky-400 border border-sky-400/20',
    CONFIRMED: 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20',
    IN_PRODUCTION: 'bg-orange-400/10 text-orange-400 border border-orange-400/20',
    SHIPPED: 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20',
    DELIVERED: 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20',
    CANCELLED: 'bg-rose-400/10 text-rose-400 border border-rose-400/20',
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 px-4 md:px-8 pt-4 sm:pt-6">
      <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-[#2a3832] pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#e8783c]">{profile?.businessName || 'Permanent Identity'}</p>
          <h1 className="mt-1 text-3xl font-bold text-white">QR Studio</h1>
          <p className="mt-2 text-sm text-[#849a90]">Manage your physical table QRs and stickers.</p>
        </div>
      </header>

      {!qr?.qrId ? (
        <div className="bg-[#1d2723] rounded-2xl border border-[#2a3832] p-10 flex flex-col items-center text-center max-w-2xl mx-auto mt-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 text-white/5 pointer-events-none">
            <QrCode size={200} />
          </div>
          <div className="bg-[#151c19] p-4 rounded-full mb-6 border border-[#2a3832] relative z-10">
            <QrCode size={32} className="text-[#e8783c]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3 relative z-10">Generate Your Permanent QR</h2>
          <p className="text-[#849a90] max-w-md mb-8 relative z-10">
            Your QR code acts as your restaurant's permanent digital identity. Set up your menu categories and items first.
          </p>
          <button type="button" disabled={saving} onClick={openPermanentQr} className="inline-flex items-center gap-2 rounded-lg bg-[#e8783c] hover:bg-[#f08b55] px-6 py-3 text-sm font-bold text-white disabled:opacity-50 transition-colors shadow-lg shadow-[#e8783c]/20 relative z-10">
            <QrCode size={18} /> {saving ? 'Preparing...' : 'Create QR Code'}
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* LEFT: QR Preview & Download */}
          <div className="space-y-6">
            <div className="bg-[#1d2723] rounded-2xl border border-[#2a3832] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-[#2a3832] flex items-center justify-between bg-[#151c19]">
                <div className="flex items-center gap-2 font-bold text-white">
                  <span className="bg-emerald-500/10 text-emerald-400 p-1.5 rounded-md border border-emerald-500/20"><QrCode size={16} /></span>
                  Active QR
                </div>
                <div className="text-[10px] font-black tracking-widest text-[#849a90] uppercase border border-[#36473f] px-2 py-1 rounded">ONE QR • FOREVER</div>
              </div>
              
              <div className="p-8 flex flex-col items-center justify-center text-center bg-gradient-to-b from-[#1d2723] to-[#151c19]">
                <div className="w-48 h-48 bg-white rounded-2xl p-4 shadow-2xl border-4 border-white/10 mb-6 flex items-center justify-center relative group">
                  <div className="transition-transform group-hover:scale-105 duration-300">
                    <ScannableQRCode url={menuUrl} size={150} />
                  </div>
                </div>
                
                <h2 className="text-xl font-bold text-white">{profile?.businessName || 'Your restaurant'}</h2>
                <a href={menuUrl} target="_blank" rel="noreferrer" className="mt-2 text-sm text-[#e8783c] hover:text-[#f08b55] font-medium break-all flex items-center justify-center gap-1">
                  {menuUrl} <ExternalLink size={12} />
                </a>
                
                <p className="mt-4 text-xs text-[#849a90] max-w-xs leading-relaxed">
                  Changing menu items, prices, or themes will <strong>never</strong> regenerate this QR code. It is safe to print immediately.
                </p>
                
                <div className="grid grid-cols-2 gap-3 w-full mt-8">
                  <button type="button" onClick={() => { setNewlyCreated(false); setPrinterOpen(true); }} className="flex items-center justify-center gap-2 bg-[#25322d] hover:bg-[#2a3832] text-white border border-[#36473f] py-3 rounded-lg text-sm font-bold transition-colors">
                    <Download size={16} /> Download
                  </button>
                  <button type="button" onClick={() => { setNewlyCreated(false); setPrinterOpen(true); }} className="flex items-center justify-center gap-2 bg-[#25322d] hover:bg-[#2a3832] text-white border border-[#36473f] py-3 rounded-lg text-sm font-bold transition-colors">
                    <Printer size={16} /> Print Ready
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* RIGHT: Stickers & Orders */}
          <div className="space-y-6">
            <div className="bg-[#1d2723] rounded-2xl border border-[#2a3832] overflow-hidden">
              <div className="p-6 border-b border-[#2a3832] flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-white">
                  <span className="bg-[#e8783c]/10 text-[#e8783c] p-1.5 rounded-md border border-[#e8783c]/20"><PackageCheck size={16} /></span>
                  Physical Stickers
                </div>
                {!showRequestForm && (
                  <button type="button" onClick={() => setShowRequestForm(true)} className="text-sm font-bold text-[#e8783c] hover:text-[#f08b55]">
                    Order New +
                  </button>
                )}
              </div>
              
              <div className="p-0">
                {showRequestForm ? (
                  <form onSubmit={submitStickerRequest} className="p-6 bg-[#151c19]">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-bold text-white">Sticker Request Details</h2>
                      <button type="button" onClick={() => setShowRequestForm(false)} className="text-xs text-[#849a90] hover:text-white">Cancel</button>
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2 mb-6">
                      <label className="text-xs font-semibold text-[#849a90]">Quantity
                        <input type="number" min="1" max="10000" required value={quantity} onChange={(e) => setQuantity(e.target.value)} className="mt-1.5 w-full rounded-md border border-[#36473f] bg-[#1d2723] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#e8783c]" />
                      </label>
                      <label className="text-xs font-semibold text-[#849a90]">Contact Name
                        <input required value={contactName} onChange={(e) => setContactName(e.target.value)} className="mt-1.5 w-full rounded-md border border-[#36473f] bg-[#1d2723] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#e8783c]" />
                      </label>
                      <label className="text-xs font-semibold text-[#849a90]">Contact Phone
                        <input required type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="mt-1.5 w-full rounded-md border border-[#36473f] bg-[#1d2723] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#e8783c]" />
                      </label>
                      <label className="text-xs font-semibold text-[#849a90]">Contact Email
                        <input required type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="mt-1.5 w-full rounded-md border border-[#36473f] bg-[#1d2723] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#e8783c]" />
                      </label>
                      <label className="text-xs font-semibold text-[#849a90] sm:col-span-2">Delivery Address
                        <textarea required rows={2} value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} className="mt-1.5 w-full rounded-md border border-[#36473f] bg-[#1d2723] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#e8783c]" />
                      </label>
                      <label className="text-xs font-semibold text-[#849a90]">City
                        <input required value={deliveryCity} onChange={(e) => setDeliveryCity(e.target.value)} className="mt-1.5 w-full rounded-md border border-[#36473f] bg-[#1d2723] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#e8783c]" />
                      </label>
                      <label className="text-xs font-semibold text-[#849a90]">State
                        <input value={deliveryState} onChange={(e) => setDeliveryState(e.target.value)} className="mt-1.5 w-full rounded-md border border-[#36473f] bg-[#1d2723] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#e8783c]" />
                      </label>
                    </div>
                    
                    <button type="submit" disabled={saving} className="w-full rounded-lg bg-[#e8783c] hover:bg-[#f08b55] px-5 py-3 text-sm font-bold text-white disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#e8783c]/20">
                      <Send size={16} /> {saving ? 'Sending request...' : 'Submit Request'}
                    </button>
                  </form>
                ) : (
                  <div className="divide-y divide-[#2a3832]">
                    {requests.length === 0 ? (
                      <div className="p-8 text-center text-[#849a90]">
                        <p className="text-sm">No sticker requests yet.</p>
                      </div>
                    ) : requests.map((request) => (
                      <div key={request.id} className="p-5 flex items-center justify-between hover:bg-[#151c19] transition-colors">
                        <div>
                          <div className="font-bold text-white mb-1">{request.quantity.toLocaleString()} Premium Stickers</div>
                          <div className="text-xs text-[#849a90] flex items-center gap-2">
                            <span>{request.deliveryCity}</span> • 
                            <span>{new Date(request.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-black tracking-wider uppercase ${statusTone[request.status] || statusTone.PENDING}`}>
                          {request.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {printerOpen && qr?.qrId && (
        <QRGenerationSequence
          restaurantName={qr.restaurantName || profile?.businessName || 'Your restaurant'}
          menuUrl={menuUrl}
          phone={qr.phone || profile?.phone}
          address={[qr.address || profile?.address, qr.city || profile?.city].filter(Boolean).join(', ')}
          templateId={qr.templateId}
          initiallyReady={!newlyCreated}
          onComplete={() => setNewlyCreated(false)}
          onClose={() => setPrinterOpen(false)}
          onError={() => showToast('error', 'We could not prepare the QR artwork. Your permanent QR is safe; please try again.')}
        />
      )}
    </div>
  );
}
