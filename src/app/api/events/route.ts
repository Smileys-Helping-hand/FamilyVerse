import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { title, locationName, startTime, coordinates, creatorId, familyId, status } = body;

    if (!title?.trim() || !creatorId || !startTime) {
      return NextResponse.json({ error: 'title, creatorId and startTime are required' }, { status: 400 });
    }

    const [event] = await db
      .insert(events)
      .values({
        title: title.trim(),
        locationName: locationName ?? null,
        startTime: new Date(startTime),
        coordinates: coordinates ?? null,
        creatorId,
        familyId: familyId ?? null,
        status: status ?? 'UPCOMING',
      })
      .returning({ id: events.id });

    return NextResponse.json({ id: event.id }, { status: 201 });
  } catch (err) {
    console.error('[api/events POST]', err);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
