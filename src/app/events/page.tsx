'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getEvents } from '@/app/actions/events';
import EventsClient from '@/components/events/EventsClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Plus } from 'lucide-react';
import { format } from 'date-fns';

export default function EventsPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      loadEvents();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user]);

  const loadEvents = async () => {
    setLoading(true);
    const result = await getEvents(userProfile?.familyId);
    if (result.success) {
      setEvents(result.events || []);
    }
    setLoading(false);
  };

  const { liveEvents, upcomingEvents, pastEvents } = useMemo(() => {
    return {
      liveEvents: events.filter((event) => event.status === 'LIVE'),
      upcomingEvents: events.filter((event) => event.status === 'UPCOMING'),
      pastEvents: events.filter((event) => event.status === 'PAST'),
    };
  }, [events]);

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Please Sign In</h1>
        <p className="text-muted-foreground mb-6">You need to be signed in to view events</p>
        <Link href="/login">
          <Button>Go to Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Event Hub</h1>
          <p className="text-muted-foreground mt-2">
            Organize family outings, track RSVPs, and coordinate everything in one place.
          </p>
        </div>
        <Link href="/events/create">
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Create Event
          </Button>
        </Link>
      </div>

      <EventsClient
        events={events}
        currentUser={{
          uid: user.uid,
          email: user.email || '',
          name: userProfile?.name || user.displayName || user.email?.split('@')[0] || 'User',
          familyId: userProfile?.familyId || undefined,
        }}
      >
        <div className="space-y-8">
          {liveEvents.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="destructive" className="animate-pulse">LIVE NOW</Badge>
                <h2 className="text-2xl font-bold">Happening Now</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          )}

          {upcomingEvents.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          )}

          {pastEvents.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4 text-muted-foreground">Past Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          )}

          {events.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Events Yet</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Create your first event to start planning amazing gatherings.
                </p>
                <Link href="/events/create">
                  <Button size="lg" className="gap-2">
                    <Plus className="h-5 w-5" />
                    Create Your First Event
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </EventsClient>
    </div>
  );
}

function EventCard({ event }: { event: any }) {
  const statusColors = {
    UPCOMING: 'bg-blue-500',
    LIVE: 'bg-red-500 animate-pulse',
    PAST: 'bg-gray-500',
  };

  return (
    <Link href={`/events/${event.id}`} className="block h-full">
      <Card className="hover:shadow-lg transition-all cursor-pointer group h-full">
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          {event.heroImageUrl ? (
            <img
              src={event.heroImageUrl}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600" />
          )}
          <div className="absolute top-4 right-4">
            <Badge className={statusColors[event.status as keyof typeof statusColors]}>
              {event.status}
            </Badge>
          </div>
        </div>

        <CardHeader>
          <CardTitle className="line-clamp-1">{event.title}</CardTitle>
          {event.description && (
            <CardDescription className="line-clamp-2">{event.description}</CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{format(new Date(event.startTime), 'PPP p')}</span>
          </div>
          {event.locationName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{event.locationName}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
