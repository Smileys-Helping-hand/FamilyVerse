import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';

export const apiKeys = pgTable('apiKeys', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 128 }).notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  status: varchar('status', { length: 16 }).notNull().default('active'),
  createdBy: varchar('createdBy', { length: 128 }).notNull(),
});
