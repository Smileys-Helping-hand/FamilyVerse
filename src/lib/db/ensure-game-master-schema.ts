import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function ensureGameMasterSchema() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS game_config (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL UNIQUE,
        blackout_interval_minutes INTEGER NOT NULL DEFAULT 30,
        killer_window_seconds INTEGER NOT NULL DEFAULT 30,
        is_game_paused BOOLEAN NOT NULL DEFAULT FALSE,
        power_level INTEGER NOT NULL DEFAULT 100,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      ALTER TABLE game_config
        ADD COLUMN IF NOT EXISTS event_id INTEGER,
        ADD COLUMN IF NOT EXISTS blackout_interval_minutes INTEGER DEFAULT 30,
        ADD COLUMN IF NOT EXISTS killer_window_seconds INTEGER DEFAULT 30,
        ADD COLUMN IF NOT EXISTS is_game_paused BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS power_level INTEGER DEFAULT 100,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS imposter_hints (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL,
        hint_text TEXT NOT NULL,
        category VARCHAR(20) NOT NULL DEFAULT 'general',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      ALTER TABLE imposter_hints
        ADD COLUMN IF NOT EXISTS event_id INTEGER,
        ADD COLUMN IF NOT EXISTS hint_text TEXT,
        ADD COLUMN IF NOT EXISTS category VARCHAR(20) DEFAULT 'general',
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS civilian_topics (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL,
        topic_text TEXT NOT NULL,
        difficulty VARCHAR(20) NOT NULL DEFAULT 'medium',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      ALTER TABLE civilian_topics
        ADD COLUMN IF NOT EXISTS event_id INTEGER,
        ADD COLUMN IF NOT EXISTS topic_text TEXT,
        ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'medium',
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_game_config_event_id ON game_config(event_id)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_imposter_hints_event_id ON imposter_hints(event_id)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_civilian_topics_event_id ON civilian_topics(event_id)
    `);
  } catch (error) {
    console.error('Error ensuring game master schema:', error);
  }
}
