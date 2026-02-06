'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Minus, 
  Trophy, 
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Timer as TimerIcon,
  Maximize2,
  Minimize2,
  Shuffle,
  Zap,
  Save,
  Share2,
  Edit2,
  Check,
  Volume2,
  VolumeX,
  Award,
  Target,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import Confetti from 'react-confetti';
import type { PartyGame } from '@/lib/data/games';

interface GameSessionProps {
  game: PartyGame;
  onExit: () => void;
}

interface Team {
  id: string;
  name: string;
  score: number;
  color: string;
  wins: number;
}

export function GameSession({ game, onExit }: GameSessionProps) {
  const { toast } = useToast();
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(5);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentRound, setCurrentRound] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingTeamName, setEditingTeamName] = useState('');
  
  const [teams, setTeams] = useState<Team[]>(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem(`game-session-${game.id}`);
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      { id: '1', name: 'Team 1', score: 0, color: 'from-blue-500 to-cyan-500', wins: 0 },
      { id: '2', name: 'Team 2', score: 0, color: 'from-purple-500 to-pink-500', wins: 0 },
    ];
  });
  
  const [newTeamName, setNewTeamName] = useState('');

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem(`game-session-${game.id}`, JSON.stringify(teams));
  }, [teams, game.id]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      if (e.code === 'Space') {
        e.preventDefault();
        if (timeRemaining > 0) toggleTimer();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        resetTimer();
      } else if (e.code === 'KeyN') {
        e.preventDefault();
        startNextRound();
      } else if (e.code === 'Digit1') {
        e.preventDefault();
        startTimer(1);
      } else if (e.code === 'Digit2') {
        e.preventDefault();
        startTimer(2);
      } else if (e.code === 'Digit5') {
        e.preventDefault();
        startTimer(5);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [timeRemaining]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            if (soundEnabled) playSound('complete');
            toast({
              title: '⏰ Time\'s Up!',
              description: 'Round finished!',
              duration: 5000,
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemaining, soundEnabled, toast]);

  const playSound = useCallback((type: 'complete' | 'point' | 'win') => {
    if (!soundEnabled) return;
    const audio = new Audio();
    // Using data URLs for simple beeps
    if (type === 'complete') {
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGmi87eeeTRAMUKfj8LZjHAU4kdfyz3osBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUrgs7y2Ik2CBlou+3nnk0QDFC='
    } else if (type === 'point') {
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGmi87eeeTRAMUKfj8LZjHAU4kdfyz3osBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUrgs7y2Ik2CBlou+3nnk0QDFC='
    } else {
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGmi87eeeTRAMUKfj8LZjHAU4kdfyz3osBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUrgs7y2Ik2CBlou+3nnk0QDFC='
    }
    audio.play().catch(() => {});
  }, [soundEnabled]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = (minutes: number) => {
    setTimeRemaining(minutes * 60);
    setIsTimerRunning(true);
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeRemaining(customMinutes * 60);
  };

  const startNextRound = () => {
    setCurrentRound((prev) => prev + 1);
    resetTimer();
    toast({
      title: `🎮 Round ${currentRound + 1} Starting!`,
      description: 'Timer reset - good luck!',
    });
  };

  const updateScore = (teamId: string, delta: number) => {
    if (soundEnabled && delta > 0) playSound('point');
    setTeams((prev) =>
      prev.map((team) =>
        team.id === teamId
          ? { ...team, score: Math.max(0, team.score + delta) }
          : team
      )
    );
  };

  const declareWinner = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId ? { ...t, wins: t.wins + 1 } : t
      )
    );

    setShowConfetti(true);
    if (soundEnabled) playSound('win');
    
    toast({
      title: `🏆 ${team.name} Wins!`,
      description: `Victory in Round ${currentRound}!`,
      duration: 5000,
    });

    setTimeout(() => setShowConfetti(false), 5000);
  };

  const addTeam = () => {
    if (!newTeamName.trim()) {
      toast({
        title: '❌ Name Required',
        description: 'Enter a team name',
        variant: 'destructive',
      });
      return;
    }

    const colors = [
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-yellow-500 to-amber-500',
      'from-indigo-500 to-purple-500',
      'from-pink-500 to-rose-500',
      'from-teal-500 to-cyan-500',
    ];

    setTeams((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newTeamName,
        score: 0,
        wins: 0,
        color: colors[prev.length % colors.length],
      },
    ]);
    setNewTeamName('');
  };

  const removeTeam = (teamId: string) => {
    if (teams.length <= 2) {
      toast({
        title: '⚠️ Minimum Teams',
        description: 'Need at least 2 teams',
        variant: 'destructive',
      });
      return;
    }
    setTeams((prev) => prev.filter((team) => team.id !== teamId));
  };

  const resetScores = () => {
    setTeams((prev) => prev.map((team) => ({ ...team, score: 0 })));
    toast({
      title: '🔄 Scores Reset',
      description: 'All teams back to 0',
    });
  };

  const resetEverything = () => {
    setTeams((prev) => prev.map((team) => ({ ...team, score: 0, wins: 0 })));
    setCurrentRound(1);
    resetTimer();
    toast({
      title: '🔄 Full Reset',
      description: 'New game started!',
    });
  };

  const shuffleTeams = () => {
    setTeams((prev) => [...prev].sort(() => Math.random() - 0.5));
    toast({
      title: '🎲 Teams Shuffled!',
      description: 'Playing order randomized',
    });
  };

  const startEditTeam = (team: Team) => {
    setEditingTeamId(team.id);
    setEditingTeamName(team.name);
  };

  const saveTeamName = () => {
    if (!editingTeamName.trim()) return;
    setTeams((prev) =>
      prev.map((team) =>
        team.id === editingTeamId ? { ...team, name: editingTeamName } : team
      )
    );
    setEditingTeamId(null);
  };

  const shareResults = () => {
    const results = teams
      .sort((a, b) => b.score - a.score)
      .map((team, idx) => `${idx + 1}. ${team.name}: ${team.score} points`)
      .join('\n');
    
    const text = `🎮 ${game.name} Results:\n${results}\n\nRound ${currentRound}`;
    
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      toast({
        title: '📋 Copied!',
        description: 'Results copied to clipboard',
      });
    }
  };

  const leader = teams.reduce((prev, current) =>
    prev.score > current.score ? prev : current
  );

  const totalPoints = teams.reduce((sum, team) => sum + team.score, 0);
  const avgScore = teams.length > 0 ? (totalPoints / teams.length).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={onExit}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Games
          </Button>
          <Badge variant="default" className="text-lg px-4 py-2">
            🎮 {game.name}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Timer & Instructions */}
          <div className="space-y-6">
            {/* Timer Card */}
            <Card className="border-2 border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Game Timer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <motion.div
                    animate={isTimerRunning ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                    className={`
                      text-6xl font-bold mb-4
                      ${timeRemaining < 30 && isTimerRunning ? 'text-red-500 animate-pulse' : 'text-primary'}
                    `}
                  >
                    {formatTime(timeRemaining)}
                  </motion.div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={toggleTimer}
                    disabled={timeRemaining === 0}
                    className="flex-1"
                    size="lg"
                  >
                    {isTimerRunning ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                  <Button onClick={resetTimer} variant="outline" size="lg">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Quick Start</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 5, 10].map((mins) => (
                      <Button
                        key={mins}
                        onClick={() => startTimer(mins)}
                        variant="outline"
                        size="sm"
                      >
                        {mins}m
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Custom Timer (minutes)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="60"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 1)}
                      className="w-20"
                    />
                    <Button onClick={() => startTimer(customMinutes)} className="flex-1">
                      Set {customMinutes}m
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How to Play</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 text-sm">
                  {game.instructions.map((instruction, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="font-bold text-primary">{idx + 1}.</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Game Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Game Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Players:</span>
                  <span className="font-semibold">{game.minPlayers}-{game.maxPlayers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-semibold">{game.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Difficulty:</span>
                  <Badge variant="outline">{game.difficulty}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Score Manager */}
          <div className="lg:col-span-2 space-y-6">
            {/* Scoreboard */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Scoreboard
                  </CardTitle>
                  <Button onClick={resetScores} variant="outline" size="sm">
                    Reset All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {teams.map((team, index) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className={`
                      relative overflow-hidden rounded-xl border-2 p-4
                      ${team.score === leader.score && leader.score > 0 ? 'border-yellow-400 shadow-lg shadow-yellow-400/50' : 'border-border'}
                    `}>
                      <div className={`
                        absolute inset-0 bg-gradient-to-r opacity-10
                        ${team.color}
                      `} />
                      
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-xl
                            ${team.color}
                          `}>
                            {team.name[0]}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{team.name}</h3>
                            {team.score === leader.score && leader.score > 0 && (
                              <Badge variant="default" className="bg-yellow-500">
                                🏆 Leading
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => updateScore(team.id, -1)}
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <div className="text-4xl font-bold w-20 text-center">
                              {team.score}
                            </div>
                            <Button
                              onClick={() => updateScore(team.id, 1)}
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          {teams.length > 2 && (
                            <Button
                              onClick={() => removeTeam(team.id)}
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700"
                            >
                              <XCircle className="w-5 h-5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <Separator />

                {/* Add Team */}
                <div className="flex gap-2">
                  <Input
                    placeholder="New team name..."
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTeam()}
                  />
                  <Button onClick={addTeam} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Team
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Variations */}
            {game.variations && game.variations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Fun Variations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {game.variations.map((variation, idx) => (
                      <li key={idx} className="flex gap-2 text-sm">
                        <span className="text-primary font-bold">•</span>
                        <span>{variation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
