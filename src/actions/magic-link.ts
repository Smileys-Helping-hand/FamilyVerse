'use server';

import { db } from '@/lib/db';
import { guestRsvps } from '@/lib/db/schema';
import { randomBytes } from 'crypto';

/**
 * Creates a Fast-Pass magic link for a guest to RSVP without signing up.
 * Returns the full URL to share with the guest.
 */
export async function createMagicLink({
  eventId,
  invitedByUserId,
  ttlDays = 14,
}: {
  eventId: string;
  invitedByUserId: string;
  ttlDays?: number;
}): Promise<string> {
  const token = randomBytes(32).toString('hex'); // 64-char hex string
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

  await db.insert(guestRsvps).values({
    token,
    eventId,
    invitedByUserId,
    expiresAt,
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return `${baseUrl}/join/${token}`;
}
