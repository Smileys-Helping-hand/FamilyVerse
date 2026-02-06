-- ============================================
-- BLACKOUT GAME MASTER - DATABASE MIGRATION
-- Module 5: Game Master Dashboard & Task System
-- ============================================

-- Update game_sessions table for Blackout mode
ALTER TABLE game_sessions 
  ADD COLUMN IF NOT EXISTS game_mode VARCHAR(20) DEFAULT 'CLASSIC',
  ADD COLUMN IF NOT EXISTS night_phase_started_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS day_phase_ends_at TIMESTAMP;

-- Update status column comment
COMMENT ON COLUMN game_sessions.status IS 'LOBBY, DAY_PHASE, BLACKOUT_WARNING, NIGHT_PHASE, BODY_REPORTED, VOTING, ENDED';
COMMENT ON COLUMN game_sessions.game_mode IS 'CLASSIC or BLACKOUT';

-- ============================================
-- GAME CONFIGURATION TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS game_config (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL UNIQUE,
  blackout_interval_minutes INTEGER NOT NULL DEFAULT 30,
  killer_window_seconds INTEGER NOT NULL DEFAULT 30,
  is_game_paused BOOLEAN NOT NULL DEFAULT FALSE,
  power_level INTEGER NOT NULL DEFAULT 100,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_game_config_event_id ON game_config(event_id);

-- ============================================
-- IMPOSTER HINTS TABLE (Dynamic Content)
-- ============================================

CREATE TABLE IF NOT EXISTS imposter_hints (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  hint_text TEXT NOT NULL,
  category VARCHAR(20) NOT NULL DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_imposter_hints_event_id ON imposter_hints(event_id);
CREATE INDEX idx_imposter_hints_active ON imposter_hints(is_active);

COMMENT ON COLUMN imposter_hints.category IS 'general, action, behavior';

-- ============================================
-- CIVILIAN TOPICS TABLE (Dynamic Content)
-- ============================================

CREATE TABLE IF NOT EXISTS civilian_topics (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  topic_text TEXT NOT NULL,
  difficulty VARCHAR(20) NOT NULL DEFAULT 'medium',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_civilian_topics_event_id ON civilian_topics(event_id);
CREATE INDEX idx_civilian_topics_active ON civilian_topics(is_active);

COMMENT ON COLUMN civilian_topics.difficulty IS 'easy, medium, hard';

-- ============================================
-- TASKS TABLE (QR Code Task Stations)
-- ============================================

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  task_type VARCHAR(20) NOT NULL DEFAULT 'qr_scan',
  mini_game_type VARCHAR(20),
  qr_code_data TEXT NOT NULL,
  completion_bonus_seconds INTEGER NOT NULL DEFAULT 120,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_event_id ON tasks(event_id);
CREATE INDEX idx_tasks_qr_code_data ON tasks(qr_code_data);
CREATE INDEX idx_tasks_active ON tasks(is_active);

COMMENT ON COLUMN tasks.task_type IS 'qr_scan, mini_game';
COMMENT ON COLUMN tasks.mini_game_type IS 'wire_puzzle, code_entry, sequence';

-- ============================================
-- TASK COMPLETIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS task_completions (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  completed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  time_taken_seconds INTEGER
);

CREATE INDEX idx_task_completions_task_id ON task_completions(task_id);
CREATE INDEX idx_task_completions_session_id ON task_completions(session_id);
CREATE INDEX idx_task_completions_user_id ON task_completions(user_id);

-- Unique constraint: One completion per user per task per session
CREATE UNIQUE INDEX idx_task_completions_unique ON task_completions(task_id, session_id, user_id);

-- ============================================
-- KILL EVENTS TABLE (Blackout Mode)
-- ============================================

CREATE TABLE IF NOT EXISTS kill_events (
  id SERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  killer_id TEXT NOT NULL,
  victim_id TEXT NOT NULL,
  round INTEGER NOT NULL,
  kill_method VARCHAR(50) NOT NULL DEFAULT 'silent_tap',
  killed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_kill_events_session_id ON kill_events(session_id);
CREATE INDEX idx_kill_events_killer_id ON kill_events(killer_id);
CREATE INDEX idx_kill_events_victim_id ON kill_events(victim_id);

-- ============================================
-- SEED DATA (Default Configuration)
-- ============================================

-- Insert default game config for eventId 1
INSERT INTO game_config (event_id, blackout_interval_minutes, killer_window_seconds, is_game_paused, power_level)
VALUES (1, 30, 30, FALSE, 100)
ON CONFLICT (event_id) DO NOTHING;

-- Insert default imposter hints
INSERT INTO imposter_hints (event_id, hint_text, category) VALUES
  (1, 'Act confused when asked specific questions', 'behavior'),
  (1, 'Ask clarifying questions to stall', 'action'),
  (1, 'Mirror the emotions of others', 'behavior'),
  (1, 'Agree with the majority opinion', 'general'),
  (1, 'Pretend to recall a vague memory', 'action')
ON CONFLICT DO NOTHING;

-- Insert default civilian topics
INSERT INTO civilian_topics (event_id, topic_text, difficulty) VALUES
  (1, 'Favorite childhood memory', 'easy'),
  (1, 'Best vacation you''ve ever had', 'medium'),
  (1, 'Most embarrassing moment in school', 'medium'),
  (1, 'Your dream job if money wasn''t an issue', 'easy'),
  (1, 'The worst meal you''ve ever eaten', 'hard')
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if all tables exist
SELECT 
  table_name, 
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('game_config', 'imposter_hints', 'civilian_topics', 'tasks', 'task_completions', 'kill_events')
ORDER BY table_name;

-- Verify seed data
SELECT 
  'game_config' as table_name, COUNT(*) as row_count FROM game_config
UNION ALL
SELECT 'imposter_hints', COUNT(*) FROM imposter_hints
UNION ALL
SELECT 'civilian_topics', COUNT(*) FROM civilian_topics
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ BLACKOUT GAME MASTER - MIGRATION COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Tables Created:';
  RAISE NOTICE '  - game_config (configuration management)';
  RAISE NOTICE '  - imposter_hints (dynamic content)';
  RAISE NOTICE '  - civilian_topics (dynamic content)';
  RAISE NOTICE '  - tasks (QR code stations)';
  RAISE NOTICE '  - task_completions (progress tracking)';
  RAISE NOTICE '  - kill_events (blackout kills)';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next Steps:';
  RAISE NOTICE '  1. Access admin dashboard at /admin/dashboard';
  RAISE NOTICE '  2. Default PIN: 1234';
  RAISE NOTICE '  3. Create tasks and print QR codes';
  RAISE NOTICE '  4. Configure blackout timing';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 System Ready!';
  RAISE NOTICE '========================================';
END $$;
