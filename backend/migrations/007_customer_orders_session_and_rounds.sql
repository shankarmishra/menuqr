-- Migration 007: Table Dining Sessions & Multi-Round Re-Ordering
ALTER TABLE customer_orders ADD COLUMN IF NOT EXISTS session_id VARCHAR(100);
ALTER TABLE customer_orders ADD COLUMN IF NOT EXISTS round_number INT DEFAULT 1;
ALTER TABLE customer_orders ADD COLUMN IF NOT EXISTS parent_order_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_customer_orders_session ON customer_orders (tenant_id, session_id);
CREATE INDEX IF NOT EXISTS idx_customer_orders_session_created ON customer_orders (session_id, created_at ASC);
