'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Trophy, Users, Receipt } from 'lucide-react';
import { LiveLeaderboard } from '@/components/party/LiveLeaderboard';
import { PartyMVPLeaderboard } from '@/components/party/PartyMVPLeaderboard';
import { ImposterDashboard } from '@/components/party/ImposterDashboard';
import { ExpenseScanner } from '@/components/party/ExpenseScanner';

interface PartyHubProps {
  eventId: number;
  userId: string;
  isHost?: boolean;
}

export default function PartyHub({ eventId, userId, isHost = false }: PartyHubProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with real data from your auth/database
  const mockFriends = [
    { id: 'user2', name: 'Bob Smith' },
    { id: 'user3', name: 'Charlie Brown' },
    { id: 'user4', name: 'Diana Prince' },
  ];

  const mockGames = [
    { id: 1, name: 'Sim Racing', scoringType: 'TIME_ASC' as const },
    { id: 2, name: 'Dominoes', scoringType: 'SCORE_DESC' as const },
    { id: 3, name: 'VR Beat Saber', scoringType: 'SCORE_DESC' as const },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          🎉 Party Companion Hub
        </h1>
        <p className="text-muted-foreground">
          AI-Powered Event Management | Live Leaderboards | Social Games | Smart Expenses
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="leaderboards" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Leaderboards
          </TabsTrigger>
          <TabsTrigger value="imposter" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Imposter Game
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Expenses
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('overview')}>
              <CardHeader>
                <Brain className="h-8 w-8 mb-2 text-purple-500" />
                <CardTitle className="text-lg">Party Brain</CardTitle>
                <CardDescription>AI event planning</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Let AI create the perfect schedule based on your assets and preferences
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('leaderboards')}>
              <CardHeader>
                <Trophy className="h-8 w-8 mb-2 text-yellow-500" />
                <CardTitle className="text-lg">Leaderboards</CardTitle>
                <CardDescription>Live competition tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track scores across all games and crown the Party MVP
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('imposter')}>
              <CardHeader>
                <Users className="h-8 w-8 mb-2 text-red-500" />
                <CardTitle className="text-lg">Imposter Game</CardTitle>
                <CardDescription>Social deduction</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Play a digital Werewolf-style game on your phones
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('expenses')}>
              <CardHeader>
                <Receipt className="h-8 w-8 mb-2 text-green-500" />
                <CardTitle className="text-lg">Smart Expenses</CardTitle>
                <CardDescription>OCR receipt scanning</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Snap receipts, AI extracts details, auto-split with friends
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Event Stats</CardTitle>
              <CardDescription>Real-time party metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">Attendees</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold">8</p>
                  <p className="text-sm text-muted-foreground">Games Played</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold">$247</p>
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold">4.5h</p>
                  <p className="text-sm text-muted-foreground">Party Duration</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboards Tab */}
        <TabsContent value="leaderboards" className="space-y-6">
          {/* Party MVP */}
          <PartyMVPLeaderboard eventId={eventId} refreshInterval={10000} />

          {/* Individual Game Leaderboards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockGames.map((game) => (
              <LiveLeaderboard
                key={game.id}
                gameId={game.id}
                eventId={eventId}
                gameName={game.name}
                scoringType={game.scoringType}
                refreshInterval={10000}
              />
            ))}
          </div>
        </TabsContent>

        {/* Imposter Game Tab */}
        <TabsContent value="imposter" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>How to Play</CardTitle>
              <CardDescription>Imposter Game Rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500">
                  <h4 className="font-bold text-green-600 mb-2">👥 Civilians</h4>
                  <p className="text-sm">You know the secret topic. Discuss it naturally and find the imposter!</p>
                </div>
                <div className="p-4 bg-red-500/10 rounded-lg border border-red-500">
                  <h4 className="font-bold text-red-600 mb-2">🎭 Imposter</h4>
                  <p className="text-sm">You only get a vague hint. Blend in without revealing you don't know the topic!</p>
                </div>
                <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500">
                  <h4 className="font-bold text-yellow-600 mb-2">🗳️ Voting</h4>
                  <p className="text-sm">After discussion, vote for who you think is the imposter!</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Game Dashboard - Replace with actual session ID */}
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                Create or join a game session to start playing
              </p>
              {/* <ImposterDashboard
                sessionId="your-session-id"
                userId={userId}
                isHost={isHost}
              /> */}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-6">
          <ExpenseScanner
            eventId={eventId}
            payerId={userId}
            availableFriends={mockFriends}
            onSuccess={() => {
              console.log('Receipt processed successfully!');
            }}
          />

          {/* Expense Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Your Balance</CardTitle>
              <CardDescription>What you paid vs what you owe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-6 bg-green-500/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">You Paid</p>
                  <p className="text-3xl font-bold text-green-600">$125.50</p>
                </div>
                <div className="text-center p-6 bg-red-500/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">You Owe</p>
                  <p className="text-3xl font-bold text-red-600">$45.25</p>
                </div>
                <div className="text-center p-6 bg-blue-500/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Net Balance</p>
                  <p className="text-3xl font-bold text-blue-600">+$80.25</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
