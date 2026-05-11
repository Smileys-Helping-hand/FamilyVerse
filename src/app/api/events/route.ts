import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
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

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

async function getEventColumns() {
  try {
    const result = await db.execute(sql`
      select column_name, udt_name
      from information_schema.columns
      where table_schema = 'public' and table_name = 'events'
    `);
    return toRows<ColumnMeta>(result);
  } catch {
    return [] as ColumnMeta[];
  }
}

async function tryMapCreatorId(firebaseUid: string) {
  try {
    const result = await db.execute(sql`
      select id
      from users
      where uid = ${firebaseUid}
      limit 1
    `);
    const rows = toRows<{ id: string }>(result);
    if (rows[0]?.id && isUuid(rows[0].id)) {
      return rows[0].id;
    }
  } catch {
    // Ignore mapping errors; fallback will be used.
  }

  return uidToDeterministicUuid(firebaseUid);
}

async function insertEventDynamic(values: Record<string, unknown>) {
  const columns = Object.keys(values);
  const columnsSql = sql.raw(columns.map((col) => `"${col}"`).join(', '));
  const valueSql = sql.join(columns.map((col) => sql`${values[col]}`), sql`, `);
  const result = await db.execute(sql`
    insert into "events" (${columnsSql})
    values (${valueSql})
    returning "id"
  `);

  const rows = toRows<{ id?: string }>(result);
  return rows[0]?.id ?? null;
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

    const eventColumns = await getEventColumns();
    const creatorCol = eventColumns.find((c) => c.column_name === 'creator_id');
    const familyCol = eventColumns.find((c) => c.column_name === 'family_id');

    let candidateCreatorId = normalizedCreatorId;
    let candidateFamilyId: string | null = normalizedFamilyId || null;

    if (creatorCol?.udt_name === 'uuid' && !isUuid(candidateCreatorId)) {
      candidateCreatorId = await tryMapCreatorId(candidateCreatorId);
    }
    if (familyCol?.udt_name === 'uuid' && candidateFamilyId && !isUuid(candidateFamilyId)) {
      candidateFamilyId = null;
    }

    const insertValues: Record<string, unknown> = {
      title: normalizedTitle,
      start_time: parsedStartTime,
      location_name: typeof locationName === 'string' && locationName.trim() ? locationName.trim() : null,
      coordinates: hasCoordinates ? coordinates : null,
      creator_id: candidateCreatorId,
      family_id: candidateFamilyId,
      status: typeof status === 'string' && status.trim() ? status.trim() : 'UPCOMING',
      is_recurring: false,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // If schema info is available, pre-trim to known columns only.
    if (eventColumns.length > 0) {
      const allowed = new Set(eventColumns.map((c) => c.column_name));
      for (const key of Object.keys(insertValues)) {
        if (!allowed.has(key)) {
          delete insertValues[key];
        }
      }
    }

    let createdId: string | null = null;
    let lastError = '';

    for (let attempt = 0; attempt < 6; attempt += 1) {
      try {
        createdId = await insertEventDynamic(insertValues);
        if (createdId) break;
      } catch (insertError) {
        const message = getErrorMessage(insertError);
        lastError = message;

        if (message.includes('relation "events" does not exist')) {
          return NextResponse.json({ error: 'Events table is missing in production DB. Run migrations.' }, { status: 500 });
        }

        const missingColumn = message.match(/column "([^"]+)" of relation "events" does not exist/i)?.[1];
        if (missingColumn && missingColumn in insertValues) {
          delete insertValues[missingColumn];
          continue;
        }

        if (message.includes('invalid input syntax for type uuid')) {
          if (insertValues.creator_id && typeof insertValues.creator_id === 'string' && !isUuid(insertValues.creator_id)) {
            insertValues.creator_id = await tryMapCreatorId(insertValues.creator_id);
            continue;
          }

          if (insertValues.family_id && typeof insertValues.family_id === 'string' && !isUuid(insertValues.family_id)) {
            insertValues.family_id = null;
            continue;
          }
        }

        if (message.toLowerCase().includes('coordinates')) {
          insertValues.coordinates = null;
          continue;
        }

        throw insertError;
      }
    }

    if (!createdId) {
      if (lastError) {
        return NextResponse.json({ error: `Failed to create event: ${lastError}` }, { status: 500 });
      }
      return NextResponse.json({ error: 'Event creation failed' }, { status: 500 });
    }

    return NextResponse.json({ id: createdId }, { status: 201 });
  } catch (err) {
    console.error('[api/events POST]', err);
    if (err instanceof Error) {
      return NextResponse.json({ error: `Failed to create event: ${err.message}` }, { status: 500 });
    }

    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
