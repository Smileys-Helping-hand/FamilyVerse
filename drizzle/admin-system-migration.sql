-- ============================================
-- MODULE 8: SYSTEM ADMINISTRATION
-- Migration for admin security and monitoring
-- ============================================

-- Create system_logs table for tracking all system events
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  level VARCHAR(10) NOT NULL CHECK (level IN ('INFO', 'WARN', 'ERROR')),
  source VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  meta_data JSONB,
  user_id TEXT,
  ip_address VARCHAR(45)
);

-- Create indexes for efficient log querying
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON system_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_source ON system_logs(source);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);

-- Create global_settings table for dynamic configuration
CREATE TABLE IF NOT EXISTS global_settings (
  key VARCHAR(50) PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(20) NOT NULL DEFAULT 'general' CHECK (category IN ('game', 'economy', 'system')),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by TEXT
);

-- Seed default settings (Game Configuration)
INSERT INTO global_settings (key, value, description, category) VALUES
  ('spy_game_timer', '4', 'Timer duration in minutes for Spy Game rounds', 'game'),
  ('spy_game_chaos_enabled', 'true', 'Enable Chaos Mode random events', 'game'),
  ('race_points_multiplier', '2.0', 'Multiplier for race winner points', 'game'),
  ('race_bet_min', '50', 'Minimum bet amount for races', 'game'),
  ('race_bet_max', '5000', 'Maximum bet amount for races', 'game')
ON CONFLICT (key) DO NOTHING;

-- Seed economic settings
INSERT INTO global_settings (key, value, description, category) VALUES
  ('welcome_bonus', '1000', 'Points awarded to new users', 'economy'),
  ('daily_task_points', '500', 'Points for completing daily tasks', 'economy'),
  ('referral_bonus', '2000', 'Points for successful referrals', 'economy')
ON CONFLICT (key) DO NOTHING;

-- Seed system settings
INSERT INTO global_settings (key, value, description, category) VALUES
  ('maintenance_mode', 'false', 'Enable maintenance mode (blocks all users except admin)', 'system'),
  ('max_party_size', '20', 'Maximum users per party session', 'system'),
  ('session_timeout_minutes', '120', 'Auto-logout after inactivity', 'system')
ON CONFLICT (key) DO NOTHING;

-- Log the migration
INSERT INTO system_logs (level, source, message, meta_data) VALUES
  ('INFO', 'Migration', 'Admin system tables created', '{"version": "1.0", "module": 8}'::jsonb);

-- Grant permissions (if using specific database roles)
-- GRANT SELECT, INSERT, UPDATE ON system_logs TO authenticated;
-- GRANT ALL ON global_settings TO admin_role;
