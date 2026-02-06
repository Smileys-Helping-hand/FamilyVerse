'use server';

import { db } from '@/lib/db';
import { users, families, familyMembers, activityLog } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateJoinCode } from '@/lib/utils';

/**
 * Get or create user profile in PostgreSQL
 */
export async function getOrCreateUserAction(uid: string, email: string, name?: string) {
  // Try to get existing user
  const existingUser = await db.query.users.findFirst({
    where: eq(users.uid, uid),
  });

  if (existingUser) {
    return existingUser;
  }

  // Create new user
  const [newUser] = await db.insert(users).values({
    uid,
    email,
    name: name || email.split('@')[0],
    familyId: null,
    familyName: null,
    role: null,
  }).returning();

  return newUser;
}

/**
 * Get user by UID
 */
export async function getUserByUidAction(uid: string) {
  return await db.query.users.findFirst({
    where: eq(users.uid, uid),
  });
}

/**
 * Create a new family
 */
export async function createFamilyAction(familyName: string, creatorUid: string, creatorName: string) {
  const familyId = `family_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const joinCode = generateJoinCode();

  // Create family
  const [family] = await db.insert(families).values({
    id: familyId,
    name: familyName,
    creatorId: creatorUid,
    joinCode,
  }).returning();

  // Update user with family info
  await db.update(users)
    .set({
      familyId: family.id,
      familyName: family.name,
      role: 'admin',
      updatedAt: new Date(),
    })
    .where(eq(users.uid, creatorUid));

  // Add creator as first family member
  await db.insert(familyMembers).values({
    familyId: family.id,
    userId: creatorUid,
    name: creatorName,
    role: 'admin',
    addedBy: creatorUid,
  });

  // Log activity
  await db.insert(activityLog).values({
    familyId: family.id,
    user: creatorName,
    action: 'created_family',
    details: `Family "${familyName}" was created.`,
  });

  return family;
}

/**
 * Join existing family by join code
 */
export async function joinFamilyAction(joinCode: string, userUid: string, userName: string) {
  // Find family by join code
  const family = await db.query.families.findFirst({
    where: eq(families.joinCode, joinCode.toUpperCase()),
  });

  if (!family) {
    throw new Error('Invalid join code. Please check and try again.');
  }

  // Update user with family info
  await db.update(users)
    .set({
      familyId: family.id,
      familyName: family.name,
      role: 'member',
      updatedAt: new Date(),
    })
    .where(eq(users.uid, userUid));

  // Add user as family member
  await db.insert(familyMembers).values({
    familyId: family.id,
    userId: userUid,
    name: userName,
    role: 'member',
    addedBy: userUid,
  });

  // Log activity
  await db.insert(activityLog).values({
    familyId: family.id,
    user: userName,
    action: 'joined_family',
    details: `${userName} joined the family.`,
  });

  return family;
}

/**
 * Get family by ID
 */
export async function getFamilyByIdAction(familyId: string) {
  return await db.query.families.findFirst({
    where: eq(families.id, familyId),
  });
}
