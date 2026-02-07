import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function ensureSmartQrSchema() {
  try {
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS smart_qrs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        token VARCHAR(10) NOT NULL UNIQUE,
        type VARCHAR(10) NOT NULL DEFAULT 'CLUE',
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        points INTEGER NOT NULL DEFAULT 100,
        is_trap BOOLEAN NOT NULL DEFAULT FALSE,
        bonus_first_finder INTEGER NOT NULL DEFAULT 200,
        scan_count INTEGER NOT NULL DEFAULT 0,
        last_scanned_at TIMESTAMP,
        last_scanned_by TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        created_by TEXT
      )
    `);

    await db.execute(sql`
      ALTER TABLE smart_qrs
        ADD COLUMN IF NOT EXISTS token VARCHAR(10),
        ADD COLUMN IF NOT EXISTS type VARCHAR(10) DEFAULT 'CLUE',
        ADD COLUMN IF NOT EXISTS title TEXT,
        ADD COLUMN IF NOT EXISTS content TEXT,
        ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 100,
        ADD COLUMN IF NOT EXISTS is_trap BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS bonus_first_finder INTEGER DEFAULT 200,
        ADD COLUMN IF NOT EXISTS scan_count INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS last_scanned_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS last_scanned_by TEXT,
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS created_by TEXT
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS smart_qr_scans (
        id SERIAL PRIMARY KEY,
        qr_id UUID NOT NULL REFERENCES smart_qrs(id) ON DELETE CASCADE,
        scanner_name TEXT NOT NULL DEFAULT 'Guest',
        scanned_at TIMESTAMP NOT NULL DEFAULT NOW(),
        user_agent TEXT
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS qr_claims (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        qr_id UUID NOT NULL REFERENCES smart_qrs(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL DEFAULT 'Guest',
        points_awarded INTEGER NOT NULL,
        was_first_finder BOOLEAN NOT NULL DEFAULT FALSE,
        claimed_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_smart_qrs_token ON smart_qrs(token)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_smart_qrs_created_at ON smart_qrs(created_at)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_smart_qrs_active ON smart_qrs(is_active)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_smart_qr_scans_qr_id ON smart_qr_scans(qr_id)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_smart_qr_scans_scanned_at ON smart_qr_scans(scanned_at)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_qr_claims_qr_id ON qr_claims(qr_id)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_qr_claims_claimed_at ON qr_claims(claimed_at)
    `);
  } catch (error) {
    console.error('Error ensuring smart QR schema:', error);
  }
}
