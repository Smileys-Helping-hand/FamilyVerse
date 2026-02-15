import { Suspense } from 'react';
import { auth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getEvent, getWeatherForecast } from '@/app/actions/events';
import EventDetailClient from '@/components/events/EventDetailClient';

async function getUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  
  if (!sessionCookie) return null;
  
  try {
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    return decodedToken;
  } catch (error) {
    return null;
  }
}

async function EventDetail({ eventId }: { eventId: string }) {
  const user = await getUser();
  
  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Please log in to view this event</p>
      </div>
    );
  }

  const result = await getEvent(eventId);
  
  if (!result.success || !result.event) {
    notFound();
  }

  const { event, attendees, waypoints } = result;

  // Get weather forecast if location is available
  let weather = null;
  if (event.coordinates) {
    const weatherResult = await getWeatherForecast(
      event.coordinates.lat,
      event.coordinates.lng,
      new Date(event.startTime)
    );
    if (weatherResult.success) {
      weather = weatherResult.weather;
    }
  }

  return (
    <EventDetailClient
      event={event}
      attendees={attendees || []}
      waypoints={waypoints || []}
      weather={weather}
      currentUser={{
        uid: user.uid,
        email: user.email || '',
        name: user.name as string || user.email || 'User',
      }}
    />
  );
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-200 rounded-lg" />
          <div className="h-10 bg-gray-200 rounded w-1/2" />
          <div className="h-6 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    }>
      <EventDetail eventId={id} />
    </Suspense>
  );
}
