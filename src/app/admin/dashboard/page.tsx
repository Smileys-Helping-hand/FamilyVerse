'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfigEditor } from '@/components/game-master/ConfigEditor';
import { ContentManager } from '@/components/game-master/ContentManager';
import { TaskCreator } from '@/components/game-master/TaskCreator';
import { PlayerManager } from '@/components/game-master/PlayerManager';
import ScannableManager from '@/components/game-master/ScannableManager';
import PrintManager from '@/components/game-master/PrintManager';
import { Shield, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ADMIN_PIN = '1234'; // In production, use environment variable or database

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid PIN');
      setPin('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-purple-500" />
            </div>
            <CardTitle className="text-2xl">Game Master Access</CardTitle>
            <CardDescription>Enter PIN to access admin dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Lock className="h-4 w-4" />
                  PIN Code
                </label>
                <Input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter 4-digit PIN"
                  maxLength={4}
                  className="text-center text-2xl tracking-widest"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
              <Button type="submit" className="w-full">
                Access Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Shield className="h-10 w-10 text-purple-400" />
            Game Master Dashboard
          </h1>
          <p className="text-slate-300">Control the Blackout game experience</p>
        </div>

        <Tabs defaultValue="config" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 max-w-4xl mx-auto">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="tasks">Tasks (Old)</TabsTrigger>
            <TabsTrigger value="scannables">Scannables</TabsTrigger>
            <TabsTrigger value="print">Print</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
          </TabsList>

          <TabsContent value="config">
            <ConfigEditor eventId={1} />
          </TabsContent>

          <TabsContent value="content">
            <ContentManager eventId={1} />
          </TabsContent>

          <TabsContent value="tasks">
            <TaskCreator eventId={1} />
          </TabsContent>

          <TabsContent value="scannables">
            <ScannableManager eventId={1} />
          </TabsContent>

          <TabsContent value="print">
            <PrintManager eventId={1} />
          </TabsContent>

          <TabsContent value="players">
            <PlayerManager sessionId="" eventId={1} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
