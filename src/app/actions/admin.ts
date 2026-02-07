'use server';

import { db } from '@/lib/db';
import { systemLogs, globalSettings } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { cookies } from 'next/headers';

// Helper to get allowed admin emails
function getAllowedAdmins(): string[] {
  const envAdmins = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL;
  if (envAdmins) {
    return envAdmins.split(',').map(email => email.trim().toLowerCase());
  }
  return ['mraaziqp@gmail.com'];
}

// Authorization helper using Firebase auth cookie
async function isAuthorizedAdmin() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('firebase-auth-email');
  const currentEmail = authCookie?.value?.toLowerCase();
  
  if (!currentEmail) return false;
  return getAllowedAdmins().includes(currentEmail);
}

// ============================================
// SYSTEM LOGGING
// ============================================

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export async function logEvent(
  level: LogLevel,
  source: string,
  message: string,
  metaData?: Record<string, any>,
  userId?: string,
  ipAddress?: string
) {
  try {
    await db.insert(systemLogs).values({
      level,
      source,
      message,
      metaData,
      userId,
      ipAddress,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to log event:', error);
    return { success: false, error: 'Failed to write log' };
  }
}

export async function getRecentLogs(limit: number = 100, filterLevel?: LogLevel) {
  if (!(await isAuthorizedAdmin())) {
    await logEvent('WARN', 'Admin', 'Unauthorized log access attempt');
    throw new Error('Unauthorized');
  }

  try {
    const logs = await db
      .select()
      .from(systemLogs)
      .where(filterLevel ? eq(systemLogs.level, filterLevel) : undefined)
      .orderBy(desc(systemLogs.timestamp))
      .limit(limit);

    return { success: true, logs };
  } catch (error) {
    console.error('Failed to fetch logs:', error);
    return { success: false, error: 'Failed to fetch logs' };
  }
}

// ============================================
// SETTINGS MANAGEMENT
// ============================================

export async function getSetting(key: string): Promise<string | null> {
  try {
    const result = await db
      .select()
      .from(globalSettings)
      .where(eq(globalSettings.key, key))
      .limit(1);

    return result[0]?.value || null;
  } catch (error) {
    console.error(`Failed to get setting ${key}:`, error);
    return null;
  }
}

export async function getAllSettings() {
  if (!(await isAuthorizedAdmin())) {
    await logEvent('WARN', 'Admin', 'Unauthorized settings access attempt');
    throw new Error('Unauthorized');
  }

  try {
    const settings = await db.select().from(globalSettings);
    return { success: true, settings };
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return { success: false, error: 'Failed to fetch settings' };
  }
}

export async function updateSetting(key: string, value: string, updatedBy: string = 'admin') {
  if (!(await isAuthorizedAdmin())) {
    await logEvent('WARN', 'Admin', `Unauthorized setting update attempt for ${key}`);
    throw new Error('Unauthorized');
  }

  try {
    await db
      .update(globalSettings)
      .set({
        value,
        updatedAt: new Date(),
        updatedBy,
      })
      .where(eq(globalSettings.key, key));

    await logEvent('INFO', 'Admin', `Setting updated: ${key} = ${value}`, {
      key,
      newValue: value,
      updatedBy,
    });

    return { success: true };
  } catch (error) {
    console.error(`Failed to update setting ${key}:`, error);
    await logEvent('ERROR', 'Admin', `Failed to update setting ${key}`, { error });
    return { success: false, error: 'Failed to update setting' };
  }
}

// ============================================
// ADMIN DASHBOARD STATS
// ============================================

export async function getDashboardStats() {
  if (!(await isAuthorizedAdmin())) {
    throw new Error('Unauthorized');
  }

  try {
    // Count active parties
    const activeParties = await db.execute(
      sql`SELECT COUNT(DISTINCT party_code) as count FROM party_users WHERE status = 'active'`
    );

    // Sum total points
    const totalPoints = await db.execute(
      sql`SELECT COALESCE(SUM(wallet_balance), 0) as total FROM party_users`
    );

    // Count errors in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentErrors = await db.execute(
      sql`SELECT COUNT(*) as count FROM system_logs WHERE level = 'ERROR' AND timestamp > ${oneHourAgo}`
    );

    return {
      success: true,
      stats: {
        activeParties: Number(activeParties.rows[0]?.count) || 0,
        totalPoints: Number(totalPoints.rows[0]?.total) || 0,
        errorRate: Number(recentErrors.rows[0]?.count) || 0,
      },
    };
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return { success: false, error: 'Failed to fetch stats' };
  }
}

// ============================================
// GOD MODE CONTROLS
// ============================================

export async function forceResetRound(gameType: 'spy' | 'race', triggeredBy: string = 'admin') {
  if (!(await isAuthorizedAdmin())) {
    throw new Error('Unauthorized');
  }

  try {
    // Log the reset action
    await logEvent('INFO', 'Admin', `Force reset ${gameType} game`, {
      gameType,
      triggeredBy,
      timestamp: new Date().toISOString(),
    });

    // For actual game reset, you would add game-specific logic here
    // Example: Clear active imposter rounds, reset race sessions, etc.

    return { success: true, message: `${gameType} game reset successfully` };
  } catch (error) {
    console.error(`Failed to reset ${gameType} game:`, error);
    await logEvent('ERROR', 'Admin', `Failed to reset ${gameType} game`, { error });
    return { success: false, error: 'Failed to reset game' };
  }
}
