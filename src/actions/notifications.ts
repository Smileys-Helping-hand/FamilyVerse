// actions/notifications.ts
'use server';
import { db } from '@/lib/db';
import { notifications, eventSupplies } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function getUserNotifications(userId: string) {
  return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
}

export async function acknowledgeNotification(notificationId: number) {
  await db.update(notifications).set({ read: true }).where(eq(notifications.id, notificationId));
}

/** Mark notification read AND confirm the associated gear supply as CONFIRMED */
export async function acknowledgeGearNotification(notificationId: number, userId: string, itemName: string, eventId?: string) {
  // Mark notification as read
  await db.update(notifications).set({ read: true }).where(eq(notifications.id, notificationId));

  // Confirm the gear supply row if we have enough info
  if (itemName && eventId) {
    await db
      .update(eventSupplies)
      .set({ status: 'CONFIRMED' })
      .where(
        and(
          eq(eventSupplies.eventId, eventId),
          eq(eventSupplies.assignedToUserId, userId),
          eq(eventSupplies.itemName, itemName)
        )
      );
  }
}

export async function createNotification({ userId, title, message, type }: {
  userId: string;
  title: string;
  message: string;
  type: string;
}) {
  await db.insert(notifications).values({ userId, title, message, type });
}

