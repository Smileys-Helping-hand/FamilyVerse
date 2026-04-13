'use server';

import { db } from '@/lib/db';
import {
  events,
  userInventory,
  familyMembers,
  preferences,
} from '@/lib/db/schema';
import { eq, and, count, desc } from 'drizzle-orm';

// ---------------------------------------------
// Types
// ---------------------------------------------

export interface UserEventStats {
  outings: number;
  upcoming: number;
  gangCount: number;
  gearItems: number;
  recentEvents: Array<{ title: string; locationName: string | null }>;
}

export interface PersonalizedSuggestion {
  prompt: string;
  reason: string;
}

// ---------------------------------------------
// Keyword fingerprinting per event type
// ---------------------------------------------

const EVENT_TYPE_KEYWORDS: Record<string, string[]> = {
  braai: ['braai', 'bbq', 'barbecue', 'grill', 'charcoal', 'boerewors'],
  hike: ['hike', 'hiking', 'trail', 'mountain', 'summit', 'kloof', 'gorge', 'nature walk'],
  beach: ['beach', 'clifton', 'camps bay', 'seaside', 'ocean', 'sea', 'boulders', 'muizenberg'],
  party: ['party', 'birthday', 'celebration', 'drinks', 'vibes', 'bash', 'jol'],
  sports: ['cricket', 'soccer', 'rugby', 'football', 'game', 'match', 'sport', 'gym'],
  dining: ['dinner', 'lunch', 'restaurant', 'sushi', 'pizza', 'eat', 'food', 'brunch'],
  travel: ['trip', 'road', 'camping', 'safari', 'getaway', 'weekend away', 'winelands'],
};

// Pool of prompts per event type - SA-flavoured
const PROMPT_BANK: Record<string, string[]> = {
  braai: [
    'Braai at Kirstenbosch this Saturday for 8 people',
    'Sunset braai at home, invite the usual crew - 6 people',
    'Braai at the park this Friday, 8 people',
    'Beach braai at Kogel Bay for the long weekend',
  ],
  hike: [
    'Morning hike at Table Mountain next Sunday, 6 people',
    'Sunrise hike at Lion\'s Head this Saturday, 4 people',
    'Hike at Newlands Forest this weekend, 5 people',
    'Trail run at Cape Point next Sunday, small crew',
  ],
  beach: [
    'Beach day at Clifton this Sunday, 8 people',
    'Sundowners at Camps Bay on Friday, 6 people',
    'Swim day at Muizenberg this weekend, family crew',
    'Beach braai at Llandudno this Saturday for 10',
  ],
  party: [
    'House party this Saturday, 15 people',
    'Birthday dinner in town this Friday, 8 people',
    'Drinks and vibes at home this weekend, 10 people',
    'Rooftop hangout in the city this Friday',
  ],
  sports: [
    'Watch the cricket at someone\'s place this Saturday, 10 people',
    'Five-a-side soccer at the park on Sunday, 10 people',
    'Watch the Stormers game at a pub this Friday',
    'Cycling ride along the coast this Sunday, 6 people',
  ],
  dining: [
    'Team dinner at a nice restaurant in town this Friday, 8 people',
    'Sunday lunch somewhere cool with the gang, 6 people',
    'Sushi night Friday, 8 people split the bill',
    'Breakfast club at a good cafe this Sunday, 6 people',
  ],
  travel: [
    'Winelands day trip this Saturday, 6 people',
    'Camping weekend at Kogel Bay next weekend, 8 people',
    'Road trip to Hermanus for the long weekend, 6 people',
    'Glamping at Hemel-en-Aarde this Saturday, 4 people',
  ],
  other: [
    'Braai this Saturday at Kirstenbosch for 8 people',
    'Hiking trip to Table Mountain next Sunday, 6 people',
    'Beach day at Clifton on Friday, bring the gang',
    'Dinner in town this weekend, 6 people',
  ],
};

// ---------------------------------------------
// Get real user stats for the dashboard tiles
// ---------------------------------------------

export async function getUserEventStats(
  userId: string,
  familyId?: string | null
): Promise<UserEventStats> {
  try {
    const [outingsRow] = await db
      .select({ n: count() })
      .from(events)
      .where(eq(events.creatorId, userId));

    const [upcomingRow] = await db
      .select({ n: count() })
      .from(events)
      .where(and(eq(events.creatorId, userId), eq(events.status, 'UPCOMING')));

    let gangCount = 0;
    if (familyId) {
      const [gangRow] = await db
        .select({ n: count() })
        .from(familyMembers)
        .where(eq(familyMembers.familyId, familyId));
      gangCount = Number(gangRow?.n ?? 0);
    }

    const [gearRow] = await db
      .select({ n: count() })
      .from(userInventory)
      .where(eq(userInventory.userId, userId));

    const recentEvents = await db
      .select({ title: events.title, locationName: events.locationName })
      .from(events)
      .where(eq(events.creatorId, userId))
      .orderBy(desc(events.createdAt))
      .limit(5);

    return {
      outings: Number(outingsRow?.n ?? 0),
      upcoming: Number(upcomingRow?.n ?? 0),
      gangCount,
      gearItems: Number(gearRow?.n ?? 0),
      recentEvents,
    };
  } catch (err) {
    console.error('[getUserEventStats]', err);
    return { outings: 0, upcoming: 0, gangCount: 0, gearItems: 0, recentEvents: [] };
  }
}

// ---------------------------------------------
// Generate personalised quick prompts
// ---------------------------------------------

function inferType(text: string): string | null {
  for (const [type, keywords] of Object.entries(EVENT_TYPE_KEYWORDS)) {
    if (keywords.some((kw) => text.toLowerCase().includes(kw))) return type;
  }
  return null;
}

function normalizeLocation(input: string | null): string | null {
  if (!input) return null;
  const cleaned = input.replace(/\s+/g, ' ').trim();
  if (!cleaned) return null;
  if (cleaned.length > 50) return cleaned.slice(0, 50);
  return cleaned;
}

function recencyWeight(createdAt: Date | null): number {
  if (!createdAt) return 0.35;
  const now = Date.now();
  const ageDays = Math.max(0, (now - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
  // Exponential decay: recent events dominate, old events still contribute lightly.
  return Math.max(0.15, Math.exp(-ageDays / 45));
}

function buildLocationPrompt(type: string, location: string): string {
  switch (type) {
    case 'braai':
      return `Braai at ${location} this Saturday for 8 people`;
    case 'hike':
      return `Hike at ${location} this Sunday morning for 6 people`;
    case 'beach':
      return `Beach day at ${location} this weekend for 8 people`;
    case 'party':
      return `House party near ${location} this Friday night for 12 people`;
    case 'sports':
      return `Sports day near ${location} this Sunday for 10 people`;
    case 'dining':
      return `Dinner at ${location} this Friday for 8 people`;
    case 'travel':
      return `Weekend trip via ${location} for 6 people`;
    default:
      return `Outing at ${location} this weekend for 6 people`;
  }
}

function buildReason(options: {
  type: string;
  location?: string;
  source: 'history-location' | 'history-type' | 'preference' | 'fallback';
}): string {
  const typeLabel = options.type === 'other' ? 'recent outing activity' : `${options.type} plans`;

  if (options.source === 'history-location' && options.location) {
    return `Based on your recent ${typeLabel} around ${options.location}.`;
  }

  if (options.source === 'history-type') {
    return `Based on the kinds of outings you have planned most recently.`;
  }

  if (options.source === 'preference') {
    return `Based on the event types you keep choosing over time.`;
  }

  return 'Suggested to help you start planning quickly.';
}

export async function getPersonalizedSuggestions(userId: string): Promise<PersonalizedSuggestion[]> {
  try {
    const recentEvents = await db
      .select({
        title: events.title,
        locationName: events.locationName,
        createdAt: events.createdAt,
      })
      .from(events)
      .where(eq(events.creatorId, userId))
      .orderBy(desc(events.createdAt))
      .limit(20);

    const [prefs] = await db
      .select({ favorites: preferences.favorites })
      .from(preferences)
      .where(eq(preferences.userId, userId));

    const storedFavs: string[] = (prefs?.favorites as string[]) ?? [];

    // Build weighted type scores + top location per type
    const typeScores: Record<string, number> = {};
    const locationScoresByType: Record<string, Record<string, number>> = {};

    for (const ev of recentEvents) {
      const text = `${ev.title} ${ev.locationName ?? ''}`;
      const type = inferType(text);
      if (!type) continue;

      const w = recencyWeight(ev.createdAt);
      typeScores[type] = (typeScores[type] ?? 0) + w;

      const location = normalizeLocation(ev.locationName);
      if (location) {
        if (!locationScoresByType[type]) {
          locationScoresByType[type] = {};
        }
        locationScoresByType[type][location] = (locationScoresByType[type][location] ?? 0) + w;
      }
    }

    // Stored preferences get decayed weighting by recency in the array.
    for (let i = 0; i < storedFavs.length; i += 1) {
      const fav = storedFavs[i];
      const position = i + 1;
      const recency = position / storedFavs.length;
      const bonus = 0.35 + recency * 1.0;
      typeScores[fav] = (typeScores[fav] ?? 0) + bonus;
    }

    if (Object.keys(typeScores).length === 0) {
      return PROMPT_BANK.other.map((prompt) => ({
        prompt,
        reason: 'Suggested to help you start planning quickly.',
      }));
    }

    // Sort by score, take top 3 event styles
    const topTypes = Object.entries(typeScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type]) => type);

    const suggestions: PersonalizedSuggestion[] = [];
    const used = new Set<string>();

    const preferenceTypeSet = new Set(storedFavs);

    for (const type of topTypes) {
      const locationMap = locationScoresByType[type] ?? {};
      const topLocation = Object.entries(locationMap)
        .sort((a, b) => b[1] - a[1])
        .map(([loc]) => loc)[0];

      if (topLocation && suggestions.length < 4) {
        const locationPrompt = buildLocationPrompt(type, topLocation);
        if (!used.has(locationPrompt)) {
          suggestions.push({
            prompt: locationPrompt,
            reason: buildReason({ type, location: topLocation, source: 'history-location' }),
          });
          used.add(locationPrompt);
        }
      }

      const pool = PROMPT_BANK[type] ?? PROMPT_BANK.other;
      for (const p of pool) {
        if (!used.has(p) && suggestions.length < 4) {
          suggestions.push({
            prompt: p,
            reason: buildReason({
              type,
              source: preferenceTypeSet.has(type) ? 'preference' : 'history-type',
            }),
          });
          used.add(p);
        }
      }
    }

    // Pad with defaults if needed
    for (const p of PROMPT_BANK.other) {
      if (!used.has(p) && suggestions.length < 4) {
        suggestions.push({
          prompt: p,
          reason: buildReason({ type: 'other', source: 'fallback' }),
        });
        used.add(p);
      }
    }

    return suggestions.slice(0, 4);
  } catch (err) {
    console.error('[getPersonalizedSuggestions]', err);
    return PROMPT_BANK.other.map((prompt) => ({
      prompt,
      reason: 'Suggested to help you start planning quickly.',
    }));
  }
}

// ---------------------------------------------
// Record an event type signal after creation
// ---------------------------------------------

export async function recordEventPreference(
  userId: string,
  eventType: string
): Promise<void> {
  try {
    const safeType = eventType.trim().toLowerCase();
    const validTypes = new Set(['braai', 'hike', 'party', 'sports', 'travel', 'dining', 'beach', 'other']);
    const normalizedType = validTypes.has(safeType) ? safeType : 'other';

    const [existing] = await db
      .select({ id: preferences.id, favorites: preferences.favorites })
      .from(preferences)
      .where(eq(preferences.userId, userId));

    if (existing) {
      const current: string[] = (existing.favorites as string[]) ?? [];
      const updated = [...current, normalizedType].slice(-20); // keep last 20 signals
      await db
        .update(preferences)
        .set({ favorites: updated, updatedAt: new Date() })
        .where(eq(preferences.userId, userId));
    } else {
      await db.insert(preferences).values({
        userId,
        favorites: [normalizedType],
        dietaryRestrictions: [],
        allergens: [],
      });
    }
  } catch (err) {
    // Non-critical - do not surface to user
    console.error('[recordEventPreference]', err);
  }
}
