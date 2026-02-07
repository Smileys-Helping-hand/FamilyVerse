import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

async function deleteRaziaProfile() {
  console.log('🗑️  Deleting razia profile...');
  
  try {
    const sql = neon(databaseUrl!);
    
    // Delete from users table (matches raziashade4 or similar)
    await sql`DELETE FROM users WHERE email LIKE '%razia%' OR name LIKE '%razia%'`;
    console.log('✅ Deleted from users table');
    
    // Delete from party_users table
    await sql`DELETE FROM party_users WHERE name LIKE '%razia%' OR name LIKE '%Parker%'`;
    console.log('✅ Deleted from party_users table');
    
    // Delete from family_members table
    await sql`DELETE FROM family_members WHERE name LIKE '%razia%'`;
    console.log('✅ Deleted from family_members table');
    
    console.log('\n🎉 Razia profile deleted! Ready for fresh signup.');
  } catch (error) {
    console.error('❌ Deletion failed:', error);
    process.exit(1);
  }
}

deleteRaziaProfile();
