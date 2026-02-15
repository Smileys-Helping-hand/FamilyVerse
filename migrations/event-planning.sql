-- Event Planning & Coordination Module Migration
-- Run with: psql $DATABASE_URL -f migrations/event-planning.sql

-- Event Categories Table
CREATE TABLE IF NOT EXISTS event_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT 'Calendar',
  color TEXT NOT NULL DEFAULT 'blue',
  description TEXT,
  family_id TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_categories_family_id ON event_categories(family_id);
CREATE INDEX IF NOT EXISTS idx_event_categories_slug ON event_categories(slug);

-- Event Tags Table
CREATE TABLE IF NOT EXISTS event_tags (
  id SERIAL PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_tags_event_id ON event_tags(event_id);
CREATE INDEX IF NOT EXISTS idx_event_tags_tag ON event_tags(tag);

-- Event Templates Table
CREATE TABLE IF NOT EXISTS event_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category_id UUID REFERENCES event_categories(id),
  description TEXT,
  default_duration INTEGER, -- Hours
  default_tags JSONB DEFAULT '[]'::jsonb,
  checklist_items JSONB DEFAULT '[]'::jsonb,
  suggested_supplies JSONB DEFAULT '[]'::jsonb,
  waypoints JSONB DEFAULT '[]'::jsonb,
  family_id TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_by TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_templates_category_id ON event_templates(category_id);
CREATE INDEX IF NOT EXISTS idx_event_templates_family_id ON event_templates(family_id);
CREATE INDEX IF NOT EXISTS idx_event_templates_usage_count ON event_templates(usage_count DESC);

-- Event Checklists Table
CREATE TABLE IF NOT EXISTS event_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category VARCHAR(30) NOT NULL DEFAULT 'GENERAL',
  assigned_to_user_id TEXT,
  assigned_to_user_name TEXT,
  due_date TIMESTAMP,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP,
  completed_by TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_checklists_event_id ON event_checklists(event_id);
CREATE INDEX IF NOT EXISTS idx_event_checklists_assigned_to ON event_checklists(assigned_to_user_id);
CREATE INDEX IF NOT EXISTS idx_event_checklists_due_date ON event_checklists(due_date);

-- Event Invitations Table
CREATE TABLE IF NOT EXISTS event_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  invitee_email TEXT,
  invitee_phone TEXT,
  invitee_name TEXT NOT NULL,
  invited_by TEXT NOT NULL,
  invited_by_name TEXT NOT NULL,
  message TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  sent_at TIMESTAMP,
  viewed_at TIMESTAMP,
  responded_at TIMESTAMP,
  invite_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_invitations_event_id ON event_invitations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_invitations_invite_code ON event_invitations(invite_code);
CREATE INDEX IF NOT EXISTS idx_event_invitations_status ON event_invitations(status);

-- Event Reminders Table
CREATE TABLE IF NOT EXISTS event_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  reminder_type VARCHAR(30) NOT NULL,
  reminder_time TIMESTAMP NOT NULL,
  message TEXT NOT NULL,
  is_sent BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMP,
  delivery_method VARCHAR(20) NOT NULL DEFAULT 'APP',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_reminders_event_id ON event_reminders(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reminders_user_id ON event_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_event_reminders_reminder_time ON event_reminders(reminder_time);
CREATE INDEX IF NOT EXISTS idx_event_reminders_is_sent ON event_reminders(is_sent);

-- Recurring Events Table
CREATE TABLE IF NOT EXISTS recurring_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  recurrence_pattern VARCHAR(20) NOT NULL,
  recurrence_interval INTEGER NOT NULL DEFAULT 1,
  days_of_week JSONB,
  day_of_month INTEGER,
  months_of_year JSONB,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  max_occurrences INTEGER,
  generated_ids JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recurring_events_master_event_id ON recurring_events(master_event_id);
CREATE INDEX IF NOT EXISTS idx_recurring_events_start_date ON recurring_events(start_date);

-- Add new columns to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES event_categories(id);
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_events_category_id ON events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_is_recurring ON events(is_recurring);

-- Create comments for documentation
COMMENT ON TABLE event_categories IS 'Organize events by type (Outdoor, Sports, Celebrations, etc.)';
COMMENT ON TABLE event_tags IS 'Flexible tagging system for events';
COMMENT ON TABLE event_templates IS 'Pre-configured event setups with checklists and supplies';
COMMENT ON TABLE event_checklists IS 'Planning task lists for events';
COMMENT ON TABLE event_invitations IS 'Track event invitations and responses';
COMMENT ON TABLE event_reminders IS 'Scheduled notifications for events and tasks';
COMMENT ON TABLE recurring_events IS 'Configuration for repeating events';

COMMENT ON COLUMN events.category_id IS 'Link to event category';
COMMENT ON COLUMN events.is_recurring IS 'Part of a recurring event series';
