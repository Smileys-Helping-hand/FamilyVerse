'use server';

import { db } from '@/lib/db';
import { gangs, gangInvitations, familyMembers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

/**
 * Create a gang invitation token
 */
export async function createGangInvitationAction(
  familyId: string,
  invitedBy: string,
  invitedByName: string
) {
  try {
    // Generate a unique invitation token (short & shareable)
    const token = crypto.randomBytes(6).toString('hex').toUpperCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiration

    await db.insert(gangInvitations).values({
      familyId,
      token,
      invitedBy,
      invitedByName,
      expiresAt,
      status: 'PENDING',
    });

    revalidatePath(`/dashboard/the-gang`);
    return {
      success: true,
      token,
      inviteLink: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://familyverse.vercel.app'}/join-gang/${token}`,
      whatsappLink: generateWhatsAppLink(invitedByName, token),
    };
  } catch (error: any) {
    console.error('Error creating gang invitation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Accept a gang invitation
 */
export async function acceptGangInvitationAction(
  token: string,
  guestName: string,
  guestEmail?: string
) {
  try {
    // Find the invitation
    const [invitation] = await db.query.gangInvitations.findMany({
      where: and(
        eq(gangInvitations.token, token),
        eq(gangInvitations.status, 'PENDING')
      ),
    });

    if (!invitation) {
      return { success: false, error: 'Invalid or expired invitation' };
    }

    if (new Date() > invitation.expiresAt) {
      return { success: false, error: 'Invitation has expired' };
    }

    // Add as family member
    const member = await db.insert(familyMembers).values({
      familyId: invitation.familyId,
      userId: `guest_${Date.now()}`,
      name: guestName,
      email: guestEmail,
      role: 'member',
      addedBy: invitation.invitedBy,
    }).returning();

    // Mark invitation as accepted
    await db.update(gangInvitations)
      .set({ status: 'ACCEPTED', acceptedAt: new Date() })
      .where(eq(gangInvitations.id, invitation.id));

    revalidatePath(`/dashboard/the-gang`);
    revalidatePath(`/gang`);

    return {
      success: true,
      member: member[0],
      familyId: invitation.familyId,
    };
  } catch (error: any) {
    console.error('Error accepting invitation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get pending invitations for a family
 */
export async function getPendingInvitationsAction(familyId: string) {
  try {
    const invitations = await db.query.gangInvitations.findMany({
      where: and(
        eq(gangInvitations.familyId, familyId),
        eq(gangInvitations.status, 'PENDING')
      ),
    });
    return { success: true, invitations };
  } catch (error: any) {
    console.error('Error fetching invitations:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Revoke an invitation
 */
export async function revokeInvitationAction(invitationId: number) {
  try {
    await db.update(gangInvitations)
      .set({ status: 'REVOKED' })
      .where(eq(gangInvitations.id, invitationId));

    revalidatePath(`/dashboard/the-gang`);
    return { success: true };
  } catch (error: any) {
    console.error('Error revoking invitation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate WhatsApp link for invitation
 */
function generateWhatsAppLink(inviterName: string, token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://familyverse.vercel.app';
  const joinLink = `${baseUrl}/join-gang/${token}`;
  const message = `Hey! 👋 ${inviterName} invited me to join their family gang on FamilyVerse! Click here to join: ${joinLink}`;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/?text=${encodedMessage}`;
}

/**
 * Add a quick friend (for easier friend system)
 */
export async function addQuickFriendAction(
  userId: string,
  friendName: string,
  friendPhone?: string,
  avatarEmoji?: string
) {
  try {
    // Import friends table
    const { friends } = await import('@/lib/db/schema');

    await db.insert(friends).values({
      userId,
      friendName,
      friendPhone,
      avatarEmoji: avatarEmoji || '😎',
      status: 'ACTIVE',
    });

    revalidatePath('/friends');
    return { success: true };
  } catch (error: any) {
    console.error('Error adding friend:', error);
    return { success: false, error: error.message };
  }
}
