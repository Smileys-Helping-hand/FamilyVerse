'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  MapPin,
  Users,
  Clock
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  startTime: Date;
  endTime?: Date;
  locationName?: string;
  status: string;
  categoryId?: string;
}

interface EventCalendarViewProps {
  events: Event[];
}

export default function EventCalendarView({ events }: EventCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getEventsForDay = (day: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.startTime), day)
    );
  };

  const statusColors: Record<string, string> = {
    UPCOMING: 'bg-blue-500',
    LIVE: 'bg-red-500',
    PAST: 'bg-gray-400',
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                {format(currentDate, 'MMMM yyyy')}
              </CardTitle>
              <CardDescription>
                {events.length} event{events.length !== 1 ? 's' : ''} this month
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={previousMonth} variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                onClick={() => setCurrentDate(new Date())} 
                variant="outline"
              >
                Today
              </Button>
              <Button onClick={nextMonth} variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isDayToday = isToday(day);

              return (
                <div
                  key={day.toString()}
                  className={cn(
                    'min-h-[100px] p-2 border rounded-lg transition-colors',
                    !isCurrentMonth && 'bg-muted/30 text-muted-foreground',
                    isDayToday && 'border-primary border-2',
                    isCurrentMonth && 'hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isDayToday && 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center'
                      )}
                    >
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                      <Badge variant="secondary" className="text-xs h-5">
                        {dayEvents.length}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <Link key={event.id} href={`/events/${event.id}`}>
                        <div className="group cursor-pointer">
                          <div
                            className={cn(
                              'text-xs p-1 rounded truncate',
                              statusColors[event.status],
                              'text-white hover:opacity-80 transition-opacity'
                            )}
                            title={event.title}
                          >
                            {format(new Date(event.startTime), 'h:mm a')} {event.title}
                          </div>
                        </div>
                      </Link>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-muted-foreground pl-1">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events List */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events This Month</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No events scheduled for this month
            </p>
          ) : (
            <div className="space-y-3">
              {events
                .filter(event => event.status === 'UPCOMING')
                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .map((event) => (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex flex-col items-center justify-center bg-primary text-primary-foreground rounded-lg p-3 min-w-[60px]">
                        <div className="text-2xl font-bold">
                          {format(new Date(event.startTime), 'd')}
                        </div>
                        <div className="text-xs">
                          {format(new Date(event.startTime), 'MMM')}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold mb-1">{event.title}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {format(new Date(event.startTime), 'h:mm a')}
                            {event.endTime && ` - ${format(new Date(event.endTime), 'h:mm a')}`}
                          </div>
                          {event.locationName && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.locationName}
                            </div>
                          )}
                        </div>
                      </div>

                      <Badge className={statusColors[event.status]}>
                        {event.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
