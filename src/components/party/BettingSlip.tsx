'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, TrendingUp, User, Lock } from 'lucide-react';
import {
  placeBetAction,
  getAllPartyUsersAction,
  getUserBetsAction,
  getActiveRaceStateAction,
} from '@/app/actions/party-logic';
import { usePartySocket } from '@/hooks/use-party-socket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { playSound } from '@/lib/audio-utils';

interface PartyUser {
  id: string;
  name: string;
  avatarUrl: string | null;
  walletBalance: number;
}

interface UserBet {
  id: string;
  gameTitle: string;
  targetName: string;
  amount: number;
  status: string;
  payout: number | null;
  createdAt: Date;
}

export function BettingSlip({ currentUser }: { currentUser: PartyUser }) {
  const [users, setUsers] = useState<PartyUser[]>([]);
  const [myBets, setMyBets] = useState<UserBet[]>([]);
  const [loading, setLoading] = useState(true);
  const [placingBet, setPlacingBet] = useState<string | null>(null);
  const [bettingOpen, setBettingOpen] = useState(false);
  const [raceState, setRaceState] = useState('PENDING');
  const [bettingClosed, setBettingClosed] = useState(false);
  const [gateActive, setGateActive] = useState(false);
  const wasLockedRef = useRef(false);
  const { bind: bindBetting } = usePartySocket('betting');
  const { bind: bindRacing } = usePartySocket('sim-racing');
  const { toast } = useToast();

  const loadData = async () => {
    const [usersResult, betsResult] = await Promise.all([
      getAllPartyUsersAction(),
      getUserBetsAction(),
    ]);
    
    if (usersResult.success && usersResult.users) {
      // Filter out current user
      setUsers(usersResult.users.filter((u: PartyUser) => u.id !== currentUser.id));
    }
    
    if (betsResult.success && betsResult.bets) {
      setMyBets(betsResult.bets as any);
    }
    
    setLoading(false);
  };

  const loadRaceState = async () => {
    const result = await getActiveRaceStateAction();
    if (result.success && result.game) {
      setRaceState(result.game.raceState);
      setBettingClosed(result.game.bettingClosed);
      setBettingOpen(result.game.raceState === 'OPEN_FOR_BETS' || result.game.raceState === 'BETTING_OPEN');
    }
  };

  useEffect(() => {
    loadData();
    loadRaceState();
    
    bindBetting('bet-placed', () => {
      loadData();
    });
    
    bindBetting('bets-settled', () => {
      loadData();
      toast({
        title: '🎰 Bets Settled!',
        description: 'Check your winnings',
      });
    });

    bindRacing('betting-open', () => {
      setRaceState('OPEN_FOR_BETS');
      setBettingClosed(false);
      setBettingOpen(true);
    });

    bindRacing('betting-opened', () => {
      setRaceState('OPEN_FOR_BETS');
      setBettingClosed(false);
      setBettingOpen(true);
    });

    bindRacing('race-started', () => {
      setRaceState('LIVE');
      setBettingClosed(true);
      setBettingOpen(false);
    });
  }, []);

  const handleBet = async (targetUserId: string, amount: number) => {
    setPlacingBet(targetUserId);
    
    const result = await placeBetAction(targetUserId, amount);
    
    if (result.success) {
      toast({
        title: '✅ Bet Placed!',
        description: `You bet ${amount} coins`,
      });
      await loadData();
    } else {
      toast({
        title: '❌ Bet Failed',
        description: result.error,
        variant: 'destructive',
      });
    }
    
    setPlacingBet(null);
  };

  const isLocked = bettingClosed || raceState === 'LIVE' || raceState === 'RACE_STARTED';

  useEffect(() => {
    if (isLocked && !wasLockedRef.current) {
      setGateActive(true);
      playSound('/sounds/jail_cell_close.mp3', 0.7);
      setTimeout(() => setGateActive(false), 1200);
    }
    wasLockedRef.current = isLocked;
  }, [isLocked]);

  if (loading) {
    return <div className="text-center py-8">Loading betting slip...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Coins className="w-5 h-5" />
              Betting Slip
            </span>
            <div className="flex items-center gap-2">
              {bettingOpen && !isLocked && (
                <Badge variant="default" className="text-xs">Betting Live</Badge>
              )}
              {isLocked && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Races Started
                </Badge>
              )}
              <Badge variant="outline" className="text-lg">
                {currentUser.walletBalance} coins
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {(isLocked || gateActive) && (
              <div className={`betting-gate ${gateActive ? 'gate-slam' : ''}`}>
                <div className="gate-metal" />
                <div className="gate-stamp">NO MORE BETS</div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
            {users.map((user) => (
              <motion.div
                key={user.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-4 border rounded-lg bg-card hover:border-primary cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 mb-3">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{user.name}</div>
                  </div>
                </div>
                <Button
                  onClick={() => handleBet(user.id, 100)}
                  disabled={placingBet !== null || currentUser.walletBalance < 100 || isLocked || !bettingOpen}
                  className="w-full"
                  size="sm"
                >
                  {isLocked
                    ? '🔒 RACE LIVE'
                    : !bettingOpen
                    ? 'Betting Closed'
                    : placingBet === user.id
                    ? 'Placing...'
                    : 'Bet 100'}
                </Button>
              </motion.div>
            ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {myBets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              My Bets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {myBets.slice(0, 5).map((bet) => (
                <div
                  key={bet.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                >
                  <div>
                    <div className="font-medium">{bet.targetName}</div>
                    <div className="text-xs text-muted-foreground">
                      {bet.amount} coins
                    </div>
                  </div>
                  <Badge
                    variant={
                      bet.status === 'WON'
                        ? 'default'
                        : bet.status === 'LOST'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {bet.status === 'WON'
                      ? `+${bet.payout}`
                      : bet.status === 'LOST'
                      ? '-' + bet.amount
                      : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <style jsx>{`
        .betting-gate {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          pointer-events: none;
          z-index: 10;
        }

        .gate-metal {
          position: absolute;
          inset: 0;
          transform: translateY(-100%);
          background: repeating-linear-gradient(
              90deg,
              rgba(40, 40, 40, 0.92) 0,
              rgba(40, 40, 40, 0.92) 10px,
              rgba(20, 20, 20, 0.92) 10px,
              rgba(20, 20, 20, 0.92) 20px
            );
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: inset 0 -8px 20px rgba(0, 0, 0, 0.4);
        }

        .gate-slam .gate-metal {
          animation: gateSlam 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        .gate-stamp {
          position: relative;
          padding: 12px 24px;
          border: 3px solid rgba(239, 68, 68, 0.8);
          color: rgba(239, 68, 68, 0.9);
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          transform: rotate(-15deg) scale(0.8);
          opacity: 0;
          font-family: "Impact", "Arial Black", sans-serif;
          background: rgba(10, 10, 10, 0.7);
          box-shadow: 0 0 12px rgba(239, 68, 68, 0.4);
        }

        .gate-slam .gate-stamp {
          animation: stampIn 0.4s ease-out 0.4s forwards;
        }

        @keyframes gateSlam {
          0% {
            transform: translateY(-100%);
          }
          70% {
            transform: translateY(0%);
          }
          100% {
            transform: translateY(0%);
          }
        }

        @keyframes stampIn {
          0% {
            opacity: 0;
            transform: rotate(-15deg) scale(1.4);
          }
          100% {
            opacity: 1;
            transform: rotate(-15deg) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
