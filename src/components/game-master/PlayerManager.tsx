'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  getActivePlayers,
  forceKillPlayer,
  reassignPlayerRole,
} from '@/app/actions/game-master';
import { Users, Skull, RefreshCw, Heart, Ghost } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PlayerManagerProps {
  sessionId: string;
  eventId: number;
}

export function PlayerManager({ sessionId, eventId }: PlayerManagerProps) {
  const { toast } = useToast();
  const [players, setPlayers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      loadPlayers();
      const interval = setInterval(loadPlayers, 5000); // Refresh every 5s
      return () => clearInterval(interval);
    }
  }, [sessionId]);

  const loadPlayers = async () => {
    if (!sessionId) return;
    
    const result = await getActivePlayers(sessionId);
    if (result.success) {
      setPlayers(result.data);
      setIsLoading(false);
    }
  };

  const handleForceKill = async (userId: string, userName: string) => {
    const result = await forceKillPlayer(sessionId, userId);
    if (result.success) {
      await loadPlayers();
      toast({
        title: 'Player Eliminated',
        description: `${userName} has been removed from the game`,
      });
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleReassignRole = async (userId: string, newRole: 'CIVILIAN' | 'IMPOSTER') => {
    const result = await reassignPlayerRole(sessionId, userId, newRole);
    if (result.success) {
      await loadPlayers();
      toast({
        title: 'Role Reassigned',
        description: `Player role changed to ${newRole}`,
      });
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  if (!sessionId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p>No active game session</p>
            <p className="text-sm mt-2">Start a game to manage players</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-500" />
          Player Management
        </CardTitle>
        <CardDescription>
          {players.length} player{players.length !== 1 ? 's' : ''} in session
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Loading players...</p>
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p>No players in this session yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {players.map((player) => (
              <div
                key={player.id}
                className={`p-4 border rounded-lg ${
                  player.isAlive 
                    ? 'bg-slate-800 border-slate-700' 
                    : 'bg-slate-900/50 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-lg">
                        {player.userName}
                      </h4>
                      {!player.isAlive && (
                        <Ghost className="h-4 w-4 text-slate-500" />
                      )}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Badge
                        variant={player.role === 'IMPOSTER' ? 'destructive' : 'default'}
                      >
                        {player.role}
                      </Badge>
                      <Badge variant={player.isAlive ? 'default' : 'secondary'}>
                        {player.isAlive ? (
                          <>
                            <Heart className="h-3 w-3 mr-1" />
                            Alive
                          </>
                        ) : (
                          <>
                            <Skull className="h-3 w-3 mr-1" />
                            Eliminated
                          </>
                        )}
                      </Badge>
                      {player.votesReceived > 0 && (
                        <Badge variant="outline">
                          {player.votesReceived} vote{player.votesReceived !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {/* Reassign Role (Lobby only) */}
                    <Select
                      value={player.role}
                      onValueChange={(v) => handleReassignRole(player.userId, v as any)}
                    >
                      <SelectTrigger className="w-32">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CIVILIAN">Civilian</SelectItem>
                        <SelectItem value="IMPOSTER">Imposter</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Force Kill */}
                    {player.isAlive && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Skull className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Eliminate Player?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove {player.userName} from the game. Use this if someone leaves the event.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleForceKill(player.userId, player.userName)}
                            >
                              Eliminate
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
