import 'dotenv/config';
import { db } from '../src/lib/db';
import { partyGames } from '../src/lib/db/schema';

async function setupPartyGames() {
  console.log('🎮 Setting up Party Games...\n');

  try {
    // Create sim racing game
    const [racingGame] = await db.insert(partyGames).values({
      title: 'Sim Racing Championship',
      type: 'SIM_RACE',
      status: 'OPEN',
    }).returning();
    console.log('✅ Created Sim Racing game:', racingGame.id);

    // Create imposter game
    const [imposterGame] = await db.insert(partyGames).values({
      title: 'Imposter Among Us',
      type: 'IMPOSTER',
      status: 'OPEN',
    }).returning();
    console.log('✅ Created Imposter game:', imposterGame.id);

    console.log('\n🎉 Party games setup complete!');
    console.log('🏁 Players can now submit lap times and bet on racers');
    console.log('🎭 Admin can start imposter rounds from /admin/race-control');
  } catch (error) {
    console.error('❌ Error setting up games:', error);
    process.exit(1);
  }

  process.exit(0);
}

setupPartyGames();
