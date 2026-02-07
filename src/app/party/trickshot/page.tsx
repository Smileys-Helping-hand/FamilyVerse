'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Crosshair } from 'lucide-react';
import { usePartySocket } from '@/hooks/use-party-socket';
import {
  getAllPartyUsersAction,
  getTrickshotLeaderboardAction,
  logTrickshotHitAction,
} from '@/app/actions/party-logic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { playSound } from '@/lib/audio-utils';
import { useToast } from '@/hooks/use-toast';

interface PartyUser {
  id: string;
  name: string;
  avatarUrl: string | null;
}

const shotTypes = [
  { id: 'STANDARD', label: 'Standard Hit', points: 100 },
  { id: 'BOUNCE', label: 'Wall Bounce', points: 200 },
  { id: 'CUP', label: 'The Cup Sink', points: 500 },
  { id: 'NO_LOOK', label: 'No-Look', points: 1000 },
] as const;

export default function TrickshotPage() {
  const [players, setPlayers] = useState<PartyUser[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedShot, setSelectedShot] = useState<typeof shotTypes[number]>(shotTypes[0]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [logging, setLogging] = useState(false);
  const { bind } = usePartySocket('trickshot');
  const { toast } = useToast();

  const loadPlayers = async () => {
    const result = await getAllPartyUsersAction();
    if (result.success && result.users) {
      const approved = (result.users as PartyUser[]).filter((user) => user.name);
      setPlayers(approved);
      if (!selectedPlayer && approved[0]) {
        setSelectedPlayer(approved[0].id);
      }
    }
  };

  const loadLeaderboard = async () => {
    const result = await getTrickshotLeaderboardAction();
    if (result.success && result.leaderboard) {
      setLeaderboard(result.leaderboard);
    }
  };

  useEffect(() => {
    loadPlayers();
    loadLeaderboard();

    bind('score-update', () => {
      loadLeaderboard();
    });
  }, []);

  const handleLogHit = async () => {
    if (!selectedPlayer) {
      toast({
        title: 'Select a player',
        description: 'Choose who landed the shot.',
        variant: 'destructive',
      });
      return;
    }

    setLogging(true);
    playSound('/sounds/gunshot_silenced.mp3', 0.7);
    const result = await logTrickshotHitAction({
      userId: selectedPlayer,
      shotType: selectedShot.id,
      points: selectedShot.points,
    });

    if (result.success) {
      toast({
        title: '🎯 Hit Logged',
        description: `${selectedShot.label} +${selectedShot.points} pts`,
      });
      await loadLeaderboard();
    } else {
      toast({
        title: '❌ Failed',
        description: result.error,
        variant: 'destructive',
      });
    }

    setLogging(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071a12] via-[#02110a] to-black text-green-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.12),transparent_60%)]" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'linear-gradient(transparent 96%, rgba(34,197,94,0.3) 97%), linear-gradient(90deg, transparent 96%, rgba(34,197,94,0.3) 97%)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="h-48 w-48 rounded-full border border-green-400/40" />
        <div className="absolute h-1 w-64 bg-green-400/20" />
        <div className="absolute h-64 w-1 bg-green-400/20" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-green-400/60">Night Vision Mode</p>
            <h1 className="text-3xl font-bold text-green-200 flex items-center gap-3">
              <Target className="w-6 h-6" />
              🎯 TRICKSHOT ARENA
            </h1>
          </div>
          <div className="text-xs text-green-400/60 flex items-center gap-2">
            <Crosshair className="w-4 h-4" />
            Live Scoring
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-black/60 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-green-200">Log a Hit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-green-400/60 mb-2">Select Player</p>
                <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                  <SelectTrigger className="bg-black/50 border-green-500/20">
                    <SelectValue placeholder="Choose player" />
                  </SelectTrigger>
                  <SelectContent>
                    {players.map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-green-400/60 mb-2">Shot Type</p>
                <div className="grid grid-cols-2 gap-2">
                  {shotTypes.map((shot) => (
                    <Button
                      key={shot.id}
                      variant={selectedShot.id === shot.id ? 'default' : 'secondary'}
                      className={`text-left h-auto py-3 ${selectedShot.id === shot.id ? 'bg-green-500/80 text-black' : 'bg-black/50 text-green-200'}`}
                      onClick={() => setSelectedShot(shot)}
                    >
                      <div>
                        <p className="text-sm font-semibold">{shot.label}</p>
                        <p className="text-xs text-green-200/70">+{shot.points} pts</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleLogHit}
                disabled={logging}
                className="w-full bg-green-500 text-black hover:bg-green-400"
                size="lg"
              >
                {logging ? 'Logging...' : 'LOG HIT'}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-black/60 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-green-200">Top Snipers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {leaderboard.length === 0 && (
                <p className="text-sm text-green-400/60">No scores yet. Start logging hits.</p>
              )}
              {leaderboard.map((entry, index) => (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold">#{index + 1} {entry.userName}</p>
                    <p className="text-xs text-green-400/70">Total Points</p>
                  </div>
                  <div className="text-lg font-bold text-green-200">{entry.totalPoints}</div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
