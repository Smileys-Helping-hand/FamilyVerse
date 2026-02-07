'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Flag,
  Play,
  DollarSign,
  Users,
  AlertTriangle,
  Eye,
  Bell,
  Gift,
  ArrowLeft,
  Gamepad2,
  QrCode,
} from 'lucide-react';
import Link from 'next/link';
import {
  submitLapTimeAction,
  startImposterRoundAction,
  settleBetsAction,
  getAllPartyUsersAction,
  getActiveImposterRoundAction,
  getPendingUsersAction,
  approveUserAction,
  rejectUserAction,
  addFundsAction,
  getRegisteredDriversAction,
  openBettingAction,
  startRaceAction,
  settleRaceAction,
  getActiveRaceStateAction,
} from '@/app/actions/party-logic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

interface PartyUser {
  id: string;
  name: string;
  pinCode: number;
  avatarUrl: string | null;
  walletBalance: number;
  status?: string;
  partyCode?: string | null;
}

interface ImposterRound {
  id: string;
  imposterName: string;
  secretWord: string;
  imposterHint: string;
  status: string;
}

export default function HostControlPage() {
  const [users, setUsers] = useState<PartyUser[]>([]);
  const [pendingUsers, setPendingUsers] = useState<PartyUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Racing State
  const [activeGameId, setActiveGameId] = useState<string>('');
  const [registeredDrivers, setRegisteredDrivers] = useState<any[]>([]);
  const [raceState, setRaceState] = useState<string>('PENDING');
  const [readyForBets, setReadyForBets] = useState(false);
  const [winnerId, setWinnerId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  
  // Imposter State
  const [activeRound, setActiveRound] = useState<ImposterRound | null>(null);
  const [startingRound, setStartingRound] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
    loadPendingUsers();
    loadActiveRound();
    loadRaceState();
    
    // Poll for updates
    const interval = setInterval(() => {
      loadPendingUsers();
      loadRaceState();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadUsers = async () => {
    const result = await getAllPartyUsersAction();
    if (result.success && result.users) {
      setUsers(result.users.filter((u: PartyUser) => u.status === 'approved') as PartyUser[]);
    }
    setLoading(false);
  };

  const loadPendingUsers = async () => {
    const result = await getPendingUsersAction();
    if (result.success && result.users) {
      setPendingUsers(result.users as PartyUser[]);
    }
  };

  const loadActiveRound = async () => {
    const result = await getActiveImposterRoundAction();
    if (result.success && result.round) {
      setActiveRound(result.round as any);
    }
  };

  const loadRaceState = async () => {
    // TODO: Get active game ID - for now use a fixed one
    const gameId = '595e9f85-839b-4ad7-ad71-e3629758363d'; // Your sim racing game ID
    setActiveGameId(gameId);

    const stateResult = await getActiveRaceStateAction();
    if (stateResult.success && stateResult.game?.raceState) {
      setRaceState(stateResult.game.raceState);
    }
    
    const result = await getRegisteredDriversAction(gameId);
    if (result.success && result.drivers) {
      setRegisteredDrivers(result.drivers);
      
      // Determine race state based on drivers
      const allReady = result.drivers.length >= 3 && result.drivers.every((d: any) => d.isReady);
      setReadyForBets(allReady);
    }
  };

  // ============================================
  // RACING CONTROLS
  // ============================================

  const handleOpenBetting = async () => {
    if (registeredDrivers.length < 3) {
      toast({
        title: '❌ Not Enough Drivers',
        description: 'Need at least 3 ready drivers',
        variant: 'destructive',
      });
      return;
    }

    const allReady = registeredDrivers.every((d: any) => d.isReady);
    if (!allReady) {
      toast({
        title: '❌ Drivers Not Ready',
        description: 'All drivers must mark themselves as ready',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    const result = await openBettingAction(activeGameId);

    if (result.success) {
      setRaceState('OPEN_FOR_BETS');
      toast({
        title: '🎰 BETTING IS OPEN!',
        description: 'Shout to guests: "60 SECONDS TO PLACE BETS!"',
      });
    } else {
      toast({
        title: '❌ Failed',
        description: result.error,
        variant: 'destructive',
      });
    }

    setSubmitting(false);
  };

  const handleStartRace = async () => {
    setSubmitting(true);
    const result = await startRaceAction(activeGameId);

    if (result.success) {
      setRaceState('LIVE');
      toast({
        title: '🏁 RACE STARTED!',
        description: 'Betting is now CLOSED!',
      });
    } else {
      toast({
        title: '❌ Failed',
        description: result.error,
        variant: 'destructive',
      });
    }

    setSubmitting(false);
  };

  const handleSettleRace = async () => {
    if (!winnerId) {
      toast({
        title: '❌ No Winner Selected',
        description: 'Select the winning driver',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    const result = await settleRaceAction(activeGameId, winnerId);

    if (result.success) {
      toast({
        title: '💰 Race Settled!',
        description: 'Winners have been paid 2.0x!',
      });
      setWinnerId('');
      setRaceState('FINISHED');
      await loadRaceState();
    } else {
      toast({
        title: '❌ Failed',
        description: result.error,
        variant: 'destructive',
      });
    }

    setSubmitting(false);
  };

  // ============================================
  // APPROVAL SYSTEM
  // ============================================

  const handleApprove = async (userId: string) => {
    const result = await approveUserAction(userId);
    if (result.success) {
      toast({
        title: '✅ User Approved',
        description: 'They can now access the party!',
      });
      await loadPendingUsers();
      await loadUsers();
    } else {
      toast({
        title: '❌ Failed',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (userId: string) => {
    const result = await rejectUserAction(userId);
    if (result.success) {
      toast({
        title: '❌ User Rejected',
        description: 'They have been denied entry',
      });
      await loadPendingUsers();
    } else {
      toast({
        title: '❌ Failed',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  // ============================================
  // IMPOSTER CONTROLS
  // ============================================

  const handleStartImposter = async () => {
    setStartingRound(true);

    const result = await startImposterRoundAction();

    if (result.success) {
      toast({
        title: '🎭 Round Started!',
        description: `${result.playerCount} players assigned`,
      });
      await loadActiveRound();
    } else {
      toast({
        title: '❌ Failed',
        description: result.error,
        variant: 'destructive',
      });
    }

    setStartingRound(false);
  };

  const handleForceReveal = () => {
    // TODO: Implement force reveal logic
    toast({
      title: '👁️ Imposter Revealed!',
      description: 'Game ended by host',
    });
  };

  const handleSendNudge = () => {
    // TODO: Trigger Pusher event to all clients
    toast({
      title: '🔔 Nudge Sent!',
      description: 'All players notified',
    });
  };

  // ============================================
  // WALLET CONTROLS
  // ============================================

  const handleEmergencyFunds = async (userId: string) => {
    const result = await addFundsAction(userId, 1000);
    if (result.success) {
      toast({
        title: '💸 Funds Added!',
        description: '+1000 coins granted',
      });
      await loadUsers();
    } else {
      toast({
        title: '❌ Failed',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Admin Navigation Tabs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">🎮 Admin Control Panel</h1>
              <p className="text-muted-foreground">Host God Mode & Management Tools</p>
            </div>
            <Link href="/party/tv">
              <Button variant="outline">
                📺 TV Mode
              </Button>
            </Link>
          </div>

          {/* Admin Navigation Tabs */}
          <div className="flex gap-2 flex-wrap">
            <Link href="/admin/control">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-xl">
                <Gamepad2 className="w-4 h-4 mr-2" />
                Party Control
              </Button>
            </Link>
            <Link href="/admin/qr-studio">
              <Button variant="outline" className="border-purple-500/50 text-purple-600 hover:bg-purple-500/10">
                <QrCode className="w-4 h-4 mr-2" />
                QR Studio
              </Button>
            </Link>
            <Link href="/admin/super-input-demo">
              <Button variant="outline" className="border-orange-500/50 text-orange-600 hover:bg-orange-500/10">
                ✨ Super Input Demo
              </Button>
            </Link>
            <Link href="/party/dashboard">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Party
              </Button>
            </Link>
          </div>
        </div>

        {/* Pending Approval Banner */}
        {pendingUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500 text-black p-4 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">
                  {pendingUsers.length} guest{pendingUsers.length > 1 ? 's' : ''} waiting for approval
                </span>
              </div>
              <Badge variant="secondary">{pendingUsers.length}</Badge>
            </div>
          </motion.div>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="approval" className="w-full">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1 md:grid md:w-full md:grid-cols-4">
            <TabsTrigger value="approval" className="relative flex-1 min-w-fit text-xs sm:text-sm">
              <Users className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Approvals</span>
              <span className="sm:hidden">Approve</span>
              {pendingUsers.length > 0 && (
                <Badge variant="destructive" className="ml-1 sm:ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {pendingUsers.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="racing" className="flex-1 min-w-fit text-xs sm:text-sm">
              <Flag className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Sim Racing</span>
              <span className="sm:hidden">Racing</span>
            </TabsTrigger>
            <TabsTrigger value="imposter" className="flex-1 min-w-fit text-xs sm:text-sm">
              <Gamepad2 className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Imposter Game</span>
              <span className="sm:hidden">Game</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex-1 min-w-fit text-xs sm:text-sm">
              <DollarSign className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Wallet Control</span>
              <span className="sm:hidden">Wallet</span>
            </TabsTrigger>
          </TabsList>

          {/* ============================================ */}
          {/* APPROVAL TAB */}
          {/* ============================================ */}
          <TabsContent value="approval" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Pending Guest Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingUsers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold">No pending requests</p>
                    <p className="text-sm mt-2">New guests will appear here for approval</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingUsers.map((user) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-4 border rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            {user.avatarUrl ? (
                              <img
                                src={user.avatarUrl}
                                alt={user.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-xl font-bold">{user.name.charAt(0)}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-lg">{user.name}</p>
                            <div className="flex gap-3 text-sm text-muted-foreground">
                              <span>PIN: {user.pinCode}</span>
                              {user.partyCode && (
                                <span className="text-primary">Code: {user.partyCode}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApprove(user.id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            ✓ Approve
                          </Button>
                          <Button
                            onClick={() => handleReject(user.id)}
                            size="sm"
                            variant="destructive"
                          >
                            ✕ Reject
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Approved Users List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-500" />
                  Approved Guests ({users.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="p-3 border rounded-lg text-center"
                    >
                      <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-2">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg">{user.name.charAt(0)}</span>
                        )}
                      </div>
                      <p className="font-semibold text-sm truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.walletBalance} 🪙</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============================================ */}
          {/* RACING CONTROL TAB */}
          {/* ============================================ */}
          <TabsContent value="racing" className="space-y-6">
            {/* Race State Banner */}
            <Card className="border-2 border-primary">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Badge variant="default" className="text-lg px-4 py-2 mb-2">
                    {raceState === 'PENDING' && (readyForBets
                      ? '✅ READY - Open betting now'
                      : '🟡 PENDING - Drivers join & mark ready')}
                    {raceState === 'OPEN_FOR_BETS' && '🟢 OPEN FOR BETS - Guests placing bets!'}
                    {raceState === 'LIVE' && '🔴 RACE LIVE - Betting locked'}
                    {raceState === 'FINISHED' && '🏁 FINISHED - Settle complete'}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    {registeredDrivers.length} drivers registered | {registeredDrivers.filter((d: any) => d.isReady).length} ready
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Registered Drivers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Registered Drivers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {registeredDrivers.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No drivers registered yet. Drivers register on their phones.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {registeredDrivers.map((driver: any) => (
                        <div
                          key={driver.id}
                          className={`
                            p-3 border rounded-lg flex items-center justify-between
                            ${driver.isReady ? 'bg-green-950/30 border-green-500/50' : 'bg-secondary/30'}
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                              {driver.userName[0]}
                            </div>
                            <span className="font-medium">{driver.userName}</span>
                          </div>
                          {driver.isReady ? (
                            <Badge variant="default" className="bg-green-600">✓ Ready</Badge>
                          ) : (
                            <Badge variant="outline">Waiting...</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Race Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flag className="w-5 h-5" />
                    Race Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-xl border border-border/60 p-3 bg-gradient-to-br from-emerald-950/20 via-slate-900/20 to-red-950/20">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Traffic Light</span>
                      <span>{raceState.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className={`h-3 rounded-full ${raceState === 'OPEN_FOR_BETS' ? 'bg-green-500' : 'bg-green-900/40'}`} />
                      <div className={`h-3 rounded-full ${raceState === 'PENDING' ? 'bg-yellow-500' : 'bg-yellow-900/40'}`} />
                      <div className={`h-3 rounded-full ${raceState === 'LIVE' ? 'bg-red-500' : 'bg-red-900/40'}`} />
                    </div>
                  </div>

                  {/* Step 1: Open Betting */}
                  <div>
                    <Label className="mb-2 block">Step 1: Open Betting Market</Label>
                    <Button
                      onClick={handleOpenBetting}
                      disabled={submitting || !readyForBets || !(raceState === 'PENDING' || raceState === 'FINISHED')}
                      className="w-full"
                      size="lg"
                      variant={raceState === 'OPEN_FOR_BETS' ? 'secondary' : 'default'}
                    >
                      {raceState === 'OPEN_FOR_BETS' ? '✅ Betting Open' : '🟢 OPEN BETTING'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Requires 3+ ready drivers
                    </p>
                  </div>

                  {/* Step 2: Start Race */}
                  <div>
                    <Label className="mb-2 block">Step 2: Start Race (Close Betting)</Label>
                    <Button
                      onClick={handleStartRace}
                      disabled={submitting || raceState !== 'OPEN_FOR_BETS'}
                      className="w-full"
                      size="lg"
                      variant={raceState === 'LIVE' ? 'secondary' : 'default'}
                    >
                      {raceState === 'LIVE' ? '✅ Race Live' : '🔴 START RACE (LOCK BETS)'}
                    </Button>
                  </div>

                  {/* Step 3: Select Winner & Settle */}
                  <div>
                    <Label className="mb-2 block">Step 3: Select Winner & Settle</Label>
                    <Select 
                      value={winnerId} 
                      onValueChange={setWinnerId}
                      disabled={raceState !== 'LIVE'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select winner" />
                      </SelectTrigger>
                      <SelectContent>
                        {registeredDrivers.map((driver: any) => (
                          <SelectItem key={driver.userId} value={driver.userId}>
                            🏆 {driver.userName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button
                      onClick={handleSettleRace}
                      disabled={submitting || !winnerId || raceState !== 'LIVE'}
                      className="w-full mt-2"
                      size="lg"
                      variant="default"
                    >
                      💰 Settle Race & Pay Winners (2.0x)
                    </Button>
                  </div>

                  <Separator />

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>📋 <strong>Flow:</strong></p>
                    <p>1. Drivers register & mark ready on phones</p>
                    <p>2. Host opens betting → Shout "60 SECONDS!"</p>
                    <p>3. Start race → Betting closes automatically</p>
                    <p>4. Select winner → Winners get 2x payout</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ============================================ */}
          {/* IMPOSTER CONTROL TAB */}
          {/* ============================================ */}
          <TabsContent value="imposter" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Game Control */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Game Control
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={handleStartImposter}
                    disabled={startingRound}
                    className="w-full"
                    size="lg"
                  >
                    {startingRound ? 'Starting...' : '🎭 Start New Imposter Round'}
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSendNudge}
                      variant="secondary"
                      className="flex-1"
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Send Nudge
                    </Button>
                    <Button
                      onClick={handleForceReveal}
                      variant="destructive"
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Force Reveal
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Active Round Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    Current Round (EYES ONLY)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeRound ? (
                    <div className="space-y-3">
                      <div className="bg-red-900/20 border border-red-500 p-3 rounded-lg">
                        <p className="text-sm text-gray-400">Imposter:</p>
                        <p className="text-2xl font-bold text-red-400">
                          {activeRound.imposterName}
                        </p>
                      </div>
                      <div className="bg-green-900/20 border border-green-500 p-3 rounded-lg">
                        <p className="text-sm text-gray-400">Secret Word:</p>
                        <p className="text-xl font-bold text-green-400">
                          {activeRound.secretWord}
                        </p>
                      </div>
                      <div className="bg-yellow-900/20 border border-yellow-500 p-3 rounded-lg">
                        <p className="text-sm text-gray-400">Imposter Hint:</p>
                        <p className="text-xl font-bold text-yellow-400">
                          {activeRound.imposterHint}
                        </p>
                      </div>
                      <Badge>{activeRound.status}</Badge>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No active round. Start a new game!
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ============================================ */}
          {/* WALLET CONTROL TAB */}
          {/* ============================================ */}
          <TabsContent value="wallet" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Emergency Funds
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              className="w-full h-full rounded-full"
                            />
                          ) : (
                            <span>{user.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            PIN: {user.pinCode}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-lg">
                          {user.walletBalance} 🪙
                        </Badge>
                        <Button
                          onClick={() => handleEmergencyFunds(user.id)}
                          size="sm"
                          variant="secondary"
                        >
                          +1000
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
