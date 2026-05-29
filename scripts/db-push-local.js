const fs = require('fs');
const { execSync } = require('child_process');

async function run() {
  try {
    console.log('Loading .env.local...');
    const env = fs.readFileSync('.env.local', 'utf-8');
    const dbUrlLine = env.split('\n').map(line => line.trim()).find(line => line.startsWith('DATABASE_URL='));
    if (!dbUrlLine) {
      console.error('DATABASE_URL not found in .env.local');
      process.exit(1);
    }
    
    // Extract and clean URL
    const dbUrl = dbUrlLine.substring('DATABASE_URL='.length).trim().replace(/^['"]|['"]$/g, '');
    process.env.DATABASE_URL = dbUrl;
    
    console.log('Connecting to Neon DB to clean up table constraints...');
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(dbUrl);
    
    // Gracefully truncate populated tables individually to avoid unique constraint warning prompts
    console.log('Truncating tables individually...');
    const tablesToTruncate = [
      { name: 'families', query: () => sql`TRUNCATE TABLE families CASCADE;` },
      { name: 'player_status', query: () => sql`TRUNCATE TABLE player_status CASCADE;` },
      { name: 'party_users', query: () => sql`TRUNCATE TABLE party_users CASCADE;` },
      { name: 'users', query: () => sql`TRUNCATE TABLE users CASCADE;` },
      { name: 'parties', query: () => sql`TRUNCATE TABLE parties CASCADE;` },
      { name: 'games', query: () => sql`TRUNCATE TABLE games CASCADE;` },
      { name: 'event_categories', query: () => sql`TRUNCATE TABLE event_categories CASCADE;` },
      { name: 'smart_qrs', query: () => sql`TRUNCATE TABLE smart_qrs CASCADE;` },
      { name: 'event_templates', query: () => sql`TRUNCATE TABLE event_templates CASCADE;` },
      { name: 'apiKeys', query: () => sql`TRUNCATE TABLE "apiKeys" CASCADE;` },
      { name: 'preferences', query: () => sql`TRUNCATE TABLE preferences CASCADE;` },
      { name: 'game_config', query: () => sql`TRUNCATE TABLE game_config CASCADE;` },
      { name: 'event_invitations', query: () => sql`TRUNCATE TABLE event_invitations CASCADE;` }
    ];

    for (const table of tablesToTruncate) {
      try {
        await table.query();
        console.log(`✓ Truncated table: ${table.name}`);
      } catch (err) {
        console.log(`Info: Truncating table ${table.name} skipped (might not exist yet):`, err.message);
      }
    }
    
    console.log('Pushing schema to Neon Postgres...');
    execSync('npx drizzle-kit push --force', { stdio: 'inherit', env: process.env });
    console.log('✓ Schema pushed successfully!');
  } catch (error) {
    console.error('Failed to run schema push:', error);
    process.exit(1);
  }
}

run();
