import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set in .env.local');
}

async function runMigration() {
  const sql = neon(databaseUrl!);
  
  console.log('🚀 Running users and families migration...');
  
  try {
    // Execute each statement separately using template literals
    
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        uid TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        name TEXT,
        family_id TEXT,
        family_name TEXT,
        role VARCHAR(20),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    
    // Create families table
    await sql`
      CREATE TABLE IF NOT EXISTS families (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        creator_id TEXT NOT NULL,
        join_code VARCHAR(10) NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    
    // Create family_members table
    await sql`
      CREATE TABLE IF NOT EXISTS family_members (
        id SERIAL PRIMARY KEY,
        family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'member',
        gender VARCHAR(20),
        birth_date TIMESTAMP,
        death_date TIMESTAMP,
        photo_url TEXT,
        parents JSONB NOT NULL DEFAULT '[]',
        spouses JSONB NOT NULL DEFAULT '[]',
        children JSONB NOT NULL DEFAULT '[]',
        added_by TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    
    // Create activity_log table
    await sql`
      CREATE TABLE IF NOT EXISTS activity_log (
        id SERIAL PRIMARY KEY,
        family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
        "user" TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT NOT NULL,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    
    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_users_family_id ON users(family_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON family_members(family_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_activity_log_family_id ON activity_log(family_id)`;
    
    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('Tables created:');
    console.log('  - users');
    console.log('  - families');
    console.log('  - family_members');
    console.log('  - activity_log');
    console.log('');
    console.log('🎉 You can now use the app!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
