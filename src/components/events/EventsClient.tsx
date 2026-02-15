'use client';

import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, LayoutGrid, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import EventTemplatesSelector from '@/components/events/EventTemplatesSelector';
import EventCalendarView from '@/components/events/EventCalendarView';
import Link from 'next/link';

interface EventsClientProps {
  events: any[];
  currentUser: {
    uid: string;
    email: string;
    name: string;
    familyId?: string;
  };
  children?: ReactNode;
}

export default function EventsClient({ events, currentUser, children }: EventsClientProps) {
  const [showTemplates, setShowTemplates] = useState(false);
  const [view, setView] = useState<'grid' | 'calendar'>('grid');

  return (
    <div>
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-auto">
            <TabsList>
              <TabsTrigger value="grid" className="gap-2">
                <LayoutGrid className="h-4 w-4" />
                Grid
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                Calendar
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setShowTemplates(true)} 
            variant="outline"
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Quick Create
          </Button>
          <Link href="/events/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      {view === 'grid' ? (
        <div>{children}</div>
      ) : (
        <EventCalendarView events={events} />
      )}

      {/* Templates Dialog */}
      <EventTemplatesSelector
        familyId={currentUser.familyId}
        currentUser={currentUser}
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
      />
    </div>
  );
}
