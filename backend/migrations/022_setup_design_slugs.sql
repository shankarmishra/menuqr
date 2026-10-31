-- 022_setup_design_slugs.sql
-- MENUQR Platform Blueprint Phase 1: Setup wizard progress, design storage, slug history & analytics

CREATE TABLE IF NOT EXISTS setup_progress (
  tenant_id    VARCHAR(255) PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
  steps        JSONB NOT NULL DEFAULT '{"s0":false,"s1":false,"s2":false,"s3":false,"s4":false}',
  current_step VARCHAR(20) NOT NULL DEFAULT 'S0',
  completed_at TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS design_documents (
  tenant_id         VARCHAR(255) PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
  draft             JSONB DEFAULT '{}',
  published         JSONB DEFAULT '{}',
  language_id       VARCHAR(30) NOT NULL DEFAULT 'rangeen',
  language_version  VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  draft_version     INT NOT NULL DEFAULT 1,
  published_version INT NOT NULL DEFAULT 0,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS design_history (
  id              VARCHAR(255) PRIMARY KEY,
  tenant_id       VARCHAR(255) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  version         INT NOT NULL,
  language_id     VARCHAR(30) NOT NULL,
  theme_snapshot  JSONB NOT NULL,
  published_by    VARCHAR(255),
  published_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_design_history_tenant 
  ON design_history (tenant_id, version DESC);

CREATE TABLE IF NOT EXISTS menu_slug_history (
  id          VARCHAR(255) PRIMARY KEY,
  tenant_id   VARCHAR(255) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  slug        VARCHAR(255) NOT NULL,
  changed_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_menu_slug_history_slug UNIQUE (slug)
);

CREATE INDEX IF NOT EXISTS idx_menu_slug_history_tenant 
  ON menu_slug_history (tenant_id, changed_at DESC);

CREATE TABLE IF NOT EXISTS link_clicks_daily (
  tenant_id VARCHAR(255) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  day       DATE NOT NULL,
  kind      VARCHAR(20) NOT NULL, -- instagram | whatsapp | call | directions | website | share | zomato | swiggy | custom
  count     INT NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, day, kind)
);
