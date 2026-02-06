"use client";

import { ChildProfile, ScreenTimeRules } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Clock, Shield, TrendingUp } from "lucide-react";

interface ChildProfileCardProps {
  child: ChildProfile;
  screenTimeToday?: number;
  screenTimeLimit?: number;
  onManage: (childId: string) => void;
}

export function ChildProfileCard({
  child,
  screenTimeToday = 0,
  screenTimeLimit = 120,
  onManage,
}: ChildProfileCardProps) {
  const screenTimePercentage = Math.min(
    (screenTimeToday / screenTimeLimit) * 100,
    100
  );
  const isNearLimit = screenTimePercentage > 80;
  const isOverLimit = screenTimePercentage >= 100;

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-sky-200 bg-gradient-to-br from-white to-sky-50/30">
      <CardHeader className="pb-4 bg-gradient-to-r from-sky-500/10 to-purple-500/10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-sky-400/20 ring-offset-2 transition-all hover:ring-sky-400/50">
              <AvatarImage src={child.avatar} alt={child.name} />
              <AvatarFallback className="bg-gradient-to-br from-sky-400 to-purple-500 text-white font-semibold">{child.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="animate-in fade-in slide-in-from-left-2 duration-500">
              <CardTitle className="text-lg">{child.name}</CardTitle>
              <p className="text-sm text-muted-foreground">Age {child.age}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onManage(child.id)}
            className="hover:bg-sky-100 hover:text-sky-600 transition-all duration-200 hover:rotate-90"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Screen Time Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Screen Time Today</span>
            </div>
            <span
              className={
                isOverLimit
                  ? "text-red-600 font-semibold"
                  : isNearLimit
                  ? "text-yellow-600 font-semibold"
                  : "text-muted-foreground"
              }
            >
              {screenTimeToday}m / {screenTimeLimit}m
            </span>
          </div>
          <div className="w-full bg-gradient-to-r from-gray-100 to-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ease-out relative ${
                isOverLimit
                  ? "bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/50"
                  : isNearLimit
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/50"
                  : "bg-gradient-to-r from-sky-400 to-sky-600 shadow-lg shadow-sky-500/50"
              } after:absolute after:inset-0 after:bg-gradient-to-r after:from-white/30 after:via-transparent after:to-transparent after:animate-pulse`}
              style={{ width: `${screenTimePercentage}%` }}
            />
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 hover:shadow-md transition-all duration-200">
            <Shield className="h-3 w-3 mr-1 animate-pulse" />
            Protected
          </Badge>
          <Badge variant="outline" className="text-xs bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-200 hover:shadow-md transition-all duration-200">
            <TrendingUp className="h-3 w-3 mr-1" />
            Educational Mode
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
