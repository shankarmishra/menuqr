-- Migration 007: Customer Orders Idempotency & Privacy Protection
ALTER TABLE customer_orders ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(128);
ALTER TABLE customer_orders ADD COLUMN IF NOT EXISTS tracking_token VARCHAR(64);

CREATE INDEX IF NOT EXISTS idx_customer_orders_idempotency ON customer_orders (tenant_id, idempotency_key);
CREATE INDEX IF NOT EXISTS idx_customer_orders_tracking_token ON customer_orders (id, tracking_token);
