'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { AIDraftReview, type EventDraft } from '@/components/dashboard/AIDraftReview';
import { cn } from '@/lib/utils';
import {
  ArrowUp,
  Loader2,
  MapPin,
  Calendar,
  Users,
  Package,
  Gamepad2,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getUserEventStats,
  getPersonalizedSuggestions,
  type PersonalizedSuggestion,
  type UserEventStats,
} from '@/app/actions/suggestions';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

function StatSkeleton() {
  return (
    <div className="flex flex-col items-start gap-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse">
      <div className="w-8 h-8 rounded-lg bg-zinc-800" />
      <div className="space-y-1.5 w-full">
        <div className="h-6 w-10 rounded bg-zinc-800" />
        <div className="h-3 w-16 rounded bg-zinc-800" />
      </div>
    </div>
  );
}

function PromptChip({
  prompt,
  reason,
  onSelect,
  disabled,
}: {
  prompt: string;
  reason: string;
  onSelect: (p: string) => void;
  disabled: boolean;
}) {
  const label = `${prompt.split(' ').slice(0, 3).join(' ')}...`;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => onSelect(prompt)}
          disabled={disabled}
          title={prompt}
          className="shrink-0 px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700
            text-zinc-400 text-xs hover:text-zinc-200 hover:border-[#00FF66]/40 transition-colors
            disabled:opacity-40 active:scale-95"
        >
          {label}
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-[240px] border-zinc-700 bg-zinc-900 text-zinc-200 text-xs leading-relaxed">
        <p className="font-medium text-[#00FF66] mb-1">Why this suggestion</p>
        <p>{reason}</p>
      </TooltipContent>
    </Tooltip>
  );
}

const STAT_DEFS = [
  { key: 'outings' as const, label: 'Outings', icon: MapPin, href: '/events' },
  { key: 'upcoming' as const, label: 'Upcoming', icon: Calendar, href: '/events' },
  { key: 'gangCount' as const, label: 'The Gang', icon: Users, href: '/dashboard/the-gang' },
  { key: 'gearItems' as const, label: 'Gear Items', icon: Package, href: '/profile/gear' },
];

const DEFAULT_PROMPTS: PersonalizedSuggestion[] = [
  {
    prompt: 'Braai this Saturday at Kirstenbosch for 8 people',
    reason: 'Suggested to help you start planning quickly.',
  },
  {
    prompt: 'Hiking trip to Table Mountain next Sunday, 6 people',
    reason: 'Suggested to help you start planning quickly.',
  },
  {
    prompt: 'Beach day at Clifton on Friday, bring the gang',
    reason: 'Suggested to help you start planning quickly.',
  },
  {
    prompt: 'Dinner in town this weekend, 6 people',
    reason: 'Suggested to help you start planning quickly.',
  },
];

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
  const [promptsLoading, setPromptsLoading] = useState(true);

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
      setQuickPrompts(ps);
      setPromptsLoading(false);
    });
  }, [userProfile?.uid, userProfile?.familyId]);

  const handleParse = useCallback(
    async (input: string) => {
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
          title: 'Parsing failed',
          description: err instanceof Error ? err.message : 'Could not reach AI service.',
          variant: 'destructive',
        });
      } finally {
        setIsParsing(false);
      }
    },
    [isParsing, toast],
  );

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
        <Loader2 className="h-8 w-8 animate-spin text-[#00FF66]" />
      </div>
    );
  }

  const isNewUser = !statsLoading && stats !== null && stats.outings === 0;
  const firstName = userProfile?.name?.split(' ')[0];

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6 px-2 sm:px-0">
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-100">
          {firstName ? `Howzit, ${firstName}.` : 'Welcome back.'}
        </h1>
        <p className="text-zinc-500 text-base">
          {isNewUser ? 'Your first outing is one message away.' : "What's the move?"}
        </p>
      </div>

      {isNewUser && !draft && (
        <div className="rounded-2xl border border-[#00FF66]/20 bg-[#00FF66]/5 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#00FF66]" />
            <p className="text-sm font-semibold text-zinc-200">How it works</p>
          </div>
          <ol className="space-y-2 text-sm text-zinc-400 list-none">
            {[
              'Type what you want to do into the bar below in plain English.',
              'AI extracts the event, date, location, and gear in seconds.',
              'Confirm the draft and your squad gets auto-assigned gear from their bags.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#00FF66]/15 text-[#00FF66] text-xs font-bold mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      <div
        className={cn(
          'relative rounded-2xl border transition-all duration-300 bg-zinc-900',
          isParsing
            ? 'border-[#00FF66]/40 shadow-[0_0_40px_rgba(0,255,102,0.15)]'
            : 'border-zinc-700 hover:border-zinc-600',
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
          placeholder="Plan an outing. (e.g., 'Braai this Saturday at Kirstenbosch for 8 people')"
          rows={2}
          className={cn(
            'w-full resize-none bg-transparent px-5 pt-5 pb-14',
            'text-zinc-100 placeholder:text-zinc-600 text-base leading-relaxed',
            'focus:outline-none',
          )}
          disabled={isParsing}
        />

        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 pb-3 pointer-events-none">
          <TooltipProvider>
            <div className="flex gap-2 pointer-events-auto overflow-x-auto scrollbar-hide">
              {promptsLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-6 w-20 rounded-full bg-zinc-800 animate-pulse shrink-0" />
                  ))
                : quickPrompts.map((suggestion) => (
                    <PromptChip
                      key={suggestion.prompt}
                      prompt={suggestion.prompt}
                      reason={suggestion.reason}
                      disabled={isParsing}
                      onSelect={(p) => {
                        setPrompt(p);
                        handleParse(p);
                      }}
                    />
                  ))}
            </div>
          </TooltipProvider>

          <button
            onClick={() => handleParse(prompt)}
            disabled={isParsing || !prompt.trim()}
            className={cn(
              'pointer-events-auto shrink-0 flex items-center justify-center',
              'h-9 w-9 rounded-xl transition-all duration-200',
              'bg-[#00FF66] text-zinc-950',
              'shadow-[0_0_16px_rgba(0,255,102,0.4)] hover:shadow-[0_0_24px_rgba(0,255,102,0.6)]',
              'disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none',
            )}
            aria-label="Parse outing"
          >
            {isParsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {draft && (
        <AIDraftReview
          draft={draft}
          onConfirm={handleConfirm}
          onDiscard={() => {
            setDraft(null);
            setPrompt('');
          }}
          isSubmitting={isSubmitting}
        />
      )}

      {!draft && (
        <div>
          <div className="flex items-center justify-between mb-3 px-0.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600">Your stats</p>
            {!statsLoading && (
              <button
                onClick={() => {
                  setStatsLoading(true);
                  setPromptsLoading(true);
                  if (userProfile?.uid) {
                    getUserEventStats(userProfile.uid, userProfile.familyId)
                      .then(setStats)
                      .finally(() => setStatsLoading(false));
                    getPersonalizedSuggestions(userProfile.uid)
                      .then(setQuickPrompts)
                      .finally(() => setPromptsLoading(false));
                  }
                }}
                className="text-zinc-600 hover:text-zinc-400 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statsLoading
              ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
              : STAT_DEFS.map(({ key, label, icon: Icon, href }) => (
                  <button
                    key={label}
                    onClick={() => router.push(href)}
                    className={cn(
                      'group flex flex-col items-start gap-3 p-4 rounded-xl text-left',
                      'bg-zinc-900 border border-zinc-800',
                      'hover:border-zinc-700 hover:bg-zinc-800/50 transition-all duration-200',
                    )}
                  >
                    <div className="p-2 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 transition-colors">
                      <Icon className="h-4 w-4 text-[#00FF66]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-zinc-100 tabular-nums">{String(stats?.[key] ?? 0)}</p>
                      <p className="text-xs text-zinc-500 font-medium">{label}</p>
                    </div>
                  </button>
                ))}
          </div>

          {!statsLoading && stats && stats.recentEvents.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 px-0.5">
                Re-run a past outing
              </p>
              <div className="flex flex-wrap gap-2">
                {stats.recentEvents.slice(0, 3).map((ev, idx) => (
                  <button
                    key={`${ev.title}-${idx}`}
                    onClick={() => {
                      const p = ev.locationName ? `${ev.title} at ${ev.locationName}` : ev.title;
                      setPrompt(p);
                      handleParse(p);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border
                      border-zinc-800 text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors"
                  >
                    <MapPin className="w-3 h-3 text-[#00FF66]" />
                    {ev.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!draft && (
        <button
          onClick={() => router.push('/game')}
          className={cn(
            'w-full flex items-center justify-between px-5 py-4 rounded-xl',
            'bg-zinc-900 border border-zinc-800 hover:border-zinc-700',
            'transition-all duration-200 group',
          )}
        >
          <div className="flex items-center gap-3">
            <Gamepad2 className="h-5 w-5 text-[#00FF66]" />
            <div className="text-left">
              <p className="text-sm font-semibold text-zinc-100">Arcade</p>
              <p className="text-xs text-zinc-500">Jump into Party OS or squad games</p>
            </div>
          </div>
          <ArrowUp className="h-4 w-4 text-zinc-600 rotate-90 group-hover:text-zinc-400 transition-colors" />
        </button>
      )}
    </div>
  );
}

