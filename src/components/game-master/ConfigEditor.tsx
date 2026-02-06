'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  getGameConfig, 
  upsertGameConfig, 
  toggleGamePause,
  adjustPowerLevel 
} from '@/app/actions/game-master';
import { Settings, Pause, Play, Zap, Timer, Moon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface ConfigEditorProps {
  eventId: number;
}

export function ConfigEditor({ eventId }: ConfigEditorProps) {
  const { toast } = useToast();
  const [config, setConfig] = useState<{
    blackoutIntervalMinutes: number;
    killerWindowSeconds: number;
    isGamePaused: boolean;
    powerLevel: number;
  }>({
    blackoutIntervalMinutes: 30,
    killerWindowSeconds: 30,
    isGamePaused: false,
    powerLevel: 100,
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadConfig();
  }, [eventId]);

  const loadConfig = async () => {
    const result = await getGameConfig(eventId);
    if (result.success && result.data) {
      setConfig({
        blackoutIntervalMinutes: result.data.blackoutIntervalMinutes,
        killerWindowSeconds: result.data.killerWindowSeconds,
        isGamePaused: result.data.isGamePaused,
        powerLevel: result.data.powerLevel,
      });
    }
  };

  const handleSaveConfig = async () => {
    setIsLoading(true);
    const result = await upsertGameConfig(eventId, config);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: 'Configuration Saved',
        description: 'Game settings updated successfully',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleTogglePause = async () => {
    const result = await toggleGamePause(eventId);
    if (result.success) {
      setConfig((prev) => ({ ...prev, isGamePaused: result.data }));
      toast({
        title: result.data ? 'Game Paused' : 'Game Resumed',
        description: result.data 
          ? 'All timers are frozen' 
          : 'Game timers are running',
      });
    }
  };

  const handlePowerAdjust = async (delta: number) => {
    const result = await adjustPowerLevel(eventId, delta);
    if (result.success) {
      setConfig((prev) => ({ ...prev, powerLevel: result.data }));
    }
  };

  const getPowerLevelColor = () => {
    if (config.powerLevel > 70) return 'bg-green-500';
    if (config.powerLevel > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Blackout Timing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-purple-500" />
            Blackout Timing
          </CardTitle>
          <CardDescription>
            Configure the day/night cycle durations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="interval">
              Blackout Interval (minutes)
            </Label>
            <Input
              id="interval"
              type="number"
              min={5}
              max={120}
              value={config.blackoutIntervalMinutes}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  blackoutIntervalMinutes: parseInt(e.target.value) || 30,
                }))
              }
            />
            <p className="text-sm text-muted-foreground">
              Time between blackout events (default: 30)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="killer-window">
              Killer Window (seconds)
            </Label>
            <Input
              id="killer-window"
              type="number"
              min={10}
              max={120}
              value={config.killerWindowSeconds}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  killerWindowSeconds: parseInt(e.target.value) || 30,
                }))
              }
            />
            <p className="text-sm text-muted-foreground">
              How long the killer has during night phase (default: 30)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Game Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-indigo-500" />
            Game Control
          </CardTitle>
          <CardDescription>
            Pause/resume and emergency controls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg">
            <div className="space-y-0.5">
              <Label className="text-base">Game Status</Label>
              <p className="text-sm text-muted-foreground">
                {config.isGamePaused ? 'All timers frozen' : 'Game active'}
              </p>
            </div>
            <Button
              variant={config.isGamePaused ? 'default' : 'destructive'}
              size="lg"
              onClick={handleTogglePause}
            >
              {config.isGamePaused ? (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </>
              )}
            </Button>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Power Level: {config.powerLevel}%
            </Label>
            <Progress 
              value={config.powerLevel} 
              className={`h-4 ${getPowerLevelColor()}`}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePowerAdjust(-10)}
                disabled={config.powerLevel === 0}
              >
                -10%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePowerAdjust(10)}
                disabled={config.powerLevel === 100}
              >
                +10%
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                onClick={() => handlePowerAdjust(100 - config.powerLevel)}
              >
                Reset to 100%
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Low power triggers blackouts faster. Tasks boost power.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="md:col-span-2">
        <Card>
          <CardContent className="pt-6">
            <Button
              onClick={handleSaveConfig}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              <Settings className="mr-2 h-5 w-5" />
              {isLoading ? 'Saving...' : 'Save Configuration'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
