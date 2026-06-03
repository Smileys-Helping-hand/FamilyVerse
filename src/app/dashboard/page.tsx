'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { AIDraftReview, type EventDraft } from '@/components/dashboard/AIDraftReview';
import { cn } from '@/lib/utils';
import {
  ArrowRight, Loader2, MapPin, Calendar, Users, Sparkles, Plus,
  MessageCircle, ChevronRight, Clock, Heart, Star, Trophy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getUserEventStats, getPersonalizedSuggestions,
  type PersonalizedSuggestion, type UserEventStats,
} from '@/app/actions/suggestions';
import { motion } from 'framer-motion';

const QUICK_PROMPTS = [
  { label: '🎮 Games day', prompt: 'Games day at The Ark this Saturday for 12 people' },
  { label: '🍖 Family braai', prompt: 'Family braai this Sunday at home for 20 people' },
  { label: '🏖️ Beach day', prompt: 'Beach day at Clifton on Friday, bring the whole family' },
  { label: '🎂 Birthday party', prompt: 'Birthday party at a venue this weekend, 30 people' },
];

const DEFAULT_PROMPTS: PersonalizedSuggestion[] = [
  { prompt: 'Games day at The Ark this Saturday for 12 people', reason: 'Popular for family fun days' },
  { prompt: 'Family braai this Sunday at home for 20 people', reason: 'A South African classic' },
  { prompt: 'Beach day at Clifton on Friday, bring the whole family', reason: 'Perfect for summer' },
  { prompt: 'Birthday party at a venue this weekend, 30 people', reason: 'Celebrate with everyone' },
];

function StatCard({ label, value, icon: Icon, href, color }: {
  label: string; value: number; icon: any; href: string; color: string;
}) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      className="group flex flex-col items-start gap-3 p-5 rounded-2xl bg-card border border-border
                 hover:shadow-md hover:border-primary/20 transition-all duration-200 text-left w-full"
    >
      <div className={`p-2.5 rounded-xl ${color} bg-opacity-15 group-hover:bg-opacity-25 transition-colors`}>
        <Icon className={`h-5 w-5 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <p className="text-3xl font-extrabold tabular-nums">{value}</p>
        <p className="text-sm text-foreground/50 font-medium mt-0.5">{label}</p>
      </div>
    </button>
  );
}

function StatSkeleton() {
  return (
    <div className="flex flex-col items-start gap-3 p-5 rounded-2xl bg-muted/50 border border-border animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-muted" />
      <div className="space-y-1.5 w-full">
        <div className="h-7 w-12 rounded-lg bg-muted" />
        <div className="h-3.5 w-20 rounded bg-muted" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { userProfile, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [prompt, setPrompt] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [draft, setDraft] = useState<EventDraft | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState<UserEventStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [quickPrompts, setQuickPrompts] = useState<PersonalizedSuggestion[]>(DEFAULT_PROMPTS);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [prompt]);

  useEffect(() => {
    if (!userProfile?.uid) return;
    getUserEventStats(userProfile.uid, userProfile.familyId).then((s) => {
      setStats(s);
      setStatsLoading(false);
    });
    getPersonalizedSuggestions(userProfile.uid).then((ps) => {
      setQuickPrompts(ps.length ? ps : DEFAULT_PROMPTS);
    });
  }, [userProfile?.uid, userProfile?.familyId]);

  const handleParse = useCallback(async (input: string) => {
    const text = input.trim();
    if (!text || isParsing) return;
    setIsParsing(true);
    setDraft(null);
    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error || 'Unknown error');
      }
      const data: EventDraft = await res.json();
      setDraft(data);
    } catch (err) {
      toast({
        title: 'Could not plan event',
        description: err instanceof Error ? err.message : 'Could not reach AI service.',
        variant: 'destructive',
      });
    } finally {
      setIsParsing(false);
    }
  }, [isParsing, toast]);

  const handleConfirm = async (confirmed: EventDraft) => {
    setIsSubmitting(true);
    try {
      const params = new URLSearchParams({
        title: confirmed.title,
        location: confirmed.location ?? '',
        date: confirmed.date ?? '',
        eventType: confirmed.eventType,
        gear: JSON.stringify(confirmed.requiredGear),
      });
      router.push(`/events/new?${params.toString()}`);
    } catch {
      toast({ title: 'Something went wrong', variant: 'destructive' });
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <span className="text-4xl animate-bounce-soft">🏡</span>
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const isNewUser = !statsLoading && stats !== null && stats.outings === 0;
  const firstName = userProfile?.name?.split(' ')[0];
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6 px-4 sm:px-0">

      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-1"
      >
        <div className="flex items-center gap-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {greeting}{firstName ? `, ${firstName}` : ''}! 👋
          </h1>
        </div>
        <p className="text-foreground/55 text-base">
          {isNewUser
            ? 'Ready to plan your first family event? Just type what you want below.'
            : "What are we planning next?"}
        </p>
      </motion.div>

      {/* New user onboarding tip */}
      {isNewUser && !draft && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-3"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <p className="text-sm font-semibold">How FamilyVerse works</p>
          </div>
          <ol className="space-y-2 text-sm text-foreground/60">
            {[
              'Type what you want to plan below — in plain English, no forms needed.',
              'AI extracts the event, date, venue, and what you\'ll need in seconds.',
              'Confirm the plan — tasks get delegated, invites go out automatically.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </motion.div>
      )}

      {/* AI Planner Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className={cn(
          'relative rounded-2xl border-2 transition-all duration-300 bg-card shadow-sm',
          isParsing
            ? 'border-primary/50 shadow-lg shadow-primary/10'
            : 'border-border hover:border-primary/30',
        )}
      >
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleParse(prompt);
            }
          }}
          placeholder="What are you planning? e.g. 'Games day at The Ark this Saturday for 12 people'"
          rows={2}
          className={cn(
            'w-full resize-none bg-transparent px-5 pt-5 pb-16',
            'text-foreground placeholder:text-foreground/35 text-base leading-relaxed',
            'focus:outline-none',
          )}
          disabled={isParsing}
        />

        {/* Quick chips */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 pb-3.5 gap-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q.label}
                onClick={() => { setPrompt(q.prompt); handleParse(q.prompt); }}
                disabled={isParsing}
                className="shrink-0 px-3 py-1 rounded-full bg-muted border border-border text-foreground/60
                           text-xs font-medium hover:text-foreground hover:border-primary/30 hover:bg-primary/5
                           transition-colors disabled:opacity-40"
              >
                {q.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => handleParse(prompt)}
            disabled={isParsing || !prompt.trim()}
            className={cn(
              'shrink-0 flex items-center justify-center h-9 w-9 rounded-xl transition-all duration-200',
              'bg-primary text-white shadow-md hover:shadow-lg hover:bg-primary/90',
              'disabled:opacity-30 disabled:cursor-not-allowed',
            )}
          >
            {isParsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </motion.div>

      {/* AI Draft Review */}
      {draft && (
        <AIDraftReview
          draft={draft}
          onConfirm={handleConfirm}
          onDiscard={() => { setDraft(null); setPrompt(''); }}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Stats */}
      {!draft && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-foreground/35 mb-3">Your activity</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statsLoading ? (
              Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
            ) : (
              <>
                <StatCard label="Events" value={stats?.outings ?? 0} icon={Calendar} href="/events" color="bg-primary" />
                <StatCard label="Upcoming" value={stats?.upcoming ?? 0} icon={Clock} href="/events?status=UPCOMING" color="bg-secondary" />
                <StatCard label="People" value={stats?.gangCount ?? 0} icon={Users} href="/dashboard/the-gang" color="bg-accent" />
                <StatCard label="Gear items" value={stats?.gearItems ?? 0} icon={Trophy} href="/dashboard/gear" color="bg-violet-500" />
              </>
            )}
          </div>
        </div>
      )}

      {/* Recent events re-run */}
      {!draft && !statsLoading && stats && stats.recentEvents.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-foreground/35 mb-3">Plan again</p>
          <div className="flex flex-wrap gap-2">
            {stats.recentEvents.slice(0, 3).map((ev, idx) => (
              <button
                key={`${ev.title}-${idx}`}
                onClick={() => {
                  const p = ev.locationName ? `${ev.title} at ${ev.locationName}` : ev.title;
                  setPrompt(p);
                  handleParse(p);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card border border-border
                           text-sm text-foreground/60 hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-primary" />
                {ev.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {!draft && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-foreground/35 mb-3">Quick actions</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => router.push('/events/create')}
              className="flex items-center justify-between px-5 py-4 rounded-2xl bg-card border border-border
                         hover:border-primary/30 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">Create event</p>
                  <p className="text-xs text-foreground/45">Full event setup wizard</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-foreground/30 group-hover:text-foreground/60 transition-colors" />
            </button>

            <button
              onClick={() => router.push('/dashboard/the-gang')}
              className="flex items-center justify-between px-5 py-4 rounded-2xl bg-card border border-border
                         hover:border-secondary/30 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-secondary/10">
                  <Users className="h-5 w-5 text-secondary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">Manage people</p>
                  <p className="text-xs text-foreground/45">Friends list & contacts</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-foreground/30 group-hover:text-foreground/60 transition-colors" />
            </button>

            <button
              onClick={() => router.push('/portal/awehchat')}
              className="flex items-center justify-between px-5 py-4 rounded-2xl bg-card border border-border
                         hover:border-sky-400/30 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-400/10">
                  <MessageCircle className="h-5 w-5 text-sky-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">AwehChat</p>
                  <p className="text-xs text-foreground/45">Group messaging & updates</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-foreground/30 group-hover:text-foreground/60 transition-colors" />
            </button>

            <button
              onClick={() => router.push('/events')}
              className="flex items-center justify-between px-5 py-4 rounded-2xl bg-card border border-border
                         hover:border-accent/30 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-accent/10">
                  <Calendar className="h-5 w-5 text-amber-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">All events</p>
                  <p className="text-xs text-foreground/45">View past & upcoming</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-foreground/30 group-hover:text-foreground/60 transition-colors" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
