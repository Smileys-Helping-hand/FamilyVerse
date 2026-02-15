'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getEvent } from '@/app/actions/events';
import FamilyRadarClient from '@/components/events/FamilyRadarClient';

export default function EventMapPage({ params }: { params: { id: string } }) {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState<any>(null);
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

  if (!eventData.event.coordinates) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">
          This event doesn't have a location set. Contact the organizer to add one.
        </p>
      </div>
    );
  }

  return (
    <FamilyRadarClient
      event={eventData.event}
      attendees={eventData.attendees || []}
      currentUser={{
        uid: user.uid,
        email: user.email || '',
        name: userProfile?.name || user.displayName || user.email?.split('@')[0] || 'User',
      }}
    />
  );
}
