import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string) {
  return UUID_REGEX.test(value);
}

export async function POST(req: NextRequest) {
  let body: any;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
    }

    const {
      title,
      locationName,
      startTime,
      coordinates,
      creatorId,
      familyId,
      status,
    } = body ?? {};

    const normalizedTitle = typeof title === 'string' ? title.trim() : '';
    const normalizedCreatorId = typeof creatorId === 'string' ? creatorId.trim() : '';
    const normalizedFamilyId = typeof familyId === 'string' ? familyId.trim() : '';
    const parsedStartTime = new Date(startTime);
    const isStartTimeValid = !Number.isNaN(parsedStartTime.getTime());

    if (!normalizedTitle || !normalizedCreatorId || !startTime) {
      return NextResponse.json({ error: 'title, creatorId and startTime are required' }, { status: 400 });
    }

    if (!isStartTimeValid) {
      return NextResponse.json({ error: 'Invalid startTime value' }, { status: 400 });
    }

    const hasCoordinates = coordinates !== null && coordinates !== undefined;
    if (
      hasCoordinates
      && (typeof coordinates !== 'object'
        || typeof coordinates.lat !== 'number'
        || typeof coordinates.lng !== 'number'
        || !Number.isFinite(coordinates.lat)
        || !Number.isFinite(coordinates.lng))
    ) {
      return NextResponse.json({ error: 'coordinates must be { lat: number, lng: number }' }, { status: 400 });
    }

    const candidateFamilyId = !normalizedFamilyId
      ? null
      : (isUuid(normalizedFamilyId) ? normalizedFamilyId : normalizedFamilyId);

    const baseValues = {
      title: normalizedTitle,
      locationName: typeof locationName === 'string' && locationName.trim() ? locationName.trim() : null,
      startTime: parsedStartTime,
      coordinates: hasCoordinates ? coordinates : null,
      creatorId: normalizedCreatorId,
      status: typeof status === 'string' && status.trim() ? status.trim() : 'UPCOMING',
      updatedAt: new Date(),
    };

    let event: { id?: string } | undefined;

    try {
      const [inserted] = await db
        .insert(events)
        .values({
          ...baseValues,
          familyId: candidateFamilyId,
        })
        .returning({ id: events.id });
      event = inserted;
    } catch (insertErr) {
      const message = insertErr instanceof Error ? insertErr.message : String(insertErr);

      if (message.includes('relation "events" does not exist')) {
        return NextResponse.json({ error: 'Events table is missing in production DB. Run migrations.' }, { status: 500 });
      }

      // Some environments use UUID for family_id while auth family IDs are non-UUID strings.
      if (message.includes('invalid input syntax for type uuid') && normalizedFamilyId) {
        const [fallbackInserted] = await db
          .insert(events)
          .values({
            ...baseValues,
            familyId: null,
          })
          .returning({ id: events.id });
        event = fallbackInserted;
      } else {
        throw insertErr;
      }
    }

    if (!event?.id) {
      return NextResponse.json({ error: 'Event creation failed' }, { status: 500 });
    }

    return NextResponse.json({ id: event.id }, { status: 201 });
  } catch (err) {
    console.error('[api/events POST]', err);
    if (err instanceof Error) {
      return NextResponse.json({ error: `Failed to create event: ${err.message}` }, { status: 500 });
    }

    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
