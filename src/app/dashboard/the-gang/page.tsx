'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getFamilyMembersAction } from '@/app/actions/family';
import { Users, UserCheck, Clock, Loader2, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Member {
  id: number;
  userId: string;
  name: string;
  familyId: string;
  role?: string | null;
  createdAt: Date;
}

function MemberCard({ member }: { member: Member }) {
  const initials = member.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors">
      <div className="shrink-0 h-10 w-10 rounded-full bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center justify-center">
        <span className="text-sm font-bold text-[#00FF66]">{initials}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-zinc-100 font-semibold truncate">{member.name}</p>
        <p className="text-xs text-zinc-500 capitalize">{member.role ?? 'member'}</p>
      </div>
      {member.role === 'admin' && (
        <span className="shrink-0 px-2 py-0.5 rounded-full bg-[#00FF66]/10 border border-[#00FF66]/30 text-[#00FF66] text-xs font-semibold">
          Host
        </span>
      )}
    </div>
  );
}

export default function TheGangPage() {
  const { userProfile, loading } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.familyId) return;
    getFamilyMembersAction(userProfile.familyId)
      .then((rows) => setMembers(rows as Member[]))
      .finally(() => setMembersLoading(false));
  }, [userProfile?.familyId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#00FF66]" />
      </div>
    );
  }

  const joinCode = (userProfile as { joinCode?: string })?.joinCode;

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-6 px-2 sm:px-0">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-100">The Gang</h1>
        <p className="text-zinc-500 text-base">Your squad roster.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
          <Users className="h-5 w-5 text-[#00FF66]" />
          <div className="text-2xl font-extrabold text-zinc-100">
            {membersLoading ? '—' : members.length}
          </div>
          <div className="text-xs text-zinc-500">Total Members</div>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
          <UserCheck className="h-5 w-5 text-[#00FF66]" />
          <div className="text-2xl font-extrabold text-zinc-100">
            {membersLoading ? '—' : members.filter((m) => m.role === 'admin').length}
          </div>
          <div className="text-xs text-zinc-500">Admins</div>
        </div>
      </div>

      {/* Members list */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Roster</h2>
        {membersLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[60px] rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
          ))
        ) : members.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-700 p-8 text-center space-y-2">
            <Users className="h-10 w-10 text-zinc-600 mx-auto" />
            <p className="text-zinc-400 font-medium">No gang members yet</p>
            <p className="text-zinc-600 text-sm">Invite people using your join code below.</p>
          </div>
        ) : (
          members.map((m) => <MemberCard key={m.id} member={m} />)
        )}
      </div>

      {/* Invite section */}
      <div className="rounded-2xl border border-zinc-700/60 bg-zinc-900/60 backdrop-blur-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-[#00FF66]" />
          <p className="text-sm font-semibold text-zinc-200">Grow the Gang</p>
        </div>
        <p className="text-xs text-zinc-500">
          Share your join code or invite link so crew members can join your squad.
        </p>
        {joinCode && (
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2 font-mono text-[#00FF66] text-sm tracking-widest">
              {joinCode}
            </div>
          </div>
        )}
        <Link
          href="/welcome"
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
            'bg-[#00FF66] text-zinc-950 shadow-[0_0_16px_rgba(0,255,102,0.3)] hover:shadow-[0_0_24px_rgba(0,255,102,0.5)]',
          )}
        >
          Invite to Gang
        </Link>
      </div>
    </div>
  );
}
