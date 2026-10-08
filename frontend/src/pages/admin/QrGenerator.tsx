import { useEffect, useState } from 'react';
import { Check, Copy, ExternalLink, QrCode, Store } from 'lucide-react';
import QRCode from 'qrcode';
import { Link, useSearchParams } from 'react-router-dom';
import { getClients, type ClientRecord } from './clientStore';
import MenusQRStickerGenerator from '../../components/sticker/MenusQRStickerGenerator';

export default function QrGenerator() {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchParams] = useSearchParams();
  const requestedClientId = searchParams.get('clientId');
  const [selectedId, setSelectedId] = useState('');
  const [qrResult, setQrResult] = useState<{ url: string; image: string } | null>(null);
  const [qrError, setQrError] = useState<{ url: string; message: string } | null>(null);
  const [copyError, setCopyError] = useState('');
  const [copiedUrl, setCopiedUrl] = useState('');

  // Available clients are those with a valid menuSlug
  const availableClients = clients.filter((client) => client.menuSlug);
  const selectedClient = availableClients.find((client) => client.id === selectedId) || availableClients[0];

  const menuUrl = selectedClient
    ? `${window.location.origin}/menu/${encodeURIComponent(selectedClient.menuSlug)}`
    : '';

  const qrImage = qrResult?.url === menuUrl ? qrResult.image : '';
  const error = (qrError?.url === menuUrl ? qrError.message : '') || copyError;
  const copied = copiedUrl === menuUrl;

  useEffect(() => {
    let isCurrent = true;
    void getClients().then((records) => {
      if (!isCurrent) return;
      if (records.length === 0) {
        records.push({ 
          id: 'mock', 
          businessName: 'shankar hotel', 
          category: 'RESTAURANT & CAFE', 
          menuSlug: 'shankar-hotel-demo', 
          status: 'active', 
          menuItems: [], 
          tagline: 'Digital Menu' 
        } as unknown as ClientRecord);
      }
      setClients(records);
      const validClients = records.filter((client) => client.menuSlug);
      const initialId = validClients.find((client) => client.id === requestedClientId)?.id ?? validClients[0]?.id ?? '';
      setSelectedId(initialId);
    }).catch((error: unknown) => {
      if (isCurrent) setLoadError(error instanceof Error ? error.message : 'Could not load menus.');
    }).finally(() => {
      if (isCurrent) setIsLoading(false);
    });
    return () => { isCurrent = false; };
  }, [requestedClientId]);

  useEffect(() => {
    let isCurrent = true;
    if (!menuUrl) return;

    void QRCode.toDataURL(menuUrl, {
      width: 600,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: { dark: '#1C1209', light: '#FFFFFF' },
    }).then((image) => {
      if (isCurrent) setQrResult({ url: menuUrl, image });
    }).catch(() => {
      if (isCurrent) setQrError({ url: menuUrl, message: 'QR code could not be generated. Please try again.' });
    });

    return () => { isCurrent = false; };
  }, [menuUrl]);

  async function copyMenuLink() {
    setCopyError('');
    try {
      await navigator.clipboard.writeText(menuUrl);
      setCopiedUrl(menuUrl);
    } catch {
      setCopyError('Could not copy the link. Copy it directly from the menu URL field.');
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <div className="flex items-center gap-3 text-[#f29a66]">
          <QrCode size={20} />
          <span className="text-xs font-bold uppercase tracking-[0.16em]">Admin Tools</span>
        </div>
        <h1 className="mt-2 text-3xl font-black text-white">Admin QR Code & Sticker Studio</h1>
        <p className="mt-2 text-sm text-[#aab7b2]">
          Generate, preview, and download physical QR stand artwork for any registered restaurant menu.
        </p>
      </header>

      {isLoading ? (
        <p className="text-sm text-[#94a39d]">Loading restaurant menus…</p>
      ) : loadError ? (
        <p role="alert" className="text-sm text-rose-300">{loadError}</p>
      ) : availableClients.length === 0 ? (
        <section className="admin-panel flex min-h-72 flex-col items-center justify-center rounded-2xl border p-8 text-center">
          <span className="mb-4 rounded-xl bg-[#e8783c]/10 p-3 text-[#f29a66]"><Store size={24} /></span>
          <h2 className="font-bold text-white">No active menus yet</h2>
          <p className="mt-2 max-w-sm text-sm text-[#94a39d]">Create a restaurant menu first to generate physical QR sticker stands.</p>
          <Link to="/admin/clients/new/business" className="mt-5 rounded-lg bg-[#e8783c] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#f18b50]">Create a menu</Link>
        </section>
      ) : (
        <section className="admin-panel flex flex-col gap-7 rounded-2xl border p-0 sm:p-0 overflow-hidden shadow-2xl">
          <div className="p-5 sm:p-7 border-b border-white/[0.08] bg-[#151c19]">
            <div className="grid gap-7 lg:grid-cols-2">
              <div className="space-y-5">
                <label className="block text-sm font-semibold text-[#dce5df]">Select Restaurant Menu
                  <select
                    value={selectedClient?.id ?? ''}
                    onChange={(event) => setSelectedId(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-[#17211e] px-3.5 py-3 text-sm text-white outline-none transition focus:border-[#e8783c] focus:ring-2 focus:ring-[#e8783c]/20 cursor-pointer"
                  >
                    {availableClients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.businessName} · {client.category || 'RESTAURANT'}
                      </option>
                    ))}
                  </select>
                </label>

                {selectedClient && (
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate font-bold text-white text-base">{selectedClient.businessName}</h2>
                        <p className="mt-1 text-xs capitalize text-[#94a39d]">
                          {selectedClient.category || 'Restaurant'} · {(selectedClient.menuItems || []).length} menu items
                        </p>
                      </div>
                      <Store className="shrink-0 text-[#f29a66]" size={20} />
                    </div>
                    <label className="mt-4 block text-xs font-semibold text-[#94a39d]">Public Menu URL
                      <input
                        readOnly
                        value={menuUrl}
                        onFocus={(event) => event.currentTarget.select()}
                        className="mt-2 w-full rounded-lg border border-white/10 bg-[#111815] px-3 py-2.5 text-xs text-white outline-none"
                      />
                    </label>
                  </div>
                )}

                {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
              </div>

              <div className="flex flex-col justify-center space-y-4 rounded-xl border border-white/[0.08] bg-[#111815] p-5">
                <div>
                  <h3 className="font-bold text-white">Permanent QR Identity</h3>
                  <p className="mt-1 text-xs text-[#94a39d]">
                    This QR code artwork is generated for <strong>{selectedClient?.businessName || 'this restaurant'}</strong> and will always direct customers to their live menu.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void copyMenuLink()}
                    disabled={!qrImage}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Link copied' : 'Copy menu link'}
                  </button>
                  {menuUrl && (
                    <a
                      href={menuUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      <ExternalLink size={16} />
                      Open Live Menu
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative min-h-[650px] w-full bg-[#0d1210]">
            <MenusQRStickerGenerator 
              client={selectedClient} 
              menuUrl={menuUrl} 
              qrImage={qrImage} 
            />
          </div>
        </section>
      )}
    </div>
  );
}
