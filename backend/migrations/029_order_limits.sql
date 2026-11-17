-- 028_order_limits.sql
-- MENUQR: monthly online-order limit (150 included) and extra order packs (₹99 per 50 orders).
--
-- One row per purchase of extra orders. `period` is the IST calendar month ('YYYY-MM') the packs
-- are valid for. `order_id` is the payment order of an online purchase: its UNIQUE constraint makes
-- the grant idempotent when a payment is verified twice. Offline (super admin) grants have no order.

CREATE TABLE IF NOT EXISTS order_pack_purchases (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          VARCHAR(255) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  period             VARCHAR(7) NOT NULL,
  packs              INTEGER NOT NULL CHECK (packs > 0),
  orders_added       INTEGER NOT NULL CHECK (orders_added > 0),
  amount             NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  source             VARCHAR(10) NOT NULL CHECK (source IN ('ONLINE', 'MANUAL')),
  order_id           VARCHAR(255) UNIQUE REFERENCES orders(id) ON DELETE SET NULL,
  payment_mode       VARCHAR(30),
  payment_reference  VARCHAR(255),
  notes              TEXT,
  granted_by         VARCHAR(255),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_pack_purchases_tenant_period ON order_pack_purchases(tenant_id, period);
