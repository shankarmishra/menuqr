-- 019_restaurant_profiles.sql
-- MENUQR Platform Blueprint Phase 1: Core Restaurant Profiles
-- Single source of truth for restaurant facts, separate from design choices and menu items.

CREATE TABLE IF NOT EXISTS restaurant_profiles (
  tenant_id           VARCHAR(255) PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
  display_name        VARCHAR(80) NOT NULL,
  tagline             VARCHAR(80),
  story               TEXT,
  established_year    SMALLINT CHECK (established_year BETWEEN 1900 AND 2100),
  restaurant_types    TEXT[] NOT NULL DEFAULT '{}',
  cuisine_tags        TEXT[] NOT NULL DEFAULT '{}',
  diet_declaration    VARCHAR(20) CHECK (diet_declaration IN ('PURE_VEG', 'VEG_AND_NON_VEG')),
  highlights          TEXT[] NOT NULL DEFAULT '{}',
  payments            TEXT[] NOT NULL DEFAULT '{}',
  price_note          VARCHAR(50),
  service_charge_note VARCHAR(80),
  fssai               CHAR(14),
  address             JSONB DEFAULT '{}',        -- {line, area, city, state, pincode, landmark}
  maps                JSONB DEFAULT '{}',        -- {url, lat, lng}
  hours               JSONB DEFAULT '{}',        -- {weekly, exceptions, lastOrderMinutes, note}
  contacts            JSONB NOT NULL DEFAULT '[]', -- [{id, label, kind, number, public, whatsapp, whatsappMessage, primary}]
  links               JSONB NOT NULL DEFAULT '[]', -- [{type, value, placements:{cover, about, print}, paused}]
  reservations        JSONB DEFAULT '{}',        -- {mode: 'none'|'call'|'whatsapp'|'link', url: string}
  i18n                JSONB NOT NULL DEFAULT '{}', -- {hi: {name, tagline, story}}
  review_flags        JSONB NOT NULL DEFAULT '{}', -- {phone_privacy_pending: bool, ...}
  version             INTEGER NOT NULL DEFAULT 1,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by          VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_restaurant_profiles_updated_at ON restaurant_profiles(updated_at);
