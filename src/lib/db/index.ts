import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

type DrizzleDb = ReturnType<typeof drizzle>;

let dbInstance: DrizzleDb | null = null;

function initDb(): DrizzleDb {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}

export function getDb(): DrizzleDb {
  if (!dbInstance) {
    dbInstance = initDb();
  }
  return dbInstance;
}

export const db = new Proxy(
  {},
  {
    get(_target, prop) {
      const instance = getDb() as any;
      return instance[prop as keyof DrizzleDb];
    },
  }
) as DrizzleDb;
