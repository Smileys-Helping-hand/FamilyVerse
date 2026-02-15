'use server';

import { db } from '@/lib/db';
import {
  eventSupplies,
  children,
  guardianships,
  childCheckIns,
  sosAlerts,
  dietaryPreferences,
  menuItems,
  tacticalLocations,
  type NewEventSupply,
  type NewChild,
  type NewGuardianship,
  type NewChildCheckIn,
  type NewSosAlert,
  type NewDietaryPreference,
  type NewMenuItem,
  type NewTacticalLocation,
} from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { triggerPartyEvent } from '@/lib/pusher/server';
import { revalidatePath } from 'next/cache';

// ============================================
// SUPPLY CHAIN MANAGER
// ============================================

export async function addSupplyItem(data: NewEventSupply) {
  try {
    const [item] = await db.insert(eventSupplies).values(data).returning();
    
    await triggerPartyEvent(`event-${data.eventId}`, 'supply-added', item);
    
    revalidatePath(`/events/${data.eventId}`);
    return { success: true, item };
  } catch (error) {
    console.error('Failed to add supply item:', error);
    return { success: false, error: 'Failed to add item' };
  }
}

export async function claimSupplyItem(itemId: string, userId: string, userName: string, eventId: string) {
  try {
    // Check if already claimed
    const [existing] = await db.select().from(eventSupplies).where(eq(eventSupplies.id, itemId));
    
    if (existing.assignedToUserId && existing.assignedToUserId !== userId) {
      return { success: false, error: 'Item already claimed by someone else' };
    }

    await db
      .update(eventSupplies)
      .set({
        assignedToUserId: userId,
        assignedToUserName: userName,
        status: 'CLAIMED',
        claimedAt: new Date(),
      })
      .where(eq(eventSupplies.id, itemId));

    const [updated] = await db.select().from(eventSupplies).where(eq(eventSupplies.id, itemId));
    
    await triggerPartyEvent(`event-${eventId}`, 'supply-claimed', updated);
    
    revalidatePath(`/events/${eventId}`);
    return { success: true, item: updated };
  } catch (error) {
    console.error('Failed to claim item:', error);
    return { success: false, error: 'Failed to claim item' };
  }
}

export async function unclaimSupplyItem(itemId: string, userId: string, eventId: string) {
  try {
    const [existing] = await db.select().from(eventSupplies).where(eq(eventSupplies.id, itemId));
    
    if (existing.assignedToUserId !== userId) {
      return { success: false, error: 'You cannot unclaim this item' };
    }

    await db
      .update(eventSupplies)
      .set({
        assignedToUserId: null,
        assignedToUserName: null,
        status: 'PENDING',
        claimedAt: null,
      })
      .where(eq(eventSupplies.id, itemId));

    const [updated] = await db.select().from(eventSupplies).where(eq(eventSupplies.id, itemId));
    
    await triggerPartyEvent(`event-${eventId}`, 'supply-unclaimed', updated);
    
    revalidatePath(`/events/${eventId}`);
    return { success: true, item: updated };
  } catch (error) {
    console.error('Failed to unclaim item:', error);
    return { success: false, error: 'Failed to unclaim item' };
  }
}

export async function markSupplyBought(itemId: string, userId: string, eventId: string) {
  try {
    await db
      .update(eventSupplies)
      .set({ status: 'BOUGHT', boughtAt: new Date() })
      .where(eq(eventSupplies.id, itemId));

    const [updated] = await db.select().from(eventSupplies).where(eq(eventSupplies.id, itemId));
    
    await triggerPartyEvent(`event-${eventId}`, 'supply-bought', updated);
    
    revalidatePath(`/events/${eventId}`);
    return { success: true, item: updated };
  } catch (error) {
    console.error('Failed to mark as bought:', error);
    return { success: false, error: 'Failed to mark as bought' };
  }
}

export async function getEventSupplies(eventId: string) {
  try {
    const supplies = await db
      .select()
      .from(eventSupplies)
      .where(eq(eventSupplies.eventId, eventId))
      .orderBy(eventSupplies.createdAt);

    // Group by category
    const grouped = supplies.reduce((acc: any, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    return { success: true, supplies, grouped };
  } catch (error) {
    console.error('Failed to get supplies:', error);
    return { success: false, error: 'Failed to get supplies', supplies: [], grouped: {} };
  }
}

export async function deleteSupplyItem(itemId: string, eventId: string) {
  try {
    await db.delete(eventSupplies).where(eq(eventSupplies.id, itemId));
    
    await triggerPartyEvent(`event-${eventId}`, 'supply-deleted', { itemId });
    
    revalidatePath(`/events/${eventId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete item:', error);
    return { success: false, error: 'Failed to delete item' };
  }
}

// ============================================
// GUARDIAN EYE (CHILD SAFETY)
// ============================================

export async function addChild(data: NewChild) {
  try {
    const [child] = await db.insert(children).values(data).returning();
    return { success: true, child };
  } catch (error) {
    console.error('Failed to add child:', error);
    return { success: false, error: 'Failed to add child' };
  }
}

export async function getChildren(parentId: string) {
  try {
    const childList = await db
      .select()
      .from(children)
      .where(eq(children.parentId, parentId))
      .orderBy(children.name);
    
    return { success: true, children: childList };
  } catch (error) {
    console.error('Failed to get children:', error);
    return { success: false, error: 'Failed to get children', children: [] };
  }
}

export async function assignGuardian(data: NewGuardianship) {
  try {
    const [guardianship] = await db.insert(guardianships).values(data).returning();
    
    await triggerPartyEvent(`event-${data.eventId}`, 'guardian-assigned', guardianship);
    
    revalidatePath(`/events/${data.eventId}`);
    return { success: true, guardianship };
  } catch (error) {
    console.error('Failed to assign guardian:', error);
    return { success: false, error: 'Failed to assign guardian' };
  }
}

export async function checkInChild(data: NewChildCheckIn) {
  try {
    const [checkIn] = await db.insert(childCheckIns).values(data).returning();
    
    // Get child info for notification
    const [child] = await db.select().from(children).where(eq(children.id, data.childId));
    
    await triggerPartyEvent(`event-${data.eventId}`, 'child-checked-in', {
      checkIn,
      childName: child.name,
    });
    
    revalidatePath(`/events/${data.eventId}`);
    return { success: true, checkIn };
  } catch (error) {
    console.error('Failed to check in child:', error);
    return { success: false, error: 'Failed to check in child' };
  }
}

export async function getEventGuardianships(eventId: string) {
  try {
    const guardianshipList = await db
      .select()
      .from(guardianships)
      .where(eq(guardianships.eventId, eventId))
      .orderBy(guardianships.startTime);

    // Get child details for each guardianship
    const withChildren = await Promise.all(
      guardianshipList.map(async (g) => {
        const [child] = await db.select().from(children).where(eq(children.id, g.childId));
        return { ...g, child };
      })
    );

    return { success: true, guardianships: withChildren };
  } catch (error) {
    console.error('Failed to get guardianships:', error);
    return { success: false, error: 'Failed to get guardianships', guardianships: [] };
  }
}

export async function getChildCheckIns(eventId: string) {
  try {
    const checkIns = await db
      .select()
      .from(childCheckIns)
      .where(eq(childCheckIns.eventId, eventId))
      .orderBy(desc(childCheckIns.checkedInAt));

    // Get child details
    const withChildren = await Promise.all(
      checkIns.map(async (c) => {
        const [child] = await db.select().from(children).where(eq(children.id, c.childId));
        return { ...c, child };
      })
    );

    return { success: true, checkIns: withChildren };
  } catch (error) {
    console.error('Failed to get check-ins:', error);
    return { success: false, error: 'Failed to get check-ins', checkIns: [] };
  }
}

// ============================================
// SOS ALERTS (EMERGENCY SYSTEM)
// ============================================

export async function triggerSOS(data: NewSosAlert) {
  try {
    const [alert] = await db.insert(sosAlerts).values(data).returning();
    
    // Get child info if child-related
    let childInfo = null;
    if (data.childId) {
      const [child] = await db.select().from(children).where(eq(children.id, data.childId));
      childInfo = child;
    }
    
    // Broadcast URGENT notification to ALL event attendees
    await triggerPartyEvent(`event-${data.eventId}`, 'sos-alert', {
      alert,
      child: childInfo,
      priority: 'CRITICAL',
    });
    
    revalidatePath(`/events/${data.eventId}`);
    return { success: true, alert };
  } catch (error) {
    console.error('Failed to trigger SOS:', error);
    return { success: false, error: 'Failed to trigger SOS' };
  }
}

export async function resolveSOS(alertId: string, resolvedBy: string, eventId: string) {
  try {
    await db
      .update(sosAlerts)
      .set({
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy,
      })
      .where(eq(sosAlerts.id, alertId));

    const [updated] = await db.select().from(sosAlerts).where(eq(sosAlerts.id, alertId));
    
    await triggerPartyEvent(`event-${eventId}`, 'sos-resolved', updated);
    
    revalidatePath(`/events/${eventId}`);
    return { success: true, alert: updated };
  } catch (error) {
    console.error('Failed to resolve SOS:', error);
    return { success: false, error: 'Failed to resolve SOS' };
  }
}

export async function getActiveSOSAlerts(eventId: string) {
  try {
    const alerts = await db
      .select()
      .from(sosAlerts)
      .where(and(eq(sosAlerts.eventId, eventId), eq(sosAlerts.isResolved, false)))
      .orderBy(desc(sosAlerts.createdAt));

    return { success: true, alerts };
  } catch (error) {
    console.error('Failed to get SOS alerts:', error);
    return { success: false, error: 'Failed to get SOS alerts', alerts: [] };
  }
}

// ============================================
// FEAST MANAGER (MENU & DIETARY)
// ============================================

export async function addMenuItem(data: NewMenuItem) {
  try {
    const [item] = await db.insert(menuItems).values(data).returning();
    
    await triggerPartyEvent(`event-${data.eventId}`, 'menu-item-added', item);
    
    revalidatePath(`/events/${data.eventId}`);
    return { success: true, item };
  } catch (error) {
    console.error('Failed to add menu item:', error);
    return { success: false, error: 'Failed to add menu item' };
  }
}

export async function getMenuItems(eventId: string) {
  try {
    const items = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.eventId, eventId))
      .orderBy(menuItems.category);

    // Group by category
    const grouped = items.reduce((acc: any, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    return { success: true, items, grouped };
  } catch (error) {
    console.error('Failed to get menu items:', error);
    return { success: false, error: 'Failed to get menu items', items: [], grouped: {} };
  }
}

export async function setDietaryPreferences(data: NewDietaryPreference) {
  try {
    // Upsert preferences
    const existing = await db
      .select()
      .from(dietaryPreferences)
      .where(eq(dietaryPreferences.userId, data.userId));

    if (existing.length > 0) {
      await db
        .update(dietaryPreferences)
        .set({ preferences: data.preferences, customNotes: data.customNotes, updatedAt: new Date() })
        .where(eq(dietaryPreferences.userId, data.userId));
    } else {
      await db.insert(dietaryPreferences).values(data);
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to set dietary preferences:', error);
    return { success: false, error: 'Failed to set preferences' };
  }
}

export async function getDietaryPreferences(userId: string) {
  try {
    const [prefs] = await db
      .select()
      .from(dietaryPreferences)
      .where(eq(dietaryPreferences.userId, userId));

    return { success: true, preferences: prefs || null };
  } catch (error) {
    console.error('Failed to get dietary preferences:', error);
    return { success: false, error: 'Failed to get preferences', preferences: null };
  }
}

export async function checkDietaryConflicts(eventId: string) {
  try {
    // Get all attendees with dietary restrictions
    const attendees = await db
      .select()
      .from(require('@/lib/db/schema').eventAttendees)
      .where(eq(require('@/lib/db/schema').eventAttendees.eventId, eventId));

    const conflicts: any[] = [];

    for (const attendee of attendees) {
      const [prefs] = await db
        .select()
        .from(dietaryPreferences)
        .where(eq(dietaryPreferences.userId, attendee.userId));

      if (prefs) {
        // Check menu items against preferences
        const items = await db
          .select()
          .from(menuItems)
          .where(eq(menuItems.eventId, eventId));

        if (prefs.preferences.nutAllergy) {
          const nutItems = items.filter(i => i.dietaryFlags.containsNuts);
          if (nutItems.length > 0) {
            conflicts.push({
              userName: attendee.userName,
              issue: 'Nut Allergy',
              affectedDishes: nutItems.map(i => i.dishName),
            });
          }
        }

        if (prefs.preferences.vegetarian) {
          const meatItems = items.filter(i => !i.dietaryFlags.vegetarian);
          if (meatItems.length === items.length) {
            conflicts.push({
              userName: attendee.userName,
              issue: 'Vegetarian',
              note: 'No vegetarian options available',
            });
          }
        }

        // Add more checks as needed
      }
    }

    return { success: true, conflicts };
  } catch (error) {
    console.error('Failed to check dietary conflicts:', error);
    return { success: false, error: 'Failed to check conflicts', conflicts: [] };
  }
}

export async function calculatePortions(eventId: string) {
  try {
    const attendees = await db
      .select()
      .from(require('@/lib/db/schema').eventAttendees)
      .where(eq(require('@/lib/db/schema').eventAttendees.eventId, eventId));

    // Simple estimation: 0.5kg meat per adult, 0.2kg per child
    // This is simplified - in reality you'd need more data
    const adultCount = attendees.length; // Assume all adults for now
    const meatKg = adultCount * 0.5;
    const riceKg = adultCount * 0.15;
    const saladKg = adultCount * 0.2;

    return {
      success: true,
      portions: {
        attendees: adultCount,
        meat: `${meatKg.toFixed(1)}kg`,
        rice: `${riceKg.toFixed(1)}kg`,
        salad: `${saladKg.toFixed(1)}kg`,
        drinks: `${adultCount * 2} drinks`,
      },
    };
  } catch (error) {
    console.error('Failed to calculate portions:', error);
    return { success: false, error: 'Failed to calculate portions' };
  }
}

// ============================================
// TACTICAL MAP (LOCAL INTELLIGENCE)
// ============================================

export async function fetchNearbyPlaces(eventId: string, lat: number, lng: number) {
  try {
    // This would integrate with Google Places API or similar
    // For now, we'll create a placeholder that can be extended

    const placeTypes = [
      { type: 'HOSPITAL', query: 'hospital' },
      { type: 'POLICE', query: 'police' },
      { type: 'PHARMACY', query: 'pharmacy' },
      { type: 'SUPERMARKET', query: 'supermarket' },
      { type: 'GAS_STATION', query: 'gas+station' },
      { type: 'PLAYGROUND', query: 'playground' },
    ];

    // If Google Places API key is available
    if (process.env.GOOGLE_PLACES_API_KEY) {
      const locations: NewTacticalLocation[] = [];

      for (const placeType of placeTypes) {
        try {
          const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=${placeType.query}&key=${process.env.GOOGLE_PLACES_API_KEY}`;
          
          const response = await fetch(url);
          const data = await response.json();

          if (data.results && data.results.length > 0) {
            // Take the closest one
            const place = data.results[0];
            locations.push({
              eventId,
              locationType: placeType.type as any,
              name: place.name,
              address: place.vicinity,
              latitude: place.geometry.location.lat.toString(),
              longitude: place.geometry.location.lng.toString(),
              placeId: place.place_id,
              isOpen: place.opening_hours?.open_now,
            });
          }
        } catch (err) {
          console.error(`Failed to fetch ${placeType.type}:`, err);
        }
      }

      // Save to database
      if (locations.length > 0) {
        await db.insert(tacticalLocations).values(locations);
      }

      return { success: true, locations };
    } else {
      // Return mock data if no API key
      return {
        success: true,
        locations: [],
        note: 'Add GOOGLE_PLACES_API_KEY to environment for tactical map features',
      };
    }
  } catch (error) {
    console.error('Failed to fetch nearby places:', error);
    return { success: false, error: 'Failed to fetch nearby places', locations: [] };
  }
}

export async function getTacticalLocations(eventId: string) {
  try {
    const locations = await db
      .select()
      .from(tacticalLocations)
      .where(eq(tacticalLocations.eventId, eventId));

    // Group by type
    const grouped = locations.reduce((acc: any, loc) => {
      if (!acc[loc.locationType]) {
        acc[loc.locationType] = [];
      }
      acc[loc.locationType].push(loc);
      return acc;
    }, {});

    return { success: true, locations, grouped };
  } catch (error) {
    console.error('Failed to get tactical locations:', error);
    return { success: false, error: 'Failed to get locations', locations: [], grouped: {} };
  }
}
