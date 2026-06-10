'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { VenueDossier, type VenueSelection } from '@/components/events/VenueDossier';
import { cn } from '@/lib/utils';
import {
  Loader2, Package, MapPin, Calendar, Tag, Check, ArrowLeft, ArrowRight,
  Users, MessageCircle, Sparkles, ClipboardList, Sun, Cloud, CloudRain,
  Phone, Mail, BookOpen, Plus, Trash2, ChevronDown, Share2, ExternalLink
} from 'lucide-react';
import LocationPicker from '@/components/events/LocationPicker';
import { useToast } from '@/hooks/use-toast';
import { runQuartermaster, type AssignmentResult } from '@/actions/quartermaster';
import { recordEventPreference } from '@/app/actions/suggestions';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  { id: 1, icon: '🎯', label: 'Purpose' },
  { id: 2, icon: '📅', label: 'When & Where' },
  { id: 3, icon: '👥', label: 'Guests' },
  { id: 4, icon: '✅', label: 'Tasks & Plan' },
  { id: 5, icon: '📨', label: 'Invite & Book' },
];

const EVENT_PURPOSES = [
  { id: 'family-event', emoji: '👨‍👩‍👧‍👦', label: 'Family Event', desc: 'Gather your whole family' },
  { id: 'friend-event', emoji: '👯', label: 'Friend Event', desc: 'Hangout with your crew' },
  { id: 'games-day', emoji: '🎮', label: 'Games Day', desc: 'Board games, sports, fun activities' },
  { id: 'braai', emoji: '🍖', label: 'Braai / BBQ', desc: 'Classic South African get-together' },
  { id: 'birthday', emoji: '🎂', label: 'Birthday', desc: 'Celebrate a special day' },
  { id: 'family-reunion', emoji: '🎉', label: 'Family Reunion', desc: 'Bring everyone together' },
  { id: 'outing', emoji: '🌳', label: 'Day Outing', desc: 'Trip, hike, beach, or adventure' },
  { id: 'dinner', emoji: '🍽️', label: 'Dinner / Lunch', desc: 'Restaurant or home gathering' },
  { id: 'work', emoji: '💼', label: 'Work Event', desc: 'Team building or office function' },
  { id: 'other', emoji: '✨', label: 'Other', desc: 'Something unique' },
];

const POPULAR_LOCATIONS = [
  { id: 'home', emoji: '🏡', label: 'Home', desc: 'Your place' },
  { id: 'park', emoji: '🌳', label: 'Public Park', desc: 'Local park or picnic area' },
  { id: 'beach', emoji: '🏖️', label: 'Beach', desc: 'Coastal getaway' },
  { id: 'restaurant', emoji: '🍽️', label: 'Restaurant', desc: 'Dine out' },
  { id: 'venue', emoji: '🏢', label: 'Event Venue', desc: 'Function hall or venue space' },
  { id: 'other', emoji: '📍', label: 'Other Location', desc: 'Somewhere else' },
];

interface TaskItem { id: string; text: string; assignee: string; done: boolean; }
interface Guest { name: string; phone: string; email: string; rsvp: 'pending' | 'yes' | 'no'; }

export default function NewEventPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 — Purpose
  const [title, setTitle] = useState(params.get('title') ?? '');
  const [purpose, setPurpose] = useState(params.get('eventType') ?? '');
  const [purposeNote, setPurposeNote] = useState('');

  // Step 2 — When & Where
  const [date, setDate] = useState(params.get('date') ?? '');
  const [time, setTime] = useState('12:00');
  const [locationType, setLocationType] = useState('');
  const [location, setLocation] = useState(params.get('location') ?? '');
  const [venueSelection, setVenueSelection] = useState<VenueSelection | null>(null);
  const [venueResearch, setVenueResearch] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loadingResearch, setLoadingResearch] = useState(false);

  // Step 3 — Guests
  const [guestCount, setGuestCount] = useState(params.get('guestCount') ?? '');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');

  // Step 4 — Tasks
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [gear] = useState<string[]>(() => {
    try { return JSON.parse(params.get('gear') ?? '[]'); } catch { return []; }
  });
  const [assignments, setAssignments] = useState<AssignmentResult[] | null>(null);
  const [aiTasksLoaded, setAiTasksLoaded] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');

  // Step 5 — Invite & Book
  const [inviteMessage, setInviteMessage] = useState('');
  const [eventId, setEventId] = useState<string | null>(null);
  const [created, setCreated] = useState(false);

  // ── Research venue + weather when date/venue set ──────────────────
  useEffect(() => {
    if (!venueSelection && !location) return;
    if (!date) return;
    const venueName = venueSelection?.name ?? location;
    if (!venueName) return;

    setLoadingResearch(true);
    Promise.all([
      fetch('/api/venue-intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venue: venueName, eventType: purpose }),
      }).then(r => r.json()).catch(() => null),
      fetch(`/api/weather?location=${encodeURIComponent(venueName)}&date=${date}`)
        .then(r => r.json()).catch(() => null),
    ]).then(([venue, weather]) => {
      setVenueResearch(venue);
      setWeatherData(weather);
      setLoadingResearch(false);
    });
  }, [venueSelection, location, date, purpose]);

  // ── AI task generation when entering step 4 ──────────────────────
  useEffect(() => {
    if (step !== 4 || aiTasksLoaded) return;
    if (!title || !purpose) return;

    fetch('/api/generate-supply-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: purpose,
        title,
        location: location || venueSelection?.name,
        guestCount,
        purposeNote,
      }),
    })
      .then(r => r.json())
      .then((data) => {
        if (data?.tasks?.length) {
          setTasks(data.tasks.map((t: any, i: number) => ({
            id: `ai-${i}`,
            text: t.text || t,
            assignee: t.assignee || '',
            done: false,
          })));
        }
        setAiTasksLoaded(true);
      })
      .catch(() => setAiTasksLoaded(true));
  }, [step, aiTasksLoaded, title, purpose, location, venueSelection, guestCount, purposeNote]);

  // ── Build invite message when entering step 5 ────────────────────
  useEffect(() => {
    if (step !== 5) return;
    const venueName = venueSelection?.name ?? location ?? 'TBD';
    const formattedDate = date ? new Date(date + 'T12:00').toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' }) : 'TBD';
    setInviteMessage(
      `Hey! You're invited to *${title || 'our event'}* 🎉\n\n📅 ${formattedDate}\n📍 ${venueName}\n👥 ${guestCount || 'Everyone welcome'}${purposeNote ? `\n\n${purposeNote}` : ''}\n\nPlan & RSVP: https://familyverse.co.za/events/[id]`
    );
  }, [step, title, date, venueSelection, location, guestCount, purposeNote]);

  const handleVenueChange = (v: VenueSelection | null) => {
    setVenueSelection(v);
    if (v) setLocation(v.name);
  };

  const addGuest = () => {
    if (!newGuestName.trim()) return;
    setGuests(prev => [...prev, { name: newGuestName.trim(), phone: newGuestPhone.trim(), email: '', rsvp: 'pending' }]);
    setNewGuestName('');
    setNewGuestPhone('');
  };

  const addTask = () => {
    if (!newTaskText.trim()) return;
    setTasks(prev => [...prev, { id: `manual-${Date.now()}`, text: newTaskText.trim(), assignee: newTaskAssignee.trim(), done: false }]);
    setNewTaskText('');
    setNewTaskAssignee('');
  };

  const removeTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  const handleCreateEvent = async () => {
    if (!user?.uid || !title.trim()) return;
    setIsSubmitting(true);

    try {
      const startTime = date ? new Date(`${date}T${time}`).toISOString() : new Date().toISOString();
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          locationName: location || null,
          startTime,
          coordinates: venueSelection ? { lat: venueSelection.lat, lng: venueSelection.lng } : null,
          creatorId: user.uid,
          familyId: userProfile?.familyId ?? null,
          status: 'UPCOMING',
          description: purposeNote || undefined,
          eventType: purpose || undefined,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || 'Failed to create event');
      }
      const { id } = await res.json();
      setEventId(id);

      try { await recordEventPreference(user.uid, purpose || 'other'); } catch {}

      if (gear.length) {
        try {
          const qResults = await runQuartermaster(id, gear, [user.uid]);
          setAssignments(qResults);
        } catch {}
      }

      setCreated(true);
      toast({ title: '🎉 Event created!', description: 'Your event is ready. Share the invite below.' });
    } catch (err) {
      toast({
        title: 'Error creating event',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendWhatsAppInvite = () => {
    const text = encodeURIComponent(inviteMessage.replace('[id]', eventId || ''));
    if (guests.length > 0 && guests[0].phone) {
      window.open(`https://wa.me/${guests[0].phone.replace(/\D/g, '')}?text=${text}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${text}`, '_blank');
    }
  };

  const sendGroupWhatsApp = () => {
    const text = encodeURIComponent(inviteMessage.replace('[id]', eventId || ''));
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const canNext = (() => {
    if (step === 1) return !!title.trim() && !!purpose;
    if (step === 2) return !!date && !!locationType && !!location;
    if (step === 3) return true;
    if (step === 4) return true;
    return false;
  })();

  const WeatherIcon = ({ condition }: { condition: string }) => {
    if (condition?.includes('rain') || condition?.includes('storm')) return <CloudRain className="w-5 h-5 text-blue-400" />;
    if (condition?.includes('cloud')) return <Cloud className="w-5 h-5 text-gray-400" />;
    return <Sun className="w-5 h-5 text-amber-400" />;
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 sm:px-0">

      {/* Back nav */}
      <Link href="/dashboard" className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground transition-colors w-fit mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      {/* Progress steps */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto scrollbar-hide">
        {STEPS.map((s, i) => {
          const isActive = step === s.id;
          const isDone = step > s.id;
          return (
            <div key={s.id} className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => isDone && setStep(s.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200',
                  isActive ? 'bg-primary text-white shadow-md' : '',
                  isDone ? 'bg-secondary/15 text-secondary hover:bg-secondary/25 cursor-pointer' : '',
                  !isActive && !isDone ? 'bg-muted text-foreground/35 cursor-default' : '',
                )}
              >
                <span>{isDone ? '✓' : s.icon}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={cn('w-4 h-0.5 rounded-full mx-0.5', isDone ? 'bg-secondary' : 'bg-border')} />
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">

        {/* ─── Step 1: Purpose ─── */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">What are you planning? 🎯</h1>
              <p className="text-foreground/55 text-sm">Pick the type of event and give it a name.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/70 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Event name
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Family Games Day at The Ark"
                className="w-full rounded-xl bg-card border-2 border-border px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {EVENT_PURPOSES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPurpose(p.id)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-center transition-all card-hover',
                    purpose === p.id
                      ? 'border-primary bg-primary/10 shadow-md'
                      : 'border-border bg-card hover:border-primary/30',
                  )}
                >
                  <span className="text-3xl">{p.emoji}</span>
                  <span className="text-xs font-bold leading-tight">{p.label}</span>
                </button>
              ))}
            </div>

            {purpose && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                <label className="text-sm font-semibold text-foreground/70">
                  What's the vibe? <span className="text-foreground/35 font-normal">(optional)</span>
                </label>
                <textarea
                  value={purposeNote}
                  onChange={(e) => setPurposeNote(e.target.value)}
                  placeholder={`e.g. "This is our annual family games day — we want board games, outdoor games, and a braai. Kid-friendly!"`}
                  rows={3}
                  className="w-full rounded-xl bg-card border-2 border-border px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
                />
                <p className="text-xs text-foreground/40">AI uses this to research the venue, plan tasks, and prepare your supply list.</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ─── Step 2: When & Where ─── */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">When & where? 📅</h1>
              <p className="text-foreground/55 text-sm">Pick the date and venue — AI will research it for you.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/70 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl bg-card border-2 border-border px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/70">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-xl bg-card border-2 border-border px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>

            {/* Location Type Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground/70 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Where are you meeting?
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {POPULAR_LOCATIONS.map((loc) => (
                  <motion.button
                    key={loc.id}
                    onClick={() => setLocationType(loc.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all duration-200",
                      locationType === loc.id
                        ? "bg-primary/20 border-2 border-primary scale-105"
                        : "bg-card border-2 border-border hover:border-primary/30"
                    )}
                  >
                    <span className="text-2xl">{loc.emoji}</span>
                    <span className="text-xs font-semibold text-center line-clamp-2">{loc.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Venue / Location Input */}
            {locationType && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/70 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {locationType === 'home' && 'Your Address'}
                  {locationType === 'park' && 'Park or Outdoor Area'}
                  {locationType === 'beach' && 'Beach Location'}
                  {locationType === 'restaurant' && 'Restaurant or Cafe'}
                  {locationType === 'venue' && 'Event Venue'}
                  {locationType === 'other' && 'Location Name'}
                </label>
                <LocationPicker
                  value={location}
                  onChange={setLocation}
                  locationType={locationType}
                />
              </div>
            )}

            {/* AI Research results */}
            {(location || venueSelection) && date && (
              <div className="rounded-2xl border-2 border-border bg-card p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold">AI Venue Research</span>
                  {loadingResearch && <Loader2 className="w-3.5 h-3.5 animate-spin text-foreground/40 ml-auto" />}
                </div>

                {/* Weather */}
                {weatherData && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <WeatherIcon condition={weatherData.condition ?? ''} />
                    <div>
                      <p className="text-sm font-semibold">{weatherData.temp ?? '~22'}°C · {weatherData.condition ?? 'Partly cloudy'}</p>
                      <p className="text-xs text-foreground/50">Weather forecast for your event day</p>
                    </div>
                  </div>
                )}
                {!weatherData && !loadingResearch && date && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">Weather check not available</p>
                      <p className="text-xs text-amber-600">We'll remind you to check closer to the date</p>
                    </div>
                  </div>
                )}

                {/* Venue intel */}
                {venueResearch && (
                  <div className="space-y-2">
                    {venueResearch.parking && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-lg">🅿️</span>
                        <span className="text-foreground/70">{venueResearch.parking}</span>
                      </div>
                    )}
                    {venueResearch.tips?.map((tip: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-lg shrink-0">💡</span>
                        <span className="text-foreground/70">{tip}</span>
                      </div>
                    ))}
                  </div>
                )}

                {loadingResearch && !venueResearch && (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-4 rounded bg-muted animate-pulse" />
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ─── Step 3: Guests ─── */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">Who's coming? 👥</h1>
              <p className="text-foreground/55 text-sm">Add guests so we can delegate tasks and send invites.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/70">Estimated guests</label>
              <input
                type="number"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                placeholder="e.g. 12"
                min="1"
                className="w-full rounded-xl bg-card border-2 border-border px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <div className="rounded-2xl border-2 border-border bg-card p-5 space-y-4">
              <p className="text-sm font-bold">Add guests</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  placeholder="Name"
                  className="flex-1 rounded-xl bg-muted border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                />
                <input
                  type="tel"
                  value={newGuestPhone}
                  onChange={(e) => setNewGuestPhone(e.target.value)}
                  placeholder="+27 cell"
                  className="w-32 rounded-xl bg-muted border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                />
                <button
                  onClick={addGuest}
                  disabled={!newGuestName.trim()}
                  className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold disabled:opacity-40 hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {guests.length > 0 ? (
                <div className="space-y-2">
                  {guests.map((g, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm">
                        {g.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{g.name}</p>
                        {g.phone && <p className="text-xs text-foreground/50">{g.phone}</p>}
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                        Pending
                      </span>
                      <button onClick={() => setGuests(prev => prev.filter((_, idx) => idx !== i))} className="text-foreground/30 hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-foreground/40 text-center py-2">No guests added yet — you can invite people after creating the event too.</p>
              )}
            </div>
          </motion.div>
        )}

        {/* ─── Step 4: Tasks & Plan ─── */}
        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">Tasks & Plan ✅</h1>
              <p className="text-foreground/55 text-sm">AI generated a task list — edit, add, or assign to guests.</p>
            </div>

            {!aiTasksLoaded && (
              <div className="rounded-2xl border-2 border-border bg-card p-8 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-primary mx-auto animate-pulse-warm" />
                <p className="text-sm font-semibold">AI is planning your event...</p>
                <p className="text-xs text-foreground/50">Generating tasks, supply list, and delegations</p>
                <div className="flex gap-1 justify-center">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}

            {aiTasksLoaded && (
              <>
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border group">
                      <button
                        onClick={() => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: !t.done } : t))}
                        className={cn(
                          'shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                          task.done ? 'bg-secondary border-secondary' : 'border-border hover:border-secondary',
                        )}
                      >
                        {task.done && <Check className="w-3 h-3 text-white" />}
                      </button>
                      <span className={cn('flex-1 text-sm', task.done && 'line-through text-foreground/40')}>{task.text}</span>
                      {guests.length > 0 && (
                        <select
                          value={task.assignee}
                          onChange={(e) => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, assignee: e.target.value } : t))}
                          className="text-xs rounded-lg bg-muted border border-border px-2 py-1 focus:outline-none focus:border-primary/50 max-w-[120px]"
                        >
                          <option value="">Assign...</option>
                          {guests.map(g => <option key={g.name} value={g.name}>{g.name}</option>)}
                        </select>
                      )}
                      {task.assignee && (
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium shrink-0">
                          {task.assignee}
                        </span>
                      )}
                      <button onClick={() => removeTask(task.id)} className="text-foreground/20 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add task */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                    placeholder="Add a task..."
                    className="flex-1 rounded-xl bg-card border-2 border-border px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  />
                  {guests.length > 0 && (
                    <select
                      value={newTaskAssignee}
                      onChange={(e) => setNewTaskAssignee(e.target.value)}
                      className="rounded-xl bg-card border-2 border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50 max-w-[130px]"
                    >
                      <option value="">Assign...</option>
                      {guests.map(g => <option key={g.name} value={g.name}>{g.name}</option>)}
                    </select>
                  )}
                  <button
                    onClick={addTask}
                    disabled={!newTaskText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-primary text-white font-bold disabled:opacity-40 hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {gear.length > 0 && (
                  <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" /> Gear / supplies
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {gear.map(item => (
                        <span key={item} className="px-3 py-1.5 rounded-xl bg-card border border-border text-sm">{item}</span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* ─── Step 5: Invite & Book ─── */}
        {step === 5 && (
          <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">
                {created ? '🎉 Event created!' : 'Invite & Book 📨'}
              </h1>
              <p className="text-foreground/55 text-sm">
                {created ? 'Share the invite and get everyone ready!' : 'Create the event, then invite your guests.'}
              </p>
            </div>

            {!created ? (
              <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-6 space-y-4">
                <h3 className="font-bold text-lg">Event summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2"><span className="font-semibold w-20 shrink-0">Name:</span><span className="text-foreground/70">{title}</span></div>
                  <div className="flex gap-2"><span className="font-semibold w-20 shrink-0">When:</span><span className="text-foreground/70">{date ? `${new Date(date + 'T12:00').toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })} at ${time}` : 'TBD'}</span></div>
                  <div className="flex gap-2"><span className="font-semibold w-20 shrink-0">Where:</span><span className="text-foreground/70">{location || 'TBD'}</span></div>
                  <div className="flex gap-2"><span className="font-semibold w-20 shrink-0">Guests:</span><span className="text-foreground/70">{guestCount || guests.length || 'TBD'} people</span></div>
                  <div className="flex gap-2"><span className="font-semibold w-20 shrink-0">Tasks:</span><span className="text-foreground/70">{tasks.length} items planned</span></div>
                </div>
                <button
                  onClick={handleCreateEvent}
                  disabled={isSubmitting || !title.trim()}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base bg-primary text-white shadow-lg hover:bg-primary/90 glow-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating event...</> : <><Check className="w-4 h-4" /> Create Event</>}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Invite message preview */}
                <div className="rounded-2xl border-2 border-border bg-card p-5 space-y-3">
                  <p className="text-sm font-bold">Invite message</p>
                  <textarea
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    rows={7}
                    className="w-full rounded-xl bg-muted border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none font-mono"
                  />
                </div>

                {/* Send options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={sendGroupWhatsApp}
                    className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold bg-[#25D366] text-white hover:bg-[#22c55e] transition-colors shadow-md"
                  >
                    <MessageCircle className="w-5 h-5" /> WhatsApp Group
                  </button>
                  <button
                    onClick={() => window.open('https://www.awehchat.co.za', '_blank')}
                    className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold bg-sky-500 text-white hover:bg-sky-600 transition-colors shadow-md"
                  >
                    <MessageCircle className="w-5 h-5" /> Send via AwehChat
                  </button>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: title, text: inviteMessage });
                      } else {
                        navigator.clipboard.writeText(inviteMessage);
                        toast({ title: 'Copied to clipboard!' });
                      }
                    }}
                    className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold bg-card border-2 border-border hover:border-primary/30 transition-colors"
                  >
                    <Share2 className="w-4 h-4" /> Copy / Share
                  </button>
                  <button
                    onClick={() => eventId && router.push(`/events/${eventId}`)}
                    className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 transition-colors shadow-md"
                  >
                    <ExternalLink className="w-4 h-4" /> Open Event Page
                  </button>
                </div>

                {/* Booking widget */}
                <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏨</span>
                    <p className="font-bold text-amber-900">Need to book a venue?</p>
                  </div>
                  <p className="text-sm text-amber-800">
                    We found <strong>{location || 'your venue'}</strong> — tell us what you need and we'll pre-fill the booking for you. Just press confirm.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-xl bg-white border border-amber-200 p-3">
                      <p className="text-xs text-amber-600 font-semibold mb-1">Venue</p>
                      <p className="font-semibold text-amber-900 truncate">{location || 'Not set'}</p>
                    </div>
                    <div className="rounded-xl bg-white border border-amber-200 p-3">
                      <p className="text-xs text-amber-600 font-semibold mb-1">Guests</p>
                      <p className="font-semibold text-amber-900">{guestCount || guests.length || '?'} people</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const q = encodeURIComponent(`Book ${location || 'venue'} for ${guestCount || guests.length} people on ${date}`);
                      window.open(`https://www.google.com/search?q=${q}`, '_blank');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" /> Check Availability & Book
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
        <button
          onClick={() => setStep(prev => Math.max(1, prev - 1))}
          disabled={step === 1}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-card border border-border
                     hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        {step < 5 && (
          <button
            onClick={() => setStep(prev => Math.min(5, prev + 1))}
            disabled={!canNext}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-primary text-white
                       shadow-md hover:bg-primary/90 glow-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            {step === 4 ? 'Review & Invite' : 'Next'} <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
