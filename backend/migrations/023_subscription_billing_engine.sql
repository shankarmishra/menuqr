-- 023_subscription_billing_engine.sql
-- System 1: Subscription, Renewal & Billing Engine
-- Schema for GST invoices, annual FY sequences, audit events, and order/subscription columns

-- 1. GST Invoices Table
CREATE TABLE IF NOT EXISTS gst_invoices (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number       VARCHAR(50) UNIQUE NOT NULL,
  order_id             VARCHAR(255) REFERENCES orders(id) ON DELETE SET NULL,
  tenant_id            VARCHAR(255) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  financial_year       VARCHAR(10) NOT NULL,
  sequence_no          INTEGER NOT NULL,
  sequence_number      INTEGER,

  -- Party details
  seller_name          VARCHAR(255) NOT NULL DEFAULT 'MenuSQR Technologies',
  seller_gstin         VARCHAR(50) NOT NULL DEFAULT 'PENDING_GSTIN',
  seller_address       TEXT NOT NULL DEFAULT 'India',
  buyer_name           VARCHAR(255) NOT NULL DEFAULT '',
  buyer_business_name  VARCHAR(255),
  buyer_address        TEXT,
  buyer_state          VARCHAR(100),
  buyer_gstin          VARCHAR(50),
  customer_name        VARCHAR(255),
  customer_gstin       VARCHAR(50),
  customer_state       VARCHAR(100),

  -- Plan details
  plan_id              VARCHAR(50),
  plan_name            VARCHAR(100),
  plan_label           VARCHAR(100),
  billing_period       VARCHAR(50) DEFAULT 'Annual',
  plan_valid_from      TIMESTAMPTZ,
  plan_valid_until     TIMESTAMPTZ,

  -- Amounts in integer paise (avoids floating point rounding errors)
  plan_amount_paise    INTEGER NOT NULL DEFAULT 0,
  discount_paise       INTEGER NOT NULL DEFAULT 0,
  subtotal_paise       INTEGER NOT NULL,
  cgst_rate            NUMERIC(5,2) DEFAULT 9.00,
  sgst_rate            NUMERIC(5,2) DEFAULT 9.00,
  igst_rate            NUMERIC(5,2) DEFAULT 0.00,
  cgst_paise           INTEGER NOT NULL DEFAULT 0,
  sgst_paise           INTEGER NOT NULL DEFAULT 0,
  igst_paise           INTEGER NOT NULL DEFAULT 0,
  total_paise          INTEGER NOT NULL,

  -- Metadata & Payment
  invoice_type         VARCHAR(50) NOT NULL DEFAULT 'SUBSCRIPTION',
  payment_gateway      VARCHAR(50),
  gateway_txn_id       VARCHAR(255),

  -- Lifecycle & PDF
  created_at           TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  pdf_generated_at     TIMESTAMPTZ,
  pdf_url              TEXT,

  CONSTRAINT uq_gst_invoices_fy_seq UNIQUE (financial_year, sequence_no)
);

-- 2. GST Invoice Sequences (Annual FY Counters)
CREATE SEQUENCE IF NOT EXISTS gst_invoice_seq_2026_27 START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS gst_invoice_seq_2027_28 START WITH 1 INCREMENT BY 1;

-- 3. Subscription Events Audit Table
CREATE TABLE IF NOT EXISTS subscription_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     VARCHAR(255) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  event_type    VARCHAR(50) NOT NULL,
  from_plan     VARCHAR(50),
  from_plan_id  VARCHAR(50),
  to_plan       VARCHAR(50),
  to_plan_id    VARCHAR(50),
  from_expiry   TIMESTAMPTZ,
  to_expiry     TIMESTAMPTZ,
  order_id      VARCHAR(255) REFERENCES orders(id) ON DELETE SET NULL,
  invoice_id    UUID REFERENCES gst_invoices(id) ON DELETE SET NULL,
  actor_user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  metadata      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Add Columns to orders Table
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS order_subtype VARCHAR(50) DEFAULT 'NEW_SUBSCRIPTION',
  ADD COLUMN IF NOT EXISTS proration_credit_paise INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS upgrade_from_plan VARCHAR(100),
  ADD COLUMN IF NOT EXISTS gst_invoice_id UUID REFERENCES gst_invoices(id) ON DELETE SET NULL;

-- 5. Add Columns to subscriptions Table
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS previous_plan_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS upgraded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS renewal_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_renewed_at TIMESTAMPTZ;

-- 6. Indexes for Performance & Query Optimization
CREATE INDEX IF NOT EXISTS idx_gst_invoices_tenant_created ON gst_invoices(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gst_invoices_order_id ON gst_invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_gst_invoices_fy_seq ON gst_invoices(financial_year, sequence_no);
CREATE INDEX IF NOT EXISTS idx_sub_events_tenant_created ON subscription_events(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sub_events_order_id ON subscription_events(order_id);
CREATE INDEX IF NOT EXISTS idx_sub_events_event_type ON subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_orders_gst_invoice_id ON orders(gst_invoice_id);
CREATE INDEX IF NOT EXISTS idx_orders_subtype ON orders(order_subtype);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status_expires ON subscriptions(status, expires_at);
