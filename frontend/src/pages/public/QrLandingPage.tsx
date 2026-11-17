import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { MenusQRBrand } from '../../components/brand/MenusQRBrand';
import { getClientByQrId } from '../admin/clientStore';

export default function QrLandingPage() {
  const { qrId = '' } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Table stickers carry ?tc=<code> (old ones ?table=N); carry it through the redirect so the
  // menu knows the table without the diner typing anything.
  const tableCode = (searchParams.get('tc') || '').trim().slice(0, 16);
  const table = (searchParams.get('table') || '').trim().slice(0, 20);
  const [error, setError] = useState('');

  useEffect(() => {
    let current = true;
    void getClientByQrId(qrId).then(({ menuSlug, client }) => {
      if (!current) return;
      const tableQuery = tableCode
        ? `&tc=${encodeURIComponent(tableCode)}`
        : table ? `&table=${encodeURIComponent(table)}` : '';
      navigate(`/menu/${encodeURIComponent(menuSlug)}?qr=${encodeURIComponent(qrId)}${tableQuery}`, {
        replace: true,
        state: { publicMenu: client },
      });
    }).catch((requestError: unknown) => {
      if (!current) return;
      setError(requestError instanceof Error && requestError.message === 'SUBSCRIPTION_EXPIRED'
        ? 'This restaurant menu is temporarily unavailable. Please contact the restaurant.'
        : 'We could not open this menu right now. Please try scanning again.');
    });
    return () => { current = false; };
  }, [navigate, qrId, table, tableCode]);

  return (
    <main className="grid min-h-dvh place-items-center bg-[#f7f5ee] px-5 text-[#18231f]">
      <div className="w-full max-w-sm text-center">
        <div className="mb-8 flex justify-center"><MenusQRBrand size="md" variant="primary" /></div>
        {error ? (
          <div role="alert" className="rounded-lg border border-[#d9ddd7] bg-white p-6 shadow-sm">
            <h1 className="text-lg font-bold">Menu unavailable</h1>
            <p className="mt-2 text-sm text-[#58645f]">{error}</p>
            <button type="button" onClick={() => window.location.reload()} className="mt-5 rounded-md bg-[#e8783c] px-4 py-2 text-sm font-semibold text-white">Try again</button>
          </div>
        ) : (
          <div role="status" className="text-sm text-[#58645f]">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#d9ddd7] border-t-[#e8783c] motion-reduce:animate-none" />
            Opening the latest menu…
          </div>
        )}
      </div>
    </main>
  );
}