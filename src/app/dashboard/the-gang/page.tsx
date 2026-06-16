'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getFamilyMembersAction } from '@/app/actions/family';
import { createGangInvitationAction } from '@/app/actions/gang-invitations';
import { Users, UserCheck, Clock, Loader2, UserPlus, Copy, Send, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [inviteLink, setInviteLink] = useState<string>('');
  const [whatsappLink, setWhatsappLink] = useState<string>('');
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!userProfile?.familyId) return;
    getFamilyMembersAction(userProfile.familyId)
      .then((rows) => setMembers(rows as Member[]))
      .finally(() => setMembersLoading(false));
  }, [userProfile?.familyId]);

  const handleCreateInvite = async () => {
    if (!userProfile?.familyId) {
      toast({
        title: 'Error',
        description: 'No family found. Please set up your family first.',
        variant: 'destructive',
      });
      return;
    }

    setCreatingInvite(true);
    const result = await createGangInvitationAction(
      userProfile.familyId,
      userProfile.uid || 'unknown',
      userProfile.name || 'Friend'
    );

    if (result.success) {
      setInviteLink(result.inviteLink || '');
      setWhatsappLink(result.whatsappLink || '');
      toast({
        title: 'Invitation Created! 🎉',
        description: 'Share the link with your friends',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
    setCreatingInvite(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: 'Copied! 📋',
      description: 'Invite link copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

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
      <div className="rounded-3xl border-2 border-primary bg-gradient-to-br from-primary/10 to-accent/5 backdrop-blur-xl p-8 space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <UserPlus className="h-6 w-6 text-primary" />
          <p className="text-lg font-extrabold text-foreground">Grow the Gang 👯</p>
        </div>
        <p className="text-sm text-foreground/70">
          Create a magical invite link and share it on WhatsApp, email, or anywhere else!
        </p>

        {!inviteLink ? (
          <button
            onClick={handleCreateInvite}
            disabled={creatingInvite}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-extrabold text-lg hover:shadow-xl transition-all shadow-lg disabled:opacity-50"
          >
            {creatingInvite ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating Invite...
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                Create Invite Link
              </>
            )}
          </button>
        ) : (
          <div className="space-y-3">
            {/* Invite link display */}
            <div className="rounded-xl bg-white/80 p-4 space-y-3">
              <p className="text-xs font-semibold text-foreground/60 uppercase">Invite Link</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-100 border-2 border-primary/30 font-mono text-sm text-foreground"
                />
                <button
                  onClick={() => copyToClipboard(inviteLink)}
                  className={cn(
                    'p-2 rounded-lg transition-all',
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-primary text-white hover:bg-primary/90'
                  )}
                >
                  {copied ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* WhatsApp button */}
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-extrabold text-lg transition-all shadow-lg"
              >
                <Send className="h-5 w-5" />
                Share on WhatsApp
              </a>
            )}

            {/* Create new button */}
            <button
              onClick={() => {
                setInviteLink('');
                setWhatsappLink('');
              }}
              className="w-full px-4 py-2 rounded-xl bg-slate-200 text-foreground hover:bg-slate-300 font-semibold transition-all"
            >
              Create Another Invite
            </button>
          </div>
        )}

        {/* Info box */}
        <div className="rounded-lg bg-blue-50/50 border border-blue-200 p-3 text-xs text-blue-900">
          <p>💡 <strong>Pro tip:</strong> Each invite works for 30 days. Anyone clicking the link can join!</p>
        </div>
      </div>
    </div>
  );
}
