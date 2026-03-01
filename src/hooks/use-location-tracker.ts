'use client';

import { useRef, useState, useCallback } from 'react';
import { updateLiveLocation } from '@/app/actions/events';

export interface TelemetryPayload {
  lat: number;
  lng: number;
  accuracy: number;
  speedKmh: number;
  batteryLevel: number | null;
  isCharging: boolean | null;
  timestamp: string;
}

interface UseLocationTrackerOptions {
  eventId: string;
  userId: string;
  userName: string;
  ghostMode?: boolean;
  /** Milliseconds between DB/Pusher broadcasts — default 15 000 (15 s) */
  broadcastInterval?: number;
}

interface UseLocationTrackerReturn {
  tracking: boolean;
  currentPosition: [number, number] | null;
  lastTelemetry: TelemetryPayload | null;
  startTracking: () => void;
  stopTracking: () => void;
}

export function useLocationTracker({
  eventId,
  userId,
  userName,
  ghostMode = false,
  broadcastInterval = 15_000,
}: UseLocationTrackerOptions): UseLocationTrackerReturn {
  const [tracking, setTracking] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null);
  const [lastTelemetry, setLastTelemetry] = useState<TelemetryPayload | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const lastBroadcastRef = useRef<number>(0);

  const getbattery = async (): Promise<{ level: number | null; charging: boolean | null }> => {
    if ('getBattery' in navigator) {
      try {
        // @ts-ignore — Battery API is not in TypeScript lib but works on Chrome/Android
        const bat = await (navigator as any).getBattery();
        return {
          level: Math.round(bat.level * 100),
          charging: bat.charging as boolean,
        };
      } catch {
        // Silently fall through for browsers that block it
      }
    }
    return { level: null, charging: null };
  };

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      console.warn('[LocationTracker] Geolocation not supported');
      return;
    }

    setTracking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, speed: gpsSpeed, accuracy } = position.coords;
        setCurrentPosition([latitude, longitude]);

        const now = Date.now();
        if (now - lastBroadcastRef.current < broadcastInterval) return;
        lastBroadcastRef.current = now;

        // Speed: GeolocationPosition returns m/s → convert to km/h
        const speedKmh = gpsSpeed != null && gpsSpeed >= 0
          ? Math.round(gpsSpeed * 3.6)
          : 0;

        const battery = await getbattery();

        const telemetry: TelemetryPayload = {
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy || 0),
          speedKmh,
          batteryLevel: battery.level,
          isCharging: battery.charging,
          timestamp: new Date().toISOString(),
        };

        setLastTelemetry(telemetry);

        // Persist + broadcast to Pusher
        updateLiveLocation({
          eventId,
          userId,
          userName,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          accuracy: telemetry.accuracy,
          speed: speedKmh,          // backward-compat field
          speedKmh,
          batteryLevel: battery.level ?? undefined,
          isCharging: battery.charging ?? undefined,
          isGhostMode: ghostMode,
        }).catch((err) => console.error('[LocationTracker] Broadcast failed:', err));
      },
      (err) => {
        console.error('[LocationTracker] Geolocation error:', err);
        stopTracking();
      },
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 20_000 }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, userId, userName, ghostMode, broadcastInterval]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
  }, []);

  return { tracking, currentPosition, lastTelemetry, startTracking, stopTracking };
}
