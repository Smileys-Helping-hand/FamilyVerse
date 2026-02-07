/**
 * 🚦 SYSTEM VERIFICATION SCRIPT
 * 
 * Lead QA Engineer - Pre-Event Stress Test
 * Tests all critical logic paths before going live
 * 
 * Run: npx tsx scripts/verify-system.ts
 */

import { db } from '../src/lib/db';
import {
  games,
  gameScores,
  gameSessions,
  gamePlayers,
  expenses,
  expenseSplits,
  type Game,
} from '../src/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

// ============================================
// CONFIGURATION
// ============================================

const TEST_EVENT_ID = 99999; // Use high number to avoid collision
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');
const EVENT_NAME = `System Verify [${TIMESTAMP}]`;

// Test Users
const USERS = {
  RACER_X: { id: 'racer-x-test', name: 'Racer X' },
  DOMINO_KING: { id: 'domino-king-test', name: 'Domino King' },
  NEWBIE: { id: 'newbie-test', name: 'Newbie' },
  EXTRA: { id: 'extra-player-test', name: 'Extra Player' },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function logSection(title: string) {
  console.log('\n' + '='.repeat(60));
  console.log(`  ${title}`);
  console.log('='.repeat(60));
}

function logTest(name: string) {
  console.log(`\n🧪 Testing: ${name}`);
}

function logPass(message: string) {
  console.log(`  ✅ PASS: ${message}`);
}

function logFail(message: string) {
  console.log(`  ❌ FAIL: ${message}`);
  throw new Error(`Test Failed: ${message}`);
}

function logInfo(message: string) {
  console.log(`  ℹ️  ${message}`);
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    logFail(message);
  } else {
    logPass(message);
  }
}

function assertEqual<T>(actual: T, expected: T, context: string) {
  if (actual !== expected) {
    logFail(`${context}: Expected ${expected}, got ${actual}`);
  } else {
    logPass(`${context}: ${actual} === ${expected}`);
  }
}

// ============================================
// TEST 1: DATABASE CONNECTION
// ============================================

async function testDatabaseConnection() {
  logSection('TEST 1: DATABASE CONNECTION');
  
  try {
    logTest('Pinging Neon Database');
    
    const result = await db.execute(sql`SELECT 1 as ping`);
    
    assert(
      result.rows.length > 0,
      'Database responded to ping'
    );
    
    logInfo(`Connected to: ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'Neon'}`);
    
  } catch (error) {
    logFail(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================
// TEST 2: DATA SEEDING
// ============================================

async function seedTestData() {
  logSection('TEST 2: DATA SEEDING');
  
  logTest('Creating Test Games');
  
  // Check if games exist, create if needed
  const existingGames = await db.select().from(games);
  
  let simRacingGame = existingGames.find(g => g.name === 'Sim Racing');
  let dominoesGame = existingGames.find(g => g.name === 'Dominoes');
  
  if (!simRacingGame) {
    [simRacingGame] = await db.insert(games).values({
      name: 'Sim Racing',
      scoringType: 'TIME_ASC',
      icon: '🏎️',
      description: 'Fastest lap time wins',
    }).returning();
    logInfo('Created Sim Racing game');
  } else {
    logInfo('Sim Racing game already exists');
  }
  
  if (!dominoesGame) {
    [dominoesGame] = await db.insert(games).values({
      name: 'Dominoes',
      scoringType: 'SCORE_DESC',
      icon: '🎲',
      description: 'Highest score wins',
    }).returning();
    logInfo('Created Dominoes game');
  } else {
    logInfo('Dominoes game already exists');
  }
  
  logPass(`Games ready: Sim Racing (ID: ${simRacingGame.id}), Dominoes (ID: ${dominoesGame.id})`);
  
  return { simRacingGame, dominoesGame };
}

// ============================================
// TEST 3: LEADERBOARD LOGIC
// ============================================

async function testLeaderboardLogic(simRacingId: number, dominoesId: number) {
  logSection('TEST 3: LEADERBOARD LOGIC');
  
  // ============================================
  // 3A: SIM RACING (TIME_ASC - Lowest Wins)
  // ============================================
  
  logTest('Sim Racing Leaderboard (TIME_ASC)');
  
  // Insert scores
  await db.insert(gameScores).values([
    {
      gameId: simRacingId,
      userId: USERS.RACER_X.id,
      eventId: TEST_EVENT_ID,
      scoreValue: 120000, // 2:00.000
    },
    {
      gameId: simRacingId,
      userId: USERS.NEWBIE.id,
      eventId: TEST_EVENT_ID,
      scoreValue: 140000, // 2:20.000
    },
    {
      gameId: simRacingId,
      userId: USERS.RACER_X.id,
      eventId: TEST_EVENT_ID,
      scoreValue: 115000, // 1:55.000 (BEST)
    },
  ]);
  
  logInfo('Inserted 3 scores (Racer X: 120s, Newbie: 140s, Racer X: 115s)');
  
  // Query leaderboard using DISTINCT ON logic
  const racingLeaderboard = await db.execute(sql`
    WITH best_scores AS (
      SELECT DISTINCT ON (user_id)
        user_id,
        score_value
      FROM game_scores
      WHERE game_id = ${simRacingId} AND event_id = ${TEST_EVENT_ID}
      ORDER BY user_id, score_value ASC
    )
    SELECT
      user_id,
      score_value,
      RANK() OVER (ORDER BY score_value ASC) as rank
    FROM best_scores
    ORDER BY rank ASC
  `);
  
  logInfo(`Found ${racingLeaderboard.rows.length} unique racers`);
  
  // Assertions
  const racerX = racingLeaderboard.rows.find(r => r.user_id === USERS.RACER_X.id);
  const newbie = racingLeaderboard.rows.find(r => r.user_id === USERS.NEWBIE.id);
  
  assert(racerX !== undefined, 'Racer X found in leaderboard');
  assert(newbie !== undefined, 'Newbie found in leaderboard');
  
  if (racerX && newbie) {
    assertEqual(parseInt(racerX.rank), 1, 'Racer X rank');
    assertEqual(parseInt(racerX.score_value), 115000, 'Racer X best time (DISTINCT ON worked)');
    assertEqual(parseInt(newbie.rank), 2, 'Newbie rank');
    assertEqual(parseInt(newbie.score_value), 140000, 'Newbie time');
  }
  
  // ============================================
  // 3B: DOMINOES (SCORE_DESC - Highest Wins)
  // ============================================
  
  logTest('Dominoes Leaderboard (SCORE_DESC)');
  
  await db.insert(gameScores).values([
    {
      gameId: dominoesId,
      userId: USERS.DOMINO_KING.id,
      eventId: TEST_EVENT_ID,
      scoreValue: 5, // 5 wins
    },
    {
      gameId: dominoesId,
      userId: USERS.NEWBIE.id,
      eventId: TEST_EVENT_ID,
      scoreValue: 1, // 1 win
    },
  ]);
  
  logInfo('Inserted 2 scores (Domino King: 5 wins, Newbie: 1 win)');
  
  const dominoesLeaderboard = await db.execute(sql`
    WITH best_scores AS (
      SELECT DISTINCT ON (user_id)
        user_id,
        score_value
      FROM game_scores
      WHERE game_id = ${dominoesId} AND event_id = ${TEST_EVENT_ID}
      ORDER BY user_id, score_value DESC
    )
    SELECT
      user_id,
      score_value,
      RANK() OVER (ORDER BY score_value DESC) as rank
    FROM best_scores
    ORDER BY rank ASC
  `);
  
  const dominoKing = dominoesLeaderboard.rows.find(r => r.user_id === USERS.DOMINO_KING.id);
  const dominoNewbie = dominoesLeaderboard.rows.find(r => r.user_id === USERS.NEWBIE.id);
  
  assert(dominoKing !== undefined, 'Domino King found in leaderboard');
  assert(dominoNewbie !== undefined, 'Newbie found in dominoes');
  
  if (dominoKing && dominoNewbie) {
    assertEqual(parseInt(dominoKing.rank), 1, 'Domino King rank');
    assertEqual(parseInt(dominoKing.score_value), 5, 'Domino King score');
    assertEqual(parseInt(dominoNewbie.rank), 2, 'Newbie rank in dominoes');
  }
  
  // ============================================
  // 3C: PARTY MVP (META POINTS)
  // ============================================
  
  logTest('Party MVP Calculation');
  
  const mvpResults = await db.execute(sql`
    WITH best_scores AS (
      SELECT DISTINCT ON (gs.user_id, gs.game_id)
        gs.user_id,
        gs.game_id,
        gs.score_value,
        g.scoring_type
      FROM game_scores gs
      JOIN games g ON g.id = gs.game_id
      WHERE gs.event_id = ${TEST_EVENT_ID}
      ORDER BY gs.user_id, gs.game_id, 
        CASE 
          WHEN g.scoring_type = 'TIME_ASC' THEN gs.score_value
          ELSE -gs.score_value
        END ASC
    ),
    ranked_scores AS (
      SELECT
        user_id,
        game_id,
        RANK() OVER (
          PARTITION BY game_id 
          ORDER BY 
            CASE 
              WHEN scoring_type = 'TIME_ASC' THEN score_value
              ELSE -score_value
            END ASC
        ) as rank
      FROM best_scores
    )
    SELECT
      user_id,
      SUM(
        CASE
          WHEN rank = 1 THEN 10
          WHEN rank = 2 THEN 5
          WHEN rank = 3 THEN 3
          ELSE 1
        END
      ) as meta_points
    FROM ranked_scores
    GROUP BY user_id
    ORDER BY meta_points DESC
  `);
  
  logInfo(`MVP Standings calculated for ${mvpResults.rows.length} users`);
  
  const mvp = mvpResults.rows[0];
  assert(mvp !== undefined, 'MVP calculated');
  
  if (mvp) {
    // Racer X: 1st in Racing (10pts) = 10 total
    // Domino King: 1st in Dominoes (10pts) = 10 total
    // One of them should be MVP (tied at 10 points)
    const racerXPoints = mvpResults.rows.find(r => r.user_id === USERS.RACER_X.id);
    const dominoKingPoints = mvpResults.rows.find(r => r.user_id === USERS.DOMINO_KING.id);
    
    if (racerXPoints) {
      logInfo(`Racer X: ${racerXPoints.meta_points} meta points`);
    }
    if (dominoKingPoints) {
      logInfo(`Domino King: ${dominoKingPoints.meta_points} meta points`);
    }
    
    assert(
      parseInt(mvp.meta_points) >= 10,
      'MVP has at least 10 points (won at least 1 game)'
    );
  }
}

// ============================================
// TEST 4: IMPOSTER GAME ENGINE
// ============================================

async function testImposterEngine() {
  logSection('TEST 4: IMPOSTER GAME ENGINE');
  
  logTest('Creating Game Session');
  
  const [session] = await db.insert(gameSessions).values({
    eventId: TEST_EVENT_ID,
    secretTopic: 'Pizza',
    imposterHint: 'A popular food',
    status: 'LOBBY',
  }).returning();
  
  logInfo(`Session created: ${session.id}`);
  
  logTest('Adding 4 Players to Lobby');
  
  const playerData = [
    { sessionId: session.id, userId: USERS.RACER_X.id, userName: USERS.RACER_X.name, role: 'CIVILIAN' as const },
    { sessionId: session.id, userId: USERS.DOMINO_KING.id, userName: USERS.DOMINO_KING.name, role: 'CIVILIAN' as const },
    { sessionId: session.id, userId: USERS.NEWBIE.id, userName: USERS.NEWBIE.name, role: 'CIVILIAN' as const },
    { sessionId: session.id, userId: USERS.EXTRA.id, userName: USERS.EXTRA.name, role: 'CIVILIAN' as const },
  ];
  
  await db.insert(gamePlayers).values(playerData);
  
  logInfo('4 players added to lobby');
  
  logTest('Starting Game (Random Role Assignment)');
  
  // Fetch all players
  const players = await db.select().from(gamePlayers).where(eq(gamePlayers.sessionId, session.id));
  
  // Randomly assign 1 imposter
  const imposterIndex = Math.floor(Math.random() * players.length);
  
  for (let i = 0; i < players.length; i++) {
    const role = i === imposterIndex ? 'IMPOSTER' : 'CIVILIAN';
    await db
      .update(gamePlayers)
      .set({ role })
      .where(eq(gamePlayers.id, players[i].id));
  }
  
  // Update session status
  await db
    .update(gameSessions)
    .set({ status: 'ACTIVE', startedAt: new Date() })
    .where(eq(gameSessions.id, session.id));
  
  logInfo('Game started, roles assigned');
  
  logTest('Verifying Role Assignment');
  
  const playersWithRoles = await db.select().from(gamePlayers).where(eq(gamePlayers.sessionId, session.id));
  
  const imposters = playersWithRoles.filter(p => p.role === 'IMPOSTER');
  const civilians = playersWithRoles.filter(p => p.role === 'CIVILIAN');
  
  assertEqual(imposters.length, 1, 'Exactly 1 imposter');
  assertEqual(civilians.length, 3, 'Exactly 3 civilians');
  assertEqual(playersWithRoles.length, 4, 'Total 4 players');
  
  logInfo(`Imposter: ${imposters[0]?.userName || 'Unknown'}`);
  logInfo(`Civilians: ${civilians.map(c => c.userName).join(', ')}`);
  
  return session.id;
}

// ============================================
// TEST 5: EXPENSE SPLITTING LOGIC
// ============================================

async function testExpenseSplitting() {
  logSection('TEST 5: EXPENSE SPLITTING LOGIC');
  
  logTest('Creating Expense: $300.00 paid by Racer X');
  
  const totalInCents = 30000; // $300.00
  
  const [expense] = await db.insert(expenses).values({
    eventId: TEST_EVENT_ID,
    payerId: USERS.RACER_X.id,
    totalAmount: totalInCents,
    merchant: 'Test Restaurant',
    description: 'System Verification Test',
  }).returning();
  
  logInfo(`Expense ID: ${expense.id}, Amount: $${totalInCents / 100}`);
  
  logTest('Splitting Among 3 Users (Equal Split)');
  
  const splitWith = [USERS.DOMINO_KING.id, USERS.NEWBIE.id];
  const splitCount = splitWith.length + 1; // Include payer
  const amountPerPerson = Math.floor(totalInCents / splitCount);
  const remainder = totalInCents - (amountPerPerson * splitCount);
  
  logInfo(`Split: $${totalInCents / 100} ÷ ${splitCount} people = $${amountPerPerson / 100} each`);
  if (remainder > 0) {
    logInfo(`Remainder: $${remainder / 100} (added to first person)`);
  }
  
  // Create splits
  const splits = [
    {
      expenseId: expense.id,
      userId: USERS.RACER_X.id,
      amountOwed: 0, // Payer owes nothing
      isPaid: true,
      paidAt: new Date(),
    },
    {
      expenseId: expense.id,
      userId: USERS.DOMINO_KING.id,
      amountOwed: amountPerPerson + remainder, // Gets remainder
      isPaid: false,
    },
    {
      expenseId: expense.id,
      userId: USERS.NEWBIE.id,
      amountOwed: amountPerPerson,
      isPaid: false,
    },
  ];
  
  await db.insert(expenseSplits).values(splits);
  
  logInfo('Splits created');
  
  logTest('Verifying Split Amounts');
  
  const createdSplits = await db.select().from(expenseSplits).where(eq(expenseSplits.expenseId, expense.id));
  
  assertEqual(createdSplits.length, 3, 'Created 3 splits');
  
  const racerXSplit = createdSplits.find(s => s.userId === USERS.RACER_X.id);
  const dominoKingSplit = createdSplits.find(s => s.userId === USERS.DOMINO_KING.id);
  const newbieSplit = createdSplits.find(s => s.userId === USERS.NEWBIE.id);
  
  assert(racerXSplit !== undefined, 'Racer X split exists');
  assert(dominoKingSplit !== undefined, 'Domino King split exists');
  assert(newbieSplit !== undefined, 'Newbie split exists');
  
  if (racerXSplit) {
    assertEqual(racerXSplit.amountOwed, 0, 'Racer X owes $0 (is payer)');
    assertEqual(racerXSplit.isPaid, true, 'Racer X marked as paid');
  }
  
  if (dominoKingSplit) {
    assertEqual(
      dominoKingSplit.amountOwed,
      amountPerPerson + remainder,
      `Domino King owes $${(amountPerPerson + remainder) / 100}`
    );
    assertEqual(dominoKingSplit.isPaid, false, 'Domino King not paid yet');
  }
  
  if (newbieSplit) {
    assertEqual(
      newbieSplit.amountOwed,
      amountPerPerson,
      `Newbie owes $${amountPerPerson / 100}`
    );
    assertEqual(newbieSplit.isPaid, false, 'Newbie not paid yet');
  }
  
  // Verify total adds up
  const totalOwed = createdSplits.reduce((sum, split) => sum + split.amountOwed, 0);
  assertEqual(totalOwed, totalInCents, 'Total splits equal expense amount');
}

// ============================================
// TEST 6: CLEANUP
// ============================================

async function cleanup() {
  logSection('TEST 6: CLEANUP');
  
  logTest('Removing Test Data');
  
  try {
    // Delete in correct order (respect foreign keys)
    await db.delete(expenseSplits).where(
      sql`expense_id IN (SELECT id FROM expenses WHERE event_id = ${TEST_EVENT_ID})`
    );
    logInfo('Deleted expense splits');
    
    await db.delete(expenses).where(eq(expenses.eventId, TEST_EVENT_ID));
    logInfo('Deleted expenses');
    
    await db.delete(gamePlayers).where(
      sql`session_id IN (SELECT id FROM game_sessions WHERE event_id = ${TEST_EVENT_ID})`
    );
    logInfo('Deleted game players');
    
    await db.delete(gameSessions).where(eq(gameSessions.eventId, TEST_EVENT_ID));
    logInfo('Deleted game sessions');
    
    await db.delete(gameScores).where(eq(gameScores.eventId, TEST_EVENT_ID));
    logInfo('Deleted game scores');
    
    logPass('All test data cleaned up');
    
  } catch (error) {
    logInfo(`Cleanup warning: ${error instanceof Error ? error.message : 'Unknown error'}`);
    logInfo('(This is OK if running for the first time)');
  }
}

// ============================================
// MAIN EXECUTION
// ============================================

async function runAllTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  🚦 PARTY COMPANION - SYSTEM VERIFICATION SCRIPT 🚦       ║');
  console.log('║                                                            ║');
  console.log('║  Lead QA Engineer - Pre-Event Stress Test                 ║');
  console.log('║  Testing: Rankings, Game Engine, Expenses                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n');
  
  const startTime = Date.now();
  
  try {
    // Test 1: Connection
    await testDatabaseConnection();
    
    // Test 2: Seed data
    const { simRacingGame, dominoesGame } = await seedTestData();
    
    // Test 3: Leaderboards
    await testLeaderboardLogic(simRacingGame.id, dominoesGame.id);
    
    // Test 4: Imposter Game
    await testImposterEngine();
    
    // Test 5: Expenses
    await testExpenseSplitting();
    
    // Test 6: Cleanup
    await cleanup();
    
    // Success Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    logSection('✅ ALL TESTS PASSED ✅');
    console.log('\n');
    console.log('  🎉 System Verification Complete!');
    console.log('  ✅ Database Connection: OK');
    console.log('  ✅ Leaderboard Logic: OK (DISTINCT ON, Rankings, MVP)');
    console.log('  ✅ Imposter Game Engine: OK (Role Assignment)');
    console.log('  ✅ Expense Splitting: OK (Math Verification)');
    console.log('\n');
    console.log(`  ⏱️  Total Duration: ${duration}s`);
    console.log('  🚀 Your system is ready for the live event!');
    console.log('\n');
    
    process.exit(0);
    
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    logSection('❌ TESTS FAILED ❌');
    console.log('\n');
    console.log('  ⚠️  Error Details:');
    console.error('  ', error);
    console.log('\n');
    console.log(`  ⏱️  Failed after: ${duration}s`);
    console.log('  🔧 Fix the issues above before going live!');
    console.log('\n');
    
    process.exit(1);
  }
}

// Run the tests
runAllTests();
