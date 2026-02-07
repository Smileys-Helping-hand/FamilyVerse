'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { inArray } from 'drizzle-orm';
import {
  createGroup,
  getGroup,
  getUserGroups,
  joinGroup,
  getChecklistItems,
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  getRecommendations,
  addRecommendation,
  voteRecommendation,
  deleteRecommendation,
} from '@/lib/firebase/groups';

export async function createGroupAction(params: {
  name: string;
  description: string;
  type: 'trip' | 'event' | 'project' | 'other';
  creatorId: string;
  memberIds: string[];
  startDate?: Date;
  endDate?: Date;
  location?: string;
}) {
  try {
    const group = await createGroup({
      ...params,
    });
    return { success: true, group };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create group',
    };
  }
}

export async function joinGroupAction(joinCode: string, userId: string, userName: string, userEmail: string) {
  try {
    const group = await joinGroup(joinCode, userId, userName, userEmail);
    return { success: true, group };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to join group',
    };
  }
}

export async function getUserGroupsAction(userId: string) {
  try {
    const groups = await getUserGroups(userId);
    return { success: true, groups };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load groups',
    };
  }
}

export async function getGroupDetailsAction(groupId: string) {
  try {
    const group = await getGroup(groupId);
    if (!group) {
      return { success: false, error: 'Group not found' };
    }

    const [items, recs] = await Promise.all([
      getChecklistItems(groupId),
      getRecommendations(groupId),
    ]);

    const memberIds = (group.memberIds as string[]) || [];
    const memberRows = memberIds.length
      ? await db.select().from(users).where(inArray(users.uid, memberIds))
      : [];

    const members = memberIds.map((memberId) => {
      const user = memberRows.find(
        (row: { uid: string; name: string | null; email: string }) => row.uid === memberId
      );
      return {
        userId: memberId,
        userName: user?.name || user?.email || memberId,
        email: user?.email || '',
        role: memberId === group.creatorId ? 'admin' : 'member',
        joinedAt: group.createdAt,
      };
    });

    return {
      success: true,
      group,
      members,
      checklistItems: items,
      recommendations: recs,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load group',
    };
  }
}

export async function addChecklistItemAction(input: {
  groupId: string;
  title: string;
  description?: string;
  category: 'packing' | 'todo' | 'shopping' | 'other';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdBy: string;
}) {
  try {
    const id = await addChecklistItem({
      ...input,
      completed: false,
    });
    return { success: true, id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add item',
    };
  }
}

export async function updateChecklistItemAction(itemId: string, updates: {
  completed?: boolean;
  completedAt?: Date;
  completedBy?: string;
}) {
  try {
    await updateChecklistItem(itemId, updates);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update item',
    };
  }
}

export async function deleteChecklistItemAction(itemId: string) {
  try {
    await deleteChecklistItem(itemId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete item',
    };
  }
}

export async function addRecommendationAction(input: {
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
    const id = await addRecommendation(input);
    return { success: true, id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add recommendation',
    };
  }
}

export async function voteRecommendationAction(recId: string, userId: string, vote: 'up' | 'down') {
  try {
    await voteRecommendation(recId, userId, vote);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to vote',
    };
  }
}

export async function deleteRecommendationAction(recId: string) {
  try {
    await deleteRecommendation(recId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete recommendation',
    };
  }
}
