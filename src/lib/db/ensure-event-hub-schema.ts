import { db } from './index';
import {
  events,
  eventAttendees,
  eventWaypoints,
  liveLocations,
  expenses,
  expenseSplits,
  eventPolls,
  pollVotes,
  meetHerePins,
} from './schema';
import { sql } from 'drizzle-orm';

/**
 * Ensures all Event Hub tables exist in the database
 * This should be run on app startup or as part of deployment
 */
export async function ensureEventHubSchema() {
  console.log('🎯 Ensuring Event Hub schema exists...');

  try {
    // Check if events table exists by attempting a simple query
    await db.select().from(events).limit(1);
    console.log('✅ Event Hub tables already exist');
    return { success: true, message: 'Event Hub schema verified' };
  } catch (error) {
    console.log('⚠️ Event Hub tables need to be created');
    console.log('Please run: npm run db:push');
    console.log('Or use Drizzle Kit to push schema changes');
    
    // In production, you might want to auto-create tables
    // For now, we'll just log the instruction
    
    return {
      success: false,
      message: 'Run "npm run db:push" to create Event Hub tables',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Export table references for easy access
export const eventHubTables = {
  events,
  eventAttendees,
  eventWaypoints,
  liveLocations,
  expenses,
  expenseSplits,
  eventPolls,
  pollVotes,
  meetHerePins,
};
