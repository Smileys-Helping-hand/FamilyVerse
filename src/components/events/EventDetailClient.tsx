'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  MessageSquare,
  Radio,
  Cloud,
  ThermometerSun,
  Droplets,
  Navigation,
  Check,
  X,
  Clock,
  Link2,
  Clipboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { rsvpToEvent } from '@/app/actions/events';
import { createMagicLink } from '@/actions/magic-link';
import { useToast } from '@/hooks/use-toast';
import { ExpenseTab } from './ExpenseTab';
import { PollsTab } from './PollsTab';
import SupplyChainTab from './SupplyChainTab';
import GuardianTab from './GuardianTab';
import MenuTab from './MenuTab';
import GalleryTab from './GalleryTab';
import EventChatTab from './EventChatTab';
import BookingWidget from './BookingWidget';
import MosWordsBoard from './MosWordsBoard';
import { getPusherClient } from '@/lib/pusher/client';

interface EventDetailClientProps {
  event: any;
  attendees: any[];
  waypoints: any[];
  weather: any;
  currentUser: {
    uid: string;
    email: string;
    name: string;
  };
}

const weatherCodeToEmoji: Record<number, string> = {
  0: '☀️', // Clear sky
  1: '🌤️', // Mainly clear
  2: '⛅', // Partly cloudy
  3: '☁️', // Overcast
  45: '🌫️', // Fog
  48: '🌫️', // Depositing rime fog
  51: '🌦️', // Light drizzle
  61: '🌧️', // Slight rain
  71: '🌨️', // Slight snow
  95: '⛈️', // Thunderstorm
};

export default function EventDetailClient({
  event,
  attendees: initialAttendees,
  waypoints,
  weather,
  currentUser,
}: EventDetailClientProps) {
  const [attendees, setAttendees] = useState(initialAttendees);
  const [userRsvp, setUserRsvp] = useState(
    initialAttendees.find(a => a.userId === currentUser.uid)?.rsvpStatus || 'PENDING'
  );
  const { toast } = useToast();
  const router = useRouter();

  // Subscribe to Pusher updates
  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`event-${event.id}`);

    channel.bind('rsvp-update', (data: any) => {
      setAttendees(prev => {
        const existing = prev.find(a => a.userId === data.userId);
        if (existing) {
          return prev.map(a =>
            a.userId === data.userId ? { ...a, rsvpStatus: data.status } : a
          );
        } else {
          return [...prev, { userId: data.userId, userName: data.userName, rsvpStatus: data.status }];
        }
      });
    });

    channel.bind('status-update', (data: any) => {
      toast({
        title: 'Event Status Updated',
        description: `Event is now ${data.status}`,
      });
      router.refresh();
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [event.id, toast, router]);

  const handleRsvp = async (status: 'GOING' | 'MAYBE' | 'CANT_MAKE_IT') => {
    const result = await rsvpToEvent({
      eventId: event.id,
      userId: currentUser.uid,
      userName: currentUser.name,
      rsvpStatus: status,
    });

    if (result.success) {
      setUserRsvp(status);
      toast({
        title: 'RSVP Updated',
        description: `You've marked yourself as "${status}"`,
      });
      router.refresh();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to update RSVP',
        variant: 'destructive',
      });
    }
  };

  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [generatingInvite, setGeneratingInvite] = useState(false);

  const handleGenerateInvite = async () => {
    setGeneratingInvite(true);
    try {
      const url = await createMagicLink({ eventId: event.id, invitedByUserId: currentUser.uid });
      setInviteLink(url);
      await navigator.clipboard.writeText(url);
      toast({ title: 'Invite link copied!', description: 'Share it with your guest.' });
    } catch {
      toast({ title: 'Error', description: 'Could not generate invite link.', variant: 'destructive' });
    } finally {
      setGeneratingInvite(false);
    }
  };

  const goingCount = attendees.filter(a => a.rsvpStatus === 'GOING').length;
  const maybeCount = attendees.filter(a => a.rsvpStatus === 'MAYBE').length;

  const statusColors = {
    UPCOMING: 'bg-blue-500',
    LIVE: 'bg-red-500',
    PAST: 'bg-gray-500',
  };

  const weatherEmoji = weather ? weatherCodeToEmoji[weather.weatherCode] || '🌤️' : '🌤️';

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-80 overflow-hidden">
        {event.heroImageUrl ? (
          <img
            src={event.heroImageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600" />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="container mx-auto max-w-6xl">
            <Badge className={`${statusColors[event.status as keyof typeof statusColors]} mb-4`}>
              {event.status}
            </Badge>
            <h1 className="text-5xl font-bold mb-2">{event.title}</h1>
            <p className="text-xl opacity-90">{event.description}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Quick Info Bar */}
        <Card className="glass-card mb-8 border-none">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="font-semibold">{format(new Date(event.startTime), 'PPP')}</p>
                  <p className="text-sm">{format(new Date(event.startTime), 'p')}</p>
                </div>
              </div>

              {event.locationName && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-semibold">{event.locationName}</p>
                    {event.coordinates && (
                      <Link
                        href={`/events/${event.id}/map`}
                        className="text-sm text-blue-500 hover:underline"
                      >
                        View on map →
                      </Link>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Attendees</p>
                  <p className="font-semibold">{goingCount} Going</p>
                  <p className="text-sm text-muted-foreground">{maybeCount} Maybe</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RSVP Section */}
        <Card className="glass-card mb-8 border-none">
          <CardHeader>
            <CardTitle>Are you going?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={userRsvp === 'GOING' ? 'default' : 'outline'}
                onClick={() => handleRsvp('GOING')}
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                I'm Going
              </Button>
              <Button
                variant={userRsvp === 'MAYBE' ? 'default' : 'outline'}
                onClick={() => handleRsvp('MAYBE')}
                className="gap-2"
              >
                <Clock className="h-4 w-4" />
                Maybe
              </Button>
              <Button
                variant={userRsvp === 'CANT_MAKE_IT' ? 'destructive' : 'outline'}
                onClick={() => handleRsvp('CANT_MAKE_IT')}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Can't Make It
              </Button>
            </div>

            {/* Invite guest link — creator only */}
            {currentUser.uid === event.creatorId && (
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <p className="text-xs text-zinc-500 mb-2 flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5" />
                  Invite guests without an account
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-[#00FF66]/40 text-[#00FF66] hover:bg-[#00FF66]/10"
                    onClick={handleGenerateInvite}
                    disabled={generatingInvite}
                  >
                    <Link2 className="h-4 w-4" />
                    {generatingInvite ? 'Generating…' : 'Generate Invite Link'}
                  </Button>
                  {inviteLink && (
                    <button
                      type="button"
                      className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-100 transition-colors"
                      onClick={() => { navigator.clipboard.writeText(inviteLink); toast({ title: 'Copied!' }); }}
                    >
                      <Clipboard className="h-3.5 w-3.5" />
                      Copy again
                    </button>
                  )}
                </div>
                {inviteLink && (
                  <p className="mt-2 text-xs text-zinc-500 font-mono break-all bg-zinc-900 rounded px-2 py-1.5">{inviteLink}</p>
                )}
              </div>
            )}

            {/* Attendees List */}
            <div className="mt-6">
              <p className="text-sm font-medium mb-3">Who's Coming:</p>
              <div className="flex flex-wrap gap-2">
                {attendees
                  .filter(a => a.rsvpStatus === 'GOING')
                  .map(attendee => (
                    <div
                      key={attendee.userId}
                      className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-full"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>{attendee.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{attendee.userName}</span>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weather Widget */}
        {weather && (
          <Card className="glass-card mb-8 border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Weather Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="text-6xl">{weatherEmoji}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <ThermometerSun className="h-5 w-5 text-orange-500" />
                      <span className="text-2xl font-bold">{Math.round(weather.tempMax)}°C</span>
                      <span className="text-muted-foreground">/ {Math.round(weather.tempMin)}°C</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="h-5 w-5 text-blue-500" />
                      <span>{weather.precipitation}mm</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="itinerary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 lg:grid-cols-11">
            <TabsTrigger value="itinerary">📋 Plan</TabsTrigger>
            <TabsTrigger value="booking">⚡ Booking</TabsTrigger>
            <TabsTrigger value="moswords">🔥 Slang</TabsTrigger>
            <TabsTrigger value="map">📍 Radar</TabsTrigger>
            <TabsTrigger value="supplies">🛒 Supplies</TabsTrigger>
            <TabsTrigger value="expenses">💰 Kitty</TabsTrigger>
            <TabsTrigger value="guardian">👶 Guardian</TabsTrigger>
            <TabsTrigger value="menu">🍽️ Menu</TabsTrigger>
            <TabsTrigger value="gallery">📸 Gallery</TabsTrigger>
            <TabsTrigger value="polls">🗳️ Polls</TabsTrigger>
            <TabsTrigger value="chat">💬 Chat</TabsTrigger>
          </TabsList>

          {/* Itinerary Tab */}
          <TabsContent value="itinerary">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle>Event Timeline</CardTitle>
                <CardDescription>The plan for the day</CardDescription>
              </CardHeader>
              <CardContent>
                {waypoints.length > 0 ? (
                  <div className="space-y-4">
                    {waypoints.map((waypoint, index) => (
                      <div key={waypoint.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          {index < waypoints.length - 1 && (
                            <div className="w-0.5 h-full bg-border mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <p className="font-semibold text-lg">{waypoint.time}</p>
                          <p className="font-medium mt-1">{waypoint.title}</p>
                          {waypoint.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {waypoint.description}
                            </p>
                          )}
                          {waypoint.location && (
                            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{waypoint.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No itinerary yet. The organizer will add waypoints soon!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Family Radar
                </CardTitle>
                <CardDescription>See where everyone is in real-time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Link href={`/events/${event.id}/map`}>
                    <Button size="lg" className="gap-2">
                      <MapPin className="h-5 w-5" />
                      Open Live Map
                    </Button>
                  </Link>
                  <p className="text-sm text-muted-foreground mt-4">
                    Track everyone's location during the event
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Supplies Tab */}
          <TabsContent value="supplies">
            <SupplyChainTab eventId={event.id} />
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses">
            <ExpenseTab eventId={event.id} currentUser={currentUser} />
          </TabsContent>

          {/* Guardian Eye Tab */}
          <TabsContent value="guardian">
            <GuardianTab eventId={event.id} />
          </TabsContent>

          {/* Menu Tab */}
          <TabsContent value="menu">
            <MenuTab eventId={event.id} />
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            <GalleryTab eventId={event.id} />
          </TabsContent>

          {/* Polls Tab */}
          <TabsContent value="polls">
            <PollsTab eventId={event.id} currentUser={currentUser} />
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <EventChatTab eventId={event.id} />
          </TabsContent>

          {/* Booking Tab */}
          <TabsContent value="booking">
            <BookingWidget eventId={event.id} />
          </TabsContent>

          {/* MosWords Tab */}
          <TabsContent value="moswords">
            <MosWordsBoard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
