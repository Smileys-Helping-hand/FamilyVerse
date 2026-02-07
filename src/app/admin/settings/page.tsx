'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getAllSettings, updateSetting } from '@/app/actions/admin';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Gamepad2, 
  Wallet, 
  Wrench, 
  Save, 
  RefreshCw, 
  Check,
  Loader2,
  Trophy,
  Timer,
  Users,
  Volume2
} from 'lucide-react';

interface GlobalSetting {
  key: string;
  value: string;
  description: string;
  category: string;
  inputType?: string;
  label?: string;
  updatedAt: string;
  updatedBy: string | null;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<GlobalSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('game');

  const fetchSettings = async () => {
    const result = await getAllSettings();
    if (result.success && result.settings) {
      setSettings(result.settings as GlobalSetting[]);
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
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
      await fetchSettings();
    } else {
      alert(`Error: ${result.error}`);
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
    const cat = setting.category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(setting);
    return acc;
  }, {} as Record<string, GlobalSetting[]>);

  const categoryConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    game: { icon: <Gamepad2 className="h-4 w-4" />, label: 'Games', color: 'bg-purple-500' },
    economy: { icon: <Wallet className="h-4 w-4" />, label: 'Economy', color: 'bg-yellow-500' },
    system: { icon: <Wrench className="h-4 w-4" />, label: 'System', color: 'bg-blue-500' },
    general: { icon: <Settings className="h-4 w-4" />, label: 'General', color: 'bg-gray-500' },
  };

  const getSettingIcon = (key: string) => {
    if (key.includes('timer') || key.includes('timeout') || key.includes('duration')) return <Timer className="h-4 w-4" />;
    if (key.includes('points') || key.includes('bonus')) return <Trophy className="h-4 w-4" />;
    if (key.includes('max') || key.includes('size')) return <Users className="h-4 w-4" />;
    if (key.includes('volume') || key.includes('sound')) return <Volume2 className="h-4 w-4" />;
    return <Settings className="h-4 w-4" />;
  };

  const renderSettingInput = (setting: GlobalSetting) => {
    const isBoolean = setting.value === 'true' || setting.value === 'false' || setting.inputType === 'BOOLEAN';
    const isNumber = !isNaN(Number(setting.value)) || setting.inputType === 'NUMBER';
    const currentValue = editedValues[setting.key] ?? setting.value;

    if (isBoolean) {
      return (
        <div className="flex items-center gap-3">
          <Switch
            checked={currentValue === 'true'}
            onCheckedChange={(checked) => handleChange(setting.key, checked ? 'true' : 'false')}
            className="data-[state=checked]:bg-green-500"
          />
          <span className={`text-sm font-medium ${currentValue === 'true' ? 'text-green-400' : 'text-gray-400'}`}>
            {currentValue === 'true' ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      );
    }

    if (isNumber) {
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleChange(setting.key, String(Number(currentValue) - 1))}
            className="h-8 w-8 p-0 bg-slate-800 border-slate-600"
          >
            -
          </Button>
          <Input
            type="number"
            value={currentValue}
            onChange={(e) => handleChange(setting.key, e.target.value)}
            className="w-24 h-8 text-center bg-slate-800 border-slate-600 text-white font-mono"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleChange(setting.key, String(Number(currentValue) + 1))}
            className="h-8 w-8 p-0 bg-slate-800 border-slate-600"
          >
            +
          </Button>
        </div>
      );
    }

    return (
      <Input
        type="text"
        value={currentValue}
        onChange={(e) => handleChange(setting.key, e.target.value)}
        className="max-w-xs bg-slate-800 border-slate-600 text-white"
      />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const categories = Object.keys(groupedSettings);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Global Settings</h2>
          <p className="text-gray-400">
            Control game behavior without redeploying
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchSettings}
          className="bg-slate-800 border-slate-600"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Important Notes */}
      <Card className="bg-yellow-500/10 border-yellow-500/30">
        <CardContent className="pt-6">
          <h4 className="text-lg font-bold text-yellow-500 mb-2 flex items-center gap-2">
            ⚠️ Important Notes
          </h4>
          <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
            <li>Changes take effect immediately - no redeployment needed</li>
            <li>Boolean values must be exactly &apos;true&apos; or &apos;false&apos;</li>
            <li>Numeric values should not include commas or currency symbols</li>
            <li>All changes are logged in the System Logs</li>
          </ul>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      {categories.length > 0 ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
            {categories.map((category) => {
              const config = categoryConfig[category] || categoryConfig.general;
              return (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="data-[state=active]:bg-white data-[state=active]:text-black flex items-center gap-2"
                >
                  {config.icon}
                  {config.label}
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {groupedSettings[category].length}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="mt-6">
              <div className="grid gap-4">
                {groupedSettings[category].map((setting, index) => (
                  <motion.div
                    key={setting.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-slate-900/50 border-slate-700/50 hover:border-slate-600 transition-colors">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded ${categoryConfig[category]?.color || 'bg-gray-500'}`}>
                                {getSettingIcon(setting.key)}
                              </div>
                              <h4 className="font-semibold text-white">
                                {setting.label || setting.key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                              </h4>
                            </div>
                            <p className="text-sm text-gray-400">{setting.description}</p>
                            <code className="text-xs text-gray-500 bg-slate-800 px-2 py-1 rounded">
                              {setting.key}
                            </code>
                          </div>

                          <div className="flex items-center gap-3">
                            {renderSettingInput(setting)}

                            {hasChanged(setting.key) && (
                              <Button
                                onClick={() => handleSave(setting.key)}
                                disabled={saving === setting.key}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {saving === setting.key ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : saved === setting.key ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <>
                                    <Save className="h-4 w-4 mr-1" />
                                    Save
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>

                        {setting.updatedBy && (
                          <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-slate-700">
                            Last updated by {setting.updatedBy} on{' '}
                            {new Date(setting.updatedAt).toLocaleString()}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <Card className="bg-slate-900/50 border-slate-700">
          <CardContent className="pt-12 pb-12 text-center">
            <Settings className="h-16 w-16 mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Settings Found</h3>
            <p className="text-gray-400 mb-6">
              Run the Genesis Setup to initialize default settings.
            </p>
            <Button asChild className="bg-purple-600 hover:bg-purple-700">
              <a href="/setup/genesis">🚀 Run Genesis Setup</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
