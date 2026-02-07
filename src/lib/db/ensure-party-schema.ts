import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function ensurePartySchema() {
  try {
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS parties (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        host_id UUID,
        join_code TEXT NOT NULL UNIQUE,
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      ALTER TABLE parties
        ADD COLUMN IF NOT EXISTS host_id UUID,
        ADD COLUMN IF NOT EXISTS join_code TEXT,
        ADD COLUMN IF NOT EXISTS start_time TIMESTAMP,
        ADD COLUMN IF NOT EXISTS end_time TIMESTAMP,
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_parties_join_code ON parties(join_code)
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS party_games (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        type VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
        race_state VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        betting_closed BOOLEAN NOT NULL DEFAULT FALSE,
        registered_drivers JSONB NOT NULL DEFAULT '[]'::jsonb,
        description TEXT,
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      ALTER TABLE party_games
        ADD COLUMN IF NOT EXISTS title TEXT,
        ADD COLUMN IF NOT EXISTS type VARCHAR(20),
        ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'OPEN',
        ADD COLUMN IF NOT EXISTS race_state VARCHAR(20) DEFAULT 'PENDING',
        ADD COLUMN IF NOT EXISTS betting_closed BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS registered_drivers JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS start_time TIMESTAMP,
        ADD COLUMN IF NOT EXISTS end_time TIMESTAMP,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sim_race_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        game_id UUID NOT NULL,
        user_id UUID NOT NULL,
        is_ready BOOLEAN NOT NULL DEFAULT FALSE,
        lap_time_ms INTEGER,
        car_model TEXT,
        track TEXT,
        is_dnf BOOLEAN NOT NULL DEFAULT FALSE,
        submitted_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      ALTER TABLE sim_race_entries
        ADD COLUMN IF NOT EXISTS game_id UUID,
        ADD COLUMN IF NOT EXISTS user_id UUID,
        ADD COLUMN IF NOT EXISTS is_ready BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS lap_time_ms INTEGER,
        ADD COLUMN IF NOT EXISTS car_model TEXT,
        ADD COLUMN IF NOT EXISTS track TEXT,
        ADD COLUMN IF NOT EXISTS is_dnf BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP DEFAULT NOW()
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS bets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        game_id UUID NOT NULL,
        bettor_id UUID NOT NULL,
        target_user_id UUID NOT NULL,
        amount INTEGER NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        payout INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        settled_at TIMESTAMP
      )
    `);

    await db.execute(sql`
      ALTER TABLE bets
        ADD COLUMN IF NOT EXISTS game_id UUID,
        ADD COLUMN IF NOT EXISTS bettor_id UUID,
        ADD COLUMN IF NOT EXISTS target_user_id UUID,
        ADD COLUMN IF NOT EXISTS amount INTEGER,
        ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'PENDING',
        ADD COLUMN IF NOT EXISTS payout INTEGER,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS settled_at TIMESTAMP
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS party_imposter_rounds (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        game_id UUID NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
        imposter_id UUID NOT NULL,
        secret_word TEXT NOT NULL,
        imposter_hint TEXT NOT NULL,
        round INTEGER NOT NULL DEFAULT 1,
        start_time TIMESTAMP NOT NULL DEFAULT NOW(),
        end_time TIMESTAMP,
        duration_minutes INTEGER NOT NULL DEFAULT 45,
        warning_sent BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      ALTER TABLE party_imposter_rounds
        ADD COLUMN IF NOT EXISTS game_id UUID,
        ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE',
        ADD COLUMN IF NOT EXISTS imposter_id UUID,
        ADD COLUMN IF NOT EXISTS secret_word TEXT,
        ADD COLUMN IF NOT EXISTS imposter_hint TEXT,
        ADD COLUMN IF NOT EXISTS round INTEGER DEFAULT 1,
        ADD COLUMN IF NOT EXISTS start_time TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS end_time TIMESTAMP,
        ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 45,
        ADD COLUMN IF NOT EXISTS warning_sent BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS party_tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        description TEXT NOT NULL,
        points_reward INTEGER NOT NULL DEFAULT 50,
        verification_type VARCHAR(20) NOT NULL DEFAULT 'BUTTON',
        qr_code TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      ALTER TABLE party_tasks
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS points_reward INTEGER DEFAULT 50,
        ADD COLUMN IF NOT EXISTS verification_type VARCHAR(20) DEFAULT 'BUTTON',
        ADD COLUMN IF NOT EXISTS qr_code TEXT,
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS player_tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        task_id UUID NOT NULL,
        is_completed BOOLEAN NOT NULL DEFAULT FALSE,
        completed_at TIMESTAMP,
        proof_url TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      ALTER TABLE player_tasks
        ADD COLUMN IF NOT EXISTS user_id UUID,
        ADD COLUMN IF NOT EXISTS task_id UUID,
        ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS proof_url TEXT,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS player_status (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE,
        status VARCHAR(20) NOT NULL DEFAULT 'ALIVE',
        role VARCHAR(20) NOT NULL DEFAULT 'CREWMATE',
        killed_at TIMESTAMP,
        killed_by UUID,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      ALTER TABLE player_status
        ADD COLUMN IF NOT EXISTS user_id UUID,
        ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ALIVE',
        ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'CREWMATE',
        ADD COLUMN IF NOT EXISTS killed_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS killed_by UUID,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS trickshot_scores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        shot_type VARCHAR(20) NOT NULL,
        points INTEGER NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      ALTER TABLE trickshot_scores
        ADD COLUMN IF NOT EXISTS user_id UUID,
        ADD COLUMN IF NOT EXISTS shot_type VARCHAR(20),
        ADD COLUMN IF NOT EXISTS points INTEGER,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS kill_cooldowns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        imposter_id UUID NOT NULL UNIQUE,
        last_kill_at TIMESTAMP NOT NULL DEFAULT NOW(),
        cooldown_seconds INTEGER NOT NULL DEFAULT 30
      )
    `);

    await db.execute(sql`
      ALTER TABLE kill_cooldowns
        ADD COLUMN IF NOT EXISTS imposter_id UUID,
        ADD COLUMN IF NOT EXISTS last_kill_at TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS cooldown_seconds INTEGER DEFAULT 30
    `);
  } catch (error) {
    console.error('Error ensuring parties schema:', error);
  }
}
