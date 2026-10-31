/**
 * Owner analytics.
 *
 * Everything is bucketed on the restaurant's IST wall clock. `customer_orders.created_at` is a
 * `timestamp` without a zone, written with the database session's TimeZone, so it is first
 * re-anchored to that zone and then converted to IST. That keeps the buckets right whether the
 * database runs in UTC (hosted) or IST (a local Postgres).
 */
import { istDateString } from './istTime.js';

const IST_CREATED_AT = "((created_at AT TIME ZONE current_setting('TimeZone')) AT TIME ZONE 'Asia/Kolkata')";
const COUNTED_ORDER = "status NOT IN ('CANCELLED')";

export const ALLOWED_RANGES = [7, 30];

/** Shifts a `YYYY-MM-DD` date by whole days without touching timezones. */
export function shiftDay(day, delta) {
  const [y, m, d] = day.split('-').map(Number);
  const shifted = new Date(Date.UTC(y, m - 1, d + delta));
  return shifted.toISOString().slice(0, 10);
}

/** The `n` calendar days ending at `endDay`, oldest first. */
export function daySeries(endDay, n) {
  return Array.from({ length: n }, (_, i) => shiftDay(endDay, i - (n - 1)));
}

/** Fills missing days with zeros so charts have a continuous axis. */
export function zeroFill(days, rowsByDay, fields) {
  return days.map((day) => {
    const row = rowsByDay.get(day) || {};
    const out = { day };
    for (const f of fields) out[f] = Number(row[f] || 0);
    return out;
  });
}

export function sumField(rows, field) {
  return rows.reduce((total, row) => total + Number(row[field] || 0), 0);
}

/**
 * Item ids ordered 3+ times today (IST), for the public menu's "Trending Now" badge.
 *
 * No new tracking infrastructure: `customer_orders.items` JSONB already carries each line's
 * `id` and `quantity` (the same column `getTenantAnalytics`'s `topItems` query reads, just
 * grouped by name there instead of id). The minimum-count floor keeps one stray order on a quiet
 * day from reading as "trending" — a badge that shows up after a single sale would undersell the
 * dishes that genuinely are popular.
 */
export async function getTrendingItemIds(db, tenantId, { minCount = 3 } = {}) {
  const rows = (await db.query(
    `SELECT elem->>'id' AS id, SUM(COALESCE((elem->>'quantity')::int, 1))::int AS quantity
       FROM customer_orders, jsonb_array_elements(CASE WHEN jsonb_typeof(items) = 'array' THEN items ELSE '[]'::jsonb END) elem
      WHERE tenant_id = $1 AND ${COUNTED_ORDER} AND ${IST_CREATED_AT}::date = $2::date AND elem->>'id' IS NOT NULL
      GROUP BY 1
     HAVING SUM(COALESCE((elem->>'quantity')::int, 1)) >= $3`,
    [tenantId, istDateString(), minCount]
  )).rows;
  return new Set(rows.map((r) => r.id));
}

/** Percentage change vs the previous period; null when there is no baseline to compare with. */
export function percentChange(current, previous) {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function byDayMap(rows) {
  return new Map(rows.map((r) => [r.day, r]));
}

function hourArray(rows, field) {
  const hours = Array(24).fill(0);
  for (const row of rows) {
    const h = Number(row.hour);
    if (h >= 0 && h < 24) hours[h] = Number(row[field] || 0);
  }
  return hours;
}

/**
 * @param db        object with `query(sql, params)`
 * @param tenantId  restaurant id (every query is scoped by it)
 * @param range     7 or 30
 * @param includeOrders  false for plans that cannot take orders
 */
export async function getTenantAnalytics(db, tenantId, range, { includeOrders = false, now = new Date() } = {}) {
  const n = ALLOWED_RANGES.includes(range) ? range : 7;
  const to = istDateString(now);
  const days = daySeries(to, n);
  const from = days[0];
  const prevFrom = shiftDay(from, -n);

  // Traffic: one query covers the current and the previous period.
  const trafficRows = (await db.query(
    `SELECT day::text AS day, SUM(scans)::int AS scans, SUM(views)::int AS views
       FROM menu_hourly_stats WHERE tenant_id = $1 AND day >= $2::date AND day <= $3::date GROUP BY day`,
    [tenantId, prevFrom, to]
  )).rows;
  const trafficHourRows = (await db.query(
    `SELECT hour, SUM(scans + views)::int AS total
       FROM menu_hourly_stats WHERE tenant_id = $1 AND day >= $2::date AND day <= $3::date GROUP BY hour`,
    [tenantId, from, to]
  )).rows;

  const current = trafficRows.filter((r) => r.day >= from);
  const previous = trafficRows.filter((r) => r.day < from);
  const traffic = {
    days: zeroFill(days, byDayMap(current), ['scans', 'views']),
    totals: { scans: sumField(current, 'scans'), views: sumField(current, 'views') },
    previous: { scans: sumField(previous, 'scans'), views: sumField(previous, 'views') },
    hours: hourArray(trafficHourRows, 'total'),
  };
  traffic.change = {
    scans: percentChange(traffic.totals.scans, traffic.previous.scans),
    views: percentChange(traffic.totals.views, traffic.previous.views),
  };

  let orders = null;
  if (includeOrders) {
    const orderDayRows = (await db.query(
      `SELECT (${IST_CREATED_AT})::date::text AS day, COUNT(*)::int AS orders, COALESCE(SUM(total), 0)::float AS revenue
         FROM customer_orders
        WHERE tenant_id = $1 AND ${COUNTED_ORDER} AND ${IST_CREATED_AT} >= $2::date
        GROUP BY 1`,
      [tenantId, prevFrom]
    )).rows;
    const curOrders = orderDayRows.filter((r) => r.day >= from);
    const prevOrders = orderDayRows.filter((r) => r.day < from);

    const hourRows = (await db.query(
      `SELECT EXTRACT(HOUR FROM ${IST_CREATED_AT})::int AS hour, COUNT(*)::int AS orders
         FROM customer_orders
        WHERE tenant_id = $1 AND ${COUNTED_ORDER} AND ${IST_CREATED_AT} >= $2::date
        GROUP BY 1`,
      [tenantId, from]
    )).rows;
    const typeRows = (await db.query(
      `SELECT COALESCE(order_type, 'DINE_IN') AS type, COUNT(*)::int AS orders, COALESCE(SUM(total), 0)::float AS revenue
         FROM customer_orders
        WHERE tenant_id = $1 AND ${COUNTED_ORDER} AND ${IST_CREATED_AT} >= $2::date
        GROUP BY 1 ORDER BY 2 DESC`,
      [tenantId, from]
    )).rows;
    const topItems = (await db.query(
      `SELECT elem->>'name' AS name,
              SUM(COALESCE((elem->>'quantity')::int, 1))::int AS quantity,
              COALESCE(SUM(COALESCE((elem->>'price')::numeric, 0) * COALESCE((elem->>'quantity')::int, 1)), 0)::float AS revenue
         FROM customer_orders, jsonb_array_elements(CASE WHEN jsonb_typeof(items) = 'array' THEN items ELSE '[]'::jsonb END) elem
        WHERE tenant_id = $1 AND ${COUNTED_ORDER} AND ${IST_CREATED_AT} >= $2::date AND elem->>'name' IS NOT NULL
        GROUP BY 1 ORDER BY 2 DESC, 3 DESC LIMIT 5`,
      [tenantId, from]
    )).rows;

    const totalOrders = sumField(curOrders, 'orders');
    const totalRevenue = sumField(curOrders, 'revenue');
    const prevTotalOrders = sumField(prevOrders, 'orders');
    const prevTotalRevenue = sumField(prevOrders, 'revenue');
    orders = {
      days: zeroFill(days, byDayMap(curOrders), ['orders', 'revenue']),
      totals: {
        orders: totalOrders,
        revenue: Math.round(totalRevenue),
        averageOrderValue: totalOrders ? Math.round(totalRevenue / totalOrders) : 0,
      },
      previous: { orders: prevTotalOrders, revenue: Math.round(prevTotalRevenue) },
      change: {
        orders: percentChange(totalOrders, prevTotalOrders),
        revenue: percentChange(totalRevenue, prevTotalRevenue),
      },
      hours: hourArray(hourRows, 'orders'),
      byType: typeRows.map((r) => ({ type: r.type, orders: r.orders, revenue: Math.round(r.revenue) })),
      topItems: topItems.map((r) => ({ name: r.name, quantity: r.quantity, revenue: Math.round(r.revenue) })),
    };
  }

  let linkClicks = { totals: {}, list: [] };
  try {
    const clickRows = (await db.query(
      `SELECT kind, SUM(count)::int AS count
         FROM link_clicks_daily
        WHERE tenant_id = $1 AND day >= $2::date AND day <= $3::date
        GROUP BY kind ORDER BY count DESC`,
      [tenantId, from, to]
    )).rows;
    const totals = {};
    for (const r of clickRows) {
      totals[r.kind] = r.count;
    }
    linkClicks = { totals, list: clickRows };
  } catch (err) {
    // Graceful fallback if table is pending migration
  }

  return { range: n, from, to, traffic, orders, linkClicks };
}
