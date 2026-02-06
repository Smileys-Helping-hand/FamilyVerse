-- Create Groups table
CREATE TABLE IF NOT EXISTS groups (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('trip', 'event', 'project', 'other')),
  join_code VARCHAR(10) NOT NULL UNIQUE,
  creator_id TEXT NOT NULL,
  member_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  location TEXT,
  cover_image TEXT
);

-- Create Checklist Items table
CREATE TABLE IF NOT EXISTS checklist_items (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category VARCHAR(20) NOT NULL CHECK (category IN ('packing', 'todo', 'shopping', 'other')),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_to TEXT,
  priority VARCHAR(10) NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMP,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  completed_by TEXT
);

-- Create Recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('activity', 'restaurant', 'accommodation', 'attraction', 'other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  url TEXT,
  image_url TEXT,
  rating INTEGER CHECK (rating >= 0 AND rating <= 5),
  price VARCHAR(5) CHECK (price IN ('$', '$$', '$$$', '$$$$')),
  notes TEXT,
  suggested_by TEXT NOT NULL,
  votes JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_groups_creator_id ON groups(creator_id);
CREATE INDEX IF NOT EXISTS idx_groups_join_code ON groups(join_code);
CREATE INDEX IF NOT EXISTS idx_groups_member_ids ON groups USING GIN (member_ids);
CREATE INDEX IF NOT EXISTS idx_checklist_items_group_id ON checklist_items(group_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_created_by ON checklist_items(created_by);
CREATE INDEX IF NOT EXISTS idx_recommendations_group_id ON recommendations(group_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_suggested_by ON recommendations(suggested_by);

-- Comments for documentation
COMMENT ON TABLE groups IS 'Groups for collaborative planning (trips, events, projects)';
COMMENT ON TABLE checklist_items IS 'Checklist items for group tasks and to-dos';
COMMENT ON TABLE recommendations IS 'Recommendations with voting for group activities and places';

COMMENT ON COLUMN groups.member_ids IS 'Array of user IDs who are members of this group';
COMMENT ON COLUMN groups.join_code IS 'Unique code for joining the group';
COMMENT ON COLUMN checklist_items.category IS 'Category: packing, todo, shopping, or other';
COMMENT ON COLUMN checklist_items.priority IS 'Priority level: low, medium, or high';
COMMENT ON COLUMN recommendations.votes IS 'Array of votes: [{userId: string, vote: "up"|"down"}]';
COMMENT ON COLUMN recommendations.price IS 'Price range: $, $$, $$$, or $$$$';
