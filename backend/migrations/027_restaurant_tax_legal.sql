-- 027: Restaurant tax and legal details, frozen tax settings on bills, and honest MenusQR receipts.
-- Every statement is idempotent so a re-run (or a database that already has a column) is harmless.

-- ── Restaurant GST status, GSTIN and legal name ─────────────────────────────
-- gst_mode:
--   UNSET           owner has not chosen yet; bills keep the old 5% so nothing changes for
--                   existing restaurants, but no GSTIN is printed.
--   NOT_REGISTERED  no GST charged, no GSTIN printed.
--   COMPOSITION     no GST charged; the bill carries the composition-scheme declaration.
--   REGULAR         GST charged at gst_rate_bps (basis points: 500 = 5%), split CGST/SGST.
ALTER TABLE restaurant_profiles ADD COLUMN IF NOT EXISTS gst_mode TEXT NOT NULL DEFAULT 'UNSET';
ALTER TABLE restaurant_profiles ADD COLUMN IF NOT EXISTS gstin VARCHAR(15);
ALTER TABLE restaurant_profiles ADD COLUMN IF NOT EXISTS gst_rate_bps INT NOT NULL DEFAULT 500;
ALTER TABLE restaurant_profiles ADD COLUMN IF NOT EXISTS legal_name VARCHAR(120);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_restaurant_profiles_gst_mode') THEN
    ALTER TABLE restaurant_profiles ADD CONSTRAINT chk_restaurant_profiles_gst_mode
      CHECK (gst_mode IN ('UNSET', 'NOT_REGISTERED', 'COMPOSITION', 'REGULAR'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_restaurant_profiles_gst_rate') THEN
    ALTER TABLE restaurant_profiles ADD CONSTRAINT chk_restaurant_profiles_gst_rate
      CHECK (gst_rate_bps IN (0, 500, 1200, 1800));
  END IF;
  -- A GSTIN is required for REGULAR and COMPOSITION, and must be absent otherwise.
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_restaurant_profiles_gstin_mode') THEN
    ALTER TABLE restaurant_profiles ADD CONSTRAINT chk_restaurant_profiles_gstin_mode
      CHECK (
        (gst_mode IN ('REGULAR', 'COMPOSITION') AND gstin ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$')
        OR (gst_mode IN ('UNSET', 'NOT_REGISTERED') AND gstin IS NULL)
      );
  END IF;
END $$;

-- ── Bills remember the tax rule they were created under ───────────────────
-- Changing the GST setting later must never change an existing bill.
ALTER TABLE table_tokens ADD COLUMN IF NOT EXISTS tax_mode TEXT;
ALTER TABLE table_tokens ADD COLUMN IF NOT EXISTS tax_rate_bps INT;

-- ── MenusQR's own subscription documents ──────────────────────────────────
-- Until MenusQR is GST-registered it issues payment receipts, not tax invoices,
-- so the seller GSTIN may be empty. Existing rows keep their values.
ALTER TABLE gst_invoices ALTER COLUMN seller_gstin DROP NOT NULL;
ALTER TABLE gst_invoices ALTER COLUMN seller_gstin DROP DEFAULT;
ALTER TABLE gst_invoices ALTER COLUMN seller_name SET DEFAULT 'MenusQR';
ALTER TABLE gst_invoices ADD COLUMN IF NOT EXISTS document_type VARCHAR(20) NOT NULL DEFAULT 'TAX_INVOICE';
