-- ============================================================
-- Overwatch Telemetry: Upgrade live_locations & push_subscriptions
-- Run this once against your PostgreSQL database.
-- ============================================================

-- 1) Add new telemetry columns to live_locations
ALTER TABLE live_locations
  ADD COLUMN IF NOT EXISTS battery_level   INTEGER,          -- 0-100, null = unknown (iOS)
  ADD COLUMN IF NOT EXISTS is_charging     BOOLEAN,          -- null = unknown
  ADD COLUMN IF NOT EXISTS speed_kmh       INTEGER,          -- matches existing speed column for new clients
  ADD COLUMN IF NOT EXISTS last_ping_at    TIMESTAMP;        -- when the last telemetry push arrived

-- 2) Ensure push_subscriptions has user_agent (may already exist)
ALTER TABLE push_subscriptions
  ADD COLUMN IF NOT EXISTS user_agent TEXT;
