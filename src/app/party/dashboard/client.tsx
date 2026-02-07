'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Coins,
  Trophy,
  Gamepad2,
  TrendingUp,
  ArrowLeft,
  Sparkles,
  Sword,
  Flag,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { SimLeaderboard } from '@/components/party/SimLeaderboard';
import { BettingSlip } from '@/components/party/BettingSlip';
import { RaceStartSequence } from '@/components/party/RaceStartSequence';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import {
  getWalletOverviewAction,
  startImposterRoundAction,
  forceEndImposterGameAction,
  forceEndSimRaceAction,
  logoutAction,
} from '@/app/actions/party-logic';

interface PartyUser {
  id: string;
  name: string;
  pinCode: number;
  avatarUrl: string | null;
  walletBalance: number;
  status?: string;
  createdAt: Date;
}

export default function PartyDashboardClient({ user }: { user: PartyUser }) {
  const { user: firebaseUser } = useAuth();
  const isAdmin = firebaseUser?.email === 'mraaziqp@gmail.com';
  const router = useRouter();
  const [walletOpen, setWalletOpen] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletSummary, setWalletSummary] = useState<any>(null);
  const [startingImposter, setStartingImposter] = useState(false);
  const [imposterNotes, setImposterNotes] = useState('');
  const [flagInput, setFlagInput] = useState('');
  const [flaggedPlayers, setFlaggedPlayers] = useState<string[]>([]);
  const [imposterChecklist, setImposterChecklist] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const intelChecklistItems = [
    'Avoided eye contact',
    'Over-explained a detail',
    'Mirrored last speaker',
    'Changed their story',
    'Too specific too fast',
  ];

  const intelPrompts = [
    'Hesitated on the word',
    'Asked for repeats',
    'Deflected with jokes',
    'Followed the crowd',
  ];

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const notesKey = `imposter-notes:${user.id}`;
    const flagsKey = `imposter-flags:${user.id}`;
    const checklistKey = `imposter-checklist:${user.id}`;
    const savedNotes = localStorage.getItem(notesKey);
    const savedFlags = localStorage.getItem(flagsKey);
    const savedChecklist = localStorage.getItem(checklistKey);

    if (savedNotes) {
      setImposterNotes(savedNotes);
    }

    if (savedFlags) {
      try {
        const parsed = JSON.parse(savedFlags);
        if (Array.isArray(parsed)) {
          setFlaggedPlayers(parsed);
        }
      } catch {
        setFlaggedPlayers([]);
      }
    }

    if (savedChecklist) {
      try {
        const parsed = JSON.parse(savedChecklist);
        if (parsed && typeof parsed === 'object') {
          setImposterChecklist(parsed);
        }
      } catch {
        setImposterChecklist({});
      }
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const notesKey = `imposter-notes:${user.id}`;
    const flagsKey = `imposter-flags:${user.id}`;
    const checklistKey = `imposter-checklist:${user.id}`;
    localStorage.setItem(notesKey, imposterNotes);
    localStorage.setItem(flagsKey, JSON.stringify(flaggedPlayers));
    localStorage.setItem(checklistKey, JSON.stringify(imposterChecklist));
  }, [user?.id, imposterNotes, flaggedPlayers, imposterChecklist]);

  const handleAddFlag = () => {
    const trimmed = flagInput.trim();
    if (!trimmed) {
      return;
    }

    setFlaggedPlayers((prev) => {
      if (prev.includes(trimmed)) {
        return prev;
      }
      return [...prev, trimmed];
    });
    setFlagInput('');
  };

  const handleAddPrompt = (prompt: string) => {
    const trimmed = imposterNotes.trim();
    const next = trimmed.length > 0 ? `${trimmed}\n- ${prompt}` : `- ${prompt}`;
    setImposterNotes(next);
  };

  const checkedCount = intelChecklistItems.filter(
    (item) => imposterChecklist[item]
  ).length;

  useEffect(() => {
    if (!walletOpen) {
      return;
    }

    const loadWallet = async () => {
      setWalletLoading(true);
      const result = await getWalletOverviewAction();
      if (result.success) {
        setWalletSummary(result);
      }
      setWalletLoading(false);
    };

    loadWallet();
  }, [walletOpen]);

  const handleStartImposter = async () => {
    setStartingImposter(true);
    const result = await startImposterRoundAction();
    if (result.success) {
      toast({
        title: '🎭 Round Started!',
        description: `${result.playerCount} players assigned`,
      });
    } else {
      toast({
        title: '❌ Failed',
        description: result.error,
        variant: 'destructive',
      });
    }
    setStartingImposter(false);
  };

  const handleForceEndImposter = async () => {
    if (!confirm('Force end the imposter game for all players?')) {
      return;
    }

    const result = await forceEndImposterGameAction();
    if (result.success) {
      toast({
        title: '🛑 Imposter ended',
        description: 'Imposter round ended for everyone',
      });
    } else {
      toast({
        title: '❌ Failed',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleForceEndRace = async () => {
    if (!confirm('Force end the sim race for all players?')) {
      return;
    }

    const result = await forceEndSimRaceAction();
    if (result.success) {
      toast({
        title: '🛑 Race ended',
        description: 'Sim race ended for everyone',
      });
    } else {
      toast({
        title: '❌ Failed',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  // Check if user is pending approval
  if (user.status === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">⏳ Awaiting Approval</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-lg">Hi {user.name}! 👋</p>
              <p className="text-muted-foreground">
                The host needs to approve your entry before you can join the party.
              </p>
              <div className="bg-muted p-4 rounded-lg mt-4">
                <p className="text-sm text-muted-foreground mb-1">Your PIN Code:</p>
                <p className="text-3xl font-mono font-bold">{user.pinCode}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Use this to log back in later
                </p>
              </div>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <p>This page will refresh automatically once you're approved.</p>
            </div>
            <Link href="/party/join" className="block">
              <Button variant="outline" className="w-full">
                Back to Join
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user is rejected
  if (user.status === 'rejected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">❌ Entry Denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-lg">Sorry {user.name},</p>
              <p className="text-muted-foreground">
                The host has denied your entry to this party.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={async () => {
                await logoutAction();
                router.push('/party/join');
              }}
            >
              Try Another Party
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <RaceStartSequence />
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 shadow-lg relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            {isAdmin && (
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  🚨 Admin Control
                </Button>
              </Link>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/party/profile">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center cursor-pointer hover:ring-4 hover:ring-white/50 transition-all group relative">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full" />
                  ) : (
                    <User className="w-8 h-8" />
                  )}
                  <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-xs">Edit</span>
                  </div>
                </div>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <Link href="/party/profile" className="text-white/80 hover:text-white hover:underline text-sm">
                  ✏️ Edit Profile
                </Link>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                <Coins className="w-5 h-5" />
                <span className="text-3xl font-bold">{user.walletBalance}</span>
              </div>
              <p className="text-white/80 text-sm">Party Coins</p>
            </div>
          </div>
        </div>

        <div className="absolute right-6 top-6">
          <Sheet open={walletOpen} onOpenChange={setWalletOpen}>
            <SheetTrigger asChild>
              <Button className="rounded-full bg-white/15 text-white border border-white/25 hover:bg-white/25">
                💰 {user.walletBalance}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Bank Statement</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-3">Recent Activity</h3>
                  {walletLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
                  {!walletLoading && walletSummary?.history?.length === 0 && (
                    <p className="text-sm text-muted-foreground">No activity yet.</p>
                  )}
                  <div className="space-y-2">
                    {walletSummary?.history?.map((event: any) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                      >
                        <div>
                          <p className="text-sm font-medium">{event.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {event.type === 'BET' ? 'Betting' : 'Task'}
                          </p>
                        </div>
                        <Badge variant={event.amount >= 0 ? 'default' : 'destructive'}>
                          {event.amount >= 0 ? `+${event.amount}` : event.amount}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3">Top 3 Richest Players</h3>
                  <div className="space-y-2">
                    {walletSummary?.leaderboard?.map((entry: any, index: number) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            {entry.avatarUrl ? (
                              <img
                                src={entry.avatarUrl}
                                alt={entry.name}
                                className="w-full h-full rounded-full"
                              />
                            ) : (
                              <span className="text-xs font-bold">{entry.name.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">#{index + 1} {entry.name}</p>
                            <p className="text-xs text-muted-foreground">{entry.walletBalance} coins</p>
                          </div>
                        </div>
                        <Badge variant="secondary">💰</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <Tabs defaultValue="racing" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="racing">
              <Trophy className="w-4 h-4 mr-2" />
              Racing
            </TabsTrigger>
            <TabsTrigger value="imposter">
              <Gamepad2 className="w-4 h-4 mr-2" />
              Imposter
            </TabsTrigger>
            <TabsTrigger value="betting">
              <TrendingUp className="w-4 h-4 mr-2" />
              Betting
            </TabsTrigger>
          </TabsList>

          <TabsContent value="racing" className="space-y-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <SimLeaderboard />
            </motion.div>
            {isAdmin && (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle>Host Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleForceEndRace}
                    variant="destructive"
                    className="w-full"
                  >
                    🛑 Force End Race
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="imposter" className="space-y-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <Link href="/party/spy" className="block">
                <Card className="border-2 border-blue-500/40 bg-gradient-to-br from-blue-950/70 to-slate-950 hover:border-blue-400 transition">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-white">
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        The Chameleon
                      </span>
                      <Badge variant="secondary">🕵️‍♂️</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-white/70">
                    A social deduction showdown. Get your role and blend in.
                  </CardContent>
                </Card>
              </Link>

              <Link href="/party/tasks" className="block">
                <Card className="border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-950/70 to-slate-950 hover:border-emerald-400 transition">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-white">
                      <span className="flex items-center gap-2">
                        <Sword className="w-5 h-5" />
                        Among Us IRL
                      </span>
                      <Badge variant="secondary">🔪</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-white/70">
                    Track tasks, report bodies, and keep the crew alive.
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="border-2 border-fuchsia-500/40 bg-gradient-to-br from-fuchsia-950/60 to-slate-950">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-white">
                    <span className="flex items-center gap-2">
                      <Gamepad2 className="w-5 h-5" />
                      Imposter Game Dashboard
                    </span>
                    <Badge variant="secondary">🎭 Live</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-white/80">
                  <p>
                    Track the live round, check your role, and jump into the active session.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Flags: {flaggedPlayers.length}</Badge>
                    <Badge variant="secondary">Notes: {imposterNotes.trim() ? 'Active' : 'Empty'}</Badge>
                    <Badge variant="secondary">
                      Checklist: {checkedCount}/{intelChecklistItems.length}
                    </Badge>
                  </div>
                  <Link href="/party/spy-game/active">
                    <Button className="w-full">Open Imposter Dashboard</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Notes + Suspect Flags
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Private notes for this round</p>
                    <textarea
                      value={imposterNotes}
                      onChange={(event) => setImposterNotes(event.target.value)}
                      placeholder="Write your suspicions, alibis, or observations..."
                      className="min-h-[140px] w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Flag a suspect</p>
                    <div className="flex gap-2">
                      <input
                        value={flagInput}
                        onChange={(event) => setFlagInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            handleAddFlag();
                          }
                        }}
                        placeholder="Add a name"
                        className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                      />
                      <Button onClick={handleAddFlag} className="shrink-0">
                        <Flag className="mr-2 h-4 w-4" />
                        Flag
                      </Button>
                    </div>
                  </div>

                  {flaggedPlayers.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Flagged suspects</p>
                      <div className="flex flex-wrap gap-2">
                        {flaggedPlayers.map((player) => (
                          <span
                            key={player}
                            className="flex items-center gap-2 rounded-full bg-fuchsia-500/10 px-3 py-1 text-xs"
                          >
                            {player}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-5 px-2 text-xs"
                              onClick={() =>
                                setFlaggedPlayers((prev) => prev.filter((name) => name !== player))
                              }
                            >
                              Remove
                            </Button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No suspects flagged yet. Add a name to track who feels suspicious.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border border-fuchsia-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Intel Toolkit
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Quick prompts</p>
                    <div className="flex flex-wrap gap-2">
                      {intelPrompts.map((prompt) => (
                        <Button
                          key={prompt}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddPrompt(prompt)}
                        >
                          {prompt}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Behavior checklist</p>
                    <div className="space-y-2">
                      {intelChecklistItems.map((item) => (
                        <label key={item} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={Boolean(imposterChecklist[item])}
                            onChange={() =>
                              setImposterChecklist((prev) => ({
                                ...prev,
                                [item]: !prev[item],
                              }))
                            }
                            className="h-4 w-4 rounded border-muted"
                          />
                          <span>{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {isAdmin && (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle>Host Quick Start</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button
                      onClick={handleStartImposter}
                      disabled={startingImposter}
                      className="w-full"
                    >
                      {startingImposter ? 'Starting...' : '🎭 Start Imposter Round'}
                    </Button>
                    <Button
                      onClick={handleForceEndImposter}
                      variant="destructive"
                      className="w-full"
                    >
                      🛑 Force End Imposter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="betting" className="space-y-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <BettingSlip currentUser={user} />
            </motion.div>
            {isAdmin && (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle>Host Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleForceEndRace}
                    variant="destructive"
                    className="w-full"
                  >
                    🛑 Force End Race
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
