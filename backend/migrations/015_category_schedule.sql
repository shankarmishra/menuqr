-- Migration 015: Optional serving window per menu category (breakfast, lunch, happy hour...).
-- NULL means always available. Shape: { "from": "07:00", "to": "11:00", "days": [0..6] } in India time.
ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS schedule JSONB;
