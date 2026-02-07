'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Coins, Trophy, Gamepad2, TrendingUp, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { SimLeaderboard } from '@/components/party/SimLeaderboard';
import { BettingSlip } from '@/components/party/BettingSlip';
import { ImposterCard } from '@/components/party/ImposterCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PartyUser {
  id: string;
  name: string;
  pinCode: number;
  avatarUrl: string | null;
  walletBalance: number;
  status?: string;
  createdAt: Date;
}

export default function PartyDashboardClient({ user }: { user: PartyUser }) {
  const { user: firebaseUser } = useAuth();
  const isAdmin = firebaseUser?.email === 'mraaziqp@gmail.com';

  // Check if user is pending approval
  if (user.status === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">⏳ Awaiting Approval</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-lg">Hi {user.name}! 👋</p>
              <p className="text-muted-foreground">
                The host needs to approve your entry before you can join the party.
              </p>
              <div className="bg-muted p-4 rounded-lg mt-4">
                <p className="text-sm text-muted-foreground mb-1">Your PIN Code:</p>
                <p className="text-3xl font-mono font-bold">{user.pinCode}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Use this to log back in later
                </p>
              </div>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <p>This page will refresh automatically once you're approved.</p>
            </div>
            <Link href="/party/join" className="block">
              <Button variant="outline" className="w-full">
                Back to Join
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user is rejected
  if (user.status === 'rejected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">❌ Entry Denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-lg">Sorry {user.name},</p>
              <p className="text-muted-foreground">
                The host has denied your entry to this party.
              </p>
            </div>
            <Link href="/party/join" className="block">
              <Button variant="outline" className="w-full">
                Try Another Party
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            {isAdmin && (
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  🚨 Admin Control
                </Button>
              </Link>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full" />
                ) : (
                  <User className="w-8 h-8" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <p className="text-white/80">PIN: {user.pinCode}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                <Coins className="w-5 h-5" />
                <span className="text-3xl font-bold">{user.walletBalance}</span>
              </div>
              <p className="text-white/80 text-sm">Party Coins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <Tabs defaultValue="racing" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="racing">
              <Trophy className="w-4 h-4 mr-2" />
              Racing
            </TabsTrigger>
            <TabsTrigger value="imposter">
              <Gamepad2 className="w-4 h-4 mr-2" />
              Imposter
            </TabsTrigger>
            <TabsTrigger value="betting">
              <TrendingUp className="w-4 h-4 mr-2" />
              Betting
            </TabsTrigger>
          </TabsList>

          <TabsContent value="racing" className="space-y-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <SimLeaderboard />
            </motion.div>
          </TabsContent>

          <TabsContent value="imposter" className="space-y-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ImposterCard />
            </motion.div>

            <Card>
              <CardHeader>
                <CardTitle>How to Play</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>🎭 <strong>Civilians:</strong> Everyone gets the same secret word</p>
                <p>🕵️ <strong>Imposter:</strong> One player gets a different hint</p>
                <p>💬 <strong>Discuss:</strong> Take turns describing your word without saying it</p>
                <p>🗳️ <strong>Vote:</strong> Discuss and vote who you think is the imposter</p>
                <p>🏆 <strong>Win:</strong> Civilians win by finding the imposter, Imposter wins by blending in</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="betting" className="space-y-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <BettingSlip currentUser={user} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
