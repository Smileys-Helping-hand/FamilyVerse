import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function migratePartyOS() {
  console.log('🚀 Starting Party OS migration...');
  
  try {
    const sql = neon(databaseUrl);
    
    // Create tables one by one
    console.log('📋 Creating party_users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS party_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        pin_code INTEGER NOT NULL UNIQUE,
        avatar_url TEXT,
        wallet_balance INTEGER NOT NULL DEFAULT 1000,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    
    console.log('📋 Creating party_games table...');
    await sql`
      CREATE TABLE IF NOT EXISTS party_games (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        type VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
        description TEXT,
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    
    console.log('📋 Creating sim_race_entries table...');
    await sql`
      CREATE TABLE IF NOT EXISTS sim_race_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        game_id UUID NOT NULL REFERENCES party_games(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES party_users(id) ON DELETE CASCADE,
        lap_time_ms INTEGER,
        car_model TEXT,
        track TEXT,
        is_dnf BOOLEAN NOT NULL DEFAULT FALSE,
        submitted_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    
    console.log('📋 Creating bets table...');
    await sql`
      CREATE TABLE IF NOT EXISTS bets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        game_id UUID NOT NULL REFERENCES party_games(id) ON DELETE CASCADE,
        bettor_id UUID NOT NULL REFERENCES party_users(id) ON DELETE CASCADE,
        target_user_id UUID NOT NULL REFERENCES party_users(id) ON DELETE CASCADE,
        amount INTEGER NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        payout INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        settled_at TIMESTAMP
      )
    `;
    
    console.log('📋 Creating party_imposter_rounds table...');
    await sql`
      CREATE TABLE IF NOT EXISTS party_imposter_rounds (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        game_id UUID NOT NULL REFERENCES party_games(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
        imposter_id UUID NOT NULL REFERENCES party_users(id),
        secret_word TEXT NOT NULL,
        imposter_hint TEXT NOT NULL,
        round INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    
    console.log('📋 Creating party_events table...');
    await sql`
      CREATE TABLE IF NOT EXISTS party_events (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        channel TEXT NOT NULL,
        data JSONB NOT NULL,
        triggered_by UUID,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    
    console.log('📋 Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_sim_race_entries_game ON sim_race_entries(game_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sim_race_entries_user ON sim_race_entries(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sim_race_entries_lap_time ON sim_race_entries(lap_time_ms)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bets_game ON bets(game_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bets_bettor ON bets(bettor_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bets_target ON bets(target_user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_party_events_type ON party_events(event_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_party_events_created ON party_events(created_at)`;
    
    console.log('✅ Party OS tables created successfully!');
    console.log('\n📊 Created tables:');
    console.log('  - party_users (Guest management with PIN)');
    console.log('  - party_games (Game sessions)');
    console.log('  - sim_race_entries (Leaderboard)');
    console.log('  - bets (Betting system)');
    console.log('  - party_imposter_rounds (Imposter game)');
    console.log('  - party_events (Real-time event log)');
    
    console.log('\n🎉 Ready for party mode!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migratePartyOS();
