// actions/push.ts
'use server';
import { db } from '@/lib/db';
import { pushSubscriptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

async function getWebPush() {
  const webpush = await import('web-push');
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@gang-gear.co.za';

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn('[Push] VAPID keys not configured — skipping push');
    return null;
  }

  webpush.default.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  return webpush.default;
}

/**
 * Send a web-push notification to every registered device for a user.
 * Stale subscriptions (HTTP 410 Gone / 404) are automatically removed.
 */
export async function sendPushToUser(userId: string, payload: PushPayload) {
  const wp = await getWebPush();
  if (!wp) return;

  const subs = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
  if (!subs.length) return;

  const pushStr = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || '/',
  });

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await wp.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          pushStr
        );
      } catch (err: any) {
        // 410 Gone / 404 = subscription expired or app uninstalled — clean up
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          console.log(`[Push] Removing stale subscription ${sub.id} (HTTP ${err.statusCode})`);
          await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
        } else {
          console.error('[Push] Send failed for sub', sub.id, err?.message);
        }
      }
    })
  );
}

/** Backwards-compatible alias */
export const sendPush = sendPushToUser;
