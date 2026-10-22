-- Migration / Sanitization Script: Remove clear_password from orders.metadata
-- Purpose: Remediates Issue #2 by purging plaintext passwords stored in orders.metadata.
-- Usage: psql "$DATABASE_URL" -f backend/scripts/scrub-clear-passwords.sql

BEGIN;

-- Check how many records have clear_password in metadata
DO $$
DECLARE
  affected_count INT;
BEGIN
  SELECT COUNT(*) INTO affected_count
  FROM orders
  WHERE metadata ? 'clear_password';

  RAISE NOTICE 'Found % orders containing plaintext clear_password in metadata.', affected_count;
END $$;

-- Scrub clear_password from metadata JSONB while keeping password_hash intact
UPDATE orders
SET metadata = metadata - 'clear_password',
    updated_at = CURRENT_TIMESTAMP
WHERE metadata ? 'clear_password';

-- Verification step
DO $$
DECLARE
  remaining_count INT;
BEGIN
  SELECT COUNT(*) INTO remaining_count
  FROM orders
  WHERE metadata ? 'clear_password';

  IF remaining_count > 0 THEN
    RAISE EXCEPTION 'Failed to scrub clear_password: % records still contaminated!', remaining_count;
  ELSE
    RAISE NOTICE 'Successfully sanitized orders metadata. 0 plaintext passwords remain.';
  END IF;
END $$;

COMMIT;
