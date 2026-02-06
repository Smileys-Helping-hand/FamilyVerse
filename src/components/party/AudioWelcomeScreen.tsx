'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { initializeAudio, playSound } from '@/lib/audio-utils';

interface AudioWelcomeScreenProps {
  onEnter: () => void;
}

/**
 * Audio Welcome Screen
 * 
 * This screen appears first to unlock audio context.
 * Chrome blocks audio playback until the user interacts with the page.
 * This component provides a beautiful "Tap to Enter" experience that
 * initializes audio and plays a welcome sound.
 */
export function AudioWelcomeScreen({ onEnter }: AudioWelcomeScreenProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleEnter = async () => {
    setIsAnimating(true);

    // Initialize audio context
    initializeAudio();

    // Play a subtle whoosh sound (if available)
    try {
      playSound('/sounds/whoosh.mp3', 0.3);
    } catch (error) {
      // Whoosh sound not available, continue silently
    }

    // Wait for animation then proceed
    setTimeout(() => {
      onEnter();
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-600 to-red-600"
    >
      <div className="text-center space-y-8 p-8">
        {/* Animated Icon */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="inline-block"
        >
          <div className="relative">
            <Sparkles className="w-24 h-24 text-white" />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-white rounded-full blur-2xl"
            />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
            FamilyVerse
          </h1>
          <p className="text-2xl text-white/90 font-medium">
            Party OS
          </p>
        </motion.div>

        {/* Enter Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            size="lg"
            onClick={handleEnter}
            disabled={isAnimating}
            className="bg-white text-purple-600 hover:bg-gray-100 px-12 py-8 text-2xl font-bold rounded-2xl shadow-2xl transform transition-transform hover:scale-105"
          >
            <Volume2 className="w-8 h-8 mr-4" />
            {isAnimating ? 'Entering...' : 'Tap to Enter Party'}
          </Button>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-white/70 text-sm"
        >
          🔊 Audio will be enabled for the best experience
        </motion.p>
      </div>

      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              x: [null, Math.random() * window.innerWidth],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

/**
 * Hook to manage audio welcome screen state
 */
export function useAudioWelcome() {
  const [showWelcome, setShowWelcome] = useState(() => {
    // Check if user has already entered (use sessionStorage)
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('audio-unlocked');
    }
    return true;
  });

  const handleEnter = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('audio-unlocked', 'true');
    }
    setShowWelcome(false);
  };

  return { showWelcome, handleEnter };
}
