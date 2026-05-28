'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AppIntegrationCard } from '@/components/integrations/AppIntegrationCard';
import { Plus, Loader } from 'lucide-react';
import type { AppIntegration } from '@/lib/db/schema';

const SUPPORTED_APPS = [
  {
    id: 'LIFESTACK',
    name: 'LifeStack',
    description: 'Connect to your LifeStack account for family updates',
    icon: '🔗',
  },
  {
    id: 'NEXUS_OS',
    name: 'Nexus OS',
    description: 'Sync with Nexus OS for unified family management',
    icon: '🌐',
  },
  {
    id: 'CUSTOM',
    name: 'Custom API',
    description: 'Connect any custom API with your own credentials',
    icon: '⚙️',
  },
];

export default function ConnectionsPage() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState<AppIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [formData, setFormData] = useState({
    appId: '',
    appName: '',
    credentials: '',
    metadata: '',
  });

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/integrations');
      if (!response.ok) throw new Error('Failed to load integrations');
      const data = await response.json();
      setIntegrations(data.integrations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load integrations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const payload: any = {
        appId: formData.appId,
        appName: formData.appName,
        credentials: formData.credentials,
      };

      if (formData.metadata) {
        try {
          payload.metadata = JSON.parse(formData.metadata);
        } catch (e) {
          setError('Invalid JSON in metadata');
          return;
        }
      }

      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create integration');
      }

      // Reset form and reload
      setFormData({ appId: '', appName: '', credentials: '', metadata: '' });
      setIsOpen(false);
      await loadIntegrations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create integration');
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      const response = await fetch(`/api/integrations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to revoke integration');
      await loadIntegrations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke');
    }
  };

  const handleTest = async (id: string) => {
    try {
      const response = await fetch(`/api/integrations/${id}/test`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Test failed');
      alert('Integration test successful!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Connected Apps</h1>
        <p className="text-gray-600 mt-2">
          Manage your connections to external services and apps
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Current Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Your Integrations</CardTitle>
          <CardDescription>
            {integrations.length} active{integrations.length === 1 ? ' app' : ' apps'} connected
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader size={24} className="animate-spin text-gray-400" />
            </div>
          ) : integrations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No integrations connected yet</p>
              <p className="text-sm">Add your first integration using the button below</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {integrations.map((integration) => (
                <AppIntegrationCard
                  key={integration.id}
                  integration={integration}
                  onRevoke={handleRevoke}
                  onTest={handleTest}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Integration Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus size={16} />
            Add Integration
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Integration</DialogTitle>
            <DialogDescription>
              Connect your FamilyVerse account with external apps and services
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="appId">App Type</Label>
              <select
                id="appId"
                value={formData.appId}
                onChange={(e) => {
                  const app = SUPPORTED_APPS.find((a) => a.id === e.target.value);
                  setFormData({
                    ...formData,
                    appId: e.target.value,
                    appName: app?.name || '',
                  });
                }}
                className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Select an app...</option>
                {SUPPORTED_APPS.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.icon} {app.name}
                  </option>
                ))}
              </select>
              {formData.appId && (
                <p className="text-sm text-gray-600 mt-2">
                  {SUPPORTED_APPS.find((a) => a.id === formData.appId)?.description}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="appName">App Name (Display)</Label>
              <Input
                id="appName"
                value={formData.appName}
                onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                placeholder="e.g., My LifeStack Account"
              />
            </div>

            <div>
              <Label htmlFor="credentials">API Key or Credentials</Label>
              <Input
                id="credentials"
                type="password"
                value={formData.credentials}
                onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
                placeholder="Your API key (encrypted)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your credentials are encrypted and never logged
              </p>
            </div>

            <div>
              <Label htmlFor="metadata">Additional Configuration (JSON)</Label>
              <Textarea
                id="metadata"
                value={formData.metadata}
                onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
                placeholder='{"webhook_url": "...", "sync_interval": "daily"}'
                className="min-h-20 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Optional: Configure app-specific settings</p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Add Integration
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Supported Apps */}
      <Card>
        <CardHeader>
          <CardTitle>Available Apps</CardTitle>
          <CardDescription>These apps are officially supported</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {SUPPORTED_APPS.map((app) => (
              <div key={app.id} className="border border-gray-200 rounded-lg p-4">
                <p className="text-2xl mb-2">{app.icon}</p>
                <h3 className="font-semibold text-gray-900">{app.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{app.description}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      appId: app.id,
                      appName: app.name,
                    });
                    setIsOpen(true);
                  }}
                >
                  Connect {app.name}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
