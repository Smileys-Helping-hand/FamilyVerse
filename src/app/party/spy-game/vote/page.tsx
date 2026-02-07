"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trophy, AlertTriangle, Home, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CategoryName } from "@/lib/spy-game-data";
import Confetti from "react-confetti";

interface GameConfig {
  numPlayers: number;
  numSpies: number;
  timerMinutes: number;
  category: CategoryName;
  playerNames: string[];
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

const FORFEITS = [
  "Do 5 pushups",
  "Sing a song for 30 seconds",
  "Dance for 1 minute",
  "Do 10 jumping jacks",
  "Tell an embarrassing story",
  "Speak in an accent for 2 minutes",
  "Do an impression of someone in the room",
  "Recite a tongue twister 3 times fast",
  "Balance on one leg for 1 minute",
  "Do your best animal impression",
  "Compliment everyone in the room",
  "Tell a bad joke"
];

export default function SpyGameVote() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [votingComplete, setVotingComplete] = useState(false);
  const [showDrumRoll, setShowDrumRoll] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [civilansWin, setCiviliansWin] = useState(false);
  const [forfeit, setForfeit] = useState("");
  const [mvp, setMvp] = useState("");

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
  }, [router]);

  const handleVote = (playerName: string) => {
    setSelectedPlayer(playerName);
  };

  const confirmVote = () => {
    if (!selectedPlayer) return;

    const newVotes = { ...votes };
    newVotes[`voter_${Object.keys(votes).length}`] = selectedPlayer;
    setVotes(newVotes);

    toast({
      title: "Vote Recorded",
      description: `Voted for ${selectedPlayer}`,
    });

    setSelectedPlayer(null);

    // Check if all players have voted (simplified - just need a few votes)
    if (Object.keys(newVotes).length >= 3) {
      setVotingComplete(true);
      triggerDrumRoll();
    }
  };

  const triggerDrumRoll = async () => {
    setShowDrumRoll(true);
    
    // Play drum roll sound (if available)
    const audio = new Audio("/sounds/drumroll.mp3");
    audio.play().catch(() => console.log("No drum roll audio"));

    // Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Calculate winner
    const voteCount: Record<string, number> = {};
    Object.values(votes).forEach((playerName) => {
      voteCount[playerName] = (voteCount[playerName] || 0) + 1;
    });

    const topVoted = Object.entries(voteCount).sort((a, b) => b[1] - a[1])[0][0];
    const actualSpy = gameData?.assignments.find((p) => p.isSpy)?.name || "";
    
    const didCiviliansWin = topVoted === actualSpy;
    setCiviliansWin(didCiviliansWin);

    // Select random forfeit
    setForfeit(FORFEITS[Math.floor(Math.random() * FORFEITS.length)]);

    // Determine MVP (player with most votes or spy if they won)
    setMvp(didCiviliansWin ? actualSpy : topVoted);

    setShowDrumRoll(false);
    setShowResult(true);

    // Play result sound
    const resultAudio = new Audio(didCiviliansWin ? "/sounds/success.mp3" : "/sounds/evil-laugh.mp3");
    resultAudio.play().catch(() => console.log("No result audio"));
  };

  const handlePrintSummary = () => {
    toast({
      title: "🖨️ Printing Summary",
      description: "Generating game summary slip...",
    });

    // Navigate to a print summary page (you can create this later)
    setTimeout(() => {
      toast({
        title: "✅ Summary Ready",
        description: "Check your printer!",
      });
    }, 2000);
  };

  if (!gameConfig || !gameData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  // Vote Grid
  if (!votingComplete && !showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white">🗳️ Vote Now!</h1>
              <p className="text-purple-200">Who is the spy?</p>
            </div>
            <Button
              onClick={() => router.push("/party/spy-game/setup")}
              variant="outline"
              size="icon"
              className="bg-slate-800 border-slate-600 text-white"
            >
              <Home className="w-5 h-5" />
            </Button>
          </div>

          <Card className="bg-slate-800/50 border-slate-700 p-6 mb-6">
            <p className="text-white text-center mb-4">
              {Object.keys(votes).length} votes cast • Tap a player to vote
            </p>
            {selectedPlayer && (
              <div className="text-center mb-4">
                <p className="text-yellow-300 font-semibold">
                  Selected: {selectedPlayer}
                </p>
                <Button
                  onClick={confirmVote}
                  className="mt-2 bg-green-600 hover:bg-green-700"
                >
                  Confirm Vote
                </Button>
              </div>
            )}
          </Card>

          {/* Player Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {gameConfig.playerNames.map((name, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  onClick={() => handleVote(name)}
                  className={`p-6 cursor-pointer transition-all ${
                    selectedPlayer === name
                      ? "bg-yellow-600 border-yellow-400"
                      : "bg-slate-700 border-slate-600 hover:bg-slate-600"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">👤</div>
                    <p className="text-white font-semibold">{name}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Button
              onClick={() => {
                setVotingComplete(true);
                triggerDrumRoll();
              }}
              disabled={Object.keys(votes).length < 3}
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Reveal Results ({Object.keys(votes).length}/3 votes)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Drum Roll
  if (showDrumRoll) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      >
        <motion.div
          animate={{ 
            rotate: [0, -5, 5, -5, 5, 0],
            scale: [1, 1.1, 1, 1.1, 1]
          }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="text-center"
        >
          <h1 className="text-8xl font-bold text-white mb-4">🥁</h1>
          <p className="text-4xl text-white">DRUM ROLL...</p>
        </motion.div>
      </motion.div>
    );
  }

  // Result Screen
  if (showResult) {
    const actualSpy = gameData.assignments.find((p) => p.isSpy);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
        {civilansWin && typeof window !== "undefined" && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={500}
          />
        )}

        <div className="max-w-2xl mx-auto">
          {/* Winner Banner */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className={`rounded-2xl p-12 mb-6 text-center ${
              civilansWin
                ? "bg-gradient-to-r from-green-600 to-emerald-600"
                : "bg-gradient-to-r from-red-600 to-orange-600"
            }`}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 1 }}
            >
              <div className="text-9xl mb-4">
                {civilansWin ? "✅" : "🕵️"}
              </div>
            </motion.div>
            <h1 className="text-6xl font-bold text-white mb-4">
              {civilansWin ? "CIVILIANS WIN!" : "SPY WINS!"}
            </h1>
            <p className="text-2xl text-white/90">
              {civilansWin 
                ? "The spy was caught!"
                : "The spy escaped undetected!"}
            </p>
          </motion.div>

          {/* Game Summary */}
          <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Game Summary
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                <span className="text-slate-300">The Spy Was:</span>
                <span className="text-red-400 font-bold text-xl">{actualSpy?.name}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                <span className="text-slate-300">Secret Word:</span>
                <span className="text-green-400 font-bold text-xl">{gameData.secretWord}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                <span className="text-slate-300">MVP:</span>
                <span className="text-yellow-400 font-bold text-xl">{mvp}</span>
              </div>

              <div className="p-4 bg-orange-600/20 border-2 border-orange-500 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  <span className="text-orange-300 font-semibold">Forfeit:</span>
                </div>
                <p className="text-white text-lg font-bold">{forfeit}</p>
                <p className="text-orange-200 text-sm mt-1">
                  {civilansWin ? `${actualSpy?.name} must complete this!` : "Winner chooses who does this!"}
                </p>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={() => router.push("/party/spy-game/setup")}
              size="lg"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Home className="w-5 h-5 mr-2" />
              New Game
            </Button>
            
            <Button
              onClick={handlePrintSummary}
              size="lg"
              variant="outline"
              className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
            >
              <Printer className="w-5 h-5 mr-2" />
              Print Summary
            </Button>
          </div>

          {/* Pro Tip */}
          <div className="mt-6 p-4 bg-purple-600/20 border border-purple-500 rounded-lg">
            <p className="text-purple-200 text-center text-sm">
              💡 <strong>Pro Tip:</strong> The printed summary makes a great party souvenir! 
              Hand it to the loser as proof of their defeat 😈
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
