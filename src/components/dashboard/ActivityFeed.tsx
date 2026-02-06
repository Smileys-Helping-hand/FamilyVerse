"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  UserPlus, 
  Users, 
  Heart, 
  Star, 
  Cake, 
  Medal,
  Sparkles,
  Baby,
  UserCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { getActivityLogAction } from "@/app/actions/family";

interface Activity {
  id: string;
  type: string;
  user: {
    name: string;
    avatar?: string;
  };
  target?: {
    name: string;
  };
  timestamp: Date;
  description: string;
}

const activityIcons: Record<string, React.ElementType> = {
  member_added: UserPlus,
  relationship_added: Heart,
  birthday: Cake,
  milestone: Star,
  achievement: Medal,
  created_family: Users,
  joined_family: UserPlus,
};

const activityColors: Record<string, string> = {
  member_added: 'text-sky-500',
  relationship_added: 'text-pink-500',
  birthday: 'text-yellow-500',
  milestone: 'text-purple-500',
  achievement: 'text-green-500',
  created_family: 'text-purple-500',
  joined_family: 'text-sky-500',
};

const activityBgColors: Record<string, string> = {
  member_added: 'bg-sky-500/10 border-sky-500/20',
  relationship_added: 'bg-pink-500/10 border-pink-500/20',
  birthday: 'bg-yellow-500/10 border-yellow-500/20',
  milestone: 'bg-purple-500/10 border-purple-500/20',
  achievement: 'bg-green-500/10 border-green-500/20',
  created_family: 'bg-purple-500/10 border-purple-500/20',
  joined_family: 'bg-sky-500/10 border-sky-500/20',
};

export function ActivityFeed() {
  const { userProfile } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.familyId) {
      loadActivities();
    }
  }, [userProfile]);

  const loadActivities = async () => {
    if (!userProfile?.familyId) return;
    
    try {
      const logs = await getActivityLogAction(userProfile.familyId, 10);
      setActivities(logs.map(log => ({
        id: log.id.toString(),
        type: log.action,
        user: { name: log.user },
        timestamp: new Date(log.timestamp),
        description: log.details,
      })));
      setLoading(false);
    } catch (error) {
      console.error('Failed to load activities:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (activities.length === 0) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
          <CardDescription>What's happening in your family</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No activity yet. Start adding family members to see activity here!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-xl border-2",
      "bg-gradient-to-br from-card via-card to-accent/5"
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 rounded-xl bg-gradient-to-br from-accent to-primary">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              Recent Activity
            </CardTitle>
            <CardDescription className="mt-1">
              What's happening in your family
            </CardDescription>
          </div>
          <Badge variant="secondary" className="animate-pulse">
            {activities.length} Updates
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {activities.map((activity, index) => {
              const Icon = activityIcons[activity.type] || Sparkles;
              const colorClass = activityColors[activity.type] || 'text-primary';
              const bgClass = activityBgColors[activity.type] || 'bg-primary/10 border-primary/20';
              
              return (
                <div
                  key={activity.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-xl border-2 transition-all duration-300",
                    "hover:shadow-md hover:-translate-y-1 cursor-pointer",
                    bgClass,
                    "animate-in fade-in slide-in-from-bottom-4"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={cn(
                    "p-2 rounded-lg",
                    "bg-white dark:bg-background",
                    "shadow-sm"
                  )}>
                    <Icon className={cn("h-5 w-5", colorClass)} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug">
                      <span className="font-semibold text-foreground">
                        {activity.user.name}
                      </span>
                      {' '}
                      <span className="text-muted-foreground">
                        {activity.description}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <span>•</span>
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </p>
                  </div>

                  {activity.target && (
                    <Avatar className="h-8 w-8 border-2 border-background">
                      <AvatarImage src={activity.target.name} />
                      <AvatarFallback className="text-xs">
                        {activity.target.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
