'use server';

import { db } from '@/lib/db';
import { heritageItems } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { pusherServer } from '@/lib/pusher/server';

// ============================================================================
// HERITAGE ITEMS (Recipes, Stories, Traditions)
// ============================================================================

export async function createHeritageItem(data: {
  title: string;
  type: 'RECIPE' | 'STORY' | 'TRADITION' | 'PHOTO' | 'VIDEO';
  content: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  contributorId: string;
  contributorName: string;
  visibility?: 'PUBLIC' | 'FAMILY_ONLY' | 'PRIVATE';
  familyId?: string;
  // Recipe-specific
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  ingredients?: Array<{ item: string; amount: string }>;
  steps?: string[];
  // Story-specific
  storyDate?: Date;
  tags?: string[];
}) {
  try {
    const [item] = await db
      .insert(heritageItems)
      .values({
        ...data,
        visibility: data.visibility || 'FAMILY_ONLY',
        likes: 0,
        likedBy: [],
        views: 0,
      })
      .returning();

    // Trigger Pusher event
    if (pusherServer) {
      await pusherServer.trigger('heritage-vault', 'item-created', {
        item,
        contributorId: data.contributorId,
      });
    }

    revalidatePath('/family/heritage');
    return { success: true, item };
  } catch (error) {
    console.error('Error creating heritage item:', error);
    return { success: false, error: 'Failed to create heritage item' };
  }
}

export async function getHeritageItems(filters?: {
  type?: 'RECIPE' | 'STORY' | 'TRADITION' | 'PHOTO' | 'VIDEO';
  familyId?: string;
  visibility?: 'PUBLIC' | 'FAMILY_ONLY' | 'PRIVATE';
}) {
  try {
    let query = db.select().from(heritageItems).orderBy(desc(heritageItems.createdAt));

    // Apply filters (basic implementation - can be enhanced)
    const items = await query;

    // Filter in memory for now (optimize with WHERE clauses in production)
    let filtered = items;
    if (filters?.type) {
      filtered = filtered.filter((i) => i.type === filters.type);
    }
    if (filters?.familyId) {
      filtered = filtered.filter((i) => i.familyId === filters.familyId);
    }

    return { success: true, items: filtered };
  } catch (error) {
    console.error('Error fetching heritage items:', error);
    return { success: false, error: 'Failed to fetch heritage items', items: [] };
  }
}

export async function getHeritageItem(id: string) {
  try {
    const [item] = await db
      .select()
      .from(heritageItems)
      .where(eq(heritageItems.id, id));

    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    // Increment view count
    await db
      .update(heritageItems)
      .set({ views: item.views + 1 })
      .where(eq(heritageItems.id, id));

    return { success: true, item };
  } catch (error) {
    console.error('Error fetching heritage item:', error);
    return { success: false, error: 'Failed to fetch heritage item' };
  }
}

export async function updateHeritageItem(
  id: string,
  userId: string,
  data: Partial<{
    title: string;
    content: string;
    mediaUrl: string;
    thumbnailUrl: string;
    visibility: 'PUBLIC' | 'FAMILY_ONLY' | 'PRIVATE';
    prepTime: number;
    cookTime: number;
    servings: number;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    ingredients: Array<{ item: string; amount: string }>;
    steps: string[];
    storyDate: Date;
    tags: string[];
  }>
) {
  try {
    // Verify ownership
    const [existing] = await db
      .select()
      .from(heritageItems)
      .where(eq(heritageItems.id, id));

    if (!existing) {
      return { success: false, error: 'Item not found' };
    }

    if (existing.contributorId !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const [updated] = await db
      .update(heritageItems)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(heritageItems.id, id))
      .returning();

    if (pusherServer) {
      await pusherServer.trigger('heritage-vault', 'item-updated', { item: updated });
    }

    revalidatePath('/family/heritage');
    return { success: true, item: updated };
  } catch (error) {
    console.error('Error updating heritage item:', error);
    return { success: false, error: 'Failed to update heritage item' };
  }
}

export async function deleteHeritageItem(id: string, userId: string) {
  try {
    // Verify ownership
    const [existing] = await db
      .select()
      .from(heritageItems)
      .where(eq(heritageItems.id, id));

    if (!existing) {
      return { success: false, error: 'Item not found' };
    }

    if (existing.contributorId !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    await db.delete(heritageItems).where(eq(heritageItems.id, id));

    if (pusherServer) {
      await pusherServer.trigger('heritage-vault', 'item-deleted', { itemId: id });
    }

    revalidatePath('/family/heritage');
    return { success: true };
  } catch (error) {
    console.error('Error deleting heritage item:', error);
    return { success: false, error: 'Failed to delete heritage item' };
  }
}

export async function likeHeritageItem(id: string, userId: string) {
  try {
    const [item] = await db
      .select()
      .from(heritageItems)
      .where(eq(heritageItems.id, id));

    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    const likedBy = (item.likedBy as string[]) || [];
    const hasLiked = likedBy.includes(userId);

    const newLikedBy = hasLiked
      ? likedBy.filter((id) => id !== userId)
      : [...likedBy, userId];

    const [updated] = await db
      .update(heritageItems)
      .set({
        likes: hasLiked ? item.likes - 1 : item.likes + 1,
        likedBy: newLikedBy,
      })
      .where(eq(heritageItems.id, id))
      .returning();

    if (pusherServer) {
      await pusherServer.trigger('heritage-vault', 'item-liked', {
        itemId: id,
        userId,
        action: hasLiked ? 'unlike' : 'like',
      });
    }

    revalidatePath('/family/heritage');
    return { success: true, item: updated };
  } catch (error) {
    console.error('Error liking heritage item:', error);
    return { success: false, error: 'Failed to like heritage item' };
  }
}

// ============================================================================
// RECIPE-SPECIFIC FUNCTIONS
// ============================================================================

export async function getRecipes(familyId?: string) {
  return getHeritageItems({ type: 'RECIPE', familyId });
}

export async function importRecipeToEvent(recipeId: string, eventId: string) {
  try {
    const [recipe] = await db
      .select()
      .from(heritageItems)
      .where(eq(heritageItems.id, recipeId));

    if (!recipe || recipe.type !== 'RECIPE') {
      return { success: false, error: 'Recipe not found' };
    }

    // The menu tab can now fetch recipes from the heritage vault
    // Store the recipeId in the menuItem for reference
    return { success: true, recipe };
  } catch (error) {
    console.error('Error importing recipe:', error);
    return { success: false, error: 'Failed to import recipe' };
  }
}

// ============================================================================
// STORY-SPECIFIC FUNCTIONS
// ============================================================================

export async function getStories(familyId?: string) {
  return getHeritageItems({ type: 'STORY', familyId });
}

export async function searchHeritageItems(query: string, type?: string) {
  try {
    const result = await getHeritageItems();
    if (!result.success) {
      return result;
    }

    // Filter by query and type
    let filtered = result.items.filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.content.toLowerCase().includes(query.toLowerCase())
    );

    if (type) {
      filtered = filtered.filter((item) => item.type === type);
    }

    return { success: true, items: filtered };
  } catch (error) {
    console.error('Error searching heritage items:', error);
    return { success: false, error: 'Failed to search heritage items', items: [] };
  }
}
