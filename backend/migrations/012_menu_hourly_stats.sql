-- Migration 012: Aggregated menu traffic (QR scans and direct views), one row per tenant per IST hour.
-- Counters only: no IP, no device id, no per-visit rows, so the table stays tiny and private.
CREATE TABLE IF NOT EXISTS menu_hourly_stats (
  tenant_id VARCHAR(255) REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  day DATE NOT NULL,
  hour SMALLINT NOT NULL CHECK (hour BETWEEN 0 AND 23),
  scans INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (tenant_id, day, hour)
);
