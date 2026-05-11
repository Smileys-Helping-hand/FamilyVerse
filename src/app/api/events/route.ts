import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

type EventColumnMeta = {
  column_name: string;
  udt_name: string;
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string) {
  return UUID_REGEX.test(value);
}

function getUdt(columns: EventColumnMeta[], columnName: string) {
  return columns.find((c) => c.column_name === columnName)?.udt_name;
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

    const columnsResult = await db.execute(sql`
      select column_name, udt_name
      from information_schema.columns
      where table_schema = 'public' and table_name = 'events'
      order by ordinal_position
    `);

    const columns = (columnsResult as any).rows as EventColumnMeta[] | undefined;
    if (!columns || columns.length === 0) {
      return NextResponse.json({ error: 'Events table not found in database' }, { status: 500 });
    }

    const creatorIdUdt = getUdt(columns, 'creator_id');
    const familyIdUdt = getUdt(columns, 'family_id');
    const coordinatesUdt = getUdt(columns, 'coordinates');

    if (creatorIdUdt === 'uuid' && !isUuid(normalizedCreatorId)) {
      return NextResponse.json({ error: 'creatorId is not compatible with database schema' }, { status: 400 });
    }

    const compatibleFamilyId = !normalizedFamilyId
      ? null
      : (familyIdUdt === 'uuid' && !isUuid(normalizedFamilyId) ? null : normalizedFamilyId);

    const compatibleCoordinates = !hasCoordinates
      ? null
      : (coordinatesUdt === 'json' || coordinatesUdt === 'jsonb' ? coordinates : null);

    const eventValuesByColumn: Record<string, unknown> = {
      title: normalizedTitle,
      location_name: typeof locationName === 'string' && locationName.trim() ? locationName.trim() : null,
      start_time: parsedStartTime,
      coordinates: compatibleCoordinates,
      creator_id: normalizedCreatorId,
      family_id: compatibleFamilyId,
      status: typeof status === 'string' && status.trim() ? status.trim() : 'UPCOMING',
      updated_at: new Date(),
    };

    const insertColumns = columns
      .map((c) => c.column_name)
      .filter((name) => name in eventValuesByColumn);

    if (insertColumns.length === 0) {
      return NextResponse.json({ error: 'Events schema is missing required columns' }, { status: 500 });
    }

    const valuesSql = sql.join(
      insertColumns.map((name) => sql`${eventValuesByColumn[name]}`),
      sql`, `,
    );
    const columnsSql = sql.raw(insertColumns.map((name) => `"${name}"`).join(', '));

    const insertResult = await db.execute(sql`
      insert into "events" (${columnsSql})
      values (${valuesSql})
      returning "id"
    `);

    const event = (insertResult as any).rows?.[0] as { id?: string } | undefined;

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
