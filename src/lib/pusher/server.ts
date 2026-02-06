import Pusher from 'pusher';

if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_KEY || !process.env.PUSHER_SECRET) {
  throw new Error('Missing Pusher environment variables');
}

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  // Support South Africa (sa1) cluster, fallback to Europe (eu), then Asia Pacific (ap1)
  cluster: process.env.PUSHER_CLUSTER || 'sa1',
  useTLS: true,
});

// Helper to trigger Pusher events and log them
export async function triggerPartyEvent(
  channel: string,
  event: string,
  data: any,
  triggeredBy?: string
) {
  try {
    // Trigger Pusher event
    await pusherServer.trigger(channel, event, data);
    
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
    console.error('Pusher trigger failed:', error);
    throw error;
  }
}
