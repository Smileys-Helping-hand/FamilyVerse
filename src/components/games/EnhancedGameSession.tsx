'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RotateCcw, Plus, Minus, Trophy, Clock, Users, ArrowLeft,
  Maximize2, Minimize2, Shuffle, Save, Share2, Edit2, Check, Volume2, VolumeX,
  Award, TrendingUp, Zap, Target, SkipForward, Award as AwardIcon
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

export function EnhancedGameSession({ game, onExit }: GameSessionProps) {
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
    const saved = localStorage.getItem(`game-session-${game.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [
          { id: '1', name: 'Team 1', score: 0, color: 'from-blue-500 to-cyan-500', wins: 0 },
          { id: '2', name: 'Team 2', score: 0, color: 'from-purple-500 to-pink-500', wins: 0 },
        ];
      }
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
    const audioContext = typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext);
    if (!audioContext) return;
    
    try {
      const ctx = new audioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      if (type === 'complete') {
        oscillator.frequency.value = 880;
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
      } else if (type === 'point') {
        oscillator.frequency.value = 660;
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
      } else {
        oscillator.frequency.value = 523;
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
        setTimeout(() => {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.frequency.value = 659;
          gain2.gain.setValueAtTime(0.3, ctx.currentTime);
          osc2.start(ctx.currentTime);
          osc2.stop(ctx.currentTime + 0.5);
        }, 200);
      }
    } catch (error) {
      // Audio playback not available, continue silently
    }
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
      title: `🎮 Round ${currentRound + 1}!`,
      description: 'New round starting - timer reset',
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

  const awardPointToAll = () => {
    if (soundEnabled) playSound('point');
    setTeams((prev) => prev.map((team) => ({ ...team, score: team.score + 1 })));
    toast({
      title: '🎁 Everyone Scores!',
      description: '+1 point to all teams',
    });
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
      title: `🏆 ${team.name} Wins Round ${currentRound}!`,
      description: `Total Wins: ${team.wins + 1}`,
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
    toast({
      title: '✅ Team Added!',
      description: `${newTeamName} joined the game`,
    });
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
    localStorage.removeItem(`game-session-${game.id}`);
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
      .map((team, idx) => `${idx + 1}. ${team.name}: ${team.score} points (${team.wins} wins)`)
      .join('\n');
    
    const text = `🎮 ${game.name} - Round ${currentRound}\n\n${results}`;
    
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      toast({
        title: '📋 Copied to Clipboard!',
        description: 'Share your results',
      });
    }
  };

  const leader = teams.reduce((prev, current) =>
    prev.score > current.score ? prev : current
  );

  const totalPoints = teams.reduce((sum, team) => sum + team.score, 0);
  const avgScore = teams.length > 0 ? (totalPoints / teams.length).toFixed(1) : 0;

  return (
    <>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
        />
      )}
      
      <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 ${isFullscreen ? 'p-2' : 'p-4'}`}>
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <Button variant="ghost" size="sm" onClick={onExit} className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Button>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-lg px-4 py-1.5 bg-purple-500/20 text-purple-100 border-purple-400/50">
                Round {currentRound}
              </Badge>
              <h1 className="text-xl md:text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                {game.name}
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-white hover:bg-white/10"
                title="Toggle Sound"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-white hover:bg-white/10"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap gap-2 items-center justify-center">
            <Button
              onClick={startNextRound}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              size="sm"
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Next Round (N)
            </Button>
            <Button
              onClick={awardPointToAll}
              variant="outline"
              className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10"
              size="sm"
            >
              <Award className="w-4 h-4 mr-2" />
              +1 to All
            </Button>
            <Button
              onClick={shuffleTeams}
              variant="outline"
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
              size="sm"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Shuffle Teams
            </Button>
            <Button
              onClick={resetScores}
              variant="outline"
              className="border-orange-500/50 text-orange-300 hover:bg-orange-500/10"
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Scores
            </Button>
            <Button
              onClick={shareResults}
              variant="outline"
              className="border-blue-500/50 text-blue-300 hover:bg-blue-500/10"
              size="sm"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Timer Section */}
            <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Clock className="w-5 h-5 text-blue-400" />
                  Timer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Timer Display */}
                <motion.div
                  className={`text-6xl font-bold text-center py-8 rounded-lg ${
                    timeRemaining > 0 && timeRemaining < 30
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-slate-700/50 text-white'
                  }`}
                  animate={
                    timeRemaining > 0 && timeRemaining < 30
                      ? { scale: [1, 1.05, 1] }
                      : {}
                  }
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  {formatTime(timeRemaining)}
                </motion.div>

                {/* Timer Controls */}
                <div className="flex gap-2">
                  <Button
                    onClick={toggleTimer}
                    disabled={timeRemaining === 0}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
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
                  <Button
                    onClick={resetTimer}
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                {/* Quick Start Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 5, 10].map((min) => (
                    <Button
                      key={min}
                      onClick={() => startTimer(min)}
                      variant="outline"
                      className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                      size="sm"
                    >
                      {min}m
                    </Button>
                  ))}
                </div>

                {/* Custom Timer */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Custom Timer</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="60"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(Number(e.target.value))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Button
                      onClick={() => startTimer(customMinutes)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Start
                    </Button>
                  </div>
                </div>

                {/* Keyboard Shortcuts */}
                <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-700">
                  <div className="font-semibold text-slate-300">Shortcuts:</div>
                  <div>Space = Play/Pause</div>
                  <div>R = Reset | N = Next Round</div>
                  <div>1, 2, 5 = Quick Start</div>
                </div>
              </CardContent>
            </Card>

            {/* Scoreboard */}
            <Card className="lg:col-span-2 bg-slate-800/50 backdrop-blur border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Scoreboard
                  </CardTitle>
                  <div className="flex gap-2 text-sm text-slate-400">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Avg: {avgScore}
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      Total: {totalPoints}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <AnimatePresence>
                  {teams.map((team) => (
                    <motion.div
                      key={team.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`p-4 rounded-lg bg-gradient-to-r ${team.color} bg-opacity-20 border ${
                        team.id === leader.id ? 'border-yellow-400' : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          {editingTeamId === team.id ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                value={editingTeamName}
                                onChange={(e) => setEditingTeamName(e.target.value)}
                                className="bg-slate-900 border-slate-600 text-white"
                                onKeyDown={(e) => e.key === 'Enter' && saveTeamName()}
                                autoFocus
                              />
                              <Button
                                onClick={saveTeamName}
                                size="sm"
                                variant="ghost"
                                className="text-green-400 hover:bg-green-500/20"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl font-bold text-white">
                                    {team.name}
                                  </span>
                                  {team.id === leader.id && (
                                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">
                                      <Trophy className="w-3 h-3 mr-1" />
                                      Leading
                                    </Badge>
                                  )}
                                  {team.wins > 0 && (
                                    <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                                      {team.wins} {team.wins === 1 ? 'win' : 'wins'}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Button
                                onClick={() => startEditTeam(team)}
                                size="sm"
                                variant="ghost"
                                className="text-slate-400 hover:text-white hover:bg-slate-700"
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-4xl font-bold text-white min-w-[80px] text-center">
                            {team.score}
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            <Button
                              onClick={() => updateScore(team.id, 1)}
                              size="sm"
                              className="bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/50"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => updateScore(team.id, -1)}
                              size="sm"
                              variant="outline"
                              className="border-red-500/50 text-red-300 hover:bg-red-500/20"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex flex-col gap-1">
                            <Button
                              onClick={() => declareWinner(team.id)}
                              size="sm"
                              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                            >
                              <AwardIcon className="w-4 h-4" />
                            </Button>
                            {teams.length > 2 && (
                              <Button
                                onClick={() => removeTeam(team.id)}
                                size="sm"
                                variant="destructive"
                                className="bg-red-500/20 hover:bg-red-500/30"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Add Team */}
                <div className="flex gap-2 pt-2">
                  <Input
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="New team name..."
                    onKeyDown={(e) => e.key === 'Enter' && addTeam()}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  />
                  <Button
                    onClick={addTeam}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Team
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Instructions */}
          {!isFullscreen && (
            <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">📖 Game Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-invert max-w-none">
                  <div className="text-slate-300 whitespace-pre-wrap">{game.instructions}</div>
                </div>

                {game.variations && game.variations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">🎲 Variations:</h3>
                    <ul className="list-disc list-inside text-slate-300 space-y-1">
                      {game.variations.map((variation, idx) => (
                        <li key={idx}>{variation}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Separator className="bg-slate-700" />

                <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {game.players}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {game.duration}
                  </div>
                  <Badge variant="outline" className="border-slate-600 text-slate-300">
                    {game.difficulty}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bottom Actions */}
          <div className="flex justify-center gap-3 pb-4">
            <Button
              onClick={resetEverything}
              variant="outline"
              className="border-red-500/50 text-red-300 hover:bg-red-500/20"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Everything
            </Button>
            <Button
              onClick={() => {
                localStorage.setItem(`game-session-${game.id}`, JSON.stringify(teams));
                toast({
                  title: '💾 Game Saved!',
                  description: 'Progress saved to browser',
                });
              }}
              variant="outline"
              className="border-green-500/50 text-green-300 hover:bg-green-500/20"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Progress
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
