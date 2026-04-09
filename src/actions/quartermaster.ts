'use server';

import { db } from '@/lib/db';
import { userInventory, eventSupplies, eventAttendees, notifications } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';

export interface AssignmentResult {
  item: string;
  assignedToUserId: string | null;
  assignedToUserName: string | null;
  status: 'AUTO_ASSIGNED' | 'UNASSIGNED';
}

/**
 * Auto-Quartermaster: matches a list of required gear items against the
 * user_inventory of every attendee who has auto_volunteer = true.
 * Inserts results into event_supplies and issues in-app notifications.
 *
 * @param eventId  - UUID of the event
 * @param items    - Array of required gear item names (from AI draft)
 * @param attendeeUserIds - Optional pre-loaded list; will query DB if omitted
 */
export async function runQuartermaster(
  eventId: string,
  items: string[],
  attendeeUserIds?: string[],
): Promise<AssignmentResult[]> {
  if (!items.length) return [];

  // 1. Get attendee IDs if not supplied
  let userIds = attendeeUserIds ?? [];
  if (!userIds.length) {
    const rows = await db
      .select({ userId: eventAttendees.userId })
      .from(eventAttendees)
      .where(eq(eventAttendees.eventId, eventId));
    userIds = rows.map((r) => r.userId);
  }

  // 2. Load all auto-volunteer inventory entries for those users
  const inventories =
    userIds.length > 0
      ? await db
          .select()
          .from(userInventory)
          .where(
            inArray(userInventory.userId, userIds),
          )
      : [];

  const autoVolunteers = inventories.filter((inv) => inv.autoVolunteer);

  // 3. Match items (case-insensitive) and build assignment list
  const results: AssignmentResult[] = [];

  for (const item of items) {
    const match = autoVolunteers.find(
      (inv) => inv.itemName.trim().toLowerCase() === item.trim().toLowerCase(),
    );

    if (match) {
      results.push({
        item,
        assignedToUserId: match.userId,
        assignedToUserName: null, // resolved at display time
        status: 'AUTO_ASSIGNED',
      });
    } else {
      results.push({ item, assignedToUserId: null, assignedToUserName: null, status: 'UNASSIGNED' });
    }
  }

  // 4. Upsert into event_supplies
  for (const result of results) {
    await db.insert(eventSupplies).values({
      eventId,
      itemName: result.item,
      quantityNeeded: '1',
      assignedToUserId: result.assignedToUserId ?? undefined,
      status: result.status === 'AUTO_ASSIGNED' ? 'CLAIMED' : 'PENDING',
      category: 'EQUIPMENT',
    });

    // 5. Notify auto-assigned users
    if (result.assignedToUserId) {
      await db.insert(notifications).values({
        userId: result.assignedToUserId,
        title: 'Gear Assigned',
        message: `The Quartermaster assigned you to bring: ${result.item}.`,
        type: 'GEAR_ASSIGNED',
      });
    }
  }

  return results;
}
