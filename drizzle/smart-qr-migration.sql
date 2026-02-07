-- Smart QR System Migration
-- Run this on your Neon/PostgreSQL database

-- Smart QRs table with tracking and dynamic content
CREATE TABLE IF NOT EXISTS smart_qrs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(10) NOT NULL UNIQUE,
  type VARCHAR(10) NOT NULL DEFAULT 'CLUE',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  scan_count INTEGER NOT NULL DEFAULT 0,
  last_scanned_at TIMESTAMP,
  last_scanned_by TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by TEXT
);

-- Smart QR scan history
CREATE TABLE IF NOT EXISTS smart_qr_scans (
  id SERIAL PRIMARY KEY,
  qr_id UUID NOT NULL REFERENCES smart_qrs(id) ON DELETE CASCADE,
  scanner_name TEXT NOT NULL DEFAULT 'Guest',
  scanned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  user_agent TEXT
);

-- Index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_smart_qrs_token ON smart_qrs(token);
CREATE INDEX IF NOT EXISTS idx_smart_qrs_active ON smart_qrs(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_smart_qr_scans_qr_id ON smart_qr_scans(qr_id);
CREATE INDEX IF NOT EXISTS idx_smart_qr_scans_time ON smart_qr_scans(scanned_at DESC);

-- Sample data for testing (Golden Ticket)
INSERT INTO smart_qrs (token, type, title, content, created_by) VALUES
  ('GOLD26', 'CLUE', 'The Golden Ticket', 'YOU FOUND IT! Come to the host immediately for a special prize. 🎉', 'admin'),
  ('FRIDGE', 'CLUE', 'Fridge Clue', 'You found me! The password is "Blue Banana". Tell Uncle Mo!', 'admin'),
  ('TASK01', 'TASK', 'Photo Challenge', 'Take a selfie with the birthday boy and show it to complete this task!', 'admin')
ON CONFLICT (token) DO NOTHING;
