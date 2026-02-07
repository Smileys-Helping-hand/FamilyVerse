'use client';

import { useEffect, useState } from 'react';
import { getRecentLogs } from '@/app/actions/admin';

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

interface SystemLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
  metaData?: Record<string, any>;
  userId?: string | null;
  ipAddress?: string | null;
}

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LogLevel | 'ALL'>('ALL');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLogs = async () => {
    const filterLevel = filter === 'ALL' ? undefined : filter;
    const result = await getRecentLogs(100, filterLevel);

    if (result.success && result.logs) {
      setLogs(result.logs as SystemLog[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchLogs, 5000); // Auto-refresh every 5s
    return () => clearInterval(interval);
  }, [autoRefresh, filter]);

  const levelColors = {
    INFO: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    WARN: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    ERROR: 'bg-red-500/20 text-red-400 border-red-500/40',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">System Logs</h2>
          <p className="text-gray-400">
            Showing {logs.length} recent events
            {autoRefresh && (
              <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                🔄 Auto-refreshing
              </span>
            )}
          </p>
        </div>

        {/* Auto-refresh toggle */}
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`px-4 py-2 rounded font-semibold transition ${
            autoRefresh
              ? 'bg-green-500/20 text-green-400 border border-green-500/40'
              : 'bg-gray-700 text-gray-400'
          }`}
        >
          {autoRefresh ? '⏸ Pause' : '▶ Resume'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map((level) => (
          <button
            key={level}
            onClick={() => setFilter(level)}
            className={`px-4 py-2 rounded font-semibold transition ${
              filter === level
                ? 'bg-white text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading logs...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No logs found</div>
      ) : (
        <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">
                    Level
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">
                    Source
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">
                    Message
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition">
                    <td className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded border ${
                          levelColors[log.level]
                        }`}
                      >
                        {log.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {log.source}
                    </td>
                    <td className="px-4 py-3 text-sm text-white max-w-md">
                      {log.message}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {log.metaData && (
                        <details className="cursor-pointer">
                          <summary className="text-blue-400 hover:text-blue-300">
                            View JSON
                          </summary>
                          <pre className="mt-2 p-2 bg-black/50 rounded text-xs overflow-auto max-w-xs">
                            {JSON.stringify(log.metaData, null, 2)}
                          </pre>
                        </details>
                      )}
                      {log.userId && (
                        <div className="text-gray-500 mt-1">User: {log.userId}</div>
                      )}
                      {log.ipAddress && (
                        <div className="text-gray-500">IP: {log.ipAddress}</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
