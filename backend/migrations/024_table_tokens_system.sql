-- 024_table_tokens_system.sql
-- System 2: Live Digital Table Token & Realistic Thermal Bill System
-- Tables: restaurant_tables, table_tokens, token_items, and partial unique active token index

-- 1. Restaurant Tables Configuration
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    VARCHAR(255) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  table_number INT NOT NULL,
  label        VARCHAR(100),
  capacity     INT NOT NULL DEFAULT 4,
  qr_code_url  TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_restaurant_tables_tenant_table UNIQUE (tenant_id, table_number)
);

CREATE INDEX IF NOT EXISTS idx_restaurant_tables_tenant_table 
  ON restaurant_tables (tenant_id, table_number);
CREATE INDEX IF NOT EXISTS idx_restaurant_tables_tenant_active 
  ON restaurant_tables (tenant_id, is_active);

-- 2. Live Table Tokens
CREATE TABLE IF NOT EXISTS table_tokens (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         VARCHAR(255) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  token_number      INT NOT NULL,
  token_code        VARCHAR(20) NOT NULL,
  table_id          UUID REFERENCES restaurant_tables(id) ON DELETE SET NULL,
  table_number      INT NOT NULL,
  status            VARCHAR(30) NOT NULL DEFAULT 'ISSUED',
  covers            INT NOT NULL DEFAULT 1,
  waiter_id         VARCHAR(255),
  customer_name     VARCHAR(255),
  customer_phone    VARCHAR(50),
  subtotal_paise    INT NOT NULL DEFAULT 0,
  tax_paise         INT NOT NULL DEFAULT 0,
  discount_paise    INT NOT NULL DEFAULT 0,
  tip_paise         INT NOT NULL DEFAULT 0,
  total_paise       INT NOT NULL DEFAULT 0,
  payment_method    VARCHAR(30),
  payment_reference VARCHAR(255),
  settled_at        TIMESTAMPTZ,
  settled_by_id     VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  closed_at         TIMESTAMPTZ,
  notes             TEXT,
  items_json        JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Crucial partial unique index: exactly one active dining session per table per tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_active_table_tokens 
  ON table_tokens (tenant_id, table_number) 
  WHERE status IN ('ISSUED', 'ORDERING', 'DINING', 'BILL_REQUESTED', 'UNPAID');

-- Query acceleration indexes
CREATE INDEX IF NOT EXISTS idx_table_tokens_tenant_status 
  ON table_tokens (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_table_tokens_tenant_created 
  ON table_tokens (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_table_tokens_tenant_token_num 
  ON table_tokens (tenant_id, token_number);
CREATE INDEX IF NOT EXISTS idx_table_tokens_table_id 
  ON table_tokens (table_id);
CREATE INDEX IF NOT EXISTS idx_table_tokens_settled_at 
  ON table_tokens (tenant_id, settled_at DESC) 
  WHERE settled_at IS NOT NULL;

-- 3. Token Line Items
CREATE TABLE IF NOT EXISTS token_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id          UUID NOT NULL REFERENCES table_tokens(id) ON DELETE CASCADE,
  menu_item_id      VARCHAR(255),
  item_name         VARCHAR(255) NOT NULL,
  variant           VARCHAR(100),
  quantity          INT NOT NULL CHECK (quantity > 0),
  unit_price_paise  INT NOT NULL DEFAULT 0,
  total_price_paise INT NOT NULL DEFAULT 0,
  is_veg            BOOLEAN DEFAULT true,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_token_items_token_id 
  ON token_items (token_id);
CREATE INDEX IF NOT EXISTS idx_token_items_menu_item 
  ON token_items (menu_item_id) 
  WHERE menu_item_id IS NOT NULL;
