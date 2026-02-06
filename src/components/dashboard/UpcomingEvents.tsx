"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Cake, Heart, PartyPopper, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow, isSameDay, addDays } from "date-fns";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUpcomingEventsAction } from "@/app/actions/family";

interface Event {
  id: string;
  type: 'birthday' | 'anniversary' | 'milestone' | 'celebration';
  title: string;
  person: string;
  date: Date;
  daysUntil: number;
}

const eventIcons = {
  birthday: Cake,
  anniversary: Heart,
  milestone: PartyPopper,
  celebration: Gift,
};

const eventColors = {
  birthday: 'from-pink-500 to-rose-500',
  anniversary: 'from-red-500 to-pink-600',
  milestone: 'from-purple-500 to-indigo-600',
  celebration: 'from-yellow-500 to-orange-600',
};

const eventBadgeColors = {
  birthday: 'bg-pink-100 text-pink-700 border-pink-300',
  anniversary: 'bg-red-100 text-red-700 border-red-300',
  milestone: 'bg-purple-100 text-purple-700 border-purple-300',
  celebration: 'bg-yellow-100 text-yellow-700 border-yellow-300',
};

export function UpcomingEvents() {
  const { userProfile } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.familyId) {
      loadEvents();
    }
  }, [userProfile]);

  const loadEvents = async () => {
    if (!userProfile?.familyId) return;
    
    try {
      const data = await getUpcomingEventsAction(userProfile.familyId);
      setEvents(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load events:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (events.length === 0) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Events
          </CardTitle>
          <CardDescription>Important dates to remember</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No upcoming events. Add birth dates to family members to see birthdays here!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-xl border-2",
      "bg-gradient-to-br from-card via-card to-secondary/5"
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 rounded-xl bg-gradient-to-br from-secondary to-accent">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              Upcoming Events
            </CardTitle>
            <CardDescription className="mt-1">
              Important dates to remember
            </CardDescription>
          </div>
          <Badge variant="secondary" className="animate-pulse">
            {events.length} Events
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No upcoming events</p>
              </div>
            ) : (
              events.map((event, index) => {
                const Icon = eventIcons[event.type];
                const colorClass = eventColors[event.type];
                const badgeClass = eventBadgeColors[event.type];
                
                return (
                  <div
                    key={event.id}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all duration-300",
                      "hover:shadow-md hover:-translate-y-1 cursor-pointer",
                      "bg-gradient-to-br from-card to-muted/20",
                      "group relative overflow-hidden",
                      "animate-in fade-in slide-in-from-bottom-4"
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Gradient background on hover */}
                    <div 
                      className={cn(
                        "absolute inset-0 opacity-0 group-hover:opacity-10",
                        "transition-opacity duration-300",
                        `bg-gradient-to-br ${colorClass}`
                      )}
                    />
                    
                    <div className="relative flex items-start gap-3">
                      <div className={cn(
                        "p-2.5 rounded-lg shadow-md transition-transform duration-300",
                        "group-hover:scale-110 group-hover:rotate-6",
                        `bg-gradient-to-br ${colorClass}`
                      )}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <p className="font-semibold text-sm leading-tight">
                              {event.person}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {event.title}
                            </p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs font-semibold shrink-0",
                              badgeClass,
                              "border-2"
                            )}
                          >
                            {event.daysUntil === 0 ? 'Today!' : 
                             event.daysUntil === 1 ? 'Tomorrow' :
                             `${event.daysUntil} days`}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                          <Calendar className="h-3 w-3" />
                          {format(event.date, 'EEEE, MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
