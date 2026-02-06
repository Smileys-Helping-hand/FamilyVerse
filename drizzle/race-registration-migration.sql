-- Race Registration System Migration
-- Adds race state management and driver registration

-- Add race_state column to party_games
ALTER TABLE party_games 
ADD COLUMN IF NOT EXISTS race_state VARCHAR(20) NOT NULL DEFAULT 'REGISTRATION';

-- Add registered_drivers column to party_games
ALTER TABLE party_games 
ADD COLUMN IF NOT EXISTS registered_drivers JSONB NOT NULL DEFAULT '[]';

-- Add is_ready column to sim_race_entries
ALTER TABLE sim_race_entries 
ADD COLUMN IF NOT EXISTS is_ready BOOLEAN NOT NULL DEFAULT FALSE;

-- Create index on race_state for faster queries
CREATE INDEX IF NOT EXISTS idx_party_games_race_state ON party_games(race_state);
