import PusherClient from 'pusher-js';

let pusherClient: PusherClient | null = null;

export function getPusherClient() {
  if (!pusherClient) {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
      throw new Error('Missing Pusher public environment variables');
    }
    
    // Enable debug logging in development
    if (process.env.NODE_ENV === 'development') {
      PusherClient.logToConsole = true;
    }
    
    pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      // Enable client events for real-time triggers (must be enabled in Pusher Dashboard)
      enabledTransports: ['ws', 'wss'],
    });
  }
  
  return pusherClient;
}
