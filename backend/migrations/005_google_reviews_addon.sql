-- Migration 005: Google Reviews Add-on & Entitlements

-- Add columns to orders for tracking selected add-ons and add-on amounts
ALTER TABLE orders ADD COLUMN IF NOT EXISTS selected_addons JSONB DEFAULT '[]'::jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS addon_amount DECIMAL(10, 2) DEFAULT 0.00;

-- Tenant add-on entitlements table (server-authoritative activation)
CREATE TABLE IF NOT EXISTS tenant_addon_entitlements (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  addon_id VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'CANCELLED')),
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  order_id VARCHAR(255) REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_tenant_addon UNIQUE (tenant_id, addon_id)
);

CREATE INDEX IF NOT EXISTS idx_tenant_addon_entitlements_lookup
  ON tenant_addon_entitlements (tenant_id, addon_id, status);

CREATE INDEX IF NOT EXISTS idx_tenant_addon_entitlements_expiry
  ON tenant_addon_entitlements (status, expires_at);

-- Tenant Google Reviews configuration table
CREATE TABLE IF NOT EXISTS tenant_google_reviews (
  tenant_id VARCHAR(255) PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
  review_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
