'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, TrendingUp, User } from 'lucide-react';
import { placeBetAction, getAllPartyUsersAction, getUserBetsAction } from '@/app/actions/party-logic';
import { usePartySocket } from '@/hooks/use-party-socket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

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
  const { bind } = usePartySocket('betting');
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

  useEffect(() => {
    loadData();
    
    bind('bet-placed', () => {
      loadData();
    });
    
    bind('bets-settled', () => {
      loadData();
      toast({
        title: '🎰 Bets Settled!',
        description: 'Check your winnings',
      });
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
            <Badge variant="outline" className="text-lg">
              {currentUser.walletBalance} coins
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                  disabled={placingBet !== null || currentUser.walletBalance < 100}
                  className="w-full"
                  size="sm"
                >
                  {placingBet === user.id ? 'Placing...' : 'Bet 100'}
                </Button>
              </motion.div>
            ))}
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
    </div>
  );
}
