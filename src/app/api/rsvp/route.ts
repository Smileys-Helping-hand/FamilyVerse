import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { guestRsvps, eventAttendees, events } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  let token: string, guestName: string, status: string;

  try {
    const body = await req.json();
    token = String(body.token ?? '').trim();
    guestName = String(body.guestName ?? '').trim().slice(0, 80);
    status = body.status === 'CANT_MAKE_IT' ? 'CANT_MAKE_IT' : 'GOING';

    if (!token) throw new Error('missing token');
    if (!guestName && status === 'GOING') throw new Error('missing guestName');
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid body' },
      { status: 400 },
    );
  }

  // 1. Look up the RSVP token
  const [rsvp] = await db
    .select()
    .from(guestRsvps)
    .where(eq(guestRsvps.token, token));

  if (!rsvp) {
    return NextResponse.json({ error: 'Invite not found or expired' }, { status: 404 });
  }

  if (rsvp.expiresAt < new Date()) {
    return NextResponse.json({ error: 'This invite link has expired' }, { status: 410 });
  }

  // 2. Update the guestRsvps record
  await db
    .update(guestRsvps)
    .set({
      guestName: guestName || rsvp.guestName,
      rsvpStatus: status as 'GOING' | 'CANT_MAKE_IT',
      respondedAt: new Date(),
      usedAt: rsvp.usedAt ?? new Date(),
    })
    .where(eq(guestRsvps.token, token));

  // 3. Upsert into event_attendees (guest identified by a stable synthetic uid: "guest:<token>")
  const guestUserId = `guest:${token}`;
  const displayName = guestName || 'Guest';

  const [existing] = await db
    .select({ id: eventAttendees.id })
    .from(eventAttendees)
    .where(
      and(
        eq(eventAttendees.eventId, rsvp.eventId),
        eq(eventAttendees.userId, guestUserId),
      ),
    );

  if (existing) {
    await db
      .update(eventAttendees)
      .set({
        rsvpStatus: status as 'GOING' | 'CANT_MAKE_IT',
        userName: displayName,
        respondedAt: new Date(),
      })
      .where(eq(eventAttendees.id, existing.id));
  } else {
    await db.insert(eventAttendees).values({
      eventId: rsvp.eventId,
      userId: guestUserId,
      userName: displayName,
      rsvpStatus: status as 'GOING' | 'CANT_MAKE_IT',
      respondedAt: new Date(),
    });
  }

  // 4. Build the response with a cookie that remembers the guest
  const response = NextResponse.json({ ok: true, eventId: rsvp.eventId });
  response.cookies.set('gg_guest_name', displayName, {
    path: '/',
    maxAge: 60 * 60 * 24 * 90, // 90 days
    httpOnly: false, // Client-readable for welcome messages
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  response.cookies.set('gg_guest_token', token, {
    path: '/',
    maxAge: 60 * 60 * 24 * 90,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}
