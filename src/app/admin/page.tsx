'use client';

import { useEffect, useState } from 'react';
import { getDashboardStats, forceResetRound, logEvent } from '@/app/actions/admin';

interface Stats {
  activeParties: number;
  totalPoints: number;
  errorRate: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    const result = await getDashboardStats();
    if (result.success && result.stats) {
      setStats(result.stats);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleForceReset = async (gameType: 'spy' | 'race') => {
    if (!confirm(`⚠️ Are you sure you want to force reset the ${gameType} game?`)) {
      return;
    }

    const result = await forceResetRound(gameType);
    if (result.success) {
      alert(`✅ ${result.message}`);
      await logEvent('INFO', 'Admin', `Force reset ${gameType} game from dashboard`);
    } else {
      alert(`❌ Error: ${result.error}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl animate-pulse">Loading Mission Control...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">System Overview</h2>
        <p className="text-gray-400">Real-time monitoring and control</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Active Parties"
          value={stats?.activeParties || 0}
          icon="🎉"
          color="green"
        />
        <StatCard
          title="Total Points"
          value={stats?.totalPoints.toLocaleString() || '0'}
          icon="💰"
          color="yellow"
        />
        <StatCard
          title="Errors (1hr)"
          value={stats?.errorRate || 0}
          icon="⚠️"
          color={stats && stats.errorRate > 0 ? 'red' : 'green'}
        />
      </div>

      {/* God Mode Controls */}
      <div className="bg-red-500/10 border-2 border-red-500/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-2">
          <span>🎮</span> GOD MODE CONTROLS
        </h3>
        <p className="text-gray-400 text-sm mb-6">
          Emergency controls for active game sessions. Use with caution.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleForceReset('spy')}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-4 px-6 rounded-lg transition shadow-lg hover:shadow-red-500/50"
          >
            🕵️ Force Reset Spy Game
          </button>

          <button
            onClick={() => handleForceReset('race')}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-lg transition shadow-lg hover:shadow-purple-500/50"
          >
            🏁 Force Reset Race Game
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickLinkCard
          title="View System Logs"
          description="Browse recent events and errors"
          href="/admin/logs"
          icon="📜"
        />
        <QuickLinkCard
          title="Manage Settings"
          description="Change game configs without redeploying"
          href="/admin/settings"
          icon="⚙️"
        />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: 'green' | 'yellow' | 'red';
}) {
  const colorClasses = {
    green: 'from-green-500/20 to-green-600/20 border-green-500/40',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/40',
    red: 'from-red-500/20 to-red-600/20 border-red-500/40',
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} border-2 rounded-lg p-6 backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
        <span className="text-xs text-gray-400">LIVE</span>
      </div>
      <div className="text-4xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-300">{title}</div>
    </div>
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
  icon: string;
}) {
  return (
    <a
      href={href}
      className="block bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg p-6 transition group"
    >
      <div className="flex items-start gap-4">
        <span className="text-4xl group-hover:scale-110 transition">{icon}</span>
        <div>
          <h4 className="text-lg font-bold text-white mb-1">{title}</h4>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
    </a>
  );
}
