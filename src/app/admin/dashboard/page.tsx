import { redirect } from 'next/navigation';
import { getCurrentPartyUserAction } from '@/app/actions/party-logic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfigEditor } from '@/components/game-master/ConfigEditor';
import { ContentManager } from '@/components/game-master/ContentManager';
import { TaskCreator } from '@/components/game-master/TaskCreator';
import { PlayerManager } from '@/components/game-master/PlayerManager';
import ScannableManager from '@/components/game-master/ScannableManager';
import PrintManager from '@/components/game-master/PrintManager';
import { LogoutButton } from '@/components/party/LogoutButton';
import { SpyGameControl } from '@/components/party/SpyGameControl';
import { PartyManagement } from '@/components/party/PartyManagement';
import { Shield } from 'lucide-react';

export default async function AdminDashboard() {
  // Check if user is authenticated and is admin
  const user = await getCurrentPartyUserAction();
  
  if (!user) {
    // Not logged in, redirect to join page
    redirect('/party/join');
  }
  
  if (user.role !== 'admin') {
    // Not an admin, redirect to guest dashboard
    redirect('/party/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with User Info */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Shield className="h-10 w-10 text-purple-400" />
              Game Master Dashboard
            </h1>
            <div className="flex items-center gap-4 text-white">
              <div className="text-right">
                <p className="text-sm text-slate-300">Logged in as</p>
                <p className="font-bold">{user.name}</p>
              </div>
              <LogoutButton />
            </div>
          </div>
          <p className="text-slate-300">Control the Blackout game experience</p>
        </div>

        <Tabs defaultValue="spy-game" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 max-w-5xl mx-auto">
            <TabsTrigger value="spy-game">Spy Game</TabsTrigger>
            <TabsTrigger value="parties">Parties</TabsTrigger>
            <TabsTrigger value="config">Config</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="scannables">Scannables</TabsTrigger>
            <TabsTrigger value="print">Print</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
          </TabsList>

          <TabsContent value="spy-game">
            <SpyGameControl />
          </TabsContent>

          <TabsContent value="parties">
            <PartyManagement />
          </TabsContent>

          <TabsContent value="config">
            <ConfigEditor eventId={1} />
          </TabsContent>

          <TabsContent value="content">
            <ContentManager eventId={1} />
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
