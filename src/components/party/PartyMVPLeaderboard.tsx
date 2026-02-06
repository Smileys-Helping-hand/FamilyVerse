'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getPartyMVP, type PartyMVPEntry } from '@/app/actions/leaderboard';

interface PartyMVPLeaderboardProps {
  eventId: number;
  refreshInterval?: number;
}

export function PartyMVPLeaderboard({
  eventId,
  refreshInterval = 10000,
}: PartyMVPLeaderboardProps) {
  const [entries, setEntries] = useState<PartyMVPEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMVP = async () => {
    const result = await getPartyMVP(eventId);
    if (result.success && result.data) {
      setEntries(result.data);
      setError(null);
    } else {
      setError(result.error || 'Failed to fetch MVP standings');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMVP();
    const interval = setInterval(fetchMVP, refreshInterval);
    return () => clearInterval(interval);
  }, [eventId, refreshInterval]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Party MVP</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Party MVP</CardTitle>
          <CardDescription className="text-destructive">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const maxPoints = entries.length > 0 ? entries[0].metaPoints : 1;

  return (
    <Card className="overflow-hidden border-2 border-purple-500/20">
      <CardHeader className="bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-orange-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <Trophy className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <CardTitle className="text-2xl">🎉 Party MVP</CardTitle>
            <CardDescription className="text-white/80">
              Overall Champion Across All Games
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {entries.map((entry, index) => (
          <motion.div
            key={entry.userId}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-4 rounded-lg border-2 ${
              index === 0
                ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500'
                : index === 1
                ? 'bg-gray-400/10 border-gray-400'
                : index === 2
                ? 'bg-amber-700/10 border-amber-700'
                : 'bg-muted border-muted'
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Rank */}
              <div className="flex-shrink-0">
                {index === 0 ? (
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    <Trophy className="h-10 w-10 text-yellow-500" />
                  </motion.div>
                ) : index === 1 ? (
                  <Star className="h-8 w-8 text-gray-400" />
                ) : index === 2 ? (
                  <Award className="h-8 w-8 text-amber-700" />
                ) : (
                  <div className="h-8 w-8 flex items-center justify-center text-xl font-bold text-muted-foreground">
                    {index + 1}
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg truncate">{entry.userName}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>🏆 {entry.gamesWon} wins</span>
                  <span>•</span>
                  <span>🎮 {entry.totalGames} games</span>
                </div>

                {/* Progress Bar */}
                <div className="mt-2">
                  <Progress
                    value={(entry.metaPoints / maxPoints) * 100}
                    className="h-2"
                  />
                </div>
              </div>

              {/* Meta Points */}
              <div className="flex-shrink-0 text-right">
                <Badge
                  variant="outline"
                  className={`text-xl font-bold px-4 py-2 ${
                    index === 0
                      ? 'bg-yellow-500/20 text-yellow-700 border-yellow-500'
                      : index === 1
                      ? 'bg-gray-400/20 text-gray-700 border-gray-400'
                      : index === 2
                      ? 'bg-amber-700/20 text-amber-800 border-amber-700'
                      : ''
                  }`}
                >
                  {entry.metaPoints}
                  <span className="text-xs ml-1">pts</span>
                </Badge>
              </div>
            </div>
          </motion.div>
        ))}

        {entries.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No scores yet. Start competing to see MVP standings!</p>
          </div>
        )}

        {/* Points Key */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm font-semibold mb-2">Meta Points System:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Badge className="bg-yellow-500">1st</Badge>
              <span>10 points</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-gray-400">2nd</Badge>
              <span>5 points</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-700">3rd</Badge>
              <span>3 points</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Participation</Badge>
              <span>1 point</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
