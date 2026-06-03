'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { MapPin, Calendar, Tag, Package, Plus, X, Check, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

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

const EVENT_TYPES = ['braai', 'hike', 'party', 'sports', 'travel', 'dining', 'beach', 'games-day', 'other'] as const;

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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full rounded-2xl border-2 border-primary/20 bg-card shadow-lg p-6 space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-sm font-bold text-primary">AI Draft — Review & Edit</p>
        </div>
        <button onClick={onDiscard} className="text-foreground/35 hover:text-foreground transition-colors" aria-label="Discard draft">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground/55 flex items-center gap-1">
          <Tag className="h-3 w-3" /> Event Title
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          className={inputCls}
          placeholder="e.g. Games Day at The Ark"
        />
      </div>

      {/* Location + Date row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/55 flex items-center gap-1">
            <MapPin className="h-3 w-3 text-primary" /> Location
          </label>
          <input
            type="text"
            value={form.location ?? ''}
            onChange={(e) => update('location', e.target.value || null)}
            className={inputCls}
            placeholder="e.g. The Ark, Cape Town"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/55 flex items-center gap-1">
            <Calendar className="h-3 w-3 text-primary" /> Date
          </label>
          <input
            type="date"
            value={form.date ?? ''}
            onChange={(e) => update('date', e.target.value || null)}
            className={inputCls}
          />
        </div>
      </div>

      {/* Event type */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground/55">Event Type</label>
        <div className="flex flex-wrap gap-2">
          {EVENT_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => update('eventType', type)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-semibold border transition-all capitalize',
                form.eventType === type
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-foreground/50 hover:border-primary/40 hover:text-foreground',
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Required gear */}
      {(form.requiredGear.length > 0 || true) && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground/55 flex items-center gap-1">
            <Package className="h-3 w-3 text-primary" /> Supplies / Gear
          </label>
          {form.requiredGear.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.requiredGear.map((item, idx) => (
                <span key={idx} className="flex items-center gap-1.5 bg-muted border border-border text-foreground/70 text-xs px-2.5 py-1 rounded-full">
                  {item}
                  <button onClick={() => removeGear(idx)} className="text-foreground/35 hover:text-destructive transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={newGearItem}
              onChange={(e) => setNewGearItem(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addGear(); } }}
              className={cn(inputCls, 'flex-1')}
              placeholder="Add item..."
            />
            <button
              type="button"
              onClick={addGear}
              className="px-3 py-2 rounded-xl bg-muted border border-border text-foreground/50 hover:text-primary hover:border-primary/40 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="border-t border-border" />

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onDiscard}
          className="flex-1 py-3 rounded-xl border-2 border-border text-foreground/50 text-sm font-semibold hover:border-border/80 hover:text-foreground transition-all"
        >
          Discard
        </button>
        <button
          type="button"
          onClick={() => onConfirm(form)}
          disabled={isSubmitting || !form.title.trim()}
          className={cn(
            'flex-[2] py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2',
            'bg-primary text-white shadow-md hover:bg-primary/90 glow-primary',
            'disabled:opacity-40 disabled:cursor-not-allowed',
          )}
        >
          {isSubmitting
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Planning...</>
            : <><Check className="h-4 w-4" /> Continue to Plan Event</>}
        </button>
      </div>
    </motion.div>
  );
}

const inputCls = 'w-full rounded-xl bg-muted border-2 border-border px-3 py-2.5 text-sm placeholder:text-foreground/35 focus:outline-none focus:border-primary/50 transition-colors';
