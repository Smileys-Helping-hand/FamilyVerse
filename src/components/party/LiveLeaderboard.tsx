'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Award, Clock, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getGameLeaderboard, formatTime, type LeaderboardEntry } from '@/app/actions/leaderboard';

interface LiveLeaderboardProps {
  gameId: number;
  eventId: number;
  gameName: string;
  scoringType: 'TIME_ASC' | 'SCORE_DESC';
  refreshInterval?: number; // in milliseconds, default 10000 (10s)
}

export function LiveLeaderboard({
  gameId,
  eventId,
  gameName,
  scoringType,
  refreshInterval = 10000,
}: LiveLeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    const result = await getGameLeaderboard(gameId, eventId);
    if (result.success && result.data) {
      setEntries(result.data);
      setError(null);
    } else {
      setError(result.error || 'Failed to fetch leaderboard');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();

    // Poll for updates
    const interval = setInterval(fetchLeaderboard, refreshInterval);

    return () => clearInterval(interval);
  }, [gameId, eventId, refreshInterval]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-700" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500';
      case 2:
        return 'bg-gray-400/20 text-gray-700 border-gray-400';
      case 3:
        return 'bg-amber-700/20 text-amber-800 border-amber-700';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const formatScore = (score: number) => {
    if (scoringType === 'TIME_ASC') {
      return formatTime(score);
    }
    return score.toLocaleString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{gameName} Leaderboard</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{gameName} Leaderboard</CardTitle>
          <CardDescription className="text-destructive">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {scoringType === 'TIME_ASC' ? (
                <Clock className="h-5 w-5" />
              ) : (
                <Target className="h-5 w-5" />
              )}
              {gameName} Leaderboard
            </CardTitle>
            <CardDescription>
              {scoringType === 'TIME_ASC' ? 'Fastest Time Wins' : 'Highest Score Wins'}
            </CardDescription>
          </div>
          <Badge variant="outline" className="animate-pulse">
            LIVE
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y">
          <AnimatePresence initial={false}>
            {entries.map((entry) => (
              <motion.div
                key={entry.userId}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{
                  layout: {
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                  },
                }}
                className={`p-4 flex items-center gap-4 ${
                  entry.rank === 1 ? 'bg-yellow-500/5' : ''
                } ${entry.rank === 2 ? 'bg-gray-400/5' : ''} ${
                  entry.rank === 3 ? 'bg-amber-700/5' : ''
                }`}
              >
                {/* Rank */}
                <motion.div
                  layout="position"
                  className="flex-shrink-0 w-12 flex justify-center"
                >
                  {getRankIcon(entry.rank)}
                </motion.div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <motion.p layout="position" className="font-semibold truncate">
                    {entry.userName}
                  </motion.p>
                  <motion.p
                    layout="position"
                    className="text-xs text-muted-foreground"
                  >
                    {new Date(entry.createdAt).toLocaleTimeString()}
                  </motion.p>
                </div>

                {/* Score */}
                <motion.div
                  layout="position"
                  className="flex-shrink-0 text-right"
                >
                  <Badge
                    variant="outline"
                    className={`text-lg font-bold px-4 py-1 ${getRankBadgeColor(
                      entry.rank
                    )}`}
                  >
                    {formatScore(entry.scoreValue)}
                  </Badge>
                </motion.div>

                {/* Proof Image (if available) */}
                {entry.proofImageUrl && (
                  <motion.div layout="position" className="flex-shrink-0">
                    <a
                      href={entry.proofImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline"
                    >
                      View Proof
                    </a>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {entries.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <p>No scores yet. Be the first to compete!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
