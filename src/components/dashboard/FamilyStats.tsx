"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, Baby, Crown, Sparkles, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { getFamilyStatsAction } from "@/app/actions/family";

interface Stat {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  trend?: number;
}

export function FamilyStats() {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.familyId) {
      loadStats();
    }
  }, [userProfile]);

  const loadStats = async () => {
    if (!userProfile?.familyId) return;
    
    try {
      const data = await getFamilyStatsAction(userProfile.familyId);
      setStats([
        {
          label: "Total Members",
          value: data.totalMembers,
          icon: Users,
          color: "text-sky-500",
          bgColor: "bg-sky-500/10",
        },
        {
          label: "Generations",
          value: data.generations,
          icon: Crown,
          color: "text-purple-500",
          bgColor: "bg-purple-500/10",
        },
        {
          label: "Relationships",
          value: data.relationships,
          icon: Heart,
          color: "text-pink-500",
          bgColor: "bg-pink-500/10",
        },
        {
          label: "Children",
          value: data.children,
          icon: Baby,
          color: "text-green-500",
          bgColor: "bg-green-500/10",
        },
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className={cn(
              "overflow-hidden transition-all duration-300",
              "hover:shadow-2xl hover:-translate-y-2 border-2",
              "cursor-pointer group",
              "animate-in fade-in slide-in-from-bottom-4"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-6 relative">
              {/* Background decoration */}
              <div className={cn(
                "absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20 transition-opacity",
                stat.bgColor,
                "group-hover:opacity-30"
              )} />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn(
                    "p-2 rounded-xl transition-transform duration-300",
                    "group-hover:scale-110 group-hover:rotate-6",
                    stat.bgColor
                  )}>
                    <Icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                  
                  {stat.trend && (
                    <div className="flex items-center gap-1 text-xs font-semibold text-green-500">
                      <TrendingUp className="h-3 w-3" />
                      +{stat.trend}
                    </div>
                  )}
                </div>
                
                <div className="space-y-1">
                  <p className="text-2xl font-bold tracking-tight group-hover:scale-105 transition-transform inline-block">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
