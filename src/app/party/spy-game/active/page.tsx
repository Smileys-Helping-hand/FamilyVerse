"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Timer, 
  AlertTriangle, 
  Lightbulb, 
  Home,
  Volume2,
  VolumeX,
  Flag,
  FileText,
  ListChecks
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getRandomHint, CategoryName } from "@/lib/spy-game-data";
import { useAuth } from "@/context/AuthContext";

interface GameConfig {
  numPlayers: number;
  numSpies: number;
  timerMinutes: number;
  category: CategoryName;
  playerNames: string[];
  chaosMode?: boolean;
}

interface PlayerAssignment {
  name: string;
  isSpy: boolean;
  word?: string;
}

interface GameData {
  secretWord: string;
  assignments: PlayerAssignment[];
}

export default function SpyGameActive() {
  const router = useRouter();
  const { toast } = useToast();
  const { user: firebaseUser } = useAuth();
  const isAdmin = firebaseUser?.email === "mraaziqp@gmail.com";
  
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [tenMinuteWarningShown, setTenMinuteWarningShown] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [currentHint, setCurrentHint] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [chaosEvent, setChaosEvent] = useState<string | null>(null);
  const [speedRoundActive, setSpeedRoundActive] = useState(false);
  const [inquisitorTarget, setInquisitorTarget] = useState<string | null>(null);
  const [intelNotes, setIntelNotes] = useState("");
  const [intelFlagInput, setIntelFlagInput] = useState("");
  const [intelFlags, setIntelFlags] = useState<string[]>([]);
  const [intelChecklist, setIntelChecklist] = useState<Record<string, boolean>>({});

  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);
  const sirenAudioRef = useRef<HTMLAudioElement | null>(null);
  const chaosTimerRef = useRef<NodeJS.Timeout | null>(null);

  const intelChecklistItems = [
    "Avoided eye contact",
    "Over-explained a detail",
    "Mirrored last speaker",
    "Changed their story",
    "Too specific too fast",
  ];

  const intelPrompts = [
    "Hesitated on the word",
    "Asked for repeats",
    "Deflected with jokes",
    "Followed the crowd",
  ];

  // Load game config and start timer
  useEffect(() => {
    const configStr = localStorage.getItem("spyGameConfig");
    const assignmentsStr = localStorage.getItem("spyGameAssignments");

    if (!configStr || !assignmentsStr) {
      router.push("/party/spy-game/setup");
      return;
    }

    const config: GameConfig = JSON.parse(configStr);
    const data: GameData = JSON.parse(assignmentsStr);

    setGameConfig(config);
    setGameData(data);
    setTimeRemaining(config.timerMinutes * 60); // Convert to seconds

    // Preload audio
    if (typeof window !== "undefined") {
      alarmAudioRef.current = new Audio("/sounds/alarm.mp3");
      sirenAudioRef.current = new Audio("/sounds/emergency.mp3");
    }

    // Start chaos mode if enabled
    if (config.chaosMode) {
      startChaosMode();
    }
  }, [router]);

  useEffect(() => {
    if (!gameConfig || !gameData) {
      return;
    }

    const baseKey = `spy-intel:${gameConfig.category}:${gameData.secretWord}`;
    const savedNotes = localStorage.getItem(`${baseKey}:notes`);
    const savedFlags = localStorage.getItem(`${baseKey}:flags`);
    const savedChecklist = localStorage.getItem(`${baseKey}:checklist`);

    if (savedNotes) {
      setIntelNotes(savedNotes);
    }

    if (savedFlags) {
      try {
        const parsed = JSON.parse(savedFlags);
        if (Array.isArray(parsed)) {
          setIntelFlags(parsed);
        }
      } catch {
        setIntelFlags([]);
      }
    }

    if (savedChecklist) {
      try {
        const parsed = JSON.parse(savedChecklist);
        if (parsed && typeof parsed === "object") {
          setIntelChecklist(parsed);
        }
      } catch {
        setIntelChecklist({});
      }
    }
  }, [gameConfig, gameData]);

  useEffect(() => {
    if (!gameConfig || !gameData) {
      return;
    }

    const baseKey = `spy-intel:${gameConfig.category}:${gameData.secretWord}`;
    localStorage.setItem(`${baseKey}:notes`, intelNotes);
    localStorage.setItem(`${baseKey}:flags`, JSON.stringify(intelFlags));
    localStorage.setItem(`${baseKey}:checklist`, JSON.stringify(intelChecklist));
  }, [gameConfig, gameData, intelNotes, intelFlags, intelChecklist]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0 || isPaused) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const decrementBy = speedRoundActive ? 2 : 1; // 2x speed in speed round
        const newTime = prev - decrementBy;

        // Check for 10 minute warning
        if (newTime === 600 && !tenMinuteWarningShown) {
          triggerTenMinuteWarning();
        }

        // Check for end of game
        if (newTime <= 0) {
          triggerGameEnd();
          return 0;
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, isPaused, tenMinuteWarningShown, speedRoundActive]);

  // Trigger 10-minute warning
  const triggerTenMinuteWarning = () => {
    setTenMinuteWarningShown(true);

    // Play alarm sound
    if (soundEnabled && alarmAudioRef.current) {
      alarmAudioRef.current.play().catch((err) => {
        console.warn("Audio play failed:", err);
      });
    }

    toast({
      title: "⚠️ 10 Minute Warning!",
      description: "Time is running out! Start suspecting...",
      duration: 5000,
    });
  };

  // Trigger game end
  const triggerGameEnd = () => {
    setGameEnded(true);

    // Clean up chaos timer
    if (chaosTimerRef.current) {
      clearTimeout(chaosTimerRef.current);
    }

    // Play siren sound
    if (soundEnabled && sirenAudioRef.current) {
      sirenAudioRef.current.play().catch((err) => {
        console.warn("Audio play failed:", err);
      });
    }

    toast({
      title: "🚨 TIME'S UP!",
      description: "Vote now! Who is the spy?",
      duration: 10000,
    });
  };

  const handleForceEndGame = () => {
    if (!confirm("Force end this spy game for everyone?")) {
      return;
    }
    setTimeRemaining(0);
    triggerGameEnd();
  };

  // Send hint (Admin feature)
  const handleSendHint = () => {
    if (!gameData) return;

    const hint = getRandomHint(gameData.secretWord);
    setCurrentHint(hint);
    setShowHint(true);

    toast({
      title: "💡 Hint Revealed",
      description: hint,
      duration: 5000,
    });

    // Auto-hide after 10 seconds
    setTimeout(() => {
      setShowHint(false);
    }, 10000);
  };

  const handleAddIntelFlag = () => {
    const trimmed = intelFlagInput.trim();
    if (!trimmed) {
      return;
    }

    setIntelFlags((prev) => {
      if (prev.includes(trimmed)) {
        return prev;
      }
      return [...prev, trimmed];
    });
    setIntelFlagInput("");
  };

  const handleAddIntelPrompt = (prompt: string) => {
    const trimmed = intelNotes.trim();
    const next = trimmed.length > 0 ? `${trimmed}\n- ${prompt}` : `- ${prompt}`;
    setIntelNotes(next);
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Get timer color based on time remaining
  const getTimerColor = (): string => {
    if (timeRemaining > 600) return "text-green-400";
    if (timeRemaining > 180) return "text-orange-400";
    return "text-red-400";
  };

  // Calculate progress percentage
  const getProgress = (): number => {
    if (!gameConfig) return 0;
    const total = gameConfig.timerMinutes * 60;
    return ((total - timeRemaining) / total) * 100;
  };

  // Chaos Mode: Random Events
  const startChaosMode = () => {
    const triggerChaosEvent = () => {
      const events = [
        "swapSeats",
        "speedRound",
        "inquisitor"
      ];
      
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      
      if (randomEvent === "swapSeats") {
        setChaosEvent("🔄 SWAP SEATS LEFT!");
        if (typeof window !== "undefined" && window.navigator.vibrate) {
          window.navigator.vibrate([200, 100, 200, 100, 200]); // Vibrate pattern
        }
        toast({
          title: "🔄 CHAOS EVENT!",
          description: "Everyone swap seats to the LEFT!",
          duration: 8000,
        });
        setTimeout(() => setChaosEvent(null), 10000);
      } else if (randomEvent === "speedRound") {
        setChaosEvent("⚡ SPEED ROUND: 2X FASTER!");
        setSpeedRoundActive(true);
        toast({
          title: "⚡ CHAOS EVENT!",
          description: "Speed Round! Timer runs 2x faster for 30 seconds!",
          duration: 8000,
        });
        setTimeout(() => {
          setSpeedRoundActive(false);
          setChaosEvent(null);
        }, 30000); // 30 seconds
      } else if (randomEvent === "inquisitor") {
        const randomPlayerIndex = Math.floor(Math.random() * (gameConfig?.numPlayers || 0));
        const randomPlayer = gameConfig?.playerNames[randomPlayerIndex] || "Someone";
        setInquisitorTarget(randomPlayer);
        setChaosEvent(`👁️ ${randomPlayer} MUST ANSWER!`);
        toast({
          title: "👁️ THE INQUISITOR!",
          description: `${randomPlayer} must answer the next question!`,
          duration: 8000,
        });
        setTimeout(() => {
          setInquisitorTarget(null);
          setChaosEvent(null);
        }, 15000);
      }
      
      // Schedule next chaos event in 2 minutes
      chaosTimerRef.current = setTimeout(triggerChaosEvent, 2 * 60 * 1000);
    };
    
    // First event after 2 minutes
    chaosTimerRef.current = setTimeout(triggerChaosEvent, 2 * 60 * 1000);
  };

  if (!gameConfig || !gameData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white">Loading game...</p>
      </div>
    );
  }

  const spyNames = gameData.assignments
    .filter((p) => p.isSpy)
    .map((p) => p.name);

  const checkedIntelCount = intelChecklistItems.filter(
    (item) => intelChecklist[item]
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Game Ended Overlay */}
      {gameEnded && (
        <div className="fixed inset-0 bg-red-900/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8">
          <div className="animate-pulse mb-8">
            <AlertTriangle className="w-32 h-32 text-white" />
          </div>
          <h1 className="text-6xl md:text-8xl font-bold text-white text-center mb-6">
            VOTE NOW!
          </h1>
          <p className="text-2xl text-red-200 text-center mb-8">
            Time to reveal the spy!
          </p>
          <div className="flex gap-4">
            <Button
              onClick={() => router.push("/party/spy-game/vote")}
              size="lg"
              className="bg-white text-red-900 hover:bg-red-100"
            >
              Go to Voting
            </Button>
            <Button
              onClick={() => router.push("/party/spy-game/setup")}
              size="lg"
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white/20"
            >
              New Game
            </Button>
          </div>
        </div>
      )}

      {/* 10 Minute Warning Overlay */}
      {tenMinuteWarningShown && timeRemaining > 0 && timeRemaining <= 600 && (
        <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white py-4 px-6 z-40 animate-pulse">
          <div className="flex items-center justify-center gap-3">
            <AlertTriangle className="w-6 h-6" />
            <p className="text-xl font-bold">⚠️ 10 MINUTES REMAINING!</p>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      )}

      {/* Chaos Event Overlay */}
      {chaosEvent && (
        <div className={`fixed top-20 left-0 right-0 py-6 px-6 z-40 animate-bounce ${
          speedRoundActive ? "bg-red-600" : "bg-purple-600"
        }`}>
          <div className="flex items-center justify-center">
            <p className="text-3xl font-bold text-white">{chaosEvent}</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              🕵️ Spy Game Active
              {gameConfig.chaosMode && (
                <span className="text-xl text-purple-300">⚡ CHAOS</span>
              )}
            </h1>
            <p className="text-purple-200">Category: {gameConfig.category}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setSoundEnabled(!soundEnabled)}
              variant="outline"
              size="icon"
              className="bg-slate-800 border-slate-600 text-white"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
            <Button
              onClick={() => router.push("/party/spy-game/setup")}
              variant="outline"
              size="icon"
              className="bg-slate-800 border-slate-600 text-white"
            >
              <Home className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Main Timer Display */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-purple-500 p-8 mb-6">
          <div className="flex flex-col items-center">
            <Timer className="w-16 h-16 text-purple-400 mb-4" />
            <div className={`text-8xl md:text-9xl font-bold mb-4 ${
              speedRoundActive ? "animate-pulse text-red-400" : getTimerColor()
            }`}>
              {formatTime(timeRemaining)}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-700 rounded-full h-4 mb-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 via-orange-500 to-red-500 transition-all duration-1000"
                style={{ width: `${getProgress()}%` }}
              />
            </div>

            {/* Timer Controls */}
            <div className="flex gap-2">
              <Button
                onClick={() => setIsPaused(!isPaused)}
                variant="outline"
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                {isPaused ? "Resume" : "Pause"}
              </Button>
              <Button
                onClick={() => setTimeRemaining(600)}
                variant="outline"
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                Skip to 10 Min
              </Button>
              <Button
                onClick={triggerGameEnd}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                Vote Now
              </Button>
              {isAdmin && (
                <Button
                  onClick={handleForceEndGame}
                  variant="destructive"
                  className="bg-red-700 hover:bg-red-800"
                >
                  Force End Game
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Hint System */}
        <Card className="bg-slate-800/50 border-slate-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-yellow-400" />
              <h3 className="text-xl font-semibold text-white">Host Controls</h3>
            </div>
            <Button
              onClick={handleSendHint}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Send Hint
            </Button>
          </div>

          {showHint && (
            <div className="bg-yellow-500/20 border-2 border-yellow-500 rounded-lg p-4 animate-pulse">
              <p className="text-yellow-200 text-center text-lg">
                💡 {currentHint}
              </p>
            </div>
          )}

          <p className="text-slate-400 text-sm mt-2">
            If the game stalls, click "Send Hint" to help players along
          </p>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Card className="bg-slate-800/60 border-purple-700 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-white">
                <Flag className="w-5 h-5 text-pink-400" />
                <h3 className="text-lg font-semibold">Intel Board</h3>
              </div>
              <span className="text-xs text-slate-300">
                Flags {intelFlags.length} • Checklist {checkedIntelCount}/{intelChecklistItems.length}
              </span>
            </div>

            <p className="text-slate-400 text-sm mb-3">
              Flag suspicious players and keep a short list to watch.
            </p>
            <div className="flex gap-2 mb-4">
              <input
                value={intelFlagInput}
                onChange={(event) => setIntelFlagInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleAddIntelFlag();
                  }
                }}
                placeholder="Add a suspect"
                className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <Button
                onClick={handleAddIntelFlag}
                className="bg-pink-500 hover:bg-pink-600 text-white"
              >
                Flag
              </Button>
            </div>

            {intelFlags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {intelFlags.map((name) => (
                  <span
                    key={name}
                    className="flex items-center gap-2 rounded-full bg-pink-500/10 px-3 py-1 text-xs text-pink-100"
                  >
                    {name}
                    <button
                      type="button"
                      onClick={() =>
                        setIntelFlags((prev) => prev.filter((entry) => entry !== name))
                      }
                      className="text-pink-200 hover:text-white"
                    >
                      Remove
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No suspects flagged yet.</p>
            )}
          </Card>

          <Card className="bg-slate-800/60 border-slate-700 p-5">
            <div className="flex items-center gap-2 text-white mb-3">
              <FileText className="w-5 h-5 text-purple-300" />
              <h3 className="text-lg font-semibold">Field Notes</h3>
            </div>

            <textarea
              value={intelNotes}
              onChange={(event) => setIntelNotes(event.target.value)}
              placeholder="Write your suspicions, alibis, or tells..."
              className="min-h-[140px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            />

            <div className="mt-3 space-y-3">
              <div>
                <p className="text-xs text-slate-400 mb-2">Quick prompts</p>
                <div className="flex flex-wrap gap-2">
                  {intelPrompts.map((prompt) => (
                    <Button
                      key={prompt}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-200 hover:bg-slate-700"
                      onClick={() => handleAddIntelPrompt(prompt)}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-2 flex items-center gap-2">
                  <ListChecks className="w-4 h-4" />
                  Behavior checklist
                </p>
                <div className="space-y-2">
                  {intelChecklistItems.map((item) => (
                    <label key={item} className="flex items-center gap-2 text-sm text-slate-200">
                      <input
                        type="checkbox"
                        checked={Boolean(intelChecklist[item])}
                        onChange={() =>
                          setIntelChecklist((prev) => ({
                            ...prev,
                            [item]: !prev[item],
                          }))
                        }
                        className="h-4 w-4 rounded border-slate-600 bg-slate-900"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Game Info */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <h4 className="text-white font-semibold mb-2">Secret Word</h4>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-400">{gameData.secretWord}</p>
                {inquisitorTarget && (
                  <p className="text-sm text-yellow-300 mt-2 animate-pulse">
                    👁️ {inquisitorTarget} must answer!
                  </p>
                )}
              </div>
            <p className="text-slate-400 text-sm mt-1">Civilians know this</p>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <h4 className="text-white font-semibold mb-2">The Spy</h4>
            {spyNames.map((name, idx) => (
              <p key={idx} className="text-3xl font-bold text-red-400">
                {name}
              </p>
            ))}
            <p className="text-slate-400 text-sm mt-1">Don&apos;t tell anyone!</p>
          </Card>
        </div>

        {/* Players List */}
        <Card className="bg-slate-800/50 border-slate-700 p-6 mt-6">
          <h4 className="text-white font-semibold mb-3">All Players</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {gameData.assignments.map((player, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg ${
                  player.isSpy
                    ? "bg-red-600 text-white"
                    : "bg-green-600 text-white"
                }`}
              >
                <p className="font-semibold">{player.name}</p>
                <p className="text-xs opacity-80">
                  {player.isSpy ? "🕵️ SPY" : "✅ Civilian"}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Instructions */}
        <div className="mt-6 text-center text-purple-200 text-sm space-y-1">
          <p>🎮 Players take turns describing the word without saying it</p>
          <p>🕵️ The spy must blend in without knowing the word</p>
          <p>⏰ At 10 minutes: Warning alert plays</p>
          <p>🚨 At 0:00: Voting phase begins</p>
        </div>
      </div>
    </div>
  );
}
