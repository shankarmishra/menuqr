-- 010_restaurant_socials_and_order_estimated_time.sql
-- Add optional social media links to clients & orders
ALTER TABLE clients ADD COLUMN IF NOT EXISTS instagram VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS facebook VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS website VARCHAR(255);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS facebook VARCHAR(255);

-- Add estimated preparation/delivery time to customer_orders
ALTER TABLE customer_orders ADD COLUMN IF NOT EXISTS estimated_time_minutes INTEGER;
ALTER TABLE customer_orders ADD COLUMN IF NOT EXISTS estimated_delivery_time TIMESTAMP;
