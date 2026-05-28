'use server';

import { db } from './index';
import {
  appIntegrations,
  appIntegrationLogs,
  type NewAppIntegration,
  type NewAppIntegrationLog,
} from './schema';
import { eq, and, desc } from 'drizzle-orm';
import { encryptCredentials, decryptCredentials, generateSecureToken } from '@/lib/encryption';
import { v4 as uuidv4 } from 'uuid';

export async function createAppIntegration(
  userId: string,
  appId: string,
  appName: string,
  credentials: string,
  metadata?: Record<string, any>
) {
  try {
    const id = uuidv4();
    const encrypted = encryptCredentials(credentials);
    const storedCredentials = JSON.stringify(encrypted);

    const result = await db
      .insert(appIntegrations)
      .values({
        id,
        userId,
        appId,
        appName,
        credentials: storedCredentials,
        isEncrypted: true,
        metadata,
        status: 'ACTIVE',
      })
      .returning();

    if (result[0]) {
      await logIntegrationAction(result[0].id, 'CREATED', { appId, appName });
    }

    return { success: true, integration: result[0] };
  } catch (error) {
    console.error('Failed to create app integration:', error);
    return { success: false, error: 'Failed to create integration' };
  }
}

export async function getAppIntegrations(userId: string) {
  try {
    const integrations = await db
      .select()
      .from(appIntegrations)
      .where(and(eq(appIntegrations.userId, userId), eq(appIntegrations.status, 'ACTIVE')))
      .orderBy(desc(appIntegrations.createdAt));

    return { success: true, integrations };
  } catch (error) {
    console.error('Failed to get app integrations:', error);
    return { success: false, integrations: [] };
  }
}

export async function getAppIntegration(integrationId: string) {
  try {
    const result = await db.select().from(appIntegrations).where(eq(appIntegrations.id, integrationId));

    return { success: true, integration: result[0] || null };
  } catch (error) {
    console.error('Failed to get app integration:', error);
    return { success: false, integration: null };
  }
}

export async function getDecryptedCredentials(integrationId: string): Promise<string | null> {
  try {
    const result = await db
      .select({ credentials: appIntegrations.credentials })
      .from(appIntegrations)
      .where(eq(appIntegrations.id, integrationId));

    if (!result[0]) return null;

    const encrypted = JSON.parse(result[0].credentials);
    return decryptCredentials(encrypted);
  } catch (error) {
    console.error('Failed to decrypt credentials:', error);
    return null;
  }
}

export async function updateAppIntegration(
  integrationId: string,
  updates: { credentials?: string; metadata?: Record<string, any>; expiresAt?: Date }
) {
  try {
    const updateData: any = {};

    if (updates.credentials) {
      const encrypted = encryptCredentials(updates.credentials);
      updateData.credentials = JSON.stringify(encrypted);
    }

    if (updates.metadata) {
      updateData.metadata = updates.metadata;
    }

    if (updates.expiresAt) {
      updateData.expiresAt = updates.expiresAt;
    }

    updateData.updatedAt = new Date();

    const result = await db
      .update(appIntegrations)
      .set(updateData)
      .where(eq(appIntegrations.id, integrationId))
      .returning();

    await logIntegrationAction(integrationId, 'ACCESSED', {});

    return { success: true, integration: result[0] };
  } catch (error) {
    console.error('Failed to update app integration:', error);
    return { success: false, error: 'Failed to update integration' };
  }
}

export async function revokeAppIntegration(integrationId: string) {
  try {
    const result = await db
      .update(appIntegrations)
      .set({ status: 'REVOKED', updatedAt: new Date() })
      .where(eq(appIntegrations.id, integrationId))
      .returning();

    await logIntegrationAction(integrationId, 'REVOKED', {});

    return { success: true };
  } catch (error) {
    console.error('Failed to revoke app integration:', error);
    return { success: false, error: 'Failed to revoke integration' };
  }
}

export async function testAppIntegration(integrationId: string) {
  try {
    const integration = await getAppIntegration(integrationId);

    if (!integration.integration) {
      return { success: false, error: 'Integration not found' };
    }

    const credentials = await getDecryptedCredentials(integrationId);
    if (!credentials) {
      return { success: false, error: 'Failed to decrypt credentials' };
    }

    // Update lastUsedAt
    await db
      .update(appIntegrations)
      .set({ lastUsedAt: new Date() })
      .where(eq(appIntegrations.id, integrationId));

    await logIntegrationAction(integrationId, 'ACCESSED', { tested: true });

    // TODO: Implement actual API validation based on appId
    return { success: true, message: 'Integration test completed' };
  } catch (error) {
    console.error('Failed to test app integration:', error);
    await logIntegrationAction(integrationId, 'FAILED', { error: String(error) });
    return { success: false, error: 'Failed to test integration' };
  }
}

export async function logIntegrationAction(
  integrationId: string,
  action: string,
  details: Record<string, any> = {}
) {
  try {
    await db.insert(appIntegrationLogs).values({
      id: uuidv4(),
      integrationId,
      action,
      details,
    });
  } catch (error) {
    console.error('Failed to log integration action:', error);
  }
}

export async function getIntegrationLogs(integrationId: string) {
  try {
    const logs = await db
      .select()
      .from(appIntegrationLogs)
      .where(eq(appIntegrationLogs.integrationId, integrationId))
      .orderBy(desc(appIntegrationLogs.createdAt));

    return { success: true, logs };
  } catch (error) {
    console.error('Failed to get integration logs:', error);
    return { success: false, logs: [] };
  }
}
