-- 026: Permanent per-table codes inside the table QR (?tc=K7Q92M).
-- Diners never type a table number: the server reads the table from the code.
-- Every statement is idempotent so a re-run (or a database that already has a column) is harmless.

ALTER TABLE dining_tables ADD COLUMN IF NOT EXISTS table_number INT;
ALTER TABLE dining_tables ADD COLUMN IF NOT EXISTS qr_code VARCHAR(12);
ALTER TABLE dining_tables ADD COLUMN IF NOT EXISTS code_rotated_at TIMESTAMP;
CREATE UNIQUE INDEX IF NOT EXISTS uq_dining_tables_qr_code ON dining_tables (qr_code) WHERE qr_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_dining_tables_tenant_number ON dining_tables (tenant_id, table_number);

-- Tables saved earlier as "4" or "Table 4" get their number.
UPDATE dining_tables
   SET table_number = regexp_replace(label, '[^0-9]', '', 'g')::int
 WHERE table_number IS NULL
   AND regexp_replace(label, '[^0-9]', '', 'g') ~ '^[0-9]{1,4}$';

-- Every existing table gets a code. Alphabet has no 0/O/1/I/L so a printed code is never misread.
DO $$
DECLARE
  r RECORD;
  alphabet TEXT := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  candidate TEXT;
  i INT;
BEGIN
  FOR r IN SELECT id FROM dining_tables WHERE qr_code IS NULL LOOP
    LOOP
      candidate := '';
      FOR i IN 1..6 LOOP
        candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
      END LOOP;
      EXIT WHEN NOT EXISTS (SELECT 1 FROM dining_tables WHERE qr_code = candidate);
    END LOOP;
    UPDATE dining_tables SET qr_code = candidate, code_rotated_at = NOW() WHERE id = r.id;
  END LOOP;
END $$;

-- Bill lines remember which customer order they came from, so cancelling the order removes them.
ALTER TABLE token_items ADD COLUMN IF NOT EXISTS order_id VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_token_items_order ON token_items (order_id) WHERE order_id IS NOT NULL;

-- How the table of a dine-in order was known: 'code' (sticker code) or 'legacy' (old ?table=N link).
ALTER TABLE customer_orders ADD COLUMN IF NOT EXISTS table_source VARCHAR(20);

-- Old stickers printed with ?table=N. NULL means: allowed for restaurants created before table codes, off for newer ones.
ALTER TABLE ordering_settings ADD COLUMN IF NOT EXISTS allow_legacy_table_param BOOLEAN;
