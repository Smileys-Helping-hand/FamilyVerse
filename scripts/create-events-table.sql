-- Create event_categories first (events.category_id references it)
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

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  location_name TEXT,
  coordinates JSONB,
  status VARCHAR(20) NOT NULL DEFAULT 'UPCOMING',
  category_id UUID REFERENCES event_categories(id),
  hero_image_url TEXT,
  creator_id TEXT NOT NULL,
  family_id TEXT,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  venue_place_id TEXT,
  weather_snapshot JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create event_attendees table
CREATE TABLE IF NOT EXISTS event_attendees (
  id SERIAL PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  rsvp_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  added_at TIMESTAMP NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMP
);

-- Create event_waypoints table
CREATE TABLE IF NOT EXISTS event_waypoints (
  id SERIAL PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  time TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  coordinates JSONB,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create live_locations table
CREATE TABLE IF NOT EXISTS live_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  latitude TEXT NOT NULL,
  longitude TEXT NOT NULL,
  accuracy INTEGER,
  speed INTEGER,
  battery_level INTEGER,
  is_charging BOOLEAN,
  speed_kmh INTEGER,
  last_ping_at TIMESTAMP,
  is_ghost_mode BOOLEAN NOT NULL DEFAULT false,
  last_updated TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create event_polls table
CREATE TABLE IF NOT EXISTS event_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  creator_id TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  expires_at TIMESTAMP,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create poll_votes table
CREATE TABLE IF NOT EXISTS poll_votes (
  id SERIAL PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES event_polls(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  option_index INTEGER NOT NULL,
  voted_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create meet_here_pins table
CREATE TABLE IF NOT EXISTS meet_here_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  creator_id TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  latitude TEXT NOT NULL,
  longitude TEXT NOT NULL,
  message TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create event_tags table
CREATE TABLE IF NOT EXISTS event_tags (
  id SERIAL PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_creator_id ON events(creator_id);
CREATE INDEX IF NOT EXISTS idx_events_family_id ON events(family_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id ON event_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_live_locations_event_id ON live_locations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_polls_event_id ON event_polls(event_id);
CREATE INDEX IF NOT EXISTS idx_meet_here_pins_event_id ON meet_here_pins(event_id);

SELECT 'Events tables created successfully' AS status;
