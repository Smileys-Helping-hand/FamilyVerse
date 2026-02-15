'use server';

import { db } from '@/lib/db';
import {
  eventMedia,
  eventChatMessages,
  type NewEventMedia,
  type NewEventChatMessage,
} from '@/lib/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { triggerPartyEvent } from '@/lib/pusher/server';
import { revalidatePath } from 'next/cache';

// ============================================
// PHOTO GALLERY (MEMORY BANK)
// ============================================

export async function uploadEventMedia(data: NewEventMedia) {
  try {
    const [media] = await db.insert(eventMedia).values(data).returning();
    
    await triggerPartyEvent(`event-${data.eventId}`, 'media-uploaded', {
      media,
      uploaderName: data.uploaderName,
    });
    
    revalidatePath(`/events/${data.eventId}/gallery`);
    return { success: true, media };
  } catch (error) {
    console.error('Failed to upload media:', error);
    return { success: false, error: 'Failed to upload media' };
  }
}

export async function getEventMedia(eventId: string) {
  try {
    const media = await db
      .select()
      .from(eventMedia)
      .where(eq(eventMedia.eventId, eventId))
      .orderBy(desc(eventMedia.createdAt));

    return { success: true, media };
  } catch (error) {
    console.error('Failed to get event media:', error);
    return { success: false, error: 'Failed to get media', media: [] };
  }
}

export async function likeMedia(mediaId: string, userId: string, eventId: string) {
  try {
    const [existing] = await db.select().from(eventMedia).where(eq(eventMedia.id, mediaId));
    
    if (!existing) {
      return { success: false, error: 'Media not found' };
    }

    const likedBy = existing.likedBy || [];
    const hasLiked = likedBy.includes(userId);

    let newLikedBy: string[];
    let newLikes: number;

    if (hasLiked) {
      // Unlike
      newLikedBy = likedBy.filter(id => id !== userId);
      newLikes = existing.likes - 1;
    } else {
      // Like
      newLikedBy = [...likedBy, userId];
      newLikes = existing.likes + 1;
    }

    await db
      .update(eventMedia)
      .set({ likes: newLikes, likedBy: newLikedBy })
      .where(eq(eventMedia.id, mediaId));

    const [updated] = await db.select().from(eventMedia).where(eq(eventMedia.id, mediaId));

    await triggerPartyEvent(`event-${eventId}`, 'media-liked', updated);

    revalidatePath(`/events/${eventId}/gallery`);
    return { success: true, media: updated };
  } catch (error) {
    console.error('Failed to like media:', error);
    return { success: false, error: 'Failed to like media' };
  }
}

export async function deleteMedia(mediaId: string, userId: string, eventId: string) {
  try {
    const [existing] = await db.select().from(eventMedia).where(eq(eventMedia.id, mediaId));
    
    if (!existing) {
      return { success: false, error: 'Media not found' };
    }

    // Only uploader can delete
    if (existing.uploaderId !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    await db.delete(eventMedia).where(eq(eventMedia.id, mediaId));

    await triggerPartyEvent(`event-${eventId}`, 'media-deleted', { mediaId });

    revalidatePath(`/events/${eventId}/gallery`);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete media:', error);
    return { success: false, error: 'Failed to delete media' };
  }
}

export async function updateMediaCaption(mediaId: string, caption: string, userId: string, eventId: string) {
  try {
    const [existing] = await db.select().from(eventMedia).where(eq(eventMedia.id, mediaId));
    
    if (!existing || existing.uploaderId !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    await db
      .update(eventMedia)
      .set({ caption })
      .where(eq(eventMedia.id, mediaId));

    revalidatePath(`/events/${eventId}/gallery`);
    return { success: true };
  } catch (error) {
    console.error('Failed to update caption:', error);
    return { success: false, error: 'Failed to update caption' };
  }
}

// ============================================
// EVENT CHAT (CONTEXTUAL DISCUSSION)
// ============================================

export async function sendEventMessage(data: NewEventChatMessage) {
  try {
    const [message] = await db.insert(eventChatMessages).values(data).returning();
    
    await triggerPartyEvent(`event-${data.eventId}`, 'chat-message', message);
    
    revalidatePath(`/events/${data.eventId}`);
    return { success: true, message };
  } catch (error) {
    console.error('Failed to send message:', error);
    return { success: false, error: 'Failed to send message' };
  }
}

export async function getEventMessages(eventId: string, limit = 100) {
  try {
    const messages = await db
      .select()
      .from(eventChatMessages)
      .where(and(
        eq(eventChatMessages.eventId, eventId),
        sql`${eventChatMessages.deletedAt} IS NULL`
      ))
      .orderBy(eventChatMessages.createdAt)
      .limit(limit);

    return { success: true, messages };
  } catch (error) {
    console.error('Failed to get messages:', error);
    return { success: false, error: 'Failed to get messages', messages: [] };
  }
}

export async function deleteEventMessage(messageId: string, userId: string, eventId: string) {
  try {
    const [existing] = await db
      .select()
      .from(eventChatMessages)
      .where(eq(eventChatMessages.id, messageId));
    
    if (!existing || existing.senderId !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Soft delete
    await db
      .update(eventChatMessages)
      .set({ deletedAt: new Date() })
      .where(eq(eventChatMessages.id, messageId));

    await triggerPartyEvent(`event-${eventId}`, 'chat-message-deleted', { messageId });

    revalidatePath(`/events/${eventId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete message:', error);
    return { success: false, error: 'Failed to delete message' };
  }
}

export async function editEventMessage(messageId: string, newMessage: string, userId: string, eventId: string) {
  try {
    const [existing] = await db
      .select()
      .from(eventChatMessages)
      .where(eq(eventChatMessages.id, messageId));
    
    if (!existing || existing.senderId !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    await db
      .update(eventChatMessages)
      .set({ message: newMessage, updatedAt: new Date() })
      .where(eq(eventChatMessages.id, messageId));

    const [updated] = await db
      .select()
      .from(eventChatMessages)
      .where(eq(eventChatMessages.id, messageId));

    await triggerPartyEvent(`event-${eventId}`, 'chat-message-edited', updated);

    revalidatePath(`/events/${eventId}`);
    return { success: true, message: updated };
  } catch (error) {
    console.error('Failed to edit message:', error);
    return { success: false, error: 'Failed to edit message' };
  }
}
