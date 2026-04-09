'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { AIDraftReview, type EventDraft } from '@/components/dashboard/AIDraftReview';
import { cn } from '@/lib/utils';
import { ArrowUp, Loader2, MapPin, Calendar, Users, Gamepad2, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const QUICK_PROMPTS = [
  'Braai this Saturday at Kirstenbosch for 8 people',
  'Hiking trip to Table Mountain next Sunday, 6 people',
  'Beach day at Clifton on Friday, bring the gang',
  'Dinner in town this weekend',
];

const STAT_CARDS = [
  { label: 'Outings',   value: '0', icon: MapPin,   href: '/events' },
  { label: 'Upcoming',  value: '0', icon: Calendar, href: '/events' },
  { label: 'The Gang',  value: '0', icon: Users,    href: '/dashboard/the-gang' },
  { label: 'Gear Items',value: '0', icon: Package,  href: '/dashboard/gear' },
];

export default function DashboardPage() {
  const { userProfile, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [prompt, setPrompt] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [draft, setDraft] = useState<EventDraft | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [prompt]);

  const handleParse = async (input: string) => {
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
  };

  const handleConfirm = async (confirmed: EventDraft) => {
    setIsSubmitting(true);
    try {
      const params = new URLSearchParams({
        title:     confirmed.title,
        location:  confirmed.location  ?? '',
        date:      confirmed.date      ?? '',
        eventType: confirmed.eventType,
        gear:      JSON.stringify(confirmed.requiredGear),
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

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6 px-2 sm:px-0">

      {/* ── Greeting ── */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-100">
          {userProfile?.name ? `Howzit, ${userProfile.name}.` : 'Welcome back.'}
        </h1>
        <p className="text-zinc-500 text-base">What&apos;s the move?</p>
      </div>

      {/* ── THE OMNIBAR ── */}
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

        {/* Bottom toolbar */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 pb-3 pointer-events-none">
          <div className="flex gap-2 pointer-events-auto overflow-x-auto scrollbar-hide">
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q}
                onClick={() => { setPrompt(q); handleParse(q); }}
                disabled={isParsing}
                className="shrink-0 px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs hover:text-zinc-200 hover:border-zinc-500 transition-colors disabled:opacity-40"
              >
                {q.split(' ').slice(0, 3).join(' ')}&hellip;
              </button>
            ))}
          </div>

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
            {isParsing
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <ArrowUp className="h-4 w-4" />
            }
          </button>
        </div>
      </div>

      {/* ── AI Draft Review ── */}
      {draft && (
        <AIDraftReview
          draft={draft}
          onConfirm={handleConfirm}
          onDiscard={() => { setDraft(null); setPrompt(''); }}
          isSubmitting={isSubmitting}
        />
      )}

      {/* ── Stat tiles (hidden while draft is open) ── */}
      {!draft && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STAT_CARDS.map(({ label, value, icon: Icon, href }) => (
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
                <p className="text-2xl font-bold text-zinc-100">{value}</p>
                <p className="text-xs text-zinc-500 font-medium">{label}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Arcade shortcut ── */}
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

