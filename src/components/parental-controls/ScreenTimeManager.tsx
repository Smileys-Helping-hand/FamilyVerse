"use client";

import { useState } from "react";
import { ScreenTimeRules } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Clock, Moon, Bell, MapPin, X } from "lucide-react";

interface ScreenTimeManagerProps {
  initialRules?: Partial<ScreenTimeRules>;
  onSave: (rules: Partial<ScreenTimeRules>) => void;
  onCancel: () => void;
}

export function ScreenTimeManager({
  initialRules,
  onSave,
  onCancel,
}: ScreenTimeManagerProps) {
  const [dailyLimit, setDailyLimit] = useState(
    initialRules?.dailyLimitMinutes || 120
  );
  const [weeklyLimit, setWeeklyLimit] = useState(
    initialRules?.weeklyLimitMinutes || 840
  );
  const [allowedStart, setAllowedStart] = useState(
    initialRules?.allowedHours?.start || "08:00"
  );
  const [allowedEnd, setAllowedEnd] = useState(
    initialRules?.allowedHours?.end || "20:00"
  );
  const [bedtimeEnabled, setBedtimeEnabled] = useState(
    initialRules?.bedtimeMode?.enabled ?? true
  );
  const [bedtimeStart, setBedtimeStart] = useState(
    initialRules?.bedtimeMode?.start || "21:00"
  );
  const [bedtimeEnd, setBedtimeEnd] = useState(
    initialRules?.bedtimeMode?.end || "07:00"
  );
  const [breakRemindersEnabled, setBreakRemindersEnabled] = useState(
    initialRules?.breakReminders?.enabled ?? true
  );
  const [breakInterval, setBreakInterval] = useState(
    initialRules?.breakReminders?.intervalMinutes || 30
  );
  const [deviceFreeZones, setDeviceFreeZones] = useState<string[]>(
    initialRules?.deviceFreeZones || ["bedroom", "dining table"]
  );
  const [newZone, setNewZone] = useState("");

  const addDeviceFreeZone = () => {
    if (newZone.trim() && !deviceFreeZones.includes(newZone.trim())) {
      setDeviceFreeZones([...deviceFreeZones, newZone.trim()]);
      setNewZone("");
    }
  };

  const removeZone = (zone: string) => {
    setDeviceFreeZones(deviceFreeZones.filter((z) => z !== zone));
  };

  const handleSave = () => {
    onSave({
      dailyLimitMinutes: dailyLimit,
      weeklyLimitMinutes: weeklyLimit,
      allowedHours: {
        start: allowedStart,
        end: allowedEnd,
      },
      bedtimeMode: {
        enabled: bedtimeEnabled,
        start: bedtimeStart,
        end: bedtimeEnd,
      },
      breakReminders: {
        enabled: breakRemindersEnabled,
        intervalMinutes: breakInterval,
      },
      deviceFreeZones,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="border-2 hover:border-sky-200 transition-all duration-300 bg-gradient-to-br from-white to-sky-50/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <CardTitle>Daily & Weekly Limits</CardTitle>
          </div>
          <CardDescription>
            Set maximum screen time to promote healthy device habits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Daily Limit</Label>
              <span className="text-sm font-medium bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">
                {Math.floor(dailyLimit / 60)}h {dailyLimit % 60}m
              </span>
            </div>
            <Slider
              value={[dailyLimit]}
              onValueChange={(value) => setDailyLimit(value[0])}
              min={15}
              max={480}
              step={15}
              className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-sky-500 [&_[role=slider]]:to-purple-500 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg"
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Weekly Limit</Label>
              <span className="text-sm font-medium bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">
                {Math.floor(weeklyLimit / 60)}h {weeklyLimit % 60}m
              </span>
            </div>
            <Slider
              value={[weeklyLimit]}
              onValueChange={(value) => setWeeklyLimit(value[0])}
              min={60}
              max={3360}
              step={30}
              className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-sky-500 [&_[role=slider]]:to-purple-500 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 hover:border-blue-200 transition-all duration-300 bg-gradient-to-br from-white to-blue-50/20">
        <CardHeader>
          <CardTitle>Allowed Hours</CardTitle>
          <CardDescription>
            Set when your child can use devices during the day
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={allowedStart}
                onChange={(e) => setAllowedStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={allowedEnd}
                onChange={(e) => setAllowedEnd(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 hover:border-indigo-200 transition-all duration-300 bg-gradient-to-br from-white to-indigo-50/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-indigo-600" />
            <CardTitle>Bedtime Mode</CardTitle>
          </div>
          <CardDescription>
            Automatically restrict device access during sleep hours
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Bedtime Mode</Label>
            <Switch
              checked={bedtimeEnabled}
              onCheckedChange={setBedtimeEnabled}
            />
          </div>
          {bedtimeEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedtime-start">Bedtime Start</Label>
                <Input
                  id="bedtime-start"
                  type="time"
                  value={bedtimeStart}
                  onChange={(e) => setBedtimeStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bedtime-end">Wake Up Time</Label>
                <Input
                  id="bedtime-end"
                  type="time"
                  value={bedtimeEnd}
                  onChange={(e) => setBedtimeEnd(e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-2 hover:border-yellow-200 transition-all duration-300 bg-gradient-to-br from-white to-yellow-50/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-yellow-600" />
            <CardTitle>Break Reminders</CardTitle>
          </div>
          <CardDescription>
            Remind your child to take regular breaks from screens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Break Reminders</Label>
            <Switch
              checked={breakRemindersEnabled}
              onCheckedChange={setBreakRemindersEnabled}
            />
          </div>
          {breakRemindersEnabled && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Reminder Interval</Label>
                <span className="text-sm font-medium bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">{breakInterval} minutes</span>
              </div>
              <Slider
                value={[breakInterval]}
                onValueChange={(value) => setBreakInterval(value[0])}
                min={15}
                max={120}
                step={15}
                className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-yellow-500 [&_[role=slider]]:to-orange-500 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-2 hover:border-emerald-200 transition-all duration-300 bg-gradient-to-br from-white to-emerald-50/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-600" />
            <CardTitle>Device-Free Zones</CardTitle>
          </div>
          <CardDescription>
            Designate areas where devices should not be used
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., bedroom, dinner table..."
              value={newZone}
              onChange={(e) => setNewZone(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addDeviceFreeZone()}
            />
            <Button onClick={addDeviceFreeZone}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {deviceFreeZones.map((zone) => (
              <Badge key={zone} variant="secondary" className="gap-1 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200 hover:shadow-md transition-all duration-200 animate-in fade-in zoom-in-50">
                {zone}
                <button
                  onClick={() => removeZone(zone)}
                  className="ml-1 hover:bg-emerald-300 rounded-full p-0.5 transition-all duration-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200">
          Cancel
        </Button>
        <Button onClick={handleSave} className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
          Save Screen Time Rules
        </Button>
      </div>
    </div>
  );
}
