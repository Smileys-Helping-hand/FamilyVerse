'use server';

import { db } from '@/lib/db';
import { 
  partyUsers, 
  partyGames, 
  simRaceEntries, 
  bets, 
  partyImposterRounds,
  partyTasks,
  playerTasks,
  playerStatus,
  killCooldowns
} from '@/lib/db/schema';
import { eq, and, sql, asc, desc, lt, count } from 'drizzle-orm';
import { triggerPartyEvent } from '@/lib/pusher/server';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// ============================================
// AUTHENTICATION & ONBOARDING
// ============================================

export async function joinPartyAction(name: string, partyCode?: string) {
  try {
    // Generate a unique 4-digit PIN
    const pinCode = Math.floor(1000 + Math.random() * 9000);
    
    // Create party user with pending status
    const [user] = await db.insert(partyUsers).values({
      name,
      pinCode,
      walletBalance: 1000,
      status: 'pending',
      partyCode: partyCode || null,
    }).returning();
    
    // Set cookie for auto-login
    const cookieStore = await cookies();
    cookieStore.set('party_user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    
    // Trigger Pusher event to notify host of pending approval
    await triggerPartyEvent('party-lobby', 'user-pending', {
      userId: user.id,
      name: user.name,
      partyCode: partyCode || 'none',
      timestamp: new Date().toISOString(),
    });
    
    return { success: true, user, pinCode, status: 'pending' };
  } catch (error) {
    console.error('Error joining party:', error);
    return { success: false, error: 'Failed to join party' };
  }
}

export async function loginWithPinAction(pinCode: number) {
  try {
    const [user] = await db.select().from(partyUsers).where(eq(partyUsers.pinCode, pinCode));
    
    if (!user) {
      return { success: false, error: 'Invalid PIN code' };
    }
    
    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('party_user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });
    
    return { success: true, user };
  } catch (error) {
    console.error('Error logging in:', error);
    return { success: false, error: 'Failed to log in' };
  }
}

export async function getCurrentPartyUserAction() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('party_user_id')?.value;
    
    if (!userId) {
      return null;
    }
    
    const [user] = await db.select().from(partyUsers).where(eq(partyUsers.id, userId));
    return user || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// ============================================
// SIM RACING LEADERBOARD
// ============================================

export async function submitLapTimeAction(timeString: string, carModel?: string, track?: string) {
  try {
    const user = await getCurrentPartyUserAction();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }
    
    // Parse "1:24.500" into milliseconds
    const parts = timeString.split(':');
    let totalMs = 0;
    
    if (parts.length === 2) {
      const minutes = parseInt(parts[0]);
      const seconds = parseFloat(parts[1]);
      totalMs = (minutes * 60 * 1000) + (seconds * 1000);
    } else {
      const seconds = parseFloat(timeString);
      totalMs = seconds * 1000;
    }
    
    // Get or create active sim race game
    let [game] = await db.select().from(partyGames).where(
      and(
        eq(partyGames.type, 'SIM_RACE'),
        eq(partyGames.status, 'OPEN')
      )
    );
    
    if (!game) {
      // Create new game
      [game] = await db.insert(partyGames).values({
        title: 'Sim Racing Championship',
        type: 'SIM_RACE',
        status: 'OPEN',
        description: track || 'Live racing event',
      }).returning();
    }
    
    // Check if user already has an entry
    const existing = await db.select().from(simRaceEntries).where(
      and(
        eq(simRaceEntries.gameId, game.id),
        eq(simRaceEntries.userId, user.id)
      )
    );
    
    if (existing.length > 0) {
      // Update if faster
      const currentBest = existing[0].lapTimeMs;
      if (currentBest === null || totalMs < currentBest) {
        await db.update(simRaceEntries)
          .set({ lapTimeMs: totalMs, carModel, track })
          .where(eq(simRaceEntries.id, existing[0].id));
      }
    } else {
      // Insert new entry
      await db.insert(simRaceEntries).values({
        gameId: game.id,
        userId: user.id,
        lapTimeMs: totalMs,
        carModel,
        track,
        isDnf: false,
      });
    }
    
    // Trigger Pusher event
    await triggerPartyEvent('sim-racing', 'leaderboard-update', {
      userId: user.id,
      userName: user.name,
      lapTimeMs: totalMs,
      timestamp: new Date().toISOString(),
    }, user.id);
    
    return { success: true, lapTimeMs: totalMs };
  } catch (error) {
    console.error('Error submitting lap time:', error);
    return { success: false, error: 'Failed to submit lap time' };
  }
}

export async function getSimRacingLeaderboardAction(gameId?: string) {
  try {
    let game;
    
    if (gameId) {
      [game] = await db.select().from(partyGames).where(eq(partyGames.id, gameId));
    } else {
      // Get active game
      [game] = await db.select().from(partyGames).where(
        and(
          eq(partyGames.type, 'SIM_RACE'),
          eq(partyGames.status, 'OPEN')
        )
      );
    }
    
    if (!game) {
      return { success: false, error: 'No active game' };
    }
    
    // Get leaderboard with user info
    const entries = await db.select({
      id: simRaceEntries.id,
      userId: simRaceEntries.userId,
      userName: partyUsers.name,
      avatarUrl: partyUsers.avatarUrl,
      lapTimeMs: simRaceEntries.lapTimeMs,
      carModel: simRaceEntries.carModel,
      track: simRaceEntries.track,
      isDnf: simRaceEntries.isDnf,
      submittedAt: simRaceEntries.submittedAt,
    })
    .from(simRaceEntries)
    .innerJoin(partyUsers, eq(simRaceEntries.userId, partyUsers.id))
    .where(eq(simRaceEntries.gameId, game.id))
    .orderBy(asc(simRaceEntries.lapTimeMs));
    
    return { success: true, game, leaderboard: entries };
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return { success: false, error: 'Failed to get leaderboard' };
  }
}

// ============================================
// RACE REGISTRATION & STATE MANAGEMENT
// ============================================

export async function registerAsDriverAction(gameId: string) {
  try {
    const user = await getCurrentPartyUserAction();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if game exists and is in REGISTRATION state
    const [game] = await db.select().from(partyGames).where(eq(partyGames.id, gameId));
    
    if (!game) {
      return { success: false, error: 'Game not found' };
    }

    // Create or update entry
    const existing = await db.select().from(simRaceEntries).where(
      and(
        eq(simRaceEntries.gameId, gameId),
        eq(simRaceEntries.userId, user.id)
      )
    );

    if (existing.length > 0) {
      await db.update(simRaceEntries)
        .set({ isReady: false })
        .where(eq(simRaceEntries.id, existing[0].id));
    } else {
      await db.insert(simRaceEntries).values({
        gameId,
        userId: user.id,
        isReady: false,
      });
    }

    // Trigger update
    await triggerPartyEvent('sim-racing', 'driver-registered', {
      userId: user.id,
      userName: user.name,
      gameId,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error registering as driver:', error);
    return { success: false, error: 'Failed to register' };
  }
}

export async function markDriverReadyAction(gameId: string) {
  try {
    const user = await getCurrentPartyUserAction();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Update ready status
    await db.update(simRaceEntries)
      .set({ isReady: true })
      .where(and(
        eq(simRaceEntries.gameId, gameId),
        eq(simRaceEntries.userId, user.id)
      ));

    // Check if all drivers are ready
    const allEntries = await db.select().from(simRaceEntries).where(eq(simRaceEntries.gameId, gameId));
    const allReady = allEntries.length >= 3 && allEntries.every(e => e.isReady);

    // Trigger update
    await triggerPartyEvent('sim-racing', 'driver-ready', {
      userId: user.id,
      userName: user.name,
      allReady,
      timestamp: new Date().toISOString(),
    });

    return { success: true, allReady };
  } catch (error) {
    console.error('Error marking ready:', error);
    return { success: false, error: 'Failed to mark ready' };
  }
}

export async function openBettingAction(gameId: string) {
  try {
    // Check if enough drivers are ready
    const entries = await db.select().from(simRaceEntries).where(eq(simRaceEntries.gameId, gameId));
    
    if (entries.length < 3) {
      return { success: false, error: 'Need at least 3 drivers' };
    }

    const allReady = entries.every(e => e.isReady);
    if (!allReady) {
      return { success: false, error: 'All drivers must be ready' };
    }

    // Update game state
    await db.update(partyGames)
      .set({ 
        raceState: 'BETTING_OPEN',
        registeredDrivers: entries.map(e => e.userId),
      })
      .where(eq(partyGames.id, gameId));

    // Trigger betting open event
    await triggerPartyEvent('sim-racing', 'betting-open', {
      gameId,
      drivers: entries,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error opening betting:', error);
    return { success: false, error: 'Failed to open betting' };
  }
}

export async function startRaceAction(gameId: string) {
  try {
    // Update game state to close betting
    await db.update(partyGames)
      .set({ 
        raceState: 'RACE_STARTED',
        startTime: new Date(),
      })
      .where(eq(partyGames.id, gameId));

    // Trigger race start event
    await triggerPartyEvent('sim-racing', 'race-started', {
      gameId,
      message: 'Betting is now CLOSED! Race in progress!',
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error starting race:', error);
    return { success: false, error: 'Failed to start race' };
  }
}

export async function getRegisteredDriversAction(gameId: string) {
  try {
    const entries = await db.select({
      id: simRaceEntries.id,
      userId: simRaceEntries.userId,
      userName: partyUsers.name,
      avatarUrl: partyUsers.avatarUrl,
      isReady: simRaceEntries.isReady,
    })
    .from(simRaceEntries)
    .innerJoin(partyUsers, eq(simRaceEntries.userId, partyUsers.id))
    .where(eq(simRaceEntries.gameId, gameId));

    return { success: true, drivers: entries };
  } catch (error) {
    console.error('Error getting drivers:', error);
    return { success: false, error: 'Failed to get drivers' };
  }
}

// ============================================
// BETTING SYSTEM
// ============================================

export async function placeBetAction(targetUserId: string, amount: number) {
  try {
    const user = await getCurrentPartyUserAction();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }
    
    // Check wallet balance
    if (user.walletBalance < amount) {
      return { success: false, error: 'Insufficient funds' };
    }
    
    // Get active sim race game
    const [game] = await db.select().from(partyGames).where(
      and(
        eq(partyGames.type, 'SIM_RACE'),
        eq(partyGames.status, 'OPEN')
      )
    );
    
    if (!game) {
      return { success: false, error: 'No active game to bet on' };
    }

    // Check if betting is open
    if (game.raceState !== 'BETTING_OPEN') {
      if (game.raceState === 'REGISTRATION') {
        return { success: false, error: 'Betting not open yet - waiting for drivers to be ready' };
      } else if (game.raceState === 'RACE_STARTED') {
        return { success: false, error: 'Betting closed - race has started!' };
      } else {
        return { success: false, error: 'Betting not available' };
      }
    }
    
    // Deduct from wallet
    await db.update(partyUsers)
      .set({ walletBalance: sql`${partyUsers.walletBalance} - ${amount}` })
      .where(eq(partyUsers.id, user.id));
    
    // Create bet
    await db.insert(bets).values({
      gameId: game.id,
      bettorId: user.id,
      targetUserId,
      amount,
      status: 'PENDING',
    });
    
    // Get target user name
    const [target] = await db.select().from(partyUsers).where(eq(partyUsers.id, targetUserId));
    
    // Trigger Pusher event
    await triggerPartyEvent('betting', 'bet-placed', {
      bettorId: user.id,
      bettorName: user.name,
      targetId: targetUserId,
      targetName: target?.name || 'Unknown',
      amount,
      timestamp: new Date().toISOString(),
    }, user.id);
    
    return { success: true };
  } catch (error) {
    console.error('Error placing bet:', error);
    return { success: false, error: 'Failed to place bet' };
  }
}

export async function settleBetsAction(gameId: string) {
  try {
    // Admin only - should add auth check
    
    // Get game winner (first place)
    const entries = await db.select()
      .from(simRaceEntries)
      .where(eq(simRaceEntries.gameId, gameId))
      .orderBy(asc(simRaceEntries.lapTimeMs))
      .limit(1);
    
    if (entries.length === 0) {
      return { success: false, error: 'No entries found' };
    }
    
    const winner = entries[0];
    
    // Get all bets for this game
    const allBets = await db.select().from(bets).where(eq(bets.gameId, gameId));
    
    // Settle bets
    for (const bet of allBets) {
      if (bet.targetUserId === winner.userId) {
        // Winner! Pay out 2x
        const payout = bet.amount * 2;
        
        await db.transaction(async (tx) => {
          // Update bet status
          await tx.update(bets)
            .set({ status: 'WON', payout, settledAt: new Date() })
            .where(eq(bets.id, bet.id));
          
          // Add to wallet
          await tx.update(partyUsers)
            .set({ walletBalance: sql`${partyUsers.walletBalance} + ${payout}` })
            .where(eq(partyUsers.id, bet.bettorId));
        });
      } else {
        // Lost
        await db.update(bets)
          .set({ status: 'LOST', settledAt: new Date() })
          .where(eq(bets.id, bet.id));
      }
    }
    
    // Close game
    await db.update(partyGames)
      .set({ status: 'FINISHED', endTime: new Date() })
      .where(eq(partyGames.id, gameId));
    
    // Trigger event
    await triggerPartyEvent('betting', 'bets-settled', {
      gameId,
      winnerId: winner.userId,
      timestamp: new Date().toISOString(),
    });
    
    return { success: true, winnerId: winner.userId };
  } catch (error) {
    console.error('Error settling bets:', error);
    return { success: false, error: 'Failed to settle bets' };
  }
}

export async function getUserBetsAction() {
  try {
    const user = await getCurrentPartyUserAction();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const userBets = await db.select({
      id: bets.id,
      gameTitle: partyGames.title,
      targetName: partyUsers.name,
      amount: bets.amount,
      status: bets.status,
      payout: bets.payout,
      createdAt: bets.createdAt,
    })
    .from(bets)
    .innerJoin(partyGames, eq(bets.gameId, partyGames.id))
    .innerJoin(partyUsers, eq(bets.targetUserId, partyUsers.id))
    .where(eq(bets.bettorId, user.id))
    .orderBy(desc(bets.createdAt));
    
    return { success: true, bets: userBets };
  } catch (error) {
    console.error('Error getting user bets:', error);
    return { success: false, error: 'Failed to get bets' };
  }
}

// ============================================
// IMPOSTER GAME
// ============================================

export async function startImposterRoundAction() {
  try {
    // Admin only - should add auth check
    
    // Get all party users
    const users = await db.select().from(partyUsers);
    
    if (users.length < 3) {
      return { success: false, error: 'Need at least 3 players' };
    }
    
    // Select random imposter
    const imposter = users[Math.floor(Math.random() * users.length)];
    
    // Get or create imposter game
    let [game] = await db.select().from(partyGames).where(
      and(
        eq(partyGames.type, 'IMPOSTER'),
        eq(partyGames.status, 'OPEN')
      )
    );
    
    if (!game) {
      [game] = await db.insert(partyGames).values({
        title: 'Imposter Game',
        type: 'IMPOSTER',
        status: 'OPEN',
      }).returning();
    }
    
    // Generate words using AI with South African house party context
    let words;
    
    try {
      const prompt = `Generate a secret word and a vague category for an Imposter party game.

Context: This is for a South African house party with friends and family.

Requirements:
1. The secret word MUST be either:
   - A physical object found in a typical home (e.g., "Microwave", "Couch", "Remote")
   - A common South African topic or cultural reference (e.g., "Loadshedding", "Braai", "Traffic", "Biltong", "Boerewors", "Robot" (traffic light), "Eskom", "Lekker")

2. The imposter hint must be:
   - Technically true but misleading
   - A broader category that could fit multiple things
   - Not too obvious but not impossible

3. Difficulty: Medium (not too easy, not impossible)

Return ONLY a JSON object with this exact format:
{
  "civilian_word": "the exact word civilians see",
  "imposter_hint": "the vague misleading hint"
}

Example output:
{
  "civilian_word": "Loadshedding",
  "imposter_hint": "South African Problem"
}`;

      const result = await generateText({
        model: google('gemini-1.5-flash'),
        prompt,
        temperature: 0.9, // Higher creativity
      });

      // Parse AI response
      const aiResponse = result.text.trim();
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        words = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid AI response format');
      }
    } catch (error) {
      console.error('AI generation failed, using fallback:', error);
      
      // Fallback word pairs with South African flavor
      const fallbackPairs = [
        { civilian_word: "Loadshedding", imposter_hint: "South African Problem" },
        { civilian_word: "Braai", imposter_hint: "Cooking Method" },
        { civilian_word: "Biltong", imposter_hint: "Dried Meat" },
        { civilian_word: "Robot", imposter_hint: "Traffic Control" },
        { civilian_word: "Boerewors", imposter_hint: "Sausage Type" },
        { civilian_word: "Eskom", imposter_hint: "Power Company" },
        { civilian_word: "Lekker", imposter_hint: "South African Word" },
        { civilian_word: "Microwave", imposter_hint: "Kitchen Appliance" },
        { civilian_word: "Remote", imposter_hint: "TV Accessory" },
        { civilian_word: "Couch", imposter_hint: "Living Room Furniture" },
        { civilian_word: "Traffic", imposter_hint: "Road Problem" },
        { civilian_word: "WiFi", imposter_hint: "Internet Connection" },
        { civilian_word: "Kettle", imposter_hint: "Boiling Device" },
        { civilian_word: "Pap", imposter_hint: "South African Food" },
        { civilian_word: "Taxi", imposter_hint: "Transport Vehicle" },
      ];
      
      words = fallbackPairs[Math.floor(Math.random() * fallbackPairs.length)];
    }
    
    // Create round
    const [round] = await db.insert(partyImposterRounds).values({
      gameId: game.id,
      imposterId: imposter.id,
      secretWord: words.civilian_word,
      imposterHint: words.imposter_hint,
      status: 'ACTIVE',
    }).returning();
    
    // Trigger Pusher event
    await triggerPartyEvent('imposter-game', 'round-started', {
      roundId: round.id,
      playerCount: users.length,
      timestamp: new Date().toISOString(),
    });
    
    return { success: true, round, playerCount: users.length };
  } catch (error) {
    console.error('Error starting imposter round:', error);
    return { success: false, error: 'Failed to start round' };
  }
}

export async function getActiveImposterRoundAction() {
  try {
    const user = await getCurrentPartyUserAction();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }
    
    // Get active round
    const [round] = await db.select()
      .from(partyImposterRounds)
      .where(eq(partyImposterRounds.status, 'ACTIVE'))
      .orderBy(desc(partyImposterRounds.createdAt))
      .limit(1);
    
    if (!round) {
      return { success: false, error: 'No active round' };
    }
    
    // Return appropriate data based on role
    const isImposter = round.imposterId === user.id;
    
    return {
      success: true,
      round: {
        id: round.id,
        isImposter,
        word: isImposter ? round.imposterHint : round.secretWord,
        status: round.status,
      },
    };
  } catch (error) {
    console.error('Error getting imposter round:', error);
    return { success: false, error: 'Failed to get round' };
  }
}

export async function getAllPartyUsersAction() {
  try {
    const users = await db.select({
      id: partyUsers.id,
      name: partyUsers.name,
      avatarUrl: partyUsers.avatarUrl,
      walletBalance: partyUsers.walletBalance,
      status: partyUsers.status,
      partyCode: partyUsers.partyCode,
    }).from(partyUsers);
    
    return { success: true, users };
  } catch (error) {
    console.error('Error getting users:', error);
    return { success: false, error: 'Failed to get users' };
  }
}

// ============================================
// GUEST APPROVAL SYSTEM
// ============================================

export async function getPendingUsersAction() {
  try {
    const users = await db.select().from(partyUsers).where(eq(partyUsers.status, 'pending'));
    return { success: true, users };
  } catch (error) {
    console.error('Error getting pending users:', error);
    return { success: false, error: 'Failed to get pending users' };
  }
}

export async function approveUserAction(userId: string) {
  try {
    await db.update(partyUsers)
      .set({ status: 'approved' })
      .where(eq(partyUsers.id, userId));
    
    // Get user info for notification
    const [user] = await db.select().from(partyUsers).where(eq(partyUsers.id, userId));
    
    // Trigger Pusher event
    await triggerPartyEvent('party-lobby', 'user-approved', {
      userId: user.id,
      name: user.name,
      timestamp: new Date().toISOString(),
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error approving user:', error);
    return { success: false, error: 'Failed to approve user' };
  }
}

export async function rejectUserAction(userId: string) {
  try {
    await db.update(partyUsers)
      .set({ status: 'rejected' })
      .where(eq(partyUsers.id, userId));
    
    // Trigger Pusher event
    await triggerPartyEvent('party-lobby', 'user-rejected', {
      userId,
      timestamp: new Date().toISOString(),
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error rejecting user:', error);
    return { success: false, error: 'Failed to reject user' };
  }
}

export async function addFundsAction(userId: string, amount: number) {
  try {
    await db.update(partyUsers)
      .set({ walletBalance: sql`${partyUsers.walletBalance} + ${amount}` })
      .where(eq(partyUsers.id, userId));
    
    // Trigger Pusher event
    await triggerPartyEvent('party-lobby', 'funds-added', {
      userId,
      amount,
      timestamp: new Date().toISOString(),
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error adding funds:', error);
    return { success: false, error: 'Failed to add funds' };
  }
}

// ============================================
// TASK SYSTEM (Among Us Style)
// ============================================

export async function assignTasksToPlayer(userId: string) {
  try {
    // Get 3 random active tasks
    const allTasks = await db.select().from(partyTasks).where(eq(partyTasks.isActive, true));
    const shuffled = allTasks.sort(() => 0.5 - Math.random());
    const selectedTasks = shuffled.slice(0, 3);
    
    // Assign tasks to player
    const assignments = await Promise.all(
      selectedTasks.map(task =>
        db.insert(playerTasks).values({
          userId,
          taskId: task.id,
        }).returning()
      )
    );
    
    return { success: true, tasks: assignments.flat() };
  } catch (error) {
    console.error('Error assigning tasks:', error);
    return { success: false, error: 'Failed to assign tasks' };
  }
}

export async function getPartyTasksAction() {
  'use server';
  try {
    const tasks = await db
      .select({
        id: partyTasks.id,
        title: partyTasks.title,
        description: partyTasks.description,
        category: partyTasks.category,
        points: partyTasks.points,
      })
      .from(partyTasks);
    
    return { success: true, tasks };
  } catch (error) {
    console.error('Failed to get party tasks:', error);
    return { success: false, error: 'Failed to fetch tasks', tasks: [] };
  }
}

export async function getPlayerTasksAction(userId: string) {
  try {
    const tasks = await db
      .select({
        id: playerTasks.id,
        taskId: playerTasks.taskId,
        description: partyTasks.description,
        pointsReward: partyTasks.pointsReward,
        verificationType: partyTasks.verificationType,
        isCompleted: playerTasks.isCompleted,
        completedAt: playerTasks.completedAt,
      })
      .from(playerTasks)
      .innerJoin(partyTasks, eq(playerTasks.taskId, partyTasks.id))
      .where(eq(playerTasks.userId, userId));
    
    return { success: true, tasks };
  } catch (error) {
    console.error('Error getting player tasks:', error);
    return { success: false, error: 'Failed to get tasks' };
  }
}

export async function completeTaskAction(userId: string, playerTaskId: string, proof?: string) {
  try {
    // Get player status - only CREWMATE can earn task points
    const [status] = await db.select().from(playerStatus).where(eq(playerStatus.userId, userId));
    
    if (status?.role === 'IMPOSTER') {
      return { success: false, error: 'Imposters cannot complete tasks!' };
    }
    
    // Get task details
    const [taskAssignment] = await db
      .select({
        taskId: playerTasks.taskId,
        pointsReward: partyTasks.pointsReward,
        isCompleted: playerTasks.isCompleted,
      })
      .from(playerTasks)
      .innerJoin(partyTasks, eq(playerTasks.taskId, partyTasks.id))
      .where(eq(playerTasks.id, playerTaskId));
    
    if (!taskAssignment) {
      return { success: false, error: 'Task not found' };
    }
    
    if (taskAssignment.isCompleted) {
      return { success: false, error: 'Task already completed' };
    }
    
    // Mark task as completed
    await db
      .update(playerTasks)
      .set({
        isCompleted: true,
        completedAt: new Date(),
        proofUrl: proof || null,
      })
      .where(eq(playerTasks.id, playerTaskId));
    
    // Add points to wallet (transactional)
    await db
      .update(partyUsers)
      .set({ walletBalance: sql`${partyUsers.walletBalance} + ${taskAssignment.pointsReward}` })
      .where(eq(partyUsers.id, userId));
    
    // Check win condition - count total tasks completed vs total assigned
    const [progress] = await db
      .select({
        total: count(),
        completed: sql<number>`SUM(CASE WHEN ${playerTasks.isCompleted} THEN 1 ELSE 0 END)`,
      })
      .from(playerTasks);
    
    const completionRate = progress.total > 0 ? (Number(progress.completed) / progress.total) * 100 : 0;
    
    // Trigger task progress update
    await triggerPartyEvent('party-lobby', 'task-progress-update', {
      userId,
      taskId: playerTaskId,
      pointsEarned: taskAssignment.pointsReward,
      completionRate,
      timestamp: new Date().toISOString(),
    });
    
    // If 100% completion, trigger crew victory
    if (completionRate >= 100) {
      await triggerPartyEvent('party-lobby', 'crew-victory', {
        completionRate,
        timestamp: new Date().toISOString(),
      });
    }
    
    return { success: true, pointsEarned: taskAssignment.pointsReward, completionRate };
  } catch (error) {
    console.error('Error completing task:', error);
    return { success: false, error: 'Failed to complete task' };
  }
}

// ============================================
// IMPOSTER KILL SYSTEM
// ============================================

export async function initializePlayerStatus(userId: string, role: 'CREWMATE' | 'IMPOSTER' = 'CREWMATE') {
  try {
    await db.insert(playerStatus).values({
      userId,
      role,
      status: 'ALIVE',
    }).onConflictDoUpdate({
      target: playerStatus.userId,
      set: { role, status: 'ALIVE', updatedAt: new Date() },
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error initializing player status:', error);
    return { success: false, error: 'Failed to initialize status' };
  }
}

export async function getAlivePlayersAction() {
  try {
    const players = await db
      .select({
        id: partyUsers.id,
        name: partyUsers.name,
        avatarUrl: partyUsers.avatarUrl,
        status: playerStatus.status,
        role: playerStatus.role,
      })
      .from(partyUsers)
      .leftJoin(playerStatus, eq(partyUsers.id, playerStatus.userId))
      .where(eq(playerStatus.status, 'ALIVE'));
    
    return { success: true, players };
  } catch (error) {
    console.error('Error getting alive players:', error);
    return { success: false, error: 'Failed to get players' };
  }
}

export async function killPlayerAction(imposterId: string, targetId: string) {
  try {
    // Verify imposter role
    const [imposter] = await db.select().from(playerStatus).where(eq(playerStatus.userId, imposterId));
    
    if (!imposter || imposter.role !== 'IMPOSTER') {
      return { success: false, error: 'Only imposters can eliminate players' };
    }
    
    // Check kill cooldown
    const [cooldown] = await db.select().from(killCooldowns).where(eq(killCooldowns.imposterId, imposterId));
    
    if (cooldown) {
      const timeSinceLastKill = Date.now() - new Date(cooldown.lastKillAt).getTime();
      const cooldownMs = cooldown.cooldownSeconds * 1000;
      
      if (timeSinceLastKill < cooldownMs) {
        const remainingSeconds = Math.ceil((cooldownMs - timeSinceLastKill) / 1000);
        return { success: false, error: `Cooldown active: ${remainingSeconds}s remaining` };
      }
    }
    
    // Execute kill
    await db
      .update(playerStatus)
      .set({
        status: 'GHOST',
        killedAt: new Date(),
        killedBy: imposterId,
        updatedAt: new Date(),
      })
      .where(eq(playerStatus.userId, targetId));
    
    // Update kill cooldown
    await db
      .insert(killCooldowns)
      .values({
        imposterId,
        lastKillAt: new Date(),
      })
      .onConflictDoUpdate({
        target: killCooldowns.imposterId,
        set: { lastKillAt: new Date() },
      });
    
    // Trigger death event to target's phone ONLY
    await triggerPartyEvent(`party-user-${targetId}`, 'you-are-dead', {
      killedBy: imposterId,
      timestamp: new Date().toISOString(),
    });
    
    // Notify all other players
    await triggerPartyEvent('party-lobby', 'player-eliminated', {
      targetId,
      timestamp: new Date().toISOString(),
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error killing player:', error);
    return { success: false, error: 'Failed to eliminate player' };
  }
}

export async function reportBodyAction(reporterId: string) {
  try {
    // Trigger emergency meeting
    await triggerPartyEvent('party-lobby', 'emergency-meeting', {
      reporterId,
      timestamp: new Date().toISOString(),
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error reporting body:', error);
    return { success: false, error: 'Failed to report body' };
  }
}

// ============================================
// ENHANCED RACE PAYOUT SYSTEM
// ============================================

export async function settleRaceAction(gameId: string, winnerId: string) {
  try {
    const MULTIPLIER = 2.0;
    
    // Get all bets for this race
    const raceBets = await db
      .select()
      .from(bets)
      .where(and(
        eq(bets.gameId, gameId),
        eq(bets.status, 'PENDING')
      ));
    
    // Process payouts transactionally
    await db.transaction(async (tx) => {
      for (const bet of raceBets) {
        if (bet.targetUserId === winnerId) {
          // Winner - calculate payout and add to wallet
          const payout = Math.floor(bet.amount * MULTIPLIER);
          
          await tx
            .update(partyUsers)
            .set({ walletBalance: sql`${partyUsers.walletBalance} + ${payout}` })
            .where(eq(partyUsers.id, bet.bettorId));
          
          await tx
            .update(bets)
            .set({
              status: 'WON',
              payout,
              settledAt: new Date(),
            })
            .where(eq(bets.id, bet.id));
          
          // Trigger celebration for winner
          await triggerPartyEvent(`party-user-${bet.bettorId}`, 'payout-celebration', {
            amount: payout,
            multiplier: MULTIPLIER,
            timestamp: new Date().toISOString(),
          });
        } else {
          // Loser - mark bet as lost
          await tx
            .update(bets)
            .set({
              status: 'LOST',
              settledAt: new Date(),
            })
            .where(eq(bets.id, bet.id));
        }
      }
    });
    
    // Broadcast race results
    await triggerPartyEvent('party-lobby', 'race-settled', {
      gameId,
      winnerId,
      timestamp: new Date().toISOString(),
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error settling race:', error);
    return { success: false, error: 'Failed to settle race' };
  }
}

// ============================================
// WELFARE / STIMULUS SYSTEM
// ============================================

export async function checkAndGrantStimulus(userId: string) {
  try {
    const [user] = await db.select().from(partyUsers).where(eq(partyUsers.id, userId));
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    // If balance is below 50, grant stimulus
    if (user.walletBalance < 50) {
      await db
        .update(partyUsers)
        .set({ walletBalance: sql`${partyUsers.walletBalance} + 200` })
        .where(eq(partyUsers.id, userId));
      
      // Trigger stimulus notification
      await triggerPartyEvent(`party-user-${userId}`, 'stimulus-check', {
        amount: 200,
        message: "Don't give up! Here is a bailout.",
        timestamp: new Date().toISOString(),
      });
      
      return { success: true, granted: true, amount: 200 };
    }
    
    return { success: true, granted: false };
  } catch (error) {
    console.error('Error checking stimulus:', error);
    return { success: false, error: 'Failed to check stimulus' };
  }
}
