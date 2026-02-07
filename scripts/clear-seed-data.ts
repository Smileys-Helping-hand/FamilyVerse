import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set in .env.local');
}

async function clearSeedData() {
  const sql = neon(databaseUrl!);
  
  console.log('🧹 Clearing seed data from database...');
  console.log('');
  
  try {
    // Clear blackout seed data (if tables exist)
    try {
      console.log('Checking for blackout seed data...');
      await sql`DELETE FROM imposter_hints WHERE event_id = 1`;
      await sql`DELETE FROM civilian_topics WHERE event_id = 1`;
      await sql`DELETE FROM game_config WHERE event_id = 1`;
      console.log('✅ Blackout seed data removed');
    } catch (error: any) {
      if (error.code === '42P01') {
        console.log('ℹ️  Blackout tables not created yet - skipping');
      } else {
        throw error;
      }
    }
    
    // Clear games seed data (if tables exist)
    try {
      console.log('Checking for example games...');
      await sql`DELETE FROM games WHERE name IN ('Sim Racing', 'Dominoes', 'VR Beat Saber', 'Chess')`;
      console.log('✅ Example games removed');
    } catch (error: any) {
      if (error.code === '42P01') {
        console.log('ℹ️  Games table not created yet - skipping');
      } else {
        throw error;
      }
    }
    
    // Clear any test groups (optional - only if you have test data)
    try {
      console.log('Checking for test groups...');
      const testGroups = await sql`SELECT id, name FROM groups WHERE name LIKE '%Test%' OR name LIKE '%Example%'`;
      if (testGroups.length > 0) {
        console.log(`Found ${testGroups.length} test groups, removing...`);
        for (const group of testGroups) {
          await sql`DELETE FROM groups WHERE id = ${group.id}`;
        }
        console.log('✅ Test groups removed');
      } else {
        console.log('✓ No test groups found');
      }
    } catch (error: any) {
      if (error.code === '42P01') {
        console.log('ℹ️  Groups table not created yet - skipping');
      } else {
        throw error;
      }
    }
    
    console.log('');
    console.log('✨ Database is now clean and ready for real data!');
    console.log('');
    console.log('You can now:');
    console.log('  - Create your family');
    console.log('  - Add family members');
    console.log('  - Create groups');
    console.log('  - Add games and content');
    
  } catch (error) {
    console.error('❌ Failed to clear seed data:', error);
    process.exit(1);
  }
}

clearSeedData();
