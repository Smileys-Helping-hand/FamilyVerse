import Pusher from 'pusher';

const hasPusherConfig = Boolean(
  process.env.PUSHER_APP_ID &&
  process.env.PUSHER_KEY &&
  process.env.PUSHER_SECRET
);

export const pusherServer = hasPusherConfig
  ? new Pusher({
      appId: process.env.PUSHER_APP_ID as string,
      key: process.env.PUSHER_KEY as string,
      secret: process.env.PUSHER_SECRET as string,
      // Support South Africa (sa1) cluster, fallback to Europe (eu), then Asia Pacific (ap1)
      cluster: process.env.PUSHER_CLUSTER || 'sa1',
      useTLS: true,
    })
  : null;

// Helper to trigger Pusher events and log them
export async function triggerPartyEvent(
  channel: string,
  event: string,
  data: any,
  triggeredBy?: string
) {
  if (!pusherServer) {
    console.warn('Pusher not configured; skipping event:', event);
    return;
  }

  try {
    // Trigger Pusher event
    await pusherServer.trigger(channel, event, data);
  } catch (error) {
    console.error('Pusher trigger failed:', error);
  }

  try {
    // Log event to database for debugging/history
    const { db } = await import('@/lib/db');
    const { partyEvents } = await import('@/lib/db/schema');

    await db.insert(partyEvents).values({
      eventType: event,
      channel,
      data: data as any,
      triggeredBy: triggeredBy || null,
    });
  } catch (error) {
    console.error('Failed to log party event:', error);
  }
}
