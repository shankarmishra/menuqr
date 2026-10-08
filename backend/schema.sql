-- schema.sql
-- MenuQR PostgreSQL Database Schema

CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR(255) PRIMARY KEY,
  public_id VARCHAR(255) UNIQUE NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  menu_slug VARCHAR(255) UNIQUE,
  category VARCHAR(255),
  tagline VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE clients ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS city VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS logo_url TEXT;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  tenant_id VARCHAR(255) REFERENCES clients(id) ON DELETE CASCADE,
  onboarding_state VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) REFERENCES clients(id) ON DELETE CASCADE UNIQUE NOT NULL,
  plan_id VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  started_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS content_period_start TIMESTAMP;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS content_period_id VARCHAR(255);

CREATE TABLE IF NOT EXISTS subscription_content_usage (
  tenant_id VARCHAR(255) REFERENCES subscriptions(tenant_id) ON DELETE CASCADE NOT NULL,
  period_start TIMESTAMP NOT NULL,
  changes_used INTEGER NOT NULL DEFAULT 0 CHECK (changes_used >= 0),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (tenant_id, period_start)
);

CREATE TABLE IF NOT EXISTS subscription_feature_usage (
  tenant_id VARCHAR(255) REFERENCES subscriptions(tenant_id) ON DELETE CASCADE NOT NULL,
  feature_key VARCHAR(100) NOT NULL,
  consumed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (tenant_id, feature_key)
);

CREATE TABLE IF NOT EXISTS menus (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'PUBLISHED',
  version INTEGER DEFAULT 1,
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_categories (
  id VARCHAR(255) PRIMARY KEY,
  menu_id VARCHAR(255) REFERENCES menus(id) ON DELETE CASCADE NOT NULL,
  tenant_id VARCHAR(255) REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_items (
  id VARCHAR(255) PRIMARY KEY,
  menu_id VARCHAR(255) REFERENCES menus(id) ON DELETE CASCADE NOT NULL,
  tenant_id VARCHAR(255) REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  category_id VARCHAR(255) REFERENCES menu_categories(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  half_price DECIMAL(10, 2),
  full_price DECIMAL(10, 2),
  image_url TEXT,
  diet_type VARCHAR(50) DEFAULT 'veg',
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS qr_codes (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  public_id VARCHAR(255) NOT NULL,
  qr_id VARCHAR(255) UNIQUE NOT NULL,
  destination_type VARCHAR(100) DEFAULT 'menu',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tenant_qr_identity (
  tenant_id VARCHAR(255) PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
  qr_code_id VARCHAR(255) UNIQUE NOT NULL REFERENCES qr_codes(id) ON DELETE RESTRICT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sticker_requests (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  qr_code_id VARCHAR(255) REFERENCES qr_codes(id) ON DELETE RESTRICT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 10000),
  contact_name VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_city VARCHAR(255) NOT NULL,
  delivery_state VARCHAR(255),
  delivery_postal_code VARCHAR(50),
  notes TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sticker_requests_tenant_created
  ON sticker_requests (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sticker_requests_status_created
  ON sticker_requests (status, created_at DESC);

CREATE TABLE IF NOT EXISTS sticker_request_events (
  id VARCHAR(255) PRIMARY KEY,
  request_id VARCHAR(255) REFERENCES sticker_requests(id) ON DELETE CASCADE NOT NULL,
  previous_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by VARCHAR(255),
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(255) REFERENCES clients(id) ON DELETE CASCADE,
  user_id VARCHAR(255),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id VARCHAR(255),
  metadata JSONB,
  ip VARCHAR(100),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) REFERENCES clients(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(255) REFERENCES clients(id) ON DELETE CASCADE,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appearance_settings (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) REFERENCES clients(id) ON DELETE CASCADE UNIQUE NOT NULL,
  template_id VARCHAR(100) DEFAULT 'royal-maharaja',
  logo TEXT,
  cover_image TEXT,
  restaurant_display_name VARCHAR(255),
  tagline VARCHAR(255),
  accent_configuration JSONB,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(255) PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  business_name VARCHAR(255) NOT NULL,
  city VARCHAR(255),
  address TEXT,
  cuisine VARCHAR(100),
  website VARCHAR(255),
  instagram VARCHAR(255),
  plan_id VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  status VARCHAR(50) DEFAULT 'PENDING_PAYMENT',
  provisioning_status VARCHAR(50) DEFAULT 'PENDING',
  activation_email_sent BOOLEAN NOT NULL DEFAULT FALSE,
  payment_receipt_email_sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS city VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cuisine VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS instagram VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS activation_email_sent BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_receipt_email_sent BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE users ADD COLUMN IF NOT EXISTS activation_token_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS activation_token_expires_at TIMESTAMP;

CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255) REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  gateway VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL,
  raw_response JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS metadata JSONB;












CREATE TABLE IF NOT EXISTS customer_orders (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  order_number SERIAL,
  customer_name VARCHAR(255),
  table_number VARCHAR(50),
  status VARCHAR(50) DEFAULT 'NEW',
  total DECIMAL(10, 2) NOT NULL,
  items JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_otp_challenges (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id VARCHAR(255) PRIMARY KEY,
  admin_id VARCHAR(255) REFERENCES admin_users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(100),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_auth_rate_limits (
  bucket_key VARCHAR(64) PRIMARY KEY,
  window_started_at TIMESTAMP NOT NULL,
  hits INTEGER NOT NULL DEFAULT 0 CHECK (hits >= 0),
  blocked_until TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_otp_challenges_email_created
  ON admin_otp_challenges (email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id
  ON admin_sessions (admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at
  ON admin_sessions (expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_auth_rate_limits_updated_at
  ON admin_auth_rate_limits (updated_at);

CREATE OR REPLACE FUNCTION revoke_admin_sessions_on_deactivation()
RETURNS trigger AS $$
BEGIN
  IF OLD.status = 'active' AND NEW.status <> 'active' THEN
    DELETE FROM admin_sessions WHERE admin_id = OLD.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_revoke_admin_sessions_on_deactivation ON admin_users;
CREATE TRIGGER trg_revoke_admin_sessions_on_deactivation
AFTER UPDATE OF status ON admin_users
FOR EACH ROW
EXECUTE FUNCTION revoke_admin_sessions_on_deactivation();

INSERT INTO admin_users (id, email) VALUES
  ('admin-1', 'xshankarmishra@gmail.com'),
  ('admin-2', 'qevnaro@gmail.com'),
  ('admin-3', 'menusqr.in@gmail.com')
ON CONFLICT DO NOTHING;

