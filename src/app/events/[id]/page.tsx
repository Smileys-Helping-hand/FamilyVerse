'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getEvent, getWeatherForecast } from '@/app/actions/events';
import EventDetailClient from '@/components/events/EventDetailClient';

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (!authLoading && user) {
      loadEvent();
    }
  }, [authLoading, user, params.id]);

  const loadEvent = async () => {
    setLoading(true);
    const result = await getEvent(params.id);
    if (!result.success || !result.event) {
      router.push('/events');
      return;
    }

    setEventData(result);

    if (result.event.coordinates) {
      const weatherResult = await getWeatherForecast(
        result.event.coordinates.lat,
        result.event.coordinates.lng,
        new Date(result.event.startTime)
      );
      if (weatherResult.success) {
        setWeather(weatherResult.weather);
      }
    }

    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
      </div>
    );
  }

  if (!user || !eventData) {
    return null;
  }

  return (
    <EventDetailClient
      event={eventData.event}
      attendees={eventData.attendees || []}
      waypoints={eventData.waypoints || []}
      weather={weather}
      currentUser={{
        uid: user.uid,
        email: user.email || '',
        name: userProfile?.name || user.displayName || user.email?.split('@')[0] || 'User',
      }}
    />
  );
}
