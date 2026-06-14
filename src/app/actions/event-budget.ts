'use server';

import { db } from '@/lib/db';
import {
  eventBudgets,
  eventContributions,
  shoppingListItems,
  shopRecommendations,
  eventSuggestions,
} from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// ============================================
// BUDGET MANAGEMENT
// ============================================

export async function createEventBudget(
  eventId: string,
  totalBudget: number,
  perPersonAmount: number,
  description?: string
) {
  try {
    const budget = await db.insert(eventBudgets).values({
      eventId,
      totalBudget,
      perPersonAmount,
      description,
    }).returning();

    return { success: true, budget: budget[0] };
  } catch (error) {
    console.error('Error creating budget:', error);
    return { success: false, error: 'Failed to create budget' };
  }
}

export async function getEventBudget(eventId: string) {
  try {
    const budget = await db.select().from(eventBudgets).where(eq(eventBudgets.eventId, eventId));
    return { success: true, budget: budget[0] || null };
  } catch (error) {
    console.error('Error fetching budget:', error);
    return { success: false, error: 'Failed to fetch budget' };
  }
}

export async function updateEventBudget(
  budgetId: string,
  updates: Partial<{ totalBudget: number; perPersonAmount: number; description: string }>
) {
  try {
    const updated = await db.update(eventBudgets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(eventBudgets.id, budgetId))
      .returning();

    return { success: true, budget: updated[0] };
  } catch (error) {
    console.error('Error updating budget:', error);
    return { success: false, error: 'Failed to update budget' };
  }
}

// ============================================
// CONTRIBUTION TRACKING
// ============================================

export async function addContribution(
  eventId: string,
  userId: string,
  userName: string,
  amount: number,
  paymentMethod: string = 'OTHER',
  notes?: string
) {
  try {
    const contribution = await db.insert(eventContributions).values({
      eventId,
      userId,
      userName,
      amount,
      paymentMethod,
      notes,
    }).returning();

    return { success: true, contribution: contribution[0] };
  } catch (error) {
    console.error('Error adding contribution:', error);
    return { success: false, error: 'Failed to add contribution' };
  }
}

export async function getEventContributions(eventId: string) {
  try {
    const contributions = await db
      .select()
      .from(eventContributions)
      .where(eq(eventContributions.eventId, eventId))
      .orderBy(desc(eventContributions.paidAt));

    return { success: true, contributions };
  } catch (error) {
    console.error('Error fetching contributions:', error);
    return { success: false, error: 'Failed to fetch contributions' };
  }
}

export async function getContributionSummary(eventId: string) {
  try {
    const contributions = await db
      .select()
      .from(eventContributions)
      .where(eq(eventContributions.eventId, eventId));

    const budget = await db.select().from(eventBudgets).where(eq(eventBudgets.eventId, eventId));

    const totalContributed = contributions.reduce((sum, c) => sum + c.amount, 0);
    const totalNeeded = budget[0]?.totalBudget || 0;
    const balance = totalNeeded - totalContributed;

    return {
      success: true,
      summary: {
        totalNeeded,
        totalContributed,
        balance,
        contributors: contributions.length,
        contributions,
      },
    };
  } catch (error) {
    console.error('Error calculating summary:', error);
    return { success: false, error: 'Failed to calculate summary' };
  }
}

// ============================================
// SHOPPING LIST MANAGEMENT
// ============================================

export async function addShoppingItem(
  eventId: string,
  itemName: string,
  category: string,
  quantity: string,
  estimatedPrice?: number,
  suggestedShop?: string,
  notes?: string
) {
  try {
    const item = await db.insert(shoppingListItems).values({
      eventId,
      itemName,
      category,
      quantity,
      estimatedPrice,
      suggestedShop,
      notes,
    }).returning();

    return { success: true, item: item[0] };
  } catch (error) {
    console.error('Error adding shopping item:', error);
    return { success: false, error: 'Failed to add item' };
  }
}

export async function getShoppingList(eventId: string) {
  try {
    const items = await db
      .select()
      .from(shoppingListItems)
      .where(eq(shoppingListItems.eventId, eventId))
      .orderBy(shoppingListItems.category);

    return { success: true, items };
  } catch (error) {
    console.error('Error fetching shopping list:', error);
    return { success: false, error: 'Failed to fetch shopping list' };
  }
}

export async function claimShoppingItem(
  itemId: string,
  userId: string,
  userName: string
) {
  try {
    const updated = await db.update(shoppingListItems)
      .set({
        assignedToUserId: userId,
        assignedToUserName: userName,
        status: 'CLAIMED',
      })
      .where(eq(shoppingListItems.id, itemId))
      .returning();

    return { success: true, item: updated[0] };
  } catch (error) {
    console.error('Error claiming item:', error);
    return { success: false, error: 'Failed to claim item' };
  }
}

export async function markItemBought(
  itemId: string,
  actualPrice?: number
) {
  try {
    const updated = await db.update(shoppingListItems)
      .set({
        status: 'BOUGHT',
        boughtAt: new Date(),
        actualPrice,
        updatedAt: new Date(),
      })
      .where(eq(shoppingListItems.id, itemId))
      .returning();

    return { success: true, item: updated[0] };
  } catch (error) {
    console.error('Error marking item as bought:', error);
    return { success: false, error: 'Failed to update item' };
  }
}

export async function deleteShoppingItem(itemId: string) {
  try {
    await db.delete(shoppingListItems).where(eq(shoppingListItems.id, itemId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting item:', error);
    return { success: false, error: 'Failed to delete item' };
  }
}

// ============================================
// SHOP RECOMMENDATIONS
// ============================================

export async function addShopRecommendation(
  eventId: string,
  shopName: string,
  shopType: string,
  address: string,
  latitude: string,
  longitude: string,
  data?: {
    distance?: number;
    website?: string;
    phone?: string;
    rating?: number;
    placeId?: string;
    notes?: string;
  }
) {
  try {
    const shop = await db.insert(shopRecommendations).values({
      eventId,
      shopName,
      shopType,
      address,
      latitude,
      longitude,
      ...data,
    }).returning();

    return { success: true, shop: shop[0] };
  } catch (error) {
    console.error('Error adding shop:', error);
    return { success: false, error: 'Failed to add shop' };
  }
}

export async function getShopRecommendations(eventId: string) {
  try {
    const shops = await db
      .select()
      .from(shopRecommendations)
      .where(eq(shopRecommendations.eventId, eventId));

    return { success: true, shops };
  } catch (error) {
    console.error('Error fetching shops:', error);
    return { success: false, error: 'Failed to fetch shops' };
  }
}

// ============================================
// AI SUGGESTIONS
// ============================================

export async function addEventSuggestion(
  eventId: string,
  suggestionType: string,
  title: string,
  data?: {
    description?: string;
    category?: string;
    quantity?: string;
    estimatedPrice?: number;
    reason?: string;
    confidence?: number;
  }
) {
  try {
    const suggestion = await db.insert(eventSuggestions).values({
      eventId,
      suggestionType,
      title,
      ...data,
    }).returning();

    return { success: true, suggestion: suggestion[0] };
  } catch (error) {
    console.error('Error adding suggestion:', error);
    return { success: false, error: 'Failed to add suggestion' };
  }
}

export async function getEventSuggestions(eventId: string) {
  try {
    const suggestions = await db
      .select()
      .from(eventSuggestions)
      .where(and(
        eq(eventSuggestions.eventId, eventId),
        eq(eventSuggestions.accepted, false)
      ));

    return { success: true, suggestions };
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return { success: false, error: 'Failed to fetch suggestions' };
  }
}

export async function acceptSuggestion(
  suggestionId: string,
  addToList: boolean = true
) {
  try {
    const updated = await db.update(eventSuggestions)
      .set({
        accepted: true,
        addedToList: addToList,
      })
      .where(eq(eventSuggestions.id, suggestionId))
      .returning();

    return { success: true, suggestion: updated[0] };
  } catch (error) {
    console.error('Error accepting suggestion:', error);
    return { success: false, error: 'Failed to accept suggestion' };
  }
}

export async function rejectSuggestion(suggestionId: string) {
  try {
    await db.delete(eventSuggestions).where(eq(eventSuggestions.id, suggestionId));
    return { success: true };
  } catch (error) {
    console.error('Error rejecting suggestion:', error);
    return { success: false, error: 'Failed to reject suggestion' };
  }
}
