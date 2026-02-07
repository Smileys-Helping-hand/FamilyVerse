"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldAlert, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { getRandomWord, CategoryName } from "@/lib/spy-game-data";

type ViewState = "COVER" | "REVEAL" | "NEXT_PLAYER";

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

export default function SpyGameReveal() {
  const router = useRouter();
  
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [viewState, setViewState] = useState<ViewState>("COVER");
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [assignments, setAssignments] = useState<PlayerAssignment[]>([]);
  const [secretWord, setSecretWord] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);

  // Load game config and generate assignments
  useEffect(() => {
    const configStr = localStorage.getItem("spyGameConfig");
    if (!configStr) {
      router.push("/party/spy-game/setup");
      return;
    }

    const config: GameConfig = JSON.parse(configStr);
    setGameConfig(config);

    // Generate secret word
    const word = getRandomWord(config.category);
    setSecretWord(word);

    // Assign roles randomly
    const playerAssignments: PlayerAssignment[] = [];
    const spyIndices = new Set<number>();

    // Randomly select spy indices
    while (spyIndices.size < config.numSpies) {
      const randomIndex = Math.floor(Math.random() * config.numPlayers);
      spyIndices.add(randomIndex);
    }

    // Create assignments
    config.playerNames.forEach((name, index) => {
      playerAssignments.push({
        name,
        isSpy: spyIndices.has(index),
        word: spyIndices.has(index) ? undefined : word,
      });
    });

    setAssignments(playerAssignments);

    // Save assignments for active game
    localStorage.setItem(
      "spyGameAssignments",
      JSON.stringify({
        secretWord: word,
        assignments: playerAssignments,
      })
    );
  }, [router]);

  if (!gameConfig || assignments.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white">Loading game...</p>
      </div>
    );
  }

  const currentPlayer = assignments[currentPlayerIndex];
  const isLastPlayer = currentPlayerIndex === assignments.length - 1;

  // Handle tap to reveal
  const handleTapToReveal = () => {
    if (viewState === "COVER") {
      setIsFlipped(true);
      setTimeout(() => setViewState("REVEAL"), 300); // Wait for flip animation
    } else if (viewState === "REVEAL") {
      if (isLastPlayer) {
        // All players have seen their role, go to voting or active game
        router.push("/party/spy-game/active");
      } else {
        // Move to next player
        setIsFlipped(false);
        setTimeout(() => {
          setViewState("COVER");
          setCurrentPlayerIndex(currentPlayerIndex + 1);
        }, 300);
      }
    }
  };

  // COVER VIEW
  if (viewState === "COVER") {
    return (
      <div
        onClick={handleTapToReveal}
        className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8 cursor-pointer"
        style={{ perspective: "1000px" }}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative w-full max-w-md aspect-[3/4]"
        >
          {/* Front of Card (Cover) */}
          <div
            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 shadow-2xl border-4 border-purple-500 flex flex-col items-center justify-center p-8"
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* Eye Icon */}
            <div className="mb-8 animate-pulse">
              <Eye className="w-32 h-32 text-white/80" />
            </div>

            {/* Player Name */}
            <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">
              {currentPlayer.name}
            </h1>

            {/* Instruction */}
            <p className="text-xl md:text-2xl text-purple-200 text-center mb-8">
              Tap to reveal
            </p>

            {/* Progress */}
            <div className="flex items-center gap-2 text-white/60">
              <span className="text-sm">
                Player {currentPlayerIndex + 1} of {assignments.length}
              </span>
            </div>

            {/* Tap indicator */}
            <div className="mt-8 animate-bounce">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <Eye className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // REVEAL VIEW
  if (viewState === "REVEAL") {
    if (currentPlayer.isSpy) {
      // SPY REVEAL
      return (
        <div
          onClick={handleTapToReveal}
          className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center p-8 cursor-pointer"
          style={{ perspective: "1000px" }}
        >
          <motion.div
            initial={{ rotateY: 0 }}
            animate={{ rotateY: 180 }}
            transition={{ duration: 0.6, type: "spring" }}
            style={{ transformStyle: "preserve-3d" }}
            className="relative w-full max-w-md aspect-[3/4]"
          >
            {/* Back of Card (Spy Reveal) */}
            <div
              className="absolute inset-0 rounded-3xl bg-white shadow-2xl border-4 border-red-500 flex flex-col items-center justify-center p-8"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              {/* Spy Icon */}
              <div className="mb-6 animate-pulse">
                <ShieldAlert className="w-24 h-24 text-red-600" />
              </div>

              {/* Spy Message */}
              <h1 className="text-4xl md:text-6xl font-bold text-red-600 text-center mb-4">
                YOU&apos;RE A SPY
              </h1>

              <p className="text-lg md:text-xl text-red-500 text-center mb-4">
                🕵️ Blend in!
              </p>

              <p className="text-sm text-slate-600 text-center max-w-md mb-6">
                Listen carefully. Try to figure out the secret word without revealing 
                that you don&apos;t know it.
              </p>

              {/* Next Instruction */}
              <div className="mt-6 flex items-center gap-2 text-slate-500">
                <EyeOff className="w-5 h-5" />
                <p className="text-sm">
                  {isLastPlayer ? "Tap to start" : "Tap to pass phone"}
                </p>
                <ArrowRight className="w-5 h-5 animate-pulse" />
              </div>
            </div>
          </motion.div>
        </div>
      );
    } else {
      // CIVILIAN REVEAL
      return (
        <div
          onClick={handleTapToReveal}
          className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center p-8 cursor-pointer"
          style={{ perspective: "1000px" }}
        >
          <motion.div
            initial={{ rotateY: 0 }}
            animate={{ rotateY: 180 }}
            transition={{ duration: 0.6, type: "spring" }}
            style={{ transformStyle: "preserve-3d" }}
            className="relative w-full max-w-md aspect-[3/4]"
          >
            {/* Back of Card (Civilian Reveal) */}
            <div
              className="absolute inset-0 rounded-3xl bg-white shadow-2xl border-4 border-green-500 flex flex-col items-center justify-center p-8"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              {/* Category Label */}
              <p className="text-sm md:text-base text-green-600 mb-3 uppercase tracking-wider font-semibold">
                {gameConfig.category}
              </p>

              {/* The Secret Word */}
              <div className="bg-green-50 rounded-2xl px-8 py-6 mb-6 border-2 border-green-300">
                <h1 className="text-5xl md:text-7xl font-bold text-green-600 text-center">
                  {currentPlayer.word}
                </h1>
              </div>

              {/* Civilian Message */}
              <p className="text-lg md:text-xl text-green-600 text-center mb-3">
                ✅ You&apos;re a Civilian
              </p>

              <p className="text-sm text-slate-600 text-center max-w-md mb-6">
                Describe this word without saying it directly. Help find the spy!
              </p>

              {/* Next Instruction */}
              <div className="mt-6 flex items-center gap-2 text-slate-500">
                <EyeOff className="w-5 h-5" />
                <p className="text-sm">
                  {isLastPlayer ? "Tap to start" : "Tap to pass phone"}
                </p>
                <ArrowRight className="w-5 h-5 animate-pulse" />
              </div>
            </div>
          </motion.div>
        </div>
      );
    }
  }

  return null;
}
