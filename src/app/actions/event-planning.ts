'use server';

import { db } from '@/lib/db';
import {
  eventCategories,
  eventTags,
  eventTemplates,
  eventChecklists,
  eventSupplies,
  eventInvitations,
  eventReminders,
  recurringEvents,
  events,
  type NewEventCategory,
  type NewEventTag, 
  type NewEventTemplate,
  type NewEventChecklist,
  type NewEventSupply,
  type NewEventInvitation,
  type NewEventReminder,
  type NewRecurringEvent,
  type NewEvent,
} from '@/lib/db/schema';
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { triggerPartyEvent } from '@/lib/pusher/server';
import crypto from 'crypto';

// ============================================
// EVENT CATEGORIES
// ============================================

export async function getEventCategories(familyId?: string) {
  try {
    const categories = await db
      .select()
      .from(eventCategories)
      .where(
        familyId 
          ? sql`${eventCategories.isSystem} = true OR ${eventCategories.familyId} = ${familyId}`
          : eq(eventCategories.isSystem, true)
      )
      .orderBy(eventCategories.name);
    
    return { success: true, categories };
  } catch (error) {
    console.error('Failed to get categories:', error);
    return { success: false, error: 'Failed to get categories', categories: [] };
  }
}

export async function createEventCategory(data: NewEventCategory) {
  try {
    const [category] = await db.insert(eventCategories).values(data).returning();
    revalidatePath('/events');
    return { success: true, category };
  } catch (error) {
    console.error('Failed to create category:', error);
    return { success: false, error: 'Failed to create category' };
  }
}

// ============================================
// EVENT TAGS
// ============================================

export async function addEventTag(eventId: string, tag: string) {
  try {
    await db.insert(eventTags).values({ eventId, tag: tag.toLowerCase() });
    await triggerPartyEvent(`event-${eventId}`, 'tag-added', { tag });
    revalidatePath(`/events/${eventId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to add tag:', error);
    return { success: false, error: 'Failed to add tag' };
  }
}

export async function getEventTags(eventId: string) {
  try {
    const tags = await db.select().from(eventTags).where(eq(eventTags.eventId, eventId));
    return { success: true, tags: tags.map(t => t.tag) };
  } catch (error) {
    console.error('Failed to get tags:', error);
    return { success: false, error: 'Failed to get tags', tags: [] };
  }
}

export async function removeEventTag(eventId: string, tag: string) {
  try {
    await db
      .delete(eventTags)
      .where(and(eq(eventTags.eventId, eventId), eq(eventTags.tag, tag)));
    await triggerPartyEvent(`event-${eventId}`, 'tag-removed', { tag });
    revalidatePath(`/events/${eventId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to remove tag:', error);
    return { success: false, error: 'Failed to remove tag' };
  }
}

// ============================================
// EVENT TEMPLATES
// ============================================

export async function getEventTemplates(familyId?: string) {
  try {
    const templates = await db
      .select()
      .from(eventTemplates)
      .where(
        familyId
          ? sql`${eventTemplates.isSystem} = true OR ${eventTemplates.familyId} = ${familyId}`
          : eq(eventTemplates.isSystem, true)
      )
      .orderBy(desc(eventTemplates.usageCount));
    
    return { success: true, templates };
  } catch (error) {
    console.error('Failed to get templates:', error);
    return { success: false, error: 'Failed to get templates', templates: [] };
  }
}

export async function createEventFromTemplate(
  templateId: string,
  eventData: {
    title: string;
    startTime: Date;
    endTime?: Date;
    locationName?: string;
    coordinates?: { lat: number; lng: number };
    creatorId: string;
    familyId?: string;
  }
) {
  try {
    // Get template
    const [template] = await db
      .select()
      .from(eventTemplates)
      .where(eq(eventTemplates.id, templateId));

    if (!template) {
      return { success: false, error: 'Template not found' };
    }

    // Create event
    const [event] = await db.insert(events).values({
      title: eventData.title,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      locationName: eventData.locationName,
      coordinates: eventData.coordinates,
      creatorId: eventData.creatorId,
      familyId: eventData.familyId,
      categoryId: template.categoryId,
      status: 'UPCOMING',
    }).returning();

    // Add tags from template
    if (template.defaultTags && template.defaultTags.length > 0) {
      await db.insert(eventTags).values(
        template.defaultTags.map((tag: string) => ({
          eventId: event.id,
          tag: tag.toLowerCase(),
        }))
      );
    }

    // Add checklist items from template
    if (template.checklistItems && template.checklistItems.length > 0) {
      await db.insert(eventChecklists).values(
        template.checklistItems.map((item: any, index: number) => ({
          eventId: event.id,
          title: item.title,
          category: item.category || 'GENERAL',
          dueDate: item.dueBeforeHours
            ? new Date(eventData.startTime.getTime() - item.dueBeforeHours * 60 * 60 * 1000)
            : undefined,
          sortOrder: index,
          createdBy: eventData.creatorId,
        }))
      );
    }

    // Increment template usage
    await db
      .update(eventTemplates)
      .set({ usageCount: sql`${eventTemplates.usageCount} + 1` })
      .where(eq(eventTemplates.id, templateId));

    revalidatePath('/events');
    return { success: true, event };
  } catch (error) {
    console.error('Failed to create event from template:', error);
    return { success: false, error: 'Failed to create event from template' };
  }
}

export async function createEventTemplate(data: NewEventTemplate) {
  try {
    const [template] = await db.insert(eventTemplates).values(data).returning();
    revalidatePath('/events');
    return { success: true, template };
  } catch (error) {
    console.error('Failed to create template:', error);
    return { success: false, error: 'Failed to create template' };
  }
}

// ============================================
// EVENT CHECKLISTS
// ============================================

export async function getEventChecklists(eventId: string) {
  try {
    const checklists = await db
      .select()
      .from(eventChecklists)
      .where(eq(eventChecklists.eventId, eventId))
      .orderBy(eventChecklists.sortOrder, eventChecklists.createdAt);
    
    return { success: true, checklists };
  } catch (error) {
    console.error('Failed to get checklists:', error);
    return { success: false, error: 'Failed to get checklists', checklists: [] };
  }
}

export async function createChecklistItem(data: NewEventChecklist) {
  try {
    const [item] = await db.insert(eventChecklists).values(data).returning();
    await triggerPartyEvent(`event-${data.eventId}`, 'checklist-added', item);
    revalidatePath(`/events/${data.eventId}`);
    return { success: true, item };
  } catch (error) {
    console.error('Failed to create checklist item:', error);
    return { success: false, error: 'Failed to create checklist item' };
  }
}

export async function updateChecklistItem(
  id: string,
  updates: {
    isCompleted?: boolean;
    completedBy?: string;
    assignedToUserId?: string;
    assignedToUserName?: string;
  }
) {
  try {
    const updateData: any = { ...updates };
    if (updates.isCompleted) {
      updateData.completedAt = new Date();
    }

    const [item] = await db
      .update(eventChecklists)
      .set(updateData)
      .where(eq(eventChecklists.id, id))
      .returning();

    if (item) {
      await triggerPartyEvent(`event-${item.eventId}`, 'checklist-updated', item);
      revalidatePath(`/events/${item.eventId}`);
    }

    return { success: true, item };
  } catch (error) {
    console.error('Failed to update checklist item:', error);
    return { success: false, error: 'Failed to update checklist item' };
  }
}

export async function deleteChecklistItem(id: string) {
  try {
    const [item] = await db
      .delete(eventChecklists)
      .where(eq(eventChecklists.id, id))
      .returning();

    if (item) {
      await triggerPartyEvent(`event-${item.eventId}`, 'checklist-deleted', { id });
      revalidatePath(`/events/${item.eventId}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to delete checklist item:', error);
    return { success: false, error: 'Failed to delete checklist item' };
  }
}

// ============================================
// EVENT INVITATIONS
// ============================================

export async function createEventInvitation(data: Omit<NewEventInvitation, 'inviteCode'>) {
  try {
    // Generate unique invite code
    const inviteCode = crypto.randomBytes(8).toString('hex');

    const [invitation] = await db.insert(eventInvitations).values({
      ...data,
      inviteCode,
    }).returning();

    await triggerPartyEvent(`event-${data.eventId}`, 'invitation-sent', {
      inviteeName: data.inviteeName,
    });

    revalidatePath(`/events/${data.eventId}`);
    return { success: true, invitation };
  } catch (error) {
    console.error('Failed to create invitation:', error);
    return { success: false, error: 'Failed to create invitation' };
  }
}

export async function getEventInvitations(eventId: string) {
  try {
    const invitations = await db
      .select()
      .from(eventInvitations)
      .where(eq(eventInvitations.eventId, eventId))
      .orderBy(desc(eventInvitations.createdAt));
    
    return { success: true, invitations };
  } catch (error) {
    console.error('Failed to get invitations:', error);
    return { success: false, error: 'Failed to get invitations', invitations: [] };
  }
}

export async function respondToInvitation(inviteCode: string, userId: string) {
  try {
    const [invitation] = await db
      .select()
      .from(eventInvitations)
      .where(eq(eventInvitations.inviteCode, inviteCode));

    if (!invitation) {
      return { success: false, error: 'Invalid invitation code' };
    }

    // Update invitation status
    await db
      .update(eventInvitations)
      .set({ status: 'RESPONDED', respondedAt: new Date() })
      .where(eq(eventInvitations.inviteCode, inviteCode));

    return { success: true, invitation };
  } catch (error) {
    console.error('Failed to respond to invitation:', error);
    return { success: false, error: 'Failed to respond to invitation' };
  }
}

// ============================================
// EVENT REMINDERS
// ============================================

export async function createEventReminder(data: NewEventReminder) {
  try {
    const [reminder] = await db.insert(eventReminders).values(data).returning();
    return { success: true, reminder };
  } catch (error) {
    console.error('Failed to create reminder:', error);
    return { success: false, error: 'Failed to create reminder' };
  }
}

export async function getPendingReminders() {
  try {
    const now = new Date();
    const reminders = await db
      .select()
      .from(eventReminders)
      .where(
        and(
          eq(eventReminders.isSent, false),
          sql`${eventReminders.reminderTime} <= ${now}`
        )
      );
    
    return { success: true, reminders };
  } catch (error) {
    console.error('Failed to get pending reminders:', error);
    return { success: false, error: 'Failed to get pending reminders', reminders: [] };
  }
}

export async function markReminderSent(id: string) {
  try {
    await db
      .update(eventReminders)
      .set({ isSent: true, sentAt: new Date() })
      .where(eq(eventReminders.id, id));
    
    return { success: true };
  } catch (error) {
    console.error('Failed to mark reminder sent:', error);
    return { success: false, error: 'Failed to mark reminder sent' };
  }
}

// ============================================
// RECURRING EVENTS
// ============================================

export async function createRecurringEvent(data: NewRecurringEvent) {
  try {
    const [recurring] = await db.insert(recurringEvents).values(data).returning();
    return { success: true, recurring };
  } catch (error) {
    console.error('Failed to create recurring event:', error);
    return { success: false, error: 'Failed to create recurring event' };
  }
}

export async function generateRecurringInstances(recurringId: string, lookAheadDays: number = 90) {
  try {
    const [recurring] = await db
      .select()
      .from(recurringEvents)
      .where(eq(recurringEvents.id, recurringId));

    if (!recurring) {
      return { success: false, error: 'Recurring event not found' };
    }

    // Get master event
    const [masterEvent] = await db
      .select()
      .from(events)
      .where(eq(events.id, recurring.masterEventId));

    if (!masterEvent) {
      return { success: false, error: 'Master event not found' };
    }

    const instances: string[] = [];
    const endLookup = new Date();
    endLookup.setDate(endLookup.getDate() + lookAheadDays);

    let currentDate = new Date(recurring.startDate);
    let occurrenceCount = 0;

    while (currentDate <= endLookup) {
      // Check if we've reached max occurrences
      if (recurring.maxOccurrences && occurrenceCount >= recurring.maxOccurrences) {
        break;
      }

      // Check if we've reached end date
      if (recurring.endDate && currentDate > new Date(recurring.endDate)) {
        break;
      }

      // Create event instance
      const [instance] = await db.insert(events).values({
        title: masterEvent.title,
        description: masterEvent.description,
        startTime: currentDate,
        endTime: masterEvent.endTime
          ? new Date(currentDate.getTime() + (new Date(masterEvent.endTime).getTime() - new Date(masterEvent.startTime).getTime()))
          : undefined,
        locationName: masterEvent.locationName,
        coordinates: masterEvent.coordinates,
        categoryId: masterEvent.categoryId,
        heroImageUrl: masterEvent.heroImageUrl,
        creatorId: masterEvent.creatorId,
        familyId: masterEvent.familyId,
        isRecurring: true,
        status: 'UPCOMING',
      }).returning();

      instances.push(instance.id);

      // Calculate next occurrence
      switch (recurring.recurrencePattern) {
        case 'DAILY':
          currentDate.setDate(currentDate.getDate() + recurring.recurrenceInterval);
          break;
        case 'WEEKLY':
          currentDate.setDate(currentDate.getDate() + (7 * recurring.recurrenceInterval));
          break;
        case 'MONTHLY':
          currentDate.setMonth(currentDate.getMonth() + recurring.recurrenceInterval);
          break;
        case 'YEARLY':
          currentDate.setFullYear(currentDate.getFullYear() + recurring.recurrenceInterval);
          break;
      }

      occurrenceCount++;
    }

    // Update generated IDs
    await db
      .update(recurringEvents)
      .set({ generatedIds: instances })
      .where(eq(recurringEvents.id, recurringId));

    revalidatePath('/events');
    return { success: true, instances };
  } catch (error) {
    console.error('Failed to generate recurring instances:', error);
    return { success: false, error: 'Failed to generate recurring instances' };
  }
}

// ============================================
// QUICK EVENT CREATION
// ============================================

export async function quickCreateEvent(data: {
  title: string;
  startTime: Date;
  categorySlug: string;
  creatorId: string;
  familyId?: string;
}) {
  try {
    // Get category by slug
    const [category] = await db
      .select()
      .from(eventCategories)
      .where(eq(eventCategories.slug, data.categorySlug))
      .limit(1);

    const [event] = await db.insert(events).values({
      title: data.title,
      startTime: data.startTime,
      categoryId: category?.id,
      creatorId: data.creatorId,
      familyId: data.familyId,
      status: 'UPCOMING',
    }).returning();

    revalidatePath('/events');
    return { success: true, event };
  } catch (error) {
    console.error('Failed to quick create event:', error);
    return { success: false, error: 'Failed to quick create event' };
  }
}

// ============================================
// AI EVENT RESEARCH & PLANNING
// ============================================

const AiResearchSchema = z.object({
  placeDetails: z.string().describe("Venue accessibility and highlight"),
  weatherAdvice: z.string().describe("Precise weather considerations"),
  suggestedSupplies: z.array(z.string()).describe("List of 3-5 supplies to auto-insert"),
  suggestedTasks: z.array(z.string()).describe("List of 3-5 planning tasks to auto-insert"),
});

export async function generateAiEventPlanAction(eventId: string, locationName: string, description: string) {
  try {
    const prompt = `Research and plan an event at ${locationName}. Context: ${description}. 
    Provide place details, weather advice for the current season, suggested supplies to bring, and planning tasks.`;

    const { output } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: prompt,
      output: { schema: AiResearchSchema }
    });

    if (!output) throw new Error("Failed to generate AI plan");

    // 1. Save research to event
    await db.update(events).set({
      aiResearch: output
    }).where(eq(events.id, eventId));

    // 2. Insert Tasks into eventChecklists
    if (output.suggestedTasks && output.suggestedTasks.length > 0) {
      const taskInserts = output.suggestedTasks.map((task, i) => ({
        eventId,
        title: task,
        category: 'AI_SUGGESTION',
        sortOrder: i,
        createdBy: 'system'
      }));
      await db.insert(eventChecklists).values(taskInserts);
    }

    // 3. Insert Supplies into eventSupplies
    if (output.suggestedSupplies && output.suggestedSupplies.length > 0) {
      const supplyInserts = output.suggestedSupplies.map(supply => ({
        eventId,
        itemName: supply,
        quantityNeeded: '1',
        category: 'AI_SUGGESTION',
        status: 'NEEDED'
      }));
      await db.insert(eventSupplies).values(supplyInserts);
    }

    revalidatePath(`/events/${eventId}`);
    return { success: true, research: output };
  } catch (error: any) {
    console.error('AI Research Error:', error);
    return { success: false, error: error.message };
  }
}
