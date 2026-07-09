'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import BirthdayExperiencePlanner from '@/components/events/BirthdayExperiencePlanner';
import { Loader } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: string;
  location: { lat: number; lng: number; address: string };
  budget?: number;
}

export default function BirthdayPlannerPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production: fetch event from database
    // For now, mock data
    setEvent({
      id: eventId,
      title: "Fiancée's Birthday Celebration",
      date: new Date(new Date().getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      location: {
        lat: -33.9249,
        lng: 18.4241,
        address: 'Cape Town, South Africa',
      },
      budget: 2500, // R2500
    });
    setLoading(false);
  }, [eventId]);

  if (loading || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFFBF6] to-[#FFF5ED]">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-[#FF6B35] mx-auto mb-4" />
          <p className="text-lg text-gray-700">Loading your celebration planner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFBF6] to-[#FFF5ED]">
      <BirthdayExperiencePlanner
        eventId={event.id}
        eventDate={event.date}
        location={event.location}
        budget={event.budget}
      />
    </div>
  );
}
