import { db } from '../src/lib/db';
import { pushSubscriptions } from '../src/lib/db/schema';
import webpush from 'web-push';

export async function sendPush(userId: string, payload: { title: string; body: string; url?: string }) {
  // Get all push subscriptions for user
  const subs = await db.select().from(pushSubscriptions).where(pushSubscriptions.userId.eq(userId));
  if (!subs.length) return;

  // VAPID keys (should be loaded from env)
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  webpush.setVapidDetails(
    'mailto:admin@ganggear.com',
    vapidPublicKey!,
    vapidPrivateKey!
  );

  // Send push to all subscriptions
  for (const sub of subs) {
    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || '/'
    });
    try {
      await webpush.sendNotification({
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      }, pushPayload);
    } catch (err) {
      // Optionally: remove invalid subscriptions
      // ...existing code...
    }
  }
}
