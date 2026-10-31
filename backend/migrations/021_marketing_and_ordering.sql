-- 021_marketing_and_ordering.sql
-- MENUQR Platform Blueprint Phase 1: Announcements, Offers, Ordering Settings, Tables & Festival Menus

CREATE TABLE IF NOT EXISTS restaurant_announcements (
  id           VARCHAR(255) PRIMARY KEY,
  tenant_id    VARCHAR(255) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  text         VARCHAR(120) NOT NULL,
  link_type    VARCHAR(20) DEFAULT 'none', -- none | category | url | whatsapp
  link_target  TEXT,
  starts_at    TIMESTAMP,
  ends_at      TIMESTAMP,
  is_active    BOOLEAN DEFAULT true,
  i18n         JSONB NOT NULL DEFAULT '{}', -- {hi: {text: string}}
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_announcements_tenant_active 
  ON restaurant_announcements (tenant_id, is_active);

CREATE TABLE IF NOT EXISTS restaurant_offers (
  id           VARCHAR(255) PRIMARY KEY,
  tenant_id    VARCHAR(255) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title        VARCHAR(40) NOT NULL,
  details      VARCHAR(160),
  price_text   VARCHAR(30), -- e.g. "Flat 20% off", "₹299"
  schedule     JSONB DEFAULT '{}', -- {days: [0..6], timeStart: "12:00", timeEnd: "16:00", dateStart, dateEnd}
  item_ids     TEXT[] NOT NULL DEFAULT '{}',
  media_id     VARCHAR(255),
  is_active    BOOLEAN DEFAULT true,
  i18n         JSONB NOT NULL DEFAULT '{}',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_offers_tenant_active 
  ON restaurant_offers (tenant_id, is_active);

CREATE TABLE IF NOT EXISTS ordering_settings (
  tenant_id           VARCHAR(255) PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
  dine_in_enabled     BOOLEAN DEFAULT true,
  takeaway_enabled    BOOLEAN DEFAULT false,
  delivery_enabled    BOOLEAN DEFAULT false,
  accepting_orders    BOOLEAN DEFAULT true,
  auto_by_hours       BOOLEAN DEFAULT false,
  delivery_min_order  DECIMAL(10, 2) DEFAULT 0.00,
  delivery_fee        DECIMAL(10, 2) DEFAULT 0.00,
  delivery_area_note  VARCHAR(120),
  pay_notes           TEXT[] NOT NULL DEFAULT '{"Pay at counter"}',
  email_alerts_enabled BOOLEAN DEFAULT true,
  sound_alerts_enabled BOOLEAN DEFAULT true,
  version             INTEGER NOT NULL DEFAULT 1,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dining_tables (
  id          VARCHAR(255) PRIMARY KEY,
  tenant_id   VARCHAR(255) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  label       VARCHAR(50) NOT NULL,
  sort_order  INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_dining_tables_tenant_label UNIQUE(tenant_id, label)
);

CREATE INDEX IF NOT EXISTS idx_dining_tables_tenant ON dining_tables (tenant_id, sort_order);

-- Category additions for Hindi and Festival Menus
ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS i18n JSONB NOT NULL DEFAULT '{}';
ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS festival_start_date DATE;
ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS festival_end_date DATE;
