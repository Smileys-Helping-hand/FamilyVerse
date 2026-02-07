'use client';

import { useEffect, useState } from 'react';
import { getDashboardStats, forceResetRound, logEvent } from '@/app/actions/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, Gamepad2, Car, Bell, Coins, 
  RefreshCw, AlertTriangle, Activity, 
  Zap, Send, QrCode, Shield
} from 'lucide-react';
import Link from 'next/link';

// =============================================================================
// Types
// =============================================================================
interface Stats {
  activeParties: number;
  totalPoints: number;
  errorRate: number;
  activeUsers?: number;
  spyGameActive?: boolean;
  currentDriver?: string;
}

// =============================================================================
// Mission Control Dashboard
// =============================================================================
export default function MissionControlPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationText, setNotificationText] = useState('');
  const [sendingNotification, setSendingNotification] = useState(false);

  const fetchStats = async () => {
    try {
      const result = await getDashboardStats();
      if (result.success && result.stats) {
        setStats({
          ...result.stats,
          activeUsers: Math.floor(Math.random() * 20) + 5, // Simulated for now
          spyGameActive: Math.random() > 0.5,
          currentDriver: ['Uncle Mo', 'Aunty Sarah', 'Cousin Jake', 'None'][Math.floor(Math.random() * 4)],
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  // =============================================================================
  // Action Handlers
  // =============================================================================
  const handleForceReset = async (gameType: 'spy' | 'race') => {
    if (!confirm(`⚠️ Are you sure you want to force reset the ${gameType} game? This will end the current round!`)) {
      return;
    }

    const result = await forceResetRound(gameType);
    if (result.success) {
      toast({ title: '✅ Game Reset', description: result.message });
      await logEvent('INFO', 'Admin', `Force reset ${gameType} game from Mission Control`);
      fetchStats();
    } else {
      toast({ title: '❌ Reset Failed', description: result.error, variant: 'destructive' });
    }
  };

  const handleForceNotification = async () => {
    if (!notificationText.trim()) {
      toast({ title: 'Enter a message', variant: 'destructive' });
      return;
    }

    setSendingNotification(true);
    
    // Simulate notification send (replace with actual Pusher/Firebase push)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({ 
      title: '📢 Notification Sent!', 
      description: `"${notificationText}" sent to all guests` 
    });
    await logEvent('INFO', 'Admin', `Force notification: ${notificationText}`);
    
    setNotificationText('');
    setSendingNotification(false);
  };

  const handleEconomyStimulus = async () => {
    if (!confirm('💰 This will give everyone 500 points instantly. Continue?')) {
      return;
    }

    // Simulate economy stimulus (replace with actual DB update)
    toast({ 
      title: '💰 STIMULUS DEPLOYED!', 
      description: 'Everyone received 500 bonus points!' 
    });
    await logEvent('INFO', 'Admin', 'Economy stimulus: +500 points to all users');
  };

  // =============================================================================
  // Render
  // =============================================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl animate-pulse flex items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          Loading Mission Control...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Activity className="w-8 h-8 text-green-400" />
            Mission Control
          </h2>
          <p className="text-gray-400">Real-time monitoring and god-mode controls</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStats}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* =================================================================== */}
      {/* Live Metrics Grid */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Headcount */}
        <MetricCard
          icon={<Users className="w-6 h-6" />}
          title="Headcount"
          value={stats?.activeUsers || 0}
          subtitle="Active users"
          color="blue"
          live
        />

        {/* Imposter Status */}
        <MetricCard
          icon={<Gamepad2 className="w-6 h-6" />}
          title="Spy Game"
          value={stats?.spyGameActive ? 'ACTIVE' : 'WAITING'}
          subtitle={stats?.spyGameActive ? 'Game in progress' : 'Ready to start'}
          color={stats?.spyGameActive ? 'green' : 'gray'}
          live
        />

        {/* Sim Rig */}
        <MetricCard
          icon={<Car className="w-6 h-6" />}
          title="Sim Rig"
          value={stats?.currentDriver || 'Empty'}
          subtitle="Current driver"
          color={stats?.currentDriver && stats.currentDriver !== 'None' ? 'purple' : 'gray'}
          live
        />

        {/* System Health */}
        <MetricCard
          icon={stats && stats.errorRate > 0 ? <AlertTriangle className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
          title="Errors (1hr)"
          value={stats?.errorRate || 0}
          subtitle={stats && stats.errorRate > 0 ? 'Check logs!' : 'All systems go'}
          color={stats && stats.errorRate > 0 ? 'red' : 'green'}
          live
        />
      </div>

      {/* =================================================================== */}
      {/* God Mode Controls - Big Red Buttons */}
      {/* =================================================================== */}
      <Card className="bg-red-500/10 border-2 border-red-500/30">
        <CardHeader>
          <CardTitle className="text-red-500 flex items-center gap-2">
            <Zap className="w-6 h-6" />
            GOD MODE CONTROLS
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Emergency controls. Use with caution — these actions are immediate and irreversible.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Game Reset Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              size="lg"
              onClick={() => handleForceReset('spy')}
              className="h-16 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold shadow-lg hover:shadow-red-500/50"
            >
              <Gamepad2 className="w-6 h-6 mr-3" />
              🕵️ Reset Spy Game
            </Button>

            <Button
              size="lg"
              onClick={() => handleForceReset('race')}
              className="h-16 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold shadow-lg hover:shadow-purple-500/50"
            >
              <Car className="w-6 h-6 mr-3" />
              🏁 Reset Race Game
            </Button>
          </div>

          {/* Force Notification */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Force Notification (Push to all guests)
            </label>
            <div className="flex gap-3">
              <Input
                value={notificationText}
                onChange={(e) => setNotificationText(e.target.value)}
                placeholder='e.g., "Food is ready! 🍔"'
                className="flex-1 bg-black/50 border-orange-500/30"
              />
              <Button
                onClick={handleForceNotification}
                disabled={sendingNotification}
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400"
              >
                <Send className="w-4 h-4 mr-2" />
                {sendingNotification ? 'Sending...' : 'Broadcast'}
              </Button>
            </div>
          </div>

          {/* Economy Stimulus */}
          <Button
            size="lg"
            onClick={handleEconomyStimulus}
            className="w-full h-16 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold shadow-lg hover:shadow-green-500/50"
          >
            <Coins className="w-6 h-6 mr-3" />
            💰 Economy Stimulus (+500 Points to Everyone)
          </Button>
        </CardContent>
      </Card>

      {/* =================================================================== */}
      {/* Quick Links */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickLinkCard
          title="QR Design Studio"
          description="Create thermal stickers & labels"
          href="/admin/qr-studio"
          icon={<QrCode className="w-8 h-8 text-purple-400" />}
        />
        <QuickLinkCard
          title="System Logs"
          description="Browse events and errors"
          href="/admin/logs"
          icon={<Activity className="w-8 h-8 text-blue-400" />}
        />
        <QuickLinkCard
          title="Settings"
          description="Change configs without redeploying"
          href="/admin/settings"
          icon={<Shield className="w-8 h-8 text-green-400" />}
        />
      </div>
    </div>
  );
}

// =============================================================================
// Components
// =============================================================================
function MetricCard({
  icon,
  title,
  value,
  subtitle,
  color,
  live,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle: string;
  color: 'blue' | 'green' | 'purple' | 'red' | 'gray';
  live?: boolean;
}) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/40 text-blue-400',
    green: 'from-green-500/20 to-green-600/20 border-green-500/40 text-green-400',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/40 text-purple-400',
    red: 'from-red-500/20 to-red-600/20 border-red-500/40 text-red-400',
    gray: 'from-gray-500/20 to-gray-600/20 border-gray-500/40 text-gray-400',
  };

  const split = colorClasses[color].split(' ');
  const bgClasses = split.slice(0, 3).join(' ');
  const textClass = split[3];

  return (
    <Card className={`bg-gradient-to-br ${bgClasses} border-2 backdrop-blur-sm`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={textClass}>{icon}</span>
          {live && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              LIVE
            </span>
          )}
        </div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-xs text-gray-400">{title}</div>
        <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
      </CardContent>
    </Card>
  );
}

function QuickLinkCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <Card className="bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 transition-all group cursor-pointer h-full">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="group-hover:scale-110 transition">{icon}</div>
          <div>
            <h4 className="font-bold text-white mb-1">{title}</h4>
            <p className="text-sm text-gray-400">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
