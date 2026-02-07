'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Ghost } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { usePartySocket } from '@/hooks/use-party-socket';

interface DeathOverlayProps {
  userId: string;
}

export function DeathOverlay({ userId }: DeathOverlayProps) {
  const [isDead, setIsDead] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const { bind, unbind } = usePartySocket(`party-user-${userId}`);

  // Listen for death event on user-specific channel
  useEffect(() => {
    const handleDeath = () => {
      setIsDead(true);
      setShowOverlay(true);

      // Hide full overlay after 5 seconds, but keep ghost badge
      setTimeout(() => {
        setShowOverlay(false);
      }, 5000);
    };

    bind('you-are-dead', handleDeath);
    return () => unbind('you-are-dead');
  }, [bind, unbind]);

  return (
    <>
      {/* Full-Screen Death Animation */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="text-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              >
                <Skull className="w-32 h-32 text-red-500 mx-auto mb-6" />
              </motion.div>

              <h1 className="text-6xl font-bold text-red-500 mb-4">YOU ARE DEAD</h1>
              <p className="text-2xl text-gray-400 mb-6">
                You have been eliminated by the Imposter
              </p>

              <Card className="max-w-md mx-auto bg-red-950/30 border-red-500/50">
                <CardContent className="pt-6">
                  <div className="space-y-3 text-left">
                    <p className="text-lg text-gray-300">
                      <Ghost className="w-5 h-5 inline mr-2" />
                      You are now a <strong className="text-purple-400">GHOST</strong>
                    </p>
                    <ul className="space-y-2 text-sm text-gray-400 ml-7">
                      <li>🤫 You cannot speak about the game</li>
                      <li>🍕 You can eat snacks and watch</li>
                      <li>👻 You can roam the "Graveyard" zone</li>
                      <li>📱 Keep your phone - you can still spectate!</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-gray-500 mt-6"
              >
                Tap anywhere to continue spectating...
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Ghost Badge */}
      {isDead && !showOverlay && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-40"
        >
          <Card className="bg-gradient-to-r from-purple-950/80 to-red-950/80 border-purple-500/50 backdrop-blur">
            <CardContent className="px-4 py-2 flex items-center gap-2">
              <Ghost className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-200">
                You are a GHOST - Stay silent!
              </span>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </>
  );
}
