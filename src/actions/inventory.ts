// actions/inventory.ts
'use server';
import { db } from "@/lib/db";
import { userInventory } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function getUserGear(userId: string) {
  return await db.select().from(userInventory).where(eq(userInventory.userId, userId));
}

export async function toggleGearItem({ userId, itemName, isOwned, autoVolunteer }: {
  userId: string;
  itemName: string;
  isOwned: boolean;
  autoVolunteer: boolean;
}) {
  if (!isOwned) {
    await db.delete(userInventory).where(and(
      eq(userInventory.userId, userId),
      eq(userInventory.itemName, itemName)
    ));
    return;
  }
  await db.insert(userInventory).values({
    userId,
    itemName,
    autoVolunteer,
  }).onConflictDoUpdate({
    target: [userInventory.userId, userInventory.itemName],
    set: { autoVolunteer },
  });
}
