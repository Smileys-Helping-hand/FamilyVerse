'use server';

import { db } from '@/lib/db';
import { apiKeys } from '@/lib/db/apiKeys';
import { eq, desc } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';
import { logEvent } from '@/app/actions/admin';

export async function getApiKeys() {
  const cookieStore = await cookies();
  const email = cookieStore.get('firebase-auth-email')?.value;
  if (email !== 'mraaziqp@gmail.com') return [];
  try {
    const keys = await db.select().from(apiKeys).orderBy(desc(apiKeys.createdAt));
    return keys;
  } catch {
    return [];
  }
}

export async function createApiKey() {
  const cookieStore = await cookies();
  const email = cookieStore.get('firebase-auth-email')?.value;
  if (email !== 'mraaziqp@gmail.com') return null;
  try {
    const key = randomBytes(32).toString('hex');
    const result = await db.insert(apiKeys).values({ key, createdAt: new Date(), status: 'active', createdBy: email }).returning();
    await logEvent('INFO', 'APIKey', `Created new API key`, { keyId: result[0].id, createdBy: email });
    return result[0];
  } catch (error) {
    console.error('Failed to create API key:', error);
    return null;
  }
}

export async function revokeApiKey(id: number) {
  const cookieStore = await cookies();
  const email = cookieStore.get('firebase-auth-email')?.value;
  if (email !== 'mraaziqp@gmail.com') return false;
  try {
    await db.update(apiKeys).set({ status: 'revoked' }).where(eq(apiKeys.id, id));
    await logEvent('INFO', 'APIKey', `Revoked API key`, { keyId: id, revokedBy: email });
    return true;
  } catch (error) {
    console.error('Failed to revoke API key:', error);
    return false;
  }
}
