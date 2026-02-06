// Group-related Postgres operations using Neon
import { db } from '@/lib/db';
import { groups, checklistItems, recommendations } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

// Generate a random join code
function generateJoinCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Create a new group
export async function createGroup(groupData: {
  name: string;
  description: string;
  type: 'trip' | 'event' | 'project' | 'other';
  creatorId: string;
  memberIds: string[];
  startDate?: Date;
  endDate?: Date;
  location?: string;
  coverImage?: string;
}) {
  try {
    const [group] = await db
      .insert(groups)
      .values({
        ...groupData,
        joinCode: generateJoinCode(),
      })
      .returning();
    return group.id.toString();
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
}

// Get a group by ID
export async function getGroup(groupId: string) {
  try {
    const [group] = await db
      .select()
      .from(groups)
      .where(eq(groups.id, parseInt(groupId)));
    return group || null;
  } catch (error) {
    console.error('Error getting group:', error);
    throw error;
  }
}

// Get all groups for a user
export async function getUserGroups(userId: string) {
  try {
    const userGroups = await db
      .select()
      .from(groups)
      .where(sql`${groups.memberIds} @> ${JSON.stringify([userId])}`)
      .orderBy(desc(groups.createdAt));
    return userGroups;
  } catch (error) {
    console.error('Error getting user groups:', error);
    throw error;
  }
}

// Join a group with a join code
export async function joinGroup(joinCode: string, userId: string, userName: string, userEmail: string) {
  try {
    const [group] = await db
      .select()
      .from(groups)
      .where(eq(groups.joinCode, joinCode));
    
    if (!group) {
      throw new Error('Group not found');
    }

    const memberIds = group.memberIds as string[];
    if (memberIds.includes(userId)) {
      throw new Error('Already a member of this group');
    }

    await db
      .update(groups)
      .set({
        memberIds: [...memberIds, userId],
      })
      .where(eq(groups.id, group.id));

    return group.id.toString();
  } catch (error) {
    console.error('Error joining group:', error);
    throw error;
  }
}

// Checklist operations
export async function addChecklistItem(item: {
  groupId: string;
  title: string;
  description?: string;
  category: 'packing' | 'todo' | 'shopping' | 'other';
  completed?: boolean;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdBy: string;
  completedAt?: Date;
  completedBy?: string;
}) {
  try {
    const [checklistItem] = await db
      .insert(checklistItems)
      .values({
        ...item,
        groupId: parseInt(item.groupId),
        completed: item.completed ?? false,
      })
      .returning();
    return checklistItem.id.toString();
  } catch (error) {
    console.error('Error adding checklist item:', error);
    throw error;
  }
}

export async function getChecklistItems(groupId: string) {
  try {
    const items = await db
      .select()
      .from(checklistItems)
      .where(eq(checklistItems.groupId, parseInt(groupId)))
      .orderBy(desc(checklistItems.createdAt));
    return items;
  } catch (error) {
    console.error('Error getting checklist items:', error);
    throw error;
  }
}

export async function updateChecklistItem(itemId: string, updates: {
  title?: string;
  description?: string;
  category?: 'packing' | 'todo' | 'shopping' | 'other';
  completed?: boolean;
  assignedTo?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  completedAt?: Date;
  completedBy?: string;
}) {
  try {
    await db
      .update(checklistItems)
      .set(updates)
      .where(eq(checklistItems.id, parseInt(itemId)));
  } catch (error) {
    console.error('Error updating checklist item:', error);
    throw error;
  }
}

export async function deleteChecklistItem(itemId: string) {
  try {
    await db
      .delete(checklistItems)
      .where(eq(checklistItems.id, parseInt(itemId)));
  } catch (error) {
    console.error('Error deleting checklist item:', error);
    throw error;
  }
}

// Recommendation operations
export async function addRecommendation(rec: {
  groupId: string;
  type: 'activity' | 'restaurant' | 'accommodation' | 'attraction' | 'other';
  title: string;
  description: string;
  location?: string;
  url?: string;
  imageUrl?: string;
  rating?: number;
  price?: '$' | '$$' | '$$$' | '$$$$';
  notes?: string;
  suggestedBy: string;
}) {
  try {
    const [recommendation] = await db
      .insert(recommendations)
      .values({
        ...rec,
        groupId: parseInt(rec.groupId),
        votes: [],
      })
      .returning();
    return recommendation.id.toString();
  } catch (error) {
    console.error('Error adding recommendation:', error);
    throw error;
  }
}

export async function getRecommendations(groupId: string) {
  try {
    const recs = await db
      .select()
      .from(recommendations)
      .where(eq(recommendations.groupId, parseInt(groupId)))
      .orderBy(desc(recommendations.createdAt));
    return recs;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
}

export async function voteRecommendation(recId: string, userId: string, vote: 'up' | 'down') {
  try {
    const [rec] = await db
      .select()
      .from(recommendations)
      .where(eq(recommendations.id, parseInt(recId)));
    
    if (!rec) throw new Error('Recommendation not found');
    
    const votes = (rec.votes as { userId: string; vote: 'up' | 'down' }[]) || [];
    const existingVoteIndex = votes.findIndex(v => v.userId === userId);
    
    let newVotes;
    if (existingVoteIndex >= 0) {
      // Update or remove existing vote
      if (votes[existingVoteIndex].vote === vote) {
        // Remove vote if clicking the same button
        newVotes = votes.filter((_, i) => i !== existingVoteIndex);
      } else {
        // Update vote
        newVotes = [...votes];
        newVotes[existingVoteIndex] = { userId, vote };
      }
    } else {
      // Add new vote
      newVotes = [...votes, { userId, vote }];
    }
    
    await db
      .update(recommendations)
      .set({ votes: newVotes })
      .where(eq(recommendations.id, parseInt(recId)));
  } catch (error) {
    console.error('Error voting on recommendation:', error);
    throw error;
  }
}

export async function deleteRecommendation(recId: string) {
  try {
    await db
      .delete(recommendations)
      .where(eq(recommendations.id, parseInt(recId)));
  } catch (error) {
    console.error('Error deleting recommendation:', error);
    throw error;
  }
}
