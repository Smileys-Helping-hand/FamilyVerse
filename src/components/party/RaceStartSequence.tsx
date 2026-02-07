'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePartySocket } from '@/hooks/use-party-socket';
import { playSound, preloadSounds } from '@/lib/audio-utils';

const LIGHT_COUNT = 5;
const STEP_MS = 650;
const DROP_DELAY_MS = 450;

export function RaceStartSequence() {
  const { bind } = usePartySocket('sim-racing');
  const [active, setActive] = useState(false);
  const [litCount, setLitCount] = useState(0);
  const [phase, setPhase] = useState<'lights' | 'go'>('lights');
  const timersRef = useRef<number[]>([]);
  const runningRef = useRef(false);

  useEffect(() => {
    preloadSounds(['/sounds/beep.mp3', '/sounds/go.mp3']);
  }, []);

  useEffect(() => {
    bind('race-started', () => {
      if (runningRef.current) {
        return;
      }
      runningRef.current = true;
      setActive(true);
      setPhase('lights');
      setLitCount(0);

      for (let i = 1; i <= LIGHT_COUNT; i += 1) {
        const timerId = window.setTimeout(() => {
          setLitCount(i);
          playSound('/sounds/beep.mp3', 0.6);
        }, i * STEP_MS);
        timersRef.current.push(timerId);
      }

      const dropTimer = window.setTimeout(() => {
        setPhase('go');
        setLitCount(0);
        playSound('/sounds/go.mp3', 0.7);
        if (navigator.vibrate) {
          navigator.vibrate([60, 40, 120]);
        }
      }, LIGHT_COUNT * STEP_MS + DROP_DELAY_MS);
      timersRef.current.push(dropTimer);

      const hideTimer = window.setTimeout(() => {
        setActive(false);
        runningRef.current = false;
      }, LIGHT_COUNT * STEP_MS + DROP_DELAY_MS + 800);
      timersRef.current.push(hideTimer);
    });

    return () => {
      timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      timersRef.current = [];
    };
  }, [bind]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        >
          <div className="text-center">
            <div className="mb-6 text-xs uppercase tracking-[0.5em] text-white/60">Race Control</div>
            <div className="flex items-center justify-center gap-3">
              {Array.from({ length: LIGHT_COUNT }).map((_, index) => {
                const isLit = litCount >= index + 1;
                return (
                  <div
                    key={`light-${index}`}
                    className={`h-10 w-10 rounded-full border border-white/20 ${
                      isLit ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)]' : 'bg-zinc-700/60'
                    }`}
                  />
                );
              })}
            </div>
            <div className="mt-8 text-3xl font-bold text-white">
              {phase === 'go' ? 'GO!' : 'GET READY'}
            </div>
            <div className="mt-2 text-sm text-white/60">Hold tight...</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
