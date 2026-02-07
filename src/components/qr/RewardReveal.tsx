'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import type { ScanResult } from '@/app/actions/smart-qr';

interface Props {
  result: ScanResult;
}

export function RewardReveal({ result }: Props) {
  const [phase, setPhase] = useState<'chest' | 'shake' | 'reveal'>('chest');
  const [showPoints, setShowPoints] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sound effects
  useEffect(() => {
    const playSound = (src: string) => {
      try {
        const audio = new Audio(src);
        audio.volume = 0.6;
        audio.play().catch(() => {});
      } catch {}
    };

    // Start animation sequence
    const timer1 = setTimeout(() => {
      setPhase('shake');
      playSound('/sounds/chest_shake.mp3');
    }, 500);

    const timer2 = setTimeout(() => {
      setPhase('reveal');
      setShowPoints(true);
      
      // Play appropriate sound
      if (result.status === 'TRAP') {
        playSound('/sounds/explosion.mp3');
        // Red screen shake effect handled in CSS
      } else {
        playSound('/sounds/chest_open.mp3');
        // Trigger confetti for wins
        if (result.status === 'SUCCESS' || result.status === 'FIRST_FINDER') {
          triggerCelebration(result.status === 'FIRST_FINDER');
        }
      }
    }, 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [result]);

  const triggerCelebration = (isFirstFinder: boolean) => {
    const colors = isFirstFinder 
      ? ['#FFD700', '#FFA500', '#FFFF00'] // Gold for first finder
      : ['#a855f7', '#ec4899', '#6366f1']; // Purple/pink for normal

    confetti({
      particleCount: isFirstFinder ? 150 : 80,
      spread: 70,
      origin: { y: 0.6 },
      colors,
    });

    if (isFirstFinder) {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 100,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });
      }, 300);
    }
  };

  // Get styling based on result
  const getResultStyles = () => {
    switch (result.status) {
      case 'TRAP':
        return {
          bg: 'from-red-900 via-red-800 to-orange-900',
          icon: '💥',
          chestIcon: '🪤',
          textColor: 'text-red-400',
          pointsColor: 'text-red-500',
          borderColor: 'border-red-500',
        };
      case 'FIRST_FINDER':
        return {
          bg: 'from-yellow-900 via-amber-800 to-orange-900',
          icon: '🏆',
          chestIcon: '🎁',
          textColor: 'text-yellow-400',
          pointsColor: 'text-yellow-400',
          borderColor: 'border-yellow-500',
        };
      case 'ALREADY_CLAIMED':
        return {
          bg: 'from-gray-900 via-gray-800 to-gray-900',
          icon: '🔒',
          chestIcon: '📦',
          textColor: 'text-gray-400',
          pointsColor: 'text-gray-500',
          borderColor: 'border-gray-600',
        };
      default:
        return {
          bg: 'from-purple-900 via-indigo-900 to-blue-900',
          icon: '✨',
          chestIcon: '🎁',
          textColor: 'text-purple-400',
          pointsColor: 'text-green-400',
          borderColor: 'border-purple-500',
        };
    }
  };

  const styles = getResultStyles();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${styles.bg} flex items-center justify-center p-4 ${result.status === 'TRAP' ? 'animate-shake' : ''}`}>
      <AnimatePresence mode="wait">
        {phase === 'chest' && (
          <motion.div
            key="chest"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="text-center"
          >
            <div className="text-9xl mb-4">{styles.chestIcon}</div>
            <p className="text-white/70 animate-pulse">Opening...</p>
          </motion.div>
        )}

        {phase === 'shake' && (
          <motion.div
            key="shake"
            animate={{
              rotate: [-5, 5, -5, 5, -5, 5, -3, 3, 0],
              scale: [1, 1.05, 1, 1.08, 1, 1.1, 1.05, 1],
            }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            className="text-center"
          >
            <div className="text-9xl">{styles.chestIcon}</div>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.3, repeat: Infinity }}
              className="text-white/70 mt-4"
            >
              Unlocking...
            </motion.div>
          </motion.div>
        )}

        {phase === 'reveal' && (
          <motion.div
            key="reveal"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            className="w-full max-w-md"
          >
            <Card className={`bg-black/40 ${styles.borderColor} border-2`}>
              <CardContent className="p-8 text-center">
                {/* Main Icon */}
                <motion.div
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="text-8xl mb-6"
                >
                  {styles.icon}
                </motion.div>

                {/* Status Badge */}
                {result.status === 'FIRST_FINDER' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="inline-block bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black px-6 py-2 rounded-full text-sm mb-4"
                  >
                    🏆 FIRST FINDER! 🏆
                  </motion.div>
                )}

                {result.status === 'TRAP' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="inline-block bg-gradient-to-r from-red-600 to-orange-600 text-white font-black px-6 py-2 rounded-full text-sm mb-4 animate-pulse"
                  >
                    💥 TRAP TRIGGERED! 💥
                  </motion.div>
                )}

                {/* Points Animation */}
                {showPoints && result.points !== undefined && (
                  <motion.div
                    initial={{ y: 20, opacity: 0, scale: 0.5 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, type: 'spring', damping: 8 }}
                    className={`text-6xl font-black ${styles.pointsColor} mb-4`}
                  >
                    {result.points > 0 ? '+' : ''}{result.points}
                    <span className="text-2xl ml-2">pts</span>
                  </motion.div>
                )}

                {/* Message */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className={`text-xl ${styles.textColor} mb-2`}
                >
                  {result.message}
                </motion.p>

                {/* QR Title & Content */}
                {result.qr && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-6 p-4 bg-black/30 rounded-lg"
                  >
                    <h3 className="text-white font-bold text-lg mb-2">{result.qr.title}</h3>
                    <p className="text-gray-300 text-sm">{result.qr.content}</p>
                  </motion.div>
                )}

                {/* New Balance */}
                {result.totalBalance !== undefined && result.totalBalance > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-4 text-gray-400 text-sm"
                  >
                    New Balance: <span className="text-white font-mono font-bold">{result.totalBalance}</span> pts
                  </motion.div>
                )}

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mt-8 flex flex-col gap-3"
                >
                  <Link href="/party/dashboard">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                      🎮 Back to Party
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: result.status === 'TRAP' ? 'I fell for a trap!' : 'I found a clue!',
                          text: result.message,
                        });
                      }
                    }}
                    className="w-full"
                  >
                    📤 Share
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trap overlay effect */}
      {result.status === 'TRAP' && phase === 'reveal' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-red-500 pointer-events-none z-50"
        />
      )}

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
