'use server';

import { db } from '@/lib/db';
import { partyUsers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// ============================================
// GET CURRENT USER PROFILE
// ============================================
export async function getCurrentProfileAction() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('partyUserId')?.value;
    
    if (!userId) return null;
    
    const user = await db.query.partyUsers.findFirst({
      where: eq(partyUsers.id, userId),
    });
    
    return user || null;
  } catch (error) {
    console.error('Failed to get profile:', error);
    return null;
  }
}

// ============================================
// UPDATE USER PROFILE
// ============================================
export async function updateProfileAction(data: {
  displayName?: string;
  avatarEmoji?: string;
  bio?: string;
  favoriteColor?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('partyUserId')?.value;
    
    if (!userId) {
      return { success: false, error: 'Not logged in' };
    }
    
    await db.update(partyUsers)
      .set({
        displayName: data.displayName,
        avatarEmoji: data.avatarEmoji,
        bio: data.bio,
        favoriteColor: data.favoriteColor,
        updatedAt: new Date(),
      })
      .where(eq(partyUsers.id, userId));
    
    // Update cookie with new name
    if (data.displayName) {
      const cookieStore = await cookies();
      cookieStore.set('partyUserName', data.displayName, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }
    
    revalidatePath('/party/dashboard');
    revalidatePath('/party/profile');
    
    return { success: true };
  } catch (error) {
    console.error('Failed to update profile:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}

// ============================================
// AVATAR EMOJI OPTIONS
// ============================================
export const AVATAR_EMOJIS = [
  '😎', '🤠', '👻', '🎃', '🤖', '👽', '🦸', '🧙',
  '🐱', '🐶', '🦊', '🦁', '🐼', '🐨', '🦄', '🐸',
  '🎮', '🎯', '🎸', '🎪', '🚀', '⚡', '🔥', '💎',
];

// ============================================
// COLOR OPTIONS
// ============================================
export const COLOR_OPTIONS = [
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'red', label: 'Red', class: 'bg-red-500' },
  { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'cyan', label: 'Cyan', class: 'bg-cyan-500' },
];
