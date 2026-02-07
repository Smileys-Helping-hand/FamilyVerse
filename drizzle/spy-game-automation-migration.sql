-- ============================================
-- SPY GAME AUTO-MASTER MIGRATION
-- Add timer and automation fields to imposter rounds
-- ============================================

-- Add new columns to party_imposter_rounds table
ALTER TABLE party_imposter_rounds 
ADD COLUMN IF NOT EXISTS start_time TIMESTAMP NOT NULL DEFAULT NOW();

ALTER TABLE party_imposter_rounds 
ADD COLUMN IF NOT EXISTS end_time TIMESTAMP;

ALTER TABLE party_imposter_rounds 
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER NOT NULL DEFAULT 45;

ALTER TABLE party_imposter_rounds 
ADD COLUMN IF NOT EXISTS warning_sent BOOLEAN NOT NULL DEFAULT FALSE;

-- Update status enum to include 'WARNING'
-- Note: PostgreSQL doesn't support ALTER TYPE ADD VALUE IF NOT EXISTS in older versions

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_party_imposter_rounds_status 
ON party_imposter_rounds(status) WHERE status IN ('ACTIVE', 'WARNING');

CREATE INDEX IF NOT EXISTS idx_party_imposter_rounds_end_time 
ON party_imposter_rounds(end_time) WHERE end_time IS NOT NULL;

-- Update existing records to have proper timestamps (if any)
UPDATE party_imposter_rounds 
SET start_time = created_at, 
    end_time = created_at + INTERVAL '45 minutes',
    duration_minutes = 45
WHERE start_time IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN party_imposter_rounds.start_time IS 'Round start timestamp';
COMMENT ON COLUMN party_imposter_rounds.end_time IS 'Calculated end time (start_time + duration)';
COMMENT ON COLUMN party_imposter_rounds.duration_minutes IS 'Round duration in minutes (default 45)';
COMMENT ON COLUMN party_imposter_rounds.warning_sent IS '10-minute warning already triggered';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check the updated schema
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'party_imposter_rounds'
ORDER BY ordinal_position;

-- Check existing rounds
SELECT 
    id,
    status,
    secret_word,
    imposter_hint,
    start_time,
    end_time,
    duration_minutes,
    warning_sent,
    EXTRACT(EPOCH FROM (end_time - NOW())) / 60 as minutes_remaining
FROM party_imposter_rounds
WHERE status IN ('ACTIVE', 'WARNING')
ORDER BY created_at DESC;
