'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Skull, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getAlivePlayersAction, killPlayerAction } from '@/app/actions/party-logic';
import { useToast } from '@/hooks/use-toast';

interface Player {
  id: string;
  name: string;
  avatarUrl: string | null;
  status: string;
  role: string;
}

interface KillMenuProps {
  imposterId: string;
}

export function KillMenu({ imposterId }: KillMenuProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<Player | null>(null);
  const [killing, setKilling] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadPlayers();
    const interval = setInterval(loadPlayers, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadPlayers = async () => {
    const result = await getAlivePlayersAction();
    if (result.success && result.players) {
      // Filter out the imposter themselves
      setPlayers(result.players.filter((p: Player) => p.id !== imposterId) as Player[]);
    }
  };

  const handleKill = async () => {
    if (!selectedTarget) return;

    setKilling(true);

    const result = await killPlayerAction(imposterId, selectedTarget.id);

    if (result.success) {
      toast({
        title: '💀 Elimination Successful',
        description: `${selectedTarget.name} has been eliminated`,
      });

      setSelectedTarget(null);
      await loadPlayers();

      // Start 30s cooldown
      setCooldownRemaining(30);
      const countdownInterval = setInterval(() => {
        setCooldownRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      toast({
        title: '❌ Failed',
        description: result.error,
        variant: 'destructive',
      });
    }

    setKilling(false);
  };

  return (
    <>
      <Card className="border-red-500/50 bg-gradient-to-br from-red-950/20 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-500">
            <Skull className="w-5 h-5" />
            Imposter Control
          </CardTitle>
          {cooldownRemaining > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1 w-fit">
              <Clock className="w-3 h-3" />
              Cooldown: {cooldownRemaining}s
            </Badge>
          )}
        </CardHeader>

        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <AlertTriangle className="w-4 h-4" />
              Select a target carefully. 30s cooldown after each kill.
            </div>

            {players.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No alive players found. Victory is near...
              </p>
            ) : (
              <div className="grid gap-2">
                {players.map((player) => (
                  <motion.div
                    key={player.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-between h-auto py-3 hover:bg-red-950/30 hover:border-red-500/50"
                      onClick={() => setSelectedTarget(player)}
                      disabled={cooldownRemaining > 0}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                          {player.name[0]}
                        </div>
                        <span className="font-medium">{player.name}</span>
                      </div>
                      <Skull className="w-4 h-4 text-red-500" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={!!selectedTarget} onOpenChange={() => setSelectedTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <Skull className="w-5 h-5" />
              Confirm Elimination
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to eliminate <strong>{selectedTarget?.name}</strong>?
              <br />
              This action cannot be undone. They will become a ghost.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTarget(null)} disabled={killing}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleKill}
              disabled={killing}
              className="gap-2"
            >
              {killing ? (
                'Eliminating...'
              ) : (
                <>
                  <Skull className="w-4 h-4" />
                  Eliminate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
