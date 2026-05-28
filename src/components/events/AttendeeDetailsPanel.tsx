'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Check, Clock, X, Download } from 'lucide-react';
import type { EventAttendee } from '@/lib/db/schema';

interface AttendeeDetailsPanelProps {
  eventId: string;
  attendees?: EventAttendee[];
}

export function AttendeeDetailsPanel({ eventId, attendees = [] }: AttendeeDetailsPanelProps) {
  const [filter, setFilter] = useState<'ALL' | 'GOING' | 'MAYBE' | 'PENDING' | 'CANT_MAKE_IT'>(
    'ALL'
  );

  const going = attendees.filter((a) => a.rsvpStatus === 'GOING');
  const maybe = attendees.filter((a) => a.rsvpStatus === 'MAYBE');
  const pending = attendees.filter((a) => a.rsvpStatus === 'PENDING');
  const cantMake = attendees.filter((a) => a.rsvpStatus === 'CANT_MAKE_IT');

  const totalPlusOnes = attendees.reduce((sum, a) => sum + (a.plusOnes || 0), 0);
  const dietaryNotes = attendees.filter((a) => a.dietaryNotes);
  const needsTransport = attendees.filter((a) => a.needsTransport);

  const filtered =
    filter === 'ALL'
      ? attendees
      : attendees.filter((a) => a.rsvpStatus === filter);

  const handleExportCsv = () => {
    const csv = [
      ['Name', 'RSVP Status', 'Plus Ones', 'Dietary Notes', 'Needs Transport', 'Special Needs'],
      ...attendees.map((a) => [
        a.userName,
        a.rsvpStatus,
        a.plusOnes || 0,
        a.dietaryNotes || '',
        a.needsTransport ? 'Yes' : 'No',
        a.specialNeeds || '',
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-${eventId}-attendees.csv`;
    a.click();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users size={20} />
          Attendees ({attendees.length})
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-2xl font-bold text-green-700">{going.length}</p>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <Check size={14} /> Going
            </p>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-2xl font-bold text-yellow-700">{maybe.length}</p>
            <p className="text-xs text-yellow-600 flex items-center gap-1">
              <Clock size={14} /> Maybe
            </p>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-2xl font-bold text-blue-700">{pending.length}</p>
            <p className="text-xs text-blue-600 flex items-center gap-1">
              <Clock size={14} /> Pending
            </p>
          </div>

          <div className="bg-red-50 p-3 rounded-lg">
            <p className="text-2xl font-bold text-red-700">{cantMake.length}</p>
            <p className="text-xs text-red-600 flex items-center gap-1">
              <X size={14} /> Can't Make
            </p>
          </div>
        </div>

        {/* Extra Details */}
        {(totalPlusOnes > 0 || dietaryNotes.length > 0 || needsTransport.length > 0) && (
          <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
            {totalPlusOnes > 0 && (
              <p className="text-gray-700">
                <strong>Plus Ones:</strong> {totalPlusOnes} additional guests
              </p>
            )}
            {dietaryNotes.length > 0 && (
              <p className="text-gray-700">
                <strong>Dietary Restrictions:</strong> {dietaryNotes.length} attendees
              </p>
            )}
            {needsTransport.length > 0 && (
              <p className="text-gray-700">
                <strong>Transport Needed:</strong> {needsTransport.length} attendees
              </p>
            )}
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'GOING', 'MAYBE', 'PENDING', 'CANT_MAKE_IT'] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
              className="text-xs"
            >
              {status}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={handleExportCsv} className="text-xs ml-auto gap-1">
            <Download size={14} />
            Export
          </Button>
        </div>

        {/* Attendee List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No attendees in this category</p>
          ) : (
            filtered.map((attendee) => (
              <div
                key={attendee.id}
                className="flex items-start justify-between p-3 bg-white border border-gray-100 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{attendee.userName}</p>
                  {attendee.dietaryNotes && (
                    <p className="text-xs text-gray-500">🍽️ {attendee.dietaryNotes}</p>
                  )}
                  {attendee.specialNeeds && (
                    <p className="text-xs text-gray-500">♿ {attendee.specialNeeds}</p>
                  )}
                </div>

                <div className="text-right text-xs">
                  <div
                    className={`px-2 py-1 rounded font-medium ${
                      attendee.rsvpStatus === 'GOING'
                        ? 'bg-green-100 text-green-700'
                        : attendee.rsvpStatus === 'MAYBE'
                          ? 'bg-yellow-100 text-yellow-700'
                          : attendee.rsvpStatus === 'PENDING'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {attendee.rsvpStatus}
                  </div>
                  {(attendee.plusOnes || 0) > 0 && (
                    <p className="text-gray-500 mt-1">+{attendee.plusOnes} guests</p>
                  )}
                  {attendee.needsTransport && (
                    <p className="text-blue-600 mt-1 font-medium">🚗 Transport</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
