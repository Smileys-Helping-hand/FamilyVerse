'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getRecentClaimsAction } from '@/app/actions/smart-qr';
import { formatDistanceToNow } from 'date-fns';
import { Radio, TrendingUp, TrendingDown, Trophy } from 'lucide-react';

interface Claim {
  id: string;
  qrTitle: string;
  userName: string;
  points: number;
  wasFirstFinder: boolean;
  isTrap: boolean;
  claimedAt: Date;
}

export function RecentFindsTicker() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [latestClaimId, setLatestClaimId] = useState<string>('');
  const [isLive, setIsLive] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load claims and poll for updates
  useEffect(() => {
    const loadClaims = async () => {
      const data = await getRecentClaimsAction(15);
      
      // Check for new claims
      if (data.length > 0 && data[0].id !== latestClaimId) {
        if (latestClaimId) {
          // Play sound for new claim
          try {
            const sound = data[0].isTrap ? '/sounds/explosion.mp3' : '/sounds/ding.mp3';
            const audio = new Audio(sound);
            audio.volume = 0.5;
            audio.play().catch(() => {});
          } catch {}
        }
        setLatestClaimId(data[0].id);
      }
      
      setClaims(data);
    };

    loadClaims();
    
    // Poll every 5 seconds when live
    const interval = isLive ? setInterval(loadClaims, 5000) : null;
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLive, latestClaimId]);

  const getClaimStyle = (claim: Claim) => {
    if (claim.isTrap) {
      return {
        bg: 'bg-red-900/30 border-red-500/50',
        icon: '💥',
        badgeBg: 'bg-red-600',
      };
    }
    if (claim.wasFirstFinder) {
      return {
        bg: 'bg-yellow-900/30 border-yellow-500/50',
        icon: '🏆',
        badgeBg: 'bg-yellow-600',
      };
    }
    return {
      bg: 'bg-green-900/30 border-green-500/50',
      icon: '✨',
      badgeBg: 'bg-green-600',
    };
  };

  return (
    <Card className="bg-black/40 border-purple-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Radio className={`w-5 h-5 ${isLive ? 'text-red-500 animate-pulse' : 'text-gray-500'}`} />
            Recent Finds
          </span>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`text-xs px-3 py-1 rounded-full ${
              isLive ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400'
            }`}
          >
            {isLive ? '● LIVE' : '○ PAUSED'}
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[400px] overflow-y-auto space-y-2">
        <AnimatePresence initial={false}>
          {claims.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No finds yet. The hunt is on!</p>
          ) : (
            claims.map((claim, index) => {
              const style = getClaimStyle(claim);
              return (
                <motion.div
                  key={claim.id}
                  initial={index === 0 ? { x: -100, opacity: 0 } : { opacity: 1 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 100, opacity: 0 }}
                  transition={{ type: 'spring', damping: 20 }}
                  className={`p-3 rounded-lg border ${style.bg} flex items-center gap-3`}
                >
                  {/* Icon */}
                  <span className="text-2xl">{style.icon}</span>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white truncate">{claim.userName}</span>
                      <span className="text-gray-400 text-sm">found</span>
                      <span className="text-purple-400 text-sm truncate">'{claim.qrTitle}'</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {claim.wasFirstFinder && (
                        <Badge className="bg-yellow-600 text-xs">
                          <Trophy className="w-3 h-3 mr-1" />
                          FIRST!
                        </Badge>
                      )}
                      <span className="text-gray-500 text-xs">
                        {formatDistanceToNow(new Date(claim.claimedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  
                  {/* Points */}
                  <div className={`flex items-center gap-1 font-bold ${
                    claim.points > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {claim.points > 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span>{claim.points > 0 ? '+' : ''}{claim.points}</span>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
