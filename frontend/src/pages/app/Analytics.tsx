import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight, BarChart3, QrCode, RefreshCw, Sparkles } from 'lucide-react';
import { getAnalytics, type AppAnalytics } from './appStore';
import { COLORS, HoursStrip, Sparkline, TopDishes, TrafficChart, TypeSplit } from '../../components/analytics/Charts';
import { formatChange, formatCount, formatInr, shortDay } from '../../utils/analyticsFormat';

type Range = 7 | 30;

function Card({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-[#2a3832] bg-[#151c19] p-5 sm:p-6 ${className}`}>
      <header className="mb-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#849a90]">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-[#6f8279]">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

function DeltaPill({ change, current }: { change: number | null; current: number }) {
  const { text, tone } = formatChange(change, current);
  const styles = {
    up: 'bg-emerald-500/12 text-emerald-400',
    down: 'bg-rose-500/12 text-rose-400',
    flat: 'bg-white/5 text-[#849a90]',
    new: 'bg-[#e8783c]/12 text-[#f4a272]',
  }[tone];
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${styles}`}>
      {tone === 'up' && <ArrowUpRight size={12} />}
      {tone === 'down' && <ArrowDownRight size={12} />}
      {text}
    </span>
  );
}

function Kpi({ label, value, change, current, spark, color, hint }: { label: string; value: string; change: number | null; current: number; spark: number[]; color: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-[#2a3832] bg-gradient-to-b from-[#1d2723] to-[#151c19] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wider text-[#849a90]">{label}</p>
        <DeltaPill change={change} current={current} />
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
        <p className="text-2xl font-black tracking-tight text-white sm:text-[2rem]">{value}</p>
        <Sparkline values={spark} color={color} />
      </div>
      {hint && <p className="mt-2 text-[11px] text-[#6f8279]">{hint}</p>}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading analytics">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-[132px] animate-pulse rounded-2xl bg-[#1d2723]" />)}
      </div>
      <div className="h-[340px] animate-pulse rounded-2xl bg-[#1d2723]" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-2xl bg-[#1d2723]" />
        <div className="h-64 animate-pulse rounded-2xl bg-[#1d2723]" />
      </div>
    </div>
  );
}

export default function Analytics() {
  const [range, setRange] = useState<Range>(7);
  const [data, setData] = useState<AppAnalytics | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (r: Range) => {
    setLoading(true);
    setError('');
    try {
      setData(await getAnalytics(r));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analytics could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(range); }, [load, range]);

  const traffic = data?.traffic;
  const orders = data?.orders;
  const visits = traffic ? traffic.totals.scans + traffic.totals.views : 0;
  const prevVisits = traffic ? traffic.previous.scans + traffic.previous.views : 0;
  const visitsChange = prevVisits ? Math.round(((visits - prevVisits) / prevVisits) * 1000) / 10 : null;
  const hasAnything = visits > 0 || (orders?.totals.orders ?? 0) > 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 pb-12 pt-4 animate-in fade-in duration-500 sm:pt-6 md:px-8">
      <header className="flex flex-col gap-4 border-b border-[#2a3832] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#e8783c]">Insights</p>
          <h1 className="mt-1 text-3xl font-bold text-white">Analytics</h1>
          <p className="mt-2 text-sm text-[#849a90]">
            {data ? <>{shortDay(data.from)} – {shortDay(data.to)} · compared with the {data.range} days before</> : 'How guests find and use your menu.'}
          </p>
        </div>
        <div role="group" aria-label="Date range" className="inline-flex self-start rounded-xl border border-[#2a3832] bg-[#151c19] p-1">
          {([7, 30] as const).map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={range === r}
              onClick={() => setRange(r)}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-colors ${range === r ? 'bg-[#e8783c] text-white shadow' : 'text-[#849a90] hover:text-white'}`}
            >
              Last {r} days
            </button>
          ))}
        </div>
      </header>

      {loading && !data && <Skeleton />}

      {error && (
        <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-8 text-center">
          <p className="font-semibold text-white">We couldn&rsquo;t load your analytics.</p>
          <p className="text-sm text-[#849a90]">{error}</p>
          <button type="button" onClick={() => void load(range)} className="inline-flex items-center gap-2 rounded-lg bg-[#25322d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2a3832]">
            <RefreshCw size={14} /> Try again
          </button>
        </div>
      )}

      {data && traffic && !error && (
        <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          {!hasAnything && (
            <div className="mb-6 flex flex-col items-start gap-4 rounded-2xl border border-[#e8783c]/25 bg-gradient-to-r from-[#e8783c]/10 to-transparent p-6 sm:flex-row sm:items-center">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#e8783c]/15 text-[#e8783c]"><Sparkles size={22} /></span>
              <div className="flex-1">
                <p className="font-bold text-white">Your numbers will appear here as guests scan your QR.</p>
                <p className="mt-1 text-sm text-[#849a90]">Print your table QR codes and place them on every table. Scans start counting immediately.</p>
              </div>
              <Link to="/app/qr" className="inline-flex items-center gap-2 rounded-lg bg-[#e8783c] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#f08b55]">
                <QrCode size={16} /> Open QR Studio
              </Link>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <Kpi label="Menu visits" value={formatCount(visits)} change={visitsChange} current={visits} spark={traffic.days.map((d) => d.scans + d.views)} color={COLORS.scans} hint={`${formatCount(traffic.totals.scans)} QR scans · ${formatCount(traffic.totals.views)} direct`} />
            <Kpi label="QR scans" value={formatCount(traffic.totals.scans)} change={traffic.change.scans} current={traffic.totals.scans} spark={traffic.days.map((d) => d.scans)} color={COLORS.views} hint="Guests who scanned a table QR" />
            {orders ? (
              <>
                <Kpi label="Orders" value={formatCount(orders.totals.orders)} change={orders.change.orders} current={orders.totals.orders} spark={orders.days.map((d) => d.orders)} color={COLORS.revenue} hint="Cancelled orders are not counted" />
                <Kpi label="Revenue" value={formatInr(orders.totals.revenue)} change={orders.change.revenue} current={orders.totals.revenue} spark={orders.days.map((d) => d.revenue)} color={COLORS.revenue} hint={`Average order ${formatInr(orders.totals.averageOrderValue)}`} />
              </>
            ) : (
              <div className="col-span-2 rounded-2xl border border-dashed border-[#36473f] p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#849a90]">Order insights</p>
                <p className="mt-2 text-sm text-[#c5d1cb]">Orders, revenue and your best-selling dishes appear here on the Premium plan, where guests can order from their table.</p>
                <Link to="/app/subscription" className="mt-3 inline-block text-sm font-bold text-[#e8783c] hover:text-[#f08b55]">See Premium →</Link>
              </div>
            )}
          </div>

          <Card title="Menu visits per day" subtitle="QR scans and direct link visits, one count per guest per day" className="mt-6">
            <div className="mb-3 flex gap-4 text-xs text-[#c5d1cb]">
              <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm" style={{ background: COLORS.scans }} />QR scans</span>
              <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm" style={{ background: COLORS.views }} />Direct views</span>
            </div>
            <TrafficChart days={traffic.days} />
          </Card>

          {/* Guest Actions & Link Clicks (Blueprint Phase 4 / 5) */}
          {data?.linkClicks && data.linkClicks.list && data.linkClicks.list.length > 0 && (
            <Card title="Guest Actions & Social Clicks" subtitle="Calls, WhatsApp chats, maps directions and profile visits" className="mt-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {data.linkClicks.list.map((item) => (
                  <div key={item.kind} className="rounded-xl border border-[#2a3832] bg-[#1d2723] p-4 flex flex-col justify-between">
                    <span className="text-xs uppercase font-bold text-[#849a90] tracking-wider capitalize">
                      {item.kind === 'custom' ? 'Social Link' : item.kind}
                    </span>
                    <span className="text-2xl font-black text-white mt-2">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card title="When guests open your menu" subtitle="Busy hours by India time">
              <HoursStrip hours={traffic.hours} color={COLORS.scans} unit="visits" />
            </Card>

            {orders ? (
              <Card title="When orders come in" subtitle="Order volume by India time">
                <HoursStrip hours={orders.hours} color={COLORS.revenue} unit="orders" />
              </Card>
            ) : (
              <Card title="Tip" subtitle="Make the most of your QR">
                <div className="flex items-start gap-3 text-sm text-[#c5d1cb]">
                  <BarChart3 className="mt-0.5 shrink-0 text-[#e8783c]" size={18} />
                  <p>Put a different table QR on each table. If scans spike at lunch but orders stay flat, your menu may need clearer photos or a featured dish.</p>
                </div>
              </Card>
            )}
          </div>

          {orders && (
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <Card title="Best-selling dishes" subtitle="Top 5 by quantity sold">
                {orders.topItems.length ? <TopDishes items={orders.topItems} /> : <p className="text-sm text-[#849a90]">No orders in this period yet.</p>}
              </Card>
              <Card title="Dine-in vs delivery" subtitle="Share of orders">
                {orders.byType.length ? <TypeSplit rows={orders.byType} /> : <p className="text-sm text-[#849a90]">No orders in this period yet.</p>}
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
