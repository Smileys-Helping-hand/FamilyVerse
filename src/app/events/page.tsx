'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getEvents } from '@/app/actions/events';
import { format, startOfToday, endOfToday, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { Calendar, Clock, MapPin, Plus, Search, Filter, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

function EventCard({ event }: { event: any }) {
  const statusConfig = {
    UPCOMING: { label: 'Upcoming', class: 'bg-primary/10 text-primary border-primary/20' },
    LIVE: { label: '🔴 Live now', class: 'bg-red-50 text-red-600 border-red-200 animate-pulse' },
    PAST: { label: 'Past', class: 'bg-muted text-foreground/50 border-border' },
  };
  const status = statusConfig[event.status as keyof typeof statusConfig] ?? statusConfig.UPCOMING;

  const purposeEmojis: Record<string, string> = {
    'games-day': '🎮', braai: '🍖', birthday: '🎂',
    'family-reunion': '👨‍👩‍👧‍👦', outing: '🌳', dinner: '🍽️', work: '💼', other: '✨',
  };
  const emoji = purposeEmojis[event.eventType] || '🎉';

  return (
    <Link href={`/events/${event.id}`} className="block">
      <div className="rounded-2xl bg-card border-2 border-border hover:border-primary/30 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group card-hover h-full">
        {event.heroImageUrl ? (
          <div className="relative h-44 overflow-hidden">
            <img src={event.heroImageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        ) : (
          <div className="h-20 bg-gradient-to-r from-primary/20 via-accent/10 to-secondary/20 flex items-center justify-center">
            <span className="text-5xl">{emoji}</span>
          </div>
        )}

        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-base leading-tight line-clamp-2">{event.title}</h3>
            <span className={cn('shrink-0 text-xs px-2.5 py-1 rounded-full border font-semibold', status.class)}>
              {status.label}
            </span>
          </div>

          <div className="space-y-1.5 text-sm text-foreground/55">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary/70" />
              <span>{format(new Date(event.startTime), 'EEE, d MMM yyyy · h:mm a')}</span>
            </div>
            {event.locationName && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary/70" />
                <span className="line-clamp-1">{event.locationName}</span>
              </div>
            )}
          </div>

          {event.description && (
            <p className="text-xs text-foreground/45 line-clamp-2">{event.description}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

const RANGE_OPTIONS = [
  { label: 'All time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'This week', value: 'week' },
  { label: 'This month', value: 'month' },
];

export default function EventsPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [range, setRange] = useState('all');

  useEffect(() => {
    const paramSearch = searchParams.get('search');
    const paramStatus = searchParams.get('status');
    const paramRange = searchParams.get('range');
    if (paramSearch) setSearch(paramSearch);
    if (paramStatus) setStatus(paramStatus.toUpperCase());
    if (paramRange) setRange(paramRange.toLowerCase());
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && user) {
      setLoading(true);
      getEvents(userProfile?.familyId ?? undefined).then((result) => {
        if (result.success) setEvents(result.events || []);
        setLoading(false);
      });
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user, userProfile?.familyId]);

  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    const s = status.toUpperCase();
    const rangeStart = range === 'today' ? startOfToday() : range === 'week' ? startOfWeek(new Date(), { weekStartsOn: 1 }) : range === 'month' ? startOfMonth(new Date()) : null;
    const rangeEnd = range === 'today' ? endOfToday() : range === 'week' ? endOfWeek(new Date(), { weekStartsOn: 1 }) : range === 'month' ? endOfMonth(new Date()) : null;

    return events.filter((ev) => {
      const matchSearch = !q || ev.title?.toLowerCase().includes(q) || ev.locationName?.toLowerCase().includes(q);
      const matchStatus = s === 'ALL' || ev.status === s;
      const evDate = new Date(ev.startTime);
      const matchRange = !rangeStart || !rangeEnd ? true : evDate >= rangeStart && evDate <= rangeEnd;
      return matchSearch && matchStatus && matchRange;
    });
  }, [events, search, status, range]);

  const { liveEvents, upcomingEvents, pastEvents } = useMemo(() => ({
    liveEvents: filteredEvents.filter(e => e.status === 'LIVE'),
    upcomingEvents: filteredEvents.filter(e => e.status === 'UPCOMING'),
    pastEvents: filteredEvents.filter(e => e.status === 'PAST'),
  }), [filteredEvents]);

  if (authLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-card border-2 border-border overflow-hidden animate-pulse">
              <div className="h-20 bg-muted" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-muted rounded-lg w-3/4" />
                <div className="h-4 bg-muted rounded-lg w-1/2" />
                <div className="h-4 bg-muted rounded-lg w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-1">Your Events 🗓️</h1>
          <p className="text-foreground/50">
            {events.length > 0
              ? `${events.length} event${events.length !== 1 ? 's' : ''} — all your family moments in one place`
              : 'No events yet — plan something amazing!'}
          </p>
        </div>
        <Link
          href="/events/new"
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold bg-primary text-white shadow-md hover:bg-primary/90 glow-primary transition-all shrink-0"
        >
          <Plus className="h-4 w-4" /> Plan Event
        </Link>
      </motion.div>

      {/* Search & filters */}
      <div className="rounded-2xl bg-card border-2 border-border p-5 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/35" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events..."
              className="w-full rounded-xl bg-muted border border-border pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl bg-muted border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors"
          >
            <option value="ALL">All</option>
            <option value="LIVE">Live</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="PAST">Past</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          {RANGE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                range === opt.value ? 'bg-primary text-white shadow-sm' : 'bg-muted hover:bg-muted/80 text-foreground/60',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live events */}
      {liveEvents.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-xl font-extrabold">Happening now</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {liveEvents.map((ev, i) => (
              <motion.div key={ev.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <EventCard event={ev} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming events */}
      {upcomingEvents.length > 0 && (
        <section>
          <h2 className="text-xl font-extrabold mb-4">Upcoming 🎉</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcomingEvents.map((ev, i) => (
              <motion.div key={ev.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <EventCard event={ev} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Past events */}
      {pastEvents.length > 0 && (
        <section>
          <h2 className="text-xl font-extrabold mb-4 text-foreground/50">Past events</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pastEvents.map((ev, i) => (
              <motion.div key={ev.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <EventCard event={ev} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {filteredEvents.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 rounded-2xl border-2 border-dashed border-border"
        >
          <span className="text-6xl mb-4 block">🗓️</span>
          <h3 className="text-xl font-bold mb-2">
            {events.length === 0 ? 'No events yet' : 'No events match your filters'}
          </h3>
          <p className="text-foreground/50 mb-6 max-w-sm mx-auto">
            {events.length === 0
              ? 'Plan your first family event — it takes less than 2 minutes!'
              : 'Try adjusting your search or filters.'}
          </p>
          <Link
            href="/events/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-primary text-white shadow-md hover:bg-primary/90 transition-all glow-primary"
          >
            <Sparkles className="w-4 h-4" /> Plan Your First Event
          </Link>
        </motion.div>
      )}
    </div>
  );
}
