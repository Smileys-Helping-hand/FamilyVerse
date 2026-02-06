-- Add approval system fields to party_users table
-- Run this migration to add guest approval functionality

-- Add status column (pending, approved, rejected)
ALTER TABLE party_users 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending';

-- Add party_code column to track which party they joined
ALTER TABLE party_users 
ADD COLUMN IF NOT EXISTS party_code TEXT;

-- Create index for faster pending user queries
CREATE INDEX IF NOT EXISTS idx_party_users_status ON party_users(status);

-- Update existing users to 'approved' status
UPDATE party_users 
SET status = 'approved' 
WHERE status = 'pending';

-- Comments
COMMENT ON COLUMN party_users.status IS 'Guest approval status: pending, approved, rejected';
COMMENT ON COLUMN party_users.party_code IS 'The party code used to join (from QR code or manual entry)';
