'use server';

import { db } from '@/lib/db';
import { 
  gameConfig, 
  imposterHints, 
  civilianTopics, 
  gamePlayers,
  gameSessions 
} from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

type ServerActionResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================
// GAME CONFIG MANAGEMENT
// ============================================

export async function getGameConfig(eventId: number): Promise<ServerActionResponse<typeof gameConfig.$inferSelect | null>> {
  try {
    const config = await db.query.gameConfig.findFirst({
      where: eq(gameConfig.eventId, eventId),
    });

    return { success: true, data: config || null };
  } catch (error) {
    console.error('Error fetching game config:', error);
    return { success: false, error: 'Failed to fetch game config' };
  }
}

export async function upsertGameConfig(
  eventId: number,
  updates: {
    blackoutIntervalMinutes?: number;
    killerWindowSeconds?: number;
    isGamePaused?: boolean;
    powerLevel?: number;
  }
): Promise<ServerActionResponse<typeof gameConfig.$inferSelect>> {
  try {
    const existing = await db.query.gameConfig.findFirst({
      where: eq(gameConfig.eventId, eventId),
    });

    if (existing) {
      const [updated] = await db
        .update(gameConfig)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(gameConfig.eventId, eventId))
        .returning();
      
      revalidatePath('/admin/dashboard');
      return { success: true, data: updated };
    } else {
      const [created] = await db
        .insert(gameConfig)
        .values({
          eventId,
          blackoutIntervalMinutes: updates.blackoutIntervalMinutes ?? 30,
          killerWindowSeconds: updates.killerWindowSeconds ?? 30,
          isGamePaused: updates.isGamePaused ?? false,
          powerLevel: updates.powerLevel ?? 100,
        })
        .returning();
      
      revalidatePath('/admin/dashboard');
      return { success: true, data: created };
    }
  } catch (error) {
    console.error('Error upserting game config:', error);
    return { success: false, error: 'Failed to update game config' };
  }
}

export async function toggleGamePause(eventId: number): Promise<ServerActionResponse<boolean>> {
  try {
    const config = await db.query.gameConfig.findFirst({
      where: eq(gameConfig.eventId, eventId),
    });

    if (!config) {
      return { success: false, error: 'Config not found' };
    }

    const newState = !config.isGamePaused;
    await db
      .update(gameConfig)
      .set({ isGamePaused: newState, updatedAt: new Date() })
      .where(eq(gameConfig.eventId, eventId));

    revalidatePath('/admin/dashboard');
    return { success: true, data: newState };
  } catch (error) {
    console.error('Error toggling pause:', error);
    return { success: false, error: 'Failed to toggle pause' };
  }
}

export async function adjustPowerLevel(
  eventId: number,
  delta: number
): Promise<ServerActionResponse<number>> {
  try {
    const config = await db.query.gameConfig.findFirst({
      where: eq(gameConfig.eventId, eventId),
    });

    if (!config) {
      return { success: false, error: 'Config not found' };
    }

    const newLevel = Math.max(0, Math.min(100, config.powerLevel + delta));
    await db
      .update(gameConfig)
      .set({ powerLevel: newLevel, updatedAt: new Date() })
      .where(eq(gameConfig.eventId, eventId));

    revalidatePath('/admin/dashboard');
    return { success: true, data: newLevel };
  } catch (error) {
    console.error('Error adjusting power:', error);
    return { success: false, error: 'Failed to adjust power level' };
  }
}

// ============================================
// CONTENT MANAGEMENT (Hints & Topics)
// ============================================

export async function getImposterHints(eventId: number): Promise<ServerActionResponse<typeof imposterHints.$inferSelect[]>> {
  try {
    const hints = await db.query.imposterHints.findMany({
      where: eq(imposterHints.eventId, eventId),
      orderBy: (hints, { desc }) => [desc(hints.createdAt)],
    });

    return { success: true, data: hints };
  } catch (error) {
    console.error('Error fetching hints:', error);
    return { success: false, error: 'Failed to fetch hints' };
  }
}

export async function addImposterHint(
  eventId: number,
  hintText: string,
  category: 'general' | 'action' | 'behavior' = 'general'
): Promise<ServerActionResponse<typeof imposterHints.$inferSelect>> {
  try {
    const [hint] = await db
      .insert(imposterHints)
      .values({ eventId, hintText, category })
      .returning();

    revalidatePath('/admin/dashboard');
    return { success: true, data: hint };
  } catch (error) {
    console.error('Error adding hint:', error);
    return { success: false, error: 'Failed to add hint' };
  }
}

export async function updateImposterHint(
  hintId: number,
  updates: {
    hintText?: string;
    category?: 'general' | 'action' | 'behavior';
    isActive?: boolean;
  }
): Promise<ServerActionResponse<typeof imposterHints.$inferSelect>> {
  try {
    const [updated] = await db
      .update(imposterHints)
      .set(updates)
      .where(eq(imposterHints.id, hintId))
      .returning();

    revalidatePath('/admin/dashboard');
    return { success: true, data: updated };
  } catch (error) {
    console.error('Error updating hint:', error);
    return { success: false, error: 'Failed to update hint' };
  }
}

export async function deleteImposterHint(hintId: number): Promise<ServerActionResponse<void>> {
  try {
    await db.delete(imposterHints).where(eq(imposterHints.id, hintId));
    revalidatePath('/admin/dashboard');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('Error deleting hint:', error);
    return { success: false, error: 'Failed to delete hint' };
  }
}

export async function getCivilianTopics(eventId: number): Promise<ServerActionResponse<typeof civilianTopics.$inferSelect[]>> {
  try {
    const topics = await db.query.civilianTopics.findMany({
      where: eq(civilianTopics.eventId, eventId),
      orderBy: (topics, { desc }) => [desc(topics.createdAt)],
    });

    return { success: true, data: topics };
  } catch (error) {
    console.error('Error fetching topics:', error);
    return { success: false, error: 'Failed to fetch topics' };
  }
}

export async function addCivilianTopic(
  eventId: number,
  topicText: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<ServerActionResponse<typeof civilianTopics.$inferSelect>> {
  try {
    const [topic] = await db
      .insert(civilianTopics)
      .values({ eventId, topicText, difficulty })
      .returning();

    revalidatePath('/admin/dashboard');
    return { success: true, data: topic };
  } catch (error) {
    console.error('Error adding topic:', error);
    return { success: false, error: 'Failed to add topic' };
  }
}

export async function updateCivilianTopic(
  topicId: number,
  updates: {
    topicText?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    isActive?: boolean;
  }
): Promise<ServerActionResponse<typeof civilianTopics.$inferSelect>> {
  try {
    const [updated] = await db
      .update(civilianTopics)
      .set(updates)
      .where(eq(civilianTopics.id, topicId))
      .returning();

    revalidatePath('/admin/dashboard');
    return { success: true, data: updated };
  } catch (error) {
    console.error('Error updating topic:', error);
    return { success: false, error: 'Failed to update topic' };
  }
}

export async function deleteCivilianTopic(topicId: number): Promise<ServerActionResponse<void>> {
  try {
    await db.delete(civilianTopics).where(eq(civilianTopics.id, topicId));
    revalidatePath('/admin/dashboard');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('Error deleting topic:', error);
    return { success: false, error: 'Failed to delete topic' };
  }
}

// ============================================
// PLAYER MANAGEMENT (Admin Controls)
// ============================================

export async function forceKillPlayer(
  sessionId: string,
  userId: string
): Promise<ServerActionResponse<void>> {
  try {
    await db
      .update(gamePlayers)
      .set({ isAlive: false })
      .where(
        and(
          eq(gamePlayers.sessionId, sessionId),
          eq(gamePlayers.userId, userId)
        )
      );

    revalidatePath('/admin/dashboard');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('Error force killing player:', error);
    return { success: false, error: 'Failed to eliminate player' };
  }
}

export async function reassignPlayerRole(
  sessionId: string,
  userId: string,
  newRole: 'CIVILIAN' | 'IMPOSTER'
): Promise<ServerActionResponse<void>> {
  try {
    // Verify session is in LOBBY state
    const session = await db.query.gameSessions.findFirst({
      where: eq(gameSessions.id, sessionId),
    });

    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    if (session.status !== 'LOBBY') {
      return { success: false, error: 'Can only reassign roles in lobby' };
    }

    await db
      .update(gamePlayers)
      .set({ role: newRole })
      .where(
        and(
          eq(gamePlayers.sessionId, sessionId),
          eq(gamePlayers.userId, userId)
        )
      );

    revalidatePath('/admin/dashboard');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('Error reassigning role:', error);
    return { success: false, error: 'Failed to reassign role' };
  }
}

export async function getActivePlayers(sessionId: string): Promise<ServerActionResponse<typeof gamePlayers.$inferSelect[]>> {
  try {
    const players = await db.query.gamePlayers.findMany({
      where: eq(gamePlayers.sessionId, sessionId),
    });

    return { success: true, data: players };
  } catch (error) {
    console.error('Error fetching players:', error);
    return { success: false, error: 'Failed to fetch players' };
  }
}

// ============================================
// RANDOM CONTENT SELECTION
// ============================================

export async function getRandomHint(eventId: number): Promise<ServerActionResponse<string>> {
  try {
    const hints = await db.query.imposterHints.findMany({
      where: and(
        eq(imposterHints.eventId, eventId),
        eq(imposterHints.isActive, true)
      ),
    });

    if (hints.length === 0) {
      return { 
        success: true, 
        data: 'Try to blend in with the conversation without revealing you don\'t know the topic.' 
      };
    }

    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    return { success: true, data: randomHint.hintText };
  } catch (error) {
    console.error('Error getting random hint:', error);
    return { success: false, error: 'Failed to fetch hint' };
  }
}

export async function getRandomTopic(eventId: number): Promise<ServerActionResponse<string>> {
  try {
    const topics = await db.query.civilianTopics.findMany({
      where: and(
        eq(civilianTopics.eventId, eventId),
        eq(civilianTopics.isActive, true)
      ),
    });

    if (topics.length === 0) {
      return { 
        success: true, 
        data: 'Favorite childhood memory' 
      };
    }

    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    return { success: true, data: randomTopic.topicText };
  } catch (error) {
    console.error('Error getting random topic:', error);
    return { success: false, error: 'Failed to fetch topic' };
  }
}
