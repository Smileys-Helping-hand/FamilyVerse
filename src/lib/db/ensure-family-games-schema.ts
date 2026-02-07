import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function ensureFamilyGamesSchema() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS family_game_participants (
        id SERIAL PRIMARY KEY,
        game_id TEXT NOT NULL,
        user_id TEXT,
        user_name TEXT NOT NULL,
        added_by TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE (game_id, user_id)
      )
    `);

    await db.execute(sql`
      ALTER TABLE family_game_participants
        ADD COLUMN IF NOT EXISTS game_id TEXT,
        ADD COLUMN IF NOT EXISTS user_id TEXT,
        ADD COLUMN IF NOT EXISTS user_name TEXT,
        ADD COLUMN IF NOT EXISTS added_by TEXT,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()
    `);
  } catch (error) {
    console.error('Error ensuring family games schema:', error);
  }
}
