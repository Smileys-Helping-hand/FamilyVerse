'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Loader2, Check, X } from 'lucide-react';

interface Props {
  token: string;
  defaultName?: string;
  allowReRsvp?: boolean;
}

export default function GuestRsvpForm({ token, defaultName = '', allowReRsvp = false }: Props) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [declined, setDeclined] = useState(false);

  const submit = async (status: 'GOING' | 'CANT_MAKE_IT') => {
    if (status === 'GOING' && !name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, guestName: name.trim(), status }),
      });

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Failed' }));
        throw new Error(error || 'Request failed');
      }

      if (status === 'GOING') {
        setDone(true);
      } else {
        setDeclined(true);
      }
      // Refresh server component to update state
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-[#00FF66]/30 bg-zinc-900/80 backdrop-blur-xl p-6 text-center space-y-2 animate-in fade-in duration-300">
        <p className="text-3xl">✅</p>
        <p className="text-zinc-100 font-bold text-lg">You&apos;re in, {name}!</p>
        <p className="text-zinc-500 text-sm">Your RSVP is confirmed. See you there!</p>
      </div>
    );
  }

  if (declined) {
    return (
      <div className="rounded-2xl border border-zinc-700 bg-zinc-900/80 backdrop-blur-xl p-6 text-center space-y-2 animate-in fade-in duration-300">
        <p className="text-3xl">😔</p>
        <p className="text-zinc-100 font-semibold">Got it — maybe next time.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-700/60 bg-zinc-900/80 backdrop-blur-xl p-5 space-y-4 animate-in fade-in duration-300">
      {allowReRsvp && (
        <p className="text-xs text-zinc-500 text-center">Changed your mind?</p>
      )}

      <div className="space-y-1.5">
        <label className="text-xs text-zinc-400 font-medium">Your Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit('GOING'); }}
          placeholder="Enter your name to RSVP..."
          maxLength={80}
          autoFocus
          className={cn(
            'w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2.5 text-sm text-zinc-100',
            'placeholder:text-zinc-600 focus:outline-none focus:border-[#00FF66]/50 transition-colors',
          )}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => submit('CANT_MAKE_IT')}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 text-sm font-semibold hover:border-zinc-500 hover:text-zinc-200 transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
        >
          <X className="h-3.5 w-3.5" /> Can&apos;t make it
        </button>
        <button
          type="button"
          onClick={() => submit('GOING')}
          disabled={loading || !name.trim()}
          className={cn(
            'flex-[2] py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200',
            'bg-[#00FF66] text-zinc-950',
            'shadow-[0_0_16px_rgba(0,255,102,0.3)] hover:shadow-[0_0_24px_rgba(0,255,102,0.5)]',
            'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none',
            'flex items-center justify-center gap-2',
          )}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4" /> I&apos;m In</>}
        </button>
      </div>
    </div>
  );
}
