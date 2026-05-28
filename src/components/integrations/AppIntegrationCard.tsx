'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { CheckCircle, XCircle, Clock, Trash2, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { AppIntegration } from '@/lib/db/schema';

interface AppIntegrationCardProps {
  integration: AppIntegration;
  onRevoke?: (id: string) => Promise<void>;
  onTest?: (id: string) => Promise<void>;
}

export function AppIntegrationCard({
  integration,
  onRevoke,
  onTest,
}: AppIntegrationCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStatusColor = () => {
    switch (integration.status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-50';
      case 'REVOKED':
        return 'text-red-600 bg-red-50';
      case 'EXPIRED':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = () => {
    switch (integration.status) {
      case 'ACTIVE':
        return <CheckCircle size={16} />;
      case 'REVOKED':
        return <XCircle size={16} />;
      case 'EXPIRED':
        return <Clock size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const handleTest = async () => {
    if (!onTest) return;
    setIsLoading(true);
    setError(null);

    try {
      await onTest(integration.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!onRevoke) return;
    setIsLoading(true);
    setError(null);

    try {
      await onRevoke(integration.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Revoke failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>{integration.appName}</span>
            <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor()}`}>
              {getStatusIcon()}
              {integration.status}
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500 text-xs">App ID</p>
            <p className="font-mono text-sm text-gray-900">{integration.appId}</p>
          </div>
          {integration.lastUsedAt && (
            <div>
              <p className="text-gray-500 text-xs">Last Used</p>
              <p className="text-sm text-gray-900">
                {formatDistanceToNow(new Date(integration.lastUsedAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          )}
          {integration.expiresAt && (
            <div>
              <p className="text-gray-500 text-xs">Expires</p>
              <p className="text-sm text-gray-900">
                {formatDistanceToNow(new Date(integration.expiresAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          )}
        </div>

        {integration.metadata && Object.keys(integration.metadata).length > 0 && (
          <div className="bg-gray-50 p-2 rounded text-xs text-gray-600">
            <p className="font-medium mb-1">Configuration:</p>
            <pre className="text-xs overflow-auto max-h-24">
              {JSON.stringify(integration.metadata, null, 2)}
            </pre>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          {integration.status === 'ACTIVE' && onTest && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleTest}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Test Connection
            </Button>
          )}

          {onRevoke && integration.status !== 'REVOKED' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isLoading}
                  className="gap-2 ml-auto"
                >
                  <Trash2 size={16} />
                  Revoke
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogTitle>Revoke Integration</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to revoke access to {integration.appName}? You can
                  reconnect later.
                </AlertDialogDescription>
                <div className="flex gap-3">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRevoke}>Revoke</AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <p className="text-xs text-gray-500">
          Connected {formatDistanceToNow(new Date(integration.createdAt), { addSuffix: true })}
        </p>
      </CardContent>
    </Card>
  );
}
