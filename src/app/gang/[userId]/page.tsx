import { db } from '@/lib/db';
import {
  users,
  eventAttendees,
  eventSupplies,
  expenses,
} from '@/lib/db/schema';
import { eq, and, desc, count, sql } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import {
  Shield,
  MapPin,
  Package,
  TrendingUp,
  Zap,
  Trophy,
  Lock,
} from 'lucide-react';

// ─────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────

export async function generateMetadata({ params }: { params: { userId: string } }) {
  const [profile] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.uid, params.userId));
  return {
    title: profile?.name ? `${profile.name} — Squad Ledger | Gang Gear` : 'Squad Ledger | Gang Gear',
  };
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default async function SquadLedgerPage({
  params,
}: {
  params: { userId: string };
}) {
  const { userId } = params;

  // ── User profile ──────────────────────────
  const [profile] = await db.select().from(users).where(eq(users.uid, userId));
  if (!profile) notFound();

  // ── Lifetime stats ────────────────────────
  const [{ outings }] = await db
    .select({ outings: count() })
    .from(eventAttendees)
    .where(and(eq(eventAttendees.userId, userId), eq(eventAttendees.rsvpStatus, 'GOING')));

  const [{ gearSupplied }] = await db
    .select({ gearSupplied: count() })
    .from(eventSupplies)
    .where(
      and(
        eq(eventSupplies.assignedToUserId, userId),
        sql`${eventSupplies.status} != 'PENDING'`
      )
    );

  // ── Transaction history (expenses paid by user) ──
  const transactions = await db
    .select({
      id: expenses.id,
      merchant: expenses.merchant,
      description: expenses.description,
      totalAmount: expenses.totalAmount,
      createdAt: expenses.createdAt,
    })
    .from(expenses)
    .where(eq(expenses.payerId, userId))
    .orderBy(desc(expenses.createdAt))
    .limit(100);

  const totalSpentCents = transactions.reduce((sum, t) => sum + (t.totalAmount ?? 0), 0);

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────

  const initials = (profile.name || profile.email).slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden">
      {/* Tactical grid background */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,255,102,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,102,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      {/* Radial glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#00FF66]/5 blur-[80px] rounded-full" />

      <div className="relative max-w-xl mx-auto px-4 py-10 space-y-6">
        {/* ── Player Card ─────────────────────────── */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
          {/* Neon accent stripe */}
          <div className="h-[3px] bg-gradient-to-r from-[#00FF66] via-[#00FF66]/40 to-transparent" />

          <div className="p-6">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xl font-bold text-[#00FF66] tracking-tight">
                {initials}
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold tracking-tight truncate">
                  {profile.name || 'Anonymous Operator'}
                </h1>
                <div className="flex items-center gap-1.5 mt-1">
                  <Zap className="w-3.5 h-3.5 text-[#00FF66]" />
                  <span className="text-xs text-zinc-500 uppercase tracking-widest font-medium">
                    {profile.familyName ? `${profile.familyName} Squad` : 'Gang Gear Member'}
                  </span>
                </div>
                {profile.role === 'admin' && (
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1 text-xs bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/20 rounded-full px-2 py-0.5">
                      <Shield className="w-3 h-3" /> Admin
                    </span>
                  </div>
                )}
              </div>

              <Shield className="w-7 h-7 text-[#00FF66]/20 shrink-0 mt-0.5" />
            </div>

            {/* Stat tiles */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="bg-zinc-800/60 rounded-xl p-4 text-center border border-zinc-800">
                <MapPin className="w-5 h-5 text-[#00FF66] mx-auto mb-1.5" />
                <p className="text-2xl font-bold tabular-nums">{outings}</p>
                <p className="text-xs text-zinc-500 mt-0.5">Outings</p>
              </div>
              <div className="bg-zinc-800/60 rounded-xl p-4 text-center border border-zinc-800">
                <Package className="w-5 h-5 text-blue-400 mx-auto mb-1.5" />
                <p className="text-2xl font-bold tabular-nums">{gearSupplied}</p>
                <p className="text-xs text-zinc-500 mt-0.5">Gear Supplied</p>
              </div>
              <div className="bg-zinc-800/60 rounded-xl p-4 text-center border border-zinc-800">
                <TrendingUp className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
                <p className="text-2xl font-bold tabular-nums">
                  R{Math.round(totalSpentCents / 100)}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">Total Spent</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Financial Ledger ──────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <Trophy className="w-4 h-4 text-[#00FF66]" />
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Financial Ledger
            </h2>
            <div className="ml-auto flex items-center gap-1 text-xs text-zinc-600">
              <Lock className="w-3 h-3" />
              Immutable audit trail
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-10 text-center">
              <TrendingUp className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-sm text-zinc-600">No expenses logged yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800/60 rounded-xl px-4 py-3 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {tx.merchant || tx.description || 'Expense'}
                    </p>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <span className="text-sm font-mono font-semibold text-[#00FF66] shrink-0">
                    R{((tx.totalAmount ?? 0) / 100).toFixed(2)}
                  </span>
                </div>
              ))}

              {/* Running total footer */}
              <div className="flex items-center justify-between px-4 py-3 bg-zinc-800/40 border border-zinc-800 rounded-xl mt-3">
                <span className="text-xs text-zinc-500 uppercase tracking-widest font-medium">
                  Lifetime Total
                </span>
                <span className="text-base font-mono font-bold text-[#00FF66]">
                  R{(totalSpentCents / 100).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
