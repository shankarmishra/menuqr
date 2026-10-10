-- Migration 002: Coupon Engine, Onboarding Enhancements, Verification & Reference Codes

-- 1. Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  id VARCHAR(255) PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,
  plan_id VARCHAR(50) NOT NULL CHECK (plan_id IN ('INTERMEDIATE', 'PREMIUM')),
  discount_pct INTEGER NOT NULL CHECK (discount_pct IN (5, 10, 15)),
  status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'RESERVED', 'REDEEMED', 'EXPIRED', 'DISABLED')),
  created_by VARCHAR(255) DEFAULT 'SUPER_ADMIN',
  expires_at TIMESTAMP,
  reserved_order_id VARCHAR(255),
  reserved_at TIMESTAMP,
  redeemed_order_id VARCHAR(255),
  redeemed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_plan_status ON coupons(plan_id, status);

-- 2. Orders Table Additions
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS original_amount DECIMAL(10, 2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_pct INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS business_type VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS category_other TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS owner_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS state VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS outlet_count INTEGER DEFAULT 1;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;

-- 3. Clients Table Additions
ALTER TABLE clients ADD COLUMN IF NOT EXISTS business_type VARCHAR(100);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS category_other TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS state VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS outlet_count INTEGER DEFAULT 1;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS reference_code VARCHAR(20) UNIQUE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;

-- 4. Users Table Additions
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;

-- 5. Phone OTP Challenges Table
CREATE TABLE IF NOT EXISTS phone_otp_challenges (
  id VARCHAR(255) PRIMARY KEY,
  phone VARCHAR(50) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  used BOOLEAN DEFAULT false,
  ip_address VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_phone_otp_challenges_phone_created
  ON phone_otp_challenges (phone, created_at DESC);
