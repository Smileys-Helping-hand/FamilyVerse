'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Play, Vote, UserX, Crown, AlertCircle, Trophy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  getGameState,
  startGame,
  startVoting,
  castVote,
  eliminatePlayer,
  getPlayerRole,
} from '@/app/actions/imposter-game';
import { RoleRevealCard } from './RoleRevealCard';

interface ImposterDashboardProps {
  sessionId: string;
  userId: string;
  isHost: boolean;
}

type GameStatus = 'LOBBY' | 'ACTIVE' | 'VOTE' | 'ENDED';

interface Player {
  id: number;
  userId: string;
  userName: string;
  isAlive: boolean;
  votesReceived: number;
}

interface GameState {
  session: {
    id: string;
    status: GameStatus;
    round: number;
  };
  players: Player[];
}

export function ImposterDashboard({ sessionId, userId, isHost }: ImposterDashboardProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerRole, setPlayerRole] = useState<{
    role: 'CIVILIAN' | 'IMPOSTER';
    information: string;
    isAlive: boolean;
  } | null>(null);
  const [selectedVote, setSelectedVote] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showRoleReveal, setShowRoleReveal] = useState(false);

  const fetchGameState = async () => {
    const result = await getGameState(sessionId);
    if (result.success && result.data) {
      setGameState(result.data);
      
      // If game is active and we haven't fetched role yet
      if (result.data.session.status !== 'LOBBY' && !playerRole) {
        fetchPlayerRole();
      }
    }
    setLoading(false);
  };

  const fetchPlayerRole = async () => {
    const result = await getPlayerRole(sessionId, userId);
    if (result.success && result.data) {
      setPlayerRole(result.data);
      setShowRoleReveal(true);
    }
  };

  useEffect(() => {
    fetchGameState();
    const interval = setInterval(fetchGameState, 3000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const handleStartGame = async () => {
    const result = await startGame(sessionId);
    if (result.success) {
      await fetchGameState();
      await fetchPlayerRole();
    }
  };

  const handleStartVoting = async () => {
    const result = await startVoting(sessionId);
    if (result.success) {
      await fetchGameState();
    }
  };

  const handleCastVote = async () => {
    if (!selectedVote) return;
    
    const result = await castVote(sessionId, userId, selectedVote);
    if (result.success) {
      setSelectedVote('');
      await fetchGameState();
    }
  };

  const handleEliminatePlayer = async () => {
    const result = await eliminatePlayer(sessionId);
    if (result.success) {
      await fetchGameState();
      
      // Show result
      if (result.data?.winner) {
        alert(`Game Over! ${result.data.winner} wins!`);
      } else {
        alert(
          `${result.data?.eliminated.userName} (${result.data?.eliminated.role}) was eliminated!`
        );
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading game...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!gameState) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load game state</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Show role reveal screen when game starts
  if (showRoleReveal && playerRole && gameState.session.status === 'ACTIVE') {
    return (
      <RoleRevealCard
        role={playerRole.role}
        information={playerRole.information}
        onRevealed={() => {
          setTimeout(() => setShowRoleReveal(false), 5000);
        }}
      />
    );
  }

  const alivePlayers = gameState.players.filter((p) => p.isAlive);
  const deadPlayers = gameState.players.filter((p) => !p.isAlive);

  return (
    <div className="space-y-6">
      {/* Game Status Card */}
      <Card className="border-2 border-purple-500/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Imposter Game
              </CardTitle>
              <CardDescription>
                Session ID: {sessionId.slice(0, 8)}...
              </CardDescription>
            </div>
            <Badge
              variant={
                gameState.session.status === 'ACTIVE'
                  ? 'default'
                  : gameState.session.status === 'LOBBY'
                  ? 'outline'
                  : 'secondary'
              }
              className="text-lg px-4 py-1"
            >
              {gameState.session.status}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Lobby State */}
      {gameState.session.status === 'LOBBY' && (
        <Card>
          <CardHeader>
            <CardTitle>Waiting for Players...</CardTitle>
            <CardDescription>
              {gameState.players.length} players joined. Need at least 3 to start.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {gameState.players.map((player) => (
                <div
                  key={player.userId}
                  className="p-3 bg-muted rounded-lg flex items-center gap-2"
                >
                  <Avatar>
                    <AvatarFallback>
                      {player.userName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{player.userName}</span>
                </div>
              ))}
            </div>

            {isHost && gameState.players.length >= 3 && (
              <Button onClick={handleStartGame} size="lg" className="w-full">
                <Play className="mr-2 h-4 w-4" />
                Start Game
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active Game State */}
      {(gameState.session.status === 'ACTIVE' ||
        gameState.session.status === 'VOTE') && (
        <>
          {/* Your Status */}
          {playerRole && (
            <Card
              className={
                playerRole.role === 'IMPOSTER'
                  ? 'border-red-500/50'
                  : 'border-green-500/50'
              }
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Your Role:</p>
                    <p
                      className={`text-lg font-bold ${
                        playerRole.role === 'IMPOSTER'
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      {playerRole.role}
                    </p>
                  </div>
                  <Badge
                    variant={playerRole.isAlive ? 'default' : 'secondary'}
                  >
                    {playerRole.isAlive ? '✅ Alive' : '💀 Eliminated'}
                  </Badge>
                </div>
                <div className="mt-2 p-3 bg-muted rounded">
                  <p className="text-sm">
                    <strong>
                      {playerRole.role === 'IMPOSTER' ? 'Hint:' : 'Topic:'}
                    </strong>{' '}
                    {playerRole.information}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Players List */}
          <Card>
            <CardHeader>
              <CardTitle>Players ({alivePlayers.length} alive)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <AnimatePresence>
                {alivePlayers.map((player) => (
                  <motion.div
                    key={player.userId}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-3 bg-muted rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {player.userName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{player.userName}</p>
                        {gameState.session.status === 'VOTE' && (
                          <p className="text-sm text-muted-foreground">
                            {player.votesReceived} votes
                          </p>
                        )}
                      </div>
                    </div>
                    {player.userId === userId && (
                      <Badge variant="outline">You</Badge>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {deadPlayers.length > 0 && (
                <>
                  <div className="pt-3 border-t">
                    <p className="text-sm text-muted-foreground mb-2">
                      Eliminated:
                    </p>
                    {deadPlayers.map((player) => (
                      <div
                        key={player.userId}
                        className="p-2 opacity-50 flex items-center gap-2"
                      >
                        <UserX className="h-4 w-4" />
                        <span className="text-sm">{player.userName}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Voting Interface */}
          {gameState.session.status === 'VOTE' && playerRole?.isAlive && (
            <Card className="border-yellow-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Vote className="h-5 w-5" />
                  Cast Your Vote
                </CardTitle>
                <CardDescription>
                  Vote for who you think is the imposter
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={selectedVote} onValueChange={setSelectedVote}>
                  {alivePlayers
                    .filter((p) => p.userId !== userId)
                    .map((player) => (
                      <div
                        key={player.userId}
                        className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted"
                      >
                        <RadioGroupItem
                          value={player.userId}
                          id={player.userId}
                        />
                        <Label
                          htmlFor={player.userId}
                          className="flex-1 cursor-pointer"
                        >
                          {player.userName}
                        </Label>
                      </div>
                    ))}
                </RadioGroup>

                <Button
                  onClick={handleCastVote}
                  disabled={!selectedVote}
                  className="w-full"
                  size="lg"
                >
                  Submit Vote
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Host Controls */}
          {isHost && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Host Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {gameState.session.status === 'ACTIVE' && (
                  <Button
                    onClick={handleStartVoting}
                    variant="outline"
                    className="w-full"
                  >
                    <Vote className="mr-2 h-4 w-4" />
                    Start Voting Phase
                  </Button>
                )}

                {gameState.session.status === 'VOTE' && (
                  <Button
                    onClick={handleEliminatePlayer}
                    variant="destructive"
                    className="w-full"
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Eliminate Player (Most Votes)
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Game Ended */}
      {gameState.session.status === 'ENDED' && (
        <Card className="border-2 border-yellow-500">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Game Over!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
            <p className="text-lg">Check the results above!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
