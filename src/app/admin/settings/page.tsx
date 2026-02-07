'use client';

import { useEffect, useState } from 'react';
import { getAllSettings, updateSetting } from '@/app/actions/admin';
import { useAuth } from '@/context/AuthContext';

interface GlobalSetting {
  key: string;
  value: string;
  description: string;
  category: string;
  updatedAt: string;
  updatedBy: string | null;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<GlobalSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});

  const fetchSettings = async () => {
    const result = await getAllSettings();
    if (result.success && result.settings) {
      setSettings(result.settings as GlobalSetting[]);
      // Initialize edited values
      const initialValues: Record<string, string> = {};
      (result.settings as GlobalSetting[]).forEach((setting: GlobalSetting) => {
        initialValues[setting.key] = setting.value;
      });
      setEditedValues(initialValues);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (key: string) => {
    if (!user?.email) return;
    
    setSaving(key);
    const result = await updateSetting(key, editedValues[key], user.email);

    if (result.success) {
      alert('✅ Setting updated successfully!');
      await fetchSettings(); // Refresh to show updated timestamp
    } else {
      alert(`❌ Error: ${result.error}`);
    }

    setSaving(null);
  };

  const handleChange = (key: string, value: string) => {
    setEditedValues((prev) => ({ ...prev, [key]: value }));
  };

  const hasChanged = (key: string) => {
    const original = settings.find((s) => s.key === key)?.value;
    return original !== editedValues[key];
  };

  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, GlobalSetting[]>);

  const categoryIcons: Record<string, string> = {
    game: '🎮',
    economy: '💰',
    system: '⚙️',
    general: '📋',
  };

  const categoryColors: Record<string, string> = {
    game: 'from-purple-500/20 to-purple-600/20 border-purple-500/40',
    economy: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/40',
    system: 'from-blue-500/20 to-blue-600/20 border-blue-500/40',
    general: 'from-gray-500/20 to-gray-600/20 border-gray-500/40',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl animate-pulse">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Global Settings</h2>
        <p className="text-gray-400">
          Change these values to control game behavior without redeploying
        </p>
      </div>

      {/* Settings by Category */}
      {Object.entries(groupedSettings).map(([category, categorySettings]) => (
        <div
          key={category}
          className={`bg-gradient-to-br ${categoryColors[category]} border-2 rounded-lg p-6 backdrop-blur-sm`}
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">{categoryIcons[category]}</span>
            {category.toUpperCase()}
          </h3>

          <div className="space-y-4">
            {categorySettings.map((setting) => (
              <div
                key={setting.key}
                className="bg-black/30 rounded-lg p-4 border border-white/10"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-white mb-1">
                      {setting.key}
                    </label>
                    <p className="text-xs text-gray-400 mb-3">
                      {setting.description}
                    </p>

                    <div className="flex items-center gap-2">
                      {/* Boolean toggle */}
                      {(setting.value === 'true' || setting.value === 'false') ? (
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editedValues[setting.key] === 'true'}
                            onChange={(e) =>
                              handleChange(setting.key, e.target.checked ? 'true' : 'false')
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                      ) : (
                        /* Text/Number input */
                        <input
                          type="text"
                          value={editedValues[setting.key] || ''}
                          onChange={(e) => handleChange(setting.key, e.target.value)}
                          className="bg-black/50 border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:border-white/40 w-full max-w-xs"
                        />
                      )}

                      {hasChanged(setting.key) && (
                        <button
                          onClick={() => handleSave(setting.key)}
                          disabled={saving === setting.key}
                          className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded transition disabled:opacity-50"
                        >
                          {saving === setting.key ? 'Saving...' : 'Save'}
                        </button>
                      )}
                    </div>

                    {setting.updatedBy && (
                      <p className="text-xs text-gray-500 mt-2">
                        Last updated by {setting.updatedBy} on{' '}
                        {new Date(setting.updatedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Warning Box */}
      <div className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-lg p-6">
        <h4 className="text-lg font-bold text-yellow-500 mb-2 flex items-center gap-2">
          <span>⚠️</span> Important Notes
        </h4>
        <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
          <li>Changes take effect immediately - no redeployment needed</li>
          <li>Boolean values must be exactly 'true' or 'false'</li>
          <li>Numeric values should not include commas or currency symbols</li>
          <li>All changes are logged in the System Logs</li>
        </ul>
      </div>
    </div>
  );
}
