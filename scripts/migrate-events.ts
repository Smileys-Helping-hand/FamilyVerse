import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const migrationPath = join(process.cwd(), 'scripts', 'create-events-table.sql');
const migration = readFileSync(migrationPath, 'utf8');

async function main() {
  // Strip comment lines, split on semicolons, keep non-empty statements
  const statements = migration
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  let ok = 0;
  let fail = 0;

  for (const stmt of statements) {
    try {
      await sql.query(stmt);
      console.log('OK :', stmt.slice(0, 80).replace(/\n/g, ' '));
      ok++;
    } catch (e: any) {
      console.error('FAIL:', stmt.slice(0, 80).replace(/\n/g, ' '));
      console.error('     ', e.message);
      fail++;
    }
  }

  console.log(`\nDone: ${ok} succeeded, ${fail} failed`);
}

main().catch((e) => { console.error(e); process.exit(1); });
