'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getEvents } from '@/app/actions/events';
import EventsClient from '@/components/events/EventsClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, Plus } from 'lucide-react';
import { format, startOfToday, endOfToday, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export default function EventsPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersReady, setFiltersReady] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [range, setRange] = useState('all');

  useEffect(() => {
    if (!authLoading && user) {
      loadEvents();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user]);

  useEffect(() => {
    const paramSearch = searchParams.get('search');
    const paramStatus = searchParams.get('status');
    const paramRange = searchParams.get('range');

    if (paramSearch || paramStatus || paramRange) {
      setSearch(paramSearch || '');
      setStatus((paramStatus || 'ALL').toUpperCase());
      setRange((paramRange || 'all').toLowerCase());
      setFiltersReady(true);
      return;
    }

    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('eventsFilters');
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as { search?: string; status?: string; range?: string };
          setSearch(parsed.search || '');
          setStatus((parsed.status || 'ALL').toUpperCase());
          setRange((parsed.range || 'all').toLowerCase());
        } catch (error) {
          console.warn('Failed to read saved event filters', error);
        }
      }
    }

    setFiltersReady(true);
  }, [searchParams]);

  useEffect(() => {
    if (!filtersReady) return;

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        'eventsFilters',
        JSON.stringify({ search, status, range })
      );
    }

    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (status !== 'ALL') params.set('status', status);
    if (range !== 'all') params.set('range', range);

    const query = params.toString();
    router.replace(query ? `/events?${query}` : '/events');
  }, [filtersReady, search, status, range, router]);

  const loadEvents = async () => {
    setLoading(true);
    const result = await getEvents(userProfile?.familyId ?? undefined);
    if (result.success) {
      setEvents(result.events || []);
    }
    setLoading(false);
  };

  const filteredEvents = useMemo(() => {
    const searchQuery = search.trim().toLowerCase();
    const statusFilter = status.toUpperCase();
    const rangeFilter = range.toLowerCase();

    const rangeStart = rangeFilter === 'today'
      ? startOfToday()
      : rangeFilter === 'week'
      ? startOfWeek(new Date(), { weekStartsOn: 1 })
      : rangeFilter === 'month'
      ? startOfMonth(new Date())
      : null;
    const rangeEnd = rangeFilter === 'today'
      ? endOfToday()
      : rangeFilter === 'week'
      ? endOfWeek(new Date(), { weekStartsOn: 1 })
      : rangeFilter === 'month'
      ? endOfMonth(new Date())
      : null;

    return events.filter((event) => {
      const matchesSearch = !searchQuery
        || event.title?.toLowerCase().includes(searchQuery)
        || event.description?.toLowerCase().includes(searchQuery)
        || event.locationName?.toLowerCase().includes(searchQuery);

      const matchesStatus = statusFilter === 'ALL' || event.status === statusFilter;

      const eventDate = new Date(event.startTime);
      const matchesRange = !rangeStart || !rangeEnd
        ? true
        : eventDate >= rangeStart && eventDate <= rangeEnd;

      return matchesSearch && matchesStatus && matchesRange;
    });
  }, [events, range, search, status]);

  const { liveEvents, upcomingEvents, pastEvents } = useMemo(() => {
    return {
      liveEvents: filteredEvents.filter((event) => event.status === 'LIVE'),
      upcomingEvents: filteredEvents.filter((event) => event.status === 'UPCOMING'),
      pastEvents: filteredEvents.filter((event) => event.status === 'PAST'),
    };
  }, [filteredEvents]);

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

      <Card className="border-2 border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-lg">Find Events Fast</CardTitle>
          <CardDescription>Search, filter, and jump straight in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr,180px,180px]">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, location, or description"
            />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="LIVE">Live</SelectItem>
                <SelectItem value="UPCOMING">Upcoming</SelectItem>
                <SelectItem value="PAST">Past</SelectItem>
              </SelectContent>
            </Select>
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={range === 'today' ? 'default' : 'outline'}
              onClick={() => setRange('today')}
            >
              Today
            </Button>
            <Button
              type="button"
              variant={range === 'week' ? 'default' : 'outline'}
              onClick={() => setRange('week')}
            >
              This Week
            </Button>
            <Button
              type="button"
              variant={range === 'month' ? 'default' : 'outline'}
              onClick={() => setRange('month')}
            >
              This Month
            </Button>
            <Button
              type="button"
              variant={range === 'all' ? 'default' : 'outline'}
              onClick={() => setRange('all')}
            >
              All Time
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSearch('');
                setStatus('ALL');
                setRange('all');
              }}
            >
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

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

          {filteredEvents.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Try adjusting your filters or create a new event to get started.
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

  const tags = Array.isArray(event.tags)
    ? event.tags
    : Array.isArray(event.eventTags)
    ? event.eventTags
    : [];

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
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 4).map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
