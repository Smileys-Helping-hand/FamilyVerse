"use client";

import { useState } from "react";
import { partyGames, type PartyGame, getGamesByCategory } from "@/lib/data/games";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Clock, 
  Trophy, 
  Sparkles,
  PartyPopper,
  Lightbulb,
  Palette,
  Dumbbell,
  Brain,
  Theater,
  MessageCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { EnhancedGameSession } from './EnhancedGameSession';

const categoryIcons = {
  icebreaker: MessageCircle,
  trivia: Brain,
  drawing: Palette,
  acting: Theater,
  word: Lightbulb,
  physical: Dumbbell,
  creative: Sparkles,
};

const categoryColors = {
  icebreaker: "from-blue-500 to-cyan-500",
  trivia: "from-purple-500 to-pink-500",
  drawing: "from-orange-500 to-red-500",
  acting: "from-green-500 to-emerald-500",
  word: "from-yellow-500 to-amber-500",
  physical: "from-red-500 to-pink-500",
  creative: "from-indigo-500 to-purple-500",
};

const difficultyColors = {
  easy: "bg-green-100 text-green-700 border-green-300",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
  hard: "bg-red-100 text-red-700 border-red-300",
};

export function FamilyGamesHub() {
  const { toast } = useToast();
  const [selectedGame, setSelectedGame] = useState<PartyGame | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeGameSession, setActiveGameSession] = useState<PartyGame | null>(null);

  // If there's an active game session, show the game manager
  if (activeGameSession) {
    return (
      <EnhancedGameSession 
        game={activeGameSession} 
        onExit={() => setActiveGameSession(null)} 
      />
    );
  }

  const categories = [
    { id: "all", label: "All Games", icon: PartyPopper },
    { id: "icebreaker", label: "Icebreakers", icon: MessageCircle },
    { id: "trivia", label: "Trivia", icon: Brain },
    { id: "drawing", label: "Drawing", icon: Palette },
    { id: "acting", label: "Acting", icon: Theater },
    { id: "word", label: "Word Games", icon: Lightbulb },
    { id: "physical", label: "Active", icon: Dumbbell },
    { id: "creative", label: "Creative", icon: Sparkles },
  ];

  const filteredGames = selectedCategory === "all" 
    ? partyGames 
    : getGamesByCategory(selectedCategory as PartyGame['category']);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <PartyPopper className="h-12 w-12 animate-bounce" />
              <h1 className="text-4xl font-bold">Family Fun & Games</h1>
            </div>
            <p className="text-xl text-white/90 max-w-2xl">
              Amazing party games and activities for families and friends! 
              No screens needed - just fun, laughter, and making memories together.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-base px-4 py-1">
                <Trophy className="h-4 w-4 mr-2" />
                {partyGames.length} Games
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-base px-4 py-1">
                <Users className="h-4 w-4 mr-2" />
                2-20 Players
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <Button
              key={cat.id}
              variant={isSelected ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "transition-all duration-200",
                isSelected && "shadow-lg scale-105"
              )}
            >
              <Icon className="h-4 w-4 mr-2" />
              {cat.label}
            </Button>
          );
        })}
      </div>

      {/* Games Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredGames.map((game, index) => {
          const Icon = categoryIcons[game.category];
          const gradient = categoryColors[game.category];
          
          return (
            <Card
              key={game.id}
              className={cn(
                "group cursor-pointer transition-all duration-300",
                "hover:shadow-2xl hover:-translate-y-2",
                "border-2 hover:border-primary/50",
                "animate-in fade-in slide-in-from-bottom-4"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => setSelectedGame(game)}
            >
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className={cn(
                    "p-3 rounded-xl bg-gradient-to-br shadow-md",
                    "group-hover:scale-110 transition-transform",
                    gradient
                  )}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge className={cn("text-xs", difficultyColors[game.difficulty])}>
                    {game.difficulty}
                  </Badge>
                </div>
                
                <div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {game.name}
                  </CardTitle>
                  <CardDescription className="mt-2 line-clamp-2">
                    {game.description}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {game.minPlayers}-{game.maxPlayers} players
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {game.duration}
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Trophy
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < Math.floor(game.funFactor)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        )}
                      />
                    ))}
                    <span className="text-sm font-medium ml-1">{game.funFactor}</span>
                  </div>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-primary to-secondary hover:scale-105 transition-transform"
                  >
                    Play Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Game Details Dialog */}
      <Dialog open={!!selectedGame} onOpenChange={() => setSelectedGame(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
          {selectedGame && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "p-4 rounded-2xl bg-gradient-to-br shadow-lg",
                    categoryColors[selectedGame.category]
                  )}>
                    {(() => {
                      const Icon = categoryIcons[selectedGame.category];
                      return <Icon className="h-8 w-8 text-white" />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-3xl text-white">{selectedGame.name}</DialogTitle>
                    <DialogDescription className="text-base mt-2 text-slate-300">
                      {selectedGame.description}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* IRL Notice */}
              <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-2 border-blue-500/50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <PartyPopper className="h-6 w-6 text-blue-400" />
                  <div>
                    <h3 className="font-semibold text-blue-100">In-Person Game</h3>
                    <p className="text-sm text-blue-200">
                      This is a real-life party game! Read the instructions below and play together offline.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-2 border-blue-500/50">
                  <Users className="h-5 w-5 text-blue-400 mb-2" />
                  <p className="text-sm text-slate-400">Players</p>
                  <p className="font-bold text-blue-300">
                    {selectedGame.minPlayers}-{selectedGame.maxPlayers}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-2 border-purple-500/50">
                  <Clock className="h-5 w-5 text-purple-400 mb-2" />
                  <p className="text-sm text-slate-400">Duration</p>
                  <p className="font-bold text-purple-300">{selectedGame.duration}</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-green-900/50 to-green-800/50 border-2 border-green-500/50">
                  <Sparkles className="h-5 w-5 text-green-400 mb-2" />
                  <p className="text-sm text-slate-400">Age Range</p>
                  <p className="font-bold text-green-300">{selectedGame.ageRange}</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border-2 border-yellow-500/50">
                  <Trophy className="h-5 w-5 text-yellow-400 mb-2" />
                  <p className="text-sm text-slate-400">Fun Factor</p>
                  <p className="font-bold text-yellow-300">{selectedGame.funFactor}/5</p>
                </div>
              </div>

              <Card className="bg-gradient-to-br from-orange-900/50 to-red-900/50 border-2 border-orange-500/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-orange-300">
                    <Sparkles className="h-5 w-5 text-orange-400" />
                    Materials Needed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedGame.materials.map((material) => (
                      <Badge
                        key={material}
                        variant="secondary"
                        className="bg-orange-800/50 border-orange-500/50 text-orange-200"
                      >
                        {material}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 border-2 border-blue-500/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-blue-300">
                    <Lightbulb className="h-5 w-5 text-blue-400" />
                    How to Play
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3">
                    {selectedGame.instructions.map((instruction, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-bold">
                          {idx + 1}
                        </span>
                        <p className="text-sm pt-1 text-slate-200">{instruction}</p>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-2 border-purple-500/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-purple-300">
                    <PartyPopper className="h-5 w-5 text-purple-400" />
                    Fun Variations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedGame.variations.map((variation, idx) => (
                      <li key={idx} className="flex gap-2 text-sm text-slate-200">
                        <span className="text-purple-400 font-bold">•</span>
                        <span>{variation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-gradient-to-r from-primary via-secondary to-accent hover:scale-105 transition-transform text-lg py-6"
                  size="lg"
                  onClick={() => {
                    setActiveGameSession(selectedGame);
                    setSelectedGame(null);
                  }}
                >
                  <PartyPopper className="mr-2 h-5 w-5" />
                  Start Game Manager
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8"
                  onClick={() => setSelectedGame(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
