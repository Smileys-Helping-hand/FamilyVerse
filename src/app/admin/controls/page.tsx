'use client';

import { useState } from 'react';
import { forceResetRound, logEvent } from '@/app/actions/admin';

export default function GameControlsPage() {
  const [resetting, setResetting] = useState<string | null>(null);

  const handleForceReset = async (gameType: 'spy' | 'race') => {
    if (
      !confirm(
        `⚠️ DANGER ZONE\n\nAre you absolutely sure you want to force reset the ${gameType.toUpperCase()} game?\n\nThis will:\n• End the current round immediately\n• Reset all player states\n• Clear active game data\n\nThis action cannot be undone.`
      )
    ) {
      return;
    }

    setResetting(gameType);
    const result = await forceResetRound(gameType);

    if (result.success) {
      alert(`✅ SUCCESS\n\n${result.message}\n\nPlayers can now start a fresh round.`);
      await logEvent('INFO', 'Admin', `Force reset ${gameType} game from controls page`);
    } else {
      alert(`❌ ERROR\n\n${result.error}\n\nCheck system logs for details.`);
    }

    setResetting(null);
  };

  const controlButtons = [
    {
      id: 'spy',
      title: 'Spy Game',
      icon: '🕵️',
      description: 'Reset active Imposter rounds and clear player states',
      color: 'from-red-600 to-red-700 hover:from-red-500 hover:to-red-600',
      shadowColor: 'shadow-red-500/50',
    },
    {
      id: 'race',
      title: 'Race Game',
      icon: '🏁',
      description: 'Reset race sessions and clear betting data',
      color: 'from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600',
      shadowColor: 'shadow-purple-500/50',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">🎮 Game Control Panel</h2>
        <p className="text-gray-400">
          Emergency controls for managing active game sessions
        </p>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-500/10 border-4 border-red-500/40 rounded-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl animate-pulse">⚠️</span>
          <div>
            <h3 className="text-2xl font-bold text-red-500">DANGER ZONE</h3>
            <p className="text-sm text-gray-400">
              These actions immediately affect live game sessions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {controlButtons.map((button) => (
            <div
              key={button.id}
              className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-5xl">{button.icon}</span>
                <div>
                  <h4 className="text-xl font-bold text-white">{button.title}</h4>
                  <p className="text-xs text-gray-400">{button.description}</p>
                </div>
              </div>

              <button
                onClick={() => handleForceReset(button.id as 'spy' | 'race')}
                disabled={resetting === button.id}
                className={`w-full bg-gradient-to-r ${button.color} text-white font-bold py-4 px-6 rounded-lg transition shadow-lg hover:${button.shadowColor} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {resetting === button.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span> Resetting...
                  </span>
                ) : (
                  `🔄 Force Reset ${button.title}`
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Guidelines */}
      <div className="bg-blue-500/10 border-2 border-blue-500/30 rounded-lg p-6">
        <h4 className="text-lg font-bold text-blue-500 mb-3 flex items-center gap-2">
          <span>ℹ️</span> When to Use These Controls
        </h4>
        <div className="text-sm text-gray-300 space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <p>Game is stuck or frozen for players</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <p>Players report they can't start a new round</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <p>Timer or state synchronization issues</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <p>Testing game reset functionality</p>
          </div>
        </div>
      </div>

      {/* Action Log */}
      <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-6">
        <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <span>📝</span> Important Notes
        </h4>
        <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
          <li>All control actions are logged in System Logs</li>
          <li>Players will see their game state reset immediately</li>
          <li>No points or progress data is lost - only active game state</li>
          <li>Players can start a new round after reset completes</li>
          <li>Use these controls sparingly - they interrupt active gameplay</li>
        </ul>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href="/admin/logs"
          className="block bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg p-4 transition"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📜</span>
            <div>
              <h5 className="font-bold text-white">View System Logs</h5>
              <p className="text-xs text-gray-400">Check recent control actions</p>
            </div>
          </div>
        </a>

        <a
          href="/admin"
          className="block bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg p-4 transition"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <h5 className="font-bold text-white">Back to Overview</h5>
              <p className="text-xs text-gray-400">Return to main dashboard</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
