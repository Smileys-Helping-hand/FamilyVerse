'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Eye, Users } from 'lucide-react';

interface RoleRevealCardProps {
  role: 'CIVILIAN' | 'IMPOSTER';
  information: string;
  onRevealed?: () => void;
}

export function RoleRevealCard({ role, information, onRevealed }: RoleRevealCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const handleReveal = () => {
    setIsRevealed(true);
    setTimeout(() => setShowContent(true), 600);
    onRevealed?.();
  };

  const isImposter = role === 'IMPOSTER';

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <AnimatePresence mode="wait">
        {!isRevealed ? (
          <motion.div
            key="unrevealed"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="w-full max-w-md"
          >
            <Card
              onClick={handleReveal}
              className="cursor-pointer hover:shadow-2xl transition-shadow duration-300 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-dashed"
            >
              <CardContent className="p-12 text-center">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <Eye className="h-16 w-16 mx-auto mb-4 text-purple-500" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Tap to Reveal Your Role</h2>
                <p className="text-muted-foreground">
                  Keep your role secret from other players!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 100,
              damping: 15,
            }}
            className="w-full max-w-md"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <Card
              className={`border-4 ${
                isImposter
                  ? 'bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500'
                  : 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500'
              }`}
            >
              <CardContent className="p-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  className="text-center mb-6"
                >
                  {isImposter ? (
                    <>
                      <motion.div
                        animate={{
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          repeatDelay: 2,
                        }}
                      >
                        <AlertCircle className="h-20 w-20 mx-auto mb-4 text-red-500" />
                      </motion.div>
                      <h2 className="text-3xl font-bold text-red-600 mb-2">
                        YOU ARE THE IMPOSTER!
                      </h2>
                    </>
                  ) : (
                    <>
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      >
                        <Users className="h-20 w-20 mx-auto mb-4 text-green-500" />
                      </motion.div>
                      <h2 className="text-3xl font-bold text-green-600 mb-2">
                        YOU ARE A CIVILIAN
                      </h2>
                    </>
                  )}
                </motion.div>

                <AnimatePresence>
                  {showContent && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className={`p-6 rounded-lg ${
                        isImposter ? 'bg-red-500/10' : 'bg-green-500/10'
                      }`}
                    >
                      <h3 className="font-bold mb-3 text-lg">
                        {isImposter ? '🎭 Your Hint:' : '🎯 The Secret Topic:'}
                      </h3>
                      <p className="text-lg font-semibold mb-4">{information}</p>

                      <div className="text-sm space-y-2 text-muted-foreground">
                        {isImposter ? (
                          <>
                            <p>🎯 Your Mission: Blend in without knowing the exact topic</p>
                            <p>⚠️ Be vague but convincing</p>
                            <p>🤫 Don't reveal your role!</p>
                          </>
                        ) : (
                          <>
                            <p>🔍 Your Mission: Find the imposter</p>
                            <p>💬 Discuss the topic naturally</p>
                            <p>🕵️ Watch for suspicious behavior!</p>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/50"
                >
                  <p className="text-xs text-center">
                    ⚠️ Remember: Keep your role secret and observe everyone carefully!
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
