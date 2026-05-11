import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
import { createHash } from 'node:crypto';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string) {
  return UUID_REGEX.test(value);
}

type ColumnMeta = {
  column_name: string;
  udt_name: string;
};

function toRows<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === 'object' && Array.isArray((result as any).rows)) {
    return (result as any).rows as T[];
  }
  return [];
}

function uidToDeterministicUuid(uid: string) {
  const hex = createHash('md5').update(uid).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
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

    const baseValues = {
      title: normalizedTitle,
      locationName: typeof locationName === 'string' && locationName.trim() ? locationName.trim() : null,
      startTime: parsedStartTime,
      coordinates: hasCoordinates ? coordinates : null,
      status: typeof status === 'string' && status.trim() ? status.trim() : 'UPCOMING',
      updatedAt: new Date(),
    };

    let event: { id?: string } | undefined;
    let candidateCreatorId = normalizedCreatorId;
    let candidateFamilyId = normalizedFamilyId || null;

    try {
      const [inserted] = await db
        .insert(events)
        .values({
          ...baseValues,
          creatorId: candidateCreatorId,
          familyId: candidateFamilyId,
        })
        .returning({ id: events.id });
      event = inserted;
    } catch (insertErr) {
      const message = insertErr instanceof Error ? insertErr.message : String(insertErr);

      if (message.includes('relation "events" does not exist')) {
        return NextResponse.json({ error: 'Events table is missing in production DB. Run migrations.' }, { status: 500 });
      }

      // Some environments use UUID for creator_id/family_id while app uses Firebase/text IDs.
      if (message.includes('invalid input syntax for type uuid')) {
        const eventColsResult = await db.execute(sql`
          select column_name, udt_name
          from information_schema.columns
          where table_schema = 'public' and table_name = 'events'
        `);
        const eventCols = toRows<ColumnMeta>(eventColsResult);
        const creatorCol = eventCols.find((c) => c.column_name === 'creator_id');
        const familyCol = eventCols.find((c) => c.column_name === 'family_id');

        if (creatorCol?.udt_name === 'uuid' && !isUuid(candidateCreatorId)) {
          const usersColsResult = await db.execute(sql`
            select column_name, udt_name
            from information_schema.columns
            where table_schema = 'public' and table_name = 'users'
          `);
          const usersCols = toRows<ColumnMeta>(usersColsResult);
          const hasUid = usersCols.some((c) => c.column_name === 'uid');
          const hasUuidId = usersCols.some((c) => c.column_name === 'id' && c.udt_name === 'uuid');

          if (hasUid && hasUuidId) {
            const mappedUserResult = await db.execute(sql`
              select id
              from users
              where uid = ${candidateCreatorId}
              limit 1
            `);
            const mappedRows = toRows<{ id: string }>(mappedUserResult);
            if (mappedRows[0]?.id && isUuid(mappedRows[0].id)) {
              candidateCreatorId = mappedRows[0].id;
            } else {
              candidateCreatorId = uidToDeterministicUuid(candidateCreatorId);
            }
          } else {
            candidateCreatorId = uidToDeterministicUuid(candidateCreatorId);
          }
        }

        if (familyCol?.udt_name === 'uuid' && candidateFamilyId && !isUuid(candidateFamilyId)) {
          candidateFamilyId = null;
        }

        const [fallbackInserted] = await db
          .insert(events)
          .values({
            ...baseValues,
            creatorId: candidateCreatorId,
            familyId: candidateFamilyId,
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
