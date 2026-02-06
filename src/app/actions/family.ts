'use server';

import { db } from '@/lib/db';
import { familyMembers, activityLog } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

/**
 * Get all family members for a family
 */
export async function getFamilyMembersAction(familyId: string) {
  return await db.query.familyMembers.findMany({
    where: eq(familyMembers.familyId, familyId),
    orderBy: desc(familyMembers.createdAt),
  });
}

/**
 * Get activity log for a family
 */
export async function getActivityLogAction(familyId: string, limit: number = 10) {
  return await db.query.activityLog.findMany({
    where: eq(activityLog.familyId, familyId),
    orderBy: desc(activityLog.timestamp),
    limit,
  });
}

/**
 * Get family stats
 */
export async function getFamilyStatsAction(familyId: string) {
  const members = await getFamilyMembersAction(familyId);
  
  const totalMembers = members.length;
  const generations = new Set<number>();
  const relationships = members.reduce((count, member) => {
    return count + (member.spouses?.length || 0) + (member.parents?.length || 0);
  }, 0) / 2; // Divide by 2 to avoid counting relationships twice
  
  const children = members.filter(member => {
    const birthDate = member.birthDate;
    if (!birthDate) return false;
    const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
    return age < 18;
  }).length;

  return {
    totalMembers,
    generations: Math.max(1, Math.ceil(totalMembers / 3)), // Rough estimate
    relationships: Math.floor(relationships),
    children,
  };
}

/**
 * Add a family member
 */
export async function addFamilyMemberAction(
  familyId: string,
  userId: string,
  data: {
    name: string;
    gender?: string;
    birthDate?: Date;
    photoUrl?: string;
  }
) {
  const [member] = await db.insert(familyMembers).values({
    familyId,
    userId: userId || `member_${Date.now()}`,
    name: data.name,
    role: 'member',
    gender: data.gender,
    birthDate: data.birthDate,
    photoUrl: data.photoUrl,
    addedBy: userId,
  }).returning();

  // Log activity
  await db.insert(activityLog).values({
    familyId,
    user: data.name,
    action: 'member_added',
    details: `${data.name} was added to the family.`,
  });

  return member;
}

/**
 * Get upcoming birthdays and events
 */
export async function getUpcomingEventsAction(familyId: string) {
  const members = await getFamilyMembersAction(familyId);
  const today = new Date();
  const events: Array<{
    id: string;
    type: 'birthday' | 'anniversary';
    title: string;
    person: string;
    date: Date;
    daysUntil: number;
  }> = [];

  members.forEach(member => {
    if (member.birthDate) {
      const birthDate = new Date(member.birthDate);
      const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      
      if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
      }

      const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntil <= 60) {
        events.push({
          id: `birthday_${member.id}`,
          type: 'birthday',
          title: `${member.name}'s Birthday`,
          person: member.name,
          date: nextBirthday,
          daysUntil,
        });
      }
    }
  });

  return events.sort((a, b) => a.daysUntil - b.daysUntil);
}
