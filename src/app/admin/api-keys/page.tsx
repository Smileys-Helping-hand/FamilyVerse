"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, PlusCircle } from "lucide-react";
import { getApiKeys, createApiKey, revokeApiKey } from '@/app/actions/apiKeys';
import { getRecentLogs } from '@/app/actions/admin';

function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState([]);
  const [newKey, setNewKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [auditLogs, setAuditLogs] = useState([]);
  const [logUserFilter, setLogUserFilter] = useState("");
  const [logActionFilter, setLogActionFilter] = useState("");
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    getApiKeys().then(keys => {
      setApiKeys(keys);
      setLoading(false);
    });
    // Fetch audit logs for API key actions
    getRecentLogs(100, undefined).then(res => {
      if (res.success && res.logs) {
        setAuditLogs(res.logs.filter(log => log.source === 'APIKey'));
      }
    });
  }, []);

  // Advanced audit log filtering
  const filteredAuditLogs = auditLogs.filter(log => {
    const userMatch = log.metaData && log.metaData.createdBy && logUserFilter
      ? log.metaData.createdBy.toLowerCase().includes(logUserFilter.toLowerCase())
      : log.metaData && log.metaData.revokedBy && logUserFilter
        ? log.metaData.revokedBy.toLowerCase().includes(logUserFilter.toLowerCase())
        : !logUserFilter;
    const actionMatch = logActionFilter
      ? log.message.toLowerCase().includes(logActionFilter.toLowerCase())
      : true;
    return userMatch && actionMatch;
  });

  // Export logs as CSV
  const exportLogs = () => {
    const header = 'Timestamp,Level,Action,User,MetaData\n';
    const rows = filteredAuditLogs.map(log => {
      const user = log.metaData?.createdBy || log.metaData?.revokedBy || '';
      return `"${log.timestamp}","${log.level}","${log.message}","${user}","${JSON.stringify(log.metaData)}"`;
    });
    const csv = header + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'api-key-audit-log.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerate = async () => {
    try {
      const key = await createApiKey();
      if (key) {
        setNewKey(key.key);
        setApiKeys(keys => [key, ...keys]);
        setToastMsg({ type: 'success', text: 'API Key generated!' });
      }
    } catch (e) {
      setToastMsg({ type: 'error', text: 'Failed to generate API key.' });
    }
  };

  const handleCopy = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setToastMsg({ type: 'success', text: 'API Key copied!' });
    }
  };

  const handleRevoke = async (id) => {
    if (window.confirm("Revoke this API key?")) {
      try {
        await revokeApiKey(id);
        setApiKeys(keys => keys.filter(k => k.id !== id));
        setToastMsg({ type: 'success', text: 'API Key revoked.' });
      } catch (e) {
        setToastMsg({ type: 'error', text: 'Failed to revoke API key.' });
      }
    }
  };
  // Filtering logic
  const filteredKeys = apiKeys.filter(k => {
    const matchesSearch = search === "" || (k.key && k.key.includes(search)) || (k.createdBy && k.createdBy.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "all" || k.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-br from-purple-900/40 to-slate-900/60 border-purple-700/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-300">
            <PlusCircle className="w-6 h-6" />
            API Key Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Toast message */}
          {toastMsg && (
            <div className={`mb-4 px-4 py-2 rounded text-sm font-semibold ${toastMsg.type === 'success' ? 'bg-green-700 text-white' : 'bg-red-700 text-white'}`}>{toastMsg.text}</div>
          )}
          {/* Generate Key Button and new key display */}
          <div className="flex flex-col gap-2 mb-4">
            <Button onClick={handleGenerate} className="w-fit bg-purple-700 hover:bg-purple-600 text-white font-bold">
              <PlusCircle className="w-4 h-4 mr-2" /> Generate New API Key
            </Button>
            {newKey && (
              <div className="flex items-center gap-2 bg-black/40 border border-purple-700/30 rounded px-3 py-2 mt-2">
                <span className="font-mono text-purple-100">{newKey}</span>
                <Button size="sm" variant="outline" onClick={handleCopy}><Copy className="w-4 h-4" /> Copy</Button>
              </div>
            )}
          </div>
          <div className="flex gap-4 items-center mt-6">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-black/40 border border-purple-700/30 rounded px-2 py-1 text-purple-100"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>
          <h3 className="text-lg font-bold text-purple-200 mt-6">Existing Keys</h3>
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : (
            <ul className="space-y-2">
              {filteredKeys.map(k => (
                <li key={k.id} className="flex items-center justify-between bg-white/5 border border-purple-700/20 rounded p-2">
                  <div>
                    <span className="font-mono text-purple-100">{k.key ? k.key.slice(0, 16) + "..." : k.id}</span>
                    <span className="ml-2 text-xs text-gray-400">{new Date(k.createdAt).toLocaleString()}</span>
                    <span className={"ml-2 text-xs " + (k.status === 'active' ? 'text-green-400' : 'text-red-400')}>{k.status}</span>
                    <span className="ml-2 text-xs text-purple-300">{k.createdBy}</span>
                  </div>
                  {k.status === 'active' && (
                    <Button size="sm" variant="destructive" onClick={() => handleRevoke(k.id)}>Revoke</Button>
                  )}
                </li>
              ))}
              {filteredKeys.length === 0 && <li className="text-gray-400">No API keys found.</li>}
                        <h3 className="text-lg font-bold text-purple-200 mt-8">Audit Log</h3>
                        <div className="flex gap-4 items-center mb-2">
                          <input
                            type="text"
                            placeholder="Filter by user..."
                            value={logUserFilter}
                            onChange={e => setLogUserFilter(e.target.value)}
                            className="bg-black/40 border border-purple-700/30 rounded px-2 py-1 text-purple-100"
                          />
                          <input
                            type="text"
                            placeholder="Filter by action..."
                            value={logActionFilter}
                            onChange={e => setLogActionFilter(e.target.value)}
                            className="bg-black/40 border border-purple-700/30 rounded px-2 py-1 text-purple-100"
                          />
                          <button
                            onClick={exportLogs}
                            className="bg-purple-700 hover:bg-purple-600 text-white px-3 py-1 rounded text-xs font-bold"
                          >
                            Export CSV
                          </button>
                        </div>
                        <ul className="space-y-1">
                          {filteredAuditLogs.map(log => (
                            <li key={log.id} className="text-xs text-purple-100 bg-black/20 border border-purple-700/20 rounded p-2">
                              <span className="font-bold">[{log.level}]</span> {log.timestamp} - {log.message}
                              {log.metaData && (
                                <span className="ml-2 text-purple-300">{JSON.stringify(log.metaData)}</span>
                              )}
                            </li>
                          ))}
                          {filteredAuditLogs.length === 0 && <li className="text-gray-400">No audit log entries.</li>}
                        </ul>
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ApiKeysPage;
