import { NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { serverId, channelId, identity, name } = await request.json();

    if (!serverId || !channelId) {
      return NextResponse.json({ error: 'Missing serverId or channelId' }, { status: 400 });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !livekitUrl) {
      return NextResponse.json({ error: 'LiveKit is not configured' }, { status: 500 });
    }

    const roomName = `${serverId}:${channelId}`;
    const token = new AccessToken(apiKey, apiSecret, {
      identity: identity || `guest_${Date.now()}`,
      name: name || 'Guest',
    });

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    return NextResponse.json({
      token: token.toJwt(),
      url: livekitUrl,
      room: roomName,
    });
  } catch (error) {
    console.error('LiveKit token error:', error);
    return NextResponse.json({ error: 'Failed to create token' }, { status: 500 });
  }
}
