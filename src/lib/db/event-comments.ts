'use server';

import { db } from './index';
import {
  eventComments,
  commentLikes,
  commentApprovals,
  type NewEventComment,
  type NewCommentLike,
} from './schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function createEventComment(
  eventId: string,
  userName: string,
  content: string,
  userId?: string,
  isAnonymous: boolean = false
) {
  try {
    const id = uuidv4();
    const shouldApprove = !isAnonymous && userId; // Auto-approve for registered users

    const result = await db
      .insert(eventComments)
      .values({
        id,
        eventId,
        userId: userId || null,
        userName,
        content,
        isAnonymous,
        isApproved: shouldApprove,
      })
      .returning();

    if (shouldApprove && result[0]) {
      await db.insert(commentApprovals).values({
        id: uuidv4(),
        commentId: id,
        approvedBy: userId || 'SYSTEM',
      });
    }

    return { success: true, comment: result[0] };
  } catch (error) {
    console.error('Failed to create comment:', error);
    return { success: false, error: 'Failed to create comment' };
  }
}

export async function getEventComments(eventId: string, limit: number = 50, parentCommentId?: string) {
  try {
    const query = db
      .select()
      .from(eventComments)
      .where(
        parentCommentId
          ? and(
              eq(eventComments.eventId, eventId),
              eq(eventComments.parentCommentId, parentCommentId),
              eq(eventComments.isApproved, true)
            )
          : and(
              eq(eventComments.eventId, eventId),
              sql`${eventComments.parentCommentId} IS NULL`,
              eq(eventComments.isApproved, true)
            )
      )
      .orderBy(desc(eventComments.createdAt))
      .limit(limit);

    const comments = await query;
    return { success: true, comments };
  } catch (error) {
    console.error('Failed to get comments:', error);
    return { success: false, comments: [] };
  }
}

export async function getPendingComments(eventId: string) {
  try {
    const comments = await db
      .select()
      .from(eventComments)
      .where(
        and(
          eq(eventComments.eventId, eventId),
          eq(eventComments.isApproved, false)
        )
      )
      .orderBy(desc(eventComments.createdAt));

    return { success: true, comments };
  } catch (error) {
    console.error('Failed to get pending comments:', error);
    return { success: false, comments: [] };
  }
}

export async function approveComment(commentId: string, approvedBy: string) {
  try {
    await db
      .update(eventComments)
      .set({ isApproved: true })
      .where(eq(eventComments.id, commentId));

    await db.insert(commentApprovals).values({
      id: uuidv4(),
      commentId,
      approvedBy,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to approve comment:', error);
    return { success: false, error: 'Failed to approve comment' };
  }
}

export async function deleteComment(commentId: string) {
  try {
    await db.delete(eventComments).where(eq(eventComments.id, commentId));
    return { success: true };
  } catch (error) {
    console.error('Failed to delete comment:', error);
    return { success: false, error: 'Failed to delete comment' };
  }
}

export async function likeComment(commentId: string, userId: string) {
  try {
    // Check if already liked
    const existing = await db
      .select()
      .from(commentLikes)
      .where(
        and(
          eq(commentLikes.commentId, commentId),
          eq(commentLikes.userId, userId)
        )
      );

    if (existing.length > 0) {
      return { success: false, error: 'Already liked' };
    }

    await db.insert(commentLikes).values({
      id: uuidv4(),
      commentId,
      userId,
    });

    // Update likes count
    const likes = await db
      .select()
      .from(commentLikes)
      .where(eq(commentLikes.commentId, commentId));

    await db
      .update(eventComments)
      .set({ likesCount: likes.length })
      .where(eq(eventComments.id, commentId));

    return { success: true };
  } catch (error) {
    console.error('Failed to like comment:', error);
    return { success: false, error: 'Failed to like comment' };
  }
}

export async function unlikeComment(commentId: string, userId: string) {
  try {
    await db
      .delete(commentLikes)
      .where(
        and(
          eq(commentLikes.commentId, commentId),
          eq(commentLikes.userId, userId)
        )
      );

    // Update likes count
    const likes = await db
      .select()
      .from(commentLikes)
      .where(eq(commentLikes.commentId, commentId));

    await db
      .update(eventComments)
      .set({ likesCount: likes.length })
      .where(eq(eventComments.id, commentId));

    return { success: true };
  } catch (error) {
    console.error('Failed to unlike comment:', error);
    return { success: false, error: 'Failed to unlike comment' };
  }
}

export async function replyToComment(
  parentCommentId: string,
  eventId: string,
  userName: string,
  content: string,
  userId?: string,
  isAnonymous: boolean = false
) {
  try {
    const id = uuidv4();
    const shouldApprove = !isAnonymous && userId;

    const result = await db
      .insert(eventComments)
      .values({
        id,
        eventId,
        userId: userId || null,
        userName,
        content,
        isAnonymous,
        parentCommentId,
        isApproved: shouldApprove,
      })
      .returning();

    if (shouldApprove && result[0]) {
      await db.insert(commentApprovals).values({
        id: uuidv4(),
        commentId: id,
        approvedBy: userId || 'SYSTEM',
      });
    }

    return { success: true, comment: result[0] };
  } catch (error) {
    console.error('Failed to create reply:', error);
    return { success: false, error: 'Failed to create reply' };
  }
}

export async function getCommentCount(eventId: string) {
  try {
    const result = await db
      .select()
      .from(eventComments)
      .where(
        and(
          eq(eventComments.eventId, eventId),
          eq(eventComments.isApproved, true)
        )
      );

    return { success: true, count: result.length };
  } catch (error) {
    console.error('Failed to get comment count:', error);
    return { success: false, count: 0 };
  }
}
