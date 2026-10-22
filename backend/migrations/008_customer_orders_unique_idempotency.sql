-- Step 1: Remove existing duplicate idempotency keys if any, keeping the latest one
DELETE FROM customer_orders a
USING customer_orders b
WHERE a.ctid < b.ctid
  AND a.tenant_id = b.tenant_id
  AND a.idempotency_key = b.idempotency_key
  AND a.idempotency_key IS NOT NULL;

-- Step 2: Drop old non-unique index
DROP INDEX IF EXISTS idx_customer_orders_idempotency;

-- Step 3: Create partial UNIQUE index on (tenant_id, idempotency_key) where not null
CREATE UNIQUE INDEX IF NOT EXISTS uq_customer_orders_tenant_idempotency
ON customer_orders (tenant_id, idempotency_key)
WHERE idempotency_key IS NOT NULL;
