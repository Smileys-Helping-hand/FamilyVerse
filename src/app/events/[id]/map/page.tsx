import { Suspense } from 'react';
import { auth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getEvent } from '@/app/actions/events';
import FamilyRadarClient from '@/components/events/FamilyRadarClient';

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

async function FamilyRadarPage({ eventId }: { eventId: string }) {
  const user = await getUser();
  
  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Please log in to view the map</p>
      </div>
    );
  }

  const result = await getEvent(eventId);
  
  if (!result.success || !result.event) {
    notFound();
  }

  const { event, attendees } = result;

  if (!event.coordinates) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">
          This event doesn't have a location set. Contact the organizer to add one.
        </p>
      </div>
    );
  }

  return (
    <FamilyRadarClient
      event={event}
      attendees={attendees || []}
      currentUser={{
        uid: user.uid,
        email: user.email || '',
        name: user.name as string || user.email || 'User',
      }}
    />
  );
}

export default async function MapPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    }>
      <FamilyRadarPage eventId={id} />
    </Suspense>
  );
}
