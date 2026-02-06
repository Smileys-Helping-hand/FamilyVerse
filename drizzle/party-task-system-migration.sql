-- Party Task System Migration
-- Creates tables for Among Us style tasks, kill system, and player status

-- Party Tasks Table
CREATE TABLE IF NOT EXISTS party_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  points_reward INTEGER NOT NULL DEFAULT 50,
  verification_type VARCHAR(20) NOT NULL DEFAULT 'BUTTON',
  qr_code TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Player Tasks Table (Assignment & Completion)
CREATE TABLE IF NOT EXISTS player_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES party_users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES party_tasks(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP,
  proof_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Player Status Table (ALIVE/GHOST/SPECTATOR)
CREATE TABLE IF NOT EXISTS player_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES party_users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'ALIVE',
  role VARCHAR(20) NOT NULL DEFAULT 'CREWMATE',
  killed_at TIMESTAMP,
  killed_by UUID REFERENCES party_users(id),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Kill Cooldown Tracker
CREATE TABLE IF NOT EXISTS kill_cooldowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imposter_id UUID NOT NULL UNIQUE REFERENCES party_users(id) ON DELETE CASCADE,
  last_kill_at TIMESTAMP NOT NULL DEFAULT NOW(),
  cooldown_seconds INTEGER NOT NULL DEFAULT 30
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_player_tasks_user_id ON player_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_player_tasks_task_id ON player_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_player_tasks_completed ON player_tasks(is_completed);
CREATE INDEX IF NOT EXISTS idx_player_status_user_id ON player_status(user_id);
CREATE INDEX IF NOT EXISTS idx_player_status_status ON player_status(status);

-- Seed some default tasks
INSERT INTO party_tasks (description, points_reward, verification_type) VALUES
  ('Selfie with the Birthday Boy', 100, 'PHOTO'),
  ('Find the Ace of Spades (Hidden in the room)', 75, 'BUTTON'),
  ('Win a game of Rock-Paper-Scissors against a stranger', 50, 'BUTTON'),
  ('Scan the QR Code on the Fridge', 50, 'QR_SCAN'),
  ('Do 10 Push-ups in front of everyone', 50, 'BUTTON'),
  ('Make someone laugh with a joke', 50, 'BUTTON')
ON CONFLICT DO NOTHING;
