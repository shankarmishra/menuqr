-- 025_ordering_mode_controls.sql
-- MENUQR: Granular controls for Dine-in, Takeaway, Delivery, Rush-Hour Pause and Timed Delivery Slots

ALTER TABLE ordering_settings
  ADD COLUMN IF NOT EXISTS dine_in_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS takeaway_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS delivery_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS delivery_paused_until TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS delivery_time_slots JSONB NOT NULL DEFAULT '[]'::jsonb;
