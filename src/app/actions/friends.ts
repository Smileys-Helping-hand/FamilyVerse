'use server';

import { db } from '@/lib/db';
import { friends, apiKeys } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function addFriendAction(data: { userId: string, friendName: string, friendEmail?: string, avatarEmoji?: string, apiKey?: string, externalAppUrl?: string }) {
  try {
    await db.insert(friends).values({
      userId: data.userId,
      friendName: data.friendName,
      friendEmail: data.friendEmail,
      avatarEmoji: data.avatarEmoji || '😎',
      apiKey: data.apiKey,
      externalAppUrl: data.externalAppUrl,
      status: 'ACTIVE',
    });
    revalidatePath('/friends');
    return { success: true };
  } catch (error: any) {
    console.error('Error adding friend:', error);
    return { success: false, error: error.message };
  }
}

export async function getFriendsAction(userId: string) {
  try {
    const userFriends = await db.select().from(friends).where(eq(friends.userId, userId));
    return { success: true, friends: userFriends };
  } catch (error: any) {
    console.error('Error fetching friends:', error);
    return { success: false, error: error.message };
  }
}

export async function syncCrossAppFriendsAction(userId: string, externalUrl: string, apiKey: string) {
  try {
    // 1. Fetch from the external API
    const response = await fetch(`${externalUrl}/api/friends/export?apiKey=${apiKey}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from external app. Status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success || !result.contacts) {
      throw new Error('Invalid response format from external app');
    }

    // 2. Map contacts and insert into local DB
    for (const contact of result.contacts) {
      const existing = await db.select().from(friends).where(
        and(eq(friends.userId, userId), eq(friends.friendName, contact.name))
      );

      if (existing.length === 0) {
        await db.insert(friends).values({
          userId: userId,
          friendName: contact.name,
          friendEmail: contact.email,
          avatarEmoji: contact.emoji || '😎',
          externalAppUrl: externalUrl,
          status: 'ACTIVE',
        });
      }
    }
    
    revalidatePath('/friends');
    return { success: true, count: result.contacts.length };
  } catch (error: any) {
    console.error('Error syncing cross app friends:', error);
    return { success: false, error: error.message };
  }
}
