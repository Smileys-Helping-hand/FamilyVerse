'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { MapPin, Calendar, Tag, Package, Plus, X, Check, Loader2 } from 'lucide-react';

export interface EventDraft {
  title: string;
  location: string | null;
  date: string | null;
  eventType: string;
  requiredGear: string[];
}

interface AIDraftReviewProps {
  draft: EventDraft;
  onConfirm: (draft: EventDraft) => void;
  onDiscard: () => void;
  isSubmitting?: boolean;
}

const EVENT_TYPES = [
  'braai', 'hike', 'party', 'sports', 'travel', 'dining', 'beach', 'other',
] as const;

export function AIDraftReview({ draft, onConfirm, onDiscard, isSubmitting = false }: AIDraftReviewProps) {
  const [form, setForm] = useState<EventDraft>({ ...draft });
  const [newGearItem, setNewGearItem] = useState('');

  const update = <K extends keyof EventDraft>(key: K, value: EventDraft[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const addGear = () => {
    const item = newGearItem.trim();
    if (!item || form.requiredGear.includes(item)) return;
    update('requiredGear', [...form.requiredGear, item]);
    setNewGearItem('');
  };

  const removeGear = (idx: number) =>
    update('requiredGear', form.requiredGear.filter((_, i) => i !== idx));

  return (
    <div
      className={cn(
        'relative w-full rounded-2xl border border-zinc-700/60',
        'bg-zinc-900/60 backdrop-blur-xl',
        'shadow-[0_0_40px_rgba(0,255,102,0.08)]',
        'p-6 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-400',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#00FF66]/70">
          AI Draft — Review & Edit
        </p>
        <button
          onClick={onDiscard}
          className="text-zinc-500 hover:text-zinc-100 transition-colors"
          aria-label="Discard draft"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <label className="text-xs text-zinc-400 font-medium">Outing Title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          className={inputCls}
          placeholder="e.g. Saturday Braai at Kirstenbosch"
        />
      </div>

      {/* Location + Date row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs text-zinc-400 font-medium flex items-center gap-1">
            <MapPin className="h-3 w-3 text-[#00FF66]" /> Location
          </label>
          <input
            type="text"
            value={form.location ?? ''}
            onChange={(e) => update('location', e.target.value || null)}
            className={inputCls}
            placeholder="e.g. Kirstenbosch, Cape Town"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-zinc-400 font-medium flex items-center gap-1">
            <Calendar className="h-3 w-3 text-[#00FF66]" /> Date
          </label>
          <input
            type="date"
            value={form.date ?? ''}
            onChange={(e) => update('date', e.target.value || null)}
            className={cn(inputCls, 'text-zinc-300')}
          />
        </div>
      </div>

      {/* Event type */}
      <div className="space-y-1.5">
        <label className="text-xs text-zinc-400 font-medium flex items-center gap-1">
          <Tag className="h-3 w-3 text-[#00FF66]" /> Event Type
        </label>
        <div className="flex flex-wrap gap-2">
          {EVENT_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => update('eventType', type)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150 capitalize',
                form.eventType === type
                  ? 'border-[#00FF66] bg-[#00FF66]/10 text-[#00FF66]'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200',
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Required gear */}
      <div className="space-y-2">
        <label className="text-xs text-zinc-400 font-medium flex items-center gap-1">
          <Package className="h-3 w-3 text-[#00FF66]" /> Required Gear
        </label>
        <div className="flex flex-wrap gap-2">
          {form.requiredGear.map((item, idx) => (
            <span
              key={idx}
              className="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs px-2.5 py-1 rounded-full"
            >
              {item}
              <button
                onClick={() => removeGear(idx)}
                className="text-zinc-500 hover:text-zinc-100 transition-colors"
                aria-label={`Remove ${item}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        {/* Add gear input */}
        <div className="flex gap-2 mt-1">
          <input
            type="text"
            value={newGearItem}
            onChange={(e) => setNewGearItem(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addGear(); } }}
            className={cn(inputCls, 'flex-1 text-sm')}
            placeholder="Add gear item..."
          />
          <button
            type="button"
            onClick={addGear}
            className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-[#00FF66] hover:border-[#00FF66]/50 transition-colors"
            aria-label="Add gear"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-800" />

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onDiscard}
          className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 text-sm font-semibold hover:border-zinc-500 hover:text-zinc-200 transition-all duration-150"
        >
          Discard
        </button>
        <button
          type="button"
          onClick={() => onConfirm(form)}
          disabled={isSubmitting || !form.title.trim()}
          className={cn(
            'flex-[2] py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200',
            'bg-[#00FF66] text-zinc-950 hover:bg-[#00FF66]/90',
            'shadow-[0_0_20px_rgba(0,255,102,0.35)] hover:shadow-[0_0_32px_rgba(0,255,102,0.5)]',
            'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none',
            'flex items-center justify-center gap-2',
          )}
        >
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Delegating...</>
          ) : (
            <><Check className="h-4 w-4" /> Confirm &amp; Auto-Delegate</>
          )}
        </button>
      </div>
    </div>
  );
}

const inputCls =
  'w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#00FF66]/60 focus:ring-1 focus:ring-[#00FF66]/30 transition-colors';
