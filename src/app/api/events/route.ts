import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { createHash } from 'node:crypto';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string) {
  return UUID_REGEX.test(value);
}

function uidToDeterministicUuid(uid: string) {
  const hex = createHash('md5').update(uid).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/** Drizzle wraps the real PG error in err.cause — check both. */
function fullMessage(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const cause = (error as any).cause;
  const causeMsg = cause instanceof Error ? cause.message : typeof cause === 'string' ? cause : '';
  return causeMsg ? `${error.message} ${causeMsg}` : error.message;
}

/** Check NeonDbError code or message for UUID parse failure. */
function isUuidError(error: unknown): boolean {
  const msg = fullMessage(error).toLowerCase();
  const code = (error as any)?.code ?? (error as any)?.cause?.code ?? '';
  return code === '22P02' || msg.includes('invalid input syntax for type uuid') || msg.includes('invalid_text_representation');
}

/** Check NeonDbError code or message for missing column. */
function missingColumnName(error: unknown): string | null {
  const msg = fullMessage(error);
  const code = (error as any)?.code ?? (error as any)?.cause?.code ?? '';
  if (code === '42703' || msg.includes('does not exist')) {
    // NeonDbError.column holds the column name directly
    const colProp = (error as any)?.column ?? (error as any)?.cause?.column;
    if (colProp) return colProp as string;
    const m = msg.match(/column "([^"]+)" of relation "events"/i);
    return m?.[1] ?? null;
  }
  return null;
}

function toRows<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === 'object' && Array.isArray((result as any).rows)) {
    return (result as any).rows as T[];
  }
  return [];
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

    const { title, locationName, startTime, coordinates, creatorId, familyId } = body ?? {};

    const normalizedTitle = typeof title === 'string' ? title.trim() : '';
    const normalizedCreatorId = typeof creatorId === 'string' ? creatorId.trim() : '';
    const normalizedFamilyId = typeof familyId === 'string' ? familyId.trim() : '';
    const parsedStartTime = new Date(startTime);

    if (!normalizedTitle || !normalizedCreatorId || !startTime) {
      return NextResponse.json({ error: 'title, creatorId and startTime are required' }, { status: 400 });
    }
    if (Number.isNaN(parsedStartTime.getTime())) {
      return NextResponse.json({ error: 'Invalid startTime value' }, { status: 400 });
    }

    // ─── Step 1: minimal insert — only 3 required columns, explicit casts ───
    // This is robust to any schema variant: no optional columns that may be missing.
    let createdId: string | null = null;
    let usedCreatorId = normalizedCreatorId;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await db.execute(sql`
          INSERT INTO events (title, start_time, creator_id)
          VALUES (
            ${normalizedTitle}::text,
            ${parsedStartTime.toISOString()}::timestamptz,
            ${usedCreatorId}::text
          )
          RETURNING id
        `);
        const rows = toRows<{ id: string }>(res);
        createdId = rows[0]?.id ?? null;
        break;
      } catch (e) {
        if (isUuidError(e) && !isUuid(usedCreatorId)) {
          // Production creator_id column is UUID — convert Firebase UID
          usedCreatorId = uidToDeterministicUuid(normalizedCreatorId);
          continue;
        }
        // Any other error on the minimal insert is a real failure
        throw e;
      }
    }

    if (!createdId) {
      return NextResponse.json({ error: 'Event creation failed — insert returned no id' }, { status: 500 });
    }

    // ─── Step 2: update optional columns (best-effort, never fails the request) ───
    try {
      const hasCoords =
        coordinates !== null &&
        coordinates !== undefined &&
        typeof coordinates === 'object' &&
        Number.isFinite(coordinates.lat) &&
        Number.isFinite(coordinates.lng);

      const optionalUpdates: Record<string, unknown> = {
        location_name: typeof locationName === 'string' && locationName.trim() ? locationName.trim() : null,
        coordinates: hasCoords ? coordinates : null,
        family_id: normalizedFamilyId || null,
        status: 'UPCOMING',
        updated_at: new Date().toISOString(),
      };

      for (let attempt = 0; attempt < 5; attempt++) {
        const cols = Object.keys(optionalUpdates);
        if (cols.length === 0) break;
        const setClauses = sql.join(
          cols.map((col) => sql`${sql.raw(`"${col}"`)} = ${optionalUpdates[col]}`),
          sql`, `,
        );
        try {
          await db.execute(sql`
            UPDATE events SET ${setClauses}
            WHERE id = ${createdId}::uuid
          `);
          break;
        } catch (updateErr) {
          const col = missingColumnName(updateErr);
          if (col && col in optionalUpdates) {
            delete optionalUpdates[col];
            continue;
          }
          if (isUuidError(updateErr)) {
            // family_id UUID mismatch
            if (optionalUpdates.family_id) { optionalUpdates.family_id = null; continue; }
          }
          // If update fails for other reasons, swallow — event was created
          break;
        }
      }
    } catch {
      // optional update failure is non-fatal
    }

    return NextResponse.json({ id: createdId }, { status: 201 });
  } catch (err) {
    console.error('[api/events POST]', err);
    const msg = fullMessage(err);
    return NextResponse.json({ error: `Failed to create event: ${msg}` }, { status: 500 });
  }
}
