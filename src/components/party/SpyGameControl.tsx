'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Skull, 
  Clock, 
  Users, 
  AlertCircle, 
  Play, 
  Vote,
  Eye,
  Zap
} from 'lucide-react';
import {
  startImposterRoundAction,
  getAdminRoundStatusAction,
  triggerTenMinuteWarningAction,
  forceVotingPhaseAction,
  forceEndImposterGameAction,
} from '@/app/actions/party-logic';

export function SpyGameControl() {
  const [roundStatus, setRoundStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [duration, setDuration] = useState(45);
  const [selectedImposterId, setSelectedImposterId] = useState('RANDOM');
  const { toast } = useToast();

  // Fetch round status
  const fetchStatus = async () => {
    const result = await getAdminRoundStatusAction();
    if (result.success && result.data) {
      setRoundStatus(result.data);
      
      // Check if warning should be triggered
      if (result.data.round && !result.data.round.warningSent) {
        const timeRemaining = result.data.round.timeRemainingMinutes;
        if (timeRemaining <= 10 && timeRemaining > 0) {
          // Auto-trigger warning
          handleTriggerWarning();
        }
      }
      
      // Check if voting should be triggered
      if (result.data.round && result.data.round.timeRemainingMs <= 0 && result.data.round.status === 'ACTIVE') {
        // Auto-trigger voting
        handleForceVoting();
      }
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Auto-mode: Start new round when previous one ends
  useEffect(() => {
    if (autoMode && (!roundStatus || roundStatus.round.status === 'REVEALED')) {
      // Auto-start new round after 2 minutes
      const timeout = setTimeout(() => {
        handleStartRound();
      }, 2 * 60 * 1000);
      return () => clearTimeout(timeout);
    }
  }, [autoMode, roundStatus]);

  const handleStartRound = async () => {
    setLoading(true);
    const imposterId = selectedImposterId === 'RANDOM' ? undefined : selectedImposterId;
    const result = await startImposterRoundAction(duration, imposterId);
    
    if (result.success) {
      toast({
        title: '🎮 Round Started!',
        description: `Spy Game active for ${duration} minutes`,
      });
      await fetchStatus();
    } else {
      toast({
        title: '❌ Error',
        description: result.error,
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  const handleTriggerWarning = async () => {
    if (!roundStatus?.round?.id) return;
    
    const result = await triggerTenMinuteWarningAction(roundStatus.round.id);
    
    if (result.success) {
      toast({
        title: '⚠️ Warning Triggered!',
        description: '10-minute alert sent to all players',
      });
      await fetchStatus();
    } else {
      toast({
        title: '❌ Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleForceVoting = async () => {
    if (!roundStatus?.round?.id) return;
    
    const result = await forceVotingPhaseAction(roundStatus.round.id);
    
    if (result.success) {
      toast({
        title: '🚨 Emergency Meeting!',
        description: 'Voting phase activated',
      });
      await fetchStatus();
    } else {
      toast({
        title: '❌ Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleForceEnd = async () => {
    const result = await forceEndImposterGameAction();
    if (result.success) {
      toast({
        title: '🛑 Game Ended',
        description: 'Imposter round ended for all players',
      });
      await fetchStatus();
    } else {
      toast({
        title: '❌ Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimeProgress = () => {
    if (!roundStatus?.round) return 0;
    const { timeRemainingMs, durationMinutes } = roundStatus.round;
    const totalMs = durationMinutes * 60 * 1000;
    const elapsed = totalMs - timeRemainingMs;
    return (elapsed / totalMs) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Control Panel Header */}
      <Card className="border-2 border-purple-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Skull className="h-6 w-6 text-red-500" />
                Spy Game Director
              </CardTitle>
              <CardDescription>
                Control the imposter game from here
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="auto-mode"
                  checked={autoMode}
                  onCheckedChange={setAutoMode}
                />
                <Label htmlFor="auto-mode" className="text-sm font-medium">
                  Auto-Mode
                </Label>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Round Status */}
      {roundStatus?.round ? (
        <Card className="border-2 border-orange-500/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Round {roundStatus.round.round} - {roundStatus.round.status}
              </span>
              <Badge
                variant={
                  roundStatus.round.status === 'ACTIVE'
                    ? 'default'
                    : roundStatus.round.status === 'WARNING'
                    ? 'destructive'
                    : 'secondary'
                }
              >
                {roundStatus.round.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Timer Display */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Time Remaining</span>
                <span className="text-2xl font-bold text-orange-600">
                  {formatTime(roundStatus.round.timeRemainingMs)}
                </span>
              </div>
              <Progress value={getTimeProgress()} className="h-3" />
              <p className="text-xs text-muted-foreground text-center">
                {roundStatus.round.timeRemainingMinutes} minutes left of {roundStatus.round.durationMinutes} minute round
              </p>
            </div>

            {/* Secret Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-100 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Civilian Word</p>
                <p className="font-bold text-green-600">{roundStatus.round.secretWord}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Imposter Hint</p>
                <p className="font-bold text-red-600">{roundStatus.round.imposterHint}</p>
              </div>
            </div>

            {/* Manual Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                onClick={handleTriggerWarning}
                disabled={roundStatus.round.warningSent || roundStatus.round.status !== 'ACTIVE'}
                variant="outline"
                className="border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                10-Min Warning
              </Button>
              <Button
                onClick={handleForceVoting}
                disabled={roundStatus.round.status === 'VOTING'}
                variant="destructive"
              >
                <Vote className="h-4 w-4 mr-2" />
                Force Voting
              </Button>
              <Button
                onClick={handleForceEnd}
                variant="destructive"
                className="bg-red-700 hover:bg-red-800"
              >
                <Skull className="h-4 w-4 mr-2" />
                Force End Game
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* No Active Round */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              No Active Round
            </CardTitle>
            <CardDescription>
              Start a new spy game round
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {roundStatus?.players && (
              <div className="space-y-2">
                <Label>Lobby Players</Label>
                <p className="text-sm text-muted-foreground">
                  {roundStatus.players.length} players ready. Need at least 3 to start.
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="duration">Round Duration (minutes)</Label>
              <div className="flex gap-2">
                {[15, 30, 45, 60].map((mins) => (
                  <Button
                    key={mins}
                    variant={duration === mins ? 'default' : 'outline'}
                    onClick={() => setDuration(mins)}
                    size="sm"
                  >
                    {mins}m
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Choose Imposter</Label>
              <Select value={selectedImposterId} onValueChange={setSelectedImposterId}>
                <SelectTrigger>
                  <SelectValue placeholder="Random" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RANDOM">Random</SelectItem>
                  {roundStatus?.players?.map((player: any) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleStartRound}
              disabled={loading || (roundStatus?.players?.length ?? 0) < 3}
              className="w-full"
              size="lg"
            >
              <Play className="h-5 w-5 mr-2" />
              {loading ? 'Starting...' : 'Start New Round'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Player List with Imposter Highlighted */}
      {roundStatus?.players && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Players ({roundStatus.players.length})
            </CardTitle>
            <CardDescription>
              The imposter is marked in red
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {roundStatus.players.map((player: any) => {
                const isImposter = roundStatus.imposter?.id === player.id;
                return (
                  <div
                    key={player.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
                      isImposter
                        ? 'border-red-500 bg-red-50'
                        : 'border-transparent bg-slate-50'
                    }`}
                  >
                    <div className="text-2xl">{player.avatarUrl || '👤'}</div>
                    <div className="flex-1">
                      <p className={`font-medium ${isImposter ? 'text-red-600' : ''}`}>
                        {player.name}
                      </p>
                    </div>
                    {isImposter && (
                      <Badge variant="destructive" className="gap-1">
                        <Eye className="h-3 w-3" />
                        IMPOSTER
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Auto-Mode Info */}
      {autoMode && (
        <Card className="border-2 border-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-blue-600">Auto-Mode Active</p>
                <p className="text-sm text-muted-foreground">
                  New rounds will start automatically every {duration} minutes. The game runs itself!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
