-- Migration 013: Private guest feedback (rating + optional comment), visible only to the restaurant.
CREATE TABLE IF NOT EXISTS menu_feedback (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  contact VARCHAR(120),
  table_number VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_menu_feedback_tenant_created ON menu_feedback (tenant_id, created_at DESC);
