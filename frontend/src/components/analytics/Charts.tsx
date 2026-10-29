import { useEffect, useId, useRef, useState } from 'react';
import { busiestHourLabel, formatCount, formatHour, niceMax, orderTypeLabel, shortDay } from '../../utils/analyticsFormat';

export const COLORS = {
  scans: '#e8783c',
  views: '#6fd0b8',
  revenue: '#e8b84a',
  grid: '#2a3832',
  muted: '#849a90',
};

// ----------------------------------- sparkline -----------------------------------

export function Sparkline({ values, color = COLORS.scans }: { values: number[]; color?: string }) {
  const id = useId();
  const w = 96;
  const h = 32;
  const max = Math.max(...values, 1);
  const step = values.length > 1 ? w / (values.length - 1) : w;
  const pts = values.map((v, i) => [i * step, h - 3 - (v / max) * (h - 8)] as const);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-24" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// -------------------------------- traffic bar chart --------------------------------

type TrafficDay = { day: string; scans: number; views: number };

export function TrafficChart({ days }: { days: TrafficDay[] }) {
  const [active, setActive] = useState<number | null>(null);
  // Draw at the real pixel width so axis labels stay readable on phones instead of shrinking with the SVG.
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(720);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, Math.round(entry.contentRect.width))));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const W = width;
  const H = width < 480 ? 220 : 240;
  const pad = { l: 36, r: 8, t: 12, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const max = niceMax(Math.max(...days.map((d) => d.scans + d.views), 0));
  const slot = innerW / days.length;
  const barW = Math.min(28, Math.max(3, slot * 0.64));
  const labelEvery = days.length > 14 ? (W < 480 ? 7 : 5) : W < 480 ? 2 : 1;
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const total = days.reduce((a, d) => a + d.scans + d.views, 0);

  return (
    <div className="relative" ref={wrapRef}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        className="block max-w-full"
        role="img"
        aria-label={`Menu visits per day, ${total} in total. Orange is QR scans, green is direct views.`}
      >
        {ticks.map((t) => {
          const y = pad.t + innerH - t * innerH;
          return (
            <g key={t}>
              <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke={COLORS.grid} strokeDasharray={t === 0 ? undefined : '3 4'} />
              <text x={pad.l - 8} y={y + 3.5} textAnchor="end" fontSize="10.5" fill={COLORS.muted}>
                {formatCount(Math.round(max * t))}
              </text>
            </g>
          );
        })}
        {days.map((d, i) => {
          const x = pad.l + i * slot + (slot - barW) / 2;
          const scansH = (d.scans / max) * innerH;
          const viewsH = (d.views / max) * innerH;
          const base = pad.t + innerH;
          const isActive = active === i;
          return (
            <g
              key={d.day}
              tabIndex={0}
              role="img"
              aria-label={`${shortDay(d.day)}: ${d.scans} scans, ${d.views} direct views`}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className="outline-none"
            >
              <rect x={pad.l + i * slot} y={pad.t} width={slot} height={innerH} fill={isActive ? 'rgba(255,255,255,0.04)' : 'transparent'} />
              <rect x={x} y={base - scansH} width={barW} height={scansH} rx={scansH > 3 ? 3 : 0} fill={COLORS.scans} opacity={isActive || active === null ? 1 : 0.55} />
              <rect x={x} y={base - scansH - viewsH} width={barW} height={viewsH} rx={viewsH > 3 ? 3 : 0} fill={COLORS.views} opacity={isActive || active === null ? 1 : 0.55} />
              {i % labelEvery === 0 && (
                <text x={x + barW / 2} y={H - 8} textAnchor="middle" fontSize="10.5" fill={isActive ? '#fff' : COLORS.muted}>
                  {days.length > 14 ? shortDay(d.day).split(' ')[0] : shortDay(d.day)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {active !== null && (
        <div
          className="pointer-events-none absolute -top-2 rounded-lg border border-[#36473f] bg-[#0f1512]/95 px-3 py-2 text-xs shadow-xl backdrop-blur"
          style={{ left: `clamp(0px, calc(${((active + 0.5) / days.length) * 100}% - 70px), calc(100% - 140px))` }}
        >
          <div className="font-bold text-white">{shortDay(days[active].day)}</div>
          <div className="mt-1 flex items-center gap-2 text-[#c5d1cb]"><i className="h-2 w-2 rounded-full" style={{ background: COLORS.scans }} />{days[active].scans} QR scans</div>
          <div className="flex items-center gap-2 text-[#c5d1cb]"><i className="h-2 w-2 rounded-full" style={{ background: COLORS.views }} />{days[active].views} direct views</div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------ hours strip ------------------------------------

export function HoursStrip({ hours, color, unit }: { hours: number[]; color: string; unit: string }) {
  const max = Math.max(...hours, 0);
  const busiest = busiestHourLabel(hours);
  return (
    <div>
      <div className="grid grid-cols-24 gap-[3px]" style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }} role="img" aria-label={busiest ? `Busiest hour ${busiest}` : 'No activity yet'}>
        {hours.map((value, hour) => {
          const intensity = max ? value / max : 0;
          return (
            <div
              key={hour}
              title={`${formatHour(hour)}: ${value} ${unit}`}
              className="h-14 rounded-[4px] transition-transform hover:scale-y-110"
              style={{ background: value ? color : '#1d2723', opacity: value ? 0.25 + intensity * 0.75 : 1 }}
            />
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10.5px] text-[#849a90]">
        {[0, 6, 12, 18, 23].map((h) => <span key={h}>{formatHour(h)}</span>)}
      </div>
      <p className="mt-3 text-sm text-[#c5d1cb]">
        {busiest ? <>Busiest: <strong className="text-white">{busiest}</strong></> : 'Nothing to show for this period yet.'}
      </p>
    </div>
  );
}

// ------------------------------------- top dishes -------------------------------------

export function TopDishes({ items }: { items: Array<{ name: string; quantity: number; revenue: number }> }) {
  const max = Math.max(...items.map((i) => i.quantity), 1);
  return (
    <ol className="space-y-3">
      {items.map((item, i) => (
        <li key={item.name}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#25322d] text-[10px] font-bold text-[#e8b84a]">{i + 1}</span>
              <span className="truncate font-semibold text-white">{item.name}</span>
            </span>
            <span className="shrink-0 text-xs text-[#849a90]">{item.quantity} sold</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#1d2723]">
            <div className="h-full rounded-full" style={{ width: `${(item.quantity / max) * 100}%`, background: `linear-gradient(90deg, ${COLORS.scans}, ${COLORS.revenue})` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}

// -------------------------------------- type split --------------------------------------

export function TypeSplit({ rows }: { rows: Array<{ type: string; orders: number; revenue: number }> }) {
  const total = rows.reduce((a, r) => a + r.orders, 0) || 1;
  const palette = [COLORS.scans, COLORS.views, COLORS.revenue];
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-[#1d2723]" role="img" aria-label={rows.map((r) => `${orderTypeLabel(r.type)} ${r.orders}`).join(', ')}>
        {rows.map((r, i) => (
          <div key={r.type} style={{ width: `${(r.orders / total) * 100}%`, background: palette[i % palette.length] }} />
        ))}
      </div>
      <ul className="mt-4 space-y-2">
        {rows.map((r, i) => (
          <li key={r.type} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-[#c5d1cb]"><i className="h-2.5 w-2.5 rounded-full" style={{ background: palette[i % palette.length] }} />{orderTypeLabel(r.type)}</span>
            <span className="text-white"><strong>{r.orders}</strong> <span className="text-xs text-[#849a90]">({Math.round((r.orders / total) * 100)}%)</span></span>
          </li>
        ))}
      </ul>
    </div>
  );
}
