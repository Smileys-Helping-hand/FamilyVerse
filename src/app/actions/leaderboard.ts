'use server';

import { db } from '@/lib/db';
import { games, gameScores } from '@/lib/db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';

/**
 * MODULE 2: Universal Leaderboard System
 */

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  scoreValue: number;
  rank: number;
  proofImageUrl?: string | null;
  createdAt: Date;
}

export interface PartyMVPEntry {
  userId: string;
  userName: string;
  metaPoints: number;
  gamesWon: number;
  totalGames: number;
}

/**
 * Get the leaderboard for a specific game at an event
 * Uses Window Functions to calculate rank based on scoring type
 * Only includes each user's BEST attempt
 */
export async function getGameLeaderboard(
  gameId: number,
  eventId: number
): Promise<{ success: boolean; data?: LeaderboardEntry[]; error?: string }> {
  try {
    // First, get the game to know its scoring type
    const [game] = await db.select().from(games).where(eq(games.id, gameId));

    if (!game) {
      return { success: false, error: 'Game not found' };
    }

    // Build the query based on scoring type
    // For TIME_ASC: lowest score wins (ORDER BY ASC)
    // For SCORE_DESC: highest score wins (ORDER BY DESC)
    const rankOrder = game.scoringType === 'TIME_ASC' ? sql`ASC` : sql`DESC`;

    // SQL query that:
    // 1. Gets best score per user using DISTINCT ON
    // 2. Ranks users using RANK() window function
    const leaderboard = await db.execute<{
      user_id: string;
      score_value: string;
      rank: string;
      proof_image_url: string | null;
      created_at: string;
    }>(sql`
      WITH best_scores AS (
        SELECT DISTINCT ON (user_id)
          user_id,
          score_value,
          proof_image_url,
          created_at
        FROM game_scores
        WHERE game_id = ${gameId} AND event_id = ${eventId}
        ORDER BY user_id, score_value ${game.scoringType === 'TIME_ASC' ? sql`ASC` : sql`DESC`}
      )
      SELECT
        user_id,
        score_value,
        RANK() OVER (ORDER BY score_value ${game.scoringType === 'TIME_ASC' ? sql`ASC` : sql`DESC`}) as rank,
        proof_image_url,
        created_at
      FROM best_scores
      ORDER BY rank ASC
    `);

    // TODO: Join with user table to get names
    // For now, using userId as userName
    const entries: LeaderboardEntry[] = leaderboard.rows.map((row) => ({
      userId: row.user_id,
      userName: row.user_id, // Replace with actual user name from users table
      scoreValue: parseInt(row.score_value),
      rank: parseInt(row.rank),
      proofImageUrl: row.proof_image_url,
      createdAt: new Date(row.created_at),
    }));

    return { success: true, data: entries };
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch leaderboard',
    };
  }
}

/**
 * Calculate "Party MVP" - overall winner across ALL games
 * Assigns meta points: 1st=10pts, 2nd=5pts, 3rd=3pts, participation=1pt
 */
export async function getPartyMVP(
  eventId: number
): Promise<{ success: boolean; data?: PartyMVPEntry[]; error?: string }> {
  try {
    const mvpResults = await db.execute<{
      user_id: string;
      meta_points: string;
      games_won: string;
      total_games: string;
    }>(sql`
      WITH best_scores AS (
        SELECT DISTINCT ON (gs.user_id, gs.game_id)
          gs.user_id,
          gs.game_id,
          gs.score_value,
          g.scoring_type
        FROM game_scores gs
        JOIN games g ON g.id = gs.game_id
        WHERE gs.event_id = ${eventId}
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
      ),
      meta_points AS (
        SELECT
          user_id,
          CASE
            WHEN rank = 1 THEN 10
            WHEN rank = 2 THEN 5
            WHEN rank = 3 THEN 3
            ELSE 1
          END as points,
          CASE WHEN rank = 1 THEN 1 ELSE 0 END as win
        FROM ranked_scores
      )
      SELECT
        user_id,
        SUM(points) as meta_points,
        SUM(win) as games_won,
        COUNT(*) as total_games
      FROM meta_points
      GROUP BY user_id
      ORDER BY meta_points DESC, games_won DESC
    `);

    // TODO: Join with user table to get names
    const mvpEntries: PartyMVPEntry[] = mvpResults.rows.map((row) => ({
      userId: row.user_id,
      userName: row.user_id, // Replace with actual user name
      metaPoints: parseInt(row.meta_points),
      gamesWon: parseInt(row.games_won),
      totalGames: parseInt(row.total_games),
    }));

    return { success: true, data: mvpEntries };
  } catch (error) {
    console.error('Error calculating Party MVP:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate MVP',
    };
  }
}

/**
 * Submit a new score for a game
 */
export async function submitGameScore(data: {
  gameId: number;
  userId: string;
  eventId: number;
  scoreValue: number;
  proofImageUrl?: string;
}) {
  try {
    const [score] = await db
      .insert(gameScores)
      .values(data)
      .returning();

    return { success: true, data: score };
  } catch (error) {
    console.error('Error submitting score:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit score',
    };
  }
}

/**
 * Create a new game
 */
export async function createGame(data: {
  name: string;
  scoringType: 'TIME_ASC' | 'SCORE_DESC';
  icon?: string;
  description?: string;
}) {
  try {
    const [game] = await db
      .insert(games)
      .values(data)
      .returning();

    return { success: true, data: game };
  } catch (error) {
    console.error('Error creating game:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create game',
    };
  }
}

/**
 * Get all games
 */
export async function getAllGames() {
  try {
    const allGames = await db.select().from(games);
    return { success: true, data: allGames };
  } catch (error) {
    console.error('Error fetching games:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch games',
    };
  }
}

/**
 * Format time in milliseconds to readable format
 */
export function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;
  
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  }
  return `${seconds}.${milliseconds.toString().padStart(3, '0')}s`;
}
