/**
 * Monthly online-order limit.
 *
 * A restaurant can receive ORDER_LIMIT.includedPerMonth customer orders per IST calendar month.
 * Every order sent to the kitchen counts (a follow-up round at the same table is a new kitchen
 * order); cancelled orders do not. More orders can be unlocked with packs bought for that month
 * (online, or recorded by the super admin for an offline payment).
 */
import { pool } from './db.js';
import { ORDER_LIMIT } from './planCatalog.js';

const IST = "'Asia/Kolkata'";

/**
 * Orders used and packs bought this IST month.
 *
 * The month boundary is computed in SQL on purpose: customer_orders.created_at is a plain
 * TIMESTAMP (the DB session's wall clock), so we convert it to IST the same way it was written
 * instead of comparing it with a JavaScript Date in whatever zone the Node process runs in.
 */
export async function getOrderUsage(db, tenantId) {
  const monthRes = await db.query(`SELECT to_char(now() AT TIME ZONE ${IST}, 'YYYY-MM') AS period`);
  const period = monthRes.rows[0].period;

  const [usedRes, packRes] = await Promise.all([
    db.query(
      `SELECT COUNT(*)::int AS used
       FROM customer_orders
       WHERE tenant_id = $1
         AND status <> 'CANCELLED'
         AND to_char((created_at AT TIME ZONE current_setting('TimeZone')) AT TIME ZONE ${IST}, 'YYYY-MM') = $2`,
      [tenantId, period]
    ),
    db.query(
      `SELECT COALESCE(SUM(packs), 0)::int AS packs, COALESCE(SUM(orders_added), 0)::int AS added
       FROM order_pack_purchases
       WHERE tenant_id = $1 AND period = $2`,
      [tenantId, period]
    ),
  ]);

  const used = usedRes.rows[0].used;
  const packsBought = packRes.rows[0].packs;
  const included = ORDER_LIMIT.includedPerMonth;
  const limit = included + packRes.rows[0].added;

  return {
    period,
    used,
    included,
    packsBought,
    extraOrders: packRes.rows[0].added,
    limit,
    remaining: Math.max(0, limit - used),
    exceeded: used >= limit,
    packSize: ORDER_LIMIT.packSize,
    packPrice: ORDER_LIMIT.packPrice,
    maxPacksPerPurchase: ORDER_LIMIT.maxPacksPerPurchase,
  };
}

export const usageFor = (tenantId) => getOrderUsage(pool, tenantId);

/** Validate a requested number of packs (whole number, 1..max). Throws a 400-style error. */
export function parsePackCount(value, makeError) {
  const packs = Number(value);
  if (!Number.isInteger(packs) || packs < 1 || packs > ORDER_LIMIT.maxPacksPerPurchase) {
    throw makeError(400, `Choose between 1 and ${ORDER_LIMIT.maxPacksPerPurchase} packs of ${ORDER_LIMIT.packSize} orders.`);
  }
  return packs;
}

/** Price in rupees for `packs` packs. */
export const packsAmount = (packs) => packs * ORDER_LIMIT.packPrice;
