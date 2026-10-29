-- 011_menu_theme.sql
-- Design Studio persistence: a published/draft theme pair on appearance_settings, plus a
-- version history for rollback. template_id is kept — it is still read by every pre-Phase-2
-- caller and is now treated as derived from theme_published->>'presetId'.

ALTER TABLE appearance_settings ADD COLUMN IF NOT EXISTS theme_published JSONB;
ALTER TABLE appearance_settings ADD COLUMN IF NOT EXISTS theme_draft JSONB;
ALTER TABLE appearance_settings ADD COLUMN IF NOT EXISTS theme_version INTEGER DEFAULT 0;
ALTER TABLE appearance_settings ADD COLUMN IF NOT EXISTS theme_updated_at TIMESTAMP;

-- One row per published version, so "undo" is a read, not a guess. Unbounded growth is
-- acceptable: a theme JSON document is a few hundred bytes and publishes are a rare,
-- deliberate action, not a per-keystroke event.
CREATE TABLE IF NOT EXISTS appearance_theme_history (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  version INTEGER NOT NULL,
  theme JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (tenant_id, version)
);

CREATE INDEX IF NOT EXISTS idx_appearance_theme_history_tenant
  ON appearance_theme_history (tenant_id, version DESC);
