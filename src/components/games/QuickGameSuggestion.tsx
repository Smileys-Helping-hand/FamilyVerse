"use client";

import { useState, useEffect } from "react";
import { partyGames, type PartyGame } from "@/lib/data/games";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PartyPopper, Users, Clock, RefreshCw } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface QuickGameSuggestionProps {
  className?: string;
}

export function QuickGameSuggestion({ className }: QuickGameSuggestionProps) {
  const [randomGame, setRandomGame] = useState<PartyGame | null>(null);

  const getRandomGame = () => {
    const randomIndex = Math.floor(Math.random() * partyGames.length);
    setRandomGame(partyGames[randomIndex]);
  };

  useEffect(() => {
    getRandomGame();
  }, []);

  if (!randomGame) return null;

  return (
    <Card className={cn(
      "bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50",
      "border-2 border-pink-200 hover:shadow-xl transition-all duration-300",
      className
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <PartyPopper className="h-5 w-5 text-pink-600" />
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Game Suggestion
            </span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={getRandomGame}
            className="hover:bg-pink-100"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>Try this fun game with your family!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-bold text-xl text-pink-900 mb-2">
            {randomGame.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {randomGame.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-pink-100 text-pink-700 border-pink-300">
            <Users className="h-3 w-3 mr-1" />
            {randomGame.minPlayers}-{randomGame.maxPlayers} players
          </Badge>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-300">
            <Clock className="h-3 w-3 mr-1" />
            {randomGame.duration}
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">
            {randomGame.category}
          </Badge>
        </div>

        <Link href="/dashboard/games" className="block">
          <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
            View All Games
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
