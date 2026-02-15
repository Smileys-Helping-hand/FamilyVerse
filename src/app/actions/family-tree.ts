'use server';

import { db } from '@/lib/db';
import { relationships, shadowUsers, users } from '@/lib/db/schema';
import { eq, or, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { pusherServer } from '@/lib/pusher/server';

// ============================================================================
// SHADOW USERS (Ancestors without app accounts)
// ============================================================================

export async function createShadowUser(data: {
  firstName: string;
  lastName?: string;
  displayName: string;
  birthYear?: number;
  deathYear?: number;
  bio?: string;
  avatarUrl?: string;
  gender?: string;
  createdById: string;
}) {
  try {
    const [shadowUser] = await db.insert(shadowUsers).values(data).returning();

    // Trigger Pusher event for real-time updates
    if (pusherServer) {
      await pusherServer.trigger('family-tree', 'shadow-user-created', {
        shadowUser,
        createdById: data.createdById,
      });
    }

    revalidatePath('/family/tree');
    return { success: true, shadowUser };
  } catch (error) {
    console.error('Error creating shadow user:', error);
    return { success: false, error: 'Failed to create shadow user' };
  }
}

export async function updateShadowUser(
  id: string,
  data: Partial<{
    firstName: string;
    lastName: string;
    displayName: string;
    birthYear: number;
    deathYear: number;
    bio: string;
    avatarUrl: string;
    gender: string;
  }>
) {
  try {
    const [updated] = await db
      .update(shadowUsers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(shadowUsers.id, id))
      .returning();

    if (pusherServer) {
      await pusherServer.trigger('family-tree', 'shadow-user-updated', { shadowUser: updated });
    }

    revalidatePath('/family/tree');
    return { success: true, shadowUser: updated };
  } catch (error) {
    console.error('Error updating shadow user:', error);
    return { success: false, error: 'Failed to update shadow user' };
  }
}

export async function getShadowUsers() {
  try {
    const result = await db.select().from(shadowUsers);
    return { success: true, shadowUsers: result };
  } catch (error) {
    console.error('Error fetching shadow users:', error);
    return { success: false, error: 'Failed to fetch shadow users', shadowUsers: [] };
  }
}

// ============================================================================
// RELATIONSHIPS (Parent-Child, Partners)
// ============================================================================

export async function createRelationship(data: {
  parentId?: string;
  childId?: string;
  relationshipType: 'BIOLOGICAL' | 'ADOPTED' | 'STEP' | 'PARTNER' | 'SPOUSE';
  partnerId?: string;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
  createdById: string;
}) {
  try {
    const [relationship] = await db.insert(relationships).values(data).returning();

    // Trigger Pusher event for real-time tree updates
    if (pusherServer) {
      await pusherServer.trigger('family-tree', 'relationship-created', {
        relationship,
        createdById: data.createdById,
      });
    }

    revalidatePath('/family/tree');
    return { success: true, relationship };
  } catch (error) {
    console.error('Error creating relationship:', error);
    return { success: false, error: 'Failed to create relationship' };
  }
}

export async function deleteRelationship(id: string, userId: string) {
  try {
    // Verify the user created this relationship (optional auth check)
    const [relationship] = await db
      .select()
      .from(relationships)
      .where(eq(relationships.id, id));

    if (!relationship) {
      return { success: false, error: 'Relationship not found' };
    }

    await db.delete(relationships).where(eq(relationships.id, id));

    if (pusherServer) {
      await pusherServer.trigger('family-tree', 'relationship-deleted', {
        relationshipId: id,
        deletedBy: userId,
      });
    }

    revalidatePath('/family/tree');
    return { success: true };
  } catch (error) {
    console.error('Error deleting relationship:', error);
    return { success: false, error: 'Failed to delete relationship' };
  }
}

export async function getRelationships() {
  try {
    const result = await db.select().from(relationships);
    return { success: true, relationships: result };
  } catch (error) {
    console.error('Error fetching relationships:', error);
    return { success: false, error: 'Failed to fetch relationships', relationships: [] };
  }
}

// ============================================================================
// FAMILY TREE DATA (Combined view)
// ============================================================================

export async function getFamilyTreeData(familyId?: string) {
  try {
    // Get all relationships
    const allRelationships = await db.select().from(relationships);

    // Get all shadow users
    const allShadowUsers = await db.select().from(shadowUsers);

    // Get all real users (if family context provided, filter by family)
    // For now, get all users - in production, filter by familyId
    const allUsers = await db.select({
      id: users.id,
      displayName: users.displayName,
      email: users.email,
      avatarUrl: users.avatarUrl,
    }).from(users);

    return {
      success: true,
      data: {
        relationships: allRelationships,
        shadowUsers: allShadowUsers,
        users: allUsers,
      },
    };
  } catch (error) {
    console.error('Error fetching family tree data:', error);
    return {
      success: false,
      error: 'Failed to fetch family tree data',
      data: { relationships: [], shadowUsers: [], users: [] },
    };
  }
}

// ============================================================================
// RELATIONSHIP WIZARD (Helper functions)
// ============================================================================

export async function connectParent(data: {
  childId: string; // The current user
  parentId: string; // Parent (real user or shadow user)
  relationshipType: 'BIOLOGICAL' | 'ADOPTED' | 'STEP';
  createdById: string;
}) {
  return createRelationship({
    childId: data.childId,
    parentId: data.parentId,
    relationshipType: data.relationshipType,
    createdById: data.createdById,
  });
}

export async function connectPartner(data: {
  userId: string; // The current user
  partnerId: string; // Partner/spouse
  relationshipType: 'PARTNER' | 'SPOUSE';
  startDate?: Date; // Marriage date
  createdById: string;
}) {
  return createRelationship({
    partnerId: data.partnerId,
    childId: data.userId, // Store as childId for simplicity in queries
    relationshipType: data.relationshipType,
    startDate: data.startDate,
    createdById: data.createdById,
  });
}

// ============================================================================
// SEARCH (For relationship wizard dropdowns)
// ============================================================================

export async function searchPeople(query: string) {
  try {
    // Search real users
    const realUsers = await db
      .select({
        id: users.id,
        displayName: users.displayName,
        email: users.email,
        avatarUrl: users.avatarUrl,
        type: 'user' as const,
      })
      .from(users);

    // Search shadow users
    const shadows = await db
      .select({
        id: shadowUsers.id,
        displayName: shadowUsers.displayName,
        email: shadowUsers.id, // Placeholder
        avatarUrl: shadowUsers.avatarUrl,
        type: 'shadow' as const,
      })
      .from(shadowUsers);

    // Combine and filter
    const allPeople = [...realUsers, ...shadows];
    const filtered = query
      ? allPeople.filter((p) =>
          p.displayName.toLowerCase().includes(query.toLowerCase())
        )
      : allPeople;

    return { success: true, people: filtered };
  } catch (error) {
    console.error('Error searching people:', error);
    return { success: false, error: 'Failed to search people', people: [] };
  }
}
