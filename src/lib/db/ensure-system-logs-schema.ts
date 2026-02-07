import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function ensureSystemLogsSchema() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS system_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
        level VARCHAR(10) NOT NULL,
        source VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        meta_data JSONB,
        user_id TEXT,
        ip_address VARCHAR(45)
      )
    `);

    await db.execute(sql`
      ALTER TABLE system_logs
        ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS level VARCHAR(10),
        ADD COLUMN IF NOT EXISTS source VARCHAR(50),
        ADD COLUMN IF NOT EXISTS message TEXT,
        ADD COLUMN IF NOT EXISTS meta_data JSONB,
        ADD COLUMN IF NOT EXISTS user_id TEXT,
        ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45)
    `);
  } catch (error) {
    console.error('Error ensuring system logs schema:', error);
  }
}