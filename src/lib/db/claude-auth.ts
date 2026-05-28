'use server';

import { db } from './index';
import {
  claudeAuthSessions,
  authLinkedAccounts,
  users,
  type NewClaudeAuthSession,
  type NewAuthLinkedAccount,
} from './schema';
import { eq, and } from 'drizzle-orm';
import { generateSecureToken } from '@/lib/encryption';
import { v4 as uuidv4 } from 'uuid';

export async function createClaudeAuthSession(
  userId: string,
  claudeAuthId: string,
  deviceId: string,
  expiresAt: Date
) {
  try {
    const sessionToken = generateSecureToken(32);
    const id = uuidv4();

    const result = await db
      .insert(claudeAuthSessions)
      .values({
        id,
        userId,
        claudeAuthId,
        sessionToken,
        deviceId,
        isActive: true,
        expiresAt,
      })
      .returning();

    return { success: true, session: result[0], sessionToken };
  } catch (error) {
    console.error('Failed to create Claude auth session:', error);
    return { success: false, error: 'Failed to create session' };
  }
}

export async function getClaudeAuthSession(sessionToken: string) {
  try {
    const result = await db
      .select()
      .from(claudeAuthSessions)
      .where(
        and(
          eq(claudeAuthSessions.sessionToken, sessionToken),
          eq(claudeAuthSessions.isActive, true)
        )
      );

    if (!result[0]) {
      return { success: false, error: 'Session not found or expired' };
    }

    // Check if expired
    if (result[0].expiresAt < new Date()) {
      await deactivateClaudeAuthSession(result[0].id);
      return { success: false, error: 'Session expired' };
    }

    return { success: true, session: result[0] };
  } catch (error) {
    console.error('Failed to get Claude auth session:', error);
    return { success: false, error: 'Failed to retrieve session' };
  }
}

export async function getActiveSessions(userId: string) {
  try {
    const sessions = await db
      .select()
      .from(claudeAuthSessions)
      .where(
        and(
          eq(claudeAuthSessions.userId, userId),
          eq(claudeAuthSessions.isActive, true)
        )
      );

    // Filter out expired sessions
    const activeSessions = sessions.filter((s) => s.expiresAt > new Date());

    return { success: true, sessions: activeSessions };
  } catch (error) {
    console.error('Failed to get active sessions:', error);
    return { success: false, sessions: [] };
  }
}

export async function deactivateClaudeAuthSession(sessionId: string) {
  try {
    await db
      .update(claudeAuthSessions)
      .set({ isActive: false })
      .where(eq(claudeAuthSessions.id, sessionId));

    return { success: true };
  } catch (error) {
    console.error('Failed to deactivate session:', error);
    return { success: false, error: 'Failed to deactivate session' };
  }
}

export async function logoutAllDevices(userId: string) {
  try {
    await db
      .update(claudeAuthSessions)
      .set({ isActive: false })
      .where(eq(claudeAuthSessions.userId, userId));

    return { success: true };
  } catch (error) {
    console.error('Failed to logout all devices:', error);
    return { success: false, error: 'Failed to logout' };
  }
}

export async function linkClaudeAuth(
  userId: string,
  claudeAuthId: string,
  firebaseUid?: string
) {
  try {
    const id = uuidv4();

    const result = await db
      .insert(authLinkedAccounts)
      .values({
        id,
        userId,
        firebaseUid: firebaseUid || null,
        claudeAuthId,
        migrationStatus: 'PENDING',
      })
      .returning();

    return { success: true, linkedAccount: result[0] };
  } catch (error) {
    console.error('Failed to link Claude auth:', error);
    return { success: false, error: 'Failed to link account' };
  }
}

export async function getLinkedAccount(userId: string) {
  try {
    const result = await db
      .select()
      .from(authLinkedAccounts)
      .where(eq(authLinkedAccounts.userId, userId));

    return { success: true, linkedAccount: result[0] || null };
  } catch (error) {
    console.error('Failed to get linked account:', error);
    return { success: false, linkedAccount: null };
  }
}

export async function migrateToClaudeAuth(
  userId: string,
  claudeAuthId: string
) {
  try {
    // Get or create linked account
    const existing = await getLinkedAccount(userId);

    if (existing.linkedAccount) {
      // Update existing
      await db
        .update(authLinkedAccounts)
        .set({
          claudeAuthId,
          migrationStatus: 'MIGRATED',
          migratedAt: new Date(),
        })
        .where(eq(authLinkedAccounts.userId, userId));
    } else {
      // Create new
      await linkClaudeAuth(userId, claudeAuthId);

      await db
        .update(authLinkedAccounts)
        .set({
          migrationStatus: 'MIGRATED',
          migratedAt: new Date(),
        })
        .where(eq(authLinkedAccounts.userId, userId));
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to migrate to Claude auth:', error);
    return { success: false, error: 'Failed to migrate' };
  }
}

export async function syncDeviceAuth(sessionToken: string) {
  try {
    const session = await getClaudeAuthSession(sessionToken);

    if (!session.success) {
      return { success: false, error: session.error };
    }

    // Update last used time
    await db
      .update(claudeAuthSessions)
      .set({ lastUsedAt: new Date() })
      .where(eq(claudeAuthSessions.id, session.session.id));

    // Get user info
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.uid, session.session.userId));

    return {
      success: true,
      user: userResult[0] || null,
      sessionId: session.session.id,
    };
  } catch (error) {
    console.error('Failed to sync device auth:', error);
    return { success: false, error: 'Failed to sync' };
  }
}
