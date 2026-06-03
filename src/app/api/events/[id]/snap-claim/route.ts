import { NextRequest, NextResponse } from 'next/server';
import { triggerPartyEvent } from '@/lib/pusher/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;

  let assignments: Record<number, string[]>;
  try {
    const body = await req.json();
    if (!body?.assignments || typeof body.assignments !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    assignments = body.assignments;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    await triggerPartyEvent(`event-${eventId}`, 'snap-split-update', { assignments }, 'system');
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[snap-claim] Pusher error:', err);
    return NextResponse.json({ error: 'Failed to broadcast' }, { status: 500 });
  }
}
