'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Award, Crown, Zap, Star, Clock, Target, RefreshCw, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getPartyMVP, getAllGames, getGameLeaderboard } from '@/app/actions/leaderboard';
import { formatTime } from '@/lib/utils/format';
import { getSimRacingLeaderboardAction } from '@/app/actions/party-logic';

interface MVPEntry {
  userId: string;
  userName: string;
  metaPoints: number;
  gamesWon: number;
  totalGames: number;
}

interface GameEntry {
  id: number;
  name: string;
  scoringType: 'TIME_ASC' | 'SCORE_DESC';
  icon?: string;
}

interface LeaderboardEntry {
  userId: string;
  userName: string;
  scoreValue: number;
  rank: number;
}

interface RacingEntry {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string | null;
  lapTimeMs: number | null;
  carModel: string | null;
  isDnf: boolean;
}

export default function LeaderboardPage() {
  const [mvpLeaderboard, setMvpLeaderboard] = useState<MVPEntry[]>([]);
  const [games, setGames] = useState<GameEntry[]>([]);
  const [racingLeaderboard, setRacingLeaderboard] = useState<RacingEntry[]>([]);
  const [selectedGame, setSelectedGame] = useState<number | null>(null);
  const [gameLeaderboard, setGameLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mvp');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllData = async () => {
    setRefreshing(true);
    
    // Fetch all data in parallel
    const [mvpResult, gamesResult, racingResult] = await Promise.all([
      getPartyMVP(1), // Default event ID 1
      getAllGames(),
      getSimRacingLeaderboardAction(),
    ]);

    if (mvpResult.success && mvpResult.data) {
      setMvpLeaderboard(mvpResult.data);
    }

    if (gamesResult.success && gamesResult.data) {
      setGames(gamesResult.data as GameEntry[]);
    }

    if (racingResult.success && racingResult.leaderboard) {
      setRacingLeaderboard(racingResult.leaderboard);
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAllData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch specific game leaderboard
  useEffect(() => {
    if (selectedGame) {
      getGameLeaderboard(selectedGame, 1).then((result) => {
        if (result.success && result.data) {
          setGameLeaderboard(result.data);
        }
      });
    }
  }, [selectedGame]);

  const getRankIcon = (rank: number, large = false) => {
    const size = large ? 'h-10 w-10' : 'h-6 w-6';
    switch (rank) {
      case 1:
        return <Crown className={`${size} text-yellow-500 drop-shadow-lg`} />;
      case 2:
        return <Medal className={`${size} text-gray-400`} />;
      case 3:
        return <Award className={`${size} text-amber-700`} />;
      default:
        return <span className="text-xl font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankGradient = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/30 via-amber-500/20 to-orange-500/30 border-yellow-500/50';
      case 2:
        return 'bg-gradient-to-r from-gray-400/30 via-gray-300/20 to-gray-400/30 border-gray-400/50';
      case 3:
        return 'bg-gradient-to-r from-amber-700/30 via-amber-600/20 to-amber-700/30 border-amber-700/50';
      default:
        return 'bg-card border-border/50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-center"
        >
          <Trophy className="h-16 w-16 text-yellow-500 mb-4 mx-auto" />
          <p className="text-white text-xl font-bold">Loading Leaderboards...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <Trophy className="h-10 w-10 text-yellow-500" />
          <h1 className="text-4xl font-black text-white tracking-tight">
            LEADERBOARDS
          </h1>
          <Trophy className="h-10 w-10 text-yellow-500" />
        </div>
        <p className="text-purple-300 font-medium">
          Who&apos;s the best? The numbers don&apos;t lie.
        </p>
        
        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAllData}
          disabled={refreshing}
          className="mt-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-3 bg-black/40 border border-white/10">
          <TabsTrigger value="mvp" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Crown className="h-4 w-4 mr-2" />
            Party MVP
          </TabsTrigger>
          <TabsTrigger value="racing" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <Zap className="h-4 w-4 mr-2" />
            Sim Racing
          </TabsTrigger>
          <TabsTrigger value="games" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <Star className="h-4 w-4 mr-2" />
            Games
          </TabsTrigger>
        </TabsList>

        {/* Party MVP Tab */}
        <TabsContent value="mvp" className="mt-6">
          <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="flex items-center gap-3 text-white">
                <Crown className="h-6 w-6 text-yellow-500" />
                Party MVP Rankings
                <Badge variant="outline" className="ml-auto bg-purple-500/20 text-purple-300 border-purple-500/40">
                  Overall Champions
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <AnimatePresence mode="wait">
                {mvpLeaderboard.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 text-gray-400"
                  >
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No MVP data yet. Start competing!</p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {mvpLeaderboard.map((entry, index) => (
                      <motion.div
                        key={entry.userId}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg border ${getRankGradient(index + 1)} flex items-center gap-4`}
                      >
                        <div className="flex-shrink-0 w-12 flex justify-center">
                          {getRankIcon(index + 1, index < 3)}
                        </div>
                        
                        <div className="flex-1">
                          <p className="font-bold text-white text-lg">{entry.userName}</p>
                          <div className="flex gap-3 text-sm text-gray-400">
                            <span>{entry.gamesWon} wins</span>
                            <span>•</span>
                            <span>{entry.totalGames} games played</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                            {entry.metaPoints}
                          </div>
                          <div className="text-xs text-gray-400">META POINTS</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sim Racing Tab */}
        <TabsContent value="racing" className="mt-6">
          <Card className="bg-black/40 border-red-500/30 backdrop-blur-sm">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="flex items-center gap-3 text-white">
                <Zap className="h-6 w-6 text-red-500" />
                Sim Racing Leaderboard
                <Badge variant="outline" className="ml-auto bg-red-500/20 text-red-300 border-red-500/40 animate-pulse">
                  LIVE
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <AnimatePresence mode="wait">
                {racingLeaderboard.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 text-gray-400"
                  >
                    <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No lap times recorded yet. Hit the track!</p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {racingLeaderboard.map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg border ${getRankGradient(index + 1)} flex items-center gap-4`}
                      >
                        <div className="flex-shrink-0 w-12 flex justify-center">
                          {getRankIcon(index + 1, index < 3)}
                        </div>
                        
                        <div className="flex-1">
                          <p className="font-bold text-white text-lg">{entry.userName}</p>
                          <div className="flex gap-3 text-sm text-gray-400">
                            {entry.carModel && <span>🚗 {entry.carModel}</span>}
                            {entry.isDnf && (
                              <Badge variant="destructive" className="text-xs">DNF</Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-mono font-bold text-white">
                            {entry.lapTimeMs ? formatTime(entry.lapTimeMs) : '--:--.---'}
                          </div>
                          <div className="text-xs text-gray-400">LAP TIME</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Games Tab */}
        <TabsContent value="games" className="mt-6">
          <div className="space-y-4">
            {/* Game Selector */}
            {games.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {games.map((game) => (
                  <Button
                    key={game.id}
                    variant={selectedGame === game.id ? 'default' : 'outline'}
                    onClick={() => setSelectedGame(game.id)}
                    className={selectedGame === game.id ? 'bg-green-600 text-white' : 'bg-black/40 text-white border-white/20'}
                  >
                    {game.icon || '🎮'} {game.name}
                  </Button>
                ))}
              </div>
            )}

            <Card className="bg-black/40 border-green-500/30 backdrop-blur-sm">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="flex items-center gap-3 text-white">
                  <Star className="h-6 w-6 text-green-500" />
                  {selectedGame 
                    ? games.find(g => g.id === selectedGame)?.name || 'Game'
                    : 'Select a Game'
                  } Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <AnimatePresence mode="wait">
                  {!selectedGame ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12 text-gray-400"
                    >
                      <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a game above to view its leaderboard</p>
                    </motion.div>
                  ) : gameLeaderboard.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12 text-gray-400"
                    >
                      <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No scores recorded yet. Be the first!</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-3">
                      {gameLeaderboard.map((entry, index) => {
                        const game = games.find(g => g.id === selectedGame);
                        return (
                          <motion.div
                            key={entry.userId}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-lg border ${getRankGradient(entry.rank)} flex items-center gap-4`}
                          >
                            <div className="flex-shrink-0 w-12 flex justify-center">
                              {getRankIcon(entry.rank, entry.rank <= 3)}
                            </div>
                            
                            <div className="flex-1">
                              <p className="font-bold text-white text-lg">{entry.userName}</p>
                              <div className="flex gap-3 text-sm text-gray-400">
                                {game?.scoringType === 'TIME_ASC' ? (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> Fastest Time
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <Target className="h-3 w-3" /> High Score
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-2xl font-mono font-bold text-white">
                                {game?.scoringType === 'TIME_ASC' 
                                  ? formatTime(entry.scoreValue)
                                  : entry.scoreValue.toLocaleString()
                                }
                              </div>
                              <div className="text-xs text-gray-400">
                                {game?.scoringType === 'TIME_ASC' ? 'TIME' : 'SCORE'}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer Stats */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 max-w-4xl mx-auto grid grid-cols-3 gap-4"
      >
        <Card className="bg-black/30 border-white/10 text-center py-4">
          <div className="text-3xl font-bold text-purple-400">{mvpLeaderboard.length}</div>
          <div className="text-sm text-gray-400">Competitors</div>
        </Card>
        <Card className="bg-black/30 border-white/10 text-center py-4">
          <div className="text-3xl font-bold text-green-400">{games.length}</div>
          <div className="text-sm text-gray-400">Games</div>
        </Card>
        <Card className="bg-black/30 border-white/10 text-center py-4">
          <div className="text-3xl font-bold text-red-400">{racingLeaderboard.length}</div>
          <div className="text-sm text-gray-400">Lap Times</div>
        </Card>
      </motion.div>
    </div>
  );
}
