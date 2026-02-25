// src/app/api/generate-supply-list/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { eventSupplies, events, userInventory, outingTemplates, eventAttendees, notifications } from "@/lib/db/schema";
import { pusherServer } from "@/lib/pusher/server";
import { eq } from "drizzle-orm";
import { sendPush } from '../../../actions/push';

// POST /api/generate-supply-list
// { eventId, templateId }
export async function POST(req: NextRequest) {
  const { eventId, templateId } = await req.json();
  const corsHeaders = {
    "Access-Control-Allow-Origin": "https://www.gang-gear.co.za",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  if (!eventId || !templateId) {
    return new Response(JSON.stringify({ error: "Missing eventId or templateId" }), { status: 400, headers: corsHeaders });
  }

  // Step A: Load default_items from template
  const [template] = await db.select().from(outingTemplates).where(eq(outingTemplates.id, templateId));
  if (!template) {
    return new Response(JSON.stringify({ error: "Template not found" }), { status: 404, headers: corsHeaders });
  }
  const defaultItems: string[] = template.defaultItems || [];

  // Step B: Get all invited users for the event
  const attendees = await db.select().from(eventAttendees).where(eq(eventAttendees.eventId, eventId));
  const userIds = attendees.map(a => a.userId);

  // Step B: Scan user_inventory for all invited guests
  const inventories = await db.select().from(userInventory).where(userInventory.userId.in(userIds));

  // Step C: Auto-assign items
  const assignments: { item: string; userId?: string; userName?: string }[] = [];
  const unassigned: string[] = [];
  for (const item of defaultItems) {
    // Find a user who owns this item and has auto_volunteer
    const owner = inventories.find(inv => inv.itemName.toLowerCase() === item.toLowerCase() && inv.autoVolunteer);
    if (owner) {
      assignments.push({ item, userId: owner.userId });
    } else {
      unassigned.push(item);
    }
  }

  // Insert event_supplies records
  for (const assign of assignments) {
    await db.insert(eventSupplies).values({
      eventId,
      itemName: assign.item,
      assignedToUserId: assign.userId,
      status: "CLAIMED",
    });
    // Create notification
    await db.insert(notifications).values({
      userId: assign.userId,
      title: `🎒 Gear Assignment`,
      message: `You've been assigned to bring: ${assign.item} for this event.`,
      type: 'GEAR_ASSIGNED',
    });
    // Trigger Pusher event
    if (pusherServer) {
      await pusherServer.trigger(`notify-${assign.userId}`, 'notification', {
        title: `🎒 Gear Assignment`,
        message: `You've been assigned to bring: ${assign.item} for this event.`,
        type: 'GEAR_ASSIGNED',
      });
    }
    // Trigger Web Push
    await sendPush(assign.userId!, {
      title: `🎒 Gear Assignment`,
      body: `You've been assigned to bring: ${assign.item} for this event.`,
      url: `/events/${eventId}`
    });
  }
  for (const item of unassigned) {
    await db.insert(eventSupplies).values({
      eventId,
      itemName: item,
      status: "PENDING",
    });
  }

  // TODO: Trigger notifications (Pusher/Web Push)

  return new Response(JSON.stringify({ assigned: assignments, unassigned }), { status: 200, headers: corsHeaders });
}
