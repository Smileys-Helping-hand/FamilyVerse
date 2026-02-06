-- CRITICAL SECURITY FIX: Separate Party Join Codes from Admin PINs
-- Run this migration to fix the authentication vulnerability

-- Step 1: Create parties table
CREATE TABLE IF NOT EXISTS parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  host_id UUID,
  join_code TEXT NOT NULL UNIQUE,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Step 2: Alter party_users table
-- Drop old constraints and columns
ALTER TABLE party_users DROP CONSTRAINT IF EXISTS party_users_pin_code_key;
ALTER TABLE party_users DROP COLUMN IF EXISTS party_code;

-- Add new columns
ALTER TABLE party_users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'guest';
ALTER TABLE party_users ADD COLUMN IF NOT EXISTS party_id UUID REFERENCES parties(id) ON DELETE SET NULL;

-- Change pin_code from integer to text (for secret admin PINs)
ALTER TABLE party_users ALTER COLUMN pin_code TYPE TEXT;
ALTER TABLE party_users ALTER COLUMN pin_code DROP NOT NULL;
ALTER TABLE party_users ADD CONSTRAINT party_users_pin_code_unique UNIQUE (pin_code);

-- Change status default from 'pending' to 'approved' (guests are auto-approved)
ALTER TABLE party_users ALTER COLUMN status SET DEFAULT 'approved';

-- Step 3: Insert default party (Mohammed's Party)
INSERT INTO parties (name, join_code, is_active) 
VALUES ('Mohammed''s Party', '1696', TRUE)
ON CONFLICT (join_code) DO NOTHING;

-- Step 4: IMPORTANT MANUAL STEP FOR ADMIN
-- Update Mohammed's PIN to something secret (not 1696)
-- Run this command manually, replacing YOUR_SECRET_PIN:
-- UPDATE party_users SET pin_code = '2026', role = 'admin' WHERE name = 'Mohammed' OR name = 'Mohammed Parker';

-- Step 5: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_parties_join_code ON parties(join_code);
CREATE INDEX IF NOT EXISTS idx_party_users_pin_code ON party_users(pin_code) WHERE pin_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_party_users_party_id ON party_users(party_id);

-- Step 6: Add foreign key relationship
ALTER TABLE parties ADD COLUMN IF NOT EXISTS host_id UUID REFERENCES party_users(id) ON DELETE SET NULL;

COMMENT ON TABLE parties IS 'Each party event/session has its own record';
COMMENT ON COLUMN parties.join_code IS 'PUBLIC code that guests use to join (e.g., 1696)';
COMMENT ON COLUMN party_users.pin_code IS 'SECRET PIN for admin/host login only (DO NOT share with guests)';
COMMENT ON COLUMN party_users.role IS 'admin = full control, guest = limited access';
