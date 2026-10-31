-- 020_brand_and_media.sql
-- MENUQR Platform Blueprint Phase 1: Brand Kits and Media Asset Tracking
-- Tracks brand identity assets, logo analysis, and unified media management (gallery, dish photos).

CREATE TABLE IF NOT EXISTS brand_kits (
  tenant_id       VARCHAR(255) PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
  logo            JSONB DEFAULT '{}', -- {mediaId, includesName, aspect, isBadge, background, bbox, variants{}, luminance, warnings[]}
  palette         JSONB DEFAULT '{}', -- {primary, secondary, neutral, source}
  colour_mood     VARCHAR(30) DEFAULT 'default',
  cover_media_id  VARCHAR(255),
  share_image_key TEXT,
  version         INTEGER NOT NULL DEFAULT 1,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_media (
  id                  VARCHAR(255) PRIMARY KEY,
  tenant_id           VARCHAR(255) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  kind                VARCHAR(20) NOT NULL, -- logo_original | logo | cover | gallery | dish
  storage_key         TEXT NOT NULL,
  variants            JSONB DEFAULT '{}',   -- {thumb, webp640, webp1440, avif}
  width               INT,
  height              INT,
  bytes               INT NOT NULL DEFAULT 0,
  mime                VARCHAR(40),
  content_hash        CHAR(64),
  quality_grade       CHAR(1),              -- 'A', 'B', 'C'
  quality_flags       JSONB DEFAULT '[]',   -- ['blurry', 'low_res', 'poor_contrast']
  focal               JSONB DEFAULT '{"x": 0.5, "y": 0.5}',
  crops               JSONB DEFAULT '{}',
  caption             VARCHAR(80),
  alt_text            VARCHAR(160),
  tag                 VARCHAR(20),          -- interior | exterior | food | team | event
  linked_item_id      VARCHAR(255),
  sort_order          INT DEFAULT 0,
  rights_confirmed_at TIMESTAMP,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at          TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_menu_media_tenant ON menu_media (tenant_id, kind) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_menu_media_linked_item ON menu_media (tenant_id, linked_item_id) WHERE deleted_at IS NULL AND linked_item_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_menu_media_hash ON menu_media (content_hash);
