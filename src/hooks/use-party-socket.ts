'use client';

import { useEffect, useRef, useState } from 'react';
import { getPusherClient } from '@/lib/pusher/client';
import type { Channel } from 'pusher-js';

export function usePartySocket(channelName: string) {
  const [lastEvent, setLastEvent] = useState<any>(null);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const bindingsRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  useEffect(() => {
    try {
      const pusher = getPusherClient();
      const subscribedChannel = pusher.subscribe(channelName);
      
      subscribedChannel.bind('pusher:subscription_succeeded', () => {
        setIsConnected(true);
      });
      
      subscribedChannel.bind('pusher:subscription_error', (error: any) => {
        console.error('Failed to connect:', error);
      });
      
      setChannel(subscribedChannel);
      bindingsRef.current.forEach((callbacks, eventName) => {
        callbacks.forEach((callback) => {
          subscribedChannel.bind(eventName, (data: any) => {
            setLastEvent({ event: eventName, data, timestamp: Date.now() });
            callback(data);
          });
        });
      });
      
      return () => {
        subscribedChannel.unbind_all();
        subscribedChannel.unsubscribe();
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Error initializing Pusher:', error);
    }
  }, [channelName]);

  const bind = (eventName: string, callback: (data: any) => void) => {
    if (!bindingsRef.current.has(eventName)) {
      bindingsRef.current.set(eventName, new Set());
    }
    bindingsRef.current.get(eventName)?.add(callback);

    if (channel) {
      channel.bind(eventName, (data: any) => {
        setLastEvent({ event: eventName, data, timestamp: Date.now() });
        callback(data);
      });
    }
  };

  const unbind = (eventName: string) => {
    if (channel) {
      channel.unbind(eventName);
    }
  };

  return { lastEvent, bind, unbind, isConnected, channel };
}
