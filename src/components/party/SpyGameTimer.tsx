'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, Skull } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { getActiveImposterRoundAction } from '@/app/actions/party-logic';
import Pusher from 'pusher-js';

interface SpyGameTimerProps {
  userId: string;
}

export function SpyGameTimer({ userId }: SpyGameTimerProps) {
  const [roundData, setRoundData] = useState<any>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [showMeeting, setShowMeeting] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const fetchRound = async () => {
    const result = await getActiveImposterRoundAction();
    if (result.success && result.round) {
      setRoundData(result.round);
      
      // Check if we should show warning
      if (result.round.timeRemainingMinutes <= 10 && result.round.timeRemainingMinutes > 0 && result.round.status === 'ACTIVE') {
        setShowWarning(true);
      }
      
      // Check if voting phase
      if (result.round.status === 'VOTING') {
        setShowMeeting(true);
      }
    } else {
      setRoundData(null);
    }
  };

  useEffect(() => {
    fetchRound();
    const interval = setInterval(fetchRound, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Pusher real-time updates
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe('imposter-game');
    
    channel.bind('ten-minute-warning', (data: any) => {
      setShowWarning(true);
      playAlert();
      toast({
        title: '⚠️ 10 MINUTES LEFT!',
        description: 'Finish your tasks!',
        duration: 10000,
      });
    });

    channel.bind('emergency-meeting', (data: any) => {
      setShowMeeting(true);
      playMeetingSound();
      toast({
        title: '🚨 EMERGENCY MEETING!',
        description: 'Time to vote!',
        duration: 10000,
      });
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, []);

  const playAlert = () => {
    if (audioRef.current) {
      audioRef.current.src = '/sounds/alarm.mp3';
      audioRef.current.play().catch(() => {
        // Fallback if audio doesn't play
        console.log('Audio play failed');
      });
    }
  };

  const playMeetingSound = () => {
    if (audioRef.current) {
      audioRef.current.src = '/sounds/emergency.mp3';
      audioRef.current.play().catch(() => {
        console.log('Audio play failed');
      });
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getColorClass = (minutes: number) => {
    if (minutes <= 5) return 'text-red-600';
    if (minutes <= 10) return 'text-orange-600';
    return 'text-green-600';
  };

  if (!roundData) {
    return null; // No active round
  }

  return (
    <>
      {/* Audio element */}
      <audio ref={audioRef} />

      {/* Timer Card */}
      <Card className={`border-2 ${
        roundData.timeRemainingMinutes <= 10 
          ? 'border-red-500 shadow-lg shadow-red-500/50' 
          : 'border-purple-500'
      }`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className={`h-6 w-6 ${getColorClass(roundData.timeRemainingMinutes)}`} />
              <div>
                <p className="text-sm text-muted-foreground">Time Remaining</p>
                <p className={`text-3xl font-bold ${getColorClass(roundData.timeRemainingMinutes)}`}>
                  {formatTime(roundData.timeRemainingMs)}
                </p>
              </div>
            </div>
            <div className="text-center">
              {roundData.isImposter ? (
                <Badge variant="destructive" className="text-lg px-4 py-2 gap-2">
                  <Skull className="h-4 w-4" />
                  IMPOSTER
                </Badge>
              ) : (
                <Badge variant="default" className="text-lg px-4 py-2">
                  CIVILIAN
                </Badge>
              )}
            </div>
          </div>

          {/* Topic/Word Display */}
          <div className="mt-4 p-4 bg-slate-100 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-1">Your Topic</p>
            <p className={`text-2xl font-bold ${
              roundData.isImposter ? 'text-red-600' : 'text-green-600'
            }`}>
              {roundData.word}
            </p>
          </div>

          {/* Warning Badge */}
          {showWarning && roundData.timeRemainingMinutes > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 p-3 bg-orange-100 border-2 border-orange-500 rounded-lg"
            >
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <p className="text-sm font-medium text-orange-700">
                Less than 10 minutes remaining!
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* 10-Minute Warning Overlay */}
      <AnimatePresence>
        {showWarning && roundData.timeRemainingMinutes === 10 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setShowWarning(false)}
          >
            <motion.div
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              className="bg-gradient-to-r from-orange-600 to-red-600 p-12 rounded-2xl shadow-2xl border-4 border-white text-center"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                <AlertTriangle className="h-24 w-24 text-white mx-auto mb-4" />
              </motion.div>
              <h2 className="text-5xl font-bold text-white mb-2">
                ⚠️ 10 MINUTES LEFT!
              </h2>
              <p className="text-2xl text-white/90">
                FINISH TASKS NOW!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency Meeting Overlay */}
      <AnimatePresence>
        {showMeeting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-red-900/90 backdrop-blur-sm"
            onClick={() => setShowMeeting(false)}
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <h2 className="text-8xl font-bold text-white mb-4">
                  🚨
                </h2>
              </motion.div>
              <h2 className="text-6xl font-bold text-white mb-2">
                EMERGENCY MEETING
              </h2>
              <p className="text-3xl text-white/90">
                Time to Vote!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
