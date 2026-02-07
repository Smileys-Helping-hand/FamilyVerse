import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function ensureGlobalSettingsSchema() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS global_settings (
        key VARCHAR(50) PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(20) NOT NULL DEFAULT 'general',
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_by TEXT,
        input_type VARCHAR(20) DEFAULT 'TEXT',
        label TEXT
      )
    `);

    await db.execute(sql`
      ALTER TABLE global_settings
        ADD COLUMN IF NOT EXISTS value TEXT,
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS category VARCHAR(20) DEFAULT 'general',
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS updated_by TEXT,
        ADD COLUMN IF NOT EXISTS input_type VARCHAR(20) DEFAULT 'TEXT',
        ADD COLUMN IF NOT EXISTS label TEXT
    `);
  } catch (error) {
    console.error('Error ensuring global settings schema:', error);
  }
}