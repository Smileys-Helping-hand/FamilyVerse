'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getGameConfig } from '@/app/actions/game-master';
import { Moon, Sun, Zap, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface BlackoutGameLoopProps {
  eventId: number;
  sessionId: string;
  onStateChange?: (state: GameState) => void;
}

type GameState = 
  | 'DAY_PHASE' 
  | 'BLACKOUT_WARNING' 
  | 'NIGHT_PHASE' 
  | 'BODY_REPORTED' 
  | 'VOTING';

export function BlackoutGameLoop({ 
  eventId, 
  sessionId, 
  onStateChange 
}: BlackoutGameLoopProps) {
  const [gameState, setGameState] = useState<GameState>('DAY_PHASE');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [powerLevel, setPowerLevel] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [config, setConfig] = useState({
    blackoutIntervalMinutes: 30,
    killerWindowSeconds: 30,
    isGamePaused: false,
  });

  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadConfig();
    startGameLoop();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      window.speechSynthesis.cancel();
    };
  }, [eventId]);

  const loadConfig = async () => {
    const result = await getGameConfig(eventId);
    if (result.success && result.data) {
      setConfig({
        blackoutIntervalMinutes: result.data.blackoutIntervalMinutes,
        killerWindowSeconds: result.data.killerWindowSeconds,
        isGamePaused: result.data.isGamePaused,
      });
      setPowerLevel(result.data.powerLevel);
      setTimeRemaining(result.data.blackoutIntervalMinutes * 60);
    }
  };

  const speak = (text: string, rate: number = 1.0) => {
    if (isMuted) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    speechSynthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const triggerBlackoutWarning = () => {
    setGameState('BLACKOUT_WARNING');
    speak('Warning. Power failure imminent. Initiating emergency protocol in 10 seconds.', 1.1);
    
    setTimeout(() => {
      triggerNightPhase();
    }, 10000);
  };

  const triggerNightPhase = () => {
    setGameState('NIGHT_PHASE');
    speak('System failure. Everyone close your eyes. Killer, you have 30 seconds.', 0.9);
    setTimeRemaining(config.killerWindowSeconds);

    setTimeout(() => {
      speak('Power restored. Everyone open your eyes.');
      setGameState('DAY_PHASE');
      setTimeRemaining(config.blackoutIntervalMinutes * 60);
    }, config.killerWindowSeconds * 1000);
  };

  const startGameLoop = () => {
    timerRef.current = setInterval(async () => {
      // Reload config to check for pause state
      const result = await getGameConfig(eventId);
      if (result.success && result.data) {
        if (result.data.isGamePaused) return; // Skip countdown if paused
        
        setPowerLevel(result.data.powerLevel);
        
        setTimeRemaining((prev) => {
          const newTime = prev - 1;
          
          // Power level affects timing (lower power = faster blackouts)
          const powerMultiplier = result.data.powerLevel / 100;
          const adjustedInterval = config.blackoutIntervalMinutes * 60 * powerMultiplier;
          
          // Trigger blackout when countdown reaches 0
          if (newTime <= 10 && newTime > 0 && gameState === 'DAY_PHASE') {
            triggerBlackoutWarning();
          }
          
          if (newTime <= 0 && gameState === 'DAY_PHASE') {
            return adjustedInterval;
          }
          
          return newTime;
        });
      }
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStateColor = () => {
    switch (gameState) {
      case 'DAY_PHASE':
        return 'bg-green-500';
      case 'BLACKOUT_WARNING':
        return 'bg-yellow-500';
      case 'NIGHT_PHASE':
        return 'bg-red-500';
      case 'BODY_REPORTED':
        return 'bg-purple-500';
      case 'VOTING':
        return 'bg-blue-500';
    }
  };

  const getStateIcon = () => {
    switch (gameState) {
      case 'DAY_PHASE':
        return <Sun className="h-6 w-6" />;
      case 'BLACKOUT_WARNING':
        return <Zap className="h-6 w-6 animate-pulse" />;
      case 'NIGHT_PHASE':
        return <Moon className="h-6 w-6" />;
      default:
        return <Sun className="h-6 w-6" />;
    }
  };

  const getBackgroundClass = () => {
    switch (gameState) {
      case 'NIGHT_PHASE':
        return 'from-black via-red-950 to-black';
      case 'BLACKOUT_WARNING':
        return 'from-slate-900 via-yellow-900 to-slate-900 animate-pulse';
      default:
        return 'from-slate-900 via-purple-900 to-slate-900';
    }
  };

  return (
    <div className={`fixed inset-0 bg-gradient-to-br ${getBackgroundClass()} transition-all duration-1000 pointer-events-none z-50`}>
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <Card className="w-96">
          <CardContent className="pt-6 space-y-4">
            {/* Game State */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getStateColor()}`}>
                  {getStateIcon()}
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    {gameState.replace('_', ' ')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(timeRemaining)}
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Power Level */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Power Level
                </span>
                <span className="font-semibold">{powerLevel}%</span>
              </div>
              <Progress 
                value={powerLevel} 
                className={`h-3 ${
                  powerLevel > 70 
                    ? 'bg-green-500' 
                    : powerLevel > 30 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'
                }`}
              />
            </div>

            {/* Status Messages */}
            <AnimatePresence mode="wait">
              {gameState === 'BLACKOUT_WARNING' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg"
                >
                  <p className="text-sm font-semibold text-yellow-300">
                    ⚠️ SYSTEM ALERT: Power failure imminent!
                  </p>
                </motion.div>
              )}
              
              {gameState === 'NIGHT_PHASE' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="p-4 bg-red-500/20 border border-red-500 rounded-lg"
                >
                  <p className="text-sm font-semibold text-red-300">
                    🌙 BLACKOUT IN PROGRESS
                  </p>
                  <p className="text-xs text-red-400 mt-1">
                    Everyone close your eyes. Killer is active.
                  </p>
                </motion.div>
              )}

              {config.isGamePaused && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-purple-500/20 border border-purple-500 rounded-lg text-center"
                >
                  <Badge variant="outline" className="text-purple-300">
                    GAME PAUSED
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
