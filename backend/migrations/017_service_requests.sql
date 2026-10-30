-- Migration 017: Persist table-service requests (Call Waiter / Water / Bill).
-- The live broadcast to the reception panel (orderStream.js) is unchanged and still fires
-- immediately; this table is additive, so a request survives even when no reception tab is open,
-- and gives the owner a history to review.
CREATE TABLE IF NOT EXISTS service_requests (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  table_number VARCHAR(50) NOT NULL,
  request_type VARCHAR(20) NOT NULL,
  notes TEXT,
  customer_name VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_service_requests_tenant_created ON service_requests (tenant_id, created_at DESC);
