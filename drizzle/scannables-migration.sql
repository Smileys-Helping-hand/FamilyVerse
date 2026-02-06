-- Migration: Unified Scannables System
-- Description: Replaces separate tasks table with flexible multi-purpose QR system
--              Supports tasks, treasure hunts, and live-editable killer evidence
-- Date: 2024

-- ============================================
-- MODULE 6: UNIFIED SCANNABLES SYSTEM
-- ============================================

-- Main scannables table (replaces tasks)
CREATE TABLE IF NOT EXISTS scannables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('TASK', 'TREASURE_NODE', 'KILLER_EVIDENCE')),
  label TEXT NOT NULL,
  content TEXT DEFAULT '',
  solution_code TEXT, -- Optional passcode for locked clues
  chain_id TEXT, -- Links treasure hunt steps together
  chain_order INTEGER, -- Step number in treasure hunt sequence
  is_active BOOLEAN DEFAULT true,
  qr_code_data TEXT NOT NULL, -- Base64 QR code image for printing
  reward_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Track scannable scans (with treasure hunt order validation)
CREATE TABLE IF NOT EXISTS scannable_scans (
  id SERIAL PRIMARY KEY,
  scannable_id UUID NOT NULL REFERENCES scannables(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  is_correct_order BOOLEAN DEFAULT true, -- False if treasure hunt step out of order
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Detective notebook for evidence collection
CREATE TABLE IF NOT EXISTS detective_notebook (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  evidence_id UUID NOT NULL REFERENCES scannables(id) ON DELETE CASCADE,
  notes TEXT DEFAULT '',
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scannables_event_id ON scannables(event_id);
CREATE INDEX IF NOT EXISTS idx_scannables_type ON scannables(type);
CREATE INDEX IF NOT EXISTS idx_scannables_chain ON scannables(chain_id, chain_order);
CREATE INDEX IF NOT EXISTS idx_scannable_scans_user ON scannable_scans(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_detective_notebook_user ON detective_notebook(user_id, session_id);

-- ============================================
-- EXAMPLE DATA (Optional - for testing)
-- ============================================

-- Example: Task scannable
-- INSERT INTO scannables (event_id, type, label, content, reward_points, qr_code_data)
-- VALUES ('event-1', 'TASK', 'Task #1: Kitchen Challenge', 'Find the secret ingredient in the pantry', 10, 'data:image/png;base64,...');

-- Example: Treasure hunt chain
-- INSERT INTO scannables (event_id, type, label, content, chain_id, chain_order, qr_code_data)
-- VALUES 
--   ('event-1', 'TREASURE_NODE', 'Clue #1', 'Look where the family gathers to eat', 'hunt-1', 1, 'data:image/png;base64,...'),
--   ('event-1', 'TREASURE_NODE', 'Clue #2', 'Check the place where stories come to life', 'hunt-1', 2, 'data:image/png;base64,...'),
--   ('event-1', 'TREASURE_NODE', 'Clue #3: Final', 'Congratulations! You found the treasure!', 'hunt-1', 3, 'data:image/png;base64,...');

-- Example: Evidence (blank for live editing)
-- INSERT INTO scannables (event_id, type, label, content, qr_code_data)
-- VALUES 
--   ('event-1', 'KILLER_EVIDENCE', 'Evidence #1', '', 'data:image/png;base64,...'),
--   ('event-1', 'KILLER_EVIDENCE', 'Evidence #2', '', 'data:image/png;base64,...'),
--   ('event-1', 'KILLER_EVIDENCE', 'Evidence #3', '', 'data:image/png;base64,...');
