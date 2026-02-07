'use server';

import { db } from '@/lib/db';
import { familyGameParticipants } from '@/lib/db/schema';
import { and, eq, inArray, desc } from 'drizzle-orm';
import { ensureFamilyGamesSchema } from '@/lib/db/ensure-family-games-schema';

export async function getParticipantsForGamesAction(gameIds: string[]) {
  try {
    await ensureFamilyGamesSchema();

    if (gameIds.length === 0) {
      return { success: true, participantsByGame: {} as Record<string, any[]> };
    }

    const rows = await db
      .select()
      .from(familyGameParticipants)
      .where(inArray(familyGameParticipants.gameId, gameIds))
      .orderBy(desc(familyGameParticipants.createdAt));

    const participantsByGame: Record<string, any[]> = {};
    for (const row of rows) {
      if (!participantsByGame[row.gameId]) {
        participantsByGame[row.gameId] = [];
      }
      participantsByGame[row.gameId].push({
        id: row.id,
        name: row.userName,
        userId: row.userId,
        addedBy: row.addedBy,
        joinedAt: row.createdAt.toISOString(),
      });
    }

    return { success: true, participantsByGame };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load participants',
    };
  }
}

export async function joinFamilyGameAction(gameId: string, userId: string, userName: string) {
  try {
    await ensureFamilyGamesSchema();

    const [existing] = await db
      .select()
      .from(familyGameParticipants)
      .where(and(eq(familyGameParticipants.gameId, gameId), eq(familyGameParticipants.userId, userId)));

    if (existing) {
      return {
        success: true,
        participant: {
          id: existing.id,
          name: existing.userName,
          userId: existing.userId,
          addedBy: existing.addedBy,
          joinedAt: existing.createdAt.toISOString(),
        },
      };
    }

    const [participant] = await db
      .insert(familyGameParticipants)
      .values({
        gameId,
        userId,
        userName,
        addedBy: userId,
      })
      .returning();

    return {
      success: true,
      participant: {
        id: participant.id,
        name: participant.userName,
        userId: participant.userId,
        addedBy: participant.addedBy,
        joinedAt: participant.createdAt.toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to join game',
    };
  }
}

export async function addGuestFamilyGameParticipantAction(gameId: string, name: string, addedBy: string) {
  try {
    await ensureFamilyGamesSchema();

    const [participant] = await db
      .insert(familyGameParticipants)
      .values({
        gameId,
        userId: null,
        userName: name,
        addedBy,
      })
      .returning();

    return {
      success: true,
      participant: {
        id: participant.id,
        name: participant.userName,
        userId: participant.userId,
        addedBy: participant.addedBy,
        joinedAt: participant.createdAt.toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add participant',
    };
  }
}

export async function removeFamilyGameParticipantAction(participantId: number) {
  try {
    await ensureFamilyGamesSchema();

    await db
      .delete(familyGameParticipants)
      .where(eq(familyGameParticipants.id, participantId));

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove participant',
    };
  }
}
