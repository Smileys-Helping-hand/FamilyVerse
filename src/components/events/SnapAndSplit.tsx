'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getPusherClient } from '@/lib/pusher/client';
import { addExpense } from '@/app/actions/events';
import {
  Camera,
  Loader2,
  Receipt,
  CheckCircle2,
  UserRound,
  Zap,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------
// Types
// ---------------------------------------------

interface ReceiptItem {
  name: string;
  price: number;
  quantity: number;
}

interface ScannedReceipt {
  merchant: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
}

interface Attendee {
  userId: string;
  userName: string;
}

interface SnapAndSplitProps {
  eventId: string;
  currentUser: { uid: string; name: string };
  attendees: Attendee[];
  onComplete?: () => void;
}

// ---------------------------------------------
// Helpers
// ---------------------------------------------

function fmtRand(cents: number) {
  return `R ${(cents / 100).toFixed(2)}`;
}

function calcAssignments(
  items: ReceiptItem[],
  assignments: Record<number, string[]>,
  tax: number,
  tip: number
): Record<string, number> {
  const itemsTotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const extras = tax + tip;

  const personTotals: Record<string, number> = {};

  items.forEach((item, idx) => {
    const claimants = assignments[idx] ?? [];
    if (claimants.length === 0) return;
    const share = (item.price * item.quantity) / claimants.length;
    claimants.forEach((uid) => {
      personTotals[uid] = (personTotals[uid] ?? 0) + share;
    });
  });

  // Distribute tax + tip proportionally
  if (extras > 0 && itemsTotal > 0) {
    Object.entries(personTotals).forEach(([uid, subtotal]) => {
      const proportion = subtotal / itemsTotal;
      personTotals[uid] = subtotal + extras * proportion;
    });
  }

  return personTotals;
}

// ---------------------------------------------
// AssigneeDropdown
// ---------------------------------------------

function AssigneeDropdown({
  itemIdx,
  attendees,
  assignments,
  onToggle,
}: {
  itemIdx: number;
  attendees: Attendee[];
  assignments: Record<number, string[]>;
  onToggle: (itemIdx: number, uid: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const claimed = assignments[itemIdx] ?? [];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg border transition-colors',
          claimed.length > 0
            ? 'border-[#00FF66]/40 bg-[#00FF66]/10 text-[#00FF66]'
            : 'border-zinc-700 bg-zinc-800/60 text-zinc-400 hover:border-zinc-500'
        )}
      >
        <UserRound className="w-3 h-3" />
        {claimed.length === 0
          ? 'Assign'
          : claimed.length === 1
          ? attendees.find((a) => a.userId === claimed[0])?.userName ?? 'Unknown'
          : `${claimed.length} people`}
        <ChevronDown className="w-3 h-3" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 z-50 w-44 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl overflow-hidden">
          {attendees.map((att) => {
            const checked = claimed.includes(att.userId);
            return (
              <button
                key={att.userId}
                type="button"
                onClick={() => onToggle(itemIdx, att.userId)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-zinc-800 transition-colors"
              >
                <span
                  className={cn(
                    'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0',
                    checked
                      ? 'bg-[#00FF66] border-[#00FF66]'
                      : 'border-zinc-600 bg-transparent'
                  )}
                >
                  {checked && <CheckCircle2 className="w-3 h-3 text-zinc-950" />}
                </span>
                <span className="truncate">{att.userName}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              // Select all
              attendees.forEach((a) => {
                if (!claimed.includes(a.userId)) onToggle(itemIdx, a.userId);
              });
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-zinc-500 hover:bg-zinc-800 border-t border-zinc-800 transition-colors"
          >
            <Zap className="w-3 h-3 text-[#00FF66]" /> Split equally
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------
// Main SnapAndSplit component
// ---------------------------------------------

export function SnapAndSplit({ eventId, currentUser, attendees, onComplete }: SnapAndSplitProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'upload' | 'review' | 'confirm'>('upload');
  const [scanning, setScanning] = useState(false);
  const [receipt, setReceipt] = useState<ScannedReceipt | null>(null);
  const [assignments, setAssignments] = useState<Record<number, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [liveDebts, setLiveDebts] = useState<Record<string, number>>({});

  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Real-time: subscribe to snap-split-update so all squad members see claim changes
  useEffect(() => {
    if (!open) return;
    let pusher: ReturnType<typeof getPusherClient>;
    try {
      pusher = getPusherClient();
      const ch = pusher.subscribe(`event-${eventId}`);
      ch.bind('snap-split-update', (data: { assignments: Record<number, string[]> }) => {
        setAssignments(data.assignments);
      });
      return () => {
        ch.unbind_all();
        ch.unsubscribe();
      };
    } catch {
      // Pusher unavailable - offline mode, continue without real-time
    }
  }, [open, eventId]);

  const handleFile = useCallback(async (file: File) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast({ title: 'Invalid file', description: 'Use JPEG, PNG, or WEBP', variant: 'destructive' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 10MB', variant: 'destructive' });
      return;
    }

    setScanning(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch('/api/kitty/scan-receipt', { method: 'POST', body: fd });
      const data = await res.json();

      if (!res.ok) {
        toast({ title: 'Scan failed', description: data.error ?? 'Unknown error', variant: 'destructive' });
        return;
      }

      setReceipt(data as ScannedReceipt);
      // Pre-assign every item to current user
      const defaultAssignments: Record<number, string[]> = {};
      (data as ScannedReceipt).items.forEach((_, i) => {
        defaultAssignments[i] = [currentUser.uid];
      });
      setAssignments(defaultAssignments);
      setStep('review');
    } finally {
      setScanning(false);
    }
  }, [currentUser.uid, toast]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const toggleAssignee = (itemIdx: number, uid: string) => {
    setAssignments((prev) => {
      const current = prev[itemIdx] ?? [];
      const updated = current.includes(uid)
        ? current.filter((id) => id !== uid)
        : [...current, uid];
      const next = { ...prev, [itemIdx]: updated };

      // Broadcast to squad via server (fire-and-forget)
      fetch(`/api/events/${eventId}/snap-claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments: next }),
      }).catch(() => {});

      return next;
    });
  };

  const handleConfirm = async () => {
    if (!receipt) return;
    setSubmitting(true);

    try {
      const totals = calcAssignments(receipt.items, assignments, receipt.tax, receipt.tip);

      // The payer is the current user (they paid the bill)
      const totalCents = Math.round(receipt.total * 100);

      const splits = Object.entries(totals).map(([userId, amount]) => ({
        userId,
        userName: attendees.find((a) => a.userId === userId)?.userName ?? 'Unknown',
        amountOwed: userId === currentUser.uid ? 0 : Math.round(amount * 100),
      }));

      // Add payer's own split as settled
      if (!splits.find((s) => s.userId === currentUser.uid)) {
        splits.push({ userId: currentUser.uid, userName: currentUser.name, amountOwed: 0 });
      }

      const result = await addExpense(
        {
          eventId,
          payerId: currentUser.uid,
          payerName: currentUser.name,
          amount: totalCents,
          description: `${receipt.merchant} - Snap & Split`,
          category: 'FOOD',
        } as any,
        splits
      );

      if (result.success) {
        setStep('confirm');
        setLiveDebts(
          Object.fromEntries(
            Object.entries(totals).map(([uid, amt]) => [uid, Math.round(amt * 100)])
          )
        );
        onComplete?.();
      } else {
        toast({ title: 'Error', description: 'Failed to save expense', variant: 'destructive' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setStep('upload');
    setReceipt(null);
    setAssignments({});
    setLiveDebts({});
  };

  const totals = receipt
    ? calcAssignments(receipt.items, assignments, receipt.tax, receipt.tip)
    : {};

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 hover:border-[#00FF66]/50 text-zinc-300"
        >
          <Camera className="w-4 h-4 text-[#00FF66]" />
          Snap &amp; Split
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Receipt className="w-4 h-4 text-[#00FF66]" />
            Snap &amp; Split
          </DialogTitle>
        </DialogHeader>

        {/* STEP 1: Upload */}
        {step === 'upload' && (
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">
              Take a photo of the receipt. AI will parse the items and let you assign who owes what.
            </p>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-zinc-700 hover:border-[#00FF66]/50 rounded-2xl p-10 text-center cursor-pointer transition-colors"
            >
              {scanning ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-[#00FF66] animate-spin" />
                  <p className="text-sm text-zinc-400">Scanning receipt...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Camera className="w-10 h-10 text-zinc-600" />
                  <p className="text-sm text-zinc-400">
                    Drop receipt image or <span className="text-[#00FF66]">click to upload</span>
                  </p>
                  <p className="text-xs text-zinc-600">JPEG / PNG / WEBP / max 10MB</p>
                </div>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>
        )}

        {/* STEP 2: Review & Assign */}
        {step === 'review' && receipt && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{receipt.merchant}</p>
                <p className="text-xs text-zinc-500">Total: R {receipt.total.toFixed(2)}</p>
              </div>
              <Badge className="bg-[#00FF66]/10 text-[#00FF66] border-[#00FF66]/30 text-xs">
                {receipt.items.length} items
              </Badge>
            </div>

            {/* Items list */}
            <div className="space-y-2">
              {receipt.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 rounded-xl px-3 py-2.5"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-zinc-500">x{item.quantity}</p>
                    )}
                  </div>
                  <span className="text-sm font-mono text-zinc-300 flex-shrink-0">
                    R {(item.price * item.quantity).toFixed(2)}
                  </span>
                  <AssigneeDropdown
                    itemIdx={idx}
                    attendees={attendees}
                    assignments={assignments}
                    onToggle={toggleAssignee}
                  />
                </div>
              ))}
            </div>

            {/* Tax / Tip */}
            {(receipt.tax > 0 || receipt.tip > 0) && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 py-2 space-y-1">
                {receipt.tax > 0 && (
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>Tax</span>
                    <span>R {receipt.tax.toFixed(2)}</span>
                  </div>
                )}
                {receipt.tip > 0 && (
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>Tip</span>
                    <span>R {receipt.tip.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Per-person breakdown */}
            {Object.keys(totals).length > 0 && (
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
                  Breakdown
                </p>
                {Object.entries(totals).map(([uid, amt]) => {
                  const att = attendees.find((a) => a.userId === uid);
                  return (
                    <div key={uid} className="flex items-center justify-between text-sm">
                      <span className="text-zinc-300">
                        {att?.userName ?? uid === currentUser.uid ? currentUser.name : 'Unknown'}
                        {uid === currentUser.uid && (
                          <span className="text-xs text-zinc-600 ml-1">(you)</span>
                        )}
                      </span>
                      <span className="font-mono font-semibold text-[#00FF66]">
                        {fmtRand(Math.round(amt * 100))}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Unassigned warning */}
            {receipt.items.some((_, i) => (assignments[i] ?? []).length === 0) && (
              <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                Some items have no one assigned - they won&apos;t be tracked.
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={reset}
                className="border-zinc-700 text-zinc-400 hover:bg-zinc-800"
              >
                Re-scan
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={submitting || Object.keys(totals).length === 0}
                className="flex-1 bg-[#00FF66] text-zinc-950 hover:bg-[#00FF66]/90 font-semibold"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-1.5" />
                    Lock In &amp; Split
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Confirmed */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle2 className="w-12 h-12 text-[#00FF66]" />
              <p className="font-semibold text-lg">Split locked in!</p>
              <p className="text-sm text-zinc-400 text-center">
                The Kitty has been updated. Everyone can see what they owe.
              </p>
            </div>

            <div className="space-y-2">
              {Object.entries(liveDebts).map(([uid, cents]) => {
                const att = attendees.find((a) => a.userId === uid);
                const name = att?.userName ?? (uid === currentUser.uid ? currentUser.name : uid);
                return (
                  <div
                    key={uid}
                    className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm"
                  >
                    <span className="text-zinc-300">{name}</span>
                    <span
                      className={cn(
                        'font-mono font-semibold',
                        uid === currentUser.uid ? 'text-zinc-500' : 'text-[#00FF66]'
                      )}
                    >
                      {uid === currentUser.uid ? 'Paid' : fmtRand(cents)}
                    </span>
                  </div>
                );
              })}
            </div>

            <Button
              onClick={() => setOpen(false)}
              className="w-full bg-[#00FF66] text-zinc-950 hover:bg-[#00FF66]/90 font-semibold"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
