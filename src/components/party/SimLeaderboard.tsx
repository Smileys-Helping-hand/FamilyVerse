'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Timer, Car, Medal } from 'lucide-react';
import { usePartySocket } from '@/hooks/use-party-socket';
import { getSimRacingLeaderboardAction } from '@/app/actions/party-logic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LeaderboardEntry {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string | null;
  lapTimeMs: number | null;
  carModel: string | null;
  track: string | null;
  isDnf: boolean;
}

function formatLapTime(ms: number | null) {
  if (ms === null) return 'DNF';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = Math.floor((ms % 1000) / 10);
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(2, '0')}`;
}

function getRankColor(index: number) {
  switch (index) {
    case 0:
      return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900'; // Gold
    case 1:
      return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-900'; // Silver
    case 2:
      return 'bg-gradient-to-r from-orange-400 to-orange-600 text-orange-900'; // Bronze
    default:
      return 'bg-secondary text-secondary-foreground';
  }
}

function getRankIcon(index: number) {
  if (index === 0) return <Trophy className="w-5 h-5" />;
  if (index === 1) return <Medal className="w-5 h-5" />;
  if (index === 2) return <Medal className="w-5 h-5" />;
  return <span className="font-bold">#{index + 1}</span>;
}

export function SimLeaderboard({ gameId }: { gameId?: string }) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { bind, isConnected } = usePartySocket('sim-racing');

  const loadLeaderboard = async () => {
    const result = await getSimRacingLeaderboardAction(gameId);
    if (result.success && result.leaderboard) {
      setLeaderboard(result.leaderboard as LeaderboardEntry[]);
      setGame(result.game);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLeaderboard();
    
    // Listen for real-time updates
    bind('leaderboard-update', () => {
      loadLeaderboard();
    });
  }, [gameId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5" />
            Loading Leaderboard...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!game || leaderboard.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5" />
            Sim Racing Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No times submitted yet. Be the first to race! 🏁
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Timer className="w-5 h-5" />
            {game.title}
          </span>
          {isConnected && (
            <span className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {leaderboard.map((entry, index) => (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={`p-4 rounded-lg ${getRankColor(index)} shadow-md`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8">
                      {getRankIcon(index)}
                    </div>
                    <div>
                      <div className="font-semibold">{entry.userName}</div>
                      {entry.carModel && (
                        <div className="text-xs opacity-80 flex items-center gap-1">
                          <Car className="w-3 h-3" />
                          {entry.carModel}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-mono font-bold">
                      {formatLapTime(entry.lapTimeMs)}
                    </div>
                    {entry.track && (
                      <div className="text-xs opacity-80">{entry.track}</div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
