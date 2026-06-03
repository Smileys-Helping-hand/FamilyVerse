import { NextRequest, NextResponse } from 'next/server';

const MOSWORDS_API_KEY = process.env.MOSWORDS_API_KEY;
const MOSWORDS_API_URL = process.env.MOSWORDS_API_URL || 'https://www.awehchat.co.za/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...payload } = body;

    if (!MOSWORDS_API_KEY) {
      return NextResponse.json({ error: 'MosWords API not configured' }, { status: 503 });
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MOSWORDS_API_KEY}`,
      'X-API-Key': MOSWORDS_API_KEY,
    };

    switch (action) {
      case 'send_message': {
        const res = await fetch(`${MOSWORDS_API_URL}/messages/send`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            to: payload.to,
            message: payload.message,
            type: payload.type || 'text',
          }),
        }).catch(() => null);

        if (res?.ok) {
          const data = await res.json();
          return NextResponse.json({ success: true, data });
        }
        return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 });
      }

      case 'send_group_message': {
        const res = await fetch(`${MOSWORDS_API_URL}/groups/message`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            groupId: payload.groupId,
            message: payload.message,
          }),
        }).catch(() => null);

        if (res?.ok) {
          const data = await res.json();
          return NextResponse.json({ success: true, data });
        }
        return NextResponse.json({ success: false, fallback: true });
      }

      case 'get_contacts': {
        const res = await fetch(`${MOSWORDS_API_URL}/contacts`, {
          headers,
        }).catch(() => null);

        if (res?.ok) {
          const data = await res.json();
          return NextResponse.json({ success: true, contacts: data.contacts || data });
        }
        return NextResponse.json({ success: false, contacts: [] });
      }

      case 'get_groups': {
        const res = await fetch(`${MOSWORDS_API_URL}/groups`, {
          headers,
        }).catch(() => null);

        if (res?.ok) {
          const data = await res.json();
          return NextResponse.json({ success: true, groups: data.groups || data });
        }
        return NextResponse.json({ success: false, groups: [] });
      }

      case 'create_event_channel': {
        const res = await fetch(`${MOSWORDS_API_URL}/channels/create`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: payload.eventName,
            description: payload.description,
            members: payload.members || [],
            metadata: { eventId: payload.eventId, source: 'familyverse' },
          }),
        }).catch(() => null);

        if (res?.ok) {
          const data = await res.json();
          return NextResponse.json({ success: true, channel: data });
        }
        return NextResponse.json({ success: false, fallback: true });
      }

      case 'send_event_invite': {
        const inviteText = `🎉 *Event Invite via FamilyVerse*\n\n*${payload.eventName}*\n📅 ${payload.date}\n📍 ${payload.location}\n\nYou're invited! RSVP and view the full plan:\n${payload.rsvpUrl}`;

        const promises = (payload.phones || []).map((phone: string) =>
          fetch(`${MOSWORDS_API_URL}/messages/send`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ to: phone, message: inviteText, type: 'text' }),
          }).catch(() => null)
        );

        await Promise.allSettled(promises);
        return NextResponse.json({ success: true, sent: payload.phones?.length || 0 });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[MosWords API]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'status';

  if (action === 'status') {
    return NextResponse.json({
      connected: !!MOSWORDS_API_KEY,
      service: 'MosWords / AwehChat',
      version: '1.0',
    });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
