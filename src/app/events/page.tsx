import { Suspense } from 'react';
import { auth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { getEvents } from '@/app/actions/events';
import { Calendar, MapPin, Users, Plus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

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

async function EventsList() {
  const user = await getUser();
  
  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Please log in to view events</p>
      </div>
    );
  }

  const { events: eventsList } = await getEvents(user.familyId as string | undefined);

  // Group events by status
  const upcomingEvents = eventsList.filter(e => e.status === 'UPCOMING');
  const liveEvents = eventsList.filter(e => e.status === 'LIVE');
  const pastEvents = eventsList.filter(e => e.status === 'PAST');

  return (
    <div className="space-y-8">
      {/* Live Events */}
      {liveEvents.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
            <h2 className="text-2xl font-bold">Live Now</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Upcoming</h2>
        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No upcoming events. Create one to get started!
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Past Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function EventCard({ event }: { event: any }) {
  const statusColors = {
    UPCOMING: 'bg-blue-500',
    LIVE: 'bg-red-500',
    PAST: 'bg-gray-500',
  };

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
        {/* Hero Image */}
        {event.heroImageUrl && (
          <div className="h-48 overflow-hidden">
            <img
              src={event.heroImageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-xl">{event.title}</CardTitle>
            <Badge className={statusColors[event.status as keyof typeof statusColors]}>
              {event.status}
            </Badge>
          </div>
          {event.description && (
            <CardDescription className="line-clamp-2">
              {event.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{format(new Date(event.startTime), 'PPP p')}</span>
          </div>
          
          {event.locationName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{event.locationName}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function EventsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">🌍 Event Hub</h1>
          <p className="text-muted-foreground">
            Plan, track, and manage your family outings
          </p>
        </div>
        
        <Link href="/events/create">
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">Events</p>
                <p className="text-sm text-muted-foreground">Total planned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">Track</p>
                <p className="text-sm text-muted-foreground">Live locations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">RSVPs</p>
                <p className="text-sm text-muted-foreground">Who's coming</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💰</span>
              <div>
                <p className="text-2xl font-bold">Kitty</p>
                <p className="text-sm text-muted-foreground">Split expenses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <Suspense fallback={<div className="text-center py-12">Loading events...</div>}>
        <EventsList />
      </Suspense>
    </div>
  );
}
