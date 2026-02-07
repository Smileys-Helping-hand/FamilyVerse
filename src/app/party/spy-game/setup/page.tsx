"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Users, 
  ShieldAlert, 
  Timer, 
  Shapes, 
  Plus, 
  Minus, 
  Play,
  Printer,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CATEGORIES, CategoryName, generateAICategory } from "@/lib/spy-game-data";

export default function SpyGameSetup() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Configuration State
  const [numPlayers, setNumPlayers] = useState(3);
  const [numSpies, setNumSpies] = useState(1);
  const [timerMinutes, setTimerMinutes] = useState(4);
  const [selectedCategory, setSelectedCategory] = useState<CategoryName | null>(null);
  const [playerNames, setPlayerNames] = useState<string[]>(["Player 1", "Player 2", "Player 3"]);
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
  const [chaosMode, setChaosMode] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  // Calculate max spies (50% rule)
  const maxSpies = Math.floor(numPlayers / 2);

  // Update number of players
  const updatePlayers = (delta: number) => {
    const newCount = Math.max(3, numPlayers + delta);
    setNumPlayers(newCount);
    
    // Adjust player names array
    const newNames = [...playerNames];
    if (newCount > playerNames.length) {
      // Add new player names
      for (let i = playerNames.length; i < newCount; i++) {
        newNames.push(`Player ${i + 1}`);
      }
    } else if (newCount < playerNames.length) {
      // Remove excess names
      newNames.splice(newCount);
    }
    setPlayerNames(newNames);
    
    // Adjust spies if needed
    const newMaxSpies = Math.floor(newCount / 2);
    if (numSpies > newMaxSpies) {
      setNumSpies(newMaxSpies);
    }
  };

  // Update number of spies with validation
  const updateSpies = (delta: number) => {
    const newCount = Math.max(1, numSpies + delta);
    
    if (newCount > maxSpies) {
      toast({
        title: "Too Many Spies!",
        description: "Maximum number of spies is 50%",
        variant: "destructive",
      });
      return;
    }
    
    setNumSpies(newCount);
  };

  // Update timer
  const updateTimer = (delta: number) => {
    setTimerMinutes(Math.max(1, Math.min(60, timerMinutes + delta)));
  };

  // Update player name
  const updatePlayerName = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  // Select category
  const handleCategorySelect = (category: CategoryName) => {
    setSelectedCategory(category);
    setCategoriesModalOpen(false);
    toast({
      title: "Category Selected",
      description: `Playing with ${category}`,
    });
  };

  // Generate AI category
  const handleAICategory = async () => {
    setGeneratingAI(true);
    try {
      const context = "Cape Town party with friends and family";
      const result = await generateAICategory(context);
      
      if (result) {
        setSelectedCategory("Vibe Check" as CategoryName);
        setCategoriesModalOpen(false);
        toast({
          title: "🤖 AI Category Generated!",
          description: "Playing with custom AI-generated words",
        });
      } else {
        throw new Error("Failed to generate");
      }
    } catch (error) {
      toast({
        title: "AI Generation Failed",
        description: "Falling back to standard categories",
        variant: "destructive",
      });
    } finally {
      setGeneratingAI(false);
    }
  };

  // Start game
  const handleStartGame = () => {
    if (!selectedCategory) {
      toast({
        title: "Select a Category",
        description: "Please choose a category before starting",
        variant: "destructive",
      });
      return;
    }

    // Save game config to localStorage
    const gameConfig = {
      numPlayers,
      numSpies,
      timerMinutes,
      category: selectedCategory,
      playerNames,
      chaosMode,
    };
    
    localStorage.setItem("spyGameConfig", JSON.stringify(gameConfig));
    
    // Navigate to reveal page
    router.push("/party/spy-game/reveal");
  };

  // Print cards (Phase 4)
  const handlePrintCards = () => {
    if (!selectedCategory) {
      toast({
        title: "Select a Category First",
        description: "Choose a category before printing cards",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Generating Cards...",
      description: "Opening print preview",
    });

    // Save config and navigate to print page
    const gameConfig = {
      numPlayers,
      numSpies,
      timerMinutes,
      category: selectedCategory,
      playerNames,
      chaosMode,
    };
    
    localStorage.setItem("spyGameConfig", JSON.stringify(gameConfig));
    router.push("/party/spy-game/print");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/party/dashboard" className="inline-flex">
              <Button variant="ghost" size="sm" className="text-white bg-white/10 hover:bg-white/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Party
              </Button>
            </Link>
            <div className="text-xs text-purple-200/80">Setup</div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">🕵️ Spy Game Setup</h1>
          <p className="text-purple-200">Configure your party game</p>
          
          {/* Chaos Mode Toggle */}
          <div className="flex items-center justify-center gap-3 mt-4 p-3 bg-purple-600/30 rounded-lg">
            <Switch
              id="chaos-mode"
              checked={chaosMode}
              onCheckedChange={setChaosMode}
            />
            <Label htmlFor="chaos-mode" className="text-white font-semibold cursor-pointer">
              ⚡ Chaos Mode (Random Events Every 2 Minutes)
            </Label>
          </div>
        </div>

        {/* 2x2 Grid of Configuration Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Card 1: Players */}
          <Card className="bg-purple-600 border-purple-400 p-6 text-white">
            <div className="flex flex-col items-center">
              <Users className="w-12 h-12 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Players</h3>
              <div className="text-5xl font-bold mb-4">{numPlayers}</div>
              <div className="flex gap-2">
                <Button
                  onClick={() => updatePlayers(-1)}
                  variant="secondary"
                  size="icon"
                  className="bg-purple-700 hover:bg-purple-800"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => updatePlayers(1)}
                  variant="secondary"
                  size="icon"
                  className="bg-purple-700 hover:bg-purple-800"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Card 2: Spies */}
          <Card className="bg-blue-600 border-blue-400 p-6 text-white">
            <div className="flex flex-col items-center">
              <ShieldAlert className="w-12 h-12 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Spies</h3>
              <div className="text-5xl font-bold mb-4">{numSpies}</div>
              <div className="flex gap-2">
                <Button
                  onClick={() => updateSpies(-1)}
                  variant="secondary"
                  size="icon"
                  className="bg-blue-700 hover:bg-blue-800"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => updateSpies(1)}
                  variant="secondary"
                  size="icon"
                  className="bg-blue-700 hover:bg-blue-800"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs mt-2 text-blue-100">Max: {maxSpies}</p>
            </div>
          </Card>

          {/* Card 3: Timer */}
          <Card className="bg-indigo-600 border-indigo-400 p-6 text-white">
            <div className="flex flex-col items-center">
              <Timer className="w-12 h-12 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Timer</h3>
              <div className="text-5xl font-bold mb-4">{timerMinutes}</div>
              <div className="flex gap-2">
                <Button
                  onClick={() => updateTimer(-1)}
                  variant="secondary"
                  size="icon"
                  className="bg-indigo-700 hover:bg-indigo-800"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => updateTimer(1)}
                  variant="secondary"
                  size="icon"
                  className="bg-indigo-700 hover:bg-indigo-800"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs mt-2 text-indigo-100">Minutes</p>
            </div>
          </Card>

          {/* Card 4: Categories */}
          <Dialog open={categoriesModalOpen} onOpenChange={setCategoriesModalOpen}>
            <DialogTrigger asChild>
              <Card className="bg-gradient-to-br from-pink-600 to-purple-600 border-pink-400 p-6 text-white cursor-pointer hover:scale-105 transition-transform">
                <div className="flex flex-col items-center justify-center h-full">
                  <Shapes className="w-12 h-12 mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Categories</h3>
                  {selectedCategory ? (
                    <div className="text-center">
                      <p className="text-2xl font-bold">{selectedCategory}</p>
                      <p className="text-xs text-pink-100 mt-1">Tap to change</p>
                    </div>
                  ) : (
                    <p className="text-sm text-pink-100">Tap to select</p>
                  )}
                </div>
              </Card>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 text-white border-purple-500">
              <DialogHeader>
                <DialogTitle className="text-2xl">Select Category</DialogTitle>
              </DialogHeader>
              
              {/* AI Category Button */}
              <Button
                onClick={handleAICategory}
                disabled={generatingAI}
                className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 mb-4"
              >
                {generatingAI ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Generating AI Category...
                  </>
                ) : (
                  <>🤖 The Vibe Check (AI Generated)</>
                )}
              </Button>
              
              <div className="text-center text-sm text-slate-400 mb-2">Or choose a standard category:</div>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                {(Object.keys(CATEGORIES) as CategoryName[]).map((category) => (
                  <Button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className={`h-20 text-lg font-semibold ${
                      selectedCategory === category
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-slate-700 hover:bg-slate-600"
                    }`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Player Names Input List */}
        <Card className="bg-slate-800/50 border-slate-700 p-6 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">Player Names</h3>
          <div className="grid grid-cols-2 gap-3">
            {playerNames.map((name, index) => (
              <Input
                key={index}
                value={name}
                onChange={(e) => updatePlayerName(index, e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                placeholder={`Player ${index + 1}`}
              />
            ))}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={handleStartGame}
            size="lg"
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-16 text-xl font-bold"
          >
            <Play className="w-6 h-6 mr-2" />
            Start Game
          </Button>
          
          <Button
            onClick={handlePrintCards}
            size="lg"
            variant="outline"
            className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 h-16"
          >
            <Printer className="w-6 h-6 mr-2" />
            Print Cards
          </Button>
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-purple-200 text-sm space-y-1">
          <p>🎮 Pass & Play: Tap "Start Game" to reveal roles on this device</p>
          <p>🖨️ Print Cards: Generate QR codes for physical gameplay</p>
          {chaosMode && (
            <p className="text-yellow-300 font-semibold">⚡ Chaos Mode: Random events every 2 minutes! (Swap Seats, Speed Round, Inquisitor)</p>
          )}
        </div>
      </div>
    </div>
  );
}
