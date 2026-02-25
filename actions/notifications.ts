// actions/notifications.ts
'use server';
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getUserNotifications(userId: string) {
  return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(notifications.createdAt.desc());
}

export async function acknowledgeNotification(notificationId: number) {
  await db.update(notifications).set({ read: true }).where(eq(notifications.id, notificationId));
}

export async function createNotification({ userId, title, message, type }: {
  userId: string;
  title: string;
  message: string;
  type: string;
}) {
  await db.insert(notifications).values({ userId, title, message, type });
}
