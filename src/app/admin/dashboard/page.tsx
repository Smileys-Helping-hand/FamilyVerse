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
import { RecentFindsTicker } from '@/components/admin/RecentFindsTicker';
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

        {/* Two-column layout: Main content + Live Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content (3 cols) */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="spy-game" className="space-y-6">
              <TabsList className="flex flex-wrap gap-2 h-auto p-2 md:grid md:grid-cols-7 md:w-full max-w-5xl">
                <TabsTrigger value="spy-game" className="flex-1 min-w-fit">Spy Game</TabsTrigger>
                <TabsTrigger value="parties" className="flex-1 min-w-fit">Parties</TabsTrigger>
                <TabsTrigger value="config" className="flex-1 min-w-fit">Config</TabsTrigger>
                <TabsTrigger value="content" className="flex-1 min-w-fit">Content</TabsTrigger>
                <TabsTrigger value="scannables" className="flex-1 min-w-fit">Scannables</TabsTrigger>
                <TabsTrigger value="print" className="flex-1 min-w-fit">Print</TabsTrigger>
                <TabsTrigger value="players" className="flex-1 min-w-fit">Players</TabsTrigger>
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

          {/* Live Feed Sidebar (1 col) */}
          <div className="lg:col-span-1">
            <RecentFindsTicker />
          </div>
        </div>
      </div>
    </div>
  );
}
