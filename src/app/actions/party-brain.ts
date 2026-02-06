'use server';

import { db } from '@/lib/db';
import { userAssets, preferences, eventPlans } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * MODULE 1: Party Brain - AI-Powered Event Planning
 */

interface GenerateEventPlanParams {
  eventId: number;
  hostId: string;
  eventType: string;
  duration: number; // in hours
  attendees: number;
}

export async function generateEventPlan(params: GenerateEventPlanParams) {
  try {
    const { eventId, hostId, eventType, duration, attendees } = params;

    // Fetch host's assets
    const assets = await db
      .select()
      .from(userAssets)
      .where(eq(userAssets.userId, hostId));

    // Fetch host's preferences
    const prefs = await db
      .select()
      .from(preferences)
      .where(eq(preferences.userId, hostId))
      .limit(1);

    const userPreferences = prefs[0];

    // Build AI prompt
    const prompt = `
You are an expert party planner AI. Generate a detailed event schedule.

**Event Details:**
- Type: ${eventType}
- Duration: ${duration} hours
- Attendees: ${attendees} people

**Available Assets:**
${assets.map((a) => `- ${a.name} (${a.type})${a.isSetupRequired ? ' [Setup Required]' : ''} - Tags: ${a.tags.join(', ')}`).join('\n')}

**Host Preferences:**
- Dietary Restrictions: ${userPreferences?.dietaryRestrictions?.join(', ') || 'None'}
- Favorites: ${userPreferences?.favorites?.join(', ') || 'Not specified'}
- Allergens: ${userPreferences?.allergens?.join(', ') || 'None'}

**Requirements:**
1. Create a chronological schedule using available assets
2. Consider setup time for assets that require it
3. Balance digital and analog activities
4. Respect dietary restrictions for food/snacks
5. Keep activities under the total duration

Return ONLY valid JSON in this exact format:
{
  "activities": [
    {
      "name": "Activity Name",
      "duration": 60,
      "startTime": "14:00",
      "assetIds": [1, 2],
      "participants": 4
    }
  ],
  "suggestions": ["Additional tips or warnings"]
}`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = response;
    if (response.includes('```json')) {
      jsonText = response.split('```json')[1].split('```')[0].trim();
    } else if (response.includes('```')) {
      jsonText = response.split('```')[1].split('```')[0].trim();
    }

    const scheduleJson = JSON.parse(jsonText);

    // Extract asset IDs used
    const assetsUsedIds = Array.from(
      new Set(
        scheduleJson.activities.flatMap((act: any) => act.assetIds || [])
      )
    ) as number[];

    // Save the event plan
    const [eventPlan] = await db
      .insert(eventPlans)
      .values({
        eventId,
        hostId,
        generatedScheduleJson: scheduleJson,
        assetsUsedIds,
      })
      .returning();

    return {
      success: true,
      data: eventPlan,
    };
  } catch (error) {
    console.error('Error generating event plan:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate event plan',
    };
  }
}

export async function addUserAsset(
  userId: string,
  asset: {
    name: string;
    type: 'digital' | 'analog' | 'food';
    isSetupRequired: boolean;
    tags: string[];
    description?: string;
  }
) {
  try {
    const [newAsset] = await db.insert(userAssets).values({
      userId,
      ...asset,
    }).returning();

    return { success: true, data: newAsset };
  } catch (error) {
    console.error('Error adding asset:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add asset',
    };
  }
}

export async function getUserAssets(userId: string) {
  try {
    const assets = await db
      .select()
      .from(userAssets)
      .where(eq(userAssets.userId, userId));

    return { success: true, data: assets };
  } catch (error) {
    console.error('Error fetching assets:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch assets',
    };
  }
}

export async function updateUserPreferences(
  userId: string,
  prefs: {
    dietaryRestrictions?: string[];
    favorites?: string[];
    allergens?: string[];
    additionalNotes?: string;
  }
) {
  try {
    const existing = await db
      .select()
      .from(preferences)
      .where(eq(preferences.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      const [updated] = await db
        .update(preferences)
        .set({ ...prefs, updatedAt: new Date() })
        .where(eq(preferences.userId, userId))
        .returning();

      return { success: true, data: updated };
    } else {
      const [created] = await db
        .insert(preferences)
        .values({ userId, ...prefs })
        .returning();

      return { success: true, data: created };
    }
  } catch (error) {
    console.error('Error updating preferences:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update preferences',
    };
  }
}
