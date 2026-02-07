'use server';

import { db } from '@/lib/db';
import { gameSessions, gamePlayers, gameVotes } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { logEvent } from './admin';

/**
 * MODULE 3: Imposter Game Engine (Real-Time Werewolf-style game)
 */

interface CreateGameSessionParams {
  eventId: number;
  secretTopic: string;
  imposterHint: string;
}

interface JoinGameParams {
  sessionId: string;
  userId: string;
  userName: string;
}

/**
 * Create a new game session in LOBBY state
 */
export async function createGameSession(params: CreateGameSessionParams) {
  try {
    const { eventId, secretTopic, imposterHint } = params;

    const [session] = await db
      .insert(gameSessions)
      .values({
        eventId,
        secretTopic,
        imposterHint,
        status: 'LOBBY',
      })
      .returning();

    // Log game creation
    await logEvent(
      'INFO',
      'SpyGame',
      `New game session created: ${secretTopic}`,
      { sessionId: session.id, eventId, secretTopic }
    );

    return {
      success: true,
      data: session,
    };
  } catch (error) {
    console.error('Error creating game session:', error);
    await logEvent('ERROR', 'SpyGame', `Failed to create game session: ${error}`, { error: String(error) });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create game session',
    };
  }
}

/**
 * Join a game session (players join in LOBBY)
 */
export async function joinGame(params: JoinGameParams) {
  try {
    const { sessionId, userId, userName } = params;

    // Check if session exists and is in LOBBY
    const [session] = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, sessionId));

    if (!session) {
      return { success: false, error: 'Game session not found' };
    }

    if (session.status !== 'LOBBY') {
      return { success: false, error: 'Game has already started' };
    }

    // Check if user already joined
    const existing = await db
      .select()
      .from(gamePlayers)
      .where(
        and(
          eq(gamePlayers.sessionId, sessionId),
          eq(gamePlayers.userId, userId)
        )
      );

    if (existing.length > 0) {
      return { success: false, error: 'Already joined this game' };
    }

    // Add player (role will be assigned when game starts)
    const [player] = await db
      .insert(gamePlayers)
      .values({
        sessionId,
        userId,
        userName,
        role: 'CIVILIAN', // Temporary, assigned in startGame
      })
      .returning();

    return { success: true, data: player };
  } catch (error) {
    console.error('Error joining game:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to join game',
    };
  }
}

/**
 * Start the game - Randomly assign 1 IMPOSTER, rest are CIVILIANS
 * Send different information to each role
 */
export async function startGame(sessionId: string) {
  try {
    // Get session
    const [session] = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, sessionId));

    if (!session) {
      return { success: false, error: 'Game session not found' };
    }

    if (session.status !== 'LOBBY') {
      return { success: false, error: 'Game already started' };
    }

    // Get all players
    const players = await db
      .select()
      .from(gamePlayers)
      .where(eq(gamePlayers.sessionId, sessionId));

    if (players.length < 3) {
      return { success: false, error: 'Need at least 3 players to start' };
    }

    // Randomly select imposter
    const imposterIndex = Math.floor(Math.random() * players.length);
    const imposters = [players[imposterIndex]];

    // Update roles
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
      .set({
        status: 'ACTIVE',
        startedAt: new Date(),
      })
      .where(eq(gameSessions.id, sessionId));

    // Log game start event
    await logEvent(
      'INFO',
      'SpyGame',
      `Game started: ${session.secretTopic}`,
      {
        sessionId,
        totalPlayers: players.length,
        imposterCount: imposters.length,
      }
    );

    return {
      success: true,
      data: {
        sessionId,
        imposterIds: imposters.map((p) => p.userId),
        totalPlayers: players.length,
      },
    };
  } catch (error) {
    console.error('Error starting game:', error);
    await logEvent('ERROR', 'SpyGame', `Failed to start game: ${error}`, { error: String(error) });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start game',
    };
  }
}

/**
 * Get player's role information (called by client)
 * Returns different data based on role
 */
export async function getPlayerRole(sessionId: string, userId: string) {
  try {
    const [player] = await db
      .select()
      .from(gamePlayers)
      .where(
        and(
          eq(gamePlayers.sessionId, sessionId),
          eq(gamePlayers.userId, userId)
        )
      );

    if (!player) {
      return { success: false, error: 'Player not found in this game' };
    }

    const [session] = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, sessionId));

    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    // Return role-specific information
    return {
      success: true,
      data: {
        role: player.role,
        isAlive: player.isAlive,
        information:
          player.role === 'IMPOSTER'
            ? session.imposterHint
            : session.secretTopic,
      },
    };
  } catch (error) {
    console.error('Error getting player role:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get player role',
    };
  }
}

/**
 * Start voting phase
 */
export async function startVoting(sessionId: string) {
  try {
    await db
      .update(gameSessions)
      .set({ status: 'VOTE', votingEnabled: true })
      .where(eq(gameSessions.id, sessionId));

    return { success: true };
  } catch (error) {
    console.error('Error starting voting:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start voting',
    };
  }
}

/**
 * Cast a vote
 */
export async function castVote(
  sessionId: string,
  voterId: string,
  targetId: string
) {
  try {
    const [session] = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, sessionId));

    if (!session || !session.votingEnabled) {
      return { success: false, error: 'Voting is not enabled' };
    }

    // Check if already voted this round
    const existingVote = await db
      .select()
      .from(gameVotes)
      .where(
        and(
          eq(gameVotes.sessionId, sessionId),
          eq(gameVotes.voterId, voterId),
          eq(gameVotes.round, session.round)
        )
      );

    if (existingVote.length > 0) {
      return { success: false, error: 'Already voted this round' };
    }

    // Cast vote
    await db.insert(gameVotes).values({
      sessionId,
      voterId,
      targetId,
      round: session.round,
    });

    // Update vote count on player
    await db.execute(sql`
      UPDATE game_players
      SET votes_received = votes_received + 1
      WHERE session_id = ${sessionId} AND user_id = ${targetId}
    `);

    // Log the vote
    await logEvent(
      'INFO',
      'SpyGame',
      `Vote cast in round ${session.round}`,
      { sessionId, voterId, targetId, round: session.round }
    );

    return { success: true };
  } catch (error) {
    console.error('Error casting vote:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cast vote',
    };
  }
}

/**
 * Get current game state
 */
export async function getGameState(sessionId: string) {
  try {
    const [session] = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, sessionId));

    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    const players = await db
      .select()
      .from(gamePlayers)
      .where(eq(gamePlayers.sessionId, sessionId));

    return {
      success: true,
      data: {
        session,
        players: players.map((p) => ({
          id: p.id,
          userId: p.userId,
          userName: p.userName,
          isAlive: p.isAlive,
          votesReceived: p.votesReceived,
          // Don't expose role to clients
        })),
      },
    };
  } catch (error) {
    console.error('Error getting game state:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get game state',
    };
  }
}

/**
 * Eliminate player with most votes
 */
export async function eliminatePlayer(sessionId: string) {
  try {
    // Find player with most votes
    const playersWithVotes = await db
      .select()
      .from(gamePlayers)
      .where(
        and(
          eq(gamePlayers.sessionId, sessionId),
          eq(gamePlayers.isAlive, true)
        )
      )
      .orderBy(sql`${gamePlayers.votesReceived} DESC`)
      .limit(1);

    if (playersWithVotes.length === 0) {
      return { success: false, error: 'No players to eliminate' };
    }

    const eliminated = playersWithVotes[0];

    // Eliminate player
    await db
      .update(gamePlayers)
      .set({ isAlive: false })
      .where(eq(gamePlayers.id, eliminated.id));

    // Check win conditions
    const alivePlayers = await db
      .select()
      .from(gamePlayers)
      .where(
        and(
          eq(gamePlayers.sessionId, sessionId),
          eq(gamePlayers.isAlive, true)
        )
      );

    const imposterAlive = alivePlayers.some((p) => p.role === 'IMPOSTER');
    const civiliansAlive = alivePlayers.filter((p) => p.role === 'CIVILIAN').length;

    let winner = null;
    if (!imposterAlive) {
      winner = 'CIVILIANS';
      await db
        .update(gameSessions)
        .set({ status: 'ENDED', endedAt: new Date() })
        .where(eq(gameSessions.id, sessionId));
      
      // Log civilian victory
      await logEvent(
        'INFO',
        'SpyGame',
        `Game ended: Civilians win! Imposter ${eliminated.userName} eliminated.`,
        { sessionId, winner: 'CIVILIANS', eliminatedImposter: eliminated.userName }
      );
    } else if (civiliansAlive <= 1) {
      winner = 'IMPOSTER';
      await db
        .update(gameSessions)
        .set({ status: 'ENDED', endedAt: new Date() })
        .where(eq(gameSessions.id, sessionId));
      
      // Log imposter victory
      await logEvent(
        'INFO',
        'SpyGame',
        `Game ended: Imposter wins! Only ${civiliansAlive} civilians remain.`,
        { sessionId, winner: 'IMPOSTER', civiliansRemaining: civiliansAlive }
      );
    } else {
      // Log elimination
      await logEvent(
        'INFO',
        'SpyGame',
        `Player eliminated: ${eliminated.userName} (${eliminated.role})`,
        { sessionId, eliminatedUser: eliminated.userName, eliminatedRole: eliminated.role }
      );
    }

    return {
      success: true,
      data: {
        eliminated: {
          userId: eliminated.userId,
          userName: eliminated.userName,
          role: eliminated.role,
        },
        winner,
      },
    };
  } catch (error) {
    console.error('Error eliminating player:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to eliminate player',
    };
  }
}
