CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(255) REFERENCES clients(id) ON DELETE CASCADE,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_orders (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  table_number VARCHAR(50) NOT NULL,
  items JSONB NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'NEW',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS client_otp_challenges (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  used BOOLEAN DEFAULT false,
  ip_address VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS client_auth_rate_limits (
  bucket_key VARCHAR(64) PRIMARY KEY,
  window_started_at TIMESTAMP NOT NULL,
  hits INTEGER NOT NULL DEFAULT 0 CHECK (hits >= 0),
  blocked_until TIMESTAMP,
  last_request_at TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_outbox (
  id VARCHAR(255) PRIMARY KEY,
  notification_type VARCHAR(100) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  payload JSONB NOT NULL,
  idempotency_key VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'QUEUED',
  attempt_count INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  next_retry_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  provider VARCHAR(50) DEFAULT 'resend',
  provider_message_id VARCHAR(255),
  last_error TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_events (
  id VARCHAR(255) PRIMARY KEY,
  outbox_id VARCHAR(255) REFERENCES email_outbox(id) ON DELETE SET NULL,
  provider_message_id VARCHAR(255),
  event_type VARCHAR(100) NOT NULL,
  recipient VARCHAR(255),
  payload JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_client_otp_challenges_email_created
  ON client_otp_challenges (email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_auth_rate_limits_updated_at
  ON client_auth_rate_limits (updated_at);
CREATE INDEX IF NOT EXISTS idx_email_outbox_status_retry
  ON email_outbox (status, next_retry_at);
CREATE INDEX IF NOT EXISTS idx_email_outbox_provider_msg_id
  ON email_outbox (provider_message_id);
CREATE INDEX IF NOT EXISTS idx_email_events_provider_msg_id
  ON email_events (provider_message_id);

ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS pricing_type VARCHAR(50) DEFAULT 'single';
ALTER TABLE menus ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'PUBLISHED';
ALTER TABLE menus ADD COLUMN IF NOT EXISTS published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS menu_item_variants (
  id VARCHAR(255) PRIMARY KEY,
  menu_item_id VARCHAR(255) REFERENCES menu_items(id) ON DELETE CASCADE NOT NULL,
  tenant_id VARCHAR(255) REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  variant_group VARCHAR(255) DEFAULT 'Portion',
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_item_addon_groups (
  id VARCHAR(255) PRIMARY KEY,
  menu_item_id VARCHAR(255) REFERENCES menu_items(id) ON DELETE CASCADE,
  tenant_id VARCHAR(255) REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT false,
  min_select INTEGER DEFAULT 0,
  max_select INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_item_addon_options (
  id VARCHAR(255) PRIMARY KEY,
  addon_group_id VARCHAR(255) REFERENCES menu_item_addon_groups(id) ON DELETE CASCADE NOT NULL,
  tenant_id VARCHAR(255) REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_imports (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  filename VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'SUCCESS',
  categories_count INTEGER DEFAULT 0,
  items_count INTEGER DEFAULT 0,
  variants_count INTEGER DEFAULT 0,
  addons_count INTEGER DEFAULT 0,
  skipped_count INTEGER DEFAULT 0,
  error_summary TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_menu_item_variants_item ON menu_item_variants(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_variants_tenant ON menu_item_variants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_addon_groups_item ON menu_item_addon_groups(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_addon_groups_tenant ON menu_item_addon_groups(tenant_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_addon_options_group ON menu_item_addon_options(addon_group_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_addon_options_tenant ON menu_item_addon_options(tenant_id);
CREATE INDEX IF NOT EXISTS idx_menu_imports_tenant ON menu_imports(tenant_id, created_at DESC);

