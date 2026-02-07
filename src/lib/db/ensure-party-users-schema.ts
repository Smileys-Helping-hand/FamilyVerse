import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function ensurePartyUsersSchema() {
  try {
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS party_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        display_name TEXT,
        pin_code TEXT,
        avatar_url TEXT,
        avatar_emoji VARCHAR(10) DEFAULT '😎',
        wallet_balance INTEGER NOT NULL DEFAULT 1000,
        role VARCHAR(20) NOT NULL DEFAULT 'guest',
        status VARCHAR(20) NOT NULL DEFAULT 'approved',
        party_id UUID,
        bio TEXT,
        favorite_color VARCHAR(20),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      ALTER TABLE party_users
        ADD COLUMN IF NOT EXISTS display_name TEXT,
        ADD COLUMN IF NOT EXISTS avatar_url TEXT,
        ADD COLUMN IF NOT EXISTS avatar_emoji VARCHAR(10) DEFAULT '😎',
        ADD COLUMN IF NOT EXISTS wallet_balance INTEGER DEFAULT 1000,
        ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'guest',
        ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'approved',
        ADD COLUMN IF NOT EXISTS party_id UUID,
        ADD COLUMN IF NOT EXISTS bio TEXT,
        ADD COLUMN IF NOT EXISTS favorite_color VARCHAR(20),
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
    `);

    await db.execute(sql`
      ALTER TABLE party_users
        ALTER COLUMN pin_code TYPE TEXT USING pin_code::text,
        ALTER COLUMN pin_code DROP NOT NULL
    `);

    await db.execute(sql`
      ALTER TABLE party_users DROP CONSTRAINT IF EXISTS party_users_pin_code_key
    `);

    const existingConstraint = await db.execute(sql`
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'party_users_pin_code_unique'
      LIMIT 1
    `);

    const hasConstraint = ((existingConstraint as { rows?: unknown[] }).rows || []).length > 0;
    if (!hasConstraint) {
      try {
        await db.execute(sql`
          ALTER TABLE party_users ADD CONSTRAINT party_users_pin_code_unique UNIQUE (pin_code)
        `);
      } catch (error) {
        // Avoid hard failure if legacy data violates uniqueness.
        console.error('Skipping pin_code unique constraint:', error);
      }
    }

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_party_users_pin_code ON party_users(pin_code) WHERE pin_code IS NOT NULL
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_party_users_party_id ON party_users(party_id)
    `);
  } catch (error) {
    console.error('Error ensuring party users schema:', error);
  }
}
