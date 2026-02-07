'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle, ArrowRight, Eye, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import type { SmartQr } from '@/lib/db/schema';

interface Props {
  qr: SmartQr;
}

export function SmartQrRevealClient({ qr }: Props) {
  const [revealed, setRevealed] = useState(false);
  
  // Confetti celebration on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#a855f7', '#ec4899', '#22c55e'],
      });
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Auto-reveal after delay
  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 800);
    return () => clearTimeout(timer);
  }, []);
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'I found a secret!',
          text: `I just discovered: ${qr.title}`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled
      }
    }
  };
  
  const getTypeStyles = () => {
    switch (qr.type) {
      case 'TASK':
        return {
          bg: 'from-orange-600 via-red-600 to-pink-600',
          icon: '🎯',
          label: 'MISSION UNLOCKED',
        };
      case 'INFO':
        return {
          bg: 'from-blue-600 via-cyan-600 to-teal-600',
          icon: 'ℹ️',
          label: 'INTEL RECEIVED',
        };
      case 'CLUE':
      default:
        return {
          bg: 'from-purple-600 via-violet-600 to-fuchsia-600',
          icon: '🔮',
          label: 'SECRET DISCOVERED',
        };
    }
  };
  
  const styles = getTypeStyles();
  
  return (
    <div className={`min-h-screen bg-gradient-to-br ${styles.bg} flex items-center justify-center p-4 relative overflow-hidden`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 0.8, bounce: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-black/40 backdrop-blur-xl border-white/20 overflow-hidden shadow-2xl">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 py-4 px-6 text-center relative overflow-hidden">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [1, 0.8, 1],
              }}
              transition={{ 
                repeat: Infinity,
                duration: 2,
              }}
              className="absolute inset-0 bg-gradient-to-r from-yellow-300/50 to-transparent"
            />
            <div className="relative flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6 text-white animate-pulse" />
              <span className="text-xl font-black text-white tracking-wider">
                {styles.label}!
              </span>
              <Sparkles className="h-6 w-6 text-white animate-pulse" />
            </div>
          </div>
          
          <CardContent className="p-6 space-y-6">
            {/* Icon */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <span className="text-7xl block mb-2">{styles.icon}</span>
            </motion.div>
            
            {/* Title */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <h1 className="text-2xl font-bold text-white mb-1">{qr.title}</h1>
              <p className="text-xs text-white/50">Scan #{qr.scanCount}</p>
            </motion.div>
            
            {/* Content Reveal */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: revealed ? 1 : 0, height: revealed ? 'auto' : 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="overflow-hidden"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                <p className="text-lg text-white text-center leading-relaxed">
                  {qr.content}
                </p>
              </div>
            </motion.div>
            
            {/* Task Button */}
            {qr.type === 'TASK' && revealed && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <Link href="/party/dashboard">
                  <Button 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-lg font-bold h-14"
                  >
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Complete Task
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            )}
            
            {/* Actions */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: revealed ? 1 : 0 }}
              transition={{ delay: 1 }}
              className="flex gap-3"
            >
              <Button 
                variant="outline" 
                className="flex-1 border-white/30 text-white hover:bg-white/10"
                onClick={handleShare}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Link href="/party/dashboard" className="flex-1">
                <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10">
                  <Eye className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            </motion.div>
          </CardContent>
        </Card>
        
        {/* Footer */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center text-white/50 text-xs mt-4"
        >
          Powered by FamilyVerse Party OS
        </motion.p>
      </motion.div>
    </div>
  );
}
