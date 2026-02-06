-- Party Companion App Migration
-- Generated for Neon PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- MODULE 0: EXISTING GROUP FEATURES
-- ============================================

CREATE TABLE IF NOT EXISTS groups (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(20) NOT NULL,
  join_code VARCHAR(10) NOT NULL UNIQUE,
  creator_id TEXT NOT NULL,
  member_ids JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  location TEXT,
  cover_image TEXT
);

CREATE TABLE IF NOT EXISTS checklist_items (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category VARCHAR(20) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_to TEXT,
  priority VARCHAR(10) NOT NULL,
  due_date TIMESTAMP,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  completed_by TEXT
);

CREATE TABLE IF NOT EXISTS recommendations (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  url TEXT,
  image_url TEXT,
  rating INTEGER,
  price VARCHAR(5),
  notes TEXT,
  suggested_by TEXT NOT NULL,
  votes JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
-- MODULE 1: PARTY BRAIN (Context & Assets)
-- ============================================

CREATE TABLE IF NOT EXISTS user_assets (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type VARCHAR(20) NOT NULL,
  is_setup_required BOOLEAN NOT NULL DEFAULT FALSE,
  tags JSONB NOT NULL DEFAULT '[]',
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_assets_user_id ON user_assets(user_id);

CREATE TABLE IF NOT EXISTS preferences (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  dietary_restrictions JSONB NOT NULL DEFAULT '[]',
  favorites JSONB NOT NULL DEFAULT '[]',
  allergens JSONB NOT NULL DEFAULT '[]',
  additional_notes TEXT,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_plans (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  host_id TEXT NOT NULL,
  generated_schedule_json JSONB NOT NULL,
  assets_used_ids JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_plans_event_id ON event_plans(event_id);
CREATE INDEX IF NOT EXISTS idx_event_plans_host_id ON event_plans(host_id);

-- ============================================
-- MODULE 2: UNIVERSAL LEADERBOARD
-- ============================================

CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  scoring_type VARCHAR(20) NOT NULL,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_scores (
  id SERIAL PRIMARY KEY,
  game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  event_id INTEGER NOT NULL,
  score_value BIGINT NOT NULL,
  proof_image_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_scores_game_event ON game_scores(game_id, event_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_user ON game_scores(user_id);

-- ============================================
-- MODULE 3: IMPOSTER GAME ENGINE
-- ============================================

CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'LOBBY',
  secret_topic TEXT NOT NULL,
  imposter_hint TEXT NOT NULL,
  round INTEGER NOT NULL DEFAULT 1,
  voting_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  started_at TIMESTAMP,
  ended_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_game_sessions_event ON game_sessions(event_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(status);

CREATE TABLE IF NOT EXISTS game_players (
  id SERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  role VARCHAR(20) NOT NULL,
  is_alive BOOLEAN NOT NULL DEFAULT TRUE,
  votes_received INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_players_session ON game_players(session_id);
CREATE INDEX IF NOT EXISTS idx_game_players_user ON game_players(user_id);

CREATE TABLE IF NOT EXISTS game_votes (
  id SERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  voter_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  round INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_votes_session_round ON game_votes(session_id, round);

-- ============================================
-- MODULE 4: EXPENSE INTELLIGENCE
-- ============================================

CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  payer_id TEXT NOT NULL,
  total_amount INTEGER NOT NULL,
  merchant TEXT,
  receipt_url TEXT,
  description TEXT,
  ai_extracted_data JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_event ON expenses(event_id);
CREATE INDEX IF NOT EXISTS idx_expenses_payer ON expenses(payer_id);

CREATE TABLE IF NOT EXISTS expense_splits (
  id SERIAL PRIMARY KEY,
  expense_id INTEGER NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  amount_owed INTEGER NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  paid_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_expense_splits_expense ON expense_splits(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_user ON expense_splits(user_id);

-- ============================================
-- SEED DATA (Optional - Example Games)
-- ============================================

INSERT INTO games (name, scoring_type, icon, description) VALUES
  ('Sim Racing', 'TIME_ASC', '🏎️', 'Fastest lap time wins'),
  ('Dominoes', 'SCORE_DESC', '🎲', 'Highest score wins'),
  ('VR Beat Saber', 'SCORE_DESC', '🎮', 'Highest score wins'),
  ('Chess', 'SCORE_DESC', '♟️', 'Points based on game outcomes')
ON CONFLICT DO NOTHING;

-- ============================================
-- USEFUL VIEWS (Optional)
-- ============================================

-- View for quick leaderboard access
CREATE OR REPLACE VIEW leaderboard_best_scores AS
WITH best_scores AS (
  SELECT DISTINCT ON (gs.user_id, gs.game_id)
    gs.user_id,
    gs.game_id,
    gs.event_id,
    gs.score_value,
    gs.created_at,
    g.scoring_type,
    g.name as game_name
  FROM game_scores gs
  JOIN games g ON g.id = gs.game_id
  ORDER BY gs.user_id, gs.game_id, 
    CASE 
      WHEN g.scoring_type = 'TIME_ASC' THEN gs.score_value
      ELSE -gs.score_value
    END ASC
)
SELECT 
  user_id,
  game_id,
  game_name,
  event_id,
  score_value,
  created_at,
  RANK() OVER (
    PARTITION BY game_id, event_id 
    ORDER BY 
      CASE 
        WHEN scoring_type = 'TIME_ASC' THEN score_value
        ELSE -score_value
      END ASC
  ) as rank
FROM best_scores;

COMMENT ON VIEW leaderboard_best_scores IS 'Shows best score per user per game with rankings';
