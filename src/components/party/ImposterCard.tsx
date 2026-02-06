'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react';
import { getActiveImposterRoundAction } from '@/app/actions/party-logic';
import { usePartySocket } from '@/hooks/use-party-socket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ImposterRound {
  id: string;
  isImposter: boolean;
  word: string;
  status: string;
}

export function ImposterCard() {
  const [round, setRound] = useState<ImposterRound | null>(null);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const { bind } = usePartySocket('imposter-game');

  const loadRound = async () => {
    const result = await getActiveImposterRoundAction();
    if (result.success && result.round) {
      setRound(result.round as any);
    } else {
      setRound(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRound();
    
    bind('round-started', () => {
      setRevealed(false);
      loadRound();
    });
    
    bind('round-ended', () => {
      loadRound();
    });
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading game...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!round) {
    return (
      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Imposter Game
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No active game. Waiting for admin to start... 🕵️
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      <Card
        className={`border-4 ${
          round.isImposter
            ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
            : 'border-green-500 bg-green-50 dark:bg-green-950/20'
        }`}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {round.isImposter ? (
                <>
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="text-red-600 dark:text-red-400">
                    You are the IMPOSTER
                  </span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">
                    You are a CIVILIAN
                  </span>
                </>
              )}
            </span>
            <Badge variant={round.isImposter ? 'destructive' : 'default'}>
              {round.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              {round.isImposter ? 'Your Hint:' : 'Secret Word:'}
            </p>
            
            {!revealed ? (
              <motion.button
                onClick={() => setRevealed(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full p-8 bg-card border-2 border-dashed rounded-lg flex items-center justify-center gap-3 hover:border-primary transition-colors"
              >
                <EyeOff className="w-8 h-8" />
                <span className="text-lg font-medium">Tap to Reveal</span>
              </motion.button>
            ) : (
              <motion.div
                initial={{ rotateY: 90 }}
                animate={{ rotateY: 0 }}
                transition={{ duration: 0.3 }}
                className={`p-8 rounded-lg ${
                  round.isImposter
                    ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-500'
                    : 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500'
                }`}
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Eye className="w-6 h-6" />
                  <span className="text-sm font-medium">Your Secret:</span>
                </div>
                <p
                  className={`text-3xl font-bold text-center ${
                    round.isImposter
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-green-700 dark:text-green-300'
                  }`}
                >
                  {round.word}
                </p>
              </motion.div>
            )}
          </div>

          <div className="text-xs text-center text-muted-foreground space-y-1">
            {round.isImposter ? (
              <>
                <p>🎭 Blend in! Use your hint to pretend you have the word.</p>
                <p>Don't let others discover you're the imposter!</p>
              </>
            ) : (
              <>
                <p>🔍 Watch for the imposter who has a different word!</p>
                <p>Discuss and vote to eliminate the imposter.</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
