import { db } from '../src/lib/db';
import { partyUsers, partyGames, simRaceEntries } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

async function seedPartyData() {
  console.log('🎮 Seeding Party OS with demo data...\n');

  try {
    // Get the existing racing game
    const racingGame = await db.query.partyGames.findFirst({
      where: eq(partyGames.type, 'SIM_RACE'),
    });

    if (!racingGame) {
      console.error('❌ No racing game found. Run setup-party-games.ts first.');
      process.exit(1);
    }

    console.log('✅ Found racing game:', racingGame.id);

    // Create demo racers
    const demoRacers = [
      { name: 'Speed Demon', pin: 1111 },
      { name: 'Drift King', pin: 2222 },
      { name: 'Track Master', pin: 3333 },
      { name: 'Nitro Boost', pin: 4444 },
    ];

    console.log('\n👥 Creating demo racers...');
    const createdRacers = [];

    for (const racer of demoRacers) {
      // Check if already exists
      const existing = await db.query.partyUsers.findFirst({
        where: eq(partyUsers.pinCode, racer.pin),
      });

      if (existing) {
        console.log(`   ⏭️  ${racer.name} already exists (PIN: ${racer.pin})`);
        createdRacers.push(existing);
      } else {
        const [newRacer] = await db.insert(partyUsers).values({
          name: racer.name,
          pinCode: racer.pin,
          walletBalance: 1000,
        }).returning();
        console.log(`   ✅ Created ${racer.name} (PIN: ${racer.pin})`);
        createdRacers.push(newRacer);
      }
    }

    // Add lap times for each racer
    console.log('\n⏱️  Adding lap times...');
    const lapTimes = [
      { userId: createdRacers[0].id, time: 82500, car: 'Porsche 911 GT3', track: 'Spa-Francorchamps' },
      { userId: createdRacers[1].id, time: 83200, car: 'BMW M4 GT3', track: 'Spa-Francorchamps' },
      { userId: createdRacers[2].id, time: 84100, car: 'Ferrari 488 GT3', track: 'Spa-Francorchamps' },
      { userId: createdRacers[3].id, time: 85750, car: 'McLaren 720S GT3', track: 'Spa-Francorchamps' },
    ];

    for (const lapData of lapTimes) {
      // Check if entry already exists
      const existing = await db.query.simRaceEntries.findFirst({
        where: eq(simRaceEntries.userId, lapData.userId),
      });

      if (existing) {
        console.log(`   ⏭️  Lap time for ${createdRacers.find(r => r.id === lapData.userId)?.name} already exists`);
      } else {
        await db.insert(simRaceEntries).values({
          gameId: racingGame.id,
          userId: lapData.userId,
          lapTimeMs: lapData.time,
          carModel: lapData.car,
          track: lapData.track,
          isDnf: false,
        });
        const minutes = Math.floor(lapData.time / 60000);
        const seconds = ((lapData.time % 60000) / 1000).toFixed(3);
        console.log(`   ✅ ${createdRacers.find(r => r.id === lapData.userId)?.name}: ${minutes}:${seconds.padStart(6, '0')}`);
      }
    }

    console.log('\n🎉 Party data seeded successfully!');
    console.log('\n📋 Demo Racer PINs:');
    demoRacers.forEach(r => console.log(`   ${r.name}: ${r.pin}`));
    console.log('\n🎮 You can now:');
    console.log('   1. Visit /party/dashboard to see the leaderboard');
    console.log('   2. Place bets on racers');
    console.log('   3. Submit more lap times from /admin/race-control');
    console.log('   4. Start imposter rounds');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }

  process.exit(0);
}

seedPartyData();
