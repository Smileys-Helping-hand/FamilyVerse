'use client';

import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, LayoutGrid, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
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
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={() => setShowTemplates(true)} 
              variant="outline"
              className="gap-2 glass-card"
            >
              <Sparkles className="h-4 w-4" />
              Quick Create
            </Button>
          </motion.div>
          <Link href="/events/create">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button className="gap-2 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-lg shadow-orange-500/20 border-0">
                <Plus className="h-4 w-4" />
                New Event
              </Button>
            </motion.div>
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
