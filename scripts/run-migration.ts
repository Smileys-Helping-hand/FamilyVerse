import { db } from '../src/lib/db';
import { sql } from 'drizzle-orm';

async function runMigration() {
  try {
    console.log('Running race registration migration...');
    
    // Add race_state column
    await db.execute(sql`
      ALTER TABLE party_games 
      ADD COLUMN IF NOT EXISTS race_state VARCHAR(20) NOT NULL DEFAULT 'REGISTRATION';
    `);
    
    // Add registered_drivers column
    await db.execute(sql`
      ALTER TABLE party_games 
      ADD COLUMN IF NOT EXISTS registered_drivers JSONB NOT NULL DEFAULT '[]';
    `);
    
    // Add is_ready column to sim_race_entries
    await db.execute(sql`
      ALTER TABLE sim_race_entries 
      ADD COLUMN IF NOT EXISTS is_ready BOOLEAN NOT NULL DEFAULT FALSE;
    `);
    
    // Create index
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_party_games_race_state ON party_games(race_state);
    `);
    
    console.log('✓ Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
