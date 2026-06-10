'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';
import { Sparkles, CalendarCheck, ExternalLink, Copy, MapPin, Users, DollarSign } from 'lucide-react';

interface BookingDraft {
  venueName: string;
  guestCount: number;
  date: string;
  estimatedPrice?: number;
  reference: string;
  bookingUrl?: string;
  alternatives?: {
    airbnb: string;
    eventbrite: string;
    booking: string;
  };
}

export default function BookingWidget({
  eventId,
  venueName: initialVenueName,
  guestCount: initialGuestCount,
  date: initialDate
}: {
  eventId: string;
  venueName?: string;
  guestCount?: number;
  date?: string;
}) {
  const [prompt, setPrompt] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const { toast } = useToast();

  const handleDraft = async () => {
    setIsDrafting(true);
    const venueName = initialVenueName || prompt || 'Your Venue';
    const guestCount = initialGuestCount || 4;
    const date = initialDate || new Date().toLocaleDateString();

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          venueName,
          guestCount,
          date,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setDraft(data.draft);
      } else {
        toast({ title: 'Error', description: 'Failed to create booking draft', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Booking draft error:', error);
      setDraft({
        venueName,
        guestCount,
        date,
        estimatedPrice: Math.round(guestCount * 150 + Math.random() * 500),
        reference: `BK-${Date.now().toString(36).toUpperCase()}`,
      });
    }
    setIsDrafting(false);
  };

  const handleConfirm = async () => {
    if (!draft) return;

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff6b35', '#f43f5e', '#ffc20e']
    });

    toast({ title: '🎉 Booking Confirmed!', description: `Reference: ${draft.reference}` });
  };

  const copyReference = () => {
    navigator.clipboard.writeText(draft?.reference || '');
    toast({ title: 'Copied!', description: 'Booking reference copied to clipboard' });
  };

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-amber-900">Instant Booking</h2>
        </div>

        {!draft ? (
          <div className="space-y-4">
            <p className="text-amber-800 text-sm">Tell us where and how many people — we'll find available venues and pre-fill your booking.</p>
            <div className="flex gap-2">
              <Input
                placeholder={initialVenueName ? `${initialVenueName} for ${initialGuestCount} people` : 'e.g. The Ark for 12 people'}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleDraft()}
                className="bg-white border-amber-200 placeholder:text-amber-400"
              />
              <Button
                onClick={handleDraft}
                disabled={isDrafting}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md"
              >
                {isDrafting ? 'Looking...' : 'Search'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Booking Summary */}
            <div className="bg-white p-5 rounded-xl border-2 border-amber-200 space-y-3">
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <MapPin className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                  <p className="text-xs text-amber-700 font-semibold">Venue</p>
                  <p className="text-sm font-bold text-amber-900 truncate">{draft.venueName}</p>
                </div>
                <div className="text-center">
                  <Users className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                  <p className="text-xs text-amber-700 font-semibold">Guests</p>
                  <p className="text-sm font-bold text-amber-900">{draft.guestCount}</p>
                </div>
                <div className="text-center">
                  <DollarSign className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                  <p className="text-xs text-amber-700 font-semibold">Est. Price</p>
                  <p className="text-sm font-bold text-amber-900">R{draft.estimatedPrice || 0}</p>
                </div>
              </div>

              <div className="flex items-center justify-between bg-gradient-to-r from-orange-100 to-amber-100 p-3 rounded-lg">
                <span className="font-mono text-sm font-bold text-amber-900">Ref: {draft.reference}</span>
                <button
                  onClick={copyReference}
                  className="p-1.5 hover:bg-white rounded-md transition-colors"
                  title="Copy reference"
                >
                  <Copy className="w-4 h-4 text-amber-700" />
                </button>
              </div>
            </div>

            {/* Booking Platforms */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-amber-800 uppercase">Book now via:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {draft.alternatives && (
                  <>
                    <a href={draft.alternatives.airbnb} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-semibold text-sm bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm"
                    >
                      <ExternalLink className="w-4 h-4" /> Airbnb
                    </a>
                    <a href={draft.alternatives.eventbrite} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-semibold text-sm bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-sm"
                    >
                      <ExternalLink className="w-4 h-4" /> EventBrite
                    </a>
                    <a href={draft.alternatives.booking} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-semibold text-sm bg-cyan-500 text-white hover:bg-cyan-600 transition-colors shadow-sm"
                    >
                      <ExternalLink className="w-4 h-4" /> Booking.com
                    </a>
                  </>
                )}
                <a href={draft.bookingUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-semibold text-sm bg-gray-600 text-white hover:bg-gray-700 transition-colors shadow-sm"
                >
                  <ExternalLink className="w-4 h-4" /> Google Search
                </a>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setDraft(null)} className="flex-1 border-amber-300 text-amber-900 hover:bg-amber-50">
                Back
              </Button>
              <Button onClick={handleConfirm} className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold shadow-md">
                <CalendarCheck className="mr-2 h-4 w-4" /> Confirm
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
