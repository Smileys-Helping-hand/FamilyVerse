'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Wallet, AlertCircle, Zap } from 'lucide-react';
import { getSimRacingLeaderboardAction } from '@/app/actions/party-logic';
import { usePartySocket } from '@/hooks/use-party-socket';
import Confetti from 'react-confetti';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrashTalkButton } from '@/components/party/AwehChatIntegration';

type ViewMode = 'leaderboard' | 'heat-map' | 'game-status';

interface LeaderboardEntry {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string | null;
  lapTimeMs: number | null;
  carModel: string | null;
  isDnf: boolean;
}

interface WalletEntry {
  id: string;
  name: string;
  avatarUrl: string | null;
  walletBalance: number;
}

export default function TVModePage() {
  const [currentView, setCurrentView] = useState<ViewMode>('leaderboard');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [walletLeaders, setWalletLeaders] = useState<WalletEntry[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameStatus, setGameStatus] = useState<string>('No active games');
  const [newRecord, setNewRecord] = useState<string | null>(null);

  // Real-time updates via Pusher
  const { bind } = usePartySocket('party-tv');
  
  useEffect(() => {
    bind('new-lap-record', (data: any) => {
      setNewRecord(`${data.userName}: ${formatTime(data.lapTimeMs)}`);
      setCurrentView('leaderboard');
      fetchLeaderboard();
      
      // Flash animation
      setTimeout(() => setNewRecord(null), 5000);
    });
    
    bind('winner-declared', (data: any) => {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 10000);
    });
    
    bind('imposter-round-started', () => {
      setGameStatus('⚠️ IMPOSTER HUNT IN PROGRESS');
      setCurrentView('game-status');
    });
  }, [bind]);

  // Fetch data
  const fetchLeaderboard = async () => {
    const result = await getSimRacingLeaderboardAction();
    if (result.success && result.leaderboard) {
      setLeaderboard(result.leaderboard.slice(0, 5));
    }
  };

  // Auto-cycle views every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentView((prev) => {
        if (prev === 'leaderboard') return 'heat-map';
        if (prev === 'heat-map') return 'game-status';
        return 'leaderboard';
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Initial load
  useEffect(() => {
    fetchLeaderboard();
    // TODO: Fetch wallet leaders
  }, []);

  const formatTime = (ms: number) => {
    const totalSeconds = ms / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = (totalSeconds % 60).toFixed(3);
    return `${minutes}:${seconds.padStart(6, '0')}`;
  };

  const getGapToLeader = (timeMs: number, leaderTimeMs: number) => {
    if (timeMs === leaderTimeMs) return 'LEADER';
    const gap = (timeMs - leaderTimeMs) / 1000;
    return `+${gap.toFixed(3)}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-8 overflow-hidden">
      {showConfetti && (
        <Confetti
          width={typeof window !== 'undefined' ? window.innerWidth : 1920}
          height={typeof window !== 'undefined' ? window.innerHeight : 1080}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      {/* Header */}
      <div className="text-center mb-12">
        <motion.h1
          className="text-7xl font-bold mb-4"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🎉 PARTY OS
        </motion.h1>
        <p className="text-2xl text-purple-300">Live Dashboard</p>
      </div>

      {/* New Record Flash */}
      <AnimatePresence>
        {newRecord && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
          >
            <Card className="bg-yellow-500 text-black p-6 shadow-2xl">
              <div className="flex items-center gap-4">
                <Zap className="w-12 h-12" />
                <div>
                  <p className="text-sm font-semibold">🏆 NEW LAP RECORD!</p>
                  <p className="text-2xl font-bold">{newRecord}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - View Cycling */}
      <AnimatePresence mode="wait">
        {currentView === 'leaderboard' && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <Trophy className="w-16 h-16 text-yellow-500" />
              <h2 className="text-5xl font-bold">SIM RACING LEADERBOARD</h2>
            </div>

            <div className="space-y-4">
              {leaderboard.length === 0 ? (
                <p className="text-3xl text-center text-gray-400 py-20">
                  No lap times yet. Waiting for racers...
                </p>
              ) : (
                leaderboard.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-6 p-6 rounded-2xl ${
                      index === 0
                        ? 'bg-gradient-to-r from-yellow-600 to-yellow-800'
                        : 'bg-white/10 backdrop-blur'
                    }`}
                  >
                    {/* Position */}
                    <div className="text-6xl font-bold w-20 text-center">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </div>

                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                      {entry.avatarUrl ? (
                        <img src={entry.avatarUrl} alt={entry.userName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl">{entry.userName.charAt(0)}</span>
                      )}
                    </div>

                    {/* Name & Car */}
                    <div className="flex-1">
                      <p className="text-4xl font-bold">{entry.userName}</p>
                      {entry.carModel && (
                        <p className="text-2xl text-gray-300">{entry.carModel}</p>
                      )}
                    </div>

                    {/* Time */}
                    <div className="text-right">
                      {entry.isDnf ? (
                        <Badge variant="destructive" className="text-2xl px-4 py-2">DNF</Badge>
                      ) : (
                        <>
                          <p className="text-5xl font-mono font-bold">{formatTime(entry.lapTimeMs || 0)}</p>
                          {leaderboard[0] && leaderboard[0].lapTimeMs && (
                            <p className="text-2xl text-gray-400">
                              {getGapToLeader(entry.lapTimeMs || 0, leaderboard[0].lapTimeMs)}
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Trash Talk Button */}
                    <div className="ml-4">
                      <TrashTalkButton driverName={entry.userName} driverId={entry.userId} />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {currentView === 'heat-map' && (
          <motion.div
            key="heat-map"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <Wallet className="w-16 h-16 text-green-500" />
              <h2 className="text-5xl font-bold">RICHEST PARTY GUESTS</h2>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {walletLeaders.length === 0 ? (
                <div className="col-span-3 text-3xl text-center text-gray-400 py-20">
                  Loading wallet data...
                </div>
              ) : (
                walletLeaders.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-green-600 to-emerald-800 p-8 rounded-2xl text-center"
                  >
                    <div className="w-32 h-32 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-4 overflow-hidden">
                      {entry.avatarUrl ? (
                        <img src={entry.avatarUrl} alt={entry.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-6xl">{entry.name.charAt(0)}</span>
                      )}
                    </div>
                    <p className="text-3xl font-bold mb-2">{entry.name}</p>
                    <p className="text-5xl font-mono font-bold text-yellow-300">
                      {entry.walletBalance.toLocaleString()} 🪙
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {currentView === 'game-status' && (
          <motion.div
            key="game-status"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center min-h-[60vh]"
          >
            <div className="text-center">
              <AlertCircle className="w-40 h-40 mx-auto mb-8 text-red-500 animate-pulse" />
              <h2 className="text-7xl font-bold mb-4">{gameStatus}</h2>
              <p className="text-3xl text-gray-400">Check your phone for details</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer - Current View Indicator */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3">
        <div className={`w-4 h-4 rounded-full ${currentView === 'leaderboard' ? 'bg-white' : 'bg-white/30'}`} />
        <div className={`w-4 h-4 rounded-full ${currentView === 'heat-map' ? 'bg-white' : 'bg-white/30'}`} />
        <div className={`w-4 h-4 rounded-full ${currentView === 'game-status' ? 'bg-white' : 'bg-white/30'}`} />
      </div>
    </div>
  );
}
