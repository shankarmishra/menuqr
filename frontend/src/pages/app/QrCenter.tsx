import { useEffect, useState, useRef } from 'react';
import { Download, PackageCheck, QrCode, Printer, Send, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { toPng } from 'html-to-image';
import RoyalWalnutStickerCard from '../../components/sticker/RoyalWalnutStickerCard';
import { useToast } from '../../components/feedback/ToastProvider';
import { createPermanentQr, createStickerRequest, getProfile, getQr, getStickerRequests, getMenu, type AppProfile, type AppQrData, type StickerRequest } from './appStore';

export default function QrCenter() {
  const navigate = useNavigate();
  const [qr, setQr] = useState<AppQrData | null>(null);
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [requests, setRequests] = useState<StickerRequest[]>([]);
  const [menuExists, setMenuExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [qrImage, setQrImage] = useState<string>('');

  const stickerRef = useRef<HTMLDivElement>(null);
  const orderSectionRef = useRef<HTMLDivElement>(null);
  
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
    Promise.allSettled([getQr(), getProfile(), getStickerRequests(), getMenu()]).then(([qrResult, profileResult, requestResult, menuResult]) => {
      if (!current) return;
      if (qrResult.status === 'fulfilled' && qrResult.value) setQr(qrResult.value as AppQrData);
      if (profileResult.status === 'fulfilled') {
        setProfile(profileResult.value);
        if (profileResult.value) {
          setContactName(profileResult.value.ownerName || '');
          setContactPhone(profileResult.value.phone || '');
        }
      }
      if (requestResult.status === 'fulfilled') setRequests(requestResult.value);
      if (menuResult.status === 'fulfilled' && menuResult.value?.menu) setMenuExists(true);
    }).catch(() => {
      if (current) showToast('error', 'Your QR studio could not be loaded. Please refresh.');
    }).finally(() => {
      if (current) setLoading(false);
    });
    return () => { current = false; };
  }, [showToast]);

  const menuUrl = qr?.qrId ? `${window.location.origin}/qr/${encodeURIComponent(qr.qrId)}` : '';

  useEffect(() => {
    if (!menuUrl) return;
    let isCurrent = true;
    QRCode.toDataURL(menuUrl, {
      width: 600,
      margin: 2,
      color: { dark: '#1C1209', light: '#FFFFFF' },
      errorCorrectionLevel: 'H',
    }).then((url) => {
      if (isCurrent) setQrImage(url);
    }).catch(console.error);

    return () => { isCurrent = false; };
  }, [menuUrl]);

  async function openPermanentQr() {
    if (!menuExists) {
      navigate('/onboarding');
      return;
    }
    
    setSaving(true);
    try {
      const data = await createPermanentQr();
      setQr(data as any);
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
      showToast('success', 'Sticker request submitted successfully.');
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'The request could not be submitted. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const downloadPNG = async () => {
    if (!stickerRef.current) return;
    try {
      const dataUrl = await toPng(stickerRef.current, { pixelRatio: 3, cacheBust: true, skipFonts: true });
      const link = document.createElement('a');
      const name = qr?.restaurantName || profile?.businessName || 'restaurant';
      link.download = `MenusQR_${name.replace(/[^a-z0-9]+/gi, '_')}_Sticker.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      showToast('error', 'Could not download PNG.');
    }
  };

  const handleOrderClick = () => {
    setShowRequestForm(true);
    if (orderSectionRef.current) {
      orderSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e8783c]"></div>
    </div>
  );

  const statusTone: Record<string, string> = {
    PENDING: 'bg-amber-400/10 text-amber-400 border border-amber-400/20',
    REVIEWING: 'bg-sky-400/10 text-sky-400 border border-sky-400/20',
    CONFIRMED: 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20',
    IN_PRODUCTION: 'bg-orange-400/10 text-orange-400 border border-orange-400/20',
    SHIPPED: 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20',
    DELIVERED: 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20',
    CANCELLED: 'bg-rose-400/10 text-rose-400 border border-rose-400/20',
  };

  const restaurantName = qr?.restaurantName || profile?.businessName || 'shankar hotel';

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 px-4 md:px-8 pt-4 sm:pt-6">
      <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-[#2a3832] pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#e8783c]">{restaurantName}</p>
          <h1 className="mt-1 text-3xl font-bold text-white">QR Studio</h1>
          <p className="mt-2 text-sm text-[#849a90]">Manage and download your physical table QR stand & order stickers.</p>
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
            <QrCode size={18} /> {!menuExists ? 'Set up your menu first' : saving ? 'Preparing...' : 'Create QR Code'}
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN: Full Physical QR Sticker Artwork Display */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#1d2723] rounded-2xl border border-[#2a3832] overflow-hidden flex flex-col shadow-2xl">
              <div className="p-5 border-b border-[#2a3832] flex items-center justify-between bg-[#151c19]">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <span className="bg-emerald-500/10 text-emerald-400 p-1.5 rounded-md border border-emerald-500/20"><QrCode size={16} /></span>
                  Active QR Stand Artwork
                </div>
                <div className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase border border-[#D4AF37]/30 px-2.5 py-1 rounded-full bg-[#D4AF37]/10">
                  PERMANENT • ONE QR FOREVER
                </div>
              </div>
              
              <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center bg-gradient-to-b from-[#17211d] to-[#0e1311]">
                
                {/* --- FULL PHYSICAL ROYAL WALNUT QR STICKER CARD --- */}
                <div className="scale-90 sm:scale-95 transform-gpu transition-all">
                  <RoyalWalnutStickerCard
                    headerText="Scan Me for Menu"
                    footerText="Scan Table QR Code"
                    stickerRef={stickerRef}
                    restaurantName={restaurantName}
                    category="DIGITAL MENU"
                    menuUrl={menuUrl}
                    qrImage={qrImage}
                    showStatusBadge={true}
                    showDownloadButtons={false}
                  />
                </div>
                
                <p className="mt-4 text-xs text-[#849a90] max-w-sm leading-relaxed">
                  Changing menu items or prices will <strong>never</strong> regenerate this QR code.
                </p>

                {/* --- ACTION & ORDER BUTTONS --- */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mt-6">
                  <button
                    type="button"
                    onClick={handleOrderClick}
                    className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#e8783c] to-[#f08b55] hover:brightness-110 text-white py-3 px-4 rounded-xl text-sm font-extrabold shadow-lg shadow-[#e8783c]/25 transition-all cursor-pointer"
                  >
                    <ShoppingBag size={18} /> Order Physical Stickers
                  </button>

                  <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => void downloadPNG()}
                      className="flex items-center justify-center gap-1.5 bg-[#25322d] hover:bg-[#2a3832] text-white border border-[#36473f] py-3 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Download size={14} /> Download Image
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPrintModal(true)}
                      className="flex items-center justify-center gap-1.5 bg-[#e8783c] hover:bg-[#f08b55] text-white border border-[#e8783c] py-3 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Printer size={14} /> Print Ready
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
          
          {/* RIGHT COLUMN: Physical Stickers Order Form & Order History */}
          <div ref={orderSectionRef} className="lg:col-span-5 space-y-6">
            <div className="bg-[#1d2723] rounded-2xl border border-[#2a3832] overflow-hidden shadow-xl">
              <div className="p-5 border-b border-[#2a3832] flex items-center justify-between bg-[#151c19]">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <span className="bg-[#e8783c]/10 text-[#e8783c] p-1.5 rounded-md border border-[#e8783c]/20"><PackageCheck size={16} /></span>
                  Order Physical Table QR Stickers
                </div>
                {!showRequestForm && (
                  <button type="button" onClick={() => setShowRequestForm(true)} className="text-xs font-bold text-[#e8783c] hover:text-[#f08b55] cursor-pointer">
                    Order New +
                  </button>
                )}
              </div>
              
              <div className="p-0">
                {showRequestForm ? (
                  <form onSubmit={submitStickerRequest} className="p-6 bg-[#151c19] space-y-4">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#2a3832]">
                      <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <ShoppingBag size={16} className="text-[#e8783c]" /> Delivery Details for {restaurantName}
                      </h2>
                      <button type="button" onClick={() => setShowRequestForm(false)} className="text-xs text-[#849a90] hover:text-white cursor-pointer">Cancel</button>
                    </div>
                    
                    <div className="grid gap-3">
                      <label className="text-xs font-semibold text-[#849a90]">Quantity (Stickers / Stands)
                        <input type="number" aria-label="Quantity" min="1" max="10000" required value={quantity} onChange={(e) => setQuantity(e.target.value)} className="mt-1 w-full rounded-lg border border-[#36473f] bg-[#1d2723] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#e8783c]" />
                      </label>
                      <label className="text-xs font-semibold text-[#849a90]">Contact Person
                        <input required aria-label="Contact name" value={contactName} onChange={(e) => setContactName(e.target.value)} className="mt-1 w-full rounded-lg border border-[#36473f] bg-[#1d2723] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#e8783c]" />
                      </label>
                      <label className="text-xs font-semibold text-[#849a90]">Phone Number
                        <input required aria-label="Contact phone" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="mt-1 w-full rounded-lg border border-[#36473f] bg-[#1d2723] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#e8783c]" />
                      </label>
                      <label className="text-xs font-semibold text-[#849a90]">Email Address
                        <input required aria-label="Contact email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-[#36473f] bg-[#1d2723] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#e8783c]" />
                      </label>
                      <label className="text-xs font-semibold text-[#849a90]">Full Delivery Address
                        <textarea required aria-label="Delivery address" rows={2} value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} className="mt-1 w-full rounded-lg border border-[#36473f] bg-[#1d2723] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#e8783c]" />
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="text-xs font-semibold text-[#849a90]">City
                          <input required aria-label="City" value={deliveryCity} onChange={(e) => setDeliveryCity(e.target.value)} className="mt-1 w-full rounded-lg border border-[#36473f] bg-[#1d2723] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#e8783c]" />
                        </label>
                        <label className="text-xs font-semibold text-[#849a90]">State
                          <input value={deliveryState} onChange={(e) => setDeliveryState(e.target.value)} className="mt-1 w-full rounded-lg border border-[#36473f] bg-[#1d2723] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#e8783c]" />
                        </label>
                      </div>
                    </div>
                    
                    <button type="submit" disabled={saving} className="w-full mt-2 rounded-xl bg-gradient-to-r from-[#e8783c] to-[#f08b55] hover:brightness-110 px-5 py-3 text-sm font-extrabold text-white disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#e8783c]/20 cursor-pointer">
                      <Send size={16} /> {saving ? 'Submitting Order...' : 'Submit Request'}
                    </button>
                  </form>
                ) : (
                  <div className="divide-y divide-[#2a3832]">
                    {requests.length === 0 ? (
                      <div className="p-8 text-center text-[#849a90] space-y-3">
                        <p className="text-sm">No physical sticker orders placed yet.</p>
                        <button type="button" onClick={() => setShowRequestForm(true)} className="inline-flex items-center gap-2 bg-[#e8783c]/10 text-[#e8783c] border border-[#e8783c]/20 px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#e8783c]/20 transition-colors cursor-pointer">
                          <ShoppingBag size={14} /> Place First Order
                        </button>
                      </div>
                    ) : requests.map((request) => (
                      <div key={request.id} className="p-5 flex items-center justify-between hover:bg-[#151c19] transition-colors">
                        <div>
                          <div className="font-bold text-white mb-1">{request.quantity.toLocaleString()} Premium Table Stickers</div>
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

      {/* PRINT READY STICKER MODAL OVERLAY */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#151c19] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full flex flex-col items-center text-center space-y-6 shadow-2xl relative">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#e8783c]">Print-Ready Artwork</p>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">Print-Ready QR Artwork</h2>
            </div>
            <div className="scale-95 sm:scale-100">
              <RoyalWalnutStickerCard
                isModal={true}
                headerText="Scan Me for Menu"
                footerText="Scan to view our menu"
                restaurantName={restaurantName}
                category="DIGITAL MENU"
                menuUrl={menuUrl}
                qrImage={qrImage}
                showStatusBadge={true}
                showDownloadButtons={false}
              />
            </div>

            <div className="flex items-center justify-center gap-3 w-full pt-2">
              <button
                type="button"
                onClick={() => void downloadPNG()}
                className="flex-1 bg-[#25322d] hover:bg-[#2a3832] text-white border border-[#36473f] py-2.5 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Download Image (PNG)
              </button>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="flex-1 bg-[#e8783c] hover:bg-[#f08b55] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
