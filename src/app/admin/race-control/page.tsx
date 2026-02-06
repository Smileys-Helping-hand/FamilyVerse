'use client';

import { useState } from 'react';
import { Timer, Play, Flag, DollarSign, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { submitLapTimeAction, startImposterRoundAction, settleBetsAction, getSimRacingLeaderboardAction } from '@/app/actions/party-logic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function RaceControlPage() {
  const [lapTime, setLapTime] = useState('');
  const [carModel, setCarModel] = useState('');
  const [track, setTrack] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmitLapTime = async () => {
    if (!lapTime) {
      toast({
        title: '❌ Missing Lap Time',
        description: 'Please enter a lap time',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    const result = await submitLapTimeAction(lapTime, carModel || undefined, track || undefined);

    if (result.success) {
      toast({
        title: '✅ Lap Time Submitted!',
        description: `Time: ${lapTime}`,
      });
      setLapTime('');
      setCarModel('');
      
      // Get game ID for settling bets later
      const leaderboard = await getSimRacingLeaderboardAction();
      if (leaderboard.success && leaderboard.game) {
        setActiveGameId(leaderboard.game.id);
      }
    } else {
      toast({
        title: '❌ Submission Failed',
        description: result.error,
        variant: 'destructive',
      });
    }

    setSubmitting(false);
  };

  const handleStartImposterRound = async () => {
    const result = await startImposterRoundAction();

    if (result.success) {
      toast({
        title: '🎮 Imposter Round Started!',
        description: `${result.playerCount} players in game`,
      });
    } else {
      toast({
        title: '❌ Failed to Start',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleSettleBets = async () => {
    if (!activeGameId) {
      toast({
        title: '❌ No Active Game',
        description: 'Submit a lap time first',
        variant: 'destructive',
      });
      return;
    }

    const result = await settleBetsAction(activeGameId);

    if (result.success) {
      toast({
        title: '💰 Bets Settled!',
        description: 'Winners have been paid',
      });
      setActiveGameId(null);
    } else {
      toast({
        title: '❌ Settlement Failed',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-4">
          <Link href="/party/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Party
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              Home Dashboard
            </Button>
          </Link>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🎮 Race Control</h1>
          <p className="text-muted-foreground">Admin Panel - Party Operations</p>
          <Badge variant="destructive" className="mt-2">ADMIN ONLY</Badge>
        </div>

        {/* Sim Racing Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="w-5 h-5" />
              Sim Racing - Submit Lap Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="lapTime">Lap Time *</Label>
              <Input
                id="lapTime"
                placeholder="1:24.500 or 84.5"
                value={lapTime}
                onChange={(e) => setLapTime(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Format: M:SS.mmm or seconds (e.g., "1:24.500" or "84.5")
              </p>
            </div>

            <div>
              <Label htmlFor="carModel">Car Model (Optional)</Label>
              <Input
                id="carModel"
                placeholder="Ferrari F40"
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="track">Track (Optional)</Label>
              <Input
                id="track"
                placeholder="Nürburgring"
                value={track}
                onChange={(e) => setTrack(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSubmitLapTime}
                disabled={submitting}
                className="flex-1"
              >
                <Flag className="w-4 h-4 mr-2" />
                {submitting ? 'Submitting...' : 'Submit Lap Time'}
              </Button>

              {activeGameId && (
                <Button
                  onClick={handleSettleBets}
                  variant="secondary"
                  className="flex-1"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Settle Bets
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Imposter Game Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Imposter Game Control
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleStartImposterRound}
              className="w-full"
              size="lg"
            >
              🎭 Start New Imposter Round
            </Button>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              AI will generate words and assign roles to players
            </p>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <h3 className="font-semibold mb-1">Sim Racing:</h3>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Driver completes a lap</li>
                <li>Enter their time here (format: 1:24.500)</li>
                <li>Leaderboard updates instantly for all guests</li>
                <li>After all laps, click "Settle Bets" to pay winners</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold mb-1">Imposter Game:</h3>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Click "Start New Round" when ready</li>
                <li>AI generates secret word + imposter hint</li>
                <li>Each player gets their role instantly</li>
                <li>Players discuss and vote</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
