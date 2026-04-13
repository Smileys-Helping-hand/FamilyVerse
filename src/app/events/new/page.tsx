'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { VenueDossier, type VenueSelection } from '@/components/events/VenueDossier';
import { cn } from '@/lib/utils';
import { Loader2, Package, UserCheck, MapPin, Calendar, Tag, Check, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { runQuartermaster, type AssignmentResult } from '@/actions/quartermaster';
import { recordEventPreference } from '@/app/actions/suggestions';
import Link from 'next/link';

export default function NewEventPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  // ── Pre-filled from Omnibar AI draft ────────────────────────────────────
  const [title, setTitle] = useState(params.get('title') ?? '');
  const [date, setDate] = useState(params.get('date') ?? '');
  const [eventType, setEventType] = useState(params.get('eventType') ?? 'other');
  const [location, setLocation] = useState(params.get('location') ?? '');
  const [gear] = useState<string[]>(() => {
    try { return JSON.parse(params.get('gear') ?? '[]'); } catch { return []; }
  });

  const [venueSelection, setVenueSelection] = useState<VenueSelection | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignments, setAssignments] = useState<AssignmentResult[] | null>(null);

  // Sync location state when venue changes
  const handleVenueChange = (v: VenueSelection | null) => {
    setVenueSelection(v);
    if (v) setLocation(v.name);
  };

  const handleConfirm = async () => {
    if (!user?.uid || !title.trim()) return;
    setIsSubmitting(true);

    try {
      // 1. Create the event via API
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          locationName: location || null,
          startTime: date ? new Date(date).toISOString() : new Date().toISOString(),
          coordinates: venueSelection ? { lat: venueSelection.lat, lng: venueSelection.lng } : null,
          creatorId: user.uid,
          familyId: userProfile?.familyId ?? null,
          status: 'UPCOMING',
        }),
      });

      if (!res.ok) throw new Error('Failed to create event');
      const { id: eventId } = await res.json();

      // 1.5. Learn user preference signal from chosen event type
      await recordEventPreference(user.uid, eventType || 'other');

      // 2. Run Auto-Quartermaster for the required gear
      let qResults: AssignmentResult[] = [];
      if (gear.length) {
        qResults = await runQuartermaster(eventId, gear, [user.uid]);
        setAssignments(qResults);
      }

      const autoCount = qResults.filter((r) => r.status === 'AUTO_ASSIGNED').length;
      toast({
        title: 'Outing created!',
        description: autoCount > 0
          ? `Quartermaster auto-assigned ${autoCount}/${gear.length} gear items.`
          : 'Your outing has been saved.',
      });

      // Small pause to show assignments, then navigate
      setTimeout(() => router.push(`/events/${eventId}`), 1500);
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Could not create outing.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6 px-4 sm:px-0">

      {/* Back nav */}
      <Link href="/dashboard" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      {/* Title */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#00FF66]/70 mb-1">New Outing</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">Review &amp; Confirm</h1>
        <p className="text-zinc-500 text-sm mt-1">Tweak the details, pick your venue, then lock it in.</p>
      </div>

      {/* ── Form ── */}
      <div className="space-y-4">

        {/* Event name */}
        <div className="space-y-1.5">
          <label className="text-xs text-zinc-400 font-medium flex items-center gap-1">
            <Tag className="h-3 w-3 text-[#00FF66]" /> Outing Name
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#00FF66]/50 transition-colors"
            placeholder="e.g. Saturday Braai at Kirstenbosch"
          />
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <label className="text-xs text-zinc-400 font-medium flex items-center gap-1">
            <Calendar className="h-3 w-3 text-[#00FF66]" /> Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-[#00FF66]/50 transition-colors"
          />
        </div>

        {/* Venue Dossier */}
        <div className="space-y-1.5">
          <label className="text-xs text-zinc-400 font-medium flex items-center gap-1">
            <MapPin className="h-3 w-3 text-[#00FF66]" /> Venue
          </label>
          <VenueDossier
            initialVenue={location}
            eventType={eventType}
            onVenueChange={handleVenueChange}
          />
        </div>

        {/* Required gear + Quartermaster preview */}
        {gear.length > 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-[#00FF66]" /> Required Gear — Quartermaster Ready
            </p>
            <ul className="space-y-2">
              {gear.map((item) => {
                const assignment = assignments?.find((a) => a.item.toLowerCase() === item.toLowerCase());
                return (
                  <li key={item} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-zinc-300">{item}</span>
                    {assignment ? (
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full border font-medium',
                        assignment.status === 'AUTO_ASSIGNED'
                          ? 'bg-[#00FF66]/10 border-[#00FF66]/30 text-[#00FF66]'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-500',
                      )}>
                        {assignment.status === 'AUTO_ASSIGNED' ? '⚡ Auto-assigned' : 'Needs owner'}
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-600 border border-zinc-700 rounded-full px-2 py-0.5">
                        Pending
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            {!assignments && (
              <p className="text-xs text-zinc-600 flex items-center gap-1">
                <UserCheck className="h-3 w-3 text-[#00FF66]" />
                Auto-assignment runs on confirm based on crew gear bags.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Confirm button ── */}
      <button
        type="button"
        onClick={handleConfirm}
        disabled={isSubmitting || !title.trim()}
        className={cn(
          'w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200',
          'bg-[#00FF66] text-zinc-950',
          'shadow-[0_0_20px_rgba(0,255,102,0.35)] hover:shadow-[0_0_32px_rgba(0,255,102,0.5)]',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none',
          'flex items-center justify-center gap-2',
        )}
      >
        {isSubmitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Creating outing...</>
        ) : (
          <><Check className="h-4 w-4" /> Lock It In</>
        )}
      </button>
    </div>
  );
}
