-- Migration 006: Customer Orders Dine-in & Delivery Flow enhancements
ALTER TABLE customer_orders ADD COLUMN IF NOT EXISTS order_type VARCHAR(50) DEFAULT 'DINE_IN';
ALTER TABLE customer_orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50);
ALTER TABLE customer_orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE customer_orders ADD COLUMN IF NOT EXISTS delivery_landmark VARCHAR(255);
ALTER TABLE customer_orders ADD COLUMN IF NOT EXISTS delivery_city VARCHAR(255);
ALTER TABLE customer_orders ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Ensure table_number can be null for delivery orders
DO $$
BEGIN
  ALTER TABLE customer_orders ALTER COLUMN table_number DROP NOT NULL;
EXCEPTION
  WHEN undefined_column THEN NULL;
  WHEN others THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_customer_orders_tenant_created ON customer_orders (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_orders_tenant_status ON customer_orders (tenant_id, status);
