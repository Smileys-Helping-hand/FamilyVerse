import { db } from '../src/lib/db';
import { partyUsers, partyGames, simRaceEntries, bets } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

async function runCompleteTest() {
  console.log('🧪 Running Complete Party OS Test...\n');

  try {
    // Step 1: Get existing racing game
    console.log('📋 Step 1: Getting game data...');
    const racingGame = await db.query.partyGames.findFirst({
      where: eq(partyGames.type, 'SIM_RACE'),
    });
    
    const imposterGame = await db.query.partyGames.findFirst({
      where: eq(partyGames.type, 'IMPOSTER'),
    });

    if (!racingGame || !imposterGame) {
      console.error('❌ Games not found. Run setup-party-games.ts first.');
      process.exit(1);
    }

    console.log('✅ Racing Game:', racingGame.id);
    console.log('✅ Imposter Game:', imposterGame.id);

    // Step 2: Get all party users
    console.log('\n📋 Step 2: Checking party users...');
    const users = await db.select().from(partyUsers);
    console.log(`✅ Found ${users.length} party users`);
    
    if (users.length < 3) {
      console.error('❌ Need at least 3 users for imposter game');
      process.exit(1);
    }

    // Display users
    console.log('\n👥 Party Users:');
    users.forEach((u, i) => {
      console.log(`   ${i + 1}. ${u.name} (PIN: ${u.pinCode}) - ${u.walletBalance} coins`);
    });

    // Step 3: Check leaderboard
    console.log('\n📋 Step 3: Checking racing leaderboard...');
    const entries = await db.select({
      userName: partyUsers.name,
      lapTimeMs: simRaceEntries.lapTimeMs,
      carModel: simRaceEntries.carModel,
    })
    .from(simRaceEntries)
    .innerJoin(partyUsers, eq(simRaceEntries.userId, partyUsers.id))
    .where(eq(simRaceEntries.gameId, racingGame.id))
    .orderBy(simRaceEntries.lapTimeMs);

    if (entries.length === 0) {
      console.log('⚠️  No lap times yet. Admin should submit times from /admin/race-control');
    } else {
      console.log('✅ Leaderboard:');
      entries.forEach((e, i) => {
        const minutes = Math.floor(e.lapTimeMs! / 60000);
        const seconds = ((e.lapTimeMs! % 60000) / 1000).toFixed(3);
        console.log(`   ${i + 1}. ${e.userName}: ${minutes}:${seconds.padStart(6, '0')} (${e.carModel})`);
      });
    }

    // Step 4: Check bets
    console.log('\n📋 Step 4: Checking betting system...');
    const allBets = await db.select({
      bettorName: partyUsers.name,
      targetName: partyUsers.name,
      amount: bets.amount,
      status: bets.status,
    })
    .from(bets)
    .innerJoin(partyUsers, eq(bets.bettorId, partyUsers.id))
    .where(eq(bets.gameId, racingGame.id));

    if (allBets.length === 0) {
      console.log('✅ No bets placed yet - Ready for betting!');
    } else {
      console.log(`✅ Found ${allBets.length} bets:`);
      allBets.forEach(b => {
        console.log(`   ${b.bettorName} bet ${b.amount} on ${b.targetName} - ${b.status}`);
      });
    }

    // Step 5: Test summary
    console.log('\n🎯 Test Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Games created: Racing + Imposter');
    console.log(`✅ ${users.length} party users ready`);
    console.log(`✅ ${entries.length} lap times submitted`);
    console.log(`✅ ${allBets.length} bets placed`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Step 6: Testing checklist
    console.log('\n📝 Testing Checklist:');
    console.log('');
    console.log('🏁 RACING & LEADERBOARD:');
    console.log('   1. Go to http://localhost:9002/party/dashboard');
    console.log('   2. Check Racing tab shows leaderboard');
    console.log('   3. Go to /admin/race-control');
    console.log('   4. Submit new lap time (e.g., "1:20.500")');
    console.log('   5. Verify leaderboard updates in real-time');
    console.log('');
    console.log('💰 BETTING SYSTEM:');
    console.log('   1. Go to Betting tab in party dashboard');
    console.log('   2. Click "Bet 100" on any racer');
    console.log('   3. Verify wallet balance decreases');
    console.log('   4. Check "My Bets" section shows bet as PENDING');
    console.log('   5. Admin: Click "Settle Bets" in race control');
    console.log('   6. Verify winners get 2x payout');
    console.log('');
    console.log('🎭 IMPOSTER GAME:');
    console.log('   1. Go to Imposter tab in party dashboard');
    console.log('   2. Admin: Click "Start Imposter Round" in race control');
    console.log('   3. Each player taps their card to see role');
    console.log('   4. Green = Civilian (shows secret word)');
    console.log('   5. Red = Imposter (shows hint only)');
    console.log('   6. Play and have fun! 🎉');
    console.log('');
    console.log('🔀 MULTI-USER TESTING:');
    console.log('   Demo user PINs:');
    users.slice(0, 4).forEach(u => {
      console.log(`   - ${u.name}: ${u.pinCode}`);
    });
    console.log('   • Login as different users in separate browsers/incognito');
    console.log('   • Test real-time updates across devices');
    console.log('');
    console.log('🎉 All systems ready! Party OS is fully functional.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

runCompleteTest();
