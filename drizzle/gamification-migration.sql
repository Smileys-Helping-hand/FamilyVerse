-- ============================================
-- Smart QR Gamification System Migration
-- Run this on your Neon/PostgreSQL database
-- ============================================

-- STEP 1: Add gamification columns to smart_qrs table
ALTER TABLE smart_qrs 
ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 100,
ADD COLUMN IF NOT EXISTS is_trap BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS bonus_first_finder INTEGER NOT NULL DEFAULT 200;

-- STEP 2: Create qr_claims table (prevents double-scanning)
CREATE TABLE IF NOT EXISTS qr_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_id UUID NOT NULL REFERENCES smart_qrs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL DEFAULT 'Guest',
  points_awarded INTEGER NOT NULL,
  was_first_finder BOOLEAN NOT NULL DEFAULT false,
  claimed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index for fast duplicate checking
CREATE UNIQUE INDEX IF NOT EXISTS idx_qr_claims_unique 
ON qr_claims(qr_id, user_id);

-- Index for recent claims query
CREATE INDEX IF NOT EXISTS idx_qr_claims_time 
ON qr_claims(claimed_at DESC);

-- STEP 3: Add profile customization columns to party_users
ALTER TABLE party_users
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_emoji VARCHAR(10) DEFAULT '😎',
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS favorite_color VARCHAR(20),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- ============================================
-- SAMPLE DATA: Create some fun QRs for testing
-- ============================================

-- The Golden Ticket (First Finder gets major bonus!)
INSERT INTO smart_qrs (token, type, title, content, points, is_trap, bonus_first_finder, created_by) VALUES
  ('GOLD26', 'CLUE', 'The Golden Ticket', 'YOU FOUND THE GOLDEN TICKET! Rush to Uncle Mo for your special prize! 🏆', 100, false, 300, 'admin')
ON CONFLICT (token) DO UPDATE SET 
  points = 100, 
  is_trap = false, 
  bonus_first_finder = 300;

-- A spicy trap!
INSERT INTO smart_qrs (token, type, title, content, points, is_trap, bonus_first_finder, created_by) VALUES
  ('FREEBE', 'TRAP', 'Free Beer', '💥 BOOM! There is no free beer! You fell for the oldest trick in the book! 😈', 50, true, 0, 'admin')
ON CONFLICT (token) DO UPDATE SET 
  points = 50, 
  is_trap = true, 
  bonus_first_finder = 0;

-- The Fridge Clue
INSERT INTO smart_qrs (token, type, title, content, points, is_trap, bonus_first_finder, created_by) VALUES
  ('FRIDGE', 'CLUE', 'Fridge Clue', 'Look behind the milk! The secret password is "BANANA". Tell Uncle Mo! 🍌', 75, false, 150, 'admin')
ON CONFLICT (token) DO UPDATE SET 
  points = 75, 
  is_trap = false, 
  bonus_first_finder = 150;

-- Bathroom Decoy
INSERT INTO smart_qrs (token, type, title, content, points, is_trap, bonus_first_finder, created_by) VALUES
  ('TOILET', 'TRAP', 'The Decoy', '🚽 Ha! You really thought there would be a clue in here? -50 points! The whole party heard that explosion sound! 😂', 50, true, 0, 'admin')
ON CONFLICT (token) DO UPDATE SET 
  points = 50, 
  is_trap = true, 
  bonus_first_finder = 0;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check smart_qrs has new columns
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'smart_qrs' 
AND column_name IN ('points', 'is_trap', 'bonus_first_finder');

-- Check qr_claims table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'qr_claims'
);

-- Check party_users has profile columns
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'party_users' 
AND column_name IN ('display_name', 'avatar_emoji', 'bio', 'favorite_color');

-- View sample QRs
SELECT token, type, title, points, is_trap, bonus_first_finder 
FROM smart_qrs 
ORDER BY created_at DESC 
LIMIT 10;
